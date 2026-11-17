const fs = require('fs');
const content = fs.readFileSync('assets/js/ryan_data.js', 'utf8');
const vm = require('vm');
const window = {};
vm.runInNewContext(content, { window, console });
const oa = window.RYAN_DATA.oneAccount;
console.log('Total oneAccount in RYAN_DATA:', oa ? oa.length : 'MISSING');
const ryan = oa.filter(x => x.isRyan);
console.log('Ryan items count:', ryan.length);
console.log('Ryan salesmen:', [...new Set(ryan.map(x => x.salesman))]);

