const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const PDFDocument = require('pdfkit');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cookieParser());

const SITE_URL = process.env.SITE_URL || 'https://getinvoicemaker.com';
const users = {};

// ============================================
// DATA
// ============================================
const INDUSTRIES = [
  { slug: 'freelancer', label: 'Freelancers', desc: 'Create professional invoices for freelance work in seconds.', h1: 'Free Invoice Template for Freelancers', intro: 'The fastest free invoice generator for freelancers.' },
  { slug: 'contractor', label: 'Contractors', desc: 'Contractor invoice generator. Professional invoices with tax, materials and labour.', h1: 'Free Contractor Invoice Template', intro: 'Generate contractor invoices instantly.' },
  { slug: 'photographer', label: 'Photographers', desc: 'Photography invoice template. Bill clients for shoots, editing and licensing.', h1: 'Free Photography Invoice Template', intro: 'Professional invoice template for photographers.' },
  { slug: 'consultant', label: 'Consultants', desc: 'Consulting invoice generator. Itemise your services and get paid faster.', h1: 'Free Consulting Invoice Template', intro: 'Create professional consulting invoices in seconds.' },
  { slug: 'designer', label: 'Graphic Designers', desc: 'Graphic design invoice maker. Send branded invoices for design projects.', h1: 'Free Graphic Design Invoice Template', intro: 'Invoice template built for graphic designers.' },
  { slug: 'developer', label: 'Web Developers', desc: 'Web developer invoice generator. Bill clients for development and maintenance.', h1: 'Free Web Developer Invoice Template', intro: 'Invoice generator for web developers.' },
  { slug: 'plumber', label: 'Plumbers', desc: 'Plumbing invoice template. Include parts, labour and VAT automatically.', h1: 'Free Plumbing Invoice Template', intro: 'Professional invoice template for plumbers.' },
  { slug: 'electrician', label: 'Electricians', desc: 'Electrical contractor invoice maker. Professional invoices with materials and labour.', h1: 'Free Electrician Invoice Template', intro: 'Create electrical contractor invoices in seconds.' },
  { slug: 'cleaner', label: 'Cleaning Services', desc: 'Cleaning service invoice generator. Recurring or one-off jobs.', h1: 'Free Cleaning Service Invoice Template', intro: 'Invoice generator for cleaning businesses.' },
  { slug: 'tutor', label: 'Tutors', desc: 'Tutoring invoice template. Bill students or parents for lessons easily.', h1: 'Free Tutoring Invoice Template', intro: 'Professional invoice template for tutors.' },
  { slug: 'accountant', label: 'Accountants', desc: 'Accounting invoice generator. Professional invoices for accounting services.', h1: 'Free Accounting Invoice Template', intro: 'Create professional invoices for accounting services.' },
  { slug: 'lawyer', label: 'Lawyers', desc: 'Legal invoice template. Hourly billing, retainers and disbursements.', h1: 'Free Legal Invoice Template', intro: 'Professional invoice template for lawyers.' },
  { slug: 'real-estate', label: 'Real Estate Agents', desc: 'Real estate invoice maker. Commission and fee invoices for agents.', h1: 'Free Real Estate Invoice Template', intro: 'Invoice template for real estate agents.' },
  { slug: 'marketing', label: 'Marketing Agencies', desc: 'Marketing agency invoice generator. Campaign fees and retainers.', h1: 'Free Marketing Agency Invoice Template', intro: 'Create invoices for marketing services.' },
  { slug: 'restaurant', label: 'Restaurants', desc: 'Restaurant invoice template. Catering and event billing.', h1: 'Free Restaurant Invoice Template', intro: 'Invoice template for restaurants.' },
  { slug: 'mechanic', label: 'Auto Mechanics', desc: 'Auto repair invoice generator. Parts, labour and diagnostics.', h1: 'Free Auto Repair Invoice Template', intro: 'Professional invoice template for mechanics.' },
  { slug: 'landscaper', label: 'Landscapers', desc: 'Landscaping invoice maker. Mowing, design and maintenance billing.', h1: 'Free Landscaping Invoice Template', intro: 'Invoice generator for landscapers.' },
  { slug: 'therapist', label: 'Therapists', desc: 'Therapy invoice template. Professional session billing.', h1: 'Free Therapy Invoice Template', intro: 'Professional invoice template for therapists.' },
  { slug: 'writer', label: 'Freelance Writers', desc: 'Freelance writing invoice generator. Per-word or project billing.', h1: 'Free Freelance Writer Invoice Template', intro: 'Invoice template for freelance writers.' },
  { slug: 'videographer', label: 'Videographers', desc: 'Video production invoice maker. Shoot days, editing and licensing.', h1: 'Free Videographer Invoice Template', intro: 'Professional invoice template for videographers.' }
];

const COUNTRIES = [
  { slug: 'uk', label: 'UK', fullName: 'United Kingdom', currency: 'GBP', symbol: 'GBP', tax: 'VAT', taxRate: 20 },
  { slug: 'usa', label: 'USA', fullName: 'United States', currency: 'USD', symbol: '$', tax: 'Sales Tax', taxRate: 0 },
  { slug: 'canada', label: 'Canada', fullName: 'Canada', currency: 'CAD', symbol: 'CA$', tax: 'GST/HST', taxRate: 5 },
  { slug: 'australia', label: 'Australia', fullName: 'Australia', currency: 'AUD', symbol: 'AU$', tax: 'GST', taxRate: 10 },
  { slug: 'germany', label: 'Germany', fullName: 'Germany', currency: 'EUR', symbol: 'EUR', tax: 'MwSt', taxRate: 19 },
  { slug: 'france', label: 'France', fullName: 'France', currency: 'EUR', symbol: 'EUR', tax: 'TVA', taxRate: 20 },
  { slug: 'india', label: 'India', fullName: 'India', currency: 'INR', symbol: 'Rs.', tax: 'GST', taxRate: 18 },
  { slug: 'uae', label: 'UAE', fullName: 'United Arab Emirates', currency: 'AED', symbol: 'AED', tax: 'VAT', taxRate: 5 },
  { slug: 'singapore', label: 'Singapore', fullName: 'Singapore', currency: 'SGD', symbol: 'S$', tax: 'GST', taxRate: 9 },
  { slug: 'netherlands', label: 'Netherlands', fullName: 'Netherlands', currency: 'EUR', symbol: 'EUR', tax: 'BTW', taxRate: 21 }
];

const BLOG_POSTS = [
  { slug: 'how-to-write-a-professional-invoice', title: 'How to Write a Professional Invoice: Complete Guide 2026', desc: 'Learn how to create professional invoices that get paid faster. Includes what to include, invoice numbering, payment terms and free templates.', date: '2026-01-15', readTime: '8 min read', category: 'Guide', content: '<h2>What is an invoice?</h2><p>An invoice is a document sent from a business or freelancer to a client requesting payment for goods or services delivered.</p><h2>What to include in an invoice</h2><ul><li><strong>Invoice number</strong> - a unique reference number</li><li><strong>Your business name and contact details</strong></li><li><strong>Client name and billing address</strong></li><li><strong>Invoice date and payment due date</strong></li><li><strong>Itemised list of services</strong></li><li><strong>Subtotal, tax, and total amount due</strong></li><li><strong>Payment instructions</strong></li></ul><h2>Payment terms explained</h2><ul><li><strong>Net 14</strong> - payment due within 14 days</li><li><strong>Net 30</strong> - payment due within 30 days</li><li><strong>Due on receipt</strong> - payment expected immediately</li></ul><h2>How to get paid faster</h2><p>Send invoices immediately after completing work, include clear payment instructions, and follow up politely after the due date.</p>' },
  { slug: 'invoice-payment-terms-guide', title: 'Invoice Payment Terms: Everything You Need to Know', desc: 'Net 30, Net 14, due on receipt - a complete guide to invoice payment terms and how to choose the right ones for your business.', date: '2026-01-22', readTime: '6 min read', category: 'Guide', content: '<h2>What are payment terms?</h2><p>Payment terms are the conditions under which a seller will complete a sale. They specify when payment is due and accepted payment methods.</p><h2>Common payment terms</h2><ul><li><strong>Net 7</strong> - payment due within 7 days</li><li><strong>Net 14</strong> - payment due within 14 days</li><li><strong>Net 30</strong> - the most common business standard</li><li><strong>Net 60</strong> - common for large corporate clients</li></ul><h2>How to choose</h2><p>For freelancers, shorter terms like Net 14 are better for cash flow. For larger corporate clients, Net 30 to Net 60 is standard.</p>' },
  { slug: 'what-is-vat-invoice', title: 'What is a VAT Invoice? A Complete Guide for 2026', desc: 'Learn what a VAT invoice is, when you need one, what to include, and how VAT rates work in the UK, EU and worldwide.', date: '2026-01-29', readTime: '7 min read', category: 'Tax', content: '<h2>What is a VAT invoice?</h2><p>A VAT invoice includes Value Added Tax and is required by law when the seller is VAT registered.</p><h2>What must a VAT invoice include?</h2><ul><li>Your VAT registration number</li><li>Invoice date and tax point date</li><li>Description of goods or services</li><li>Subtotal excluding VAT</li><li>VAT rate and amount</li><li>Total including VAT</li></ul><h2>VAT rates by country</h2><ul><li><strong>UK</strong> - 20% standard</li><li><strong>Germany</strong> - 19% standard</li><li><strong>France</strong> - 20% standard</li><li><strong>Netherlands</strong> - 21% standard</li></ul>' },
  { slug: 'freelancer-invoice-guide', title: 'How to Invoice as a Freelancer: Complete 2026 Guide', desc: 'Everything freelancers need to know about invoicing clients professionally.', date: '2026-02-05', readTime: '9 min read', category: 'Freelance', content: '<h2>Why freelancers need professional invoices</h2><p>Professional invoices protect you legally and help you get paid faster.</p><h2>What to include in a freelance invoice</h2><ul><li>Your full name or business name</li><li>Client name and company</li><li>Unique invoice number</li><li>Invoice date and payment due date</li><li>Itemised list of services with rates</li><li>Total amount due</li><li>Bank details or payment method</li></ul><h2>When to send your invoice</h2><p>Send your invoice as soon as the work is complete. Delaying invoicing delays payment.</p>' },
  { slug: 'invoice-vs-receipt', title: 'Invoice vs Receipt: What is the Difference?', desc: 'Confused about the difference between an invoice and a receipt? This guide explains when to use each.', date: '2026-02-12', readTime: '5 min read', category: 'Guide', content: '<h2>The key difference</h2><p>An invoice is sent before payment to request money. A receipt is issued after payment to confirm it was received.</p><h2>What is an invoice?</h2><p>An invoice is a request for payment sent after goods or services have been delivered.</p><h2>What is a receipt?</h2><p>A receipt is a confirmation of payment issued after money has changed hands.</p>' },
  { slug: 'how-to-write-invoice-email', title: 'How to Write an Invoice Email: Templates and Examples', desc: 'Professional invoice email templates you can copy and use today.', date: '2026-02-19', readTime: '6 min read', category: 'Templates', content: '<h2>Initial invoice email template</h2><p>Subject: Invoice #INV-001 - Due [Date]</p><p>Hi [Client Name], please find attached invoice #INV-001 totalling [amount]. Payment is due by [due date]. Thank you for your business.</p><h2>Reminder email template</h2><p>Subject: Reminder: Invoice #INV-001 Due [Date]</p><p>Hi [Client Name], a quick reminder that invoice #INV-001 for [amount] is due on [date].</p><h2>Overdue payment template</h2><p>Subject: Overdue Invoice #INV-001 - Action Required</p><p>Hi [Client Name], invoice #INV-001 for [amount] is now overdue. Please confirm the payment status.</p>' },
  { slug: 'gst-invoice-guide', title: 'GST Invoice Guide: Australia, India, Canada, Singapore', desc: 'A complete guide to GST invoices for Australia, India, Canada and Singapore.', date: '2026-02-26', readTime: '7 min read', category: 'Tax', content: '<h2>What is GST?</h2><p>GST stands for Goods and Services Tax. Countries using GST include Australia, Canada, India, Singapore, and New Zealand.</p><h2>GST rates by country</h2><ul><li><strong>Australia</strong> - 10%</li><li><strong>Canada</strong> - 5% federal GST</li><li><strong>India</strong> - 5%, 12%, 18%, or 28%</li><li><strong>Singapore</strong> - 9%</li><li><strong>New Zealand</strong> - 15%</li></ul><h2>How to calculate GST</h2><p>Multiply the pre-tax amount by the GST rate. For 10% GST: $500 x 0.10 = $50 GST. Total = $550.</p>' },
  { slug: 'gst-hst-pst-canada-invoice-guide', title: 'GST, HST and PST on Canadian Invoices: Complete 2026 Guide', desc: 'Everything Canadian freelancers need to know about GST, HST and PST. Rates by province and how to calculate.', date: '2026-04-01', readTime: '8 min read', category: 'Tax', content: '<h2>Canadian sales tax overview</h2><p>Canada has three types of sales tax: GST, HST, and PST. Which tax you charge depends on your province.</p><h2>GST rate</h2><p>The federal GST rate is 5% across all of Canada.</p><h2>HST rates by province</h2><ul><li><strong>Ontario</strong> - 13% HST</li><li><strong>New Brunswick</strong> - 15% HST</li><li><strong>Nova Scotia</strong> - 15% HST</li><li><strong>PEI</strong> - 15% HST</li><li><strong>Newfoundland</strong> - 15% HST</li></ul><h2>PST rates by province</h2><ul><li><strong>BC</strong> - 7% PST + 5% GST = 12%</li><li><strong>Saskatchewan</strong> - 6% PST + 5% GST = 11%</li><li><strong>Manitoba</strong> - 7% RST + 5% GST = 12%</li><li><strong>Quebec</strong> - 9.975% QST + 5% GST = 14.975%</li></ul><h2>Alberta</h2><p>No provincial tax. Only 5% GST applies.</p><h2>How to calculate GST on a Canadian invoice</h2><p>Multiply subtotal by 0.05. Example: CAD 1000 x 0.05 = CAD 50 GST. Total = CAD 1050.</p><h2>What to include on a Canadian invoice</h2><ul><li>GST registration number</li><li>Invoice date</li><li>Description of services</li><li>Amount before tax</li><li>GST/HST rate and amount</li><li>Total including tax</li></ul>' },
  { slug: 'invoice-number-format', title: 'Invoice Numbering: How to Number Your Invoices Correctly', desc: 'The best invoice numbering systems explained for small businesses and freelancers.', date: '2026-03-05', readTime: '5 min read', category: 'Guide', content: '<h2>Why invoice numbering matters</h2><p>Invoice numbers are required for accounting, tax reporting, and dispute resolution.</p><h2>Popular formats</h2><ul><li><strong>Sequential</strong> - INV-001, INV-002</li><li><strong>Date-based</strong> - 20260115-001</li><li><strong>Year-based</strong> - 2026-001</li><li><strong>Client-based</strong> - ACME-001</li></ul><h2>Rules</h2><p>Invoice numbers must be unique and sequential. Never reuse invoice numbers, even if cancelled.</p>' },
  { slug: 'how-to-invoice-international-clients', title: 'How to Invoice International Clients: Currency, Tax and Tips', desc: 'A practical guide to invoicing clients in other countries.', date: '2026-03-12', readTime: '8 min read', category: 'Guide', content: '<h2>Choosing the right currency</h2><p>You can invoice in your local currency or the client currency. Many freelancers invoice in USD or EUR as a neutral currency.</p><h2>Do you charge VAT to international clients?</h2><p>In the UK, services to business clients outside the UK are generally zero-rated for VAT. Always verify with a local accountant.</p><h2>Getting paid internationally</h2><p>Common methods: bank wire transfer, PayPal, Wise, Stripe, and Payoneer. Wise typically offers the best exchange rates.</p>' },
  { slug: 'small-business-invoicing-tips', title: '10 Invoicing Tips for Small Businesses to Get Paid Faster', desc: 'Practical invoicing tips for small business owners to improve cash flow.', date: '2026-03-19', readTime: '7 min read', category: 'Tips', content: '<h2>1. Invoice immediately</h2><p>Send invoices on the day work is delivered.</p><h2>2. Use short payment terms</h2><p>Net 14 consistently outperforms Net 30 for payment speed.</p><h2>3. Make it easy to pay</h2><p>Include bank details directly on the invoice.</p><h2>4. Set up automatic reminders</h2><p>Schedule reminders for 3 days before due date and on the due date.</p><h2>5. Charge late fees</h2><p>A stated late payment policy makes clients take due dates seriously.</p><h2>6. Get a deposit upfront</h2><p>For large projects, require 25-50% deposit before starting.</p><h2>7. Use professional invoice design</h2><p>A clean invoice signals professionalism and gets paid faster.</p>' }
];

const HOW_TO_PAGES = [
  { slug: 'how-to-invoice-as-a-freelancer', title: 'How to Invoice as a Freelancer', desc: 'Step-by-step guide to invoicing clients as a freelancer.' },
  { slug: 'how-to-make-an-invoice-in-word', title: 'How to Make an Invoice in Word (and a Better Alternative)', desc: 'Learn how to create invoices in Microsoft Word and why a free invoice generator is faster.' },
  { slug: 'how-to-send-an-invoice', title: 'How to Send an Invoice: Email, PDF and Best Practices', desc: 'The right way to send invoices to clients.' },
  { slug: 'how-to-calculate-vat-on-invoice', title: 'How to Calculate VAT on an Invoice', desc: 'Simple guide to calculating VAT on invoices with formulas and examples.' },
  { slug: 'how-to-write-invoice-for-cash-payment', title: 'How to Write an Invoice for Cash Payment', desc: 'Create a professional invoice for cash payments.' },
  { slug: 'how-to-create-invoice-without-company', title: 'How to Create an Invoice Without a Registered Company', desc: 'Freelancers and sole traders can invoice without a registered company.' },
  { slug: 'how-to-invoice-us-clients-from-uk', title: 'How to Invoice US Clients from the UK', desc: 'Currency, VAT, tax rules and payment methods for UK freelancers invoicing US clients.' },
  { slug: 'how-to-charge-late-payment-fee', title: 'How to Charge a Late Payment Fee on an Invoice', desc: 'Add late payment clauses to your invoices.' },
  { slug: 'how-to-calculate-gst-on-canadian-invoices', title: 'How to Calculate GST on Canadian Invoices', desc: 'Step-by-step guide to calculating GST, HST and PST on Canadian invoices. Rates by province and free invoice template.' }
];

// ============================================
// PAGE ROUTES
// ============================================
app.get('/', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('index', { isPro, industries: INDUSTRIES, countries: COUNTRIES, page: null, industry: null, country: null, siteUrl: SITE_URL });
});

app.get('/rent-receipt-generator', (req, res) => {
  res.render('rent-receipt');
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

app.get('/blog', (req, res) => {
  res.render('blog-index', { posts: BLOG_POSTS, howTo: HOW_TO_PAGES, siteUrl: SITE_URL });
});

BLOG_POSTS.forEach(post => {
  app.get('/blog/' + post.slug, (req, res) => {
    res.render('blog-post', { post, relatedPosts: BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3), siteUrl: SITE_URL });
  });
});

// SPECIAL: Override for top-performing GST Canada page (custom rich content)
app.get('/how-to-calculate-gst-on-canadian-invoices', (req, res) => {
  res.render('gst-canada-guide');
});

HOW_TO_PAGES.forEach(page => {
  app.get('/' + page.slug, (req, res) => {
    res.render('how-to', { page, industries: INDUSTRIES, siteUrl: SITE_URL });
  });
});

app.get('/activate', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('activate', { isPro });
});

// ============================================
// PDF GENERATION — INVOICE (PDFKit, fast, with watermark)
// ============================================
function renderInvoicePDF(d, res) {
  const isPro = d.isPro === true || d.isPro === 'true';
  const color = d.color || '#2563eb';

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const filename = `invoice-${(d.invoiceNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const symbol = currencySymbol(d.currency || 'USD');

  doc.fontSize(28).fillColor(color).text('INVOICE', 50, 50);
  doc.fontSize(10).fillColor('#666').text(`#${d.invoiceNumber || ''}`, 50, 85);

  doc.fontSize(11).fillColor('#111').text(d.senderName || '', 350, 50, { width: 200, align: 'right' });
  doc.fontSize(9).fillColor('#555')
    .text(d.senderEmail || '', 350, 68, { width: 200, align: 'right' })
    .text(d.senderAddress || '', 350, 82, { width: 200, align: 'right' });

  let y = 140;
  doc.fontSize(10).fillColor('#666').text('BILL TO', 50, y);
  doc.fontSize(12).fillColor('#111').text(d.clientName || '', 50, y + 15);
  doc.fontSize(9).fillColor('#555')
    .text(d.clientEmail || '', 50, y + 32)
    .text(d.clientAddress || '', 50, y + 46);

  doc.fontSize(10).fillColor('#666').text('ISSUE DATE', 350, y, { width: 200, align: 'right' });
  doc.fontSize(11).fillColor('#111').text(d.issueDate || '', 350, y + 15, { width: 200, align: 'right' });
  doc.fontSize(10).fillColor('#666').text('DUE DATE', 350, y + 35, { width: 200, align: 'right' });
  doc.fontSize(11).fillColor('#111').text(d.dueDate || '', 350, y + 50, { width: 200, align: 'right' });

  y = 230;
  doc.rect(50, y, 500, 25).fill(color);
  doc.fillColor('#fff').fontSize(10)
    .text('DESCRIPTION', 60, y + 8)
    .text('QTY', 320, y + 8, { width: 50, align: 'right' })
    .text('RATE', 380, y + 8, { width: 70, align: 'right' })
    .text('AMOUNT', 460, y + 8, { width: 80, align: 'right' });

  y += 35;
  let subtotal = 0;
  const items = Array.isArray(d.items) ? d.items : [];
  items.forEach(item => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = qty * rate;
    subtotal += amount;
    doc.fillColor('#111').fontSize(10)
      .text(item.description || '', 60, y, { width: 250 })
      .text(String(qty), 320, y, { width: 50, align: 'right' })
      .text(`${symbol}${rate.toFixed(2)}`, 380, y, { width: 70, align: 'right' })
      .text(`${symbol}${amount.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
    y += 22;
  });

  const taxRate = parseFloat(d.taxRate) || 0;
  const taxLabel = d.taxLabel || 'Tax';
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  y += 15;
  doc.moveTo(350, y).lineTo(550, y).strokeColor('#ddd').stroke();
  y += 10;
  doc.fontSize(10).fillColor('#666').text('Subtotal', 350, y, { width: 100, align: 'right' });
  doc.fillColor('#111').text(`${symbol}${subtotal.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
  y += 18;

  if (taxRate > 0) {
    doc.fillColor('#666').text(`${taxLabel} (${taxRate}%)`, 350, y, { width: 100, align: 'right' });
    doc.fillColor('#111').text(`${symbol}${taxAmount.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
    y += 18;
  }

  doc.moveTo(350, y).lineTo(550, y).strokeColor(color).lineWidth(2).stroke();
  y += 8;
  doc.fontSize(13).fillColor('#111').text('TOTAL DUE', 350, y, { width: 100, align: 'right' });
  doc.fillColor(color).text(`${symbol}${total.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

  if (d.notes) {
    y += 50;
    doc.fontSize(10).fillColor('#666').text('NOTES', 50, y);
    doc.fontSize(10).fillColor('#333').text(d.notes, 50, y + 15, { width: 500 });
  }

  if (!isPro) {
    doc.fontSize(8).fillColor('#999').text(
      'Created with GetInvoiceMaker.com - Free invoice generator',
      50, 780, { width: 500, align: 'center' }
    );
  }

  doc.end();
}

app.post('/api/pdf', (req, res) => {
  try { renderInvoicePDF(req.body || {}, res); }
  catch (err) { console.error('PDF error:', err); res.status(500).json({ error: err.message }); }
});

// Backward compat for old /generate-pdf
app.post('/generate-pdf', (req, res) => {
  try {
    let payload = req.body || {};
    if (payload.invoiceData && typeof payload.invoiceData === 'string') {
      try { payload = JSON.parse(payload.invoiceData); } catch (e) {}
    }
    const isPro = req.cookies.pro === 'true' || payload.isPro === true;
    const mapped = {
      senderName: payload.fromName || payload.senderName,
      senderEmail: payload.fromEmail || payload.senderEmail,
      senderAddress: payload.fromAddress || payload.senderAddress,
      clientName: payload.toName || payload.clientName,
      clientEmail: payload.toEmail || payload.clientEmail,
      clientAddress: payload.toAddress || payload.clientAddress,
      invoiceNumber: payload.invoiceNumber || payload.invNum,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      notes: payload.notes,
      taxRate: payload.taxRate || payload.tr,
      taxLabel: payload.taxLabel || payload.tl,
      items: (payload.items || []).map(i => ({ description: i.description || i.desc, qty: i.qty, rate: i.rate })),
      currency: payload.currency || 'USD',
      color: payload.color || '#2563eb',
      isPro: isPro
    };
    renderInvoicePDF(mapped, res);
  } catch (err) { console.error('PDF error:', err); res.status(500).json({ error: err.message }); }
});

// ============================================
// PDF — RENT RECEIPT
// ============================================
app.post('/api/rent-receipt-pdf', (req, res) => {
  try {
    const d = req.body || {};
    const isPro = d.isPro === true || d.isPro === 'true' || req.cookies.pro === 'true';
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `rent-receipt-${(d.receiptNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const symbol = currencySymbol(d.currency || 'USD');
    const amount = parseFloat(d.amount) || 0;

    doc.fontSize(28).fillColor('#2563eb').text('RENT RECEIPT', 50, 50);
    doc.fontSize(10).fillColor('#666').text(`Receipt #${d.receiptNumber || ''}`, 50, 85);
    doc.fontSize(10).fillColor('#666').text(`Date: ${d.receiptDate || ''}`, 350, 85, { width: 200, align: 'right' });

    let y = 140;
    doc.fontSize(11).fillColor('#666').text('RECEIVED FROM (TENANT)', 50, y);
    doc.fontSize(13).fillColor('#111').text(d.tenantName || '', 50, y + 18);
    y += 60;
    doc.fontSize(11).fillColor('#666').text('PAID TO (LANDLORD)', 50, y);
    doc.fontSize(13).fillColor('#111').text(d.landlordName || '', 50, y + 18);
    y += 60;
    doc.fontSize(11).fillColor('#666').text('PROPERTY ADDRESS', 50, y);
    doc.fontSize(11).fillColor('#111').text(d.propertyAddress || '', 50, y + 18, { width: 500 });
    y += 70;
    doc.fontSize(11).fillColor('#666').text('PERIOD COVERED', 50, y);
    doc.fontSize(11).fillColor('#111').text(`${d.periodFrom || ''} to ${d.periodTo || ''}`, 50, y + 18);
    y += 60;
    doc.rect(50, y, 500, 60).fill('#f3f4f6');
    doc.fillColor('#666').fontSize(11).text('AMOUNT RECEIVED', 70, y + 15);
    doc.fillColor('#111').fontSize(22).text(`${symbol}${amount.toFixed(2)}`, 70, y + 30);
    doc.fillColor('#666').fontSize(10).text(`Payment method: ${d.paymentMethod || 'Cash'}`, 350, y + 35, { width: 180, align: 'right' });
    y += 100;
    doc.fontSize(10).fillColor('#666').text('SIGNATURE (LANDLORD)', 50, y);
    doc.moveTo(50, y + 40).lineTo(250, y + 40).strokeColor('#333').stroke();

    if (!isPro) {
      doc.fontSize(8).fillColor('#999').text(
        'Created with GetInvoiceMaker.com/rent-receipt-generator',
        50, 780, { width: 500, align: 'center' }
      );
    }
    doc.end();
  } catch (err) { console.error('Rent PDF error:', err); res.status(500).json({ error: err.message }); }
});

function currencySymbol(code) {
  const map = {
    USD: '$', GBP: 'GBP ', EUR: 'EUR ', CAD: 'CA$', AUD: 'A$', INR: 'Rs.',
    AED: 'AED ', SGD: 'S$', TRY: 'TL ', JPY: 'JPY ', CHF: 'CHF ',
    SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', NZD: 'NZ$', ZAR: 'R',
    BRL: 'R$', MXN: 'MX$'
  };
  return map[code] || code + ' ';
}

// ============================================
// GUMROAD + PRO ACTIVATION
// ============================================
app.post('/gumroad-webhook', (req, res) => {
  try {
    const { email, sale_timestamp } = req.body;
    if (email) {
      users[email.toLowerCase()] = { pro: true, since: sale_timestamp || new Date().toISOString() };
      console.log('NEW PRO:', email);
    }
  } catch (e) { console.error('Webhook error:', e.message); }
  res.sendStatus(200);
});

app.post('/activate-pro', (req, res) => {
  const { email } = req.body;
  if (email && users[email.toLowerCase()] && users[email.toLowerCase()].pro) {
    res.cookie('pro', 'true', { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'No PRO purchase found.' });
  }
});

// ============================================
// SEO: SITEMAP, ROBOTS, GOOGLE VERIFICATION
// ============================================
app.get('/googlefcff82c355800720.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googlefcff82c355800720.html'); });
app.get('/googleac988ee36fede317.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googleac988ee36fede317.html'); });

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: '', priority: '1.0', freq: 'daily' },
    { loc: '/blog', priority: '0.9', freq: 'weekly' },
    { loc: '/rent-receipt-generator', priority: '0.9', freq: 'weekly' },
    { loc: '/activate', priority: '0.3', freq: 'monthly' }
  ];
  INDUSTRIES.forEach(i => urls.push({ loc: '/invoice-template-' + i.slug, priority: '0.9', freq: 'weekly' }));
  COUNTRIES.forEach(c => urls.push({ loc: '/free-invoice-generator-' + c.slug, priority: '0.9', freq: 'weekly' }));
  BLOG_POSTS.forEach(p => urls.push({ loc: '/blog/' + p.slug, priority: '0.8', freq: 'monthly' }));
  HOW_TO_PAGES.forEach(p => urls.push({ loc: '/' + p.slug, priority: '0.8', freq: 'monthly' }));
  const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(u => '<url><loc>' + SITE_URL + u.loc + '</loc><changefreq>' + u.freq + '</changefreq><priority>' + u.priority + '</priority></url>').join('') + '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('InvoiceMaker running on ' + PORT));