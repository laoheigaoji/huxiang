import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import axios from "axios";
import { MongoClient, ObjectId } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://752675:Aa752675@cluster0.simmm5o.mongodb.net/myapp?retryWrites=true&w=majority";

async function startServer() {
  const app = express();
  const PORT = 3000;

  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db();
  console.log("Connected to MongoDB");

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Migration logic (run once if users is empty)
  try {
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount === 0) {
      console.log("Migrating local data to MongoDB...");
      const files = ["users", "authors", "predictions", "history", "messages", "orders", "settings", "transactions", "withdrawals", "applications"];
      for (const file of files) {
        try {
          const filePath = path.join(__dirname, "data", `${file}.json`);
          const content = await fs.readFile(filePath, "utf8");
          const data = JSON.parse(content);
          if (Array.isArray(data) && data.length > 0) {
            await db.collection(file).insertMany(data);
          } else if (!Array.isArray(data) && typeof data === 'object' && Object.keys(data).length > 0) {
            await db.collection(file).insertOne(data);
          }
        } catch (err) {
          // Skip if file doesn't exist
        }
      }
    }
  } catch (err) {
    console.error("Migration error:", err);
  }

  // API Routes
  app.get("/api/authors", async (req, res) => {
    const authors = await db.collection("authors").find().toArray();
    res.json(authors);
  });

  app.get("/api/authors/:id", async (req, res) => {
    const author = await db.collection("authors").findOne({ id: req.params.id });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname, referrerId } = req.body;
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "用户名已存在" });
    }
    const newUser = {
      id: "u" + Date.now(),
      username,
      password,
      nickname,
      referrerId: referrerId || null,
      balance: 0.0,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      createdAt: new Date().toISOString()
    };
    await db.collection("users").insertOne(newUser);
    res.json(newUser);
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/wechat-login", async (req, res) => {
    const { code, nickname, avatar, referrer } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
      const wechatOpenId = "wx_" + code.substring(0, 10);
      let user = await db.collection("users").findOne({ wechatOpenId });

      if (!user) {
        user = {
          id: "u" + Date.now(),
          username: "wx_" + Date.now(),
          nickname: nickname || ("微信用户_" + Math.floor(Math.random() * 1000)),
          avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          referrer: referrer || null,
          balance: 0.0,
          wechatOpenId: wechatOpenId
        } as any;
        await db.collection("users").insertOne(user);
      } else if (nickname || avatar) {
        const update: any = {};
        if (nickname) update.nickname = nickname;
        if (avatar) update.avatar = avatar;
        await db.collection("users").updateOne({ id: user.id }, { $set: update });
        user = { ...user, ...update };
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
    const predictions = await db.collection("predictions").find().toArray();
    res.json(predictions);
  });

  app.get("/api/history", async (req, res) => {
    const history = await db.collection("history").find().toArray();
    res.json(history);
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const prediction = await db.collection("predictions").findOne({ id: req.params.id });
    if (prediction) {
      res.json(prediction);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.post("/api/predictions/:id/public", async (req, res) => {
    await db.collection("predictions").updateOne({ id: req.params.id }, { $set: { isUnlocked: true, status: 'public' } });
    res.json({ message: "marked as public" });
  });

  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const user = await db.collection("users").findOne({ id: userId });
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      let referrerNickname = "无";
      if (user.referrerId) {
        const referrer = await db.collection("users").findOne({ id: user.referrerId });
        if (referrer) {
          referrerNickname = referrer.nickname || referrer.username;
        }
      }
      res.json({ ...userWithoutPassword, referrerNickname });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    let messages = await db.collection("messages").find({
      $or: [{ userId: userId }, { userId: 'all' }]
    }).toArray();
    
    // Seed messages if empty
    if (messages.length === 0) {
      const seedMessages: any[] = [
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
      await db.collection("messages").insertMany(seedMessages);
      messages = seedMessages;
    }

    res.json(messages.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  });

  app.post("/api/admin/messages", async (req, res) => {
    const newMessage = {
      id: "m" + Date.now(),
      time: new Date().toISOString(),
      ...req.body
    };
    await db.collection("messages").insertOne(newMessage);
    res.json(newMessage);
  });

  app.delete("/api/admin/messages/:id", async (req, res) => {
    await db.collection("messages").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/settings", async (req, res) => {
    let settings: any = await db.collection("settings").findOne({});
    if (!settings) {
      settings = {
        siteName: "智料汇享",
        announcement: "欢迎来到智料汇享平台，为您开启专业数据分析之旅！",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7, // 70% to author
        inviteCommissionRate: 0.1  // 10% to referrer
      };
      await db.collection("settings").insertOne(settings);
    }
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    const settings = req.body;
    delete settings._id; // Remove _id to avoid immutable error
    await db.collection("settings").updateOne({}, { $set: settings }, { upsert: true });
    res.json({ message: "Settings updated", ...settings });
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await db.collection("users").findOne({ id: userId });
    
    if (user) {
      const following = (user as any).following || [];
      const index = following.indexOf(id);
      let isFollowing = false;
      if (index === -1) {
        await db.collection("users").updateOne({ id: userId }, { $push: { following: id } } as any);
        isFollowing = true;
        
        // Add notification for author
        const authorUser = await db.collection("users").findOne({ isAuthor: true, authorId: id });
        if (authorUser) {
           await db.collection("messages").insertOne({
             id: "m" + Date.now(),
             userId: authorUser.id,
             type: 'follow',
             title: '新增关注',
             content: `${user.nickname || user.username} 关注了你`,
             time: new Date().toISOString()
           });
        }
      } else {
        await db.collection("users").updateOne({ id: userId }, { $pull: { following: id } } as any);
        isFollowing = false;
      }
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

    // Sign
    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys
      .filter(k => k !== 'sign' && k !== 'sign_type' && (params[k] !== '' && params[k] !== null && params[k] !== undefined))
      .map(k => `${k}=${params[k]}`)
      .join('&');
    
    const sign = CryptoJS.MD5(str + key).toString().toLowerCase();
    params.sign = sign;

    try {
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.code === 1) {
        await db.collection("orders").insertOne({
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
      const order = await db.collection("orders").findOne({ out_trade_no, status: "pending" });
      
      if (order) {
        await db.collection("orders").updateOne({ id: order.id }, { $set: { status: 'completed', trade_no: trade_no } });

        // Update user balance
        await db.collection("users").updateOne({ id: order.userId }, { $inc: { balance: order.amount } });

        // Log transaction
        await db.collection("transactions").insertOne({
          id: "t" + Date.now(),
          userId: order.userId,
          type: 'recharge',
          amount: order.amount,
          description: '在线充值',
          time: new Date().toISOString()
        });

        // Add message
        await db.collection("messages").insertOne({
          id: "m" + Date.now(),
          userId: order.userId,
          type: 'system',
          title: '充值成功',
          content: `您已成功充值 ${order.amount} 元`,
          time: new Date().toISOString()
        });
      }
    }

    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const transactions = await db.collection("transactions").find({ userId }).toArray();
    res.json(transactions.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const user = await db.collection("users").findOne({ id: userId });
    
    if (user) {
      if (user.balance < amount) {
        return res.status(400).json({ error: "余额不足" });
      }

      await db.collection("users").updateOne({ id: userId }, { $inc: { balance: -amount } });

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
      await db.collection("withdrawals").insertOne(newWithdrawal);

      // Log transaction
      await db.collection("transactions").insertOne({
        id: "t" + Date.now(),
        userId: user.id,
        type: 'withdraw',
        amount: -amount,
        description: '申请提现',
        time: new Date().toISOString()
      });

      // Add message
      await db.collection("messages").insertOne({
        id: "m" + Date.now(),
        userId: user.id,
        type: 'system',
        title: '提现申请已提交',
        content: `您的 ${amount} 元提现申请已提交，请等待审核`,
        time: new Date().toISOString()
      });

      res.json({ message: "提现申请已提交" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const settings: any = (await db.collection("settings").findOne({})) || {};
    const authorCommissionRate = settings.authorCommissionRate || 0.7;
    const inviteCommissionRate = settings.inviteCommissionRate || 0.1;

    const user = await db.collection("users").findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const prediction = await db.collection("predictions").findOne({ id: predictionId });
    if (!prediction) return res.status(404).json({ error: "Prediction not found" });
    
    if (!prediction.price || prediction.price <= 0) return res.json({ message: "Free article" });

    if (user.balance < prediction.price) {
      return res.status(400).json({ error: "余额不足" });
    }

    if (user.purchased && user.purchased.includes(predictionId)) {
       return res.json({ message: "Already purchased" });
    }

    // Atomic-ish update for buyer
    await db.collection("users").updateOne(
      { id: userId }, 
      { 
        $inc: { balance: -prediction.price },
        $addToSet: { purchased: predictionId }
      } as any
    );

    // Author Commission
    const authorUser: any = await db.collection("users").findOne({ isAuthor: true, authorId: prediction.authorId });
    if (authorUser) {
      const revenue = prediction.price * (authorUser.authorCommissionRate || settings.authorCommissionRate || 0.7);
      await db.collection("users").updateOne(
        { id: authorUser.id },
        { 
          $inc: { balance: revenue, totalEarnings: revenue }
        }
      );
      
      await db.collection("transactions").insertOne({
        id: "t" + Date.now() + "author",
        userId: authorUser.id,
        type: 'earnings',
        amount: revenue,
        description: `文章销售权益: ${(prediction.contentTitle || prediction.title).substring(0, 10)}...`,
        time: new Date().toISOString()
      });

      await db.collection("messages").insertOne({
        id: "m" + Date.now() + "author",
        userId: authorUser.id,
        type: 'activity',
        title: '内容收益',
        content: `有人购买了您的方案《${(prediction.contentTitle || prediction.title).substring(0, 10)}...》，您获得收益 ${revenue.toFixed(2)} 元`,
        time: new Date().toISOString()
      });
    }

    // Referrer Commission
    if (user.referrerId) {
      const referrerUser = await db.collection("users").findOne({ id: user.referrerId });
      if (referrerUser) {
        const referralBonus = prediction.price * inviteCommissionRate;
        await db.collection("users").updateOne(
          { id: referrerUser.id },
          { 
            $inc: { balance: referralBonus, totalInvitedEarnings: referralBonus }
          }
        );

        await db.collection("transactions").insertOne({
          id: "t" + Date.now() + "ref",
          userId: referrerUser.id,
          type: 'earnings',
          amount: referralBonus,
          description: `下级消费奖励: ${user.nickname || user.username}`,
          time: new Date().toISOString()
        });

        await db.collection("messages").insertOne({
          id: "m" + Date.now() + "ref",
          userId: referrerUser.id,
          type: 'activity',
          title: '邀请分润',
          content: `您的下级《${user.nickname || user.username}》购买了方案，您获得分润 ${referralBonus.toFixed(2)} 元`,
          time: new Date().toISOString()
        });
      }
    }

    // Log purchase transaction for buyer
    await db.collection("transactions").insertOne({
      id: "t" + Date.now() + "buy",
      userId: user.id,
      type: 'withdraw',
      amount: -prediction.price,
      description: `购买方案: ${(prediction.contentTitle || prediction.title).substring(0, 10)}...`,
      time: new Date().toISOString()
    });

    res.json({ message: "购买成功" });
  });

  app.get("/api/invited-friends", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const friends = await db.collection("users").find({ referrerId: userId }).toArray();
    res.json(friends.map(({ password, ...u }: any) => u));
  });

  app.put("/api/profile", async (req, res) => {
    const { userId } = req.query;
    const updateData = req.body;
    delete updateData._id;
    
    await db.collection("users").updateOne({ id: userId }, { $set: updateData });
    const user = await db.collection("users").findOne({ id: userId });
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // CRUD for Authors
  app.post("/api/admin/authors", async (req, res) => {
    const newAuthor = { ...req.body, id: Date.now().toString() };
    await db.collection("authors").insertOne(newAuthor);
    res.json(newAuthor);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const updateData = req.body;
    delete updateData._id;
    await db.collection("authors").updateOne({ id: req.params.id }, { $set: updateData });
    const author = await db.collection("authors").findOne({ id: req.params.id });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    await db.collection("authors").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  // Predictions actions
  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const authorPredictions = await db.collection("predictions").find({ authorId: req.params.authorId }).toArray();
    res.json(authorPredictions);
  });

  // Predictions management for authors
  app.put("/api/author/predictions/:id", async (req, res) => {
    const updateData = req.body;
    delete updateData._id;
    await db.collection("predictions").updateOne({ id: req.params.id }, { $set: updateData });
    const prediction = await db.collection("predictions").findOne({ id: req.params.id });
    if (prediction) {
      res.json(prediction);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    await db.collection("predictions").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  // CRUD for Predictions (Admin/Dev)
  app.post("/api/admin/predictions", async (req, res) => {
    const { unlockDuration, ...rest } = req.body;
    let unlockAt = null;

    if (unlockDuration) {
      const parts = unlockDuration.split(':').map(Number);
      const now = new Date();
      if (parts.length === 3) {
        now.setHours(now.getHours() + parts[0]);
        now.setMinutes(now.getMinutes() + parts[1]);
        now.setSeconds(now.getSeconds() + parts[2]);
      } else if (parts.length === 2) {
        now.setMinutes(now.getMinutes() + parts[0]);
        now.setSeconds(now.getSeconds() + parts[1]);
      } else if (parts.length === 1) {
        now.setMinutes(now.getMinutes() + parts[0]);
      }
      unlockAt = now.toISOString();
    }

    const newPrediction = { 
      ...rest, 
      id: "p" + Date.now(),
      viewCount: 0,
      time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      unlockAt
    };
    await db.collection("predictions").insertOne(newPrediction);
    res.json(newPrediction);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const { unlockDuration, ...rest } = req.body;
    delete rest._id;
    
    const existingPred = await db.collection("predictions").findOne({ id: req.params.id });
    if (!existingPred) return res.status(404).json({ error: "Prediction not found" });

    let unlockAt = existingPred.unlockAt;

    if (unlockDuration) {
      const parts = unlockDuration.split(':').map(Number);
      const now = new Date();
      if (parts.length === 3) {
        now.setHours(now.getHours() + parts[0]);
        now.setMinutes(now.getMinutes() + parts[1]);
        now.setSeconds(now.getSeconds() + parts[2]);
      } else if (parts.length === 2) {
        now.setMinutes(now.getMinutes() + parts[0]);
        now.setSeconds(now.getSeconds() + parts[1]);
      }
      unlockAt = now.toISOString();
    }

    await db.collection("predictions").updateOne({ id: req.params.id }, { $set: { ...rest, unlockAt } });
    const updatedPred = await db.collection("predictions").findOne({ id: req.params.id });
    res.json(updatedPred);
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    await db.collection("predictions").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions/unlock-all", async (req, res) => {
    await db.collection("predictions").updateMany({}, { $set: { isUnlocked: true } });
    res.json({ message: "Unlocked all" });
  });

  // CRUD for Users
  app.get("/api/admin/users", async (req, res) => {
    const users = await db.collection("users").find().toArray();
    res.json(users.map(({ password, ...u }: any) => u));
  });

  // Applications
  app.post("/api/applications", async (req, res) => {
    const newApp = { 
      ...req.body, 
      id: "app" + Date.now(), 
      status: 'pending',
      time: new Date().toISOString() 
    };
    await db.collection("applications").insertOne(newApp);
    res.json(newApp);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const applications = await db.collection("applications").find().toArray();
    res.json(applications);
  });

  app.delete("/api/admin/applications/:id", async (req, res) => {
    await db.collection("applications").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const application = await db.collection("applications").findOne({ id: req.params.id });
    
    if (application) {
      await db.collection("applications").updateOne({ id: req.params.id }, { $set: { status } });

      // If approved, update user and create author
      if (status === 'approved') {
        const user = await db.collection("users").findOne({ id: application.userId });
        if (user) {
          const authorId = "a" + Date.now();
          await db.collection("users").updateOne({ id: user.id }, { $set: { isAuthor: true, authorId: authorId } });

          // Add to authors collection
          await db.collection("authors").insertOne({
            id: authorId,
            name: user.nickname || user.username,
            avatar: user.avatar,
            fans: 0,
            recentRecord: "新晋作者",
            streak: 0,
            history: [] // New field for red/black records
          });
        }
      }
      res.json({ ...application, status });
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const updateData = req.body;
    delete updateData._id;
    await db.collection("users").updateOne({ id: req.params.id }, { $set: updateData });
    const user = await db.collection("users").findOne({ id: req.params.id });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    await db.collection("users").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const history = await db.collection("history").find().toArray();
    res.json(history);
  });

  app.post("/api/admin/history", async (req, res) => {
    const newItem = { ...req.body, id: "h" + Date.now() };
    await db.collection("history").insertOne(newItem);
    res.json(newItem);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    await db.collection("history").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  // CRUD for Orders
  app.get("/api/admin/orders", async (req, res) => {
    const orders = await db.collection("orders").find().toArray();
    res.json(orders);
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    await db.collection("orders").deleteOne({ id: req.params.id });
    res.json({ message: "Deleted" });
  });

  // Vite middleware for development
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
