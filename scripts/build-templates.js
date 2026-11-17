// Builds the downloadable invoice templates in public/templates/ (Word, Excel, fillable PDF).
// Run: node scripts/build-templates.js   (needs the devDependencies docx and exceljs)
// Build only some: node scripts/build-templates.js german-invoice-template-rechnung nz-tax-invoice-template
// (each name is the file name without extension; with no names every template is rebuilt)
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const docx = require('docx');

const OUT = path.join(__dirname, '..', 'public', 'templates');
fs.mkdirSync(OUT, { recursive: true });

const TEMPLATES = [
  {
    file: 'freelance-invoice-template',
    title: 'INVOICE',
    color: '2563EB',
    from: ['Your name or business name', 'Street address, city, postcode', 'Email and phone', 'Tax ID (VAT/GST/HST number, if registered)'],
    to: ['Client name', 'Client address', 'Client contact or PO number'],
    meta: [['Invoice no.', 'INV-001'], ['Invoice date', ''], ['Due date', ''], ['Project', '']],
    cols: ['Description', 'Hours / qty', 'Rate', 'Amount'],
    rows: 8,
    taxLabel: 'Tax',
    totalLabel: 'Total due',
    labels: { from: 'From', to: 'Bill to', subtotal: 'Subtotal', notes: 'Payment details' },
    notes: 'Payment within 14 days by bank transfer to: [account name, IBAN / account and sort code / routing number]. Please quote the invoice number.',
    footer: 'Free template from getinvoicemaker.com/invoice-template-freelancer'
  },
  {
    file: 'real-estate-commission-invoice-template',
    title: 'COMMISSION INVOICE',
    color: '0F766E',
    from: ['Agent name', 'Brokerage name', 'Licence number', 'Address, email and phone', 'Tax registration number (if any)'],
    to: ['Paying party (title/escrow company, brokerage, seller or landlord)', 'Address', 'On behalf of (client name)'],
    meta: [['Invoice no.', 'RE-001'], ['Invoice date', ''], ['Due', 'At closing'], ['Closing date', '']],
    deal: [['Property address', ''], ['MLS / listing no.', ''], ['Sale price (or rent)', 450000], ['Commission rate (%)', 3], ['Your share (%)', 100]],
    cols: ['Description', 'Qty', 'Rate', 'Amount'],
    rows: 5,
    taxLabel: 'Tax',
    totalLabel: 'Total due',
    labels: { from: 'Agent', to: 'Bill to', subtotal: 'Subtotal', notes: 'Payment instructions' },
    notes: 'Due at closing. Pay by wire to the brokerage trust account: [bank, account name, account number, routing/transit]. Quote the invoice number.',
    footer: 'Free template from getinvoicemaker.com/invoice-template-real-estate'
  },
  {
    file: 'dutch-invoice-template-factuur',
    title: 'FACTUUR / INVOICE',
    color: 'C2410C',
    from: ['Bedrijfsnaam / Business name', 'Adres, postcode, plaats / Address', 'KVK-nummer / Chamber of Commerce no.', 'Btw-id / VAT ID (NL000000000B00)', 'IBAN'],
    to: ['Naam klant / Client name', 'Adres klant / Client address', 'Btw-id klant (bij btw verlegd) / Client VAT ID'],
    meta: [['Factuurnummer / Invoice no.', '2026-001'], ['Factuurdatum / Invoice date', ''], ['Leverdatum / Date of supply', ''], ['Vervaldatum / Due date', '']],
    cols: ['Omschrijving / Description', 'Aantal / Qty', 'Prijs / Price', 'Btw %', 'Bedrag / Amount'],
    vatPerLine: true,
    rows: 8,
    totalLabel: 'Totaal / Total',
    labels: { from: 'Van / From', to: 'Factuur aan / Bill to', subtotal: 'Subtotaal excl. btw / Subtotal', notes: 'Betaling / Payment' },
    notes: 'Betaling binnen 30 dagen op IBAN [NL00 BANK 0000 0000 00] t.n.v. [naam] o.v.v. het factuurnummer. / Payment within 30 days, quoting the invoice number.',
    footer: 'Gratis sjabloon / free template: getinvoicemaker.com/free-invoice-generator-netherlands'
  },
  {
    // German invoice (17 Nov 2026): one field per detail of section 14(4) UStG, USt per line at 19 or 7 percent.
    file: 'german-invoice-template-rechnung',
    title: 'RECHNUNG / INVOICE',
    color: '1E3A8A',
    from: ['Name / Firma (vollständig) / Full name', 'Anschrift (Straße, PLZ, Ort) / Address', 'Steuernummer oder USt-IdNr. / Tax number or VAT ID (DE000000000)', 'IBAN'],
    to: ['Name des Kunden / Client name', 'Anschrift des Kunden / Client address', 'USt-IdNr. des Kunden (EU-Kunden) / Client VAT ID'],
    meta: [['Rechnungsnummer / Invoice no.', '2026-001'], ['Rechnungsdatum / Invoice date', ''], ['Leistungsdatum / Date of supply', ''], ['Zahlbar bis / Due date', '']],
    cols: ['Beschreibung / Description', 'Menge / Qty', 'Netto / Net', 'USt %', 'Betrag / Amount'],
    vatPerLine: true,
    vatRates: [19, 7],
    vatLabel: 'Umsatzsteuer / VAT',
    dateFmt: 'dd.mm.yyyy',
    datePh: 'tt.mm.jjjj',
    rows: 8,
    totalLabel: 'Gesamtbetrag / Total',
    labels: { from: 'Von / From', to: 'Rechnung an / Bill to', subtotal: 'Nettobetrag / Net total', notes: 'Zahlung und Hinweise / Payment and notes' },
    notes: [
      'Zahlbar innerhalb von 14 Tagen ohne Abzug auf IBAN [DE00 0000 0000 0000 0000 00] unter Angabe der Rechnungsnummer. / Payable within 14 days, no deduction, quoting the invoice number.',
      'Nur Kleinunternehmer (sonst löschen): Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Setzen Sie 0 in die Spalte USt %. / Small business only (otherwise delete): no VAT is charged under section 19 UStG. Enter 0 in the USt % column.',
      'Nur wenn der Kunde die Steuer schuldet (sonst löschen): Steuerschuldnerschaft des Leistungsempfängers. / Only if the customer owes the VAT (otherwise delete): reverse charge.'
    ],
    footer: 'Kostenlose Vorlage / free template: getinvoicemaker.com/free-invoice-generator-germany',
    vatFootnote: 'Pflichtangaben nach § 14 Abs. 4 UStG: Name und Anschrift beider Seiten, Steuernummer oder USt-IdNr., Ausstellungsdatum, Rechnungsnummer, Menge und Art, Leistungsdatum, Entgelt nach Steuersätzen, Steuersatz und Steuerbetrag.'
  },
  {
    // New Zealand GST tax invoice (17 Nov 2026): the details IRD asks for over $1,000, GST at 15 percent.
    file: 'nz-tax-invoice-template',
    title: 'TAX INVOICE',
    color: '0E7490',
    from: ['Your name or trading name', 'Address', 'GST number (may be your IRD number)', 'Email and phone'],
    to: ['Client name', 'Client address', 'Client GST number, NZBN, email or phone (over $1,000 for a GST-registered client)'],
    meta: [['Invoice no.', 'INV-001'], ['Invoice date', ''], ['Due date', ''], ['Supply date (if different)', '']],
    cols: ['Description', 'Qty', 'Price excl. GST', 'Amount excl. GST'],
    rows: 8,
    taxLabel: 'GST',
    taxRate: 15,
    dateFmt: 'dd/mm/yyyy',
    totalLabel: 'Total incl. GST (NZD)',
    labels: { from: 'From', to: 'Bill to', subtotal: 'Subtotal excl. GST', notes: 'Payment details' },
    notes: [
      'Payment within 14 days by bank transfer to [00-0000-0000000-00], quoting the invoice number. All amounts are in NZD.',
      'Zero-rated export of services? Charge no GST and add: GST at 0%: zero-rated services supplied to a non-resident outside New Zealand.'
    ],
    footer: 'Free template from getinvoicemaker.com/free-invoice-generator-new-zealand'
  }
];
// Notes may be one string or a list of lines.
const noteLines = t => (Array.isArray(t.notes) ? t.notes : [t.notes]);
const vatRates = t => t.vatRates || [21, 9];
const vatLabel = t => t.vatLabel || 'Btw / VAT';

// ---------- Excel ----------
async function buildXlsx(t) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GetInvoiceMaker';
  wb.calcProperties.fullCalcOnLoad = true;
  const ws = wb.addWorksheet('Invoice', { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } } });
  const ncol = t.cols.length;
  const widths = t.vatPerLine ? [44, 12, 14, 9, 16] : [50, 13, 14, 16];
  ws.columns = widths.map(w => ({ width: w }));
  const last = String.fromCharCode(64 + ncol);
  const accent = { argb: 'FF' + t.color };
  const grey = { argb: 'FF64748B' };
  const input = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  const thin = { style: 'thin', color: { argb: 'FFE2E8F0' } };
  let r = 1;
  ws.mergeCells(`A${r}:${last}${r}`);
  ws.getCell(`A${r}`).value = t.title;
  ws.getCell(`A${r}`).font = { size: 20, bold: true, color: accent };
  r += 2;
  const sectionTitle = (text) => { ws.getCell(`A${r}`).value = text.toUpperCase(); ws.getCell(`A${r}`).font = { size: 9, bold: true, color: grey }; r++; };
  const metaStart = r;
  sectionTitle(t.labels.from);
  t.from.forEach(f => { const c = ws.getCell(`A${r}`); c.value = '[' + f + ']'; c.font = { color: { argb: 'FF94A3B8' } }; c.fill = input; r++; });
  // meta on the right
  let mr = metaStart;
  t.meta.forEach(([k, v]) => {
    ws.mergeCells(`B${mr}:${String.fromCharCode(64 + ncol - 1)}${mr}`);
    ws.getCell(`B${mr}`).value = k; ws.getCell(`B${mr}`).font = { size: 9, color: grey }; ws.getCell(`B${mr}`).alignment = { horizontal: 'right' };
    const c = ws.getCell(`${last}${mr}`); c.value = v; c.fill = input; c.alignment = { horizontal: 'right' };
    if (/date|datum/i.test(k) && !v) c.numFmt = t.dateFmt || 'dd-mm-yyyy';
    mr++;
  });
  r = Math.max(r, mr) + 1;
  sectionTitle(t.labels.to);
  t.to.forEach(f => { const c = ws.getCell(`A${r}`); c.value = '[' + f + ']'; c.font = { color: { argb: 'FF94A3B8' } }; c.fill = input; r++; });
  r++;
  let dealRefs = null;
  if (t.deal) {
    sectionTitle('Transaction');
    dealRefs = {};
    t.deal.forEach(([k, v]) => {
      ws.getCell(`A${r}`).value = k;
      const c = ws.getCell(`B${r}`); c.value = v; c.fill = input;
      if (typeof v === 'number') c.numFmt = k.includes('%') ? '0.00' : '#,##0.00';
      dealRefs[k] = `B${r}`;
      r++;
    });
    ws.getCell(`A${r}`).value = 'Gross commission';
    ws.getCell(`B${r}`).value = { formula: `${dealRefs['Sale price (or rent)']}*${dealRefs['Commission rate (%)']}/100` };
    ws.getCell(`B${r}`).numFmt = '#,##0.00'; dealRefs.gross = `B${r}`; r++;
    ws.getCell(`A${r}`).value = 'Your commission (gross x share)';
    ws.getCell(`A${r}`).font = { bold: true };
    ws.getCell(`B${r}`).value = { formula: `${dealRefs.gross}*${dealRefs['Your share (%)']}/100` };
    ws.getCell(`B${r}`).numFmt = '#,##0.00'; ws.getCell(`B${r}`).font = { bold: true }; dealRefs.net = `B${r}`; r += 2;
  }
  // items header
  t.cols.forEach((h, i) => {
    const c = ws.getCell(r, i + 1);
    c.value = h; c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: accent };
    c.alignment = { horizontal: i === 0 ? 'left' : 'right' };
  });
  r++;
  const first = r;
  const amountCol = String.fromCharCode(64 + ncol);
  for (let i = 0; i < t.rows; i++) {
    for (let cIdx = 1; cIdx <= ncol; cIdx++) {
      const c = ws.getCell(r, cIdx);
      c.border = { bottom: thin };
      if (cIdx < ncol) c.fill = input;
    }
    if (dealRefs && i === 0) {
      ws.getCell(`A${r}`).value = 'Commission: [property address]';
      ws.getCell(`B${r}`).value = 1;
      ws.getCell(`C${r}`).value = { formula: dealRefs.net };
    }
    if (t.vatPerLine) ws.getCell(`D${r}`).value = i === 0 ? vatRates(t)[0] : null;
    ws.getCell(`${amountCol}${r}`).value = { formula: `IF(B${r}="","",B${r}*C${r})` };
    ['C', amountCol].forEach(col => { ws.getCell(`${col}${r}`).numFmt = '#,##0.00'; });
    r++;
  }
  const lastItem = r - 1;
  r++;
  const labelCell = (row, text, bold) => {
    ws.mergeCells(`A${row}:${String.fromCharCode(64 + ncol - 1)}${row}`);
    const c = ws.getCell(`A${row}`); c.value = text; c.alignment = { horizontal: 'right' }; c.font = { bold: !!bold };
  };
  labelCell(r, t.labels.subtotal);
  ws.getCell(`${amountCol}${r}`).value = { formula: `SUM(${amountCol}${first}:${amountCol}${lastItem})` };
  ws.getCell(`${amountCol}${r}`).numFmt = '#,##0.00';
  const subRow = r; r++;
  const taxRows = [];
  if (t.vatPerLine) {
    vatRates(t).forEach(rate => {
      labelCell(r, `${vatLabel(t)} ${rate}%`);
      ws.getCell(`${amountCol}${r}`).value = { formula: `ROUND(SUMIF(D${first}:D${lastItem},${rate},${amountCol}${first}:${amountCol}${lastItem})*${rate}/100,2)` };
      ws.getCell(`${amountCol}${r}`).numFmt = '#,##0.00';
      taxRows.push(r); r++;
    });
  } else {
    labelCell(r, `${t.taxLabel} rate (%) - enter 0 if none`);
    const rateCell = ws.getCell(`${amountCol}${r}`); rateCell.value = t.taxRate || 0; rateCell.fill = input; rateCell.numFmt = '0.000';
    const rateRow = r; r++;
    labelCell(r, t.taxLabel);
    ws.getCell(`${amountCol}${r}`).value = { formula: `ROUND(${amountCol}${subRow}*${amountCol}${rateRow}/100,2)` };
    ws.getCell(`${amountCol}${r}`).numFmt = '#,##0.00';
    taxRows.push(r); r++;
  }
  labelCell(r, t.totalLabel, true);
  const tot = ws.getCell(`${amountCol}${r}`);
  tot.value = { formula: `${amountCol}${subRow}+${taxRows.map(x => amountCol + x).join('+')}` };
  tot.numFmt = '#,##0.00'; tot.font = { bold: true, size: 13, color: accent };
  tot.border = { top: { style: 'medium', color: accent } };
  r += 2;
  sectionTitle(t.labels.notes);
  const nl = noteLines(t);
  const span = Math.max(2, nl.length * 2);
  ws.mergeCells(`A${r}:${last}${r + span - 1}`);
  ws.getCell(`A${r}`).value = nl.join('\n'); ws.getCell(`A${r}`).alignment = { wrapText: true, vertical: 'top' }; ws.getCell(`A${r}`).fill = input;
  for (let k = 0; k < span; k++) ws.getRow(r + k).height = nl.length > 1 ? 20 : (k === 0 ? 30 : 15);
  r += span + 1;
  ws.getCell(`A${r}`).value = t.footer; ws.getCell(`A${r}`).font = { size: 8, color: { argb: 'FF94A3B8' } };
  if (t.vatPerLine) {
    r++;
    ws.getCell(`A${r}`).value = t.vatFootnote || 'Btw verlegd? Zet 0 in de kolom Btw % en vermeld "btw verlegd" en het btw-id van de klant. / KOR: geen btw, vermeld dat u de KOR gebruikt.';
    ws.getCell(`A${r}`).font = { size: 8, color: { argb: 'FF94A3B8' } };
  }
  await wb.xlsx.writeFile(path.join(OUT, t.file + '.xlsx'));
}

// ---------- Word ----------
async function buildDocx(t) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType } = docx;
  const ph = (text, opts) => new TextRun(Object.assign({ text: '[' + text + ']', color: '94A3B8' }, opts || {}));
  const small = (text) => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: text.toUpperCase(), size: 16, bold: true, color: '64748B' })] });
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const noBorders = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
  const line = { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' };
  const cell = (children, opts) => new TableCell(Object.assign({ children, margins: { top: 60, bottom: 60, left: 80, right: 80 } }, opts || {}));
  const right = (text, opts) => new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(Object.assign({ text }, opts || {}))] });

  const header = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders,
    rows: [new TableRow({ children: [
      cell([new Paragraph({ children: [new TextRun({ text: t.title, bold: true, size: 40, color: t.color })] }), small(t.labels.from)].concat(t.from.map(f => new Paragraph({ children: [ph(f)] }))), { width: { size: 55, type: WidthType.PERCENTAGE } }),
      cell(t.meta.map(([k, v]) => new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 60 }, children: [new TextRun({ text: k + ': ', size: 18, color: '64748B' }), v ? new TextRun({ text: String(v), bold: true }) : ph(t.datePh || 'dd-mm-yyyy')] })), { width: { size: 45, type: WidthType.PERCENTAGE } })
    ] })]
  });

  const billTo = [new Paragraph({ text: '' }), small(t.labels.to)].concat(t.to.map(f => new Paragraph({ children: [ph(f)] })));
  const deal = t.deal ? [new Paragraph({ text: '' }), small('Transaction'), new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line },
    rows: t.deal.concat([['Gross commission (price x rate)', ''], ['Your commission (gross x share)', '']]).map(([k]) => new TableRow({ children: [cell([new Paragraph({ children: [new TextRun({ text: k, size: 20 })] })], { width: { size: 50, type: WidthType.PERCENTAGE } }), cell([new Paragraph({ children: [new TextRun({ text: ' ' })] })], { width: { size: 50, type: WidthType.PERCENTAGE } })] }))
  })] : [];

  const ncol = t.cols.length;
  const colW = t.vatPerLine ? [46, 12, 14, 10, 18] : [52, 14, 16, 18];
  const headRow = new TableRow({ tableHeader: true, children: t.cols.map((h, i) => cell([new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })] })], { width: { size: colW[i], type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: t.color } })) });
  const blank = () => new TableRow({ children: t.cols.map((h, i) => cell([new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, children: [new TextRun({ text: ' ' })] })], { width: { size: colW[i], type: WidthType.PERCENTAGE } })) });
  const itemRows = [headRow];
  for (let i = 0; i < t.rows; i++) itemRows.push(blank());
  const items = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: line, bottom: line, left: none, right: none, insideHorizontal: line, insideVertical: none }, rows: itemRows });

  const totalsData = [[t.labels.subtotal, false]].concat(t.vatPerLine ? vatRates(t).map(rate => [`${vatLabel(t)} ${rate}%`, false]) : [[t.taxLabel + ' (' + (t.taxRate || '__') + '%)', false]]).concat([[t.totalLabel, true]]);
  const totals = new Table({
    width: { size: 55, type: WidthType.PERCENTAGE }, alignment: AlignmentType.RIGHT, borders: noBorders,
    rows: totalsData.map(([k, bold]) => new TableRow({ children: [cell([right(k, { bold, size: bold ? 24 : 20 })], { width: { size: 60, type: WidthType.PERCENTAGE } }), cell([right(' ', { bold })], { width: { size: 40, type: WidthType.PERCENTAGE }, borders: bold ? { top: { style: BorderStyle.SINGLE, size: 12, color: t.color } } : undefined })] }))
  });

  const doc = new Document({
    creator: 'GetInvoiceMaker', title: t.title,
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children: [
      header, ...billTo, ...deal, new Paragraph({ text: '' }), items, new Paragraph({ text: '' }), totals,
      new Paragraph({ text: '' }), small(t.labels.notes), ...noteLines(t).map(n => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: n, size: 18 })] })),
      new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: t.footer, size: 14, color: '94A3B8' })] })
    ] }]
  });
  fs.writeFileSync(path.join(OUT, t.file + '.docx'), await Packer.toBuffer(doc));
}

// ---------- Fillable PDF ----------
function buildPdf(t) {
  return new Promise(resolve => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: t.title + ' template', Author: 'GetInvoiceMaker' } });
    const file = path.join(OUT, t.file + '.pdf');
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);
    // Form fields get an explicit 9 pt font only when their font differs from the form's default font.
    doc.font('Helvetica-Bold');
    doc.initForm();
    const color = '#' + t.color;
    let n = 0;
    const field = (x, y, w, h, opts) => { doc.font('Helvetica'); doc.formText('f' + (n++), x, y, w, h, Object.assign({ fontSize: 9, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' }, opts || {})); };
    doc.font('Helvetica-Bold').fontSize(t.title.length > 12 ? 20 : 26).fillColor(color).text(t.title, 40, 40);
    // from (left) + meta (right)
    let y = 82;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text(t.labels.from.toUpperCase(), 40, y);
    y += 12;
    t.from.forEach(f => { doc.font('Helvetica').fontSize(7).fillColor('#94a3b8').text(f, 40, y); field(40, y + 9, 250, 15); y += 28; });
    let my = 82;
    t.meta.forEach(([k, v]) => {
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text(k, 320, my + 4, { width: 120, align: 'right' });
      field(445, my, 110, 16, { value: v ? String(v) : '', align: 'right' });
      my += 22;
    });
    y = Math.max(y, my) + 8;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text(t.labels.to.toUpperCase(), 40, y);
    y += 12;
    t.to.forEach(f => { doc.font('Helvetica').fontSize(7).fillColor('#94a3b8').text(f, 40, y); field(40, y + 9, 300, 15); y += 28; });
    if (t.deal) {
      y += 4;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('TRANSACTION', 40, y);
      y += 12;
      t.deal.concat([['Gross commission', ''], ['Your commission', '']]).forEach(([k], i) => {
        const col = i % 2, x = col ? 300 : 40;
        doc.font('Helvetica').fontSize(8).fillColor('#475569').text(k, x, y + 4, { width: 110 });
        field(x + 112, y, 140, 16);
        if (col) y += 22;
      });
      y += 26;
    }
    y += 6;
    const cols = t.vatPerLine ? [[40, 245], [290, 55], [350, 70], [425, 40], [470, 85]] : [[40, 275], [320, 60], [385, 80], [470, 85]];
    doc.rect(40, y, 515, 20).fill(color);
    t.cols.forEach((h, i) => doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff').text(h, cols[i][0] + 4, y + 6, { width: cols[i][1] - 8, align: i === 0 ? 'left' : 'right' }));
    y += 24;
    for (let r = 0; r < t.rows; r++) {
      cols.forEach(([x, w], i) => field(x, y, w - 4, 17, { align: i === 0 ? 'left' : 'right' }));
      y += 21;
    }
    y += 6;
    const totalsRows = [[t.labels.subtotal]].concat(t.vatPerLine ? vatRates(t).map(rate => [`${vatLabel(t)} ${rate}%`]) : [[t.taxRate ? t.taxLabel + ' (' + t.taxRate + '%) and amount' : t.taxLabel + ' (%) and amount']]).concat([[t.totalLabel]]);
    totalsRows.forEach(([k], i) => {
      const isTotal = i === totalsRows.length - 1;
      doc.font(isTotal ? 'Helvetica-Bold' : 'Helvetica').fontSize(isTotal ? 10 : 8.5).fillColor(isTotal ? color : '#475569').text(k, 250, y + 5, { width: 210, align: 'right' });
      field(470, y, 85, 18, { align: 'right' });
      y += 23;
    });
    y += 6;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text(t.labels.notes.toUpperCase(), 40, y);
    field(40, y + 12, 515, noteLines(t).length > 1 ? 74 : 44, { multiline: true, value: noteLines(t).join('\n') });
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(7).fillColor('#94a3b8').text(t.footer + '  |  Or fill it in online and download a finished PDF.', 40, 805, { width: 515, align: 'center', lineBreak: false });
    doc.end();
    stream.on('finish', resolve);
  });
}

(async () => {
  const only = process.argv.slice(2);
  for (const name of only) if (!TEMPLATES.some(t => t.file === name)) { console.error('unknown template: ' + name); process.exit(1); }
  for (const t of TEMPLATES) {
    if (only.length && !only.includes(t.file)) continue;
    await buildXlsx(t);
    await buildDocx(t);
    await buildPdf(t);
    console.log('built', t.file);
  }
})();
