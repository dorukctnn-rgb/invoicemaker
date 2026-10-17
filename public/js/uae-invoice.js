/* UAE tax invoice page: the form, the live invoice, print to PDF. Runs in the browser only; the details
   are kept in this browser's localStorage. The arithmetic and the checks live in uae-vat.js. */
(function () {
  'use strict';
  var U = window.UaeVat, CFG = window.UAE_CONFIG || {};
  var form = document.getElementById('utForm');
  if (!U || !form) return;
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'gim_uae_v1';
  var linesEl = $('utLines');
  var FIELDS = ['utType', 'utSupplierName', 'utSupplierAddress', 'utSupplierTrn', 'utCustomerName', 'utCustomerAddress', 'utCustomerTrn', 'utNumber', 'utIssue', 'utSupply', 'utCurrency', 'utFx', 'utDiscount', 'utNotes'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function today() { var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  function lineHTML(l) {
    var opts = Object.keys(U.TREATMENTS).map(function (k) { return '<option value="' + k + '"' + (k === l.vat ? ' selected' : '') + '>' + esc(U.TREATMENTS[k].name) + '</option>'; }).join('');
    return '<div class="ut-line">' +
      '<label class="ut-desc"><span>Description</span><input type="text" name="desc" maxlength="300" value="' + esc(l.desc) + '"></label>' +
      '<label><span>Qty</span><input type="number" name="qty" min="0" step="any" inputmode="decimal" value="' + esc(l.qty) + '"></label>' +
      '<label><span>Unit price</span><input type="number" name="price" min="0" step="any" inputmode="decimal" value="' + esc(l.price) + '"></label>' +
      '<label class="ut-vat"><span>VAT</span><select name="vat">' + opts + '</select></label>' +
      '<button type="button" class="ut-del" aria-label="Remove line">&times;</button></div>';
  }
  function readLines() {
    return Array.prototype.map.call(linesEl.querySelectorAll('.ut-line'), function (row) {
      var v = function (n) { var el = row.querySelector('[name="' + n + '"]'); return el ? el.value : ''; };
      return { desc: v('desc'), qty: v('qty'), price: v('price'), vat: v('vat') };
    });
  }
  function drawLines(list) { linesEl.innerHTML = list.map(lineHTML).join(''); }
  function collect() {
    return {
      type: $('utType').value, supplierName: $('utSupplierName').value, supplierAddress: $('utSupplierAddress').value, supplierTrn: $('utSupplierTrn').value,
      customerName: $('utCustomerName').value, customerAddress: $('utCustomerAddress').value, customerTrn: $('utCustomerTrn').value,
      number: $('utNumber').value, issueDate: $('utIssue').value, supplyDate: $('utSupply').value, currency: $('utCurrency').value,
      fxRate: $('utFx').value, discount: $('utDiscount').value, reverseCharge: $('utRc').checked, notes: $('utNotes').value, lines: readLines()
    };
  }

  function update() {
    var d = collect();
    var plain = d.type === 'plain';
    $('utFxWrap').hidden = d.currency === 'AED';
    $('utRcWrap').hidden = plain;
    form.classList.toggle('is-plain', plain);
    var res = U.compute(d);
    $('utSheet').innerHTML = U.invoiceHTML(res, { footer: CFG.footer || '' });
    var w = $('utWarn');
    w.innerHTML = res.warnings.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    w.hidden = !res.warnings.length;
    $('utTotal').textContent = U.money(res.total, res.data.currency);
    $('addLine').disabled = d.lines.length >= U.MAX_LINES;
    var state = { lines: d.lines, rc: d.reverseCharge };
    FIELDS.forEach(function (id) { state[id] = $(id).value; });
    store(state);
  }

  linesEl.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.ut-del') : null;
    if (!b) return;
    var list = readLines();
    list.splice(Array.prototype.indexOf.call(linesEl.children, b.closest('.ut-line')), 1);
    if (!list.length) list.push({ desc: '', qty: 1, price: '', vat: 'standard' });
    drawLines(list);
    update();
  });
  $('addLine').addEventListener('click', function () {
    var list = readLines();
    if (list.length >= U.MAX_LINES) return;
    list.push({ desc: '', qty: 1, price: '', vat: list.length ? list[list.length - 1].vat : 'standard' });
    drawLines(list);
    update();
    var rows = linesEl.querySelectorAll('.ut-line');
    rows[rows.length - 1].querySelector('input').focus();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $('utBlank').addEventListener('click', function () {
    ['utSupplierName', 'utSupplierAddress', 'utSupplierTrn', 'utCustomerName', 'utCustomerAddress', 'utCustomerTrn', 'utNumber', 'utSupply', 'utFx', 'utDiscount', 'utNotes'].forEach(function (id) { $(id).value = ''; });
    $('utRc').checked = false;
    $('utIssue').value = today();
    drawLines([{ desc: '', qty: 1, price: '', vat: 'standard' }]);
    try {
      var n = localStorage.getItem('gim_fromName'), a = localStorage.getItem('gim_fromAddress');
      if (n) $('utSupplierName').value = n.slice(0, 120);
      if (a) $('utSupplierAddress').value = a.slice(0, 300);
    } catch (e) {}
    update();
    $('utSupplierName').focus();
  });
  $('utPrint').addEventListener('click', function () {
    update();
    if (window.gtag) try { window.gtag('event', 'invoice_download', { page: 'uae' }); } catch (err) {}
    window.print();
  });

  var saved = load();
  if (saved && Array.isArray(saved.lines) && saved.lines.length) {
    drawLines(saved.lines.slice(0, U.MAX_LINES));
    FIELDS.forEach(function (id) { if (typeof saved[id] === 'string' && $(id)) $(id).value = saved[id].slice(0, 1500); });
    $('utRc').checked = !!saved.rc;
  }
  update();
})();
