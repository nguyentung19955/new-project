# Lam – hoạt ảnh HÀNH ĐỘNG từ rig-v4 (BẢN CHỜ DUYỆT)

Chém (6 đòn), bị đánh (lùi / tới), RÚT DAO (52 bước) + ĐỨNG THỞ (lặp), nhảy – đỉnh – rơi – tiếp đất, nhảy tường, lướt, bám / trượt tường. Cùng rig, mảnh, tỉ lệ
112 px, quy ước sheet 2x của `../rig-v4/` (không sửa gì trong rig-v4). Mọi số tick lấy từ `game/demo.html` (kiểm tự động khi dựng).
Số đo, bảng trạng thái ↔ khung, câu hỏi: **`game/kiem-thu-chem-nhay/GHI-CHU.md`** + bản mới **`game/kiem-thu-chem-nhay-v2/GHI-CHU.md`**.

| File | |
|---|---|
| `sprite/lam-hanh-dong-2x.png` + `.json` | 87 khung (27/10: Lam không chóp, tường quay lưng, rút dao + thở) cắt sát, mỗi khung có neo chân (ax, ay); `don.atkN.khung_theo_atkT`, `khac`, `khop_hop_don`, `hieu_ung` |
| `gif/*-lon.gif` | cỡ lớn, hộp đòn đỏ lúc bật, hộp quái thử, atkT |
| `gif/*-112px.gif` | đúng 112 px logic 1:1 (LANCZOS, không nearest) |
| `code/tu_the_hd.py` | **mốc tư thế** (nguồn chỉnh sửa) · `anim_hd.py` bảng tick + đặt hiệu ứng · `dung_hd.py` dựng sheet · `gif_hd.py` GIF · `xem.py` ảnh xem nhanh |

Chạy: `cd code && python3 -B dung_hd.py && python3 -B gif_hd.py`
