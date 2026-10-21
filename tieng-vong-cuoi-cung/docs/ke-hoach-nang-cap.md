# KẾ HOẠCH NÂNG CẤP CHUÔNG HUNTER – TIẾNG VỌNG CUỐI CÙNG

Ngày lập: 21/10/2026 · Nhánh `tieng-vong-cuoi-cung`, gốc commit `596ed9f` · Theo yêu cầu `docs/yeu-cau-ke-hoach-nang-cap.md`

> **Đây chỉ là kế hoạch.** Không có dòng code, ảnh, JSON, sprite sheet hay thư mục nào bị sửa. File này là thay đổi duy nhất.
> Mọi hạng mục dưới đây chỉ được làm sau khi chủ dự án duyệt theo mã ở **PHẦN F**.

## 0. Cách đọc tài liệu này

**Đã đọc (theo đúng thứ tự yêu cầu):** `README.md`, `docs/gdd.md`, `docs/demo-chibi.md`, `docs/fix-animation.md`, `docs/do-phan-giai-960.md`,
`game/demo.html` (đủ 1663 dòng), `game/anim/lam-chibi.json`, `quai-boss.json`, `the-gioi.json`, `lam.anim.json`, `game/tools/chibi-sheets.py`,
`game/tools/do-animation.py`, `tools/chibi-tach-khung.py`, `chibi-khung-chuan.py`, `chibi-quai.py`, `chibi-nen.py`, `chibi-ghep-thu.py`,
`chibi-so-sanh-co.py`, `game/build-demo.py`. Đọc thêm `docs/tieu-chi-animation-lam.md`, `docs/yeu-cau-fix-animation.md`.
`tools/chibi-batch-3.py` và `tools/chibi-tileset.py`: chỉ đọc phần đầu, các hằng số cỡ (quái 120 px, boss 330 px, đồ vật) và danh sách hàm, không đọc hết từng dòng.
**Chưa đọc** `game/lib/*.js`, `game/phong-xam.html`, `game/xem-thu/*.html` (demo không còn nạp chúng). Kế hoạch không kết luận gì về các file này.

**Nhãn dùng trong tài liệu:**

| Nhãn | Nghĩa |
|---|---|
| **[LỖI]** | Thấy tận mắt trong code, hoặc chạy thử ra đúng như vậy. Có file, hàm, dòng. |
| **[RỦI RO]** | Có thể gây vấn đề nhưng chưa chứng minh được (thường cần máy iPhone thật hoặc cần chơi thử). |
| **[ĐỀ XUẤT]** | Cải tiến, không phải lỗi. |

**Cách đo trong kế hoạch này (chỉ đọc, không ghi vào repo):** chép thư mục `game/` + `art/chibi/nen/parallax/` sang thư mục tạm ngoài repo,
chạy `build-demo.py` ở bản chép, rồi chạy Chromium headless (trình duyệt không giao diện) với đồng hồ khung hình giả, gọi thẳng các hàm của game để kiểm tra.
Đo ảnh sprite bằng Python đọc `lam-chibi.png` / `.json`. Sau khi đo, `git status` vẫn sạch. **Không có số FPS iPhone nào trong tài liệu này** — chưa có số đo trên máy thật.

**Thuật ngữ ngắn:**
- *Bước logic*: 1/60 giây. Game tính vật lý 60 lần/giây, không phụ thuộc màn hình 60 Hz hay 120 Hz.
- *Pivot / điểm neo*: điểm của hình trùng với chân nhân vật (giữa đế ủng).
- *Hitbox vật lý*: hộp chữ nhật dùng để va chạm với tường, sàn (Lam: 20×30 px).
- *Vùng ăn đòn (hurtbox)*: hộp để quái đánh trúng Lam (40×120 px).
- *Hộp đòn*: hộp gây sát thương khi Lam chém.
- *Hit-stop*: game đứng hình vài bước khi đánh trúng để cú đánh "nặng tay".
- *Buffer (bộ nhớ đệm phím)*: game nhớ phím bấm hơi sớm trong vài bước.
- *px logic*: pixel của khung 960×540. Trên iPhone 13/14 ngang, 1 px logic ≈ 2,17 điểm ảnh thật (đã đo: `BK = 2,1656`, canvas 2079×1170).

---

## PHẦN A — ĐÁNH GIÁ HIỆN TRẠNG

### A.1 Những điểm tốt (giữ nguyên)

1. **Vòng lặp đúng chuẩn.** Logic cố định 60 bước/giây, vẽ có nội suy (`loop`, `demo.html` dòng 1643–1661). Animation đếm theo bước logic, không theo số lần vẽ. Tài liệu cũ đã đo: vòng chạy 666,7 ms ở cả 60 Hz và 120 Hz.
2. **Tách vật lý và hình.** Hitbox 20×30 cố định, không đổi theo khung ảnh (`pl`, dòng 240). Hình vẽ quanh pivot ở chân (`veBuoc`, dòng 1157–1163).
3. **Metadata sprite gọn và rõ.** Mỗi khung `[x, y, w, h, ox, oy]`, mỗi bước có `ms, dx, dy, hit, box`, có thêm `moc` (tâm thân, đỉnh, đế, mắt, cỡ mũ) để đo (`lam-chibi.json`).
4. **Tiếng Vọng phát lại chính xác.** Đã chạy thử: ghi 120 bước gồm chạy, nhảy, chém. Bóng phát lại **lệch 0 px**, **0 khung animation khác** so với Lam lúc ghi (chỉ chậm 1 bước, đúng thiết kế). Ghi tối đa đúng **180 bước = 3 giây** (`echoFrames:180`, dòng 190; `step` dòng 1114).
5. **Chống đánh trúng nhiều lần.** Mỗi nhát có `swingId` riêng, mỗi mục tiêu chỉ nhận 1 lần mỗi nhát, Lam và bóng dùng hai biến riêng `swP` / `swE` (`strike`, dòng 745).
6. **Cộng hưởng tính theo bước logic** (`S.frame − e.lastE <= P.resWindow`, dòng 747–748). FPS thấp không làm cửa sổ 12 bước dài ra hay ngắn lại.
7. **Không tạo đối tượng mới mỗi khung** cho hạt, hiệu ứng, vệt lướt, bản ghi Vọng (pool tạo sẵn, dòng 247–259).
8. **Công cụ debug tốt:** `?debug=anim`, phát từng bước, phát chậm, hiện FPS vẽ (dòng 1580–1640). Công cụ đo `do-animation.py` dựa trên tọa độ vẽ thật.
9. **Canvas nét theo màn:** bộ đệm = cỡ CSS × devicePixelRatio (giới hạn 3), có chừa safe-area cho nút (dòng 1481–1492, CSS dòng 29–61).

### A.2 Lỗi xác nhận

| # | Lỗi | File · hàm · dòng | Bằng chứng |
|---|---|---|---|
| L1 | **Cảm ứng lỗi khi bấm nút mà không giữ cần.** Nhánh `else` đọc `dT.clientX` trong khi `dT` là `null` → JavaScript báo lỗi ở mọi lần chạm sau lần đầu. Lỗi xảy ra trước dòng gán `latch` (dòng 454) và trước dòng bật sáng nút (456–457). Hệ quả: một cú chạm rất nhanh (bấm rồi thả trong cùng 1 bước logic) có thể bị mất, nút không sáng lên khi bấm. | `demo.html` · `onTouch` · dòng 446–453 | Chạy thử: lần 1 `touchstart` bình thường; `touchend`, `touchstart`, `touchmove` sau đó đều báo `Cannot read properties of null (reading 'clientX')`. |
| L2 | **Lần đầu đặt ngón lên cần, chưa có hướng.** Khi cần vừa được kích hoạt, code chỉ đổi trạng thái hiển thị (nhánh `if`), bỏ qua phần tính hướng. Phải đợi `touchmove` mới có hướng. Đặt ngón vào mép cần mà không nhúc nhích → Lam đứng yên. | `demo.html` · `onTouch` · dòng 448–452 | Chạy thử: sau `touchstart` thì `tc.r = 0`, sau `touchmove` 1 px thì `tc.r = 1`. |
| L3 | **Bấm Chém sớm trong combo bị nuốt.** Bộ đệm Chém chỉ giữ 8 bước (dòng 1100), nhưng muốn nối đòn phải đợi hết khung chạm (`atkT >= su+ac` = 19, dòng 668). Bấm lần 2 khi `atkT ≤ 11` (183 ms đầu) thì **mất phím**. Bấm khi đòn vừa kết thúc (`atkT ≥ 27`) thì **bắt đầu lại đòn 1** thay vì đòn 2. | `demo.html` · `step` dòng 1100, `updatePlayer` dòng 664–668 | Chạy thử 16 thời điểm bấm: atkT 1–11 → mất; 13–25 → nối đòn 2; 27 → đòn 1 lại. |
| L4 | **FPS dưới 15 thì game chạy chậm lại; dừng hình lâu hơn 250 ms thì chỉ tính 1 bước.** Mỗi lần vẽ tối đa 4 bước logic, phần thời gian thừa bị bỏ. | `demo.html` · `loop` · dòng 1643, 1651, 1659 | Chạy thử: 10 lần vẽ/giây → **40 bước/giây** (chậm còn 67 %); 4 lần vẽ cách 300 ms → **4 bước** trong 1,2 s. Đây là cách xử lý có chủ đích, nhưng chưa ghi trong tài liệu và cần chủ dự án chọn (xem F). |
| L5 | **Bị đánh làm hit-stop ngắn lại.** `hurt()` gán thẳng `S.hitstop=6` thay vì lấy giá trị lớn hơn. Nếu Lam bị đánh đúng lúc Cộng hưởng (hit-stop 8) thì còn 6. | `demo.html` · `hurt` · dòng 806 | Đọc code (các chỗ khác đều dùng `Math.max`). Ảnh hưởng nhỏ. |
| L6 | **Bước cuối của bản ghi Tiếng Vọng không bao giờ gây sát thương.** `updateEcho` đặt `echo.done=true` ngay khi lấy bước cuối, rồi `step` chỉ đánh khi `!echo.done`. | `demo.html` · `updateEcho` dòng 733, `step` dòng 1116 | Đọc code. Chỉ ảnh hưởng khi nhát chém rơi đúng bước cuối của 3 giây. |
| L7 | **Hộp đòn không khớp hình dao** (hộp được giữ nguyên số cũ khi sửa animation). Tài liệu cũ đo: đòn 1 hộp dài hơn dao ~13 px, đòn 2 dao dài hơn hộp ~25 px. Lần đo này (chỉ đo phần lưỡi kim loại sáng, nên số hơi khác): đòn 1 hộp vượt mũi dao **19 px**; đòn 2 mũi dao vượt hộp **19 px**; chém trên không hộp vượt **24 px**, đỉnh hộp cao hơn dao 39 px; đòn 3 hộp vượt 12 px; chém hất khớp (±1 px). | `game/tools/chibi-sheets.py` dòng 176–177 (`HOP`); `demo.html` `ATK` dòng 201–208; `nhanATK` dòng 693–698 | Hai cách đo khác nhau cho số khác nhau → cần thống nhất **một** cách đo trước khi sửa (việc CB-2). |
| L8 | **Mỗi đòn chỉ có 1 hộp đòn cho cả pha chạm.** Hộp chỉ lấy từ bước có `hit`, giữ nguyên suốt 8 bước (133 ms), không đổi theo hình. | `demo.html` · `nhanATK` dòng 695–696, `atkBox` dòng 559–565 | Đọc code. Không phải lỗi chạy, nhưng là giới hạn của hệ thống. |
| L9 | **Nhịp chạy không theo tốc độ.** Khung chạy đổi theo thời gian (`animK(A.run, CH.t)`), còn biến quãng đường `pl.runPh` được tính nhưng **không dùng ở đâu**. Lúc tăng tốc, giảm tốc, chân trượt trên sàn. | `demo.html` · `lamChibi` dòng 713; `updatePlayer` dòng 674 | Đo ảnh: bàn chân trụ lùi ~22 px mỗi khung chạy (frame 1→4: +27 → +8 → −21 → −40), **khớp đúng** quãng đường vật lý ở tốc độ tối đa (5 bước × 4,4 = 22 px). Chậm hơn tốc độ tối đa thì không khớp. |
| L10 | **Các con số gắn với cỡ Lam 160 px nằm rải rác trong code** (sẽ sai khi thu nhỏ): dấu "!" trên đầu bóng `−190` (dòng 1398); bóng đổ bán kính 30 (dòng 1406); vệt sáng chân bóng giữ tư thế 26×5 (dòng 1394); vùng ăn đòn 40×120 (dòng 558); hạt máu khi bị đánh `pl.y−30` (dòng 806); nhãn debug quái `−128` (dòng 1627). | `demo.html` | Đọc code. |
| L11 | **Animation tạm vẫn còn:** lướt = 1 khung chạy; tiếp đất, bị đánh, chết = 1 khung `jump/1`; bám tường = `jump/4`. | `lam-chibi.json` mục `dash, land, hurt, wall, dead`; `chibi-sheets.py` dòng 164–168 | Đọc JSON. |
| L12 | **Lỗi ảnh gốc (code không sửa được):** idle nhô đầu 3,8–4,1 px trong 1 khung (`moc` idle/2 → idle/3: đỉnh −161,7 → −165,5); idle đứng chân dài hơn các dáng đứng khác (mắt idle −113,5…−117,8 so với rút dao −103,0…−105,8, thu thế −109,8). | `art/chibi/lam/idle-6.png`; số trong `lam-chibi.json` mục `moc` | Đọc JSON, khớp mục G, H của `docs/fix-animation.md`. |
| L13 | **Tài liệu lệch nhau:** `tieu-chi-animation-lam.md` vẫn quy định sprite 64×64, pivot [32,63], 16 màu (hướng pixel cũ) trong khi game đã dùng chibi ô 240; `lam.anim.json` (64×64) và `lib/anim2d.js` không còn dùng; README vẫn ghi "môi trường pixel cũ tạm ×2"; GDD ghi 480×270, nhân vật 32×32. | các file đã nêu | Đọc file. Gây nhầm khi giao việc vẽ. |
| L14 | **Script tạo sheet ghi đè thẳng vào bản đang chạy.** `chibi-sheets.py` luôn ghi `game/anim/*.png/json`; `do-animation.py` luôn ghi `game/xem-thu/anh/`. Không có chỗ để thử "bản ứng viên". | `chibi-sheets.py` dòng 198, 203, 282, 287, 324, 328; `do-animation.py` dòng 20 | Đọc code. Rủi ro mất bản tốt khi thử ảnh mới. |

### A.3 Rủi ro cần kiểm tra thêm

| # | Rủi ro | Ở đâu | Cần kiểm tra bằng |
|---|---|---|---|
| R1 | Safari trên iPhone ProMotion có thể **giới hạn requestAnimationFrame ở 60 Hz**; cũng có thể chạy 120 Hz và vẽ gấp đôi (tốn pin gấp đôi vì mỗi lần vẽ đều vẽ lại toàn màn). | `loop` dòng 1647 | Bảng debug "FPS vẽ" trên iPhone Pro thật. |
| R2 | **Nền parallax vẽ 4 ảnh toàn màn mỗi khung** (2 lớp × 2 ô lặp), ảnh nguồn 1920×1080, lớp gần có độ trong suốt 50 %. Repo đã có bản 960 (`xa-960.png`, `gan-960.png`) nhưng demo dùng bản 1920. | `SRC` dòng 185–186; `veLap` dòng 1274–1281; `render` dòng 1373, 1424 | Đo FPS + nhiệt độ iPhone với bản 1920 và 960. |
| R3 | **Mỗi khung tạo mới gradient** cho đèn lồng và chuông lưu (đo: 2–3 lần/khung) → rác bộ nhớ, có thể giật nhẹ khi dọn rác. | `drawDen` dòng 1267; `drawSaveBell` dòng 1285 | Safari Web Inspector (Timeline) trên iPhone. |
| R4 | **Vòng sóng Cộng hưởng vẽ từng điểm ảnh** (`pxRing` dùng `Set` + `fillRect` 1×1). Đo headless: bình thường ~95 lệnh `fillRect`/khung, lúc Cộng hưởng lần đầu trung bình **577**/khung (đỉnh còn cao hơn). | `pxRing` dòng 1444–1448; `resonance` dòng 777–782 | Đo FPS ngay lúc Cộng hưởng trên iPhone. |
| R5 | **Bộ nhớ ảnh đã giải nén ≈ 43 MB:** Lam 3,8 MB + bản tô màu bóng 3,8; quái-boss 5,3 + 2 bản tô (trắng, vàng) 10,6; thế giới 3,5; nền xa 7,9; nền gần 7,9. Tăng độ phân giải sheet sẽ nhân lên. | `boot` dòng 1543, 1546; `tint` dòng 1500 | Safari Web Inspector (Memory) trên iPhone. |
| R6 | **Không có camera dọc**: `S.camy` chỉ là 0 hoặc 28 (dòng 1128); mỗi phòng cao 17 hàng = 544 px ≈ đúng 1 màn. GDD muốn thế giới **theo chiều dọc** → sẽ phải thêm camera dọc trước khi làm màn mới. | `step` dòng 1122–1129 | Không lỗi ở demo hiện tại; lưu ý cho màn sau. |
| R7 | **Thu nhỏ Lam không tự cho thấy thêm bản đồ.** Khung nhìn vẫn 960×540 = 30×17 ô. Lam nhỏ chỉ chiếm ít màn hơn. Muốn thấy thêm thật thì phải đổi khung nhìn (xem A13 ở PHẦN F, chưa đề xuất làm). | `W, H` dòng 212 | Ghi chú cho quyết định ở PHẦN B. |
| R8 | **Đổi cỡ cửa sổ Safari** (thanh địa chỉ hiện/ẩn khi xoay ngang) gọi `resize()` → cấp lại bộ đệm canvas → có thể khựng 1 khung. Không có xử lý `visibilitychange` (rời ứng dụng rồi quay lại thì game vẫn đang chạy, không tự tạm dừng). | `resize` dòng 1481–1492 | Chơi thử trên iPhone, kéo thanh địa chỉ, chuyển ứng dụng. |
| R9 | **Tiếng Vọng phụ thuộc số ngẫu nhiên gián tiếp:** bóng phát lại vị trí đã ghi (không mô phỏng lại vật lý) nên luôn đúng, nhưng mảnh chuông rơi (`spawnShards`, dòng 887–895) và mảnh hồi máu dùng `Math.random` → kiểm thử hồi quy (so sánh từng bước trước/sau khi sửa) phải cố định số ngẫu nhiên trong công cụ kiểm thử. | `spawnShards`, `dropShards`, `burst` | Cần khi làm công cụ kiểm thử (việc KT-1). |
| R10 | **Ảnh sheet xếp sát nhau chỉ cách 2 px** (`Ke(le=2)`). Khi vẽ phóng / thu với làm mịn, một số trình duyệt có thể lấy màu tràn từ khung bên cạnh. Hiện chưa thấy, nhưng khi đổi tỉ lệ vẽ cần kiểm. | `chibi-sheets.py` dòng 52 | Chụp màn phóng to mép sprite ở `?lam=0.7`. |
| R11 | **Ảnh combo trong nguồn có độ phân giải thấp hơn idle:** combo phải *phóng to* ×1,365 lúc chuẩn hóa (`khung-chuan.json`), idle *thu nhỏ* ×0,585. Trên iPhone hiện tại combo bị phóng thêm → mờ hơn idle. | `art/chibi/lam/khung-chuan/khung-chuan.json` | Nhìn trực tiếp; xem bảng sắc nét ở PHẦN B. |
| R12 | Boss đi xuyên qua Lam không gây sát thương (chỉ đập, quét, sóng, mảnh rơi gây sát thương). Có thể là chủ ý. | `updateBoss` dòng 916–920 | Hỏi chủ dự án (không đổi nếu chưa duyệt). |
| R13 | Trên không chỉ có **1 nhát** (đòn 6); GDD mô tả "combo trên không 2 nhát + đập xuống". | `updatePlayer` dòng 666 | Quyết định thiết kế, không phải lỗi. |

### A.4 Tóm tắt số đo đã chạy

| Hạng mục | Kết quả |
|---|---|
| Canvas iPhone 844×390 @3x | CSS 693×390, bộ đệm 2079×1170, 1 px logic = 2,166 px thật |
| Tham số vật lý (đọc trong trình duyệt) | hitbox 20×30 · chạy 4,4 px/bước · trọng lực 0,64 · vận tốc nhảy 11,973 · coyote 6 · jump buffer 8 · lướt 11 px/bước × 8 bước |
| Thời lượng đòn (su / ac / re, bước logic) | đòn 1: 11/8/8 · đòn 2: 11/8/8 · đòn 3: 11/8/16 · chém nảy: 0/11/4 · chém hất: 11/8/8 · trên không: 9/8/4 |
| Tiếng Vọng | ghi đúng 180 bước; bóng lệch 0 px, 0 khung khác |
| Combo | bấm lần 2 ở atkT 1–11 mất phím; 13–25 nối được; 27 trở đi bắt lại đòn 1 |
| FPS thấp | 10 lần vẽ/s → 40 bước/s; khoảng dừng 300 ms → 1 bước |
| Lệnh vẽ trung bình/khung (headless) | Cổng làng: 42 ảnh, 94 hình chữ nhật · Phòng boss: 70 ảnh, 103 · Cộng hưởng lần đầu: 69 ảnh, 577 |
| Ảnh | `lam-chibi.png` 2048×488 (981 KB), `quai-boss.png` 2048×676 (969 KB), `the-gioi.png` 2048×444 (972 KB); bản build tự chứa 1,43 MB |

---

## PHẦN B — SO SÁNH KÍCH THƯỚC LAM

### B.1 Lam hiện cao bao nhiêu (đo từ `lam-chibi.json`, mục `moc.dinh`)

- Đứng (idle): 162–167 px · rút dao: 150–155 px · chạy: 130–136 px · đòn đánh: 132–148 px (dáng khuỵu).
- "160 px" trong tài liệu là chiều cao dáng đứng. Mọi tỉ lệ dưới đây áp cho **tất cả** khung, nên dáng chạy cũng nhỏ theo cùng tỉ lệ.

### B.2 Bảng so sánh ba phương án

Hệ số `s` = tỉ lệ so với hiện tại. Số "px thật" tính cho iPhone 13/14 (1 px logic = 2,17, đã đo) và iPhone SE 667×375 @2x (1 px logic ≈ 1,39, tính theo công thức trong `resize`, chưa đo).

| Tiêu chí | Hiện tại (s = 1) | A: 128 px (s = 0,8) | **B: 112 px (s = 0,7)** | C: 96 px (s = 0,6) |
|---|---|---|---|---|
| Cao dáng đứng (px logic) | 162–167 | 130–134 | **113–117** | 97–100 |
| Cao dáng chạy | 130–136 | 104–109 | **91–95** | 78–82 |
| Phần trăm chiều cao màn | 30 % | 24 % | **21 %** | 18 % |
| Px thật iPhone 13 (dáng đứng) | ≈ 355 | ≈ 284 | **≈ 248** | ≈ 213 |
| Px thật iPhone SE | ≈ 228 | ≈ 182 | **≈ 159** | ≈ 137 |
| Mũ trùm (px logic / px thật iPhone 13) | 52 / 113 | 42 / 90 | **36 / 79** | 31 / 68 |
| Mắt (px thật iPhone 13 / SE, ước theo mắt ≈ 7 px logic) | 15 / 10 | 12 / 8 | **11 / 7** | 9 / 6 |
| Lưỡi dao lúc đâm (px logic) | ≈ 56 | ≈ 45 | **≈ 39** | ≈ 34 |
| Lam / Quái Chuông Gỗ (quái cao 120) | Lam cao hơn 1,36× | 1,09× | **0,95× (quái cao hơn chút)** | 0,82× |
| Lam / boss (boss 330) | boss gấp 2,0× | 2,5× | **2,9×** | 3,4× |
| Lam cao bằng mấy ô gạch 32 | 5,1 | 4,1 | **3,6** | 3,1 |
| Nhảy cao 112 px so với chiều cao Lam | 0,68 | 0,85 | **0,98** | 1,14 |
| Tốc độ chạy (thân/giây, 264 px/s) | 1,6 | 2,0 | **2,3** | 2,7 |
| Quãng lướt 88 px so với thân | 0,54 | 0,67 | **0,77** | 0,89 |
| Chân trượt khi chạy nếu giữ nhịp 83 ms (px/khung) | 0 | 4,4 | **6,6** | 8,8 |
| Sheet hiện tại bị phóng lên bao nhiêu lần trên iPhone 13 | 2,17× (mờ) | 1,73× | **1,52×** | 1,30× |
| Ảnh combo nguồn → màn iPhone 13 | 1,39× (phóng, mờ) | 1,11× | **0,97× (vừa đúng nguồn)** | 0,83× |
| Hộp đòn 1 nếu thu theo (tầm với 151 px) | 151 | 121 | **106** | 91 |
| Vùng ăn đòn nếu thu theo (40×120) | 40×120 | 32×96 | **28×84** | 24×72 |

**Đọc bảng thế nào:**

- **A (128 px):** an toàn nhất, ít thay đổi cảm giác. Nhưng Lam vẫn chiếm gần 1/4 chiều cao màn → cảm giác khám phá chỉ khá hơn một chút.
- **B (112 px):** Lam vẫn rõ trên iPhone SE (≈159 px thật, mắt ≈7 px thật). Độ cao nhảy ≈ đúng 1 thân người (rất tự nhiên cho platformer). Boss gần gấp 3 lần → hoành tráng hơn. Ảnh combo ở cỡ này **vừa đúng độ phân giải ảnh nguồn**, nên hết bị phóng mờ. Điểm cần xử lý: quái cao hơn Lam một chút; chân trượt khi chạy (6,6 px/khung) nếu không chỉnh nhịp chạy.
- **C (96 px):** thấy nhiều không gian nhất, nhưng trên iPhone SE mắt chỉ ≈6 px thật, dao ≈34 px logic → khó đọc hướng đòn; quái cao hơn Lam rõ (1,25×). Không khuyến nghị cho bản cảm ứng.

**Nghiêng về B**, nhưng **không tự chốt**: cần chủ dự án chơi thử cả ba bằng tham số URL (B.5) rồi duyệt mã A1 ở PHẦN F.

### B.3 Tác động tới từng phần (với B)

| Phần | Tác động | Cần làm gì |
|---|---|---|
| Độ rõ trên iPhone xoay ngang | Vẫn đọc được mặt, mũ, dao. Chuông vàng sau vai nhỏ (≈ 10–12 px logic). | Kiểm trên iPhone SE và iPhone 13 thật, nền tối nhất (phòng boss). |
| Tỉ lệ với quái / boss | Quái 120 cao hơn Lam; boss to hơn hẳn. | Quyết định A4: giữ quái 120 hay thu quái còn ~100 (0,85) — chỉ thu **hình**, giữ hitbox 72×108 hoặc thu cùng. |
| Dao và vùng sát thương | Dao ngắn đi 30 %. Nếu giữ hộp đòn cũ thì hộp dài hơn dao ~60 px → nhìn rất sai. | Quyết định A3: thu hộp đòn theo cùng hệ số (đổi tầm đánh) hay giữ. |
| Hitbox vật lý 20×30 | **Không đổi.** Hộp này vốn đã nhỏ hơn hình rất nhiều; giữ nguyên thì mọi đoạn nhảy, khe, tường của màn vẫn y như cũ. | Không làm gì. |
| Vùng ăn đòn 40×120 | Đang theo hình 160 px. Giữ nguyên thì quái đánh trúng "khoảng không trên đầu" Lam. | Thu theo `s` (28×84 với B) — đi cùng A3. |
| Tốc độ, gia tốc, lực nhảy, độ cao nhảy, lướt | **Không đổi số.** Cảm giác: Lam trông nhanh và nhảy cao hơn so với thân (xem bảng). Đây là cảm giác thường gặp ở Metroidvania. | Chỉ đổi nếu chơi thử thấy quá nhanh (quyết định riêng, không nằm trong A1). |
| Gạch 32, nền, cửa, chướng ngại | **Không đổi.** Cổng (159–192 px), điểm lưu (160 px) sẽ to hơn Lam tương đối — hợp lý. Ba tường treo đã nâng lên hàng 8 cho Lam 160 vẫn để vậy (thừa chỗ). | Không đổi bản đồ ở giai đoạn thử. |
| Camera, vùng nhìn | Vùng nhìn vẫn 30×17 ô (R7). Lam đứng lệch 48 px theo hướng mặt; còn ≈ 528 px phía trước. | Có thể tăng nhìn trước 48 → 64–96 px sau khi chơi thử (việc CA-1, quyết định riêng). |
| Animation, pivot giữa đế ủng | Thu quanh pivot nên chân vẫn chạm đất đúng. | Làm tròn tọa độ **sau khi** nhân hệ số (xem B.4). |
| Tọa độ, metadata sprite | **Không đổi JSON, không đổi ảnh** ở giai đoạn thử. | — |
| Tiếng Vọng, bóng, Cộng hưởng | Bóng vẽ bằng cùng hàm `drawLam` → tự nhỏ theo. Vị trí ghi là vị trí hitbox → không đổi. Bóng đứng công tắc dùng hộp 20×30 → không đổi. Dấu "!" và vệt sáng chân phải theo `s` (L10). | Sửa các hằng số trong L10. |
| Hiệu năng, sắc nét Safari | Hình nhỏ hơn → vẽ ít điểm ảnh hơn (lợi nhỏ). Sheet hiện tại bị phóng 1,52× thay vì 2,17× → **nét hơn bây giờ**. | Sau khi chốt cỡ, có thể làm sheet HD (A14) cho nét hẳn. |

### B.4 Thu nhỏ bằng cách nào

| Cách | Là gì | Ưu | Nhược | Kết luận |
|---|---|---|---|---|
| 1. Hệ số render | Giữ ảnh và JSON, khi vẽ Lam nhân thêm `s` quanh pivot. `veBuoc` đã có sẵn tham số co giãn `sx, sy`. | Ít sửa nhất; quay lại ngay bằng `s = 1`; bóng Vọng, vệt lướt tự theo. | Sheet vẫn ở độ phân giải cũ (vẫn hơi mờ, nhưng đỡ hơn hiện tại). Phải làm tròn `snap(dx·s)` sau khi nhân, nếu không sẽ rung 1 px thật. | **Dùng cho giai đoạn thử.** |
| 2. Kích thước vật lý | Đổi hitbox 20×30, tốc độ, nhảy. | — | Hitbox đã nhỏ hơn hình; đổi sẽ phá bố cục màn, công tắc, khe, cảm giác điều khiển. | **Không làm.** |
| 3. Ảnh nguồn (sheet mới) | Xuất lại sheet ở cỡ đích. | Nét nhất nếu xuất đúng tỉ lệ màn iPhone. | Phải chạy lại `chibi-sheets.py` (ghi đè – L14), đổi toàn bộ `ox, oy, dx, dy, box`. Khó quay lại. | **Làm sau khi đã chốt cỡ**, dưới dạng sheet HD (A14). |
| 4. Kết hợp (khuyến nghị) | Giai đoạn 1: hệ số render + thu hộp ăn đòn/hộp đòn theo cùng `s` (nếu A3 duyệt). Giai đoạn sau: sheet HD xuất ở ≈ 0,70 thay vì 0,46875 của ô chuẩn 640, vẽ với hệ số ≈ 0,667 → **gần 1:1 điểm ảnh thật** trên iPhone 13/14. | Thử nhanh, quay lại ngay, cuối cùng vẫn nét. | Sheet HD tốn bộ nhớ ≈ 2,25× (Lam ≈ 8,6 MB + bản tô màu 8,6 MB). | **Khuyến nghị.** |

### B.5 Cách thử ít rủi ro nhất, quay lại ngay được

1. Thêm **một hằng số** `LAM_SCALE` đọc từ địa chỉ: `demo.html?lam=0.8`, `?lam=0.7`, `?lam=0.6`. Không có tham số → **1,0 (y như bây giờ)**. Giá trị ngoài 0,5–1,0 bị bỏ qua.
2. Mọi chỗ vẽ Lam / bóng / vệt lướt dùng `LAM_SCALE` (qua `drawLam`). Các hằng số ở L10 nhân `LAM_SCALE`.
3. Hộp đòn và vùng ăn đòn: **tham số thứ hai** `?hop=theo` (thu theo `LAM_SCALE`) hoặc mặc định giữ nguyên → thử được cả hai cách trước khi duyệt A3.
4. Bảng debug hiện thêm dòng `Lam ×0,70 · hộp: theo/giữ`.
5. Chỉ khi chủ dự án duyệt mới đổi **mặc định** từ 1,0 sang giá trị đã chọn. Quay lại = đổi một số, hoặc mở link không tham số.

**Thông số cần ghi lại khi chơi thử mỗi phương án** (dùng chung một mẫu, mỗi người chơi ghi):

- Có nhận ra hướng mặt Lam và lúc vung dao trên iPhone SE / iPhone 13 không (Có/Không).
- Số lần chém hụt quái thường trong Sân chuông (đếm bằng log debug: số nhát có hộp đòn bật mà không trúng).
- Số lần bị quái đấm trúng trong Sân chuông.
- Thời gian qua đoạn Cổng làng 1 (nhảy bậc, tường).
- Cảm giác tốc độ chạy: chậm / vừa / nhanh.
- Có thấy chân trượt khi chạy không.
- Đo bằng công cụ: chiều cao hiển thị, độ trượt chân (px/khung), độ lệch mũi dao so với hộp đòn.

---

## PHẦN C — BẢNG KẾ HOẠCH CÔNG VIỆC

Ưu tiên: **Cao** = nên làm trước, ảnh hưởng chơi được/chơi sướng; **Vừa** = nên làm trong đợt này; **Thấp** = để sau.
Mỗi việc đều có thể duyệt riêng (mã duyệt ở PHẦN F).

### C.1 Kiểm thử và công cụ (làm đầu tiên để mọi bước sau có thước đo)

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| KT-1 | Chưa có cách tự động chứng minh "sửa xong không đổi gameplay". | Công cụ **phát lại kịch bản**: chạy demo headless với chuỗi phím cố định (chạy, nhảy, combo, Vọng, Cộng hưởng, boss), cố định `Math.random` *trong công cụ*, ghi trạng thái mỗi bước (Lam, quái, boss, cửa, công tắc, bóng). So bản trước/sau: phải **trùng 100 %** với việc chỉ tách module / tối ưu. | file mới `game/tools/kiem-thu-phat-lai.py` | Cao | Thấp (không đụng game) | Chạy 2 lần trên cùng bản → giống hệt; cố ý sửa 1 số → công cụ báo lệch đúng bước. |
| KT-2 | Script đo/tạo sheet ghi đè bản đang chạy (L14). | Thêm tham số thư mục ra `--ra <thư mục>` cho `chibi-sheets.py` và `do-animation.py`; mặc định **không** ghi vào `game/anim` khi đang thử ảnh mới. | `chibi-sheets.py` dòng 33, 198–328; `do-animation.py` dòng 20 | Cao | Thấp | Chạy với `--ra /tmp/x` → `git status` sạch. |
| KT-3 | Hai cách đo dao khác nhau (L7). | Thống nhất một hàm đo mũi dao (dùng `mask_dao` có sẵn + mở rộng phần viền tối của dao), xuất số đo vào báo cáo, không vào JSON game. | `do-animation.py` hoặc file đo mới | Vừa | Thấp | Chạy trên 6 khung chạm, có ảnh phóng to đánh dấu mũi dao. |

### C.2 Sửa lỗi an toàn (không đổi luật chơi)

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| IN-1 | L1: lỗi `dT` null khi chạm nút. | Đổi nhánh `else` thành `else if(dT)`. | `demo.html` · `onTouch` dòng 449 | Cao | Rất thấp | Lặp lại phép thử 4 sự kiện chạm → không còn lỗi; nút sáng khi bấm. |
| IN-2 | L2: lần chạm đầu vào cần chưa có hướng. | Bật trạng thái cần **và** tính hướng trong cùng sự kiện (tách 2 khối `if` riêng). | `onTouch` dòng 448–453 | Cao | Thấp | `touchstart` ở mép phải → `tc.r = 1` ngay. |
| CB-1 | L5: `hurt` gán đè hit-stop. | `S.hitstop=Math.max(S.hitstop,6)`. | `hurt` dòng 806 | Thấp | Rất thấp | Bị đánh đúng lúc Cộng hưởng → hit-stop vẫn 8. |
| EV-1 | L6: bước cuối bản ghi không gây sát thương. | Đánh trước rồi mới đặt `done`, hoặc kiểm tra `hb` của bước vừa lấy. | `updateEcho` dòng 733; `step` dòng 1116 | Thấp | Thấp (đổi rất nhỏ hành vi bóng) | Ghi đúng 180 bước, chém ở bước 180 → bóng gây sát thương. |

### C.3 Thu nhỏ Lam

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| SZ-1 | Lam chiếm 30 % chiều cao màn. | Hằng số `LAM_SCALE` + tham số `?lam=` (B.5). Truyền `sx=sy=LAM_SCALE` vào `veBuoc` từ `drawLam`; làm tròn `snap(dx·s)` sau khi nhân. | `demo.html` · đầu script (cạnh `P`), `drawLam` dòng 1173–1176, `veBuoc` dòng 1157–1163 | Cao | Thấp (mặc định 1,0) | `?lam=1` cho ảnh chụp **trùng từng điểm ảnh** với bản cũ; `?lam=0.7` đo chiều cao 113–117. |
| SZ-2 | L10: hằng số theo cỡ 160. | Nhân `LAM_SCALE`: dấu "!" (1398), bóng đổ (1406), vệt sáng bóng (1394), hạt bị đánh (806). | các dòng đã nêu | Cao | Thấp | Ảnh debug: "!" nằm ngay trên mũ ở mọi cỡ. |
| SZ-3 | Hộp đòn / vùng ăn đòn theo cỡ mới. | Theo A3: nhân `box` của `ATK` và `hurtBox` với `LAM_SCALE` (hoặc giữ). Có `?hop=theo` để thử trước. | `nhanATK` dòng 693–698; `hurtBox` dòng 558 | Cao | **Vừa – đổi tầm đánh** | Đếm chém hụt / bị đánh trong Sân chuông (B.5). |
| SZ-4 | L9: chân trượt khi chạy (rõ hơn khi thu nhỏ). | Chọn khung chạy theo **quãng đường** (`pl.runPh` đã có) thay vì thời gian: 1 vòng 8 khung = 176·`LAM_SCALE` px. | `lamChibi` dòng 710–713; `updatePlayer` dòng 674 | Vừa | Vừa (đổi nhịp chạy khi tăng/giảm tốc) | Trượt chân ≤ 3 px/khung ở mọi tốc độ; vòng chạy ở tốc độ tối đa vẫn đúng. |
| SZ-5 | Tỉ lệ quái so với Lam nhỏ. | Theo A4: hệ số vẽ riêng `QUAI_SCALE` (mặc định 1). Nếu thu, quyết định thu luôn hitbox 72×108 và hộp đấm hay không. | `drawQuai` dòng 1313–1325; `QW, QH` dòng 492 | Thấp | Vừa nếu thu hitbox | Chơi thử Sân chuông. |
| CA-1 | Nhìn trước theo hướng mặt cố định 48 px. | Tham số hóa `S.look` (48 → thử 64/96). | `step` dòng 1125 | Thấp | Thấp | Chơi thử, quay đầu liên tục không chóng mặt. |

### C.4 Animation

**Lỗi nào sửa bằng code/metadata, lỗi nào bắt buộc vẽ lại:**

| Hiện tượng | Sửa bằng JS / JSON | Phải chỉnh ảnh nguồn |
|---|---|---|
| Nhấp nhô, trượt vị trí giữa khung | Đã sửa phần lớn (tâm thân lên pivot, đế chạm đất). Còn lại do ảnh. | Idle nhô 4 px (L12). |
| Tay chân dài ngắn khác master | Không sửa được bằng code (co giãn từng khung là cấm). | Idle chân dài (L12); jump/2 mũ nhỏ 7 %. |
| Đầu, vai, hông, đế lệch nhau | Không. | Vẽ lại khung lỗi. |
| Sai tay cầm dao / nhầm tay | Chỉ né bằng cách bỏ khung (đã bỏ combo-1/1). | Vẽ lại nếu cần khung đó. |
| Chạy, nhảy, lướt, đâm, chém thiếu nhịp | Chỉnh `ms` từng bước, chạy theo quãng đường (SZ-4), nối combo (CB-3). | Lướt, bị đánh, chết, bám tường, tiếp đất chưa có ảnh (L11). |
| Sprite méo / mờ khi thu nhỏ | Làm tròn sau khi nhân hệ số; bật làm mịn chất lượng cao (đã có). | Sheet HD (A14) để hết phóng ảnh. |
| Vùng sát thương không khớp dao | Hộp theo từng bước (CB-2). | — |
| Animation không khép kín | Kiểm bằng số (tiêu chí dưới). Run 8→1 hiện khép tốt (đỉnh −133,6 → −135,0). | Idle 2→3 nhảy 3,8 px. |

**Tiêu chí nghiệm thu bằng số** (px logic 960×540, đo bằng `do-animation.py` và KT-3; với `s ≠ 1` thì nhân `s`):

| Tiêu chí | Ngưỡng đạt | Hiện tại |
|---|---|---|
| Tâm thân so với pivot, giữa 2 lần vẽ liền nhau (ngang) | ≤ 1,0 px | ≤ 0,4 (đạt) |
| Đế ủng khi đứng trên đất | cách mặt đất ≤ 1,0 px mọi khung | ≤ 0,6 (đạt) |
| Cỡ mũ giữa các khung nhìn ngang | ±3 % | đạt, trừ khung quay đầu (combo-3/3, combo-2/2–3) |
| Khoảng mắt → đế ở các dáng đứng thẳng | ±4 % | idle lệch ~8–10 % (chưa đạt) |
| Idle: đỉnh mũ đổi giữa 2 khung | ≤ 2 px | 3,8–4,1 (chưa đạt) |
| Chạy: chân trụ trượt so với quãng đường vật lý | ≤ 3 px/khung | ≈ 0 ở tốc độ tối đa; chưa đo lúc tăng/giảm tốc |
| Vòng lặp: chênh lệch khung cuối → khung đầu | không lớn hơn chênh lệch trung bình giữa các khung | run đạt; idle chưa |
| Hộp đòn ở khung chạm | mũi dao nằm trong hộp, hộp vượt mũi dao 0–8 px | lệch 12–24 px (chưa đạt) |
| Camera: sai bước dịch màn | ≤ 1 px thật | 0,75–0,81 (đạt) |
| Tốc độ animation | vòng chạy 666,7 ms ở 60 và 120 Hz | đạt |

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| AN-1 | Chưa có bảng tiêu chí số trong repo. | Đưa bảng trên vào `docs/tieu-chi-animation-lam.md` (phiên bản chibi), đánh dấu phần 64×64 là cũ (L13). | docs | Vừa | Không | Đọc lại. |
| AN-2 | `do-animation.py` chưa đo trượt chân, khoảng mắt → đế, mũi dao. | Thêm 3 phép đo vào báo cáo. | `do-animation.py` | Vừa | Thấp | Chạy ra bảng có cột mới. |
| AN-3 | Animation tạm (L11). | Thay bằng ảnh mới theo C.7 khi có; trong lúc chờ có thể ghép tạm 2–3 khung có sẵn (vd. bị đánh = jump/1 → rut-dao/4). | `chibi-sheets.py` `ANIMS` dòng 164–168 | Vừa | Thấp | Tiêu chí số + xem GIF. |
| AN-4 | Khung bay trong ảnh chuẩn bị nâng chân giả rồi sheet phải bù lại (`khung-chuan.py` dòng 147 vẫn còn `day = max(py, mat + E0)`). | Ghi chú rõ hoặc bỏ luật này ở lần chuẩn hóa sau để ảnh chuẩn = ảnh thật. | `tools/chibi-khung-chuan.py` dòng 146–147 | Thấp | Vừa (đổi `dy` khung bay → phải đo lại) | So `moc.de` trước/sau. |

### C.5 Chiến đấu và Tiếng Vọng

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| CB-2 | L7, L8: hộp đòn cố định, lệch dao. | Mỗi bước của đòn có thể có `box` riêng (JSON), `hit:true` ở các bước gây sát thương. `atkBox` lấy hộp theo bước hiện tại (`animK`). Vẫn chỉ 1 lần trúng mỗi nhát mỗi mục tiêu (`swingId`). Tạo hộp từ mũi dao (KT-3) + lề 4–8 px. **Có tùy chọn giữ nguyên tầm với cũ** (chỉ dịch hộp cho khớp hình, không đổi độ dài) nếu A8 chưa duyệt đổi tầm. | `chibi-sheets.py` `HOP` 176–177, vòng 179–195; `demo.html` `nhanATK` 693–698, `atkBox` 559–565 | Vừa | **Vừa – đổi tầm đánh, đổi khung bắt đầu trúng** | Tiêu chí "hộp vượt mũi dao 0–8 px"; KT-1 so số quái chết, thời gian Sân chuông. |
| CB-3 | L3: bấm Chém sớm bị nuốt; bấm trễ bắt lại đòn 1. | Theo A7: **xếp hàng đòn** – bấm Chém khi đang đánh (từ `atkT ≥ su − 4`) thì ghi `pl.atkQ = true`, giữ tới khi cửa sổ nối mở (`atkT ≥ su + ac`); thêm 6 bước "ân hạn" sau khi đòn kết thúc vẫn nối đòn kế. Giữ nguyên thời lượng đòn. | `updatePlayer` dòng 664–673; `step` dòng 1100 | Cao | Vừa – đổi cảm giác bấm | Lặp lại phép thử 16 thời điểm bấm: atkT 7–26 nối được, 27–32 vẫn nối, sớm hơn 7 không nối. |
| CB-4 | Hit-stop, rung màn: nhất quán chưa? | Giữ số hiện tại (đòn 3/4/6 bước, Cộng hưởng 8). Chỉ sửa L5 (CB-1). | `ATK`, `resonance` | Thấp | Thấp | KT-1. |
| EV-2 | Kiểm Cộng hưởng ở các tình huống khó: FPS thấp, hit-stop, quái chết giữa chừng, bóng giữ công tắc. | Đưa các tình huống vào kịch bản KT-1 (không đổi code game). Ghi rõ luật hiện tại: nếu Lam giết quái trước, nhát của bóng sau đó **không** tính (quái đã `die`) → không Cộng hưởng. | KT-1 | Vừa | Không | Bảng kết quả từng tình huống (PHẦN E). |
| EV-3 | Bóng giữ tư thế dùng hộp 20×30 trên công tắc — đúng; nhưng vẽ theo `LAM_SCALE`. | Không đổi logic; chỉ kiểm sau SZ-1. | `onPlate` dòng 997; `render` 1387–1400 | Thấp | Không | Ảnh chụp bóng đứng công tắc ở `?lam=0.7`. |

### C.6 Tách module

**Đánh giá:** `demo.html` là 1 file 1663 dòng, một khối script toàn cục. Chạy tốt, nhưng mỗi lần làm màn mới sẽ phải sửa giữa file lớn → dễ đụng nhầm. **Nên tách trước khi làm thêm màn**, nhưng **sau** khi có KT-1 (để chứng minh tách xong game y hệt).
**Không** đổi sang framework hay công cụ đóng gói mới: chỉ là các file script thường, `build-demo.py` nối chúng lại theo thứ tự → vẫn ra **một file HTML tự chứa**.

Cấu trúc đề xuất (`game/src/`, nạp theo thứ tự số):

| File | Nội dung chuyển từ `demo.html` | Nhóm yêu cầu |
|---|---|---|
| `00-cau-hinh.js` | `SRC`, `P`, `ATK`, `LAM_SCALE`, hằng số W/H/T | — |
| `01-tien-ich.js` | `clamp, approach, lerp, overlap, ovr`, pool hạt/hiệu ứng (`part, fx, burst…`) | — |
| `02-am-thanh.js` | `SND, audioInit, bell, tone, noise, sfx, setMute` | — |
| `03-input.js` | bàn phím, `onTouch`, `measure`, `setMode`, cỡ nút | Input và cảm ứng |
| `04-ban-do.js` | `room, fill, G, ROOMS`, công tắc, cửa, chuông lưu | Level và Puzzle |
| `05-vat-ly.js` | `tile, solidC, collide, moveX, moveY, landOneWay, onOneWay` | Physics và collision |
| `06-hoat-hinh.js` | `lutAnim, animK, nhanATK, lamChibi, snap, veBuoc, veKhung` | Animation |
| `07-nguoi-choi.js` | `pl, startAtk, finishGround, updatePlayer, hurt` | Player |
| `08-chien-dau.js` | `atkBox, hurtBox, pogoTarget, strike, applyHits, pogoBounce, resonance` | Combat |
| `09-tieng-vong.js` | `REC, startRec, stopRec, recordFrame, updateEcho` | Echo và Resonance |
| `10-quai.js` · `11-boss.js` | `mkQuai, updateQuai, killQuai…` · `boss, updateBoss, bossAnim…`, hazards | Enemy và Boss |
| `12-luu-diem.js` | `newGame, placePlayer, respawn`, checkpoint (hiện chỉ lưu trong phiên, chưa lưu máy) | Save và Checkpoint |
| `13-camera-ve.js` | `dungCanh, drawCanh, veLap, draw*`, `render`, `resize`, camera trong `step` | Camera và Render |
| `14-nap-tai-nguyen.js` | `napSheet, napAnhNen, tint, boot` | Asset loading |
| `15-giao-dien.js` | hint, toast, banner, cài đặt, màn kết | — |
| `16-debug.js` | `DBG`, `dbgGhi`, `drawDebug`, nút debug | Debug và công cụ |
| `99-vong-lap.js` | `step`, `loop`, gọi `boot()` | — |

**Thứ tự tách (mỗi bước 1 commit, sau mỗi bước chạy KT-1 phải trùng 100 %):**
1. Sửa `build-demo.py` để nối `src/*.js` (vẫn hỗ trợ file cũ) — chưa tách gì.
2. Tách phần ít liên quan nhất: debug → âm thanh → tiện ích + cấu hình → giao diện.
3. Input → nạp tài nguyên → vẽ/camera.
4. Bản đồ + vật lý → animation → Tiếng Vọng → chiến đấu.
5. Quái, boss → người chơi → vòng lặp cuối cùng.
Chỉ **cắt – dán**, không sửa logic trong lúc tách. Giữ biến toàn cục như hiện nay (không đổi sang ES module) để không đổi hành vi và vẫn mở được qua `file://`.

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| MO-1 | Build chỉ nhận 1 file. | `build-demo.py` nối `game/src/*.js` theo thứ tự vào 1 thẻ script; bỏ `assert '<script src=' not in src` (dòng 41) và thay bằng thay thế các thẻ `src` bằng nội dung. | `game/build-demo.py` | Vừa | Thấp | Bản build trước/sau khi chưa tách: giống hệt từng byte phần script. |
| MO-2 | File lớn khó sửa. | Tách theo bảng trên, đúng thứ tự trên. | `game/demo.html` → `game/src/*.js` | Vừa | Vừa (dễ sót biến) | KT-1 trùng 100 % sau mỗi bước; không lỗi console. |
| MO-3 | Mã thừa: `pl.ak, af, sdx` (Lam pixel cũ), `pl.castT` không dùng để vẽ, `lam.anim.json`, `lib/anim2d.js`… | Dọn sau khi tách, mỗi thứ 1 commit. | `pl` dòng 240–242; REC dòng 247; `recordFrame` dòng 728 | Thấp | Thấp | KT-1. |

### C.7 Tối ưu iPhone

**Phân tích theo yêu cầu (không kết luận FPS – chưa đo máy thật):**

| Mục | Hiện trạng trong code | Ghi chú |
|---|---|---|
| Canvas và devicePixelRatio | dpr giới hạn 3; iPhone 13 bộ đệm 2079×1170 (2,4 triệu điểm) | Mỗi khung tô toàn bộ 2,4 triệu điểm ít nhất 5 lần (nền, nền xa ×2, nền gần ×2). |
| Logic 60 bước/s | đúng (A.1) | Giữ nguyên. |
| Vẽ 60 / 120 Hz | vẽ mỗi lần rAF | R1: cần đo Safari có khoá 60 không. |
| Sprite sheet | ≈ 43 MB đã giải nén (R5) | Sheet HD sẽ thêm ≈ 13 MB. |
| Parallax, hạt, rung màn | nền 1920 (R2), 320 hạt tối đa, rung có hướng | Hạt dùng `fillRect` nhỏ – rẻ. |
| Nhiệt độ, pin | chưa đo | Đo 10 phút chơi liên tục, ghi FPS trung bình + máy ấm/nóng. |
| Nút cảm ứng | cỡ theo màn, chỉnh 80–130 %; có L1, L2 | Sau IN-1/IN-2 cần chơi thử thật. |
| Safe area, Safari ngang, đổi cỡ | có `env(safe-area-inset-*)`, canvas letterbox; R8 | Thêm tạm dừng khi rời ứng dụng (IP-4). |
| Coyote 6, jump buffer 8, dash buffer 4, combo buffer 8, pogo buffer 6 bước | đúng GDD trừ combo (L3) | Giữ số, sửa logic combo (CB-3). |

**Ba mức chất lượng đề xuất** (logic luôn 60 bước/s, gameplay không đổi):

| | Tiết kiệm pin | Cân bằng (mặc định) | Chất lượng cao |
|---|---|---|---|
| Độ phân giải canvas (dpr tối đa) | 2 | 3 | 3 |
| Số lần vẽ tối đa / giây | 30 | 60 | theo màn (60/120) |
| Nền xa / gần | bản 960, nền gần tắt hoặc không trong suốt | bản 1920 | bản 1920 |
| Quầng sáng đèn lồng / chuông lưu | ảnh vẽ sẵn, không gradient | gradient tạo sẵn 1 lần (IP-2) | như Cân bằng |
| Hạt | tối đa 160 | 320 | 320 |
| Vòng Cộng hưởng | vòng tròn nét liền (`arc`) | vòng điểm ảnh tạo sẵn (IP-3) | như Cân bằng |
| Rung màn | giảm 50 % | đủ | đủ |

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| IP-1 | Chưa có số đo thiết bị. | Thêm vào bảng debug: FPS vẽ trung bình 5 s, thời gian vẽ 1 khung (ms), số bước logic bị bỏ (L4). Lập **phiếu đo** cho iPhone SE, 13, 15 Pro: 3 cảnh (Cổng làng, Sân chuông, boss) × 3 mức chất lượng × 2 phút. | `drawDebug` dòng 1609–1639; `loop` | Cao | Không | Có bảng số từ máy thật trước khi chốt IP-5. |
| IP-2 | R3: gradient tạo mỗi khung. | Tạo quầng sáng 1 lần vào canvas nhỏ lúc nạp, vẽ bằng `drawImage`. | `drawDen` 1267; `drawSaveBell` 1285 | Vừa | Thấp (khác hình rất ít) | Ảnh chụp so sánh; Timeline Safari không còn rác bộ nhớ đều đặn. |
| IP-3 | R4: vòng Cộng hưởng tốn lệnh vẽ. | Vẽ sẵn vòng ở vài bán kính hoặc dùng `arc` + `lineWidth`. | `pxRing` 1444–1448 | Vừa | Thấp | Đếm lệnh vẽ lúc Cộng hưởng: từ 577 xuống < 150. |
| IP-4 | R8: rời ứng dụng không tạm dừng. | `visibilitychange` → mở bảng tạm dừng; `resize` chỉ cấp lại canvas khi cỡ đổi thật (đã có so sánh) + chờ 100 ms. | `resize` 1481–1492 | Vừa | Thấp | Chuyển ứng dụng rồi quay lại → game đang dừng. |
| IP-5 | Một mức chất lượng cho mọi máy. | 3 mức (bảng trên) trong ⚙; mặc định Cân bằng. Tự hạ mức chỉ khi được duyệt (A12). | `resize`, `render`, `veLap`, cài đặt | Vừa | Vừa | Phiếu đo IP-1 cho cả 3 mức. |
| IP-6 | L4: FPS thấp làm game chậm. | Theo A10: giữ 4 bước/lần vẽ (chống "vòng xoáy chậm"), nhưng hiện cảnh báo trong debug; hoặc tăng lên 6. | `loop` 1643–1659 | Thấp | Vừa | Thử 10 lần vẽ/s → báo đúng số bước bị bỏ. |

### C.8 Sản xuất hình ảnh (ChatGPT + Python)

**Quy trình 10 bước, gắn với công cụ có sẵn:**

| Bước | Làm gì | Công cụ / tiêu chí |
|---|---|---|
| 1. Khóa master | `art/chibi/lam/mau-goc.png` là chuẩn duy nhất; gửi kèm mọi lần gen. | Không sửa master khi đang sản xuất. |
| 2. Khóa tỉ lệ bộ phận | Ghi số đo từ master vào 1 file: cỡ mũ (`do_mu`), mắt → đỉnh mũ, mắt → đế (chiều dài chân), chiều dài dao, vị trí chuông. | `chibi-khung-chuan.py` (`do_mu`, `mat_xy`). |
| 3. Pose guide | Mỗi khung có hình bóng (silhouette) mẫu đơn giản: vị trí chân trụ, góc dao, độ khuỵu. Dựng từ khung đã đạt (run8, rút dao). | Ảnh mẫu đặt dưới `art/chibi/lam/pose/` (thư mục mới khi được duyệt). |
| 4. Gen theo nhóm nhỏ | 2–4 khung mỗi lần, cùng prompt nền, nền trắng phẳng, nhìn ngang. | Prompt mẫu ở `docs/fix-animation.md` mục 5. |
| 5. Kiểm tay, chân, dao, chuông, áo choàng | Dao luôn ở tay xa camera; chuông sau vai gần camera; có đủ mắt, chuông, dao. | Kiểm bằng mắt + script: có dao (`mask_dao`), có chuông (mảng vàng gần vai), cỡ mũ ±3 %, mắt → đế ±4 %. |
| 6. Tách nền, cắt khung, chuẩn hóa điểm neo | `bo_nen` → `tach_khung` → chuẩn hóa theo cỡ mũ, tâm thân + đế. | `chibi-tach-khung.py`, `chibi-khung-chuan.py`. |
| 7. Xuất sheet và JSON | **Vào thư mục ứng viên**, không ghi đè bản đang chạy. | `chibi-sheets.py --ra` (KT-2). |
| 8. Xem GIF | GIF đúng thời lượng từng khung, nền tối giống game, cả hai hướng. | `luu_gif` có sẵn. |
| 9. Thử trong game | Mở demo với sheet ứng viên (`?sheet=ung-vien`), bật `?debug=anim`, đo bằng `do-animation.py`. | Tiêu chí số C.4. |
| 10. Đưa vào bản chính | Chỉ khi đạt **tất cả** tiêu chí số + chủ dự án xem GIF và chơi thử. | 1 commit riêng, có ảnh trước/sau. |

**Số khung và thời lượng đề xuất** (không mặc định tăng khung; ưu tiên khung "đúng tư thế" và thời lượng khớp gameplay):

| Animation | Hiện có | Đề xuất | Thời lượng | Lý do |
|---|---|---|---|---|
| Đứng (idle) | 6 (phát 1-2-3-4-3-2) | **6 vẽ lại** | 150–180 ms/khung (chu kỳ ~1 s) | Chỉ cần sửa nhô 4 px và chân dài; thêm khung không giải quyết lỗi. |
| Chạy | 8 | **giữ 8** | theo quãng đường (SZ-4); ~83 ms ở tốc độ tối đa với s = 1 | Đã khớp chân trụ; chỉ cần đồng bộ nhịp. |
| Nhảy lên / đỉnh / rơi | 4 | **giữ 4** (+ vẽ lại jump/2 mũ nhỏ) | chọn theo vận tốc (đang làm) | Đủ cho đọc chuyển động. |
| Tiếp đất | mượn 1 | **2** | 50 + 67 ms (đúng `landT` 10 bước nhưng chỉ phát khi rơi nhanh) | Không chặn điều khiển. |
| Lướt | mượn 1 | **3** (vào, giữ, ra) | 33 / 67 / 33 ms = đúng 8 bước lướt | Thời lượng lướt cố định 8 bước. |
| Bị đánh | mượn 1 | **2–3** | tổng 300 ms = `hurtT` 18 bước | Khớp thời gian bị đẩy lùi. |
| Chết | mượn 1 | **5** | tổng ~1,3 s (`deadT` 80 bước rồi mờ) | Khớp thời gian màn tối. |
| Bám tường | mượn 1 | **2** lặp | 150 ms | Đủ thấy trượt. |
| Đòn 1–3 | 4 / 4 / 5 | **giữ 4–5**, vẽ lại đòn 3 khung 1–2 (đang vẽ bay) | chuẩn bị 100–120, vung 50–60, chạm 100–140, thu 120–140 | Khung chạm phải là khung dao duỗi xa nhất. |
| Chém trên không | 5 bước (4 ảnh) | **4 vẽ lại** giữ mặt nghiêng | 50 / 50 / 50 / 140 | Hiện đầu to 23 % khi quay lưng. |
| Rút dao | 6 | giữ | như hiện tại (0,86 s) | Đạt. |
| Boss | 6 thở | đi 6, đập 4, quét 4, trúng 1, chết 5 | — | Hiện chỉ có thở (TẠM). |

| ID | Vấn đề | Cách sửa | File/hàm | Ưu tiên | Rủi ro | Cách kiểm tra |
|---|---|---|---|---|---|---|
| HA-1 | Ảnh tạm và ảnh lỗi (L11, L12). | Làm theo quy trình 10 bước, thứ tự: idle → bị đánh → lướt → tiếp đất → chết → bám tường → đòn 3 → chém trên không. | `art/chibi/lam/…` | Vừa | Thấp (có thư mục ứng viên) | Tiêu chí số C.4 + GIF. |
| HA-2 | Sheet mờ khi phóng lên màn iPhone. | **Sau khi chốt cỡ (A1)**: xuất sheet HD (≈ 0,70 ô chuẩn) và vẽ với hệ số tương ứng; JSON giữ đơn vị px game (chia lại `ox, oy, dx, dy`). | `chibi-sheets.py` `K` dòng 35; `veBuoc` | Thấp | Vừa (bộ nhớ +13 MB, đổi toàn bộ số) | So ảnh phóng to; phiếu bộ nhớ IP-1. |
| HA-3 | Tài liệu lệch (L13). | Cập nhật README, đánh dấu cũ ở `tieu-chi-animation-lam.md`, `do-phan-giai-960.md`. | docs | Thấp | Không | Đọc lại. |

---

## PHẦN D — LỘ TRÌNH TRIỂN KHAI

Mỗi giai đoạn là **một nhánh con hoặc một chuỗi commit riêng**, có thể duyệt, gộp hoặc hoàn tác độc lập. Không giai đoạn nào đổi luật chơi khi chưa có mã duyệt tương ứng.

### GĐ0 — Thước đo trước (không đụng game)

- **Mục tiêu:** có công cụ chứng minh mọi thay đổi sau "đúng như dự định".
- **File dự kiến thay đổi:** `game/tools/kiem-thu-phat-lai.py` (mới); `game/tools/chibi-sheets.py`, `game/tools/do-animation.py` (thêm `--ra`); docs.
- **Tuyệt đối không thay đổi:** `game/demo.html`, `game/anim/*`, ảnh `art/`.
- **Thứ tự:** KT-2 → KT-1 → KT-3 → AN-2.
- **Kết quả mong đợi:** một lệnh chạy ra bảng trạng thái từng bước + báo cáo số đo animation; chạy hai lần giống hệt.
- **Tiêu chí nghiệm thu:** chạy KT-1 hai lần trên `596ed9f` → trùng 100 %; `git status` sạch sau khi chạy với `--ra` ra thư mục tạm.
- **Cách quay lại:** xóa các file công cụ mới (`git revert`). Game không bị ảnh hưởng.
- **Phụ thuộc:** không.

### GĐ1 — Sửa lỗi an toàn

- **Mục tiêu:** hết lỗi cảm ứng; sửa hai lỗi nhỏ của hit-stop và Tiếng Vọng.
- **File:** `game/demo.html` (`onTouch`, `hurt`, `updateEcho`/`step`).
- **Không thay đổi:** tham số `P`, `ATK`, bản đồ, sheet, cỡ Lam.
- **Thứ tự:** IN-1 → IN-2 → CB-1 → EV-1 (mỗi việc 1 commit).
- **Kết quả:** chạm nút không lỗi console; cần có hướng ngay khi đặt ngón.
- **Nghiệm thu:** phép thử 4 sự kiện chạm không lỗi; KT-1 chỉ khác đúng ở các tình huống đã sửa (EV-1, CB-1); chơi thử iPhone 1 lượt.
- **Quay lại:** `git revert` từng commit.
- **Phụ thuộc:** GĐ0 (KT-1).

### GĐ2 — Thử nghiệm thu nhỏ Lam (mặc định vẫn 1,0)

- **Mục tiêu:** chủ dự án chơi được cả 0,8 / 0,7 / 0,6 bằng link.
- **File:** `game/demo.html` (`LAM_SCALE`, `drawLam`, `veBuoc`, các hằng số L10, `?hop=theo`, dòng debug).
- **Không thay đổi:** hitbox 20×30, tốc độ, nhảy, gạch 32, 960×540, bản đồ, JSON, ảnh. **Mặc định 1,0.**
- **Thứ tự:** SZ-1 → SZ-2 → SZ-3 (chỉ dưới tham số `?hop=theo`) → link thử + phiếu ghi B.5.
- **Kết quả:** `?lam=0.7` cho Lam cao 113–117 px, chân chạm đất, bóng Vọng, "!" đúng chỗ.
- **Nghiệm thu:** không tham số → ảnh chụp trùng từng điểm ảnh với bản trước và KT-1 trùng 100 %; với `?lam=0.7` đo đế ≤ 1 px, tâm thân ≤ 1 px, "!" cách đỉnh mũ ≤ 10 px.
- **Quay lại:** bỏ tham số URL (tức thì) hoặc `git revert`.
- **Phụ thuộc:** GĐ0; nên sau GĐ1 để thử cảm ứng không bị L1.

### GĐ3 — Chốt cỡ Lam và đồng bộ theo cỡ

- **Mục tiêu:** đổi mặc định sang cỡ đã duyệt (A1), đồng bộ hộp đòn / vùng ăn đòn (A3), nhịp chạy (A5), quái (A4).
- **File:** `game/demo.html` (mặc định `LAM_SCALE`, `nhanATK`, `hurtBox`, `lamChibi`, có thể `drawQuai`, `S.look`).
- **Không thay đổi:** hitbox 20×30, `P`, bản đồ, ảnh sheet (chưa làm HD).
- **Thứ tự:** đổi mặc định → SZ-3 (nếu A3 duyệt) → SZ-4 (nếu A5) → SZ-5, CA-1 (nếu duyệt).
- **Kết quả:** bản chính chạy cỡ mới; `?lam=1` vẫn mở được cỡ cũ để so.
- **Nghiệm thu:** tiêu chí số C.4 ở cỡ mới; trượt chân ≤ 3 px/khung; chơi hết demo không kẹt chỗ nào; số liệu phiếu B.5 không tệ hơn bản cũ quá 20 % (chém hụt, bị đánh).
- **Quay lại:** đổi lại mặc định = 1 (1 dòng) hoặc `git revert`.
- **Phụ thuộc:** GĐ2 + duyệt A1 (và A3, A4, A5 cho phần tương ứng).

### GĐ4 — Chiến đấu

- **Mục tiêu:** nối combo không nuốt phím; hộp đòn khớp dao theo từng pha.
- **File:** `game/demo.html` (`updatePlayer`, `atkBox`, `nhanATK`); `game/tools/chibi-sheets.py` (`box` theo bước); sinh lại `lam-chibi.json` **vào thư mục ứng viên trước**, rồi mới thay.
- **Không thay đổi:** ảnh sheet, thời lượng đòn, sát thương, hit-stop, luật Cộng hưởng.
- **Thứ tự:** CB-3 → (KT-3 đo dao) → CB-2 → EV-2 (kịch bản tình huống).
- **Kết quả:** phép thử 16 thời điểm bấm cho kết quả như CB-3; mũi dao trong hộp.
- **Nghiệm thu:** tiêu chí "hộp vượt mũi dao 0–8 px"; KT-1: cùng kịch bản vẫn hạ được 3 quái và boss; bảng tình huống Cộng hưởng ở PHẦN E đạt.
- **Quay lại:** `git revert`; JSON cũ còn trong lịch sử git.
- **Phụ thuộc:** GĐ3 (hộp đòn phải theo cỡ đã chốt), duyệt A7, A8.

### GĐ5 — Tách module

- **Mục tiêu:** `demo.html` thành vỏ HTML + `game/src/*.js`, build vẫn ra 1 file.
- **File:** `game/build-demo.py`, `game/demo.html`, `game/src/*.js` (mới).
- **Không thay đổi:** bất kỳ logic nào (chỉ cắt – dán), JSON, ảnh.
- **Thứ tự:** MO-1 → MO-2 theo thứ tự C.6 → MO-3.
- **Kết quả:** mỗi file < 300 dòng, đúng nhóm.
- **Nghiệm thu:** sau **mỗi** bước tách: KT-1 trùng 100 %, không lỗi console, bản build chạy được trong artifact.
- **Quay lại:** `git revert` bước tách gây lỗi (mỗi bước 1 commit).
- **Phụ thuộc:** GĐ0. Có thể làm trước GĐ2–4 nếu chủ dự án muốn (khi đó GĐ2–4 sửa trong file module), nhưng **không làm song song**.

### GĐ6 — Tối ưu iPhone

- **Mục tiêu:** có số đo thật, có 3 mức chất lượng.
- **File:** `game/demo.html` hoặc `src/13-camera-ve.js`, `src/16-debug.js`, cài đặt.
- **Không thay đổi:** logic 60 bước/s, gameplay, cỡ hiển thị.
- **Thứ tự:** IP-1 (đo trước) → IP-2 → IP-3 → IP-4 → IP-5 → IP-6.
- **Kết quả:** phiếu đo 3 máy × 3 cảnh × 3 mức.
- **Nghiệm thu:** mức Cân bằng không chậm hơn bản cũ trên cùng máy; KT-1 trùng 100 % (tối ưu không đổi gameplay); ảnh chụp khác bản cũ không đáng kể ở mức Cân bằng.
- **Quay lại:** chọn lại mức "Chất lượng cao" (= cách vẽ cũ) hoặc `git revert`.
- **Phụ thuộc:** GĐ0; nên sau GĐ5.

### GĐ7 — Sản xuất hình ảnh

- **Mục tiêu:** thay animation tạm, sửa ảnh lỗi, (tùy chọn) sheet HD.
- **File:** `art/chibi/lam/…` (ảnh mới), thư mục ứng viên, cuối cùng `game/anim/lam-chibi.*`.
- **Không thay đổi:** master, luật căn, gameplay.
- **Thứ tự:** HA-3 (tài liệu) → HA-1 theo thứ tự đã nêu → HA-2 (nếu duyệt A14).
- **Kết quả:** mỗi animation mới có GIF + bảng số đo đạt.
- **Nghiệm thu:** tiêu chí số C.4; chủ dự án xem GIF và chơi thử.
- **Quay lại:** giữ sheet cũ trong git; thư mục ứng viên không ảnh hưởng bản chính.
- **Phụ thuộc:** GĐ0 (KT-2), GĐ3 (đã chốt cỡ, để biết xuất ảnh ở độ phân giải nào).

---

## PHẦN E — DANH SÁCH KIỂM THỬ

Mỗi mục làm trên **bàn phím (máy tính)** và **cảm ứng (iPhone ngang)** trừ khi ghi khác. Ghi Đạt / Không đạt + ghi chú. Tình huống có (★) đưa vào kịch bản tự động KT-1.

**1. Chạy và dừng**
- [ ] ★ Chạy phải/trái tới tốc độ tối đa trong ~6 bước, dừng trong ~5 bước.
- [ ] ★ Quay đầu khi đang chạy: không chen khung đứng, thân không nhảy ngang (≤ 1 px).
- [ ] Chân trụ không trượt quá 3 px/khung khi tăng tốc, giảm tốc (sau SZ-4).
- [ ] Đứng yên: không trượt ngang; đầu không nhô quá 2 px/khung (sau khi vẽ lại idle).

**2. Nhảy và tiếp đất**
- [ ] ★ Nhấn nhanh = nhảy thấp; giữ = nhảy cao 112 px (3,5 ô).
- [ ] ★ Coyote: rời mép tối đa 6 bước vẫn nhảy được.
- [ ] ★ Jump buffer: bấm nhảy trước khi chạm đất tối đa 8 bước vẫn nhảy.
- [ ] Đế ủng chạm đúng mặt đất khi tiếp đất (≤ 1 px), không nháy hình.
- [ ] Bám tường, bật tường liên tiếp ở ống khói Cổng làng 1.
- [ ] Đi xuống ván một chiều (↓ + Nhảy).

**3. Lướt**
- [ ] ★ Lướt 8 bước, 88 px, bất tử 11 bước; hồi 18 bước.
- [ ] Lướt trên không chỉ 1 lần cho tới khi chạm đất.
- [ ] Nhảy trong lúc lướt (đang ở đất) hủy lướt và giữ đà.
- [ ] Vệt lướt cùng cỡ với Lam ở mọi `?lam=`.

**4. Combo**
- [ ] ★ Bấm Chém ở 16 thời điểm khác nhau trong đòn 1 → kết quả đúng bảng CB-3 (sau GĐ4) / đúng A.4 (trước GĐ4).
- [ ] Đòn 1 → 2 → 3 → thu thế liền mạch, không giật lùi (≤ 1 px).
- [ ] Chém hất (↑ + Chém), chém trên không, chém nảy (↓ + Chém trên không) đều ra đúng animation.
- [ ] Lướt hủy đòn được ở mọi thời điểm.

**5. Đánh trúng quái**
- [ ] ★ Mỗi nhát chỉ trúng mỗi quái 1 lần (đếm `hp` giảm 1).
- [ ] Hộp đòn đỏ (debug) chứa mũi dao ở khung chạm (sau CB-2).
- [ ] Quái nháy trắng, bị đẩy lùi, đòn 3 đẩy xa hơn.
- [ ] Quái vỏ cứng chỉ "Keng" khi không Cộng hưởng.
- [ ] Bị quái đấm khi đứng trong tầm 82 px lúc nó duỗi tay; không bị khi ở ngoài.

**6. Tiếng Vọng**
- [ ] ★ Ghi tối đa đúng 180 bước (3 s), bấm lần nữa dừng sớm.
- [ ] ★ Bóng phát lại lệch 0 px, đúng từng khung animation.
- [ ] Bóng giữ tư thế cuối, mờ hơn, nhịp sáng; không đánh khi giữ tư thế.
- [ ] Bấm Vọng mới xóa bóng cũ.
- [ ] Hit-stop xảy ra khi đang ghi: bản ghi và bóng không lệch nhịp.
- [ ] Dấu "!" xuất hiện trước nhát chém của bóng, nằm ngay trên đầu ở mọi cỡ.
- [ ] Chết khi đang ghi → hủy bản ghi.

**7. Cộng hưởng**
- [ ] ★ Lam và bóng trúng cùng quái cách nhau 0, 6, 12 bước → Cộng hưởng ×3; cách 13 bước → không.
- [ ] ★ Lam trúng trước, bóng sau và ngược lại → đều Cộng hưởng.
- [ ] ★ FPS thấp (10 lần vẽ/s) → cửa sổ vẫn tính 12 bước logic.
- [ ] ★ Lam giết quái trước khi bóng chém → không Cộng hưởng (luật hiện tại, ghi nhận).
- [ ] ★ Quái vỏ cứng chỉ đau khi Cộng hưởng.
- [ ] Lần đầu: chữ "Cộng hưởng!", sóng, rung; các lần sau "Cộng hưởng ×3".

**8. Công tắc và cổng**
- [ ] ★ Bóng đứng giữ công tắc → cổng mở, Lam qua được, cổng khóa mở.
- [ ] ★ Câu đố 2 công tắc: Lam + bóng đè cùng lúc → cửa mở và giữ.
- [ ] Cổng không đóng sập lên Lam.
- [ ] Bóng đứng công tắc ở `?lam=0.7` vẫn đè được (hộp 20×30 không đổi).

**9. Boss**
- [ ] ★ Kích hoạt, đi, đập (sóng 2 phía), quét thấp; nhảy qua sóng, lướt qua quét.
- [ ] ★ Còn 50 % máu → treo trần; mảnh chuông có bóng báo trước 42 bước.
- [ ] ★ Bóng đứng nút chuông → boss bị kéo xuống, choáng 3 s.
- [ ] Lam đứng nút → hiện nhắc "Chỉ bóng Tiếng Vọng đủ nặng".
- [ ] Hạ boss → màn kết, thống kê đúng.

**10. Camera**
- [ ] Camera trượt mượt, khóa trong phòng, sai bước ≤ 1 px thật.
- [ ] Rung màn có hướng, không lệch vĩnh viễn sau khi rung.
- [ ] Cảm ứng: nhân vật lệch lên 28 px, nút không che Lam ở mọi cỡ.

**11. Hiệu năng iPhone (chỉ máy thật)**
- [ ] Phiếu đo IP-1: iPhone SE / 13 / 15 Pro × Cổng làng, Sân chuông, boss × 3 mức chất lượng.
- [ ] Chơi liên tục 10 phút: FPS trung bình, máy ấm hay nóng, % pin tụt.
- [ ] Lúc Cộng hưởng lần đầu: có khựng không.
- [ ] Bộ nhớ (Web Inspector) không tăng dần theo thời gian.

**12. Chuyển bàn phím ↔ cảm ứng**
- [ ] Đang dùng phím, chạm màn → hiện nút, dòng hướng dẫn đổi chữ.
- [ ] Đang chạm, bấm phím → ẩn nút, hướng dẫn đổi lại.
- [ ] Bấm nút cảm ứng không giữ cần: không lỗi console (sau IN-1).
- [ ] Chạm cần lần đầu có hướng ngay (sau IN-2).
- [ ] Chỉnh cỡ nút 80–130 %, xoay máy, kéo thanh địa chỉ: nút vẫn đúng vị trí.

**13. FPS thấp**
- [ ] ★ 30 lần vẽ/s: game đúng tốc độ (60 bước/s).
- [ ] ★ 10 lần vẽ/s: ghi nhận game chậm còn 40 bước/s (hành vi hiện tại, theo A10).
- [ ] ★ Khựng 300 ms: chỉ 1 bước, không xuyên tường, không mất phím Chém/Nhảy đã bấm.
- [ ] Rời ứng dụng 10 s rồi quay lại: không nhảy cóc trạng thái (sau IP-4 thì đang tạm dừng).

---

## PHẦN F — NHỮNG QUYẾT ĐỊNH CẦN TÔI DUYỆT

Trả lời theo mẫu: *"Duyệt A1, A2; chỉnh A3 (…); chưa duyệt A4"*.

| Mã duyệt | Quyết định | Phương án | Khuyến nghị | Tác động |
|---|---|---|---|---|
| A1 | Cỡ Lam | A 128 (0,8) · **B 112 (0,7)** · C 96 (0,6) · giữ 160 | **Thử cả ba bằng link (GĐ2), nghiêng B** | Hình Lam nhỏ hơn; không đổi bản đồ, vật lý. |
| A2 | Cách thu nhỏ | Hệ số render · đổi vật lý · đổi ảnh nguồn · kết hợp | **Hệ số render trước (quay lại ngay), sheet HD sau (A14)** | Giai đoạn thử không đụng JSON/ảnh. |
| A3 | Hộp đòn + vùng ăn đòn thu theo cỡ Lam | thu theo `s` · giữ số cũ | **Thu theo** (thử trước bằng `?hop=theo`) | **Đổi tầm đánh** (đòn 1: 151 → 106 px với B); dễ bị quái đấm hơn hoặc ít hơn — đo bằng phiếu B.5. |
| A4 | Quái thường khi Lam nhỏ | giữ 120 · thu hình 0,85 (giữ hitbox) · thu cả hitbox | **Giữ 120 lúc đầu**, xem lại sau khi chơi thử | Quái sẽ cao hơn Lam một chút. |
| A5 | Nhịp chạy theo quãng đường | theo quãng đường · giữ 83 ms | **Theo quãng đường** | Hết trượt chân; nhịp khung đổi khi tăng/giảm tốc. |
| A6 | Sửa lỗi cảm ứng L1, L2 | sửa · để nguyên | **Sửa ngay (GĐ1)** | Không đổi luật; chạm ổn định hơn. |
| A7 | Combo: xếp hàng đòn + 6 bước ân hạn | áp dụng · chỉ kéo dài buffer · giữ nguyên | **Áp dụng** | Đổi cảm giác bấm: ít nuốt phím hơn; bấm muộn vẫn nối đòn. |
| A8 | Hộp đòn theo từng pha, khớp dao | khớp dao (đổi tầm) · chỉ dịch hộp, giữ độ dài · giữ nguyên | **Khớp dao, lề 4–8 px** | **Đổi tầm đánh** và thời điểm bắt đầu trúng. |
| A9 | Sửa nhỏ hit-stop (L5) và bước cuối Tiếng Vọng (L6) | sửa · giữ | **Sửa** | Thay đổi rất nhỏ, chỉ ở tình huống hiếm. |
| A10 | FPS dưới 15 | giữ (game chậm lại) · cho chạy bù tới 6 bước · tự hạ chất lượng | **Giữ + hiện cảnh báo trong debug** | Không đổi gameplay. |
| A11 | Tách module + build nối file | làm · chưa làm | **Làm sau GĐ0, trước khi làm màn mới** | Không đổi gameplay (KT-1 chứng minh); file dễ sửa hơn. |
| A12 | Ba mức chất lượng (+ tự hạ mức) | 3 mức, chọn tay · 3 mức + tự hạ · không | **3 mức chọn tay; tự hạ chỉ sau khi có số đo máy thật** | Ảnh nền/hiệu ứng khác nhẹ ở mức Tiết kiệm pin. |
| A13 | Mở rộng khung nhìn (thấy thêm bản đồ thật) hoặc camera dọc | chưa làm · khung nhìn rộng theo màn iPhone · camera dọc cho màn sau | **Chưa làm trong đợt này**; xem lại khi thiết kế màn dọc | Đổi 960×540 / camera là thay đổi lớn, cần lý do riêng. |
| A14 | Sheet HD (nét 1:1 trên iPhone) | làm sau khi chốt A1 · không | **Làm sau khi chốt A1** | +≈ 13 MB bộ nhớ ảnh; đổi toàn bộ số sheet (có thư mục ứng viên). |
| A15 | Danh sách ảnh cần vẽ lại + số khung/thời lượng (C.8) | duyệt · chỉnh | **Duyệt thứ tự: idle → bị đánh → lướt → tiếp đất → chết → bám tường → đòn 3 → chém trên không** | Chỉ ảnh; mỗi animation duyệt riêng khi xong. |
| A16 | Công cụ kiểm thử (KT-1, KT-2, KT-3) và `--ra` cho script | duyệt · chưa | **Duyệt (GĐ0)** | Không đổi game; thêm file trong `game/tools/`. |
| A17 | Tạm dừng khi rời ứng dụng (IP-4) | duyệt · chưa | **Duyệt** | Quay lại ứng dụng thấy bảng tạm dừng. |
| A18 | Cập nhật tài liệu cũ (L13: tiêu chí 64×64, README, GDD độ phân giải) | duyệt · chưa | **Duyệt** | Chỉ tài liệu. |
| A19 | Thứ tự giai đoạn | GĐ0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 · đưa GĐ5 (tách module) lên ngay sau GĐ1 | **Theo thứ tự đã viết**; chọn phương án 2 nếu muốn làm màn mới sớm | Chỉ đổi thứ tự, không đổi nội dung. |

ĐÃ HOÀN THÀNH KẾ HOẠCH — ĐANG CHỜ CHỦ DỰ ÁN PHÊ DUYỆT.
