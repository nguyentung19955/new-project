// TURRET MERGE — public Firebase web config (project turret-merge). Web API keys are public identifiers; access is controlled by Auth + database rules.
// (Cấu hình web CÔNG KHAI của dự án Firebase "turret-merge" — không phải mật khẩu; dữ liệu được bảo vệ bằng luật Realtime Database,
//  xem docs/demo-hop-tuong/ONLINE-FIREBASE.md. Để apiKey: '' = tắt hẳn online, game vẫn chơi offline như cũ.)
window.FIREBASE_CONFIG = {

  apiKey: "AIzaSyBcITevVXIE0KzPkPB1YgjjS0IaHHdmgrY",

  authDomain: "turret-merge.firebaseapp.com",

  // Realtime Database (Singapore) — mọi dữ liệu game dưới turretmerge/
  databaseURL: "https://turret-merge-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "turret-merge",

  storageBucket: "turret-merge.firebasestorage.app",

  messagingSenderId: "138106187187",

  appId: "1:138106187187:web:0c9f2b597db2edf512efc6"

};
