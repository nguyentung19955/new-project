# Ảnh v2 (màn dọc kiểu Defense War) — phiên điều phối thả dần vào đây

Quy ước (đặc tả `docs/demo-hop-tuong/tu-van-chatgpt-dac-ta-dcdw.txt` mục 3, 6):
- Sprite sheet 1 hàng, mỗi khung 128x128, chân tại (64,110); số khung = chiều rộng / 128.
- Tướng bay (warp): thân căn giữa quanh y=58 trong khung (không chạm đất), vẫn neo khung theo (64,110).
- Cùng 1 tướng mọi động tác dùng chung tỉ lệ (`scale.json`, công cụ `tools/demo-cat-sheet-v2.py`).

Đã có: scorch_idle, frost_idle, lance_idle, warp_idle (8 khung). Đang vẽ: *_attack (12 khung), các tướng còn lại, UI.
Ghi chú: `bg_arena_portrait.png` gốc ChatGPT (1086x1448) đã vẽ sẵn bàn + làn nên CHƯA dùng; đang xin bản nền trống tỉ lệ dọc.
