Bản V2 đã đủ rõ để cho Claude bắt đầu P0-A sau khi sửa vài luật nhỏ dưới đây. Bọ Vỏ Mộc giữ được, cỡ 74 px hợp lý; chưa cần gen lại.

Tôi đã đọc kế hoạch gameplay V2, các phần liên quan trong kế hoạch vũ khí, xem ảnh và lấy khung hình ở nhiều thời điểm từ ba video. Chưa chơi trang thử hoặc kiểm tra trên iPhone, nên chưa chốt độ mượt, độ nhạy hay âm thanh.

1. Bốn quyết định về kế hoạch
Câu hỏi	Chốt đề xuất
Giao diện dữ liệu và công thức đủ để bắt đầu?	Đủ cho P0-A, sửa lỗi định danh đòn replay bên dưới trước
Nhát làm vỡ vỏ không gây máu?	Đồng ý làm luật thử: “Keng → vỡ → đánh vào phần mềm”. Nhưng không coi đây là cách bảo đảm đối xứng hoàn toàn
Tinh anh đầu dùng Chuông Gỗ biến thể?	Đồng ý. Dùng hai đòn, khác rõ nhịp; chưa cần Người Gác Câm
Bọ vào P0-B hay P0-C?	P0-B, nhưng là bài thử thứ hai. So Vọng A/B trên B+C trước, sau đó kiểm tra kết quả trên phòng Bọ


Không cần chờ hoàn thiện mọi vũ khí mới làm buffer và nhịp đánh.

2. Hai điểm kỹ thuật vẫn cần sửa

Replay chưa được tạo mã đòn mới mỗi tick.
Kế hoạch vũ khí ghi “mỗi hộp một D bóng mới”. Nếu hiểu theo nghĩa mỗi khung mô phỏng tạo lại D và xóa daTrung, một hộp bật tám tick có thể đánh mục tiêu tám lần.

→ Mỗi lần phát bóng cần ánh xạ:

mã đòn gốc → mã đòn replay, giữ nguyên mã và danh sách đã trúng suốt vòng đời đòn. Lượt đi/lượt về của xích được tách khi luật cho phép.

Luật vỡ vỏ chưa bảo đảm tổng sát thương đối xứng.
Nếu nhát đầu vừa đủ phá Thế, nhát thứ hai có thể đánh vào vỏ đã vỡ. Đổi thứ tự Lam/bóng vẫn có thể đổi tổng máu vì sát thương hai bên khác nhau.

→ Không cần ép mọi tình huống khác thời điểm cho kết quả giống hệt. Cần bảo đảm:
- Phần thưởng Cộng hưởng dùng cùng công thức.
- Các hit trong cùng tick không phụ thuộc thứ tự duyệt mảng.
- Hit ở tick sau được hưởng trạng thái mới một cách nhất quán.
Ngoài ra, tài liệu nói VFX bật cùng tick hộp đòn nhưng lại đề xuất vetBatDau = su − 1. Claude cần chỉ rõ quy ước đếm tick, không chỉ đổi số theo phép trừ.

3. Tám quyết định về Bọ Vỏ Mộc
Câu hỏi	Khuyến nghị
Cao 74 px?	Giữ. Thấp và bè tạo silhouette khác Lam, phù hợp địch giáp mặt đất
Chém mai có mất chút máu?	Không. Mai mất Thế, bụng mất máu. Luật này dễ hiểu
Mai 4, máu 4, choáng 3 giây?	Giữ 4/4 để thử, giảm choáng ban đầu còn 2 giây. Ba giây dễ đủ giết nó mà không cần quyết định tiếp
Cộng hưởng vào mai?	Phá mai + sát thương thưởng Cộng hưởng, không thêm một khoản “3 máu” riêng. Dùng công thức chung, tránh gần như giết ngay Bọ 4 máu
Lam bị dội lùi khi chém mai?	Có, nhẹ. Thử 3–5 px tổng, không khóa điều khiển; không đẩy Lam vào hố hoặc xuyên vật
Bỏ dấu “!”?	Chưa bỏ. Cho tắt bằng debug để so sánh. Chỉ bỏ khi người mới đọc được động tác khép mai, cào chân và chuẩn bị húc
Chạm thân lúc đi bộ mất máu?	Không trong bản thử. Đòn húc chủ động mới gây sát thương; nếu không, vòng ra đánh bụng dễ thành mất máu vì chạm chân
Tăng viền sáng?	Không tăng toàn bộ. Chỉ nâng tương phản đầu, bụng mềm và dấu báo đòn


4. Nhận xét hình ảnh

Ở ảnh 960×540, Bọ có hình khối nặng và hợp nền hơn Lam cũ. Tuy nhiên, mai và phần thân đang khá gần màu nhau, nên người chơi có thể nhận ra “một cục giáp” nhưng chưa biết chính xác đánh đâu.

Sửa bằng code trước:
- Nâng sáng bụng phía sau một chút, thiên xám đất nhạt.
- Giữ mai tối, không viền neon.
- Khi bị chặn: tia va chạm nhỏ ngay trên mai.
- Khi trúng bụng: phản ứng co thân và hiệu ứng khác rõ.
- Khi lật: cho thấy mảng bụng mềm đủ lớn.
Những khung lấy từ video cho thấy có trạng thái lật ngửa và đường đánh vòng sau khác với đánh mai. Chưa đủ để kết luận động tác báo húc dễ đọc hoặc hai cách đánh đã cân bằng.

5. Một điểm cần chú ý khi thử Vọng Chiến

Ví dụ trong kế hoạch cho thấy bấm V ở tick 40 nhưng phải tới tick 97 bóng mới chém: gần một giây chờ, vì đoạn ghi còn phần đứng yên đầu đoạn.

Điều đó không sai, nhưng có thể làm tính năng gọi bóng “nhanh” vẫn cảm giác chậm.

→ Trước mắt giữ nguyên replay, log thời gian từ gọi bóng tới đòn đầu tiên. Nếu người thử thấy hụt nhịp, mới so một biến thể bắt đầu từ hành động đánh gần nhất. Đừng tự cắt đoạn ghi trước khi kiểm chứng.

Gửi Claude đoạn chốt này:
Duyệt bắt đầu P0-A trên trang thử riêng, game chính giữ nguyên.

Các quyết định:
- Duyệt nền dữ liệu cho P0-A, không cần làm đầy đủ hệ thống của cả bốn vũ khí ngay.
- Thử nhát thường phá vỏ không gây máu; hit sau mới gây.
- Tinh anh P0-C dùng Chuông Gỗ biến thể hai đòn.
- Bọ vào P0-B như bài kiểm tra thứ hai: so Vọng A/B trên B+C trước, rồi mới thử trên phòng Bọ.

Sửa trước khi triển khai:
1. Mã đòn replay phải bền suốt vòng đời đòn:
   maGoc -> maReplay theo từng lần phát bóng.
   Không tạo D/daTrung mới mỗi tick.
   Kiểm tra hộp bật nhiều tick vẫn chỉ trúng mỗi mục tiêu một lần.

2. Không khẳng định luật phá vỏ đã bảo đảm mọi thứ tự trúng cho cùng tổng máu.
   Phần thưởng Cộng hưởng phải nhất quán.
   Hit cùng tick không được phụ thuộc thứ tự duyệt.
   Hit khác tick xử lý theo trạng thái thực tại lúc trúng.

3. Làm rõ quy ước tick của su, khung trúng và vetBatDau.
   Tài liệu đang nói cùng tick nhưng số lại là su-1.
   Kiểm bằng debug chậm, không chỉ sửa số.

4. Chỉ số Bọ để thử:
   cao 74 px; máu 4; mai 4; choáng 120 tick.
   Đánh mai không mất máu.
   Cộng hưởng phá mai và dùng sát thương thưởng công thức chung,
   không thêm luật riêng “mất 3 máu”.
   Dội nhẹ 3–5 px tổng, không khóa điều khiển.
   Chạm thân lúc đi bộ không gây sát thương; húc chủ động có.
   Giữ dấu ! và cho tùy chọn tắt để so.
   Không tăng rim toàn thân; làm rõ bụng mềm và đầu.

5. Đo độ trễ từ bấm Vọng Chiến tới đòn đầu của bóng.
   Chưa tự cắt phần đứng yên hoặc đổi luật replay.

6. P0-A chỉ cần hình nộm, Chuông Gỗ, quái gác có Thế.
   Chưa thêm quái khác, menu, save hoặc boss.
   Có bản so nhịp cũ/mới với cùng cấu hình quái,
   tránh đổi độ nhạy và độ khó cùng lúc rồi không biết nguyên nhân.

Trả kết quả gồm video debug hộp đòn, log input và các trường hợp replay/Cộng hưởng.
Phân biệt kiểm tra bằng code với trải nghiệm trên iPhone thật.
Không cần quay lại xin duyệt kế hoạch tổng trước khi làm P0-A theo phạm vi này.