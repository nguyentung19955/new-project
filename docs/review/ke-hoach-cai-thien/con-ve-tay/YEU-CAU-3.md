# Con vẽ tay — đợt 3: đưa 10 ảnh hiệu ứng nhỏ vào game

Làm SAU đợt 2 (đọc bao-cao.md, bao-cao-2.md cùng thư mục). Đợt 2 đã tắt / thay tạm 10 hiệu ứng này; đợt 3 thay bằng ảnh thật.
Ảnh gốc: docs/anh-goc/hieu-ung-ky-nang/dot3/. Cắt như đợt 2 / phiên hieu-ung-ky-nang (net 2, nền #00FF00, khử viền xanh).

| Ảnh gốc | Mã | Khung | Chỗ dùng (bao-cao.md mục 4) | Lưu ý |
|---|---|---|---|---|
| bot-doc.png | hu-bot-doc | 6 | bong bóng độc từ vũng / vùng độc nổ | bọt xanh lục trên nền xanh: khử cẩn thận, giữ viền đen |
| cao-quai.png | hu-cao-quai | 5 | vệt cào cận chiến (DON 'chem') | trắng → nhuộm theo quái; quay theo hướng đòn |
| lao-bui.png | hu-lao-bui | 5 | bụi + vạch tốc độ khi lao (DON 'lao') | vạch trắng ở bên TRÁI = phía sau; lật theo hướng lao |
| gai-toa.png | hu-gai-toa | 6 | vòng gai toả (DON 'gai') | trắng → nhuộm |
| tia-mom.png | hu-tia-mom | 5 | tia lấy đà bắn / ném / phun | trắng → nhuộm; quầng mờ có ám xanh nền → khử sang trắng |
| vong-hoi-quai.png | hu-vong-hoi-quai | 6 | vòng hồi máu (healFx) | VÒNG XANH NHẠT TRÊN NỀN XANH: tách theo độ sáng/viền tối, không theo màu thuần; nếu không tách sạch thì ghi vào báo cáo để gen lại nền tím |
| tuong-song.png | hu-tuong-song | 6 | tường sóng Ngư Tinh (fx.js wave) | khớp bề rộng vùng va chạm |
| khoi-doc-nho.png | hu-khoi-doc-nho | 6 lặp | khói độc quanh thân (khiDoc) | |
| hao-quang-gian.png | hu-hao-quang-gian | 6 lặp | quầng nổi giận dưới chân (noi_gian.js) | |
| tam-giac-bua.png | hu-tam-giac-bua | 6 | tam giác ấn của Tiểu Yêu (ky_nang_quai.js) | khớp đúng 3 đỉnh vùng va chạm |

- Mỗi chỗ: dùng ảnh, bỏ hình code / ảnh thay tạm của đợt 2. Ảnh chưa tải thì không vẽ gì. `?vetaycu=1` vẫn bật lại vẽ code cũ.
- Không đổi luật chơi (vùng va chạm, sát thương, thời gian). Tải theo vùng như các hu-* khác; ghi dung lượng người chơi tải trước/sau (trần 20 MB).
- KHÔNG TEST game — chỉ node --check, build.py, ảnh soát tĩnh xem-dot3.png (10 ảnh cỡ game, đã nhuộm, đặt cạnh quái dùng nó).
Ràng buộc: không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại). Xong viết bao-cao-3.md cùng thư mục, push, tự dừng.
