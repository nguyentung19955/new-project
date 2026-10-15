globalThis.window=globalThis; globalThis.G={}; 
const fs=require('fs'),vm=require('vm');
for (const f of ['engine.js','data.js','art.js','monster_art.js']) { try{ vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}); }catch(e){ console.error(f,e.message.slice(0,100)); } }
const MA=G.monsterArt||G.MA; const out={};
if(!MA){console.error(Object.keys(G).join(','));process.exit();}
const ids=process.argv.slice(2);
for(const id of ids){ out[id]={}; for(const a of ['idle','move','tele','atk','hit','die']) out[id][a]=MA.dur(id,a);} console.log(JSON.stringify(out));
