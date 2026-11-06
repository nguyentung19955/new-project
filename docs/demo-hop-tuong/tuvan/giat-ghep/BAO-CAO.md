# GIẬT SAU GHÉP ĐẶC BIỆT / MAD CROWN / CHỈ HUY + TẤM TÊN GHÉP ĐÈ NHAU — báo cáo (06/11/2026)

Mục mở trong `docs/demo-hop-tuong/tuvan/qa-ngam/BAO-CAO.md` mục 4: (1) 21/300 trận ngâm có 1 bước luật 250–1 170 ms, thường sau ghép đặc
biệt / Mad Crown / chỉ huy; (2) tấm tên ụ sau ghép đè nhau khi ghép 2 ô cạnh nhau liên tiếp ở 3×.

## 1. Đo — nguyên nhân thật

Công cụ mới `tools/thap-do-giat-ghep.js`: iPhone 13 (DPR 3) + CPU chậm ×4, bot QA ngâm chơi bộ nặng ghép đặc biệt (Copycat, Merge King,
Blood Circuit, Teleporter, Mixer, Mystery Box, Evolver, Leviathan, Star Cannon…) ở SOLO / CO-OP / PVP, tốc 3×, wave 8 → 14 (qua trùm wave 10).
Mỗi bước luật + mỗi khung vẽ được đo; bước/khung chậm thì ghi luôn **việc nặng trong đó** (móc: tạo canvas, chép/giải mã ảnh lần đầu,
vẽ từ ảnh, getImageData, tải ảnh giữa trận, JSON.parse, nạp font) + **mẫu CPU** (CDP Profiler) đúng cửa sổ chậm. Thêm phần
"ra chiêu LẦN ĐẦU": mỗi bộ bài 1 trận, chạy 4 s như thật, rồi ra từng ụ chủ động / chỉ huy / ghép đặc biệt / trùm 1 lần.

Nguyên nhân đo được (CPU ×4):

| Nguyên nhân | Ví dụ đo được | Mức |
|---|---|---|
| **Lần đầu vẽ 1 tờ ảnh lớn**: REN.img chép ảnh sang canvas (giải mã 3–22 ms) + lần vẽ đầu TỪ canvas mới (đẩy cả tờ lên GPU, 20–50 ms) | `fxb_toc` 1248×312 → 40 ms · `p2_overlord` 4608×288 · `fx_evo_xit` 4096×256 → 50 ms · `quai_khong_lo_8` 2552×319 → 40 ms · `sig_l04_hammer` | khung 60–85 ms, ngay khung hiệu ứng nở ra |
| **Chuỗi mip của tờ hiệu ứng** (REN.khungMuot → REN.mip): 2 tầng đầu dựng từ tờ lớn ngay khung đầu ra chiêu | `p2_copycat` 28 ms · `p2_halo` 66 ms · `p2_rewind` 40 ms | khung 70–125 ms (Holy Halo, Mad Crown, Chrono Throne) |
| **Dọn rác dồn** (garbage collector) do canvas tạo-rồi-bỏ: ~2 500 canvas/trận ~70 s (`render.js` thuNho mỗi tầng 1 canvas mới, `fxu.js` cung 2 canvas mỗi góc) | khung chỉ có "(garbage collector)" 60–195 ms | ngẫu nhiên, không gắn với 1 chiêu |
| Bước LUẬT | max 25–60 ms (chỉ dọn rác) | không vượt 120 ms |

Không thấy: tải ảnh giữa trận (0 lần), JSON.parse, nạp font, getImageData lớn trong khung. Bước luật (phần tính luật) không tự chậm —
250–1 170 ms ở ngâm là **máy đo 2 lõi chạy 2 trận + máy chủ cùng lúc** cộng dọn rác dồn; trên 1 luồng sạch không tái hiện được bước > 60 ms.

## 2. Sửa (không đổi luật / sát thương / thời điểm — online tất định giữ nguyên)

1. **Làm nóng lúc rảnh** (`js/nongskill.js` mục 5, `NS.am`): sau khi trận chạy, tờ ảnh LỚN của trận (UI.dsTran: ụ trong bộ, hiệu ứng v2,
   tờ P2 của ụ trong bộ, hào quang buff, khoảnh khắc đặc biệt, chân dung chỉ huy; ảnh tải lười giữa trận khi tải xong) được làm nóng
   theo từng việc nhỏ ở các khung khác nhau: chép sang canvas → vẽ thử thu nhỏ chất lượng cao vào canvas 2×2 (lên GPU + mipmap) →
   tầng mip ½, ¼ (tờ hiệu ứng) → quái sẽ ra trong ≤ 2 wave tới + dải thu nhỏ đúng cỡ; trùm wave này/wave sau. Ảnh nhỏ (< 256×256) bỏ qua
   (lần đầu đã rẻ, giữ bộ nhớ như cũ). `requestIdleCallback` nếu có; Safari iOS không có → sau khung vẽ khi khung này và khung trước < 12 ms
   (≤ 2 ms thêm). Thời gian tải / vào trận không đổi (1,1–1,3 s / 1,8–2,0 s, trước và sau).
2. **Canvas nháp dùng lại** (`render.js` `REN.nhap`): thu nhỏ nhiều tầng (thuNho) đổi lượt 2 canvas nháp cố định (≤ 1 M điểm mỗi cái)
   thay vì 1 canvas mới mỗi tầng; `fxu.js` cung (vòng hồi chiêu) dùng canvas nháp, xoá bộ đệm cung thì trả bộ nhớ ngay.
3. **Tấm tên ghép** (`js/keoghep.js`): tấm mới **thay** tấm cũ khi khung bao chồng nhau (tính theo cỡ lớn nhất lúc nảy 1.25×) →
   không bao giờ 2 tấm đè; tấm mới nhất luôn còn, sống ~1 s như cũ. Dùng chung mọi chế độ (SOLO / CO-OP / PVP / ONLINE).

## 3. Kết quả (trước → sau, iPhone 13, CPU ×4)

- Ra chiêu / ghép đặc biệt / chỉ huy / trùm **lần đầu** (69 việc, 3 chế độ): trung bình **44,6 → 36,2 ms**, nặng nhất **125,7 → 99,3 ms**,
  số việc > 60 ms **18 → 12**, > 100 ms **4 → 0**. Rõ nhất: Holy Halo 126 → 79, Hive Queen 108 → 77, Merge King 99 → 26, Mystery Box 102 → 65,
  chỉ huy Eve 71 → 17, Dahlia 69 → 13, Chrono Throne 67–95 → 19–71, Leviathan 77 → 25. → `bieu-do-lan-dau.png`
- Trận dài bộ nặng ghép đặc biệt: không bước luật / khung nào > 120 ms sau khởi động ở cả 2 bản (lần đo này); bước luật max 22–41 ms (trước 26–60);
  khung p95 9–13 ms như cũ; khung còn lại 60–80 ms là dọn rác/raster (không còn việc ảnh lần đầu nặng trong đó). → `bieu-do-khung.png`, `BUOC-MAX.md`
- Canvas tạo trong 1 trận (~100 s): SOLO 1 765 → 1 202, CO-OP 2 511 → 1 691, PVP 2 745 → 1 893 (−31 %).
- Còn tăng ở vài việc (Genesis Core 31–45 → 71–72, Leviathan ghép đôi 28–36 → 54–61): khung đó không có việc ảnh nặng — dọn rác/raster, dao động giữa các lần đo.
- Tấm tên: bản cũ đè 79–130 lần / 6 lượt ghép đôi (tối đa 4 tấm cùng lúc); bản mới 0 lần ở SOLO / CO-OP / PVP.
- Ngâm SO=60 (1 trang/lượt như cũ, 2 luồng): xem mục 5.

Còn lại (ghi chú, không phải lỗi): khung dọn rác 60–195 ms vẫn thỉnh thoảng có trên máy đo 2 lõi khi CPU ×4 — không gắn với chiêu nào;
bộ kiểm chỉ coi KHUNG > 120 ms là lỗi khi trong khung có ≥ 30 ms việc nặng đo được (ảnh lần đầu…), khung chỉ có dọn rác → cảnh báo.
Lần đầu làm nóng 1 tờ rất lớn (p2_cryo, chân dung chỉ huy) vẫn tốn 30–70 ms ×4 CPU nhưng rơi vào giây đầu trận (bàn trống, lúc rảnh).

## 4. Kiểm (hồi quy)

- `tools/thap-kt-giat-ghep.js` (bước `giatghep` trong `tools/thap-kt-hoiquy.js`, `CHI=giat`):
  1) tấm tên 2 ô cạnh nhau ghép liên tiếp (cách 40 ms) ở 3× — 0 lần đè trong mọi khung, tấm mới nhất còn, 4 tấm liền hàng không đè — SOLO/CO-OP/PVP;
  2) `tools/thap-do-giat-ghep.js KT=1` (CPU ×4, 2 400 bước/chế độ + ra chiêu lần đầu 23 việc × 3 chế độ): không bước luật > 120 ms sau khởi động,
     không khung > 120 ms có việc ảnh nặng, ra chiêu lần đầu ≤ 120 ms. `NHANH=1` chỉ chạy phần 1.
- Ngâm: `tools/thap-qa-ngam.js` in thêm "bước luật chậm nhất/trận: p95 · max · số trận > 120 / > 250 ms"; `BUOC_CHAM=120` để coi bước > 120 ms là lỗi
  (dùng khi chạy `LUONG=1`; 2 luồng trên máy 2 lõi số giật bị ồn).

## 5. Ngâm SO=60 (trước / sau) — `SO=60 NHIN=0 ONLINE=0`, 2 luồng, máy 2 lõi, không hãm CPU

| | trận có bước luật > 120 ms | > 250 ms | bước chậm nhất p95 | max | lỗi |
|---|---|---|---|---|---|
| trước (cca6ae7) | 19 / 60 | 6 / 60 | 319 ms | 413 ms | 1 báo động giả `vong-chong` (s50 PVP) |
| sau | 11 / 60 | 3 / 60 | 251 ms | 276 ms | **0 — XANH**; tái lập 6/6 trận KHỚP |

Báo động giả s50 PVP: khung tròn biểu tượng kỹ năng-khi-ghép (`h2_vong_xam`, nổi trên ô) trùng tâm với chớp đỏ triệu hồi ở ô ngay trên —
tình cờ hình học, không phải 2 vòng hiệu ứng chồng → bộ kiểm ngâm bỏ qua `h2_vong_xam` (khung biểu tượng). Số giật ở ngâm vẫn ồn
(2 trận + máy chủ trên 2 lõi) — dùng `tools/thap-do-giat-ghep.js` (1 luồng, CPU ×4) để so chính xác.

Hồi quy đầy đủ `tools/thap-kt-hoiquy.js` (4 cỡ màn, gồm bước `giatghep` mới) trên bản đã gộp VFX P3: **XANH**, 0 lỗi (3 179 s).

## 6. Chạy lại

```bash
python3 -m http.server 8765 &
NODE_PATH=/opt/npm-tools/node_modules NHAN=sau node tools/thap-do-giat-ghep.js     # đo → docs/demo-hop-tuong/tuvan/giat-ghep/do-sau.json
python3 tools/thap-giat-ghep-bieudo.py                                               # biểu đồ + BUOC-MAX.md từ do-truoc.json / do-sau.json
NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-giat-ghep.js                # hồi quy (≈ 8 phút)
```
Biến của `thap-do-giat-ghep.js`: `CHE` · `BUOC` (6000) · `NGUONG` (120) · `CPU` (4) · `PROF=0` bỏ mẫu CPU · `DAU=1` chỉ ra chiêu lần đầu / `-1` bỏ ·
`NGAU=10 CPU=1 DPR1=1 VEMOI=20` chạy 10 trận bộ ngẫu nhiên giống ngâm · `DEM=1` in số canvas tạo theo dòng code · `KT=1` mã thoát 1 khi vượt.
Bản "trước" đo trên bản sao thap/ của commit cca6ae7 (`BASE=http://localhost:8766/thap/`).
