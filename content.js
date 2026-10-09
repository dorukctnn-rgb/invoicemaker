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
<li><strong>Remind on a schedule.</strong> A short note a few days before the due date, another on the day, and a firmer one about a week after. Send the same way every time so nothing depends on memory (<a href="/blog/how-to-write-invoice-email">invoice and reminder emails to copy</a>).</li>
<li><strong>Keep one line per invoice.</strong> A spreadsheet with the invoice number, client, amount, issue date, due date and paid date is enough. Sort by due date once a week and the slow payers show up long before they become a cash-flow problem.</li>
<li><strong>Know your late-payment rights.</strong> When a business customer in the UK or Ireland pays late, the law lets you add interest and a fixed compensation sum. Work out both with the <a href="/late-payment-interest-calculator">late payment interest calculator</a>, and read <a href="/how-to-charge-late-payment-fee">how to charge a late payment fee</a> for the wording.</li>
</ol>
<p>You can build an invoice with all of these fields in our <a href="/">free invoice generator</a>. The live preview shows exactly what the PDF will look like before you download it.</p>`,

  'invoice-payment-terms-guide': `
<p>Payment terms are the part of an invoice that says when and how you expect to be paid. Clear terms are the cheapest way to shorten the time between finishing work and seeing the money.</p>
<h2>Common payment terms and what they mean</h2>
<table><thead><tr><th>Term</th><th>Meaning</th></tr></thead><tbody>
<tr><td>Due on receipt</td><td>Payment is expected as soon as the invoice arrives.</td></tr>
<tr><td>Net 7 / Net 14</td><td>Payment due 7 or 14 days after the invoice date. Common for freelancers.</td></tr>
<tr><td>Net 30</td><td>Payment due 30 days after the invoice date. Standard for many businesses.</td></tr>
<tr><td>Net 60 / Net 90</td><td>Long terms, usually demanded by large corporate buyers.</td></tr>
<tr><td>2/10 Net 30</td><td>A 2% discount if paid within 10 days, otherwise the full amount is due in 30.</td></tr>
<tr><td>EOM</td><td>Due at the end of the month in which the invoice is issued.</td></tr>
<tr><td>50% upfront</td><td>Half before work starts, the balance on delivery. Common for projects.</td></tr>
</tbody></table>
<h2>How to choose your terms</h2>
<p>Match the terms to your cash flow and to the client. A freelancer with one or two clients rarely benefits from Net 60. Short terms such as Net 14 are reasonable for small jobs. For large projects, split the fee into milestones so you are never owed more than you can afford to lose.</p>
<p>Always write the actual due date on the invoice next to the term, for example "Net 14 (due 8 October 2026)". Many people do not count days, but they do read dates.</p>
<h2>Late payment</h2>
<p>If you plan to charge late fees, say so in your contract and on the invoice before the work starts. Some countries set statutory rights: in the UK, businesses can claim interest at 8% above the Bank of England base rate on late commercial payments (work out the exact figure with the <a href="/late-payment-interest-calculator">late payment interest calculator</a>), and EU rules (Directive 2011/7/EU) set a 30-day default payment period for business-to-business invoices when the contract is silent, with contract terms beyond 60 days allowed only if expressly agreed and not grossly unfair. See our guide on <a href="/how-to-charge-late-payment-fee">how to charge a late payment fee</a>.</p>`,

  'what-is-vat-invoice': `
<p>A VAT invoice is an invoice issued by a business registered for Value Added Tax. It carries the details a VAT-registered customer needs to reclaim the VAT they paid. If you are not VAT registered, you must not show VAT on your invoices.</p>
<h2>What a full UK VAT invoice must include</h2>
<ul>
<li>A unique, sequential invoice number</li>
<li>Your business name and address and your VAT registration number</li>
<li>The invoice date and, if different, the time of supply (tax point)</li>
<li>The customer's name or trading name and address</li>
<li>A description of the goods or services</li>
<li>For each item: the quantity, unit price excluding VAT and the VAT rate</li>
<li>The total amount excluding VAT, the total VAT and the total including VAT</li>
<li>Any discount given</li>
</ul>
<p>In the UK, retailers can issue a simplified VAT invoice for sales of &pound;250 or less (including VAT). It needs fewer fields but must still show your VAT number, the date, a description, the VAT rate and the total.</p>
<h2>Common VAT rates</h2>
<table><thead><tr><th>Country</th><th>Standard rate</th><th>Name</th></tr></thead><tbody>
<tr><td>United Kingdom</td><td>20%</td><td>VAT</td></tr>
<tr><td>Netherlands</td><td>21%</td><td>BTW</td></tr>
<tr><td>Germany</td><td>19%</td><td>MwSt / USt</td></tr>
<tr><td>France</td><td>20%</td><td>TVA</td></tr>
<tr><td>UAE</td><td>5%</td><td>VAT</td></tr>
</tbody></table>
<p>Reduced and zero rates apply to specific goods and services in each country. Check your tax authority's guidance for your category.</p>
<h2>Cross-border B2B invoices</h2>
<p>When you invoice a VAT-registered business in another EU country, the reverse-charge mechanism often applies. You charge 0% and write "Reverse charge" on the invoice along with both parties' VAT numbers.</p>
<p>Create one in our <a href="/free-invoice-generator-uk">UK VAT invoice generator</a> or the <a href="/free-invoice-generator-netherlands">Dutch BTW invoice template</a>.</p>`,

  'invoice-vs-receipt': `
<p>An invoice asks for payment and a receipt confirms that payment was made. They often contain similar details, which is why they get confused. They sit at opposite ends of the transaction.</p>
<table><thead><tr><th></th><th>Invoice</th><th>Receipt</th></tr></thead><tbody>
<tr><td>When it is issued</td><td>Before payment (after goods or services are delivered)</td><td>After payment is received</td></tr>
<tr><td>Purpose</td><td>Requests payment and sets terms</td><td>Proves payment was made</td></tr>
<tr><td>Key fields</td><td>Due date, payment terms, bank details</td><td>Payment date, amount paid, payment method</td></tr>
<tr><td>Accounting</td><td>Creates an account receivable for the seller</td><td>Closes the receivable</td></tr>
</tbody></table>
<h2>Do you need both?</h2>
<p>For most business-to-business work, the invoice is the key document, and the bank transfer itself records the payment. Many clients still ask for a receipt, especially when paying cash or when they need proof for expenses. Landlords are often asked for rent receipts by tenants who need proof of payment.</p>
<h2>Can an invoice become a receipt?</h2>
<p>Yes. Many businesses mark a paid invoice "PAID" with the payment date and method, and send it back as a receipt. It is best to make the status obvious so nobody pays twice.</p>
<p>Need one now? Use the <a href="/">free invoice generator</a> or the <a href="/rent-receipt-generator">rent receipt generator</a>.</p>`,

  'how-to-write-invoice-email': `
<p>The email that carries your invoice matters almost as much as the invoice itself. A clear subject line and a two-line body make it easy to forward to accounts payable and hard to ignore.</p>
<h2>Subject line</h2>
<p>Put the invoice number, your business name and the due date in the subject: <em>Invoice INV-2026-042 from Acme Studio, due 14 October</em>. Accounts teams search their inboxes by invoice number.</p>
<h2>Template: sending a new invoice</h2>
<blockquote>Hi Sam,<br><br>Please find attached invoice INV-2026-042 for the September content retainer, totalling $2,400.<br><br>Payment is due by 14 October 2026 by bank transfer. The details are on the invoice.<br><br>Thanks,<br>Alex</blockquote>
<h2>Template: friendly reminder (a few days before the due date)</h2>
<blockquote>Hi Sam,<br><br>A quick reminder that invoice INV-2026-042 ($2,400) is due on Friday 14 October. I've attached it again for convenience.<br><br>Thanks,<br>Alex</blockquote>
<h2>Template: overdue invoice</h2>
<blockquote>Hi Sam,<br><br>Invoice INV-2026-042 for $2,400 was due on 14 October and is now 7 days overdue. Could you let me know when payment is scheduled? If it's already been sent, please ignore this note.<br><br>Thanks,<br>Alex</blockquote>
<p>Selling to another business in the UK or Ireland? The law lets you add statutory interest and a fixed compensation sum to a late invoice. The <a href="/late-payment-interest-calculator">late payment interest calculator</a> works out both and writes the paragraph to paste into this email.</p>
<h2>Tips</h2>
<ul>
<li>Attach a PDF rather than a Word or image file.</li>
<li>Address the person who approves payment and copy your project contact.</li>
<li>Restate the amount and due date in the email body so they are visible without opening the attachment.</li>
<li>Stay polite and factual in reminders. Most late payments are process problems, not refusals.</li>
</ul>
<p>Create the PDF in the <a href="/">invoice generator</a>, then use the templates above.</p>`,

  'invoice-number-format': `
<p>An invoice number is a unique reference that you, your client and any tax authority can use to find a specific invoice. Most tax systems require invoice numbers to be unique and to follow a sequence you can explain.</p>
<h2>Four formats that work</h2>
<table><thead><tr><th>Format</th><th>Example</th><th>Best for</th></tr></thead><tbody>
<tr><td>Simple sequence</td><td>0001, 0002, 0003</td><td>New freelancers with few invoices</td></tr>
<tr><td>Year + sequence</td><td>2026-001, 2026-002</td><td>Most small businesses; easy to sort by year</td></tr>
<tr><td>Prefix + year + sequence</td><td>INV-2026-014</td><td>Businesses that also number quotes (Q-2026-014)</td></tr>
<tr><td>Client code + sequence</td><td>ACME-007</td><td>Agencies with a few long-term clients</td></tr>
</tbody></table>
<h2>Rules to follow</h2>
<ul>
<li><strong>Never reuse a number,</strong> even if an invoice is cancelled. Issue a credit note instead.</li>
<li><strong>Do not skip numbers without a reason.</strong> Gaps can prompt questions in an audit.</li>
<li><strong>Keep one sequence per business,</strong> not one per client, unless your accountant says otherwise.</li>
<li><strong>Pad numbers</strong> (001, not 1) so files sort correctly.</li>
</ul>
<h2>Starting numbers</h2>
<p>You do not have to start at 1. Many businesses start at 100 or 1001 so a first client does not see "Invoice #1". That is fine as long as you continue sequentially from there.</p>
<p>Our <a href="/">invoice generator</a> lets you set any number format and shows it in the live preview.</p>`,

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
<li>For US clients: they may ask you for Form W-8BEN (individuals) or W-8BEN-E (companies), which a foreign person gives to the payer when asked (<a href="https://www.irs.gov/forms-pubs/about-form-w-8-ben" rel="noopener">IRS</a>). The UK side of that is in <a href="/how-to-invoice-us-clients-from-uk">how to invoice US clients from the UK</a>.</li>
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
  'how-to-invoice-as-a-freelancer': {
    steps: ['Agree scope, rate and terms in writing', 'Register or check your tax status', 'Create a numbered invoice with specific line items', 'Add payment details and a due date', 'Send it as a PDF and track payment'],
    body: `
<p>Freelancers do not need accounting software to invoice professionally. You need a clear agreement, a consistent invoice format and a habit of sending invoices on time.</p>
<h2>1. Agree the basics before you start</h2>
<p>Write down the scope, your rate (hourly, daily or fixed), the payment terms and any deposit. An email the client replies "agreed" to is better than nothing. That agreement is what your invoice refers back to.</p>
<h2>2. Check your tax status</h2>
<p>You can invoice as a sole trader under your own name in most countries. You only add sales tax if you are registered: UK VAT above the registration threshold, Canadian GST/HST above $30,000 in four consecutive quarters, Australian GST above A$75,000. If you are not registered, do not show tax.</p>
<h2>3. Build the invoice</h2>
<ul>
<li>Your name (or trading name), address and email</li>
<li>The client's company name and billing address</li>
<li>An invoice number such as INV-2026-001</li>
<li>Issue date and due date</li>
<li>Line items: "Blog articles, 4 &times; 1,500 words at $250" rather than "Writing"</li>
<li>Subtotal, tax if registered, and total</li>
</ul>
<h2>4. Tell them how to pay</h2>
<p>Add bank details or a payment link, and state who pays transfer fees for international clients.</p>
<h2>5. Send and follow up</h2>
<p>Email the PDF to the person who approves payment, with the amount and due date in the message. Set a reminder for the due date. Our <a href="/blog/how-to-write-invoice-email">invoice email templates</a> cover first sends and reminders.</p>
<p>See also our <a href="/invoice-template-freelancer">freelancer invoice template</a>.</p>`
  },
  'how-to-make-an-invoice-in-word': {
    steps: ['Open a blank document or an invoice template', 'Add a header with your details and "Invoice"', 'Insert a table for line items', 'Calculate totals and tax', 'Save as PDF before sending'],
    body: `
<p>Microsoft Word can produce a perfectly good invoice. The catch is that Word does not calculate totals or keep your numbering, so small mistakes creep in. Here is how to do it properly, and when an online generator is faster.</p>
<h2>Step by step in Word</h2>
<ol>
<li><strong>Start from a template.</strong> Open the File menu, choose New and search "invoice". Pick a simple layout with space for a logo, your details and a line-item table.</li>
<li><strong>Fill in the header:</strong> your business name, address, email, tax number if registered, and the word "Invoice".</li>
<li><strong>Add invoice details:</strong> invoice number, issue date, due date, and the client's name and address.</li>
<li><strong>Complete the table:</strong> description, quantity, rate and amount. Word tables can sum a column with the Formula command on the Layout tab (<code>=SUM(ABOVE)</code>), but the formula does not update automatically. Press F9 after every change.</li>
<li><strong>Add tax and total</strong> as separate rows. Double-check the arithmetic.</li>
<li><strong>Export to PDF</strong> with File, Save As, and choose PDF as the type. Never send an editable .docx invoice.</li>
</ol>
<h2>Where Word invoices go wrong</h2>
<ul>
<li>Totals that were not recalculated after a quantity changed</li>
<li>Duplicate invoice numbers after copying last month's file</li>
<li>Formatting that shifts when the client opens the file</li>
</ul>
<h2>The faster alternative</h2>
<p>An online generator does the arithmetic and exports a PDF. In our <a href="/">free invoice generator</a> you type your line items, pick a currency and tax rate, and download the PDF. It needs no template file and no formulas.</p>`
  },
  'how-to-send-an-invoice': {
    steps: ['Export the invoice as a PDF', 'Find the right recipient', 'Write a clear subject line', 'Restate amount and due date in the email', 'Schedule reminders'],
    body: `
<p>How you send an invoice decides how quickly it enters your client's payment process. The goal is to get the invoice to the person who pays, in a format they can file, with nothing left to ask.</p>
<h2>1. Use PDF</h2>
<p>PDFs look the same on every device and cannot be edited by accident. Name the file clearly, for example <code>INV-2026-042_AcmeStudio.pdf</code>.</p>
<h2>2. Send it to accounts payable</h2>
<p>Your project contact is often not the person who releases payment. Ask once, "Who should invoices go to, and do you need a PO number?", and save the answer.</p>
<h2>3. Write a searchable subject line</h2>
<p><em>Invoice INV-2026-042 from Acme Studio, due 14 Oct</em>. Finance teams search by invoice number and supplier name.</p>
<h2>4. Keep the email short</h2>
<p>State what the invoice is for, the total, the due date and how to pay. Our <a href="/blog/how-to-write-invoice-email">invoice email templates</a> are ready to copy.</p>
<h2>5. Other ways to send</h2>
<ul>
<li><strong>Client portals</strong> such as Coupa or Ariba: some companies require you to upload invoices there instead of emailing them.</li>
<li><strong>Post:</strong> still expected by a few organisations. Keep proof of postage.</li>
<li><strong>Payment links:</strong> add one inside the PDF or email so the client can pay by card immediately.</li>
</ul>
<h2>6. Follow up on a schedule</h2>
<p>Send a reminder a few days before the due date and another on the day it becomes overdue. Consistent reminders get invoices paid faster than irregular ones.</p>`
  },
  'how-to-calculate-vat-on-invoice': {
    steps: ['Find the net amount for each line', 'Apply the correct VAT rate', 'Round VAT sensibly', 'Show net, VAT and gross totals', 'Reverse-calculate when prices include VAT'],
    body: `
<p>VAT on an invoice is calculated on the net price, before VAT, and shown as its own line. The formula is simple. Most errors come from the wrong rate or from working backwards from a VAT-inclusive price.</p>
<h2>The formula</h2>
<p><strong>VAT = net amount &times; VAT rate</strong><br><strong>Gross total = net amount + VAT</strong></p>
<p>Example at the UK standard rate of 20%: net &pound;1,250.00 &times; 0.20 = VAT &pound;250.00, so the gross total is &pound;1,500.00.</p>
<h2>Working backwards from a VAT-inclusive price</h2>
<p><strong>Net = gross &divide; (1 + rate)</strong>. For &pound;1,500 including 20% VAT: &pound;1,500 &divide; 1.20 = &pound;1,250 net, so the VAT is &pound;250. A common mistake is to take 20% off the gross (&pound;300), which is wrong.</p>
<table><thead><tr><th>Rate</th><th>Divide gross by</th><th>VAT fraction of gross</th></tr></thead><tbody>
<tr><td>20% (UK)</td><td>1.20</td><td>1/6</td></tr>
<tr><td>21% (NL)</td><td>1.21</td><td>21/121</td></tr>
<tr><td>19% (DE)</td><td>1.19</td><td>19/119</td></tr>
<tr><td>5% (UAE)</td><td>1.05</td><td>1/21</td></tr>
</tbody></table>
<h2>Mixed rates on one invoice</h2>
<p>If different items carry different VAT rates (for example 20% and 5%), calculate VAT per rate and show a subtotal for each. Tax authorities expect the VAT amount for each rate to be identifiable.</p>
<h2>Rounding</h2>
<p>Calculate VAT to two decimal places per invoice total or per line, and use the same method consistently. Small rounding differences are normal. Inconsistent methods cause mismatches with accounting software.</p>
<p>Our <a href="/free-invoice-generator-uk">UK VAT invoice generator</a> and <a href="/free-invoice-generator-netherlands">Dutch BTW template</a> calculate VAT automatically.</p>`
  },
  'how-to-write-invoice-for-cash-payment': {
    steps: ['Issue a normal numbered invoice', 'Record the cash payment details', 'Mark the invoice as paid', 'Give the client a receipt', 'Log the cash in your records'],
    body: `
<p>Cash jobs still need proper paperwork. An invoice for a cash payment protects both sides: the client has proof of what they paid for, and you have a record for your tax return.</p>
<h2>What to include</h2>
<ul>
<li>Your name or business name and contact details</li>
<li>A unique invoice number in your normal sequence</li>
<li>The date of the job and the date of payment</li>
<li>The client's name</li>
<li>A description of the work or goods</li>
<li>The amount, and tax if you are registered</li>
<li><strong>"Paid in cash on [date]"</strong> clearly marked, or a "PAID" stamp</li>
</ul>
<h2>Paid at the time of the job</h2>
<p>If the client pays on the spot, issue the invoice already marked "Paid in cash". It then serves as both invoice and receipt. If you prefer, give a separate <a href="/rent-receipt-generator">receipt</a> as well.</p>
<h2>Paid later</h2>
<p>Send a standard invoice with a due date. When the cash arrives, give a receipt or re-issue the invoice marked paid with the payment date. Do not change the invoice number.</p>
<h2>Keep a cash log</h2>
<p>Cash income is taxable like any other income. Keep a simple log with the date, invoice number, client and amount, and bank the cash regularly so your records match your deposits.</p>
<p>Create the invoice in our <a href="/">free invoice generator</a> and add "Paid in cash on [date]" in the notes field.</p>`
  },
  'how-to-create-invoice-without-company': {
    steps: ['Invoice under your own legal name', 'Add your personal contact details', 'Include a tax ID only if you have one', 'Number invoices sequentially', 'Declare the income on your tax return'],
    body: `
<p>You do not need a registered company to send an invoice. In the UK, US, Canada, Australia and most of Europe, individuals can invoice as sole traders or self-employed people under their own name.</p>
<h2>Whose name goes on the invoice</h2>
<p>Use your legal name, for example "Jane Smith". If you trade under another name, write "Jane Smith trading as Smith Design". Some countries require the legal name alongside any trading name.</p>
<h2>What to include</h2>
<ul>
<li>Your name, address and email</li>
<li>The client's name and address</li>
<li>A unique invoice number and the date</li>
<li>A description of the work, the amount and a due date</li>
<li>Your bank details for payment</li>
</ul>
<h2>Tax numbers</h2>
<p>You only need a tax number on the invoice if you are registered for sales tax (VAT, GST/HST, BTW) or your country requires one for self-employed invoices. In the Netherlands, for example, freelancers normally register with the KVK and show their KVK and BTW numbers. US clients may ask for a Form W-9, which uses your SSN or EIN. Consider getting a free EIN from the IRS so you do not have to share your SSN.</p>
<h2>Report the income</h2>
<p>Invoiced income is taxable. In the UK you report it through Self Assessment, in the US on Schedule C, in Canada on form T2125. Keep copies of every invoice.</p>
<p>If you also sell on a marketplace, that income is reported the same way, but the figures arrive differently: Etsy, for example, gives you twelve monthly CSV statements instead of one total. The free <a href="https://peakappsstudio.com/etsy-tax-summary/" rel="noopener">Etsy tax summary</a> reads those statements in your browser and returns the year's sales, refunds and every fee Etsy charged, which is what your tax return and your accountant need.</p>
<p>Our <a href="/">invoice generator</a> works without an account, so you can create your first invoice now.</p>`
  },
  'how-to-invoice-us-clients-from-uk': {
    steps: ['Agree currency and payment method', 'Decide the VAT treatment', 'Handle the W-8BEN request', 'Add international bank details', 'Invoice in USD with clear dates'],
    body: `
<p>US companies are some of the best clients a UK freelancer can have, but the first invoice raises questions about currency, VAT and US tax forms. Here is how to handle each one.</p>
<h2>Currency</h2>
<p>Most US clients expect USD. Invoice in dollars and receive them into a USD account (for example with Wise or a bank's multi-currency account), then convert when rates suit you. Write amounts as "USD 3,000.00" to avoid confusion.</p>
<h2>VAT</h2>
<p>If you are VAT registered, services supplied to a business customer outside the UK are generally outside the scope of UK VAT under the general place-of-supply rule. You charge no VAT and add a note such as "Outside the scope of UK VAT". Some services have special rules, so confirm with your accountant for your service type.</p>
<h2>US tax forms</h2>
<p>US clients often ask foreign contractors for a <strong>Form W-8BEN</strong> (individuals) or <strong>W-8BEN-E</strong> (companies). It confirms you are not a US person, and with the UK-US tax treaty it usually means no US tax is withheld from your payment. Do not fill in a W-9, which is for US persons.</p>
<h2>Getting paid</h2>
<p>Give ACH or wire details for a USD account, or IBAN/SWIFT for your UK account. State that transfer fees are paid by the sender if that is agreed.</p>
<h2>Dates and terms</h2>
<p>The US writes dates month first, so 03/04/2026 is ambiguous. Write "4 March 2026" and state payment terms explicitly, for example "Net 30, due 3 April 2026".</p>
<p>Create a USD invoice in our <a href="/">invoice generator</a> by choosing USD in the currency menu.</p>`
  },
  'how-to-charge-late-payment-fee': {
    steps: ['Put the late-fee policy in your contract', 'Show the policy on every invoice', 'Calculate the fee accurately', 'Send an overdue reminder first', 'Issue a separate invoice for the fee'],
    body: `
<p>Late fees work best as a deterrent that is rarely used. The key is to agree them before any work starts. A fee added to an invoice without warning usually costs you the client and rarely gets paid.</p>
<h2>1. Agree it in advance</h2>
<p>Include the policy in your quote, proposal or contract: "Invoices unpaid after 30 days incur a late fee of 1.5% per month on the outstanding balance."</p>
<h2>2. Repeat it on the invoice</h2>
<p>Add a line to the payment terms, for example "Payment due within 14 days. Late payments incur interest at 1.5% per month."</p>
<h2>3. Know your legal limits</h2>
<ul>
<li><strong>UK:</strong> under the Late Payment of Commercial Debts (Interest) Act, businesses can charge statutory interest of 8% above the Bank of England base rate, plus fixed compensation of &pound;40, &pound;70 or &pound;100 depending on the debt size. The <a href="/late-payment-interest-calculator">late payment interest calculator</a> picks the right base rate from the due date and shows the working.</li>
<li><strong>US:</strong> maximum late fees and interest rates are set by state law. Keep to modest, clearly disclosed rates.</li>
<li><strong>EU:</strong> the Late Payment Directive sets statutory interest of at least 8 points above the ECB reference rate for B2B debts. In Ireland that is 10.40% a year from 1 July 2026, plus compensation of &euro;40, &euro;70 or &euro;100.</li>
</ul>
<h2>4. Calculate the fee</h2>
<p>Monthly interest example: $2,000 overdue at 1.5% per month for two months = $2,000 &times; 0.015 &times; 2 = <strong>$60</strong>. A flat fee (for example $25) is simpler but must still be agreed in advance.</p>
<h2>5. Remind first, then charge</h2>
<p>Send a friendly reminder on the due date and a firmer one after 7 days, mentioning the policy. If you do apply the fee, issue it as a new invoice referencing the original number.</p>
<p>Add your late-payment terms in the notes field of our <a href="/">invoice generator</a>.</p>`
  }
};

module.exports = { BLOG_CONTENT, HOWTO_CONTENT };
