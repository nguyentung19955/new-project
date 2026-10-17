# Đề xuất: Lam 3/4 – prototype 3D → pixel

Prototype độc lập trong `proto-lam/`, không đụng pipeline hiện có. Mở `proto.html` (cần `vendor/three.min.js`) hoặc `proto.build.html` (một file, chạy không cần mạng).

## 1. Góc camera

- **Trực giao, cố định**, xoay quanh trục đứng **30°** và nhìn xuống **12°**.
- Xoay về **phía sau lưng** Lam một chút (như bản chốt `nguyen-con.png`): thấy lưng mũ trùm, áo choàng phủ lưng, và **chuông ở vai trái luôn nằm TRÊN lớp áo** nên không bao giờ bị thân che. Nếu xoay ra phía trước mặt thì chuông sau vai trái bị thân che hoàn toàn ở tư thế đứng – đã tính thử, không dùng được.
- Đầu xoay ~25° về phía người xem để 2 mắt (2 điểm `#CEF0D6`) lọt trong bóng mũ. Mắt được "bảo vệ": luôn vẽ 2 điểm, không bị gộp màu.
- Lam nhìn sang phải; game lật ngang khi quay trái (chuông sẽ đổi vai, chấp nhận như sprite 2D hiện nay).

## 2. Tỉ lệ cơ thể (đơn vị: chiều cao = 1,0)

| Phần | Từ → đến | Ghi chú |
| --- | --- | --- |
| Chân (hông → đất) | 0,30 | đùi 0,14 · ống 0,135 · giày thấp |
| Thân | 0,30 → 0,52 | eo thon, ngực tròn, thắt lưng ở 0,38 |
| Đầu + mũ | 0,58 → 0,98 | ≈ 0,40 chiều cao (chibi nhẹ, mũ nhọn ngả sau) |
| Áo choàng | cổ 0,53 → gấu 0,31 | **ngắn ngang hông**, hở trước, gấu răng cưa |
| Chuông | treo sau vai trái, dây 0,05, thân 0,09 | nhỏ nhưng ≥ 3 px ở cỡ 36 |
| Kiếm | lưỡi 0,32 + chuôi 0,07 | tay phải (phía gần camera) |

## 3. Hai cỡ thử

| Cỡ | px/đơn vị | Ô | Vì sao |
| --- | --- | --- | --- |
| **36 px** (ô 48) | 34 (+2 viền) | 48×48 | Bằng Lam 3D hiện tại; chuông ≈ 3 px, mắt 2 điểm cách 1 px – ngưỡng thấp nhất còn đọc được |
| **44 px** (ô 64) | 42 (+2 viền) | 64×64 | Chuông 4 px, viền xanh mũ/áo rõ, kiếm 2 px; ô 64 đủ chỗ cho nhát chém duỗi hết (mũi kiếm cách mép 7 px) |

Cả hai cỡ render từ cùng mô hình, cùng keyframe → so trực tiếp trên nền Làng Chuông (`out/trong-game.png`).

## 4. Xương

```
goc (giữa 2 chân, trên đất)
└─ hong (x,y; yaw/pitch)
   ├─ dui T/P → goi → ong → coChan → ban chân   (IK 2 đoạn, bàn chân bám đất)
   └─ song (gập trước/sau) → nguc (yaw)
        ├─ co → dau (pitch/yaw/roll) → mũ (tham số, có đoạn mũi trễ)
        ├─ vai T → canhTay → khuyuTay → cangTay → banTay
        ├─ vai P → … → banTay P → kiếm (cổ tay 2 trục)
        ├─ neo áo choàng (vòng cổ)
        └─ neo chuông (sau vai trái)
```

Khớp gối/khuỷu/vai/hông là **khối cầu chồng** lên đầu các đoạn capsule nên gập không hở. Chân đặt theo **IK 2 đoạn**: pose chỉ cho vị trí bàn chân (x, y) và góc bàn chân, gối tự tính và luôn gập về trước.

## 5. Áo choàng ngắn và chuông trễ

- Áo choàng = lưới tham số 4 hàng × 13 cột quanh lưng (hở trước 100°), dựng lại mỗi khung từ **3 đoạn con lắc** nối tiếp (góc trước/sau + góc ngang). Mỗi đoạn: trọng lực, giảm chấn, độ cứng kéo về đoạn cha, gia tốc điểm neo (sai phân hữu hạn từ vị trí cổ), **gió = tốc độ chạy ảo** đẩy ra sau, chặn không lún vào lưng. Lưng lắc mạnh, hai bên lắc yếu dần (trọng số cos²).
- Chuông = con lắc cầu (2 góc) treo ở neo sau vai trái; cùng mô hình, dây ngắn hơn nên tần số nhanh hơn áo → nhịp lệch, nhìn "sống".
- Mũi mũ trùm = lò xo 1 bậc theo gia tốc đầu (trễ nhẹ khi gật/chạy).
- **Tất định**: bước cố định 1/120 s, không có số ngẫu nhiên (seed chỉ dùng cho rung nhẹ idle). Với idle/run chạy trước 8 vòng để mô phỏng về trạng thái tuần hoàn → khung cuối nối khung đầu; trang in độ lệch khép vòng (px). Slash khởi từ trạng thái nghỉ của idle nên nối liền idle → slash → idle.

## 6. Pipeline render → pixel

1. Render **toon 3 bậc** (shader riêng, mỗi vật liệu một bậc màu lấy đúng từ bảng màu; mặt trong mũ/áo dùng bậc tối hơn) ở độ phân giải ×2, **không AA**. Song song render một lượt **ID bộ phận + độ sâu**.
2. Gộp 2×2 → 1 px theo **đa số có ưu tiên nét mảnh** (lưỡi kiếm, dây/chuông, viền mũ được giữ dù chiếm < ½ ô). Màu = màu đa số của bộ phận thắng → **khóa bảng màu** tự nhiên (không có màu ngoài bảng).
3. Dọn: bỏ pixel lẻ không dính gì (trừ bộ phận bảo vệ), đốm màu lẻ bên trong một bộ phận nhận màu xung quanh.
4. **Viền trong 1 px theo ID**: ở ranh giới mũ/kiếm/chuông/tay gần/chân gần với phần khác, pixel **xa camera hơn** đổi sang `#0C0F14` → tách mũ khỏi áo, kiếm khỏi thân, chân trước khỏi chân sau.
5. **Bảo vệ**: 2 điểm mắt vẽ lại vào vùng mặt/mũ; chuông và lưỡi kiếm không bị dọn/đè viền.
6. **Viền ngoài 1 px** `#0C0F14` (lân cận 4, cho đường viền 8-liên thông mảnh).
7. Lật ngang khi cần (game), pivot = hình chiếu điểm giữa 2 chân, ghi trong JSON.

Mỗi khung lưu kèm: hold (ms, không đều), cờ `hit`, hộp lưỡi kiếm (khung hit), tên khung.

## 8. Cập nhật idle 64 (xem `out/idle/BAO-CAO.md`)

- Mô hình chỉnh lại theo `art/nhan-vat/lam-48/nguyen-con-v2-mat-sang.png`: mũ 0,58→0,99, vai 0,50, đai chéo + trâm ngực, thắt lưng 0,40, gấu vạt 0,215, ủng cao tới 0,13 có vạch xanh, áo choàng 6 hàng tới ≈ 0,16, chuông treo ở (−0,20; 0,67; −0,08).
- **Camera xoay +22° về phía trước mặt** (thay vì −30° về sau lưng) để thấy vạt xanh, trâm và mặt trong mũ; chuông đặt xa lưng hơn nên vẫn nổi ngoài silhouette. Hướng sáng khai báo trong hệ camera (shader dùng `normalMatrix`).
- **Kiếm ở tay xa (tay phải), tay gần để trống**, tay đặt bằng IK 2 đoạn (`ik: 1`, mục tiêu `gH*`/`xH*`, hướng lưỡi `gB*`); run/slash vẫn dùng kênh góc cũ.
- Cỡ ô 64: ppu 45 (nhân vật 46 px + viền), gốc chiếu vào pivot [32,63]. Idle: 6 khung × 125 ms, chân cố định tuyệt đối, khép vòng.
- Xuất: `python3 proto-lam/xuat-idle.py` → `out/idle/` + `game/anim/lam-idle-proto.png/.anim.json`.

## 9. Vòng 2 – sửa ngoại hình theo review (xem `out/idle/BAO-CAO.md`)

- Giữ nguyên kỹ thuật vòng 1 (rig, camera 22°/12°, ppu 45, pivot, 6 khung 8 FPS, bảng màu, pipeline). Chỉ sửa mô hình: mũ đo lại theo mẫu (rộng ngang mắt, chỏm nhọn ngả sau ở lưng mũ, mép dưới xoè, khoang mặt đen mở rộng); áo choàng 7×19, 6 đoạn, dài gần mắt cá, toả quạt, gấu có 3 vạt rách chọn theo toạ độ chiếu; trâm ID riêng; ủng to hơn, vạch cổ ủng torus riêng; bàn tay xa đưa ra trước bụng + kiếm đẩy trước tay để lộ chuôi/chắn; chuông neo ngoài mép lưng mũ, dây vàng, chỏm sáng riêng.
- Chân cố định kiểm bằng **mặt nạ ID ủng** (`ungG`/`ungX`/vạch): trong idle gốc đùi giữ ở độ cao hông tĩnh nên cả chân cứng tuyệt đối; viền trong gấu áo ↔ chân tô lên gấu áo.
