import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const linkResponse = await axios\.post\([\s\S]*?const shortUrl = linkResponse\.data\.shorturl;/m, 
`let shortUrl = finalUrl;
    try {
        const linkResponse = await axios.post('https://link.rfseo.cn/api/url/add', { url: finalUrl }, {
            headers: { 'Authorization': \`Bearer \${SHORTLINK_API_KEY}\`, 'Content-Type': 'application/json' }
        });
        if (linkResponse.data && linkResponse.data.shorturl) {
            shortUrl = linkResponse.data.shorturl;
        } else {
            console.error('Shortlink generation unexpected response:', linkResponse.data);
            throw new Error(linkResponse.data?.msg || 'Failed to generate short url');
        }
    } catch (e: any) {
        console.error('Shortlink error:', e.message);
        // Refund user
        await db.collection("users").updateOne({ id: userId }, { $inc: { balance: price } });
        return res.status(500).json({ error: "生成短链失败: " + e.message + "，金额已退回" });
    }`);

fs.writeFileSync('server.ts', code);
