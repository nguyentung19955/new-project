# Yêu cầu: đưa ảnh hiệu ứng đợt 3 vào game

Ảnh: `docs/anh-goc/zed/hieu-ung/dot-3/*.png` (1 hàng khung, nền #00FF00). Ý nghĩa + mã tệp dự kiến: `docs/anh-goc/zed/hieu-ung/hu-dot-3.txt`. Chỗ đang vẽ bằng code: bảng (A) trong mục dưới.

## Cắt ảnh
Viết/dùng lại script như `docs/anh-goc/zed/hieu-ung/cat_phi_tieu.py` / `cat_tu_luc.py`: cắt THEO ĐƯỜNG VIỀN, xoá nền xanh sạch viền, ảnh trắng (K2, K7, K11, K12) đổi điểm ám xanh sang xám để game tự nhuộm. Ảnh độc (K6, K9) giữ xanh chanh thật, chỉ bỏ điểm xanh lá thuần ở mép. Xuất `game/art/custom/<mã>.sprite.json` (linh-khi-sprite, net 2) cỡ hợp với cảnh.

## Thay chỗ vẽ code (giữ code cũ làm dự phòng khi thiếu ảnh)
| Ảnh | Mã | Thay chỗ |
|---|---|---|
| K1 | hu-lon | fx.js `dodge` (bụi + vệt gió lúc lộn), lật theo hướng lộn |
| K2 | hu-xoc-toi | fx.js `dash` (Xốc tới thương), xoay theo hướng, nhuộm hệ |
| K3 | hu-song-dat | fx_he.js `drawWave` (sóng chấn búa), xoay theo hướng chạy |
| K4 | hu-nut-dat | fx_he.js `drawCrack` (Địa Chấn), lặp đoạn dọc đường nứt |
| K5 | hu-gai-bang | fx_he.js `drawSpikes` (đòn kết Băng) |
| K6 | hu-doc-toe | fx_he.js FINISH.poison (đòn kết Độc) + đích của `heSpread`/`chSpread` |
| K7 | hu-doi-vk | fx.js `swap` (đổi vũ khí), nhuộm theo hệ vũ khí mới |
| K8/K9/K10 | hu-bam-lua / hu-bam-doc / hu-bam-bang | lớp trạng thái trên thân (fx.entity ~1208-1229, hào quang độc fx_ky_nang.js ~104): cháy / trúng độc / đóng băng-lạnh; cỡ theo thân quái |
| K11 | hu-va-cham | fx_he.js `punch`, `spPin`; xung lực xuyên phi tiêu fx_dan.js `impact` |
| K12 | hu-tich-chuong | fx_chuong.js `drawCharge` (cầu tích trong tay), nhuộm hệ chưởng |
| S1 | hu-khien-nuoc | skill bộ Biển Khiên nước (khung 1–4 lặp khi còn khiên, 5–6 khi vỡ) |
| S3 | hu-song-doi | skill bộ Biển Sóng dội |
| S4 | hu-phan-don | skill bộ Lâu đài Phản đòn |
| S5 | hu-khi-the | skill bộ Lâu đài Khí thế (lặp quanh Zed, lớp sau người phần dưới) |
| S6 | hu-phan-than | skill bộ Ninja: bóng phân thân tan |
| S7 | hu-nhua-rung | skill bộ Rừng Nhựa rừng (lặp dưới chân khi đang hồi máu); ảnh xanh lá thật, chỉ bỏ điểm #00FF00 thuần ở mép |
| S8 | hu-am-sat | skill bộ Ninja Ám sát (chí mạng sau lưng), lật theo hướng đòn |
| S2 | hu-day-leo | skill bộ Rừng Bẫy dây leo (`veSan`, đoạn trói chân `e.boTroiT`) |
| H | gd-nut-danh-bow | THAY ảnh nút Đánh khi cầm phi tiêu (24×24, net 2, như tệp cũ): một phi tiêu, giữ viền đen, bỏ nền |
| I | gd-nut-dac-biet-bow | THAY ảnh nút Đặc biệt Mưa phi tiêu (24×24, net 2) |

Skill bộ do phiên đợt 3 làm (`he-thong-moi/bao-cao-3.md`): đọc báo cáo, móc ảnh vào đúng chỗ hiệu ứng skill đã làm. Làm SAU đợt 2 và đợt 3 (git pull, đọc code mới).

Cờ `?hudot3=0` để tắt (về vẽ code).

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ script cắt ảnh, `node --check`, `python3 game/build.py`.
- Không sửa `game/js/zed_moi.js` trừ khi bắt buộc.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Không chép apiKey; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` + `xem-truoc.png` (mọi khung đã cắt, phóng to, nền tối, ngang ≤ 4000) cùng thư mục, push, tự dừng.
