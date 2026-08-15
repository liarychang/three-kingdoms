// 三國志地圖策略遊戲 - 武將等級、歷練與奧義覺醒系統 (leveling-data.js)

export const LEVEL_CONFIG = {
  MAX_LEVEL: 20,
  BASE_EXP_REQ: 100,
  EXP_GROWTH_FACTOR: 1.25,
  STAT_POINTS_PER_LEVEL: 2,
  TROOP_CAPACITY_PER_LEVEL: 600
};

export function getExpRequiredForLevel(level) {
  if (level >= LEVEL_CONFIG.MAX_LEVEL) return Infinity;
  return Math.floor(LEVEL_CONFIG.BASE_EXP_REQ * Math.pow(LEVEL_CONFIG.EXP_GROWTH_FACTOR, level - 1));
}

export const LEVEL_TITLES = [
  { minLevel: 1, title: '初露鋒芒', icon: '🌱', buffDesc: '初出茅廬，積累歷練經驗' },
  { minLevel: 4, title: '百戰精銳', icon: '⚔️', buffDesc: '帶兵上限 +1,800，行軍速度微幅提升' },
  { minLevel: 7, title: '陣前驍將', icon: '🐎', buffDesc: '帶兵上限 +3,600，出征部隊先攻傷害 +10%' },
  { minLevel: 10, title: '威震一方', icon: '🛡️', buffDesc: '【堅守】所部承受物理傷害降低 15%' },
  { minLevel: 13, title: '萬夫莫敵', icon: '⚡', buffDesc: '【會心】戰鬥暴擊率 +20%，單挑傷害提升' },
  { minLevel: 16, title: '柱石名帥', icon: '🏯', buffDesc: '【破陣】攻城器械與部隊破門傷害 +25%' },
  { minLevel: 19, title: '登峰造極', icon: '👑', buffDesc: '【天下無雙】全軍士氣上限突破，五維全屬性額外 +5' }
];

export function getLevelTitleInfo(level) {
  let matched = LEVEL_TITLES[0];
  for (const t of LEVEL_TITLES) {
    if (level >= t.minLevel) matched = t;
  }
  return matched;
}

export const AWAKENED_ULTIMATES = {
  guan_yu: {
    name: '武聖神威・千里單騎',
    icon: '🐉',
    desc: '單挑必定重創敵將，所統率大軍戰鬥傷害額外提升 +35%！'
  },
  zhang_fei: {
    name: '當陽怒吼・萬夫莫近',
    icon: '⚡',
    desc: '戰鬥開場怒吼重挫敵方 25 點士氣，使敵軍陣型大亂！'
  },
  zhao_yun: {
    name: '一身是膽・龍膽貫日',
    icon: '✨',
    desc: '承受一切傷害降低 35%，單挑時 HP 低於 30% 自動回復 50% HP！'
  },
  zhuge_liang: {
    name: '八陣奇謀・天火燎原',
    icon: '🪶',
    desc: '施展計略成功率 100%，戰場上引發天火烈焰重創敵軍！'
  },
  lu_bu: {
    name: '無雙亂舞・鬼神降世',
    icon: '👹',
    desc: '攻擊力暴增 +50%，衝鋒完全撕裂城防與敵陣！'
  },
  cao_cao: {
    name: '魏武霸道・天下歸心',
    icon: '🦅',
    desc: '戰勝後敵方將領投降率翻倍，所屬城池商業金錢收入 +30%！'
  },
  zhou_yu: {
    name: '赤壁業火・烈焰焚天',
    icon: '🔥',
    desc: '水戰與攻城威力大增，火計直接焚燬敵軍 30% 兵力與大量城防！'
  },
  sima_yi: {
    name: '鷹視狼顧・鬼謀反噬',
    icon: '👁️',
    desc: '免疫並必定識破敵軍計策，將敵方計謀反噬給敵軍自身！'
  },
  sun_ce: {
    name: '霸王突進・馳騁江東',
    icon: '🐅',
    desc: '騎兵與步兵衝鋒連續發動雙重打擊，戰意滔天！'
  },
  lu_xun: {
    name: '火燒連營・神機奪魄',
    icon: '🔥',
    desc: '野戰每回合對敵軍施加持續灼燒，敵方士氣持續暴跌！'
  },
  guo_jia: {
    name: '十勝十敗・神機妙算',
    icon: '📜',
    desc: '全勢力所有將領戰鬥力 +15%，出征軍糧消耗降低 30%！'
  },
  dian_wei: {
    name: '惡來狂怒・死戰不退',
    icon: '🪓',
    desc: '部隊兵力越少戰力越強，極限狀態下攻擊力提升 100%！'
  }
};
