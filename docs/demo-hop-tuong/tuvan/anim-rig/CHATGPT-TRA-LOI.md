# Tư vấn ChatGPT: pipeline ảnh AI + animation code (09/11)


TURRET MERGE — Thiết kế pipeline ảnh AI và animation 2D chuyên nghiệp

Tài liệu kỹ thuật đề xuất · HTML5 Canvas 2D · Mobile iPhone · 93 ụ · 12 boss

Tôi đã đọc toàn bộ file TUVAN-ANIM-CHATGPT.md, bao gồm pipeline 4 lớp của ụ, 13 nhóm animation trong anim.js, hệ thống TRUM_ANIM_CODE, các dải sprite 8 khung, cơ chế báo chiêu 1,4 giây và những lỗi phát sinh khi sinh ảnh bằng AI.
TUVAN-ANIM-CHATGPT.md

Kết luận thiết kế trước khi đi vào Q1–Q10

Hướng chuyển từ sprite sheet AI sang một ảnh master và animation bằng code là đúng. Nhưng với boss, cần tiến thêm một bước: từ một ảnh master bị biến đổi sang một bộ rig 2D gồm các lớp có quan hệ cha–con, neo chính xác và timeline riêng cho từng kỹ năng.

Tôi đề xuất giữ ba pipeline:

A. Turret Rig Lite — 93 ụ

Giữ hệ thống _de, _vien, _nong, _phu. Chỉ bổ sung lớp động khi cơ chế thực sự cần. Đa số ụ nên có 3–5 lớp runtime.

B. Enemy Hybrid — quái thường và tinh anh

Quái thường dùng ảnh master cộng chuyển động code hoặc sprite sheet đã ổn định. Tinh anh dùng 3–5 lớp, có các bộ phận chuyển động độc lập và báo chiêu riêng.

C. Boss Rig Pro — 12 boss

Khoảng 4–8 lớp hình học chính, 1–3 lớp VFX tùy boss; có root, pivot, socket, transform phân cấp, timeline và animation sự kiện. Hình học của boss không đổi giữa các trạng thái.

Ba nguyên tắc cần khóa ngay:

Một hình dạng chỉ có một nguồn hình học master. Không sinh lại từng khung hoặc từng form độc lập rồi cố ghép bằng code.

Pivot và socket là dữ liệu thiết kế, không phải tâm mà AI tình cờ vẽ ra. Script đo alpha để kiểm tra và hỗ trợ hiệu chỉnh, không tự quyết định tất cả.

Animation chỉ đọc trạng thái gameplay. Tất cả tư thế được tính từ thời gian tuyệt đối và sự kiện đã xác nhận; không thay đổi luật game và không dựa vào FPS.

Các số liệu dưới đây là quy chuẩn đề xuất và ngưỡng QA khởi đầu, không phải thông số đã được thử nghiệm trên thiết bị của dự án.

Q1. Chiến lược tách lớp cho từng loại
1.1. Cấu trúc lớp chuẩn

Đối tượng

Các lớp cần có, theo thứ tự trước → sau

Bộ phận động

Ụ thông thường

Shadow → Rim → Base → Head → Emissive → Muzzle FX

Head xoay, recoil

Ụ đặc biệt

Shadow → Base → Rotor dưới → Head → Part B → Glow → FX

Head, rotor, phần phụ

Quái nhỏ

Shadow → Body → Eyes/Core → Hit FX

Body nảy, nghiêng; core nhấp nháy

Quái tinh anh

Shadow → Rear → Body → Core → Front/Armor → Glow → Skill FX

2–4 phần độc lập

Boss

Shadow → Rear parts → Body → Inner core → Front parts → Emissive → Cast FX

3–7 phần độc lập

Đạn

Trail → Projectile → Highlight

Xoay, scale, opacity

Nổ

Shockwave → Burst → Sparks

Scale, opacity, đổi frame

Aura

Back ring → Aura → Front ring

Xoay ngược, pulse

Tia

Beam body → Impact → Highlights

Kéo dài, đổi alpha, pulse

z-order nên cố định và thống nhất trong từng nhân vật:

Z

Vai trò

0

Bóng

10

Phụ kiện sau thân

20

Thân chính / bệ

30

Lõi hoặc chi tiết trong thân

40

Bộ phận chuyển động phía trước

50

Mắt, ngọc, dấu hiệu phát sáng

60

Hiệu ứng phát sáng gắn với nhân vật

70

Hiệu ứng tung chiêu

90

Hit/Death FX

Đây là thứ tự cục bộ trong một đối tượng. Bộ renderer cần đưa cả cụm đối tượng vào thứ tự toàn cảnh theo vị trí chân trên đường đi; không để từng lớp của một boss bị chèn xen tùy tiện với các đối tượng khác.

1.2. Quy tắc tách lớp riêng cho boss

Một boss không nhất thiết cần tay, chân hoặc xương như nhân vật humanoid. Với nhóm boss dạng vật thể của Turret Merge, nên chia theo bộ phận có chuyển động độc lập, không chia theo cấu tạo giải phẫu.

Ví dụ Joker King:

Minh họa thứ tự lớp logic, không phải hình sprite cần xuất.

Mỗi bộ phận có hệ tọa độ riêng. Đầu hề có thể nhô lên mà thân hộp đứng yên; nắp có thể rung lệch pha; ánh sáng có thể tăng mà không làm biến dạng hoa văn trên thân.

1.3. Đề xuất rig cho đủ 12 boss

Boss

Lớp tách quan trọng

Animation đặc trưng

Mad Crown

Jelly body, Crown, Gold gem, Inner glow

Thạch nhún; vương miện rung trễ; ngọc tụ sáng

Freezer

Ice core, Outer armor, Crystal shards, Frost aura

Tinh thể rung nhẹ; vòng băng lan ra

Janus Cube

Cube body, Face/emblem, Edge glow, Stone fragments

Nghiêng khối; đổi mặt bằng ảnh pose

Joker King

Box body, Lid, Spring, Joker head, Inner light

Nhảy; nắp mở; đầu bật ra

Nightmare

Main silhouette, Eyes, Void veil, Shadow wisps

Lơ lửng; thân co giãn; khói ma

Octopus Eyes

Main eye/body, Orbiting eyes, Vein ring, Burn glow

Mắt vệ tinh quay; đồng tử co; phát tia

Hive Mother

Hive body, Central core, Wing/vent panels, Bees

Rung ổ; ong bay vòng; mở cửa tổ

Static Jammer

Base, Dome, Antenna, Signal halo, Static sparks

Ăng-ten lắc; halo quay; xung nhiễu

Prism Warden

Crystal body, Prism core, Rotating facets, Shield ring

Mặt tinh thể đổi sáng; khiên quay

Twin Core

Core A, Core B, Connector, Shared aura

Hai lõi đối xứng, mở rộng rồi tách

Patch Titan

Main armor, Repair plates, Bolts, Repair glow

Tấm giáp trượt; lõi hồi phục; xung sửa chữa

Star Leech

Body, Mouth/core, Floating star, Energy tendrils

Hút sao; lõi co giãn; xung năng lượng

Với các boss dạng vật thể không tay chân, không nên ép AI vẽ thêm tay/chân chỉ để animation có vẻ sinh động.

Điểm cần chú ý:

Mad Crown: jelly và ngọc có thể cùng nhún, nhưng crown phải được neo vào mặt trên của jelly bằng một socket động.

Twin Core: hai lõi nên là con của một root chung; khi có sự kiện tách thực sự, renderer chuyển sang hai thực thể có ID riêng theo gameplay.

Janus Cube: quay sprite phẳng 90° không tương đương với lăn một khối lập phương trong không gian 3D. Nếu cần thấy các mặt khối thay đổi, hãy dùng 2–4 ảnh pose cố định, còn code điều khiển chuyển động giữa chúng.

Joker King: nắp hộp mở theo bản lề không thể thể hiện đầy đủ bằng ctx.rotate() trong một góc nhìn từ trên xuống. Nên có ít nhất hai pose nắp: đóng và mở, rồi kết hợp xoay/dịch chuyển/cross-fade.

1.4. Overdraw — phần hình bị che sau khớp

Có, cần overdraw. Đây là yếu tố quan trọng để tránh khe trắng xuất hiện giữa các bộ phận khi chúng chuyển động.

Loại khớp

Overdraw đề xuất

Nòng súng gắn với thân

6–10% chiều dài phần nối

Nắp hộp / bản lề

10–15% chiều rộng khớp

Mảng giáp trượt

8–12% chiều dài vùng chồng

Tinh thể gắn quanh lõi

5–8%

Bộ phận thạch mềm

12–20% tại ranh giới tách

Lò xo nhô khỏi hộp

Phần chân lò xo giấu sâu 10–15% trong hộp

Các tỉ lệ này tính trên kích thước bộ phận hoặc vùng khớp, không phải toàn bộ canvas.

Nếu một chi tiết chuyển động ra khỏi vị trí ban đầu, phải vẽ phần thân nằm bên dưới nó. Không được đơn giản xóa nắp khỏi ảnh master rồi để lộ một khoảng trong suốt.

Q2. Quy chuẩn canvas, kích thước, pivot và vùng an toàn
2.1. Phân biệt 3 loại kích thước

Nên tách hẳn:

Master canvas: hình độ phân giải cao dùng để thiết kế, tách lớp, giữ hình học.

Export PNG: ảnh đã xử lý alpha, có thể cắt phần trong suốt và thu nhỏ.

Display CSS: kích thước thực tế trên bàn chơi.

Không dùng pixel ảnh làm đơn vị cho gameplay hoặc animation.

2.2. Kích thước đề xuất

Loại

Master sinh ảnh

Export hợp lý

Kích thước hiển thị tham chiếu

Turret

512×512

256–448 px

35–130 CSS px

Quái thường

512×512

128–256 px

30–65 CSS px

Quái tinh anh

768×768 hoặc 1024×1024

256–384 px

55–110 CSS px

Boss

1024×1024

384–640 px

90–180 CSS px

Projectile

256×256 hoặc 512×512

64–192 px

10–50 CSS px

Explosion

512×512

256–384 px

35–120 CSS px

Aura / Shockwave

512×512

256–512 px

50–160 CSS px

Kích thước export là cỡ canvas logic trước khi trim, không có nghĩa mọi lớp đều phải lưu PNG vuông lớn bằng nhau. Ví dụ một viên ngọc chỉ chiếm 40×40 px sau khi cắt vẫn nên lưu ở 40×40, không phải một ảnh 384×384 với phần lớn trong suốt.

2.3. DPR 3: chọn cỡ ảnh thế nào?

Với thiết bị DPR 3:

Kích thước CSS tối đa

Pixel vật lý tương ứng

Export khuyến nghị

46 px

138 px

160–192 px

70 px

210 px

224–256 px

90 px

270 px

288–320 px

110 px

330 px

352–384 px

130 px

390 px

416–448 px

180 px

540 px

576–640 px

Với ụ hiển thị tối đa 130 CSS px, tôi chọn export 416 px hoặc 448 px, nếu thực sự cần đạt DPR 3 tại mức phóng to đó.

Tuy nhiên, không nên tải 93 loại ụ đồng thời ở độ phân giải này. Hãy tải các ảnh của deck đang dùng và những asset cần cho màn chơi. Bản 256 px đủ cho nhiều trường hợp khi ụ được hiển thị nhỏ hơn.

Nếu có nhiều mức zoom, nên cân nhắc hai biến thể @1.5x và @3x, thay vì buộc mọi thiết bị tải bản lớn.

2.4. Quy chuẩn pivot

Toàn bộ dữ liệu dùng hệ tọa độ chuẩn hóa:

Góc trên trái: (0,0)

Tâm: (0.5,0.5)

X tăng sang phải.

Y tăng xuống dưới.

Hướng mặc định của nòng: lên trên, vector (0,-1).

Góc quay 0 radian = lên trên; góc dương quay theo chiều kim đồng hồ.

Đối tượng

Pivot gốc đề xuất

Lưu ý

Bệ ụ

(0.50, 0.50)

Không xoay

Đầu súng

(0.50, 0.50)

Cố định tại trục thực

Bộ phận quay

Tâm quay thực

Không nhất thiết là tâm bbox

Quái bò

(0.50, 0.78)

Root tại điểm tiếp đất

Quái bay

(0.50, 0.76)

Root là hình chiếu xuống mặt đất

Boss dạng thạch

(0.50, 0.80)

Giữ đáy khi squash

Boss hộp / máy

(0.50, 0.82)

Bóng và root đứng yên

Nắp Joker King

Socket bản lề riêng

Không dùng tâm ảnh

Đạn

(0.50, 0.50) hoặc trọng tâm

Phụ thuộc kiểu đạn

Đây là vị trí trong khung tham chiếu, không phải lời yêu cầu AI đặt trọng tâm alpha đúng vào vị trí đó. Script phải đưa ảnh về đúng chuẩn.

2.5. Vòng tròn an toàn khi xoay 360°

Đây là quy tắc quan trọng nhất để xử lý đầu súng tràn ô.

Quy chuẩn hình học: mọi điểm alpha đáng kể của lớp quay phải nằm trong bán kính an toàn tính từ pivot, kể cả sau recoil và rung.

Gọi
𝐶
C là cạnh ô hiển thị,
𝑝
p là pivot,
𝑞
𝑖
q
i
​

là các điểm thuộc hình sau khi scale về đơn vị CSS.

Điều kiện:

𝑅
max
⁡
=
max
⁡
𝑖
∥
𝑞
𝑖
−
𝑝
∥
≤
0.47
𝐶
R
max
​

=
i
max
​

∥q
i
​

−p∥≤0.47C

Lấy 0,47C, thay vì 0,50C, để dự phòng lọc ảnh, bóng và chuyển động nhỏ.

Điều này chặt chẽ hơn quy tắc bounding-box diagonal <= cell, vì hình có thể lệch pivot.

Ví dụ ô 70 px:

Bán kính an toàn: 32,9 CSS px.

Nếu đầu súng dài 60 px và xoay quanh tâm, điểm xa nhất được phép cách tâm 32,9 px.

Nếu đầu dài và lệch trục, không chỉ cần giảm scale mà còn phải cân lại pivot.

Nếu recoil hoặc phần phụ làm điểm xa nhất vượt 32,9 px, phải giảm kích thước hoặc khai báo lớp đó được phép tràn.

Riêng boss không bắt buộc nằm trong một ô. Boss cần một vùng an toàn thị giác theo hành lang di chuyển, khác với hitbox gameplay.

2.6. Mũi nòng và lề

Đề xuất cho hình đầu súng hướng lên:

Thành phần

Vị trí / giới hạn

Pivot đầu

(0.50, 0.50)

Trục nòng

x = 0.50

Mũi nòng điển hình

y = 0.08–0.16

Mép vật thể quay

Cách mép canvas tối thiểu 5–7%

Lề ảnh tĩnh

6–10% mỗi phía

Lề boss trung tính

12–16% mỗi phía

Lề canvas FX

15–25% mỗi phía

FX tràn ra ngoài thân

Cho phép, nhưng nằm trong FX canvas riêng

Lưu ý: tip.y = 0.08 là tọa độ ảnh chuẩn hóa, không phải 8% bán kính. Socket thực tế phải lưu riêng, không suy ra đơn giản từ điểm alpha xa nhất vì bộ phận trang trí có thể dài hơn nòng.

Thay đổi quan trọng: với boss, tất cả các lớp hình học nên cùng tham chiếu đến một khung master 1024×1024. Có thể xuất file cắt gọn, nhưng không được đánh mất vị trí gốc của lớp trong khung master.

Q3. Góc nhìn: top-down hay 3/4?
3.1. Không nên trộn hai góc camera

Với Turret Merge, tôi chọn orthographic top-down 90° cho toàn bộ asset gameplay, bao gồm ụ, boss và quái tinh anh.

Không nên dùng đầu súng top-down nhưng bệ 3/4. Khi xoay đầu 360°, ánh sáng và phối cảnh không còn khớp.

Có thể dùng pseudo-3D shading: mặt kim loại có độ dày, viền nổi, phản sáng và đổ bóng được vẽ sẵn, nhưng hướng chiếu camera vẫn là từ trên xuống.

Nhóm

Góc nhìn

Xử lý hướng di chuyển

Turret head

Top-down 90°

Xoay tự do 360°

Turret base

Top-down 90°

Cố định

Quái dạng thạch/cầu

Top-down 90°

Có thể dùng một hướng

Quái bất đối xứng

Top-down 90°

3–4 ảnh hướng

Boss dạng máy/hộp

Top-down 90°

Thân cố định theo rig; xoay hạn chế

Boss có mặt trước/sau

Top-down nhất quán

Các pose hướng riêng

Đạn/tia

Top-down 90°

Xoay theo vector di chuyển

3.2. Một ảnh hay ba ảnh hướng?

Đặc điểm quái

Phương án

Hình đối xứng tròn

Một hướng, không cần xoay toàn thân

Blob không có mặt

Một master + nảy/bóp bằng code

Mắt bay có hướng nhìn

Body cố định, tách mắt để xoay

Hộp có mặt trước khác mặt sau

Front/Side/Back

Boss có chi tiết bất đối xứng

4 hướng riêng nếu bắt buộc quay theo đường

Khối lập phương lăn

Pose mặt khối thay đổi, không giả bằng xoay sprite phẳng

Nếu dùng Front / Side / Back, có thể lật Side cho bên còn lại, nhưng chỉ khi hình không có chữ, dấu hiệu hoặc chi tiết bất đối xứng cần giữ đúng.

Đối với 12 boss, không nên sinh 8 frame × 4 hướng × nhiều kỹ năng. Số lượng ảnh lớn mà còn tăng nguy cơ sôi chi tiết. Chỉ tạo các hướng riêng khi silhouette hoặc mặt trước/sau thực sự khác nhau.

3.3. Prompt khóa camera
Plain text
STRICT ORTHOGRAPHIC TOP-DOWN VIEW.
Camera directly above the object, looking vertically
down at 90 degrees.

The object lies on the horizontal game board plane.
No isometric view. No three-quarter view.
No visible front-facing vertical side panels.

The main barrel points straight toward the TOP
of the image, along the vertical center axis.
The mechanical rotation pivot is exactly at the
center of the sprite.

Keep all circular components as perfect circles,
not perspective ellipses.

Same style as attached.
Glossy stylized mobile tower-defense art,
thick clean dark outlines, chunky readable details.

Pure solid #FF00FF background.
No floor, no cast shadow, no text, no grid.

Một lưu ý: yêu cầu "perfect circles" phù hợp với bệ, rotor và vòng quay nằm trên mặt bàn. Vành dựng đứng thật trong không gian 3D không thể vừa là hình tròn top-down vừa có phối cảnh nghiêng. Những vành kiểu đó nên được thể hiện bằng ảnh front/rear riêng, hoặc đổi thiết kế thành vòng quay nằm ngang.

Q4. Prompt giữ nhất quán giữa các lớp
4.1. Quy trình nên dùng: Master-first

MASTER IMAGE

Một ảnh trung tính, hình học chuẩn, đủ bộ phận

Body / Base

Head / Lid

Core / Part B

Emissive / FX

Python exporter + Meta JSON

Tách alpha, trim, pivot, socket, kiểm tra hình học

Thứ tự ưu tiên khi làm asset:

Sinh một ảnh master đẹp và đúng silhouette.

Chốt camera, màu, khung, hướng trước khi tách.

Tách từ master bằng mask hoặc chỉnh sửa tay.

Vẽ bổ sung các vùng bị che khi cần.

Sinh riêng các lớp phát sáng/VFX.

Dựng neutral pose bằng code và so sánh lại với master.

Tại sao không ưu tiên một tấm nhiều frame? Vì việc yêu cầu AI tái tạo một nhân vật hoàn toàn đồng nhất 8 lần khó hơn nhiều so với yêu cầu giữ một hình duy nhất.

4.2. Prompt A — Bộ lớp turret trên cùng một sheet
Plain text
Create ONE 2x3 sprite-part sheet for the turret
"{TURRET_NAME}".

Same style as attached.
STRICT orthographic TOP-DOWN view, 90-degree camera.
Glossy chunky mobile tower-defense art, thick outlines.

Six equal square cells, read left-to-right,
top row first:

1. Fully assembled master turret.
2. BASE ONLY, without moving parts.
3. HEAD ONLY, pointing straight UP.
4. SECONDARY ROTOR / PART_B only.
5. INNER ENERGY CORE only.
6. EMISSIVE LIGHT DETAIL only.

The parts in cells 2-6 must be exact components
of the master design in cell 1.
Identical colors, geometry, symbols, and proportions.

All rotating parts must have their mechanical
pivot at the center of their own square cell.
The main barrel axis is perfectly vertical.
The barrel points toward the TOP edge.

The base and head must fit together exactly.
No new details. No redesign between cells.

Each part stays completely inside its cell
with at least 12% empty margin.
Use the same visual scale for corresponding parts.

Flat pure #FF00FF background.
No grid lines, no text, no labels, no shadows.

Sheet nhiều ô phù hợp để yêu cầu AI thử tách một thiết kế, nhưng không đủ tin cậy để dùng trực tiếp trong sản xuất nếu các lớp lệch hình học. Cần đối chiếu và căn lại với master.

4.3. Prompt B — Boss master và bộ lớp

Tôi đề nghị chia thành hai lượt: master trước, bộ lớp sau.

Lượt 1: Boss master

Plain text
Create ONE MASTER CHARACTER SPRITE for
"{BOSS_NAME}".

Design: {BOSS_DESIGN_DESCRIPTION}

Same style as attached.
Strict orthographic TOP-DOWN game view.
A distinctive chunky silhouette readable at 70 px.
Beautiful glossy painted mobile-game style.

Neutral idle pose, no action, no motion blur.
All parts fully assembled.
Stable mechanical anatomy and consistent proportions.

Object-creature design, no arms or legs unless
explicitly specified.

The full character is centered horizontally.
Ground contact point is at 50% width,
82% height of the reference canvas.

Leave 15% safety margin around the character.
Clear separation between moving parts.

Flat solid #FF00FF background.
No shadow, no text, no border, no particles.

Lượt 2: Tách bộ phận từ master đã duyệt

Plain text
Using the ATTACHED MASTER as the exact design
reference, create a 2x3 sheet of detachable parts
for the SAME boss "{BOSS_NAME}".

Cells:
1. BODY without detachable parts.
2. LID / CROWN / MAIN MOVING PART only.
3. INNER CORE / SPRING only.
4. FRONT DETAIL only.
5. GLOW DESIGN only.
6. Shadow silhouette only.

Do not redesign the character.
Preserve all details, color arrangements,
outlines, attachment geometry, and scale.

Complete the surfaces hidden behind removed parts.
No missing material at the attachment joints.

Every part must be clean and isolated.
Strict TOP-DOWN camera.
Pure #FF00FF background.
No text, no grid, no extra objects.

Nếu một boss có nắp mở, cánh vung hoặc cấu trúc bên trong, cần bổ sung ảnh pose đó từ master thay vì ép một layer 2D phải thực hiện chuyển động 3D bất khả thi.

4.4. Prompt C — Emissive/VFX
Plain text
Create ONE isolated game VFX sprite.

Effect: {EFFECT_DESCRIPTION}
Color palette: {COLOR_PALETTE}

Same style as attached.
STRICT TOP-DOWN view.
Bright painted energy with a clearly defined core,
clean light rays and a simple readable silhouette.

The effect is centered in a square canvas.
Keep all meaningful pixels within 75% of the canvas.
The outside area must be perfectly flat #FF00FF.

No character, no weapon, no floor, no shadow,
no text, no watermark, no grid.
No large glow cloud extending to the image edges.

Với lớp glow cần alpha mềm thực sự, một lựa chọn thay thế là sinh hiệu ứng trên nền đen rồi xử lý thành emissive texture để vẽ bằng lighter. Cách này thường dễ tách màu sáng hơn nhưng cần kiểm tra compositing riêng. Không nên trộn cách xuất này với ảnh vật thể opaque mà không khai báo trong meta.

4.5. Nên đặt dấu pivot trong prompt không?

Không nên để dấu chữ thập pivot xuất hiện trong ảnh xuất cuối.

AI có thể vẽ dấu không đúng tâm, hoặc lồng dấu vào ngọc và hoa văn. Tốt hơn:

Dùng tâm cell làm mục tiêu khi prompt.

Script Python tạo overlay debug có trục X/Y, pivot và socket sau khi sinh ảnh.

Dùng overlay đó để đo/chỉnh.

Không xuất dấu debug vào PNG runtime.

Với boss không đối xứng, nên duyệt bản turnaround hoặc các key pose trước khi cắt nếu thực sự cần các hướng khác nhau. Turnaround là tài liệu thiết kế, không phải nguồn để tự động suy ra các khớp hình học 3D hoàn hảo.

4.6. Khi nào phải tách tay?

Trường hợp

Cách xử lý

Cắt lớp đơn giản, màu phân biệt rõ

Python mask + flood fill

Chi tiết có viền rõ nhưng chồng nhau

Mask bán tự động, sửa tay

Nắp che mất mặt trên hộp

Vẽ bổ sung vùng bên dưới

Lớp ngọc nằm trong thân

Tách từ master, phục hồi thân bên dưới

AI sinh phần phụ khác thiết kế

Bỏ ảnh đó, không sửa bằng transform

Boss biến hình hoàn toàn

Master pose thứ hai + transition VFX

Tôi sẽ ưu tiên tách tay một lần cho 12 boss, hơn là tiếp tục sinh hàng trăm frame rồi dùng script sửa sự thay đổi hình học.

Q5. Quy ước file và JSON meta
5.1. Cấu trúc thư mục
Plain text
assets/
turrets/
thacmana/
source/
master_1024.png
runtime/
base.png
rim.png
head.png
rotor.png
core.png
glow.png
thacmana.rig.json

bosses/
joker_king/
source/
master_1024.png
runtime/
shadow.png
body.png
lid_closed.png
lid_open.png
spring.png
head.png
inner_glow.png
joker_king.rig.json

fx/
common/
turrets/
bosses/

meta/
schema-v2.json
atlas-manifest.json

Dùng chữ thường, snake_case và một ID ổn định cho mỗi đối tượng. Tránh lấy tên hiển thị tiếng Việt làm khóa dữ liệu.

Quy ước hậu tố:

Hậu tố

Chức năng

_base / _de

Thân tĩnh / bệ

_head / _nong

Bộ phận ngắm và xoay

_rotor / _phu

Phần phụ quay

_lid_closed, _lid_open

Hai pose của nắp

_core

Lõi độc lập

_glow

Emissive

_shadow

Bóng mặt đất

_fx_cast, _fx_hit, _fx_death

VFX sự kiện

_f1 đến _f4

Các form đã chốt thiết kế

Có thể giữ hậu tố cũ của dự án trong quá trình chuyển đổi; không cần đổi tên toàn bộ ảnh đang chạy.

5.2. Schema quan trọng nhất: hệ tọa độ chung

Mỗi rig khai báo một referenceCanvas, ví dụ 512×512 hoặc 1024×1024.

Mỗi layer cần các trường:

Trường

Ý nghĩa

id

Định danh lớp

src

Đường dẫn PNG

parent

Lớp cha; null nếu gắn root

z

Thứ tự vẽ

sourceRectUV

Vị trí và kích thước của ảnh cắt trên master

pivotUV

Điểm quay trên master

anchorUV

Nơi pivot được đặt khi dựng

motion

Kiểu animation

blend

source-over, lighter, multiply...

Toàn bộ UV tính theo tọa độ master từ 0 đến 1, không tính theo bbox mới của ảnh đã trim.

Tại tư thế trung tính, anchorUV = pivotUV.

Ví dụ: một nắp hộp có bản lề tại (0.5, 0.34) giữ nguyên socket đó kể cả khi file lid.png đã được cắt bỏ 80% vùng trong suốt.

Công thức dựng một lớp:

𝑀
part
=
𝑀
parent

𝑇
(
anchor
)

𝑅
(
𝜃
)

𝑆
(
𝑠
𝑥
,
𝑠
𝑦
)

𝑇
(
−
pivot
)
M
part
​

=M
parent
​

T(anchor)R(θ)S(s
x
​

,s
y
​

)T(−pivot)

Trong đó
𝑇
T là phép tịnh tiến,
𝑅
R là xoay,
𝑆
S là scale.

Sau đó vẽ PNG vào sourceRectUV của ảnh master.

Đối với rig phân cấp, nên tính ma trận của cha–con trước, sau đó sort các phần tử theo z để không làm sai thứ tự hiển thị.

5.3. JSON ví dụ đầy đủ

Tôi đã chuẩn bị hai file JSON hợp lệ, bao gồm cấu trúc lớp, pivot, socket, z-order, diện tích an toàn, animation states và các tham số dành cho code.

Thác Mana — 7 lớp

Tương thích ý tưởng chain/Tesla, có cấu hình Legacy, Mana Flood và ngưỡng tăng sức mạnh.

thacmana.rig.json

Joker King — 8 lớp

Body, lid đóng/mở, spring, head, shadow, glow và timeline báo chiêu 1.400 ms.

joker_king.rig.json

Các giá trị sourceRectUV trong hai ví dụ là tọa độ thiết kế giả định, cần được exporter cập nhật sau khi tạo và đo ảnh thực tế.

Đây là phiên bản rút gọn minh họa cấu trúc dữ liệu. Hai file trên có thông tin đầy đủ hơn:

JSON
{
"schemaVersion": 2,
"id": "joker_king",
"kind": "boss",
"referenceCanvasPx": [1024, 1024],
"rootPivotUV": [0.5, 0.82],
"display": {
"widthCells": 1.35,
"bodySafeRadiusCells": 0.64,
"reserveFxRadiusCells": 1.04
},
"layers": [
{
"id": "body",
"src": "boss/joker_king/body.png",
"parent": null,
"z": 20,
"sourceRectUV": [0.2, 0.35, 0.6, 0.47],
"pivotUV": [0.5, 0.82],
"anchorUV": [0.5, 0.82],
"motion": "jump-squash",
"blend": "source-over"
},
{
"id": "lidClosed",
"src": "boss/joker_king/lid_closed.png",
"parent": "body",
"z": 50,
"sourceRectUV": [0.18, 0.27, 0.64, 0.18],
"pivotUV": [0.5, 0.34],
"anchorUV": [0.5, 0.34],
"motion": "pose-closed",
"blend": "source-over"
}
],
"sockets": {
"lidHinge": {
"parent": "body",
"uv": [0.5, 0.34]
},
"castOrigin": {
"parent": "body",
"uv": [0.5, 0.43]
}
},
"states": {
"idle": {
"periodMs": 2850
},
"walk": {
"loopMs": 800,
"maxLiftBodyHeightFraction": 0.13
},
"cast": {
"telegraphMs": 1400,
"gameplayImpactOffsetMs": 1400,
"visualTotalMs": 1950
},
"hit": {
"flashMs": 80,
"recoverMs": 260
},
"death": {
"totalMs": 900
}
}
}

Trên thực tế, layers phải chứa đầy đủ cả các thành phần khác. Cấu trúc này là ví dụ cú pháp, không thay thế file JSON đầy đủ.

5.4. Dữ liệu nào tự đo, dữ liệu nào chỉnh tay?

Thuộc tính

Python tự đo?

Cần người duyệt?

Bbox alpha

Có

Không, trừ ảnh lỗi

Trim rectangle

Có

Không

Tâm trọng lượng alpha

Có

Dùng để QA

Bán kính alpha lớn nhất

Có

Không

Pixel màu magenta sót

Có

Kiểm tra khi có màu tím

Tâm cơ khí / pivot thực

Gợi ý được

Có

Mũi nòng thật

Có thể gợi ý

Có

Bản lề nắp

Không đáng tin nếu tự đo

Có

Socket phát FX

Không

Có

Z-order

Không

Có

Overdraw vùng che

Một phần

Có

Phân biệt pose mở/đóng

Không

Có

Không nên dùng trọng tâm alpha làm pivot cho mọi trường hợp. Ví dụ, đầu súng dài làm trọng tâm dịch lên phía trước, trong khi trục quay cơ khí vẫn ở giữa bệ.

5.5. Cách tránh lỗi layer không khớp khi thay ảnh

Thêm quy tắc phiên bản:

JSON
{
"designId": "thacmana_f1",
"rigVersion": 2,
"masterRevision": 5,
"geometryHash": "sha256-of-approved-master",
"partRevision": {
"base": 5,
"head": 5,
"rotor": 5
}
}

Nếu head được sinh lại và hình học thay đổi, không mặc nhiên tái sử dụng socket, lớp glow và các form phụ thuộc head cũ.

Exporter phải kiểm tra masterRevision của các thành phần liên quan. Nếu không khớp, báo lỗi build thay vì để game chạy với rig bị lệch.

Q6. Animation bằng code: thông số cụ thể cho mobile

Đây là phần nên tập trung nhiều công sức nhất. Tôi khuyến nghị xây một thư viện animation chung, dùng tham số riêng cho từng loại nhân vật thay vì viết chuyển động từ đầu cho 93 ụ và 12 boss.

6.1. Bảng thông số animation

Các khoảng dưới đây tính theo thời gian trình bày ở tốc độ game 1×.

Chuyển động

Ụ

Quái nhỏ

Quái tinh anh

Boss

Chu kỳ idle

2.400–5.000 ms

1.200–2.400 ms

1.800–3.200 ms

2.600–4.200 ms

Biên độ thở Y

0,5–1,5%

2–4%

1,5–3%

1–2%

Biên độ lắc

0,5–1,5°

2–5°

1–3°

0,8–2°

Anticipation

60–180 ms

80–160 ms

150–280 ms

300–650 ms

Recoil / knockback

30–70 ms

60–110 ms

80–150 ms

100–200 ms

Follow-through

110–460 ms

100–220 ms

170–300 ms

250–550 ms

Hit flash

40–70 ms

55–85 ms

70–100 ms

70–110 ms

Hit-stop thị giác

0–20 ms

15–30 ms

25–40 ms

30–55 ms

Death

250–500 ms

250–450 ms

450–700 ms

700–1.200 ms

Spawn pop

200–320 ms

180–280 ms

260–380 ms

400–600 ms

Không nên dùng tối đa tất cả biên độ cùng lúc. Boss có nhiều bộ phận chuyển động thì chuyển động root càng phải nhỏ.

6.2. Idle breathing

Tôi chọn sóng sin liên tục, tính từ thời gian tuyệt đối.

𝑠
𝑦
(
𝑡
)
=
1
+
𝐴
𝑦
sin
⁡
(
2
𝜋
𝑡
𝑇
+
𝜙
)
s
y
​

(t)=1+A
y
​

sin(
T
2πt
​

+ϕ)

Với
𝑇
T là chu kỳ,
𝐴
𝑦
A
y
​

là biên độ và
𝜙
ϕ là pha riêng.

Ví dụ cho boss hộp:

Chu kỳ: 2.850 ms.

Scale Y: 1 ± 0.012.

Scale X: biến đổi ngược để giữ gần đúng diện tích.

Nắp rung: ±1,2°.

Glow có pha lệch 60–90° với thân để tạo chuyển động thứ cấp.

Cần tránh scale bóng theo cả thân. Bóng giữ nguyên vị trí trên mặt đường, chỉ đổi alpha/kích thước theo độ cao của boss.

6.3. Squash & stretch: giữ thể tích

Trong cutout 2D, thứ thực tế có thể bảo toàn là diện tích hình chiếu:

𝑠
𝑥
𝑠
𝑦
=
1
s
x
​

s
y
​

=1

Vì vậy:

𝑠
𝑥
=
1
𝑠
𝑦
s
x
​

=
s
y
​

1
​

Ví dụ:

Trung tính

1,00 × 1,00

Nén

1,11 × 0,90

Giãn

0,91 × 1,10

Với boss thạch như Mad Crown:

Pha

Scale X

Scale Y

Thời gian

Idle

0,99–1,01

1,01–0,99

3.000 ms/lặp

Chuẩn bị nhảy

1,10

0,91

100 ms

Bật lên

0,94

1,064

130 ms

Bay

1,00

1,00

150–220 ms

Tiếp đất

1,13

0,885

65 ms

Phục hồi

1,00

1,00

180 ms

Đây là squash để tạo cảm giác, không phải mô hình bảo toàn thể tích 3D. Phải kiểm tra vùng an toàn ở các tư thế nén và giãn cực đại.

6.4. Easing và lò xo

Nên thống nhất 4 nhóm easing:

Kiểu

Hàm / đặc điểm

Dùng cho

easeOutCubic

1
−
(
1
−
𝑢
)
3
1−(1−u)
3

Bật nắp, recoil

smoothstep

𝑢
2
(
3
−
2
𝑢
)
u
2
(3−2u)

Glow, blend giữa trạng thái

easeInCubic

𝑢
3
u
3

Lấy đà, tụ lực

Damped spring

Lò xo có giảm chấn

Nắp rung, đuôi, ăng-ten

Với lò xo tới hạn, có thể tính trực tiếp theo thời gian, không cần cập nhật velocity qua từng frame.

𝑥
(
𝑡
)
=
[
𝑥
0
+
(
𝑣
0
+
𝜔
𝑥
0
)
𝑡
]
𝑒
−
𝜔
𝑡
x(t)=[x
0
​

+(v
0
​

+ωx
0
​

)t]e
−ωt

Ở đây t tính bằng giây,
𝜔
ω là tần số góc rad/s.

Đối với bộ phận muốn rung qua lại, sử dụng dạng dưới tới hạn:

𝑥
(
𝑡
)
=
𝐴
𝑒
−
𝜁
𝜔
𝑡
cos
⁡
(
𝜔
𝑑
𝑡
+
𝜙
)
x(t)=Ae
−ζωt
cos(ω
d
​

t+ϕ)
𝜔
𝑑
=
𝜔
1
−
𝜁
2
ω
d
​

=ω
1−ζ
2
​

Thông số gợi ý:

Bộ phận

𝜁
ζ

Tần số tự nhiên

Head xoay theo mục tiêu

1,0

6–10 Hz

Nắp hộp

0,45–0,65

4–7 Hz

Ăng-ten

0,35–0,55

3–5 Hz

Vương miện

0,45–0,70

3–5 Hz

Giáp nặng

0,70–0,90

4–6 Hz

Nên đặt giới hạn góc, ví dụ nắp rung ±6°, ăng-ten ±8°, crown ±5°, thay vì để công thức chạy tự do vượt khớp.

6.5. Hit flash, hit-stop và death

Hit flash: đừng flash trắng toàn bộ boss liên tục khi boss bị đánh bởi 20–40 ụ. Nếu hit rate lớn, màn hình sẽ nhấp nháy khó chịu.

Đề xuất:

Điều kiện

Flash

Cường độ

Cooldown thị giác

Quái thường trúng đòn

65 ms

60–75%

100 ms

Tinh anh trúng đòn

80 ms

40–60%

140 ms

Boss trúng đòn thường

75 ms

15–30%

180 ms

Boss bị critical lớn

100 ms

45–60%

200 ms

Boss bị khống chế đặc biệt

110–160 ms

Theo VFX riêng

Theo trạng thái

Cường độ ở đây là mức opacity của lớp trắng hoặc emissive đã chuẩn bị sẵn.

Hit-stop: chỉ dừng hoặc giữ pose của đối tượng trong hệ trình bày. Không được dừng đồng hồ gameplay, các sự kiện cast hoặc hiệu ứng gây sát thương thật.

Nếu boss vừa bị hit-stop vừa đến thời điểm cast, skill vẫn áp dụng đúng tick. Renderer có thể phát ưu tiên cast và bỏ qua hit-stop nếu hai thứ xung đột.

Death dissolve: vì không có shader, tôi đề xuất dùng 8 ảnh mask alpha tiền xử lý.

Quy trình:

Từ noise texture PNG, tạo 8 mask ngưỡng tăng dần offline.

Render boss vào một temporary canvas vừa khít vùng cần xử lý.

Dùng destination-out cùng mask tương ứng để xóa từng vùng.

Vẽ temporary canvas vào main canvas.

Kết hợp alpha fade, giật nhẹ và FX chết đã sinh bằng AI.

destination-out có trong Canvas 2D, nhưng phải áp dụng trên canvas tạm. Nếu áp dụng trực tiếp lên màn chơi, nó có thể xóa cả nền và đối tượng đã được vẽ.
MDN

Đối với boss, tổng death 700–1.200 ms là hợp lý. Quái thường chỉ cần pop 250–450 ms, không nhất thiết sử dụng dissolve.

6.6. Spawn và merge

Pha

Spawn turret

Merge turret

Xuất hiện

0–70 ms

0–80 ms

Scale vượt 1,0

1,08–1,12

1,12–1,18

Phục hồi

100–180 ms

140–220 ms

FX flash

80–140 ms

130–200 ms

Tổng thời gian

220–320 ms

280–400 ms

Lưu ý: merge chỉ thay đổi luật tại tick do simulation quyết định. Animation scale-in/out là phản hồi thị giác độc lập, không được trì hoãn hoặc tạo thêm turret logic.

6.7. Không dùng Math.random, vẫn tạo chuyển động tự nhiên

Có thể dùng hash ID ổn định để tạo pha, biên độ và tốc độ riêng cho từng thực thể.

JavaScript
function hash01(id) {
let x = id | 0;
x ^= x >>> 16;
x = Math.imul(x, 0x7feb352d);
x ^= x >>> 15;
x = Math.imul(x, 0x846ca68b);
x ^= x >>> 16;
return (x >>> 0) / 4294967296;
}

function idleScaleY(entityId, timeMs) {
const phase = hash01(entityId) * Math.PI * 2;
const speed = 0.9 + 0.2 * hash01(entityId + 17);
const periodMs = 3000 / speed;

return 1 + 0.012 * Math.sin(
2 * Math.PI * timeMs / periodMs + phase
);
}

Tại cùng một entityId và timeMs, kết quả luôn giống nhau, bất kể renderer chạy 30 hay 60 FPS.

Nên dùng ID của instance, không phải ID loại quái; nếu dùng ID loại, tất cả những con quái cùng loại sẽ thở giống hệt nhau.

Với animation sự kiện, thời gian nên là:

JavaScript
const elapsedMs = viewSimulationTimeMs
- event.startTick * tickDurationMs;

Không dùng elapsed += deltaTime để tích lũy trạng thái lò xo. Sau khi biết thời gian từ sự kiện, lấy mẫu trực tiếp đường cong.

6.8. Ngân sách 12 ms/frame

Phân bổ đề xuất cho mục tiêu 60 FPS

Pose math: 1,5 ms

Draw PNG: 7 ms

FX: 1,5 ms

Khác/dự phòng: 2 ms

Ngân sách mục tiêu, không phải benchmark đo được trên iPhone.

Các quy tắc tối ưu:

Pre-render bóng, bệ, viền và hình tĩnh vào cache.

Không chạy blur, shadow hoặc xử lý pixel mỗi frame.

Chỉ render những layer glow đang hoạt động.

Không cập nhật ma trận cho đối tượng đã ra ngoài viewport.

Dùng một texture/atlas chung cho những effect nhỏ thường xuất hiện.

Cắt chặt PNG và hạn chế texture khổng lồ.

Tách FX có thời gian ngắn khỏi rig để tự giải phóng khi hoàn thành.

Giữ các hạt nhỏ theo pool, không tạo/xóa nhiều object JavaScript liên tục.

Tôi đề xuất giới hạn ban đầu khoảng 200–300 lệnh drawImage cho nhân vật và phần động trong cảnh giao chiến đông, còn VFX có ngân sách riêng. Đây là giới hạn khởi đầu để đo đạc, không phải mức Canvas 2D luôn đảm bảo 12 ms.

Tài liệu tối ưu Canvas của MDN cũng khuyến nghị pre-render nội dung lặp lại, hạn chế thay đổi state và tránh những thao tác đắt như blur trực tiếp. CanvasRenderingContext2D.filter vẫn có hạn chế hỗ trợ, nên không dùng nó làm điều kiện bắt buộc của pipeline iPhone.
MDN
+1

Q7. Khi nào dùng sprite sheet, cutout, biến dạng hay particle?

Trường hợp

Công nghệ ưu tiên

Lý do

Quái nhỏ chạy/bay

Cutout hoặc sprite sheet đã ổn định

Không cần nhiều lớp

Quái tinh anh

Cutout 3–5 lớp

Có kỹ năng và chuyển động riêng

Boss idle

Cutout + code

Không sôi chi tiết

Boss đi/nhảy

Cutout + code

Neo root rõ ràng

Boss có hình thái khác hẳn

2 master pose + transition FX

Không giả hình bằng scale

Boss tung chiêu

Cutout + sprite FX

Tư thế nhất quán, hiệu ứng đẹp

Đạn đơn giản

PNG + transform

Hiệu quả

Nổ lớn

Sprite sheet VFX 6–8 frame

Hình học vụ nổ thay đổi thật

Aura xoay

PNG vòng + code

Lặp vô hạn không cần frame

Tia laser

PNG chia đoạn hoặc texture dài + transform

Nối đầu–thân–đuôi

Biến dạng mềm

Scale theo trục hoặc nhiều cutout

Đủ cho blob

Lật, uốn 3D

Key pose / sprite sheet

Canvas 2D không phải mesh renderer

Có nên dùng mesh deformation?

Trong canvas 2D thuần, không có phép mesh warp tùy ý tương đương shader hoặc skeletal mesh GPU.

Có thể giả biến dạng bằng cách cắt một PNG thành 8–12 dải rồi drawImage() từng dải với transform khác nhau, nhưng cách này có ba vấn đề: dễ lộ đường nối, tăng draw call và biến dạng các chi tiết nhận dạng.

Tôi chỉ dùng cho:

Khói mềm.

Thạch không có hoa văn phức tạp.

Dòng năng lượng.

Tia nước hoặc luồng mana.

Không dùng strip deformation cho mặt boss, vương miện, mắt, ngọc hoặc các chi tiết cơ khí quan trọng.

Nếu vẫn cần sprite sheet AI

Quy trình chống sôi:

Chốt master.

Sinh 3 key pose rõ ràng: đầu, giữa, cuối.

Chỉ dùng thêm frame trung gian nếu thực sự cần thay đổi hình học.

Cố định vị trí một landmark rõ ràng như lõi, mắt hoặc tâm khối.

Căn khung bằng affine transform giới hạn và mask.

So sánh patch hoa văn tĩnh với master.

Loại frame thay đổi thiết kế.

Sau cùng mới tạo strip hoặc atlas.

Không nên tự động cross-fade hai frame nếu silhouette khác quá nhiều. Khi đó sẽ xuất hiện hai đường viền chồng nhau. Cross-fade 40–70 ms chỉ phù hợp nếu hai pose đã đăng ký tốt và hình dạng đủ tương tự.

Q8. Quy trình QA tự động kiểm tra nhất quán ảnh

Tôi đề xuất xây một script validate_rig.py chạy mỗi khi export asset.

8.1. Các phép kiểm tra và ngưỡng

Kiểm tra

PASS đề xuất

FAIL

Kích thước file/sprite

Đúng kích thước meta

Bất kỳ sai lệch

Alpha tại mép PNG

Không có pixel alpha đáng kể trong lề yêu cầu

Có pixel chạm mép cấm

Sai lệch anchor khi dựng neutral

≤ 0,5 CSS px

> 1 CSS px

Sai lệch bbox giữa frame tĩnh tương đương

≤ 1,5%

> 3%

Sai lệch tâm khối sau đăng ký

≤ 0,5% cạnh master

> 1%

Boss body đổi kích thước ngoài chủ ý

≤ 1%

> 2%

Sai lệch socket

≤ 0,5 CSS px

> 1 CSS px

Quay ụ ở mọi góc

Radius ≤ 0,47 ô

Vượt vùng an toàn

Viền magenta nghi ngờ

≤ 0,25% số pixel viền

> 1%

SSIM của vùng hoa văn tĩnh

≥ 0,95

< 0,90

Sai màu trung vị vùng tĩnh (ΔE00)

≤ 4

> 8

Khoảng giữa PASS và FAIL nên là WARNING, yêu cầu duyệt thủ công.

Các ngưỡng SSIM và màu chỉ áp dụng cho những phần đáng lẽ không biến dạng. Không được lấy SSIM toàn ảnh giữa frame đầu và frame vụ nổ để kết luận lỗi.

8.2. Kiểm tra tâm khối alpha

Với mỗi pixel có tọa độ
𝑥
,
𝑦
x,y và alpha
𝑎
a:

𝑐
𝑥
=
∑
𝑥
𝑎
∑
𝑎
,
𝑐
𝑦
=
∑
𝑦
𝑎
∑
𝑎
c
x
​

=
∑a
∑xa
​

,c
y
​

=
∑a
∑ya
​

Tâm này giúp kiểm tra ảnh bị trôi hoặc thay đổi cỡ, nhưng không được tự động thay thế pivot.

Tôi khuyến nghị đo hai mask:

Opaque/core mask: alpha ≥ 0,5, dùng đo thân.

Full visible mask: alpha ≥ 0,02, dùng đo vùng tràn và hiệu ứng.

Nếu glow rất rộng, nên tách nó khỏi phép đo bbox thân.

8.3. Kiểm tra quay 0–360°

Không nhất thiết phải render đủ 360 frame để kiểm tra vòng tròn an toàn. Với lớp xoay cứng quanh một pivot cố định, khoảng cách từ mỗi pixel đến pivot không thay đổi theo góc.

Chỉ cần đo:

𝑅
max
⁡
=
max
⁡
(
𝑥
−
𝑝
𝑥
)
2
+
(
𝑦
−
𝑝
𝑦
)
2
R
max
​

=max
(x−p
x
​

)
2
+(y−p
y
​

)
2
​

Sau đó cộng thêm biên độ transform phụ, ví dụ rung/recoil.

Tuy nhiên vẫn nên render test 24 hoặc 72 góc cho mục đích kiểm tra bằng mắt, vì lỗi blend, aliasing và nối bộ phận không chỉ được phát hiện bằng công thức radius.

8.4. Kiểm tra magenta

Đây là một rủi ro đặc biệt trong game có nhiều lõi màu tím mana.

Không thể chỉ dùng quy tắc "pixel gần #FF00FF thì biến thành trong suốt". Nó có thể phá hủy ngọc tím, lửa hồng và các tia năng lượng màu magenta hợp lệ.

Pipeline tốt hơn:

Dò nền magenta liên thông từ các mép canvas.

Phân biệt vùng nền với vùng trong vật thể.

Tạo alpha mask và edge matte 1–2 px.

Giảm contamination từ màu nền trên pixel bán trong suốt.

Resize trong không gian premultiplied alpha.

Extrude màu foreground 1–2 px quanh vùng alpha trước khi ghép atlas.

Kiểm tra vật thể trên nền sáng, nền tối, nền xanh và nền đỏ.

Nếu một ảnh có hiệu ứng bán trong suốt trộn với magenta ngay từ lúc sinh, không thể khôi phục hoàn hảo foreground và alpha chỉ từ RGB đã flatten. Những trường hợp này phải sửa mask bằng tay hoặc sinh glow riêng.

8.5. Bộ test hình ảnh nên có

Mỗi boss cần xuất tự động một trang QA với:

Test

Nội dung

Neutral pose

Dựng hoàn chỉnh, so với master

4 hướng

Kiểm tra camera và silhouette

Max squash

Biến dạng lớn nhất

Max stretch

Kiểm tra lộ khớp

Cast start

Tất cả layer đúng z

Cast impact

Socket FX chính xác

Hit

Flash không che mất nhận diện

Death

Mask không xóa nền

Safe radius

Hình chiếu toàn bộ chuyển động

46 px preview

Kiểm tra silhouette nhỏ

90 px preview

Kiểm tra thực tế mobile

130 px preview

Kiểm tra chất lượng chi tiết

Với 12 boss, đây là bước rất đáng làm. Lỗi pivot sẽ được phát hiện trước khi tích hợp vào gameplay.

Q9. Thiết kế hoàn chỉnh ụ Thác Mana — Arcane Cascade

RED rarity · Mana family · Chain projectile · Mana Flood

Theo file, Thác Mana hiện có bốn file _de, _nong, _phu, _vien, phần phụ dưới đầu, dùng nhóm animation chain, với mũi nòng tạm ở 0,558 bán kính.

Tôi đề xuất không tiếp tục dùng đầu hình tròn như một nòng súng. Thay bằng cấu trúc nhìn rõ hướng bắn, giữ lõi tròn nhưng thêm một bộ dẫn năng lượng hướng lên.

9.1. Silhouette đề xuất

Base: bệ lục giác gunmetal đỏ sẫm, rãnh tím mana, bốn khóa bạc, không có barrel.

Head: một bộ phóng mana hình chữ V với mũi phóng cyan ở đỉnh hướng lên, lõi tím ở giữa.

Part B: rotor dạng vòng 4 nhánh bao quanh lõi, quay ngược chiều head glow.

Core: tinh thể mana tròn, không xoay cùng texture nền.

Glow: vòng xoắn tím–cyan nằm riêng.

Projectile: quả cầu tím có tâm cyan, vệt xoắn.

Mana Flood: dải sóng thác năng lượng đổ trên đường, khác rõ với đạn thường.

Để nhận diện ở 46 px: giữ một lõi tím lớn, hai càng dẫn cyan hình V và đầu phóng màu sáng. Hạn chế hoa văn nhỏ trên thân.

9.2. Bộ lớp và kích thước

Layer

Cỡ export tối đa tham chiếu

Pivot

Z

Animation

Shadow

320 px

Tâm root

0

Tĩnh

Rim

384 px

Tâm

10

Tĩnh

Base

384 px

Tâm

20

Tĩnh

Rotor dưới

192 px

Tâm

30

Quay ngược

Head

448 px

Tâm

40

Aim + recoil

Core

128 px

Socket giữa head

50

Quay + pulse

Core glow

160 px

Socket giữa head

60

lighter

Muzzle flash

128 px

Socket mũi nòng

70

90 ms

Các cỡ trên là mức xuất danh nghĩa trước trim; exporter có thể cắt gọn hơn.

Prompt 2×3 cho Thác Mana
Plain text
Create ONE 2x3 sprite-part sheet for
"ARCANE CASCADE", a MYTHIC RED mana turret.

Same style as attached.
STRICT TOP-DOWN orthographic camera.
Glossy chunky mobile tower-defense artwork.
Dark outlines, high readability at 46 pixels.

Main colors: deep violet mana, bright cyan energy,
dark crimson-gunmetal armor and small gold accents.

Row 1:
1. Fully assembled ARCANE CASCADE turret.
2. BASE ONLY: dark crimson hexagonal platform,
violet mana channels and four metal clamps.
3. HEAD ONLY: a compact V-shaped twin energy
conductor pointing straight UP, with a bright
cyan muzzle at the top and a large violet core.

Row 2:
4. ROTOR ONLY: symmetric four-pronged mana ring,
centered on a circular mechanical axle.
5. CORE ONLY: a bright round violet mana crystal,
with cyan inner highlights.
6. GLOW ONLY: one concentric violet-cyan magical
energy spiral matching the crystal.

The head rotates around its exact geometric center.
Its muzzle is aligned with the center vertical axis.
Every component has exact matching geometry with
the assembled unit.

No side view, no isometric camera.
Pure solid #FF00FF background.
No grid lines, no text, no floor shadows.
Wide clean margins in every cell.
9.3. Animation thường của Thác Mana

Chuyển động

Thông số

Idle body

Chu kỳ 3.000 ms, scale ±0,8%

Rotor dưới

−45°/giây

Core mana

+70°/giây

Glow idle

Alpha 0,24–0,40

Head aim

Lò xo tới hạn 8 Hz

Tụ lực

220 ms

Core scale khi tụ

1,00 → 1,14

Muzzle flash

90 ms

Recoil

2,8% đường kính head, 45 ms

Recover

190 ms, damping 0,65

Projectile flight

Theo vị trí gameplay, không tính lại target

Chain link delay

65 ms giữa các hiệu ứng hit nối tiếp

Chain impact FX

115 ms

Điểm quan trọng: số lần nảy và mục tiêu nảy phải được gameplay quyết định. Animation chỉ nhận danh sách target và thời điểm hit đã xác định, sau đó dựng tia/đạn nối theo dữ liệu đó.

9.4. Mana càng nhiều: biểu hiện tăng sức mạnh

Không nên chỉ làm lõi sáng hơn. Người chơi khó nhận ra sự khác biệt.

Tôi đề xuất 4 cấp nhận diện thị giác, với các ngưỡng mana minh họa sau đây. Chúng cần chỉnh theo nền kinh tế mana thật của game.

Mana

Hình ảnh

Cảm nhận

0–99

Một lõi tím, rotor bình thường

Chưa tích lực

100–299

2 chấm cyan quay quanh lõi

Bắt đầu mạnh

300–599

3 chấm cyan, viền mana sáng rõ

Sức mạnh cao

≥ 600

4 chấm cyan, mũi nòng có halo mạnh

Cực đại thị giác

Các chấm phải là PNG của cùng bộ design, đặt lên những socket cố định. Không được dùng ngẫu nhiên hoặc để biểu tượng che dấu sao của turret.

Nếu game không có cap mana, tầng thị giác cuối nên duy trì ổn định thay vì tăng glow mãi theo giá trị mana.

9.5. Mana Flood — chiêu 4 giây

Cách triển khai:

Skill tạo 8 pulse, mỗi pulse cách nhau 500 ms.

Mỗi pulse có hiệu ứng ngắn, không cần giữ toàn bộ thác lớn trên màn hình suốt 4 giây.

Dùng texture sóng mana thẳng, góc cua, splash và impact riêng.

Tất cả các mảnh FX được neo vào tọa độ đường đi có sẵn, không vẽ hình đường bằng Canvas path.

Timeline Mana Flood — từ khi hiệu ứng thực sự bắt đầu

0 ms

4.000 ms

0

500

1000

1500

2000

2500

3000

3500

Tám mốc phát pulse: 0, 500, 1.000, 1.500, 2.000, 2.500, 3.000 và 3.500 ms.

Thời điểm mỗi pulse

Hiệu ứng

0–50 ms

Lõi burst, đường phát cyan

50–170 ms

Thác lan trên đường

170–280 ms

Splash và vòng mana

280–330 ms

Glow giảm

330–500 ms

Nghỉ trước pulse tiếp

Nếu gameplay yêu cầu hiệu ứng gây damage ngay tại mốc 0/500/1.000 ms, không được trì hoãn damage chỉ vì FX còn đang lan. Đợt sóng lan theo đường là biểu diễn sau sự kiện.

Nếu muốn có 240 ms charge trước khi pulse đầu tiên, phải bố trí charge trước floodStart hoặc định nghĩa lại thời gian bắt đầu skill trong luật. Không nên để renderer tự thêm một khoảng trễ vào sát thương.

9.6. JSON meta

File mẫu đã chứa các trường:

legacy.muzzleRadiusRatio = 0.558 để giữ tương thích đầu cũ.

sockets.muzzle cho đầu mới.

rotation.spring với 8 Hz và damping 1.

manaFlood.durationMs = 4000.

manaFlood.pulseCount = 8.

presentationTiers cho bốn mức hiển thị.

Mở file Thác Mana rig JSON đầy đủ

Lợi ích của việc giữ legacy riêng là có thể chạy đầu cũ trong khi kiểm tra design mới. Chỉ khi đã QA pivot và socket của đầu mới mới chuyển cấu hình mặc định.

Q10. Boss Joker King — bộ rig và timeline hoàn chỉnh

Đây là boss tôi đề xuất dùng làm mẫu chuẩn cho toàn bộ hệ Boss Rig Pro, vì nó có đầy đủ các vấn đề khó: chân đứng trên mặt đất, nhảy, nắp có bản lề, phần bị che, lò xo, glow, skill và death.

10.1. Thiết kế lớp
Tham khảo cấu tạo hộp, nắp và lò xo. Hình chỉ để tham khảo cơ chế, không phải sprite dùng trong game.

Rig cần tách

Body, Lid Closed, Lid Open, Spring, Joker Head, Inner Glow, Inside, Shadow.

Tách phần lòng hộp ra khỏi thân ngoài để tránh lộ khoảng trống khi nắp mở.

Layer

Pivot / Socket

Z

Chuyển động

Shadow

Ground (0.5,0.82)

0

Cố định tại đường

Body

Ground (0.5,0.82)

20

Nhảy, squash

Inside

(0.5,0.51)

30

Tĩnh, lộ khi mở nắp

Spring

Gốc (0.5,0.50)

35

Giãn theo Y

Joker head

(0.5,0.40)

40

Bật lên, lắc

Lid closed

Hinge (0.5,0.34)

50

Rung, đóng

Lid open

Hinge (0.5,0.34)

51

Pose mở

Inner glow

(0.5,0.51)

60

Tụ và nổ sáng

Lid closed và Lid open không nên cùng hiện với alpha 100%; chuyển pose có thể dùng cross-fade khoảng 80 ms.

Đặc biệt, lò xo và đầu hề không được là thành phần cố định của ảnh body. Body phải có hình phần lòng hộp khi thiếu nắp.

10.2. Prompt Joker King
Plain text
Create ONE master sprite for "JOKER KING",
a giant cursed mechanical jack-in-the-box boss.

Same style as attached.
STRICT ORTHOGRAPHIC TOP-DOWN game view.
Chunky glossy cartoon tower-defense art,
thick dark outlines, readable silhouette.

A heavy dark-violet and crimson toy box
with gold mechanical hinges and a large
ornate detachable lid.

The lid is closed in the neutral pose.
Inside the box is a compressed metallic spring
holding a mischievous joker-head mechanism.

The box has no arms or legs.
It moves by hopping with its whole body.

The lid hinge is at the rear/top of the box.
Design clear attachment geometry so the lid
can be separated without changing the body.

Strong character silhouette, polished metal,
small glowing purple cursed gems.

Ground contact at 50% width, 82% image height.
All parts inside a wide safety margin.

No isometric perspective, no side camera.
Flat pure #FF00FF background.
No floor, no shadow, no text, no grid.

Prompt để sinh pose nắp mở sau khi đã duyệt master:

Plain text
Edit the attached Joker King master design.

Show EXACTLY the same mechanical toy box,
with the same body geometry and decorations.

Only change the lid to its OPEN pose.
The lid remains attached to the same rear hinge.
Reveal the inner mechanical cavity and compressed
spring beneath the lid.

Do not change the body size, box shape,
colors, hinges, gems, or ornamental symbols.

Strict orthographic top-down game view.
The open lid must be compatible with the
existing closed-lid pivot.

Flat pure #FF00FF background.
No shadow, no extra objects, no text.

Nếu AI sinh lại thân hộp khác hình, không dùng ảnh đó làm master mới. Giữ body cũ và chỉ lấy phần hình nắp/lòng hộp cần thiết, rồi sửa thủ công để tương thích.

10.3. Timeline di chuyển nhảy

Chu kỳ mặc định: 800 ms mỗi lần nhảy.

Thời gian

Body

Shadow

Lid

0–120 ms

Squash 0,91Y / 1,099X

Rộng nhẹ

Nén 2°

120–290 ms

Bật lên

Thu nhỏ

Trễ 4°

290–400 ms

Ở gần đỉnh, cao tối đa 13% chiều cao thân

Nhỏ hơn, alpha thấp

Rung nhẹ

400–560 ms

Rơi xuống

Mở rộng lại

Theo quán tính

560–640 ms

Nén khi tiếp đất

Tối hơn

Giật 5°

640–800 ms

Phục hồi trung tính

Bình thường

Dao động giảm chấn

Root đường đi vẫn nằm trên quỹ đạo gameplay. Chỉ body và các lớp con được nâng khỏi ground root. Nhờ vậy boss không bị trôi tâm khi nhảy.

Nếu vị trí gameplay được nội suy, dùng vị trí đó làm root và cộng độ cao nhảy ở bước render. Không được sửa tọa độ gameplay để thực hiện cú nhảy.

10.4. Timeline tung chiêu biến ụ thành Mimic

Tôi giữ mốc báo chiêu 1.400 ms theo hệ thống boss đang có trong tài liệu.

Joker King Cast — 1.950 ms

0

900

1.400

1.950 ms

Lấy đà → rung nắp → mở nắp và bật lò xo → áp dụng Mimic → hồi phục.

Mốc

Tư thế và VFX

Easing

0–300 ms

Thân nén 4%; glow bắt đầu tăng; nắp khép chặt

easeInCubic

300–900 ms

Nắp rung ±2–5°, nhanh dần; ngọc đổi sáng

Damped oscillation

900–1.130 ms

Nắp chuyển sang pose mở; lộ lòng hộp

easeOutCubic

1.100–1.300 ms

Lò xo giãn, đầu hề bật lên tối đa 24% chiều cao thân

easeOutCubic

1.300–1.400 ms

Lõi sáng cực đại; dấu nguy hiểm tại turret mục tiêu

smoothstep

1.400 ms

Gameplay áp dụng Mimic, phát VFX chuyển đổi tại mục tiêu

Event-driven

1.400–1.570 ms

Đầu hề lắc, spring thu lại

Damped spring

1.570–1.880 ms

Nắp đóng dần, glow hạ

easeInCubic

1.880–1.950 ms

Dao động cuối, trở về idle

easeOutCubic

Quan trọng: mốc 1.400 ms là mốc trong timeline đề xuất. Trong online lockstep, sự kiện biến ụ thành Mimic phải được simulation phát ra ở tick chính thức; renderer không tự quyết định chuyển đổi chỉ vì elapsedMs >= 1400.

10.5. Trúng đòn và chết
Hit

Flash trắng tím: 80 ms.

Visual hit-stop: tối đa 40 ms.

Thân giật 3% chiều cao về sau.

Nắp rung ±5,5°.

Recovery: 260 ms.

Không reset hoặc trì hoãn cast timeline nếu đang báo chiêu.

Death

Thời gian

Animation

0–150 ms

Body nghiêng và nén; các gem tắt dần

150–430 ms

Nắp bật mở, lò xo bung mạnh, đầu hề rung

430 ms

Phát burst chính

430–700 ms

Bắt đầu dissolve; opacity giảm

700–900 ms

Mảnh còn lại biến mất, shadow fade

900 ms

Hủy đối tượng trình bày khi được phép

Nếu boss biến mất về mặt gameplay trước khi animation chết kết thúc, renderer phải giữ một visual death instance độc lập. Instance này không tham gia va chạm, targeting hay luật game.

10.6. JSON Joker King

Trong file tôi đã đặt:

Root pivot (0.5, 0.82).

walk.loopMs = 800.

cast.telegraphMs = 1400.

cast.visualTotalMs = 1950.

hit.visualHitStopMs = 40.

death.totalMs = 900.

openPoseCrossfadeMs = 80.

springExtendFractionOfBody = 0.24.

Mở Joker King rig JSON đầy đủ

Lộ trình chuyển đổi pipeline cho 93 ụ và 12 boss

Không nên thay thế toàn bộ hệ thống cũ cùng lúc.

Giai đoạn

Công việc

Kết quả mong muốn

1. Rig Contract

Chuẩn hóa pivot, root, socket, UV, z, animation clock, JSON v2

Mọi asset mới dùng chung schema


[output truncated at 50000 of 52558 characters. Pass a larger max_chars (default 50000) to see more, or use read_page with a ref_id to focus on a smaller section.]