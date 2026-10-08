/* Late payment interest calculator page: reads the form, shows the result, builds the reminder wording
   and the link that opens the invoice maker with the lines filled in. Runs entirely in the browser. */
(function () {
  'use strict';
  var L = window.LatePay, P = window.GIMPrefill;
  var $ = function (id) { return document.getElementById(id); };
  var form = $('lpForm');
  if (!L || !P || !form) return;

  function radio(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function localToday() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // The server filled the example dates in UTC. Use the visitor's own date when it differs.
  (function () {
    var t = localToday(), u = $('until');
    if (u.value && u.value !== t && L.isDate(t)) {
      u.value = t;
      $('dueDate').value = L.addDays(t, -30);
      $('startDate').value = L.addDays(t, -60);
    }
  })();

  function state() {
    var country = radio('country') === 'ie' ? 'ie' : 'uk';
    var agreed = radio('agreed') !== 'no';
    return {
      country: country,
      agreed: agreed,
      due: agreed ? $('dueDate').value : L.defaultDueDate(country, $('startDate').value),
      until: $('until').value,
      amount: $('amount').value,
      ref: $('ref').value.replace(/\s+/g, ' ').trim().slice(0, 40),
      method: radio('method') === 'split' ? 'split' : 'single'
    };
  }

  function render() {
    var s = state();
    $('cur').textContent = s.country === 'ie' ? '€' : '£';
    $('countryHint').textContent = s.country === 'ie'
      ? 'Rules from S.I. No. 580 of 2012, for contracts made from 16 March 2013.'
      : 'England, Wales, Scotland and Northern Ireland use the same rate.';
    $('dueWrap').hidden = !s.agreed;
    $('startWrap').hidden = s.agreed;
    $('methodWrap').hidden = s.country !== 'ie';
    $('derived').textContent = !s.agreed && s.due
      ? 'Payment was due by ' + L.longDate(s.due) + (s.country === 'uk' ? ', the last day of the 30-day period that starts on that date.' : ', 30 calendar days after that date.')
      : '';

    var res = L.calculate({ country: s.country, amount: s.amount, dueDate: s.due, until: s.until, method: s.method });
    ['amount', 'dueDate', 'startDate', 'until'].forEach(function (id) { $(id).removeAttribute('aria-invalid'); });
    if (res.error) {
      var f = res.error.field === 'dueDate' && !s.agreed ? 'startDate' : res.error.field;
      if ($(f)) $(f).setAttribute('aria-invalid', 'true');
    }
    $('lpResult').innerHTML = L.resultHTML(res);
    $('lpWork').innerHTML = L.workingHTML(res);

    var ok = !res.error && res.late;
    $('lpAfter').hidden = !ok;
    $('wording').value = ok ? L.reminder(res, s.ref) : '';
    var cta = $('cta');
    if (ok) {
      cta.href = '/#prefill=' + P.encode({ currency: res.currency, items: L.invoiceLines(res, s.ref), notes: L.invoiceNotes(res, s.ref) });
      cta.removeAttribute('aria-disabled');
      cta.removeAttribute('tabindex');
    } else {
      cta.href = '#calculator';
      cta.setAttribute('aria-disabled', 'true');
      cta.setAttribute('tabindex', '-1');
    }
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  $('cta').addEventListener('click', function (e) {
    if (this.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    if (window.gtag) try { window.gtag('event', 'late_interest_to_invoice'); } catch (err) {}
  });

  $('copyBtn').addEventListener('click', function () {
    var btn = this, box = $('wording');
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy the wording'; }, 1800); }
    function fallback() { box.focus(); box.select(); try { if (document.execCommand('copy')) done(); } catch (e) {} }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(box.value).then(done, fallback);
    else fallback();
  });

  render();
})();
