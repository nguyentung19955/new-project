# Đưa hình tự vẽ vào game

## Phần của chủ dự án (chỉ cần gửi tệp)

1. Làm xong hình trong **Xưởng Sprite** (https://spiritblade.web.app/xuong-sprite.html), bấm **Tải về**. Máy sẽ có tệp tên dạng `cua.sprite.json` (chữ trước `.sprite.json` là mã của quái).
2. Chọn một trong hai cách:
   - **Gửi tệp cho Claude** (kèm một câu như "đưa hình này vào game"). Claude lo phần còn lại.
   - **Tự bỏ lên GitHub**: mở repo, vào thư mục `game/art/custom/`, bấm *Add file → Upload files*, kéo tệp vào, bấm *Commit changes* trên nhánh `khoi-tao-du-an`. Game tự đóng gói và đăng lên spiritblade.web.app sau vài phút.
3. Muốn bỏ hình tự vẽ, trở lại hình cũ: xoá tệp đó trong `game/art/custom/`.

Người chơi không thấy công cụ: game không có nút hay màn nào mới. Chỉ có con quái (em bé, món đồ, người làng) đổi sang hình bạn vẽ.

## Phần của Claude hoặc người làm code

- Bỏ tệp vào `game/art/custom/<mã>.sprite.json`, chạy `python3 game/build.py`, kiểm tra (`python3 game/tests/xuong_sprite.py` và các bài cũ), commit, đẩy lên `khoi-tao-du-an`. Workflow `.github/workflows/linh-khi-hosting.yml` tự đăng.
- `game/build.py` đọc mọi tệp `*.sprite.json` trong thư mục, chỉ giữ phần game cần (tấm sprite và thông số động tác, bỏ phần `cong_cu` để sửa tiếp) rồi nhúng vào bản đóng gói thành `G.customSpriteData`. Tệp hỏng thì đóng gói dừng lại và báo tên tệp.
- `game/js/sprite_custom.js` (nạp ngay sau `monster_art.js`):
  - Quái có tệp: `G.monsterArt.draw` vẽ thân bằng tấm sprite; bóng, vệt chém, đạn, vùng báo trước vẫn do hình gốc vẽ. Thời lượng các cử động một lần (chuẩn bị đánh, đánh, trúng đòn, chết) lấy theo quái gốc nên luật chơi không đổi.
  - Em bé: tệp `em-be.sprite.json` thay cả bốn em bé, `em-be-smith` / `em-be-hunter` / `em-be-healer` / `em-be-wrestler` thay từng bé. Vũ khí, hào quang trang phục vẫn do game vẽ.
  - Quái mới (mã chưa có trong game): được thêm vào `G.monsterArt.list` để vẽ được, nhưng chưa xuất hiện trong trận. Muốn cho nó vào trận thì sửa `G.MOB_ART` trong `game/js/data.js` (đặt mã vào vai và vùng mong muốn) và thêm luật nếu cần.
  - Thư mục chỉ có `.gitkeep` thì game y hệt như chưa có công cụ.

## Đồ: vũ khí, trang phục, vật phẩm

Cùng thư mục `game/art/custom/`, cùng cách gửi. Mã tệp cho biết món nào được thay:

| Mã | Thay cho |
|---|---|
| `vk-<loại>-<dòng>` (ví dụ `vk-sword-3`) | cả dòng vũ khí đó, mọi hệ, mọi giai đoạn. Loại: `sword` kiếm, `bow` cung, `spear` giáo, `hammer` búa; dòng 0 đến 9 |
| `vk-<loại>-<dòng>-<hệ>-<giai đoạn>` (ví dụ `vk-bow-0-fire-2`) | riêng hệ `fire`/`poison`/`ice` ở giai đoạn 1 Mầm, 2 Thành hình, 3 Thức tỉnh; có tệp riêng thì dùng tệp riêng, không thì dùng tệp cả dòng |
| `tp-<ô>-<hình>` (ví dụ `tp-hats-non_la`, `tp-wings-lua`) | một hình trang phục trong `G.heroLooks`: ô `hats`, `robes`, `backs`, `hands`, `masks`, `wings` |
| `vp-<loại>` (ví dụ `vp-gold`, `vp-potion`, `vp-linhkhi-fire`, `vp-ore`, `vp-stone`, `vp-mat0`, `vp-shard2`, `vp-xp`) | đồ rơi trên sàn và biểu tượng tài nguyên ở mọi chỗ: dải tài nguyên góc trên, Hành trang, giá bán và giá rèn |
| `nl-<người>` (`nl-lai` Chú Lái Đò, `nl-ren` Ông Thợ Rèn, `nl-xen` Bà Hàng Xén, `nl-may` Cô Thợ May, `nl-do` Cụ Đồ, `nl-tu` Ông Từ, `nl-mo` Anh Mõ) | người làng trong làng, khuôn mặt ở dải lối tắt, người to trong khung nói chuyện |

Cách game dùng (`game/js/sprite_custom.js`, chỉ nối vào khi có tệp):
- **Vũ khí**: `G.weaponArt.draw` và `G.weaponArt.icon` xoay hình quanh điểm cầm theo góc đòn đánh (bước 5 độ, có nhớ), viền đổi màu theo bậc, cung có dây và mũi tên khi giương. Tên, chỉ số, đòn đánh không đổi.
- **Trang phục**: thay mục tương ứng trong `G.heroLooks`, vẽ vào hệ toạ độ đầu hoặc thân của em bé nên tự bám theo mọi động tác; ô đồ (`G.tinhLinh.itemIcon`) và đồ rơi đổi theo. Chỉ số, bộ, bậc không đổi.
- **Vật phẩm**: `G.theme.resIcon` (mọi chỗ hiện biểu tượng tài nguyên, kể cả chữ có số như "400 vàng") và hình đồ rơi (`js/do_roi.js`) dùng hình tự vẽ.
- **Vũ khí vẽ nằm ngang**: không cần gì thêm, tệp chỉ ghi điểm cầm `cam` và mũi `mui`; game xoay sao cho hướng cầm → mũi trùng hướng đòn đánh.
- **Người làng** (`doi_tuong: "nguoi-lang"`): tệp có tấm sprite như quái, hai động tác `idle` (đứng thở) và `noi` (nói chuyện, vẫy tay). `js/village_scene.js` có hai chỗ hỏi hình tự vẽ (chỉ khi có tệp): `VS.tuVe` trong `putNpc` (người trong làng và người to cạnh bảng) và `VS.tuVeMat` trong `VS.face` (dải khuôn mặt). Khi em bé tới gần hoặc đang nói chuyện thì dùng động tác `noi`, quay về phía em bé; còn lại `idle`. Khuôn mặt cắt từ phần đầu (khoảng 42% trên cùng) của khung đứng thở đầu tiên. Vị trí đứng, chỗ chạm, câu nói không đổi.

Khoá riêng của tệp đồ: `anh` (ảnh PNG đã có viền), `rong`, `cao`, và một trong `vu_khi` (`loai`, `dong`, `he`, `gd`, `cam` điểm cầm, `mui` mũi, `day` hai đầu dây cung), `trang_phuc` (`o`, `look`, `lech` độ lệch so với gốc đầu/thân/vai, `lop`, `kieu`, `tay_ao`), `vat_pham` (loại).

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
