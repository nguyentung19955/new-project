# Bọ Vỏ Mộc – rig 5 mảnh (hướng "Cổ tích chuông tàn")

Nguồn: `../../nguon/quai/bo-vo-moc.png` (nền trắng: nguyên con + mai, bụng, đầu, 2 cụm chân). Đề xuất: `docs/gameplay/BO-QUAI-DE-XUAT.md`.
Trang thử + ghi chú cho chủ dự án: **`game/thu-bo-vo-moc/GHI-CHU.md`**.

| File | Nội dung |
|---|---|
| `bo-vo-moc-rig.json` | rig + 13 clip tính sẵn – **cùng định dạng** `game/runtime/quai-boss/quai-moi-rig.json`, nạp bằng `QBR.napThem(base,'bo-vo-moc-rig.json')` |
| `manh/*.png` | mảnh 2 px ảnh / 1 px logic, đã tô màu hướng mới + **vệt sáng mép trên-trước vẽ sẵn**: mai, bụng, đầu, chân trước, chân sau + 2 lớp nứt mai (`mai-nut-1/2`) |
| `kiem/rap-so-nguyen-con.png` | trái: hình nguyên con trong ảnh gốc · phải: ráp lại từ 5 mảnh (đã tô màu) |
| `kiem/manh-2x.png` | 7 ảnh mảnh đúng cỡ |

**Chỉnh theo phản hồi 3 (27/10, bằng code, không gen lại)** – `dung_rig.py`:
- **Không tăng viền sáng** (vệt mép `RIM_SO` giữ nguyên). Mai **tối hơn chút** (`GRADE` sáng 0,84 → 0,82), không neon.
- **Bụng** kéo về **xám đất nhạt** `#B9AE9C` (trộn 38 %, giữ sắc độ từng đốt) và sáng thêm ×1,06 → tách khỏi mai về độ sáng, bớt vàng ngà.
- **Đầu**: tương phản 1,12 → 1,28, sáng 0,86 → 0,92 + **viền tối** 2 px (ảnh 2x) quanh mảnh đầu → đầu tách khỏi mai cùng tông.
- Nút mới **`bung_lat`** (dùng lại ảnh bụng, ẩn mặc định, vẽ sau mai): khi **lật ngửa** hiện mảng **bụng mềm** to 1,5× ở mặt dưới thân
  (clip `lat` / `lat_giu` / `day` / `chet_lat`, mờ dần vào lúc đã lật quá nửa).
- Clip `dau` (trúng bụng): **cả thân co lại** (thân hẹp 10 %, dẹt 6 %, bụng thắt 24 % và rút về trước) – khác hẳn `keng` (mai dội ngang, đầu rụt).
- Clip `bao`: **chân sau cào đất** lùi (7,5 nhịp/s) – game bắn bụi + sỏi ra sau cùng nhịp.

**Chỉnh theo phản hồi 4 (27/10, bản 3 trang thử, chỉ hình)** – `dung_rig.py`:
- Nâng sáng **có chọn lọc**: **đầu** `GRADE` sáng 0,92 → 0,96; **bụng** `BUNG_SANG` 1,06 → 1,10. Mai / chân giữ nguyên, **không** tăng viền, không tăng độ rực.
- Clip `dau` (trúng bụng) co **rõ hơn**: bụng thắt 24 → 34 %, thân hẹp 10 → 15 %, dẹt 6 → 10 %. Clip `keng` nén thân **nhẹ hơn** (4 → 2,5 %, phình 2 → 1 %).
- Chớp trúng bụng (ấm, chỉ bụng, giữ mép + mảng tối) **không** nằm trong PNG: game tạo lớp chớp từ mảnh lúc nạp (`game/thu-bo-vo-moc/cong-cu/khoi-bo.js`, `lopChop`).

**Cỡ**: dáng nghỉ cao **74 px logic**, dài 128 px (Lam 112). `ty_le` = 0,159 px logic / px mảnh nguồn.
**Cây nút** (quay trái): `goc` (neo trên mặt đất, giữa thân) → `than` (giữa mai, nửa chiều cao – trục lật ngửa) → `bung`, `mai` (→ `nut1`, `nut2`), `dau`,
`chan_truoc`, `chan_sau` + `chan_truoc_xa`, `chan_sau_xa` (cùng ảnh, tối 45 %, lệch pha bước). Điểm neo: mai = giữa mép dưới, bụng = khớp trước,
đầu = cổ, chân = hông (đỉnh cụm chân). Thứ tự vẽ: chân xa, bụng, mai, nứt, bụng lật (`bung_lat`), đầu, chân gần.
**Clip**: `dung`, `di` (phát theo quãng đường 28,8 px/chu kỳ, chân chống không trượt ở 36 px/s), `bao` (0,5 s), `huc` (lặp), `hoi`, `quay`, `keng`,
`dau`, `lat`, `lat_giu` (lặp), `day`, `chet`, `chet_lat`. Khoá mỗi 33 ms, runtime nội suy.

## Chạy lại
```
cd code
python3 tach.py      # tách nền + cắt 5 mảnh → ../tam/goc/ (không commit, sinh lại được)
python3 khop.py      # đo tỉ lệ mảnh so với nguyên con (0,89) → ../tam/khop.json
python3 dung_rig.py  # tô màu, vệt sáng, nứt, rig, clip → manh/, bo-vo-moc-rig.json, kiem/
```
Vị trí ráp từng mảnh nằm ở bảng `VI_TRI` trong `dung_rig.py` (khop.py dò được mai; đầu/chân/bụng chỉnh tay theo hình nguyên con).
Màu: bảng `GRADE` + `XAM_DAT`/`BUNG_XAM`/`BUNG_SANG` (bụng) (mức thay bằng dải màu ấm #17272C → #39312E → #65503C → #A78046 → #F2D69A, tương phản, độ sáng), rêu → olive xỉn,
mắt hổ phách giữ sáng; vệt sáng mép `RIM_SO` (#F2D69A).
