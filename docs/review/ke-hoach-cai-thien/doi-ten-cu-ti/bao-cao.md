# Báo cáo: đổi tên hiển thị Zed → "Cu Tí" (14/10)

Commit `7c54fdbc` trên `khoi-tao-du-an`. Chỉ `node --check` các tệp JS đã sửa và chạy `game/build.py` (không chạy test nào).

## Đã đổi

- **Tiếng Việt** (chuỗi người chơi nhìn thấy): `truyen.js` (lời thoại, lời Cụ Đồ / Anh Mõ), `village.js` (bảng Ông Từ, lời Ông Từ, hướng dẫn Chưởng / Bốn vũ khí),
  `village_scene.js` (việc + nhãn ngắn của Ông Từ, thông báo chuyển bản lưu, trang phục mới), `hanh_trang.js` (tiêu đề thẻ Nhân vật),
  `data.js` (`G.HEROES.smith.name` = 'Cu Tí'), `stage.js` (dòng cứu bạn / mở trang phục), `bo_skill.js` (mô tả skill Gai độc),
  `vk_moi.js`, `vk_moi_lang.js` (khung / bảng trang phục).
- **Tiếng Anh**: sửa cả `tools/ngon-ngu/tu-dien/*.json` (00-chung, lang, skill-bo, truyen-am-thanh, tui, zed) và `game/js/ngon_ngu_en.js` theo cùng một cách
  (không chạy lại `gop.py` vì `ngon_ngu_en.js` đang có 5 mục viết tay không nằm trong JSON, chạy lại sẽ mất). Khoá đổi theo câu Việt mới, bản dịch dùng "Cu Ti";
  thêm `"Cu Tí": "Cu Ti"` cho tên đứng riêng; mọi bản dịch cũ còn "Cu Tí" (có dấu) cũng đổi thành "Cu Ti". Câu "Cu Tí luôn mang đủ 4 vũ khí…" trước đây chưa có bản dịch, nay đã thêm.
  Đã so lại: từ điển trong `ngon_ngu_en.js` khớp với bản gộp từ JSON, chỉ khác đúng 5 mục viết tay có từ trước.
- `game/dist/*` và `tools/xuong-sprite/index.html` build lại bằng `build.py`.

## Vài câu tiêu biểu (cũ → mới)

| Cũ | Mới |
|---|---|
| Zed ơi, ba bạn đang chờ cháu… | Cu Tí ơi, ba bạn đang chờ cháu… |
| Cu Tèo đã về làng… Cu Tèo dạy Zed đánh hiểm… | Cu Tèo đã về làng… Bạn ấy dạy Cu Tí đánh hiểm… |
| Cảm ơn Zed đã lặn xuống tìm tớ! | Cảm ơn Cu Tí đã lặn xuống tìm tớ! |
| …hạ trùm vùng để cứu, bạn ấy sẽ dạy Zed. (Ông Từ) | …hạ trùm vùng để cứu, bạn ấy sẽ dạy cháu. |
| Ngón nghề của các bạn, Zed học hết rồi đấy. | Ngón nghề của các bạn, cháu học hết rồi đấy. |
| Chưởng của Zed đẩy lùi…; mỗi bạn được cứu dạy Zed thêm một nét | Chưởng của Cu Tí đẩy lùi…; mỗi bạn được cứu dạy cậu thêm một nét |
| Mở trang phục Zed: {0}! | Cu Tí mở được trang phục mới: {0}! |
| Bản lưu cũ đã chuyển sang Zed: …, {2} bạn đã dạy Zed. | Bản lưu cũ đã chuyển sang Cu Tí: …, đã được {2} bạn dạy. |
| Sân đình: chỉ số Zed / Bộ trang phục Zed | Sân đình: chỉ số Cu Tí / Bộ trang phục Cu Tí |
| EN: Zed, your three friends are waiting… | EN: Cu Ti, your three friends are waiting… |

## Chữ "Zed" còn lại (cố ý giữ)

Grep lại "Zed" ngoài chú thích trong `game/js`: không còn chuỗi hiển thị nào cho người chơi. Còn lại đều là nội bộ:

- `engine.js` `phan('Zed', …)`: tên phần sửa bản lưu, chỉ vào `G.fixSaveLoi` / `console.error`, không vẽ ra.
- `sprite_custom.js` `'mã tệp Zed phải là zed-<tên>'`: lỗi của công cụ nạp sprite (dành cho người vẽ), không phải chữ trong game.
- Tên biến / hàm / khoá / tệp (`zed_moi.js`, `G.zedMoi`, `laZed`, `themZed`, `ZED_BO`, `zed-*.sprite.json`, `save.zed`, cờ `?zedbo=`), tên tệp từ điển `zed.json`, và mọi chú thích code: giữ nguyên theo yêu cầu.
- Tên hiển thị cũ "Cu Tí" ở `data.js` (`HEROES.smith`, bị đè lúc nạp) và `hero_tinhlinh.js` vốn đã là "Cu Tí", không cần đổi.

Không đổi luật / số, không đụng đăng nhập Google, lưu mây, `?cloud=0`, master.
