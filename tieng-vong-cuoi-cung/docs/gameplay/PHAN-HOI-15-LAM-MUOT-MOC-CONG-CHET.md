TIẾNG VỌNG CUỐI CÙNG — REVIEW LAM MỚI LẦN 5
Chuyển động giật, cỡ bám móc, màn rễ rủ và cái chết

KẾT LUẬN

Phản hồi iPhone là cơ sở quyết định: bản mới chưa đạt độ liền chuyển động để thay mặc định Lam cũ. Tiếp tục phương án D nhưng đổi cách sản xuất: không chỉ ghép thêm sheet, mà phải kiểm đồng nhất hình và xây các hình chuyển có chủ đích. Bảng số khung tối thiểu tôi đề xuất trước là mức đủ nhận ra hành động, không phải bảo đảm mượt. Bản này cho thấy chạy 8 và chém 4 vẫn thiếu ở các đoạn chuyển; cần nâng chất lượng đúng đoạn, không tăng ngẫu nhiên tất cả hình.

Ba việc không cần gen mới vẫn phải làm trước: đo nhịp render Safari, bỏ neo/scale gây bật hình, bỏ kiểu chết bóp dẹt rồi cắt ngang. Móc cần sửa tỉ lệ thân, cổng cần đổi hẳn cấu trúc sang MÀN RỄ RỦ TỪ TRẦN, không vá tiếp cánh cửa có trụ.

Phạm vi: tôi đã đọc ghi chú sửa PH14, xem hai ảnh iPhone, ảnh cổng, dãy khung lấy mẫu từ GIF chạy/chết/móc và video P0-C. Tôi không có code để truy nguyên độc lập và không đo FPS trực tiếp trên máy iPhone. Các nguyên nhân dưới được phân biệt giữa điều thấy trong ảnh/ghi chú và điều cần kiểm. Dòng “chưa thử iPhone” trong ghi chú là giới hạn phép đo Claude; hiện chủ dự án đã thử và gửi ảnh/phản hồi thật, cần bổ sung kết quả đó vào ghi chú.

1. VÌ SAO VẪN GIẬT?

1.1. Có ít hình thay đổi thực sự, mỗi lần đổi lại khác quá nhiều
Chạy 8 hình/0,5 s tương đương 16 hình khác nhau/giây. Ở tốc độ 264 px/s, mỗi hình giữ 16,5 px di chuyển, hoặc khoảng 3–4 tick logic. Đây không tự động là lỗi; animation ít hình vẫn có thể đẹp. Nhưng áo, đầu, chiều cao và chân đổi quá xa giữa ô thì cả người bật hình theo nhịp 16 Hz, dù canvas vẫn vẽ 60 fps.

Ghi chú xác nhận chạy nhún 9,6 px CHƯA SỬA, đang chờ ảnh. Vì vậy thêm các động tác khác chưa chữa nguyên nhân cũ. Không tiếp tục ghi “đã sửa mượt” khi chỉ tăng độ nét sheet hoặc thêm VFX.

1.2. Nội dung giữa các sheet chưa đồng nhất
Ảnh đứng có thân gọn, bám móc thân/đầu lớn và áo dài; combo có các hình nén thấp và góc đầu khác. Nhảy từ một sheet sang sheet khác sẽ đổi nhân dạng. Thêm khung giữa một đầu nhỏ và một đầu lớn chỉ làm nó phồng từ từ, không sửa lỗi.

Cùng một chiều cao mắt hoặc một chỉ số cỡ mũ không có nghĩa cùng cơ thể. Cần khóa cỡ mũ, khe mặt, ngực–vai, thân áo trung tính và điểm tiếp xúc, rồi mới thêm hình chuyển.

1.3. Neo và cách sửa gần sàn có thể gây giật riêng
Ghi chú nói gần sàn nâng cả sprite móc tới 17,7 px để gấu không xuyên đất; WM4 có áo ngắn hơn nên nâng ít hơn. Khi WM3↔WM4 đổi khung, lượng bù khác nhau có thể làm toàn thân nhảy lên xuống dù physics trượt đều. Đây là rủi ro rất cụ thể cần kiểm log offset từng tick.

Không chữa bằng lerp sprite đuổi theo lâu vì sẽ tách người khỏi collider và điểm móc. Sửa hình móc có áo dài đúng tỉ lệ; gần sàn dùng hình gom gấu riêng, hoặc chuyển mỹ thuật tiếp đất theo tiếp xúc đã có mà không thay physics. Nếu còn bù, tính một đường bù liên tục theo khoảng cách tới sàn và bộ dáng thống nhất; không tính nhảy riêng theo chiều dài từng ảnh.

1.4. Nhịp giữ hình chưa diễn tả chuyển lực
Bốn hình chém là lấy đà → hình ra đòn → kết thúc → hồi. Một tay/dao nhảy xa giữa hai hình tạo cảm giác bật công tắc. Giữ lâu một ảnh vung thẳng suốt active cũng tạo cảm giác đứng cầm vệt sáng.

Cần nhiều hình nhất quanh đường vung, ít hình ở tư thế giữ. Không chia đều mọi hình trong mỗi clip, cũng không làm chậm startup để có chỗ phát hình mới. Lịch do atkT/hộp/cancel thật điều khiển, không do một đồng hồ animation riêng chạy tự do.

1.5. Phải kiểm thêm giật kỹ thuật trên Safari
Ảnh tĩnh không chứng minh máy tụt FPS. Phân biệt:
- Cảnh/camera/quái chạy đều nhưng người giật theo từng pose: lỗi hình/nhịp.
- Mọi thứ cùng khựng ngoài hitstop: kiểm frame pacing, decode ảnh, cấp phát, GC, vẽ nhiều lớp.
- Vị trí thế giới liền mà tọa độ màn hình rung: kiểm camera, làm tròn và neo.
Ghi log frame time trên Safari trong một tuyến ngắn, so VFX bật/tắt, so Lam mới/cũ cùng tuyến. Kiểm có decode/tạo canvas tint mỗi khung, nạp sheet giữa trận hoặc thay DPR liên tục không. Không khẳng định đã có các lỗi đó khi chưa xem code.

Nếu engine dùng bước mô phỏng cố định, có thể nội suy vị trí vẽ giữa hai bước mà không đổi physics. Không nội suy xuyên teleport, chết, đổi phòng hoặc hitstop. Đây là nội suy tọa độ, KHÔNG crossfade hai ảnh người. Không làm tròn vị trí sprite độc lập với camera theo hai cách khác nhau. Không đổi timestep để chữa mỹ thuật.

2. CÁCH LÀM MƯỢT THỰC TẾ VÀ SỐ HÌNH

Thứ tự đúng: sửa pose sai → khóa tỉ lệ/neo → sửa nhịp → thêm hình nối ở đường đi còn nhảy → chuyển động phụ nhỏ.

Mức mục tiêu cho lượt làm lại nhỏ, không phải tiêu chuẩn bắt buộc:
- Chạy: 12 hình là lượt thử kế tiếp; nếu chưa đủ, 16. Không gen luôn 16 từ đầu.
- Chém 1: 6 hình, thêm một hình đi qua và một hình hãm/thu.
- Chém 2: 6 hình, tập trung đường chéo lên và nối từ chém 1.
- Chém 3: 7 hình, giữ lấy lực rõ, thêm hình vung và chuyển từ kết thúc sang hồi.
- Hất: 5–6 hình; chém trên không: 4–5.
- Idle: 2–3; nhảy/rơi/tiếp đất: 6 hiện có có thể đủ nếu đúng dáng.
- Móc: 4 ổn định + 2 bật vách là đủ thử; không cần 12 hình trượt nếu thân vẫn đổi cỡ.
- Lướt: 3–4; bị đánh: 2–3. Các trạng thái nhanh có thể cố ý sắc, không cần mọi thứ mềm như thở.

CHẠY 12 HÌNH
Giữ 8 tư thế đã sửa đúng. Thêm 4 hình giữa các cặp chuyển lớn: R2→R3, R4→R5, R6→R7, R8→R1. Nếu xem dãy thực tế thấy cặp khác nhảy lớn hơn thì ưu tiên cặp ấy. Không dùng hình trộn hai ảnh, không nhân đôi khung.

Ví dụ chia pha: bốn đoạn có hình nối, mỗi đoạn gốc 1/8 vòng chia thành hai nửa; bốn đoạn còn lại vẫn 1/8. Tổng 1 vòng không đổi 132 px. Thời gian hình theo quãng đường, không phải tự cộng thêm khung khiến vòng dài ra. Sau duyệt có thể làm 16 hình bằng một hình giữa mỗi cặp, mỗi ô 8,25 px ở 132 px/vòng.

Tổng nhún thân mục tiêu khoảng 3–4 px thay vì gần 10 px. Khóa điểm trụ, không khóa mọi đầu ở cùng độ cao. Không bù tăng cỡ Lam để thấy áo rõ hơn.

CHÉM 1 6 HÌNH
Gợi ý sáu hình A/T/U/V/W/G trong số bước engine đang có: startup hiện 6 hình-bước theo ghi chú = A rút 4 + T chuyển tay 2; active 8 = U cắt đầu 2 + V cắt đầy 3 + W kết thúc 3; recovery 8 = giữ W thêm 3 + G về thủ 5. Sáu tư thế khác nhau, W dùng lại ở đầu hồi; khi hộp tắt, vệt tắt theo luật dù còn giữ W. Claude viết bảng frameId/atkT cụ thể sau khi xác nhận engine, không sửa thời điểm hộp để khớp con số.

Chém 2 và 3 dùng cùng nguyên tắc, không lấy lịch nhát 1 dán lên nhát 3. Tạo một tư thế nối từ cuối nhát trước vào đầu nhát sau. Khi cancel diễn ra sớm, chọn hình đầu thích hợp theo trạng thái hiện tại, không bắt phát thêm đoạn hồi. Hitstop giữ nguyên cả người và vệt.

CHUYỂN ĐỘNG PHỤ
Chỉ sau khi các bước trên đạt: chóp ±2–3°, chuông ±3–5°, trễ khoảng 1–2 tick, tà sau biên độ 1–2 px. Phải xóa phần cũ khỏi thân nếu tách overlay. Không tách được sạch thì giữ nguyên, không chồng thêm một chuông/chóp thứ hai. Không squash toàn thân. Giữ biến dạng áo trong hình gen thay thế, không làm cả áo thành tấm cứng xoay.

PROMPT THÊM HÌNH CHẠY
Đính kèm Lam chốt + Âm Đao + hai pose kề cần nối. Gen từng nhóm nhỏ, không yêu cầu máy vừa sửa 8 hình vừa sáng tác 8 hình mới.

Use approved Lam and blade exactly. Create four right-facing RUN in-between poses for the four supplied pose pairs, one intermediate per pair in order. Preserve hood volume, narrow face opening, small amber eye, body scale and planted-foot contact. Continue the cloak motion naturally with tiny vertical bounce; no new extreme poses. Four equal cells on white, minimal texture, no effects, text or borders.

PROMPT COMBO
Làm riêng từng nhát, dùng nhãn hướng tương ứng. Không gen toàn combo 19 hình trong một sheet.

Use approved Lam and blade exactly. Six right-facing key poses for ONE low horizontal slash: compact wind-up, hand crossing toward the front, early cut, full cut, bent-elbow follow-through, return to guard. Keep identical hood volume, face opening and body scale. Smooth connected shoulder and cloak motion, tiny planted boot tips. Six equal cells, shared baseline, muted painted shapes, minimal texture. White background, no effects, text or borders.

Với chém 2 đổi danh sách thành: low continuation from slash one, upward crossing, early rising cut, full rising cut, high bent-elbow follow-through, low guard.
Với chém 3 dùng 7 ô: gather, raised peak, downward crossing, early chop, full low chop, heavy follow-through, return to guard.
Đính kèm ô cuối nhát trước và hướng hộp đòn làm tham chiếu, không in hộp vào tranh. Không thay chiều dài dao giữa hình.

3. BÁM MÓC TO HƠN — ẢNH IPHONE CHỨNG MINH GÌ?

Hai ảnh có cùng bố cục UI và vật nền, nên có cơ sở nghiêng về sai cỡ sprite/nhân vật, chưa thấy lý do cho rằng camera tự zoom. Hình móc vừa giơ tay cao vừa có khối mũ–thân lớn hơn dáng đứng. Tuy nhiên không dùng bounding box gồm móc để đo tỉ lệ: tay giơ cao hợp lệ làm tổng chiều cao tăng.

Nguyên nhân khả dĩ theo ghi chú:
- Scale sheet móc dựa vào chỉ số mũ ước lượng, từng loại góc/che được thay công thức. Sai phép đo có thể scale toàn cơ thể quá lớn.
- Ảnh gen vẽ mũ/đầu cỡ gần nhưng thân áo dài, vai/tay lớn. Khớp mũ không đồng nghĩa khớp cơ thể.
- Neo theo mắt và bù nâng 17,7 px gần sàn đổi vị trí, không tự làm to, nhưng làm người nổi cao và khác dáng càng rõ.
- Cần loại trừ JSON dùng nhầm hệ số 2x/3x, width/height nguồn/logic hoặc scale bị nhân hai lần trong nhánh wall. Đây là giả thuyết cần kiểm, không phải kết luận đã có lỗi.

Cách sửa:
1) Đặt idle và WM2 cùng hướng trên nền trống, cùng scale render, tắt bù gần sàn, bật collider. So rộng mũ, khoảng từ cổ tới gấu, vai và cỡ bàn tay; không so cả móc.
2) Kiểm metadata 2x/3x qua cùng hàm vẽ; log scale cuối ra màn và offset, không chỉ k ảnh nguồn.
3) Chọn một hệ scale cho nhân vật từ mẫu chuẩn. Nếu sheet vẽ người to đồng đều có thể sửa scale một lần cho toàn sheet và neo lại. Nếu chỉ thân/áo dài hơn, phải sửa pose/ảnh, không thu cả người khiến đầu teo.
4) Móc neo ở mặt vách nhìn thấy; thân nằm dưới móc với tỉ lệ đúng. Không tăng sprite để đầu móc “với tới” điểm neo. Điểm neo móc/tay là tọa độ trong ảnh, không là cách quyết định cỡ người.
5) So WM1→4 và idle→wall→jump tại 112 px. Gần sàn dùng dáng gom áo, không nâng cả hình một lượng khác nhau theo mỗi frame để vá xuyên.

Prompt nếu cần gen lại:
Use approved Lam and the hook reference exactly. Four right-facing wall-hook poses: catch, hang, slide A, slide B. Keep the SAME head, shoulder width, glove size and neck-to-hem length as approved Lam; raised arm adds height but the body does not enlarge. Far hand holds the small hook above, near hand keeps blade close. Cloak hem gathered near boots, no elongated torso. Four equal cells, shared scale, white, no wall, effects or text.

4. CỔNG MỚI: MÀN RỄ RỦ, KHÔNG CÁNH CỬA

Bỏ khái niệm khung cổng, cột bên và lỗ mở ở giữa. Ảnh cổng dọc hiện có đúng là một cánh/khung cửa nhìn thẳng nên không thể sửa thành ý mới chỉ bằng đổi chiều animation.

Cấu trúc đề xuất, tại hộp chặn hiện có 183×159 logic:
- Một búi rễ bám TRẦN rộng khoảng 190–205 px, cao 25–40 px, lẫn vào underside đất. Không có trụ bên, ngưỡng dưới hay nền đen đặc.
- 5–7 dải rễ chính hơi đan nhau, mỗi dải là một sprite dài với đầu trên trơn giấu sau búi trần. Tổng phần dày phủ toàn bề ngang hộp đóng, không chỉ giữa lối.
- 3–4 biến thể đầu rễ thuôn, cong như rễ sống, không đầu nhọn như chông. Dải ở rìa nằm tới mép vùng chặn; các khe nhỏ không đọc thành lối người đi được.
- Vài sợi mảnh phụ rủ lệch pha. Lá/rêu thưa, tránh thành rèm xanh tươi hoặc dây xúc tu bóng nhớt.
- Dấu khóa chuông/đồng nếu cần đặt trên búi trần, nhỏ và cố định. Ngà/đồng cho tín hiệu mở, không teal trừ liên quan Vọng thật.

Animation bằng code từ mảnh rời là phù hợp ở đây: các sợi có cấu trúc đơn giản, không phải người. Không cần gen toàn cổng 8 khung khác nhau.

RỦ XUỐNG:
Búi trần co nhẹ 2–3 tick → rễ giữa đi xuống trước, hai mép trễ 1–3 tick → đầu chạm gần sàn, cong nhẹ và ổn định. Ưu tiên dịch dải xuống từ sau búi che + clip ở vùng trần, không scaleY từ 0 khiến vân gỗ/phần đầu méo. Có thể cong bằng 2–3 đoạn giấu nối hoặc mesh nhẹ nếu có; bản đầu chỉ cần dịch + lắc nhỏ.

THU LÊN:
Búi trần siết nhẹ, các đầu rễ nhấc khỏi sàn → các dải kéo lên dọc trục, lệch pha ít → toàn bộ thân rút sau búi trần; chỉ còn sợi ngắn cố định. Không mờ toàn cổng, không lún xuống đất, không để cột đứng lại.

Số hình/thời gian:
- Tài nguyên: một bộ mảnh, không cần 8 ảnh toàn cổng. Nếu muốn preview sprite: 8 mẫu trạng thái cho mỗi chiều là đủ kiểm; bản runtime cập nhật vị trí mỗi tick/render frame.
- Nhịp mong muốn: đóng khoảng 24–30 tick (0,4–0,5 s), mở khoảng 18–24 tick (0,3–0,4 s), thêm 6–10 tick lắc tắt dần chỉ trang trí.
- Nhưng bản hiện có mở khoảng 15 tick và đi xuyên từ khoảng tick 9: kéo dài animation là thay cảm nhận mốc qua cổng. Nếu giữ luật cũ tuyệt đối, dùng 15 tick cho rút chính, tại mốc qua được phải đủ lối, lắc phụ tiếp sau; không để hình còn chắn sàn trong khi Lam đã đi xuyên. Muốn dùng nhịp chậm hơn đẹp hơn, chốt riêng thay đổi tiến độ/mốc collider, không gọi là chỉ đổi hình.

Collider:
- Bản đầu giữ hộp và điều kiện cũ; vẽ phần chặn rõ tới thời điểm cho qua, rồi lối phải thoáng ở cả bề rộng 183 px. Không để các khe rộng bên rễ vẫn chặn vô hình.
- Với hình kéo dần lên, collider lý tưởng là khối phía trên co theo đầu rễ, nhưng đó là thay collider động, có thể thay đường lách/cúi/nhảy. Chưa làm ngầm trong vòng mỹ thuật.
- Khi đóng, không bật chặn đột ngột xuyên người. Chỉ đóng nếu vùng an toàn trống, hoặc chờ người rời; cách nào cũng phải kiểm hành vi hiện có và ghi rõ. Rễ báo động đóng phải có dấu hình/âm trước, không gây chết oan.

Prompt bộ mảnh:
Side-view game asset parts for a hanging ROOT CURTAIN inside a giant hollow tree. One broad ceiling-root knot, seven separate long tangled root strips with plain hidden upper ends, four curved tapered root tips. Grey-umber wood, sparse dull olive moss, restrained charcoal contours, broad muted painted shapes. Roots descend from above to block a passage and retract upward. No door frame, pillars, arch, threshold, black opening or ground. Parts separated with generous white space, no text.

Đính kèm cảnh nền và đất mới. Muốn ít nối nhất có thể gen 7 dải đã có đầu thuôn, 4 đầu riêng chỉ là tùy chọn thay thế, không bắt buộc ghép hai lần.

5. CHẾT: TẮT MỘT TIẾNG CHUÔNG, KHÔNG BÓP DẸT NHÂN VẬT

Trong GIF hiện tại, người bị thu dọc tới 0,6 và nở ngang rồi tan theo vết cắt từ trên xuống. Kết quả là một Lam dẹt như đồ chơi bị ép, sau đó bị xóa bằng đường quét. Chỉ báo “đạt tạm” là kiểm code chạy, không phải chất lượng mỹ thuật.

Bỏ scale toàn thân, bỏ cắt ngang từ trên xuống, bỏ hạt sáng ngà dày như pháo. Đề xuất:
D1: lực rời khỏi người, vai sụp, dao hạ, đầu cúi; giữ thể tích mũ.
D2: quỳ thấp thật bằng hình vẽ, một mũi giày co vào, áo gập thành vài nếp lớn; không bóp đứng thành quỳ.
D3: thân gục yên, chuông nghiêng, mắt nhỏ dần hoặc tắt; dao vẫn cùng tay, không văng thêm bản sao.
D4: áo mất kết cấu thành 2–3 dải bóng than mềm ở mép rách; vài vụn nhỏ tách ra, còn silhouette nhận dạng.
D5: khối áo rỗng sụp thấp, bóng than tan thưa; mắt đã tắt.
D6: một cụm vụn/bụi than cuối cùng, một chấm đồng/ngà rất nhỏ nếu cần, rồi trống.

Vật liệu tan: bụi than, sợi vải tối và vài hạt đồng mờ; không máu, không xương, không bướm sáng hoặc confetti. Teal chỉ dùng nếu cái chết thực sự tạo Vọng theo luật/cốt truyện; không dùng teal như hiệu ứng chết chung.

Nhịp hình mục tiêu: D1 4 tick, D2 6, D3 10, D4 10, D5 12, D6 6 = 48 tick (~0,8 s). Lực đánh/hitstop gốc có thể đi trước; khi chết trên không, dùng dáng mất lực trong lúc physics rơi, chuỗi quỳ bắt đầu sau tiếp đất. Không làm xác đứng yên giữa không trung để chờ ảnh. Nếu hồi sinh hiện tại trễ hơn, dành phần còn lại cho khoảng tối/chuyển cảnh; nếu ngắn hơn phải chia lại lịch trong cửa sổ cũ, không tự kéo dài respawn.

Âm: một tiếng chuông thấp ngắn, hơi lệch và mất dần phần cao; có đuôi nhỏ, không tiếng rơi hài hoặc nổ mạnh. Có thể hạ âm môi trường thoáng chốc, không bắt trình duyệt phát âm khi audio chưa được người chơi mở. Không cần thêm cơ chế gameplay vì hiệu ứng này.

Tối thiểu 4 hình người: mất lực, quỳ, gục, áo rỗng; hai pha tan cuối có thể dùng mask alpha nhiễu cố định theo thời gian và hạt thưa từ mép áo. Alpha tan toàn hình theo mảng bất quy tắc được, KHÔNG crossfade sang một hình người khác; không dùng nhiễu mới ngẫu nhiên mỗi tick khiến lấp lánh.

Prompt:
Use approved Lam and blade exactly. Six right-facing death key poses: strength leaves the shoulders; true kneeling with folded cloak; head bowed and amber eye fading; ragged cloak edges loosen into sparse charcoal threads; empty cloak collapses softly; a few dark cloth motes remain. Preserve hood volume in the first three poses, no squashing, gore, skeleton, bright explosion or extra weapon. Six equal cells, shared scale and ground baseline, muted woodland-folktale painting, white background, no text.

Để dễ tách nền, ưu tiên gen 4 dáng người đầu với hình rõ; bụi tối/tan cuối dựng bằng code. Nếu mô hình gen hạt quá nhiều, loại phần đó chứ không đổi cả palette.

6. THỨ TỰ LÀM — KHÔNG MỞ RỘNG CÙNG LÚC

P0: giữ bản P0-B/P0-C cũ và một build Lam mới riêng. Không đổi AI/vũ khí/sát thương trong vòng sửa này.

Bước 1 — chưa gen: kiểm scale/metadata/neo móc, offset gần sàn; quay idle→wall→jump cùng collider. Tắt ngay squash chết và vết cắt ngang, tạm giữ một dáng gục đơn giản. Đo frame time Safari thật để tách lỗi hình khỏi lỗi render.

Bước 2 — sửa nguồn hình: sửa nhún/tỉ lệ chạy và móc. Duyệt một vòng chạy 12 hình cùng 6 hình chém 1. Nếu không tốt hơn rõ thì dừng, chưa làm cả combo. Nếu sau một vòng tạo dáng có chủ đích vẫn thất bại, đây là lúc cân nhắc thuê xử lý đúng hai clip nền, không tiếp tục đổ công vào thêm sheet sai.

Bước 3 — khi hai clip đạt, nối chém 2/3 và hai hình bật vách; giữ cửa sổ gameplay. Tạo chết mới 4 dáng + tan nhẹ.

Bước 4 — dựng màn rễ rủ bằng bộ mảnh, bỏ kiến trúc cổng cũ; kiểm mốc đi xuyên/đóng khi có người, không đổi collider lén.

Bước 5 — Safari: chạy chậm/nhanh, đổi hướng, bám sát sàn hai phía, combo có hitstop, chết trên đất/không trung, lặp chết/hồi và đổi phòng. So Lam cũ/mới cùng tuyến; đừng trộn dữ liệu của build khác nhau. Duyệt ở 112 px toàn tốc trước khi xem phóng lớn/chậm.

GỬI CLAUDE

Phản hồi iPhone chưa đạt, giữ Lam mới ở bản tích hợp riêng. Trước khi gen thêm, kiểm frame pacing Safari và scale/metadata 2x/3x của móc; so tỉ lệ mũ–vai–cổ tới gấu với idle, không chỉ số mũ. Bỏ bù nâng sprite giật theo WM3/WM4, sửa hình áo/neo gần sàn. Chạy còn nhún gần 10 px chưa sửa: chữa pose trước, rồi thử 12 hình bằng 4 hình nối; chém 1 thử 6 hình, bám atkT/hộp/cancel thật, không crossfade hay thêm startup. Duyệt hai clip này trước khi làm combo còn lại. Cổng đổi hẳn thành màn rễ rủ từ búi trần, kéo lên khi mở, không cột/khung/ngưỡng; dùng mảnh rễ và clip sau trần, giữ mốc collider cũ hoặc ghi riêng nếu đổi thời gian. Chết bỏ squash 0,6 và cắt ngang; làm mất lực→quỳ→gục→áo rỗng, tan thành bụi than thưa với một tiếng chuông tắt. Không đổi gameplay, AI hay quái trong cùng lượt sửa; quay kiểm trên iPhone thật sau mỗi bước chính.
