/* UAE tax invoice: VAT per line, totals, amounts in AED and the checks the Executive Regulation sets.
   Pure functions, no DOM. The UAE page uses it in the browser and the server uses it for the first paint,
   so both show the same figures. Node tests load it with require().

   Federal Decree-Law No. 8 of 2017 on VAT, as amended (FTA consolidated text published 28 Nov 2025):
     Art. 3 standard rate 5%; Art. 65 tax invoices (Clause 4: tax shown or invoiced must be paid to the FTA);
     Art. 67 issue within 14 days of the date of supply; Art. 69 foreign currency converted to AED at the
     Central Bank rate on the date of supply; Art. 48 reverse charge.
   Cabinet Decision No. 52 of 2017 (Executive Regulation), as amended up to Cabinet Decision No. 149 of 2026
   (FTA consolidated text issued 1 Sep 2026): Art. 59(1) tax invoice particulars, 59(2) simplified tax
   invoice, 59(5) when a simplified one is allowed (recipient not registered, or registered and consideration
   up to AED 10,000; never under the reverse charge), 59(13) timing, Art. 61 rounding to the nearest fils. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.UaeVat = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STANDARD_RATE = 5;
  var SIMPLIFIED_LIMIT_AED = 10000;
  var MAX_LINES = 60;
  var TREATMENTS = {
    standard: { label: '5%', name: 'Standard rated, 5%', rate: 5 },
    zero: { label: '0%', name: 'Zero rated, 0%', rate: 0 },
    exempt: { label: 'Exempt', name: 'Exempt', rate: 0 }
  };
  var TYPES = {
    tax: { title: 'TAX INVOICE', name: 'Tax invoice' },
    simplified: { title: 'TAX INVOICE', name: 'Simplified tax invoice' },
    plain: { title: 'INVOICE', name: 'Invoice, supplier not registered for VAT' }
  };
  var CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'OMR', 'QAR', 'KWD', 'BHD', 'INR', 'PKR', 'CAD', 'AUD'];

  // Article 61: a fraction of a fils may be rounded to the nearest fils on a mathematical rounding.
  function round2(x) { return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(/[,\s]/g, ''));
    return isFinite(n) ? n : 0;
  }
  function str(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').slice(0, max) : ''; }
  function digits(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }
  function trnValid(s) { return /^\d{15}$/.test(digits(s)); }
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return new Date(t).toISOString().slice(0, 10) === s;
  }
  function money(n, cur) {
    var parts = Math.abs(n).toFixed(2).split('.');
    return (n < 0 ? '-' : '') + (cur || 'AED') + ' ' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
  }
  function qtyText(q) { return String(Math.round(q * 1000) / 1000); }
  function amount(n) {
    var parts = Math.abs(n).toFixed(2).split('.');
    return (n < 0 ? '-' : '') + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function longDate(s) {
    var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return isDate(s) ? (+s.slice(8, 10)) + ' ' + M[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4) : '';
  }

  function clean(d) {
    d = d || {};
    var type = TYPES[d.type] ? d.type : 'tax';
    var currency = CURRENCIES.indexOf(d.currency) >= 0 ? d.currency : 'AED';
    var fx = currency === 'AED' ? 1 : num(d.fxRate);
    return {
      type: type, currency: currency, fx: fx > 0 && fx < 100000 ? fx : null,
      supplier: { name: str(d.supplierName, 120), address: str(d.supplierAddress, 300), trn: digits(d.supplierTrn).slice(0, 15) },
      customer: { name: str(d.customerName, 120), address: str(d.customerAddress, 300), trn: digits(d.customerTrn).slice(0, 15) },
      number: str(d.number, 40), issueDate: isDate(d.issueDate) ? d.issueDate : '', supplyDate: isDate(d.supplyDate) ? d.supplyDate : '',
      discount: Math.max(0, num(d.discount)), reverseCharge: !!d.reverseCharge && type !== 'plain', notes: str(d.notes, 1500),
      lines: (Array.isArray(d.lines) ? d.lines : []).slice(0, MAX_LINES).map(function (l) {
        l = l || {};
        return { desc: str(l.desc, 300), qty: Math.max(0, num(l.qty)), price: Math.max(0, num(l.price)), vat: type === 'plain' ? 'none' : (TREATMENTS[l.vat] ? l.vat : 'standard') };
      })
    };
  }

  function compute(raw) {
    var d = clean(raw);
    var lines = d.lines.map(function (l) { return { desc: l.desc, qty: l.qty, price: l.price, vat: l.vat, net: round2(l.qty * l.price) }; });
    var subtotal = round2(lines.reduce(function (s, l) { return s + l.net; }, 0));
    var discount = round2(Math.min(d.discount, subtotal));
    // An invoice discount is shared across the lines in proportion to their value; the last cent goes to the largest line.
    var shared = 0, biggest = -1;
    lines.forEach(function (l, i) {
      l.disc = subtotal > 0 ? round2(discount * l.net / subtotal) : 0;
      shared = round2(shared + l.disc);
      if (biggest < 0 || l.net > lines[biggest].net) biggest = i;
    });
    if (biggest >= 0 && shared !== discount) lines[biggest].disc = round2(lines[biggest].disc + discount - shared);
    var groups = {};
    lines.forEach(function (l) {
      l.taxable = round2(l.net - l.disc);
      var t = TREATMENTS[l.vat];
      l.rateLabel = t ? t.label : '';
      // Under the reverse charge the recipient accounts for the VAT, so none is charged on the invoice.
      l.tax = t && t.rate && !d.reverseCharge ? round2(l.taxable * t.rate / 100) : 0;
      l.total = round2(l.taxable + l.tax);
      if (d.fx) { l.totalAed = round2(l.total * d.fx); l.taxAed = round2(l.tax * d.fx); }
      if (t) {
        var g = groups[l.vat] || (groups[l.vat] = { key: l.vat, name: t.name, taxable: 0, tax: 0 });
        g.taxable = round2(g.taxable + l.taxable); g.tax = round2(g.tax + l.tax);
      }
    });
    var taxable = round2(subtotal - discount);
    var tax = round2(lines.reduce(function (s, l) { return s + l.tax; }, 0));
    var total = round2(taxable + tax);
    var res = {
      data: d, lines: lines, subtotal: subtotal, discount: discount, taxable: taxable, tax: tax, total: total,
      groups: ['standard', 'zero', 'exempt'].filter(function (k) { return groups[k]; }).map(function (k) { return groups[k]; }),
      aed: d.fx ? { taxable: round2(taxable * d.fx), tax: round2(tax * d.fx), total: round2(total * d.fx) } : null,
      title: TYPES[d.type].title, typeName: TYPES[d.type].name, warnings: []
    };
    var w = res.warnings;
    var totalAed = res.aed ? res.aed.total : null;
    if (d.type !== 'plain') {
      if (!trnValid(d.supplier.trn)) w.push('Add your 15-digit TRN: Article 59 requires the supplier\'s Tax Registration Number on every tax invoice.');
      if (d.customer.trn && !trnValid(d.customer.trn)) w.push('The customer\'s TRN should have 15 digits.');
    }
    if (d.type === 'simplified') {
      if (d.reverseCharge) w.push('A simplified tax invoice is not allowed when the reverse charge applies (Article 59(5)): use a full tax invoice.');
      else if (d.customer.trn && totalAed !== null && totalAed > SIMPLIFIED_LIMIT_AED) w.push('For a VAT-registered customer a simplified tax invoice is allowed only up to AED 10,000 (Article 59(5)): use a full tax invoice.');
    }
    if (d.type === 'tax' && !d.customer.name) w.push('Add the customer\'s name and address; add the customer\'s TRN if it is registered for VAT.');
    if (d.currency !== 'AED' && !d.fx) w.push('Enter the exchange rate: the VAT and the amounts must also be shown in AED (Article 69 and Article 59(1)(k)).');
    if (!lines.some(function (l) { return l.net > 0; })) w.push('Add at least one line with a quantity and a price.');
    if (d.supplyDate && d.issueDate && d.issueDate < d.supplyDate) w.push('The issue date is before the date of supply. Check both dates.');
    return res;
  }

  // The invoice as HTML, for the preview and for printing. opts.footer adds a small line at the bottom.
  function invoiceHTML(res, opts) {
    opts = opts || {};
    var d = res.data, cur = d.currency, plain = d.type === 'plain', foreign = cur !== 'AED';
    var m = function (n) { return esc(money(n, cur)); };
    var blank = '<span class="ut-blank" aria-hidden="true"></span>';
    var party = function (who, label, showTrn) {
      return '<div class="ut-party"><div class="ut-k">' + label + '</div><div class="ut-name">' + (esc(who.name) || blank) + '</div>' +
        (who.address ? '<div class="ut-addr">' + esc(who.address) + '</div>' : '') +
        (showTrn ? '<div class="ut-trn">TRN ' + (who.trn ? esc(who.trn) : '<span class="ut-miss">missing</span>') + '</div>' : (who.trn ? '<div class="ut-trn">TRN ' + esc(who.trn) + '</div>' : '')) + '</div>';
    };
    var meta = [['Invoice number', d.number], ['Date of issue', longDate(d.issueDate)]];
    if (d.supplyDate && d.supplyDate !== d.issueDate) meta.push(['Date of supply', longDate(d.supplyDate)]);
    // Line amounts are plain numbers; the currency is in the column headings.
    var a = function (n) { return esc(amount(n)); };
    var c = ' (' + esc(cur) + ')';
    var head = '<tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price' + c + '</th>' + (plain ? '' : '<th class="num">Taxable' + c + '</th><th class="num">VAT rate</th><th class="num">VAT' + c + '</th>') + '<th class="num">Total' + c + '</th>' + (foreign && d.fx ? '<th class="num">Total (AED)</th>' : '') + '</tr>';
    var rows = res.lines.filter(function (l) { return l.desc || l.net > 0; }).map(function (l) {
      return '<tr><td class="ut-d">' + (esc(l.desc) || '&nbsp;') + '</td><td class="num">' + esc(qtyText(l.qty)) + '</td><td class="num">' + a(l.price) + '</td>' +
        (plain ? '' : '<td class="num">' + a(l.taxable) + '</td><td class="num">' + esc(l.rateLabel) + '</td><td class="num">' + a(l.tax) + '</td>') +
        '<td class="num">' + a(l.total) + '</td>' + (foreign && d.fx ? '<td class="num">' + a(l.totalAed) + '</td>' : '') + '</tr>';
    }).join('');
    var cols = (plain ? 4 : 7) + (foreign && d.fx ? 1 : 0);
    if (!rows) rows = '<tr><td colspan="' + cols + '" class="ut-none">No lines yet.</td></tr>';
    var tot = '<div class="ut-row"><span>Subtotal</span><span>' + m(res.subtotal) + '</span></div>';
    if (res.discount > 0) tot += '<div class="ut-row"><span>Discount</span><span>-' + m(res.discount) + '</span></div><div class="ut-row"><span>Total after discount</span><span>' + m(res.taxable) + '</span></div>';
    if (!plain) {
      res.groups.forEach(function (g) { if (g.key === 'standard') tot += '<div class="ut-row"><span>VAT at 5% on ' + m(g.taxable) + '</span><span>' + m(g.tax) + '</span></div>'; });
      if (!res.groups.some(function (g) { return g.key === 'standard'; })) tot += '<div class="ut-row"><span>VAT</span><span>' + m(0) + '</span></div>';
    }
    tot += '<div class="ut-row ut-grand"><span>' + (plain ? 'Total due' : 'Total including VAT') + '</span><span>' + m(res.total) + '</span></div>';
    if (foreign && res.aed) {
      tot += '<div class="ut-row ut-aed"><span>VAT in AED</span><span>' + esc(money(res.aed.tax, 'AED')) + '</span></div><div class="ut-row ut-aed"><span>Total in AED</span><span>' + esc(money(res.aed.total, 'AED')) + '</span></div>';
    }
    var notes = [];
    if (foreign && d.fx) notes.push('Exchange rate applied: 1 ' + cur + ' = ' + d.fx + ' AED (Central Bank of the UAE rate on the date of supply).');
    if (res.groups.some(function (g) { return g.key === 'exempt'; })) notes.push('Lines marked Exempt are exempt supplies: no VAT is charged on them.');
    if (res.groups.some(function (g) { return g.key === 'zero'; })) notes.push('Lines at 0% are zero-rated supplies.');
    if (d.reverseCharge) notes.push('Reverse charge: the recipient is required to account for the VAT on this supply under Article 48 of Federal Decree-Law No. 8 of 2017 on Value Added Tax.');
    var out = '<div class="ut-top"><div><div class="ut-title">' + esc(res.title) + '</div>' + (d.type === 'simplified' ? '<div class="ut-sub">Simplified tax invoice</div>' : '') + '</div>' +
      '<dl class="ut-meta">' + meta.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + (esc(x[1]) || blank) + '</dd></div>'; }).join('') + '</dl></div>' +
      '<div class="ut-parties">' + party(d.supplier, 'Supplier', !plain) + party(d.customer, 'Customer', false) + '</div>' +
      '<div class="ut-wrap"><table class="ut-lines"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="ut-totals">' + tot + '</div>' +
      (notes.length ? '<div class="ut-notes">' + notes.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('') + '</div>' : '') +
      (d.notes ? '<div class="ut-pay"><div class="ut-k">Payment details and notes</div><p>' + esc(d.notes) + '</p></div>' : '');
    if (opts.footer) out += '<p class="ut-foot">' + esc(opts.footer) + '</p>';
    return out;
  }

  return {
    STANDARD_RATE: STANDARD_RATE, SIMPLIFIED_LIMIT_AED: SIMPLIFIED_LIMIT_AED, MAX_LINES: MAX_LINES, TREATMENTS: TREATMENTS, TYPES: TYPES, CURRENCIES: CURRENCIES,
    round2: round2, trnValid: trnValid, money: money, longDate: longDate, compute: compute, invoiceHTML: invoiceHTML
  };
});
