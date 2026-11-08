# AUDIT cơ chế cộng hưởng · ghép · liên kết · phá huỷ (08/11/2026)

Yêu cầu người dùng: *"Vì game này tư duy chiến thuật nhiều nên tôi muốn các cơ chế cộng hưởng ghép nối phá huỷ nó cần ăn khớp nhau"*. Đối chiếu với 10 nguyên tắc ở [NGUYEN-TAC.md](NGUYEN-TAC.md). Đợt này **chỉ rà + báo cáo**, không sửa code game.

- **Mã đã rà:** `claude/demo-hop-tuong` @ `e16ed1ff` (chưa có: Copycat trạng thái mới, Ember relay khi rời bàn, ụ Tím wildcard, hoạt ảnh trùm — các session khác đang làm). Đọc `game.js` (hopLeGhep / ghepDacBiet / ghep / laGhepThat / haSao / trùm), `skills*.js`, `vangmoi1.js`, `chihuy*.js`, `trum.js`, `jackpot.js`, `online/dongbo.js`.
- **Test đã chạy lại:** `thap-kt-cong-huong-luat` 404/404 · `thap-kt-matran` 428/429 (lỗi F19 do test cũ) · `thap-kt-sao-tai-cho` nhóm 1–4 37/37 (nhóm 5 trang thật hết giờ chờ ảnh — chỉ do bản xuất thiếu ảnh) · `thap-kt-ngau-nhien-sinh` xanh · `thap-kt-khong-ban` 25/25.
- **Kiểm lúc chạy (Playwright `page.evaluate`, trận PVP, bàn dựng tay):** 22 ca — kết quả ghi ở cột "Hiện tại" (đánh dấu *đo*).
- Mức: **P0** = phạm nguyên tắc / lệch online · **P1** = lệch giữa các ụ giống nhau, gây bất ngờ, hoặc phạm nguyên tắc nhưng trước đó người dùng đã chốt khác (→ câu hỏi mở) · **P2** = đánh bóng.

## 1. Kết quả theo nguyên tắc
| # | Nguyên tắc | Kết luận |
|---|---|---|
| 1 | Ghép cùng loại: kết quả theo ô ĐÍCH | **Lệch**: Pháo La Bàn xoá bản sao (F1), Prism hợp thể lấy "tất cả đều là bản sao" + max Ép Xung/Aurora (F2), MK+MK chuyển vàng sang đích (F7). Twin Anvil đúng. |
| 2 | Ghép ra ụ ngẫu nhiên = ụ mới thật, quay lại | Quay lại đúng (test xanh). **Lệch**: ụ ra trùng loại giữ cộng dồn/Ép Xung (F5), ụ ra nhận buff Anvil (F6). |
| 3 | +★/−★ tại chỗ, biến hình: không phải ghép | Đúng (sao-tai-cho). Biến hình giữ buff không đều (F9). |
| 4 | Ngẫu nhiên khi xuất hiện quay lại mọi lần | Đúng (ngau-nhien-sinh: 6 ụ × 9 đường + online). |
| 5 | Copycat chép không phải ghép | Đúng (`laGhepThat` = false; Archive/Rồng/Star Breaker/Mirror không kích). Copycat làm rơi buff Anvil (F8). |
| 6 | Hiệu ứng khi rời bàn chạy với MỌI đường rời bàn | **Chưa có điểm chung**: 13 chỗ ghi thẳng `B.t[o] = null` (F4) — móc Ember đang làm sẽ sót nếu không gom. |
| 7 | Đá/băng không nhận debuff mới, vẫn mất sao | **Lệch**: Freezer đóng băng LẠI ụ đang băng (F3). Mất sao đúng. Các nguồn +★ tự động xử lý ụ băng khác nhau (F10); dấu Mạch Máu chạy tiếp trên ụ băng (F12). |
| 8 | Cộng dồn hành động thuộc ụ (ụ mới = 0); cộng dồn bàn dùng chung | **Lệch** ở `GIU_CONG_DON` (F5); online thiếu cờ cho nhiều cộng dồn riêng ụ (F14). |
| 9 | Tất định: chỉ RNG có hạt; VFX không đổi luật | **Lệch**: còn Math.random trong luật lõi + PVP phá bàn (F15, F16). |
| 10 | Hỗ trợ không bao giờ bắn | Đúng (khong-ban 25/25). |

## 2. Bảng phát hiện
| ID | Mức | Ụ | Sự kiện | Hiện tại | Đúng theo nguyên tắc | Sửa tối thiểu đề xuất |
|---|---|---|---|---|---|---|
| F1 | **P0** | Pháo La Bàn `canon` | Ghép thật cùng loại, ĐÍCH là bản sao | *đo*: ụ ra `banSao=false` → bản sao 70% thành ụ thật 100% chỉ bằng 1 lần ghép (khai thác: Copycat chép Pháo rồi kéo Pháo thật vào) | NT1: giữ bản sao của ô đích | `skills.js` canon.ghepDB.lam: bỏ `b.banSao = false` |
| F2 | **P0** | Prism Thief `bienmau` | Hợp thể vuốt / mặt nạ + mặt nạ | *đo*: mặt nạ thật kéo vào mặt nạ BẢN SAO → ra mặt nạ thật; vuốt có ô cuối là bản sao → ra thật. `gop` lấy `banSao = mọi ụ đều là bản sao`, Ép Xung/Aurora = max của 4 ụ | NT1: theo ô cuối (đích) cả bản sao lẫn Ép Xung/Aurora | `skills7.js` gop: `N.banSao = !!L.banSao; N.epxung = L.epxung; N.aurora = L.aurora` |
| F3 | **P0** | trùm Freezer (mọi ụ) | Đóng băng khi mọi ụ không đá đều đang băng | *đo*: 2 ụ băng còn 0,5 s bị băng lại → 6,3 s (nhánh dự phòng `ds1 = ds`) | NT7: ụ băng không nhận debuff mới | `game.js` capNhatTrum freezer: bỏ dự phòng, `ds1` rỗng → chiêu hụt (`E.knT = 2`) |
| F4 | **P0** (rủi ro) | Ember Relay + mọi ụ | Rời bàn | Không có hàm rời bàn chung. Các đường: ghép thường (ụ kéo + ụ đích bị thay) `game.js:221`, Pháo La Bàn `skills.js:104`, Ép Xung `skills2.js:636`, MK `skills2.js:765/772`, Anvil kéo (thành công + vỡ) `skills4.js:295`, Prism hợp thể 3 ô `skills7.js:374/382`, Mạch Máu nuốt `skills7.js:92`, hạ sao 1★ = phá (Nightmare, cháy) `game.js:678`, tái chế trứng cháy `skills2.js:948`, Genesis hết lượt `skills5.js:321`, Joker (biến Mimic rồi ép ghép), online `datO`/`apAnh` `dongbo.js:236` + `apAnh` | NT6: mọi đường rời bàn kích đúng 1 lần; biến hình/đá/băng/−★ không kích; bàn con rối không tự kích (nhận theo cờ của máy chủ bàn) | Thêm `xoaU(B, T, ly)` duy nhất (ly: ghep / an / vo / pha / tai-che / het-luot / mang) và đổi 13 chỗ sang gọi nó; móc Ember gắn vào `xoaU`, bỏ qua khi `ly === 'mang'` |
| F5 | P1 | Leviathan, Hộp Bí Ẩn, Evolver, Rồng Máy, Ép Xung | Ghép thường ra ụ ngẫu nhiên TRÙNG loại | *đo*: Leviathan(40)+Leviathan(10) → Leviathan ABYSS 40; Mimic+Leviathan(40) → 0. Ép Xung 0,5 giữ nếu ra cùng loại, 0 nếu khác. Chữ thẻ Leviathan nói "a new one starts at 0" | NT2 + NT8: ụ ra là ụ mới → 0 (trừ khi người dùng giữ quyết định 07/11) | Câu hỏi Q1. Nếu chọn theo nguyên tắc: xoá `GIU_CONG_DON` + nhánh `epxung` trong `ghep` |
| F6 | P1 | Twin Anvil (buff `anv`) | Ghép thường ụ đang có buff Anvil | *đo*: Mimic + Pháo có buff ST 20% → ụ ra (Prism) mang buff 20% | NT2: ụ mới không mang buff thân cũ (đã chốt ở thiết kế Anvil "lấy buff mạnh hơn") | Câu hỏi Q2. Theo nguyên tắc: bỏ dòng `ra.anv = …` trong `ghep` |
| F7 | P1 | Merge King `vughep` | MK vàng kéo lên MK thường | *đo*: đích +2★ VÀ thành vàng (`b.vang = a.vang ∥ b.vang`) | NT1/NT3: +★ tại chỗ, đích giữ dạng của nó | `skills2.js` vughep.lam: bỏ dòng `b.vang = …` (Q3 nếu muốn giữ) |
| F8 | P1 | Copycat `saochep` | Copycat đang có buff Anvil đi chép | *đo*: giữ Ép Xung 0,2, Aurora, khiên; MẤT buff Anvil — chữ thẻ "keeps the Copycat's own buffs" | Giữ mọi buff không ngẫu nhiên của thân Copycat | `skills2.js` saochep.lam: thêm `N.anv = a.anv` |
| F9 | P1 | Mad Crown, Hộp Bí Ẩn, Scrambler, Evolver nở, Joker | Biến hình (`chuyenU`/`giuKhiBien`) | *đo*: giữ bản sao + khiên + buff chỉ huy; MẤT Ép Xung + buff Anvil. Copycat (cũng là biến hình) lại GIỮ Ép Xung | 1 luật cho buff vĩnh viễn trên thân khi biến hình | Câu hỏi Q4; sửa ở 1 chỗ `giuKhiBien` |
| F10 | P1 | REINFORCE, Genesis, Pandora ALLY STAR, Star Leech trả sao, Star Lift | +★ tự động | REINFORCE / Genesis / Star Lift bỏ ụ đá + băng; Pandora (`skills3.js:405`) và Star Leech trả sao (`trum.js:196`) chỉ bỏ đá → ụ băng nhận | Cùng 1 bộ lọc (CAN-HOI 8B: bỏ băng) | Hàm `nhanSaoTuDong(T)` = `!da && !(bang>0)` dùng ở cả 5 chỗ |
| F11 | P1 | Ember Relay, Rồng Máy | Ghép cùng hàng/cột cộng lửa/nhiệt | *đo*: Relay băng 1→10 lửa, Rồng băng +15 nhiệt; ụ đá không nhận. Trong khi ô băng không nhận buff hỗ trợ (CAN-HOI 10B), Choir đếm ụ băng | Chưa có nguyên tắc → Q5 | Theo lựa chọn Q5 (1 điều kiện chung) |
| F12 | P1 | Blood Circuit `mauhut` | Mục tiêu đã đánh dấu bị đóng băng | Đá: dừng đếm; băng: vẫn đếm và nuốt ụ băng (`skills7.js:87`) | NT7 + nhất quán với đá | Q6; theo nguyên tắc: `if (biKhoa(X)) return false` |
| F13 | P2 | TWIN SIGNAL, CROSSFIRE | Ụ được buff bị đá/băng giữa chừng | Vẫn cộng buff (QUICK TUNE, NEXUS thì tắt bằng `khoaT`) — không đổi sát thương (ụ khoá không bắn) nhưng bảng chỉ số hiện buff | Như QUICK TUNE / NEXUS | `chihuy-moi.js` buf: thêm `!this.khoaT(T)` cho twin/thap |
| F14 | P1 | Leviathan `vuc`, Nine-Tail `duoi`, Nemesis `nm*`, Genesis `luot/sinhT`, Hive `bay`, khiên, Aurora, cháy/kẹp | Online ảnh chụp / gói ghép | Không có trong cờ ô `oTT` → bàn con rối dựng lại ô (`apAnh` → `taoU`) về 0; ghép thường trên bàn con rối dùng số cũ cho `GIU_CONG_DON` | Mọi cộng dồn riêng ụ đi theo cờ ô | Thêm cờ vào `oTT`/`datO` (cùng kiểu 'r' Ember, 'H' Rồng) |
| F15 | P1 (online) | Scrambler PVP, Signal Jammer, Hộp Bí Ẩn | Hiệu ứng ghép lên bàn đối thủ / biến hình | `Math.random` (`skills2.js:568, 613–614`, `skills4.js:106`): mỗi máy quay riêng → người ghép thấy kết quả khác bàn thật tới ảnh chụp kế (≤ 1 s) | NT9 | `rngHat(hạt trận + bàn + B.ghepN)` như Pandora |
| F16 | P1 | mọi ụ | Luật lõi | Còn `Math.random`: ụ ra khi ghép (`pick`), ô/loại triệu hồi, hồi chiêu đầu (`taoU.cd`), chí mạng (`trung`), Dice Gun, giết ngay/choáng hỗ trợ (`hotro.js:162/174`), Twin Maker offline. `sinhR`/`ktDeck` tráo `Math.random` toàn cục → hình gọi trong `sinhU` sẽ ăn RNG luật | NT9 | Truyền rng tường minh; FX dùng RNG riêng (đã ghi ở GAMEPLAY 08/11) |
| F17 | P2 | mọi ụ có chạm | Online gói 'cd' | `dongbo.js:196` gỡ đá + băng trên bàn con rối trước khi chạy kỹ năng chạm | Không tự gỡ trạng thái; chờ ảnh chụp | Bỏ `T.st.bang = 0; T.st.da = false` |
| F18 | P2 | Pháo La Bàn, Anvil, Prism, MK+MK | Sao của ghép cùng loại | Trung bình làm tròn lên / max / max / +1–2★ | Khác nhau có chủ ý — ghi rõ trên thẻ + mẹo khi rê (đã có xem trước sao) | Chữ thẻ |
| F19 | P2 | Twin Anvil | Test cũ | `thap-kt-matran` [lo × ghepDich] mong "mat" nhưng Anvil+Anvil ghép thường đã bị chặn | — | Sửa kỳ vọng test |

**Đúng, không cần sửa (đã kiểm):** Teleporter đổi chỗ ô đá/băng giữ trạng thái · MK lên bản sao giữ bản sao + stack · Copycat chép ô băng ra bản sao thường, không chép ô đá · bản sao chép bản sao vẫn là bản sao · ghép thường bản sao + bản sao ra ụ thật (NT2) · Twin Signal hết khi 1 ụ rời bàn bằng BẤT KỲ đường nào (`song`) · NEXUS đứt khi đổi chỗ · Star Leech/Nightmare không nhắm ô đá nhưng hạ sao ô băng (NT7) · Lucky Slot chỉ quay khi xuất hiện.

## 3. Ma trận sự kiện × hành vi chung (mọi ụ đi chung đường code)
| Sự kiện | Đường code | Bản sao | Đá | Băng | Cộng dồn riêng ụ | Kích "khi ghép" | Online |
|---|---|---|---|---|---|---|---|
| Ghép thường (cùng loại / Mimic / đá+đá / Joker ép) | `ghep` | ụ ra thật | đá+đá → đá ngẫu nhiên | chặn | 0 (trừ F5) | `sk.ghep` mỗi loại 1 lần; wrapper Archive/Rồng/Star Breaker/Mirror | gói 'gh' + cờ `fl` |
| Ghép thật cùng loại (La Bàn, Anvil, Prism) | `ghepDB.lam` (laGhep) | F1/F2 | chặn | chặn | gộp vào đích | chỉ wrapper (không `sk.ghep`) | 'gh' db + `datO` |
| +★ tại chỗ (MK, Genesis, REINFORCE, Pandora, Star Lift, Leech trả) | `nangSao` / ghi thẳng `sao` | giữ | MK được, tự động không | MK được, tự động lệch (F10) | giữ | không | ảnh chụp sửa sao |
| −★ (Nightmare, cháy, Leech, Hex) | `haSao` / ghi thẳng | giữ | không bị nhắm | bị | giữ (Evolver/Genesis/Blood có luật riêng) | không | — |
| Biến hình (Copycat, Mad Crown, Hộp, Scrambler, trứng nở) | `chuyenU` / `giuKhiBien` | giữ | không biến | không biến (Copycat chép được) | mất (thân mới), Ép Xung/Anvil F9 | không | 'tr'/'gh' + cờ |
| Đổi chỗ Teleporter | `dichchuyen.ghepDB` | giữ | được | được | giữ | không | db |
| Rời bàn | 13 chỗ (F4) | — | — | — | — | Twin Signal hết | `datO` null |
| Gọi ra (triệu hồi, Twin Maker, Cloner, REINFORCE, Genesis, Ánh Sáng) | `trieu` / `sinhDoi` / `sinhU` | thật | — | — | = khởi đầu | không | 'tr'/'tw' + cờ |
| Hỗ trợ kề / hàng-cột / Choir | `hotro.js` | nhận | không | không (10B) — Choir đếm | — | — | tính lại 2 máy |
| Chỉ huy TWIN / CROSSFIRE / NEXUS | `chihuy-moi.js` | nhận | lúc dùng: không; giữa chừng F13 | như đá | — | ghép = hết | gói 'mv' + ô |

## 4. Ma trận 93 ụ (đọc lúc chạy từ `SKILLS` + `rosterMap` + `ONS.oTT`)
Cột: **Ghép ĐB** = loại `ghepDB` · **Khi ghép** = có `sk.ghep` · **Móc sinh** = có `sk.sinh` (ngẫu nhiên khi xuất hiện hoặc đặt cộng dồn đầu) · **Cộng dồn riêng** = trường riêng của thân ụ · **Giữ max** = `GIU_CONG_DON` · **Online cờ** = cộng dồn có trong `oTT` · **Chạm** = kỹ năng chạm. Ụ không ghi chú: đi đúng đường chung ở mục 3, không phát hiện riêng. Copycat chép được cả 93 ụ ở cùng sao (Copycat + Copycat = ghép thường).

| Ụ | Bậc | Vai | Ghép ĐB | Khi ghép | Móc sinh | Cộng dồn riêng | Giữ max | Online cờ | Chạm | Phát hiện |
|---|---|---|---|---|---|---|---|---|---|---|
| canon | Vàng | tc | ghép thật cùng loại | — | ✓ | hb,cmC | — | ✓ | — | F1, F18 |
| xucxac | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| lien | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| phun | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| sungluc | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| bang | Trắng | db | — | — | — | — | — | ✓ | — | — |
| doc | Trắng | db | — | — | — | — | — | ✓ | — | — |
| mana | Trắng | db | — | — | — | — | — | ✓ | — | — |
| tia | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| set | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| maychem | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| phagiap | Trắng | ht | — | — | — | — | — | ✓ | — | — |
| bua | Trắng | ht | — | — | — | — | — | ✓ | — | — |
| nam | Trắng | tc | — | — | — | — | — | ✓ | — | — |
| bomhen | Trắng | db | — | — | — | — | — | ✓ | — | — |
| nhanmana | Xanh | db | — | ✓ | — | — | — | ✓ | — | — |
| kiembang | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| mimic | Xanh | db | — | — | — | — | — | ✓ | — | F6, F22 |
| chimang | Xanh | ht | — | — | — | — | — | ✓ | — | — |
| dichchuyen | Xanh | db | kỹ năng kéo (qua khoá) | — | — | — | — | ✓ | — | — |
| radar | Xanh | ht | — | — | — | — | — | ✓ | — | — |
| drone | Xanh | tc | — | ✓ | — | — | — | ✓ | — | — |
| tron | Xanh | ht | — | — | — | — | — | ✓ | — | — |
| nangluong | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| laser | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| lanhgia | Xanh | ht | — | — | — | — | — | ✓ | — | — |
| mortar | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| khuech | Xanh | ht | — | — | — | — | — | ✓ | — | — |
| vungdoc | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| loa | Xanh | db | — | ✓ | — | — | — | ✓ | — | — |
| hutmana | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| min | Xanh | tc | — | — | — | — | — | ✓ | — | — |
| cuongno | Tím | tc | — | — | — | — | — | ✓ | — | — |
| baotuyet | Tím | tc | — | — | — | — | — | ✓ | — | — |
| nhanban | Tím | db | — | ✓ | — | — | — | ✓ | — | — |
| lienket | Tím | tc | — | — | — | — | — | ✓ | — | — |
| kepha | Tím | db | — | ✓ | — | — | — | ✓ | — | — |
| taylo | Tím | ht | — | — | — | — | — | ✓ | — | — |
| khien | Tím | ht | — | — | — | — | — | ✓ | — | — |
| hopbi | Tím | db | — | — | — | — | tuoi | ✓ | — | F5, F9 |
| nangsao | Tím | ht | — | — | — | — | — | ✓ | — | F10 |
| tuthan | Tím | ht | — | — | — | — | — | ✓ | — | — |
| xaotron | Tím | db | — | ✓ | — | — | — | ✓ | — | F9, F15 |
| epxung | Tím | db | kỹ năng kéo | — | — | — | — | ✓ | — | F5 |
| no5 | Tím | tc | — | — | — | — | — | ✓ | — | — |
| bao | Tím | tc | — | — | — | — | — | ✓ | — | — |
| anhsang | Tím | tc | — | — | — | — | — | ✓ | — | — |
| aten | Vàng | tc | — | — | — | — | — | ✓ | — | — |
| dongbo | Vàng | ht | — | — | — | — | — | ✓ | — | — |
| railgun | Vàng | tc | — | — | — | — | — | ✓ | — | — |
| vughep | Vàng | db | +★ tại chỗ (qua khoá) | — | ✓ | vang | — | ✓ | — | F7 |
| sinhdoi | Vàng | db | — | ✓ | — | — | — | ✓ | — | F16 |
| hasao | Vàng | ht | — | — | — | — | — | ✓ | — | — |
| saochep | Vàng | db | kỹ năng kéo (qua khoá) | — | — | — | — | ✓ | — | F8, F9 |
| ngoisao | Vàng | tc | — | — | — | — | — | ✓ | — | — |
| soi | Vàng | tc | — | — | ✓ | thuc,loat | — | ✓ (w) | — | — |
| tienhoa | Vàng | db | — | — | — | — | egg | ✓ | ✓ | F5, F9 |
| cauvong | Vàng | ht | — | — | — | — | — | ✓ | — | — |
| wallgen | Vàng | tc | — | ✓ | — | — | — | ✓ | — | — |
| orbital | Vàng | db | — | ✓ | — | — | — | ✓ | — | — |
| blackhole | Đỏ | tc | — | — | — | — | — | ✓ | ✓ | — |
| overlord | Đỏ | tc | — | — | — | — | — | ✓ | — | — |
| lophanung | Đỏ | ht | — | — | — | — | — | ✓ | ✓ | — |
| nayda | Tím | tc | — | — | — | — | — | ✓ | — | — |
| combo | Tím | tc | — | ✓ | — | — | — | ✓ | — | — |
| khoathoigian | Tím | db | — | ✓ | — | — | — | ✓ | — | — |
| hydra | Vàng | tc | — | — | ✓ | (hình) | — | — (hình/tạm) | ✓ | — |
| cuuvi | Vàng | tc | — | ✓ | ✓ | duoi,trumAcc | — | ✗ | — | F14 |
| pandora | Vàng | db | — | ✓ | — | — | — | ✓ | — | F10 |
| luoicheo | Vàng | ht | — | — | — | — | — | ✓ | — | — |
| ngaithoigian | Đỏ | db | — | — | — | — | — | ✓ | ✓ | — |
| nemesis | Vàng | tc | — | — | ✓ | nmDem,nmN,nmE,nmToc,nmDmg | — | ✗ | — | F14 |
| docton | Tím | tc | — | — | — | — | — | ✓ | — | — |
| thaukinh | Tím | ht | — | — | — | — | — | ✓ | — | — |
| nhieusong | Tím | db | — | ✓ | — | — | — | ✓ | — | — |
| santhuong | Tím | db | — | — | — | — | — | ✓ | — | — |
| nhatthuc | Vàng | tc | — | — | ✓ | dem,doiT,ca | — | — (hình/tạm) | — | — |
| loren | Vàng | db | ghép thật cùng loại | — | ✓ | dang,lo | — | ✓ | — | F6, F18 |
| guongcong | Vàng | ht | — | — | — | — | — | ✓ | — | — |
| marionette | Vàng | db | — | — | — | — | — | ✓ | — | — |
| chuato | Đỏ | tc | — | — | ✓ | bay,de,thaN,nhanh | — | ✗ | ✓ | F14 |
| leviathan | Đỏ | tc | — | — | ✓ | vuc,nuot | vuc | ✗ | ✓ | F5, F14 |
| khoisinh | Đỏ | db | — | — | ✓ | luot,sinhT | — | ✗ | ✓ | F10, F14 |
| ronglua | Đỏ | tc | — | — | ✓ | nhiet | nhiet | ✓ (H) | ✓ | F5, F11 |
| lualien | Vàng | tc | — | ✓ | ✓ | lc | — | ✓ | — | F4, F11, F22–F24 |
| hopca | Vàng | tc | — | — | — | — | — | ✓ | — | — |
| luutru | Vàng | tc | — | — | ✓ | kho | — | ✓ (k) | — | — |
| xuonganh | Vàng | db | — | ✓ | — | — | — | ✓ | — | — |
| mauhut | Vàng | db | kỹ năng kéo | ✓ | — | — | — | ✓ | ✓ | F12 |
| nguyenrua | Vàng | db | — | ✓ | — | — | — | ✓ | — | F15 |
| thanhdia | Vàng | ht | — | — | ✓ | moiDen | — | — (hình/tạm) | — | — |
| bienmau | Vàng | tc | ghép thật cùng loại | ✓ | ✓ | pm,pms | — | ✓ | — | F2, F18 |
| cobac | Đỏ | tc | — | — | ✓ | cbS | — | ✓ (z) | — | — |
## 5. Câu hỏi mở (nguyên tắc chưa quyết — chọn A/B)
1. **Q1** Ghép thường ra ụ TRÙNG loại (Leviathan, Hộp, Evolver, Rồng, Ép Xung): A = ụ mới về 0 như nguyên tắc 2/8 · B = giữ số lớn hơn như đã chốt 07/11 (và sửa chữ thẻ Leviathan).
2. **Q2** Buff Twin Anvil trên nguyên liệu khi ghép thường: A = mất (ụ mới) · B = ụ ra nhận buff mạnh hơn (như hiện tại).
3. **Q3** MK vàng + MK thường: A = đích giữ dạng của nó (+2★, không thành vàng) · B = đích thành vàng (như hiện tại).
4. **Q4** Biến hình (Mad Crown, Hộp, Scrambler, trứng nở, Copycat) với Ép Xung + buff Anvil trên thân: A = giữ hết như Copycat · B = mất hết, Copycat cũng mất.
5. **Q5** Ụ BĂNG nhận cộng dồn từ ghép hàng/cột (lửa Ember, nhiệt Rồng): A = không nhận (như buff hỗ trợ 10B) · B = nhận (như hiện tại, ụ băng vẫn là ụ thật).
6. **Q6** Dấu Mạch Máu trên mục tiêu bị đóng băng: A = dừng đếm như đá · B = vẫn đếm và nuốt.
7. **Q7** Ember Relay + Relay ghép (2 nguồn rời bàn): A = chỉ hiệu ứng ghép (không thêm relay rời bàn) · B = cả hai.
8. **Q8** Joker biến Ember thành Mimic rồi ép ghép: A = không relay (ụ đã biến hình trước khi rời) · B = relay theo thân gốc.
9. **Q9** Ụ Tím wildcard (chưa có trong code): A = ghép thật như Mimic (ụ ra ngẫu nhiên +1★, quay lại) · B = ghép theo ô đích (ra đúng loại ô đích +1★, giữ dạng/bản sao của đích như nguyên tắc 1).

## 6. Test kiểu ma trận đề xuất (chưa viết)
`tools/thap-kt-nguyen-tac.js` — mỗi nguyên tắc 1 nhóm, sinh ca tự động từ danh sách 93 ụ (như mục 4):
- **NT1:** mọi `ghepDB.cungLoai` × {đích bản sao, nguồn bản sao} × {Ép Xung, Anvil, Aurora, dạng} → trường của ụ ra = của đích (bắt F1, F2, F7).
- **NT2/NT8:** ghép thường với `B.deck = [id]` cho 93 ụ → mọi trường cộng dồn riêng = ụ vừa sinh; đối chứng Mimic (bắt F5, F6 hoặc khoá lựa chọn Q1/Q2).
- **NT6:** 13 đường rời bàn × Ember cùng hàng/cột → relay đúng 1 lần; biến hình / đá / băng / −★ / đổi chỗ → 0 lần; bàn con rối → 0 lần tự kích (bắt F4).
- **NT7:** mọi nguồn trạng thái (Freezer, Janus, Octopus, Static Jammer, Clamp, Hex, Mirror phản) × ụ đã đá / đã băng → trạng thái không đổi, sao vẫn giảm (bắt F3); mọi nguồn +★ tự động × ụ băng (F10).
- **Buff vĩnh viễn × biến hình:** {Ép Xung, Anvil, Aurora, khiên, chỉ huy} × {Copycat, Mad Crown, Hộp, Scrambler, trứng} (F8, F9).
- **Online:** khứ hồi `oTT → datO` cho MỌI trường cộng dồn riêng của 93 ụ (danh sách lấy lúc chạy như mục 4) (F14); PVP Scrambler/Jammer 2 máy cùng hạt → cùng ô, cùng loại (F15).
- **NT9:** chạy luật với `Math.random` bị thay bằng hàm ném lỗi (trừ trong FX) → in danh sách nơi gọi (F16).
