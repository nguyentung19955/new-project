# Thế giới mới – gạch nền, đồ vật, nền parallax (phong cách viền đen dày)

Tách bằng code (Python Pillow/numpy/scipy + OpenCV cho GrabCut) từ 3 ảnh nguồn ChatGPT trong `../nguon/`
(`gach-nen.png`, `do-vat.png`, `nen-lang.png`) – **không gen ảnh mới**. Lam để so cỡ lấy từ
`art/modular/lam-moi/rig-v2/nguon/2-nhin-ngang.png`. Không đụng `game/demo.html`.
**Chưa chạy thử trên iPhone/Safari** – mọi số "px logic" là tính toán (logic 960×540, ô 32, Lam 112, ảnh xuất 2x).

Đã làm gì, cỡ chọn, chỗ cắt/cân lại, còn gì chưa đẹp, câu hỏi cần quyết: **GHI-CHU.md**.

## Xem gì trước
| File | Nội dung |
|---|---|
| `xem-thu/canh-ghep-1x.png`, `-2x.png` | cảnh ghép 960×540: nền parallax + gạch + đồ vật + Lam 112 px (1x thu nhỏ LANCZOS, không nearest) |
| `xem-thu/canh-ghep-diu-1x.png`, `-2x.png` | như trên, dùng **bản nền dịu** |
| `xem-thu/cuon-thu-1x.png` | 3 vị trí camera (0 / 750 / 1550 px logic) – thử cuộn parallax + lặp nền |
| `xem-thu/doan-nen-mau-2x.png` (`-1x`) | đoạn nền mẫu: đất dài, bậc, hố, ván một chiều, dốc, khối đá chữ T, gờ nổi |
| `xem-thu/doan-nen-mau-luoi-2x.png` | cùng đoạn, kẻ lưới ô + tên ô tự chọn |
| `xem-thu/bang-o-gach.png` | mọi ô gạch, khung đỏ = ô 32 px logic (phần rêu/viền thò ra ngoài là cố ý) |
| `xem-thu/bang-do-vat.png` | mọi đồ vật, dấu + đỏ = điểm neo đáy-giữa |
| `nen/mask-lop.png` | ảnh nguồn tô màu theo lớp: tím = xa, vàng = giữa, xanh lá = gần, nâu = đất, đỏ = mặt trời |

## Thư mục
```
gach/     gach-atlas.png + gach-atlas.json (51 ô), o/<tên>.png (ô lẻ), kiem-tra-duong-noi.json
do-vat/   do-vat-atlas.png + do-vat-atlas.json (13 vật/trạng thái), vat/<tên>.png
nen/      xa, mat-troi, giua, gan-cay, gan-la, dat (.png, 1920×1080) + bản dịu <tên>-diu.png, nen.json, mask-lop.png
xem-thu/  ảnh xem thử (trên)
code/     mã + nguon/ (bản chép ảnh nguồn cần dùng)
```

## Dùng trong game (gợi ý, chưa sửa demo.html)
**Gạch** – `gach-atlas.json → o[tên]`: `khung` [x,y,w,h] px 2x, `ve_lech` [dx,dy] px 2x so với góc ô.
Vẽ ô (tx,ty): `drawImage(atlas, x,y,w,h, tx*32 + dx/2, ty*32 + dy/2, w/2, h/2)` (toạ độ logic). Vẽ hàng trên trước.
Chọn ô theo 4 ô kề (autotile) – xem `code/dung_nen.py → chon_o()`:
- không có ô đặc phía trên → `*-tren-trai/giua/phai` (cột 1 ô: `*-cot-tren`; cao đúng 1 ô: `*-noi-*`)
- có trên, không có dưới → `*-day-trai/giua/phai` (cột: `*-cot-day`)
- giữa → `*-than` (đất có 5 biến thể `dat-than`, `dat-than-2..5`; đá 3 biến thể) chọn theo băm toạ độ;
  thiếu trái/phải → `*-canh-trai/phai`, thiếu cả hai → `*-cot-than`
- `'#'` → bộ `dat-*` (rễ/rêu), `'S'`/`'W'` → bộ `da-*` (đá rêu), `'='` → `van-trai/giua/phai`, dốc → `doc-len`/`doc-xuong`.
- `phu-*` là trang trí, không khớp lưới.

**Đồ vật** – `do-vat-atlas.json → vat[tên]`: `khung`, `neo` [nx,ny] px 2x = điểm đáy-giữa.
Vẽ tại điểm (X,Y) logic: `drawImage(atlas, x,y,w,h, X - nx/2, Y - ny/2, w/2, h/2)`.
3 trạng thái cổng `cong-dong / cong-he / cong-mo` cùng khung + cùng neo → vẽ chồng, đổi alpha theo độ mở.

**Nền** – `nen/nen.json`. Thứ tự vẽ & tốc độ gợi ý (× camera):
`xa` (0,2, lặp LẬT như `veLap`) → `mat-troi` (0,2, vẽ 1 lần) → `giua` (0,45, lặp THẲNG) → gạch/đồ vật/nhân vật →
`gan-cay` (1,15, alpha 1) → `gan-la` (1,15, alpha ~0,5). `dat` = dải đất cỏ đã bỏ khỏi nền (mặc định không dùng).
Muốn bản dịu: thay `<tên>.png` bằng `<tên>-diu.png`. Đóng gói kiểu `game/build-demo.py` (WebP) dùng được ngay cho các PNG này.

## Chạy lại (độc lập – chỉ cần thư mục `the-gioi/`)
```
pip install pillow numpy scipy opencv-python-headless
cd code
python3 chay_het.py      # ~1,5 phút: gach → do_vat → nen → xem_thu → kiem_tra (mã thoát 1 nếu lỗi)
```
Từng bước: `python3 gach.py`, `do_vat.py`, `nen.py` (GrabCut, ~40 s), `xem_thu.py` (cần 3 bước trước), `kiem_tra.py`.
Đã thử: chép riêng `the-gioi/` ra chỗ khác, xoá hết đầu ra, chạy `chay_het.py` → ra lại y hệt từng byte, kiểm tra ĐẠT.

| File code | Việc |
|---|---|
| `chung.py` | đường dẫn tương đối, tách nền trắng + khử viền trắng, đổi cỡ có alpha, đường cắt nhỏ nhất (quilting), xếp atlas |
| `gach.py` | bảng ô (vai trò, cạnh giữ viền, ô tham chiếu để khớp) → cắt viền, làm lặp liền, khớp mép, thu 192→64 px |
| `dung_nen.py` | autotile + vẽ lưới ký tự thành ảnh (dùng cho ảnh xem thử; logic giống game cần) |
| `do_vat.py` | vùng từng vật, cỡ theo Lam/ô, ghép 3 trạng thái cổng, tách quầng mảnh chuông, neo đáy-giữa |
| `nen.py` | mép cỏ, GrabCut xa↔vật, đa giác cây gần, lá tối, mặt trời, lấp lớp xa, mép mờ lớp giữa, bản dịu |
| `xem_thu.py` | cảnh ghép 2x/1x (thường + dịu), thử cuộn, đoạn nền mẫu, bảng có tên |
| `kiem_tra.py` | đo đường nối gạch, khung/neo cổng, cỡ/alpha lớp nền, đủ file |
