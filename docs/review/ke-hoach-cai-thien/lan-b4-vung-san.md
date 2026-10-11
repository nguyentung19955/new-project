# Làn B4 — 7 vũng trên sàn bằng ảnh AI

Đọc `CHUNG.md`; `docs/review/kiem-ke-hinh-code.md` mục 6.2 (bắt buộc), 6.4 dòng B4; `docs/review/hieu-ung-b1/bao-cao.md`, `hieu-ung-b2/bao-cao.md`, `hieu-ung-b3/bao-cao.md` (cách thêm mục vào `tools/tach-hieu-ung` bảng `HU`, `G.fxAnh.co(mã)`, cách móc trong `fx*.js`, nền theo màu hình, bản theo hệ); `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md` (trang vừa có "Lô gộp" `LO_GOP` — thêm 7 mục lẻ ở CUỐI nhóm lẻ, và thêm 1–2 lô gộp cho 7 vũng nếu cùng số khung + cùng nền; không phá đường cắt); `docs/review/ke-hoach-cai-thien/dot-7/bao-cao.md` (trạng thái trên thân — vũng không trùng việc); `docs/vfx/BANG-MAU-LOI.md`. Dự kiến 1,5–2 giờ. Tệp được sửa: `tools/tach-hieu-ung/index.html` (chỉ thêm mục/lô), `game/js/fx_he.js` (~362, ~453), `game/js/fx.js` (`pool`), `game/js/fx_chuong.js` (96–143 dùng chung), `docs/review/hieu-ung-b4/`. Phiên song song: D3 (`village_scene.js`, `tach-lang`) và C4 (`btn_art.js`, `tach-giao-dien`) — không đụng.

## Làm
1. Liệt kê đúng 7 vũng từ code: vũng lửa, vũng độc, mây độc, 4 vũng của quái (đọc `fx_he.js`, `fx.js pool`, `fx_chuong.js` để lấy tên, bán kính luật, màu, thời gian sống, hoạt ảnh). Mỗi vũng một dải 4–6 khung lặp, ô vuông (vũng nhìn từ trên hơi dẹt — tả rõ tỉ lệ), cỡ khung trong game = đường kính luật lớn nhất của vũng đó (ghi bảng). Nền: lửa → xanh dương; độc/mây → hồng tím; quái → theo màu.
2. Móc game: có ảnh thì vẽ ảnh **co theo bán kính luật** (ảnh chỉ là lớp nhìn; bán kính gây sát thương không đổi), giữ code cho viền nóng và vòng nhịp như lane plan ghi; không có ảnh → code y cũ. Pha mờ dần khi vũng sắp tắt giữ như cũ.
3. Prompt theo kiểu các mục B1–B3 (một đoạn tiếng Việt, dải một hàng, câu màu, nét lạ, không đỏ tươi); chép vào `docs/review/hieu-ung-b4/PROMPT.md` với mục "Cách nhanh" (lô gộp) ở đầu và prompt lẻ "Dự phòng" ở dưới, cùng bảng mã tệp/cỡ/khung/nền.
4. Ghi dung lượng ước thêm (7 dải × cỡ trung bình B1–B3).

## Kiểm nhanh (không chạy bộ test dài)
`node --check`, `python3 game/build.py`, một lượt Playwright: dải mẫu máy vẽ → trang tách ĐẠT → nạp tạm vào game → chụp 844×390 phòng có vũng lửa + vũng độc + mây độc; đo bán kính vẽ = bán kính luật (ghi số); không có tệp → so ảnh = 0 khác; bot ải 1 nhật ký sát thương trùng bản trước. Ảnh kiểm `docs/review/hieu-ung-b4/anh-kiem.png`. KHÔNG thêm ảnh vào `game/art/custom`.

## Kết thúc
`docs/review/hieu-ung-b4/bao-cao.md` theo mục IV + PROMPT.md; cập nhật dòng B4 trong `TRANG-THAI.md`; đẩy, chờ workflow xanh, DỪNG. Không hỏi lại.
