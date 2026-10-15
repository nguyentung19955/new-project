# 9 hình hiệu ứng kỹ năng mới — có ảnh rồi, thay phần vẽ tạm bằng code (15/10 09:40)

Đọc trước `../ky-nang-quai-vung/PROMPT-ANH.md`, `../ky-nang-trum-rieng/PROMPT-ANH.md` và hai `bao-cao.md` cùng các thư mục đó.
Chủ dự án đã gen đủ 9 tấm (nền xanh #00FF00) ở `docs/anh-goc/hieu-ung-ky-nang/`:
| Tệp | Mã sprite | Của ai | Số khung |
|---|---|---|---|
| cau-dat-lan.png | hu-cau-dat-lan | Bọ Hung — cục đất lăn (vòng lặp) | 8 |
| vet-nhot.png | hu-vet-nhot | Ốc — vũng nhớt (lặp, nhìn từ trên) | 6 |
| vung-dien.png | hu-vung-dien | Sứa — vũng điện (1–5 âm ỉ, 6–8 bùng) | 8 |
| bua-tam-giac.png | hu-bua-tam-giac | Tiểu Yêu — lá bùa, 4–6 vòng lửa chân | 6 |
| vo-oc.png | hu-vo-oc | Ốc rút vỏ (1–2 yên, 3–4 rung, 5–6 ló ra) | 6 |
| manh-san-ho.png | hu-manh-san-ho | Ngư Tinh — mảnh san hô bay, khung 6 vỡ | 6 |
| tuong-tinh-the.png | hu-tuong-tinh-the | Cua Đá — tường tinh thể trồi/vỡ | 6 |
| vet-dau.png | hu-vet-dau | Hũ Chúa — vệt dầu loang, 4–6 ánh cam | 6 |
| nam-con.png | hu-nam-con | Nấm Chúa — nấm con mọc rồi phồng | 6 |

Việc:
1. Tách mỗi tấm bằng `tools/tach-hieu-ung` (hoặc script tương đương, khử viền xanh) thành `game/art/custom/<mã>.sprite.json`, cỡ hiển thị khớp kích thước vật đang vẽ tạm trong code (đo bán kính/độ dài từ `game/js/ky_nang_quai.js`, `chieu_trum.js`), lượng tử màu như các hiệu ứng khác, viền sắc. Vài tấm có hiệu ứng rung/tia nhỏ tách rời (vỏ ốc khung 3–4, lá bùa khung 2–3, vũng điện) — giữ vì là một phần hình.
2. Thay phần vẽ tạm bằng `G.fxAnh.ve(...)` đúng nhịp kỹ năng (lặp hay chạy một lần, mốc báo trước/ra đòn), giữ code vẽ cũ làm dự phòng khi thiếu tệp. Đối xứng khi quái quay trái. Vật nhìn từ trên (vũng nhớt/điện/dầu) phải co theo bán kính vùng thật.
3. Cờ `?fxcu=1` để dùng lại hình vẽ code cũ.
4. Ảnh soát `xem-hieu-ung.png` (9 dải khung, cỡ game ×3) + `xem-hieu-ung.gif`.
5. Dung lượng "người chơi tải" trước/sau (trần 20 MB, `build.py`); tải theo vùng nếu hệ thống tải theo vùng đã có. Phiên `quai-moi-6-con` và `trum-chet-anh` chạy song song cũng thêm ảnh.

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Pull --rebase cẩn thận, giữ thay đổi phiên khác (phiên `noi-gian-manh` có thể đang sửa js). Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
