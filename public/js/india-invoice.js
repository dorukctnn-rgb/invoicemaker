/* India GST invoice page: the form, the live invoice, print to PDF. Runs in the browser only; the details
   are kept in this browser's localStorage. The arithmetic and the checks live in india-gst.js. */
(function () {
  'use strict';
  var G = window.IndiaGst, CFG = window.INDIA_CONFIG || {};
  var form = document.getElementById('utForm');
  if (!G || !form) return;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'gim_india_v1';
  var linesEl = $('utLines');
  var FIELDS = ['inType', 'inCopy', 'inSupply', 'inSupplierName', 'inSupplierAddress', 'inSupplierGstin', 'inSupplierState', 'inCustomerName', 'inCustomerAddress', 'inCustomerGstin', 'inPlace', 'inCountry', 'inNumber', 'inIssue', 'inNotes'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function today() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  function lineHTML(l) {
    var rate = String(l.gst == null ? '18' : l.gst), preset = G.RATES.indexOf(rate) >= 0;
    var opts = G.RATES.map(function (r) { return '<option value="' + r + '"' + (r === rate ? ' selected' : '') + '>' + r + '%</option>'; }).join('') + '<option value="other"' + (preset ? '' : ' selected') + '>Other</option>';
    return '<div class="ut-line in-line">' +
      '<label class="ut-desc"><span>Description</span><input type="text" name="desc" maxlength="300" value="' + esc(l.desc) + '"></label>' +
      '<label class="in-hsn"><span>HSN / SAC</span><input type="text" name="hsn" maxlength="12" inputmode="numeric" value="' + esc(l.hsn) + '"></label>' +
      '<label class="in-qty"><span>Qty</span><input type="number" name="qty" min="0" step="any" inputmode="decimal" value="' + esc(l.qty) + '"></label>' +
      '<label class="in-price"><span>Rate (&#8377;)</span><input type="number" name="price" min="0" step="any" inputmode="decimal" value="' + esc(l.price) + '"></label>' +
      '<label class="in-gst"><span>GST rate</span><select name="gst">' + opts + '</select><input type="number" name="gstOther" min="0" max="100" step="any" inputmode="decimal" placeholder="Rate in %"' + (preset ? ' hidden' : '') + ' value="' + (preset ? '' : esc(rate)) + '"></label>' +
      '<label class="in-disc"><span>Discount on the line (&#8377;)</span><input type="number" name="disc" min="0" step="any" inputmode="decimal" value="' + esc(l.disc) + '"></label>' +
      '<button type="button" class="ut-del" aria-label="Remove line">&times;</button></div>';
  }
  function readLines() {
    return Array.prototype.map.call(linesEl.querySelectorAll('.ut-line'), function (row) {
      var v = function (n) { var el = row.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
      var g = v('gst');
      return { desc: v('desc'), hsn: v('hsn'), qty: v('qty'), price: v('price'), disc: v('disc'), gst: g === 'other' ? v('gstOther') : g };
    });
  }
  function drawLines(list) { linesEl.innerHTML = list.map(lineHTML).join(''); }
  function blankLine(prev) { return { desc: '', hsn: '', qty: 1, price: '', disc: '', gst: prev ? prev.gst : '18' }; }
  function collect() {
    return {
      type: $('inType').value, copy: $('inCopy').value, supply: $('inSupply').value,
      supplierName: $('inSupplierName').value, supplierAddress: $('inSupplierAddress').value, supplierGstin: $('inSupplierGstin').value, supplierState: $('inSupplierState').value,
      customerName: $('inCustomerName').value, customerAddress: $('inCustomerAddress').value, customerGstin: $('inCustomerGstin').value,
      placeOfSupply: $('inPlace').value, country: $('inCountry').value, number: $('inNumber').value, issueDate: $('inIssue').value,
      reverseCharge: $('inRc').checked, roundOff: $('inRound').checked, notes: $('inNotes').value, lines: readLines()
    };
  }

  function update() {
    var d = collect();
    var bill = d.type === 'bill', exp = d.supply !== 'domestic';
    $('inCountryWrap').hidden = !exp;
    $('inPlaceWrap').hidden = exp;
    $('inRcWrap').hidden = bill;
    form.classList.toggle('is-bill', bill);
    Array.prototype.forEach.call(linesEl.querySelectorAll('.ut-line'), function (row) {
      var sel = row.querySelector('[name="gst"]'), other = row.querySelector('[name="gstOther"]');
      if (sel && other) other.hidden = sel.value !== 'other';
    });
    var res = G.compute(d);
    $('utSheet').innerHTML = G.invoiceHTML(res, { footer: CFG.footer || '' });
    var w = $('utWarn');
    w.innerHTML = res.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    w.hidden = !res.warnings.length;
    $('utTotal').textContent = G.money(res.grand);
    $('addLine').disabled = d.lines.length >= G.MAX_LINES;
    var state = { lines: d.lines, rc: d.reverseCharge, round: d.roundOff };
    FIELDS.forEach(function (id) { state[id] = $(id).value; });
    store(state);
  }

  linesEl.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.ut-del') : null;
    if (!b) return;
    var list = readLines();
    list.splice(Array.prototype.indexOf.call(linesEl.children, b.closest('.ut-line')), 1);
    if (!list.length) list.push(blankLine());
    drawLines(list);
    update();
  });
  $('addLine').addEventListener('click', function () {
    var list = readLines();
    if (list.length >= G.MAX_LINES) return;
    list.push(blankLine(list[list.length - 1]));
    drawLines(list);
    update();
    var rows = linesEl.querySelectorAll('.ut-line');
    rows[rows.length - 1].querySelector('input').focus();
  });
  // A GSTIN starts with the State code: use it to fill the State (yours) or the place of supply (the customer's).
  $('inSupplierGstin').addEventListener('input', function () {
    var c = G.stateOfGstin(this.value);
    if (c && $('inSupplierState').value !== c) $('inSupplierState').value = c;
  });
  $('inCustomerGstin').addEventListener('input', function () {
    var c = G.stateOfGstin(this.value);
    if (c && $('inPlace').value !== c) $('inPlace').value = c;
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $('utBlank').addEventListener('click', function () {
    ['inSupplierName', 'inSupplierAddress', 'inSupplierGstin', 'inSupplierState', 'inCustomerName', 'inCustomerAddress', 'inCustomerGstin', 'inPlace', 'inCountry', 'inNumber', 'inNotes'].forEach(function (id) { $(id).value = ''; });
    $('inRc').checked = false;
    $('inRound').checked = false;
    $('inIssue').value = today();
    drawLines([blankLine()]);
    try {
      var n = localStorage.getItem('gim_fromName'), a = localStorage.getItem('gim_fromAddress');
      if (n) $('inSupplierName').value = n.slice(0, 120);
      if (a) $('inSupplierAddress').value = a.slice(0, 300);
    } catch (e) {}
    update();
    $('inSupplierName').focus();
  });
  $('utPrint').addEventListener('click', function () {
    update();
    if (window.gtag) try { window.gtag('event', 'invoice_download', { page: 'india' }); } catch (err) {}
    window.print();
  });

  var saved = load();
  if (saved && Array.isArray(saved.lines) && saved.lines.length) {
    drawLines(saved.lines.slice(0, G.MAX_LINES));
    FIELDS.forEach(function (id) { if (typeof saved[id] === 'string' && $(id)) $(id).value = saved[id].slice(0, 1500); });
    $('inRc').checked = !!saved.rc;
    $('inRound').checked = !!saved.round;
  }
  update();
})();
