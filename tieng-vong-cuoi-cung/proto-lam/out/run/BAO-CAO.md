# Báo cáo RUN – Lam 3/4, 8 khung · 12 FPS · loop (vòng 1)

Phạm vi: chỉ thêm animation **run** vào `proto-lam/proto.html` (khối keyframe/thủ tục + API `PROTO.xuatRun`, một kênh tư thế `chanCung` để chân đi theo hông khi tay dùng IK) và script `proto-lam/xuat-run.py`. **Không đổi** mô hình, rig, camera (xoay 22°, nhìn xuống 12°), tỉ lệ, bảng màu, pivot, hậu kỳ pixel. Idle giữ nguyên bản chuẩn V3 (6 khung render lại từ cùng trang **trùng từng pixel** với `out/idle/idle-*.png`). Không đụng `game/demo.html`, `game/lib/*`, `art/sprite/*`, `tools/*`, `game/xem-thu/anim2d.html`.

Ảnh để xem: `run-x4.png` / `run-x8.png` (8 khung có số + ms), `run.gif` (×4, lặp vô hạn), `silhouette.png` (bóng đen + pivot + quỹ đạo mũi 2 bàn chân), `quy-dao-chan.png`, `chong-silhouette.png`, `idle-run-idle.gif`, `trong-game.png` (×2, 8 khung dọc lối đi Làng Chuông cạnh Quái Chuông Gỗ), `lat-check.png`, `anim2d-check.png`. Số liệu: `kiem-tra.json`. Sheet: `game/anim/lam-proto.png` + `lam-proto.anim.json` (hàng 0 idle 6 khung 8 FPS – **bằng từng pixel** hàng 0 của `lam-idle-proto.png`; hàng 1 run 8 khung 12 FPS; hàng 2–4 trong suốt). `lam-idle-proto.*` giữ nguyên để đối chiếu.

Cách dựng: thủ tục theo pha u ∈ [0,1), chân gần camera pha u, chân xa pha u + 0,5. Chân chống đất u = 0 → 0,375 (F0..F3) trượt **đều** ra sau x = +S, +S/3, −S/3, −S (S = 0,15 đơn vị ≈ 6,3 px), mắt cá đặt theo góc bàn chân để mũi/gót luôn chạm hàng 63; pha vung gót đá cao rồi hạ, F0 còn ≈ 1 px trên đất. Chân xa hạ bù 0,025 đơn vị vì camera nhìn xuống 12° làm chân xa (z +0,07) hiện cao hơn chân gần ≈ 1,3 px. Tay dùng IK như Idle (mục tiêu bàn tay vung ± 0,045–0,05); kiếm ở tay xa, lưỡi luôn hướng trước, xoay cổ tay ±21–28°. Áo choàng/chuông: mô phỏng con lắc tất định, "gió" = 2,2 × v (v = 2,0) + nhấp −2,5·sin(4πt/T) theo nhịp bước, chạy ấm 8 vòng rồi lấy khung ở vòng cuối.

## 1. RUN – từng dòng tiêu chí

**Tư thế từng khung** (xem `run-x8.png`, cột x mũi ủng theo mặt nạ ID – gần | xa; pivot x = 32):

| Khung | Yêu cầu | Thực tế | |
|---|---|---|---|
| F0 | chân gần vươn trước, chân xa ra sau, sắp tiếp đất | ủng gần tâm x 38 (trước +6), đáy hàng **62** (1 px trên đất, góc gót +8°); ủng xa tâm x 29 (sau −3), đáy hàng 60 (vừa rời đất) | ĐẠT |
| F1 | chân trước chịu lực, thân hạ thấp | ủng gần x 34, đáy hàng **63**, bàn chân phẳng; hông thấp nhất (y 51,1 px) | ĐẠT |
| F2 | hai chân ngang nhau, thân bắt đầu nâng | ủng gần x 30 (đáy 63, gót nhấc), ủng xa x 38 (đáy 59, gối nâng) – cách nhau 8 px ở mặt nạ (3D: mắt cá 29 / 36); hông về giữa (50,2) | ĐẠT (hai chân "ngang nhau" theo nghĩa đang vượt nhau; mặt nạ ủng còn lệch 8 px vì ủng dài 10 px) |
| F3 | đạp mạnh về sau, thân cao nhất | ủng gần x 25,5 (sau −6,5), đáy **63** chỉ bằng mũi (góc −26°); ủng xa vươn trước x 39,5 đáy 62; hông cao nhất (49,4) | ĐẠT |
| F4–F7 | đối xứng với chân xa | F4 ủng xa x 40,5 đáy 62 / gần x 27 đáy 60; F5 xa đáy **63** hông thấp nhất; F6 xa đáy **63** gần đáy 59; F7 xa đáy **63** (mũi) hông cao nhất | ĐẠT |

Hai nửa chu kỳ cân đối: tư thế F4–F7 là F0–F3 đổi chân (cùng công thức, pha + 0,5); hông y [50,2 / 51,1 / 50,2 / 49,4] lặp đúng ở F4–F7; sai khác pixel kề nhau nửa đầu 612/737/669/644, nửa sau 605/720/639/632 (chênh ≤ 2,5 %). Khác nhau giữa 2 nửa chỉ do chân gần/xa không cùng màu và áo choàng che khác nhau. **ĐẠT**.

**Biên độ và chuyển động:**

- Sải chân 4–7 px: nửa biên độ x mắt cá **6,3 px (gần) / 6,2 px (xa)**; theo mặt nạ mũi ủng 6,5 / 7,5 px (mặt nạ cộng thêm góc nghiêng bàn chân). Chân chống đất trượt ra sau đều: mũi −4,23 / −4,56 / −4,91 px mỗi khung (gần, F0→F3), −4,37 / −4,60 / −4,70 (xa, F4→F7); theo tâm mặt nạ ủng −4,0 / −4,0 / −4,5 cả hai chân – không nhảy. **ĐẠT** (hơi nhanh dần vì đường gót→mũi dài thêm khi bàn chân ngả, chênh 0,7 px).
- Nhún thân 1–2 px: hông **1,77 px** đỉnh–đỉnh (thấp F1/F5, cao F3/F7); đỉnh mũ hàng 21–23 = **2 px**. **ĐẠT**.
- Tay vung đối pha, bàn tay 2–4 px: bàn tay xa (kiếm) dịch **3,6 px** (x 39,8 → 43,5), bàn tay gần **4,9 px** (x 27,1 → 32,0, đã kéo ra trước bụng để thấy trên nền áo xanh). Tay xa trước nhất ở F0, chân xa trước nhất ở F4 → lệch đúng 4 khung = đối pha. **ĐẠT** (tay gần vượt 0,9 px so với mốc 4 px – đo theo mục tiêu 3D; trên ảnh chỉ thấy găng dịch ~4 px).
- Tay cầm kiếm giữ kiếm, không đổi tay, không xuyên thân: kiếm luôn ở **tay xa**; mọi khung lưỡi + chuôi/chắn + găng tay xa là **một khối liên thông 4** (`kiemLien`), có cặp pixel kề tay–chuôi và chuôi–lưỡi; lưỡi 33–37 px, chuôi+chắn 15–17 px (idle 33–36 / 16–18). Lưỡi luôn ở phía trước thân (không pixel lưỡi/chuôi nào ở cột < 28), **không pixel nào kề áo choàng**; góc lưỡi so với ngang: +20,7 / +13,7 / −4,3 / −21,6 / −27,8 / −21,5 / −4,3 / +13,8° (chếch lên khi tay ra trước, chếch xuống khi tay ra sau – hướng mũi luôn về trước nên không chui vào áo/thân). Đầu kiếm (58,41) → (55,56): cung mượt, không nhảy. **ĐẠT**.
- Áo choàng bay ngược hướng chạy, đuôi dao động 2–4 px, trễ pha: cột trái bbox áo 6–10 (idle 12–13) → **xoè sau 21–25 px**, góc mô phỏng đoạn cuối 0,29–0,85 rad (+ góc tĩnh 0,62) – bay hẳn ra sau ≈ 50–80°, gấu nâng lên hàng 55–57 (idle 58–59) nên hé chân. Đuôi áo (pixel trái nhất) dao động **x 4 px, y 4 px**; hàng gấu 55–57 = 2 px. Pha: áo cao nhất ở **F0/F4**, thân cao nhất ở F3/F7 → **trễ 1 khung**. Khép vòng mô phỏng 0,0006 px. **ĐẠT** (đuôi đo theo pixel trái nhất dao động 4 px – đúng mép trên của mốc).
- Chuông 1–2 px, không biến dạng: tâm chuông dao động **1,2 px ngang / 1,0 px dọc**, 25–30 pixel chuông mỗi khung, thân chuông cách mép mũ **2–3 px** nền, không trùm mặt, dây liền (liên thông 8) 3–7 px ở mọi khung. **ĐẠT**. *Còn khác idle:* gốc dây ló ra sau mép mũ 1–2 px (idle chạm mũ) vì thân nghiêng 16° đưa mũ tới trước nhiều hơn vai – dây vẫn nối từ sau vai xuống chuông, trên ảnh nhìn như buộc ở viền sau mũ.
- Thân nghiêng tới: sống lưng 15,5–16,5°, đầu hơi cúi 2,5–3,5°; hông xoay ±3°, ngực ngược ±4°.

**Pivot [32,63] cố định:** `pivotRender` = [32,63] ở 8/8 khung; không căn giữa theo bbox (tâm bbox lệch pivot −0,5 … +2 px tuỳ khung, ghi ở `lat`). Nhún làm bằng hông/sống lưng, không dịch sprite. **ĐẠT**.

**Chân chống đất ở hàng 63, không trượt bất thường:** đáy ủng gần [62, **63, 63, 63**, 60, 58, 59, 62], đáy ủng xa [60, 56, 59, 62, 62, **63, 63, 63**] → cả 6 khung chịu lực đều ở hàng 63 (`datHang63 = true`), nâng chân tối đa 5 px (gần) / 7 px (xa). Quỹ đạo x,y từng khung của mắt cá/mũi/gót 2 bàn chân (3D chiếu) và bbox ủng theo mặt nạ ID đều ghi trong `kiem-tra.json` (`quyDaoChan3D`, `ungGanBbox`, `ungXaBbox`), vẽ ở `quy-dao-chan.png` và `silhouette.png`. **ĐẠT**.

**Khép vòng F7 → F0:** sai khác pixel F7→F0 = **632**, các cặp kề khác 605–737 (trung bình 661) → điểm nối không nổi bật hơn các bước khác; trạng thái áo/chuông khép vòng (lệch 0,0006 px sau 8 vòng ấm). anim2d "Phát 20 vòng": 800 bước logic, 40 bước/vòng, nối 7→0 liền mạch. **ĐẠT**.

**Idle → Run → Idle** (`idle-run-idle.gif`, `chuyenIdleRun`): idle khung 6 → run F0 khác 970 px, run F7 → idle khung 1 khác 850 px (đổi tư thế cả thân + áo bay lên, không phải nhảy vị trí); hàng 63 idle: ủng cột 28–40, run F0: 35–38, run F7: 30–41 → chân vẫn nằm trong cùng vùng đất, không giật ngang. Mắt, chuông, kiếm cùng vị trí ±2 px.

## 5. Điều kiện nghiệm thu chung

- PNG riêng từng khung ✔ (`run-0..7.png` 64×64), sheet 512×320 ✔ (`game/anim/lam-proto.png`), JSON ✔ (`lam-proto.anim.json` version 1), GIF ✔ (`run.gif` ×4, 8 khung, **loop = 0 = lặp vô hạn**; thời lượng GIF làm tròn bội 10 ms nên xen 80/90 ms, trung bình 83,75 ms). **ĐẠT**.
- Alpha / palette / kích thước / pivot bằng script ✔: **12 màu kể cả trong suốt** (cùng bảng Idle, không màu ngoài bảng), alpha chỉ 0/255, 8 ô 64×64, pivot render [32,63] mọi khung, viền ngoài 1 px, viền trong theo ID. **ĐẠT**.
- Contact sheet có số khung + ms ✔ (`run-x4.png`), phóng nearest ×8 ✔ (`run-x8.png`). **ĐẠT**.
- Thử trên nền gameplay cỡ thật ✔ (`trong-game.png`: 480×270 ×2, 8 khung dọc lối đi y=241, Quái Chuông Gỗ bên phải) và nạp sheet vào `game/xem-thu/anim2d.html` headless (không sửa trang; nạp qua ô URL) → `anim2d-check.png`: animation **run**, 8 khung @ 12 fps, loop true, "Kiểm lật" ĐẠT (lệch trái/phải/đáy 0, 0 pixel không khớp). **ĐẠT**.
- Hướng gốc và lật ✔ (`lat-check.png`, pivotLat = [31,63]): 8/8 khung lệch trái/phải/đáy = 0, 0 pixel sai. **ĐẠT**.
- Không khung nào thiếu kiếm, chuông, mắt, bộ phận: mỗi khung đều có 2 điểm mắt, lưỡi ≥ 33 px, chuôi/chắn ≥ 15 px, chuông ≥ 25 px, dây ≥ 3 px, trâm ≥ 6 px, vạch ủng gần ≥ 12 px, 2 ủng, 2 tay, 2 ống chân, mũ, thân, áo. *Che khuất tạm thời (không phải thiếu):* vạch cổ ủng **chân xa** không lộ ở F1–F2 (chân xa đang vung sau, bị chân gần + áo choàng che); đùi chân xa chỉ còn 1 px ở F6. **ĐẠT có ghi chú**.
- Animation loop không giật ở điểm nối ✔ (mục khép vòng). Non-loop: không áp dụng. Chuỗi Idle → Run → Jump → Fall → Idle → Attack → Idle: mới có Idle → Run → Idle (các animation khác chưa làm theo quy trình duyệt lần lượt).
- Không tự ý đổi thiết kế Lam ✔.

## Thẳng thắn – điểm còn yếu

1. **Chân đọc chưa rõ trong silhouette.** Áo choàng dài + vạt bên gần che đùi/gối, chân chỉ lộ ≈ 6–9 hàng dưới gấu (hàng 55–63), và chân xa màu gần đen (#0C0F14/#1A212B) trùng màu mặt trong áo nên ở F3/F7 bàn chân đạp sau nhìn là một khối tối dính gấu áo; gót đá cao sau lưng (F0/F4, 5–7 px) nằm hẳn sau áo nên không thấy. Nhịp chạy nhận ra nhờ ủng trước/sau luân phiên, nhún, tay và áo bay hơn là nhờ hình chân. Muốn rõ hơn phải đổi mô hình/màu (vạt áo bên gần ngắn hơn, chân xa sáng hơn một bậc) – ngoài phạm vi, chờ duyệt.
2. **Gốc dây chuông ló 1–2 px sau mép mũ** (idle: chạm) do thân nghiêng 16°; dây liền và chuông không xuyên mũ, nhưng chỗ buộc nhìn hơi lơ lửng ở F0–F3/F5/F7 khi phóng to.
3. **Áo choàng bay mạnh và gấu dao động theo pixel trái nhất 4 px** (mép trên của 2–4 px); đuôi áo thay đổi hình (vạt rách co giãn 55–57) nên giữa F1→F2 và F5→F6 sai khác pixel lớn nhất (737/720) – vẫn dưới ngưỡng "giật" nhưng là nơi mắt dễ thấy áo "nhấp". Nếu muốn êm hơn có thể giảm `gio` −2,5 → −1,5 (đuôi còn ≈ 2–3 px).

Ngoài ra: đáy ủng chân gần ở F0 nằm hàng 62 (sắp tiếp đất) rồi F1 hàng 63 – đúng tiêu chí nhưng khác Idle (chân luôn hàng 63) nên khi chuyển Idle → Run bàn chân trước nhấc 1 px đúng khung đầu; tay gần vung 4,9 px hơi vượt mốc 4 px.

## Cách chạy lại

`python3 proto-lam/xuat-run.py` (≈ 10 s; `--xem` chỉ in số liệu + `run-x8.png`), rồi `python3 proto-lam/build.py` để cập nhật `proto.build.html` (tab **Run 64**).
