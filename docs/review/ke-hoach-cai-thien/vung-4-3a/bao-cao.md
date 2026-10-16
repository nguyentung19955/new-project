# Vùng 4 Sông sâu — Phiên 3A: 2 tinh anh + trùm nhỏ Cá Trê Râu Roi (hình tạm)

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 2.2, 2.3, mục 5 hàng "3A", `QUYET-DINH.md` (làm code ngay bằng hình tạm) và báo cáo
`vung-4-1`, `vung-4-2a`, `vung-4-2b`, `vung-4-2c`. Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node, bot Node, `build.py`, ảnh soát tĩnh.
Phiên 3B (Thuồng Luồng) chạy song song: không sửa khối `thuong` / `js/thuong_luong.js` của họ.

## Tóm tắt

- Vùng 4 nay có **tinh anh riêng** (Rái Cá Thủ Lĩnh `raiCaChua`, Cóc Tía Chúa `cocChua`) và **trùm nhỏ riêng** (Cá Trê Râu Roi `caTre`, 2 pha,
  chống đứng sát mép) thay cho Cua Tướng / Cá Nóc Chúa / Cua Đá mượn Hang biển.
- **Mọi đòn có vùng đỏ báo trước** (nhỏ nhất 0,45 giây ở pha 2 theo sàn công bằng `G.NOI_GIAN.san`; pha 1 ≥ 0,6). Lưới / lưỡi kéo **không bao giờ dồn bé
  vào đòn không kịp né**: đòn nối sau luôn báo tới *sau* lúc bé được thả / kéo xong + 0,9 giây.
- **Không đòn một phát chết** ở Sức mạnh khuyên dùng: đòn mạnh nhất (bé đủ máu) — tinh anh 31–38%, Cá Trê 59–70% máu tối đa (bằng mức Cua Đá mượn trước đó:
  cùng hệ số 1,3 × sát thương trùm nhỏ).
- **Hình tạm**: mượn ảnh con gần giống + nhuộm màu như phiên 2A (`MA.hinhTam`, `ctx.filter`); Cá Trê pha 2 đổi sang ánh cam. Có ảnh thật
  (`game/art/custom/<mã>.sprite.json`) thì tự thay, không sửa mã.
- **Cờ quay lui `?trumsong=0`** (`G.TRUM_SONG = false`): tinh anh / trùm nhỏ vùng 4 mượn Hang biển như phiên 1. `?vung4=0`: không có vùng 4.
- Không thêm thưởng nào; bot đo thắng −2 … +6 điểm so với trước (trong sai số 40 lượt), linh khí lệch ≤ 1.

## 1. Ba con và chiêu (`js/chieu_trum.js` khối "VÙNG 4 SÔNG SÂU — PHIÊN 3A", bảng số `S3A`)

| Con · hệ | Hình tạm ← con mượn (nhuộm) | Chiêu | Báo trước |
|---|---|---|---|
| **Rái Cá Thủ Lĩnh** · tinh anh · Lửa | Tướng Ma (nâu: `sep 1, sat 1.15, bri 0.85`) | **Quăng lưới chài**: vòng đỏ r 34 ở chỗ bé. Trúng → **mắc lưới 1 giây**: bé đứng yên (đẩy cần không đi), **mỗi lần bấm Né bớt 0,35 giây** (cú lộn bị huỷ, không được bất tử của cú lộn) — giãy liên tục thì ~0,3 giây là thoát. Chữ "Mắc lưới! Bấm Né để giãy". **Quét đuốc** ngay sau: nón lửa r 92 về phía bé, quét xong để lại 3 vệt lửa dầu 2,5 giây. **Nổi giận** (≤ 35% máu): gọi 2 Rái Cá con (một lần, 45% máu, tan khi dọn phòng). | lưới 1,0 s (nổi giận ≥ 0,6); đuốc: mắc lưới → lưới còn + 0,9 s, không mắc → 0,7 s |
| **Cóc Tía Chúa** · tinh anh · Độc | Nấm Phồng Chúa (tím: `hue −60, sat 0.75, bri 0.8`) | Luân phiên 2 chiêu. **Lưỡi kéo**: đường đỏ thẳng tới bé (dài ≤ 150, rộng 16). Trúng → bị **kéo về sát cóc** trong 0,25 giây (không mất thêm máu; kéo không đưa bé vào vùng đỏ sắp nổ) → **Dậm lá sen**: vòng đỏ r 56 quanh cóc, báo tính từ lúc kéo xong. **Mưa bọt**: 6 bọt độc rơi thành **vòng quanh chỗ bé** (cách 46, giữa trống — đứng yên là né); nổi giận thêm 1 bọt rơi **giữa vòng** sau 0,6 giây (phải bước ra qua chỗ bọt vừa nổ). | lưỡi 0,7 s; dậm 0,25 + 0,9 = 1,15 s; bọt ≥ 1,0 s |
| **Cá Trê Râu Roi** · trùm nhỏ · Độc (vùng) | Cua Đá (đen bùn; pha 2 ánh cam — dùng luôn ảnh `cuaDa-p2`) | **Pha 1 — Quất râu**: 4 vạch đỏ hình chữ X quanh thân (dài 112) — đứng giữa hai vạch là né. **Phun bùn**: 3 cục bùn bay vòng cung (bóng tròn chỗ rơi), rơi thành **vũng bùn trơn** 3 giây (lội vào đi chậm 40%, như vệt nhớt Ốc). **Lặn bùn**: chui xuống bùn (ẩn: không nhắm / không đánh trúng được), **gợn bùn đuổi bé** 1,5 giây (52 điểm ảnh/giây — chậm hơn mọi nhân vật chạy), dừng → vòng đỏ r 30 → trồi lên đớp, rồi **lộ bụng 1,5 giây** (choáng, nhận thêm sát thương như "mệt sau chiêu", chữ "Lộ bụng!"). **Pha 2 (≤ 50%)** — **Quất râu xoay**: bánh xe 4 nan dài 120, 3 đợt, mỗi đợt nan quay 30° (chiều ngẫu nhiên) — đi theo khe giữa nan hoặc ra ngoài vòng 120; **lặn bùn 2 lần liền** (lộ bụng sau lần 2). | quất 0,7 s; mỗi đợt bánh xe 0,6 s; bùn 0,8 s; vòng trồi 0,6 s (pha 2 ≥ 0,45) |
| (Cá Trê) **Chống đứng sát mép** | | Bé đứng cách một mép < 40 điểm ảnh quá 1,5 giây → **Bùn phụt**: 5 cột bùn nối nhau dọc chân tường mép đó (giữa hàng ngay chỗ bé, r 24, phủ dải 0–44 từ tường), góc phòng thì cả hai mép; nghỉ 4,5 giây. Chạy độc lập với chiêu đang ra (như đá rơi của Cua Đá). | 0,8 s — bước vào trong là né |

- Chọn chiêu Cá Trê (`js/boss.js` `MINI_NHIP.caTre`): gần (< 70) quất râu 3 : phun 1 : lặn 1; xa: phun 2 : lặn 2 (đuổi tới). Nghỉ `[1.4, 1.1, 0.9]`.
- Lớp thích nghi: 1 lớp như trùm nhỏ cũ; hai pha theo `G.NOI_GIAN.nho` (50% máu, nhanh hơn, nối chiêu).
- Mẹo lần đầu gặp tinh anh (dòng lề trái) + bảng thua "Mẹo:" (`e.knTen` → `MEO` trong `js/ky_nang_quai.js`), có tiếng Anh. Bảng thua trùm nhỏ ghi đúng tên chiêu.

Khác kế hoạch (ghi để chủ game biết):
- Lưới giữ đúng 1 giây; "bấm lăn liên tục để thoát nhanh" làm bằng cách mỗi lần bấm Né bớt 0,35 giây (cú lộn không xảy ra, để không thành "lăn thoát lưới bất tử").
  Quét đuốc báo trước kéo dài tới **sau lúc được thả 0,9 giây** (thử 0,6 giây: bé thả ra đi ngang không kịp ra khỏi nón — bài Node bắt được), nón hẹp hơn chút (1,1 rad).
- Mưa bọt rơi **thành vòng quanh bé** (không rơi lên đầu bé): kiểu "mưa rơi quanh em bé" đã là của Mộc Tinh, nên đổi thành vòng có tâm trống — dạy "đứng yên
  cũng là một cách né"; nổi giận mới có bọt rơi giữa.
- Bùn phụt chống mép: kế hoạch ghi chung "giống đá rơi Cua Đá"; bot đo lần đầu (× 0,7, nghỉ 3 giây) thì riêng bùn phụt chiếm ~41% máu mất ở trận Cá Trê
  (bot hay chạy sát tường thả diều) → hạ còn × 0,5, nghỉ 4,5 giây. Vẫn đúng luật: đứng sát mép quá 1,5 giây là bị phạt, báo trước 0,8 giây.

## 2. Hình tạm và chỗ dựng ảnh thật

- `js/monster_art.js` khối `song3a` (sau khối `song` của 2A): `def` 3 mã (`vung: 'song'`, loại `tinhanh` / `trumnho`, cử động + cỡ của con mượn), thêm vào
  `MA.hinhTam` (cùng cơ chế 2A: `js/ky_nang_quai.js` `KN.veTam` vẽ ảnh con mượn qua `ctx.filter`, chọn vùng 4 thì tải luôn ảnh con mượn — ảnh đã có trong
  gói, không thêm byte). `locP2` = màu pha 2 của Cá Trê (`js/chieu_trum.js` đổi lúc vẽ theo `o.phase`).
- Ảnh soát `xem-hinh-tam.png` (`python3 ve_soat.py`): mỗi hàng ảnh con mượn gốc | đã nhuộm (đứng / báo đòn / đánh); Cá Trê có hàng pha 2.
- **Khi có ảnh** (A, C — Rái Cá Thủ Lĩnh, Cóc Tía Chúa, Cá Trê + Cá Trê p2; E7, E8 hiệu ứng): cắt khung như 2A rồi dựng bằng
  `../vung-4-quai/cong-cu/dung-song.py` (thêm 3 mã vào `CFG` của công cụ — tinh anh như 8 con thường; Cá Trê theo `trum-moi/cong-cu/dung-trum-nho.py`,
  tệp `caTre.sprite.json` + `caTre-p2.sprite.json`). Có tệp là hình tạm tự thôi. Hiệu ứng (lưới, gợn bùn, vũng bùn, lưỡi, cột bùn) đang vẽ code ở các hàm `ve`
  trong khối 3A của `js/chieu_trum.js`; có ảnh `hu-*` thì thay ở đó (giữ nguyên luật).
- Hộp va chạm Cá Trê = Cua Đá (`BODY.caTre` trong `js/boss.js`); có ảnh thật thì chỉnh theo thân mới.

## 3. Cân bằng (docs/ke-hoach/LUAT-CAN-BANG.md)

**Không thêm thưởng nào**: rơi đồ / vàng / linh khí / đá của tinh anh và trùm nhỏ tính theo loại (`tinhanh`, `trumnho`) như cũ; máu, sát thương gốc theo vai
(`G.ROLES.elite`, `G.MINI_HP`, số vùng 4 của phiên 1) giữ nguyên — chỉ đổi cách đánh.

Đo bằng bot Node (`do_3a.py 40`, số thô `so-lieu-do.json`, bảng `do-truoc-sau.txt`): mỗi ải 40 lượt, Sức mạnh ≈ khuyên dùng (bản lưu 3-5 của
`kiem-can-bang/luu-A.json` lên cấp), cùng 40 hạt ngẫu nhiên; **trước** = `?trumsong=0` (Cua Tướng / Cá Nóc Chúa / Cua Đá mượn), **sau** = bản này
(cả hai đã gộp Thuồng Luồng của 3B).

| Ải | SM / khuyên dùng | Thắng: trước → sau | Thời gian TB (giây) | Linh khí TB | Máu mất do tinh anh (% / lượt) | Máu mất do trùm nhỏ (% / lượt) | Đòn mạnh nhất tinh anh / trùm nhỏ (% máu) | Đánh trùm nhỏ (giây) |
|---|---|---|---|---|---|---|---|---|
| 4-1 | 562 / 540 | 100% → 98% | 227 → 229 | 50 → 50 | 23% → 6% | 34% → 39% | 22 / 66 → 30 / 66 | 41 → 43 |
| 4-2 | 571 / 565 | 92% → 98% | 245 → 252 | 51 → 51 | 18% → 9% | 37% → 40% | 23 / 59 → 29 / 68 | 42 → 47 |
| 4-3 | 599 / 595 | 92% → 95% | 286 → 287 | 59 → 60 | 15% → 4% | 45% → 44% | 29 / 59 → 29 / 68 | 48 → 48 |
| 4-4 | 636 / 630 | 92% → 95% | 362 → 369 | 75 → 75 | 25% → 6% | 21% → 40% | 27 / 37 → 31 / 66 | 50 → 52 |
| 4-5 | 662 / 690 | 50% → 48% | 395 → 420 | 76 → 79 | 23% → 10% | — | 28 / — → 31 / — | — |

Đọc bảng:
- **Thắng** lệch −2 … +6 điểm (sai số 40 lượt ≈ ±7). Kinh tế: linh khí lệch ≤ 1 (4-5: +3, do lượt thắng dài hơn), không thêm vàng / quặng / đá / mảnh.
- **Tinh anh mới nhẹ hơn với bot** (máu mất 15–25% → 4–10%): đòn nào cũng là vùng đỏ báo trước dài (đúng kế hoạch), bot né vùng đỏ rất giỏi; tinh anh cũ
  gây sát thương chủ yếu bằng đạn (gai Cá Nóc Chúa) mà bot hay trúng. Trẻ con không né giỏi như bot, và **lưới / lưỡi kéo** phạt người đứng yên — bot ít bị.
  Cùng hiện tượng phiên 2A đã ghi.
- **Cá Trê nặng hơn Cua Đá một chút** (máu mất 21–45% → 39–44%, đánh lâu hơn 0–5 giây): bù đúng phần tinh anh nhẹ đi, tổng tỉ lệ thắng giữ.
  Đo theo chiêu (ải 4-3, 4-4, 12 lượt mỗi ải, sau khi hạ bùn phụt): bùn phụt 16%, quất râu xoay 15%, lặn bùn 5%, phun bùn 2% máu / lượt.
- **Đòn mạnh nhất** Cá Trê 66–68% máu (đòn trồi lên sau lặn, × 1,3 — bằng hệ số Đập càng của Cua Đá; trước 37–66%). Không có đòn một phát chết khi bé đủ máu.
- Phiên 4 (cân bằng) có thể chỉnh trong `S3A` (`js/chieu_trum.js`): `caTreMep.sat / nghi`, `caTreRau.lan`, `raiCaLuoi.giu / sat`, `cocBot.R`.

## 4. Tệp đã đổi

| Tệp | Thay đổi |
|---|---|
| `game/js/data.js` | Cờ `G.TRUM_SONG` (`?trumsong=0`); `G.MOB_ART.elite[3] = ['raiCaChua', 'cocChua']`, `mini[3] = 'caTre'` (chỉ khi `G.VUNG4`). `G.VUNG4_MUON` giữ 1 (Thuồng Luồng của 3B / 3C). |
| `game/js/boss.js` (khối trùm nhỏ) | `BODY.caTre`, `MINI_SK.caTre`, `MINI_NHIP.caTre`; `thinkMini`: Cá Trê gọi `G.chieuTrum.caTre`. Không đụng khối `thuong`. |
| `game/js/chieu_trum.js` | Khối 3A: bảng `S3A`, tên chiêu `TEN3A`, mẹo `MEO3A`; lưới chài trên bé (`batLuoi` / `tickLuoi`), kéo bé an toàn (`datBe`), 2 chiêu Rái Cá, 3 chiêu Cóc, 3 chiêu + chống mép Cá Trê; `CT.elite` / `CT.caTre`; `CT.tick` gọi lưới + chống mép; bọc `G.mobInit` (tên bảng thua, mẹo lần đầu); màu pha 2 Cá Trê lúc vẽ. |
| `game/js/monster_art.js` | Khối `song3a`: 3 `def` + `MA.hinhTam` (hình tạm). |
| `game/js/ky_nang_quai.js` | `MEO` thêm 2 tinh anh (bảng thua). |
| `game/js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/quai.json`, `chieu-trum.json`, `ky-nang-quai.json` | 19 câu tiếng Anh (3 tên, 10 tên chiêu, 2 mẹo, 4 chữ trên đầu). `ngon_ngu_en.js` thêm tay cuối tệp như 2A (không chạy `gop.py`). |
| `game/tests/trum_song.test.js` (mới) | 39 điều kiện (mục 5). |
| `game/tests/quai_song.test.js`, `game/tests/so_yeu_quai.test.js` | Điều kiện cũ "tinh anh / trùm nhỏ vùng 4 còn mượn" đổi theo 3A; Sổ yêu quái chỉ đòi tinh anh / trùm nhỏ 3 vùng đầu (vùng 4 chưa vào sổ — như 2A). |
| Thư mục này | `bao-cao.md`, `do_3a.py`, `do-truoc-sau.txt`, `so-lieu-do.json`, `ve_soat.py`, `xem-hinh-tam.png`. |
| `game/dist/*` | Phiên 3B đã dựng lại sau khi gộp 3A (có đủ mã 3A cuối cùng — đã soát). |

Không đụng: khối `thuong` / `js/thuong_luong.js` (3B), 8 quái thường (2A), nền / luật sông (2B), truyện (2C), đăng nhập Google / lưu mây / `?cloud=0`, bản lưu.

## 5. Cách kiểm (đã chạy)

- `node --check game/js/*.js`: sạch.
- `node game/tests/trum_song.test.js` — **PASS 39 điều kiện** (ba bản: thường, `?trumsong=0`, `?vung4=0`):
  1. bảng: mã mới ở vùng 4; `?trumsong=0` mượn Cua Tướng / Cá Nóc Chúa / Cua Đá; `?vung4=0` 3 vùng; tinh anh / trùm nhỏ 3 vùng cũ giữ nguyên;
  2. hình tạm (vùng `song`, loại, con mượn, nhuộm); 19 câu có tiếng Anh;
  3. Rái Cá: lưới báo 1 giây; đứng yên trúng lưới → giữ 1 giây, đẩy cần không đi; bấm Né liên tục thoát sau 0,27 giây, không lộn được; đuốc báo ≥ lưới còn + 0,9;
     thả ra bước ngang khỏi nón → không trúng đuốc; nổi giận gọi đúng 2 Rái Cá con một lần;
  4. Cóc: lưỡi kéo bé từ 90 về sát cóc; dậm báo 1,15 giây; bị kéo rồi lăn ra → không trúng dậm; mưa bọt 6 bọt vòng cách 46, đứng yên giữa không trúng; nổi giận 7 bọt, đứng yên trúng;
  5. Cá Trê: quất râu 4 vạch X báo 0,7, đứng giữa hai vạch không trúng; pha 2 bánh xe 12 nan / 3 đợt / 12 góc; phun bùn 3 vòng + vũng làm chậm; lặn bùn ẩn
     2,1 giây không nhắm được, vòng trồi 0,6, lộ bụng 1,5 giây; gợn đuổi chậm hơn bé chạy; pha 2 lặn 2 lần; chống mép: sát mép 1,5 giây → 5 cột dọc mép, báo 0,8;
     giữa sân không có; thấy cột thì bước vào trong → không trúng;
  6. không đòn một phát chết ở khuyên dùng 4-1 … 4-5 (tối đa 70% máu);
  7. bot bất tử qua 4-1, 4-3, 4-4 (×2) gặp Cá Trê và cả hai tinh anh, không NaN; `?trumsong=0` 4-4 chạy với Cua Đá;
  8. vẽ 3 mã mọi cử động (pha 1, 2) + lưới / gợn / vũng / lưỡi không lỗi; ảnh mượn nhuộm đúng, Cá Trê pha 2 ánh cam, trả `filter` cũ; không lỗi ngầm cả 3 bản.
- Bài khác (sau khi gộp 3B): `vung4` 38, `quai_song` 69, `song_luat` 40, `vung4_truyen` 20, `thuong_luong` 38, `so_yeu_quai` 41, `su_kien` 83, `thanh_tuu` 35,
  `viec_ngay` 36, `cam_giac_danh` 15, `bo_do_mua` 22, `cloud_save_regression`: đạt.
- `python3 game/build.py` + `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: **người chơi tải 16,29 / 20 MB** (trang 1,12 MB nén + ảnh 15,02 + bìa 0,15),
  một tệp 28,37 / 30 MB. Phiên 3A **không thêm ảnh**; mã mới ≈ 28 KB chưa nén.

## Commit
- `fa13054f` tinh anh + trùm nhỏ vùng 4, cờ, tiếng Anh, bài Node `trum_song`
- `2dc0b646` màu hình tạm theo ảnh soát, `xem-hinh-tam.png`
- `fffdbcde` hạ bùn phụt chống mép theo bot đo, công cụ đo + số liệu
- (commit cuối) báo cáo này

## Việc còn lại / cho phiên sau
- **Ảnh** (A, C: 2 tinh anh + Cá Trê + Cá Trê p2; E7, E8): dựng như mục 2 — hình tạm tự thôi.
- **Sổ yêu quái** vùng 4 (cả 8 quái thường của 2A và 3 con này) chưa có trang — cần chủ game quyết thưởng (như 2A đã đề xuất).
- **Phiên 4**: số trong `S3A` (mục 3); "bot biết bấm Né khi mắc lưới" để đo sát người chơi hơn.
- Bot cân bằng cũ (`tests/bot.js`) không biết giãy lưới / tránh đứng sát mép — không cần cho luật, chỉ ảnh hưởng số đo.
