const fs = require('fs');
const path = require('path');

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

const records = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',').map(c => c.trim());
  const oneAccountId = cols[0] || '';
  const nvdo = cols[1] || '';
  const tglDelivery = cols[2] || '';
  const statusDelivery = cols[3] || 'Released';
  const nvso = cols[4] || '';
  const noka = cols[5] || '';
  const namaKonsumen = cols[6] || '';
  const sales = cols[7] || '';
  const consent = cols[8] || '';
  const inquiry = cols[9] || '';
  const dxmi = cols[10] || '';
  const noTelp = cols[11] || '';
  const pic = cols[12] || '';

  const salesUpper = (sales || '').toUpperCase();
  const isRyan = ryanSalesSet.has(salesUpper) ||
    ryanSalesList.some(rs => salesUpper.includes(rs) || rs.includes(salesUpper));

  const hasOneAccount = Boolean(oneAccountId && oneAccountId.length > 5);
  const isConsentDone = (consent || '').toUpperCase().includes('DONE');
  const isInquiryRegistered = (inquiry || '').toUpperCase().includes('TERDAFTAR');
  const isDxmiRegistered = (dxmi || '').toUpperCase().includes('TERDAFTAR');

  // Format phone
  let phoneFmt = noTelp;
  if (phoneFmt.startsWith('62')) {
    phoneFmt = '0' + phoneFmt.slice(2);
  }

  records.push({
    id: i,
    no: i,
    oneAccountId: oneAccountId || '-',
    hasOneAccount: hasOneAccount,
    nvdo: nvdo || '-',
    deliveryDate: tglDelivery || '-',
    tglDelivery: tglDelivery || '-',
    statusDelivery: statusDelivery,
    nvso: nvso || '-',
    spkNo: nvso || '-',
    noka: noka || '-',
    vin: noka || '-',
    customerName: namaKonsumen || '-',
    namaKonsumen: namaKonsumen || '-',
    salesman: sales || '-',
    sales: sales || '-',
    isRyan: isRyan,
    spv: isRyan ? 'Feryanto (Pak Ryan)' : 'Cabang TKC',
    consent: consent || '-',
    isConsentDone: isConsentDone,
    inquiry: inquiry || '-',
    isInquiryRegistered: isInquiryRegistered,
    dxmi: dxmi || '-',
    isDxmiRegistered: isDxmiRegistered,
    phone: phoneFmt || '-',
    noTelp: phoneFmt || '-',
    pic: pic || '-'
  });
}

console.log('Total records:', records.length);
const ryanRecords = records.filter(r => r.isRyan);
console.log('Ryan records:', ryanRecords.length);
console.log('Ryan with One Account ID:', ryanRecords.filter(r => r.hasOneAccount).length);
console.log('Ryan with Consent DONE:', ryanRecords.filter(r => r.isConsentDone).length);
console.log('Ryan with Inquiry registered:', ryanRecords.filter(r => r.isInquiryRegistered).length);
console.log('Ryan with DXMI registered:', ryanRecords.filter(r => r.isDxmiRegistered).length);

const outPath = path.join(__dirname, '..', 'data', 'ryan_one_account.json');
fs.writeFileSync(outPath, JSON.stringify(records, null, 2));
console.log('Saved to', outPath);

