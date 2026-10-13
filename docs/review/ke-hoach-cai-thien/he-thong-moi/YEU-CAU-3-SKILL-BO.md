# Yêu cầu đợt 3: skill riêng của 4 bộ trang phục (chủ dự án duyệt "Ok" 13/10 13:18)

Làm SAU đợt 1 (đọc `bao-cao-1.md`): gắn vào móc `G.boSkill(bo, cap)` và khung nâng bộ 3 cấp (linh khí + vàng) đã làm ở đợt 1. Mỗi cấp mở thêm skill (cấp sau giữ skill cấp trước). Skill chỉ có tác dụng khi ĐANG MẶC bộ đó.

| Bộ | Cấp 1 | Cấp 2 | Cấp 3 |
|---|---|---|---|
| Ninja (đen–đỏ) | **Bóng lướt**: lộn xong, đòn đầu tiên trong 1 giây +30% sát thương | **Phân thân**: lộn để lại một bóng (hình Zed mờ) đứng tại chỗ 1,5 giây, quái nhắm vào bóng | **Ám sát**: đánh trúng từ sau lưng quái thì chắc chắn chí mạng, hồi 4 giây |
| Thợ Săn Rừng (rêu–nâu–vàng) | **Nhựa rừng**: đứng yên ≥1 giây thì hồi 1% máu tối đa mỗi giây | **Gai độc**: quái đánh trúng Zed bị nhiễm độc nhẹ (dùng hiệu ứng độc sẵn có) | **Bẫy dây leo**: đòn mạnh (giữ rồi thả) trói chân quái trúng đòn 1,5 giây |
| Chiến Binh Biển (ngà–lam–ngọc) | **Khiên nước**: mỗi 10 giây có 1 lớp khiên chặn trọn 1 đòn | **Sóng dội**: lộn đẩy lùi quái trong bán kính ~40 | **Thuỷ triều**: khiên vỡ thì làm chậm quái gần đó 2 giây |
| Hiệp Sĩ Lâu Đài (đỏ đô–bạc) | **Giáp bạc**: giảm 10% sát thương nhận | **Phản đòn**: lộn trong 0,2 giây trước khi đòn quái trúng thì phản lại 50% sát thương đòn đó | **Khí thế**: máu dưới 30% thì +25% sát thương tới hết trận, mỗi trận 1 lần (có chữ bay báo) |

## Cần làm
- Code skill (combat/moves/stage…), hiệu ứng nhỏ bằng code hoặc tái dùng hiệu ứng có sẵn (bóng mờ, khiên, trói, chữ bay). Ghi chỗ nào cần ảnh gen thì liệt kê (để chủ dự án gen sau), kèm prompt ngắn gọn trong báo cáo.
- Giao diện nâng bộ (đợt 1) hiện tên + mô tả 1 dòng từng skill, cấp nào đã mở.
- Thêm tiếng Anh vào `tools/ngon-ngu/tu-dien` và `game/js/ngon_ngu_en.js` như các lần trước.
- Cân bằng: ghi các số trên vào một bảng hằng số dễ chỉnh (một chỗ), báo cáo nêu chỗ chỉnh.
- KHÔNG sửa `game/js/zed_moi.js` (phiên khác đang sửa); nếu bắt buộc (bóng phân thân) thì thêm tệp js mới vẽ bóng dùng hàm vẽ có sẵn.
- Cờ `?skillbo=0` để tắt toàn bộ skill bộ.

## Luật
Như đợt 1: **KHÔNG TEST** (chỉ `node --check`, build.py), chỉ nhánh `khoi-tao-du-an`, không master/force/PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/`?cloud=0`, commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao-3.md` (tiếng Việt, mã commit, bảng hằng số, danh sách ảnh cần gen + prompt), push, tự dừng.
