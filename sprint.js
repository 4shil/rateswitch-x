const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function run(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Error running ${cmd}`);
  }
}

function commitAndPush(msg) {
  run('git add .');
  run(`git commit -m "${msg}"`);
  run('git push origin main');
}

// ... more implementation
