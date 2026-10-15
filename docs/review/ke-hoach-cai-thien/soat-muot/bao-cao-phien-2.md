# Soát mượt — Phiên 2 "Cảm giác đánh": báo cáo

Ngày 15/10/2026, nhánh `khoi-tao-du-an`. Làm theo `bao-cao.md` mục 4, hàng "2. Cảm giác đánh": mục **5, 7, 13, 14, 24, 12A**.
Mỗi mục một cờ quay lui. Không chơi thử bằng trình duyệt: kiểm bằng `node --check`, `build.py`, bot Node (`tests/balance.py --node`,
`tests/dps.py --node`) và bài kiểm mới `tests/cam_giac_danh.test.js`.

## 1. Tóm tắt

| Mục | Đã làm | Cờ quay lui | Tệp |
|---|---|---|---|
| **5** Rung màn | Nhiễu mượt (3 sóng sin ~25 / 15 / 37 lần mỗi giây) thay số ngẫu nhiên mỗi khung. Làm tròn theo điểm ảnh thật của canvas (nửa điểm ảnh game khi Độ nét Cao). Mức sàn 0,75 điểm ảnh. Cú "đá" theo hướng chém tắt dần về một phía (trước lật dấu mỗi khung). Bỏ rung cộng đôi khi bị đánh. **Nút "Rung màn: bật/tắt"** ở Anh Mõ › Âm thanh, pin | `?rungcu=1` (`G.RUNG_MUOT`) | `fx.js`, `combat.js`, `village.js`, `ngon_ngu_en.js` |
| **7** Đẩy lùi | Đẩy lùi THẬT bằng vận tốc tắt dần (`e.kbVx/kbVy`, exp(−12·dt)). Đòn kết trượt mượt đúng quãng cũ thay vì dịch trong 1 khung. Trùm, quái giáp x0,2; tinh anh x0,5. Bẹp nhẹ `scale(1+b, 1−b)` 0,1 giây lúc trúng | `?dayluicu=1` (`G.DAY_LUI`) | `combat.js`, `moves.js`, `fx.js` |
| **13** Tiếng đánh | Cao độ ±8%. Tiếng trúng theo vũ khí (kiếm, giáo, búa trầm dần, đấm, phi tiêu). Đòn nặng thấp hơn và to hơn. Chí mạng thêm lớp cao. Tiếng vung ở 60% đà. `latencyHint: 'interactive'` | `?amcu=1` (`G.AM_MOI`) | `engine.js`, `combat.js`, `moves.js` |
| **14** Dừng hình | Trần 150 ms mỗi 0,5 giây. Lần dừng sau trong cửa sổ x0,6. Phi tiêu thường trúng dừng 25 ms | `?dungcu=1` (`G.DUNG_MOI`) | `fx.js` |
| **24** Lặt vặt | Chớp nhẹ trúng đòn mờ dần theo bình phương trong 0,07 giây. Số sát thương đi theo rung màn | `?chopmo=0` (`G.CHOP_MO`) | `fx.js`, `sprite_custom.js`, `combat.js` |
| **12A** Chạy + đòn nặng | Đòn không ghép chân chạy (`kiem_3`, `thuong_quet`, `bua_nen`, `bua_nen_dat`, `bua_giu`): hệ số đi 0,25 (đứng lại ra đòn), bụi gót lúc dừng | `?chaydanhnang=0` (`G.CHAY_DANH_NANG`) | `moves.js`, `fx.js` |

Tắt cả 6 cùng lúc: `?rungcu=1&dayluicu=1&amcu=1&dungcu=1&chopmo=0&chaydanhnang=0`. Với chuỗi này, bot đo ra **đúng từng số** như bản trước phiên
(`tests/dps.py` có hạt giống: 8 cột số trùng khớp với bản gốc, xem mục 4.3).

**Cân bằng:** tỉ lệ thắng từng ải và thời gian giết không đổi quá nhiễu đo (mục 4). Không thêm vàng / quặng / đá / linh khí / sức mạnh nào.

## 2. Chi tiết từng mục

### Mục 5 — rung mượt, mức sàn, nút tắt

- `fx.js stepShake` (bản mới):
  - `ax = max(4·trauma², sàn)`, `ay = max(3·trauma², 0,6·sàn)`.
  - `sàn = 0,75 · min(1, trauma / 0,08)` khi còn trauma.
  - Hướng rung: `sin(T·157)·0,5 + sin(T·94+1,3)·0,3 + sin(T·233+2,1)·0,2` (trục dọc lệch pha khác).
  - `T` là đồng hồ riêng chạy cả lúc khựng hình (`S.tThuc`), nên rung không đứng hình theo cú khựng.
  - Làm tròn: `Math.round(v · G.NET) / G.NET`. Độ nét Cao (NET 2) là nửa điểm ảnh game; Thường là 1 điểm ảnh, không bị nhoè.
  - Cú đá `kx, ky` nhân `exp(−15·dt)` mỗi nhịp (~0,1 giây), không lật dấu.
- Đòn thường (trauma ~0,15): trước 4 × 0,02 = 0,09 điểm ảnh, làm tròn về **0**. Nay ít nhất 0,75 điểm ảnh, cộng cú đá 1,2 điểm ảnh theo hướng chém.
- Bị đánh: `hurtPlayer` không đặt thêm `W.shake = 0,18`, vì `FX('hurt')` đã rung 0,45. Trước bị rung hai lần. Khi không vẽ (bot) vẫn giữ như cũ.
- **Nút tắt:** Anh Mõ › "Âm thanh, pin ›" › hàng dưới có 3 nút: Xem lại truyện | **Rung màn: bật/tắt** | ‹ Trở lại.
  - Lưu ở `G.save.rungTat = true`. Lưu theo bản lưu (đi theo mây như Tiết kiệm pin). `G.fixSave` giữ trường này (đã kiểm).
  - Tắt thì `trauma()` / `kick()` không làm gì, ở cả bản mới lẫn `?rungcu=1`. Khựng hình, chớp, tiếng vẫn giữ.
  - Có bản tiếng Anh: `tools/ngon-ngu/tu-dien/cam-giac-danh.json`. Chỉ thêm đúng 4 dòng vào `ngon_ngu_en.js`, không chạy `gop.py`, vì chạy nó sẽ xếp lại 380 dòng của phiên khác.

### Mục 7 — đẩy lùi thật + bẹp nhẹ

- `combat.js`:
  - `G.kbDay(e, ux, uy, v, dat)` đặt vận tốc lùi.
  - `kbBuoc` chạy mỗi nhịp, ngay sau quái tự đi, trước khi tách quái chồng nhau. Sau đó vẫn qua chỗ giữ quái trong phòng có sẵn.
  - `G.kbQuang(d)` đổi quãng → vận tốc, khớp nhịp 1/60 giây.
- Đòn cận chiến trúng:
  - Quái lùi 2,5 điểm ảnh (đòn thường) hoặc 3,5 (nặng / chí mạng), trong ~0,25 giây, theo hướng người chơi → quái.
  - **Không đẩy quá 80% tầm đánh của vũ khí** (`giuTam`), để chuỗi đòn vẫn nối được.
  - Phi tiêu và mưa phi tiêu không đẩy.
- Đòn kết (`moves.js push`: nhát kết kiếm 10, quét giáo 8 điểm ảnh): trước dịch trong **một** khung, nay trượt mượt **đúng quãng cũ** (bài kiểm: 9,7 điểm ảnh, khung đầu 1,8).
- Hệ số theo loại quái:

  | Loại | Hệ số |
  |---|---|
  | Trùm, trùm nhỏ | 0,2 |
  | Quái giáp (`shield` / có `armor`) | 0,2 |
  | Tinh anh | 0,5 |
  | Trùm cây đứng gốc (`moc`) | 0 |
  | Quái đang đóng băng, bị trói chân, đang lặn | 0 |

  - Trước đây đòn kết không đẩy trùm. Nay trùm lùi 0,2 × quãng (~2 điểm ảnh).
- Hình:
  - Có đẩy lùi thật thì bỏ dời hình giả 2–4 điểm ảnh (`fx.js e.fxD`). Trùm vẫn dời giả 1 điểm ảnh như cũ.
  - Bẹp nhẹ `scale(1 + b, 1 − b)`: b = 0,06 / 0,08 / 0,1 (thường / nặng / chí mạng), trùm x0,35, trả về theo bình phương trong 0,1 giây.
  - Bẹp này thay cho "vươn cao" `fxS` cũ, vì hai cái cùng lúc thì triệt nhau.
  - Bẹp làm trong `fx.xf` (phép biến đổi bọc quanh lúc vẽ quái / trùm), không trong `SC.veQuai`. `veQuai` không nhận đối tượng quái, mà `js/mobs.js` (tệp của Phiên 1) dựng tham số cho nó. Kết quả trên màn như nhau.
- **Chưa làm:** "động tác trúng đòn chạy cùng lúc với động tác khác". Dòng đó nằm ở `mobs.js` (A.enemy, mục 19 của Phiên 1 vừa sửa đúng dòng này), nên để Phiên 1 / phiên sau quyết.
- **Vì sao số nhỏ hơn đề xuất (120 / 220):** đo bằng `tests/dps.py quaimoi mot` (một quái).
  - Vận tốc 120 / 220 (10 / 18 điểm ảnh): kiếm mất 14–26% sát thương mỗi giây, vì quái bị đẩy ra khỏi tầm 32 của kiếm.
  - 2,5 / 3,5 điểm ảnh nhưng chưa giữ tầm: `balance.py vukhi` kiếm còn thua ~6 điểm phần trăm.
  - Có giữ tầm 80%: nằm trong nhiễu đo (mục 4).

### Mục 13 — tiếng đánh

- `engine.js` thêm `hitKiem` 240 Hz vuông, `hitGiao` 330 Hz tam giác, `hitBua` 118 Hz vuông (trầm dần còn 0,6 lần, 0,1 giây), `hitDam` 190 Hz, `hitTieu` 430 Hz, `chiMang` 1320 Hz sin (vút lên 1,5 lần).
- `G.sfxDanh(loại)` thay cho mọi `G.sfx('hit')` của đòn người chơi: chém, đâm, nện, lướt, phi tiêu.
  - `combat.js playerHit` ghi lại đòn vừa trúng có chí mạng / nặng không (`G.amGhi`).
  - Đòn nặng: cao độ x0,82, to x1,3. Búa luôn tính là nặng.
- Cao độ ±8% dùng `Math.random`, không đụng `G.rnd` của luật chơi. Lúc không vẽ (bot) `G.sfx` thoát ngay, không rút số ngẫu nhiên nào.
- `G.sfxVung(cao, thời lượng, hitAt, đã đi)`: tiếng vung hẹn bằng đồng hồ âm thanh ở 60% quãng từ lúc ra đòn tới lúc chạm. Búa (hitAt 0,35 của 0,8 giây) kêu sau ~0,17 giây, không kêu lúc bấm nút.
  - Giới hạn: đòn bị huỷ (lộn né) trong khoảng đó thì tiếng vung vẫn kêu.
- `G.sfx(tên, cao, to, trễ)`: thêm hai tham số tuỳ chọn. Chỗ gọi cũ không đổi gì.
- `AudioContext({ latencyHint: 'interactive' })`. Máy không nhận tuỳ chọn thì tạo như cũ.
- **Chưa nghe thử bằng tai** (phiên này không mở trình duyệt). Số tần số / âm lượng nằm trong bảng `SFX`, chỉnh dễ.

### Mục 14 — dừng hình

- `fx.js stop()`:
  - Cửa sổ 0,5 giây (đồng hồ chạy cả lúc khựng).
  - Trong một cửa sổ: lần thứ n nhân 0,6ⁿ, tổng không quá 150 ms, dưới 8 ms thì bỏ.
  - Cú khựng ≥ 120 ms (trùm gục 120) giữ nguyên, không tính vào trần.
  - Ví dụ quét chết 5 con liền: trước 100 + 100 + 100… (có nghỉ 70 ms giữa các lần), nay 100 + 50 (chạm trần) rồi chạy mượt.
- Phi tiêu / mũi tên thường trúng: dừng 25 ms. Phát giữ rồi thả vẫn 50 ms như cũ.
- Chỉ có khi vẽ (bot không có khựng hình), nên không đổi luật chơi.

### Mục 24 — chớp mờ dần, số theo rung

- `G.fx.chopMo()` trả `(e.flash / 0,07)²` của con đang vẽ. `combat.js` đặt `G.fx.dangVe` trước khi vẽ từng quái / trùm, ở cả hai đường vẽ: đường dùng lại hàm của Phiên 3 (`veQuaiDW`) và đường cũ `?venhe=0`.
- `sprite_custom.js`: chớp nhẹ `o.hit` nhân hệ số này, rồi mới so với chớp đầu hàng trúng đòn.
  - Kết quả: chớp 4 nhịp 1 → 0,69 → 0,4 → 0,18, thay vì bật / tắt cứng.
  - Chớp đầu hàng trúng đòn (0,75) giữ như cũ.
- Số sát thương (lớp giao diện) dời theo `S.sx, S.sy`, nên không còn trượt so với quái khi màn rung.

### Mục 12A — đòn nặng đứng lại ra đòn

- `moves.js donDung(P)` khớp đúng cách `zed_moi.js` chọn hàng:
  - búa (mọi đòn, kể cả lúc giữ);
  - nhát thứ 3 của kiếm (`comboI % 3 === 2` → `kiem_3`);
  - quét giáo (`kind === 'quet'` hoặc `comboI === 3`).
- Hệ số đi lúc đó: `G.CHAY_DANH_CFG.dungDanh = 0,25`. Trước là 0,75 / 0,6 / 0,65 / 0,5.
- Vào đòn mà đang chạy: bụi toé sau gót (`G.fx.buiDung`).
- Chọn 0,25 (đầu trên của khoảng 0,15–0,25 trong báo cáo): 0,2 làm kiếm một mục tiêu thấp hơn ~6% trên bot.

## 3. Cách kiểm

```
cd game
for f in js/*.js tests/*.js; do node --check $f; done           # đạt
node tests/cam_giac_danh.test.js                                  # ĐẠT 15 mục (cờ, đẩy lùi, giữ tầm, đòn kết, đóng băng, 12A, bản lưu, âm thanh)
node tests/su_kien.test.js                                        # PASS 83
node tests/cloud_save_regression.test.js                          # PASS (đăng nhập Google / lưu mây không đổi)
python3 build.py                                                  # đạt, 27,95 MB / 30 MB
python3 tests/balance.py 60 - - --node                            # sau
LK_Q='rungcu=1&dayluicu=1&amcu=1&dungcu=1&chopmo=0&chaydanhnang=0' python3 tests/balance.py 60 - - --node   # trước
```

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `?cloud=0`. Không chép apiKey. Không chạm `master`.

## 4. Cân bằng trước / sau (LUAT-CAN-BANG.md)

"Trước" là cùng mã sau khi rebase lên các phiên khác (Phiên 1, Phiên 3 đã vào nhánh), tắt cả 6 cờ: luật y hệt bản trước phiên này.
"Sau" là bản mặc định. Bot Node, bản lưu thật `tests/cay_luu.json` (vừa đủ Sức mạnh khuyên dùng).

**Đọc nhiễu:** với 60 lượt một ải, tỉ lệ thắng ~85% có sai số chuẩn ~4,6 điểm mỗi bên, chênh lệch hai bên ~6,5 điểm. Lệch ±5–8 ở một ải lẻ
là nhiễu. Ải nào lệch quá 5 điểm đều được chạy lại 150–200 lượt (bảng 4.2).

### 4.1 Từng ải, 60 lượt mỗi ải (vũ khí của bản lưu)

| Ải | Thắng trước | Thắng sau | Lệch (điểm) | Thời gian ải trước → sau (giây) | Đánh quái trước → sau (giây) | Trùm trước → sau (giây) | Giây / quái hạ trước → sau |
|---|---|---|---|---|---|---|---|
| 1-1 | 60/60 (100%) | 60/60 (100%) | +0.0 | 170 → 169 | 140 → 140 | 33 → 32 | 7.49 → 7.45 |
| 1-2 | 60/60 (100%) | 58/60 (97%) | -3.3 | 206 → 204 | 168 → 164 | 40 → 41 | 8.16 → 8.20 |
| 1-3 | 60/60 (100%) | 58/60 (97%) | -3.3 | 278 → 277 | 194 → 191 | 86 → 87 | 7.24 → 7.35 |
| 1-4 | 60/60 (100%) | 60/60 (100%) | +0.0 | 298 → 305 | 249 → 257 | 50 → 50 | 6.50 → 6.75 |
| 1-5 | 53/60 (88%) | 55/60 (92%) | +3.3 | 314 → 320 | 232 → 237 | 83 → 85 | 5.66 → 5.81 |
| 2-1 | 56/60 (93%) | 51/60 (85%) | -8.3 | 239 → 247 | 188 → 196 | 52 → 52 | 9.08 → 9.16 |
| 2-2 | 44/60 (73%) | 46/60 (77%) | +3.3 | 262 → 264 | 198 → 202 | 65 → 64 | 7.53 → 7.71 |
| 2-3 | 49/60 (82%) | 52/60 (87%) | +5.0 | 263 → 265 | 208 → 211 | 55 → 55 | 6.50 → 6.76 |
| 2-4 | 50/60 (83%) | 46/60 (77%) | -6.7 | 281 → 286 | 240 → 246 | 42 → 41 | 5.83 → 5.91 |
| 2-5 | 54/60 (90%) | 51/60 (85%) | -5.0 | 292 → 292 | 237 → 238 | 56 → 55 | 5.23 → 5.27 |
| 3-1 | 58/60 (97%) | 57/60 (95%) | -1.7 | 282 → 270 | 228 → 215 | 56 → 56 | 8.80 → 8.30 |
| 3-2 | 57/60 (95%) | 53/60 (88%) | -6.7 | 275 → 276 | 215 → 217 | 60 → 59 | 7.29 → 7.33 |
| 3-3 | 51/60 (85%) | 52/60 (87%) | +1.7 | 351 → 333 | 298 → 280 | 54 → 54 | 8.69 → 8.33 |
| 3-4 | 46/60 (77%) | 43/60 (72%) | -5.0 | 368 → 375 | 313 → 318 | 56 → 58 | 6.48 → 6.58 |
| 3-5 | 36/60 (60%) | 28/60 (47%) | -13.3 | 339 → 338 | 293 → 293 | 47 → 46 | 5.80 → 5.75 |
| **Tổng** | **794/900 (88,2%)** | **770/900 (85,6%)** | **−2,7** | **278 → 277** | | **56 → 56** | dấu ấn 52,7 → 52,3 mỗi ải |

Cùng phép đo trên mã trước khi rebase (bản gốc đầu phiên so với bản cuối của phiên này): **789/900 → 784/900 (−0,6 điểm)**, một ải 277 → 277 giây,
dấu ấn 52,6 → 51,9.

### 4.2 Chạy lại các ải lệch quá 5 điểm (bản cuối)

| Ải | Lượt | Trước (tắt cờ) | Sau | Lệch |
|---|---|---|---|---|
| 2-1 | 60 | 52/60 (87%) | 52/60 (87%) | 0 |
| 2-4 | 60 | 49/60 (82%) | 50/60 (83%) | +1,7 |
| 3-2 | 60 | 59/60 (98%) | 56/60 (93%) | −5,0 |
| 3-5 | **200** | 99/200 (49,5%) | 100/200 (50,0%) | +0,5 (tới trùm 157 → 153, thắng trùm 63% → 65%) |

Bản trung gian (đẩy lùi chưa giữ tầm), 150 lượt mỗi ải: 2-2 79 → 79%, 2-3 86 → 85%, 2-5 79 → 87%, 3-4 82 → 83%.

**Kết luận:** không ải nào lệch quá ±5 điểm khi đo đủ lượt. Ải 3-5 dưới 60% là chuyện có sẵn, không do phiên này: bot ra 50% ở cả hai bản.
Thời gian giết mỗi quái tăng 0–4% ở vài ải: quái lùi 2,5 điểm ảnh, bot phải bước theo. Thời gian một ải không đổi.

### 4.3 Từng loại vũ khí (`balance.py 12 - - vukhi`, 15 ải x 12 lượt = 180 lượt mỗi loại)

| Vũ khí | Thắng trước | Thắng sau | Lệch (điểm) | Ải lệch nhiều nhất (12 lượt, nhiễu lớn) | Một ải trước → sau (giây) |
|---|---|---|---|---|---|
| Kiếm | 162/180 (90%) | 161/180 (89%) | −0,6 | 1-5 −8, 2-4 +8 | 277 → 275 |
| Phi tiêu | 149/180 (83%) | 150/180 (83%) | +0,6 | 1-4 −17, 1-3 +25 | 254 → 254 |
| Giáo | 114/180 (63%) | 115/180 (64%) | +0,6 | 2-5 −33, 2-1 +17 | 326 → 333 |
| Búa | 122/180 (68%) | 117/180 (65%) | −2,8 | 2-5 −33, 3-5 +17 | 323 → 327 |
| **Tổng** | 547/720 | 543/720 | −0,6 | | 291 → 293 |

### 4.4 Sát thương mỗi giây (thời gian giết), `tests/dps.py 30 20 quaimoi [mot] khonghe --node`

20 hạt giống x 30 giây, có hạt giống nên chạy lại ra đúng số. "Tắt cờ" trùng khớp từng số với bản gốc đầu phiên.

| Vũ khí | Một quái: tắt cờ → sau | Cụm 5 quái: tắt cờ → sau | Chỉ đẩy lùi (một / cụm) | Chỉ 12A (một / cụm) |
|---|---|---|---|---|
| Kiếm | 25,6 → 26,2 (+2%) | 41,1 → 44,0 (+7%) | 26,8 / 43,0 | 25,4 / 42,6 |
| Phi tiêu | 32,0 → 32,0 (0%) | 32,8 → 32,8 (0%) | 32,0 / 32,8 | 32,0 / 32,8 |
| Giáo | 19,6 → 19,8 (+1%) | 26,7 → 27,4 (+3%) | 19,8 / 27,4 | 19,6 / 26,7 |
| Búa | 13,9 → 15,0 (+8%) | 32,2 → 30,0 (−7%) | 13,9 / 31,3 | 15,0 / 30,6 |

Các bản đã thử và bỏ (một quái, 10 hạt giống):

| Bản thử | Kiếm | Phi tiêu |
|---|---|---|
| Đẩy lùi 120 / 220 (theo báo cáo) | −26% | |
| Đẩy lùi 40 / 60, phi tiêu đẩy 25 | −8% | −10% |

`dps.py` vốn đã báo "SAI" về độ lệch giữa các vũ khí từ trước phiên này. Phiên này không làm các điều kiện đó tốt hay xấu đi.

### 4.5 Kinh tế (luật mục 1, 3)

Phiên này không thêm phần thưởng nào: vàng, quặng, đá, linh khí, sức mạnh mỗi lượt và mỗi ngày đều **+0**.

| Chỉ số mỗi ải (bot, 900 lượt) | Trước | Sau |
|---|---|---|
| Dấu ấn linh khí | 52,7 | 52,3 |
| Số quái hạ | 32,5 | 32,2 |

Mức chênh này là nhiễu. Số lượt qua 15 ải: tỉ lệ thắng từng ải không đổi (4.1–4.2), nên không giảm.

## 5. Còn lại / lưu ý cho phiên sau

- Cần **chơi thử bằng tay** (báo cáo gốc ghi "+ chơi thử cảm giác"): độ rung, tiếng búa / chí mạng, 2,5 điểm ảnh đẩy lùi có đủ "nặng" không. Mọi số nằm ở đầu khối:
  - `G.DAY_LUI_SO` (`combat.js`)
  - `DUNG` (`fx.js`)
  - `SFX` (`engine.js`)
  - `G.CHAY_DANH_CFG.dungDanh` (`moves.js`)
- Mục 7 phần "động tác trúng đòn chạy cùng lúc" nằm trong `mobs.js` (của Phiên 1), chưa làm.
- Tiếng vung hẹn bằng đồng hồ âm thanh. Đòn bị huỷ bằng lộn né trong 0,05–0,2 giây đầu thì tiếng vung vẫn kêu.
- `?rungcu=1` chỉ trả cách rung cũ. Nút "Rung màn: tắt" vẫn có tác dụng ở mọi bản.
