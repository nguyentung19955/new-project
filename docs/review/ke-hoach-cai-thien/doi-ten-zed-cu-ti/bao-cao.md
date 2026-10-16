# Đổi tên "Zed" → "Cu Tí" (chữ người chơi thấy) — 16/10/2026

Chủ game hỏi "sao vẫn còn Zed à": nhân vật chính là **Cu Tí** (tiếng Anh: **Cu Ti**).

## Đã đổi (chỉ chữ hiển thị)

| Tệp | Chỗ | Trước → Sau |
|---|---|---|
| `game/js/data.js` | mẹo hướng dẫn linh khí / vũ khí (dòng ~814) | "Zed mang đủ 4 vũ khí…" → "Cu Tí mang đủ 4 vũ khí…" |
| `game/js/ngon_ngu_en.js` | khoá + bản dịch của câu trên | khoá khớp chuỗi Việt mới; "Zed always carries…" → "Cu Ti always carries…" |
| `game/js/ngon_ngu_en.js` | khoá + bản dịch câu Cô Thợ May nâng 4 bộ đồ | "bộ đồ của Zed" → "bộ đồ của Cu Tí"; "upgrades Zed's" → "upgrades Cu Ti's" (khoá này hiện không còn chuỗi nguồn, sửa cho đồng bộ) |

Quét toàn bộ `game/js`, `game/index.html`, `game/web`: không còn chữ "Zed" nào hiện ra cho người chơi.

## Cố ý để nguyên

- `engine.js` `phan('Zed', …)`: chỉ là nhãn nội bộ ghi vào `G.fixSaveLoi` / console khi sửa bản lưu lỗi, không hiện ra màn hình.
- Tên biến/hàm/tệp (`zed_moi.js`, `laZed`, `G.zedHoc`, `save.zed`, mã ảnh `zed-*`, `doi_tuong === 'zed'`), cờ URL, khoá lưu trữ — đổi sẽ hỏng save/ảnh.
- Ghi chú trong code (`// … Zed …`), chuỗi lỗi dành cho dev trong `sprite_custom.js` (mã tệp `zed-<tên>`), tests.

## Kiểm tra

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt (dist dựng lại).
- `tests/smoke.py` headless: `errors: []`.
