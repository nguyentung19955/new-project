# Vùng 4 Sông sâu — Phiên 2C: truyện, bản đồ, làng, nhạc

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 3 và mục 5 hàng "2C", `QUYET-DINH.md`, `docs/cot-truyen/CHUNG.md`
(Hắc Long = Thuồng Luồng hoá rồng; mảnh mặt trời giữ tới vùng 8), báo cáo phiên 1 (`vung-4-1`) và báo cáo Bé Sen (`be-sen`).
Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node, `build.py`. Phiên 2A (quái) và 2B (nền) chạy song song: không sửa tệp của họ.

## Tóm tắt
- **Mở vùng 4** (`MO_VUNG[3]`, 2 khung, nền ảnh `song` = b2b có sẵn): chiếu **một lần** khi người chơi mở trang **Sông sâu** trên bản đồ Chú Lái Đò lần đầu
  (khoá mới `G.save.truyen.mv`). Truyện không tự sang khung (chạm để sang; `?truyentu=1` mới tự sang) — giữ nguyên như hiện tại.
- **Bé Sen bị bắt**: từ lúc chiếu mở vùng tới khi hạ Thuồng Luồng, bé **vắng ở bến** (`VS.senVang` gán ở `js/truyen.js`).
  Hạ Thuồng Luồng → về làng chiếu **kết vùng 4** (`VUNG_MOI[3]`, 5 khung) → bé ngồi lại ở bến và nói **4 câu mới** (cảm ơn, hang dưới thác, Núi Sét).
- **Câu cuối KET_MOI** (sau Hồ Tinh) đổi thành câu dẫn sang Sông sâu khi `G.VUNG4`:
  *"Đêm xuống, mặt sông lại gợn sóng, như có gì dưới đáy chưa ngủ. Cu Tí ơi, mở bản đồ của chú, ngược dòng lên Sông sâu xem sao!"*
  (`?vung4=0`: câu cũ mời Độ khó 2. Nút Độ khó 2 vẫn mở như cũ sau Hồ Tinh.)
- **Lời trùm**: Thuồng Luồng ra mắt / gục; **đổi pha** (bong bóng ngắn, không dừng trận): pha 2 *"Lạnh buốt như hang Ngư Tinh!"*, pha 3 *"Mảnh trống ơi, cháy lên!"*;
  Cá Trê (`mini3`). Bảng mới `TRUM_PHA` dùng chung cho trùm sau này.
- **7 câu người làng mốc 4** (nói một lần sau khi hạ Thuồng Luồng), đúng bảng mục 3.2.
- **Nhạc** `B.vung3` (Sông sâu: điệu Oán giọng Sol, 76 nhịp, đàn tranh rải như dòng chảy, đàn bầu trầm / sáo, trống mái chèo thưa, nước vỗ, ếch nhái) và
  `B.trum3` (trống dồn giọng Sol). `chonBai` của phiên 1 tự dùng bài riêng (hết mượn bài Hang biển).
- **Bản đồ**: ảnh F1 chưa có → **giữ tranh code** `js/vung4.js`. Đã chừa chỗ: có tệp `gd-ban-do-song` (kiểu "giao-dien", 480×270 như `gd-ban-do-vung`)
  thì tự dán ảnh thay tranh code (vẫn viền, vẫn màu đêm) — khi đó sửa toạ độ 5 ải ở `VS.MAP2` theo ảnh.
- **Cảnh b7** chưa có ảnh → nền **vẽ code** (sông đêm, Thuồng Luồng ngoạm mảnh mặt trời bơi về phía núi có sét, mảnh chim Lạc trôi gần bờ).
  Ảnh `docs/anh-goc/truyen/b7-thuong-luong-bo-tron.png` thả vào rồi chạy `tools/anh-truyen/dung.py` là game tự dùng (khoá `ANH.b7` đã có).
- Mạch truyện khớp `CHUNG.md`: Thuồng Luồng **mang mảnh mặt trời đi** (giữ tới vùng 8), nhả mảnh thứ 4 (vành chim Lạc); Cụ Đồ: *"nó chưa chết, chỉ trốn"*; móc Núi Sét (vùng 5).

## Lời đã thêm (tiếng Việt → tiếng Anh có trong từ điển)
| Chỗ | Câu |
|---|---|
| Mở vùng 1 (nền song, tiêu đề "Sông sâu") | Ba yêu tinh ngủ rồi, nhưng nước sông vẫn đục ngầu. Bé Sen, con gái Chú Lái Đò, ra bến giặt áo rồi không thấy về. |
| Mở vùng 2 (Chú Lái Đò) | Cu Tí ơi, cái bóng dài dưới sông bắt Sen đi rồi! Chú chèo đò đưa cháu ngược lên Sông sâu. Bám chắc mạn đò nhé! |
| Kết vùng 1 (nền b7) | Thuồng Luồng nhả ra một mảnh trống, ngoạm mảnh to nhất sáng như mặt trời, rồi lặn mất về phía núi xa. |
| Kết vùng 2 (Bé Sen) | Cu Tí ơi! Con rắn to ơi là to giấu tớ trong hang dưới thác. Đêm nào nó cũng lẩm bẩm "trống... trống..."! |
| Kết vùng 3 (Chú Lái Đò) | Sen ơi, con về rồi! Cảm ơn Cu Tí. Mảnh trống thứ tư đây, có đàn chim Lạc đang bay. |
| Kết vùng 4 (Cụ Đồ) | Nó mang đi mảnh mặt trời, mảnh lớn nhất. Trên Núi Sét, sấm nổ suốt từ đêm qua... Chắc chắn có chuyện rồi. |
| Kết vùng 5 | Bé Sen đã về làng, ngồi ở bến đò với bố. (Q5 = A: không mở chức năng mới) |
| Bé Sen sau khi về (4 câu) | Cảm ơn Cu Tí đã cứu tớ!… · Trong hang dưới thác tối om, tớ đếm giọt nước cho đỡ sợ. · Từ giờ tớ giặt áo ở chỗ nước nông thôi… · Nghe nói trên Núi Sét sấm nổ suốt đêm… mang áo mưa nha! |

Lời trùm, 7 câu người làng: đúng nguyên văn mục 3.2 kế hoạch. Khung "Bé Sen" nói: tên "Bé Sen"; nền làng vẽ bé đứng to bên trái bằng ảnh `nl-sen` hàng `idle`
(chưa tải xong thì chỉ có khung chữ).

## Tệp đã sửa
| Tệp | Thay đổi |
|---|---|
| `game/js/truyen.js` | `MO_VUNG[3]`; sau cờ `G.VUNG4`: `VUNG_MOI[3]`, `KET_MOI[1]` mới, câu `LANG` thứ 4; `TRUM.thuong`, `TRUM.mini3`, `TRUM_PHA` (đổi pha); `ANH.b7` + nền code `b7`; người nói `sen`; `kiemTraMoVung` (gọi sau update làng, chỉ khi `V.tab === 'map'` và trang 2); `TR.senVang` → `VS.senVang`; Xem lại (Anh Mõ) chèn mở vùng 4 giữa kết Hồ Tinh và kết vùng 4; `truyen.mv` chuẩn hoá 0/1. |
| `game/js/village_scene.js` | Chỉ phần Bé Sen: `SEN_LOI_VE` (4 câu sau khi về), `senLoi()` chọn bộ câu; ghi chú chỗ nối. |
| `game/js/nhac.js` | Chỉ bài mới `B.vung3`, `B.trum3` (+ dòng mô tả đầu tệp). |
| `game/js/vung4.js` | `VS.mapArt2` dùng ảnh `gd-ban-do-song` khi có, không có thì tranh code như cũ. |
| `game/js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/truyen-am-thanh.json`, `lang.json` | 26 câu tiếng Anh. `ngon_ngu_en.js` **thêm tay** cuối tệp (như phiên Bé Sen: tệp này đang lệch `tu-dien`, chạy `gop.py` sẽ đổi ~390 dòng của phiên khác). |
| `game/tests/vung4_truyen.test.js` (mới) | Bài Node 20 điều kiện (dưới). |
| `game/dist/*`, `tools/xuong-sprite/*` | Dựng lại. |

Không đụng: `village.js` (bản đồ hai trang của phiên 1 giữ nguyên), quái / nền / trùm, đăng nhập Google, lưu mây, `?cloud=0`. Bản lưu chỉ thêm trường tuỳ chọn `truyen.mv`
(bản lưu cũ không có → chưa xem; `engine.js` đã giữ nguyên đối tượng `truyen`, lưu mây mang theo như các trường `mo / v / n`). Không đổi số cân bằng nào.

## Cách kiểm (đã chạy)
- `node --check game/js/*.js`: sạch.
- `node game/tests/vung4_truyen.test.js` — **PASS 20 điều kiện** (bản thường + `?vung4=0`):
  1. MO_VUNG 2 khung, VUNG[3] 5 khung (nền b7), câu KET dẫn sang Sông sâu, 7 người làng có câu thứ 4, **27 câu mới đều có tiếng Anh**;
  2. trang ba vùng đầu không chiếu; mở trang Sông sâu → chiếu 2 khung, `mv = 1`; Bé Sen vắng; mở lại bản đồ không chiếu lần hai;
  3. hạ Thuồng Luồng về làng → kết vùng 4 (5 khung), `v = 4`; Bé Sen về, câu mới; Chú Lái Đò nói câu mốc 4 đúng một lần; Xem lại đủ thứ tự;
  4. vẽ mọi khung (VI + EN, nền b7 vẽ code) không lỗi, không chữ thiếu tiếng Anh; Thuồng Luồng ra mắt → pha 2 → pha 3 → gục đúng lời; Cá Trê nói;
     nhạc vùng 4 = `vung3`, trùm = `trum3`; bài Sông sâu thưa nốt nhất (nốt/giây: Rừng 6 · Biển 4,3 · Lâu đài 6 · **Sông 3,3** · trùm 12,3);
  5. `?vung4=0`: lời 3 vùng y như cũ (câu KET mời Độ khó 2), không chiếu mở vùng dù bản lưu có `mv`, Bé Sen luôn ở bến; không lỗi ngầm.
- `vung4.test.js` (38), `cloud_save_regression` (7), `su_kien` (83), `so_yeu_quai` (41), `thanh_tuu` (35), `viec_ngay` (36), `bo_do_mua` (22): đạt.
- `tools/ngon-ngu/kiem.py`: `lang village_scene.js`, `truyen-am-thanh truyen.js`, `truyen-am-thanh nhac.js` — còn 0 mục.
- `python3 game/build.py --hai-tep` (sau khi gộp 2B): **người chơi tải 16,24 / 20 MB**, trang chính nén 1,08 / 1,50 MB, một tệp 28,24 / 30 MB.
  Phiên này không thêm ảnh (chỉ mã, ~12 KB chưa nén).

## Còn để sau / chủ game
- **Ảnh**: F1 bản đồ (cắt thành `gd-ban-do-song`, rồi sửa toạ độ `VS.MAP2`), F2 cảnh `b7-thuong-luong-bo-tron`. F3–F5 Bé Sen: đã có từ phiên `be-sen` (ảnh `nl-sen`).
- **Tên 5 ải trên bản đồ (Q12 = A)**: chưa vẽ — chỗ vẽ thẻ ải nằm ở `village.js` (phiên 1) và cần xem ảnh soát tĩnh để khỏi đè thẻ; làm cùng lúc thay ảnh F1.
- Lời đổi pha đang chờ bộ chiêu thật (3B / 3C); hiện Thuồng Luồng mượn chiêu Ngư Tinh nhưng vẫn qua pha 2, 3 nên câu đã hiện.
- Người chơi đã thử vùng 4 ở bản phiên 1 (đã có sao `3-x`, chưa có `mv`) sẽ thấy mở vùng một lần khi mở trang Sông sâu; đã hạ Thuồng Luồng thì không chiếu lại cảnh bé bị bắt.
