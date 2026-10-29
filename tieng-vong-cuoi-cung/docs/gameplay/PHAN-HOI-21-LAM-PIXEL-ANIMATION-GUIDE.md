TIẾNG VỌNG CUỐI CÙNG — LAM
ART DIRECTION + PIXELLAB ANIMATION PRODUCTION GUIDE v1.0
Dành cho Claude (lập trình, vận hành PixelLab) | 30/10/2026

NGUYÊN TẮC CHUNG
- Gameplay, hitbox, thời điểm active/recovery là nguồn sự thật từ code; hình chỉ biểu đạt các pha anticipation → strike → recovery.
- Chỉ pixel art nguyên bản: vẽ ở độ phân giải gốc, không dùng ảnh AI giả pixel làm nguồn nhập.
- Các tên preset Skeleton v3 trong giao diện PixelLab có thể khác nhau; dùng preset tương đương nếu có, không giả định có đúng tên.
- Không mặc định PixelLab hỗ trợ giữ frame đầu, alpha, số frame hay canvas tùy ý: kiểm tra UI và điều chỉnh theo khả năng thực tế.

1. STYLE GUIDE / THÔNG SỐ CHỐT
- Đơn vị: 1 art pixel = 2 screen pixels ở tỷ lệ chơi chuẩn; render nearest-neighbor, tắt image smoothing. Tránh tỷ lệ scale lẻ gây nhòe.
- Sprite nhân vật gốc cao 52–54 px (không kể tia kiếm), bề ngang cơ thể 24–30 px. Mục tiêu hiển thị cao 104–108 px. Giữ chân cùng baseline.
- Master canvas nhân vật 96×96 art px, nền trong suốt, đủ chỗ cho tay/vũ khí; nếu PixelLab chỉ cho 64×64 thì tạo body trong 64×64 rồi đặt vào 96×96 bằng code/export pipeline. Các đòn vung rộng có thể dùng frame 128×128, nhưng anchor/pivot không đổi.
- Vùng nhân vật idle: khoảng x=33..62, y=25..78 trong khung 96×96. Điểm neo chân (48,79); anchor dùng nhất quán cho mọi frame. Đây là đề xuất bố cục, không phải hitbox.
- Palette tổng 12–16 màu, mỗi vật liệu tối đa 3 mức sáng. Gợi ý: outline #111D29; shadow #1D3544; dark teal #294D5B; teal #3B6B74; teal light #669397; cloth #18303D; metal dark #50616B; metal light #A0AFAC; amber dark #8B4D27; amber #E4A64B; amber bright #FFD579; glow core #FFF1B4; muted skin #C8AA91; highlight #D5D6BE. Alpha riêng cho hiệu ứng.
- Outline 1 art px ở chi tiết trong, 1–2 art px ở viền ngoài; bóng 1 cụm chính + 1 cụm sáng, không dithering, không anti-alias.
- Chi tiết chỉ giữ 3 dấu nhận dạng đọc được ở 2×: chuông trước ngực/hông, mũ/trùm bất đối xứng, Âm Đao chạc đôi. Không vẽ hoa văn li ti.
- Camera side-view 3/4 rất nhẹ: thấy mặt và ngực, KHÔNG quay lưng; hướng mặc định East (nhìn phải). Phía West nên lật sprite bằng code, trừ khi thiết kế bất đối xứng cần vẽ riêng.
- Kiểm thử trên màn hình iPhone xoay ngang ở kích thước chơi thực tế, cả trên nền tối và nền sáng.

2. THIẾT KẾ LAM
Phương án A — Người Gác Chuông: áo choàng ngắn xanh than, mũ trùm nhọn lệch, chuông hổ phách treo trước ngực, ủng gọn, Âm Đao hai nhánh ở tay phải. Silhouette mạnh, ít chi tiết, dễ animate.
Phương án B — Lữ Khách Phế Tích: khăn dài, áo giáp nhẹ, chuông ngang hông, tóc lộ một bên; chuyển động đẹp nhưng khăn gây nhiễu và tăng công frame.
Phương án C — Kỵ Sĩ Vọng Âm: mũ giáp nửa mặt, vai kim loại, chuông gắn thắt lưng; uy lực nhưng dễ thành nhân vật quá nặng cho combat nhanh.
CHỌN A: hình gọn, nhận diện rõ ở 108 px, có đường chuyển động mạnh; chuông ở ngực đọc được cả lúc đứng và chạy. Thiết kế: mũ trùm hình nêm nghiêng về sau; mắt hổ phách 1–2 px; khăn/cape ngắn tới ngang hông; găng tay phải giữ Âm Đao như một tay cầm với đầu chạc chữ Y, hai nhánh tách nhau 4–6 px. Tay trái hỗ trợ cân bằng, khi dùng Vọng chạm chuông.

QUYẾT ĐỊNH NGUỒN NHÂN VẬT: (b) ĐỂ PIXELLAB TẠO TỪ MÔ TẢ.
Lý do: pipeline nhập ảnh gen trước đó báo mờ, còn PixelLab tạo native pixel và Skeleton nhất quán. Không dùng ảnh giả pixel. Nếu có thể, Claude nên vẽ/hiệu chỉnh thủ công trên pixel grid sau khi chọn mẫu. Prompt tiếng Anh (<2000 ký tự):
"A single full-body 2D game character sprite, true hand-placed pixel art, 64x64 native pixels, transparent background. Lam, a mysterious young bell keeper in a melancholic fantasy metroidvania. Facing EAST (right), strict side-view with a very slight three-quarter view so face and chest are visible, NEVER a back view. Compact agile chibi proportions, readable silhouette, approximately 52 pixels tall. Deep desaturated teal hood with a sharp swept-back tip, short dark teal shoulder cape ending at the waist, fitted tunic, slim boots and gloves. One tiny glowing amber eye. A clearly visible small brass amber bell hanging on the front of the chest. In the right hand, a short dark-metal forked sonic sword hilt, shaped like a Y with two distinct parallel prongs and an EMPTY gap between them while idle; no solid blade at rest. Left arm free. Moody mystical atmosphere, clean 1-pixel clusters, crisp dark 1-pixel outline, flat color areas, only two shading steps per material, palette of 12 to 16 colors, teal and amber accents. No blur, no anti-aliasing, no gradients, no subpixel details, no floor, no shadows, no scenery, no text, no extra characters, no oversized weapon, no back-facing pose. Feet aligned on one baseline, entire body visible with breathing room."
Nếu PixelLab không tạo alpha: dùng nền đơn sắc tương phản, loại nền bằng pixel-perfect mask sau xuất, kiểm tra không làm mất outline.

3. ÂM ĐAO / LƯỠI KIẾM ÂM THANH
- Vũ khí vật lý: cán 9–12 art px, chạc Y hai nhánh dài 7–9 px, gap 3–5 px; khi idle KHÔNG có lưỡi sáng nối hai nhánh.
- Lưỡi âm thanh: hình lá nhọn kéo dài từ khe hai nhánh, có sống sáng gần trắng #FFF1B4 rộng 1–2 px, thân vàng #FFD579, viền hổ phách #E4A64B; 1–3 mảnh âm vang rời, tránh hạt bụi quá nhiều.
- Chiều dài mặc định từ đầu chạc khoảng 22–30 art px; nâng cấp tăng chiều dài theo reach gameplay (không tự suy ra reach từ hình). Độ dày thân 3–6 px, đầu nhọn lệch theo hướng chém; không dùng gradient blur.
- Anticipation: khe tối, chỉ có 1–2 pixel hổ phách nạp năng lượng. Strike: lưỡi bung từ 0 → 100% trong 1–2 frame, một cung vệt chém có hướng. Recovery: rút 100% → 35% → 0, hạt âm vang biến mất. Frame active do code quyết định, không gắn cứng vào frame index.
- CHỐT KIẾN TRÚC: PixelLab CHỈ vẽ thân, tay, chạc kiếm, tư thế và có thể chấm sáng nạp năng lượng; Claude VẼ LƯỠI + VỆT CHÉM bằng code trên Canvas offscreen pixel-grid hoặc sprite hiệu ứng pixel riêng. Lý do: đồng bộ hitbox, chỉnh chiều dài khi nâng cấp, tránh PixelLab biến dạng lưỡi. Effect cũng phải nearest-neighbor và snap tọa độ nguyên art px.
- Gắn effect vào socket ở đầu chạc (weaponTipX/Y) cho từng frame, hoặc transform từ tay/cán. Cung chém được điều khiển bằng attack type, facing, normalized phase, reach, góc bắt đầu/kết thúc. Render order: vệt sau nhân vật, lưỡi chính trước tay khi cần; không để glow che silhouette. Mọi tia là VISUAL, không tự gây damage.

4. CHÉM CHUẨN — FRAME PLAN + PROMPT CUSTOM
Quy ước: frame đếm từ 1, A=anticipation, S=strike, R=recovery; ký hiệu [HIT] là hình có pose tác động rõ nhất, KHÔNG phải quy định thời điểm gây damage. Mỗi prompt chỉ yêu cầu pose/weapon, lưỡi âm thanh thêm bằng code. Mỗi animation xuất từng frame với anchor cố định. Khi PixelLab làm động tác quá nhỏ, ưu tiên sửa silhouette, góc thân và vị trí hai chân.

4.1 CHÉM 1 — CHÉM NGANG TỪ SAU RA TRƯỚC | 6 frames
1 A: trọng tâm hạ, chân trước bước 2 px, thân xoay nhẹ về sau, chạc kiếm kéo sau hông.
2 A: vai phải kéo ngược, tay cầm chạc kiếm ra sau, mắt nhìn mục tiêu, chấm amber nạp.
3 S: hông mở, thân nghiêng tới, tay quét ngang qua trước ngực, chạc hướng East, lưỡi code đạt ~70%.
4 S [HIT]: chân trước chống mạnh, tay duỗi ngang, cape bật ngược, lưỡi code 100% và cung ngang rõ.
5 R: vũ khí vượt qua trục thân, vai thả, lưỡi thu ~35%.
6 R: trở về guard, lưỡi 0.
Prompt: "Fast powerful horizontal sword slash to the right. Clear crouched wind-up with forked hilt behind the hip, explosive forward step and full torso rotation, strong extended-arm impact silhouette, then controlled recovery. Keep the bell, hood, weapon prongs and feet consistent. No magic blade or motion blur; transparent true pixel art."

4.2 CHÉM 2 — CHÉM NGƯỢC CHÉO LÊN | 6 frames
1 A: nối từ cuối chém 1, gối khuỵu, vũ khí thấp trước thân.
2 A: tay kéo xuống hông phải, vai hạ, thân nén.
3 S: bật gối, chạc vung chéo từ thấp-phải lên cao-trái theo cung nhìn thấy ở mặt phẳng ngang màn hình; lưỡi 70%.
4 S [HIT]: tay cao ngang đầu, thân vươn, chân sau nhón, lưỡi 100% vệt chéo đi lên.
5 R: vũ khí qua vai, lưỡi 35%.
6 R: giữ guard cao, sẵn sàng combo 3, lưỡi 0.
Prompt: "Snappy rising diagonal reverse slash, low compressed preparation, powerful upward torso twist, weapon travels from low front to high front, clear extended impact pose, then quick high-guard recovery. Dynamic readable silhouette, stable proportions and forked hilt, no glowing blade, no blur."

4.3 CHÉM 3 — KẾT LIỄU QUÉT RỘNG | 8 frames
1 A: từ guard cao, chân trước lùi nửa bước, hạ trọng tâm.
2 A: xoay vai lớn, chạc kiếm về sau đầu, cape kéo theo.
3 A: nén sâu, tay trái mở đối trọng, amber nạp ở chạc.
4 S: lao một bước, thân xoay, tay bắt đầu quét cung lớn, lưỡi 65%.
5 S [HIT]: tư thế duỗi mạnh nhất, hai chân tạo đường chéo, chạc ở xa thân, lưỡi 100%, cung rộng.
6 S: follow-through vượt trục, cape tung, lưỡi 75%.
7 R: giảm tốc, hạ tay, lưỡi 20%.
8 R: về guard thấp, lưỡi 0.
Prompt: "Heavy third-hit combo finisher, exaggerated deep wind-up, decisive forward lunge, wide committed sweeping strike with maximum arm extension and strong leg separation, clear follow-through and longer recovery. Keep silhouette crisp, forked hilt visible, no energy blade, no smear or blur."

4.4 CHÉM HẤT LÊN — LAUNCHER | 7 frames
1 A: hạ thấp người, kiếm gần mặt đất.
2 A: khuỵu sâu, tay phải sau gối, tay trái mở.
3 S: đạp chân lên, chạc kéo từ thấp lên trước.
4 S [HIT]: thân vươn lên, tay kiếm hướng 60–75 độ lên, cape văng xuống, lưỡi 100% theo trục chéo lên.
5 S: chạc qua đầu, chân có thể nhấc nhẹ, lưỡi 60%.
6 R: tay hạ, lưỡi 20%.
7 R: trở lại guard/air transition, lưỡi 0.
Prompt: "Explosive upward launcher slash, very deep crouch and low forked sword preparation, spring upward with sword extended high above the head, dramatic vertical silhouette and clear follow-through, then recover. Preserve character scale and anchor; no generated energy blade or blur."

4.5 CHÉM BỔ XUỐNG TRÊN KHÔNG / POGO | 7 frames
1 A: đang rơi, hai chân co, tay kiếm giơ cao.
2 A: nén thân giữa không trung, mũi kiếm hướng xuống.
3 S: lao xuống, thân nghiêng nhẹ trước, hai tay/kiếm hướng đất.
4 S [HIT]: mũi chạc chĩa xuống gần thẳng đứng, chân kéo lên phía sau, lưỡi code 100% dài theo hướng xuống.
5 S: duy trì pose mũi xuống, lưỡi 70% (đợi code xác nhận va chạm).
6 R: khi pogo thành công, thân bật ngược, gối co, lưỡi 20%; nếu không trúng chuyển sang fall theo code.
7 R: thu kiếm, pose chuyển sang jump/fall, lưỡi 0.
Prompt: "Midair downward plunge attack for a pogo metroidvania, compact airborne wind-up with knees tucked, then forceful straight-down sword thrust with the forked weapon pointing to the ground, legs trailing behind, crisp downward impact pose, rebound-ready recovery. No floor, no energy blade, no blur."

LƯU Ý CHO CẢ 5 ĐÒN: prompt Custom có thể tạo frame timing không khớp. Claude remap các frame vào ba pha bằng timeline code; nếu PixelLab không hỗ trợ 6/7/8 frame, lấy số gần nhất và sửa bằng frame hold, không tự thay đổi hitbox. Dùng frame [HIT] như visual peak; có thể hold 1–2 render ticks theo thời lượng đòn. Không để lưỡi do code xuất hiện ở frame idle.

5. CÁC ĐỘNG TÁC CÒN LẠI
Tên mẫu là loại chuyển động cần tìm trong Skeleton v3, KHÔNG khẳng định là nhãn chính xác trong PixelLab. Prompt ngắn tiếng Anh để dán.

5.1 IDLE — Skeleton v3 Idle/Breathing, 6 frames, loop: ngực nhấp 1 px, cape dịch nhẹ, chuông đung 1 px, chân đứng yên. Prompt: "Subtle breathing idle, tiny cape and chest bell sway, steady feet, alert side-facing guard, no large movement."
5.2 RUN (khuyến nghị bổ sung vì combat nhanh) — Skeleton v3 Run, 8 frames, loop: hai chân mở rõ, tay đối nhịp, vũ khí gọn, cape theo đà. Prompt: "Fast agile side-view run cycle, eight distinct frames, clear leg extension and planted contact, short cape trailing, stable head and bell."
5.3 JUMP START — Skeleton v3 Jump/Takeoff hoặc Custom, 3 frames, one-shot: co gối → đạp → rời đất. Prompt: "Quick crouch and spring upward, arms counterbalance, sword close to body, clear airborne takeoff."
5.4 ASCEND — Custom hoặc Skeleton Jump, 2 frames, hold/short loop: chân hơi co, thân vươn. Prompt: "Ascending airborne pose, body stretched upward, knees lightly bent, compact sword guard."
5.5 APEX — Custom, 2 frames, hold: chân co hơn, cape lơ lửng. Prompt: "At jump apex, brief weightless pose, tucked legs, floating short cape, steady side view."
5.6 FALL — Skeleton Fall hoặc Custom, 2 frames, hold: chân hướng xuống, tay cân bằng, cape bay lên. Prompt: "Descending airborne pose, feet reaching down, cape lifted by air, sword held safely forward."
5.7 LAND — Skeleton Landing hoặc Custom, 3 frames, one-shot: tiếp đất → nén gối → bật lại guard. Prompt: "Firm landing with knee compression and quick return to ready stance, no dust effect."
5.8 DASH — Skeleton Dash nếu có, nếu không Custom, 4 frames, one-shot/hold giữa: thân thấp nghiêng 25–35 độ, chân sau duỗi, cape kéo ngang. Prompt: "Lightning-fast horizontal dash to the right, very low forward lean, streamlined compact sword, strong silhouette, minimal frame changes, no blur."
5.9 WALL HOOK ATTACH — Custom, 3 frames: tay móc vươn chạm vách → móc bám → người treo. Prompt: "Attach a small climbing hook to a vertical wall on the right, arm fully extended, body hanging close to wall, feet braced."
5.10 WALL SLIDE — Custom hoặc Skeleton Wall Slide nếu có, 4 frames loop: một tay giữ móc, chân tì vách, thân trượt, cape hướng lên. Prompt: "Controlled slide down a wall on the right, one hand holding a hooked grip, feet bracing the wall, cape lifting slightly."
5.11 WALL JUMP — Skeleton Wall Jump nếu có, nếu không Custom, 5 frames one-shot: co chân vào vách → đạp mạnh sang trái → xoay về hướng bay → guard. Prompt: "Explosive wall jump away from a wall on the right, compress against wall then kick off hard to the left, airborne twist, recover guard."
5.12 HURT — Skeleton Hit Reaction hoặc Custom, 4 frames one-shot: đầu giật, thân ngửa, tay mở, chân lùi, rồi hồi. Prompt: "Sharp readable hit reaction, head snaps back, torso recoils, weapon arm drops slightly, short stagger then regain balance; no blood."
5.13 DEATH — Skeleton Death hoặc Custom, 8 frames one-shot: mất thăng bằng → quỳ → ngã nghiêng → nằm bất động; chuông tắt dần bằng code. Prompt: "Somber non-gory death collapse, stagger, fall to one knee, roll onto side, settle completely still, bell light fading, no gore."
5.14 VỌNG / RING BELL — Custom, 8 frames one-shot: 1–2 hạ trọng tâm, 3 tay trái đưa tới chuông, 4–5 [PEAK] gõ/rung, 6–7 sóng lan do code, 8 về guard. Prompt: "Mystical bell-ringing skill, brace stance, left hand reaches to the amber chest bell, a decisive ringing gesture with strong held pose, then calm recovery. Keep forked sword in right hand; no painted magic rings or blur."
- Nếu đã có Skeleton 6 frame nhất quán: giữ nó làm cơ sở Idle/Run/Jump/Hurt, đừng tạo lại không cần thiết. Đối với chuyển động đòi hỏi tương tác vách hoặc chuông, ưu tiên Custom.

6. CÀI ĐẶT, PIPELINE, TIẾT KIỆM LƯỢT
6.1 THIẾT LẬP CHUNG
- Facing/Direction: East, quay phải; khóa cùng góc nhìn cho toàn bộ sprite.
- Character generation: native 64×64 nếu đó là kích thước PixelLab cho kết quả tốt đã kiểm nghiệm; body khoảng 52–54 px. Không ép ảnh 64 lên 96 bằng nội suy mờ: chèn nguyên pixel vào khung lớn.
- Animation generation: dùng 64×64 cho idle, run, jump, hurt nếu đủ; 96×96 hoặc 128×128 cho động tác quét rộng nếu UI cho phép và giữ được scale. Nếu không: tạo body 64×64, effect tách code; tránh cắt tay/chạc.
- Background transparent nếu có; giữ first frame/initial image ON nếu tùy chọn tồn tại và không làm hỏng pose; các đòn nối combo có thể dùng frame cuối đòn trước làm pose tham chiếu khi tính năng cho phép. Không dùng 'giữ frame đầu' nếu nó khiến mọi frame bị khóa cứng.
- Frame count nhập theo từng mục; nếu UI chỉ hỗ trợ số cố định, lấy số gần nhất và remap trong code. Không dùng upscale AI/blur. Export PNG sprite sheet hoặc từng PNG có alpha; lưu metadata frameWidth, frameHeight, anchor, facing, frameCount.
- Tốc độ là tham khảo visual, không ép gameplay: idle 6–9 fps; run 10–14 fps; attack pose 12–20 fps tùy thời lượng code; Vọng 8–12 fps. Claude phân phối duration theo phase từ gameplay hiện có.

6.2 THỨ TỰ THỰC HIỆN (MỖI LẦN CHỈ CHẠY 1 JOB)
Bước 1: backup sprite, animation, config, hitbox, timing hiện tại; chụp screenshot trạng thái UI và ghi preset thực tế.
Bước 2: tạo 1 nhân vật Lam từ prompt mục 2, East, native 64×64. Kiểm ngay silhouette/chuông/chạc. Chỉ reroll nếu lỗi nhận dạng nghiêm trọng.
Bước 3: khóa master character image + palette + baseline; lưu bản gốc và phiên bản.
Bước 4: dùng Skeleton v3 đã thử thành công để làm Idle (6), Run (8), Jump/Takeoff nếu có. Nếu có animation ổn sẵn thì tái sử dụng, không tiêu lượt.
Bước 5: Custom CHÉM 1 (6) làm mẫu kiểm biên độ; nếu chưa đạt thì sửa prompt nhấn 'deep wind-up, explosive full-body rotation, maximum extension' trước khi làm 4 đòn còn lại.
Bước 6: Custom CHÉM 2 (6), CHÉM 3 (8), Launcher (7), Pogo (7); kiểm anchor và pose peak sau mỗi job.
Bước 7: hoàn thiện jump phases, dash, wall hook/slide/jump, hurt, death, Vọng. Dùng Skeleton nơi có chuyển động tương ứng, Custom nơi Skeleton không biểu đạt đúng.
Bước 8: Claude tách/sửa frame PNG bằng pixel-perfect operations, chuẩn hóa anchor, nối atlas và metadata; không resample bilinear.
Bước 9: Claude triển khai sonic blade và các cung slash bằng code pixel art, có socket theo từng frame, liên kết reach/phase.
Bước 10: tích hợp state machine animation, test combat trên iPhone ngang, điều chỉnh visual timing mà không đổi hitbox.

6.3 NGÂN SÁCH LƯỢT / CHIẾN LƯỢC
- Với gói miễn phí và chi phí tham khảo Skeleton ≈3 lượt, Custom ≈1 lượt: ưu tiên 1 lần tạo master + 1 lần Custom chém 1 để xác thực pipeline trước; không tiêu lượt hàng loạt khi style chưa khóa.
- Không chạy lại toàn bộ animation vì một lỗi nhỏ ở một frame: sửa thủ công nếu PixelLab có pixel editor, hoặc hậu xử lý PNG bằng script nearest-neighbor.
- Dùng lại frame idle cho điểm cuối các đòn, reuse pose airborne giữa launcher/pogo/jump nếu phù hợp; lật East→West bằng code khi không có bất đối xứng bắt buộc.
- Lưu prompt, seed (nếu UI có), input image, preset, output, kết quả QA cho từng job; không giả định seed có thể khóa identity tuyệt đối.

6.4 QA — ĐẠT / KHÔNG ĐẠT
ĐẠT nếu: (1) ở 2× vẫn nhận ngay mũ trùm, chuông, chạc đôi; (2) East thực sự nhìn phải, không lộ lưng; (3) pixel sắc, không bán trong suốt viền do antialias; (4) chiều cao thân giữa frame lệch tối đa khoảng 1–2 art px trừ squash/stretch có chủ ý; (5) chân/anchor không nhảy vô cớ; (6) peak attack đọc được khi đứng yên và có biên độ lớn hơn idle; (7) không cắt sprite; (8) visual active khớp timing code; (9) hiệu ứng kiếm không che thân/chuông; (10) fps ổn trên iPhone ngang.
KHÔNG ĐẠT nếu: blur/gradient, chi tiết li ti, quay lưng, đổi tay/vũ khí, mất chuông, chạc nhập thành kiếm thường, thêm lưỡi sáng ở idle, frame trôi vị trí, động tác chỉ vẫy cổ tay, pose chém không có bước chân/xoay thân, hoặc hit VFX xuất hiện sau thời điểm active của code.
- Test trên nền #10232D và #6B807F; chụp mỗi attack ở wind-up, active, recovery. Dùng playback 0.5× để tìm jump frame và 1× để kiểm cảm giác lực.

GỬI CLAUDE — DANH SÁCH THỰC THI THEO THỨ TỰ
A. TRÊN PIXELLAB
[ ] 1. Kiểm tra UI hiện tại: preset Skeleton v3, Custom, East, canvas, số frame, giữ hình đầu, alpha, export. Ghi lại khác biệt với hướng dẫn; không tự bịa tùy chọn.
[ ] 2. Backup tài nguyên và thông số code cũ. Tạo Lam bằng prompt ở mục 2, chọn đúng silhouette Người Gác Chuông.
[ ] 3. Khóa master image, palette, baseline, hướng East; lưu PNG native pixel.
[ ] 4. Tạo/tái dùng Idle, Run, Jump bằng Skeleton v3 tương đương; kiểm consistency.
[ ] 5. Tạo Custom Chém 1; xác minh có wind-up và impact đủ lực trước khi tiếp tục.
[ ] 6. Tạo Chém 2, Chém 3, Launcher, Pogo lần lượt; không vẽ lưỡi năng lượng vào sprite body.
[ ] 7. Tạo các state còn lại theo mục 5, ưu tiên Custom cho wall hook, wall slide, Vọng.
[ ] 8. Xuất frame/sheet, metadata, ghi prompt/preset và báo các frame lỗi cần chỉnh.

B. TRONG CODE HTML5 CANVAS
[ ] 9. Xây pixel-art import/atlas pipeline: alpha, integer coords, imageSmoothingEnabled=false, anchor cố định, scale 2× ở art resolution phù hợp.
[ ] 10. Mapping animation state và các pha anticipation/active/recovery theo thời gian gameplay hiện có; giữ nguyên hitbox và attack timing.
[ ] 11. Khai báo weapon socket theo frame hoặc transform, vẽ chạc vật lý theo sprite và sonic blade bằng effect riêng, tăng reach theo nâng cấp; visual không gây damage độc lập.
[ ] 12. Tạo các profile effect: slash1 ngang, slash2 chéo lên, slash3 rộng, launcher lên, pogo xuống; Vọng là vòng sóng pixel riêng xuất phát từ chuông.
[ ] 13. Hỗ trợ mirror West, dash, wall slide/hook/jump, hurt/death, landing; tránh flip sai socket.
[ ] 14. Kiểm thử tất cả state trên iPhone ngang: silhouette, clipping, sprite baseline, input latency, animation cadence, effect/hitbox sync, hiệu năng.
[ ] 15. Xuất bảng QA PASS/FAIL kèm ảnh 3 pha của mỗi đòn và danh sách thay đổi; chỉ đề xuất reroll PixelLab khi lỗi không thể sửa bằng pixel edit/code.

ĐIỂM CHỐT: Ưu tiên cảm giác đòn mạnh qua silhouette và timing, không qua blur. PixelLab tạo pose pixel thật; Claude chịu trách nhiệm lưỡi âm thanh, hitbox sync, nâng cấp và VFX. Không thay gameplay chỉ để khớp sprite.
