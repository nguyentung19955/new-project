# MỘT VÒNG (06/11) — "2 vòng chạy này là sao"

Người dùng (iPhone, SOLO wave 20, bàn đầy Leviathan) không hiểu 2 vòng quanh ụ. Giờ mỗi dấu chỉ có 1 nghĩa, mọi ụ, mọi chế độ:

| Dấu | Nghĩa |
|---|---|
| **Vòng xanh lá** (duy nhất quanh ụ) | nạp chiêu. Đầy: vòng thở nhẹ. Chiêu chạm-để-dùng (3★+) → icon chạm ở góc trên-trái ô (bàn mình). Chiêu tự kích → huy hiệu 'auto' có sẵn. Ụ không có chiêu nạp → không vòng. |
| **Ngọc xanh dưới số sao** | dạng hiện tại: ●○○ dạng 1 · ●●○ dạng 2 · ●●● dạng 3 (Werewolf 2 viên: thường / thức tỉnh). Lên dạng: hàng ngọc nảy nhẹ. |
| **Tấm số dưới ô** | bộ đếm kỹ năng (ABYSS, COMBO ×N, chuỗi ×N…) — giữ như cũ (demkn.js). |

- Bỏ: 3 cung dạng (growfx.js veGauge), 2 vòng phù văn Combo Core, 3 vành Lotus (khoisinh), nửa vành ngày/đêm Eclipse, vòng đỏ Lone Wolf (docton), nhịp vòng Sync — cờ `MOT_VONG` (data.js).
- Luật vòng chung `MV.coNap(T)` (motvong.js) dùng cho cả ụ thường (render.js) lẫn ụ có dạng (growfx.js).
- Bảng chạm ụ (dải xem nhanh): thêm 1 dòng (≤ 2 dòng chữ) EN/VI, vd. "Vòng xanh lá = nạp HƠI THỞ THỦY TRIỀU (đầy thì chạm ụ) · Ngọc = dạng 2/3 KẺ DƯỚI VỰC · Số dưới ô = điểm ABYSS". Bảng mở rộng: bản đầy đủ (có thời gian hồi).
- Turret File → Details: mục "On-board icons / Biểu tượng trên ụ".
- Điểm 4 (đổi TIDAL BREATH thành tia nước từ ụ): **BỎ** theo YEU-CAU-THEM.md — người dùng thích đầu rồng triệu hồi; session Leviathan riêng làm.
- Còn chờ ảnh: `ui_tay.png` (bàn tay chạm, prompt S12 trong HINH-VE-CODE-AUDIT.md) — tạm `ic_phat`.

Ảnh (iPhone 13, `node tools/thap-kt-motvong.js`): `truoc_*` / `sau_*` · `so-sanh_ban.png` (trái trước, phải sau) · `*_tt_*_en|vi.png` bảng chạm · `sau_file_*.jpg` trang ụ (ảnh toàn màn đổi sang JPG).
