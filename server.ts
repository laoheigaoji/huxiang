import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import axios from "axios";
import mongoose from "mongoose";

// 你的 MongoDB 连接字符串
const MONGODB_URI = "mongodb+srv://752675:Aa752675@cluster0.simmm5o.mongodb.net/myapp?retryWrites=true&w=majority";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// MongoDB 模型定义
// ======================
const AuthorSchema = new mongoose.Schema({
  id: String,
  name: String,
  avatar: String,
  fans: Number,
  recentRecord: String,
  streak: Number,
  isHot: Boolean,
});
const Author = mongoose.model("Author", AuthorSchema);

const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  nickname: String,
  referrerId: String,
  referrer: String,
  balance: Number,
  avatar: String,
  createdAt: String,
  wechatOpenId: String,
  isAuthor: Boolean,
  authorId: String,
  following: [String],
  purchased: [String],
  totalEarnings: Number,
  totalInvitedEarnings: Number,
});
const User = mongoose.model("User", UserSchema);

const PredictionSchema = new mongoose.Schema({
  id: String,
  authorId: String,
  title: String,
  content: String,
  contentTitle: String,
  price: Number,
  isUnlocked: Boolean,
  viewCount: Number,
  time: String,
  unlockAt: String,
});
const Prediction = mongoose.model("Prediction", PredictionSchema);

const HistorySchema = new mongoose.Schema({
  id: String,
  content: String,
  time: String,
});
const History = mongoose.model("History", HistorySchema);

const OrderSchema = new mongoose.Schema({
  out_trade_no: String,
  userId: String,
  amount: Number,
  status: String,
  createdAt: String,
  trade_no: String,
});
const Order = mongoose.model("Order", OrderSchema);

const TransactionSchema = new mongoose.Schema({
  id: String,
  userId: String,
  type: String,
  amount: Number,
  description: String,
  time: String,
});
const Transaction = mongoose.model("Transaction", TransactionSchema);

const MessageSchema = new mongoose.Schema({
  id: String,
  userId: String,
  type: String,
  title: String,
  content: String,
  time: String,
});
const Message = mongoose.model("Message", MessageSchema);

const SettingSchema = new mongoose.Schema({
  siteName: String,
  announcement: String,
  contactEmail: String,
  defaultUnlockDuration: String,
  authorCommissionRate: Number,
  inviteCommissionRate: Number,
});
const Setting = mongoose.model("Setting", SettingSchema);

const WithdrawalSchema = new mongoose.Schema({
  id: String,
  userId: String,
  amount: Number,
  account: String,
  name: String,
  type: String,
  status: String,
  time: String,
});
const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);

const ApplicationSchema = new mongoose.Schema({
  id: String,
  userId: String,
  username: String,
  nickname: String,
  reason: String,
  status: String,
  time: String,
});
const Application = mongoose.model("Application", ApplicationSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 连接 MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB 连接成功");
  } catch (err) {
    console.error("❌ MongoDB 连接失败:", err);
  }

  // ======================
  // API 路由
  // ======================

  app.get("/api/authors", async (req, res) => {
    const authors = await Author.find();
    res.json(authors);
  });

  app.get("/api/authors/:id", async (req, res) => {
    const author = await Author.findOne({ id: req.params.id });
    if (author) res.json(author);
    else res.status(404).json({ error: "Author not found" });
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname, referrerId } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: "用户名已存在" });

    const newUser = new User({
      id: "u" + Date.now(),
      username,
      password,
      nickname,
      referrerId: referrerId || null,
      balance: 0.0,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      createdAt: new Date().toISOString(),
    });
    await newUser.save();
    res.json({ message: "注册成功" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ error: "用户名或密码错误" });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  });

  app.post("/api/wechat-login", async (req, res) => {
    const { code, nickname, avatar, referrer } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const wechatOpenId = "wx_" + code.substring(0, 10);
    let user = await User.findOne({ wechatOpenId });

    if (!user) {
      user = new User({
        id: "u" + Date.now(),
        username: "wx_" + Date.now(),
        nickname: nickname || "微信用户_" + Math.floor(Math.random() * 1000),
        avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        referrer: referrer || null,
        balance: 0.0,
        wechatOpenId,
      });
    } else {
      if (nickname) user.nickname = nickname;
      if (avatar) user.avatar = avatar;
    }
    await user.save();
    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: "已退出登录" });
  });

  app.get("/api/predictions", async (req, res) => {
    const predictions = await Prediction.find();
    res.json(predictions);
  });

  app.get("/api/history", async (req, res) => {
    const history = await History.find();
    res.json(history);
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const prediction = await Prediction.findOne({ id: req.params.id });
    if (prediction) res.json(prediction);
    else res.status(404).json({ error: "Prediction not found" });
  });

  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password, ...userWithoutPassword } = user.toObject();
    let referrerNickname = "无";
    if (user.referrerId) {
      const referrer = await User.findOne({ id: user.referrerId });
      if (referrer) referrerNickname = referrer.nickname || referrer.username;
    }
    res.json({ ...userWithoutPassword, referrerNickname });
  });

  app.get("/api/messages", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let messages = await Message.find({
      $or: [{ userId }, { userId: "all" }],
    }).sort({ time: -1 });

    if (messages.length === 0) {
      messages = [
        new Message({
          id: "mseed1",
          userId: "all",
          type: "system",
          title: "关于账号安全的温馨提示",
          content: "请妥善保管密码，定期更换。",
          time: new Date().toISOString(),
        }),
        new Message({
          id: "mseed2",
          userId: "all",
          type: "activity",
          title: "新手礼包上线",
          content: "充值满100送20金币！",
          time: new Date().toISOString(),
        }),
      ];
      await Message.insertMany(messages);
      messages = await Message.find();
    }
    res.json(messages);
  });

  app.post("/api/admin/messages", async (req, res) => {
    const msg = new Message({
      id: "m" + Date.now(),
      time: new Date().toISOString(),
      ...req.body,
    });
    await msg.save();
    res.json(msg);
  });

  app.delete("/api/admin/messages/:id", async (req, res) => {
    await Message.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/settings", async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({
        siteName: "智料汇享",
        announcement: "欢迎来到智料汇享平台",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7,
        inviteCommissionRate: 0.1,
      });
      await settings.save();
    }
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    await Setting.findOneAndUpdate({}, req.body, { upsert: true });
    res.json({ message: "Settings updated", ...req.body });
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.following) user.following = [];
    const index = user.following.indexOf(id);
    let isFollowing = false;

    if (index === -1) {
      user.following.push(id);
      isFollowing = true;
    } else {
      user.following.splice(index, 1);
      isFollowing = false;
    }
    await user.save();
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
        const order = new Order({
          out_trade_no: outTradeNo,
          userId: userId || "u1",
          amount: parseFloat(amount),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        await order.save();
      }
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "支付请求失败" });
    }
  });

  app.get("/api/pay/notify", async (req, res) => {
    const { pid, trade_no, out_trade_no, trade_status, sign } = req.query;
    const key = process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";
    const params = { ...req.query };
    delete params.sign;
    delete params.sign_type;

    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys.filter(k => params[k] !== "").map(k => `${k}=${params[k]}`).join("&");
    const calculatedSign = CryptoJS.MD5(str + key).toString().toLowerCase();

    if (calculatedSign !== sign) return res.status(400).send("fail");
    if (trade_status === "TRADE_SUCCESS") {
      const order = await Order.findOne({ out_trade_no });
      if (order && order.status === "pending") {
        order.status = "completed";
        order.trade_no = trade_no;
        await order.save();

        const user = await User.findOne({ id: order.userId });
        if (user) {
          user.balance = (user.balance || 0) + order.amount;
          await user.save();

          const tran = new Transaction({
            id: "t" + Date.now(),
            userId: user.id,
            type: "recharge",
            amount: order.amount,
            description: "在线充值",
            time: new Date().toISOString(),
          });
          await tran.save();

          const msg = new Message({
            id: "m" + Date.now(),
            userId: user.id,
            type: "system",
            title: "充值成功",
            content: `已成功充值 ${order.amount} 元`,
            time: new Date().toISOString(),
          });
          await msg.save();
        }
      }
    }
    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const list = await Transaction.find({ userId }).sort({ time: -1 });
    res.json(list);
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance < amount) return res.status(400).json({ error: "余额不足" });

    user.balance -= amount;
    await user.save();

    const wd = new Withdrawal({
      id: "w" + Date.now(),
      userId: user.id,
      amount,
      account,
      name,
      type,
      status: "pending",
      time: new Date().toISOString(),
    });
    await wd.save();

    const tran = new Transaction({
      id: "t" + Date.now(),
      userId: user.id,
      type: "withdraw",
      amount: -amount,
      description: "申请提现",
      time: new Date().toISOString(),
    });
    await tran.save();

    const msg = new Message({
      id: "m" + Date.now(),
      userId: user.id,
      type: "system",
      title: "提现申请已提交",
      content: `您的 ${amount} 元提现申请已提交，等待审核`,
      time: new Date().toISOString(),
    });
    await msg.save();

    res.json({ message: "提现申请已提交" });
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const setting = await Setting.findOne();
    const authorRate = setting?.authorCommissionRate || 0.7;
    const inviteRate = setting?.inviteCommissionRate || 0.1;

    const user = await User.findOne({ id: userId });
    const pred = await Prediction.findOne({ id: predictionId });
    if (!user || !pred) return res.status(404).json({ error: "数据不存在" });
    if (!pred.price || pred.price <= 0) return res.json({ message: "Free" });
    if (user.balance < pred.price) return res.status(400).json({ error: "余额不足" });

    user.balance -= pred.price;
    if (!user.purchased) user.purchased = [];
    if (user.purchased.includes(predictionId)) return res.json({ message: "Already purchased" });
    user.purchased.push(predictionId);
    await user.save();

    const authorUser = await User.findOne({ authorId: pred.authorId });
    if (authorUser) {
      const revenue = pred.price * authorRate;
      authorUser.balance += revenue;
      authorUser.totalEarnings = (authorUser.totalEarnings || 0) + revenue;
      await authorUser.save();

      const t = new Transaction({
        id: "t" + Date.now() + "a",
        userId: authorUser.id,
        type: "earnings",
        amount: revenue,
        description: `内容收益: ${pred.contentTitle?.substring(0, 10)}`,
        time: new Date().toISOString(),
      });
      await t.save();
    }

    if (user.referrerId) {
      const refUser = await User.findOne({ id: user.referrerId });
      if (refUser) {
        const bonus = pred.price * inviteRate;
        refUser.balance += bonus;
        refUser.totalInvitedEarnings = (refUser.totalInvitedEarnings || 0) + bonus;
        await refUser.save();
      }
    }

    const t2 = new Transaction({
      id: "t" + Date.now() + "b",
      userId: user.id,
      type: "withdraw",
      amount: -pred.price,
      description: `购买: ${pred.contentTitle?.substring(0, 10)}`,
      time: new Date().toISOString(),
    });
    await t2.save();

    res.json({ message: "购买成功" });
  });

  app.get("/api/invited-friends", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const friends = await User.find({ referrerId: userId });
    res.json(friends.map(u => { const { password, ...rest } = u.toObject(); return rest; }));
  });

  app.put("/api/profile", async (req, res) => {
    const { userId } = req.query;
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    Object.assign(user, req.body);
    await user.save();
    const { password, ...rest } = user.toObject();
    res.json(rest);
  });

  app.post("/api/admin/authors", async (req, res) => {
    const author = new Author({ ...req.body, id: Date.now().toString() });
    await author.save();
    res.json(author);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const author = await Author.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(author);
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    await Author.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const list = await Prediction.find({ authorId: req.params.authorId });
    res.json(list);
  });

  app.put("/api/author/predictions/:id", async (req, res) => {
    const p = await Prediction.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(p);
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    await Prediction.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions", async (req, res) => {
    const { unlockDuration, ...rest } = req.body;
    let unlockAt = null;
    if (unlockDuration) {
      const now = new Date();
      const parts = unlockDuration.split(":").map(Number);
      if (parts.length === 3) { now.setHours(now.getHours() + parts[0], now.getMinutes() + parts[1], now.getSeconds() + parts[2]); }
      unlockAt = now.toISOString();
    }
    const p = new Prediction({
      ...rest, id: "p" + Date.now(), viewCount: 0,
      time: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
      unlockAt,
    });
    await p.save();
    res.json(p);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const p = await Prediction.findOne({ id: req.params.id });
    if (!p) return res.status(404).json({ error: "not found" });
    Object.assign(p, req.body);
    await p.save();
    res.json(p);
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    await Prediction.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions/unlock-all", async (req, res) => {
    await Prediction.updateMany({}, { isUnlocked: true });
    res.json({ message: "Unlocked all" });
  });

  app.get("/api/admin/users", async (req, res) => {
    const users = await User.find();
    res.json(users.map(u => { const { password, ...rest } = u.toObject(); return rest; }));
  });

  app.post("/api/applications", async (req, res) => {
    const appData = new Application({
      ...req.body, id: "app" + Date.now(), status: "pending", time: new Date().toISOString(),
    });
    await appData.save();
    res.json(appData);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const list = await Application.find();
    res.json(list);
  });

  app.delete("/api/admin/applications/:id", async (req, res) => {
    await Application.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const appData = await Application.findOne({ id: req.params.id });
    if (!appData) return res.status(404).json({ error: "not found" });
    appData.status = status;
    await appData.save();

    if (status === "approved") {
      const user = await User.findOne({ id: appData.userId });
      if (user) {
        const authorId = "a" + Date.now();
        user.isAuthor = true;
        user.authorId = authorId;
        await user.save();

        const author = new Author({
          id: authorId,
          name: user.nickname || user.username,
          avatar: user.avatar,
          fans: 0,
          recentRecord: "新晋作者",
          streak: 0,
          history: [],
        });
        await author.save();
      }
    }
    res.json(appData);
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(user);
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    await User.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const list = await History.find();
    res.json(list);
  });

  app.post("/api/admin/history", async (req, res) => {
    const item = new History({ ...req.body, id: "h" + Date.now() });
    await item.save();
    res.json(item);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    await History.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const list = await Order.find();
    res.json(list);
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: "Deleted" });
  });

  // ======================
  // Vite
  // ======================
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
    console.log(`🚀 服务运行在 http://localhost:${PORT}`);
  });
}

startServer();
