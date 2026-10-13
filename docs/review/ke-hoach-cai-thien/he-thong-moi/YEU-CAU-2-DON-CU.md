# Yêu cầu đợt 2: XOÁ HẲN hình nhân vật/vũ khí/quần áo cũ không còn dùng (chủ dự án chốt "Xoá hẳn tệp", 13/10 12:41)

Làm SAU đợt 1 (`YEU-CAU-1-VU-KHI.md`, đọc `bao-cao-1.md`).

## Cần làm
1. Lập danh sách mọi tệp hình + code chỉ phục vụ nhân vật cũ: 4 em bé (Cu Tí, Cu Tèo, Cu Lì, Cụ Đồ... thân, đòn, `than-bo`), vũ khí vẽ cũ (`vk-<loại>-<dòng>*` ảnh AI, weapon_art.js phần vẽ các dòng), quần áo cũ (`tp-*`, outfit.js, hero_tinhlinh.js phần áo/mũ/lưng/cánh), ghép lớp (`ghep_lop.js`, `game/art/lop`) nếu chỉ dùng cho nhân vật cũ.
2. TRƯỚC KHI XOÁ: tra từng tệp còn được tham chiếu ở đâu (NPC trong làng, quái, giao diện, công cụ tools/). Cái gì còn dùng cho NPC/quái/giao diện thì GIỮ. Ghi bảng giữ/xoá trong báo cáo.
3. Xoá tệp và nhánh code chết; bỏ cờ `?zedmoi=0`, `?zed=0`, `?hethongcu=1` (luật/hình cũ không còn). Zed mới là nhân vật duy nhất.
4. Chạy `python3 game/build.py`, ghi dung lượng game trước/sau.
5. Không làm hỏng: Zed 4 bộ, 4 vũ khí cố định, nâng cấp đợt 1, lưu máy/lưu mây, đăng nhập Google, `?cloud=0`. Save cũ còn chứa mã đồ cũ phải vẫn mở được (bỏ qua mã lạ, không lỗi).

## Luật
Như đợt 1: KHÔNG TEST (chỉ `node --check`, build.py), chỉ nhánh `khoi-tao-du-an`, không master/force/PR, không chép apiKey, commit kết thúc bằng 2 dòng Co-Authored-By / Claude-Session như đợt 1.

## Khi xong
`bao-cao-2.md` (tiếng Việt: bảng xoá/giữ, dung lượng trước/sau, mã commit), push, tự dừng.
