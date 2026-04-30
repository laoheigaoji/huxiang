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

  const mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  let db: any;
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB, falling back to mock DB behavior", err);
    // Create a mock db object that warns or uses memory?
    // For now, let's just ensure the server starts.
  }

  // Middleware to ensure DB is available or send error
  const checkDb = (req: any, res: any, next: any) => {
    if (!db) {
      return res.status(503).json({ error: "Database not connected. Please check MONGODB_URI or server logs." });
    }
    next();
  };

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", dbConnected: !!db });
  });

  // Migration logic (run once if users is empty)
  if (db) {
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
  }

  // Helper for async errors
  const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // API Routes
  app.get("/api/authors", checkDb, asyncHandler(async (req: any, res: any) => {
    const authors = await db.collection("authors").find().toArray();
    res.json(authors);
  }));

  app.get("/api/authors/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const author = await db.collection("authors").findOne({ id: req.params.id });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  }));

  app.post("/api/register", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  app.post("/api/login", checkDb, asyncHandler(async (req: any, res: any) => {
    const { username, password } = req.body;
    const user = await db.collection("users").findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  app.post("/api/wechat-login", checkDb, asyncHandler(async (req: any, res: any) => {
    const { code, nickname, avatar, referrerId, referrer } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
      let wechatOpenId = "wx_" + code.substring(0, 10);
      let wechatNickname = nickname;
      let wechatAvatar = avatar;

      // Exchange code for real OpenID and UserInfo
      const settings: any = (await db.collection("settings").findOne({})) || {};
      const appId = settings.wechatAppId || "wxf0ea7bb3386e9d01";
      const appSecret = settings.wechatAppSecret || "2f7272be6bac718a0e09c393dce8c5aa";

      if (appSecret) {
        try {
          const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
          const tokenResponse = await axios.get(tokenUrl);
          
          if (tokenResponse.data && tokenResponse.data.access_token && tokenResponse.data.openid) {
            wechatOpenId = tokenResponse.data.openid;
            const accessToken = tokenResponse.data.access_token;

            const userUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${wechatOpenId}&lang=zh_CN`;
            const userResponse = await axios.get(userUrl);

            if (userResponse.data && !userResponse.data.errcode) {
              wechatNickname = userResponse.data.nickname || wechatNickname;
              wechatAvatar = userResponse.data.headimgurl || wechatAvatar;
            }
          }
        } catch (wechatErr: any) {
          console.error("Wechat API request failed:", wechatErr.message);
        }
      }

      let user = await db.collection("users").findOne({ wechatOpenId });

      if (!user) {
        const mockNames = ['追梦人', '风起云涌', '岁月静好', '星辰大海', '浅笑安然', '时光荏苒', '落日余晖', '晨曦微露', '听风挽笑', '一叶知秋'];
        const randomName = mockNames[Math.floor(Math.random() * mockNames.length)] + '_' + Math.floor(Math.random() * 999);
        const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${wechatOpenId}`;
        
        user = {
          id: "u" + Date.now(),
          username: "wx_" + Date.now(),
          nickname: wechatNickname || randomName,
          avatar: wechatAvatar || randomAvatar,
          referrerId: referrerId || referrer || null,
          balance: 0.0,
          wechatOpenId: wechatOpenId
        } as any;
        await db.collection("users").insertOne(user);
      } else {
        const update: any = {};
        if (wechatNickname) update.nickname = wechatNickname;
        if (wechatAvatar && wechatAvatar !== '') update.avatar = wechatAvatar;
        if (!user.referrerId && (referrerId || referrer)) {
           update.referrerId = referrerId || referrer;
        }
        
        if (Object.keys(update).length > 0) {
            await db.collection("users").updateOne({ id: user.id }, { $set: update });
            user = { ...user, ...update };
        }
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Wechat login error:", error);
      res.status(500).json({ error: "服务器内部错误" });
    }
  }));

  app.post("/api/logout", (req: any, res: any) => {
    res.json({ message: "已退出登录" });
  });

  app.get("/api/predictions", checkDb, asyncHandler(async (req: any, res: any) => {
    const predictions = await db.collection("predictions").find().toArray();
    res.json(predictions);
  }));

  app.get("/api/history", checkDb, asyncHandler(async (req: any, res: any) => {
    const history = await db.collection("history").find().toArray();
    res.json(history);
  }));

  app.get("/api/predictions/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const prediction = await db.collection("predictions").findOne({ id: req.params.id });
    if (prediction) {
      res.json(prediction);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  }));

  app.post("/api/predictions/:id/public", checkDb, asyncHandler(async (req: any, res: any) => {
    await db.collection("predictions").updateOne({ id: req.params.id }, { $set: { isUnlocked: true, status: 'public' } });
    res.json({ message: "marked as public" });
  }));

  app.get("/api/purchased-predictions", checkDb, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const user = await db.collection("users").findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const purchasedIds = user.purchased || [];
    const predictions = await db.collection("predictions").find({ id: { $in: purchasedIds } }).toArray();
    res.json(predictions);
  }));

  app.get("/api/profile", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  app.get("/api/messages", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  app.post("/api/admin/messages", checkDb, asyncHandler(async (req: any, res: any) => {
    const newMessage = {
      id: "m" + Date.now(),
      time: new Date().toISOString(),
      ...req.body
    };
    await db.collection("messages").insertOne(newMessage);
    res.json(newMessage);
  }));

  app.delete("/api/admin/messages/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("messages").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.get("/api/settings", checkDb, asyncHandler(async (req: any, res: any) => {
    let settings: any = await db.collection("settings").findOne({});
    if (!settings) {
      settings = {
        siteName: "智料汇享",
        announcement: "欢迎来到智料汇享平台，为您开启专业数据分析之旅！",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7, // 70% to author
        inviteCommissionRate: 0.1,  // 10% to referrer
        yipayPid: "1000",
        yipayKey: "6fXAB353AFl8Pl9779xAO6598lO9b59P",
        yipayApiUrl: "http://yzf.dypm.top/",
        wechatAppId: "wxf0ea7bb3386e9d01",
        wechatAppSecret: "2f7272be6bac718a0e09c393dce8c5aa",
        wechatAuthUrl: "" // 新增微信授权入口配置 (支持无限回调地址)
      };
      await db.collection("settings").insertOne(settings);
    }
    const { adminPassword, yipayKey, wechatAppSecret, ...safeSettings } = settings;
    res.json(safeSettings);
  }));

  app.get("/api/config", checkDb, asyncHandler(async (req: any, res: any) => {
    let settings: any = await db.collection("settings").findOne({});
    if (!settings) return res.json({ wechatAppId: "wxf0ea7bb3386e9d01" });
    res.json({ 
      wechatAppId: settings.wechatAppId || "wxf0ea7bb3386e9d01",
      wechatAuthUrl: settings.wechatAuthUrl || "", // 暴露授权URL
      siteName: settings.siteName || "智料汇享"
    });
  }));

  app.post("/api/admin/login", checkDb, asyncHandler(async (req: any, res: any) => {
    const { username, password } = req.body;
    let settings: any = await db.collection("settings").findOne({});
    const validPass = settings?.adminPassword || 'admin888';
    
    if (username === 'admin' && password === validPass) {
       res.json({ success: true, token: 'admin_token' });
    } else {
       res.status(401).json({ error: '账号或密码错误' });
    }
  }));

  app.put("/api/settings", checkDb, asyncHandler(async (req: any, res: any) => {
    const settings = req.body;
    delete settings._id; // Remove _id to avoid immutable error
    if (settings.adminPassword === "") {
        delete settings.adminPassword; // Don't wipe if empty string sent
    }
    await db.collection("settings").updateOne({}, { $set: settings }, { upsert: true });
    res.json({ message: "Settings updated" });
  }));

  app.post("/api/authors/follow/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await db.collection("users").findOne({ id: userId });
    
    if (user) {
      const following = (user as any).following || [];
      const index = following.indexOf(id);
      let isFollowing = false;
      let incValue = 0;
      
      if (index === -1) {
        await db.collection("users").updateOne({ id: userId }, { $push: { following: id } } as any);
        isFollowing = true;
        incValue = 1;
        
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
        incValue = -1;
      }

      // Update author's fans count in authors collection
      await db.collection("authors").updateOne({ id: id }, { $inc: { fans: incValue } });
      
      // Update denormalized authorFans in predictions collection
      await db.collection("predictions").updateMany({ authorId: id }, { $inc: { authorFans: incValue } });

      res.json({ isFollowing });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  }));

  app.post("/api/pay/create", checkDb, asyncHandler(async (req: any, res: any) => {
    const { amount, type, orderName, userId, predictionId, returnUrl: customReturnUrl } = req.body;
    
    const settings: any = (await db.collection("settings").findOne({})) || {};
    const pid = settings.yipayPid || process.env.YIPAY_PID || "1000";
    const key = settings.yipayKey || process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";
    const apiUrl = (settings.yipayApiUrl || process.env.YIPAY_API_URL || "http://yzf.dypm.top/").replace(/\/$/, "");
    
    const outTradeNo = Date.now().toString() + Math.floor(Math.random() * 1000);
    const notifyUrl = `https://${req.get('host')}/api/pay/notify`;
    const returnUrl = customReturnUrl || `https://${req.get('host')}/top-up?status=success`;
    
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
      console.log('Sending payment request to YiPay:', { apiUrl, params });
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log('YiPay response:', response.data);

      if (response.data.code === 1) {
        await db.collection("orders").insertOne({
          out_trade_no: outTradeNo,
          userId: userId || "u1",
          amount: parseFloat(amount),
          predictionId: predictionId || null,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }

      res.json(response.data);
    } catch (error: any) {
      console.error("Yipay request error:", error.message);
      res.status(500).json({ error: "支付请求失败", details: error.message });
    }
  }));

  app.get("/api/pay/notify", checkDb, asyncHandler(async (req: any, res: any) => {
    const { pid, trade_no, out_trade_no, type, name, money, trade_status, sign } = req.query;
    
    const settings: any = (await db.collection("settings").findOne({})) || {};
    const key = settings.yipayKey || process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";

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

        // AUTO PURCHASE
        if (order.predictionId) {
          try {
            const user = await db.collection("users").findOne({ id: order.userId });
            const prediction = await db.collection("predictions").findOne({ id: order.predictionId });
            const settings: any = (await db.collection("settings").findOne({})) || {};
            
            if (user && prediction && user.balance >= prediction.price && (!user.purchased || !user.purchased.includes(prediction.id))) {
                await db.collection("users").updateOne(
                    { id: user.id }, 
                    { 
                      $inc: { balance: -prediction.price },
                      $addToSet: { purchased: prediction.id }
                    } as any
                );

                const authorUser: any = await db.collection("users").findOne({ isAuthor: true, authorId: prediction.authorId });
                if (authorUser) {
                    const revenue = prediction.price * (authorUser.authorCommissionRate || settings.authorCommissionRate || 0.7);
                    await db.collection("users").updateOne({ id: authorUser.id }, { $inc: { balance: revenue, totalEarnings: revenue } });
                    await db.collection("transactions").insertOne({
                        id: "t" + Date.now() + "auto_a",
                        userId: authorUser.id,
                        type: 'earnings',
                        amount: revenue,
                        description: `自动分润: ${prediction.title}`,
                        time: new Date().toISOString()
                    });
                }

                // Log purchase transaction for buyer
                await db.collection("transactions").insertOne({
                    id: "t" + Date.now() + "auto_b",
                    userId: user.id,
                    type: 'withdraw',
                    amount: -prediction.price,
                    description: `自动购买方案: ${prediction.title}`,
                    time: new Date().toISOString()
                });

                await db.collection("messages").insertOne({
                    id: "m" + Date.now() + "auto",
                    userId: user.id,
                    type: 'system',
                    title: '自动解锁成功',
                    content: `方案《${prediction.title}》已自动为您解锁`,
                    time: new Date().toISOString()
                });
            }
          } catch (e) { console.error("Auto purchase err:", e); }
        }
      }
    }

    res.send("success");
  }));

  app.get("/api/transactions", checkDb, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const transactions = await db.collection("transactions").find({ userId }).toArray();
    res.json(transactions.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  }));

  app.post("/api/withdraw", checkDb, asyncHandler(async (req: any, res: any) => {
    const { amount, account, name, type, userId, bankName } = req.body;
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
        bankName,
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
  }));

  app.post("/api/purchase", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  app.get("/api/invited-friends", checkDb, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const friends = await db.collection("users").find({ referrerId: userId }).toArray();
    res.json(friends.map(({ password, ...u }: any) => u));
  }));

  app.put("/api/profile", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  // Proxy for Short Link API (to fix CORS)
  app.post("/api/proxy/add", checkDb, asyncHandler(async (req: any, res: any) => {
    const SHORTLINK_API_KEY = 'a57585f9fcfd145d8aff69aeec45805c';
    try {
        const response = await axios.post('https://link.rfseo.cn/api/url/add', req.body, {
            headers: {
                'Authorization': `Bearer ${SHORTLINK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error("Proxy error:", error.message);
        res.status(500).json({ error: "Failed to connect to shortlink service", details: error.message });
    }
  }));

  // Image Proxy
  app.get("/api/proxy/image", checkDb, asyncHandler(async (req: any, res: any) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).json({ error: "URL is required" });
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(Buffer.from(response.data, 'binary'));
    } catch (error: any) {
        console.error("Image proxy error:", error.message);
        res.status(500).json({ error: "Failed to fetch image" });
    }
  }));

  app.post("/api/transfer-code/generate", checkDb, asyncHandler(async (req: any, res: any) => {
    const { userId, name, cardNo, bankMark } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const user = await db.collection("users").findOne({ id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const settings = await db.collection("settings").findOne({}) || {};
    const price = parseFloat(settings.transferCodePrice || "2");

    if (user.balance < price) return res.status(400).json({ error: `余额不足 (需要 ${price} 元)` });

    await db.collection("users").updateOne({ id: userId }, { $inc: { balance: -price } });

    const innerQuery = new URLSearchParams({ actionType: 'toCard', sourceId: 'bill', bankAccount: name, cardNo, bankMark }).toString();
    const targetUrl = `https://ds.alipay.com/?scheme=${encodeURIComponent(`alipays://platformapi/startapp?appId=09999988&${innerQuery}`)}`;
    const finalUrl = `https://render.alipay.com/p/s/i/?scheme=${encodeURIComponent(`alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(targetUrl)}`)}`;

    const SHORTLINK_API_KEY = 'a57585f9fcfd145d8aff69aeec45805c';
    const linkResponse = await axios.post('https://link.rfseo.cn/api/url/add', { url: finalUrl }, {
        headers: { 'Authorization': `Bearer ${SHORTLINK_API_KEY}`, 'Content-Type': 'application/json' }
    });

    const shortUrl = linkResponse.data.shorturl;
    const historyItem = {
        userId,
        name,
        cardNo,
        shortUrl,
        createdAt: new Date().toISOString()
    };
    await db.collection("transferCodeHistory").insertOne(historyItem);
    
    // Log the transaction
    await db.collection("transactions").insertOne({
        id: "t" + Date.now(),
        userId,
        type: 'withdraw',
        amount: -price,
        description: '转卡码生成',
        time: new Date().toISOString()
    });

    res.json(historyItem);
  }));

  app.get("/api/transfer-code/history", checkDb, asyncHandler(async (req: any, res: any) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const history = await db.collection("transferCodeHistory").find({ userId }).sort({ createdAt: -1 }).toArray();
    res.json(history);
  }));

  // CRUD for Authors
  app.post("/api/admin/authors", checkDb, asyncHandler(async (req: any, res: any) => {
    const newAuthor = { ...req.body, id: Date.now().toString() };
    await db.collection("authors").insertOne(newAuthor);
    res.json(newAuthor);
  }));

  app.put("/api/admin/authors/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const updateData = req.body;
    delete updateData._id;
    await db.collection("authors").updateOne({ id: req.params.id }, { $set: updateData });
    const author = await db.collection("authors").findOne({ id: req.params.id });
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  }));

  app.delete("/api/admin/authors/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("authors").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.get("/api/author/predictions/:authorId", checkDb, asyncHandler(async (req: any, res: any) => {
    const authorPredictions = await db.collection("predictions").find({ authorId: req.params.authorId }).toArray();
    res.json(authorPredictions);
  }));

  // Predictions management for authors
  app.put("/api/author/predictions/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const updateData = req.body;
    const { id } = req.params;
    delete updateData._id;

    const existingPred = await db.collection("predictions").findOne({ id });
    if (!existingPred) return res.status(404).json({ error: "Prediction not found" });

    // Handle unlockDuration change
    if (updateData.unlockDuration && updateData.unlockDuration !== existingPred.unlockDuration) {
      const parts = updateData.unlockDuration.split(':').map(Number);
      const now = new Date();
      if (parts.length === 3) {
        now.setHours(now.getHours() + parts[0]);
        now.setMinutes(now.getMinutes() + parts[1]);
        now.setSeconds(now.getSeconds() + parts[2]);
      } else if (parts.length === 2) {
        now.setMinutes(now.getMinutes() + parts[0]);
        now.setSeconds(now.getSeconds() + parts[1]);
      }
      updateData.unlockAt = now.toISOString();
    } else {
      // Preserve existing unlockAt if duration didn't change
      updateData.unlockAt = existingPred.unlockAt;
    }

    // Always preserve original publication time during edit
    updateData.time = existingPred.time;

    await db.collection("predictions").updateOne({ id }, { $set: updateData });
    const prediction = await db.collection("predictions").findOne({ id });
    res.json(prediction);
  }));

  app.delete("/api/author/predictions/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("predictions").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  // CRUD for Predictions (Admin/Dev)
  app.post("/api/admin/predictions", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  app.put("/api/admin/predictions/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const { unlockDuration, ...rest } = req.body;
    const { id } = req.params;
    delete rest._id;
    
    const existingPred = await db.collection("predictions").findOne({ id });
    if (!existingPred) return res.status(404).json({ error: "Prediction not found" });

    let unlockAt = existingPred.unlockAt;

    if (unlockDuration && unlockDuration !== existingPred.unlockDuration) {
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

    // Preserve original publication time
    const time = existingPred.time;

    await db.collection("predictions").updateOne({ id }, { $set: { ...rest, unlockAt, time } });
    const updatedPred = await db.collection("predictions").findOne({ id });
    res.json(updatedPred);
  }));

  app.delete("/api/admin/predictions/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("predictions").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.post("/api/admin/predictions/unlock-all", checkDb, asyncHandler(async (req: any, res: any) => {
    await db.collection("predictions").updateMany({}, { $set: { isUnlocked: true } });
    res.json({ message: "Unlocked all" });
  }));

  // CRUD for Users
  app.get("/api/admin/users", checkDb, asyncHandler(async (req: any, res: any) => {
    const users = await db.collection("users").find().toArray();
    res.json(users.map(({ password, ...u }: any) => u));
  }));

  // Applications
  app.post("/api/applications", checkDb, asyncHandler(async (req: any, res: any) => {
    const newApp = { 
      ...req.body, 
      id: "app" + Date.now(), 
      status: 'pending',
      time: new Date().toISOString() 
    };
    await db.collection("applications").insertOne(newApp);
    res.json(newApp);
  }));

  app.get("/api/admin/applications", checkDb, asyncHandler(async (req: any, res: any) => {
    const applications = await db.collection("applications").find().toArray();
    res.json(applications);
  }));

  app.delete("/api/admin/applications/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("applications").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.put("/api/admin/applications/:id", checkDb, asyncHandler(async (req: any, res: any) => {
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
  }));

  // Admin Withdrawals
  app.get("/api/admin/withdrawals", checkDb, asyncHandler(async (req: any, res: any) => {
    const withdrawals = await db.collection("withdrawals").find().sort({ time: -1 }).toArray();
    res.json(withdrawals.map(w => ({ ...w, id: w.id || w._id.toString() })));
  }));

  app.put("/api/admin/withdrawals/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const { status } = req.body;
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    
    const withdrawal = await db.collection("withdrawals").findOne({ $or: queryArgs });
    
    if (withdrawal && withdrawal.status === 'pending') {
      await db.collection("withdrawals").updateOne({ _id: withdrawal._id }, { $set: { status } });
      
      // If rejected, refund the user
      if (status === 'rejected') {
         await db.collection("users").updateOne({ id: withdrawal.userId }, { $inc: { balance: withdrawal.amount } });
         await db.collection("transactions").insertOne({
            id: "t" + Date.now() + "rf",
            userId: withdrawal.userId,
            type: 'earnings',
            amount: withdrawal.amount,
            description: '提现失败退回',
            time: new Date().toISOString()
         });
         await db.collection("messages").insertOne({
            id: "m" + Date.now() + "rf",
            userId: withdrawal.userId,
            type: 'system',
            title: '提现被拦截',
            content: `您的提现申请已被拒绝，已退回至余额。金额：¥${withdrawal.amount}`,
            time: new Date().toISOString()
         });
      } else if (status === 'approved') {
         await db.collection("messages").insertOne({
            id: "m" + Date.now() + "ap",
            userId: withdrawal.userId,
            type: 'system',
            title: '提现成功通知',
            content: `您的提现申请已通过审核，提现金额：¥${withdrawal.amount}已打款至您的账户，请注意查收。`,
            time: new Date().toISOString()
         });
      }
      res.json({ message: "Updated" });
    } else {
      res.status(400).json({ error: "Invalid withdrawal or status" });
    }
  }));

  // Feedback
  app.post("/api/feedback", checkDb, asyncHandler(async (req: any, res: any) => {
    const newFeedback = {
      ...req.body,
      id: "fb" + Date.now(),
      time: new Date().toISOString()
    };
    await db.collection("feedbacks").insertOne(newFeedback);
    res.json(newFeedback);
  }));

  app.get("/api/admin/feedbacks", checkDb, asyncHandler(async (req: any, res: any) => {
    const feedbacks = await db.collection("feedbacks").find().sort({ time: -1 }).toArray();
    res.json(feedbacks.map(fb => ({ ...fb, id: fb.id || fb._id.toString() })));
  }));

  app.delete("/api/admin/feedbacks/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("feedbacks").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.put("/api/admin/users/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    const updateData = req.body;
    delete updateData._id;
    await db.collection("users").updateOne({ id: req.params.id }, { $set: updateData });
    const user = await db.collection("users").findOne({ id: req.params.id });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  }));

  app.delete("/api/admin/users/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("users").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  app.get("/api/admin/history", checkDb, asyncHandler(async (req: any, res: any) => {
    const history = await db.collection("history").find().toArray();
    res.json(history);
  }));

  app.post("/api/admin/history", checkDb, asyncHandler(async (req: any, res: any) => {
    const newItem = { ...req.body, id: "h" + Date.now() };
    await db.collection("history").insertOne(newItem);
    res.json(newItem);
  }));

  app.delete("/api/admin/history/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("history").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

  // CRUD for Orders
  app.get("/api/admin/orders", checkDb, asyncHandler(async (req: any, res: any) => {
    const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();
    const populatedOrders = await Promise.all(orders.map(async (o: any) => {
      const user = await db.collection("users").findOne({ id: o.userId });
      let prediction = null;
      if (o.predictionId) {
        prediction = await db.collection("predictions").findOne({ id: o.predictionId });
      }
      return {
        id: o.id || o._id.toString(),
        userId: o.userId,
        username: user ? (user.nickname || user.username) : "未知用户",
        amount: o.amount,
        predictionTitle: prediction ? prediction.title : "账户余额充值",
        time: o.createdAt || o.time,
        status: o.status,
        outTradeNo: o.out_trade_no
      };
    }));
    res.json(populatedOrders);
  }));

  app.delete("/api/admin/orders/:id", checkDb, asyncHandler(async (req: any, res: any) => {
    let queryArgs: any[] = [{ id: req.params.id }];
    if (ObjectId.isValid(req.params.id)) queryArgs.push({ _id: new ObjectId(req.params.id) });
    await db.collection("orders").deleteOne({ $or: queryArgs });
    res.json({ message: "Deleted" });
  }));

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

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
