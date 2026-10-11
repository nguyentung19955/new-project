# Báo cáo Đợt 7 — Trạng thái dính độc / cháy / đóng băng hiện trên thân quái

11/10/2026 · nhánh `khoi-tao-du-an` · commit code: `61f6f971`

## Tóm tắt một đoạn

Quái dính độc thì cả thân ngả lục, cháy thì ngả cam và nhấp nháy, đóng băng thì ngả xanh nhạt có sương trắng phía trên; kèm vài hạt nhỏ bám thân (bong bóng độc, lưỡi lửa ở lưng, mảnh băng ở chân). Hàng chấm trạng thái nhỏ trên đầu quái đã bỏ. Biểu tượng tinh anh, biểu tượng vỡ giáp và thanh máu giữ nguyên. Có một cờ tắt, tắt thì game vẽ y như trước (đã so ảnh: 0 điểm ảnh khác).

**Còn một việc cần anh quyết (mục 8):** ô vuông có hình lửa / giọt độc / bông tuyết trên đầu quái **vẫn còn**. Đó là "dấu Linh Khí" (báo kết liễu con này sẽ được dấu ấn hệ nào), nằm ở tệp `linhkhi.js` của làn C2, ngoài phạm vi đợt này nên em không đụng. Nếu ý anh "không hiện trên đầu nữa" là gồm cả ô này thì cần một đợt nhỏ nữa.

## 1. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/sprite_custom.js` | Thêm `khungThan` (thân đã nhuộm, nhớ theo mã + khung + màu + mức), `naGiu` (chọn điểm ảnh giữ nguyên: viền, mắt, răng), `SC.dangQuai` (dáng thân để đặt hạt). `SC.veKhung` và `SC.veQuai` nhận thêm `o.than`. Không có `o.than` thì chạy y cũ. |
| `game/js/mobs.js` | Cờ `G.TRANG_THAI_TREN_THAN`, hàm `ttQuai` (chọn màu nhuộm, số hạt), `ttHat` (vẽ hạt sau/trước thân). Trong `A.enemy`: truyền `o.than`, vẽ hạt, và chỉ gọi `A.status` (hàng chấm trên đầu) khi cờ tắt. Không đụng hàm `icon()` (làn C2). |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Do `python3 game/build.py` sinh lại. |
| `docs/review/ke-hoach-cai-thien/dot-7/` | Báo cáo này, bài kiểm `kiem.py`, số đo `ket-qua.json`, ảnh trong `anh/`. |

`game/js/art.js`, `game/js/fx.js`: **không sửa**.

## 2. Đã làm gì và vì sao

**Nhuộm thân** (chỉ quái có ảnh AI; quái vẽ bằng code giữ y cũ):

| | Độc | Cháy | Băng |
|---|---|---|---|
| Màu | `#5aca02` | `#fe7d04` | `#9cfefa` |
| Mức hoà | **40%** (đặc tả đề xuất 35%, xem kết quả thử bên dưới) | 30–40%, chu kỳ 12 khung | 45% + sương trắng 20% ở 1/3 trên thân |

- Giữ nguyên, không nhuộm: viền `#14182e` và các cụm sáng nhỏ (mắt, răng, nanh).
- Hai trạng thái cùng lúc: chỉ nhuộm **một** màu theo thứ tự băng > cháy > độc; trạng thái vừa dính thì đè màu trong 6 khung đầu rồi trả về thứ tự trên.
- Hai khung đầu của chớp trắng trúng đòn: tắt nhuộm để chớp vẫn rõ. Quái chết: tắt nhuộm ngay, hạt co dần trong 6 khung.

**Hạt bám thân** (cỡ hạt = thân cao / 12, ít nhất 2 px; tổng không quá 6 hạt một con):

- Độc: 2–5 bong bóng lục viền đậm, lõi trắng ngà, nổi lên 1 px mỗi 4 khung, sống 24 khung rồi co lại.
- Cháy: 2–4 lưỡi lửa ba nấc màu ở vai và lưng, 3 khung lặp.
- Băng: 3 mảnh băng ở chân, đứng yên, thỉnh thoảng nhấp sáng. Khi **đông cứng hẳn** thêm 1–2 mảnh ở vai phía lưng.
- Phải bớt hạt thì bớt của trạng thái dính lâu nhất trước; đủ ba trạng thái thì băng 3 + cháy 2 + độc 1.

**Bỏ trên đầu quái:** hàng chấm lửa / chấm độc / chấm băng / vạch trói do `A.status` vẽ. **Giữ:** biểu tượng tinh anh, biểu tượng vỡ giáp `vo`, dấu "!" báo đòn, thanh máu.

**Cờ tắt một chỗ:** `G.TRANG_THAI_TREN_THAN` ở `game/js/mobs.js`. Đặt `false`, hoặc mở trang thêm `?than=0`, thì vẽ y như trước.

**Không đổi:** luật chơi, sát thương theo thời gian, thời lượng trạng thái, bản lưu, định dạng `.sprite.json`, ảnh trong `game/art/custom`.

### Giá trị [THỬ] trong đặc tả: đã thử và kết quả

| Giá trị | Kết quả |
|---|---|
| Độc 35% | Thử: Heo Rừng Con và Bọ Hung chênh sáng với sàn rừng chỉ 0,139 và 0,147 (yêu cầu ≥ 0,15). **Lấy 40%**: cả 5 con đo đều đạt (0,151 đến 0,251). Chưa cần tới 45% và viền nhấp nháy. |
| Cháy 35% dao động 30–40% | Giữ. Đọc được rõ. |
| Băng 45% không dao động | Giữ. |
| Vỡ giáp thành vết nứt trên thân | **Chưa thử.** Giữ biểu tượng `vo` trên đầu như đề bài cho phép. |

### Chỗ làm khác đặc tả (chọn cách ít rủi ro, ghi lại để anh biết)

1. **Mắt:** đặc tả ghi "điểm ảnh sáng ≥ `#e0e0e0` ở vùng đầu". Ảnh AI của quái không có điểm ảnh nào sáng tới mức đó (mắt, nanh ngả kem). Em đổi thành: mọi kênh màu ≥ 200 **và** nằm trong cụm nhỏ (≤ 1,5% diện tích thân). Nhờ vậy nanh heo, mắt, răng được giữ, còn mảng sáng to (bụng trắng) vẫn nhuộm.
2. **Vũ khí cầm tay:** ảnh quái là một tấm liền, không tách được vũ khí, nên vũ khí vẫn bị nhuộm theo thân.
3. **Bong bóng độc sau/trước thân:** đặc tả chia theo trái/phải của tâm. Hạt vẽ sau thân sẽ bị thân che hẳn, nên em đổi: hạt nằm trên thân vẽ trước (tránh 1/3 phía mặt), một hạt ở mép lưng vẽ sau thân để ló ra ngoài viền (chỉ khi có từ 3 hạt).
4. **Lửa:** đặt theo đường viền lưng thật của từng con thay vì cố định 25–45% chiều cao, để lửa bám lưng chứ không lơ lửng.
5. **Băng:** mới lạnh (chưa đông cứng) chỉ có 3 mảnh ở chân; đông cứng mới thêm mảnh ở vai. Lý do: để phân biệt hai mức.
6. **Trói:** không vẽ thêm gì. Lớp hiệu ứng sẵn có (`fx.js`) đã vẽ bẫy kẹp quanh chân.

## 3. Kiểm thử theo tiêu chí nghiệm thu

Chạy một lượt: `python3 docs/review/ke-hoach-cai-thien/dot-7/kiem.py <thư mục game bản trước>`. Số đo đầy đủ ở `ket-qua.json`.

| Tiêu chí | Kết quả |
|---|---|
| Ảnh 4 cột thường / độc / cháy / băng, quái thân cao ≈ 30 và ≈ 60, phóng 3× | **Đạt.** `anh/ba-trang-thai.png` (Nhím Gai Độc cao 30, Heo Rừng Nanh Dài tinh anh cao 51, Nấm Chúa cao 64). |
| Viền và mắt không đổi màu | **Đạt.** 6 loại quái × 3 màu × mọi khung đứng thở: 0 điểm ảnh viền khác, 0 điểm ảnh mắt/răng khác. |
| Hạt nằm trong hộp thân + 2 px, không hạt nào trước mặt | **Đạt.** 6 loại quái × 3 trạng thái × 40 khung: 0 điểm ảnh hạt ra ngoài, 0 điểm ảnh ở vùng mặt. |
| Hai trạng thái cùng lúc: nhuộm đúng ưu tiên, tổng hạt ≤ 6 | **Đạt.** `anh/hai-trang-thai.png`; bảng `so_hat` trong `ket-qua.json` (mọi tổ hợp đều ≤ 6, đủ ba thì 3 + 2 + 1). |
| Quái độc trên sàn rừng: chênh sáng ≥ 0,15 | **Đạt** ở mức 40%: 0,151 / 0,165 / 0,208 / 0,237 / 0,251. Sàn rừng đo được 0,186. |
| Trên đầu không còn biểu tượng trạng thái; còn biểu tượng tinh anh và thanh máu | **Đạt một phần.** Hàng chấm của `A.status` đã hết; tinh anh và thanh máu còn. **Chưa đạt theo nghĩa rộng:** ô dấu Linh Khí và con số tầng vẫn ở cạnh đầu (mục 8). |
| Ảnh phòng thật 844×390, ≥ 4 quái trạng thái khác nhau, nền Rừng | **Đạt.** `anh/phong-sau.png`: 7 quái (độc, cháy, lạnh, đông cứng, cháy + độc, băng + độc, băng + cháy) và 1 quái thường. |
| FPS 10 giây, phòng 6 quái cùng dính độc, trước / sau | **Đạt, không giảm.** Bảng dưới. |
| Cờ `false` → so ảnh với bản trước | **Đạt: 0 điểm ảnh khác** (ảnh phòng 844×390; hai lần chạy bản trước cũng ra 0 nên phép so không nhiễu). |
| `node --check game/js/*.js` | **Đạt.** |
| `python3 game/build.py` | **Đạt.** |
| `game/tests/cloud_save_regression.test.js` | **Đạt** (đợt này không đụng bản lưu; chạy vì workflow có chạy). |
| Chạy thử thật: bot đánh 900 khung ở ải Rừng, quái dính trạng thái theo luật chơi | **Đạt.** 0 lỗi trang, nhiều nhất 6 hạt một con. |
| Quái chết khi đang dính: nhuộm tắt, hạt tan trong 6 khung | **Đạt** (`luc_chet` trong `ket-qua.json`). |
| Workflow trên GitHub | **Đạt** (lượt 179, xanh). |

Không chạy bộ test dài, đúng lời dặn.

## 4. Ảnh trước / sau (`anh/`)

| Ảnh | Nội dung |
|---|---|
| `ba-trang-thai-truoc.png` | TRƯỚC: 3 loại quái × 4 trạng thái, trong phòng Rừng thật, phóng 3×. |
| `ba-trang-thai.png` | SAU, cùng cách chụp. |
| `ba-trang-thai-rieng-phan-moi.png` | Chỉ phần mới của đợt này trên nền phẳng (dễ nhìn màu nhuộm và hạt). |
| `hai-trang-thai.png` | Hai trạng thái cùng lúc và mức "mới lạnh". |
| `phong-truoc.png`, `phong-sau.png` | Phòng thật 844×390, cùng cảnh. |
| `phong-co-tat.png`, `ba-trang-thai-co-tat.png` | Cờ tắt: giống hệt bản trước. |

## 5. Số đo hiệu năng

Phòng Rừng, 6 quái cùng dính độc, máy chủ thử (Chromium không màn hình, không phải iPhone):

| | Bản trước | Bản sau, cờ tắt | Bản sau, cờ bật |
|---|---|---|---|
| Số khung mỗi giây trong 10 giây | 59,8 | 60,0 | 60,0 |
| Thời gian tính một khung, 5 lượt × 600 khung (ms) | 2,53 – 3,24 | 2,51 – 3,19 | 2,66 – 3,28 |

Chênh khoảng 0,1 ms mỗi khung, nằm trong mức dao động giữa các lượt đo, còn rất xa ngưỡng 16,7 ms của 60 khung/giây. Thân đã nhuộm được nhớ lại theo khung nên lúc vẽ vẫn chỉ dán một tấm ảnh cho mỗi con.

Dung lượng: không thêm ảnh nào vào game.

## 6. Rủi ro còn lại

- **Chưa xem trên iPhone thật.** Số FPS ở trên là của máy thử.
- **Hai lớp hiệu ứng chồng nhau.** Game vốn đã có lớp hiệu ứng trên thân ở `fx.js` (lưỡi lửa to, vệt độc chảy, tinh thể sương, khối băng khi đông cứng). Hạt mới của đợt này vẽ thêm bên cạnh, nên quái đang cháy hơi nhiều lửa. Em không sửa `fx.js` vì ngoài phạm vi. Xem `anh/ba-trang-thai.png` cột "cháy".
- **Trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh) chưa đổi:** vẫn hiện hàng chấm trên đầu, chưa nhuộm thân. Chỗ vẽ của trùm ở `boss.js` và `combat.js`, không nằm trong tệp được sửa.
- **Trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa) đổi một nửa:** thân đã nhuộm và có hạt (đã chạy thử với Nấm Chúa), nhưng hàng chấm trên đầu vẫn còn vì dòng vẽ đó nằm ở `combat.js`.
- **Vũ khí cầm tay của quái bị nhuộm theo thân** (mục 2, chỗ khác đặc tả số 2).
- **Quái thân rất tối** (Mèo Đen ở Lâu đài) nhuộm sẽ kém rõ hơn quái sáng; đợt này chỉ đo trên nền Rừng như đề bài.
- Mỗi loại quái lần đầu dính một trạng thái sẽ phải tính thân nhuộm cho từng khung hình một lần, sau đó dùng lại. Trong lượt đo FPS không thấy khung nào chậm bất thường vì việc này, nhưng em chưa đo riêng.

## 7. Cách quay lui

- Nhanh nhất, không cần đổi code: mở game với `?than=0`, hoặc đặt `G.TRANG_THAI_TREN_THAN = false` ở `game/js/mobs.js` rồi chạy `python3 game/build.py`. Game vẽ y như trước (đã so ảnh).
- Gỡ hẳn: `git revert 61f6f971` rồi `python3 game/build.py`.

## 8. Quyết định mới cần anh duyệt

1. **Ô dấu Linh Khí trên đầu quái** (ô vuông viền màu có hình lửa / giọt độc / bông tuyết, `js/linhkhi.js`). Nó chỉ hiện khi quái đang dính trạng thái, nên nhìn vào rất giống "biểu tượng trạng thái trên đầu". Lựa chọn:
   - a) Giữ như hiện nay: người chơi vẫn biết kết liễu con này được dấu ấn hệ nào.
   - b) Bỏ hẳn khi cờ bật: đầu quái sạch, nhưng khi quái dính hai trạng thái thì không còn biết sẽ được dấu ấn hệ nào (màu nhuộm theo thứ tự băng > cháy > độc, còn dấu ấn theo trạng thái dính sau cùng).
   - c) Thu nhỏ thành một chấm màu cạnh thanh máu.
   Việc này cần sửa `linhkhi.js` (đang thuộc làn C2).
2. **Con số tầng độc / tầng lạnh cạnh đầu quái** (do `fx.js` vẽ): giữ hay bỏ? Bỏ thì không còn biết quái đang mấy tầng độc.
3. **Giảm lớp hiệu ứng cũ ở `fx.js`** (lưỡi lửa to, vệt độc, khối băng) cho khỏi chồng với hạt mới, hay giữ cả hai?
4. **Trùm vùng và hàng chấm trên đầu trùm nhỏ:** có làm tương tự không (cần sửa `boss.js`, `combat.js`).
5. **Vỡ giáp thành vết nứt trên thân:** có muốn thử không, hay giữ biểu tượng trên đầu.
6. **Em bé khi dính trạng thái:** đợt này không đụng. Em bé hiện có lửa, vệt độc, sương của `fx.js` trên thân, chưa có nhuộm màu. Nên làm tương tự nếu anh thấy quái sau đợt này dễ nhìn hơn.
7. **Mức hoà Độc 40%** thay cho 35% của đặc tả: xin anh xác nhận.

---

Workflow: lượt chạy số 179 trên GitHub (commit `9ecfb568`, gồm cả code Đợt 7) **xanh**, game đã lên spiritblade.web.app. Dòng này được thêm bằng một commit chỉ sửa báo cáo.
