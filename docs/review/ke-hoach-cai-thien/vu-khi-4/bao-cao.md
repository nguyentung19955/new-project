# Vũ khí 4 — đo lại Kiếm, Thương, Búa, Phi tiêu và 2 chỉnh nhỏ (16/10/2026)

Phiên `vu-khi-4`, nhánh `khoi-tao-du-an`. Chủ game đồng ý lúc 16/10 04:57. Không chơi thử bằng trình duyệt: mọi số dưới đây là bot
(Playwright không màn hình hoặc Node), thời gian trong game, có hạt giống. Số thô: `so-lieu/truoc/` và `so-lieu/sau/`.

## 0. Đọc nhanh

- **Chỉnh A (búa tích hệ) đã có sẵn trong code** từ đợt V46: `combat.js` `playerHit` đã nhân tỉ lệ gây hệ với `T.cd / 0,36` (búa ×2,2,
  phi tiêu ×1,4, thương ×1,2, kiếm ×1) và kẹp ≤ 100%. Phiên này **thêm cờ `?hetheonhip=0`** (về luật trước V46) và đo bật / tắt.
  Nhờ nó búa tích dấu ấn **bằng hoặc hơn kiếm** ở Mầm và Thành hình (122–184%), Thức tỉnh 91–116%; tắt cờ thì Mầm / Thành hình còn 63–105%.
- **Mục tiêu "búa Băng ≥ 90% búa Độc" KHÔNG đạt** (78–82%), và không thể đạt bằng tỉ lệ gây hệ: ở Thành hình / Thức tỉnh búa đã gây
  hệ 100% mỗi nhát. Đã thử thêm "phần vượt 100% thành 1 tầng nữa" → búa Độc mạnh thêm, búa Băng đứng yên → **bỏ, không commit**. Đề xuất ở mục 5.
- **Chỉnh B (thương giữ khoảng cách) đã làm**: nhát Đâm thứ 3 đẩy lùi nhẹ 6 điểm ảnh qua `G.kbDay` (trùm / quái giáp ×0,2, tinh anh ×0,5),
  không đẩy quái ra ngoài 85% vòng Quét vòng kế tiếp nên chuỗi vẫn nối. Cờ `?thuongday=0`. Sát thương mỗi giây **không đổi** (trong nhiễu),
  máu mất khi đánh đám **giảm ~14%** (24 hạt giống). Đã thử phương án tầm Đâm 60 → 66: +3% sát thương nhưng máu mất tăng, nên giữ đẩy lùi.
- Kiếm không bị đụng (số đo kiếm trùng khít trước / sau). `tests/dps.py` **đạt**. `tests/cay.py` tổng thời gian lệch −7% / −1% / 0% (kiếm / thương / búa).
- Vấn đề lớn khác (chỉ ghi đề xuất): **Độc vẫn mạnh nhất khi đánh đám, Lửa ngang Băng ở chót** (trái câu "Lửa hợp với bầy quái");
  **phi tiêu đánh 1 quái mạnh hơn kiếm**; búa Băng thiếu dấu ấn vì quái chết ngay sau khi tan băng.

## 1. Cách đo

| Bài | Lệnh (thư mục `game`) | Ghi chú |
|---|---|---|
| `tests/au_vu_khi.py` | `python3 tests/au_vu_khi.py 60 8` | cụm 5 quái mới (máu ×2,5) và 1 quái máu dày; Lam +3, cấp 10. Mới: `PRE='<JS>'` chạy trước khi đo (thử cờ) |
| `tests/au_he.py` | `VK=<vũ khí> python3 tests/au_he.py 60 6` | 3 hệ × 3 mốc, chạy riêng từng vũ khí (4 lần). Cũng nhận `PRE` |
| `tests/dps.py` | `python3 tests/dps.py` và `... quaimoi` | bản chấm đạt / không đạt (bia tập) và quái mới thật |
| `tests/cay.py` | `python3 tests/cay.py --node [--vk=thuong / bua]` | 12 lượt chiến dịch 15 ải, món chính + phi tiêu |
| `tests/balance.py` | `python3 tests/balance.py --node 8 - - vukhi:spear,hammer` | tỉ lệ thắng từng ải với bản lưu cố định |

Lưu ý nhiễu: `au_vu_khi` / `au_he` / `dps.py` (bia tập) chạy lại ra **đúng số** (kiếm, phi tiêu, búa trùng khít trước / sau); riêng lượt
đầu tiên của trang và `dps.py quaimoi`, `cay.py`, `balance.py` có lệch dù code không đổi (ví dụ `cay.py` kiếm −7%, `balance.py` búa ở 2-1
từ 2/8 lên 5/8 dù búa không đổi gì) — đó là độ nhiễu để so.

## 2. Bảng trước / sau — 4 vũ khí (`au_vu_khi.py 60 8`)

| Vũ khí | st/giây cụm 5 | st/giây 1 quái | % nhát bị huỷ (cụm / 1) | máu mất / giây (cụm) | dấu ấn / phút Mầm Lửa (cụm) |
|---|---|---|---|---|---|
| Kiếm | 47,8 → 47,8 | 28,9 → 28,9 | 11% / 6% → như cũ | 2,19 → 2,19 | 4,6 → 4,6 |
| Thương | 47,7 → 44,2 (24 hạt: **45,4 → 45,1**) | 38,0 → 38,7 (24 hạt: 37,8 → 38,2) | 12% / 8% → 13% / 8% | 1,98 → 2,21 (24 hạt: **2,01 → 1,72**) | 5,5 → 5,2 |
| Búa | 42,1 → 42,1 | 47,9 → 47,9 | 18% / 1% → như cũ | 2,54 → 2,54 | 5,6 → 5,6 (tắt Chỉnh A: 3,8) |
| Phi tiêu | 33,4 → 33,4 | 35,6 → 35,6 | 13% / 6% → như cũ | 2,01 → 2,01 | 3,5 → 3,5 (tắt A: 3,2) |

- **Lệch ở đám** (3 món cận chiến, sau): kiếm 47,8 · thương 44,2–45,1 · búa 42,1 → trung bình 44,9, lệch nhiều nhất **+7% / −6%** (≤ 15%: đạt).
  Phi tiêu thấp hơn trung bình cận chiến 26% (chủ ý).
- So với audit 10/10: búa không còn bị huỷ 49% nhát khi đánh đám (nay 18%, nhờ `hitAt 0,35`), và búa không còn kém kiếm 30% ở đám (nay −12%).
- Thương, 8 hạt giống thì có vẻ tụt 7%, nhưng chạy lại 24 hạt giống thì sát thương như cũ (−0,7%) và máu mất giảm 14%: 8 hạt quá ít cho thương.

## 3. Bảng trước / sau — 3 hệ × 4 vũ khí (`au_he.py 60 6`, đánh cụm 5)

st/giây ở Mầm / Thành hình / Thức tỉnh; dấu ấn / phút ở Mầm / Thành hình / Thức tỉnh. Kiếm, phi tiêu, búa: trước = sau (trùng khít).

| Vũ khí | Hệ | st/giây | dấu ấn / phút | máu mất / giây Thức tỉnh | % quái bị khống chế Thức tỉnh |
|---|---|---|---|---|---|
| Kiếm | Lửa | 50,6 / 64,3 / 84,1 | 4,7 / 10,0 / 15,5 | 1,30 | 4% |
| Kiếm | Độc | 53,5 / 76,2 / 95,1 | 6,0 / 13,3 / 18,3 | 1,51 | 4% |
| Kiếm | Băng | 47,4 / 63,7 / 84,5 | 3,8 / 9,7 / 16,0 | 1,43 | 44% |
| Phi tiêu | Lửa | 44,5 / 60,4 / 71,5 | 4,2 / 8,0 / 10,5 | 1,43 | 4% |
| Phi tiêu | Độc | 48,0 / 66,4 / 87,6 | 5,8 / 10,0 / 16,2 | 1,38 | 5% |
| Phi tiêu | Băng | 41,7 / 53,6 / 75,7 | 3,5 / 6,8 / 12,2 | 1,35 | 59% |
| Búa | Lửa | 59,1 / 80,3 / 90,3 | 6,8 / 13,8 / 16,5 | 2,13 | 10% |
| Búa | Độc | 61,3 / 85,7 / 104,1 | 9,2 / 17,2 / 21,2 | 1,71 | 11% |
| Búa | Băng | 55,0 / 70,3 / 80,9 | 7,0 / 12,2 / 14,5 | 2,19 | 32% |
| Thương (trước) | Lửa / Độc / Băng Thức tỉnh | 87,4 / 101,6 / 92,9 | 15,3 / 19,5 / 17,0 | 1,82 / 1,38 / 1,76 | |
| Thương (sau, 6 hạt) | Lửa / Độc / Băng Thức tỉnh | 87,9 / 90,8 / 80,6 | 16,0 / 17,7 / 15,7 | 1,75 / 1,12 / 1,23 | |
| Thương 18 hạt, tắt B → bật B | Lửa / Độc / Băng Thức tỉnh | 85,6 → 81,5 · 101,4 → 103,0 · 87,1 → 90,0 | 15,0 → 14,3 · 19,9 → 19,9 · 15,7 → 16,9 | | |

Thương 6 hạt có vẻ tụt Độc / Băng 11–13%, nhưng 18 hạt thì trung bình 3 hệ Thức tỉnh **91,4 → 91,5**: nhiễu, không phải tụt thật.

### Chỉnh A: búa so với kiếm, bật / tắt cờ (dấu ấn / phút, `au_he`)

| Mốc | Búa ÷ Kiếm (bật, mặc định) Lửa / Độc / Băng | Búa ÷ Kiếm (tắt `?hetheonhip=0`) Lửa / Độc / Băng | Mục tiêu ≥ 70% |
|---|---|---|---|
| Mầm | 145% / 153% / 184% | 74% / 63% / 105% | bật: đạt |
| Thành hình | 138% / 129% / 126% | 80% / 102% / 88% | bật: đạt |
| Thức tỉnh | 106% / 116% / 91% | như bật (đã 100% gây hệ) | đạt |

`tests/dps.py` (hệ thống mới, linh khí vào túi chung, Thức tỉnh, bia tập): búa ÷ kiếm = Lửa 75%, Độc 73%, **Băng 50%** (34,0 so với 68,6) — xem 5.2.

### Búa Băng so với búa Độc (mục tiêu ≥ 90%)

| Nguồn | Thành hình | Thức tỉnh |
|---|---|---|
| `au_he` (trước = sau) | 70,3 / 85,7 = **82%** | 80,9 / 104,1 = **78%** |
| `dps.py` (trước = sau) | — | 83,9 / 102,4 = **82%** |
| Đã thử, không commit: phần vượt 100% thành +1 tầng (kẹp 2 tầng mỗi nhát) | 68,6 / 97,5 = 70% (tệ hơn) | 84,6 / 104,6 = 81% |
| Đã thử, không commit: như trên nhưng Băng tới 3 tầng | 68,6 / 97,5 | 84,3 / 104,6 = 81% |

Không đạt, lý do ở 5.1.

## 4. `tests/dps.py`, `tests/cay.py`, tỉ lệ thắng

| Bài | Trước | Sau |
|---|---|---|
| `dps.py` (bia tập): đạt / không | **đạt** (phi tiêu thấp hơn kiếm 24%, cận chiến lệch 10%, thấp nhất 76%, 3 hệ lệch 8%) | **đạt** (24%, 9%, 76%, 8%) |
| `dps.py` thương Trắng / Thức tỉnh TB | 59,6 / 98,6 | 57,6 / 97,0 |
| `dps.py quaimoi` | không đạt: phi tiêu thấp hơn kiếm 28% (cần 13–27%) — **có từ trước** | không đạt, cùng lý do (28%); thương Trắng 39,0 → 41,9, Thức tỉnh 80,5 → 84,9 |
| `cay.py --node` kiếm + phi tiêu | 188 phút, 39 lần chơi | 175 phút (−7%, code kiếm / phi tiêu không đổi: nhiễu), 37 lần |
| `cay.py --node --vk=thuong` | 181 phút, 40 lần | 180 phút (−1%), 41 lần |
| `cay.py --node --vk=bua` | 183 phút, 41 lần | 183 phút (0%), 40 lần |
| `balance.py --node 8 vukhi:spear,hammer` | thương 74/120, búa 73/120 | thương 74/120, búa 76/120 (búa không đổi code: nhiễu) |

Tỉ lệ thắng từng ải (balance, thương, trước → sau, mỗi ô 8 lượt): 1-3 7→8, 2-1 1→5, 2-2 3→0, 2-3 4→1, 2-4 3→2, 3-3 7→8, 3-4 5→6, còn lại bằng nhau.
Búa (không đổi code) dao động cùng cỡ: 2-1 2→5, 2-2 3→1, 2-4 4→0, 3-3 5→7. Tổng thương giữ nguyên 74/120 → **trong nhiễu**.
`cay.py` thương: số lần chơi từng ải lệch ≤ 1,4 lần (lớn nhất 2-5: 6,2 → 4,8 dễ hơn; 3-3: 3,5 → 4,4 khó hơn), số thua mỗi ải lệch ≤ 0,6.

Kiểm khác: `node --check` mọi tệp `js/`; `python3 game/build.py` và `--hai-tep` chạy được (đã dựng lại `dist`); `node tests/cam_giac_danh.test.js`
**đạt 15 mục**; `python3 tests/moves.py` 85/93 **trước và sau như nhau** (8 mục sai có sẵn từ trước, không liên quan: nhát kết kiếm đẩy 10 điểm ảnh
đo theo kiểu cũ, phi tiêu đi chậm, búa khựng, dấu ấn vụ nổ / độc / mảnh băng). Mở `index.html?thuongday=0&hetheonhip=0&cloud=0` → hai cờ tắt,
đẩy lùi chung vẫn bật. Không đụng đăng nhập Google / lưu mây.

## 5. Đã chỉnh gì

| | Tệp, chỗ | Nội dung | Cờ quay lui |
|---|---|---|---|
| A | `game/js/combat.js` `playerHit` + đầu tệp (cạnh `G.LK_THEO_THAY`) | Giữ luật V46 (tỉ lệ gây hệ × `T.cd / 0,36`, kẹp ≤ 100%), bọc bằng `G.HE_THEO_NHIP`; ghi chú phương án đã thử và bỏ | `?hetheonhip=0` → `G.HE_THEO_NHIP = false` (luật trước V46) |
| B | `game/js/moves.js` `G.MOVES.spear.chain[2]` (`day: 6, dayGiu: 0,85`), hàm mới `spearDay`, gọi trong `M.hit` nhánh `dam` | Nhát Đâm thứ 3 đặt vận tốc lùi `G.kbQuang(q)` theo hướng đâm, `q = min(6, 0,85 × (vòng Quét + bán kính quái) − khoảng cách)`; quái đã xa hơn thì không đẩy. Hệ số trùm / giáp / tinh anh / đóng băng / trói chân dùng `G.kbHeSo` sẵn có | `?thuongday=0` → `G.THUONG_DAY = false`; `?dayluicu=1` tắt cả đẩy lùi |
| — | `game/tests/au_vu_khi.py`, `game/tests/au_he.py` | Nhận biến môi trường `PRE='<mã JS>'` để thử cờ / số trong bộ nhớ | — |

Không đổi số sát thương, nhịp, tầm của vũ khí nào. Kiếm không đổi.

## 6. Đề xuất thêm (chưa làm)

1. **Búa Băng yếu (78–82% búa Độc)** không do tỉ lệ gây hệ. Đo đếm khi quái chết (bia tập, 6 hạt × 60 giây; đo trên bản thử 2 tầng, bản cuối cho số dấu ấn cùng cỡ): búa Băng mỗi phút chỉ đóng băng
   6,3 lần (kiếm 8,7), vì sau mỗi lần đóng băng quái **miễn 5 giây**; Băng không có sát thương theo nhịp, còn **Độc theo nhịp tính theo sát thương
   của nhát gây** (`st.poisonDmg = src × 0,06`, `src` = sát thương nhát) nên búa (nhát 21) có độc mạnh gấp ~2,4 lần kiếm mỗi tầng. Hai hướng, chọn một:
   a. Độc theo nhịp chia cho hệ số nhịp (`src × 0,06 / k`): búa Độc về ngang kiếm Độc, tỉ lệ Băng / Độc của búa lên ~90% — nhưng là **giảm** búa Độc.
   b. Đặc trưng Thức tỉnh Băng vỡ cho búa: miễn đóng băng ngắn hơn khi đóng băng bằng búa (5 → 3 giây), hay Băng vỡ được 2 lần mỗi lần đóng băng.
2. **Búa Băng chỉ được 50% dấu ấn của kiếm Băng** (`dps.py`): 22 / 52 con búa hạ không còn dính hệ nào, vì nhát búa kết liễu **trước** khi gây hệ
   (`playerHit` gọi `G.damage` rồi mới `applyStatus`) và quái vừa tan băng có `iceN = 0`. Đề xuất: `G.kill` coi quái đang `freezeImm > 0`
   (vừa tan băng) là còn dính Băng khi tính dấu ấn.
3. **Lửa vẫn không phải hệ đánh đám tốt nhất.** Cụm 5, Thức tỉnh, trung bình 4 vũ khí (`au_he`): Độc 97,1 · Băng 83,5 · Lửa 83,3; Độc hơn Lửa ở cả 4 vũ khí.
   `dps.py quaimoi`: Độc 88,5 · Lửa 74,6 · Băng 72,1. Câu gợi ý "Lửa hợp với bầy quái" (`data.js` `G.HINTS`) vẫn sai với số đo; hoặc đổi câu,
   hoặc tăng Nổ lan (`HE.fire.boom` 0,5 → ~0,7, `boomR` 34 → 40) rồi đo lại.
4. **Phi tiêu đánh 1 quái mạnh hơn kiếm** (35,6 so với 28,9 st/giây; thương 38, búa 48): kiếm yếu nhất khi đánh một con, phi tiêu an toàn mà vẫn hơn.
   Ở đám phi tiêu thấp nhất đúng ý (33,4). `dps.py quaimoi` báo phi tiêu thấp hơn kiếm 28% (ngưỡng 27%) — có từ trước, sát ngưỡng. Nên đo bằng
   người thật trước khi chỉnh; nếu chỉnh thì xem lại kiếm 1 quái (nhát 1–2 rất nhẹ) chứ không tăng phi tiêu.
5. Bài `au_vu_khi.py` / `au_he.py` cần **≥ 18–24 hạt giống** khi so thương (8 hạt lệch ±7%); nên đổi số mặc định khi dùng để chấm.
