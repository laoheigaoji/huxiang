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

// 关键修复：兜底空数组，解决 purchased / following undefined 导致 includes 报错
const safeArr = (val: any) => Array.isArray(val) ? val : [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  await connectDB();

  const col = async (name: string) => {
    const db = await connectDB();
    return db.collection(name);
  };

  // ====================== 接口完整开始 ======================
  app.get("/api/authors", async (req, res) => {
    const c = await col("authors");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.get("/api/authors/:id", async (req, res) => {
    const c = await col("authors");
    const item = await c.findOne({ id: req.params.id });
    item ? res.json(item) : res.status(404).json({ error: "Author not found" });
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname, referrerId } = req.body;
    const c = await col("users");
    const exist = await c.findOne({ username });
    if (exist) return res.status(400).json({ error: "用户名已存在" });

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
      following: []
    };
    await c.insertOne(newUser);
    res.json({ message: "注册成功" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const c = await col("users");
    const user = await c.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "用户名或密码错误" });
    const { password: _, ...info } = user;
    res.json(info);
  });

  app.post("/api/wechat-login", async (req, res) => {
    const { code, nickname, avatar, referrer } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });
    const c = await col("users");
    const wechatOpenId = "wx_" + code.substring(0, 10);
    let user = await c.findOne({ wechatOpenId });

    if (!user) {
      user = {
        id: "u" + Date.now(),
        username: "wx_" + Date.now(),
        nickname: nickname || "微信用户_" + Math.floor(Math.random() * 1000),
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        referrer: referrer || null,
        balance: 0.0,
        wechatOpenId,
        purchased: [],
        following: []
      };
      await c.insertOne(user);
    } else {
      const updateData: any = {};
      if (nickname) updateData.nickname = nickname;
      if (avatar) updateData.avatar = avatar;
      if (Object.keys(updateData).length) {
        await c.updateOne({ wechatOpenId }, { $set: updateData });
        user = await c.findOne({ wechatOpenId });
      }
    }
    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: "已退出登录" });
  });

  app.get("/api/predictions", async (req, res) => {
    const c = await col("predictions");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.get("/api/history", async (req, res) => {
    const c = await col("history");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const c = await col("predictions");
    const item = await c.findOne({ id: req.params.id });
    item ? res.json(item) : res.status(404).json({ error: "Prediction not found" });
  });

  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const c = await col("users");
    const user = await c.findOne({ id: userId as string });
    if (!user) return res.status(404).json({ error: "User not found" });

    let referrerNickname = "无";
    if (user.referrerId) {
      const ref = await c.findOne({ id: user.referrerId });
      if (ref) referrerNickname = ref.nickname || ref.username;
    }

    const { password, ...rest } = user;
    // 强制兜底数组，根治前端 includes 报错
    res.json({
      ...rest,
      purchased: safeArr(user.purchased),
      following: safeArr(user.following),
      referrerNickname
    });
  });

  app.get("/api/messages", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const c = await col("messages");
    let list = await c.find({ $or: [{ userId }, { userId: "all" }] }).sort({ time: -1 }).toArray();

    if (list.length === 0) {
      const seed = [
        {
          id: "mseed1",
          userId: "all",
          type: "system",
          title: "关于账号安全的温馨提示",
          content: "尊敬的用户，为了您的账号安全，请妥善保管好您的登录密码，切勿泄露给他人。定期更换密码能更有效地保护您的账户安全。",
          time: new Date().toISOString()
        },
        {
          id: "mseed2",
          userId: "all",
          type: "activity",
          title: "新手礼包上线啦",
          content: "欢迎加入智料汇享！现在充值满100元即额外赠送20金币，多充多送，快去查看详情吧！",
          time: new Date().toISOString()
        }
      ];
      await c.insertMany(seed);
      list = seed;
    }
    res.json(list);
  });

  app.post("/api/admin/messages", async (req, res) => {
    const c = await col("messages");
    const newItem = { id: "m" + Date.now(), time: new Date().toISOString(), ...req.body };
    await c.insertOne(newItem);
    res.json(newItem);
  });

  app.delete("/api/admin/messages/:id", async (req, res) => {
    const c = await col("messages");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/settings", async (req, res) => {
    const c = await col("settings");
    let cfg = await c.findOne();
    if (!cfg) {
      cfg = {
        siteName: "智料汇享",
        announcement: "欢迎来到智料汇享平台，为您开启专业数据分析之旅！",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7,
        inviteCommissionRate: 0.1
      };
      await c.insertOne(cfg);
    }
    res.json(cfg);
  });

  app.put("/api/settings", async (req, res) => {
    const c = await col("settings");
    await c.updateOne({}, { $set: req.body }, { upsert: true });
    res.json({ message: "Settings updated", ...req.body });
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const userCol = await col("users");
    const user = await userCol.findOne({ id: userId as string });
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = safeArr(user.following);
    const idx = following.indexOf(id);
    let isFollowing = false;
    if (idx === -1) {
      following.push(id);
      isFollowing = true;
    } else {
      following.splice(idx, 1);
      isFollowing = false;
    }
    await userCol.updateOne({ id: userId as string }, { $set: { following } });
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

    const params: any = {
      pid,
      type: type || "alipay",
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderName || "金币充值",
      money: parseFloat(amount).toFixed(2),
      clientip,
      device: "mobile",
      sign_type: "MD5"
    };

    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys
      .filter(k => k !== "sign" && k !== "sign_type" && params[k])
      .map(k => `${k}=${params[k]}`)
      .join("&");
    const sign = CryptoJS.MD5(str + key).toString().toLowerCase();
    params.sign = sign;

    try {
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      if (response.data.code === 1) {
        const orderCol = await col("orders");
        await orderCol.insertOne({
          out_trade_no: outTradeNo,
          userId: userId || "u1",
          amount: parseFloat(amount),
          status: "pending",
          createdAt: new Date().toISOString()
        });
      }
      res.json(response.data);
    } catch (err) {
      res.status(500).json({ error: "支付请求失败" });
    }
  });

  app.get("/api/pay/notify", async (req, res) => {
    const { out_trade_no, trade_status } = req.query;
    if (trade_status !== "TRADE_SUCCESS") return res.send("success");
    const orderCol = await col("orders");
    const order = await orderCol.findOne({ out_trade_no });
    if (!order || order.status !== "pending") return res.send("success");

    await orderCol.updateOne({ out_trade_no }, { $set: { status: "completed" } });
    const userCol = await col("users");
    await userCol.updateOne({ id: order.userId }, { $inc: { balance: order.amount } });

    const tranCol = await col("transactions");
    await tranCol.insertOne({
      id: "t" + Date.now(),
      userId: order.userId,
      type: "recharge",
      amount: order.amount,
      description: "在线充值",
      time: new Date().toISOString()
    });
    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const c = await col("transactions");
    const list = await c.find({ userId: userId as string }).sort({ time: -1 }).toArray();
    res.json(list);
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const userCol = await col("users");
    const user = await userCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance < amount) return res.status(400).json({ error: "余额不足" });

    await userCol.updateOne({ id: userId }, { $inc: { balance: -amount } });
    const wdCol = await col("withdrawals");
    await wdCol.insertOne({
      id: "w" + Date.now(),
      userId,
      amount,
      account,
      name,
      type,
      status: "pending",
      time: new Date().toISOString()
    });

    const tranCol = await col("transactions");
    await tranCol.insertOne({
      id: "t" + Date.now(),
      userId,
      type: "withdraw",
      amount: -amount,
      description: "申请提现",
      time: new Date().toISOString()
    });
    res.json({ message: "提现申请已提交" });
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const userCol = await col("users");
    const preCol = await col("predictions");
    const setCol = await col("settings");

    const user = await userCol.findOne({ id: userId });
    const pred = await preCol.findOne({ id: predictionId });
    const setting = await setCol.findOne() || { authorCommissionRate: 0.7, inviteCommissionRate: 0.1 };

    if (!user || !pred) return res.status(404).json({ error: "数据不存在" });
    if (!pred.price || pred.price <= 0) return res.json({ message: "免费内容" });
    if (user.balance < pred.price) return res.status(400).json({ error: "余额不足" });

    const purchased = safeArr(user.purchased);
    if (purchased.includes(predictionId)) return res.json({ message: "已购买" });

    await userCol.updateOne({ id: userId }, {
      $inc: { balance: -pred.price },
      $set: { purchased: [...purchased, predictionId] }
    });

    res.json({ message: "购买成功" });
  });

  app.get("/api/invited-friends", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const c = await col("users");
    const list = await c.find({ referrerId: userId as string }).toArray();
    const result = list.map(({ password, ...rest }) => rest);
    res.json(result);
  });

  app.put("/api/profile", async (req, res) => {
    const { userId } = req.query;
    const userCol = await col("users");
    await userCol.updateOne({ id: userId as string }, { $set: req.body });
    const user = await userCol.findOne({ id: userId as string });
    const { password, ...rest } = user;
    res.json(rest);
  });

  app.post("/api/admin/authors", async (req, res) => {
    const c = await col("authors");
    const item = { ...req.body, id: "a" + Date.now() };
    await c.insertOne(item);
    res.json(item);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const c = await col("authors");
    await c.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await c.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    const c = await col("authors");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const c = await col("predictions");
    const list = await c.find({ authorId: req.params.authorId }).toArray();
    res.json(list);
  });

  app.put("/api/author/predictions/:id", async (req, res) => {
    const c = await col("predictions");
    await c.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await c.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    const c = await col("predictions");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions", async (req, res) => {
    const c = await col("predictions");
    const item = {
      ...req.body,
      id: "p" + Date.now(),
      viewCount: 0,
      time: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
    };
    await c.insertOne(item);
    res.json(item);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const c = await col("predictions");
    await c.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await c.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    const c = await col("predictions");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions/unlock-all", async (req, res) => {
    const c = await col("predictions");
    await c.updateMany({}, { $set: { isUnlocked: true } });
    res.json({ message: "Unlocked all" });
  });

  app.get("/api/admin/users", async (req, res) => {
    const c = await col("users");
    const list = await c.find().toArray();
    const data = list.map(({ password, ...rest }) => rest);
    res.json(data);
  });

  app.post("/api/applications", async (req, res) => {
    const c = await col("applications");
    const item = {
      ...req.body,
      id: "app" + Date.now(),
      status: "pending",
      time: new Date().toISOString()
    };
    await c.insertOne(item);
    res.json(item);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const c = await col("applications");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.delete("/api/admin/applications/:id", async (req, res) => {
    const c = await col("applications");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const appCol = await col("applications");
    const userCol = await col("users");
    const autCol = await col("authors");

    await appCol.updateOne({ id: req.params.id }, { $set: { status } });
    const app = await appCol.findOne({ id: req.params.id });

    if (status === "approved" && app?.userId) {
      await userCol.updateOne({ id: app.userId }, { $set: { isAuthor: true, authorId: "a" + app.userId } });
      const user = await userCol.findOne({ id: app.userId });
      const has = await autCol.findOne({ userId: app.userId });
      if (!has) {
        await autCol.insertOne({
          id: "a" + app.userId,
          userId: app.userId,
          name: user?.nickname || user?.username || "",
          avatar: user?.avatar || "",
          fans: 0,
          recentRecord: "新晋作者",
          streak: 0,
          history: []
        });
      }
    }
    res.json(app);
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const c = await col("users");
    await c.updateOne({ id: req.params.id }, { $set: req.body });
    const item = await c.findOne({ id: req.params.id });
    res.json(item);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const c = await col("users");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const c = await col("history");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.post("/api/admin/history", async (req, res) => {
    const c = await col("history");
    const item = { ...req.body, id: "h" + Date.now() };
    await c.insertOne(item);
    res.json(item);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    const c = await col("history");
    await c.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const c = await col("orders");
    const list = await c.find().toArray();
    res.json(list);
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    const c = await col("orders");
    await c.deleteOne({ _id: req.params.id });
    res.json({ message: "Deleted" });
  });
  // ====================== 接口完整结束 ======================

  // 前端静态托管 / Vite 中间件
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
