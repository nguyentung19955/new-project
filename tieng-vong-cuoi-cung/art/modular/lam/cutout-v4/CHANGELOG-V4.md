# CHANGELOG – Lam cutout v3 → v4 (25/10/2026)

Gốc so sánh: `../cutout-v3/` (không sửa; đọc lại bằng cùng `rap4.Rig`). Mọi số **ĐÃ ĐO** dưới đây sinh lại bằng
`code/xuat.py`, `kiem_json.py`, `thu4.py`, `chay_nhap.py`. Số trong REVIEW-V3 được coi là giả thuyết và **tái tính**,
không chép. Phần **CHƯA kiểm chứng / đề xuất** tách riêng ở cuối.

Quy ước đọc số: "px TG" = px thế giới (Lam cao ~470), "px logic" = px TG × 0,2383. Sai số IK là sai số **hình học**
(toạ độ float sau FK), chưa tính lấy mẫu bicubic khi vẽ.

## Tóm tắt kết quả ĐÃ ĐO
| Hạng mục (ưu tiên chủ dự án) | v3 | v4 | Bằng chứng |
|---|---|---|---|
| 1. Góc nghỉ chân gần (đùi/gối/ủng, cục bộ) | 42,806 / 87,304 / −40,110 | **68,419 / 32,637 / −11,056** | `02-nghi-so-lieu.json`, `01-*` |
| 1. IoU silhouette / khớp họ màu so ảnh 02 | 0,9107 / 0,7833 | **0,9149 / 0,7835** | `02-*` |
| 1. Cổ chân gần (thế giới), hướng ủng, xương đùi/cẳng | (254,420), 90°, 47/38 | (254,420), 90°, 47/38 (giữ) | `02-nghi-so-lieu.json` |
| 2. Px thấy của capelet-truoc: đầu −10 / lean +8 / lean +8 + đầu −10 | 15 / 4 / 28 | **0 / 0 / 0** (không vẽ) | `07-*` |
| 3. Khuỷu duỗi: bậc nửa rộng lớn nhất trong 4 px dọc trục (gần / xa, hai bên) | 3,5–4,5 / 2,5–5,5 | **2,5 / 2,5** (= độ thuôn nền) | `05-khuyu-co-tay-so-lieu.json` |
| 3. Cổ tay −40/0/+40 × 5 tư thế chạy/chém, 2 tay: viền hở / khe kín | – | **0 / 0** (30 ảnh) | `05-co-tay-*` |
| 4. Lean ±8 có IK: sai số đế & cổ chân sau xử lý | trôi cổ chân tới 3,57 px TG (bù đùi) | **0,0000 px** (cả hai chân, mọi lean −8..+8) | `06-lean-ik-so-lieu.json` |
| 4. Lean +8 nếu KHÔNG hạ root: chân xa thiếu tầm | – | 1,869 px TG = 0,445 px logic → hạ root 2,575 px TG (0,614 logic) | `06-*` |
| 5. Validator JSON/PNG | (v3: 57 lỗi theo schema v4, trùng khoá slot 115) | **ĐẠT, 0 lỗi, 0 cảnh báo** | `00-validator-*` |
| 5. Luật slot: px đổi ảnh tại khung đổi lớp (max qua mọi lượt quét) | 755 (luật 30° trên rig v4) | **7** | `10-slot-so-lieu.json` |
| 5. Số lần đổi lớp mỗi lượt quét đơn điệu | 1 | 1 | `10-*` |
| 6. Vạch mảnh ở hốc chóp −10/−6/0/+6/+10 (px viền mảnh r14) | 11/8/12/24/18 | **4/1/0/3/3** | `08-*` |
| Chạy nháp: sai số đế / cổ chân pha khoá (18 mẫu) | – | **0,0000 / 0,0000 px**, trượt 0, xuyên đất khi bay 0 | `chay-nhap/chay-nhap.json` |

## 1. Hông gần [81,65] → [81,45] (P0-1)
- `khung.py`: thêm `ATTACH_V4 = dict(ATTACH_V3, dui-gan=[81,45])`; `xuat.rig_v4()` gọi `do_mau.suy_dang_nghi(..., ATTACH_V4, ...)`.
  **65 → 45 là NÂNG pivot 20 px trong hệ y xuống** (y nhỏ = cao). Hông xa giữ [32,65].
- Góc nghỉ được **giải lại qua pipeline xuất** (dò ủng trên ảnh 02 + IK xương 47/38 cố định, gập −1): đùi 68,419°,
  gối 32,637°, ủng −11,056°. Trùng với số thử của REVIEW tới 0,001° (REVIEW 32,636 do làm tròn) – đây là kết quả tái tính,
  không phải chép. Khoảng hông–cổ chân 81,6 px < 85 (trong tầm, gối gập vừa).
- So silhouette (`02-*`): v4 bỏ 582 px chỉ có ở v3 (gối nhô trước vạt), thêm 2 px; IoU 0,9107 → 0,9149.
- Phụ phẩm đo được: chân gần 0–120° (`04-*`) khe mở gần khớp 109 → 17; khe nền KÍN nhỏ 1–10 px xuất hiện ở 10–50° và
  110° (v3: 1 ở 10°, 39 ở 80°) – là túi nền nhỏ giữa mép áo, cẳng và cổ ủng (ba silhouette khác nhau), ≤ 0,6 px² logic.

## 2. visible=false cho vat-truoc, capelet-truoc (P0-2)
- `khung.VISIBLE_FALSE`; JSON mọi mảnh có `visible` (bool). PNG nguồn giữ nguyên trong `manh/`.
- **Bỏ thủ thuật dịch giấu** v3 (`AN_KHI_NGHI`: capelet-truoc (−15,−25), vat-truoc (0,−25) so với vị trí cục bộ v2).
  v4 đặt hai mảnh về đúng vị trí cục bộ v2 chuyển đổi (capelet-truoc gan [71,3], vat-truoc gan [71,93], góc 0).
- Định nghĩa (`rap4.Rig.layers`, JSON `visible_ghi_chu`): `visible=false` chỉ bỏ **vẽ chính mảnh đó**; ma trận vẫn tính,
  con vẫn vẽ (hai mảnh này không có con). Bật có chủ đích theo pose: `pose.hien[ten] = true`.
- Đo (`07-*`): v4 vẽ 23 lớp (v3: 25); px thấy của hai mảnh = 0 ở nghỉ, đầu ±10, lean ±8, lean +8 + đầu −10.
  Ảnh v4 trùng 0 px với ảnh ráp bỏ thủ công hai mảnh. Cột "nếu bật" chỉ để minh hoạ vị trí v2.

## 3. Khuỷu duỗi: đoạn chuyển tiếp + vật liệu vùng nối (P0-3)
`khuon4.elbow_transition(A, B, R, Z)` thay cặp `parent_cap/child_cap` cho khuỷu (gối giữ như v3):
- Cha (tay trên): trong đoạn Z trước D mỗi bên thu dần về min(nửa rộng tại D, R) – chỉ thu, không nở; sau D chỉ còn nắp R.
  Nửa rộng tại D: gần (29,5 / 28,75) → (27 / 27); xa (28,75 / 29,75) → (27,5 / 27,5). **R giữ 27 / 27,5 (không tăng).**
- Con (cẳng tay): đoạn [P, P+Z] nội suy bề rộng từng bên từ tiết diện cuối của cha tới tiết diện của con tại P+Z.
- Vật liệu: v3 dùng `nearest_fill` cho nắp → mảng màu tròn "miếng vá". v4: nắp cha = tiết diện D−Z kéo dọc trục; vùng sau P
  của con = **đúng vật liệu của cha tại cùng vị trí khi duỗi thẳng**; đoạn [P,P+Z] = khoảng bóng nội suy (nêm, không
  đường ngang). Khoảng bóng sát mép được kéo hẳn ra mép (sửa viền sáng giả thấy ở bản thử Z12).
- P, D, chiều dài xương không đổi (bài thử `elbow_variant` assert xương lệch < 0,02 px).
- Thử Z = 8/10/12 (`05-khuyu-duoi-v3-v4-Z.png`): ba mức cho cùng số đo bậc (2,5 px/4 px, bằng độ thuôn tự nhiên của tay),
  chọn **Z = 10** (giữa dải). v3: 3,5–4,5 (gần), 2,5–5,5 (xa).
- Không cần mảnh cẳng tay duỗi riêng → không có chuyển attachment.
- Còn lại (nhìn ảnh): tay gần gập 60–100° có một mảnh tối nhỏ trong nếp khuỷu (vật liệu bóng của tay trên mang sang nắp ẩn);
  đọc như nếp gấp, ≈1–2 px logic. Tay gần khi duỗi vẫn có bóng đổi bên (bóng tay trên phía sau, bóng cẳng phía trước – từ
  nét vẽ nguồn), nay chuyển bằng nêm thay cho mép tròn.

## 4. IK hai đoạn + khoá chân (P0-4)
`rap4.Rig.solve_ik` (gọi trong `matrices` khi pose có `khoa_chan`), **sau root/lean, trước slot/vẽ**:
- Đích = điểm đế (`ik[].diem_de`, đo trên mask ủng: giữa mép dưới, ung-gan (49,65), ung-xa (50,65)); cổ chân đích suy
  từ hướng ủng thế giới (`ankle_target`). Góc thế giới đùi/cẳng giải giải tích từ hông, dấu gập `gap = −1` **cố định**
  (không chọn nhánh theo khung trước → không đảo). Không kéo/co xương: ngoài tầm thì duỗi tối đa về phía đích và báo
  `thieu_px`. `mix` 0..1 trộn góc FK → IK.
- Ngoài tầm: `Rig.ha_goc_can_thiet` tính độ hạ root tối thiểu (chỉ tịnh tiến) để mọi chuỗi khoá trong tầm.
- Lean −8..+8 khoá hai đế tại vị trí nghỉ (`06-*`): chân xa đang **duỗi thẳng ở nghỉ** (gối 0°, thiếu 1,3 px từ v3),
  lean dương kéo hông xa ra xa → thiếu tầm 0,41 / 0,86 / 1,35 / 1,87 px TG ở +2/+4/+6/+8 (0,10–0,45 px logic).
  Xử lý: hạ root 0,58 / 1,20 / 1,87 / 2,58 px TG; sau đó sai số đế = sai số cổ chân = 0,0000 px. Lean −8: chân gần thiếu
  0,051 px → hạ 0,051 (gối gần duỗi 0°). Gối gần 15,8° (−6) → 55,1° (+8), gối xa 20,2° (−8) → 0° (≥0), không đảo dấu.
- v3 cùng bài (bù −lean ở đùi): cổ chân trôi (1,0, −3,4) / (1,5, 3,4) ở −8, (−1,5, 3,3) / (−1,0, −3,6) ở +8 px TG.

## 5. Metadata runtime + validator (P1)
`meta.py`, `xuat.py`, `khung.py` → `lam-v4.json`:
- `schema_version "4.0.0"`, `world_to_logic 0.238298`, `logic_cao_lam 112`, `the_gioi_cao_lam 470`.
- Mỗi mảnh: `visible`, `thu_tu_phu`; `ung-*` có `diem_de {giua, got, mui}`.
- `sap_lop`: khoá `(slot, thu_tu_phu, ten)`. Chuỗi chi: đùi 0 < cẳng 1 < ủng 2 → khi cẳng + ủng gần cùng sang slot 115,
  **ủng luôn đè cẳng** (v3 dựa ngầm vào thứ tự duyệt cha–con; validator chạy trên v3 báo trùng khoá (115,0)).
- `thu_tu_xu_ly` (7 bước), `ik` (ten/xuong/gap/mix/tam_toi_da/diem_de), `khoa_chan` (pha, đích, ngoài tầm),
  `lat_ngang` (lật toàn rig S(−1,1) quanh x gốc SAU FK/IK; dữ liệu và dấu gap không đổi; đích khoá đưa vào ở hệ chưa lật),
  `gioi_han_goc` (dải đã thử – không phải giới hạn giải phẫu).
- `phu`: thêm `kieu: "bu_goc_tinh"` + ghi chú: đầu bù −0,3 × delta thân **cùng khung**, KHÔNG phải trễ/quán tính.
- `kiem_json.py`: cha tồn tại, không chu trình, số hữu hạn, PNG RGBA đúng kích thước, P/D/diem_de trong ảnh,
  |D−P| = xuong, huong_anh khớp, gan chuỗi chi = D cha, IK liên tiếp + gap ±1 + mix ∈ [0,1], khoá sắp lớp không trùng và
  ủng đè cẳng ở **mọi tổ hợp** luật slot. v4: ĐẠT.

### Luật slot (P1) – kiểm chuyển động liên tục
- Quét liên tục hai chiều (`10-*`): đùi 60 → −40 → 60 ở gối 0/40/80/110 × lean −8/0/+8, và gối 0 ↔ 120 ở đùi 0/15/25;
  bước 0,5°. Mỗi lượt đơn điệu đổi lớp đúng 1 lần (cả luật v3 lẫn v4) – không nhấp lớp khi chuyển động liên tục.
- **Phát hiện:** với hông v4, luật v3 (`goc(dui-gan) < 30`) đổi lớp ở gối gập lớn gây nhảy ảnh lớn: 83–95 px TG ở gối 80,
  718–755 px TG ở gối 110 (cẳng/ủng đè lên thân ở đúng khung đổi).
- **Sửa (khung.py, JSON `khi.bu`):** điều kiện thành `goc(dui-gan) + 0,85·max(0, |goc(cang-chan-gan)| − 60) < 30`
  → đổi lớp chỉ xảy ra ở vùng hai thứ tự vẽ gần như trùng ảnh: **max 7 px TG** ở mọi lượt quét. Hệ số 0,85 / ngưỡng 60
  chọn từ lưới đo nhảy ảnh (đùi −30..60 × gối 0..120, `10-slot-so-lieu.json` → `luoi_px_doi`).
- Hysteresis 28/32: thử với đầu vào rung (biên độ 0,5–6° + nhiễu 0,3°): không hysteresis đổi 28 / 14 lần trong 2 s ở biên
  độ 0,5 / 1,5; có hysteresis 0 / 0. **Không thêm vào rig**: chuyển động do nội suy theo thời gian không rung, mỗi lần đổi chỉ
  ≤ 7 px TG (< 0,5 px² logic). Hàm thử `thu4.slot_state` ghi rõ cách reset (không có trạng thái trước → theo ngưỡng gốc)
  nếu sau này cần bật.

## 6. Vạch nhỏ ở hốc chóp (P2)
`khuon4.hood_pieces(hoc_r=16, hoc_mu=3)`: gốc nếp gấp nguồn ở hốc bị cắt đôi giữa chóp và mũ → vạch ở 0°, vạch kép khi lắc.
Chóp bỏ nét trong trong đĩa r16 quanh hốc (69,126); mũ bỏ nét trong cách đường cắt ≤ 3 px gần hốc. Viền ngoài (ring) và
silhouette không đổi, quạt nối ±16° giữ. Vạch mảnh trong r14 quanh hốc: v3 11/8/12/24/18 → v4 4/1/0/3/3 ở −10/−6/0/+6/+10.
Viền hở 0, khe 0 ở mọi góc. Ở ±10 (stress) còn 1 góc nhỏ do hai mép viền lệch hình học (đã có ở v3).
Số "0°: mũ + chóp khác mũ from_src" nay > 0 **có chủ đích** (bỏ gốc nếp) – và vẫn là so với mũ đã xử lý, không phải ảnh mẫu.

## 7. Chạy nháp tại chỗ (sau P0) – `chay_nhap.py`, `chay-nhap/`
- 8 khoá / chu kỳ 0,64 s (chạm đất, chịu lực, đạp, bay; nửa sau đổi chân), nội suy Catmull–Rom theo **thời gian**;
  xem trước 50 fps (32 khung, GIF 20 ms/khung). Mọi pha chân giải IK hai đoạn; **pha chịu lực khoá điểm đế trong thế giới**,
  trượt lùi với mặt đất 325 px TG/s (77,5 px logic/s); vào khoá 0,02 s trước chạm, nhả 0,03 s sau đạp. Pha bay không khoá đất.
- Đo (`chay-nhap.json`): sai số đế/cổ chân ở 18 mẫu khoá = 0,0000 px; trượt khi khoá 0; cần hạ root thêm 0; xuyên đất khi
  bay 0 (có kẹp); thiếu tầm tối đa 1,62 px TG ở khung nhả của chân xa (chân duỗi thẳng tối đa, không kéo xương).
- Vòng nối: khung t = 0 và t = 0,64 trùng (lệch góc 0, lệch root 0); bước góc tại mối nối 11,6° so với trung vị 12,0°,
  max 31,9°/khung.
- Đổi slot khi chạy: 0 lần (biến luật ≥ 30 suốt chu kỳ; đùi gần cục bộ 5,1–90,4°, gối tới 122° khi đùi < 30).
- Dải gối: gần 39–122°, xa 0–122° (giới hạn hông–cổ chân ≥ 42 px khi bay). Chân xa nhấc thấp (×0,7) và bước dời ra sau
  32 px vì hông xa gắn thấp/sau (ảnh 02) – xem phần đề xuất.
- Ảnh 112 px: scale đồng nhất, khung 133×124 logic cố định; GIF 1:1 và ×4 trên sáng/tối/caro; vạch đất chạy lùi để thấy
  khoá chân.

## File / hàm đổi (trước → sau)
| File | Thay đổi |
|---|---|
| `khung.py` | + `ATTACH_V4`, `VISIBLE_FALSE`, `thu_tu_phu()`, `IK_CHAINS`, `GIOI_HAN_GOC*`; − `AN_KHI_NGHI`; `PHU` + kieu; luật slot + `bu` |
| `khuon3.py` → `khuon4.py` | + `frame_st`, `side_extent`, `shade_interval`, `_morph_interval`, `elbow_transition`; `build(cfg)` khuỷu v4 mặc định (`{'khuyu':'v3'}` để đối chứng, `khuyu_Z`); `hood_pieces(hoc_r, hoc_mu)` |
| `rap3.py` → `rap4.py` | + visible / `pose.hien`, sắp lớp `(slot, thu_tu_phu, ten)`, phát hiện chu trình, `solve_ik`, `ankle_target`, `contact_world`, `ha_goc_can_thiet`, `rule_value` (khi.bu), `slot_override`, `render(flip_x)` |
| `meta.py` | schema_version, world_to_logic, thu_tu_xu_ly, sap_lop, lat_ngang, visible, thu_tu_phu, diem_de |
| `xuat.py` | `rig_v3` → `rig_v4`, `diem_de()`, `extra_meta(pc, dims)` + ik/khoa_chan/gioi_han_goc, font fallback |
| `thu3.py` → `thu4.py` | viết lại; + khe mở gần khớp (bao đóng r3), khuỷu Z, cổ tay/dao, lean IK, mảnh tắt, vạch hốc, slot liên tục |
| mới | `kiem_json.py`, `chay_nhap.py`, `chung.py` |
| bỏ | `kiem_chuyen_doi.py`, `v2ref.py` (chỉ phục vụ đối chứng v2; v3 là baseline) |

## CHƯA kiểm chứng / ĐỀ XUẤT (chưa duyệt)
- Chưa chạy HTML5 Canvas, **chưa chạy Safari/iPhone**, chưa đo FPS hay chi phí IK trên máy thật. Ảnh 112 px thu bằng
  Pillow LANCZOS, khác `drawImage`. devicePixelRatio 2,17 là giả định bài thử.
- Sai số IK = 0 là hình học; chưa đo vị trí đế trên ảnh đã raster hoá.
- Chạy nháp là bản kiểm rig: khoá tư thế chọn tay, chưa qua duyệt animation; chân gần bị áo/tay dao che nhiều; chân xa
  nhấc thấp. **Không gọi đây là animation hoàn thiện.**
- Đề xuất cần chủ dự án quyết: (a) chân xa khi chạy – giữ cách dời bước ra sau 32 px + nhấc ×0,7 hay cho đế chân xa chạm
  đất cao hơn vài px (phối cảnh 3/4) để có chỗ nhấc; (b) có cần cẳng/ủng gần đè thân khi gối gập lớn (luật v4 giữ chúng sau
  thân ở vùng đó để tránh nhảy ảnh); (c) mảnh tối nhỏ trong nếp khuỷu gần khi gập 60–100°.
- Hysteresis 28/32 chưa đưa vào rig (không cần với chuyển động hiện tại); nếu đầu vào gameplay có rung, bật theo `thu4.slot_state`.
- Nét trong 6 / silhouette pass chưa áp (giữ viền 8, không distance-transform mỗi khung). Bóng chân chưa làm.
- v2 không được kiểm lại trong v4 (đã có ở v3); v3 là baseline.
