# Trang thử P0-C – tinh anh · Ấn Rèn I · đe rèn · Âm Đao cấp 3 (28/10/2026)

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-9-P0B.md` mục 4 + "GỬI CLAUDE" điểm 9 (chuẩn bị P0-C **độc lập**),
`KE-HOACH-GAMEPLAY-V2.md` mục 5 (Thế tinh anh), 7 (phạm vi P0-C), 8 (phòng), `KE-HOACH-VU-KHI.md` mục 3, 4b, 6b (Ấn Rèn I trước boss đầu, cấp 3 mở Dư Âm),
PHAN-HOI-2, PHAN-HOI-5 (Thế tinh anh hồi + ổn định chống chuỗi choáng; vỏ quái thường vỡ tới chết), PHAN-HOI-7, PHAN-HOI-8.

> **Chưa thử trên iPhone thật.** Mọi ảnh / video / số đo là Chromium headless (máy chủ Linux không GPU), người chơi là **bot**.
> Số bot chỉ là kiểm chức năng / một kịch bản – **không kết luận "cảm giác tiến triển đã đạt"**. PH9: đánh giá cảm giác chờ các sửa hitbox / điều khiển đã thống nhất.

**Không sửa** `game/thu-p0a/`, `game/thu-p0b/`, `game/thu-bo-vo-moc/`, `game/thu-phong-b/`, `demo.html`, `build-demo.py`, `docs/gameplay/`, ảnh nguồn, rig. Không publish.
Không viết bộ kiểm thử tự động (chỉ có script quay video + ghi log).

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0c/index.html | **Người chơi thử** (log nền vẫn thu, không hiện bảng / hộp đòn). Vào phòng **A (điểm lưu)**, đi A → B → C → D → **E (tinh anh)** → **F (đe rèn)**. Âm Đao **cấp 1** |
| …/thu-p0c/index.html?vao=e | **Rút gọn**: vào thẳng đầu phòng E (tinh anh). Mốc hồi sinh ở đầu E |
| …/thu-p0c/index.html?vao=f | Vào thẳng phòng F – chỉ để xem đe (chưa có Ấn thì **không** rèn được, gợi ý "Đe rèn · cần Ấn Rèn I") |
| …/thu-p0c/index.html?vao=e&hitbox=1&debug=p0c | Bảng log P0-C trên màn + hộp đòn (hộp đập / hộp húc của tinh anh đúng tỉ lệ ×1,5) + chữ trạng thái tinh anh dưới chân |
| …/thu-p0c/index.html?vao=e&tamau=600 | **CHỈ ĐỂ KIỂM** chu trình Thế (tinh anh 600 máu để thấy vỡ → choáng → ổn định → vỡ lại ×0,6). **Mặc định tắt (160)** – không dùng khi thử người chơi |

Xuất log sau lượt chơi: ⚙ → **"Xuất log P0-C (lượt này)"** (tải file .txt: tóm tắt + từng dòng, có ms thật). Không cần tải lại trang để bật debug.
Nút đổi cấp Âm Đao của trang Âm Đao bị **ẩn** (người thử lên cấp bằng đe); chỉ hiện ở `?debug=p0c`.
Điều khiển như trang Âm Đao: chạm **Chém** = đánh thường; ở cấp 3 **giữ Chém ≥ 20 tick rồi thả** = Dư Âm. **V** = Vọng A (bật / tắt ghi). Cạnh đe có Ấn: nút **"🔨 Rèn Âm Đao"** (bàn phím: **F**).

## Đã làm

| # | Yêu cầu | Đã làm |
|---|---|---|
| 0 | Trang riêng sinh bằng script | `cong-cu/tao-p0c.py`: nền = `thu-p0a/am-dao.html` (bản đã sửa PH8) + **bộ đất mới A → F, phòng D/E/F, Bọ** lấy đúng danh sách chỗ thay của `thu-phong-b/cong-cu/tao-tu-p0a.py` (đọc bằng AST, không chạy script đó) + bản chép `khoi-phong-b.js` (chỉ đổi: mặc định vào phòng A; tên phòng E) + bản chép `khoi-bo.js` + khối riêng `cong-cu/khoi-p0c.js`. Mỗi chỗ thay phải khớp đúng số lần – nguồn đổi thì script dừng và báo |
| 1 | Phòng E: tinh anh "Chuông Gỗ Gác Lớn" | Chuông Gỗ biến thể: **cùng rig + clip Chuông Gỗ** (`QBR.capNhatQuai` / `QBR.ve`), **phóng ×1,5** (cao ≈ 180 px, thân va chạm 108 × 162) + **tô màu** gỗ sơn sẫm (phủ `source-atop` trên canvas phụ) + ánh đồng nhẹ + tên trên đầu. **[160 máu, Thế 80]**, Thế dùng **`THE_TINH_ANH`** của khối P0-A (hồi khi không bị đánh, vỡ → choáng → hồi phục → **ổn định**, chống chuỗi choáng ×0,6 / ×0,4). Nặng: đòn thường **không** làm khựng / đẩy lùi; chỉ vỡ Thế mới huỷ đòn đang ra |
| 1a | Đòn 1 – ĐẬP | Như Chuông Gỗ: báo trước **30 tick** (dấu hình: **lóe vàng toàn thân + dấu "!"**; dấu âm: ting `sfx.warn`), hộp đập = hộp Chuông Gỗ **×1,5** bật tick 5–10, lao 3,6 px/tick trong 5 tick, hồi 34 |
| 1b | Đòn 2 – HÚC NGANG | Báo trước **36 tick** (dấu hình: **lóe ĐỎ CAM** + **ngả người ra sau** + **mũi tên »** trên đầu chỉ hướng + bụi chân; dấu âm: tiếng trầm kéo `sfx.sweepPrep` – khác tiếng đập), rồi **lao ngang 6,5 px/tick tối đa 36 tick** (dừng ở mép sân), **hồi 46 tick** (đứng thở, đánh được). Né: lùi xa khi thấy báo, hoặc **lướt xuyên qua** (miễn sát thương 11 tick) |
| 1c | Nhịp khác rõ | Đập: báo 30 → chạm ngay → hồi 34 (gần). Húc: tầm xa 150–440 px, báo 36 → lao dài → hồi 46. Sau **2 lần đập liên tiếp** tinh anh **lùi lấy đà** (34 tick) rồi húc → người chơi bám sát cũng gặp húc |
| 1d | Mọi dấu âm có dấu hình | Bảng `LOAI_TA.don` ghi `dauHinh` / `dauAm` cho cả 2 đòn; trang cảnh báo trong console nếu đòn nào có âm mà thiếu hình |
| 1e | Hạ được bằng đánh thường | Video 1–2: bot **chỉ chạm Chém** (cấp 1, không bấm V, không Dư Âm) hạ tinh anh ở **tick 688**. Vọng **không bắt buộc** (bóng chỉ cộng thêm nếu người chơi muốn) |
| 2 | Rơi Ấn Rèn I | Ảnh `p0c/an-ren-2x.png` cắt từ `art/huong-moi/nguon/vu-khi/an-ren.png` (khung 1 "rơi trên đất" + khung 2 "đã nhặt – khắc sáng"; tách nền trắng loang từ mép, script `cong-cu/tao-asset-p0c.py`). Vẽ **cao 24 px** (trong 20–28). Rơi tung lên rồi nảy 1 lần, quầng sáng ấm nhấp nháy. **Chạm để nhặt** (sau 18 tick): tiếng 2 nốt, tia + vòng sáng, chớp nhẹ, chữ "Ấn Rèn I", biểu tượng **bay về HUD** (48 tick) rồi nằm cạnh bảng vũ khí. Ấn không tiêu hao |
| 3 | Phòng F: đe rèn | Dùng đe 2 trạng thái của bước 3 phòng B (`do-vat-f.png` cắt từ `nguon/vu-khi/de-ren.png`: nguội / đang rèn – than đỏ, quầng lò). Có Ấn + đứng ≤ 80 px: nút **"🔨 Rèn Âm Đao"** (phím **F**) + nhãn **"RÈN"** nổi trên đe (thấy cả khi nút bị ngón che). Rèn → **Âm Đao cấp 3 (mở Dư Âm)**: 3 tiếng búa + 2 nốt, tia lửa, đe đỏ rực 1,5 s, chữ lớn **"Âm Đao cấp 3 · mở Dư Âm"**, sau 1,6 s dòng nhắc "Giữ Chém rồi thả = Dư Âm". **Không menu, không vật liệu, không cấp khác**. Không có Ấn → gợi ý "Đe rèn · cần Ấn Rèn I", không có nút |
| 4 | Vọng | **Cấu hình tạm A (ghi chủ động)**, nút V một nghĩa (bật / tắt ghi, đúng code trang Âm Đao). Áp **sửa PH9 mục 1.3–1.4** như P0-B: mẫu cuối của đoạn xử lý **đủ** hình + hộp + hit rồi bước sau mới kết thúc → bóng **nghỉ** theo hướng cuối, **không hộp đòn**, mờ hơn, không nhấp nháy. Đổi phòng gameplay / chết → xoá bóng. **Không có B ở trang này** (không gộp hai cách vào một nút). Luật Vọng, chi phí, kỹ năng vũ khí **không đổi** trong lượt |
| 5 | Đi phòng | A (điểm lưu) → B → C (quái gác – cổng mở khi nó chết, như P0-A) → D (2 Bọ) → E → F. `?vao=e` vào thẳng E. Âm Đao **luôn bắt đầu cấp 1** (bỏ `?cap=`) |
| 6 | Log chức năng | **Log nền luôn thu** (`P0C.LOG`, 6000 dòng): tinh anh thức / mỗi đòn (báo trước, hộp bật, lao, dừng) / trúng Lam / máu + Thế từng lần / **vỡ Thế (lần thứ mấy trong 600 tick, choáng bao nhiêu, hệ số chống chuỗi)** / hồi phục / **ổn định (và khi ổn định giữ Thế ở sàn 1)** / hết ổn định / Thế tự hồi / hạ; **Ấn rơi / nhặt**; **đe**: tới đe có / chưa có Ấn, **mở cấp** (số chỉ số mới); **Dư Âm** tung / vết trúng; Vọng: xoá bóng khi đổi phòng, bóng nghỉ. Log P0-A (công thức, Cộng hưởng…) vẫn có ở `?debug=input` |

## Thông số (số thử, thang ×10, tick = 1/60 s)

| | Số | Ghi chú |
|---|---|---|
| Tinh anh máu / Thế | **160 / 80** | KHGP2 mục 7. `?tamau=N` chỉ để kiểm |
| Thế tinh anh | `THE_TINH_ANH`: choáng **150**, hồi phục 20 (Thế về đầy), **ổn định 120** (Thế không xuống dưới 1), chờ 90 rồi +1 / 3 tick, lần vỡ 2 / 3 trong 600 tick: ×0,6 / ×0,4 (tối thiểu 45), Cộng hưởng −50 % Thế | Không đổi số – lấy nguyên cấu hình khối P0-A |
| Cỡ | rig ×1,5 → cao ≈ 180 px; thân 108 × 162 | Chuông Gỗ 72 × 108 |
| Đi | 0,8 px/tick, dừng khi tâm cách Lam ≤ 96 px; thức khi Lam vào E và cách ≤ 560 px | Ở trong cột 3–27 của E |
| Đập | báo 30 · hộp tick 5–10 · hồi 34 · nghỉ 34 · tầm kích hoạt < 175 px · hộp `{dx −135, dy −121, w 99, h 55}` (= Chuông Gỗ ×1,5) · sát thương 1 | Chuông Gỗ: báo 30, hồi 26, nghỉ 60 |
| Húc | báo 36 · lao 6,5 px/tick ≤ 36 tick (≤ 234 px) · hồi 46 · nghỉ 150 · tầm kích hoạt 150–440 px · hộp = thân, 30 → 150 px trên chân · sát thương 1 | Lùi lấy đà 34 tick (1,7 px/tick) sau 2 lần đập liên tiếp |
| Chạm thân | **đẩy Lam ra 2,5 px/tick, không sát thương** (lướt đi xuyên được) | Khác Chuông Gỗ thường – xem câu hỏi 2 |
| Ấn Rèn I | cao 24 px, nhặt sau 18 tick, vùng nhặt 24 × 24 | |
| Đe | tương tác ≤ 80 px từ tâm đe (cùng ngưỡng "đang rèn" của phòng B) | |
| Âm Đao cấp 3 | đánh thường **12** (nhát 3 [12, 30]), Dư Âm: chém vang [15, 20], vết [10, 10], giữ 20 tick, hồi 150 | Bảng cấp có sẵn của trang Âm Đao: cấp 3 **gồm** +20 % của cấp 2 – xem câu hỏi 1 |

## Video (`video/`, 60 hình/s, mỗi hình = 1 bước logic, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-tinh-anh-an-ren-du-am.mp4` / `2-debug-…` | `?vao=e`, bot **chỉ đánh thường** hạ tinh anh (tick 688) → nhặt Ấn (722) → sang F, tới đe (836) → bấm F rèn → **cấp 3** (852) → giữ Chém 26 tick, thả → **Dư Âm** (1005). Bản debug thêm `?hitbox=1&debug=p0c`. 1192 hình |
| `3-sach-kiem-the-tamau600.mp4` / `4-debug-…` | **CHỈ ĐỂ KIỂM** `?tamau=600`: cùng bot đánh 1200 tick – vỡ Thế 3 lần (150 → 90 → 90 tick), ổn định sau mỗi lần |
| `log-luong-chinh-*.txt`, `log-kiem-the-*.txt` | Log P0-C từng dòng (bản sạch và debug giống hệt) |
| `ket-qua.json` | Tóm tắt số, mốc của bot, 60 dòng cuối log P0-A, lỗi trang |

Bot (`cong-cu/quay-p0c.py`): thấy báo đập → lùi khỏi tầm; thấy báo húc → đứng cách ≥ 150 px, lúc nó lao tới trong 150 px thì lướt xuyên qua;
tinh anh không ra đòn → áp sát, chạm Chém mỗi 14 tick (giữ cách ≥ 78 px trừ lúc choáng). `?battu=1` chỉ để video không bị cắt (số lần trúng vẫn ghi).
Trong trận **không dời quái, không đặt lại hồi chiêu, không can thiệp**. Hai trang sạch / debug chạy cùng đầu vào: lệch trạng thái **0** bước.
Quay lại: `python3 -B game/thu-p0c/cong-cu/quay-p0c.py` (khoảng 10 phút).

## KIỂM BẰNG CODE (Chromium headless)

| Kiểm | Kết quả |
|---|---|
| Trang sinh đúng | `tao-p0c.py`: 18 chỗ thay bộ đất / phòng D–F của phòng B + 8 chỗ riêng P0-C trên trang Âm Đao + 2 chỗ trên bản chép khối phòng B + 5 trên bản chép khối Bọ – khớp đủ; lỗi trang **0** ở mọi lần chạy (chỉ có lỗi tải font Google bị chặn có chủ ý trong máy quay) |
| Mặc định | Link không thêm gì: vào phòng **Khởi đầu (A)**, Âm Đao **cấp 1**, nút đổi cấp ẩn, có nút "Xuất log P0-C" |
| Hạ tinh anh bằng đánh thường | Video 1–2, log `log-luong-chinh-sach.txt`: 2 đập + 2 húc, **vỡ Thế 1 lần** (f294, Thế 30 → 0) → choáng 150 → hồi phục (Thế về 80) → **ổn định 120** → hạ ở f688. Không bấm V, không Dư Âm (Dư Âm chỉ có sau đe). Lam bị đánh **3** lần (2 đập – bot chưa lùi kịp ra khỏi tầm; 1 húc – bot lướt chưa đúng lúc) |
| Thế tinh anh hồi + chống chuỗi choáng | `?tamau=600` (`log-kiem-the-sach.txt`): vỡ f294 → choáng **150**; vỡ f720 (lần 2 trong 600 tick) → choáng **90 (×0,6)**; vỡ f1051 (lần đầu đã quá 600 tick → tính lần 2) → **90**. Sau mỗi lần: hồi phục 20 → Thế đầy 80 → ổn định 120 |
| Ổn định giữ Thế ở sàn 1 | Kiểm riêng (đặt tinh anh vào ổn định với Thế 5, chém 3 nhát): Thế **5 → 1 → 1 → 1**, không vỡ, máu vẫn trừ 160 → 150 → 140 → 130; log "ổn định: Thế giữ ở sàn 1 (không phá tiếp được)". Trong 2 video bot chưa lần nào phá hết 80 Thế trong 120 tick ổn định nên dòng này không xuất hiện ở đó |
| Nặng, không khựng | Đòn thường trúng lúc tinh anh đang báo / hồi: đòn **không** bị huỷ, bộ đếm tick của đòn **không** bị đặt lại (đã sửa lỗi ở bản nháp: P0 đặt `t = 0` khi trúng làm tinh anh kẹt mãi trong hồi đòn) |
| Vỡ Thế huỷ đòn | Log "vỡ Thế HUỶ đòn đang ra (…)" khi vỡ lúc đang báo / ra đòn |
| Ấn Rèn | Rơi đúng chỗ tinh anh hạ (f688), nhặt f722 (sau 35 tick), biểu tượng về HUD. `?vao=f` không có Ấn: không nút, gợi ý "cần Ấn Rèn I", log "CHƯA có Ấn → không rèn được" |
| Mở cấp | f852 "MỞ CẤP: Âm Đao cấp 1 → 3 ở đe rèn (phím KeyF) · Dư Âm: chém vang 15/20, vết 10/10, giữ 20 tick, hồi 150 · đánh thường 12/10 (nhát 3 12/30)"; f1005 "DƯ ÂM tung #1". Nút rèn tự ẩn sau khi lên cấp 3 |
| Vọng A + sửa PH9 | Kiểm riêng ở phòng E: V → 3 nhát → V: bóng phát 40 mẫu, trúng tinh anh, **Cộng hưởng** (Lam trước 8 tick, +10 máu, −50 % Thế) – log "bóng #1 phát xong đủ 40 mẫu (mẫu cuối đã xử lý) → tư thế nghỉ, không hộp đòn"; sang phòng F → "đổi phòng gameplay → xoá bóng (PH9)" |
| Dấu báo | Ảnh / video: đập = lóe vàng + "!" trên đầu; húc = lóe đỏ cam + ngả người + » + bụi. Hai dấu khác màu, khác hình |

## CẦN THỬ IPHONE (chưa làm – không đánh dấu đạt)

| Câu | Cần gì |
|---|---|
| Đọc hai đòn | Không giải thích trước: người thử có phân biệt được **lóe vàng = đập gần** và **lóe đỏ + » = húc lao xa** không, sau mấy lần bị trúng |
| Né húc | Lùi xa hay lướt xuyên qua – người thử tự tìm ra cách nào, có thấy 36 tick báo trước là đủ / dư không. Lướt xuyên qua thân to có thấy "ăn gian" không |
| Chạm thân không đau | Có thấy lạ khi đứng chồng lên tinh anh mà không mất máu (chỉ bị đẩy) không |
| Choáng 150 | Lần vỡ Thế đầu: người thử có dồn hết máu tinh anh trong lúc choáng không, trận có thấy quá dễ / quá ngắn không |
| Ấn Rèn | Ấn cao 24 px có thấy rõ khi rơi giữa đống vụn tinh anh không; có hiểu phải mang tới đe không (chưa có NPC dẫn) |
| Đe | Nút "Rèn" + nhãn "RÈN" trên đe có đủ rõ, có bấm nhầm với nút khác không. Chữ "Âm Đao cấp 3 · mở Dư Âm" có quá to / quá lâu không |
| Cảm giác tiến triển | **Không kết luận từ bot.** Hỏi: sau khi rèn, người thử có muốn thử Dư Âm ngay không, có nói được khác gì với cấp 1 không (KHVK 10a câu 3). PH9: chờ sửa hitbox / điều khiển đã thống nhất rồi mới đánh giá |
| Hiệu năng | Tinh anh vẽ qua một canvas phụ ≈ 360 × 290 × tỉ lệ màn mỗi khung (iPhone ngang @3x ≈ 780 × 630 px) – đo khung hình trên Safari |

## Câu hỏi cần chủ dự án quyết

1. **Cấp 3 gồm luôn +20 % của cấp 2** (đánh thường 10 → 12) vì bảng cấp có sẵn cộng dồn 1 → 3. P0-C không có cấp 2 riêng (không vật liệu, không cấp khác). Giữ như vậy, hay ở P0-C cấp 3 **chỉ mở Dư Âm** (đánh thường giữ 10) để người thử chỉ cảm nhận một thay đổi?
2. **Chạm thân tinh anh: đẩy ra, không mất máu** (Chuông Gỗ thường thì mất máu). Lý do: thân to + Lam lao tới khi chém → hay chạm oan, nhất là lúc tinh anh vừa đứng dậy sau choáng. Đồng ý, hay giữ sát thương chạm thân như Chuông Gỗ?
3. **Choáng 150 tick khá dài**: trong lượt bot, ≈ 60 / 160 máu mất trong lần choáng đầu, và bot không cần phá Thế lần 2. Giữ số kế hoạch tới buổi thử iPhone, hay chuẩn bị biến thể choáng 120 (tắt mặc định)?
4. Lam chết → tinh anh **đặt lại đầy máu / Thế**; phòng E **không khoá cửa** (đi qua F được nhưng không rèn được khi chưa có Ấn). Giữ, hay cần cổng E mở khi tinh anh hạ?
5. **Vọng B** chưa có ở trang P0-C (PH9 cho phép dùng A làm tạm). Có cần thêm lựa chọn `?vong=b` trước lượt (dùng lại khối P0-B) không, hay chờ kết quả A/B trên iPhone?
6. Ảnh Ấn rơi trên đất dùng khung "khắc tối" của tranh gốc + quầng sáng code. Có cần gen riêng một hình Ấn nằm nghiêng / có bóng không?
7. Log P0-A (`?debug=input`) gọi tinh anh là "Chuông Gỗ#7" (tên lấy từ code P0-A, không sửa). Log P0-C ghi đúng tên. Chấp nhận?

## Tập tin

- `index.html` – trang thử (SINH RA, không sửa tay). `p0c/an-ren-2x.png/.json` – ảnh Ấn Rèn I (2 khung).
- `cong-cu/tao-p0c.py` – sinh trang. `cong-cu/khoi-p0c.js` – khối P0-C (tinh anh, Ấn, đe, log, móc Vọng PH9). `cong-cu/tao-asset-p0c.py` – cắt ảnh Ấn.
- `cong-cu/quay-p0c.py` – quay video + ghi log / số (không phải kiểm thử tự động).
- Khi `thu-p0a/am-dao.html`, `thu-phong-b`, khối Bọ đổi: chạy lại `python3 game/thu-p0c/cong-cu/tao-p0c.py` (script báo rõ chỗ nào không khớp).
