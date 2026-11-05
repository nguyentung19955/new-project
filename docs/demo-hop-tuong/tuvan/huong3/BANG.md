# Hướng nhìn quái / tinh anh / trùm — kiểm kê

✅ có ảnh · ⏳ đã có prompt chờ gen (CAN-VE.json hoặc đơn q_p6) · ↔ dùng dải trước + nghiêng (tạm) · ⇋ trái = lật dải phải

| id | loại | trước (đi xuống) | ngang (phải) | trái | sau (đi lên) | đánh (tung chiêu, nhìn bàn) |
|---|---|---|---|---|---|---|
| bo | thường | ✅ | ✅ | ⇋ | ✅ | không có chiêu |
| bay | thường (bay) | ✅ | ✅ | ⇋ | ✅ | không có chiêu |
| bay_bang | thường (bay) | ✅ | ✅ | ⇋ | ⏳ ↔ | không có chiêu |
| tach | thường (tách → nho) | ✅ | ✅ | ⇋ | ✅ | không có chiêu |
| khong_lo | TINH ANH | ✅ | ⏳ ↔ | ↔ | ⏳ ↔ | không có chiêu |
| que_tach | TINH ANH | ✅ | ✅ | ⇋ | ⏳ ↔ | không có chiêu |
| mad_crown | trùm cũ | ✅ | ⏳ ↔ | ↔ | ⏳ ↔ | ✅ khung 3 (dải 4 cũ) |
| freezer | trùm cũ | ✅ | ✅ | ⇋ | ✅ | ✅ khung 3 (dải 4 cũ) |
| janus | trùm cũ | ✅ | ✅ | ⇋ | ⏳ ↔ | ✅ khung 3 (dải 4 cũ) |
| joker_king | trùm cũ | ✅ | ⏳ ↔ | ↔ | ⏳ ↔ | ✅ khung 3 (dải 4 cũ) |
| nightmare | trùm cũ | ✅ | ✅ | ⇋ | ✅ | ✅ khung 3 (dải 4 cũ) |
| octopus | trùm cũ | ✅ | ✅ | ⇋ | ⏳ ↔ | ✅ khung 3 (dải 4 cũ) |
| hive | trùm mới | ✅ | ✅ | ⇋ | ✅ | ✅ dải 16 |
| jammer | trùm mới | ✅ | ✅ | ⇋ | ✅ | ✅ nhìn bàn (dải trước) + hiệu ứng rời fx_trum |
| prism | trùm mới | ✅ | ⏳ ↔ | ↔ | ⏳ ↔ | ⏳ (q_p6 fx) |
| twin_core | trùm mới | ⏳ mượn joker_king | ⏳ ↔ | ↔ | ⏳ ↔ | ⏳ (q_p6 fx) |
| patcher | trùm mới | ⏳ mượn octopus | ⏳ ↔ | ↔ | ⏳ ↔ | ⏳ (q_p6 fx) |
| leech | trùm mới | ⏳ mượn nightmare | ⏳ ↔ | ↔ | ⏳ ↔ | ⏳ (q_p6 fx) |

Tờ ảnh: `bang.png` (cột: trước · ngang · sau · đánh; ô trống = chưa có). Dải khung khi đi thật mỗi chế độ: `tong_solo.jpg`, `tong_coop.jpg`, `tong_pvp.jpg`; số liệu: `ketqua.json` (tools/thap-kt-huong.js).

Logic (thap/js/quaianim.js, mọi chế độ): ngang → dải ngang (trái: dải trái thật nếu có, không thì lật); lên → dải sau; xuống → dải trước;
trùm: nhìn màn hình 0,9 s lúc vào + lúc báo chiêu (dải đánh 16 khung nếu có, không thì khung 3 dải 4 cũ); xong quay lại hướng làn. Chưa có ảnh hướng → dải trước nghiêng ≤ 8° (tạm).
