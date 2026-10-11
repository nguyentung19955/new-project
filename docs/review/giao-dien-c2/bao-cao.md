# Báo cáo phiên C2: 30 biểu tượng nhỏ dùng được ảnh AI, biểu tượng tinh anh to hơn

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn C (Giao diện)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **30 biểu tượng nhỏ**, và **biểu tượng trên đầu quái tinh anh đã to lên** (từ ô 9×9 lên hình 12×12 trên ô nền 13×13) như bạn dặn lúc 10:33. Chưa có tệp ảnh nào nên mọi màn khác **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Đã làm

**1. Biểu tượng tinh anh to hơn (thấy ngay, không cần ảnh)**

Ảnh trước/sau, tinh anh "Nổ khi chết", màn 844×390: `tinh-anh-truoc-sau.png` (trái là cũ, phải là mới; hàng dưới phóng to quanh đầu quái).

- Hình to lên 12×12, ô nền 13×13. Hai biểu tượng cạnh nhau vẫn cách nhau 2 điểm như cũ.
- Vẽ lại cả 6 hình cho hợp cỡ mới: sét (Nhanh), khiên (Giáp), bom (Nổ), giọt máu (Hút máu), gai, khiên nứt (vỡ giáp).
- Hai chỗ tôi đổi thêm cho dễ nhìn: **quả bom** màu xám sáng hơn (bản cũ đen trên nền đen, gần như không thấy); **gai** vẽ thành ba mũi gai (bản cũ là một vạch đứng, dễ lẫn với dấu "!" sắp ra đòn).
- Huy hiệu hệ (ô vuông nhỏ báo quái đang dính Lửa/Độc/Băng) nhích lên trên hàng biểu tượng, để không che nhau. Bản cũ hai thứ này đè lên nhau một chút.

**2. Game đọc được ảnh cho 30 biểu tượng**

Có tệp thì dùng ảnh, thiếu tệp nào thì riêng hình đó vẫn vẽ như cũ. Không cần vẽ đủ 30 mới dùng được.

| Biểu tượng | Mã tệp | Hiện ở đâu |
|---|---|---|
| 3 hệ Lửa, Độc, Băng | `gd-he-fire`, `-poison`, `-ice` | vạch linh khí trong trận, hành trang, màn kết quả, trang hướng dẫn |
| Em bé đang cháy, dính độc, bị băng | `gd-tt-chay`, `-doc`, `-bang` | ô trạng thái của em bé, góc trên trái màn chơi |
| Bị trói | `gd-tt-troi` | trên đầu trùm khi bị trói (xem "Nên biết") |
| Tinh anh: Nhanh, Giáp, Nổ, Hút máu, Gai | `gd-quai-nhanh`, `-giap`, `-no`, `-hut`, `-gai` | trên đầu quái tinh anh |
| Sắp ra đòn | `gd-quai-sap-danh` | cạnh đầu quái ngay trước khi đánh |
| Túi hành trang | `gd-tui` | nút Hành trang |
| Ổ khoá (khoá, mở), dấu tích | `gd-khoa`, `gd-khoa-mo`, `gd-tich` | hành trang, hàng xén |
| Sao đạt, sao chưa đạt | `gd-sao`, `gd-sao-rong` | màn kết quả qua ải |
| Huy chương hạng 1, 2, 3 | `gd-huy-chuong-1`, `-2`, `-3` | bảng vàng |
| Khiên | `gd-khien` | trên đầu em bé khi có khiên đầu phòng |
| Chấm than "có việc mới" | `gd-cham-than` | trên đầu người làng |
| Bùa Lửa, Độc, Băng | `gd-bua-fire`, `-poison`, `-ice` | nút bùa ở Rương báu và Thương nhân |
| Ngọc Lửa, Độc, Băng | `gd-ngoc-fire`, `-poison`, `-ice` | bảng Cây chưởng |

**3. Trang công cụ** https://spiritblade.web.app/tach-giao-dien.html

- Lô mới ở cuối danh sách: **Biểu tượng nhỏ · 30 hình**, lưới 6×5.
- Prompt một đoạn tiếng Việt, dán thẳng ChatGPT: thứ tự 30 ô, nghĩa và "nét lạ" của từng hình, cỡ trong game, bảng màu (ba hệ, kim loại, vải, gỗ), viền `#14182e`, nền hồng tím. Bản đầy đủ: `PROMPT.md` cùng thư mục.
- Bước 4 **xem thử**: từng hình đặt đúng chỗ, đúng cỡ như trong game, phóng to 4 lần. Phần này không cần mạng.

## Bạn cần làm gì tiếp

1. Mở game xem thử một tinh anh. Nếu thấy biểu tượng vẫn bé hoặc quá to thì nhắn, đổi cỡ chỉ là sửa một con số.
2. Mở trang công cụ, chọn lô **Biểu tượng nhỏ · 30 hình**, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
3. Đưa ảnh vào bước 2, xem thử ở bước 4, ưng thì bấm **Tải tất cả (.zip)** và gửi cho Claude.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

| Việc kiểm | Kết quả |
|---|---|
| Ảnh lưới mẫu 6×5 đưa vào trang công cụ | **ĐẠT**, tìm được 30/30 hình, mọi tệp ghi `"net": 2`, ảnh đúng gấp đôi cỡ trong game |
| Game không có tệp, so bản ngay trước phiên này với bản mới, 844×390, 11 cảnh (trận, quái bị trói, làng, hành trang 2 thẻ, hàng xén, bảng vàng, cây chưởng, màn kết quả, thương nhân, rương báu) | **khác 0 điểm ảnh** ở cả 11 cảnh |
| Hai cảnh tinh anh (một biểu tượng; hai biểu tượng + dấu sắp đánh) | **có khác, là thay đổi cố ý**: chỉ khác quanh đầu quái (biểu tượng to hơn, huy hiệu hệ nhích lên) |
| Nạp tạm 30 tệp mẫu vào game | hình hiện đúng chỗ, đúng cỡ ở mọi cảnh trên |
| Gỡ tệp mẫu ra | game về đúng như lúc đầu, khác 0 điểm ảnh |
| Lỗi JavaScript | không có (game, bản gói, trang công cụ) |
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |
| Workflow đăng web | xanh cho cả hai lần đẩy (game, công cụ) |

Ảnh kiểm: `anh-kiem.png`. Từ trên xuống: tinh anh trước/sau (cả màn, phóng to, rồi cảnh hai biểu tượng); sau đó mỗi cảnh một hàng, **bên trái là cả màn khi có tệp mẫu** (khung vàng quanh chỗ đổi), **bên phải là từng chỗ đổi phóng to, mỗi cặp: hình code cũ | ảnh mẫu**; cuối cùng là bước 4 của trang công cụ.

Lưu ý: hình trong ảnh kiểm là **hình mẫu máy tự vẽ để thử** (giọt màu, ô vuông, đĩa tròn), không phải tranh thật. Không có ảnh nào được thêm vào `game/art/custom`.

Chạy lại: `python3 docs/review/giao-dien-c2/kiem.py <thư mục bản code cũ>`.

## Nên biết

- **Dấu trói (`gd-tt-troi`) gần như không hiện.** Em bé không bao giờ bị trói. Trên đầu quái thì Đợt 7 (vừa đẩy lên) đã bỏ các dấu trạng thái, nên dấu trói chỉ còn hiện trên đầu **trùm**, hoặc khi tắt tính năng "trạng thái trên thân". Vẽ hay bỏ ô này đều được. Đợt 7 cũng chưa vẽ gì trên thân quái cho trạng thái bị trói, nên hiện quái thường bị trói không có dấu hiệu nào.
- **Cháy, độc, băng trên đầu quái:** tôi không đụng (Đợt 7 đã chuyển lên thân quái). Ba ảnh `gd-tt-chay/doc/bang` chỉ dùng cho ô trạng thái của em bé.
- **Bản mờ không cần vẽ.** Biểu tượng hệ chưa đạt mốc và viên ngọc chưa bật: game tự làm xám từ chính ảnh của bạn.
- **Huy chương:** bạn vẽ mặt trơn, game tự viết số 1, 2, 3 lên giữa.
- **Lá bùa:** hiện nay nút bùa ở Rương báu và Thương nhân chỉ có chữ. Có ảnh thì hình lá bùa hiện phía trên chữ. Bình máu và quặng ở hai bảng đó tôi chưa thêm hình (đã có ảnh `vp-` sẵn, thêm vào là đổi màn hình ngay cả khi không có tệp mới, nên để phiên sau quyết).
- **Nhấp nháy:** khi dùng ảnh, tia lửa đầu ngòi bom đứng yên. Biểu tượng gai và dấu sắp ra đòn vẫn nhấp nháy (mờ, rõ) để báo nguy hiểm.
- **Sao:** chỉ thay ba ngôi sao ở màn kết quả. Các chỗ sao nằm lẫn trong dòng chữ (bảng vàng, tranh bản đồ) vẫn là ký tự chữ.
- **Dấu "!" sắp ra đòn** dịch sang phải 2 điểm khi quái có biểu tượng (vì ô to hơn). Quái không có biểu tượng thì ở chỗ cũ.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Nhích huy hiệu hệ lên 8 điểm** khi quái đang có biểu tượng đặc tính. Không làm thì biểu tượng to mới bị che gần hết mỗi khi tinh anh dính Lửa/Độc/Băng.
2. **Đổi màu bom, đổi hình gai** như đã nói ở trên. Nếu bạn muốn giữ nguyên dáng cũ, chỉ phóng to, nhắn là đổi lại được.
3. **Phần xem thử của lô này do trang công cụ tự vẽ**, không dùng code game như lô bản đồ và lô nút. Lý do: muốn dùng code game phải sửa `game/build.py`, mà luật chung không cho làn C sửa tệp đó. Số đo (chỗ đặt, cỡ) chép đúng từ game.
4. **Lá bùa đặt cỡ 24×24**, to hơn các hình khác trong lô (7 đến 13), vì nó nằm trên nút to.
5. Móc một dòng vào `art.js` (`A.status`) chỉ cho dấu trói, không đụng phần cháy/độc/băng.

## Chưa làm, chưa thử

- Chưa thử trên iPhone thật và chưa thử với ảnh ChatGPT thật. Hình rất nhỏ nên lần đầu có thể cần chỉnh ở bước 3 (nút "Nhỏ hơn / To hơn") hoặc nhờ ChatGPT vẽ lại vài ô.
- Chỉ chụp ở 844×390. Không chạy bộ test dài (theo lời dặn).
- Trong lúc làm có Đợt 7 đẩy lên cùng tệp `mobs.js`. Đã gộp, giữ cả hai phần, rồi chạy lại toàn bộ lượt kiểm trên bản đã gộp.

## Dung lượng

Không thêm ảnh nào. Bản gói tăng khoảng 8 KB (10.529.642 → 10.538.041 byte). Khi bạn gửi đủ 30 hình, ước chừng thêm dưới 40 KB (ước lượng, chưa đo).

## Cho người làm kỹ thuật

- Mỗi chỗ móc hỏi `SC.gdSan(mã)` ngay lúc vẽ rồi gọi `SC.veGd`; không có bộ nhớ đệm nào giữ ảnh nên ảnh nạp xong lúc nào hiện lúc đó, gỡ ra thì về hình code.
- `linhkhi.js`: `LK.icon` (ảnh `gd-he-*`), `LK.gdMo(g)` làm bản xám (dùng chung cho `chuong_ui.js` `orb`), `badges` cộng 8 khi `G.mobIconN(e) > 0`.
- `mobs.js`: `icon()` vẽ từ bảng điểm ảnh 12×12 (`IC_BM`, `IC_PAL`) hoặc ảnh `gd-quai-<loại>`; `IC_CO = 13`, bước giữa hai tâm `IC_BUOC = 15`; hình 12×12 đặt lệch nửa điểm game để nằm giữa ô 13×13 (màn nét gấp đôi). "Vỡ giáp" vẫn lấy khung của `hu-pha-giap`, nay thu vừa 12×12. `G.mobIconCo`, `G.mobIconN` cho bài kiểm tra và `linhkhi.js`.
- `stage.js`: HUD trạng thái em bé (`gd-tt-*`), sao kết quả, bùa ở `panelChest` và `panelMerchant`. `hanh_trang.js` `bagIcon`; `ban_do.js` `lockIcon`, `tick`; `bang_vang.js` `medal`; `hero_tinhlinh.js` `shield`; `village_scene.js` `bang`; `chuong_ui.js` `orb`; `art.js` `A.status` (chỉ nhánh trói).
- Trang công cụ: mảng `NHO` (mã, tên, rộng, cao, mô tả), lô `id: 'nho'` có `xemNho: true` và `bm` riêng; `veXemNho()` vẽ bước 4.
- Xung đột khi `git pull --rebase`: `game/dist/*` (chạy lại `python3 game/build.py`) và một đoạn trong `mobs.js` (giữ khối dấu "!" mới của C2 và dòng `if (!TR) A.status(...)` của Đợt 7).
