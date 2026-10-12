# Tay / kiếm / mặt khi chém — báo cáo (12/10)

## 1. Nguyên nhân thật (đã kiểm trước khi sửa)

Đã cắt và phóng to hàng `atk_sword` của cả 4 em bé (tệp `em-be-<key>-don`, khung 48×48, nét ×2, điểm chân [24, 45], 6 khung),
rồi vẽ lại từng thời điểm của 3 nhát chém trong game, đánh dấu điểm nắm tay máy đo và bàn tay code (công cụ: `kiem/chup.py`).

**Ảnh đòn AI KHÔNG có kiếm** — chỉ vẽ thân + tay không. Kiếm do code vẽ rồi gắn vào bàn tay. Lỗi nằm chủ yếu ở **code ghép**:

| # | Lỗi người chơi thấy | Nguyên nhân | Nằm ở |
|---|---|---|---|
| 1 | Kiếm đè lên mặt khi lấy đà (nhát 1, nhát 3), lúc chém ngược lên (nhát 2) | Kiếm luôn được vẽ **TRƯỚC thân** (`front: true` trong `vkGhep`) kể cả khi lưỡi chĩa ra sau đầu; góc vung là góc của khung xương code, không quan tâm mặt ảnh AI ở đâu | code `js/hero_tinhlinh.js` |
| 2 | "Bàn tay thừa": ô vuông trắng có viền đen chồng lên tay, lúc có lúc không | Sau khi vẽ kiếm, game còn vẽ **nắm tay của em bé code** (màu da code `#f6f0e2`, khác màu da AI) — chỉ ở những khung mà khung xương code có tay, nên chớp tắt | code `drawFrame` |
| 3 | Khung giơ kiếm qua đầu: kiếm mọc từ ngực, cắt ngang mặt | Máy tự đo bàn tay (`doTay`) bỏ "đĩa đầu" ra trước khi tìm tay, nên tay giơ lên qua đầu bị cắt rời và không được nhận → chọn nhầm ngực. Sai ở: Cu Tí khung 5, Cu Lì khung 4–5–6, Cái Bống khung 5 | code `sprite_custom.js` |
| 4 | Vệt chém (ảnh vòng cung) vòng qua đỉnh đầu, trước mặt | Cung vệt lấy cả đoạn kiếm đang ở sau lưng lúc lấy đà, nên vòng cung đi qua đầu | code `js/fx.js` (cungVk) |
| 5 | Tay giơ che mặt, tay sau không thấy, động tác ít thay đổi | **Ảnh AI** (xem mục 3) | ảnh |

Không có lỗi về kích thước khung, toạ độ cắt hay neo chân: tệp đòn canh đúng điểm chân thân gốc (độ dời 0), 6 khung đủ, chọn khung
(`khungDon`: nhát 1 = khung 1→2, nhát 2 = 3→4, nhát 3 = 5→6, đổi khung ở u = 0,4) đúng như prompt.

## 2. Đã sửa gì (sau cờ `G.KIEM_KHOP`, tắt bằng `?kiemkhop=0` → vẽ y hệt trước, đã so từng điểm ảnh)

1. **Thứ tự lớp kiếm** (`kiemKhop` trong `js/hero_tinhlinh.js`): khi đang đánh (đứng chém, chạy chém, chiêu, giữ lấy đà) mà lưỡi kiếm
   chĩa ra sau lưng → kiếm vẽ **sau thân**: thấy mũi kiếm sau đầu, bàn tay AI nằm tự nhiên trên chuôi, mặt không bị che.
2. **Né mặt**: kiếm ở trước thân mà lưỡi đi ngang vùng mặt của khung đang vẽ (`SC.matKhung`: đĩa đầu tự đo, lấy nửa trước–dưới)
   → xoay lưỡi về phía trước từng 5° (tối đa 70°); vẫn chạm mặt thì đặt sau thân.
3. **Bàn tay**: bỏ ô bàn tay code; thay bằng vẽ lại chính bàn tay AI (cắt tròn bán kính 2,5 điểm ảnh) đè lên chuôi → tay nắm đúng chuôi, không tay thừa.
4. **Điểm nắm tay từng khung** `atk_sword` của 4 em bé đo tay (bảng `SC.TAY_KIEM`). Có kèm số điểm ảnh của từng khung: nếu ảnh được
   nhập lại (ví dụ Cái Bống đang được nhập ở phiên khác) mà khác đi thì bảng tự bỏ qua, quay về máy tự đo như cũ.
5. **Vệt chém**: cung vệt chỉ tính từ lúc lưỡi đã ra trước thân (chỉ đổi vị trí, không đổi độ đậm/cỡ ảnh).

Không đổi: tầm đánh, vùng trúng, sát thương, thời gian đòn, tốc độ hoạt ảnh, cỡ sprite, các vũ khí khác (cung, giáo, búa), đứng/chạy
không đánh. Kiếm khi đứng yên chỉ khác ở chỗ bàn tay AI vẽ đè lên chuôi.

## 3. Khung ảnh AI có lỗi (đề xuất vẽ lại RIÊNG từng khung, không thay cả nhân vật)

Ảnh đánh dấu: [`tham-chieu-khung-loi.png`](tham-chieu-khung-loi.png) (viền đỏ). Đếm khung từ trái sang, bắt đầu từ 1.

| Em bé | Tệp / hàng | Khung | Lỗi | Ảnh hưởng hiện tại sau khi sửa code |
|---|---|---|---|---|
| Cu Tí | em-be-smith-don, hàng 1 (atk_sword) | **5** | tay trước giơ lên đi ngang qua mặt, che mắt và miệng | kiếm đã ra sau đầu, nhưng chính cánh tay AI vẫn che mặt |
| Cu Tèo | em-be-hunter-don, hàng 1 | **2, 3, 4, 5** | gần như y hệt khung 1 (thủ thế), khung 5 không giơ tay → 3 nhát chém trông như đứng yên | kiếm vẫn vung đúng nhưng thân không theo |
| Cu Lì | em-be-wrestler-don, hàng 1 | **4** | cánh tay vắt chéo qua đầu | tạm được |
| Cu Lì | em-be-wrestler-don, hàng 1 | **5** | tay giơ thẳng chính giữa mặt (che mặt) | kiếm ra sau đầu, cánh tay vẫn che mặt |
| Cu Lì | em-be-wrestler-don, hàng 1 | **6** | ngồi thụp, không thấy bàn tay → kiếm không có chỗ nắm rõ | kiếm gắn ở đầu gối |

Thêm (không phải giải phẫu): thân đòn Cu Lì có màu da / mặt hơi khác thân đứng–chạy (thân gốc), lúc chém trông như đổi người một chút.
Cái Bống không có khung lỗi; tay sau ở các khung ôm ngực / giơ hai tay đều thấy rõ.

### Prompt vẽ lại (gửi kèm ảnh tham chiếu đã cắt đúng hàng)

**Cu Tí – khung 5:**
> Ảnh gửi kèm là hàng chém kiếm 6 khung của bé Cu Tí (pixel art chibi, nhìn nghiêng sang phải). Chỉ vẽ lại khung 5 (viền đỏ): bé giơ cao
> hai tay qua đầu như sắp bổ kiếm xuống, nắm tay ở phía trên–sau đầu. Cánh tay đi sau đầu hoặc sát mép sau của đầu, KHÔNG được che mắt,
> mũi, miệng. Tay KHÔNG cầm vũ khí (kiếm do game vẽ thêm). Giữ nguyên nét vẽ, bảng màu, viền đen, cỡ người, vị trí chân như các khung còn lại.
> Nền xanh lá trơn #00ff00, ô 48×48 như ảnh gốc, xuất riêng khung đó.

**Cu Tèo – khung 2, 3, 4, 5:**
> Ảnh gửi kèm là hàng chém kiếm 6 khung của bé Cu Tèo (pixel art chibi, nhìn nghiêng sang phải); khung 1 và 6 giữ nguyên. Vẽ lại 4 khung
> 2–5 cho rõ động tác, tay không (kiếm do game vẽ thêm): khung 2 vung tay trước ra ngang phía trước ngang ngực; khung 3 kéo tay trước
> xuống thấp chéo trước bụng; khung 4 hất tay trước lên cao phía trước, cao hơn đầu; khung 5 giơ hai tay qua đầu ra sau.
> Tay không được che mặt; tay sau thấy được một phần, có viền đen tách khỏi thân. Giữ nguyên nhân vật, màu, viền, cỡ, vị trí chân;
> nền xanh lá trơn #00ff00, mỗi ô 48×48 như ảnh gốc.

**Cu Lì – khung 5 và 6:**
> Ảnh gửi kèm là hàng chém kiếm 6 khung của bé Cu Lì (pixel art chibi, nhìn nghiêng sang phải). Chỉ vẽ lại khung 5 và 6 (viền đỏ), tay
> không (kiếm do game vẽ thêm). Khung 5: giơ hai tay cao qua đầu, cánh tay đi phía sau mép sau của đầu, mặt nhìn rõ hoàn toàn.
> Khung 6: hạ người bổ xuống, tay trước duỗi ra phía trước–dưới, nắm tay thấy rõ ở trước đầu gối, đầu vẫn ngẩng thấy mặt.
> Giữ nguyên nhân vật, màu da, tóc, viền đen, cỡ, vị trí chân như các khung còn lại; nền xanh lá trơn #00ff00, ô 48×48.

Khi nhập khung mới: số điểm ảnh khung đổi → bảng `SC.TAY_KIEM` tự bỏ qua khung đó, game dùng máy tự đo; nên đo lại bảng tay cho khung mới.

## 4. Ảnh trước / sau (phóng ×4)

Mỗi ảnh: trên = trước khi sửa, dưới = sau khi sửa. Hàng 1–3: ba nhát chém đứng yên (7 thời điểm mỗi nhát), hàng 4: vừa chạy vừa
chém, hàng 5: đứng / chạy không đánh (để thấy không hỏng).

- Cu Tí: [`anh/truoc-sau-smith.png`](anh/truoc-sau-smith.png)
- Cu Tèo: [`anh/truoc-sau-hunter.png`](anh/truoc-sau-hunter.png)
- Cu Lì: [`anh/truoc-sau-wrestler.png`](anh/truoc-sau-wrestler.png)
- Cái Bống: [`anh/truoc-sau-healer.png`](anh/truoc-sau-healer.png)
- Trong trận thật, có vệt chém (mỗi hàng 1 nhát, 4 em bé): [`anh/tran-truoc.png`](anh/tran-truoc.png) → [`anh/tran-sau.png`](anh/tran-sau.png)

## 5. Nghiệm thu

- Mặt: không còn kiếm đè lên mặt ở mọi khung thấy mặt; còn lại 2 khung tay AI tự che mặt (Cu Tí khung 5, Cu Lì khung 5) — cần vẽ lại ảnh.
- Không còn ô bàn tay code (tay thừa); tay AI nắm chuôi; kiếm lấy đà nằm sau thân, không xuyên đầu.
- Vệt chém không vòng qua đầu/mặt.
- `?kiemkhop=0`: ảnh chụp giống hệt trước từng điểm ảnh. Bản hai tệp (`linh-khi-nhe.html`, như web) chụp ra giống bản một tệp.
- 0 pageerror (chụp cận cảnh, chụp trận, `tests/anim_smoke.py`).

Công cụ: `kiem/chup.py <url> <thư mục>` (cận cảnh từng khung), `kiem/tran.py <url> <tệp>` (trong trận, có vệt).
