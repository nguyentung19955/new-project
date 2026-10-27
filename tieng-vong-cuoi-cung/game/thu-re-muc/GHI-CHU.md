# Màn thử RỄ MỤC – tường mục leo được (27/10/2026)

Viết cho người không rành kỹ thuật. Đây là **bản thử riêng**, sinh từ `game/demo.html` hiện tại bằng script (giống cách làm
`thu-quai-boss`); **KHÔNG sửa** `demo.html`, `build-demo.py`, `demo-doi-chieu-v3.html` (phiên khác đang sửa). Khi duyệt xong mới ghép
(mục 8).

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-re-muc/thu-re-muc.html
(thêm `?vao=remuc` để vào thẳng Rễ Mục – không phải đánh boss; phím **H** hoặc nút ▣: overlay collider; `?gan=sau`: lớp nền gần vẽ SAU Lam
để so sánh). Không `?vao=remuc` thì đi từ Cổng làng như demo; sau phòng boss có **lối xuống** ở chân tường phải.
**Chưa thử trên iPhone thật** – mọi ảnh / số đo là Chromium headless trên máy chủ Linux (không GPU); link githack chưa mở thử được từ máy chủ.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `dau-man.png` | đầu màn (960×540): sàn vào nối từ phòng boss, điểm lưu, miệng giếng, 2 cột tường mục (ván dọc sáng hơn), tầng trên khối phải (gốc rễ, nấm) |
| `tuong-muc.png` | Lam đang bám tường mục trái giếng, đồng hồ bám ≈ 100/120 → tường **nứt rộng + rung** |
| `tuong-muc-gay.png` | ngay sau khi **GÃY**: mảnh ván rơi dây chuyền từ trên xuống, chỗ gãy thành hốc tối, Lam rơi |
| `cuoi-man.png` | cuối hành lang: bậc 2 ô, quái, bào tử, chuông vỡ sát tường phải |
| `hanh-lang.png` | giữa hành lang: kén treo trần, bệ ván treo dây (asset v3), nấm sáng, giọt nước + vũng, quái |
| `*-xam.png`, `*-ghep-xam.png` | bản XÁM (và ghép màu \| xám cạnh nhau) của 3 ảnh chính – kiểm tương phản: nền / sàn / Lam / quái tách nhau rõ |
| `*-collider.png` | 3 ảnh chính + overlay collider: ô chặn vàng, cạnh lộ cam, bệ một chiều vạch lục, **tường mục = khung xanh ngọc + đồng hồ bám** (đứt = đang gãy, không chặn) |
| `lop-gan-truoc.png` / `lop-gan-sau.png` | cùng một góc giếng: lớp nền gần vẽ TRƯỚC gameplay (đã chọn) / SAU gameplay (`?gan=sau`) – xem mục 4 |
| `lam-di-het-re-muc-60fps.mp4` | **15,3 s, 60 hình/giây** (mỗi hình = 1 bước game): (1) rơi xuống giếng, bám tường mục → nứt → gãy sau 2 s → rơi xuống hành lang; (2) cắt cảnh: nhảy qua lại 2 tường mục (bám ngắn, không gãy) **leo ngược lên** sàn vào; (3) chạy hết hành lang (bào tử nổ khi tới gần, giọt nước, bậc) tới chuông vỡ. Bot bỏ quái (`?quai=0`) để không phải đánh |
| `iphone-844x390.png`, `so-do.json` | màn Bắt đầu iPhone ngang (nút Bắt đầu nằm trong màn, tap vào được); lỗi console / trang / tải hỏng = **0 / 0 / 0**; số đo nạp, bộ nhớ, toạ độ góc chụp |

## 2. Đã làm gì

**Asset Rễ Mục** (`art/re-muc/`, code trong `art/re-muc/code/`, chạy lại `python3 -B chay_het.py` ≈ 25 s) – làm y cách Làng Chuông đã duyệt:

| Phần | Kết quả |
|---|---|
| Nền 3 lớp 2x (`nen/`) | xa 0,08 · giữa 0,40 · gần 0,65, lặp ngang liền (chênh nối 0,86 / 0,67 / –). Làm tối + bớt màu: độ sáng trung bình **34 / 28 / 19** (Làng Chuông 42 / 40 / 26; Lam ≈ 62, da / mắt > 150) → bản xám Lam và quái vẫn nổi. Nấm sáng / sương xanh ngọc giữ sáng hơn chút (điểm nhấn). **Cuộn dọc** cùng hệ số (màn cao 2 màn hình): lớp xa phóng 9 % cho đủ cao; lớp giữa chỉ dời (dưới mép ảnh để trống – càng sâu càng vắng, tự nhiên); lớp gần **lặp dọc liền** (cắt theo đường ít chênh nhất, 0,81) |
| Gạch rễ mục (`gach/rm-atlas.png`, 59 ô) | 8 ô gen → liền mạch 64×64 (ô 1 lặp liền, 7 ô kia chung dải mép; kiểm nối 0,54–0,68 = không thấy nối), bảng 5 tông + tông mốc xanh ngọc. **Mặt trên KHÔNG rêu**: mép mục xám sẫm dày 4–7 logic, mép dưới lởm chởm, đốm + vệt mốc xanh ngọc, vệt mặt cắt sáng dưới viền – dựng bằng code, 4 biến thể. Tường / đáy / góc / cột / gờ / khối / góc trong: thân + viền đen chỉ ở cạnh lộ. Ván mục một chiều (code: ván xám nâu, 2 khe, đầu răng cưa). 6 ô dốc (xuất sẵn, **chưa đặt** vì engine chưa có va chạm dốc) |
| Đồ vật (`do-vat/`, 15 ảnh) | tách nền, cùng tỷ lệ 0,42 → nấm nhỏ 53 logic, nấm lớn 72, gốc rễ 77, kén 97 (neo đỉnh), chuông vỡ 73, bào tử kín / nổ 73 (+ 3 bong bóng tách riêng), giọt 3 cỡ, vũng bắn / vũng lặng. Nấm, giọt, bong bóng giữ sáng (nguồn sáng); còn lại dịu 5 % |
| Trang trí (`trang-tri/re-muc-tt.json`) | **mảng rễ** `mang-re-1..4` (≈ 112 logic) che vân lặp – dựng từ chính 8 ô thân phóng 2,3× cắt mảng lởm chởm, tối 7 % (mức đã duyệt); **chân rễ góc** `chan-re-1/2` từ gốc rễ mục. Cùng dạng JSON với `cong-lang-v3.json` → module `trang-tri-dia-hinh.js` dùng được ngay |
| Tường mục leo được (**TẠM**) | `rm-muc-lanh / -nut / -nut-2` + 4 mảnh rơi: dựng từ ô thân thành 3 tấm ván dọc sáng hơn thân, mốc ở mép, nứt chéo → nứt rộng + mẻ. Chờ ảnh gen `re-muc-mep.png` (prompt mục 7) |

**Màn thử** (`thu-re-muc.html`, bản đồ ô 32 trong `cong-cu/khoi-re-muc.js` → `dungBanDoRM`): phòng **Rễ Mục** rộng 42 ô × cao **36 hàng** (≈ 1,4 × 2,1 màn
hình), nối sau Phòng boss (mở chân tường phải phòng boss hàng 8–13). Sàn vào hàng 14 (= sàn phòng boss) → **giếng** cột 9–12 → rơi 1 màn
→ **hành lang** hàng 23–31 → sàn hàng 32, kết thúc ở tường phải. Trong màn: điểm lưu, 2 tường mục (cột 8 hàng 18–31 lộ phải; cột 13 hàng
15–21 lộ trái), nấm sáng ×3, gốc rễ, kén treo trần, bệ ván treo dây 3 ô (asset v3, collider `=` giữ nguyên), bậc 2 ô, giọt nước + vũng, 2
bào tử, chuông vỡ, 2 quái chuông gỗ có sẵn tuần tra sàn. **Camera dọc**: theo Lam (chân ở 62 % màn), kẹp trong phòng, mượt 0,1; phòng cũ
giữ như demo. Nền chuyển mờ 0,5 s Làng Chuông ↔ Rễ Mục khi đổi phòng. Trang trí áp theo module `trang-tri-dia-hinh.js`
(`game/runtime/trang-tri/re-muc.js`: 12 mảng rễ cắt theo ô đặc, 4 chân rễ góc, 1 bệ ván treo) – giữ collider, không mặt đứng giả, cùng hệ
toạ độ camera, seed cố định.

## 3. Tường mục – số gameplay TẠM (sửa ở đầu `cong-cu/khoi-re-muc.js`, bảng `MUC_SO`)

| Số | Giá trị | Nghĩa |
|---|---|---|
| `GAY` | **120 bước = 2 giây** | bám / trượt liên tục bấy nhiêu thì gãy |
| `NUT`, `NUT2` | 60, 100 | từ bước này hiện nứt / nứt rộng + mẻ; tường **rung** tăng dần (tối đa `RUNG` 2,5 px) |
| `HOI` | 0,25 | mỗi bước KHÔNG bám, đồng hồ giảm 0,25 → buông ra 4 bước mới "quên" 1 bước bám; nhảy qua lại nhanh vẫn tích dần (bám 12 bước, bay ~40 bước → mỗi vòng +2) |
| `MAT` | **180 bước = 3 giây** | gãy xong mất collider bấy nhiêu lâu (ô thành hốc tối, mảnh rơi) rồi mọc lại; **không mọc** khi Lam / quái đang đứng trong ô (chờ ra) |
| `MOC` | 40 | mọc lại hiện dần trong 40 bước (collider có ngay) |

Cách chạy: ô bản đồ kiểu mới **`M`** (tường mục) chặn như tường thường; Lam bám / trượt bình thường; mỗi bước bám có chạm ô `M` thì đồng hồ
của **đoạn** tường đó +1. Gãy: cả đoạn (cột ô `M` liền nhau) đổi thành `r` (không chặn), 4 mảnh / ô rơi dây chuyền từ trên xuống + bụi, rung
máy nhẹ, Lam rơi. Chỉ Rễ Mục có ô `M`, phòng cũ không đổi.

## 4. Lớp gần vẽ TRƯỚC hay SAU gameplay – đã thử cả hai, chọn TRƯỚC

`lop-gan-sau.png`: lớp gần là 2 khung rễ tối ở mép trái / phải màn, cao suốt màn. Vẽ SAU Lam thì ở sàn vào (Lam đứng sát mép trái phòng) và
mép phải cuối hành lang **rễ che Lam, quái và mép sàn** (tư vấn: tiền cảnh không được che đường đi / đòn đánh); khi cuộn dọc nó còn "trôi"
như tấm phông trước mặt. Vẽ TRƯỚC (`lop-gan-truoc.png`, mặc định) thì phần lớn khung rễ nằm sau khối địa hình đặc, chỉ ló ở miệng giếng
và hành lang → sâu hơn mà không che gì. Muốn có tiền cảnh thật thì gen riêng 2–3 cụm rễ nhỏ sát mép trên như Làng Chuông v2 (mục 7).

## 5. Bộ nhớ ảnh (ảnh đã giải mã, đo trên máy kiểm)

| | MB |
|---|---|
| Nền Rễ Mục 2x: xa 1773×1178 (8,4) + giữa 1559×1080 (6,7) + gần 1619×880 (5,7) | 20,8 |
| Atlas gạch rm (1024×264) + 15 đồ vật | 1,4 |
| Trang trí: atlas `re-muc-tt.png` 1024×372 (1,5) + nướng 12 mảng rễ (≈ 2,4) | 3,9 |
| **Rễ Mục thêm** (ngoài 28,4 MB Làng Chuông + 14,8 quái/boss + 7,9 trang trí 3 màn đã có) | **≈ +26 MB** |

Nạp + giải mã Rễ Mục 175 ms (localhost). Bản thử nạp rời từng file (không có bản build tự chứa). Muốn bớt: nền giữa + gần có thể thu ½
như tiền cảnh Làng Chuông (−6 MB) hoặc nhúng WebP khi build.

## 6. Còn chưa đẹp / cần quyết

1. **Tường mục là TẠM**: 3 tấm ván dọc dựng bằng code, phân biệt được với thân nhưng chưa "mục" (thiếu xơ, mối mọt, nấm). Mảnh rơi nhỏ (16 logic), nhìn như sỏi.
2. **Thân rễ mục** vẫn là lưới rễ nhỏ dày (giống nhận xét Làng Chuông v2: ảnh gen vẽ rễ to cho 1 ô lớn, co về 32 logic thành lưới); mảng rễ phóng 2,3× che được một phần nhưng chỉ là chính vân đó phóng to, hơi "mảng tối".
3. **Mép mục** (mặt trên) mỏng, nhìn ở 960 chỉ thành dải sẫm + vài chấm xanh ngọc; có thể cần dày hơn hoặc ảnh gen mép riêng.
4. Khối phải tầng trên (hàng 14, trên trần hành lang) là **ngõ cụt trang trí** (nhảy qua giếng tới được) – có gốc rễ + nấm, không có gì để làm.
5. Hành lang chỉ 1 màn rưỡi, bệ ván treo cao 96 (nhảy tới được) nhưng không dẫn đi đâu; bậc 2 ô chỉ để nhảy qua.
6. Kén treo chỉ đung đưa; bào tử nổ chỉ là hình (không gây sát thương), 3 giây sau kín lại; giọt nước chu kỳ 2,5 s.
7. Khi tường mục gãy mà Lam đứng ngay trong hốc, tường không mọc lại cho tới khi Lam ra (đúng ý, nhưng hốc ở chân tường trái tới sát sàn hành lang → có thể "đứng trong tường").
8. Dốc xuất sẵn nhưng engine chưa có va chạm dốc nên chưa đặt. Bản xám: sàn và trần (cùng gạch) chỉ khác nhau nhờ viền + mép mục.
9. Nền giữa có cầu ván gãy / nấm khá rõ ở nửa trên màn – ở sàn vào hơi "đông"; càng xuống sâu càng trống (chủ ý).
10. Chỗ nối phòng boss → Rễ Mục: sàn gỗ-rêu Làng Chuông gặp sàn rễ mục nối thẳng, chưa có ô chuyển tiếp (như chỗ đá gặp gỗ đã ghi ở Làng Chuông); nền chỉ chuyển mờ 0,5 s. Trong demo thật, hạ boss xong là màn kết thúc nên đường đi bộ xuống Rễ Mục chưa dùng tới (bản thử: `?vao=remuc`).

## 7. Ảnh cần gen (prompt ngắn, nền trắng, cùng phong cách; đính kèm Lam + `xem-thu/tuong-muc.png`)

- **`re-muc-mep.png` – tường mục leo được, 3 trạng thái** (quan trọng nhất, thay bản TẠM):
  > 2D platformer tile strip, 3 states of the SAME rotten wooden wall section, 1 tile wide × 3 tiles tall each, side view, white background, chunky flat colors matching the reference hero: (1) intact – pale grey-brown dry rotten wood, vertical grain, teal mold patches at the edges; (2) cracked – same wall with dark diagonal cracks and a few chips; (3) broken – splintered gap with 6–8 loose wood fragments drawn separately beside it. Dark outline only on the exposed right edge. Must tile vertically.
- **Mép mặt trên rễ mục** (thay mép dựng bằng code): "top-edge tiles of rotten root ground, 4 seamless variants, crumbling dark rotten crust 6 px thick with teal-green mold spots and one small mold drip, NO grass, NO moss carpet, flat colors, white background, 32 px logical tile".
- **Mảng rễ mục lớn** (thay mảng phóng từ ô): "large decorative rotten-root overlay, 512×512, transparent background, 2–3 thick cracked decaying roots with hollow dark cavities and teal mold, muted grey-brown, thin dark outline, no moss".
- **Tiền cảnh Rễ Mục** (nếu muốn lớp 1,05 thật): "single FOREGROUND layer 32:9, transparent, 3 small dark broken root clusters entering from the TOP edge only, nothing in the lower 60 percent, faint teal rim light".
- Tuỳ chọn: **ván mục một chiều** 3 mảnh (đầu trái / giữa lặp / đầu phải, mặt ván mục xám có mốc).

## 8. Cách ghép vào `demo.html` (khi duyệt)

Mọi chỗ đổi đã nằm trong `cong-cu/tao-tu-demo.py` dạng cặp (cũ → mới); cột `ghep=True` là **30 chỗ cần ghép**, in ra khi chạy script. Gồm:
1. `ROWS` 17 → 36; thêm phòng `RM=room('Rễ Mục',42); RM.h=36`; phòng cũ đặc từ hàng 14 tới đáy; mở chân tường phải phòng boss + gọi `dungBanDoRM()`.
2. `solidC` thêm `R`, `M`; điểm lưu + 2 quái Rễ Mục; boss chỉ thức khi `S.room===RE.i` (không thức khi Lam đã xuống Rễ Mục).
3. Camera dọc: `S.camy=camYRM(r)`, lưu `S.pcy` và nội suy `oy` trong `render`; `placePlayer` đặt `camy`.
4. Gạch: chất liệu `rm-` cho ô `R`/`M`, ván `rm-van-*` trong phòng RM; vẽ ô `M` qua `MUC.ve`; `RMV.ve` sau `TT.ve('mat')`.
5. Nền: `veNenRM` thay vòng `veLop`; `drawTienCanh` bỏ rễ treo Làng Chuông ở Rễ Mục; hook `MUC.bam()` ở chỗ bám tường, `RMV.buoc()` sau `updateHazards()`.
6. Nạp: `napRM()` + gộp atlas gạch (`gopGach` → `keoMepGach`), trang trí gộp 2 JSON (`napTTGop` – hoặc chép 6 ô Rễ Mục vào `cong-lang-v3.json` + thêm atlas `re-muc-tt.png`); `TT.khoiTao` `go` thêm `R`; sau `TT.nuong()` gọi `MUC.dung(); RMV.dungDoVat()`; overlay H thêm `MUC.veCollider`.
7. Thêm `<script src="runtime/trang-tri/re-muc.js">`, `SRC.rm`, `SRC.rmtt`; chèn phần GHÉP của `khoi-re-muc.js` (từ đầu tới trước dòng `/* === THỬ`) trước `boot()`.
`build-demo.py` khi đó cần nhúng thêm `art/re-muc/` (nền WebP, atlas, đồ vật) như `TV.NHUNG.lc`. Không ghép phần THỬ (`?vao=remuc`, bot, `TVTHU`).

## 9. File và cách chạy lại

```
art/re-muc/code/      chung_rm.py (đường dẫn, dùng lại hàm Làng Chuông) · nen_rm.py · gach_rm.py · do_vat_rm.py · trang_tri_rm.py · chay_het.py
art/re-muc/nen/ gach/ do-vat/ trang-tri/ xem-thu/            kết quả (JSON kèm cỡ, hệ số cuộn, neo)
game/runtime/trang-tri/re-muc.js        dữ liệu đặt trang trí Rễ Mục (sửa vị trí ở đây)
game/thu-re-muc/thu-re-muc.html         bản thử (SINH RA, đừng sửa tay)        python3 game/thu-re-muc/cong-cu/tao-tu-demo.py
  cong-cu/khoi-re-muc.js                khối Rễ Mục: bản đồ, nạp, nền, camera, tường mục (MUC_SO), đồ vật, bot, API TVTHU
  cong-cu/chup.py                        ảnh duyệt + xám + collider + so-do.json + kiểm iPhone     python3 -B game/thu-re-muc/cong-cu/chup.py
  cong-cu/quay-video.py                  video 60 fps (thêm "collider" để quay bản bật overlay)   python3 -B game/thu-re-muc/cong-cu/quay-video.py
  xem-thu/                               ảnh, video, so-do.json
```
Không có kiểm thử tự động: `chup.py` / `quay-video.py` chỉ chụp, quay và ghi số đo cho người duyệt xem.
