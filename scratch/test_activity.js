const fs = require('fs');
const content = fs.readFileSync('assets/js/ryan_data.js', 'utf8');
const vm = require('vm');
const window = {};
vm.runInNewContext(content, { window, console });
const list = window.RYAN_DATA.planActivity;
console.log('Total activity rows in ryan_data.js:', list.length);
let undefCount = 0;
list.forEach((item, idx) => {
  const p1 = item.p1 !== undefined ? item.p1 : (item.target ? item.target.p1 : 0);
  const p2 = item.p2 !== undefined ? item.p2 : (item.target ? item.target.p2 : 0);
  const p3 = item.p3 !== undefined ? item.p3 : (item.target ? item.target.p3 : 0);
  const p4 = item.p4 !== undefined ? item.p4 : (item.target ? item.target.p4 : 0);
  const p5 = item.p5 !== undefined ? item.p5 : (item.target ? item.target.p5 : 0);
  const p6 = item.p6 !== undefined ? item.p6 : (item.target ? item.target.p6 : 0);
  const totTarget = item.totalTarget !== undefined ? item.totalTarget : (item.target ? item.target.total : 0);
  const totActual = item.totalActual !== undefined ? item.totalActual : (item.actual ? item.actual.total : 0);
  const funnel = item.funnel || item.funnelStage;
  if (!item.category || !funnel || p1 === undefined || totTarget === undefined) {
    undefCount++;
    console.log('Row with undefined:', idx, item);
  }
});
console.log('Undefined count:', undefCount);
console.log('First 2 rows:', JSON.stringify(list.slice(0, 2), null, 2));

