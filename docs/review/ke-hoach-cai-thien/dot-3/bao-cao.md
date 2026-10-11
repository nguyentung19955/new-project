# Báo cáo Đợt 3 — Ngoại hình theo áo của bộ (Q1) và kiểm chứng ghép đồ trên Cu Tí

Ngày 11/10/2026. Nhánh `khoi-tao-du-an`. Làm theo `dot-3-ngoai-hinh.md`, `CHUNG.md` và mục Q1, II, IV của `QUYET-DINH-Q1-Q6.md`.

**Tóm tắt một câu:** luật "mặc áo của bộ là đổi thân" đã xong và đã kiểm; mũ và đồ lưng trên Cu Tí đã khớp qua các hàng động tác (có sửa một lỗi đồ lưng nhảy lên đầu lúc đánh); **riêng thanh kiếm chưa đạt** ở ba hàng (lấy đà, đầu đòn đánh, trúng đòn) vì kiếm đi theo một bộ cử động khác với hình thân, việc này cần anh quyết định hướng sửa (mục 8).

## 1. Danh sách tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/outfit.js` | `O.look` ghi thêm `fx.bo_than` (bộ của áo đang mặc) và `fx.an_bo` (các món cùng bộ với áo). Giữ nguyên vầng sáng và thưởng "đủ 3 món" (`fx.aura`, thêm tên `fx.du_bo`, tên cũ `fx.bo` vẫn còn). Thêm cờ tắt `O.THAN_THEO_AO` và hai hàm nhỏ cho trang công cụ. |
| `game/js/sprite_custom.js` | `SC.boCua` chọn thân theo `bo_than`. Thêm `SC.anBo`: khi vẽ thân bộ chỉ ẩn lớp rời cùng bộ với áo. |
| `game/js/hero_tinhlinh.js` | Chỉ sửa 2 dòng ghi chú. |
| `game/art/custom/ghep-smith.sprite.json` | **Tệp mới, chỉ có số, không có ảnh.** Điểm neo đồ lưng, cánh, bùa của Cu Tí theo từng khung. |
| `tools/tach-ghep/index.html` | Trang Ghép đồ xem thử theo luật mới, nhận tệp thân theo bộ, có dòng nhắc luật, nạp sẵn tệp ghép đã có trong game. |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Tệp do `python3 game/build.py` tạo lại. |
| `docs/review/ke-hoach-cai-thien/dot-3/` | Báo cáo này, ảnh (`anh/`), script và số đo (`kiem/`). |

Không đổi: cấu trúc bản lưu, định dạng `.sprite.json`, quy chuẩn điểm neo, mọi ảnh trong `game/art/custom`. Không có tệp thân mô phỏng nào trong repo (thân mô phỏng chỉ tạo trong bộ nhớ lúc chạy thử).

## 2. Tóm tắt thay đổi và lý do

**a. Áo chọn thân (Q1).** Trước: phải mặc từ 3 món cùng bộ game mới tìm thân mặc sẵn. Nay: chỉ cần mặc **áo** của bộ (Rừng Già, Hang Biển, Lâu Đài) là game tìm thân `em-be-<nhân vật>-<bộ>`. Tháo áo là về thân gốc ngay.

**b. Ẩn lớp rời.** Khi đang dùng thân bộ, game chỉ ẩn mũ, đồ lưng, bùa **cùng bộ với áo** (vì đã vẽ sẵn trong thân). Mũ, đồ lưng, bùa khác bộ vẫn khoác rời. Cánh và vũ khí luôn khoác rời (đúng như `bo-trang-phuc/bao-cao.md`: thân bộ không vẽ cánh).

**c. Dự phòng.** Chưa có tệp thân của bộ đó thì game dùng thân gốc và khoác đồ rời như trước, áo chỉ hiện viền màu và dấu ngực. **Hôm nay chưa có tệp thân bộ nào, nên người chơi chưa thấy gì khác.** Đây là hành vi tạm cho tới khi có 12 ảnh thân.

**d. "Đủ bộ" không đổi.** Vầng sáng quanh chân và thưởng hệ khi mặc từ 3 món vẫn y như cũ. Hai khái niệm đã tách riêng: thân theo áo, vầng sáng theo số món.

**e. Tệp ghép cho Cu Tí.** Khi soi lưới 8 hàng, tôi thấy một lỗi có sẵn từ trước: lúc **đánh**, game tự đo nhầm phần thân cao lên 8 điểm ảnh, nên gùi, cánh, bùa nhảy lên ngang đầu (bùa đè lên mặt); lúc **trúng đòn** lệch 4–5 điểm ảnh; lúc chạy và lấy đà lệch 1–3. Brief cho phép sửa bằng tệp `ghep-smith`, nên tôi tạo tệp này. Số trong tệp ghi ở mục 5.

**f. Trang Ghép đồ.** Phần xem thử dùng đúng hàm của game nên ra cùng kết quả. Thả tệp `em-be-<tên>-<bộ>` rồi mặc áo của bộ là thấy thân mới. Có dòng chữ báo đang dùng thân nào và món nào bị ẩn.

## 3. Kiểm thử theo tiêu chí nghiệm thu

| Tiêu chí | Kết quả | Cách kiểm |
|---|---|---|
| Mặc áo bộ → thân đổi ngay, không cần mũ hay đồ lưng | **Đạt** (với thân mô phỏng) | Ảnh `anh/mo-phong-than-bo.png` bước 2; ảnh trong trận `anh/trong-tran-ao-rung-mo-phong.png` |
| Tháo áo → về đúng trạng thái theo đồ còn lại | **Đạt** | Bước 7: tháo áo, còn mũ + gùi + bùa → thân gốc, ba món hiện lại, vầng sáng đủ bộ vẫn còn |
| Mũ khác bộ vẫn hiện; mũ cùng bộ ẩn; không vẽ trùng | **Đạt** | Bước 3 (mũ rơm hiện), bước 4 (mũ sừng ẩn), bước 5 (hồ lô, bùa hút khác bộ và cánh vẫn hiện), bước 6 (đủ bộ: ẩn mũ, đồ lưng, bùa; còn cánh) |
| Chưa có tệp thân bộ → về thân gốc, không lỗi | **Đạt** | Ảnh `anh/du-phong-khong-tep.png` (8 bước, đều là thân gốc); bước 8: áo bộ Biển chưa có tệp |
| Chỉ số, hitbox không đổi | **Đạt** | 24 cấu hình (4 em bé × 6 kiểu mặc): mọi số của người chơi (máu, mana, giảm sát thương, tốc chạy, hệ số sát thương, bán kính va chạm…) ở bản mới **giống hệt** bản cũ. Có thân bộ hay không có thân bộ: số cũng giống hệt. Ví dụ ở bước 2 và 4 trong ảnh: máu và giảm sát thương in cạnh từng bước |
| Không có tệp mới → game y hệt cũ | **Đạt: 0 ô khác trên 960 ô** | Bản mới (tạm bỏ tệp ghép) so với bản cũ, 4 em bé × 6 kiểu mặc × 7 hàng × mọi khung, so từng điểm ảnh |
| Lưới 8 hàng Cu Tí với mũ + kiếm + đồ lưng | **Có ảnh**: `anh/ghep-cu-ti-8-hang.png` (sau), `anh/ghep-cu-ti-8-hang-truoc.png` (trước) | Bản lưu thử đi qua đường lưu thật của game rồi mở lại |
| Mũ không lệch quá 1 điểm ảnh | **Đạt** ở đứng, chạy, lấy đà, đánh, trúng đòn (lớn nhất 0,8). **Chưa đạt** ở 3 khung đầu và cuối của lăn (đo được khoảng 2; mắt thường khó thấy) | Đo đầu trên hình thân trần, so với chỗ game đặt mũ |
| Đồ lưng không lệch quá 1 điểm ảnh | **Đạt sau khi có tệp ghép** (trước: lệch tới 9,5 lúc đánh) | Mục 5 |
| Kiếm không lệch quá 1 điểm ảnh | **CHƯA ĐẠT** ở lấy đà, 2 khung đầu của đòn đánh, và trúng đòn | Mục 6 và mục 8 |
| Lăn phải ẩn mũ, cánh | **Đạt** | Hàng `ne` khung 2, 3, 4: mũ và đồ lưng ẩn |
| Ngã: đồ xoay cùng thân | **Đạt** | Hàng `die`: mũ và gùi xoay theo người |
| Thứ tự lớp | **Đạt** | Đồ lưng, cánh sau thân; mũ trước thân; soi trên lưới |
| `node --check` mọi tệp `game/js` | **Đạt** | |
| `python3 game/build.py` | **Đạt** | |
| `game/tests/cloud_save_regression.test.js` | **Đạt** (7 ca) | Đợt này không đụng bản lưu, chạy vì workflow có chạy |

**Chưa kiểm:** không chạy bộ kiểm dài (theo lời dặn). Chưa kiểm trên iPhone thật. Chưa kiểm với ảnh thân bộ thật vì chưa có ảnh nào. Ba em bé còn lại chỉ kiểm phần "y hệt cũ", chưa soi lưới ghép như Cu Tí.

## 4. Ảnh

- `anh/ghep-cu-ti-8-hang.png`: **lưới 8 hàng** (bản mới).
- `anh/ghep-cu-ti-8-hang-truoc.png`: cùng lưới trên bản trước khi sửa.
- `anh/truoc-sau-danh.png`: gùi, cánh, bùa lúc đánh và trúng đòn, trước và sau.
- `anh/mo-phong-than-bo.png`: 8 bước mặc và tháo với thân mô phỏng (thân Cu Tí tô xanh lá để dễ nhìn, không nằm trong game).
- `anh/du-phong-khong-tep.png`: cùng 8 bước khi chưa có tệp thân bộ (đúng như game hôm nay).
- `anh/trong-tran-ao-rung-mo-phong.png`, `anh/trong-tran-mu-gui.png`: chụp trong trận thật.
- `anh/tach-ghep-xem-thu.png`: trang Ghép đồ đang xem thân bộ mô phỏng.

## 5. Số đo và số đã sửa trong `ghep-smith.sprite.json`

Điểm ở khung đứng đầu tiên: `lung [-5, -12]`, `goc_canh [-4, -12]`, `eo [0, -9]`. Đây đúng là chỗ game đang tự ước lượng, nên các hàng đứng, ngã, lăn **không đổi một điểm ảnh nào** (đã so).

Bảng dưới là độ dời so với khung đứng (ngang, dọc; số dương là ra trước và xuống dưới).

| Khung | Game tự đo phần thân (trước) | Đồ lưng và cánh (mới) | Bùa ở eo (mới) |
|---|---|---|---|
| chạy 0–5 | (1…2, −2…−1) | (1,5…2,5, −1) | (−0,5…0,5, −1) |
| lấy đà 0–3 | (1, 0…1) | (4, 1,5) | (−1…0, 0,5) |
| đánh 0–5 | (1…2, **−8**) | (1…2, 1…1,5) | (−1…0,5, 0,5…1) |
| trúng đòn 0–3 | (−3…0, **3…4**) | (−5…−4,5, 1) | (0…0,5, −1) |

Cách tính số mới: đầu thì lấy số game đo (đã kiểm lại bằng cách đo riêng, sai không quá 0,8). Eo thì đo theo mép trên chiếc quần xanh của Cu Tí ở từng khung. Lưng trên nằm giữa cổ và eo nên lấy 60% độ dời của đầu cộng 40% của eo, làm tròn tới nửa điểm ảnh. Sau đó soi lại bằng mắt trên ảnh phóng to.

Lưu ý thật thà: số của đồ lưng là do tôi tính từ hình rồi soi mắt, **chưa có người duyệt** trên trang Ghép đồ. Nếu anh thấy khung nào chưa ưng, mở trang Ghép đồ, chọn Cu Tí là số này đã nạp sẵn để chỉnh tiếp.

## 6. Điều phát hiện khác với brief

1. **Thân AI của em bé chỉ có 7 hàng**, không có hàng `noi` (hàng đó chỉ người làng có). Hàng thứ 8 trong lưới là hình game dùng thay (đứng).
2. **Chưa có mũ ảnh AI nào có điểm neo `dinh_dau`.** Cả 13 mũ đều là lô cũ, đặt theo kiểu cũ. Tôi thử bằng Mũ sừng gỗ đặt kiểu cũ. Vì thế mũ không sửa được bằng `diem_theo`; muốn chỉnh mũ từng khung phải đặt điểm neo cho mũ trên trang Ghép đồ (việc đó sửa tệp món đồ đã duyệt nên tôi không tự làm).
3. **Hàng lấy đà (`tele`)**: trong game em bé chỉ dùng khung cuối của hàng này lúc giữ nút lấy đà. Lưới vẫn vẽ đủ 4 khung.
4. **Thanh kiếm đi theo bộ cử động vẽ bằng code, không theo hình thân AI.** Thân AI có 6 khung đánh kiểu vung tay, còn kiếm chạy theo 10 khung chém của bộ xương code (3 kiểu chém nối nhau). Kết quả:
   - **Lấy đà:** kiếm giơ sau lưng, không nằm trong tay.
   - **Đánh, khung 0–1:** kiếm giơ trên đầu trong khi tay của hình đang đưa ra trước. Khung 2–5 thì khớp tay.
   - **Trúng đòn:** kiếm lơ lửng cách người 4 điểm ảnh (0,2 giây mỗi lần trúng đòn).
   - Đứng, chạy, ngã, lăn: kiếm chạm người, nhìn ổn.
   
   Đây là giới hạn của cách dựng hiện tại, có từ trước đợt này. Theo luật 4 của `CHUNG.md` tôi dừng ở đây, không tự sửa. Lựa chọn ở mục 8.

## 7. Rủi ro còn lại

- **Vẽ trùng mũ khi có thân bộ thật.** Thân bộ vẽ sẵn mũ của bộ. Nếu người chơi mặc áo bộ Rừng cùng mũ rơm, game vẽ mũ rơm rời **đè lên** mũ đã vẽ trong thân. Với thân mô phỏng không thấy được vì thân mô phỏng không có mũ. Phải xem lại khi có ảnh thật (mục 8, câu 2).
- **Ô trống vẫn thấy đồ.** Chỉ mặc áo bộ thì thân bộ vẫn hiện mũ và đồ lưng của bộ dù ô mũ, ô lưng đang trống. Đây là hệ quả trực tiếp của Q1, chỉ số không bị ảnh hưởng.
- **Mặc 3 món cùng bộ nhưng không có áo** (mũ + lưng + bùa): theo luật cũ sẽ đổi thân, theo luật mới thì không (đúng Q1: áo là điều kiện). Vầng sáng đủ bộ vẫn hiện.
- **Ba em bé còn lại** (Cu Tèo, Cái Bống, Cu Lì) nhiều khả năng cũng bị đồ lưng nhảy lúc đánh như Cu Tí trước khi sửa. Chưa kiểm, chưa sửa (ngoài phạm vi đợt).
- **Lăn, 1 khung:** khung 4 của hàng lăn em bé đã đứng dậy nhưng mũ còn ẩn (khoảng 0,05 giây). Có từ trước.
- **Bùa lúc cuộn tròn:** có tệp ghép thì bùa ở khung lăn thứ 3 đổi 4 điểm ảnh so với trước. Rất nhỏ.
- Trang Ghép đồ: bảng "cách đặt từng món" vẫn liệt kê mũ cùng bộ dù hình không vẽ mũ đó trên thân bộ. Chỉ là chữ, hình đúng.
- Phiên khác chạy song song: tôi đã kéo bản mới nhất (có Đợt 2 mở rộng sân) rồi gói lại và chạy lại lưới, kết quả không đổi.

## 8. Quyết định mới cần anh duyệt

1. **Thanh kiếm chưa khớp tay ở lấy đà, đầu đòn đánh và trúng đòn.** Ba hướng:
   - (a) Giữ nguyên. Không tốn công. Đòn đánh chỉ 0,4 giây nên khó thấy; rõ nhất là lúc trúng đòn và lúc giữ lấy đà.
   - (b) Chỉnh hình kiếm theo từng khung bằng tệp ghép (mục `cap` cho `vk-sword`…). Sửa được lúc trúng đòn và lấy đà khá gọn. Riêng đòn đánh có 3 kiểu chém dùng chung số chỉnh nên chỉ sửa được một phần. Phải làm cho cả 4 loại vũ khí × 4 em bé. Chỉ đổi hình, không đổi đòn.
   - (c) Vẽ lại hàng đánh và lấy đà của thân AI cho khớp với đường kiếm. Đẹp nhất nhưng là việc vẽ ảnh mới.
   
   Tôi nghiêng về (b) cho trúng đòn và lấy đà trước, vì rẻ và quay lui được.
2. **Mũ khác bộ trên thân bộ:** khi có ảnh thân thật, nếu thấy hai mũ chồng nhau xấu thì chọn: (a) giữ luật hiện tại; (b) khi dùng thân bộ thì ẩn mọi mũ rời (mũ lẻ chỉ còn chỉ số); (c) vẽ thân bộ không có mũ. Chưa cần quyết ngay, chờ ảnh đầu tiên.
3. **Đặt điểm neo `dinh_dau` cho 13 mũ** trên trang Ghép đồ để chỉnh được mũ theo từng khung. Việc này sửa tệp món đồ đã duyệt (chỉ thêm số, không đổi ảnh) nên cần anh đồng ý.
4. **Làm tệp ghép cho 3 em bé còn lại** theo cùng cách đã làm cho Cu Tí.

## 9. Cách quay lui

- **Tắt luật áo chọn thân mà không cần quay lui code:** đổi `O.THAN_THEO_AO = true` thành `false` trong `game/js/outfit.js`, chạy `python3 game/build.py`. Game về luật cũ (đủ 3 món mới đổi thân, ẩn cả ba lớp rời).
- **Bỏ tệp ghép của Cu Tí:** xoá `game/art/custom/ghep-smith.sprite.json` rồi `python3 game/build.py`, hoặc `git revert db6539e4`.
- **Quay lui cả luật mới và trang công cụ:** `git revert 64db8760`.
- Sau mỗi lệnh `git revert`, nếu báo xung đột ở `game/dist` thì chạy `python3 game/build.py` rồi `git add game/dist tools/xuong-sprite/index.html` và tiếp tục.
- Không có gì trong bản lưu phải quay lui.

## 10. Chạy lại phần kiểm

Thư mục `kiem/`: `thu.py` (lưới 8 hàng), `kiem.py` (so từng điểm ảnh với bản cũ, so chỉ số, mô phỏng thân bộ), `quan.py` và `taoghep.py` (đo và tạo tệp ghép), `lib.js`, `ban-luu-thu.json` (bản lưu thử), `ket-qua.json` (số liệu đợt chạy này). Các script cần `python3 -m http.server` trong `game/dist` (cổng 8801 cho bản mới, 8802 cho bản cũ) và Playwright.
