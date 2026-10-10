# Báo cáo: Game nét gấp đôi (độ nét Cao)

Ngày 10/10/2026.

## 1. Đã làm gì

- **Màn chơi giờ vẽ ở cỡ 960×540 điểm ảnh** (trước là 480×270). Trong code gọi là `G.NET = 2`.
  Mọi phần game vẫn vẽ theo toạ độ 480×270 như cũ. Game phóng sẵn ×2, nên mỗi điểm ảnh cũ thành một ô 2×2.
  → Hình vẽ bằng code (nền phòng, em bé vẽ code, đạn, hạt, hiệu ứng) **trông y như trước**. Chụp so trước/sau (thu bản sau về 480×270): cảnh trận đánh khác 0,00%, cảnh làng khác 0,06%. Chỗ khác rất nhỏ nằm ở các nét vẽ xiên hoặc xoay, giờ mịn hơn một chút.
- **Ảnh AI có thể nét gấp đôi**: tệp `.sprite.json` có thêm trường tuỳ chọn `"net"` (xem mục 2).
  Tệp cũ chưa có `"net"` thì hiện y hệt bây giờ.
- **Chữ, số sát thương, thanh máu, nút bấm** (lớp chữ `#ui`) giữ nguyên, không đổi.
- Đã sửa các chỗ phải tính lại theo cỡ thật: rung màn hình, trượt khi chuyển phòng, màn tối dần, bản đồ ải, cảnh làng, vùng báo trước đòn (phần chụp nền để vùng nằm dưới chân nhân vật), ảnh chụp trận gửi kèm góp ý.
  Chạm và chuột vẫn tính theo khung 480×270 nên không cần sửa.
- **Cài đặt mới ở Anh Mõ**: nút **"Độ nét: Cao / Thường"**.
  - Cao (mặc định) = nét gấp đôi.
  - Thường = như bản cũ (480×270), nhẹ hơn cho máy yếu.
  - Cài đặt được lưu trong bản lưu (`net: "thuong"`; nếu không có trường này thì là Cao). Bản lưu cũ đọc bình thường.
  - Khi tải tiến trình từ mây, độ nét vẫn giữ theo máy đang dùng (giống nút Âm thanh).
  - Đăng nhập Google, lưu mây và chơi không cần mây không đổi. Bài kiểm tra lưu mây vẫn đạt.

## 2. Định dạng "net" trong tệp .sprite.json

```
"net": 2      (số nguyên 1–4, không ghi thì là 1)
```

- Ảnh trong tệp (`"tam"` hoặc `"anh"`) có số điểm ảnh **gấp net lần**.
- **Mọi số khác vẫn tính theo điểm ảnh GAME như cũ**: `khung_rong`, `khung_cao`, `goc`, `rong`, `cao`, `bong`, `neo`, `vu_khi.cam/mui/day`, `trang_phuc.lech`… Với hiệu ứng (`hu-*`) là `khung_rong`, `khung_cao`, `goc`.
- Ví dụ: một quái có khung 64×64 điểm ảnh game, `"net": 2` thì tấm ảnh phải có mỗi khung 128×128. Còn `khung_rong` vẫn ghi 64, `goc` vẫn như cũ.
- Game cắt đúng vùng ảnh (gấp net lần) rồi vẽ ra đúng cỡ trong game. Trên màn 960×540, ảnh hiện đủ chi tiết gấp đôi.
- Đã thử: phóng ảnh của cả 36 quái và 10 kiếm lên gấp đôi rồi ghi `"net": 2`. Kết quả hiện giống hệt bản cũ (khác 0,06%, do vũ khí xoay lấy mẫu mịn hơn). Nghĩa là đọc và vẽ đúng.
- Các chỗ đã hỗ trợ "net": quái; em bé thân AI (kèm ánh viền bậc, chớp trắng hoặc nhuộm màu khi trúng đòn); người làng và vùng mặt ở khung nói chuyện; vũ khí (xoay theo góc, viền đổi màu theo bậc, dây cung); trang phục; vật phẩm (ô tài nguyên và đồ rơi trên sàn); hiệu ứng ảnh AI (`fx_anh.js`).
- **"net" dùng được cho MỌI loại tệp**: quai, em-be, nguoi-lang, vu-khi, trang-phuc (đủ 6 ô: mũ, áo, đồ lưng, đồ tay, mặt nạ, cánh), vat-pham, hieu-ung.
  Đã thử thêm từng ô trang phục và vật phẩm với ảnh `"net": 1` và cùng ảnh đó phóng gấp đôi với `"net": 2`. Em bé mặc đồ hiện giống hệt nhau, cỡ món đồ trong game không đổi.
  Tệp không có "net" chạy y như trước.
- Khi làm ảnh mới để có nét gấp đôi: dùng ảnh AI gấp 2 lần cỡ game và ghi `"net": 2`. Các trang công cụ `tools/tach-*` do phiên khác sửa. Ví dụ: trang Tách Hiệu ứng đã có lựa chọn "Độ nét Gấp đôi" và tự ghi `"net": 2`.

## 3. Chỗ nào còn 1× (chưa nét gấp đôi)

- **Trang phục khoác lên em bé** (mũ, áo, đồ lưng, cánh, mặt nạ):
  - Em bé được ghép từng điểm ảnh trong một khung nhỏ cỡ game, nên ảnh trang phục có "net" bị thu về đúng cỡ game. Cách thu: lấy điểm giữa mỗi ô net×net.
  - Vì vậy áo vẫn chỉ 11–15 điểm ảnh.
  - Muốn áo nét gấp đôi thì phải làm lại phần ghép em bé (việc lớn, chưa làm).
- **Lớp đồ khoác lên thân AI**: lấy từ khung em bé ở trên, nên cũng 1×.
- **Thân em bé vẽ bằng code, quái vẽ bằng code, nền phòng**: vẽ ở 1× rồi phóng 2×. Đây là chủ ý, để trông y như cũ.
- **Hình đồ ở túi đồ** (`hanh_trang.js`, ô 13×13) và các biểu tượng nhỏ khác: vẫn 1× như cũ.
- **Không bị giới hạn 1×**:
  - Vật phẩm ở thanh tài nguyên và biểu tượng vũ khí vẽ lên lớp chữ `#ui`. Lớp này đã nét cao sẵn, nên ảnh có "net" tự rõ hơn.
  - Đồ rơi trên sàn: hình được dựng ở độ nét G.NET.

## 4. Tốc độ khung hình (FPS) trước/sau

Đo bằng Playwright trên máy kiểm tra (không có card đồ hoạ, nên số thấp hơn điện thoại thật).
Phòng đông quái (14 quái), bot tự đánh, màn cỡ điện thoại 844×390, mật độ điểm ảnh 3.

| | Trước (480×270) | Sau (960×540) |
|---|---|---|
| CPU thường | 52,0 khung/giây | 48,3 khung/giây |
| CPU chậm 4 lần (giống máy tầm trung) | 10–18 khung/giây (đo 2 lần, dao động nhiều) | 11,5 khung/giây |

Kết luận:
- Tụt ít, nằm trong mức dao động của phép đo. Vẫn để mặc định là Cao.
- Máy nào thấy giật thì chọn "Độ nét: Thường" ở Anh Mõ để quay về y như bản cũ.
- Nên thử thêm trên điện thoại thật.

## 5. Cách dùng

- Người chơi: vào làng → Anh Mõ (cài đặt) → bấm **"Độ nét: Cao"** để đổi sang **Thường** (và ngược lại). Đổi xong có tác dụng ngay.
- Làm hình AI nét hơn: xuất ảnh gấp đôi cỡ game và ghi `"net": 2` vào tệp `.sprite.json`. Mọi số khác giữ như khi làm ảnh cỡ game.
- Người viết code: trên canvas thế giới, đừng gọi `c.setTransform(1, 0, 0, 1, x, y)`. Hãy dùng `G.wxDat(c, x, y)`, vì nó tự nhân thêm G.NET. Nếu đọc hoặc chụp điểm ảnh của canvas thế giới thì nhớ cỡ thật là 480·G.NET × 270·G.NET.

## 6. Tệp đã sửa

- `game/js/`: `engine.js`, `combat.js`, `stage.js`, `village.js`, `village_scene.js`, `bao_truoc.js`, `sprite_custom.js`, `fx_anh.js`, `do_roi.js`, `cloud.js`
- Bản đóng gói: `game/dist/*` và `tools/xuong-sprite/index.html` (do `build.py` tạo)
- Không sửa các trang `tools/tach-*`.
- Xưởng Sprite và bản game thử (`xuong-sprite.html`, `xuong-sprite-thu.html`): đã mở thử, không có lỗi.
