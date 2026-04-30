import fs from 'fs';

const p = './src/pages/TransferCodeGenerator.tsx';
let c = fs.readFileSync(p, 'utf8');

// The replacement was partially done, let's fix the duplicates directly
c = c.replace(/localStorage\.removeItem\('payment_initiated'\);\s*localStorage\.removeItem\('payment_initiated_time'\);/g, "localStorage.removeItem('payment_initiated');");
c = c.replace(/localStorage\.removeItem\('payment_initiated'\);/g, "localStorage.removeItem('payment_initiated');\n                        localStorage.removeItem('payment_initiated_time');");

fs.writeFileSync(p, c);
