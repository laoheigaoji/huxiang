import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import axios from "axios";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 完整可用 Atlas 连接串（带写入参数）
const uri = "mongodb+srv://752675:Aa752675@cluster0.simmm5o.mongodb.net/myapp?retryWrites=true&w=majority";
let db: any;

async function connectDB() {
  if (!db) {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db("myapp");
    console.log("✅ MongoDB 连接成功");
  }
  return db;
}

async function getCollection(name: string) {
  const db = await connectDB();
  return db.collection(name);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/authors", async (req, res) => {
    const authors = await getCollection("authors");
    res.json(await authors.find().toArray());
  });

  app.get("/api/authors/:id", async (req, res) => {
    const authors = await getCollection("authors");
    const author = await authors.findOne({ id: req.params.id });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname } = req.body;
    const users = await getCollection("users");
    const exists = await users.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "用户名已存在" });
    }
    const newUser = {
      id: "u" + Date.now(),
      username,
      password,
      nickname,
      balance: 100.0,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
    };
    await users.insertOne(newUser);
    res.json({ message: "注册成功" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const users = await getCollection("users");
    const user = await users.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/wechat-login", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
      const users = await getCollection("users");
      const wechatOpenId = "wx_" + code.substring(0, 10);
      let user = await users.findOne({ wechatOpenId });

      if (!user) {
        user = {
          id: "u" + Date.now(),
          username: "wx_" + Date.now(),
          nickname: "微信用户_" + Math.floor(Math.random() * 1000),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          balance: 100.0,
          wechatOpenId: wechatOpenId
        };
        await users.insertOne(user);
      }

      res.json(user);
    } catch (error) {
      console.error("Wechat login error:", error);
      res.status(500).json({ error: "微信登录失败" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.json({ message: "已退出登录" });
  });

  app.get("/api/predictions", async (req, res) => {
    const predictions = await getCollection("predictions");
    res.json(await predictions.find().toArray());
  });

  app.get("/api/history", async (req, res) => {
    const history = await getCollection("history");
    res.json(await history.find().toArray());
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const predictions = await getCollection("predictions");
    const prediction = await predictions.findOne({ id: req.params.id });
    if (prediction) {
      res.json(prediction);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.get("/api/profile", async (req, res) => {
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length > 0) {
      const { password, ...user } = userList[0];
      res.json(user);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length > 0) {
      const user = userList[0];
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
      await users.updateOne({ id: user.id }, { $set: { following: user.following } });
      res.json({ isFollowing });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/pay/create", async (req, res) => {
    const { amount, type, orderName, userId } = req.body;
    
    const pid = process.env.YIPAY_PID || "1000";
    const key = process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";
    const apiUrl = (process.env.YIPAY_API_URL || "http://yzf.dypm.top/").replace(/\/$/, "");
    
    const outTradeNo = Date.now().toString() + Math.floor(Math.random() * 1000);
    const notifyUrl = `https://${req.get('host')}/api/pay/notify`;
    const returnUrl = `https://${req.get('host')}/top-up?status=success`;
    
    const clientip = (req.headers['x-forwarded-for'] as string || req.ip || '127.0.0.1').split(',')[0].replace('::ffff:', '');
    
    const params: any = {
      pid: pid,
      type: type || "alipay",
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: orderName || "金币充值",
      money: parseFloat(amount).toFixed(2),
      clientip: clientip,
      device: "mobile",
      sign_type: "MD5"
    };

    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys
      .filter(k => k !== 'sign' && k !== 'sign_type' && (params[k] !== '' && params[k] !== null && params[k] !== undefined))
      .map(k => `${k}=${params[k]}`)
      .join('&');
    
    const sign = CryptoJS.MD5(str + key).toString().toLowerCase();
    params.sign = sign;

    try {
      console.log("Sending request to Yipay:", apiUrl + "/mapi.php", params);
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log("Yipay response data:", response.data);

      if (response.data.code === 1) {
        const orders = await getCollection("orders");
        await orders.insertOne({
          out_trade_no: outTradeNo,
          userId: userId || "u1",
          amount: parseFloat(amount),
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }

      res.json(response.data);
    } catch (error: any) {
      console.error("Yipay request error:", error.message);
      if (error.response) {
        console.error("Yipay error response:", error.response.data);
      }
      res.status(500).json({ error: "支付请求失败", details: error.message });
    }
  });

  app.get("/api/pay/notify", async (req, res) => {
    const { pid, trade_no, out_trade_no, type, name, money, trade_status, sign } = req.query;
    const key = process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";

    console.log("Pay notify received:", req.query);

    const params: any = { ...req.query };
    delete params.sign;
    delete params.sign_type;

    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys
      .filter(k => params[k] !== '' && params[k] !== null && params[k] !== undefined)
      .map(k => `${k}=${params[k]}`)
      .join('&');
    
    const calculatedSign = CryptoJS.MD5(str + key).toString().toLowerCase();

    if (calculatedSign !== sign) {
      console.error("Notify sign verification failed");
      return res.status(400).send("fail");
    }

    if (trade_status === "TRADE_SUCCESS") {
      const orders = await getCollection("orders");
      const order = await orders.findOne({ out_trade_no });
      
      if (order && order.status === 'pending') {
        await orders.updateOne(
          { out_trade_no },
          { $set: { status: 'completed', trade_no } }
        );

        const users = await getCollection("users");
        await users.updateOne(
          { id: order.userId },
          { $inc: { balance: Number(order.amount) } }
        );

        const transactions = await getCollection("transactions");
        await transactions.insertOne({
          id: "t" + Date.now(),
          userId: order.userId,
          type: 'recharge',
          amount: order.amount,
          description: '在线充值',
          time: new Date().toISOString()
        });
      }
    }

    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const transactions = await getCollection("transactions");
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length > 0) {
      const userTransactions = await transactions.find({ userId: userList[0].id }).toArray();
      res.json(userTransactions);
    } else {
      res.json([]);
    }
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type } = req.body;
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length > 0) {
      const user = userList[0];
      if (user.balance < amount) {
        return res.status(400).json({ error: "余额不足" });
      }

      await users.updateOne({ id: user.id }, { $inc: { balance: -Number(amount) } });

      const withdrawals = await getCollection("withdrawals");
      const newWithdrawal = {
        id: "w" + Date.now(),
        userId: user.id,
        amount,
        account,
        name,
        type,
        status: 'pending',
        time: new Date().toISOString()
      };
      await withdrawals.insertOne(newWithdrawal);

      const transactions = await getCollection("transactions");
      await transactions.insertOne({
        id: "t" + Date.now(),
        userId: user.id,
        type: 'withdraw',
        amount: -amount,
        description: '申请提现',
        time: new Date().toISOString()
      });

      res.json({ message: "提现申请已提交" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId } = req.body;
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length === 0) return res.status(401).json({ error: "Unauthorized" });
    
    const user = userList[0];
    const predictions = await getCollection("predictions");
    const prediction = await predictions.findOne({ id: predictionId });
    
    if (!prediction) return res.status(404).json({ error: "Prediction not found" });
    if (!prediction.price || prediction.price <= 0) return res.json({ message: "Free article" });

    if (user.balance < prediction.price) {
      return res.status(400).json({ error: "余额不足" });
    }

    user.balance -= prediction.price;
    if (!user.purchased) user.purchased = [];
    if(!user.purchased.includes(predictionId)){
      user.purchased.push(predictionId);
    }

    const authors = await getCollection("authors");
    const author = await authors.findOne({ id: prediction.authorId });
    
    const authorUserList = await users.find({ isAuthor: true, authorId: prediction.authorId }).toArray();
    if (authorUserList.length > 0) {
      const authorUser = authorUserList[0];
      const revenue = prediction.price * 0.7;
      await users.updateOne(
        { id: authorUser.id },
        { $inc: { balance: revenue, totalEarnings: revenue } }
      );

      const transactions = await getCollection("transactions");
      await transactions.insertOne({
        id: "t" + Date.now() + "rev",
        userId: authorUser.id,
        type: 'earnings',
        amount: revenue,
        description: `文章销售权益: ${prediction.contentTitle?.substring(0, 10)}...`,
        time: new Date().toISOString()
      });
    }

    await users.updateOne({ id: user.id }, { $set: { balance: user.balance, purchased: user.purchased } });

    const transactions = await getCollection("transactions");
    await transactions.insertOne({
      id: "t" + Date.now() + "buy",
      userId: user.id,
      type: 'expense',
      amount: -prediction.price,
      description: `购买方案: ${prediction.contentTitle?.substring(0, 10)}...`,
      time: new Date().toISOString()
    });

    res.json({ message: "购买成功" });
  });

  app.put("/api/profile", async (req, res) => {
    const users = await getCollection("users");
    const userList = await users.find().toArray();
    if (userList.length > 0) {
      const newData = { ...userList[0], ...req.body };
      await users.updateOne({ id: userList[0].id }, { $set: newData });
      const { password, ...userWithoutPassword } = newData;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/admin/authors", async (req, res) => {
    const authors = await getCollection("authors");
    const newAuthor = { ...req.body, id: Date.now().toString() };
    await authors.insertOne(newAuthor);
    res.json(newAuthor);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const authors = await getCollection("authors");
    const author = await authors.findOne({ id: req.params.id });
    if (author) {
      const updateData = { ...author, ...req.body };
      await authors.updateOne({ id: req.params.id }, { $set: updateData });
      res.json(updateData);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    const authors = await getCollection("authors");
    await authors.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const predictions = await getCollection("predictions");
    const list = await predictions.find({ authorId: req.params.authorId }).toArray();
    res.json(list);
  });

  app.put("/api/author/predictions/:id", async (req, res) => {
    const predictions = await getCollection("predictions");
    const item = await predictions.findOne({ id: req.params.id });
    if (item) {
      const updateData = { ...item, ...req.body, id: req.params.id };
      await predictions.updateOne({ id: req.params.id }, { $set: updateData });
      res.json(updateData);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    const predictions = await getCollection("predictions");
    await predictions.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions", async (req, res) => {
    const predictions = await getCollection("predictions");
    const newPrediction = { ...req.body, id: "p" + Date.now() };
    await predictions.insertOne(newPrediction);
    res.json(newPrediction);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await getCollection("predictions");
    const item = await predictions.findOne({ id: req.params.id });
    if (item) {
      const updateData = { ...item, ...req.body };
      await predictions.updateOne({ id: req.params.id }, { $set: updateData });
      res.json(updateData);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await getCollection("predictions");
    await predictions.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/users", async (req, res) => {
    const users = await getCollection("users");
    const list = await users.find().toArray();
    const safeList = list.map(({ password, ...rest }: any) => rest);
    res.json(safeList);
  });

  app.post("/api/applications", async (req, res) => {
    const applications = await getCollection("applications");
    const newApp = { 
      ...req.body, 
      id: "app" + Date.now(), 
      status: 'pending',
      time: new Date().toISOString() 
    };
    await applications.insertOne(newApp);
    res.json(newApp);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const applications = await getCollection("applications");
    const list = await applications.find().toArray();
    res.json(list);
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const applications = await getCollection("applications");
    const appItem = await applications.findOne({ id: req.params.id });
    if (appItem) {
      await applications.updateOne({ id: req.params.id }, { $set: { status } });

      if (status === 'approved') {
        const users = await getCollection("users");
        const userItem = await users.findOne({ id: appItem.userId });
        if (userItem) {
          const authorId = "a" + Date.now();
          await users.updateOne(
            { id: userItem.id },
            { $set: { isAuthor: true, authorId } }
          );

          const authors = await getCollection("authors");
          await authors.insertOne({
            id: authorId,
            name: userItem.nickname || userItem.username,
            avatar: userItem.avatar,
            fans: 0,
            recentRecord: "新晋作者",
            streak: 0
          });
        }
      }
      res.json({ ...appItem, status });
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const users = await getCollection("users");
    const user = await users.findOne({ id: req.params.id });
    if (user) {
      const updateData = { ...user, ...req.body };
      await users.updateOne({ id: req.params.id }, { $set: updateData });
      res.json(updateData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const users = await getCollection("users");
    await users.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const history = await getCollection("history");
    res.json(await history.find().toArray());
  });

  app.post("/api/admin/history", async (req, res) => {
    const history = await getCollection("history");
    const newItem = { ...req.body, id: "h" + Date.now() };
    await history.insertOne(newItem);
    res.json(newItem);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    const history = await getCollection("history");
    await history.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/orders", async (req, res) => {
    const orders = await getCollection("orders");
    res.json(await orders.find().toArray());
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    const orders = await getCollection("orders");
    await orders.deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
