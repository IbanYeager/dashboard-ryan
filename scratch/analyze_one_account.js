const fs = require('fs');

const ryanSalesList = [
  'ACEP GUNAWAN', 'ACHMAD SAEFUZZAMAN', 'ADAM ARDYANSYAH', 'AGTHY EIKA PRATIWI',
  'AGUS SURYA PERMANA', 'ANGGRIA NUGRAHA', 'ARIEF SETYAWAN', 'BAGUS SATRIA WIJAYA',
  'BANA RICKY SIMAMORA', 'BUGI TRYAKA', 'DADAN', 'DADAN DARMADI', 'DEDI MULYADI',
  'DENI ALFIAN', 'DENI SETIAWAN', 'DENO', 'DERRY HENDRIANTO BUDHI KADARJO',
  'DICKY NUR FAUZY', 'DODI MULYONO', 'EDWIN PICO', 'EGY', 'ERICK', 'ERICK JANUAR LISAPALY',
  'FANI PERMANI', 'FATWA FAJRIL HAKIM', 'FAUZI AKBAR', 'FELIX FERDI FERDIAN', 'FIA',
  'FREDERICK NEO KAIAMAN', 'GALIH HARISTIANTO', 'GANJAR RAHMANSYAH', 'ISNA NURHAYATI',
  'JAJANG', 'JAJANG NURJAMAN', 'JILLI ARMI', 'JUARNA', 'JUARNA KARMAN PUTRA',
  'NANRA RACHMAN', 'NENG IDA WIDIANINGSIH', 'NOFIA NURIFAH', 'PANCA FITRIYANTO',
  'RAHMA', 'RAHMAWATI', 'REGYAWAN KURNIA', 'RENALDY YUDHISTIRA',
  'REZA PAHLEVI PUTRA PRIBADI', 'REZZA DWI PUTRA', 'RONI MULYADIN', 'SABAM PETRUS SIHOMBING',
  'SENOAJI', 'TEGUH PANGESTU', 'TEGUH SULISTYO', 'TOMMY KUSUMA DASUKI',
  'WENDI KANDAYAN', 'YANI', 'YANI ANDRIYANI', 'YASSER ADHITYA KONCARA DJUMHANA'
];

const ryanSalesSet = new Set(ryanSalesList.map(s => s.toUpperCase()));

const csvText = fs.readFileSync('data/sheet_one_account.csv', 'utf8');
const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);

const parsed = [];
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

  const salesUpper = (sales || '').toUpperCase();
  const isRyan = ryanSalesSet.has(salesUpper) ||
    ryanSalesList.some(rs => salesUpper.includes(rs) || rs.includes(salesUpper));

  parsed.push({
    row: i,
    oneAccountId: oneAccountId || '-',
    hasOneAccount: Boolean(oneAccountId && oneAccountId.length > 5),
    nvdo: nvdo || '-',
    tglDelivery: tglDelivery || '-',
    statusDelivery: statusDelivery || 'Released',
    nvso: nvso || '-',
    noka: noka || '-',
    namaKonsumen: namaKonsumen || '-',
    sales: sales || '-',
    isRyan: isRyan,
    spv: isRyan ? 'Feryanto (Pak Ryan)' : 'Cabang TKC',
    consent: consent || '-',
    hasConsent: (consent || '').toUpperCase().includes('DONE'),
    inquiry: inquiry || '-',
    isInquiryRegistered: (inquiry || '').toUpperCase().includes('TERDAFTAR'),
    dxmi: dxmi || '-',
    isDxmiRegistered: (dxmi || '').toUpperCase().includes('TERDAFTAR'),
    noTelp: noTelp || '-',
    pic: pic || '-'
  });
}

console.log('Total parsed rows:', parsed.length);
const ryanRows = parsed.filter(p => p.isRyan);
console.log('Tim 1 SPV Ryan rows:', ryanRows.length);
console.log('Other sales rows:', parsed.length - ryanRows.length);

console.log('\nRyan Rows summary:');
ryanRows.forEach(r => {
  console.log(`Row #${r.row}: ${r.sales} | ${r.namaKonsumen} | OA: ${r.hasOneAccount ? 'YES' : 'NO'} | Consent: ${r.consent} | Inquiry: ${r.inquiry} | DXMI: ${r.dxmi}`);
});

console.log('\nNon-Ryan Rows summary:');
parsed.filter(p => !p.isRyan).forEach(r => {
  console.log(`Row #${r.row}: ${r.sales} | ${r.namaKonsumen}`);
});

