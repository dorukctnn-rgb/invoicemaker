// Pro access without server state.
//
// A buyer activates once with the license key Gumroad emails after purchase.
// The key is kept in an httpOnly cookie (and in the buyer's localStorage so the
// browser can restore the cookie if it is cleared). Every request that needs Pro
// re-checks the key with Gumroad's license API; results are cached per server
// instance for a few hours. Nothing is stored on our side, so cold starts and
// redeploys never lose an activation, and a made-up cookie value never passes.

const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';

const PRODUCT = {
  // Gumroad accepts product_permalink for products created before 2023 and
  // requires product_id for newer ones; set GUMROAD_PRODUCT_ID if needed.
  permalink: process.env.GUMROAD_PRODUCT_PERMALINK || 'prajxe',
  id: process.env.GUMROAD_PRODUCT_ID || '',
  checkoutUrl: process.env.GUMROAD_CHECKOUT_URL || 'https://dorukctn.gumroad.com/l/prajxe'
};

const COOKIE = 'gim_lic';
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60 * 1000; // browsers cap cookies at 400 days
const OK_TTL = 6 * 60 * 60 * 1000;
const BAD_TTL = 15 * 60 * 1000;
const cache = new Map(); // license key -> { ok, until }

function cleanKey(k) {
  if (typeof k !== 'string') return '';
  const t = k.trim();
  // Gumroad keys look like XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX; allow some slack.
  return /^[A-Za-z0-9-]{8,64}$/.test(t) ? t : '';
}

function purchaseIsActive(p) {
  if (!p) return false;
  if (p.refunded || p.chargebacked || p.disputed) return false;
  // Memberships: access ends when Gumroad marks the subscription ended or failed.
  // A cancelled subscription keeps access until it actually ends.
  if (p.subscription_ended_at || p.subscription_failed_at) return false;
  return true;
}

async function verifyWithGumroad(key, { increment = false } = {}) {
  const body = new URLSearchParams({ license_key: key, increment_uses_count: increment ? 'true' : 'false' });
  if (PRODUCT.id) body.set('product_id', PRODUCT.id);
  else body.set('product_permalink', PRODUCT.permalink);
  let res, data;
  try {
    res = await fetch(GUMROAD_VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(6000) });
    data = await res.json().catch(() => null);
  } catch (e) {
    return { ok: false, transient: true, message: 'Could not reach Gumroad. Please try again in a minute.' };
  }
  if (res.status >= 500 || !data) {
    return { ok: false, transient: true, message: 'Gumroad did not answer. Please try again in a minute.' };
  }
  if (!data.success) {
    return { ok: false, message: 'That license key was not found for GetInvoiceMaker Pro. Copy it from your Gumroad receipt and try again.' };
  }
  if (!purchaseIsActive(data.purchase)) {
    return { ok: false, message: 'This purchase is no longer active (refunded, charged back or the membership ended).' };
  }
  return { ok: true, email: data.purchase && data.purchase.email };
}

async function isValidKey(key) {
  if (!key) return false;
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && hit.until > now) return hit.ok;
  const r = await verifyWithGumroad(key);
  if (r.transient) return hit ? hit.ok : false; // keep the last known answer during a Gumroad outage
  if (cache.size > 1000) cache.clear();
  cache.set(key, { ok: r.ok, until: now + (r.ok ? OK_TTL : BAD_TTL) });
  return r.ok;
}

function keyFromRequest(req) {
  return cleanKey(req.cookies && req.cookies[COOKIE]);
}

async function isProRequest(req) {
  if (req._isPro !== undefined) return req._isPro;
  req._isPro = await isValidKey(keyFromRequest(req));
  return req._isPro;
}

function setProCookie(req, res, key) {
  res.cookie(COOKIE, key, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    path: '/'
  });
}

// Small per-instance limiter so the activation form cannot be used to hammer Gumroad.
const attempts = new Map();
function tooManyAttempts(ip) {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  list.push(now);
  attempts.set(ip, list);
  if (attempts.size > 5000) attempts.clear();
  return list.length > 12;
}

function register(app) {
  // Activation (from /activate or a silent restore from localStorage).
  app.post('/activate-pro', async (req, res) => {
    const body = req.body || {};
    const key = cleanKey(body.license_key || body.licenseKey);
    if (!key) {
      return res.status(400).json({ success: false, message: body.email
        ? 'Pro now activates with the license key from your Gumroad receipt, not the email address. Paste the key to continue.'
        : 'Paste the license key from your Gumroad receipt.' });
    }
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    if (tooManyAttempts(ip)) return res.status(429).json({ success: false, message: 'Too many attempts. Please wait a few minutes.' });
    const r = await verifyWithGumroad(key, { increment: !body.restore });
    if (!r.ok) return res.status(r.transient ? 503 : 400).json({ success: false, message: r.message });
    cache.set(key, { ok: true, until: Date.now() + OK_TTL });
    setProCookie(req, res, key);
    res.json({ success: true });
  });

  app.post('/deactivate-pro', (req, res) => {
    res.clearCookie(COOKIE, { path: '/' });
    res.clearCookie('pro', { path: '/' });
    res.json({ success: true });
  });

  // Gumroad "ping" used to fill an in-memory list that vanished on every cold start.
  // Pro is now checked against Gumroad directly, so the ping is acknowledged and ignored.
  app.post('/gumroad-webhook', (req, res) => res.sendStatus(200));
}

// Is the Gumroad checkout page live? A 404 means the product is unpublished or
// deleted, so we hide the buy button instead of sending buyers to a dead page.
// Any other answer (including timeouts or bot checks) counts as available.
// The check runs in the background and never delays a page; until the first
// answer arrives on a fresh instance we use the last known state below.
const LAST_KNOWN_CHECKOUT_LIVE = false; // 7 Oct 2026: the Gumroad product page returned 404
let checkout = { available: LAST_KNOWN_CHECKOUT_LIVE, checkedAt: 0, pending: null };
const CHECKOUT_TTL = 30 * 60 * 1000;
function refreshCheckout() {
  if (checkout.pending) return checkout.pending;
  checkout.pending = fetch(PRODUCT.checkoutUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; GetInvoiceMaker checkout check)' },
    signal: AbortSignal.timeout(5000)
  }).then(r => { checkout.available = !(r.status === 404 || r.status === 410); })
    .catch(() => {})
    .finally(() => { checkout.checkedAt = Date.now(); checkout.pending = null; });
  return checkout.pending;
}
function checkoutState() {
  if (Date.now() - checkout.checkedAt > CHECKOUT_TTL) refreshCheckout();
  return { available: checkout.available, url: PRODUCT.checkoutUrl };
}

module.exports = { register, isProRequest, checkoutState, PRODUCT, _test: { verifyWithGumroad, purchaseIsActive, cleanKey } };
