# Báo cáo — Sửa cân bằng, 3 mục chủ game chọn (15/10)

Làm theo `YEU-CAU.md`, chỉ đúng 3 mục. Không đụng: Hồ Tinh (`boss[14]`), độ khó 2, `G.STAGE_REC`, các đề xuất khác. Đo bằng bot Node (không mở trình duyệt). Đăng nhập Google, lưu mây, `?cloud=0`, `apiKey` không đổi.

## Tóm tắt

- **Ải 2-2…2-5, 3-2, 3-4:** đủ khuyên dùng giờ bot thắng **70–76%**. Trước khi sửa là 23–72%.
  - Trùm của các ải này **giữ nguyên** máu và sát thương (lệch ≤ 0,03% do làm tròn).
  - Hai ải dùng số khác đề xuất A, vì đo lại thấy lệch: **2-5** s 0,78 → **0,73**; **3-4** s 0,82 → **0,88**. Lý do: bản lưu nay giữ bậc ép, và Hút máu đã bị giảm.
- **Bổ rìu Ngư Tinh:** mảnh san hô 1,4 → 1,0. Đòn to nhất của chiêu này ở pha 3: 26% → 18% máu. Nhát bổ chính giữ 1,4.
- **Hút máu:** giảm nửa. Mỗi dòng 0,012 → 0,006; trần mỗi đòn 2% → 1% máu tối đa. Chữ dòng trong bảng ép được tính từ số nên tự đổi.
- **Cờ `?cbcu=1`:** cả 3 mục về số cũ. Đã kiểm bằng bot: `stageStats` của 30 ải (cả 2 độ khó), bảng ép đồ và bảng chiêu trùm **giống hệt** mã trước khi sửa.
- **Chiến dịch (bot nghe khuyên dùng):** 44,7 → **36,5 lần chơi**, 3,6 → 3,0 giờ. 2-5 hết kẹt (7/10 → 2/10 lượt).
- **Điều cần chủ game biết:** bot **không nghe khuyên dùng** qua vùng 2 nhanh hơn, nên cày ít hơn. Vì vậy nó tới vùng 3 với Sức mạnh thấp hơn khoảng 10%, và **vùng 3 khó hơn với bot này**: 3-5 từ 4,8 lên 8,2 lần chơi, 7/10 lượt kẹt. Xem mục 4. Phiên này không tự sửa.

## 1. Đã sửa gì

| Mục | Tệp · khoá | Cũ → mới | `?cbcu=1` |
|---|---|---|---|
| 1. Bớt quái | `game/js/data.js` · `G.STAGE_K.mob` / `.boss` | bảng dưới | số cũ (`G.STAGE_K_CU`) |
| 2. Bổ rìu | `game/js/chieu_trum.js` · `G.chieuTrum.SO.nguBoRiu.manhSat` | 1,4 → **1,0** | 1,4 |
| 3. Hút máu | `game/js/data.js` · `G.EP_DO.dong[hutMau].goc` / `G.EP_DO.hutToiDa` | 0,012 → **0,006** / 0,02 → **0,01** | 0,012 / 0,02 |

**Cờ `?cbcu=1`:**

- Đọc một lần ở `data.js`, thành `G.CB_CU`. `chieu_trum.js` đọc lại cờ này.
- Không có cờ thì `G.CB_CU = false`.

**Độ khó 2 không đổi:**

- `G.stageStats(r, i, 1)` dùng `G.STAGE_K_K2`, là bản sao cột cũ của 6 ải.
- Bot đã so: `stageStats` độ khó 2 của cả 15 ải giống hệt trước khi sửa.

**Mục 1. Hệ số s nhân vào quái; cột trùm chia lại cho s (3 chữ số thập phân), để trùm giữ nguyên:**

| Ải | s (đề xuất A → dùng) | `mob` cũ → mới | `boss` cũ → mới | Trùm (máu × / sát thương ×) |
|---|---|---|---|---|
| 2-2 | 0,89 | [1.58, 2.14] → [1.41, 1.9] | [1.44, 2.54] → [1.614, 2.861] | 1,0002 / 1,0001 (Cua Đá) |
| 2-3 | 0,89 | [1.63, 2.27] → [1.45, 2.02] | [1.48, 2.61] → [1.664, 2.933] | 1,0002 / 1,0000 (Cua Đá) |
| 2-4 | 0,81 | [1.44, 2.43] → [1.17, 1.97] | [1.31, 2.62] → [1.612, 3.232] | 0,9998 / 1,0001 (Cua Đá) |
| 2-5 | 0,78 → **0,73** | [1.4, 2.61] → [1.02, 1.91] | [0.96, 1.98] → [1.318, 2.706] | 1,0003 / 1,0001 (Ngư Tinh)* |
| 3-2 | 0,90 | [1.74, 3.25] → [1.57, 2.93] | [1.31, 2.13] → [1.452, 2.363] | 1,0001 / 1,0002 (Hổ Lửa) |
| 3-4 | 0,82 → **0,88** | [1.62, 2.98] → [1.43, 2.62] | [1.18, 2.33] → [1.337, 2.65] | 1,0002 / 0,9999 (Hổ Lửa) |

\*Không làm phần "Ngư Tinh sát thương ×0,9" của đề xuất A. Yêu cầu ghi "trùm giữ nguyên"; Ngư Tinh chỉ đổi qua mục 2.

**Chỉ số quái sau khi sửa** (máu · sát thương mỗi đòn, độ khó 1):

- Vùng 2: 2-1 189 · 24 → 2-2 219 · 25 → 2-3 261 · 29 → 2-4 240 · 31 → 2-5 235 · 33.
  - Sát thương vẫn tăng dần.
  - Máu hơi răng cưa ở 2-4, 2-5. Bao-cao-A đã báo trước điều này; đây là cái giá của việc giảm cả máu lẫn sát thương theo cùng s.
- Vùng 3: 3-1 410 · 56 → 3-2 440 · 57 → 3-3 558 · 69 → 3-4 452 · 55 → 3-5 477 · 72.
  - Ở 3-4 cả máu lẫn sát thương thấp hơn 3-3. Trước khi sửa, 3-4 cũng đã thấp hơn 3-3 về sát thương (bao-cao-A mục 5.1).

## 2. Thắng ải ở Sức mạnh = khuyên dùng, trước / sau (`do_ai_chet.py`)

Cách đo:

- 20 bản lưu thật cho mỗi ải, lấy từ 20 lượt chiến dịch trên mã **trước khi sửa** (10 lượt nghe khuyên dùng + 10 lượt không nghe; bản lưu đã giữ bậc ép). Hai cột trước / sau dùng **cùng bộ bản lưu**.
- Mỗi bản được đưa về Sức mạnh ≈ khuyên dùng bằng cách nâng / hạ cấp.
- "Trước" có hai lần đo: trên mã gốc, và trên mã mới với `LK_Q=cbcu=1`. Hai lần khớp nhau trong biên nhiễu, nên cờ `?cbcu=1` quay lui đúng.

| Ải | Trước (mã gốc, 100 lượt) | Trước (`?cbcu=1`, 100 lượt) | **Sau (200 lượt)** | Tới phòng trùm trước → sau | Thắng trùm khi tới, trước → sau | Máu mất do quái thường, trước → sau |
|---|---|---|---|---|---|---|
| 2-2 | 56% | 58% | **74%** | 67 → 88% | 84 → 85% | 70 → 61% |
| 2-3 | 53% | 53% | **70%** | 62 → 81% | 85 → 86% | 77 → 67% |
| 2-4 | 31% | 35% | **76%** | 37 → 88% | 84 → 87% | 85 → 70% |
| 2-5 | 23% | 25% | **74%** | 34 → 91% | 68 → 81% | 83 → 63% |
| 3-2 | 72% | 67% | **73%** | 79 → 83% | 91 → 88% | 74 → 75% |
| 3-4 | 62% | 66% | **74%** | 68 → 78% | 91 → 95% | 87 → 83% |

**Các ải không bớt quái** (chỉ chịu ảnh hưởng của Hút máu; 60 lượt, trước → sau):

- 2-1: 83 → 90%.
- 3-1: 82 → 82%.
- 3-3: 85 → 85%.
- Không thấy Hút máu giảm nửa làm tụt các ải này. Khoảng 5–45% bản lưu có dòng Hút máu, tuỳ ải.

**Chỉnh số so với đề xuất A** (mỗi dòng 100–200 lượt; tệp trong `so-lieu/`):

- 2-5 với s = 0,78 (số của A): chỉ thắng **53%**. Thử thêm:
  - s 0,75 → 67%;
  - s 0,72 → 76–77%;
  - s 0,68 → 77%.
  - Chọn **0,73**: thắng **74%** (200 lượt, số trong tệp).
- 3-4 với s = 0,82 (số của A): thắng **78–83%**, chạm mép trên. Thử thêm:
  - s 0,86 → 78%;
  - s 0,88 → **74%**. Chọn **0,88**.
- 3-2 với s = 0,90: thắng 73%. Trước khi sửa đã ở 67–72%, sát mép dưới, nên giữ 0,90 như A.

**Ngư Tinh** (trong lượt thật, có Kháng Lửa + Chống áp sát):

- Thắng trùm khi tới: 68% → **81%**. Phần tăng đến từ việc vào phòng trùm còn nhiều máu hơn (85 → 91%) và từ mục 2.
- Bổ rìu san hô pha 3: phần trong tổng máu mất ở phòng trùm 8% → 6%; đòn to nhất 26% → 18% máu.
- Chiêu gây mất máu nhiều nhất bây giờ là Sóng thần (pha 2 + 3 ≈ 68%).

## 3. Chiến dịch 15 ải, trước / sau (`do_chien_dich.py`, Kiếm, 10 lượt mỗi kiểu)

### Bot nghe khuyên dùng

| Ải | Lần chơi TB trước → sau | Kẹt ≥ 6 lần | Thắng lần thử đầu | Thua TB |
|---|---|---|---|---|
| 1-1 … 1-4 | 1,0–2,0 → 1,0–1,9 | 0 → 0 | 100 → 90–100% | 0 → 0–0,1 |
| 1-5 | 4.3 → 3.7 | 2/10 → 0/10 | 80% → 80% | 0.2 → 0.2 |
| 2-1 | 1.0 → 1.2 | 0/10 → 0/10 | 100% → 90% | 0.0 → 0.1 |
| 2-2 | 3.1 → 2.5 | 0/10 → 0/10 | 50% → 90% | 0.5 → 0.1 |
| 2-3 | 4.2 → 4.1 | 3/10 → 0/10 | 70% → 100% | 0.4 → 0.0 |
| 2-4 | 4.3 → 1.7 | 2/10 → 0/10 | 40% → 80% | 1.5 → 0.2 |
| 2-5 | 6.3 → 3.8 | 7/10 → 2/10 | 10% → 90% | 1.8 → 0.1 |
| 3-1 | 1.0 → 1.2 | 0/10 → 0/10 | 100% → 90% | 0.0 → 0.1 |
| 3-2 | 2.0 → 1.7 | 1/10 → 0/10 | 80% → 80% | 0.3 → 0.3 |
| 3-3 | 4.7 → 4.7 | 3/10 → 2/10 | 60% → 100% | 0.5 → 0.0 |
| 3-4 | 1.8 → 1.9 | 0/10 → 0/10 | 70% → 90% | 0.4 → 0.2 |
| 3-5 | 7.0 → 4.8 | 6/10 → 3/10 | 30% → 60% | 1.5 → 0.7 |
| **Cả 15 ải** | **44,7 → 36,5** | | | |

Thời gian trong trận, cả cày và ải ngày: **3,6 → 3,0 giờ**.

### Bot không nghe khuyên dùng (cứ vào ải mới, thua thì chơi lại ải cũ một lượt)

| Ải | Lần chơi TB trước → sau | Kẹt ≥ 6 lần | Thắng lần thử đầu | Thua TB | SM lần thử đầu / khuyên dùng, trước → sau |
|---|---|---|---|---|---|
| 2-2 | 2.6 → 1.4 | 1/10 → 0/10 | 50% → 80% | 0.8 → 0.2 | 194 → 198 / 215 |
| 2-3 | 5.4 → 2.6 | 4/10 → 0/10 | 20% → 40% | 2.2 → 0.8 | 218 → 214 / 260 |
| 2-4 | 5.6 → 4.4 | 5/10 → 2/10 | 30% → 30% | 2.3 → 1.7 | 258 → 245 / 275 |
| 2-5 | 10.0 → 3.8 | 6/10 → 2/10 | 20% → 20% | 4.5 → 1.4 | 287 → 271 / 305 |
| 3-1 | 1.2 → 1.4 | 0/10 → 0/10 | 90% → 80% | 0.1 → 0.2 | 356 → 315 / 310 |
| 3-2 | 1.2 → 1.8 | 0/10 → 0/10 | 90% → 70% | 0.1 → 0.4 | 381 → 328 / 330 |
| 3-3 | 1.4 → 3.4 | 0/10 → 0/10 | 80% → 30% | 0.2 → 1.2 | 398 → 355 / 410 |
| 3-4 | 2.0 → 4.0 | 1/10 → 2/10 | 80% → 30% | 0.5 → 1.5 | 412 → 386 / 420 |
| 3-5 | 4.8 → 8.2 | 4/10 → 7/10 | 20% → 0% | 1.9 → 3.6 | 465 → 430 / 520 |
| **Cả 15 ải** | **42,2 → 39,0** | | | | |

Vùng 1 và 2-1 không đổi. Thời gian trong trận: 3,3 → 3,3 giờ. Bảng đủ 15 ải nằm trong `so-lieu/chien-dich.md`.

## 4. Nhận xét và đề xuất (chưa làm, chờ chủ game chọn)

1. **`G.STAGE_REC` không lệch rõ.**
   - Sau khi sửa, đủ khuyên dùng thì 6 ải thắng 70–76%; các ải còn lại thắng 82–90% (vùng 1 cao hơn).
   - **Không đề xuất đổi khuyên dùng.**
2. **Vùng 3 với người chơi không nghe khuyên dùng khó hơn trước.**
   - Nguyên nhân: vùng 2 dễ đi, nên người chơi ít cày ở vùng 2. Bot này tới 3-1 với Sức mạnh 315 thay vì 356, và tới 3-5 với 430 thay vì 465 (khuyên dùng 520).
   - Ải chặn chính là **3-5 (Hồ Tinh)**: 8,2 lần chơi, 0/10 thắng ngay.
   - Không phải do quái vùng 3 mạnh lên: chỉ số quái 3-1, 3-3, 3-5 không đổi; 3-2, 3-4 còn yếu đi.
   - Bot nghe khuyên dùng thì 3-5 lại dễ hơn: 7,0 → 4,8 lần.
   - Hướng xử lý, nếu chủ game thấy cần:
     - (a) làm mục Hồ Tinh của bao-cao-A (`G.STAGE_K.boss[14]` [1.29, 2.71] → [1.05, 2.0], kèm quái 3-5 ×0,95). A đo được: thắng 3-5 ở khuyên dùng 38% → 67%.
     - (b) hoặc giữ như hiện tại. Khuyên dùng 3-3…3-5 vẫn nói đúng, và người chơi nghe khuyên dùng không bị ảnh hưởng.
   - Tự tin: vừa. Bot không nghe khuyên dùng là kiểu chơi cực đoan.
3. **Tổng thời gian chiến dịch** (bot nghe khuyên dùng) ngắn đi khoảng 17%: 3,6 → 3,0 giờ, đúng như bao-cao-A dự báo. Nếu muốn giữ khoảng 3,5 giờ, có thể nâng `G.STAGE_REC` của 3-3…3-5 lên 5% (bao-cao-A mục 5.1). Phiên này không làm.
4. **Máu quái vùng 2 răng cưa** (2-3 261 → 2-4 240 → 2-5 235). Muốn đường máu đều thì dời một phần giảm của 2-4, 2-5 từ cột máu sang cột sát thương. Không làm vì yêu cầu không chọn.

## 5. Kiểm tra

- Chạy `node --check` cho `data.js`, `chieu_trum.js`, `ep_do.js`: đều đạt.
- Chạy `game/build.py`: đạt. Đã đóng gói lại `game/dist/*`, `tools/xuong-sprite/index.html`.
- Khi `pull --rebase`, ba tệp `dist` xung đột với phiên cảnh truyện. Đã lấy bản của nhánh rồi build lại từ mã đã gộp. Thay đổi của phiên khác được giữ (7 ảnh truyện có trong bản build).
- Bot Node không ghi lỗi trang trong cả 4 lượt chiến dịch × 10 lượt.
- `?cbcu=1`:
  - `stageStats` (2 độ khó × 15 ải), `STAGE_REC`, `EP_DO.dong`, `hutToiDa` và `chieuTrum.SO` giống hệt mã gốc (`git stash`).
  - Thắng ải đo với cờ khớp mã gốc trong biên nhiễu (mục 2).
- Độ khó 2: `stageStats(…, 1)` giống hệt mã gốc khi không có cờ.
- Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, đăng nhập Google hay `?cloud=0`.

## 6. Lệnh chạy lại

Chạy từ gốc repo. Đặt `K=docs/review/ke-hoach-cai-thien/kiem-can-bang` và `C=docs/review/ke-hoach-cai-thien/sua-can-bang`.

```
# bản lưu (trên mã trước khi sửa, hoặc mã mới với LK_Q=cbcu=1), gộp 2 tệp thành tat.json (20 bản / ải)
LK_Q=cbcu=1 python3 $K/do_chien_dich.py --n=10 --mode=khuyen --luu-tat=tat-khuyen.json --out=cd-khuyen-truoc.json
LK_Q=cbcu=1 python3 $K/do_chien_dich.py --n=10 --mode=lieu   --luu-tat=tat-lieu.json   --out=cd-lieu-truoc.json
# thắng ải ở khuyên dùng: trước (cờ) / sau
LK_Q=cbcu=1 python3 $K/do_ai_chet.py 6,7,8,9,11,13 100 --luu=tat.json
python3 $K/do_ai_chet.py 6,7,8,9,11,13 200 --luu=tat.json
# chiến dịch sau
python3 $K/do_chien_dich.py --n=10 --mode=khuyen --out=cd-khuyen-sau.json      # và --mode=lieu
python3 $C/so_cd.py cd-khuyen-truoc.json cd-khuyen-sau.json
# đặt lại hệ số s (ghi cột mob/boss, trùm giữ nguyên, khối số cũ cho ?cbcu=1 và độ khó 2)
python3 $C/dat_s.py game/js/data.js '{"6":0.89,"7":0.89,"8":0.81,"9":0.73,"11":0.9,"13":0.88}'
```

Số liệu thô trong `so-lieu/`:

- `ac-truoc-*`: trước, mã gốc.
- `ac-cbcu-*`: trước, đo bằng cờ.
- `ac-sau-a`: sau, 2-2 và 2-3. `ac-sau-b`: sau, 2-4 và 2-5.
- `ac-sau-c`: sau, 3-2 (số dùng trong bảng) và 3-4 với s = 0,82 của A (số 3-4 này đã bị thay).
- `ac-34-0.88`: sau, 3-4 với số cuối cùng.
- `ac-sau-d`: sau, 2-1 / 3-1 / 3-3.
- `ac-25*`, `ac-34-0.86`: các lần thử s.
- `chien-dich.md`: bảng chiến dịch.
