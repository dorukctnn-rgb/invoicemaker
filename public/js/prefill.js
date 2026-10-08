/* Prefill for the invoice generator, carried in the URL fragment (#prefill=...) so the figures never
   reach the server or its logs. Tools on this site encode; the generator decodes and validates.
   Every value is checked here and escaped again where the generator renders it. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GIMPrefill = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var MAX_ITEMS = 20;
  var CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

  function text(v, max, oneLine) {
    var s = typeof v === 'string' ? v : '';
    s = s.replace(CONTROL, '');
    if (oneLine) s = s.replace(/[\r\n\t]+/g, ' ');
    return s.slice(0, max);
  }
  function num(v, lo, hi) {
    var n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
    if (!isFinite(n) || n < lo || n > hi) return null;
    return Math.round(n * 100) / 100;
  }

  // o = { currency: 'GBP', items: [{ d: 'description', q: 1, r: 120.5 }], notes: '...' }
  function encode(o) {
    return encodeURIComponent(JSON.stringify({ v: 1, currency: o.currency, items: o.items, notes: o.notes || '' }));
  }

  function decode(s) {
    if (typeof s !== 'string' || !s || s.length > 8000) return null;
    var o;
    try { o = JSON.parse(decodeURIComponent(s)); } catch (e) { return null; }
    if (!o || typeof o !== 'object' || o.v !== 1 || !Array.isArray(o.items)) return null;
    var items = [];
    for (var i = 0; i < o.items.length && items.length < MAX_ITEMS; i++) {
      var it = o.items[i];
      if (!it || typeof it !== 'object') continue;
      var q = num(it.q, 0, 1e6), r = num(it.r, 0, 1e9);
      if (q === null || r === null) continue;
      items.push({ d: text(it.d, 200, true), q: q, r: r });
    }
    if (!items.length) return null;
    var currency = typeof o.currency === 'string' && /^[A-Z]{3}$/.test(o.currency) ? o.currency : '';
    return { items: items, currency: currency, notes: text(o.notes, 1500, false) };
  }

  return { encode: encode, decode: decode, MAX_ITEMS: MAX_ITEMS };
});
