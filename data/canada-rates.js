// Canadian sales tax rates used across the site (guide, province calculators, generator presets).
// Update RATES_CHECKED whenever the figures are re-verified against the sources below.
const RATES_CHECKED = '7 October 2026';
const RATES_CHECKED_ISO = '2026-10-07';

const SOURCES = {
  cra: { name: 'CRA: GST/HST calculator (and rates)', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate/calculator.html' },
  craCharge: { name: 'CRA: Charge and collect the tax, which rate to charge', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html' },
  craItc: { name: 'CRA: Input tax credits, documents and information required', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/calculate-prepare-report/input-tax-credit.html#dcmts_rqrd' },
  craRegister: { name: 'CRA: When to register for and start charging the GST/HST', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html' },
  craPlace: { name: 'CRA: Place of supply', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-place-supply.html' },
  craExports: { name: 'CRA: Imports and exports', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-imports-exports.html' },
  rc4022: { name: 'CRA: RC4022 General Information for GST/HST Registrants', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4022/general-information-gst-hst-registrants.html' },
  bc: { name: 'Government of British Columbia: PST', url: 'https://www2.gov.bc.ca/gov/content/taxes/sales-taxes/pst' },
  sk: { name: 'Government of Saskatchewan: Provincial Sales Tax', url: 'https://www.saskatchewan.ca/business/taxes-licensing-and-reporting/provincial-taxes-policies-and-bulletins/provincial-sales-tax' },
  mb: { name: 'Manitoba Finance: Retail Sales Tax', url: 'https://www.gov.mb.ca/finance/taxation/taxes/retail.html' },
  qc: { name: 'Revenu Québec: Basic rules for applying the GST/HST and QST', url: 'https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/basic-rules-for-applying-the-gsthst-and-qst/' },
  qcCalc: { name: 'Revenu Québec: Calculating the taxes', url: 'https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/collecting-gst-and-qst/calculating-the-taxes/' }
};

// type: 'GST' (GST only), 'HST', or 'GST+PST' (separate provincial tax).
const PROVINCES = [
  { code: 'AB', name: 'Alberta', type: 'GST', gst: 5, pst: 0, pstName: '', total: 5 },
  { code: 'BC', name: 'British Columbia', type: 'GST+PST', gst: 5, pst: 7, pstName: 'PST', total: 12, source: 'bc', slug: 'british-columbia-gst-pst-calculator' },
  { code: 'MB', name: 'Manitoba', type: 'GST+PST', gst: 5, pst: 7, pstName: 'RST', total: 12, source: 'mb', slug: 'manitoba-gst-pst-calculator' },
  { code: 'NB', name: 'New Brunswick', type: 'HST', hst: 15, total: 15 },
  { code: 'NL', name: 'Newfoundland and Labrador', type: 'HST', hst: 15, total: 15 },
  { code: 'NT', name: 'Northwest Territories', type: 'GST', gst: 5, pst: 0, pstName: '', total: 5 },
  { code: 'NS', name: 'Nova Scotia', type: 'HST', hst: 14, total: 14, note: '15% until 31 March 2025', slug: 'nova-scotia-hst-calculator' },
  { code: 'NU', name: 'Nunavut', type: 'GST', gst: 5, pst: 0, pstName: '', total: 5 },
  { code: 'ON', name: 'Ontario', type: 'HST', hst: 13, total: 13, slug: 'ontario-hst-calculator' },
  { code: 'PE', name: 'Prince Edward Island', type: 'HST', hst: 15, total: 15 },
  { code: 'QC', name: 'Quebec', type: 'GST+PST', gst: 5, pst: 9.975, pstName: 'QST', total: 14.975, source: 'qc', slug: 'quebec-gst-qst-calculator' },
  { code: 'SK', name: 'Saskatchewan', type: 'GST+PST', gst: 5, pst: 6, pstName: 'PST', total: 11, source: 'sk', slug: 'saskatchewan-gst-pst-calculator' },
  { code: 'YT', name: 'Yukon', type: 'GST', gst: 5, pst: 0, pstName: '', total: 5 }
];

PROVINCES.forEach(p => {
  p.taxes = p.type === 'HST' ? [{ label: 'HST', rate: p.hst }]
    : p.type === 'GST' ? [{ label: 'GST', rate: 5 }]
    : [{ label: 'GST', rate: p.gst }, { label: p.pstName, rate: p.pst }];
  p.summary = p.type === 'HST' ? `${p.hst}% HST` : p.type === 'GST' ? '5% GST' : `5% GST + ${p.pst}% ${p.pstName}`;
});

module.exports = { RATES_CHECKED, RATES_CHECKED_ISO, SOURCES, PROVINCES };
