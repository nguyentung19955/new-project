# Đợt 2 — Mở rộng sân đấu phòng thường 208 → ~300 px (Q3)

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q3, `KE-HOACH.md` Phần 1-B/E/F và Phần 2 dòng F1/E. Dự kiến 3 giờ. Tệp được sửa: `game/js/room_art.js` (hình học `RA.geo` :973–978, cửa :268/:495/:712, `buildShell` :994), `game/js/stage.js` (bố cục nút `BTN0/BTN_BIG/btnPos/stickPos` :567–615, chữ chỉ dẫn), tệp sinh phòng/sinh quái (tìm nơi dùng `RA.geo` hoặc bounds phòng: `dungeon*.js`, `mobs.js`, `room*.js`), `game/js/ngon_ngu.js` nếu thêm chữ. KHÔNG sửa `engine.js` (canvas 480×270 giữ), KHÔNG thêm camera, KHÔNG đổi cỡ sprite em bé/quái, KHÔNG đổi phòng trùm (x 80–380) trừ khi bắt buộc để không hỏng.

## Hiện trạng
- Phòng thường: sàn x 136–344, y 56–252 (208 × 196), lề trong 9 → chơi được 190 px (~40% canvas). Canvas cố định, không zoom; lề đen `G.ox/oy` → `G.cx = min(mx,56)`, `G.cy` (`engine.js:66–69`).
- Nút: Đánh [430,220,r28], Lăn [380,246,r18], Chiêu [384,196,r18], Chưởng [434,162,r18] + `G.cx/G.cy`; cần điều khiển x<240, y>48; `BTN_BIG` khi phòng to và `G.cx<20`.
- Quái sinh theo bounds phòng; vùng báo đòn theo toạ độ thế giới (không đổi).

## Làm
1. **Hình học**: phòng thường sàn rộng ~300 (ví dụ x 90–390), cao giữ 196 (y 56–252) — **không đổi chiều cao** vì tile đợt 5 sẽ chỉnh. Tường, góc, bóng, cửa trái/phải/trên/dưới dời theo. Giữ hạt giống → cùng seed ra cùng phòng.
2. **Nút**: với phòng rộng 300, cột nút phải (x ≥ 368) và cần điều khiển (x < 240 vùng chạm) **không được đè sàn**. Nếu đè: dùng bố cục kiểu `BTN_BIG` cho phòng thường luôn, hoặc dời nút ra lề `G.cx` khi có lề. Phải chạy được cả khi `G.cx = 0` (màn 16:9 không lề) — khi đó cho phép nút đè **tường**, không đè **sàn**. Chụp ảnh ở 844×390 (19,5:9) và 1280×720 (16:9).
3. **Chữ chỉ dẫn ải 1**: dời xuống **đáy giữa**, cỡ chữ không nhỏ hơn hiện tại; ô vũ khí không được cắt chữ ("↑ Chạm để đổi vũ khí" bị cắt — lỗi đã xác nhận).
4. **Sinh quái và nhịp**: quái sinh trải theo sàn mới. Đo bằng bot sẵn có (`tests/bot.js`): bot qua ải 1 không thua; thời gian dọn phòng thường ải 1 và ải 3 so với trước (chạy 3 lần mỗi bản, ghi trung bình). Nếu chậm hơn >25% thì tăng tốc độ quái hoặc số quái theo tỉ lệ diện tích **tối thiểu** để về mức cũ ±10%, ghi rõ số đã đổi. Nếu không đạt mà phải đổi nhiều hơn → dừng, báo cáo đề xuất cỡ nhỏ hơn (260?).
5. Mọi phòng đặc biệt (rương, thương nhân, suối, thử thách, lời nguyền) dùng chung hình học phòng thường → kiểm vị trí vật thể/NPC còn trong sàn.

## Nghiệm thu
- Ảnh 844×390: sàn ≥ 60% bề ngang hiển thị (đo pixel trên ảnh). Ảnh 1280×720 cũng chụp.
- Không nút/chữ quan trọng đè sàn; không chữ bị cắt.
- Bot qua ải 1; nhịp dọn phòng ±10% so với trước (ghi số).
- Cửa, va chạm tường, vùng báo đòn đúng (chụp 1 phòng có quái lao và 1 phòng có đạn).
- Phòng trùm không đổi (so ảnh trước/sau = giống).
- `node --check`, `python3 game/build.py` qua; workflow xanh.

## Quay lui
Toàn bộ trong 1–2 commit; ghi `git revert`. Cân nhắc đặt hằng `RA.RONG_PHONG = 300` để có thể hạ về 208 bằng một số.

Báo cáo: `docs/review/ke-hoach-cai-thien/dot-2/bao-cao.md` + `anh/` (trước/sau cho 3 cỡ màn).
