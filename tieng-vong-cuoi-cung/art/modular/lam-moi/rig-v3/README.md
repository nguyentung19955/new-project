# Lam – rig "tay chân rời" v3 (chốt theo YEU-CAU-RIG-V3 + sprite sheet chạy)

Làm theo `../YEU-CAU-RIG-V3.md`. Nền là rig-v2 đã duyệt: **không gen lại, không đổi cấu trúc** (cùng nút, cùng mảnh,
cùng thứ tự vẽ, cùng cách đặt mốc). rig-v1 và rig-v2 giữ nguyên ở `../rig-v1/`, `../rig-v2/`.
Không gen ảnh AI. **Chưa chạy thử trên iPhone/Safari** – mọi số "px logic" là tính toán, không khẳng định hiệu năng.
Đã đổi gì, số đo, đối chiếu tốc độ game, cái còn chưa đẹp, câu hỏi cần quyết: **GHI-CHU.md**.

## Xem gì trước
| File | Nội dung |
|---|---|
| `chay/chay-112px-x4.gif` | chu kỳ chạy 112 px logic phóng ×4 (nearest), 32 khung × 20 ms – tối 10 % tay sau + ủng xa đã bật |
| `chay/chay-112px.gif` | đúng cỡ 112 px logic 1:1 |
| `chay/chay-nhun-v2-v3-112px-x4.gif` | so sánh nhún: trái bảng nhún v2, phải v3 (cùng mảnh) |
| `chay/chay-khong-toi-112px-x4.gif` | chỉ để so: tắt tối 10 % |
| `chay/chay-contact-sheet.png` | toàn chu kỳ 32 khung: lớn + 112 px 1:1 + bóng; gốc/canvas/đường đất cố định |
| `chay/chay-lon.gif`, `chay/chay-lon-cham-x4.gif` | cỡ lớn, bản chậm ×4 để soi chân bám đất |
| `chay/bieu-do-nay-dau.png` | nảy thân/đỉnh mũ/mắt: v2 ↔ thử (nhún ½, giữ chuyển động phụ) ↔ v3 |
| `chay/bieu-do-van-toc-ung.png`, `chay/bieu-do-vong-noi.png` | vận tốc điểm chạm so với đất; vòng nối cuối→đầu |
| **`sprite/lam-chay-2x.png`** | **sprite sheet RGBA** 8×4 ô, 32 khung, cùng ô 266×241, cùng điểm neo; không nền/chữ/đất |
| **`sprite/lam-chay-2x.json`** | toạ độ khung, 20 ms/khung, điểm neo (đất, giữa chân), cỡ khung, scale 2x, tốc độ chuẩn, cách giữ pha, hitbox |
| `sprite/kiem-sheet-ghep.gif`, `sprite/kiem-sheet-ghep-112px-x4.gif` | GIF **ghép lại từ chính sheet** theo JSON lên nền + đường đất cố định → chứng minh đúng neo |
| `sprite/kiem-sheet-luoi.png` | sheet trên nền ô vuông + khung ô + chữ thập neo (chỉ để kiểm) |
| `tu-the/06-toi-10.png` | tối 10 % ↔ không tối, lớn / 112 px 1:1 / ×4 |
| `tu-the/04-chop-mu-lac.png` | chóp lắc −10…+10° sau khi sửa chân chóp |
| `so-lieu.json` | mọi số đo (trượt có dấu + tuyệt đối, nảy đầu trước/sau, bậc chóp, tối 10 % ở 112 px, vòng nối, tốc độ game) |
| `lam-moi-v3.json` | **rig nguồn** (nguồn chỉnh sửa; sheet chỉ là đầu ra) |

## Dùng sprite sheet trong game (gợi ý – chưa sửa demo.html)
```js
// meta = lam-chay-2x.json ; (X, Y) = điểm chân của nhân vật trong game (giữa đáy hitbox), px logic
lam.pha = (lam.pha + Math.abs(pl.vx) / meta.toc_do_chuan.quang_duong_moi_chu_ky_px_logic) % 1;   // mỗi bước logic 60 Hz
const f = meta.frames[Math.floor(lam.pha * meta.so_khung)];
const s = 1 / meta.ty_le.px_nguon_moi_px_logic;                       // 0,5: sheet 2x → hiển thị 112 px
ctx.drawImage(img, f.x, f.y, f.w, f.h, X - meta.diem_neo.x * s, Y - meta.diem_neo.y * s, f.w * s, f.h * s);
// quay trái: ctx.translate(X, Y); ctx.scale(-1, 1); rồi vẽ với X = Y = 0
```
Phát theo **quãng đường** (không theo thời gian) → pha liên tục khi tăng/giảm tốc, chân không trượt ở mọi tốc độ.
Ở tốc độ chuẩn 130,72 px logic/s đúng bằng 20 ms/khung. **Hitbox/va chạm lấy từ gameplay**, không theo bóng sprite.

## Chạy (độc lập – chỉ cần thư mục rig-v3)
```
pip install pillow numpy scipy matplotlib
cd code
python3 chay_het.py           # chạy hết ~5–6 phút (kể cả dò cỡ mảnh), kết thúc bằng kiem_tra
python3 chay_het.py --nhanh   # bỏ tách/dò cỡ, dùng lại manh/goc/ (~3–4 phút)
```
Ảnh nguồn chép kèm trong `nguon/` (`2-nhin-ngang.png`, `3-bang-manh.png`, `1-mau-chuan-nhin-cheo.png`, `rig-v1/` để
vẽ so sánh). `toc_do_game.py` đọc `../../../../game/demo.html` nếu có; không có thì dùng số đã ghi sẵn (ghi rõ nguồn).

Thứ tự: `tach_manh` → `khop_co` → `chuan_hoa` → `sua_mu` → **`sua_chan_chop`** (mới) → `chu_ky` → `phan_tich` →
`duyet` → `chay` → **`sprite`** (mới) → `kiem_tra`.

Chỉnh chuyển động: bảng mốc đầu `code/chu_ky.py` (`BANG['V3']` cho nhún thân/mũ/chóp/chuông; `UNG_*`, `TAY_SAU_*`,
`CHU_KY_S`, `DUTY` như v2) rồi `python3 chay_het.py --nhanh`. Tối 10 %: `chung.LAM_TOI`. Pivot chóp: `rig.CHOP_PIVOT`.

## File code (mới / đổi so với v2)
| File | Việc |
|---|---|
| `chung.py` | + `LAM_TOI` (bật mặc định), `SPRITE`; JSON → `lam-moi-v3.json` |
| `rig.py` | `render(toi=None)` = tối mặc định; `CHOP_PIVOT` dời lên giữa nếp gấp (v2 giữ ở `CHOP_PIVOT_V2`) |
| `sua_chan_chop.py` | **mới**: sửa bậc chân chóp (xoá dải viền thừa của lớp gáy sát đỉnh + đuôi chóp khuất dưới mũ) |
| `chu_ky.py` | bảng `BANG` (V2 / THU / V3), `dat_bang()` để đo trước ↔ sau trong cùng rig |
| `nay_dau.py`, `do_chop.py` | **mới**: đo nảy đầu; đo bậc chân chóp |
| `toc_do_game.py` | **mới**: đọc code game, quy đổi px logic/s, đối chiếu |
| `sprite.py` | **mới**: sprite sheet 2x + JSON + ảnh/GIF kiểm |
| `phan_tich.py`, `chay.py`, `duyet.py`, `kiem_tra.py` | + trượt tuyệt đối, nảy đầu, bậc chóp, kiểm tối ở 112 px, kiểm sheet |
