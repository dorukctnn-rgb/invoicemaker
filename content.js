// Long-form article bodies for /blog/* and the /how-to-* guides.
// Kept out of server.js so route definitions stay readable.

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
<p>If you plan to charge late fees, say so in your contract and on the invoice before the work starts. Some countries set statutory rights: in the UK, businesses can claim interest at 8% above the Bank of England base rate on late commercial payments, and EU rules set a default 60-day limit for business-to-business payments. See our guide on <a href="/how-to-charge-late-payment-fee">how to charge a late payment fee</a>.</p>`,

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
<h2>Tips</h2>
<ul>
<li>Attach a PDF rather than a Word or image file.</li>
<li>Address the person who approves payment and copy your project contact.</li>
<li>Restate the amount and due date in the email body so they are visible without opening the attachment.</li>
<li>Stay polite and factual in reminders. Most late payments are process problems, not refusals.</li>
</ul>
<p>Create the PDF in the <a href="/">invoice generator</a>, then use the templates above.</p>`,

  'gst-invoice-guide': `
<p>Goods and Services Tax (GST) is the name several countries use for a value-added tax. The principle is the same everywhere: registered businesses add GST to their sales and reclaim the GST they pay on purchases. The invoice rules differ by country.</p>
<h2>Rates at a glance (2026)</h2>
<table><thead><tr><th>Country</th><th>Standard GST rate</th><th>Invoice name</th></tr></thead><tbody>
<tr><td>Canada</td><td>5% federal GST, or 13&ndash;15% HST, plus PST/QST in some provinces</td><td>Invoice showing GST/HST number</td></tr>
<tr><td>Australia</td><td>10%</td><td>Tax invoice</td></tr>
<tr><td>Singapore</td><td>9%</td><td>Tax invoice</td></tr>
<tr><td>India</td><td>Multiple slabs (5%, 18% and others) split into CGST/SGST or IGST</td><td>Tax invoice</td></tr>
</tbody></table>
<h2>Canada</h2>
<p>Canada charges a 5% federal GST. Five provinces use a combined Harmonized Sales Tax instead: Ontario 13%, Nova Scotia 14%, and New Brunswick, Newfoundland and Labrador and Prince Edward Island 15%. BC, Saskatchewan, Manitoba and Quebec add a separate provincial tax. The details an invoice must show depend on the amount. See the full guide: <a href="/how-to-calculate-gst-on-canadian-invoices">how to calculate GST on Canadian invoices</a>.</p>
<h2>Australia</h2>
<p>If you are registered for GST, sales of more than A$82.50 (including GST) need a tax invoice. It must show the words "Tax invoice", your ABN, the date, a description of what was sold, and the GST amount or a statement that the price includes GST. Sales of A$1,000 or more must also show the buyer's identity or ABN. More in the <a href="/free-invoice-generator-australia">Australia GST invoice guide</a>.</p>
<h2>Singapore</h2>
<p>GST-registered businesses issue tax invoices showing their GST registration number, the date, the customer's details, a description, the amount before GST, the GST rate and amount, and the total.</p>
<h2>India</h2>
<p>Indian GST invoices carry the supplier's GSTIN, a consecutive serial number, HSN or SAC codes for the goods or services, and the tax split. Intra-state supplies split tax into CGST and SGST. Inter-state supplies charge IGST.</p>`,

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

  'how-to-invoice-international-clients': `
<p>Invoicing a client in another country adds three questions: which currency to use, whether to charge tax, and how the money will reach you. Answer them before you start the work and the invoice becomes routine.</p>
<h2>1. Choose the currency</h2>
<p>If you invoice in your own currency, the exchange risk sits with the client, and some clients refuse to take it. Invoicing in the client's currency makes payment easy for them but means your income moves with exchange rates. Agree on the currency in the contract and put it on every line of the invoice, for example "USD 1,200.00" rather than "$1,200".</p>
<h2>2. Work out the tax treatment</h2>
<p>Cross-border services are often outside the scope of your local sales tax or zero-rated, but the rules depend on your country, the client's country and whether the client is a business.</p>
<ul>
<li><strong>EU and UK B2B services:</strong> usually taxed where the customer is, via the reverse charge. You show 0% VAT, the note "Reverse charge" and both VAT numbers.</li>
<li><strong>Canada:</strong> many services supplied to non-residents are zero-rated, but conditions apply.</li>
<li><strong>US:</strong> there is no federal sales tax on most services. State rules vary.</li>
</ul>
<p>When in doubt, ask an accountant once and reuse the answer for every similar client.</p>
<h2>3. Make payment easy</h2>
<p>Include full bank details (IBAN and SWIFT/BIC for international transfers) or a payment link, and say who pays transfer fees ("All bank charges to be paid by the sender"). Services such as Wise can reduce conversion costs for both sides.</p>
<h2>4. Add the details foreign clients expect</h2>
<ul>
<li>The client's full legal name and registered address</li>
<li>Their VAT or company number if they are a business</li>
<li>Dates written unambiguously, for example 14 October 2026 rather than 10/14/26</li>
</ul>
<p>Our <a href="/">invoice generator</a> supports 18 currencies. You can also read <a href="/how-to-invoice-us-clients-from-uk">how to invoice US clients from the UK</a>.</p>`,

  'small-business-invoicing-tips': `
<p>Getting paid on time is mostly about process. These ten habits work for sole traders and small teams alike.</p>
<h2>1. Invoice the day the work is delivered</h2>
<p>Every day you wait is a day added to your payment cycle. Make invoicing part of delivery, not a monthly admin task.</p>
<h2>2. Agree terms before you start</h2>
<p>Put payment terms, deposit and late-fee policy in the quote or contract, then repeat them on the invoice.</p>
<h2>3. Ask for a deposit on larger jobs</h2>
<p>A 30&ndash;50% deposit filters out clients who are not committed and protects your cash flow.</p>
<h2>4. Write a due date, not only a term</h2>
<p>"Due 14 October 2026" is harder to miss than "Net 30".</p>
<h2>5. Send it to the person who pays</h2>
<p>Ask who handles accounts payable and whether they need a PO number. It is the most common cause of silent delays.</p>
<h2>6. Make line items specific</h2>
<p>Clear descriptions prevent the "what is this charge?" email that pauses payment for a week.</p>
<h2>7. Offer the payment methods your clients use</h2>
<p>Bank transfer details, a card payment link, or both. Every extra step is a reason to postpone.</p>
<h2>8. Send reminders on a schedule</h2>
<p>A polite note 3 days before the due date, on the due date, and 7 days after works well. See our <a href="/blog/how-to-write-invoice-email">invoice email templates</a>.</p>
<h2>9. Number invoices consistently</h2>
<p>A clean sequence makes chasing and bookkeeping faster. Read our <a href="/blog/invoice-number-format">invoice numbering guide</a>.</p>
<h2>10. Keep a simple record</h2>
<p>A spreadsheet with invoice number, client, amount, due date and paid date is enough to spot slow payers early.</p>`
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
<li><strong>Start from a template.</strong> Go to File &rarr; New and search "invoice". Pick a simple layout with space for a logo, your details and a line-item table.</li>
<li><strong>Fill in the header:</strong> your business name, address, email, tax number if registered, and the word "Invoice".</li>
<li><strong>Add invoice details:</strong> invoice number, issue date, due date, and the client's name and address.</li>
<li><strong>Complete the table:</strong> description, quantity, rate and amount. Word tables can sum a column with Layout &rarr; Formula &rarr; <code>=SUM(ABOVE)</code>, but the formula does not update automatically. Press F9 after every change.</li>
<li><strong>Add tax and total</strong> as separate rows. Double-check the arithmetic.</li>
<li><strong>Export to PDF</strong> via File &rarr; Save As &rarr; PDF. Never send an editable .docx invoice.</li>
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
<p>US clients often ask foreign contractors for a <strong>Form W-8BEN</strong> (individuals) or <strong>W-8BEN-E</strong> (companies). It confirms you are not a US person, and with the UK&ndash;US tax treaty it usually means no US tax is withheld from your payment. Do not fill in a W-9, which is for US persons.</p>
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
<li><strong>UK:</strong> under the Late Payment of Commercial Debts (Interest) Act, businesses can charge statutory interest of 8% above the Bank of England base rate, plus fixed compensation of &pound;40, &pound;70 or &pound;100 depending on the debt size.</li>
<li><strong>US:</strong> maximum late fees and interest rates are set by state law. Keep to modest, clearly disclosed rates.</li>
<li><strong>EU:</strong> the Late Payment Directive sets statutory interest of at least 8 points above the ECB reference rate for B2B debts.</li>
</ul>
<h2>4. Calculate the fee</h2>
<p>Monthly interest example: $2,000 overdue at 1.5% per month for two months = $2,000 &times; 0.015 &times; 2 = <strong>$60</strong>. A flat fee (for example $25) is simpler but must still be agreed in advance.</p>
<h2>5. Remind first, then charge</h2>
<p>Send a friendly reminder on the due date and a firmer one after 7 days, mentioning the policy. If you do apply the fee, issue it as a new invoice referencing the original number.</p>
<p>Add your late-payment terms in the notes field of our <a href="/">invoice generator</a>.</p>`
  }
};

module.exports = { BLOG_CONTENT, HOWTO_CONTENT };
