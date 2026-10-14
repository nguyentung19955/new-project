# Báo cáo — chiêu trùm vùng / trùm nhỏ / tinh anh: bỏ các kiểu lặp lại (14/10)

Làm theo `YEU-CAU.md` cùng thư mục. Không chạy game, không test: chỉ ảnh soát tĩnh (`ve_xem.py` → `xem-chieu-moi.png`), `node --check`, `build.py`.
Cờ tắt: **`?chieucu=1`** (hoặc `G.CHIEU_MOI = false`, khai ở `js/data.js`) → dùng lại đúng chiêu cũ (hàm cũ giữ nguyên, tên cũ).

## Đã làm

10 chỗ lặp kiểu đổi sang chiêu mới theo đúng bảng; 4 chủ kiểu GIỮ nguyên (Hồ Tinh c5 Bão hồ hoả, Mộc Tinh c5 Rừng gai, Mộc Tinh c3 Mưa quả độc, Heo Nanh Húc zíc zắc).
Mọi chiêu mới dùng lại cử động (anim) của chiêu cũ nên độ dài, mốc ra đòn giữ nguyên; hiệu ứng vẽ code của chiêu CŨ trong cử động đó được tắt (`o.fx = false`).
Mọi đòn là vùng của luật chơi nên có báo trước trên sàn bằng ảnh 8 khung (`js/bao_truoc.js`).

| Con | Cũ → mới | Cách đánh (số trong bảng `SO` của `js/chieu_trum.js`) | Sát thương / lần (× dmg) |
|---|---|---|---|
| Ngư Tinh c1 | Đớp → **Bổ rìu san hô** | Không lao nữa. Vết nứt thẳng (dài như cũ: khoảng cách + 24, kẹp 80–160, rộng 30) nổ ở mốc moc[0]; tới mốc moc[1] 6 mảnh san hô văng vuông góc hai bên từ 3 điểm (0,35 / 0,65 / 0,95 vết nứt), mỗi mảnh 52 × 16. Mọi vùng báo ngay từ đầu chiêu. | 1,4 → 1,4 (nứt), 1,4 (mảnh) |
| Ngư Tinh c4 | Mưa băng nhọn → **Cột nước đuổi** | 6 cột (r 16) lấy đúng chỗ em bé đứng, mỗi cột báo 0,6 s rồi phun, cột sau trễ 0,25 s; cột đầu phun đúng mốc ra đòn cũ. Đứng yên là trúng. | 1,0 → 1,0 |
| Ngư Tinh c5 | Xoáy nước → **Xoáy hút** | Xoáy (R 112) kéo em bé về tâm 2 s với 30 điểm ảnh/giây (bé chạy 72) — chạy ngược là thoát; nghỉ 0,3 s rồi nổ nhỏ tâm (r 40, báo suốt lúc xoáy). Mệt 1,5 s sau chiêu như cũ. | 1,3 + 1,2 → 1,3 |
| Hồ Tinh c2 | Vồ mồi → **Vồ nhảy** | Nhảy vòng cung (bay 0,4 s, cao 46), vùng tròn r 34 đặt ngay dưới em bé lúc ra chiêu, báo ≥ 0,65 s (sk.tele giữ); đáp xuống bung lửa. Pha 2 trở đi nhảy lần hai đúng mốc lần vồ hai cũ (T + 0,55, báo 0,62 s). | 1,25 → 1,25 |
| Hồ Tinh c4 | Vòng lửa ma → **Hồ ly phân thân** | 4 bóng cáo ở 4 góc sàn (lùi mép 18 / 12, đối xứng qua tâm sàn), lần lượt lao chéo qua tâm sang góc đối diện; đường rộng 34, mỗi đường báo 0,3·D; lao lúc (0,3 + 0,12k)·D. Một bóng là thân thật (bóng giả mờ 70%): đánh trúng thân thật trước khi nó lao → ngắt chiêu, choáng 1 s, các đường còn lại huỷ. Bóng thật luôn lao sau bóng ở góc đối diện (thứ 3 hoặc 4) để khỏi chồng hình. | 1,1 → 1,1 |
| Nấm Chúa chiêu 2 | Bão bào tử → **Nấm mẹ đẻ con** | Ở mốc T mọc 3 nấm con chia đều 120° trên vòng R 46 (dẹt G.ZK); nấm chưa bị chém vỡ (đòn cận chiến đang ra trong 30, hoặc đạn của bé bay qua) sau 2,5 s nổ khí độc r 30, để lại vũng 3 s như cũ. | 0,8 → 0,8 |
| Cua Đá chiêu 2 | Mưa tinh thể → **Tường tinh thể** | 2 tường dọc tại tâm sàn ± 70, dài 72% bề cao sàn (chừa lối trên / dưới); chắn em bé và mọi viên đạn 3 s. Vạch đỏ chỗ tường trồi (đứng đúng chỗ thì trúng, rồi bị đẩy ra mép gần). Vỡ: 5 hàng mảnh cách 30, bắn hai bên vuông góc tường, dài ≤ 96 (tới mép sàn là hết), báo 1 s. | 1,0 → 1,0 (dựng), 1,0 (mảnh) |
| Nấm Phồng Chúa | Mưa bào tử → **Nhảy dập** | 3 lần nhảy về phía em bé (mỗi lần ≤ 60, bay 0,35 s, cao 26), bóng tròn r 24 báo 0,6 s mỗi chỗ đáp, đáp nổ khí độc để lại vũng 3 s. Đáp lúc T + 0,2 / 0,6 / 1,0. | 1,0 → 1,0 |
| Cá Nóc Chúa | Gai xoáy → **Phồng lăn** | Phồng to (×1,35) suốt lấy đà, rồi lăn theo hướng em bé, dội mép sàn (phản xạ gương) — 3 đoạn; mỗi đoạn có đường cam báo ≥ 0,7 s trước lúc lăn vào; chạm thân là trúng (một lần mỗi đoạn). Tốc = tổng đường / 1,9 s (kẹp 120–260). | 0,8 → 0,8 |
| Hũ Chúa | Vòng cầu lửa → **Đổ dầu châm lửa** | Ở mốc T rót vệt dầu chữ thập căn đúng chỗ em bé (ngang ± 70, dọc ± 70 × G.ZK, rộng 18), 1 s sau châm lửa (vùng đỏ báo suốt 1 s), cháy 2 s (đứng trong: 0,3 × mỗi 0,5 s như vũng lửa). | 0,8 → 0,8 (châm) |

**Thời gian** (tính trong `ve_xem.py` từ đúng số trong code, in dưới mỗi ô của ảnh soát):
- Trùm vùng: hết chiêu trùng cử động cũ ở mọi pha (0%). Pha 2, 3 mọi khoảng thời gian riêng của chiêu (trễ cột nước, thời gian kéo / nghỉ của xoáy) chia cho tốc pha 1,1 / 1,2 như cử động, nên không chiêu nào dài quá cử động. Riêng Vồ nhảy pha 1 chỉ nhảy một lần (bảng yêu cầu), độ dài chiêu giữ nguyên.
- Trùm nhỏ: cử động giữ nguyên (0%); nấm con nổ T + 2,5 = 3,4 s (bào tử cũ còn bay tới 3,5 s); tường giữ 3 s là cơ chế của chiêu.
- Tinh anh: Nhảy dập hết 1,9 s (0%); Đổ dầu châm lúc 1,7 s = lúc cũ hết cử động (cháy thêm 2 s theo bảng); Phồng lăn hết ~2,85 s (lăn 1,9 s khi tốc không chạm kẹp; ví dụ trong ảnh soát) so với đạn gai cũ bay hết 2,65 s (+8%) — tinh anh bận lăn lâu hơn cử động cũ 1,6 s vì thân chính là đòn.

**Đối xứng / căn tâm** (cùng cách phiên `trum-chet-pha3`): vòng tròn dẹt theo sàn G.ZK; vật chia đều 360° (nấm con 120°); bóng cáo 4 góc đối xứng qua tâm sàn, mọi đường lao đi qua đúng tâm sàn; tường + hàng mảnh đối xứng qua tâm sàn theo cả hai trục; chữ thập dầu căn đúng chỗ em bé (tay dọc nhân G.ZK để bằng tay ngang trên sàn chếch); mảnh san hô đối xứng qua trục vết nứt; xoáy và vùng nổ cùng tâm chân trùm. Đường lăn Cá Nóc là phản xạ gương đúng mép sàn. Kẹp vào sàn chỉ khi điểm rơi ra ngoài phòng (nấm con sát mép).

**Chiêu đặc biệt không gây chết oan:** kéo chậm hơn em bé chạy (30 / 72), không kéo lúc lộn / lướt / hết trận, không kéo vào vùng đỏ sắp nổ (< 0,25 s) mà bé đang đứng ngoài, kéo dừng 0,3 s trước khi tâm nổ. Tường chỉ chắn, không gây sát thương khi đứng cạnh; dựng tường đè lên bé thì bé bị đẩy ra mép gần.

**Tên chiêu:** `b.skillName` (trùm vùng, qua `G.bossSK`), `MINI_SK` (nay lộ ra `G.MINI_SK`) đổi theo cờ; tinh anh chưa có tên trên bảng thua — tên giữ ở `G.chieuTrum.TEN`. Bản tiếng Anh: `tools/ngon-ngu/tu-dien/chieu-trum.json` và chép thẳng 11 mục vào `js/ngon_ngu_en.js` (không chạy lại `gop.py` vì bản gộp hiện tại lệch với các tệp từ điển — chạy lại sẽ làm mất vài chục mục của phiên khác).

**Hình:** dùng lại ảnh `hu-*` có sẵn (xem đầu `PROMPT-ANH.md`); thân cáo phân thân vẽ bằng chính ảnh Hồ Tinh. Thiếu ảnh thì vẽ tạm tối giản bằng code: mảnh san hô, khúc tường tinh thể (khi chưa có `hu-gai-bang`), vệt dầu, nấm con. Prompt 4 ảnh còn thiếu trong `PROMPT-ANH.md`. **Không thêm ảnh vào build.**

## Tệp đã đổi

- `game/js/chieu_trum.js` (mới): bảng `SO` / `CU`, 10 chiêu, vật tự quản (vẽ ở lớp sàn), thân nhảy / lăn / phồng, tường chắn, kéo nhẹ; thay hàm chiêu trùm vùng qua `G.bossSK` (giữ hàm cũ `fCu`).
- `game/js/boss.js`: lộ `G.MINI_SK`; móc chiêu 2 trùm nhỏ ở `thinkMini`; tắt hiệu ứng code của chiêu cũ khi đang ra chiêu mới.
- `game/js/mobs.js`: móc 3 chiêu tinh anh ở `thinkElite` (nhánh cũ giữ nguyên); tắt hiệu ứng code chiêu cũ.
- `game/js/data.js`: cờ `G.CHIEU_MOI` / `?chieucu=1`. `game/index.html`: nạp `js/chieu_trum.js` sau `js/ky_nang_quai.js`.
- `game/js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/chieu-trum.json`: tên tiếng Anh.
- `game/dist/*`, `tools/xuong-sprite/*`: build lại.
- Thư mục này: `ve_xem.py`, `xem-chieu-moi.png`, `PROMPT-ANH.md`, `bao-cao.md`.

## Kiểm

- `node --check`: `chieu_trum.js`, `boss.js`, `mobs.js`, `data.js`, `ngon_ngu_en.js` — đạt.
- `build.py` — đạt: một tệp 21,36 / 30 MB, 56 tệp JS; không thêm ảnh nào.
- Ảnh soát tĩnh `xem-chieu-moi.png` (Pillow, không chạy game): 10 ô vẽ vùng đánh / đường đi / mốc từ đúng số trong code.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master, không PR.

## Chưa làm / lưu ý

- Chưa chơi thử (theo yêu cầu không test): độ khó thực tế của Phồng lăn (tốc tới 260) và Cột nước đuổi cần người chơi thử cảm nhận; muốn dịu thì chỉnh `SO` trong `js/chieu_trum.js` (ảnh soát tự vẽ lại theo số mới).
- Bot cân bằng chạy trong Node (`tests/`) chưa được dạy các cơ chế mới (thoát kéo của Xoáy hút, chém nấm con, đi vòng tường chắn, tìm bóng cáo thật) — số đo cân bằng cũ có thể lệch nếu chạy lại; muốn đo theo chiêu cũ thì bật `G.CHIEU_MOI = false`.
- Ảnh thân trùm vẫn dùng hàng cử động của chiêu cũ (VD Ngư Tinh c1 là dáng đớp, chưa có dáng giơ rìu; Hồ Tinh chưa có dáng nhảy) — thân được nâng lên khi nhảy, xoay / phồng khi lăn bằng code.
