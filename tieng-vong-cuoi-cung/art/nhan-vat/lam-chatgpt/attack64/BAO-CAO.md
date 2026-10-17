# Báo cáo ATTACK (combo 3 đòn) – Lam từ `combo-sheet-v1.png` → pixel **cao 64, ô 80×80** (và bản ô **96×80**), pivot chân [W/2,79], 6 khung/đòn · 14 FPS · non-loop giữ F5 · hitFrames [2,3]

Nguồn: `combo-sheet-v1.png` 1774×887, 18 mảnh liên thông tách sạch (không mảnh dư) → chia 3 hàng theo tâm y, 6 cột theo mép trái: hàng 1 chém ngang (đòn 1), hàng 2 chém chéo lên (đòn 2), hàng 3 chém chéo xuống (đòn 3). Nhân vật cao 216–278 px (nhỏ hơn sheet run/jump). Khung que tham chiếu: `que/combo-que2.png` + `.json`.

```
for r in 0 1 2; do python3 tools/chatgpt-anim-to-px.py --sheet art/nhan-vat/lam-chatgpt/combo-sheet-v1.png --so-khung 6 --hang 3 --hang-chon $r \
  --ra art/nhan-vat/lam-chatgpt/attack64/don$((r+1)) --ten attack$((r+1)) --fps 14 --chong-dat tat-ca --hit-frames 2,3 --xuat-rong 96; done
python3 tools/lam-anim-64-ghep.py attack-x4 ; python3 tools/lam-anim-64-ghep.py sheet ; python3 tools/lam-anim-64-ghep.py chuoi
```

Xem: **`attack-x4.png`** (3 đòn × 6 khung, ô 96, viền vàng = hit frames, vòng đỏ = mũi kiếm), **`attack-80-x4.png`** (ô 80, phần bị cắt tô đỏ), `chuoi-x4.gif` + `chuoi-kiem-tra.json` (chuỗi idle → jump → fall → run → attack1 → 2 → 3 → idle), `anim2d-kiem-tra.json`. Mỗi đòn trong `don1/`, `don2/`, `don3/`: `attackN-0..5.png` (80×80), `attackN-x4/x8.png`, `attackN.gif` (×4, 14 FPS – **GIF lặp để xem, game non-loop giữ F5**), `so-sanh-goc-x4.png`, `chong-silhouette.png`, `trong-game-x1/x4.png` (đứng trên lối đi, y=241), `lat-check.png`, `kiem-tra.json`, và `rong96/` (khung 96×80 không cắt + x4 + gif).

Sheet game: `game/anim/lam-chatgpt-80.png` hàng 4 = **đòn 1, ô 80 (bị cắt mũi kiếm 3 khung – xem dưới)**, JSON `attack: row 4, 6 khung, 14 fps, loop false, hitFrames [2,3]`. Sheet riêng **`game/anim/lam-chatgpt-80-combo.png` 576×240 = 3 hàng × 6 ô 96×80, pivot [48,79]** + `lam-chatgpt-80-combo.anim.json` (`attack1/attack2/attack3`, cùng fps/loop/hitFrames) – không bị cắt gì. `anim2d.js` đọc frameWidth/pivot từ JSON nên ô 96 chạy được không sửa lib.

## Tỉ lệ thu – điểm quan trọng nhất

ChatGPT vẽ Lam ở sheet combo **đầu to hơn hẳn** sheet run: mắt → đỉnh mũ = 35 % chiều cao (run 30 %). Đo trên cả 18 khung: theo cỡ đầu s = 0,2380 (Lam chỉ cao **55 px**), theo chiều cao (trung vị 231 px → 64) s = 0,2771 (đầu to hơn run **15 %**, 22,5 px). Chọn **trung bình nhân s = 0,2568** cho cả 3 đòn → đầu 21,0 px (run 19,5), **thân đứng cao 57–61 px** (khung giơ kiếm cao tới 66–71 vì kiếm). Nghĩa là khi run → attack đầu tụt 7 px và thân thấp hơn ~5 px. Có thể chạy lại với `--ty-le-cach cao` (cao 64, đầu to 15 %) hoặc `dau` (cao 55) nếu muốn khác. Thu đa số khối thắng nearest ở cả 3 hàng (254/272/258 vs ~600).

## Căn

Tất cả 18 khung chống đất: **đáy thân (bỏ lưỡi kiếm) = hàng 79**, không khung nào có kiếm thấp hơn chân (đòn 3 F4 mũi kiếm hàng 78). Cột mắt **48** (ô 80) / 56 (ô 96) ở mọi khung → đầu thẳng cột trong từng đòn; hàng mắt dao động 41–46 (ChatGPT vẽ thân cúi/ngửa khác nhau, biên 2–5 px/đòn – đây là "thân nghiêng" tự nhiên, không sửa).

| Đòn | hàng mắt F0–F5 | cao thân F0–F5 | px/khung | màu | mắt tự giữ | lật | ra ngoài ô 80 | ra ngoài ô 96 |
|---|---|---|---|---|---|---|---|---|
| 1 ngang | 41 42 43 41 44 42 | 61 60 66 60 57 59 | 1916–2100 | 11–12 | 6/6 | 6/6 đúng | **F0 2 px (mũi kiếm x=−1), F1 9 px (x=−3…−1), F3 3 px (x=80)** | 0 |
| 2 chéo lên | 42 43 42 42 43 44 | 59 58 59 64 71 67 | 1701–1969 | 11–12 | 5/6 (F3 mặt bị tay che → toạ độ ghi tay `MAT_TAY`) | 6/6 | 0 | 0 |
| 3 chéo xuống | 41 41 43 45 46 43 | 67 59 68 56 55 58 | 1778–2022 | 11–12 | 6/6 | 6/6 | 0 | 0 |

**Mũi kiếm vượt ô 80 ở đòn 1 F0 (2 px), F1 (9 px), F3 (3 px)** – chỉ là 1–3 px cuối của mũi kiếm; trong `lam-chatgpt-80.png` hàng 4 các pixel này **bị cắt** (không scale). **Đề xuất: dùng ô 96×80 (`lam-chatgpt-80-combo.png`, pivot [48,79]) cho attack** – đã xuất sẵn, không cắt gì; hoặc chấp nhận cắt 2–9 px mũi kiếm ở bản 80 (F1 là khung lấy đà, kiếm sau lưng, ít ai để ý). Không chọn cách dời cột mắt vì sẽ trượt ngang khi run ↔ attack.

## So với khung que `combo-que2` (góc kiếm tính từ vai, 0° = chỉ thẳng trước, +90° lên)

| | F0 | F1 | F2 | F3 (hit) | F4 | F5 |
|---|---|---|---|---|---|---|
| Đòn 1 ChatGPT / que | +167° / +165° | +178° / +184° | +125° / +111° | +16° / 0° | −8° / −15° | −44° / −45° |
| Đòn 2 | −156° / −131° | −167° / −150° | −39° / −60° | +62° / +45° | +104° / +75° | +114° / +100° |
| Đòn 3 | +133° / +131° | +149° / +150° | +97° / +80° | −30° / −45° | −45° / −64° | −20° / −30° |

Cung chém đúng trình tự que ở cả 3 đòn (sai 0–30°). Khác que: que vẽ kiếm **tay trước**, tiêu chí docs §4 ghi **tay xa** – ChatGPT theo que (tay gần camera; kiếm/tay che mặt ở đòn 3 F0–F2 và đòn 2 F3, lướt qua mũ ở đòn 1 F2). Chân que F0–F5 trụ cố định (26/37 → 25/41…), ChatGPT chân rộng cố định, không bước.

## Tiêu chí (§4)

* F0 anticipation hạ trọng tâm, kiếm kéo sau: đạt cả 3 đòn.
* F1 wind-up kiếm ra sau tối đa: đạt.
* F2 impact đầu – kiếm quét trước mặt: đòn 1 **chưa đúng** (F2 kiếm còn giơ cao sau đầu +125°, chưa tới vùng trước mặt – impact thật ở F3); đòn 2 F2 kiếm thấp trước (−39°) đạt; đòn 3 F2 kiếm thẳng đứng trên đầu (+97°) – mới bắt đầu bổ.
* F3 impact cuối: đạt cả 3 (ngang +16°, chéo lên +62°, chéo xuống −30°).
* F4 follow-through, F5 recovery về gần idle: đạt; F5 đòn 2 kiếm còn giơ cao (+114°) chưa về idle.
* Tay kiếm dịch 4–8 px: mũi kiếm dịch 20–60 px/khung giữa F1→F2→F3 (đúng là cung chém, nhưng F2→F3 đòn 1 nhảy 109°/60 px trong 71 ms – nhanh, sẽ cần vệt chém VFX).
* Không đổi tay, không xuyên thân, kiếm liền bàn tay: không đổi tay ✓; kiếm/tay **che mặt** ở đòn 3 F0–F2, đòn 2 F3 (không xuyên, nhưng che); liền tay ✓.
* Chân trụ 1–3 px, thân nghiêng 1–3 px: chân trụ ✓, thân nghiêng 2–5 px (hàng mắt).
* Pivot cố định, không trượt ngang: đạt (cột mắt 48 mọi khung).
* hitFrames [2,3] metadata: ghi trong JSON, không đụng hitbox/damage.
* Non-loop giữ F5: JSON ✓. PNG/sheet/JSON/GIF/alpha/bảng màu/lật: đạt. **Ô 80 cắt mũi kiếm 3 khung đòn 1** – xem đề xuất.

## Chuỗi chuyển trạng thái `chuoi-x4.gif` (idle(run-0) ×4 → jump 4 → giữ F3 → fall ×2 vòng → run 8 → attack1 → attack2 → attack3 → idle)

| Điểm chuyển | lệch hàng mắt | lệch cột mắt | lệch đáy chân | nhận xét |
|---|---|---|---|---|
| idle → jump F0 | +10 (đầu tụt) | 0 | 0 | khuỵu sâu của ChatGPT – giật rõ 1 khung |
| jump F3 → fall F0 | 0 | 0 | +7 (chân thả xuống) | đầu liền, chân duỗi ra khi bắt đầu rơi – thấy nhưng hợp lý |
| fall F1 → run F0 | +3 | 0 | +6 (chạm đất) | tiếp đất, ổn |
| run F7 → attack1 F0 | **+7** | 0 | 0 | đầu tụt 7 px = vừa hạ trọng tâm vừa thân combo thấp hơn 5 px – **thấy pop nhỏ** |
| attack1 F5 → attack2 F0 | 0 | 0 | 0 | liền |
| attack2 F5 → attack3 F0 | −3 | 0 | 0 | liền |
| attack3 F5 → idle | −7 | 0 | 0 | đầu bật lên 7 px khi về idle |

## Thẳng thắn

1. **Tỉ lệ cơ thể khác sheet run** (đầu to 15 %) là lỗi nguồn lớn nhất: dù chia đôi sai lệch, Lam lúc chém vẫn **thấp hơn 5 px và đầu to hơn 1,5 px** so với lúc chạy; nhìn chuỗi thấy "đổi người" nhẹ ở run → attack. Sửa triệt để chỉ bằng gen lại cùng cỡ với run sheet (ghép nhân vật run vào prompt làm mẫu).
2. **Kiếm tay gần, che mặt**: đòn 3 F0/F1/F2 và đòn 2 F3 (che kín, phải ghi toạ độ mắt tay); đòn 1 F2 lưỡi kiếm lướt sát mũ – do que vẽ kiếm tay trước. Nếu giữ tiêu chí "kiếm tay xa" thì cả 18 khung đều sai thiết kế.
3. **Mũ đổi dáng**: hàng combo mũ vuông hơn, mắt gần mép mũ hơn so với run/jump – cùng nhân vật nhưng ChatGPT vẽ "phiên bản" khác.
4. **Trâm ngực** đòn 2 F4/F5 thành hình chữ "P"/"D" trắng 4×5 px (nguồn vẽ vòng trắng to) – hơi lạ nhưng là nguồn, chưa sửa tay (`SUA_TAY` rỗng).
5. **Chân không bước**: que cho chân trước bước 1–3 px, ChatGPT đứng tấn cố định cả 6 khung; đổi lại không trượt chân.
6. Đòn 1 F2 → F3 kiếm quét 109° trong 1 khung – game cần vệt chém che chỗ hở; hitFrames [2,3] thì F2 kiếm còn ở sau đầu (vùng va chạm thật bắt đầu từ F3).
7. Ô 80 cắt 2–9 px mũi kiếm ở đòn 1 F0/F1/F3 → đã nêu đề xuất ô 96.
8. Idle vẫn tạm run-0; `demo.html` chưa tích hợp (không đụng).

**Prompt gen lại (ngắn, nếu cần):** "Same character and SAME SIZE/PROPORTIONS as the attached run sheet (head ≈ 30 % of height). 6-frame horizontal slash facing right, transparent, sword in the FAR hand so it never covers the face: F0 crouch sword back, F1 sword fully back, F2 sword sweeping in front at chest height, F3 sword straight forward, F4 sword past target slightly down, F5 back to idle. Feet planted, same ground line in all frames, sword tip within 40 px of the body."
