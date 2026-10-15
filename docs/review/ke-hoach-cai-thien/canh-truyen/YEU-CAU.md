# Cảnh truyện bằng ảnh + lời truyện theo mạch trống đồng

Đọc trước: docs/cot-truyen/CHUNG.md (khung truyện đã duyệt: trống đồng vỡ, Thuồng Luồng dưới sông, truyện MỞ).
Ảnh gốc (1672×941, 16:9) ở docs/anh-goc/truyen/:
| Tệp | Cảnh | Thay nền code `nen` trong game/js/truyen.js |
|---|---|---|
| b1-trong-vo-cay-da-ua.png | mở đầu: cây đa úa, trống đồng vỡ | 'cayda' |
| b2-ba-yeu-tinh.png | ba yêu tinh thức dậy | 'yeu' |
| b2b-bong-duoi-song.png | bóng Thuồng Luồng dưới sông + mảnh trống chìm (bản v2 là dự phòng, KHÔNG dùng) | MỚI: thêm 1 trang sau 'yeu' |
| b3-ba-ban-bi-bat.png | ba bạn bị bắt | 'emBe' |
| b6-nen-lang.png | nền làng chung | 'lang' (và mọi trang nền làng) |
| (chưa có) B4 trao vũ khí → 'cuti'; B5 hội làng → 'hoi' | giữ nền code cũ tới khi có ảnh; làm sẵn chỗ để chỉ cần thả tệp vào |
| hac-long-tao-hinh.png | ảnh chốt tạo hình trùm vùng 8 — CHỈ LƯU, không đưa vào game |

1. Ảnh: thu về cỡ hợp lý (vẽ nét cao trên lớp #ui để giữ chi tiết, hoặc 960×540), WebP + dự phòng; TẢI LƯỜI (chỉ tải khi mở truyện,
   không vào gói tải đầu). Ghi dung lượng người chơi tải trước/sau (trần 20 MB; bản một tệp trần 30 MB — nếu vượt thì để ảnh truyện ngoài bản một tệp).
   Hiệu ứng nhẹ: trượt chậm / phóng nhẹ (Ken Burns) + chữ trên dải tối dưới ảnh; chữ không lệch khung (dùng hàm chung của phiên chu-lech-khung nếu đã có).
2. Lời truyện (VI + EN trong ngon_ngu_en.js nếu truyện có bản EN): sửa theo mạch trống đồng — làng giữ trống đồng trấn yêu; Thuồng Luồng
   dưới sông đập vỡ trống, hút linh khí cây đa qua rễ, đánh thức ba yêu tinh; mỗi trùm vùng giữ một mảnh trống; trang mới b2b gợi bóng dưới sông.
   Đoạn kết (KET): ba mảnh trống trở về, trống vẫn chưa lành, câu cuối gợi dòng sông (thay "yêu tinh có thể thức dậy mạnh hơn"),
   vẫn giữ lời mời Độ khó 2 của Chú Lái Đò. Lời giữa các vùng (VUNG): thêm ý "lấy lại một mảnh trống". Câu ngắn, giọng kể cho trẻ con như cũ.
3. Không đổi luồng game (khi nào truyện hiện, nút bỏ qua). Cờ `?truyencu=1` → nền code + lời cũ.
- KHÔNG TEST game — chỉ node --check, build.py, ảnh soát tĩnh xem-truyen.png (mỗi trang: ảnh + chữ ở cỡ game, VI và EN).
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md cùng thư mục, push, tự dừng.
