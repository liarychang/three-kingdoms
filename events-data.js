// 三國志地圖策略遊戲 - 動態歷史事件與戰略決策數據庫

export const HISTORICAL_EVENTS = [
  // ================= 188年：黃巾覆滅 =================
  {
    id: 'yellow_turban_fall',
    name: '黃巾覆滅',
    triggerYear: 188,
    condition: (gameState) => gameState.cities.some(c => c.faction === 'zhang_jiao'),
    execute: (gameState, addLog, playSound) => {
      const zhangJiaoGen = gameState.generals.find(g => g.id === 'zhang_jiao');
      if (zhangJiaoGen) zhangJiaoGen.city = null;

      gameState.cities.forEach(c => {
        if (c.faction === 'zhang_jiao') {
          c.faction = 'neutral';
          c.troops = Math.floor(c.troops * 0.3);
          c.morale = 30;
        }
      });
      gameState.generals.forEach(g => {
        if (g.faction === 'zhang_jiao') {
          g.faction = 'neutral';
        }
      });
      
      addLog(`📜【歷史事件】歲月不饒人！大賢良師【張角】病逝，黃巾軍群龍無首，勢力土崩瓦解。`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'zhang_jiao',
    playerChoice: {
      description: '大賢良師張角病重，軍醫束手無策，黃巾軍即將分崩離析！',
      options: [
        { 
          text: '天命難違 (黃巾覆滅)', 
          onSelect: (gameState, addLog) => {} 
        },
        { 
          text: '尋求華佗續命 (消耗 5000 金)', 
          condition: (gameState) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            return playerCities.reduce((sum, c) => sum + c.gold, 0) >= 5000;
          },
          onSelect: (gameState, addLog) => {
            let deducted = 0;
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId && deducted < 5000) {
                const take = Math.min(c.gold, 5000 - deducted);
                c.gold -= take;
                deducted += take;
              }
            });
            addLog(`🌟【逆天改命】花費重金尋得神醫華佗，張角強行續命！黃巾之亂繼續延燒！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 190年：討伐董卓聯軍 =================
  {
    id: 'anti_dong_coalition',
    name: '關東聯軍討董',
    triggerYear: 190,
    condition: (gameState) => {
      const dz = gameState.cities.some(c => c.faction === 'dong_zhuo');
      return dz && gameState.playerFactionId !== 'dong_zhuo';
    },
    execute: (gameState, addLog, playSound) => {
      gameState.cities.forEach(c => {
        if (['cao_cao', 'liu_bei', 'sun_quan', 'yuan_shao', 'gongsun_zan'].includes(c.faction)) {
          c.morale = Math.min(100, c.morale + 20);
        }
      });
      addLog(`📜【歷史事件】十八路諸侯歃血為盟！袁紹為盟主，關東聯軍聲勢浩大，聯軍各城士氣高漲！`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'dong_zhuo',
    playerChoice: {
      description: '關東聯軍兵臨虎牢關與汜水關，洛陽人心惶惶，李儒建議遷都長安！',
      options: [
        {
          text: '遷都長安，焚毀洛陽 (長安兵力+20000，洛陽淪為廢墟)',
          onSelect: (gameState, addLog) => {
            const luoyang = gameState.cities.find(c => c.id === 'luoyang');
            const changan = gameState.cities.find(c => c.id === 'changan');
            if (luoyang && changan) {
              changan.troops += 20000;
              changan.gold += luoyang.gold;
              luoyang.troops = 3000;
              luoyang.gold = 500;
              luoyang.defense = 100;
              luoyang.agriculture = 100;
              luoyang.commerce = 100;
            }
            addLog(`🔥【遷都長安】董卓焚毀洛陽宮廟，劫掠百官百姓西遷長安，長安實力大增！`, 'battle');
          }
        },
        {
          text: '堅守洛陽，決戰關東聯軍 (全軍士氣+30，城防+200)',
          onSelect: (gameState, addLog) => {
            const luoyang = gameState.cities.find(c => c.id === 'luoyang');
            if (luoyang) {
              luoyang.defense = Math.min(luoyang.maxDefense, luoyang.defense + 200);
              luoyang.morale = 100;
            }
            addLog(`⚔️【死守洛陽】董卓親自坐鎮洛陽，派遣呂布、華雄死守虎牢，全軍士氣達到頂點！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 192年：王允連環計 =================
  {
    id: 'dong_zhuo_assassinated',
    name: '王允連環計',
    triggerYear: 192,
    condition: (gameState) => {
      const dongZhuo = gameState.generals.find(g => g.id === 'dong_zhuo');
      const luBu = gameState.generals.find(g => g.id === 'lu_bu');
      return dongZhuo && dongZhuo.city && luBu && luBu.city;
    },
    execute: (gameState, addLog, playSound) => {
      const dongZhuo = gameState.generals.find(g => g.id === 'dong_zhuo');
      if (dongZhuo) dongZhuo.city = null;
      
      const luBu = gameState.generals.find(g => g.id === 'lu_bu');
      if (luBu) {
        luBu.faction = 'dong_zhuo';
      }
      
      addLog(`📜【歷史事件】司徒王允巧施連環美人計，呂布為貂蟬於鳳儀亭刺殺董卓！天下震動！`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'dong_zhuo',
    playerChoice: {
      description: '呂布手持方天畫戟怒斥：「逆賊董卓，受死吧！」王允在旁冷眼相看。',
      options: [
        { 
          text: '命喪黃泉 (由呂布繼承勢力大位)', 
          onSelect: (gameState, addLog) => {} 
        },
        { 
          text: '斬殺王允，重賞呂布 (消耗 8000 金，平息兵變)', 
          condition: (gameState) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            return playerCities.reduce((sum, c) => sum + c.gold, 0) >= 8000;
          },
          onSelect: (gameState, addLog) => {
            let deducted = 0;
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId && deducted < 8000) {
                const take = Math.min(c.gold, 8000 - deducted);
                c.gold -= take;
                deducted += take;
              }
            });
            const luBu = gameState.generals.find(g => g.id === 'lu_bu');
            if (luBu) luBu.loyalty = 100;
            addLog(`🌟【逆天改命】董卓洞悉王允奸計，斬殺王允並以黃金萬兩與名駒贈予呂布，危機解除！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 194年：青梅煮酒論英雄 =================
  {
    id: 'heroes_dialogue',
    name: '青梅煮酒論英雄',
    triggerYear: 194,
    condition: (gameState) => {
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      const lb = gameState.cities.some(c => c.faction === 'liu_bei');
      return cc && lb;
    },
    execute: (gameState, addLog, playSound) => {
      addLog(`📜【歷史事件】曹操於許昌設宴煮酒論天下英雄：「今天下英雄，唯使君與操耳！」劉備巧借聞雷掩飾雄心。`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'liu_bei',
    playerChoice: {
      description: '曹操目光如炬，舉杯笑問：「玄德兄，依你看，當今天下何人可稱英雄？」',
      options: [
        {
          text: '借雷失箸，韜光養晦 (獲贈曹操兵糧支援，兵力+5000，糧草+10000)',
          onSelect: (gameState, addLog) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            if (playerCities.length > 0) {
              playerCities[0].troops += 5000;
              playerCities[0].food += 10000;
            }
            addLog(`🌟【青梅煮酒】劉備巧借落雷掩飾志向，曹操戒心大消，撥給劉備精兵五千與萬石糧草！`, 'system');
          }
        },
        {
          text: '豪氣干雲，拔劍論道 (全體將領武力+3，但與曹操勢力關係降為死敵)',
          onSelect: (gameState, addLog) => {
            gameState.generals.filter(g => g.faction === gameState.playerFactionId).forEach(g => {
              g.stats.str = Math.min(100, g.stats.str + 3);
            });
            if (!gameState.relations[gameState.playerFactionId]) gameState.relations[gameState.playerFactionId] = {};
            gameState.relations[gameState.playerFactionId]['cao_cao'] = 0;
            addLog(`⚔️【志吞山河】劉備長笑拔劍直抒胸臆，麾下眾將士氣沖天，武力提升！曹操視劉備為生平大敵！`, 'battle');
          }
        }
      ]
    }
  },

  // ================= 197年：宛城之戰 =================
  {
    id: 'wancheng_battle',
    name: '宛城夜襲',
    triggerYear: 197,
    condition: (gameState) => {
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      const dw = gameState.generals.find(g => g.id === 'dian_wei');
      return cc && dw && dw.faction === 'cao_cao';
    },
    execute: (gameState, addLog, playSound) => {
      const dianWei = gameState.generals.find(g => g.id === 'dian_wei');
      if (dianWei) dianWei.city = null; // 戰死
      addLog(`📜【歷史事件】張繡宛城叛變夜襲曹操，大將【典韋】死戰營門力竭殉國，曹操痛哭祭奠。`, 'battle');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'cao_cao',
    playerChoice: {
      description: '張繡突然引軍夜襲曹營，火光沖天！典韋赤手空拳擋在營門死戰！',
      options: [
        {
          text: '命典韋斷後，騎絕影突圍 (典韋戰死，獲贈【絕影】名駒，曹操成功脫險)',
          onSelect: (gameState, addLog) => {
            const dianWei = gameState.generals.find(g => g.id === 'dian_wei');
            if (dianWei) dianWei.city = null;
            addLog(`💔【宛城死別】典韋以一敵百壯烈犧牲，曹操痛哭失聲，乘神駒絕影突圍脫險。`, 'battle');
          }
        },
        {
          text: '親率大軍回援典韋 (消耗 3000 兵力，典韋生還且全軍士氣回滿)',
          condition: (gameState) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            return playerCities.reduce((sum, c) => sum + c.troops, 0) >= 5000;
          },
          onSelect: (gameState, addLog) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            if (playerCities.length > 0) {
              playerCities[0].troops = Math.max(1000, playerCities[0].troops - 3000);
              playerCities[0].morale = 100;
            }
            const dianWei = gameState.generals.find(g => g.id === 'dian_wei');
            if (dianWei) dianWei.loyalty = 100;
            addLog(`🌟【同袍死戰】曹操親率親衛殺回血戰重圍，成功救出渾身是血的典韋，三軍感泣！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 200年：官渡夜襲烏巢 =================
  {
    id: 'guandu_wuchao',
    name: '官渡夜襲烏巢',
    triggerYear: 200,
    condition: (gameState) => {
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      const ys = gameState.cities.some(c => c.faction === 'yuan_shao');
      return cc && ys;
    },
    execute: (gameState, addLog, playSound) => {
      const yeCity = gameState.cities.find(c => c.faction === 'yuan_shao');
      if (yeCity) {
        yeCity.food = Math.floor(yeCity.food * 0.2);
        yeCity.troops = Math.max(3000, Math.floor(yeCity.troops * 0.5));
        yeCity.morale = 20;
      }
      addLog(`📜【歷史事件】官渡大戰！許攸投曹，曹操五千精騎夜襲烏巢焚毀袁軍糧草，袁紹主力潰散！`, 'battle');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'yuan_shao',
    playerChoice: {
      description: '密探來報：許攸叛逃許昌，曹操正親率精銳騎兵悄悄逼近烏巢糧倉！',
      options: [
        {
          text: '聽信郭圖之言，按兵不動 (烏巢被焚，糧草損失 80%)',
          onSelect: (gameState, addLog) => {
            const yeCity = gameState.cities.find(c => c.faction === 'yuan_shao');
            if (yeCity) {
              yeCity.food = Math.floor(yeCity.food * 0.2);
              yeCity.morale = 30;
            }
            addLog(`🔥【烏巢火起】曹操一把火燒盡烏巢糧草，河北軍心大潰！`, 'battle');
          }
        },
        {
          text: '採納沮授之策，伏兵烏巢 (消耗 4000 金，反包圍曹軍獲大勝)',
          condition: (gameState) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            return playerCities.reduce((sum, c) => sum + c.gold, 0) >= 4000;
          },
          onSelect: (gameState, addLog) => {
            let deducted = 0;
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId && deducted < 4000) {
                const take = Math.min(c.gold, 4000 - deducted);
                c.gold -= take;
                deducted += take;
              }
            });
            const yeCity = gameState.cities.find(c => c.faction === 'yuan_shao');
            if (yeCity) {
              yeCity.troops += 10000;
              yeCity.morale = 100;
            }
            addLog(`🌟【奇兵逆襲】袁紹於烏巢設下十面埋伏，重創曹操夜襲部隊，河北霸業大振！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 207年：三顧茅廬 =================
  {
    id: 'three_visits',
    name: '三顧茅廬',
    triggerYear: 207,
    condition: (gameState) => {
      const lb = gameState.cities.some(c => c.faction === 'liu_bei');
      const zl = gameState.generals.find(g => g.id === 'zhuge_liang');
      return lb && zl;
    },
    execute: (gameState, addLog, playSound) => {
      const zhuge = gameState.generals.find(g => g.id === 'zhuge_liang');
      if (zhuge) {
        zhuge.faction = 'liu_bei';
        const lbCity = gameState.cities.find(c => c.faction === 'liu_bei');
        if (lbCity) zhuge.city = lbCity.id;
        zhuge.loyalty = 100;
      }
      gameState.cities.forEach(c => {
        if (c.faction === 'liu_bei') {
          c.agriculture = Math.min(c.maxAgriculture, c.agriculture + 50);
          c.commerce = Math.min(c.maxCommerce, c.commerce + 50);
          c.morale = 100;
        }
      });
      addLog(`📜【歷史事件】劉玄德風雪三顧茅廬，臥龍諸葛亮出山相佐！天下三分之策自此確立！`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'liu_bei',
    playerChoice: {
      description: '冬雪漫漫，隆中草廬中琴聲悠揚，臥龍先生諸葛亮正端坐案前。',
      options: [
        {
          text: '懇請出山，共圖天下大業 (獲得諸葛亮加入，全領地農業與商業+50，士氣滿值)',
          onSelect: (gameState, addLog) => {
            const zhuge = gameState.generals.find(g => g.id === 'zhuge_liang');
            if (zhuge) {
              zhuge.faction = 'liu_bei';
              const lbCity = gameState.cities.find(c => c.faction === 'liu_bei');
              if (lbCity) zhuge.city = lbCity.id;
              zhuge.loyalty = 100;
            }
            gameState.cities.forEach(c => {
              if (c.faction === 'liu_bei') {
                c.agriculture = Math.min(c.maxAgriculture, c.agriculture + 50);
                c.commerce = Math.min(c.maxCommerce, c.commerce + 50);
                c.morale = 100;
              }
            });
            addLog(`🌟【如魚得水】諸葛孔明受感於主公至誠，獻《隆中對》誓死相隨，蜀漢國力大盛！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 208年：赤壁之戰 =================
  {
    id: 'red_cliffs_fire',
    name: '赤壁之戰',
    triggerYear: 208,
    condition: (gameState) => {
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      const sq = gameState.cities.some(c => c.faction === 'sun_quan');
      return cc && sq;
    },
    execute: (gameState, addLog, playSound) => {
      gameState.cities.forEach(c => {
        if (c.faction === 'cao_cao') {
          c.troops = Math.max(3000, Math.floor(c.troops * 0.6));
          c.morale = Math.max(10, c.morale - 30);
        }
        if (['sun_quan', 'liu_bei'].includes(c.faction)) {
          c.morale = 100;
        }
      });
      addLog(`📜【歷史事件】赤壁之戰！周瑜黃蓋巧施苦肉計借東風，火燒曹軍八十萬大軍，檣櫓灰飛煙滅！`, 'battle');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'cao_cao',
    playerChoice: {
      description: '長江江面東南風大作，黃蓋率十艘蒙衝火船借風急馳而來，火光沖天！',
      options: [
        {
          text: '鐵鎖連環受阻，全線撤退 (部隊折損 40%，退守中原)',
          onSelect: (gameState, addLog) => {
            gameState.cities.forEach(c => {
              if (c.faction === 'cao_cao') {
                c.troops = Math.max(3000, Math.floor(c.troops * 0.6));
                c.morale = 40;
              }
            });
            addLog(`🔥【赤壁潰敗】曹軍戰船被連環鎖死陷入火海，曹操引殘兵走華容道北撤。`, 'battle');
          }
        },
        {
          text: '識破苦肉計，射殺黃蓋 (消耗 6000 金與 5000 弓兵，擊破東吳水師)',
          condition: (gameState) => {
            const playerCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
            const totalGold = playerCities.reduce((sum, c) => sum + c.gold, 0);
            const totalTroops = playerCities.reduce((sum, c) => sum + c.troops, 0);
            return totalGold >= 6000 && totalTroops >= 10000;
          },
          onSelect: (gameState, addLog) => {
            let deducted = 0;
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId && deducted < 6000) {
                const take = Math.min(c.gold, 6000 - deducted);
                c.gold -= take;
                deducted += take;
              }
            });
            const jianye = gameState.cities.find(c => c.id === 'jianye');
            if (jianye) {
              jianye.troops = Math.max(2000, jianye.troops - 15000);
              jianye.morale = 20;
            }
            addLog(`🌟【水破周郎】曹操早有防備，萬箭齊發射毀火船，反破東吳水師主力！江南震恐！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 219年：水淹七軍 =================
  {
    id: 'flood_seven_armies',
    name: '水淹七軍',
    triggerYear: 219,
    condition: (gameState) => {
      const gy = gameState.generals.find(g => g.id === 'guan_yu');
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      return gy && gy.city && cc;
    },
    execute: (gameState, addLog, playSound) => {
      gameState.cities.forEach(c => {
        if (c.faction === 'cao_cao') {
          c.troops = Math.max(2000, c.troops - 10000);
        }
      });
      const gy = gameState.generals.find(g => g.id === 'guan_yu');
      if (gy) {
        gy.stats.lead = Math.min(100, gy.stats.lead + 3);
        gy.stats.str = Math.min(100, gy.stats.str + 3);
      }
      addLog(`📜【歷史事件】關雲長北伐襄樊，漢水暴漲水淹七軍！生擒于禁斬龐德，威震華夏！`, 'battle');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'liu_bei',
    playerChoice: {
      description: '樊城連日秋雨漢水氾濫，關羽已備大舟，曹魏于禁七軍屯於低窪之處！',
      options: [
        {
          text: '掘開漢水，水淹七軍 (敵軍全線受創，關羽統率與武力+3，全軍士氣滿值)',
          onSelect: (gameState, addLog) => {
            gameState.cities.forEach(c => {
              if (c.faction === 'cao_cao') {
                c.troops = Math.max(2000, c.troops - 12000);
              }
            });
            const gy = gameState.generals.find(g => g.id === 'guan_yu');
            if (gy) {
              gy.stats.lead = Math.min(100, gy.stats.lead + 3);
              gy.stats.str = Math.min(100, gy.stats.str + 3);
            }
            addLog(`🌊【威震華夏】大水漫灌樊城，于禁三萬精銳盡沒，關羽神威名動天下！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 225年：七擒孟獲與南中平定 =================
  {
    id: 'seven_captures_meng_huo',
    name: '七擒孟獲',
    triggerYear: 225,
    condition: (gameState) => {
      const yn = gameState.cities.find(c => c.id === 'yunnan');
      return yn !== undefined;
    },
    execute: (gameState, addLog, playSound) => {
      const yn = gameState.cities.find(c => c.id === 'yunnan');
      if (yn) {
        yn.faction = gameState.playerFactionId;
        yn.troops += 10000;
        yn.morale = 95;
      }
      const mh = gameState.generals.find(g => g.id === 'meng_huo');
      const zr = gameState.generals.find(g => g.id === 'zhu_rong');
      if (mh) mh.faction = gameState.playerFactionId;
      if (zr) zr.faction = gameState.playerFactionId;
      addLog(`📜【歷史事件】南撫夷越！諸葛亮七擒七縱南蠻王孟獲，南中各族歸心，雲南納入版圖！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => true,
    playerChoice: {
      description: '南蠻諸部反叛，南蠻王孟獲勇悍難馴，我軍深入不毛，該如何經略雲南？',
      options: [
        {
          text: '攻心為上，七擒七縱 (孟獲、祝融真心歸降，雲南和平納入勢力，獲1萬精兵)',
          onSelect: (gameState, addLog) => {
            const yn = gameState.cities.find(c => c.id === 'yunnan');
            if (yn) {
              yn.faction = gameState.playerFactionId;
              yn.troops += 10000;
              yn.morale = 95;
            }
            const mh = gameState.generals.find(g => g.id === 'meng_huo');
            const zr = gameState.generals.find(g => g.id === 'zhu_rong');
            if (mh) { mh.faction = gameState.playerFactionId; mh.loyalty = 100; }
            if (zr) { zr.faction = gameState.playerFactionId; zr.loyalty = 100; }
            addLog(`🐅【南蠻平定】「公，天威也，南人不復反矣！」南中永安，蠻王孟獲全族歸附！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 230年：浮海求夷州 (開拓台灣) =================
  {
    id: 'expedition_to_yizhou',
    name: '浮海求夷州',
    triggerYear: 230,
    condition: (gameState) => {
      const yz = gameState.cities.find(c => c.id === 'yizhou');
      return yz !== undefined;
    },
    execute: (gameState, addLog, playSound) => {
      const yz = gameState.cities.find(c => c.id === 'yizhou');
      if (yz) {
        yz.faction = gameState.playerFactionId;
        yz.gold += 5000;
        yz.food += 15000;
        yz.troops += 8000;
      }
      const ww = gameState.generals.find(g => g.id === 'wei_wen');
      if (ww) ww.faction = gameState.playerFactionId;
      addLog(`📜【歷史事件】揚帆破浪！將軍衛溫率樓船艦隊浮海遠航，開拓夷州（台灣），滿載而歸！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => true,
    playerChoice: {
      description: '將軍衛溫上奏：東南海中有名山大島曰「夷州（台灣）」，土地膏腴，願率樓船浮海探勘！',
      options: [
        {
          text: '派遣萬人樓船艦隊開拓夷州 (耗金1000，直接掌控夷州，獲得海東名產與人口)',
          onSelect: (gameState, addLog) => {
            const yz = gameState.cities.find(c => c.id === 'yizhou');
            if (yz) {
              yz.faction = gameState.playerFactionId;
              yz.gold += 5000;
              yz.food += 15000;
              yz.troops += 8000;
            }
            const ww = gameState.generals.find(g => g.id === 'wei_wen');
            if (ww) { ww.faction = gameState.playerFactionId; ww.loyalty = 100; }
            addLog(`🏝️【浮海得勝】樓船艦隊成功登陸夷州！設官安民，海東珍寶源源不斷輸入中原！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 199年：青梅煮酒論英雄 =================
  {
    id: 'qingmei_wine',
    name: '青梅煮酒論英雄',
    triggerYear: 199,
    condition: (gameState) => {
      const cc = gameState.cities.some(c => c.faction === 'cao_cao');
      const lb = gameState.cities.some(c => c.faction === 'liu_bei');
      return cc && lb;
    },
    execute: (gameState, addLog, playSound) => {
      addLog(`📜【歷史事件】許昌後園青梅煮酒！曹操與劉備憑欄對飲：「今天下英雄，唯使君與操耳！」天下豪傑無不側目！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'liu_bei',
    playerChoice: {
      description: '曹操設宴青梅煮酒，突然笑問：「使君久歷四方，必知當世英雄。請問何人可稱英雄？」',
      options: [
        {
          text: '韜光養晦，借雷落箸 (劉備魅力+5，曹操放下戒心，獲得黃金 2000)',
          onSelect: (gameState, addLog) => {
            const lbGen = gameState.generals.find(g => g.id === 'liu_bei');
            if (lbGen) lbGen.stats.cha += 5;
            const myCity = gameState.cities.find(c => c.faction === gameState.playerFactionId);
            if (myCity) myCity.gold += 2000;
            addLog(`🌟【韜晦神謀】劉備借霹靂之聲巧飾失色，曹操大笑「英雄亦畏雷乎」，疑慮盡消！`, 'system');
          }
        },
        {
          text: '意氣風發，指點江山 (劉備統率與武力+3，全軍士氣滿值)',
          onSelect: (gameState, addLog) => {
            const lbGen = gameState.generals.find(g => g.id === 'liu_bei');
            if (lbGen) {
              lbGen.stats.lead += 3;
              lbGen.stats.str += 3;
            }
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId) c.morale = 100;
            });
            addLog(`⚔️【雄心壯志】劉備慷慨陳詞，英雄氣概令曹操驚嘆！三軍將士豪情萬丈！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 200年：千里走單騎 =================
  {
    id: 'qianli_guanyu',
    name: '千里走單騎',
    triggerYear: 200,
    condition: (gameState) => {
      const gy = gameState.generals.find(g => g.id === 'guan_yu');
      return gy !== undefined;
    },
    execute: (gameState, addLog, playSound) => {
      const gy = gameState.generals.find(g => g.id === 'guan_yu');
      if (gy) {
        gy.stats.str = Math.min(100, gy.stats.str + 2);
        gy.stats.lead = Math.min(100, gy.stats.lead + 2);
        gy.loyalty = 100;
      }
      addLog(`📜【歷史事件】忠義貫日月！關羽掛印封金護二嫂，千里走單騎過五關斬六將，重歸劉備麾下！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => gameState.playerFactionId === 'liu_bei' || gameState.playerFactionId === 'cao_cao',
    playerChoice: {
      description: '關羽得知劉備音訊，欲辭曹操北上尋兄，過東嶺、洛陽、汜水、滎陽、滑州諸關！',
      options: [
        {
          text: '一路通關，賜錦袍送行 (關羽武力與統率+2，全軍士氣提升 30%)',
          onSelect: (gameState, addLog) => {
            const gy = gameState.generals.find(g => g.id === 'guan_yu');
            if (gy) {
              gy.stats.str = Math.min(100, gy.stats.str + 2);
              gy.stats.lead = Math.min(100, gy.stats.lead + 2);
              gy.loyalty = 100;
            }
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId) c.morale = Math.min(100, c.morale + 30);
            });
            addLog(`🌟【義薄雲天】赤兔馬踏千里塵，青龍刀劈百重險！天下武人無不拜服關雲長忠義！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 208年：七星壇借東風 =================
  {
    id: 'dongfeng_qixing',
    name: '七星壇禳星借東風',
    triggerYear: 208,
    condition: (gameState) => {
      const zl = gameState.generals.find(g => g.id === 'zhuge_liang');
      return zl && zl.faction === gameState.playerFactionId;
    },
    execute: (gameState, addLog, playSound) => {
      gameState.cities.forEach(c => {
        if (c.faction === gameState.playerFactionId) c.morale = 100;
      });
      addLog(`📜【歷史事件】孔明南屏山七星壇散髮步罡，借得三日三夜東南大風！江東火計必勝！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => {
      const zl = gameState.generals.find(g => g.id === 'zhuge_liang');
      return zl && zl.faction === gameState.playerFactionId;
    },
    playerChoice: {
      description: '大戰在即，江面萬事俱備只欠東風！諸葛孔明上奏：願於南屏山築七星壇禳風借運！',
      options: [
        {
          text: '築七星壇，借得東南大風 (全領地士氣滿值，火攻與計策威力提升 300%)',
          onSelect: (gameState, addLog) => {
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId) {
                c.morale = 100;
                c.food += 5000;
              }
            });
            addLog(`🌪️【天助神威】東南狂風大作，巨浪滔天！長江曹軍戰船陷入狂風火海！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 210年：神醫華佗傳授五禽戲 =================
  {
    id: 'huatuo_wuqin',
    name: '神醫華佗懸壺傳世',
    triggerYear: 210,
    condition: (gameState) => true,
    execute: (gameState, addLog, playSound) => {
      gameState.generals.forEach(g => {
        if (g.faction === gameState.playerFactionId) {
          g.stats.str += 2;
          g.stats.lead += 2;
        }
      });
      addLog(`📜【傳奇事件】神醫華佗雲遊至主公領地，為全軍將士推廣《五禽戲》，全將領強身健體，武力與統率提升！`, 'system');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => true,
    playerChoice: {
      description: '神醫華佗背負藥箱遊歷至此，見軍中多有傷患，願傳授五禽養生術與麻沸散金方！',
      options: [
        {
          text: '迎請入府，普傳五禽戲 (麾下全體武將武力與統率+2，全城部隊士氣+20)',
          onSelect: (gameState, addLog) => {
            gameState.generals.forEach(g => {
              if (g.faction === gameState.playerFactionId) {
                g.stats.str += 2;
                g.stats.lead += 2;
              }
            });
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId) c.morale = Math.min(100, c.morale + 20);
            });
            addLog(`🌿【五禽養生】虎鹿熊猿鳥！三軍將士習得五禽神技，筋骨強健，百病不生！`, 'system');
          }
        }
      ]
    }
  },

  // ================= 215年：西域三十六國入貢 =================
  {
    id: 'silk_road_tribute',
    name: '西域三十六國納貢',
    triggerYear: 215,
    condition: (gameState) => {
      const dh = gameState.cities.find(c => c.id === 'dunhuang');
      return dh && dh.faction === gameState.playerFactionId;
    },
    execute: (gameState, addLog, playSound) => {
      const myCities = gameState.cities.filter(c => c.faction === gameState.playerFactionId);
      myCities.forEach(c => {
        c.gold += 3000;
        c.commerce = Math.min(c.maxCommerce, c.commerce + 50);
      });
      addLog(`📜【外域盛典】絲綢之路大通！大宛、龜茲、樓蘭等西域諸國派遣商隊入朝納貢，獲得萬兩黃金！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => {
      const dh = gameState.cities.find(c => c.id === 'dunhuang');
      return dh && dh.faction === gameState.playerFactionId;
    },
    playerChoice: {
      description: '絲路暢通無阻，西域大宛宛王遣使獻上大宛汗血神駒三千匹與西域美酒金銀！',
      options: [
        {
          text: '厚待西域使臣，廣開互市 (獲得黃金 8000，全城池商業+60，獲得汗血天馬)',
          onSelect: (gameState, addLog) => {
            const dh = gameState.cities.find(c => c.id === 'dunhuang');
            if (dh) {
              dh.gold += 8000;
              dh.commerce = Math.min(dh.maxCommerce, dh.commerce + 60);
              dh.troops += 5000;
            }
            addLog(`🐫【絲路萬里】西域珍寶滿載入關！漢威遠播西域三十六國！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 218年：蓬萊槍神童淵傳藝 =================
  {
    id: 'tongyuan_training',
    name: '蓬萊槍神童淵傳藝',
    triggerYear: 218,
    condition: (gameState) => true,
    execute: (gameState, addLog, playSound) => {
      const ty = gameState.generals.find(g => g.id === 'tong_yuan');
      if (ty) ty.faction = gameState.playerFactionId;
      addLog(`📜【隱世奇遇】蓬萊槍神散人【童淵】感佩主公仁武，現身軍中傳授「百鳥朝鳳槍法」！`, 'highlight');
      playSound('brotherhood');
    },
    getPlayerTarget: (gameState) => true,
    playerChoice: {
      description: '一位仙風道骨之老者手持丈二亮銀槍現身軍營校場，一式百鳥朝鳳化出漫天槍影！',
      options: [
        {
          text: '尊奉為三軍武學總教頭 (童淵加入勢力，全體武將武力+3，騎兵攻擊力+20%)',
          onSelect: (gameState, addLog) => {
            const ty = gameState.generals.find(g => g.id === 'tong_yuan');
            if (ty) {
              ty.faction = gameState.playerFactionId;
              ty.loyalty = 100;
            }
            gameState.generals.forEach(g => {
              if (g.faction === gameState.playerFactionId) g.stats.str += 3;
            });
            addLog(`🥋【槍神入伍】槍術宗師童淵親授槍法！麾下眾將武藝大進，三軍鐵騎勢不可擋！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 222年：五溪蠻王沙摩柯相助 =================
  {
    id: 'shamoke_joins',
    name: '五溪蠻王出山相助',
    triggerYear: 222,
    condition: (gameState) => {
      const wl = gameState.cities.find(c => c.id === 'wuling');
      return wl && wl.faction === gameState.playerFactionId;
    },
    execute: (gameState, addLog, playSound) => {
      const smk = gameState.generals.find(g => g.id === 'shamoke');
      if (smk) {
        smk.faction = gameState.playerFactionId;
        smk.loyalty = 100;
      }
      const wl = gameState.cities.find(c => c.id === 'wuling');
      if (wl) {
        wl.troops += 12000;
        wl.morale = 100;
      }
      addLog(`📜【名將來投】五溪蠻王【沙摩柯】率萬名蠻兵帶鐵蒺藜骨朵出山，誓死輔佐主公！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => {
      const wl = gameState.cities.find(c => c.id === 'wuling');
      return wl && wl.faction === gameState.playerFactionId;
    },
    playerChoice: {
      description: '武陵深山中五溪蠻部聚義，首領沙摩柯手提鐵骨朵，率精悍蠻勇萬人請求效力！',
      options: [
        {
          text: '設宴冊封五溪蠻王 (沙摩柯加入，武陵獲得 12000 蠻勇部隊，全軍士氣滿值)',
          onSelect: (gameState, addLog) => {
            const smk = gameState.generals.find(g => g.id === 'shamoke');
            if (smk) {
              smk.faction = gameState.playerFactionId;
              smk.loyalty = 100;
            }
            const wl = gameState.cities.find(c => c.id === 'wuling');
            if (wl) {
              wl.troops += 12000;
              wl.morale = 100;
            }
            addLog(`🏹【蠻王歸順】沙摩柯高舉骨朵大旗，率五溪勇士萬眾歸心！`, 'highlight');
          }
        }
      ]
    }
  },

  // ================= 238年：東瀛邪馬台使節入洛陽・冊封親魏倭王 =================
  {
    id: 'himiko_tribute_238',
    name: '邪馬台朝貢・冊封親魏倭王',
    triggerYear: 238,
    condition: (gameState) => true,
    execute: (gameState, addLog, playSound) => {
      const ym = gameState.cities.find(c => c.id === 'yamatai');
      if (ym) {
        ym.gold += 5000;
        ym.food += 15000;
      }
      addLog(`📜【外域盛典】東瀛邪馬台國女王【卑彌呼】派遣正使難升米橫渡大海入貢！朝廷賜封「親魏倭王」金印紫綬！`, 'highlight');
      playSound('command_ok');
    },
    getPlayerTarget: (gameState) => true,
    playerChoice: {
      description: '東瀛大舟浮海抵達海岸，邪馬台正使難升米奉卑彌呼女王之命，獻上班布、倭錦、生口與八咫神鏡！',
      options: [
        {
          text: '隆重冊封「親魏倭王」，賜金印紫綬 (獲得【親魏倭王金印】、【八咫鏡】，邪馬台締結永世盟好)',
          onSelect: (gameState, addLog) => {
            const hm = gameState.generals.find(g => g.id === 'himiko');
            const nsm = gameState.generals.find(g => g.id === 'nashime');
            if (hm) hm.loyalty = 100;
            if (nsm) nsm.loyalty = 100;
            gameState.cities.forEach(c => {
              if (c.faction === gameState.playerFactionId) c.gold += 6000;
            });
            addLog(`👑【天朝威儀】金印紫綬頒賜東瀛！邪馬台女王卑彌呼感激涕零，誓為海東藩屏！`, 'highlight');
          }
        }
      ]
    }
  }

];
