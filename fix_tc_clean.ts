import fs from 'fs';

const path = './src/pages/TransferCodeGenerator.tsx';
let content = fs.readFileSync(path, 'utf8');

// The replacement logic:
content = content.replace(/const returnUrl = window\.location\.href;\s*localStorage\.setItem\('payment_initiated', 'true'\);\s*localStorage\.setItem\('payment_initiated_time', Date\.now\(\)\.toString\(\)\);\s*localStorage\.setItem\('initial_balance', user\?\.balance \|\| '0'\);/, `
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('payment_return', '1');
                currentUrl.searchParams.set('init_bal', user?.balance || '0');
                const returnUrl = currentUrl.toString();`);

content = content.replace(/localStorage\.removeItem\('payment_initiated'\);\s*localStorage\.removeItem\('payment_initiated_time'\);/g, `
                    const url = new URL(window.location.href);
                    url.searchParams.delete('payment_return');
                    url.searchParams.delete('init_bal');
                    window.history.replaceState({}, '', url.toString());
`);

content = content.replace(/const initiatedTimeStr = localStorage\.getItem\('payment_initiated_time'\);[\s\S]*?if \(localStorage\.getItem\('payment_initiated'\) === 'true' && isTimeValid\) {[\s\S]*?\} else if \(localStorage\.getItem\('payment_initiated'\) === 'true'\) {[\s\S]*?localStorage\.removeItem\('initial_balance'\);\s*\}/, `
        const urlParams = new URLSearchParams(window.location.search);
        const isPaymentReturn = urlParams.get('payment_return') === '1';

        if (isPaymentReturn && !isProcessingPayment) {
            setIsProcessingPayment(true);
        }
`);

content = content.replace(/if \(localStorage\.getItem\('payment_initiated'\) !== 'true' && !isProcessingPayment\) return;/, `
           const isPaymentReturnPolling = new URLSearchParams(window.location.search).get('payment_return') === '1';
           if (!isPaymentReturnPolling && !isProcessingPayment) return;
`);

content = content.replace(/const initialBalance = parseFloat\(localStorage\.getItem\('initial_balance'\) \|\| '0'\);/, `
           const urlParamsForBal = new URLSearchParams(window.location.search);
           const initialBalance = parseFloat(urlParamsForBal.get('init_bal') || '0');
`);

content = content.replace(/localStorage\.removeItem\('initial_balance'\);/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fix TC Clean Done');
