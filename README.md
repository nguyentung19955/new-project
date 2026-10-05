# Thủ Thành Anh Hùng (prototype)

Game thủ thành **màn hình ngang** cho điện thoại (cầm dọc sẽ hiện nhắc xoay máy). Giao diện theo bản thiết kế: HUD chơi, Cây kỹ năng, Lò rèn, Tiến hoá & Cây Sự Sống, Bách khoa quái. Lối chơi lấy cảm hứng từ Dota 1; tên, hình và chỉ số là thiết kế riêng.

- **6 tướng, 3 thuộc tính.** Sức mạnh (Hiệp Sĩ, Đồ Tể), Nhanh nhẹn (Cung Thủ, Sát Thủ), Trí tuệ (Pháp Sư Lửa, Pháp Sư Băng). Thuộc tính chính cộng vào sát thương. Sức mạnh tăng máu, Nhanh nhẹn tăng tốc đánh, Trí tuệ tăng sức mạnh kỹ năng và giảm hồi chiêu.
- **Kỹ năng Q W E R mạnh dần theo số quái tiêu diệt.** Số quái hạ được mở khóa kỹ năng và làm kỹ năng mạnh thêm. Kinh nghiệm chia cho các tướng đứng gần giúp lên cấp (tối đa 25).
- **Năng lượng & điểm kỹ năng.** Kỹ năng chủ động tốn năng lượng (Trí tuệ tăng năng lượng và hồi năng lượng). Mỗi cấp cho 1 điểm để nâng kỹ năng trong Cây kỹ năng (Q/W/E tối đa 4, R tối đa 3).
- **Chiến dịch 30 đợt.** Boss ở đợt 10, 20, 30; quái tinh anh Golem ở đợt 5, 15, 25. Thắng đợt 30 có thể chơi tiếp chế độ vô tận.
- **Cây Sự Sống** lớn mỗi đợt: cho vàng, hồi mạng thành, ra quả hồi máu tướng. Tưới cây (80 vàng) để lớn nhanh hơn.
- **Tiến hóa.** Đạt 25 / 75 / 150 quái thì tướng to hơn, có sao và hào quang.
- **6 ô đồ.** 3 ô trang phục (vũ khí, mũ, giáp) đổi hình dạng tướng. 3 ô phụ kiện mua ở Cửa hàng và ghép thành đồ mạnh có hào quang riêng. Đủ 3 món Bộ Rồng thì tướng mọc cánh.
- **Quái có giáp và kháng phép.** Hiệp Sĩ, Đồ Tể, Sát Thủ, Cung Thủ gây sát thương vật lý (bị giáp giảm); hai Pháp Sư gây sát thương phép (bị kháng phép giảm). Cơ chế quái: Sói Hoang hóa điên khi máu thấp, Golem Đá giáp dày và kháng choáng, Pháp Sư Quỷ bắn tướng và hồi máu đồng đội, Dơi Độc bay (chỉ tướng đánh xa bắn được), Bọ Phân Thân chết tách thành 3 Bọ Con. Từ đợt 6 có quái tinh anh (Giáp Sắt, Hồi Máu, Thần Tốc, Khiên Phép). Chạm vào quái trong bảng đợt kế để xem cơ chế.
- **3 boss ở đợt 10, 20, 30:** Thạch Long Gorath (dậm đất làm choáng, hóa điên), Chúa Tể Tro Tàn (thiêu tướng đứng gần, gọi quỷ lửa mỗi 25% máu), Vua Xương (gọi lính, hồi sinh một lần). Hạ boss được chọn 1 trong 3 phần thưởng: bảo vật riêng của boss, đồ Sử thi/Huyền thoại, hoặc kho báu/thăng cấp toàn quân.
- **Tướng có máu.** Pháp Sư Quỷ bắn tướng, boss dậm đất. Tướng gục sẽ hồi sinh sau vài giây.

## Chạy thử

Không cần build, chỉ cần mở `index.html`. Để chơi trên điện thoại cùng mạng wifi:

```bash
npx serve .          # hoặc: python3 -m http.server 8000
```

Sau đó mở `http://<ip-máy-tính>:8000` trên điện thoại.

**Cách chơi:** chạm vào bãi cỏ sát đường để đặt tướng. Bấm nút **▶** trên cùng bên phải: các đợt quái tự nối tiếp nhau (nghỉ 10 giây giữa hai đợt, có bảng xem trước đợt kế và nút **Gọi sớm** để lấy thêm vàng). Bấm lại để dừng cả game. Tướng tự dùng kỹ năng Q ngay từ đầu, các kỹ năng W/E/R mở dần theo số quái hạ được. Giữ và kéo tướng để đổi chỗ, chạm vào tướng để mặc đồ, mua và rèn đồ ở **Lò rèn**.

Vị trí đặt tướng được sinh tự động theo `CONFIG.buildGrid` trong `js/data.js` (khoảng cách ô, dải cách đường).

**Khi cập nhật game:** tăng số `?v=` của các file CSS/JS trong `index.html` (và dòng "Phiên bản" trên màn hình bắt đầu). Như vậy Safari trên điện thoại sẽ buộc phải tải bản mới thay vì dùng bản cũ trong bộ nhớ đệm.

## Cấu trúc code

| File | Nội dung |
|---|---|
| `js/data.js` | **Toàn bộ dữ liệu**: bản đồ, tướng (thuộc tính + kỹ năng QWER), trang bị, phụ kiện & công thức ghép, bộ đồ, quái, boss, đợt quái. Muốn cân bằng hoặc thêm nội dung thì sửa file này. |
| `js/render.js` | Vẽ bằng code: `computeLook()` gộp ngoại hình gốc + đồ + bậc tiến hóa + bộ đồ, rồi `drawHero()` vẽ theo kết quả đó. |
| `js/game.js` | Logic: quái đi theo đường, tướng tấn công, cấp & thuộc tính (`heroStats()`), kỹ năng chủ động (`SKILL_CASTS`), máu/gục/hồi sinh, boss, cửa hàng & ghép đồ, rơi đồ. |
| `js/ui.js` | Menu, HUD (thanh trên, bảng đợt, bản đồ nhỏ, khung tướng QWER + 6 ô đồ, bảng triệu hồi), Cây kỹ năng, Lò rèn, Tiến hoá & Cây Sự Sống, Bách khoa quái, thưởng boss. |
| `js/main.js` | Co giãn canvas theo màn hình, xử lý chạm, vòng lặp vẽ. |

### Thêm một kỹ năng mới
Mỗi tướng có đúng 4 kỹ năng (Q W E R) trong `HEROES.<tướng>.skills`, dạng:
```js
{ id: 'x', name: 'Tên', icon: '🔥', unlock: 50,         // số quái cần hạ để mở
  info: (n) => `mô tả, n = số mạng kể từ khi mở`,
  apply: (s, n) => { s.damage += n * 0.3; } }           // kỹ năng nội tại, lớn theo n
// hoặc kỹ năng chủ động: active: { cooldown: 10, cast: 'tenHam' } và thêm hàm vào SKILL_CASTS
```

### Thêm món ghép mới
```js
storm_blade: { name: 'Kiếm Sấm', slot: 'acc', rarity: 'epic', icon: '⚡',
               recipe: { parts: ['iron_claws', 'war_gloves'], cost: 180 },
               stats: { damage: 25, haste: 20 }, look: { aura: '#74b9ff' } },
```

### Thêm một món đồ mới
Trong `ITEMS`, trường `look` quyết định hình dạng khi mặc:
```js
frost_helm: { name: 'Mũ Băng', slot: 'helmet', rarity: 'epic',
              stats: { damage: 5 }, look: { type: 'horned', color: '#74b9ff' } },
```

## Hướng phát triển tiếp
- Thay hình vẽ bằng code bằng sprite hoặc spine. Đồ có thể làm thành các lớp ảnh chồng lên nhau theo đúng thứ tự trong `drawHero()`.
- Đóng gói thành app Android/iOS bằng [Capacitor](https://capacitorjs.com/), hoặc chuyển sang Phaser, Cocos Creator, Unity khi game lớn hơn. Phần dữ liệu trong `data.js` có thể giữ nguyên.
- Thêm lưu game (`localStorage`), nhiều màn chơi, nâng cấp đồ, gacha tướng, tướng đỡ đòn chặn quái.
