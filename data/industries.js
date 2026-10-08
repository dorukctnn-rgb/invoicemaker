// Invoice template pages by profession. Only professions whose invoice has its own shape get a page
// (freelance time and project billing, real estate commission). On 8 Oct 2026 eighteen per-title copies
// of one layout were retired with 301s (see RETIRED_PAGES in server.js); do not add entries that only
// swap the job title and sample lines.
// `items` pre-fill the generator; `custom` selects the page partial.
module.exports = [
  {
    slug: 'freelancer', label: 'Freelancers',
    title: 'Freelance Invoice Template: Free PDF, Word & Excel',
    desc: 'Free freelance invoice template. Fill it in online and download a PDF, or get the Word and Excel versions. Hourly, project and retainer examples. No signup.',
    h1: 'Freelance Invoice Template (PDF, Word, Excel)',
    intro: 'Fill in the template below and download a PDF, or download the Word or Excel file. No account, no watermark on the Word and Excel files.',
    itemPlaceholder: 'e.g. Website copywriting, 12 hours',
    items: [{ desc: 'Design work: landing page (hours)', qty: 12, rate: 65 }, { desc: 'Revisions round 2', qty: 1, rate: 120 }],
    notes: 'Payment within 14 days by bank transfer. Please quote the invoice number.',
    custom: 'freelancer'
  },
  {
    slug: 'real-estate', label: 'Real Estate Agents',
    title: 'Real Estate Invoice Template & Commission Invoice Sample',
    desc: 'Free real estate invoice template with a commission invoice sample: property address, sale price, rate, split and closing date. Download Word, Excel or PDF.',
    h1: 'Real Estate Invoice Template and Commission Invoice Sample',
    intro: 'A commission invoice with the property, sale price, rate and split worked out, plus Word, Excel and PDF versions to download.',
    itemPlaceholder: 'e.g. Commission: 24 Oak Street sale',
    items: [{ desc: 'Commission: sale of 24 Oak Street (3% of 450,000)', qty: 1, rate: 13500 }],
    notes: 'Due at closing. Pay by wire to the trust account shown below, quoting the invoice number.',
    custom: 'real-estate'
  }
];
