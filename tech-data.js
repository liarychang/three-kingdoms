// 三國志地圖策略遊戲 - 科技樹與高級兵種系統 (tech-data.js)

export const TECH_TREE = [
  // ================= 軍事科技分支 =================
  {
    id: 'iron_smelting',
    name: '鍛鐵精甲',
    category: 'military',
    tier: 1,
    cost: 2000,
    requires: [],
    icon: '🛡️',
    description: '改良軍械冶鐵鍛造工藝，部隊基礎攻擊與防禦力提升 10%。',
    effect: (gameState) => {
      gameState.techBonuses.attackBonus += 0.10;
      gameState.techBonuses.defenseBonus += 0.10;
    }
  },
  {
    id: 'rattan_armor',
    name: '藤甲盾陣',
    category: 'military',
    tier: 2,
    cost: 3500,
    requires: ['iron_smelting'],
    icon: '🪵',
    description: '編製烏戈藤甲，步兵減傷提升 20%，解鎖【藤甲重步兵】。',
    unlockUnit: 'rattan_infantry',
    effect: (gameState) => {
      gameState.techBonuses.infantryDefense += 0.20;
    }
  },
  {
    id: 'warhorse_breeding',
    name: '良駒繁育',
    category: 'military',
    tier: 2,
    cost: 3500,
    requires: ['iron_smelting'],
    icon: '🐎',
    description: '引進塞外良駒，騎兵衝鋒傷害提升 25%，解鎖【精銳重騎兵】。',
    unlockUnit: 'heavy_cavalry',
    effect: (gameState) => {
      gameState.techBonuses.cavalryDamage += 0.25;
    }
  },
  {
    id: 'repeating_crossbow',
    name: '諸葛連弩',
    category: 'military',
    tier: 2,
    cost: 3500,
    requires: ['iron_smelting'],
    icon: '🏹',
    description: '改良連弩機關，弓兵射速大增並有機率觸發二連射，解鎖【諸葛連弩兵】。',
    unlockUnit: 'zhuge_crossbow',
    effect: (gameState) => {
      gameState.techBonuses.archerDoubleShot = true;
    }
  },
  {
    id: 'catapult_siege',
    name: '霹靂投石',
    category: 'military',
    tier: 3,
    cost: 5000,
    requires: ['repeating_crossbow'],
    icon: '☄️',
    description: '製造發石車發射巨石，攻城時每回合對敵城防造成大量破壞，解鎖【霹靂投石車】。',
    unlockUnit: 'catapult',
    effect: (gameState) => {
      gameState.techBonuses.siegeDamage += 0.50;
    }
  },
  {
    id: 'tiger_leopard_cavalry',
    name: '虎豹驍騎',
    category: 'military',
    tier: 3,
    cost: 6000,
    requires: ['warhorse_breeding'],
    icon: '🐅',
    description: '百里挑一選拔天下精銳，騎兵衝鋒無視城防減免，解鎖【虎豹騎】。',
    unlockUnit: 'tiger_cavalry',
    effect: (gameState) => {
      gameState.techBonuses.cavalryIgnoreDef = true;
    }
  },
  {
    id: 'trapping_camp',
    name: '陷陣死士',
    category: 'military',
    tier: 4,
    cost: 8000,
    requires: ['rattan_armor', 'tiger_leopard_cavalry'],
    icon: '⚔️',
    description: '鎧甲具皆精練，每所攻擊無不破者。全軍士氣上限提升至 120，解鎖傳奇【陷陣營】！',
    unlockUnit: 'trapping_camp',
    effect: (gameState) => {
      gameState.techBonuses.maxMorale = 120;
    }
  },

  // ================= 內政與經濟科技分支 =================
  {
    id: 'tuntian_farming',
    name: '軍民屯田',
    category: 'civil',
    tier: 1,
    cost: 2000,
    requires: [],
    icon: '🌾',
    description: '行屯田之法於各州郡，每季全領地糧草收成額外提升 25%。',
    effect: (gameState) => {
      gameState.techBonuses.foodIncomeMult += 0.25;
    }
  },
  {
    id: 'salt_iron_monopoly',
    name: '鹽鐵官營',
    category: 'civil',
    tier: 1,
    cost: 2000,
    requires: [],
    icon: '💰',
    description: '整頓鹽鐵榷酤，每季全領地商業金錢稅收額外提升 25%。',
    effect: (gameState) => {
      gameState.techBonuses.goldIncomeMult += 0.25;
    }
  },
  {
    id: 'irrigation_system',
    name: '水利深渠',
    category: 'civil',
    tier: 2,
    cost: 4000,
    requires: ['tuntian_farming'],
    icon: '🌊',
    description: '疏通江河修築灌渠，所屬城池永久免疫天災（蝗災/瘟疫）糧草損失。',
    effect: (gameState) => {
      gameState.techBonuses.immuneDisaster = true;
    }
  },
  {
    id: 'grand_fortification',
    name: '金城深塹',
    category: 'civil',
    tier: 2,
    cost: 4500,
    requires: ['salt_iron_monopoly'],
    icon: '🏯',
    description: '修築高聳要塞石牆，所有城池城防上限提升至 1500，且每月自動修復 +10。',
    effect: (gameState) => {
      gameState.techBonuses.maxCityDef = 1500;
      gameState.cities.forEach(c => {
        if (c.faction === gameState.playerFactionId) {
          c.maxDefense = 1500;
        }
      });
    }
  },
  {
    id: 'meritocracy_system',
    name: '九品官人',
    category: 'civil',
    tier: 3,
    cost: 6000,
    requires: ['irrigation_system', 'grand_fortification'],
    icon: '📜',
    description: '推行名士九品選拔制度，登庸人才成功率 +25%，且麾下武將忠誠度不再自然衰減。',
    effect: (gameState) => {
      gameState.techBonuses.noLoyaltyDecay = true;
    }
  },
  {
    id: 'imperial_hegemony',
    name: '帝王霸業',
    category: 'civil',
    tier: 4,
    cost: 10000,
    requires: ['meritocracy_system'],
    icon: '👑',
    description: '威加海內，四方來朝。每月民心士氣自動上升，外交親善效果翻倍！',
    effect: (gameState) => {
      gameState.techBonuses.autoMoraleGrowth = true;
    }
  }
];

export const ADVANCED_UNITS = {
  'infantry': { 
    id: 'infantry', 
    name: '常規步兵', 
    icon: '🛡️', 
    type: 'infantry', 
    strMult: 1.0, 
    defMult: 1.0, 
    desc: '標準步兵方陣，善於結陣抗箭，剋制弓兵。' 
  },
  'rattan_infantry': { 
    id: 'rattan_infantry', 
    name: '藤甲重步', 
    icon: '🪵', 
    type: 'infantry', 
    strMult: 1.20, 
    defMult: 1.40, 
    desc: '刀槍不入的烏戈藤甲兵，物理減傷極高。' 
  },
  'trapping_camp': { 
    id: 'trapping_camp', 
    name: '陷陣死士', 
    icon: '⚔️', 
    type: 'infantry', 
    strMult: 1.45, 
    defMult: 1.35, 
    desc: '高順陷陣營死士，每所攻擊無不破者，攻堅無敵。' 
  },
  
  'cavalry': { 
    id: 'cavalry', 
    name: '常規輕騎', 
    icon: '🐎', 
    type: 'cavalry', 
    strMult: 1.0, 
    defMult: 1.0, 
    desc: '標準輕騎兵，速度機動性高，剋制步兵。' 
  },
  'heavy_cavalry': { 
    id: 'heavy_cavalry', 
    name: '精銳重騎', 
    icon: '🐎', 
    type: 'cavalry', 
    strMult: 1.30, 
    defMult: 1.20, 
    desc: '人馬俱裝鐵甲，衝擊力強悍，撕裂敵軍防線。' 
  },
  'tiger_cavalry': { 
    id: 'tiger_cavalry', 
    name: '虎豹驍騎', 
    icon: '🐅', 
    type: 'cavalry', 
    strMult: 1.50, 
    defMult: 1.25, 
    desc: '曹魏王牌虎豹騎，衝鋒無視城防減免。' 
  },
  
  'archer': { 
    id: 'archer', 
    name: '常規弓手', 
    icon: '🏹', 
    type: 'archer', 
    strMult: 1.0, 
    defMult: 1.0, 
    desc: '標準弓弩手，居高臨下，剋制騎兵衝鋒。' 
  },
  'zhuge_crossbow': { 
    id: 'zhuge_crossbow', 
    name: '諸葛連弩', 
    icon: '🏹', 
    type: 'archer', 
    strMult: 1.35, 
    defMult: 1.10, 
    desc: '蜀漢連弩神兵，十矢俱發，火力極其密集。' 
  },
  'catapult': { 
    id: 'catapult', 
    name: '霹靂投石', 
    icon: '☄️', 
    type: 'archer', 
    strMult: 1.40, 
    defMult: 1.15, 
    desc: '官渡發石巨械，攻城時對敵方城防造成巨量摧毀。' 
  }
};
