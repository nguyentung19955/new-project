# QUY TẮC HÌNH ẢNH — TURRET MERGE (bắt buộc cho mọi session)

1. **CẤM vẽ tay / vẽ bằng code** cho mọi hình người chơi nhìn thấy: khung, nút, bảng, huy hiệu, icon, ngọc, đèn, thanh, ruy-băng, đạn, tia, hiệu ứng, nền, chữ trang trí… Không dùng canvas path / CSS gradient / border / box-shadow / emoji / ký tự để *giả* một vật thể.
2. **Bắt buộc gen bằng ChatGPT**: session cần hình mới thì viết prompt NGẮN (tiếng Anh, lưới ô, nền magenta #FF00FF đặc, "same style as attached", không chữ) vào `docs/demo-hop-tuong/HINH-VE-CODE-AUDIT.md` (hoặc file prompt riêng) rồi báo session điều phối gen; trong lúc chờ chỉ dùng ảnh có sẵn.
3. **Code chỉ được vẽ**: con số/chữ (DOM/canvas text), mức đầy của thanh (cắt/scale ảnh), vị trí/xoay/phóng/mờ của ảnh PNG, và hình học UI thuần chức năng không thấy như vật thể (vùng chạm, mặt nạ cắt).
4. Hình tròn phải tròn tuyệt đối; không viền màu thừa chồng lên khung ảnh đã có (vd. khung độ hiếm đã đủ, không thêm viền màu mảnh bên trong); huy hiệu/nhãn không che chi tiết của khung (ngọc, vương miện…).
5. Mọi hình mới: cắt khoá magenta, thu về đúng cỡ dùng (2× DPR), giữ bản gốc ở `docs/demo-hop-tuong/thap-art/`.
