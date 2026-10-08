/* Late payment interest on business invoices: UK and Ireland.
   Pure functions and rate data, no DOM. The calculator page uses it in the browser and the server
   uses it to render the rate tables, so both always show the same figures.

   UK: Late Payment of Commercial Debts (Interest) Act 1998 s.1 (simple interest), s.4(2) (interest starts
   the day after the relevant day, at the rate prevailing at the end of that day), s.5A (fixed sums) and the
   Late Payment of Commercial Debts (Rate of Interest) (No. 3) Order 2002 art.4 (8% over the Bank of England
   rate in force on 30 June or 31 December immediately before the day interest starts to run). The Scottish
   order (SSI 2002/336) sets the same rate. One rate applies to the whole debt.

   Ireland: European Communities (Late Payment in Commercial Transactions) Regulations 2012 (S.I. 580/2012)
   reg.4 and reg.5 (ECB main refinancing rate before 1 January or 1 July, plus 8 points) and reg.9 with the
   Schedule (compensation). The Department of Enterprise, Tourism and Employment says to apply the daily
   rate in operation on the date the payment became overdue; the "split" method applies each half-year's
   rate to the days in that half-year instead. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LatePay = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Every rate below was read on this date. Reference dates after it are not known yet.
  var CHECKED = '2026-10-08';

  // Bank of England Bank Rate: date each new rate took effect, and the rate in percent.
  // Source: Bank of England, Official Bank Rate history (boeapps/database/Bank-Rate.asp).
  var BOE = [
    ['2009-03-05', 0.5], ['2016-08-04', 0.25], ['2017-11-02', 0.5], ['2018-08-02', 0.75],
    ['2020-03-11', 0.25], ['2020-03-19', 0.1], ['2021-12-16', 0.25], ['2022-02-03', 0.5],
    ['2022-03-17', 0.75], ['2022-05-05', 1], ['2022-06-16', 1.25], ['2022-08-04', 1.75],
    ['2022-09-22', 2.25], ['2022-11-03', 3], ['2022-12-15', 3.5], ['2023-02-02', 4],
    ['2023-03-23', 4.25], ['2023-05-11', 4.5], ['2023-06-22', 5], ['2023-08-03', 5.25],
    ['2024-08-01', 5], ['2024-11-07', 4.75], ['2025-02-06', 4.5], ['2025-05-08', 4.25],
    ['2025-08-07', 4], ['2025-12-18', 3.75]
  ];

  // ECB main refinancing operations rate: date each new rate took effect, and the rate in percent.
  // Source: ECB, Key ECB interest rates. Cross-checked against the Irish department's published table.
  var ECB = [
    ['2011-12-14', 1], ['2012-07-11', 0.75], ['2013-05-08', 0.5], ['2013-11-13', 0.25],
    ['2014-06-11', 0.15], ['2014-09-10', 0.05], ['2016-03-16', 0], ['2022-07-27', 0.5],
    ['2022-09-14', 1.25], ['2022-11-02', 2], ['2022-12-21', 2.5], ['2023-02-08', 3],
    ['2023-03-22', 3.5], ['2023-05-10', 3.75], ['2023-06-21', 4], ['2023-08-02', 4.25],
    ['2023-09-20', 4.5], ['2024-06-12', 4.25], ['2024-09-18', 3.65], ['2024-10-23', 3.4],
    ['2024-12-18', 3.15], ['2025-02-05', 2.9], ['2025-03-12', 2.65], ['2025-04-23', 2.4],
    ['2025-06-11', 2.15], ['2026-06-17', 2.4], ['2026-09-16', 2.65]
  ];

  // Earliest first day of interest each calculation supports.
  var EARLIEST = { uk: '2009-07-01', ie: '2013-03-16' };

  var COUNTRIES = {
    uk: { code: 'uk', currency: 'GBP', symbol: '£', name: 'United Kingdom' },
    ie: { code: 'ie', currency: 'EUR', symbol: '€', name: 'Ireland' }
  };

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAY = 864e5;

  // ---- dates as YYYY-MM-DD strings, worked in UTC so time zones never shift a day ----
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return iso(t) === s;
  }
  function ms(s) { return Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function addDays(s, n) { return iso(ms(s) + n * DAY); }
  function diffDays(a, b) { return Math.round((ms(b) - ms(a)) / DAY); }
  function longDate(s) { return +s.slice(8, 10) + ' ' + MONTHS[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4); }
  function shortRange(a, b) {
    // "16 August to 8 October 2026", or with both years when they differ.
    var sameYear = a.slice(0, 4) === b.slice(0, 4);
    var left = +a.slice(8, 10) + ' ' + MONTHS[+a.slice(5, 7) - 1] + (sameYear ? '' : ' ' + a.slice(0, 4));
    return left + ' to ' + longDate(b);
  }

  function round2(x) { return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function pct(x) { return Math.round(x * 100) / 100; }

  function rateOn(list, day) {
    var r = null;
    for (var i = 0; i < list.length && list[i][0] <= day; i++) r = list[i][1];
    return r;
  }

  // ---- UK: one rate, fixed by the reference date before interest starts ----
  function ukReferenceDate(firstDay) {
    var y = +firstDay.slice(0, 4), m = +firstDay.slice(5, 7);
    return m <= 6 ? (y - 1) + '-12-31' : y + '-06-30';
  }
  function ukRate(firstDay) {
    var ref = ukReferenceDate(firstDay);
    var known = ref <= CHECKED;
    var base = rateOn(BOE, known ? ref : CHECKED);
    if (base === null) return null;
    return { referenceDate: ref, base: base, rate: pct(base + 8), provisional: !known };
  }

  // ---- Ireland: the reference rate for each half-year ----
  function iePeriod(day) {
    var y = day.slice(0, 4);
    return +day.slice(5, 7) <= 6 ? { start: y + '-01-01', end: y + '-06-30' } : { start: y + '-07-01', end: y + '-12-31' };
  }
  function ieRate(day) {
    var p = iePeriod(day);
    var known = p.start <= CHECKED;
    var ecb = rateOn(ECB, known ? addDays(p.start, -1) : CHECKED);
    if (ecb === null) return null;
    return { periodStart: p.start, periodEnd: p.end, ecb: ecb, rate: pct(ecb + 8), provisional: !known };
  }

  // ---- fixed compensation per invoice ----
  function compensation(country, amount) {
    var a = round2(+amount || 0);
    if (!(a > 0)) return 0;
    if (country === 'uk') return a < 1000 ? 40 : a < 10000 ? 70 : 100; // s.5A(2): less than 1,000 / 1,000 to under 10,000 / 10,000 or more
    return a <= 1000 ? 40 : a <= 10000 ? 70 : 100; // S.I. 580/2012 Schedule: not exceeding 1,000 / exceeding 1,000 up to 10,000 / exceeding 10,000
  }

  // Last day for payment when no date was agreed. `start` is the later of the day the customer had the
  // invoice and the day the goods or services were delivered.
  // UK s.4(2H): the relevant day is the last day of the 30-day period beginning with `start` (start + 29).
  // Ireland reg.2: the relevant payment date is the date falling 30 calendar days after `start`.
  function defaultDueDate(country, start) {
    if (!isDate(start)) return '';
    return addDays(start, country === 'uk' ? 29 : 30);
  }

  function money(country, n) {
    var c = COUNTRIES[country] || COUNTRIES.uk;
    var parts = Math.abs(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? '-' : '') + c.symbol + parts[0] + '.' + parts[1];
  }
  function rateText(r) { return r.toFixed(2) + '%'; }

  // ---- the calculation ----
  // o = { country: 'uk' | 'ie', amount, dueDate: 'YYYY-MM-DD', until: 'YYYY-MM-DD', method: 'single' | 'split' }
  function calculate(o) {
    var country = o && o.country === 'ie' ? 'ie' : 'uk';
    var amount = round2(parseFloat(o && o.amount));
    var res = { country: country, currency: COUNTRIES[country].currency, amount: amount, dueDate: o && o.dueDate, until: o && o.until, method: country === 'ie' && o.method === 'split' ? 'split' : 'single' };
    if (!(amount > 0) || amount > 1e9) return fail(res, 'amount', 'Enter the unpaid amount.');
    if (!isDate(res.dueDate)) return fail(res, 'dueDate', 'Enter the date payment was due.');
    if (!isDate(res.until)) return fail(res, 'until', 'Enter the date to work out interest to.');
    var days = diffDays(res.dueDate, res.until);
    res.firstDay = addDays(res.dueDate, 1);
    if (days <= 0) {
      res.days = 0; res.late = false; res.periods = []; res.interest = 0; res.compensation = 0; res.claim = 0; res.totalDue = amount; res.daily = 0;
      return res;
    }
    if (res.firstDay < EARLIEST[country]) return fail(res, 'dueDate', country === 'uk' ? 'This calculator covers interest from July 2009 onwards.' : 'The 2012 Regulations cover contracts made from 16 March 2013; this calculator starts there.');
    res.days = days; res.late = true;
    var periods = [];
    if (country === 'uk' || res.method === 'single') {
      var r = country === 'uk' ? ukRate(res.firstDay) : ieRate(res.firstDay);
      periods.push(period(res.firstDay, res.until, days, r));
    } else {
      var s = res.firstDay;
      while (s <= res.until) {
        var rr = ieRate(s);
        var end = rr.periodEnd < res.until ? rr.periodEnd : res.until;
        periods.push(period(s, end, diffDays(s, end) + 1, rr));
        s = addDays(end, 1);
      }
    }
    periods.forEach(function (p) {
      p.daily = amount * p.rate / 36500;
      p.interest = round2(amount * p.rate * p.days / 36500);
    });
    res.periods = periods;
    res.provisional = periods.some(function (p) { return p.provisional; });
    res.interest = round2(periods.reduce(function (a, p) { return a + p.interest; }, 0));
    res.daily = periods[periods.length - 1].daily;
    res.compensation = compensation(country, amount);
    res.claim = round2(res.interest + res.compensation);
    res.totalDue = round2(amount + res.claim);
    if (country === 'ie' && res.method === 'single') {
      // Show what the half-year reading would give, when it differs.
      var alt = calculate({ country: 'ie', amount: amount, dueDate: res.dueDate, until: res.until, method: 'split' });
      if (alt.periods && alt.periods.length > 1 && Math.abs(alt.interest - res.interest) >= 0.005) res.splitAlternative = { interest: alt.interest, periods: alt.periods };
    }
    return res;
  }
  function period(from, to, days, r) {
    return { from: from, to: to, days: days, rate: r.rate, base: r.base, ecb: r.ecb, referenceDate: r.referenceDate, periodStart: r.periodStart, provisional: r.provisional };
  }
  function fail(res, field, message) { res.error = { field: field, message: message }; return res; }

  // ---- words: the working, the reminder and the invoice lines ----
  function rateBasis(country, p) {
    if (country === 'uk') return '8% plus the Bank of England base rate of ' + rateText(p.base) + ' in force on ' + longDate(p.referenceDate);
    return 'the ECB main refinancing rate of ' + rateText(p.ecb) + ' for the half-year from ' + longDate(p.periodStart) + ', plus 8 percentage points';
  }
  function law(country) {
    return country === 'uk' ? 'the Late Payment of Commercial Debts (Interest) Act 1998' : 'the European Communities (Late Payment in Commercial Transactions) Regulations 2012 (S.I. No. 580 of 2012)';
  }

  function reminder(res, ref) {
    if (!res || res.error || !res.late) return '';
    var c = res.country, m = function (n) { return money(c, n); };
    var inv = ref ? 'Invoice ' + ref : 'Our invoice';
    var p0 = res.periods[0];
    var rateLine;
    if (res.periods.length === 1) {
      rateLine = 'at ' + rateText(p0.rate) + ' a year (' + rateBasis(c, p0) + ')';
    } else {
      rateLine = 'at ' + res.periods.map(function (p) { return rateText(p.rate) + ' from ' + longDate(p.from); }).join(' and ');
    }
    var lines = [
      'Hello,',
      '',
      inv + ' for ' + m(res.amount) + ' was due for payment on ' + longDate(res.dueDate) + ' and is still unpaid. As a debt between businesses it carries statutory interest under ' + law(c) + ', ' + rateLine + '.',
      '',
      'From ' + shortRange(res.firstDay, res.until) + ' (' + res.days + ' day' + (res.days === 1 ? '' : 's') + ') the interest comes to ' + m(res.interest) + '. ' +
        (c === 'uk' ? 'Fixed compensation of ' + m(res.compensation) + ' also applies under section 5A of the Act.' : 'Compensation of ' + m(res.compensation) + ' towards recovery costs also applies under Regulation 9.'),
      '',
      'The total now due is ' + m(res.totalDue) + ' (' + m(res.amount) + ' plus ' + m(res.claim) + '). Interest continues at ' + m(round2(res.daily)) + ' a day until payment is received. A reminder invoice with these lines is attached.',
      '',
      'Please arrange payment within 7 days.',
      '',
      'Kind regards,'
    ];
    return lines.join('\n');
  }

  function invoiceLines(res, ref) {
    if (!res || res.error || !res.late) return [];
    var c = res.country;
    var first = (ref ? 'Invoice ' + ref : 'Unpaid invoice') + ', due ' + longDate(res.dueDate);
    var interestDesc;
    if (res.periods.length === 1) interestDesc = (c === 'uk' ? 'Statutory interest' : 'Late payment interest') + ' at ' + rateText(res.periods[0].rate) + ' a year, ' + shortRange(res.firstDay, res.until) + ' (' + res.days + ' days)';
    else interestDesc = 'Late payment interest, ' + res.periods.map(function (p) { return rateText(p.rate) + ' for ' + p.days + ' days'; }).join(' and ') + ', to ' + longDate(res.until);
    var compDesc = c === 'uk' ? 'Fixed compensation for late payment (Late Payment of Commercial Debts (Interest) Act 1998, s.5A)' : 'Compensation for recovery costs (S.I. No. 580 of 2012, Regulation 9)';
    return [
      { d: first, q: 1, r: res.amount },
      { d: interestDesc, q: 1, r: res.interest },
      { d: compDesc, q: 1, r: res.compensation }
    ];
  }

  function invoiceNotes(res, ref) {
    if (!res || res.error || !res.late) return '';
    var c = res.country;
    return (ref ? 'Invoice ' + ref : 'The original invoice') + ' (' + money(c, res.amount) + ') was due on ' + longDate(res.dueDate) + '. ' +
      'Interest and compensation are charged under ' + law(c) + '. Interest continues at ' + money(c, round2(res.daily)) + ' a day until payment.';
  }

  // ---- the result panel, as HTML (used by the server for the first paint and by the page script) ----
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function compBand(country, amount) {
    if (country === 'uk') return amount < 1000 ? 'debt under £1,000' : amount < 10000 ? 'debt from £1,000 to under £10,000' : 'debt of £10,000 or more';
    return 'recovery costs, ' + (amount <= 1000 ? 'debt up to €1,000' : amount <= 10000 ? 'debt above €1,000, up to €10,000' : 'debt above €10,000');
  }
  function resultHTML(res) {
    var head = '<p class="eyebrow">Interest and compensation you can claim</p>';
    if (!res || res.error) return head + '<p class="big">&nbsp;</p><p class="wait">' + esc(res && res.error ? res.error.message : 'Enter the invoice details.') + '</p>';
    var c = res.country, m = function (n) { return esc(money(c, n)); };
    if (!res.late) {
      return head + '<p class="big">' + m(0) + '</p><p class="wait">Not late on that date. Interest starts on ' + esc(longDate(res.firstDay)) + ', the day after the due date.</p>';
    }
    var rateCell = res.periods.map(function (p) {
      var basis = c === 'uk' ? '8% + ' + rateText(p.base) + ' base rate on ' + longDate(p.referenceDate) : 'ECB ' + rateText(p.ecb) + ' + 8 points, ' + (res.periods.length > 1 ? shortRange(p.from, p.to) : 'half-year from ' + longDate(p.periodStart));
      return esc(rateText(p.rate)) + ' a year<small>' + esc(basis) + '</small>';
    }).join('');
    var out = head +
      '<p class="big">' + m(res.claim) + '</p>' +
      '<p class="big-sub">on top of the ' + m(res.amount) + ' invoice, ' + res.days + ' day' + (res.days === 1 ? '' : 's') + ' late</p>' +
      '<dl class="rows">' +
      '<dt>Days late</dt><dd>' + res.days + '<small>' + esc(shortRange(res.firstDay, res.until)) + '</small></dd>' +
      '<dt>Rate</dt><dd>' + rateCell + '</dd>' +
      '<dt>Daily interest</dt><dd>' + m(round2(res.daily)) + '</dd>' +
      '<dt>Interest</dt><dd>' + m(res.interest) + '</dd>' +
      '<dt>' + (c === 'uk' ? 'Fixed compensation' : 'Compensation') + '</dt><dd>' + m(res.compensation) + '<small>' + esc(compBand(c, res.amount)) + '</small></dd>' +
      '<dt class="tot">Total now due</dt><dd class="tot">' + m(res.totalDue) + '</dd>' +
      '</dl>';
    return out;
  }
  // The working, and any caveat about the rate, shown under the button.
  function workingHTML(res) {
    if (!res || res.error || !res.late) return '';
    var c = res.country, m = function (n) { return esc(money(c, n)); }, sym = COUNTRIES[c].symbol;
    var work = res.periods.map(function (p) {
      if (res.periods.length > 1) return esc(shortRange(p.from, p.to)) + ': ' + m(res.amount) + ' × ' + esc(rateText(p.rate)) + ' × ' + p.days + ' ÷ 365 = ' + m(p.interest);
      return m(res.amount) + ' × ' + esc(rateText(p.rate)) + ' ÷ 365 = ' + esc(sym + p.daily.toFixed(4)) + ' a day<br>' + esc(sym + p.daily.toFixed(4)) + ' × ' + p.days + ' days = ' + m(p.interest);
    }).join('<br>');
    if (res.periods.length > 1) work += '<br>Interest = ' + res.periods.map(function (p) { return m(p.interest); }).join(' + ') + ' = ' + m(res.interest);
    var out = '<div class="work"><b>Working</b><br>' + work + '</div>';
    if (res.provisional) out += '<p class="flag">A rate used here is not published yet: it depends on the ' + (c === 'uk' ? 'Bank of England base rate' : 'ECB rate') + ' on a date after ' + esc(longDate(CHECKED)) + ', when this page was last checked. The figure uses the latest known rate; check it again before you send the claim.</p>';
    if (res.splitAlternative) out += '<p class="alt">Applying each half-year’s own rate instead gives ' + m(res.splitAlternative.interest) + ' of interest. Switch the method below the form to use that figure.</p>';
    return out;
  }

  // Rate tables for the page.
  function ukTable(fromYear, toYear) {
    var rows = [];
    for (var y = toYear; y >= fromYear; y--) {
      ['-07-01', '-01-01'].forEach(function (md) {
        var first = y + md;
        var r = ukRate(first);
        if (!r || r.provisional) return;
        rows.push({ from: first, to: md === '-01-01' ? y + '-06-30' : y + '-12-31', referenceDate: r.referenceDate, base: r.base, rate: r.rate });
      });
    }
    return rows;
  }
  function ieTable(fromYear, toYear) {
    var rows = [];
    for (var y = toYear; y >= fromYear; y--) {
      ['-07-01', '-01-01'].forEach(function (md) {
        var day = y + md;
        var r = ieRate(day);
        if (!r || r.provisional) return;
        rows.push({ from: day === '2013-01-01' ? '2013-03-16' : day, to: r.periodEnd, ecb: r.ecb, rate: r.rate });
      });
    }
    return rows.filter(function (r) { return r.from >= '2013-03-16'; });
  }

  return {
    CHECKED: CHECKED, BOE: BOE, ECB: ECB, COUNTRIES: COUNTRIES, EARLIEST: EARLIEST,
    isDate: isDate, addDays: addDays, diffDays: diffDays, longDate: longDate, shortRange: shortRange, round2: round2,
    ukReferenceDate: ukReferenceDate, ukRate: ukRate, iePeriod: iePeriod, ieRate: ieRate,
    compensation: compensation, defaultDueDate: defaultDueDate, money: money, rateText: rateText,
    calculate: calculate, reminder: reminder, invoiceLines: invoiceLines, invoiceNotes: invoiceNotes,
    resultHTML: resultHTML, workingHTML: workingHTML, ukTable: ukTable, ieTable: ieTable
  };
});
