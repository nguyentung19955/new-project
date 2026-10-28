
Duyệt bắt đầu P0-B như một prototype riêng. Không cần chờ đủ người thử iPhone mới viết phần so sánh Vọng, nhưng chưa ghép vào game chính hoặc chốt thao tác giữ Chém trước khi thử máy thật.

Tôi đã đọc hai ghi chú, xem ảnh từng pha và lấy mẫu khung hình từ bốn video. Các số tick, sát thương và thời lượng chớp là Claude báo cáo, chưa được tôi xác minh bằng code/log gốc.

1. Chốt năm câu Âm Đao

Câu hỏi	Quyết định	Lý do
Giảm máu Chuông Gỗ 40 → 36?	Chưa đổi mặc định. Giữ 36 như biến thể thử	Không nên chỉnh riêng máu quái để chứng minh một cấp nâng có ích. Cấp 2 có thể giúp ở địch khác hoặc khi phối hợp bóng
Kéo dài lưỡi và tăng tầm 95–100?	Thử kéo dài lưỡi trước, giữ tầm 90	Ngoại hình và tầm đánh là hai biến khác nhau. Chưa có bằng chứng cần tăng tầm
Dùng hộp chém vang theo nhát 3?	Đồng ý tạm	Hộp khớp hình tốt hơn giữ hộp cao nhưng không có động tác tương ứng. Ghi rõ là cú quét thấp
Dash hủy trước hộp bật có hoàn hồi chiêu?	Có. Bắt đầu hồi khi hộp/vết thực sự xuất hiện	Đã hủy toàn bộ tác dụng thì chưa nên mất cả hồi chiêu. Khi hộp đã bật, dash không hoàn
Vết lấy cả sau lưng?	Chỉ phía trước	Vết là bẫy người chơi chủ động đặt. Phần sau lưng dễ tạo trúng bất ngờ; đòn chém chính vẫn có thể giữ hộp hiện tại
Lưỡi dài hơn phải vẫn đọc được hai nhánh âm thoa ở 112 px. Không cần kéo dài chỉ để giống kiếm lớn; giữ một đoạn âm nhận ngắn nhưng rõ là được.

2. Những điểm cần sửa hoặc kiểm tra trong ghi chú

Cách so độ nhạy đang đổi quá nhiều thứ.
So index.html?p0=0 với Âm Đao mới đồng thời đổi nhịp, hình vũ khí và tầm. Muốn kết luận nhịp nhanh hơn, hãy so P0-A cũ/mới cùng dao. Sau đó mới so hai ngoại hình vũ khí.

Giữ nút theo thời gian thật cần luật pause rõ.
Đếm xuyên hitstop là lựa chọn có thể thử, nhưng không được tiếp tục tích khi mở cài đặt, mất focus hoặc chuyển tab. Khi quay lại không được tự tung skill. Log cần phân biệt thời gian giữ thực với tick mô phỏng; video dựng từng tick chưa xác nhận được cảm giác giữ trên Safari.

“Mép âm nhận chạm cạnh hộp” chưa chứng minh toàn bộ hitbox khớp hình.
Một tia chạm mép hình chữ nhật không giải thích các góc trên/dưới còn lại. Cần thử mục tiêu ở mép trên, mép dưới và phía sau: nơi nào gây sát thương phải có đường quét/VFX hợp lý.

Đòn pogo chưa đo âm nhận.
Chưa gọi toàn bộ bộ đòn “khớp 100%”. Đo nốt hoặc ghi rõ phạm vi mới đạt.

Số 161/105/71 tick chỉ mô tả một kịch bản bot.
Ghi chú có dời quái và đặt lại hồi chiêu để quay cảnh. Điều này hợp kiểm tra chức năng, nhưng chưa chứng minh cấp 4 mạnh hơn bao nhiêu trong trận tự do. Bổ sung một lượt chơi không can thiệp trạng thái, giữ nguyên đối thủ và điều kiện.

Cấp 4 tăng cả rung, tiếng và kích thước nổ: có thể giúp cảm nhận, nhưng không được làm VFX trông đánh xa hơn hitbox. Tách hiệu ứng trang trí với vùng gây sát thương.

3. Bọ bản 4: đã bỏ được hai kiểu chuyển động gây hài

Từ ảnh pha:

Quay đầu: không còn bóp ngang thành “trang sách”. Đổi hướng giữa tư thế rụt đầu hợp lý hơn.
Vỡ mai: sụp sấp và lộ bụng hợp sức nặng hơn lật ngửa giãy chân.
Chết: khuỵu, mai tách rồi tan vụn phù hợp chất gỗ mục hơn văng bật.
Tạm duyệt hình bản 4, chưa cần thêm một vòng sửa lớn. Còn ba điểm nhỏ:

Bỏ ba chấm quay trên đầu trong bản mỹ thuật sạch; dùng tư thế bất động, bụng lộ và một dấu nứt là đủ.
Sửa đầu lún đất 1–2 px, tránh cảm giác xác xuyên sàn.
Ghi chú nói xác biến mất sau 210 bước ≈ 3,5 giây. Không cần đổi ngay, nhưng phải bảo đảm xác không giữ hitbox gây hại, không chặn nhặt đồ và không che dấu báo của con khác.
Bước lật gương t11→t12 vẫn là thay silhouette tức thì; ảnh pha chỉ xác nhận đã bỏ co dẹt, chưa bảo đảm hoàn toàn không thấy “bật” khi chạy thực trên màn 120 Hz.

Luật Bọ mất mai bị khựng liên tục cũng cần theo dõi. Chưa thêm giáp chống ngắt ngay: phá mai vốn nên là phần thưởng. Nếu Bọ luôn chết trước khi dậy thì có thể chấp nhận với quái thường; không bắt mọi con phải trình diễn đủ bộ đòn.

4. Cho P0-B chạy, nhưng giữ phép so sánh sạch

Chốt trước khi làm:

Hai cấu hình A/B cùng phòng, cùng địch, cùng cấp Âm Đao và chỉ số bóng.
Lượt chính dùng cấp 1, chưa có Dư Âm; tránh lẫn lợi ích skill vũ khí với lợi ích Vọng.
So A/B cùng miễn phí trước để đánh giá cách gọi bóng; sau đó mới thử tài nguyên của Vọng Chiến. Nếu A miễn phí còn B mất nấc ngay từ đầu, kết quả sẽ trộn thao tác với chi phí.
Dùng B+C trước; phòng Bọ là lượt kiểm tra tiếp theo.
Bọ phải chuyển sang thang máu/Thế ×10. Không bê nguyên máu 4 rồi dùng sát thương bóng tối thiểu 1: như vậy bóng vẫn mạnh bằng Lam trên Bọ.
Đo thời gian từ bấm V tới đòn đầu của bóng, tính cả trường hợp đoạn ghi mở đầu bằng đứng yên.
Thử iPhone P0-A/Âm Đao tiến hành song song; kết quả đó quyết định điều khiển cuối cùng.
Gửi Claude:

Duyệt bắt đầu P0-B trên trang riêng, chưa ghép game chính.

Âm Đao:
- Giữ Chuông Gỗ 40 máu; 36 chỉ là biến thể thử.
- Thử kéo dài lưỡi để rõ âm thoa, giữ tầm 90 trước; chưa tăng đồng thời tầm.
- Duyệt hộp chém vang quét thấp theo hình nhát 3 làm tạm.
- Hồi chiêu bắt đầu khi hộp/vết xuất hiện; hủy trước đó không mất hồi.
- Vết chỉ đặt phía trước Lam.
- Giữ pause/mất focus không được tích giữ nút hoặc tự tung khi quay lại.
- Kiểm toàn vùng hộp, không chỉ điểm tia chạm cạnh; đo nốt âm nhận pogo.
- So độ nhạy bằng P0-A cũ/mới cùng vũ khí.
- Thêm một lượt chiến đấu không dời quái hoặc đặt lại hồi chiêu để đánh giá nâng cấp.

Bọ:
- Tạm duyệt động tác bản 4, chưa gen lại.
- Bỏ chấm quay trong bản sạch, sửa đầu lún đất.
- Xác không gây hại, không cản nhặt đồ hoặc che trận tiếp theo.
- Chưa thêm chống ngắt sau mất mai nếu chưa thấy cần.

P0-B:
- Cấp 1, cùng phòng B+C, cùng quái/chỉ số ở A và B.
- So hai cách gọi bóng cùng miễn phí trước, rồi mới thử chi phí tài nguyên.
- Sau đó kiểm trên phòng Bọ.
- Đưa Bọ sang thang ×10 và hệ số bóng chung.
- Log độ trễ gọi bóng tới đòn đầu, số lần gọi hụt tác dụng và Cộng hưởng.
- Thử iPhone P0-A/Âm Đao song song; chưa kết luận điều khiển đạt từ Chromium.
