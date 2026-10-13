# Báo cáo: hiệu ứng vũ khí hệ Độc / Lửa / Băng ở Thành hình – Thức tỉnh bớt chồng chéo, hết đốm tím trong vũng/mây độc

- Commit: `62b445b4` (nhánh `khoi-tao-du-an`)
- Cờ tắt: thêm `?gonhu=0` vào cuối địa chỉ (hoặc đặt `G.GO_NHU = false`) thì mọi hình về như cũ. Mặc định là bật.
- Chỉ đổi phần HÌNH. Sát thương, thời gian, bán kính vùng gây hại, số vũng tối đa trong luật (`G.HE.maxZones = 6`) giữ nguyên. Không sửa `js/moves.js`, `js/combat.js`.
- Không sửa `game/js/zed_moi.js`. Không đụng đăng nhập Google, lưu mây, `?cloud=0`, `firebase-config.js`.
- Không chạy game, không Playwright: chỉ `node --check` 4 tệp js đã sửa (đều qua) và soát ảnh tĩnh bằng Python. Đã dựng lại `game/dist` bằng `python3 game/build.py`.

## Vì sao thấy "tím tím" trong bãi độc
Trong ảnh chủ dự án gửi (thương Độc, Thành hình), mỗi vũng độc có 4–5 lớp vẽ chồng lên nhau:
1. Ảnh AI vũng độc `hu-vung-doc` (đúng).
2. **Lớp vẽ bằng code `organic()` trong `js/fx_ky_nang.js`** vẫn vẽ ĐÈ lên ảnh AI: mảng tối, vạch tím `rgba(154,95,214,0.55)` và chấm tím `#9a5fd6` quanh mép. Đây là thủ phạm chính của mảng tím-xám.
3. Ảnh AI mây độc `hu-may-doc` đậm 60% che lên cả Zed.
4. Sương code bốc lên mỗi khung, 1/4 số hạt là màu tím (`HAZE_P`).
5. Lúc đòn kết: vòng tím, giọt tím, cụm hơi code.
Ngoài ra chính hai ảnh AI còn sót viền tím/hồng ở mép khi tách nền.

## 1. Danh sách lớp hiệu ứng (Độc ở Thành hình/Thức tỉnh, và Lửa, Băng)
| Lớp | Tệp / dòng (sau sửa) | Ảnh AI hay code | Sau khi sửa (cờ bật) |
|---|---|---|---|
| Vũng độc trên sàn | `fx_he.js` drawHeZone ~435 | ảnh `hu-vung-doc` (không có thì code + bong bóng tím) | giữ ảnh; ẩn nếu bị vũng mới che >50% hoặc vượt 3 vũng |
| Mảng/vạch/chấm tím trên vũng độc | `fx_ky_nang.js` organic ~182, gọi ~222 | code, vẽ đè ảnh | **bỏ** khi đã có ảnh (cả vũng độc của quái có `hu-vung-quai-doc`) |
| Mây độc trên vũng | `fx_he.js` drawCloud ~545 | ảnh `hu-may-doc` 60% (không có thì sương code `hazeSprite` + đốm tím) | ảnh mờ 42%, em bé đứng trong mây thì 26%; ẩn theo vũng |
| Sương bốc lên trên mây | `fx_he.js` heStep ~612 | code, 25% hạt tím | có ảnh mây thì thưa hẳn (0,4 → 0,12), không còn hạt tím |
| Hạt sương nền của vũng | `fx.js` stepZones ~1580 | code | vũng đang ẩn hình thì không nhả hạt |
| Vệt nhỏ giọt dọc đường đâm/chém | `fx_he.js` drawDrips ~119, poisonSwing ~139 | code đè lên ảnh vệt chém | giữ, nhưng chỉ xanh lục (bỏ viền/giọt tím) |
| Đòn kết Độc: vòng toé, giọt, cụm hơi | `fx_he.js` FINISH.poison ~302 | code | bỏ vòng tím trong, giọt chỉ xanh, bỏ cụm hơi khi có ảnh mây |
| Lây độc (Thức tỉnh) | `fx_he.js` heSpread ~352 | code | vòng và giọt chỉ xanh |
| Tên độc, mảnh tên độc | `fx_he.js` ARROW.poison ~374, heStep | code | hạt/vòng chỉ xanh |
| Hào quang độc trên thân quái đang trúng độc | `fx_ky_nang.js` aura ~104 | code (dải tím-lục) | **giữ** – đây là dấu trạng thái trên quái, không nằm trong vũng |
| Mây độc của chưởng Độc | `fx_chuong.js` drawMay ~131 | ảnh `hu-vung-doc` + `hu-may-doc` | vòng nhịp/hạt xoáy/hạt bốc chỉ xanh, ảnh mây 42% |
| **Lửa** đòn kết: vụ nổ + vết cháy + vũng lửa | `fx_he.js` FINISH.fire ~285; `fx.js` blastFire ~1249 | ảnh `hu-no-lua`, `hu-vung-lua` + vết cháy code | bỏ vết cháy code nằm trùng chỗ ảnh vũng lửa |
| **Lửa** nổ lan (Thức tỉnh) | `fx_he.js` heBoom ~341; `fx_ky_nang.js` wrap heBoom ~273 | ảnh `hu-no-lua` + vòng vàng + vết cháy thứ hai + vòng phép | bỏ vòng vàng, vết cháy thứ hai, vòng phép; tia lửa còn một nửa |
| **Lửa** vệt cháy trùng nhau | `fx_he.js` gopVung ~46 | ảnh `hu-vung-lua` | gộp/giới hạn như vũng độc |
| **Băng** gai băng (Thành hình) | `fx_he.js` drawSpikes | code (chưa có ảnh AI riêng) | giữ |
| **Băng** băng vỡ (Thức tỉnh) | `fx_he.js` heShatter ~328 | code: chớp + 2 vòng + 12 tia + 10 mảnh | dùng ảnh `hu-bang-vo` thay chớp + vòng nhỏ, tia/mảnh còn một nửa; vòng lớn (đúng bán kính văng thật) giữ |

## 2. Làm sạch ảnh AI
`game/art/custom/hu-vung-doc.sprite.json` và `hu-may-doc.sprite.json`: điểm tím/hồng nằm ở mép (chạm nền trong suốt) → trong suốt; điểm tím lọt vào trong thân → đổi sang lục sẫm cùng độ sáng (để không đục lỗ). Vũng độc: 2376 điểm mép bỏ, 201 điểm đổi màu; mây độc: 2129 điểm mép bỏ, 204 điểm đổi màu. Soát lại: còn 0 điểm tím/hồng.

## 3. Gộp vũng trùng, giới hạn số vũng, mây mờ hơn
- Mỗi khung (`gopVung` trong `js/fx_he.js`), xét vũng hệ của em bé từ mới đến cũ, riêng Lửa và Độc: vũng nào bị một vũng MỚI hơn đang hiện che từ 50% diện tích (so với vũng nhỏ hơn) trở lên thì ẩn hình; quá 3 vũng mỗi hệ thì các vũng cũ hơn ẩn hình. Vũng mới thay chỗ vũng cũ thì hiện đủ cỡ ngay (không nở lại) nên nhìn như vũng cũ được làm mới.
- Vũng ẩn hình VẪN gây sát thương đúng luật (chỉ là cờ vẽ `z.fxAn`, luật không đọc). Không đổi sát thương, thời gian, bán kính.
- Mây độc: 0,6 → 0,42; em bé đứng trong vùng mây → 0,26 để thấy rõ Zed.

## 4. Còn để ý
- Chưa xem trên máy thật (theo luật không chạy game). Nên mở Rừng già với thương/kiếm hệ Độc ở Thành hình/Thức tỉnh, đánh liên tiếp một chỗ để xem vũng gộp; so bằng `?gonhu=0`.
- Hào quang độc trên thân quái vẫn có dải tím (dấu trạng thái); nếu muốn bỏ tím cả ở đây thì là việc riêng.
- Chưởng (mây độc của chưởng) chỉ đổi màu và độ mờ, chưa gộp/giới hạn số mây.
