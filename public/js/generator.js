/* Shared invoice generator: live preview, tax lines, presets, PDF download. */
(function () {
  'use strict';
  var C = window.GEN_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };
  if (!$('gen')) return;

  var SYM = { USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', INR: '₹', AED: 'AED ', SGD: 'S$', TRY: '₺', JPY: '¥', CHF: 'CHF ', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', NZD: 'NZ$', ZAR: 'R ', BRL: 'R$', MXN: 'MX$' };
  var L = {
    en: { title: 'INVOICE', billTo: 'Bill to', issue: 'Issue date', due: 'Due date', supply: 'Service date', desc: 'Description', qty: 'Qty', rate: 'Rate', amount: 'Amount', subtotal: 'Subtotal', total: 'Total due', notes: 'Notes', clientTaxId: 'Tax ID: ' },
    nl: { title: 'FACTUUR', billTo: 'Factuur aan', issue: 'Factuurdatum', due: 'Vervaldatum', supply: 'Leverdatum', desc: 'Omschrijving', qty: 'Aantal', rate: 'Prijs', amount: 'Bedrag', subtotal: 'Subtotaal', total: 'Totaal', notes: 'Opmerkingen', clientTaxId: 'Btw-id: ' },
    'nl-en': { title: 'FACTUUR / INVOICE', billTo: 'Factuur aan / Bill to', issue: 'Factuurdatum / Date', due: 'Vervaldatum / Due', supply: 'Leverdatum / Supply date', desc: 'Omschrijving / Description', qty: 'Aantal', rate: 'Prijs', amount: 'Bedrag', subtotal: 'Subtotaal / Subtotal', total: 'Totaal / Total', notes: 'Opmerkingen / Notes', clientTaxId: 'Btw-id / VAT ID: ' }
  };
  var color = '#2563eb';
  var logoData = '';
  var isPro = !!C.isPro;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function store(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lang() { return L[$('lang').value] ? $('lang').value : 'en'; }
  function cur() { return $('currency').value || 'USD'; }
  function money(n) {
    var lg = lang(), s = SYM[cur()] || cur() + ' ';
    var parts = Math.abs(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, lg === 'en' ? ',' : '.');
    var body = parts[0] + (lg === 'en' ? '.' : ',') + parts[1];
    return (n < 0 ? '-' : '') + s + (lg !== 'en' && s.slice(-1) !== ' ' ? ' ' : '') + body;
  }
  function rateText(r) { var s = String(Math.round(r * 1000) / 1000); return lang() === 'en' ? s : s.replace('.', ','); }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }

  // ---- line items ----
  function rowHTML(it) {
    return '<input type="text" aria-label="Description" placeholder="' + esc(it.placeholder || C.itemPlaceholder || 'Service or product') + '" value="' + esc(it.desc || '') + '">' +
      '<input type="number" aria-label="Quantity" min="0" step="any" value="' + esc(it.qty == null ? 1 : it.qty) + '">' +
      '<input type="number" aria-label="Rate" min="0" step="any" value="' + esc(it.rate == null ? 0 : it.rate) + '">' +
      '<div class="g-lt"></div><button type="button" class="g-del" title="Remove line" aria-label="Remove line">&times;</button>';
  }
  function addRow(it) {
    var d = document.createElement('div');
    d.className = 'g-ir';
    d.innerHTML = rowHTML(it || {});
    $('items').appendChild(d);
    return d;
  }
  function readItems() {
    var out = [];
    document.querySelectorAll('#items .g-ir').forEach(function (row) {
      var ins = row.querySelectorAll('input');
      var q = num(ins[1].value), r = num(ins[2].value);
      row.querySelector('.g-lt').textContent = money(q * r);
      out.push({ description: ins[0].value, qty: q, rate: r });
    });
    return out;
  }

  // ---- taxes ----
  function taxes() {
    var t = [{ label: $('tax1Label').value || 'Tax', rate: num($('tax1Rate').value) }];
    if (!$('tax2Row').hidden) t.push({ label: $('tax2Label').value || 'Tax 2', rate: num($('tax2Rate').value) });
    return t.filter(function (x) { return x.rate > 0; });
  }
  function setTaxes(list) {
    $('tax1Rate').value = list[0] ? list[0].rate : '';
    $('tax1Label').value = list[0] ? list[0].label : 'Tax';
    var two = !!list[1];
    $('tax2Row').hidden = !two;
    $('tax2Rate').value = two ? list[1].rate : '';
    $('tax2Label').value = two ? list[1].label : '';
    $('tax2Toggle').textContent = two ? 'Remove second tax line' : '+ Add a second tax line (e.g. PST or QST)';
  }

  function totals(items) {
    var sub = items.reduce(function (a, i) { return a + i.qty * i.rate; }, 0);
    var lines = taxes().map(function (t) { return { label: t.label, rate: t.rate, amount: Math.round(sub * t.rate) / 100 }; });
    var tot = sub + lines.reduce(function (a, t) { return a + t.amount; }, 0);
    return { sub: sub, lines: lines, tot: tot };
  }

  // ---- preview ----
  function preview(d) {
    var l = L[d.lang];
    var cell = 'padding:8px 6px;border-bottom:1px solid #f1f5f9;font-size:12px;';
    var rows = d.items.map(function (i) {
      return '<tr><td style="' + cell + 'padding-left:0">' + (esc(i.description) || '&nbsp;') + '</td><td style="' + cell + 'text-align:center">' + esc(i.qty) + '</td><td style="' + cell + 'text-align:right;white-space:nowrap">' + esc(money(i.rate)) + '</td><td style="' + cell + 'text-align:right;font-weight:600;white-space:nowrap;padding-right:0">' + esc(money(i.qty * i.rate)) + '</td></tr>';
    }).join('');
    var taxRows = d.t.lines.map(function (t) {
      return '<div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:12px;color:#64748b"><span>' + esc(t.label) + ' (' + rateText(t.rate) + '%)</span><span>' + esc(money(t.amount)) + '</span></div>';
    }).join('');
    var small = 'font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px';
    var meta = [[l.issue, d.issueDate], [l.due, d.dueDate], [l.supply, d.supplyDate]].filter(function (m) { return m[1]; }).map(function (m) {
      return '<div style="margin-bottom:7px"><div style="' + small + '">' + esc(m[0]) + '</div><div style="font-weight:600;font-size:12px">' + esc(m[1]) + '</div></div>';
    }).join('');
    var logo = d.logo ? '<img src="' + d.logo + '" alt="" style="display:block;max-height:44px;max-width:140px;margin-bottom:10px">' : '';
    var foot = d.isPro ? '' : '<div style="margin-top:26px;text-align:center;font-size:10px;color:#94a3b8">Created with GetInvoiceMaker.com</div>';
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;color:#0f172a;margin:0;padding:22px;font-size:12px}*{box-sizing:border-box}</style></head><body>' +
      '<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:22px"><div>' + logo + '<div style="font-size:' + (d.lang === 'nl-en' ? 19 : 24) + 'px;font-weight:700;color:' + d.color + '">' + l.title + '</div><div style="color:#94a3b8;font-size:11px;margin-top:2px">#' + esc(d.invoiceNumber) + '</div></div>' +
      '<div style="text-align:right;font-size:11px;color:#64748b;line-height:1.45"><div style="font-weight:700;font-size:13px;color:#0f172a">' + (esc(d.senderName) || 'Your business') + '</div>' + esc(d.senderEmail) + '<div style="white-space:pre-line">' + esc(d.senderAddress) + '</div>' + (d.senderTaxId ? '<div>' + esc(d.senderTaxId) + '</div>' : '') + '</div></div>' +
      '<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid ' + d.color + '"><div style="font-size:11px;color:#64748b;line-height:1.45"><div style="' + small + '">' + esc(l.billTo) + '</div><div style="font-weight:600;font-size:13px;color:#0f172a">' + (esc(d.clientName) || 'Client name') + '</div>' + esc(d.clientEmail) + '<div style="white-space:pre-line">' + esc(d.clientAddress) + '</div>' + (d.clientTaxId ? '<div>' + esc(l.clientTaxId + d.clientTaxId) + '</div>' : '') + '</div><div style="text-align:right">' + meta + '</div></div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:14px"><thead><tr style="background:' + d.color + ';color:#fff"><th style="padding:7px 6px;text-align:left;font-size:9px;letter-spacing:.4px">' + esc(l.desc.toUpperCase()) + '</th><th style="padding:7px 6px;text-align:center;font-size:9px">' + esc(l.qty.toUpperCase()) + '</th><th style="padding:7px 6px;text-align:right;font-size:9px">' + esc(l.rate.toUpperCase()) + '</th><th style="padding:7px 6px;text-align:right;font-size:9px">' + esc(l.amount.toUpperCase()) + '</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div style="display:flex;justify-content:flex-end"><div style="min-width:220px"><div style="display:flex;justify-content:space-between;gap:12px;padding:3px 0;font-size:12px;color:#64748b"><span>' + esc(l.subtotal) + '</span><span>' + esc(money(d.t.sub)) + '</span></div>' + taxRows +
      '<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0 3px;font-size:15px;font-weight:700;border-top:2px solid ' + d.color + ';margin-top:4px"><span>' + esc(l.total) + '</span><span style="color:' + d.color + '">' + esc(money(d.t.tot)) + '</span></div></div></div>' +
      (d.notes ? '<div style="margin-top:18px;background:#f8fafc;border-left:4px solid ' + d.color + ';padding:9px 13px"><div style="' + small + '">' + esc(l.notes) + '</div><div style="font-size:11px;color:#475569;line-height:1.55;white-space:pre-line">' + esc(d.notes) + '</div></div>' : '') +
      foot + '</body></html>';
  }

  function collect() {
    var items = readItems();
    var t = totals(items);
    return {
      lang: lang(), currency: cur(), color: color, isPro: isPro, logo: logoData,
      senderName: $('fromName').value, senderEmail: $('fromEmail').value, senderAddress: $('fromAddress').value, senderTaxId: $('senderTaxId').value,
      clientName: $('toName').value, clientEmail: $('toEmail').value, clientAddress: $('toAddress').value, clientTaxId: $('clientTaxId').value,
      invoiceNumber: $('invNum').value, issueDate: $('issueDate').value, dueDate: $('dueDate').value, supplyDate: $('supplyDate').value,
      notes: $('notes').value, items: items, t: t
    };
  }

  var SAVED = ['fromName', 'fromEmail', 'fromAddress', 'senderTaxId'];
  var timer = null;
  function update() {
    var d = collect();
    $('sub').textContent = money(d.t.sub);
    $('tot').textContent = money(d.t.tot);
    $('taxLines').innerHTML = d.t.lines.map(function (t) { return '<div class="g-trow"><span>' + esc(t.label) + ' (' + rateText(t.rate) + '%)</span><span>' + esc(money(t.amount)) + '</span></div>'; }).join('');
    SAVED.forEach(function (id) { store('gim_' + id, $(id).value); });
    clearTimeout(timer);
    timer = setTimeout(function () { $('pframe').srcdoc = preview(d); }, 60);
  }

  // ---- presets from the page and the URL ----
  function applyProvince(code) {
    if (!C.provinces) return;
    var p = C.provinces.filter(function (x) { return x.code === code; })[0];
    if (p) setTaxes(p.taxes);
  }
  function nextNumber(last) {
    var m = String(last || '').match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return '';
    var n = String(parseInt(m[2], 10) + 1);
    while (n.length < m[2].length) n = '0' + n;
    return m[1] + n + m[3];
  }

  function init() {
    (C.items && C.items.length ? C.items : [{ qty: 1, rate: 100 }]).forEach(addRow);
    var q = new URLSearchParams(location.search);
    var amount = num(q.get('amount'));
    if (amount > 0 && amount < 1e9) {
      var first = document.querySelector('#items .g-ir');
      var ins = first.querySelectorAll('input');
      ins[1].value = 1; ins[2].value = Math.round(amount * 100) / 100;
    }
    var qc = (q.get('currency') || '').toUpperCase();
    if (qc && $('currency').querySelector('option[value="' + qc.replace(/[^A-Z]/g, '') + '"]')) $('currency').value = qc;
    var ql = q.get('lang');
    if (ql && L[ql]) $('lang').value = ql;
    if (C.provinces) {
      var qp = (q.get('province') || '').toUpperCase().replace(/[^A-Z]/g, '');
      if (qp && $('province').querySelector('option[value="' + qp + '"]')) $('province').value = qp;
      if ($('province').value) applyProvince($('province').value);
      $('province').addEventListener('change', function () { applyProvince(this.value); update(); });
    }
    SAVED.forEach(function (id) { var v = load('gim_' + id); if (v) $(id).value = v; });
    var last = load('gim_lastInvoice');
    var nxt = nextNumber(last);
    if (nxt) $('invNum').value = nxt;
    var today = new Date();
    $('issueDate').value = today.toISOString().slice(0, 10);
    $('dueDate').value = new Date(today.getTime() + 14 * 864e5).toISOString().slice(0, 10);

    $('gen').addEventListener('input', update);
    $('gen').addEventListener('change', update);
    $('items').addEventListener('click', function (e) {
      if (e.target.classList.contains('g-del') && document.querySelectorAll('#items .g-ir').length > 1) { e.target.parentElement.remove(); update(); }
    });
    $('addItem').addEventListener('click', function () { addRow({ qty: 1, rate: 0 }).querySelector('input').focus(); update(); });
    $('tax2Toggle').addEventListener('click', function () {
      var show = $('tax2Row').hidden;
      $('tax2Row').hidden = !show;
      if (!show) { $('tax2Rate').value = ''; $('tax2Label').value = ''; }
      this.textContent = show ? 'Remove second tax line' : '+ Add a second tax line (e.g. PST or QST)';
      update();
    });
    document.querySelectorAll('.g-dot').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.g-dot').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on'); color = b.dataset.c; update();
      });
    });
    $('logoFile').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      if (f.size > 500000) { alert('Please choose an image under 500 KB.'); this.value = ''; return; }
      var r = new FileReader();
      r.onload = function (e) { logoData = e.target.result; update(); };
      r.readAsDataURL(f);
    });
    $('pbtn').addEventListener('click', download);
    update();
    restorePro();
  }

  function download() {
    var btn = $('pbtn');
    var d = collect();
    var payload = {
      lang: d.lang, currency: d.currency, color: d.color, logo: d.logo,
      senderName: d.senderName, senderEmail: d.senderEmail, senderAddress: d.senderAddress, senderTaxId: d.senderTaxId,
      clientName: d.clientName, clientEmail: d.clientEmail, clientAddress: d.clientAddress, clientTaxId: d.clientTaxId,
      invoiceNumber: d.invoiceNumber, issueDate: d.issueDate, dueDate: d.dueDate, supplyDate: d.supplyDate,
      notes: d.notes, items: d.items, taxes: taxes()
    };
    btn.disabled = true; btn.textContent = 'Creating your PDF...';
    fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) { if (!res.ok) throw new Error('pdf'); return res.blob(); })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'invoice-' + ((d.invoiceNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')) + '.pdf';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        if (d.invoiceNumber) store('gim_lastInvoice', d.invoiceNumber);
        btn.disabled = false; btn.textContent = 'Download PDF invoice';
        if (window.gtag) try { window.gtag('event', 'invoice_download', { page: C.key || '' }); } catch (e) {}
      })
      .catch(function () { btn.disabled = false; btn.textContent = 'Something went wrong. Try again'; });
  }

  // A buyer's license key is kept in this browser; if the cookie is gone, restore it quietly.
  function restorePro() {
    if (isPro) return;
    var key = load('gim_license');
    if (!key) return;
    fetch('/activate-pro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ license_key: key, restore: true }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.success) {
          isPro = true;
          var h = $('logoHint'); if (h) h.textContent = 'PNG or JPG under 500 KB. Added to your downloaded PDF.';
          var bar = document.querySelector('.g-pro');
          if (bar) { bar.className = 'g-pro active'; bar.innerHTML = '<p>Pro is active in this browser: no footer, logo on your PDFs.</p>'; }
          update();
        } else if (j && j.message && /not found|no longer active/.test(j.message)) {
          store('gim_license', null);
        }
      }).catch(function () {});
  }

  // Small API for page widgets (e.g. the real estate commission calculator).
  window.GIM = {
    setFirstItem: function (desc, qty, rate) {
      var row = document.querySelector('#items .g-ir');
      var ins = row.querySelectorAll('input');
      ins[0].value = desc; ins[1].value = qty; ins[2].value = rate;
      update();
      document.getElementById('gen').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    addItem: function (desc, qty, rate) { addRow({ desc: desc, qty: qty, rate: rate }); update(); },
    setTaxes: function (list) { setTaxes(list || []); update(); },
    setCurrency: function (code) { if ($('currency').querySelector('option[value="' + code + '"]')) { $('currency').value = code; update(); } }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
