// 三國志地圖策略遊戲 - 劇本、年代與史詩開場影片數據 (scenarios-data.js)

export const SCENARIOS = [
  {
    id: '184_yellow_turban',
    name: '黃巾之亂',
    year: 184,
    month: 1,
    description: '蒼天已死，黃天當立。張角率領百萬黃巾信徒發動叛亂，席捲中原。大漢朝廷命各路諸侯出兵鎮壓。',
    activeFactions: ['zhang_jiao', 'cao_cao', 'liu_bei', 'sun_quan', 'dong_zhuo'],
    prologue: {
      title: '【甲 子 亂 起・蒼 天 傾 覆】',
      poem: '蒼天已死，黃天當立；歲在甲子，天下大吉！',
      bgImage: 'cinematic_fire.jpg',
      slides: [
        {
          heading: '東漢末年・大廈將傾',
          text: '熹平年間，宦官專權，朝綱崩潰，天下大旱，赤地千里，民不聊生。',
          sub: '鉅鹿人張角自稱「大賢良師」，以符水咒法救濟萬民，聚眾數十萬。',
          image: 'cinematic_fire.jpg',
          sound: 'fire'
        },
        {
          heading: '黃巾狂瀾・天下響應',
          text: '中平元年，張角振臂一呼，三十六方信徒頭裹黃巾揭竿而起，席捲九州八十一郡！',
          sub: '州郡失守，京師震恐。漢靈帝急發詔書，命何進、皇甫嵩、朱儁統兵討伐，並准各路豪傑自募義軍！',
          image: 'cinematic_conspiracy.jpg',
          sound: 'horn'
        },
        {
          heading: '桃園誓約・英雄並起',
          text: '幽州涿縣，劉備、關羽、張飛桃園三結義；曹操任騎都尉斬將搴旗；孫堅帶江東子弟英勇馳騁！',
          sub: '大爭之世已然揭幕！各方梟雄誰能力挽狂瀾，拯救大漢社稷？',
          image: 'cinematic_brotherhood.jpg',
          sound: 'brotherhood'
        }
      ]
    },
    citiesConfig: {
      xiongnu: { faction: 'neutral', troops: 20000 },
      wuhuan: { faction: 'neutral', troops: 18000 },
      samhan: { faction: 'neutral', troops: 15000 },
      dayuan: { faction: 'neutral', troops: 12000 },
      xiqiang: { faction: 'neutral', troops: 20000 },
      banadong: { faction: 'neutral', troops: 18000 },
      yamatai: { faction: 'neutral', troops: 22000 },

      liaodong: { faction: 'neutral', troops: 10000 },
      beiping: { faction: 'liu_bei', troops: 8000, gold: 2000, food: 8000 },
      jinyang: { faction: 'zhang_jiao', troops: 25000 },
      ye: { faction: 'zhang_jiao', troops: 40000 },
      dunhuang: { faction: 'neutral', troops: 8000 },
      tianshui: { faction: 'dong_zhuo', troops: 25000 },
      changan: { faction: 'neutral', troops: 20000 },
      luoyang: { faction: 'neutral', troops: 30000 },
      xuchang: { faction: 'zhang_jiao', troops: 35000 },
      runan: { faction: 'zhang_jiao', troops: 25000 },
      shouchun: { faction: 'cao_cao', troops: 15000, gold: 3000, food: 10000 },
      jianye: { faction: 'sun_quan', troops: 15000 },
      huiji: { faction: 'neutral', troops: 10000 },
      yizhou: { faction: 'neutral', troops: 5000, gold: 3000, food: 10000 },
      chaisang: { faction: 'neutral', troops: 12000 },
      xiangyang: { faction: 'neutral', troops: 15000 },
      changsha: { faction: 'neutral', troops: 10000 },
      wuling: { faction: 'neutral', troops: 6000 },
      jiaozhi: { faction: 'neutral', troops: 10000 },
      chengdu: { faction: 'neutral', troops: 20000 },
      yunnan: { faction: 'neutral', troops: 12000 },
      hanzhong: { faction: 'zhang_jiao', troops: 20000 }
    }
  },
  {
    id: '190_dong_zhuo',
    name: '反董卓聯盟',
    year: 190,
    month: 1,
    description: '董卓廢帝弄權，火燒洛陽。曹操發布矯詔，袁紹為盟主，十八路諸侯齊聚汜水關、虎牢關討伐國賊！',
    activeFactions: ['dong_zhuo', 'cao_cao', 'liu_bei', 'sun_quan', 'yuan_shao', 'ma_teng'],
    prologue: {
      title: '【國 賊 亂 京・十 八 路 諸 侯】',
      poem: '白骨露於野，千里無雞鳴。生民百遺一，念之斷人腸。',
      bgImage: 'siege_battle_bg_1786522025341.jpg',
      slides: [
        {
          heading: '西涼暴虐・洛陽蒙難',
          text: '何進引狼入室，西涼刺史董卓率虎狼之師進京，廢少帝、弒何太后，夜宿龍床，暴虐無道！',
          sub: '朝堂公卿敢怒不敢言，司徒王允痛哭流涕，滿城血淚。',
          image: 'cinematic_conspiracy.jpg',
          sound: 'horn'
        },
        {
          heading: '矯詔傳檄・盟軍齊聚',
          text: '驍騎校尉曹操刺董不成，拔足東奔陳留，散盡家財發布討董矯詔！',
          sub: '袁紹、曹操、孫堅、公孫瓚等十八路諸侯歃血為盟，共推袁紹為盟主，百萬雄師進逼洛陽！',
          image: 'siege_battle_bg_1786522025341.jpg',
          sound: 'clash'
        },
        {
          heading: '虎牢雄關・呂布無雙',
          text: '汜水關前華雄連斬數將，關雲長溫酒斬華雄；虎牢關下呂布天下無雙，劉關張三英戰呂布！',
          sub: '董卓焚燒洛陽二百里宮室，遷都長安，群雄割據之勢已成！',
          image: 'cinematic_fire.jpg',
          sound: 'sword_slash'
        }
      ]
    },
    citiesConfig: {
      xiongnu: { faction: 'neutral', troops: 20000 },
      wuhuan: { faction: 'neutral', troops: 18000 },
      samhan: { faction: 'neutral', troops: 15000 },
      dayuan: { faction: 'neutral', troops: 12000 },
      xiqiang: { faction: 'neutral', troops: 20000 },
      banadong: { faction: 'neutral', troops: 18000 },
      yamatai: { faction: 'neutral', troops: 22000 },

      liaodong: { faction: 'neutral', troops: 10000 },
      beiping: { faction: 'neutral', troops: 12000 },
      jinyang: { faction: 'neutral', troops: 10000 },
      ye: { faction: 'yuan_shao', troops: 35000 },
      dunhuang: { faction: 'neutral', troops: 8000 },
      tianshui: { faction: 'ma_teng', troops: 25000 },
      changan: { faction: 'dong_zhuo', troops: 45000 },
      luoyang: { faction: 'dong_zhuo', troops: 35000 },
      xuchang: { faction: 'cao_cao', troops: 20000 },
      runan: { faction: 'neutral', troops: 12000 },
      shouchun: { faction: 'neutral', troops: 18000 },
      jianye: { faction: 'sun_quan', troops: 20000 },
      huiji: { faction: 'neutral', troops: 10000 },
      yizhou: { faction: 'neutral', troops: 5000, gold: 3000, food: 10000 },
      chaisang: { faction: 'neutral', troops: 12000 },
      xiangyang: { faction: 'liu_bei', troops: 10000, gold: 2500, food: 10000 },
      changsha: { faction: 'neutral', troops: 10000 },
      wuling: { faction: 'neutral', troops: 8000 },
      jiaozhi: { faction: 'neutral', troops: 10000 },
      chengdu: { faction: 'liu_bei', troops: 12000, gold: 3000, food: 12000 },
      yunnan: { faction: 'neutral', troops: 12000 },
      hanzhong: { faction: 'neutral', troops: 15000 }
    }
  },
  {
    id: '194_warlords',
    name: '群雄割據',
    year: 194,
    month: 1,
    description: '董卓伏誅，群雄自立。曹操逐鹿中原，劉備領徐州，孫策平江東，呂布奪兗州，天下豪傑各展雄圖！',
    activeFactions: ['cao_cao', 'liu_bei', 'sun_quan', 'yuan_shao', 'lu_bu', 'ma_teng'],
    prologue: {
      title: '【群 雄 割 據・問 鼎 中 原】',
      poem: '追風掣電馳千里，橫戟凌霜破萬重。壯志未酬身先死，長使英雄淚滿襟。',
      bgImage: 'realistic_china_map_bg_1786592253876.jpg',
      slides: [
        {
          heading: '長安政變・董卓伏誅',
          text: '司徒王允施連環美人計，呂布刺殺董卓於未央殿！涼州軍反撲長安，漢室天子淪為流亡之主。',
          sub: '朝廷威信蕩然無存，天下十三州郡名存實亡，各自割據稱雄！',
          image: 'cinematic_conspiracy.jpg',
          sound: 'sword_slash'
        },
        {
          heading: '江東霸王・中原逐鹿',
          text: '孫策以玉璽借兵，渡江平定江東六郡，人稱「小霸王」；曹操破百萬黃巾，迎天子於許昌以令諸侯！',
          sub: '袁紹雄霸冀青幽并四州，麾下猛將如雲，成為天下最強霸主！',
          image: 'cinematic_coronation.jpg',
          sound: 'horn'
        },
        {
          heading: '徐州風雲・龍爭虎鬥',
          text: '陶謙三讓徐州於劉備；呂布走投無路夜襲下邳！四方豪強各懷鬼胎，血戰一觸即發！',
          sub: '此乃真英雄縱橫天下、以武衛道之黃金時代！',
          image: 'siege_battle_bg_1786522025341.jpg',
          sound: 'clash'
        }
      ]
    },
    citiesConfig: {
      xiongnu: { faction: 'neutral', troops: 20000 },
      wuhuan: { faction: 'neutral', troops: 18000 },
      samhan: { faction: 'neutral', troops: 15000 },
      dayuan: { faction: 'neutral', troops: 12000 },
      xiqiang: { faction: 'neutral', troops: 20000 },
      banadong: { faction: 'neutral', troops: 18000 },
      yamatai: { faction: 'neutral', troops: 22000 },

      liaodong: { faction: 'neutral', troops: 12000 },
      beiping: { faction: 'neutral', troops: 15000 },
      jinyang: { faction: 'neutral', troops: 12000 },
      ye: { faction: 'yuan_shao', troops: 45000 },
      dunhuang: { faction: 'neutral', troops: 8000 },
      tianshui: { faction: 'ma_teng', troops: 30000 },
      changan: { faction: 'neutral', troops: 25000 },
      luoyang: { faction: 'neutral', troops: 20000 },
      xuchang: { faction: 'cao_cao', troops: 35000 },
      runan: { faction: 'lu_bu', troops: 25000 },
      shouchun: { faction: 'neutral', troops: 25000 },
      jianye: { faction: 'sun_quan', troops: 30000 },
      huiji: { faction: 'neutral', troops: 12000 },
      yizhou: { faction: 'neutral', troops: 5000, gold: 3000, food: 10000 },
      chaisang: { faction: 'neutral', troops: 15000 },
      xiangyang: { faction: 'liu_bei', troops: 20000, gold: 4000, food: 18000 },
      changsha: { faction: 'neutral', troops: 15000 },
      wuling: { faction: 'neutral', troops: 10000 },
      jiaozhi: { faction: 'neutral', troops: 12000 },
      chengdu: { faction: 'liu_bei', troops: 18000, gold: 4500, food: 20000 },
      yunnan: { faction: 'neutral', troops: 15000 },
      hanzhong: { faction: 'neutral', troops: 20000 }
    }
  },
  {
    id: '207_three_visits',
    name: '三顧茅廬',
    year: 207,
    month: 1,
    description: '官渡之戰後曹操平定北方，南下指荊襄。劉備三顧草廬請出諸葛亮，隆中對策定三分天下之計！',
    activeFactions: ['cao_cao', 'liu_bei', 'sun_quan', 'ma_teng'],
    prologue: {
      title: '【臥 龍 出 山・赤 壁 烈 焰】',
      poem: '滾滾長江東逝水，浪花淘盡英雄。是非成敗轉頭空。青山依舊在，幾度夕陽紅。',
      bgImage: 'cinematic_fire.jpg',
      slides: [
        {
          heading: '官渡破袁・北方形定',
          text: '官渡一戰，曹操以弱勝強火燒烏巢大破袁紹，遠征烏桓平定河北，一統中原北方！',
          sub: '曹操率八十萬鐵騎大軍飲馬長江，欲順流而下一舉蕩平江南！',
          image: 'cinematic_coronation.jpg',
          sound: 'horn'
        },
        {
          heading: '三顧茅廬・隆中奇策',
          text: '劉備屯兵新野，求賢若渴，三顧隆中茅廬拜訪臥龍先生！',
          sub: '諸葛孔明高臥出山，獻「隆中對」，擘畫跨有荊益、外結好孫權、內修政理三分天下之宏圖！',
          image: 'cinematic_brotherhood.jpg',
          sound: 'select'
        },
        {
          heading: '赤壁業火・三分天下',
          text: '孫劉聯軍共拒強敵，周瑜赤壁用火攻，黃蓋詐降苦肉計，借東風烈焰焚鎖戰船！',
          sub: '檣櫓灰飛煙滅，魏蜀吳鼎足而立的三國傳奇，自此翻開最壯麗的篇章！',
          image: 'cinematic_fire.jpg',
          sound: 'fire'
        }
      ]
    },
    citiesConfig: {
      xiongnu: { faction: 'neutral', troops: 20000 },
      wuhuan: { faction: 'neutral', troops: 18000 },
      samhan: { faction: 'neutral', troops: 15000 },
      dayuan: { faction: 'neutral', troops: 12000 },
      xiqiang: { faction: 'neutral', troops: 20000 },
      banadong: { faction: 'neutral', troops: 18000 },
      yamatai: { faction: 'neutral', troops: 22000 },

      liaodong: { faction: 'neutral', troops: 15000 },
      beiping: { faction: 'cao_cao', troops: 25000 },
      jinyang: { faction: 'cao_cao', troops: 30000 },
      ye: { faction: 'cao_cao', troops: 60000 },
      dunhuang: { faction: 'neutral', troops: 8000 },
      tianshui: { faction: 'ma_teng', troops: 35000 },
      changan: { faction: 'cao_cao', troops: 40000 },
      luoyang: { faction: 'cao_cao', troops: 50000 },
      xuchang: { faction: 'cao_cao', troops: 60000 },
      runan: { faction: 'cao_cao', troops: 30000 },
      shouchun: { faction: 'cao_cao', troops: 35000 },
      jianye: { faction: 'sun_quan', troops: 45000 },
      huiji: { faction: 'sun_quan', troops: 20000 },
      yizhou: { faction: 'neutral', troops: 5000, gold: 3000, food: 10000 },
      chaisang: { faction: 'sun_quan', troops: 30000 },
      xiangyang: { faction: 'liu_bei', troops: 30000 },
      changsha: { faction: 'neutral', troops: 15000 },
      wuling: { faction: 'neutral', troops: 12000 },
      jiaozhi: { faction: 'neutral', troops: 15000 },
      chengdu: { faction: 'neutral', troops: 35000 },
      yunnan: { faction: 'neutral', troops: 20000 },
      hanzhong: { faction: 'neutral', troops: 25000 }
    }
  }
];