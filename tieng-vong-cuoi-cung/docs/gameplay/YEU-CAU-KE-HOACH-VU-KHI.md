Bạn là game designer kiêm lập trình viên game 2D HTML5 Canvas. Hãy đọc code hiện tại của “Tiếng Vọng Cuối Cùng” và lập kế hoạch hệ thống 4 vũ khí cùng tiến trình nâng cấp để tôi duyệt.

Bước này CHỈ phân tích và lập kế hoạch, chưa sửa code, chưa publish.

ĐỊNH HƯỚNG
- Metroidvania thiên chiến đấu, khám phá, săn đồ và nâng cấp.
- Mỹ thuật “Cổ tích chuông tàn”: huyền bí, cổ xưa, ngầu, có sức mạnh.
- HTML5 Canvas, logic 960×540, chơi chủ yếu bằng cảm ứng trên iPhone ngang.
- Asset gen bằng ChatGPT, animation cutout bằng code.
- Không thêm hàng loạt nút hoặc combo tổ hợp phức tạp.
- Tiếng Vọng là kỹ năng chung của Lam, giữ vai trò đặc trưng.
- Chưa thay cơ chế ghi/phát lại hiện tại nếu chưa được duyệt.

BỘ VŨ KHÍ ĐÃ CHỐT
Có 4 món, bỏ Chùy Chuông khỏi bộ chính:

1. ÂM ĐAO
- Hình kiếm âm thoa.
- Đánh nhanh, tầm vừa.
- Âm nhận kéo dài thêm khỏi lưỡi vật lý; phải nhìn thấy rõ phần có sát thương.
- Thử tầm nối dài thêm khoảng 25–35%, không coi đây là thông số đã cân bằng.
- Không biến mọi đòn thường thành đạn bay xuyên màn.
- Hướng kỹ năng: Dư Âm, vết chém vang lại sau một nhịp ngắn.
- Vai trò: linh hoạt, bám mục tiêu, sát thương trực tiếp.

2. XÍCH CHUÔNG
- Phóng chuông thẳng ra trước rồi thu về, không quay vòng tròn mặc định.
- Hướng kỹ năng: Hồi Chấn, chủ động thu sớm và đánh trên đường về.
- Có thể kéo nhẹ địch nhỏ; địch lớn chỉ nhận phá thế thủ.
- Mỗi mục tiêu chỉ trúng số lần xác định ở lượt đi và lượt về.
- Có rủi ro khi hụt đòn và chờ thu xích.
- Chưa thêm móc địa hình hoặc kéo Lam.
- Vai trò: kiểm soát khoảng cách, đánh theo tuyến.

3. LIỀM CHUÔNG
- Quét cung rộng, chậm hơn Âm Đao.
- Hướng kỹ năng: Thu Âm, để dấu chuông nứt trên địch rồi kích hoạt làm dấu vỡ.
- Dấu vỡ gây chấn động/phá thế thủ.
- Có thể mở hiệu ứng thu năng lượng khi hạ địch mang dấu.
- Bản đầu tối đa một dấu trên mỗi mục tiêu, không thêm thanh tài nguyên riêng.
- Vai trò: đánh nhóm, chuẩn bị và thu hoạch.

4. TRƯỢNG VỌNG
- Đánh thường bằng âm cầu.
- Hướng kỹ năng: Chiêu Hồn, tiếng chuông gọi ký ức người đã khuất.
- Triệu hồi một Vệ Hồn Chuông thực hiện hành động định sẵn rồi tan.
- Bản đầu không làm AI đồng đội tìm đường hoặc theo Lam khắp màn.
- Phân biệt với bóng Tiếng Vọng: Vệ Hồn không tái hiện bản ghi.
- Ban đầu Vệ Hồn không giữ công tắc và không kích hoạt Cộng hưởng.
- Vai trò: hỗ trợ, triệu hồi, tạo áp lực gián tiếp.

Các kỹ năng trên là hướng thiết kế. Hãy chỉ ra chỗ trùng nhau, quá tốn công hoặc khó dùng trên cảm ứng trước khi chốt.

YÊU CẦU MỚI: CẤP NÂNG VŨ KHÍ VÀ MỐC MỞ SKILL

Tôi muốn:
- Những cấp thường tăng chỉ số và sức mạnh của những kỹ năng đã có.
- Tới mốc lớn sẽ mở kỹ năng hoặc hành vi chiến đấu mới.
- Sau khi mở một kỹ năng, các cấp tiếp theo có thể củng cố chính kỹ năng đó.
- Có thể tăng sát thương, sức phá thế thủ, chí mạng, sức mạnh Dư Âm, hiệu quả dấu ấn hoặc sức mạnh triệu hồi tùy vũ khí.
- Không phải cấp nào cũng mở một nút hoặc một kỹ năng mới.

Hãy đề xuất một đường tiến trình dễ hiểu. Có thể dùng thang 10 cấp và các mốc lớn ở cấp 1/4/7/10 để làm phương án thảo luận, nhưng được quyền đề xuất ít cấp hoặc mốc khác nếu hợp lý hơn. Đừng coi ví dụ này là thiết kế đã chốt.

Mỗi vũ khí chỉ nên có:
- Một bộ đánh thường.
- Một kỹ năng chủ động đặc trưng.
- Các mốc sau phát triển kỹ năng đó hoặc mở biến thể/passive có ý nghĩa.
- Không có bốn kỹ năng chủ động cần bốn nút riêng.

Ví dụ về NHỊP TIẾN TRÌNH, không phải bộ số bắt buộc:
- Mốc đầu: nhận vũ khí và đánh thường.
- Các cấp giữa: tăng sức mạnh nền vừa đủ.
- Mốc lớn: mở kỹ năng đặc trưng.
- Các cấp sau: cải thiện kỹ năng đã mở.
- Mốc lớn tiếp: thêm một cách tương tác mới.
- Mốc cuối: hoàn thiện bản sắc vũ khí.

YÊU CẦU THIẾT KẾ CHI TIẾT

A. NÂNG CHỈ SỐ PHẢI CÓ Ý NGHĨA
- Không chia quá nhiều cấp chỉ tăng 1–2% khó cảm nhận.
- Mỗi cấp chỉ nên trình bày 1–2 thay đổi chính.
- Không tăng đồng thời sát thương, tốc độ, tầm, chí mạng và hồi tài nguyên ở mọi cấp.
- Tăng sức mạnh nhưng vẫn giữ nhược điểm riêng của từng vũ khí.
- Không dùng tăng tầm/tốc độ quá mức làm hỏng animation, khoảng đánh và thiết kế màn.
- Những mốc thay đổi lớn phải có phản hồi hình ảnh/âm thanh rõ.
- Không đổi màu hoặc hình dáng vũ khí ở mọi cấp; chỉ cân nhắc 2–3 bậc ngoại hình lớn để tiết kiệm asset.

B. CHÍ MẠNG
- Đề xuất vai trò của tỷ lệ chí mạng và sát thương chí mạng, có giới hạn.
- Không để mọi vũ khí đều phải xây cùng một kiểu chí mạng.
- So sánh chí mạng ngẫu nhiên với chí mạng có điều kiện:
  đánh sau né sát đòn, đánh dấu Thu Âm, đánh vào điểm yếu, hoặc phối hợp bóng.
- Có thể dùng ngẫu nhiên cho sát thương thưởng, nhưng phá giáp/bắt buộc vượt màn không được phụ thuộc may rủi.
- Không nhân chí mạng, Cộng hưởng, Dư Âm và dấu ấn thành chuỗi sát thương mất kiểm soát.
- Nêu thứ tự tính sát thương và giới hạn proc.
- Định nghĩa rõ bóng dùng chỉ số nào và thời điểm chốt trang bị của bản ghi.

C. TÁCH CÁC NGUỒN TIẾN TRIỂN
Phân biệt:
1) Nâng vũ khí: tăng sức mạnh và mở mốc kỹ năng.
2) Nâng Lam: sinh lực/tài nguyên hoặc năng lực chung.
3) Âm Phù: lựa chọn lối chơi có đánh đổi.
4) Khám phá/boss: nhận vũ khí, vật liệu đặc biệt hoặc quyền mở mốc.

Không để cả bốn hệ thống cùng cộng những chỉ số giống nhau.
Đề xuất mốc lớn gắn với khám phá hoặc boss; các cấp thường dùng vật liệu phổ thông.
Tránh farm quái lặp lại quá lâu.
Chưa thêm độ hiếm ngẫu nhiên, đồ rác, reroll hoặc rơi mất cấp vũ khí khi chết.

D. GIỮ ĐỘNG LỰC ĐỔI VŨ KHÍ
- Không khiến một vũ khí mới nhặt được yếu đến mức không ai muốn thử vì vũ khí cũ đã nâng nhiều cấp.
- So sánh các cách hỗ trợ đổi vũ khí:
  cấp nền chung, chi phí bắt kịp thấp, hoặc nâng theo bậc tiến trình.
- Chọn một cách đơn giản phù hợp bản đầu.
- Dự kiến mang tối đa hai vũ khí và đổi bằng một nút, thay bộ trang bị tại điểm nghỉ; kiểm tra có hợp UI hiện tại không.
- Quy định đổi vũ khí khi đang đánh, đang phóng xích, đang có Vệ Hồn và đang phát bóng.
- Không cho đổi vũ khí để xóa thời gian hồi hoặc nhân đôi triệu hồi.

E. ĐIỀU KHIỂN VÀ KỸ THUẬT
- Kiểm tra bộ nút hiện tại trước khi đề xuất cách kích hoạt skill.
- Không dùng cùng một thao tác cho nhiều hành động theo ngữ cảnh khó đoán.
- Nếu giữ nút Đánh để dùng skill, không được làm nhát đánh thường phản hồi chậm; giải thích cách giải quyết.
- Kỹ năng dùng theo thời gian mô phỏng, không phụ thuộc FPS render.
- Giữ replay xác định, hitbox tách ảnh động.
- Kiểm tra hitstop, sát thương nhiều mục tiêu, một hitbox trúng nhiều lần, projectile và summon.
- Dữ liệu chỉ số, cấp và mốc tập trung trong cấu hình, không rải điều kiện khắp code.
- Phân biệt thông số nền, cộng từ nâng cấp và cộng từ Âm Phù.
- Nêu cách lưu game, tải save cũ và kiểm tra dữ liệu.
- Không viết lại engine nếu có thể mở rộng cấu trúc hiện tại.

ĐẦU RA CẦN GỬI TÔI DUYỆT

1. Tóm tắt những gì xác minh được từ code và những gì đang giả định.
2. Bản sắc, ưu/nhược và vòng đánh của từng vũ khí.
3. Bảng tiến trình RIÊNG cho từng vũ khí:
   cấp | điều kiện/chi phí | tăng chỉ số hoặc mở skill | thay đổi khi chơi | asset cần thêm.
4. Giải thích vì sao chọn số cấp và các mốc.
5. Thiết kế chí mạng, Cộng hưởng và các hiệu ứng phụ, có ví dụ tính sát thương.
6. Cách kiếm vật liệu, mở mốc và hỗ trợ vũ khí mới bắt kịp.
7. Phương án điều khiển cảm ứng và đổi vũ khí.
8. Cấu trúc dữ liệu đề xuất dựa trên code thực tế.
9. Rủi ro, chi phí animation/VFX và những phần nên hoãn.
10. Kế hoạch prototype nhỏ:
    - Làm Âm Đao trước.
    - Có đánh thường, một mốc mở skill và một cấp tăng sức mạnh skill đó.
    - Đối chiếu trước/sau trong cùng phòng đánh thử.
    - Sau khi duyệt mới làm Xích Chuông, rồi Liềm, cuối cùng Trượng.

Chưa triển khai đủ bốn vũ khí hoặc toàn bộ cấp.
Không chỉ liệt kê nhiều skill cho hấp dẫn; hãy thiết kế tiến trình có nhịp, ít thao tác, dễ cân bằng và thực sự tạo động lực khám phá.