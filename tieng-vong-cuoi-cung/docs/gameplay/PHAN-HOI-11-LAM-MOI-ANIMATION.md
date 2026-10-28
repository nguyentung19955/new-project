TIẾNG VỌNG CUỐI CÙNG — REVIEW CHUYỂN ĐỘNG LAM MỚI

KẾT LUẬN

Giữ thiết kế Lam mới, nhưng chưa đưa bộ animation hiện tại vào game chính. Vấn đề lớn nhất không phải thiếu khung hình hay thiếu lò xo: bộ rig đang cố biến một dáng minh hoạ đứng yên thành mọi hành động chỉ bằng xoay các miếng ảnh. Nó chưa tạo được các tư thế chạy và đánh đủ khác nhau.

Phương án tôi chọn cho game này: ANIMATION LAI THEO TƯ THẾ CHÍNH. Gen các tư thế chính có thay đổi hình dáng toàn thân và áo; chọn, căn chỉnh rồi phát thành sprite. Chỉ dùng rig đơn giản cho mắt, chuông, chóp mũ và một số chuyển động phụ. Không gen hàng chục khung độc lập rồi ghép nguyên xi; cũng không tiếp tục dùng 13 mảnh hiện tại để xoay ra toàn bộ bộ động tác.

Trong lúc làm, giữ Lam cũ để thử gameplay và P0-A/B/C.

Phạm vi nhận xét: tôi đã xem ảnh chốt, bảng mảnh, ảnh ghép cảnh, ảnh iPhone; tách các GIF thành dãy khung và lấy mẫu video Lam cũ để đối chiếu. ZIP không có mã rig nên nhận xét về nguyên nhân là suy luận từ hình đầu ra, không phải kiểm chứng từng công thức hay điểm neo. Chưa kiểm trên iPhone thật.

1. VÌ SAO CHUYỂN ĐỘNG HIỆN TẠI TRÔNG TỆ?

1.1. Dáng chạy gần như vẫn là dáng đứng

Trong dãy khung chạy, thân áo vẫn là một khối chuông thẳng gần như nguyên vẹn. Mũ thay đổi góc nhẹ, tay dao đưa lên xuống và gấu áo đung đưa, nhưng không có hai tư thế sải bước khác biệt đủ rõ.

Vì chân bị che gần hết, người xem phải đọc bước chạy qua ba thứ: thân nghiêng, hai phía gấu áo luân phiên mở/khép, và điểm tiếp đất. Bộ hiện tại chưa làm rõ cả ba. Kết quả dễ đọc thành một người đứng đang được kéo đi, hoặc một bóng lơ lửng lắc áo.

Không cần làm lộ chân dài hoặc bỏ áo. Cần gấu áo đổi hình theo bước, đôi lúc hé một mũi giày nhỏ để xác nhận tiếp đất. Nếu chọn nhân vật lướt không chân thì phải đổi ngôn ngữ chuyển động toàn bộ; với gameplay chạy, nhảy, pogo hiện có, tôi chọn giữ mũi giày kín đáo.

1.2. Áo choàng đang là nhiều tấm cứng, chưa thành một khối vải

Bảng mảnh có thân áo dài đã chứa gấu rách, đồng thời có thêm hai mảnh gấu gần giống phần dưới đó. Nếu chỉ chồng và xoay, các nếp vải/viền gấu xuất hiện nhiều tầng; các lớp không thực sự mô tả cùng một lần uốn vải.

Trong bảng khung, phần dưới áo có cảm giác xòe rồi khép như những miếng giấy. Những đường nối ngang và vùng chồng lớp quanh tay/thân càng lộ lúc chém. Vải cần thay đổi đường bao và hướng nếp gấp; xoay một miếng vải cứng chỉ thay hướng cả miếng.

Cách chữa không phải thêm nhiều đoạn nhỏ nữa. Dùng một hình thân–áo chính cho mỗi tư thế, có thể kèm một tà sau riêng. Mọi chỗ nối phải nằm dưới lớp che và không tạo thêm một đường gấu giả.

1.3. Chém 1 chủ yếu là xoay bàn tay/dao

Dãy khung cho thấy dao lùi về phía sau rồi đi lên cao trước mặt, trong khi thân vẫn gần tư thế nghỉ. Hành động chưa có ba hình rõ: lấy đà, cắt qua mục tiêu, kết thúc đòn.

Bàn tay di chuyển độc lập làm cảm giác như dao gắn trên một trục xoay ở sườn. Thiếu thay đổi vai, trọng tâm và đường bao thân áo nên nhát chém không có lực truyền từ thân ra tay. Đó là lỗi tạo dáng, không thể chữa chỉ bằng vệt chém sáng.

Cần: vai/tay rút vào trong pha lấy đà; thân hơi nén và nghiêng; tay đi qua đường chém ngắn, dứt khoát; áo theo sau rồi ổn định. Ở tư thế kết thúc, hướng tay và vũ khí phải khác rõ tư thế đầu. Không cần xoay đầu quá nhiều hay vặn toàn thân mạnh như múa.

1.4. Nhịp GIF cũng chưa giúp đánh giá đúng gameplay

Thông tin GIF trong ZIP:
- Đứng: 72 khung, mỗi khung 100 ms, toàn vòng 7,2 giây.
- Chạy: 30 khung, mỗi khung 30 ms, toàn vòng 0,90 giây.
- Chém 1: 26 khung, mỗi khung 30 ms, toàn clip 0,78 giây.
- Chém chậm: 26 khung, mỗi khung 60 ms, toàn clip 1,56 giây.

Đây là thời lượng file GIF, không khẳng định thời lượng dự kiến trong engine. Tuy nhiên các khung chém đều được giữ cùng thời gian nên khó tạo nhịp lấy đà → vung nhanh → hồi rõ. Nếu toàn clip 0,78 giây khoá thao tác thì không hợp nhịp đánh nhạy đang thử; ZIP không đủ dữ liệu để khẳng định có khoá như vậy.

Animation phải bám startup/active/recovery và cửa sổ huỷ hiện có trong game. Ví dụ nhát 1 startup 7 tick thì hai hình lấy đà phải chia trong 7 tick ấy; không thêm 200–300 ms lấy đà chỉ để clip đẹp. Có thể có nhiều tick logic nhưng ít hình vẽ, với thời gian giữ mỗi hình khác nhau.

30 khung chạy không giúp ích nếu hầu hết chỉ là một dáng được xoay nhẹ. Sáu tư thế tốt có thể đọc rõ hơn 30 tư thế gần giống nhau. Không suy ra trượt chân hay tốc độ game từ GIF tại chỗ; cần thử trong engine với tốc độ thật.

1.5. Chuyển động phụ đang thay cho chuyển động chính

Chóp mũ, chuông, áo và đầu có thể lắc rất mượt nhưng vẫn không tạo được bước chạy hay nhát đánh. Lò xo chỉ nên làm phần phụ đi trễ sau động tác có chủ ý; nếu dùng cho toàn thân thì mọi thứ thành mềm, chậm và bồng bềnh.

Giảm chuyển động phụ trước. Dựng tốt tư thế chính với chuông/chóp mũ đứng yên, rồi mới thêm độ trễ nhỏ. Đứng thở có thể rất ít chuyển động; không cần Lam liên tục gật đầu, nhún áo để chứng minh đang sống.

1.6. Bảng mảnh không bảo toàn nguyên vẹn thiết kế ảnh chốt

Mảnh mũ chính và mảnh chóp có hình dáng/đường cắt cần căn lại; thân áo riêng dài tới sát vùng cổ; các mảnh gấu lặp hình đã có. Đây là một bộ minh hoạ các bộ phận, chưa phải một bộ mảnh kỹ thuật đã bảo đảm ráp và biến dạng được.

Không thể mặc định “gen đúng số mảnh” nghĩa là rig sẽ đúng. Cần một dáng ráp trung tính so trực tiếp với ảnh chốt trước khi animate. Nếu dáng ráp đã lệch, không dùng chuyển động để che lỗi đó.

1.7. Ở 112 px, Lam mới dễ mất hành động hơn Lam cũ

Lam cũ có khoảng trống lớn giữa tay, chân và thân, màu sáng, vũ khí tách rõ. Lam mới có áo dài tối, tay nhỏ và đường bao liền. Đẹp và hợp không khí hơn khi đứng, nhưng khó đọc hơn lúc hành động.

Trong ảnh so cảnh, Lam mới hòa bảng màu tốt nhưng hẹp và ít điểm nhấn hơn Lam cũ. Không cần tăng màu toàn thân. Cần đường bao hành động rõ, mặt đen tách khỏi viền mũ, mắt hổ phách không biến mất, bàn tay/vũ khí ra khỏi thân ở pha quan trọng. Xem tại 112 px trước, phóng lớn sau.

Ảnh iPhone còn cho thấy nhân vật có thể ở sát vùng nút bên phải. Cần thử chuyển động trong vùng đó, vì một động tác chỉ đọc được khi không có ngón tay che thì chưa đủ cho game cảm ứng.

2. CÓ CỨU ĐƯỢC RIG CẮT MẢNH KHÔNG? CHỌN CÁCH NÀO?

Có thể cứu cutout, nhưng cần thay dữ liệu tư thế và cách điều khiển. Tăng lò xo, tăng số khung nội suy hoặc thêm VFX cho 13 mảnh hiện tại sẽ không giải quyết phần cốt lõi.

So sánh thực dụng cho dự án:

A. Giữ nguyên rig 13 mảnh, chỉ chỉnh góc/nhịp
- Công thêm ban đầu: thấp.
- Chất lượng có thể đạt: đứng thở và cử động nhẹ; chạy/đánh dễ còn cảm giác con rối.
- Chốt: không chọn làm hướng sản xuất đầy đủ.

B. Làm lại bảng mảnh cho rig, thêm tay áo/tà áo thay thế theo tư thế
- Công: vừa đến cao, nhiều việc căn điểm nối.
- Chất lượng: có thể tốt nếu có người tạo dáng và sửa đường bao; thuận lợi cho nhiều vũ khí.
- Rủi ro: không có hoạ sĩ thì lại tốn nhiều vòng vá bằng code.
- Chốt: dùng một phần của cách này, không làm bộ rig phức tạp ngay.

C. Gen từng khung độc lập rồi ghép sprite
- Công lúc gen có vẻ thấp, nhưng căn hình và sửa sai khác rất cao.
- Chất lượng: một số khung đẹp, toàn vòng dễ nhấp nháy, đổi kích thước mũ/chuông, đổi nếp áo và mặt.
- Chốt: không chọn quy trình gen độc lập hàng loạt.

D. Lai theo tư thế chính — PHƯƠNG ÁN CHỌN
- Gen một nhóm ít tư thế liên quan trong cùng lượt, luôn đính kèm ảnh chốt và dãy tư thế đã duyệt.
- Mỗi tư thế có hình thân–áo phù hợp hành động; tái sử dụng mũ/mắt/chuông khi có thể. Dùng ảnh thay thế cho phần thân thay vì cố xoay áo đứng ra mọi dáng.
- Claude căn cùng tỉ lệ, neo, tách alpha, sắp thời gian; chỉ nội suy nhỏ ở chuyển động phụ. Không dùng blend hai hình toàn thân khác nhau để giả khung giữa vì sẽ tạo bóng kép.
- Khi có một vòng chạy và nhát 1 đạt, mới mở rộng bộ động tác.
- Chất lượng/công sức: cân bằng nhất với quy trình hiện tại; vẫn cần chọn và bỏ khung hỏng, không phải gen là dùng được.

E. 3D dựng rồi render sprite
- Có lợi về nhất quán góc và nhiều hành động sau khi đã có model/rig tốt.
- Nhưng phải giải quyết model, áo, rig và vật liệu sao cho giữ đúng nét tranh; đây là một đường sản xuất mới.
- Chốt: chưa đổi sang 3D cho Lam ở giai đoạn này.

F. Thuê người làm animation
- Có thể cho chất lượng tốt nếu giao đúng phạm vi, nhưng không bảo đảm chỉ nhờ “thuê vẽ”.
- Nếu có ngân sách, giao một bài nhỏ: vòng chạy và chém 1, xuất cả tư thế chính hoặc dữ liệu có thể dùng lại. Đây là phương án dự phòng nếu bản lai vẫn không đạt.
- Chưa cần thuê cả bộ, chưa cần bỏ thiết kế đã chốt.

Quy trình thử ngắn tôi đề xuất:
1) Dừng mở rộng rig hiện tại. Lưu làm đối chứng.
2) Làm 6 tư thế chạy và 4 tư thế chém 1. Xem bóng đen và bản màu đúng 112 px.
3) Ghép trên nền mới và chuyển động thật, giữ gameplay cũ.
4) Chỉ duyệt nếu chạy đọc thành chạy và chém đọc thành chém khi tắt VFX.
5) Nếu đạt mới mở rộng; nếu sau một vòng sửa có chủ đích vẫn không đạt, cân nhắc thuê người làm hai động tác nền đó, thay vì tiếp tục sinh hàng chục clip tương tự.

3. SỐ KHUNG TỐI THIỂU VÀ NGÔN NGỮ ĐỘNG TÁC

Các số dưới là số HÌNH/TƯ THẾ KHÁC NHAU cho bản thử, không phải số tick logic hoặc FPS engine. Có thể giữ một hình nhiều tick. Số ít không bảo đảm đẹp; mục tiêu là đủ tư thế để đọc hành động trước khi thêm khung nối.

Động tác | Hình tối thiểu | Nội dung
Đứng | 2 | Dáng trung tính và thở nhẹ; mũ, mắt, chuông có thể dùng lại.
Chạy | 6 | Hai pha chạm đất, hai pha chịu lực/đẩy, hai pha chân chuyển qua/bay; gấu đổi hình rõ hai phía.
Nhảy | 2 | Thu/nén lúc rời đất và kéo dài khi đi lên; lấy đà hiển thị không làm trễ lệnh nhảy.
Rơi | 2 | Rơi thường và rơi nhanh; gấu/chóp kéo lên nhẹ, khác tư thế nhảy.
Chém 1 | 4 | Lấy đà, cắt qua, kết thúc, hồi.
Chém 2 | 4 | Đường chém ngược hoặc quét khác nhát 1; thân/áo không chỉ lật lại nhát 1.
Chém 3 | 5 | Hai pha lấy lực, đánh, kết thúc mạnh, hồi.
Chém hất | 4 | Nén, đường chém lên, kết thúc cao, hồi.
Bổ xuống/pogo | 3 | Hướng vũ khí xuống, đang bổ, tiếp xúc/nảy; lần nảy thật do gameplay quyết định.
Lướt | 3 | Vào dáng thấp, giữ dáng lao, thoát; hướng áo kéo về sau.
Bám/trượt tường | 2 | Bắt tường và trượt; có tiếp xúc tay/thân rõ, không chỉ dùng dáng đứng sát vách.
Bị đánh | 2 | Co/giật theo hướng lực và hồi; không kéo dài mất quyền điều khiển ngoài luật hiện tại.

Tổng: 39 hình theo bảng này, trước tái sử dụng. Đây chưa phải bộ animation hoàn chỉnh. Về sau còn cần tiếp đất, chết/hồi sinh, Dư Âm riêng và động tác kỹ năng/vũ khí. Pha nhảy tường có thể mượn nhảy trong bản đầu nhưng cần kiểm dáng đổi hướng.

Chạy nên nâng lên 8 tư thế nếu sáu hình không đủ thể hiện bước ở tốc độ game. Với nhịp chạy nhanh hiện tại, không cố ép mọi vòng thành 0,9 giây như GIF mới: phát theo pha di chuyển đã có và kiểm tại tốc độ chơi thực tế.

Không dùng lật gương để tạo chém 2 từ chém 1 nếu việc đó đổi tay cầm vũ khí. Nhân vật đổi hướng trái/phải có thể lật cả sprite theo luật game, nhưng từng combo vẫn phải giữ nhận dạng tay gần/xa nhất quán.

PROMPT MẪU: CHÉM 1, 4 TƯ THẾ

Đính kèm: ảnh Lam đã chốt (1). Nếu đã duyệt tư thế trung tính ở 112 px, đính kèm thêm ảnh đó. Không dùng Lam cũ làm mẫu tạo hình.

Use the attached approved Lam exactly: identical hood silhouette, proportions, muted colors, amber eye, brass bell and ragged cloak. One four-pose sheet for a quick right-facing side-view slash: compact wind-up, fast forward cut, clear follow-through, return to guard. Shift the shoulder and torso; redraw cloak folds for each pose, with boot tops hidden. Preserve the dagger design. Four equal cells in one row, same character scale and ground baseline, generous margins. Broad painted shapes, restrained charcoal contours, minimal texture, readable at 112 px. No slash effects, motion trails, text or cell borders. Pure white background.

Đây là yêu cầu hình, không phải bảo đảm tự động giữ đồng nhất. Claude phải kiểm lại bề rộng/chiều cao mũ, vị trí mặt, màu, số chuông, tay cầm, vũ khí và đường bao. Bỏ hoặc sửa khung lỗi; không chấp nhận chỉ vì đủ bốn ô.

Nếu game đang đánh bằng Âm Đao, ở bước sản xuất thay cụm “dagger design” bằng “attached tuning-fork blade design” và đính kèm ảnh vũ khí đã duyệt. Không để ChatGPT tự thiết kế vũ khí khác ở từng nhát.

4. GIỮ ĐỒNG NHẤT KHI GEN VÀ GHÉP

- Gen một động tác nhỏ mỗi lần. Duyệt tư thế trước, không yêu cầu toàn bộ 39 hình trong một sheet.
- Cùng góc nhìn ngang phải, cùng ánh sáng, bảng màu và mức chi tiết. Giảm texture vi mô vì nó dễ nhảy giữa khung và biến thành nhiễu ở 112 px.
- Dùng một kích thước tham chiếu cho toàn bộ nhân vật. Không tự co từng khung về chiều cao 112: tư thế cúi, chạy hoặc co phải thấp đi tự nhiên. Dùng cùng hệ tọa độ và cùng tỉ lệ của dáng trung tính.
- Đánh dấu neo bằng JSON bên ngoài hình: gốc trên mặt đất, điểm tay/vũ khí, offset từng tư thế. Không gen dấu neo vào tranh.
- Cỡ ô đủ chứa mũ, vũ khí và tà áo ở mọi pha. Không crop theo từng khung rồi căn giữa tự động vì sẽ gây rung.
- Chỉ lấy phần giữ nguyên từ ảnh gốc khi góc nhìn phù hợp; không gắn cứng đầu đứng lên một thân đang cúi mạnh.
- Không cố chồng ba gấu áo để có nhiều lớp. Một thân–áo chính và nhiều nhất một tà sau đơn giản là điểm khởi đầu hợp lý.
- Dữ liệu sprite không tự thay collider, tầm chém hay cửa sổ miễn sát thương. Đồng bộ tư thế ra đòn với tick hộp bật. Nếu hình không vừa luật, sửa hình/offset trước, không lén nới hộp cho đẹp.
- Preview ở 112 px, nền tối và xám trung tính, cả màu lẫn bóng đen. Có thể xuất nguồn 2x/4x, nhưng phóng lớn chỉ để kiểm kỹ thuật.
- Bản đưa vào game có thể là sprite sheet render sẵn. Không cần chạy 13 lớp và lò xo realtime chỉ vì bản gốc được dựng bằng rig. Bộ nhớ thực tế tùy cỡ ô/số sheet; đo trước khi ghép cả bộ vào Safari.

5. CÓ GIỮ LAM CŨ ĐỂ THỬ GAMEPLAY KHÔNG?

Có. Giữ Lam cũ trong bản gameplay đang đóng băng để thử input, Vọng A/B, Thế, Dư Âm và luồng nâng cấp. Đổi nhân vật giữa buổi sẽ đổi độ đọc đòn, cảm giác tầm với và che khuất, khiến kết quả khó so.

Lam mới chạy ở trang thử riêng. Khi đạt, ghép trong một bản kiểm hình và hitbox trước; không thay đồng thời cả animation, sát thương, startup và AI.

Lam cũ giúp đánh giá điều khiển và luật chiến đấu, nhưng không xác nhận mỹ thuật cuối đủ dễ đọc. Sau khi thay Lam mới phải có một lượt kiểm riêng về độ đọc, vũ khí, bóng Vọng, vùng nút cảm ứng và hiệu năng trên iPhone.

Tiêu chí duyệt bản mới:
- Tắt VFX vẫn nhận ra chạy/chém/nhảy/rơi và hướng đánh.
- Dáng trung tính giữ nhận dạng ảnh chốt; không phình mũ, đổi chuông hoặc đổi tỉ lệ qua từng khung.
- Không lộ đường cắt, gấu nhân đôi, tay rời khỏi tay áo hoặc cổ hở khi xoay.
- Có pha chịu lực và pha chuyển bước; không chỉ là toàn thân bập bềnh.
- Chém có lấy đà ngắn, vung nhanh, kết thúc rõ; giữ nguyên thời gian đáp ứng gameplay đã chốt.
- Tại 112 px trên nền mới, mắt và đường bao đủ đọc, vũ khí không mất vào thân.
- Khi có nút cảm ứng và ngón tay che một phần, vẫn thấy được báo đòn và vị trí Lam đủ để chơi.

GỬI CLAUDE

Giữ thiết kế Lam mới nhưng chưa đưa rig 13 mảnh hiện tại vào game chính. Lỗi chính là thiếu tư thế hành động: chạy gần như dáng đứng, chém chủ yếu xoay tay/dao, thân áo và các gấu chồng nhau như giấy. Không tăng lò xo hoặc thêm VFX để che. Làm trang thử riêng theo hướng lai: trước mắt 6 tư thế chạy và 4 tư thế chém 1, gen có đổi hình thân–áo rồi căn cùng tỉ lệ/neo; chỉ dùng rig nhẹ cho mắt, chuông và chóp mũ. Tắt VFX để duyệt bóng đen và màu tại 112 px trên nền mới. Không đổi startup, hitbox, tốc độ hoặc miễn sát thương để khớp hình. Nếu hai động tác này đạt mới làm tiếp bộ tối thiểu; chưa gen hàng loạt. Game P0-A/B/C tiếp tục dùng Lam cũ và giữ phiên bản thử ổn định. Sau khi Lam mới đạt hình mới kiểm riêng Safari thật, độ đọc khi có nút cảm ứng và hiệu năng.
