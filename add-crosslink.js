/**
 * add-crosslink.js
 * getinvoicemaker footer'ına mileagelogmaker linki ekler
 * UTF-8 güvenli — PowerShell Set-Content encoding sorununu bypass eder
 * 
 * Kullanım: node add-crosslink.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'views', 'index.ejs');

// Dosyayı UTF-8 olarak oku
let content = fs.readFileSync(filePath, 'utf8');

// Zaten eklenmiş mi kontrol
if (content.includes('mileagelogmaker.com')) {
  console.log('⚠️  Mileage Log Maker linki zaten eklenmiş. İşlem iptal.');
  process.exit(0);
}

// Footer'daki "Rent Receipt" linkini bul, altına mileage linki ekle
const searchStr = '<a href="/rent-receipt-generator">Rent Receipt</a>';
const replaceStr = '<a href="/rent-receipt-generator">Rent Receipt</a>\n        <a href="https://www.mileagelogmaker.com" target="_blank" rel="noopener">Mileage Log Maker</a>';

if (!content.includes(searchStr)) {
  console.log('✗ HATA: "Rent Receipt" linki bulunamadı. Footer yapısı değişmiş olabilir.');
  console.log('  Dosya: ' + filePath);
  process.exit(1);
}

// Sadece footer'daki Rent Receipt'i değiştir (ikinci geçişi — ilki nav'da olabilir)
// Footer'daki versiyonu bulmak için "Product" h4'ünden sonrasını hedefliyoruz
const footerStart = content.indexOf('<h4>Product</h4>');
if (footerStart === -1) {
  console.log('✗ HATA: Footer "Product" bölümü bulunamadı.');
  process.exit(1);
}

// Footer bölümünden itibaren Rent Receipt'i bul
const footerSection = content.substring(footerStart);
const rentReceiptIndex = footerSection.indexOf(searchStr);

if (rentReceiptIndex === -1) {
  console.log('✗ HATA: Footer Product bölümünde "Rent Receipt" bulunamadı.');
  process.exit(1);
}

// Global pozisyonu hesapla ve değiştir
const globalIndex = footerStart + rentReceiptIndex;
content = content.substring(0, globalIndex) + replaceStr + content.substring(globalIndex + searchStr.length);

// UTF-8 olarak yaz (BOM olmadan)
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Mileage Log Maker linki başarıyla eklendi!');
console.log('');
console.log('Kontrol: git diff views/index.ejs');
console.log('Sadece 1 satır eklenmiş olmalı (mileagelogmaker linki)');
console.log('Em-dash (—) ve para sembolleri (£€¥₹₺) DEĞİŞMEMİŞ olmalı');
