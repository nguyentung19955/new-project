# VFX P2 audit: ultimate / signature effects (20 turrets)

Read-only audit of branch `claude/demo-hop-tuong`, game in `thap/`, all paths relative to `thap/js/`. Leviathan and Wyrm Engine (ronglua) are out of scope.

**"Jittered still"** means one PNG whose motion comes only from code: shake, scale, rotate or pulse (what the user calls "a shaking photo, not animation").

## Reference: three drawing paths

- **Strip, played in order.** Proper frame animation.
  - `SIG.k()` draws `sig_<code>_<group>.png` with frame counts from `SIG_META` (sig-meta.js), sigfx.js:31.
  - `VM1.fx()` draws `fx_<id>_sk.png`, 16 frames, vangmoi1.js:21.
  - `fx7Ve()` draws `fx_<id>_sk.png`, 16 frames, skills7.js:29.
  - `FX.no()` with no turret context draws 6-frame strips such as `fx_dien`, `fx_no_phao` and `fx_bang_vo`.
- **Still image.** Every `FXU_META` entry (`fx_<id>_{dan,no,trung,hieu,dan2,dan3,trung3,dacbiet,thuc,tia}`) is a single still ([w,h,ax,ay]). The same goes for `hu_hoden`, `hu_khoa`, `tier_ring_vang`, `evo_bom`, `R.cham1` (tinted dot) and `fx_vong_mong` (rings drawn by `FX.vong1` / `PX.vong`).
- **Hidden still on hit (`FX.no`).** fx.js:45 calls `FX.no(...)`. When `G.dangBan` is set to a turret that has `fx_<id>_trung`, it switches to `no1` and draws a still that pops from 0.6 to 1.1 scale (render.js:1155 `veMot`). Many "big hits" therefore end up as still pops, depending on whether `G.dangBan` happens to be set at that moment.

## Table

| Unit | id | Trigger | Draw code (file:line) | Images | Jittered still? | Phases (A→I→Af) | Priority |
|---|---|---|---|---|---|---|---|
| Overlord | overlord | Charge full → `HU.sam` (skills.js:339) | `HU.sam.ve` skills.js:546; `HU.gCot` growfx.js:314; `HU.gXem` growfx.js:331; hit `FX.no` skills.js:538 | `fx_overlord_dan3`, `fx_overlord_dacbiet`×4, `fx_overlord_trung3`, `fx_overlord_trung` (2× pop), `tia_set`/tier tia (all stills) | **YES** | No anticipation (charge glow only). Impact and aftermath are stills that fade. | **1** |
| Cryo Reactor | lophanung | Tap/auto FREEZE `chuDong` skills2.js:972 | `HU.gBaoLuoi` growfx.js:416 (`veSanBang` growfx.js:386); `FX.no('bang_vo')` per enemy skills2.js:976 | `fx_lophanung_hieu` (rotated), `fx_lophanung_dan3` (rotated u·π), `fx_lophanung_trung` pop or `fx_bang_vo` strip, `vong1` ring | **YES** | Impact only | **2** |
| Chrono Lock | khoathoigian | Every `ky` seconds / on merge `khoa()` skills3.js:127 | `HU.khoa.ve` skills3.js:159; burst `HU.khoa.no` skills3.js:150 | `hu_khoa` still (scale-in), `PX.cung` arc, code needle, `fx_khoathoigian_trung` pop | **YES** | Lock → hold → burst, but all stills | **3** |
| Evolver | tienhoa | Countdown `capNhat` skills2.js:901 → `chuyenU(...,true)` | Bomb: `veEvoBom` growfx.js:138-166; transform: `VX.doi` anim hieuung.js:205-230 | `evo_bom` still (pulse + rotate shake); old head shake + `fx_evolve` 5-frame strip; 7★ `fx_evo_xit` 16-frame strip | **YES** (countdown) / PARTIAL (transform) | Countdown → burst → reveal | **4** |
| Black Hole | blackhole | Charge full → `HU.hoden` skills.js:322 | `HU.hoden.ve` skills.js:521-532 (also render.js:656); `SIG.K.hoden` sigfx.js:201 | Strips `sig_m01_shards/lens/swirl/crush/release`; still `hu_hoden` disk rotating the whole 3 s; still `fx_blackhole_hieu` core; `fx_blackhole_trung` pop | **PARTIAL** | Yes (SIG), but 1.1–3.0 s is only a spinning still | **5** |
| Chrono Throne | ngaithoigian | Tap/auto REWIND `chuDong` skills3.js:446 | `SIG.K.rewind` sigfx.js:179; `HU.rewind.ve` skills3.js:494-508 (not suppressed) | Strips `sig_m05_throne/hands/hourglass/echo`; still `fx_khoathoigian_hieu` tinted red and spun at −18 rad/s | **PARTIAL** | Yes (SIG) | **6** |
| Holy Halo | haoquang | Tap/auto barrier `chuDong` skills2.js:1002 | Inline: `FX.vong1`, `FX.sang`, `tiaPhep` to each turret (skills2.js:1014-1015); per-turret `fxb_khien` bubble (buffvfx.js:16/34) | No bespoke art (`fx_haoquang_*` unused here). Code ring is capped at 70 px. | NO (no art at all) | None | **7** |
| Orbital | orbital | Orbital merge → `thucTinh` skills.js:258; salvos `capNhat` skills.js:241 | `HU.vetinh.ve` skills.js:448; awakened ring `veThem` skills.js:253-255 | `tia_laser`/`dan_tia` scrolled; `fx_dien`/`fx_no_phao` strips; `fx_orbital_thuc` still rotated + pulsed for 23–29 s | **PARTIAL** | Drop → hit (strip) | **8** |
| Genesis Core | khoisinh | Tap/auto GENESIS `chuDong` skills5.js:272 | `HU.cungSang` skills5.js:297; shared `VX.trieu` hieuung.js:59/118 | Tinted line segments + `cham1` dots; generic summon anim | NO (generic primitives, no art) | Travel → summon | **9** |
| Copycat | saochep | `ghepDB.lam` skills2.js:815 | `HU.tiaPhep` skills2.js:1040; `nhanU` "COPY" label | `tia_laser` + `cham1` dot shrinking | NO (no art) | Travel only | **10** |
| Hero Foundry | xuonganh | Foundry+Foundry `ghep` vangmoi1.js:194 | `HU.vm1Fx` vangmoi1.js:46; `HU.vm1Hero` vangmoi1.js:216-228 | `fx_xuonganh_sk` 16-frame strip (0.7 s), then `tier_ring_vang` still rotating + alpha pulse for 12 s | **PARTIAL** | Stamp → hold | 11 |
| Ember Relay | lualien | Merge with Relay `ghep` vangmoi1.js:78 | `HU.vm1Fx` vangmoi1.js:46; `HU.vm1Tia` vangmoi1.js:103; carried flames `veThem` vangmoi1.js:94-100 | `fx_lualien_sk` strip; **borrowed** `fx_cuuvi_dan` still slid / size-pulsed | **PARTIAL** | Burst → pass | 12 |
| Blood Circuit | mauhut | Drag `ghepDB.lam` skills7.js:67 | `fx7('mauhut')` skills7.js:79 → `HU.fx7` skills7.js:38-39; transform = generic `N.anim 'no'` + `vong1`/`tiaLua` | `fx_mauhut_sk` frames 0–15 (pulse only on a different-star merge); VAMP = pulsing `cham1` glow | NO (pulse) / generic transform | Pulse only | 13 |
| Prism Thief | bienmau | Same-colour merge `ghep` skills7.js:221 | `fx7('bienmau')` → `HU.fx7` skills7.js:38 | `fx_bienmau_sk` frames 12–15 only (4 frames over 0.64 s) | NO (thin) | Burst only | 14 |
| Hive Queen | chuato | Tap/auto SWARM `chuDong` skills5.js:51 | `SIG.K.ong` sigfx.js:380 (replaces `HU.ongLao.ve` skills5.js:116); hit `FX.no` skills5.js:109 | Strips `sig_m06_queen/pulse/drone/comb/crest`; `fx_chuato_trung` pop under comb | NO (minor still pop) | Yes | 15 |
| Fusion Archive | luutru | Archive+Archive `ghep` vangmoi1.js:148 | `HU.vm1Xung` vangmoi1.js:157 → `vm1Fx` | `fx_luutru_sk` 16-frame strip ×3 | NO | Three impacts, no anticipation | 16 |
| Hex Saboteur | nguyenrua | Hex+Hex `ghep` skills7.js:103 | `HU.hexBay.ve` skills7.js:142; hit `fx7` skills7.js:127-138 | `fx_nguyenrua_sk` frames 0–5 (flight), 6–15 (hit) | NO (the fallback is a spun still) | Flight → hit | 17 |
| Quantum Choir | hopca | Passive: same-star count rises (vangmoi1.js:120) | `vm1Fx('hopca')` → `HU.vm1Fx` vangmoi1.js:46 | `fx_hopca_sk` 16-frame strip | NO | Single burst | 18 |
| Pandora Vault | pandora | Pandora merge `ghep` skills3.js:317 → `HU.pandora` | `SIG.K.pandora` sigfx.js:333 (replaces `HU.pandora.ve` skills3.js:374) | Strips `sig_l16_vault/wheel/icons/o_*`; vault x-shake ±1.6 px on frames 0–3 | NO | Yes | 19 |
| Merge King | vughep | `ghepDB.lam` (wrapped sigfx.js:427) | `SIG.K.vua` sigfx.js:369 | Strips `sig_l04_crest/crown/hammer/star` | NO | Yes | 20 |

## Notes per unit

### Overlord: worst offender
- **Trigger:** `SKILLS.overlord.capNhat` skills.js:331. Charge takes `7−0.5(★−1)` s; it fires only when aimed within 0.2 rad.
- **What it pushes:** `{k:'sam', song:0.7, x:E.x, y:E.y, r:92, dmg:dmgU×9}`.
- **Hit timing** (`HU.sam.cap` skills.js:535):
  - At `o.t>0.08`: `noLan(o.x,o.y,o.r=92,dmg)`.
  - Aftershock: up to 4 nearest enemies with `o.r+co/4 < d < 240`, each taking `dmg×2/9`.
- **What is drawn** (growfx.js:307 pushes `gCot` (0.55 s) and `gXem` (1.3 s)):
  - Lightning: `R.set` re-seeds a zig-zag of tiled `tia_set` every 45 ms with an alpha flicker `1.15−0.15cos(40t)` (skills.js:548-552).
  - Pillar: `PX.ve('fx_overlord_dan3')`, a still that shrinks (growfx.js:319-320).
  - Four `fx_overlord_dacbiet` stills slide out (growfx.js:321).
  - Scorch: `fx_overlord_trung3`, a still scaled 0.85→1 (growfx.js:331).
  - `FX.no('dien'|'no_phao')` while `G.dangBan=T` gives two `fx_overlord_trung` still pops.
- No frame strip anywhere.

### Cryo Reactor FREEZE
- **Code:** `chuDong` skills2.js:972-980.
- **Hit area:** enemies within `quaiTrongTam(B,T, r(T)×1.6)`, where `r = 110+5★ (+20 at 3★)`. Freeze lasts `E.chan = 2.5 s` (4 s at 5★; bosses 0.8 s), with `chamT 3`. No damage.
- **What is drawn:**
  - `gBaoLuoi`, song 0.6, `r×1.6`: `fx_lophanung_hieu` rotated `u×0.2` plus `fx_lophanung_dan3` rotated `u·π`, both fading.
  - Particles.
- **Bug-ish:** the per-enemy shatter depends on how it fires.
  - Auto-fire runs inside the turret update with `G.dangBan=T`, so it shows the still pop `fx_lophanung_trung`.
  - A tap (ui.js:492) runs with `dangBan` null, so it shows the `fx_bang_vo` 6-frame strip.
- `HU.voBang` (skills2.js:1031) is never pushed (dead code).

### Chrono Lock
- **Code:** `HU.khoa`.
- **Timing:** song = `dai(★)` 1.2–2.5 s (half for bosses). It follows `E.x,E.y`.
- **Burst:** at expiry or death, `noLan(o.x,o.y,40, o.don×o.pct)`.
- **What is drawn:**
  - `hu_khoa` still: scale-in over 0.12 s, then static.
  - Code needle and arc.
  - `fx_khoathoigian_trung` still pop for the burst.
- No glass-shatter frames.

### Evolver
- **Countdown:** `can(T)=(14+5★)×(0.8 at 3★)×card%`.
- **Countdown visual** (growfx.js:158-166):
  - `evo_bom` still with `nay` scale pulse each tick.
  - In the last 3 s, rotation shake `rung=sin(38t)×0.12` (growfx.js:161).
  - Red `cham1` glow.
- **Transform** (hieuung.js:205-230, 0.78 s):
  - Old head shake `sin(tt×90)×0.09` (line 212) and scale.
  - `fx_evolve` 5-frame strip.
  - White silhouette of the new head.
- **7★ fizzle:** a proper 16-frame `fx_evo_xit` strip.

### Black Hole
- **What it pushes:** `{song:3, x:E.x, y:E.y, r:64+4★, dps, dmg×8}` (skills.js:322).
- **Gameplay** (`HU.hoden.cap` skills.js:505-519):
  - Pulls enemies within `o.r`.
  - Ticks `dps` every 0.25 s.
  - Crushes with `noLan(o.x,o.y,o.r,dmg)` at `t≥song−0.02`.
- **What is drawn:**
  - SIG strips cover 0–1.08 s and crush+0.8 s.
  - Underneath, for the whole 3 s: `hu_hoden` disk `rotate(−4.5t)` with radius `×(1.03+0.03 sin 9t)`, plus `fx_blackhole_hieu` core `r×(0.55+0.1 sin 9t)` rotating (skills.js:524-527).
  - From roughly 1.1 s to 3.0 s, only the spinning still is visible.

### Chrono Throne
- **Gameplay** (`chuDong` skills3.js:446-470):
  - Instant `trung(E, dmgU×6)` on all targets (co-op: all enemies).
  - Pushback `s1 = s×(1−r)` (bosses r/3) over 0.6 s (`HU.rewind.cap`).
- **What is drawn:**
  - SIG `rewind` strips over 1.25 s.
  - `HU.rewind.ve` is still drawn too. It spins `fx_khoathoigian_hieu` tinted red at `−o.t×18` and grows `r=30+30a` (skills3.js:504).
  - "REWIND!" canvas text.

### Holy Halo
- **Gameplay:** sets `B.halo = B.khien = tg` (3–4.5 s) for self (co-op: both boards).
- **What is drawn:**
  - `FX.vong1` (r1 requested 260, capped to 70 by fx.js:85).
  - Screen flash.
  - `tiaPhep` beams.
  - Generic `fxb_khien` per-turret bubble.
- The barrier is never drawn as a barrier. `fx_haoquang_hieu` exists but is not used here.

### Orbital
- **Duration:** awakened for `dai(B)` = 23–29 s.
- **Salvos:** one every 1.8 s (1.5 s at 3★), `soBom` = 3–7 bombs.
- **Each bomb:** `HU.vetinh` with song 0.5, stagger 0.08. Impact at `t>0.16`: `noLan(x,y,r=34,bomDmg)`.
- **Bomb visual:** scrolled beam plus generic strips (`G.dangBan` is null because the effect has no `T`).
- **Jittered part:** `fx_orbital_thuc` ring, `rotate(0.8t)` with alpha `0.75+0.2 sin 6t`, for the whole awakening (skills.js:255).

### Genesis Core / Copycat
- No signature art.
- **Genesis:** summons `k(T)` turrets at the average star. Visual is `cungSang` (0.55 s, stagger 0.08): tinted curve and dot. Plus `VX.trieu`.
- **Copycat:** visual is `tiaPhep` (0.55 s) plus a text label.

### Hero Foundry / Ember Relay / Fusion Archive / Quantum Choir
- All four use the 16-frame `fx_<id>_sk` strips correctly (`HU.vm1Fx`). None has anticipation.
- **Hero Foundry:**
  - Gameplay: `B.hero` 12 s, `+v` fire rate.
  - After the 0.7 s stamp (w = `B.cw×1.9`), the tile shows a still `tier_ring_vang` spinning at `0.6 rad/s` with alpha `0.75+0.25 sin 6t` (vangmoi1.js:222-226).
- **Ember Relay:**
  - Strip w = `B.cw×2.6`, 0.7 s.
  - The flame pass is a borrowed still `fx_cuuvi_dan` slid in 0.35 s. Carried flames are size-pulsed stills (vangmoi1.js:98).
- **Fusion Archive:**
  - `vm1Xung` 0.9 s at the densest enemy (50 px cluster).
  - Pulses at t = 0, 0.25 and 0.5: `noLan(o.x,o.y,45, dmgU×1.6)`.
  - Strip w = 110, 0.55 s.
- **Quantum Choir:** passive only.

### Blood Circuit / Prism Thief / Hex Saboteur
- All use `fx7`. Duration is `max(0.55, song×1.6)` and width is `w×1.3`.
- **Blood Circuit:** pulse radius 120 px; dmg `hsU×(2.2|3)`; strip 156 px / 0.72 s. It plays only on a different-star merge with ≥2 VAMP. Same-star VAMP and the transform have no bespoke art.
- **Prism Thief:** only 4 frames (12–15).
- **Hex Saboteur:** flight 1.5 s uses frames 0–5; the hit uses 6–15. If the strip is missing, the fallback is a spun still (skills7.js:148).

### Hive Queen / Pandora / Merge King
- All three are SIG frame strips with clear phases.
- **Hive Queen:** each drone `ongLao` (song 1.4, stagger 0.05) explodes `noLan(E,35, dmgU×3 (gold ×3))`.
- **Pandora:** `HU.pandora` song 1.5; effects fire at t = 0.8. SIG duration 1.55 s.
- **Merge King:** SIG 1.25 s.
- **Minor issues:**
  - Hive Queen hits also spawn a `fx_chuato_trung` still pop.
  - The Pandora vault shakes ±1.6 px while its frames play (acceptable).
  - If the SIG strips are not loaded, the fallbacks are stills: the rotating `pandora_dia` disc, and scale-wobbled drones via `veDrone` skills5.js:96.

## Other ultimates (outside the list) using a jittered still
- **Wall Generator golden wall** (`HU.tuong`, `o.vang`, skills.js:474-478): `fx_wallgen_vang` static still for 6 s, plus a `cham1` glow pulsing `0.25+0.15 sin 12t`. Explosion via `FX.no`.
- **Generic still pop:** `FX.no` → `no1`/`veMot` (fx.js:56, render.js:1155) turns every "big hit" `FX.no('dien'|'no_phao'|'laser_trung'|'bang_vo')` made under a turret context into a scaled still. This affects many reds and golds at once, and is the single highest-leverage fix.
- **Ready glows:** `R.cham1` pulsing glows appear in `veThem` for Holy Halo, Chrono Throne, Merge King gold, Blood Circuit and Prism Thief.
