const fs = require('fs');

const salesforce = require('../data/ryan_salesforce.json');
const ryanSales = new Set();

salesforce.forEach(s => {
  ryanSales.add(s.name.toUpperCase());
  if (s.shortName) ryanSales.add(s.shortName.toUpperCase());
  // Extract words
  s.name.split(/[\s()]+/).forEach(w => {
    if (w.length > 2) ryanSales.add(w.toUpperCase());
  });
});

console.log('Ryan sales names/keywords:');
console.log(Array.from(ryanSales));

const csvText = fs.readFileSync('data/sheet_one_account.csv', 'utf8');
const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = lines[0].split(',').map(h => h.trim());

console.log('Headers:', headers);

const allRecords = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',').map(c => c.trim());
  const oneAccountId = cols[0];
  const nvdo = cols[1];
  const tglDelivery = cols[2];
  const statusDelivery = cols[3];
  const nvso = cols[4];
  const noka = cols[5];
  const namaKonsumen = cols[6];
  const sales = cols[7];
  const consent = cols[8];
  const inquiry = cols[9];
  const dxmi = cols[10];
  const noTelp = cols[11];
  const pic = cols[12];

  allRecords.push({
    row: i,
    oneAccountId,
    nvdo,
    tglDelivery,
    statusDelivery,
    nvso,
    noka,
    namaKonsumen,
    sales,
    consent,
    inquiry,
    dxmi,
    noTelp,
    pic
  });
}

console.log('Total records in sheet:', allRecords.length);

const allSalesInSheet = Array.from(new Set(allRecords.map(r => r.sales))).filter(Boolean);
console.log('All sales in sheet:', allSalesInSheet);

// Check which sales match Ryan's team
allSalesInSheet.forEach(salesName => {
  const parts = salesName.toUpperCase().split(/\s+/);
  const matched = parts.some(p => ryanSales.has(p));
  console.log(`Sales: "${salesName}" => Ryan team? ${matched}`);
});

