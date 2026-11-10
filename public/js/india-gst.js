/* India GST tax invoice: CGST + SGST or IGST per line, totals, round-off, amount in words and the checks Rule 46 of the
   CGST Rules, 2017 sets. Pure functions, no DOM. The India page uses it in the browser and the server uses it for the
   first paint, so both show the same figures. Node tests load it with require().

   CGST Rules, 2017 (CBIC compilation, read 10 Nov 2026):
     Rule 46  tax invoice particulars (a)-(s): supplier name, address, GSTIN; serial number of up to 16 characters
              (letters, numerals, hyphen, slash) unique for the financial year; date; recipient name, address, GSTIN;
              unregistered recipient at ₹50,000 or more: name, address, delivery address, state and its code;
              HSN or SAC; description; quantity and unit; total value; taxable value after discount; rate and amount of
              central, State/UT, integrated tax and cess; place of supply for inter-State supplies; delivery address if
              different; whether tax is payable on reverse charge; signature. Exports: the endorsement set out in the
              second proviso and, instead of clause (e), the recipient's name and address, the delivery address and the
              country of destination.
     Rule 49  bill of supply (no tax columns).
   Notification 78/2020-CT: HSN digits by turnover. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IndiaGst = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_LINES = 60;
  // GST state codes, the first two digits of a GSTIN. 26 is the merged Dadra and Nagar Haveli and Daman and Diu.
  var STATES = [
    ['01', 'Jammu and Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'], ['04', 'Chandigarh'], ['05', 'Uttarakhand'],
    ['06', 'Haryana'], ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'], ['10', 'Bihar'], ['11', 'Sikkim'],
    ['12', 'Arunachal Pradesh'], ['13', 'Nagaland'], ['14', 'Manipur'], ['15', 'Mizoram'], ['16', 'Tripura'], ['17', 'Meghalaya'],
    ['18', 'Assam'], ['19', 'West Bengal'], ['20', 'Jharkhand'], ['21', 'Odisha'], ['22', 'Chhattisgarh'], ['23', 'Madhya Pradesh'],
    ['24', 'Gujarat'], ['26', 'Dadra and Nagar Haveli and Daman and Diu'], ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'],
    ['31', 'Lakshadweep'], ['32', 'Kerala'], ['33', 'Tamil Nadu'], ['34', 'Puducherry'], ['35', 'Andaman and Nicobar Islands'],
    ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh']
  ];
  // Union territories without a legislature charge UTGST instead of SGST.
  var UTGST = { '04': 1, '26': 1, '31': 1, '35': 1, '38': 1 };
  var STATE_NAME = {};
  STATES.forEach(function (s) { STATE_NAME[s[0]] = s[1]; });

  var RATES = ['0', '5', '18', '40'];
  var TYPES = {
    tax: { title: 'TAX INVOICE', name: 'Tax invoice' },
    bill: { title: 'BILL OF SUPPLY', name: 'Bill of supply (no GST charged)' }
  };
  var SUPPLIES = {
    domestic: { name: 'Supply within India' },
    exportLut: { name: 'Export or SEZ supply under a bond or Letter of Undertaking (no IGST)' },
    exportIgst: { name: 'Export or SEZ supply on payment of IGST' }
  };
  var COPIES = {
    none: '',
    recipient: 'ORIGINAL FOR RECIPIENT',
    supplier: 'DUPLICATE FOR SUPPLIER',
    transporter: 'DUPLICATE FOR TRANSPORTER',
    triplicate: 'TRIPLICATE FOR SUPPLIER'
  };
  var ENDORSEMENT = {
    exportIgst: 'SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS ON PAYMENT OF INTEGRATED TAX',
    exportLut: 'SUPPLY MEANT FOR EXPORT/SUPPLY TO SEZ UNIT OR SEZ DEVELOPER FOR AUTHORISED OPERATIONS UNDER BOND OR LETTER OF UNDERTAKING WITHOUT PAYMENT OF INTEGRATED TAX'
  };

  function round2(x) { return Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 100) / 100; }
  function num(v) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(/[,\s]/g, ''));
    return isFinite(n) ? n : 0;
  }
  function str(v, max) { return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').slice(0, max) : ''; }
  function isDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var t = Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
    return new Date(t).toISOString().slice(0, 10) === s;
  }
  function longDate(s) {
    var M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return isDate(s) ? (+s.slice(8, 10)) + ' ' + M[+s.slice(5, 7) - 1] + ' ' + s.slice(0, 4) : '';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Indian digit grouping: 12,34,567.89
  function group(intPart) {
    if (intPart.length <= 3) return intPart;
    var last3 = intPart.slice(-3), rest = intPart.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
  function amount(n) {
    var parts = Math.abs(n).toFixed(2).split('.');
    return (n < 0 ? '-' : '') + group(parts[0]) + '.' + parts[1];
  }
  function money(n) { return (n < 0 ? '-' : '') + '₹' + amount(Math.abs(n)); }
  function qtyText(q) { return String(Math.round(q * 1000) / 1000); }
  function rateText(r) { return String(Math.round(r * 1000) / 1000).replace(/\.0+$/, ''); }

  var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function below1000(n) {
    var s = '';
    if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' Hundred'; n %= 100; if (n) s += ' '; }
    if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += ' ' + ONES[n % 10]; }
    else if (n > 0) s += ONES[n];
    return s;
  }
  function wordsInt(n) {
    if (n === 0) return 'Zero';
    var parts = [], crore = Math.floor(n / 10000000), lakh = Math.floor(n / 100000) % 100, thou = Math.floor(n / 1000) % 100, rest = n % 1000;
    if (crore) parts.push(wordsInt(crore) + ' Crore');
    if (lakh) parts.push(below1000(lakh) + ' Lakh');
    if (thou) parts.push(below1000(thou) + ' Thousand');
    if (rest) parts.push(below1000(rest));
    return parts.join(' ');
  }
  // 118000 -> "Indian Rupees One Lakh Eighteen Thousand Only"
  function rupeesInWords(n) {
    var paise = Math.round(Math.abs(n) * 100), r = Math.floor(paise / 100), p = paise % 100;
    var s = 'Indian Rupees ' + wordsInt(r);
    if (p) s += ' and ' + below1000(p) + ' Paise';
    return s + ' Only';
  }

  // GSTIN: 2-digit state code, 10-character PAN, entity number, the letter Z, a check character (GST Council flyer
  // "Registration under GST Law"). The check character is the base-36 checksum used on the GST portal.
  var B36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function gstinCheck(first14) {
    var sum = 0;
    for (var i = 0; i < 14; i++) {
      var v = B36.indexOf(first14.charAt(i));
      if (v < 0) return '';
      var p = v * (i % 2 === 0 ? 1 : 2);
      sum += Math.floor(p / 36) + (p % 36);
    }
    return B36.charAt((36 - (sum % 36)) % 36);
  }
  function normGstin(s) { return String(s == null ? '' : s).replace(/[^0-9A-Za-z]/g, '').toUpperCase().slice(0, 15); }
  function gstinFormat(s) { return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(s); }
  function gstinValid(s) {
    s = normGstin(s);
    return s.length === 15 && gstinFormat(s) && !!STATE_NAME[s.slice(0, 2)] && gstinCheck(s.slice(0, 14)) === s.charAt(14);
  }
  function stateOfGstin(s) { s = normGstin(s); return s.length >= 2 && STATE_NAME[s.slice(0, 2)] ? s.slice(0, 2) : ''; }
  // Rule 46(b): up to 16 characters, letters, numerals, hyphen and slash.
  function invoiceNumberValid(s) { return typeof s === 'string' && /^[A-Za-z0-9\/-]{1,16}$/.test(s); }

  function clean(d) {
    d = d || {};
    var type = TYPES[d.type] ? d.type : 'tax';
    var supply = SUPPLIES[d.supply] ? d.supply : 'domestic';
    var sCode = STATE_NAME[d.supplierState] ? d.supplierState : '';
    var pCode = STATE_NAME[d.placeOfSupply] ? d.placeOfSupply : '';
    return {
      type: type, supply: supply, copy: COPIES.hasOwnProperty(d.copy) ? d.copy : 'none', roundOff: !!d.roundOff,
      supplier: { name: str(d.supplierName, 120), address: str(d.supplierAddress, 300), gstin: normGstin(d.supplierGstin), state: sCode },
      customer: { name: str(d.customerName, 120), address: str(d.customerAddress, 300), gstin: normGstin(d.customerGstin) },
      placeOfSupply: pCode, country: str(d.country, 80), number: str(d.number, 40),
      issueDate: isDate(d.issueDate) ? d.issueDate : '', reverseCharge: !!d.reverseCharge && type === 'tax', notes: str(d.notes, 1500),
      lines: (Array.isArray(d.lines) ? d.lines : []).slice(0, MAX_LINES).map(function (l) {
        l = l || {};
        var r = num(l.gst);
        return { desc: str(l.desc, 300), hsn: str(l.hsn, 12).replace(/[^0-9A-Za-z]/g, ''), unit: str(l.unit, 12), qty: Math.max(0, num(l.qty)), price: Math.max(0, num(l.price)), disc: Math.max(0, num(l.disc)), rate: r >= 0 && r <= 100 ? r : 0 };
      })
    };
  }

  function compute(raw) {
    var d = clean(raw);
    var plain = d.type === 'bill';
    var export_ = d.supply !== 'domestic';
    // Within one State or UT: CGST + SGST (UTGST). Between States, and on exports paid with IGST: IGST.
    var intra = !plain && !export_ && !!d.supplier.state && d.supplier.state === d.placeOfSupply;
    var charge = !plain && !d.reverseCharge && d.supply !== 'exportLut';
    var kind = plain ? 'none' : export_ ? 'export' : intra ? 'intra' : 'inter';
    var stateTax = UTGST[d.supplier.state] ? 'UTGST' : 'SGST';
    var lines = d.lines.map(function (l) {
      var gross = round2(l.qty * l.price), disc = round2(Math.min(l.disc, gross)), taxable = round2(gross - disc);
      var out = { desc: l.desc, hsn: l.hsn, unit: l.unit, qty: l.qty, price: l.price, gross: gross, disc: disc, taxable: taxable, rate: plain ? 0 : l.rate, cgst: 0, sgst: 0, igst: 0 };
      if (charge && kind === 'intra') { out.cgst = round2(taxable * l.rate / 200); out.sgst = round2(taxable * l.rate / 200); }
      else if (charge && (kind === 'inter' || kind === 'export')) out.igst = round2(taxable * l.rate / 100);
      out.tax = round2(out.cgst + out.sgst + out.igst);
      out.total = round2(taxable + out.tax);
      return out;
    });
    var sum = function (k) { return round2(lines.reduce(function (s, l) { return s + l[k]; }, 0)); };
    var groups = {};
    lines.forEach(function (l) {
      var g = groups[l.rate] || (groups[l.rate] = { rate: l.rate, taxable: 0, cgst: 0, sgst: 0, igst: 0 });
      ['taxable', 'cgst', 'sgst', 'igst'].forEach(function (k) { g[k] = round2(g[k] + l[k]); });
    });
    var total = round2(sum('taxable') + sum('tax'));
    var roundOff = d.roundOff ? round2(Math.round(total) - total) : 0;
    var res = {
      data: d, kind: kind, stateTax: stateTax, lines: lines, subtotal: sum('gross'), discount: sum('disc'), taxable: sum('taxable'),
      cgst: sum('cgst'), sgst: sum('sgst'), igst: sum('igst'), tax: sum('tax'), total: total, roundOff: roundOff, grand: round2(total + roundOff),
      groups: Object.keys(groups).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return groups[k]; }),
      title: TYPES[d.type].title, copyLabel: COPIES[d.copy], endorsement: export_ ? ENDORSEMENT[d.supply] : '', warnings: []
    };
    var w = res.warnings;
    if (!plain) {
      if (!d.supplier.gstin) w.push('Add your GSTIN: Rule 46 requires the supplier\'s name, address and GSTIN on a tax invoice. If you are not registered for GST you cannot charge it: use a bill of supply.');
      else if (!gstinValid(d.supplier.gstin)) w.push('Your GSTIN does not pass the format check (15 characters: state code, PAN, entity number, Z, check character). Re-read it from your registration certificate.');
      if (d.supplier.gstin && gstinValid(d.supplier.gstin) && d.supplier.state && stateOfGstin(d.supplier.gstin) !== d.supplier.state) w.push('The first two digits of your GSTIN (' + stateOfGstin(d.supplier.gstin) + ') are the state code of ' + STATE_NAME[stateOfGstin(d.supplier.gstin)] + ', not ' + STATE_NAME[d.supplier.state] + '. Check which State you are registered in.');
    }
    if (d.customer.gstin && !gstinValid(d.customer.gstin)) w.push('The customer\'s GSTIN does not pass the format check. Leave it empty if the customer is not registered.');
    if (!d.supplier.state) w.push('Choose your State: it decides between CGST + SGST and IGST.');
    if (!export_ && !d.placeOfSupply && !plain) w.push('Choose the place of supply. For services it is usually the State of a registered customer; for goods, the State they are delivered in.');
    if (export_ && !d.country) w.push('Add the country of destination: Rule 46 asks for it on export invoices.');
    if (!d.number) w.push('Add an invoice number. Rule 46 asks for a consecutive serial number, unique for the financial year.');
    else if (!invoiceNumberValid(d.number)) w.push('The invoice number may have at most 16 characters: letters, numerals, hyphen and slash only (Rule 46(b)).');
    if (!d.issueDate) w.push('Add the invoice date.');
    if (!plain && !d.customer.gstin && res.taxable >= 50000 && !export_ && !d.customer.address) w.push('The customer is not registered and the taxable value is ₹50,000 or more: Rule 46(e) asks for the customer\'s name, address, delivery address and State with its code.');
    var missingHsn = lines.map(function (l, i) { return !l.hsn && (l.taxable > 0 || l.desc) ? i + 1 : 0; }).filter(Boolean);
    if (missingHsn.length) w.push('Add an HSN or SAC code to line ' + missingHsn.join(', ') + '. Rule 46 asks for it; a supplier with turnover up to ₹5 crore may leave it off invoices to unregistered customers (Notification 78/2020-CT).');
    if (!lines.some(function (l) { return l.taxable > 0; })) w.push('Add at least one line with a quantity and a price.');
    if (d.reverseCharge && !plain) w.push('Reverse charge is set: no GST is added, and the invoice says the recipient pays it.');
    return res;
  }

  // The invoice as HTML, for the preview and for printing. opts.footer adds a small line at the bottom.
  function invoiceHTML(res, opts) {
    opts = opts || {};
    var d = res.data, plain = d.type === 'bill', kind = res.kind, export_ = d.supply !== 'domestic';
    var m = function (n) { return esc(money(n)); };
    var a = function (n) { return esc(amount(n)); };
    var blank = '<span class="ut-blank" aria-hidden="true"></span>';
    var sName = d.supplier.state ? STATE_NAME[d.supplier.state] + ' (' + d.supplier.state + ')' : '';
    var party = function (who, label, state) {
      return '<div class="ut-party"><div class="ut-k">' + label + '</div><div class="ut-name">' + (esc(who.name) || blank) + '</div>' +
        (who.address ? '<div class="ut-addr">' + esc(who.address) + '</div>' : '') +
        (state ? '<div class="ut-addr">' + esc(state) + '</div>' : '') +
        (who.gstin ? '<div class="ut-trn">GSTIN ' + esc(who.gstin) + '</div>' : (label === 'Supplier' && !plain ? '<div class="ut-trn">GSTIN <span class="ut-miss">missing</span></div>' : '')) + '</div>';
    };
    var pos = export_ ? (d.country ? 'Outside India: ' + d.country : '') : (d.placeOfSupply ? STATE_NAME[d.placeOfSupply] + ' (' + d.placeOfSupply + ')' : '');
    var meta = [['Invoice number', d.number], ['Invoice date', longDate(d.issueDate)]];
    if (!plain) meta.push(['Place of supply', pos], ['Tax payable on reverse charge', d.reverseCharge ? 'Yes' : 'No']);
    var st = res.stateTax;
    var head = '<tr><th>Description</th><th>HSN/SAC</th><th class="num">Qty</th><th class="num">Rate (₹)</th>' + (res.discount > 0 ? '<th class="num">Discount</th>' : '') + '<th class="num">Taxable value</th>';
    if (kind === 'intra') head += '<th class="num">CGST</th><th class="num">' + st + '</th>';
    else if (kind === 'inter' || kind === 'export') head += '<th class="num">IGST</th>';
    head += '</tr>';
    var cols = 5 + (res.discount > 0 ? 1 : 0) + (kind === 'intra' ? 2 : kind === 'inter' || kind === 'export' ? 1 : 0);
    var rows = res.lines.filter(function (l) { return l.desc || l.taxable > 0; }).map(function (l) {
      var half = rateText(l.rate / 2);
      var r = '<tr><td class="ut-d">' + (esc(l.desc) || '&nbsp;') + '</td><td>' + esc(l.hsn) + '</td><td class="num">' + esc(qtyText(l.qty)) + (l.unit ? ' ' + esc(l.unit) : '') + '</td><td class="num">' + a(l.price) + '</td>' + (res.discount > 0 ? '<td class="num">' + a(l.disc) + '</td>' : '') + '<td class="num">' + a(l.taxable) + '</td>';
      if (kind === 'intra') r += '<td class="num">' + a(l.cgst) + '<small>@ ' + esc(half) + '%</small></td><td class="num">' + a(l.sgst) + '<small>@ ' + esc(half) + '%</small></td>';
      else if (kind === 'inter' || kind === 'export') r += '<td class="num">' + a(l.igst) + '<small>@ ' + esc(rateText(d.supply === 'exportLut' ? 0 : l.rate)) + '%</small></td>';
      return r + '</tr>';
    }).join('');
    if (!rows) rows = '<tr><td colspan="' + cols + '" class="ut-none">No lines yet.</td></tr>';
    var tot = '<div class="ut-row"><span>Total taxable value</span><span>' + m(res.taxable) + '</span></div>';
    if (!plain) {
      if (kind === 'intra') tot += '<div class="ut-row"><span>CGST</span><span>' + m(res.cgst) + '</span></div><div class="ut-row"><span>' + st + '</span><span>' + m(res.sgst) + '</span></div>';
      else tot += '<div class="ut-row"><span>IGST</span><span>' + m(res.igst) + '</span></div>';
    }
    if (d.roundOff) tot += '<div class="ut-row"><span>Round off</span><span>' + (res.roundOff < 0 ? '-' : '') + m(Math.abs(res.roundOff)) + '</span></div>';
    tot += '<div class="ut-row ut-grand"><span>' + (plain ? 'Total' : 'Total invoice value') + '</span><span>' + m(res.grand) + '</span></div>';
    var summary = '';
    if (!plain && res.groups.length > 1 && kind !== 'none') {
      summary = '<table class="ut-lines ut-sum"><thead><tr><th class="num">GST rate</th><th class="num">Taxable value</th>' + (kind === 'intra' ? '<th class="num">CGST</th><th class="num">' + st + '</th>' : '<th class="num">IGST</th>') + '</tr></thead><tbody>' +
        res.groups.map(function (g) {
          return '<tr><td class="num">' + esc(rateText(g.rate)) + '%</td><td class="num">' + a(g.taxable) + '</td>' + (kind === 'intra' ? '<td class="num">' + a(g.cgst) + '</td><td class="num">' + a(g.sgst) + '</td>' : '<td class="num">' + a(g.igst) + '</td>') + '</tr>';
        }).join('') + '</tbody></table>';
    }
    var notes = [];
    if (res.endorsement) notes.push(res.endorsement);
    if (d.reverseCharge) notes.push('Tax is payable on reverse charge basis: Yes. The recipient pays the GST on this supply.');
    var out = '<div class="ut-top"><div><div class="ut-title">' + esc(res.title) + '</div>' + (res.copyLabel ? '<div class="ut-sub">' + esc(res.copyLabel) + '</div>' : '') + '</div>' +
      '<dl class="ut-meta">' + meta.map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + (esc(x[1]) || blank) + '</dd></div>'; }).join('') + '</dl></div>' +
      '<div class="ut-parties">' + party(d.supplier, 'Supplier', sName) + party(d.customer, export_ ? 'Customer (recipient)' : 'Bill to', export_ ? '' : (d.placeOfSupply ? STATE_NAME[d.placeOfSupply] + ' (' + d.placeOfSupply + ')' : '')) + '</div>' +
      '<div class="ut-wrap"><table class="ut-lines"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="ut-totals">' + tot + '</div>' + summary +
      '<div class="ut-notes"><p><strong>Amount in words:</strong> ' + esc(rupeesInWords(res.grand)) + '</p>' + notes.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('') + '</div>' +
      (d.notes ? '<div class="ut-pay"><div class="ut-k">Payment details and notes</div><p>' + esc(d.notes) + '</p></div>' : '') +
      '<div class="ut-sign"><span>Signature of the supplier or authorised representative</span></div>';
    if (opts.footer) out += '<p class="ut-foot">' + esc(opts.footer) + '</p>';
    return out;
  }

  return {
    MAX_LINES: MAX_LINES, STATES: STATES, STATE_NAME: STATE_NAME, RATES: RATES, TYPES: TYPES, SUPPLIES: SUPPLIES, COPIES: COPIES, ENDORSEMENT: ENDORSEMENT,
    round2: round2, amount: amount, money: money, group: group, wordsInt: wordsInt, rupeesInWords: rupeesInWords, longDate: longDate,
    gstinCheck: gstinCheck, gstinValid: gstinValid, normGstin: normGstin, stateOfGstin: stateOfGstin, invoiceNumberValid: invoiceNumberValid,
    compute: compute, invoiceHTML: invoiceHTML
  };
});
