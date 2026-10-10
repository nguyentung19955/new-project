# Báo cáo: đồ đứng yên trên người, áo nét gấp đôi

Ngày 10/10/2026. Hai lần đẩy lên nhánh `khoi-tao-du-an`, cả hai đã đăng lên https://spiritblade.web.app.

## Việc A: đồ đứng yên trên người khi chém và khi lăn

**Lỗi cũ:** khi chém, khung xương em bé "treo" theo vũ khí: cả người nhảy lên, vươn ra. Vì vậy nón lá, đồ lưng, áo bay theo.
Với em bé thân AI còn tệ hơn: thân AI đứng yên nhưng đồ vẫn bay theo khung xương. Kết quả là nón lá và ống tên lơ lửng trên đầu, tách khỏi người.
Lúc lăn cũng vậy: đồ lăn theo khung xương code chứ không theo thân AI, nên trông như rụng ra.

**Đã sửa:**

1. **Em bé vẽ bằng code**
   - Khi chém (kiếm, giáo, búa/rìu) và khi giữ nút để lấy đà: thân và đồ **đứng yên tại chỗ**.
     Cả khối chỉ nhún nhẹ: nhấc lên 1 điểm ảnh lúc lấy đà, nhích tới 1 điểm ảnh lúc chém xuống.
   - **Vũ khí sống tự bay và vung** theo đúng đường cũ. Bé giơ tay ra lệnh: chuôi ở gần thì bé nắm, ở xa thì tay chỉ về phía vũ khí.
   - Cung vốn đã đứng yên nên giữ như cũ.
   - Khi lăn: thân và đồ vẫn lăn chung một khối như trước. Đã giảm độ bay của vạt áo và tua (từ 3 xuống 1) để không có mảnh nào văng rời ra.
2. **Em bé thân AI**
   - Đồ không theo khung xương code nữa. Đồ được dựng ở tư thế đứng yên, rồi **bám theo chính thân AI**.
   - Game tự đo hình thân AI ở từng khung: so với khung đứng thở đầu tiên thì đầu và thân dời bao nhiêu điểm ảnh, rồi dời mũ và áo theo đúng chừng đó.
   - **Lúc lăn và lúc ngã:** game đo thêm thân AI xoay bao nhiêu độ. Đồ được ghép lên thân rồi xoay và dời **cả khối** theo đúng thân AI.
     Lúc lăn, game ưu tiên kiểu lăn tới đều (mỗi khung xoay thêm một phần bằng nhau của vòng tròn).
   - Điểm neo đầu, thân, tay ghi trong tệp em bé vẫn dùng như cũ, cộng thêm phần game tự đo. Trang Tách Anh Hùng (phần thử khoác đồ) hiện đúng như trong game.
3. **Không đổi:** thời điểm gây sát thương, tầm đánh, thời gian lăn, vệt chém theo mũi vũ khí. Phần hình chỉ để nhìn, không ảnh hưởng luật chơi.

**Ảnh so trước/sau (chụp bằng trình duyệt, em bé Thợ Săn đội nón lá, đeo ống tên, mặc áo vải, có bùa):**
- *Trước, em bé code:* lúc chém kiếm, cả người bay lên theo kiếm, chúi đầu, nghiêng ngả. Lúc chém búa, có khung em bé bị hất nằm ngang. Lúc đâm giáo, thân trượt ra trước rồi nằm rạp.
- *Sau, em bé code:* đứng thẳng ở mọi khung, nón và ống tên nằm yên trên người. Kiếm, búa, giáo vẫn vung đủ vòng như cũ.
- *Trước, thân AI (tệp thử tự dựng):* nón lá và ống tên bay lên trên đầu, tách hẳn khỏi thân tím. Lúc lăn, nón nằm một chỗ, thân một chỗ.
- *Sau, thân AI:* nón luôn trên đầu, áo trên thân ở mọi khung chém. Lúc lăn, nón xoay vòng theo thân. Lúc ngã, nón nằm ngang cạnh đầu, đúng như thân nằm.
- Không có lỗi trên bảng điều khiển trình duyệt (console).

## Việc B: áo và đồ khoác nét gấp đôi

**Lỗi cũ:** em bé được ghép từng điểm ảnh trong khung cỡ game. Vì vậy ảnh trang phục AI có `"net": 2` bị thu về cỡ thường, áo bị nhòe so với ảnh gốc.

**Đã sửa:**
- Khi màn chơi ở **độ nét Cao** và em bé đang mặc ít nhất một món **ảnh AI có "net" từ 2 trở lên**, em bé được ghép ở độ nét gấp đôi:
  - Phần vẽ bằng code (thân, mặt, đồ code) vẫn **y hệt**: mỗi điểm ảnh cũ thành khối 2×2 cùng màu.
  - Ảnh trang phục AI hiện **đủ chi tiết gốc**, đặt đúng chỗ như cũ. Áp dụng cho cả 6 ô: mũ, áo, đồ lưng, đồ tay (bùa đeo hoặc đồ cầm), mặt nạ, cánh. Vẫn theo đúng `lech`, neo, lớp trước/sau, tay áo, cánh gốc dưới-phải.
  - Dùng được cho cả em bé thân code và lớp đồ khoác lên em bé thân AI.
- **Giữ nguyên các hiệu ứng:**
  - Viền đen, đổ bóng, che lớp: vẫn tính theo điểm ảnh game, nên hình dáng món đồ giống hệt bản thường.
  - Ánh viền bậc (Tím, Vàng): vẫn **dày 1 điểm ảnh game** (2 điểm ảnh thật). Lý do: để viền không mảnh đi và trông giống bản thường.
  - Vành sáng mép phải: áp cho từng điểm con của ảnh.
  - Chớp trắng và nhuộm màu khi trúng đòn, dính băng, dính độc: tô cho từng điểm con, nên chi tiết vẫn nhìn thấy dưới lớp nhuộm.
  - Bóng, lật trái phải, lăn (đồ xoay theo thân, chi tiết xoay theo), chết: giữ như cũ.
- **Độ nét Thường, hoặc không có ảnh "net"** → ghép như trước, y hệt. Đã chụp so từng điểm ảnh: khác 0 điểm.
- Canvas: chỉ tạo một lần cho mỗi khung hình rồi nhớ lại, như trước. Không tạo canvas mới mỗi lần vẽ.
- **Túi đồ** (`hanh_trang.js`, qua `outfit.js`): hình món đồ có ảnh "net" cũng nét gấp đôi.

**Ảnh so trước/sau** (áo thử tự dựng: ảnh 26×26 điểm ảnh thật, `"net": 2`, hoa văn ô cờ đỏ/vàng xen từng điểm ảnh):
- *Trước:* áo hiện một màu vàng kem phẳng, vì mỗi ô 2×2 chỉ lấy một điểm. Hoa văn ô cờ mất hết.
- *Sau:* áo hiện rõ ô cờ đỏ/vàng nhỏ li ti, mỗi ô bằng nửa điểm ảnh game. Có ở mọi động tác: đứng, chém, lăn (ô cờ xoay theo), trúng đòn (ô cờ nhuộm trắng mờ).
- Nón lá, mặt, tay, ống tên, vũ khí: giống hệt từng điểm ảnh. Chỗ khác chỉ nằm trong vùng áo.
- Kiểm thêm:
  - Áo ảnh `"net": 1` (thu từ cùng ảnh) cho kết quả giống hệt bản trước khi sửa.
  - Độ nét Thường: trước và sau khác 0 điểm ảnh.
  - Không có tệp ảnh AI nào: trước và sau khác 0 điểm ảnh.

## Chỗ nào còn 1×

- Thân em bé vẽ code, quái vẽ code, nền phòng: vẫn vẽ 1× rồi phóng 2×. Đây là chủ ý, để trông y như cũ.
- Món đồ ảnh AI chỉ có `"net": 1` (hoặc không ghi "net"): vẫn 1× như ảnh gốc.
- Xưởng Sprite: hình món đồ "bản gốc code" trong ô so sánh vẫn 1×, vì công cụ tự gọi bản ghép thường. Không ảnh hưởng game.
- Thân AI tự nó đã vẽ đủ nét từ trước (không đi qua khung ghép). Vũ khí cũng vậy.

## Tệp đã sửa

- `game/js/hero_tinhlinh.js`: tư thế chém đứng yên, lớp đồ cho thân AI, khung ghép nét cao.
- `game/js/sprite_custom.js`: đo thân AI từng khung, đặt ảnh trang phục nét cao.
- `game/js/outfit.js`: hình ô đồ có ảnh net.
- Bản đóng gói `game/dist/*` và `tools/xuong-sprite/index.html` (do `build.py` tạo).
- Không sửa `tools/tach-*`. Đã mở thử Xưởng Sprite, Tách Anh Hùng, Tách Đồ: không lỗi.
- Đăng nhập Google, lưu mây: không đụng tới. Bài kiểm tra lưu mây vẫn đạt.
- Tệp mẫu dùng để thử chỉ tạo tạm trong trình duyệt, không có tệp nào nằm trong repo.
