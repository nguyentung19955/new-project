# Báo cáo phiên "hieu-ung-b2" — đòn cận chiến và chiêu

Ngày 11/10/2026. Làn B (Hiệu ứng), phiên B2 theo `docs/review/kiem-ke-hinh-code.md` mục 6.4 và bảng 3.11. Nối tiếp phiên B1.

## Đã làm gì

1. **Trang công cụ** https://spiritblade.web.app/tach-hieu-ung.html có thêm **8 mục mới ở cuối** ô chọn hiệu ứng (sau 14 mục của B1). Mỗi mục có prompt riêng để dán thẳng vào ChatGPT (chép nguyên văn ở `PROMPT.md` cùng thư mục).
2. **Game đọc được 8 ảnh đó.** Đặt tệp `hu-….sprite.json` vào `game/art/custom/` là game dùng ảnh thay cho hình vẽ bằng code. **Chưa có tệp nào thì game vẽ y như cũ** (trừ một chỗ, xem mục "Chỗ đổi hình ngay").

## 8 hình của lô này

| Mã tệp | Hình | Hiện ở đâu trong game | Cỡ khung × số khung |
|---|---|---|---|
| `hu-tram-nguyet` | Trảm Nguyệt | Vầng trăng bay ra khi kiếm tung chiêu đặc biệt | 48×48 × 4, chạy lặp |
| `hu-chem-luot` | Lướt chém | Nhát chém ngang của kiếm ngay sau khi lăn né | 64×28 × 6 |
| `hu-quet-giao` | Giáo quét vòng | Đòn giữ nút của giáo, quét một vòng quanh người | 104×36 × 8 |
| `hu-nen-dat` | Nện đất | Chỗ búa chạm đất: đòn thường của búa, đòn giữ nút, chiêu đặc biệt của búa | 80×48 × 6 |
| `hu-quai-cao` | Vệt cào của quái | Lúc quái đánh gần tung đòn | 40×32 × 4 |
| `hu-ban-cung` | Buông cung | Luồng gió ở cây cung lúc buông dây đã căng | 32×32 × 4 |
| `hu-ra-chieu` | Ra chiêu | Chớp ở tay lúc tung chiêu đặc biệt của kiếm và giáo | 48×48 × 5 |
| `hu-ra-chuong` | Ra chưởng | Sóng ở tay lúc bấm nút Chưởng | 48×48 × 5 |

Những thứ **vẫn vẽ bằng code**: vệt gió, bụi, đá văng, vết nứt trên sàn, vòng bụi dưới chân khi giáo quét, vòng sóng màu hệ theo đúng vùng trúng của búa, vệt bám theo mũi vũ khí, mọi vùng đỏ báo nguy hiểm.

## Màu: theo bản rà soát mỹ thuật (mục 1 và mục 6)

Mỗi prompt của lô này có thêm một câu **MÀU**:

- 7 hiệu ứng **của người chơi**: lõi (phần sáng nhất, chiếm phần lớn hình) là trắng ngà `#fbfed0`, màu khác chỉ nhuốm ở mép ngoài. Như vậy em bé không bị chìm trong màu hệ.
- Vệt cào **của quái**: dùng nấc đậm, tối hơn hẳn, không có lõi trắng to, không phát sáng.

**Bản màu theo hệ (tôi tự thêm, không bắt buộc).** Trong code các hình này đổi màu theo hệ Lửa, Độc, Băng; một tấm ảnh thì chỉ có một màu. Nên mỗi mục có thêm ô **Bản màu**: *Chung*, *Hệ Lửa*, *Hệ Độc*, *Hệ Băng*. Chỉ cần vẽ bản Chung là đủ dùng. Muốn hiệu ứng đổi màu theo hệ thì vẽ thêm bản theo hệ: prompt đổi câu MÀU (dùng đúng mã màu hệ trong bảng màu) và màu nền, tệp tải ra có mã thêm đuôi `-fire`, `-poison`, `-ice`. Game có bản theo hệ thì dùng, chưa có thì dùng bản Chung. Riêng **Ra chưởng** luôn mang hệ, nên làm đủ ba bản thì đẹp nhất.

Nền vẽ: xanh dương `#0000FF` cho bản Chung và bản Lửa; hồng tím `#FF00FF` cho bản Băng và bản Độc (xanh băng gần màu nền xanh dương, dễ bị tách mất).

## Tệp đã sửa

- `game/js/fx.js`: chỗ búa nện đất và vệt cào quái; thêm vài hàm dùng chung (chọn bản theo hệ, đặt ảnh theo hướng); hàm xoay 8 hướng có thêm 2 dòng để ảnh nằm trên sàn và ảnh đã tự chĩa đúng hướng không bị xoay thêm lần nữa.
- `game/js/fx_he.js`: Trảm Nguyệt, lướt chém, giáo quét, buông cung, ra chiêu; vệt búa của đòn nện đất giữ nút.
- `game/js/fx_chuong.js`: ra chưởng.
- `tools/tach-hieu-ung/index.html`: 8 mục mới ở cuối mảng `HU`, câu MÀU, ô Bản màu. Prompt của 32 mục cũ không đổi một chữ.
- `game/dist/*`: do `build.py` tạo lại.

Không đổi lối chơi, bản lưu, đăng nhập, lưu mây. Không có chữ mới hiện cho người chơi. Không thêm ảnh nào vào `game/art/custom`. Không sửa `fx_anh.js`, `sprite_custom.js`, `build.py`.

## Đã kiểm (một lượt Playwright; ảnh ở `anh-kiem.png` và `anh-kiem-trang-tach.png`)

- `node --check` mọi tệp JS, bài kiểm lưu mây, `python3 game/build.py`: đều qua. Hai lần đẩy đều qua kiểm tra tự động (xanh).
- **Trang tách** (cỡ màn iPhone): dựng 12 dải mẫu bằng máy (8 bản Chung và 4 bản theo hệ, nền đúng màu prompt, có kẻ lưới): cả 12 đều **ĐẠT**, tệp có `"net": 2`, mã tệp đúng (có đuôi hệ khi chọn bản theo hệ), trang không cuộn ngang, không lỗi. Bấm Tải ra đủ 2 bản (gấp đôi + thường).
- **Không có tệp mới = y hệt cũ:** chạy từng đòn theo 8 hướng trên bản cũ và bản mới rồi so từng điểm ảnh: lướt chém, giáo quét, búa đòn thường, vệt cào quái, buông cung, ra chiêu (kiếm, giáo, búa), ra chưởng, Trảm Nguyệt đều **khác 0 điểm ảnh**. Riêng đòn nện đất giữ nút thì khác, đúng như dự tính (xem mục dưới).
- **Nạp tạm 12 dải mẫu vào game** (chỉ trong lúc thử, không nằm trong kho mã): mỗi đòn thử 8 hướng. Ảnh hiện đúng chỗ, cỡ gần bằng hình code, xoay đúng hướng; đánh sang trái thì ảnh lật ngang chứ không lộn ngược (dải mẫu có "mào" cam ở phía trên để soi). Ảnh nện đất nằm yên trên sàn, không xoay. Bản theo hệ được chọn đúng khi có (ví dụ chưởng Lửa dùng `hu-ra-chuong-fire`, quái hệ Băng dùng `hu-quai-cao-ice`), không có thì dùng bản Chung. Trong `anh-kiem.png`: mỗi đòn có hai hàng, hàng trên là hình code, hàng dưới là dải mẫu, 8 cột là 8 hướng.
- **Chơi thật trong phòng:** đặt bia ở 8 hướng, bấm nút Chiêu (kiếm) rồi nút Chưởng: ảnh ra chiêu, vầng trăng và ảnh ra chưởng đều hiện, vầng trăng bay đúng 8 hướng, lớp hiệu ứng không báo lỗi nào.

Giới hạn của lượt kiểm, nói rõ để bạn biết:

- Dải mẫu chỉ là hình tam giác máy dựng, **chưa thử với ảnh thật của ChatGPT**. Cỡ và điểm đặt có thể phải chỉnh nhẹ khi có ảnh thật (ô "Cỡ trong game" và "Neo x, Neo y" trên trang tách).
- Lướt chém, giáo quét, nện đất, buông cung, vệt cào quái được thử bằng cách gọi thẳng phần vẽ hiệu ứng theo 8 hướng, không qua bấm nút thật. Chỉ nút Chiêu của kiếm và nút Chưởng là thử bằng bấm nút thật.
- Khi mở game từ máy chủ thử trên máy, console có 1 dòng báo 404 "khi tải script". Dòng này có ở cả bản cũ lẫn bản mới nên không phải do phiên này; tôi chưa truy nguyên nhân.
- Lúc thử, máy không tải được thư viện nén zip nên trang tự chuyển sang tải 2 tệp rời (đúng thiết kế dự phòng). Trên điện thoại của bạn có mạng thì vẫn ra 1 tệp zip như cũ.

## Chỗ đổi hình ngay (dù chưa có ảnh mới)

**Vệt búa bổ xuống của đòn nện đất giữ nút** giờ dùng ảnh "Vệt nện búa" (`hu-chem-bua`) đã có sẵn trong game, đúng theo kế hoạch ("nện đất tích lực dùng lại hu-chem-bua"). Trước đây đòn thường của búa đã dùng ảnh này, còn đòn giữ nút vẫn vẽ vệt bằng code; giờ hai đòn giống nhau, đòn giữ đầy nấc 2 thì vệt to hơn. Đây là chỗ duy nhất khác bản cũ khi chưa có tệp mới.

## Những chỗ tự quyết (cần bạn biết)

1. **Thêm ô "Bản màu" và bản theo hệ** như đã nói ở trên. Không dùng thì không ảnh hưởng gì.
2. **Ảnh nện đất dùng cho cả ba đòn của búa** (đòn thường, giữ nút, chiêu đặc biệt) vì cả ba cùng gọi một hình nện trong code. Khi có ảnh, số hạt bụi và đá vẽ bằng code giảm còn khoảng một nửa để không rối.
3. **Ảnh ra chiêu dùng cho kiếm và giáo.** Chiêu của búa là nện đất nên dùng ảnh nện đất. Chiêu của cung (Mưa Tên) trong code không có chớp ở tay nên không có gì để thay.
4. **Giáo quét vòng:** trang tách đặt từng khung vào giữa theo bề ngang, nên prompt dặn "khung nào cũng vẽ đủ cả vòng". Nếu ChatGPT vẽ khung đầu chỉ có nửa vòng thì vòng sẽ bị lệch tâm ở khung đó; khi ấy nhờ vẽ lại.
5. **Vệt cào quái chỉ lật trái phải**, không xoay 8 hướng, vì trong game quái chỉ quay trái hoặc phải.
6. **Kiểu vẽ:** Trảm Nguyệt, buông cung, ra chiêu, ra chưởng vẽ kiểu ánh sáng (cộng sáng) theo đề xuất của bản kiểm kê; lướt chém, giáo quét, nện đất, vệt cào vẽ kiểu thường. Đổi được bằng ô "Cộng sáng" trên trang tách.
7. **Bản Chung của hiệu ứng người chơi** có mép màu bạc sáng (không dùng xanh nhạt như vệt kiếm cũ) để không lẫn với nền xanh dương lúc tách.
8. **Vệt cào quái bản Chung** dùng nâu đỏ than hồng `#a03409` thay cho đỏ tươi của hình code, theo luật "đỏ tươi dành cho báo nguy hiểm".

## Dung lượng

- Ảnh thêm vào game ở phiên này: **0 KB** (chưa có ảnh thật).
- Bản gói `linh-khi.html`: khoảng 10,4 MB; phần mã của phiên này thêm chừng 4 KB.
- Khi bạn vẽ đủ 8 dải bản Chung: ước thêm 60 đến 150 KB tất cả. Mỗi bản theo hệ thêm chừng 5 đến 25 KB.

## Bạn cần làm gì

1. Mở https://spiritblade.web.app/tach-hieu-ung.html, chọn một trong 8 mục cuối, bấm **Sao chép prompt vẽ**, dán vào ChatGPT, lưu ảnh về máy.
2. Đưa ảnh vào trang. Thấy **ĐẠT** thì bấm **Tải** và gửi tệp cho Claude để đưa vào game.
3. Muốn có màu theo hệ: chọn thêm **Bản màu** (Lửa, Độc, Băng), sao chép prompt và làm lại như trên. Nên làm trước cho **Ra chưởng**.

## Phiên sau của làn B

B3 theo bản kiểm kê, thêm mục vào cuối mảng `HU`, sau 8 mục của phiên này. Các hàm dùng chung mới trong `fx.js` (`anhHe`, `anhHuong`, có trong `fx.kit`) dùng lại được cho hiệu ứng có hệ hoặc có hướng.
