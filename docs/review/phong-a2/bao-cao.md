# Báo cáo phiên Phòng A2: cửa phòng vẽ bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an`

## Đã làm xong

**1. Game đã sẵn sàng nhận ảnh AI cho cửa phòng của cả 3 vùng.**
Khi có tệp ảnh, game tự dùng ảnh thay cho hình vẽ bằng code:

- Cửa trên, cửa dưới, cửa bên, mỗi cửa hai trạng thái mở và khoá, ở Rừng già, Hang biển, Lâu đài cổ (18 hình).
- Ổ khoá đỏ báo cửa đang khoá và đầu lâu báo cửa dẫn tới Trùm (2 hình, dùng chung cho cả 3 vùng).

Hiện **chưa có tệp ảnh nào** trong game nên phòng chơi vẫn **y như cũ**. Lối chơi, bản lưu, đăng nhập Google, lưu mây đều không bị đụng tới.

Những thứ game vẫn tự vẽ đè lên ảnh cửa: ánh sáng tràn từ cửa mở vào sàn, mũi tên chỉ lối, vạch đỏ ở ngưỡng cửa khoá, ổ khoá, xích vàng, đầu lâu.

**2. Trang công cụ có thêm 4 lô cửa**
Địa chỉ: https://spiritblade.web.app/tach-phong.html

- Cửa · Rừng già · 6 hình
- Cửa · Hang biển · 6 hình
- Cửa · Lâu đài cổ · 6 hình
- Cửa · ổ khoá và đầu lâu · 2 hình

Mỗi lô cửa là một tấm ảnh lưới 3 cột × 2 hàng: cột là cửa trên, cửa dưới, cửa bên; hàng trên là cửa mở, hàng dưới là cửa khoá.

Ở bước 4 có phần **xem thử**: một phòng mẫu của đúng vùng đó, có đủ 4 cửa, do chính code của game vẽ. Nút **Đổi cửa** cho xem lần lượt: 4 cửa mở, 4 cửa khoá, cửa khoá dẫn tới Trùm (có đầu lâu và xích vàng).

**3. Prompt vẽ** nằm ở `docs/review/phong-a2/PROMPT.md` (chép nguyên từ trang công cụ). Mỗi prompt đã ghi bảng màu gỗ, đá, kim loại, bóng theo bảng màu chung và viền `#14182e`.

## Bạn cần làm gì tiếp

1. Mở trang công cụ trên iPhone, chọn một lô cửa, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Lưu tấm ảnh ChatGPT vẽ, đưa vào bước 2 của trang (nhớ chọn đúng lô trước).
3. Nhìn bước 3 có chữ **ĐẠT**, rồi xem thử ở bước 4, bấm **Đổi cửa** để xem cả mở lẫn khoá.
   - Cửa to hoặc nhỏ quá: chạm vào hình đó ở bước 3, bấm **To hơn** / **Nhỏ hơn**.
   - Cửa đứng lệch: bấm **Sang trái** / **Sang phải**.
4. Ưng thì bấm **Tải tất cả (.zip)** và gửi tệp .zip cho Claude để đưa vào game.

Nên làm lô Lâu đài cổ trước. Lô ổ khoá và đầu lâu làm sau cùng cũng được: chưa có thì game vẫn vẽ ổ khoá đỏ bằng code lên trên ảnh cửa.

## Đã kiểm

- Kiểm lỗi gõ mọi tệp code game, bài kiểm tra lưu mây, gói game: đều qua. Các lần đẩy lên đều xanh.
- **Không có tệp thì game không đổi:** vẽ phòng 4 cửa ở cả 3 vùng, 3 kiểu cửa (mở, khoá, cửa Trùm), phòng thường và phòng Trùm, 2 thời điểm (36 khung hình) bằng bản trước và bản sau khi sửa: **khác 0 điểm ảnh**.
- Một lượt thử tự động với 4 tấm ảnh lưới mẫu máy tự dựng: cả 4 lô tách ra **ĐẠT**, đủ 20/20 hình, tệp nào cũng ghi độ nét gấp đôi (`"net": 2`), tải ra đủ 2 bản (nét cao + thường).
- Nạp tạm 20 tệp đó vào game (không lưu vào repo): cửa hiện đúng chỗ trên sàn rộng 300 mới (sàn x 80–380, cửa trên và dưới ở x 230, cửa bên ở y 154), đúng cỡ, không có lỗi. Đã soi từng điểm ảnh ở góc cửa trên, đáy cửa dưới, đỉnh song cửa dưới, và mũi nhọn của cửa bên: cửa tường trái mũi chĩa sang phải, cửa tường phải được lật nên mũi chĩa sang trái. Vào một ải thật (Lâu đài cổ) cũng hiện đúng.
- Gỡ 20 tệp ra thì game về y như cũ (36 khung, khác 0 điểm ảnh).
- Trang vừa màn hình điện thoại (rộng 390), không phải cuộn ngang.
- Ảnh chụp: `docs/review/phong-a2/anh-kiem.png`.

Lưu ý: hình trong ảnh chụp là **hình khối mẫu máy tự dựng để thử**, không phải tranh thật (ổ khoá mẫu cố ý tô vàng, đầu lâu mẫu mắt xanh để dễ phân biệt với bản code). Chưa thử với ảnh ChatGPT thật, nên lần đầu bạn dùng có thể cần chỉnh nhẹ (cắt mép, chạm bỏ khung thừa, đổi cỡ).

## Vài điều nên biết

- **Ảnh cửa khoá không có ổ khoá.** Prompt dặn ChatGPT không vẽ ổ khoá, đầu lâu, xích; game tự vẽ đè lên để cả 3 vùng dùng chung một dấu hiệu "đang khoá".
- **Cửa bên chỉ vẽ một cái** (cho tường trái). Game tự lật ngang cho tường phải.
- **Cửa bên phải cao và hẹp** (16×48). Nếu ChatGPT vẽ cửa bên quá mập, hình sẽ bị thu nhỏ và ngắn hơn lối đi: khi đó bấm **To hơn**, hoặc nhờ ChatGPT vẽ lại hẹp hơn.
- **Hai trạng thái của cùng một cửa** là hai tệp riêng. Thiếu tệp nào thì trạng thái đó vẫn vẽ bằng code, nên nên đưa đủ cả cặp để khỏi lệch kiểu.
- **Cửa dưới khi khoá:** phần song chắn nhô lên sàn sẽ che chân nhân vật đứng sát cửa, giống bản code.
- **Dung lượng:** phiên này không thêm ảnh nào (0 MB). Khi có đủ 20 ảnh thật, ước dưới 0,1 MB.

## Chỗ tự quyết (chưa rõ nên chọn cách hợp lý)

- **Ảnh cửa được vẽ thẳng mỗi khung hình, không vẽ sẵn vào nền phòng.** Nền phòng của game dựng sẵn ở độ nét thường; nếu vẽ ảnh cửa vào đó thì ảnh nét gấp đôi bị thu lại và mất nét. Vẽ thẳng thì cửa giữ đủ độ nét. Mỗi khung chỉ thêm tối đa vài lần dán ảnh nên không nặng máy.
- **Cỡ khung của từng dạng cửa:** cửa trên 40×40, cửa dưới 46×28, cửa bên 16×48 (kế hoạch ghi chung "ô 48×48"; số cụ thể lấy theo hình code). Cửa bên code cũ dày 14, cho phép ảnh rộng 16 để ChatGPT dễ vẽ hơn.
- **Chỗ đặt:** cửa trên đặt đáy ở mép trên sàn; cửa dưới đặt đáy ở mép ngoài tường dưới; cửa bên đặt giữa bề dày tường, chính giữa lối đi.
- **Nền lối đi và ánh sáng** (mảng tối trong khe tường, ánh sáng hắt ra) vẫn do code vẽ bên dưới ảnh, nên ảnh cửa dưới và cửa bên có chỗ trong suốt cũng không lộ tường.
- **Viên ngọc xanh/đỏ trên đỉnh cổng Lâu đài** là một phần của hình code nên đưa vào prompt như một "nét lạ" của cổng.
- **Xích vàng** (cửa còn chờ điều kiện) vẫn vẽ bằng code, kế hoạch không yêu cầu ảnh.
- **Sửa nhân tiện ở trang công cụ:** khung xem thử của lô đồ vật (phiên A1) đang cắt theo sàn cũ rộng 208, nên sau Đợt 2 bị mất cột đồ vật bên trái. Đã cho khung xem thử tính theo sàn 300 mới và rải đồ vật đều theo bề ngang sàn. Lô đồ vật không đổi gì khác.
- **Phiên bảng màu (Đợt 4) chạy song song:** lúc phiên này đẩy lên chưa thấy thay đổi nào của Đợt 4 trên trang Tách Phòng. Đoạn bảng màu trong prompt cửa do phiên này tự viết theo `bang-mau.json`; nếu Đợt 4 thêm đoạn bảng màu chung thì cần xem lại để không lặp hai lần.

## Cho phiên A3 (và A4) dùng tiếp

- Lô cửa nằm sau lô đồ vật trong mảng `LO` (`tools/tach-phong/index.html`), sinh từ mảng `CUA`. Prompt: `promptCua`, `promptCuaNho`; `taoPrompt` rẽ nhánh ở đầu hàm.
- Xem thử lô cửa: `xem: 'cua'`, `vung` là số vùng; `phongMau` dựng phòng 4 cửa theo `CUA_TT`.
- Trong game (`room_art.js`): `gdA(mã)` hỏi ảnh; `veAnh(ảnh, x, y, lật, h0, h1)` vẽ ảnh ở cỡ thật, có lật ngang và cắt dải ngang. Hình cần nét gấp đôi thì đừng vẽ vào nền dựng sẵn: gọi `song(() => veAnh(...))` lúc dựng phòng, lệnh được ghi vào `room.cuaNen` (dưới nhân vật) hoặc `room.cuaTruoc` (đè lên nhân vật) và chạy mỗi khung. A3 có thể dùng lại cho đồ trang trí.
- Bộ nhớ đệm phòng tự xoá khi số ảnh `gd-cua-*` sẵn sàng thay đổi (đã có từ A1).

## Tệp đã thêm / sửa

- `game/js/room_art.js`: thêm `gdA`, `song`, `veAnh`, `cuaAnh`; `padlock` và `skull` hỏi ảnh trước; `buildRoom` thử ảnh trước khi gọi `T.door`; lớp sống và `roomFore` chạy các lệnh vẽ ảnh cửa.
- `tools/tach-phong/index.html`: 4 lô cửa, prompt, xem thử cửa, khung xem thử theo sàn 300.
- `game/dist/*`, `tools/xuong-sprite/index.html`: do `build.py` tạo lại.
- `docs/review/phong-a2/`: báo cáo này, `PROMPT.md`, `anh-kiem.png`.
