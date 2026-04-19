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

const SITE_URL = process.env.SITE_URL || 'https://getinvoicemaker.com';
const users = {};

const INDUSTRIES = [
  { slug: 'freelancer', label: 'Freelancers', desc: 'Create professional invoices for freelance work in seconds. Free PDF download, no signup required.', h1: 'Free Invoice Template for Freelancers', intro: 'The fastest free invoice generator for freelancers. Add your services, hourly rate or project fee, and download a professional PDF in seconds. No account needed.' },
  { slug: 'contractor', label: 'Contractors', desc: 'Contractor invoice generator. Professional invoices with tax, materials and labour. Free PDF.', h1: 'Free Contractor Invoice Template', intro: 'Generate contractor invoices instantly. Include labour, materials, and tax. Download clean PDF invoices for any contracting job — plumbing, electrical, building and more.' },
  { slug: 'photographer', label: 'Photographers', desc: 'Photography invoice template. Bill clients for shoots, editing and licensing. Free PDF download.', h1: 'Free Photography Invoice Template', intro: 'Professional invoice template for photographers. Bill clients for shoot time, editing, travel and licensing fees. Download as PDF instantly, no signup required.' },
  { slug: 'consultant', label: 'Consultants', desc: 'Consulting invoice generator. Itemise your services and get paid faster. Free PDF.', h1: 'Free Consulting Invoice Template', intro: 'Create professional consulting invoices in seconds. Itemise your consulting services, daily rate or project fee, and add payment terms. Free PDF download.' },
  { slug: 'designer', label: 'Graphic Designers', desc: 'Graphic design invoice maker. Send branded invoices for design projects. Free download.', h1: 'Free Graphic Design Invoice Template', intro: 'Invoice template built for graphic designers. Bill clients for logo design, branding, web design and other creative services. Professional PDF, no watermark on free plan.' },
  { slug: 'developer', label: 'Web Developers', desc: 'Web developer invoice generator. Bill clients for development and maintenance. Free PDF.', h1: 'Free Web Developer Invoice Template', intro: 'Invoice generator for web developers and software engineers. Bill for development hours, retainers, hosting and maintenance. Download PDF instantly.' },
  { slug: 'plumber', label: 'Plumbers', desc: 'Plumbing invoice template. Include parts, labour and VAT automatically. Free PDF.', h1: 'Free Plumbing Invoice Template', intro: 'Professional invoice template for plumbers. Include call-out fee, parts and labour. VAT calculated automatically. Download PDF and send to customers instantly.' },
  { slug: 'electrician', label: 'Electricians', desc: 'Electrical contractor invoice maker. Professional invoices with materials and labour. Free.', h1: 'Free Electrician Invoice Template', intro: 'Create electrical contractor invoices in seconds. Include materials, labour hours and VAT. Professional PDF invoice for any electrical job.' },
  { slug: 'cleaner', label: 'Cleaning Services', desc: 'Cleaning service invoice generator. Recurring or one-off jobs, PDF ready. Free.', h1: 'Free Cleaning Service Invoice Template', intro: 'Invoice generator for cleaning businesses. Bill clients for regular or one-off cleaning jobs. Add hours, rate and any extras. Free PDF download.' },
  { slug: 'tutor', label: 'Tutors', desc: 'Tutoring invoice template. Bill students or parents for lessons easily. Free PDF.', h1: 'Free Tutoring Invoice Template', intro: 'Professional invoice template for tutors and teachers. Bill for individual lessons or packages. Add subject, hours and hourly rate. Free PDF.' },
  { slug: 'accountant', label: 'Accountants', desc: 'Accounting invoice generator. Professional invoices for accounting services. Free PDF.', h1: 'Free Accounting Invoice Template', intro: 'Create professional invoices for accounting and bookkeeping services. Bill for tax returns, payroll, audits and consultations. Free PDF download.' },
  { slug: 'lawyer', label: 'Lawyers', desc: 'Legal invoice template. Hourly billing, retainers and disbursements. Free PDF.', h1: 'Free Legal Invoice Template for Lawyers', intro: 'Professional invoice template for lawyers and solicitors. Bill for consultation hours, retainer fees and disbursements. Download PDF instantly.' },
  { slug: 'real-estate', label: 'Real Estate Agents', desc: 'Real estate invoice maker. Commission and fee invoices for agents. Free PDF.', h1: 'Free Real Estate Invoice Template', intro: 'Invoice template for real estate agents. Bill for commission, management fees and other services. Professional PDF in seconds, no signup required.' },
  { slug: 'marketing', label: 'Marketing Agencies', desc: 'Marketing agency invoice generator. Campaign fees, ad spend and retainers. Free PDF.', h1: 'Free Marketing Agency Invoice Template', intro: 'Create invoices for marketing and advertising services. Bill for campaign management, ad spend, content creation and monthly retainers. Free PDF.' },
  { slug: 'restaurant', label: 'Restaurants', desc: 'Restaurant invoice template. Catering and event billing made simple. Free PDF.', h1: 'Free Restaurant & Catering Invoice Template', intro: 'Invoice template for restaurants and catering businesses. Bill clients for private events, catering, and food services. Professional PDF invoice.' },
  { slug: 'mechanic', label: 'Auto Mechanics', desc: 'Auto repair invoice generator. Parts, labour and diagnostics on one invoice. Free PDF.', h1: 'Free Auto Repair Invoice Template', intro: 'Professional invoice template for mechanics and auto repair shops. Include parts, labour, diagnostics and MOT. Free PDF download.' },
  { slug: 'landscaper', label: 'Landscapers', desc: 'Landscaping invoice maker. Mowing, design and maintenance billing. Free PDF.', h1: 'Free Landscaping Invoice Template', intro: 'Invoice generator for landscapers and gardeners. Bill for lawn mowing, garden design, planting and maintenance. Free PDF.' },
  { slug: 'therapist', label: 'Therapists', desc: 'Therapy invoice template. Professional session billing for therapists. Free PDF.', h1: 'Free Therapy Invoice Template', intro: 'Professional invoice template for therapists and counsellors. Bill for individual sessions, packages and assessments. Free PDF, no signup.' },
  { slug: 'writer', label: 'Freelance Writers', desc: 'Freelance writing invoice generator. Per-word, per-article or project billing. Free PDF.', h1: 'Free Freelance Writer Invoice Template', intro: 'Invoice template for freelance writers and copywriters. Bill per word, per article or flat project fee. Download professional PDF instantly.' },
  { slug: 'videographer', label: 'Videographers', desc: 'Video production invoice maker. Shoot days, editing and licensing. Free PDF.', h1: 'Free Videographer Invoice Template', intro: 'Professional invoice template for videographers. Bill for shoot days, editing hours, equipment and licensing. Free PDF download.' }
];

const COUNTRIES = [
  { slug: 'uk', label: 'UK', fullName: 'United Kingdom', currency: 'GBP', symbol: '£', tax: 'VAT', taxRate: 20, desc: 'Free invoice generator for UK businesses. Create GBP invoices with 20% VAT calculated automatically. Download PDF instantly, no signup.', intro: 'The free invoice generator built for UK freelancers and businesses. Automatically handles 20% VAT, GBP currency, and UK invoice requirements. Download professional PDF invoices instantly.' },
  { slug: 'usa', label: 'USA', fullName: 'United States', currency: 'USD', symbol: '$', tax: 'Sales Tax', taxRate: 0, desc: 'Free US invoice generator. Create USD invoices with automatic sales tax. Download PDF instantly, no signup required.', intro: 'Free invoice generator for US freelancers and small businesses. Create professional USD invoices with optional sales tax. No account needed, instant PDF download.' },
  { slug: 'canada', label: 'Canada', fullName: 'Canada', currency: 'CAD', symbol: 'CA$', tax: 'GST/HST', taxRate: 5, desc: 'Free Canadian invoice generator. CAD invoices with GST/HST calculation. Download PDF instantly.', intro: 'Create professional Canadian invoices with automatic GST/HST calculation. CAD currency, free PDF download, no signup required.' },
  { slug: 'australia', label: 'Australia', fullName: 'Australia', currency: 'AUD', symbol: 'AU$', tax: 'GST', taxRate: 10, desc: 'Free Australian invoice generator. AUD invoices with 10% GST. Download PDF instantly.', intro: 'Free invoice generator for Australian businesses and sole traders. Includes 10% GST calculation and AUD currency. Professional PDF in seconds.' },
  { slug: 'germany', label: 'Germany', fullName: 'Germany', currency: 'EUR', symbol: '€', tax: 'MwSt', taxRate: 19, desc: 'Free German invoice generator. EUR invoices with 19% MwSt (VAT). Download PDF instantly.', intro: 'Create professional German invoices with automatic 19% MwSt calculation. EUR currency, free PDF download, no registration needed.' },
  { slug: 'france', label: 'France', fullName: 'France', currency: 'EUR', symbol: '€', tax: 'TVA', taxRate: 20, desc: 'Free French invoice generator. EUR invoices with 20% TVA. Download PDF instantly.', intro: 'Free invoice generator for French businesses and freelancers. Includes 20% TVA and EUR currency. Professional PDF invoice in seconds.' },
  { slug: 'india', label: 'India', fullName: 'India', currency: 'INR', symbol: '₹', tax: 'GST', taxRate: 18, desc: 'Free Indian invoice generator. INR invoices with GST calculation. Download PDF instantly.', intro: 'Create professional Indian invoices with automatic GST calculation. INR currency support, free PDF download, no signup required.' },
  { slug: 'uae', label: 'UAE', fullName: 'United Arab Emirates', currency: 'AED', symbol: 'AED', tax: 'VAT', taxRate: 5, desc: 'Free UAE invoice generator. AED invoices with 5% VAT. Download PDF instantly.', intro: 'Free invoice generator for UAE businesses. Includes 5% VAT and AED currency. Download professional PDF invoices instantly, no account needed.' },
  { slug: 'singapore', label: 'Singapore', fullName: 'Singapore', currency: 'SGD', symbol: 'S$', tax: 'GST', taxRate: 9, desc: 'Free Singapore invoice generator. SGD invoices with 9% GST. Download PDF instantly.', intro: 'Professional invoice generator for Singapore businesses. Automatic 9% GST calculation, SGD currency. Free PDF download, no signup.' },
  { slug: 'netherlands', label: 'Netherlands', fullName: 'Netherlands', currency: 'EUR', symbol: '€', tax: 'BTW', taxRate: 21, desc: 'Free Dutch invoice generator. EUR invoices with 21% BTW (VAT). Download PDF instantly.', intro: 'Free invoice generator for Dutch businesses and ZZP freelancers. Includes 21% BTW calculation and EUR currency. Professional PDF in seconds.' }
];

app.get('/', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('index', { isPro, industries: INDUSTRIES, countries: COUNTRIES, page: null, industry: null, country: null, siteUrl: SITE_URL });
});

INDUSTRIES.forEach(ind => {
  app.get('/invoice-template-' + ind.slug, (req, res) => {
    const isPro = req.cookies.pro === 'true';
    res.render('industry', { isPro, industries: INDUSTRIES, countries: COUNTRIES, industry: ind, siteUrl: SITE_URL });
  });
});

COUNTRIES.forEach(c => {
  app.get('/free-invoice-generator-' + c.slug, (req, res) => {
    const isPro = req.cookies.pro === 'true';
    res.render('country', { isPro, industries: INDUSTRIES, countries: COUNTRIES, country: c, siteUrl: SITE_URL });
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
  const subtotal = (d.items||[]).reduce((s,i) => s+(parseFloat(i.qty||0)*parseFloat(i.rate||0)), 0);
  const taxAmt = subtotal*(parseFloat(d.taxRate||0)/100);
  const total = subtotal+taxAmt;
  const rows = (d.items||[]).map(i => {
    const lt = parseFloat(i.qty||0)*parseFloat(i.rate||0);
    return '<tr><td style="padding:8px 0;border-bottom:1px solid #eee">'+(i.desc||'')+'</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">'+(i.qty||0)+'</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">'+(d.symbol||'$')+parseFloat(i.rate||0).toFixed(2)+'</td><td style="padding:8px 0 8px 8px;border-bottom:1px solid #eee;text-align:right">'+(d.symbol||'$')+lt.toFixed(2)+'</td></tr>';
  }).join('');
  const wmFooter = !d.isPro ? '<div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">Created with <a href="https://getinvoicemaker.com" style="color:#2563eb">GetInvoiceMaker.com</a> — Upgrade to PRO to remove this</div>' : '';
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}*{box-sizing:border-box}</style></head><body><div style="padding:40px;max-width:800px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px"><div><h1 style="margin:0;font-size:32px;color:'+(d.color||'#2563eb')+'">INVOICE</h1><p style="margin:4px 0 0;color:#666">#'+(d.invoiceNumber||'001')+'</p></div><div style="text-align:right"><h2 style="margin:0;font-size:18px">'+(d.fromName||'')+'</h2><p style="margin:4px 0;color:#666;font-size:13px">'+(d.fromEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.fromAddress||'').replace(/\n/g,'<br>')+'</p></div></div><div style="display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid '+(d.color||'#2563eb')+'"><div><p style="margin:0;font-size:11px;text-transform:uppercase;color:#999;letter-spacing:.5px">Bill To</p><h3 style="margin:4px 0;font-size:15px">'+(d.toName||'')+'</h3><p style="margin:0;color:#666;font-size:13px">'+(d.toEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.toAddress||'').replace(/\n/g,'<br>')+'</p></div><div style="text-align:right"><div style="margin-bottom:8px"><span style="font-size:11px;text-transform:uppercase;color:#999">Issue Date</span><p style="margin:2px 0;font-weight:600">'+(d.issueDate||'')+'</p></div><div><span style="font-size:11px;text-transform:uppercase;color:#999">Due Date</span><p style="margin:2px 0;font-weight:600">'+(d.dueDate||'')+'</p></div></div></div><table style="width:100%;border-collapse:collapse;margin-bottom:24px"><thead><tr style="background:'+(d.color||'#2563eb')+';color:#fff"><th style="padding:10px 0;text-align:left;font-size:12px">DESCRIPTION</th><th style="padding:10px 8px;text-align:center;font-size:12px">QTY</th><th style="padding:10px 8px;text-align:right;font-size:12px">RATE</th><th style="padding:10px 0 10px 8px;text-align:right;font-size:12px">AMOUNT</th></tr></thead><tbody>'+rows+'</tbody></table><div style="display:flex;justify-content:flex-end;margin-bottom:32px"><div style="min-width:220px"><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">Subtotal</span><span>'+(d.symbol||'$')+subtotal.toFixed(2)+'</span></div>'+(d.taxRate?'<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">'+(d.taxLabel||'Tax')+' ('+d.taxRate+'%)</span><span>'+(d.symbol||'$')+taxAmt.toFixed(2)+'</span></div>':'')+'<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700"><span>Total Due</span><span style="color:'+(d.color||'#2563eb')+'">'+(d.symbol||'$')+total.toFixed(2)+'</span></div></div></div>'+(d.notes?'<div style="background:#f9fafb;border-left:4px solid '+(d.color||'#2563eb')+';padding:12px 16px"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#999">Notes & Payment Info</p><p style="margin:0;font-size:13px;color:#444">'+d.notes+'</p></div>':'')+'</div></body></html>';
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
    res.json({ success: false, message: 'No PRO purchase found for this email. Please purchase at our Gumroad page.' });
  }
});

app.get('/activate', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('activate', { isPro });
});

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: '', priority: '1.0', freq: 'daily' },
    { loc: '/activate', priority: '0.3', freq: 'monthly' }
  ];
  INDUSTRIES.forEach(i => urls.push({ loc: '/invoice-template-' + i.slug, priority: '0.9', freq: 'weekly' }));
  COUNTRIES.forEach(c => urls.push({ loc: '/free-invoice-generator-' + c.slug, priority: '0.9', freq: 'weekly' }));
  const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(u => '<url><loc>'+SITE_URL+u.loc+'</loc><changefreq>'+u.freq+'</changefreq><priority>'+u.priority+'</priority></url>').join('') +
    '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/googlefcff82c355800720.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googlefcff82c355800720.html'); });
app.get('/googleac988ee36fede317.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googleac988ee36fede317.html'); });
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('InvoiceMaker running on ' + PORT));


