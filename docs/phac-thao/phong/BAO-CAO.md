# Báo cáo: phác thảo ba kiểu phòng

Nhánh `claude/phac-thao-phong`. Chỉ thêm file trong `docs/phac-thao/phong/`, không sửa gì trong `game/`.

## Danh sách ảnh

| Ảnh | Nội dung |
| --- | --- |
| `so-sanh-kieu-phong.png` | Ba kiểu xếp dọc, có nhãn và gạch đầu dòng được gì, mất gì. **Nên đưa chủ dự án xem ảnh này trước.** |
| `kieu-A.png` | Kiểu A: phòng vuông nhìn từ trên xuống, vừa một màn hình, giao diện dồn ra hai lề. |
| `kieu-B.png` | Kiểu B: phòng nhìn ngang như hiện tại, thêm cửa lên ở tường sau và lối xuống ở mép trước. |
| `kieu-C.png` | Kiểu C: phòng rộng khoảng hai màn hình mỗi chiều, màn hình chạy theo hero. |
| `kieu-A-ba-chu-de.png` | Kiểu A ở ba chủ đề: lâu đài, hang động, rừng. |
| `trang-thai-cua.png` | Kiểu A, cùng một góc phòng: cửa khóa, cửa mở, bước qua cửa. |

Dựng lại: `python3 docs/phac-thao/phong/nguon/dung.py` (hoặc thêm tên ảnh, ví dụ `kieu-A`). Kịch bản nằm trong `nguon/`: `phong.js` (phòng lâu đài, cửa), `chu-de.js` (hang, rừng), `canh.js` (cảnh đánh, giao diện, bản đồ nhỏ), `ghep.js` (ảnh ghép).

## Cách dựng, để biết ảnh đáng tin tới đâu

- Hero, quái, đồ vật, vùng đỏ, vũng hệ, vệt chém, số sát thương đều là hình thật: kịch bản chạy bộ máy đánh nhau thật của game trong vài khung hình rồi gọi `G.drawWorld`, chỉ thay nền. Ở Kiểu A và C, hero thật sự đứng và đánh trong một hình chữ nhật có biên là sàn phòng mới, không phải dán hình lên.
- Kiểu B dùng nguyên nền phòng lâu đài và giao diện thật của game. Phần tôi vẽ thêm chỉ có cửa lên, lối xuống và ổ khóa.
- Kiến trúc phòng của Kiểu A và C (tường, sàn, cửa, ba chủ đề) là tôi tự vẽ bằng mã.

## Chỗ làm khác với đề bài

- **Kiểu C không phải 480x270 phóng 3 lần.** Để nhân vật to gấp rưỡi mà điểm ảnh vẫn đều, tôi vẽ khung nhìn 320x180 rồi phóng 4,5 lần. Ảnh ra vẫn 1440x810. Giao diện vẫn vẽ theo lưới 480x270.
- Kiểu C chỉ thấy một cửa (cửa trên). Phòng rộng hai màn hình thì không thể thấy cùng lúc cửa trên và tường bên.
- Phông chữ của game (Be Vietnam Pro) tải từ mạng, máy dựng ảnh không tải được nên chữ trong giao diện dùng phông hệ thống. Trên điện thoại thật chữ sẽ đẹp hơn.
- Công cụ `add_repo` không có trong phiên này. Kho đã gắn sẵn và đẩy được nên không ảnh hưởng.

## Nhận xét từng kiểu

**Kiểu A (phòng vuông nhìn từ trên)**
- Công sửa mã: vừa phải. Di chuyển tám hướng trong hình chữ nhật có sẵn, chỉ đổi biên phòng thành hình gần vuông (ảnh mẫu đã chạy được như vậy mà không sửa mã game). Hình nhân vật giữ nguyên.
- Việc phải làm mới: vẽ lại nền phòng cho ba chủ đề (hiện `env_art.js` chỉ vẽ phòng nhìn ngang), bốn cửa thay cho "đi qua mép phải", sơ đồ ải dạng lưới thay cho dãy phòng thẳng, bản đồ nhỏ, và xếp lại giao diện ra hai lề.
- Rủi ro cần thử: vùng nguy hiểm và vũng hệ hiện vẽ dẹt (cao bằng 0,6 chiều rộng) cho hợp góc nhìn ngang, đặt lên sàn vuông hơi lệch, nên vẽ tròn hơn. Quái bắn xa và trùm đang được chỉnh cho phòng dài 460, sang phòng rộng 190 phải cân lại. Ba trận trùm hiện dựa vào phòng dài, nên giữ phòng trùm kiểu cũ hoặc làm lại riêng.
- Trên điện thoại: dễ nhìn nhất. Thấy cả phòng và bốn cửa, ngón tay và nút bấm nằm ở lề nên không che trận đánh. Nhân vật to bằng hiện tại.
- Điểm yếu: sàn chỉ khoảng 208x196, bằng chừng 40% diện tích sàn hiện tại. Sáu con quái là đã đông.

**Kiểu B (giữ phòng nhìn ngang, thêm cửa)**
- Công sửa mã: ít nhất. Giữ nguyên nền, giao diện, cân bằng. Chỉ thêm cửa, sơ đồ ải và bản đồ nhỏ.
- Nhưng không đúng ý "ô hình vuông": sàn 460x86, đi ngang thì dài, đi lên xuống chỉ vài bước. "Lên" và "xuống" chỉ là hai cái cửa, không phải hướng đi thật.
- Trên điện thoại: lối xuống nằm sát mép dưới, giữa cần di chuyển và cụm nút, nhỏ và khó thấy. Bản đồ nhỏ không có lề để đặt nên đè lên tường.

**Kiểu C (phòng rộng, màn hình chạy theo)**
- Công sửa mã: nhiều nhất. Camera hiện chỉ chạy ngang, phải thêm chạy dọc và phóng to. Mọi hiệu ứng, chữ sát thương, giao diện đang giả định màn hình 480x270 không phóng. Quái ngoài màn hình cần mũi tên báo, cửa ngoài màn hình cần chỉ dẫn.
- Trên điện thoại: nhân vật to và đẹp nhất, nhưng nút bấm và bản đồ đè lên trận đánh, và bị bắn từ ngoài màn hình là kiểu khó chịu nhất trên máy nhỏ.
- Bảy tám phòng rộng gấp bốn màn hình thì một ải dài hơn nhiều, phải cân lại số quái.

## Khuyên chọn

**Kiểu A.** Đây là kiểu duy nhất đúng với câu chủ dự án nói ("đi 4 hướng trong 1 ô hình vuông, đi dần sẽ mở bản đồ"), tận dụng được gần hết mã đang có, và dễ nhìn nhất trên điện thoại. Kiểu B rẻ hơn nhưng không cho cảm giác phòng vuông. Kiểu C đẹp nhưng tốn công nhất và khó chơi nhất trên màn hình nhỏ.

Nếu chọn A, hai việc nên hỏi chủ dự án tiếp: phòng trùm giữ kiểu ngang hay cũng thành phòng vuông (to hơn), và có chấp nhận hai lề tối hay muốn phòng rộng ra thành hình chữ nhật nằm ngang lấp gần đầy màn hình (mất cảm giác vuông nhưng sàn rộng hơn).
