# Báo cáo đợt 3: skill riêng của 4 bộ trang phục Zed

**Mã commit:** `abc256ce` (nhánh `khoi-tao-du-an`)

Làm theo `YEU-CAU-3-SKILL-BO.md`, gắn vào móc `G.boSkill(bo, cap)` và khung nâng bộ 3 cấp của đợt 1. Chỉ kiểm bằng `node --check` (mọi tệp `game/js/*.js` đều qua) và `python3 game/build.py` (đã dựng lại `game/dist`). **Không chạy game, không chạy bài kiểm tra nào.** Không sửa `game/js/zed_moi.js`. Không đụng đăng nhập Google, lưu mây, `?cloud=0`, không chép apiKey. Bản lưu không thêm trường nào mới (cấp bộ vẫn là `save.boCap` của đợt 1).

## 1. Người chơi thấy gì

- Mỗi bộ nâng 3 cấp (linh khí + vàng, giá như đợt 1). Mỗi cấp mở thêm 1 skill, cấp sau giữ skill cấp trước. **Skill chỉ có tác dụng khi đang mặc bộ đó.**
- Khung nâng bộ (Hành trang › Nhân vật và Cô Thợ May) hiện 3 dòng skill của bộ đang mặc: "Cấp N · Tên (đã mở / chưa mở)" và mô tả 1 dòng. Dòng đã mở màu xanh, chưa mở màu xám. Câu giới thiệu của Cô Thợ May được rút ngắn để đủ chỗ.

| Bộ | Cấp 1 | Cấp 2 | Cấp 3 |
|---|---|---|---|
| Ninja | **Bóng lướt**: lộn xong, đòn đầu tiên trong 1 giây +30% sát thương | **Phân thân**: lộn để lại bóng Zed mờ đứng tại chỗ 1,5 giây, quái thường đi tới và ngắm đòn vào bóng | **Ám sát**: đòn trúng vào lưng quái chắc chắn chí mạng (×2), hồi 4 giây, chữ bay "Ám sát!" |
| Thợ Săn Rừng | **Nhựa rừng**: đứng yên (không chạy, đánh, lộn) từ 1 giây thì hồi 1% máu tối đa mỗi giây, có đốm xanh lấp lánh | **Gai độc**: quái đánh trúng Zed bị 1 lớp độc (hiệu ứng độc sẵn có) | **Bẫy dây leo**: đòn giữ rồi thả (phi tiêu ném mạnh, thương xốc tới, búa nện đất) trói chân quái trúng đòn 1,5 giây, có vòng dây leo dưới chân |
| Chiến Binh Biển | **Khiên nước**: có 1 lớp khiên (vòng chấm xanh ngọc quanh Zed) chặn trọn 1 đòn; vỡ thì 10 giây sau có lại; vào ải có sẵn | **Sóng dội**: lộn đẩy lùi quái thường trong bán kính 40 ra thêm 24, có vòng sóng | **Thuỷ triều**: khiên vỡ thì quái trong bán kính 60 chậm còn 50% tốc độ trong 2 giây, có vòng nước |
| Hiệp Sĩ Lâu Đài | **Giáp bạc**: giảm 10% sát thương nhận | **Phản đòn**: lộn trong 0,2 giây trước khi đòn quái trúng thì phản lại 50% sát thương đòn đó cho quái ra đòn, chữ bay "Phản đòn!" | **Khí thế**: máu dưới 30% thì +25% sát thương tới hết ải, mỗi ải 1 lần, chữ bay "Khí thế!" + đốm lửa quanh Zed |

## 2. Bảng hằng số (chỗ chỉnh cân bằng duy nhất)

**`G.SKILL_BO` trong `game/js/data.js`** (ngay dưới `G.BO_MOI`). Mô tả trong khung nâng bộ tự ghép từ các số này, đổi số là chữ đổi theo.

| Bộ | Skill (`ma`) | Hằng số | Giá trị | Nghĩa |
|---|---|---|---|---|
| ninja | `bongLuot` | `cuaSo`, `them` | 1, 0,3 | cửa sổ sau khi lộn xong (giây), sát thương thêm |
| ninja | `phanThan` | `giay` | 1,5 | bóng đứng bao lâu |
| ninja | `amSat` | `hoi` | 4 | thời gian hồi (giây) |
| rung | `nhuaRung` | `dung`, `hoi` | 1, 0,01 | đứng yên bao lâu thì bắt đầu hồi, phần máu tối đa hồi mỗi giây |
| rung | `gaiDoc` | `chong`, `satThuong` | 1, 0,5 | số lớp độc, độc tính theo hệ số × đòn vũ khí đang cầm |
| rung | `bayDayLeo` | `giay`, `trum` | 1,5, 0,4 | thời gian trói; trùm bị trói `giay × trum` (0,6 giây) |
| bien | `khienNuoc` | `hoi` | 10 | khiên vỡ thì sau bao lâu có lại |
| bien | `songDoi` | `banKinh`, `day` | 40, 24 | bán kính tác dụng, quãng đẩy (điểm ảnh game) |
| bien | `thuyTrieu` | `giay`, `banKinh`, `cham` | 2, 60, 0,5 | thời gian chậm, bán kính, tốc độ còn lại |
| lau | `giapBac` | `giam` | 0,1 | giảm sát thương nhận (nhân sau phần giảm sát thương sẵn có) |
| lau | `phanDon` | `cuaSo`, `phan` | 0,2, 0,5 | cửa sổ sau khi bắt đầu lộn, phần sát thương phản lại |
| lau | `khiThe` | `mau`, `them` | 0,3, 0,25 | ngưỡng máu, sát thương thêm |

Cờ tắt: **`?skillbo=0`** → `G.SKILL_BO_BAT = false`, `G.boSkill` luôn trả `null`, mọi móc đứng yên (nâng bộ vẫn được; khung nâng bộ ghi "đang tắt"). `?hethongcu=1` cũng không có skill bộ.

## 3. Cách làm (cho phiên sau)

- **`game/js/bo_skill.js`** (mới, nạp ngay sau `vk_moi.js`): `G.boSkill(bo, cap)` thật (thay móc rỗng đợt 1, trả `{ bo, cap, ds, co }`), và `G.boSk` gồm các móc:
  - `tick` (mỗi khung, từ `G.updatePlayer`), `lon` (bắt đầu lộn), `lonXong` (lộn xong), `danh` (trước khi đòn Zed gây sát thương: hệ số + ép chí mạng), `trung` (sau khi trúng: trói), `phanDon` (trước kiểm tra bất tử trong `G.hurtPlayer`), `chan` (khiên), `nhan` (giảm sát thương), `biDanh` (sau khi Zed trúng đòn: độc, khí thế), `dich` (chỗ quái nhắm: bóng phân thân), `cham` (hệ số tốc độ quái), `moTa` (mô tả 1 dòng).
  - Vẽ: bọc `G.fx.sorted` (bóng phân thân, khiên, khí thế xếp theo chiều sâu cùng nhân vật) và `G.fx.drawGround` (dây leo, vòng chậm, vòng sóng / thuỷ triều).
  - Trạng thái: trên người chơi `P.boKhien`, `P.boLuotT`, `P.boAmSatCd`, `P.boSauLon`, `P.boKhiThe`…; trên phòng `W.boBong` (bóng), `W.boVe` (vòng); trên quái `e.boChamT`, `e.boTroiT` (trói dùng `e.st.root` sẵn có).
- Móc một dòng ở: `combat.js` (hurtPlayer, playerHit, bắt đầu / hết lộn, tick, `slowOf`, quái kiểu cũ nhắm bóng; cú lao của quái kiểu cũ nay đo trúng trên Zed thật `W.P`), `mobs.js` (`G.mob.update` nhắm bóng, tốc độ × chậm), `moves.js` (đánh dấu `manh: true` cho thương xốc tới và búa nện đất; phi tiêu ném mạnh đánh dấu ở `combat.js` theo `o.charged`).
- Bóng phân thân: vẽ bằng `G.art.hero` (hình Zed đang có, bộ đang mặc) với độ mờ 0,42, đứng yên, nhấp nháy 0,35 giây cuối, tan thành khói tối (cùng cách `fx.js` vẽ bóng mờ khi lộn). Không sửa `zed_moi.js`.
- Tiếng Anh: `tools/ngon-ngu/tu-dien/skill-bo.json` + thêm thẳng vào `game/js/ngon_ngu_en.js` (không chạy `gop.py` vì bản gộp hiện lệch với các tệp `.json`, chạy sẽ xoá ~70 mục). Có dịch luôn các chữ của khung nâng bộ đợt 1 còn thiếu.

## 4. Ảnh cần gen / móc ảnh

Phiên "đưa ảnh hiệu ứng đợt 3 vào game" (`docs/review/ke-hoach-cai-thien/hieu-ung-dot-3/YEU-CAU.md`) đã có ảnh S1, S3, S4, S5, S6 (`docs/anh-goc/zed/hieu-ung/dot-3/`). Chỗ móc trong `game/js/bo_skill.js` (giữ hình code làm dự phòng khi thiếu ảnh):

| Ảnh | Mã | Móc vào |
|---|---|---|
| S1 | hu-khien-nuoc | `veKhien` (khung 1–4 lặp khi `P.boKhien > 0`); khung 5–6 khi vỡ: trong `K.chan` (đang là `FX('burst')` xanh) |
| S2 | hu-day-leo | `veSan`, đoạn dây leo trói chân (`e.boTroiT`) — **CHƯA có ảnh**, prompt bên dưới |
| S3 | hu-song-doi | `veSan`, vòng `v.k === 'song'` (cũng dùng được cho `'trieu'`, nhuộm lam đậm) |
| S4 | hu-phan-don | `K.phanDon` (đang là chữ bay + `FX('sparkle')`), lật theo `P.face` |
| S5 | hu-khi-the | `veKhiThe` (lặp quanh Zed khi `P.boKhiThe`) |
| S6 | hu-phan-than | `K.tick`, chỗ bóng hết giờ (đang là hai `FX('burst')` tối) |

Prompt còn thiếu (cùng chuẩn `hu-dot-3.txt`, nền #00FF00, không chữ, khung không chạm nhau):
- **S2 Dây leo trói – bộ Rừng (hu-day-leo):** Pixel art dây leo xanh có lá mọc lên từ đất, quấn thành vòng ôm chân, nhìn chếch từ trên. 1 hàng 6 khung: 1 mầm nhú, 2–3 dây vươn cao, 4 quấn chặt, 5 giữ, 6 héo rụng. Xanh lá, nâu.
- (tuỳ chọn) **S7 Nhựa rừng (hu-nhua-rung):** Pixel art vài giọt nhựa xanh lá phát sáng bốc lên nhẹ từ dưới chân, cỡ bằng thân nhân vật nhỏ, không vẽ người. 1 hàng 4 khung lặp vòng. Xanh lá non, vàng nhạt.
- (tuỳ chọn) **S8 Ám sát (hu-am-sat):** Pixel art vệt chém chéo đỏ sẫm mảnh kèm tia sáng trắng ở giữa, nhìn ngang, hướng sang PHẢI. 1 hàng 4 khung: chớp → vệt dài nhất → vệt tách đôi → tan. Đỏ sẫm, đen, trắng.

## 5. Cần lưu ý (chưa kiểm vì không được chạy game)

- **Cân bằng chưa đo.** Đặc biệt: Phân thân không có hồi riêng (lộn hồi khoảng 1 giây nên lộn liên tục gần như luôn có bóng); Khiên nước chặn cả đòn rất mạnh của trùm; Gai độc dùng `G.applyStatus` thật nên có thể nổ Nổ khói khi quái đang cháy, và quái gục khi đang dính độc vẫn cho +1 linh khí như luật cũ. Muốn giới hạn thì thêm số vào `G.SKILL_BO` và đọc trong `bo_skill.js`.
- Phân thân chỉ lừa quái thường (`W.ents`); trùm (`W.boss`, kể cả trùm nhỏ ở ô trùm) vẫn nhắm Zed. Sóng dội không đẩy trùm. Thuỷ triều làm chậm quái thường (cũ và mới); trùm có ghi thời gian nhưng `boss.js` chưa đọc nên trùm không chậm. Bẫy dây leo trói cả trùm (ngắn hơn, `trum = 0,4`).
- Ám sát tính "sau lưng" theo hướng đòn so với hướng quái đang nhìn (`e.face`); quái mới thường quay mặt về Zed nên chủ yếu ăn khi lộn qua sau lưng hoặc quái đang ra đòn / quái giáp quay chậm.
- Bóng lướt: mọi đòn trúng trong cùng khung đầu tiên đều được +30% (đòn quét trúng nhiều con), rồi hết.
- Khí thế tính "trận" = một lượt ải (P dựng một lần mỗi ải); chơi tiếp lượt ải dở (`luu_luot.js`) thì được dùng lại một lần nữa.
- Lực chiến / Sức mạnh (`G.power`, `luc_chien.js`) chưa tính skill bộ.
- Bóng phân thân dùng hình Zed hiện tại qua `G.art.hero` với người chơi giả (`Object.create(P)` tắt đồng hồ đòn); nếu `zed_moi.js` sau này đọc thêm trường khác của `o.p` thì bóng có thể vẽ theo dáng của Zed thật.
