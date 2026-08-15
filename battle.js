// 三國志地圖策略遊戲 - 戰鬥與單挑引擎 (battle.js)
import { ADVANCED_UNITS } from './tech-data.js';

export class BattleSimulation {
  constructor(attacker, defender, city, onStepCallback, onCompleteCallback) {
    this.attacker = {
      faction: attacker.faction,
      general: attacker.general,
      troops: attacker.troops,
      morale: attacker.morale,
      maxTroops: attacker.troops,
      hp: 100 // 用於單挑
    };
    this.defender = {
      faction: defender.faction,
      general: defender.general,
      troops: defender.troops,
      morale: defender.morale,
      maxTroops: defender.troops,
      hp: 100 // 用於單挑
    };
    this.city = city;
    this.round = 1;
    this.isOver = false;
    this.winner = null;
    this.logs = [];
    this.onStepCallback = onStepCallback;
    this.onCompleteCallback = onCompleteCallback;
    
    this.isDuelActive = false;
    this.duelRound = 1;
    
    this.maxDefense = city ? (city.maxDefense || city.defense || 500) : 500;
    this.isSiege = (city && city.defense > 0 && city.faction !== 'neutral');
    
    // 初始化開戰日誌
    this.log(`⚔️【${this.attacker.general.name}】率軍進攻【${this.city.name}】！守將為【${this.defender.general.name}】！`, 'highlight');
    if (this.isSiege) {
      this.log(`🏰【攻城戰觸發】${this.city.name} 城防值為 ${this.city.defense}，防守部隊享有城防庇護！`, 'neutral');
    }
    
    this.initBattle();
  }

  initBattle() {
    this.log(`【戰事爆发】${this.attacker.faction.name}的【${this.attacker.general.name}】率兵 ${this.attacker.troops} 攻打${this.defender.faction.name}防守的【${this.city.name}】！`, 'system');
    this.log(`【${this.city.name}】防守將領為【${this.defender.general.name}】，防守兵力 ${this.defender.troops}，城防值 ${this.city.defense}。`, 'system');
    
    // 處理特技與戰術
    let attackerMoraleBonus = 0;
    if (this.attacker.general.trait === 'god_of_war' || this.attacker.general.trait === 'flying_gen') {
      attackerMoraleBonus = 20; // 飛將、軍神自帶士氣加成
    }

    if (this.attacker.stratagem === 'fire') {
      const damage = Math.floor(this.defender.troops * 0.15 + 500);
      this.defender.troops = Math.max(0, this.defender.troops - damage);
      this.defender.morale = Math.max(0, this.defender.morale - 20);
      this.log(`🔥【戰術發動】${this.attacker.general.name} 點燃大火！守軍被火勢包圍，損失兵力 ${damage}，士氣大跌！`, 'battle');
    } else if (this.attacker.stratagem === 'defend') {
      const damage = Math.floor(this.defender.troops * 0.05 + 100);
      this.defender.troops = Math.max(0, this.defender.troops - damage);
      this.defender.morale = Math.max(0, this.defender.morale - 30);
      this.attacker.morale = Math.min(100, this.attacker.morale + 10 + attackerMoraleBonus);
      this.log(`🛡️【戰術發動】${this.attacker.general.name} 下令堅守壁壘！敵軍久攻不下，士氣大挫！我軍士氣高昂！`, 'battle');
    } else if (this.attacker.stratagem === 'charge') {
      const attDamage = Math.floor(this.attacker.troops * 0.1 + 300);
      const defDamage = Math.floor(this.defender.troops * 0.2 + 800);
      this.attacker.troops = Math.max(0, this.attacker.troops - attDamage);
      this.defender.troops = Math.max(0, this.defender.troops - defDamage);
      this.attacker.morale = Math.min(100, this.attacker.morale + attackerMoraleBonus);
      this.log(`⚔️【戰術發動】${this.attacker.general.name} 發動殊死突擊！雙方血戰，我軍折損 ${attDamage}，敵方重創 ${defDamage} 兵力！`, 'battle');
    }

    if (this.defender.troops <= 0) {
      this.isOver = true;
      this.winner = 'attacker';
      this.log(`🏆 敵軍在計策打擊下全軍覆沒！進攻方將領【${this.attacker.general.name}】未折一兵一卒攻克【${this.city.name}】！`, 'system');
      return;
    }

    // 隨機判定是否觸發單挑 (35% 幾率)
    if (Math.random() < 0.35) {
      this.isDuelActive = true;
      this.log(`⚔️【陣前單挑】雙方主將【${this.attacker.general.name}】與【${this.defender.general.name}】在陣前相遇，二話不說，直接拍馬交鋒！`, 'system');
    } else {
      this.log(`🏹 雙方排兵布陣，大軍開始交鋒！`, 'system');
    }
  }

  // 執行一個回合的戰鬥
  nextRound() {
    if (this.isOver) return;

    if (this.isDuelActive) {
      this.simulateDuelRound();
    } else {
      this.simulateArmyRound();
    }

    this.round++;
    
    // 檢查戰鬥結束條件
    this.checkEndConditions();
    
    if (this.onStepCallback) {
      this.onStepCallback(this);
    }

    if (this.isOver && this.onCompleteCallback) {
      this.onCompleteCallback(this);
    }
  }

  // 自動結算整場戰鬥
  autoResolve() {
    while (!this.isOver) {
      this.nextRound();
    }
  }

  // 模擬主將單挑回合
  simulateDuelRound() {
    const attGen = this.attacker.general;
    const defGen = this.defender.general;
    
    this.log(`---------------- 單挑第 ${this.duelRound} 回合 ----------------`, 'neutral');
    
    // 決定誰先攻擊 (基於武力，加隨機擾動)
    const attSpeed = attGen.stats.str * (0.8 + Math.random() * 0.4);
    const defSpeed = defGen.stats.str * (0.8 + Math.random() * 0.4);
    
    const order = attSpeed >= defSpeed ? [
      { attacker: this.attacker, defender: this.defender, attGen, defGen },
      { attacker: this.defender, defender: this.attacker, attGen: defGen, defGen: attGen }
    ] : [
      { attacker: this.defender, defender: this.attacker, attGen: defGen, defGen: attGen },
      { attacker: this.attacker, defender: this.defender, attGen, defGen: defGen }
    ];

    for (const step of order) {
      if (step.defender.hp <= 0) break;
      
      const skillTrigger = Math.random() < 0.25; // 25% 觸發絕招
      let damage = 0;
      let actionText = '';
      
      const strDiff = step.attGen.stats.str - step.defGen.stats.str;
      
      if (skillTrigger) {
        // 觸發大招
        damage = Math.floor(step.attGen.stats.str * 0.35 + Math.random() * 15);
        const skillName = this.getGeneralSkill(step.attGen.id);
        actionText = `💥【${step.attGen.name}】暴喝一聲，使出『${skillName}』！直取對手面門！`;
      } else {
        // 普通攻擊
        const hitChance = 0.75 + (strDiff / 200); // 武力差影響命中率
        if (Math.random() > hitChance) {
          actionText = `🛡️【${step.defGen.name}】身形一閃，輕鬆擋開了【${step.attGen.name}】的一擊！`;
        } else {
          damage = Math.floor(step.attGen.stats.str * 0.2 + Math.random() * 10);
          actionText = `⚔️【${step.attGen.name}】大刀一揮，對【${step.defGen.name}】造成了打擊！`;
        }
      }

      if (damage > 0) {
        step.defender.hp = Math.max(0, step.defender.hp - damage);
        actionText += `（【${step.defGen.name}】HP -${damage}，剩餘 ${step.defender.hp}）`;
        this.log(actionText, 'strike');
      } else {
        this.log(actionText, 'neutral');
      }

      // 隨機單挑台詞
      if (Math.random() < 0.3 && step.defender.hp > 0) {
        const dialogue = this.getDuelDialogue(step.attGen, step.defGen, step.defender.hp);
        this.dialogueText = `【${step.attGen.name}】：「${dialogue}」`;
      }
    }

    this.duelRound++;

    // 檢查單挑是否分出勝負
    if (this.attacker.hp <= 0 || this.defender.hp <= 0) {
      this.isDuelActive = false;
      
      if (this.attacker.hp <= 0 && this.defender.hp <= 0) {
        // 同歸於盡
        this.log(`😱 驚天動地！【${attGen.name}】與【${defGen.name}】雙雙落馬受傷，單挑未分勝負！`, 'system');
        this.attacker.morale = Math.max(10, this.attacker.morale - 20);
        this.defender.morale = Math.max(10, this.defender.morale - 20);
      } else if (this.attacker.hp <= 0) {
        // 防守方贏了
        this.log(`🏆【單挑大勝】防守將領【${defGen.name}】將【${attGen.name}】挑落馬下！防守軍士氣大振，進攻軍大亂！`, 'system');
        this.attacker.morale = Math.max(10, this.attacker.morale - 25);
        this.attacker.troops = Math.floor(this.attacker.troops * 0.85); // 兵力受打擊潰散15%
        this.defender.morale = Math.min(100, this.defender.morale + 30);
      } else {
        // 進攻方贏了
        this.log(`🏆【單挑大勝】進攻將領【${attGen.name}】將【${defGen.name}】挑落馬下！進攻軍士氣如虹，防守軍膽寒！`, 'system');
        this.defender.morale = Math.max(10, this.defender.morale - 25);
        this.defender.troops = Math.floor(this.defender.troops * 0.85); // 兵力受打擊潰散15%
        this.attacker.morale = Math.min(100, this.attacker.morale + 30);
        this.attackerWonDuel = true;
      }
      this.log(`🏹 兩軍主力隨即掩殺過去，展開白刃混戰！`, 'system');
    }
  }

  // 模擬兩軍對壘回合
  simulateArmyRound() {
    this.log(`---------------- 大軍交戰第 ${this.round} 回合 ----------------`, 'neutral');

    const attGen = this.attacker.general;
    const defGen = this.defender.general;
    
    // 基礎計算戰力係數
    // 統率影響防禦與戰法，武力影響肉搏傷害，智力影響策略，士氣影響暴擊與防禦
    let attFactor = (attGen.stats.lead * 0.6 + attGen.stats.str * 0.4) * (this.attacker.morale / 100) * (0.85 + Math.random() * 0.3);
    let defFactor = (defGen.stats.lead * 0.6 + defGen.stats.str * 0.4) * (this.defender.morale / 100) * (0.85 + Math.random() * 0.3) * (1 + Math.min(this.city.defense, 800) / 2000); // 城防保護

    // 結義兄弟協同作戰加成
    if (attGen.isSwornBrother) {
      attFactor *= 1.2;
      if (Math.random() < 0.25) this.log(`🌸【生死同心】結義兄弟同心禦敵，士氣高昂，攻擊力提升 20%！`, 'highlight');
    }

    // --- 高級兵種獲取與屬性加成 ---
    const attUnitKey = attGen.advancedUnit || attGen.unitType || 'infantry';
    const defUnitKey = defGen.advancedUnit || defGen.unitType || 'infantry';
    const attUnit = ADVANCED_UNITS[attUnitKey] || ADVANCED_UNITS[attGen.unitType] || ADVANCED_UNITS['infantry'];
    const defUnit = ADVANCED_UNITS[defUnitKey] || ADVANCED_UNITS[defGen.unitType] || ADVANCED_UNITS['infantry'];

    const attType = attUnit.type || 'infantry';
    const defType = defUnit.type || 'infantry';
    
    // 應用高級兵種攻防係數
    attFactor *= (attUnit.strMult || 1.0);
    defFactor *= (defUnit.defMult || 1.0);

    // --- 兵種相剋計算 (騎剋步、步剋弓、弓剋騎) ---
    let attCounterBonus = 1.0;
    let defCounterBonus = 1.0;
    let counterMsg = '';

    if (attType === 'cavalry' && defType === 'infantry') {
      attCounterBonus = 1.3; defCounterBonus = 0.8;
      counterMsg = `🐎【騎兵衝鋒】騎兵猛烈衝擊步兵方陣，攻方獲得巨大優勢！`;
    } else if (attType === 'infantry' && defType === 'archer') {
      attCounterBonus = 1.3; defCounterBonus = 0.8;
      counterMsg = `🛡️【舉盾推進】步兵舉盾逼近弓兵陣地，攻方獲得巨大優勢！`;
    } else if (attType === 'archer' && defType === 'cavalry') {
      attCounterBonus = 1.3; defCounterBonus = 0.8;
      counterMsg = `🏹【萬箭齊發】弓兵對衝鋒的騎兵造成毀滅打擊，攻方獲得巨大優勢！`;
    } else if (defType === 'cavalry' && attType === 'infantry') {
      defCounterBonus = 1.3; attCounterBonus = 0.8;
      counterMsg = `🐎【騎兵反擊】守軍騎兵突襲步兵陣地，守方獲得巨大優勢！`;
    } else if (defType === 'infantry' && attType === 'archer') {
      defCounterBonus = 1.3; attCounterBonus = 0.8;
      counterMsg = `🛡️【堅甲利刃】守軍步兵逼近攻方弓兵，守方獲得巨大優勢！`;
    } else if (defType === 'archer' && attType === 'cavalry') {
      defCounterBonus = 1.3; attCounterBonus = 0.8;
      counterMsg = `🏹【萬箭齊發】守方弓兵對衝鋒的騎兵造成毀滅打擊，守方獲得巨大優勢！`;
    }

    if (counterMsg && Math.random() < 0.3) {
      this.log(counterMsg, 'battle');
    }
    
    attFactor *= attCounterBonus;
    defFactor *= defCounterBonus;

    // --- 攻城戰地形與器械加成 ---
    if (this.isSiege) {
      if (defType === 'archer') {
        defFactor *= 1.3; // 弓兵守城加成
        if (Math.random() < 0.2) this.log(`🏹【據險死守】守方弓兵居高臨下射擊，防禦力大幅提升！`, 'battle');
      }
      if (attType === 'cavalry' && attUnitKey !== 'tiger_cavalry') {
        attFactor *= 0.8; // 常規騎兵攻城削弱
        if (Math.random() < 0.2) this.log(`🐎【仰攻不利】攻方騎兵難以發揮衝鋒優勢，戰力大幅下降！`, 'battle');
      }
      if (attUnitKey === 'tiger_cavalry') {
        // 虎豹騎無視城防庇護
        if (Math.random() < 0.3) this.log(`🐅【虎豹驍騎】天下精銳直搗城門，完全無視守軍城防阻礙！`, 'highlight');
      }
      if (attUnitKey === 'catapult') {
        attFactor *= 1.35; // 投石車攻城傷害大幅提升
        if (Math.random() < 0.4) this.log(`☄️【巨石轟城】霹靂投石車齊發巨石，對守軍造成震天動地的毀滅打擊！`, 'strike');
      }
    }

    // 特殊兵種被動技能
    if (attUnitKey === 'zhuge_crossbow' && Math.random() < 0.35) {
      attFactor *= 1.3;
      this.log(`🏹【連弩齊射】諸葛連弩發動連環密集射擊！敵軍傷亡慘重！`, 'highlight');
    }
    if (defUnitKey === 'rattan_infantry') {
      // 藤甲兵物理減傷 25%
      defFactor *= 1.25;
    }

    // 馬騰特性：騎兵加成 (西涼鐵騎)
    if (this.attacker.faction.id === 'ma_teng' && attType === 'cavalry') attFactor *= 1.15;
    if (this.defender.faction.id === 'ma_teng' && defType === 'cavalry') defFactor *= 1.15;

    // 基礎傷害計算
    let attDamage = Math.floor(this.attacker.troops * 0.08 * (attFactor / 80));
    let defDamage = Math.floor(this.defender.troops * 0.08 * (defFactor / 80));

    // 隨機策略事件
    if (Math.random() < 0.2) {
      const isAttackerStrat = Math.random() < 0.5;
      if (isAttackerStrat && attGen.stats.int > 70) {
        // 攻擊方放計謀
        const stratDamage = Math.floor(this.attacker.troops * 0.03 * (attGen.stats.int / 60));
        defDamage += stratDamage;
        this.log(`🔥【${attGen.name}】識破敵陣，使出【火計】！防守軍陣腳大亂，額外損失兵力 ${stratDamage}！`, 'battle');
        this.defender.morale = Math.max(10, this.defender.morale - 10);
      } else if (!isAttackerStrat && defGen.stats.int > 70) {
        // 防守方放計謀
        const stratDamage = Math.floor(this.defender.troops * 0.03 * (defGen.stats.int / 60));
        attDamage += stratDamage;
        this.log(`🌀【${defGen.name}】巧借地利，佈下【伏兵】！進攻部隊猝不及防，額外損失兵力 ${stratDamage}！`, 'battle');
        this.attacker.morale = Math.max(10, this.attacker.morale - 10);
      }
    }

    // 兵力扣減
    this.defender.troops = Math.max(0, this.defender.troops - attDamage);
    this.attacker.troops = Math.max(0, this.attacker.troops - defDamage);
    
    this.lastRoundStats = {
      attDamage,
      defDamage,
      isCritical: attDamage > 2000 || defDamage > 2000
    };

    // 士氣衰減 (陷陣營士氣衰減減半)
    const attMoraleLossMult = (attUnitKey === 'trapping_camp') ? 0.5 : 1.0;
    const defMoraleLossMult = (defUnitKey === 'trapping_camp') ? 0.5 : 1.0;
    this.attacker.morale = Math.max(10, this.attacker.morale - Math.floor((defDamage / (this.attacker.maxTroops + 1) * 50 + 2) * attMoraleLossMult));
    this.defender.morale = Math.max(10, this.defender.morale - Math.floor((attDamage / (this.defender.maxTroops + 1) * 50 + 2) * defMoraleLossMult));

    this.log(`⚔️【${attGen.name}】隊（${attUnit.name}）發動猛攻，消滅敵方 ${attDamage} 兵馬。`, 'battle');
    this.log(`🛡️【${defGen.name}】隊（${defUnit.name}）堅守反擊，消滅敵方 ${defDamage} 兵馬。`, 'battle');

    // 扣除城防 (投石車對城牆造成巨量額外傷害)
    if (this.city.defense > 0 && attDamage > 100) {
      let defLoss = Math.floor(Math.random() * 30 + 20);
      if (attUnitKey === 'catapult') {
        defLoss += Math.floor(Math.random() * 80 + 60); // 額外巨量城牆破壞
      }
      this.city.defense = Math.max(0, this.city.defense - defLoss);
      this.log(`🏰【城防受損】${this.city.name} 的城防降低了 ${defLoss} 點（剩餘 ${this.city.defense}）。`, 'neutral');
    }
  }

  // 檢查勝負條件
  checkEndConditions() {
    // 兵力耗盡
    if (this.attacker.troops <= 0 && this.defender.troops <= 0) {
      this.isOver = true;
      this.winner = 'defender'; // 同時歸零算防守成功
      this.log(`🏁 兩軍精疲力竭，兵馬皆盡！防禦方艱難守住城池。`, 'system');
    } else if (this.attacker.troops <= 0) {
      this.isOver = true;
      this.winner = 'defender';
      this.log(`🏁 進攻部隊全軍覆沒！防守方領主【${this.defender.general.name}】獲得勝利！`, 'system');
    } else if (this.defender.troops <= 0) {
      this.isOver = true;
      this.winner = 'attacker';
      this.log(`🏆 城池陷落！進攻方將領【${this.attacker.general.name}】攻克【${this.city.name}】！`, 'system');
    }
    
    // 士氣潰散
    if (!this.isOver) {
      if (this.attacker.morale <= 10 && this.defender.morale <= 10) {
        this.isOver = true;
        this.winner = 'defender';
        this.log(`🏁 雙方士氣已經崩潰，無力再戰，攻方退兵！`, 'system');
      } else if (this.attacker.morale <= 10) {
        this.isOver = true;
        this.winner = 'defender';
        this.log(`🏁 攻方部隊士氣徹底崩潰，將士四散奔逃，【${this.attacker.general.name}】被迫下令收兵撤退！`, 'system');
      } else if (this.defender.morale <= 10) {
        this.isOver = true;
        this.winner = 'attacker';
        this.log(`🏆 守方士氣崩潰，士兵開城投降，【${this.attacker.general.name}】大獲全勝，奪取【${this.city.name}】！`, 'system');
      }
    }

    // 回合上限 (設定為20回合)
    if (!this.isOver && this.round >= 20) {
      this.isOver = true;
      this.winner = 'defender';
      this.log(`⏰ 戰事相持不下已達（20回合），攻方糧草不濟，無功而返，守方勝利！`, 'system');
    }
  }

  log(message, type = 'neutral') {
    this.logs.push({ message, type });
  }

  // 獲取將領專屬大招名
  getGeneralSkill(id) {
    const skills = {
      lu_bu: '方天飛戟',
      guan_yu: '萬人敵・青龍斬',
      zhang_fei: '長坂狂吼',
      zhao_yun: '一身是膽・龍膽',
      cao_cao: '霸道橫掃',
      sun_quan: '制衡突擊',
      zhou_yu: '赤壁烈火',
      lu_meng: '渡江奇襲',
      ma_chao: '鐵騎奔襲',
      huang_zhong: '百步穿楊',
      dian_wei: '古之惡來',
      xu_chu: '裸衣死戰'
    };
    return skills[id] || '奮力重擊';
  }

  // 獲取單挑對話
  getDuelDialogue(att, def, defHp) {
    const dialogues = [
      `無名之輩，可敢報上名來！`,
      `今日便是你的祭日，受死吧！`,
      `哼，花拳繡腿，不堪一擊！`,
      `三國天下，唯我稱雄！`,
      `休得猖狂，再接我一招！`,
      `吃我一記重擊！`
    ];
    
    // 特殊名將台詞
    if (att.id === 'lu_bu') return `誰敢與我呂奉先一戰！都是雜碎！`;
    if (att.id === 'guan_yu') return `插標賣首之徒，看我一刀斬你！`;
    if (att.id === 'zhang_fei') return `燕人張翼德在此！誰敢前來受死！`;
    if (att.id === 'zhao_yun') return `常山趙子龍在此，長槍所向，無所畏懼！`;
    
    if (defHp < 30) return `咳…可惡，難道我今日要命喪於此？`;
    
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }
}
