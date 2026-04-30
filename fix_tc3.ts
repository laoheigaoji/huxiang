import fs from 'fs';
const path = './src/pages/TransferCodeGenerator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/body: JSON\.stringify\(\{ userId, \.\.\.formData \}\)[\s\S]*?setHistory\(\[genData, \.\.\.history\]\);\s*setSelectedItem\(\{name: formData\.name, cardNo: formData\.cardNo\}\);/m, `body: JSON.stringify({ userId, ...(sessionStorage.getItem('tcForm') ? JSON.parse(sessionStorage.getItem('tcForm') as string) : formData) })
                    });
                    const genData = await genRes.json();
                    if (genRes.ok) {
                        setShortUrl(genData.shortUrl);
                        fetch(\`/api/transfer-code/history?userId=\${userId}\`).then(res => res.json()).then(data => setHistory(data)).catch(() => {});
                        const formPayload = sessionStorage.getItem('tcForm') ? JSON.parse(sessionStorage.getItem('tcForm') as string) : formData;
                        setSelectedItem({name: formPayload.name, cardNo: formPayload.cardNo});`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fix TC3 Done');
