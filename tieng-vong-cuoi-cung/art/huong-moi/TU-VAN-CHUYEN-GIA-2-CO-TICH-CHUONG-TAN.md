TIẾNG VỌNG CUỐI CÙNG — NHẬN XÉT HƯỚNG MỸ THUẬT VÀ PROMPT
Ngày: 27/10/2026

Bối cảnh: game metroidvania HTML5 Canvas, iPhone ngang, màn logic 960×540, Lam cao 112 px. Asset gen bằng ChatGPT, Claude xử lý bằng code; hoạt ảnh cutout mảnh rời.
Phạm vi: nhận xét từ ảnh được gửi. Chưa kiểm tra hoạt ảnh hoặc hiệu năng trên iPhone. Các số dưới đây là mức khởi đầu để thử, không phải kết quả đo trong game.

ĐỊNH HƯỚNG CHÍNH

Tôi khuyên chuyển sang hướng “Cổ tích chuông tàn”: hình khối đơn giản, màu khoáng trầm, ánh sáng có chọn lọc và chuyển động có sức nặng. Giữ kỹ thuật cutout, nhưng thay ngôn ngữ tạo hình của Lam.

Qua ảnh, vấn đề không chỉ là màu tươi. Lam có mũ rất lớn, thân như viên tròn, mắt to sáng, găng và ủng giống đồ chơi; quái chuông có rêu xanh chói và dáng nắm đấm hoạt náo. Trong khi đó, nền lại nhiều chất liệu và ánh sáng tự nhiên. Nhân vật và thế giới đang kể hai câu chuyện khác nhau.

Tranh mở đầu có thứ anh cần: nhân vật nhỏ trước không gian khổng lồ, những khoảng tối yên tĩnh và ánh vàng dẫn mắt. Nên lấy quan hệ sáng–tối và cảm giác quy mô của tranh này làm chuẩn, không mang toàn bộ chi tiết tranh vào sprite.

1. BA HƯỚNG CÓ THỂ CHỌN

Các game dưới đây là tham khảo từng yếu tố, không phải yêu cầu sao chép toàn bộ phong cách.

A. CỔ TÍCH CHUÔNG TÀN — KHUYẾN NGHỊ
- Tham khảo Hollow Knight về silhouette; Children of Morta về cảm giác cổ xưa.
- Mảng lớn, đường nét tiết chế, màu trầm, điểm sáng ấm, vải hơi bất đối xứng.
- Hợp nhất với quy trình hiện tại: dễ gen, dễ tách mảnh, ít cần biến dạng.

B. LINH GIỚI ÁNH NGỌC
- Tham khảo Ori về ánh sáng; Gris về khoảng trống và màu cảm xúc.
- Ít viền, hình mềm, nhiều lớp sáng và sương.
- Làm được nhưng khó đồng bộ ánh sáng và dễ thành cảnh mờ.

C. DI TÍCH TÍN HIỆU
- Tham khảo Hyper Light Drifter về màu nhấn và cảm giác bí ẩn.
- Hình góc cạnh, bảng màu hẹp, dấu hiệu phát sáng, động tác sắc.
- Hợp cutout, nhưng sẽ đổi bản sắc Làng Chuông nhiều hơn.

Với hướng Cổ tích chuông tàn:
- GIỮ: mũ nhọn, mặt tối, mắt vàng, chuông cổ, dao ngắn, màu xanh làm dấu nhận diện.
- GIẢM: độ tròn đều, tỷ lệ mũ quá lớn, cyan phủ quanh toàn bộ mặt, viền đen dày ở mọi chi tiết.
- BỎ: bóng đa giác vụn, rêu xanh chanh, mọi vật đều bóng và sáng như đồ chơi.
- THÊM: vải cũ, vài đường bất đối xứng, đồng xỉn, hình dáng có vẻ đã trải qua thời gian.

Không nên chỉ phủ một lớp tối lên asset cũ: chúng vẫn giữ tỷ lệ và biểu cảm đồ chơi.

2. LAM: ĐỔI SILHOUETTE TRƯỚC, CHƯA CẦN QUAY LẠI RIG KHUỶU–GỐI

Đề xuất bản thử ở đúng 112 px:

MŨ/ĐẦU
- Vấn đề: chiếm quá nhiều chiều cao, làm thân giống em bé.
- Sửa: cho khối mũ chiếm khoảng 45–50% chiều cao; kéo dài áo xuống, vẫn giữ tổng cao 112 px.

MẶT
- Vấn đề: hai mắt lớn tạo cảm giác thân thiện rõ rệt.
- Sửa: mắt nhỏ hơn, hơi khác độ cao; profile chỉ cần một mắt rõ, khoảng 2×4 px khi thu nhỏ.

VIỀN TEAL
- Vấn đề: thành dải neon rất rộng.
- Sửa: thu thành nẹp vải mảnh, xanh ngọc xám; chỉ một đoạn bắt sáng.

THÂN
- Vấn đề: viên tròn giống đồ chơi.
- Sửa: áo dáng chuông hoặc giọt nước, vai hẹp, vạt dưới lệch nhẹ.

GĂNG/ỦNG
- Vấn đề: to, nổi riêng như các món đồ rời.
- Sửa: găng nhỏ hơn; ủng thấp, một phần cổ ủng nằm dưới vạt áo.

CHUÔNG
- Vấn đề: nhiều ánh bóng, luôn nổi bật.
- Sửa: đồng cũ, một mảng sáng; sáng mạnh khi dùng Vọng.

DAO
- Vấn đề: dễ tranh điểm nhìn với mặt.
- Sửa: lưỡi màu ngà xám, ít chi tiết, vàng chỉ ở chắn tay.

CÓ NÊN BỎ TAY CHÂN RỜI?

Giữ mảnh rời trong rig, giảm cảm giác rời trong hình.
- Tay gần nằm sát hoặc chồng nhẹ lên bóng áo; tay xa có thể khuất một phần.
- Ủng xuất hiện từ dưới vạt áo thay vì luôn cách thân một khoảng trắng.
- Chỉ để khoảng hở rõ khi hành động cần đọc silhouette.
- Không thêm các đoạn ống tay/chân nhỏ và khớp tròn trở lại.

Một rig khoảng 10–12 mảnh là đủ: mũ, chóp, thân áo, vạt trước/sau, hai găng, hai ủng, dao, chuông, mắt. Tách dao khỏi tay sẽ dễ chém và điều chỉnh hướng hơn.

3. ÁNH SÁNG: LÀM CHIỀU SÂU TRƯỚC, HIỆU ỨNG SAU

Trong ảnh Rễ Mục, nền đã có không khí tốt. Phần phá cảm giác đó là thân địa hình có quá nhiều rễ nhỏ tương phản gần bằng nhau và cạnh cắt vuông rất rõ. Làm dịu những mảng này sẽ có ích hơn thêm sương.

P0 — PHÂN CẤP SÁNG–TỐI
- Nền xa ít tương phản; sàn chơi rõ; Lam và tín hiệu nguy hiểm nổi nhất.

P0 — ĐIỂM SÁNG CÓ Ý NGHĨA
- Đèn vàng dẫn đường; teal dành cho Vọng và ký ức; cam đỏ báo nguy hiểm.

P1 — ÁNH SÁNG ĐIỂM VẼ SẴN
- Quầng nhỏ quanh đèn/chuông; không biến cả căn phòng thành màu vàng.

P1 — SƯƠNG SAU ĐỊA HÌNH
- Một lớp mỏng ở vực sâu, không phủ mặt sàn và nhân vật.

P1 — VIGNETTE NHẸ
- Tối góc khoảng 8–15% để thử; tránh che vùng tiếp đất.

P2 — BỤI SÁNG
- Thử 12–24 hạt nhỏ trong vùng sáng, không rải đều toàn màn.

P2 — RIM LIGHT
- Vẽ sẵn một đoạn sáng trên mũ/vai, tránh đường neon bao toàn thân.

BẢNG MÀU KHỞI ĐẦU
- Nền sâu: #17272C
- Gỗ tối: #39312E
- Gỗ bắt sáng: #65503C
- Áo Lam: #35465C
- Nẹp teal: #648D88
- Đồng cũ: #A78046
- Mắt và lõi đèn: #F2D69A

Các màu này cần thử cạnh nhau ở 112 px; không bắt buộc dùng nguyên xi.

Với Canvas, tạo trước quầng sáng, vignette và sprite sương rồi tái sử dụng. Tránh làm blur hoặc xử lý pixel cả màn mỗi khung; MDN khuyến nghị vẽ sẵn nội dung lặp và hạn chế shadowBlur. Hiệu năng thực tế vẫn cần đo trên iPhone của anh.
Nguồn: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

Chiều sâu cảm xúc còn đến từ sự thay đổi có nguyên nhân: một chuông trong làng tắt khi Lam đi qua; bóng Vọng vẫn tiếp tục động tác bên một chỗ trống; càng xuống sâu càng ít chuyển động môi trường. Đừng để mọi chuông, đèn và hạt bụi cùng hoạt động liên tục.

4. CUTOUT BỚT CỨNG: ƯU TIÊN NHỊP VÀ ĐƯỜNG CHUYỂN ĐỘNG

Từ ảnh tĩnh, tôi chưa thể kết luận vòng chạy đang giật ở đoạn nào. Tuy nhiên, thêm squash/stretch sẽ không sửa được một quỹ đạo chân hoặc tư thế chính chưa tốt.

Nên chỉnh theo thứ tự:

1) Tư thế chính: chịu lực thấp, đạp đất rõ, bay khác đứng. Cho thân dẫn hành động, tay và đồ vật theo sau.
2) Nhịp: có nén ngắn trước đạp/chém, chuyển động nhanh trong lúc phát lực, rồi hồi chậm hơn. Tránh mọi mảnh chạy cùng một đường sin.
3) Động tác phụ có quan hệ: thân đổi hướng → mũ trễ → chóp và chuông trễ thêm. Không cho từng mảnh lắc độc lập.
4) Vải: dùng hai mảnh vạt áo xoay ít quanh điểm neo ẩn; không cần mô phỏng vải.
5) Squash/stretch nhỏ: thử thân biến dạng 2–3% khi tiếp đất; đầu gần như giữ nguyên. Tránh kéo giãn toàn nhân vật.
6) Thở: thân lên xuống dưới 1 px, chu kỳ khoảng 2,5–4 giây để thử; thỉnh thoảng nghiêng đầu nghe chuông thay vì nảy liên tục.

Để tạo chất huyền bí, dáng nghỉ nên là Lam đang lắng nghe, không phải một món đồ chơi đang nhún.

5. THỨ TỰ LÀM LẠI ÍT TỐN CÔNG NHẤT

Đừng gen lại toàn bộ game ngay. Làm một cảnh chuẩn duy nhất:

1) Chọn một góc Làng Chuông 960×540: một đèn, một chuông tắt, một vực tối, ít đồ vật.
2) Sửa màu và tương phản bằng code với Lam cũ: giảm nhiễu thân đất, hạn chế ánh sáng, tạo khoảng yên tĩnh.
3) Gen một Lam mới đã ráp hoàn chỉnh, đặt cạnh Lam cũ trong cùng cảnh, cùng chiều cao 112 px.
4) Duyệt silhouette và màu, sau đó mới tách mảnh. Không gen đồng thời nhiều bảng parts trước khi chốt thiết kế.
5) Làm thử đứng, chạy, chém; duyệt chuyển động rồi mới chuyển quái và boss sang cùng hướng.

Tiêu chí duyệt:
- Nhìn ở cỡ chơi vẫn nhận ra mắt–mũ–chuông.
- Lam không chìm trong tối.
- Cảnh có một điểm thu hút chính.
- Không cần thêm sương mới thấy chiều sâu.

6. NĂM PROMPT THỬ HƯỚNG “CỔ TÍCH CHUÔNG TÀN”

Khi gen Lam, gửi ảnh Lam cũ để giữ danh tính và tranh mở đầu để lấy không khí. Nói rõ tranh mở đầu chỉ là tham khảo màu và cảm xúc. Sau khi chốt Lam mới, dùng chính ảnh đó cho mọi lần gen tiếp theo.

PROMPT 1 — LAM, BẢN THIẾT KẾ HOÀN CHỈNH, CHƯA TÁCH MẢNH

Redesign the attached bell-keeper for a melancholic woodland folktale game. Full side view facing right, readable at 112 pixels tall. Deep slate-blue pointed hood occupying about half the total height, narrow faded teal trim, shadow-black face, one small warm amber eye, worn bell-shaped cloak, small leather gloves and boots, old brass neck bell, short iron dagger. Hands close to the cloak, boot tops concealed by the hem, no visible limb joints. Quiet listening pose, restrained dark contours, broad flat painted shapes, two shadow tones, minimal texture. Pure white background, no text.

PROMPT 2 — LAM, BẢNG MẢNH; CHỈ DÙNG SAU KHI DUYỆT ẢNH TRÊN

Use the approved character exactly, without redesigning or changing proportions. Side-view cutout animation parts: hood without eye or tip, hood tip, cloak body, front hem, rear hem, near glove, far glove, near boot, far boot, dagger, brass bell, one amber eye. Preserve assembled relative scale. Fully paint hidden overlap areas with plain rounded ends. No joint circles or hollow cuffs. Restrained dark contours, muted flat colors. Separate pieces with generous space, pure white background, no labels.

PROMPT 3 — QUÁI CHUÔNG GỖ, CỔ XƯA, KHÔNG HOẠT NÁO

A haunted wooden temple bell for a melancholic woodland folktale game, side view facing left, readable at 112 pixels tall. Weathered grey-chestnut wood, sparse dull olive moss, an uneven cracked rim, one small ember eye deep in shadow, a wooden clapper, two suspended root fists held low. Solemn and unsettling, not grinning or muscular. Broad irregular shapes, restrained charcoal contours, two flat shadow tones, very few cracks, no glossy facets. Match the attached approved hero. Pure white background, no text.

PROMPT 4 — CẢNH CHUẨN LÀNG CHUÔNG, DÙNG DUYỆT HƯỚNG, CHƯA LÀM PARALLAX

Gameplay art-direction mockup, 1920x1080, strict 2D side view. A quiet bell village inside one colossal hollow tree: towering concave wood walls, distant suspended bells, one small abandoned balcony, one warm lantern, a dark opening descending toward the roots. A clear continuous root walkway across the lower quarter, generous empty space around the playable area. Muted indigo, grey-teal and umber, selective amber light, broad painted shapes, sparse texture, subtle depth haze, melancholic and mysterious. No outdoor sky, characters, UI or text.

PROMPT 5 — NỀN XA, CHỈ GEN KHI ĐÃ DUYỆT CẢNH CHUẨN

Single FAR background layer matching the approved hollow-tree village scene, 1920x1080. Colossal concave inner wood walls receding into blue-teal darkness, a few tiny silent hanging bells, sparse distant amber windows. Broad quiet shapes, low contrast, minimal grain, restrained painted shadows, no bold foreground outlines. No floor, walkable platforms, near roots, characters, UI or text. Full-bleed opaque background, atmospheric but readable.

CHỐT THỬ NGHIỆM

Giữ engine và rig modular, làm Lam bớt tròn và bớt neon, dùng áo che các chỗ tách mảnh, rồi đặt vào một cảnh có khoảng tối rộng và ánh vàng tiết chế. Đây là bước chuyển rõ nhất mà chưa buộc anh phải làm lại toàn bộ tài sản.
