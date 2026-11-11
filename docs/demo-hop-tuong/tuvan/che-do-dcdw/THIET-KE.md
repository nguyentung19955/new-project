# CHẾ ĐỘ CHƠI THEO DCDW — đối chiếu và thiết kế (phiên điều phối cũ, 11/11)

Người dùng giao (11/11 17:57): rà DCDW có những chế độ nào (nhiều nguồn), rồi làm theo. File này = kết quả rà + đề xuất. CHƯA có code.

## 1. DCDW có gì (nguồn: namu.wiki, thisisgame, gameshot, playforum, xportsnews, gametoc/worktoday, zdnet.co.kr, MobyGames)
| Chế độ DCDW | Luật | Game mình |
|---|---|---|
| Battle (PVP 1v1) | Diệt quái thì đẩy quái sang đối thủ; ai mất 3 tim trước thua; có trùm theo pha; lên Arena theo cúp | CÓ (PVP, đấu máy) |
| Infinite Defense (co-op 2 người) | 2 bàn, đường chữ ㅏ, quái ra từ 2 đầu; trùm mỗi 10 wave, hạ trùm thêm thưởng | CÓ (CO-OP + ONLINE) |
| Raid / Designated Raid (01/2021) | 2 người hạ 1 trùm chung; trùm đứng ở cửa và gọi quái; đường bắt đầu ở vùng chung rồi tách 2 nhánh về mỗi người; vào bằng 20 token (token từ thắng PVP hoặc co-op ≥ wave 30); mở ở cấp tài khoản 6 | CHƯA (Săn Trùm của mình là 1 người, trùm đi trên đường) |
| Race Track (11/2022) | 2 người, 8 phút, chặn càng nhiều quái càng tốt; mỗi con bị diệt làm quái sau trâu dần; thưởng theo ĐIỂM CAO NHẤT, đặt lại thứ Hai hằng tuần; về sau cộng điểm theo clan để xếp hạng clan | CHƯA |
| Push Mode (11/2023, PVP) | Mỗi người bắn 1 trùm để đẩy lùi; hết giờ ai đẩy trùm về gần điểm xuất phát hơn thì thắng | CHƯA |
| Challenge modes (01/2021, theo đợt) | Trận luật riêng: giới hạn mana, bắt buộc có 1 tướng chỉ định trong bộ | GẦN CÓ (Thử thách tuần, Thử thách ngắn) |
| Archfiend Race (06/2021, sự kiện) | Nhóm người chơi cùng làm nhiệm vụ ngẫu nhiên (số lần triệu hồi, vàng, số quái diệt, số trận), thưởng theo mức đạt | CHƯA → thuộc Giai đoạn E (sự kiện xoay vòng) |
| Friendly match + Alliance (clan 50 người: xin/cho thẻ, rủ co-op/raid) | | Phòng bạn bè CÓ; clan CHƯA → Giai đoạn F (cần máy chủ) |
Game mình có thêm mà DCDW không có: Leo Tháp, Săn Trùm, Thử thách ngắn, Vô tận, Bảng xếp hạng.

## 2. Đề xuất làm (thứ tự) — dùng lại khung chedo-c.js / chedo-d.js, TẤT ĐỊNH (rngHat, không Math.random), khoá lưu con mới dưới turret_kt.cd
1. **ĐƯỜNG ĐUA (RACE TRACK)** — khác biệt nhất, rẻ nhất. Bố cục co-op (bạn + đồng đội máy; online sau). Đồng hồ 8:00, không wave: quái ra liên tục theo nhịp; máu quái = nền × (1 + k·số quái đã diệt) → ai dọn nhanh thì quái trâu nhanh (tự cân bằng, không cần bắn lan). Quái lọt: trừ điểm + mất tim (hết 3 tim = dừng sớm, giữ điểm). Điểm = tổng "cân nặng" quái đã diệt. Thưởng: mốc điểm tuyệt đối, 1 lần/tuần, đặt lại thứ Hai (như Vô tận) + thêm 1 bảng trong LB. Khoá: `turret_kt.cd.dd`.
2. **ĐỘT KÍCH (RAID)** — co-op hạ 1 trùm đứng yên ở cửa, trùm gọi quái theo chu kỳ, đường tách 2 nhánh về 2 bàn. 10 bậc máu trùm; thắng = trùm chết trước khi hết giờ/tim. Vé RAID: nhận khi thắng tầng Leo Tháp hoặc co-op ≥ wave 30 (như DCDW), không bán. Thưởng lần đầu mỗi bậc + Tinh thể Đỏ. Khoá: `turret_kt.cd.rd`. Cần bố cục đường mới (ảnh hưởng render) → mức LỚN.
3. **ĐẨY TRÙM (PUSH)** — biến thể PVP đấu máy: mỗi bên 1 trùm đi chậm trên đường, sát thương đẩy lùi (không giết), 3 phút, ai đẩy xa hơn thắng. Hợp nguyên tắc "sát thương đơn mục tiêu có đất dùng". Làm sau khi cân bằng xong (phụ thuộc số ST).
4. Luật "bắt buộc có ụ X trong bộ" → thêm làm 1 kiểu của Thử thách tuần (nhỏ). Archfiend Race → gộp vào Giai đoạn E. Clan → Giai đoạn F.

## 3. Chưa làm vì
Máy phiên cũ còn ~640 MB ổ đĩa (không dựng được bản làm việc + Playwright), và phiên điều phối mới đang sửa cân bằng trên cùng các file (data.js, chedo-c.js). Làm khi: người dùng cho xoá thư mục test cũ trong /tmp của máy này (làm trên nhánh `claude/che-do-dcdw`, phiên mới gộp), HOẶC phiên mới nhận mục 2.1 sau khi xong bảng cân bằng. Trước khi áp số (nhịp ra quái, k, mốc điểm, thưởng) phải gửi bảng cho người dùng.
