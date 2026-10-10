# Phiên gd1-a — Giai đoạn 1, Nhóm 1A (đăng nhập, lưu, phát hành, âm thanh)

Nhánh: `gd1-a`. Phiên này **chỉ sửa code, chưa chạy bài kiểm tra nào** (đúng yêu cầu); chỉ chạy `node --check` cho các tệp js đã sửa.
Người điều phối cần chạy các bài kiểm tra ở cuối tệp này khi gộp.

## Đã sửa gì

| ID | Tệp / hàm | Sửa gì |
|---|---|---|
| V1 | `game/js/village.js` — `titleLogin`, `G.Title.draw` | Đăng nhập Google thất bại (cửa sổ bị chặn, bị đóng, mở trong Zalo/Messenger/Facebook, hoặc kết quả chuyển trang báo lỗi qua `CL.gMsg`) → bật cờ `V.loginFail`. Có cờ này thì nút **"Chơi tạm (chưa lưu mây)"** hiện ngay ở ô cũ `TL.guest` (không phải chờ 10 giây) và có dòng nhỏ **"Mở bằng Chrome/Safari để đăng nhập Google"** ngay dưới nút. Đăng nhập thành công thì xoá cờ. Không đổi toạ độ nút chính, `G.syncTaps`, `G.titleLayout`, nhánh "chờ > 10 giây / mây lỗi", luồng không mây, phím Enter/Space. Chữ nút đổi từ "(không lưu mây)" thành "(chưa lưu mây)" cho mọi trường hợp (bài kiểm tra chỉ tìm "Chơi tạm"). |
| V2 | `game/js/cloud.js` — `pull()`, hàm mới `askCloudRicher` | Nhánh "bản trên máy mới hơn theo giờ": nếu `progress(mây) >= progress(máy) + 8` thì **hỏi** bằng hộp có sẵn `G.cloudUI.conflict` thay vì ghi đè mây. Vì không được sửa `cloud_ui.js`, lời trong hộp được sửa lại cho đúng chiều ngay sau khi hộp mở (tìm `#lk-conflict`); đóng hộp bằng ✕/Esc thì giữ **bản trên mây** (bản nhiều tiến độ hơn). Chọn "Giữ bản trên máy" thì đẩy bản máy lên như cũ. Chênh ít hơn 8 điểm: giữ nguyên hành vi cũ. Không đụng `_changeSeq`, thử lại giãn dần (bản sửa 15:33). |
| V2 (kiểm tra) | `game/tests/cloud_save_regression.test.js` | Thêm 3 ca V2 (chọn mây / chọn máy / chênh ít không hỏi). Sửa đường dẫn đọc `cloud.js` theo `__dirname` để chạy được cả ở gốc repo (`node game/tests/...`, như máy đăng) lẫn trong `game/`. **Chưa chạy.** |
| V3 | `game/js/engine.js` — `G.loadSave`, `G.fixSave` | `fixSave` đánh dấu khi phải bỏ bản đưa vào (sai `v`, không phải object, hoặc lỗi trong phần sửa → `catch`, nay có `console.error`). `loadSave` thấy có bản cũ mà đọc lỗi / bị bỏ thì chép **nguyên văn** sang `linhkhi_save_v1_hong` (giữ bản sao đầu tiên; nếu khoá đó đã có bản khác thì ghi vào `linhkhi_save_v1_hong2`). Không đổi khoá chính `linhkhi_save_v1`, không đổi `v: 1`. |
| V4 bước 1 | `.github/workflows/linh-khi-hosting.yml` | Thêm bước "Kiểm tra nhanh trước khi đăng" (sau cài Node, trước "Gói game"): `node --check` mọi `game/js/*.js`, `node game/tests/cloud_save_regression.test.js`, `python3 game/build.py`. Lỗi → dừng, không đăng. Không đụng/in secret. |
| V30 | `game/js/engine.js` — `G.sfx` | Đếm các tiếng đang kêu: mỗi loại tối đa 2, tổng tối đa 8, tổng âm lượng tối đa 0,28. Hết chỗ âm lượng thì tiếng mới nhỏ lại cho vừa (còn < 0,01 thì bỏ). Bảng `SFX` không đổi. |
| V27 | `game/js/engine.js` — `resize()` (~dòng 41) | Lớp chữ `#ui`: `Math.min(3, dpr)` → `Math.min(2, dpr)`. Chỉ khác trên máy màn dpr 3, chữ gần như không đổi. |

## Cần kiểm tra khi gộp (TONG-HOP mục 4, dòng 1A)

- `tests/au_luu.py`: tình huống 1 (giả `auth/popup-blocked` → có nút "Chơi tạm", bấm vào được làng) và tình huống 4 / 7.2a (máy mới hơn nhưng ít tiến độ → mây vẫn 5000 vàng, có hộp hỏi) → **"ĐÚNG"**; tình huống 5, 7 vẫn đúng.
- `tests/may.py chon tat google` đạt (6 ca chọn bản lưu giữ nguyên; ca b "máy mới hơn → đẩy lên" chênh ít nên không hỏi).
- `node game/tests/cloud_save_regression.test.js` (4 dòng PASS, có dòng V2) và `node game/tests/may_luat.test.js`.
- `tests/au_luu_hong.py`: giả lỗi trong `G.outfit.fix` → còn khoá `linhkhi_save_v1_hong` chứa bản cũ.
- `tests/au_am_thanh.py`: ≤ 2 tiếng 'die' cùng lúc, tổng âm lượng đỉnh < 0,3.
- `tests/au_hieunang.py` (V27).
- Máy đăng: đẩy một lỗi cú pháp lên nhánh thử (hoặc chạy tay workflow) → dừng ở bước "Kiểm tra nhanh", không đăng.
- Nhìn màn chào sau khi đăng nhập lỗi: dòng gợi ý (y ≈ 199) không đè dòng thông tin (y = 210) và nút "Chơi tạm".
- Thử tay: mở link trong Zalo (Android, iPhone), đóng cửa sổ Google trong ẩn danh → có nút Chơi tạm, vào được làng.

## Ghi chú cho người điều phối

- Hộp hỏi V2 được sửa lời từ `cloud.js` qua DOM vì `cloud_ui.js` ngoài phạm vi phiên. Sau này nên cho `G.cloudUI.conflict` nhận tham số lời/chiều mặc định cho gọn.
- Bài `may.py` có thể có ca dựa vào chữ "(không lưu mây)" — đã tìm, không thấy (chỉ tìm "Chơi tạm").
