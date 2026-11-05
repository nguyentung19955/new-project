# Talesworn, phiên B: chữ, tên, tiếng Anh (05/11/2026)

Phiên này đổi **chữ hiển thị** của game theo hướng cổ tích châu Âu đã chốt ("The Unwritten Tales"). Không đổi luật chơi, không đổi hình, không đụng ải 1-1 (`stage.js`), `slice_chu.js` (phiên A) hay màn đầu / logo (phiên C).

Không ai chơi thử bằng tay. Đã làm: kiểm cú pháp (`node --check`), dựng lại `dist`, chụp ảnh tự động ở cỡ 844×390 (iPhone cầm ngang) cả tiếng Anh lẫn tiếng Việt, rồi soát ảnh bằng mắt.

## 1. Đã làm gì (nói ngắn)

1. **Tiếng Anh là mặc định cho người chơi mới.**
   - Máy đặt tiếng Việt: game chạy tiếng Việt. Máy đặt thứ tiếng khác: tiếng Anh.
   - Người chơi cũ (bản lưu đã có tiến độ) mà chưa từng bấm đổi ngôn ngữ: **giữ tiếng Việt** như trước. Ai đã chọn rồi thì giữ đúng lựa chọn đó.
   - Thêm đường dẫn `?lang=en` hoặc `?lang=vi` để mở thẳng một thứ tiếng (game nhớ lựa chọn này). Nút **EN / VI** và nút **Ngôn ngữ** trong Cài đặt vẫn đổi được như cũ.
   - Màn hình tải (chữ "Loading…") cũng theo đúng luật này.
2. **Đổi toàn bộ tên riêng và thuật ngữ** sang tên mới, ở **cả hai thứ tiếng** (bảng mục 3). Làm bằng một "lớp tên mới": chữ nào sắp hiện lên màn hình cũng được đổi tên ở bước cuối. Nhờ vậy:
   - Mã nội bộ, tên tệp ảnh, mã quái, khoá bản lưu **giữ nguyên**, bản lưu cũ đọc vẫn đúng.
   - Muốn sửa tên nào chỉ cần sửa một tệp: `game/js/ten_moi.js`.
3. **Viết lại lời truyện mở đầu** và toàn bộ lời cốt truyện (`game/js/truyen.js`): kết mỗi vùng, đoạn kết, mở vùng Đầm Sương, câu trùm, câu người làng sau mỗi trùm. Giọng cổ tích, câu ngắn, truyện vẫn **mở** (không ai biết bao nhiêu trang bị xé). **Không có chuông, tiếng vọng**. Tranh truyện cũ tạm giữ.
4. **Gộp lại từ điển dịch**: trước đây tệp từ điển game nạp (`ngon_ngu_en.js`) bị thêm tay 92 câu, lệch với thư mục từ điển gốc. Nay đã gom về `tools/ngon-ngu/tu-dien/dong-bo-en-js.json`, hai bên khớp nhau (1983 câu). Quét chữ chưa dịch ở các màn chính bằng máy: **còn 0 câu tiếng Việt sót** ở 55 cảnh chụp tiếng Anh (màn đầu, làng, Lò rèn / Luyện, Cửa hàng, Thợ may, Kỹ năng, Hướng dẫn, Bạn bè, Bản đồ, Hành trang, trận, tạm dừng, thắng, thua, cài đặt, góp ý, truyện).
5. **Tên trang / tab trình duyệt** đổi thành **Talesworn** (cả tên khi "Thêm vào màn hình chính" trên iPhone). Tên miền giữ `spiritblade.web.app`.
6. **Dải mặt người làng** đổi chữ theo thanh nút mới: **Play · Forge · Shop · Outfits · Skills · Friends · Quests** (tiếng Việt: Chơi · Lò rèn · Cửa hàng · Mũ áo · Kỹ năng · Bạn bè · Nhiệm vụ). Ô của Anh Tom ghi "Quests / Nhiệm vụ" khi thẻ Việc hôm nay đã mở, chưa mở thì vẫn ghi "Settings / Cài đặt".
7. **Câu chủ đề** "Your blade remembers. Your enemies learn.": màn đầu mới của phiên C ghi câu này bằng tiếng Anh ở cả hai thứ tiếng (như khẩu hiệu). Bản dịch "Vũ khí ghi nhớ. Kẻ thù học hỏi." có sẵn trong từ điển và hiện ở màn đầu cũ (`?mandau=cu`).

### Cờ quay lui

- `?ten=cu`: **toàn bộ chữ và tên cũ** (Cu Tí, Mộc Tinh, Rừng già, chưởng, lời truyện trống đồng…). Cả tiếng Việt lẫn tiếng Anh.
- Ghép được với ngôn ngữ: `?ten=cu&lang=vi`.

## 2. Ảnh chụp tự soát (844×390)

Ảnh ở thư mục `anh/` cạnh tệp này (`en-…` tiếng Anh, `vi-…` tiếng Việt): màn đầu, làng, Lò rèn / Luyện, trận, cài đặt, kết quả, Bạn bè, bản đồ, 3 khung truyện mở đầu.
Soát bằng mắt: chữ nằm gọn trong nút và khung ở mọi ảnh đã xem; chữ dài trong truyện tự thu nhỏ cho vừa (dùng lại hàm căn chữ có sẵn).

Lưu ý: ảnh chụp bằng máy không tải ảnh nền làng (nền làng trong ảnh trống là do cách chụp, không phải lỗi game). Màn đầu trong ảnh là màn đầu mới của phiên C (đã gộp trước khi đẩy).

## 3. Bảng đối chiếu cuối cùng đã dùng

Theo bảng mục 8 của `docs/tu-van-toan-cau/huong-c-co-tich-chau-au.md`, chỉnh theo tư vấn ChatGPT 05/11. Chỗ khác bảng gốc ghi ở cột "Ghi chú".

| Cũ | Tiếng Anh | Tiếng Việt mới | Ghi chú |
|---|---|---|---|
| Linh Khí (tên game) | **Talesworn** | Talesworn | theo chốt 05/11 (bảng gốc ghi "Spiritblade: The Torn Storybook") |
| Cu Tí / Zed | **Rowan** | Rowan | |
| Cu Tèo / Cái Bống / Cu Lì | Jory / Liesel / Otto ("Big Otto" trong lời truyện) | Jory / Liesel / Otto | |
| Bé Sen | Lettie | Lettie | |
| Chú Lái Đò | Hob | Bác Hob | gọn cho vừa nhãn tên |
| Ông Thợ Rèn | Master Dorran | Bác Dorran | |
| Bà Hàng Xén | Granny Marrow | Bà Marrow | |
| Cô Thợ May | Odile | Cô Odile | |
| Cụ Đồ | Master Quill | Thầy Quill | |
| Ông Từ | Old Ambrose | Ông Ambrose | người giữ Sách Lớn |
| Anh Mõ | Crier Tom | Anh Tom | bỏ "Cốc cốc" → "Hear ye / Nghe đây" (không mõ, không chuông) |
| Làng / sân đình / gốc đa | Hollin / Village Green / Old Oak | Hollin / sân làng / gốc sồi | đình → Nhà Kể Chuyện (Storyhouse) |
| Rừng già | Thornwood | Rừng Gai | |
| Hang biển | Drowned Grotto | Hang Chìm | |
| Lâu đài cổ | Emberhold | Lâu đài Than Hồng | |
| Sông sâu | Mirefen | Đầm Sương | |
| Mộc Tinh | Grimbark | Lão Cây Gai | |
| Ngư Tinh | Sir Inkmaw | Hiệp Sĩ Mực | |
| Hồ Tinh | Vulpina | Phù Thuỷ Cáo | **giữ nhiều đuôi** (không ghi "một đuôi") |
| Thuồng Luồng | Lindworm | Lindworm | |
| Hắc Long | Inkwyrm | Rồng Mực | chưa có trong game |
| Nấm Chúa / Cua Đá / Hổ Lửa / Cá Trê | Toadstool King / Crystal Crab / Cinder Lion / Old Mudwhisker | Vua Nấm / Cua Pha Lê / Sư Tử Than / Lão Cá Trê | |
| Đèn Lồng Ma / Mèo Đen Hai Đuôi / Tiểu Yêu Ném Pháo / Ma Da Tóc Rong / Ba Ba Mai Đồng | Lantern Wisp / Witch's Cat / Goblin Bomber / Bog Nixie / Snapper Turtle | Ma Đèn Sắt / Mèo Phù Thuỷ / Yêu Tinh Ném Bom / Tinh Nước Đầm / Rùa Cắn | chỉ đổi tên, hình giữ |
| Lính Ma Giáp Gỉ / Tướng Ma / Rái Cá Cầm Sào | Rusted Knight / Phantom Captain / Otter Poler | giữ | |
| yêu tinh (quái) | tale-beasts | quái vật | |
| Sổ yêu quái | Bestiary | Trang Quái Vật | |
| Trống đồng / mảnh trống / mảnh mặt trời | the Great Storybook / page / the Cover | Sách Lớn / trang sách / Trang Bìa | |
| Chưởng | **Ink Bolt** | **Đạn Mực** | theo ChatGPT (bảng gốc ghi "Spirit Burst") |
| Hỏa / Độc / Băng chưởng | Fire / Poison / Ice Bolt | Đạn Mực Lửa / Độc / Băng | |
| linh khí (tiền nâng vũ khí) | **Ink** | linh khí (giữ) | bảng mục 8 dòng 29; tiếng Việt giữ "linh khí" cho quen |
| Trắng / Mầm / Thành hình / Thức tỉnh | **White / Sprout / Formed / Awakened** | giữ | theo ChatGPT |
| Phi tiêu / Mưa Phi Tiêu | Star Darts / Star Rain | giữ | bỏ "Shuriken" (Nhật) |
| Suối hồi | Wishing Spring | Suối Ước | |
| Ninja Bóng Đêm / Thợ Săn Rừng / Chiến Binh Biển / Hiệp Sĩ Lâu Đài | Shadow Garb / Huntsman / Tidewarden / Castle Knight | giữ tên tiếng Anh | |
| Dải mặt người làng | Play / Forge / Shop / Outfits / Skills / Friends / Quests | Chơi / Lò rèn / Cửa hàng / Mũ áo / Kỹ năng / Bạn bè / Nhiệm vụ | thanh 5 nút thật chưa làm (phiên khác) |
| Thẻ Truyện | Tale Cards | Thẻ Truyện | **chỉ chừa tên**, chưa có tính năng |
| 14 Phúc lành tên truyền thuyết Việt | Moonlit Blade, Hunter's Ricochet, Giant's Hook, Woodcutter's Swing, Sleeping Thorn, Firebird Feather, Giant's Shove, Seven-League Boots, Mirror Cloak, Briar Cloak, Hearth Embers, Dragon's Spark, Witch's Brew, Frost Queen's Breath | Gươm Ánh Trăng, Phi Tiêu Nảy, Móc Khổng Lồ, Nhát Bổ Tiều Phu, Gai Ngủ Say, Lông Chim Lửa, Cú Đẩy Khổng Lồ, Hài Bảy Dặm, Áo Choàng Gương, Áo Choàng Gai, Than Lò Sưởi, Tia Lửa Rồng, Nồi Thuốc Phù Thuỷ, Hơi Thở Nữ Hoàng Băng | tên tự đặt, luật giữ nguyên ("Trống đồng Đông Sơn" có chữ trống nên phải đổi) |

### Lời truyện mới (tóm tắt)

- **Mở đầu (5 khung):** Sách Lớn của làng Hollin → đêm sương, thứ gì dưới sông xé trang, Lão Cây Gai / Hiệp Sĩ Mực / Phù Thuỷ Cáo thức dậy → không còn trang giữ chân, quái tự viết số phận, học theo người đánh chúng; không ai biết bao nhiêu trang bị xé → Jory, Liesel, Otto bị bắt → Bác Dorran trao kiếm có hồn "nhớ từng nhát cháu chém", Bác Hob chờ ở bến.
- **Kết mỗi vùng:** bạn được cứu nói một câu; một trang về làng làm một hình trong sách sống lại (cây táo vàng, giếng ước, cối xay gió, đàn ngỗng trời).
- **Đầm Sương:** Lettie bị cái bóng dưới sông bắt; Lindworm nhả một trang, ngoạm Trang Bìa trốn về núi; câu móc sang Núi Bão (Stormpeak).

## 4. Chỗ còn sót / chưa làm

- **Tranh truyện** vẫn là tranh cũ (cây đa, trống đồng, ba yêu tinh). Lời đã mới nên vài khung tranh và lời chưa khớp hẳn (khung 5: tranh trao vũ khí cũ, người nói nay là Bác Dorran). Cần vẽ lại tranh (việc của phiên hình).
- **Hình người làng, làng, logo** còn kiểu Việt Nam (nón lá, đình, cây đa). Tên đã mới, hình chờ phiên vẽ.
- Một số câu **hướng dẫn dài, ít gặp** vẫn đổi tên bằng lớp tên mới nên đôi chỗ câu tiếng Việt hơi gượng (ví dụ "luyện lên Vàng ở Bác Dorran"). Không sai nghĩa, có thể chuốt lại sau.
- Bản tiếng Anh của vài câu cũ còn gọi Rowan là "him" (ChatGPT nói Rowan không nên khoá giới tính quá cứng). Chưa sửa.
- Trong tiếng Anh, "Ink" vừa là tiền nâng vũ khí vừa là tên chiêu "Ink Bolt"; nếu chủ game thấy dễ lẫn thì đổi tiền thành "Essence" chỉ bằng một dòng trong `game/js/ten_moi.js`.
- Ô góp ý (khung nhập chữ của trình duyệt) còn ghi "Zalo" ở bản tiếng Việt (đúng cho người Việt); bản tiếng Anh đã bỏ.
- Chữ trên hình (ảnh vẽ sẵn có chữ, nếu có) không đổi được bằng chữ, phải vẽ lại.
- Câu của phiên A trong `game/js/slice_chu.js` (chưa có lúc làm phiên này): nếu có tên cũ thì lớp tên mới cũng tự đổi; câu mới cần bản tiếng Anh thì phiên A tự thêm.

## 5. Tệp đã đổi

- `game/js/ngon_ngu.js`: tiếng Anh mặc định, `?lang=`, lớp tên mới (`G.ten`), cờ `?ten=cu`.
- `game/js/ten_moi.js` (mới): bảng tên mới hai thứ tiếng, câu thay nguyên câu, 14 Phúc lành.
- `game/js/truyen.js`: lời truyện The Unwritten Tales (bản cũ giữ cho `?ten=cu`).
- `game/js/village_scene.js`: chữ dải mặt người làng.
- `game/js/ui_theme.js`: biểu tượng tài nguyên nhận cả tên mới ("mảnh Lão Cây Gai").
- `game/js/luyen.js`: một chỗ ghép chữ "Trắng" chưa dịch.
- `game/index.html`, `game/web/manifest.webmanifest`, `game/build.py`: tên trang Talesworn, màn hình tải.
- `tools/ngon-ngu/tu-dien/`: `dong-bo-en-js.json`, `truyen-talesworn.json`, `talesworn-sot.json`; `game/js/ngon_ngu_en.js` dựng lại bằng `gop.py`; `tools/ngon-ngu/HUONG-DAN-DICH.md` thêm mục 6.
- `game/dist/*`: dựng lại.

## 6. Commit

- `7667304b` Talesworn phiên B: tiếng Anh mặc định (?lang=en|vi), tên mới hai thứ tiếng (lớp tên G.ten, js/ten_moi.js), lời truyện The Unwritten Tales, gộp từ điển, tiêu đề trang Talesworn; ?ten=cu quay lui + dựng lại dist. Đã đẩy lên nhánh `khoi-tao-du-an` (gộp sau commit của phiên A và C; dist dựng lại sau khi gộp).
