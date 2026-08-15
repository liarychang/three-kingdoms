import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9251',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 2500));
  const listRes = await fetch('http://localhost:9251/json');
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
    ws.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log("BROWSER CONSOLE:", msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error("BROWSER EXCEPTION:", JSON.stringify(msg.params.exceptionDetails));
      }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    await send('Page.navigate', { url: 'http://localhost:9090' });
    await new Promise(r => setTimeout(r, 2000));

    // Evaluate start menu elements
    const diag = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const sContainer = document.getElementById('scenario-select-container');
          return {
            sCardsCount: sContainer ? sContainer.children.length : 0,
            hasBanner: !!document.getElementById('resume-session-banner'),
            startOverlayClass: document.getElementById('start-overlay')?.className
          };
        })()
      `,
      returnByValue: true
    });

    console.log("START MENU DIAGNOSTICS:", JSON.stringify(diag.result.value, null, 2));

    edge.kill();
    process.exit(0);
  };
}

run().catch(err => {
  console.error("Error:", err);
  edge.kill();
});
