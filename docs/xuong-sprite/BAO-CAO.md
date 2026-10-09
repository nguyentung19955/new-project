# Báo cáo: Xưởng Sprite (công cụ tự vẽ quái và em bé)

## Đã làm

**Công cụ web** `tools/xuong-sprite/index.html` (một tệp tự chứa, tiếng Việt, chủ đề trống đồng như game; đăng thêm ở https://spiritblade.web.app/xuong-sprite.html). Năm bước:

1. **Chọn**: 36 quái (tên tiếng Việt, kèm hình code hiện tại để so), em bé (cả bốn hoặc từng bé), **Quái mới** (đặt mã và tên).
2. **Đưa hình**: kéo thả hoặc chọn ảnh PNG/JPG (ảnh chụp tranh giấy được). Tự tách nền (từ mép vào hoặc mọi chỗ cùng màu, chịu được giấy loang), bỏ đốm bẩn, bút giữ lại và cục tẩy có hoàn tác, lật hình, tự cắt sát, thu về chiều cao của quái gốc (có thanh chỉnh), giảm màu (3 đến 32 màu), viền tối 1px.
3. **Khung cơ thể**: 7 mẫu (Người, Bốn chân, Cua/bọ, Cá/chim bay, Khối mềm, Rắn, Cây). Gợi ý mẫu theo kiểu đi của quái gốc. Kéo khớp, tô bộ phận, "Tự đoán". Đổi cỡ ở bước 2 vẫn giữ chỗ đã tô.
4. **Chuyển động**: đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn (chớp trắng và giật lùi), chết (em bé thêm né lăn); quay trái/phải; nền phòng thật của vùng, em bé thật cạnh bên, hình code để so, phóng to; thanh biên độ và tốc độ.
5. **Xuất tệp**: `<mã>.sprite.json` (tấm sprite PNG dạng data URL, khung, điểm chân, khớp, bộ phận, thông số) và `<mã>.png`; **Mở tệp** để sửa tiếp; tự lưu nháp trong máy (localStorage, có bọc lỗi, đầy bộ nhớ thì bỏ ảnh gốc và báo).

**Xem trong game**: nút mở bản game thử (`xuong-sprite-thu.html`) ngay trong công cụ: vào phòng của vùng quái đó, quái dùng hình đang làm đánh nhau thật, có nút "Cho bé tự đánh" và "Gọi quái lại". Bé không chết. Trang thử tắt ghi bản lưu và lưu mây nên không đụng bản chơi thật. Quái mới tạm mượn chỗ một quái có sẵn (chọn được).

**Đưa vào game**: bỏ tệp vào `game/art/custom/`, `game/build.py` tự nhúng khi đóng gói; `game/js/sprite_custom.js` vẽ quái/em bé có tệp bằng hình tự vẽ, còn lại vẫn hình code. Hiệu ứng chém, bóng, đạn, vùng báo trước và thời lượng các đòn vẫn của game, nên luật chơi và cân bằng không đổi. Thư mục chỉ có `.gitkeep` thì bộ nạp không nối vào đâu: game y hệt trước. Chi tiết: [DUA-VAO-GAME.md](DUA-VAO-GAME.md). Cách dùng: [HUONG-DAN.md](HUONG-DAN.md).

**Đăng**: `.github/workflows/linh-khi-hosting.yml` chép thêm `xuong-sprite.html` và `xuong-sprite-thu.html` lên site. Giữ nguyên bước chặn "còn G.GRIT thì không đăng" và bước dọn giữ 2 bản.

## Kiểm tra

- `game/tests/xuong_sprite.py`: **65/65 mục đạt**. Ảnh vẽ tay giả lập trên giấy trắng loang có vết bẩn → tách nền (góc trống, giữ tròng mắt trắng), đúng cỡ, giảm màu, cục tẩy và hoàn tác, mẫu gợi ý, tự đoán đủ bộ phận, kéo khớp và tô bằng chuột, mọi khung đều có hình và có cử động, tốc độ và biên độ, tải về và mở lại tệp, nháp còn sau khi tải lại trang, em bé; xem trong game (quái mới đứng vào chỗ Cua Lính ở Hang biển, bé tự đánh, không ghi bản lưu); bỏ tệp vào `game/art/custom/`, đóng gói, vào game: Heo Rừng Con và em bé dùng hình mới ở mọi cử động, lật gương đúng, chớp trắng, chết mờ dần, quái khác vẫn hình code, thời lượng đòn như cũ, trận 4 giây không lỗi; xoá tệp thì về hình code. Cuối bài thư mục chỉ còn `.gitkeep`.
- Các bài cũ chạy lại đều đạt: rules, bao_truoc, tam_huong, ghep (109/109), ghep2, linhkhi, quai, anim_smoke, balance, ban_do, campaign, cay, cong, cung, do_roi, doors, dps, env_rooms, fuzz, fx_check, hanh_trang, mapgen, moves, perf, trang_phuc, ui_build, ui_input, ui_robust.
- `tests/may.py` báo 2 mục hỏng ("404 khi tải script" của máy chủ thử) — **bản gốc `khoi-tao-du-an` cũng hỏng y hệt** trong môi trường này, không do thay đổi lần này. `smoke.py`, `quai_tam.py` là công cụ chụp ảnh cần tham số, không phải bài kiểm tra.
- Ảnh và GIF trong thư mục này do `game/tests/xuong_sprite_shots.py` tạo.

## Ảnh

| | |
|---|---|
| Trước / sau trong phòng game | ![](truoc-sau-trong-phong.png) |
| Bước 2: tách nền | ![](buoc-2-tach-nen.png) |
| Bước 3: khung cơ thể | ![](buoc-3-khung.png) |
| Bước 4: chuyển động | ![](cong-cu-xem-chuyen-dong.gif) |
| Xem trong game | ![](xem-trong-game.png) |
| Động tác (quái, em bé) | ![](dong-tac-heo-tu-ve.gif) ![](dong-tac-em-be-tu-ve.gif) |

## Giới hạn, việc có thể làm sau

- Hình tự vẽ chỉ có một dáng gốc; động tác được tạo bằng xoay, uốn từng bộ phận nên hợp nhất với hình vẽ tách rõ tay chân. Trùm 3 pha dùng chung một hình cho cả ba pha.
- Em bé tự vẽ: vũ khí vẫn do game vẽ ở chỗ tay của em bé gốc, nên vẽ em bé tay không và dáng gần giống em bé gốc.
- Quái mới chỉ vẽ được, chưa vào trận: cần xếp vào `G.MOB_ART` (và luật nếu có) khi chủ dự án muốn.
- Nháp lưu theo trình duyệt từng máy; muốn chắc thì tải tệp về.
