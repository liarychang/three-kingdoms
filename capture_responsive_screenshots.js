import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9236',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch('http://localhost:9236/json');
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

    await send('Page.navigate', { url: 'http://localhost:9090' });
    await new Promise(r => setTimeout(r, 2000));

    // Fast start game
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          window.gameApp = { start: true };
          const card1 = document.querySelector('#scenario-select-container .faction-card');
          if (card1) card1.click();
          const btn1 = document.getElementById('confirm-scenario-btn');
          if (btn1) btn1.click();

          setTimeout(() => {
            const card2 = document.querySelector('#faction-select-container .faction-card');
            if (card2) card2.click();
            const btn2 = document.getElementById('start-game-btn');
            if (btn2) btn2.click();
          }, 400);
        })()
      `
    });

    await new Promise(r => setTimeout(r, 1500));

    // Capture screenshot on Desktop
    const shotRes = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('desktop_responsive_preview.png', Buffer.from(shotRes.data, 'base64'));
    console.log("DESKTOP SCREENSHOT SAVED to desktop_responsive_preview.png");

    // Capture screenshot on Mobile (iPhone 14 / Android)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 800));

    const mobileShotRes = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_responsive_preview.png', Buffer.from(mobileShotRes.data, 'base64'));
    console.log("MOBILE SCREENSHOT SAVED to mobile_responsive_preview.png");

    edge.kill();
    process.exit(0);
  };
}

run().catch(err => {
  console.error("Error:", err);
  edge.kill();
});
