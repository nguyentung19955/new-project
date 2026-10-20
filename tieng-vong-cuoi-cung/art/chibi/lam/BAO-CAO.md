# Báo cáo tách khung chibi Lam (2026-10-20)

Chỉ xử lý ảnh, chưa đụng game. Chạy lại toàn bộ: `sh tools/chibi-lam-chay-het.sh` (từ thư mục `tieng-vong-cuoi-cung/`; gồm cả `tools/chibi-so-sanh-co.py`).

> Cập nhật đợt 2: idle thật lấy từ `idle-6.png`; bộ khung từ `idle.gif` cũ chuyển sang `khung/rut-dao/`. Xem `art/chibi/BAO-CAO-2.md`.

Script chính: `tools/chibi-tach-khung.py` (vào: ảnh/GIF; `--hang/--cot` hoặc tự dò; `--ra` thư mục ra; `--bay` khung bay; `--mat` cỡ; `--ti-le` ép tỉ lệ).

## Kết quả

| Animation | Nguồn | Số khung | Tỉ lệ (nguồn → ô 512) | FPS xem thử |
|---|---|---|---|---|
| idle | idle.gif | 6 | 0,833 | 8 |
| run | run-6.png | 6 | 0,625 | 12 |
| attack | attack-6.png | 6 | 0,606 | 14 |
| combo-1 … combo-5 | combo-20.png | 4 × 5 = 20 | 1,071 | 14 |
| goc-nhin | goc-nhin-8.png | 8 | 0,714 | 4 |

Mỗi thư mục `khung/<anim>/`: `khung-N.png` (512×512 RGBA), `256/khung-N.png`, `128/khung-N.png` (Lanczos), `xem-thu.gif` (cỡ 256, nền xám tối).
`khung/so-sanh-co.png`: 3 khung ở 512/256/160/128/96/64 px cao. `khung/*.json`: số đo từng khung.

**Lưu ý cỡ:** bản 256/128 là cỡ **ô**; nhân vật đứng chiếm ~67% chiều cao ô (đứng thẳng ≈ 345 px trong ô 512 → ≈ 172 px ở bản 256, ≈ 86 px ở bản 128).

## Cách làm (tóm tắt)

- **Bỏ nền:** flood fill từ mép theo màu gần nền (trắng/kem đo ở viền ảnh). Lỗ trắng kín giữa tay–thân, giữa hai ủng cũng được xoá, **trừ** khi viền quanh là kim loại xám (lưỡi dao) hoặc có quầng vàng (mắt). Mép mềm 2 px + khử ám trắng. Đã kiểm: lưỡi dao bạc còn đủ ở mọi khung có dao, mắt còn đủ.
- **Tách khung:** thành phần liên thông lớn, sắp theo hàng rồi cột; mảnh rời nhỏ ghép vào khung gần nhất. Số khung tìm được đúng bằng số mong đợi ở cả 5 tấm.
- **Tỉ lệ:** đo chiều cao **mắt** (đốm vàng phát sáng), lấy phân vị 75 của cả tấm → **một hệ số cho cả tấm**, không scale riêng khung nào. Chuẩn: mắt cao 15 px trong ô 512 (mau-goc.png: mắt 53 px / người 1247 px → người đứng ≈ 353 px). Không đo theo mũ vì mũ đổi dáng mạnh theo góc nhìn (chóp mũ lúc dựng lúc bẻ ngang); mắt là chi tiết ổn định nhất. 15 là mức lớn nhất mà không khung nào bị cắt (combo-3 khung 3 dao dài nhất).
- **Pivot:** giữa hai đế ủng (dò màu nâu ở 40% dưới), đáy chạm y = 500 (chừa 12 px). Không căn giữa bbox.
- **Khung bay** (khai báo tay): mắt đặt ngang mắt khung đất **trước** gần nhất, chân lơ lửng; không bao giờ kéo chân xuống dưới đất.
  - run 2, 5 (pha bay): nhấc 28 và 37 px (ô 512). Nếu thấy nảy quá, bỏ `--bay 2,5` trong script.
  - combo 6, 7, 8: nhấc 29 / 36 / 9 px.
  - combo 4, 5, 13, 14: đầu vẽ **thấp hơn** khung đất kề bên → giữ đầu ngang thì chân xuống dưới đất, nên đành đặt chạm đất. Cú nhảy bổ (13–14) vì vậy trông như đứng tại chỗ; trong game cần cộng độ cao nhảy bằng code.

## Lỗi theo từng animation (thật thà)

**idle.gif — KHÔNG phải idle.** Đây là đoạn rút dao (gần như bản sao attack-6): khung 1–3 gần trùng attack 1–3; 4–6 cầm dao ngang. Không có thở/đung đưa chuông. Mỗi khung trong GIF gốc để 1 giây. Khung 1≈2, 4≈5≈6 gần trùng. → **Nên gen lại idle thật**, bỏ cả 6 khung này (hoặc dùng làm "rút dao").

**run (6 khung)** — dùng được, đọc tốt nhất trong bộ. Mắt 1 (nghiêng) đúng, dao luôn trong bao. Lỗi: nhịp chưa đối xứng — chỉ khung 3 là tư thế chân khép (passing); nửa sau (4–6) không có khung khép tương ứng, khung 6 lại sải chân giống khung 1 → vòng lặp hơi giật ở 6→1. Chuông ở 1–2 nằm cao sau gáy, 4–6 tụt thấp hơn. Khung 3 bao dao thòng dài hơn hẳn.

**attack (6 khung)** — thực chất chỉ là **rút dao**, không có nhát chém. Khung 1≈2≈3 gần trùng (tay đặt ở chuôi), 4–6 gần như cùng một tư thế cầm dao chúc xuống phía sau. → Giữ 1, 3, 4 làm "rút dao"; cần gen thêm nhát chém.

**combo-1 (chém/lao, khung 1–4)** — **dao đổi tay**: khung 1 cầm ở tay sau (chúc xuống phía sau), khung 2–4 cầm ở tay trước đâm ra trước. Khung 2≈3 gần trùng (chỉ duỗi thêm chút). Khung 4 lao trên không, đặt chạm đất (xem trên).

**combo-2 (xoay trên không, 5–8)** — thứ tự xoay hợp lý (trước → quay trái → lưng → quay phải). Lỗi: khung 5 nhìn thẳng nhưng **chỉ 1 mắt** (thẳng phải có 2 như goc-nhin 1). Chuông khung 7 ở giữa lưng (giống goc-nhin lưng) — ổn.

**combo-3 (đâm, 9–12)** — ổn nhất trong combo. Khung 10≈11 gần giống (11 chỉ với xa hơn). Khung 12 dao giơ chéo lên: chuyển sang hàng 4 hợp lý.

**combo-4 (nhảy bổ xuống, 13–16)** — 13≈14 gần trùng. 13–14 bị đặt chạm đất (xem phần khung bay). 15–16 đâm xuống đất ổn.

**combo-5 (thu dao, 17–20)** — **dao đổi tay** 17 (tay trước) → 18–20 (tay sau). 18≈19≈20 gần trùng, và **dao không hề được tra vào bao** — hàng này không "thu dao". → Bỏ 19, 20; gen lại đoạn tra dao.

**goc-nhin (8 khung)** — tỉ lệ đều, đúng mẫu. Lỗi: khung 1 (chính diện) **mất chuông** (mau-goc có chuông ở vai trái). Ở các góc khác chuông chạy giữa vai và giữa gáy — không thống nhất với mau-goc (vai), nhưng thống nhất với run/combo (sau gáy).

**Tỉ lệ đầu giữa các tấm:** cùng hệ số theo mắt, người trong combo thấp hơn attack/idle ~5% ở tư thế tương đương (combo-5 cao 264–267 px vs attack 4–6 cao 278 px; idle cao hơn attack ~3%). Tức là combo vẽ mắt/đầu to hơn chút. Mắt thường không thấy rõ khi chơi; nếu muốn khớp tuyệt đối thì chạy combo với `--ti-le 1.12`.

## Nên gen lại (prompt ngắn, dán kèm mau-goc.png)

- idle (6 khung): `Chibi hooded rogue from reference, idle breathing loop, 6 frames in a row, dagger sheathed on hip, bell on shoulder sways slightly, side view facing right, plain white background.`
- attack – nhát chém: `Same chibi rogue, one dagger slash: anticipation, swing, follow-through, recover, 4 frames, dagger always in front (right) hand, side view facing right, white background.`
- combo-1 khung 1: `Same chibi rogue, ready stance holding dagger in front hand pointing forward-down, side view facing right, white background.`
- combo-2 khung 5: `Same chibi rogue mid-air spin, facing viewer with two glowing eyes, dagger in right hand extended, white background.`
- combo-4 khung 14 (thay bản trùng): `Same chibi rogue at jump apex, dagger raised overhead in both hands, body higher than previous frame, white background.`
- combo-5 thu dao (thay 18–20): `Same chibi rogue sheathing dagger into hip scabbard, 4 frames, front hand only, side view facing right, white background.`
- goc-nhin khung 1: `Same chibi rogue front view, two glowing eyes, brass bell visible on left shoulder, white background.`
- run (tuỳ chọn, để nhịp đều): `Same chibi rogue run cycle, 6 frames: contact, down, passing, contact (other leg), down, passing; side view facing right, white background.`

## Cỡ trong game — nhận xét

Xem `khung/so-sanh-co.png` (cao tính theo hình):
- **160 px:** mắt, chuông, dao, khoá thắt lưng đều rõ. **Khuyên dùng.**
- **128 px:** mắt và dao vẫn rõ; chuông còn là chấm đồng nhỏ, nhận ra nếu biết trước. Mức thấp nhất còn giữ được "chất" chibi.
- **96 px:** mắt còn đọc được, chuông gần như mất, chi tiết áo nhoè.
- **64 px:** chỉ còn bóng dáng mũ + mắt; không hợp với ảnh vẽ chi tiết thế này.

Nếu nhân vật cao 160 px thì dùng ô ≈ 512 × 160/345 ≈ 240 px (thu nhỏ từ bản 512, không dùng bản 128).
