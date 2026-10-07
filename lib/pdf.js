// Invoice PDF rendering with PDFKit. Fonts are embedded from lib/fonts (Noto Sans) when available.
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Noto Sans (SIL Open Font License, lib/fonts/OFL.txt) covers Latin, Greek and Cyrillic,
// so names like "Şahin" or "Łukasz" print correctly. Falls back to Helvetica if missing.
let FONT_DATA = null;
try {
  FONT_DATA = {
    regular: fs.readFileSync(path.join(__dirname, 'fonts', 'NotoSans-Regular.ttf')),
    bold: fs.readFileSync(path.join(__dirname, 'fonts', 'NotoSans-Bold.ttf'))
  };
} catch (e) { FONT_DATA = null; }
function applyFonts(doc) {
  if (!FONT_DATA) return { r: 'Helvetica', b: 'Helvetica-Bold' };
  doc.registerFont('Body', FONT_DATA.regular);
  doc.registerFont('Body-Bold', FONT_DATA.bold);
  doc.font('Body');
  return { r: 'Body', b: 'Body-Bold' };
}

// Currency prefixes that every font can draw; others fall back to a code prefix.
const SYMBOLS = {
  USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', INR: 'Rs. ', AED: 'AED ', SGD: 'S$',
  TRY: 'TL ', JPY: '¥', CHF: 'CHF ', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', NZD: 'NZ$', ZAR: 'R ',
  BRL: 'R$', MXN: 'MX$'
};
// With the embedded Unicode font we can print the real rupee and lira signs.
const UNICODE_SYMBOLS = { INR: '₹', TRY: '₺' };
function currencySymbol(code) {
  if (FONT_DATA && UNICODE_SYMBOLS[code]) return UNICODE_SYMBOLS[code];
  return SYMBOLS[code] || (String(code || 'USD').replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase() + ' ');
}

const LABELS = {
  en: {
    title: 'INVOICE', billTo: 'BILL TO', issue: 'ISSUE DATE', due: 'DUE DATE', supply: 'SERVICE DATE',
    desc: 'DESCRIPTION', qty: 'QTY', rate: 'RATE', amount: 'AMOUNT', subtotal: 'Subtotal',
    total: 'TOTAL DUE', notes: 'NOTES', taxId: '', clientTaxId: 'Tax ID: '
  },
  nl: {
    title: 'FACTUUR', billTo: 'FACTUUR AAN', issue: 'FACTUURDATUM', due: 'VERVALDATUM', supply: 'LEVERDATUM',
    desc: 'OMSCHRIJVING', qty: 'AANTAL', rate: 'PRIJS', amount: 'BEDRAG', subtotal: 'Subtotaal',
    total: 'TOTAAL', notes: 'OPMERKINGEN', taxId: '', clientTaxId: 'Btw-id: '
  },
  'nl-en': {
    title: 'FACTUUR / INVOICE', billTo: 'FACTUUR AAN / BILL TO', issue: 'FACTUURDATUM / DATE', due: 'VERVALDATUM / DUE',
    supply: 'LEVERDATUM / SUPPLY DATE', desc: 'OMSCHRIJVING / DESCRIPTION', qty: 'AANTAL', rate: 'PRIJS', amount: 'BEDRAG',
    subtotal: 'Subtotaal / Subtotal', total: 'TOTAAL / TOTAL', notes: 'OPMERKINGEN / NOTES', taxId: '', clientTaxId: 'Btw-id / VAT ID: '
  }
};

function str(v, max = 400) {
  return typeof v === 'string' ? v.slice(0, max) : (typeof v === 'number' ? String(v) : '');
}
function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
function money(n, lang) {
  const fixed = Math.abs(n).toFixed(2);
  let [i, d] = fixed.split('.');
  const sep = lang === 'en' ? ',' : '.';
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (n < 0 ? '-' : '') + i + (lang === 'en' ? '.' : ',') + d;
}
function fmtRate(r, lang) {
  const s = String(Math.round(r * 1000) / 1000);
  return lang === 'en' ? s : s.replace('.', ',');
}

// Normalise the payload from any of our forms into one shape.
function normalise(body) {
  const b = body || {};
  const lang = LABELS[b.lang] ? b.lang : 'en';
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 200).map(i => ({
    description: str(i && (i.description || i.desc), 300),
    qty: num(i && i.qty),
    rate: num(i && i.rate)
  }));
  let taxes = Array.isArray(b.taxes) ? b.taxes : [];
  if (!taxes.length && (b.taxRate || b.tr)) taxes = [{ label: b.taxLabel || b.tl || 'Tax', rate: b.taxRate || b.tr }];
  taxes = taxes.slice(0, 2).map(t => ({ label: str(t && t.label, 30) || 'Tax', rate: Math.min(100, Math.max(0, num(t && t.rate))) }))
    .filter(t => t.rate > 0);
  const color = /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#2563eb';
  return {
    lang,
    senderName: str(b.senderName || b.fromName, 120),
    senderEmail: str(b.senderEmail || b.fromEmail, 120),
    senderAddress: str(b.senderAddress || b.fromAddress, 300),
    senderTaxId: str(b.senderTaxId, 160),
    clientName: str(b.clientName || b.toName, 120),
    clientEmail: str(b.clientEmail || b.toEmail, 120),
    clientAddress: str(b.clientAddress || b.toAddress, 300),
    clientTaxId: str(b.clientTaxId, 80),
    invoiceNumber: str(b.invoiceNumber || b.invNum, 40),
    issueDate: str(b.issueDate, 20),
    dueDate: str(b.dueDate, 20),
    supplyDate: str(b.supplyDate, 40),
    notes: str(b.notes, 2000),
    currency: str(b.currency, 3).toUpperCase() || 'USD',
    items, taxes, color,
    logo: typeof b.logo === 'string' ? b.logo : ''
  };
}

function renderInvoicePDF(raw, isPro, res, footerText) {
  const d = normalise(raw);
  const L = LABELS[d.lang];
  const color = d.color;
  const sym = currencySymbol(d.currency);
  const m = n => sym + (d.lang !== 'en' && !sym.endsWith(' ') ? ' ' : '') + money(n, d.lang);
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: (L.title.split(' /')[0]) + ' ' + d.invoiceNumber, Producer: 'GetInvoiceMaker' } });
  const F = applyFonts(doc);
  const filename = `invoice-${(d.invoiceNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  let off = 0;
  const logoMatch = isPro && d.logo.match(/^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=]+)$/);
  if (logoMatch) {
    try { doc.image(Buffer.from(logoMatch[2], 'base64'), 50, 40, { fit: [140, 44] }); off = 55; }
    catch (e) { console.error('Logo error:', e.message); }
  }
  doc.font(F.b).fontSize(d.lang === 'nl-en' ? 22 : 28).fillColor(color).text(L.title, 50, 50 + off, { width: 290 });
  doc.font(F.r).fontSize(10).fillColor('#666').text(`#${d.invoiceNumber}`, 50, 85 + off);

  // Sender block (right).
  let sy = 50;
  doc.font(F.b).fontSize(11).fillColor('#111').text(d.senderName, 330, sy, { width: 220, align: 'right' });
  sy = doc.y + 2;
  doc.font(F.r).fontSize(9).fillColor('#555');
  [d.senderEmail, d.senderAddress, d.senderTaxId].filter(Boolean).forEach(t => {
    doc.text(t, 330, sy, { width: 220, align: 'right' });
    sy = doc.y + 1;
  });

  let y = Math.max(140 + off, sy + 18);
  const top = y;
  doc.fontSize(9).fillColor('#666').text(L.billTo, 50, y);
  doc.font(F.b).fontSize(12).fillColor('#111').text(d.clientName, 50, y + 14, { width: 260 });
  let cy = doc.y + 2;
  doc.font(F.r).fontSize(9).fillColor('#555');
  [d.clientEmail, d.clientAddress, d.clientTaxId ? L.clientTaxId + d.clientTaxId : ''].filter(Boolean).forEach(t => {
    doc.text(t, 50, cy, { width: 260 });
    cy = doc.y + 1;
  });

  let ry = top;
  const meta = [[L.issue, d.issueDate], [L.due, d.dueDate]];
  if (d.supplyDate) meta.push([L.supply, d.supplyDate]);
  meta.forEach(([k, v]) => {
    if (!v) return;
    doc.font(F.r).fontSize(9).fillColor('#666').text(k, 330, ry, { width: 220, align: 'right' });
    doc.fontSize(11).fillColor('#111').text(v, 330, ry + 13, { width: 220, align: 'right' });
    ry += 34;
  });

  y = Math.max(cy, ry) + 22;
  const header = () => {
    doc.rect(50, y, 500, 24).fill(color);
    doc.font(F.b).fillColor('#fff').fontSize(9)
      .text(L.desc, 60, y + 8, { width: 250 })
      .text(L.qty, 315, y + 8, { width: 50, align: 'right' })
      .text(L.rate, 370, y + 8, { width: 80, align: 'right' })
      .text(L.amount, 455, y + 8, { width: 85, align: 'right' });
    doc.font(F.r);
    y += 32;
  };
  header();

  let subtotal = 0;
  d.items.forEach(item => {
    const amount = item.qty * item.rate;
    subtotal += amount;
    const h = Math.max(14, doc.fontSize(10).heightOfString(item.description || ' ', { width: 245 }));
    if (y + h > 740) { doc.addPage(); y = 50; header(); }
    doc.fillColor('#111').fontSize(10)
      .text(item.description, 60, y, { width: 245 })
      .text(String(Math.round(item.qty * 1000) / 1000), 315, y, { width: 50, align: 'right' })
      .text(m(item.rate), 370, y, { width: 80, align: 'right' })
      .text(m(amount), 455, y, { width: 85, align: 'right' });
    y += h + 8;
  });

  const taxLines = d.taxes.map(t => ({ ...t, amount: Math.round(subtotal * t.rate) / 100 }));
  const total = subtotal + taxLines.reduce((a, t) => a + t.amount, 0);

  if (y > 660) { doc.addPage(); y = 50; }
  y += 8;
  doc.moveTo(330, y).lineTo(550, y).strokeColor('#ddd').lineWidth(1).stroke();
  y += 10;
  doc.fontSize(10).fillColor('#666').text(L.subtotal, 330, y, { width: 120, align: 'right' });
  doc.fillColor('#111').text(m(subtotal), 455, y, { width: 85, align: 'right' });
  y += 18;
  taxLines.forEach(t => {
    doc.fillColor('#666').text(`${t.label} (${fmtRate(t.rate, d.lang)}%)`, 300, y, { width: 150, align: 'right' });
    doc.fillColor('#111').text(m(t.amount), 455, y, { width: 85, align: 'right' });
    y += 18;
  });
  doc.moveTo(330, y).lineTo(550, y).strokeColor(color).lineWidth(2).stroke();
  y += 8;
  doc.font(F.b).fontSize(12).fillColor('#111').text(L.total, 290, y, { width: 160, align: 'right' });
  doc.fillColor(color).text(m(total), 440, y, { width: 100, align: 'right' });
  doc.font(F.r);

  if (d.notes) {
    y += 44;
    if (y > 720) { doc.addPage(); y = 50; }
    doc.fontSize(9).fillColor('#666').text(L.notes, 50, y);
    doc.fontSize(10).fillColor('#333').text(d.notes, 50, y + 14, { width: 500 });
  }

  if (!isPro) {
    doc.fontSize(8).fillColor('#999').text(footerText || 'Created with GetInvoiceMaker.com - free invoice generator', 50, 780, { width: 500, align: 'center', lineBreak: false });
  }
  doc.end();
}

module.exports = { renderInvoicePDF, currencySymbol, normalise, applyFonts };
