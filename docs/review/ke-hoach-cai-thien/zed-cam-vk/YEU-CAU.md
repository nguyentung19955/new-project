# Yêu cầu: Zed cầm vũ khí lúc đứng / đi / chạy (chủ dự án chốt "2a", 13/10 12:26)

## Hiện trạng
Hàng 01-dung, 02-di, 03-chay-v4 của Zed mới vẽ tay không và KHÔNG có mục trong `docs/anh-goc/zed/gan-vk/neo.json`, nên game không vẽ vũ khí khi đứng/đi/chạy. Chỉ lúc đánh mới thấy vũ khí → nhìn trống tay.

## Chốt
- **Cầm TAY PHẢI** (cùng tay với lúc chém, để KHÔNG bị nhảy tay khi bắt đầu chém — lỗi cũ đã sửa, không được tái phạm). Tay phải ở phía sau thân nên một phần cán bị thân che là đúng.
- **Kiếm**: nắm ở tay phải, giơ ra phía trước người, lưỡi chếch lên-ra trước (thế thủ), không che mặt.
- **Thương, búa**: tay phải nắm cán phía sau, tay trái nắm phía trước (dùng trường tay2 như các hàng đòn). Nếu khung nào tay trái không với tới cán hợp lý thì chỉ cầm tay phải, cán chúi xuống-ra sau.
- **Phi tiêu**: một chiếc phi tiêu nhỏ trong nắm tay phải.
- Đi và chạy: vũ khí đung đưa theo nắm tay từng khung (điểm cầm = nắm tay của khung đang vẽ, góc nội suy êm giữa các khung như phần "vũ khí mượt" phiên chạy-chém đã làm), không giật.
- **Lộn (04-lon), trúng đòn (05-trung-don), chết (06-chet)**: ẨN vũ khí. Hết lộn thì vũ khí hiện lại ngay trên tay.
- Chuyển đứng/đi/chạy → đòn đánh và ngược lại: vũ khí vào thế êm, không nhảy tay, không lật 360°.
- Áp cho cả 4 bộ trang phục (ninja, Rừng, Biển, Lâu đài): neo lấy theo hàng ninja tương ứng như cách `dung_bo` đang làm, có `chinh_nam` (bán kính 18 cho bộ tay trần). Không sửa `BO_KHAC`.
- Không làm hỏng phần chạy+chém vừa làm (commit 79e8d4d, 82e2409, ghép eo `zed_eo_data.js`): khi chạy-chém, nửa trên vẫn lấy khung đòn như hiện tại.
- Cờ `?camvk=0` để tắt (về như trước: đứng/đi/chạy tay không). `?zedmoi=0` vẫn chạy như cũ.

## Cách làm gợi ý
1. Đo điểm nắm tay phải (và tay trái) từng khung của 01-dung, 02-di, 03-chay-v4 bộ ninja (ảnh `docs/anh-goc/zed/moi/...-gif/...`; hàng đứng ở `01-dung-gif/dung`), ghi vào `neo.json` theo định dạng `[x, y, goc, sau, [tay2]]`; xem lại bằng `gan-vk/ghep-thu-vk.py` (ảnh soát, KHÔNG phải test game).
2. Chạy `docs/anh-goc/zed/dung-zed-game.py` rồi `python3 game/build.py`.
3. Sửa `game/js/zed_moi.js` cho hàng dung/di/chay dùng neo mới; lộn/trúng/chết ẩn.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ chạy script dựng ảnh, ảnh soát ghép tĩnh và `node --check`.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` rồi push lại (xung đột ở `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Không chép apiKey trong `game/js/firebase-config.js`. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
Viết `bao-cao.md` cùng thư mục (tiếng Việt dễ hiểu, mã commit, cách tắt `?camvk=0`) + ảnh soát `xem-cam-vk.png` (hàng đứng/đi/chạy × 4 vũ khí cấp 1, bộ ninja; ngang không quá 4000 điểm ảnh), push, tự dừng.
