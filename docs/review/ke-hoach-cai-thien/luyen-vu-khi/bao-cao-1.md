# Báo cáo phiên 1 — Luyện vũ khí: luật, ví, chuyển bản lưu (16/10)

Làm đúng "Phiên 1" ở mục 5.2 của [THIET-KE.md](THIET-KE.md), theo lựa chọn của chủ game: **Q1-A** (trần ×5,7, giữ đường sức mạnh như nay), **Q2-A** (giữ máu +6%/cấp), **Q3-A** (luyện riêng từng món).

## Tóm tắt 1 phút

- **Luyện vũ khí 1 → 15 đã chạy được trong game**, bật sẵn. Mỗi vũ khí luyện riêng. Lần nào luyện cũng thành công, không tụt cấp, không bùa.
- **Ví còn 3 thứ dùng để luyện:** vàng, linh khí, **nguyên liệu rèn (NLR)**. Quặng, đá nâng bậc, bùa đều đổi thành NLR (1 / 2 / 6). Gỗ linh, Vảy cá, Đá lửa và mảnh trùm là "thành phần" của một số cấp.
- **Bản lưu cũ chuyển một lần** khi nạp (máy và mây như nhau), có chép bản gốc sang khoá sao lưu. 16 trường hợp của thiết kế ra **đúng từng cấp và từng đồng hoàn lại** như mô hình. **Không ai tụt Sức mạnh quá 7%** (thấp nhất −1,6%).
- **Cờ `?luyen=0`** về luật cũ y nguyên (bản lưu vẫn giữ đủ trường cũ, kể cả hình thái + hệ cũ của từng món).
- **Bỏ tụt bậc cho cả luật cũ**, ẩn bùa. Cờ `?tutbac=1` bật lại.
- **Sức mạnh** (và Lực chiến) tính theo cấp Luyện; mài và bậc ép cũ không còn cộng.
- **Bot chơi 8 lượt chiến dịch** (đã gồm luật trùm công bằng của tư vấn 2): **38 lần chơi, 179 phút**, so với luật cũ 39 lần, 184 phút. Không ải nào quá 9 lần.
- **Một chỗ khác thiết kế (cần chủ game biết):** trần trước Hồ Tinh là **12** (thiết kế 11), mảnh Hồ Tinh chuyển từ cấp 12 sang **cấp 13**. Giữ đúng bảng thiết kế thì bot kẹt cấp 11 cả vùng 3, ải 3-5 phải chơi 9,1 lần (quá trần 9), tổng 44 lần. Lý do và số ở mục 2.
- **Con số Sức mạnh đã gộp của tư vấn 2** và dòng "đổi gì" sau nâng cấp tính đúng theo cấp Luyện (ví dụ "Kiếm: đòn +1 sát thương").
- **Giao diện tối thiểu** để chơi được: Ông Thợ Rèn có một thẻ "Luyện" thay 4 thẻ cũ. Phiên 2 làm bảng đẹp.

---

## 1. Đã làm gì (theo 5 bước của mục 5.2)

### Bước 1 — `js/data.js`

- `G.LUYEN` (bảng 15 cấp đúng mục 1: M, vàng, linh khí, NLR, nguyên liệu vùng, mảnh trùm; chỉ khác: mảnh Hồ Tinh ở cấp 13 thay cấp 12), `G.LUYEN_TRAN` (**5/9/12/13/15** theo số trùm vùng đã hạ; thiết kế 5/9/11/13/15, xem mục 2), `G.QUY_DOI = { da: 2, bua: 6 }`, `G.AI_NGAY.ai.ren` (Ải Rèn: T2, T3, T4, T6, T7, CN; 14/19/25 NLR), thưởng mảnh lần đầu +2 (3 → 5).
- `G.LUYEN_BAT` (cờ `?luyen=0`). Khi bật: ải ngày còn **Ải Rèn + Ải Vàng**.
- Bỏ tụt bậc cho cả luật cũ: `G.EP_DO.tutTu = 99`, bùa không rơi ở trùm / Ải Đá Bậc, thương nhân không bán bùa, bảng Ép đồ ẩn ô bùa. `?tutbac=1` (`G.TUT_BAC`) bật lại y như trước.

### Bước 2 — `js/luyen.js` (tệp mới, nạp sau `hinh_thai.js`)

- `G.luyen.M(w)`, `gia(L)`, `tran(sv)`, `duoc(sv, w)`, `nang(sv, w, hệ)`, `hinhThai(L)`, `chonHe`, `datDong` (dòng Viên mãn).
- Hình thái theo cấp: 1–2 Trắng, 3–5 Mầm (chọn hệ), 6–11 Thành hình, 12–15 Thức tỉnh. Dấu ấn đặt đúng mốc nên mọi mã cũ đọc `G.wStage` và đặc trưng hệ chạy như cũ.
- `G.wBase` dùng M của cấp Luyện (từ cấp 9 tách ~6% sang phần phụ của loại, như ép đồ). `G.epDo.satThuong` trả 1.
- Phần phụ của loại từ cấp 9 (kiếm +10% tốc đánh, thương +12% tầm, búa +30% choáng, phi tiêu +20% sát thương xuyên và xuyên thêm 1 quái) và dòng Viên mãn cấp 15 (chí mạng +8% / trùm, tinh anh +16% / hồi chiêu đặc biệt −12%) đi qua đúng các móc có sẵn của `ep_do.js` (`E.phu`, `E.xuyen`, `E.dong`, `E.danh`).
- Khung ô vũ khí (ảnh `gd-o-ep-0..6`) đổi màu theo cấp Luyện như bảng mục 1. Số ở góc ô vẫn là 1–6, phiên 2 đổi sang 1–15.
- Nâng hệ bằng linh khí của luật cũ bị khoá khi Luyện bật (để không có đường nâng "lậu"). Đổi hệ vẫn tốn linh khí như cũ (20 / 60 / 120).

### Bước 3 — Ví

- `G.themNlr(sv, n)`, `G.themQuang(sv, n)` (cờ bật → NLR, tắt → quặng như cũ). `E.themDa` / `E.themBua` đổi ra NLR khi cờ bật.
- Đã đổi mọi chỗ cộng quặng / đá / bùa: `stage.js` (thưởng ải, phòng thử thách, rương báu, thương nhân, trùm), `ai_ngay.js`, `viec_ngay.js`, `so_yeu_quai.js`, `thanh_tuu.js`, `upgrade.js` (Bà Hàng Xén bán NLR 40 vàng / cái). Chữ thưởng ghi "nguyên liệu rèn".
- Thành tựu đổi điều kiện (giữ mã, đã nhận vẫn giữ): Mầm non = Luyện 3, Thức tỉnh = Luyện 12, "Tinh luyện" = Luyện 9, "Viên mãn" = Luyện 15, "Đủ bộ" = cả 4 món Luyện 6.

### Bước 4 — Chuyển bản lưu

Bọc `G.fixSave`, chạy **một lần** (cờ `sv.luyenChuyen = 1`), mọi đường nạp (máy, mây, Google) đều qua đây.

1. Trước khi chuyển: chép nguyên bản gốc sang khoá `linhkhi_save_v1_truoc_luyen` (đã có thì không ghi đè).
2. Cấp Luyện của mỗi món đúng mục 4.1 (M cũ +2,5% mỗi dòng ép → cấp gần nhất; thấp quá 7% thì +1; giữ hình thái nhưng không nhảy quá 2 cấp).
3. **Chốt chặn 7%:** sau khi đổi, tính Sức mạnh thật theo luật cũ và luật mới của chính bản lưu đó. Còn tụt quá 7% thì nâng thêm cấp cho món làm Sức mạnh tăng nhiều nhất.
4. Hoàn phần thừa từng món (vàng, linh khí, NLR), hoàn đủ lò rèn, đổi ví cũ ra NLR.
5. Món Trắng đổi lên từ cấp 3 trở lên thì được **chọn hệ miễn phí** ở lò.
6. Làng báo một lần, ví dụ: "Lò rèn đã gộp thành Luyện vũ khí. Kiếm → Lv 9. Hoàn: 2300 vàng, 96 nguyên liệu rèn, 6 gỗ linh, 6 vảy cá, 10 đá lửa. Quặng, đá, bùa đổi ra 76 nguyên liệu rèn."
7. **Đường lui:** trường cũ (`w.sharpen`, `w.ep`, `sv.ore`, `sv.daBac`, `sv.buaBac`, `sv.forge`) giữ nguyên. Hình thái + hệ của hai luật giữ riêng (`w.hcCu` khi đang chạy Luyện, `w.hcMoi` khi đang chạy luật cũ), nên tắt / bật cờ lúc nào cũng về đúng bản của luật đó.
8. **Lưu mây:** bản trên mây chưa chuyển thì sau khi nạp và chuyển, game đẩy ngay bản đã chuyển lên (một dòng trong `js/cloud.js`), máy khác nạp không phải chuyển lại.

### Bước 5 — Kiểm

| Bài | Kết quả |
|---|---|
| `node game/tests/luyen.test.js` (mới, 81 điều kiện) | **PASS**: 16 trường hợp + Rực lửa 4 dòng tốt + lò / ví + bản rỗng (6 kiểu) + bản hỏng + đường lui + luật + ví + Sức mạnh (cả số gộp của tư vấn 2) + thành tựu + lưu + giao diện + bot |
| `python3 game/tests/luyen_may.py` (mới, Firebase giả) | **PASS 10/10**: bản cũ trên mây, bản cũ trên máy, đăng nhập Google giữ tiến trình Luyện, `?cloud=0` lưu và nạp đúng |
| `node game/tests/cloud_save_regression.test.js` | PASS |
| `python3 game/tests/may.py` (lưu mây, Google) | Giống hệt bản trước khi sửa (phần Bảng vàng đã hỏng từ trước, không liên quan) |
| `python3 game/tests/smoke.py` | Không lỗi |
| `python3 game/tests/cay.py --node` (luật) | Đạt hết; phần luật đã thêm nhánh Luyện |
| `node tools/can-bang/tinh.js` | Bảng cũ in **y hệt** trước; thêm `--luyen` (mục 8, lấy logic từ `mo_hinh.js`, đọc thẳng `G.LUYEN`) ra 30 lượt (luật cũ 31) như thiết kế |
| `python3 game/tests/cay.py 8 --node --ngay=8 --viec` | 38 lần chơi, không ải nào quá 9 lần (mục 2) |
| Các bài `*.test.js` khác | Đạt như trước khi sửa. 4 bài đã hỏng từ trước (`so_yeu_quai`, `su_kien`, `thanh_tuu`, `viec_ngay`) vẫn hỏng đúng chỗ cũ, không liên quan Luyện |

**Bảng 16 trường hợp** (kiếm của bản lưu cũ, Zed cấp 20; Sức mạnh cũ tính bằng `?luyen=0` trên cùng bản lưu):

| Vũ khí cũ | → Luyện (mô hình) | Hoàn vàng / LK / NLR | Sức mạnh cũ → mới |
|---|---|---|---|
| Trắng +0 Trắng | 1 (1) | 0 / 0 / 0 | 165 → 165 (0%) |
| Trắng +3 Xanh lam | 3 (3) | 150 / 0 / 3 | 183 → 185 (+1,1%) |
| Mầm +2 Xanh lam | 3 (3) | 0 / 10 / 0 | 188 → 185 (−1,6%) |
| Mầm +5 Xanh lam | 5 (5) | 0 / 0 / 0 | 204 → 206 (+1,0%) |
| Mầm +6 Xanh lục | 6 (6) | 21 / 0 / 0 | 213 → 221 (+3,8%) |
| Thành hình +3 Xanh lam | 6 (6) | 0 / 60 / 0 | 207 → 221 (+6,8%) |
| Thành hình +6 Tím | 8 (8) | 0 / 0 / 0 | 235 → 247 (+5,1%) |
| Thành hình +9 Tím | 9 (9) | 0 / 0 / 0 | 252 → 254 (+0,8%) |
| Thành hình +10 Vàng | 11 (11) | 0 / 0 / 0 | 264 → 279 (+5,7%) |
| Thành hình +12 Vàng | 11 (11) | 310 / 0 / 0 | 275 → 279 (+1,5%) |
| Thức tỉnh +10 Vàng | 12 (12) | 0 / 170 / 0 | 286 → 306 (+7,0%) |
| Thức tỉnh +15 Vàng | 14 (14) | 0 / 0 / 0 | 313 → 330 (+5,4%) |
| Thức tỉnh +15 Đỏ | 15 (15) | 0 / 0 / 0 | 325 → 354 (+8,9%) |
| Thức tỉnh +15 Rực lửa | 15 (15) | 5.447 / 0 / 257 | 350 → 354 (+1,1%) |
| Thức tỉnh +0 Trắng | 6 (6) | 0 / 860 / 0 | 199 → 221 (+11,1%) |
| Trắng +15 Rực lửa | 12 (12) | 10.047 / 0 / 492 | 282 → 306 (+8,5%) |

Thêm: Rực lửa có 4 dòng ép tốt nhất (chí mạng, trùm, tốc đánh, sát thương chí mạng, chất lượng 1,2), Zed cấp 35: 526 → 493 (**−6,3%**, vẫn trong 7%).

---

## 2. Bot chơi thử và một chỗ chỉnh số

Đo bằng `python3 game/tests/cay.py 8 --node --ngay=8 --viec` (8 lượt chiến dịch, ải ngày, Việc hôm nay / Sổ / Thành tựu), cùng bản game sau tư vấn 2 (trùm công bằng, máu trùm tăng).

| | Luật cũ (`?luyen=0`) | Luyện, đúng bảng thiết kế | **Luyện, trần trước Hồ Tinh 12 (đã dùng)** |
|---|---|---|---|
| Lần chơi đi hết 15 ải | 39 | 44 (+13%) | **38** (−3%) |
| Thời gian | 184 phút | 216 phút | **179 phút** |
| Ải 3-5 | 5,1 lần | **9,1 lần (quá trần 9)** | **4,6 lần** |
| Lúc qua 3-5 | Sức mạnh 583, còn 1.866 vàng | 560, còn 8.706 vàng | 564, còn 3.538 vàng |

Số lần chơi từng ải (trung bình):

- Luật cũ: `1 · 1 · 2,4 · 1,1 · 2,6 | 1,5 · 3,1 · 4,5 · 1,4 · 4,6 | 1,6 · 2,2 · 4,5 · 2,0 · 5,1`
- Luyện (đã dùng): `1 · 1 · 2,5 · 1,8 · 3,4 | 1 · 4,4 · 3,1 · 2,2 · 4,5 | 1,2 · 1,2 · 4,8 · 1,2 · 4,6`

**Vì sao đổi:**

- Mô hình của thiết kế cho rằng người chơi lên Thức tỉnh ngay trước 3-5. Bot thật (luật cũ) lên Thức tỉnh từ **3-2** và ép bậc Vàng từ 3-3.
- Giữ trần 11 và bắt cấp 12 chờ mảnh Hồ Tinh thì cả vùng 3 hai món đứng ở cấp 11. Vàng dồn tới 8.706 mà không có chỗ tiêu, ải 3-5 vượt trần 9 lần chơi.
- Cách chỉnh nhỏ nhất, vẫn giữ luật "cấp đầu tiên vượt mỗi mốc cần mảnh của trùm đó": trần sau Ngư Tinh là 12 (cấp 12 Thức tỉnh chỉ cần 10 Đá lửa của vùng 3), mảnh Hồ Tinh chuyển sang cấp 13. Các mốc cần mảnh nay là cấp 6, 10, 13, 14. M, giá và hình thái không đổi.
- Chủ game muốn giữ đúng bảng cũ thì sửa 3 chỗ trong `G.LUYEN` ở `js/data.js` (đã ghi chú ngay đó).

**Còn để phiên 3:** cuối vùng 1 (1-4, 1-5) chậm hơn luật cũ khoảng 1 lần chơi; vùng 2 nhanh hơn bù lại. Tổng vẫn dưới luật cũ nên phiên này không chỉnh.

---

## 3. Giao diện tối thiểu (phiên 2 làm đẹp)

Ảnh chụp tĩnh (không chơi tay): [xem-truoc-1.png](xem-truoc-1.png), tạo bằng `python3 game/tests/luyen_shots.py`.

- **Ông Thợ Rèn:** một thẻ "Luyện". Cột trái 4 vũ khí (Lv, chấm xanh khi luyện được). Cột phải: sức mạnh vũ khí ×M → ×M kế, đòn trước → sau, cấp mốc kế mở gì, giá, nút "Luyện lên N". Lên cấp 3 thì 3 nút "Luyện · Lửa / Độc / Băng". Có nút đổi hệ, "Cầm đầu", chọn dòng Viên mãn ở cấp 15. Bị chặn thì ghi "Cần hạ Mộc Tinh để luyện quá cấp 5".
- **Hành trang › Vũ khí:** cùng bảng (trong ải chỉ xem).
- **Thanh tài nguyên ở làng:** ô quặng hiện số NLR. **Bà Hàng Xén:** thẻ "NLR". **Ải ngày:** Ải Rèn dùng lại ảnh nút Ải Đá Mài.
- **HUD trong ải, màn kết quả:** thanh vũ khí ghi "Lv N"; dòng nhắc "Đủ đồ luyện Kiếm lên 7 ở Ông Thợ Rèn!".
- Tiếng Anh đủ chữ (Temper, Forge materials, Forge Trial, Perfected, Refined).

---

## 4. Cần biết

- **Đổi kiểu chạy của 4 bài kiểm cũ** (không đổi nội dung kiểm):
  - `tests/thuong_luong.test.js`, `tests/thuong_luong_3c.test.js` và `tests/thanh_tuu.test.js` chạy với `?luyen=0`: hai bài đầu đo chiêu Thuồng Luồng theo diễn biến trận của bản lưu thử mài +15, bài sau kiểm thưởng đá / bùa / quặng của luật cũ. Luật Luyện có bài riêng.
  - `tests/vung4.test.js`: hạ Thuồng Luồng lần đầu nay được 5 mảnh (thưởng bảo đảm).
- `tests/setup.js` (`G.testSave`): mài / cấp hệ của bài kiểm cũ đổi ra cấp Luyện có M gần nhất (hoặc `o.luyen`), để các bài đo trùm vẫn đúng sức mạnh.
- **Đường lui và tiền hoàn:** vàng, linh khí, nguyên liệu vùng hoàn khi chuyển là ví chung, nên nếu tắt `?luyen=0` thì phần hoàn đó vẫn còn. Đây là chỗ thử nghiệm, phiên dọn sẽ chốt.
- **Chữ còn của luật cũ, để phiên 2:** gợi ý `G.HINTS` số 7 và 9, thẻ "Tài nguyên" ở Hành trang (tên ô vẫn là "Quặng" nhưng số là NLR), biểu tượng NLR riêng, ăn mừng 3 kiểu, số 1–15 ở góc ô.
- Đã kiểm bằng bot và chạy không giao diện (Node, ảnh tĩnh Playwright), **không chơi tay**.

## 5. Tệp đã sửa

- Mới: `game/js/luyen.js`, `game/tests/luyen.test.js`, `game/tests/luyen_may.py`, `game/tests/luyen_shots.py`, ảnh `xem-truoc-1.png`.
- Sửa: `game/index.html` (nạp `luyen.js`), `game/js/data.js`, `ai_ngay.js`, `cloud.js` (đẩy bản vừa chuyển), `ep_do.js` (ẩn bùa), `hanh_trang.js`, `mo_dan.js`, `so_yeu_quai.js`, `stage.js`, `su_kien.js`, `thanh_tuu.js`, `upgrade.js`, `viec_ngay.js`, `village.js`, `village_scene.js`; `tests/bot_nang.js`, `tests/cay.py`, `tests/setup.js`, 4 bài kiểm nói ở mục 4; `tools/can-bang/tinh.js` (`--luyen`); `game/dist` dựng lại.
