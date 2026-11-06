# Twin Maker (sinhdoi) — kiểm & sửa 06/11/2026

**Cơ chế (đã kiểm 100 %, có test hồi quy `*_ghep_sinhdoi` + `online_sinhdoi` trong tools/thap-kt-hoiquy.js)**
- Ghép THƯỜNG có Twin Maker (2 Twin kéo chiều nào cũng được, Twin + Mimic 2 chiều, bàn đầy, 1★→6★): luôn ra đúng 1 ụ thêm,
  ngẫu nhiên trong bộ bài, CÙNG sao nguyên liệu. Ghép luôn trả lại 1 ô (ô ụ kéo) nên luôn có chỗ.
- Ụ sinh đôi tạo THẲNG ở đúng sao (`sinhDoi()` trong game.js) — trước đây tạo 1★ rồi mới đổi sao → online gửi gói 'tr' với 1★.
- ONLINE (lỗi thật trước đây): gói 'tr' của ụ sinh đôi tới TRƯỚC gói 'gh' → máy bạn đặt ụ đè lên ô ụ kéo (1★), rồi ghép xoá mất
  → bên bạn KHÔNG thấy ụ sinh đôi cho tới khi ảnh chụp 1 s sửa. Nay: gói 'gh' kèm `tw` {o,id,s}; máy bạn dựng y hệt ngay; máy
  chủ bàn bốc ô/loại bằng RNG hạt giống chung (seed + tick + ô).
- Ghép ĐẶC BIỆT (Merge King / Blender… kéo vào Twin Maker) KHÔNG kích hoạt Twin: đó là kỹ năng của ụ kéo, không phải ghép thường. Giữ như cũ.

**Vì sao trước đây "lúc được lúc không"**: tia nối cũ chạy NGAY lúc thả (0,55 s) — bị phát lại ghép (lộ kết quả ở ~0,45 s) che;
ụ mới hiện ngay, thường đúng ô ụ kéo vừa rời → trông như ụ kéo "chưa đi". Nhãn 'TWIN n★' đã bị tắt từ trước (nhanU rỗng).

**Hình mới (chỉ ảnh ChatGPT có sẵn, không chữ)**: lúc kết quả ghép lộ ra → tia vàng `fx_bingo` từ ô ghép tới ô mới → ụ mới triệu hồi
bình thường (cổng hầm + nhịp HUD) khi tia tới → vòng vàng `fx_vong_trieu` tô vàng quanh ụ mới → biểu tượng 2 vòng nối
`fx_sinhdoi_hieu` loé ~0,6 s trên cả 2 ô. Mọi bàn (SOLO, CO-OP 2 bàn, PVP 2 bàn, ONLINE).

Ảnh: `strip_solo.png` (0 → 1500 ms), `strip_coop.png`, `strip_pvp.png`.
