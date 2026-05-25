const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const BLOG_POSTS = require('./blog-posts.js');

// ===== PRO EMAILS STORAGE =====
// On Vercel: use Vercel KV (persistent across requests)
// Locally: use JSON file
const USE_KV = !!process.env.KV_REST_API_URL;
let kv = null;

if (USE_KV) {
  try {
    kv = require('@vercel/kv').kv;
    console.log('Using Vercel KV for pro emails');
  } catch (e) {
    console.error('KV import failed, falling back to file:', e.message);
  }
}

const PRO_FILE = path.join(__dirname, 'pro-emails.json');

async function isPro(email){
  if (!email) return false;
  const normalized = email.toLowerCase().trim();

  if (kv) {
    try {
      const val = await kv.get(`pro:${normalized}`);
      return !!val;
    } catch(e) {
      console.error('KV read error:', e);
      return false;
    }
  }

  // Local fallback
  try {
    if (fs.existsSync(PRO_FILE)) {
      const emails = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
      return !!emails[normalized];
    }
  } catch(e) {}
  return false;
}

async function grantPro(email, data){
  const normalized = email.toLowerCase().trim();

  if (kv) {
    try {
      await kv.set(`pro:${normalized}`, { ...data, granted_at: new Date().toISOString() });
      return true;
    } catch(e) {
      console.error('KV write error:', e);
      return false;
    }
  }

  // Local fallback
  try {
    let emails = {};
    if (fs.existsSync(PRO_FILE)) emails = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
    emails[normalized] = { ...data, granted_at: new Date().toISOString() };
    fs.writeFileSync(PRO_FILE, JSON.stringify(emails, null, 2));
    return true;
  } catch(e) { console.error('File write error:', e); return false; }
}

async function revokePro(email){
  const normalized = email.toLowerCase().trim();

  if (kv) {
    try { await kv.del(`pro:${normalized}`); return true; } catch(e) { return false; }
  }

  try {
    if (fs.existsSync(PRO_FILE)) {
      const emails = JSON.parse(fs.readFileSync(PRO_FILE, 'utf8'));
      delete emails[normalized];
      fs.writeFileSync(PRO_FILE, JSON.stringify(emails, null, 2));
    }
    return true;
  } catch(e) { return false; }
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 2026 IRS Standard Mileage Rates (Notice 2026-10, effective Jan 1, 2026)
const IRS_RATES_2026 = {
  business: 0.725,
  medical: 0.205,
  charity: 0.14,
  moving: 0.205
};

const IRS_RATES_2025 = {
  business: 0.70,
  medical: 0.21,
  charity: 0.14,
  moving: 0.21
};

const IRS_RATES_2024 = {
  business: 0.67,
  medical: 0.21,
  charity: 0.14,
  moving: 0.21
};

// SEO niche pages config
const NICHE_PAGES = {
  'mileage-log-uber-drivers': {
    title: 'Free Mileage Log for Uber Drivers — IRS-Ready PDF Generator',
    h1: 'Mileage Log for Uber Drivers',
    description: 'Free IRS-compliant mileage log generator for Uber, Lyft, and rideshare drivers. Track every business mile and maximize your tax deductions.',
    keyword: 'uber mileage log',
    intro: 'Every mile you drive between rides counts as a business expense. As an Uber or Lyft driver, you can deduct $0.725 per mile in 2026 — that is roughly $7,250 in tax deductions for every 10,000 business miles. This free generator creates an IRS-ready PDF in under 3 minutes. No signup, no credit card.',
    tips: [
      'Log online time, between-ride time, and all rides as business miles',
      'Track miles to gas stations, car washes, and rideshare-related errands',
      'Keep your odometer reading at the start and end of each year',
      'Save bank statements showing rideshare deposits as backup'
    ]
  },
  'mileage-log-doordash-drivers': {
    title: 'Free Mileage Log for DoorDash Drivers — Tax Deduction Tracker',
    h1: 'Mileage Log for DoorDash & Delivery Drivers',
    description: 'Free IRS mileage log generator for DoorDash, UberEats, Grubhub, and Instacart drivers. Generate compliant PDFs to maximize your delivery driver tax deductions.',
    keyword: 'doordash mileage log',
    intro: 'DoorDash, UberEats, and Grubhub drivers can deduct every mile from the moment they accept a delivery to the moment they finish. With the 2026 IRS rate of $0.725/mile, just 100 miles of deliveries means $72.50 in deductions. Generate your IRS-ready log here for free.',
    tips: [
      'Log miles from your home to the first restaurant if you drive there to start dashing',
      'Track miles between deliveries, not just delivery to customer',
      'Include miles to fast food spots when waiting for orders',
      'Screenshot DoorDash daily summaries as backup proof'
    ]
  },
  'mileage-log-real-estate-agents': {
    title: 'Mileage Log for Real Estate Agents — Free IRS PDF Generator',
    h1: 'Mileage Log for Real Estate Agents',
    description: 'Free mileage log generator built for real estate agents. Track property showings, client meetings, and open houses for maximum tax deductions.',
    keyword: 'real estate agent mileage log',
    intro: 'Real estate agents drive an average of 18,000 business miles per year. At the 2026 IRS rate of $0.725/mile, that is over $13,000 in deductions. Track every property tour, client meeting, and open house with this free IRS-ready generator.',
    tips: [
      'Every property showing counts — log address-to-address',
      'Client lunches, broker open houses, and MLS tours all qualify',
      'Drives to the title company, inspector, or closing all count',
      'Add the property address in the purpose field for audit safety'
    ]
  },
  'mileage-log-self-employed': {
    title: 'Free Mileage Log for Self-Employed — IRS Schedule C Generator',
    h1: 'Mileage Log for Self-Employed & Freelancers',
    description: 'Free IRS-ready mileage log generator for self-employed individuals and freelancers. Generate Schedule C-compliant PDFs for tax filing.',
    keyword: 'self employed mileage log',
    intro: 'If you are self-employed, every business mile is a tax deduction worth $0.725 in 2026. Whether you are a freelancer driving to client meetings, a consultant visiting offices, or a contractor moving between job sites, this free generator creates the IRS-ready log you need for Schedule C.',
    tips: [
      'Track miles to client meetings, networking events, and conferences',
      'Drives to the post office, bank, or office supply store count',
      'Coffee meetings with clients qualify if business is discussed',
      'Keep the log updated weekly — reconstruction is risky in an audit'
    ]
  },
  'mileage-log-2026-irs-rate': {
    title: '2026 IRS Mileage Rate: 72.5 cents/mile — Free Mileage Log Generator',
    h1: '2026 IRS Standard Mileage Rate',
    description: 'The 2026 IRS standard mileage rate is 72.5 cents per business mile. Generate a free IRS-compliant mileage log PDF using the latest 2026 rates.',
    keyword: '2026 irs mileage rate',
    intro: 'The IRS announced the 2026 standard mileage rates in Notice 2026-10: 72.5 cents per business mile (up 2.5 cents from 70 cents in 2025), 20.5 cents per medical or moving mile (down half a cent), and 14 cents per charity mile (unchanged by statute). Use this free generator to log your miles using the latest 2026 rates and generate an IRS-ready PDF.',
    tips: [
      'Business: 72.5¢/mile (up 2.5 cents from 2025)',
      'Medical: 20.5¢/mile (down 0.5 cents from 2025)',
      'Charity: 14¢/mile (set by statute, unchanged since 1998)',
      'Moving: 20.5¢/mile (active military and intelligence community only)'
    ]
  },
  'free-mileage-log-template': {
    title: 'Free Mileage Log Template — IRS-Ready PDF, No Signup',
    h1: 'Free Mileage Log Template',
    description: 'Free mileage log template that generates an IRS-compliant PDF instantly. No signup, no credit card. Used by freelancers, drivers, and small business owners.',
    keyword: 'free mileage log template',
    intro: 'Skip the Excel templates. This free mileage log generator creates a clean, IRS-ready PDF in under 3 minutes. Just enter your trips, click generate, and download. Works for business, medical, and charity miles using the official 2026 IRS rates.',
    tips: [
      'IRS requires: date, destination, business purpose, and miles driven',
      'Best practice: log trips weekly, not at year-end',
      'Save the PDF and your odometer photos as backup',
      'Print or email the PDF to your CPA at tax time'
    ]
  },
  'irs-mileage-log-requirements': {
    title: 'IRS Mileage Log Requirements 2026 — What You Must Track',
    h1: 'IRS Mileage Log Requirements',
    description: 'IRS mileage log requirements for 2026: what data you must track, how to keep records, and how to survive an audit. Free generator included.',
    keyword: 'irs mileage log requirements',
    intro: 'The IRS requires four pieces of information for every business trip: date, destination, business purpose, and miles driven. You must also record your odometer reading at the start and end of the year. This free generator captures all of it in an IRS-ready format.',
    tips: [
      'Required: date, destination, purpose, miles driven',
      'Recommended: starting and ending odometer for the year',
      'Records must be "contemporaneous" — kept at or near the time of the trip',
      'Keep records for 3 years from the date you filed your tax return'
    ]
  },
  'mileage-log-uk': {
    title: 'UK Mileage Log Generator — HMRC Approved Mileage Allowance',
    h1: 'UK Mileage Log (HMRC Approved Rates)',
    description: 'Free UK mileage log generator using HMRC approved mileage rates: 45p/mile for the first 10,000 miles, 25p thereafter. Generate compliant PDFs.',
    keyword: 'uk mileage log',
    intro: 'In the UK, HMRC allows 45p per mile for the first 10,000 business miles per year, and 25p per mile after that. Motorcycles get 24p/mile and bicycles 20p/mile. Generate your HMRC-compliant mileage log here for free.',
    tips: [
      'Cars/vans: 45p first 10,000 miles, 25p after',
      'Motorcycles: 24p per mile (no threshold)',
      'Bicycles: 20p per mile',
      'Keep records for at least 5 years after the 31 January submission deadline'
    ]
  },
  'mileage-log-canada': {
    title: 'CRA Mileage Log 2026 — Free Generator (T2125 Compliant)',
    h1: 'CRA Mileage Log Generator (2026 Rates)',
    description: 'Free CRA-compliant mileage log generator. 2026 rates: $0.73/km first 5,000 km, $0.67/km after. T2125 and T777 ready. Generate audit-proof PDF in 3 minutes.',
    keyword: 'cra mileage log',
    intro: 'The 2026 CRA mileage rate is $0.73/km for the first 5,000 business kilometres and $0.67/km after that ($0.77/$0.71 in Yukon, NWT, and Nunavut). Generate a CRA-compliant logbook for T2125 self-employment or T777 employment expense claims. Free, no signup, audit-proof PDF in under 3 minutes.',
    tips: [
      '2026 CRA rate: $0.73/km for first 5,000 km, $0.67/km after (provinces)',
      'Territories (Yukon, NWT, Nunavut): $0.77/km first 5,000, $0.71/km after',
      'Required fields per trip: date, destination, business purpose, kilometres',
      'Self-employed (T2125): deduct actual vehicle expenses × business-use %',
      'Employees (T777): use signed T2200 from employer to claim',
      'Simplified method: keep full 12-month base year + 3-month sample years',
      'Keep all records 6 years from the end of the tax year (CRA rule)',
      'Record odometer at January 1 and December 31 each year'
    ]
  },
  'cra-mileage-log-template': {
    title: 'Free CRA Mileage Log Template 2026 — Printable PDF Logbook',
    h1: 'CRA Mileage Log Template (2026)',
    description: 'Free printable CRA mileage log template. 2026 rates included. Add trips online and generate a CRA-compliant PDF logbook for T2125 or T777 tax filing.',
    keyword: 'cra mileage log template',
    intro: 'A proper CRA mileage log template must capture date, destination, business purpose, and kilometres driven for every business trip — plus odometer readings at the start and end of the tax year. This free generator builds an audit-proof PDF logbook using the 2026 CRA rates ($0.73/km first 5,000 km, $0.67/km after). Use it for T2125 self-employment income or T777 employment expenses. No signup, no spreadsheet, no app to install.',
    tips: [
      'Required columns: Date | Start | End | Purpose | Kilometres | Type',
      '2026 rate auto-calculated: $0.73/km × first 5,000 + $0.67/km × rest',
      'Add odometer readings (Jan 1 and Dec 31) at the top of the page',
      'Logs must be contemporaneous — record trips the same day or week',
      'Acceptable formats: PDF, spreadsheet, CSV, or paper logbook',
      'Reconstructed logs are usually rejected during a CRA audit',
      'Keep the logbook + supporting docs (fuel, insurance) for 6 years',
      'Add notes for trips over 100 km or unusual destinations'
    ]
  },
  'forgot-to-track-mileage': {
    title: 'Forgot to Track Mileage? Reconstruct Your IRS Log Step-by-Step',
    h1: 'Forgot to Track Mileage? Here is What to Do',
    description: 'Did not track your business miles last year? Reconstruct an IRS-compliant mileage log using calendar entries, Google Timeline, Uber summaries, and bank statements. Free generator included.',
    keyword: 'forgot to track mileage',
    intro: 'You are not the first person to reach tax season without a mileage log, and you will not be the last. The IRS allows reconstructed logs under Publication 463 — as long as you back them up with reasonable evidence. This page walks you through exactly how to rebuild a defensible log from the records you already have, then generate it as an IRS-ready PDF for free. No app download. No signup. No subscription.',
    tips: [
      'Pull Google Maps Timeline (timeline.google.com) for full location history',
      'Export Uber/Lyft/DoorDash trip summaries from your driver tax dashboard',
      'Scan calendar appointments for client visits and meetings',
      'Use bank/credit card statements showing gas, tolls, and travel expenses',
      'Find odometer readings on oil change receipts near Jan 1 and Dec 31',
      'Once you have evidence, enter trips into the generator above and download a PDF'
    ]
  },
  'mileage-log-instacart-shoppers': {
    title: 'Free Mileage Log for Instacart Shoppers — IRS Tax Deduction Tracker',
    h1: 'Mileage Log for Instacart & Shipt Shoppers',
    description: 'Free IRS mileage log generator for Instacart, Shipt, and grocery delivery shoppers. Maximize your 1099 tax deductions with a compliant PDF.',
    keyword: 'instacart mileage log',
    intro: 'Instacart and Shipt shoppers drive between stores, customer homes, and shopping zones — every mile counts. At the 2026 IRS rate of 72.5¢/mile, a typical shopper logging 12,000 business miles per year claims an $8,700 deduction. Generate your IRS-ready log here for free.',
    tips: [
      'Track miles from your home to the first store of the shift',
      'Log between-store and store-to-customer miles separately',
      'Wait time at the store qualifies if you are actively shopping',
      'Save Instacart batch summaries as backup for the trip dates'
    ]
  },
  'mileage-log-lyft-drivers': {
    title: 'Free Mileage Log for Lyft Drivers — 2026 IRS Tax Deduction Tracker',
    h1: 'Mileage Log for Lyft Drivers',
    description: 'Free IRS mileage log generator for Lyft drivers. Track every business mile, including miles between rides, and generate a tax-ready PDF.',
    keyword: 'lyft mileage log',
    intro: 'Lyft only tracks "online miles" — it misses miles to the first ride, between rides, and back home. Those uncounted miles can mean $1,000+ in lost deductions per year. This free generator captures every business mile and produces a 2026 IRS-compliant PDF in minutes.',
    tips: [
      'Lyft trip summaries are a starting point, not a full log',
      'Track miles to the first pickup and home from the last drop-off',
      'Cancellations still count — log the miles you drove',
      'Keep the Lyft tax summary from your driver dashboard as backup'
    ]
  },
  'mileage-log-nurses': {
    title: 'Mileage Log for Travel Nurses & Home Health Workers — Free PDF',
    h1: 'Mileage Log for Nurses & Home Health Workers',
    description: 'Free mileage log generator for travel nurses, home health aides, and in-home care providers. Track patient visits and generate IRS-compliant PDFs.',
    keyword: 'nurse mileage log',
    intro: 'Home health nurses, hospice workers, and travel nurses drive between patient homes all day. The miles between patient visits are fully deductible at the 2026 IRS rate of 72.5¢/mile. A nurse logging 15,000 business miles claims a $10,875 deduction. Generate your IRS-ready log here for free.',
    tips: [
      'Patient-to-patient drives are deductible (not commute to first patient)',
      'Drives to the pharmacy or supply pickup count as business',
      'Use patient initials, not full names, for HIPAA-safe logging',
      'Charting time at the patient home does not affect mileage deduction'
    ]
  },
  'mileage-log-construction-contractors': {
    title: 'Mileage Log for Construction Contractors — Free Job Site Tracker',
    h1: 'Mileage Log for Construction & Trades',
    description: 'Free IRS mileage log generator for construction contractors, plumbers, electricians, and HVAC technicians. Track job site visits and supply runs.',
    keyword: 'contractor mileage log',
    intro: 'Construction contractors, electricians, plumbers, and HVAC techs drive between job sites, supply houses, and client meetings. Every mile is a tax deduction at the 2026 IRS rate of 72.5¢/mile. A contractor logging 20,000 business miles claims a $14,500 deduction. Generate your log here for free.',
    tips: [
      'Job-to-job drives are deductible — even short ones',
      'Trips to Home Depot, Lowe\'s, or supply houses count',
      'Materials pickup and tool runs are business mileage',
      'Drives to estimate appointments are deductible whether you win the job or not'
    ]
  },
  'irs-mileage-rate-history': {
    title: 'IRS Mileage Rate History (1994–2026) — Every Year, Every Rate',
    h1: 'IRS Mileage Rate History',
    description: 'Complete history of IRS standard mileage rates from 1994 to 2026. Includes business, medical, and charity rates for every year.',
    keyword: 'irs mileage rate history',
    intro: 'The IRS standard mileage rate has more than doubled since 1994, when it was 29¢/mile. The 2026 rate of 72.5¢/mile is the highest in history. This page lists every business, medical, and charity rate going back three decades — useful when amending old returns or reconstructing past mileage logs.',
    tips: [
      '2026: 72.5¢ business, 20.5¢ medical, 14¢ charity',
      '2025: 70¢ business, 21¢ medical, 14¢ charity',
      '2024: 67¢ business, 21¢ medical, 14¢ charity',
      '2023: 65.5¢ business, 22¢ medical, 14¢ charity',
      '2022 (Jul-Dec): 62.5¢ business (mid-year increase due to fuel)',
      '2022 (Jan-Jun): 58.5¢ business',
      '2021: 56¢ business, 16¢ medical, 14¢ charity',
      '2020: 57.5¢ business, 17¢ medical, 14¢ charity'
    ]
  }
};

// === GUMROAD WEBHOOK ===
// Gumroad sale notification: when a user purchases lifetime Pro
app.post('/gumroad-webhook', async (req, res) => {
  try {
    const { email, sale_id, product_id, refunded } = req.body;

    if (!email) return res.status(400).send('No email');

    if (refunded === 'true' || refunded === true) {
      await revokePro(email);
      console.log(`Refund processed for ${email}`);
    } else {
      await grantPro(email, { sale_id, product_id });
      console.log(`Pro access granted to ${email}`);
    }

    res.send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error');
  }
});

// === VERIFY LICENSE (user enters email to unlock) ===
app.post('/verify-pro', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ pro: false, error: 'No email provided' });

  const pro = await isPro(email);
  res.json({ pro, email: email.toLowerCase().trim() });
});

// === ROUTES ===

// Homepage
app.get('/', (req, res) => {
  res.render('index', {
    rates: IRS_RATES_2026,
    title: 'Free IRS Mileage Log Generator 2026 — No Signup, Instant PDF',
    description: 'Free IRS-compliant mileage log generator. Track business, medical, and charity miles. Generate tax-ready PDF in under 3 minutes. No signup, no credit card.'
  });
});

// Generate PDF
app.post('/generate-pdf', async (req, res) => {
  try {
    const { trips, userInfo, year } = req.body;

    if (!trips || !Array.isArray(trips) || trips.length === 0) {
      return res.status(400).json({ error: 'No trips provided' });
    }

    const rates = year === '2024' ? IRS_RATES_2024 : (year === '2025' ? IRS_RATES_2025 : IRS_RATES_2026);

    // Pro check (server-side, async)
    const userIsPro = userInfo && userInfo.email && await isPro(userInfo.email);

    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => {
      const pdfData = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mileage-log-${year || 2026}.pdf"`);
      res.send(pdfData);
    });

    // Header
    doc.fontSize(20).fillColor('#0a2540').text('Mileage Log', { align: 'left' });
    doc.fontSize(10).fillColor('#666').text(`Tax Year ${year || 2026}  •  IRS Standard Mileage Rates`, { align: 'left' });
    doc.moveDown(0.5);

    if (userInfo && userInfo.name) {
      doc.fontSize(11).fillColor('#0a2540').text(`Name: ${userInfo.name}`);
    }
    if (userInfo && userInfo.vehicle) {
      doc.fontSize(11).fillColor('#0a2540').text(`Vehicle: ${userInfo.vehicle}`);
    }
    if (userInfo && userInfo.startOdometer) {
      doc.fontSize(11).fillColor('#0a2540').text(`Starting Odometer: ${userInfo.startOdometer}`);
    }
    if (userInfo && userInfo.endOdometer) {
      doc.fontSize(11).fillColor('#0a2540').text(`Ending Odometer: ${userInfo.endOdometer}`);
    }

    doc.moveDown(1);

    // Table header
    const startY = doc.y;
    const colWidths = [60, 120, 120, 110, 50, 60];
    const headers = ['Date', 'Start Location', 'End Location', 'Purpose', 'Miles', 'Type'];

    doc.fontSize(9).fillColor('#fff').rect(40, startY, 520, 20).fill('#0a2540');
    let x = 45;
    headers.forEach((h, i) => {
      doc.fillColor('#fff').text(h, x, startY + 6, { width: colWidths[i] });
      x += colWidths[i];
    });

    let y = startY + 22;
    let totals = { business: 0, medical: 0, charity: 0, personal: 0 };

    trips.forEach((trip, idx) => {
      if (y > 750) {
        doc.addPage();
        y = 40;
      }

      const bg = idx % 2 === 0 ? '#f7f9fc' : '#ffffff';
      doc.rect(40, y, 520, 18).fill(bg);

      x = 45;
      const row = [
        trip.date || '',
        trip.start || '',
        trip.end || '',
        trip.purpose || '',
        String(trip.miles || 0),
        (trip.type || 'business').toUpperCase()
      ];

      doc.fontSize(8).fillColor('#0a2540');
      row.forEach((val, i) => {
        doc.text(val, x, y + 5, { width: colWidths[i] - 4, ellipsis: true });
        x += colWidths[i];
      });

      const miles = parseFloat(trip.miles) || 0;
      const type = trip.type || 'business';
      if (totals[type] !== undefined) totals[type] += miles;

      y += 18;
    });

    // Totals
    y += 10;
    if (y > 700) { doc.addPage(); y = 40; }

    doc.fontSize(12).fillColor('#0a2540').text('Summary', 40, y);
    y += 20;

    doc.fontSize(10).fillColor('#0a2540');
    doc.text(`Business Miles:   ${totals.business.toFixed(1)} mi  ×  $${rates.business}/mi  =  $${(totals.business * rates.business).toFixed(2)}`, 40, y);
    y += 16;
    doc.text(`Medical Miles:    ${totals.medical.toFixed(1)} mi  ×  $${rates.medical}/mi  =  $${(totals.medical * rates.medical).toFixed(2)}`, 40, y);
    y += 16;
    doc.text(`Charity Miles:    ${totals.charity.toFixed(1)} mi  ×  $${rates.charity}/mi  =  $${(totals.charity * rates.charity).toFixed(2)}`, 40, y);
    y += 16;
    doc.text(`Personal Miles:   ${totals.personal.toFixed(1)} mi  (not deductible)`, 40, y);
    y += 24;

    const totalDeduction = (totals.business * rates.business) + (totals.medical * rates.medical) + (totals.charity * rates.charity);
    doc.fontSize(13).fillColor('#0a2540').text(`Total Deduction: $${totalDeduction.toFixed(2)}`, 40, y);

    // Footer (free version footer note) — uses userIsPro from above

    // === DIAGONAL CENTER WATERMARK ON EVERY PAGE (free users) ===
    if (!userIsPro) {
      const range = doc.bufferedPageRange();
      const startPage = range.start;
      const endPage = range.start + range.count;

      // A4: 595 x 842 points
      const PAGE_W = 595;
      const PAGE_H = 842;

      for (let i = startPage; i < endPage; i++) {
        doc.switchToPage(i);

        // === BIG DIAGONAL CENTER WATERMARK ===
        doc.save();
        doc.translate(PAGE_W / 2, PAGE_H / 2);
        doc.rotate(-35);
        doc.fontSize(90)
           .fillColor('#ff0000')
           .opacity(0.35)
           .text('SAMPLE — NOT VALID', -350, -45, { width: 700, align: 'center' });
        doc.restore();
        doc.opacity(1);

        // === SECOND WATERMARK BAND (for proof of concept) ===
        doc.save();
        doc.translate(PAGE_W / 2, PAGE_H / 2);
        doc.rotate(-35);
        doc.fontSize(20)
           .fillColor('#ff0000')
           .opacity(0.5)
           .text('FREE VERSION — IRS WILL REJECT', -350, 50, { width: 700, align: 'center' });
        doc.restore();
        doc.opacity(1);

        // === THIRD WATERMARK BAND ===
        doc.save();
        doc.translate(PAGE_W / 2, PAGE_H / 2);
        doc.rotate(-35);
        doc.fontSize(16)
           .fillColor('#ff0000')
           .opacity(0.45)
           .text('Get Pro at mileagelogmaker.com', -350, 90, { width: 700, align: 'center' });
        doc.restore();
        doc.opacity(1);

        // === BOTTOM FOOTER ===
        doc.fontSize(11)
           .fillColor('#cc0000')
           .opacity(1)
           .text(
             '⚠ FREE VERSION — Not IRS-compliant. Remove watermark for $9 at mileagelogmaker.com',
             40, 815,
             { align: 'center', width: 520 }
           );
      }
    }

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Niche SEO pages
app.get('/:slug', (req, res, next) => {
  const slug = req.params.slug;
  if (NICHE_PAGES[slug]) {
    return res.render('niche', {
      page: NICHE_PAGES[slug],
      slug,
      rates: IRS_RATES_2026,
      allPages: Object.keys(NICHE_PAGES).filter(s => s !== slug).slice(0, 6).map(s => ({ slug: s, h1: NICHE_PAGES[s].h1 }))
    });
  }
  if (BLOG_POSTS[slug]) {
    return res.render('blog-post', {
      post: BLOG_POSTS[slug],
      slug,
      rates: IRS_RATES_2026,
      allPosts: Object.keys(BLOG_POSTS).filter(s => s !== slug).slice(0, 4).map(s => ({ slug: s, title: BLOG_POSTS[s].title }))
    });
  }
  next();
});

// Blog index
app.get('/blog', (req, res) => {
  res.render('blog-index', {
    posts: Object.entries(BLOG_POSTS).map(([slug, p]) => ({ slug, ...p }))
  });
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  const base = 'https://mileagelogmaker.com';
  const urls = [
    '',
    '/blog',
    ...Object.keys(NICHE_PAGES).map(s => '/' + s),
    ...Object.keys(BLOG_POSTS).map(s => '/' + s)
  ].map(path => `
  <url>
    <loc>${base}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`);
});

// Robots
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: https://mileagelogmaker.com/sitemap.xml`);
});

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`MileageLogMaker running on ${PORT}`);
});

module.exports = app;
