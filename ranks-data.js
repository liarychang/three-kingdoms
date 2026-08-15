// 三國志地圖策略遊戲 - 朝廷官職與冊封封侯系統 (ranks-data.js)

export const LORD_RANKS = [
  {
    tier: 0,
    title: '州刺史',
    minCities: 1,
    troopLimit: 12000,
    maxAppointments: 2,
    desc: '奉詔鎮守一方州郡，統領初階兵馬。'
  },
  {
    tier: 1,
    title: '州牧',
    minCities: 2,
    troopLimit: 16000,
    maxAppointments: 4,
    desc: '掌一州之軍政大權，威名漸顯。'
  },
  {
    tier: 2,
    title: '鎮東/征西將軍',
    minCities: 4,
    troopLimit: 20000,
    maxAppointments: 6,
    desc: '奉天子密詔開府節制諸軍，征伐四方不臣。'
  },
  {
    tier: 3,
    title: '大將軍',
    minCities: 6,
    troopLimit: 25000,
    maxAppointments: 8,
    desc: '位列三公之上，統領天下兵馬征伐大權！'
  },
  {
    tier: 4,
    title: '丞相',
    minCities: 8,
    troopLimit: 30000,
    maxAppointments: 10,
    desc: '總攬朝綱，贊拜不名，入朝不趨，劍履上殿！'
  },
  {
    tier: 5,
    title: '王爵 (魏王/漢中王/吳王)',
    minCities: 10,
    troopLimit: 35000,
    maxAppointments: 12,
    desc: '設天子旌旗，出入稱警蹕，裂土分封，稱霸天下！'
  },
  {
    tier: 6,
    title: '皇帝 (九五之尊)',
    minCities: 14,
    troopLimit: 40000,
    maxAppointments: 16,
    desc: '登基受禪，踐祚九五，一統華夏十三州！'
  }
];

export const OFFICIAL_POSITIONS = [
  {
    id: 'commander_in_chief',
    name: '大都督',
    icon: '🚩',
    statBonus: { lead: 6, str: 2 },
    effectDesc: '統率 +6，所部隊伍攻防加成 +20%',
    appointee: null
  },
  {
    id: 'grand_strategist',
    name: '軍師祭酒',
    icon: '🪶',
    statBonus: { int: 6, pol: 2 },
    effectDesc: '智力 +6，施展計略與破敵火計威力大增',
    appointee: null
  },
  {
    id: 'cavalry_general',
    name: '驃騎將軍',
    icon: '🐎',
    statBonus: { str: 5, lead: 2 },
    effectDesc: '武力 +5，統領騎兵衝鋒傷害額外 +20%',
    appointee: null
  },
  {
    id: 'chariot_general',
    name: '車騎將軍',
    icon: '🛡️',
    statBonus: { str: 4, lead: 3 },
    effectDesc: '武力 +4、統率 +3，步兵部隊防禦減傷 +15%',
    appointee: null
  },
  {
    id: 'guardian_general',
    name: '衛將軍',
    icon: '🏯',
    statBonus: { lead: 5, pol: 2 },
    effectDesc: '統率 +5，防守作戰時城防修復與減傷 +25%',
    appointee: null
  },
  {
    id: 'taiwei',
    name: '太尉',
    icon: '📜',
    statBonus: { lead: 4, pol: 4 },
    effectDesc: '掌管軍政軍籍，每季軍隊口糧損耗降低 20%',
    appointee: null
  },
  {
    id: 'situ',
    name: '司徒',
    icon: '💰',
    statBonus: { pol: 6, cha: 3 },
    effectDesc: '政治 +6，所駐守城池商業金錢稅收額外 +25%',
    appointee: null
  },
  {
    id: 'sikong',
    name: '司空',
    icon: '🌾',
    statBonus: { pol: 5, lead: 2 },
    effectDesc: '政治 +5，所屬城池農業與水利開墾效率 +30%',
    appointee: null
  },
  {
    id: 'vanguard_general',
    name: '前將軍',
    icon: '⚔️',
    statBonus: { str: 3, lead: 2 },
    effectDesc: '武力 +3、統率 +2，出征時部隊先攻傷害提升',
    appointee: null
  },
  {
    id: 'rear_general',
    name: '後將軍',
    icon: '🛡️',
    statBonus: { str: 3, lead: 2 },
    effectDesc: '武力 +3、統率 +2，斷後守禦部隊士氣不衰',
    appointee: null
  },
  {
    id: 'left_general',
    name: '左將軍',
    icon: '🏹',
    statBonus: { str: 3, int: 2 },
    effectDesc: '武力 +3、智力 +2，弓兵部隊射程與暴擊率提升',
    appointee: null
  },
  {
    id: 'right_general',
    name: '右將軍',
    icon: '🐎',
    statBonus: { str: 3, lead: 2 },
    effectDesc: '武力 +3、統率 +2，機動馳援速度加倍',
    appointee: null
  }
];
