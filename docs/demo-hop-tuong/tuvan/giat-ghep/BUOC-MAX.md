# Bước / khung chậm nhất — trước và sau (tools/thap-do-giat-ghep.js, iPhone 13, CPU ×4)

Số đo: 1 trận/chế độ, bộ nặng ghép đặc biệt, tốc 3×, wave 8 → ~14 (qua Mad Crown wave 10), bot ghép đặc biệt 90 %. "Bước" = 1 bước luật 1/60 s; "khung" = 1 lần vẽ.

| Chế độ | Bản | bước p95 | bước max | khung p50 | khung p95 | khung max | khung > 60 ms | > 120 ms |
|---|---|---|---|---|---|---|---|---|
| SOLO | trước | 2.3 | 30.1 | 3.5 | 9.1 | 69.3 | 1 | 0 |
| SOLO | sau | 2.5 | 21.6 | 3.4 | 9.4 | 70.6 | 2 | 0 |
| COOP | trước | 3.3 | 60.1 | 5.5 | 12.6 | 81.1 | 1 | 0 |
| COOP | sau | 3.3 | 24.4 | 5.3 | 12.7 | 69.0 | 2 | 0 |
| PVP | trước | 3.3 | 25.7 | 6 | 12.9 | 65.6 | 2 | 0 |
| PVP | sau | 3.3 | 40.8 | 6.1 | 12.7 | 78.4 | 3 | 0 |

## SOLO — trước: 10 bước/khung chậm nhất

- ve #1016 **69.3 ms** (wave 8) — sự kiện: 975:trieu b0 ; 1009:ghep ngoisao4→ngoisao4  
  việc nặng: —  
  CPU: (garbage collector) :0 ×82 · P.drawImage :13 ×3 · o.<computed> :88 ×1

## SOLO — sau: 10 bước/khung chậm nhất

- ve #877 **70.6 ms** (wave 8) — sự kiện: 838:ghep ngoisao(copy)2→ngoisao2 ; 862:trieu b0  
  việc nặng: taoCanvas 0 js/render.js:251 · taoCanvas 0 js/render.js:971 · taoCanvas 0 js/render.js:259  
  CPU: (garbage collector) :0 ×36 · o.<computed> :88 ×7 · save :0 ×5
- ve #248 **68.5 ms** (wave 8) — sự kiện: 197:trieu b0 ; 234:trieu b0  
  việc nặng: —  
  CPU: —

## COOP — trước: 10 bước/khung chậm nhất

- ve #878 **81.1 ms** (wave 8) — sự kiện: 875:ghep vughep1→hopbi1 ; 876:sao hopbi b1o8 1→2  
  việc nặng: taoCanvas 0 js/fxu.js:193 · taoCanvas 0 js/fxu.js:200 · taoCanvas 0 js/sigfx.js:51  
  CPU: (garbage collector) :0 ×70 · save :0 ×2 · P.drawImage :13 ×1
- buoc #2290 **60.1 ms** (wave 10) — sự kiện: 2285:sinhTrum joker_king ; 2285:sinhTrum mad_crown  
  việc nặng: —  
  CPU: gd js/phattrien.js:164 ×10 · apDung js/hotro.js:59 ×5 · capNhatBan js/game.js:553 ×2

## COOP — sau: 10 bước/khung chậm nhất

- ve #764 **69 ms** (wave 8) — sự kiện: 729:ghep dichchuyen1→tron1 ; 731:ghep hopbi2→hopbi2  
  việc nặng: taoCanvas 0 js/render.js:199 · veTuImage 4 sig_m07_sigil.png 1080x139  
  CPU: (garbage collector) :0 ×47 · save :0 ×8 · drawImage :0 ×6
- ve #1256 **68.6 ms** (wave 9) — sự kiện: 1255:ghep vughep2→tienhoa2 ; 1256:sao tienhoa b1o11 2→3  
  việc nặng: taoCanvas 0 js/fxu.js:202 · taoCanvas 0 js/render.js:251 · taoCanvas 0 js/render.js:971 · taoCanvas 0 js/render.js:149 · taoCanvas 0 js/hud2.js:173  
  CPU: (garbage collector) :0 ×53 · drawImage :0 ×13 · document.createElement :11 ×5

## PVP — trước: 10 bước/khung chậm nhất

- ve #2044 **65.6 ms** (wave 10) — sự kiện: 2043:sinhTrum joker_king ; 2043:sinhTrum joker_king  
  việc nặng: taoCanvas 0 js/fxu.js:54  
  CPU: VX.truoc js/ghepfx.js:412 ×7 · traLai js/render.js:617 ×4 · o.<computed> :88 ×1
- ve #805 **60.1 ms** (wave 8) — sự kiện: 803:ghep vughep1→pandora1 ; 804:sao pandora b1o10 1→2  
  việc nặng: taoCanvas 0 js/render.js:184 · veTuImage 1 fxb_toc.png 1248x312 · drawImage 19.8 fxb_toc · taoCanvas 0 js/render.js:184 · veTuImage 3 fxb_khien.png 1248x312  
  CPU: drawImage :0 ×36 · nhan js/tvb.js:74 ×3 · vuaThe js/hud2.js:76 ×2

## PVP — sau: 10 bước/khung chậm nhất

- ve #670 **78.4 ms** (wave 8) — sự kiện: 656:ghep pandora1→pandora1 ; 662:ghep ronglua4→ronglua(copy)4  
  việc nặng: —  
  CPU: (garbage collector) :0 ×90 · nhan js/tvb.js:74 ×3 · lop js/quaianim.js:229 ×3
- ve #4978 **62.3 ms** (wave 13) — sự kiện: 4640:trieu b0 ; 4784:ghep hopbi(copy)6→hopbi6  
  việc nặng: taoCanvas 0 js/render.js:199 · veTuImage 12.1 quai_khong_lo_side_8.png 2552x319 · drawImage 31.1 quai_khong_lo_side_8 · taoCanvas 0 js/nongskill.js:55 · drawImage 5.3 quai_khong_lo_side_8  
  CPU: drawImage :0 ×70 · (garbage collector) :0 ×7 · document.createElement :11 ×1
- ve #1014 **60.4 ms** (wave 8) — sự kiện: 965:trieu b1 ; 983:trieu b0  
  việc nặng: taoCanvas 0 js/hud2.js:173  
  CPU: (garbage collector) :0 ×64 · clearRect :0 ×1
- buoc #2044 **40.8 ms** (wave 10) — sự kiện: 2043:sinhTrum joker_king ; 2043:sinhTrum joker_king  
  việc nặng: —  
  CPU: canhBaoTrum js/ui.js:278 ×10 · Q.kt :174 ×9 · canh js/hudtop.js:121 ×4

## Ra chiêu lần đầu (ms, khung nặng nhất trong 1,5 s sau khi ra)

| Việc | trước | sau |
|---|---|---|
| solo cd haoquang | 125.7 | 79.3 |
| pvp cd haoquang | 125.3 | 81.1 |
| solo cd chuato | 108.2 | 76.7 |
| solo db hopbi+hopbi | 101.5 | 64.9 |
| coop cd haoquang | 91.2 | 99.3 |
| coop db vughep+canon | 98.6 | 26.2 |
| coop cd ngaithoigian | 94.7 | 70.6 |
| pvp cd ngaithoigian | 77.1 | 31.3 |
| pvp cd leviathan | 76.6 | 24.8 |
| coop cd khoisinh | 44.5 | 72.2 |
| pvp cd khoisinh | 31.4 | 71.3 |
| coop mv eve | 71.2 | 16.7 |
| pvp cd chuato | 70.7 | 31.8 |
| pvp mv dahlia | 68.7 | 12.6 |
| solo cd ngaithoigian | 67.3 | 19.2 |
| coop trum mad_crown | 56.9 | 64.3 |
| solo trum mad_crown | 59.7 | 64.1 |
| pvp db pandora+pandora | 61.4 | 33.9 |
| coop db leviathan+leviathan | 27.6 | 60.9 |
| solo mv eve | 52.8 | 60.4 |
| pvp trum mad_crown | 59.0 | 42.8 |
| coop db mauhut+canon | 22.4 | 57.9 |
| pvp db vughep+canon | 26.8 | 57.6 |
| coop cd lophanung | 44.7 | 54.6 |
| pvp db leviathan+leviathan | 36.2 | 53.5 |
| solo db mauhut+canon | 52.5 | 48.1 |
| solo cd lophanung | 41.7 | 43.7 |
| pvp cd lophanung | 42.4 | 24.1 |
| coop db saochep+canon | 41.9 | 23.4 |
| coop db pandora+pandora | 35.1 | 31.8 |
