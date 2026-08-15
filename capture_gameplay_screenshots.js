import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9238',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch('http://localhost:9238/json');
  const tabs = await listRes.json();
  const pageTab = tabs.find(t => t.type === 'page');

  const ws = new globalThis.WebSocket(pageTab.webSocketDebuggerUrl);
  
  let msgId = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onopen = async () => {
    console.log("WebSocket connected to DevTools");
    await send('Runtime.enable');
    await send('Page.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    await send('Page.navigate', { url: 'http://localhost:9090' });
    await new Promise(r => setTimeout(r, 2000));

    // Fast direct click scenario & faction
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const sCard = document.querySelector('#scenario-select-container .faction-card');
          if (sCard) sCard.click();
          document.getElementById('confirm-scenario-btn').click();
          await new Promise(r => setTimeout(r, 600));

          const fCard = document.querySelector('#faction-select-container .faction-card');
          if (fCard) fCard.click();
          document.getElementById('start-game-btn').click();
          await new Promise(r => setTimeout(r, 800));

          // Click intro skip
          const skipBtn = document.getElementById('btn-intro-skip');
          if (skipBtn) skipBtn.click();
          await new Promise(r => setTimeout(r, 600));
        })()
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1200));

    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\博能\\.gemini\\antigravity\\brain\\ec6980cb-e335-4fc6-b817-f7e44b04ab5b\\desktop_gameplay_preview.png', Buffer.from(shotRes.data, 'base64'));
    console.log("DESKTOP GAMEPLAY SCREENSHOT CAPTURED");

    // Mobile Phone (iPhone 14)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));

    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\博能\\.gemini\\antigravity\\brain\\ec6980cb-e335-4fc6-b817-f7e44b04ab5b\\mobile_gameplay_preview.png', Buffer.from(mobileShot.data, 'base64'));
    console.log("MOBILE GAMEPLAY SCREENSHOT CAPTURED");

    edge.kill();
    process.exit(0);
  };
}

run().catch(err => {
  console.error("Error:", err);
  edge.kill();
});
