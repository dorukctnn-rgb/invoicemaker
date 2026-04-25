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
  { slug: 'contractor', label: 'Contractors', desc: 'Contractor invoice generator. Professional invoices with tax, materials and labour. Free PDF.', h1: 'Free Contractor Invoice Template', intro: 'Generate contractor invoices instantly. Include labour, materials, and tax. Download clean PDF invoices for any contracting job.' },
  { slug: 'photographer', label: 'Photographers', desc: 'Photography invoice template. Bill clients for shoots, editing and licensing. Free PDF download.', h1: 'Free Photography Invoice Template', intro: 'Professional invoice template for photographers. Bill clients for shoot time, editing, travel and licensing fees.' },
  { slug: 'consultant', label: 'Consultants', desc: 'Consulting invoice generator. Itemise your services and get paid faster. Free PDF.', h1: 'Free Consulting Invoice Template', intro: 'Create professional consulting invoices in seconds. Itemise your consulting services, daily rate or project fee.' },
  { slug: 'designer', label: 'Graphic Designers', desc: 'Graphic design invoice maker. Send branded invoices for design projects. Free download.', h1: 'Free Graphic Design Invoice Template', intro: 'Invoice template built for graphic designers. Bill clients for logo design, branding, web design and other creative services.' },
  { slug: 'developer', label: 'Web Developers', desc: 'Web developer invoice generator. Bill clients for development and maintenance. Free PDF.', h1: 'Free Web Developer Invoice Template', intro: 'Invoice generator for web developers and software engineers. Bill for development hours, retainers, hosting and maintenance.' },
  { slug: 'plumber', label: 'Plumbers', desc: 'Plumbing invoice template. Include parts, labour and VAT automatically. Free PDF.', h1: 'Free Plumbing Invoice Template', intro: 'Professional invoice template for plumbers. Include call-out fee, parts and labour. VAT calculated automatically.' },
  { slug: 'electrician', label: 'Electricians', desc: 'Electrical contractor invoice maker. Professional invoices with materials and labour. Free.', h1: 'Free Electrician Invoice Template', intro: 'Create electrical contractor invoices in seconds. Include materials, labour hours and VAT.' },
  { slug: 'cleaner', label: 'Cleaning Services', desc: 'Cleaning service invoice generator. Recurring or one-off jobs, PDF ready. Free.', h1: 'Free Cleaning Service Invoice Template', intro: 'Invoice generator for cleaning businesses. Bill clients for regular or one-off cleaning jobs.' },
  { slug: 'tutor', label: 'Tutors', desc: 'Tutoring invoice template. Bill students or parents for lessons easily. Free PDF.', h1: 'Free Tutoring Invoice Template', intro: 'Professional invoice template for tutors and teachers. Bill for individual lessons or packages.' },
  { slug: 'accountant', label: 'Accountants', desc: 'Accounting invoice generator. Professional invoices for accounting services. Free PDF.', h1: 'Free Accounting Invoice Template', intro: 'Create professional invoices for accounting and bookkeeping services.' },
  { slug: 'lawyer', label: 'Lawyers', desc: 'Legal invoice template. Hourly billing, retainers and disbursements. Free PDF.', h1: 'Free Legal Invoice Template for Lawyers', intro: 'Professional invoice template for lawyers and solicitors. Bill for consultation hours, retainer fees and disbursements.' },
  { slug: 'real-estate', label: 'Real Estate Agents', desc: 'Real estate invoice maker. Commission and fee invoices for agents. Free PDF.', h1: 'Free Real Estate Invoice Template', intro: 'Invoice template for real estate agents. Bill for commission, management fees and other services.' },
  { slug: 'marketing', label: 'Marketing Agencies', desc: 'Marketing agency invoice generator. Campaign fees, ad spend and retainers. Free PDF.', h1: 'Free Marketing Agency Invoice Template', intro: 'Create invoices for marketing and advertising services. Bill for campaign management, ad spend and monthly retainers.' },
  { slug: 'restaurant', label: 'Restaurants', desc: 'Restaurant invoice template. Catering and event billing made simple. Free PDF.', h1: 'Free Restaurant & Catering Invoice Template', intro: 'Invoice template for restaurants and catering businesses.' },
  { slug: 'mechanic', label: 'Auto Mechanics', desc: 'Auto repair invoice generator. Parts, labour and diagnostics on one invoice. Free PDF.', h1: 'Free Auto Repair Invoice Template', intro: 'Professional invoice template for mechanics and auto repair shops.' },
  { slug: 'landscaper', label: 'Landscapers', desc: 'Landscaping invoice maker. Mowing, design and maintenance billing. Free PDF.', h1: 'Free Landscaping Invoice Template', intro: 'Invoice generator for landscapers and gardeners.' },
  { slug: 'therapist', label: 'Therapists', desc: 'Therapy invoice template. Professional session billing for therapists. Free PDF.', h1: 'Free Therapy Invoice Template', intro: 'Professional invoice template for therapists and counsellors.' },
  { slug: 'writer', label: 'Freelance Writers', desc: 'Freelance writing invoice generator. Per-word, per-article or project billing. Free PDF.', h1: 'Free Freelance Writer Invoice Template', intro: 'Invoice template for freelance writers and copywriters.' },
  { slug: 'videographer', label: 'Videographers', desc: 'Video production invoice maker. Shoot days, editing and licensing. Free PDF.', h1: 'Free Videographer Invoice Template', intro: 'Professional invoice template for videographers.' }
];

const COUNTRIES = [
  { slug: 'uk', label: 'UK', fullName: 'United Kingdom', currency: 'GBP', symbol: '£', tax: 'VAT', taxRate: 20 },
  { slug: 'usa', label: 'USA', fullName: 'United States', currency: 'USD', symbol: '$', tax: 'Sales Tax', taxRate: 0 },
  { slug: 'canada', label: 'Canada', fullName: 'Canada', currency: 'CAD', symbol: 'CA$', tax: 'GST/HST', taxRate: 5 },
  { slug: 'australia', label: 'Australia', fullName: 'Australia', currency: 'AUD', symbol: 'AU$', tax: 'GST', taxRate: 10 },
  { slug: 'germany', label: 'Germany', fullName: 'Germany', currency: 'EUR', symbol: '€', tax: 'MwSt', taxRate: 19 },
  { slug: 'france', label: 'France', fullName: 'France', currency: 'EUR', symbol: '€', tax: 'TVA', taxRate: 20 },
  { slug: 'india', label: 'India', fullName: 'India', currency: 'INR', symbol: '₹', tax: 'GST', taxRate: 18 },
  { slug: 'uae', label: 'UAE', fullName: 'United Arab Emirates', currency: 'AED', symbol: 'AED', tax: 'VAT', taxRate: 5 },
  { slug: 'singapore', label: 'Singapore', fullName: 'Singapore', currency: 'SGD', symbol: 'S$', tax: 'GST', taxRate: 9 },
  { slug: 'netherlands', label: 'Netherlands', fullName: 'Netherlands', currency: 'EUR', symbol: '€', tax: 'BTW', taxRate: 21 }
];

const BLOG_POSTS = [
  {
    slug: 'how-to-write-a-professional-invoice',
    title: 'How to Write a Professional Invoice: Complete Guide 2026',
    desc: 'Learn how to create professional invoices that get paid faster. Includes what to include, invoice numbering, payment terms and free templates.',
    date: '2026-01-15',
    readTime: '8 min read',
    category: 'Guide',
    content: `
      <h2>What is an invoice?</h2>
      <p>An invoice is a document sent from a business or freelancer to a client requesting payment for goods or services delivered. A professional invoice clearly states what was provided, the total amount due, and when payment is expected.</p>
      <h2>What to include in an invoice</h2>
      <p>Every professional invoice should contain these key elements:</p>
      <ul>
        <li><strong>Invoice number</strong> — a unique reference number for tracking</li>
        <li><strong>Your business name and contact details</strong> — name, address, email, phone</li>
        <li><strong>Client name and billing address</strong></li>
        <li><strong>Invoice date</strong> — when the invoice was issued</li>
        <li><strong>Payment due date</strong> — typically Net 14, Net 30, or a specific date</li>
        <li><strong>Itemised list of services or products</strong> — description, quantity, rate, amount</li>
        <li><strong>Subtotal, tax, and total amount due</strong></li>
        <li><strong>Payment instructions</strong> — bank details, PayPal, or accepted payment methods</li>
      </ul>
      <h2>How to number your invoices</h2>
      <p>Use a consistent numbering system from day one. Common formats include INV-001, INV-2026-001, or date-based systems like 20260115-001. Sequential numbering helps with accounting and tax reporting.</p>
      <h2>Payment terms explained</h2>
      <p>Payment terms tell your client when payment is due. The most common terms are:</p>
      <ul>
        <li><strong>Due on receipt</strong> — payment expected immediately</li>
        <li><strong>Net 14</strong> — payment due within 14 days</li>
        <li><strong>Net 30</strong> — payment due within 30 days</li>
        <li><strong>Net 60</strong> — payment due within 60 days (common in larger businesses)</li>
      </ul>
      <h2>How to get paid faster</h2>
      <p>Freelancers and small businesses consistently get paid faster when they: send invoices immediately after completing work, include clear payment instructions, follow up politely after the due date, and offer multiple payment methods.</p>
      <h2>Create your invoice now</h2>
      <p>Use our free invoice generator to create a professional PDF invoice in under 60 seconds. No signup required.</p>
    `
  },
  {
    slug: 'invoice-payment-terms-guide',
    title: 'Invoice Payment Terms: Everything You Need to Know',
    desc: 'Net 30, Net 14, due on receipt — a complete guide to invoice payment terms and how to choose the right ones for your business.',
    date: '2026-01-22',
    readTime: '6 min read',
    category: 'Guide',
    content: `
      <h2>What are payment terms?</h2>
      <p>Payment terms are the conditions under which a seller will complete a sale. They specify when payment is due, accepted payment methods, and any penalties for late payment.</p>
      <h2>Common payment terms explained</h2>
      <ul>
        <li><strong>Due on receipt</strong> — the client should pay immediately upon receiving the invoice</li>
        <li><strong>Net 7</strong> — payment due within 7 days</li>
        <li><strong>Net 14</strong> — payment due within 14 days. Good for freelancers and small projects</li>
        <li><strong>Net 30</strong> — payment due within 30 days. The most common business standard</li>
        <li><strong>Net 60 / Net 90</strong> — common for large corporate clients</li>
        <li><strong>2/10 Net 30</strong> — 2% discount if paid within 10 days, otherwise full amount due in 30</li>
      </ul>
      <h2>How to choose the right payment terms</h2>
      <p>For freelancers and small businesses, shorter terms (Net 14 or Net 30) are generally better for cash flow. For larger corporate clients, Net 30 to Net 60 is standard and expected. Always agree on payment terms before starting work to avoid disputes.</p>
      <h2>Late payment penalties</h2>
      <p>You can add late payment clauses to your invoices. A common approach is 1.5% per month on overdue balances. Always state this clearly on your invoice and in your contract.</p>
    `
  },
  {
    slug: 'what-is-vat-invoice',
    title: 'What is a VAT Invoice? A Complete Guide for 2026',
    desc: 'Learn what a VAT invoice is, when you need one, what to include, and how VAT rates work in the UK, EU and worldwide.',
    date: '2026-01-29',
    readTime: '7 min read',
    category: 'Tax',
    content: `
      <h2>What is a VAT invoice?</h2>
      <p>A VAT invoice is an invoice that includes Value Added Tax (VAT). It is required by law in most countries when the seller is VAT registered. VAT invoices must include specific information about the tax charged.</p>
      <h2>When do you need a VAT invoice?</h2>
      <p>You need to issue VAT invoices if you are VAT registered. In the UK, you must register for VAT when your taxable turnover exceeds £90,000. In EU countries, thresholds vary by country.</p>
      <h2>What must a VAT invoice include?</h2>
      <ul>
        <li>A unique invoice number</li>
        <li>Your VAT registration number</li>
        <li>The invoice date and tax point date</li>
        <li>Your business name and address</li>
        <li>The client's name and address</li>
        <li>A description of goods or services</li>
        <li>The subtotal excluding VAT</li>
        <li>The VAT rate applied</li>
        <li>The VAT amount</li>
        <li>The total amount including VAT</li>
      </ul>
      <h2>VAT rates by country</h2>
      <ul>
        <li><strong>UK</strong> — 20% standard rate, 5% reduced, 0% zero-rated</li>
        <li><strong>Germany</strong> — 19% standard, 7% reduced</li>
        <li><strong>France</strong> — 20% standard, 10% and 5.5% reduced</li>
        <li><strong>Netherlands</strong> — 21% standard, 9% reduced</li>
        <li><strong>Australia (GST)</strong> — 10% flat rate</li>
        <li><strong>India (GST)</strong> — 5%, 12%, 18%, or 28% depending on goods/services</li>
      </ul>
    `
  },
  {
    slug: 'freelancer-invoice-guide',
    title: 'How to Invoice as a Freelancer: Complete 2026 Guide',
    desc: 'Everything freelancers need to know about invoicing clients professionally — what to include, when to send, how to follow up on late payments.',
    date: '2026-02-05',
    readTime: '9 min read',
    category: 'Freelance',
    content: `
      <h2>Why freelancers need professional invoices</h2>
      <p>Professional invoices protect you legally, help you get paid faster, and make your business look credible. Clients take payment more seriously when they receive a proper invoice rather than an informal request.</p>
      <h2>What to include in a freelance invoice</h2>
      <ul>
        <li>Your full name or business name</li>
        <li>Your email and contact number</li>
        <li>The client name and company</li>
        <li>A unique invoice number</li>
        <li>Invoice date and payment due date</li>
        <li>Itemised list of services with hours or quantity and rate</li>
        <li>Subtotal and any applicable tax</li>
        <li>Total amount due</li>
        <li>Your bank details or preferred payment method</li>
      </ul>
      <h2>When to send your invoice</h2>
      <p>Send your invoice as soon as the work is complete or at the agreed billing milestone. Delaying invoicing delays payment. For ongoing retainer clients, send invoices on a fixed day each month — for example, the 1st or last day of the month.</p>
      <h2>How to follow up on late payments</h2>
      <p>First, send a polite reminder email referencing the invoice number and due date. If there is no response after 7 days, follow up by phone. For payments more than 30 days overdue, reference your late payment clause and consider charging the agreed penalty rate.</p>
      <h2>Should freelancers charge VAT or sales tax?</h2>
      <p>This depends on your location and your annual income. In the UK, you must register for VAT if your turnover exceeds £90,000. In the US, freelance services are generally not subject to sales tax, but rules vary by state. Always check with a local accountant.</p>
    `
  },
  {
    slug: 'invoice-vs-receipt',
    title: 'Invoice vs Receipt: What is the Difference?',
    desc: 'Confused about the difference between an invoice and a receipt? This guide explains when to use each, with examples.',
    date: '2026-02-12',
    readTime: '5 min read',
    category: 'Guide',
    content: `
      <h2>Invoice vs receipt — the key difference</h2>
      <p>An invoice is sent before payment to request money. A receipt is issued after payment to confirm it was received. Both are important business documents but serve very different purposes.</p>
      <h2>What is an invoice?</h2>
      <p>An invoice is a request for payment. It is sent to a client after goods or services have been delivered, specifying the amount owed and the payment due date. Invoices are used to track accounts receivable.</p>
      <h2>What is a receipt?</h2>
      <p>A receipt is a confirmation of payment. It is issued after money has changed hands, confirming that the transaction is complete. Receipts are used by buyers for expense claims and record keeping.</p>
      <h2>When to use each</h2>
      <ul>
        <li>Use an invoice to request payment from a client for work completed</li>
        <li>Issue a receipt when a client pays you in cash or requests proof of payment</li>
        <li>For online payments, the payment processor often generates a receipt automatically</li>
      </ul>
    `
  },
  {
    slug: 'how-to-write-invoice-email',
    title: 'How to Write an Invoice Email: Templates and Examples',
    desc: 'Professional invoice email templates you can copy and use today. Includes first send, reminder, and overdue payment email examples.',
    date: '2026-02-19',
    readTime: '6 min read',
    category: 'Templates',
    content: `
      <h2>How to send an invoice by email</h2>
      <p>Always attach your invoice as a PDF and include a brief, professional email. Keep it short — clients receive many emails and need to quickly understand what they owe and when.</p>
      <h2>Initial invoice email template</h2>
      <p>Subject: Invoice #INV-001 — [Your Name/Company] — Due [Date]</p>
      <p>Hi [Client Name],</p>
      <p>Please find attached invoice #INV-001 for [service/project name] totalling [amount]. Payment is due by [due date].</p>
      <p>Payment details are included on the invoice. Please let me know if you have any questions.</p>
      <p>Thank you for your business.</p>
      <p>[Your Name]</p>
      <h2>Polite payment reminder email template</h2>
      <p>Subject: Reminder: Invoice #INV-001 Due [Date]</p>
      <p>Hi [Client Name],</p>
      <p>I wanted to send a quick reminder that invoice #INV-001 for [amount] is due on [date]. Please let me know if you need anything from my end to process payment.</p>
      <p>Thank you,<br>[Your Name]</p>
      <h2>Overdue payment email template</h2>
      <p>Subject: Overdue Invoice #INV-001 — Action Required</p>
      <p>Hi [Client Name],</p>
      <p>Invoice #INV-001 for [amount] was due on [date] and is now [X] days overdue. Could you please confirm the payment status or let me know if there is an issue I can help resolve?</p>
      <p>Please note that as per our agreement, a late payment fee of [X]% may apply to overdue balances.</p>
      <p>[Your Name]</p>
    `
  },
  {
    slug: 'gst-invoice-guide',
    title: 'GST Invoice Guide: Australia, India, Canada, Singapore',
    desc: 'A complete guide to GST invoices for Australia, India, Canada and Singapore. What to include, GST rates and how to calculate GST.',
    date: '2026-02-26',
    readTime: '7 min read',
    category: 'Tax',
    content: `
      <h2>What is GST?</h2>
      <p>GST stands for Goods and Services Tax. It is a consumption tax applied to most goods and services. Countries that use GST include Australia, Canada, India, Singapore, and New Zealand.</p>
      <h2>GST rates by country</h2>
      <ul>
        <li><strong>Australia</strong> — 10% flat GST on most goods and services</li>
        <li><strong>Canada</strong> — 5% federal GST, with additional provincial tax (HST varies by province)</li>
        <li><strong>India</strong> — 5%, 12%, 18%, or 28% depending on the category of goods or services</li>
        <li><strong>Singapore</strong> — 9% GST (increased from 8% in 2024)</li>
        <li><strong>New Zealand</strong> — 15% GST</li>
      </ul>
      <h2>What must a GST invoice include in Australia?</h2>
      <ul>
        <li>The words "Tax Invoice" clearly displayed</li>
        <li>Your ABN (Australian Business Number)</li>
        <li>Invoice date</li>
        <li>Description of goods or services</li>
        <li>GST amount — either as a separate line or a statement that the total includes GST</li>
      </ul>
      <h2>How to calculate GST</h2>
      <p>To calculate 10% GST on a price: multiply the pre-tax amount by 0.10. For example, a service worth $500 plus 10% GST equals $550 total. To find the GST in a GST-inclusive price: divide the total by 11. So $550 divided by 11 equals $50 GST.</p>
    `
  },
  {
    slug: 'invoice-number-format',
    title: 'Invoice Numbering: How to Number Your Invoices Correctly',
    desc: 'The best invoice numbering systems explained. How to create unique invoice numbers that work for your business and satisfy tax requirements.',
    date: '2026-03-05',
    readTime: '5 min read',
    category: 'Guide',
    content: `
      <h2>Why invoice numbering matters</h2>
      <p>Invoice numbers are required for accounting, tax reporting, and dispute resolution. A consistent numbering system makes it easy to track which invoices have been paid and which are outstanding.</p>
      <h2>Popular invoice numbering formats</h2>
      <ul>
        <li><strong>Sequential</strong> — INV-001, INV-002, INV-003. Simple and effective for small businesses</li>
        <li><strong>Date-based</strong> — 20260115-001. Includes the date in YYYYMMDD format</li>
        <li><strong>Client-based</strong> — ACME-001, ACME-002. Useful if you have repeat clients</li>
        <li><strong>Year-based</strong> — 2026-001. Resets each year for cleaner accounting</li>
        <li><strong>Project-based</strong> — PROJ-WEB-001. Good for agencies managing multiple projects</li>
      </ul>
      <h2>Rules for invoice numbers</h2>
      <p>Invoice numbers must be unique — no two invoices should share the same number. They should be sequential with no gaps, as tax authorities may question missing numbers. Never reuse invoice numbers, even if an invoice was cancelled.</p>
      <h2>What to do with cancelled invoices</h2>
      <p>If you need to cancel an invoice, issue a credit note rather than deleting it. Keep the original invoice in your records with a note that it was cancelled. This maintains a clean audit trail.</p>
    `
  },
  {
    slug: 'how-to-invoice-international-clients',
    title: 'How to Invoice International Clients: Currency, Tax and Tips',
    desc: 'A practical guide to invoicing clients in other countries. Currency choice, international tax rules, exchange rates and getting paid.',
    date: '2026-03-12',
    readTime: '8 min read',
    category: 'Guide',
    content: `
      <h2>Choosing the right currency</h2>
      <p>When invoicing international clients, you can invoice in your local currency or the client's currency. Invoicing in your own currency protects you from exchange rate risk. Invoicing in the client's currency can make it easier for them to pay. Many freelancers invoice in USD or EUR as a neutral currency.</p>
      <h2>Do you charge VAT to international clients?</h2>
      <p>This depends on your country and the client's location. In the UK, services to business clients outside the UK are generally zero-rated for VAT — meaning you do not charge VAT but you still report the sale. In the EU, B2B services are generally taxed in the buyer's country under the reverse charge mechanism. Always verify the rules with a local accountant.</p>
      <h2>How to handle exchange rates</h2>
      <p>If you invoice in a foreign currency, state the exchange rate on the invoice for your own records. Use the rate on the invoice date. When the payment arrives, the amount you receive in your local currency may differ slightly due to exchange rate movements.</p>
      <h2>Getting paid internationally</h2>
      <p>The most common methods for receiving international payments are: bank wire transfer (SWIFT/IBAN), PayPal, Wise (formerly TransferWise), Stripe, and Payoneer. Wise typically offers the best exchange rates and lowest fees for freelancers receiving international payments.</p>
    `
  },
  {
    slug: 'small-business-invoicing-tips',
    title: '10 Invoicing Tips for Small Businesses to Get Paid Faster',
    desc: 'Practical invoicing tips for small business owners. From payment terms to follow-up strategies, these tips will improve your cash flow.',
    date: '2026-03-19',
    readTime: '7 min read',
    category: 'Tips',
    content: `
      <h2>1. Invoice immediately after completing work</h2>
      <p>The sooner you invoice, the sooner you get paid. Make it a habit to send invoices on the day the work is delivered or the milestone is reached.</p>
      <h2>2. Use clear, short payment terms</h2>
      <p>Net 14 consistently outperforms Net 30 for small businesses in terms of average payment time. Shorter terms set a clear expectation.</p>
      <h2>3. Make it easy to pay</h2>
      <p>Include your bank details directly on the invoice. The fewer steps required to pay, the faster you will get paid. Offer multiple payment methods where possible.</p>
      <h2>4. Include all required details</h2>
      <p>Missing information — such as a purchase order number your client requires — can delay payment by weeks. Always ask clients what they need on the invoice before you start work.</p>
      <h2>5. Set up automatic reminders</h2>
      <p>Schedule email reminders for 3 days before the due date, on the due date, and 7 days after. A polite reminder dramatically improves on-time payment rates.</p>
      <h2>6. Charge late payment fees</h2>
      <p>Having a stated late payment policy, even if you rarely enforce it, makes clients take due dates more seriously. A standard rate is 1.5% per month on overdue balances.</p>
      <h2>7. Use professional invoice design</h2>
      <p>A clean, branded invoice signals professionalism. Clients are more likely to prioritise payment to businesses that look established and credible.</p>
      <h2>8. Get a deposit upfront</h2>
      <p>For larger projects, require a 25-50% deposit before starting work. This improves your cash flow and filters out clients who are not serious.</p>
      <h2>9. Keep detailed records</h2>
      <p>Maintain a log of all invoices sent, payment dates received, and any outstanding balances. This is essential for tax reporting and cash flow management.</p>
      <h2>10. Use a free invoice generator</h2>
      <p>Tools like GetInvoiceMaker.com let you create professional PDF invoices in under 60 seconds with no account required. Removing friction from your invoicing process means you invoice more consistently.</p>
    `
  }
];

const HOW_TO_PAGES = [
  { slug: 'how-to-invoice-as-a-freelancer', title: 'How to Invoice as a Freelancer', desc: 'Step-by-step guide to invoicing clients as a freelancer. What to include, when to send, and how to get paid faster.' },
  { slug: 'how-to-make-an-invoice-in-word', title: 'How to Make an Invoice in Word (and a Better Alternative)', desc: 'Learn how to create invoices in Microsoft Word and why a free invoice generator is faster and more professional.' },
  { slug: 'how-to-send-an-invoice', title: 'How to Send an Invoice: Email, PDF and Best Practices', desc: 'The right way to send invoices to clients. Email templates, PDF best practices and follow-up strategies.' },
  { slug: 'how-to-calculate-vat-on-invoice', title: 'How to Calculate VAT on an Invoice', desc: 'Simple guide to calculating VAT on invoices. Includes formulas, examples and rates for UK, EU and global businesses.' },
  { slug: 'how-to-write-invoice-for-cash-payment', title: 'How to Write an Invoice for Cash Payment', desc: 'Create a professional invoice for cash payments. What to include and how to keep clean records.' },
  { slug: 'how-to-create-invoice-without-company', title: 'How to Create an Invoice Without a Registered Company', desc: 'Freelancers and sole traders can invoice without a registered company. Here is exactly what to include.' },
  { slug: 'how-to-invoice-us-clients-from-uk', title: 'How to Invoice US Clients from the UK', desc: 'Currency, VAT, tax rules and payment methods for UK freelancers invoicing clients in the United States.' },
  { slug: 'how-to-charge-late-payment-fee', title: 'How to Charge a Late Payment Fee on an Invoice', desc: 'Add late payment clauses to your invoices. Legal requirements, standard rates and how to enforce them.' }
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

app.get('/blog', (req, res) => {
  res.render('blog-index', { posts: BLOG_POSTS, howTo: HOW_TO_PAGES, siteUrl: SITE_URL });
});

BLOG_POSTS.forEach(post => {
  app.get('/blog/' + post.slug, (req, res) => {
    res.render('blog-post', { post, relatedPosts: BLOG_POSTS.filter(p => p.slug !== post.slug).slice(0, 3), siteUrl: SITE_URL });
  });
});

HOW_TO_PAGES.forEach(page => {
  app.get('/' + page.slug, (req, res) => {
    res.render('how-to', { page, industries: INDUSTRIES, siteUrl: SITE_URL });
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
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;color:#222;margin:0;padding:0}*{box-sizing:border-box}</style></head><body><div style="padding:40px;max-width:800px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px"><div><h1 style="margin:0;font-size:32px;color:'+(d.color||'#2563eb')+'">INVOICE</h1><p style="margin:4px 0 0;color:#666">#'+(d.invoiceNumber||'001')+'</p></div><div style="text-align:right"><h2 style="margin:0;font-size:18px">'+(d.fromName||'')+'</h2><p style="margin:4px 0;color:#666;font-size:13px">'+(d.fromEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.fromAddress||'').replace(/\n/g,'<br>')+'</p></div></div><div style="display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid '+(d.color||'#2563eb')+'"><div><p style="margin:0;font-size:11px;text-transform:uppercase;color:#999">Bill To</p><h3 style="margin:4px 0;font-size:15px">'+(d.toName||'')+'</h3><p style="margin:0;color:#666;font-size:13px">'+(d.toEmail||'')+'</p><p style="margin:0;color:#666;white-space:pre-line;font-size:13px">'+(d.toAddress||'').replace(/\n/g,'<br>')+'</p></div><div style="text-align:right"><div style="margin-bottom:8px"><span style="font-size:11px;text-transform:uppercase;color:#999">Issue Date</span><p style="margin:2px 0;font-weight:600">'+(d.issueDate||'')+'</p></div><div><span style="font-size:11px;text-transform:uppercase;color:#999">Due Date</span><p style="margin:2px 0;font-weight:600">'+(d.dueDate||'')+'</p></div></div></div><table style="width:100%;border-collapse:collapse;margin-bottom:24px"><thead><tr style="background:'+(d.color||'#2563eb')+';color:#fff"><th style="padding:10px 0;text-align:left;font-size:12px">DESCRIPTION</th><th style="padding:10px 8px;text-align:center;font-size:12px">QTY</th><th style="padding:10px 8px;text-align:right;font-size:12px">RATE</th><th style="padding:10px 0 10px 8px;text-align:right;font-size:12px">AMOUNT</th></tr></thead><tbody>'+rows+'</tbody></table><div style="display:flex;justify-content:flex-end;margin-bottom:32px"><div style="min-width:220px"><div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">Subtotal</span><span>'+(d.symbol||'$')+subtotal.toFixed(2)+'</span></div>'+(d.taxRate?'<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;font-size:13px"><span style="color:#666">'+(d.taxLabel||'Tax')+' ('+d.taxRate+'%)</span><span>'+(d.symbol||'$')+taxAmt.toFixed(2)+'</span></div>':'')+'<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700"><span>Total Due</span><span style="color:'+(d.color||'#2563eb')+'">'+(d.symbol||'$')+total.toFixed(2)+'</span></div></div></div>'+(d.notes?'<div style="background:#f9fafb;border-left:4px solid '+(d.color||'#2563eb')+';padding:12px 16px"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#999">Notes</p><p style="margin:0;font-size:13px;color:#444">'+d.notes+'</p></div>':'')+'</div></body></html>';
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
    res.json({ success: false, message: 'No PRO purchase found. Please purchase at our Gumroad page.' });
  }
});

app.get('/activate', (req, res) => {
  const isPro = req.cookies.pro === 'true';
  res.render('activate', { isPro });
});

app.get('/googlefcff82c355800720.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googlefcff82c355800720.html'); });
app.get('/googleac988ee36fede317.html', (req, res) => { res.type('text/html'); res.send('google-site-verification: googleac988ee36fede317.html'); });

app.get('/sitemap.xml', (req, res) => {
  const urls = [{ loc: '', priority: '1.0', freq: 'daily' }, { loc: '/blog', priority: '0.9', freq: 'weekly' }, { loc: '/activate', priority: '0.3', freq: 'monthly' }];
  INDUSTRIES.forEach(i => urls.push({ loc: '/invoice-template-' + i.slug, priority: '0.9', freq: 'weekly' }));
  COUNTRIES.forEach(c => urls.push({ loc: '/free-invoice-generator-' + c.slug, priority: '0.9', freq: 'weekly' }));
  BLOG_POSTS.forEach(p => urls.push({ loc: '/blog/' + p.slug, priority: '0.8', freq: 'monthly' }));
  HOW_TO_PAGES.forEach(p => urls.push({ loc: '/' + p.slug, priority: '0.8', freq: 'monthly' }));
  const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.map(u => '<url><loc>'+SITE_URL+u.loc+'</loc><changefreq>'+u.freq+'</changefreq><priority>'+u.priority+'</priority></url>').join('') + '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml\n');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('InvoiceMaker running on ' + PORT));
