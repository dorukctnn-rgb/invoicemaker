// Long-form article bodies for /blog/* and the /how-to-* guides.
// Kept out of server.js so route definitions stay readable.

const Prefill = require('./public/js/prefill');
const PREFILL = Prefill.encode({"currency":"EUR","items":[{"d":"Brand identity: logo, colour palette and type system (fixed fee)","q":1,"r":2400},{"d":"Brand guidelines document, 24 pages","q":1,"r":800}],"notes":"Outside the scope of UK VAT: the customer belongs outside the UK. Customer to account for any VAT due in its own country.\nCustomer VAT number: NL000000000B00\nPayment in EUR within 30 days by bank transfer to IBAN GB00 BANK 0000 0000 0000 00, BIC BANKGB00.\nBank charges: shared (SHA). Each side pays its own bank."});

const BLOG_CONTENT = {
  'how-to-write-a-professional-invoice': `
<p>A professional invoice does two jobs: it tells your client exactly what they owe and when, and it gives both of you a record that stands up to an accountant or a tax office. Most late payments trace back to an invoice that was missing something, such as a due date, a purchase-order number or bank details.</p>
<h2>The ten things every invoice needs</h2>
<ol>
<li><strong>The word "Invoice"</strong> at the top, so it is not mistaken for a quote or a receipt.</li>
<li><strong>A unique invoice number.</strong> Sequential numbers such as INV-2026-014 are easiest to audit. Never reuse a number.</li>
<li><strong>Issue date and due date.</strong> Write the due date as a date ("Due 14 October 2026"), not only as "Net 30".</li>
<li><strong>Your details:</strong> legal or trading name, address and email. Add your tax number (VAT, GST/HST, BTW, ABN) if you are registered.</li>
<li><strong>Your client's details:</strong> the company name and billing address, plus a contact name and any PO number they gave you.</li>
<li><strong>Line items</strong> with a description, quantity, rate and line total. "Website redesign, 3 templates" is clearer than "Design work".</li>
<li><strong>Subtotal, tax and total.</strong> Show tax as its own line with the rate, for example "VAT 20%".</li>
<li><strong>Payment terms</strong>, for example "Payment due within 14 days".</li>
<li><strong>How to pay:</strong> bank details, IBAN/SWIFT for international clients, or a payment link.</li>
<li><strong>A short note</strong> such as "Thank you for your business" or a reference to the project.</li>
</ol>
<h2>A worked example</h2>
<p>A designer billing a UK client for a logo project might send: <em>INV-2026-031, issued 1 Sept 2026, due 15 Sept 2026. Logo design (3 concepts) 1 &times; &pound;600; Brand guidelines PDF 1 &times; &pound;250. Subtotal &pound;850. VAT 20% &pound;170. Total due &pound;1,020.</em> Each line maps to something the client agreed to, so there is nothing to query.</p>
<h2>Mistakes that delay payment</h2>
<ul>
<li>Sending the invoice to a general inbox instead of the person who approves payments.</li>
<li>Missing the client's PO number. Many larger companies cannot pay without one.</li>
<li>Vague line items that invite questions.</li>
<li>Charging tax when you are not registered, or leaving your tax number off when you are.</li>
</ul>
<h2 id="habits">Habits that get invoices paid on time</h2>
<p>The invoice itself is half the job. These five habits cover the rest, and each links to the detail.</p>
<ol>
<li><strong>Invoice on the day you deliver.</strong> Every day between finishing and invoicing is added to the time it takes to get paid. Make the invoice part of handing over the work, not a job for the end of the month.</li>
<li><strong>Agree the terms before you start.</strong> Put the payment terms, any deposit and your late-payment policy in the quote or contract, then repeat them on the invoice. On larger jobs a deposit, for example 30% to 50%, means you are never owed more than you can afford to lose (<a href="/blog/invoice-payment-terms-guide">payment terms explained</a>).</li>
<li><strong>Remind on a schedule.</strong> A short note a few days before the due date, another on the day, and a firmer one about a week after. Send the same way every time so nothing depends on memory (<a href="/how-to-send-an-invoice#templates">invoice and reminder emails to copy</a>).</li>
<li><strong>Keep one line per invoice.</strong> A spreadsheet with the invoice number, client, amount, issue date, due date and paid date is enough. Sort by due date once a week and the slow payers show up long before they become a cash-flow problem.</li>
<li><strong>Know your late-payment rights.</strong> When a business customer in the UK or Ireland pays late, the law lets you add interest and a fixed compensation sum. Work out both with the <a href="/late-payment-interest-calculator">late payment interest calculator</a>, and read <a href="/how-to-charge-late-payment-fee">how to charge a late payment fee</a> for the wording.</li>
</ol>
<p>You can build an invoice with all of these fields in our <a href="/">free invoice generator</a>. The live preview shows exactly what the PDF will look like before you download it.</p>`,

  // Rewritten 9 Oct 2026 for indexing: sourced rules, worked examples, wording to copy.
  'invoice-payment-terms-guide': `
<div class="answer"><p><strong>The short answer:</strong> payment terms say when an invoice must be paid, counted from the invoice date unless you say otherwise. Write them as a term and a date, for example &ldquo;Net 14: due 23 October 2026&rdquo;. If you and a business customer agree nothing, UK law treats the payment as late 30 days after the customer gets your invoice or the work, whichever is later (<a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery" rel="noopener">GOV.UK</a>), and EU law sets the same 30-day default (<a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007" rel="noopener">Directive 2011/7/EU</a>).</p></div>
<h2 id="terms">Payment terms and what they mean</h2>
<table><thead><tr><th>Term</th><th>Meaning</th><th>Example on a 9 October 2026 invoice</th></tr></thead><tbody>
<tr><td>Due on receipt</td><td>Payable as soon as the invoice arrives</td><td>Due on receipt</td></tr>
<tr><td>Net 7, Net 14</td><td>Due 7 or 14 days after the invoice date</td><td>Net 14: due 23 October 2026</td></tr>
<tr><td>Net 30</td><td>Due 30 days after the invoice date</td><td>Net 30: due 8 November 2026</td></tr>
<tr><td>Net 60, Net 90</td><td>Due 60 or 90 days after the invoice date</td><td>Net 60: due 8 December 2026</td></tr>
<tr><td>EOM</td><td>Due at the end of the month the invoice is dated</td><td>EOM: due 31 October 2026</td></tr>
<tr><td>2/10 Net 30</td><td>2% off if paid within 10 days, otherwise the full amount in 30</td><td>2% off by 19 October, full amount by 8 November</td></tr>
<tr><td>Payment in advance</td><td>Paid before the work starts or the goods ship</td><td>Due before 16 October start date</td></tr>
<tr><td>Deposit and balance</td><td>Part before the work, the rest on completion</td><td>50% now, 50% within 7 days of completion</td></tr>
</tbody></table>
<p>&ldquo;Net&rdquo; means the full amount after any discounts already on the invoice. Always add the date: people read dates, few count days.</p>

<h2 id="law">What the law sets when you agree nothing</h2>
<table class="stack"><thead><tr><th>Where</th><th>Rule</th><th>Source</th></tr></thead><tbody>
<tr><td data-label="Where">UK, any customer</td><td data-label="Rule">Unless you agree a payment date, the customer must pay within 30 days of getting your invoice or the goods or service.</td><td data-label="Source"><a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/payment-obligations" rel="noopener">GOV.UK: payment obligations</a></td></tr>
<tr><td data-label="Where">UK, business customers</td><td data-label="Rule">With no agreed date, payment is late 30 days after the later of the invoice arriving or the work being done. An agreed date must usually be within 60 days for business transactions and 30 days for public authorities; a longer period between businesses has to be fair to both.</td><td data-label="Source"><a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery" rel="noopener">GOV.UK: late commercial payments</a></td></tr>
<tr><td data-label="Where">EU, business customers</td><td data-label="Rule">With no period in the contract, interest runs from 30 calendar days after the customer receives the invoice. A contract period over 60 days is allowed only if expressly agreed and not grossly unfair to the supplier.</td><td data-label="Source"><a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007" rel="noopener">Directive 2011/7/EU, art. 3</a></td></tr>
<tr><td data-label="Where">US federal agencies</td><td data-label="Rule">Under the Prompt Payment Act, an agency that pays a proper invoice late must pay interest; the rate for July to December 2026 is 4.75%.</td><td data-label="Source"><a href="https://fiscal.treasury.gov/payments-from-government/prompt-payment" rel="noopener">US Treasury: Prompt Payment</a></td></tr>
</tbody></table>
<p>Between private businesses in the US, and with consumers in most places, the terms are what you agree, so put them in the quote or contract as well as on the invoice.</p>

<h2 id="discount">What an early-payment discount really costs</h2>
<p>&ldquo;2/10 Net 30&rdquo; gives the client 2% for paying 20 days early. On a &pound;5,000 invoice that is &pound;100 to be paid 20 days sooner. As a yearly rate it is 2 &divide; 98 &times; 365 &divide; 20 = 37.2%, which is why it is usually cheaper to ask for a deposit or shorter terms than to offer a discount.</p>
<p>VAT-registered in the UK and offering a prompt-payment discount? VAT is due on the amount actually paid. If you don&rsquo;t issue a credit note when the discount is taken, HMRC says the invoice must show the discount terms and that the customer can only recover the VAT actually paid, and recommends this wording (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#prompt-discount" rel="noopener">VAT Notice 700, 18.2.2</a>):</p>
<blockquote>A discount of X% of the full price applies if payment is made within Y days of the invoice date. No credit note will be issued. Following payment you must ensure you have only recovered the VAT actually paid.</blockquote>

<h2 id="choose">Choosing terms for a client</h2>
<ul>
<li><strong>Small one-off jobs:</strong> due on receipt or Net 7 keeps the gap between work and payment short.</li>
<li><strong>Larger projects:</strong> a deposit and stage payments, so you are never owed more than you can afford to lose.</li>
<li><strong>Large companies:</strong> ask about their purchase order and payment-run process before you quote, and write their terms into your quote so the invoice matches.</li>
<li><strong>Repeat clients:</strong> keep the same terms on every invoice. Changing them invites disputes about which applies.</li>
</ul>
<p>Late payers: the <a href="/late-payment-interest-calculator">late payment interest calculator</a> works out statutory interest and compensation for UK and Irish business invoices, and <a href="/how-to-charge-late-payment-fee">how to charge a late payment fee</a> covers the wording.</p>
<p class="src">Sources checked 9 October 2026: GOV.UK invoicing and late payment guidance, HMRC VAT Notice 700 (updated 25 June 2026), Directive 2011/7/EU, US Treasury Prompt Payment page (updated 30 June 2026).</p>`,

  // Rewritten 9 Oct 2026 for indexing: sourced rules, worked examples, wording to copy.
  'what-is-vat-invoice': `
<div class="answer"><p><strong>The short answer:</strong> a VAT invoice is an invoice from a VAT-registered business that shows the details HMRC requires, so a VAT-registered customer can reclaim the VAT on it. In the UK you must give one to a VAT-registered customer for standard-rated or reduced-rated sales, normally within 30 days of the tax point. Customers who aren&rsquo;t VAT registered don&rsquo;t need one, and if you aren&rsquo;t registered you can&rsquo;t charge VAT at all (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#vat-invoices-and-when-they-should-be-issued" rel="noopener">VAT Notice 700, 16.2</a>).</p></div>
<h2 id="details">What a full VAT invoice must show</h2>
<ol>
<li>A sequential number based on one or more series which uniquely identifies the invoice</li>
<li>The time of supply (tax point)</li>
<li>The date of issue, if different from the time of supply</li>
<li>Your name, address and VAT registration number (a trading name is fine, but the registered name and address must appear somewhere)</li>
<li>The customer&rsquo;s name and address</li>
<li>A description that identifies what you supplied</li>
<li>For each description: the quantity or extent, the VAT rate and the amount payable before VAT</li>
<li>The total payable before VAT</li>
<li>The rate of any cash discount offered</li>
<li>The total VAT, in sterling</li>
<li>The unit price, for countable goods or services such as an hourly rate</li>
</ol>
<p class="src">List from <a href="https://www.gov.uk/guidance/vat-guide-notice-700#information-required-on-a-vat-invoice" rel="noopener">HMRC VAT Notice 700, 16.3.1</a>, which also says the unit price can be left off where it isn&rsquo;t normally given in the sector and the customer doesn&rsquo;t ask for it.</p>

<h2 id="example">An example VAT invoice</h2>
<p>A joiner invoicing a caf&eacute; for shelving. Names, numbers and figures are made up.</p>
<div class="sample">
<div class="sample-h"><span><b>VAT INVOICE</b> INV-2026-118</span><span>Issued 9 October 2026, tax point 7 October 2026</span></div>
<div class="sample-p"><p><strong>From</strong> Fenwick Joinery Ltd, Mill Street, Leeds. VAT no. GB 000 0000 00</p><p><strong>To</strong> Harbour Caf&eacute; Ltd, Quay Road, Whitby</p></div>
<table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">VAT rate</th><th class="num">Net</th></tr></thead><tbody>
<tr><td>Oak shelving, supplied and fitted (linear metres)</td><td class="num">6</td><td class="num">&pound;95.00</td><td class="num">20%</td><td class="num">&pound;570.00</td></tr>
<tr><td>Fitting labour (hours)</td><td class="num">5</td><td class="num">&pound;42.00</td><td class="num">20%</td><td class="num">&pound;210.00</td></tr>
<tr><td colspan="4">Total before VAT</td><td class="num">&pound;780.00</td></tr>
<tr><td colspan="4">VAT at 20%</td><td class="num">&pound;156.00</td></tr>
<tr class="tot"><td colspan="4">Total due by 23 October 2026</td><td class="num">&pound;936.00</td></tr>
</tbody></table>
</div>

<h2 id="simplified">Simplified VAT invoices (&pound;250 or less)</h2>
<p>If a sale is &pound;250 or less and the customer agrees, you can give a simplified invoice. It needs your name, address and VAT number, the time of supply, a description, and for each VAT rate the total including VAT and the rate (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#retailers-vat-invoices" rel="noopener">VAT Notice 700, 16.6</a>). The customer works out the VAT from the VAT-inclusive total, which is one sixth at 20%.</p>

<h2 id="when">When you don&rsquo;t issue one</h2>
<ul>
<li><strong>The customer isn&rsquo;t VAT registered.</strong> You don&rsquo;t have to issue a VAT invoice, though many businesses do when asked because they can&rsquo;t tell who is registered.</li>
<li><strong>The sale is zero-rated.</strong> HMRC says you don&rsquo;t have to issue VAT invoices for zero-rated supplies. If one invoice mixes rates, zero-rated and exempt items must show clearly that no VAT is due, with their own total (16.5).</li>
<li><strong>You aren&rsquo;t VAT registered.</strong> You can&rsquo;t charge VAT, so your invoice shows no VAT and no VAT number (<a href="https://www.gov.uk/charge-reclaim-record-vat" rel="noopener">GOV.UK</a>).</li>
</ul>

<h2 id="timing">Timing, deposits and pro formas</h2>
<ul>
<li><strong>30 days:</strong> issue the VAT invoice within 30 days of the tax point, unless an earlier invoice already created the tax point (16.2.3).</li>
<li><strong>Deposits:</strong> most deposits create a tax point when you receive them, so the VAT on a deposit is due then (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#deposits" rel="noopener">14.2.3</a>).</li>
<li><strong>Pro forma invoices:</strong> can&rsquo;t be used to reclaim VAT and should say &ldquo;This is not a VAT invoice&rdquo; (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#pro-forma-invoices" rel="noopener">17.3</a>).</li>
<li><strong>Other currencies:</strong> if you invoice a UK supply in euros or dollars, show the VAT total in sterling too (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#invoicing-in-a-foreign-currency" rel="noopener">16.4</a>).</li>
</ul>

<h2 id="keep">Keeping copies</h2>
<p>Keep a copy of every VAT invoice you issue, and keep business records for VAT for at least 6 years (<a href="https://www.gov.uk/guidance/record-keeping-for-vat-notice-70021" rel="noopener">VAT Notice 700/21</a>). Selling to businesses in other countries is a different case: there is usually no UK VAT on the invoice; see <a href="/blog/how-to-invoice-international-clients">how to invoice international clients</a>. Working the VAT out line by line, with HMRC&rsquo;s rounding rules, is in <a href="/how-to-calculate-vat-on-invoice">how to calculate VAT on an invoice</a>.</p>
<p class="src">Sources checked 9 October 2026: HMRC VAT Notice 700 (last updated 25 June 2026) and VAT Notice 700/21, GOV.UK charge, reclaim and record VAT.</p>`,

  // Rewritten 9 Oct 2026 for indexing: sourced rules, worked examples, wording to copy.
  'invoice-vs-receipt': `
<div class="answer"><p><strong>The short answer:</strong> an invoice asks for payment and a receipt proves it was made. You send an invoice before you are paid, with a due date and how to pay; you give a receipt after, with the date, amount and method of payment. When a customer pays on the spot, one document marked &ldquo;Paid&rdquo; can do both jobs.</p></div>
<h2 id="table">Side by side</h2>
<table><thead><tr><th></th><th>Invoice</th><th>Receipt</th></tr></thead><tbody>
<tr><td>When</td><td>Before payment, after the work or delivery</td><td>When payment is received</td></tr>
<tr><td>Purpose</td><td>Requests payment and sets the terms</td><td>Confirms the payment</td></tr>
<tr><td>Key details</td><td>Invoice number, due date, payment details</td><td>Date paid, amount paid, payment method</td></tr>
<tr><td>In your books</td><td>Money owed to you</td><td>Money received</td></tr>
<tr><td>Who needs it most</td><td>The customer&rsquo;s accounts team</td><td>Anyone who paid and needs proof: cash buyers, people claiming expenses, tenants</td></tr>
</tbody></table>

<h2 id="example">One sale, both documents</h2>
<p>A gardener invoices a monthly visit, then confirms the payment. Names and figures are made up.</p>
<div class="sample">
<div class="sample-h"><span><b>INVOICE</b> INV-2026-044</span><span>1 October 2026, due 15 October 2026</span></div>
<table><tbody>
<tr><td>Garden maintenance, September: 4 visits &times; &pound;60</td><td class="num">&pound;240.00</td></tr>
<tr class="tot"><td>Amount due by 15 October 2026</td><td class="num">&pound;240.00</td></tr>
</tbody></table>
<div class="sample-f"><p>Pay by bank transfer to sort code 00-00-00, account 00000000, reference INV-2026-044.</p></div>
</div>
<div class="sample">
<div class="sample-h"><span><b>RECEIPT</b> for INV-2026-044</span><span>Paid 12 October 2026</span></div>
<table><tbody>
<tr><td>Received with thanks: bank transfer, reference INV-2026-044</td><td class="num">&pound;240.00</td></tr>
<tr class="tot"><td>Balance outstanding</td><td class="num">&pound;0.00</td></tr>
</tbody></table>
</div>

<h2 id="which">Which one you need</h2>
<ul>
<li><strong>Selling to a business on credit:</strong> an invoice. In the UK, if you and your customer are both VAT registered, it has to be a VAT invoice (<a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include" rel="noopener">GOV.UK</a>).</li>
<li><strong>Paid on the spot:</strong> a receipt, or the invoice marked paid. UK retailers can give a simplified VAT invoice for sales of &pound;250 or less if the customer agrees (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#retailers-vat-invoices" rel="noopener">VAT Notice 700, 16.6</a>). In Australia, a GST-registered seller must give a tax invoice within 28 days if asked, unless the sale is &#36;82.50 or less including GST (<a href="https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/tax-invoices" rel="noopener">ATO</a>).</li>
<li><strong>Rent:</strong> tenants often need receipts as proof of payment. The <a href="/rent-receipt-generator">rent receipt generator</a> makes one.</li>
</ul>

<h2 id="paid-invoice">Can an invoice be a receipt?</h2>
<p>Yes. Add &ldquo;Paid&rdquo; with the date, the amount and how it was paid, keep the same invoice number, and send it back. If only part was paid, show the amount received and the balance still due. Paid in cash? The wording is in <a href="/how-to-write-invoice-for-cash-payment">how to write an invoice for cash payment</a>.</p>

<h2 id="keep">How long to keep them</h2>
<ul>
<li><strong>UK, self-employed:</strong> keep records of all sales and income, including sales invoices and receipts, for at least 5 years after the 31 January deadline for that tax year (<a href="https://www.gov.uk/self-employed-records/how-long-to-keep-your-records" rel="noopener">GOV.UK</a>).</li>
<li><strong>UK, VAT registered:</strong> keep business records for VAT purposes for at least 6 years (<a href="https://www.gov.uk/guidance/record-keeping-for-vat-notice-70021" rel="noopener">VAT Notice 700/21</a>).</li>
<li><strong>US:</strong> the IRS lists invoices and receipt books among the documents that show gross receipts, and says to keep records until the period of limitations for the return runs out, generally 3 years (<a href="https://www.irs.gov/publications/p583" rel="noopener">IRS Publication 583</a>).</li>
</ul>
<p class="src">Sources checked 9 October 2026: GOV.UK, HMRC VAT Notice 700 and 700/21, ATO tax invoices (updated 18 September 2026), IRS Publication 583.</p>`,

  // Rewritten 9 Oct 2026 for indexing: sourced rules, worked examples, wording to copy.
  'invoice-number-format': `
<div class="answer"><p><strong>The short answer:</strong> give every invoice a unique number in a sequence you can explain, and never reuse one. UK VAT invoices must carry &ldquo;a sequential number based on one or more series which uniquely identifies the document&rdquo; (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#information-required-on-a-vat-invoice" rel="noopener">HMRC</a>), and EU VAT invoices a unique sequential number (<a href="https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/vat-invoicing_en" rel="noopener">European Commission</a>). Formats such as INV-2026-014 meet that and stay easy to sort.</p></div>
<h2 id="rules">What the rules say</h2>
<table class="stack"><thead><tr><th>Where</th><th>Invoice number rule</th><th>Source</th></tr></thead><tbody>
<tr><td data-label="Where">UK, any invoice</td><td data-label="Rule">&ldquo;A unique identification number&rdquo;</td><td data-label="Source"><a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include" rel="noopener">GOV.UK</a></td></tr>
<tr><td data-label="Where">UK, VAT invoice</td><td data-label="Rule">A sequential number based on one or more series which uniquely identifies the document</td><td data-label="Source"><a href="https://www.gov.uk/guidance/vat-guide-notice-700#information-required-on-a-vat-invoice" rel="noopener">VAT Notice 700, 16.3</a></td></tr>
<tr><td data-label="Where">EU, VAT invoice</td><td data-label="Rule">A unique sequential number identifying the invoice</td><td data-label="Source"><a href="https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/vat-invoicing_en" rel="noopener">European Commission</a></td></tr>
<tr><td data-label="Where">Canada, GST/HST</td><td data-label="Rule">The CRA&rsquo;s list of details a buyer needs to claim input tax credits does not include an invoice number</td><td data-label="Source"><a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/calculate-prepare-report/input-tax-credit.html#dcmts_rqrd" rel="noopener">CRA</a></td></tr>
<tr><td data-label="Where">Australia, tax invoice</td><td data-label="Rule">The ATO&rsquo;s seven required details for a tax invoice do not include an invoice number</td><td data-label="Source"><a href="https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/tax-invoices" rel="noopener">ATO</a></td></tr>
</tbody></table>
<p>Where no number is required, use one anyway: it is how you, your client and an accountant find the invoice, match the payment and show that nothing is missing. Dutch invoices follow the EU rule; the details are in the <a href="/free-invoice-generator-netherlands">Dutch invoice guide</a>.</p>

<h2 id="formats">Formats that work</h2>
<table><thead><tr><th>Format</th><th>Example</th><th>Suits</th></tr></thead><tbody>
<tr><td>Simple sequence</td><td>0001, 0002, 0003</td><td>A first year with few invoices</td></tr>
<tr><td>Year and sequence</td><td>2026-001, 2026-002</td><td>Most small businesses; sorts by year</td></tr>
<tr><td>Prefix, year and sequence</td><td>INV-2026-014</td><td>Businesses that also number quotes (Q-2026-014) and credit notes (CN-2026-003)</td></tr>
<tr><td>Series per shop or brand</td><td>LDN-2026-031, MCR-2026-012</td><td>More than one location; each series stays sequential</td></tr>
<tr><td>Client code and sequence</td><td>ACME-007</td><td>A few long-term clients, as long as each number is still unique</td></tr>
</tbody></table>
<p>HMRC&rsquo;s wording, &ldquo;one or more series&rdquo;, is what allows a new series each year or one series per shop, provided no number repeats.</p>

<h2 id="start">Starting, restarting and gaps</h2>
<ul>
<li><strong>Starting number:</strong> you don&rsquo;t have to start at 1. Starting at 1001 is fine if you carry on from there.</li>
<li><strong>A new year:</strong> start a new series with the year in it (2027-001) rather than reusing 001.</li>
<li><strong>Pad the numbers:</strong> 007 rather than 7, so files sort in order.</li>
<li><strong>Gaps:</strong> if a number is skipped, note why (for example, voided before sending) so the sequence can be explained.</li>
</ul>

<h2 id="cancel">Cancelled or wrong invoices</h2>
<p>Don&rsquo;t delete an invoice you have sent or reuse its number. Issue a credit note with its own number that cancels all or part of it, then a new invoice if needed. For VAT, HMRC lists what a valid credit note shows, including its own number and date, the amount and VAT credited, and the number and date of the original invoice (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#valid-credit-debit-note" rel="noopener">VAT Notice 700, 18.2.3</a>).</p>
<blockquote>CREDIT NOTE CN-2026-003, 9 October 2026. Cancels invoice INV-2026-014 dated 2 October 2026 in full: &pound;850.00 plus VAT &pound;170.00.</blockquote>
<p>Quoted the job first? Keep quotes in their own series and put the quote number on the invoice as a reference (<a href="https://www.getquotationmaker.com/how-to-convert-a-quote-to-an-invoice" rel="noopener">turning a quote into an invoice</a>). The <a href="/">invoice generator</a> suggests the next number in your sequence and remembers it in your browser.</p>
<p class="src">Sources checked 9 October 2026: GOV.UK, HMRC VAT Notice 700 (updated 25 June 2026), European Commission VAT invoicing rules, CRA input tax credits, ATO tax invoices (updated 18 September 2026).</p>`,

  // Rewritten 9 Oct 2026 (was "Crawled - currently not indexed"): tax wording by country with official sources.
  'how-to-invoice-international-clients': `
<div class="answer"><p><strong>The short answer:</strong> invoice a client abroad the way you invoice at home, then settle four things before you send it. The <strong>currency</strong>, written as a code (EUR 3,200.00). The <strong>tax line</strong>: for a business client in another country you usually charge no VAT or GST, and you add a short note saying why. The <strong>client details</strong> their country needs, such as an EU business&rsquo;s VAT number. And <strong>how the money reaches you</strong>: IBAN and BIC or local bank details, and who pays the bank charges.</p></div>
<h2 id="tax">The tax line, by where you are registered</h2>
<p>Most VAT and GST systems tax a service sold to a business in another country where the customer is, so you charge nothing and the customer deals with any tax at home. Each country words it differently and each has exceptions (work on land or buildings, events, services used in your own country), so check the source for your case.</p>
<table class="stack"><thead><tr><th>You are registered in</th><th>Your client</th><th>What you charge</th><th>What the invoice says</th></tr></thead><tbody>
<tr><td data-label="You are registered in">UK (VAT)</td><td data-label="Your client">A business outside the UK</td><td data-label="What you charge">No UK VAT for most services: the supply is made where the customer belongs, which puts it outside the scope of UK VAT (<a href="https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a#b2b-supplies" rel="noopener">VAT Notice 741A, 6.3</a>)</td><td data-label="What the invoice says">No VAT line, a note such as &ldquo;Outside the scope of UK VAT&rdquo;, and the client&rsquo;s VAT number if it has one. HMRC calls an EU customer&rsquo;s VAT number the best evidence that it is in business.</td></tr>
<tr><td data-label="You are registered in">UK (VAT)</td><td data-label="Your client">A private person outside the UK</td><td data-label="What you charge">Depends on the service. Consultancy, legal, accounting, advertising, data processing and similar services are outside the scope (<a href="https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a" rel="noopener">Notice 741A, section 12</a>); most other services to consumers carry UK VAT (6.2)</td><td data-label="What the invoice says">UK VAT where it applies. If the invoice is in another currency, the VAT total must also be shown in sterling (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#invoicing-in-a-foreign-currency" rel="noopener">Notice 700, 16.4</a>)</td></tr>
<tr><td data-label="You are registered in">An EU country (VAT)</td><td data-label="Your client">A VAT-registered business in another EU country</td><td data-label="What you charge">No VAT from you: the customer accounts for it under the reverse charge</td><td data-label="What the invoice says">The words &ldquo;reverse charge&rdquo; and the customer&rsquo;s VAT number, both required on the invoice (<a href="https://taxation-customs.ec.europa.eu/taxation/vat/vat-businesses/vat-invoicing_en" rel="noopener">European Commission</a>). Dutch wording and the rules for clients outside the EU: <a href="/free-invoice-generator-netherlands">Dutch invoice guide</a></td></tr>
<tr><td data-label="You are registered in">Canada (GST/HST)</td><td data-label="Your client">A non-resident client</td><td data-label="What you charge">Often 0%: certain services supplied to a non-resident, other than to an individual while they are in Canada, can be zero-rated (<a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-imports-exports.html" rel="noopener">CRA</a>)</td><td data-label="What the invoice says">GST/HST at 0%, shown as zero-rated, with your GST/HST number. Inside Canada the province rules apply instead (<a href="/how-to-calculate-gst-on-canadian-invoices">GST on Canadian invoices</a>)</td></tr>
<tr><td data-label="You are registered in">Australia (GST)</td><td data-label="Your client">A client outside Australia</td><td data-label="What you charge">No GST when the service is used outside Australia, or supplied to a non-resident who is not in Australia at the time. Services provided in Australia are not GST-free even if the client is abroad (<a href="https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/australians-doing-business-overseas/exports-and-gst" rel="noopener">ATO</a>)</td><td data-label="What the invoice says">No GST on the invoice. The ATO&rsquo;s own example is a freelance writer in Australia invoicing an English publisher without GST</td></tr>
<tr><td data-label="You are registered in">Nowhere</td><td data-label="Your client">Anyone</td><td data-label="What you charge">Nothing: if you are not registered you cannot charge VAT or GST</td><td data-label="What the invoice says">No tax line and no tax number</td></tr>
</tbody></table>
<p>Selling from the US? Check your state&rsquo;s sales tax rules for services sold to customers abroad. Your client may still have to account for VAT or GST in its own country, which is its job, not yours.</p>

<h2 id="currency">Currency</h2>
<ul>
<li><strong>Agree it in writing before you start,</strong> and use it on every line of the invoice.</li>
<li><strong>Name it.</strong> Write &ldquo;EUR 3,200.00&rdquo; or add &ldquo;All amounts in US dollars (USD)&rdquo;. A bare $ could be US, Canadian or Australian dollars.</li>
<li><strong>Know who carries the exchange risk.</strong> Invoice in your own currency and the client carries it; invoice in theirs and you do, because what lands in your account moves with the rate.</li>
<li><strong>UK VAT in another currency.</strong> If you do charge UK VAT on an invoice in euros or dollars, convert the VAT total to sterling at the UK market selling rate at the time of supply, or at HMRC&rsquo;s period rate (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#value-in-foreign-currency" rel="noopener">Notice 700, 7.6</a>).</li>
</ul>

<h2 id="paid">Getting paid</h2>
<ul>
<li><strong>Bank details that work across borders:</strong> IBAN and BIC (SWIFT code) for international transfers, account and routing numbers for US clients paying into a US account, or a payment link.</li>
<li><strong>Say who pays the bank charges.</strong> International transfers have three charge options: OUR (the sender pays all charges), SHA (each side pays its own bank) and BEN (the person paid bears all of them). For payments to a bank in the EU or EEA, the sending bank may offer only SHA; Barclays&rsquo; guide explains this follows the second Payment Services Directive (<a href="https://www.ib.barclays/content/dam/barclaysmicrosites/ibpublic/documents/investment-bank/barclays-bank-ireland/barclays-guide-to-overseas-delivery-charges.pdf" rel="noopener">Barclays</a>). If you need the full amount, agree OUR in the contract and write it on the invoice.</li>
<li><strong>Give a due date, not only a term:</strong> &ldquo;Due 1 November 2026&rdquo; reads the same in every country.</li>
</ul>

<h2 id="details">Details clients abroad expect</h2>
<ul>
<li>The client&rsquo;s full legal name and registered address, and for an EU business its VAT number.</li>
<li>A description that says what the service is. HMRC notes that the place of supply depends on the nature of the service, so invoices should avoid generic descriptions (<a href="https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a#the-impact-on-uk-suppliers" rel="noopener">Notice 741A, 2.3</a>).</li>
<li>Dates written out: 3 April 2026, not 03/04/26, which reads as 3 April in the UK and 4 March in the US.</li>
<li>Their purchase order number, if they gave you one.</li>
<li>For US clients: they may ask you for Form W-8BEN (individuals) or W-8BEN-E (companies), which a foreign person gives to the payer when asked (<a href="https://www.irs.gov/forms-pubs/about-form-w-8-ben" rel="noopener">IRS</a>). Don&rsquo;t send a W-9 instead: the W-8BEN is the form for a foreign person.</li>
</ul>

<h2 id="sample">Sample: a UK designer invoicing a Dutch company</h2>
<p>A VAT-registered UK studio sells a brand identity to a business in the Netherlands, invoices in euros and charges no UK VAT. Names, numbers and bank details are made up.</p>
<div class="sample">
<div class="sample-h"><span><b>INVOICE</b> INV-2026-087</span><span>2 October 2026, due 1 November 2026</span></div>
<div class="sample-p"><p><strong>From</strong> Hollin Studio Ltd, London, United Kingdom. VAT no. GB 000 0000 00</p><p><strong>Bill to</strong> Noordkade Media B.V., Amsterdam, Netherlands. VAT no. NL000000000B00</p></div>
<table><thead><tr><th>Description</th><th class="num">Amount</th></tr></thead><tbody>
<tr><td>Brand identity: logo, colour palette and type system (fixed fee)</td><td class="num">EUR 2,400.00</td></tr>
<tr><td>Brand guidelines document, 24 pages</td><td class="num">EUR 800.00</td></tr>
<tr><td>UK VAT</td><td class="num">None</td></tr>
<tr class="tot"><td>Total due</td><td class="num">EUR 3,200.00</td></tr>
</tbody></table>
<div class="sample-f"><p>Outside the scope of UK VAT: the customer belongs outside the UK. Customer to account for any VAT due in its own country.</p><p>Payment in EUR by bank transfer to IBAN GB00 BANK 0000 0000 0000 00, BIC BANKGB00. Bank charges: SHA, each side pays its own bank.</p></div>
</div>
<p><a class="btn-blue" href="/#prefill=${PREFILL}">Open this sample in the invoice generator</a></p>

<h2 id="mistakes">Mistakes that cost time or money</h2>
<ul>
<li>Adding your home VAT or GST to a business client abroad out of habit. They then have to ask for a corrected invoice before they can pay.</li>
<li>Leaving out an EU business client&rsquo;s VAT number, which the reverse charge invoice needs.</li>
<li>Not saying who pays the bank charges, then receiving less than the invoice total.</li>
<li>A $ sign with no currency code, or a date that reads differently on the other side of the Atlantic.</li>
</ul>
<p class="src">Sources checked 9 October 2026: HMRC VAT Notice 741A and VAT Notice 700 (last updated 25 June 2026), European Commission VAT invoicing rules, CRA imports and exports (modified 22 June 2026), ATO exports and GST (updated 28 July 2023), IRS Form W-8BEN (updated 2 October 2026), Barclays guide to overseas delivery charges. General information, not tax advice: the rules turn on the type of service and where it is used.</p>`,

};

// Bodies for the /how-to-* pages. Each targets a distinct task.
const HOWTO_CONTENT = {
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-invoice-as-a-freelancer': {
    steps: ["Agree the scope, rate and payment terms in writing","Check whether you must register for tax, VAT or GST","Invoice under your own name or trading name","Give it a number, a date and a due date","Send the PDF and keep a copy for your tax return"],
    body: `
<div class="answer"><p><strong>The short answer:</strong> you don&rsquo;t need a company to send an invoice. Invoice under your own name, or &ldquo;Jane Smith trading as Smith Design&rdquo;, with your address and contact details, the client&rsquo;s details, a unique invoice number, the date, what you supplied and the amount. Add a VAT or GST number only if you are registered for it.</p></div>
<h2 id="include">What goes on a freelance invoice</h2>
<p>In the UK every invoice must show a unique identification number, your name, address and contact details, the customer&rsquo;s name and address, a clear description, the supply date, the invoice date, the amounts, any VAT and the total. As a sole trader you also show your name and any business name you use, and if you use a business name, an address where legal documents can be delivered to you (<a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/invoices-what-they-must-include" rel="noopener">GOV.UK</a>). Other countries ask for much the same; the differences are mostly the tax number.</p>
<p>A layout with these fields, as Word, Excel and PDF files, is on the <a href="/invoice-template-freelancer">freelance invoice template</a> page.</p>

<h2 id="country">Registration and tax numbers by country</h2>
<table class="stack"><thead><tr><th>Where</th><th>Do you need to register?</th><th>Tax number on the invoice</th></tr></thead><tbody>
<tr><td data-label="Where">UK</td><td data-label="Register">You can start trading straight away. Register for Self Assessment if you earn more than &pound;1,000 from self-employment in a tax year (<a href="https://www.gov.uk/become-sole-trader" rel="noopener">GOV.UK</a>). VAT registration is required once taxable turnover goes over &pound;90,000 in 12 months (<a href="https://www.gov.uk/register-for-vat" rel="noopener">GOV.UK</a>).</td><td data-label="Tax number">Your VAT number only if you are VAT registered</td></tr>
<tr><td data-label="Where">US</td><td data-label="Register">Clients who must report what they pay you may ask for Form W-9 with your taxpayer identification number (<a href="https://www.irs.gov/forms-pubs/about-form-w-9" rel="noopener">IRS</a>). An EIN is free from the IRS (<a href="https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number" rel="noopener">IRS</a>).</td><td data-label="Tax number">Sales tax rules are set by each state</td></tr>
<tr><td data-label="Where">Canada</td><td data-label="Register">GST/HST registration is required once your taxable sales go over $30,000 in a calendar quarter or over four consecutive quarters (<a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html" rel="noopener">CRA</a>).</td><td data-label="Tax number">Your GST/HST number on invoices of $100 or more, if registered (<a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/calculate-prepare-report/input-tax-credit.html#dcmts_rqrd" rel="noopener">CRA</a>). Rates: <a href="/how-to-calculate-gst-on-canadian-invoices">GST on Canadian invoices</a></td></tr>
<tr><td data-label="Where">Australia</td><td data-label="Register">GST registration is required once GST turnover reaches A&#36;75,000 (<a href="https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/australians-doing-business-overseas/exports-and-gst" rel="noopener">ATO</a>).</td><td data-label="Tax number">Your ABN. A business you invoice without an ABN must generally withhold 47% of the payment (<a href="https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/pay-as-you-go-payg-withholding" rel="noopener">ATO</a>)</td></tr>
<tr><td data-label="Where">Netherlands</td><td data-label="Register">Registering with the KVK, and the numbers that go on a Dutch invoice, are covered in the <a href="/free-invoice-generator-netherlands">Dutch invoice guide</a>.</td><td data-label="Tax number">KVK number and btw-id</td></tr>
</tbody></table>

<h2 id="steps">From agreement to payment</h2>
<ol>
<li><strong>Agree it in writing.</strong> Scope, rate (hourly, daily or fixed), payment terms and any deposit. An email the client replies &ldquo;agreed&rdquo; to is enough to refer back to.</li>
<li><strong>Set your terms.</strong> Short terms, a deposit on larger jobs and the due date written as a date (<a href="/blog/invoice-payment-terms-guide">payment terms explained</a>).</li>
<li><strong>Write the lines so they can be checked:</strong> &ldquo;Blog articles, 4 &times; 1,500 words at &pound;250&rdquo; rather than &ldquo;Writing&rdquo;.</li>
<li><strong>Number it.</strong> One sequence for all your invoices, never reused (<a href="/blog/invoice-number-format">invoice numbering</a>).</li>
<li><strong>Send the PDF</strong> to whoever approves payment, and remind on a schedule (<a href="/how-to-send-an-invoice">email templates</a>). Clients abroad: <a href="/blog/how-to-invoice-international-clients">how to invoice international clients</a>.</li>
</ol>

<h2 id="records">Keep copies for your tax return</h2>
<p>Invoiced income is taxable. UK sole traders keep records of all sales and income for at least 5 years after the 31 January deadline for the tax year (<a href="https://www.gov.uk/self-employed-records/how-long-to-keep-your-records" rel="noopener">GOV.UK</a>); in the US, invoices are among the records that show gross receipts (<a href="https://www.irs.gov/publications/p583" rel="noopener">IRS Publication 583</a>). Selling on Etsy as well? The free <a href="https://peakappsstudio.com/etsy-tax-summary/" rel="noopener">Etsy tax summary</a> turns Etsy&rsquo;s monthly statements into the year&rsquo;s sales, refunds and fees.</p>
<p class="src">Sources checked 9 October 2026: GOV.UK invoicing, sole trader, VAT registration and record-keeping pages; IRS Form W-9, EIN and Publication 583; CRA; ATO exports and GST, PAYG withholding (updated 1 May 2025).</p>`,
    faq: [
      {"q":"Can I send an invoice without a registered company?","a":"Yes. Freelancers and sole traders invoice under their own name, with or without a trading name. You add a VAT, GST or business number only when the rules where you work require one."},
      {"q":"What name do I put on a freelance invoice?","a":"Your own name, or your name and a trading name, such as \"Jane Smith trading as Smith Design\". In the UK, a sole trader using a business name must also give an address where legal documents can be delivered."},
      {"q":"Do I need a tax number on my invoices?","a":"Only if you are registered: a UK VAT number once you are VAT registered, a GST/HST number in Canada, an ABN in Australia. In the US, clients may instead ask for a Form W-9."}
    ]
  },
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-make-an-invoice-in-word': {
    steps: ["Start from a Word invoice template or a blank document","Add your details, the client’s, the invoice number and the dates","Build a table for the line items","Total the table with Word formulas and press F9 to update them","Save as PDF and keep the .docx for next time"],
    body: `
<div class="answer"><p><strong>The short answer:</strong> in Word, go to File, then New, and search the online templates for &ldquo;invoice&rdquo;, or build one in a blank document: your details and the word Invoice at the top, the invoice number and dates, a table of lines, and totals worked out with Table Layout, Formula (for example <code>=SUM(ABOVE)</code>). Word formulas don&rsquo;t recalculate as you type: select the table and press F9 before you save the PDF (<a href="https://support.microsoft.com/en-gb/word/use-a-formula-in-a-word-table" rel="noopener">Microsoft</a>).</p></div>
<h2 id="template">Start from a template</h2>
<ol>
<li>Open Word, go to <strong>File</strong>, then <strong>New</strong>.</li>
<li>Type &ldquo;invoice&rdquo; in <strong>Search for online templates</strong> and press Enter (<a href="https://support.microsoft.com/en-gb/office/create-a-document-in-word-aafc163a-3a06-45a9-b451-cb7250dcbaa1" rel="noopener">Microsoft</a>).</li>
<li>Pick a simple layout, then replace the placeholder text with your details.</li>
</ol>
<p>Or download a ready-made Word file from this site: the <a href="/templates/freelance-invoice-template.docx">freelance invoice template (.docx)</a> or the <a href="/templates/dutch-invoice-template-factuur.docx">Dutch and English invoice template (.docx)</a>.</p>

<h2 id="build">Build it from a blank document</h2>
<ol>
<li><strong>Header:</strong> your name or business name, address, email and, if registered, your VAT or GST number. Write &ldquo;Invoice&rdquo; in large type.</li>
<li><strong>Invoice details:</strong> invoice number, invoice date, due date, and the client&rsquo;s name and address.</li>
<li><strong>Line items:</strong> insert a table with four columns: Description, Qty, Rate, Amount.</li>
<li><strong>Line amounts:</strong> click in the first Amount cell, go to <strong>Table Layout</strong>, then <strong>Formula</strong>, and enter <code>=PRODUCT(LEFT)</code>, which multiplies the numbers to the left (the quantity and the rate). Repeat for each line.</li>
<li><strong>Subtotal:</strong> in the cell under the last amount, use <code>=SUM(ABOVE)</code>.</li>
<li><strong>Tax and total:</strong> use cell references, for example <code>=D6*0.2</code> for VAT at 20% on the subtotal in cell D6, and <code>=D6+D7</code> for the total. Word counts columns A, B, C and rows 1, 2, 3 from the top left of the table.</li>
<li><strong>Update the sums:</strong> Word calculates formulas when you insert them and when the document opens. After any change, select the table and press <strong>F9</strong>, or press Ctrl+A then F9 to update every formula in the document (<a href="https://support.microsoft.com/en-gb/word/use-a-formula-in-a-word-table" rel="noopener">Microsoft</a>).</li>
<li><strong>Save as PDF:</strong> go to File, Save As, and choose PDF. Send the PDF and keep the .docx for next time.</li>
</ol>

<h2 id="wrong">Where Word invoices go wrong</h2>
<table><thead><tr><th>Problem</th><th>Fix</th></tr></thead><tbody>
<tr><td>Totals that didn&rsquo;t update after a quantity changed</td><td>Select the table and press F9 before saving the PDF</td></tr>
<tr><td>The same invoice number twice, after copying last month&rsquo;s file</td><td>Change the number first, and keep a list of numbers used (<a href="/blog/invoice-number-format">invoice numbering</a>)</td></tr>
<tr><td>VAT typed by hand and wrong</td><td>Use a formula, and check it with the <a href="/how-to-calculate-vat-on-invoice">VAT calculator</a></td></tr>
<tr><td>The client edits or misreads a .docx</td><td>Send a PDF only</td></tr>
</tbody></table>

<h2 id="faster">The faster route</h2>
<p>The <a href="/">invoice generator</a> does the sums, adds tax lines, suggests the next invoice number and downloads a PDF, with nothing to install. Use Word when you need a layout you design yourself; use the generator when you want the totals right without checking formulas.</p>
<p class="src">Microsoft support pages checked 9 October 2026: &ldquo;Use a formula in a Word table&rdquo; and &ldquo;Create a document in Word&rdquo;.</p>`,
    faq: [
      {"q":"Does Word have invoice templates?","a":"Yes. In Word, go to File, then New, and type \"invoice\" in the Search for online templates box."},
      {"q":"How do I make Word add up an invoice?","a":"Click in the total cell, go to Table Layout, then Formula, and use =SUM(ABOVE). Press F9 with the table selected to update it after changes."},
      {"q":"Why didn’t my Word invoice total change?","a":"Word formulas update when the document opens or when you press F9, not as you type. Select the table and press F9."}
    ]
  },
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-send-an-invoice': {
    steps: ["Save the invoice as a PDF with a clear file name","Send it to the person who approves payment, with your contact copied","Put the invoice number, your name and the due date in the subject line","Repeat the amount, due date and how to pay in the first lines of the email","Send reminders on a fixed schedule if it is not paid"],
    body: `
<div class="answer"><p><strong>The short answer:</strong> attach the invoice as a PDF to a short email sent to whoever approves payment. Put the invoice number, your business name and the due date in the subject line, and repeat the amount, the due date and how to pay in the first lines of the email, so it can be approved without opening the attachment. The templates below cover the first invoice through to a final reminder.</p></div>
<h2 id="before">Before you press send</h2>
<ul>
<li><strong>PDF, not Word:</strong> it looks the same on every device and can&rsquo;t be edited by accident. Name it so it can be found: <code>INV-2026-042_BirchLaneStudio.pdf</code>.</li>
<li><strong>The right person:</strong> your project contact often doesn&rsquo;t release payment. Ask once who invoices go to and whether they need a purchase order number, then send to that address and copy your contact.</li>
<li><strong>The details they check:</strong> their PO number, their legal name and billing address, and your bank details or payment link.</li>
</ul>

<h2 id="subjects">Subject lines</h2>
<blockquote>Invoice INV-2026-042 from Birch Lane Studio, due 23 October<br>Invoice INV-2026-042 for PO 5521: September retainer<br>Deposit invoice INV-2026-043: kitchen refit, 3 Elm Road<br>Reminder: invoice INV-2026-042 due Friday 23 October<br>Overdue: invoice INV-2026-042, due 23 October</blockquote>

<h2 id="templates">Email templates</h2>
<p>Replace the bracketed parts. Names and figures are made up.</p>
<div class="mail"><div class="mail-h">1. Sending a new invoice</div><div class="mail-b">Subject: Invoice [INV-2026-042] from [Birch Lane Studio], due [23 October]<br><br>Hi [Sam],<br><br>Please find attached invoice [INV-2026-042] for [the September content retainer], [&pound;2,400.00].<br><br>Payment is due by [23 October 2026] by bank transfer; the details are on the invoice.<br><br>Thanks,<br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">2. Deposit invoice</div><div class="mail-b">Subject: Deposit invoice [INV-2026-043]: [project]<br><br>Hi [Sam],<br><br>Thanks for accepting the quote. Attached is the [25%] deposit invoice, [&pound;1,110.00], which confirms your start date of [3 November].<br><br>The balance will be invoiced on completion.<br><br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">3. Stage or milestone invoice</div><div class="mail-b">Subject: Invoice [INV-2026-051]: stage [2 of 4], [project]<br><br>Hi [Sam],<br><br>Stage [2], [design sign-off], is complete. Attached is invoice [INV-2026-051] for [&pound;3,000.00], due [6 November].<br><br>Invoiced so far: [&pound;6,000.00] of [&pound;12,000.00].<br><br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">4. Monthly retainer</div><div class="mail-b">Subject: [October] retainer invoice [INV-2026-060]<br><br>Hi [Sam],<br><br>Here is the invoice for [October]: [20 hours] of support, [&pound;1,600.00], due [14 November]. A summary of the work is on page 2.<br><br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">5. Sending a copy again</div><div class="mail-b">Subject: Copy of invoice [INV-2026-042], due [23 October]<br><br>Hi [Sam],<br><br>As requested, here is invoice [INV-2026-042] again. Nothing has changed: [&pound;2,400.00], due [23 October]. Please let me know if it should go to a different address.<br><br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">6. Reminder a few days before the due date</div><div class="mail-b">Subject: Reminder: invoice [INV-2026-042] due [Friday 23 October]<br><br>Hi [Sam],<br><br>A quick reminder that invoice [INV-2026-042], [&pound;2,400.00], is due on [Friday]. I have attached it again for convenience.<br><br>Thanks,<br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">7. Seven days overdue</div><div class="mail-b">Subject: Overdue: invoice [INV-2026-042], due [23 October]<br><br>Hi [Sam],<br><br>Invoice [INV-2026-042] for [&pound;2,400.00] was due on [23 October] and is now [7] days overdue. Could you let me know when payment is scheduled? If it has already been sent, please ignore this.<br><br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">8. Final reminder before charging interest (business clients, UK and Ireland)</div><div class="mail-b">Subject: Final reminder: invoice [INV-2026-042], [30] days overdue<br><br>Dear [Sam],<br><br>Invoice [INV-2026-042] for [&pound;2,400.00] is now [30] days overdue. Unless it is paid by [date], I will add statutory interest and the fixed compensation that the late payment law allows on business debts.<br><br>Kind regards,<br>[Alex]<br></div></div>
<div class="mail"><div class="mail-h">9. Payment received</div><div class="mail-b">Subject: Payment received: invoice [INV-2026-042]<br><br>Hi [Sam],<br><br>Thank you, I have received [&pound;2,400.00] for invoice [INV-2026-042]. It is now marked as paid.<br><br>[Alex]<br></div></div>
<p>Template 8 is for business customers only. Work out the amounts with the <a href="/late-payment-interest-calculator">late payment interest calculator</a>: in the UK, statutory interest is 8% plus the Bank of England base rate, and the fixed sum is &pound;40, &pound;70 or &pound;100 depending on the debt (<a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt" rel="noopener">GOV.UK</a>).</p>

<h2 id="schedule">A reminder schedule</h2>
<table><thead><tr><th>When</th><th>What to send</th></tr></thead><tbody>
<tr><td>On the day the work is delivered</td><td>Template 1, 2, 3 or 4</td></tr>
<tr><td>3 days before the due date</td><td>Template 6</td></tr>
<tr><td>7 days after the due date</td><td>Template 7, and a phone call if you have a contact</td></tr>
<tr><td>30 days after the due date</td><td>Template 8</td></tr>
<tr><td>When paid</td><td>Template 9</td></tr>
</tbody></table>

<h2 id="portals">When the client uses a supplier portal</h2>
<p>Some larger companies take invoices only through a supplier portal or a procurement system rather than by email. Ask during onboarding, register before you invoice, and quote their purchase order number exactly, because an invoice that doesn&rsquo;t match the order is often rejected without anyone telling you.</p>
<p>The <a href="/">invoice generator</a> makes the PDF to attach. For what goes on the invoice itself, see <a href="/blog/how-to-write-a-professional-invoice">how to write a professional invoice</a>.</p>`,
    faq: [
      {"q":"Should I send an invoice as a PDF?","a":"Yes. A PDF looks the same on every device and can’t be changed by accident. Name the file with the invoice number and your business name."},
      {"q":"What should the subject line of an invoice email say?","a":"The invoice number, your business name and the due date, for example \"Invoice INV-2026-042 from Birch Lane Studio, due 23 October\". Accounts teams search their inboxes by invoice number."},
      {"q":"Who should I send an invoice to?","a":"The person or address that approves payment, which is often an accounts payable inbox rather than your project contact. Copy your contact so they can approve it."},
      {"q":"When should I send a payment reminder?","a":"A few days before the due date, then about a week after it, then a final reminder at around 30 days before you add any late payment interest."}
    ]
  },
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-calculate-vat-on-invoice': {
    steps: ["Start from the price before VAT for each line","Multiply by the VAT rate: 20%, 5% or 0% in the UK","Round the VAT the same way on every invoice","Show the total before VAT, the VAT and the total","Take VAT out of a VAT-inclusive price with the VAT fraction"],
    script: '/js/vat-calc.js',
    body: `
<div class="answer"><p><strong>The formula:</strong> VAT = price before VAT &times; rate, and total = price before VAT + VAT. To take VAT out of a price that includes it, multiply by the VAT fraction, rate &divide; (100 + rate): one sixth at 20% and one twenty-first at 5% (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#vat-fractions" rel="noopener">VAT Notice 700, 7.3.1</a>).</p></div>
<h2 id="calculator">VAT calculator</h2>
<div class="vcalc" id="vcalc">
<div class="vc-grid">
<label>Amount<input type="number" id="vcAmt" value="1250" min="0" step="any" inputmode="decimal"></label>
<label>VAT rate (%)<select id="vcRate"><option value="20">20% standard</option><option value="5">5% reduced</option><option value="0">0% zero</option><option value="custom">Other rate</option></select></label>
<label id="vcCustomWrap" hidden>Other rate (%)<input type="number" id="vcCustom" value="10" min="0" max="100" step="any" inputmode="decimal"></label>
<label>The amount is<select id="vcMode"><option value="add">before VAT</option><option value="remove">including VAT</option></select></label>
</div>
<table class="vc-out" aria-live="polite"><tbody>
<tr><td>Price before VAT</td><td class="num" id="vcoNet"></td></tr>
<tr><td id="vcoVatLabel">VAT</td><td class="num" id="vcoVat"></td></tr>
<tr class="tot"><td>Total including VAT</td><td class="num" id="vcoGross"></td></tr>
</tbody></table>
<p class="vc-how" id="vcoHow"></p>
<noscript><p class="vc-how">The calculator needs JavaScript. Example: &pound;1,250 before VAT at 20% is &pound;250 VAT, &pound;1,500 in total.</p></noscript>
</div>

<h2 id="formulas">The two calculations</h2>
<p><strong>Adding VAT:</strong> &pound;1,250.00 before VAT &times; 20% = &pound;250.00 VAT, so the total is &pound;1,500.00.</p>
<p><strong>Taking VAT out:</strong> &pound;1,500.00 including VAT &times; 1/6 = &pound;250.00 VAT, so the price before VAT is &pound;1,250.00. Taking 20% off the total (&pound;300) is the most common mistake: 20% of a VAT-inclusive price is more than the VAT in it.</p>
<table><thead><tr><th>VAT rate</th><th>VAT fraction (VAT in a VAT-inclusive price)</th><th>Divide the total by</th></tr></thead><tbody>
<tr><td>20%</td><td>1/6</td><td>1.20</td></tr>
<tr><td>5%</td><td>1/21</td><td>1.05</td></tr>
<tr><td>21% (Netherlands)</td><td>21/121</td><td>1.21</td></tr>
</tbody></table>
<p class="src">UK fractions from <a href="https://www.gov.uk/guidance/vat-guide-notice-700#vat-fractions" rel="noopener">VAT Notice 700, 7.3.1</a>; the 21% row uses HMRC&rsquo;s method, rate &divide; (100 + rate).</p>

<h2 id="rounding">Line by line or on the total: rounding</h2>
<p>HMRC lets invoice traders round the total VAT on an invoice down to a whole penny. If you work VAT out line by line, round each line either down to the nearest 0.1p or to the nearest 1p or 0.5p, and use the same method every time (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#calculation-of-vat-on-invoices--rounding-of-amounts" rel="noopener">VAT Notice 700, 17.5</a>). The methods can differ by a penny or two. Three lines of &pound;33.33 at 20%:</p>
<table><thead><tr><th>Method</th><th>Working</th><th class="num">VAT</th></tr></thead><tbody>
<tr><td>Each line to the nearest penny</td><td>&pound;6.666 rounds to &pound;6.67, three times</td><td class="num">&pound;20.01</td></tr>
<tr><td>On the total, rounded down</td><td>&pound;99.99 &times; 20% = &pound;19.998, rounded down</td><td class="num">&pound;19.99</td></tr>
</tbody></table>
<p>Both are allowed. Pick one and keep to it so your invoices and your VAT return agree.</p>

<h2 id="mixed">Different rates on one invoice</h2>
<p>Show the VAT rate against each line and the VAT for each rate. Zero-rated or exempt lines must show clearly that no VAT is due and have their own total (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#invoicing-zero-rated-or-exempt-supplies" rel="noopener">VAT Notice 700, 16.5</a>). Example for a home: loft insulation installed, &pound;900 at 0% (energy-saving materials are zero-rated until 31 March 2027 under VAT Notice 708/6), plus repairs to the loft hatch, &pound;150 at 20% = &pound;30 VAT. Total &pound;1,080.</p>

<h2 id="discounts">Discounts</h2>
<ul>
<li><strong>A discount everyone gets:</strong> VAT is worked out on the discounted price.</li>
<li><strong>A discount for paying early:</strong> VAT is due on the amount actually paid. If you don&rsquo;t issue a credit note when it is taken, the invoice must show the discount terms and say the customer can only recover the VAT actually paid (<a href="https://www.gov.uk/guidance/vat-guide-notice-700#discounts" rel="noopener">VAT Notice 700, 7.3.2</a> and <a href="https://www.gov.uk/guidance/vat-guide-notice-700#prompt-discount" rel="noopener">18.2.2</a>).</li>
</ul>
<p>Other countries use the same arithmetic with their own rates: <a href="/free-invoice-generator-netherlands">Dutch BTW</a>, <a href="/how-to-calculate-gst-on-canadian-invoices">Canadian GST and HST</a>, <a href="/free-invoice-generator-australia">Australian GST</a>. The <a href="/free-invoice-generator-uk">UK VAT invoice generator</a> does the sums for you, and <a href="/blog/what-is-vat-invoice">what a VAT invoice must show</a> lists the other details.</p>
<p class="src">Sources checked 9 October 2026: HMRC VAT Notice 700 (last updated 25 June 2026), VAT Notice 708/6.</p>`,
    faq: [
      {"q":"How do I calculate 20% VAT?","a":"Multiply the price before VAT by 0.2. £1,250 × 0.2 = £250 VAT, so the total is £1,500."},
      {"q":"How do I work out the VAT from a total that includes VAT?","a":"Divide the total by 6 at 20%, or by 21 at 5%. £1,500 ÷ 6 = £250 VAT, leaving £1,250 before VAT. Taking 20% off the total gives the wrong answer."},
      {"q":"Do I round VAT up or down?","a":"HMRC lets invoice traders round the total VAT on an invoice down to a whole penny. Line by line, you can round down to 0.1p or to the nearest 1p or 0.5p, as long as you use the same method every time."},
      {"q":"Is VAT calculated before or after a discount?","a":"After a discount everyone gets. For a discount for paying early, VAT is due on the amount actually paid."}
    ]
  },
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-write-invoice-for-cash-payment': {
    steps: ["Issue a normal numbered invoice","Mark it paid in cash with the date and amount","Give the customer a copy as their receipt","Record the cash in your books the day you receive it","Check the large-cash rules: Form 8300 over $10,000 in the US"],
    body: `
<div class="answer"><p><strong>The short answer:</strong> write the invoice exactly as you would for a bank transfer, with its own number in your normal sequence, then mark it &ldquo;Paid in cash&rdquo; with the date and the amount received. That document is the customer&rsquo;s receipt. Keep a copy and record the cash the day you take it.</p></div>
<h2 id="wording">Wording to copy</h2>
<blockquote><strong>Paid in full:</strong> PAID IN CASH: &pound;240.00 received on 9 October 2026. Thank you.</blockquote>
<blockquote><strong>Part paid:</strong> Cash received 9 October 2026: &pound;100.00. Balance due: &pound;140.00 by 23 October 2026.</blockquote>
<blockquote><strong>Paid later than the invoice date:</strong> Invoice INV-2026-052 dated 1 October 2026, paid in cash on 9 October 2026. Balance: nil.</blockquote>

<h2 id="example">Example</h2>
<div class="sample">
<div class="sample-h"><span><b>INVOICE</b> INV-2026-052</span><span>9 October 2026</span></div>
<div class="sample-p"><p><strong>From</strong> Ash Gardens, Park Lane, York</p><p><strong>To</strong> Mrs P. Jones, Church Street, York</p></div>
<table><tbody>
<tr><td>Hedge cutting and green waste removal, 9 October 2026</td><td class="num">&pound;240.00</td></tr>
<tr class="tot"><td>Total</td><td class="num">&pound;240.00</td></tr>
</tbody></table>
<div class="sample-f"><p><strong>PAID IN CASH</strong> &pound;240.00 on 9 October 2026. Thank you.</p></div>
</div>
<p>Names and figures are made up. The same layout works if the invoice was sent first and the cash came later: keep the original number and date, and add the payment line.</p>

<h2 id="records">Records the tax authorities expect</h2>
<ul>
<li><strong>UK:</strong> self-employed people must keep records of all sales and income; proof includes sales invoices, till rolls and bank slips. Keep them for at least 5 years after the 31 January deadline for the tax year (<a href="https://www.gov.uk/self-employed-records/what-records-to-keep" rel="noopener">GOV.UK: what records to keep</a>, <a href="https://www.gov.uk/self-employed-records/how-long-to-keep-your-records" rel="noopener">how long</a>). VAT-registered businesses keep VAT records for at least 6 years (<a href="https://www.gov.uk/guidance/record-keeping-for-vat-notice-70021" rel="noopener">VAT Notice 700/21</a>).</li>
<li><strong>US:</strong> invoices and receipt books are among the documents the IRS lists as showing gross receipts; keep them until the period of limitations for the return runs out, generally 3 years (<a href="https://www.irs.gov/publications/p583" rel="noopener">IRS Publication 583</a>).</li>
</ul>
<p>Bank cash regularly and keep a simple log (date, invoice number, customer, amount), so your deposits match your invoices.</p>

<h2 id="large">Large cash payments</h2>
<ul>
<li><strong>US, over $10,000:</strong> a business that receives more than $10,000 in cash in one transaction, or in related transactions, must file Form 8300 within 15 days and give the payer a written statement by 31 January of the following year. The IRS says the invoice can serve as that statement if it includes the required information: your business name and address, a contact name and phone number, the total reportable cash received in the 12-month period, and a line saying the information is being furnished to the IRS (<a href="https://www.irs.gov/businesses/small-businesses-self-employed/irs-form-8300-reference-guide" rel="noopener">IRS Form 8300 reference guide</a>).</li>
<li><strong>UK:</strong> if customers pay you in large amounts of cash, your business may need to be registered for an anti-money laundering scheme (<a href="https://www.gov.uk/invoicing-and-taking-payment-from-customers/payment-obligations" rel="noopener">GOV.UK</a>).</li>
</ul>

<h2 id="mistakes">Mistakes with cash invoices</h2>
<ul>
<li>Leaving cash jobs out of the invoice sequence. Gaps are the first thing anyone checking your records asks about.</li>
<li>Giving a new number when you mark an invoice paid. The paid copy keeps the original number.</li>
<li>Writing &ldquo;paid&rdquo; without the date and amount, so it can&rsquo;t serve as a receipt.</li>
</ul>
<p>Make the invoice in the <a href="/">invoice generator</a> and put the paid-in-cash line in the notes. A separate receipt instead? See <a href="/blog/invoice-vs-receipt">invoice vs receipt</a>.</p>
<p class="src">Sources checked 9 October 2026: GOV.UK self-employed records and payment obligations, HMRC VAT Notice 700/21, IRS Publication 583 and Form 8300 reference guide.</p>`,
    faq: [
      {"q":"Do I need an invoice if the customer paid cash?","a":"Yes, as a record of the sale. Mark it paid in cash with the date and amount; the customer’s copy is their receipt."},
      {"q":"What do I write on an invoice paid in cash?","a":"\"Paid in cash\" with the amount and the date it was received, for example: \"PAID IN CASH: £240.00 received on 9 October 2026.\""},
      {"q":"Is a cash invoice the same as a receipt?","a":"An invoice marked paid, with the date, amount and method, works as a receipt. A separate receipt is also fine; keep the invoice number on it."}
    ]
  },
  // Rewritten 9 Oct 2026 for indexing.
  'how-to-charge-late-payment-fee': {
    steps: ["Agree the late-payment terms before work starts","Repeat them in the payment terms on every invoice","Send a reminder before you charge anything","Work out the fee or interest from the due date","Invoice the late charge separately"],
    body: `
<div class="answer"><p><strong>The short answer:</strong> a late charge holds up when it was agreed before the work, appears on the invoice and stays within the law where your client is. For business customers in the UK you don&rsquo;t even need a clause: unless your contract sets a different rate, you can claim statutory interest of 8% plus the Bank of England base rate and a fixed &pound;40, &pound;70 or &pound;100, by sending a new invoice for it (<a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt" rel="noopener">GOV.UK</a>).</p></div>
<h2 id="wording">Wording to copy</h2>
<blockquote><strong>In your contract or quote (own rate):</strong> Invoices are due within 14 days. Amounts unpaid after the due date carry interest at 1.5% per month (18% per year) until paid.</blockquote>
<blockquote><strong>In your contract (UK business clients, statutory rate):</strong> If payment is late we may claim interest and compensation under the Late Payment of Commercial Debts (Interest) Act 1998.</blockquote>
<blockquote><strong>On the invoice:</strong> Payment due 23 October 2026. Late payments carry interest as set out in our terms.</blockquote>
<blockquote><strong>On the late-charge invoice:</strong> Interest on invoice INV-2026-042 (&pound;2,400.00, due 23 October 2026) for 30 days at 11.75% a year: &pound;23.18. Fixed compensation: &pound;70.00.</blockquote>
<p>Check: &pound;2,400 &times; 11.75% &divide; 365 &times; 30 = &pound;23.18. The 11.75% is 8% over a 3.75% base rate; use the rate that applies to your dates.</p>

<h2 id="rules">The legal rules</h2>
<table class="stack"><thead><tr><th>Where</th><th>Rule</th><th>Source</th></tr></thead><tbody>
<tr><td data-label="Where">UK, business customers</td><td data-label="Rule">Statutory interest of 8% plus the Bank of England base rate, unless your contract sets a different rate; a fixed sum of &pound;40 (debts up to &pound;999.99), &pound;70 (&pound;1,000 to &pound;9,999.99) or &pound;100 (&pound;10,000 or more), once per invoice; and reasonable recovery costs. Send a new invoice to add interest.</td><td data-label="Source"><a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt" rel="noopener">GOV.UK: interest</a>, <a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/claim-debt-recovery-costs" rel="noopener">recovery costs</a></td></tr>
<tr><td data-label="Where">EU and Ireland, business customers</td><td data-label="Rule">Interest under the Late Payment Directive and a fixed compensation of at least &euro;40 once interest is due. Irish rates and amounts are worked out in the <a href="/late-payment-interest-calculator">calculator</a>.</td><td data-label="Source"><a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007" rel="noopener">Directive 2011/7/EU, art. 6</a></td></tr>
<tr><td data-label="Where">Canada</td><td data-label="Rule">If a written contract states interest per day, week or month without also stating the equivalent yearly rate, no more than 5% a year can be charged. Write &ldquo;1.5% per month (18% per year)&rdquo;, not &ldquo;1.5% per month&rdquo;.</td><td data-label="Source"><a href="https://laws-lois.justice.gc.ca/eng/acts/I-15/section-4.html" rel="noopener">Interest Act, s. 4</a></td></tr>
<tr><td data-label="Where">US</td><td data-label="Rule">Limits on interest and late fees are set by each state, so check your state&rsquo;s rules before choosing a rate or a flat fee.</td><td data-label="Source">Your state&rsquo;s law</td></tr>
</tbody></table>
<p>The UK statutory scheme applies to late payments between businesses. Charges to consumers depend on what they agreed and on consumer law, so keep them modest and spelled out before any work starts.</p>

<h2 id="calc">Working out the charge</h2>
<ul>
<li><strong>Monthly rate:</strong> $2,000 overdue at 1.5% a month for 2 months = $2,000 &times; 0.015 &times; 2 = $60.</li>
<li><strong>Daily statutory interest (UK):</strong> debt &times; (8% + base rate) &divide; 365 &times; days late. GOV.UK&rsquo;s worked example: &pound;1,000 at 8.5% is &pound;85 a year, 23p a day, &pound;11.50 after 50 days (<a href="https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt" rel="noopener">GOV.UK</a>).</li>
<li><strong>Flat fee:</strong> simple to explain, but agree the amount in advance like any other charge.</li>
</ul>
<p>For UK and Irish business debts, the <a href="/late-payment-interest-calculator">late payment interest calculator</a> picks the right base rate for your dates and writes the lines for the invoice.</p>

<h2 id="first">Remind before you charge</h2>
<p>Send a reminder a few days before the due date and another a week after it, then a final reminder naming the date you will add the charge (<a href="/how-to-send-an-invoice#templates">reminder emails to copy</a>). A late payment is often a process problem, such as a missing purchase order or the wrong inbox, and a reminder fixes that faster than a fee.</p>
<p class="src">Sources checked 9 October 2026: GOV.UK late commercial payments, Directive 2011/7/EU, Interest Act (Canada) s. 4 (current to 21 September 2026).</p>`,
    faq: [
      {"q":"Can I charge a late payment fee without a contract?","a":"For UK business customers, yes: statutory interest and fixed compensation apply when no other rate has been agreed. Elsewhere, and for consumers, a late fee generally needs to be agreed before the work starts."},
      {"q":"How much can I charge for late payment in the UK?","a":"Between businesses, statutory interest of 8% plus the Bank of England base rate a year, plus a fixed £40, £70 or £100 depending on the size of the debt, and reasonable recovery costs, unless your contract sets a different rate."},
      {"q":"Do I add the late fee to the original invoice?","a":"Send a new invoice for the interest or fee and reference the original invoice number and due date. GOV.UK says to send a new invoice if you decide to add interest."}
    ]
  },
};

module.exports = { BLOG_CONTENT, HOWTO_CONTENT };
