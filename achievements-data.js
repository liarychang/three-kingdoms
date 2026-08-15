// 三國志地圖策略遊戲 - 天下成就與榮譽圖鑑系統 (achievements-data.js)

export const ACHIEVEMENTS = [
  {
    id: 'first_conquest',
    name: '拔寨奪城',
    icon: '🚩',
    category: 'military',
    desc: '在天下爭霸中成功攻克第 1 座敵方城池。',
    reward: '國庫黃金 +1000，全軍士氣 +10',
    check: (state) => {
      const owned = state.cities.filter(c => c.faction === state.playerFactionId);
      return owned.length >= (state.startCityCount ? state.startCityCount + 1 : 2);
    }
  },
  {
    id: 'brotherhood_taoyuan',
    name: '桃園結義',
    icon: '🌸',
    category: 'generals',
    desc: '麾下同時擁有【劉備】、【關羽】、【張飛】三位結義兄弟。',
    reward: '全將領忠誠度永久鎖定 100，步兵攻防 +15%',
    check: (state) => {
      const myGens = state.generals.filter(g => g.faction === state.playerFactionId).map(g => g.id);
      return myGens.includes('liu_bei') && myGens.includes('guan_yu') && myGens.includes('zhang_fei');
    }
  },
  {
    id: 'five_tiger_generals',
    name: '五虎齊聚',
    icon: '🐅',
    category: 'generals',
    desc: '招攬集齊【關羽】、【張飛】、【趙雲】、【馬超】、【黃忠】五大名將。',
    reward: '全軍騎兵與弓兵戰鬥力 +20%',
    check: (state) => {
      const myGens = state.generals.filter(g => g.faction === state.playerFactionId).map(g => g.id);
      return ['guan_yu', 'zhang_fei', 'zhao_yun', 'ma_chao', 'huang_zhong'].every(id => myGens.includes(id));
    }
  },
  {
    id: 'wei_champions',
    name: '魏武雄風',
    icon: '🦅',
    category: 'generals',
    desc: '招攬集齊【曹操】、【夏侯惇】、【張遼】、【許褚】、【典韋】。',
    reward: '全勢力商業季收金錢 +30%',
    check: (state) => {
      const myGens = state.generals.filter(g => g.faction === state.playerFactionId).map(g => g.id);
      return ['cao_cao', 'xiahou_dun', 'zhang_liao', 'xu_chu', 'dian_wei'].every(id => myGens.includes(id));
    }
  },
  {
    id: 'divine_strategists',
    name: '臥龍鳳雛',
    icon: '🪶',
    category: 'generals',
    desc: '麾下同時擁有智絕天下的【諸葛亮】與【司馬懿】或【龐統】。',
    reward: '計略成功率提升至 95%，免疫敵方一切計策',
    check: (state) => {
      const myGens = state.generals.filter(g => g.faction === state.playerFactionId).map(g => g.id);
      return myGens.includes('zhuge_liang') && (myGens.includes('sima_yi') || myGens.includes('pang_tong'));
    }
  },
  {
    id: 'tech_master',
    name: '百工極致',
    category: 'tech',
    icon: '🔬',
    desc: '在軍略府中研發掌握至少 8 項勢力科技。',
    reward: '解鎖所有精銳兵種升級費用減半',
    check: (state) => {
      return state.researchedTechs && state.researchedTechs.length >= 8;
    }
  },
  {
    id: 'duel_legend',
    name: '一騎當千',
    category: 'military',
    icon: '⚔️',
    desc: '在陣前一騎討單挑中累計擊敗敵將 5 次。',
    reward: '全勢力將領武力值永久 +3',
    check: (state) => {
      return (state.duelWins || 0) >= 5;
    }
  },
  {
    id: 'grand_alliance',
    name: '合縱連橫',
    category: 'diplomacy',
    icon: '🤝',
    desc: '與天下至少 2 個勢力同時保持親善同盟關係。',
    reward: '每月民心穩定上升，外交親善花費減半',
    check: (state) => {
      let count = 0;
      for (const fId in state.alliances) {
        if (state.alliances[fId] > 0) count++;
      }
      return count >= 2;
    }
  },
  {
    id: 'imperial_seal_holder',
    name: '受命於天',
    category: 'special',
    icon: '👑',
    desc: '尋獲或繳獲傳世至寶【傳國玉璽】。',
    reward: '直接冊封稱王稱帝，全屬性大幅提升',
    check: (state) => {
      return state.factionItems && state.factionItems.some(i => i.id === 'yuxi');
    }
  },
  {
    id: 'hegemon_half_china',
    name: '雄霸半壁',
    category: 'military',
    icon: '🏰',
    desc: '攻克並掌控全天下 8 座以上名城郡縣。',
    reward: '解鎖【大將軍 / 丞相】封號，部隊兵力上限突破',
    check: (state) => {
      const owned = state.cities.filter(c => c.faction === state.playerFactionId);
      return owned.length >= 8;
    }
  },
  {
    id: 'rich_empire',
    name: '富甲四海',
    category: 'civil',
    icon: '💰',
    desc: '國庫累積儲備黃金超過 30,000 兩且糧草超過 80,000 石。',
    reward: '每季額外產生 10% 國庫利息收益',
    check: (state) => {
      const totalGold = state.cities.filter(c => c.faction === state.playerFactionId).reduce((s, c) => s + c.gold, 0);
      const totalFood = state.cities.filter(c => c.faction === state.playerFactionId).reduce((s, c) => s + c.food, 0);
      return totalGold >= 30000 && totalFood >= 80000;
    }
  },
  {
    id: 'unify_china',
    name: '天下一統',
    category: 'special',
    icon: '🐉',
    desc: '平定天下十三州，統一全部城池，登基九五之尊！',
    reward: '通關傳奇史詩成就，載入三國光榮殿堂！',
    check: (state) => {
      return state.cities.every(c => c.faction === state.playerFactionId);
    }
  }
];
