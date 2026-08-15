const fs = require('fs');
let code = fs.readFileSync('generals-data.js', 'utf8');

const traits = {
  zhuge_liang: 'divine_calc',
  sima_yi: 'divine_calc',
  guo_jia: 'divine_calc',
  guan_yu: 'god_of_war',
  zhao_yun: 'god_of_war',
  lu_bu: 'flying_gen',
  zhang_fei: 'flying_gen',
  cao_cao: 'falsehood',
  zhou_yu: 'falsehood',
  xun_yu: 'wealthy',
  lu_meng: 'wealthy',
  lu_su: 'wealthy',
  diao_chan: 'beauty'
};

for (const [id, trait] of Object.entries(traits)) {
  const regex = new RegExp('(id: \'' + id + '\'.*?)(?=})', 'g');
  code = code.replace(regex, ', trait: \'' + trait + '\' ');
}

fs.writeFileSync('generals-data.js', code);
console.log('Done');
