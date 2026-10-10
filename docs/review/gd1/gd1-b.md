# GĐ1 — Nhóm 1B: Đánh và né (phiên gd1-b)

Nhánh: `gd1-b` (tách từ `khoi-tao-du-an` lúc 83fd52b2). Chỉ sửa `game/js/combat.js`, `game/js/moves.js`, `game/js/data.js` (chỉ chú thích).
**Không đổi số cân bằng**: sát thương, thời gian từng nhát, hồi chiêu, hồi Né, bất tử khi lộn 0,32 s giữ nguyên.
Theo yêu cầu chủ dự án: **chưa chạy bài kiểm tra nào**, chỉ `node --check` ba file đã sửa (đều qua).

## Đã sửa gì

| ID | Sửa gì | File / hàm |
|---|---|---|
| **V6** | Đang đẩy cần thì tự ngắm chỉ chọn quái trong nón ±60° quanh hướng cần; không có con nào trong nón thì đánh theo hướng cần. Không đẩy cần thì như cũ (gần nhất mọi hướng). Áp cho mọi đòn đi qua `aimM` (chuỗi kiếm, Nhát lướt, đâm/quét giáo, Xốc tới, nện búa, Trảm Nguyệt, Phi Thương, Địa Chấn, **và cả chưởng** vì `chuong.js` gọi `G.moves.aimM`) và cung (`bowTarget` → bắn thường, giương tên mạnh, Mưa Tên qua `bowSpot`). | `moves.js`: hàm mới `inCone` (xuất ra `M.inCone`), `aimM`, `bowTarget` |
| **V7** | (a) Nút Né có bộ nhớ 0,15 s (`P.dodgeBuf`): bấm khi Né còn hồi, đang lướt (Nhát lướt/Xốc tới) hay đang đóng băng thì lộn ngay khi được phép. Trong lúc lướt/đóng băng bộ nhớ **không trôi** (lướt ≤ 0,16 s, đóng băng 0,65 s), ngoài ra trôi dần. (b) Đang lộn thì bộ nhớ nút Đánh (`pressBuf`, `buf`) không trôi → bấm Đánh ở khung 0–3 của cú lộn vẫn ra đòn khi lộn xong (kiếm: Nhát lướt). | `combat.js` `G.updatePlayer` (hằng `DODGE_BUF = 0.15`, khối ngay sau `if (W.over)`; điều kiện lộn); `moves.js` `M.input` |
| **V9** | Vùng báo trước đòn (`G.baoTruoc.draw`) nay vẽ **sau** số sát thương, tên đồ rơi và `fx.drawUI` → vùng đỏ nằm trên số. | `combat.js` cuối hàm vẽ cảnh |
| **V10** | Tiếng "trúng" (`G.sfx('hit')`) một lần mỗi khung khi trúng ≥ 1 quái: đường lướt (Nhát lướt, Xốc tới) trong `combat.js`; Trảm Nguyệt, Phi Thương (bay ra, ghim, bay về), vệt nứt Địa Chấn và sóng búa gộp chung một tiếng mỗi khung trong `M.update`; vòng chấn Địa Chấn lúc nện có tiếng riêng. Chỉ gọi `G.sfx` có sẵn, không đụng `engine.js`. | `combat.js` đoạn `P.dashT > 0`; `moves.js` `stepSpecials` (nay trả về số quái trúng), `M.update`, `M.cast` |
| **V33** | Nhát lướt bất tử trong lúc lướt (`P.inv = max(P.inv, 0,12)`) như Xốc tới, và **huỷ được bằng Né** (cờ `P.dashNe`; chỉ Nhát lướt có, Xốc tới vẫn không huỷ). Lưu ý: vì Né còn hồi 0,75–1 s nên thực tế chỉ huỷ được khi Né đã hồi xong. | `moves.js` `swordGlide`, `dashGo`; `combat.js` đầu đoạn lướt |
| **V34** | Đổi vũ khí giữa đòn: huỷ sạch đòn đang vung ngay khung đó (`atkT = 0`, `hitDone = true`, `cdT = min(cdT, 0,1)`, bỏ `mv.cur`) → không gây sát thương bằng vũ khí mới, không còn hoạt ảnh vũ khí cũ với hình vũ khí mới. Combo/lấy đà về đầu như trước (`M.input` thấy đổi vũ khí). | `combat.js` đoạn `inp.swapP` |
| **V35** | Chỉ thêm chú thích: `G.WTYPES.cd` là số dự phòng cho lối đánh cũ, nhịp thật ở `G.MOVES`. Không đổi số. | `data.js` trên `G.WTYPES` |
| **V79 (O4)** | Mẹo vũ khí chỉ hiện **lần đầu** cho mỗi loại vũ khí trong cả trò chơi: ghi `G.save.tut.mv[loại] = 1` khi hiện (tự tạo `tut.mv` nếu bản lưu cũ chưa có). Không gọi `G.persist` (giống `chuong.js` ghi `tut.chIn`; được lưu cùng lần lưu kế tiếp). | `moves.js` hàm mới `tipSeen`, `tip` |

## CẦN KIỂM TRA KHI KIỂM TRA CHUNG (TONG-HOP mục 4, dòng 1B)

1. `au_ne.py`
   - Mục 3: bấm Né ở khung 50/54/57/59 (hồi xong ở 60) → **lộn ở khung 60**, không còn "MẤT lượt bấm". Bấm sớm hơn ~9 khung (0,15 s) thì vẫn mất — đúng ý.
   - Mục 4: k = 0 và k = 2 (bấm Đánh ngay đầu cú lộn) → **Nhát lướt**. Bất tử lúc lướt nay ≥ 0,12 s (không còn âm).
   - Ca thêm: bấm Né trong lúc đóng băng (nổ Băng) và trong lúc Nhát lướt/Xốc tới → lộn ngay khi hết (nếu Né đã hồi).
2. `au_tu_ngam.py`: đẩy cần ngược phía trùm, quái nhỏ sau lưng → không còn "QUAY NGƯỢC" ở góc 0°/±45°. Không đẩy cần → kết quả như cũ.
3. `au_input.py` B3: đổi vũ khí đúng khung chạm → `hits = 0`, không còn khung vẽ vũ khí mới trong động tác cũ. B5: glide/lunge/special/specialSpear/specialHammer/sóng búa "trúng" → có `hit` **đúng khung** sát thương. (gd1-a đang thêm giới hạn số tiếng trong `engine.js`: nếu giới hạn chặn tiếng trùng khung thì B5 có thể thấy thiếu — xem chung.)
4. `tests/moves.py`, `tests/ui_input.py`, `tests/rules.py`.
5. Chụp `au_hieu_ung.py`, `bao_truoc_shots.py` (và `vfx_ky_nang.py`): vùng đỏ nằm **trên** số sát thương.
6. `au_onboarding.py`: ải 2 không lặp mẹo kiếm; vào 2 ải liên tiếp → lần 2 không có mẹo vũ khí. Lần đầu cầm vũ khí loại mới vẫn có mẹo.
7. `tests/cay.py 12 khuyen`: tự ngắm đổi khi bot đẩy cần (`tests/bot.js`) → số thắng/thời gian có thể xê dịch; so với bản trước, nếu tụt rõ thì báo.

## Điểm cần để ý (rủi ro)

- **Chưởng cũng theo nón hướng cần** (vì dùng chung `aimM`). Nếu muốn chưởng giữ kiểu cũ thì phải sửa `chuong.js` (ngoài phạm vi 1B).
- Bấm Đánh **ngay trước** khi Né rồi lộn: bộ nhớ nút Đánh không trôi trong cú lộn nên lộn xong kiếm có thể ra Nhát lướt (trước đây phần lớn đã hết hạn). Thử tay xem có thấy "tự đánh" không.
- Đổi vũ khí nay cho đánh lại sau ≤ 0,1 s (đề xuất đã duyệt trong TONG-HOP V34); hồi đổi vũ khí 1,5 s vẫn giữ.
- Bộ nhớ Né không bị xoá khi sang phòng (`stage.js` không thuộc 1B); tối đa 0,15 s nên gần như không thấy.
