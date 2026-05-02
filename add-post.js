const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');
const newPost =   {
    slug: 'gst-hst-pst-canada-invoice-guide',
    title: 'GST, HST and PST on Canadian Invoices: Complete 2026 Guide',
    desc: 'Everything Canadian freelancers need to know about GST, HST and PST. Rates by province and how to calculate.',
    date: '2026-04-01',
    readTime: '8 min read',
    category: 'Tax',
    content: '<h2>Canadian sales tax</h2><p>Canada has three types of sales tax: GST, HST, and PST.</p><h2>GST rate</h2><p>Federal GST is 5% across all of Canada.</p><h2>HST by province</h2><ul><li>Ontario: 13%</li><li>Nova Scotia: 15%</li><li>New Brunswick: 15%</li><li>PEI: 15%</li><li>Newfoundland: 15%</li></ul><h2>PST by province</h2><ul><li>BC: 7% PST + 5% GST</li><li>Saskatchewan: 6% PST + 5% GST</li><li>Manitoba: 7% + 5% GST</li><li>Quebec: 9.975% QST + 5% GST</li></ul><h2>Alberta</h2><p>No provincial tax. Only 5% GST.</p><h2>How to calculate GST</h2><p>Multiply subtotal by 0.05. Example: CAD 1000 x 0.05 = CAD 50 GST. Total = CAD 1050.</p><h2>What to include</h2><ul><li>GST registration number</li><li>Invoice date</li><li>Amount before tax</li><li>GST rate and amount</li><li>Total including tax</li></ul>'
  },;
const idx = content.indexOf("slug: 'small-business-invoicing-tips'");
if (idx === -1) { console.log('MARKER NOT FOUND'); process.exit(1); }
const insertAt = content.lastIndexOf('{', idx);
content = content.slice(0, insertAt) + newPost + '\n  ' + content.slice(insertAt);
fs.writeFileSync('server.js', content);
console.log('Done! Added GST Canada post.');
