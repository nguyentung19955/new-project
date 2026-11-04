const CLIPS={
 idle:{dur:1.6,loop:true,keys:[
  {t:0,pose:{}},
  {t:0.8,ease:'inOut',pose:{torso:{y:-5},thigh_r:{y:5},thigh_l:{y:5},head:{a:-2,y:1},arm_r_up:{a:2},fore_r:{a:-1},arm_l_up:{a:4},fore_l:{a:3}}},
  {t:1.6,ease:'inOut',pose:{}}]},
 attack:{dur:0.42,loop:false,keys:[
  {t:0,pose:{}},
  {t:0.07,ease:'inOut',pose:{arm_r_up:{a:4},fore_r:{a:4},torso:{a:1},head:{a:1}}},
  {t:0.13,ease:'out',pose:{arm_r_up:{a:-16},fore_r:{a:-12},torso:{a:-4,x:-6},thigh_r:{x:6,a:4},thigh_l:{x:6,a:4},head:{a:-6,x:-3},arm_l_up:{a:-6}}},
  {t:0.42,ease:'back',pose:{}}]}
};
if(typeof module!=='undefined') module.exports=CLIPS;
