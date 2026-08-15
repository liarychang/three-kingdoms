import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9253',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  const listRes = await fetch('http://localhost:9253/json');
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
    await send('Runtime.enable');
    await send('Page.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log("Navigating to http://localhost:9090...");
    await send('Page.navigate', { url: 'http://localhost:9090' });
    await new Promise(r => setTimeout(r, 2000));

    // Fast start Scenario 2 (190 Anti Dong Zhuo, Cao Cao)
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const sCards = document.querySelectorAll('#scenario-select-container .faction-card');
          if (sCards.length > 1) sCards[1].click(); // 190
          await new Promise(r => setTimeout(r, 400));
          document.getElementById('confirm-scenario-btn').click();
          await new Promise(r => setTimeout(r, 600));

          const fCards = document.querySelectorAll('#faction-select-container .faction-card');
          if (fCards.length > 0) fCards[0].click(); // Cao Cao
          await new Promise(r => setTimeout(r, 400));
          document.getElementById('start-game-btn').click();
          await new Promise(r => setTimeout(r, 800));

          const skipBtn = document.getElementById('btn-intro-skip');
          if (skipBtn) skipBtn.click();
          await new Promise(r => setTimeout(r, 600));
        })()
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1000));

    // Capture main gameplay view
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\博能\\.gemini\\antigravity\\brain\\ec6980cb-e335-4fc6-b817-f7e44b04ab5b\\visual_audit_main_map.png', Buffer.from(shot1.data, 'base64'));

    // Open General Detail of Cao Cao
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const firstGenCard = document.querySelector('.general-item');
          if (firstGenCard) firstGenCard.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\博能\\.gemini\\antigravity\\brain\\ec6980cb-e335-4fc6-b817-f7e44b04ab5b\\visual_audit_general_modal.png', Buffer.from(shot2.data, 'base64'));

    edge.kill();
    process.exit(0);
  };
}

run().catch(err => {
  console.error("Error:", err);
  edge.kill();
});
