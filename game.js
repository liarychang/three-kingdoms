import { MultiplayerManager } from './multiplayer.js';
// 三國志地圖策略遊戲 - 核心遊戲引擎 (game.js) - 真人頭像與寫實畫面版

import { FACTIONS, CITIES, CONNECTIONS } from './map-data.js';
import { GENERALS } from './generals-data.js';
import { ITEMS } from './items-data.js';
import { SCENARIOS } from './scenarios-data.js';
import { HISTORICAL_EVENTS } from './events-data.js';
import { BattleSimulation } from './battle.js';
import { TECH_TREE, ADVANCED_UNITS } from './tech-data.js';
import { ACHIEVEMENTS } from './achievements-data.js';
import { LORD_RANKS, OFFICIAL_POSITIONS } from './ranks-data.js';
import { TUTOR_COURSES, CHILD_TRAITS } from './marriage-data.js';
import { LEVEL_CONFIG, getExpRequiredForLevel, getLevelTitleInfo, AWAKENED_ULTIMATES } from './leveling-data.js';

const TRAIT_INFO = {
  divine_calc: { name: '神算', desc: '計略成功率極大化，且免疫敵方計策。' },
  god_of_war: { name: '軍神', desc: '戰鬥時部隊士氣不會自然下降，且爆擊率提升。' },
  flying_gen: { name: '飛將', desc: '戰鬥勝率極高，但易受離間與流言影響。' },
  falsehood: { name: '虛實', desc: '對智力較低的敵人施展計略必定成功。' },
  wealthy: { name: '富豪', desc: '擔任太守時，該城季收黃金與糧草增加 30%。' },
  beauty: { name: '傾國', desc: '離間計與登庸成功率對男性武將大幅提升。' }
};
const AUTOSAVE_KEY = 'three_kingdoms_autosave';
const SAVE_KEY = 'three_kingdoms_save';

// ==================== 遊戲狀態 ====================
let gameState = {
  scenarioId: null,
  year: 190,
  month: 1,
  playerFactionId: null,
  cities: [],
  generals: [],
  selectedCity: null,
  activeCommand: null,
  soundEnabled: false,
  audioContext: null,
  musicInterval: null,
  isSelectingTarget: false,
  pendingDispatch: null,
  factionItems: [],
  relations: {},
  alliances: {},
  researchedTechs: [],
  techBonuses: {
    attackBonus: 0,
    defenseBonus: 0,
    infantryDefense: 0,
    cavalryDamage: 0,
    archerDoubleShot: false,
    siegeDamage: 0,
    cavalryIgnoreDef: false,
    maxMorale: 100,
    foodIncomeMult: 0,
    goldIncomeMult: 0,
    immuneDisaster: false,
    maxCityDef: 1000,
    noLoyaltyDecay: false,
    autoMoraleGrowth: false
  },
  unlockedUnits: ['infantry', 'cavalry', 'archer'],
  appointments: {},
  unlockedAchievements: [],
  duelWins: 0
};
window.gameState = gameState;

// ==================== 網頁元素綁定 ====================
const elMap = document.getElementById('game-map');
const elRoutesGroup = document.getElementById('map-routes-group');
const elCitiesGroup = document.getElementById('map-cities-group');

const elGameDate = document.getElementById('game-date');
const elFactionGold = document.getElementById('faction-gold');
const elFactionFood = document.getElementById('faction-food');
const elFactionTroops = document.getElementById('faction-troops');
const elFactionGenerals = document.getElementById('faction-generals');

const elPlayerLeaderPortrait = document.getElementById('player-leader-portrait');
const elPlayerLeaderName = document.getElementById('player-leader-name');
const elPlayerFactionName = document.getElementById('player-faction-name');
const elPlayerFactionDesc = document.getElementById('player-faction-desc');
const elEventLogs = document.getElementById('event-logs');

const elCityDetailPanel = document.getElementById('city-detail-panel');
const elDetailCityName = document.getElementById('detail-city-name');
const elDetailCityFaction = document.getElementById('detail-city-faction');
const elValAgriculture = document.getElementById('val-agriculture');
const elBarAgriculture = document.getElementById('bar-agriculture');
const elValCommerce = document.getElementById('val-commerce');
const elBarCommerce = document.getElementById('bar-commerce');
const elValDefense = document.getElementById('val-defense');
const elBarDefense = document.getElementById('bar-defense');
const elValTroops = document.getElementById('val-troops');
const elBarTroops = document.getElementById('bar-troops');
const elValMorale = document.getElementById('val-morale');
const elBarMorale = document.getElementById('bar-morale');
const elValGold = document.getElementById('val-gold');
const elValFood = document.getElementById('val-food');
const elDetailGeneralsCount = document.getElementById('detail-generals-count');
const elCityGeneralsList = document.getElementById('city-generals-list');

const elCommandBar = document.getElementById('command-bar');
const elEndTurnBtn = document.getElementById('end-turn-btn');
const elAudioToggleBtn = document.getElementById('audio-toggle-btn');
const elFactionStatusArea = document.getElementById('faction-status-area');
const elSaveBtn = document.getElementById('save-btn');
const elLoadBtn = document.getElementById('load-btn');

// Overlay elements
const elStartOverlay = document.getElementById('start-overlay');
const elFactionSelectContainer = document.getElementById('faction-select-container');
const elFactionPreviewText = document.getElementById('faction-preview-text');
const elStartGameBtn = document.getElementById('start-game-btn');

const elGeneralOverlay = document.getElementById('general-overlay');
const elCloseGeneralBtn = document.getElementById('close-general-btn');
const elGenDetPortrait = document.getElementById('gen-det-portrait');
const elGenDetName = document.getElementById('gen-det-name');
const elGenDetFaction = document.getElementById('gen-det-faction');
const elGenDetDesc = document.getElementById('gen-det-desc');
const elBarDetLead = document.getElementById('bar-det-lead');
const elBarDetStr = document.getElementById('bar-det-str');
const elBarDetInt = document.getElementById('bar-det-int');
const elBarDetPol = document.getElementById('bar-det-pol');
const elBarDetCha = document.getElementById('bar-det-cha');
const elValDetLead = document.getElementById('val-det-lead');
const elValDetStr = document.getElementById('val-det-str');
const elValDetInt = document.getElementById('val-det-int');
const elValDetPol = document.getElementById('val-det-pol');
const elValDetCha = document.getElementById('val-det-cha');

const elSelectorOverlay = document.getElementById('selector-overlay');
const elCloseSelectorBtn = document.getElementById('close-selector-btn');
const elSelectorTitle = document.getElementById('selector-title');
const elSelectorDesc = document.getElementById('selector-desc');
const elSelectorList = document.getElementById('selector-list');

const elRewardTypeOverlay = document.getElementById('reward-type-overlay');
const elCloseRewardTypeBtn = document.getElementById('close-reward-type-btn');
const elBtnRewardGold = document.getElementById('btn-reward-gold');
const elBtnRewardItem = document.getElementById('btn-reward-item');

const elItemSelectorOverlay = document.getElementById('item-selector-overlay');
const elCloseItemSelectorBtn = document.getElementById('close-item-selector-btn');
const elItemSelectorList = document.getElementById('item-selector-list');

const elGenDetItems = document.getElementById('gen-det-items');
const elGenDetItemsList = document.getElementById('gen-det-items-list');

const elDispatchOverlay = document.getElementById('dispatch-overlay');
const elCloseDispatchBtn = document.getElementById('close-dispatch-btn');
const elDispatchConfirmBtn = document.getElementById('dispatch-confirm-btn');
const elDispatchTitle = document.getElementById('dispatch-title');
const elDispatchGenPortrait = document.getElementById('dispatch-gen-portrait');
const elDispatchGenName = document.getElementById('dispatch-gen-name');
const elDispatchRoute = document.getElementById('dispatch-route');
const elDispatchTroopsVal = document.getElementById('dispatch-troops-val');
const elDispatchTroopsSlider = document.getElementById('dispatch-troops-slider');
const elDispatchTroopsMax = document.getElementById('dispatch-troops-max');
const elDispatchGoldSlider = document.getElementById('dispatch-gold-slider');
const elDispatchGoldVal = document.getElementById('dispatch-gold-val');
const elDispatchFoodSlider = document.getElementById('dispatch-food-slider');
const elDispatchFoodVal = document.getElementById('dispatch-food-val');

const elTradeOverlay = document.getElementById('trade-overlay');
const elCloseTradeBtn = document.getElementById('close-trade-btn');
const elTradeGenPortrait = document.getElementById('trade-gen-portrait');
const elTradeGenName = document.getElementById('trade-gen-name');
const elTradeRateText = document.getElementById('trade-rate-text');
const elTabBuyFood = document.getElementById('tab-buy-food');
const elTabSellFood = document.getElementById('tab-sell-food');
const elTradeSlider = document.getElementById('trade-slider');
const elTradeAmountVal = document.getElementById('trade-amount-val');
const elTradeAmountMax = document.getElementById('trade-amount-max');
const elTradeCostLabel = document.getElementById('trade-cost-label');
const elTradeCostVal = document.getElementById('trade-cost-val');
const elTradeGainLabel = document.getElementById('trade-gain-label');
const elTradeGainVal = document.getElementById('trade-gain-val');
const elTradeConfirmBtn = document.getElementById('trade-confirm-btn');

const elBattleOverlay = document.getElementById('battle-overlay');
const elBattleTitleText = document.getElementById('battle-title-text');
const elBattleSubtitleText = document.getElementById('battle-subtitle-text');
const elBattleAttPortrait = document.getElementById('battle-att-portrait');
const elBattleAttGenName = document.getElementById('battle-att-gen-name');
const elBattleAttTroops = document.getElementById('battle-att-troops');
const elBattleAttMorale = document.getElementById('battle-att-morale');
const elBattleAttStr = document.getElementById('battle-att-str');
const elBattleAttInt = document.getElementById('battle-att-int');
const elBattleAttMoraleBar = document.getElementById('battle-att-morale-bar');
const elBattleDefPortrait = document.getElementById('battle-def-portrait');
const elBattleDefGenName = document.getElementById('battle-def-gen-name');
const elBattleDefTroops = document.getElementById('battle-def-troops');
const elBattleDefMorale = document.getElementById('battle-def-morale');
const elBattleDefStr = document.getElementById('battle-def-str');
const elBattleDefInt = document.getElementById('battle-def-int');
const elBattleDefMoraleBar = document.getElementById('battle-def-morale-bar');
const elBattleRoundText = document.getElementById('battle-round-text');
const elBattleAttFactionBanner = document.getElementById('battle-att-faction-banner');
const elBattleDefFactionBanner = document.getElementById('battle-def-faction-banner');
const elClashSparks = document.getElementById('clash-sparks');
const elBattleActionText = document.getElementById('battle-action-text');
const elBattleLogsBox = document.getElementById('battle-logs-box');
const elBattleNextBtn = document.getElementById('battle-next-btn');
const elBattleSkipBtn = document.getElementById('battle-skip-btn');

// 新增的背景與攻城 DOM
const elBattlefieldBg = document.getElementById('battlefield-bg');
const elBattleSiegeUI = document.getElementById('battle-siege-ui');
const elBattleDefCityDef = document.getElementById('battle-def-city-def');
const elBattleDefCityBar = document.getElementById('battle-def-city-bar');
const elDuelUI = document.getElementById('duel-ui');
const elDuelAttName = document.getElementById('duel-att-name');
const elDuelDefName = document.getElementById('duel-def-name');
const elDuelAttHP = document.getElementById('duel-att-hp');
const elDuelDefHP = document.getElementById('duel-def-hp');
const elDuelDialogueBox = document.getElementById('duel-dialogue-box');
const elVisAtt = document.getElementById('vis-att');
const elVisDef = document.getElementById('vis-def');

// 日式光榮三國志戰鬥 UI DOM
const elBattleAttLead = document.getElementById('battle-att-lead');
const elBattleDefLead = document.getElementById('battle-def-lead');
const elBattleAttUnitBadge = document.getElementById('battle-att-unit-badge');
const elBattleDefUnitBadge = document.getElementById('battle-def-unit-badge');
const elBattleAttTraitBadge = document.getElementById('battle-att-trait-badge');
const elBattleDefTraitBadge = document.getElementById('battle-def-trait-badge');
const elBattleAttAdvTag = document.getElementById('battle-att-adv-tag');
const elBattleDefAdvTag = document.getElementById('battle-def-adv-tag');
const elBattleAttTroopBar = document.getElementById('battle-att-troop-bar');
const elBattleDefTroopBar = document.getElementById('battle-def-troop-bar');
const elDuelAttHPVal = document.getElementById('duel-att-hp-val');
const elDuelDefHPVal = document.getElementById('duel-def-hp-val');
const elBattleCutinBanner = document.getElementById('battle-cutin-banner');
const elBattleCutinText = document.getElementById('battle-cutin-text');
const elBattleCutinSubtext = document.getElementById('battle-cutin-subtext');
const elBattleSlashLayer = document.getElementById('battle-slash-layer');
const elDamagePopups = document.getElementById('damage-popups');

// 科技樹系統 DOM
const elTechOverlay = document.getElementById('tech-overlay');
const elTechBox = document.getElementById('tech-box');
const elTechPlayerGold = document.getElementById('tech-player-gold');
const elTechCloseBtn = document.getElementById('tech-close-btn');
const elTabMilitaryTech = document.getElementById('tab-military-tech');
const elTabCivilTech = document.getElementById('tab-civil-tech');
const elTechTreeGrid = document.getElementById('tech-tree-grid');
const elTechDetailPanel = document.getElementById('tech-detail-panel');
const elTechDetIcon = document.getElementById('tech-det-icon');
const elTechDetName = document.getElementById('tech-det-name');
const elTechDetTier = document.getElementById('tech-det-tier');
const elTechDetCost = document.getElementById('tech-det-cost');
const elTechDetRequiresBox = document.getElementById('tech-det-requires-box');
const elTechDetRequiresText = document.getElementById('tech-det-requires-text');
const elTechDetDesc = document.getElementById('tech-det-desc');
const elTechUnlockUnitBox = document.getElementById('tech-unlock-unit-box');
const elTechUnitIcon = document.getElementById('tech-unit-icon');
const elTechUnitName = document.getElementById('tech-unit-name');
const elTechUnitStats = document.getElementById('tech-unit-stats');
const elTechUnitDesc = document.getElementById('tech-unit-desc');
const elBtnResearchTech = document.getElementById('btn-research-tech');
const elTechBtn = document.getElementById('tech-btn');

// 官職與成就 DOM
const elRanksOverlay = document.getElementById('ranks-overlay');
const elRanksCloseBtn = document.getElementById('ranks-close-btn');
const elLordRankBadge = document.getElementById('lord-rank-badge');
const elLordRankTitle = document.getElementById('lord-rank-title');
const elLordRankDesc = document.getElementById('lord-rank-desc');
const elLordRankProgress = document.getElementById('lord-rank-progress');
const elRanksListContainer = document.getElementById('ranks-list-container');
const elRanksBtn = document.getElementById('ranks-btn');

const elAchievementsOverlay = document.getElementById('achievements-overlay');
const elAchievementsCloseBtn = document.getElementById('achievements-close-btn');
const elAchievementsRateText = document.getElementById('achievements-rate-text');
const elAchievementsGrid = document.getElementById('achievements-grid');
const elAchievementsBtn = document.getElementById('achievements-btn');

const elSeasonBadge = document.getElementById('season-badge');

const elGenDetRankBadge = document.getElementById('gen-det-rank-badge');
const elGenDetBondVal = document.getElementById('gen-det-bond-val');
const elGenDetBondBar = document.getElementById('gen-det-bond-bar');
const elBtnGenVisit = document.getElementById('btn-gen-visit');
const elBtnGenSpar = document.getElementById('btn-gen-spar');
const elBtnGenSwear = document.getElementById('btn-gen-swear');

// 武將升級與加點 DOM
const elGenDetLvlBadge = document.getElementById('gen-det-lvl-badge');
const elGenDetExpText = document.getElementById('gen-det-exp-text');
const elGenDetExpBar = document.getElementById('gen-det-exp-bar');
const elGenDetFreePointsRow = document.getElementById('gen-det-free-points-row');
const elGenDetFreePoints = document.getElementById('gen-det-free-points');
const elBtnPlusLead = document.getElementById('btn-plus-lead');
const elBtnPlusStr = document.getElementById('btn-plus-str');
const elBtnPlusInt = document.getElementById('btn-plus-int');
const elBtnPlusPol = document.getElementById('btn-plus-pol');
const elBtnPlusCha = document.getElementById('btn-plus-cha');

const elGenDetUltimateBox = document.getElementById('gen-det-ultimate-box');
const elGenUltIcon = document.getElementById('gen-ult-icon');
const elGenUltName = document.getElementById('gen-ult-name');
const elGenUltDesc = document.getElementById('gen-ult-desc');

// 全螢幕日式過場動畫 DOM

// 自創君主與家族子嗣 DOM

// 史詩劇本開場影片 DOM
const elScenarioIntroOverlay = document.getElementById('scenario-intro-overlay');
const elIntroBgCanvas = document.getElementById('intro-bg-canvas');
const elIntroPoemText = document.getElementById('intro-poem-text');
const elIntroMainTitle = document.getElementById('intro-main-title');
const elIntroSlideCard = document.getElementById('intro-slide-card');
const elIntroSlideHeading = document.getElementById('intro-slide-heading');
const elIntroSlideBody = document.getElementById('intro-slide-body');
const elIntroSlideSub = document.getElementById('intro-slide-sub');
const elIntroDots = document.getElementById('intro-dots');
const elBtnIntroSkip = document.getElementById('btn-intro-skip');
const elBtnIntroNext = document.getElementById('btn-intro-next');

let currentIntroScenario = null;
let currentIntroSlideIdx = 0;
let introFinishCallback = null;

const elCustomLordOverlay = document.getElementById('custom-lord-overlay');
const elBtnOpenCustomLord = document.getElementById('btn-open-custom-lord');
const elCustomLordCloseBtn = document.getElementById('custom-lord-close-btn');
const elCustomPortraitsGrid = document.getElementById('custom-portraits-grid');
const elCustomNameInput = document.getElementById('custom-name-input');
const elCustomCourtesyInput = document.getElementById('custom-courtesy-input');
const elCustomBannerInput = document.getElementById('custom-banner-input');
const elCustomColorSelect = document.getElementById('custom-color-select');
const elCustomCitySelect = document.getElementById('custom-city-select');
const elCustomTraitSelect = document.getElementById('custom-trait-select');
const elCustomStatPool = document.getElementById('custom-stat-pool');
const elBtnLaunchCustomLord = document.getElementById('btn-launch-custom-lord');
const elCustomLordPortraitPreview = document.getElementById('custom-lord-portrait-preview');
const elCustomLordBannerPreview = document.getElementById('custom-lord-banner-preview');
const elCustomBannerText = document.getElementById('custom-banner-text');
const elCustomLordNamePreview = document.getElementById('custom-lord-name-preview');

const elFamilyOverlay = document.getElementById('family-overlay');
const elFamilyBtn = document.getElementById('family-btn');
const elFamilyCloseBtn = document.getElementById('family-close-btn');
const elSpousePortrait = document.getElementById('spouse-portrait');
const elSpouseName = document.getElementById('spouse-name');
const elSpouseDesc = document.getElementById('spouse-desc');
const elChildrenGrid = document.getElementById('children-grid');
const elBtnGenMarry = document.getElementById('btn-gen-marry');

let customLordState = {
  name: '趙無雙',
  courtesy: '凌天',
  banner: '龍',
  color: '#c62828',
  portrait: 'portraits/custom_lord_1.jpg',
  city: 'luoyang',
  trait: 'god_of_war',
  stats: { lead: 75, str: 75, int: 75, pol: 75, cha: 80 },
  pool: 50
};

const elCinematicOverlay = document.getElementById('cinematic-overlay');
const elCinematicBg = document.getElementById('cinematic-bg');
const elCinematicPortrait = document.getElementById('cinematic-portrait');
const elCinematicCharName = document.getElementById('cinematic-char-name');
const elCinematicTitle = document.getElementById('cinematic-title');
const elCinematicSub = document.getElementById('cinematic-sub');
let cinematicTimeout = null;





// ==================== 音效引擎 (Web Audio API) ====================
function initAudio() {
  if (gameState.audioContext) return;
  gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// ==================== 全方位日式光榮音效合成引擎 (Koei Web Audio Engine) ====================
function playSound(type) {
  if (!gameState.soundEnabled) return;
  if (!gameState.audioContext) {
    try {
      gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return; }
  }
  const ctx = gameState.audioContext;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  const t = ctx.currentTime;

  try {
    switch (type) {
      case 'click': {
        // 木板/算籌輕點聲
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.05);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
      case 'select': {
        // 編鐘清越之聲
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.12); // E5
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }
      case 'command_ok': {
        // 戰令確認：三連擊和弦
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + i * 0.06);
          gain.gain.setValueAtTime(0.12, t + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + i * 0.06);
          osc.stop(t + i * 0.06 + 0.2);
        });
        break;
      }
      case 'open_panel': {
        // 卷軸展開/推門聲
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.18);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'coins':
      case 'gold': {
        // 銅錢金錠碰撞聲 (叮鈴清脆)
        [1500, 2200, 1800, 2600].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + i * 0.04);
          gain.gain.setValueAtTime(0.1, t + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + i * 0.04);
          osc.stop(t + i * 0.04 + 0.12);
        });
        break;
      }
      case 'clash':
      case 'sword_slash': {
        // 刀劍出鞘斬擊劈砍
        const bufferSize = ctx.sampleRate * 0.12;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
        break;
      }
      case 'heavy_strike':
      case 'critical': {
        // 重兵器暴擊打擊＋雷鳴
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }
      case 'fire':
      case 'stratagem': {
        // 烈火焚燒/計略施展 (呼嘯升騰)
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, t);
        filter.frequency.exponentialRampToValueAtTime(1200, t + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
        break;
      }
      case 'horn':
      case 'march': {
        // 號角戰鼓 (低沉進軍)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, t); // C3
        osc.frequency.exponentialRampToValueAtTime(196.00, t + 0.15); // G3
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }
      case 'victory': {
        // 慶功大勝五音和弦
        [392.00, 440.00, 523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + i * 0.08);
          gain.gain.setValueAtTime(0.18, t + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + i * 0.08);
          osc.stop(t + i * 0.08 + 0.35);
        });
        break;
      }
      case 'drum':
      case 'train': {
        // 校場擂鼓
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }
      case 'brotherhood': {
        // 桃園結義神聖古鐘
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
        break;
      }
      default: {
        // 默認輕響
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }
    }
  } catch(err) {
    console.log('Sound synth error:', err);
  }
}

// ==================== BGM 背景音樂引擎 (實體音樂檔案) ====================
let currentBGM = null;
let currentScene = null;

// 您可以在此處將 URL 替換為您的 Lyria 音樂檔案 (例如: 'assets/lyria_battle.mp3')
const SCENE_MUSIC = {
  map: 'bgm_map.mp3',
  battle: 'bgm_battle.mp3',
  victory: 'bgm_victory.mp3',
  defeat: 'bgm_defeat.mp3'
};

window.playBGM = function(sceneType) {
  if (!gameState.soundEnabled) return;
  if (currentScene === sceneType && currentBGM) return; // 已經在播就不重播
  
  // 停止淡出計時器
  if (window._bgmFadeOutTimer) clearInterval(window._bgmFadeOutTimer);
  if (window._bgmFadeInTimer) clearInterval(window._bgmFadeInTimer);
  
  // 直接停止目前的音樂
  if (currentBGM) {
    try {
      currentBGM.pause();
      currentBGM.src = "";
    } catch(e) { /* ignore */ }
    currentBGM = null;
  }
  
  currentScene = sceneType;
  const url = SCENE_MUSIC[sceneType];
  
  if (url) {
    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.25;
      currentBGM = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('BGM Play failed:', e);
          // 不影響遊戲，只是沒音樂而已
        });
      }
    } catch(e) {
      console.log('BGM init failed:', e);
    }
  }
}

function stopBGM() {
  if (window._bgmFadeOutTimer) clearInterval(window._bgmFadeOutTimer);
  if (window._bgmFadeInTimer) clearInterval(window._bgmFadeInTimer);
  if (currentBGM) {
    try {
      currentBGM.pause();
      currentBGM.src = "";
    } catch(e) { /* ignore */ }
    currentBGM = null;
    currentScene = null;
  }
}

// ==================== 初始化遊戲 ====================

// ==================== 武將 RPG 經驗與升級系統 ====================
function addGeneralExp(gen, amount, reason = '') {
  if (!gen) return;
  if (!gen.level) gen.level = 1;
  if (!gen.exp) gen.exp = 0;
  if (!gen.freeStats) gen.freeStats = 0;

  gen.exp += amount;
  const maxLvl = (typeof LEVEL_CONFIG !== 'undefined' && LEVEL_CONFIG.maxLevel) || 20;

  let leveledUp = false;
  while (gen.level < maxLvl) {
    const needed = (typeof getExpRequiredForLevel === 'function') ? getExpRequiredForLevel(gen.level) : (gen.level * 100);
    if (gen.exp >= needed) {
      gen.exp -= needed;
      gen.level += 1;
      gen.freeStats = (gen.freeStats || 0) + 2;
      leveledUp = true;
    } else {
      break;
    }
  }

  if (leveledUp) {
    playSound('command_ok');
    addLog(`✨【武將歷練】${gen.name} 功勳卓著，升級至 Lv.${gen.level}！獲得 2 點自由潛能點！`, 'system');
  }
}

// ==================== 成就榮譽系統 ====================
function checkAchievements() {
  if (typeof ACHIEVEMENTS === 'undefined' || !gameState.unlockedAchievements) return;

  ACHIEVEMENTS.forEach(ach => {
    if (!gameState.unlockedAchievements.includes(ach.id)) {
      try {
        if (ach.check(gameState)) {
          gameState.unlockedAchievements.push(ach.id);
          playSound('victory');
          addLog(`🏆【天下榮譽】解鎖成就【${ach.name}】！獎勵：${ach.reward}`, 'system');
        }
      } catch(e) {}
    }
  });
}


// ==================== 朝廷官職與冊封系統 ====================
function openRanksModal() {
  const elRanksOverlay = document.getElementById('ranks-overlay');
  if (!elRanksOverlay || typeof LORD_RANKS === 'undefined') return;
  playSound('select');
  elRanksOverlay.classList.remove('hidden');

  const elLordRankTitle = document.getElementById('ranks-lord-title');
  const elLordRankDesc = document.getElementById('ranks-lord-desc');
  const elLordRankProgress = document.getElementById('ranks-lord-progress');

  const myCitiesCount = gameState.cities.filter(c => c.faction === gameState.playerFactionId).length;

  let currentRank = LORD_RANKS[0];
  for (const rank of LORD_RANKS) {
    if (myCitiesCount >= rank.minCities) {
      currentRank = rank;
    }
  }

  if (elLordRankTitle) elLordRankTitle.textContent = `👑 當前爵位：${currentRank.title}`;
  if (elLordRankDesc) elLordRankDesc.textContent = `【朝廷冊封】${currentRank.buffDesc} (需佔領 ${currentRank.minCities} 座城池)`;
  if (elLordRankProgress) elLordRankProgress.textContent = `當前版圖：${myCitiesCount} / ${gameState.cities.length} 城`;

  const elPositionsList = document.getElementById('ranks-positions-list');
  if (elPositionsList && typeof OFFICIAL_POSITIONS !== 'undefined') {
    elPositionsList.innerHTML = '';
    const myGens = gameState.generals.filter(g => g.faction === gameState.playerFactionId);

    OFFICIAL_POSITIONS.forEach(pos => {
      const card = document.createElement('div');
      card.className = 'glass-panel';
      card.style.padding = '8px 12px';
      card.style.marginBottom = '8px';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';

      const assignedGen = myGens.find(g => g.officialPosition === pos.id);

      card.innerHTML = `
        <div>
          <div style="font-weight: bold; color: var(--color-gold);">${pos.name} (${pos.type === 'military' ? '武官' : '文官'})</div>
          <div style="font-size: 0.8rem; color: #ccc;">加成：${pos.buff} (解鎖需 ${pos.requiredCities} 城)</div>
        </div>
        <div>
          <span style="font-size: 0.9rem; color: ${assignedGen ? '#81c784' : '#888'};">
            ${assignedGen ? `已任命：${assignedGen.name}` : (myCitiesCount >= pos.requiredCities ? '【空缺】' : '【尚未解鎖】')}
          </span>
        </div>
      `;
      elPositionsList.appendChild(card);
    });
  }
}

// ==================== 自創君主系統 ====================
let customLordData = {
  name: '趙無雙',
  courtesyName: '凌天',
  gender: 'male',
  portrait: 'portraits/custom_lord_1.jpg',
  banner: '龍',
  color: '#c62828',
  startingCity: 'xuchang',
  trait: 'militarism',
  stats: { lead: 85, str: 90, int: 75, pol: 70, cha: 85 },
  pointsRemaining: 15
};

const CUSTOM_PORTRAITS = [
  'portraits/custom_lord_1.jpg',
  'portraits/custom_lord_2.jpg',
  'portraits/zhao_yun.jpg',
  'portraits/guan_yu.jpg',
  'portraits/zhang_liao.jpg',
  'portraits/zhou_yu.jpg',
  'portraits/sun_ce.jpg',
  'portraits/diao_chan.jpg',
  'portraits/da_qiao.jpg',
  'portraits/zhu_rong.jpg'
];

function openCustomLordModal() {
  const elOverlay = document.getElementById('custom-lord-overlay');
  if (!elOverlay) return;
  playSound('select');
  elOverlay.classList.remove('hidden');
  initCustomLordUI();
}

function initCustomLordUI() {
  const nameInput = document.getElementById('custom-name-input');
  const courtesyInput = document.getElementById('custom-courtesy-input');
  const bannerInput = document.getElementById('custom-banner-input');
  const citySelect = document.getElementById('custom-city-select') || document.getElementById('custom-starting-city');
  const colorSelect = document.getElementById('custom-color-select');
  const traitSelect = document.getElementById('custom-trait-select');
  const pointsVal = document.getElementById('custom-points-val');
  const portraitPreview = document.getElementById('custom-lord-portrait-preview');
  const bannerPreview = document.getElementById('custom-lord-banner-preview');
  const bannerText = document.getElementById('custom-banner-text');
  const namePreview = document.getElementById('custom-lord-name-preview');
  const portraitsGrid = document.getElementById('custom-portraits-grid');

  if (nameInput) nameInput.value = customLordData.name;
  if (courtesyInput) courtesyInput.value = customLordData.courtesyName;
  if (bannerInput) bannerInput.value = customLordData.banner;
  if (colorSelect) colorSelect.value = customLordData.color;

  // 渲染立繪頭像選擇器
  if (portraitsGrid) {
    portraitsGrid.innerHTML = '';
    CUSTOM_PORTRAITS.forEach(imgUrl => {
      const thumb = document.createElement('div');
      thumb.className = `custom-portrait-thumb ${customLordData.portrait === imgUrl ? 'active' : ''}`;
      thumb.style.width = '52px';
      thumb.style.height = '52px';
      thumb.style.borderRadius = '6px';
      thumb.style.backgroundImage = `url('${imgUrl}')`;
      thumb.style.backgroundSize = 'cover';
      thumb.style.backgroundPosition = 'center';
      thumb.style.cursor = 'pointer';
      thumb.style.border = customLordData.portrait === imgUrl ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.3)';
      thumb.style.boxShadow = customLordData.portrait === imgUrl ? '0 0 8px #ffd700' : 'none';

      thumb.addEventListener('click', () => {
        playSound('select');
        customLordData.portrait = imgUrl;
        if (portraitPreview) portraitPreview.style.backgroundImage = `url('${imgUrl}')`;
        portraitsGrid.querySelectorAll('.custom-portrait-thumb').forEach(t => {
          t.style.border = '1px solid rgba(255,255,255,0.3)';
          t.style.boxShadow = 'none';
        });
        thumb.style.border = '2px solid #ffd700';
        thumb.style.boxShadow = '0 0 8px #ffd700';
      });

      portraitsGrid.appendChild(thumb);
    });
  }

  // 填入所有 22 座城池
  if (citySelect) {
    citySelect.innerHTML = '';
    CITIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.regionTag || '要地'})`;
      if (c.id === customLordData.startingCity) opt.selected = true;
      citySelect.appendChild(opt);
    });

    citySelect.addEventListener('change', () => {
      customLordData.startingCity = citySelect.value;
    });
  }

  // 顏色即時變更
  if (colorSelect) {
    colorSelect.addEventListener('change', () => {
      customLordData.color = colorSelect.value;
      if (bannerPreview) bannerPreview.style.background = colorSelect.value;
    });
  }

  // 姓名與旗幟即時變更
  const syncPreview = () => {
    const name = (nameInput && nameInput.value.trim()) || '自創雄主';
    const courtesy = (courtesyInput && courtesyInput.value.trim()) || '字 無';
    const banner = (bannerInput && bannerInput.value.trim()) || '主';
    if (namePreview) namePreview.textContent = `${name} (字 ${courtesy})`;
    if (bannerText) bannerText.textContent = banner.charAt(0);
  };

  if (nameInput) nameInput.addEventListener('input', syncPreview);
  if (courtesyInput) courtesyInput.addEventListener('input', syncPreview);
  if (bannerInput) bannerInput.addEventListener('input', syncPreview);
  syncPreview();

  const updateStatUI = () => {
    ['lead', 'str', 'int', 'pol', 'cha'].forEach(stat => {
      const elVal = document.getElementById(`custom-val-${stat}`);
      if (elVal) elVal.textContent = customLordData.stats[stat];
    });
    if (pointsVal) pointsVal.textContent = customLordData.pointsRemaining;
  };

  updateStatUI();

  // 步進按鈕
  ['lead', 'str', 'int', 'pol', 'cha'].forEach(stat => {
    const btnInc = document.getElementById(`btn-inc-${stat}`);
    const btnDec = document.getElementById(`btn-dec-${stat}`);

    if (btnInc && !btnInc._bound) {
      btnInc._bound = true;
      btnInc.addEventListener('click', () => {
        if (customLordData.pointsRemaining > 0 && customLordData.stats[stat] < 100) {
          customLordData.stats[stat]++;
          customLordData.pointsRemaining--;
          playSound('click');
          updateStatUI();
        }
      });
    }

    if (btnDec && !btnDec._bound) {
      btnDec._bound = true;
      btnDec.addEventListener('click', () => {
        if (customLordData.stats[stat] > 40) {
          customLordData.stats[stat]--;
          customLordData.pointsRemaining++;
          playSound('click');
          updateStatUI();
        }
      });
    }
  });

  const launchBtn = document.getElementById('btn-launch-custom-lord');
  if (launchBtn && !launchBtn._bound) {
    launchBtn._bound = true;
    launchBtn.addEventListener('click', () => {
      if (nameInput && nameInput.value.trim()) customLordData.name = nameInput.value.trim();
      if (courtesyInput && courtesyInput.value.trim()) customLordData.courtesyName = courtesyInput.value.trim();
      if (bannerInput && bannerInput.value.trim()) customLordData.banner = bannerInput.value.trim().charAt(0);
      if (citySelect) customLordData.startingCity = citySelect.value;
      if (colorSelect) customLordData.color = colorSelect.value;
      if (traitSelect) customLordData.trait = traitSelect.value;

      // 建立自創勢力
      FACTIONS['custom_faction'] = {
        id: 'custom_faction',
        name: customLordData.name,
        color: customLordData.color,
        secondaryColor: 'rgba(229, 57, 53, 0.2)',
        banner: customLordData.banner,
        leader: customLordData.name,
        trait: customLordData.trait
      };

      gameState.playerFactionId = 'custom_faction';
      gameState.year = 184;
      gameState.month = 1;

      // 建立自創將領
      const customGen = {
        id: 'custom_faction',
        name: customLordData.name,
        stats: { ...customLordData.stats },
        loyalty: 100,
        faction: 'custom_faction',
        city: customLordData.startingCity,
        portrait: customLordData.portrait,
        portraitColor: customLordData.color,
        description: `自創君主【${customLordData.name}】（字${customLordData.courtesyName}），高舉【${customLordData.banner}】字大旗起兵於【${customLordData.startingCity}】！`,
        appearanceYear: 184,
        level: 1,
        exp: 0,
        freeStats: 0
      };

      // 初始城池與武將 (全部 29 座城池健全初始化)
      gameState.cities = CITIES.map(c => ({
        ...c,
        faction: c.id === customLordData.startingCity ? 'custom_faction' : 'neutral',
        troops: c.id === customLordData.startingCity ? 25000 : 10000,
        gold: c.id === customLordData.startingCity ? 6000 : 2500,
        food: c.id === customLordData.startingCity ? 25000 : 10000,
        morale: 85,
        agriculture: c.agriculture || 250,
        commerce: c.commerce || 250,
        defense: c.defense || 600,
        maxAgriculture: c.maxAgriculture || 800,
        maxCommerce: c.maxCommerce || 800,
        maxDefense: c.maxDefense || 1100
      }));

      gameState.generals = [customGen, ...GENERALS.map(g => ({ ...g, faction: 'neutral', loyalty: 50 }))];

      document.getElementById('custom-lord-overlay')?.classList.add('hidden');
      document.getElementById('start-overlay')?.classList.add('hidden');

      playSound('command_ok');
      startGame();
    });
  }
}

function openAchievementsModal() {
  if (!elAchievementsOverlay || typeof ACHIEVEMENTS === 'undefined') return;
  playSound('select');
  elAchievementsOverlay.classList.remove('hidden');

  const unlocked = gameState.unlockedAchievements || [];
  if (elAchievementsRateText) {
    elAchievementsRateText.textContent = `達成進度：${unlocked.length} / ${ACHIEVEMENTS.length} (${Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%)`;
  }

  if (elAchievementsGrid) {
    elAchievementsGrid.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
      const isDone = unlocked.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achievement-card glass-panel ${isDone ? 'unlocked' : 'locked'}`;
      card.style.padding = '12px';
      card.style.border = isDone ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)';
      card.style.background = isDone ? 'rgba(255,215,0,0.1)' : 'rgba(0,0,0,0.4)';
      card.style.borderRadius = '8px';
      card.style.marginBottom = '10px';

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 2rem;">${ach.icon}</div>
          <div style="flex: 1;">
            <div style="font-size: 1.1rem; font-weight: bold; color: ${isDone ? '#ffd700' : '#888'};">${ach.name} ${isDone ? '【已達成】' : '【未達成】'}</div>
            <div style="font-size: 0.85rem; color: #ccc;">${ach.desc}</div>
            <div style="font-size: 0.8rem; color: #81c784; margin-top: 4px;">獎勵：${ach.reward}</div>
          </div>
        </div>
      `;
      elAchievementsGrid.appendChild(card);
    });
  }
}

// ==================== 科技樹軍略府系統 ====================
let currentTechTab = 'military';

function openTechTreeModal() {
  const elTechOverlay = document.getElementById('tech-overlay');
  if (!elTechOverlay || typeof TECH_TREE === 'undefined') return;
  playSound('select');
  elTechOverlay.classList.remove('hidden');

  // 計算國庫黃金與糧草
  const myCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
  const totalGold = myCities.reduce((sum, c) => sum + (Number(c.gold) || 0), 0);
  const totalFood = myCities.reduce((sum, c) => sum + (Number(c.food) || 0), 0);

  const elGoldDisp = document.getElementById('tech-player-gold');
  if (elGoldDisp) elGoldDisp.textContent = totalGold;

  // 綁定標籤頁按鈕
  const btnMil = document.getElementById('tab-military-tech');
  const btnCiv = document.getElementById('tab-civil-tech');
  
  if (btnMil && !btnMil._bound) {
    btnMil._bound = true;
    btnMil.addEventListener('click', () => {
      currentTechTab = 'military';
      btnMil.classList.add('active');
      if (btnCiv) btnCiv.classList.remove('active');
      renderTechTreeNodes();
    });
  }
  if (btnCiv && !btnCiv._bound) {
    btnCiv._bound = true;
    btnCiv.addEventListener('click', () => {
      currentTechTab = 'civil';
      btnCiv.classList.add('active');
      if (btnMil) btnMil.classList.remove('active');
      renderTechTreeNodes();
    });
  }

  renderTechTreeNodes();
}

function renderTechTreeNodes() {
  const elTechGrid = document.getElementById('tech-tree-grid');
  if (!elTechGrid) return;

  elTechGrid.innerHTML = '';
  const myTechs = gameState.researchedTechs || [];
  const filteredTechs = TECH_TREE.filter(t => (t.category || 'military') === currentTechTab);

  filteredTechs.forEach(tech => {
    const isResearched = myTechs.includes(tech.id);
    const costGold = tech.cost || 2000;
    const costFood = tech.costFood || Math.floor(costGold * 2.5);
    const descText = tech.description || '強國利兵之策。';

    const card = document.createElement('div');
    card.className = `tech-node-card glass-panel ${isResearched ? 'researched' : ''}`;
    card.style.padding = '12px';
    card.style.border = isResearched ? '1.5px solid #4caf50' : '1px solid rgba(255,255,255,0.2)';
    card.style.borderRadius = '8px';
    card.style.background = isResearched ? 'rgba(76,175,80,0.15)' : 'rgba(0,0,0,0.45)';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 1.1rem; font-weight: bold; color: ${isResearched ? '#81c784' : '#ffd700'};">
          ${tech.icon || '🛡️'} ${tech.name}
        </span>
        <span style="font-size: 0.75rem; color: ${isResearched ? '#81c784' : '#ffb74d'}; font-weight: bold;">
          ${isResearched ? '【已掌握】' : `第 ${tech.tier || 1} 階`}
        </span>
      </div>
      <div style="font-size: 0.85rem; color: #ddd; margin: 8px 0; line-height: 1.4;">${descText}</div>
      <div style="font-size: 0.8rem; color: var(--color-gold); margin-bottom: 8px;">
        研發需求：黃金 <b>${costGold}</b> 兩，糧草 <b>${costFood}</b> 石
      </div>
      <button class="btn-primary" style="width: 100%; padding: 6px; font-weight: bold; background: ${isResearched ? '#37474f' : 'linear-gradient(135deg, #f57f17, #e65100)'};" ${isResearched ? 'disabled' : ''} id="btn-tech-${tech.id}">
        ${isResearched ? '✅ 已研發完畢' : '⚡ 立即研發'}
      </button>
    `;

    // 點擊卡片更新右側詳細資訊
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      showTechDetail(tech, isResearched, costGold, costFood);
    });

    elTechGrid.appendChild(card);

    // 立即研發按鈕
    const btn = card.querySelector(`#btn-tech-${tech.id}`);
    if (btn && !isResearched) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const myCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
        const totalGold = myCities.reduce((sum, c) => sum + (Number(c.gold) || 0), 0);
        const totalFood = myCities.reduce((sum, c) => sum + (Number(c.food) || 0), 0);

        if (totalGold < costGold || totalFood < costFood) {
          alert(`國庫資源不足！研發【${tech.name}】需要黃金 ${costGold} 兩、糧草 ${costFood} 石（當前國庫：黃金 ${totalGold}、糧草 ${totalFood}）。`);
          return;
        }

        // 扣除國庫資源
        let remGold = costGold;
        let remFood = costFood;
        for (const c of myCities) {
          const takeG = Math.min(Number(c.gold) || 0, remGold);
          c.gold -= takeG;
          remGold -= takeG;
          const takeF = Math.min(Number(c.food) || 0, remFood);
          c.food -= takeF;
          remFood -= takeF;
          if (remGold <= 0 && remFood <= 0) break;
        }

        if (!gameState.researchedTechs) gameState.researchedTechs = [];
        gameState.researchedTechs.push(tech.id);

        if (typeof tech.effect === 'function') {
          if (!gameState.techBonuses) {
            gameState.techBonuses = {
              attackBonus: 0,
              defenseBonus: 0,
              infantryDefense: 0,
              cavalryDamage: 0,
              siegeDamage: 0,
              maxMorale: 100
            };
          }
          tech.effect(gameState);
        }

        playSound('command_ok');
        addLog(`🔬【科技突破】勢力成功掌握【${tech.name}】！軍事與國力大幅精進！`, 'highlight');
        updateGlobalStats();
        openTechTreeModal();
      });
    }
  });

  // 預設展示第一個科技詳情
  if (filteredTechs.length > 0) {
    const first = filteredTechs[0];
    const isRes = myTechs.includes(first.id);
    showTechDetail(first, isRes, first.cost || 2000, first.costFood || Math.floor((first.cost || 2000) * 2.5));
  }
}

function showTechDetail(tech, isResearched, costGold, costFood) {
  const detIcon = document.getElementById('tech-det-icon');
  const detName = document.getElementById('tech-det-name');
  const detTier = document.getElementById('tech-det-tier');
  const detCost = document.getElementById('tech-det-cost');
  const detReq = document.getElementById('tech-det-requires-text');
  const detDesc = document.getElementById('tech-det-desc');

  if (detIcon) detIcon.textContent = tech.icon || '🛡️';
  if (detName) detName.textContent = tech.name;
  if (detTier) detTier.textContent = isResearched ? '【已掌握・生效中】' : `第 ${tech.tier || 1} 階科技`;
  if (detCost) detCost.textContent = `黃金 ${costGold} 兩，糧草 ${costFood} 石`;
  if (detReq) detReq.textContent = (tech.requires && tech.requires.length > 0) ? tech.requires.map(r => {
    const rTech = TECH_TREE.find(t => t.id === r);
    return rTech ? rTech.name : r;
  }).join('、') : '無 (初階核心科技)';
  if (detDesc) detDesc.textContent = tech.description || '強國利兵之策。';
}

// ==================== 家族、子嗣與少主成長系統 ====================
function processDynastyGrowth() {
  if (!gameState.children) gameState.children = [];

  // 1. 每月有機率懷孕生子 (已婚且子女數小於 4)
  if (gameState.spouse && gameState.children.length < 4 && Math.random() < 0.12) {
    const isBoy = Math.random() > 0.5;
    const names = isBoy ? ['天佑', '子龍', '伯約', '承志', '凌霄', '漢興'] : ['月華', '夢蝶', '若曦', '雨霏', '青璿'];
    const chosenName = names[Math.floor(Math.random() * names.length)];
    const newChild = {
      id: `child_${Date.now()}`,
      name: chosenName,
      gender: isBoy ? '男' : '女',
      age: 1,
      stats: {
        lead: Math.floor(Math.random() * 20 + 60),
        str: Math.floor(Math.random() * 20 + 60),
        int: Math.floor(Math.random() * 20 + 60),
        pol: Math.floor(Math.random() * 20 + 60),
        cha: Math.floor(Math.random() * 20 + 70)
      },
      tutor: null,
      graduated: false
    };
    gameState.children.push(newChild);
    playSound('select');
    addLog(`👶【宗族喜訊】夫人誕下少主【${newChild.name}】（${newChild.gender}）！宗廟有後，天下同慶！`, 'system');
  }

  // 2. 每年 1 月子嗣長大 1 歲
  if (gameState.month === 1) {
    gameState.children.forEach(child => {
      if (!child.graduated) {
        child.age += 1;
        if (child.tutor) {
          child.stats.lead = Math.min(100, child.stats.lead + Math.floor(Math.random() * 3 + 1));
          child.stats.str = Math.min(100, child.stats.str + Math.floor(Math.random() * 3 + 1));
          child.stats.int = Math.min(100, child.stats.int + Math.floor(Math.random() * 3 + 1));
          child.stats.pol = Math.min(100, child.stats.pol + Math.floor(Math.random() * 3 + 1));
        }
        // 滿 16 歲及冠出仕
        if (child.age >= 16) {
          child.graduated = true;
          const newGen = {
            id: child.id,
            name: child.name,
            stats: child.stats,
            loyalty: 100,
            faction: gameState.playerFactionId,
            city: gameState.cities.find(c => c.faction === gameState.playerFactionId)?.id || 'luoyang',
            portrait: 'portraits/default.jpg',
            portraitColor: '#ffd700',
            description: `主公之子嗣，經名師教導及冠出仕，忠心耿耿誓死輔佐！`,
            level: 1,
            exp: 0,
            freeStats: 5
          };
          gameState.generals.push(newGen);
          playSound('brotherhood');
          addLog(`👑【及冠出仕】少主【${child.name}】已年滿十六，文武兼備，正式受封為將軍出仕輔佐！`, 'system');
        }
      }
    });
  }
}

function openFamilyModal() {
  const elFamilyOverlay = document.getElementById('family-overlay');
  if (!elFamilyOverlay) return;
  playSound('select');
  elFamilyOverlay.classList.remove('hidden');

  const elSpouseInfo = document.getElementById('family-spouse-info');
  if (elSpouseInfo) {
    if (gameState.spouse) {
      const spGen = gameState.generals.find(g => g.id === gameState.spouse);
      elSpouseInfo.innerHTML = `
        <div style="font-size: 1.1rem; color: #ff80ab; font-weight: bold;">💍 結髮正妻：${spGen ? spGen.name : '名門淑媛'}</div>
        <div style="font-size: 0.85rem; color: #ccc; margin-top: 4px;">恩愛相隨，夫妻齊心，提升全勢力忠誠度與民心安定！</div>
      `;
    } else {
      elSpouseInfo.innerHTML = `
        <div style="font-size: 1rem; color: #888;">尚未迎娶正妻（可至武將詳情頁點擊【提親締約】迎娶心儀名將）</div>
      `;
    }
  }

  const elChildrenList = document.getElementById('family-children-list');
  if (elChildrenList) {
    elChildrenList.innerHTML = '';
    const children = gameState.children || [];
    if (children.length === 0) {
      elChildrenList.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">尚無子嗣</div>`;
    } else {
      children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.border = '1px solid rgba(255,215,0,0.2)';
        card.style.borderRadius = '6px';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:1.1rem; color:#ffd700; font-weight:bold;">${child.name}（${child.gender}）・${child.age} 歲 ${child.graduated ? '【已出仕】' : '【成長中】'}</div>
            <div style="font-size:0.85rem; color:#81c784;">統率:${child.stats.lead} 武力:${child.stats.str} 智力:${child.stats.int} 政治:${child.stats.pol}</div>
          </div>
        `;
        elChildrenList.appendChild(card);
      });
    }
  }
}

// ==================== 電影過場動畫系統 ====================
function triggerCinematic(type, title, subtitle, general, bgImage, callback) {
  const elCinematicOverlay = document.getElementById('cinematic-overlay');
  if (!elCinematicOverlay) {
    if (typeof callback === 'function') callback();
    return;
  }

  const elBg = document.getElementById('cinematic-bg');
  const elSlice = document.getElementById('cinematic-general-slice');
  const elTitle = document.getElementById('cinematic-calligraphy-title');
  const elSub = document.getElementById('cinematic-subtitle-text');

  if (elBg && bgImage) elBg.style.backgroundImage = `url(${bgImage})`;
  if (elSlice && general) elSlice.style.backgroundImage = `url(${general.portrait || 'portraits/default.jpg'})`;
  if (elTitle) elTitle.textContent = title;
  if (elSub) elSub.textContent = subtitle;

  elCinematicOverlay.classList.remove('hidden');

  const closeFn = () => {
    elCinematicOverlay.classList.add('hidden');
    elCinematicOverlay.removeEventListener('click', closeFn);
    if (typeof callback === 'function') callback();
  };

  elCinematicOverlay.addEventListener('click', closeFn);
  setTimeout(closeFn, 3500);
}


// ==================== 多人連線與同機多人管理器 ====================
let multiplayerMgr = null;
let hotseatState = {
  active: false,
  players: [], // ['cao_cao', 'liu_bei', ...]
  currentIndex: 0
};

function initMultiplayer() {
  const gameAppInterface = {
    gameState,
    addLog,
    renderMap,
    updateGlobalStats,
    startGame,
    processEndTurn: () => {
      // 伺服器同步推進回合
      gameState.month++;
      if (gameState.month > 12) {
        gameState.year++;
        gameState.month = 1;
        checkHistoricalEvents();
      }
      addLog(`✨【天下歲月】西元 ${gameState.year} 年 ${gameState.month} 月，天下大勢翻覆！`, 'system');
      updateGlobalStats();
      renderMap();
    },
    startHotseatLobby: () => {
      startHotseatMode();
    }
  };

  multiplayerMgr = new MultiplayerManager(gameAppInterface);

  const mpBtn = document.getElementById('multiplayer-btn');
  if (mpBtn) {
    mpBtn.addEventListener('click', () => {
      playSound('select');
      const elOverlay = document.getElementById('multiplayer-overlay');
      if (elOverlay) elOverlay.classList.remove('hidden');
    });
  }
}

function startHotseatMode() {
  const scenario = SCENARIOS[0];
  hotseatState.active = true;
  hotseatState.players = scenario.activeFactions.slice(0, 3); // 默認前3個勢力
  hotseatState.currentIndex = 0;
  
  gameState.playerFactionId = hotseatState.players[0];
  document.getElementById('start-overlay')?.classList.add('hidden');
  
  addLog(`🎮【同機多人】已開啟同機輪流操盤模式！參戰君主共計 ${hotseatState.players.length} 位！`, 'highlight');
  startGame();
}


// ==================== 👑 己方領地快速導航與快速鍵 ====================
function updateMyCitiesQuickNav() {
  const container = document.getElementById('nav-cities-scroll');
  if (!container) return;

  const myCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
  container.innerHTML = '';

  myCities.forEach(city => {
    const isSelected = gameState.selectedCity && gameState.selectedCity.id === city.id;
    const pill = document.createElement('button');
    pill.className = `nav-city-pill ${isSelected ? 'active' : ''}`;
    pill.innerHTML = `<span>🏰 ${city.name}</span><span style="font-size:0.7rem; opacity:0.85;">(${Math.floor(city.troops/1000)}k兵)</span>`;
    
    pill.addEventListener('click', () => {
      playSound('select');
      selectCity(city);
    });

    container.appendChild(pill);
  });
}

function cycleMyCity(direction = 1) {
  const myCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
  if (myCities.length === 0) return;

  let currentIndex = myCities.findIndex(c => gameState.selectedCity && gameState.selectedCity.id === c.id);
  if (currentIndex === -1) currentIndex = 0;
  else currentIndex = (currentIndex + direction + myCities.length) % myCities.length;

  selectCity(myCities[currentIndex]);
  playSound('select');
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // 若在輸入框中則不觸發快速鍵
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    if (e.key === ' ' || (e.key === 'Enter' && e.ctrlKey)) {
      // Space / Ctrl+Enter: 結束本月
      e.preventDefault();
      document.getElementById('end-turn-btn')?.click();
    } else if (e.key === '[' || e.key === 'Tab') {
      // Tab / [: 上一座城
      e.preventDefault();
      cycleMyCity(-1);
    } else if (e.key === ']') {
      // ]: 下一座城
      e.preventDefault();
      cycleMyCity(1);
    } else if (e.key === 'a' || e.key === 'A') {
      // A: 出征
      triggerCommand('attack');
    } else if (e.key === 'r' || e.key === 'R') {
      // R: 徵兵
      triggerCommand('conscript');
    } else if (e.key === 'd' || e.key === 'D') {
      // D: 開發
      triggerCommand('develop_agri');
    } else if (e.key === 's' || e.key === 'S') {
      // S: 探索
      triggerCommand('search');
    } else if (e.key === 'Escape') {
      // Esc: 取消目標選擇或關閉彈窗
      if (gameState.isSelectingTarget) {
        cancelTargetSelection();
      } else {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
      }
    }
  });

  // 綁定快速導航切換按鈕
  document.getElementById('nav-prev-city-btn')?.addEventListener('click', () => cycleMyCity(-1));
  document.getElementById('nav-next-city-btn')?.addEventListener('click', () => cycleMyCity(1));
  document.getElementById('target-hint-cancel-btn')?.addEventListener('click', () => cancelTargetSelection());
}

function cancelTargetSelection() {
  gameState.isSelectingTarget = false;
  gameState.pendingDispatch = null;
  document.getElementById('target-hint-banner')?.classList.add('hidden');
  renderMap();
  addLog('已取消目標選擇。', 'system');
}

function initGameApp() {
  gameState.cities = JSON.parse(JSON.stringify(CITIES));
  gameState.generals = JSON.parse(JSON.stringify(GENERALS)).map(g => {
    if (g.loyalty === undefined) g.loyalty = g.faction === 'neutral' ? 50 : 100;
    if (!g.items) g.items = [];
    return g;
  });
  
  initStartMenu();
  bindEvents();
  initMultiplayer();
  initKeyboardShortcuts();
  
  // 開始播放地圖音樂
  document.body.addEventListener('click', () => {
    if (!currentBGM && currentScene !== 'battle' && currentScene !== 'victory' && currentScene !== 'defeat') {
      playBGM('map');
    }
  }, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGameApp);
} else {
  initGameApp();
}

function bindEvents() {
  elMap.addEventListener('click', (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'game-map') {
      deselectCity();
    }
  });

  elEndTurnBtn.addEventListener('click', () => {
    playSound('command_ok');
    if (multiplayerMgr && multiplayerMgr.notifyEndTurnReady()) {
      addLog('⏳ 已發送回合就緒信號，等待同局其他君主結束本月...', 'system');
      return;
    }
    if (hotseatState.active) {
      // 切換至下一位同機玩家
      hotseatState.currentIndex = (hotseatState.currentIndex + 1) % hotseatState.players.length;
      gameState.playerFactionId = hotseatState.players[hotseatState.currentIndex];
      const nextFaction = FACTIONS[gameState.playerFactionId];
      alert(`🔔 請【${nextFaction.name}（${nextFaction.leader}）】接替操盤！`);
      addLog(`🔔 輪到【${nextFaction.name}（${nextFaction.leader}）】勢力操盤！`, 'highlight');
      if (hotseatState.currentIndex === 0) {
        processEndTurn();
      } else {
        updateGlobalStats();
        renderMap();
        const myCap = gameState.cities.find(c => c.faction === gameState.playerFactionId);
        if (myCap) selectCity(myCap);
      }
      return;
    }
    processEndTurn();
  });

  elAudioToggleBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    if (gameState.soundEnabled) {
      initAudio();
      elAudioToggleBtn.textContent = '🔊';
      elAudioToggleBtn.style.borderColor = 'var(--color-gold)';
      playBGM('map');
      playSound('select');
    } else {
      elAudioToggleBtn.textContent = '🎵';
      elAudioToggleBtn.style.borderColor = 'var(--color-panel-border)';
      stopBGM();
    }
  });

  elCloseGeneralBtn.addEventListener('click', () => {
    playSound('click');
    elGeneralOverlay.classList.add('hidden');
  });

  elCloseSelectorBtn.addEventListener('click', () => {
    playSound('click');
    elSelectorOverlay.classList.add('hidden');
    
    // 如果關閉時正處於選擇目標狀態，需復原狀態 (不退還黃金，因為尚未扣除)
    if (gameState.isSelectingTarget && gameState.pendingDispatch) {
      gameState.isSelectingTarget = false;
      const dispatch = gameState.pendingDispatch;
      gameState.pendingDispatch = null;
      updateGlobalStats();
      selectCity(dispatch.origin);
    }
  });

  elCloseDispatchBtn.addEventListener('click', () => {
    playSound('click');
    elDispatchOverlay.classList.add('hidden');
    gameState.isSelectingTarget = false;
    const dispatch = gameState.pendingDispatch;
    gameState.pendingDispatch = null;
    updateGlobalStats();
    selectCity(dispatch.origin);
  });

  elDispatchTroopsSlider.addEventListener('input', (e) => {
    elDispatchTroopsVal.textContent = e.target.value;
  });
  
  if (elDispatchGoldSlider) {
    elDispatchGoldSlider.addEventListener('input', (e) => {
      elDispatchGoldVal.textContent = e.target.value;
    });
  }
  if (elDispatchFoodSlider) {
    elDispatchFoodSlider.addEventListener('input', (e) => {
      elDispatchFoodVal.textContent = e.target.value;
    });
  }

  elDispatchConfirmBtn.addEventListener('click', () => {
    playSound('command_ok');
    executeDispatch();
  });

  elCloseRewardTypeBtn.addEventListener('click', () => {
    playSound('click');
    elRewardTypeOverlay.classList.add('hidden');
  });

  elBtnRewardGold.addEventListener('click', () => {
    playSound('select');
    elRewardTypeOverlay.classList.add('hidden');
    gameState.activeCommand = 'reward_gold';
    showSelector('reward_gold');
  });

  elBtnRewardItem.addEventListener('click', () => {
    playSound('select');
    if (gameState.factionItems.length === 0) {
      alert('國庫中目前沒有任何寶物！可指派武將「探索」來發掘。');
      return;
    }
    elRewardTypeOverlay.classList.add('hidden');
    showItemSelector();
  });

  elCloseItemSelectorBtn.addEventListener('click', () => {
    playSound('click');
    elItemSelectorOverlay.classList.add('hidden');
  });

  // 存檔 / 讀檔
  elSaveBtn.addEventListener('click', () => {
    playSound('command_ok');
    saveGame();
  });

  elLoadBtn.addEventListener('click', () => {
    playSound('select');
    loadGame();
  });

  // 家族子嗣府
  const elFamilyBtn = document.getElementById('family-btn');
  const elFamilyCloseBtn = document.getElementById('family-close-btn');
  if (elFamilyBtn) elFamilyBtn.addEventListener('click', openFamilyModal);
  if (elFamilyCloseBtn) elFamilyCloseBtn.addEventListener('click', () => {
    document.getElementById('family-overlay')?.classList.add('hidden');
  });

  // 朝廷官職
  const elRanksBtn = document.getElementById('ranks-btn');
  const elRanksCloseBtn = document.getElementById('ranks-close-btn');
  if (elRanksBtn) elRanksBtn.addEventListener('click', openRanksModal);
  if (elRanksCloseBtn) elRanksCloseBtn.addEventListener('click', () => {
    document.getElementById('ranks-overlay')?.classList.add('hidden');
  });

  // 天下成就
  const elAchievementsBtn = document.getElementById('achievements-btn');
  const elAchievementsCloseBtn = document.getElementById('achievements-close-btn');
  if (elAchievementsBtn) elAchievementsBtn.addEventListener('click', openAchievementsModal);
  if (elAchievementsCloseBtn) elAchievementsCloseBtn.addEventListener('click', () => {
    document.getElementById('achievements-overlay')?.classList.add('hidden');
  });

  // 勢力科技
  const elTechBtn = document.getElementById('tech-btn');
  const elTechCloseBtn = document.getElementById('tech-close-btn');
  if (elTechBtn) elTechBtn.addEventListener('click', openTechTreeModal);
  if (elTechCloseBtn) elTechCloseBtn.addEventListener('click', () => {
    document.getElementById('tech-overlay')?.classList.add('hidden');
  });

  // 自創君主立足
  const elBtnOpenCustomLord = document.getElementById('btn-open-custom-lord');
  const elCustomLordCloseBtn = document.getElementById('custom-lord-close-btn');
  if (elBtnOpenCustomLord) elBtnOpenCustomLord.addEventListener('click', openCustomLordModal);
  if (elCustomLordCloseBtn) elCustomLordCloseBtn.addEventListener('click', () => {
    document.getElementById('custom-lord-overlay')?.classList.add('hidden');
  });
}

// ==================== 開局選單 (劇本與勢力選擇) ====================
function initStartMenu() {
  checkAndShowResumeBanner();
  const elScenarioArea = document.getElementById('scenario-selection-area');
  const elFactionArea = document.getElementById('faction-selection-area');
  const elScenarioContainer = document.getElementById('scenario-select-container');
  const elScenarioPreview = document.getElementById('scenario-preview-text');
  const elConfirmScenarioBtn = document.getElementById('confirm-scenario-btn');
  const elBackToScenarioBtn = document.getElementById('back-to-scenario-btn');

  let selectedScenarioData = null;

  // 1. 渲染劇本卡片
  elScenarioContainer.innerHTML = '';
  SCENARIOS.forEach(scenario => {
    const card = document.createElement('div');
    card.className = 'faction-card glass-panel';
    card.style.textAlign = 'left';
    card.innerHTML = `
      <div style="font-size: 1.2rem; color: var(--color-gold); font-weight: bold;">${scenario.year}年：${scenario.name}</div>
    `;
    card.addEventListener('click', () => {
      playSound('select');
      document.querySelectorAll('#scenario-select-container .faction-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedScenarioData = scenario;
      elConfirmScenarioBtn.disabled = false;
      elScenarioPreview.textContent = scenario.description;
    });
    elScenarioContainer.appendChild(card);
  });

  // 預設選中第一個劇本
  if (elScenarioContainer.firstElementChild) {
    elScenarioContainer.firstElementChild.classList.add('selected');
    selectedScenarioData = SCENARIOS[0];
    elConfirmScenarioBtn.disabled = false;
    elScenarioPreview.textContent = SCENARIOS[0].description;
  }

  // 2. 確認劇本，切換至選擇勢力
  elConfirmScenarioBtn.addEventListener('click', () => {
    playSound('command_ok');
    if (!selectedScenarioData) selectedScenarioData = SCENARIOS[0];
    gameState.selectedScenario = selectedScenarioData;
    gameState.scenarioId = selectedScenarioData.id;
    gameState.year = selectedScenarioData.year;
    gameState.month = selectedScenarioData.month;
    
    // 初始化暫時的勢力狀態供預覽
    initTempStateForPreview(selectedScenarioData);
    
    elScenarioArea.style.display = 'none';
    elFactionArea.style.display = 'block';
    
    renderFactionSelect(selectedScenarioData);
  });

  // 返回劇本選擇
  elBackToScenarioBtn.addEventListener('click', () => {
    playSound('select');
    elScenarioArea.style.display = 'block';
    elFactionArea.style.display = 'none';
    gameState.scenarioId = null;
    gameState.playerFactionId = null;
    elStartGameBtn.disabled = true;
    elFactionSelectContainer.innerHTML = '';
    document.getElementById('faction-preview-text').textContent = '請點擊上方勢力頭像，查看其介紹與開局實力。';
  });

  elStartGameBtn.addEventListener('click', () => {
    playSound('command_ok');
    elStartOverlay.classList.add('hidden');
    startGame();
  });
}

function initTempStateForPreview(scenario) {
  // 將 CITIES 複製一份並套用劇本設定
  gameState.cities = CITIES.map(baseCity => {
    const cityConfig = scenario.citiesConfig[baseCity.id] || { faction: 'neutral', troops: 10000 };
    return { ...baseCity, ...cityConfig };
  });

  // 將 GENERALS 複製一份，僅保留該年代已登場的武將
  gameState.generals = GENERALS.filter(g => g.appearanceYear <= scenario.year).map(g => ({ ...g }));
  
  // 自動將君主分發到對應勢力與其擁有的城池
  // 為簡化預覽，這裡我們先粗略分發 (實際開局在startGame前會再執行一次更嚴謹的分配)
  gameState.generals.forEach(g => {
    // 若該武將是君主
    if (FACTIONS[g.id]) {
      g.faction = g.id;
      // 找一座該勢力的城
      const city = gameState.cities.find(c => c.faction === g.faction);
      if (city) g.city = city.id;
    } else {
      // 非君主，如果在劇本預設的 appearanceCity 有歸屬，則加入該勢力，否則為 neutral
      const city = gameState.cities.find(c => c.id === g.appearanceCity);
      if (city && city.faction !== 'neutral') {
        g.faction = city.faction;
        g.city = city.id;
      } else {
        g.faction = 'neutral';
        g.city = g.appearanceCity;
      }
    }
  });
}

function renderFactionSelect(scenario) {
  elFactionSelectContainer.innerHTML = '';
  
  scenario.activeFactions.forEach(factionId => {
    const faction = FACTIONS[factionId];
    if (!faction) return;
    
    const factionCities = gameState.cities.filter(c => c.faction === faction.id);
    const factionGenerals = gameState.generals.filter(g => g.faction === faction.id);
    const totalTroops = factionCities.reduce((sum, c) => sum + c.troops, 0);
    const leaderGen = gameState.generals.find(g => g.id === faction.id);
    const portraitImg = leaderGen ? leaderGen.portrait : 'portraits/default.jpg';
    
    const card = document.createElement('div');
    card.className = 'faction-card glass-panel';
    card.dataset.factionId = faction.id;
    card.innerHTML = `
      <div class="faction-flag-large" style="background-image: url('${portraitImg}'); border-color: ${faction.color}; box-shadow: 0 0 12px ${faction.color};"></div>
      <div class="faction-card-name" style="color: ${faction.color};">${faction.name}</div>
      <div class="faction-card-leader">主公：${faction.leader}</div>
      <div style="font-size: 0.75rem; color: var(--color-text-dim); text-align: left; width: 100%;">
        <div>領土: ${factionCities.length} 城</div>
        <div>兵力: ${totalTroops}</div>
        <div>將領: ${factionGenerals.length} 員</div>
      </div>
    `;

    card.addEventListener('click', () => {
      playSound('select');
      document.querySelectorAll('#faction-select-container .faction-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      gameState.playerFactionId = faction.id;
      elStartGameBtn.disabled = false;
      
      document.getElementById('faction-preview-text').innerHTML = getFactionDesc(faction.id);
    });

    elFactionSelectContainer.appendChild(card);
  });

  // 預設選中第一個勢力
  if (elFactionSelectContainer.firstElementChild && scenario.activeFactions.length > 0) {
    elFactionSelectContainer.firstElementChild.classList.add('selected');
    gameState.playerFactionId = scenario.activeFactions[0];
    elStartGameBtn.disabled = false;
    document.getElementById('faction-preview-text').innerHTML = getFactionDesc(scenario.activeFactions[0]);
  }
}

function getFactionDesc(id) {
  const descs = {
    cao_cao: `<strong>曹操（魏）</strong>：文臣武將陣容豪華，兵精糧足。政治與智力極高，開局發展速度極快，是爭奪天下的首選勢力。`,
    liu_bei: `<strong>劉備（蜀）</strong>：擁有關羽、張飛、趙雲等頂尖猛將，且劉備魅力極高，容易招募天下名士。`,
    sun_quan: `<strong>孫權（吳）</strong>：手握長江天險，商業極度發達，開局黃金收入豐厚。統帥智謀出眾，防守反擊能力極強。`,
    dong_zhuo: `<strong>董卓（董）</strong>：兵馬實力開局最強，但手下武將忠誠與魅力較低，需要防備內亂與外部聯軍攻勢。`,
    yuan_shao: `<strong>袁紹（袁）</strong>：四世三公底蘊深厚，開局人口極多、兵力龐大，農業基礎雄厚，具有極強的持續戰爭潛力。`
  };
  return descs[id] || '';
}

// ==================== 開始遊戲與更新UI ====================
function startGame() {
  const scenario = gameState.selectedScenario || SCENARIOS.find(s => s.id === gameState.scenarioId) || SCENARIOS[0];
  gameState.scenarioId = scenario.id;
  gameState.year = scenario.year;
  if (!gameState.playerFactionId) {
    gameState.playerFactionId = (scenario.activeFactions && scenario.activeFactions[0]) || 'cao_cao';
  }

  // 如果不是自創君主，則依劇本嚴謹初始化城池與武將配置
  if (gameState.playerFactionId !== 'custom_faction') {
    gameState.cities = CITIES.map(baseCity => {
      const cityConfig = (scenario.citiesConfig && scenario.citiesConfig[baseCity.id]) || { faction: 'neutral', troops: 10000 };
      return { ...baseCity, ...cityConfig };
    });

    gameState.generals = GENERALS.filter(g => g.appearanceYear <= scenario.year).map(g => ({ ...g }));
    gameState.generals.forEach(g => {
      if (g.loyalty === undefined) g.loyalty = g.faction === 'neutral' ? 50 : 100;
      if (!g.items) g.items = [];
      if (FACTIONS[g.id]) {
        g.faction = g.id;
        const city = gameState.cities.find(c => c.faction === g.faction);
        if (city) g.city = city.id;
      } else {
        const city = gameState.cities.find(c => c.id === g.appearanceCity);
        if (city && city.faction !== 'neutral') {
          g.faction = city.faction;
          g.city = city.id;
        } else {
          g.faction = 'neutral';
          g.city = g.appearanceCity;
        }
      }
    });
  }

  const playerFaction = FACTIONS[gameState.playerFactionId] || FACTIONS['cao_cao'];
  
  // 應用君主天賦 (初始資源加成)
  if (playerFaction.trait === 'agriculture') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.food += 5000; });
  } else if (playerFaction.trait === 'commerce') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.gold += 3000; });
  } else if (playerFaction.trait === 'militarism') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.troops += 2000; });
  } else if (playerFaction.trait === 'prestige') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.gold += 3000; });
  } else if (playerFaction.trait === 'defensive') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.defense += 100; });
  } else if (playerFaction.trait === 'horde') {
    gameState.cities.forEach(c => { if (c.faction === playerFaction.id) c.troops += 5000; });
  }

  updateGlobalStats();
  renderMap();
  autoSaveGame();
  
  // 自動選中玩家的首座城池
  const playerCapital = gameState.cities.find(c => c.faction === gameState.playerFactionId) || gameState.cities[0];
  if (playerCapital) {
    selectCity(playerCapital);
  }
  updateMyCitiesQuickNav();

  addLog(`⚔️ 歷史的序幕拉開！西元 ${gameState.year} 年，您選擇扮演【${playerFaction.leader}】勢力，開始逐鹿中原之旅。`, 'system');
  addLog(`💡 溫馨提示：不同君主具有獨特天賦，且武將兵種之間存在相剋關係（騎剋步、步剋弓、弓剋騎）。`, 'system');
}

// ==================== 四季時令天候系統 ====================
function getSeason(month) {
  if (month >= 1 && month <= 3) return { name: '春生', effect: '農耕增益 +30%', icon: '🌸', color: '#81c784' };
  if (month >= 4 && month <= 6) return { name: '夏長', effect: '商業增益 +20% / 火計加成', icon: '☀️', color: '#ffb74d' };
  if (month >= 7 && month <= 9) return { name: '秋收', effect: '季度大徵收糧草 +20%', icon: '🍁', color: '#ff8a65' };
  return { name: '冬藏', effect: '軍隊消耗降低 / 移速減緩', icon: '❄️', color: '#90caf9' };
}

function updateSeasonDisplay() {
  if (!elSeasonBadge) return;
  const s = getSeason(gameState.month || 1);
  elSeasonBadge.innerHTML = `${s.icon} ${s.name}・${s.effect.split(' ')[0]}`;
  elSeasonBadge.title = `【${s.name}時令】${s.effect}`;
  elSeasonBadge.style.color = s.color;
}

function updateGlobalStats() {
  const pFaction = FACTIONS[gameState.playerFactionId] || { name: '自選', color: '#ffd54f', banner: '主', leader: '主公' };
  const leaderGen = gameState.generals.find(g => 
    g.id === gameState.playerFactionId || 
    (gameState.playerFactionId === 'custom_faction' && (g.id === 'custom_lord' || g.id === 'custom_faction')) ||
    (g.faction === gameState.playerFactionId && FACTIONS[g.id])
  ) || gameState.generals.find(g => g.faction === gameState.playerFactionId);
  const leaderPortrait = leaderGen ? (leaderGen.portrait || 'portraits/default.jpg') : 'portraits/default.jpg';
  
  elFactionStatusArea.innerHTML = `
    <div class="faction-badge" style="background-image: url('${leaderPortrait}'); border-color: ${pFaction.color}; box-shadow: 0 0 10px ${pFaction.color};"></div>
    <div class="stat-item" style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.1;">
      <span class="stat-label" style="font-size: 0.65rem; color: #aaa;">君主</span>
      <span class="stat-value" style="color: ${pFaction.color}; white-space: nowrap; font-size: 0.95rem; font-weight: bold;">${pFaction.leader}</span>
    </div>
  `;
  
  elGameDate.textContent = `${gameState.year}年 ${gameState.month}月`;
  updateSeasonDisplay();
  checkAchievements();
  processDynastyGrowth();
  
  const factionCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
  const factionGenerals = gameState.generals.filter(g => g.faction === gameState.playerFactionId);
  
  const totalGold = factionCities.reduce((sum, c) => sum + (Number(c.gold) || 0), 0);
  const totalFood = factionCities.reduce((sum, c) => sum + (Number(c.food) || 0), 0);
  const totalTroops = factionCities.reduce((sum, c) => sum + (Number(c.troops) || 0), 0);
  
  elFactionGold.textContent = totalGold;
  elFactionFood.textContent = totalFood;
  elFactionTroops.textContent = totalTroops;
  elFactionGenerals.textContent = factionGenerals.length;
  
  // 左下角君主卡
  elPlayerLeaderPortrait.style.backgroundImage = `url('${leaderPortrait}')`;
  elPlayerLeaderPortrait.textContent = '';
  elPlayerLeaderPortrait.style.borderColor = pFaction.color;
  elPlayerLeaderPortrait.style.boxShadow = `0 0 12px ${pFaction.color}`;
  
  elPlayerLeaderName.textContent = pFaction.leader;
  elPlayerFactionName.textContent = `${pFaction.name}軍勢力`;
  
  if (leaderGen) {
    elPlayerFactionDesc.innerHTML = `
      統率: ${leaderGen.stats.lead} | 武力: ${leaderGen.stats.str} | 智力: ${leaderGen.stats.int}<br>
      政治: ${leaderGen.stats.pol} | 魅力: ${leaderGen.stats.cha}<br>
      <span style="color: var(--color-gold-bright);">控制城池數：${factionCities.length} / ${gameState.cities.length}</span>
    `;
  }
  
  checkGameEnding(factionCities.length, gameState.cities.length);
}

function checkGameEnding(playerCityCount, totalCityCount) {
  const elEndingOverlay = document.getElementById('ending-overlay');
  if (!elEndingOverlay) return;

  if (playerCityCount === totalCityCount) {
    document.getElementById('ending-title').textContent = '天 下 一 統';
    document.getElementById('ending-title').style.color = 'var(--color-gold-bright)';
    document.getElementById('ending-title').style.textShadow = '0 0 15px var(--color-gold)';
    document.getElementById('ending-subtitle').textContent = '歷經數十載征戰，天下終於重歸一統！';
    document.getElementById('ending-image').style.backgroundImage = 'url(background_real.jpg)';
    document.getElementById('ending-desc').textContent = '將軍的豐功偉業將名垂青史！';
    elEndingOverlay.classList.remove('hidden');
    playBGM('victory');
  } else if (playerCityCount === 0 && gameState.cities.length > 0 && gameState.cities.some(c => c.faction === gameState.playerFactionId)) {
    document.getElementById('ending-title').textContent = '勢 力 覆 滅';
    document.getElementById('ending-title').style.color = '#ff3d00';
    document.getElementById('ending-title').style.textShadow = '0 0 15px #ff0000';
    document.getElementById('ending-subtitle').textContent = '您的領地已全部淪陷，千秋霸業化為泡影。';
    document.getElementById('ending-image').style.backgroundImage = 'url(battlefield.jpg)';
    document.getElementById('ending-desc').textContent = '勝敗乃兵家常事，大俠請重新來過！';
    elEndingOverlay.classList.remove('hidden');
    playBGM('defeat');
  }
}

// ==================== 地圖渲染 ====================
function renderMap() {
  elRoutesGroup.innerHTML = '';
  CONNECTIONS.forEach(route => {
    const c1 = gameState.cities.find(c => c.id === route[0]);
    const c2 = gameState.cities.find(c => c.id === route[1]);
    if (c1 && c2) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', c1.x);
      line.setAttribute('y1', c1.y);
      line.setAttribute('x2', c2.x);
      line.setAttribute('y2', c2.y);
      const isSea = (c1.id === 'yizhou' || c2.id === 'yizhou');
      line.className.baseVal = isSea ? 'map-route map-sea-route' : 'map-route';
      line.id = `route-${c1.id}-${c2.id}`;
      elRoutesGroup.appendChild(line);
    }
  });

  elCitiesGroup.innerHTML = '';
  gameState.cities.forEach(city => {
    const faction = FACTIONS[city.faction] || FACTIONS['neutral'] || { name: '中立', color: '#757575', banner: '空', leader: '無' };
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.className.baseVal = 'city-group';
    g.id = `city-node-${city.id}`;
    
    const isMyCity = city.faction === gameState.playerFactionId;
    const isTargetMode = gameState.isSelectingTarget && gameState.pendingDispatch;
    let isValidTarget = false;

    if (isTargetMode) {
      const orig = gameState.pendingDispatch.origin;
      const cmd = gameState.pendingDispatch.cmd;
      if (isAdjacent(orig.id, city.id)) {
        if (cmd === 'move' && isMyCity) isValidTarget = true;
        else if (cmd === 'attack' && !isMyCity) isValidTarget = true;
        else if (['rumor', 'sabotage', 'alienate'].includes(cmd) && !isMyCity) isValidTarget = true;
      }
    }

    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    halo.setAttribute('cx', city.x);
    halo.setAttribute('cy', city.y);
    halo.setAttribute('r', isMyCity ? 32 : 28);
    
    if (isValidTarget) {
      halo.className.baseVal = 'city-halo valid-target-halo';
      g.classList.add('valid-target-node');
    } else if (isMyCity) {
      halo.className.baseVal = 'city-halo player-city-halo';
      halo.style.color = '#ffd700';
      halo.style.fill = 'rgba(255, 215, 0, 0.25)';
    } else {
      halo.className.baseVal = 'city-halo';
      halo.style.color = faction.color;
      halo.style.fill = faction.color;
      halo.style.opacity = '0.25';
    }
    g.appendChild(halo);

    // 我方領地醒目金色龍冠圖標
    if (isMyCity) {
      const crown = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      crown.setAttribute('x', city.x);
      crown.setAttribute('y', city.y - 40);
      crown.setAttribute('font-size', '14px');
      crown.setAttribute('text-anchor', 'middle');
      crown.textContent = '👑';
      g.appendChild(crown);
    }
    
    // 擬真城池圖示 (3D Castle)
    const cityIcon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    cityIcon.setAttribute('href', 'city_icon.jpg');
    cityIcon.setAttribute('x', city.x - 24);
    cityIcon.setAttribute('y', city.y - 24);
    cityIcon.setAttribute('width', 48);
    cityIcon.setAttribute('height', 48);
    cityIcon.className.baseVal = 'city-node-img';
    cityIcon.style.color = faction.color;
    g.appendChild(cityIcon);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', city.x - 22);
    rect.setAttribute('y', city.y - 36);
    rect.setAttribute('width', 16);
    rect.setAttribute('height', 16);
    rect.setAttribute('fill', faction.color);
    rect.setAttribute('rx', 2);
    rect.className.baseVal = 'city-flag';
    g.appendChild(rect);

    const flagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    flagText.setAttribute('x', city.x - 14);
    flagText.setAttribute('y', city.y - 20);
    flagText.className.baseVal = 'city-flag-text';
    flagText.textContent = faction.banner;
    g.appendChild(flagText);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', city.x);
    text.setAttribute('y', city.y + 30);
    text.className.baseVal = 'city-text';
    text.textContent = city.name;
    g.appendChild(text);

    if (city.regionTag) {
      const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagText.setAttribute('x', city.x);
      tagText.setAttribute('y', city.y + 44);
      tagText.className.baseVal = 'city-region-tag';
      tagText.textContent = city.regionTag;
      g.appendChild(tagText);
    }

    g.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('select');
      
      if (gameState.isSelectingTarget && gameState.pendingDispatch) {
        const dispatch = gameState.pendingDispatch;
        const originCity = dispatch.origin;
        
        const needsAdjacency = ['move', 'attack', 'rumor', 'sabotage', 'alienate'].includes(dispatch.cmd);
        if (needsAdjacency && !isAdjacent(originCity.id, city.id)) {
          alert('目標城市不相鄰，請重新選擇！');
          return;
        }
        
        if (dispatch.cmd === 'move' && city.faction !== gameState.playerFactionId) {
          alert('【移動】只能選擇己方城市！');
          return;
        }
        
        if (dispatch.cmd === 'attack') {
          if (city.faction === gameState.playerFactionId) {
            alert('【出征】只能選擇敵方或中立城市！');
            return;
          }
          if (gameState.alliances[gameState.playerFactionId] && gameState.alliances[gameState.playerFactionId][city.faction]) {
            alert('與該勢力為【同盟】關係，無法出兵！請先破棄同盟。');
            return;
          }
        }

        if (['rumor', 'sabotage', 'alienate'].includes(dispatch.cmd) && city.faction === gameState.playerFactionId) {
          alert('計策必須對敵方或中立城市使用！');
          return;
        }
        
        if (['goodwill', 'alliance'].includes(dispatch.cmd)) {
          if (city.faction === gameState.playerFactionId || city.faction === 'neutral') {
            alert('外交必須對其他勢力使用（空城無效）！');
            return;
          }
          if (gameState.alliances[gameState.playerFactionId] && gameState.alliances[gameState.playerFactionId][city.faction]) {
            alert('該勢力已是【同盟】狀態！');
            return;
          }
        }

        if (dispatch.cmd === 'break_alliance') {
          if (!gameState.alliances[gameState.playerFactionId] || !gameState.alliances[gameState.playerFactionId][city.faction]) {
            alert('該勢力並非【同盟】狀態！');
            return;
          }
        }
        
        if (['rumor', 'sabotage', 'alienate', 'goodwill', 'alliance', 'break_alliance'].includes(dispatch.cmd)) {
          executeStratagem(city);
          return;
        }
        
        openDispatchModal(city);
      } else {
        selectCity(city);
      }
    });

    elCitiesGroup.appendChild(g);
  });
}

function selectCity(city) {
  gameState.selectedCity = city;
  
  document.querySelectorAll('.city-group').forEach(el => el.classList.remove('selected'));
  const elCity = document.getElementById(`city-node-${city.id}`);
  if (elCity) elCity.classList.add('selected');
  
  updateRightPanel(city);
  updateMyCitiesQuickNav();
  
  const deck = document.getElementById('city-command-deck');
  if (city.faction === gameState.playerFactionId) {
    if (deck) deck.style.display = 'flex';
    if (elCommandBar) elCommandBar.style.display = 'none';
    const cityGens = gameState.generals.filter(g => g.city === city.id && g.faction === gameState.playerFactionId && !g.acted);
    updateCommandButtons(cityGens.length > 0);
  } else {
    if (deck) deck.style.display = 'none';
    if (elCommandBar) elCommandBar.style.display = 'none';
  }
}

function deselectCity() {
  gameState.selectedCity = null;
  document.querySelectorAll('.city-group').forEach(el => el.classList.remove('selected'));
  const deck = document.getElementById('city-command-deck');
  if (deck) deck.style.display = 'none';
  if (elCommandBar) elCommandBar.style.display = 'none';
  
  elDetailCityName.textContent = '請選擇城市';
  elDetailCityFaction.textContent = '未選擇';
  elDetailCityFaction.style.backgroundColor = '#555';
  elValAgriculture.textContent = '0 / 0';
  elBarAgriculture.style.width = '0%';
  elValCommerce.textContent = '0 / 0';
  elBarCommerce.style.width = '0%';
  elValDefense.textContent = '0 / 0';
  elBarDefense.style.width = '0%';
  elValTroops.textContent = '0';
  elBarTroops.style.width = '0%';
  elValMorale.textContent = '0%';
  elBarMorale.style.width = '0%';
  elValGold.textContent = '0';
  elValFood.textContent = '0';
  elDetailGeneralsCount.textContent = '0 人';
  elCityGeneralsList.innerHTML = `<div style="text-align: center; color: var(--color-text-dim); margin-top: 20px; font-size: 0.85rem;">點擊地圖城市查看武將</div>`;
}

function updateRightPanel(city) {
  const faction = FACTIONS[city.faction] || FACTIONS['neutral'] || { name: '中立', color: '#757575', banner: '空', leader: '無' };
  
  elDetailCityName.textContent = city.name;
  elDetailCityFaction.textContent = faction.name;
  elDetailCityFaction.style.backgroundColor = faction.color;
  
  const elDiplomacyContainer = document.getElementById('detail-city-diplomacy-container');
  const elDiplomacyText = document.getElementById('detail-city-diplomacy');
  
  if (city.faction !== gameState.playerFactionId && city.faction !== 'neutral') {
    elDiplomacyContainer.style.display = 'block';
    if (gameState.alliances[gameState.playerFactionId] && gameState.alliances[gameState.playerFactionId][city.faction]) {
      elDiplomacyText.innerHTML = '🟢 外交狀態：同盟';
      elDiplomacyText.style.color = '#81c784';
      elDiplomacyText.style.borderColor = '#81c784';
    } else {
      elDiplomacyText.innerHTML = '🔴 外交狀態：敵對';
      elDiplomacyText.style.color = '#ff5252';
      elDiplomacyText.style.borderColor = '#ff5252';
    }
  } else {
    elDiplomacyContainer.style.display = 'none';
  }
  
  elValAgriculture.textContent = `${city.agriculture} / ${city.maxAgriculture}`;
  elBarAgriculture.style.width = `${(city.agriculture / city.maxAgriculture) * 100}%`;
  
  elValCommerce.textContent = `${city.commerce} / ${city.maxCommerce}`;
  elBarCommerce.style.width = `${(city.commerce / city.maxCommerce) * 100}%`;
  
  elValDefense.textContent = `${city.defense} / ${city.maxDefense}`;
  elBarDefense.style.width = `${(city.defense / city.maxDefense) * 100}%`;
  
  elValTroops.textContent = `${city.troops} 兵`;
  elBarTroops.style.width = `${Math.min(100, (city.troops / 50000) * 100)}%`;
  
  elValMorale.textContent = `${city.morale}%`;
  elBarMorale.style.width = `${city.morale}%`;
  
  elValGold.textContent = city.gold;
  elValFood.textContent = city.food;
  
  const cityGens = gameState.generals.filter(g => g.city === city.id && g.faction === city.faction);
  elDetailGeneralsCount.textContent = `${cityGens.length} 人`;
  
  updateCityGeneralsList(city);
}

function getGeneralTier(gen) {
  const sum = (gen.stats.lead || 50) + (gen.stats.str || 50) + (gen.stats.int || 50) + (gen.stats.pol || 50) + (gen.stats.cha || 70);
  if (sum >= 420) return { tier: 'SSS', tierName: '【天・無雙神將 SSS】', tierColor: '#ffd700', bgGrad: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,143,0,0.6))' };
  if (sum >= 370) return { tier: 'SS', tierName: '【地・絕世名將 SS】', tierColor: '#e040fb', bgGrad: 'linear-gradient(135deg, rgba(224,64,251,0.3), rgba(123,31,162,0.6))' };
  if (sum >= 330) return { tier: 'S', tierName: '【玄・柱石良將 S】', tierColor: '#29b6f6', bgGrad: 'linear-gradient(135deg, rgba(41,182,246,0.3), rgba(2,119,189,0.6))' };
  if (sum >= 290) return { tier: 'A', tierName: '【黃・驍勇健將 A】', tierColor: '#66bb6a', bgGrad: 'linear-gradient(135deg, rgba(102,187,106,0.3), rgba(46,125,50,0.6))' };
  return { tier: 'B', tierName: '【凡・偏裨戰將 B】', tierColor: '#bdbdbd', bgGrad: 'rgba(255,255,255,0.1)' };
}

// ==================== 城池駐防武將清單 ====================
function updateCityGeneralsList(city) {
  const cityGens = gameState.generals.filter(g => g.city === city.id && g.faction === city.faction);
  elDetailGeneralsCount.textContent = `${cityGens.length} 人`;
  
  elCityGeneralsList.innerHTML = '';
  if (cityGens.length === 0) {
    elCityGeneralsList.innerHTML = `<div style="text-align: center; color: var(--color-text-dim); margin-top: 15px; font-size: 0.85rem;">無武將駐防</div>`;
  } else {
    cityGens.forEach(gen => {
      const item = document.createElement('div');
      item.className = 'general-item';
      if (gen.acted) {
        item.style.opacity = '0.5';
      }
      const portraitPath = gen.portrait || 'portraits/default.jpg';
      const tier = getGeneralTier(gen);
      const unitMap = { cavalry: '🐎 騎', infantry: '🛡️ 步', archer: '🏹 弓' };
      const unitText = unitMap[gen.unitType] || '🛡️ 步';
      
      item.innerHTML = `
        <div class="general-portrait-small" style="background-image: url('${portraitPath}'); border-color: ${tier.tierColor};"></div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="gen-tier-badge ${tier.tier.toLowerCase()}">${tier.tier}</span>
            <span style="font-weight: bold; color: #fff; font-size: 0.95rem;">${gen.name}</span>
            ${gen.acted ? '<span style="font-size:0.7rem; color:#ffd700;">[已動]</span>' : ''}
            ${gen.isSwornBrother ? '<span style="font-size:0.75rem; color:#ff4081;" title="結義兄弟">🌸</span>' : ''}
          </div>
          <div style="display: flex; gap: 8px; font-size: 0.75rem; color: #bbb; margin-top: 3px;">
            <span style="color: #ef5350;">武 ${gen.stats.str}</span>
            <span style="color: #42a5f5;">統 ${gen.stats.lead}</span>
            <span style="color: #ab47bc;">智 ${gen.stats.int}</span>
            <span class="gen-unit-badge">${unitText}</span>
          </div>
        </div>
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        playSound('click');
        showGeneralDetail(gen);
      });
      elCityGeneralsList.appendChild(item);
    });
  }
}

function updateCommandButtons(hasActiveGens) {
  document.querySelectorAll('.btn-cmd').forEach(btn => {
    btn.disabled = !hasActiveGens;
  });
  
  const diplomacyGroup = document.getElementById('group-diplomacy');
  if (diplomacyGroup) {
    if (gameState.selectedCity && gameState.selectedCity.faction === gameState.playerFactionId) {
      diplomacyGroup.style.display = 'block';
    } else {
      diplomacyGroup.style.display = 'none';
    }
  }
}

// ==================== 武將詳情彈窗 ====================
function showGeneralDetail(gen) {
  const faction = FACTIONS[gen.faction];
  const portraitPath = gen.portrait || 'portraits/default.jpg';
  const tier = getGeneralTier(gen);
  const totalStats = (gen.stats.lead || 0) + (gen.stats.str || 0) + (gen.stats.int || 0) + (gen.stats.pol || 0) + (gen.stats.cha || 70);
  
  elGenDetPortrait.style.backgroundImage = `url('${portraitPath}')`;
  elGenDetPortrait.style.borderColor = tier.tierColor;
  elGenDetPortrait.textContent = '';
  
  elGenDetName.innerHTML = `${gen.name} <span class="gen-tier-badge ${tier.tier.toLowerCase()}">${tier.tier}</span>`;
  
  let tierBanner = document.getElementById('gen-det-tier-banner');
  if (!tierBanner) {
    tierBanner = document.createElement('div');
    tierBanner.id = 'gen-det-tier-banner';
    elGenDetName.parentElement.insertBefore(tierBanner, elGenDetFaction);
  }
  tierBanner.className = 'gen-det-tier-banner';
  tierBanner.style.background = tier.bgGrad;
  tierBanner.style.borderColor = tier.tierColor;
  tierBanner.style.color = tier.tierColor;
  tierBanner.innerHTML = `${tier.tierName} <span class="stat-sum-badge">（五維總值 ${totalStats}）</span>`;

  const cityObj = gameState.cities.find(c => c.id === gen.city);
  const cityName = cityObj ? cityObj.name : '在野流浪';
  elGenDetFaction.textContent = `所屬勢力：${faction ? faction.name : '在野'} （駐防在 ${cityName}）`;
  document.getElementById('gen-det-loyalty').textContent = `忠誠: ${gen.loyalty}`;
  elGenDetDesc.textContent = gen.description || '一位縱橫沙場的三國名將。';
  
  const traitContainer = document.getElementById('gen-det-trait-container');
  const traitName = document.getElementById('gen-det-trait-name');
  const traitDesc = document.getElementById('gen-det-trait-desc');
  if (gen.trait && TRAIT_INFO[gen.trait]) {
    traitContainer.style.display = 'block';
    traitName.textContent = TRAIT_INFO[gen.trait].name;
    traitDesc.textContent = TRAIT_INFO[gen.trait].desc;
  } else {
    traitContainer.style.display = 'none';
  }
  
  elValDetLead.textContent = gen.stats.lead;
  elBarDetLead.style.width = `${gen.stats.lead}%`;
  elBarDetLead.style.background = 'linear-gradient(90deg, #1976d2, #42a5f5)';
  
  elValDetStr.textContent = gen.stats.str;
  elBarDetStr.style.width = `${gen.stats.str}%`;
  elBarDetStr.style.background = 'linear-gradient(90deg, #c62828, #ef5350)';
  
  elValDetInt.textContent = gen.stats.int;
  elBarDetInt.style.width = `${gen.stats.int}%`;
  elBarDetInt.style.background = 'linear-gradient(90deg, #6a1b9a, #ab47bc)';
  
  elValDetPol.textContent = gen.stats.pol;
  elBarDetPol.style.width = `${gen.stats.pol}%`;
  elBarDetPol.style.background = 'linear-gradient(90deg, #2e7d32, #66bb6a)';
  
  elValDetCha.textContent = gen.stats.cha || 70;
  elBarDetCha.style.width = `${gen.stats.cha || 70}%`;
  elBarDetCha.style.background = 'linear-gradient(90deg, #f57f17, #ffa726)';
  
  // 顯示裝備寶物
  if (gen.items && gen.items.length > 0) {
    elGenDetItems.style.display = 'block';
    elGenDetItemsList.innerHTML = '';
    gen.items.forEach(item => {
      const badge = document.createElement('div');
      badge.className = 'item-badge';
      badge.title = item.description;
      badge.innerHTML = `<img src="${item.image}" class="item-icon-img" alt="${item.name}" title="${item.description}"> ${item.name}`;
      elGenDetItemsList.appendChild(badge);
    });
  } else {
    elGenDetItems.style.display = 'none';
  }
  
  elGeneralOverlay.classList.remove('hidden');
}

// ==================== 指令指派與執行 ====================
window.triggerCommand = function(cmdType) {
  playSound('click');
  if (!gameState.selectedCity) return;
  
  gameState.activeCommand = cmdType;
  
  const availableGens = gameState.generals.filter(
    g => g.city === gameState.selectedCity.id && g.faction === gameState.playerFactionId && !g.acted
  );
  
  if (availableGens.length === 0) {
    alert('該城市無可用武將！（武將本月已執行過命令，或此地無駐軍）');
    return;
  }
  
    if (cmdType === 'tech') {
    openTechTreeModal();
    return;
  }
  if (cmdType === 'reward') {
    elRewardTypeOverlay.classList.remove('hidden');
    return;
  }
  
  showSelector(cmdType);
}

function showSelector(cmdType) {
  elSelectorOverlay.classList.remove('hidden');
  
  let keyStat = 'pol';
  let cmdName = '';
  let costText = '';
  
  const availableGens = gameState.generals.filter(
    g => g.city === gameState.selectedCity.id && g.faction === gameState.playerFactionId && !g.acted
  );
  
  switch (cmdType) {
    case 'develop_agri': keyStat = 'pol'; cmdName = '開發農業'; costText = '需消耗黃金 100'; break;
    case 'develop_comm': keyStat = 'pol'; cmdName = '發展商業'; costText = '需消耗黃金 100'; break;
    case 'fortify': keyStat = 'pol'; cmdName = '修築城防'; costText = '需消耗黃金 100'; break;
    case 'conscript': keyStat = 'str'; cmdName = '徵召部隊'; costText = '需消耗黃金 300'; break;
    case 'train': keyStat = 'str'; cmdName = '訓練士兵'; costText = '需消耗黃金 50'; break;
    case 'move': keyStat = 'lead'; cmdName = '調動軍旅'; costText = '需消耗黃金 50/將'; break;
    case 'attack': keyStat = 'lead'; cmdName = '出征攻伐'; costText = '自選兵馬糧草'; break;
    case 'search': keyStat = 'int'; cmdName = '尋求賢才'; costText = '需消耗黃金 50'; break;
    case 'recruit': keyStat = 'cha'; cmdName = '登用將領'; costText = '需消耗黃金 100'; break;
    case 'reward_gold': keyStat = 'loyalty'; cmdName = '賞賜黃金'; costText = '需消耗黃金 50'; break;
    case 'reward_item': keyStat = 'loyalty'; cmdName = '賞賜寶物'; costText = `將賜予：${gameState.selectedItem ? gameState.selectedItem.name : '寶物'}`; break;
    case 'trade': keyStat = 'pol'; cmdName = '市集交易'; costText = '自由買賣糧草 (政治影響匯率)'; break;
    case 'goodwill': keyStat = 'cha'; cmdName = '親善送禮'; costText = '需消耗黃金 300 (提升友好度)'; break;
    case 'alliance': keyStat = 'pol'; cmdName = '締結同盟'; costText = '需消耗黃金 500 (建立同盟)'; break;
    case 'break_alliance': keyStat = 'cha'; cmdName = '破棄同盟'; costText = '會導致民心與部下忠誠度下降！'; break;
    case 'rumor': keyStat = 'int'; cmdName = '散佈流言'; costText = '需消耗黃金 100'; break;
    case 'sabotage': keyStat = 'int'; cmdName = '破壞防禦'; costText = '需消耗黃金 150'; break;
    case 'alienate': keyStat = 'int'; cmdName = '策反離間'; costText = '需消耗黃金 200'; break;
  }
  elSelectorTitle.textContent = `委派任務：${cmdName}`;
  elSelectorDesc.textContent = `${costText}。此命令關鍵屬性為：${getStatName(keyStat)} (亮黃色標記)`;
  
  renderSelectorList(availableGens, keyStat);
};

window.showItemSelector = function() {
  elItemSelectorOverlay.classList.remove('hidden');
  elItemSelectorList.innerHTML = '';
  
  gameState.factionItems.forEach(item => {
    let bonusDesc = `${getStatName(item.stat)} +${item.value}`;
    if (item.extraLead) bonusDesc += ` | 統率 +${item.extraLead}`;
    if (item.extraStr) bonusDesc += ` | 武力 +${item.extraStr}`;
    if (item.extraInt) bonusDesc += ` | 智力 +${item.extraInt}`;
    if (item.extraPol) bonusDesc += ` | 政治 +${item.extraPol}`;
    if (item.extraCha) bonusDesc += ` | 魅力 +${item.extraCha}`;

    const itemEl = document.createElement('div');
    itemEl.className = 'general-item';
    itemEl.innerHTML = `
      <div class="item-portrait-small" style="background-image: url('${item.image}'); font-size: 1.5rem; display:flex; align-items:center; justify-content:center;">${item.icon || '🎁'}</div>
      <div style="flex-grow: 1; text-align: left;">
        <div style="font-weight: bold; color: var(--color-gold); font-size: 1rem;">${item.icon || ''} ${item.name}</div>
        <div style="font-size: 0.8rem; color: #bbb; margin: 3px 0;">${item.description}</div>
        <div style="font-size: 0.8rem; color: #81c784; font-weight: bold;">【寶物加成】${bonusDesc}</div>
      </div>
    `;
    itemEl.addEventListener('click', () => {
      playSound('select');
      gameState.selectedItem = item;
      elItemSelectorOverlay.classList.add('hidden');
      gameState.activeCommand = 'reward_item';
      showSelector('reward_item');
    });
    elItemSelectorList.appendChild(itemEl);
  });
};

function getStatName(statKey) {
  const map = { lead: '統率', str: '武力', int: '智力', pol: '政治', cha: '魅力', loyalty: '忠誠度' };
  return map[statKey] || '';
}

function renderSelectorList(gens, keyStat) {
  elSelectorList.innerHTML = '';
  
  gens.forEach(gen => {
    const item = document.createElement('div');
    item.className = 'general-item';
    
    let estText = '';
    const val = keyStat === 'loyalty' ? gen.loyalty : gen.stats[keyStat];
    
    if (keyStat !== 'loyalty') {
      if (val >= 90) estText = '成效：極佳';
      else if (val >= 75) estText = '成效：良';
      else if (val >= 50) estText = '成效：普通';
      else estText = '成效：較差';
    } else {
      estText = '目前數值';
    }
    
    const portraitPath = gen.portrait || 'portraits/default.jpg';
    const tier = getGeneralTier(gen);
    const unitMap = { cavalry: '🐎 騎', infantry: '🛡️ 步', archer: '🏹 弓' };
    const unitText = unitMap[gen.unitType] || '🛡️ 步';
    
    item.innerHTML = `
      <div class="general-portrait-small" style="background-image: url('${portraitPath}'); border-color: ${tier.tierColor};"></div>
      <div style="flex:1;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="gen-tier-badge ${tier.tier.toLowerCase()}">${tier.tier}</span>
          <span style="font-weight: bold; color: #fff;">${gen.name}</span>
          <span class="gen-unit-badge">${unitText}</span>
          ${gen.officialRank ? `<span class="rank-badge" style="font-size:0.7rem; padding:0 4px;">${gen.officialRank}</span>` : ''}
        </div>
        <div style="font-size:0.75rem; color: #bbb; margin-top:2px;">
          統 <b style="color:#42a5f5;">${gen.stats.lead}</b> | 武 <b style="color:#ef5350;">${gen.stats.str}</b> | 智 <b style="color:#ab47bc;">${gen.stats.int}</b> | 政 <b style="color:#66bb6a;">${gen.stats.pol}</b> | 魅 <b style="color:#ffa726;">${gen.stats.cha || 70}</b>
        </div>
      </div>
      <div style="text-align: right;">
        <span style="color: var(--color-gold-bright); font-weight: bold; font-size: 1.1rem;">${val}</span>
        <div style="font-size:0.7rem; color: #81c784; font-weight: bold;">${estText}</div>
      </div>
    `;
    
    item.addEventListener('click', () => {
      playSound('command_ok');
      elSelectorOverlay.classList.add('hidden');
      executeCommand(gen);
    });
    
    elSelectorList.appendChild(item);
  });
}

function executeCommand(general) {
  const city = gameState.selectedCity;
  const cmd = gameState.activeCommand;
  
  let cost = 0;
  if (cmd === 'develop_agri' || cmd === 'develop_comm' || cmd === 'fortify') cost = 100;
  else if (cmd === 'conscript') cost = 300;
  else if (cmd === 'train') cost = 50;
  else if (cmd === 'search') cost = 50;
  else if (cmd === 'recruit') cost = 100;
  else if (cmd === 'reward_gold') cost = 50;
  else if (cmd === 'reward_item' || cmd === 'trade' || cmd === 'break_alliance') cost = 0;
  else if (cmd === 'move') cost = 50;
  else if (cmd === 'rumor') cost = 100;
  else if (cmd === 'alienate') cost = 200;
  else if (cmd === 'goodwill') cost = 300;
  else if (cmd === 'alliance') cost = 500;

  if (city.gold < cost) {
    alert(`此城池黃金不足！（剩餘 ${city.gold}，需要 ${cost}）`);
    return;
  }

  if (cmd !== 'move' && cmd !== 'attack' && cmd !== 'rumor' && cmd !== 'alienate' && cmd !== 'trade' && cmd !== 'goodwill' && cmd !== 'alliance' && cmd !== 'break_alliance') {
    general.acted = true;
  }
  
  if (cmd !== 'move' && cmd !== 'attack' && cmd !== 'rumor' && cmd !== 'alienate' && cmd !== 'trade' && cmd !== 'goodwill' && cmd !== 'alliance' && cmd !== 'break_alliance') {
    city.gold -= cost;
  }

  let logMsg = '';
  
  switch (cmd) {
    case 'develop_agri': {
      let agriBonus = 0;
      const faction = FACTIONS[gameState.playerFactionId];
      if (faction && faction.trait === 'agriculture') agriBonus = 5;
      const increment = Math.floor(general.stats.pol * 0.15 + Math.random() * 5 + 5) + agriBonus;
      const oldVal = city.agriculture;
      city.agriculture = Math.min(city.maxAgriculture, city.agriculture + increment);
      logMsg = `🌾【${general.name}】在【${city.name}】推行墾荒與屯田，使農業值增加了 ${city.agriculture - oldVal}（達 ${city.agriculture}）。`;
      break;
    }
    case 'reward_gold': {
      if (general.loyalty >= 100) {
        alert('該武將已誓死效忠，無需賞賜！');
        city.gold += cost;
        return;
      }
      const boost = Math.floor(Math.random() * 10 + 5);
      const oldLoyalty = general.loyalty;
      general.loyalty = Math.min(100, general.loyalty + boost);
      logMsg = `🎁 您撥出黃金 ${cost} 兩賞賜了【${general.name}】，【${general.name}】感激涕零，忠誠度提升了 ${general.loyalty - oldLoyalty}（達 ${general.loyalty}）！`;
      break;
    }
    case 'reward_item': {
      const item = gameState.selectedItem;
      if (!item) return;
      
      // 給予武將
      if (!general.items) general.items = [];
      general.items.push(item);
      
      // 增加全額屬性與複合加成
      general.stats[item.stat] += item.value;
      if (item.extraLead) general.stats.lead = (general.stats.lead || 0) + item.extraLead;
      if (item.extraStr) general.stats.str = (general.stats.str || 0) + item.extraStr;
      if (item.extraInt) general.stats.int = (general.stats.int || 0) + item.extraInt;
      if (item.extraPol) general.stats.pol = (general.stats.pol || 0) + item.extraPol;
      if (item.extraCha) general.stats.cha = (general.stats.cha || 0) + item.extraCha;

      let bonusDesc = `${getStatName(item.stat)} +${item.value}`;
      if (item.extraLead) bonusDesc += `, 統率 +${item.extraLead}`;
      if (item.extraStr) bonusDesc += `, 武力 +${item.extraStr}`;
      if (item.extraInt) bonusDesc += `, 智力 +${item.extraInt}`;
      if (item.extraPol) bonusDesc += `, 政治 +${item.extraPol}`;
      if (item.extraCha) bonusDesc += `, 魅力 +${item.extraCha}`;
      
      // 提升忠誠
      const oldLoyalty = general.loyalty;
      general.loyalty = Math.min(100, general.loyalty + 25);
      
      // 移除國庫
      gameState.factionItems = gameState.factionItems.filter(i => i.id !== item.id);
      gameState.selectedItem = null;
      
      logMsg = `🎁 絕世珍寶出世！您將【${item.icon}${item.name}】賞賜給了【${general.name}】！【${general.name}】獲得【${bonusDesc}】，忠誠度大幅提升至 ${general.loyalty}！`;
      break;
    }
    playSound('coins');
      case 'trade': {
      openTradeModal(general, city);
      return;
    }
    case 'develop_comm': {
      let commBonus = 0;
      const faction = FACTIONS[gameState.playerFactionId];
      if (faction && faction.trait === 'commerce') commBonus = 5;
      const increment = Math.floor(general.stats.pol * 0.15 + Math.random() * 5 + 5) + commBonus;
      const oldVal = city.commerce;
      city.commerce = Math.min(city.maxCommerce, city.commerce + increment);
      logMsg = `💰【${general.name}】在【${city.name}】整頓商鋪與關稅，使商業值增加了 ${city.commerce - oldVal}（達 ${city.commerce}）。`;
      break;
    }
    case 'fortify': {
      const increment = Math.floor(general.stats.pol * 0.1 + general.stats.str * 0.05 + Math.random() * 5 + 3);
      const oldVal = city.defense;
      city.defense = Math.min(city.maxDefense, city.defense + increment);
      logMsg = `🏰【${general.name}】在【${city.name}】修繕外牆、深挖護城河，使防禦力增加了 ${city.defense - oldVal}（達 ${city.defense}）。`;
      break;
    }
    playSound('drum');
      case 'conscript': {
      let moraleCost = 10;
      let bonusTroops = 1.0;
      const faction = FACTIONS[gameState.playerFactionId];
      if (faction && faction.trait === 'tyranny') {
        bonusTroops = 1.5;
        moraleCost = 20;
      } else if (faction && faction.trait === 'horde') {
        bonusTroops = 2.0;
        moraleCost = 0;
      }
      const recruited = Math.floor((general.stats.str * 15 + general.stats.lead * 5 + Math.random() * 200 + 300) * bonusTroops);
      city.troops += recruited;
      city.morale = Math.max(20, city.morale - moraleCost);
      logMsg = `🛡️【${general.name}】在【${city.name}】張貼告示募集鄉勇，召得 ${recruited} 士兵。新兵入營，部隊士氣降低了 ${moraleCost}%。`;
      break;
    }
    case 'train': {
      const oldVal = city.morale;
      const boost = Math.floor(general.stats.str * 0.15 + general.stats.lead * 0.15 + Math.random() * 8 + 5);
      city.morale = Math.min(100, city.morale + boost);
      logMsg = `🏹【${general.name}】每日清晨操練【${city.name}】的守軍，使部隊士氣提升了 ${city.morale - oldVal}%（達 ${city.morale}%）。`;
      break;
    }
    case 'search': {
      const rand = Math.random();
      const treasureChance = 0.22 + (general.stats.int / 100) * 0.18; // 智力越高越容易尋得神兵至寶
      if (rand < treasureChance) {
        // 發掘神祕寶物
        const ownedItemIds = new Set();
        gameState.factionItems.forEach(i => ownedItemIds.add(i.id));
        gameState.generals.forEach(g => {
          if (g.items) g.items.forEach(i => ownedItemIds.add(i.id));
        });
        
        const unownedItems = ITEMS.filter(item => !ownedItemIds.has(item.id));
        if (unownedItems.length > 0) {
          const foundItem = unownedItems[Math.floor(Math.random() * unownedItems.length)];
          gameState.factionItems.push(foundItem);
          logMsg = `✨ 驚天奇遇！【${general.name}】在【${city.name}】深山中發掘出絕世寶物【${foundItem.icon}${foundItem.name}】！已存入國庫，可透過賞賜賜予武將！`;
        } else {
          const foundGold = Math.floor(Math.random() * 300 + 150);
          city.gold += foundGold;
          logMsg = `🔍【${general.name}】在【${city.name}】境內巡查，查抄出當地貪官私藏的黃金 ${foundGold} 兩納入國庫！`;
        }
      } else if (rand < 0.45) {
        const foundGold = Math.floor(Math.random() * 300 + 150);
        city.gold += foundGold;
        logMsg = `🔍【${general.name}】在【${city.name}】境內巡查，查抄出當地貪官私藏的黃金 ${foundGold} 兩納入國庫！`;
      } else if (rand < 0.75) {
        const foundFood = Math.floor(Math.random() * 2000 + 1000);
        city.food += foundFood;
        logMsg = `🔍【${general.name}】在【${city.name}】推廣新式農具，自民間發掘並徵得存糧 ${foundFood} 石！`;
      } else {
        const neutralGens = gameState.generals.filter(g => g.city === city.id && g.faction === 'neutral');
        if (neutralGens.length > 0) {
          const target = neutralGens[Math.floor(Math.random() * neutralGens.length)];
          logMsg = `✨ 奇遇！【${general.name}】在山野林泉之中遇見了在此避世的賢士【${target.name}】！【${target.name}】對將軍的造訪深表榮幸，現已現身【${city.name}】酒肆！`;
        } else {
          logMsg = `🔍【${general.name}】在【${city.name}】遊歷訪查了半月，四海昇平，並未尋得奇人異寶。`;
        }
      }
      break;
    }
    case 'recruit': {
      const neutralGens = gameState.generals.filter(g => g.city === city.id && g.faction === 'neutral');
      if (neutralGens.length === 0) {
        alert('該城市當前沒有在野的在野賢才，可派遣武將先執行 [探索] 命令！');
        general.acted = false;
        city.gold += cost;
        return;
      }
      
      const target = neutralGens[0];
      let recruitBonus = 0;
      const faction = FACTIONS[gameState.playerFactionId];
      if (faction && faction.trait === 'virtue') recruitBonus = 15;
      const successChance = (general.stats.cha * 0.6 + general.stats.int * 0.3 + recruitBonus) / (target.stats.int * 0.5 + 50);
      
      if (Math.random() < successChance) {
        target.faction = gameState.playerFactionId;
        logMsg = `🤝【${general.name}】備齊厚禮，親自登門造訪在野將領【${target.name}】。言談間【${target.name}】被真情所動，高呼「明主！」，宣誓效忠！`;
      } else {
        logMsg = `❌【${general.name}】欲登用在野賢才【${target.name}】，然而【${target.name}】淡泊名利，婉言拒絕了將軍的邀請。`;
      }
      break;
    }
    case 'move': {
      const adjacentFriendlyCities = gameState.cities.filter(c => 
        c.faction === gameState.playerFactionId && 
        c.id !== city.id &&
        isAdjacent(city.id, c.id)
      );
      
      if (adjacentFriendlyCities.length === 0) {
        alert('該城周圍沒有相鄰的己方勢力城市，無法移動！');
        return;
      }
      
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'move', general, origin: city, cost };
      addLog(`👉 請在地圖上點擊一個相鄰的【己方】城市作為【${general.name}】移動的目的地。`, 'highlight');
      return;
    }
    case 'attack': {
      const adjacentEnemyCities = gameState.cities.filter(c => 
        c.faction !== gameState.playerFactionId && 
        isAdjacent(city.id, c.id)
      );
      
      if (adjacentEnemyCities.length === 0) {
        alert('該城周遭無接壤的敵方或中立領土，無法出征！');
        return;
      }
      
      if (city.troops <= 1000) {
        alert(`【${city.name}】守軍不足（${city.troops}），出兵需要至少保留 1000 士兵守城！`);
        return;
      }

      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'attack', general, origin: city, cost };
      addLog(`⚔️ 請在地圖上點擊一個相鄰的【敵方/中立】城市作為【${general.name}】出征的目標。`, 'highlight');
      return;
    }
    case 'rumor': {
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'rumor', general, origin: city, cost };
      addLog(`🗣️ 請在地圖上點擊一個【敵方/中立】城市作為【${general.name}】散佈流言的目標。`, 'highlight');
      return;
    }
    case 'alienate': {
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'alienate', general, origin: city, cost };
      addLog(`🕵️‍♂️ 請在地圖上點擊一個【敵方/中立】城市作為【${general.name}】離間的目標。`, 'highlight');
      return;
    }
    case 'goodwill': {
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'goodwill', general, origin: city, cost };
      addLog(`🤝 請在地圖上點擊一個【非同盟】的【敵方/中立】城市作為【${general.name}】親善送禮的目標。`, 'highlight');
      return;
    }
    case 'alliance': {
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'alliance', general, origin: city, cost };
      addLog(`📜 請在地圖上點擊一個【非同盟】的【敵方/中立】城市作為【${general.name}】締結同盟的目標。`, 'highlight');
      return;
    }
    case 'break_alliance': {
      gameState.isSelectingTarget = true;
      gameState.pendingDispatch = { cmd: 'break_alliance', general, origin: city, cost };
      addLog(`💥 請在地圖上點擊一個【同盟】城市作為【${general.name}】破棄同盟的目標。`, 'highlight');
      return;
    }
  }

  addLog(logMsg, 'system');
  updateGlobalStats();
  selectCity(city);
}

function executeStratagem(targetCity) {
  gameState.isSelectingTarget = false;
  const dispatch = gameState.pendingDispatch;
  gameState.pendingDispatch = null;
  const general = dispatch.general;
  const originCity = dispatch.origin;
  const cost = dispatch.cost;
  
  general.acted = true;
  originCity.gold -= cost;
  
  let logMsg = '';
  
  if (dispatch.cmd === 'rumor') {
    let successChance = (general.stats.int * 0.7 + general.stats.pol * 0.3) / 100;
    if (general.trait === 'divine_calc') successChance = 1.0;
    
    const targetGens = gameState.generals.filter(g => g.city === targetCity.id && g.faction === targetCity.faction);
    if (targetGens.some(g => g.trait === 'divine_calc')) successChance = 0.0;

    if (Math.random() < successChance) {
      const drop = Math.floor(Math.random() * 20 + 10);
      targetCity.morale = Math.max(0, targetCity.morale - drop);
      let loyaltyLog = '';
      const enemyGens = gameState.generals.filter(g => g.city === targetCity.id && g.faction === targetCity.faction && g.faction !== 'neutral');
      if (enemyGens.length > 0) {
        enemyGens.forEach(g => {
          g.loyalty = Math.max(0, g.loyalty - Math.floor(Math.random() * 10 + 5));
        });
        loyaltyLog = '且城內將領忠誠度亦受到動搖！';
      }
      logMsg = `🗣️【${general.name}】在【${targetCity.name}】成功散佈流言！該城民心下降了 ${drop}！${loyaltyLog}`;
    } else {
      logMsg = `❌【${general.name}】在【${targetCity.name}】散佈流言，但被當地太守識破，無功而返。`;
    }
  } else if (dispatch.cmd === 'sabotage') {
    let successChance = (general.stats.int * 0.8) / 100;
    if (general.trait === 'divine_calc') successChance = 1.0;
    
    const targetGens = gameState.generals.filter(g => g.city === targetCity.id && g.faction === targetCity.faction);
    if (targetGens.some(g => g.trait === 'divine_calc')) successChance = 0.0;

    if (Math.random() < successChance) {
      const drop = Math.floor(Math.random() * 30 + 15);
      targetCity.defense = Math.max(0, targetCity.defense - drop);
      logMsg = `🔥【${general.name}】成功派人潛入【${targetCity.name}】破壞城防！該城防禦大幅下降了 ${drop}！`;
    } else {
      logMsg = `❌【${general.name}】派往【${targetCity.name}】的破壞小隊被敵軍發現並剿滅，任務失敗。`;
    }
  } else if (dispatch.cmd === 'alienate') {
    const enemyGens = gameState.generals.filter(g => g.city === targetCity.id && g.faction === targetCity.faction && g.faction !== 'neutral');
    if (enemyGens.length === 0) {
      logMsg = `❌【${general.name}】欲在【${targetCity.name}】施展離間計，但該城並無敵將駐守。`;
    } else {
      const targetGen = enemyGens[Math.floor(Math.random() * enemyGens.length)];
      let successChance = (general.stats.int * 0.8) / (targetGen.stats.int * 0.5 + 50);
      
      if (general.trait === 'divine_calc') successChance = 1.0;
      if (general.trait === 'falsehood' && general.stats.int > targetGen.stats.int) successChance = 1.0;
      if (general.trait === 'beauty') successChance += 0.5;
      if (targetGen.trait === 'divine_calc') successChance = 0.0;

      if (Math.random() < successChance) {
        const loyaltyDrop = Math.floor(Math.random() * 15 + 10);
        targetGen.loyalty = Math.max(0, targetGen.loyalty - loyaltyDrop);
        logMsg = `🕵️‍♂️【${general.name}】成功離間了【${targetCity.name}】的【${targetGen.name}】！其忠誠度大幅下降了 ${loyaltyDrop}！`;
      } else {
        logMsg = `❌【${general.name}】試圖離間【${targetCity.name}】的【${targetGen.name}】，但對方不為所動。`;
      }
    }
  } else if (dispatch.cmd === 'goodwill') {
    const targetFaction = targetCity.faction;
    if (!gameState.relations[gameState.playerFactionId]) gameState.relations[gameState.playerFactionId] = {};
    const oldRel = gameState.relations[gameState.playerFactionId][targetFaction] || 0;
    const gain = Math.floor(general.stats.cha * 0.2 + 5);
    gameState.relations[gameState.playerFactionId][targetFaction] = Math.min(100, oldRel + gain);
    logMsg = `🤝【${general.name}】帶著厚禮前往【${targetCity.name}】親善交涉。雙方關係提升了 ${gain} 點（目前關係值：${gameState.relations[gameState.playerFactionId][targetFaction]}）！`;
  } else if (dispatch.cmd === 'alliance') {
    const targetFaction = targetCity.faction;
    const rel = (gameState.relations[gameState.playerFactionId] && gameState.relations[gameState.playerFactionId][targetFaction]) || 0;
    const successChance = (general.stats.pol * 0.6 + rel * 0.4) / 100;
    
    if (Math.random() < successChance) {
      if (!gameState.alliances[gameState.playerFactionId]) gameState.alliances[gameState.playerFactionId] = {};
      if (!gameState.alliances[targetFaction]) gameState.alliances[targetFaction] = {};
      
      gameState.alliances[gameState.playerFactionId][targetFaction] = true;
      gameState.alliances[targetFaction][gameState.playerFactionId] = true;
      
      logMsg = `📜【${general.name}】在【${targetCity.name}】憑藉三寸不爛之舌成功說服對方！我們與【${FACTIONS[targetFaction].name}】正式締結【同盟】！`;
    } else {
      logMsg = `💬【${general.name}】在【${targetCity.name}】提出結盟，但對方考量局勢後婉拒了我們的提議。（關係不足或政治檢定失敗）`;
    }
  } else if (dispatch.cmd === 'break_alliance') {
    const targetFaction = targetCity.faction;
    gameState.alliances[gameState.playerFactionId][targetFaction] = false;
    gameState.alliances[targetFaction][gameState.playerFactionId] = false;
    
    const penalty = Math.floor(Math.random() * 20 + 10);
    originCity.morale = Math.max(0, originCity.morale - penalty);
    
    // 將領忠誠度下降
    const myGens = gameState.generals.filter(g => g.faction === gameState.playerFactionId);
    myGens.forEach(g => {
      if (Math.random() < 0.3) {
        g.loyalty = Math.max(0, g.loyalty - 5);
      }
    });
    
    logMsg = `💥【背信棄義】我們單方面撕毀了與【${FACTIONS[targetFaction].name}】的同盟條約！此舉導致【${originCity.name}】士氣下降 ${penalty} 點，部分將領忠誠度動搖！`;
  }
  
  addLog(logMsg, 'system');
  updateGlobalStats();
  selectCity(originCity);
}

function openDispatchModal(targetCity) {
  const dispatch = gameState.pendingDispatch;
  dispatch.target = targetCity;
  
  elDispatchTitle.textContent = dispatch.cmd === 'attack' ? '⚔️ 出征配置' : '🚚 移動與運送';
  const portraitPath = dispatch.general.portrait || 'portraits/default.jpg';
  elDispatchGenPortrait.style.backgroundImage = `url('${portraitPath}')`;
  elDispatchGenName.textContent = dispatch.general.name;
  elDispatchRoute.textContent = `${dispatch.origin.name} ➔ ${targetCity.name}`;
  
  const maxTroops = dispatch.origin.troops - (dispatch.cmd === 'attack' ? 1000 : 0);
  elDispatchTroopsSlider.max = maxTroops;
  elDispatchTroopsSlider.value = Math.min(maxTroops, 5000);
  elDispatchTroopsMax.textContent = maxTroops;
  elDispatchTroopsVal.textContent = elDispatchTroopsSlider.value;
  
  const stratagemSelect = document.getElementById('dispatch-stratagem-select');
  const transportArea = document.getElementById('dispatch-transport-area');
  
  if (dispatch.cmd === 'attack') {
    stratagemSelect.parentElement.style.display = 'block';
    stratagemSelect.value = 'none';
    transportArea.style.display = 'none';
  } else {
    stratagemSelect.parentElement.style.display = 'none';
    transportArea.style.display = 'block';
    
    const goldSlider = document.getElementById('dispatch-gold-slider');
    const foodSlider = document.getElementById('dispatch-food-slider');
    const maxGold = dispatch.origin.gold;
    const maxFood = dispatch.origin.food;
    
    goldSlider.max = maxGold;
    goldSlider.value = 0;
    document.getElementById('dispatch-gold-max').textContent = maxGold;
    document.getElementById('dispatch-gold-val').textContent = '0';
    
    foodSlider.max = maxFood;
    foodSlider.value = 0;
    document.getElementById('dispatch-food-max').textContent = maxFood;
    document.getElementById('dispatch-food-val').textContent = '0';
  }

  elDispatchOverlay.classList.remove('hidden');
}

function executeDispatch() {
  const dispatch = gameState.pendingDispatch;
  const troops = parseInt(elDispatchTroopsSlider.value, 10);
  
  if (dispatch.origin.gold < dispatch.cost) {
    alert('金幣不足，無法發兵/移動！');
    return;
  }
  
  let transportGold = 0;
  let transportFood = 0;
  if (dispatch.cmd === 'move') {
    transportGold = parseInt(document.getElementById('dispatch-gold-slider').value, 10) || 0;
    transportFood = parseInt(document.getElementById('dispatch-food-slider').value, 10) || 0;
    
    if (dispatch.origin.gold < dispatch.cost + transportGold) {
      alert(`金幣不足以支付調動費(${dispatch.cost})與運送金(${transportGold})！`);
      return;
    }
  }
  
  dispatch.origin.gold -= dispatch.cost;
  dispatch.general.acted = true;
  dispatch.origin.troops -= troops;
  
  if (dispatch.cmd === 'move') {
    dispatch.origin.gold -= transportGold;
    dispatch.origin.food -= transportFood;
    
    dispatch.general.city = dispatch.target.id;
    dispatch.target.troops += troops;
    dispatch.target.gold += transportGold;
    dispatch.target.food += transportFood;
    
    let transportLog = '';
    if (transportGold > 0 || transportFood > 0) {
      transportLog = `，並押運黃金 ${transportGold} 兩、糧草 ${transportFood} 石`;
    }
    addLog(`🚚【${dispatch.general.name}】率精兵 ${troops} 拔營出發${transportLog}，由【${dispatch.origin.name}】移防至【${dispatch.target.name}】。`, 'system');
  } else if (dispatch.cmd === 'attack') {
    const stratagemSelect = document.getElementById('dispatch-stratagem-select');
    const stratagem = stratagemSelect ? stratagemSelect.value : 'none';
    
    if (stratagem === 'fire' && dispatch.general.stats.int < 80) {
      alert(`【火攻】需要智力 80 以上，${dispatch.general.name} 智力僅 ${dispatch.general.stats.int}，無法施展！`);
      return;
    }
    if (stratagem === 'defend' && dispatch.general.stats.lead < 80) {
      alert(`【堅守】需要統率 80 以上，${dispatch.general.name} 統率為 ${dispatch.general.stats.lead}，無法發動！`);
      return;
    }
    if (stratagem === 'charge' && dispatch.general.stats.str < 85) {
      alert(`【強突】需要武力 85 以上，${dispatch.general.name} 武力僅 ${dispatch.general.stats.str}，無法施展！`);
      return;
    }

    let defGen = gameState.generals.find(g => g.city === dispatch.target.id && g.faction === dispatch.target.faction);
    if (!defGen) {
      defGen = {
        id: 'temp_guard',
        name: `${dispatch.target.name}守將`,
        faction: dispatch.target.faction,
        stats: { lead: 50, str: 55, int: 50, pol: 40, cha: 50 },
        portrait: 'portraits/default.jpg',
        portraitColor: '#555',
        description: '防守城池的無名偏將。'
      };
    }
    startBattle(dispatch.general, troops, dispatch.origin.morale, defGen, dispatch.target, stratagem);
  }
  
  elDispatchOverlay.classList.add('hidden');
  gameState.isSelectingTarget = false;
  gameState.pendingDispatch = null;
  
  updateGlobalStats();
  if (gameState.selectedCity && gameState.selectedCity.id === dispatch.origin.id) {
    selectCity(dispatch.origin);
  }
}

function isAdjacent(c1Id, c2Id) {
  return CONNECTIONS.some(conn => 
    (conn[0] === c1Id && conn[1] === c2Id) || (conn[0] === c2Id && conn[1] === c1Id)
  );
}

// ==================== 戰鬥模組串接 ====================
let currentBattle = null;

function startBattle(attGen, attTroops, attMorale, defGen, destCity, stratagem = 'none') {
  playSound('march');
  
  const attacker = {
    faction: FACTIONS[gameState.playerFactionId],
    general: attGen,
    troops: attTroops,
    morale: attMorale,
    stratagem: stratagem
  };
  const defender = {
    faction: FACTIONS[destCity.faction],
    general: defGen,
    troops: destCity.troops,
    morale: destCity.morale
  };
  
  currentBattle = new BattleSimulation(attacker, defender, destCity, updateBattleUI, onBattleComplete);
  
  const isSiege = (destCity.defense || 0) > 0 && destCity.faction !== 'neutral';
  
  // 檢查玩家解鎖的高級兵種並自動武裝部隊
  if (attGen.faction === gameState.playerFactionId && gameState.unlockedUnits) {
    if (attGen.unitType === 'cavalry') {
      if (gameState.unlockedUnits.includes('tiger_cavalry')) attGen.advancedUnit = 'tiger_cavalry';
      else if (gameState.unlockedUnits.includes('heavy_cavalry')) attGen.advancedUnit = 'heavy_cavalry';
    } else if (attGen.unitType === 'infantry') {
      if (gameState.unlockedUnits.includes('trapping_camp')) attGen.advancedUnit = 'trapping_camp';
      else if (gameState.unlockedUnits.includes('rattan_infantry')) attGen.advancedUnit = 'rattan_infantry';
    } else if (attGen.unitType === 'archer') {
      if (gameState.unlockedUnits.includes('catapult') && isSiege) attGen.advancedUnit = 'catapult';
      else if (gameState.unlockedUnits.includes('zhuge_crossbow')) attGen.advancedUnit = 'zhuge_crossbow';
    }
  }

  const attUnitKey = attGen.advancedUnit || attGen.unitType || 'cavalry';
  const defUnitKey = defGen.advancedUnit || defGen.unitType || 'infantry';
  const attUnitInfo = ADVANCED_UNITS[attUnitKey] || ADVANCED_UNITS['cavalry'];
  const defUnitInfo = ADVANCED_UNITS[defUnitKey] || ADVANCED_UNITS['infantry'];

  elBattleTitleText.textContent = isSiege ? `🏯 攻城・決戰：【${destCity.name}】` : `⚔️ 合戰・野戰：【${destCity.name}】`;
  elBattleSubtitleText.textContent = `${gameState.year}年 ${gameState.month}月`;
  elBattleRoundText.textContent = `第一回合`;
  elBattleAttFactionBanner.innerHTML = `<span class="koei-banner-flag">軍</span><span class="banner-name">${FACTIONS[attGen.faction] ? FACTIONS[attGen.faction].name : '進攻'}軍</span>`;
  elBattleDefFactionBanner.innerHTML = `<span class="banner-name">${FACTIONS[defGen.faction] ? FACTIONS[defGen.faction].name : '防守'}軍</span><span class="koei-banner-flag def">城</span>`;
  elBattleActionText.textContent = '兩軍列陣，殺聲震天！';
  elClashSparks.classList.remove('active');
  
  const attPortrait = attGen.portrait || 'portraits/default.jpg';
  const defPortrait = defGen.portrait || 'portraits/default.jpg';
  
  const attType = attUnitInfo.type || 'cavalry';
  const defType = defUnitInfo.type || 'infantry';
  
  elBattleAttUnitBadge.textContent = attUnitInfo.icon || '騎';
  elBattleDefUnitBadge.textContent = defUnitInfo.icon || '步';
  
  // 兵種相剋判定
  let attAdvantage = '平手';
  let defAdvantage = '平手';
  let attAdvClass = '';
  let defAdvClass = '';
  
  if ((attType === 'cavalry' && defType === 'infantry') || 
      (attType === 'infantry' && defType === 'archer') || 
      (attType === 'archer' && defType === 'cavalry')) {
    attAdvantage = '優勢 (相剋+30%)';
    defAdvantage = '劣勢 (受剋)';
    attAdvClass = 'win';
    defAdvClass = 'lose';
  } else if ((defType === 'cavalry' && attType === 'infantry') || 
             (defType === 'infantry' && attType === 'archer') || 
             (defType === 'archer' && attType === 'cavalry')) {
    attAdvantage = '劣勢 (受剋)';
    defAdvantage = '優勢 (相剋+30%)';
    attAdvClass = 'lose';
    defAdvClass = 'win';
  }
  
  elBattleAttAdvTag.textContent = attAdvantage;
  elBattleAttAdvTag.className = `unit-advantage-tag ${attAdvClass}`;
  elBattleDefAdvTag.textContent = defAdvantage;
  elBattleDefAdvTag.className = `unit-advantage-tag ${defAdvClass}`;
  
  // 特技標籤
  const traitNames = {
    'god_of_war': '【武聖・軍神】',
    'flying_gen': '【飛將・神速】',
    'divine_calc': '【神算・奇策】',
    'falsehood': '【詐謀・識破】',
    'beauty': '【絕色・傾國】',
    'wealthy': '【富商・經世】'
  };
  
  elBattleAttTraitBadge.textContent = traitNames[attGen.trait] || '【勇烈】';
  elBattleDefTraitBadge.textContent = traitNames[defGen.trait] || '【堅守】';
  
  const attTier = getGeneralTier(attGen);
  const defTier = getGeneralTier(defGen);
  
  elBattleAttPortrait.style.backgroundImage = `url('${attPortrait}')`;
  elBattleAttPortrait.style.borderColor = attTier.tierColor;
  elBattleAttGenName.innerHTML = `${attGen.name} <span class="gen-tier-badge ${attTier.tier.toLowerCase()}">${attTier.tier}</span> <span style="font-size: 0.8rem; color: #ffd54f;">[${attUnitInfo.name}]</span>`;
  
  elBattleDefPortrait.style.backgroundImage = `url('${defPortrait}')`;
  elBattleDefPortrait.style.borderColor = defTier.tierColor;
  elBattleDefGenName.innerHTML = `${defGen.name} <span class="gen-tier-badge ${defTier.tier.toLowerCase()}">${defTier.tier}</span> <span style="font-size: 0.8rem; color: #ef9a9a;">[${defUnitInfo.name}]</span>`;
  
  elVisAtt.style.backgroundImage = `url('${attPortrait}')`;
  elVisDef.style.backgroundImage = `url('${defPortrait}')`;
  
  updateBattleUI(currentBattle);
  
  elBattleLogsBox.innerHTML = '';
  currentBattle.logs.forEach(log => appendBattleLog(log.message, log.type));
  
  // 觸發開戰日式橫幅切入
  showKoeiCutin('合 戰 開 幕', `【${attGen.name}】隊 迎戰 【${defGen.name}】隊`);
  
  elBattleNextBtn.onclick = () => {
    playSound('clash');
    currentBattle.nextRound();
  };
  
  elBattleSkipBtn.onclick = () => {
    playSound('command_ok');
    currentBattle.autoResolve();
  };
  
  elBattleNextBtn.disabled = false;
  elBattleSkipBtn.disabled = false;
  elBattleNextBtn.textContent = '進行下回合';
  
  elBattleOverlay.classList.remove('hidden');
  playBGM('battle');
}

// 播放日式光榮奧義/一騎討切入動畫
function showKoeiCutin(title, subtitle) {
  if (!elBattleCutinBanner) return;
  elBattleCutinText.textContent = title;
  elBattleCutinSubtext.textContent = subtitle || '';
  elBattleCutinBanner.classList.remove('hidden');
  
  triggerSlashEffect();
  
  setTimeout(() => {
    if (elBattleCutinBanner) elBattleCutinBanner.classList.add('hidden');
  }, 1200);
}

// 播放斬擊刀光特效與震屏
function triggerSlashEffect() {
  if (!elBattleSlashLayer) return;
  const slash = document.createElement('div');
  slash.className = 'slash-effect';
  elBattleSlashLayer.appendChild(slash);
  
  const battleBox = document.getElementById('battle-box');
  if (battleBox) {
    battleBox.classList.add('screen-shake');
    setTimeout(() => battleBox.classList.remove('screen-shake'), 400);
  }
  
  setTimeout(() => slash.remove(), 400);
}

// 顯示飄動傷害數字
function showFloatingDamage(isDefender, amount, isCritical) {
  if (!elDamagePopups || !amount) return;
  const popup = document.createElement('div');
  popup.className = `floating-damage ${isCritical ? 'critical' : ''}`;
  popup.textContent = `-${amount}`;
  popup.style.top = '35%';
  popup.style.left = isDefender ? '68%' : '22%';
  elDamagePopups.appendChild(popup);
  setTimeout(() => popup.remove(), 800);
}

function updateBattleUI(battle) {
  elBattleRoundText.textContent = `第 ${battle.round} 回合`;

  elBattleAttTroops.textContent = battle.attacker.troops;
  elBattleAttMorale.textContent = battle.attacker.morale;
  elBattleAttMoraleBar.style.width = `${battle.attacker.morale}%`;
  elBattleAttTroopBar.style.width = `${Math.max(0, (battle.attacker.troops / (battle.attacker.maxTroops || 1)) * 100)}%`;
  
  elBattleAttLead.textContent = battle.attacker.general.stats.lead;
  elBattleAttStr.textContent = battle.attacker.general.stats.str;
  elBattleAttInt.textContent = battle.attacker.general.stats.int;
  
  elBattleDefTroops.textContent = battle.defender.troops;
  elBattleDefMorale.textContent = battle.defender.morale;
  elBattleDefMoraleBar.style.width = `${battle.defender.morale}%`;
  elBattleDefTroopBar.style.width = `${Math.max(0, (battle.defender.troops / (battle.defender.maxTroops || 1)) * 100)}%`;
  
  elBattleDefLead.textContent = battle.defender.general.stats.lead;
  elBattleDefStr.textContent = battle.defender.general.stats.str;
  elBattleDefInt.textContent = battle.defender.general.stats.int;
  
  if (battle.isDuelActive) {
    elBattlefieldBg.style.backgroundImage = "url('duel_arena_1786417388471.jpg')";
    elDuelUI.style.display = 'block';
    elDuelDialogueBox.style.display = 'block';
    elDuelAttName.textContent = battle.attacker.general.name;
    elDuelDefName.textContent = battle.defender.general.name;
    elDuelAttHP.style.width = `${battle.attacker.hp}%`;
    elDuelDefHP.style.width = `${battle.defender.hp}%`;
    if (elDuelAttHPVal) elDuelAttHPVal.textContent = battle.attacker.hp;
    if (elDuelDefHPVal) elDuelDefHPVal.textContent = battle.defender.hp;
    elDuelDialogueBox.textContent = battle.dialogueText || '主將交鋒！勝負未分！';
    elBattleActionText.textContent = '⚔ 一 騎 討 ち ⚔';
    
    if (battle.round === 1 || battle.duelRound === 1) {
      showKoeiCutin('一 騎 討 ち', `${battle.attacker.general.name} VS ${battle.defender.general.name}`);
    }
  } else {
    if (battle.isSiege) {
      elBattlefieldBg.style.backgroundImage = "url('siege_battle_bg_1786522025341.jpg')";
    } else {
      elBattlefieldBg.style.backgroundImage = "url('battlefield_bg_1786417373853.jpg')";
    }
    elDuelUI.style.display = 'none';
    elDuelDialogueBox.style.display = 'none';
    elBattleActionText.textContent = battle.isOver ? '合戰終結' : '兩軍白刃混戰';
  }

  // 攻城戰專屬 UI
  if (battle.isSiege && !battle.isDuelActive) {
    elBattleSiegeUI.style.display = 'block';
    elBattleDefCityDef.textContent = battle.city.defense;
    const defPercent = Math.max(0, (battle.city.defense / (battle.maxDefense || 1000)) * 100);
    elBattleDefCityBar.style.width = `${defPercent}%`;
  } else {
    elBattleSiegeUI.style.display = 'none';
  }

  if (battle.round > 1) {
    triggerSlashEffect();
    
    if (battle.lastRoundStats) {
      if (battle.lastRoundStats.attDamage > 0) {
        showFloatingDamage(true, battle.lastRoundStats.attDamage, battle.lastRoundStats.isCritical);
      }
      if (battle.lastRoundStats.defDamage > 0) {
        showFloatingDamage(false, battle.lastRoundStats.defDamage, battle.lastRoundStats.isCritical);
      }
    }
    
    if (battle.isDuelActive) {
      elVisAtt.classList.add('strike');
      elVisDef.classList.add('strike');
      setTimeout(() => {
        elVisAtt.classList.remove('strike');
        elVisDef.classList.remove('strike');
      }, 300);
    } else {
      elVisAtt.classList.add('strike');
      elVisDef.classList.add('strike');
      setTimeout(() => {
        elVisAtt.classList.remove('strike');
        elVisDef.classList.remove('strike');
      }, 300);
    }
  }
  
  elBattleLogsBox.innerHTML = '';
  battle.logs.forEach(log => appendBattleLog(log.message, log.type));
  elBattleLogsBox.scrollTop = elBattleLogsBox.scrollHeight;
}

function appendBattleLog(msg, type) {
  const item = document.createElement('div');
  item.className = `battle-log-item ${type}`;
  item.innerHTML = msg;
  elBattleLogsBox.appendChild(item);
}

function onBattleComplete(battle) {
  elBattleNextBtn.disabled = true;
  elBattleSkipBtn.disabled = true;
  elBattleNextBtn.textContent = '戰鬥結束';
  
  // 清除可能殘留的舊「返回沙盤」按鈕
  const footer = document.querySelector('.battle-footer');
  footer.querySelectorAll('.btn-close-battle').forEach(b => b.remove());
  
  const btnClose = document.createElement('button');
  btnClose.className = 'btn-battle-action btn-close-battle';
  btnClose.textContent = '返回沙盤';
  btnClose.onclick = () => {
    playSound('click');
    playBGM('map');
    elBattleOverlay.classList.add('hidden');
    btnClose.remove();
    
    renderMap();
    updateGlobalStats();
    if (gameState.selectedCity) {
      selectCity(gameState.cities.find(c => c.id === gameState.selectedCity.id));
    }
  };
  
  footer.appendChild(btnClose);

  const destCity = gameState.cities.find(c => c.id === battle.city.id);
  
  if (battle.winner === 'attacker') {
    const oldFaction = FACTIONS[destCity.faction];
    destCity.faction = gameState.playerFactionId;
    destCity.troops = battle.attacker.troops;
    destCity.morale = battle.attacker.morale;
    
    if (battle.defender.general.id !== 'temp_guard') {
      const g = gameState.generals.find(g => g.id === battle.defender.general.id);
      if (g) {
        g.faction = 'neutral';
        g.city = destCity.id;
        g.acted = false;
      }
    }
    
    const attGen = gameState.generals.find(g => g.id === battle.attacker.general.id);
    if (attGen) {
      attGen.city = destCity.id;
    }
    
        triggerCinematic({
      bgImage: 'cinematic_fire.jpg',
      portrait: battle.attacker.general.portrait || 'portraits/default.jpg',
      name: battle.attacker.general.name,
      title: '【大 破 敵 城】',
      sub: `旗開得勝！大軍攻克【${destCity.name}】！原守軍敗退，城池光復！`,
      duration: 3200
    });
    addLog(`🚩【城池光復】攻方將領【${battle.attacker.general.name}】大破敵軍，攻克【${destCity.name}】！原守方${oldFaction.name}敗退，城市易主！`, 'battle');
  } else {
    const attGen = gameState.generals.find(g => g.id === battle.attacker.general.id);
    const originCity = gameState.cities.find(c => c.id === attGen.city);
    
    if (originCity) {
      originCity.troops += battle.attacker.troops;
    }
    destCity.troops = battle.defender.troops;
    destCity.morale = battle.defender.morale;

      const bAttGen = gameState.generals.find(g => g.id === battle.attacker.general.id);
  const bDefGen = gameState.generals.find(g => g.id === battle.defender.general.id);
  if (bAttGen) addGeneralExp(bAttGen, battle.winner === 'attacker' ? 120 : 60, '戰場征伐');
  if (bDefGen && bDefGen.id !== 'temp_guard') addGeneralExp(bDefGen, battle.winner === 'defender' ? 120 : 60, '防守作戰');
    addLog(`🛡️【防守成功】守方將領【${battle.defender.general.name}】擊退了攻方【${battle.attacker.general.name}】的進犯，死守【${destCity.name}】成功！`, 'battle');
  }

  if (battle.attackerWonDuel) {
    gameState.duelWins = (gameState.duelWins || 0) + 1;
  }
  checkAchievements();
  processDynastyGrowth();
}

// ==================== 歷史事件與人物登場 ====================
function checkHistoricalEvents() {
  // 1. 處理人物登場
  const newGenerals = GENERALS.filter(g => g.appearanceYear === gameState.year);
  
  if (newGenerals.length > 0) {
    newGenerals.forEach(g => {
      if (!gameState.generals.find(existingG => existingG.id === g.id)) {
        const genInstance = { ...g, faction: 'neutral', city: g.appearanceCity };
        gameState.generals.push(genInstance);
        
        const cityObj = gameState.cities.find(c => c.id === g.appearanceCity);
        const cityName = cityObj ? cityObj.name : '未知之地';
        
        let title = '名將';
        if (g.id === 'diao_chan') title = '絕世美女';
        if (g.int >= 95) title = '曠世奇才';
        if (g.str >= 95) title = '無雙猛將';

        addLog(`📜【時代浪潮】${title}【${g.name}】於 ${cityName} 嶄露頭角！各路諸侯紛紛派人前往尋訪。`, 'system');
      }
    });
    updateGlobalStats();
  }

  // 2. 處理史實事件
  HISTORICAL_EVENTS.forEach(event => {
    if (event.triggerYear === gameState.year) {
      if (event.condition(gameState)) {
        if (event.getPlayerTarget && event.getPlayerTarget(gameState)) {
          // 玩家是受影響者，顯示選擇模態框
          showHistoricalEvent(event);
        } else {
          // AI勢力或無選項事件，直接執行
          event.execute(gameState, addLog, playSound);
          updateGlobalStats();
          renderMap();
        }
      }
    }
  });
}

function showHistoricalEvent(event) {
  const overlay = document.getElementById('event-overlay');
  const title = document.getElementById('event-title');
  const desc = document.getElementById('event-desc');
  const optionsContainer = document.getElementById('event-options');
  
  title.textContent = event.name;
  desc.textContent = event.playerChoice.description;
  optionsContainer.innerHTML = '';
  
  event.playerChoice.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-start-game'; // 借用一下樣式
    btn.style.width = '100%';
    btn.textContent = opt.text;
    
    // 檢查條件
    if (opt.condition && !opt.condition(gameState)) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
    
    btn.addEventListener('click', () => {
      playSound('command_ok');
      opt.onSelect(gameState, addLog);
      
      // 如果選擇的是預設執行結果 (通常沒有寫滿邏輯，或者可以自己處理)
      // 若onSelect內沒處理核心，我們可以手動補充 (這裡以簡單化為主，讓onSelect處理完全部)
      if (opt.text.includes('天命難違') || opt.text.includes('命喪黃泉')) {
        event.execute(gameState, addLog, playSound);
      }
      
      updateGlobalStats();
      renderMap();
      overlay.classList.add('hidden');
    });
    
    optionsContainer.appendChild(btn);
  });
  
  playSound('battle_start'); // 可以加一個驚悚或事件音效
  overlay.classList.remove('hidden');
}

// ==================== 回合結束處理 (AI與資源產出) ====================
function processEndTurn() {
  gameState.month++;
  if (gameState.month > 12) {
    gameState.year++;
    gameState.month = 1;
    checkHistoricalEvents();
  }
  
  addLog(`━━━━━━━━━ 西元 ${gameState.year} 年 ${gameState.month} 月 ━━━━━━━━━`, 'system');
  
  // 每月特性結算 (例如劉備仁德恢復士氣)
  gameState.cities.forEach(city => {
    if (city.faction !== 'neutral') {
      const faction = FACTIONS[city.faction] || FACTIONS['neutral'] || { name: '中立', color: '#757575', banner: '空', leader: '無' };
      if (faction && faction.trait === 'virtue') {
        city.morale = Math.min(100, city.morale + 5);
      } else if (faction && faction.trait === 'defensive') {
        city.defense = Math.min(city.maxDefense, city.defense + 5);
      } else if (faction && faction.trait === 'horde') {
        city.morale = Math.max(30, city.morale - 2);
      }
    }
  });

  const isIncomeMonth = [1, 4, 7, 10].includes(gameState.month);
  if (isIncomeMonth) {
    addLog(`🌾【秋收春納】天下各州郡結算季度賦稅與糧草。`, 'system');
    
    gameState.cities.forEach(city => {
      if (city.faction !== 'neutral') {
        const faction = FACTIONS[city.faction] || FACTIONS['neutral'] || { name: '中立', color: '#757575', banner: '空', leader: '無' };
        let goldMult = 1.5;
        let foodMult = 6.0;
    if (gameState.techBonuses && gameState.techBonuses.foodIncomeMult) foodMult *= (1 + gameState.techBonuses.foodIncomeMult);
        
        // 天賦加成
        if (faction && faction.trait === 'commerce') goldMult = 1.95; // 增加30%
        if (faction && faction.trait === 'agriculture') foodMult = 6.0; // 增加20%
        if (faction && faction.trait === 'prestige') goldMult += 0.3;

        const cityGens = gameState.generals.filter(g => g.city === city.id && g.faction === city.faction);
        const hasWealthy = cityGens.some(g => g.trait === 'wealthy');
        if (hasWealthy) {
          goldMult += 0.45; // 30% more base multiplier
          foodMult += 1.8;  // 30% more base multiplier
        }

        const goldIncome = Math.floor(city.commerce * goldMult + Math.random() * 50);
        const foodIncome = Math.floor(city.agriculture * foodMult + Math.random() * 200);
        
        city.gold += goldIncome;
        city.food += foodIncome;
        
        const consumption = Math.floor(city.troops * 0.04);
        if (city.food >= consumption) {
          city.food -= consumption;
        } else {
          const deserted = Math.floor(city.troops * 0.05);
          city.troops = Math.max(1000, city.troops - deserted);
          city.morale = Math.max(10, city.morale - 10);
          if (city.faction === gameState.playerFactionId) {
            addLog(`⚠️【${city.name}】兵馬缺糧！${deserted} 名士卒開小差逃散，守軍士氣大跌！`, 'battle');
          }
        }
        
        if (city.faction === gameState.playerFactionId) {
          addLog(`💰【${city.name}】本季增收黃金 ${goldIncome} 兩，糧草 ${foodIncome} 石（消耗 ${consumption} 石）。`, 'system');
        }
      }
    });
  }

  // 隨機天災與豐收事件 (每月 15% 機率發生於隨機一座城市)
  if (Math.random() < 0.15) {
    const eventCity = gameState.cities[Math.floor(Math.random() * gameState.cities.length)];
    const rand = Math.random();
    if (rand < 0.25) {
      // 蝗災 / 瘟疫
      const foodLoss = Math.floor(eventCity.food * 0.3);
      eventCity.food -= foodLoss;
      eventCity.agriculture = Math.max(0, eventCity.agriculture - 20);
      addLog(`🌪️【天災降臨】${eventCity.name} 遭遇嚴重蝗災/瘟疫，農田受損，損失糧草 ${foodLoss} 石！`, 'battle');
    } else if (rand < 0.5) {
      // 大豐收
      const foodGain = Math.floor(eventCity.agriculture * 8 + 500);
      eventCity.food += foodGain;
      addLog(`🌾【祥瑞豐收】${eventCity.name} 風調雨順，迎來大豐收，糧庫暴增 ${foodGain} 石！`, 'system');
    } else if (rand < 0.75) {
      // 商隊雲集
      const goldGain = Math.floor(eventCity.commerce * 4 + 200);
      eventCity.gold += goldGain;
      addLog(`💰【商賈雲集】各路商隊匯聚 ${eventCity.name}，帶動當地繁榮，稅收暴增 ${goldGain} 兩！`, 'system');
    } else {
      // 盜賊四起
      const troopsLoss = Math.floor(eventCity.troops * 0.15);
      eventCity.troops = Math.max(1000, eventCity.troops - troopsLoss);
      eventCity.morale = Math.max(10, eventCity.morale - 15);
      eventCity.defense = Math.max(0, eventCity.defense - 15);
      addLog(`👹【盜賊猖獗】${eventCity.name} 周邊山賊流寇四起，守軍在鎮壓中折損了 ${troopsLoss} 兵馬，士氣與城防下降。`, 'battle');
    }
  }

  // 名士奇遇系統 (每月 12% 機率，玩家專屬)
  if (Math.random() < 0.12) {
    const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
    if (playerCities.length > 0) {
      const encCity = playerCities[Math.floor(Math.random() * playerCities.length)];
      const encRand = Math.random();
      
      if (encRand < 0.33) {
        // 華佗行醫
        encCity.troops += 3000;
        encCity.morale = 100;
        showHistoricalEvent({
          name: '🩺 名醫行醫',
          playerChoice: {
            description: `神醫華佗雲遊至【${encCity.name}】，廣施妙藥，救治無數傷兵與百姓。城中軍民感恩戴德，兵力恢復 3000，士氣達到滿值！`,
            options: [{ text: '謝過神醫', onSelect: () => { document.getElementById('event-overlay').classList.add('hidden'); renderMap(); } }]
          }
        });
      } else if (encRand < 0.66) {
        // 仙人指路
        const cityGens = gameState.generals.filter(g => g.city === encCity.id && g.faction === gameState.playerFactionId);
        if (cityGens.length > 0) {
          const gen = cityGens[Math.floor(Math.random() * cityGens.length)];
          gen.stats.int = Math.min(100, gen.stats.int + 5);
          gen.stats.lead = Math.min(100, gen.stats.lead + 5);
          showHistoricalEvent({
            name: '✨ 仙人指路',
            playerChoice: {
              description: `仙人左慈降臨【${encCity.name}】，見【${gen.name}】骨骼精奇，傳授兵法與奇門遁甲。${gen.name} 獲得仙人指點，統率與智力各永久提升 5 點！`,
              options: [{ text: '叩謝仙人', onSelect: () => { document.getElementById('event-overlay').classList.add('hidden'); renderMap(); } }]
            }
          });
        }
      } else {
        // 司馬徽月旦評
        if (!gameState.relations[gameState.playerFactionId]) gameState.relations[gameState.playerFactionId] = {};
        Object.keys(FACTIONS).forEach(fId => {
          if (fId !== gameState.playerFactionId && fId !== 'neutral') {
            gameState.relations[gameState.playerFactionId][fId] = Math.min(100, (gameState.relations[gameState.playerFactionId][fId] || 0) + 20);
          }
        });
        gameState.generals.filter(g => g.faction === gameState.playerFactionId).forEach(g => {
          g.loyalty = Math.min(100, g.loyalty + 15);
        });
        showHistoricalEvent({
          name: '📜 名士評旦',
          playerChoice: {
            description: `水鏡先生司馬徽在許劭的月旦評上，高度評價了您的治國之才。天下諸侯對您的好感大增（全勢力關係+20），且麾下所有將領備感榮耀（忠誠度+15）！`,
            options: [{ text: '名揚天下', onSelect: () => { document.getElementById('event-overlay').classList.add('hidden'); } }]
          }
        });
      }
    }
  }

  gameState.generals.forEach(g => {
    g.acted = false;
    
    // 忠誠度隨時間下降與下野邏輯
    if (g.faction !== 'neutral' && g.id !== 'temp_guard' && g.faction !== g.id) {
      if (Math.random() < 0.10) {
        g.loyalty = Math.max(0, g.loyalty - Math.floor(Math.random() * 2 + 1));
      }
      
      let recruitBonus = 0;
      const faction = FACTIONS[gameState.playerFactionId];
      if (faction && faction.trait === 'virtue') recruitBonus = 15;
          
      if (g.loyalty < 50 && Math.random() * 100 < 25 + recruitBonus) {
        if (g.faction === gameState.playerFactionId) {
          const c = gameState.cities.find(c => c.id === g.city);
          addLog(`💔【忠誠危機】將軍【${g.name}】對您的統治心灰意冷，離開了【${c ? c.name : '您的陣營'}】下野了！`, 'battle');
        }
        g.faction = 'neutral';
        g.loyalty = 50;
      }
    }
  });

  simulateAITurns();

  updateGlobalStats();
  renderMap();
  if (gameState.selectedCity) {
    selectCity(gameState.cities.find(c => c.id === gameState.selectedCity.id));
  } else {
    deselectCity();
  }
  autoSaveGame();
}

function simulateAITurns() {
  const aiFactions = Object.keys(FACTIONS).filter(id => id !== 'neutral' && id !== gameState.playerFactionId);
  
  aiFactions.forEach(factionId => {
    const aiCities = gameState.cities.filter(c => c.faction === factionId);
    
    aiCities.forEach(city => {
      const cityGens = gameState.generals.filter(g => g.city === city.id && g.faction === factionId);
      if (cityGens.length === 0) return;
      
      const leaderGen = cityGens[0];
      const rand = Math.random();
      
      if (rand < 0.35) {
        const neighbors = gameState.cities.filter(c => c.faction !== factionId && isAdjacent(city.id, c.id));
        
        if (neighbors.length > 0 && city.troops > 12000) {
          neighbors.sort((a, b) => a.troops - b.troops);
          const target = neighbors[0];
          
          let ratio = 1.2;
          if (target.faction === 'neutral') ratio = 1.0;
          
          if (city.troops > target.troops * ratio) {
            const attackForce = city.troops - 5000;
            city.troops = 5000;
            
            let defGen = gameState.generals.find(g => g.city === target.id && g.faction === target.faction);
            if (!defGen) {
              defGen = { name: `${target.name}偏將`, stats: { lead: 50, str: 55, int: 50, pol: 40, cha: 50 }, portrait: 'portraits/default.jpg' };
            }
            
            const faction = FACTIONS[factionId];
            const targetFaction = FACTIONS[target.faction];
            
            const battleSim = new BattleSimulation(
              { faction, general: leaderGen, troops: attackForce, morale: city.morale },
              { faction: targetFaction, general: defGen, troops: target.troops, morale: target.morale },
              target,
              null,
              null
            );
            battleSim.autoResolve();
            
            if (battleSim.winner === 'attacker') {
              target.faction = factionId;
              target.troops = battleSim.attacker.troops;
              target.morale = battleSim.attacker.morale;
              
              leaderGen.city = target.id;
              
              addLog(`⚔️【AI擴張】${faction.name}的【${leaderGen.name}】率大軍攻克了${targetFaction.name}的【${target.name}】！`, 'battle');
            } else {
              city.troops += battleSim.attacker.troops;
              target.troops = battleSim.defender.troops;
              target.morale = battleSim.defender.morale;
              
              addLog(`🛡️【AI交戰】${faction.name}的【${leaderGen.name}】發兵 ${attackForce} 攻打【${target.name}】，被守將【${defGen.name}】成功擊退！`, 'neutral');
            }
            return;
          }
        }
      }
      
      if (rand < 0.5) {
        if (city.agriculture < city.maxAgriculture * 0.8) {
          city.agriculture = Math.min(city.maxAgriculture, city.agriculture + Math.floor(leaderGen.stats.pol * 0.15 + 10));
        } else {
          city.commerce = Math.min(city.maxCommerce, city.commerce + Math.floor(leaderGen.stats.pol * 0.15 + 10));
        }
      } else if (rand < 0.75) {
        city.troops += Math.floor(leaderGen.stats.str * 15 + 300);
        city.morale = Math.min(100, city.morale + 5);
      } else {
        const neutralGens = gameState.generals.filter(g => g.city === city.id && g.faction === 'neutral');
        if (neutralGens.length > 0) {
          const recruitChance = leaderGen.stats.cha / 120;
          if (Math.random() < recruitChance) {
            const targetGen = neutralGens[0];
            targetGen.faction = factionId;
            addLog(`🤝【求賢若渴】${FACTIONS[factionId].name}勢力登用了隱居於【${city.name}】的在野武將【${targetGen.name}】！`, 'system');
          }
        }
      }
    });
  });
}

function addLog(message, type = 'neutral') {
  const item = document.createElement('div');
  item.className = `log-item ${type}`;
  item.innerHTML = message;
  
  elEventLogs.insertBefore(item, elEventLogs.firstChild);
  
  while (elEventLogs.childNodes.length > 50) {
    elEventLogs.removeChild(elEventLogs.lastChild);
  }
}

// ==================== 存檔 / 讀檔系統 ====================


// ==================== 智慧即時自動存檔 (Auto-Save Engine) ====================
function autoSaveGame() {
  if (!gameState.year || !gameState.playerFactionId) return;
  try {
    const saveData = {
      version: 3,
      timestamp: new Date().toISOString(),
      year: gameState.year,
      month: gameState.month,
      playerFactionId: gameState.playerFactionId,
      cities: gameState.cities,
      generals: gameState.generals.map(g => ({
        id: g.id,
        name: g.name,
        faction: g.faction,
        city: g.city,
        stats: g.stats,
        portrait: g.portrait,
        portraitColor: g.portraitColor,
        description: g.description,
        loyalty: g.loyalty,
        items: g.items || [],
        acted: g.acted || false,
        level: g.level || 1,
        exp: g.exp || 0,
        freeStats: g.freeStats || 0
      })),
      factionItems: gameState.factionItems || [],
      researchedTechs: gameState.researchedTechs || [],
      techBonuses: gameState.techBonuses || {},
      children: gameState.children || [],
      spouse: gameState.spouse || null,
      relations: gameState.relations || {},
      alliances: gameState.alliances || {}
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
  } catch(e) {
    /* ignore storage quota error */
  }
}

// 監聽網頁防誤觸重整與離開 (beforeunload)
window.addEventListener('beforeunload', (e) => {
  const overlay = document.getElementById('start-overlay');
  const isGameRunning = overlay && overlay.classList.contains('hidden') && gameState.playerFactionId;
  if (isGameRunning) {
    autoSaveGame();
    e.preventDefault();
    e.returnValue = '您目前有進行中的三國霸業戰局，確定要重新整理或離開嗎？';
    return e.returnValue;
  }
});

// 監聽手機切換背景或鎖定螢幕 (visibilitychange)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    autoSaveGame();
  }
});

window.checkAndShowResumeBanner = checkAndShowResumeBanner;
window.applyLoadedSaveData = applyLoadedSaveData;

function checkAndShowResumeBanner() {
  const banner = document.getElementById('resume-session-banner');
  const title = document.getElementById('resume-session-title');
  const sub = document.getElementById('resume-session-sub');
  const btn = document.getElementById('btn-resume-session');
  if (!banner || !btn) return;

  const rawAuto = localStorage.getItem(AUTOSAVE_KEY) || localStorage.getItem(SAVE_KEY);
  if (!rawAuto) {
    banner.classList.add('hidden');
    return;
  }

  try {
    const saveData = JSON.parse(rawAuto);
    if (!saveData.year || !saveData.playerFactionId) {
      banner.classList.add('hidden');
      return;
    }

    const f = FACTIONS[saveData.playerFactionId];
    const leaderGen = (saveData.generals || []).find(g => g.id === saveData.playerFactionId || (f && g.id === f.id));
    const leaderName = (f && f.leader) || (leaderGen && leaderGen.name) || '主公';
    const factionName = (f && f.name) || (leaderGen ? `${leaderGen.name}軍` : '勢力');
    const myCitiesCount = (saveData.cities || []).filter(c => c.faction === saveData.playerFactionId).length;

    title.textContent = `⚡ 發現上次未完戰局【${leaderName}・${factionName}】`;
    sub.textContent = `西元 ${saveData.year} 年 ${saveData.month} 月 | 控制城池 ${myCitiesCount} 座 | 點擊一鍵直接重返戰場！`;
    banner.classList.remove('hidden');

    if (!btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', () => {
        playSound('command_ok');
        applyLoadedSaveData(saveData);
      });
    }
  } catch(e) {
    banner.classList.add('hidden');
  }
}

function applyLoadedSaveData(saveData) {
  gameState.year = Number(saveData.year) || 184;
  gameState.month = Number(saveData.month) || 1;
  gameState.playerFactionId = saveData.playerFactionId || 'cao_cao';
  
  // 健全自動修復所有城池數值（清除舊存檔可能遺留之 NaN 與 undefined）
  gameState.cities = (saveData.cities || []).map(c => ({
    ...c,
    gold: (!isNaN(Number(c.gold)) && Number(c.gold) >= 0) ? Number(c.gold) : 3000,
    food: (!isNaN(Number(c.food)) && Number(c.food) >= 0) ? Number(c.food) : 12000,
    troops: (!isNaN(Number(c.troops)) && Number(c.troops) >= 0) ? Number(c.troops) : 10000,
    morale: Number(c.morale) || 85,
    defense: Number(c.defense) || 600,
    maxDefense: Number(c.maxDefense) || 1000,
    agriculture: Number(c.agriculture) || 250,
    commerce: Number(c.commerce) || 250
  }));

  if (gameState.cities.length === 0) {
    gameState.cities = CITIES.map(c => ({ ...c, gold: 3000, food: 12000, troops: 10000, morale: 85 }));
  }

  gameState.generals = (saveData.generals || []).map(g => {
    if (g.loyalty === undefined) g.loyalty = g.faction === 'neutral' ? 50 : 100;
    if (!g.items) g.items = [];
    return g;
  });

  gameState.researchedTechs = saveData.researchedTechs || [];
  gameState.techBonuses = saveData.techBonuses || {
    attackBonus: 0,
    defenseBonus: 0,
    infantryDefense: 0,
    cavalryDamage: 0,
    siegeDamage: 0,
    maxMorale: 100
  };
  gameState.factionItems = saveData.factionItems || [];
  gameState.children = saveData.children || [];
  gameState.spouse = saveData.spouse || null;
  gameState.relations = saveData.relations || {};
  gameState.alliances = saveData.alliances || {};
  gameState.selectedCity = null;
  
  document.getElementById('start-overlay')?.classList.add('hidden');
  
  if (gameState.playerFactionId === 'custom_faction' && !FACTIONS['custom_faction']) {
    const customGen = gameState.generals.find(g => g.id === 'custom_faction' || g.id === 'custom_lord');
    FACTIONS['custom_faction'] = {
      id: 'custom_faction',
      name: customGen ? customGen.name : '自創雄主',
      color: customGen ? customGen.portraitColor : '#c62828',
      secondaryColor: 'rgba(229, 57, 53, 0.2)',
      banner: customGen ? customGen.name.charAt(0) : '主',
      leader: customGen ? customGen.name : '自創雄主',
      trait: 'god_of_war'
    };
  }

  const playerCapital = gameState.cities.find(c => c.faction === gameState.playerFactionId) || gameState.cities[0];
  if (playerCapital) {
    selectCity(playerCapital);
  }
  
  updateGlobalStats();
  renderMap();
  updateMyCitiesQuickNav();
  
  playSound('command_ok');
  addLog(`⚡【戰局恢復】已自動銜接上次進行中的進度！西元 ${gameState.year} 年 ${gameState.month} 月`, 'highlight');
}


function saveGame() {
  try {
    const saveData = {
      version: 2,
      timestamp: new Date().toISOString(),
      year: gameState.year,
      month: gameState.month,
      playerFactionId: gameState.playerFactionId,
      cities: gameState.cities,
      generals: gameState.generals.map(g => ({
        id: g.id,
        name: g.name,
        faction: g.faction,
        city: g.city,
        stats: g.stats,
        portrait: g.portrait,
        portraitColor: g.portraitColor,
        description: g.description,
        loyalty: g.loyalty,
        items: g.items || [],
        acted: g.acted || false
      })),
      factionItems: gameState.factionItems
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    addLog(`💾【存檔成功】遊戲進度已儲存！（${gameState.year}年 ${gameState.month}月）`, 'system');
    elSaveBtn.style.borderColor = '#4caf50';
    setTimeout(() => { elSaveBtn.style.borderColor = ''; }, 1500);
  } catch (err) {
    alert('存檔失敗：' + err.message);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      alert('找不到存檔記錄！請先進行遊戲並點擊 💾 儲存。');
      return;
    }
    const saveData = JSON.parse(raw);
    
    gameState.year = saveData.year;
    gameState.month = saveData.month;
    gameState.playerFactionId = saveData.playerFactionId;
    gameState.cities = saveData.cities;
    gameState.generals = saveData.generals.map(g => {
      if (g.loyalty === undefined) g.loyalty = g.faction === 'neutral' ? 50 : 100;
      if (!g.items) g.items = [];
      return g;
    });
    gameState.factionItems = saveData.factionItems || [];
    gameState.relations = saveData.relations || {};
    gameState.alliances = saveData.alliances || {};
    gameState.selectedCity = null;
    
    // 隱藏開局浮層
    elStartOverlay.classList.add('hidden');
    
    // 重繪整個介面
    renderMap();
    updateGlobalStats();
    deselectCity();
    elCommandBar.style.display = 'none';
    
    addLog(`📂【讀檔成功】已載入存檔進度！（${saveData.year}年 ${saveData.month}月，儲存於 ${new Date(saveData.timestamp).toLocaleString('zh-TW')}）`, 'system');
    elLoadBtn.style.borderColor = '#4caf50';
    setTimeout(() => { elLoadBtn.style.borderColor = ''; }, 1500);
  } catch (err) {
    alert('讀檔失敗：' + err.message);
  }
}

// ==================== 交易系統 ====================
let tradeState = {
  general: null,
  city: null,
  mode: 'buy', // 'buy' 或 'sell'
  rate: 10
};

function openTradeModal(general, city) {
  tradeState.general = general;
  tradeState.city = city;
  
  // 政治力影響匯率
  const pol = general.stats.pol;
  
  elTradeGenPortrait.style.backgroundImage = `url('${general.portrait || 'portraits/default.jpg'}')`;
  elTradeGenName.textContent = general.name;
  
  setTradeMode('buy');
  
  if (elCloseTradeBtn) {
    elCloseTradeBtn.onclick = () => elTradeOverlay.classList.add('hidden');
  }
  
  elTradeOverlay.classList.remove('hidden');
}

function setTradeMode(mode) {
  tradeState.mode = mode;
  const pol = tradeState.general.stats.pol;
  
  if (mode === 'buy') {
    // 買入糧草 (消耗黃金)
    // 匯率: 1金 = (10 + (pol-50)*0.1) 糧，也就是政治100時 1金=15糧
    tradeState.rate = Math.floor(8 + Math.max(0, pol - 50) * 0.08);
    elTradeRateText.textContent = `今日匯率: 1 黃金 = ${tradeState.rate} 糧草`;
    
    elTabBuyFood.style.background = '';
    elTabBuyFood.style.borderColor = '';
    elTabSellFood.style.background = 'rgba(255,255,255,0.1)';
    elTabSellFood.style.borderColor = 'rgba(255,255,255,0.3)';
    
    elTradeSliderLabel.textContent = '買入數量 (預算黃金)';
    elTradeSlider.max = tradeState.city.gold;
    elTradeSlider.value = 0;
    elTradeAmountMax.textContent = tradeState.city.gold;
    
    elTradeCostLabel.textContent = '消耗黃金:';
    elTradeGainLabel.textContent = '獲得糧草:';
  } else {
    // 賣出糧草 (消耗糧草)
    // 匯率: (15 - (pol-50)*0.1) 糧 = 1金，也就是政治100時 10糧=1金
    tradeState.rate = Math.floor(20 - Math.max(0, pol - 50) * 0.05);
    elTradeRateText.textContent = `今日匯率: ${tradeState.rate} 糧草 = 1 黃金`;
    
    elTabSellFood.style.background = '';
    elTabSellFood.style.borderColor = '';
    elTabBuyFood.style.background = 'rgba(255,255,255,0.1)';
    elTabBuyFood.style.borderColor = 'rgba(255,255,255,0.3)';
    
    elTradeSliderLabel.textContent = '賣出數量 (消耗糧草)';
    elTradeSlider.max = tradeState.city.food;
    elTradeSlider.value = 0;
    elTradeAmountMax.textContent = tradeState.city.food;
    
    elTradeCostLabel.textContent = '消耗糧草:';
    elTradeGainLabel.textContent = '獲得黃金:';
  }
  
  updateTradeUI();
}

function updateTradeUI() {
  const amount = parseInt(elTradeSlider.value, 10) || 0;
  elTradeAmountVal.textContent = amount;
  
  if (tradeState.mode === 'buy') {
    elTradeCostVal.textContent = `${amount} 黃金`;
    elTradeCostVal.style.color = 'var(--color-gold)';
    elTradeGainVal.textContent = `${amount * tradeState.rate} 糧草`;
    elTradeGainVal.style.color = '#81c784';
  } else {
    elTradeCostVal.textContent = `${amount} 糧草`;
    elTradeCostVal.style.color = '#81c784';
    elTradeGainVal.textContent = `${Math.floor(amount / tradeState.rate)} 黃金`;
    elTradeGainVal.style.color = 'var(--color-gold)';
  }
}

if (elTabBuyFood) elTabBuyFood.onclick = () => setTradeMode('buy');
if (elTabSellFood) elTabSellFood.onclick = () => setTradeMode('sell');
if (elTradeSlider) elTradeSlider.addEventListener('input', updateTradeUI);

if (elTradeConfirmBtn) {
  elTradeConfirmBtn.onclick = () => {
    const amount = parseInt(elTradeSlider.value, 10) || 0;
    if (amount <= 0) {
      alert('請選擇交易數量！');
      return;
    }
    
    tradeState.general.acted = true;
    
    if (tradeState.mode === 'buy') {
      const gain = amount * tradeState.rate;
      tradeState.city.gold -= amount;
      tradeState.city.food += gain;
      addLog(`💰【${tradeState.general.name}】在市場斥資 ${amount} 黃金，購得軍糧 ${gain} 石！`, 'system');
    } else {
      const gain = Math.floor(amount / tradeState.rate);
      tradeState.city.food -= amount;
      tradeState.city.gold += gain;
      addLog(`💰【${tradeState.general.name}】在市場變賣 ${amount} 糧草，籌得軍餉 ${gain} 黃金！`, 'system');
    }
    
    playSound('command_ok');
    updateGlobalStats();
    selectCity(tradeState.city);
    elTradeOverlay.classList.add('hidden');
  };
}
