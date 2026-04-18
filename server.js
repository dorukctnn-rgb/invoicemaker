const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const users = {};

const INDUSTRIES = [
  { slug: 'freelancer', label: 'Freelancers', desc: 'Create professional invoices for freelance work in seconds. Free PDF download.' },
  { slug: 'contractor', label: 'Contractors', desc: 'Contractor invoice generator. Professional invoices with tax, materials and labour.' },
  { slug: 'photographer', label: 'Photographers', desc: 'Photography invoice template. Bill clients for shoots, editing and licensing.' },
  { slug: 'consultant', label: 'Consultants', desc: 'Consulting invoice generator. Itemise your services and get paid faster.' },
  { slug: 'designer', label: 'Designers', desc: 'Graphic design invoice maker. Send branded invoices for design projects.' },
  { slug: 'developer', label: 'Developers', desc: 'Web developer invoice generator. Bill clients for development and maintenance.' },
  { slug: 'plumber', label: 'Plumbers', desc: 'Plumbing invoice template. Include parts, labour and VAT automatically.' },
  { slug: 'electrician', label: 'Electricians', desc: 'Electrical contractor invoice maker. Professional invoices with materials and labour.' },
  { slug: 'cleaner', label: 'Cleaning Services', desc: 'Cleaning service invoice generator. Recurring or one-off jobs, PDF ready.' },
  { slug: 'tutor', label: 'Tutors', desc: 'Tutoring invoice template. Bill students or parents for lessons easily.' },
  { slug: 'accountant', label: 'Accountants', desc: 'Accounting invoice generator. Professional invoices for accounting services.' },
  { slug: 'lawyer', label: 'Lawyers', desc: 'Legal invoice template. Hourly billing, retainers and disbursements.' },
  { slug: 'real-estate', label: 'Real Estate Agents', desc: 'Real estate invoice maker. Commission and fee invoices for agents.' },
  { slug: 'marketing', label: 'Marketing Agencies', desc: 'Marketing agency invoice generator. Campaign fees, ad spend and retainers.' },
  { slug: 'restaurant', label: 'Restaurants', desc: 'Restaurant invoice template. Catering and event billing made simple.' },
  { slug: 'mechanic', label: 'Mechanics', desc: 'Auto repair invoice generator. Parts, labour and diagnostics on one invoice.' },
  { slug: 'landscaper', label: 'Landscapers', desc: 'Landscaping invoice maker. Mowing, design and maintenance billing.' },
  { slug: 'therapist', label: 'Therapists', desc: 'Therapy invoice template. Session billing for therapists and counsellors.' },
  { slug: 'writer', label: 'Writers', desc: 'Freelance writing invoice generator. Per-word, per-article or project billing.' },
  { slug: 'videographer', label: 'Videographers', desc: 'Video production invoice maker. Shoot days, editing and licensing.' }
];

const COUNTRIES = [
  { slug: 'uk', label: 'UK', currency: 'GBP', symbol: '£', tax: 'VAT' },
  { slug: 'usa', label: 'USA', currency: 'USD', symbol: '$', tax: 'Tax' },
  { slug: 'canada', label: 'Canada', currency: 'CAD', symbol: 'CA$', tax: 'GST' },
  { slug: 'australia', label: 'Australia', currency: 'AUD', symbol: 'AU$', tax: 'GST' },
  { slug: 'germany', label: 'Germany', currency: 'EUR', symbol: '€', tax: 'MwSt' },
  { slug: 'france', label: 'France', currency: 'EUR', symbol: '€', tax: 'TVA' },
  { slug: 'india', label: 'India', currency: 'INR', symbol: '₹', tax: 'GST' },
  { slug: 'uae', label: 'UAE', currency: 'AED', symbol: 'AED', tax: 'VAT' },
  { slug: 'singapore', label: 'Singapore', currency: 'SGD', symbol: 'S$', tax: 'GST' },
  { slug: 'netherlands', label: 'Netherlands', currency: 'EUR', symbol: '€', tax: 'BTW' }
];

app.get('/', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('index', { isPro, industries: INDUSTRIES, countries: COUNTRIES, page: null, industry: null, country: null });
});

INDUSTRIES.forEach(ind => {
  app.get('/invoice-template-' + ind.slug, (req, res) => {
    const isPro = req.cookies.pro === 'true';
    res.render('index', { isPro, industries: INDUSTRIES, countries: COUNTRIES, page: 'industry', industry: ind, country: null });
  });
});

COUNTRIES.forEach(c => {
  app.get('/free-invoice-generator-' + c.slug, (req, res) => {
    const isPro = req.cookies.pro === 'true';
    res.render('index', { isPro, industries: INDUSTRIES, countries: COUNTRIES, page: 'country', industry: null, country: c });
  });
});

app.post('/generate-pdf', async (req, res) => {
  const { invoiceData } = req.body;
  try {
    const chromium = require('@sparticuz/chromium');
    const puppeteer = require('puppeteer-core');
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const data = JSON.parse(invoiceData);
    const html = buildInvoiceHTML(data);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' } });
    await browser.close();
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="invoice.pdf"' });
    res.send(pdf);
  } catch(err) {
    console.error('PDF error:', err.message);
    res.status(500).json({ error: 'PDF generation failed.' });
  }
});

function buildInvoiceHTML(d) {
  const subtotal = (d.items||[]).reduce((s,i) => s + (parseFloat(i.qty||0)*parseFloat(i.rate||0)), 0);
  const taxAmt = subtotal * (parseFloat(d.taxRate||0)/100);
  const total = subtotal + taxAmt;
  const rows = (d.items||[]).map(i => {
    const lt = parseFloat(i.qty||0)*parseFloat(i.rate||0);
    return '<tr><td style="padding:8px 0;border-bottom:1px solid #eee">'+(i.desc||'')+'</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">'+(i.qty||0)+'</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">'+(d.symbol||'$')+parseFloat(i.rate||0).toFixed(2)+'</td><td style="padding:8px 0 8px 8px;border-bottom:1px solid #eee;text-align:right">'+(d.symbol||'$')+lt.toFixed(2)+'</td></tr>';
  }).join('');
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}*{box-sizing:border-box}</style></head><body><div style="padding:40px;max-width:800px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px"><div><h1 style="margin:0;font-size:32px;color:'+(d.color||'#2563eb')+'">INVOICE</h1><p style="margin:4px 0 0;color:#666">#'+(d.invoiceNumber||'001')+'</p></div><div style="text-align:right"><h2 style="margin:0;font-size:18px">'+(d.fromName||'')+'</h2><p style="margin:4px 0;color:#666;font-size:13px">'+(d.fromEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.fromAddress||'').replace(/\n/g,'<br>')+'</p></div></div><div style="display:flex;justify-content:space-between;margin-bottom:32px"><div><p style="margin:0;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:.5px">Bill To</p><h3 style="margin:4px 0;font-size:15px">'+(d.toName||'')+'</h3><p style="margin:0;color:#666;font-size:13px">'+(d.toEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.toAddress||'').replace(/\n/g,'<br>')+'</p></div><div style="text-align:right"><div style="margin-bottom:8px"><span style="font-size:11px;text-transform:uppercase;color:#999">Issue Date</span><p style="margin:2px 0;font-weight:600">'+(d.issueDate||'')+'</p></div><div><span style="font-size:11px;text-transform:uppercase;color:#999">Due Date</span><p style="margin:2px 0;font-weight:600">'+(d.dueDate||'')+'</p></div></div></div><table style="width:100%;border-collapse:collapse;margin-bottom:24px"><thead><tr style="background:'+(d.color||'#2563eb')+';color:#fff"><th style="padding:10px 0;text-align:left;font-size:12px">DESCRIPTION</th><th style="padding:10px 8px;text-align:center;font-size:12px">QTY</th><th style="padding:10px 8px;text-align:right;font-size:12px">RATE</th><th style="padding:10px 0 10px 8px;text-align:right;font-size:12px">AMOUNT</th></tr></thead><tbody>'+rows+'</tbody></table><div style="display:flex;justify-content:flex-end;margin-bottom:32px"><div style="min-width:220px"><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">Subtotal</span><span>'+(d.symbol||'$')+subtotal.toFixed(2)+'</span></div>'+(d.taxRate?'<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">'+(d.taxLabel||'Tax')+' ('+d.taxRate+'%)</span><span>'+(d.symbol||'$')+taxAmt.toFixed(2)+'</span></div>':'')+'<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700"><span>Total</span><span style="color:'+(d.color||'#2563eb')+'">'+(d.symbol||'$')+total.toFixed(2)+'</span></div></div></div>'+(d.notes?'<div style="background:#f9fafb;border-left:3px solid '+(d.color||'#2563eb')+';padding:12px 16px"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#999">Notes</p><p style="margin:0;font-size:13px;color:#444">'+d.notes+'</p></div>':'')+'</div></body></html>';
}

app.post('/gumroad-webhook', (req, res) => {
  try {
    const { email, sale_timestamp } = req.body;
    if (email) {
      users[email.toLowerCase()] = { pro: true, since: sale_timestamp || new Date().toISOString() };
      console.log('NEW PRO:', email);
    }
  } catch(e) { console.error('Webhook error:', e.message); }
  res.sendStatus(200);
});

app.post('/activate-pro', (req, res) => {
  const { email } = req.body;
  if (email && users[email.toLowerCase()] && users[email.toLowerCase()].pro) {
    res.cookie('pro', 'true', { maxAge: 365*24*60*60*1000, httpOnly: true });
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'No PRO purchase found. Please buy at our Gumroad page.' });
  }
});

app.get('/activate', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('activate', { isPro });
});

app.get('/sitemap.xml', (req, res) => {
  const base = process.env.SITE_URL || 'https://invoicemaker.up.railway.app';
  const urls = [''];
  INDUSTRIES.forEach(i => urls.push('/invoice-template-' + i.slug));
  COUNTRIES.forEach(c => urls.push('/free-invoice-generator-' + c.slug));
  const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(u => '<url><loc>'+base+u+'</loc><changefreq>weekly</changefreq><priority>'+(u===''?'1.0':'0.8')+'</priority></url>').join('') +
    '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const base = process.env.SITE_URL || 'https://invoicemaker.up.railway.app';
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: ' + base + '/sitemap.xml\n');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('InvoiceMaker running on ' + PORT));
