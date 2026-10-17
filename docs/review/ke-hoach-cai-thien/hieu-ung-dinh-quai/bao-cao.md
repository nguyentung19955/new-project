# Hiệu ứng có dính vào quái không — báo cáo

Câu hỏi của chủ game: *"Các hiệu ứng phát ra có dính vào quái không, check toàn bộ nhé."*

## PHẦN A — ĐO (chỉ đọc + bot không màn hình, không sửa game)

### Đo thế nào

- Bot mở bản game `game/dist/linh-khi.html` (không chơi thử bằng tay), tải đủ ảnh 4 vùng rồi dựng **từng cảnh riêng**: một con quái trong phòng trống, nền trong suốt, không có Cu Tí / cửa / đồ vật.
- Mỗi cảnh chụp 2–3 lần vào canvas: **chỉ thân quái** (lấy hộp bao và từng điểm ảnh thật của thân), **chỉ hiệu ứng** (thân không vẽ), và **cả hai** (để xem hiệu ứng nằm trước hay sau thân). Rồi so toạ độ.
- **48 con**: 8 quái thường + 2 tinh anh + trùm nhỏ + trùm vùng của cả 4 vùng (Rừng già, Hang biển, Lâu đài cổ, Sông sâu). Trùm đo cả pha 1–3 cho đòn của trùm.
- Đòn của Cu Tí đánh thật (bot bấm nút): kiếm 3 nhát, thương đâm/quét, búa nện, phi tiêu bay, 4 chiêu Đặc biệt (Trảm Nguyệt, Phi Thương, Địa Chấn, Mưa phi tiêu), 3 cây chưởng, phúc lành (Gươm, Rìu, Than hồng, Gậy tre) và vũ khí có hệ Lửa / Độc / Băng. Mỗi đòn đánh từ **bên trái và bên phải** (quái lật hình), và đánh lại khi quái **đứng sát mép phòng**.
- Trạng thái đặt thẳng lên quái: cháy, độc, băng (làm chậm), đóng băng, choáng, trói chân (dây leo), chậm (Thuỷ triều), lộ điểm yếu (trùm). Mỗi trạng thái thử thêm: quái **bị hất tung** (Địa Chấn nhấc thân 10 điểm), quái **đi** 20 điểm, **hết trạng thái**, **quái chết**.
- Đòn của quái: cho quái đánh Cu Tí (Cu Tí bất tử), ghi chỗ đạn sinh ra, vệt cào / bụi lao, vật ném (bom, bào tử, bầu nước…).
- Đo ở **NET 2** (mặc định) đầy đủ, và **NET 3 / NET 4** (`?netcao=3|4`) bản gọn (một mặt, trạng thái + kiếm + phi tiêu).

Luật chấm một ca (một hiệu ứng × một con × một biến thể):

| Hiệu ứng | "Dính" khi |
|---|---|
| Hình trúng (chớp, tia, nổ) | tâm hình chạm điểm ảnh thân (≤ 3 điểm) và **không nằm ở 1/5 dưới cùng thân** (chân) |
| Số sát thương | đáy chữ cách đỉnh đầu từ −2 đến 12 điểm (không lơ lửng, không đè lên thân) |
| Cháy / độc / băng / đóng băng | ≥ 70 % hình nằm trên thân, cỡ hình từ 45 % đến 160 % thân, đi theo khi quái đi / bị hất, tắt khi hết |
| Sao choáng | ở ngay trên đầu (0–14 điểm), không nhỏ hơn 18 % bề ngang thân |
| Dây leo / vòng chậm | ở chân, không nhỏ hơn 35 % bề ngang thân |
| Biểu tượng trên đầu trùm | đáy biểu tượng cách đỉnh đầu 0–12 điểm |
| Đòn quái | đạn / vật ném sinh ra từ điểm ảnh thân (≤ 3 điểm); bụi lao toả sau lưng sát thân |

### Kết quả tổng (NET 2)

**6 326 ca đo → 4 069 dính, 2 257 lệch.** (112 ca "không có hình riêng" không tính.) Bảng đầy đủ hiệu ứng × quái: [bang-truoc.md](bang-truoc.md) (ở phần B đã đo lại với cách chấm tinh hơn — bỏ hình nằm trên sàn có chủ ý — nên bảng này nay ghi 4 224 dính / 2 103 lệch). NET 3: [bang-truoc-net3.md](bang-truoc-net3.md), NET 4: [bang-truoc-net4.md](bang-truoc-net4.md) (lần đo đầu: 867 ca / 426 dính và 870 ca / 424 dính) — **cùng các lỗi như NET 2**, NET cao không thêm lỗi mới.

| Nhóm | Ca | Dính | Lệch | Lỗi chính |
|---|---:|---:|---:|---|
| Hình trúng (4 vũ khí, 4 chiêu, chưởng, phúc lành/hệ, sát mép) | 2 421 | 1 841 | 580 | ở chân trùm; Hỏa chưởng nổ sát đất trước mặt quái; vòng Độc chưởng lệch |
| Số sát thương (kể cả sát mép) | 2 955 | 1 974 | 981 | lơ lửng trên quái bay; đè giữa thân trùm |
| Trạng thái trên thân | 634 | 31 | 603 | **không theo khi bị hất tung** (480); quá nhỏ trên trùm |
| Biểu tượng trên đầu trùm | 64 | 4 | 60 | đè lên đầu trùm |
| Hình một lần khi vừa dính | 100 | 74 | 26 | nhỏ so với quái to |
| Tắt khi quái chết | 48 | 48 | 0 | — |
| Đòn quái (đạn, vật ném, bụi lao) | 104 | 97 | 7 | Trai Sông Gai ném ngọc từ mép vỏ (3 điểm), 1 viên lửa Hồ Tinh |

### Những chỗ lệch thấy rõ

1. **Bị hất tung (Địa Chấn): hình trạng thái ở lại dưới đất.** Thân quái nhấc lên 10 điểm nhưng lửa, bọt độc, băng, sao choáng, dây leo vẫn ở chỗ cũ — cả 40 quái thường / tinh anh, cả hai mặt. Ảnh: `anh/truoc/7-bi-hat-tung.png`, GIF `anh/truoc/gif-1-chay-bi-hat.gif`.
2. **Hình trúng ở chân trùm.** Chớp trúng luôn đặt ở 16 điểm trên chân (dù quái cao 35 hay 135 điểm). Quái thường thì đúng giữa thân; trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh, Thuồng Luồng) và trùm nhỏ (Nấm Chúa, Cá Trê) thì chớp nằm ở rễ / xúc tu dưới cùng — mọi vũ khí, mọi chiêu. Ảnh: `1-hinh-trung-kiem.png`, `3-trum-phi-tieu-phi-thuong.png`, GIF `gif-4-kiem-trum.gif`.
3. **Số sát thương** đặt theo chiều cao hình vẽ cũ, không theo ảnh thật:
   - quái bay / ảnh thấp hơn hình cũ: số **lơ lửng** — Ong Vò Vẽ 28 điểm trên đầu, Cá Chuồn 18–22, Đèn Lồng 16, Bầy Đỉa 16–18, Ếch Phình, Cá Nóc 14–16;
   - trùm: số bị chặn ở 60 điểm nên **đè giữa thân** — Mộc Tinh 64 điểm dưới đỉnh đầu, Hồ Tinh 53, Ngư Tinh / Thuồng Luồng 46, Nấm Chúa 33. Ảnh `4-so-sat-thuong.png`.
4. **Hỏa chưởng / Độc chưởng**: quả nổ đặt ở chỗ viên chưởng chạm đất, trước mặt quái và sát chân (92/92 ca Hỏa chưởng). Vòng độc của Độc chưởng lệch lên trên / ra ngoài với quái bay. Ảnh `2-chuong-no.png`.
5. **Trạng thái trên trùm quá nhỏ**: lửa / bọt độc / băng chỉ to bằng thân quái thường (~25 điểm) trên thân trùm 90–110 điểm, nằm ở chân. Ảnh `5-trang-thai-tren-trum.png`, GIF `gif-3-chay-trum.gif`.
6. **Sao choáng**: trên quái bay thì lơ lửng (Ong Vò Vẽ 30 điểm trên đầu, Cá Chuồn, Đèn Lồng, Ếch Phình); trên tinh anh / trùm nhỏ sao nhỏ xíu. Ảnh `6-sao-choang.png`, GIF `gif-2-choang-ong.gif`.
7. **Biểu tượng trạng thái trên đầu trùm** đè lên đầu (Nấm Chúa 17 điểm, Mộc Tinh 10, Thuồng Luồng 8, Hồ Tinh 6) hoặc lơ lửng (Ngư Tinh 16).
8. Quái nhỏ: hình trạng thái **không** trùm lấp thân (đo cỡ đạt) — ảnh `8-quai-nho.png`.
9. Đúng sẵn: tắt khi quái chết (48/48), đi theo khi quái đi (mọi ca), hình đóng băng một lần (48/48), đạn quái sinh từ thân (59/60), quái đứng sát mép phòng không làm hình lệch thêm, mặt trái / phải như nhau.

Ảnh lưới (×3, khung xanh = thân, khung chấm = vùng đúng, dấu đỏ = tâm hình): `anh/truoc/1…8-*.png`; GIF: `anh/truoc/gif-*.gif`.

### Công cụ

`cong-cu/do_a.py` (đo, ghi `so-lieu/<nhãn>.json`), `cong-cu/dq_lib.js` (dựng cảnh, chụp lớp), `cong-cu/phan_tich.py` (chấm từng ca), `cong-cu/bang.py` (bảng), `cong-cu/anh_a.py` (ảnh lưới + GIF). Chạy từ gốc repo, ví dụ:
`python3 docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/do_a.py truoc` rồi `python3 .../cong-cu/bang.py truoc`.

## PHẦN B — SỬA

Hai phiên "Nét cao: quái, tinh anh, trùm, người làng" và "Nét cao: hiệu ứng + giao diện" đã có báo cáo trước khi sửa (không phải chờ). Đã kéo bản mới nhất, dựng lại bảng thân theo ảnh quái mới.

### Bảng tổng: trước / sau

"Trước" = game mở với `?dinhquai=0` (cờ tắt, đã kiểm: cho **đúng y hệt** số đo của bản cũ ở phần A — 6 326 ca, 4 069 dính). Lần đo lại này bỏ khỏi "hình trúng" các hình **nằm trên sàn có chủ ý** (vết cháy, vòng phép, vòng sàn quanh chân — lớp sàn), nên số trước là 4 224 dính chứ không phải 4 069.

| NET | Trước: ca / dính / lệch | Sau: ca / dính / lệch |
|---|---|---|
| **NET 2** (đầy đủ) | 6 327 / 4 224 / **2 103** | 6 272 / 6 138 / **134** |
| NET 3 (`?netcao=3`, bản gọn) | 866 / 436 / **430** | 840 / 812 / **28** |
| NET 4 (`?netcao=4`, bản gọn) | 870 / 433 / **437** | 840 / 808 / **32** |

(Số ca hai bên chênh vài chục vì bot đánh thật: số lần trúng mỗi đòn đổi chút ít.)

| Nhóm (NET 2) | Trước: ca / dính / lệch | Sau: ca / dính / lệch |
|---|---|---|
| Hình trúng (4 vũ khí, 4 chiêu, chưởng, phúc lành/hệ, sát mép) | 2 422 / 2 020 / 402 | 2 423 / 2 354 / 69 |
| Số sát thương (kể cả sát mép) | 2 955 / 1 952 / 1 003 | 2 955 / 2 939 / 16 |
| Trạng thái trên thân (cháy, độc, băng, đóng băng, choáng, trói, chậm) | 634 / 30 / 604 | 576 / 545 / 31 |
| Biểu tượng trên đầu trùm | 64 / 4 / 60 | 64 / 64 / 0 |
| Hình một lần khi vừa dính | 100 / 74 / 26 | 103 / 92 / 11 |
| Tắt khi quái chết | 48 / 48 / 0 | 48 / 48 / 0 |
| Đòn quái (đạn, vật ném, bụi lao) | 104 / 96 / 8 | 103 / 96 / 7 |

Bảng hiệu ứng × quái sau khi sửa: [bang-sau.md](bang-sau.md) (NET 3: [bang-sau-net3.md](bang-sau-net3.md), NET 4: [bang-sau-net4.md](bang-sau-net4.md)); bảng trước tương ứng: [bang-truoc.md](bang-truoc.md).

Ảnh TRƯỚC / SAU (trái / phải): **`anh/truoc-sau.png`** (chớp trúng trên trùm, Hỏa chưởng, số sát thương, cháy trên trùm, sao choáng, trạng thái khi bị hất tung). Ảnh lưới sau khi sửa: `anh/sau/1…8-*.png`, GIF `anh/sau/gif-*.gif` (so với `anh/truoc/`).

### Đã sửa gì (chỉ chỗ vẽ và cỡ hình)

Không đổi sát thương, vùng trúng, thời lượng, luật chơi; không vẽ hiệu ứng mới (chỉ dời / co giãn ảnh có sẵn).

1. **Bảng neo thân từng quái, từng pha trùm, hai mặt** — `game/js/dinh_quai_bang.js` (đo tự động từ điểm ảnh thật bằng `cong-cu/tao_bang.py`; thay ảnh quái thì chạy lại). Thêm **hộp thân của khung đang vẽ**: lúc vẽ thân quái, game ghi lại đỉnh / đáy thân của đúng khung đó (trùm cúi, vươn, quái phồng to khi trúng đòn) để hiệu ứng theo dáng thật. Hàm chung ở `game/js/dinh_quai.js`.
2. **Trạng thái đi theo khi bị hất tung**: lửa, bọt độc, băng, sao choáng, dây leo, vòng chậm nhấc lên cùng thân (trước đây ở lại dưới đất).
3. **Chớp trúng / tia va chạm**: đặt ở chỗ đòn chạm thân theo chiều cao thật — quái thường vẫn 16 điểm trên chân như cũ, trùm và quái cao thì lên 30–55 % chiều cao thân (hết cảnh chớp ở rễ / xúc tu). Áp cho mọi vũ khí, 4 chiêu Đặc biệt, Băng chưởng, sao va chạm của Phi Thương.
4. **Hỏa / Độc / Băng chưởng**: ảnh nổ nhấc lên đúng chỗ thân con vừa trúng; vùng nổ, vết cháy và vòng phép trên sàn giữ nguyên chỗ cũ.
5. **Số sát thương**: mọc ngay trên đỉnh đầu thật (quái bay hết lơ lửng); trùm cao chạm mép trên màn thì số đặt sát dưới thanh máu trùm (không bị thanh máu che, không đè giữa thân).
6. **Cỡ theo quái**: lửa / bọt độc / băng trên trùm và tinh anh to theo thân (tối đa ×2,8, trước chặn ×1,5); sao choáng to theo bề ngang thân (tối đa ×2,6); vòng độc lúc vừa dính theo bề ngang thân. Quái nhỏ giữ cỡ cũ (đo lại: không trùm lấp thân).
7. **Biểu tượng trạng thái trên đầu trùm**: ngay trên đỉnh đầu thật, giữa thân.
8. Hình nằm đúng tâm ngang của thân (thân lệch một bên như Ngư Tinh, Rái Cá), lật đúng khi quái quay mặt.

Tệp đã sửa: `game/js/dinh_quai.js` (mới), `game/js/dinh_quai_bang.js` (mới), `game/js/fx.js`, `game/js/fx_chuong.js`, `game/js/fx_he.js`, `game/js/fx_ky_nang.js`, `game/js/combat.js` (một dòng vẽ biểu tượng trùm), `game/js/bo_skill.js` (dây leo / vòng chậm), `game/js/sprite_custom.js` (ghi hộp thân khung vừa vẽ), `game/index.html`, `game/dist/*`.

**Cờ tắt `?dinhquai=0`**: mọi chỗ trên trở về y hệt trước (đo lại cho đúng từng con số của bản cũ).

### Còn lệch (134 ca / 6 272 ở NET 2)

- **Ngọn lửa hẹp** (13 ca "cỡ"): ảnh lửa trên thân là ngọn lửa cao, rộng chỉ ~40 % thân với quái bè ngang (Bọ Hung, Cua, tinh anh, trùm); chiều cao đã đúng. Muốn đầy hơn cần ảnh lửa rộng hơn (không vẽ thêm bằng code theo luật).
- **Hình trúng còn sát mép thân** (69 ca): phần lớn 3–8 điểm ở quái bay nhỏ (Cá Con, Đèn Lồng, Nhím Biển) và trùm có dáng lệch (Ngư Tinh, Nấm Chúa) khi chưởng / phi tiêu trúng ở rìa thân.
- **Số sát thương trên Mộc Tinh / Hồ Tinh** (16 ca): trùm cao gần chạm mép trên màn, số nhịp cháy / độc đặt sát dưới thanh máu trùm nên đè lên ngọn cây 14–24 điểm (cố ý để thanh máu không che số).
- **Trai Sông Gai** ném ngọc từ mép vỏ cách thân 3,4 điểm, **dây leo** của vài con dẹt (Ba Ba, Cua Đá) đo hơi cao hơn chân — nhỏ, để nguyên.

### Kiểm

- `node --check` các tệp đã sửa: không lỗi.
- `python3 game/build.py`: bản một tệp **29,92 MB** (≤ 30). `python3 game/build.py --hai-tep`: bản web tải đầu **17,74 MB** (≤ 20).
- Bot không màn hình (`cong-cu/kiem_js.py`, bot tự đánh, vẽ từng khung, mỗi vùng ải 3 + phòng trùm): **0 lỗi JS** ở mặc định, ở `?dinhquai=0` và ở `?netcao=4`; các lần đo khác cũng 0 lỗi JS. Không chơi thử bằng tay.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`.
