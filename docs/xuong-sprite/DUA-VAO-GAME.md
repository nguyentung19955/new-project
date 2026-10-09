# Đưa hình tự vẽ vào game

## Phần của chủ dự án (chỉ cần gửi tệp)

1. Làm xong hình trong **Xưởng Sprite** (https://spiritblade.web.app/xuong-sprite.html), bấm **Tải về**. Máy sẽ có tệp tên dạng `cua.sprite.json` (chữ trước `.sprite.json` là mã của quái).
2. Chọn một trong hai cách:
   - **Gửi tệp cho Claude** (kèm một câu như "đưa hình này vào game"). Claude lo phần còn lại.
   - **Tự bỏ lên GitHub**: mở repo, vào thư mục `game/art/custom/`, bấm *Add file → Upload files*, kéo tệp vào, bấm *Commit changes* trên nhánh `khoi-tao-du-an`. Game tự đóng gói và đăng lên spiritblade.web.app sau vài phút.
3. Muốn bỏ hình tự vẽ, trở lại hình cũ: xoá tệp đó trong `game/art/custom/`.

Người chơi không thấy công cụ: game không có nút hay màn nào mới. Chỉ có con quái (hoặc em bé) đổi sang hình bạn vẽ.

## Phần của Claude hoặc người làm code

- Bỏ tệp vào `game/art/custom/<mã>.sprite.json`, chạy `python3 game/build.py`, kiểm tra (`python3 game/tests/xuong_sprite.py` và các bài cũ), commit, đẩy lên `khoi-tao-du-an`. Workflow `.github/workflows/linh-khi-hosting.yml` tự đăng.
- `game/build.py` đọc mọi tệp `*.sprite.json` trong thư mục, chỉ giữ phần game cần (tấm sprite và thông số động tác, bỏ phần `cong_cu` để sửa tiếp) rồi nhúng vào bản đóng gói thành `G.customSpriteData`. Tệp hỏng thì đóng gói dừng lại và báo tên tệp.
- `game/js/sprite_custom.js` (nạp ngay sau `monster_art.js`):
  - Quái có tệp: `G.monsterArt.draw` vẽ thân bằng tấm sprite; bóng, vệt chém, đạn, vùng báo trước vẫn do hình gốc vẽ. Thời lượng các cử động một lần (chuẩn bị đánh, đánh, trúng đòn, chết) lấy theo quái gốc nên luật chơi không đổi.
  - Em bé: tệp `em-be.sprite.json` thay cả bốn em bé, `em-be-smith` / `em-be-hunter` / `em-be-healer` / `em-be-wrestler` thay từng bé. Vũ khí, hào quang trang phục vẫn do game vẽ.
  - Quái mới (mã chưa có trong game): được thêm vào `G.monsterArt.list` để vẽ được, nhưng chưa xuất hiện trong trận. Muốn cho nó vào trận thì sửa `G.MOB_ART` trong `game/js/data.js` (đặt mã vào vai và vùng mong muốn) và thêm luật nếu cần.
  - Thư mục chỉ có `.gitkeep` thì game y hệt như chưa có công cụ.

## Định dạng tệp `.sprite.json`

| Khoá | Ý nghĩa |
|---|---|
| `loai`, `phien_ban` | luôn là `"linh-khi-sprite"`, `1` |
| `ma`, `ten`, `doi_tuong` | mã quái (hoặc `em-be…`), tên tiếng Việt, `"quai"` hoặc `"em-be"` |
| `thay_cho` | với quái mới: quái có sẵn mà bản game thử mượn chỗ |
| `tam` | tấm sprite PNG dạng data URL; mỗi hàng một động tác |
| `khung_rong`, `khung_cao`, `goc` | cỡ một khung và điểm chân (giữa đáy) trong khung |
| `rong`, `cao`, `bong` | cỡ hình gốc, độ rộng bóng dưới chân |
| `dong_tac` | `idle`, `move`, `tele`, `atk`, `hit`, `die` (em bé thêm `ne`): `hang`, `so` khung, `giay`, `lap`, `bien`, `toc` |
| `cong_cu` | phần để mở lại sửa tiếp trong công cụ: ảnh nguồn, chỗ sửa tay, hình pixel, khớp, bộ phận. Game không dùng |

Hình trong tệp quay mặt sang phải; game tự lật khi quái quay sang trái.
