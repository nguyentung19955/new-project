# Nấm Thở – rig cutout hướng "Cổ tích chuông tàn" (bản duyệt hình, CHƯA có đòn đánh)

Nguồn: `../../nguon/quai/nam-tho.png` (nền trắng). Vai trò, hình dáng: `docs/gameplay/BO-QUAI-DE-XUAT.md`.
Trang xem + ghi chú cho chủ dự án: **`game/thu-quai-huong-moi/GHI-CHU.md`**. Chưa ghép vào `game/demo.html`.

| File | Nội dung |
|---|---|
| `nam-tho-rig.json` | rig + clip tính sẵn (khoá mỗi 33 ms) – **cùng định dạng** `game/runtime/quai-boss/quai-moi-rig.json`; nạp bằng `QBR.napThem(base, 'nam-tho-rig.json')`, loại `'namtho'` |
| `manh/*.png` | 4 mảnh: `goc` (thân + rễ), `mu` (mũ nấm), `tui-xep`, `tui-phong` (cắt từ hình phồng, dời về hệ toạ độ hình xẹp – hai hình trùng nhau ở gốc/mũ, lệch đúng 630 px) – 2 px ảnh / 1 px logic, đã tô màu nhẹ + **vệt sáng mép vẽ sẵn** |
| `kiem/rap-so-chong.png` (xẹp), `kiem/rap-so-chong-phong.png` | gốc · ráp lại · so chồng (lục = chỉ gốc, đỏ = chỉ ráp) · khác màu ×4 · mỗi màu một mảnh – túi xẹp IoU **0.9999** · túi phồng IoU **0.9903** |
| `kiem/manh-2x.png` | các mảnh đúng ảnh trong gói |
| `xem-thu/*-lon.gif` | clip vẽ từ mảnh phân giải gốc (lớn) |
| `xem-thu/*-co-choi.gif` | clip **đúng cỡ trong game** (1 px logic = 1 px ảnh, vẽ từ mảnh 2x, không phóng nearest) |
| `xem-thu/so-co-lam-1x.png`, `-2x.png` | đứng cạnh Lam mới (`../../lam-rig/`) trên cảnh chuẩn |

**Cỡ**: hộp dáng nghỉ (px logic, so với điểm neo) [-42.3, -83.8, 48.9, 0.0] · `ty_le` = 0.16092 px logic / px ảnh nguồn.
**Cây nút** (quay trái; quay phải = lật ngang quanh điểm neo): `goc` (giữa gốc, trên đất) → `than` → `tui_xep`, `tui_phong` (cùng neo ở cổ túi), `mu`.
**Thứ tự vẽ**: thân, túi xẹp, mũ, túi phồng (túi phồng đè vành mũ phải như ảnh gốc).
**Clip**: `dung` 3 s (túi xẹp phập phồng nhẹ, mũ nâng–hạ trễ) · `tho` 2,6 s (hít 0,9 s: túi xẹp căng dần rồi túi phồng hiện đè lên · giữ căng · thở ra nhanh ở 1,5–1,85 s: túi phồng co + mờ để lộ túi xẹp, mũ nhún) – Nấm không di chuyển.
IoU dáng phồng (thân/mũ của hình xẹp + túi phồng) so với hình phồng = 0,99; lệch màu 9/255 vì vân thân/mũ hai hình gen hơi khác nhau.

## Chạy lại
```
pip install pillow numpy scipy
cd code && python3 dung.py      # ~30 s: tách nền, cắt mảnh, rig, clip → manh/, *.json, kiem/, xem-thu/
```
Code chung (tách nền + khử viền trắng, cắt mảnh theo hình nguyên con, dò khớp mảnh bảng, tô màu, vệt sáng mép, rig, nội suy Hermite,
lò xo, xuất JSON/GIF): `../code-chung/cutout.py`, `../code-chung/xuat_chung.py`. Đa giác vùng mảnh + điểm neo nằm đầu `code/dung.py`.
