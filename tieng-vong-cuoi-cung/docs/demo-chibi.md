# Demo chibi — toàn bộ màn chơi sang hình chibi (2026-10-20)

Chơi thử: https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
Bản tự chứa (artifact "Demo"): https://claude.ai/artifact/Q7zF46xo6ZbqnNtfPBa1My — dựng bằng `python3 game/build-demo.py` (≈1,4 MB, ảnh WebP).

Ảnh chụp: `game/xem-thu/anh/demo-chibi-<cảnh>-{1280,iphone}.png` + `game/xem-thu/anh/lam-trong-game.gif` (chạy + combo trong màn).
Chụp lại: `python3 game/build-demo.py && python3 game/tools/chup-demo-chibi.py` (Chromium headless, tự gọi từng khung logic nên ảnh lặp lại được).

## 1. Cỡ Lam đồng nhất — `art/chibi/lam/khung-chuan/`

Lỗi cũ: idle cao 344/512 còn run8/combo/rút dao chỉ 262–296 → đổi trạng thái Lam co 10–15 %.
Tách lại (`python3 tools/chibi-khung-chuan.py`, KHÔNG ghi đè `khung/`), mỗi tấm một hệ số sao cho **cỡ mũ trùm bằng idle**:

| Tấm | Hệ số (ảnh nguồn → ô 512) | Cũ | Cỡ mũ (idle = 111) |
|---|---|---|---|
| idle | 0,585 (giữ) | 0,585 | 111,0 |
| jump | 0,522 (giữ) | 0,522 | 111,8 (+1 %) |
| run-8 | **0,783** | 0,714 | 110,5 (−0,1 %) |
| combo-20 | **1,365** | 1,071 | 110,1–111,3 (≤ ±0,6 %); hàng xoay +9,6 % (nhìn lưng/chính diện, không so được) |
| rút dao (idle.gif) | **0,930** | 0,833 | 110,4 (−0,2 %) |

- **Thật thà về cách đo:** bề rộng bbox mũ (có chóp mũ) như đề bài gợi ý cho combo lệch tới +13–15 % vì chóp mũ chĩa ra sau theo dáng
  (đo ra combo phải ×1,53 → đầu to rõ). Nên "cỡ mũ" = trung bình của căn diện tích vùng mũ xanh chàm và khoảng mắt→đỉnh mũ.
  Theo số này run-8 ra 0,783 — gần đúng con số 0,79 BAO-CAO-3 gợi ý. Bbox cũ vẫn ghi trong json (`mu_bbox`) để tham khảo.
- Ô 640 (pivot 320, 620) thay vì 512 vì phóng combo lên thì mũi dao bị cắt ở ô 512. 1 px ô 640 = 1 px ô 512 cũ (cùng cỡ người).
- Kiểm: `art/chibi/lam/khung-chuan/so-co-lam.png` (idle / run / jump / combo / rút dao cạnh nhau cùng đất). Số đo từng khung: `khung-chuan.json`.

## 2–3. Lam trong game — `game/anim/lam-chibi.png` + `.json` (tạo bằng `python3 game/tools/chibi-sheets.py`)

- Hệ toạ độ vẫn "ô 240, pivot [120, 234] = giữa đế ủng" (×240/512). Khung được **cắt sát rồi xếp kệ** (1 sheet 2048×488, ~1 MB PNG),
  json ghi `[x, y, w, h, ox, oy]` so với pivot, mỗi bước animation có `ms`, `dx`, `dy`, `hit`, `box`.
- **[CŨ – đã thay, xem `docs/fix-animation.md`: tâm thân trên pivot cho mọi animation, đế chạm đất, không độ cao giả]** Quy tắc căn (sẵn trong dx/dy): chạy / idle / nhảy khoá ngang theo tâm mắt; đòn đánh + rút dao khoá theo gót chân sau
  (mọi đòn dưới đất cùng 1 điểm gót → nối combo liền); khung bay giữ đầu ngang idle; khung đất chạm đất.
  Ngoại lệ: đòn 3 (nhảy bổ, hai chân rời đất) và đòn trên không khoá theo tâm thân.
- **Thời lượng từng khung khác nhau:** idle 125 ms phát 1-2-3-4-3-2; chạy run-8, 83 ms (12 FPS); đòn: chuẩn bị 120 → vung 60 → **chạm 140** (hitbox bật đúng khung này) → thu 140.
  Trong game: chuẩn bị+vung 11 khung logic, chạm 8, thu 8 (đòn 3: thu 16). **Đòn chậm hơn bản cũ** (cũ ra đòn sau 2–4 khung) — đúng nhịp yêu cầu nhưng cảm giác nặng tay hơn; chỉnh ms trong `chibi-sheets.py` nếu muốn nhanh.
- Animation: idle 6 bước; run 8; jump 4 (1 khuỵu lúc bật, 2 lên, 3 đỉnh, 4 rơi — chọn theo vận tốc); **rút dao** phát 1 lần khi bắt đầu màn và sau hồi sinh (0,85 s, khoá điều khiển, khoá cả nút Vọng) rồi về idle.
- **Combo bấm Chém liên tiếp:** đòn 1 = combo-3 (đâm) → đòn 2 = combo-1 bỏ khung 1 (2 → 3 → **4 chạm** → 3 thu) → đòn 3 = combo-4 nhảy bổ
  (khung 1–2 cộng độ cao 28 / 44 px bằng dy, vì ảnh gốc vẽ chạm đất) → sau đòn cuối 1 khung combo-5/1 thu thế.
  Đòn trên không = combo-2 (xoay, chạm ở khung 4). Chém hất (↑+Chém) = combo-3 khung 1, 2, **4** (dao chéo lên). Chém nảy (↓+Chém trên không) = combo-4 khung 3–4.
- **Hitbox đòn lấy theo lưỡi dao** ở khung chạm (so với chân, mặt phải): đòn 1 x 4…151, y −97…−49; đòn 2 x −36…80, y −100…−52; đòn 3 x −13…86, y −59…5; chém hất y −140…−80; trên không x −3…124, y −107…−59. Chém nảy giữ hộp dưới chân (−26…38, −24…58).
- Hitbox thân/vật lý **vẫn 20×30** (để giữ cảm giác nhảy & bố cục cũ). Thêm **vùng ăn đòn 40×120** theo hình chibi (đấm quái, sóng, mảnh rơi, quét, đập của boss).
- **TẠM (dùng khung có sẵn):** lướt = run-8 khung 1; bị đánh = jump 1 (khuỵu) + nháy; tiếp đất = jump 1; bám tường = jump 4; chết = jump 1 mờ dần. Không có tra dao.

## 4. Môi trường

- Nền `art/chibi/nen/parallax` (bản 1920 vẽ xuống 960 cho nét trên iPhone): lớp xa chạy 0,25 × camera; ảnh chỉ vừa 1 màn mà màn demo dài 6.272 px
  nên **lặp ngang bằng bản lật xen kẽ** (không lộ đường nối, nhưng nhìn kỹ sẽ thấy cảnh đối xứng mỗi 960 px). Lớp gần (rễ 2 góc dưới) chạy 1,15 ×, lặp lật, **mờ 50 %**.
- Sàn/bậc/cột vẽ bằng mảnh `art/chibi/tileset/manh/32` (đã **giảm tương phản 10 %**), dựng tự động từ lưới gạch 32 (va chạm giữ lưới cũ):
  mặt trên = khối 11 co giãn ngang 0,8–1,25 cho vừa đoạn, chồng mép 14 px, đường mặt đứng cao hơn mặt gạch 4 px (chân lún 4 px); khối hẹp = mảnh 22/26;
  cột, tường treo, tường trên cổng = thân rễ 26 xếp chồng; trần phòng boss = thanh 02 rễ rủ; ván một chiều = bục 06/09; đất dưới sàn tô nâu sẫm. Đèn lồng trang trí treo dây, quầng sáng cộng màu.
- **Giữ bố cục/trình tự cũ** (Cổng làng → cổng + công tắc + Vọng → Sân chuông 3 quái → Câu đố 2 công tắc → Điểm lưu → Boss). Chỉnh nhỏ cho cỡ mới:
  - đáy 3 tường treo (Cổng làng cột 24, Câu đố cột 6 và 15) nâng lên hàng 8 (khe 160 px) để Lam 160 px đi dưới không đè hình;
  - tường trên các cổng chỉ xuống tới hàng 8 (cổng mới cao 159 px chiếm hàng 9–13);
  - công tắc cổng làng dời cột 18 → 13, nút chuông phòng boss cột 3 → 6, điểm kích hoạt boss cột 5 → 8 (cổng mới rộng 183 px che chỗ cũ).
- **Còn TẠM:** mảnh tileset có đầu tròn viền đen nên nhìn kỹ vẫn thấy nhịp lặp; thân rễ xếp chồng lộ mũ rêu từng khúc; hình sóng âm, mảnh chuông rơi, mảnh vàng hồi máu, HUD, chữ nổi vẫn là pixel cũ ×2.

## 5. Quái Chuông Gỗ

- Sheet `game/anim/quai-boss.png` (ô 171, pivot [85,5; 167]). Quái nhìn trái, lật khi quay phải.
- Đi 4 khung 8 FPS (khoá mắt); tấn công: khung 1 lấy đà 0,5 s (lóe vàng) → 2 đấm → **3 chạm (hitbox)** → 4 thu (khoá gót sau); trúng = 1 khung + nháy trắng;
  chết: vỡ 4 khung → **nằm lại đống vụn 2 s → mờ dần 1 s**. Cổng Sân chuông mở ngay khi cả 3 quái bắt đầu vỡ.
- **Hitbox thân 72×108** (cũ 28×40). **Hộp đấm** khung 3: x −90…−24, y −81…−44 so với chân (tầm với 82 px). Phát hiện Lam để tấn công: 170 px (cũ 192).
- Quái vỏ cứng (giữ cửa) phủ ánh đồng nhẹ để phân biệt.

## 6. Boss Chuông Gác Làng

- Ô 412, pivot [206; 402]; animation **TẠM** 6 khung thở (nhịp nhanh khi đi / lấy đà); nhún/giãn bằng code khi lấy đà, bay đập, tiếp đất; lắc khi choáng.
- Giữ nguyên hành vi cũ (đi, đập đất tạo sóng, quét thấp, giai đoạn 2 treo trần rơi mảnh chuông, bóng Vọng đứng nút để kéo xích, choáng 3 s).
- **Hitbox 200×290** (cũ 56×68). Kèm: ngưỡng tiến lại gần 72 → 150 px, điểm đáp khi đập cách tường 110 px, vùng quét 170×40 trước tay.
- Treo trần: chân boss ở y ≈ 250 nên **đầu boss khuất trên mép màn** (boss 330 px + Lam 160 px không vừa phòng cao 384 px). Chưa có ảnh đi / đập / quét / trúng / chết riêng.

## 7. Đồ vật (`game/anim/the-gioi.png`)

Công tắc nhô / lún (+2 px bằng code, rộng 64 px); điểm lưu tắt / sáng + quầng sáng cộng màu, lắc khi chạm; cổng đóng / mở
(**va chạm = hộp `va_cham` trong do-vat.json**, mở quá 60 % thì đi xuyên; chuyển hình bằng hoà mờ); đèn tín hiệu trên cổng; đèn lồng trang trí.

## 8. Giữ nguyên

Tiếng Vọng (ghi a2/k2/l2 = animation + bước + lật; bóng phát lại đúng khung, tô màu ngọc, vệt nhòe; giữ tư thế cuối), Cộng hưởng, touch controls, HUD, âm thanh, hướng dẫn 1 dòng.

## 9. Kỹ thuật

- Demo không còn nạp `lib/atlas-in-san.js`, `rig-*.js`, `tiles-ai.js` (vẫn để trong repo cho các trang xem thử cũ). Bỏ hẳn Lam / quái / boss pixel cũ và đường dự phòng của chúng.
- `tools/lam-chibi-sheet.py`, `tools/chup-chibi.py` (cũ) đã xoá, thay bằng `game/tools/chibi-sheets.py`, `game/tools/chup-demo-chibi.py`.
- Chưa chơi thử thật trên iPhone; chỉ chụp headless. Bố cục giữ nguyên nhưng đã đổi vài cột tường / công tắc (mục 4) — nên chơi lại một lượt để chắc mọi đoạn nhảy tường vẫn qua được.
