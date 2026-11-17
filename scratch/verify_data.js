const fs = require('fs');
const ryanDataCode = fs.readFileSync('assets/js/ryan_data.js', 'utf8');
const vm = require('vm');
const window = {};
vm.runInNewContext(ryanDataCode, { window, console });
const d = window.RYAN_DATA;
console.log('Keys in RYAN_DATA:', Object.keys(d));
console.log('oneAccount total:', d.oneAccount ? d.oneAccount.length : 'none');
console.log('oneAccount Ryan:', d.oneAccount ? d.oneAccount.filter(x => x.isRyan).length : 'none');
console.log('sbiRecords total:', d.sbiRecords ? d.sbiRecords.length : 'none');
console.log('olxTradeIn total:', d.olxTradeIn ? d.olxTradeIn.length : 'none');
console.log('planActivity total:', d.planActivity ? d.planActivity.length : 'none');
console.log('salesforce total:', d.salesforce ? d.salesforce.length : 'none');

