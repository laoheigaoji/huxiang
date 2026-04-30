import fs from 'fs';
const path = './src/pages/TransferCodeGenerator.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const currentUrl = new URL\(window\.location\.href\);\s*currentUrl\.searchParams\.set\('payment_return', '1'\);\s*currentUrl\.searchParams\.set\('init_bal', user\?\.balance \|\| '0'\);\s*const returnUrl = currentUrl\.toString\(\);\s*setShowPayment\(false\); \/\/ Close modal immediately\s*setIsProcessingPayment\(true\); \/\/ Keep loading overlay\s*const payRes = await api\.createPayment\(2, 'alipay', '转卡码生成', userId, undefined, returnUrl\);\s*const paymentUrl = payRes\.url \|\| payRes\.payurl \|\| payRes\.payment_url \|\| payRes\.qrcode;\s*if \(paymentUrl\) \{/m, `                sessionStorage.setItem('tcForm', JSON.stringify(formData));
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('payment_return', '1');
                currentUrl.searchParams.set('init_bal', user?.balance || '0');
                const returnUrl = currentUrl.toString();
                setShowPayment(false); // Close modal immediately
                setIsProcessingPayment(true); // Keep loading overlay
                
                const payAmount = parseFloat(settings.transferCodePrice || '2');
                const payRes = await api.createPayment(payAmount, 'alipay', '转卡码生成', userId, undefined, returnUrl);
                const paymentUrl = payRes.url || payRes.payurl || payRes.payment_url || payRes.qrcode;
                if (paymentUrl) {`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fix TC2 Done');
