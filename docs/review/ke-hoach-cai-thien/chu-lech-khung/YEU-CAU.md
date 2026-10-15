# Chữ lệch khung — chỉnh hết

Chủ game: "Chữ lệch khung không nên có, chỉnh hết chỗ chữ bị lệch khung". Vừa thay nhiều khung bằng ảnh (khung-gd-con c0fd57fb:
gd-khung-nho, gd-dai-thong-bao, gd-o-con, gd-the-nho, gd-khung-vach-lk, gd-thanh-cuon, gd-khung-canh-bao, gd-the-sap-co, gd-khung-mau-quai;
và các gd-* có trước: gd-khung-bang, gd-khung-thoai, gd-nut-*, gd-the-*, gd-thanh-tren...). Viền ảnh dày/mỏng khác viền code cũ → chữ dễ
lệch tâm, tràn viền, đè núm góc, cắt mất chữ, tràn ra ngoài khung, nhất là tiếng Anh (chữ dài hơn) và màn hình hẹp.

Làm:
1. Rà MỌI chỗ vẽ chữ trong / trên khung: nút (T.btn, T.sbtn, T.tab, T.card), bảng (T.panel), hộp thoại (T.dialog + thẻ tên), T.plate,
   T.toast/toastFit, T.inset, chip kháng/yếu, thẻ "Sắp có", thẻ ải (gd-the-*), thanh trên, HUD, hành trang, làng, nâng cấp, ép đồ,
   chưởng, lực chiến, bảng vàng, ải ngày, truyện, đăng nhập/lưu mây (chỉ phần vẽ chữ, KHÔNG đụng logic đăng nhập).
2. Quy tắc: chữ nằm TRONG vùng lòng khung (trừ viền ảnh `vien` + 2 điểm đệm), căn giữa đúng cả ngang lẫn dọc (theo đường cơ sở thật của
   font), không đè núm góc / hoa văn viền. Chữ dài thì: thu cỡ chữ tới mức tối thiểu đọc được → nếu vẫn dài thì xuống dòng (nơi có chỗ)
   → cuối cùng mới cắt "…". Làm một hàm chung (ví dụ T.chuTrongKhung) dùng lại cho mọi nơi thay vì sửa lẻ.
3. Kiểm cả tiếng Việt và tiếng Anh (ngon_ngu_en.js), khung 480×270 và các tỉ lệ màn hình hẹp/dọc mà engine hỗ trợ.
4. Ảnh soát: dựng ảnh TĨNH các màn hình giao diện (render offline từng khung + chữ thật, cả VI và EN) để đo hộp chữ so với lòng khung;
   ghi danh sách chỗ lệch trước/sau. KHÔNG chơi thử game. Kết quả: xem-chu.png (trước | sau các chỗ đã sửa).
5. Cờ quay lui `?chucu=1`. Không đổi bố cục / vùng chạm trừ khi khung quá nhỏ cho chữ (ghi rõ trong báo cáo).
- node --check, build.py.
Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md cùng thư mục, push, tự dừng.
