# Báo cáo tư vấn 2 — Luật công bằng cho trùm + gộp "Sức mạnh" / "Lực chiến" (16/10)

Nguồn: `QUYET-DINH-TU-VAN-16-10.md` (mục 3, 4), `TU-VAN-CHATGPT-TOAN-BO-16-10.md` (mục 2, 5). Nhánh `khoi-tao-du-an`.
**Không chơi thử bằng tay.** Chỉ dùng: luật game chạy trong Node (bot cân bằng, công cụ đo trong thư mục này), ảnh chụp headless, `node --check`, `build.py`, `tests/smoke.py`.

## 1. Tóm tắt

- **Luật công bằng** (cờ tắt `?trumcongbang=0`, mặc định BẬT) áp cho mọi trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh, Thuồng Luồng), trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa, Cá Trê Râu Roi) và 8 tinh anh:
  1. **Đòn nặng** (hệ số sát thương ≥ 1,2 lần sát thương gốc của con đó) **báo trước ≥ 0,7 s**; đòn nhẹ giữ như cũ. Đòn nặng nào cũ báo dài hơn 0,9 s (vùng to: Quật đuôi 1,15 s, Vòng thân 2 s, Siết sân 1 s...) giữ nguyên — báo dài hơn chỉ dễ hơn.
  2. **Nghỉ sau đòn nặng hụt**: đòn nặng nổ mà không trúng Cu Tí (đứng ngoài hoặc đang lộn bất tử) → con đó **0,7 s không ra đòn mới**. Đợt thêm của cùng chiêu (quật lại, phun lại, bổ lại, vồ lại...) chỉ hiện sau khi đợt trước nổ **+ 0,65 s**.
  3. **Không hai đòn nhắm thẳng Cu Tí liền nhau**: đòn nhắm lại chỗ Cu Tí chỉ bắt đầu báo sau khi đòn trước nổ + 0,35 s (nhẹ) / 0,65 s (nặng); không ra chiêu mới khi vùng báo của chính nó còn chưa nổ (bẫy chờ lâu > 1,6 s như nấm con, vòm thân không tính) và chưa qua 0,35 s sau lần nổ cuối. Đòn tự động (Vỗ sóng bờ, Siết sân quét lại, Bùn phụt chống đứng mép, mảnh Tường tinh thể) chờ trùm ra chiêu xong.
  4. **Luôn có lối né**: sàn bị vùng sắp nổ phủ cùng lúc tối đa (đo lưới 32 × 12) giảm: Cua Đá pha 2 **79% → 58%**, Thuồng Luồng pha 3 **73% → 46%** (bảng mục 4).
  5. **Nổi giận / hóa cuồng đổi nhịp, không chỉ nhanh hơn**: tốc ra chiêu tối đa **+8% / +15%** (cũ +30% / +55%), nghỉ giữa chiêu ×0,92 / ×0,87 (cũ ×0,7 / ×0,5); giữ các biến thể có sẵn (quật ngược ra sau lưng, đợt thêm, vòng gai mới, tường lệch khe...) và **nối chiêu dồn 2–3 chiêu rồi nghỉ dài hơn** (× (1 + 0,5 × số chiêu đã nối)). Tinh anh nổi giận: **bung chiêu riêng ngay** (≤ 0,8 s) thay vì chỉ nhanh ×1,3 / hồi chiêu ×0,6.
  6. **Báo bằng tư thế + âm thanh có sẵn**, không chỉ màu đỏ: phần lấy đà của cử động được kéo dài cho đủ 0,7 s (khung lấy đà giữ lâu hơn), đợt thêm chạy lại cử động chiêu và bật chớp thân trước đòn (`b.wind`, khung báo trước có sẵn của ảnh AI), Heo Nanh lấy đà bằng hàng `tele` mỗi cú húc; mỗi đòn nặng mới hiện có tiếng `warn` (âm có sẵn) nếu ngay trước đó chưa có. Không thêm hình vẽ bằng code.
- **Đo bằng bot**: trùm dễ hẳn đi (thắng tăng mạnh) → **bù máu trùm** (`G.CONG_BANG.mau`): Mộc Tinh ×1,45, Ngư Tinh ×1,4, Hồ Tinh ×1,3, Thuồng Luồng ×1,3, Cua Đá ×1,15, Cá Trê ×1,2 (Nấm Chúa, Hổ Lửa: giữ). Kết quả và **phần chưa bù được** ở mục 6 — cần chủ game xem.
- **Gộp Sức mạnh / Lực chiến** (cờ tắt `?gopsucmanh=0`): người chơi chỉ thấy **một số "Sức mạnh"** (thang cũ đã cân bằng bot, so thẳng với "Sức mạnh khuyên dùng"); dải thông báo sau nâng cấp: "Sức mạnh 144 ▲ +8" + dòng **"Kiếm: đòn +2 sát thương · Máu +18"**. Bảng xếp hạng vốn đã dùng số Sức mạnh → không đổi dữ liệu.

## 2. Cách làm (mã)

| Chỗ | Đổi gì |
|---|---|
| `game/js/data.js` | cờ `G.TRUM_CONG_BANG` (`?trumcongbang=0`), bảng `G.CONG_BANG` (ngưỡng nặng 1,2; báo 0,7; nghỉ 0,7 / 0,65 / 0,35; chờ ≤ 1,6 s; nhịp nổi giận; bù máu). Khi cờ bật ghi đè nhịp trong `G.NOI_GIAN` (toc, nghi, diChuyen, met, noiNghi, tinhAnh.toc / hoi, san.baoTo 0,6 → 0,7). |
| `game/js/boss.js` | `G.congBang`: `theo` (mỗi khung: tiếng báo đòn nặng, ghi lúc nổ, phát hiện đòn nặng hụt), `cho` (cổng không ra đòn mới), `dot` (xếp lịch đợt nhắm lại), bảng chiêu nặng `CB.NANG`. `thinkBig` / `thinkMini`: sàn báo 0,7 s cho chiêu nặng; `lapDot` (đợt thêm): sàn 0,7 s, nghỉ sau đợt trước, giữ trùm bận, chớp thân; nối chiêu xong nghỉ dài; Sóng thần: tường sau cách tường trước ≥ 0,65 s; bù máu ở `makeBoss`. |
| `game/js/chieu_trum.js` | Vồ nhảy (báo 0,7, nghỉ 0,65 giữa hai cú); Cột nước đuổi (cột sau chỉ báo khi cột trước đã phun + 0,35 s, số cột ÷ 2); Bổ rìu (đợt thêm xếp sau mảnh văng); Tường tinh thể (mảnh chờ Cua ra chiêu xong; tường vỡ đúng lúc loạt đầu nổ); Cá Trê (Quất râu, Lặn bùn báo 0,7; đợt bánh xe không chồng; Bùn phụt chờ); Nấm Phồng Chúa (cú nhảy sau báo sau khi cú trước đáp + 0,35); Rái Cá (lưới hụt → đuốc chờ 0,35 s rồi nhắm lại). |
| `game/js/mobs.js` | tinh anh: theo dõi vùng mỗi khung, cổng chờ cho chiêu riêng / đòn thường, chiêu riêng báo ≥ 0,7 s, Heo Nanh húc báo 0,7 s + tư thế lấy đà, cú sau cách 0,65 s; nổi giận bung chiêu riêng. |
| `game/js/thuong_luong.js` | Đớp lần hai, Phun nước đen, Đớp liên hoàn, Mưa mảnh đồng: báo ≥ 0,7, cú nhắm lại sau cú trước nổ + 0,65 s; Lặn – trồi đớp báo 0,7; Vỗ sóng bờ / Siết sân quét lại chờ trùm xong chiêu. |
| `game/js/luc_chien.js` | gộp một số Sức mạnh + dòng "đổi gì" (mục 7). |
| `game/js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/luc-chien.json` | 9 chuỗi mới có bản tiếng Anh. |
| `game/tests/thuong_luong.test.js`, `thuong_luong_3c.test.js` | chờ lâu hơn cho cú phun / đớp / vệt sau (nay hiện muộn hơn); đếm đợt mảnh đồng theo cụm lúc rơi. |

Cờ tắt `?trumcongbang=0`: đã đo — bảng soát chiêu của bản cờ tắt **trùng từng số** với bản trước phiên này (chạy trên bản sao commit cũ).

## 3. Công cụ đo (thư mục này)

- `do_cong_bang.py [moi|cu] [giây]` — soát luật trên luật thật (Node): mỗi con đứng trong phòng trùm trống, Cu Tí đi vòng nhỏ quanh 4 chỗ (không nhận sát thương), đặt máu vào từng pha, ghi 240 giây mỗi pha (tinh anh 720 giây). Đo từng chiêu: báo trước ngắn nhất (đòn nặng / mọi đòn), nghỉ sau đòn nặng hụt (giả định mọi đòn nặng hụt), khoảng giữa hai đòn nhắm thẳng (lúc đòn trước nổ → lúc vùng đòn sau hiện), phủ sàn tối đa, số chiêu / phút. `--chi=Tên:pha` in thô từng vùng.
- `so_sanh.py truoc.json sau.json` — bảng trước / sau (mục 4).
- `do_trum_cb.py` — bot vào thẳng phòng trùm (chép từ `noi-gian-manh/do_trum.py`, thêm vùng 4).
- `bang_bot.py` — bảng mục 6. `anh_suc_manh.py` — ảnh soát mục 7.

Quy ước "nhắm thẳng": vùng phủ chỗ Cu Tí đứng lúc vùng hiện. Chiêu hình cố định không đuổi theo Cu Tí (đường chéo Hồ ly phân thân, Tường tinh thể, Siết sân, Quật đuôi, Sóng thần, Rừng gai, Vòng thân, Quất râu xoay, Dậm lá sen, Dòng nước, Xoáy nước, Xoáy hút) không xét luật "hai đòn nhắm thẳng" (Cu Tí đứng giữa sân thì hình học có phủ, nhưng chiêu không nhắm).

## 4. Bảng chiêu trước / sau

| Con | Pha | Chiêu / phút: trước → sau | So pha 1 (sau) | Phủ sàn tối đa: trước → sau |
|---|---|---|---|---|
| Mộc Tinh | 1 | 16,3 → 16,3 | ×1,00 | 30% → 30% |
| Mộc Tinh | 2 | 23,0 → 17,3 | ×1,06 | 30% → 30% |
| Mộc Tinh | 3 | 22,0 → 14,5 | ×0,89 | 30% → 30% |
| Ngư Tinh | 1 | 16,0 → 16,0 | ×1,00 | 18% → 18% |
| Ngư Tinh | 2 | 21,5 → 15,0 | ×0,94 | 20% → 19% |
| Ngư Tinh | 3 | 20,3 → 12,0 | ×0,75 | 48% → 49% |
| Hồ Tinh | 1 | 15,8 → 15,8 | ×1,00 | 28% → 27% |
| Hồ Tinh | 2 | 18,5 → 14,8 | ×0,94 | 41% → 41% |
| Hồ Tinh | 3 | 19,0 → 13,5 | ×0,85 | 41% → 41% |
| Thuồng Luồng | 1 | 16,0 → 13,5 | ×1,00 | 46% → 33% |
| Thuồng Luồng | 2 | 16,8 → 11,5 | ×0,85 | 46% → 33% |
| Thuồng Luồng | 3 | 18,3 → 10,8 | ×0,80 | 73% → 46% |
| Nấm Chúa | 1 | 16,5 → 16,3 | ×1,00 | 15% → 14% |
| Nấm Chúa | 2 | 21,8 → 17,0 | ×1,04 | 23% → 24% |
| Cua Đá | 1 | 18,0 → 17,3 | ×1,00 | 64% → 58% |
| Cua Đá | 2 | 23,0 → 16,3 | ×0,94 | 79% → 58% |
| Hổ Lửa | 1 | 20,5 → 20,5 | ×1,00 | 21% → 21% |
| Hổ Lửa | 2 | 23,8 → 17,8 | ×0,87 | 22% → 21% |
| Cá Trê Râu Roi | 1 | 16,0 → 15,5 | ×1,00 | 23% → 21% |
| Cá Trê Râu Roi | 2 | 14,0 → 11,5 | ×0,74 | 25% → 21% |
| Heo Nanh | 1 | 5,1 → 4,3 | ×1,00 | 6% → 6% |
| Heo Nanh | 2 | 7,3 → 4,3 | ×1,00 | 6% → 6% |
| Nấm Phồng Chúa | 1 | 5,1 → 4,8 | ×1,00 | 11% → 11% |
| Nấm Phồng Chúa | 2 | 7,3 → 4,8 | ×1,00 | 11% → 11% |
| Cua Tướng | 1 | 5,4 → 5,4 | ×1,00 | 9% → 9% |
| Cua Tướng | 2 | 8,6 → 5,8 | ×1,07 | 9% → 9% |
| Cá Nóc Chúa | 1 | 5,2 → 5,3 | ×1,00 | 0% → 0% |
| Cá Nóc Chúa | 2 | 7,8 → 5,5 | ×1,04 | 0% → 0% |
| Tướng Ma | 1 | 5,2 → 5,2 | ×1,00 | 14% → 14% |
| Tướng Ma | 2 | 8,3 → 5,6 | ×1,08 | 14% → 14% |
| Hũ Chúa | 1 | 5,1 → 5,1 | ×1,00 | 14% → 14% |
| Hũ Chúa | 2 | 8,0 → 5,5 | ×1,08 | 14% → 14% |
| Rái Cá Thủ Lĩnh | 1 | 4,8 → 4,8 | ×1,00 | 12% → 12% |
| Rái Cá Thủ Lĩnh | 2 | 7,3 → 4,8 | ×1,00 | 15% → 14% |
| Cóc Tía Chúa | 1 | 5,1 → 5,1 | ×1,00 | 16% → 16% |
| Cóc Tía Chúa | 2 | 7,3 → 5,1 | ×1,00 | 16% → 17% |

| Con | Pha | Chiêu | Đòn (nặng / nhắm) | Báo trước đòn nặng (s) | Báo trước ngắn nhất (s) | Nghỉ sau đòn nặng hụt (s) | Hai đòn nhắm thẳng cách (s) |
|---|---|---|---|---|---|---|---|
| Mộc Tinh | 1 | Quật cành | 24 (24/24) → 24 (24/24) | 0,84 → 0,84 | 0,84 → 0,84 | 2,46 → 2,46 | 2,41 → 2,41 |
| Mộc Tinh | 1 | Mưa quả độc | 20 (0/20) → 20 (0/20) | — → — | 0,92 → 0,92 | — → — | 2,41 → 2,41 |
| Mộc Tinh | 1 | Rễ đâm | 21 (0/21) → 21 (0/21) | — → — | 0,55 → 0,55 | — → — | 2,46 → 2,46 |
| Mộc Tinh | 2 | Quật cành | 58 (29/25) → 41 (21/22) | 0,65 → 0,78 | 0,60 → 0,70 | 0,00 → 0,66 | 0,29 → 0,38 |
| Mộc Tinh | 2 | Rễ đâm | 46 (0/25) → 36 (0/18) | — → — | 0,60 → 0,70 | — → — | -0,39 → 3,00 |
| Mộc Tinh | 2 | Mưa quả độc | 18 (0/18) → 11 (0/11) | — → — | 0,71 → 0,85 | — → — | 0,89 → 0,94 |
| Mộc Tinh | 3 | Quật cành | 58 (20/32) → 36 (12/20) | 0,60 → 0,73 | 0,60 → 0,70 | -0,00 → 0,65 | 0,25 → 0,37 |
| Mộc Tinh | 3 | Rừng gai | 20 (20/12) → 13 (13/9) | 0,60 → 0,79 | 0,60 → 0,79 | 2,17 → 2,70 | — → — |
| Mộc Tinh | 3 | Mưa quả độc | 18 (0/18) → 13 (0/13) | — → — | 0,60 → 0,80 | — → — | 0,16 → 0,37 |
| Mộc Tinh | 3 | Rễ đâm | 36 (0/23) → 22 (0/16) | — → — | 0,60 → 0,70 | — → — | -0,37 → 0,34 |
| Ngư Tinh | 1 | Bổ rìu san hô | 21 (21/21) → 21 (21/21) | 0,76 → 0,76 | 0,76 → 0,76 | 2,44 → 2,44 | 2,62 → 2,62 |
| Ngư Tinh | 1 | Phun băng | 23 (23/23) → 23 (23/23) | 0,88 → 0,88 | 0,88 → 0,88 | 2,62 → 2,62 | 2,02 → 2,02 |
| Ngư Tinh | 1 | Sóng thần | 20 (20/0) → 20 (20/0) | 0,86 → 0,86 | 0,86 → 0,86 | — → — | — → — |
| Ngư Tinh | 2 | Phun băng | 42 (21/38) → 35 (18/26) | 0,68 → 0,81 | 0,60 → 0,70 | 0,01 → 0,65 | 0,01 → 0,50 |
| Ngư Tinh | 2 | Sóng thần | 44 (44/0) → 30 (30/0) | 0,66 → 0,79 | 0,66 → 0,79 | 0,52 → 0,65 | — → — |
| Ngư Tinh | 2 | Cột nước đuổi | 184 (0/184) → 52 (0/52) | — → — | 0,60 → 0,60 | — → — | -0,42 → 0,35 |
| Ngư Tinh | 2 | Bổ rìu san hô | 40 (20/40) → 28 (14/28) | 0,58 → 0,70 | 0,58 → 0,70 | 0,43 → 1,05 | 0,11 → 0,66 |
| Ngư Tinh | 3 | Bổ rìu san hô | 30 (10/30) → 18 (6/18) | 0,49 → 0,70 | 0,49 → 0,70 | 0,38 → 1,00 | 0,10 → 0,65 |
| Ngư Tinh | 3 | Xoáy hút | 25 (25/0) → 13 (13/0) | 1,61 → 2,17 | 1,61 → 2,17 | 2,05 → 2,59 | — → — |
| Ngư Tinh | 3 | Cột nước đuổi | 190 (0/190) → 62 (0/62) | — → — | 0,60 → 0,60 | — → — | -0,45 → 0,35 |
| Ngư Tinh | 3 | Sóng thần | 39 (27/0) → 18 (12/0) | 0,58 → 0,74 | 0,58 → 0,74 | 0,48 → 0,65 | — → — |
| Ngư Tinh | 3 | Phun băng | 39 (13/30) → 30 (10/20) | 0,60 → 0,77 | 0,60 → 0,70 | -0,00 → 0,65 | -0,00 → 0,50 |
| Hồ Tinh | 1 | Quạt đuôi | 18 (18/18) → 18 (18/18) | 0,92 → 0,92 | 0,92 → 0,92 | 3,34 → 3,34 | 2,85 → 2,85 |
| Hồ Tinh | 1 | Vồ nhảy | 23 (23/23) → 23 (23/23) | 0,65 → 0,70 | 0,65 → 0,70 | 2,85 → 2,85 | 3,34 → 3,34 |
| Hồ Tinh | 2 | Quạt đuôi | 40 (20/32) → 31 (16/22) | 0,71 → 0,86 | 0,60 → 0,70 | 2,02 → 0,65 | -0,13 → 0,65 |
| Hồ Tinh | 2 | Vồ nhảy | 52 (36/52) → 46 (31/46) | 0,62 → 0,70 | 0,62 → 0,70 | 0,41 → 0,65 | 0,41 → 0,65 |
| Hồ Tinh | 2 | Hồ ly phân thân | 80 (0/24) → 65 (0/26) | — → — | 0,60 → 0,70 | — → — | — → — |
| Hồ Tinh | 3 | Vồ nhảy | 31 (16/31) → 20 (10/20) | 0,62 → 0,70 | 0,62 → 0,70 | 0,35 → 0,65 | 0,35 → 0,65 |
| Hồ Tinh | 3 | Hồ ly phân thân | 84 (0/30) → 66 (0/21) | — → — | 0,60 → 0,70 | — → — | — → — |
| Hồ Tinh | 3 | Quạt đuôi | 54 (18/38) → 38 (13/20) | 0,60 → 0,80 | 0,60 → 0,70 | 0,56 → 0,66 | -0,14 → 0,41 |
| Thuồng Luồng | 1 | Phun nước đen | 78 (78/78) → 71 (71/71) | 0,55 → 0,70 | 0,55 → 0,70 | 0,02 → 0,65 | -1,03 → 0,65 |
| Thuồng Luồng | 1 | Vòng thân | 19 (19/0) → 17 (17/0) | 2,00 → 2,00 | 2,00 → 2,00 | 1,23 → 1,23 | — → — |
| Thuồng Luồng | 1 | Quật đuôi | 20 (20/10) → 15 (15/9) | 1,15 → 1,15 | 1,15 → 1,15 | 0,28 → 0,92 | — → — |
| Thuồng Luồng | 1 | Vỗ sóng bờ | 30 (30/30) → 6 (6/6) | 1,10 → 1,10 | 1,10 → 1,10 | 0,00 → 0,70 | -0,79 → 1,20 |
| Thuồng Luồng | 1 | Đớp | 7 (7/7) → 6 (6/6) | 0,50 → 0,70 | 0,50 → 0,70 | 0,05 → 0,65 | 0,05 → 0,65 |
| Thuồng Luồng | 2 | Vòng thân | 7 (7/0) → 7 (7/0) | 2,00 → 2,00 | 2,00 → 2,00 | 0,10 → 1,17 | — → — |
| Thuồng Luồng | 2 | Phun nước đen | 58 (58/58) → 49 (49/49) | 0,55 → 0,70 | 0,55 → 0,70 | 0,17 → 0,65 | -0,75 → 0,65 |
| Thuồng Luồng | 2 | Lặn – trồi đớp | 12 (12/8) → 14 (14/7) | 0,66 → 0,70 | 0,66 → 0,70 | 0,87 → 1,53 | -0,30 → 1,53 |
| Thuồng Luồng | 2 | Vỗ sóng bờ | 30 (30/30) → 11 (11/11) | 1,10 → 1,10 | 1,10 → 1,10 | 0,00 → 0,70 | -0,65 → 1,20 |
| Thuồng Luồng | 2 | Quật đuôi | 14 (14/3) → 5 (5/5) | 1,15 → 1,15 | 1,15 → 1,15 | 0,10 → 1,25 | — → — |
| Thuồng Luồng | 2 | Dòng nước đổi chiều | 11 (11/4) → 5 (5/4) | 1,50 → 1,50 | 1,50 → 1,50 | 0,43 → 1,33 | — → — |
| Thuồng Luồng | 2 | Xoáy nước | 10 (10/0) → 7 (7/0) | 0,80 → 0,80 | 0,80 → 0,80 | 0,15 → 1,27 | — → — |
| Thuồng Luồng | 2 | Đớp | 1 (1/1) → 0 (0/0) | 0,60 → — | 0,60 → — | 2,15 → — | 3,73 → — |
| Thuồng Luồng | 3 | Xoáy nước | 10 (10/0) → 5 (5/0) | 0,80 → 0,80 | 0,80 → 0,80 | 0,48 → 1,20 | — → — |
| Thuồng Luồng | 3 | Lặn – trồi đớp | 10 (10/6) → 8 (8/5) | 0,66 → 0,70 | 0,66 → 0,70 | 0,12 → 1,53 | -0,60 → 1,53 |
| Thuồng Luồng | 3 | Siết sân | 34 (34/12) → 21 (21/4) | 1,00 → 1,00 | 1,00 → 1,00 | 0,00 → 0,70 | — → — |
| Thuồng Luồng | 3 | Vỗ sóng bờ | 49 (49/49) → 15 (15/15) | 1,10 → 1,10 | 1,10 → 1,10 | 0,00 → 0,70 | -1,03 → 0,70 |
| Thuồng Luồng | 3 | Phun nước đen | 61 (61/61) → 30 (30/30) | 0,55 → 0,70 | 0,55 → 0,70 | 0,07 → 0,65 | -0,95 → 0,65 |
| Thuồng Luồng | 3 | Mưa mảnh đồng | 24 (24/24) → 12 (12/12) | 0,60 → 0,70 | 0,60 → 0,70 | 0,00 → 0,67 | -0,95 → 0,67 |
| Thuồng Luồng | 3 | Đớp liên hoàn | 33 (33/32) → 25 (25/22) | 0,58 → 0,70 | 0,58 → 0,70 | 0,12 → 0,65 | -0,75 → 0,65 |
| Thuồng Luồng | 3 | Quật đuôi | 7 (7/2) → 7 (7/2) | 1,15 → 1,15 | 1,15 → 1,15 | 0,07 → 0,73 | — → — |
| Thuồng Luồng | 3 | Đớp | 5 (5/5) → 2 (2/2) | 0,50 → 0,70 | 0,50 → 0,70 | 0,05 → 0,65 | -0,80 → 0,65 |
| Nấm Chúa | 1 | Nấm mẹ đẻ con | 28 (0/0) → 26 (0/0) | — → — | 2,50 → 2,50 | — → — | — → — |
| Nấm Chúa | 1 | Phun bào tử | 20 (0/20) → 20 (0/20) | — → — | 0,75 → 0,75 | — → — | 2,89 → 2,89 |
| Nấm Chúa | 1 | Hàng nấm độc | 18 (0/17) → 19 (0/19) | — → — | 0,85 → 0,85 | — → — | 2,52 → 2,52 |
| Nấm Chúa | 2 | Nấm mẹ đẻ con | 38 (0/0) → 27 (0/0) | — → — | 2,50 → 2,50 | — → — | — → — |
| Nấm Chúa | 2 | Phun bào tử | 17 (0/15) → 16 (0/13) | — → — | 0,58 → 0,67 | — → — | 1,38 → 1,23 |
| Nấm Chúa | 2 | Hàng nấm độc | 64 (0/63) → 48 (0/45) | — → — | 0,60 → 0,70 | — → — | -0,32 → 0,35 |
| Cua Đá | 1 | Kẹp càng | 33 (26/33) → 31 (28/31) | 0,75 → 0,75 | 0,75 → 0,75 | 2,10 → 2,10 | 2,57 → 2,57 |
| Cua Đá | 1 | Tường tinh thể | 27 (0/9) → 24 (0/10) | — → — | 0,60 → 0,60 | — → — | — → — |
| Cua Đá | 1 | Đập càng rung sàn | 30 (30/30) → 30 (30/30) | 0,80 → 0,80 | 0,80 → 0,80 | 3,12 → 3,12 | 2,10 → 2,10 |
| Cua Đá | 2 | Kẹp càng | 41 (31/41) → 30 (20/30) | 0,58 → 0,70 | 0,58 → 0,70 | 0,77 → 0,70 | 0,75 → 1,00 |
| Cua Đá | 2 | Tường tinh thể | 32 (0/13) → 36 (0/15) | — → — | 0,60 → 0,60 | — → — | — → — |
| Cua Đá | 2 | Đập càng rung sàn | 85 (43/85) → 52 (26/52) | 0,61 → 0,71 | 0,60 → 0,70 | 0,32 → 1,15 | -0,10 → 0,65 |
| Hổ Lửa | 1 | Vồ lửa | 43 (43/43) → 43 (43/43) | 0,75 → 0,75 | 0,75 → 0,75 | 2,60 → 2,60 | 1,58 → 1,58 |
| Hổ Lửa | 1 | Gầm phun lửa | 17 (17/17) → 17 (17/17) | 0,85 → 0,85 | 0,85 → 0,85 | 1,90 → 1,90 | 1,58 → 1,58 |
| Hổ Lửa | 1 | Cào | 22 (22/19) → 22 (22/19) | 0,75 → 0,75 | 0,75 → 0,75 | 1,58 → 1,58 | 1,58 → 1,58 |
| Hổ Lửa | 2 | Gầm phun lửa | 50 (25/43) → 25 (13/17) | 0,65 → 0,76 | 0,60 → 0,70 | 0,11 → 0,66 | 0,11 → 0,66 |
| Hổ Lửa | 2 | Cào | 19 (19/16) → 20 (20/18) | 0,58 → 0,70 | 0,58 → 0,70 | 0,72 → 0,95 | 0,60 → 0,75 |
| Hổ Lửa | 2 | Vồ lửa | 102 (51/99) → 76 (38/75) | 0,58 → 0,70 | 0,50 → 0,70 | 0,31 → 0,65 | 0,31 → 0,65 |
| Cá Trê Râu Roi | 1 | Lặn bùn | 20 (20/14) → 20 (20/12) | 0,60 → 0,70 | 0,60 → 0,70 | 0,35 → 3,22 | -0,36 → 2,26 |
| Cá Trê Râu Roi | 1 | Quất râu | 22 (22/6) → 24 (24/6) | 0,70 → 0,70 | 0,70 → 0,70 | 0,58 → 1,47 | 1,55 → 0,37 |
| Cá Trê Râu Roi | 1 | Phun bùn | 21 (0/21) → 18 (0/18) | — → — | 0,80 → 0,80 | — → — | 0,06 → 0,37 |
| Cá Trê Râu Roi | 1 | Bùn phụt | 12 (0/12) → 7 (0/7) | — → — | 0,80 → 0,80 | — → — | -0,02 → 0,38 |
| Cá Trê Râu Roi | 2 | Phun bùn | 22 (0/22) → 14 (0/14) | — → — | 0,61 → 0,71 | — → — | -0,86 → 0,37 |
| Cá Trê Râu Roi | 2 | Lặn bùn | 42 (22/32) → 33 (17/23) | 0,60 → 0,70 | 0,60 → 0,70 | 0,87 → 2,20 | -0,36 → 2,20 |
| Cá Trê Râu Roi | 2 | Bùn phụt | 12 (0/12) → 5 (0/5) | — → — | 0,80 → 0,80 | — → — | -0,05 → 0,38 |
| Cá Trê Râu Roi | 2 | Quất râu xoay | 34 (0/15) → 44 (0/13) | — → — | 0,60 → 0,70 | — → — | — → — |
| Heo Nanh | 1 | Heo Nanh | 421 (183/345) → 348 (153/231) | 0,45 → 0,70 | 0,45 → 0,45 | 0,08 → 0,63 | 0,08 → 0,38 |
| Heo Nanh | 2 | Heo Nanh | 493 (260/382) → 351 (153/221) | 0,45 → 0,70 | 0,45 → 0,54 | 0,08 → 0,63 | 0,08 → 0,67 |
| Nấm Phồng Chúa | 1 | Nấm Phồng Chúa | 370 (0/269) → 342 (0/318) | — → — | 0,53 → 0,53 | — → — | -0,20 → 0,35 |
| Nấm Phồng Chúa | 2 | Nấm Phồng Chúa | 459 (0/319) → 344 (0/325) | — → — | 0,54 → 0,60 | — → — | -0,20 → 0,35 |
| Cua Tướng | 1 | Cua Tướng | 301 (65/301) → 301 (65/301) | 0,69 → 0,80 | 0,45 → 0,45 | 1,60 → 1,50 | 0,43 → 0,43 |
| Cua Tướng | 2 | Cua Tướng | 369 (103/369) → 327 (70/327) | 0,69 → 0,80 | 0,45 → 0,45 | 1,09 → 1,27 | 0,43 → 0,43 |
| Tướng Ma | 1 | Tướng Ma | 293 (0/284) → 293 (0/284) | — → — | 0,45 → 0,45 | — → — | 0,47 → 0,47 |
| Tướng Ma | 2 | Tướng Ma | 359 (0/332) → 318 (0/298) | — → — | 0,45 → 0,45 | — → — | 0,47 → 0,50 |
| Hũ Chúa | 1 | Hũ Chúa | 253 (0/253) → 253 (0/253) | — → — | 0,53 → 0,53 | — → — | 1,02 → 0,92 |
| Hũ Chúa | 2 | Hũ Chúa | 318 (0/317) → 275 (0/275) | — → — | 0,45 → 0,47 | — → — | 0,42 → 0,65 |
| Rái Cá Thủ Lĩnh | 1 | Rái Cá Thủ Lĩnh | 6 (0/6) → 6 (0/6) | — → — | 0,45 → 0,45 | — → — | 1,58 → 1,58 |
| Rái Cá Thủ Lĩnh | 1 | Quăng lưới chài | 271 (0/271) → 263 (0/263) | — → — | 0,45 → 0,45 | — → — | 0,47 → 0,47 |
| Rái Cá Thủ Lĩnh | 1 | Quét đuốc | 58 (58/47) → 56 (56/42) | 0,70 → 0,70 | 0,70 → 0,70 | 1,37 → 1,37 | -0,02 → 0,35 |
| Rái Cá Thủ Lĩnh | 2 | Rái Cá Thủ Lĩnh | 4 (0/4) → 1 (0/1) | — → — | 0,46 → 0,54 | — → — | 1,62 → 5,80 |
| Rái Cá Thủ Lĩnh | 2 | Quăng lưới chài | 294 (0/294) → 266 (0/266) | — → — | 0,46 → 0,54 | — → — | 0,47 → 0,48 |
| Rái Cá Thủ Lĩnh | 2 | Quét đuốc | 87 (87/73) → 57 (57/53) | 0,70 → 0,70 | 0,70 → 0,70 | 1,40 → 1,55 | -0,00 → 0,36 |
| Cóc Tía Chúa | 1 | Cóc Tía Chúa | 4 (0/4) → 4 (0/4) | — → — | 0,53 → 0,53 | — → — | 1,96 → 1,96 |
| Cóc Tía Chúa | 1 | Mưa bọt | 124 (0/97) → 123 (0/95) | — → — | 0,53 → 0,53 | — → — | 0,94 → 1,32 |
| Cóc Tía Chúa | 1 | Lưỡi kéo | 111 (0/111) → 111 (0/111) | — → — | 0,53 → 0,53 | — → — | 0,57 → 0,57 |
| Cóc Tía Chúa | 1 | Dậm lá sen | 30 (30/20) → 30 (30/20) | 0,90 → 0,90 | 0,90 → 0,90 | 1,62 → 1,63 | — → — |
| Cóc Tía Chúa | 2 | Cóc Tía Chúa | 2 (0/2) → 1 (0/1) | — → — | 0,54 → 0,62 | — → — | 7,11 → 6,72 |
| Cóc Tía Chúa | 2 | Lưỡi kéo | 131 (0/129) → 122 (0/122) | — → — | 0,54 → 0,62 | — → — | 0,58 → 0,71 |
| Cóc Tía Chúa | 2 | Dậm lá sen | 45 (45/26) → 31 (31/18) | 0,90 → 0,90 | 0,90 → 0,90 | 1,57 → 1,82 | — → — |
| Cóc Tía Chúa | 2 | Mưa bọt | 132 (0/92) → 114 (0/86) | — → — | 0,54 → 0,62 | — → — | 0,30 → 0,68 |

Bảng trên: đo bằng `do_cong_bang.py` (240 giây mỗi pha, tinh anh 720 giây; trước = `?trumcongbang=0`). ✗ = chưa đạt (bản sau: không còn ô ✗). Tóm theo luật:

| Luật | Chưa đạt TRƯỚC (số chiêu-pha) | Chưa đạt SAU |
|---|---|---|
| Đòn nặng báo trước ≥ 0,7 s | 34 / 63 | 0 / 62 |
| Nghỉ ≥ 0,6 s sau đòn nặng hụt | 37 / 62 | 0 / 61 |
| Hai đòn nhắm thẳng cách ≥ 0,3 s (từ lúc đòn trước nổ) | 40 / 79 | 0 / 78 |
| Phủ sàn cùng lúc ≤ 60% (con-pha) | 3 / 36 | 0 / 36 |
| Nổi giận: số chiêu / phút ≤ pha 1 × 1,15 (con-pha) | 17 / 20 | 0 / 20 |

## 5. Nổi giận đổi nhịp

| Hệ số (so với pha 1) | Trùm vùng pha 2: cũ → mới | Trùm vùng pha 3: cũ → mới | Trùm nhỏ pha 2: cũ → mới | Tinh anh nổi giận: cũ → mới |
|---|---|---|---|---|
| Tốc ra chiêu (cử động + báo trước) | ×1,3 → **×1,08** | ×1,55 → **×1,15** | ×1,3 → **×1,12** | ×1,3 → **×1,12** |
| Nghỉ giữa chiêu | ×0,7 → ×0,92 | ×0,5 → ×0,87 | ×0,65 → ×0,9 | hồi chiêu riêng ×0,6 → ×0,95 |
| Nghỉ giữa hai chiêu nối | 0,3 s → 0,45 s | 0,3 s → 0,45 s | 0,3 s → 0,45 s | — |
| Nghỉ sau chuỗi nối (ĐỔI NHỊP) | ×1 → ×(1 + 0,5 × số chiêu đã nối) | như pha 2 | như pha 2 | — |
| Đi nhanh hơn | ×1,2 → ×1,08 | ×1,4 → ×1,15 | ×1 | — |
| Mệt sau chiêu lớn | ×0,8 → ×0,9 | ×0,6 → ×0,85 | ×1 | — |
| Biến thể (giữ, có sẵn từ phiên nổi giận) | đợt thêm mỗi chiêu, quật ngược ra sau lưng, tường lệch khe, nối 2 chiêu (35%) | thêm đợt / vòng gai / vòng sóng, nối 2–3 chiêu (60% / 20%) | đợt thêm, nối chiêu (40%) | **bung chiêu riêng ngay** khi nổi giận (≤ 0,8 s) |

Nhịp đo được (số chiêu / phút, bảng đầu mục 4): mọi con pha 2, 3 ≤ pha 1 × 1,08 (cũ: tới × 1,4 – 1,7). Trùm vùng pha 3 nay **ít chiêu hơn pha 1** (× 0,75 – 0,89) vì mỗi chiêu dài hơn (thêm đợt, mỗi đợt cách nhau đủ nghỉ) — nổi giận khác ở *cách đánh* (dồn 2–3 chiêu rồi nghỉ dài, đợt thêm, đòn ngược) chứ không ở tốc.

## 6. Bot: thắng và thời gian hạ từng trùm (trước → sau, đã bù máu)

Đo trên nhánh tới commit e7cf819a (trước khi gộp "Tư vấn 4: phúc lành" — phúc lành chỉ có giữa ải, bot vào thẳng phòng trùm nên không ảnh hưởng; đã chạy lại 20 lượt 6 ải sau khi gộp: số khớp). Đo: `do_trum_cb.py`, 120 lượt mỗi ải, bản lưu thật của bot lúc vừa đủ Sức mạnh khuyên dùng (`tests/cay_luu.json`). "Sạch": vào thẳng phòng trùm đủ máu. "Thật": vào với 65% máu, trùm có lớp thích nghi Kháng Lửa + Chống áp sát (như lượt thật của bot). Trước = `?trumcongbang=0`. **Vùng 4 (4-1 … 4-5) dùng bản lưu của ải 3-5** (chưa có bản lưu vùng 4) → chỉ để so trước / sau, không phải độ khó thật.

| Ải | Trùm | Sạch: thắng trước → sau | Sạch: thời gian hạ (s) trước → sau | Thật: thắng trước → sau | Thật: thời gian hạ (s) trước → sau | Thật: máu còn khi thắng |
|---|---|---|---|---|---|---|
| 1-1 | Nấm Chúa | 100% → 100% | 31 → 30 (-3%) | 100% → 100% | 34 → 33 (-3%) | 57% → 58% |
| 1-2 | Nấm Chúa | 100% → 100% | 39 → 38 (-3%) | 100% → 100% | 42 → 42 (+0%) | 55% → 55% |
| 1-3 | Nấm Chúa | 100% → 100% | 33 → 32 (-3%) | 99% → 99% | 82 → 82 (+0%) | 54% → 49% |
| 1-4 | Nấm Chúa | 100% → 100% | 35 → 33 (-6%) | 100% → 100% | 64 → 67 (+5%) | 55% → 55% |
| 1-5 | Mộc Tinh | 98% → 99% | 69 → 88 (+28%) | 63% → 62% | 116 → 154 (+33%) | 37% → 32% |
| 2-1 | Cua Đá | 100% → 100% | 49 → 50 (+2%) | 88% → 100% | 78 → 86 (+10%) | 48% → 51% |
| 2-2 | Cua Đá | 99% → 100% | 51 → 54 (+6%) | 67% → 99% | 95 → 105 (+11%) | 45% → 51% |
| 2-3 | Cua Đá | 100% → 100% | 46 → 51 (+11%) | 91% → 100% | 81 → 90 (+11%) | 47% → 61% |
| 2-4 | Cua Đá | 100% → 100% | 40 → 44 (+10%) | 92% → 100% | 60 → 67 (+12%) | 52% → 63% |
| 2-5 | Ngư Tinh | 78% → 86% | 53 → 68 (+28%) | 59% → 87% | 74 → 101 (+36%) | 36% → 43% |
| 3-1 | Hổ Lửa | 100% → 100% | 43 → 41 (-5%) | 92% → 100% | 81 → 88 (+9%) | 50% → 51% |
| 3-2 | Hổ Lửa | 100% → 100% | 37 → 36 (-3%) | 92% → 99% | 88 → 94 (+7%) | 47% → 50% |
| 3-3 | Hổ Lửa | 100% → 100% | 30 → 28 (-7%) | 82% → 100% | 82 → 89 (+9%) | 52% → 52% |
| 3-4 | Hổ Lửa | 100% → 100% | 36 → 34 (-6%) | 93% → 98% | 82 → 87 (+6%) | 49% → 50% |
| 3-5 | Hồ Tinh | 100% → 100% | 35 → 41 (+17%) | 50% → 58% | 56 → 66 (+18%) | 36% → 34% |
| 4-1 | Cá Trê Râu Roi | 100% → 100% | 26 → 30 (+15%) | 82% → 100% | 51 → 59 (+16%) | 47% → 58% |
| 4-2 | Cá Trê Râu Roi | 100% → 100% | 27 → 32 (+19%) | 67% → 100% | 54 → 64 (+19%) | 50% → 59% |
| 4-3 | Cá Trê Râu Roi | 100% → 100% | 30 → 35 (+17%) | 68% → 99% | 59 → 68 (+15%) | 51% → 59% |
| 4-4 | Cá Trê Râu Roi | 100% → 100% | 31 → 37 (+19%) | 58% → 99% | 62 → 73 (+18%) | 47% → 57% |
| 4-5 | Thuồng Luồng | 25% → 59% | 76 → 94 (+24%) | 2% → 24% | 103 → 121 (+17%) | 51% → 40% |
| | **Trung bình** | 95% → 97% | | 77% → 91% | | |

**Bù máu đã làm** (`G.CONG_BANG.mau`, chỉ khi cờ bật): đo giữa phiên, trước khi bù (×1) — thắng "thật" trung bình 77% → 95%; Mộc Tinh 63% → 92%, Ngư Tinh 59% → 98%, Hồ Tinh 50% → 80%, Cua Đá 67–92% → 100%, Cá Trê 58–82% → 98–100%, Thuồng Luồng 2% → 42%; thời gian hạ giảm 0–10%. Thử ×1,3 / ×1,6 / riêng từng con → chọn mức đưa thắng "thật" về gần cũ mà trận không dài quá ~+35%:

| Trùm | × máu | Ghi chú |
|---|---|---|
| Mộc Tinh | 1,45 | thắng thật 63% → 62% (về như cũ), trận dài hơn ~33% |
| Hồ Tinh | 1,3 | 50% → 58%, dài hơn ~18% |
| Ngư Tinh | 1,4 | 59% → 87%, dài hơn ~36% — **chưa bù hết** |
| Thuồng Luồng | 1,3 | (bản lưu 3-5) 2% → 24%, dài hơn ~17% |
| Cua Đá | 1,15 | 67–92% → 99–100%, dài hơn 10–12% — **chưa bù hết** |
| Cá Trê Râu Roi | 1,2 | 58–82% → 99–100%, dài hơn 15–19% — **chưa bù hết** |
| Nấm Chúa, Hổ Lửa | 1 | Nấm Chúa không đổi; Hổ Lửa thời gian hạ đã DÀI hơn 6–9% (không cần bù theo luật), thắng +5…+18 điểm |

**Vì sao máu không bù hết được** (đo máu mất theo chiêu, `LK_NGUON=1`): cái làm trùm mạnh trước đây phần lớn là các đòn chồng nhau mà luật mới cấm. Ngư Tinh: Sóng thần trúng 113 + 145 lần (pha 2 + 3, 80 lượt) → 49 + 61; Cột nước đuổi 72 lần → 0. Cá Trê: Phun bùn chồng lên Lặn bùn / Quất râu 40 lần → 1. Cua Đá: tắt riêng cổng "không ra chiêu khi vùng mình còn báo" thì thắng 2-2 về 58% (cũ 67%) — Đập càng chồng lên mảnh Tường tinh thể là nguồn chính. Thêm máu chỉ kéo dài trận (×1,6: Ngư Tinh vẫn thắng 83%, trận dài +57%; Cua Đá vẫn 100%), không lấy lại độ khó. Thử trả sát thương nổi giận (×0,75 / ×0,7 thay ×0,5 / ×0,45) cũng gần như không đổi (Ngư 94%, Cua 98%).
**Đề nghị chủ game chọn** (chưa làm, đụng thiết kế chiêu): (a) chấp nhận trùm dễ hơn (đúng tinh thần "công bằng"), hoặc (b) thêm biến thể "khó mà công bằng" cho Ngư Tinh / Cua Đá / Cá Trê (vd tường nước dày hơn, hai bức có khe lệch xa hơn; Cua đập rồi kẹp theo hướng mới), đo lại bằng bot. `G.STAGE_REC` **giữ nguyên**.

Tinh anh: không có bộ đo riêng (bot vào thẳng phòng trùm); luật áp cho tinh anh làm chúng dễ hơn (Heo Nanh húc báo 0,7 s thay 0,45 s, cú sau cách 0,65 s; nhịp nổi giận ×1,12 thay ×1,3). Chưa bù máu tinh anh.

## 7. Gộp "Sức mạnh" và "Lực chiến"

- Con số duy nhất người chơi thấy: **Sức mạnh** = `G.power()` (thang cũ, đã cân bằng bot, so thẳng với "Sức mạnh khuyên dùng" ở thẻ ải). Lực chiến không còn hiện ở bảng nhân vật, thanh trên cùng, thẻ Cu Tí (hàm `G.lucChien` giữ để đo).
- Dải thông báo ở làng / màn kết quả: "Sức mạnh 144 ▲ +8" (số chạy như cũ) + **dòng thứ hai nói rõ đổi gì** so với lúc dải bắt đầu (các nâng cấp liền nhau cộng dồn): sát thương gốc mỗi đòn của từng vũ khí đang mang ("Kiếm: đòn +2 sát thương"), Máu, Mana, Chí mạng, Giảm sát thương, Hồi chiêu nhanh, Tốc chạy, Kháng từng hệ; đổi vũ khí mang theo → "Đổi vũ khí mang theo"; tối đa 3 mục rồi "…". Dùng khung dải thông báo có sẵn (`gd-dai-thong-bao`).
- **Bảng xếp hạng**: vốn đã ghi và xếp theo `power` = Sức mạnh (`js/bang_vang.js`, `js/cloud.js`) → không đổi gì, dữ liệu cũ giữ nguyên.
- Tiếng Anh: "Power 114" + "Shuriken: hit +1 damage · Hammer: hit +2 damage · HP +24".
- Cờ tắt `?gopsucmanh=0`: hai con số và dải "Lực chiến" như trước.
- Ảnh soát (headless, điện thoại ngang): `anh-lang.png`, `anh-sau-mai.png` (mài kiếm +2: "Sức mạnh 144 ▲ +8 / Kiếm: đòn +2 sát thương"), `anh-sau-len-cap.png` ("Kiếm: đòn +1 sát thương · Máu +7"), `anh-hanh-trang.png` (một số Sức mạnh), `anh-sau-mai-cu.png` (cờ tắt).

## 8. Đã chạy

- `node --check` mọi tệp JS đã sửa: boss.js, chieu_trum.js, data.js, mobs.js, thuong_luong.js, luc_chien.js, ngon_ngu_en.js, 2 tệp test — đạt.
- `python3 game/build.py` và `python3 game/build.py --hai-tep` — đạt (dựng lại `game/dist`).
- `python3 game/tests/smoke.py` — 0 lỗi.
- `node game/tests/*.test.js`: thuong_luong (38 điều kiện), thuong_luong_3c (34), vung4 (38), song_luat (40), quai_song (69), thuong_b2, vung4_truyen, bo_do_mua, cam_giac_danh, cam_giac_vk, cloud_save_regression — đạt. **Đã hỏng sẵn trước phiên này** (chạy trên bản sao nhánh chưa có thay đổi của phiên này cũng hỏng y hệt — do phiên "mở dần" của tư vấn 1): viec_ngay, so_yeu_quai, su_kien, thanh_tuu, trum_song. Không sửa (ngoài phạm vi).
- `python3 tools/ngon-ngu/kiem.py luc-chien game/js/luc_chien.js` — 0 mục thiếu.
- Cờ tắt `?trumcongbang=0`: bảng soát chiêu trùng từng số với nhánh chưa có thay đổi (`do_cong_bang.py` chạy trên bản sao).
- Ảnh soát headless: `anh_suc_manh.py` (5 ảnh, 0 lỗi JS).
