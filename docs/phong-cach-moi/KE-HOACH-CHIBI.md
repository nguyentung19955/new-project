# Kế hoạch đổi hình sang chibi mượt (đồ miễn phí)

Người dùng duyệt ngày 10/10/2026. Yêu cầu: làm luôn, **không chạy test** (chỉ cần `python3 game/build.py` chạy được), sau này hiệu chỉnh.

## Cách làm hình mượt

Không vẽ từng khung hình nữa. Mỗi nhân vật là **các mảnh** (đầu, thân, tay, chân, đuôi, vũ khí) vẽ bằng Gemini (miễn phí),
game **xoay và nhún từng mảnh quanh khớp** mỗi khung hình (khung xương 2D). Chuyển động liên tục, hình nét ở mọi cỡ, tệp nhẹ.
Phong cách đã chọn: **kiểu số 2**: chibi mềm, viền tối vừa, tô 2 tông màu, khối tròn, màu ấm, đầu bằng nửa chiều cao.

Không chuyển sang Godot lúc này (phải viết lại cả game). Tệp khung xương bên dưới đủ thông tin để sau này nạp vào Godot (Skeleton2D) nếu muốn.

## Ba phần việc (3 phiên chạy song song)

| Phiên | Nhánh | Việc | Dự kiến |
|---|---|---|---|
| chibi-prompt | `chibi-prompt` | Sửa prompt Gemini cho cả game + bộ quy chuẩn phong cách | ~1,5 giờ |
| chibi-xuong-roi | `chibi-xuong-roi` | Công cụ "Xưởng Rối": nạp ảnh tách bộ phận → tự cắt → đặt khớp → xem động tác → xuất tệp `.rig.json` | ~3 giờ |
| chibi-game | `chibi-game` | Bộ vẽ khung xương trong game (`game/js/chibi_rig.js`), màn chơi nét cao, 3 nhân vật mẫu thay hình cũ | ~3 giờ |

Mỗi phiên tự gộp vào `khoi-tao-du-an` khi xong (commit `XONG: ...`). spiritblade.web.app tự cập nhật khi `khoi-tao-du-an` có code mới.

## Định dạng tệp khung xương (chung cho công cụ và game) — `linh-khi-rig` phiên bản 1

Tệp nằm ở `game/art/chibi/<ma>.rig.json`. `game/build.py` nhúng mọi tệp này vào bản đóng gói thành `G.chibiRigData` (mảng).

```json
{
  "loai": "linh-khi-rig",
  "phien_ban": 1,
  "ma": "tho-ren",                       // chữ, số, - _ ; tối đa 40 ký tự
  "ten": "Thợ Rèn",
  "doi_tuong": "em-be",                  // "em-be" hoặc "quai"
  "thay_cho": "<mã quái trong game>",    // em bé: bỏ trống hoặc "hero"
  "khung": "nguoi",                      // "nguoi" | "bon-chan" | "cua"
  "anh": "data:image/png;base64,...",    // MỘT ảnh chứa mọi mảnh (nền trong suốt), mặt quay sang PHẢI
  "cao": 40,                             // chiều cao nhân vật trong game, đơn vị game (màn 480×270)
  "goc": [210, 400],                     // điểm chân chạm đất, toạ độ "tư thế ráp"
  "manh": [
    { "ten": "than", "vai": "than", "cha": null,  "o": [0,0,180,200],  "dat": [120,200], "truc": [210,330], "lop": 2 },
    { "ten": "dau",  "vai": "dau",  "cha": "than","o": [180,0,260,240],"dat": [90,0],    "truc": [210,215], "lop": 3 }
  ],
  "dong_tac": { "idle": { "bien_do": 1, "toc_do": 1 } }   // không bắt buộc; hệ số chỉnh độ mạnh/tốc độ từng động tác
}
```

- `o`: ô chữ nhật [x, y, rộng, cao] của mảnh trong ảnh `anh` (pixel ảnh).
- "Tư thế ráp": nhân vật đứng thẳng, mọi mảnh đặt đúng chỗ. `dat` = góc trên trái của mảnh trong tư thế ráp, `truc` = điểm khớp (mảnh xoay quanh điểm này), cùng hệ toạ độ (pixel ảnh, chưa co).
- `cha`: tên mảnh cha (mảnh con đi theo khi cha xoay/nhún). Mảnh gốc (thân) có `cha: null`.
- `lop`: số lớn vẽ sau (nằm trên).
- `vai` (vai trò để biết cử động thế nào):
  - khung `nguoi`: `dau`, `than`, `tay-truoc`, `tay-sau`, `chan-truoc`, `chan-sau`, `vu-khi` (con của `tay-truoc`), `phu-kien` (đi theo cha, lắc nhẹ: tóc, khăn, đuôi áo).
  - khung `bon-chan`: `dau`, `than`, `chan-truoc-gan`, `chan-truoc-xa`, `chan-sau-gan`, `chan-sau-xa`, `duoi`, `phu-kien`.
  - khung `cua`: `than`, `cang-truoc`, `cang-sau`, `chan-gan-1..3`, `chan-xa-1..3`, `phu-kien`.
- Động tác dùng đúng tên của game (giống `sprite_custom.js`): `idle` (đứng thở), `move` (đi), `tele` (chuẩn bị đánh), `atk` (đánh), `hit` (trúng đòn), `die` (chết). Động tác **sinh tự động** theo `khung` + `vai` trong `game/js/chibi_rig.js`; công cụ và game dùng chung tệp này nên xem trong công cụ y như trong game.

## Hàm chung trong `game/js/chibi_rig.js` (phiên chibi-game viết, phiên chibi-xuong-roi dùng)

```
G.chibi.add(tep)                 // nạp một tệp rig, trả về đối tượng rig (ảnh nạp không đồng bộ)
G.chibi.ds[ma]                   // các rig đã nạp
G.chibi.pose(rig, anim, u, t)    // tính góc/dời của từng mảnh. anim: tên động tác; u: tiến độ 0..1 (động tác 1 lần); t: thời gian giây (động tác lặp)
G.chibi.draw(ctx, rig, x, y, opts) // vẽ, (x,y) = điểm chân; opts: { anim, u, t, flip, scale, flash (0..1 chớp trắng), alpha }
```
Không phụ thuộc phần nào khác của game ngoài `window.G`, để công cụ nhúng được riêng.

## Đã làm (phiên chibi-game, 10/10/2026)

- `game/js/chibi_rig.js`: `G.chibi.add / ds / pose / draw` (+ `G.chibi.get`, `choQuai`, `choEmBe`, `maTran`, `diem`). Động tác sinh tự động theo khung + vai, mượt (sin/easing).
  Góc dương = xoay theo chiều kim đồng hồ (nhân vật quay phải): thân dương là cúi tới, tay/chân buông dương là đưa ra sau.
  Mảnh `tay-truoc` có thể thêm `"cam": [x, y]` (điểm cầm vũ khí, toạ độ tư thế ráp); không có thì lấy đầu mảnh xa khớp nhất.
- `game/build.py` nhúng `game/art/chibi/*.rig.json` thành `G.chibiRigData`; `chibi_rig.js` nằm sau `sprite_custom.js` trong `index.html`.
- Màn chơi nét cao: canvas `#world` có kích thước thật 480×270 × `G.wk` (theo cỡ khung × mật độ điểm ảnh, tối đa rộng 1920).
  `setTransform/resetTransform/getTransform` của `G.wx` tự nhân/chia `G.wk` nên code vẽ cũ không đổi. Tắt bằng `G.netCao = false`.
- Nối vào game: quái có rig (`thay_cho` = mã quái) và em bé có rig vẽ bằng chibi; vũ khí game gắn vào tay trước của em bé.
- 3 tệp mẫu (tạo bằng `docs/phong-cach-moi/ghep-thu/xuat_rig.py` từ ảnh trong `mau/`):
  - `tho-ren.rig.json`: em bé (khung người), thay hình **cả bốn em bé** (thay_cho `hero`).
  - `heo-rung-con.rig.json`: bốn chân, ảnh mẫu lật cho quay phải; **thay quái `heoCon` (Heo Con, lính xông vùng Rừng già, có ngay ở ải 1-1)**.
  - `linh-ma-giap-gi.rig.json`: người, chổi dính tay; **thay quái `linhMa` (Linh Ma, lính xông vùng Lâu đài cổ, ải 3-x)**.
  Muốn bỏ một hình chibi: xoá tệp trong `game/art/chibi/` rồi chạy `python3 game/build.py`.

## Thứ tự sau khi 3 phiên xong

1. Người dùng vẽ bằng Gemini theo prompt mới (mỗi hình 1 dòng; bản miễn phí giới hạn số ảnh/ngày).
2. Người dùng mở Xưởng Rối (spiritblade.web.app/xuong-roi.html), nạp ảnh, chỉnh khớp, xuất tệp, gửi lại.
3. Thay dần toàn bộ quái, em bé, đồ. Hiệu chỉnh và test lúc đó.
