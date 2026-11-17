/* Paddle checkout on GetInvoiceMaker. The footer loads this file only while the Paddle switch (lib/paddle.js) is on.
 *
 *  - The Get Pro button (the link to the Gumroad product, or [data-buy-pro]) opens Paddle's checkout in a panel on this page
 *    (assets/peak-pay.js, loaded on the first press; the Worker peak-pay). The Gumroad address stays on the link, so a browser
 *    without scripts, or a moment when Paddle cannot load, still reaches a checkout.
 *  - After paying, the Pro key goes to /activate-pro: the server checks it with peak-pay and keeps it in the gim_lic cookie, and
 *    a copy stays in this browser (gim_license) so the generator can restore the cookie. Closing the panel reloads the page with Pro on.
 *  - A Pro link from our e-mail (#pro=<key>) leaves the address bar, goes to /activate-pro once, and the page reloads.
 *  - The e-mail box on the Activate Pro page asks peak-pay to e-mail the Pro link again; "Manage or cancel your subscription"
 *    opens Paddle's customer portal for the purchase.
 * A paid key the server could not take yet (no connection) is kept in this browser and sent again on the next page.
 */
(function () {
  'use strict';
  if (window.GIMPay) return;
  window.GIMPay = true;
  var PRODUCT = 'invoicemaker';
  var PLAN = 'monthly';
  var KEY = /^pp-[st]-[0-9a-z]{26}-[0-9a-f]{24}$/i;
  var LINK = /(?:^#|&)pro=(pp-[st]-[0-9a-z]{26}-[0-9a-f]{24})(?:&|$)/i;
  var HELD = 'gim-pay:key';
  var LICENSE = 'gim_license';      // the key the generator restores the cookie from (public/js/generator.js)
  var PENDING = 'peak-pay:pending:' + PRODUCT;
  var me = document.currentScript;
  var isPro = !!(me && me.getAttribute('data-pro') === '1');

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  var payLoad = null;
  function loadPay() {
    if (window.PeakPay) return Promise.resolve(window.PeakPay);
    if (payLoad) return payLoad;
    if (!document.querySelector('style[data-gim-pay]')) {
      var st = document.createElement('style');
      st.setAttribute('data-gim-pay', '');
      st.textContent = ".pp-sheet{--accent:#2563eb;--sans:'Public Sans',system-ui,sans-serif}";
      document.head.appendChild(st);
    }
    payLoad = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = '/assets/peak-pay.js';
      s.onload = function () { resolve(window.PeakPay || null); };
      s.onerror = function () { payLoad = null; resolve(null); };
      document.head.appendChild(s);
    });
    return payLoad;
  }

  function note(text) {
    if (!text) return;
    var d = document.createElement('div');
    d.setAttribute('role', 'status');
    d.textContent = text;
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;max-width:480px;margin:0 auto;padding:12px 14px;border-radius:10px;' +
      'background:#fff;border:1px solid #e2e8f0;box-shadow:0 8px 30px rgba(0,0,0,.12);font:14px/1.5 "Public Sans",system-ui,sans-serif;color:#0f172a;z-index:1000';
    document.body.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 12000);
  }

  // The server takes the key: { ok } | { ok: false, network } (try again later) | { ok: false, message } (a no).
  function activate(key) {
    return fetch('/activate-pro', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ license_key: key }) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          return { ok: d.success === true, network: d.success !== true && (r.status >= 500 || r.status === 429), message: d.message || '' };
        });
      }, function () { return { ok: false, network: true, message: '' }; });
  }
  function activateSoon(key, tries) {
    return activate(key).then(function (a) {
      if (a.ok || !a.network || tries <= 1) return a;
      return new Promise(function (res) { setTimeout(res, 2500); }).then(function () { return activateSoon(key, tries - 1); });
    });
  }
  function settle(key, a) {
    if (a.ok) store.set(LICENSE, key);
    if (a.network) store.set(HELD, key); else store.del(HELD);
    return a;
  }

  // After the payment: the panel calls onKey, then says thank you; closing it reloads the page with Pro on.
  var paid = null;
  function onKey(key) {
    key = String(key).toLowerCase();
    store.set(HELD, key);
    paid = activateSoon(key, 4).then(function (a) { return settle(key, a); });
  }
  function onClose() {
    var p = paid;
    paid = null;
    if (p) p.then(function (a) {
      if (a.ok) location.reload();
      else note(a.network ? 'Your payment went through. Pro turns on here as soon as the connection allows, and the Pro link in our e-mail also turns it on.' : a.message);
    });
  }

  // Get Pro: the checkout panel on this page; if Paddle cannot open here now, the Gumroad link as before.
  var opening = false, payDown = false;
  function buy(href) {
    if (opening) return;
    opening = true;
    loadPay()
      .then(function (P) { return P ? P.open({ product: PRODUCT, plan: PLAN, lang: 'en', page: location.origin + '/', terms: 'Billed monthly, cancel anytime', onKey: onKey, onClose: onClose }) : false; })
      .catch(function () { return false; })
      .then(function (opened) {
        opening = false;
        if (opened) return;
        payDown = true;
        var w = window.open(href, '_blank');
        if (w) { try { w.opener = null; } catch (e) { /* ignore */ } } else location.href = href;
      });
  }
  document.addEventListener('click', function (e) {
    if (payDown || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !(a.hasAttribute('data-buy-pro') || /^https:\/\/[a-z0-9-]+\.gumroad\.com\/l\//i.test(a.href))) return;
    e.preventDefault();
    buy(a.href);
  });

  // A Pro link from our e-mail: it leaves the address bar at once, then turns Pro on in this browser.
  var m = LINK.exec(location.hash);
  if (m) {
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* ignore */ }
    var linkKey = m[1].toLowerCase();
    activateSoon(linkKey, 3).then(function (a) {
      settle(linkKey, a);
      if (a.ok) location.reload();
      else note(a.network ? 'We could not turn Pro on just now. We will try again on your next page, or open the Pro link again in a minute.' : a.message);
    });
  } else {
    var held = store.get(HELD);
    if (held && KEY.test(held)) {
      // a paid key the server could not take during the last visit
      if (isPro) store.del(HELD);
      else activate(held).then(function (a) { settle(held, a); if (a.ok) location.reload(); });
    } else if (/^txn_[0-9a-z]{26}$/.test(store.get(PENDING) || '')) {
      // a payment whose Pro key was not fetched during the last visit
      loadPay().then(function (P) {
        if (P) P.resume({ product: PRODUCT, onKey: function (k) { onKey(k); paid.then(function (a) { if (a.ok) location.reload(); }); } });
      });
    }
  }

  // Activate Pro page: e-mail the Pro link again to the address that paid.
  var f = document.getElementById('ppRestore');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('ppEmail').value.trim();
    var n = document.getElementById('ppNote'), b = document.getElementById('ppSend');
    var show = function (tone, text) { n.className = 'msg ' + tone; n.textContent = text; };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show('err', 'Please enter the e-mail address you paid with.');
    b.disabled = true;
    loadPay()
      .then(function (P) { return P ? P.restore(email, PRODUCT, 'en', location.origin + '/') : 'error'; })
      .catch(function () { return 'error'; })
      .then(function (r) {
        b.disabled = false;
        if (r === 'sent') show('ok', 'If this address bought Pro, the link is on its way. Open it in this browser.');
        else show('err', 'That did not work just now. Please try again in a minute.');
      });
  });

  // Activate Pro page, Pro on: manage or cancel the subscription in Paddle's customer portal (needs the key kept in this browser).
  var manage = document.getElementById('ppManage');
  if (manage) {
    var kept = store.get(LICENSE);
    if (kept && KEY.test(kept)) {
      manage.hidden = false;
      manage.addEventListener('click', function () {
        manage.disabled = true;
        loadPay()
          .then(function (P) { return P ? P.portal(kept.toLowerCase()) : null; })
          .catch(function () { return null; })
          .then(function (url) {
            manage.disabled = false;
            if (url) location.href = url;
            else note('The subscription page could not open just now. Please try again in a minute, or use the link in your Paddle receipt e-mail.');
          });
      });
    }
  }
})();
