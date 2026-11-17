// The Paddle checkout switch of GetInvoiceMaker.
//
// Off (false): the site sells Pro through Gumroad exactly as before, and every page renders byte for byte as it did before this
// file existed. On (true): the Get Pro button opens Paddle's checkout in a panel on the page (public/assets/peak-pay.js, the Worker
// peak-pay), Pro turns on right after paying, a Pro link from our e-mail (#pro=<key>) turns it on in another browser, and the
// Activate Pro page can e-mail that link again. Gumroad license keys keep working either way.
//
// To sell through Paddle, change the next line to true and nothing else. Do that only after Paddle has approved the domain
// getinvoicemaker.com (Paddle dashboard > Checkout > Website approval): until then Paddle's checkout cannot load here.
// OFF since 17 Nov 2026: the domain is not submitted yet.
const PADDLE_CHECKOUT = false;

// For local tests only: GIM_PADDLE=1 turns the switch on, never on the production deployment.
function enabled() {
  return PADDLE_CHECKOUT || (process.env.GIM_PADDLE === '1' && process.env.VERCEL_ENV !== 'production');
}

module.exports = {
  PADDLE_CHECKOUT,
  enabled,
  PRODUCT: 'invoicemaker',
  PLAN: 'monthly',
  WORKER: 'https://peak-pay.railer-iot.workers.dev',
  // the Worker answers only the origins it knows; a call from this server says it comes from the site
  ORIGIN: 'https://getinvoicemaker.com',
  KEY_FORMAT: /^pp-[st]-[0-9a-z]{26}-[0-9a-f]{24}$/,
  // Sent with every page while the switch is on. Paddle.js may load; the script of Paddle's retention partner
  // (public.profitwell.com) stays blocked: the checkout works without it, and the site loads no third-party tracking.
  // Only scripts are limited; everything else the pages load is as before.
  CSP: "script-src 'self' 'unsafe-inline' https://cdn.paddle.com"
};
