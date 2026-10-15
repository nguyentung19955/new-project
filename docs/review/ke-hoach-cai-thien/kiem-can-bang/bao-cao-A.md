# Báo cáo A — Độ khó và đường cong theo ải, cấp độ (15/10)

Làm theo `YEU-CAU-A.md` và `CHUNG.md`. Phiên này **chỉ đo và đề xuất**. Không sửa số nào trong `game/`. Mọi đề xuất đã được **thử trong bộ nhớ** bằng bot: dùng biến `LK_JS` để nạp `de_xuat_a.js` và `de_xuat_a_k2.js`, tệp game không đổi.

- Đo trên mã nhánh `khoi-tao-du-an` ở commit `853ebf8e`, trước khi phiên `cua-tuong-kho` sửa Cua Đá.
- Bot chạy trong Node (`--node`, như `?cloud=0`), không dùng trình duyệt.
- Đăng nhập Google, lưu mây và `apiKey` không bị đụng tới.

## Tóm tắt dễ hiểu

**Chỗ ổn**

- Vùng 1 (1-1 … 1-5) mượt: đủ khuyên dùng là thắng 81–100%.
- Đi hết 15 ải mất khoảng **42 lần chơi, ~3 giờ** (bot Kiếm nghe khuyên dùng). Thương và Búa mất 40–41 lần.
- Đường cấp đều: vào ba vùng ở **cấp 1 · 9 · 20**, qua 3-5 ở cấp 29. Để lên 1 cấp cần thắng khoảng 1–1,6 lượt của chính ải đang đánh. Không có chỗ phải cày riêng để lấy kinh nghiệm.
- Trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa) và 6 tinh anh: thắng 87–100% ở mức khuyên dùng.

**Chỗ lệch, nặng nhất trước**

1. **Ải 2-4 và 2-5 quá khó so với khuyên dùng.**
   - Đủ khuyên dùng mà bot chỉ thắng **20% và 10%** (đo trên 20 bản lưu thật × 5 lượt).
   - Muốn thắng 75% cần Sức mạnh khoảng **+22% và +26%** so với khuyên dùng.
   - Hơn 90% máu mất là do **quái thường**, trước khi tới trùm.
   - Cùng kiểu nhưng nhẹ hơn: 3-4 (thắng 47%), 2-3 (48%), 2-2 (55%), 3-2 (62%).
   - **Đề xuất:** giảm máu và sát thương quái của các ải này trong `G.STAGE_K.mob`, rồi chia lại cột `G.STAGE_K.boss` để trùm giữ nguyên (bảng mục 5.1).
   - Đã thử bằng bot: đủ khuyên dùng thì thắng **64–78%** (trước là 10–62%). Đi hết 15 ải còn 35 lần chơi, 2,8 giờ.
   - Tự tin: **cao** về hướng sửa, **vừa** về con số chính xác.
2. **Hồ Tinh (3-5) khó nhất cả game khi đánh như lượt thật.**
   - Trong lượt thật, Hồ Tinh luôn có Kháng Lửa và Chống áp sát.
   - Bot vào trùm với 90% máu chỉ thắng **18–28%**. Nếu vào thẳng, không có lớp thích nghi thì thắng 100%.
   - **Đề xuất:** `G.STAGE_K.boss[14]` đổi từ `[1.29, 2.71]` thành `[1.05, 2.0]` (tính trên quái cũ), kèm quái 3-5 ×0,95. Đã thử: thắng trùm **67%**, thắng cả ải 38% → 67%.
   - Tự tin: vừa. Bot không biết đổi cách đánh khi gặp Chống áp sát, nên người chơi giỏi sẽ thấy dễ hơn bot.
3. **Độ khó 2 hiện chỉ là "dạo chơi".**
   - Độ khó 2 chỉ mở khi xong cả 15 ải. Lúc tới, người chơi đã có Sức mạnh ~580, trong khi khuyên dùng chỉ 145–690.
   - Bot qua gần như **mọi ải ngay lần đầu**: 15–17 lần chơi, khoảng 50 phút.
   - **Đề xuất** (để chủ dự án chọn trên trang việc "làm khó hơn"):
     - Khuyên dùng độ khó 2 theo từng ải: **580 → 800** (bản "vừa") hoặc **560 → 760** với quái mạnh hơn (bản "khó").
     - Quái độ khó 2 = chỉ số ải thường × `m[ải]` (bảng mục 5.3). Cách này thay cho `G.DIFF2` tính theo vùng.
   - Đã thử: bản "vừa" mất thêm **33 lần chơi** (1–3,4 lần mỗi ải), bản "khó" thêm **44 lần** (thắng lần đầu ~50–75%).
   - Tự tin: vừa. Cần sửa `G.stageStats` / `G.stageRec` cho độ khó 2 (vài dòng mã).
4. **Có chỗ đứng an toàn** (bot "đứng sát mép/góc + chỉ né vùng đỏ"):
   - **Cua Đá:** mép trên, mép dưới và cả 4 góc. Máu mất **0–7%/phút**, trong khi đứng giữa mất 36–54%/phút. Mép phải chỉ đỡ hơn giữa khoảng một nửa.
   - **Ngư Tinh:** mép trên/dưới mất 64–70%/phút, so với 209 khi đứng giữa và 165 với bot thường. Thắng 75–80%, so với 20–45%.
   - **Tinh anh Heo Nanh:** mép trên mất 0%/phút.
   - Không có chỗ an toàn: Nấm Chúa, Mộc Tinh, Hổ Lửa, Hồ Tinh và 5 tinh anh còn lại.
   - Đứng im không né thì không chỗ nào an toàn với bất kỳ trùm nào. "An toàn" là do trùm hiếm khi tới tầm: ở mép trên/dưới, đánh Cua Đá mất 140–210 giây thay vì 50 giây.
   - Chuyển cho phiên `cua-tuong-kho` và phiên sửa gộp. Tự tin: cao.
5. **Có chiêu gần như vô hại, có chiêu "chết người".**
   - Ra nhiều mà gần như không trúng (≤ 5% lần ra): Kẹp càng, Tường tinh thể (Cua Đá); Cào, Gầm phun lửa (Hổ Lửa); Nấm mẹ đẻ con, Phun bào tử (Nấm Chúa); Quật cành (Mộc Tinh). Tinh anh Cua Tướng và Tướng Ma không gây sát thương cho bot biết né.
   - Một đòn lấy nhiều máu nhất: Đập càng pha 1 (52–59% máu), Vồ lửa pha 2 (51–55%), Bổ rìu san hô pha 1 (48%), Quạt đuôi (33%).
   - Không đề xuất số ở mục này. Đây là việc sửa chiêu.
6. **Kinh nghiệm và chỉ số theo cấp:** giữ nguyên.
   - Mỗi cấp cộng đều +6 máu và +1,5% đòn. Phần trăm Sức mạnh mỗi cấp giảm dần, từ +4% xuống +1,3%. Cấp 3, 6, 30, 33, 39 nhảy hơn một chút vì có điểm kỹ năng / nút chưởng.
   - Ải ngày cho 20% tổng kinh nghiệm.
   - Tự tin: cao.

Ảnh soát: `xem-A.png`, gồm 8 khung: lần chơi, khuyên dùng so với bot cần, độ khó 2, đường cấp, thắng trùm, bản đồ nhiệt đứng mép, thắng ải trước/sau đề xuất, chiến dịch trước/sau. Số liệu thô nằm trong `so-lieu-A/`.

---

## 1. Cách đo (công cụ mới, đều ở thư mục này)

| Tệp | Làm gì |
|---|---|
| `do_chien_dich.py` | Bot chơi chiến dịch từ bản lưu mới, theo luật `cd_lib.py` + `bot_nang.js`, như `cay.py`. Ghi thêm **mọi lần nhận kinh nghiệm**: ải nào, bao nhiêu, cấp trước/sau. `--kd=R`: tìm Sức mạnh để bot thắng 75%. `--kho2`: chơi tiếp độ khó 2. `--luu` / `--luu-tat`: ghi bản lưu. |
| `do_trum_a.py` | Đo riêng từng trùm và tinh anh. `thuong`: bot né như người chơi. `dung`: đứng im ở 9 chỗ, không đánh, không chết, đo máu mất/phút. `mep`: đứng lì ở mép/góc và chém khi trùm tới tầm; thêm `--ne` thì né vùng đỏ rồi quay về chỗ. Máu mất được tách theo chiêu và pha, kèm số lần ra chiêu. `LK_LOP` / `LK_MAU`: đặt lớp thích nghi và máu lúc vào phòng như lượt thật. |
| `do_ai_chet.py` | Chơi cả ải ở Sức mạnh = khuyên dùng, dùng 20 bản lưu thật mỗi ải. Bản nào thiếu hoặc dư thì nâng/hạ cấp nhân vật cho vừa. Ghi: thắng ải, tới phòng trùm, thắng trùm, máu lúc vào trùm, lớp thích nghi, nguồn mất máu. |
| `do_sm75.py` | Sức mạnh thắng 75% của ải mà bản lưu chiến dịch đều dưới khuyên dùng. Đổi cấp để có 5 mức (0,9–1,3 × khuyên dùng), mỗi mức 30 lượt. |
| `do_cap.py` | Máu, đòn, Sức mạnh theo cấp 1–40. |
| `phan_tich_a.py`, `bang_trum.py`, `ve_xem_a.py` | Gộp thành bảng và vẽ `xem-A.png`. |
| `de_xuat_a.js`, `de_xuat_a_k2.js` | Đề xuất số dạng mã chạy trong bộ nhớ, để thử lại hoặc để phiên sau chép số. |
| `luu-A.json` | Mỗi ải một bản lưu thật, Sức mạnh gần khuyên dùng. |

Lệnh chạy lại, từ gốc repo, với `D=docs/review/ke-hoach-cai-thien/kiem-can-bang`:

```
python3 $D/do_chien_dich.py --n=12 --mode=khuyen --kho2 --kd=4 --luu=$D/luu-A.json --out=cd-khuyen-kiem.json
python3 $D/do_chien_dich.py --n=12 --mode=lieu --kd=4 --out=cd-lieu-kiem.json
python3 $D/do_chien_dich.py --n=8 --mode=khuyen --vk=thuong --out=cd-khuyen-thuong.json   # (và --vk=bua)
python3 $D/do_chien_dich.py --n=10 --mode=khuyen --luu-tat=tat-khuyen.json --out=x.json        # (và --mode=lieu → tat-lieu.json, gộp thành tat.json)
python3 $D/do_ai_chet.py 0,1,...,14 100 --luu=tat.json
LK_JS="$(cat $D/de_xuat_a.js)" python3 $D/do_ai_chet.py 6,7,8,9,11,13,14 100 --luu=tat.json
python3 $D/do_sm75.py 4,6,7,8,9,11,12,13,14 30
python3 $D/do_trum_a.py thuong 0,1,...,14,tinhanh 60
LK_MAU=0.9 LK_LOP=resist:fire python3 $D/do_trum_a.py thuong 0,1,2,3,5,6,7,8,10,11,12,13 60
LK_MAU=0.9 LK_LOP=resist:fire,antiMelee python3 $D/do_trum_a.py thuong 4,9,14 100
python3 $D/do_trum_a.py mep 1,3,4,6,8,9,11,13,14,tinhanh 20 --ne     # (bỏ --ne: không né; "dung ... --T=60 [--pha=0.45]")
python3 $D/do_cap.py
python3 $D/phan_tich_a.py <thư mục json> --json=tom.json; python3 $D/bang_trum.py <thư mục>; python3 $D/ve_xem_a.py <thư mục>
```

**Thời gian chạy:** một chiến dịch 15 ải trong Node mất khoảng 22 giây; một trận trùm dưới 0,1 giây.

**Hai điều đã sửa trong cách đo** (và vì sao số khác các báo cáo trước):

- **Một bản lưu mỗi ải đánh giá sai.** Bot nghe khuyên dùng hay chững Sức mạnh trước 2-5, 3-4, 3-5 nên vào ải khi chưa tới khuyên dùng. Vì vậy `--kd` ở các ải này chỉ ra được "> X". Do đó phải đo thêm bằng `do_sm75.py` và bằng 20 bản lưu thật đưa về đúng khuyên dùng (`do_ai_chet.py`).
- **Đo trùm "vào thẳng" thiếu lớp thích nghi.** Trong lượt thật, bot đánh Kiếm Lửa nên trùm luôn có **Kháng Lửa**. Trùm vùng 2–3 thêm **Chống áp sát**. Lúc vào phòng trùm, bot còn khoảng 90% máu nhờ hồi máu giữa các phòng. Bỏ qua điều này thì Hồ Tinh trông như thắng 100%, trong khi thực tế chỉ 18–28%.

## 2. Chiến dịch 15 ải × độ khó 1 và 2

**Chú thích chung cho các bảng ở mục này**

- "Kẹt" = phải chơi từ 6 lần trở lên mới qua ải.
- "Quá dễ" = thắng ngay lần thử đầu khi Sức mạnh dưới 90% khuyên dùng.
- Thời gian là thời gian trong trận, cộng mọi lượt cày và lượt thua. Ải ngày tính riêng: khoảng 30 phút cho mỗi lượt đi hết chiến dịch.

### 2.1 Bot Kiếm + Phi tiêu, nghe khuyên dùng: cày tới khuyên dùng rồi mới vào ải mới (12 lượt)

Bảng có cả độ khó 1 và độ khó 2.

| Ải | Lần chơi TB (trung vị, lớn nhất) | Lượt kẹt ≥ 6 lần | Thua TB | Phút (cả cày) | SM lần thử đầu / khuyên dùng | Thắng lần thử đầu | Quá dễ* | SM khi qua | Cấp khi qua | Máu còn khi thắng |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 100 / 95 (+5%) | 100% | 0/12 | 100 | 1 | 87% |
| 1-2 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 109 / 105 (+4%) | 100% | 0/12 | 109 | 2 | 80% |
| 1-3 | 1.1 (1, 2) | 0/12 | 0.0 | 5 | 131 / 125 (+4%) | 100% | 0/12 | 131 | 3 | 74% |
| 1-4 | 2.0 (2, 2) | 0/12 | 0.0 | 9 | 145 / 140 (+3%) | 100% | 0/12 | 145 | 5 | 85% |
| 1-5 | 3.9 (4, 5) | 0/12 | 0.3 | 18 | 178 / 175 (+2%) | 67% | 0/12 | 181 | 8 | 51% |
| 2-1 | 1.0 (1, 1) | 0/12 | 0.0 | 4 | 202 / 180 (+12%) | 100% | 0/12 | 202 | 9 | 82% |
| 2-2 | 2.9 (2, 6) | 1/12 | 0.4 | 11 | 221 / 215 (+3%) | 67% | 0/12 | 226 | 11 | 87% |
| 2-3 | 4.7 (4, 9) | 3/12 | 0.6 | 18 | 271 / 260 (+4%) | 67% | 0/12 | 275 | 15 | 77% |
| 2-4 | 3.2 (3, 7) | 1/12 | 1.0 | 13 | 286 / 275 (+4%) | 33% | 0/12 | 293 | 16 | 75% |
| 2-5 | 5.7 ⚠ (5, 10) | 4/12 | 1.2 | 22 | 309 / 305 (+1%) | 25% | 0/12 | 322 | 20 | 62% |
| 3-1 | 1.2 (1, 3) | 0/12 | 0.1 | 5 | 338 / 310 (+9%) | 92% | 0/12 | 338 | 20 | 80% |
| 3-2 | 1.2 (1, 3) | 0/12 | 0.1 | 6 | 360 / 330 (+9%) | 92% | 0/12 | 360 | 21 | 72% |
| 3-3 | 4.8 ⚠ (5, 7) | 5/12 | 0.2 | 22 | 428 / 410 (+4%) | 92% | 0/12 | 428 | 24 | 91% |
| 3-4 | 2.1 (1, 5) | 0/12 | 0.5 | 11 | 444 / 420 (+6%) | 67% | 0/12 | 464 | 26 | 94% |
| 3-5 | 5.8 ⚠ (5.5, 14) | 6/12 | 1.1 | 30 | 536 / 520 (+3%) | 50% | 0/12 | 550 | 29 | 55% |
| K2 1-1 | 1.0 (1, 1) | 0/12 | 0.0 | 2 | 582 / 145 (+301%) | 100% | 0/12 | 582 | 30 | 100% |
| K2 1-2 | 1.0 (1, 1) | 0/12 | 0.0 | 2 | 588 / 165 (+256%) | 100% | 0/12 | 588 | 30 | 100% |
| K2 1-3 | 1.0 (1, 1) | 0/12 | 0.0 | 2 | 591 / 195 (+203%) | 100% | 0/12 | 591 | 30 | 100% |
| K2 1-4 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 593 / 215 (+176%) | 100% | 0/12 | 593 | 30 | 100% |
| K2 1-5 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 596 / 270 (+121%) | 100% | 0/12 | 596 | 31 | 98% |
| K2 2-1 | 1.0 (1, 1) | 0/12 | 0.0 | 2 | 605 / 270 (+124%) | 100% | 0/12 | 605 | 31 | 100% |
| K2 2-2 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 610 / 325 (+88%) | 100% | 0/12 | 610 | 31 | 94% |
| K2 2-3 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 618 / 390 (+58%) | 100% | 0/12 | 618 | 31 | 93% |
| K2 2-4 | 1.0 (1, 1) | 0/12 | 0.0 | 4 | 630 / 415 (+52%) | 100% | 0/12 | 630 | 32 | 91% |
| K2 2-5 | 1.0 (1, 1) | 0/12 | 0.0 | 4 | 653 / 460 (+42%) | 100% | 0/12 | 653 | 33 | 76% |
| K2 3-1 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 669 / 410 (+63%) | 100% | 0/12 | 669 | 33 | 95% |
| K2 3-2 | 1.0 (1, 1) | 0/12 | 0.0 | 4 | 680 / 440 (+55%) | 100% | 0/12 | 680 | 34 | 95% |
| K2 3-3 | 1.2 (1, 3) | 0/12 | 0.1 | 5 | 696 / 545 (+28%) | 92% | 0/12 | 696 | 34 | 96% |
| K2 3-4 | 1.2 (1, 3) | 0/12 | 0.1 | 6 | 718 / 560 (+28%) | 92% | 0/12 | 724 | 35 | 95% |
| K2 3-5 | 1.3 (1, 3) | 0/12 | 0.2 | 7 | 753 / 690 (+9%) | 83% | 0/12 | 754 | 37 | 65% |
Tổng: 57 lần chơi (trung vị 57, 52–63), 261 phút = 4.4 giờ cả ải ngày (178 phút cho 15 ải thường, phần còn lại là độ khó 2 + ải ngày). *Quá dễ = thắng ngay lần thử đầu khi Sức mạnh < 90% khuyên dùng.

### 2.2 Bot Kiếm, không nghe khuyên dùng: cứ vào ải mới, thua thì chơi lại ải cũ một lượt (12 lượt)

| Ải | Lần chơi TB (trung vị, lớn nhất) | Lượt kẹt ≥ 6 lần | Thua TB | Phút (cả cày) | SM lần thử đầu / khuyên dùng | Thắng lần thử đầu | Quá dễ* | SM khi qua | Cấp khi qua | Máu còn khi thắng |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 100 / 95 (+5%) | 100% | 0/12 | 100 | 1 | 90% |
| 1-2 | 1.0 (1, 1) | 0/12 | 0.0 | 3 | 108 / 105 (+3%) | 100% | 0/12 | 108 | 2 | 83% |
| 1-3 | 1.2 (1, 3) | 0/12 | 0.1 | 5 | 128 / 125 (+2%) | 92% | 0/12 | 128 | 3 | 80% |
| 1-4 | 1.2 (1, 3) | 0/12 | 0.1 | 6 | 138 / 140 (-1%) | 92% | 0/12 | 139 | 4 | 84% |
| 1-5 | 2.8 (3, 7) | 2/12 | 0.9 | 15 | 147 / 175 (-16%) | 42% | 5/12 | 160 | 6 | 49% |
| 2-1 | 1.2 (1, 3) | 0/12 | 0.1 | 5 | 174 / 180 (-3%) | 92% | 1/12 | 175 | 7 | 65% |
| 2-2 | 3.2 (3, 7) | 1/12 | 1.1 | 12 | 192 / 215 (-11%) | 33% | 0/12 | 210 | 10 | 74% |
| 2-3 | 4.7 ⚠ (3, 13) | 4/12 | 1.8 | 16 | 224 / 260 (-14%) | 25% | 2/12 | 251 | 13 | 71% |
| 2-4 | 6.8 ⚠ (7, 13) | 7/12 | 2.9 | 25 | 262 / 275 (-5%) | 8% | 0/12 | 289 | 16 | 82% |
| 2-5 | 7.2 ⚠ (4, 17) | 5/12 | 3.1 | 26 | 297 / 305 (-3%) | 17% | 0/12 | 322 | 19 | 62% |
| 3-1 | 1.0 (1, 1) | 0/12 | 0.0 | 5 | 354 / 310 (+14%) | 100% | 0/12 | 354 | 20 | 73% |
| 3-2 | 1.5 (1, 3) | 0/12 | 0.2 | 7 | 368 / 330 (+12%) | 75% | 0/12 | 372 | 21 | 82% |
| 3-3 | 2.0 (1, 5) | 0/12 | 0.5 | 10 | 383 / 410 (-7%) | 67% | 0/12 | 393 | 22 | 89% |
| 3-4 | 4.2 (4, 9) | 2/12 | 1.6 | 21 | 415 / 420 (-1%) | 17% | 0/12 | 450 | 25 | 79% |
| 3-5 | 4.0 (3, 9) | 3/12 | 1.5 | 22 | 469 / 520 (-10%) | 33% | 1/12 | 505 | 27 | 55% |
Tổng: 43 lần chơi (trung vị 44, 33–53), 203 phút = 3.4 giờ cả ải ngày (180 phút cho 15 ải thường + ải ngày). *Quá dễ = thắng ngay lần thử đầu khi Sức mạnh < 90% khuyên dùng.

### 2.3 Món chính khác (nghe khuyên dùng, mỗi loại 8 lượt)

| Món chính | Lần chơi cả 15 ải | Thời gian (cả ải ngày) | Ải nặng nhất |
|---|---|---|---|
| Kiếm | 42 | 3,3 giờ | 3-5: 5,8 lần (6/12 lượt kẹt) · 2-5: 5,7 lần · 3-3: 4,8 lần |
| Thương | 40 | 3,1 giờ | 2-5: 6,9 lần ⚠ · 1-5: 5,5 lần |
| Búa | 41 | 3,2 giờ | **2-5: 9,1 lần, cả 8/8 lượt kẹt, thua hết lần thử đầu** · 3-5: 4,6 lần · 1-4: 4,2 lần |

### 2.4 Ải kẹt / quá dễ (so với `G.STAGE_REC`)

**Kẹt** (trung bình ≥ 6 lần, hoặc từ 1/3 số lượt trở lên bị kẹt):

- **2-5** kẹt với mọi kiểu chơi: Kiếm 5,7 lần, Thương 6,9, Búa 9,1, không nghe khuyên dùng 7,2.
- **2-4**: không nghe khuyên dùng 6,8 lần (7/12 lượt kẹt).
- **3-5**: Kiếm 5,8 lần (6/12 kẹt).
- **3-3**: 4,8 lần (5/12 kẹt). Ở 3-3 bot nghe khuyên dùng phải cày 3,7 lượt, vì khuyên dùng nhảy từ 330 lên 410 (+24%, bước lớn nhất), chứ không phải vì thua.
- **2-3**: không nghe khuyên dùng 4,7 lần (4/12 kẹt).

**Quá dễ:** chỉ gặp khi không nghe khuyên dùng.

- **1-5:** 5/12 lượt thắng ngay dù Sức mạnh chỉ 147, tức −16% so với khuyên dùng.
- Lẻ tẻ ở 2-1, 2-3, 3-5.
- Khi nghe khuyên dùng thì 0/12 ở mọi ải.

**Độ khó 2:** **mọi ải đều quá dễ.** Bot tới với Sức mạnh 582–753, gấp 1,1–4 lần khuyên dùng, và 92–100% qua ngay lần đầu.

### 2.5 Sức mạnh để bot thắng 75%

Gộp bản lưu của cả bot nghe và không nghe khuyên dùng, mỗi bản chơi lại 4 lần. Ký hiệu: "≤" = thắng gần hết, nên con số thật thấp hơn; "> X" = mọi bản lưu đều dưới mức cần.

| Ải | Khuyên dùng | SM thắng 75% | Lệch | Thắng ở SM ±5% khuyên dùng | Khoảng SM đo | Số lượt |
|---|---|---|---|---|---|---|
| 1-1 | 95 | ≤ 100 | ≤ +5% | — | 100–100 | 96 |
| 1-2 | 105 | ≤ 107 | ≤ +2% | 95/96 (99%) | 107–110 | 96 |
| 1-3 | 125 | ≤ 119 | ≤ -5% | 95/96 (99%) | 119–130 | 96 |
| 1-4 | 140 | ≤ 134 | ≤ -4% | 94/96 (98%) | 134–146 | 96 |
| 1-5 | 175 | 177 | +2% | 32/48 (67%) | 139–178 | 96 |
| 2-1 | 180 | 159 | -11% | 45/48 (94%) | 157–213 | 96 |
| 2-2 | 215 | 231 | +8% | 21/40 (52%) | 163–213 | 96 |
| 2-3 | 260 | 284 | +9% | 9/28 (32%) | 197–261 | 96 |
| 2-4 | 275 | > 272 | > -1% | 10/32 (31%) | 213–272 | 96 |
| 2-5 | 305 | > 290 | > -5% | 0/4 (0%) | 261–290 | 96 |
| 3-1 | 310 | 298 | -4% | 39/52 (75%) | 285–355 | 96 |
| 3-2 | 330 | 354 | +8% | 26/48 (54%) | 297–368 | 96 |
| 3-3 | 410 | 453 | +11% | 8/12 (67%) | 319–392 | 96 |
| 3-4 | 420 | 493 | +17% | 1/4 (25%) | 340–411 | 96 |
| 3-5 | 520 | > 491 | > -6% | — | 376–491 | 96 |
| K2 1-1 | 145 | ≤ 141 | ≤ -3% | 24/24 (100%) | 141–518 | 40 |
| K2 1-2 | 165 | 136 | -18% | 15/16 (94%) | 142–541 | 40 |
| K2 1-3 | 195 | ≤ 188 | ≤ -4% | 23/24 (96%) | 188–541 | 40 |
| K2 1-4 | 215 | 183 | -15% | 14/16 (88%) | 213–541 | 40 |
| K2 1-5 | 270 | 294 | +9% | 13/32 (41%) | 265–544 | 40 |
| K2 2-1 | 270 | ≤ 265 | ≤ -2% | 30/32 (94%) | 265–555 | 40 |
| K2 2-2 | 325 | ≤ 317 | ≤ -2% | 31/32 (97%) | 317–555 | 40 |
| K2 2-3 | 390 | 386 | -1% | 25/32 (78%) | 382–555 | 40 |
| K2 2-4 | 415 | 452 | +9% | 4/16 (25%) | 399–564 | 40 |
| K2 2-5 | 460 | 575 | +25% | 4/32 (12%) | 440–611 | 40 |
| K2 3-1 | 410 | 394 | -4% | 17/20 (85%) | 399–611 | 40 |
| K2 3-2 | 440 | 462 | +5% | 11/16 (69%) | 399–611 | 40 |
| K2 3-3 | 545 | > 650 | > +19% | 25/36 (69%) | 543–650 | 40 |
| K2 3-4 | 560 | 633 | +13% | 19/36 (53%) | 557–650 | 40 |
| K2 3-5 | 690 | > 660 | > -4% | 2/8 (25%) | 628–660 | 24 |

**Đo thêm bằng `do_sm75.py`** (đổi cấp để có 5 mức Sức mạnh, mỗi mức 30 lượt cả ải). Lệch so với khuyên dùng:

| Ải | 1-5 | 2-2 | 2-3 | 2-4 | 2-5 | 3-2 | 3-3 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|---|---|
| Khuyên dùng | 175 | 215 | 260 | 275 | 305 | 330 | 410 | 420 | 520 |
| SM thắng 75% | 165 (−6%) | 235 (+9%) | 287 (+10%) | **337 (+22%)** | **386 (+26%)** | 363 (+10%) | 425 (+4%) | **495 (+18%)** | 569 (+9%) |

### 2.6 Thắng cả ải khi Sức mạnh = khuyên dùng: ải thua ở đâu (`do_ai_chet.py`, 20 bản lưu thật × 5 lượt)

| Ải | Thắng ải | Tới phòng trùm | Thắng trùm (trong số lượt tới) | Máu mất: quái thường · tinh anh · trùm |
|---|---|---|---|---|
| 1-1 · 1-2 · 1-3 · 1-4 | 100 · 98 · 98 · 97% | 99–100% | 98–100% | quái 40–51% · tinh anh 24–32% · trùm 24–36% |
| 1-5 | 81% | 100% | 81% (Mộc Tinh) | 35 · 17 · 48% |
| 2-1 | 90% | 92% | 98% | 65 · 16 · 19% |
| 2-2 | **55%** | 63% | 87% | 75 · 10 · 15% |
| 2-3 | **48%** | 52% | 92% | 81 · 9 · 10% |
| 2-4 | **20%** | 20% | 100% | **92** · 6 · 2% |
| 2-5 | **10%** | 13% | 77% | **87** · 9 · 4% |
| 3-1 | 89% | 91% | 98% | 73 · 4 · 23% |
| 3-2 | 62% | 66% | 94% | 78 · 10 · 12% |
| 3-3 | 77% | 78% | 99% | 84 · 6 · 10% |
| 3-4 | **47%** | 51% | 92% | **86** · 5 · 9% |
| 3-5 | **38%** | 72% | **53%** (Hồ Tinh) | 68 · 3 · 29% |

Loại quái gây mất máu nhiều nhất (cả ải):

- Vùng 2: bầy nhỏ 21–33%, quái gai 20–27%, xạ thủ 14–23%.
- Vùng 3: **xạ thủ 47–55%**.

## 3. Đường cong cấp độ

### 3.1 Kinh nghiệm theo ải (bot nghe khuyên dùng, độ khó 1)

| Ải | KN thắng 1 lượt (G.stageStats) | KN nhận TB khi đang ở ải này (mọi lượt + ải ngày) | trong đó ải ngày | Lượt cày TB | Cấp lúc thử đầu | Cấp khi qua | Lên mấy cấp từ lúc tới ải này tới lúc tới ải kế | KN cần cho cấp kế (lúc vào) | Số lượt thắng ải này để lên 1 cấp |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 | 100 | 100 | 0 | 0.0 | 1.0 | 1.0 | +1.0 | 100 | 1.0 |
| 1-2 | 160 | 160 | 0 | 0.0 | 2.0 | 2.0 | +1.0 | 150 | 0.9 |
| 1-3 | 220 | 233 | 0 | 0.1 | 3.0 | 3.0 | +2.0 | 200 | 0.9 |
| 1-4 | 280 | 500 | 0 | 1.0 | 5.0 | 5.0 | +2.2 | 300 | 1.1 |
| 1-5 | 340 | 1103 | 0 | 2.6 | 7.2 | 7.6 | +2.0 | 412 | 1.2 |
| 2-1 | 400 | 825 | 425 | 0.0 | 9.2 | 9.2 | +1.2 | 512 | 1.3 |
| 2-2 | 460 | 1088 | 0 | 1.5 | 10.5 | 10.9 | +3.7 | 575 | 1.2 |
| 2-3 | 520 | 2745 | 765 | 3.1 | 14.2 | 14.7 | +1.4 | 758 | 1.5 |
| 2-4 | 580 | 1446 | 170 | 1.2 | 15.6 | 16.5 | +2.7 | 829 | 1.4 |
| 2-5 | 640 | 2769 | 808 | 3.4 | 18.3 | 19.5 | +1.5 | 967 | 1.5 |
| 3-1 | 700 | 800 | 80 | 0.1 | 19.8 | 19.8 | +1.5 | 1042 | 1.5 |
| 3-2 | 760 | 1448 | 560 | 0.2 | 21.3 | 21.3 | +3.1 | 1117 | 1.5 |
| 3-3 | 820 | 3730 | 640 | 3.7 | 24.4 | 24.4 | +0.8 | 1271 | 1.5 |
| 3-4 | 880 | 1740 | 400 | 0.6 | 25.2 | 25.7 | +3.0 | 1308 | 1.5 |
| 3-5 | 940 | 4584 | 800 | 3.7 | 28.2 | 28.9 | +0.8 | 1458 | 1.6 |
Cấp lúc vào vùng (thử đầu ải 1 của vùng): Rừng già 1.0 · Hang biển 9.2 · Lâu đài cổ 19.8; cấp lúc qua 3-5: 28.9; qua K2 3-5: 36.6
KN cả 15 ải: 23271 (ải ngày 4648 = 20%).
Nguồn mất máu (cả chiến dịch, kiểu khuyen): archer 30%, trùm-đánh 11%, spiky 11%, shield 10%, elite 9%, swarm 8%, kami 6%, vùng-trùm 6%, bomber 5%, nimble 2%, rusher 1%, vùng/đạn 1%
Ải ngày mỗi lượt chiến dịch: 30 lượt, thắng 100%, 30 phút.
Lúc kết thúc (sau K2 3-5 nếu có): cấp 37.2, Sức mạnh 762.

**Nhận xét**

- Kinh nghiệm một lượt thắng (`100 + 60·n`) và kinh nghiệm cần lên cấp (`50 + 50·cấp`) tăng gần song song. Để lên một cấp cần thắng 0,9 → 1,6 lượt của ải đang tới, đều dần, không có bậc gãy.
- Các lượt cày dồn ở 1-5, 2-3, 2-5, 3-3, 3-5 (2,6–3,7 lượt). Lý do là **Sức mạnh chưa đủ** (bot cày để có tiền và linh khí nâng đồ), không phải thiếu kinh nghiệm.
- Cấp tới trần 40 ở cuối độ khó 2: cấp 37 khi độ khó 2 như hiện tại; cấp 38–40 với đề xuất độ khó 2.

### 3.2 Chỉ số theo cấp (`do_cap.py`, cùng đồ: 4 vũ khí Trắng +0)

| Cấp | 1 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 |
|---|---|---|---|---|---|---|---|---|---|
| Máu | 100 | 124 | 154 | 184 | 214 | 244 | 274 | 304 | 334 |
| Đòn | 11,0 | 11,7 | 12,5 | 13,3 | 14,1 | 15,0 | 15,8 | 16,6 | 17,4 |
| Sức mạnh (chỉ cấp) | 99 | 114 | 132 | 148 | 165 | 181 | 197 | 213 | 229 |
| Sức mạnh (thêm kỹ năng + chưởng) | 100 | 120 | 146 | 166 | 187 | 207 | 235 | 263 | 296 |
| +% Sức mạnh mỗi cấp quanh mốc | — | +3,6 | +3,1 | +2,1 | +1,9 | +1,7 | +1,5 | +1,4 | +1,3 |

- Máu và đòn tăng **đều**: +6 máu, +1,5% đòn mỗi cấp. Vì cộng đều nên phần trăm giảm dần, đây là chủ ý.
- Các bước nhảy nhỏ (+5–8%) ở cấp 3, 6, 30, 33, 39 đến từ điểm kỹ năng và nút chưởng.
- Từ cấp 1 lên 29, cấp chỉ đem lại khoảng ×2 Sức mạnh, trong khi khuyên dùng tăng ×5,5 (95 → 520). Phần còn lại phải đến từ đồ. Đúng thiết kế "sức mạnh đến từ cày nâng cấp".
- **Không đề xuất đổi** `G.xpNeed`, `G.LVL_HP`, `G.LVL_DMG`, kinh nghiệm ải.

## 4. Từng trùm vùng / trùm nhỏ / tinh anh

#### Từng trùm ở Sức mạnh = khuyên dùng (bot thường né như người chơi; vào thẳng phòng trùm, 60 lượt mỗi dòng)

| Trùm (ải) | SM / khuyên dùng | Thắng: vào thẳng, đủ máu, trùm không lớp thích nghi | Thắng như lượt thật: 90% máu + lớp thích nghi (Kháng Lửa; trùm vùng thêm Chống áp sát) | Thời gian đánh | Máu còn khi thắng | Máu mất / phút | Đòn to nhất (% máu) | Chiêu gây mất máu nhiều nhất (phần trong tổng · to nhất 1 lần) | Chiêu ra nhiều mà gần như không trúng |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 Nấm Chúa | 100/95 | 60/60 (100%) | 60/60 (100%) | 31 s | 98% | 3% | 13% | p2 Hàng nấm độc 58% · 9%; p1 Hàng nấm độc 33% · 13%; p2 Phun bào tử 9% · 7% | p2 Nấm mẹ đẻ con (4.5/ph, trúng 0%); p2 Phun bào tử (3.5/ph, trúng 1%); p1 Nấm mẹ đẻ con (3.0/ph, trúng 0%); p1 Phun bào tử (2.1/ph, trúng 0%) |
| 1-2 Nấm Chúa | 107/105 | 60/60 (100%) | 60/60 (100%) | 39 s | 92% | 9% | 21% | p2 Hàng nấm độc 43% · 13%; p2 Phun bào tử 22% · 15%; p1 Hàng nấm độc 16% · 19% | p2 Nấm mẹ đẻ con (5.3/ph, trúng 0%); p1 Nấm mẹ đẻ con (2.9/ph, trúng 0%); p1 Phun bào tử (2.1/ph, trúng 2%); p1 Hàng nấm độc (1.8/ph, trúng 4%) |
| 1-3 Nấm Chúa | 126/125 | 60/60 (100%) | 60/60 (100%) | 35 s | 95% | 6% | 22% | p2 Hàng nấm độc 49% · 16%; p1 Hàng nấm độc 20% · 22%; p2 Phun bào tử 17% · 13% | p2 Nấm mẹ đẻ con (4.7/ph, trúng 0%); p2 Phun bào tử (3.5/ph, trúng 5%); p1 Nấm mẹ đẻ con (3.1/ph, trúng 0%); p1 Hàng nấm độc (2.2/ph, trúng 3%) |
| 1-4 Nấm Chúa | 141/140 | 60/60 (100%) | 58/60 (97%) | 37 s | 91% | 11% | 22% | p2 Hàng nấm độc 40% · 16%; p1 Hàng nấm độc 32% · 22%; p2 Phun bào tử 27% · 13% | p2 Nấm mẹ đẻ con (5.3/ph, trúng 0%); p1 Nấm mẹ đẻ con (3.0/ph, trúng 0%); p1 Phun bào tử (1.8/ph, trúng 0%) |
| 1-5 Mộc Tinh | 176/175 | 56/60 (93%) | 71/100 (71%) | 80 s | 50% | 60% | 28% | p1 Rễ đâm 17% · 28%; p3 Rừng gai 16% · 14%; p2 Rễ đâm 13% · 14% | p1 Quật cành (1.1/ph, trúng 0%) |
| 2-1 Cua Đá | 181/180 | 60/60 (100%) | 58/60 (97%) | 55 s | 83% | 21% | 52% | p2 Đập càng rung sàn 68% · 36%; p1 Đập càng rung sàn 18% · 52%; p2 Kẹp càng 14% · 28% | p2 Kẹp càng (6.5/ph, trúng 2%); p1 Kẹp càng (2.9/ph, trúng 0%); p1 Đập càng rung sàn (2.9/ph, trúng 3%); p2 Tường tinh thể (1.8/ph, trúng 0%) |
| 2-2 Cua Đá | 218/215 | 59/60 (98%) | 52/60 (87%) | 55 s | 74% | 35% | 51% | p2 Đập càng rung sàn 43% · 36%; p1 Đập càng rung sàn 40% · 51%; p1 Kẹp càng (cận) 10% · 47% | p2 Kẹp càng (6.3/ph, trúng 2%); p1 Kẹp càng (3.2/ph, trúng 2%); p2 Tường tinh thể (1.5/ph, trúng 0%); p1 Tường tinh thể (1.0/ph, trúng 0%) |
| 2-3 Cua Đá | 261/260 | 60/60 (100%) | 60/60 (100%) | 48 s | 78% | 32% | 55% | p2 Đập càng rung sàn 62% · 39%; p1 Đập càng rung sàn 28% · 55%; p1 Kẹp càng (cận) 10% · 51% | p2 Kẹp càng (7.0/ph, trúng 0%); p1 Kẹp càng (2.6/ph, trúng 2%); p2 Tường tinh thể (1.5/ph, trúng 0%) |
| 2-4 Cua Đá | 277/275 | 60/60 (100%) | 60/60 (100%) | 46 s | 80% | 29% | 59% | p2 Đập càng rung sàn 78% · 41%; p1 Đập càng rung sàn 18% · 59%; p1 Kẹp càng (cận) 4% · 54% | p2 Kẹp càng (6.4/ph, trúng 0%); p1 Đập càng rung sàn (3.3/ph, trúng 3%); p1 Kẹp càng (3.1/ph, trúng 1%); p2 Tường tinh thể (1.8/ph, trúng 0%) |
| 2-5 Ngư Tinh | 308/305 | 26/60 (43%) | 67/100 (67%) | 60 s | 30% | 165% | 48% | p1 Bổ rìu san hô 31% · 48%; p2 Bổ rìu san hô 18% · 24%; p2 Sóng thần 16% · 21% | p1 Sóng thần (1.7/ph, trúng 0%); p2 Phun băng (1.6/ph, trúng 1%); p1 Phun băng (1.3/ph, trúng 1%) |
| 3-1 Hổ Lửa | 311/310 | 60/60 (100%) | 53/60 (88%) | 58 s | 91% | 9% | 27% | p2 Vồ lửa (cận) 56% · 27%; p2 Vồ lửa (vùng/đạn) 38% · 8%; p1 Vồ lửa (vùng/đạn) 6% · 8% | p1 Vồ lửa (4.4/ph, trúng 2%); p2 Cào (4.1/ph, trúng 0%); p1 Cào (3.7/ph, trúng 0%); p2 Gầm phun lửa (2.4/ph, trúng 0%) |
| 3-2 Hổ Lửa | 331/330 | 60/60 (100%) | 54/60 (90%) | 54 s | 92% | 7% | 27% | p2 Vồ lửa (vùng/đạn) 64% · 6%; p2 Vồ lửa (cận) 36% · 27% | p2 Cào (4.5/ph, trúng 0%); p1 Vồ lửa (3.9/ph, trúng 0%); p1 Cào (3.0/ph, trúng 0%); p2 Gầm phun lửa (2.3/ph, trúng 0%) |
| 3-3 Hổ Lửa | 413/410 | 60/60 (100%) | 53/60 (88%) | 48 s | 93% | 9% | 51% | p2 Vồ lửa (cận) 57% · 51%; p2 Vồ lửa (vùng/đạn) 42% · 5%; p1 Vồ lửa (vùng/đạn) 2% · 8% | p1 Vồ lửa (4.8/ph, trúng 0%); p2 Cào (4.3/ph, trúng 0%); p1 Cào (3.0/ph, trúng 0%); p2 Gầm phun lửa (2.1/ph, trúng 0%) |
| 3-4 Hổ Lửa | 425/420 | 60/60 (100%) | 58/60 (97%) | 45 s | 92% | 9% | 23% | p2 Vồ lửa (vùng/đạn) 69% · 5%; p1 Vồ lửa (vùng/đạn) 18% · 7%; p2 Vồ lửa (cận) 11% · 23% | p1 Vồ lửa (5.0/ph, trúng 5%); p2 Cào (4.1/ph, trúng 0%); p1 Cào (3.2/ph, trúng 0%); p2 Gầm phun lửa (2.2/ph, trúng 1%) |
| 3-5 Hồ Tinh | 523/520 | 60/60 (100%) | 28/100 (28%) | 42 s | 67% | 47% | 31% | p3 Bão hồ hoả 69% · 18%; p3 Quạt đuôi 12% · 21%; p2 Quạt đuôi 11% · 19% | p2 Vồ nhảy (1.7/ph, trúng 1%); p2 Hồ ly phân thân (1.6/ph, trúng 0%); p2 Hồ hoả (1.6/ph, trúng 2%); p3 Hồ ly phân thân (1.5/ph, trúng 3%) |
| Tinh anh heoNanh (1-3) | 126/125 | 60/60 (100%) | — | 15 s | 95% | 20% | 20% | chiêu riêng (cận) 100% · 20% | — |
| Tinh anh namPhongChua (1-3) | 126/125 | 60/60 (100%) | — | 17 s | 79% | 66% | 18% | chiêu riêng 61% · 17%; vùng/đạn còn lại 23% · 5%; nổ quanh mình (cận) 16% · 18% | — |
| Tinh anh cuaTuong (2-3) | 261/260 | 60/60 (100%) | — | 12 s | 100% | 0% | 0% |  | — |
| Tinh anh caNocChua (2-3) | 261/260 | 60/60 (100%) | — | 14 s | 79% | 95% | 17% | xả gai 89% · 17%; đòn thường 9% · 17%; chiêu riêng (cận) 2% · 14% | — |
| Tinh anh tuongMa (3-3) | 413/410 | 60/60 (100%) | — | 20 s | 100% | 0% | 0% |  | — |
| Tinh anh huChua (3-3) | 413/410 | 60/60 (100%) | — | 24 s | 91% | 19% | 8% | nổ quanh mình 64% · 8%; đòn thường 36% · 8% | — |

#### Đứng sát mép / góc (bot "mep né": đứng lì một chỗ, trùm tới tầm thì chém, chỉ né khi đứng trong vùng đỏ / đạn sắp trúng rồi quay về chỗ; 20 lượt mỗi ô)

Mỗi ô: **máu mất / phút** · thắng / 20 · giây đánh. Đậm + ✓ = chỗ đứng an toàn: máu mất / phút ≤ ½ của đứng giữa VÀ ≤ ½ của bot thường, thắng không kém đứng giữa.

| Trùm (ải) | Bot thường | giữa | mép trên | mép dưới | mép trái | mép phải | góc trên-trái | góc trên-phải | góc dưới-trái | góc dưới-phải | Chỗ an toàn |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1-2 Nấm Chúa | 9% · 20/20 · 39s | 30% · 20/20 · 45s | 45% · 20/20 · 68s | 40% · 20/20 · 71s | 15% · 20/20 · 45s | 21% · 20/20 · 37s | 21% · 20/20 · 66s | 84% · 1/20 · 92s | 78% · 10/20 · 92s | 84% · 0/20 · 0s | không |
| 1-4 Nấm Chúa | 11% · 20/20 · 37s | 48% · 20/20 · 43s | 44% · 20/20 · 70s | 57% · 20/20 · 71s | 24% · 20/20 · 44s | 23% · 20/20 · 39s | 27% · 20/20 · 63s | 91% · 5/20 · 85s | 84% · 8/20 · 95s | 97% · 0/20 · 0s | không |
| 1-5 Mộc Tinh | 60% · 19/20 · 80s | 74% · 19/20 · 76s | 70% · 0/20 · 0s | 67% · 0/20 · 0s | 73% · 10/20 · 123s | 76% · 12/20 · 103s | 88% · 5/20 · 113s | 89% · 4/20 · 117s | 86% · 2/20 · 120s | 104% · 1/20 · 117s | không |
| 2-2 Cua Đá | 35% · 20/20 · 55s | 54% · 20/20 · 50s | **7% · 20/20 · 195s ✓** | **3% · 20/20 · 213s ✓** | 22% · 20/20 · 52s | 27% · 20/20 · 42s | **0% · 20/20 · 55s ✓** | **6% · 20/20 · 141s ✓** | **7% · 20/20 · 138s ✓** | **5% · 20/20 · 164s ✓** | mép trên, mép dưới, góc trên-trái, góc trên-phải, góc dưới-trái, góc dưới-phải |
| 2-4 Cua Đá | 29% · 20/20 · 46s | 36% · 20/20 · 42s | **5% · 20/20 · 164s ✓** | **2% · 20/20 · 179s ✓** | 17% · 20/20 · 46s | 21% · 20/20 · 36s | **2% · 20/20 · 49s ✓** | **5% · 20/20 · 118s ✓** | **6% · 20/20 · 114s ✓** | **2% · 20/20 · 139s ✓** | mép trên, mép dưới, góc trên-trái, góc trên-phải, góc dưới-trái, góc dưới-phải |
| 2-5 Ngư Tinh | 165% · 9/20 · 60s | 209% · 4/20 · 57s | **70% · 15/20 · 109s ✓** | **64% · 16/20 · 123s ✓** | 91% · 12/20 · 98s | 110% · 10/20 · 85s | 188% · 2/20 · 77s | 168% · 3/20 · 75s | 220% · 1/20 · 81s | 141% · 4/20 · 87s | mép trên, mép dưới |
| 3-2 Hổ Lửa | 7% · 20/20 · 54s | 46% · 20/20 · 60s | 79% · 16/20 · 65s | 65% · 19/20 · 69s | 69% · 19/20 · 68s | 94% · 15/20 · 58s | 83% · 20/20 · 56s | 94% · 17/20 · 62s | 97% · 16/20 · 61s | 101% · 15/20 · 59s | không |
| 3-4 Hổ Lửa | 9% · 20/20 · 45s | 61% · 20/20 · 50s | 74% · 19/20 · 51s | 75% · 20/20 · 50s | 74% · 20/20 · 54s | 85% · 19/20 · 50s | 88% · 19/20 · 51s | 90% · 19/20 · 51s | 104% · 17/20 · 50s | 117% · 18/20 · 49s | không |
| 3-5 Hồ Tinh | 47% · 20/20 · 42s | 70% · 20/20 · 49s | 71% · 20/20 · 57s | 86% · 19/20 · 52s | 53% · 20/20 · 57s | 67% · 20/20 · 60s | 77% · 20/20 · 50s | 68% · 20/20 · 53s | 68% · 19/20 · 53s | 95% · 19/20 · 48s | không |
| Tinh anh heoNanh (1-3) | 20% · 20/20 · 15s | 30% · 20/20 · 22s | **0% · 20/20 · 14s ✓** | 39% · 20/20 · 17s | 28% · 20/20 · 27s | 17% · 20/20 · 21s | 33% · 20/20 · 21s | 10% · 20/20 · 17s | 20% · 20/20 · 17s | 67% · 20/20 · 19s | mép trên |
| Tinh anh namPhongChua (1-3) | 66% · 20/20 · 17s | 83% · 20/20 · 16s | 86% · 20/20 · 16s | 74% · 20/20 · 17s | 79% · 20/20 · 18s | 87% · 20/20 · 17s | 38% · 20/20 · 22s | 56% · 20/20 · 17s | 61% · 20/20 · 19s | 43% · 20/20 · 19s | không |
| Tinh anh cuaTuong (2-3) | 0% · 20/20 · 12s | 0% · 20/20 · 12s | **0% · 20/20 · 14s ✓** | **0% · 20/20 · 15s ✓** | **0% · 20/20 · 15s ✓** | **0% · 20/20 · 12s ✓** | **0% · 20/20 · 15s ✓** | **0% · 20/20 · 13s ✓** | **0% · 20/20 · 14s ✓** | **0% · 20/20 · 14s ✓** | mép trên, mép dưới, mép trái, mép phải, góc trên-trái, góc trên-phải, góc dưới-trái, góc dưới-phải |
| Tinh anh caNocChua (2-3) | 95% · 20/20 · 14s | 85% · 20/20 · 19s | 95% · 20/20 · 29s | 149% · 20/20 · 32s | 112% · 20/20 · 24s | 65% · 20/20 · 31s | 104% · 19/20 · 47s | 141% · 20/20 · 28s | 123% · 19/20 · 57s | 95% · 20/20 · 35s | không |
| Tinh anh tuongMa (3-3) | 0% · 20/20 · 20s | 0% · 20/20 · 21s | 28% · 20/20 · 34s | 44% · 20/20 · 36s | 68% · 20/20 · 26s | 87% · 20/20 · 23s | 60% · 20/20 · 24s | 72% · 20/20 · 27s | 48% · 20/20 · 25s | 65% · 20/20 · 28s | không |
| Tinh anh huChua (3-3) | 19% · 20/20 · 24s | 34% · 20/20 · 26s | 51% · 20/20 · 24s | 45% · 20/20 · 25s | 47% · 20/20 · 35s | 51% · 20/20 · 29s | 46% · 20/20 · 37s | 50% · 20/20 · 21s | 42% · 20/20 · 24s | 50% · 20/20 · 41s | không |

#### Đứng im không né, không đánh (máu không hết, đo máu mất / phút theo chỗ đứng; 2 × 60 giây mỗi ô) — pha 1 / pha sau (máu trùm ép 45%)

| Trùm (ải) | giữa | mép trên | mép dưới | mép trái | mép phải | góc trên-trái | góc trên-phải | góc dưới-trái | góc dưới-phải | Thấp nhất / cao nhất |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-2 Nấm Chúa | 294 / 306 | 227 / 259 | 277 / 238 | 249 / 295 | 279 / 291 | 235 / 248 | 287 / 208 | 260 / 283 | 235 / 211 | 77% |
| 1-4 Nấm Chúa | 316 / 406 | 282 / 253 | 265 / 290 | 332 / 355 | 332 / 315 | 284 / 290 | 325 / 259 | 303 / 305 | 279 / 217 | 80% |
| 1-5 Mộc Tinh | 510 / 479 | 539 / 412 | 519 / 440 | 517 / 393 | 519 / 434 | 494 / 329 | 563 / 449 | 435 / 331 | 514 / 422 | 77% |
| 2-2 Cua Đá | 746 / 882 | 738 / 789 | 762 / 788 | 598 / 738 | 651 / 894 | 588 / 685 | 710 / 855 | 614 / 681 | 762 / 701 | 77% |
| 2-4 Cua Đá | 919 / 1033 | 761 / 931 | 815 / 934 | 788 / 906 | 860 / 1026 | 761 / 809 | 818 / 966 | 675 / 787 | 845 / 978 | 73% |
| 2-5 Ngư Tinh | 620 / 696 | 632 / 766 | 706 / 721 | 674 / 726 | 704 / 765 | 586 / 737 | 679 / 746 | 475 / 690 | 669 / 733 | 67% |
| 3-2 Hổ Lửa | 1530 / 1679 | 1493 / 1667 | 1576 / 1679 | 1459 / 1574 | 1604 / 1642 | 1502 / 1655 | 1621 / 1661 | 1408 / 1596 | 1596 / 1699 | 87% |
| 3-4 Hổ Lửa | 1337 / 1461 | 1339 / 1480 | 1382 / 1511 | 1327 / 1445 | 1405 / 1489 | 1301 / 1360 | 1402 / 1521 | 1318 / 1441 | 1393 / 1494 | 93% |
| 3-5 Hồ Tinh | 1046 / 772 | 1085 / 688 | 1091 / 559 | 1067 / 492 | 1112 / 475 | 894 / 513 | 909 / 466 | 1094 / 411 | 1028 / 490 | 80% |
| Tinh anh heoNanh (1-3) | 460 / 425 | 436 / 448 | 456 / 480 | 418 / 412 | 455 / 566 | 470 / 463 | 506 / 549 | 392 / 390 | 611 / 548 | 64% |
| Tinh anh namPhongChua (1-3) | 413 / 413 | 436 / 452 | 397 / 400 | 309 / 303 | 310 / 283 | 282 / 312 | 357 / 318 | 295 / 309 | 310 / 301 | 65% |
| Tinh anh cuaTuong (2-3) | 561 / 671 | 561 / 560 | 607 / 544 | 596 / 524 | 540 / 611 | 519 / 531 | 540 / 600 | 519 / 539 | 530 / 606 | 86% |
| Tinh anh caNocChua (2-3) | 373 / 295 | 195 / 195 | 195 / 246 | 271 / 307 | 322 / 316 | 330 / 279 | 305 / 318 | 127 / 178 | 297 / 352 | 34% |
| Tinh anh tuongMa (3-3) | 754 / 738 | 884 / 722 | 787 / 722 | 689 / 655 | 817 / 803 | 655 / 671 | 738 / 787 | 655 / 671 | 786 / 706 | 74% |
| Tinh anh huChua (3-3) | 668 / 649 | 632 / 638 | 629 / 628 | 614 / 609 | 637 / 618 | 614 / 632 | 645 / 637 | 601 / 614 | 615 / 638 | 90% |

#### Đứng sát mép KHÔNG né (đứng lì + chém, máu thật, có bình; 10 lượt mỗi ô): số lượt thắng

| Trùm (ải) | giữa | mép trên | mép dưới | mép trái | mép phải | góc trên-trái | góc trên-phải | góc dưới-trái | góc dưới-phải |
|---|---|---|---|---|---|---|---|---|---|
| 1-2 Nấm Chúa | 3/10 | 0/10 | 0/10 | 0/10 | 4/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 1-4 Nấm Chúa | 1/10 | 0/10 | 0/10 | 0/10 | 2/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 1-5 Mộc Tinh | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 2-2 Cua Đá | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 2-4 Cua Đá | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 2-5 Ngư Tinh | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 3-2 Hổ Lửa | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 3-4 Hổ Lửa | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| 3-5 Hồ Tinh | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| Tinh anh heoNanh (1-3) | 6/10 | 10/10 | 10/10 | 0/10 | 1/10 | 10/10 | 9/10 | 10/10 | 10/10 |
| Tinh anh namPhongChua (1-3) | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Tinh anh cuaTuong (2-3) | 10/10 | 5/10 | 4/10 | 10/10 | 10/10 | 6/10 | 7/10 | 6/10 | 5/10 |
| Tinh anh caNocChua (2-3) | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 | 7/10 | 10/10 |
| Tinh anh tuongMa (3-3) | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |
| Tinh anh huChua (3-3) | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 | 0/10 |

**Nhận xét**

- **Thắng khi đánh như lượt thật:**
  - Trùm nhỏ 87–100%: quá dễ ở vùng 1 và vùng 3, vừa ở vùng 2.
  - Mộc Tinh 71%, Ngư Tinh 67%, **Hồ Tinh 18–28%**.
  - Thời gian đánh: trùm nhỏ 30–115 giây, trùm vùng 80–120 giây, tinh anh 12–24 giây.
- **Máu mất ở phòng trùm khi đánh như lượt thật** (`so-lieu-A/ai-chet-*.md`):
  - Mộc Tinh: Mưa quả độc và Rễ đâm.
  - Ngư Tinh: **Sóng thần pha 2–3, 70%**.
  - Hồ Tinh: Bão hồ hoả 18%, Quạt đuôi 12–16% mỗi pha (đòn to nhất 33%), Hồ ly phân thân 9%, Vũng lửa ma 9%. Vũng lửa ma là chiêu của Chống áp sát.
  - Hổ Lửa: Vồ lửa pha 2 chiếm 60–85%, có đòn mất 51–55% máu một lần.
- **Bot đứng sát mép nhưng KHÔNG né** thì thua ở mọi chỗ, với mọi trùm. Chỉ ba tinh anh vùng 1–2 là thắng được (Heo Nanh, Nấm Phồng Chúa, Cá Nóc Chúa; Cua Tướng thắng 4–10/10 tuỳ chỗ). Vậy **không có chỗ "đứng chém là thắng"**. Chỗ an toàn chỉ có khi vừa đứng mép vừa né.
- **Chỗ an toàn** (đánh dấu ✓ trong bảng): Cua Đá (mép trên, mép dưới, 4 góc), Ngư Tinh (mép trên, mép dưới), tinh anh Heo Nanh (mép trên), tinh anh Cua Tướng (mọi chỗ, vì né là không trúng).
- **Cua Đá:** khi em bé ở mép trên/dưới hoặc góc, trận kéo dài 114–213 giây thay vì 42–55 giây. Trùm ít khi vào tầm, chiêu ra chủ yếu hụt.
- Chủ dự án nói "mép trên/phải". Bot đo được: **mép phải** mất 21–27%/phút, khoảng một nửa so với đứng giữa (36–54). Đỡ hơn giữa nhưng chưa an toàn như mép trên/dưới (2–7%/phút).
- **Cua Đá đang được phiên `cua-tuong-kho` sửa.** Đo lại sau khi phiên đó gộp: `python3 $D/do_trum_a.py mep 6,8 20 --ne`.

## 5. Đề xuất số cụ thể (đã thử trong bộ nhớ, chưa sửa game)

### 5.1 Quái thường và trùm vùng, độ khó 1 (`G.STAGE_K`, `game/js/data.js`; mã thử: `de_xuat_a.js`)

Cách tính:

- Máu và sát thương của trùm = chỉ số quái của ải × cột boss. Vì vậy khi nhân cột quái với s thì phải chia cột boss cho s, để trùm nhỏ và Ngư Tinh giữ nguyên.
- Ngư Tinh giảm riêng sát thương ×0,9. Hồ Tinh giảm như mục tóm tắt.

| Ải | s (quái) | `G.STAGE_K.mob` cũ → mới | `G.STAGE_K.boss` cũ → mới | Ghi chú |
|---|---|---|---|---|
| 2-2 | 0,89 | [1.58, 2.14] → **[1.41, 1.90]** | [1.44, 2.54] → **[1.62, 2.85]** | Cua Đá giữ nguyên |
| 2-3 | 0,89 | [1.63, 2.27] → **[1.45, 2.02]** | [1.48, 2.61] → **[1.66, 2.93]** | Cua Đá giữ nguyên |
| 2-4 | 0,81 | [1.44, 2.43] → **[1.17, 1.97]** | [1.31, 2.62] → **[1.62, 3.23]** | Cua Đá giữ nguyên |
| 2-5 | 0,78 | [1.40, 2.61] → **[1.09, 2.04]** | [0.96, 1.98] → **[1.23, 2.28]** | Ngư Tinh: máu giữ, sát thương ×0,9 |
| 3-2 | 0,90 | [1.74, 3.25] → **[1.57, 2.93]** | [1.31, 2.13] → **[1.46, 2.37]** | Hổ Lửa giữ nguyên |
| 3-4 | 0,82 | [1.62, 2.98] → **[1.33, 2.44]** | [1.18, 2.33] → **[1.44, 2.84]** | Hổ Lửa giữ nguyên |
| 3-5 | 0,95 | [1.29, 3.00] → **[1.23, 2.85]** | [1.29, 2.71] → **[1.11, 2.11]** | Hồ Tinh: máu ×0,81, sát thương ×0,74 |

**Không đổi:** 1-x, 2-1, 3-1, 3-3 và `G.STAGE_REC`. Khuyên dùng giữ nguyên `[95, 105, 125, 140, 175, 180, 215, 260, 275, 305, 310, 330, 410, 420, 520]`.

**Kết quả thử bằng bot (trước → sau):**

| Ải | Thắng cả ải ở SM = khuyên dùng | Tới phòng trùm | Thắng trùm khi tới |
|---|---|---|---|
| 2-2 | 55% → **77%** | 63 → 82% | 87 → 94% |
| 2-3 | 48% → **78%** | 52 → 83% | 92 → 94% |
| 2-4 | 20% → **73%** | 20 → 76% | 100 → 96% |
| 2-5 | 10% → **64%** | 13 → 75% | 77 → 85% |
| 3-2 | 62% → **72%** | 66 → 75% | 94 → 96% |
| 3-4 | 47% → **78%** | 51 → 79% | 92 → 99% |
| 3-5 | 38% → **67%** | 72 → 82% | 53 → 82% |

Đánh riêng trùm như lượt thật, sau đề xuất:

- Ngư Tinh 67% → **75%**.
- Hồ Tinh 18–28% → **67%**.
- Cua Đá 2-2…2-4: 87–100% (không đổi).
- Hổ Lửa 3-2, 3-4: 92–97% (không đổi).

Chiến dịch 12 lượt với đề xuất:

| Kiểu bot | Lần chơi cả 15 ải | Thời gian | 2-4 | 2-5 | 3-5 | Ải còn ⚠ |
|---|---|---|---|---|---|---|
| Nghe khuyên dùng | 42 → **35** | 3,0 → 2,5 giờ (thêm ải ngày) | 3,2 → 1,2 | 5,7 → 4,2 | 5,8 → 3,8 | 3-3: 5,2 lần, do cày tới khuyên dùng 410 |
| Không nghe khuyên dùng | 43 → **33** | 3,0 → 2,4 giờ | 6,8 → 2,0 | 7,2 → 4,8 | 4,0 → 3,2 | 2-3: 4,3 lần (Sức mạnh lúc tới thấp hơn khuyên dùng 17%) |

**Lưu ý**

- Tổng thời gian ngắn đi khoảng 15%. Nếu chủ dự án muốn giữ ~3 giờ, có hai cách:
  - giảm nhẹ tay hơn: dùng s của lần thử đầu, tức 0,94 / 0,94 / 0,87 / 0,85 / 0,94 / – / 0,90 (bot thắng 52–76% ở các ải đó);
  - hoặc nâng `G.STAGE_REC` 3-3 → 3-5 lên 5%.
- Máu quái vùng 2 sau đề xuất hơi răng cưa: 2-3 = 261, 2-4 = 240, 2-5 = 251 (máu gốc × cột). Sát thương vẫn tăng dần (29 → 31 → 35). Muốn đều thì dời một phần giảm của 2-4 / 2-5 từ cột máu sang cột sát thương.

### 5.2 Khuyên dùng `G.STAGE_REC`

**Giữ nguyên nếu làm mục 5.1.** Nếu không sửa quái mà chỉ muốn con số khuyên dùng "nói thật", thì theo số đo cần:

| Ải | 2-2 | 2-3 | 2-4 | 2-5 | 3-2 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|
| Cũ | 215 | 260 | 275 | 305 | 330 | 420 | 520 |
| Theo số đo | 235 | 285 | 335 | 385 | 360 | 495 | 570 |

Không khuyên chọn cách này:

- 3-1 chỉ cần khoảng 300, nên dãy khuyên dùng sẽ phải đi lên rồi tụt.
- Hoặc phải nâng 3-1 lên ≥ 390, khi đó bot cày thừa rất nhiều ở 3-1.

### 5.3 Độ khó 2 (trang việc "làm khó hơn"; mã thử: `de_xuat_a_k2.js`)

**Đề xuất:** thay `G.DIFF2` (theo vùng: [1.6, 1.5] · [1.3, 1.3] · [1.1, 1.15]) và `G.DIFF2_REC` bằng hai bảng theo **từng ải**:

- khuyên dùng độ khó 2 `K2_REC[k]`;
- hệ số `m[k]`, nhân cả máu lẫn sát thương quái và trùm, tính trên chỉ số ải thường **sau mục 5.1**.

Kinh nghiệm và vàng ×1,5 như cũ. Cần sửa `G.stageStats(r, i, 1)` và `G.stageRec(r, i, 1)` trong `data.js`.

| Ải | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 2-1 | 2-2 | 2-3 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Khuyên dùng K2 cũ | 145 | 165 | 195 | 215 | 270 | 270 | 325 | 390 | 415 | 460 | 410 | 440 | 545 | 560 | 690 |
| **Bản "vừa"**: K2_REC | 580 | 595 | 610 | 625 | 645 | 660 | 675 | 690 | 705 | 720 | 735 | 755 | 770 | 785 | 800 |
| m (vừa) | 6.11 | 5.67 | 4.88 | 4.46 | 3.69 | 3.67 | 3.14 | 2.65 | 2.56 | 2.36 | 2.37 | 2.29 | 1.88 | 1.87 | 1.54 |
| **Bản "khó"**: K2_REC | 560 | 575 | 590 | 605 | 615 | 630 | 645 | 660 | 675 | 690 | 705 | 715 | 730 | 745 | 760 |
| m (khó) | 9.19 | 8.38 | 6.96 | 6.23 | 4.81 | 4.79 | 3.95 | 3.20 | 3.07 | 2.77 | 2.79 | 2.63 | 2.06 | 2.05 | 1.61 |

Hệ số `m` hiện tại tương đương khoảng 1,55 / 1,30 / 1,12 theo vùng.

**Kết quả thử** (8 lượt chiến dịch mỗi bản, đã gồm mục 5.1):

| | Lần chơi 15 ải độ khó 2 | Thời gian thêm | Lần chơi mỗi ải K2 | Thắng lần thử đầu | Cấp / Sức mạnh cuối |
|---|---|---|---|---|---|
| Hiện tại | 15–17 | ~50 phút | 1,0–1,3 | 83–100% | 37 / 762 |
| Bản "vừa" | **33** | ~2,8 giờ | 1,0–3,4 | 50–100% (K2 2-5: 50%) | 40 / 796 |
| Bản "khó" | **44** | ~3,5 giờ | 1,0–5,5 (K2 3-3 ⚠) | 50–88% | 40 / 799 |

Thử thêm hai cách khác, đều **vẫn quá dễ** (mọi ải K2 qua ngay lần đầu):

- giữ K2_REC 520 → 690 nhưng quái yếu hơn (E = 0,75 và E = 0,5): K2 thêm 15–19 lần chơi.

Lưu ý:

- Hai bản đều đẩy người chơi tới **cấp 40 và Sức mạnh ~800** ở cuối, tức gần trần. Thử tính trần: cấp 40, Thức tỉnh +15, ép Rực lửa, chưa tính bộ đồ, được 719. Bot có thêm skill bộ nên tới ~800.
- Vì vậy khuyên dùng **K2 3-5 = 800** của bản "vừa" là mức "phải gần tối đa".
- Khuyên chọn **bản "vừa"**: thử thách rõ nhưng không kẹt. Hoặc chọn bản "vừa" với K2_REC tối đa 760 cho đỡ chạm trần (chưa đo).

### 5.4 Kinh nghiệm

Giữ nguyên (mục 3).

## 6. Rủi ro, giới hạn

- **Bot là mô hình né đơn giản** (phản xạ 0,3 giây, lộn 50%, không biết đổi cách đánh khi trùm Chống áp sát).
  - Người chơi giỏi sẽ thấy Hồ Tinh và các ải vùng 2 dễ hơn bot.
  - Nếu thấy dễ quá sau khi sửa, nâng dần s về 1 (mọi số ở `de_xuat_a.js`).
- **Nhiễu:**
  - Thắng ải đo 100 lượt mỗi ải: ±5–9 điểm %.
  - Chiến dịch 12 lượt: ±0,5–1,5 lần chơi ở ải nặng.
  - Sức mạnh 75%: ±5%.
- **`do_sm75.py` đổi Sức mạnh bằng cấp nhân vật.** Sức mạnh đến từ cấp "kém chất" hơn Sức mạnh đến từ đồ, nên số này hơi cao. 2-4 và 2-5 có thể chỉ cần khoảng +12–20%. Bảng thắng ải ở 20 bản lưu thật vẫn cho cùng kết luận.
- **Đo trên commit `853ebf8e`.** Sau đó nhánh có thêm viền vũ khí, sprite Lâu đài, bỏ kẹp cấp theo bậc màu cũ. Không có thay đổi số cân bằng. Phiên `cua-tuong-kho` đang sửa Cua Đá: Cua Đá dự kiến khó hơn, nên 2-1 … 2-4 sẽ thấp hơn bảng một chút. Nên chạy lại `do_ai_chet.py 5,6,7,8 100 --luu=tat.json` sau khi gộp.
- **Không chạy Playwright:** không có điều gì cần đo mà Node không chạy được.
- Không đụng master, không PR, không sửa `game/`.
