const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const refundLogCode = `                // Refund user
                await db.collection("users").updateOne({ id: userId }, { $inc: { balance: price } });
                await db.collection("transactions").insertOne({
                    id: "t" + Date.now(),
                    userId,
                    type: 'refund',
                    amount: price,
                    description: '转卡码生成失败退款',
                    time: new Date().toISOString()
                });
                return res.status(500).json({ error: "生成短链失败: " + e.message + "，金额已退回" });`;

// Adjusting regex to be more robust
const regex = /\/\/ Refund user[\s\S]*?return res\.status\(500\)\.json\(\{ error: "生成短链失败: " \+ e\.message \+ "，金额已退回" \}\);/m;

code = code.replace(regex, refundLogCode);

fs.writeFileSync('server.ts', code);
