# Thủ Thành Anh Hùng (prototype)

Game thủ thành (tower defense) màn hình dọc cho điện thoại. Thay vì xây tháp, bạn đặt **tướng** vào các ô để giữ thành.

- **Kỹ năng lớn dần theo số quái tiêu diệt.** Mỗi tướng đếm số mạng (☠) mình hạ được. Số mạng này vừa mở khóa kỹ năng mới, vừa làm các kỹ năng đã có mạnh thêm. Ví dụ Đa Tiễn của Cung Thủ được thêm 1 mũi tên sau mỗi 40 mạng.
- **Tiến hóa.** Đạt 25 / 75 / 150 mạng thì tướng to hơn, có thêm sao và hào quang.
- **Trang bị đổi hình dạng tướng.** Tướng có 3 ô đồ: vũ khí, mũ, giáp. Mỗi món đồ vừa tăng chỉ số vừa thay đổi cách vẽ tướng (mũ sắt, mũ sừng, nón phù thủy, vương miện, giáp tấm, áo choàng, áo khoác, kiếm, rìu, cung, trượng phát sáng...).
- **Bộ đồ.** Mặc đủ 3 món **Bộ Rồng** thì tướng mọc cánh rồng, có hào quang xanh và được +30% sát thương.
- **Kiếm đồ.** Đồ rơi ra khi diệt quái (boss luôn rơi đồ Hiếm trở lên) hoặc mua bằng rương ngẫu nhiên.

## Chạy thử

Không cần build, chỉ cần mở `index.html`. Để chơi trên điện thoại cùng mạng wifi:

```bash
npx serve .          # hoặc: python3 -m http.server 8000
```

Sau đó mở `http://<ip-máy-tính>:8000` trên điện thoại.

**Cách chơi:** chạm vào ô `+` để đặt tướng. Chạm vào tướng để xem kỹ năng, mặc hoặc tháo đồ, hay bán tướng. Nhấn **▶ Đợt** để gọi đợt quái tiếp theo.

## Cấu trúc code

| File | Nội dung |
|---|---|
| `js/data.js` | **Toàn bộ dữ liệu**: bản đồ, tướng + kỹ năng, trang bị, bộ đồ, quái, đợt quái. Muốn cân bằng hoặc thêm nội dung thì sửa file này. |
| `js/render.js` | Vẽ bằng code: `computeLook()` gộp ngoại hình gốc + đồ + bậc tiến hóa + bộ đồ, rồi `drawHero()` vẽ theo kết quả đó. |
| `js/game.js` | Logic: quái đi theo đường, tướng chọn mục tiêu và tấn công, kỹ năng chủ động (`SKILL_CASTS`), tính chỉ số `heroStats()`, rơi đồ. |
| `js/ui.js` | HUD, bảng chọn tướng, bảng chi tiết tướng (có khung xem trước ngoại hình), túi đồ. |
| `js/main.js` | Co giãn canvas theo màn hình, xử lý chạm, vòng lặp vẽ. |

### Thêm một kỹ năng mới
Trong `HEROES.<tướng>.skills`, thêm một mục:
```js
{ id: 'x', name: 'Tên', unlock: 50,                     // số mạng cần để mở
  info: (n) => `mô tả, n = số mạng kể từ khi mở`,
  apply: (s, n) => { s.damage += n * 0.3; } }           // kỹ năng nội tại, lớn theo n
// hoặc kỹ năng chủ động: active: { cooldown: 10, cast: 'tenHam' } và thêm hàm vào SKILL_CASTS
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
