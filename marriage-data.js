// 三國志地圖策略遊戲 - 婚姻、子嗣與家族繁衍系統 (marriage-data.js)

export const TUTOR_COURSES = {
  martial: {
    id: 'martial',
    name: '兵家武藝',
    icon: '⚔️',
    statBonus: { str: 10, lead: 8 },
    desc: '傳授戰陣刀槍騎射與衝鋒陷陣之法，大幅提升武力與統率。'
  },
  strategy: {
    id: 'strategy',
    name: '六韜三略',
    icon: '🪶',
    statBonus: { int: 12, lead: 6 },
    desc: '研讀孫吳兵法與奇門遁甲，大幅提升智力與計略運用。'
  },
  governance: {
    id: 'governance',
    name: '治國經世',
    icon: '📜',
    statBonus: { pol: 12, cha: 8 },
    desc: '修習九品官法、鹽鐵論與安民治道，大幅提升政治與魅力。'
  }
};

export const CHILD_TRAITS = [
  'god_of_war', 'divine_calc', 'flying_gen', 'virtue', 'commerce', 'wealthy'
];
