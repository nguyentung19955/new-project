# Báo cáo phiên E2 — Trùm vùng đổi hình theo pha

11/10/2026 · nhánh `khoi-tao-du-an` · commit game `f9d579e` · commit trang công cụ `b1e00ae` · workflow xanh cả hai lần đẩy

## Tóm tắt một đoạn

Game đã sẵn sàng nhận ảnh pha 2, pha 3 của Mộc Tinh, Ngư Tinh, Hồ Tinh: có tệp `<trùm>-p2` hoặc `<trùm>-p3` thì trùm ở pha đó dùng tấm ấy cho 4 hàng đứng, lấy đà, tấn công, trúng đòn; hàng chạy và chết mượn tấm pha 1. Chưa có tệp thì game vẽ y như trước (đã so ảnh: 0 điểm ảnh khác). Trang Tách Quái có thêm 6 mục ở cuối danh sách, kèm nút tải ảnh tham chiếu pha 1 và prompt tiếng Việt. Chưa thêm ảnh nào vào game.

**Hai điều anh cần biết trước khi vẽ (chi tiết ở mục 7):**

1. **Tấm "Hồ Tinh" pha 1 đang có trong game là hình con hổ lửa có vằn, không phải cáo chín đuôi.** Ảnh pha 2, pha 3 sẽ vẽ theo tấm pha 1, nên nếu anh muốn Hồ Tinh là cáo thì cần vẽ lại pha 1 trước.
2. **Khi trùm đang đi hoặc lúc chết, hình sẽ trở về dáng pha 1**, vì lưới rút gọn không có hàng chạy và hàng chết. Trùm đi lại khá nhiều giữa các chiêu nên chỗ này sẽ lộ, nhất là pha 3 (hoá băng, hoá độc đổi màu cả thân).

## 1. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/sprite_custom.js` | Nhận tệp mã `nguTinh-p2`, `nguTinh-p3`, `mocTinh-p2`, `mocTinh-p3`, `hoTinh-p2`, `hoTinh-p3` là dáng pha (không thêm vào danh sách quái). Thêm `SC.phaTrum`. `SC.veQuai` chọn tấm theo pha và nhận thêm `o.baoDon` (chớp trắng). |
| `game/js/boss.js` | Trong `A.boss`: khi trùm dùng ảnh AI, truyền chớp trắng 0,25 giây cuối trước khi ra đòn, và chớp trắng che lúc đổi dáng giữa cảnh chuyển pha (chỉ khi có tệp pha). |
| `tools/tach-quai/index.html` | 6 mục mới ở cuối, lưới 8 cột × 4 hàng, prompt dáng pha, nút "Tải ảnh tham chiếu pha 1". |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Do `python3 game/build.py` sinh lại. |
| `docs/review/quai-e2/` | Báo cáo này, `PROMPT.md`, bài kiểm `kiem.py`, số đo `ket-qua.json`, ảnh `anh-kiem.png`. |

`game/build.py`: **không sửa**. Phần quái trong `build.py` không có danh sách mã cho phép, mã mới đã được nhận sẵn (đã thử gói với 6 tệp mẫu). Không đụng `stage.js`, `btn_art.js`, `ui_theme.js`, `fx.js`, `room_art.js`, `tach-phong`, `monster_art.js`, `mobs.js`.

## 2. Đã làm gì và vì sao

**Game**

- Trùm ở pha 2 có tệp `-p2`, ở pha 3 có tệp `-p3`: 4 hàng đứng, lấy đà, tấn công, trúng đòn lấy từ tệp pha. Lúc choáng (dùng hàng trúng đòn) cũng theo tệp pha.
- Chỉ có tệp `-p2` mà trùm đã sang pha 3: vẽ tấm pha 1, không lấy nhầm tấm pha 2.
- Cảnh chuyển pha: nửa đầu còn dáng cũ, nửa sau sang dáng mới, giống hình vẽ bằng code. Có chớp trắng che đúng lúc đổi tấm.
- Chớp trắng báo sắp ra đòn: trùm dùng ảnh AI trước đây không còn nhấp nháy trước khi đánh. Nay 0,25 giây cuối trước khi đòn ra, thân nhấp nháy trắng (mức 35%, cùng mốc thời gian với dấu "!" của quái thường). Chỉ là hình: thời gian ra đòn, sát thương, vùng báo trước không đổi.
- Hồ Tinh pha 3 không co 72% khi có ảnh AI: giữ nguyên như Đợt 1 (đã kiểm cỡ pha 3 bằng pha 1).
- Phần Đợt 7 (nhuộm thân, bộ nhớ khung): không đụng, vẫn chạy như cũ.
- Để sẵn: nếu sau này tệp pha có thêm hàng chạy hoặc chết thì game dùng luôn, không phải sửa code (xem mục 7, điều 2).

**Trang Tách Quái**

- 6 mục ở cuối danh sách: Mộc Tinh pha 2 (nổi giận), pha 3 (hoá độc); Ngư Tinh pha 2 (nổi giận), pha 3 (hoá băng); Hồ Tinh pha 2 (mắt tím, phân thân), pha 3 (hoá cuồng).
- Số khung đọc từ tệp pha 1 của từng trùm: cả ba đều 6 · 4 · 6 · 4. Cỡ ô bằng tấm pha 1 (Mộc Tinh 168×140, Ngư Tinh 180×116, Hồ Tinh 208×128). Khi bấm nút tải ảnh tham chiếu, trang đọc lại các số này từ bản game đang chạy.
- Nút "Tải ảnh tham chiếu pha 1": dựng tấm pha 1 thành đúng bố cục 8 cột × 4 hàng, nền một màu, có kẻ lưới, phóng gấp đôi cho dễ nhìn.
- Prompt: dặn gửi kèm ảnh pha 1, giữ nguyên con vật và tư thế, chỉ đổi màu, chi tiết và khí. Phần tả thay đổi lấy từ hình vẽ bằng code (`monster_art.js`). Có đoạn bảng màu theo hệ của trùm: Mộc Tinh hệ Độc, Ngư Tinh hệ Băng, Hồ Tinh hệ Lửa.
- 36 mục cũ không đổi: prompt giống hệt, kết quả tách một tấm 8×6 giống hệt trang trước.

## 3. Kiểm thử

Một lượt: `GOC=5633e60 python3 docs/review/quai-e2/kiem.py`. Số đầy đủ ở `ket-qua.json`.

| Tiêu chí | Kết quả |
|---|---|
| `node --check game/js/*.js` | Đạt |
| `python3 game/build.py` | Đạt |
| `game/tests/cloud_save_regression.test.js` | Đạt (phiên này không đụng bản lưu; chạy vì workflow có chạy) |
| Không có tệp pha: so với bản trước khi sửa | **Đạt, 0 điểm ảnh khác.** 54 ảnh (3 trùm × 3 pha × 6 động tác) và 3 ảnh phòng thật 844×390 ở pha 2 |
| Có tệp mẫu, ép pha 2 theo luật game (hạ máu, game tự chuyển pha) | **Đạt.** Đứng, lấy đà, tấn công, trúng đòn vẽ bằng tấm `-p2`; chạy và chết vẫn là tấm pha 1 |
| Có tệp mẫu, pha 3 | Đạt, cùng cách với tấm `-p3` |
| Tệp pha không làm đổi hình pha 1 | Đạt, 0 điểm ảnh khác |
| Tệp pha không hiện thành quái mới trong danh sách quái | Đạt |
| Hồ Tinh pha 3 cùng cỡ pha 1 | Đạt |
| Chớp trắng báo sắp ra đòn | Đạt: nhịp sáng khác nhịp tắt; không lấy đà thì không chớp |
| `build.py` nhận mã mới | Đạt (gói thử với 6 tệp mẫu) |
| Xoá hết tệp mẫu | Đạt: `game/art/custom` sạch, gói lại giống bản không có tệp |
| Trang: prompt 36 mục cũ không đổi | Đạt |
| Trang: tách tấm 8×6 của quái thường cho kết quả như trang trước | Đạt |
| Trang: 6 mục mới, tải được ảnh tham chiếu của cả 6 | Đạt |
| Trang: tách thử một tấm 8×4 (ảnh tham chiếu Ngư Tinh đổi màu) | Đạt: báo ĐẠT, tệp ra mã `nguTinh-p2`, 4 hàng 6 · 4 · 6 · 4, ô 180×116 |
| Lỗi trang lúc chạy | 0 |
| Workflow trên GitHub | Xanh cả hai lần đẩy |

Không chạy bộ test dài, đúng lời dặn.

**Chưa kiểm:** chưa xem trên iPhone thật; chưa thử với ảnh ChatGPT vẽ thật (chưa có); chưa mở trang đã đăng trên spiritblade.web.app để bấm thử, mới thử trên máy thử.

## 4. Ảnh kiểm

`anh-kiem.png` (một ảnh dài), từ trên xuống:

- 9 hàng: mỗi trùm ở pha 1, pha 2, pha 3, mỗi hàng 6 động tác. Tấm pha 2, pha 3 trong ảnh là **tấm mẫu máy tự dựng** (chép pha 1 rồi đổi màu đỏ hoặc xoay màu), chỉ để thấy game lấy đúng tấm. Hai cột cuối (chạy, chết) vẫn màu pha 1.
- Chớp trắng báo sắp ra đòn: nhịp tắt và nhịp sáng của 3 trùm.
- Phòng thật 844×390 ở pha 2: bên trái không có tệp pha, bên phải có tệp mẫu.
- Trang Tách Quái với mục "Ngư Tinh · pha 2".

## 5. Số đo

- Dung lượng: phiên này **không thêm ảnh nào** vào game.
- Ước khi có đủ 6 tấm (theo tấm mẫu 4 hàng, nét thường): Mộc Tinh 0,45 + 0,48 MB, Ngư Tinh 0,33 + 0,36 MB, Hồ Tinh 0,34 + 0,37 MB, **tổng khoảng 2,3 MB**. Bản gói từ khoảng 10,3 MB lên khoảng 12,6 MB. Ảnh ChatGPT vẽ thật có thể lệch con số này.
- Hiệu năng: không đo riêng. Mỗi khung chỉ thêm một lần tra tên tệp; không thêm lệnh vẽ nào khi không chớp.

## 6. Rủi ro còn lại

- **Trùm đi và chết về dáng pha 1** (mục 7, điều 2).
- **Tấm Hồ Tinh pha 1 là hình hổ** (mục 7, điều 1).
- **Bóng phân thân của Hồ Tinh pha 2 vẫn chưa có lại** khi dùng ảnh AI. Prompt pha 2 dặn vẽ một lớp khí lam tím sát viền thân để gợi ý, không vẽ con thứ hai. Muốn có bóng phân thân thật thì cần một việc nhỏ nữa trong `sprite_custom.js`.
- **Trùm chưa nhuộm thân khi dính độc, cháy, băng** như quái thường của Đợt 7 (đã ghi trong báo cáo Đợt 7, ngoài việc của phiên này).
- **Chớp trắng báo đòn là thay đổi nhìn thấy được ngay**, kể cả khi chưa có tệp pha, vì ba trùm đang dùng ảnh AI. Phép so "0 điểm ảnh khác" ở trên là lúc trùm không lấy đà.
- **Độ nét:** trang tải về 2 bản (gấp đôi và thường). Tấm pha 1 của trùm đang là nét thường, nên phải lấy bản "thường" cho pha 2, pha 3; trang đã ghi nhắc.
- **ChatGPT có thể không giữ đúng tư thế từng khung** dù có ảnh mẫu. Game vẫn vẽ được, nhưng lúc chuyển giữa hàng mượn pha 1 và hàng của pha mới có thể hơi giật dáng.
- Chưa xem trên iPhone thật.

## 7. Hai phát hiện và việc cần anh quyết

**Điều 1. Tấm Hồ Tinh pha 1 là hình hổ lửa.** Tệp `game/art/custom/hoTinh.sprite.json` (thêm ở commit `8f88b72`) vẽ một con hổ vằn có lửa trên lưng và vòng cổ tiền xu, giống mô tả của Hổ Lửa, trong khi mô tả Hồ Tinh trên trang là cáo chín đuôi. Xem `anh-kiem.png`, ba hàng `hoTinh`. Tôi không sửa ảnh (ngoài phạm vi). Prompt Hồ Tinh pha 2, pha 3 đã viết theo cách "hình dáng lấy theo ảnh gửi kèm" nên dùng được với cả hai trường hợp.

- Lựa chọn A: vẽ lại Hồ Tinh pha 1 thành cáo chín đuôi (mục "Hồ Tinh" có sẵn trên trang), rồi mới vẽ pha 2, pha 3.
- Lựa chọn B: giữ hình hổ, vẽ pha 2, pha 3 theo hình hổ.

**Điều 2. Lưới 4 hàng làm trùm đổi dáng qua lại.** Kế hoạch (KE-HOACH Phần 2 dòng D) chọn lưới rút gọn 4 hàng, hàng chạy và chết mượn pha 1. Khi chạy thử thấy: trùm ở pha 2 đứng thì là dáng pha 2, bước đi thì về dáng pha 1, đứng lại thì sang dáng pha 2. Trùm luôn chết ở pha 3 nên cảnh chết cũng về dáng pha 1. Tôi đã làm đúng như kế hoạch và không tự đổi.

- Lựa chọn A (đề xuất): thêm hàng **chạy** vào lưới, thành 8 cột × 5 hàng. Game đã để sẵn chỗ nhận, chỉ cần sửa trang công cụ và prompt. Mỗi tấm nặng thêm khoảng 30%.
- Lựa chọn B: thêm cả hàng chạy và hàng chết (8 × 6, như quái thường). Đẹp nhất, nặng nhất (cả 6 tấm khoảng 3,9 MB).
- Lựa chọn C: giữ 4 hàng, nhưng khi trùm đi thì game dùng hàng đứng của pha đó (trượt đi mà không bước chân). Không tốn thêm ảnh, cần sửa nhỏ trong game.
- Lựa chọn D: giữ nguyên như bây giờ.

Nên chốt điều 2 **trước khi vẽ**, để không phải vẽ lại 6 tấm.

## 8. Chỗ tôi tự chọn (cách ít rủi ro)

1. **Màu nền của 2 mục khác hồng tím.** Đề bài ghi ảnh tham chiếu nền hồng tím. Mộc Tinh pha 3 (tán lá tím) dùng nền xanh dương, Hồ Tinh pha 2 (mắt và khí tím) dùng nền xanh lá, theo luật chung "hình có hồng, tím thì đổi nền" để công cụ tách không ăn nhầm vào hình. Bốn mục còn lại nền hồng tím. Ảnh tham chiếu và prompt của cùng một mục luôn cùng màu nền.
2. **Chớp báo đòn tính theo thời gian thật còn lại trước khi đòn ra** (0,25 giây cuối), không chép từng nhịp chớp riêng của từng chiêu trong hình code. Lý do: không được sửa `monster_art.js`, và mốc 0,25 giây trùng với dấu "!" của quái thường.
3. **Ảnh tham chiếu chỉ có 4 hàng** (bỏ hàng chạy, chết của pha 1), đúng bố cục cần vẽ, để ChatGPT không vẽ thừa hàng.
4. **Mộc Tinh pha 2, pha 3 có đổi nhẹ tư thế tay** (pha 2 tay nâng cao, pha 3 tay dang ngang) vì hình code làm vậy. Nếu ChatGPT đổi tư thế quá tay thì bỏ câu đó trong prompt.
5. **Không sửa `docs/review/kiem-ke-hinh-code.md`** (dòng "Dáng pha 2, pha 3" vẫn ghi CHƯA CÓ) để tránh đụng phiên khác. Trạng thái đúng lúc này: đã có chỗ móc trong game và mục trên trang, chờ ảnh.

## 9. Cách quay lui

- Phần game: `git revert f9d579e`. Hoặc không cần quay lui: không đặt tệp `-p2`, `-p3` vào `game/art/custom` thì chỉ còn khác ở chớp trắng báo đòn.
- Tắt riêng chớp trắng: xoá khối `if (anhAI && b.dying == null) { … }` trong `A.boss` ở `game/js/boss.js`.
- Phần trang công cụ: `git revert b1e00ae`.

## 10. Việc tiếp theo khi có ảnh

Anh gửi tệp `.zip` của từng mục. Claude lấy bản "thường" trong đó, đặt vào `game/art/custom/<mã>.sprite.json`, chạy `python3 game/build.py` rồi đẩy lên. Không cần sửa code.
