# Thủ Thành Anh Hùng (prototype)

Game thủ thành màn hình dọc cho điện thoại. Lối chơi lấy cảm hứng từ Dota 1; tên, hình và chỉ số là thiết kế riêng.

- **6 tướng, 3 thuộc tính.** Sức mạnh (Hiệp Sĩ, Đồ Tể), Nhanh nhẹn (Cung Thủ, Sát Thủ), Trí tuệ (Pháp Sư Lửa, Pháp Sư Băng). Thuộc tính chính cộng vào sát thương. Sức mạnh tăng máu, Nhanh nhẹn tăng tốc đánh, Trí tuệ tăng sức mạnh kỹ năng và giảm hồi chiêu.
- **Kỹ năng Q W E R mạnh dần theo số quái tiêu diệt.** Số quái hạ được mở khóa kỹ năng và làm kỹ năng mạnh thêm. Kinh nghiệm chia cho các tướng đứng gần giúp lên cấp (tối đa 25).
- **Tiến hóa.** Đạt 25 / 75 / 150 quái thì tướng to hơn, có sao và hào quang.
- **6 ô đồ.** 3 ô trang phục (vũ khí, mũ, giáp) đổi hình dạng tướng. 3 ô phụ kiện mua ở Cửa hàng và ghép thành đồ mạnh có hào quang riêng. Đủ 3 món Bộ Rồng thì tướng mọc cánh.
- **Boss Thạch Long Gorath** xuất hiện mỗi 5 đợt: dậm đất làm choáng tướng, gọi quái con. Hạ boss nhận **Huy Hiệu Phượng Hoàng** giúp tướng hồi sinh ngay một lần.
- **Tướng có máu.** Pháp Sư Quỷ bắn tướng, boss dậm đất. Tướng gục sẽ hồi sinh sau vài giây.

## Chạy thử

Không cần build, chỉ cần mở `index.html`. Để chơi trên điện thoại cùng mạng wifi:

```bash
npx serve .          # hoặc: python3 -m http.server 8000
```

Sau đó mở `http://<ip-máy-tính>:8000` trên điện thoại.

**Cách chơi:** chạm vào bãi cỏ sát đường, bảng chọn tướng nhỏ hiện ngay tại chỗ (có khoảng 40 vị trí ẩn xếp nhiều hàng dọc hai bên đường; chạm lệch một chút vẫn bắt dính). Giữ và kéo tướng sang chỗ khác để chuyển hoặc đổi chỗ. Chạm vào tướng để mở bảng tướng. Mua và ghép đồ ở **Cửa hàng**. Bấm **Gọi đợt** để quái tới.

Vị trí đặt tướng được sinh tự động theo `CONFIG.buildGrid` trong `js/data.js` (khoảng cách ô, dải cách đường).

**Khi cập nhật game:** tăng số `?v=` của các file CSS/JS trong `index.html` (và dòng "Phiên bản" trên màn hình bắt đầu). Như vậy Safari trên điện thoại sẽ buộc phải tải bản mới thay vì dùng bản cũ trong bộ nhớ đệm.

## Cấu trúc code

| File | Nội dung |
|---|---|
| `js/data.js` | **Toàn bộ dữ liệu**: bản đồ, tướng (thuộc tính + kỹ năng QWER), trang bị, phụ kiện & công thức ghép, bộ đồ, quái, boss, đợt quái. Muốn cân bằng hoặc thêm nội dung thì sửa file này. |
| `js/render.js` | Vẽ bằng code: `computeLook()` gộp ngoại hình gốc + đồ + bậc tiến hóa + bộ đồ, rồi `drawHero()` vẽ theo kết quả đó. |
| `js/game.js` | Logic: quái đi theo đường, tướng tấn công, cấp & thuộc tính (`heroStats()`), kỹ năng chủ động (`SKILL_CASTS`), máu/gục/hồi sinh, boss, cửa hàng & ghép đồ, rơi đồ. |
| `js/ui.js` | Menu, HUD, gợi ý người mới, chọn tướng, bảng tướng kiểu Dota, cửa hàng, túi đồ, thanh máu boss. |
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
