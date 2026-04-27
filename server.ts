import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import CryptoJS from "crypto-js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Ensure data directory exists
  const dataDir = path.join(__dirname, "data");
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create data directory", err);
  }

  // Helper to read JSON data
  const readData = async (filename: string) => {
    try {
      const data = await fs.readFile(path.join(__dirname, "data", filename), "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  };

  // Helper to write JSON data
  const writeData = async (filename: string, data: any) => {
    await fs.writeFile(path.join(__dirname, "data", filename), JSON.stringify(data, null, 2), "utf8");
  };

  // API Routes
  app.get("/api/authors", async (req, res) => {
    const authors = await readData("authors.json");
    res.json(authors);
  });

  app.get("/api/authors/:id", async (req, res) => {
    const authors = await readData("authors.json");
    const author = authors.find((a: any) => a.id === req.params.id);
    if (author) {
      res.json(author);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, nickname, referrerId } = req.body;
    const users = await readData("users.json");
    if (users.find((u: any) => u.username === username)) {
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
    users.push(newUser);
    await writeData("users.json", users);
    res.json({ message: "注册成功" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const users = await readData("users.json");
    const user = users.find((u: any) => u.username === username && u.password === password);
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
      const users = await readData("users.json");
      const wechatOpenId = "wx_" + code.substring(0, 10);
      let user = users.find((u: any) => u.wechatOpenId === wechatOpenId);

      if (!user) {
        user = {
          id: "u" + Date.now(),
          username: "wx_" + Date.now(),
          nickname: nickname || ("微信用户_" + Math.floor(Math.random() * 1000)),
          avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          referrer: referrer || null,
          balance: 0.0,
          wechatOpenId: wechatOpenId
        };
        users.push(user);
        await writeData("users.json", users);
      } else if (nickname || avatar) {
        // Update info if provided
        if (nickname) user.nickname = nickname;
        if (avatar) user.avatar = avatar;
        await writeData("users.json", users);
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
    const predictions = await readData("predictions.json");
    res.json(predictions);
  });

  app.get("/api/history", async (req, res) => {
    const history = await readData("history.json");
    res.json(history);
  });

  app.get("/api/predictions/:id", async (req, res) => {
    const predictions = await readData("predictions.json");
    const prediction = predictions.find((p: any) => p.id === req.params.id);
    if (prediction) {
      res.json(prediction);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  // Mock Profile & Auth (Using JSON)
  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const users = await readData("users.json");
    const user = users.find((u: any) => u.id === userId);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      let referrerNickname = "无";
      if (user.referrerId) {
        const referrer = users.find((u: any) => u.id === user.referrerId);
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
    
    let messages = await readData("messages.json");
    
    // Seed messages if empty
    if (messages.length === 0) {
      messages = [
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
      await writeData("messages.json", messages);
    }

    // Filter for specific user or system broadcasts (userId null or 'all')
    const userMessages = messages.filter((m: any) => m.userId === userId || m.userId === 'all');
    res.json(userMessages.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  });

  app.post("/api/admin/messages", async (req, res) => {
    const messages = await readData("messages.json");
    const newMessage = {
      id: "m" + Date.now(),
      time: new Date().toISOString(),
      ...req.body
    };
    messages.push(newMessage);
    await writeData("messages.json", messages);
    res.json(newMessage);
  });

  app.delete("/api/admin/messages/:id", async (req, res) => {
    let messages = await readData("messages.json");
    messages = messages.filter((m: any) => m.id !== req.params.id);
    await writeData("messages.json", messages);
    res.json({ message: "Deleted" });
  });

  // Site Settings APIs
  app.get("/api/settings", async (req, res) => {
    let settings = await readData("settings.json");
    if (Array.isArray(settings) || Object.keys(settings).length === 0) {
      settings = {
        siteName: "智料汇享",
        announcement: "欢迎来到智料汇享平台，为您开启专业数据分析之旅！",
        contactEmail: "admin@example.com",
        defaultUnlockDuration: "01:25:20",
        authorCommissionRate: 0.7, // 70% to author
        inviteCommissionRate: 0.1  // 10% to referrer
      };
      await writeData("settings.json", settings);
    }
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    await writeData("settings.json", req.body);
    res.json({ message: "Settings updated", ...req.body });
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const users = await readData("users.json");
    const user = users.find((u: any) => u.id === userId);
    
    if (user) {
      if (!user.following) user.following = [];
      const index = user.following.indexOf(id);
      let isFollowing = false;
      if (index === -1) {
        user.following.push(id);
        isFollowing = true;
        
        // Add notification for author
        const authorUser = users.find((u: any) => u.isAuthor && u.authorId === id);
        if (authorUser) {
           const messages = await readData("messages.json");
           messages.push({
             id: "m" + Date.now(),
             userId: authorUser.id,
             type: 'follow',
             title: '新增关注',
             content: `${user.nickname || user.username} 关注了你`,
             time: new Date().toISOString()
           });
           await writeData("messages.json", messages);
        }
      } else {
        user.following.splice(index, 1);
        isFollowing = false;
      }
      await writeData("users.json", users);
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
      console.log("Sending request to Yipay:", apiUrl + "/mapi.php", params);
      const response = await axios.post(`${apiUrl}/mapi.php`, new URLSearchParams(params).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log("Yipay response data:", response.data);

      if (response.data.code === 1) {
        // Save order to orders.json for callback matching
        const orders = await readData("orders.json");
        orders.push({
          out_trade_no: outTradeNo,
          userId: userId || "u1", // Default to first user if not provided for dummy
          amount: parseFloat(amount),
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        await writeData("orders.json", orders);
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
    // Implement sign verification
    const { pid, trade_no, out_trade_no, type, name, money, trade_status, sign } = req.query;
    const key = process.env.YIPAY_KEY || "6fXAB353AFl8Pl9779xAO6598lO9b59P";

    console.log("Pay notify received:", req.query);

    // 1. Verify sign
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
      const orders = await readData("orders.json");
      const orderIndex = orders.findIndex((o: any) => o.out_trade_no === out_trade_no);
      
      if (orderIndex !== -1 && orders[orderIndex].status === 'pending') {
        const order = orders[orderIndex];
        order.status = 'completed';
        order.trade_no = trade_no;
        await writeData("orders.json", orders);

        // Update user balance
        const users = await readData("users.json");
        const userIndex = users.findIndex((u: any) => u.id === order.userId);
        if (userIndex !== -1) {
          users[userIndex].balance = (users[userIndex].balance || 0) + order.amount;
          await writeData("users.json", users);

          // Log transaction
          const transactions = await readData("transactions.json");
          transactions.push({
            id: "t" + Date.now(),
            userId: order.userId,
            type: 'recharge',
            amount: order.amount,
            description: '在线充值',
            time: new Date().toISOString()
          });
          await writeData("transactions.json", transactions);

          // Add message
          const messages = await readData("messages.json");
          messages.push({
            id: "m" + Date.now(),
            userId: order.userId,
            type: 'system',
            title: '充值成功',
            content: `您已成功充值 ${order.amount} 元`,
            time: new Date().toISOString()
          });
          await writeData("messages.json", messages);
        }
      }
    }

    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const transactions = await readData("transactions.json");
    const userTransactions = transactions.filter((t: any) => t.userId === userId);
    res.json(userTransactions.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const users = await readData("users.json");
    const user = users.find((u: any) => u.id === userId);
    
    if (user) {
      if (user.balance < amount) {
        return res.status(400).json({ error: "余额不足" });
      }

      user.balance -= amount;
      await writeData("users.json", users);

      const withdrawals = await readData("withdrawals.json");
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
      withdrawals.push(newWithdrawal);
      await writeData("withdrawals.json", withdrawals);

      // Log transaction
      const transactions = await readData("transactions.json");
      transactions.push({
        id: "t" + Date.now(),
        userId: user.id,
        type: 'withdraw',
        amount: -amount,
        description: '申请提现',
        time: new Date().toISOString()
      });
      await writeData("transactions.json", transactions);

      // Add message
      const messages = await readData("messages.json");
      messages.push({
        id: "m" + Date.now(),
        userId: user.id,
        type: 'system',
        title: '提现申请已提交',
        content: `您的 ${amount} 元提现申请已提交，请等待审核`,
        time: new Date().toISOString()
      });
      await writeData("messages.json", messages);

      res.json({ message: "提现申请已提交" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId, userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    
    const settings = await readData("settings.json");
    const authorCommissionRate = settings.authorCommissionRate || 0.7;
    const inviteCommissionRate = settings.inviteCommissionRate || 0.1;

    const users = await readData("users.json");
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const predictions = await readData("predictions.json");
    const prediction = predictions.find((p: any) => p.id === predictionId);
    
    if (!prediction) return res.status(404).json({ error: "Prediction not found" });
    if (!prediction.price || prediction.price <= 0) return res.json({ message: "Free article" });

    if (user.balance < prediction.price) {
      return res.status(400).json({ error: "余额不足" });
    }

    // Deduct from buyer
    user.balance -= prediction.price;
    if (!user.purchased) user.purchased = [];
    if (!user.purchased.includes(predictionId)) {
       user.purchased.push(predictionId);
    } else {
       return res.json({ message: "Already purchased" });
    }

    const transactions = await readData("transactions.json");
    const messages = await readData("messages.json");

    // Author Commission
    const authorUser = users.find((u: any) => u.isAuthor && u.authorId === prediction.authorId);
    if (authorUser) {
      const revenue = prediction.price * authorCommissionRate;
      authorUser.balance = (authorUser.balance || 0) + revenue;
      authorUser.totalEarnings = (authorUser.totalEarnings || 0) + revenue;
      
      transactions.push({
        id: "t" + Date.now() + "author",
        userId: authorUser.id,
        type: 'earnings',
        amount: revenue,
        description: `文章销售权益: ${prediction.contentTitle.substring(0, 10)}...`,
        time: new Date().toISOString()
      });

      messages.push({
        id: "m" + Date.now() + "author",
        userId: authorUser.id,
        type: 'activity',
        title: '内容收益',
        content: `有人购买了您的方案《${prediction.contentTitle.substring(0, 10)}...》，您获得收益 ${revenue.toFixed(2)} 元`,
        time: new Date().toISOString()
      });
    }

    // Referrer Commission
    if (user.referrerId) {
      const referrerUser = users.find((u: any) => u.id === user.referrerId);
      if (referrerUser) {
        const referralBonus = prediction.price * inviteCommissionRate;
        referrerUser.balance = (referrerUser.balance || 0) + referralBonus;
        referrerUser.totalInvitedEarnings = (referrerUser.totalInvitedEarnings || 0) + referralBonus;

        transactions.push({
          id: "t" + Date.now() + "ref",
          userId: referrerUser.id,
          type: 'earnings',
          amount: referralBonus,
          description: `下级消费奖励: ${user.nickname || user.username}`,
          time: new Date().toISOString()
        });

        messages.push({
          id: "m" + Date.now() + "ref",
          userId: referrerUser.id,
          type: 'activity',
          title: '邀请分润',
          content: `您的下级《${user.nickname || user.username}》购买了方案，您获得分润 ${referralBonus.toFixed(2)} 元`,
          time: new Date().toISOString()
        });
      }
    }

    await writeData("users.json", users);
    await writeData("transactions.json", transactions);
    await writeData("messages.json", messages);

    // Log purchase transaction for buyer
    const buyerTransactions = await readData("transactions.json");
    buyerTransactions.push({
      id: "t" + Date.now() + "buy",
      userId: user.id,
      type: 'withdraw',
      amount: -prediction.price,
      description: `购买方案: ${prediction.contentTitle.substring(0, 10)}...`,
      time: new Date().toISOString()
    });
    await writeData("transactions.json", buyerTransactions);

    res.json({ message: "购买成功" });
  });

  app.get("/api/invited-friends", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const users = await readData("users.json");
    const friends = users.filter((u: any) => u.referrerId === userId);
    res.json(friends.map(({ password, ...u }: any) => u));
  });

  app.put("/api/profile", async (req, res) => {
    const { userId } = req.query;
    const users = await readData("users.json");
    const index = users.findIndex((u: any) => u.id === userId) || (users.length > 0 ? 0 : -1);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body };
      await writeData("users.json", users);
      const { password, ...userWithoutPassword } = users[index];
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // CRUD for Authors
  app.post("/api/admin/authors", async (req, res) => {
    const authors = await readData("authors.json");
    const newAuthor = { ...req.body, id: Date.now().toString() };
    authors.push(newAuthor);
    await writeData("authors.json", authors);
    res.json(newAuthor);
  });

  app.put("/api/admin/authors/:id", async (req, res) => {
    const authors = await readData("authors.json");
    const index = authors.findIndex((a: any) => a.id === req.params.id);
    if (index !== -1) {
      authors[index] = { ...authors[index], ...req.body };
      await writeData("authors.json", authors);
      res.json(authors[index]);
    } else {
      res.status(404).json({ error: "Author not found" });
    }
  });

  app.delete("/api/admin/authors/:id", async (req, res) => {
    let authors = await readData("authors.json");
    authors = authors.filter((a: any) => a.id !== req.params.id);
    await writeData("authors.json", authors);
    res.json({ message: "Deleted" });
  });

  // Predictions actions
  app.get("/api/author/predictions/:authorId", async (req, res) => {
    const predictions = await readData("predictions.json");
    const authorPredictions = predictions.filter((p: any) => p.authorId === req.params.authorId);
    res.json(authorPredictions);
  });

  // Predictions management for authors
  app.put("/api/author/predictions/:id", async (req, res) => {
    const predictions = await readData("predictions.json");
    const index = predictions.findIndex((p: any) => p.id === req.params.id);
    if (index !== -1) {
      // In a real app, verify user owns this prediction
      predictions[index] = { ...predictions[index], ...req.body, id: req.params.id };
      await writeData("predictions.json", predictions);
      res.json(predictions[index]);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.delete("/api/author/predictions/:id", async (req, res) => {
    // In a real app, verify user owns this prediction
    let predictions = await readData("predictions.json");
    predictions = predictions.filter((p: any) => p.id !== req.params.id);
    await writeData("predictions.json", predictions);
    res.json({ message: "Deleted" });
  });

  // CRUD for Predictions (Admin/Dev)
  app.post("/api/admin/predictions", async (req, res) => {
    const predictions = await readData("predictions.json");
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
    predictions.push(newPrediction);
    await writeData("predictions.json", predictions);
    res.json(newPrediction);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await readData("predictions.json");
    const index = predictions.findIndex((p: any) => p.id === req.params.id);
    if (index !== -1) {
      const { unlockDuration, ...rest } = req.body;
      let unlockAt = predictions[index].unlockAt;

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

      predictions[index] = { ...predictions[index], ...rest, id: req.params.id, unlockAt };
      await writeData("predictions.json", predictions);
      res.json(predictions[index]);
    } else {
      res.status(404).json({ error: "Prediction not found" });
    }
  });

  app.delete("/api/admin/predictions/:id", async (req, res) => {
    let predictions = await readData("predictions.json");
    predictions = predictions.filter((p: any) => p.id !== req.params.id);
    await writeData("predictions.json", predictions);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/predictions/unlock-all", async (req, res) => {
    const predictions = await readData("predictions.json");
    predictions.forEach((p: any) => {
      p.isUnlocked = true;
    });
    await writeData("predictions.json", predictions);
    res.json({ message: "Unlocked all" });
  });

  // CRUD for Users
  app.get("/api/admin/users", async (req, res) => {
    const users = await readData("users.json");
    res.json(users.map(({ password, ...u }: any) => u));
  });

  // Applications
  app.post("/api/applications", async (req, res) => {
    const applications = await readData("applications.json");
    const newApp = { 
      ...req.body, 
      id: "app" + Date.now(), 
      status: 'pending',
      time: new Date().toISOString() 
    };
    applications.push(newApp);
    await writeData("applications.json", applications);
    res.json(newApp);
  });

  app.get("/api/admin/applications", async (req, res) => {
    const applications = await readData("applications.json");
    res.json(applications);
  });

  app.delete("/api/admin/applications/:id", async (req, res) => {
    let applications = await readData("applications.json");
    applications = applications.filter((a: any) => a.id !== req.params.id);
    await writeData("applications.json", applications);
    res.json({ message: "Deleted" });
  });

  app.put("/api/admin/applications/:id", async (req, res) => {
    const { status } = req.body;
    const applications = await readData("applications.json");
    const index = applications.findIndex((a: any) => a.id === req.params.id);
    if (index !== -1) {
      applications[index].status = status;
      await writeData("applications.json", applications);

      // If approved, update user and create author
      if (status === 'approved') {
        const users = await readData("users.json");
        const userIndex = users.findIndex((u: any) => u.id === applications[index].userId);
        if (userIndex !== -1) {
          const authorId = "a" + Date.now();
          users[userIndex].isAuthor = true;
          users[userIndex].authorId = authorId;
          await writeData("users.json", users);

          // Add to authors.json
          const authors = await readData("authors.json");
          authors.push({
            id: authorId,
            name: users[userIndex].nickname || users[userIndex].username,
            avatar: users[userIndex].avatar,
            fans: 0,
            recentRecord: "新晋作者",
            streak: 0,
            history: [] // New field for red/black records
          });
          await writeData("authors.json", authors);
        }
      }
      res.json(applications[index]);
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    const users = await readData("users.json");
    const index = users.findIndex((u: any) => u.id === req.params.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body };
      await writeData("users.json", users);
      res.json(users[index]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    let users = await readData("users.json");
    users = users.filter((u: any) => u.id !== req.params.id);
    await writeData("users.json", users);
    res.json({ message: "Deleted" });
  });

  app.get("/api/admin/history", async (req, res) => {
    const history = await readData("history.json");
    res.json(history);
  });

  app.post("/api/admin/history", async (req, res) => {
    const history = await readData("history.json");
    const newItem = { ...req.body, id: "h" + Date.now() };
    history.push(newItem);
    await writeData("history.json", history);
    res.json(newItem);
  });

  app.delete("/api/admin/history/:id", async (req, res) => {
    let history = await readData("history.json");
    history = history.filter((h: any) => h.id !== req.params.id);
    await writeData("history.json", history);
    res.json({ message: "Deleted" });
  });

  // CRUD for Orders
  app.get("/api/admin/orders", async (req, res) => {
    const orders = await readData("orders.json");
    res.json(orders);
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    let orders = await readData("orders.json");
    orders = orders.filter((o: any) => o.id !== req.params.id);
    await writeData("orders.json", orders);
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
