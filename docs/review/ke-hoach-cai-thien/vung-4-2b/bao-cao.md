# Vùng 4 Sông sâu — Phiên 2B: nền vùng + luật riêng

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 1.2, 1.4, mục 5 hàng "2B", `QUYET-DINH.md` (làm code ngay bằng hình tạm)
và báo cáo phiên 1 (`vung-4-1/bao-cao.md`). Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node, bot Node, `build.py`, ảnh soát tĩnh
(một khung vẽ vào canvas, không chạy vòng lặp game). Chạy song song 2A (quái) và 2C (truyện, bản đồ, làng): không sửa tệp của họ.

## Tóm tắt

- **Theme phòng thứ 4 "Sông sâu"** (`js/room_art.js`, theme `River`, mã `song`) vẽ bằng code: chiều tối trên sông, bờ bùn có lớp đất và rễ,
  lau sậy, cọc tre, lưới phơi, hàng rào tre hai bên, 3 kiểu sàn (sỏi ướt / bùn sẫm có vũng nông / bến ván tre), cửa tre có rèm lau (khoá: hai khúc
  gỗ bắt chéo + ổ khoá), đồ trang trí (thuyền úp, chum sành, bó cọc tre, khóm lau), điểm nhấn (miếu nhỏ ven sông có nén hương — phòng suối hồi
  luôn là miếu; hoặc thuyền thúng có lưới), tiền cảnh lau sậy, sương sông, đom đóm. Tông xanh rêu + nâu bùn + vàng đèn. Khi có ảnh D1–D4
  (`gd-nen-song-*`, `gd-cua-song-*`, `gd-tt-song-*`) thì **tự dùng ảnh** như ba vùng cũ, không cần sửa code.
  Có theme riêng thì **thôi phủ màu nước đục** của phiên 1 lên nền (quái mượn hình vẫn nhuộm xanh rêu như cũ).
- **Luật riêng** (`js/song_luat.js`, tệp mới): dòng nước chảy + cầu tre, nước sâu lạnh (Băng), lục bình độc (Độc), đèn dầu thuyền chài (Lửa).
  Bố cục dải dòng chảy trong phòng theo mục 1.4. **Nhìn là hiểu**: dải nước sẫm có mũi tên trắng trôi đúng tốc bị đẩy; ải 4-1 phòng đầu luôn có
  dải + mũi tên lớn nhấp nháy + câu mẹo. **Không gây chết oan**: dòng chỉ đẩy dọc dải (bước ngang ra không bị cản), tốc dòng 39–43% tốc chạy,
  và **không bao giờ đẩy em bé vào vùng đỏ đang báo / vũng nguy hiểm / đường đạn quái** mà em bé chưa đứng trong đó.
- **Không thêm vật, không thêm thưởng**: lục bình / đèn dầu / vũng nước sâu **thay đúng chỗ** nấm độc / chậu than / tinh thể băng của ba vùng cũ
  (cùng số lượng, cùng chỗ đặt). Bot đo: tỉ lệ thắng từng ải lệch ≤ 3 điểm (4-4: +3), linh khí mỗi lượt lệch ≤ 2 (trừ 4-5, xem dưới).
- Ba vùng cũ **không đổi gì** (bài Node so đồ vật 96 phòng với bản `?vung4=0`, cùng hạt ngẫu nhiên: giống hệt).

## Cờ quay lui

| Cờ | Tác dụng |
|---|---|
| `?dongchay=0` (`G.DONG_CHAY = false`) | Tắt dòng chảy + cầu tre (theo kế hoạch). Lục bình, đèn dầu, nước sâu vẫn có. |
| `?songluat=0` (`G.SONG_LUAT = false`) | Tắt cả 4 luật: vùng 4 dùng nấm / chậu than / tinh thể như ba vùng cũ, không dải, không vũng (= phiên 1). |
| `?nensong=0` (`G.NEN_SONG = false`) | Tắt theme Sông sâu: nền vùng 4 mượn Hang biển + phủ màu nước đục như phiên 1. |
| `?vung4=0` | Không có vùng 4; `js/song_luat.js` không làm gì (`G.songLuat = null`). |

Đổi cờ lúc đang chơi cũng được (phòng dựng lại theo cờ mới ở lần vẽ sau; bố cục dải theo cờ lúc vào phòng).

## Đã làm

| Tệp | Thay đổi |
|---|---|
| `js/room_art.js` | Theme `River` (Sông sâu) đủ các phần như 3 theme cũ: `paintVoid`, 3 `floors`, `back`, `backDeco`, `sides`, `front`, `fore`, `door`; `DECOR[3]`, `FG[3]` + nhánh tiền cảnh lau sậy, `accentSong` (miếu / thuyền thúng), sương + đom đóm ở `ambSetup`, `KHOA_Y.song`, `TRV.song`. `THEMES = [Forest, Cave, Castle, River]`. `RA.vungTheme(reg)`: vùng 4 → theme 3 (trừ `?nensong=0` → vùng mượn). Khoá bộ nhớ đệm phòng có thêm theme (đổi cờ thì dựng lại). Móc `RA.lopSan` ở lớp sống (sau chuyển động môi trường, **trước** dấu quái sắp mọc và mũi tên cửa) để `js/song_luat.js` vẽ dải / cầu / vũng. |
| `js/env_art.js` | `TH[3]` (khung tre cho cửa chọn đường), chọn theme qua `G.roomArt.vungTheme`. |
| `js/stage.js` | 3 chỗ móc: `G.songLuat.datPhong(W, type, S)` lúc dựng phòng; `addEnv` và 2 vật hệ của phòng trùm hỏi `G.songLuat.datVat(...)` trước (vùng khác trả false → code cũ y nguyên, không rút thêm số ngẫu nhiên). |
| `js/song_luat.js` (mới, nạp sau `vung4.js`) | Toàn bộ luật + vẽ luật (chi tiết dưới). |
| `index.html` | Thêm `<script src="js/song_luat.js">`. |
| `tests/song_luat.test.js` (mới) | 40 điều kiện (mục "Cách kiểm"). |
| `docs/review/ke-hoach-cai-thien/vung-4-2b/` | `do_dong_chay.py` (bot đo), `do_dong_chay.txt`, `so-lieu-do-dong-chay.json`, `anh_soat.py` + 3 ảnh soát, báo cáo này. |

### Luật (số trong `G.songLuat.CFG`)

| Luật | Người chơi thấy | Tác dụng | Có từ |
|---|---|---|---|
| **Dòng nước chảy** | Dải nước xanh đen, mép bọt trắng, 2 hàng mũi tên trắng trôi theo hướng dòng **đúng tốc bị đẩy**; dọc rộng 56, ngang rộng 40 (≈ 1/4 sàn) | Đẩy em bé 28 điểm ảnh/giây (dòng dọc ×0,75 = 21, như em bé đi dọc). Cu Tí / Cái Bống 39%, Cu Lì 43%, Cu Tèo 34% tốc chạy. Không mất máu. Lăn né xuôi dòng đi xa hơn. **Trên cầu tre không trôi.** Quái trôi: thường ×1, bầy (`swarm`) và Đỉa / Ếch (`e.troiDong = 2`, phiên 2A đã đặt) ×2, tinh anh ×0,5, trùm / trùm nhỏ không trôi. | 4-1 |
| **Cầu tre** | Ván tre ngang dòng, hai dây chão | 1–2 cầu / dải (cách nhau ≥ 56) | 4-1 |
| **Nước sâu lạnh** (Băng) | Vũng xanh thẫm, viền bọt trắng, bọt chạy quanh mép (khác hẳn vũng nông xám-lục của sàn) | Em bé lội: phần tự đi còn 75% (lăn né / lướt không chậm). Quái **và trùm** đứng trong vũng: +1 tầng Băng mỗi giây. | 4-1 |
| **Lục bình độc** (Độc) | Cụm lá tròn + hoa tím, quầng tím nhấp nháy dưới chân (như vật mang hệ cũ); đặt ở mép dải nếu rơi vào dải | Đánh / bắn / lướt trúng → nổ như nấm độc (0,8 × sát thương đòn, 3 tầng Độc, bán kính 52) + **vũng độc 3 giây** (bán kính 28): quái trong vũng +1 tầng Độc mỗi giây. | 4-2 |
| **Đèn dầu thuyền chài** (Lửa) | Cọc tre, cần treo, đèn lồng lửa chập chờn, quầng cam | Trúng → nổ như chậu than (0,8 ×, 1 tầng Lửa) + **vệt lửa dầu 3 giây** (bán kính 32, có hình đèn đổ): quái trong vệt +1 tầng Lửa mỗi giây. | 4-3 |

- Vũng độc / vệt lửa chỉ gây hệ lên quái; **em bé đứng trong không mất máu** (vùng phe người chơi, `oz` — không vẽ vòng mặc định, `js/song_luat.js` tự vẽ).
- Ải chưa tới lượt giới thiệu nguồn hệ thì vật mang hệ đó thành vũng nước sâu (4-1: toàn nước sâu; 4-2: nước sâu + lục bình; 4-3 trở đi đủ ba).
  Phòng trùm giữ đúng hệ khắc trùm (vật hệ ở phòng trùm luôn theo hệ cũ: Độc → lục bình, Lửa → đèn dầu, Băng → nước sâu).
- Tạm chưa làm (đúng kế hoạch: "không làm nước dâng ở phòng thường").

### Bố cục dải dòng chảy (mục 1.4)

- Chỉ ở phòng đánh quái (`start`, `fight`, `elite`, `challenge`). Ải 4-1..4-3: 0–1 dải (70% có), ải 4-4, 4-5: 1–2 dải (60% hai dải, cùng chiều
  dọc hoặc cùng chiều ngang, cách nhau ≥ 24, hướng chảy ngẫu nhiên). Dải chạy suốt chiều sàn (sát tường hai đầu), dọc hoặc ngang.
- **Chừa 2 ô (32 điểm ảnh) quanh mọi cửa**: vùng cấm = lối cửa rộng 32 kéo vào sàn thêm 32 và rộng thêm 32 mỗi bên. Không phủ chỗ em bé đứng lúc vào
  phòng đầu ải. Phòng nhiều cửa thì chỉ còn chỗ cho dải nằm hai bên lối giữa (không đủ chỗ thì phòng đó không có dải).
- Bố cục theo hạt giống của phòng (`G.srand(W.seed)`), **không rút `G.rnd`** → chuỗi ngẫu nhiên của game (đợt quái, rơi đồ) như không có dải.
- Ải 4-1 phòng đầu (không phải hướng dẫn): luôn 1 dải, cầu lệch khỏi lối thẳng tới cửa (bé thấy cả dòng lẫn cầu), mũi tên lớn nhấp nháy giữa dải,
  câu mẹo 7 giây: *"Dòng nước đẩy theo mũi tên — đứng trên cầu tre thì không trôi"* / *"The current pushes you along the arrows — stand on the bamboo bridge to stay put"*.
- Phòng Cá Trê (trùm nhỏ 4-1..4-4): 2 vũng nước sâu giữa sân (trái-trên, phải-dưới). Phòng Thuồng Luồng (4-5): chưa có gì riêng — sân bãi đá
  giữa sông là việc phiên 3B.

### Chống chết oan (đo ở mục dưới)

1. Dòng chỉ đẩy **dọc** dải: đi ngang ra khỏi dải không bị cản (dải dọc 56: bước ra mất 0,4 giây).
2. Mỗi bước đẩy, nếu vị trí mới nằm trong **vùng nguy hiểm của quái đang báo (t > 0), vũng gây hại, tường nước** hoặc **ô trúng của đạn quái**
   mà vị trí cũ chưa nằm trong → **bỏ bước đẩy đó** (em bé dừng ở mép). Em bé tự đi vào thì vẫn đi được (luật chỉ chặn dòng).
3. Tốc dòng < 45% tốc chạy của nhân vật chậm nhất; không có trạng thái nào làm em bé đứng hình (game không có choáng / đóng băng cho em bé).
4. Dải cách cửa ≥ 2 ô, không phủ chỗ đứng đầu phòng; phòng trùm không có dải.

## Đo bằng bot (trước / sau)

`do_dong_chay.py 60`: bot chơi thật (mất máu, chết được) cả ải, bản lưu `kiem-can-bang/luu-A.json` (ải 3-5) nâng cấp tới Sức mạnh ≈ khuyên dùng
(4-5 chỉ tới 662 / 690 vì cấp tối đa 40 — chuyện phiên 4 / Q3). 60 lượt mỗi ô, **cùng 60 hạt ngẫu nhiên** cho cả ba chế độ.
- **trước** = `?songluat=0` (như phiên 1), **sau** = đủ luật, **không dòng** = `?dongchay=0`.
- Mỗi ô: thắng · thời gian TB · linh khí TB mỗi lượt (`S.marks`) · đòn trúng em bé mỗi phút.

| Ải | SM / khuyên dùng | trước | sau | không dòng | chết mà đòn cuối trúng lúc đang trong dòng / số lượt chết (sau) | bước đẩy bị chặn (sau, 60 lượt) |
|---|---|---|---|---|---|---|
| 4-1 | 562 / 540 | 97% · 238s · 49 · 2.28 | 93% · 241s · 50 · 2.39 | 92% · 238s · 50 · 2.22 | 0 / 4 | 343 |
| 4-2 | 571 / 565 | 85% · 257s · 49 · 2.49 | 87% · 256s · 51 · 2.60 | 82% · 243s · 49 · 2.71 | 0 / 8 | 258 |
| 4-3 | 599 / 595 | 53% · 242s · 47 · 3.36 | 55% · 250s · 48 · 3.33 | 52% · 246s · 49 · 3.36 | 2 / 27 | 233 |
| 4-4 | 636 / 630 | 22% · 257s · 50 · 3.71 | 25% · 261s · 51 · 3.68 | 25% · 252s · 49 · 3.77 | 13 / 45 | 568 |
| 4-5 | 662 / 690 | 5% · 272s · 49 · 3.78 | 5% · 242s · 44 · 4.00 | 7% · 285s · 52 · 3.65 | 17 / 57 | 512 |

Đọc bảng:
- **Tỉ lệ thắng** trước → sau lệch −4 … +3 điểm (trong ±5 của `LUAT-CAN-BANG.md`; sai số 60 lượt ≈ ±6). Đòn trúng / phút gần như nhau.
- **Kinh tế**: không thêm vàng / quặng / đá / mảnh / sức mạnh nào. Linh khí mỗi lượt 4-1..4-4 lệch ≤ 2 (vật mang hệ đổi 1 đổi 1; nước sâu cho quái
  Băng liên tục nhưng không nổ sát thương). Không dư thêm.
- **4-5** (ải có 2 dải, bot thiếu 28 Sức mạnh): thắng như nhau (5%), nhưng lượt thua chết sớm hơn ~nửa phòng (242 s so với 272 / 285 s), linh khí
  lượt thua 44 so với 49 / 52, đòn trúng / phút +6%. Bot không biết né dòng (đứng giữa dòng đánh nhau, bị trôi lệch vị trí). Người thật thấy mũi tên
  sẽ đứng lên cầu / ra mép. Không chỉnh vì: thắng không đổi, kinh tế giảm chứ không dư, và số vùng 4 còn là số xuất phát (phiên 4 đo lại cả ải).
  Muốn nhẹ hơn: `G.songLuat.CFG.haiDai = 5` (không có phòng 2 dải) hoặc chỉ cho 4-4 có 2 dải.
- **"Chết vì đứng yên trong dòng"**: bài Node đặt em bé đứng yên giữa dải, vùng đỏ sát thương 99999 nằm xuôi dòng → dòng dừng ở mép (bước đẩy bị
  chặn), em bé **không trúng**. Bot thật: mỗi lượt có hàng chục bước đẩy bị chặn (cột cuối) — đó là những lần dòng lẽ ra đã đưa bé vào vùng đỏ /
  đạn. Có đòn trúng lúc đang ở trong dòng (bot đứng đánh giữa dòng) nhưng phân loại đòn vùng / đạn trúng ≤ 0,35 giây sau khi bị đẩy (`do_dong_chay.txt`):
  gần hết là **đạn đã nhắm sẵn** (bot cố ý trượt né 25% đạn) và vùng bé đã đứng trong từ trước; "vùng do bị đẩy vào" chỉ 0–4 lần / 60 lượt — là vùng
  quái đặt ngay chỗ bé đứng **sau** bước đẩy (nhắm theo vị trí bé), không phải dòng đẩy vào. Không lượt nào chết vì dòng đẩy vào vùng đỏ.

## Ảnh soát tĩnh

`anh_soat.py` (trình duyệt không giao diện chỉ để có canvas thật; dựng phòng, vẽ **một** khung `G.drawWorld`, chép PNG — không chơi):
- `truoc-sau.png`: trái = phiên 1 (mượn Hang biển + phủ nước đục), phải = theme Sông sâu + luật (4-1 phòng đầu có mũi tên lớn, 4-4 dải ngang 2 cầu,
  4-3 tinh anh), kèm lục bình, đèn dầu, vũng nước sâu, vũng độc đang loang.
- `cac-phong.png`: 8 loại phòng (đánh quái 1 / 2 dải dọc, thử thách 2 dải ngang trên sàn ván tre, suối hồi có miếu, rương, Cá Trê có 2 vũng sâu,
  thương nhân).
- `phong-day.png`: phòng đầu 4-1 ở t = 0 / 0,4 / 0,8 giây (mũi tên trôi, mũi tên lớn nhấp nháy).

Nhận xét khi soát: dải dòng chảy, cầu, vũng sâu, lục bình đọc rõ trên sàn; đèn dầu hơi nhỏ (ảnh D5 sẽ thay). Sàn ván tre đè dưới vũng sâu ở phòng
Cá Trê (kế hoạch ghi "bãi bùn") — chấp nhận tạm, ảnh D1 / phiên 3A chọn lại.

## Cách kiểm (đã chạy)

- `node --check` mọi tệp sửa: sạch.
- `node game/tests/song_luat.test.js` — **PASS 40 điều kiện**, 4 bản game trong Node (thường, `?dongchay=0`, `?songluat=0`, `?vung4=0`):
  theme (3); bố cục 5 ải × 8 hạt: 170 dải, không dải chạm vùng 2 ô quanh cửa, đúng loại phòng / số dải, 1–2 cầu, bề rộng 18–30%, 4-1 phòng đầu 8/8
  có dải + mũi tên lớn + mẹo, không còn nấm / chậu / tinh thể, lục bình từ 4-2, đèn dầu từ 4-3, Cá Trê 2 vũng (11); dòng chảy: trôi 28,0 / 21
  điểm ảnh/giây, cầu và ngoài dải 0, 43% tốc chạy, bước ngang ra 0,4 giây, chặn đẩy vào vùng đỏ, quái ×1 / ×2 / ×0,5 (7); nước sâu chậm đúng 75%,
  lăn né không chậm, +2 tầng Băng / 2,1 giây; lục bình / đèn dầu nổ + vũng 3 giây rồi tan, em bé không mất máu (8); cờ + ba vùng cũ giống hệt
  bản `?vung4=0` ở 96 phòng (4); vẽ mọi phòng 4-1 / 4-4 / 4-5 (theme bật / tắt) không lỗi, không cảnh báo thiếu theme; bot bất tử qua 4-4; không lỗi
  ngầm ở cả 4 bản (7).
- Bài cũ (sau khi gộp 2A, 2C): `vung4` 38, `quai_song` 69, `vung4_truyen` 20, `so_yeu_quai` 41, `su_kien` 83, `thanh_tuu` 35, `viec_ngay` 36,
  `cloud_save_regression` PASS, `bo_do_mua` 22, `cam_giac_danh` 15: đạt. `may_luat`: SKIP (máy thiếu emulator, như phiên 1).
- `python3 game/build.py`: một tệp 28,31 / 30 MB. `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: **người chơi tải 16,27 / 20 MB**
  (gồm cả phần 2A / 2C và các phiên khác gộp cùng lúc). Phần phiên 2B: **không thêm ảnh nào**; mã mới ≈ 43 KB chưa nén (`song_luat.js` 23,8 KB,
  theme `River` ≈ 19 KB) ≈ **+0,016 MB nén**.
- Đăng nhập Google / lưu mây / `?cloud=0`: không đụng (`cloud*.js`, bản lưu không có trường mới — bố cục dải không lưu).

## Commit

- `1a0e9283` theme phòng Sông sâu + `js/song_luat.js` + móc `stage.js` / `env_art.js` + `index.html`
- `3194c5cb` bài Node `tests/song_luat.test.js`
- `6f1bd865` chặn đẩy vào đường đạn; bot đo `do_dong_chay.py`; ảnh soát
- `5e75b8df` dựng lại `dist`
- (commit cuối) báo cáo này

## Việc cho phiên sau

- **Ảnh D1–D5** (`KE-HOACH.md` mục 4.D): cắt bằng `tools/tach-phong` ra đúng tên là game tự dùng:
  `gd-nen-song-san0/1/2, san-nhan, ngoai, tuong-sau, tuong-truoc, mep, tuong-ben` (D1, đủ 7 mảng bắt buộc thì bật), `gd-cua-song-tren/duoi/ben[-khoa]`
  (D3), `gd-tt-song-thuyen-up, chum, coc-tre, khom-lau, mieu, thuyen-thung, tien-canh-trai/phai` (D4). **D5** (dòng chảy 4 khung, cầu tre, lục bình
  nguyên / vỡ, đèn dầu 4 khung / đổ, vũng nước sâu) chưa có chỗ nạp ảnh: khi gen xong thì thay trong các hàm `veDai`, `veCau`, `veSau`, `veLucBinh`,
  `veDenDau`, `veVung` của `js/song_luat.js` (giữ nguyên luật, giữ mũi tên code trôi đúng tốc).
- **3A** (Cá Trê): phòng trùm nhỏ đã có 2 vũng nước sâu (`W.song.sau`); Cá Trê đứng trong vũng cũng bị +1 Băng / giây — nếu muốn trùm miễn thì lọc
  `e.isBoss` trong `L.tick`.
- **3B** (Thuồng Luồng): sân bãi đá giữa sông là phòng `boss` ải 4-5 — hiện dùng theme River thường, không dải, không vũng. Dòng chảy / vũng có thể
  dùng lại `G.songLuat.dongTai`, `W.song` nếu cần.
- **4 (cân bằng)**: thêm chế độ "bot biết dòng" (đứng lên cầu, không đứng giữa dòng) để đo người chơi thật hơn; xem lại 4-5 hai dải (mục đo ở trên);
  `CFG.v`, `CFG.sauCham`, `CFG.vungGiay` là số chỉnh được.
- Bản đồ nhỏ góc màn (`minimap.js`) chưa vẽ dải dòng chảy — không cần cho luật, để sau nếu chủ game muốn.
