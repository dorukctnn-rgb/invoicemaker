// Hand-computed cases for the India GST tax invoice (CGST Act s. 9; CGST Rules 46, 47, 48, 49, 96A).
// Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../public/js/india-gst.js');

const SUP = '29ABCDE1234F1ZW', CUS = '29PQRSA5678K1ZH';
const base = {
  type: 'tax', supply: 'domestic', supplierName: 'A', supplierAddress: 'Bengaluru', supplierGstin: SUP, supplierState: '29',
  customerName: 'B', customerAddress: 'Bengaluru', customerGstin: CUS, placeOfSupply: '29', number: '2026-27/042', issueDate: '2026-11-10'
};
const inv = (extra) => G.compute(Object.assign({}, base, extra));
const line = (o) => Object.assign({ desc: 'Service', hsn: '998314', qty: 1, price: 1000, gst: 18 }, o);

test('Within one State the GST splits into CGST and SGST of half the rate each', () => {
  // 60,000 + 12,000 + 24,000 = 96,000; 18% = 17,280 = 8,640 CGST + 8,640 SGST; total 1,13,280
  const r = inv({ lines: [line({ price: 60000 }), line({ price: 12000, hsn: '998315' }), line({ price: 24000, hsn: '998313' })] });
  assert.equal(r.kind, 'intra');
  assert.deepEqual([r.taxable, r.cgst, r.sgst, r.igst, r.tax, r.total], [96000, 8640, 8640, 0, 17280, 113280]);
  assert.deepEqual(r.warnings, []);
  const html = G.invoiceHTML(r);
  assert.match(html, /TAX INVOICE/);
  assert.match(html, /₹1,13,280\.00/);
  assert.match(html, /<th class="num">CGST<\/th><th class="num">SGST<\/th>/);
  assert.match(html, /<small>@ 9%<\/small>/);
});

test('Between States the whole rate is IGST and the place of supply is shown', () => {
  const r = inv({ placeOfSupply: '27', customerGstin: '', lines: [line({ price: 96000 })] });
  assert.equal(r.kind, 'inter');
  assert.deepEqual([r.cgst, r.sgst, r.igst, r.total], [0, 0, 17280, 113280]);
  const html = G.invoiceHTML(r);
  assert.match(html, /Maharashtra \(27\)/);
  assert.match(html, /<th class="num">IGST<\/th>/);
  assert.match(html, /<small>@ 18%<\/small>/);
  assert.doesNotMatch(html, /CGST/);
});

test('Union territories without a legislature charge UTGST in place of SGST', () => {
  const r = inv({ supplierState: '04', placeOfSupply: '04', supplierGstin: '', lines: [line({ price: 1000, gst: 5 })] });
  assert.equal(r.stateTax, 'UTGST');
  assert.deepEqual([r.cgst, r.sgst], [25, 25]);
  assert.match(G.invoiceHTML(r), /UTGST/);
});

test('Tax is worked out line by line after the line discount, to the paisa', () => {
  // 3 x 33.33 = 99.99, discount 10 -> taxable 89.99; 9% each = 8.0991 -> CGST 8.10 + SGST 8.10
  const r = inv({ lines: [line({ qty: 3, price: 33.33, disc: 10 })] });
  assert.equal(r.lines[0].taxable, 89.99);
  assert.equal(r.cgst, 8.1);
  assert.equal(r.sgst, 8.1);
  assert.equal(r.discount, 10);
  // a discount above the line value is capped
  assert.equal(inv({ lines: [line({ price: 10, disc: 999 })] }).total, 0);
});

test('Mixed rates are summed apart and the 0% line carries no tax', () => {
  const r = inv({ lines: [line({ price: 1000, gst: 5 }), line({ price: 2000, gst: 18 }), line({ price: 500, gst: 0 })] });
  assert.deepEqual(r.groups.map(g => [g.rate, g.taxable, g.cgst, g.sgst]), [[0, 500, 0, 0], [5, 1000, 25, 25], [18, 2000, 180, 180]]);
  assert.equal(r.total, 3500 + 50 + 360);
  assert.match(G.invoiceHTML(r), /ut-sum/);
});

test('Round off moves the total to the nearest rupee', () => {
  // 100.40 + 18% = 118.472 -> 9.04 + 9.04 CGST/SGST -> 118.48; round off -0.48 -> 118.00
  const r = inv({ roundOff: true, lines: [line({ price: 100.4 })] });
  assert.equal(r.total, 118.48);
  assert.equal(r.roundOff, -0.48);
  assert.equal(r.grand, 118);
  assert.match(G.invoiceHTML(r), /Round off/);
});

test('Reverse charge adds no tax and says so', () => {
  const r = inv({ reverseCharge: true, lines: [line({ price: 1000 })] });
  assert.equal(r.tax, 0);
  assert.equal(r.total, 1000);
  assert.match(G.invoiceHTML(r), /reverse charge basis: Yes/);
  assert.match(G.invoiceHTML(inv({ lines: [line()] })), /reverse charge<\/dt><dd>No/);
});

test('Exports carry the Rule 46 endorsement, the country, and IGST only when paid', () => {
  const lut = inv({ supply: 'exportLut', placeOfSupply: '', country: 'United States', customerGstin: '', lines: [line({ price: 5000 })] });
  assert.equal(lut.igst, 0);
  assert.equal(lut.total, 5000);
  assert.match(lut.endorsement, /UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX$/);
  assert.deepEqual(lut.warnings, []);
  const paid = inv({ supply: 'exportIgst', placeOfSupply: '', country: 'Germany', customerGstin: '', lines: [line({ price: 5000 })] });
  assert.equal(paid.igst, 900);
  assert.match(paid.endorsement, /ON PAYMENT OF INTEGRATED TAX$/);
  assert.match(G.invoiceHTML(paid), /Outside India: Germany/);
  assert.ok(inv({ supply: 'exportLut', country: '', lines: [line()] }).warnings.some(w => /country of destination/.test(w)));
});

test('A bill of supply has no tax columns and no GSTIN requirement', () => {
  const r = inv({ type: 'bill', supplierGstin: '', customerGstin: '', lines: [line({ price: 2500 })] });
  assert.equal(r.tax, 0);
  assert.equal(r.total, 2500);
  assert.equal(r.warnings.length, 0);
  const html = G.invoiceHTML(r);
  assert.match(html, /BILL OF SUPPLY/);
  assert.doesNotMatch(html, /GST %|IGST|CGST/);
});

test('GSTIN: format and check character', () => {
  assert.equal(G.gstinValid('27AAPFU0939F1ZV'), true);
  assert.equal(G.gstinValid('27aapfu0939f1zv'), true);
  assert.equal(G.gstinValid('27AAPFU0939F1ZX'), false); // wrong check character
  assert.equal(G.gstinValid('27AAPFU0939F1Y'), false);  // too short
  assert.equal(G.gstinValid('99AAPFU0939F1ZV'), false); // no such State code
  assert.equal(G.gstinValid(SUP), true);
  assert.equal(G.gstinValid(CUS), true);
  assert.equal(G.stateOfGstin('27AAPFU0939F1ZV'), '27');
  assert.equal(G.stateOfGstin('9'), '');
});

test('Warnings: GSTIN, State mismatch, invoice number, HSN, unregistered customer at Rs 50,000', () => {
  assert.ok(inv({ supplierGstin: '', lines: [line()] }).warnings.some(w => /Add your GSTIN/.test(w)));
  assert.ok(inv({ supplierGstin: '29ABCDE1234F1ZX', lines: [line()] }).warnings.some(w => /format check/.test(w)));
  assert.ok(inv({ supplierState: '27', placeOfSupply: '27', lines: [line()] }).warnings.some(w => /state code of Karnataka/.test(w)));
  assert.ok(inv({ number: '', lines: [line()] }).warnings.some(w => /invoice number/.test(w)));
  assert.ok(inv({ number: 'INV-2026-27-000000042', lines: [line()] }).warnings.some(w => /at most 16 characters/.test(w)));
  assert.ok(inv({ lines: [line({ hsn: '' })] }).warnings.some(w => /Add an HSN or SAC code to line 1/.test(w)));
  const big = inv({ customerGstin: '', customerAddress: '', lines: [line({ price: 50000, gst: 0 })] });
  assert.ok(big.warnings.some(w => /Rule 46\(e\)/.test(w)));
  assert.ok(!inv({ customerGstin: '', customerAddress: '', lines: [line({ price: 49999 })] }).warnings.some(w => /Rule 46\(e\)/.test(w)));
  assert.ok(inv({ placeOfSupply: '', lines: [line()] }).warnings.some(w => /place of supply/.test(w)));
});

test('Invoice number rule: up to 16 characters, letters, numerals, hyphen, slash', () => {
  assert.equal(G.invoiceNumberValid('2026-27/042'), true);
  assert.equal(G.invoiceNumberValid('INV-0042'), true);
  assert.equal(G.invoiceNumberValid('1234567890123456'), true);
  assert.equal(G.invoiceNumberValid('12345678901234567'), false);
  assert.equal(G.invoiceNumberValid('INV 42'), false);
  assert.equal(G.invoiceNumberValid('INV_42'), false);
  assert.equal(G.invoiceNumberValid(''), false);
});

test('Indian digit grouping and amount in words', () => {
  assert.equal(G.money(1234567.891), '₹12,34,567.89');
  assert.equal(G.money(999.5), '₹999.50');
  assert.equal(G.money(100000), '₹1,00,000.00');
  assert.equal(G.rupeesInWords(113280), 'Indian Rupees One Lakh Thirteen Thousand Two Hundred Eighty Only');
  assert.equal(G.rupeesInWords(1234567.5), 'Indian Rupees Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven and Fifty Paise Only');
  assert.equal(G.rupeesInWords(10000000), 'Indian Rupees One Crore Only');
  assert.equal(G.rupeesInWords(0), 'Indian Rupees Zero Only');
  assert.equal(G.rupeesInWords(105), 'Indian Rupees One Hundred Five Only');
});

test('The copy label (Rule 48) and the party blocks are printed; markup in names is escaped', () => {
  const r = inv({ copy: 'supplier', supplierName: '<b>X & Co</b>', lines: [line()] });
  const html = G.invoiceHTML(r);
  assert.match(html, /DUPLICATE FOR SUPPLIER/);
  assert.match(html, /&lt;b&gt;X &amp; Co&lt;\/b&gt;/);
  assert.match(html, /GSTIN 29ABCDE1234F1ZW/);
  assert.match(html, /Karnataka \(29\)/);
  assert.match(html, /Signature of the supplier/);
});

test('Bad input is cleaned: unknown type, rates out of range, too many lines', () => {
  const r = G.compute({ type: 'nonsense', supply: 'x', lines: new Array(100).fill({ qty: 1, price: 1, gst: 500 }) });
  assert.equal(r.data.type, 'tax');
  assert.equal(r.lines.length, G.MAX_LINES);
  assert.equal(r.lines[0].rate, 0);
});
