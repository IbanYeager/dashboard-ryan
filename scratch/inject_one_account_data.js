const fs = require('fs');
const path = require('path');

const records = require(path.join(__dirname, '..', 'data', 'ryan_one_account.json'));
const ryanDataPath = path.join(__dirname, '..', 'assets', 'js', 'ryan_data.js');
let content = fs.readFileSync(ryanDataPath, 'utf8');

// Insert const oneAccount = [...] right before window.RYAN_DATA = {
const marker = 'window.RYAN_DATA = {';
const markerIdx = content.indexOf(marker);

if (markerIdx === -1) {
  console.error('Marker window.RYAN_DATA not found!');
  process.exit(1);
}

const oneAccountJson = JSON.stringify(records, null, 2);
const insertCode = `const oneAccount = ${oneAccountJson};\n\n  `;

content = content.slice(0, markerIdx) + insertCode + content.slice(markerIdx);

// Also add oneAccount: oneAccount, to RYAN_DATA
const exportMarker = 'doSeptember: doSeptember';
const exportIdx = content.indexOf(exportMarker);
if (exportIdx === -1) {
  console.error('Marker doSeptember not found!');
  process.exit(1);
}

content = content.slice(0, exportIdx) + `doSeptember: doSeptember,\n    oneAccount: oneAccount` + content.slice(exportIdx + exportMarker.length);

fs.writeFileSync(ryanDataPath, content, 'utf8');
console.log('Successfully added oneAccount dataset to assets/js/ryan_data.js!');

