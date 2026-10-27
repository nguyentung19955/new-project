# Phu Đèn Lạc – rig cutout hướng "Cổ tích chuông tàn" (bản duyệt hình, CHƯA có đòn đánh)

Nguồn: `../../nguon/quai/phu-den-lac.png` (nền trắng). Vai trò, hình dáng: `docs/gameplay/BO-QUAI-DE-XUAT.md`.
Trang xem + ghi chú cho chủ dự án: **`game/thu-quai-huong-moi/GHI-CHU.md`**. Chưa ghép vào `game/demo.html`.

| File | Nội dung |
|---|---|
| `phu-den-lac-rig.json` | rig + clip tính sẵn (khoá mỗi 33 ms) – **cùng định dạng** `game/runtime/quai-boss/quai-moi-rig.json`; nạp bằng `QBR.napThem(base, 'phu-den-lac-rig.json')`, loại `'phuden'` |
| `manh/*.png` | 7 mảnh: `mu` (mũ trùm), `ao` (áo choàng thân), `tay` (tay áo + bàn tay), `can` (cán), `den` (đèn), `giay-truoc`, `giay-sau` – 2 px ảnh / 1 px logic, đã tô màu nhẹ + **vệt sáng mép vẽ sẵn** |
| `kiem/rap-so-chong.png` | gốc · ráp lại · so chồng (lục = chỉ gốc, đỏ = chỉ ráp) · khác màu ×4 · mỗi màu một mảnh – nguyên con IoU **0.9991** |
| `kiem/manh-2x.png` | các mảnh đúng ảnh trong gói |
| `xem-thu/*-lon.gif` | clip vẽ từ mảnh phân giải gốc (lớn) |
| `xem-thu/*-co-choi.gif` | clip **đúng cỡ trong game** (1 px logic = 1 px ảnh, vẽ từ mảnh 2x, không phóng nearest) |
| `xem-thu/so-co-lam-1x.png`, `-2x.png` | đứng cạnh Lam mới (`../../lam-rig/`) trên cảnh chuẩn |

**Cỡ**: hộp dáng nghỉ (px logic, so với điểm neo) [-41.2, -112.2, 80.9, 1.6] · `ty_le` = 0.16208 px logic / px ảnh nguồn.
**Cây nút** (quay trái; quay phải = lật ngang quanh điểm neo): `goc` (giữa hai giày, trên đất) → `giay_sau`, `giay_truoc`, `than` (áo, neo giữa vạt dưới) → `tay` (vai) → `can` (chỗ nắm) → `den` (vòng treo); `than` → `mu` (cổ).
**Thứ tự vẽ**: giày sau, giày trước, áo, đèn, cán, tay, mũ.
**Clip**: `dung` 3,2 s (lưng còng thở, mũ gật trễ, đèn lắc nhẹ) · `di` 1,4 s/2 bước, **phát theo quãng đường** 56 px/chu kỳ (40 px/s); đèn = con lắc lò xo bị kéo bởi đầu cán → đung đưa trễ nhịp.
Giày lấy từ **2 giày rời trong bảng**, dò tỉ lệ/vị trí cho khớp giày trong hình nguyên con (giày sau gần như khuất dưới vạt).

## Chạy lại
```
pip install pillow numpy scipy
cd code && python3 dung.py      # ~30 s: tách nền, cắt mảnh, rig, clip → manh/, *.json, kiem/, xem-thu/
```
Code chung (tách nền + khử viền trắng, cắt mảnh theo hình nguyên con, dò khớp mảnh bảng, tô màu, vệt sáng mép, rig, nội suy Hermite,
lò xo, xuất JSON/GIF): `../code-chung/cutout.py`, `../code-chung/xuat_chung.py`. Đa giác vùng mảnh + điểm neo nằm đầu `code/dung.py`.
