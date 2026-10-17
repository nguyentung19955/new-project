# Báo cáo JUMP – Lam 3/4, 4 khung · 10 FPS · KHÔNG loop, giữ F3 – vòng 1

Phạm vi: thêm animation `jump` vào `proto-lam/proto.html` (keyframe + API `PROTO.xuatJump`, nút **Jump 64**), script `proto-lam/xuat-jump.py`, thư mục `out/jump/`, sheet `game/anim/lam-proto.png` (thêm hàng 2) + `lam-proto.anim.json` (thêm `jump`), `proto.build.html` + artifact "Proto Lam 3/4" (tab Jump 64). **Giữ nguyên:** mô hình, rig, camera (xoay 22°, nhìn xuống 12°), tỉ lệ, toon 3 tông, hậu kỳ pixel, bảng 12 màu, alpha 0/255, viền ngoài 1 px, viền trong theo ID, pivot [32,63]. **Idle V3 và Run V2 không đổi**: render lại từ cùng trang trùng từng pixel `out/idle/idle-0..5.png` (6/6) và `out/run/run-0..7.png` (8/8); hàng 0–1 của sheet mới trùng từng pixel sheet cũ (0 pixel khác). Không làm Fall/Attack; không đụng `game/demo.html`, `game/lib/*`, `art/sprite/*`, `tools/*`, `game/xem-thu/anim2d.html`, `out/idle/*`, `out/run/*`. Không chạy test tự động.

Ảnh để xem: **`jump-x4.png`** (số khung + ms + đường pivot + vạch đáy ủng), `jump-x8.png`, `jump.gif` (×4, lặp chỉ để xem – ghi rõ non-loop), `silhouette.png`, `chong-silhouette.png`, `so-sanh-idle-jump-x4.png` (idle F5 · run F0 · run F1 · jump F0..F3), `idle-jump-fall.gif` (Idle → Jump → giữ F3 → Fall placeholder `TV.Anim.placeholder` → Idle), `trong-game.png` (nền Làng Chuông ×2, pivot đặt ở y 0/−6/−14/−20), `lat-check.png`, `anim2d-check.png`. Số liệu: `kiem-tra.json`.

## Cách làm (ngắn)

- 4 keyframe (t = 0/100/200/300 ms, khung 400 = 300 để F3 ổn định) trên cùng rig/IK như Idle, `chanCung = 0` để chân đi theo hông (gối khuỵu/duỗi/co do IK), pivot không đổi, **không dịch sprite**: từ F1 trở đi hông đứng yên ở hàng ≈ 48, chỉ bàn chân rời hàng 63.
- Áo choàng + chuông: cùng mô phỏng con lắc tất định như Run; "gió" của Jump = −4 × vận tốc đi lên quy ước (0 → 1 lúc bật → 0,5 gần đỉnh) → luồng khí ép áo cụp xuống; bắt đầu từ trạng thái nghỉ của Idle (như Slash). Non-loop nên không khép vòng; F3 là ảnh tĩnh giữ nguyên tới khi gameplay chuyển Fall.
- Chân xa hạ bù thị sai 0,025 (như `RUN_LECH_XA`) để đáy hai ủng cùng hàng.

## Mục 2 – từng dòng tiêu chí (số từ `kiem-tra.json`)

| Tiêu chí | Kết quả | Số đo |
|---|---|---|
| 4 khung, 10 FPS, non-loop, giữ F3 | **ĐẠT** | 4 khung × 100 ms; `loop:false` trong `lam-proto.anim.json`; anim2d: `xong()` lật true đúng bước 24 (= 400 ms), tới khung cuối ở bước 18 (300 ms), 1 s sau vẫn 4/4 |
| F0 lấy đà, gối khuỵu, thân hạ 1–2 px | **ĐẠT** | hông hạ **1,67 px** so idle (y 50,11 → 51,78), hông–mắt cá 3D 0,242/0,269 (idle 0,273) → gối khuỵu; hai đáy ủng **hàng 63** (gần + xa) |
| F1 bật, chân duỗi, thân vươn cao; bàn chân cao hơn pivot 0–2 px | **ĐẠT** | hông cao hơn idle **2,08 px** (y 48,03); hông–mắt cá 0,284/0,286 (tối đa 0,291 = thẳng); đáy ủng gần **0 px**, xa **2 px** trên pivot |
| F2 bay lên, gối bắt đầu co, áo choàng trễ xuống | **ĐẠT** | mắt cá nhích lên so hông: gần 1,45 px, xa 0,84 px so F1; đáy ủng 2/3 px; đuôi áo từ cột 12 (F1) → **14** (cụp về thân 2 px), mọi đoạn áo chạm biên −0,12 rad |
| F3 gần đỉnh, gối co rõ (bàn chân cao hơn pivot 2–5 px), thân ổn định | **ĐẠT** | đáy ủng gần/xa **4 / 4 px** trên pivot; hông y 48,03 (F1 48,03, F2 47,81 → thân ổn định ±0,2 px); khung 300→400 ms giữ nguyên tư thế |
| Gối co ≈ 2–4 px (đổi vị trí bàn chân so hông) | **ĐẠT** | mắt cá–hông F1 → F3: gần **3,36 px**, xa **2,05 px** |
| Tay gần nâng 1–3 px giữ thăng bằng | **ĐẠT** | bàn tay gần so idle: F0 −0,58 (hạ nhẹ lấy đà), F1 **+1,28**, F2 **+1,91**, F3 **+2,14 px**; mặt nạ tay gần 32–35 px khi bay (F0: 14 px) – tay lộ ra rõ hơn |
| Tay xa vẫn cầm kiếm, hướng an toàn, không đổi tay | **ĐẠT** | lưỡi + chuôi liên thông với ID tay xa ở 4/4 khung (`lienMoiKhung`), không kề áo choàng (0 px), không kề thân/đầu (0 px), lưỡi hướng trước chúc xuống −7,9/−7,9/−10,3/−11,5°, lưỡi 34–37 px, chuôi+chắn 15–19 px |
| Áo choàng trễ 1–3 px | **ĐẠT (2 px ngang)** | đuôi áo so F1: F2 +2, F3 +2 px về phía thân; gấu so hông chỉ đổi 0–0,8 px (góc nhỏ nên trễ hiện ra theo chiều ngang, xem "Thẳng thắn" 2) |
| Chuông dao động nhẹ, không tách khỏi chỗ gắn | **ĐẠT** | tâm chuông so đỉnh đầu dao động **1,4 px ngang / 1,5 px dọc**; dây liền (liên thông 8) 4–6 px ở 4/4 khung; thân chuông cách mép mũ 2/3/4/3 px nền, không trùm mặt |
| Pivot [32,63] không đổi, không đưa sprite lên | **ĐẠT** | `pivotRender = [32,63]` 4/4; hông y 51,8 → 48,0 → 47,8 → 48,0 (chỉ F0→F1 bật lên 3,75 px là phần "vươn" của thân, F1–F3 đứng yên); `trong-game.png` đặt pivot ở y 0/−6/−14/−20 |
| Không căn giữa theo bbox | **ĐẠT** | bbox 4 khung khác nhau (cao 42/47/46/44, rộng 47/49/46/46), tâm bbox lệch pivot +3/+3/+3,5/+3,5 px – giữ nguyên |
| Kiểm định: ảnh 4 khung có pivot + vị trí bàn chân; GIF Idle → Jump → Fall; không nhảy vị trí ở điểm chuyển | **ĐẠT** | `jump-x4.png`, `silhouette.png`, `idle-jump-fall.gif`; Idle F5 → Jump F0: tâm x ủng lệch **1,0 px (gần) / 0,5 px (xa)**, đáy ủng 0 / +1 px (ủng xa 62 → 63); Run → Jump F0 xem bảng dưới |

**Run F? → Jump F0 (lệch tâm x ủng gần / xa, px):** F0 2/1 · F1 2/1 · F2 6/10 · F3 10,5/11,5 · F4 9/12,5 · F5 6,5/8,5 · F6 2/4,5 · F7 1/0 → **vào được (≤ 3 px) từ Run F0, F1, F7**; từ F2–F6 chân nhảy 4,5–12,5 px (xem "Thẳng thắn" 3).

## Mục 5 – nghiệm thu chung

- PNG từng khung 64×64, sheet 512×320 (hàng 0 idle, 1 run, 2 jump, 3–4 trống cho Fall/Attack), JSON, GIF: có.
- Màu: **12 màu kể cả trong suốt**, 0 màu ngoài bảng, alpha chỉ 0/255, pivot đúng 4/4 (kiểm bằng script).
- Contact sheet đánh số + ms, phóng ×4/×8 nearest; bản trên nền gameplay 480×270 (`trong-game.png`).
- Lật: `lat-check.png` – lệch trái/phải/đáy 0/0/0, 0 pixel sai ở 4 khung; anim2d "Kiểm lật" ĐẠT (khung 3, và `kiemLat` 4/4 khung qua bộ phát riêng).
- Bộ phận: mắt 2 điểm, lưỡi, chuôi, chuông, dây, trâm, ủng gần/xa, tay gần/xa, mũ, thân, áo choàng có mặt ở 4/4 khung; đùi chân xa (ID 8) 3/2/0/0 px – bị chân gần + áo che ở F2–F3 (che khuất, không phải thiếu; ủng xa vẫn 13–32 px).
- Non-loop giữ khung cuối: anim2d `khungCuoi()` true từ 300 ms, `xong()` true đúng 400 ms, sau 1 s vẫn khung 4/4, `loop false`.
- Chuỗi Idle → Jump → (Fall placeholder) → Idle: `idle-jump-fall.gif`, Fall là khối màu của `TV.Anim.placeholder` (không vẽ lại Lam). Run → Jump: chưa ghép GIF (chỉ số đo ở bảng trên).
- Sai khác pixel khung kề: F0→F1 **1049**, F1→F2 475, F2→F3 377.

## Thẳng thắn – điểm còn yếu

1. **F0 → F1 là cú "bật" lớn nhất**: 1049 pixel khác (gấp 2–3 lần hai cặp còn lại) vì thân lên 3,75 px + duỗi thẳng + đầu ngẩng; ở 10 FPS trông là một cú giật có chủ ý (bật đà), chân không teleport (ủng gần vẫn hàng 63, tâm x đổi 1,5 px). Nếu ChatGPT thấy giật quá, cách chỉnh là bớt hạ thân ở F0 (0,255 → 0,265) hoặc bớt vươn ở F1 (0,34 → 0,33) – không đổi pivot.
2. **Áo choàng "trễ xuống" chủ yếu là cụp ngang 2 px**, gấu áo so hông chỉ thấp hơn F1 ≤ 0,8 px. Lý do: mô phỏng con lắc có biên dưới −0,12 rad (áo không được đung đưa ra trước quá), nên dù gió −4 mọi đoạn đã chạm biên ngay từ F2 → F3 trạng thái áo bão hoà, không thấy thêm chuyển động. Muốn áo "rủ" rõ hơn phải nới biên (ảnh hưởng Run/Idle – chưa làm).
3. **Run → Jump chỉ mượt từ Run F0/F1/F7** (lệch ≤ 2 px); từ F2–F6 chân nhảy 4,5–12,5 px vì tư thế F0 của Jump cố định (chân dang như idle ±1 px). Gameplay nếu cho nhảy giữa bước sẽ thấy chân đổi chỗ 1 khung; sửa triệt để cần F0 phụ thuộc pha chạy (ngoài tiêu chí mục 2).
4. **Chân xa ở F1 cao hơn pivot 2 px** (gần 0 px) do thị sai + IK: nếu hạ thêm thì khoảng hông–mắt cá vượt 0,291 (bị kẹp) và bàn chân bị kéo lên; chấp nhận trong mốc 0–2.
5. Màu chân xa dùng ramp Idle (tối) chứ không dùng ramp sáng của Run vòng 2 → chuyển Run → Jump chân xa sẫm lại một bậc; chuyển Idle → Jump thì đồng nhất. Ở F2–F3 hai ủng chồng gần nhau (cột 26–40) nên đọc hai chân chủ yếu nhờ viền trong.
6. Chuông ở F2 cách mũ 4 px (idle 3) – chuông văng ra sau 1 px khi thân nghiêng về trước rồi trở lại; dây F1/F2 có đỉnh chạm mép mũ, F0/F3 cách 1 px (`dinhDayChamMu` false/true/true/false) – khác nhau nhẹ giữa khung.

## Cách chạy lại

`python3 proto-lam/xuat-jump.py` (≈ 10 s; `--xem` chỉ in số liệu + `jump-x8.png` + `kiem-tra.json`), rồi `python3 proto-lam/build.py` để cập nhật `proto.build.html` (tab **Jump 64**; `--artifact <file>` để tạo bản cho artifact). Tham số trong `proto.html`: `JUMP.gio` (gió theo vận tốc đi lên, mặc định −4; ghi đè `PROTO.TUY.jumpGio`), `JUMP.lechXa`, keyframe `ANIMS.jump` (hy/lean/fX*/fG*/gH*/xH*). Script render lại Idle + Run từ cùng trang và so từng pixel với `out/idle`, `out/run` (`kiem-tra.json → idle.trungPixel`, `run.trungPixel`), hàng 0–1 sheet so với bản cũ (`sheetHang01TrungBanCu`).
