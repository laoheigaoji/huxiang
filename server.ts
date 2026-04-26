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

  app.use(express.json());

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
    const { username, password, nickname } = req.body;
    const users = await readData("users.json");
    if (users.find((u: any) => u.username === username)) {
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
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
      // In a real environment, you'd exchange code for access_token and openid with WeChat
      // Since this is a demo/mock, we simulate it.
      // Usually: GET https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=code&grant_type=authorization_code
      
      const users = await readData("users.json");
      // Simulate finding or creating a wechat user
      const wechatOpenId = "wx_" + code.substring(0, 10);
      let user = users.find((u: any) => u.wechatOpenId === wechatOpenId);

      if (!user) {
        user = {
          id: "u" + Date.now(),
          username: "wx_" + Date.now(),
          nickname: "微信用户_" + Math.floor(Math.random() * 1000),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          balance: 100.0,
          wechatOpenId: wechatOpenId
        };
        users.push(user);
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
    // In a real app, you'd check a session/token. 
    // Here we just return the first user for demo purposes or a mock.
    const users = await readData("users.json");
    if (users.length > 0) {
      const { password, ...user } = users[0];
      res.json(user);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/authors/follow/:id", async (req, res) => {
    const { id } = req.params;
    const users = await readData("users.json");
    if (users.length > 0) {
      const user = users[0];
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
        }
      }
    }

    res.send("success");
  });

  app.get("/api/transactions", async (req, res) => {
    const transactions = await readData("transactions.json");
    // For demo, return transactions for the first user
    const users = await readData("users.json");
    if (users.length > 0) {
      const userTransactions = transactions.filter((t: any) => t.userId === users[0].id);
      res.json(userTransactions);
    } else {
      res.json([]);
    }
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, account, name, type } = req.body;
    const users = await readData("users.json");
    if (users.length > 0) {
      const user = users[0];
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

      res.json({ message: "提现申请已提交" });
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/purchase", async (req, res) => {
    const { predictionId } = req.body;
    const users = await readData("users.json");
    if (users.length === 0) return res.status(401).json({ error: "Unauthorized" });
    
    const user = users[0]; // Demo: current user is the first user
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
    user.purchased.push(predictionId);

    // Add to author (using authorId to find the corresponding user if exists)
    const authors = await readData("authors.json");
    const author = authors.find((a: any) => a.id === prediction.authorId);
    
    // Find the user who is this author
    const authorUser = users.find((u: any) => u.isAuthor && u.authorId === prediction.authorId);
    if (authorUser) {
      const revenue = prediction.price * 0.7; // 70% commission for author
      authorUser.balance = (authorUser.balance || 0) + revenue;
      authorUser.totalEarnings = (authorUser.totalEarnings || 0) + revenue;
      
      // Log earnings transaction for author
      const transactions = await readData("transactions.json");
      transactions.push({
        id: "t" + Date.now() + "rev",
        userId: authorUser.id,
        type: 'earnings',
        amount: revenue,
        description: `文章销售权益: ${prediction.contentTitle.substring(0, 10)}...`,
        time: new Date().toISOString()
      });
      await writeData("transactions.json", transactions);
    }

    await writeData("users.json", users);

    // Log purchase transaction for buyer
    const transactions = await readData("transactions.json");
    transactions.push({
      id: "t" + Date.now() + "buy",
      userId: user.id,
      type: 'withdraw', // Categorize as expense
      amount: -prediction.price,
      description: `购买方案: ${prediction.contentTitle.substring(0, 10)}...`,
      time: new Date().toISOString()
    });
    await writeData("transactions.json", transactions);

    res.json({ message: "购买成功" });
  });

  app.put("/api/profile", async (req, res) => {
    const users = await readData("users.json");
    // For demo, we update the first user
    if (users.length > 0) {
      users[0] = { ...users[0], ...req.body };
      await writeData("users.json", users);
      const { password, ...userWithoutPassword } = users[0];
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
    const newPrediction = { ...req.body, id: "p" + Date.now() };
    predictions.push(newPrediction);
    await writeData("predictions.json", predictions);
    res.json(newPrediction);
  });

  app.put("/api/admin/predictions/:id", async (req, res) => {
    const predictions = await readData("predictions.json");
    const index = predictions.findIndex((p: any) => p.id === req.params.id);
    if (index !== -1) {
      predictions[index] = { ...predictions[index], ...req.body };
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
            streak: 0
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
