# Hướng dẫn dịch game Linh Khí sang tiếng Anh (cho người/phiên làm từ điển)

## 1. Cơ chế (đã có sẵn, đừng sửa `game/js/ngon_ngu.js`)

- `G.LANG` = `'vi'` (mặc định) hoặc `'en'`. Đổi ngay lúc đang chơi (không tải lại trang).
- Từ điển: khoá = **chuỗi tiếng Việt gốc đúng từng ký tự**, giá trị = tiếng Anh.
- Khi `G.LANG === 'en'`, mọi lệnh `fillText / strokeText / measureText` của canvas giao diện (và `ui.wrap`) **tự tra từ điển**
  theo nguyên chuỗi. Nên chuỗi viết thẳng (`ui.text('Túi đồ', …)`, `name: 'Mộc Tinh'`, `T.btn(…, 'Mua')`, mảng các câu thoại…)
  **KHÔNG phải sửa code**, chỉ cần thêm vào từ điển.
  Tra theo thứ tự: nguyên văn → bỏ khoảng trắng hai đầu → không phân biệt hoa/thường (chuỗi IN HOA ra bản dịch IN HOA).
- Chuỗi GHÉP (chữ + số, chữ + tên, template literal, `.join`, toán tử ba ngôi lồng trong phép cộng…) thì chuỗi vẽ ra không khớp khoá nào
  → **phải sửa chỗ ghép** thành `G.t('mẫu có {0} {1}', a, b)`:
  - `'Sức mạnh ' + pw`  →  `G.t('Sức mạnh {0}', pw)`
  - `'Cấp ' + lv + ' · ' + name`  →  `G.t('Cấp {0} · {1}', lv, name)`
  - `'Âm thanh: ' + (on ? 'bật' : 'tắt')`  →  `G.t('Âm thanh: {0}', on ? 'bật' : 'tắt')` (tham số là chuỗi cũng tự được tra từ điển;
    nhớ thêm cả `'bật'`, `'tắt'` vào từ điển)
  - Tiếng Việt: `G.t` chỉ điền `{0}`… vào mẫu → **kết quả phải Y HỆT chuỗi cũ từng ký tự** (dấu cách, dấu chấm, dấu `·`). Soát kỹ.
  - Chỗ trống tối đa `{0}`…`{9}`. Tham số có thể là số hoặc chuỗi. Tham số chuỗi được tự dịch nếu có trong từ điển.
- `G.tc('ngữ cảnh', 'Chữ')`: khi MỘT chữ Việt cần HAI nghĩa Anh khác nhau ở hai nơi. Từ điển ghi khoá `"ngữ cảnh::Chữ"`.
  Chỉ dùng khi thật cần.
- `G.tv(s)`: dịch nếu có trong từ điển, không thì trả nguyên. Dùng trước khi tự cắt chuỗi theo ký tự (`slice`, `substr`), tự tách từ.
- `G.kd(s)`: đánh dấu KHÔNG dịch (tên người chơi, tên tài khoản Google, nội dung người dùng gõ).
- Chữ đưa vào DOM (`textContent`, `innerHTML`, `placeholder`, `title`, `value` của nút…) KHÔNG được tự dịch → bọc `G.t(...)` ngay chỗ gán.

## 2. Luật khi sửa code

1. **Tiếng Việt phải y hệt cũ.** Không đổi lối chơi, chỉ số, bố cục. Chỉ đụng chỗ ghép chuỗi hiển thị.
2. **Không gọi `G.t` lúc nạp tệp** (trong hằng số / bảng dữ liệu tính một lần) vì ngôn ngữ đổi được lúc đang chơi. Gọi ở lúc vẽ / lúc tạo
   thông báo. Bảng dữ liệu có chuỗi ghép tính sẵn lúc nạp → đổi thành hàm/getter hoặc dịch ở nơi dùng. Chuỗi tĩnh trong bảng: để nguyên.
3. **Không dịch khoá / mã / giá trị dùng để so sánh hay lưu** (`key`, `id`, khoá của `W.hurtBy`, chuỗi ghi vào `G.save`, chuỗi gửi lên mây,
   tên tệp sprite, `console.*`). Không bao giờ ghi chuỗi đã dịch vào bản lưu.
4. Chuỗi được `.toUpperCase()` / `.toLowerCase()` rồi vẽ: phần tra không phân biệt hoa thường đã lo (IN HOA → bản dịch IN HOA). Nếu ghép thì dùng `G.t` trước rồi mới đổi hoa/thường.
5. Chuỗi "số + tên tài nguyên" được game đổi thành **biểu tượng** (vd "+5 quặng" → "+5 [hình]"). Bản dịch phải giữ dạng **số rồi tới tên tài nguyên**
   đúng các chữ này (số ít hoặc thêm "s"): `gold`, `ore`, `whetstone`, `XP`, `Spirit Wood`, `Fish Scale`, `Flint`,
   `Moc Tinh shard`, `Ngu Tinh shard`, `Ho Tinh shard`. Ví dụ `"+{0} vàng"` → `"+{0} gold"`, `"{0} đá tôi"` → `"{0} whetstones"`.
6. Chỉ sửa tệp trong nhóm được giao. Không sửa `ngon_ngu.js`, `ngon_ngu_en.js`, `game/dist/*`, `game/index.html`, `build.py`. Không chạy `build.py`, không commit, không push.
   Xong thì `node --check` từng tệp đã sửa.
7. Chú thích (`// …`) giữ nguyên tiếng Việt.

## 3. Tệp từ điển của nhóm

Ghi vào `tools/ngon-ngu/tu-dien/<tên nhóm>.json`: một đối tượng JSON `{ "chuỗi Việt": "English", … }` (UTF-8, mỗi cặp một dòng).
- Có **mọi chuỗi hiển thị** trong các tệp của nhóm (kể cả mẫu `{0}` mới viết, kể cả chuỗi con làm tham số như `'bật'`, `'tắt'`).
- Chuỗi cố ý không dịch (console, khoá logic, tên riêng…): ghi vào `tools/ngon-ngu/tu-dien/<tên nhóm>.boqua.json` (mảng chuỗi).
- Kiểm: `python3 tools/ngon-ngu/kiem.py <tên nhóm> tệp1.js tệp2.js …` → in các chuỗi có dấu tiếng Việt trong tệp mà chưa có trong
  từ điển nhóm lẫn boqua. Kết quả phải rỗng.

## 4. Phong cách tiếng Anh

- Tự nhiên, kiểu game roguelite: ngắn, gọn, mạnh. "Dodge", "Combo", "Armor broken!", "Room cleared!".
- **Độ dài: cố gắng không dài hơn bản Việt** (tiếng Việt rất gọn; nút/thẻ/nhãn hẹp). Nhãn nút ≤ ~14 ký tự nếu được. Dùng "Lv", "HP", "XP", "DMG", "%".
- Không dùng dấu tiếng Việt trong bản Anh, TRỪ tên riêng giữ nguyên: **Cu Tí, Cu Tèo, Cái Bống, Cu Lì, Linh Khí** (tên game).
- Tên dân gian: phiên âm không dấu; thêm nghĩa khi là lời giới thiệu/mô tả dài. Tên quái là danh từ chung thì dịch nghĩa.
- Người làng nói giọng ấm, dân dã, ngắn. "con / cháu / bé" → "kiddo", "little one", "child" (tuỳ người nói). Người làng xưng "bà/ông/lão/cô/chú/anh" → "I" / "old me".
- Câu mô tả chỉ số: gọn kiểu tooltip: "+8% damage", "Dodge recharges 25% faster".

## 5. Bảng thuật ngữ (BẮT BUỘC dùng thống nhất)

| Việt | Anh |
|---|---|
| Linh Khí (tên game) | Linh Khí |
| linh khí (hệ thống dấu ấn của vũ khí) | Spirit ("Linh khí của vũ khí" = "Weapon Spirit") |
| dấu ấn | mark(s) |
| hệ | element |
| Lửa / Độc / Băng | Fire / Poison / Ice |
| Cháy / Trúng độc / Đóng băng / lạnh, chậm | Burning / Poisoned / Frozen / Chilled, slowed |
| tầng (Độc, Băng) | stack(s) |
| Nổ khói / Sốc nhiệt | Smoke Blast / Thermal Shock |
| bậc (vũ khí) | tier |
| Thường / Lam / Tím / Vàng (bậc) | Common / Blue / Purple / Gold |
| Trắng / Mầm / Thành hình / Thức tỉnh (giai đoạn) | Plain / Sprout / Formed / Awakened |
| đặc trưng (của hệ) | trait |
| dòng phụ / dòng mạnh (vũ khí) | affix / power affix |
| Kiếm / Cung / Giáo / Búa | Sword / Bow / Spear / Hammer |
| Mài / Nâng bậc / Rèn | Sharpen / Upgrade tier / Forge |
| Lò rèn | Forge |
| vàng / quặng / đá tôi / kinh nghiệm | gold / ore / whetstone / XP |
| Gỗ linh / Vảy cá / Đá lửa (nguyên liệu) | Spirit Wood / Fish Scale / Flint |
| nguyên liệu | materials |
| mảnh (trùm) "mảnh Mộc Tinh" | shard ("Moc Tinh shard") |
| Sức mạnh | Power |
| Máu / Mana / Tốc độ | HP / Mana / Speed |
| sát thương | damage (DMG khi chật) |
| chí mạng | crit |
| Cấp | Lv (nhãn) / level (câu) |
| Lăn né | Dodge |
| Đòn thường / Đặc biệt / đòn giữ rồi thả / Nhát kết | Attack / Special / charged attack / finisher |
| kết liễu | finish off / kill |
| Chưởng | Palm (Hỏa chưởng = Fire Palm, Độc chưởng = Poison Palm, Băng chưởng = Ice Palm) |
| Cây chưởng / điểm chưởng | Palm tree / Palm point(s) |
| Kỹ năng / điểm kỹ năng | Skills / skill point(s) |
| Công / Thủ / Hệ (ba nhánh kỹ năng) | Attack / Defense / Element |
| Bình máu | Potion |
| Bùa | Charm |
| Mũ / Áo / đồ lưng / đồ tay / mặt nạ / cánh | Hat / Robe / Back / Hand / Mask / Wings |
| Trang phục / Bộ (trang phục) | Outfit / Set |
| Hành trang / Túi đồ | Inventory / Bag |
| Rương | Chest |
| ải | stage ("Ải 4" = "Stage 4") |
| vùng | region |
| phòng | room |
| quái / yêu tinh | monster(s) |
| trùm / trùm nhỏ / tinh anh | boss / mini-boss / elite |
| bầy | pack |
| Rừng già / Hang biển / Lâu đài cổ | Old Forest / Sea Cave / Ancient Castle |
| Núi tuyết / Núi lửa / Đầm lầy | Snow Mountain / Volcano / Swamp |
| Mộc Tinh / Ngư Tinh / Hồ Tinh | Moc Tinh / Ngu Tinh / Ho Tinh (mô tả dài: "Moc Tinh, the Tree Spirit", "Ngu Tinh, the Fish Demon", "Ho Tinh, the Fox Spirit") |
| Nấm Chúa / Cua Đá / Hổ Lửa | Mushroom King / Rock Crab / Fire Tiger |
| làng | village |
| Cu Tí / Cu Tèo / Cái Bống / Cu Lì | giữ nguyên (nghề: Smith / Hunter / Healer / Wrestler) |
| em bé / bé (nhân vật) | kid / hero ("chọn hero" = "choose hero") |
| Ông Thợ Rèn | Blacksmith |
| Cô Thợ May | Tailor |
| Bà Hàng Xén | Peddler |
| Chú Lái Đò | Ferryman |
| Cụ Đồ | Scholar |
| Ông Từ | Shrine Keeper |
| Anh Mõ | Town Crier |
| Sân đình | Village Yard |
| Cổng làng | Village Gate |
| Lên đò | Set sail |
| Về làng | To village |
| Bảng vàng | Leaderboard |
| kỷ lục | record |
| Lưu mây / mây | cloud save / cloud |
| tiến trình | progress |
| bản lưu | save |
| Đăng nhập Google | Sign in with Google |
| Khách | Guest |
| Góp ý | Feedback |
| Cài đặt | Settings |
| Âm thanh: bật / tắt | Sound: on / off |
| Độ nét: Cao / Thường | Sharpness: High / Normal |
| Toàn màn hình | Fullscreen |
| Tạm dừng / Tiếp tục | Paused / Resume |
| Thắng / Thua | Victory / Defeat |
| Xong / Đóng / Thôi / Mua / Bán / Mặc / Tháo / Học / Xem / Đổi | Done / Close / Cancel / Buy / Sell / Wear / Remove / Learn / View / Swap |
| sắp có | coming soon |
| mới | new |
| chưa mở | locked |
| sao | star(s) |
| mẹo | tip |
