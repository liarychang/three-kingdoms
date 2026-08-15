// 三國志地圖策略遊戲 - 絕世神兵與神祕寶物資料 (items-data.js)

export const ITEMS = [
  // ================= 🗡️ 上古神兵與絕世名刃 =================
  { 
    id: 'item_xuanyuan', 
    name: '軒轅夏禹劍', 
    type: 'weapon', 
    stat: 'str', 
    value: 15, 
    extraLead: 10,
    extraCha: 15,
    description: '上古黃帝所鑄聖道神劍，一面日月星辰，一面山川草木，得此劍者號令天下諸侯！', 
    icon: '⚔️', 
    image: 'item_guandao_1786610766721.jpg' 
  },
  { 
    id: 'item_fangtian', 
    name: '方天畫戟', 
    type: 'weapon', 
    stat: 'str', 
    value: 12, 
    description: '呂布所用之神兵，頂端生雙月，畫桿如遊龍，天下無敵。', 
    icon: '🔱', 
    image: 'item_fangtian_1786605046286.jpg' 
  },
  { 
    id: 'item_guandao', 
    name: '青龍偃月刀', 
    type: 'weapon', 
    stat: 'str', 
    value: 10, 
    extraLead: 5,
    description: '關羽成名兵器，又名冷艷鋸，重八十二斤，刀芒如龍破空。', 
    icon: '🗡️', 
    image: 'item_guandao_1786610766721.jpg' 
  },
  { 
    id: 'item_zhangba', 
    name: '丈八蛇矛', 
    type: 'weapon', 
    stat: 'str', 
    value: 9, 
    description: '張飛兵器，矛頭如靈蛇吐信，長一丈八尺，當陽橋前喝退百萬曹兵。', 
    icon: '🐍', 
    image: 'item_zhangba_1786610611961.jpg' 
  },
  { 
    id: 'item_longdan', 
    name: '龍膽亮銀槍', 
    type: 'weapon', 
    stat: 'str', 
    value: 10, 
    extraLead: 6,
    description: '常勝將軍趙子龍本命神槍，長坂坡七進七出，寒芒奪魄。', 
    icon: '✨', 
    image: 'item_zhangba_1786610611961.jpg' 
  },
  { 
    id: 'item_qinggang', 
    name: '青釭劍', 
    type: 'weapon', 
    stat: 'str', 
    value: 9, 
    description: '曹操兩口絕世神劍之一，削鐵如泥，刃透金光，長坂坡趙雲斬夏侯恩所得。', 
    icon: '🗡️', 
    image: 'item_yitian_1786610731949.jpg' 
  },
  { 
    id: 'item_yitian', 
    name: '倚天劍', 
    type: 'weapon', 
    stat: 'str', 
    value: 9, 
    extraLead: 4,
    description: '曹操隨身佩劍，「安得倚天抽寶劍」，鎮壓四方霸氣無雙。', 
    icon: '🗡️', 
    image: 'item_yitian_1786610731949.jpg' 
  },
  { 
    id: 'item_guding', 
    name: '古錠刀', 
    type: 'weapon', 
    stat: 'str', 
    value: 8, 
    extraLead: 4,
    description: '江東猛虎孫堅傳世古神刀，精鋼百煉，刃如彎月，鋒利無雙。', 
    icon: '🗡️', 
    image: 'item_guandao_1786610766721.jpg' 
  },
  { 
    id: 'item_shuanggu', 
    name: '雌雄雙股劍', 
    type: 'weapon', 
    stat: 'str', 
    value: 7, 
    extraCha: 8,
    description: '劉備佩劍，雙劍合璧，一剛一柔，陰陽化生，威震虎牢關。', 
    icon: '⚔️', 
    image: 'item_shuanggu_1786610720678.jpg' 
  },
  { 
    id: 'item_yangyouji', 
    name: '養由基弓', 
    type: 'weapon', 
    stat: 'str', 
    value: 9, 
    extraInt: 5,
    description: '春秋第一神射手養由基之寶弓，百步穿楊，箭無虛發。', 
    icon: '🏹', 
    image: 'item_zhangba_1786610611961.jpg' 
  },
  { 
    id: 'item_liguang', 
    name: '李廣落雁弓', 
    type: 'weapon', 
    stat: 'str', 
    value: 8, 
    extraLead: 5,
    description: '漢飛將軍李廣射石沒羽之寶弓，暴擊破甲，神鬼莫測。', 
    icon: '🏹', 
    image: 'item_zhangba_1786610611961.jpg' 
  },

  // ================= 📜 仙家天書與兵法奇書 =================
  { 
    id: 'item_taigong', 
    name: '太公六韜', 
    type: 'book', 
    stat: 'lead', 
    value: 15, 
    extraInt: 10,
    description: '姜子牙輔周伐紂之兵法元典，文韜武略兼備，全軍攻守皆備！', 
    icon: '📜', 
    image: 'item_sunzi_1786610778618.jpg' 
  },
  { 
    id: 'item_sunzi', 
    name: '孫子兵法', 
    type: 'book', 
    stat: 'lead', 
    value: 12, 
    extraInt: 8,
    description: '兵聖孫武兵家聖典，深諳「兵者詭道也，知己知彼百戰不殆」。', 
    icon: '📜', 
    image: 'item_sunzi_1786610778618.jpg' 
  },
  { 
    id: 'item_ershisi', 
    name: '諸葛兵書二十四篇', 
    type: 'book', 
    stat: 'int', 
    value: 14, 
    extraLead: 10,
    description: '諸葛武侯五丈原臨終所授畢生軍政精要，陣法機變鬼神莫測。', 
    icon: '📜', 
    image: 'item_mengde_1786610744096.jpg' 
  },
  { 
    id: 'item_taiping', 
    name: '太平要術', 
    type: 'book', 
    stat: 'int', 
    value: 12, 
    extraPol: 8,
    description: '南華老仙授張角之三卷仙書，通曉呼風喚雨、灑豆成兵之奇術。', 
    icon: '📜', 
    image: 'item_taiping_1786610790456.jpg' 
  },
  { 
    id: 'item_dunjia', 
    name: '遁甲天書', 
    type: 'book', 
    stat: 'int', 
    value: 11, 
    extraCha: 6,
    description: '仙人左慈峨眉山所傳，暗合奇門遁甲、移形換影之妙理。', 
    icon: '📜', 
    image: 'item_dunjia_1786610805305.jpg' 
  },
  { 
    id: 'item_mengde', 
    name: '孟德新書', 
    type: 'book', 
    stat: 'lead', 
    value: 9, 
    extraPol: 6,
    description: '魏武帝曹操畢生用兵治國心得之結晶，軍政並用。', 
    icon: '📜', 
    image: 'item_mengde_1786610744096.jpg' 
  },
  { 
    id: 'item_qingnang', 
    name: '青囊書', 
    type: 'book', 
    stat: 'pol', 
    value: 12, 
    extraInt: 8,
    description: '神醫華佗傳世之醫道聖典，起死回生，保境安民。', 
    icon: '📜', 
    image: 'item_mengde_1786610744096.jpg' 
  },
  { 
    id: 'item_luban', 
    name: '魯班工械經', 
    type: 'book', 
    stat: 'pol', 
    value: 14, 
    extraLead: 6,
    description: '巧聖魯班攻城防守機關天書，築城加固防禦大幅加速！', 
    icon: '📜', 
    image: 'item_sunzi_1786610778618.jpg' 
  },

  // ================= 🐎 絕世神駒與異域靈獸 =================
  { 
    id: 'item_chitu', 
    name: '赤兔馬', 
    type: 'horse', 
    stat: 'str', 
    value: 8, 
    extraLead: 6,
    description: '「人中呂布，馬中赤兔」，渾身火紅無一雜毛，日行千里夜行八百。', 
    icon: '🐎', 
    image: 'item_chitu_1786610874328.jpg' 
  },
  { 
    id: 'item_hanxue', 
    name: '大宛汗血天馬', 
    type: 'horse', 
    stat: 'str', 
    value: 8, 
    extraLead: 8,
    description: '西域大宛國天山進貢之萬里神駒，馳騁如電，汗如火血。', 
    icon: '🐎', 
    image: 'item_chitu_1786610874328.jpg' 
  },
  { 
    id: 'item_dilu', 
    name: '的盧', 
    type: 'horse', 
    stat: 'cha', 
    value: 7, 
    extraLead: 6,
    description: '額有白點，曾飛躍數丈檀溪救主，靈性通天。', 
    icon: '🐎', 
    image: 'item_dilu_1786610893248.jpg' 
  },
  { 
    id: 'item_jueying', 
    name: '絕影', 
    type: 'horse', 
    stat: 'lead', 
    value: 7, 
    extraStr: 5,
    description: '曹操名駒，顧名思義奔馳極速而不見其影，宛城救主。', 
    icon: '🐎', 
    image: 'item_jueying_1786610902775.jpg' 
  },
  { 
    id: 'item_zhuahuang', 
    name: '爪黃飛電', 
    type: 'horse', 
    stat: 'lead', 
    value: 8, 
    extraCha: 8,
    description: '曹操許田圍獵之坐騎，通體金黃，四蹄如雪，高貴威武。', 
    icon: '🐎', 
    image: 'item_jueying_1786610902775.jpg' 
  },
  { 
    id: 'item_zhaoye', 
    name: '照夜玉獅子', 
    type: 'horse', 
    stat: 'str', 
    value: 8, 
    extraCha: 6,
    description: '趙雲坐騎，通體如白玉生光，長坂坡陷入陷坑一躍而出。', 
    icon: '🐎', 
    image: 'item_dilu_1786610893248.jpg' 
  },
  { 
    id: 'item_baixiang', 
    name: '南蠻戰象王', 
    type: 'horse', 
    stat: 'str', 
    value: 12, 
    extraLead: 10,
    description: '八納洞木鹿大王親馴之披甲巨象，衝撞敵陣城牆如摧枯拉朽！', 
    icon: '🐘', 
    image: 'item_chitu_1786610874328.jpg' 
  },

  // ================= 🔮 異域神祕神器與至尊重寶 =================
  { 
    id: 'item_yuxi', 
    name: '傳國玉璽', 
    type: 'treasure', 
    stat: 'cha', 
    value: 20, 
    extraPol: 15,
    extraLead: 10,
    description: '「受命於天，既壽永昌」，和氏璧所琢秦漢天子至尊權柄，得之者萬民景從！', 
    icon: '👑', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_jiuding', 
    name: '華夏九鼎・雍州鼎', 
    type: 'treasure', 
    stat: 'lead', 
    value: 16, 
    extraPol: 16,
    extraCha: 20,
    description: '大禹鑄造鎮壓九州氣運之至尊王器，得九鼎者天下歸心，國庫稅賦大增！', 
    icon: '🏆', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_qinweiwo', 
    name: '親魏倭王金印', 
    type: 'treasure', 
    stat: 'cha', 
    value: 18, 
    extraPol: 12,
    description: '魏帝曹叡賜予東瀛邪馬台女王卑彌呼之蛇紐純金重印，異邦臣服，外交大振！', 
    icon: '🥇', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_yata', 
    name: '東瀛神鏡・八咫鏡', 
    type: 'treasure', 
    stat: 'int', 
    value: 15, 
    extraCha: 12,
    description: '邪馬台女王卑彌呼神殿祭天神鏡，青銅神光洞察一切敵軍伏兵與計策！', 
    icon: '🪞', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_heshi', 
    name: '和氏璧', 
    type: 'treasure', 
    stat: 'cha', 
    value: 16, 
    extraPol: 12,
    description: '價值連城之千古聖玉，卞和泣血，散發祥和瑞彩，極大提升民心忠誠。', 
    icon: '💎', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_shennong', 
    name: '神農百草鼎', 
    type: 'treasure', 
    stat: 'pol', 
    value: 16, 
    extraInt: 10,
    description: '上古神農氏嘗百草煉丹之鼎，所駐城池農業生產大幅增長！', 
    icon: '🍵', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_haidong', 
    name: '夷州海東靈珠', 
    type: 'treasure', 
    stat: 'cha', 
    value: 14, 
    extraInt: 10,
    description: '採自台灣東南海溝之深海巨蚌靈珠，能辟水火風浪，保佑水軍攻無不克！', 
    icon: '🔮', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_jishi', 
    name: '西羌積石神鼓', 
    type: 'treasure', 
    stat: 'lead', 
    value: 12, 
    extraStr: 8,
    description: '西羌雪山牛皮百鍊戰鼓，陣前擂響聲震百里，部隊士氣永不退縮！', 
    icon: '🥁', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_dayuan_jue', 
    name: '大宛汗血金爵', 
    type: 'treasure', 
    stat: 'pol', 
    value: 12, 
    extraCha: 12,
    description: '絲路西域大宛國王金樽，通商貿易商業收益極大增加！', 
    icon: '🍷', 
    image: 'item_yuxi_1786610915251.jpg' 
  },
  { 
    id: 'item_nuwa', 
    name: '女媧補天五色石', 
    type: 'treasure', 
    stat: 'int', 
    value: 18, 
    extraPol: 18,
    extraCha: 18,
    description: '上古女媧煉石補天遺留凡間之神石，五色霞光流轉，令武將五維全面暴漲！', 
    icon: '🌟', 
    image: 'item_yuxi_1786610915251.jpg' 
  }
];
