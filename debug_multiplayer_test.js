import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless',
  '--remote-debugging-port=9234',
  '--disable-gpu',
  'about:blank'
]);

async function run() {
  await new Promise(r => setTimeout(r, 1500));
  const listRes = await fetch('http://localhost:9234/json');
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
    
    ws.addEventListener('message', (e) => {
      const data = JSON.parse(e.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log("PAGE CONSOLE:", data.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    await send('Page.navigate', { url: 'http://localhost:9090' });
    await new Promise(r => setTimeout(r, 2000));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.getElementById('multiplayer-btn').click();
          const btn = document.getElementById('mp-create-room-btn');
          btn.click();
          return "BUTTON CLICKED";
        })()
      `,
      returnByValue: true
    });

    console.log("EVAL RESULT:", evalRes);

    await new Promise(r => setTimeout(r, 2000));

    const checkRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            roomCode: document.getElementById('mp-room-code-display').textContent,
            isRoomViewVisible: !document.getElementById('mp-room-view').classList.contains('hidden')
          };
        })()
      `,
      returnByValue: true
    });

    console.log("ROOM CHECK:", checkRes.result.value);

    edge.kill();
    process.exit(0);
  };
}

run().catch(err => {
  console.error("Error:", err);
  edge.kill();
});
