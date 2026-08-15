import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 9090;

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm'
};

// ==================== 房間與連網資料結構 ====================
const rooms = new Map(); // roomCode -> RoomObject
const clients = new Map(); // socket -> ClientObject

class Client {
  constructor(socket, req) {
    this.socket = socket;
    this.id = 'player_' + Math.random().toString(36).substring(2, 8);
    this.name = '無名豪傑';
    this.roomCode = null;
    this.factionId = null;
    this.isReady = false;
    this.isHost = false;
  }

  send(type, payload = {}) {
    sendWebSocketMessage(this.socket, JSON.stringify({ type, payload }));
  }
}

class Room {
  constructor(code, hostClient, scenarioId = '184_yellow_turban', maxPlayers = 4) {
    this.code = code;
    this.hostId = hostClient.id;
    this.scenarioId = scenarioId;
    this.maxPlayers = maxPlayers;
    this.players = [hostClient];
    this.isStarted = false;
    this.turnReadyPlayers = new Set();
    this.chatHistory = [];
    this.turn = { year: 184, month: 1 };
  }

  broadcast(type, payload = {}, excludeClientId = null) {
    const msgStr = JSON.stringify({ type, payload });
    this.players.forEach(p => {
      if (p.id !== excludeClientId) {
        sendWebSocketMessage(p.socket, msgStr);
      }
    });
  }

  getLobbyState() {
    return {
      code: this.code,
      hostId: this.hostId,
      scenarioId: this.scenarioId,
      maxPlayers: this.maxPlayers,
      isStarted: this.isStarted,
      turn: this.turn,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        factionId: p.factionId,
        isReady: p.isReady,
        isHost: p.id === this.hostId
      }))
    };
  }
}

// ==================== HTTP 靜態檔案伺服器 ====================
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.join(__dirname, decodeURIComponent(reqPath));
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 找不到檔案：' + reqPath);
      } else {
        res.writeHead(500);
        res.end(`500 伺服器錯誤: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

// ==================== RFC 6455 原生 WebSocket 實作 ====================
server.on('upgrade', (req, socket, head) => {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    return;
  }

  const key = req.headers['sec-websocket-key'];
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`
  ];

  socket.write(headers.join('\r\n') + '\r\n\r\n');

  const client = new Client(socket, req);
  clients.set(socket, client);

  // 接收訊息與資料幀解包
  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    
    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0f;
      const isMasked = (secondByte & 0x80) === 0x80;
      let payloadLength = secondByte & 0x7f;

      let offset = 2;
      if (payloadLength === 126) {
        if (buffer.length < 4) break;
        payloadLength = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) break;
        payloadLength = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      let maskingKey = null;
      if (isMasked) {
        if (buffer.length < offset + 4) break;
        maskingKey = buffer.subarray(offset, offset + 4);
        offset += 4;
      }

      if (buffer.length < offset + payloadLength) break;

      const payload = buffer.subarray(offset, offset + payloadLength);
      buffer = buffer.subarray(offset + payloadLength);

      if (isMasked && maskingKey) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskingKey[i % 4];
        }
      }

      // 處理 Ping / Close / Text
      if (opcode === 0x08) {
        // Close
        handleClientDisconnect(client);
        socket.end();
        break;
      } else if (opcode === 0x09) {
        // Ping -> Pong
        const pong = Buffer.from([0x8a, 0x00]);
        socket.write(pong);
      } else if (opcode === 0x01) {
        // Text message
        try {
          const text = payload.toString('utf8');
          const json = JSON.parse(text);
          handleClientMessage(client, json);
        } catch (e) {
          console.error("WS Parse Error:", e.message);
        }
      }
    }
  });

  socket.on('close', () => {
    handleClientDisconnect(client);
  });

  socket.on('error', (err) => {
    console.error("WS Socket Error:", err.message);
    handleClientDisconnect(client);
  });
});

function sendWebSocketMessage(socket, text) {
  try {
    const payload = Buffer.from(text, 'utf8');
    const length = payload.length;
    let header;

    if (length <= 125) {
      header = Buffer.from([0x81, length]);
    } else if (length <= 65535) {
      header = Buffer.alloc(4);
      header[0] = 0x81;
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x81;
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }

    socket.write(Buffer.concat([header, payload]));
  } catch (e) {
    // Socket might be closed
  }
}

// ==================== 房間與連線業務邏輯 ====================
function handleClientMessage(client, msg) {
  const { type, payload } = msg;

  switch (type) {
    case 'CREATE_ROOM': {
      const code = 'TK-' + Math.floor(1000 + Math.random() * 9000);
      client.name = payload.nickname || client.name;
      client.factionId = payload.factionId || null;
      client.isHost = true;
      client.isReady = true;
      client.roomCode = code;

      const room = new Room(code, client, payload.scenarioId || '184_yellow_turban', payload.maxPlayers || 4);
      rooms.set(code, room);

      client.send('ROOM_CREATED', { room: room.getLobbyState(), selfId: client.id });
      break;
    }

    case 'JOIN_ROOM': {
      const code = (payload.roomCode || '').toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        client.send('ERROR', { message: `找不到房間號【${code}】，請確認後重試！` });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        client.send('ERROR', { message: `房間【${code}】人數已滿！` });
        return;
      }

      if (room.isStarted) {
        client.send('ERROR', { message: `房間【${code}】戰局已經開始！` });
        return;
      }

      client.name = payload.nickname || client.name;
      client.roomCode = code;
      client.isHost = false;
      client.isReady = false;
      client.factionId = null;

      room.players.push(client);
      client.send('ROOM_JOINED', { room: room.getLobbyState(), selfId: client.id });
      room.broadcast('ROOM_UPDATED', { room: room.getLobbyState() });
      break;
    }

    case 'SELECT_FACTION': {
      const room = rooms.get(client.roomCode);
      if (!room) return;

      // 檢查勢力是否已被他人選擇
      const occupied = room.players.some(p => p.id !== client.id && p.factionId === payload.factionId);
      if (occupied) {
        client.send('ERROR', { message: '該勢力已被其他玩家認領，請選擇其他君主！' });
        return;
      }

      client.factionId = payload.factionId;
      room.broadcast('ROOM_UPDATED', { room: room.getLobbyState() });
      break;
    }

    case 'TOGGLE_READY': {
      const room = rooms.get(client.roomCode);
      if (!room) return;

      if (!client.factionId && !client.isReady) {
        client.send('ERROR', { message: '請先選擇要扮演的君主勢力！' });
        return;
      }

      client.isReady = !client.isReady;
      room.broadcast('ROOM_UPDATED', { room: room.getLobbyState() });
      break;
    }

    case 'START_GAME': {
      const room = rooms.get(client.roomCode);
      if (!room || room.hostId !== client.id) return;

      const unready = room.players.some(p => !p.isReady || !p.factionId);
      if (unready && room.players.length > 1) {
        client.send('ERROR', { message: '尚有玩家未就緒或未選擇勢力！' });
        return;
      }

      room.isStarted = true;
      room.broadcast('GAME_STARTED', {
        scenarioId: room.scenarioId,
        players: room.players.map(p => ({ id: p.id, name: p.name, factionId: p.factionId }))
      });
      break;
    }

    case 'SYNC_ACTION': {
      const room = rooms.get(client.roomCode);
      if (!room) return;

      // 廣播玩家操作（如出征、徵兵、開發、計策等）給同房間其他玩家
      room.broadcast('REMOTE_ACTION', {
        fromPlayerId: client.id,
        fromPlayerName: client.name,
        factionId: client.factionId,
        action: payload.action,
        data: payload.data
      }, client.id);
      break;
    }

    case 'END_TURN_READY': {
      const room = rooms.get(client.roomCode);
      if (!room) return;

      room.turnReadyPlayers.add(client.id);
      room.broadcast('PLAYER_END_TURN_STATUS', {
        readyCount: room.turnReadyPlayers.size,
        totalCount: room.players.length,
        readyPlayerIds: Array.from(room.turnReadyPlayers)
      });

      // 如果全員都已結束回合，統一推進時間
      if (room.turnReadyPlayers.size >= room.players.length) {
        room.turnReadyPlayers.clear();
        room.turn.month++;
        if (room.turn.month > 12) {
          room.turn.year++;
          room.turn.month = 1;
        }

        room.broadcast('GLOBAL_TURN_ADVANCE', {
          year: room.turn.year,
          month: room.turn.month
        });
      }
      break;
    }

    case 'CHAT_MESSAGE': {
      const room = rooms.get(client.roomCode);
      if (!room) return;

      const chatEntry = {
        senderId: client.id,
        senderName: client.name,
        factionId: client.factionId,
        text: payload.text || '',
        time: new Date().toLocaleTimeString(),
        isPrivate: !!payload.targetPlayerId
      };

      if (payload.targetPlayerId) {
        // 私密密信
        const target = room.players.find(p => p.id === payload.targetPlayerId);
        if (target) target.send('CHAT_MESSAGE', chatEntry);
        client.send('CHAT_MESSAGE', chatEntry);
      } else {
        // 全域廣播
        room.broadcast('CHAT_MESSAGE', chatEntry);
      }
      break;
    }
  }
}

function handleClientDisconnect(client) {
  clients.delete(client.socket);

  if (client.roomCode) {
    const room = rooms.get(client.roomCode);
    if (room) {
      room.players = room.players.filter(p => p.id !== client.id);
      room.turnReadyPlayers.delete(client.id);

      if (room.players.length === 0) {
        rooms.delete(client.roomCode);
      } else {
        if (room.hostId === client.id) {
          room.hostId = room.players[0].id;
          room.players[0].isHost = true;
        }
        room.broadcast('PLAYER_LEFT', {
          leftPlayerId: client.id,
          leftPlayerName: client.name,
          room: room.getLobbyState()
        });
      }
    }
  }
}

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🎮《三國志：群雄逐鹿》連網對決伺服器啟動成功！`);
  console.log(`🌐 遊戲網址：http://localhost:${PORT}`);
  console.log(`📡 WebSocket 房間伺服器監聽中 (連接埠: ${PORT})`);
  console.log(`===================================================`);
});
