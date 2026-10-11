# Báo cáo làn B4 — 7 vũng trên sàn bằng ảnh AI

Ngày 11/10/2026. Làn B (Hiệu ứng), phiên B4 theo brief `docs/review/ke-hoach-cai-thien/lan-b4-vung-san.md`. Nối tiếp B1, B2, B3.

**Tóm tắt:** trang công cụ có thêm 7 mục vũng và 2 lô gộp; game đã đọc được 7 ảnh đó và co ảnh theo đúng vùng gây sát thương. Chưa có ảnh nào thì game vẽ y như cũ. Việc còn lại là của bạn: gen **2 tấm ảnh** theo `PROMPT.md`.

## 1. Bảy vũng (lấy từ code)

| Mã tệp | Vũng | Ai tạo ra | Bán kính gây sát thương (điểm ảnh game) | Sống bao lâu | Cỡ khung | Nền vẽ |
|---|---|---|---|---|---|---|
| `hu-vung-lua` | Vũng lửa (vệt cháy) | em bé: vũ khí hệ Lửa 16–18, trang phục 13 và 20, vệt cháy của cầu lửa 10–13 | lớn nhất 20 | 1,3 đến 2,5 giây | 44×44 | xanh dương |
| `hu-vung-doc` | Vũng độc | em bé: vũ khí hệ Độc 22–25, trang phục 13 và 20, mặt sàn dưới mây độc của chưởng 15–46 | lớn nhất 46 | 1,5 đến 4,5 giây | 96×96 | hồng tím |
| `hu-may-doc` | Mây độc lơ lửng | nằm trên vũng độc của em bé và trên mây độc của chưởng | theo vũng bên dưới, lớn nhất 46 | như vũng bên dưới | 96×96 | hồng tím |
| `hu-vung-quai-lua` | Vũng lửa của quái | bom 12–20, quái cảm tử 15, trùm 15–24 | lớn nhất 24 | 2 đến 3,2 giây | 52×52 | xanh dương |
| `hu-vung-quai-doc` | Vũng độc của quái | bom 20–33, quái cảm tử 26, quả độc 17–18, rễ cây 14, trùm 34 | lớn nhất 34 | 2 đến 4 giây | 72×72 | hồng tím |
| `hu-vung-quai-bang` | Vũng nước lạnh của quái | trùm vùng Hang biển 15 | 15 | 2 giây | 34×34 | hồng tím |
| `hu-vung-quai-do` | Vũng đỏ của quái (không hệ) | **hiện chưa có đòn nào tạo ra**; lớp vẽ có sẵn nên làm luôn | tính như vũng lửa: 24 | — | 52×52 | xanh dương |

- Cỡ khung = đường kính lớn nhất + 4 điểm lề của trang tách. Ô vuông; trong ô vũng là hình elip hơi dẹt, cao bằng 85% rộng (đúng tỉ lệ game đang vẽ). Riêng mây độc dẹt hơn, cao bằng một nửa rộng.
- Mỗi vũng 6 khung chạy lặp. Một vòng: vũng lửa 0,6 giây; vũng độc, nước, đỏ 0,9 giây; mây độc 1,2 giây.
- Màu: vũng của em bé có điểm sáng nhất màu trắng ngà; vũng của quái dùng nấc đậm, không phát sáng; không đỏ tươi. Vũng độc và mây độc không dùng tím (ảnh vẽ trên nền hồng tím nên tím dễ bị xoá nhầm).

## 2. Game dùng ảnh thế nào

- Có ảnh thì game dán ảnh và **co theo đúng bán kính gây sát thương** của từng vũng. Vùng gây sát thương không đổi; ảnh chỉ là lớp nhìn.
- Vẫn vẽ bằng code: **viền nóng** đỏ cam quanh vũng của quái (đập theo nhịp gây sát thương), **vòng nhịp** của vệt cháy và mây độc của chưởng, hạt độc xoáy của chiêu Vạn độc, tàn lửa, khói, bong bóng bay lên.
- Lúc vũng mới hiện (lớn dần) và lúc sắp tắt (nhấp nháy, co lại) giữ như cũ. Riêng vũng của quái: hình code lúc sắp tắt tô thưa hàng, ảnh thì mờ còn 55%.
- Mây độc vẽ đè lên nhân vật nên dán ở độ đậm 60% để còn thấy em bé và quái bên dưới.
- Vệt cháy của cầu lửa dùng chung ảnh `hu-vung-lua` (ép dẹt 0,7 như hình code). Mây độc của chưởng dùng chung `hu-vung-doc` cho mặt sàn và `hu-may-doc` cho màn khói.
- Không có tệp nào thì từng chỗ vẽ bằng code y như cũ. Vũng hồi máu, vòng ngắm mưa tên, vũng hệ Băng của trang phục: không thuộc 7 vũng, giữ code.

## 3. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `tools/tach-hieu-ung/index.html` | Thêm 7 mục ở cuối bảng `HU`, thêm 2 dòng ở cuối `LO_GOP`. Không sửa gì khác. |
| `game/js/fx_he.js` | `drawHeZone` (vũng lửa, vũng độc của em bé) và `drawCloud` (mây độc) hỏi ảnh trước khi vẽ code. |
| `game/js/fx.js` | Hàm `pool` (vũng của quái) hỏi ảnh trước; viền nóng vẫn gọi như cũ. |
| `game/js/fx_chuong.js` | `drawVet`, `drawMay` dùng chung ảnh; thêm hàm nhỏ `anhVung`. |
| `game/dist/*` | Do `build.py` tạo lại. |
| `docs/review/hieu-ung-b4/` | `PROMPT.md`, báo cáo này, `kiem.py`, `ket-qua.json`, 2 ảnh kiểm. |

Không đổi bản lưu, đăng nhập Google, lưu mây, luật chơi. Không thêm chữ nào hiện cho người chơi. Không thêm ảnh vào `game/art/custom`. Không sửa `fx_anh.js`, `sprite_custom.js`, `build.py`, cũng không đụng tệp của phiên D3 và C4.

## 4. Kết quả kiểm

Một lượt Playwright (`kiem.py`, số liệu ở `ket-qua.json`), chạy lại lần cuối trên đúng bản đã đẩy, so với bản ngay trước nó.

| Tiêu chí của brief | Kết quả |
|---|---|
| `node --check` mọi tệp JS, bài kiểm lưu mây, `python3 game/build.py` | **Đạt** |
| Dải mẫu máy vẽ → trang tách ĐẠT | **Đạt.** 7 dải lẻ và 2 tấm lô gộp (3 hàng + 4 hàng) đều ĐẠT ở cỡ màn iPhone; tệp có độ nét gấp đôi, đúng cỡ; vũng rộng đúng "khung − 4"; trang không cuộn ngang, không lỗi. |
| Prompt cũ không bị phá | **Đạt.** 105 bản prompt cũ (mục lẻ, bản theo hệ, 14 lô gộp) không đổi một chữ; bản mới thêm 9 (7 lẻ + 2 lô). |
| Không có tệp → so ảnh = 0 khác | **Đạt.** Phòng có 8 vũng, bản trước và bản này: **khác 0 điểm ảnh** (ảnh 960×540). |
| Nạp tạm vào game, chụp 844×390 | **Đạt.** Cả 7 ảnh mẫu hiện đúng chỗ; lớp hiệu ứng không báo lỗi, kể cả lúc vũng tắt dần. Ảnh ở `anh-kiem.png`. |
| Bán kính vẽ = bán kính luật | **Đạt, lệch 0 ở cả 9 chỗ đo** (bảng dưới). |
| Bot ải 1, nhật ký sát thương trùng bản trước | **Đạt.** Thắng sau 182,2 giây, máu 100/100; 195 dòng sát thương trùng từng dòng (cùng mã băm `5f5f38c467443b05`, cũng là mã của Đợt 8). |
| Workflow đăng trang | **Xanh** cho bản game và trang công cụ (lượt 197). |

Số đo bán kính, đo trên ảnh chụp game (điểm ảnh game):

| Chỗ đo | Ảnh | Bán kính luật | Bán kính vẽ ra |
|---|---|---|---|
| Vũng lửa em bé | `hu-vung-lua` | 18 | 18,00 |
| Vũng độc em bé | `hu-vung-doc` | 25 | 25,00 |
| Mây độc trên vũng độc | `hu-may-doc` | 25 | 25,00 |
| Vệt cháy của chưởng | `hu-vung-lua` | 13 | 13,00 |
| Mây độc của chưởng (mặt sàn) | `hu-vung-doc` | 35 | 35,00 |
| Vũng lửa của quái | `hu-vung-quai-lua` | 24 | 24,00 |
| Vũng độc của quái | `hu-vung-quai-doc` | 34 | 34,00 |
| Vũng nước lạnh của quái | `hu-vung-quai-bang` | 15 | 15,00 |
| Vũng đỏ của quái | `hu-vung-quai-do` | 24 | 24,00 |

Ảnh:

- `anh-kiem.png`: trên là hình code (chưa có tệp), dưới là cùng cảnh khi nạp tạm 7 tệp mẫu; bên phải là ảnh chụp màn hình 844×390 và bảng đo.
- `anh-kiem-trang-tach.png`: trang tách ở cỡ màn iPhone, một mục lẻ và hai lô gộp.

Giới hạn của lượt kiểm, nói rõ để bạn biết:

- Hình mẫu là hình elip một màu **chói** do máy vẽ, để máy đo được bề ngang. **Chưa thử với ảnh thật của ChatGPT.** Số "lệch 0" chỉ đúng khi vũng là phần rộng nhất của hình và chiếm hết bề ngang.
- Tám vũng được đặt thẳng vào phòng để chụp và đo, không qua đánh thật. Bot ải 1 thì chơi thật, nhưng ải 1 hầu như không có vũng nên phần này chỉ chứng minh luật chơi không đổi.
- Chưa đo tốc độ khung hình khi có nhiều vũng bằng ảnh. Mỗi vũng là một lần dán ảnh, nhẹ hơn hình code của vũng quái (vẽ từng hàng điểm ảnh), nên tôi không chờ đợi bị chậm, nhưng đó là suy luận, chưa đo.

## 5. Dung lượng

- Thêm vào game ở làn này: **0 KB** ảnh. Bốn tệp JS dài thêm khoảng 3 KB.
- Ước khi có đủ 7 dải thật ở độ nét gấp đôi: khoảng **0,4 MB** (7 × 57 KB; 57 KB là cỡ trung bình của 18 tệp hiệu ứng đang có trong game). Có thể tới 0,7 MB vì Vũng độc và Mây độc có khung to 96×96.
- Bản gói game hiện 10,1 MB; trần 20 MB của Đợt 10 còn xa.

## 6. Những chỗ tự quyết (cần bạn biết)

1. **Khung 6 khung cho cả 7 vũng** (brief cho 4 đến 6) để xếp chung lô được. Hai lô chia theo màu nền: 3 vũng nền xanh dương, 4 vũng nền hồng tím.
2. **Cỡ khung cộng thêm 4 điểm** so với "đường kính lớn nhất" trong brief. Trang tách luôn chừa 2 điểm lề mỗi bên; cộng thêm thì vũng to nhất được dán đúng tỉ lệ 1:1, không bị phóng to.
3. **Vũng độc và mây độc làm khung 96** vì dùng chung cho mây độc của chưởng (bán kính tới 46 khi em bé Đô Vật nâng hết bậc). Vũng độc của vũ khí chỉ rộng 25 nên ảnh bị thu nhỏ khoảng một nửa; chi tiết nhỏ trong ảnh sẽ khó thấy ở vũng nhỏ. Nếu sau này thấy xấu, cách sửa là tách thêm một dải riêng cho mây của chưởng.
4. **Vũng đỏ của quái** hiện không có đòn nào dùng. Vẫn làm mục và chỗ móc vì brief ghi đủ 4 vũng của quái. Bạn có thể **bỏ qua hàng này** khi xem ảnh; tấm 1 vẫn gen đủ 3 hàng cho khỏi phải sửa lô.
5. **Mây độc tả là các cụm khói tròn, dày**, không phải dải sương mảnh như hình code. Lý do: lúc thử, trang tách coi vạch ngang mảnh và dài là đường kẻ lưới rồi xoá mất. Tôi không được sửa cách tách của trang trong làn này nên đổi cách tả.
6. **Mây độc đậm 60%, vũng quái sắp tắt mờ 55%**: hai con số tôi chọn theo mắt trên hình mẫu. Đổi được trong code (một số mỗi chỗ).
7. **Ảnh thay cả lưỡi lửa và bong bóng** trong vũng (trước vẽ bằng code), vì ảnh đã có lưỡi lửa, bong bóng của nó; vẽ chồng thì rối.

## 7. Rủi ro còn lại

- **Ảnh thật có thể lệch cỡ** nếu ChatGPT vẽ lưỡi lửa hay gai thò ra ngoài mép vũng: khi đó vũng bị dán nhỏ hơn vùng gây sát thương. Prompt đã dặn; `PROMPT.md` có 3 điều nên nhìn lại trước khi tải. Chỉnh được bằng ô "Cỡ trong game" trên trang tách.
- **Tấm 2 xếp 4 hàng**, hai hàng khung 96 chỉ được vẽ to khoảng 1,9 lần cỡ game (các lô cũ thường 4 lần). Vũng là hình đơn giản nên tôi cho là đủ; nếu mờ thì gen lẻ hai mục đó.
- Vũng lửa trên nền xanh dương, vũng nước lạnh trên nền hồng tím: đã chọn nền theo quy ước của B2, B3, chưa thử tách ảnh thật.

## 8. Cách quay lui

- Chưa có tệp ảnh thì không có gì để quay lui: game đang vẽ y như trước (đã so, khác 0 điểm ảnh).
- Có ảnh rồi mà không thích: **xoá tệp `hu-vung-*.sprite.json` / `hu-may-doc.sprite.json`** của vũng đó khỏi `game/art/custom`, vũng ấy về hình code. Mỗi vũng một tệp, bỏ riêng từng cái được.
- Bỏ hẳn phần code: `git revert 0579c2a` (game) và `git revert d5cf4a7` (trang công cụ), rồi chạy `python3 game/build.py`.

## 9. Quyết định mới cần bạn duyệt

1. Có giữ **Vũng đỏ của quái** không (điểm 4 mục 6)? Mặc định: giữ, không tốn gì.
2. Vũng độc dùng chung một ảnh cho vũng nhỏ của vũ khí và mây to của chưởng (điểm 3 mục 6). Mặc định: dùng chung; xem ảnh thật rồi mới tính tách.
3. Mây độc đổi dáng từ dải sương sang cụm khói tròn (điểm 5 mục 6). Mặc định: theo cụm khói tròn.
