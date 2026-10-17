// Hand-computed cases for the UAE tax invoice (VAT Decree-Law Art. 3, 48, 69; Executive Regulation Art. 59, 61).
// Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const U = require('../public/js/uae-vat.js');

const base = {
  type: 'tax', currency: 'AED', supplierName: 'A', supplierTrn: '100000000000003', customerName: 'B', customerTrn: '100000000000005',
  number: 'INV-1', issueDate: '2026-10-15', supplyDate: '2026-10-12'
};
const inv = (extra) => U.compute(Object.assign({}, base, extra));

test('Standard rate is 5% on each line, rounded to the fils', () => {
  // 8,500 + 1,200 + 500 x 1.80 = 10,600; VAT 425 + 60 + 45 = 530; total 11,130
  const r = inv({ lines: [{ desc: 'Design', qty: 1, price: 8500 }, { desc: 'Hosting', qty: 1, price: 1200 }, { desc: 'Brochures', qty: 500, price: 1.8 }] });
  assert.deepEqual(r.lines.map(l => [l.taxable, l.tax, l.total]), [[8500, 425, 8925], [1200, 60, 1260], [900, 45, 945]]);
  assert.equal(r.subtotal, 10600);
  assert.equal(r.tax, 530);
  assert.equal(r.total, 11130);
  assert.deepEqual(r.warnings, []);
  const html = U.invoiceHTML(r);
  assert.match(html, /<th class="num">Total \(AED\)<\/th>/);
  assert.match(html, />8,925\.00</);
  assert.match(html, /AED 11,130\.00/);
  // 33.33 x 5% = 1.6665 -> 1.67 (nearest fils, Article 61)
  assert.equal(inv({ lines: [{ qty: 1, price: 33.33 }] }).tax, 1.67);
});

test('Zero-rated and exempt lines carry no VAT and are summed apart', () => {
  const r = inv({ lines: [{ qty: 2, price: 100, vat: 'standard' }, { qty: 1, price: 300, vat: 'zero' }, { qty: 1, price: 50, vat: 'exempt' }] });
  assert.deepEqual(r.groups.map(g => [g.key, g.taxable, g.tax]), [['standard', 200, 10], ['zero', 300, 0], ['exempt', 50, 0]]);
  assert.equal(r.total, 560);
  const html = U.invoiceHTML(r);
  assert.match(html, /Lines marked Exempt are exempt supplies/);
  assert.match(html, /Lines at 0% are zero-rated supplies/);
});

test('An invoice discount is shared across lines before VAT', () => {
  // 1,000 (5%) and 500 (0%), discount 150: shares 100 and 50; VAT 900 x 5% = 45; total 1,350 + 45 = 1,395
  const r = inv({ discount: 150, lines: [{ qty: 1, price: 1000 }, { qty: 1, price: 500, vat: 'zero' }] });
  assert.deepEqual(r.lines.map(l => [l.disc, l.taxable, l.tax]), [[100, 900, 45], [50, 450, 0]]);
  assert.equal(r.taxable, 1350);
  assert.equal(r.total, 1395);
  // Shares that round unevenly still add up to the discount: 10 over three lines of 1
  const s = inv({ discount: 0.1, lines: [{ qty: 1, price: 1 }, { qty: 1, price: 1 }, { qty: 1, price: 1 }] });
  assert.equal(Math.round(s.lines.reduce((a, l) => a + l.disc, 0) * 100) / 100, 0.1);
  // A discount larger than the subtotal is capped
  assert.equal(inv({ discount: 999, lines: [{ qty: 1, price: 10 }] }).total, 0);
});

test('Another currency: amounts and VAT also in AED at the rate given', () => {
  // USD 2,000 + 5% = 2,100; at 3.5 AED per USD (test rate): VAT 350.00 AED, total 7,350.00 AED
  const r = inv({ currency: 'USD', fxRate: '3.5', lines: [{ qty: 1, price: 2000 }] });
  assert.deepEqual(r.aed, { taxable: 7000, tax: 350, total: 7350 });
  assert.equal(r.lines[0].totalAed, 7350);
  const html = U.invoiceHTML(r);
  assert.match(html, /Total in AED/);
  assert.match(html, /1 USD = 3\.5 AED/);
  const missing = inv({ currency: 'USD', lines: [{ qty: 1, price: 10 }] });
  assert.equal(missing.aed, null);
  assert.ok(missing.warnings.some(w => /exchange rate/.test(w)));
});

test('Simplified tax invoice: allowed up to AED 10,000 for a registered customer, never with the reverse charge', () => {
  const ok = inv({ type: 'simplified', lines: [{ qty: 1, price: 9000 }] }); // 9,450 with VAT
  assert.deepEqual(ok.warnings, []);
  assert.equal(ok.title, 'TAX INVOICE');
  const over = inv({ type: 'simplified', lines: [{ qty: 1, price: 9600 }] }); // 10,080 with VAT
  assert.ok(over.warnings.some(w => /AED 10,000/.test(w)));
  const unregistered = inv({ type: 'simplified', customerTrn: '', lines: [{ qty: 1, price: 50000 }] });
  assert.ok(!unregistered.warnings.some(w => /AED 10,000/.test(w)));
  const rc = inv({ type: 'simplified', reverseCharge: true, lines: [{ qty: 1, price: 100 }] });
  assert.ok(rc.warnings.some(w => /reverse charge/.test(w)));
});

test('Reverse charge: no VAT charged, statement with Article 48', () => {
  const r = inv({ reverseCharge: true, lines: [{ qty: 1, price: 1000 }] });
  assert.equal(r.tax, 0);
  assert.equal(r.total, 1000);
  assert.match(U.invoiceHTML(r), /required to account for the VAT on this supply under Article 48/);
});

test('Not registered: titled Invoice, no VAT, no TRN warnings', () => {
  const r = inv({ type: 'plain', supplierTrn: '', reverseCharge: true, lines: [{ qty: 2, price: 100, vat: 'standard' }] });
  assert.equal(r.title, 'INVOICE');
  assert.equal(r.tax, 0);
  assert.equal(r.total, 200);
  assert.equal(r.data.reverseCharge, false);
  assert.ok(!r.warnings.some(w => /TRN/.test(w)));
  assert.doesNotMatch(U.invoiceHTML(r), /VAT rate/);
});

test('TRN checks and escaping', () => {
  assert.equal(U.trnValid('100 000 000 000 003'), true);
  assert.equal(U.trnValid('12345'), false);
  const r = inv({ supplierTrn: '123', customerTrn: '99', supplierName: '<script>x</script>', lines: [{ desc: 'A & B <i>', qty: 1, price: 1 }] });
  assert.ok(r.warnings.some(w => /15-digit TRN/.test(w)));
  assert.ok(r.warnings.some(w => /customer's TRN/.test(w)));
  const html = U.invoiceHTML(r);
  assert.doesNotMatch(html, /<script>|<i>/);
  assert.match(html, /A &amp; B &lt;i&gt;/);
  assert.match(html, /Date of supply/); // 12 Oct differs from the 15 Oct issue date
  assert.match(html, /12 October 2026/);
});
