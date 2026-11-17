const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_GFreqrclupgOsZQVUzNMwcJe';
const PROJECT_NAME = 'dashboard_spv_ryan';

function getProjectFiles(dir, baseDir = dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== '.git' && file !== 'scratch' && file !== 'node_modules') {
        results = results.concat(getProjectFiles(fullPath, baseDir));
      }
    } else {
      if (!file.endsWith('.xlsx') && !file.endsWith('.csv')) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath);
        const sha = crypto.createHash('sha1').update(content).digest('hex');
        results.push({
          file: relPath,
          sha: sha,
          size: stat.size,
          fullPath: fullPath
        });
      }
    }
  });
  return results;
}

async function uploadFile(fileObj) {
  const content = fs.readFileSync(fileObj.fullPath);
  const res = await fetch(`https://api.vercel.com/v2/files?teamId=${TEAM_ID}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/octet-stream',
      'x-vercel-digest': fileObj.sha,
      'Content-Length': fileObj.size
    },
    body: content
  });
  return res.status;
}

async function deploy() {
  console.log('Collecting project files...');
  const files = getProjectFiles('.');
  console.log(`Found ${files.length} files to deploy.`);

  // Upload each file
  for (const f of files) {
    const status = await uploadFile(f);
    if (status !== 200 && status !== 201) {
      console.log(`Uploaded ${f.file}: status ${status}`);
    }
  }
  console.log('All files synced to Vercel store.');

  const payload = {
    name: PROJECT_NAME,
    project: PROJECT_NAME,
    target: 'production',
    files: files.map(f => ({
      file: f.file,
      sha: f.sha,
      size: f.size
    })),
    projectSettings: {
      framework: null
    }
  };

  console.log('Creating production deployment...');
  const res = await fetch(`https://api.vercel.com/v13/deployments?teamId=${TEAM_ID}&forceNew=1`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (res.status === 200 || res.status === 201) {
    console.log('Deployment successful!');
    console.log('Deployment URL:', data.url);
    console.log('Ready state:', data.readyState);
    console.log('Inspect URL:', data.inspectorUrl);
    if (data.alias && data.alias.length) {
      console.log('Aliases:', data.alias);
    }
  } else {
    console.error('Deployment failed:', res.status, data);
  }
}

deploy().catch(err => console.error('Error during deploy:', err));

