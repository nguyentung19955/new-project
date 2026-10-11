# Báo cáo Đợt 5 — Vũ khí khớp tay thân AI (2b), điểm neo đỉnh đầu cho 13 mũ (3a), tệp ghép cho Cu Tèo, Cái Bống, Cu Lì

Ngày 11/10/2026. Nhánh `khoi-tao-du-an`. Làm theo `dot-5-ghep-vu-khi.md`, `CHUNG.md`, mục II và IV của `QUYET-DINH-Q1-Q6.md`.

**Tóm tắt một câu:** cả 4 em bé nay cầm vũ khí đúng trong bàn tay của hình lúc lấy đà, lúc đánh và lúc trúng đòn (trước: vũ khí lệch khỏi tay tới 24 điểm ảnh, nay không quá 0,7); 13 mũ đã có điểm neo đỉnh đầu mà chỗ đặt mũ không đổi một điểm ảnh nào; ba em bé còn lại đã có tệp ghép nên đồ lưng và cánh không còn nhảy lên đầu. Đòn đánh không đổi: nhật ký sát thương của bot chơi ải 1 ở bản mới trùng từng dòng với bản trước.

**Điều anh cần biết trước:** để vũ khí nằm trong tay ở cả 3 kiểu chém, tôi phải **thêm hai trường tuỳ chọn** vào định dạng tệp ghép (`bam`, `bam_vk`). Brief cho phép thêm trường tuỳ chọn và yêu cầu ghi lại; chi tiết ở mục 2a và mục 8.

## 1. Danh sách tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/sprite_custom.js` | Mục chỉnh vũ khí trong tệp ghép đọc thêm `bam`, `bam_vk`. Thêm hàm `SC.khungVk` (khung ảnh AI đang vẽ và điểm neo của khung đó). |
| `game/js/hero_tinhlinh.js` | Thêm hàm `vkGhep`: đặt chỗ tay nắm vũ khí vào bàn tay của thân AI. Vệt chém đi theo hình vũ khí đang vẽ. Không đụng phần tính tư thế, đòn đánh. |
| `game/art/custom/ghep-smith.sprite.json` | Giữ nguyên số lưng, cánh, eo của Đợt 3. Thêm `dinh_dau`, `tay_truoc` theo khung và mục `cap` cho 4 loại vũ khí. |
| `game/art/custom/ghep-hunter.sprite.json`, `ghep-healer.sprite.json`, `ghep-wrestler.sprite.json` | **Tệp mới, chỉ có số, không có ảnh.** |
| 13 tệp `game/art/custom/tp-hats-*.sprite.json` | Chỉ chèn thêm `"diem":{"dinh_dau":[x,y]},"co_chuan":[rộng,cao]` vào cuối mục `trang_phuc`. Ảnh và mọi trường cũ giữ nguyên từng byte. |
| `tools/tach-ghep/index.html` | Trang Ghép đồ: chỉnh vũ khí theo từng khung, xuất tệp ghép gọn, đổi món thì chọn sẵn điểm chính. |
| `docs/review/ghep-trang-bi/DINH-DANG-GHEP.md` | Thêm mục 5 ghi các trường tuỳ chọn mới. |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Tệp do `python3 game/build.py` tạo lại. |
| `docs/review/ke-hoach-cai-thien/dot-5/` | Báo cáo này, ảnh (`anh/`), script và số đo (`kiem/`). |

Không đổi: cấu trúc bản lưu, tên và nghĩa các trường đã chốt của `.sprite.json`, quy chuẩn điểm neo, mọi ảnh, `vu_khi.cam/mui/day` của tệp vũ khí, đòn đánh, hitbox, thời gian. Không đụng `room_art.js`, `fx.js`, `fx_ky_nang.js`, `portal.js` (các phiên khác đang làm).

## 2. Tóm tắt thay đổi và lý do

### a. Vũ khí khớp tay (2b)

**Vì sao không dùng được chỉ `dx`, `dy`, `xoay` như brief gợi ý.** Hình thân AI lúc đánh là 6 khung **đấm thẳng tay ra trước**, không có khung giơ vũ khí lấy đà. Còn vũ khí thì đi theo bộ cử động của game: 10 đến 14 khung, 3 kiểu chém khác nhau, lại xoay theo 8 hướng đánh. Trong cùng một khung hình của thân, vũ khí ở nhiều chỗ khác nhau, nên một con số dời cố định cho mỗi khung không thể giữ vũ khí trong tay (brief mục 1.3 đã lường trước việc này).

**Cách làm.** Thêm trường tuỳ chọn `bam` (bám). Ở khung có ghi `"bam": "tay_truoc"`, game lấy **chỗ bàn tay nắm vũ khí** (kiếm, giáo, búa: đuôi chuôi; cung: điểm cầm) đặt đúng vào điểm `tay_truoc` của thân ở khung đó. Góc vũ khí vẫn là góc của đòn đang đánh, chỉ khác là xoay quanh bàn tay. Nhờ vậy cả 3 kiểu chém và 8 hướng đều nằm trong tay mà không cần số riêng cho từng kiểu. `dx`, `dy`, `xoay` vẫn dùng được để nhích thêm (hiện đều bằng 0).

Trường thứ hai `bam_vk` chọn điểm nào của vũ khí đặt vào tay. Chỉ dùng một chỗ: **cung lúc lấy đà** dùng `"day"` (tay kéo dây), vì ở tư thế lấy đà bàn tay còn thấy trên hình là tay đang kéo ra sau.

**Khung nào được chỉnh:** lấy đà (4 khung, game chỉ dùng khung cuối), đánh (6 khung), trúng đòn (4 khung), cho 4 loại vũ khí × 4 em bé. Đứng, chạy, lăn, ngã giữ như cũ (Đợt 3 đã xem là ổn).

**Chỉ là hình.** Tầm đòn, hitbox, thời điểm gây sát thương không đọc các số này. Riêng **vệt chém** (hiệu ứng vẽ) nay đi theo hình vũ khí đang vẽ, để vệt không tách khỏi lưỡi vũ khí.

### b. Điểm neo đỉnh đầu cho 13 mũ (3a)

Tôi **không** đo "giữa mép dưới vành mũ" như brief gợi ý, mà tính `dinh_dau` từ chính cách đặt đã duyệt: `dinh_dau = [0,5 − lech_x, −6 − lech_y]`. Đây là điểm của ảnh mũ mà cách đặt cũ vẫn đang để trùng đỉnh đầu. Lý do: 13 mũ đã được anh duyệt chỗ đặt; đo lại bằng mắt sẽ làm mũ xê dịch 1 đến 3 điểm ảnh so với bản đã duyệt. Cách này cho kết quả **không đổi một điểm ảnh nào** (đã so ở mọi khung, mục 3), và từ nay chỉnh được mũ theo từng khung. Ảnh soi từng mũ: `anh/mu-13.png`.

Riêng Vòng lá: điểm đỉnh đầu nằm **trên** mép ảnh 1 điểm ảnh (`[4,5; −1]`), vì vòng ôm quanh đầu chứ không phủ đỉnh đầu. Định dạng cho phép.

Chưa thêm điểm `gay` (gáy): có hai điểm chung thì game được phép co và xoay mũ nhẹ, có thể làm mũ khác bản đã duyệt. Để một điểm cho an toàn.

### c. Tệp ghép cho Cu Tèo, Cái Bống, Cu Lì

Làm như Đợt 3 đã làm cho Cu Tí. Điểm ở khung đứng đầu tiên lấy đúng chỗ game đang tự ước lượng, nên hàng đứng, lăn, ngã không đổi. Theo từng khung chạy, lấy đà, đánh, trúng đòn:

- **Đỉnh đầu:** chỗ gốc cộng độ dời đầu game tự đo (đã đối chiếu với một cách đo khác: phần lớn sai không quá 1, riêng hàng chạy của Cu Tèo tới 1,5).
- **Eo:** chỗ gốc cộng độ dời eo **đo trên Cu Tí**. Lý do: Đợt 3 đo eo theo chiếc quần xanh của Cu Tí; ba bé kia không có quần khác màu rõ (Cái Bống là bộ xương một màu, váy lá Cu Tèo trùng màu tóc), tôi đã thử đo theo màu và ra số sai. Bốn em bé vẽ cùng một khuôn tư thế nên dùng số của Cu Tí rồi soi mắt trên lưới.
- **Lưng, gốc cánh:** 60% độ dời đầu cộng 40% độ dời eo, như Đợt 3.
- **Bàn tay (`tay_truoc`):** đo trên hình, xem mục 5.

Kết quả thấy rõ nhất trên Cu Lì: trước đây cánh và gùi nhảy lên trên đầu lúc lấy đà và lúc đánh; nay nằm đúng sau lưng (`anh/ghep-wrestler-7-hang-truoc.png` so với `anh/ghep-wrestler-7-hang.png`).

### d. Trang Ghép đồ

- Thẻ **c. Chỉnh theo cặp**: cuối danh sách "Món đồ" có 4 loại vũ khí. Chọn Thân AI, chọn động tác và khung, bật ô "Vũ khí nằm trong bàn tay ở khung này", rồi kéo trên hình hoặc bấm mũi tên, nút Xoay để nhích. Số đang có trong game được nạp sẵn.
- Muốn dời cả bàn tay: thẻ **a. Điểm của thân AI**, chọn điểm "tay trước", chạm vào hình (có sẵn từ trước).
- Thẻ **b. Điểm của món đồ**: đặt `dinh_dau` của mũ bằng chạm đã có sẵn từ trước; nay đổi món là chọn sẵn điểm chính của món đó. Tải lại tệp mũ giữ nguyên ảnh và mọi trường cũ (đã kiểm).
- Nút "Tải tệp ghep-…" xuất tệp gọn như tệp trong game.

## 3. Kiểm thử theo tiêu chí nghiệm thu

"Bản trước" là bản ngay trước Đợt 5 (commit `e8a7cac0`).

| Tiêu chí | Kết quả | Cách kiểm |
|---|---|---|
| 16 bộ vũ khí: ở lấy đà cuối, đánh khung 0–1, trúng đòn, vũ khí nằm trong tay (lệch ≤ 1) cho ít nhất 12/16 | **Đạt 16/16.** Lệch lớn nhất 0,71 điểm ảnh (do làm tròn). Bản trước: 0/16, lệch 6 đến 24. | Đo khoảng cách giữa chỗ tay nắm của vũ khí game đang vẽ và điểm bàn tay của thân, ở mọi mức đà, 3 kiểu chém, 3 hướng đánh, nhiều thời điểm trong mỗi khung. Số ở `kiem/lech-tay.json`, bản trước ở `kiem/lech-tay-truoc.json`. Ảnh `anh/vu-khi-16.png`. **Lưu ý:** "bàn tay" ở đây là điểm tôi đo trên hình (mục 5), chưa có người duyệt. |
| Đánh khung 2–5 | Cũng nằm trong tay, lệch ≤ 0,71, cả 3 kiểu chém | Cùng phép đo |
| Số liệu đòn không đổi | **Đạt.** Chỉ số người chơi: 16 cấu hình (4 em bé × 4 vũ khí) giống hệt. Nhật ký sát thương (thời điểm, lượng, mục tiêu, khoảng cách) của bot chơi ải 1 **trùng từng dòng** giữa hai bản, cho cả 4 em bé với vũ khí quen tay (159, 198, 155, 100 đòn). | `kiem/kiem5.py c`. Hai bản chạy cùng hạt giống ngẫu nhiên. Có đối chứng: bản trước chạy hai lần cũng ra nhật ký trùng, nên phép so đáng tin. |
| Bot ải 1 vẫn thắng | **Đạt**, 4/4 em bé, thời gian bằng bản trước (162, 145, 150, 168 giây game) | Cùng lượt chạy |
| 13 mũ có `dinh_dau` | **Đạt**, 13/13 | |
| Ảnh và trường cũ trong tệp mũ không đổi (so byte) | **Đạt**, 13/13: bỏ đúng đoạn chèn thêm thì ra lại tệp gốc từng byte | `kiem/mu5.py` và phép so sau khi ghi |
| 13 mũ × Cu Tí ở khung đứng không lệch quá 1 điểm ảnh so với cách đặt cũ | **Đạt, lệch 0.** Cả 520 khung (13 mũ × 40 khung của 7 hàng) giống hệt bản trước từng điểm ảnh | `kiem/kiem5.py b`, `anh/mu-13.png` |
| 4 lưới 7 hàng không có lớp nào nhảy hay rụng | **Đạt theo soi mắt của tôi** trên 4 lưới. Lăn: mũ, cánh, đồ lưng ẩn ở các khung cuộn tròn (luật có từ trước). | `anh/ghep-<tên>-7-hang.png`, kèm bản trước `…-truoc.png` |
| Không có tệp `ghep-*` → game y hệt cũ | **Đạt: 0 ô khác.** Thân AI: 3.040 ô. Thân vẽ code: 5.168 ô. | Bản mới bỏ cả 4 tệp ghép so với bản trước bỏ tệp ghép: 4 em bé × (6 kiểu mặc + 13 mũ) × 7 hàng × mọi khung, so từng điểm ảnh (`kiem/kiem5.py a`) |
| Trang Ghép đồ: chọn vũ khí + khung, chỉnh, xuất tệp; nạp sẵn số đã có | **Đạt** | `kiem/congcu5.py`: nhích 1 điểm ảnh và xoay 5° ở "Đánh, khung 0" của kiếm trên Cu Tí, tải tệp về: số ghi đúng, các điểm và khung khác còn nguyên. Ảnh `anh/tach-ghep-vu-khi.png` |
| Trang Ghép đồ: đặt `dinh_dau` mũ bằng chạm, xuất tệp giữ nguyên ảnh và trường cũ | **Đạt** | Chạm đặt lại điểm của Mũ sừng, tải về: tệp chỉ khác đúng con số điểm neo, ảnh giống từng byte. Ảnh `anh/tach-ghep-mu.png` |
| `node --check` mọi tệp `game/js` | **Đạt** | |
| `python3 game/build.py` | **Đạt** | |
| `game/tests/cloud_save_regression.test.js` | **Đạt** | Đợt này không đụng bản lưu; chạy vì workflow có chạy |
| Workflow sau khi đẩy | Xem dòng cuối mục 9 | |

**Chưa kiểm:**
- Không chạy bộ kiểm dài (theo lời dặn). Chưa xem trên iPhone thật.
- Lưới và ảnh 16 bộ dùng vũ khí dòng 0, bậc Tím, không hệ. Các dòng và hệ khác dùng chung số (khoá theo loại), tôi chưa soi từng dòng.
- Đòn đặc biệt và Chưởng cũng dùng hàng đánh của thân nên vũ khí cũng bám tay theo cùng cách; **chưa đo và chưa có ảnh soi riêng** cho hai đòn này.
- Chưa kiểm với ảnh thân theo bộ (chưa có ảnh nào).
- Chỉ chụp trong trận thật 2 ảnh (`anh/trong-tran-smith.png`, `anh/trong-tran-wrestler.png`), chưa quay cả trận.

## 4. Ảnh

- `anh/ghep-smith-7-hang.png`, `ghep-hunter-7-hang.png`, `ghep-healer-7-hang.png`, `ghep-wrestler-7-hang.png`: **4 lưới 7 hàng** (bản mới). Mỗi em bé đội 1 mũ, 1 đồ lưng, 1 bùa, 1 cánh, cầm vũ khí quen tay.
- Cùng tên thêm `-truoc`: bốn lưới đó ở bản trước.
- `anh/vu-khi-16.png` và `vu-khi-16-truoc.png`: 16 bộ em bé × vũ khí ở lấy đà, đánh khung 0, 1, 3, trúng đòn; có ghi độ lệch đo được.
- `anh/mu-13.png`: 13 mũ phóng to có chữ thập ở điểm đỉnh đầu, cạnh Cu Tí đội mũ ở bản trước và bản mới.
- `anh/tach-ghep-vu-khi.png`, `anh/tach-ghep-mu.png`: trang Ghép đồ.
- `anh/trong-tran-smith.png`, `anh/trong-tran-wrestler.png`: chụp trong trận thật lúc đang ra đòn.

## 5. Số đo

**Vũ khí lệch khỏi tay nhiều nhất (điểm ảnh game), trước → sau:**

| | Kiếm | Cung | Giáo | Búa |
|---|---|---|---|---|
| Cu Tí | 20,9 → 0,7 | 18,1 → 0,7 | 19,5 → 0,7 | 24,2 → 0,7 |
| Cu Tèo | 20,2 → 0,7 | 18,6 → 0,7 | 18,5 → 0,7 | 23,2 → 0,7 |
| Cái Bống | 19,5 → 0,7 | 19,7 → 0,7 | 18,5 → 0,7 | 22,8 → 0,7 |
| Cu Lì | 20,9 → 0,7 | 18,8 → 0,7 | 19,5 → 0,7 | 24,2 → 0,7 |

**Điểm bàn tay (`tay_truoc`) đã ghi vào tệp ghép** (ngang, dọc tính từ chân; ngang dương là phía trước mặt, dọc âm là lên):

| | Đứng | Lấy đà | Đánh (6 khung) | Trúng đòn (4 khung) |
|---|---|---|---|---|
| Cu Tí | 5,5; −9 | −5; −11,5 | 11,5…12,5; −11,5…−11 | 1,5; −14…−13,5 |
| Cu Tèo | 4,5; −9,5 | −5; −10 | 11,5…12,5; −12…−11,5 | 1,5; −12,5 |
| Cái Bống | 4,5; −8,5 | −5; −10,5 | 11,5…12,5; −12,5…−12 | 0,5…1,5; −12,5…−12 |
| Cu Lì | 5,5; −7,5 | −3,5; −10 | 11,5…12,5; −13…−11,5 | 1,5; −12,5…−12 |

Cách đo: đứng, chạy, đánh, trúng đòn lấy điểm xa nhất về phía trước trong dải hàng của cánh tay rồi lùi vào 1,5 điểm ảnh (viền cộng nửa nắm tay); sau đó soi lại trên ảnh phóng to từng khung. **Hàng lấy đà đặt bằng tay** vì ở tư thế chúi người, tay phía trước bị đầu che; tôi lấy bàn tay đang kéo ra sau (bàn tay còn thấy trên hình).

**Thật thà về độ chính xác:** các điểm bàn tay, lưng, eo của ba em bé là do tôi đo và soi mắt, sai số khoảng 1 điểm ảnh, **chưa có người duyệt** (trong tệp để `da_chinh: false`). Con số "lệch ≤ 0,7" nói vũ khí bám đúng điểm bàn tay đã ghi, không nói điểm đó đã đúng tuyệt đối với hình.

**Tốc độ:** vẽ một em bé tốn thêm khoảng 1 đến 2 phần triệu giây (từ 89 lên 90,5), không đáng kể.

## 6. Điều phát hiện khác với brief

1. **Brief ghi "Cu Tí đã có `dinh_dau`"**, thực ra tệp `ghep-smith` của Đợt 3 chưa có điểm này (game tự ước lượng). Nay đã thêm cho cả 4 em bé.
2. **Phần đọc `cap` cho vũ khí và khoá theo loại (`vk-sword`…) đã có sẵn trong game** từ phiên ghep-loi, nhưng tra theo khung của khung xương code, không phải khung ảnh AI. Nay trên thân AI tra theo khung ảnh AI, đúng như brief viết (`tele:3`, `atk:0`). Trước Đợt 5 chưa tệp nào dùng mục này nên không ảnh hưởng gì.
3. **Thân AI lúc đánh là đấm thẳng tay, không có khung lấy đà.** Vì vậy ở hai khung đầu của đòn chém, kiếm dựng lên từ nắm tay đang duỗi ra trước và lưỡi kiếm đi ngang qua đầu, mặt em bé (thấy ở hàng đánh, khung 0 và 1 trên lưới). Vũ khí đúng là nằm trong tay, nhưng tư thế tay và đường vũ khí vẫn chưa "ăn" nhau hoàn toàn. Muốn đẹp hẳn phải vẽ lại hàng đánh của thân (lựa chọn c ở Đợt 3).
4. **Ở lấy đà, vũ khí nằm trong bàn tay kéo ra sau**, không phải tay phía trước, vì hình không vẽ tay phía trước. Với kiếm, búa trông hợp lý (giơ vũ khí ra sau lấy đà). Giáo nằm ngang qua người như trước. Cung: tay kéo ra sau là tay kéo dây, thân cung ở trước mặt.
5. **Bốn mũ khởi đầu** (trùm sừng nhỏ, trùm chóp nhọn, trùm mầm lá, trùm quấn khăn đỏ) không phải món đồ mặc được trong game, nhưng vẫn là tệp `tp-hats-*` nên cũng đã có điểm neo và đã kiểm.

## 7. Rủi ro còn lại

- **Các điểm đo bằng mắt chưa được duyệt** (mục 5). Nếu anh thấy khung nào vũ khí chưa đúng tay, mở trang Ghép đồ là chỉnh được ngay, không cần sửa code.
- **Nắm tay nhỏ vẽ đè lên chuôi:** game vẫn vẽ một nắm tay nhỏ (4×4 điểm ảnh, chấm sáng) trên chuôi vũ khí như trước; nay nó đi theo về đúng bàn tay của hình. Trên vài em bé màu chấm này hơi lệch tông với màu da của hình. Có từ trước, không phải do đợt này.
- **Vệt chém** nay bám theo hình vũ khí đang vẽ nên dời đi vài điểm ảnh so với trước (chỉ là hình). Loại đòn nào đã có vệt bằng ảnh AI riêng thì không bị ảnh hưởng. Chưa có ảnh soi riêng cho vệt chém.
- **Giáo quét vòng** không bám tay (hình giáo bị ép bẹt theo chiều ngang, bám vào sẽ sai). Giữ như cũ.
- **Mũi tên, chưởng, vùng đòn** vẫn xuất phát từ chỗ cũ theo lối chơi; hình cung nay thấp hơn khoảng 5 điểm ảnh nên mũi tên có thể rời dây lệch vài điểm ảnh so với hình cung. Rất nhỏ, chưa soi kỹ.
- **Eo của ba em bé** lấy theo số của Cu Tí (mục 2c). Bùa ở eo có thể lệch 1 đến 2 điểm ảnh ở vài khung.
- **Lăn, 3 khung đầu và cuối:** mũ lệch khoảng 2 điểm ảnh như Đợt 3 đã ghi. Chưa sửa (nay sửa được bằng `diem_theo` cho hàng `ne`, nhưng cần soi kỹ nên để lại).
- Phiên khác chạy song song: đã kéo bản mới nhất (có hiệu ứng B3) trước khi gói và chạy lại toàn bộ phép so trên bản đó.

## 8. Quyết định mới cần anh duyệt

1. **Hai trường tuỳ chọn mới `bam` và `bam_vk` trong tệp ghép** (mục 2a; ghi ở mục 5 của `DINH-DANG-GHEP.md`). Brief cho phép thêm trường tuỳ chọn, nhưng đây là thay đổi về định dạng nên xin anh xác nhận giữ. Nếu không giữ: xem cách quay lui.
2. **Ở lấy đà, vũ khí nằm trong tay kéo ra sau** (mục 6.4). Giữ, hay muốn vũ khí ở trước ngực? Đổi được bằng trang Ghép đồ, không cần code.
3. **Hai khung đầu của đòn chém, lưỡi kiếm đi qua mặt em bé** (mục 6.3). Ba hướng: (a) giữ; (b) ở hai khung đó xoay thêm vũ khí cho chĩa ra trước (làm được bằng `xoay` trong trang Ghép đồ, nhưng 3 kiểu chém dùng chung một số xoay); (c) vẽ lại hàng đánh của thân có khung lấy đà. Tôi chưa tự chọn (b) vì nó đổi dáng đòn đã quen mắt.
4. **Duyệt các điểm đo** của 4 tệp ghép (hiện `da_chinh: false`): xem 4 lưới, khung nào chưa ưng thì chỉnh trên trang Ghép đồ.
5. **Mũ lệch 2 điểm ảnh ở vài khung lăn**: có muốn sửa không (nay đã có đủ công cụ).

## 9. Cách quay lui

Mỗi phần một commit riêng, quay lui độc lập được (theo thứ tự ngược nếu quay lui nhiều phần):

| Phần | Commit | Lệnh |
|---|---|---|
| Trang Ghép đồ | `1c8687ac` | `git revert 1c8687ac` |
| Tệp ghép 4 em bé (vũ khí bám tay, đồ lưng ba bé) | `7ee3b6e9` | `git revert 7ee3b6e9` |
| Điểm neo 13 mũ | `cbcb603c` | `git revert cbcb603c` |
| Code game đọc `bam` | `e1ee58c0` | `git revert e1ee58c0` (quay lui `7ee3b6e9` trước) |

- **Cách nhanh không cần quay lui code:** xoá tệp `game/art/custom/ghep-<tên>.sprite.json` của em bé nào thì em bé đó về y như trước Đợt 3 và Đợt 5 (đã kiểm: 0 điểm ảnh khác). Muốn chỉ bỏ phần vũ khí mà giữ đồ lưng: xoá mục `"cap"` trong tệp ghép đó.
- Sau mỗi lệnh `git revert` hoặc sau khi xoá tệp: chạy `python3 game/build.py`, rồi `git add game/dist tools/xuong-sprite/index.html` (nếu `git revert` báo xung đột ở `game/dist` thì cũng làm vậy rồi tiếp tục).
- Không có gì trong bản lưu phải quay lui.

Workflow sau khi đẩy: ghi ở cuối tệp này sau khi chạy xong.

## 10. Chạy lại phần kiểm

Thư mục `kiem/` (cần Playwright; `python3 -m http.server 8801` trong `game/dist` của bản mới, cổng 8802 cho bản trước, cổng 8803 ở gốc repo cho trang công cụ):

- `layso.py`, `tay5.py`, `quan5.py`, `than5.py`, `do5.py`, `ascii.py`: đo trên tấm ảnh thân AI (đầu, eo, bàn tay; tờ soi phóng to; bảng điểm ảnh).
- `taoghep5.py`: tạo 4 tệp ghép từ số đo (chạy lại ra đúng 4 tệp đang có trong game).
- `mu5.py`: thêm điểm neo cho 13 mũ. `mu13.py`: ảnh soi 13 mũ.
- `luoi5.py`: 4 lưới 7 hàng, ảnh 16 bộ vũ khí, bảng độ lệch tay.
- `kiem5.py`: (a) không có tệp ghép thì y hệt cũ; (b) 13 mũ; (c) chỉ số, nhật ký sát thương, bot ải 1. Kết quả ở `ket-qua.json`.
- `congcu5.py`: thử trang Ghép đồ. `trongtran.py`: chụp trong trận.
- `so-game.json`, `quan5.json`, `diem-soi.json`, `lech-tay.json`, `lech-tay-truoc.json`: số đo của đợt chạy này.
