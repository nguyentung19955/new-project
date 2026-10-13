# Yêu cầu đợt 1: 4 vũ khí cố định, bỏ rơi đồ, nâng cấp bằng linh khí (chủ dự án chốt 13/10 12:41)

## Chủ dự án nói
"Các bộ giờ sẽ cho skill khác nhau sau khi nâng cấp, sẽ không rơi ra đồ nữa, switch vũ khí cố định 4 cái thôi." Đã chốt:
- Vũ khí: đúng 4 cái cố định — Kiếm, Thương, Búa, Phi tiêu (loại `bow` trong code). Nút đổi vũ khí xoay vòng 4 cái này.
- Nâng vũ khí bằng LINH KHÍ: Trắng → Mầm → Thành hình → Thức tỉnh (G.STAGE_NAMES / G.wStage có sẵn). Khi lên Mầm thì CHỌN hệ Lửa / Độc / Băng (được đổi hệ sau, tốn linh khí). Bỏ độ hiếm, bỏ dòng vũ khí (family) khi chơi — hình vũ khí dùng bộ zed-vk 4 loại × 4 cấp đang có.
- KHÔNG rơi đồ nữa: quái/trùm/rương không rơi vũ khí, quần áo. Phần thưởng đổi thành linh khí/vàng (giữ tổng giá trị tương đương, ghi bảng trong báo cáo).
- Trang phục: chỉ 4 bộ của Zed (ninja, Rừng, Biển, Lâu đài) — mở khoá bằng hạ trùm vùng như đang có. Bỏ cửa hàng/rơi quần áo kiểu cũ (mũ, áo, lưng, cánh...). NÂNG CẤP BỘ bằng LINH KHÍ + VÀNG, mỗi bộ 3 cấp; ĐỢT NÀY chỉ làm khung: dữ liệu cấp bộ trong save, giao diện nâng cấp (Hành trang › Nhân vật, chỗ chọn bộ), giá từng cấp, và móc rỗng `G.boSkill(bo, cap)` để đợt 3 gắn skill. Skill cụ thể làm ở đợt 3 sau khi chủ dự án duyệt.

## Save / lưu mây (QUAN TRỌNG)
- Save cũ phải mở được, không mất tiến độ: chuyển đổi một lần (`fixSave` trong engine.js): mỗi loại vũ khí lấy cấp (stage) và hệ cao nhất đang có làm cấp của vũ khí cố định; đồ thừa (vũ khí trùng, quần áo cũ) quy ra linh khí/vàng hoàn lại; ghi cờ đã chuyển để không chuyển lần hai.
- Lưu máy và lưu mây cùng định dạng mới; không đụng đăng nhập Google, `?cloud=0` vẫn chạy. Không chép apiKey.
- Cờ `?hethongcu=1` để chơi lại luật cũ (rơi đồ, nhiều vũ khí) phòng khi cần so — chỉ đọc/ghi save riêng khi bật cờ này hoặc không ghi save.

## Không làm trong đợt này
- KHÔNG xoá tệp hình cũ (đợt 2 làm). KHÔNG sửa `game/js/zed_moi.js` và các tệp `fx*.js` (phiên khác đang sửa). Chỉ ẩn khỏi giao diện những gì không còn dùng.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ `node --check`, `python3 game/build.py`.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao-1.md` cùng thư mục (tiếng Việt dễ hiểu: đã đổi gì, bảng giá nâng vũ khí/nâng bộ, bảng phần thưởng thay đồ rơi, cách chuyển save cũ, mã commit), push, tự dừng.
