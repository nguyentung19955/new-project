# GĐ1 — Nhóm 1C (phiên gd1-c): Người mới, chữ, màu

Nhánh: `gd1-c`. Chỉ sửa code, **chưa chạy bài kiểm tra nào** (chỉ `node --check` từng file js đã sửa).
Không đổi luật chơi hay số cân bằng.

## Đã sửa gì

| ID | Sửa gì | File / hàm |
|---|---|---|
| V28 | Phòng đầu ải hướng dẫn chỉ còn **một** ô chữ ngắn: "Kéo cần bên trái để đi. Bấm (hoặc giữ) nút Đánh để chém, bấm Né để lăn tránh." Mẹo vũ khí (kiếm) bị **hoãn** ở phòng đầu (không đếm giờ), sang phòng kế mới hiện đủ 5 giây. Quái ở phòng đầu ải hướng dẫn ra sau **3,5 giây** (trước là 0,6 giây) để người mới kịp đọc. | `stage.js`: `TUT.start`; `drawHud` (ô mẹo: biến `tipB`, `S.heldTip`; dòng báo lớn giờ xét `!W.banner.tip`); `buildRoom` (truyền `banner: S.heldTip` cho phòng kế — 2 dòng); `startStage` (`S.W.waveT = 3.5`) |
| V29 (trừ O7) | Khi chưa qua quá 1 ải (`Object.keys(sv.stars).length <= 1`) chỉ **một** người làng có chấm đỏ: chưa đánh ải nào → Lái Đò trước (rồi Cụ Đồ, Lò rèn, Thợ May); sau ải 1 → Cụ Đồ có điểm → Lò rèn → Thợ May → Lái Đò. Từ ải 2 trở đi như cũ. | `village_scene.js` `checkNews` |
| V31 | Vùng báo đòn của quái thêm **sọc chéo tối** trong lòng vùng và **viền nét đứt tối chạy vòng** (hình dạng, không đổi màu). Vòng dưới chân em bé không đổi (nét liền, không sọc). Khe an toàn của tường nước không có sọc. | `bao_truoc.js`: hàm mới `hatch()`, gọi trong `drawTele` |
| V77 (trừ "7 phòng") | "Giữ nút Đánh" → "Bấm (hoặc giữ) nút Đánh"; "Hero" → "Em bé" ("Chọn em bé", nhãn lối tắt "Em bé", nút "Đổi em bé", "Đổi em bé: Ông Từ", tiêu đề "Em bé", "(em bé từ cấp 5)", "Em bé mới đã mở.", "Em bé · xa nhất"); dấu: "tiến hoá" → "tiến hóa", "khoá/Khoá" → "khóa/Khóa" (Hành trang), "tuỳ ý" → "tùy ý". | `stage.js` (TUT, dòng cứu em bé, dòng thắng), `village_scene.js` (dòng 43 `NPC.tu`, nhãn nút gần Ông Từ), `hanh_trang.js`, `tailor.js`, `bang_vang.js` (chỉ chuỗi) |
| V79 (phần O3) | Mẹo nút Chưởng chỉ hiện khi **đủ mana** (nút đã sáng). (Phần O4 — mẹo vũ khí chỉ lần đầu — là của gd1-b trong `moves.js`.) | `chuong.js` `CH.update` (thêm `W.P.mana >= CH.cost(W.P)`) |
| V80 O8 | Ải hướng dẫn: phòng phụ Thử thách / Lời nguyền đổi thành **Thương nhân**. | `stage.js` `startStage` |
| V80 O9 | Lần đầu máu < 40% mà còn bình (và không bị cấm bình): hiện mẹo "Máu thấp! Chạm ô Bình máu (góc trên bên trái) để hồi 30% máu." (ô mẹo lề trái, 5 giây, một lần, lưu `G.save.tut.potion`). Mẹo này không bị hoãn ở phòng đầu. | `stage.js` vòng cập nhật phòng (cạnh `pickLoot`) |

Bài kiểm tra đã chỉnh cho khớp (chưa chạy):
- `tests/ban_do.py`: nhận cả "Khóa"/"Mở khóa" (mới) lẫn "Khoá" (cũ).
- `tests/setup.js` `testSave`: thêm `sv.tut.potion = 1` (như `chIn`) để ảnh chụp không có mẹo bình máu.
- `tests/trang_phuc.py` (mục 8) và `tests/ui_input.py` (lò rèn): đặt 2 sao ải trước khi xét chấm đỏ, vì luật "người mới chỉ một chấm" sẽ che chấm của Thợ May/Thợ Rèn.

## Còn lại / ngoài phạm vi (ghi để người điều phối biết)
- "khoá", "Hoả", "hoá" còn ở file không phải của 1C (`data.js`, `mapgen.js`, `minimap.js`, `village.js`, `boss.js`, `monster_art.js`, `ban_do.js`…) → `au_noi_dung.py` mục `dat_dau` **có thể chưa trống hẳn**; cần một lượt sau (GĐ2) ở các file đó.
- "7 phòng" (`village.js`), thẻ Cụ Đồ mở thẳng thẻ Cây chưởng (O7, `village.js open`) → GĐ2 nhóm 2C.
- Đổi chuỗi trong `village_scene.js` ngoài `checkNews` (dòng 43 và nhãn "Đổi em bé") — chỉ là chữ, V77 có ghi dòng này.
- Mẹo vũ khí bị hoãn ở phòng đầu: nếu gd1-b ghi "đã xem" vào bản lưu ngay khi `tip()` chạy thì vẫn ổn, vì mẹo được mang sang phòng 2 và hiện ở đó.

## CẦN KIỂM TRA khi kiểm tra chung (TONG-HOP mục 4 dòng 1C)
1. `au_onboarding.py`:
   - ảnh 07 (phòng 1): chỉ **một** ô chữ; chữ nói "Bấm (hoặc giữ)"; quái chưa lao tới trong ~3 giây đầu (máu không tụt khi đứng yên 3 giây).
   - phòng 2: mẹo kiếm hiện (một ô chỉ dẫn + một ô mẹo là chấp nhận được).
   - bước 27 (làng sau ải 1): `news` chỉ **1 mục** (thường là `do`).
   - ải 2: mẹo Chưởng chỉ hiện khi nút Chưởng đã sáng (mana ≥ giá).
   - vài hạt giống: không còn phòng Lời nguyền / Thử thách ở ải hướng dẫn (thấy Thương nhân).
2. `au_noi_dung.py`: mục `dat_dau` — các cặp trong file của 1C đã hết; còn lại là ở file nhóm khác (xem trên). Không còn chữ "Hero" hiển thị.
3. `au_truy_cap.py`: ảnh deutan — vùng báo của quái có sọc/nét đứt, phân biệt được với vòng liền dưới chân em bé. `bao_truoc_shots.py`: xem sọc không quá rối, vẫn đọc được phần đỏ đậm lấp dần và mũi chữ V; khe an toàn tường nước (Ngư Tinh) vẫn sạch.
4. `tests/hanh_trang.py` (chữ "Em bé", "Đổi em bé: Ông Từ" không tràn nút), `tests/ui_input.py`, `tests/ban_do.py`, `tests/trang_phuc.py`, `tests/chuong_ui.py`, `lang_shots.py` (lối tắt "Em bé" không tràn; làng mới chỉ 1 chấm đỏ — nếu ảnh/bài nào giả định nhiều chấm ở bản lưu 0–1 sao thì chỉnh bài).
5. Thử tay: ải 1 đứng yên cho máu xuống dưới 40% → hiện mẹo Bình máu đúng một lần; lần sau không hiện nữa.
6. Hiệu năng: `hatch()` vẽ thêm ~vài chục nét mỗi vùng báo; xem `au_hieunang.py` ở phòng trùm nhiều vùng.
