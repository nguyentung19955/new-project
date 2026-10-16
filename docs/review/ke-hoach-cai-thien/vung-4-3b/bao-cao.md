# Vùng 4 Sông sâu — Phiên 3B: Thuồng Luồng pha 1, sân bãi đá giữa sông, Vỗ sóng bờ, khung đổi hệ theo pha

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 1.4, 2.4, mục 5 hàng "3B", mục 8.3; `QUYET-DINH.md` (Q1 = A: đổi hệ Độc → Băng → Lửa);
`docs/cot-truyen/CHUNG.md` (Thuồng Luồng là kẻ cầm đầu, sau này hoá Hắc Long — nên **không** dùng sóng âm theo nhịp trống, để dành Hắc Long);
báo cáo phiên 1, 2A, 2B, 2C (lời trùm + câu đổi pha của 2C đã có, giữ nguyên). Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node,
bot Node, `build.py`, ảnh soát tĩnh. Phiên 3A (tinh anh + Cá Trê) chạy song song: không sửa khối của họ (khối mini của `boss.js`, `chieu_trum.js`).

## Tóm tắt

- **Bộ chiêu riêng pha 1** thay `SK.thuong = SK.ngu` (mượn Ngư Tinh của phiên 1): **Quật đuôi**, **Phun nước đen**, **Vòng thân**, thêm **Đớp**
  (đứng sát đầu) và **Lặn đổi chỗ**. Chống đứng sát mép **Vỗ sóng bờ** có từ pha 1. Mọi đòn có vùng đỏ báo trước, né được bằng chạy (đã tính bằng
  tốc chạy của nhân vật chậm nhất, Cu Lì) hoặc lăn.
- **Sân bãi đá giữa sông**: phòng trùm 4-5 chỉ còn bãi đá **71% sàn** (242 × 154), quanh là nước sâu (như tường). Thân trồi khỏi nước ở mép trên,
  mép dưới (vẽ code, đổi màu theo hệ), **đầu ở mép phải**. Lối đá ở cửa. Hạ xong: **nước rút**, trả lại sàn cũ để đi tới cửa / nhặt đồ.
- **Khung đổi hệ theo pha** (mục 8.3): pha 1 **Độc** → pha 2 **Băng** → pha 3 **Lửa**. Mỗi pha: `b.el` đổi, một lớp **"Kháng <hệ pha>"** (25%) đứng đầu
  các lớp thích nghi → **điểm yếu = hệ khắc** (Lửa → Độc → Băng, +50% như luật cũ), thẻ dưới thanh máu tự đổi, thân đổi màu, dòng nhắc
  *"Hệ Băng: đánh bằng Độc!"* khi đổi pha và một lần lúc mở trận. Lớp thích nghi cũ vẫn chạy (trùng hệ thì gộp một thẻ). Sao thứ ba theo `b.weak`
  lúc gục → pha 3 là **kết liễu bằng Băng** đúng kế hoạch (phiên 3C không phải làm gì thêm cho sao thứ ba).
- **Pha 2, 3**: khung đã chạy (đổi hệ, đổi màu, chọn chiêu theo pha qua `S.chon`); chiêu riêng là việc **phiên 3C**. Tạm thời pha 2, 3 dùng ba chiêu
  pha 1 + Đớp + chiêu Ngư Tinh như phiên 1 (Bổ rìu san hô, Sóng thần, Cột nước đuổi; pha 3 thêm Xoáy hút) để độ khó không tụt.
- **Hình tạm**: ảnh Ngư Tinh nhuộm theo hệ từng pha (xanh rêu / xanh băng / đỏ cam), thân trồi + vòm + đuôi + sóng vẽ code. **Chỗ dựng ảnh thật**:
  có sprite `thuongLuong` (C71–C85) thì tự dùng, thôi nhuộm.
- **Không thêm phần thưởng, không đổi bản lưu**, không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Cờ quay lui

| Cờ | Tác dụng |
|---|---|
| `?tldoihe=0` (`G.TL_DOI_HE = false`) | **Một hệ Độc suốt trận** (kháng Độc, yếu Lửa cả 3 pha; nhuộm Độc cả 3 pha). Theo kế hoạch. |
| `?tlrieng=0` (`G.TL_RIENG = false`) | Tắt cả phiên 3B: Thuồng Luồng như phiên 1 (chiêu Ngư Tinh, sân thường, không lớp hệ). Dùng làm "trước" khi đo. |
| `?vung4=0` | Không có vùng 4; `js/thuong_luong.js` không làm gì (`G.thuongLuong = null`). |

## Tệp đã sửa

| Tệp | Thay đổi |
|---|---|
| `game/js/thuong_luong.js` (mới, nạp sau `song_luat.js`) | Toàn bộ phiên 3B: sân, chiêu, Vỗ sóng bờ, lặn đổi chỗ, đổi hệ, vẽ (sân ở lớp sàn qua móc `G.roomArt.lopSan` — nối sau móc của 2B; thân trồi / vòm là đồ vật `tlThan`, `tlVom` xếp theo chiều sâu; đầu: nhuộm ảnh mượn + bọt nước + mảnh trống trên trán sáng khi lộ điểm yếu), chữ tiếng Anh. Số liệu ở `CFG` đầu tệp. |
| `game/js/boss.js` | Chỉ **5 móc nhỏ ở phần chung** (không đụng khối mini của 3A): `makeBoss` gọi `G.thuongLuong.tao`; `thinkBig` đọc `S.chon` (chọn chiêu theo pha), `sk.anim` (chiêu mượn cử động khác — Đớp dùng `atk`), `S.nghi` (nghỉ sau chiêu riêng của trùm); `move` gọi `G.thuongLuong.di` (đầu chỉ trườn dọc mép phải); đổi pha gọi `b.doiPha`. Dòng `SK.thuong = SK.ngu` giữ làm đường lui cho `?tlrieng=0`. Trùm khác không có các trường này → y như cũ. |
| `game/index.html` | Thêm `<script src="js/thuong_luong.js">`. |
| `game/tests/thuong_luong.test.js` (mới) | 38 điều kiện (dưới). |
| `docs/review/ke-hoach-cai-thien/vung-4-3b/` | `do_trum.py` (bot đo trận), `do_trum.txt`, `so-lieu-do-trum.json`, `anh_soat.py` + `cac-luc.png`, `truoc-sau.png`, báo cáo này. |
| `game/dist/*` | Dựng lại. |

**Không sửa** `chieu_trum.js` (không cần: chiêu mới nằm trong tệp riêng, tránh đụng 3A), `env_art.js` (nền phòng đang vẽ qua `room_art.js` theme
River của 2B; sân trùm vẽ ở lớp sàn bằng móc `lopSan` thay vì nhánh `env_art.js` cũ — kết quả như kế hoạch, ít đụng hơn), `combat.js` (đổi hệ giữa
trận làm bằng lớp "kháng" có sẵn của luật thích nghi nên `G.damage`, thẻ dưới thanh máu, sao thứ ba tự theo).

## Chiêu (số trong `G.thuongLuong.CFG`)

| Chiêu | Người chơi thấy | Vùng đỏ / báo trước | Né | Sát thương (× b.dmg) |
|---|---|---|---|---|
| **Quật đuôi** (c1) | Đuôi trồi ở mép trên / dưới (phía em bé), quét ngang; rồi quất ngược sang mép kia | Dải sát mép dày 33% bề dọc sân, báo **1,15 giây**; dải mép kia nổ sau thêm 0,55 giây — **hai dải đỏ hiện cùng lúc từ đầu chiêu** | Đứng **giữa sân** (dải 34% giữa luôn an toàn). Từ sát mép đi bộ ra mất 1,08 giây (Cu Lì) | 1,6; mệt 0,3 giây sau quét |
| **Phun nước đen** (c2) | Tia nước đen từ miệng tới chỗ em bé, 3 lần, mỗi lần nhắm lại; để lại vệt độc 3 giây | Vạch rộng 22, báo **0,8** giây (lần 2, 3: **0,55**) | Bước ngang 17 điểm ảnh (0,31 giây); đừng đứng trên vệt | 1,3; vệt: vũng 0,3 × 0,5 mỗi 0,5 giây |
| **Vòng thân** (c3) | 3 khúc thân trồi thành 3 vòm (một vòm ngay chỗ em bé). Hai chân vòm chắn đường, thân vòm chắn đạn. Đầu trườn lên đá, **mảnh trống trên trán sáng: LỘ ĐIỂM YẾU 2 giây** (× 1,5 sát thương), đầu vẫn phun một tia | Vòm tròn bán kính 30, siết sau **2 giây** | Ra khỏi vòm (0,61 giây) | Siết 1,5; tia như Phun nước đen |
| **Đớp** | Em bé đứng sát đầu (< 84 điểm ảnh) thì trùm hay đớp (×3 trong túi chiêu); còn đứng sát thì đớp lần hai | Quạt bán kính 80, báo **0,6** giây (lần 2: **0,5**) | Lùi ra / lăn ngang | 1,5 |
| **Lặn đổi chỗ** | Mỗi 9–12 giây đầu lặn 1 giây (chỉ thấy gợn nước + vây lưng chạy dọc mép phải), trồi chỗ khác | — (không đánh) | — | Lúc lặn không nhắm / đánh trúng được |
| **Vỗ sóng bờ** (chống đứng sát mép, có **từ pha 1**) | Đứng cách mép trên / dưới / trái < 40 điểm ảnh quá **1,5 giây** → thân quẫy dưới nước mép đó, bọt tung, sóng tạt lên đá | Dải mép dày 44, báo **1,1 giây**; nghỉ 2,5 giây | Bước vào giữa sân (từ sát mép mất 0,99 giây). **Mép phải** (chỗ cái đầu) không tính | 1,2 |
| Vảy dựng gai (lớp "Chống áp sát") | Lúc đầu nằm trên đá (Vòng thân) | Vòng bán kính 44 quanh đầu, báo 0,6 giây | Lùi ra | 1,0 |
| Chống đánh xa (lớp cũ) | Bắn từ xa hơn 120 → 60% sức (luật cũ `rangedShield`) | | | |

Ghi chú thiết kế:
- Đầu luôn ở mép phải và chỉ trườn dọc (chậm, theo em bé). Bản đầu tiên để đầu đứng yên → bot chém liên tục, trận ngắn còn ~22 giây (so với
  ~31 giây của phiên 1). **Đớp** + **Lặn đổi chỗ** đưa thời gian hạ về ~32–38 giây (bảng dưới) và dạy "đừng đứng lì cạnh đầu".
- Không làm "sóng âm theo nhịp trống" (để dành Hắc Long, `CHUNG.md`). Không dùng lại kiểu "nước dâng" của Ngư Tinh.
- Phiên 2B để phòng trùm 4-5 không có dải dòng chảy; giữ nguyên (dòng nước đổi chiều là chiêu pha 2 của 3C).

## Đo bằng bot (trước / sau)

`do_trum.py 60`: bot chơi thật (mất máu, chết được) **chỉ phòng trùm 4-5**, vào phòng đầy máu, bản lưu `kiem-can-bang/luu-A.json` (ải 3-5) nâng tới
Sức mạnh khuyên dùng (cấp tối đa 40 → **662 / 690**, như 2B ghi). Hai vũ khí mang **ép cùng một hệ** (bot "chỉ dùng 1 hệ", mục 8.3 — không đổi vũ khí
giữa trận). 60 lượt mỗi ô, **cùng 60 hạt ngẫu nhiên** cho mọi bản. Trước = `?tlrieng=0` (phiên 1), sau = phiên 3B, một hệ = `?tldoihe=0`.

| Hệ bot | trước: thắng · tg hạ · đòn trúng/phút | sau | một hệ (`?tldoihe=0`) |
|---|---|---|---|
| Lửa | 28% · 32 giây · 14,8 | **45%** · 34 giây · 12,4 | 80% · 25 giây · 10,9 |
| Độc | 42% · 29 giây · 13,9 | **52%** · 31 giây · 10,5 | 33% · 39 giây · 10,8 |
| Băng | 52% · 31 giây · 12,9 | **52%** · 33 giây · 11,1 | 47% · 35 giây · 11,5 |
| **Trung bình** | **40,7%** | **49,7% (+9)** | 53,3% |

Máu mất (% máu tối đa mỗi phút) theo pha — thời gian TB mỗi pha / tốc mất máu:

| Hệ bot | trước: pha 1 · 2 · 3 | sau: pha 1 · 2 · 3 |
|---|---|---|
| Lửa | 7 giây / 191 · 11 / 457 · 8 / 366 | **5** / 119 · 11 / 325 · 13 / 340 |
| Độc | 8 / 235 · 9 / 412 · 8 / 370 | **11** / 281 · **6** / 328 · 8 / 293 |
| Băng | 7 / 182 · 11 / 342 · 11 / 331 | 8 / 225 · 13 / 329 · **7** / 205 |

Thời gian hạ khi bot **bất tử** (10 lượt mỗi ô, đo "trùm có thành bao cát không"): trước 31,9 / 29,1 / 31,9 giây (Lửa / Độc / Băng) → sau 36,7 / 32,4 / 38,5.

Đọc bảng:
- **Chênh +9 điểm thắng là do đổi hệ theo pha — đúng mục đích Q1 = A**, không phải chiêu dễ hơn: pha của hệ khắc thì bot đánh +50% nên pha đó
  ngắn hẳn (bot Lửa: pha 1 còn 5 giây so với 7; bot Độc: pha 2 còn 6 so với 9; bot Băng: pha 3 còn 7 so với 11), pha có hệ trùng thì bị kháng 25%
  nên dài hơn (bot Độc pha 1: 11 giây). Bot Băng (chỉ được lợi ở pha 3 ngắn nhất) **thắng như trước (52% = 52%)** → độ khó gốc của trận ngang phiên 1.
  Người chơi thật đổi vũ khí theo pha sẽ nhanh hơn nữa — đó là điều trận này muốn dạy. Muốn trận "chỉ 1 hệ" ngang hẳn phiên 1 thì phiên 4 nâng
  `G.BOSS_HP_OF.thuong` (20) chừng 10%, hoặc hạ `CFG.heKhang` (25% → 15%: bớt kéo dài pha trùng hệ — không đổi phần thưởng hệ khắc).
- **`?tldoihe=0`** (Độc suốt trận): bot Lửa thắng 80% (yếu Lửa cả 3 pha), bot Độc 33% (bị kháng cả 3 pha) — đúng như cờ mô tả, chỉ để quay lui.
- Không bế tắc: bot chỉ dùng 1 hệ, hệ nào cũng hạ được (bất tử: 32–39 giây), thua thì trùm còn 20–42% máu (trước 17–22%).
- **Kinh tế**: không thêm vàng / quặng / đá / mảnh / linh khí / Sức mạnh nào; trận dài thêm ~2–6 giây ở lượt thắng. Không dư thêm.
- Các bản chỉnh trong phiên (đã đo bằng cùng công cụ, 20–30 lượt): bản đầu (chỉ 3 chiêu, đầu đứng yên) thắng 100% / 22 giây — quá dễ, bot gần như
  không bị trúng (pha 1 mất 23% máu/phút so với 176%) → thêm Đớp, Lặn đổi chỗ, Quật đuôi hai dải, Phun 3 lần, tia trong Vòng thân, nghỉ sau chiêu pha 1
  0,9 giây (chiêu riêng dài hơn chiêu Ngư Tinh) → bảng trên. Báo trước vẫn đủ đi bộ ra (bài Node kiểm).

## Ảnh soát tĩnh

`anh_soat.py` (trình duyệt không giao diện chỉ để có canvas thật; dựng phòng trùm, ép chiêu, vẽ **một** khung `G.drawWorld`, chép PNG — không chơi).
Trình duyệt không giao diện không vẽ em bé (ảnh tải lười, như ảnh soát 2B) → **chấm vàng** là chỗ em bé đứng.
- `cac-luc.png` (9 lúc): pha 1 Độc; Quật đuôi lúc báo (hai dải đỏ, giữa an toàn) và lúc quét; Phun nước đen + vệt; Vòng thân (vòm, đầu trên đá,
  mảnh trống sáng, tia phun); Vỗ sóng bờ (mép dưới); pha 2 Băng; pha 3 Lửa; hạ xong (nước rút, cổng, đồ rơi).
- `truoc-sau.png`: trái phiên 1 (`?tlrieng=0`: sân thường, Ngư Tinh nhuộm rêu), phải phiên 3B.

Nhận xét khi soát: bãi đá, nước sâu, thân trồi, vùng đỏ đọc rõ; ba màu pha khác hẳn nhau (đã chỉnh bộ lọc theo ảnh: ảnh pha 3 của Ngư Tinh trắng xương
nên dùng `sepia` để ra đỏ cam). Ảnh Ngư Tinh to, chiếm ~1/4 bên phải bãi đá — chấp nhận với hình tạm; ảnh thật C71 là rắn khúc chữ S, sẽ gọn hơn.

## Cách kiểm (đã chạy)

- `node --check game/js/*.js`: sạch.
- `node game/tests/thuong_luong.test.js` — **PASS 38 điều kiện**, 4 bản game trong Node (thường, `?tldoihe=0`, `?tlrieng=0`, `?vung4=0`):
  1. sân 71% sàn, đầu ở mép phải, thân trên + dưới, bộ chiêu riêng (không còn `SK.thuong = SK.ngu`), pha 1 kháng Độc / yếu Lửa;
  2. Quật đuôi: dải mép phía em bé, giữa sân không trúng, báo trước 1,13 ≥ thời gian đi bộ ra 1,08 giây (nhân vật chậm nhất), dải thứ hai mép kia,
     mép dưới đúng; Phun nước đen: trúng chỗ em bé, bước ngang là né, lần sau nhắm lại (báo 0,53), vệt độc 3 giây; Vòng thân: 3 vòm, vòm ngay chỗ em bé,
     siết sau 1,98 giây, đầu trườn lên đá (x 343 → 291) lộ điểm yếu, chân vòm đẩy em bé ra, đạn tan khi vào vòm, xong thì đầu về mép, vòm chìm;
     vảy dựng gai (chống áp sát); Đớp + đớp lần hai; Lặn đổi chỗ: 1 giây không nhắm / đánh trúng được, trồi cách chỗ cũ ≥ 40;
  3. Vỗ sóng bờ: mép trên / dưới / trái sau 1,52 giây, báo 1,08 giây, đi ra kịp, giữa sân không trúng; đứng giữa hoặc sát mép phải 6 giây: không có;
  4. hệ Độc → Băng → Lửa, yếu Lửa → Độc → Băng, dòng nhắc đổi vũ khí, chọn chiêu theo pha, `?tldoihe=0` Độc suốt trận, gộp với lớp thích nghi trùng hệ;
  5. bot bất tử hạ Thuồng Luồng (thấy đủ chiêu), không NaN, em bé luôn trong bãi đá, hạ xong trả sàn cũ;
  6. vẽ mọi lúc (VI + EN) không lỗi, chữ mới có tiếng Anh (*Tail Lash, Black Water Jet, Coil Arches, Bank Splash, Bristling Scales, Snap,
     "Ice form: strike with Poison!"*);
  7. `?tlrieng=0` như phiên 1; `?vung4=0` không có gì; không lỗi ngầm ở cả 4 bản.
- Bài cũ (sau khi gộp 3A): `vung4` 38, `song_luat` 40, `vung4_truyen` 20, `quai_song` 69, `trum_song` 39 (của 3A), `so_yeu_quai` 41, `su_kien` 83,
  `thanh_tuu` 35, `viec_ngay` 36, `thuong_b2` 9, `bo_do_mua` 22, `cam_giac_danh` 15, `cloud_save_regression`: đạt. `may_luat`: SKIP (máy thiếu emulator).
- `python3 game/build.py`: một tệp **28,37 / 30 MB**. `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: **người chơi tải 16,29 / 20 MB**, trang chính
  nén 1,12 / 1,50 MB. Phiên này **không thêm ảnh**; mã mới ≈ 36 KB chưa nén (`thuong_luong.js`).
- Đăng nhập Google / lưu mây / `?cloud=0`: không đụng (không có trường bản lưu mới; `W.tlSan` chỉ sống trong phòng).

## Commit

- `3902123e` Thuồng Luồng pha 1, sân bãi đá, Vỗ sóng bờ, khung đổi hệ, cờ, bài Node
- `9e8056d9` nhuộm theo hệ từng pha (soát ảnh), nước rút; ảnh soát + `anh_soat.py`
- `eb99dc98` chỉnh theo bot (hai dải đuôi, phun 3 lần, tia trong Vòng thân, Đớp, Lặn đổi chỗ, chiêu tạm pha 2/3, móc `S.nghi`, `sk.anim`); `do_trum.py` + số liệu
- `5a61b6c4` ảnh soát sau khi chỉnh
- `6462c6c4` dựng lại dist; (commit cuối) báo cáo này + dựng lại dist sau khi gộp 3A

## Việc cho phiên sau

- **3C** (pha 2, 3): thay hàm `chon` và các khoá `n1`, `n2`, `c4`, `c5` (chiêu Ngư Tinh tạm) trong `G.bossSK.thuong` (`js/thuong_luong.js`, khối "BỘ CHIÊU")
  bằng Xoáy nước, Lặn – trồi đớp, Dòng nước đổi chiều (pha 2) và Mưa mảnh đồng, Siết sân, Đớp liên hoàn (pha 3), cảnh bỏ trốn. Đã sẵn:
  hệ / màu / lớp kháng / điểm yếu theo pha (`datHe`, `MAU`, `NHUOM`), `b.doiPha`, sân + `W.tlSan` (Siết sân có thể thu `W.x0..y1` tiếp), lặn
  (`lanDoi`, `b.tl.lan` — "Lặn – trồi đớp" dùng lại), Đớp (`dop` — "Đớp liên hoàn" dùng lại), móc `sk.anim`, `S.nghi`. Sao thứ ba pha 3 = Băng đã tự đúng.
  Đo lại bằng `do_trum.py` (cờ `BAN=sau` chỉ chạy bản mới).
- **4 (cân bằng)**: bảng trên — trận "chỉ 1 hệ" ngang phiên 1 với bot Băng, +9 điểm trung bình do đổi hệ (mục đích); nếu muốn ngang hẳn: `BOSS_HP_OF.thuong`
  +10% hoặc `CFG.heKhang` 0,15. Bot chưa biết đổi vũ khí theo pha — thêm chế độ "bot đổi hệ theo pha" để đo người chơi hiểu luật.
- **Ảnh**: C71–C85 (`thuongLuong`, dựng theo `dung-ngu-tinh.py`) → tự dùng, thôi nhuộm; D2 (sân trùm: bãi đá + nước sâu) → thay hàm `dungSan`;
  E9–E12 (hiệu ứng đuôi, tia nước đen, vòm thân, sóng bờ) → thay `veThan`, `veTia`, `veVet`, `veVom` (giữ nguyên luật). Khi có C71 nhớ thêm cỡ thân
  `thuongLuong` vào `BODY` của `boss.js` (đang dùng cỡ Ngư Tinh).
- Bóng trùm 3 màu ở suối hồi (mục 8.3, "báo trước cả 3 pha"): chưa làm — giếng suối hồi là phần nền của 2B, để phiên ảnh D / 3C.
