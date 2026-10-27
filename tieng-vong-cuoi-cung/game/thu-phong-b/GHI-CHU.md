# Trang thử PHÒNG B hướng mới (28/10/2026)

Viết cho người không rành kỹ thuật. Làm đúng bước đầu của mục **"THỨ TỰ THỰC HIỆN"** trong
`art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md`: **chỉ phòng B (Sân hai Chuông Gỗ)**, đưa nền xa mới + thân đất mới vào, giữ đồ cũ đã chỉnh màu.
Chưa áp sang A, C–F. **Chưa thử trên iPhone thật** – mọi ảnh / số đo là Chromium headless trên máy chủ Linux không GPU.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-phong-b/index.html
(vào thẳng phòng B; đi sang trái là phòng A, sang phải là phòng C – hai phòng đó vẫn là đất / nền cũ đã chỉnh màu).

| Thêm vào địa chỉ | Để làm gì |
|---|---|
| (không thêm) | bản mới |
| `?moi=0` | tắt hết phần mới (nền, đất, đèn, HUD, nút) – chỉ còn màu HM, để so |
| `?nen=0` / `?dat=0` / `?hud=0` | tắt riêng nền mới / đất mới / HUD + nút mới |
| `?vao=a` | vào phòng A như `thu-p0a` |
| các cờ của `thu-p0a` | `?hitbox=1`, `?debug=input`, `?p0=0`… vẫn dùng được |

Trang này **sinh bằng script** từ `game/thu-p0a/index.html` hiện tại (`cong-cu/tao-tu-p0a.py`) – không sửa `thu-p0a/`, `demo.html`,
`build-demo.py`, `thu-bo-vo-moc/`, `docs/gameplay/`. Khi phiên Âm Đao sửa `thu-p0a` xong, chạy lại script là có bản mới (script báo lỗi rõ nếu chỗ móc bị đổi).

## 1. Xem gì trước (`xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **TRƯỚC (thu-p0a) \| SAU**, 960×540, cùng một khoảnh khắc: Lam chém trúng Chuông Gỗ 1 (vệt chém + số 10), Chuông Gỗ 2 đang **lấy đà** (lóe vàng + dấu "!") |
| `ghep-truoc-sau-xam.png` | như trên, bản xám – kiểm Lam / quái / vệt / dấu báo có nổi hơn nền không |
| `truoc-chien-dau*.png`, `sau-chien-dau*.png` | từng ảnh rời (màu + xám) |
| `iphone-844x390-truoc.png` / `-sau.png` | giả lập iPhone ngang 844×390 @3x, có HUD + nút cảm ứng + dòng gợi ý |
| `lam-danh-2-chuong-go-60fps.mp4` | 7,5 s, 60 hình/giây (mỗi hình = 1 bước game), H.264 `-preset veryfast`: bot điều khiển Lam đánh gục 2 Chuông Gỗ |
| `kiem-mep-*.png` | **ảnh kiểm liền mép** (mục 3), vẽ bằng CHÍNH code của game; bản `-collider` có nét đỏ = mặt trên collider, cam = cạnh |
| `so-do.json` | số đo (thời gian vẽ, nạp, vùng chạm, lỗi trang = 0) |

Quay / chụp lại: `python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py [mep] [anh] [iphone] [do] [video]` (cần playwright, Chromium, ffmpeg, Pillow).
Đây chỉ là công cụ chụp / quay / ghi số, **không phải kiểm thử tự động**.

## 2. Đã làm gì

**Nền** (`art/huong-moi/dia-hinh/nen-xa.jpg`, `nen-giua.png`)
- `lang-xa-tan.png` là **nền xa chính** (cuộn 0,08 như cũ, dọc 0,15). Ảnh không lặp liền → lặp **soi gương** (bản kề lật ngang) nên không bao giờ có đường nối.
  Đã làm nền lùi sau sàn + nhân vật: giữ 72 % tương phản, tối 20 %, dải ngang tầm chiến đấu (y ≈ 300–450) tối thêm ~14 %.
- `lang-giua-tan.png` dùng **thưa**: chỉ tách 3 mảnh (cây chuông trái, tháp cửa sổ, cây chuông phải), cuộn 0,40 như cũ.
  Mỗi mảnh giảm tương phản 25–28 %, tối 16 %, **giảm ánh vàng phụ** (2 cây hai bên giữ 35 % sắc vàng, tháp giữa 55 %).
  Hai cây đặt sát 2 mép màn, ngoài vùng tuần tra của 2 Chuông Gỗ; tháp đứng sau **ván một chiều** giữa sân (chỗ không có quái).
  **Đường cắt dưới thân cây** đặt 22 px dưới mặt sàn → luôn nằm sau địa hình (kể cả camera cảm ứng lệch 28 px). Mép trên ảnh gen bị cắt → mờ 40 px, nằm trên mép màn.
- Lệch cuộn tính theo **trục giữa phòng** (biến `S.rc` có sẵn) → camera ở giữa phòng là đúng bố cục đã chọn, không phụ thuộc vị trí phòng trong thế giới.
- **Chưa thêm lớp gần**; trong phòng B bỏ luôn rễ treo tiền cảnh cũ. **Không có quầng sáng bám theo quái.**

**Thân đất** (`than-dat.png`, `mat-tren.png` – code `art/huong-moi/dia-hinh/code/tao.py`)
- Thân: 4 mảnh thân vuông của `gach-re-tan.png`, mỗi mảnh dùng ở **160 logic** (không nén vào ô 32), ghép 2×2 thành **khối lặp liền 320×320 logic**;
  đường nối giữa 4 mảnh sửa bằng **mask nhiễu** (ranh giới gồ ghề, trộn hẹp ~20 logic), màu trung bình 4 mảnh kéo về một. Trong game khối này **cắt theo ô**
  ở toạ độ thế giới (ô (x, y) lấy phần (x mod 10, y mod 10)) – ô kề nhau luôn liền.
- Mặt trên: **2 đoạn giữa** (A: từ đoạn giữa ảnh gen; B: phần trong của mảnh đầu trái, chỗ không có cây – để hai đoạn khác hẳn nhau) mỗi đoạn 128 logic
  + **đầu trái / phải** từ ảnh. Hai đầu MỌI đoạn được thay bằng cùng một "khớp" lấy từ giữa ảnh gốc → ghép A/B theo thứ tự nào cũng liền; chọn A/B theo băm vị trí cố định.
  Mép rêu san phẳng 70 % (giữ chút gồ ghề), **rêu nhô tối đa 3 px** trên mặt collider. Dải cao 100 logic, đáy mờ dần 22 logic vào thân.
- Đầu trái / phải: mép đứng của ảnh gen được **nắn thẳng** (giữ 30 % gồ ghề) để **nhô ra ngoài collider tối đa 3 px**; phía trong mờ dần (mask nhiễu) phủ lên đoạn giữa.
- **Cây / nấm ở hai đầu ảnh đã tách** thành trang trí riêng (`trang-tri-dh.png`, 6 mảnh) – không làm mép collider. Phòng B chỉ đặt 2 nấm nhỏ ở 2 mép phòng (sàn thoáng).
- Collider **không đổi**: code chỉ đọc lưới ô. Mặt trên chỉ vẽ ở ô đặc có ô trống phía trên (không có mặt đứng giả). Vẽ cùng toạ độ camera, làm tròn theo điểm ảnh thật như gạch cũ.

**Mép / cạnh / đáy / ván chưa có ảnh mới** – tạm dùng **mép cũ đã chỉnh màu** (khối màu HM của `thu-huong-moi`): ở cạnh lộ còn lại chỉ giữ dải ~5–11 logic sát cạnh,
mờ vào thân mới. Ván một chiều, đá vẽ nguyên ô cũ đã chỉnh màu. **Không dùng mảng gỗ che vân** ở phòng B. Khuôn cho ảnh gen: mục 4.

**Đèn lồng cũ** (`den-tron-sang` của làng hoàn thiện): giữ + chỉnh màu (HM), **thu còn cao 34 logic**, **giảm nét** (viền đen ngoài → nâu sẫm, mảnh hơn), dây mảnh,
quầng nhỏ (bán kính 46, độ mạnh 0,22) vẽ ở **lớp nền** – sau địa hình, sau nhân vật và mọi đòn → không che đòn. Chỉ 2 đèn, sát 2 mép phòng, cao (đáy y ≈ 150, đầu quái ở y ≥ 300).

**HUD + nút cảm ứng** (`game/runtime/giao-dien-huong-moi.js`, chỉ trang này, bằng code)
- **Vùng chạm giữ nguyên**: đo trong giả lập iPhone – dpad 135×135, Vọng / Chém / Lướt 62×62, Nhảy 74×74, cùng toạ độ ở TRƯỚC và SAU (`so-do.json` → `iphone.vung_cham`).
- Hình nút nhỏ hơn vùng chạm (lõm vào 17 %): nền than trong, viền đồng mảnh 1,5 px, ký hiệu màu ngà (SVG). Teal **chỉ** ở nút Vọng + thanh Vọng.
  Bỏ quầng teal quanh nút Vọng khi ghi, bỏ viền teal nhấp nháy toàn màn (còn viền mảnh tĩnh), bỏ nhấp nháy vàng của nút được gợi ý (chỉ viền sáng hơn).
- HUD: 5 chuông vẽ bằng code (đầy = đồng, rỗng = viền đồng), thanh Vọng 5 px: teal đầy = sẵn sàng; ngà ngắn dần = đang ghi; teal chạy = bóng đang lặp; teal mờ + chấm = bóng giữ.
  Dòng gợi ý trên cùng thu hẹp lại để không đè HUD (bản cũ đè lên HUD trên iPhone).
- Nút "Nói chuyện": gọn, không nhấp nháy; **ẩn ngay khi rời vùng NPC**, hộp thoại đang mở đóng khi đi xa 80 px (cũ 150). Phòng B không có NPC – móc này để dành khi ghép.

## 3. Ảnh kiểm liền mép (`xem-thu/kiem-mep-*.png`, cỡ 2x, nền xám xanh để lộ chỗ hở)

| Ảnh | Thấy gì |
|---|---|
| `hang-dai` | 40 ô sàn dài: đoạn A/B nối liền, không thấy khe; vẫn **nhận ra nhịp 128 logic** khi nhìn cả hàng (vòm rễ lặp) |
| `mang-4x4` | khối 4×4 lơ lửng: mặt trên + 2 đầu ổn; nửa dưới là **mép cũ** (dải rễ sáng kiểu cũ) – khác chất liệu, đúng là chỗ chờ ảnh gen cạnh / đáy |
| `goc-lom` | sàn gặp tường + bậc cao: mặt trên mờ vào thân tường; đầu trái của bậc dừng ở mặt sàn thấp; tường dùng mép cũ – **góc lõm chưa có mảnh riêng** |
| `be-don` | bệ 6×1, 6×2, khối 1×1: bệ mỏng bị cắt đáy thẳng + dải mép cũ; khối 1 ô chỉ chấp nhận được |

## 4. Khuôn chờ ảnh gen (`art/huong-moi/dia-hinh/khuon/`)

16 khuôn PNG **nền trắng, đúng cỡ ảnh 2x**, + tấm tổng `khuon-tong-4x.png` (1536×1024, có tên + cỡ) để gửi kèm prompt.
Xám = trong collider, hồng = được nhô ≤ 4 logic, đỏ = mặt đứng, xanh đứt = cạnh phải nối liền. Cỡ / cạnh nối ghi trong `khuon.json` (và `dia-hinh.json` → `khuon`).

| Chờ ảnh gen | Khuôn (logic) |
|---|---|
| **Prompt A** – cạnh đứng trái / phải, mỗi bên đầu / giữa / cuối | `canh-trai-dau/giua/cuoi`, `canh-phai-…` 36×64 (32 trong + 4 nhô) |
| **Prompt A** – mép đáy trái / giữa / phải (trần C, đáy bệ) | `day-trai` 68×36, `day-giua` 64×36, `day-phai` 68×36 (gồm góc lồi dưới) |
| Góc lõm (Claude dựng khuôn, AI tô theo) | `goc-lom-san-trai/phai`, `goc-lom-tran-trai/phai` 64×64. Góc lồi trên = 2 đầu của mặt trên (đã có) |
| **Prompt B** – ván một chiều trái / giữa / phải | `van-trai` 36×28, `van-giua` 32×28, `van-phai` 36×28 (ván dày 16, giá đỡ chĩa xuống tới 28; ván B 4 ô = trái + giữa ×2 + phải) |

Khi có ảnh: cắt theo khuôn, ghi tên tệp vào `tep_anh_gen` trong `khuon.json`, rồi thêm vào `dia-hinh-huong-moi.js` chỗ đang gọi `vienCu` (mép cũ) và ô `'='` (ván cũ).
Chạy lại khuôn: `python3 -B art/huong-moi/dia-hinh/code/khuon.py`; chạy lại bộ địa hình: `python3 -B art/huong-moi/dia-hinh/code/tao.py` (~8 s).

## 5. Đo (`so-do.json`; Chromium headless, máy KHÔNG GPU – chỉ để so TRƯỚC / SAU, **chưa đo iPhone**)

| Vẽ 1 khung (ms) | TRƯỚC (thu-p0a) | SAU |
|---|---|---|
| bot đánh 2 Chuông Gỗ, 600 khung: trung bình / 95 % / tối đa | 6,45 / 8,5 / 66,9 | 1,55 / 2,7 / 50,3 |
| đứng yên, 2 quái tuần tra, 600 khung | 6,37 / 9,3 / 117,8 | 1,45 / 2,0 / 120,5 |

SAU nhanh hơn vì nền cũ 3 lớp + tiền cảnh rộng được thay bằng 1 ảnh xa + 3 mảnh nhỏ, và đất được gộp thành ~39 lệnh vẽ (khung tối đa là giật lẻ của máy đo).
Nạp thêm: ảnh địa hình mới ~0,07 s, 16 MB bộ nhớ ảnh giải mã; khối màu HM (tô màu đồ cũ lúc nạp) ~1,2–1,9 s – trên iPhone có thể 3–5 s → khi chốt màu nên tô sẵn ra file.

## 6. Còn chưa đẹp

1. Hàng sàn dài vẫn lộ **nhịp lặp 128 logic** (vòm rễ). Cần thêm 1–2 đoạn giữa nữa (gen thêm hoặc lấy mảnh khác) nếu muốn hết hẳn.
2. Mặt trên ở bệ mỏng: ngay trên đường collider có một **dải tối 2–3 px** (nét viền rêu của ảnh gen sau khi san phẳng) trông hơi "nắp phẳng".
3. **Mép cũ** (tường, đáy bệ, khối lơ lửng) khác chất liệu rõ – chỉ là tạm tới khi có ảnh prompt A. Góc lõm chưa có mảnh.
4. **Ván một chiều cũ** (xám, mỏng) lạc tông nhất phòng B – chờ prompt B.
5. Nền giữa: khi camera chạy hết biên phòng, mép tháp giữa có lúc nằm sau đầu Chuông Gỗ (chênh cuộn 0,6 × 64 px); đã làm tối + giảm tương phản nên vẫn đọc được (ảnh xám).
6. Đi sang phòng A / C: nền và đất **đổi đột ngột** ở ranh giới phòng (chỉ phòng B dùng bộ mới).
7. Lam, Chuông Gỗ vẫn là hình cũ (viền cyan, rêu xanh) – chưa thuộc bước này.

## 7. Cách ghép sang thu-p0a / demo và các phòng A–F

Mọi code mới ở **module riêng**, trang chỉ cần vài dòng:
1. Thêm 2 thẻ script sau `lang-hoan-thien.js`: `runtime/dia-hinh-huong-moi.js`, `runtime/giao-dien-huong-moi.js`.
2. Trong `boot()` sau `dungGach(); dungDen();` (và sau `HM.chuanBi` nếu đã ghép màu HM): `await DHM.nap('<đường>/art/huong-moi/dia-hinh/dia-hinh.json'); DHM.dung({...});`
   – tham số y như hàm `PBK.optThat()` trong `cong-cu/khoi-phong-b.js`; **muốn áp cho phòng nào thì thêm khoảng cột của phòng đó vào `cot`** (vd. `[[PA.x0, PC.x0+PC.w-1]]` cho A–C).
3. Bọc 4 hàm vẽ như trong `khoi-phong-b.js`: `drawNen` (gọi `DHM.veNen` + `DHM.veDen`), `drawGach` (bỏ qua cột `DHM.coCot`, gọi `DHM.veDat`), `drawTienCanh`, `veHUD` (gọi `GDHM.veHUD`), `thBuoc`; gọi `GDHM.ap()` một lần.
4. Mỗi phòng cần một bộ số như `PB_SO.nen` (3 mảnh nền giữa đặt ở đâu – tránh vùng tuần tra quái), `PB_SO.den`, `PB_SO.trangTri`. A và F (an toàn, ấm) có thể giữ ánh vàng tháp, B–E giữ sàn thoáng.
5. Màu đồ cũ: các móc HM (cột `ghep=True` trong `cong-cu/tao-tu-p0a.py`, 7 chỗ, in ra khi chạy script).

## 8. File

```
game/runtime/dia-hinh-huong-moi.js         module DHM: nền, đất, đèn (dùng chung cho mọi phòng)
game/runtime/giao-dien-huong-moi.js        module GDHM: HUD + nút cảm ứng
art/huong-moi/dia-hinh/                    ảnh 2x + dia-hinh.json; code/tao.py (nền, đất), code/khuon.py (khuôn); xem-thu/ ảnh kiểm từng bước xử lý
game/thu-phong-b/index.html                trang thử (SINH RA, đừng sửa tay)      python3 game/thu-phong-b/cong-cu/tao-tu-p0a.py
  cong-cu/khoi-phong-b.js                  số đặt phòng B (PB_SO) + móc vẽ + API chụp (TVPB)
  cong-cu/chup-va-quay.py                  ảnh, video, số đo → xem-thu/
```
