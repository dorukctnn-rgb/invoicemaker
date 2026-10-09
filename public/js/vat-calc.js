/* VAT calculator on /how-to-calculate-vat-on-invoice.
   Adding VAT: VAT = net x rate. Removing VAT: VAT = gross x rate / (100 + rate) (the VAT fraction, HMRC VAT Notice 700, 7.3.1).
   Amounts are rounded to the nearest penny for display. */
(function () {
  'use strict';
  var root = document.getElementById('vcalc');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  function money(n) { return '£' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function rate() {
    var v = $('vcRate').value;
    $('vcCustomWrap').hidden = v !== 'custom';
    var r = v === 'custom' ? parseFloat($('vcCustom').value) : parseFloat(v);
    return isFinite(r) && r >= 0 && r <= 100 ? r : 0;
  }
  function frac(r) {
    // Show the fraction in lowest terms when the rate is a whole number.
    if (r !== Math.round(r)) return r + '/' + (100 + r);
    var a = r, b = 100 + r, x = a, y = b;
    while (y) { var t = y; y = x % y; x = t; }
    return (a / x) + '/' + (b / x);
  }
  function update() {
    var amt = parseFloat($('vcAmt').value);
    if (!isFinite(amt) || amt < 0) amt = 0;
    var r = rate();
    var add = $('vcMode').value === 'add';
    var net, vat, gross, how;
    if (add) {
      net = amt; vat = round2(amt * r / 100); gross = round2(net + vat);
      how = money(net) + ' × ' + r + '% = ' + money(vat) + ' VAT.';
    } else {
      gross = amt; vat = round2(amt * r / (100 + r)); net = round2(gross - vat);
      how = 'VAT fraction at ' + r + '% is ' + r + '/(100 + ' + r + ')' + (r > 0 ? ' = ' + frac(r) : '') + ': ' + money(gross) + ' × ' + (r > 0 ? frac(r) : '0') + ' = ' + money(vat) + ' VAT.';
    }
    $('vcoNet').textContent = money(net);
    $('vcoVat').textContent = money(vat);
    $('vcoVatLabel').textContent = 'VAT at ' + r + '%';
    $('vcoGross').textContent = money(gross);
    $('vcoHow').textContent = how;
  }
  root.addEventListener('input', update);
  root.addEventListener('change', update);
  update();
})();
