import fs from 'fs';
let code = fs.readFileSync('src/pages/TransferCodeGenerator.tsx', 'utf8');

// Replace the try-catch to properly exit polling and show alert.
const regex = /const genData = await genRes\.json\(\);[\s\S]*?\} catch \(e\) \{\n                        console\.error\("Auto generation err:", e\);\n                    \}/;

const replacement = `let genData: any = {};
                        try {
                            genData = await genRes.json();
                        } catch (e) {
                            console.error("Failed to parse genRes", e);
                        }
                        
                        // Clear URL params BEFORE setting state to avoid effect re-triggering
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        url.searchParams.delete('init_bal');
                        window.history.replaceState({}, '', url.toString());

                        if (genRes.ok) {
                            setShortUrl(genData.shortUrl);
                            
                            // fetch history to be safe
                            fetch(\`/api/transfer-code/history?userId=\${userId}\`)
                               .then(res => res.json())
                               .then(data => setHistory(data))
                               .catch(() => {});

                            setSelectedItem({name: formPayload.name, cardNo: formPayload.cardNo});
                            
                            // Trigger modals
                            setIsProcessingPayment(false);
                            setTimeout(() => setShowQr(true), 150);

                            sessionStorage.removeItem('tcForm');
                            isPolling = false;
                            return; // Exit polling
                        } else {
                            alert(genData.error || '生成失败');
                            setIsProcessingPayment(false);
                            isPolling = false;
                            return; // Exit polling
                        }
                    } catch (e: any) {
                        console.error("Auto generation err:", e);
                        alert("请求异常: " + e.message);
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        window.history.replaceState({}, '', url.toString());
                        setIsProcessingPayment(false);
                        isPolling = false;
                        return;
                    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/TransferCodeGenerator.tsx', code);
