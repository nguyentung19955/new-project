# Bản lưu cũ để kiểm thử (F2 bảo vệ bản lưu)

Mỗi tệp: `{ "_mo_ta", "save" (bản lưu nguyên văn như trong localStorage linhkhi_save_v1), "mong" (điều phải giữ sau khi nạp) }`.
`node game/tests/luu_an_toan.test.js` nạp từng bản qua đường nạp thật (G.loadSave), kiểm không lỗi và không mất tiến trình
(vàng, sao ải, cấp, cấp Luyện, trang phục, Page Scrap, trường lạ), lưu rồi nạp lại không đổi, và bản đã nâng cấp vẫn đọc được bằng mã cũ (`?luucu=1`).

Đổi cấu trúc bản lưu (thêm bước nâng cấp `G.luuAT.BUOC`) thì THÊM một tệp ở đây cho dạng bản lưu trước đó, đừng sửa tệp cũ.
