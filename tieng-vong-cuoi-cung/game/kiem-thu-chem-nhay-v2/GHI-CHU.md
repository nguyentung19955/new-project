# Lam bỏ chóp mũ, trượt tường quay lưng, hộp đòn sát tầm dao, rút dao + đứng thở, ảnh Vọng / Cộng hưởng / keng – BẢN CHỜ DUYỆT (27/10/2026)

> **Chưa gọi là xong**, đang chờ chủ dự án xem. **Chưa thử trên iPhone thật** (không có máy). Mọi số đo ở đây lấy trong
> Chromium headless trên máy tính.

Làm theo câu trả lời của chủ dự án (27/10, 07:32 + 07:33) trong `../kiem-thu-chem-nhay/GHI-CHU.md`.

## Xem gì
| File | Nội dung |
|---|---|
| **`lam-v2-60fps.mp4`** | **Bản chính**, quay trong game thật ở 60 khung/giây (23,9 s), theo thứ tự: 0) vào ải **rút dao** (52 bước) → **đứng thở** · 1) chạy ↔ đứng (đổi qua lại 6 lần), chạy cả 2 hướng · 2a) tường **bên phải**: bám → trượt → nhảy tường → quay lại · 2b) như vậy với tường **bên trái** · 3) combo chém 1→2→3, chém hất, chém trên không, chém nảy · 4) **Vọng** → chém vỏ cứng (**keng**) → bóng phát (Vọng) → chém cùng lúc với bóng → **Cộng hưởng** |
| `chem-debug-hitbox-60fps.mp4` | Các cảnh chém, bật `?debug=anim`: **hộp đòn đỏ** (đã thu nhỏ), vùng ăn đòn, hộp quái |
| **`so-sanh-chop-lon.png`** | Lam **có chóp (trước) ↔ không chóp (bây giờ)**, cỡ lớn (4 px cho mỗi px logic): đứng, chạy, chém, trượt tường |
| **`so-sanh-chop-112px.png`** | Như trên, ở **đúng 112 px logic** (cỡ thật trong game) |
| `so-do.json`, `log-tung-buoc.csv` | Số đo lấy từ log từng bước logic |
| `../../art/modular/lam-moi/hanh-dong/gif/rut-dao-dung-tho-*.gif` | GIF rút dao + 2 nhịp thở (`-lon` = cỡ lớn, `-112px` = cỡ thật) |
| `../../art/modular/lam-moi/hanh-dong/gif/tuong-truot-nhay-*.gif` | GIF trượt tường quay lưng + nhảy tường |
| `../../art/hieu-ung/sprite/kiem-vong.png`, `kiem-cong-huong.png`, `kiem-keng.png` | Ảnh kiểm tách nền 3 hiệu ứng mới |

Chơi thử: https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(thêm `?debug=anim` để xem hộp đòn). `game/demo-doi-chieu-v3.html` và `art/modular/lam-moi/rig-v3/` **không sửa**.

## Đã đổi gì

### 0. Bỏ hẳn chóp mũ (ở mọi hình)
- Rig-v4: tắt mảnh `chop-mu` (`hien = False`) → clip chạy, sheet hành động, dáng nghỉ, bóng Tiếng Vọng và vệt lướt đều **không còn chóp**.
- Không có chóp thì đỉnh sau của mũ lộ ra một **khấc**: góc mảnh mũ nhô cao hơn lớp gáy và **không có viền đen**. Đã sửa bằng code
  (`rig-v4/code/bo_chop.py`): chỉ trong vùng đỉnh sau, lấp khấc, gọt mấu nhô, rồi kẻ lại **viền đen dày 15 px** (đo đúng viền
  có sẵn, 15–19 px). Phần còn lại của mũ giữ nguyên từng điểm ảnh. Kết quả lưu ở `manh/mu-khong-chop.png` và `manh/mu-gay-khong-chop.png`;
  mảnh gốc vẫn giữ.
- **Người không đổi cỡ**: tỉ lệ 112 px vẫn đo theo dáng nghỉ *có chóp*. Bỏ chóp chỉ làm đỉnh mũ thấp đi 1 px logic (222 so với 224 px nguồn).
- Sheet chạy xuất lại **giống hệt quy cách cũ**: 2142×970, ô 266×241, neo (123, 234), 30 khung, 132 px/chu kỳ.
- Dáng nghỉ mới `game/anim/lam-nghi-v4-2x.png` (không chóp). Ảnh cũ `lam-nghi-2x.png` (có chóp) để nguyên cho `?clip=v3` và bản đối chiếu.
- Ngoài chóp, không đổi gì khác trong thiết kế.

### 1. Bám / trượt tường: QUAY LƯNG vào tường, MẶT HƯỚNG RA ngoài
- Lưng mũ áp đúng mép tường (đo mép sau mũ = −10 px logic so với chân, tức đúng mép collider). Tay sau áp lên tường, gót ủng xa chạm tường.
- Trượt có 2 khung xen kẽ, đổi mỗi 6 px trượt. Vụn gỗ `truot-tuong` hiện ở **chỗ gót ủng chạm tường** (cao 14 px trên chân, sát mép tường).
- **Nhảy tường**: tư thế đạp tường dời theo, để ở bước vẽ đầu tiên (collider đã rời tường 5,4 px) đế ủng chạm đúng tường và tay
  không còn lấn vào tường như bản cũ. Vẫn dùng đúng 6 bước wjT 16–11.
- Quay video đủ **2 phía** tường (phải 2a, trái 2b): 260 bước bám/trượt, 30 bước bám vy = 0, vy trượt tối đa 1,60, có 22 lần vụn gỗ.

### 2. Hộp đòn sát tầm dao (chủ dự án đã duyệt, chỉ đổi đúng 3 hộp)
Đo mũi dao trên rig ở mọi bước hộp đòn bật (tính cả viền nét của ảnh dao), Lam nhìn sang phải, px logic so với chân:

| Đòn | Hộp cũ [x, y, rộng, cao] | Hộp MỚI | Mũi dao xa nhất | Mép trước hộp |
|---|---|---|---|---|
| 1 – chém ngang | [4, −97, **147**, 48] | [4, −97, **91**, 48] | 92,2 px | 151 → **95** px |
| 6 – chém trên không | [−3, −107, **127**, 48] | [−3, −107, **95**, 48] | 89,5 px | 124 → **92** px |
| 3 – bổ xuống | [−13, −59, 99, **64**] | [−13, −59, 99, **59**] | (85, −0,2) | đáy hộp +5 → **0** (đúng mặt đất) |

Mép trước = mũi dao xa nhất + 2 px dung sai, làm tròn lên. (Đề xuất cũ ghi "~100 / ~95" là con số ước; đo lại thì đòn 1 chỉ cần
91 rộng.) Mũi dao vẫn **nằm trong hộp ở mọi bước bật** (8/8 cho đòn 1, 3, 6). Trong video: **9/9 lần ra đòn, bước hộp đòn bật đầu tiên
vẽ đúng khung TRÚNG**; combo 1→2→3 vẫn trúng quái đặt cách 62 px, hitstop 3/4/6 như cũ.
- **Vệt chém**: thu nhỏ còn 0,5 lần cỡ và dời lại để mép trước vệt ≈ mép trước hộp mới (đòn 1: tâm 88 → 58; đòn 6: 86 → 55;
  đòn 3: 72 → 48, đáy vệt không xuống dưới đất).
- **Tia trúng** vẫn tính tại giữa phần giao giữa hộp đòn và thân quái, nên tự theo hộp mới.

### 3. Hitstop + nháy i-frame
Giữ nguyên như cũ: hitstop 3/4/6 bước, và trong lúc hitstop vẫn tắt nháy i-frame.

### 4. Rút dao + đứng thở (thay dáng nghỉ TẠM)
- **Rút dao** (52 bước đầu ải, `RUT_T = 52` của game; `dung_hd.py` kiểm khớp số này): lúc đầu dao cầm ngược trước ngực, lưỡi chĩa
  xuống → hít vào → khuỵu lấy đà → hất tay, lưỡi lật một vòng ra trước rồi dựng thẳng → giơ cao → hạ xuống chào → về thế thủ.
  Khung = `khac.rutdao[RUT_T − drawT]`. Game vẽ 51 bước (drawT 51 → 1); bước cuối đúng bằng dáng nghỉ.
- **Đứng thở** (lặp): 8 khung × 14 bước = 1,87 s mỗi nhịp. Thân nhô lên khoảng 1,25 px logic, mũ gật nhẹ, chuông đung đưa trễ nhịp,
  tay dao nhích 2°, chân đứng yên. **Khung 0 = đúng dáng nghỉ**, đếm từ lúc bắt đầu đứng.
- **Chuyển đứng ↔ chạy không lóe**: trong video có 6 lần chuyển, lần nào cũng nhảy thẳng giữa khung thở và khung chạy, không
  có bước nào rơi vào dáng nghỉ TẠM hay khung lạ. Rút dao xong sang thở cũng liền (nghỉ → thở-0).

### 5. Hiệu ứng Vọng / Cộng hưởng / keng (ảnh gen của chủ dự án)
Cả **3 ảnh đã có** trong `art/hieu-ung/nguon/`. Đã tách bằng `tach-hieu-ung.py` thành `art/hieu-ung/sprite/vong-2x`, `cong-huong-2x`, `keng-2x`.
Thêm 2 tuỳ chọn tách: chia khung theo **cụm** (hạt của khung này lấn sang ô khung kia), và lỗ trắng kín lớn = nền (lòng vòng
Cộng hưởng khung 2). Code không tự vẽ hình hiệu ứng:

| Ảnh | Khi nào | Đặt ở đâu |
|---|---|---|
| vong (5 khung) | lúc bấm Vọng (bắt đầu ghi), và lúc bóng bắt đầu phát | quanh chuông Lam / chuông bóng, đi theo người 20 bước |
| keng (4 khung) | chém trúng **vỏ cứng** (thay cho trung-don thu nhỏ trước đây) | điểm chạm |
| cong-huong (5 khung) | Cộng hưởng (lần đầu to 1,3 lần) | tâm mục tiêu |

Đã bỏ phần vẽ bằng code: hạt vuông lúc Vọng, và vòng pixel + hạt lúc Cộng hưởng. Vẫn giữ chớp màn, rung, chữ "Cộng hưởng!".
Trong video: Vọng 2 lần, keng 2 lần, Cộng hưởng 1 lần.

## Cái chưa đẹp / chưa làm
- **Trượt tường**: đầu chibi rộng 68 px nên khi lưng mũ áp tường thì thân cách giữa collider khoảng +19 px, tức người "dạt" ra
  khỏi tường. Thân đã nghiêng tới 3–4° cho đỡ. Bước bấm nhảy tường vẫn vẽ khung bám 1 bước (game vẫn coi bước đó là đang bám).
- **Rút dao**: tay dao luôn ở phía trước (tay trước vẽ trên cùng), nên không có cảnh rút từ sau lưng. Không có mảnh vỏ dao.
- **Gáy mũ không chóp**: nhìn gần vẫn thấy một bậc nhỏ ở vai mũ (chỗ gáy giáp mũ, có viền đen kín). Ở 112 px gần như không thấy.
- Ảnh Vọng có chuông lớn ở giữa, đè lên ngực + chuông của Lam ở 2–3 khung đầu. Thấy lấn quá thì giảm `k` trong `anim_hd.py → HIEU_UNG.vong`.
- Cộng hưởng khung 4–5: tách theo cụm, nên có 1–2 hạt ở ranh giữa 2 khung có thể bị xếp vào khung bên cạnh (khó thấy vì chạy nhanh).
- Chết: vẫn **TẠM** (dùng khung bị đánh 2). Quái vỡ, mảnh chuông, sóng âm boss: vẫn là hạt cũ (ngoài phạm vi lượt này).
- Sheet hành động lớn hơn: 87 khung, 2037×2048, **~16,7 MB RAM giải nén** (trước 14,9 MB). Bản build tự chứa 11,3 MB.
- Chưa xuất lại ảnh duyệt `rig-v4/tu-the/*` và các biểu đồ chạy (vẫn còn chóp; chỉ là ảnh tham khảo, game không dùng).
- **Chưa thử trên iPhone / Safari** (bộ nhớ, decode, FPS).

## File đổi
- `art/modular/lam-moi/rig-v4/`: `code/bo_chop.py` (mới), `chay_het.py` gọi bo_chop, `khung.py` + `sprite.py` đo tỉ lệ theo bản có chóp;
  `lam-moi-v4.json`; `manh/mu-khong-chop.png`, `manh/mu-gay-khong-chop.png`; sheet chạy + GIF xuất lại.
- `art/modular/lam-moi/hanh-dong/`: `tu_the_hd.py` (tường quay lưng, nhảy tường, thở, rút dao, HOP_ATK mới), `anim_hd.py` (vệt chém,
  truot_tuong, tho/rutdao, 3 hiệu ứng mới), `dung_hd.py` (kiểm RUT_T, meta tho/rut_dao), `gif_hd.py`; sheet + GIF xuất lại.
- `art/hieu-ung/code/tach-hieu-ung.py` + 3 sheet mới.
- `game/demo.html`: ATK[1/3/6].box, dáng nghỉ v4, chọn khung tường/rút dao/thở, hiệu ứng vong/keng/cong-huong. Không đụng phần quái/boss.
- `game/build-demo.py` (dáng nghỉ v4 + 3 hiệu ứng), `game/tools/lam-dang-nghi.py` (tham số `v4`), `game/tools/so-sanh-chop.py`,
  `game/tools/kiem-thu-chem-nhay-v2.py` (mới).

## Chạy lại
```
cd art/modular/lam-moi/rig-v4/code && python3 -B bo_chop.py      # (chay_het.py --nhanh cũng gọi)
python3 -B art/hieu-ung/code/tach-hieu-ung.py
python3 game/tools/lam-dang-nghi.py v4
cd art/modular/lam-moi/hanh-dong/code && python3 -B dung_hd.py && python3 -B gif_hd.py
python3 -B game/tools/so-sanh-chop.py
python3 -B game/tools/kiem-thu-chem-nhay-v2.py                  # quay + đo (~2 phút)
python3 game/build-demo.py
```
Cần pillow, numpy, scipy, playwright + Chromium, ffmpeg.
