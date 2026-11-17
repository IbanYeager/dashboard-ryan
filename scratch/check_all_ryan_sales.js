const fs = require('fs');

const doList = require('../data/ryan_sales_transactions.json');
const sbiList = require('../data/ryan_sbi_records.json');
const spkSep = require('../data/ryan_spk_september.json');
const foa = require('../data/ryan_fokus_foa.json');

const ryanSalesSet = new Set();

doList.forEach(d => {
  if (d.salesman) ryanSalesSet.add(d.salesman.trim().toUpperCase());
});

sbiList.forEach(s => {
  if (s.salesman) ryanSalesSet.add(s.salesman.trim().toUpperCase());
});

spkSep.forEach(s => {
  if (s.salesman) ryanSalesSet.add(s.salesman.trim().toUpperCase());
});

foa.forEach(f => {
  if (f.isRyan && f.salesman) ryanSalesSet.add(f.salesman.trim().toUpperCase());
});

console.log('Known sales in Tim Ryan:');
console.log(Array.from(ryanSalesSet).sort());

