const CLIPS={
 idle:{dur:1.6,loop:true,keys:[
  {t:0,pose:{}},
  {t:0.8,ease:'inOut',pose:{skirt:{y:-3},thigh_r:{y:3},thigh_l:{y:3},torso:{a:-1},head:{a:-2},arm_r_up:{a:2},fore_r:{a:-2},arm_l_up:{a:-3},fore_l:{a:4}}},
  {t:1.6,ease:'inOut',pose:{}}]},
 attack:{dur:0.45,loop:false,keys:[
  {t:0,pose:{}},
  {t:0.08,ease:'inOut',pose:{arm_r_up:{a:3},fore_r:{a:3},torso:{a:1}}},
  {t:0.13,ease:'out',pose:{arm_r_up:{a:-12},fore_r:{a:-10,x:-8},torso:{a:-4},head:{a:-5},skirt:{x:-3},thigh_r:{x:3},thigh_l:{x:3},arm_l_up:{a:-4}}},
  {t:0.45,ease:'back',pose:{}}]}
};
