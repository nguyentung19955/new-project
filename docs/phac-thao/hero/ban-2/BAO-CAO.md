# Báo cáo phác thảo hero, bản 2

**Vì sao có "bản 2":** khi phiên này đẩy tờ đầu tiên thì nhánh `claude/phac-thao-hero` đã có tờ hướng 1 của một phiên khác chạy cùng lúc với cùng đề bài. Để không đè lên việc của phiên kia, toàn bộ sản phẩm của phiên này nằm riêng trong `docs/phac-thao/hero/ban-2/`, không sửa file nào bên ngoài thư mục này. Bộ ở thư mục cha là của phiên kia, có báo cáo riêng. Điểm khác chính của bản 2: hero vẽ nhìn ngang, quay mặt sang phải như đề bài yêu cầu.

## Danh sách ảnh

- `huong-1-linh-thu.png`: trâu Thợ Rèn, cò Thợ Săn, rùa vàng Thầy Lang, hổ Đô Vật
- `huong-2-roi-nuoc.png`: bốn con rối gỗ sơn bóng, Đô Vật là chú Tễu
- `huong-3-linh-khi-lam-chu.png`: bốn đứa trẻ tinh linh và bốn vũ khí sống quá khổ
- `huong-4-mat-na-hoi-lang.png`: đầu lân, hổ giấy bồi, Ông Địa, mặt quỷ gỗ
- `so-sanh-4-huong.png`: hero hiện tại và bốn hướng trên cùng một tờ

Mỗi tờ hướng có: bốn hero đứng vẽ to, Thợ Rèn lúc đang đánh, vũ khí Thợ Rèn ở bốn mức (thường, Lửa, Độc, Băng), và dải bốn hero ở cỡ thật (phóng 3 lần) trong phòng lấy từ `G.art.bg` của game. Mã dựng nằm trong `nguon/` (chạy `python3 lay_hien_tai.py` rồi `python3 dung.py`).

## Nhận xét thẳng

1. **Hướng 1, Linh thú: mạnh.** Bốn bóng dáng khác hẳn nhau (trâu lùn chắc, cò cao mảnh, rùa tròn, hổ to bè), khác xa hero hiện tại, nhìn ở cỡ thật vẫn rõ. Điểm yếu: con cò chân một điểm ảnh, phần cánh cầm cung còn hơi rối.
2. **Hướng 2, Rối nước: dễ thương nhưng ít phá cách nhất.** Chú Tễu ra rất tốt; Thợ Rèn và Thợ Săn thì vẫn giống "cậu bé chibi mặc áo màu", chỉ khác hero hiện tại ở khớp vàng và nước dưới chân. Gợn nước cũng khó giải thích khi hero đứng trên sàn đá trong phòng.
3. **Hướng 3, Linh khí làm chủ: mới lạ nhất và hợp ý chính của game nhất** (vũ khí có linh hồn, tiến hóa). Kiếm một mắt, cung rồng, bầu thuốc ngủ gật, đôi nắm đấm chiêng đều có tính cách. Điểm yếu thật: bốn đứa trẻ khá giống nhau, vai trò đọc được chủ yếu nhờ vũ khí, mà trong game hero nào cũng đổi được vũ khí; đứa trẻ chỉ cao khoảng 21 điểm ảnh nên vùng trúng đòn cần tính lại.
4. **Hướng 4, Mặt nạ hội làng: màu đậm, đúng không khí lễ hội, nhưng chưa đều tay.** Hổ giấy bồi và Ông Địa ra tốt; đầu lân còn hơi vuông; mặt quỷ dễ bị nhìn thành mặt nạ đô vật nước ngoài, cần thêm chi tiết Việt. Thầy Lang thành Ông Địa thì vui nhưng mất nét "ông lang già".
5. **Công làm đủ hoạt ảnh (hero hiện tại khoảng 100 khung mỗi nhân vật):** rẻ nhất là hướng 4 (thân người, dùng lại được khung xương và phần lớn tư thế hiện có, mặt nạ là khối cứng, chỉ thêm khung cho vải bay) và hướng 2 (thân người, rối cử động cứng nên cần ít khung trung gian). Đắt nhất là hướng 1: bốn bộ xương khác nhau (chân chim, mai rùa, đuôi), gần như vẽ lại toàn bộ, và mũ giáp đang có trong game phải thiết kế lại cho từng con. Hướng 3 nằm giữa: đứa trẻ rất ít khung, nhưng mỗi loại vũ khí (kiếm, búa, cung, giáo) nhân với ba nhánh tiến hóa đều phải có bản "sống" có mắt và biểu cảm; đó cũng là chỗ đáng bỏ công nhất.
6. **Nên bỏ:** hướng 2. Hai trong bốn hero chưa đủ khác hero hiện tại so với lời "muốn phá cách hơn". Nếu tiếc chú Tễu thì đưa Tễu sang làm nhân vật phụ ở làng.
7. **Khuyên chọn:** hướng 3, vì đây là hướng duy nhất làm tạo hình kể luôn ý chính của game. Điều kiện đi kèm: cho mỗi đứa trẻ một nét riêng rõ hơn (dáng mũ, màu, vật cầm tay) để đổi vũ khí vẫn nhận ra vai trò. Nếu muốn an toàn hơn về độ dễ nhận vai trò thì chọn hướng 1 và chấp nhận công hoạt ảnh cao.
8. **Giới hạn của bộ phác thảo này:** đây là hình tĩnh, mỗi hero một tư thế đứng và riêng Thợ Rèn một tư thế đánh; chưa thử chạy, né, trúng đòn, chưa thử trong game thật và chưa thử với mũ giáp. Ước lượng công ở mục 5 là phán đoán từ hình dáng, chưa đo bằng việc làm thử.
