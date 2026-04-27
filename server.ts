import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import axios from "axios";
import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://752675:Aa752675@cluster0.simmm5o.mongodb.net/myapp?retryWrites=true&w=majority";
const client = new MongoClient(MONGODB_URI);
let db: any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("myapp");
  }
  return db;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  await connectDB();

  const col = async (name: string) => {
    const database = await connectDB();
    return database.collection(name);
  };

  app.get("/api/authors", async (req, res) => {
    const data = await col("authors");
    const list = await data.find().toArray();
    res.json(list);
  });

  app.get("/api/authors/:id", async (req, res) => {
    const data = await col("authors");
    const item = await data.findOne({ id: req.params.id });
    if (item) res.json(item);
    else res.status(404).json({ error: "Author not found" });
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname, referrerId } = req.body;
    const users = await col("users");
    const exists = await users.findOne({ username });
    if (exists) return res.status(400).json({ error: "用户名已存在" });

    const newUser = {
      id: "u" + Date.now(),
      username,
      password,
      nickname,
      referrerId: referrerId || null,
      balance: 0.0,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      createdAt: new Date().toISOString(),
      purchased: [],
      following: [],
    };
    await users.insertOne(newUser);
    res.json({ message: "注册成功" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const users = await col("users");
    const user = await users.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "用户名或密码错误" });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/wechat-login", async (req, res) => {
    const { code, nickname, avatar, referrer } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const users = await col("users");
    const wechatOpenId = "wx_" + code.substring(0, 10);
    let user = await users.findOne({ wechatOpenId });

    if (!user) {
      user = {
        id: "u" + Date.now(),
        username: "wx_" + Date.now(),
        nickname: nickname || ("微信用户_" + Math.floor(Math.random() * 1000)),
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        referrer: referrer || null,
        balance: 0.0,
        wechatOpenId,
        purchased: [],
        following: [],
      };
      await users.insertOne(user);
    } else {
      const update: any = {};
      if (nickname) update.nickname = nickname;
      if (avatar) update.avatar = avatar;
      await users.updateOne({ wechatOpenId }, { $set: update });
      user = await users.findOne({ wechatOpenId });
    }
    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: "已退出登录" });
  });

  app.get("/api/predictions", async (req, res) => {
    const data = await col("predictions");
    const list = await data.find().toArray();
    res.json(list);
  });

  app.get("/api/history", async (req, res) => {
    const data = await col("history");
    const list = await data.find().toArray();
    res.json(list);
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const data = await col("predictions");
    const item = await data.findOne({ id: req.params.id });
    if (item) res.json(item);
    else res.status(404).json({ error: "Prediction not found" });
  });

  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const users = await col("users");
    const user = await users.findOne({ id: userId as string });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...userWithoutPassword } = user;
    let referrerNickname = "无";
    if (user.referrerId) {
      const referrer = await users.findOne({ id: user.referrerId });
      if (referrer) referrerNickname = referrer.nickname || referrer.username;
    }
    res.json({ ...userWithoutPassword, referrerNickname });
  });

  app.get("/api/messages", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const messagesCol = await col("messages");

    let messages = await messagesCol
      .find({ $or: [{ userId }, { userId: "all" }] })
      .sort({ time: -1 })
      .toArray();

    if (messages.length === 0) {
      const seed = [
        {
          id: "mseed1",
          userId: "all",
          type: "system",
          title: "关于账号安全的温馨提示",
          content: "请妥善保管密码，定期更换。",
          time: new Date().toISOString(),
        },
        {
          id: "mseed2",
          userId: "all",
          type: "activity",
          title: "新手礼包上线",
          content: "充值满100送20金币！",
          time: new Date().toISOString(),
        },
      ];
      await messagesCol.insertMany(seed);
      messages = seed;
    }
    res.json(messages);
  });

  app.post("/api/admin/messages", async (req, res) => {
    const msg = {
      id: "m" + Date.now(),
      time: new Date().toISOString(),
      ...req.body,
    };
    const messages = await col("messages");
    await messages.insertOne(msg);
    res.json(msg);
  });

  app.delete("/api/admin/messages/:id", async (req, res) => {
    const messages = await col("messages");
    await messages.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/settings", async (req, res) => {
    const settingsCol = await col("settings");
    let settings = await settingsCol.findOne();
    if (!settings) {
      settings = {
        siteName: "智汇畅享",
        announcement: "欢迎来到智汇畅享平台",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7,
        inviteCommissionRate: 0.1,
      };
      await settingsCol.insertOne(settings);
    }
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    const settingsCol = await col("settings");
    await settingsCol.updateOne({}, { $set: req.body }, { upsert: true });
    res.json({ message: "Settings updated", ...req.body });
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const users = await col("users");
    const user = await users.findOne({ id: userId as string });
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following || [];
    const index = following.indexOf(id);
    let isFollowing = false;

    if (index === -1) {
      following.push(id);
      isFollowing = true;
    } else {
      following.splice(index, 1);
      isFollowing = false;
    }

    await users.updateOne({ id: userId as string }, { $set: { following } });
    res.json({ isFollowing });
  });

  app.post("/api/pay/create", async (req, res) => {
    const { amount, type, orderName, userId } = req.body;
    const pid = process.env.YIPAY_PID || "1000";
    const key = process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";
    const apiUrl = (process.env.YIPAY_API_URL || "http://yzf.dypm.top/").replace(/\/$/, "");
    const outTradeNo = Date.now().toString() + Math.floor(Math.random() * 1000);
    const notifyUrl = `https://${req.get("host")}/api/pay/notify`;
    const returnUrl = `https://${req.get("host")}/top-up?status=success`;
    const clientip = (req.headers["x-forwarded-for"] || req.ip || "127.0.0.1").split(",")[0].replace("::ffff:", "");

    const params = {
      pid,
      type: type || "alipay",
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderName || "金币充值",
      money: parseFloat(amount).toFixed(2),
      clientip,
      device: "mobile",
      sign_type: "MD5",
    };

    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys.filter(k => k !== "sign" && k !== "sign_type" && params[k] !== "").map(k => `${k}=${params[k]}`).join("&");
    const sign = CryptoJS.MD5(str + key).toString().toLowerCase();
    params.sign = sign;

    try {
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.data.code === 1) {
        const order = {
          out_trade_no: outTradeNo,
          userId: userId || "u1",
          amount: parseFloat(amount),
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        const orders = await col("orders");
        await orders.insertOne(order);
      }
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "支付请求失败" });
    }
  });

  app.get("/api/pay/notify", async (req, res) => {
    const { out_trade_no, trade_status } = req.query;
    if (trade_status === "TRADE_SUCCESS") {
      const orders = await col("orders");
      const order = await orders.findOne({ out_trade_no });
      if (order && order.status === "pending") {
        await orders.updateOne({ out_trade_no }, { $set: { status: "completed" } });
        const users = await col("users");
        await users.updateOne({ id: order.userId }, { $inc: { balance: order.amount } });

        const tran = {
          id: "t" + Date.now(),
          userId: order.userId,
          type: "recharge",
          amount: order.amount,
          description: "在线充值",
          time: new Date().toISOString(),
        };
        const trans = await col("transactions");
        await trans.insertOne(tran);
      }
    }
    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const trans = await col("transactions");
    const list = await trans.find({ userId }).sort({ time: -1 }).toArray();
    res.json(list);
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const users = await col("users");
    const user = await users.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance < amount) return res.status(400).json({ error: "余额不足" });

    await users.updateOne({ id: userId }, { $inc: { balance: -amount } });
    const wd = {
      id: "w" + Date.now(),
      userId: user.id,
      amount,
      account,
      name,
      type,
      status: "pending",
      time: new Date().toISOString(),
    };
    const withdrawals = await col("withdrawals");
    await withdrawals.insertOne(wd);

    const tran = {
      id: "t" + Date.now(),
      userId: user.id,
      type: "withdraw",
      amount: -amount,
      description: "申请提现",
      time: new Date().toISOString(),
    };
    const trans = await col("transactions");
    await trans.insertOne(tran);

    res.json({ message: "提现申请已提交" });
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const settings = await col("settings");
    const config = await settings.findOne() || { authorCommissionRate: 0.7, inviteCommissionRate: 0.1 };

    const users = await col("users");
    const user = await users.findOne({ id: userId });
    const predictions = await col("predictions");
    const pred = await predictions.findOne({ id: predictionId });

    if (!user || !pred) return res.status(404).json({ error: "数据不存在" });
    if (!pred.price || pred.price <= 0) return res.json({ message: "免费内容" });
    if (user.balance < pred.price) return res.status(400).json({ error: "余额不足" });

    const purchased = user.purchased || [];
    if (purchased.includes(predictionId)) return res.json({ message: "已购买" });

    await users.updateOne(
      { id: userId },
      {
        $inc: { balance: -pred.price },
        $set: { purchased: [...purchased, predictionId] },
      }
    );

    if (pred.authorId) {
      const authors = await col("authors");
      const author = await authors.findOne({ id: pred.authorId });
      if (author?.userId) {
        const authorUser = await users.findOne({ id: author.userId });
        if (authorUser) {
          const earn = pred.price * config.authorCommissionRate;
          await users.updateOne({ id: authorUser.id }, { $inc: { balance: earn } });
        }
      }
    }

    if (user.referrerId) {
      const refUser = await users.findOne({ id: user.referrerId });
      if (refUser) {
        const reward = pred.price * config.inviteCommissionRate;
        await users.updateOne({ id: refUser.id }, { $inc: { balance: reward } });
      }
    }

    const tran = {
      id: "t" + Date.now(),
      userId: user.id,
      type: "purchase",
      amount: -pred.price,
      description: `购买: ${pred.contentTitle || "内容"}`,
      time: new Date().toISOString(),
    };
    const trans = await col("transactions");
    await trans.insertOne(tran);

    res.json({ message: "购买成功" });
  });

  app.get("/api/invited-friends", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const users = await col("users");
    const friends = await users.find({ referrerId: userId as string }).toArray();
    res.json(friends.map(u => {
      const { password, ...rest } = u;
      return rest;
    }));
  });

  app.put("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const users = await col("users");
    await users.updateOne({ id: userId as string }, { $set: req.body });
    const user = await users.findOne({ id: userId as string });
    const { password, ...rest } = user;
    res.json(rest);
  });

  app.post("/api/admin/authors", async (req, res) => {
    const author = { ...req.body, id: "a" + Date.now() };
    const authors = await col("authors");
    await authors.insertOne(author);
    res.json(author);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const authors = await col("authors");
    await authors.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await authors.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    const authors = await col("authors");
    await authors.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const predictions = await col("predictions");
    const list = await predictions.find({ authorId: req.params.authorId }).toArray();
    res.json(list);
  });

  app.put("/api/author/predictions/:id", async (req, res) => {
    const predictions = await col("predictions");
    await predictions.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await predictions.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    const predictions = await col("predictions");
    await predictions.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions", async (req, res) => {
    const pred = {
      ...req.body,
      id: "p" + Date.now(),
      viewCount: 0,
      time: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
    };
    const predictions = await col("predictions");
    await predictions.insertOne(pred);
    res.json(pred);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await col("predictions");
    await predictions.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await predictions.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await col("predictions");
    await predictions.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions/unlock-all", async (req, res) => {
    const predictions = await col("predictions");
    await predictions.updateMany({}, { $set: { isUnlocked: true } });
    res.json({ message: "Unlocked all" });
  });

  app.get("/api/admin/users", async (req, res) => {
    const users = await col("users");
    const list = await users.find().toArray();
    res.json(list.map(u => {
      const { password, ...rest } = u;
      return rest;
    }));
  });

  app.post("/api/applications", async (req, res) => {
    const appData = {
      ...req.body,
      id: "app" + Date.now(),
      status: "pending",
      time: new Date().toISOString(),
    };
    const apps = await col("applications");
    await apps.insertOne(appData);
    res.json(appData);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const apps = await col("applications");
    const list = await apps.find().toArray();
    res.json(list);
  });

  app.delete("/api/admin/applications/:id", async (req, res) => {
    const apps = await col("applications");
    await apps.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const apps = await col("applications");
    await apps.updateOne({ id: req.params.id }, { $set: { status } });
    const appData = await apps.findOne({ id: req.params.id });

    if (status === "approved" && appData?.userId) {
      const users = await col("users");
      await users.updateOne({ id: appData.userId }, { $set: { isAuthor: true, authorId: "a" + appData.userId } });

      const authors = await col("authors");
      const exist = await authors.findOne({ userId: appData.userId });
      if (!exist) {
        const user = await users.findOne({ id: appData.userId });
        await authors.insertOne({
          id: "a" + appData.userId,
          userId: appData.userId,
          name: user.nickname || user.username,
          avatar: user.avatar || "",
          fans: 0,
          recentRecord: "新晋作者",
          streak: 0,
          history: [],
        });
      }
    }

    res.json(appData);
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const users = await col("users");
    await users.updateOne({ id: req.params.id }, { $set: req.body });
    const user = await users.findOne({ id: req.params.id });
    res.json(user);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const users = await col("users");
    await users.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const history = await col("history");
    const list = await history.find().toArray();
    res.json(list);
  });

  app.post("/api/admin/history", async (req, res) => {
    const item = { ...req.body, id: "h" + Date.now() };
    const history = await col("history");
    await history.insertOne(item);
    res.json(item);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    const history = await col("history");
    await history.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const orders = await col("orders");
    const list = await orders.find().toArray();
    res.json(list);
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    const orders = await col("orders");
    await orders.deleteOne({ _id: req.params.id });
    res.json({ message: "Deleted" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
