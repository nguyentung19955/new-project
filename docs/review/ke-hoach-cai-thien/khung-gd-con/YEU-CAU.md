# Khung giao diện còn vẽ bằng code → ảnh (9 khung)

Chủ game: "các khung bao ngoài mà vẽ tay cũng không cần nữa". Ảnh gốc (nền #00FF00): docs/anh-goc/giao-dien/dot2/.
Làm như các khung gd-* đã có (xem gd-khung-bang.sprite.json: loai linh-khi-sprite, doi_tuong giao-dien, rong/cao, net 2, vien [t,r,b,l], lap_canh)
và ảnh gốc / bản cắt ở docs/anh-goc/giao-dien/ (gd-khung-bang-goc.png → gd-khung-bang.png). Khử viền xanh kỹ; giữ lòng tối đúng màu.

| Ảnh gốc | Mã | Thay cho (ui_theme.js / tệp) | Kiểu |
|---|---|---|---|
| khung-nho.png | gd-khung-nho | T.plate (tooltip T.endFrame, dòng thông báo stage.js, nền bản đồ nhỏ MM.draw, HUD linh khí, nhãn tinh anh, nút túi) | 9 mảnh; lòng xanh đậm → cho lòng bán trong suốt nếu chỗ dùng cần |
| dai-thong-bao.png | gd-dai-thong-bao | T.toast / toastFit / popup luc_chien | 3 mảnh ngang (2 đầu nhọn giữ nguyên) |
| o-con-2-trang-thai.png | gd-o-con, gd-o-con-chon | T.inset (hanh_trang, village, upgrade, chuong_ui) | 9 mảnh, trái = thường, phải = chọn (có quầng vàng) |
| the-nho.png | gd-the-nho | chip kháng/yếu dưới thanh trùm (stage.js drawHud) | 3 mảnh ngang, màu trắng → code nhuộm |
| khung-vach-lk.png | gd-khung-vach-lk | vỏ 3 thanh linh khí + vạch mốc (linhkhi.js LK.hud, LK.panel) | 3 mảnh ngang; 3 vạch trên viền: vẽ vạch theo mốc thật bằng phần cắt riêng nếu cần |
| thanh-cuon.png | gd-thanh-cuon (rãnh), gd-thanh-cuon-num (nút) | thanh cuộn hanh_trang.js | 3 mảnh dọc |
| khung-canh-bao.png | gd-khung-canh-bao | hộp cảnh báo đỏ ép đồ (ep_do.js E.panel) | 9 mảnh |
| the-sap-co-a.png / -b.png | gd-the-sap-co | thẻ "Sắp có" trên bản đồ vùng (village.js mapScreen) | chọn bản hợp cỡ (b gọn hơn, a to có xích); chữ vẽ đè bằng code |
| khung-mau-quai.png | gd-khung-mau-quai | thanh máu nhỏ trên đầu quái thường / tinh anh (stage.js mobBars) | 3 mảnh ngang; rất nhỏ trong game — giữ đọc rõ, nếu nhòe thì đơn giản hoá đầu mút |

- Cờ cũ `?khunganh=0` vẫn bật lại vẽ code. Ảnh chưa tải thì vẽ code như cũ (dự phòng), giống các gd-* hiện có.
- Không đổi bố cục / vùng chạm; chữ, màu lòng thanh (máu, linh khí) vẫn vẽ code như cũ.
- Ghi dung lượng người chơi tải trước/sau (trần 20 MB).
- KHÔNG TEST game — chỉ node --check, build.py, ảnh soát tĩnh xem-khung.png (mỗi khung ở cỡ game, cạnh bản code cũ, vài cỡ kéo giãn).
Ràng buộc: không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md cùng thư mục, push, tự dừng.
