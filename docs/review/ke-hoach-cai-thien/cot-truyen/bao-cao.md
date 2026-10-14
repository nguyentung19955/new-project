# Báo cáo: Cốt truyện Zed cứu các bạn, bỏ Lạc Long Quân (14/10)

Commit: `949bf84b` trên nhánh `khoi-tao-du-an`.

## Đã làm
- `game/js/truyen.js`: viết lại các câu nhắc Lạc Long Quân / Phong Châu / "khối sắt nung" / truyền thuyết cũ; câu trùm và lời Cụ Đồ mô tả đúng hình dạng mới. Cấu trúc mảng, khoá `nen`/`ai`, số câu giữ nguyên. Không đổi luật, số, tên NPC, tên vùng, tên nguyên liệu ("Vảy cá" giữ nguyên vì là tên nguyên liệu).
- Từ điển tiếng Anh: đổi khoá trong `tools/ngon-ngu/tu-dien/truyen-am-thanh.json`, `zed.json` và sửa đúng các dòng tương ứng trong `game/js/ngon_ngu_en.js` (KHÔNG chạy lại `gop.py` vì bản gộp hiện tại lệch với tệp đang dùng ~230 dòng không liên quan). Bỏ khoá cũ "Bốn em bé ... Lạc Long Quân" không còn dùng.
- `game/tests/truyen_am_thanh.py`: chỉ đổi chuỗi so sánh câu ra mắt Mộc Tinh sang câu mới (không chạy).
- Build lại `game/dist` bằng `python3 build.py`.
- Kiểm: `node --check` cho `truyen.js`, `ngon_ngu_en.js`; `grep` không còn "Lạc Long", "Phong Châu", "sắt nung", "chiên đàn" trong `game/js`, `game/index.html`, `game/dist/linh-khi.html`. KHÔNG chạy test / game.
- Không đụng `monster_art.js`, `sprite_custom.js`, `ui_theme.js`, đăng nhập Google, lưu mây, `?cloud=0`.

## Lời cũ → mới

| Chỗ | Cũ | Mới |
|---|---|---|
| MO_DAU[1] (Ba yêu tinh) | Ba yêu tinh xưa kia Lạc Long Quân đã trừ nay thức dậy: Mộc Tinh ở Rừng già, Ngư Tinh ở Hang biển, Hồ Tinh ở Lâu đài cổ. Chúng hút linh khí về hang. | Ba yêu tinh thức dậy: Mộc Tinh, cây cổ thụ ở Rừng già; Ngư Tinh, mực khổng lồ cầm rìu san hô ở Hang biển; Hồ Tinh, cáo chín đuôi đeo mặt nạ ở Lâu đài cổ. |
| MO_DAU[2] (Bị bắt) | Cu Tèo, Cái Bống, Cu Lì đi tìm linh khí cho làng, rồi bị yêu tinh bắt mất. | Cu Tèo, Cái Bống, Cu Lì, ba bạn thân của Zed, đi tìm linh khí cho làng rồi bị yêu tinh bắt mất. |
| MO_DAU[3] (Cụ Đồ) | Còn Zed. Cầm lấy vũ khí sống này, cháu: vũ khí lớn lên theo cháu, yêu tinh học theo cháu. Chú Lái Đò chờ ở bến! | Zed ơi, ba bạn đang chờ cháu. Cầm lấy vũ khí sống này: nó lớn lên theo cháu. Đi cứu bạn đi, Chú Lái Đò chờ ở bến! |
| KET[0] | Tối ấy cả làng mở hội dưới gốc đa. Zed và ba bạn ngồi nghe Cụ Đồ kể chuyện Lạc Long Quân trừ yêu. Hết truyện... mà chưa hết đâu! | Tối ấy cả làng mở hội dưới gốc đa, mừng ba bạn trở về. Ai cũng cảm ơn Zed đã cứu bạn. Hết truyện... mà chưa hết đâu! |
| TRUM.moc ra mắt | Ta là cây chiên đàn nghìn năm thành tinh. Linh khí của làng đã chảy vào rễ ta! | Ta là cây cổ thụ thành tinh, nấm độc mọc đầy thân. Linh khí của làng đã chảy vào rễ ta! |
| TRUM.ngu ra mắt | Biển Đông là nhà ta! Đứa bé con dám lội xuống hang của Ngư Tinh sao? | Tám xúc tu, một rìu san hô! Đứa bé con dám lội xuống hang của Ngư Tinh sao? |
| TRUM.ho ra mắt | Chín đuôi, nghìn năm tu luyện. Ngươi tưởng thắng được ta ư? | Chín đuôi lửa, một mặt nạ. Ngươi tưởng thắng được ta ư? |
| TRUM.ho khi gục | Lửa ở đuôi tắt rồi... Hang ta lại thành hồ nước trong... | Lửa ở đuôi tắt rồi... Mặt nạ của ta nứt mất rồi... |
| LANG.do[0] | Mộc Tinh là cây chiên đàn nghìn năm. Xưa Lạc Long Quân trừ nó ở rừng Phong Châu. | Mộc Tinh là cây cổ thụ mọc đầy nấm độc. Cháu hạ được nó, Rừng già thở lại rồi. |
| LANG.do[1] | Ngư Tinh xưa bị Lạc Long Quân ném khối sắt nung vào miệng. Cháu cũng giỏi chẳng kém. | Ngư Tinh là con mực khổng lồ cầm rìu san hô. Cháu hạ được nó, giỏi lắm! |
| LANG.do[2] | Hang cáo chín đuôi bị phá, chỗ ấy thành hồ lớn. Truyện của cháu, lão ghi vào sách. | Cáo lửa chín đuôi đeo mặt nạ cũng gục rồi. Chuyện Zed cứu bạn, lão ghi vào sách. |

Các câu khác (VUNG, MO_DAU[0], KET[1], trùm nhỏ, người làng khác) không nhắc truyền thuyết nên giữ nguyên.

## Lưu ý
- MO_DAU[1] dài hơn câu cũ vài chữ (khung chữ tự xuống dòng, vẫn trong 3 dòng). Bỏ vế "Chúng hút linh khí về hang" để bù.
- Chú thích mã `art.js` "đinh ba" là chú thích chuyển động vũ khí, không phải lời thoại, không đổi.
- `tools/ngon-ngu/gop.py` hiện không tái tạo đúng `ngon_ngu_en.js` (lệch sẵn từ trước) — nên xem lại riêng.
