# Báo cáo: Lam 3/4 – idle 6 khung (3D → pixel, ô 64×64)

Phạm vi: chỉ idle. Mô hình 3D trong `proto-lam/proto.html` được chỉnh lại theo ảnh mẫu `art/nhan-vat/lam-48/nguyen-con-v2-mat-sang.png` (màu + hình) và `nguyen-con.png` (dáng), rồi render → pixel bằng `proto-lam/xuat-idle.py`. Kết quả: `out/idle/idle-0..5.png`, `idle-x4.png`, `idle-x8.png`, `idle.gif`, `overlay-mau.png`, `so-sanh-mau-x4.png`, `anim2d-check.png`, `kiem-tra.json` và sheet thử `game/anim/lam-idle-proto.png` + `lam-idle-proto.anim.json`.

## (a) Ngoại hình – so với mẫu (xem `overlay-mau.png`, `so-sanh-mau-x4.png`)

Camera trực giao, xoay 22° về phía trước mặt, nhìn xuống 12°, cố định cho mọi khung. Nhân vật nhìn sang phải, cao 46 px trong ô 64 (ppu 45 + viền), chân chạm hàng y = 63, tâm x = 32. Kiếm ở tay xa (tay phải), tay gần để trống buông sau hông, chuông treo sau vai gần – đúng ghi chú của người dùng, khác ảnh mẫu (mẫu vẽ kiếm ở tay gần).

Nhìn bằng mắt từng phần:

Mũ trùm: hình dáng tổng thể và chiều cao khớp mẫu (đỉnh mũ ở cùng hàng, khoang mặt tối với 2 mắt vàng nhạt, viền xanh 1 px ở mép trên/mép trước). Khác: chỏm mũ của mẫu ngả ra sau và trễ xuống tới ngang vai, bản 3D chỏm tròn hơn và lưng mũ hẹp hơn mẫu ≈ 1–2 px; mép dưới mũ của mẫu xoè rộng hơn.

Áo choàng: cùng màu xanh than, viền xanh lá, lót trong xanh. Khác: áo choàng của mẫu dài tới gần mắt cá và hất mạnh ra sau thành 2–3 vạt rách; bản 3D ngắn hơn (gấu ở ≈ 0,16 chiều cao, tức trên cổ ủng) và xoè ít hơn. Rút ngắn có chủ đích để gấu áo không chạm vùng ủng (bảo đảm vùng chân giống hệt nhau 6 khung) và để lộ 2 ủng như mẫu.

Thân/vạt: vạt xanh #32804F phẳng, có đai chéo tối qua ngực và trâm tròn sáng (#CEF0D6, 1–2 px) ở ngực, thắt lưng tối. Khác: mẫu có gấu vạt rách răng cưa và vệt sáng #83CC93 lớn trên vạt; bản 3D gấu lathe trơn, sáng #83CC93 chỉ 1–2 px ở vai (không thêm chi tiết ngoài thiết kế).

Chân: 2 ủng tối, vạch xanh ở cổ ủng, chân gần sáng hơn chân xa một bậc, hai chân tách bằng viền trong. Khác: ủng của mẫu to và cao hơn một chút; ở ×1 cổ ủng chỉ còn 1–2 px xanh.

Chuông: vàng #E1B85A, chỏm sáng, treo sau vai gần, ngang mép dưới mũ – vị trí và cỡ gần mẫu (mẫu to hơn ≈ 1 px). Dây treo 1 px đôi khi lẫn vào viền mũ.

Kiếm: lưỡi sáng #CEF0D6 2 px, chắn vàng 1 px lộ ở cạnh bụng; nằm ngang hông (≈ 0,38 chiều cao), mũi hơi chếch lên như mẫu. Khác: do cầm ở tay xa nên chuôi và bàn tay bị thân che, chỉ thấy 1 px vàng; mẫu lộ cả chuôi vàng và bàn tay.

Mắt: 2 điểm #F3E6C8 cách 1 px trong bóng mũ, đúng hàng với mẫu.

Kết luận: ở ×4 và ×6 nhìn ra cùng một nhân vật (mũ trùm viền xanh + mắt sáng + vạt xanh + áo choàng tối + chuông vàng + kiếm sáng). Ở ×1 vẫn đọc được là Lam nhờ silhouette mũ–kiếm–chuông, nhưng đai ngực/trâm/vạch ủng gần như mất.

## (b) Chất lượng pixel

Số màu thật đếm trên 6 PNG: **12 kể cả trong suốt** (11 màu + trong suốt), tất cả thuộc bảng: #0C0F14 #1A212B #212835 #2C3546 #21413A #32804F #83CC93 #9C6B30 #E1B85A #F3E6C8 #CEF0D6. Không dùng #4A5A6E, không màu ngoài bảng, không AA/gradient/dithering (màu lấy theo ID bộ phận + bậc toon rồi khoá bảng). Viền ngoài 1 px #0C0F14; viền trong theo ID tách mũ/áo/thân/kiếm/chuông/2 chân/2 tay; mắt, chuông, lưỡi kiếm, vạch ủng được bảo vệ khi dọn pixel lẻ.

Chỗ còn thô: (1) mép mũ phía sau có 1–2 bậc thang (răng cưa) do lưới mũ 18 cột ở 45 px; (2) vùng tay gần + hông bên trái là một mảng tối, chỉ tách khỏi áo choàng bằng viền trong 1 px; (3) gấu áo choàng răng cưa bị gộp thành 2–3 pixel xanh lẻ ở ×1; (4) dây chuông 1 px và chắn kiếm 1 px đôi lúc đứt; (5) vệt sáng vai (#83CC93) chỉ 1–2 px, không thành "vạt rách" như mẫu.

## (c) Chuyển động

6 khung, 8 FPS (125 ms/khung, 750 ms/vòng), lặp. Biên độ: hông lên 0,012 đơn vị (≈ 0,5 px), ngực/vai thêm ≈ 0,3 px (vai lên xuống ≤ 1 px), đầu gật rất nhẹ (chiều cao bbox 46 → 47 → 46 px); tay cầm kiếm theo ngực (tâm lưỡi kiếm dao động 0,6 px ngang, < 0,2 px dọc); áo choàng và chuông là con lắc mô phỏng tất định (dt 1/120 s, chạy ấm 8 vòng), có độ trễ so với thân, gió nhẹ 0,1 ± 0,25 (tâm chuông dao động ≈ 0,4 × 0,6 px, 23–28 pixel).

Khép vòng: lệch trạng thái mô phỏng khung cuối → khung đầu 0,0001 px. Sai khác pixel giữa các khung kề nhau: 98, 169, 86, 88, 150, **74** (số cuối là khung 6 → khung 1) – nhỏ nhất trong chuỗi, nên không giật khi nối vòng. Hai bước 169/150 là lúc hông vượt ranh pixel (thân nhích lên/xuống 1 px).

Chân: mục tiêu IK 2 bàn chân cố định, mặt nạ 6 hàng dưới cùng (y 58–63, toàn bộ pixel kể cả viền) **giống hệt nhau ở cả 6 khung** (`kiem-tra.json: chanCoDinh = true`). Pivot render [32,63] ở mọi khung; không scale/căn theo bbox.

Kiểm trên trang `game/xem-thu/anim2d.html` (headless, `anim2d-check.png`): sheet 512×320 nạp đúng, idle 6 khung fps 8 loop true, chân đặt trên vạch đất, dấu + pivot nằm giữa 2 chân, khung đổi đúng nhịp (~2 khung/250 ms). Trang không hỗ trợ `?json=`; cách tự thử trên iPhone: mở trang, dán URL `https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/anim/lam-idle-proto.png` vào ô "Dán URL PNG" rồi bấm "Nạp URL" (hoặc "Chọn tệp" với file lam-idle-proto.png). Trang dùng `lam.anim.json` (5 hàng); hàng idle trùng định dạng nên phát được, các hàng khác trong suốt.

## Hạn chế lớn nhất

1. Áo choàng ngắn và xoè ít hơn mẫu; gấu rách chỉ còn vài pixel lẻ.
2. Vùng hông/tay gần là mảng tối thiếu chi tiết; đai ngực, trâm, vạch ủng gần như mất ở ×1.
3. Run/Slash trong proto.html là bản cũ chưa chỉnh theo rig/mô hình mới (ngoài phạm vi), xem chỉ để tham khảo.
