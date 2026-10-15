# Báo cáo — 9 hình hiệu ứng kỹ năng: thay phần vẽ tạm bằng ảnh (15/10)

Làm theo `YEU-CAU.md` cùng thư mục, nhánh `khoi-tao-du-an`.
**Không chạy game, không chạy bài kiểm.** Chỉ: xử lý ảnh (Pillow), ảnh soát tĩnh (`xem-hieu-ung.png`, `xem-hieu-ung.gif`), `node --check`, `game/build.py --hai-tep`.
Cờ quay lui: **`?fxcu=1`** (hoặc `G.FX_CU = true`) → đúng hình cũ (vẽ code; tường / nấm con dùng lại ảnh tạm `hu-gai-bang` / `hu-nam-moc` như trước).

## Đã làm

### 1. Tách 9 tấm → `game/art/custom/<mã>.sprite.json`

Công cụ: `cong-cu/dung-hieu-ung.py [--ghi]` (cùng cách `trum-moi/cong-cu/dung-hieu-ung-them.py`, thay cho trang `tools/tach-hieu-ung`):
khử nền xanh (lục > 140 và hơn hai kênh kia > 70), bỏ đốm lẻ < 10 điểm, khử ánh xanh ở dải mép 3 điểm (không đụng màu xanh chanh trong hình, VD đốm nấm),
tách khung theo các khe cột trống lớn nhất (đúng số khung), thu nhỏ hộp alpha-trước-nhân, ngưỡng alpha 110 (viền sắc, không bán trong suốt),
`net 2`, lượng tử 128 màu (MEDIANCUT, không hoà sắc) như các hiệu ứng khác; PNG kiểm lại khớp từng điểm.
Tia / vạch rung tách rời (vỏ ốc khung 3–4, lá bùa khung 2–3, tia điện) được giữ.

| Mã | Vùng | Khung | Ô (điểm game) | Cỡ khi co 1 — lấy từ hình vẽ tạm | Neo |
|---|---|---|---|---|---|
| hu-cau-dat-lan | rung | 8 lặp | 22×22 | đường kính 18 = 2 × `SO.boHung.r` 8 + viền | chân cục đất |
| hu-vet-nhot | bien | 6 lặp | 28×16 | rộng 24 = 2 × `SO.oc.nhotR` 12 (vùng làm chậm bầu dục r × 0,6r) | tâm vũng |
| hu-vung-dien | bien | 8 | 64×42 | lòng rộng ~52 = 2 × `SO.sua.r` 26 (khung 1 đo cả tia mép: 54) | tâm vũng |
| hu-bua-tam-giac | laudai | 6 | 16×17 | lá bùa cao 12 (bùa vẽ tạm 6×9 + viền) | chân lá bùa (khung 1) |
| hu-vo-oc | bien | 6 | 56×52 | rộng 48 ≈ thân ốc 46 ở khung đứng `oc.sprite.json` | chân, giữa thân |
| hu-manh-san-ho | bien | 6, xoay | 19×14 | dài 14 (mảnh vẽ tạm 4×3, vùng mảnh rộng 16) | tâm mảnh |
| hu-tuong-tinh-the | bien | 6 | 20×19 | rộng 16 ở khung 4 (tường dày `cuaTuong.day` 10, khúc cách 10) | chân |
| hu-vet-dau | laudai | 6 | 21×13 | rộng 18 = `huDau.rong` ở khung 4 | tâm vệt |
| hu-nam-con | rung | 6 | 23×28 | cao 18 ở khung 4 (nấm vẽ tạm cao ~12, ảnh tạm `hu-nam-moc` ×0,5) | chân |

### 2. Thay phần vẽ tạm (giữ code cũ làm dự phòng)

Mọi chỗ hỏi `KA(mã)` = `G.huKn(mã)` (js/fx_anh.js): ảnh đã sẵn sàng **và** không bật `?fxcu=1`. Thiếu tệp / ảnh chưa tải về / `?fxcu=1` → chạy đúng nhánh vẽ code cũ. Chỉ là hình: không đổi vùng, sát thương, thời gian.
Vẽ bằng `G.fxAnh.veK` (khung chọn theo nhịp kỹ năng, không theo đồng hồ chung) — cùng cách các chỗ khác của `chieu_trum.js`.

- **Cục đất lăn** (`ky_nang_quai.js cauDat`): khung = góc đã lăn thật (`quay / 2π × 8`), lăn sang trái thì lật; co = (2r + 2)/18; bóng đổ giữ.
- **Vệt nhớt** (`vetNhot`): lặp 6 khung, mỗi vũng lệch pha; co = `nhotR / 12` (co theo bán kính vùng làm chậm thật); mờ vào / tan như cũ (×0,8).
- **Vũng điện** (`vungDien`): lúc vòng đỏ đầy dần lặp khung 1–5 (âm ỉ); đúng nhịp nổ (`v.sang` 0,25 s, cùng lúc giật + tê) chạy khung 6–8; co = `r / 26`.
- **Lá bùa** (`buaTamGiac`): đang bay khung 1; cắm xuống rung khung 1–3; 45% cuối thời gian chờ (`cho` 1,3 s) chạy khung 4–6, khung 6 đúng lúc nổ. Lòng tam giác đỏ đậm dần (vùng báo) giữ bằng code.
- **Vỏ ốc** (`veVo`): khung theo phần thời gian rút vỏ đã qua (`vo` 1,5 s): 1–2 yên, 3–4 rung, 5–6 ló ra (0,5 s cuối); vẽ đè lên thân ốc, lật khi quay trái.
- **Mảnh san hô** (`chieu_trum.js boRiu`): 6 mảnh như cũ, xoay theo hướng văng; đang bay khung 1–4, sau mốc `moc[1]` khung 5–6 vỡ rồi mờ.
- **Tường tinh thể** (`tuongTinhThe`): mỗi khúc 10 điểm như cũ; trồi khung 1–3 (0,21 s), đứng khung 4, `bao` giây cuối (đang rung) khung 5 rạn, 0,15 s cuối khung 6 vỡ, sau đó `hu-bang-vo` như cũ. Khúc xen kẽ lật.
- **Vệt dầu** (`huDau`): rót khung 1–2, loang óng ánh khung 3–4, 0,4 s cuối trước khi châm khung 5–6 (ánh cam); co = `rong / 18` (co theo bề rộng vệt thật). Lúc cháy vẫn `hu-vung-lua` như cũ.
- **Nấm con** (`namMe`): trồi khung 1–2 (0,3 s), nhún 3–4, 60–85% thời gian khung 5, 15% cuối khung 6 (phồng to sắp nổ).

**Đối xứng / co theo vùng:** ảnh quay phải; vật có hướng lật theo hướng (cục đất theo hướng lăn, vỏ ốc theo `e.face`), mảnh san hô xoay theo góc văng (đối xứng qua trục vết nứt như cũ). Vật nhìn từ trên (vũng nhớt / điện / dầu) co theo bán kính / bề rộng vùng thật trong `SO`, đổi số là ảnh co theo.

### 3. Cờ `?fxcu=1`
`js/fx_anh.js`: `G.FX_CU` (mặc định từ `?fxcu=1`), `G.huKn(mã)`. Cờ cũ `?hutrum=0`, `?huthem=0`, `?kynangcu=1`, `?chieucu=1` không đổi.

### 4. Ảnh soát
`xem-hieu-ung.png` — 9 dải khung đọc thẳng từ tệp game, cỡ game ×3, dấu + đỏ là điểm neo; `xem-hieu-ung.gif` — lưới 3×3 phát lặp 8 khung/giây. Công cụ: `cong-cu/ve-soat.py`.

### 5. Dung lượng (`python3 game/build.py --hai-tep`) và tải theo vùng

Hệ tải theo vùng đã có (14/10) nhưng chỉ cho quái / nền / cửa. Thêm: hiệu ứng có trường `"vung"` trong tệp → tải theo vùng như quái vùng đó
(`build.py`: `vung_rieng` nhận `hieu-ung` có `vung`; thêm `vung` vào `HU_KEYS`). Chỉ 9 tệp mới có trường này; hiệu ứng cũ không đổi nhóm.
Ảnh chưa về thì `G.fxAnh.co` báo `js/sprite_custom.js` tải ngay và game vẽ code trong lúc đó (như mọi ảnh tải sau).

| | Trước | Sau |
|---|---|---|
| Số ảnh | 471 | 480 |
| **NGƯỜI CHƠI TẢI** (trang nén + ảnh WebP) | 13,28 MB | **13,36 MB / trần 20 MB** (+0,08) |
| Không có WebP | 15,53 MB | 15,62 MB |
| Lõi (tải trước khi vào vùng đầu, kèm trang) | 4,73 MB | 4,74 MB (không đổi lõi: 323 ảnh, 3,82 MB) |
| Vùng Rừng già / Hang biển / Lâu đài cổ | 3,20 / 2,39 / 2,97 MB | 3,21 / 2,44 / 2,97 MB (+2 / +5 / +2 ảnh) |
| Tổng máy chủ PNG + WebP (chỉ để biết) | 27,17 MB | 27,33 MB |

Số "trước / sau" đo trên đầu nhánh lúc bắt đầu phiên (chỉ khác 9 ảnh này). Sau khi `pull --rebase` gộp phiên `trum-chet-anh` (hàng gục trùm pha 2/3) và build lại: **người chơi tải 14,18 MB / 20 MB** (không WebP 16,50 MB), lõi + trang 4,74 MB, vùng Rừng / Biển / Lâu đài 3,47 / 2,65 / 3,33 MB.

## Kiểm
- `node --check` `js/ky_nang_quai.js`, `js/chieu_trum.js`, `js/fx_anh.js` — đạt; `py_compile` hai công cụ — đạt.
- `build.py --hai-tep` — đạt (480 hình; một tệp 22,56 / 30 MB; người chơi tải 13,36 / 20 MB). `game/dist/*` build lại.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0` (`cloud*.js`, `firebase-config.js` giữ nguyên), không chép apiKey, không đụng master, không PR.

## Chưa làm / cần người xem
- Chưa chơi thử (theo yêu cầu): cỡ hiển thị là suy từ hình vẽ tạm; nếu thấy to / nhỏ thì chỉnh số đích trong bảng `HU` của `cong-cu/dung-hieu-ung.py` rồi chạy lại `--ghi`, hoặc hệ số `co` ở chỗ gọi `veK`.
- Vỏ ốc vẽ ĐÈ lên thân ốc (không giấu thân) để giữ thanh máu / chớp trúng đòn; cử động "hit" của ốc rộng tới 53 điểm nên có thể lòi chút chân ra mép vỏ.
- Mảnh san hô văng sang trái được xoay 180° (ảnh lộn ngược) — hình mảnh gần đối xứng nên khó thấy.
- Bản prompt cũ ghi tường tinh thể và nấm con 8 khung; ảnh chủ dự án gen là 6 khung (đúng bảng YEU-CAU), nhịp đã chia theo 6 khung.

## Tệp
`game/art/custom/hu-{cau-dat-lan,vet-nhot,vung-dien,bua-tam-giac,vo-oc,manh-san-ho,tuong-tinh-the,vet-dau,nam-con}.sprite.json` (mới),
`game/js/fx_anh.js`, `game/js/ky_nang_quai.js`, `game/js/chieu_trum.js`, `game/build.py`, `game/dist/*`,
thư mục này: `cong-cu/dung-hieu-ung.py`, `cong-cu/ve-soat.py`, `xem-hieu-ung.png`, `xem-hieu-ung.gif`, `bao-cao.md`.
