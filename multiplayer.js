// 三國志地圖策略遊戲 - 多人連線與連網大廳管理器 (multiplayer.js)

import { FACTIONS } from './map-data.js';

export class MultiplayerManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.ws = null;
    this.isOnlineMode = false;
    this.isHost = false;
    this.selfId = null;
    this.currentRoom = null;
    this.myFactionId = null;
    this.isReady = false;
    this.chatDrawerOpen = false;

    this.initDOM();
  }

  initDOM() {
    this.elOverlay = document.getElementById('multiplayer-overlay');
    this.elLobbyView = document.getElementById('mp-lobby-view');
    this.elRoomView = document.getElementById('mp-room-view');
    
    this.elNicknameInput = document.getElementById('mp-nickname-input');
    this.elCreateRoomBtn = document.getElementById('mp-create-room-btn');
    this.elRoomCodeInput = document.getElementById('mp-room-code-input');
    this.elJoinRoomBtn = document.getElementById('mp-join-room-btn');
    this.elHotseatBtn = document.getElementById('mp-hotseat-btn');
    this.elCloseBtn = document.getElementById('mp-close-btn');

    this.elRoomCodeDisplay = document.getElementById('mp-room-code-display');
    this.elPlayersList = document.getElementById('mp-players-list');
    this.elFactionsList = document.getElementById('mp-factions-list');
    this.elReadyBtn = document.getElementById('mp-ready-btn');
    this.elStartGameBtn = document.getElementById('mp-start-btn');
    this.elLeaveRoomBtn = document.getElementById('mp-leave-btn');

    // 聊天室
    this.elChatDrawer = document.getElementById('mp-chat-drawer');
    this.elChatLogs = document.getElementById('mp-chat-logs');
    this.elChatInput = document.getElementById('mp-chat-input');
    this.elChatSendBtn = document.getElementById('mp-chat-send-btn');
    this.elChatToggleBtn = document.getElementById('mp-chat-toggle-btn');
    this.elOnlineBadge = document.getElementById('mp-online-badge');

    this.bindEvents();
  }

  bindEvents() {
    this.elCreateRoomBtn?.addEventListener('click', () => {
      const nick = this.elNicknameInput.value.trim() || '主公';
      this.connect(() => {
        this.send('CREATE_ROOM', { nickname: nick });
      });
    });

    this.elJoinRoomBtn?.addEventListener('click', () => {
      const nick = this.elNicknameInput.value.trim() || '盟友';
      const code = this.elRoomCodeInput.value.trim().toUpperCase();
      if (!code) {
        alert('請輸入 4 位房間號！');
        return;
      }
      this.connect(() => {
        this.send('JOIN_ROOM', { roomCode: code, nickname: nick });
      });
    });

    this.elCloseBtn?.addEventListener('click', () => {
      this.elOverlay.classList.add('hidden');
    });

    this.elLeaveRoomBtn?.addEventListener('click', () => {
      if (this.ws) this.ws.close();
      this.isOnlineMode = false;
      this.currentRoom = null;
      this.elRoomView.classList.add('hidden');
      this.elLobbyView.classList.remove('hidden');
    });

    this.elReadyBtn?.addEventListener('click', () => {
      if (!this.myFactionId) {
        alert('請先點選下方欲扮演之君主勢力！');
        return;
      }
      this.send('TOGGLE_READY', {});
    });

    this.elStartGameBtn?.addEventListener('click', () => {
      this.send('START_GAME', {});
    });

    // 聊天發送
    const sendChat = () => {
      const text = this.elChatInput?.value.trim();
      if (text && this.ws) {
        this.send('CHAT_MESSAGE', { text });
        this.elChatInput.value = '';
      }
    };

    this.elChatSendBtn?.addEventListener('click', sendChat);
    this.elChatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendChat();
    });

    this.elChatToggleBtn?.addEventListener('click', () => {
      this.chatDrawerOpen = !this.chatDrawerOpen;
      if (this.elChatDrawer) {
        this.elChatDrawer.style.display = this.chatDrawerOpen ? 'flex' : 'none';
      }
    });

    // 同機多人輪替模式 (Hotseat)
    this.elHotseatBtn?.addEventListener('click', () => {
      this.elOverlay.classList.add('hidden');
      this.gameApp.startHotseatLobby();
    });
  }

  connect(callback) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (callback) callback();
      return;
    }

    const host = window.location.host || 'localhost:9090';
    const wsUrl = `ws://${host}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("🌐 已連線至多人戰局伺服器：", wsUrl);
      if (callback) callback();
    };

    this.ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        this.handleMessage(type, payload);
      } catch (e) {
        console.error("WS Message Parse Error:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("WS 連線已中斷");
      this.updateOnlineBadge(false);
    };

    this.ws.onerror = (err) => {
      console.error("WS 連線錯誤:", err);
    };
  }

  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  handleMessage(type, payload) {
    switch (type) {
      case 'ROOM_CREATED':
      case 'ROOM_JOINED': {
        this.isOnlineMode = true;
        this.selfId = payload.selfId;
        this.currentRoom = payload.room;
        this.isHost = payload.room.hostId === this.selfId;
        
        this.elLobbyView.classList.add('hidden');
        this.elRoomView.classList.remove('hidden');
        this.updateRoomUI();
        this.updateOnlineBadge(true);
        break;
      }

      case 'ROOM_UPDATED': {
        this.currentRoom = payload.room;
        this.isHost = payload.room.hostId === this.selfId;
        this.updateRoomUI();
        break;
      }

      case 'ERROR': {
        alert(payload.message || '連線發生錯誤');
        break;
      }

      case 'GAME_STARTED': {
        this.elOverlay.classList.add('hidden');
        document.getElementById('start-overlay')?.classList.add('hidden');
        
        // 取得自己分配到的君主
        const myInfo = payload.players.find(p => p.id === this.selfId);
        if (myInfo && myInfo.factionId) {
          this.gameApp.gameState.playerFactionId = myInfo.factionId;
        }

        // 開啟全域多人聊天抽屜按鈕
        if (this.elChatToggleBtn) this.elChatToggleBtn.style.display = 'block';
        if (this.elChatDrawer) this.elChatDrawer.style.display = 'flex';
        this.chatDrawerOpen = true;

        this.gameApp.addLog(`🌐【天下共爭】多人連網戰局正式拉開帷幕！在線豪傑共計 ${payload.players.length} 位！`, 'highlight');
        this.gameApp.startGame();
        break;
      }

      case 'REMOTE_ACTION': {
        this.handleRemoteAction(payload);
        break;
      }

      case 'PLAYER_END_TURN_STATUS': {
        this.gameApp.addLog(`⏳【回合同步】目前已有 ${payload.readyCount} / ${payload.totalCount} 位君主就緒完畢。`, 'system');
        break;
      }

      case 'GLOBAL_TURN_ADVANCE': {
        this.gameApp.addLog(`✨【天下歲月】全員回合結束，時間推進至 ${payload.year}年 ${payload.month}月！`, 'highlight');
        this.gameApp.processEndTurn();
        break;
      }

      case 'CHAT_MESSAGE': {
        this.appendChatLog(payload);
        break;
      }

      case 'PLAYER_LEFT': {
        this.currentRoom = payload.room;
        this.gameApp.addLog(`⚠️ 玩家【${payload.leftPlayerName}】退出了戰局。`, 'system');
        this.updateRoomUI();
        break;
      }
    }
  }

  updateRoomUI() {
    if (!this.currentRoom) return;

    this.elRoomCodeDisplay.textContent = this.currentRoom.code;
    
    // 渲染玩家列表
    this.elPlayersList.innerHTML = '';
    this.currentRoom.players.forEach(p => {
      const fData = p.factionId ? FACTIONS[p.factionId] : null;
      const card = document.createElement('div');
      card.className = 'mp-player-card glass-panel';
      card.style.border = p.isReady ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.2)';
      card.style.boxShadow = p.isReady ? '0 0 10px rgba(76,175,80,0.3)' : 'none';

      card.innerHTML = `
        <div style="font-weight: bold; color: #ffd700;">
          ${p.name} ${p.isHost ? '👑 (房主)' : ''} ${p.id === this.selfId ? '(您)' : ''}
        </div>
        <div style="font-size: 0.85rem; color: ${fData ? fData.color : '#bbb'}; margin: 4px 0;">
          ${fData ? `🚩 ${fData.name}（${fData.leader}）` : '⏳ 尚未選定勢力'}
        </div>
        <div style="font-size: 0.8rem; color: ${p.isReady ? '#81c784' : '#ff9800'}; font-weight: bold;">
          ${p.isReady ? '✅ 已就緒' : '⏳ 準備中...'}
        </div>
      `;
      this.elPlayersList.appendChild(card);
    });

    // 渲染可選勢力清單
    this.elFactionsList.innerHTML = '';
    const selectable = ['cao_cao', 'liu_bei', 'sun_quan', 'dong_zhuo', 'yuan_shao', 'ma_teng', 'lu_bu', 'himiko'];
    selectable.forEach(fId => {
      const f = FACTIONS[fId];
      if (!f) return;

      const occupyingPlayer = this.currentRoom.players.find(p => p.factionId === f.id);
      const isMine = this.myFactionId === f.id;
      const isOccupied = !!occupyingPlayer && !isMine;

      const btn = document.createElement('div');
      btn.className = `mp-faction-choice glass-panel ${isMine ? 'active' : ''} ${isOccupied ? 'disabled' : ''}`;
      btn.style.borderColor = f.color;
      btn.innerHTML = `
        <div style="font-weight: bold; color: ${f.color}; font-size: 0.95rem;">${f.banner}字旗・${f.name}</div>
        <div style="font-size: 0.75rem; color: #bbb;">君主：${f.leader}</div>
        <div style="font-size: 0.7rem; color: ${isOccupied ? '#f44336' : (isMine ? '#81c784' : '#ffd700')};">
          ${isOccupied ? `🔒 已被【${occupyingPlayer.name}】認領` : (isMine ? '👑 當前選擇' : '點擊認領')}
        </div>
      `;

      if (!isOccupied) {
        btn.addEventListener('click', () => {
          this.myFactionId = f.id;
          this.send('SELECT_FACTION', { factionId: f.id });
        });
      }

      this.elFactionsList.appendChild(btn);
    });

    // 控制按鈕
    const me = this.currentRoom.players.find(p => p.id === this.selfId);
    if (me) {
      this.elReadyBtn.textContent = me.isReady ? '取消就緒' : '準備就緒！';
      this.elReadyBtn.style.background = me.isReady ? '#f57c00' : 'linear-gradient(135deg, #2e7d32, #1b5e20)';
    }

    if (this.isHost) {
      this.elStartGameBtn.style.display = 'inline-block';
      const allReady = this.currentRoom.players.every(p => p.isReady && p.factionId);
      this.elStartGameBtn.disabled = !allReady;
    } else {
      this.elStartGameBtn.style.display = 'none';
    }
  }

  updateOnlineBadge(isOnline) {
    if (this.elOnlineBadge) {
      this.elOnlineBadge.style.display = isOnline ? 'inline-flex' : 'none';
      this.elOnlineBadge.innerHTML = isOnline ? `🟢 連網中 (房間: ${this.currentRoom?.code || ''})` : '';
    }
  }

  appendChatLog(entry) {
    if (!this.elChatLogs) return;
    const item = document.createElement('div');
    item.className = 'mp-chat-entry';
    const f = entry.factionId ? FACTIONS[entry.factionId] : null;
    item.innerHTML = `
      <span style="font-size:0.75rem; color:#888;">[${entry.time}]</span>
      <span style="color: ${f ? f.color : '#ffd700'}; font-weight: bold;">【${entry.senderName}】</span>:
      <span style="color: #fff;">${entry.text}</span>
    `;
    this.elChatLogs.appendChild(item);
    this.elChatLogs.scrollTop = this.elChatLogs.scrollHeight;
  }

  // 廣播玩家操作
  broadcastAction(action, data) {
    if (!this.isOnlineMode || !this.ws) return;
    this.send('SYNC_ACTION', { action, data });
  }

  // 處理遠端玩家同步操作
  handleRemoteAction(payload) {
    const { fromPlayerName, factionId, action, data } = payload;
    const f = FACTIONS[factionId] || { name: '友邦', color: '#ffd700' };

    switch (action) {
      case 'DISPATCH_ATTACK': {
        this.gameApp.addLog(`⚔️【天下烽火】君主【${fromPlayerName}】（${f.name}）調遣大軍自【${data.originName}】出征討伐【${data.targetName}】！`, 'battle');
        // 更新地圖節點兵力
        const orig = this.gameApp.gameState.cities.find(c => c.id === data.originId);
        if (orig) orig.troops = Math.max(1000, orig.troops - data.troops);
        this.gameApp.renderMap();
        break;
      }

      case 'DEVELOP_CITY': {
        this.gameApp.addLog(`📜【列國軍政】君主【${fromPlayerName}】（${f.name}）在大力發展【${data.cityName}】的${data.type === 'agri' ? '農耕' : '商業'}！`, 'system');
        const c = this.gameApp.gameState.cities.find(city => city.id === data.cityId);
        if (c) {
          if (data.type === 'agri') c.agriculture += data.gain;
          else c.commerce += data.gain;
        }
        this.gameApp.renderMap();
        break;
      }

      case 'RECRUIT_TROOPS': {
        this.gameApp.addLog(`🚩【擴軍備戰】君主【${fromPlayerName}】（${f.name}）於【${data.cityName}】大舉徵召新軍 ${data.amount} 兵馬！`, 'system');
        const c = this.gameApp.gameState.cities.find(city => city.id === data.cityId);
        if (c) c.troops += data.amount;
        this.gameApp.renderMap();
        break;
      }

      case 'CITY_CAPTURED': {
        this.gameApp.addLog(`🏆【名城陷落】君主【${fromPlayerName}】（${f.name}）成功攻克天下重鎮【${data.cityName}】！全領地勢力版圖大擴張！`, 'highlight');
        const c = this.gameApp.gameState.cities.find(city => city.id === data.cityId);
        if (c) {
          c.faction = factionId;
          c.troops = data.remainingTroops;
        }
        this.gameApp.renderMap();
        this.gameApp.updateGlobalStats();
        break;
      }
    }
  }

  // 玩家點擊「結束本月」時調用
  notifyEndTurnReady() {
    if (this.isOnlineMode && this.ws) {
      this.send('END_TURN_READY', {});
      return true; // 告知遊戲處於連網回合同步等待
    }
    return false;
  }
}
