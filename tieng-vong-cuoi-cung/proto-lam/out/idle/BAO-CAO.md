# Báo cáo vòng 3: Lam 3/4 – idle 6 khung – chỉnh ngoại hình CUỐI (3 điểm) trước khi làm Run

Phạm vi: chỉ 3 điểm review dưới đây, trong `proto-lam/proto.html` + xuất lại idle. Giữ nguyên: 6 khung, 8 FPS, pivot [32,63]; rig; camera trực giao (xoay 22°, nhìn xuống 12°); pipeline xuất; chân/ủng đứng yên tuyệt đối; bảng màu ≤ 16, alpha 0/255; khép vòng. Không đụng run/jump/fall/attack, `game/demo.html`, `game/lib/*`, `art/sprite/*`, `tools/*`.

Ảnh để xem: `so-sanh-v2-v3-x4.png` (khung 1 vòng 2 | vòng 3 | mẫu), `so-sanh-mau-x4.png`, `idle-x4.png`, `idle-x8.png`, `idle.gif`, `overlay-mau.png`. Số liệu: `kiem-tra.json` (các khoá mới: `beRongThanNguc`, `aoBbox`/`aoXoeThemPx`, `ungTheoHang`, `vatAo`, `dauKiem`, `kiemLien`, `chuongNgoaiMu`, `dayChuongLien8`). Khung 1 vòng 2 giữ ở `vong2-idle-0.png`, mặt nạ ID 6 khung vòng 2 ở `vong2-id.png` (để script đo "trước/sau" tự động).

## 1. Chuông – ĐẠT

*Thực tế ở vòng 2:* trong ảnh xuất, chuông đã ở phía lưng (cột 19–24, mặt/mắt ở cột 31–37) nhưng **dính vào mép lưng mũ** (chồng 1–2 cột lên mũ, `khoangCachToiMu = −1`) và dây chỉ 2–3 px nên nhìn như chuông gắn ngang má mũ – dễ đọc nhầm là ở trước mặt.

*Sửa (3D, không đổi camera):* neo chuông trong hệ ngực lùi ra sau thêm (x −0,245 → −0,248 để khoen chạm đúng mép lưng mũ), dây dài hơn (0,05 → 0,10 ≈ 4–5 px), chuông treo **ngả ra sau 0,30→0,50 rad** (`CH_REST`, như khoen bị mũ đẩy ra) để thân chuông rời hẳn mũ; dây mảnh hơn (bán kính 0,005) để ra đúng 1 px.

*Kết quả (`chuongNgoaiMu`, `dayChuongLien8`):* thân chuông cột 15–20 (hàng 33–40), mép lưng mũ ở cột 24 → **cách mũ 3 px nền trong suốt ở mọi khung**, không che mặt (`chuongTrumMat = false`), hé ra ngoài mũ toàn bộ (8–9 px). Dây màu vàng `#9C6B30/#E1B85A`, đỉnh dây (22,30) chạm mép mũ, chạy chéo xuống chuông 4–5 pixel, liền (liên thông 8) ở cả 6 khung. *Còn khác:* dây chéo nên ở khung 2–4 có 1 hàng dây 2 px (bậc thang), các hàng khác 1 px; chuông vẫn là hình thang trơn, không có khoen tròn + núm `+` như mẫu (ngoài phạm vi 3 điểm).

## 2. Silhouette – ĐẠT

- **Áo choàng xoè ra sau:** 3 đoạn dưới xoè thêm (`AO_REST` 0,25/0,36/0,46/0,54 → 0,28/0,40/0,52/0,62), quạt toả `fl` 0,022 → 0,030, đoạn dài 0,06 → 0,062 (bù gấu không bị nâng). Cột trái bbox áo: 15 → 12–13, tức **xoè thêm 2–3 px** tuỳ khung (`aoXoeThemPx = [2,3,3,3,2,2]`); gấu vẫn tới hàng 58–59.
- **Vạt rách dài, nhọn:** mỗi vạt = 1 cột kéo sâu +0,14 kẹp giữa 2 khía −0,04 (bên xa khía bằng để không lấp khía bên gần). Kết quả 3 vạt ở x≈12–13 (lưng), 16–17, 21–22; **mũi mỗi vạt rộng 1 px** (vòng 2: 2 px), đáy vạt hàng 57–59, dài hơn vòng 2 1–2 hàng (`vatAo`). *Còn khác:* mũi tam giác mất ≈1 px khi gộp 2×2 nên vạt hiện ≈5 px thay vì 6 px hình học; mẫu có vạt dài hơn nữa và mảng sáng lớn ở vạt trước.
- **Mũi/gót ủng:** bàn chân dài 0,10 → 0,16, tâm lùi 0,01. Theo hàng (`ungTheoHang`, khung 1): gót hàng 59–61 cột 27/27/28 → **26/26/27 (+1 px)**, mũi hàng 61–62 cột 38/39 → **39/40 (+1 px)**; vùng ủng vẫn **cố định tuyệt đối** giữa 6 khung (`ungCoDinh = true`, `ungKhac = []`), vạch cổ ủng 3 hàng.
- **Thân không to thêm:** bề rộng thân (ID thân + đai + trâm) ở hàng 40–45, đo từng khung vòng 2 vs khung tương ứng vòng 3: **bằng nhau** (`beRongThanBangNhau = true`, khung 1: 9/7/7/7/8/8 px).

## 3. Kiếm – ĐẠT

Chỉ xoay cổ tay (hướng lưỡi `gBy` 0,17 → 0,02; khung hít vào 0,15 → 0,00), tay vẫn là **tay xa**, mục tiêu bàn tay không đổi. Đầu kiếm (pixel lưỡi xa nhất bên phải): (57,45) → **(58,48), hạ 3 px ở cả 6 khung** (`dauKiem.haXuongPx = [3,…]`), lưỡi gần ngang (hàng 46–48). Nối liền (`kiemLien`): lưỡi + chuôi/chắn là một khối liên thông 4 chạm bàn tay, có cặp pixel kề tay–chuôi và chuôi–lưỡi ở mọi khung → không có pixel trong suốt cắt giữa tay–chuôi–chắn–lưỡi. Lưỡi không chạm áo choàng/thân (áo ở cột ≤ 33, lưỡi từ cột 46).

## Xung đột với camera/rig

Không có. Không phải đổi camera hay rig cho cả 3 điểm; chuông sau khi lùi ra sau không bị mũ/thân che.

## Kiểm chung (không đổi so với vòng 2)

12 màu kể cả trong suốt, không màu ngoài bảng, alpha 0/255; pivot render [32,63] ở 6 khung; cao nhân vật 46/46/46/47/46/46; lệch khép vòng mô phỏng 0,0001 px; sai khác pixel khung kề: 189, 180, 125, 149, 186, **116** (6→1 nhỏ nhất → nối vòng mượt; tăng nhẹ so với vòng 2 vì áo choàng rộng hơn đu đưa nhiều pixel hơn). Chuôi+chắn 16–18 px, chuông 25–28 px, dây 4–5 px, trâm 7–8 px, mắt sáng 4–5 px ở mọi khung. Sheet `game/anim/lam-idle-proto.png` (512×320, hàng 0) + `.anim.json` ghi đè, cùng định dạng vòng 2.
