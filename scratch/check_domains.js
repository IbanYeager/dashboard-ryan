const token = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_GFreqrclupgOsZQVUzNMwcJe';
const PROJECT_ID = 'prj_VsU6cU8E2vipY5NRKFe7lVCAt8dF';

async function checkDomains() {
  const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/domains?teamId=${TEAM_ID}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const data = await res.json();
  console.log('Project domains:', JSON.stringify(data, null, 2));

  // Check project details
  const pRes = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const pData = await pRes.json();
  console.log('Project targets/aliases:', JSON.stringify(pData.targets, null, 2));
}

checkDomains().catch(console.error);

