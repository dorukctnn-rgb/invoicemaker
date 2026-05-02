const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// HOME — invoice generator
app.get('/', (req, res) => {
  res.render('index');
});

// RENT RECEIPT
app.get('/rent-receipt-generator', (req, res) => {
  res.render('rent-receipt');
});

// BLOG (placeholder if exists)
app.get('/blog', (req, res) => {
  res.render('blog', {}, (err, html) => {
    if (err) return res.send('Blog coming soon');
    res.send(html);
  });
});

// ============================================
// PDF GENERATION — INVOICE
// ============================================
app.post('/api/pdf', (req, res) => {
  try {
    const d = req.body || {};
    const isPro = d.isPro === true || d.isPro === 'true';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `invoice-${(d.invoiceNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const currency = d.currency || 'USD';
    const symbol = currencySymbol(currency);

    // Header
    doc.fontSize(28).fillColor('#111').text('INVOICE', 50, 50);
    doc.fontSize(10).fillColor('#666').text(`#${d.invoiceNumber || ''}`, 50, 85);

    // Sender (right)
    doc.fontSize(11).fillColor('#111').text(d.senderName || '', 350, 50, { width: 200, align: 'right' });
    doc.fontSize(9).fillColor('#555')
      .text(d.senderEmail || '', 350, 68, { width: 200, align: 'right' })
      .text(d.senderAddress || '', 350, 82, { width: 200, align: 'right' });

    // Bill to
    let y = 140;
    doc.fontSize(10).fillColor('#666').text('BILL TO', 50, y);
    doc.fontSize(12).fillColor('#111').text(d.clientName || '', 50, y + 15);
    doc.fontSize(9).fillColor('#555')
      .text(d.clientEmail || '', 50, y + 32)
      .text(d.clientAddress || '', 50, y + 46);

    // Dates (right)
    doc.fontSize(10).fillColor('#666').text('ISSUE DATE', 350, y, { width: 200, align: 'right' });
    doc.fontSize(11).fillColor('#111').text(d.issueDate || '', 350, y + 15, { width: 200, align: 'right' });
    doc.fontSize(10).fillColor('#666').text('DUE DATE', 350, y + 35, { width: 200, align: 'right' });
    doc.fontSize(11).fillColor('#111').text(d.dueDate || '', 350, y + 50, { width: 200, align: 'right' });

    // Line items table
    y = 230;
    doc.rect(50, y, 500, 25).fill('#f3f4f6');
    doc.fillColor('#111').fontSize(10)
      .text('DESCRIPTION', 60, y + 8)
      .text('QTY', 320, y + 8, { width: 50, align: 'right' })
      .text('RATE', 380, y + 8, { width: 70, align: 'right' })
      .text('AMOUNT', 460, y + 8, { width: 80, align: 'right' });

    y += 35;
    let subtotal = 0;
    const items = Array.isArray(d.items) ? d.items : [];
    items.forEach(item => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = qty * rate;
      subtotal += amount;

      doc.fillColor('#111').fontSize(10)
        .text(item.description || '', 60, y, { width: 250 })
        .text(String(qty), 320, y, { width: 50, align: 'right' })
        .text(`${symbol}${rate.toFixed(2)}`, 380, y, { width: 70, align: 'right' })
        .text(`${symbol}${amount.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      y += 22;
    });

    // Totals
    const taxRate = parseFloat(d.taxRate) || 0;
    const taxLabel = d.taxLabel || 'Tax';
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    y += 15;
    doc.moveTo(350, y).lineTo(550, y).strokeColor('#ddd').stroke();
    y += 10;

    doc.fontSize(10).fillColor('#666').text('Subtotal', 350, y, { width: 100, align: 'right' });
    doc.fillColor('#111').text(`${symbol}${subtotal.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
    y += 18;

    if (taxRate > 0) {
      doc.fillColor('#666').text(`${taxLabel} (${taxRate}%)`, 350, y, { width: 100, align: 'right' });
      doc.fillColor('#111').text(`${symbol}${taxAmount.toFixed(2)}`, 460, y, { width: 80, align: 'right' });
      y += 18;
    }

    doc.moveTo(350, y).lineTo(550, y).strokeColor('#111').stroke();
    y += 8;
    doc.fontSize(13).fillColor('#111').text('TOTAL DUE', 350, y, { width: 100, align: 'right' });
    doc.text(`${symbol}${total.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

    // Notes
    if (d.notes) {
      y += 50;
      doc.fontSize(10).fillColor('#666').text('NOTES', 50, y);
      doc.fontSize(10).fillColor('#333').text(d.notes, 50, y + 15, { width: 500 });
    }

    // WATERMARK for free version
    if (!isPro) {
      doc.fontSize(8).fillColor('#999').text(
        'Created with getinvoicemaker.com — Free invoice generator',
        50, 780, { width: 500, align: 'center' }
      );
    }

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: 'PDF generation failed', detail: err.message });
  }
});

// ============================================
// PDF GENERATION — RENT RECEIPT
// ============================================
app.post('/api/rent-receipt-pdf', (req, res) => {
  try {
    const d = req.body || {};
    const isPro = d.isPro === true || d.isPro === 'true';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `rent-receipt-${(d.receiptNumber || 'draft').replace(/[^a-z0-9-]/gi, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const currency = d.currency || 'USD';
    const symbol = currencySymbol(currency);
    const amount = parseFloat(d.amount) || 0;

    doc.fontSize(28).fillColor('#111').text('RENT RECEIPT', 50, 50);
    doc.fontSize(10).fillColor('#666').text(`Receipt #${d.receiptNumber || ''}`, 50, 85);
    doc.fontSize(10).fillColor('#666').text(`Date: ${d.receiptDate || ''}`, 350, 85, { width: 200, align: 'right' });

    let y = 140;
    doc.fontSize(11).fillColor('#666').text('RECEIVED FROM (TENANT)', 50, y);
    doc.fontSize(13).fillColor('#111').text(d.tenantName || '', 50, y + 18);

    y += 60;
    doc.fontSize(11).fillColor('#666').text('PAID TO (LANDLORD)', 50, y);
    doc.fontSize(13).fillColor('#111').text(d.landlordName || '', 50, y + 18);

    y += 60;
    doc.fontSize(11).fillColor('#666').text('PROPERTY ADDRESS', 50, y);
    doc.fontSize(11).fillColor('#111').text(d.propertyAddress || '', 50, y + 18, { width: 500 });

    y += 70;
    doc.fontSize(11).fillColor('#666').text('PERIOD COVERED', 50, y);
    doc.fontSize(11).fillColor('#111').text(`${d.periodFrom || ''} to ${d.periodTo || ''}`, 50, y + 18);

    y += 60;
    doc.rect(50, y, 500, 60).fill('#f3f4f6');
    doc.fillColor('#666').fontSize(11).text('AMOUNT RECEIVED', 70, y + 15);
    doc.fillColor('#111').fontSize(22).text(`${symbol}${amount.toFixed(2)}`, 70, y + 30);
    doc.fillColor('#666').fontSize(10).text(`Payment method: ${d.paymentMethod || 'Cash'}`, 350, y + 35, { width: 180, align: 'right' });

    y += 100;
    doc.fontSize(10).fillColor('#666').text('SIGNATURE (LANDLORD)', 50, y);
    doc.moveTo(50, y + 40).lineTo(250, y + 40).strokeColor('#333').stroke();

    if (!isPro) {
      doc.fontSize(8).fillColor('#999').text(
        'Created with getinvoicemaker.com/rent-receipt-generator — Free rent receipt',
        50, 780, { width: 500, align: 'center' }
      );
    }

    doc.end();
  } catch (err) {
    console.error('Rent PDF error:', err);
    res.status(500).json({ error: 'PDF generation failed', detail: err.message });
  }
});

function currencySymbol(code) {
  const map = {
    USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', INR: '₹',
    AED: 'د.إ', SGD: 'S$', TRY: '₺', JPY: '¥', CHF: 'CHF',
    SEK: 'kr', NOK: 'kr', DKK: 'kr', NZD: 'NZ$', ZAR: 'R',
    BRL: 'R$', MXN: 'Mex$'
  };
  return map[code] || code + ' ';
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`InvoiceMaker running on ${PORT}`));