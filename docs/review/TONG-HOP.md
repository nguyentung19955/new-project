# TỔNG HỢP RÀ SOÁT — Linh Khí (10/10/2026)

Gộp 5 bản rà soát của các phiên Claude và bản thiết kế của ChatGPT thành **một danh sách việc**, **một kế hoạch** và **một checklist thử tay**.
Tài liệu này **không sửa code game**: chỉ đọc lại các bản rà soát, đối chiếu với code ở những chỗ cần kiểm tra trạng thái (ví dụ bản sửa lưu mây lúc 15:33).

**Ký hiệu nguồn** (cột "Bằng chứng"):

| Ký hiệu | Tệp | Phạm vi |
|---|---|---|
| **[CD]** | `docs/review/AUDIT-CHIEN-DAU.md` | cảm giác đánh, nút bấm, né, báo trước, trùm học (số # là số dòng trong bảng của tệp đó) |
| **[VL]** | `docs/review/AUDIT-VONG-LAP.md` | phòng, tiến triển, cân bằng, kinh tế, bảng vàng (mã 4.1a, 5.4b…) |
| **[UI]** | `docs/review/AUDIT-VAN-HANH-UI.md` | HUD điện thoại, chạm, đăng nhập, lưu mây, hiệu năng, PWA (số #) |
| **[VK]** | `docs/review/AUDIT-VU-KHI-HE.md` | 4 vũ khí, 3 hệ, trùm, đứng spam hay né (mã 1.1, 3.1…) |
| **[KT]** | `docs/review/AUDIT-KIEN-TRUC-TIEP-CAN.md` | người mới, nội dung, âm thanh, truy cập, kiến trúc code (mã O1, N1, S1, T1, K1…) |
| **[TK]** | `docs/review/THIET-KE-CHATGPT.md` | đề xuất thiết kế của ChatGPT (bản sắc vũ khí, phản hồi đòn, vật tương tác, nút kỹ năng, Né chuẩn) |
| **[GY]** | `docs/review/GOP-Y-CHATGPT.md` | bản góp ý gốc: ràng buộc và định nghĩa P0/P1/P2 |

**Loại**: **[LỖI]** game làm sai điều nó nói / điều người chơi mong đợi, có bằng chứng · **[THIẾT KẾ]** chỗ thiết kế có số đo cho thấy đang gây hại · **[Ý TƯỞNG]** gợi ý, không bắt buộc.
**Mức** (theo [GY] mục 11): **P0** không chơi được / mất dữ liệu / bị kẹt · **P1** ảnh hưởng lớn tới cảm giác đánh, độ đọc trận, điều khiển, vòng lặp, cân bằng · **P2** đánh bóng.
**Độ khó**: **S** vài giờ · **M** 1–2 ngày · **L** lớn hơn.

**Việc đã làm trong ngày 10/10 (đã kiểm tra):**
1. **Lưu mây — đã sửa (gộp 15:33)**: `game/js/cloud.js` có `_changeSeq` (chỉ hạ cờ "chưa lưu" khi không có thay đổi mới trong lúc đang ghi) và tự thử lại sau lỗi ghi, giãn dần tới 60 giây; bài `game/tests/cloud_save_regression.test.js`. Ứng với [UI] #3 và #4 → dòng **V62 ĐÃ SỬA**. **Chưa sửa**: [UI] #2 (bản trên máy ghi đè bản trên mây chỉ vì giờ lưu mới hơn): nhánh `pull()` dòng 136–146 vẫn đẩy bản máy lên mà không so tiến độ → dòng **V2** vẫn mở.
2. **"Né chuẩn"**: ChatGPT đã làm bản thử (+5 mana khi bị đánh trúng lúc đang lộn) nhưng **chưa gộp**; bản thử có lỗi: **vũng độc/lửa/băng trên sàn cũng kích hoạt** → xem mục 3, quyết định D1.
3. **Các đợt đồ hoạ (sàn đấu, nhân vật, HUD/đăng nhập) đã gộp sáng nay**; các bản rà soát đã đo lại sau khi gộp. Đợt nhân vật đã sửa luôn lỗi "tư thế lấy đà của quái không kịp chớp" ([CD] #2).
4. **Màn đăng nhập vẫn chưa sửa**: `village.js` dòng 843 nút "Chơi tạm" vẫn chỉ hiện khi `CL.status === 'error'` hoặc chờ > 10 giây → **V1** vẫn là P0.

---

## 0. Đọc nhanh (cho chủ dự án)

1. **Chỉ có một lỗi làm người chơi không vào được game (P0):** trên spiritblade.web.app, nếu đăng nhập Google hỏng (hay gặp nhất khi **mở link từ Zalo, Messenger, Facebook**) thì màn chào **không có nút nào để vào game**. Sửa nhỏ: thêm nút "Chơi tạm". Nên làm **đầu tiên**.
2. **Có hai đường có thể mất tiến trình:** (a) chơi trên hai máy, bản cũ hơn trên một máy có thể **ghi đè** bản trên mây mà không hỏi; (b) nếu sau này một bản cập nhật có lỗi ở phần sửa bản lưu thì bản lưu bị thay bằng bản trắng. Thêm nữa: **máy đăng game không chạy bài kiểm tra nào**, nên một lỗi gõ nhầm là người chơi thấy màn đen. Cả ba đều sửa nhỏ.
3. **Nền tảng đánh đấm đã tốt:** bấm kiếm hay Né là em bé phản ứng sau ~11 mi-li-giây; trúng và hụt khác nhau rõ; né luôn ra được khỏi đòn đã báo; **đứng một chỗ bấm liên tục thì thua mọi trùm** (0/8 lượt), có né thì thắng. Tức là game đã đúng hướng "phải né".
4. **Những chỗ làm cảm giác đánh "sai ý mình":** tự ngắm kéo em bé **quay ngược** về phía trùm; bấm Né hơi sớm thì **mất lượt bấm**; cung/giáo/búa chỉ ra đòn khi **nhấc ngón** (trễ thêm ~0,1 giây); các đòn mạnh nhất trúng mà **không có tiếng**; số sát thương **che vùng báo đỏ**. Đều là sửa nhỏ trong 2 tệp.
5. **Trùm có mấy chỗ không công bằng:** trùm nhỏ vùng Lâu đài cổ (Hổ Lửa…) **một đòn giết bé từ đầy máu** (do một bảng số bị nhân hai lần); "sau chiêu lớn trùm choáng" như hướng dẫn nói **chỉ xảy ra ở 1/3 cuối trận**; Hồ Tinh vồ chỉ báo 0,44 giây, người mới không đi bộ ra kịp.
6. **Bốn vũ khí khác nhau thật**, nhưng **búa yếu nhất đúng ở chỗ nó nên mạnh** (đánh đám): gần một nửa nhát búa bị bỏ dở vì chạm muộn. Kiếm và giáo cho số gần như nhau.
7. **Ba hệ chơi khác nhau thật.** Đề xuất chọn **Băng** làm hệ mẫu hoàn thiện trước (làm chậm, đóng băng cắt đòn quái, bé mất máu ít nhất). **Lửa yếu nhất**, trái với câu gợi ý "Lửa hợp bầy quái" trong game.
8. **Vòng lặp lặp lại nhiều:** qua 15 ải cần ~52 lượt (~3,2 giờ), ~70% là chơi lại; mọi ải cùng bộ phòng, 5/8 phòng là "đánh hết quái", phòng không có địa hình. **Thua thì bảng chỉ khuyên "nâng cấp"**, không nói vì sao thua.
9. **Linh khí "mất trắng" khi đổi vũ khí:** cuối chiến dịch, vũ khí đang cầm thường 0 linh khí, món cũ trong rương có hơn 1.000 — ngược với khẩu hiệu "Vũ khí lớn lên theo bạn".
10. **Người mới bị ngợp:** phòng đầu hai khung chữ 8 dòng cùng lúc; sau ải 1 có **6/7 người làng cùng hiện chấm đỏ**; chữ phụ chỉ ~9 px trên iPhone (nên ≥ 12); người mù màu đỏ–lục thấy vùng báo đỏ và vòng xanh dưới chân em bé **cùng một màu**.
11. **Bảng vàng có thể bị sửa số** từ máy người chơi (kể cả khách). Siết luật Firestore là việc nhỏ nhưng **anh/chị phải tự quyết và tự đưa luật lên**.
12. **Khuyến nghị:** làm **Giai đoạn 1** ngay (P0 + các sửa nhỏ an toàn, ~1,5 ngày, 3 phiên song song); trả lời 13 câu "có/không" ở mục 4 để mở Giai đoạn 2 (cân bằng trùm, búa, Né chuẩn…). **Chưa** làm hệ thống lớn (vật tương tác, nút kỹ năng mới) trước khi có người thật chơi thử.

---

## 1. Bảng vấn đề theo ưu tiên

Tổng: **86 dòng** — **P0: 1 · P1: 30 · P2: 55** (trong P2 có 1 dòng **ĐÃ SỬA**: V62). Đã gộp trùng giữa các bản (dòng nào gộp thì ghi đủ nguồn). Chỗ hai bản nói khác nhau ghi "→ Mâu thuẫn M#" và giải thích ở mục 1b. Những thứ các bản xác nhận là **tốt, giữ nguyên** ở mục 1c.

### 1a. Bảng chính

| # | Mảng | Vấn đề | Loại | Bằng chứng (nguồn audit) | Ảnh hưởng người chơi | Mức | Độ khó | Cách sửa tối thiểu (file/hàm) | Rủi ro hồi quy | Cách kiểm thử / tiêu chí xác nhận |
|---|---|---|---|---|---|---|---|---|---|---|
| **V1** | Đăng nhập | **Kẹt ở màn chào khi Google lỗi mà mây vẫn chạy** — không có nút nào để vào game | [LỖI] | [UI] #1: `village.js` `titleGate` 747–752 bắt Google; nút "Chơi tạm" (843) chỉ hiện khi `CL.status==='error'` hoặc chờ > 10 s; `titleLogin` 753–758 chỉ hiện chữ lỗi. `tests/au_luu.py` giả `auth/popup-blocked`: sau 11 s vẫn không vào được. [KT] O-ghi chú nhắc lại. Đã kiểm tra lại code hôm nay: chưa sửa | Người mở link trong Zalo/Messenger/Facebook, Safari chặn cửa sổ, người không có Google: **không chơi được** | **P0** | S | `village.js` `titleLogin`/`titleGate`: sau lần đăng nhập Google thất bại đầu tiên đặt cờ (ví dụ `V.loginFail = true`) và hiện nút "Chơi tạm (chưa lưu mây)" như nhánh lỗi mây + dòng "Mở bằng Chrome/Safari để đăng nhập Google". Giữ nguyên toạ độ nút chính và `G.syncTaps` | Thấp; nút chính phải giữ chỗ để Safari vẫn mở được cửa sổ Google | `tests/au_luu.py` tình huống 1 → "ĐÚNG"; `tests/may.py` (google, tat) đạt; thử tay mở link từ Zalo trên Android và iPhone (checklist 5b) |
| **V2** | Lưu mây | **Bản trên máy ghi đè bản trên mây chỉ vì giờ lưu mới hơn**, không so tiến độ, không hỏi | [LỖI] | [UI] #2: `cloud.js` `pull()` 136–146 — chỉ hỏi khi mây mới hơn; máy mới hơn thì `_own()` + `push(true)`. `au_luu.py`: mây 5000 vàng/20 sao bị thay bằng 12 vàng/1 sao. Giờ lưu theo đồng hồ từng máy. Bản sửa 15:33 **không** chạm nhánh này (đã đọc lại code) | Mất tiến trình khi chơi hai máy, hoặc chơi "Chơi tạm"/mất mạng rồi mở lại. [UI] xếp "P1, gần P0" | P1 | S–M | `cloud.js` `pull()`: nhánh máy mới hơn cũng so `progress(cloud) >= progress(local) + 8` → hỏi bằng `G.cloudUI.conflict` (dùng lại hộp hỏi đang có) | Trung bình: đụng luồng chọn bản lưu; phải giữ 6 ca `may.py chon` | `au_luu.py` tình huống 4; `tests/may.py chon`; `node game/tests/cloud_save_regression.test.js`; thử tay hai máy (checklist 5b) |
| **V3** | Lưu máy | **Một lỗi nhỏ trong phần sửa bản lưu → cả bản lưu bị thay bằng bản trắng và ghi đè ngay** | [THIẾT KẾ] | [KT] K2: `engine.js` `G.fixSave` 259–343 `catch → return base` (dòng 342); `village.js` 697 `enter` gọi `G.persist()`. `au_luu_hong.py`: 618 kiểu hỏng tự nhiên → 0 lần mất (phần sửa rất chắc), nhưng giả lỗi trong `G.outfit.fix` → **xoá trắng**. Cùng chuyện khi `s.v !== 1` | Nếu một bản cập nhật sau có lỗi ở phần sửa, mọi người chơi mở game là mất hết (trừ khi có bản mây) | P1 | S | `engine.js` `loadSave`: khi có `raw` mà `fixSave` phải trả bản mới (đánh dấu trong nhánh catch / `v` sai) thì chép `raw` sang khoá `linhkhi_save_v1_hong` trước khi chơi tiếp, và `console.error` thay vì nuốt lỗi | Rất thấp | `au_luu_hong.py`: giả lỗi → còn bản sao ở khoá phụ; `au_luu.py`; `may.py` |
| **V4** | Kiến trúc / phát hành | **Máy đăng game không chạy bài kiểm tra nào** | [THIẾT KẾ] | [KT] K1: `.github/workflows/linh-khi-hosting.yml` chỉ `python3 game/build.py` rồi `firebase deploy`; 103 tệp `tests/` không bài nào chạy khi đăng | Một lỗi cú pháp lọt vào nhánh là người chơi thấy màn đen ngay | P1 | S (bước 1) / M (bước 2) | Bước 1: thêm bước `node --check` cho mọi `game/js/*.js` trước "Gói game". Bước 2: cài Playwright, chạy `tests/smoke.py` và `tests/rules.py` | Thấp; đăng chậm thêm 1–3 phút | Đẩy một lỗi cú pháp lên nhánh thử → máy dừng, không đăng |
| **V5** | Trùm / cân bằng | **Trùm nhỏ vùng 3 (và ải 2-1) đánh mạnh hơn trùm vùng; một đòn giết bé từ đầy máu** | [LỖI] | [VK] 5.2: `data.js` `G.STAGE_K.boss` (dòng 216) giống hệt `G.STAGE_K.mob`, mà `boss.js` `makeBoss` 59 nhân thêm → hệ số bị nhân hai lần. Đòn gốc: Hồ Tinh 232; trùm nhỏ 3-1 371, 3-3 412, 3-4 506; 2-1 (104) > 2-2 (71). `au_spam.py`: bot không né ở Hổ Lửa 3-3 gục sau **đúng 1 đòn** (8/8). [KT] K8 xác nhận hai bảng trùng 15 cặp số | Thua trùm nhỏ vì một đòn, "sao trùm nhỏ ác hơn trùm cuối" | P1 | S | `data.js` `G.STAGE_K.boss`: đặt riêng cột sát thương trùm nhỏ vùng 3 (đề xuất [VK]: 4,54→2,6; 4,28→2,6; 4,43→2,7; 4,74→2,9) và 2-1 2,95→2,0; giữ cột máu. **Cần chủ dự án quyết (Q2)** | Ải 3-1..3-4 dễ hơn; có thể phải chỉnh `G.STAGE_REC` | Đòn gốc trùm nhỏ ≤ trùm vùng cùng vùng và ≤ 45% máu bé ở Sức mạnh khuyên dùng; `au_spam.py`: bot không né cần ≥ 2 đòn mới gục; `tests/cay.py 12 khuyen` tổng 2,5–4 giờ |
| **V6** | Chiến đấu / điều khiển | **Tự ngắm chọn quái gần nhất mọi hướng**, bỏ qua hướng cần đang đẩy → Nhát lướt, Xốc tới lao ngược về phía trùm | [LỖI] | [CD] #1: `moves.js` `aimM()` 195–211, `bowTarget()` 333–340, `bowSpot`. `au_tu_ngam.py`: chạy sang tây, trùm ở đông, quái nhỏ sau lưng → Xốc tới lao 33 px về phía trùm; Trảm Nguyệt bắn về trùm phía sau. Đúng mục "auto-aim" ưu tiên 1 của [GY] | Chạy thoát mà bấm đánh thì bị kéo ngược vào nguy hiểm, mất máu không hiểu vì sao | P1 | M | `moves.js` `aimM`/`bowTarget`: khi đang đẩy cần (`P.stickX` khác null) chỉ xét quái trong nón ±60° quanh hướng cần; không có thì đánh theo hướng cần. Không đẩy cần thì giữ như cũ | Bot (`tests/bot.js`) có đẩy cần khi đánh → số cân bằng có thể xê dịch | `au_tu_ngam.py`: không còn "QUAY NGƯỢC" ở góc 0°/±45° khi đẩy cần; `tests/moves.py`; `tests/cay.py` |
| **V7** | Điều khiển / né | **Nút Né không có bộ nhớ**: bấm sớm 1 khung trước khi hồi xong, hoặc trong lúc lướt/đóng băng → mất lượt bấm. Kèm: nút Đánh bấm ở khung 0–3 của cú lộn bị nuốt | [LỖI] | [CD] #4: `combat.js` 648 (`inp.dodgeP && P.dodgeCd <= 0`), 589–612, 579. `au_ne.py`: bấm ở khung 50/54/57/59 (hồi xong ở 60) → "MẤT lượt bấm". [CD] #18: `moves.js` 19 bộ nhớ Đánh 0,25 s < cú lộn 0,28 s. [CD] #20: đóng băng 0,65 s bỏ mọi nút | Hoảng thì bấm Né liên tục; lần "hơi sớm" không ra gì → "nút không ăn" | P1 | S | `combat.js`: thêm `P.dodgeBuf` ~0,15–0,2 s giống `pressBuf`, giữ cả lúc đang lướt và đóng băng, lộn ngay khi được phép; không trừ `pressBuf` khi đang lộn | Lộn "trễ" ngoài ý muốn nếu bộ nhớ dài: giữ ≤ 0,2 s | `au_ne.py` mục 3 (bấm khung 50–59 → lộn ở khung 60), mục 4 (k = 0 → Nhát lướt), thêm ca đóng băng; `tests/ui_input.py` |
| **V8** | Chiến đấu / báo trước | **Một số đòn báo trước quá ngắn để đi bộ ra** (chỉ còn cách lộn) | [THIẾT KẾ] | [CD] #3, bảng 2.6: Hồ Tinh vồ (c1/c2) báo 0,44 s, ra nhanh nhất 0,33 s → dư 0,07–0,11 s; bầy nhỏ 0,42 s dư 0,12–0,17 s (và không có vùng đỏ, [CD] #2); Heo Rừng Nanh Dài, Mèo Đen dư 0,20. [VK] 5.5 ghi Vồ mồi là đòn báo ngắn nhất (pha 3 còn 0,37 s). Phần "tư thế lấy đà không kịp chớp" ([CD] #2) **đã được đợt nhân vật sửa** → Mâu thuẫn M5 | Người chưa quen lộn thấy "không né kịp" ở Hồ Tinh | P1 | S | Hồ Tinh c1/c2: dời mốc ra đòn để báo ≈ 0,6 s (`monster_art.js` mốc `moc`); bầy nhỏ `mobs.js` 365 `role==='swarm' ? 0.42` → 0,5. **Cần quyết (Q4)** | Đổi độ khó Hồ Tinh | `au_bao_truoc.py`: mọi dòng "dư" ≥ 0,25 s; `tests/cay.py`; `au_trum.py` |
| **V9** | Chiến đấu / độ đọc | **Số sát thương vẽ đè lên vùng báo đỏ** | [LỖI] | [CD] #9: `combat.js` 1020–1024 vẽ `baoTruoc.draw` trước chữ và `fx.drawUI`. Ảnh `hieu-ung-phong-thuong-bao-truoc.png`: số 55/55/33 nằm trên vòng đỏ. Trái tiêu chí [GY] ưu tiên 2 "vùng báo nổi hơn số" và [TK] 1.4 | Vùng nguy hiểm bị che đúng lúc cần nhìn | P1 | S | `combat.js` (khối vẽ ~1020): gọi `G.baoTruoc.draw` **sau** `fx.drawUI` | Số có thể bị phủ mờ — chấp nhận | Chụp lại `au_hieu_ung.py`, `bao_truoc_shots.py`, `vfx_ky_nang.py` |
| **V10** | Âm thanh / phản hồi | **Đòn mạnh nhất trúng mà im lặng**: Nhát lướt, Xốc tới, Trảm Nguyệt, Phi Thương, Địa Chấn, sóng búa | [LỖI] | [CD] #5: tiếng "trúng" chỉ trong `gain()` (`moves.js` 264–268) và `doHit`; đường lướt (`combat.js` 596–606), `sweepSeg`/`stepSpecials` (`moves.js` 746–836), sóng búa (861–871) chỉ gọi `playerHit`. `au_input.py` B5. [KT] S4: Địa Chấn trúng 20 quái chỉ 1 tiếng "boom" | Đòn tốn mana thiếu phản hồi, khó biết đã trúng | P1 | S | Ở các đường trên: nếu khung này trúng ≥ 1 quái thì `G.sfx('hit', …)` **một lần mỗi khung** | Ồn hơn — đã giới hạn 1 lần/khung | `au_input.py` B5: mọi dòng "trúng" có khung tiếng = khung sát thương |
| **V11** | Hiệu ứng / độ đọc | **Cảnh đông nhất quá rối**: em bé gần như mất hút, vùng đỏ lẫn vệt cháy | [THIẾT KẾ] | [CD] #10: `au_hieu_ung.py` 12 quái + búa Lửa Thức tỉnh + Địa Chấn + chưởng: hạt chạm trần 400 ở 8–14% khung, hình chạm trần 72 ở 5–7% khung; ảnh `hieu-ung-day-nhat*.png`. Phòng thường (4 quái) chỉ ~1%. Phòng trùm không giới hạn quái sống (`stage.js` 174) → xem M6 | Phòng trùm có quái gọi thêm + chiêu lớn: mất dấu em bé và đòn trùm | P1 | M | `fx.js`: khi hạt > ~300 bỏ hạt trang trí (khói, tàn) trước, giữ hạt phản hồi trúng; nổ dây chuyền thứ 3 trở đi giảm nửa hạt; viền sáng cho em bé khi bị che (dùng lại cách `mobHeroOver`) | Bớt "đã mắt" | `au_hieu_ung.py` (số khung chạm trần giảm, xem ảnh); `tests/perf.py` |
| **V12** | Điều khiển / độ trễ | **Cung, giáo, búa chỉ ra đòn khi nhấc ngón** → trễ thêm đúng bằng thời gian giữ ngón | [THIẾT KẾ] | [CD] #8: `moves.js` 162–165, 517–523. `au_input.py` A1: kiếm/Né 11 ms; cung/giáo/búa 112 ms (giữ 100 ms), 161 ms (giữ 150 ms) | Ba vũ khí "dính" hơn kiếm; bấm nhanh trên điện thoại thấy trễ | P1 | M | `moves.js`: lúc chạm xuống cho em bé vào ngay tư thế "giương/lấy đà" (chỉ hình); nhấc trước 0,16 s thì tung đòn bấm từ tư thế đó; không đổi luật/thời lượng đòn | Phải giữ đúng thời lượng để không đổi DPS | `au_input.py` A1: "vào động tác" ≤ 20 ms cho mọi vũ khí; `tests/moves.py`; `tests/ui_input.py`; `au_dps.py` không đổi quá 3% |
| **V13** | Trùm học theo bạn | **"Chống đánh xa" rất nặng mà không báo**: tên từ xa > 120 px chỉ còn 30% sát thương | [THIẾT KẾ] | [CD] #23: `combat.js` 233; `boss.js` 64, 70–83 (Hồ Tinh còn dịch chuyển ra sau lưng mỗi lần trúng tên). Đúng nỗi lo "bị phạt vì chơi tốt" của [GY] 3.7 | Người chơi cung bị phạt 70% mà không hiểu | P1 | S | `combat.js` 233: khi bị giảm thì số sát thương xám + chữ "Xa quá!" lần đầu; cân nhắc 0,3 → 0,5 (phần số **cần quyết**, gộp vào Q2) | Cân bằng trùm khi chơi cung | `au_trum_hoc.py`; `tests/cay.py` với `prefer: 'bow'` |
| **V14** | Trùm / cửa sổ phản công | **"Sau chiêu lớn trùm choáng" chỉ có ở pha 3**; trùm nhỏ không bao giờ choáng — trái với hướng dẫn | [LỖI] | [VK] 5.1: `boss.js` `tire()` chỉ gọi trong `c5` (146, 171, 205), `c5` chỉ mở ở pha ≥ 2 (216); `thinkMini` không có `tire`. `au_trum.py`: % thời gian "mệt" = 0% ở pha 1–2 cả 3 trùm vùng và mọi pha trùm nhỏ. Hướng dẫn `village.js` 625 hứa "sau chiêu lớn trùm choáng" | 2/3 trận trùm không có khoảnh khắc "xông vào đánh"; đọc hướng dẫn rồi chờ mà không thấy | P1 | S | `boss.js` `SK`: thêm `later(b, D, () => tire(b, 1.0))` vào một chiêu dài có từ pha 1 (Mộc Tinh `c3`, Ngư Tinh `c2`, Hồ Tinh `c4`); `thinkMini`: `tire(b, 0.8)` sau `chieu1`. **Cần quyết (Q3)** | Trận trùm ngắn lại chút | `au_trum.py`: % mệt 5–12% ở mọi pha trùm vùng, > 0 ở trùm nhỏ; `tests/campaign.py`; `tests/cay.py` |
| **V15** | Vũ khí / búa | **Búa yếu nhất khi đánh đám**: 49% nhát bị bỏ dở; Né huỷ nhát búa còn bắt chờ thêm ~0,43 s | [THIẾT KẾ] | [VK] 3.1: `au_vu_khi.py` đám 5 quái búa 56,1 vs kiếm 80,1 (−30%) dù trúng nhiều quái nhất (2,22/nhịp); chạm ở 0,36 s của nhát 0,8 s (`combat.js` `updatePlayer` 683). [CD] #16: `combat.js` 649–650 Né đặt `atkT = 0` nhưng giữ `cdT` → búa đánh lại sau 43 khung (kiếm 17). Hai nguyên nhân bổ sung nhau ([VK] mục 8) | Đúng chỗ búa nên toả sáng thì "cứ vung mà không trúng" | P1 | S | `moves.js` `hammerTap` truyền `hitAt: 0.35` vào `begin`; `combat.js` 683 dùng `P.hitAt` (mặc định 0,55); khi Né: `P.cdT = Math.min(P.cdT, 0.1)`. **Cần quyết (Q5)** | Hình nện phải khớp lúc chạm mới (`hero_art.js` khung trúng 43–53%) | `au_vu_khi.py`: búa %huỷ đám ≤ 30%, st/giây đám ≥ 85% kiếm, 1 quái không vượt kiếm quá 10%; búa đánh lại sau Né ≤ 20 khung; `tests/dps.py`; `au_hitbox_shots.py` |
| **V16** | Hệ / Lửa | **Lửa yếu nhất cả khi đánh đám**, trái với gợi ý "Lửa hợp với bầy quái" | [THIẾT KẾ] | [VK] 4.2: `au_he.py` đám 5 quái Thức tỉnh: Độc 119,4 · Lửa 104,1 · Băng 99,2; Lửa thua Độc ở cả 4 vũ khí. Câu gợi ý `data.js` `G.HINTS[4]` dòng 332 | Chọn Lửa theo lời khuyên lại nhận hệ yếu nhất | P1 | S | Cách 1 (an toàn): sửa câu `G.HINTS[4]` cho đúng số đo. Cách 2 (cân bằng): `moves.js` `G.HE.fire` Nổ lan `boom` 0,5→0,7, `boomR` 34→42. **Cần quyết (Q8)** | Cách 2: ba hệ phải lệch ≤ 15% | `au_he.py` đám: Lửa ≥ Độc (cách 2); `MOT=1`: Lửa vẫn < Độc; `tests/dps.py` |
| **V17** | Thua / học từ thất bại | **Bảng thua chỉ khuyên "nâng cấp"**, không nói mất máu vì gì, trùm kháng/yếu hệ gì, chiêu nào hạ bé | [THIẾT KẾ] | [VL] 4.5b: `stage.js` `panelLose` + `upgrade.js` `G.upgradeTips`; mọi sát thương đã đi qua `G.hurtPlayer(amt, el, src)`; `cay.py`: Gai 22%, đòn trùm 28%, vùng đỏ trùm 16%, Xạ thủ 14%. [VK] 6.1: `panelLose` 1156–1185; có sẵn `S.layers`, `G.layerText`, `b.weak`, tên chiêu `boss.js` `SK[...].name` | Mỗi trùm vùng cần 6–12 lượt → người chơi nhìn bảng thua rất nhiều lần, đúng lúc dễ bỏ game | P1 | S–M | `combat.js` `G.hurtPlayer`: cộng máu mất theo nguồn (vai quái / đòn trùm / vùng trùm), ghi `W.lastHurt` (tên chiêu từ `b.skillName` đặt trong `boss.js` `thinkBig`/`thinkMini`); `stage.js` `panelLose`: thêm 1 dòng "Mất máu nhiều nhất: … — mẹo …" + "Trùm kháng Lửa, yếu Băng · gục vì: Vồ mồi". Bớt 1 gợi ý nâng cấp | Bảng thua đã chật; chữ dài → `ui.wrap` 1 dòng | Ảnh bảng thua ở 3 cỡ màn hình (`ui_shots.py`/`ui_robust.py`); `tests/cay.py` phần LUAT (vẫn 2–3 gợi ý); thua tay 3 kiểu khác nhau |
| **V18** | Linh khí / tiến triển | **Đổi vũ khí là mất hết linh khí**: cuối chiến dịch vũ khí đang cầm thường 0, món cũ 900–1.485 | [THIẾT KẾ] | [VL] 5.4b: `w.marks` theo từng vũ khí (`combat.js` `G.addMarks`); bot đổi vũ khí chính 3–4 lần/chiến dịch; 3/6 chiến dịch kết thúc với vũ khí chính 0 dấu ấn. Nâng bậc ở lò rèn **giữ** dấu ấn nhưng không ai nói. [VK] 3.4 nối vào (vũ khí Trắng không nhận dấu ấn từ đánh thường) | Ngược khẩu hiệu "Vũ khí lớn lên theo bạn": bị phạt khi nhận đồ tốt | P1 | S (bước 1) / M (bước 2) | Bước 1: khi trùm rơi món Vàng, `do_roi.js`/`stage.js` hiện "Món cũ có 312 linh khí: luyện nó lên Vàng ở Thợ Rèn để giữ". Bước 2 (**cần quyết Q11**): Thợ Rèn truyền phần vượt 300 sang vũ khí khác cùng loại | Bước 2: tiến hoá nhanh hơn (chỉ ~5% Sức mạnh) | `au_tien_trien.py linhkhi --n=6`: đếm chiến dịch kết thúc với vũ khí chính 0 dấu ấn; `tests/linhkhi.py` |
| **V19** | Phòng / vòng lặp | **Bộ phòng mỗi ải luôn giống nhau; gần như chỉ "đánh hết quái"**; 70% lượt là chơi lại | [THIẾT KẾ] | [VL] 4.1a: 9.000 bản đồ chỉ ra 3 bộ loại phòng; mục tiêu khác chỉ ở phòng Thử thách (`stage.js` `clearRoom`), có ở 1/3 số ải. [VL] 4.3a: không có lựa chọn kéo dài cả lượt; bùa hệ ở rương chỉ 60 s. Bảng 3.3: 52 lượt, 190 phút | Cùng chuỗi "vào phòng → cửa đóng → đánh hết → cửa mở" hàng trăm lần | P1 | M | Dùng lại phòng Thử thách: thêm biến thể "Trụ được 30 giây" (hết giờ = dọn phòng) bằng đợt quái sẵn có; mỗi ải **luôn** có 1 phòng mục tiêu (`mapgen.js` phòng phụ); bùa hệ ở rương kéo dài hết ải. **Cần quyết (Q10)**. Không thêm loại phòng mới | Giữ đúng luật cửa và `fountainLocked` (`M.check`) | `tests/mapgen.py`, `tests/doors.py`, `au_mapgen.py` (đếm bộ loại phòng); `tests/cay.py 12` tổng vẫn 2,5–4 giờ |
| **V20** | Phòng / địa hình | **Không có địa hình**: mọi phòng cùng một khung, không vật cản; vị trí không tạo quyết định | [THIẾT KẾ] | [VL] 4.1b: `room_art.js` `RA.geo` sàn 208×196 / trùm 300×198; không va chạm vật cản trong `combat.js`/`stage.js`; khác nhau chỉ 3 kiểu nền + 1–2 vật mang hệ (`addEnv`). [TK] 2 đề xuất vật tương tác (xem D5) | Trận nào cũng "đứng giữa sàn trống né vòng đỏ" | P1 | M | Trước tiên: xếp vật mang hệ theo vài **mẫu có chủ đích** (hàng chậu than chắn giữa, bốn góc tinh thể) trong `stage.js` `addEnv`/`propSpot`. Vật cản thật để sau | Vật đặt sai có thể chắn cửa (`propSpot` đã tránh lối cửa) | `au_mapgen.py` (đè vật), `tests/env_rooms.py`, ảnh `room_shots.py` |
| **V21** | Tiến triển / nâng cấp | **Nhiều lớp tăng sức mạnh, phần lớn chỉ cộng chỉ số**; người chơi không biết nên nâng gì | [THIẾT KẾ] | [VL] 5.1a: bỏ từng lớp: trang phục −44%, cấp −34%, mài −26%, bậc màu −20%, cây kỹ năng −10%, linh khí −5%, cây chưởng ~0,4%/điểm. [KT] mục 3: "Sát thương +8%" có 2 lần trong nhánh Công. [TK] 3 đề xuất nút "đổi cách chơi" (xem D6) | Sức mạnh đến từ cày nhiều hơn từ lựa chọn | P1 | S (hiện số) / M (thiết kế) | Việc rẻ trước: mỗi nút nâng cấp hiện "+X Sức mạnh" trước khi bấm (`upgrade.js` `G.upg.rate` đã tính `gain`). Đổi nút kỹ năng: **cần quyết (Q7)** | Thấp nếu chỉ hiện số | Ảnh lò rèn, thợ may (`au_bang.py`, `cay_shots.py`) |
| **V22** | Nhân vật / cân bằng | **Bốn em bé chưa đều**: Thợ Rèn 19/20, Đô Vật 18/20, Thầy Lang 14/20, Thợ Săn 13/20 lượt thắng | [THIẾT KẾ] | [VL] 5.5: `au_tien_trien.py embe`; Sức mạnh hiển thị lệch (Đô Vật +25–40%, Thợ Săn −10–15%, `G.powerParts` không tính tốc độ/nội tại). Bot dùng kiếm cho cả bốn em → mới là tín hiệu | Thợ Săn mở đầu tiên mà thấy "yếu" | P1 | S | Cho người thật thử Thợ Săn với cung/giáo trước; nếu vẫn yếu: `data.js` `G.HEROES.hunter.hp` 75→85. Tính tốc độ vào `G.powerParts`. **Cần quyết (Q12)** | Lệch `cay.py` cho Thợ Săn | `au_tien_trien.py embe --n=8`: mỗi em ≥ 16/20 |
| **V23** | Bảng vàng / an toàn dữ liệu | **Bảng vàng có thể bị sửa số từ máy người chơi** (kể cả khách ẩn danh); bản lưu mây cũng sửa được | [LỖI] | [VL] 5.7a: `game/firebase/linhkhi.rules` chỉ kiểm khoảng số (`power` ≤ 1.000.000, trùm ≥ 5 s) và "chỉ tăng"; `bang_vang.js` `entry()` → `cloud.js` `submitScore`. [UI] #32 cùng vấn đề nhưng xếp P2/L → **Mâu thuẫn M3** | Một người gian lận là cả bảng mất ý nghĩa (không hỏng game người khác) | P1 | S (siết luật) / L (máy chủ tính điểm) | `linhkhi.rules`: `power ≤ 1500`, `stars ≤ 45`, trùm vùng ≥ 20 s, `far ≥ 5` mới có `b_moc`…; không cho khách ẩn danh ghi bảng. **Chủ dự án quyết và tự đưa luật lên Firebase (Q1)** | Luật chặt quá thì người giỏi thật bị từ chối | Thêm ca vào `tests/may_luat.test.js` (ghi power 2.000 bị từ chối, khách bị từ chối) |
| **V24** | Đăng nhập / iPhone | **Đăng nhập Google trên Safari iPhone và ứng dụng ở màn hình chính có thể hỏng** (`authDomain` khác tên miền game) | [THIẾT KẾ] (chưa thử) | [UI] #11: `cloud.js` 196 luôn dùng cửa sổ bật lên; `authDomain` = `sontinhthuytinh.firebaseapp.com`; ứng dụng màn hình chính có bộ nhớ riêng. Chưa thử iPhone thật | Nếu hỏng → gặp V1 | P1 (nếu xảy ra) | M | Thử thật trước (checklist 5b); nếu hỏng: cho `authDomain` trùng tên miền game (Firebase Hosting `/__/auth`) | Trung bình | Checklist 5b mục Đăng nhập |
| **V25** | HUD / chữ | **Chữ phụ nhỏ**: nhỏ nhất 9,4 px trên iPhone ngang (8,6 px iPhone SE); 88% dòng < 12 px | [THIẾT KẾ] | [UI] #13: `engine.js` `ui.text` 369–370 (6,5 đơn vị); bảng 2a. [KT] T8: 204/232 dòng < 12 px, 55 dòng < 10 px. [GY] 6.1: ≥ 12–14 px | Khó đọc tên vùng, "Sức mạnh / khuyên", dòng phụ vũ khí, nhất là màn hình tối | P1 | M | Nâng sàn chữ thông tin lên 7,5–8 đơn vị (~11–11,5 px); giữ 6,5 cho số nhỏ trên ô vũ khí; rà tràn chữ ở mọi bảng | Trung bình: chữ dài tràn khung (Hành trang đã có dòng bị cắt "…") | `tests/hanh_trang.py`, `tests/ui_build.py`, chụp lại `au_ui.py`, `au_truy_cap.py` (tỉ lệ dòng < 12 px giảm rõ) |
| **V26** | Hành trang / lò rèn | **Không có số trước/sau khi mài, không so món mới với món đang mang, đồ rơi không biết tốt hơn hay kém** | [THIẾT KẾ] | [UI] #20: ảnh `bang-lo-ren-sharpen.png` ("Sát thương mỗi đòn 14.0" không có số sau), `bang-hanh-trang-vu-khi.png` (phải tự so "đòn 16,2" với "14,0"). [VL] 5.1c (`village.js` ~288), 5.6c (không có so sánh trong `do_roi.js`, `stage.js`, `hanh_trang.js`) | Khó quyết nâng gì, mặc gì | P1 | M | `village.js` lò rèn: "→ sau khi mài: Y"; `hanh_trang.js`: khi chọn món hiện "+2,2 đòn so với ô 1 / −1,5 so với ô 2" (có dấu +/−, không chỉ màu); thẻ vũ khí màn kết quả: ▲/▼ theo `G.upg` | Thấp | `tests/hanh_trang.py`, ảnh `au_bang.py` |
| **V27** | Hiệu năng | **Lớp chữ vẽ nét gấp 3 tốn ~40% thời gian vẽ khi máy yếu** | [THIẾT KẾ] (cần máy thật) | [UI] #29: `perf.py` 3,81 ms/khung; `au_hieunang.py` 58 khung/giây máy khoẻ; giả CPU chậm 4×: mật độ 3 → 9,6 khung/giây, mật độ 1 → 15,6. `engine.js` 42 | Máy tầm trung có thể tụt khung ở phòng đông | P1 (nếu giật trên máy thật) | S | `engine.js` 42: `Math.min(2, dpr)` cho lớp `#ui` | Thấp, chữ hầu như không khác | `au_hieunang.py`; thử tay Android tầm trung (checklist 5b) |
| **V28** | Người mới | **Phòng đầu dạy quá nhiều một lúc**: 2 khung chữ 8 dòng + 5 nút có chữ + thanh linh khí; quái lao tới sau ~1 s | [THIẾT KẾ] | [KT] O1: ảnh `onboarding/07-ai1-phong-dau.png`, `08-…` (máu 100→90 sau 4 s đứng yên); `stage.js` `TUT.start` 61 + `moves.js` `tip()` 147–152; `stage.js` drawHud 859–872 vẽ cả hai ô | Người mới bỏ qua hết chữ, dễ sót "Né" | P1 | S | `stage.js` drawHud: chỉ vẽ ô mẹo vũ khí khi không có chỉ dẫn (`!hint`) — tức là phòng 1 chỉ còn một khung | Thấp, chỉ chữ | `au_onboarding.py`: ảnh 07 chỉ còn một ô chữ |
| **V29** | Người mới / làng | **Sau ải 1, 6/7 người làng cùng có chấm đỏ + "!"**; mở Cụ Đồ thì thẻ đầu báo "Còn 0 điểm" | [THIẾT KẾ] | [KT] O6: ảnh `28-lang-sau-ai1-10s.png`, `onboarding.json` bước 27; `village_scene.js` `checkNews` 500–523. [KT] O7: `village.js` `open()` 48 luôn mở thẻ `skill`. Trái mục tiêu "một lần nâng cấp có ý nghĩa" ([GY] ưu tiên 3) | Quá tải lựa chọn ngay sau trận đầu | P1 | S | `village_scene.js` `checkNews`: khi `Object.keys(sv.stars).length <= 1` chỉ bật **một** chấm theo thứ tự (Cụ Đồ có điểm → Lò rèn mài được → Thợ May → Lái Đò). `village.js` `open()`: điểm kỹ năng = 0 mà còn điểm chưởng thì mở thẻ `chuong` | Thấp; bài giao diện làng có thể giả định đủ chấm | `au_onboarding.py` bước 27: `news` còn 1 mục; Cụ Đồ ở cấp 2 mở thẻ Cây chưởng; `tests/ui_input.py`, `lang_shots.py` |
| **V30** | Âm thanh | **Không giới hạn số tiếng cùng lúc**: 20 quái chết cùng khung = 20 tiếng giống hệt chồng nhau | [THIẾT KẾ] | [KT] S1: `engine.js` `G.sfx` 189–204 mỗi lần gọi một bộ dao động mới, không đếm. `au_am_thanh.py`: 20 tiếng 'die', tổng âm lượng 0,8 (vỡ tiếng ở 1,0); Hỏa chưởng 16 tiếng/khung | Tiếng to bất thường, rè | P1 | S | `engine.js` `G.sfx`: cùng tên trong cùng khung (`G.time`) thì bỏ qua (hoặc tăng nhẹ tối đa ×1,5); tối đa ~8 tiếng đang kêu | Thấp | `au_am_thanh.py`: ≤ 2 tiếng 'die', tổng âm lượng < 0,3 |
| **V31** | Truy cập / màu | **Vùng báo đỏ của quái và vòng xanh dưới chân em bé thành cùng màu** với người mù màu lục | [THIẾT KẾ] | [KT] T1: ảnh `truy-cap/vung-do-rung-deutan.png` (giả lập); ảnh xám vẫn thấy nhờ độ sáng. Trái ràng buộc [GY] "không dùng màu làm tín hiệu duy nhất" | ~1/12 nam giới khó tách "chỗ nguy hiểm" và "chỗ của mình" | P1 | S | `bao_truoc.js`: thêm hoạ tiết sọc chéo hoặc viền nét đứt nhấp nháy cho vùng của quái (hình dạng, không đổi màu); vòng dưới chân em bé giữ nét liền | Thấp (chỉ hình) | `au_truy_cap.py` so ảnh deutan; `bao_truoc_shots.py` |
| **V32** | Né | Bất tử khi Né **333 ms**, dài hơn dải đề xuất 180–240 ms; đòn quái chỉ tính trúng 1 khung lúc nổ → né rất dễ | [THIẾT KẾ] | [CD] #6: `combat.js` 649 (`P.dodgeT = 0.27; P.inv = 0.32`), 862–870; `au_ne.py` mục 1. [VK] mục 5: đây là thứ giá trị nhất làm "có né" thắng. [TK] 4.2: "không tăng thời gian bất tử" | Né dễ và công bằng; giảm phần "đọc đòn" — tuỳ ý đồ | P2 | S | Giữ 0,32 cho người mới; không sửa trước khi thử tay. **Cần quyết (Q13)** | Đổi độ khó toàn game | `au_ne.py`, `tests/cay.py` |
| **V33** | Né / kiếm | **Nhát lướt không bất tử và không huỷ được** (Xốc tới của giáo thì có) | [THIẾT KẾ] | [CD] #7: `moves.js` `swordGlide` 304–314 không đặt `P.inv`; `spearLunge` 426 có. `au_ne.py` mục 4 | Thưởng "né xong đánh ngay" có thể thành bẫy (nhất là khi tự ngắm sai, V6) | P2 | S | `moves.js` `swordGlide`: `P.inv = Math.max(P.inv, g.t)` | Kiếm mạnh hơn chút với người giỏi | `au_ne.py` mục 4; `tests/cay.py` |
| **V34** | Vũ khí / đổi giữa đòn | **Đổi vũ khí giữa đòn không nhất quán**: đúng khung chạm thì sát thương tính bằng vũ khí mới; hoạt ảnh chạy tiếp 10 khung với hình vũ khí mới | [LỖI] | [CD] #12: `combat.js` 667–674 đổi vũ khí trước kiểm tra trúng 683; `moves.js` 173. `au_input.py` B3 (`hitWith: 'bow'`). Đúng điều [GY] 3.5 lo | Hiếm (1 khung) nhưng trông lạ | P2 | S | `combat.js` đoạn đổi vũ khí: `P.atkT = 0; P.hitDone = true; P.cdT = Math.min(P.cdT, 0.1)` (huỷ đòn đang vung, "cho phép và reset combo") | Đổi vũ khí giữa chuỗi sẽ cắt động tác ngay — đúng ý | `au_input.py` B3: hits = 0, không còn khung vẽ vũ khí mới trong động tác cũ; `tests/moves.py` |
| **V35** | Tài liệu / số liệu | **"Hồi đòn" `G.WTYPES.cd` trong `data.js` không phải số đang dùng**; nhịp thật ở `G.MOVES` | [THIẾT KẾ] | [CD] #13: `combat.js` 469–478 `startAttack` chỉ dùng khi thiếu `moves.js`; `moves.js` 33–81. [TK] 1.1/1.3 và [GY] 3.2 tính theo số cũ → xem M1 | Tính DPS trên giấy ra sai | P2 | S | Ghi chú trong `data.js` và tài liệu: `cd` là số dự phòng; không đổi số | Không | Đọc lại |
| **V36** | Vũ khí / đòn giữ-thả | **Đòn giữ-thả có DPS thấp hơn bấm thường** (trừ cung đánh cụm) | [THIẾT KẾ] | [CD] #15: `au_dps.py` búa nấc 2 34,8 vs 47,2; Xốc tới 35,7 vs 59,2; cung giương đầy 43,8 vs 51,8 (cụm 85,9 vs 69,5). [VK] 3.1: lấy đà nấc 2 1,7 s/nhát | Giữ nút vì "trông mạnh" nhưng chậm hơn | P2 | S | Chọn: tăng hệ số đòn lấy đà (búa nấc 2 1,25→~1,6) **hoặc** ghi rõ trong mẹo vũ khí là đòn "tiện ích" (choáng, xa, xuyên). Đề xuất: ghi rõ trước | Cân bằng (nếu đổi số) | `au_dps.py`, `tests/dps.py`, `tests/cay.py` |
| **V37** | Phản hồi trúng | **Phản ứng mục tiêu chưa đủ phân cấp**: tinh anh bị đẩy như quái nhỏ; đánh mặt khiên chỉ có số xám nhỏ, cùng tia lửa và tiếng như trúng thường; chí mạng cùng tiếng "bộp" | [THIẾT KẾ] | [CD] #17: `moves.js` `push` 279–282; `fx.js` 600–604, 372; `mobs.js` 138–142. [VK] 1.2: `engine.js` `SFX` 182–188 chỉ một tiếng `hit`; [VK] 1.3: `fx.js` `api('dmg')` 391, ảnh `phan-hoi-giap.png`. [VK] 1.4: búa choáng 0,4 s mỗi nhát mà không ghi ở đâu | Người mới không biết đang đánh vào khiên; tai không giúp nhận ra chí mạng | P2 | S | `moves.js` `push`: tinh anh ×0,4; `engine.js` `SFX` thêm `crit`, `block`; `moves.js` `gain`/`combat.js` `playerHit` chọn tiếng theo `crit` và `G.mobArmor(t) > 0`; `fx.js` `api('hit')`: tia trắng xám bật ngược khi bị khiên chặn; `moves.js` `G.MOVE_TIPS.hammer` thêm "mỗi nhát búa làm quái khựng, cắt đòn nó đang lấy đà" | Nhiều tiếng cùng nhịp: dựa vào giới hạn của V30 | `au_phan_hoi_shots.py` (cảnh "giáp" khác "thường"); `tests/quai.py`; `tests/smoke.py`; nghe thử |
| **V38** | Trùm học theo bạn | **"Chống áp sát" ở trùm nhỏ chỉ là nhãn**, không đổi hành vi | [LỖI] | [CD] #24: `boss.js` `thinkMini` 232–281 không đọc `antiMelee`; chỉ `thinkBig` 218 và Hồ Tinh 292 dùng | Lời hứa "trùm học theo bạn" thành chữ suông | P2 | S | `boss.js` `thinkMini`: có `antiMelee` thì thêm `'chieu1'` khi em bé đứng gần; hoặc bỏ lớp này khỏi trùm nhỏ | Thấp | `au_trum_hoc.py`, `chitiet_shots.py` |
| **V39** | Trùm học theo bạn / hướng dẫn | **Giải thích sự thích nghi còn mỏng**; chữ hướng dẫn phòng trùm nói "kháng hệ" trong khi người mới gặp "Chống áp sát"; "Bắt bài lăn né" ngưỡng 15 lần/ải nên ai né cũng gặp | [THIẾT KẾ] | [CD] #25: `stage.js` 268, 823, 847; `village.js` 622; `boss.js` 27. [CD] #22 (cơ chế có thật, dễ đoán). [KT] O5: `stage.js` `TUT.boss` 67, ảnh `23-phong7-boss.png`. [VK] mục 5: lớp này **phạt** việc né → xem M4 | Thấy trùm "khó lên" mà không biết làm gì khác | P2 | S | `stage.js` `TUT.boss`: "Trùm học theo cách bạn đánh, chữ dưới tên nó cho biết nó đã học gì…"; màn kết quả/thua 1 dòng theo lớp đã gặp (đi chung V17); ngưỡng "Bắt bài lăn né" xem D1 | Không | Chụp màn kết quả; `au_onboarding.py` |
| **V40** | Âm thanh / nhịp | **Tiếng vung phát lúc bắt đầu lấy đà** (sớm 135–360 ms so với lưỡi vung); tiếng trúng giống nhau mọi vũ khí | [THIẾT KẾ] | [CD] #26: `moves.js` 262 (`begin` phát `swing`); `engine.js` 182–203 | Nghe "thiếu lực" | P2 | S | Dời tiếng vung tới ~35% động tác; tiếng trúng riêng cho búa (thấp, dài) | Không | `au_input.py` B5; nghe trên máy |
| **V41** | Cài đặt / truy cập | **Không có tuỳ chọn cho người chơi**: giảm rung/hạt/chớp, cỡ chữ, đổi tay, chế độ dễ | [THIẾT KẾ] | [CD] dòng cuối bảng (`vfx_cfg.js`; bảng Anh Mõ chỉ có âm thanh, toàn màn hình, mây). [KT] T5: `village.js` `settings()` 637–679; T6: chớp ít và ngắn (không rủi ro co giật). [GY] 2.5, ưu tiên 2 | Người nhạy ánh chớp, thuận tay trái, mắt kém không chỉnh được | P2 | S ("Giảm hiệu ứng") / M ("Đổi tay") | `village.js` `settings`: nút "Giảm hiệu ứng" (`G.VFX.rung = 0.3–0.4; hat = 0.5`, giữ khựng, tắt chớp màn hình), lưu trong bản lưu. "Nút bên trái" để sau (lật toạ độ cụm nút trong `stage.js` drawHud / `readInput`) | "Đổi tay" trung bình (vùng chạm, vùng an toàn) | `tests/ui_input.py`, `au_onboarding.py` |
| **V42** | Báo trước / nhiều vùng | **Nhiều vùng báo cùng lúc (5–6) cùng một màu, không thứ tự**; vùng trùm pha màu hệ dễ lẫn vệt cháy của chính mình | [THIẾT KẾ] (chưa chụp phòng trùm Lâu đài) | [CD] #11: `bao_truoc.js` 23–30; ảnh `hieu-ung-day-nhat-bao-truoc.png` | Khó biết đòn nào nổ trước | P2 | M | `bao_truoc.js`: vùng sắp nổ nhất (t nhỏ nhất) viền dày hơn; vùng của trùm viền trắng nhấp nháy | Thấp | Chụp phòng trùm Hồ Tinh với vệt cháy của người chơi |
| **V43** | Quái / xạ thủ | **Xạ thủ nhắm lại đúng lúc bắn**, hướng chĩa lúc lấy đà có thể khác hướng đạn | [THIẾT KẾ] (cần xem máy) | [CD] #19: `mobs.js` 288–294, 689 (đường ngắm tắt theo ý chủ dự án) | Có thể thấy lệch khi em bé đang chạy | P2 | S | Giữ; nếu thấy lệch thì cho quái xoay theo em bé trong lúc lấy đà | — | Thử tay (checklist) |
| **V44** | Né / sát thương theo nhịp | **Máu vẫn tụt vì cháy/độc trong lúc lộn bất tử** | [THIẾT KẾ] | [CD] #21: `combat.js` 569–577 (`P.dot` không xét `P.inv`) | Dễ hiểu nhầm "né rồi vẫn dính" | P2 | S | Giữ luật; số cháy/độc trên người em bé màu hệ — kiểm tra trên máy | — | Thử tay |
| **V45** | Né / thưởng | **Phần thưởng riêng cho cú né gần như không có**: Nhát lướt chỉ +3% st/giây; giáo, cung, búa không có gì | [THIẾT KẾ] | [VK] 2.2: `au_ne_thuong.py` 75,4 vs 72,9 (tắt Nhát lướt); `moves.js` `glide` 42 (×1,4, cửa sổ 0,35 s). [TK] 1.3 giữ ×1,4, 4 "Né chuẩn" +5 mana → **Mâu thuẫn M2** | Né chỉ là "để khỏi chết", thiếu khoảnh khắc "né đẹp rồi đánh trả" | P2 | S | Xem D1/D2: Né chuẩn cho mọi vũ khí (nếu đồng ý) và giữ ×1,4; nếu không làm Né chuẩn thì `moves.js` `G.MOVES.sword.glide` 1,4→~1,8–2,0 và tính là đòn nặng | Kiếm mạnh lên nếu đổi số: `tests/dps.py` (cận chiến lệch ≤ 15%) | `au_ne_thuong.py`: có/không thưởng né chênh ≥ 8%; `tests/dps.py` |
| **V46** | Linh khí / nhịp vũ khí | **Tỉ lệ gây hệ tính mỗi nhát** → búa tích dấu ấn chậm 2,3× kiếm; búa Băng yếu | [THIẾT KẾ] | [VK] 3.3: `combat.js` `playerHit` 404–410, `G.PROC` 20% ở Mầm; `au_vu_khi.py` kiếm 9,5 · giáo 7,8 · cung 5,9 · búa 4,1 dấu ấn/phút. [VK] 4.3: búa Băng Thức tỉnh 79,6 vs búa Độc 110,8 | Cầm búa lên Thành hình chậm hơn gấp đôi | P2 | S | `combat.js` `playerHit`: `chance *= T.cd / 0.36` kẹp tối đa 1 | Búa có hệ mạnh lên | `au_vu_khi.py`: búa ≥ 70% dấu ấn/phút của kiếm; `VK=hammer au_he.py`: búa Băng ≥ 90% búa Độc; `tests/dps.py`, `tests/linhkhi.py` |
| **V47** | Vũ khí / bản sắc | **Kiếm và giáo cho số gần như trùng nhau** (khác ở tầm và chiêu) | [THIẾT KẾ] (cần người thật) | [VK] 3.2: đám 80,1 vs 72,5; 1 quái 43,5 vs 41,0; quái/nhịp 1,67 vs 1,71. [TK] 1.2 giữ nguyên số giáo | Có thể thấy "na ná" | P2 | — | Chưa đổi; hỏi 3–5 người. Nếu giống: tầm Đâm 60→66 hoặc đẩy lùi nhẹ nhát đâm 3 | — | Hỏi người chơi thử: tả được khác nhau không |
| **V48** | Hệ / phản ứng | **Phản ứng hệ gần như không xảy ra khi chơi một hệ**; tương tác ẩn (Băng làm Độc tan chậm một nửa; Độc + Băng không phản ứng) không ghi ở đâu | [THIẾT KẾ] | [VK] 4.4: `au_he.py` cột "phản" = 0 mọi dòng; chưởng không kết hợp với vũ khí (`combat.js` `applyStatus` 258–260). [VK] 4.1: `combat.js` `tickStatus` 321. [VL] 4.3b: Độc + Băng không có phản ứng, không đâu nói | Hiểu nhầm "Hỏa chưởng + vũ khí Độc = Nổ khói" | P2 | S | `data.js` `G.HINTS[5]`: thêm "(giữa hai vũ khí khác hệ, đổi vũ khí khi quái còn dính hệ cũ)", "Độc gặp Băng: không phản ứng", "Băng làm Độc tan chậm" | Không | Đọc trang "Ba hệ" ở Cụ Đồ |
| **V49** | Trùm vùng | **Ngư Tinh, Hồ Tinh: mỗi đòn mất ~50–60% máu** | [THIẾT KẾ] (cần người thật) | [VK] 5.3: đòn gốc Ngư Tinh 49% máu bé, Hồ Tinh 61%, Mộc Tinh 20%; bot có né thắng Ngư Tinh 2–3/8 | Hai lần sơ ý là thua | P2 | — | Chưa đổi; nếu sau V8 người thật vẫn thấy bất công thì giảm đòn chính, không giảm báo trước | — | Thử tay; `au_spam.py` |
| **V50** | Quái / tinh anh | **Tinh anh không bao giờ có dấu "!" báo sắp ra đòn** (vì luôn có dấu hiệu) | [LỖI] | [VL] 4.4b: `mobs.js` ~705 `!e.trait` | Đòn thường tinh anh khó đọc hơn quái thường | P2 | S | `mobs.js`: vẽ "!" lệch cạnh biểu tượng dấu hiệu thay vì bỏ | Rất thấp | Ảnh phòng tinh anh (`quai_shots.py`) |
| **V51** | Đội hình quái | **Không chặn số xạ thủ mỗi đợt; Gai và Xạ thủ là nguồn mất máu lớn** | [THIẾT KẾ] | [VL] 4.4d: `buildWaves` chỉ chặn trùng Bầy/Cảm tử/Đặt bom. [VL] 4.4c: `cay.py` Gai 22%, Xạ thủ 14% | Thỉnh thoảng có đợt "toàn bắn xa"; Gai có thể "khó chịu" | P2 | S | `stage.js` `buildWaves`: tối đa 2 xạ thủ/đợt. Gai: chờ người thật, nếu đúng thì 8 gai → 6 hoặc bay chậm hơn | Thấp / lệch `cay.py` | `tests/cay.py --nhanh`, `tests/quai.py` |
| **V52** | Phòng / mọc quái | **Quái mọc sát em bé** (0,6% lần mọc < 30 px) | [THIẾT KẾ] | [VL] 4.2b: `au_mapgen.py` 929 lần mọc; đã có giảm nhẹ (vòng đỏ 0,8–1 s, `e.cd`, đẩy em bé ra) | Hiếm | P2 | S | `stage.js` `freeSpot`: 14 → 30 lần thử | Rất thấp | `au_mapgen.py` (đếm "gần em bé") |
| **V53** | Làng / mở dần | **Mọi người làng mở ngay từ đầu** | [THIẾT KẾ] | [VL] 5.1b: không có điều kiện mở theo tiến trình trong `village.js`/`village_scene.js`. [GY] 5.1 "chỉ hiện nâng cấp mới khi đủ bối cảnh" | 5 phút đầu thấy cả 7 bảng | P2 | S | Ẩn Cô Thợ May và thẻ Cây chưởng tới khi qua ải 1-2 (bổ sung cho V29) | Bài giao diện làng có thể giả định đủ 7 người | `tests/ui_input.py`, `lang_shots.py` |
| **V54** | Cây chưởng | **Cây chưởng đầy ở 28 điểm, thừa tới 12 điểm cuối game**; hai cây điểm song song dễ rối | [THIẾT KẾ] | [VL] 5.3b: `chuong.js` `CH.pts` 1 điểm/cấp. ([VL] 5.3a: cây kỹ năng **không** bị học hết — 13 điểm/15 nút) | Điểm thừa vô nghĩa sau trùm cuối | P2 | S | Cho điểm thừa dùng ở cây thứ hai, hoặc chấp nhận | Thấp | `tests/chuong.py` |
| **V55** | Cân bằng / vùng 3 | **Vùng 3 quái trâu hơn, bé mỏng hơn tương đối** | [THIẾT KẾ] (theo dõi) | [VL] 5.2: đòn hạ Lính xông ~7 → 10–12; đòn Lính xông hạ bé 9–10 → 4–5. Công thức cấp là cộng đều (×1,585 / ×2,365 ở cấp 40), không phải nhân dồn như [GY] 5.2 lo | Có thể thấy "đánh mãi không chết" | P2 | S | Không đổi công thức; nếu người thật thấy lê thê: máu quái thường vùng 3 −10% (`G.STAGE_K`) | Lệch `cay.py` | `tests/cay.py 12`, `tests/balance.py` |
| **V56** | Kinh tế / túi đồ | **Rương đầy sau ~10–12 lượt**, vũ khí rơi tự đổi vàng mà không nói bậc | [THIẾT KẾ] | [VL] 5.6b: rương 12 món, `G.giveWeapon` | Ít hồi hộp khi rơi đồ, không biết có nên dọn | P2 | S | Dòng báo ghi bậc: "Kiếm Tím bị đổi thành 90 vàng vì rương đầy" | Thấp | Chơi tay với rương đầy |
| **V57** | Bảng vàng | **Thẻ Sức mạnh (thuần cày) đứng đầu**; thẻ kỹ năng (thời gian hạ trùm) ở sau | [THIẾT KẾ] | [VL] 5.7b | Bảng vàng đo cày hơn kỹ năng | P2 | S | `bang_vang.js`: đưa thẻ "thời gian hạ trùm" lên trước | Không | Ảnh bảng vàng |
| **V58** | Bản sắc dân gian | **40 dòng vũ khí dân gian chỉ khác hình/tên**; Chày Giã Gạo và Trống Đồng đánh y hệt | [THIẾT KẾ] | [VL] mục 8: code chiến đấu không đọc `family` (`combat.js`, `moves.js`). [GY] 8 | Bản sắc dừng ở tên gọi | P2 | M | Chọn 2–3 dòng biểu tượng, mỗi dòng một nét nhỏ dùng cơ chế sẵn có (Trống Đồng: nhát 3 tạo vòng sóng) | Lệch cân bằng vũ khí | `tests/dps.py` |
| **V59** | Phòng / thương nhân | Thương nhân ít khi đáng ghé | [Ý TƯỞNG] | [VL] 4.1c (bot gần như không mua) | Phòng phụ ít ý nghĩa | P2 | S | Bán món chỉ có trong ải (ví dụ đổi máu lấy dấu ấn) thay cho quặng | Thấp | Chơi tay |
| **V60** | Phần thưởng | Phần thưởng sau trận chỉ là danh sách, không chọn gì | [Ý TƯỞNG] | [VL] 4.5c: `panelResult`. [GY] 4.5 | Ít cảm giác quyết định cuối ải | P2 | M | Để sau V19 (lựa chọn đã nằm trong ải ở Rương) | — | — |
| **V61** | Lưu / giữa ải | **Tải lại trang giữa ải mất cả lượt** (kể cả vũ khí vừa nhặt) — không nhân đôi thưởng | [THIẾT KẾ] (chủ ý) | [VL] 4.2d (`S` trong `stage.js` chỉ ở bộ nhớ); [UI] #6 (`settle` 423–491 cộng thưởng một lần; `au_luu.py` tình huống 8) | Chấp nhận được với ải 3–6 phút | P2 | M | Giữ; nếu người chơi phàn nàn: lưu đồ nhặt được ngay khi nhặt. Có thể ghi rõ "thoát giữa ải không giữ đồ nhặt trong ải" | Lưu giữa ải dễ nhân đôi đồ | Thử: nhặt vũ khí tinh anh rồi tải lại trang |
| **V62** | Lưu mây | Cờ "còn thay đổi chưa lưu" bị xoá nhầm khi lưu trong lúc đang đẩy; ghi lỗi xong không tự thử lại | [LỖI] — **ĐÃ SỬA** | [UI] #3 (`push()` 176–177), #4 (chỉ thử lại khi `online`). **Đã sửa 15:33**: `cloud.js` `_changeSeq` (dòng 51, 176, 182, 321) + thử lại giãn dần tới 60 s (dòng 190–191); bài `tests/cloud_save_regression.test.js` | — | P2 (đã xong) | — | — | — | Chạy lại `cloud_save_regression.test.js`, `au_luu.py` tình huống 5 và 7 trong mỗi giai đoạn |
| **V63** | Lưu mây | Rời trang chỉ "cố đẩy" lên mây (`pagehide`), không chắc tới | [THIẾT KẾ] | [UI] #5: `cloud.js` ~326; bản trên máy ghi đồng bộ nên không mất | Chỉ thiệt khi đổi máy ngay sau khi đóng tab | P2 | S | Đẩy ngay (không chờ 4 s) mỗi khi qua ải/hạ trùm | Thấp | Thử tay: qua ải, đóng tab, mở máy khác |
| **V64** | Lưu mây | Token hết hạn: không xử lý riêng, chỉ thành "Đang ngoại tuyến" | [THIẾT KẾ] (chưa thử Firebase thật) | [UI] #7: `cloud.js` 94 | Không lưu mây được tới khi tải lại | P2 | S | Lỗi `permission-denied`/`unauthenticated` → `getIdToken(true)` rồi thử lại một lần | Thấp | Để tab mở qua đêm rồi chơi tiếp |
| **V65** | Lưu / phản hồi | **Không có biểu tượng trạng thái lưu** trong ải và ở làng; `G.persist` lỗi (bộ nhớ đầy/bị chặn) thì im lặng | [THIẾT KẾ] | [UI] #8: dòng trạng thái chỉ ở màn chào và Anh Mõ (`village.js` 666, 853). [KT] K7: `engine.js` 345 catch "chơi không lưu"; 104 khối catch, 29 rỗng | Chơi cả buổi, tắt máy là mất (nếu không đăng nhập) mà không biết | P2 | S | Biểu tượng mây nhỏ ở dải tài nguyên (xám/đỏ); `G.persist` catch → `G.saveFail = true`, làng hiện "Không lưu được trên máy này" | Thấp | Ảnh làng khi `__fbFail = true`; giả `localStorage.setItem` ném lỗi |
| **V66** | HUD | HUD nhiều mảnh (đã giảm); màn 16:9 chật hơn | [THIẾT KẾ] | [UI] #14: ảnh `ui-iphone-ngang.png`, `ui-iphone-se-trum.png` | Ổn trên máy dài | P2 | S | "Sức mạnh / khuyên" chỉ hiện 5 s đầu phòng | Thấp | So ảnh trước/sau |
| **V67** | Chạm | **Nút Dừng sát vùng cần gạt**: ngón cái trái đặt cao bị nhận là nút Dừng | [LỖI] | [UI] #15: `au_ui.py` "mep_tren_khong_nhan_can"; `stage.js` 560–561 vùng chạm mở rộng x 58–96, y 22–55 | Lỡ tay → tạm dừng giữa trận | P2 | S | `stage.js`: không mở rộng vùng chạm Dừng xuống dưới (hoặc giữ 0,3 s mới dừng) | Thấp | `au_ui.py`; thử tay |
| **V68** | Chạm / đổi cỡ | Đổi cỡ (thanh địa chỉ) khi đang giữ cần → tâm cần tính theo tỉ lệ cũ | [LỖI] | [UI] #17: `au_ui.py` "doi_co_khi_giu" (1,444 → 1,258) | Cần gạt lệch một chút trên Safari | P2 | S | `engine.js`: khi tỉ lệ đổi, quy đổi lại `sx/sy` của ngón đang giữ | Thấp | Thử tay Safari iPhone (checklist 5b) |
| **V69** | Hình / phóng | Phóng lẻ (4,33 điểm máy/điểm ảnh game trên iPhone) → hàng điểm ảnh dày mỏng 1 điểm máy | [Ý TƯỞNG] | [UI] #18: `engine.js` `resize()` 38–45; có `pixelated` nên không mờ | Rất nhẹ | P2 | S | Tuỳ chọn "điểm ảnh tròn" chỉ khi có phàn nàn | Thấp | So ảnh phóng to |
| **V70** | Hình / nhân vật | **Bốn em bé cùng bóng dáng**, khác chủ yếu ở màu áo | [THIẾT KẾ] | [UI] #21: ảnh `hinh-rung-x3.png`, `hinh-*-50.png`. [GY] 2.1 | Khó nhận khi chọn nhân vật | P2 | M | Đô Vật thấp rộng hơn 2–3 điểm, Thợ Săn mảnh hơn; giữ đầu | Trung bình (hoạt ảnh vũ khí bám tay) | Chụp lại `au_hinh.py` |
| **V71** | Hình / tương phản | **Lâu đài cổ cùng tông đỏ–cam–đen** (chênh sáng quái/sàn 38–59, thấp nhất); sàn Rừng nhiều đốm sáng; chưa có trang quy tắc vẽ | [THIẾT KẾ] | [UI] #22 (`au_hinh_do_sang.json`, `hinh-lau-dai-50.png`), #23, #24 (`docs/vfx/BANG-MAU.md`) | Phòng đông ở Lâu đài khó tách từng con | P2 | M | Vành sáng 1 điểm cho quái tối ở vùng tối; giảm đốm sáng giữa sàn; thêm mục "quy tắc vẽ" vào BANG-MAU.md | Thấp | `au_hinh.py` (số chênh độ sáng), ảnh |
| **V72** | Âm thanh | **Không có nhạc nền; chỉ bật/tắt tiếng**, không thanh âm lượng | [THIẾT KẾ] | [UI] #25: `engine.js` 182–204, `G.save.sound`; [KT] S6 | Game nghe "bản thử" | P2 | S (âm lượng) / M (âm nền) | Nút âm lượng 3 mức (nhân vào `gain`); lớp âm nền tổng hợp đơn giản cho làng | Thấp | Thử tay |
| **V73** | Âm thanh / iPhone | Âm thanh có thể mất sau cuộc gọi (trạng thái `interrupted`) | [THIẾT KẾ] (chưa thử máy) | [UI] #26: `engine.js` `audioStart` 175–181 chỉ `resume()` khi `suspended` | Mất tiếng tới khi tải lại | P2 | S | `resume()` khi `state !== 'running'` | Thấp | Checklist 5b |
| **V74** | PWA | Phông Be Vietnam Pro và thư viện Firebase không được lưu bộ nhớ tạm; iPhone màn hình chính có bộ nhớ riêng | [THIẾT KẾ] | [UI] #28: `web/sw.js`, `web/manifest.webmanifest` | Mở offline dùng phông dự phòng, mây tắt (vẫn chơi được) | P2 | S | `sw.js` lưu phông; ghi chú cho người chơi | Thấp | Checklist 5b |
| **V75** | Hiệu năng / bộ nhớ | **Tạo ~6,9 MB rác mỗi giây** khi vẽ HUD | [THIẾT KẾ] | [UI] #30: `au_hieunang.py` 180 s; `[...G.pointers.values()]` 8 chỗ (`engine.js` 410, `ui_theme.js` 94, `stage.js` 770, 931, 939), `Object.assign` ô vũ khí (`stage.js` 795), `W.projs.filter` (650) | Máy yếu có thể khựng nhẹ khi dọn rác | P2 | M | Chỉ sửa chỗ nóng: tính danh sách ngón một lần mỗi khung; bỏ `Object.assign` ở ô vũ khí | Thấp | `au_hieunang.py` mục `rac_MB_moi_giay` |
| **V76** | Vận hành | Không có thống kê (analytics) | [Ý TƯỞNG] | [UI] #31; [GY] 7.5 | Không biết người chơi bỏ ở đâu | P2 | M | Nếu cần: bảng `linhkhi_stats` chỉ số tổng hợp, báo rõ cho người chơi | Thấp | — |
| **V77** | Nội dung / chữ sai | **Lỗi chữ**: "7 phòng" (thật là 8); "Giữ nút Đánh" vs "bấm Đánh"; câu "quái thường 0% rơi viên linh khí"; đặt dấu lệch (hoá/hóa, khoá/khóa, hoả/hỏa, tuỳ); chữ tiếng Anh "Hero" | [LỖI] | [KT] N1 (`village.js` 167), O2 (`stage.js` 61 vs `moves.js` 114, `village.js` 610), N5 (`au_noi_dung.json` `dat_dau`), N6 (`village_scene.js` 43, `hanh_trang.js` 86/110/291, `tailor.js` 79, `stage.js` 469, `bang_vang.js` 156); [VL] 4.3c (`village.js` ~629) | Mất tin vào thông tin trên màn hình; trông thiếu chăm chút | P2 | S | Sửa theo "Danh sách lỗi chữ" mục 3 của [KT]: `'8 phòng · '`; "Bấm (hoặc giữ) nút Đánh để chém"; bỏ vế "0% rơi" khi `drop = 0`; thống nhất hóa/khóa/hỏa; "Hero" → "Em bé" | Không | `au_noi_dung.py` (mục `so_phong`, `dat_dau` trống) |
| **V78** | Nội dung / tên gọi | **Một khái niệm hai tên** ("linh khí" và "dấu ấn"); **một tên hai cơ chế** (Vệt cháy, Lây độc, Băng vỡ, Tích lực vừa là đặc trưng vũ khí vừa là nút chưởng); "Thường"/"Trắng" cùng lúc; em bé "Thợ Rèn" trùng "Ông Thợ Rèn"; "Nấm Chúa"/"Nấm Phồng Chúa" | [THIẾT KẾ] | [KT] N2 (ảnh `26-ket-qua.png`), N3 (`data.js` 70–82), N4, N7, N8 | Người mới tưởng hai tài nguyên, học nhầm cơ chế | P2 | S–M | Chọn "linh khí" cho người chơi, thay chuỗi hiển thị "dấu ấn" (~30 chuỗi, không đổi tên biến); đổi tên nút chưởng ("Độc lan", "Băng nổ"…); ẩn "Trắng" ở HUD khi chưa có hệ; đổi tên em bé/trùm nhỏ | Thấp, nhiều chỗ | Tìm "dấu ấn" trong chuỗi hiển thị; đọc bảng Cụ Đồ |
| **V79** | Người mới | **Nút Chưởng không được dạy ở ải 1**; mẹo Chưởng ở ải 2 hiện khi mana chưa đủ; **mẹo vũ khí lặp lại đầu mọi ải** | [THIẾT KẾ] | [KT] O3 (`chuong.js` 403, ảnh `36-ai2-5s.png` mana 11/100), O4 (`moves.js` 129 `tips: {}` tạo lại mỗi ải) | Học xong không thử được ngay; chữ thừa mỗi ải | P2 | S | `chuong.js` 403 thêm `W.P.mana >= CH.cost(W.P)`; `moves.js` `tip()` ghi đã xem vào `G.save.tut.mv[type]` | Thấp (`fixSave` giữ `tut` dạng đối tượng) | `au_onboarding.py` (ảnh ải 2: mẹo hiện lúc nút sáng); vào 2 ải liên tiếp |
| **V80** | Người mới | Lời nguyền có thể xuất hiện trong ải hướng dẫn; **bình máu không được dạy**; dải tài nguyên 9 số 0 lần đầu | [THIẾT KẾ] / [Ý TƯỞNG] | [KT] O8 (`mapgen.js` 12 `SIDE`, `stage.js` 82), O9 (`stage.js` 224 `hpFloor`), O10 (`village_scene.js` `resParts`) | Thêm khái niệm khó ở ải đầu; lần đầu nguy hiểm thật mới tự phát hiện bình máu | P2 | S | `stage.js` `startStage`: khi `tut` phòng phụ = `merchant`; máu < 40% lần đầu → mẹo "Chạm Bình máu…" (`tut.potion`); chỉ hiện tài nguyên đã từng có | Thấp | `au_onboarding.py` vài hạt giống; thử tay |
| **V81** | Âm thanh | **Một tiếng cho nhiều việc** ('pick' 9+ việc, 'evolve' 9, 'swing' 3); **lên cấp, gục, máu thấp không có tiếng riêng**; nút dải làng có thể kêu 'ui' hai lần | [THIẾT KẾ] | [KT] S2 (114 chỗ gọi `G.sfx`, 15 tiếng), S3 (`combat.js` 557, `stage.js` 474, `fx.js` 1829, `G.addXp` 47–53), S5 (`village_scene.js` 853/904), T4 (máu thấp chỉ viền đỏ) | Khó nghe ra việc gì vừa xảy ra; không nhìn HUD thì không biết sắp chết | P2 | S | `engine.js` `SFX`: thêm 'potion', 'door', 'swap', 'dodge'; `combat.js` 557 `G.sfx('gong', 0.7)` khi gục; tiếng 'warn' một lần khi máu qua 30%; lên cấp thêm 'evolve'; bỏ 'ui' ở `village_scene.js` 904 | Thấp | `au_onboarding.py`/`au_am_thanh.py` đếm tiếng |
| **V82** | Truy cập / màu | **Bậc vũ khí trong danh sách và "Sức mạnh đủ/thiếu" chỉ báo bằng màu** | [THIẾT KẾ] | [KT] T2 (`truy-cap/lo-ren-xam.png`, `-deutan.png`; `G.weaponLine`), T3 (`truy-cap/chon-ai-protan.png`; `G.powerCol`) | Không biết món nào quý hơn; ải có quá sức không | P2 | S | `G.weaponLine` thêm "· Tím"; `G.powerCol` trả thêm ký hiệu "✓"/"!" | Thấp | `au_truy_cap.py` ảnh xám/protan |
| **V83** | Truy cập / bàn phím | Các bảng (rương, thương nhân, làng, "Ải tiếp theo") chỉ bấm được bằng chuột/chạm | [THIẾT KẾ] | [KT] T9: `stage.js` `readInput` 564–572, 616–618; `village_scene.js` 609–613 | Người chỉ dùng bàn phím không qua được bảng | P2 | M | Phím 1/2/3 chọn ô ở rương; Enter = nút chính | Thấp | `tests/ui_input.py` thêm phím |
| **V84** | Kiến trúc code | Nợ kỹ thuật: bản lưu một số phiên bản (K3), luật nằm trong hàm vẽ (K4), tệp/hàm rất dài (K5: `drawHud` 219 dòng), trạng thái dùng chung `G.click` (K6), dữ liệu trùng `G.GEAR`/`outfit.js` (K8, N10), Thợ May không có bài kiểm tra (K9) | [THIẾT KẾ] | [KT] K3–K9, N10; `au_kien_truc.py` | Sửa chỗ này dễ hỏng chỗ khác; nhiều phiên cùng sửa dễ xung đột | P2 | S–M | **Không viết lại.** Ghi chú `G.GEAR` chỉ để đổi bản lưu cũ; khi đổi cấu trúc bản lưu lần tới sửa `engine.js` 262 (`s.v > 1` → giữ); khi chạm bảng nào thì tách luật ra hàm riêng (ví dụ `G.forge.sharpen(w)`); viết `tests/tho_may.py` | Thấp nếu làm từng chỗ | `au_kien_truc.py`, `au_luu_hong.py`, bài mới `tho_may.py` |
| **V85** | Nội dung | Vai "Gai" ở cả ba vùng đều là nhím; 3/6 tinh anh là bản to của quái thường | [Ý TƯỞNG] | [KT] N9 (`au_noi_dung.json` `mobs`) | Ít bất ngờ khi sang vùng mới | P2 | M | Không cần làm ngay | Thấp | — |
| **V86** | Hệ mẫu Băng | **Không báo "sắp đóng băng"**; người chơi không thấy giá trị khống chế của Băng | [Ý TƯỞNG] | [VK] mục 3.3 (đề xuất hệ mẫu Băng): số tầng Băng đã vẽ từ 2 tầng (`fx.js` 915) | Băng khó "cảm" được dù số đo tốt (khống chế 63%, mất máu ít nhất) | P2 | S | `fx.js` (chỗ vẽ số tầng): chớp trắng khi 4/5 tầng; đếm lần đóng băng / đòn quái bị huỷ (`combat.js` `applyStatus`, `mobs.js` chỗ huỷ `e.act`) và hiện 1 dòng ở màn kết quả | Thấp | Ảnh `vfx_tg_shots.py`; `au_he.py` không đổi số |

### 1b. Mâu thuẫn giữa các bản

| Mã | Hai bên nói gì | Giải thích | Kết luận dùng trong tài liệu này |
|---|---|---|---|
| **M1** | [CD] #14: cung (1 bia, có khựng hình) 51,8 st/giây, **ngang hoặc hơn** cận chiến; búa thấp nhất 42,2. [VK] mục 2: cung **thấp nhất** (35,0 một quái, 55,7 đám); búa một quái = kiếm (43,4). [TK] 1.3 và [GY] 3.2 tính DPS bằng `cd` trong `data.js` | Ba cách đo khác nhau: [CD] đo bia đứng yên theo đồng hồ có khựng (khựng chỉ làm chậm cận chiến); [VK] đo bot đánh quái thật, không vẽ nên không khựng; [TK]/[GY] dùng số `cd` không còn dùng ([CD] #13 → V35). [VK] mục 8 đã xác nhận "không mâu thuẫn, trả lời hai câu hỏi khác nhau" | Mâu thuẫn bề ngoài. Không đổi số cung (bác đề xuất 0,40/0,47 s của [TK]). Khi cân bằng xem **cả hai** bảng |
| **M2** | [VK] 2.2: tăng Nhát lướt ×1,4 → ×2,0 vì thưởng né chỉ +3%. [TK] 1.3: **giữ ×1,4**, thưởng né bằng "Né chuẩn" (+5 mana), không cộng dồn sát thương | Cả hai đồng ý "thưởng né đang yếu", khác nhau ở cách thưởng | Xem quyết định D1/D2: đề xuất **giữ ×1,4 + Né chuẩn** (áp dụng cho cả 4 vũ khí) |
| **M3** | [VL] 5.7a: bảng vàng sửa được → **P1, S** (siết luật). [UI] #32: cùng vấn đề → **P2, L** (cần máy chủ) | Hai bản đánh giá hai cách sửa khác nhau | Gộp vào **V23 = P1** cho phần siết luật (S); phần máy chủ tính điểm (L) để sau |
| **M4** | [VK] mục 5, [TK] 4: muốn **thưởng** việc né. [CD] #22/#25: trùm có lớp "Bắt bài lăn né" khi né > 15 lần/ải — **phạt** việc né, ngưỡng thấp nên ai né cũng gặp | Cùng một hành vi vừa được khuyến khích vừa bị phạt | Nếu làm Né chuẩn (D1) thì nâng ngưỡng "Bắt bài lăn né" (ví dụ > 40 lần) hoặc chỉ tính các lần né **không** có đòn nào (né "rỗng") — cần quyết cùng Q6 |
| **M5** | [CD] #3: Hồ Tinh vồ báo 0,44 s — **không đi bộ ra kịp**, P1. [VK] 5.5: **không có đòn trùm nào không đọc được** (C) | [VK] chỉ xét "có báo trước không", [CD] xét "đi bộ ra kịp không"; [VK] mục 8 đã đối chiếu | Không mâu thuẫn thật; giữ V8 = P1 (lộn luôn kịp, đi bộ thì không) |
| **M6** | [VL] 4.2c: tối đa **4 quái** cùng lúc (`G.ROOM_WAVES.maxAlive`). [CD] #10: cảnh **12 quái**; phòng trùm không giới hạn quái sống (`stage.js` 174). [UI] #29: đo hiệu năng phòng 14 quái | Giới hạn 4 chỉ áp cho phòng thường; phòng trùm có quái gọi thêm. Cảnh 12–14 quái là cảnh ép tải dựng tay | Phòng thường ổn; rủi ro rối/giật nằm ở **phòng trùm** (V11, V27) |
| **M7** | [TK] 1.2/1.3: búa "choáng/**đẩy lùi**", đề xuất giữ choáng 0,4 s. [VK] 1.4, [CD] #17: búa **không đẩy lùi**, chỉ choáng 0,4 s mỗi nhát (rất mạnh với quái thường) | [TK] mô tả theo ý đồ; [VK]/[CD] theo code | Theo code: búa = "cắt đòn quái" bằng khựng. Ghi điều đó trong mẹo búa (V37) |

### 1c. Đã tốt — giữ nguyên (các bản đã xác nhận)

- Độ trễ kiếm/Né ~11 ms; hình vũ khí khớp vùng trúng; trúng và hụt phân biệt rõ (tiếng đúng khung, chớp, khựng, số); khựng hình không làm mất nút ([CD] dòng "A tốt"; [VK] 1.1).
- Né huỷ được gần như mọi đòn; né luôn ra được khỏi đòn đã báo; lộn không tự xoay về quái; cửa sổ Nhát lướt 350 ms ([CD]).
- Đứng spam thua mọi trùm (0/8), có né thắng ([VK] 2.1); trùm có 3 pha, mẫu chiêu học được, không lặp chiêu vừa dùng ([VK] 5.4).
- Ba hệ khác nhau thật; mốc 30/120/300 cảm nhận được (Thành hình là bước nhảy rõ +22–50%) ([VK] 4.1, 4.5); mốc 30 đến sau 2–3 phút, 120 sau 18–41 phút, 300 sau 42–85 phút ([VL] 5.4a); không khuyến khích kéo dài trận để cày ([VL] 5.4c).
- Bản đồ: 9.000 bản không lỗi, 0 lượt kẹt, chìa không bị "lưu dở" ([VL] 4.2a, 4.2d). Cây kỹ năng không bị học hết (13 điểm/15 nút) ([VL] 5.3a). Vàng hiếm đúng mức ([VL] 5.6a).
- Nút và cần gạt đủ to ở mọi cỡ máy; đa chạm, ngón trượt ra ngoài, xoay máy, ẩn tab đều đúng (`ui_input.py` 163/163, `ui_robust.py` 16/16) ([UI] #12, #16, #17, #27).
- Chơi được khi offline/mây tắt; nối khách vào Google giữ tiến trình ([UI] #9, #10). Bản lưu chống hỏng tốt (618 kiểu hỏng, 0 lần mất) ([KT] K2).
- Ải đầu dạy đủ việc chính, người mới không chết ở 7 phòng đầu; tương phản chữ tốt (220/232 dòng ≥ 4,5:1); chớp sáng ít, dưới ngưỡng nguy hiểm ([KT] O-điểm tốt, T6, T7).

---

## 2. Sửa nhanh (độ khó S, an toàn, không đổi cân bằng)

Các việc dưới đây chỉ đổi giao diện, chữ, âm thanh, thứ tự vẽ, hoặc sửa hành vi rõ là sai; không đổi số sát thương/máu.

- **V1** — thêm nút "Chơi tạm" sau khi đăng nhập Google thất bại.
- **V3** — giữ bản sao bản lưu cũ trước khi phải thay bằng bản mới.
- **V4** (bước 1) — máy đăng game chạy `node --check` cho mọi tệp JS.
- **V7** — bộ nhớ nút Né ~0,15–0,2 s (kể cả lúc lướt, đóng băng); giữ lượt bấm Đánh trong cú lộn.
- **V9** — vẽ vùng báo đỏ sau số sát thương.
- **V10** — tiếng "trúng" cho Nhát lướt, Xốc tới, các đòn Đặc biệt, sóng búa (1 lần/khung).
- **V13** (phần báo) — số xám + chữ "Xa quá!" khi trùm "Chống đánh xa" giảm sát thương.
- **V16** (cách 1) — sửa câu gợi ý "Lửa hợp với bầy quái" cho đúng số đo.
- **V18** (bước 1) — nhắc "luyện món cũ lên Vàng để giữ linh khí" khi trùm rơi món Vàng.
- **V21** (phần hiện số) — "+X Sức mạnh" trên nút nâng cấp.
- **V27** — giới hạn độ nét lớp chữ ở 2 (một dòng).
- **V28** — phòng đầu chỉ một khung chữ.
- **V29** — sau ải 1 chỉ một chấm đỏ; Cụ Đồ mở thẳng thẻ có điểm.
- **V30** — gộp tiếng trùng tên trong cùng khung, tối đa ~8 tiếng.
- **V31** — sọc/nét đứt cho vùng báo của quái.
- **V33** — Nhát lướt bất tử trong lúc lướt.
- **V34** — đổi vũ khí giữa đòn thì huỷ đòn đang vung.
- **V35** — ghi chú `cd` trong `data.js` là số dự phòng.
- **V38** — trùm nhỏ có "Chống áp sát" thì đổi hành vi thật (hoặc bỏ nhãn).
- **V39** (phần chữ) — sửa `TUT.boss`.
- **V48** — bổ sung trang "Ba hệ".
- **V50** — dấu "!" cho tinh anh.
- **V52** — `freeSpot` 30 lần thử.
- **V56, V57** — dòng báo đổi vàng có bậc; đưa thẻ thời gian hạ trùm lên trước.
- **V63, V64, V65** — đẩy mây ngay khi qua ải; làm mới token khi lỗi quyền; biểu tượng/báo lỗi lưu.
- **V67, V68** — vùng chạm nút Dừng; quy đổi toạ độ ngón khi đổi cỡ.
- **V73** — `resume()` âm thanh khi không ở trạng thái `running`.
- **V77** — sửa lỗi chữ ("8 phòng", "bấm/giữ", dấu thanh, "Hero").
- **V79, V80** — mẹo Chưởng khi đủ mana; mẹo vũ khí chỉ lần đầu; không có lời nguyền ở ải hướng dẫn; mẹo bình máu.
- **V81, V82** — tiếng gục/máu thấp/lên cấp/bình máu; chữ bậc vũ khí và ký hiệu ✓/! cạnh Sức mạnh.

---

## 3. Cần đổi thiết kế (cần quyết định trước khi làm)

Mỗi mục: các lựa chọn → **đề xuất**. Đề xuất của ChatGPT ([TK]) được **nhận / chỉnh / bác** dựa trên số đo của các bản rà soát.

### D1. "Né chuẩn" (+5 mana khi né được đòn) — [TK] mục 4; liên quan V45, M2, M4
- **Hiện trạng**: bản thử của ChatGPT **chưa gộp** và có lỗi đúng chỗ [TK] 4.1 cấm: **vũng sàn cũng kích hoạt**. Số đo ủng hộ ý tưởng: thưởng riêng cho né hiện chỉ +3% ([VK] 2.2), và chỉ kiếm có.
- **Lựa chọn**: (a) không làm; (b) làm theo đúng bảng nguồn của [TK] 4.1; (c) tăng Nhát lướt thay thế ([VK] 2.2).
- **Đề xuất: (b), làm lại từ đầu, không dùng bản thử.** Cách tối thiểu: chỉ thưởng ở **hai chỗ đòn có nguồn** — (1) chỗ vùng báo trước nổ (`combat.js` 862–870, đúng 1 khung nổ) khi em bé đang ở trong vùng và đang có bất tử **do lộn**; (2) chỗ đạn quái bay xuyên khi bất tử (`combat.js` ~845). **Không** tính `P.dot` (cháy/độc, [CD] #21), vũng `G.mobZone` loại tồn tại, chạm thân quái. Một lần mỗi cú lộn; mana đầy thì không hiện "+5". Màu ngọc lục, không dùng đỏ ([TK] 1.4). **Nhận** đúng bảng quy tắc của [TK] 4.1–4.3.
- **Kèm**: nâng ngưỡng "Bắt bài lăn né" (M4) để không vừa thưởng vừa phạt.
- **Kiểm thử**: thêm ca vào `au_ne.py` (lộn qua vùng nổ → +5; đứng trong vũng độc khi lộn → +0; né đạn → +5 một lần dù nhiều viên), `au_ne_thuong.py`, `tests/rules.py`, `tests/cay.py`.
- **Làm sau** V7 (bộ nhớ Né) và V33 (Nhát lướt bất tử) để nền né đã ổn.

### D2. Nhát lướt ×1,4 hay ×2,0 — M2
- **Đề xuất: giữ ×1,4** (nhận [TK] 1.3) nếu D1 được duyệt; chỉ thêm bất tử (V33) và phản hồi đòn nặng. Nếu D1 bị bác thì tăng ×1,8 (chỉnh lại [VK] 2.2 cho nhẹ hơn), xác nhận bằng `au_ne_thuong.py` và `tests/dps.py`.

### D3. Bản sắc 4 vũ khí — [TK] mục 1
- [TK] 1.2 khớp số đo về vai trò. **Nhận**: "không đổi sát thương nền ở lượt đầu", "mỗi lượt chỉ đổi một nhóm tham số".
- **Chỉnh**: [TK] không thấy vấn đề lớn nhất của búa — **49% nhát bị bỏ dở** ([VK] 3.1) và Né không trả thời gian chờ ([CD] #16). Đề xuất sửa **thời điểm chạm** của búa (V15), không đổi số sát thương — đúng nguyên tắc của chính [TK].
- **Bác**: làm chậm cung 0,38/0,47 s (theo số đo [VK] cung đã thấp nhất, M1); giảm thời gian ghim Phi Thương 1,0 → 0,8–0,9 s (không bản rà soát nào đo thấy ghim trùm quá lâu).
- **Thêm từ rà soát**: phản hồi tức thì khi chạm cho cung/giáo/búa (V12); tỉ lệ gây hệ theo nhịp (V46); kiếm/giáo giống số → chờ người thật (V47).

### D4. Phản hồi trúng / chí mạng / hạ quái — [TK] 1.4
- Phần **hình** đã có và đúng dải: thường/nặng/chí mạng/kết liễu khác nhau ([VK] 1.1, [CD] dòng "hạt/khựng/rung trong dải").
- **Nhận**: "không che vùng báo" (V9), "không lặp tiếng" (V30), "âm xác nhận riêng khi hạ quái" (V81, V30).
- **Chỉnh**: thứ còn thiếu là **âm thanh** (V10, V37, V40) và tín hiệu đánh vào khiên (V37), không phải thêm hình.
- **Bác**: chữ "CHÍ MẠNG" — đã có số vàng to có "!" ([VK] 1.1); thêm chữ làm rối thêm cảnh đông (V11).

### D5. Vật thể tương tác theo vùng — [TK] mục 2; liên quan V20
- Số đo ủng hộ nhu cầu: phòng không có địa hình, vị trí không tạo quyết định ([VL] 4.1b).
- **Lựa chọn**: (a) làm cả danh sách 14 vật; (b) một vật mẫu mỗi vùng; (c) trước hết xếp vật mang hệ có sẵn theo mẫu.
- **Đề xuất: (c) ở Giai đoạn 3, rồi (b) ở Giai đoạn 4 nếu được duyệt (Q9).** Nhận nguyên tắc [TK] 2.1/2.4: tối đa 1 tương tác chính mỗi phòng; logic không nằm trong `room_art.js`; phòng trùm ít vật. **Bác** (a): là hệ thống lớn mới, trái ràng buộc "không thêm hệ thống lớn trước khi thống nhất". Nếu làm (b), ưu tiên vật **dùng lại cơ chế sẵn có** (ví dụ "bia đá gợi ý khắc chế trùm" dùng lại `G.layerText` — nối thẳng vào V17/V39).

### D6. Nút kỹ năng "đổi cách chơi" — [TK] mục 3; liên quan V21
- Số đo: cây kỹ năng chỉ góp ~10% Sức mạnh, 13 điểm cho 15 nút ([VL] 5.1a, 5.3a); "Sát thương +8%" xuất hiện **2 lần** trong nhánh Công ([KT] mục 3).
- **Nhận**: thay **tối đa 2 nút** ở lượt đầu, giữ vị trí nút để bản lưu cũ đọc được, hoàn điểm một lần ([TK] 3.5, mục 5 bước 4).
- **Đề xuất**: thay **Công 4** (bản trùng "+8% sát thương") bằng **"Khai huyệt"** (+12% khi đòn nặng trúng quái đang báo trước/hồi chiêu — khớp chủ đề "đọc đòn, phản công" và V14); sau đó **Công 2** → **"Dư chấn"** (hoàn 3 mana khi đòn kết chuỗi trúng, tối đa 1 lần/2,5 s).
- **Bác (lúc này)**: thay **Hệ 4** ("đòn đầu sau đổi vũ khí chắc chắn gây hệ") — theo [VK] 4.4 đây là **cách duy nhất** để phản ứng hệ xảy ra khi chơi bình thường; "Dẫn khí" (Hệ 2) — thêm vật nhặt mới; "Lướt bóng" (Thủ 2) — phụ thuộc Né chuẩn, chờ D1; "Tĩnh tức" (Thủ 3) — đổi khả năng hồi máu, rủi ro cân bằng `cay.py`.
- **Bác (lúc này)**: biến thể vũ khí khi nâng bậc ([TK] 3.3) — hệ thống mới, cần giao diện chọn, để sau khi có người thật thử.

### D7. Hệ mẫu: **BĂNG** — [VK] mục 3
- **Vì sao Băng**: là hệ duy nhất **đổi cách chơi** chứ không chỉ cộng sát thương — làm chậm thấy bằng mắt, đóng băng **huỷ đòn quái** (nối vào "đọc đòn — phản công"), bé mất máu ít nhất (1,76/giây so với 2,13 của Lửa), Băng vỡ thưởng đánh đúng lúc; số đã gần cân (99 st/giây, kém Độc 17% nhưng khống chế 63%) ([VK] 3.3).
- **Mốc 30/120/300 với Băng**: Mầm khống chế 37% (+4% st/giây — nhạt), Thành hình 57% (bước nhảy rõ, có Gai băng trên sân), Thức tỉnh 63% + Băng vỡ ([VK] 3.3, 4.5). Thời gian đạt mốc (Thợ Rèn/Băng): 30 sau 11 phút, 120 sau 29 phút, 300 sau 81 phút ([VL] 3.5).
- **Việc tối thiểu cho Băng**: báo "sắp đóng băng" 4/5 tầng + dòng "X lần đóng băng, Y đòn quái bị huỷ" (V86); búa Băng (V46); ghi tương tác ẩn Băng–Độc (V48). Sau đó áp cách đo tương tự cho **Lửa** (V16).

### D8. Linh khí khi đổi vũ khí — V18
- (a) chỉ nhắc (bước 1, S); (b) Thợ Rèn truyền phần vượt 300 sang vũ khí cùng loại (M); (c) linh khí theo tài khoản (đổi lõi — bác).
- **Đề xuất: (a) ngay, (b) ở Giai đoạn 3 nếu được duyệt (Q11).**

### D9. Phòng có mục tiêu — V19
- (a) thêm loại phòng mới; (b) mỗi ải luôn có 1 phòng Thử thách, thêm biến thể "Trụ 30 giây" bằng đợt quái sẵn có; (c) giữ nguyên.
- **Đề xuất: (b)** ([VL] 4.1a, đúng [GY] 4.1 "giữ đa số phòng chiến đấu, thêm 1 phòng mục tiêu khác"). Kèm: bùa hệ ở rương kéo dài hết ải ([VL] 4.3a).

### D10. Trùm "mệt" và báo trước — V14, V8
- V14: (a) thêm `tire` từ pha 1; (b) sửa câu hướng dẫn cho đúng. **Đề xuất (a)** — đúng tinh thần [GY] 4.5 "cửa sổ phản công".
- V8: (a) nới báo trước Hồ Tinh vồ ~0,6 s và bầy nhỏ 0,5 s; (b) giữ, coi lộn là kỹ năng bắt buộc. **Đề xuất (a)** — hai con số, đúng tiêu chí [GY] ưu tiên 1 "người mới phân biệt được đòn nguy hiểm".

### D11. Sát thương trùm nhỏ — V5
- **Đề xuất: sửa** cột sát thương riêng cho trùm nhỏ vùng 3 và ải 2-1 (đây gần như là lỗi bảng số bị nhân hai lần), giữ cột máu.

### D12. Bất tử khi né 0,32 s — V32
- (a) giữ 0,32; (b) giảm 0,24. **Đề xuất (a)** — thống nhất với [TK] 4.2 "không đổi thời gian bất tử" và [VK] (là thứ làm "có né" thắng). Chỉ xem lại sau khi người thật chơi.

### D13. Bảng vàng — V23
- (a) siết luật Firestore (S); (b) Cloud Functions tính lại từ bản lưu (L); (c) giữ. **Đề xuất (a) ngay, (b) khi có nhiều người chơi.**

### D14. Thợ Săn — V22
- **Đề xuất**: cho 3–5 người thử Thợ Săn với cung/giáo **trước**; chỉ tăng máu 75 → 85 nếu vẫn yếu.

---

## 4. Kế hoạch theo giai đoạn

Nguyên tắc chia nhóm: **mỗi nhóm một bộ tệp riêng** để 3 phiên chạy song song không đụng nhau. Mỗi phiên tự chạy bài kiểm tra trong phạm vi mình, gộp vào `khoi-tao-du-an`, báo xong ngay. Sau khi cả 3 nhóm gộp: chạy bài chung `tests/rules.py`, `tests/ui_build.py`, `tests/smoke.py`, `tests/mapgen.py`, `tests/doors.py`, `node game/tests/cloud_save_regression.test.js` rồi mới đóng giai đoạn.

### Giai đoạn 1 — P0 và sửa nhanh an toàn (~1–1,5 ngày, 3 phiên song song)

| Nhóm | Việc (ID) | Tệp được sửa (chỉ nhóm này) | Thời gian | Bài kiểm tra / tiêu chí ra |
|---|---|---|---|---|
| **1A — Đăng nhập, lưu, phát hành, âm thanh nền** | V1, V2, V3, V4 (bước 1), V30, V27 | `game/js/village.js` (chỉ `titleGate`/`titleLogin`), `game/js/cloud.js` (`pull`), `game/js/engine.js` (`loadSave`, `G.sfx`, dòng 42), `.github/workflows/linh-khi-hosting.yml` | 1 ngày | `au_luu.py` tình huống 1 và 4 → "ĐÚNG", tình huống 5, 7 vẫn đúng; `tests/may.py` (chon, tat, google) đạt; `node tests/cloud_save_regression.test.js`; `node tests/may_luat.test.js`; `au_luu_hong.py` (giả lỗi → còn khoá `linhkhi_save_v1_hong`); `au_am_thanh.py` (≤ 2 tiếng 'die', tổng < 0,3); `au_hieunang.py`; đẩy lỗi cú pháp lên nhánh thử → máy đăng dừng |
| **1B — Đánh và né** | V6, V7, V9, V10, V33, V34, V35 | `game/js/combat.js`, `game/js/moves.js`, `game/js/data.js` (chỉ chú thích `cd`) | 1–1,5 ngày | `au_ne.py` (bấm khung 50–59 → lộn ở khung 60; k = 0 → Nhát lướt; có ca đóng băng; Nhát lướt bất tử); `au_tu_ngam.py` (không "QUAY NGƯỢC" khi đẩy cần); `au_input.py` B3 (hits = 0), B5 (mọi đòn trúng có tiếng đúng khung); `tests/moves.py`; `tests/ui_input.py`; chụp `au_hieu_ung.py`, `bao_truoc_shots.py` (vùng đỏ trên số); `tests/rules.py`; `tests/cay.py 12 khuyen` (tổng 2,5–4 giờ; tự ngắm đổi có thể làm bot xê dịch) |
| **1C — Người mới, chữ, màu** | V28, V29, V31, V77 (trừ "7 phòng" ở `village.js`), V79, V80 (O8, O9) | `game/js/stage.js` (TUT, drawHud ô mẹo, `startStage`), `game/js/village_scene.js` (`checkNews`), `game/js/chuong.js` (dòng 403), `game/js/bao_truoc.js`, `game/js/hanh_trang.js`, `game/js/bang_vang.js`, `game/js/tailor.js` (chỉ chuỗi "Hero"/dấu) | 1 ngày | `au_onboarding.py` (ảnh 07 một ô chữ; bước 27 `news` 1 mục; ải 2 mẹo Chưởng khi nút sáng; không lời nguyền ở ải hướng dẫn); `au_noi_dung.py` (`dat_dau` trống); `au_truy_cap.py` (ảnh deutan tách được vùng báo); `tests/hanh_trang.py`; `tests/ui_input.py`; `lang_shots.py` |

Ghi chú GĐ1: mẹo vũ khí lần đầu (V79 phần O4) nằm trong `moves.js` → giao cho **1B** làm luôn (vài dòng trong `tip()`), 1C không đụng `moves.js`. "7 phòng" (`village.js` 167) và thẻ Cụ Đồ (`village.js` `open`, phần O7 của V29) để **GĐ2 nhóm 2C** vì `village.js` đang thuộc 1A.

### Giai đoạn 2 — P1 còn lại + cân bằng đã được duyệt (~2–3 ngày)

Chỉ làm các việc có chữ "cần quyết" **sau khi** chủ dự án trả lời "có".

| Nhóm | Việc (ID) | Tệp được sửa | Thời gian | Bài kiểm tra / tiêu chí ra |
|---|---|---|---|---|
| **2A — Trùm và cân bằng trùm** | V5 (Q2), V8 (Q4), V14 (Q3), V38, V16 cách 1 (hoặc cách 2 nếu Q8 = có), V48, V23 (Q1, phần luật) | `game/js/data.js` (`G.STAGE_K.boss`, `G.HINTS`), `game/js/boss.js`, `game/js/mobs.js` (bầy nhỏ dòng 365), `game/js/monster_art.js` (mốc Hồ Tinh), `game/firebase/linhkhi.rules`, `game/tests/may_luat.test.js` | 1,5–2 ngày | `au_spam.py` (Hổ Lửa: bot không né cần ≥ 2 đòn); `au_trum.py` (% mệt 5–12% mọi pha trùm vùng, > 0 trùm nhỏ); `au_bao_truoc.py` (mọi "dư" ≥ 0,25 s); `au_trum_hoc.py`; `tests/campaign.py`; `tests/cay.py 12 khuyen`; `tests/balance.py`; `tests/quai.py`; `node tests/may_luat.test.js` (power 2.000 và khách bị từ chối). Luật Firestore **chủ dự án tự đưa lên** |
| **2B — Vũ khí, độ trễ, phản hồi, cảnh đông** | V12, V13, V15 (Q5), V46, V11, V17 (phần đếm trong `G.hurtPlayer`, `b.skillName` do 2A đặt ở `boss.js` — xem ghi chú), V50 (nếu 2A xong `mobs.js`) | `game/js/moves.js`, `game/js/combat.js`, `game/js/fx.js` | 2 ngày | `au_input.py` A1 ("vào động tác" ≤ 20 ms mọi vũ khí); `au_vu_khi.py` (búa %huỷ ≤ 30%, đám ≥ 85% kiếm, dấu ấn búa ≥ 70% kiếm); `au_dps.py`; `tests/dps.py`; `tests/linhkhi.py`; `au_hieu_ung.py` (khung chạm trần giảm); `tests/perf.py`; `au_hitbox_shots.py`; `tests/moves.py` |
| **2C — Màn hình làng, bảng thua, chữ to** | V17 (phần `panelLose`), V18 bước 1, V21 (hiện "+X SM"), V25, V26, V29 phần O7, V77 phần "7 phòng", V53 | `game/js/stage.js` (`panelLose`, `panelResult`, `G.weaponLine`), `game/js/village.js` (lò rèn, `open`, `mapScreen`), `game/js/hanh_trang.js`, `game/js/upgrade.js`, `game/js/do_roi.js`, `game/js/engine.js` (chỉ `ui.text` sàn chữ), `game/js/village_scene.js` | 2 ngày | `tests/hanh_trang.py`; `tests/ui_build.py`; `tests/ui_robust.py`; `ui_shots.py` (bảng thua 3 cỡ màn hình); `au_ui.py` (chữ nhỏ nhất ≥ ~11 px); `au_truy_cap.py`; `au_bang.py`; `au_onboarding.py`; `au_tien_trien.py linhkhi --n=6`; `tests/cay.py` phần LUAT |

Ghi chú GĐ2: chỗ chạm nhau duy nhất là bảng thua — 2B ghi dữ liệu (`W.hurtBy`, `W.lastHurt`) trong `combat.js`, 2A thêm `b.skillName` trong `boss.js`, 2C chỉ **đọc** trong `stage.js`. Thống nhất tên trường trước khi bắt đầu. V24 (đăng nhập iPhone) là việc **thử tay** song song; chỉ sửa `authDomain` nếu thử thấy hỏng.

### Giai đoạn 3 — Vòng lặp, âm thanh, hệ mẫu Băng, Né chuẩn (~3–4 ngày)

| Nhóm | Việc (ID) | Tệp được sửa | Thời gian | Bài kiểm tra / tiêu chí ra |
|---|---|---|---|---|
| **3A — Phòng và vòng lặp** | V19 (Q10), V20 (mẫu vật mang hệ), V51, V52, V56, V57, V59 | `game/js/mapgen.js`, `game/js/stage.js` (`clearRoom`, `buildWaves`, `freeSpot`, `addEnv`), `game/js/bang_vang.js` | 2–3 ngày | `tests/mapgen.py`; `tests/doors.py`; `au_mapgen.py` (mỗi ải có 1 phòng mục tiêu, đếm vật đè); `tests/env_rooms.py`; `room_shots.py`; `tests/cay.py 12` (2,5–4 giờ); chơi tay 5 ải |
| **3B — Âm thanh và cài đặt** | V37 (phần tiếng), V40, V41 ("Giảm hiệu ứng"), V72 (âm lượng), V73, V81, V63, V64, V65, V74 | `game/js/engine.js` (`SFX`, `audioStart`), `game/js/village.js` (`settings`), `game/js/vfx_cfg.js`, `game/js/cloud.js`, `web/sw.js` | 2 ngày | `au_am_thanh.py`; `au_input.py` B5; `tests/ui_input.py`; `au_luu.py`; `node tests/cloud_save_regression.test.js`; `tests/may.py`; nghe thử (checklist) |
| **3C — Hệ mẫu Băng và Né chuẩn** | D1 Né chuẩn (Q6) + nâng ngưỡng "Bắt bài lăn né" (M4), D2, V86, V37 (phần hình/đẩy lùi), D6 Công 4 "Khai huyệt" (Q7), V18 bước 2 (Q11) | `game/js/combat.js`, `game/js/moves.js`, `game/js/fx.js`, `game/js/boss.js` (`computeLayers` ngưỡng), `game/js/upgrade.js`, `game/js/data.js` (nút kỹ năng) | 3 ngày | `au_ne.py` (ca Né chuẩn: vùng nổ +5, vũng 0, đạn +5 một lần); `au_ne_thuong.py`; `au_he.py` (số Băng không đổi); `au_spam.py`; `au_trum_hoc.py`; `tests/rules.py`; `tests/cay.py`; `tests/dps.py`; `tests/linhkhi.py`; `tests/chuong.py`; `au_luu_hong.py` (bản lưu cũ có nút Công 4 vẫn đọc được, điểm được hoàn) |

### Giai đoạn 4 — Tuỳ chọn, sau khi có người thật chơi thử

Vật thể tương tác mẫu mỗi vùng (D5, Q9); Thợ Săn (V22, Q12); "Đổi tay" (V41); nhạc/âm nền (V72); đổi tên khái niệm (V78); vũ khí dân gian có nét riêng (V58); bóng dáng nhân vật và tương phản Lâu đài (V70, V71); rác bộ nhớ (V75); analytics (V76); bàn phím trong bảng (V83); nợ kỹ thuật từng chỗ + `tests/tho_may.py` (V84); V36, V42, V47, V49, V54, V55, V60, V61, V66, V69, V82, V85.

### Cần chủ dự án quyết (trả lời Có / Không)

1. **Q1 — Bảng vàng:** Có đồng ý siết luật Firestore (Sức mạnh ≤ 1.500, sao ≤ 45, hạ trùm vùng ≥ 20 giây, **không cho khách ẩn danh lên bảng**) và anh/chị tự đưa luật lên Firebase không?
2. **Q2 — Trùm nhỏ:** Có đồng ý giảm sát thương trùm nhỏ ải 2-1 và 3-1…3-4 để mỗi đòn không mạnh hơn trùm vùng cùng vùng (giữ nguyên máu trùm) không?
3. **Q3 — Trùm "mệt":** Có đồng ý cho trùm vùng "mệt" (choáng, nhận thêm sát thương) sau một chiêu lớn **từ pha 1**, và trùm nhỏ mệt ngắn, để đúng với lời hướng dẫn không?
4. **Q4 — Báo trước:** Có đồng ý nới thời gian báo trước của Hồ Tinh vồ (0,44 → ~0,6 giây) và bầy nhỏ (0,42 → 0,5 giây) không?
5. **Q5 — Búa:** Có đồng ý cho búa chạm sớm hơn trong động tác (không đổi sát thương) và Né không bắt búa chờ thêm không?
6. **Q6 — Né chuẩn:** Có đồng ý thêm "Né chuẩn" (+5 mana, chỉ khi né được đòn có nguồn: đòn cận chiến, đạn, vùng có báo trước; **không** tính vũng sàn, cháy/độc, chạm thân quái), **làm lại từ đầu** thay vì gộp bản thử của ChatGPT, và nâng ngưỡng "Bắt bài lăn né" không?
7. **Q7 — Cây kỹ năng:** Có đồng ý thay nút Công 4 (bản trùng "+8% sát thương") bằng "Khai huyệt", hoàn điểm miễn phí một lần cho người đã học không?
8. **Q8 — Lửa:** Có đồng ý **chỉ sửa câu gợi ý** "Lửa hợp với bầy quái" ngay bây giờ, và để việc tăng sức Nổ lan tới sau khi làm xong hệ mẫu Băng không?
9. **Q9 — Vật tương tác:** Có đồng ý thử **một** vật tương tác mẫu cho mỗi vùng ở Giai đoạn 4 (sau khi có người thật chơi), thay vì làm cả danh sách của ChatGPT không?
10. **Q10 — Phòng mục tiêu:** Có đồng ý mỗi ải **luôn** có một phòng Thử thách (thêm kiểu "Trụ được 30 giây") và bùa hệ ở rương kéo dài hết ải không?
11. **Q11 — Truyền linh khí:** Có đồng ý cho Thợ Rèn truyền phần linh khí vượt 300 sang một vũ khí khác cùng loại không?
12. **Q12 — Thợ Săn:** Có đồng ý **chưa** đổi chỉ số Thợ Săn cho tới khi 3–5 người thật chơi thử với cung/giáo không?
13. **Q13 — Bất tử khi né:** Có đồng ý **giữ** thời gian bất tử khi né 0,32 giây (không giảm) cho tới khi có người thật chơi thử không?

---

## 5. Checklist kiểm thử tay

Ghi lại: tên máy, hệ điều hành, trình duyệt, ngày, phiên bản game (góc màn chào). Mỗi dòng ghi Đạt / Không đạt / Ghi chú. Những dòng có "(sau V…)" chỉ kiểm sau khi việc đó đã làm.

### 5a. Trình duyệt máy tính (bàn phím / chuột)

**Vào game, lưu**
- [ ] Mở spiritblade.web.app trong cửa sổ ẩn danh, bấm "Đăng nhập Google", **đóng** cửa sổ Google → (sau V1) hiện nút "Chơi tạm (chưa lưu mây)"; bấm vào được làng.
- [ ] Đăng nhập Google thật → vào làng; Anh Mõ ghi "Đã lưu lên mây lúc …" sau khi qua một ải.
- [ ] Tắt mạng (DevTools → Offline) rồi mở lại trang: vẫn vào chơi được, dòng chữ báo chỉ lưu trên máy.
- [ ] Mài vũ khí rồi đóng tab ngay (dưới 4 giây), mở lại: vẫn thấy đã mài.
- [ ] Đang giữa ải thì tải lại trang: về làng, đồ cũ đủ, đồ nhặt trong ải mất, vàng không nhân đôi.

**Điều khiển** (WASD/mũi tên đi · J/Z/Space đánh · K/X/Shift né · L/C đặc biệt · I/V chưởng (giữ để tích lực) · Q/Tab đổi vũ khí · E/H bình máu · Esc/P dừng · M bản đồ)
- [ ] Kiếm: bấm J nhanh 10 lần — lần nào cũng vung ngay khi bấm.
- [ ] Cung/giáo/búa: bấm nhanh — (sau V12) có tư thế ngay khi bấm, không đợi nhả phím.
- [ ] Bấm K liên tục thật nhanh: (sau V7) không lần nào "mất"; bấm K rồi J ngay → ra Nhát lướt.
- [ ] Chém hụt và chém trúng: tiếng/hình khác nhau rõ; Nhát lướt, Trảm Nguyệt, Địa Chấn trúng **có tiếng** (sau V10).
- [ ] Đổi vũ khí (Q) đúng lúc đang chém: (sau V34) đòn cũ dừng ngay, không có hình cung vung kiểu chém.
- [ ] Giữ I tích chưởng rồi thả; bấm E khi máu chưa đầy: bình máu giảm 1, máu tăng.
- [ ] Esc tạm dừng; bảng kết quả Esc = về làng.

**Đọc trận**
- [ ] Chạy khỏi trùm (đẩy hướng ra xa) khi có quái nhỏ sau lưng, bấm K rồi J: (sau V6) em bé lướt **theo hướng đang chạy**, không quay về trùm.
- [ ] Đứng trong vòng đỏ, chờ gần đầy rồi lộn: không mất máu (trừ cháy/độc đang có).
- [ ] (sau V9) Số sát thương **không** che vùng đỏ.
- [ ] Hồ Tinh vồ: (sau V8) thấy vùng đỏ rồi đi bộ ra kịp.
- [ ] Trùm vùng ở pha 1: (sau V14) có lúc trùm choáng sau chiêu lớn, đánh vào thấy số to hơn.
- [ ] Thua trùm: (sau V17) bảng thua có dòng "Mất máu nhiều nhất: …" và "Trùm kháng …, yếu …".

**5 phút đầu (bản lưu trống: xoá dữ liệu trang)**
- [ ] Làng: toast "Kéo bên trái để đi…", sau ~9 giây "Tới bến đò bên phải…".
- [ ] Chọn ải: thẻ ải 1 ghi **8 phòng** (sau V77).
- [ ] Phòng 1: (sau V28) chỉ **một** khung chữ; chữ nói "bấm (hoặc giữ)" (sau V77).
- [ ] Phòng tinh anh: mũi tên "↑ Chạm để đổi vũ khí" chỉ đúng ô.
- [ ] Về làng sau ải 1: (sau V29) chỉ **một** chấm đỏ; mở Cụ Đồ thấy đúng thẻ có điểm.
- [ ] Ải 2: (sau V79) không lặp mẹo kiếm; mẹo Chưởng hiện khi nút đã sáng.

**Hiệu năng (máy tính)**
- [ ] Phòng trùm vùng 3 có quái gọi thêm + chưởng + Địa Chấn: lúc nào cũng thấy em bé ở đâu; không giật (DevTools → Performance: không có chuỗi khung > 33 ms kéo dài).

### 5b. Điện thoại nằm ngang (Android Chrome + iPhone Safari)

Chuẩn bị: pin > 50%, độ sáng 30–40%, âm thanh bật, công tắc im lặng iPhone **tắt**. Cầm ngang.

**Đăng nhập và chơi không mây**
- [ ] Mở link bằng Chrome/Safari: "Đăng nhập Google để vào" → cửa sổ Google hiện → vào được; tiến trình khách vẫn giữ.
- [ ] **Gửi link qua Zalo, mở trong Zalo** (Android và iPhone): bấm đăng nhập → ghi lại lỗi; (sau V1) có nút "Chơi tạm" và dòng gợi ý mở bằng Chrome/Safari; vào chơi được.
- [ ] Mở link trong Messenger / Facebook: như trên.
- [ ] Chế độ máy bay (đã từng mở game): vẫn vào chơi được.
- [ ] iPhone: "Thêm vào màn hình chính", mở từ biểu tượng → đăng nhập Google được không (V24); chạm đúng chỗ; có tiếng.

**Lưu / tải**
- [ ] Qua một ải → Anh Mõ ghi "Đã lưu lên mây lúc …". Mở game ở máy thứ hai cùng tài khoản: đúng tiến trình.
- [ ] **Hai máy:** máy A chơi thêm 2 ải (có mạng). Máy B (bản cũ) tắt mạng, mua một món, đóng; bật mạng mở lại máy B. Mở lại máy A: (sau V2) tiến trình 2 ải **còn**, hoặc game **hỏi** chọn bản.
- [ ] Wi-Fi chập chờn (bật/tắt nhanh) khi vừa qua ải: sau ≤ 60 giây mây khớp lại (bản sửa 15:33).
- [ ] Tắt tiếng trong bảng Tạm dừng, đóng mở lại: vẫn tắt.

**Điều khiển cảm ứng**
- [ ] Cần gạt (nửa trái màn hình) nổi theo ngón; đi 8 hướng mượt.
- [ ] Nút Đánh: chạm nhanh 10 lần với kiếm — vung ngay; với cung/giáo/búa — (sau V12) có tư thế ngay khi chạm.
- [ ] Giữ Đánh với búa (lấy đà) rồi thả: ra nện đất; bị quái đánh trong lúc giữ: đà còn.
- [ ] Nút Né: chạm liên tục khi hoảng — (sau V7) không lần nào "không ăn".
- [ ] Nút Đặc biệt (≥ 25 mana) và nút Chưởng (giữ để tích lực): đều ra chiêu.
- [ ] Chạm ô vũ khí để đổi vũ khí; chạm Bình máu (góc trên trái) để hồi.
- [ ] **Đa chạm:** ngón cái trái giữ cần + ngón phải giữ Đánh + chạm Né + chạm Đặc biệt → tất cả đều ăn, nhân vật không khựng; thả ngón Đánh trước, cần gạt vẫn đi.
- [ ] Giữ Đánh rồi trượt ngón ra mép màn hình mới thả: thôi đánh (không kẹt).
- [ ] Đặt ngón cái trái cao gần nút Dừng: (sau V67) không bị tạm dừng nhầm.

**Xoay máy, chuyển nền**
- [ ] Cầm dọc: khung tự xoay ngang, chạm đúng chỗ. Xoay qua lại 3 lần khi đang giữ cần: nhân vật dừng, không tự chạy.
- [ ] Safari iPhone: vuốt làm hiện/ẩn thanh địa chỉ khi đang chạy — (sau V68) cần gạt không lệch, không tự đi.
- [ ] Đang trong ải, chuyển sang app khác 10 giây rồi quay lại: game đang tạm dừng, em bé không mất máu.
- [ ] iPhone: có cuộc gọi đến, nghe xong quay lại game: (sau V73) còn tiếng.
- [ ] Khung game không bị tai thỏ / thanh điều hướng che (nút Đánh, Bình máu, ô vũ khí thấy đủ).

**Đọc trận khi nhiều hiệu ứng**
- [ ] Bầy ong/cá con/dơi: trước khi cắn có thấy con quái chớp trắng (~0,13 giây) không.
- [ ] Đòn chéo (quái ở góc): vùng đỏ và chỗ thật sự trúng có khớp không.
- [ ] Phòng trùm nhiều vùng đỏ cùng lúc: biết vùng nào nổ trước không; vùng đỏ có lẫn vệt cháy lửa của mình không (V42).
- [ ] Cảnh đông (vùng 3, phòng trùm có quái gọi thêm, búa Lửa nổ dây chuyền): luôn thấy em bé (V11).
- [ ] Chơi một ải chỉ bằng cung rồi vào trùm: đọc được "Chống đánh xa"; (sau V13) thấy "Xa quá!" khi bắn từ xa.
- [ ] Đọc được "Rừng già 2 · Đánh quái", "Sức mạnh … / khuyên …", dòng phụ trong Hành trang mà không đưa máy sát mắt (V25).

**Người mới, 5 phút đầu** (nhờ một người chưa chơi, không giải thích miệng — [GY] mục 10)
- [ ] Ghi: mấy giây thì bắt đầu đánh; có dùng Né không; có hiểu vùng đỏ không; có tìm ra Chưởng, Bình máu không.
- [ ] Sau ải 1: người chơi tự biết nên tới người làng nào trước không.
- [ ] Sau 10 phút: có muốn chơi ải 2 không.

**Hiệu năng trong phòng đông**
- [ ] Android tầm trung: phòng đông quái vùng 2–3 chơi 10 phút — có giật, nóng máy không; ghi cảm nhận (V27, V75).
- [ ] iPhone: như trên.

---

## 6. Những gì chưa xác minh được

- **Chưa có thiết bị thật**: mọi số đo cỡ nút, độ trễ, hiệu năng là Chromium giả lập (cảm ứng DevTools, không GPU). Chưa thử Safari iPhone thật, tai thỏ thật, Android tầm trung thật ([UI], [CD], [KT] đều ghi). Số "giả CPU chậm 4×" bi quan hơn thực tế.
- **Chưa có Firebase thật**: đăng nhập và lưu mây thử bằng `tests/fake_firebase.js`; luật bảng vàng kết luận từ đọc `linhkhi.rules`, chưa chạy trình giả lập Firestore ([UI], [VL]). Lỗi Google trong Zalo/Messenger (`disallowed_useragent`) là hành vi đã biết của Google, **chưa thử bằng máy thật** trong phiên nào. Đăng nhập trên iPhone (V24) và token hết hạn (V64) chưa thử.
- **Chưa có cảm nhận của người thật**: các số cân bằng (tỉ lệ thắng, 52 lượt/3,2 giờ, bốn em bé, Gai khó chịu, kiếm/giáo giống nhau) đến từ **bot** — bot phản xạ đều, né nhiều hơn người (37–40 lần/phút), dùng kiếm cho mọi em bé ([VL], [VK]). Tỉ lệ nhát búa bị huỷ ở người thật có thể thấp hơn 49%.
- **Chưa nghe bằng tai**: âm thanh chỉ được đếm và đo thời điểm/âm lượng ban đầu ([CD], [VK], [KT]).
- **Phông chữ**: máy kiểm tra không tải được Be Vietnam Pro → độ rộng chữ, số dòng có thể khác chút ít trên máy thật ([UI], [KT]).
- **Mù màu**: giả lập bằng ma trận trên ảnh chụp, chưa có người mù màu thật xem ([KT]).
- **Các con số đề xuất** (hệ số trùm nhỏ 2,6–2,9; báo trước 0,6 s; búa chạm 35%; Nổ lan 0,7; Nhát lướt ×1,8–2,0; Thợ Săn 85 máu) là **điểm khởi đầu để thử**, chưa chạy `tests/cay.py` với số mới ([VK] mục 7).
- **Bản thử "Né chuẩn" của ChatGPT** chưa được đo bằng bài kiểm tra nào trong repo; chỉ biết lỗi kích hoạt bởi vũng sàn (theo thông tin chủ dự án). Đề xuất làm lại theo D1.
- **Các đợt đồ hoạ gộp sáng nay**: các bản rà soát đã đo lại phần bị ảnh hưởng (hiệu ứng, ảnh); bản này không chạy lại bài nào (chỉ tổng hợp, không sửa code).
- Tài liệu này **không chạy lại bài kiểm tra nào**; mọi số đo trích từ 5 bản rà soát. Việc duy nhất đã kiểm tra trực tiếp trong code: trạng thái bản sửa lưu mây (`cloud.js`) và nút "Chơi tạm" (`village.js` dòng 843).
