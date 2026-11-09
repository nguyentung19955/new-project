// TURRET MERGE — ANIMATION HYBRID: bảng NHÓM CHUYỂN ĐỘNG (archetype) cho 93 ụ (REVIEW-VFX-93-v2-ANIM §E)
//  Bảng đọc dễ: docs/demo-hop-tuong/tuvan/anim/ARCHETYPE.md (sinh từ file này: node tools/thap-anim-bang.js)
//  Chỉ TRÌNH BÀY: không đổi sát thương / nhịp / mục tiêu / vùng chạm.
'use strict';
// tham số mỗi nhóm (đơn vị: kick = % đường kính đầu súng · ms = mili-giây "thời gian nhìn")
//  kick: thụt nòng (2–8% theo bậc) · kMs: pha giật (ease-out) · rMs: hồi lò xo (vượt quá nhẹ) · z: hệ số tắt dần lò xo
//  ant: tụ lực trước phát (60–180 ms, chỉ hình) · tw: xoắn nòng (rad, ổ đạn xoay) · spin: quay nòng (gatling)
//  per: chu kỳ thở (s) · glow: sáng lõi lúc rảnh (1–3%) · bob: nhún đầu (px) · ho: ụ hỗ trợ (nạp → xung → toả, không giật)
//  ghost: dư ảnh (chrono) · vong: 2 lớp quay ngược chiều (portal) · bien: mở/khoá theo lớp (evolver) · bay: lơ lửng (drone)
window.ANIM_NHOM = {
  cannon:   { ten: 'Cannon',        kick: 0.055, kMs: 55, rMs: 220, z: 0.6,  ant: 110, per: 3.4, glow: 0.035, bob: 0.3 },
  nang:     { ten: 'Heavy gun',     kick: 0.075, kMs: 70, rMs: 250, z: 0.62, ant: 170, per: 4.2, glow: 0.03,  bob: 0.25 },
  revolver: { ten: 'Revolver',      kick: 0.045, kMs: 45, rMs: 170, z: 0.58, ant: 80,  tw: 0.07, per: 3.0, glow: 0.035, bob: 0.3 },
  gatling:  { ten: 'Gatling',       kick: 0.022, kMs: 30, rMs: 110, z: 0.7,  ant: 60,  spin: 1, per: 2.8, glow: 0.03, bob: 0.25 },
  beam:     { ten: 'Laser / beam',  kick: 0.012, kMs: 60, rMs: 200, z: 0.75, ant: 180, per: 3.8, glow: 0.05,  bob: 0.2, tia: 1 },
  chain:    { ten: 'Tesla / chain', kick: 0.03,  kMs: 40, rMs: 150, z: 0.6,  ant: 150, per: 2.6, glow: 0.05,  bob: 0.25, xich: 1 },
  ice:      { ten: 'Ice / cryo',    kick: 0.035, kMs: 50, rMs: 230, z: 0.65, ant: 140, per: 4.6, glow: 0.04,  bob: 0.25 },
  poison:   { ten: 'Poison / pool', kick: 0.03,  kMs: 50, rMs: 200, z: 0.6,  ant: 100, per: 3.6, glow: 0.04,  bob: 0.3 },
  support:  { ten: 'Support / mana',kick: 0,     kMs: 70, rMs: 260, z: 0.55, ant: 0,   per: 4.0, glow: 0.05,  bob: 0.35, ho: 1 },
  drone:    { ten: 'Drone / orbital / hive', kick: 0.02, kMs: 50, rMs: 220, z: 0.6, ant: 90, per: 2.4, glow: 0.035, bob: 0.9, bay: 1 },
  portal:   { ten: 'Portal / black hole', kick: 0.015, kMs: 60, rMs: 260, z: 0.7, ant: 160, per: 5.0, glow: 0.05, bob: 0.2, vong: 1 },
  chrono:   { ten: 'Chrono / rewind', kick: 0.03, kMs: 50, rMs: 200, z: 0.65, ant: 120, per: 4.4, glow: 0.04, bob: 0.25, ghost: 1 },
  evolver:  { ten: 'Evolver / transformer', kick: 0.03, kMs: 60, rMs: 460, z: 0.5, ant: 100, per: 3.8, glow: 0.04, bob: 0.3, bien: 1 },
};
// 93 ụ → nhóm (id nội bộ: tên hiển thị)
window.ANIM_U = {
  canon: 'cannon', xucxac: 'cannon', maychem: 'cannon', nam: 'cannon', no5: 'cannon', aten: 'cannon', nayda: 'cannon',
  cobac: 'cannon', docton: 'cannon', hydra: 'cannon', cuuvi: 'cannon', soi: 'cannon', cuongno: 'cannon', bienmau: 'cannon', nangluong: 'cannon',
  railgun: 'nang', mortar: 'nang', ngoisao: 'nang', tia: 'nang', overlord: 'nang', ronglua: 'nang', leviathan: 'nang', wallgen: 'nang',
  sungluc: 'revolver', nemesis: 'revolver', combo: 'revolver', xaotron: 'revolver',
  lien: 'gatling', phun: 'gatling', bao: 'gatling', hutmana: 'gatling',
  laser: 'beam', anhsang: 'beam', nhatthuc: 'beam', thaukinh: 'beam',
  set: 'chain', thacmana: 'chain', lienket: 'chain', lualien: 'chain', hopca: 'chain', santhuong: 'chain',
  bang: 'ice', kiembang: 'ice', baotuyet: 'ice', lophanung: 'ice', lanhgia: 'ice',
  doc: 'poison', vungdoc: 'poison', mauhut: 'poison', nguyenrua: 'poison', min: 'poison',
  mana: 'support', nhanmana: 'support', phagiap: 'support', bua: 'support', chimang: 'support', radar: 'support', tron: 'support',
  khuech: 'support', loa: 'support', taylo: 'support', khien: 'support', nangsao: 'support', tuthan: 'support', dongbo: 'support',
  hasao: 'support', cauvong: 'support', luoicheo: 'support', guongcong: 'support', thanhdia: 'support', epxung: 'support',
  nhieusong: 'support', kepha: 'support', haoquang: 'support',
  drone: 'drone', orbital: 'drone', chuato: 'drone', marionette: 'drone',
  blackhole: 'portal', dichchuyen: 'portal', pandora: 'portal',
  khoathoigian: 'chrono', ngaithoigian: 'chrono', bomhen: 'chrono',
  tienhoa: 'evolver', hopbi: 'evolver', vughep: 'evolver', sinhdoi: 'evolver', saochep: 'evolver', nhanban: 'evolver', loren: 'evolver',
  khoisinh: 'evolver', xuonganh: 'evolver', luutru: 'evolver', mimic: 'evolver', tudo: 'evolver',
};
