import fs from 'fs';
const path = './src/pages/TransferCodeGenerator.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /if \(selectedPaymentMethod === 'balance'\) \{[\s\S]*?\}, \[userId, isProcessingPayment\]\);/g;

const replacement = `if (selectedPaymentMethod === 'balance') {
                setIsGeneratingBalance(true);
                const response = await fetch('/api/transfer-code/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, ...formData })
                });
                const data = await response.json();
                if (response.ok) {
                    setIsGeneratingBalance(false);
                    setShortUrl(data.shortUrl);
                    
                    fetch(\`/api/transfer-code/history?userId=\${userId}\`)
                        .then(res => res.json())
                        .then(d => setHistory(d))
                        .catch(console.error);

                    setShowPayment(false);
                    setSelectedItem({name: formData.name, cardNo: formData.cardNo});
                    setShowQr(true);
                } else {
                    setIsGeneratingBalance(false);
                    alert(data.error || '生成失败');
                }
            } else {
                sessionStorage.setItem('tcForm', JSON.stringify(formData));
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('payment_return', '1');
                currentUrl.searchParams.set('init_bal', user?.balance || '0');
                const returnUrl = currentUrl.toString();
                setShowPayment(false); // Close modal immediately
                setIsProcessingPayment(true); // Keep loading overlay
                
                const payAmount = parseFloat(settings.transferCodePrice || '2');
                const payRes = await api.createPayment(payAmount, 'alipay', '转卡码生成', userId, undefined, returnUrl);
                const paymentUrl = payRes.url || payRes.payurl || payRes.payment_url || payRes.qrcode;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('payment_return');
                    url.searchParams.delete('init_bal');
                    window.history.replaceState({}, '', url.toString());

                    alert('支付请求发送失败');
                    setIsProcessingPayment(false);
                }
            }
        } catch (error: any) {
            console.error(error);
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_return');
            url.searchParams.delete('init_bal');
            window.history.replaceState({}, '', url.toString());

            alert(error.message || '网络错误');
            setIsProcessingPayment(false);
            setIsGeneratingBalance(false);
        }
    };

    // Polling to check if generation succeeded already
    useEffect(() => {
        if (!userId) return;

        const urlParams = new URLSearchParams(window.location.search);
        const isPaymentReturn = urlParams.get('payment_return') === '1';

        if (isPaymentReturn && !isProcessingPayment) {
            setIsProcessingPayment(true);
        }

        const pollInterval = setInterval(async () => {
           const isPaymentReturnPolling = new URLSearchParams(window.location.search).get('payment_return') === '1';
           if (!isPaymentReturnPolling && !isProcessingPayment) return;

           // Fetch user to check balance increase
           const userRes = await fetch(\`/api/profile?userId=\${userId}\`);
           const userData = await userRes.json();
           
           const urlParamsForBal = new URLSearchParams(window.location.search);
           const initialBalance = parseFloat(urlParamsForBal.get('init_bal') || '0');

           if (userData.balance > initialBalance) {
                console.log("Balance increased, attempting automatic generation");
                try {
                    const formStr = sessionStorage.getItem('tcForm');
                    const formPayload = formStr ? JSON.parse(formStr) : formData;
                    
                    const genRes = await fetch('/api/transfer-code/generate', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ userId, ...formPayload })
                    });
                    const genData = await genRes.json();
                    if (genRes.ok) {
                        setShortUrl(genData.shortUrl);
                        
                        // fetch history to be safe
                        fetch(\`/api/transfer-code/history?userId=\${userId}\`)
                           .then(res => res.json())
                           .then(data => setHistory(data))
                           .catch(() => {});

                        setSelectedItem({name: formPayload.name, cardNo: formPayload.cardNo});
                        setShowQr(true);
                        setIsProcessingPayment(false);
                        
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        url.searchParams.delete('init_bal');
                        window.history.replaceState({}, '', url.toString());

                        sessionStorage.removeItem('tcForm');
                        return; // Exit polling
                    }
                } catch (e) { console.error("Auto generation err:", e); }
            }

            // Fallback to checking history if already generated, but only if balance actually increased
            if (userData.balance > initialBalance) {
                 const res = await fetch(\`/api/transfer-code/history?userId=\${userId}\`);
                 const data = await res.json();
                 
                 if (data.length > 0) {
                     const latest = data[0]; 
                     const createdAt = new Date(latest.createdAt).getTime();
                     if (Date.now() - createdAt < 15000) { 
                         setShortUrl(latest.shortUrl);
                         setHistory(data);
                         setSelectedItem({name: latest.name, cardNo: latest.cardNo});
                         setShowQr(true);
                         setIsProcessingPayment(false);
                         
                         const url = new URL(window.location.href);
                         url.searchParams.delete('payment_return');
                         url.searchParams.delete('init_bal');
                         window.history.replaceState({}, '', url.toString());
                     }
                 }
            }
        }, 3000);
        
        return () => clearInterval(pollInterval);
    }, [userId, isProcessingPayment]);`;

content = content.replace(regex, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed TransferCode!');
