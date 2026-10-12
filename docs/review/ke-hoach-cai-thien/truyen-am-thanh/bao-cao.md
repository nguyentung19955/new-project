# Phiên Cốt truyện + Âm thanh — báo cáo (12/10/2026)

Nhánh `khoi-tao-du-an`. Phiên này chỉ làm: lời thoại / cốt truyện, nhạc nền và tiếng, bảng Cài đặt của Anh Mõ. Không đổi luật chơi, số liệu, lưu mây, đăng nhập Google.

## Tóm tắt cho chủ dự án

1. **Có truyện**: lần đầu vào làng có đoạn mở đầu 4 khung tranh (khoảng 20 giây, chạm để sang nhanh, nút **Bỏ qua** góc trên phải). Người chơi cũ đã qua ải 1 thì không bị ép xem.
2. **Trùm biết nói**: 3 trùm vùng và 3 trùm nhỏ nói 1 câu khi ra mắt và 1 câu khi gục (bong bóng lời trên đầu, trận **không** dừng).
3. **Kết vùng**: hạ trùm vùng lần đầu, về làng thì em bé được cứu và người làng nói 2–3 câu. Hạ Hồ Tinh có thêm đoạn kết và lời mời chơi **Độ khó 2**. Mỗi người làng có thêm 1 câu mới sau mỗi trùm vùng.
4. **Có nhạc nền** tạo ngay trong máy (không tải thêm tệp): nhạc làng sáo trúc / đàn bầu / đàn tranh, mỗi vùng một bài có trống, trùm có trống dồn. Tiếng "gong" cũ thành tiếng chiêng ấm.
5. **Cài đặt mới** ở Anh Mõ, nút **Âm thanh, pin ›**: thanh **Nhạc**, thanh **Tiếng** (0–100), nút **Âm thanh bật/tắt**, nút **Tiết kiệm pin (30 khung/giây)**, nút **Xem lại truyện**. Mọi nút của bảng Cài đặt cao khoảng 46 điểm trên iPhone (tối thiểu 44).

## Tệp đổi

| Tệp | Việc |
| --- | --- |
| `game/js/truyen.js` (mới) | Toàn bộ lời thoại, trình chiếu khung truyện, bong bóng lời trùm, câu mới của người làng, tiến độ truyện trong bản lưu |
| `game/js/nhac.js` (mới) | Nhạc nền WebAudio: nhạc cụ, 7 bài, lên lịch nốt, chuyển bài mượt, dừng khi ẩn trang; tiếng chiêng |
| `game/js/engine.js` | Phần âm thanh: nút âm lượng riêng cho Tiếng (`G.amThanh`), "gong" → chiêng; sửa bản lưu cho 3 trường mới (`nhac`, `tieng`, `truyen`); đang chiếu truyện thì không hạ khung hình |
| `game/js/village.js` | Bảng Cài đặt (Anh Mõ): trang 1 sắp lại, nút cao 32; thêm trang 2 (`settings2`, `thanhAm`) |
| `game/index.html` | Nạp `js/nhac.js`, `js/truyen.js` (trước `js/main.js`) |
| `tools/ngon-ngu/tu-dien/truyen-am-thanh.json` (mới) + `game/js/ngon_ngu_en.js` (gộp lại bằng `tools/ngon-ngu/gop.py`) | 72 câu tiếng Anh cho mọi chữ mới |
| `game/tests/truyen_am_thanh.py` (mới) | Bài kiểm 32 mục + chụp ảnh |
| `game/tests/nhac_do.py`, `game/tests/nhac_hieu_nang.py` (mới) | Đo độ to nhạc (không cần loa), đo nhạc có làm tụt khung hình không |
| `game/tests/au_onboarding.py` | Người mới gặp đoạn mở đầu: chụp rồi bấm Bỏ qua như người chơi |
| `game/dist/*`, `tools/xuong-sprite/thu.html` | Đóng gói lại |

Không sửa `stage.js`: lời trùm và kết vùng gắn bằng cách bọc `update/draw` của cảnh ải và cảnh làng trong `truyen.js`.

## Lời thoại mới (toàn văn tiếng Việt)

### Mở đầu (4 khung, mỗi khung tự sang sau 5 giây)

1. **Linh khí cạn** — Làng ven sông sống nhờ linh khí của cây đa nghìn tuổi. Một sáng, lá đa úa vàng, linh khí cạn dần. *(cảnh làng nhạt màu, lá vàng rơi)*
2. **Ba yêu tinh** — Ba yêu tinh xưa kia Lạc Long Quân đã trừ nay thức dậy: Mộc Tinh ở Rừng già, Ngư Tinh ở Hang biển, Hồ Tinh ở Lâu đài cổ. Chúng hút linh khí về hang. *(ba trùm đứng cạnh nhau, hào quang màu vùng)*
3. **Bị bắt** — Cu Tèo, Cái Bống, Cu Lì đi tìm linh khí cho làng, rồi bị yêu tinh bắt mất. *(ba em bé trong lồng, nền ba màu vùng)*
4. **Lên đường** — Cụ Đồ: Còn Cu Tí. Cầm lấy vũ khí sống này, cháu: vũ khí lớn lên theo cháu, yêu tinh học theo cháu. Chú Lái Đò chờ ở bến! *(Cu Tí cầm kiếm sáng rực giữa làng)*

Truyện lấy từ tích Lạc Long Quân diệt Ngư Tinh (biển Đông), Hồ Tinh (cáo chín đuôi, hang thành hồ Tây) và Mộc Tinh (cây chiên đàn nghìn năm ở Phong Châu), khớp với tên ba trùm sẵn có.

### Trùm (câu ra mắt / câu khi gục)

| Trùm | Ra mắt | Khi gục |
| --- | --- | --- |
| Mộc Tinh | Ta là cây chiên đàn nghìn năm thành tinh. Linh khí của làng đã chảy vào rễ ta! | Lá rụng về cội... Rừng ơi, xanh lại đi... |
| Ngư Tinh | Biển Đông là nhà ta! Đứa bé con dám lội xuống hang của Ngư Tinh sao? | Sóng lặng rồi... Ta về đáy biển ngủ tiếp... |
| Hồ Tinh | Chín đuôi, nghìn năm tu luyện. Ngươi tưởng thắng được ta ư? | Lửa ở đuôi tắt rồi... Hang ta lại thành hồ nước trong... |
| Nấm Chúa | Nấm mọc sau mưa, ăn vào là ngủ quên! Hự hự! | Bào tử bay hết rồi... xẹp... |
| Cua Đá | Càng ta kẹp vỡ cả đá ngầm! Lùi lại! | Ối, gãy càng! Bò ngang chạy thôi! |
| Hổ Lửa | Gừừ! Lửa trong lâu đài này là của ta! | Gừ... lửa tàn rồi... |

Câu ra mắt hiện 4,2 giây, câu khi gục 3,4 giây, trong lúc trùm diễn cảnh ra mắt / cảnh gục (trùm đang không đánh). Trận không dừng giây nào.

### Kết vùng (về làng sau khi hạ trùm vùng lần đầu)

- **Rừng già**: Cu Tèo: "Cu Tí ơi! Rễ cây quấn tớ cả tuần, may mà cậu tới!" — Cụ Đồ: "Rừng già thở lại rồi, cây đa đã nhú chồi. Nhưng gió biển lạnh lắm: Cái Bống còn kẹt ở Hang biển." — "Cu Tèo đã về làng. Gặp Ông Từ ở sân đình để đổi em bé."
- **Hang biển**: Cái Bống: "Nước dưới hang lạnh buốt... Cảm ơn Cu Tí đã lặn xuống tìm tớ!" — Chú Lái Đò: "Biển êm rồi, đò lại chạy. Bên kia sông, Lâu đài cổ đỏ rực lửa: Cu Lì ở trong đó." — "Cái Bống đã về làng. Gặp Ông Từ ở sân đình để đổi em bé."
- **Lâu đài cổ**: Cu Lì: "Con cáo chín đuôi bắt tớ canh lửa cả tháng! Về nhà thôi, đói lắm rồi!" — Cụ Đồ: "Ba yêu tinh đã ngủ lại. Linh khí về làng, cây đa xanh lá như xưa."

### Đoạn kết (sau Hồ Tinh, tức hết 15 ải)

1. Tối ấy cả làng mở hội dưới gốc đa. Bốn em bé ngồi nghe Cụ Đồ kể chuyện Lạc Long Quân trừ yêu. Hết truyện... mà chưa hết đâu! *(đèn lồng, bốn em bé quanh gốc đa)*
2. Chú Lái Đò: Đêm xuống, yêu tinh có thể thức dậy mạnh hơn. Muốn thử sức thì gặp chú, chạm "Độ khó 2" nhé!

### Người làng: câu mới theo 3 mốc (sau Mộc Tinh / Ngư Tinh / Hồ Tinh)

Nói một lần khi mở bảng của người đó (hiện 5 giây ở khung lời bên trái bảng).

| Người | Sau Mộc Tinh | Sau Ngư Tinh | Sau Hồ Tinh |
| --- | --- | --- | --- |
| Chú Lái Đò | Rừng già yên rồi. Đò sang Hang biển được rồi đấy cháu. | Biển êm thật rồi! Chú chèo một mạch sang Lâu đài cổ. | Ba vùng yên ả. Muốn thử Độ khó 2 thì bảo chú. |
| Ông Thợ Rèn | Gỗ linh Rừng già đây rồi! Mang về ông rèn cho. | Vảy cá thần cứng thật, tôi lưỡi vào là bén lắm. | Lửa Lâu đài cổ thổi lò mới hừng làm sao! |
| Bà Hàng Xén | Rừng xanh lại, nấm tươi về chợ, bà vui ghê. | Thuyền cá về bến rồi, chợ đông hẳn lên. | Cả làng mừng! Bà bán rẻ cho cháu... à mà thôi, giá cũ. |
| Cô Thợ May | Cu Tèo về rồi, để cô may cho nó cái áo mới. | Cái Bống lạnh run, cô đang dệt cho cái khăn. | Cu Lì đòi áo đỏ như lửa. Cô may ngay! |
| Cụ Đồ | Mộc Tinh là cây chiên đàn nghìn năm. Xưa Lạc Long Quân trừ nó ở rừng Phong Châu. | Ngư Tinh xưa bị Lạc Long Quân ném khối sắt nung vào miệng. Cháu cũng giỏi chẳng kém. | Hang cáo chín đuôi bị phá, chỗ ấy thành hồ lớn. Truyện của cháu, lão ghi vào sách. |
| Ông Từ | Cu Tèo chạy nhảy suốt sân đình. Ồn mà vui. | Cái Bống về, sân đình có tiếng hát rồi. | Đủ bốn bé rồi. Đình làng ấm hẳn lên. |
| Anh Mõ | Cốc cốc! Làng nước ơi, Cu Tí hạ được Mộc Tinh rồi! | Cốc cốc! Biển êm, đò chạy, làng nước nghe chưa! | Cốc cốc cốc! Ba yêu tinh ngủ cả rồi! Mở hội thôi! |

Mọi câu đều có bản tiếng Anh (`tools/ngon-ngu/tu-dien/truyen-am-thanh.json`; bài kiểm xác nhận chế độ English không còn chữ Việt chưa dịch ở các màn mới; tên "Lạc Long Quân" viết "Lac Long Quan" ở bản Anh).

### Khi nào truyện hiện

- Mở đầu: chỉ khi người chơi **tự** chạm màn chào để vào làng, bản lưu chưa có ải nào. Hiện một lần (đánh dấu ngay khi bắt đầu chiếu).
- Kết vùng / đoạn kết: khi người chơi từ ải **về làng** (nút Về làng, bảng kết quả) mà vừa có trùm vùng mới bị hạ.
- Vào làng bằng lệnh trong bài kiểm tra (`G.setScene(G.Village)`) thì không hiện; bot (`G.botInput`) không bao giờ gặp khung truyện.
- Bản lưu: trường MỚI, tuỳ chọn `G.save.truyen = { mo, v, n }` (đã xem mở đầu, số đoạn kết vùng đã xem, mốc câu người làng đã nghe). Bản lưu cũ chưa có thì dựng theo tiến độ: đã qua ải nào thì coi như đã xem mở đầu, các vùng đã hạ coi như đã xem kết vùng (không chiếu lại chuyện cũ). Câu mới của người làng ở mốc hiện tại thì người chơi cũ vẫn được nghe một lần.

## Nhạc nền (tạo bằng code, không tệp âm thanh)

Thang 5 âm kiểu Việt: điệu **Bắc** (Rê–Mi–Sol–La–Si, vui sáng) và điệu **Oán** (Rê–Fa–Sol–La–Đô, buồn, sâu). Nhạc cụ tổng hợp: **sáo trúc** (tiếng tròn, luyến vào nốt, rung hơi, có tiếng hơi thổi), **đàn bầu** (một dây, nhấn cao giọng rồi buông ở nốt dài, rung sâu), **đàn tranh** (gảy, tắt dần), **trống** đất và **trống chầu**, **trống con**, **phách** tre, **chiêng**, tiếng **sóng**, tiếng **côn trùng**.

| Cảnh | Bài | Mô tả |
| --- | --- | --- |
| Màn chào, làng, lúc chiếu truyện | Làng | Điệu Bắc, 70 nhịp/phút. Vòng A: sáo trúc hát; vòng B: đàn bầu hát; đàn tranh rải nhẹ bè trầm, phách thưa. Hai vòng ≈ 55 giây rồi lặp. |
| Rừng già | Vùng 1 | Điệu Bắc (La), 96 nhịp. Trống đất + trống con theo nhịp, đàn tranh trầm, sáo / đàn bầu thay nhau, côn trùng lách tách. |
| Hang biển | Vùng 2 | Điệu Oán (Rê), 84 nhịp. Đàn tranh rải đều như sóng, đàn bầu hát, trống thưa, tiếng sóng dâng rút mỗi hai ô nhịp. |
| Lâu đài cổ | Vùng 3 | Điệu Oán (Mi), 108 nhịp. Trống chầu, phách, chiêng mở đầu mỗi vòng, sáo / đàn bầu. |
| Phòng trùm (vùng và trùm nhỏ) | Trùm | Trống dồn 128 nhịp, mỗi pha của trùm nhanh thêm 7%; chiêng; đàn tranh dồn bè trầm; đàn bầu. Giọng theo vùng. |
| Thua (bảng thua) | — | Im lặng. |

- Đổi cảnh: bài cũ nhỏ dần, bài mới to dần (khoảng 1 giây). Hạ trùm thì về lại nhạc vùng.
- Chỉ phát sau lần chạm đầu tiên (luật iOS). Ẩn trang / khoá máy: dừng hẳn bộ âm thanh (đỡ pin); mở lại chạy tiếp (iOS đôi khi cần chạm một lần).
- Nhẹ máy: các nốt được lên lịch trước 0,35 giây bằng bộ đếm 120 ms (không chạy theo khung hình); âm thanh do luồng riêng của trình duyệt tạo.
- Tiếng "gong" (trùm ra mắt, đổi pha) → **tiếng chiêng** ấm, ngân khoảng 1,6 giây (4 bồi âm, cao độ chùng nhẹ). Các tiếng khác giữ nguyên.

## Cài đặt (Anh Mõ)

- Trang 1: **Âm thanh, pin ›** (mở trang 2; dòng nhỏ "Nhạc · Truyện" hoặc "Đang tắt"), Độ nét, Toàn màn hình, Đăng nhập Google, Góp ý, Xoá tiến trình, Ngôn ngữ. Mọi nút cao 32 (khoảng 46 điểm trên iPhone 844×390); riêng nút "Góp ý nhận được" chỉ chủ dự án thấy, giữ cao 22.
- Trang 2 "Âm thanh, pin, truyện":
  - **Nhạc** và **Tiếng**: nút − / + (mỗi lần 10), kéo hoặc chạm trên thanh (mỗi nấc 5), số 0–100 ("Tắt" khi 0). Nhả tay mới lưu; chỉnh Tiếng thì kêu một tiếng thử. Lưu ở `G.save.nhac` (mặc định 60), `G.save.tieng` (mặc định 100 = to như trước).
  - **Âm thanh: bật/tắt** (nút cũ, tắt cả nhạc lẫn tiếng).
  - **Tiết kiệm pin: bật/tắt (30 khung/giây)** — bật `G.save.pin` (đã có sẵn trong engine, nay mới có nút).
  - **Xem lại truyện** — chiếu lại mở đầu + các đoạn kết vùng đã qua.
  - **‹ Trở lại**.

## Cờ tắt

| Cờ | Tác dụng |
| --- | --- |
| `?truyen=0` (hoặc `G.TRUYEN = false`) | Không khung truyện, không lời trùm, không câu mới của người làng |
| `?nhac=0` (hoặc `G.nhac.tat = true`) | Không nhạc nền (tiếng hiệu ứng vẫn có) |
| Thanh Nhạc = 0 | Như trên, theo người chơi |

## Kết quả kiểm

| Kiểm | Kết quả |
| --- | --- |
| `game/tests/truyen_am_thanh.py` (844×390 cảm ứng) | **32/32 đạt**, 0 lỗi trang (`anh/ket-qua.json`) |
| Bot chiến dịch ải 1-1 → 1-5 (`tests/campaign.py '{"stages":5}'`) | Thắng cả 5 ải lần đầu, không kẹt, không lỗi |
| `tests/au_onboarding.py` (người mới từ màn chào tới ải 2) | Chạy hết 36 bước, gặp mở đầu, bấm Bỏ qua, 0 lỗi trang (ảnh của bài này không đưa vào commit) |
| Bản lưu cũ: chưa có trường mới, số âm lượng hỏng (`'abc'`, `250`), trường `truyen` sai kiểu | Đọc được, tự sửa, không lỗi |
| `tests/cloud_save_regression.test.js` | Đạt hết |
| `tests/rules.py` | 85/85 luật đạt |
| `node --check game/js/*.js` | Đạt |
| `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` | Chạy được |
| Độ to nhạc (`tests/nhac_do.py`, dựng 16 giây mỗi bài không cần loa) | Đỉnh 0,17–0,44 (< 1, không rè), độ to trung bình đều nhau 0,059–0,068; trùm 12 nốt/giây, làng 2,3 nốt/giây |
| Nhạc và khung hình (`tests/nhac_hieu_nang.py`, phòng trùm 8 giây, nhạc trùm) | Không nhạc: khung trung bình 17,9 ms; có nhạc: 18,0–18,2 ms (như nhau). Bộ lên lịch nhạc tốn 1,3–1,7 ms mỗi giây (≈ 0,15%) |
| `tests/ui_build.py` | Hỏng **cả trên bản gốc chưa sửa** (trang đóng gói chặn `eval`, lỗi có sẵn từ trước, không do phiên này) |

Ảnh (`anh/`): `01`–`04` bốn khung mở đầu · `05` Cài đặt trang 1 · `06` Cài đặt trang 2 · `07`–`08` kết vùng Rừng già · `09` Ông Thợ Rèn nói câu mới · `10`–`11` Mộc Tinh ra mắt và gục · `12` Hổ Lửa · `13`–`14` đoạn kết · `15` bản tiếng Anh.

Chưa kiểm được: **nghe** nhạc thật (máy kiểm không có loa; chỉ đo độ to, độ rè, nhịp). Chủ dự án nghe thử trên iPhone; chỗ nào chói hay nhỏ quá thì báo để chỉnh số `SAO/BAU/TRANH/TRONG…` đầu phần bài nhạc trong `js/nhac.js`.

## Rủi ro còn lại

- Tiếng nhạc cụ là tổng hợp bằng sóng, nghe "gần giống" chứ không như thu âm thật.
- iOS: khi mở lại game từ nền, nhạc có thể chờ một lần chạm mới chạy lại (luật của Safari).
- Phiên "Độ đọc trận" có thể dời dải thông báo; bong bóng lời trùm đặt dưới y = 58 và cạnh đầu trùm nên ít khả năng chồng lên.
- Bảng Cài đặt trang 1 đổi toạ độ một số nút (cao 26 → 32, hàng dưới dời xuống 8). Các điểm bấm cố định của `tests/may.py` (Đăng nhập Google, Góp ý, hộp góp ý của chủ dự án) vẫn nằm trong nút mới; bài nào bấm theo toạ độ cũ của hàng "Xoá tiến trình" (y cũ 200–226, mới 208–240) thì vẫn trúng vì hai vùng chồng nhau.

## Quay lui

- Tắt nhanh không cần sửa code: `?truyen=0`, `?nhac=0`.
- Bỏ hẳn: `git revert <sha của commit phiên này>` (sha ghi ở tin nhắn commit "Cốt truyện + nhạc nền…"). Bản lưu có trường `truyen`, `nhac`, `tieng` vẫn đọc được ở bản cũ (bản cũ giữ nguyên trường lạ, không dùng tới).

## Quyết định cần chủ dự án duyệt

- Giọng kể dựa trên tích Lạc Long Quân trừ ba yêu tinh. Muốn đổi lời nào thì sửa thẳng trong bảng trên, phiên sau thay vào `js/truyen.js`.
- Âm lượng mặc định: Nhạc 60, Tiếng 100.
