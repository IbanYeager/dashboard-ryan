async function testLive() {
  const rApp = await fetch('https://dashboardspvryan.vercel.app/assets/js/app.js');
  const tApp = await rApp.text();
  console.log('Live app.js size:', tApp.length);
  console.log('initOneAccount in live app.js:', tApp.includes('initOneAccount'));
  console.log('renderOneAccountTable in live app.js:', tApp.includes('renderOneAccountTable'));

  const rHtml = await fetch('https://dashboardspvryan.vercel.app/');
  const tHtml = await rHtml.text();
  console.log('pane-oneaccount in live index.html:', tHtml.includes('pane-oneaccount'));
  console.log('Unduh CSV in live index.html:', tHtml.includes('Unduh CSV'));

  const rData = await fetch('https://dashboardspvryan.vercel.app/assets/js/ryan_data.js');
  const tData = await rData.text();
  console.log('oneAccount in live ryan_data.js:', tData.includes('oneAccount'));
}

testLive().catch(console.error);

