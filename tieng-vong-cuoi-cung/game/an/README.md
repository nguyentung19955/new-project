# game/an – Vật phẩm ẩn + Nhiệm vụ ẩn (phiên "an")

| File | Việc |
|---|---|
| du-lieu.json | Danh sách bí mật + nhiệm vụ ẩn + thành tựu của mọi vùng. BẢN NHÁP chờ ChatGPT chốt (docs/an/cau-hoi-chatgpt.md). |
| an.js | Logic thuần (không vẽ): nhận sự kiện → phát hiện bí mật, lộ/xong nhiệm vụ ẩn, thành tựu, phần thưởng chờ. Chạy cả Node. Lưu riêng khoá `tvcc-an`. |
| moc-vung-1.js | Móc vào Vùng 1. **Mặc định TẮT.** Bật thử: `game/vung-1/index.html?an=1` (thêm `&an_moi=1` để xoá tiến độ bí mật). Chỉ đọc trạng thái Vùng 1; thông báo bằng dòng chữ có sẵn; nút "Nhật Ký" trong bảng Chuông Lưu. |

## Thêm bí mật / nhiệm vụ cho vùng mới
Thêm mục vào `du-lieu.json` (trường `vung` = id vùng, vd `vung-2`), rồi vùng đó gửi sự kiện: `MocAn`-kiểu móc riêng hoặc gọi `BiMat.tao(...).suKien(ev, the)`.
Sự kiện: `vao-phong`, `nhat` (id vật phẩm), `vo-tuong` (phòng, cột, hàng), `cham-o` (ô `G`), `bi-danh`, `ha-trum`, `dung-im` (giây), `kiem`.

Điều kiện (`dieu_kien` của bí mật, `lo`/`xong` của nhiệm vụ):
`{"nhat":"P04-tang-mau"}` · `{"dem":{"loai":"the_ten","so":4}}` · `{"co":"ha_trum:vung-1"}` (cờ lưu chung) · `{"bi_mat":"id"}` · `{"nv_xong":"id"}` ·
`{"vao_phong":"P01"}` · `{"vo_tuong":{"phong":"P02","cot":13,"lech":0}}` · `{"cham_o":{"phong":"P06","o":"G"}}` · `{"dung_im":{"phong","cot","hang","ban_kinh","giay"}}` ·
`{"trum_sach":"vung-1"}` (hạ trùm không trúng đòn – phòng trùm khai ở `phong_trum`) · ghép `tat_ca` / `mot_trong` / `khong`.

Phần thưởng (`thuong`): `manh_am` (so), `ky_uc` (id → game/luu-chung.js), `am_diem` (nguon → Hệ thống đồ, chỉ khi `?hethong=1`/bật), `thanh_tuu` (id),
`truyen`, `am_phu`, `dong_co` (chưa có hệ thống/nội dung → GIỮ CHỜ, trao sau, không mất).
Luật hình: mục có `"cho_chatgpt": true` hoặc thiếu ảnh trong `can_anh` → tự TẮT. Không vẽ tạm bằng code.

Kiểm thử: `node tools/an/kiem-thu-logic.js` ; `(python3 -m http.server 8765 &) ; node tools/an/kiem-thu-vung1.js`
