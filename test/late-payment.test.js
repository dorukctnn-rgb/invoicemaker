// Hand-computed cases for the late payment interest calculator (UK and Ireland).
// Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../public/js/late-payment.js');
const P = require('../public/js/prefill.js');

test('UK: rate is 8% over the base rate on the reference date before interest starts', () => {
  // Interest starting 1 Jan to 30 Jun uses 31 December before; 1 Jul to 31 Dec uses 30 June.
  const cases = [
    ['2026-07-01', '2026-06-30', 3.75, 11.75],
    ['2026-01-01', '2025-12-31', 3.75, 11.75], // cut to 3.75% on 18 Dec 2025 is in force on 31 Dec
    ['2025-07-01', '2025-06-30', 4.25, 12.25],
    ['2025-06-30', '2024-12-31', 4.75, 12.75],
    ['2024-07-01', '2024-06-30', 5.25, 13.25],
    ['2024-01-01', '2023-12-31', 5.25, 13.25],
    ['2023-07-01', '2023-06-30', 5, 13], // 5% from 22 June 2023
    ['2023-01-01', '2022-12-31', 3.5, 11.5],
    ['2022-07-01', '2022-06-30', 1.25, 9.25],
    ['2022-01-01', '2021-12-31', 0.25, 8.25],
    ['2016-02-02', '2015-12-31', 0.5, 8.5]
  ];
  for (const [first, ref, base, rate] of cases) {
    const r = L.ukRate(first);
    assert.equal(r.referenceDate, ref, first);
    assert.equal(r.base, base, first);
    assert.equal(r.rate, rate, first);
    assert.equal(r.provisional, false, first);
  }
});

test('UK: £2,400 due 15 Aug 2026, worked to 8 Oct 2026', () => {
  const r = L.calculate({ country: 'uk', amount: 2400, dueDate: '2026-08-15', until: '2026-10-08' });
  // 16 Aug to 8 Oct = 16 + 30 + 8 = 54 days. 2400 x 11.75% = 282.00 a year; 282 / 365 = 0.7726 a day.
  assert.equal(r.days, 54);
  assert.equal(r.periods.length, 1);
  assert.equal(r.periods[0].rate, 11.75);
  assert.equal(r.periods[0].referenceDate, '2026-06-30');
  assert.equal(L.round2(r.daily), 0.77);
  assert.equal(r.interest, 41.72); // 282 x 54 / 365 = 41.7205
  assert.equal(r.compensation, 70);
  assert.equal(r.claim, 111.72);
  assert.equal(r.totalDue, 2511.72);
});

test('UK: the rate stays fixed when the debt runs past 30 June', () => {
  // Interest starts 1 June 2025 (reference 31 Dec 2024, base 4.75%), runs 92 days to 31 Aug 2025.
  // The base rate on 30 June 2025 was 4.25%, but s.4(2) and art.4 fix the rate when interest starts.
  const r = L.calculate({ country: 'uk', amount: 1000, dueDate: '2025-05-31', until: '2025-08-31' });
  assert.equal(r.days, 92);
  assert.equal(r.periods.length, 1);
  assert.equal(r.periods[0].rate, 12.75);
  assert.equal(r.interest, 32.14); // 1000 x 12.75% x 92 / 365 = 32.1370
  assert.equal(r.compensation, 70); // exactly 1,000 is in the 70 band in the UK
});

test('UK: a due date one day earlier switches the reference date', () => {
  const late = L.calculate({ country: 'uk', amount: 10000, dueDate: '2025-06-30', until: '2025-07-30' });
  assert.equal(late.periods[0].referenceDate, '2025-06-30');
  assert.equal(late.periods[0].rate, 12.25);
  assert.equal(late.days, 30);
  assert.equal(late.interest, 100.68); // 10000 x 12.25% x 30 / 365 = 100.6849
  assert.equal(late.compensation, 100);
  const early = L.calculate({ country: 'uk', amount: 10000, dueDate: '2025-06-29', until: '2025-07-29' });
  assert.equal(early.periods[0].referenceDate, '2024-12-31');
  assert.equal(early.periods[0].rate, 12.75);
  assert.equal(early.interest, 104.79); // 10000 x 12.75% x 30 / 365 = 104.7945
});

test('UK: matches the gov.uk method (8.5%, £1,000, 50 days)', () => {
  // gov.uk: £85 a year, 23p a day after rounding, 50 days = £11.50. Without rounding the day first: £11.64.
  const r = L.calculate({ country: 'uk', amount: 1000, dueDate: '2016-02-01', until: '2016-03-22' });
  assert.equal(r.days, 50); // 2016 is a leap year: 2 to 29 Feb is 28 days, plus 22 days of March
  assert.equal(r.periods[0].rate, 8.5);
  assert.equal(r.interest, 11.64);
});

test('UK: compensation bands (s.5A)', () => {
  assert.equal(L.compensation('uk', 999.99), 40);
  assert.equal(L.compensation('uk', 1000), 70);
  assert.equal(L.compensation('uk', 9999.99), 70);
  assert.equal(L.compensation('uk', 10000), 100);
  assert.equal(L.compensation('uk', 250000), 100);
});

test('Ireland: compensation bands (S.I. 580/2012 Schedule) differ from the UK at the edges', () => {
  assert.equal(L.compensation('ie', 1000), 40);
  assert.equal(L.compensation('ie', 1000.01), 70);
  assert.equal(L.compensation('ie', 10000), 70);
  assert.equal(L.compensation('ie', 10000.01), 100);
});

test('Ireland: half-year rates computed from the ECB series equal the department table', () => {
  // enterprise.gov.ie "Late payment interest rate", read 8 Oct 2026: ECB rate and late payment rate from each date.
  const dete = [
    ['2013-03-16', 0.75, 8.75], ['2013-07-01', 0.5, 8.5], ['2014-01-01', 0.25, 8.25], ['2014-07-01', 0.15, 8.15],
    ['2015-01-01', 0.05, 8.05], ['2015-07-01', 0.05, 8.05], ['2016-01-01', 0.05, 8.05], ['2016-07-01', 0, 8],
    ['2017-01-01', 0, 8], ['2017-07-01', 0, 8], ['2018-01-01', 0, 8], ['2018-07-01', 0, 8], ['2019-01-01', 0, 8],
    ['2019-07-01', 0, 8], ['2020-01-01', 0, 8], ['2020-07-01', 0, 8], ['2021-01-01', 0, 8], ['2021-07-01', 0, 8],
    ['2022-01-01', 0, 8], ['2022-07-01', 0, 8], ['2023-01-01', 2.5, 10.5], ['2023-07-01', 4, 12], ['2024-01-01', 4.5, 12.5],
    ['2024-07-01', 4.25, 12.25], ['2025-01-01', 3.15, 11.15], ['2025-07-01', 2.15, 10.15], ['2026-01-01', 2.15, 10.15],
    ['2026-07-01', 2.4, 10.4]
  ];
  for (const [from, ecb, rate] of dete) {
    const r = L.ieRate(from);
    assert.equal(r.ecb, ecb, from);
    assert.equal(r.rate, rate, from);
    assert.equal(r.provisional, false, from);
  }
  const table = L.ieTable(2013, 2026);
  assert.equal(table.length, dete.length);
  assert.equal(table[table.length - 1].from, '2013-03-16');
});

test('Ireland: the department FAQ example (EUR 1,000, 25 days at 10.4%) gives 7.12', () => {
  const r = L.calculate({ country: 'ie', amount: 1000, dueDate: '2026-07-10', until: '2026-08-04' });
  assert.equal(r.days, 25);
  assert.equal(r.periods[0].rate, 10.4);
  assert.equal(r.interest, 7.12); // 1000 x 25 x (10.4% / 365) = 7.1233
  assert.equal(r.compensation, 40);
});

test('Ireland: a debt crossing 1 July, with the department method and the half-year split', () => {
  // EUR 5,000 due 31 May 2026, worked to 31 Aug 2026: 92 days late, became overdue on 1 June (10.15%).
  const one = L.calculate({ country: 'ie', amount: 5000, dueDate: '2026-05-31', until: '2026-08-31' });
  assert.equal(one.days, 92);
  assert.equal(one.periods.length, 1);
  assert.equal(one.periods[0].rate, 10.15);
  assert.equal(one.interest, 127.92); // 5000 x 10.15% x 92 / 365 = 127.9178
  assert.equal(one.compensation, 70);
  assert.ok(one.splitAlternative);
  assert.equal(one.splitAlternative.interest, 130.04);
  const split = L.calculate({ country: 'ie', amount: 5000, dueDate: '2026-05-31', until: '2026-08-31', method: 'split' });
  assert.equal(split.periods.length, 2);
  assert.deepEqual(split.periods.map(p => [p.from, p.to, p.days, p.rate]), [
    ['2026-06-01', '2026-06-30', 30, 10.15], // 5000 x 10.15% x 30 / 365 = 41.71
    ['2026-07-01', '2026-08-31', 62, 10.4] // 5000 x 10.4% x 62 / 365 = 88.33
  ]);
  assert.deepEqual(split.periods.map(p => p.interest), [41.71, 88.33]);
  assert.equal(split.interest, 130.04);
  assert.equal(split.claim, 200.04);
});

test('Ireland: the split crosses a year end and three half-years', () => {
  const r = L.calculate({ country: 'ie', amount: 2000, dueDate: '2024-12-15', until: '2025-08-10', method: 'split' });
  assert.deepEqual(r.periods.map(p => [p.from, p.to, p.days, p.rate]), [
    ['2024-12-16', '2024-12-31', 16, 12.25],
    ['2025-01-01', '2025-06-30', 181, 11.15],
    ['2025-07-01', '2025-08-10', 41, 10.15]
  ]);
  // 2000 x 12.25% x 16/365 = 10.74; 2000 x 11.15% x 181/365 = 110.58; 2000 x 10.15% x 41/365 = 22.80
  assert.deepEqual(r.periods.map(p => p.interest), [10.74, 110.58, 22.8]);
  assert.equal(r.interest, 144.12);
  assert.equal(r.days, 238);
});

test('Not late yet: no interest and no compensation', () => {
  const r = L.calculate({ country: 'uk', amount: 500, dueDate: '2026-10-08', until: '2026-10-08' });
  assert.equal(r.late, false);
  assert.equal(r.interest, 0);
  assert.equal(r.compensation, 0);
  assert.equal(L.reminder(r, 'INV-1'), '');
  assert.deepEqual(L.invoiceLines(r, 'INV-1'), []);
});

test('Rates after the last check are flagged as provisional', () => {
  const uk = L.calculate({ country: 'uk', amount: 1000, dueDate: '2027-01-10', until: '2027-02-10' });
  assert.equal(uk.provisional, true);
  assert.equal(uk.periods[0].referenceDate, '2026-12-31');
  assert.equal(uk.periods[0].rate, 11.75); // latest known base rate, 3.75%
  const ie = L.calculate({ country: 'ie', amount: 1000, dueDate: '2027-01-10', until: '2027-02-10' });
  assert.equal(ie.provisional, true);
  assert.equal(ie.periods[0].rate, 10.65); // latest known ECB rate, 2.65% from 16 Sep 2026
});

test('No agreed payment date', () => {
  // UK s.4(2H): 30-day period beginning with the day the customer had the invoice: 1 Mar to 30 Mar, interest from 31 Mar.
  assert.equal(L.defaultDueDate('uk', '2026-03-01'), '2026-03-30');
  // Ireland reg.2: the date falling 30 calendar days after receipt: 31 Mar, interest from 1 Apr.
  assert.equal(L.defaultDueDate('ie', '2026-03-01'), '2026-03-31');
});

test('Bad input is reported, not calculated', () => {
  assert.equal(L.calculate({ country: 'uk', amount: 0, dueDate: '2026-01-01', until: '2026-02-01' }).error.field, 'amount');
  assert.equal(L.calculate({ country: 'uk', amount: 100, dueDate: '2026-02-30', until: '2026-03-01' }).error.field, 'dueDate');
  assert.equal(L.calculate({ country: 'ie', amount: 100, dueDate: '2012-01-01', until: '2013-06-01' }).error.field, 'dueDate');
});

test('Reminder wording and invoice lines carry the figures', () => {
  const r = L.calculate({ country: 'uk', amount: 2400, dueDate: '2026-08-15', until: '2026-10-08' });
  const text = L.reminder(r, 'INV-104');
  assert.match(text, /Invoice INV-104 for £2,400\.00 was due for payment on 15 August 2026/);
  assert.match(text, /at 11\.75% a year \(8% plus the Bank of England base rate of 3\.75% in force on 30 June 2026\)/);
  assert.match(text, /From 16 August to 8 October 2026 \(54 days\) the interest comes to £41\.72/);
  assert.match(text, /The total now due is £2,511\.72/);
  assert.match(text, /£0\.77 a day/);
  const lines = L.invoiceLines(r, 'INV-104');
  assert.deepEqual(lines.map(l => l.r), [2400, 41.72, 70]);
  assert.match(lines[1].d, /^Statutory interest at 11\.75% a year, 16 August to 8 October 2026 \(54 days\)$/);
  const ie = L.calculate({ country: 'ie', amount: 5000, dueDate: '2026-05-31', until: '2026-08-31', method: 'split' });
  assert.match(L.reminder(ie, ''), /at 10\.15% from 1 June 2026 and 10\.40% from 1 July 2026/);
  assert.match(L.invoiceLines(ie, '')[1].d, /10\.15% for 30 days and 10\.40% for 62 days/);
});

test('Prefill survives the round trip and rejects bad input', () => {
  const r = L.calculate({ country: 'ie', amount: 5000, dueDate: '2026-05-31', until: '2026-08-31' });
  const enc = P.encode({ currency: 'EUR', items: L.invoiceLines(r, 'A-7'), notes: L.invoiceNotes(r, 'A-7') });
  const dec = P.decode(enc);
  assert.equal(dec.currency, 'EUR');
  assert.deepEqual(dec.items.map(i => i.r), [5000, 127.92, 70]);
  assert.match(dec.notes, /S\.I\. No\. 580 of 2012/);
  assert.equal(P.decode('not json'), null);
  assert.equal(P.decode(encodeURIComponent(JSON.stringify({ v: 2, items: [] }))), null);
  const evil = P.decode(encodeURIComponent(JSON.stringify({ v: 1, currency: 'GBP"><script>', items: [{ d: '<img src=x onerror=alert(1)>\nnext', q: '1', r: 1e12 }, { d: 'ok', q: 2, r: '3.456' }], notes: 5 })));
  assert.equal(evil.currency, '');
  assert.deepEqual(evil.items, [{ d: 'ok', q: 2, r: 3.46 }]); // out-of-range rate dropped; markup is escaped by the generator on render
  assert.equal(evil.notes, '');
  const many = P.decode(P.encode({ currency: 'GBP', items: Array.from({ length: 50 }, (_, i) => ({ d: 'x' + i, q: 1, r: 1 })) }));
  assert.equal(many.items.length, P.MAX_ITEMS);
});
