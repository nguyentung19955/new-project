# Sửa dáng chạy "cà nhắc" (12/10/2026)

Chủ dự án báo: "Nhân vật đi trông như cà nhắc vậy". Phiên này chỉ lo hàng chạy (`move`), đồ bám theo khung chạy và nhịp chân; không đụng hàng đòn, không đổi tốc độ đi.

## Nguyên nhân (đo bằng số)

Đo từng khung hàng chạy của 4 tấm thân gốc (`kiem/ex.py`; đơn vị: điểm ảnh nét ×2, chân chuẩn ở y = 90; 2 điểm ảnh nét = 1 điểm ảnh game).

| Em bé | Khung bật nhảy (chân rời đất) | Hai bước | Đáy chân khung chạm đất | Độ nhấc khung bật |
|---|---|---|---|---|
| Cu Tí (smith), 8 khung | 3, 7 | 4 + 4 khung — đều | 90 / 90 | 7 / 7 — đều |
| **Cu Tèo (hunter), 7 khung** | 2, 6 | **4 + 3 khung** (0,34 s rồi 0,26 s) | 90 / 90 | 8 / 8 |
| **Cu Lì (wrestler), 7 khung** | 2, 6 | **4 + 3 khung** (0,34 s rồi 0,26 s) | 90 / 90 | 9 / 9 |
| **Cái Bống (healer), 8 khung** | 3, 7 | 4 + 4 | **89 (bước A) / 90 (bước B)** | **6 / 4** |

1. **Vòng 7 khung = hai bước lệch (Cu Tèo, Cu Lì).** Ảnh AI vẽ 8 ô: [đứng nhìn thẳng, qua chân, đạp, bật, tiếp đất, qua chân, đạp, bật]. Phiên nhập bỏ ô 1 (đứng) nên bước B mất khung tiếp đất: bước A dài 4 khung, bước B 3 khung, nhịp 4:3 → đúng kiểu khập khiễng. (Đo độ giống chân: khung 2 ≈ khung 6, 1 ≈ 5; khung 3 là khung tiếp đất duy nhất.)
2. **Đồ bám không theo thân (cả 4 em bé khi đội nón, đeo hồ lô, cầm vũ khí — thủ phạm rõ nhất trên màn).** Tệp ghép `ghep-<key>.sprite.json` có điểm `run:0..5` đo trên **hàng chạy cũ 6 khung** (đầu chồm trước ~5 điểm ảnh). Hàng chạy mới thay ảnh nhưng giữ điểm cũ:
   - Khung bật nhảy: đầu nhấc lên 5 điểm ảnh game (đỉnh đầu −32) mà nón vẫn ở −27 → nón lún vào đầu, vũ khí đứng yên khi thân bật lên.
   - Khung 6 (Cu Tèo, Cu Lì) và 6, 7 (Cu Tí) không có trong tệp → game tự ước lượng: nón nhảy ngang **5 điểm ảnh** (x 5,5 → −0,5), hồ lô bật ra sau lưng — **chỉ ở một bước mỗi vòng**, nên mỗi vòng giật một cái lệch bên.
   - Cái Bống đã được đo lại trên thân mới nhưng đỉnh đầu khung 0 (−30) và khung 4 (−28) lệch 2 điểm ảnh.
3. **Cái Bống: bước A cao hơn bước B** 0,5 điểm ảnh game lúc chạm đất và nhảy cao hơn 1 điểm ảnh → một bên nhô cao.
4. **Nhịp chân không theo tốc độ đi.** Vòng chạy chạy theo đồng hồ (0,6–0,65 s) bất kể đi nhanh chậm. Hết tốc: một bước ≈ 19–25 điểm ảnh, khớp sải chân vẽ (~18). Đẩy cần nửa chừng (cần 0,5) hoặc vừa đi vừa đánh (tốc 0,4×): một bước chỉ 10–12 điểm ảnh mà chân vẫn đạp đủ nhịp → chân trượt, đạp tại chỗ.
5. Đã kiểm, **không phải** nguyên nhân: lật trái/phải (tâm đầu mỗi khung lệch ≤ 0,9 điểm ảnh nét, dời +1 khi quay trái là hằng số); G.NHUN_BUOC (4 thân này đã tắt, không nhún chồng); G.CHAY_DANH = 'than' (chạy mà đánh dùng đúng vòng chạy); không có khung trùng hay sai thứ tự ngoài mục 1. Ảnh AI không có khung hỏng → **không cần gen lại**.

## Đã sửa
- **Cu Tèo, Cu Lì: vòng 8 khung** `[0,1,2,3,4,5,6,3]` (thêm khung tiếp đất 3 cho bước B), giữ 0,6 s/vòng → hai bước đều 4 khung, 0,3 s mỗi bước (nhịp bước như trước, không trượt thêm).
- **Cái Bống:** hạ khung 0–3 xuống 1 điểm ảnh nét → mọi khung chạm đất cùng một đường (y 90), đỉnh đầu hai khung bật bằng nhau (27/27).
- **Điểm ghép riêng cho thân gốc:** khoá mới `diem_theo_than` trong tệp ghép (`{"em-be-hunter": {"run:0": …}}`), `js/sprite_custom.js` dùng nó khi vẽ đúng tấm thân đó; thân theo bộ (rừng/biển/lầu, vẫn hàng chạy cũ 6 khung) giữ `diem_theo` cũ, không đổi. Điểm đo bằng chính cách game tự đo (đầu + thân, `SC.khopEmBe`), thân nhún cùng đầu, **hai bước (khung i và i+4) dùng cùng độ dời** → nón, hồ lô, vũ khí nhún đối xứng. Đỉnh đầu theo khung sau sửa: Cu Tèo −26,5 −27 **−32** −27 | −26,5 −27 **−32** −27 (trước: −27 … −27, −32 chỉ ở khung 6). Khoá bộ nhớ đệm lớp đồ thêm mã tấm thân. `build.py` giữ khoá `diem_theo_than`.
- **Nhịp chân theo tốc độ đi:** `js/combat.js` cộng `P.chayT += dt × (tốc đi thật / tốc tối đa)` (kẹp 0,55–1,2), truyền `tc` cho hình; `SC.chonEmBe` chọn khung chạy theo `tc` (thiếu thì như cũ). Chỉ đổi hình — tốc độ đi đo lại y hệt: Cu Tí 72, Cu Tèo 82,8, Cu Lì 64,8, Cái Bống 72 điểm ảnh/giây. Đổi khung/giây: hết tốc 12,7–14, nửa cần 7,3–8, vừa chạy vừa đánh 10,7–11,3. Thân vẽ code (không có ảnh custom) không đổi.

## Ảnh / GIF (phóng ×3)
- `chay-cu-ti-truoc-sau.gif`, `chay-cu-teo-truoc-sau.gif`, `chay-cu-li-truoc-sau.gif`, `chay-cai-bong-truoc-sau.gif`: trái TRƯỚC (bản web đang chạy), phải SAU. Mỗi GIF 4 hàng: chạy phải hết tốc (giáo), chạy trái hết tốc (kiếm), chạy phải nửa cần, vừa chạy vừa đánh (giáo); đều đội nón lá + hồ lô; vạch đất trôi đúng tốc độ đi để thấy chân trượt.
- `bang-chay-truoc.png`, `bang-chay-sau.png`: từng khung chạy, mỗi em bé 3 hàng (phải + đồ, trái + đồ, thân trần).

## Kiểm
- Bản hai tệp (`LK_HAI_TEP=1 python3 game/build.py --hai-tep`, mở `linh-khi-nhe.html?cloud=0`): chơi thật 4 em bé × (hết tốc, nửa cần, chạy mà đánh) có vẽ cảnh (`kiem/choi.py`): **0 pageerror**, 0 lỗi vẽ. `node --check` mọi tệp js, bài lưu mây PASS, `python3 game/build.py` chạy được.
- Không đụng hàng đòn, đăng nhập Google, lưu mây, `?cloud=0`.

Script: `kiem/` (`ex.py` đo khung, `sua.py` sửa ảnh, `do.py` + `ghep.py` đo và ghi điểm ghép, `gif.py`, `ren.py`, `choi.py`).
