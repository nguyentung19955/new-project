TIẾNG VỌNG CUỐI CÙNG — GÓI THAM CHIẾU LAM KIỂU 4 CHO PIXELLAB

CHỐT
Dùng Humanoid, camera Sidescroller, cỡ 64×64 để thử đầu tiên, chỉ hướng East cho animation. Cung cấp South chính diện bắt buộc theo giao diện Claude đã xem, cộng East để hạn chế PixelLab tự thiết kế lại dáng ngang. Chưa cần tạo 8 hướng hay toàn bộ animation ngay.

Tôi đã tạo hai PNG tham chiếu và chuẩn hóa thật về canvas 64×64, alpha nhị phân, bảng màu chung 32 màu. Đây là ảnh AI đã thu nhỏ/chỉnh lưới bằng code, KHÔNG phải ảnh gen tự nhiên đã đúng 1:1 và KHÔNG phải pixel art được hoạ sĩ chỉnh từng cụm điểm. Không bảo đảm PixelLab sẽ chấp nhận hoặc animation sẽ giữ hoàn hảo. Cần thử một lượt tạo nhân vật, kiểm kết quả trước khi dùng credit tiếp.

1. FILE ĐÃ TẠO VÀ CÁCH DÙNG

- lam-south-64.png: chính diện nhìn về người xem, nguồn South cho Create from Reference.
- lam-east-64.png: nhìn sang phải, nguồn East ứng viên. Góc còn hơi 3/4 ở áo/vũ khí, cần kiểm trong PixelLab; không gọi đây là profile hoàn hảo. Hai ảnh đầu vào người dùng gửi cũng còn yếu tố 3/4. Nếu hệ thống tự xoay/đổi mặt, sửa riêng hướng East hoặc dùng hướng East mà PixelLab tạo rồi duyệt.
- preview-only-x4.png: xem hai ảnh phóng 4 lần trên nền tối. KHÔNG upload file này làm reference.
- reference-metadata.json: cỡ, neo và giới hạn nguồn hình.
- HUONG-DAN-PIXELLAB-LAM.txt: toàn bộ hướng dẫn này.

Các PNG upload là 64×64 thật, không có lưới điểm phóng bên trong; alpha chỉ 0/255. Cùng một tỉ lệ thu từ ảnh gen, không kéo dãn riêng từng hướng. South cao 54 px, East cao 53 px sau làm tròn, cùng đường chân. Bố trí neo x=32, y=59; pixel hàng 58 là đáy ủng, hàng 59 là đường neo trống ngay dưới. Đỉnh nhân vật khoảng y=5–6. Đây là quy ước của gói, không khẳng định PixelLab bắt buộc tọa độ này.

Không upload ảnh preview, JPEG hoặc ảnh nguồn lớn. Không ép từng frame animation về chiều cao 54: tư thế nén và co chân phải thấp tự nhiên. Giữ scale của nhân vật, không scale theo bounding box gồm móc/dao/hiệu ứng.

2. CHỌN CỠ VÀ HƯỚNG

64×64 là lựa chọn đầu tiên vì bản thử đã chạy tốt, nhân vật 54 px còn đủ để nhận mắt, hai chuông, ba lô và đèn. 32 px quá ít chỗ cho toàn bộ phụ kiện này; 128 px có thể làm chi tiết tăng và tốn thêm lượt/dung lượng mà chưa chắc cần. Không chọn 200/256 chỉ vì gói cho phép.

Khung reference 64×64 sẽ khá chật với chém giơ cao hoặc dao duỗi hết tầm. Nếu công cụ cho đổi canvas/padding mà giữ nguyên scale nhân vật, dùng canvas 96/128 cho đòn lớn; KHÔNG phóng Lam từ 54 lên gấp đôi. Nếu PixelLab khóa cỡ theo nhân vật, kiểm liệu có cơ chế animation padding trước; chấp nhận motion gọn và làm VFX riêng thay vì cắt mất dao. Đừng tạo hai character ID khác scale rồi ghép mà không đối chiếu.

Trong game Lam cao 112 px logic chưa cần thay. 54→112 là tỉ lệ không nguyên, có thể tạo kích thước pixel màn hình không đều; đây là chuyện khác với PNG nguồn 1:1. Thử vẽ 54→108 (×2) trong bản duyệt mỹ thuật, vẫn giữ collider game cũ. Chỉ chọn 108 hay 112 sau khi xem toàn cảnh. Safari còn có hệ số viewport/DPR nên ×2 logic không bảo đảm ×nguyên trên màn vật lý. Không dùng smoothing để che mà làm mờ pixel, không đổi cả khung logic sang low-res trong vòng thử này.

South = mặt hướng camera, KHÔNG phải nhìn xuống và không phải góc máy top-down. East = phải của màn hình, ngang mắt. Hai chân đứng tự nhiên, trọng lượng giữa chân, không dang T-pose, không lấy dáng đang chạy làm chuẩn.

West: chưa cần gen, thử lật East trong game. Vì đồ cầm tay/ba lô bất đối xứng, lật ảnh cũng đổi tay nhìn thấy; phải chấp nhận quy ước game hoặc làm West riêng nếu muốn giữ giải phẫu tay tuyệt đối. Không tự yêu cầu cả 8 hướng cho metroidvania này.

3. KHÓA THIẾT KẾ TRƯỚC KHI TẠO ANIMATION

Đặc điểm bắt buộc:
- Mũ xanh slate mềm, viền ochre, một miếng vá lớn đơn giản.
- Mặt đen, MỘT mắt hổ phách/cam vàng; không xanh/cyan. South dùng một mắt trung tâm như file đã tạo, không tự thêm mắt thứ hai.
- Khăn/cổ tay kem, áo ngắn xanh, găng/ủng nâu.
- Ba lô nâu, đèn lồng gắn BA LÔ phía sau, không ở tay trống. East đèn nhô nhẹ khỏi đường bao sau để đọc được.
- Đúng hai chuông: một nhỏ ở chóp mũ, một ở ngực. Không thêm chuông ở thắt lưng.
- Âm Đao ngắn hai nhánh, một vũ khí trong tay chiến đấu, không biến thành rìu/kiếm đơn hoặc đổi tay qua từng frame.

Đèn ở phía sau có thể bị cơ thể che một phần trong tư thế hợp lý. Không ép nó luôn hiện toàn bộ ở mọi góc vì sẽ giống đèn xuyên người. Yêu cầu còn đọc được trong East idle/run; nếu không, sửa điểm gắn/độ nhô, không đưa đèn sang tay. Khung đang nhìn trực diện có thể che nhiều ba lô, đó là hợp góc nhìn.

Mắt từng ra xanh trong GIF: sửa reference/character trước, rồi mới animate. Sau render vẫn kiểm màu từng frame; có thể palette-remap riêng vùng mắt theo ngữ nghĩa/mask, KHÔNG thay mọi màu xanh sáng trong toàn sprite vì còn mũ/kim loại. Đèn và mắt có màu gần nhau nên không dùng chỉ ngưỡng RGB để nhận nhầm.

4. CHARACTER DESCRIPTION — DÁN NGUYÊN KHỐI DƯỚI (DƯỚI 2000 KÝ TỰ)

Lam is a small mysterious bell-keeper for a 2D side-scrolling metroidvania. Compact chibi humanoid, about 54 pixels tall inside a 64x64 frame. Floppy slate-blue hood with ochre trim, one simple ochre patch and one tiny brass bell on its drooping tip. Shadow-black face with ONE small vertical AMBER ORANGE eye, never blue, cyan or white. Cream scarf and cuffs, short blue coat, brown mittens and two small brown boots. Brown backpack; one warm amber lantern hangs from the BACK of the backpack, visible beyond the rear silhouette in side view, never held in a hand. A second small brass bell hangs at the CHEST: exactly two bells total. One short iron tuning-fork blade with TWO clearly separated parallel prongs, held in the combat hand. Keep hood volume, face opening, eye color, scarf, bells, backpack, lantern and blade design consistent across all frames. Quiet, mysterious and brave, not grinning. Crisp native-resolution pixel art, small consistent palette, flat shading, dark outline, no blur or antialiasing. Eye-level SIDESCROLLER camera. EAST means strict side view facing RIGHT. Use supplied directional references; no top-down camera, no new accessories, no duplicate weapons. Lantern and bells follow the body subtly; legs remain readable as two boots.

5. CHỌN CÔNG CỤ VÀ SỐ HÌNH

Các số là MỤC TIÊU hình khác nhau, không phải cam kết PixelLab mọi mode đều cho chọn số đó. Nếu Custom trả số cố định, lấy tập frame tốt theo pha hoặc lắp lại, không regen chỉ vì muốn đúng số. VFX làm riêng để không vừa giữ nhân dạng vừa đòi hiệu ứng lớn.

Idle: Skeleton v3 / Idle, 4 hình. Thở nhỏ, mắt ổn định. Nếu chỉ có template số khác, chọn gần nhất và giữ frame cần thiết. Không giật mũ theo mỗi nhịp.
Running: Skeleton v3 / Running 6, 6 hình trước. Template 8 chỉ thử khi gait sáu hình chưa hợp. Chỉnh skeleton chân/đầu nếu giao diện cho phép; không chuyển Free chỉ vì đèn bị che.
Jump rise / fall / land: Skeleton v3 / Jumping trước, lấy khoảng 2 hình lên +1 đỉnh +2 rơi +1 tiếp đất. Nếu template không có landing, Custom riêng; không đổi trọng lực/độ trễ nhảy theo clip.
Slash1: Custom, 6 hình (có thể đủ 4–5 nếu nhanh rõ). Không dùng Punching làm kết quả cuối vì vũ khí dễ thành đâm.
Slash2: Custom, 6 hình, chéo lên, tiếp nối slash1.
Slash3: Custom, 7–8 hình, lấy lực và bổ xuống.
Up slash: Custom, 4–5 hình, cắt thẳng lên.
Pogo: Custom, 3 hình: bổ tức thì, giữ lưỡi xuống, nảy. Hộp bật ngay theo game, không thêm startup để phát clip; nảy theo hit, không loop nảy theo animation.
Dash: Skeleton v3 / Slide nếu có hình thân hợp, 3–4 hình; nếu Slide thành ngồi trượt thì Custom. Không chọn Front flip/Backflip.
Wall hook cling/slide: Custom, 4 hình; template humanoid không hiểu móc nếu chỉ chọn Jumping. Far hand dùng móc, combat hand vẫn giữ dao.
Wall jump: Custom, 2–3 hình; không dùng Backflip làm thay thế.
Hurt: Skeleton v3 / Reactions, 2–3 hình, không thêm stun ngoài luật game.
Death: Custom, 5–6 hình; không bóp scale đứng thành quỳ. Không dùng Getting up phát ngược làm death cuối vì trọng lượng/đường vải không đúng.
Echo bell skill: Custom, 4–6 hình. Tay trống chạm/rung chuông ngực, dao ở tay chiến đấu. Hình/âm phát theo event Vọng thật, không đợi clip hết; không thêm nút hoặc đổi quy trình ghi/phát để hợp clip.

Free motion: KHÔNG dùng làm mặc định cho locomotion đã chạy nhất quán. Chỉ thử có giới hạn cho một động tác Custom quá cứng sau khi reference, direction, skeleton đã đúng. Lưu mọi output; lấy phần tốt, đừng tạo lại cả character vì một clip lỗi.

CUSTOM ACTION PROMPTS — CAMERA SIDESCROLLER, DIRECTION EAST CHỌN RIÊNG

Jump/landing nếu cần:
Jump upward, settle at the apex, fall with the coat hem lifted, then land softly. Face right throughout. Preserve body scale, gear and amber eye. No somersault or effects.

Slash1:
One quick horizontal tuning-fork slash facing right: compact wind-up, crossing motion, strong forward cut, follow-through, low guard. Keep the same short two-pronged blade and amber eye. No projectile or VFX.

Slash2:
Continue from a low guard into one rising diagonal slash from lower-left to upper-right, then recover. Face right, same fork blade, compact shoulder motion. No spin or VFX.

Slash3:
A heavy final combo hit: lift the fork blade above the shoulder, deliver a decisive forward-downward chop, settle low, return to guard. Face right. Preserve proportions and all gear. No VFX.

Up slash:
Crouch slightly and cut straight upward in front of the body with the fork blade, finish above the hood, recover. Face right. No jump, spin or effects.

Pogo:
Airborne downward strike: immediately point the short fork blade down with a bent elbow, hold the compact falling pose, then recoil upward on contact. Face right, cloak trailing, no long shaft, beam or effects.

Dash:
A short fast dash to the right: lean low, keep the blade close, scarf and coat trail behind, return to running. No roll, flip, teleport or effects.

Wall hook:
Hang and slide on a wall to the RIGHT using a small iron hook in the far hand above the head. Combat hand keeps the fork blade low. Tiny boots brace the wall. Same body size as idle, no drawn wall or effects.

Wall jump:
From the RIGHT wall, retract the hook and push away to the LEFT, tuck the hook close, coat trailing toward the wall. Keep the fork blade and body scale. No flip, drawn wall or effects.
Chú ý hướng mô tả đổi sang trái ở đây có thể không tương thích direction East cố định của tool. Nếu tool chỉ cho một hướng mặt, gen pha tháo móc trong hướng đang bám và dùng clip nhảy hướng rời vách đã duyệt; không dùng prompt mâu thuẫn rồi regen vô hạn. Kiểm cả hai vách sau khi lật.

Hurt nếu cần Custom:
Recoil briefly from a hit coming from the right, then regain balance facing right. Preserve gear and proportions. No blood, flash, fall or new accessories.

Death:
Lose strength, kneel, bow the hood and collapse quietly into the cloak. Amber eye goes dark. Keep natural body volume and the fork blade. No gore, stretching, explosion or effects.
Phần tan bụi/âm chuông code ghép sau, không tiêu lượt cho AI vẽ cả nền/VFX.

Echo bell:
Face right, keep the fork blade low in the combat hand, use the free hand to gently ring the small CHEST bell once, then return to idle. Do not ring the hood-tip bell. No magic effects or new objects.

6. TIMING VÀ GHÉP VÀO GAME

- Số khung không thay startup/active/recovery. Claude map frame theo atkT/hộp thật, giữ hitstop và cancel; mô tả “6 frames” không có nghĩa 6 tick.
- Chạy theo 132 px/vòng ở 264 px/s như hiện có. 6 hình là 22 px pha/hình nếu chia đều; chỉ chỉnh chia pha sau khi xem chân trụ.
- Không thêm bob bằng code nếu PixelLab đã có bob; tránh cộng hai lần.
- Chết, wall jump và Vọng là state/event-driven; không đợi toàn clip làm thay thời điểm gameplay.
- Giữ cỡ nhân vật xuyên trạng thái; không auto-crop rồi auto-center làm người rung.
- Clip chém xuất cả VFX nếu tool tự sinh: giữ bản gốc, tách/loại VFX thừa để không có hai cung chồng. Đừng xóa luôn lưỡi dao.
- Chưa đổi P0-B/P0-C chính. Làm trang tích hợp riêng, cùng một build hai chế độ A/B nếu thử lại.

7. TIẾT KIỆM LƯỢT

Thông tin 40 lượt ban đầu/5 mỗi ngày/~3 mỗi animation là Claude báo từ giao diện người dùng, tôi chưa xác minh tài khoản. Không tính chắc toàn bộ bộ động tác đủ gói miễn phí. Công cụ có tên gần nhau nhưng model/quota khác nhau.

Tài liệu chính thức đã kiểm ngày 30/10/2026:
- Animate with skeleton khuyên chọn canvas vừa nhân vật, chỉnh skeleton và có fixed head để giúp giữ mặt nếu giao diện đang dùng có tùy chọn này.
- Animate with Text Pro là công cụ khác: tài liệu ghi yêu cầu Tier 1, 32/64px có thể trả 16 frame và tốn 10 generations. Không coi đây là “Custom luôn tốn 3 lượt”.
- Creator/web, API và extension không mặc định cùng tùy chọn/giới hạn. Claude đọc giá hiển thị ngay trước Generate và ghi mode/model, hướng, cỡ, chi phí.

Kế hoạch theo cổng duyệt:
A) Tạo character từ South+East. Kiểm mắt hổ phách, hai chuông, một đèn ba lô, một Âm Đao. Lưu character ID và export reference. Nếu sai, sửa reference/hướng này trước, không animate tiếp.
B) Một lượt Running6 East, xem đúng cỡ game. Nếu sai mắt nhưng gait tốt, thử sửa cục bộ/palette vùng mắt; không regen gait đẹp.
C) Một lượt Slash1 East. Đây là bài khó thứ hai kiểm khả năng giữ vũ khí. Hai clip đạt mới mở rộng.
D) Idle, Jumping, Dash, Hurt bằng template; tái dùng phần phù hợp giữa trạng thái.
E) Slash2/3, Up, Pogo, wall hook/jump, Echo và death theo ưu tiên gameplay đang kiểm. Chưa cần Walking riêng nếu game không dùng.
F) Free motion chỉ một clip thí điểm, không chạy hàng loạt.

Ví dụ nếu 40 lượt và đúng 3 lượt/job: dành 6 lượt tạo/sửa reference, 6 cho run+slash1, 6 cho locomotion thiết yếu, 12 cho 4 custom quan trọng, 10 dự phòng. Đây là phân bổ giả định, KHÔNG bảng giá. Nếu job báo 10 lượt, tính lại và dừng mở rộng; không dùng hết để quay nhiều hướng không cần.

Không tiêu lượt cho north/south animation trong game nhìn ngang, tăng cỡ vô ích, regen nguyên clip chỉ để có đúng số frame, hoặc VFX/bụi có thể code. Không tạo character mới cho mỗi action. Lưu cả seed/settings khi có, frame durations, raw PNG và kết quả tốt mỗi lần.

8. KIỂM SAU KHI PIXELLAB XUẤT

- South đúng chính diện, East không bị top-down; mũi giày cùng hệ neo.
- Mắt cam/amber, không xanh; chuông tip và chest không sinh thêm/bớt.
- Đèn ba lô không biến thành đồ cầm tay; không che mất vũ khí/đường tay.
- Hai nhánh dao còn phân biệt, không nối thành muỗng hoặc biến thành rìu qua từng frame.
- Móc chỉ xuất hiện khi bám/nhả móc, không lớn bằng người.
- Không áo/bàn tay biến dạng rõ lúc đổi state, không toàn thân phình khi wall.
- PNG native, alpha sạch, không viền trắng, cùng palette hợp lý; preview bằng nearest-neighbor.
- Chạy liên tục trên Safari có nút/ngón tay, tắt VFX rồi bật lại, không chỉ xem GIF phóng 4×.

NGUỒN CHÍNH THỨC
https://www.pixellab.ai/docs/tools/animate-with-skeleton
https://www.pixellab.ai/docs/tools/animate-with-text-pro
https://www.pixellab.ai/docs/guides/rotating-a-character
https://api.pixellab.ai/v2/docs
Các URL để Claude kiểm đúng công cụ. Không dùng giá API làm giá lượt web.

GỬI CLAUDE

Dùng gói South/East PNG 64×64 đính kèm, KHÔNG upload preview x4. Đây là ảnh gen đã chuẩn hóa lưới/palette, chưa phải reference PixelLab đã duyệt; kiểm East còn góc 3/4 và tay/vũ khí. Create from Reference: Humanoid, Sidescroller, South chính diện + East quay phải; một character ID, chỉ animate East trước. Dán description, khóa mắt AMBER, đúng 2 chuông và đèn gắn ba lô. Kiểm scale 54px thân/neo y59, không resize từng frame. Tạo Running6 Skeleton v3 và Slash1 Custom trước, ghi giá/model thực trước mỗi job; chưa làm cả bộ hoặc các hướng thừa. Chỉnh skeleton/fixed head nếu giao diện hỗ trợ. Chỉ khi hai clip đạt mới làm các action còn lại theo bảng. Giữ luật atkT/hộp/cancel/pogo và trang P0 chính; thử bản tích hợp riêng trên iPhone thật, lưu raw/settings/log và budget. Nếu PNG bị từ chối hoặc East sai góc, chuẩn hóa/chuyển hướng trong PixelLab trước, không tiêu tiếp lượt animation để che lỗi reference.
