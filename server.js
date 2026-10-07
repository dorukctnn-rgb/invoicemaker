const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { BLOG_CONTENT, HOWTO_CONTENT } = require('./content');
const INDUSTRIES = require('./data/industries');
const PROVINCES = require('./data/province-pages');
const CANADA = require('./data/canada-rates');
const pro = require('./lib/pro');
const { renderInvoicePDF, currencySymbol, applyFonts } = require('./lib/pdf');

const app = express();
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

const SITE_URL = 'https://getinvoicemaker.com';
const INDEXNOW_KEY = '9bae98d6c8b68a7fed8b3a4cec53243f';
// What the Pro plan costs, as stated on the Gumroad checkout. Keep in sync with the product.
const PRO_PRICE = { label: '$9/month', amount: '9', currency: 'USD', period: 'per month, cancel anytime' };

// The province calculator pages must show the same rates as the central table.
PROVINCES.forEach(p => {
  const r = CANADA.PROVINCES.find(x => x.code === p.code);
  if (!r || r.total !== p.combined) throw new Error('Province rate mismatch for ' + p.slug);
  p.rates = r;
});

const COUNTRIES = [
  { slug: 'uk', label: 'UK', fullName: 'United Kingdom', currency: 'GBP', tax: 'VAT', taxRate: 20, idLabel: 'VAT registration number', idPlaceholder: 'GB123456789',
    desc: 'Free UK invoice generator in GBP with a 20% VAT line. Download a PDF invoice in a minute. No signup.' },
  { slug: 'usa', label: 'USA', fullName: 'United States', currency: 'USD', tax: 'Sales tax', taxRate: 0, idLabel: 'EIN or business ID', idPlaceholder: 'e.g. EIN 12-3456789',
    desc: 'Free US invoice generator in USD. Add a sales tax line only if you collect it and download a PDF invoice in a minute. No signup.',
    intro: 'Create a US invoice in dollars. There is no federal sales tax; add a sales tax line only if your state and product require you to collect it.',
    about: 'The United States has no national VAT or GST. Sales tax is set by states and local governments and usually applies to goods and some services, so many freelancers and service businesses invoice without any tax line. If you do collect sales tax, enter your combined rate in the tax field and name it, for example "Sales tax (CA)".' },
  { slug: 'canada', label: 'Canada', fullName: 'Canada', currency: 'CAD', tax: 'GST/HST', taxRate: 5, idLabel: 'GST/HST registration number', idPlaceholder: '123456789 RT0001',
    desc: 'Free Canadian invoice generator in CAD. Pick the province and the GST, HST, PST or QST lines fill in at current rates. Download a PDF. No signup.',
    intro: 'Choose your client\'s province and the invoice gets the right tax lines: one HST line, GST only, or GST plus PST/RST/QST on separate lines.' },
  { slug: 'australia', label: 'Australia', fullName: 'Australia', currency: 'AUD', tax: 'GST', taxRate: 10 },
  { slug: 'germany', label: 'Germany', fullName: 'Germany', currency: 'EUR', tax: 'MwSt', taxRate: 19, idLabel: 'USt-IdNr. or Steuernummer', idPlaceholder: 'DE123456789',
    desc: 'Free invoice generator for Germany in EUR with a 19% or 7% MwSt line. Download a PDF invoice (Rechnung) in a minute. No signup.',
    intro: 'Create an invoice (Rechnung) in euros with a MwSt line at 19% or 7% and download it as a PDF.',
    about: 'Germany charges VAT (Umsatzsteuer, often shown as MwSt) at 19% as the standard rate and 7% for reduced-rate items. Put your Steuernummer or USt-IdNr. in the business ID field. Small businesses using the Kleinunternehmerregelung charge no VAT and say so on the invoice; ask your Steuerberater which applies to you.' },
  { slug: 'france', label: 'France', fullName: 'France', currency: 'EUR', tax: 'TVA', taxRate: 20, idLabel: 'SIRET and TVA number', idPlaceholder: 'SIRET 123 456 789 00012 · FR12345678901',
    desc: 'Free invoice generator for France in EUR with a TVA line at 20%, 10% or 5.5%. Download a PDF invoice (facture) in a minute. No signup.',
    intro: 'Create a facture in euros with a TVA line at the standard 20% or a reduced rate, and download it as a PDF.',
    about: 'France charges TVA at 20% as the standard rate, with reduced rates for some goods and services. Show your SIRET and, if you have one, your intra-EU TVA number. Micro-entrepreneurs under the franchise en base de TVA charge no TVA and add the mention required for that scheme; check with your accountant or the impots.gouv.fr guidance.' },
  { slug: 'india', label: 'India', fullName: 'India', currency: 'INR', tax: 'GST', taxRate: 18, idLabel: 'GSTIN', idPlaceholder: '22AAAAA0000A1Z5',
    desc: 'Free invoice generator for India in INR with a GST line. Download a PDF invoice in a minute. No signup.',
    intro: 'Create an invoice in rupees with a GST line and your GSTIN, then download it as a PDF.',
    about: 'Enter the GST rate that applies to your goods or services in the tax field (18% is pre-filled because it covers many services). For intra-state supplies you can use the two tax lines for CGST and SGST (half the rate each); for inter-state supplies use one IGST line. Add your GSTIN in the business ID field.' },
  { slug: 'uae', label: 'UAE', fullName: 'United Arab Emirates', currency: 'AED', tax: 'VAT', taxRate: 5, idLabel: 'TRN (tax registration number)', idPlaceholder: '100123456700003',
    desc: 'Free invoice generator for the UAE in AED with a 5% VAT line. Download a PDF invoice in a minute. No signup.',
    intro: 'Create an invoice in dirhams with a 5% VAT line and your TRN, then download it as a PDF.',
    about: 'The UAE standard VAT rate is 5%. If you are VAT-registered, put your TRN in the business ID field and title the document as a tax invoice where the rules require it.' },
  { slug: 'singapore', label: 'Singapore', fullName: 'Singapore', currency: 'SGD', tax: 'GST', taxRate: 9, idLabel: 'GST registration number / UEN', idPlaceholder: 'M2-1234567-8',
    desc: 'Free invoice generator for Singapore in SGD with a 9% GST line. Download a PDF invoice in a minute. No signup.',
    intro: 'Create an invoice in Singapore dollars with a 9% GST line, then download it as a PDF.',
    about: 'Singapore GST is 9%. Only GST-registered businesses may charge it; if you are not registered, leave the tax field empty. Registered businesses should show their GST registration number.' },
  { slug: 'netherlands', label: 'Netherlands', fullName: 'Netherlands', currency: 'EUR', tax: 'BTW', taxRate: 21 }
];
const COUNTRY_SOURCES = {
  uk: { name: 'GOV.UK: VAT rates', url: 'https://www.gov.uk/vat-rates' },
  germany: { name: 'UStG § 12 (Steuersätze), gesetze-im-internet.de', url: 'https://www.gesetze-im-internet.de/ustg_1980/__12.html' },
  france: { name: 'Service-Public Entreprendre: taux de TVA', url: 'https://entreprendre.service-public.gouv.fr/vosdroits/F22399' },
  india: { name: 'CBIC: GST rates for goods and services', url: 'https://cbic-gst.gov.in/gst-goods-services-rates.html' },
  uae: { name: 'UAE Federal Tax Authority: VAT', url: 'https://tax.gov.ae/en/taxes/vat.aspx' },
  singapore: { name: 'IRAS: Current GST rates', url: 'https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/current-gst-rates' }
};
COUNTRIES.forEach(c => { c.source = COUNTRY_SOURCES[c.slug] || null; });
const COUNTRY_RATES_CHECKED = '7 October 2026';

// Generator presets. Everything the shared generator partial needs comes from here.
const GEN_DEFAULT = {
  key: 'home', currency: 'USD', lang: 'en', taxes: [], items: [{ qty: 1, rate: 100 }],
  itemPlaceholder: 'Service or product description',
  senderIdLabel: 'Tax or business ID', senderIdPlaceholder: 'e.g. VAT GB123456789, ABN, EIN',
  clientIdLabel: 'Client tax ID', clientIdPlaceholder: 'e.g. client VAT number',
  notesPlaceholder: 'Bank details, payment terms, a thank-you note',
  invoicePrefix: 'INV-', provinces: null, province: '', ratesChecked: CANADA.RATES_CHECKED
};
function genConfig(o) { return Object.assign({}, GEN_DEFAULT, o || {}); }
function countryGen(c) {
  const g = { key: 'country-' + c.slug, currency: c.currency, senderIdLabel: c.idLabel || GEN_DEFAULT.senderIdLabel, senderIdPlaceholder: c.idPlaceholder || GEN_DEFAULT.senderIdPlaceholder };
  if (c.slug === 'canada') {
    Object.assign(g, { provinces: CANADA.PROVINCES, taxes: [], clientIdLabel: 'Client business number', clientIdPlaceholder: 'Optional' });
  } else if (c.slug === 'india') {
    g.taxes = [{ label: 'GST', rate: 18 }];
  } else if (c.taxRate) {
    g.taxes = [{ label: c.tax, rate: c.taxRate }];
  }
  return genConfig(g);
}
const NL_GEN = genConfig({
  key: 'netherlands', currency: 'EUR', lang: 'nl-en', taxes: [{ label: 'BTW', rate: 21 }], invoicePrefix: '2026-',
  items: [{ desc: 'Webdesign: homepage en productpagina (uren)', qty: 20, rate: 85 }, { desc: 'Hosting setup', qty: 1, rate: 150 }],
  itemPlaceholder: 'Omschrijving / description',
  senderIdLabel: 'KVK-nummer and btw-id', senderIdPlaceholder: 'KVK 12345678 · btw-id NL123456789B01',
  clientIdLabel: 'Client btw-id (required for btw verlegd)', clientIdPlaceholder: 'e.g. NL987654321B01 or DE123456789',
  senderPlaceholder: 'De Vries Design', addressPlaceholder: 'Keizersgracht 112, 1015 CV Amsterdam', clientPlaceholder: 'Bloem & Co B.V.',
  notesPlaceholder: 'Betaling binnen 30 dagen op IBAN NL00 BANK 0123 4567 89 o.v.v. het factuurnummer.'
});
function industryGen(ind) {
  return genConfig({ key: 'industry-' + ind.slug, items: ind.items, itemPlaceholder: ind.itemPlaceholder, notesPlaceholder: ind.notes || GEN_DEFAULT.notesPlaceholder });
}

// Defaults every view can rely on.
app.use((req, res, next) => {
  res.locals.siteUrl = SITE_URL;
  res.locals.checkout = pro.checkoutState();
  res.locals.proPrice = PRO_PRICE;
  res.locals.isPro = false;
  res.locals.canada = CANADA;
  next();
});
async function withPro(req, res, next) {
  res.locals.isPro = await pro.isProRequest(req);
  next();
}

const BLOG_POSTS = [
  { slug: 'how-to-write-a-professional-invoice', title: 'How to Write a Professional Invoice: Complete Guide 2026', desc: 'Learn how to create professional invoices that get paid faster.', date: '2026-01-15', readTime: '8 min read', category: 'Guide', content: '<h2>What is an invoice?</h2><p>An invoice is a document sent from a business or freelancer to a client requesting payment for goods or services delivered.</p><h2>What to include in an invoice</h2><ul><li><strong>Invoice number</strong> - a unique reference number</li><li><strong>Your business name and contact details</strong></li><li><strong>Client name and billing address</strong></li><li><strong>Invoice date and payment due date</strong></li><li><strong>Itemised list of services</strong></li><li><strong>Subtotal, tax, and total amount due</strong></li><li><strong>Payment instructions</strong></li></ul>' },
  { slug: 'invoice-payment-terms-guide', title: 'Invoice Payment Terms: Everything You Need to Know', desc: 'Net 30, Net 14, due on receipt - a complete guide to invoice payment terms.', date: '2026-01-22', readTime: '6 min read', category: 'Guide', content: '<h2>What are payment terms?</h2><p>Payment terms are the conditions under which a seller will complete a sale.</p>' },
  { slug: 'what-is-vat-invoice', title: 'What is a VAT Invoice? A Complete Guide for 2026', desc: 'Learn what a VAT invoice is, when you need one, what to include, and how VAT rates work.', date: '2026-01-29', readTime: '7 min read', category: 'Tax', content: '<h2>What is a VAT invoice?</h2><p>A VAT invoice includes Value Added Tax and is required by law when the seller is VAT registered.</p><p>For UK businesses, see our <a href="/free-invoice-generator-uk">UK VAT invoice generator</a>. For Dutch businesses, see our <a href="/free-invoice-generator-netherlands">Dutch BTW invoice template</a>.</p>' },
  { slug: 'invoice-vs-receipt', title: 'Invoice vs Receipt: What is the Difference?', desc: 'This guide explains when to use each.', date: '2026-02-12', readTime: '5 min read', category: 'Guide', content: '<h2>The key difference</h2><p>An invoice is sent before payment to request money. A receipt is issued after payment to confirm it was received.</p>' },
  { slug: 'how-to-write-invoice-email', title: 'How to Write an Invoice Email: Templates and Examples', desc: 'Professional invoice email templates you can copy and use today.', date: '2026-02-19', readTime: '6 min read', category: 'Templates', content: '<h2>Initial invoice email template</h2><p>Hi [Client Name], please find attached invoice #INV-001 totalling [amount].</p>' },
  { slug: 'gst-invoice-guide', title: 'GST Invoice Guide: Australia, India, Canada, Singapore', desc: 'A complete guide to GST invoices for Australia, India, Canada and Singapore.', date: '2026-02-26', readTime: '7 min read', category: 'Tax', content: '<h2>What is GST?</h2><p>GST stands for Goods and Services Tax.</p><p>For an interactive calculator with all Canadian provinces, visit our <a href="/how-to-calculate-gst-on-canadian-invoices">Canadian GST calculator</a>. For Australian businesses, see our <a href="/free-invoice-generator-australia">Australia GST calculator</a>.</p>' },
  { slug: 'invoice-number-format', title: 'Invoice Numbering: How to Number Your Invoices Correctly', desc: 'The best invoice numbering systems explained for small businesses and freelancers.', date: '2026-03-05', readTime: '5 min read', category: 'Guide', content: '<h2>Why invoice numbering matters</h2><p>Invoice numbers are required for accounting, tax reporting, and dispute resolution.</p>' },
  { slug: 'how-to-invoice-international-clients', title: 'How to Invoice International Clients: Currency, Tax and Tips', desc: 'A practical guide to invoicing clients in other countries.', date: '2026-03-12', readTime: '8 min read', category: 'Guide', content: '<h2>Choosing the right currency</h2><p>You can invoice in your local currency or the client currency.</p>' },
  { slug: 'small-business-invoicing-tips', title: '10 Invoicing Tips for Small Businesses to Get Paid Faster', desc: 'Practical invoicing tips for small business owners to improve cash flow.', date: '2026-03-19', readTime: '7 min read', category: 'Tips', content: '<h2>1. Invoice immediately</h2><p>Send invoices on the day work is delivered.</p>' }
];

// Old URLs consolidated into stronger pages (avoids two pages competing for one query).
const BLOG_REDIRECTS = {
  'freelancer-invoice-guide': '/how-to-invoice-as-a-freelancer',
  'gst-hst-pst-canada-invoice-guide': '/how-to-calculate-gst-on-canadian-invoices'
};

const HOW_TO_PAGES = [
  { slug: 'how-to-invoice-as-a-freelancer', title: 'How to Invoice as a Freelancer', desc: 'Step-by-step guide to invoicing clients as a freelancer.' },
  { slug: 'how-to-make-an-invoice-in-word', title: 'How to Make an Invoice in Word (and a Better Alternative)', desc: 'Learn how to create invoices in Microsoft Word.' },
  { slug: 'how-to-send-an-invoice', title: 'How to Send an Invoice: Email, PDF and Best Practices', desc: 'The right way to send invoices to clients.' },
  { slug: 'how-to-calculate-vat-on-invoice', title: 'How to Calculate VAT on an Invoice', desc: 'Simple guide to calculating VAT on invoices.' },
  { slug: 'how-to-write-invoice-for-cash-payment', title: 'How to Write an Invoice for Cash Payment', desc: 'Create a professional invoice for cash payments.' },
  { slug: 'how-to-create-invoice-without-company', title: 'How to Create an Invoice Without a Registered Company', desc: 'Freelancers can invoice without a registered company.' },
  { slug: 'how-to-invoice-us-clients-from-uk', title: 'How to Invoice US Clients from the UK', desc: 'Currency, VAT, tax rules for UK freelancers.' },
  { slug: 'how-to-charge-late-payment-fee', title: 'How to Charge a Late Payment Fee on an Invoice', desc: 'Add late payment clauses to your invoices.' }
];


const CONTENT_UPDATED = '2026-09-24';
const PAGES_UPDATED = '2026-10-07';
BLOG_POSTS.forEach(post => {
  if (BLOG_CONTENT[post.slug]) post.content = BLOG_CONTENT[post.slug];
  const words = post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  post.readTime = Math.max(2, Math.round(words / 220)) + ' min read';
  post.updated = post.updated || CONTENT_UPDATED;
});
HOW_TO_PAGES.forEach(page => Object.assign(page, HOWTO_CONTENT[page.slug] || {}, { updated: page.updated || CONTENT_UPDATED }));

['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png'].forEach(f => {
  app.get('/' + f, (req, res) => res.sendFile(path.join(__dirname, 'public', f)));
});
app.get('/' + INDEXNOW_KEY + '.txt', (req, res) => res.type('text/plain').send(INDEXNOW_KEY));

app.get('/', withPro, (req, res) => {
  res.render('index', { industries: INDUSTRIES, countries: COUNTRIES, gen: genConfig() });
});

app.get('/rent-receipt-generator', (req, res) => res.render('rent-receipt'));

app.get('/how-to-calculate-gst-on-canadian-invoices', (req, res) => {
  res.render('gst-canada-guide', { provinces: PROVINCES });
});

app.get('/free-invoice-generator-netherlands', withPro, (req, res) => {
  res.render('netherlands-btw-guide', { gen: NL_GEN });
});

app.get('/free-invoice-generator-uk', (req, res) => res.render('uk-vat-guide'));
app.get('/free-invoice-generator-australia', (req, res) => res.render('australia-gst-guide'));

PROVINCES.forEach(prov => {
  app.get('/' + prov.slug, (req, res) => res.render('province-guide', { province: prov, provinces: PROVINCES }));
});

INDUSTRIES.forEach(ind => {
  app.get('/invoice-template-' + ind.slug, withPro, (req, res) => {
    res.render('industry', { industries: INDUSTRIES, industry: ind, gen: industryGen(ind) });
  });
});

COUNTRIES.forEach(c => {
  if (c.slug === 'netherlands' || c.slug === 'uk' || c.slug === 'australia') return;
  app.get('/free-invoice-generator-' + c.slug, withPro, (req, res) => {
    res.render('country', { countries: COUNTRIES, country: c, gen: countryGen(c), ratesChecked: COUNTRY_RATES_CHECKED, provinces: PROVINCES });
  });
});

app.get('/blog', (req, res) => res.render('blog-index', { posts: BLOG_POSTS, howTo: HOW_TO_PAGES }));

Object.entries(BLOG_REDIRECTS).forEach(([from, to]) => {
  app.get('/blog/' + from, (req, res) => res.redirect(301, to));
});

BLOG_POSTS.forEach(post => {
  app.get('/blog/' + post.slug, (req, res) => {
    const others = BLOG_POSTS.filter(p => p.slug !== post.slug);
    const relatedPosts = others.filter(p => p.category === post.category).concat(others.filter(p => p.category !== post.category)).slice(0, 3);
    res.render('blog-post', { post, relatedPosts });
  });
});

HOW_TO_PAGES.forEach(page => {
  app.get('/' + page.slug, (req, res) => res.render('how-to', { page, industries: INDUSTRIES, howTo: HOW_TO_PAGES }));
});

app.get('/activate', withPro, (req, res) => res.render('activate'));

pro.register(app);

app.post('/api/pdf', async (req, res) => {
  try {
    const isPro = await pro.isProRequest(req);
    renderInvoicePDF(req.body || {}, isPro, res);
  } catch (err) {
    console.error('PDF error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Could not create the PDF.' });
  }
});

// Older pages (and cached copies of them) post here with a different field layout.
app.post('/generate-pdf', async (req, res) => {
  try {
    let payload = req.body || {};
    if (payload.invoiceData && typeof payload.invoiceData === 'string') {
      try { payload = JSON.parse(payload.invoiceData); } catch (e) { payload = {}; }
    }
    const isPro = await pro.isProRequest(req);
    renderInvoicePDF(payload, isPro, res);
  } catch (err) {
    console.error('PDF error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Could not create the PDF.' });
  }
});

app.post('/api/rent-receipt-pdf', async (req, res) => {
  try {
    const d = req.body || {};
    const isPro = await pro.isProRequest(req);
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    applyFonts(doc);
    const filename = `rent-receipt-${String(d.receiptNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
    const symbol = currencySymbol(d.currency || 'USD');
    const amount = parseFloat(d.amount) || 0;
    const s = v => (typeof v === 'string' ? v.slice(0, 300) : '');

    doc.fontSize(28).fillColor('#2563eb').text('RENT RECEIPT', 50, 50);
    doc.fontSize(10).fillColor('#666').text(`Receipt #${s(d.receiptNumber)}`, 50, 85);
    doc.fontSize(10).fillColor('#666').text(`Date: ${s(d.receiptDate)}`, 350, 85, { width: 200, align: 'right' });

    let y = 140;
    doc.fontSize(11).fillColor('#666').text('RECEIVED FROM (TENANT)', 50, y);
    doc.fontSize(13).fillColor('#111').text(s(d.tenantName), 50, y + 18);
    y += 60;
    doc.fontSize(11).fillColor('#666').text('PAID TO (LANDLORD)', 50, y);
    doc.fontSize(13).fillColor('#111').text(s(d.landlordName), 50, y + 18);
    y += 60;
    doc.fontSize(11).fillColor('#666').text('PROPERTY ADDRESS', 50, y);
    doc.fontSize(11).fillColor('#111').text(s(d.propertyAddress), 50, y + 18, { width: 500 });
    y += 70;
    doc.fontSize(11).fillColor('#666').text('PERIOD COVERED', 50, y);
    doc.fontSize(11).fillColor('#111').text(`${s(d.periodFrom)} to ${s(d.periodTo)}`, 50, y + 18);
    y += 60;
    doc.rect(50, y, 500, 60).fill('#f3f4f6');
    doc.fillColor('#666').fontSize(11).text('AMOUNT RECEIVED', 70, y + 15);
    doc.fillColor('#111').fontSize(22).text(`${symbol}${amount.toFixed(2)}`, 70, y + 30);
    doc.fillColor('#666').fontSize(10).text(`Payment method: ${s(d.paymentMethod) || 'Cash'}`, 350, y + 35, { width: 180, align: 'right' });
    y += 100;
    doc.fontSize(10).fillColor('#666').text('SIGNATURE (LANDLORD)', 50, y);
    doc.moveTo(50, y + 40).lineTo(250, y + 40).strokeColor('#333').stroke();

    if (!isPro) {
      doc.fontSize(8).fillColor('#999').text('Created with GetInvoiceMaker.com/rent-receipt-generator', 50, 780, { width: 500, align: 'center' });
    }
    doc.end();
  } catch (err) {
    console.error('Rent PDF error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Could not create the PDF.' });
  }
});

app.get('/googlefcff82c355800720.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googlefcff82c355800720.html'); });
app.get('/googleac988ee36fede317.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googleac988ee36fede317.html'); });

// Every indexable page with the date its content last changed.
function sitemapEntries() {
  const urls = [
    { loc: '/', lastmod: PAGES_UPDATED },
    { loc: '/how-to-calculate-gst-on-canadian-invoices', lastmod: PAGES_UPDATED },
    { loc: '/free-invoice-generator-netherlands', lastmod: PAGES_UPDATED },
    { loc: '/blog', lastmod: CONTENT_UPDATED },
    { loc: '/rent-receipt-generator', lastmod: CONTENT_UPDATED },
    { loc: '/free-invoice-generator-uk', lastmod: CONTENT_UPDATED },
    { loc: '/free-invoice-generator-australia', lastmod: CONTENT_UPDATED }
  ];
  INDUSTRIES.forEach(i => urls.push({ loc: '/invoice-template-' + i.slug, lastmod: PAGES_UPDATED }));
  COUNTRIES.forEach(c => {
    if (['netherlands', 'uk', 'australia'].includes(c.slug)) return;
    urls.push({ loc: '/free-invoice-generator-' + c.slug, lastmod: PAGES_UPDATED });
  });
  PROVINCES.forEach(p => urls.push({ loc: '/' + p.slug, lastmod: PAGES_UPDATED }));
  BLOG_POSTS.forEach(p => urls.push({ loc: '/blog/' + p.slug, lastmod: p.updated }));
  HOW_TO_PAGES.forEach(p => urls.push({ loc: '/' + p.slug, lastmod: p.updated }));
  return urls;
}
app.get('/sitemap.xml', (req, res) => {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemapEntries().map(u => '<url><loc>' + SITE_URL + (u.loc === '/' ? '/' : u.loc) + '</loc><lastmod>' + u.lastmod + '</lastmod></url>').join('\n') + '\n</urlset>\n';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /activate\nDisallow: /api/\n\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
});

app.use((req, res) => {
  res.status(404).render('not-found', { industries: INDUSTRIES });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('InvoiceMaker running on ' + PORT));
