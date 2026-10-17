# Báo cáo JUMP – Lam từ sheet ChatGPT → pixel **cao 64, ô 80×80**, pivot [40,79], 4 khung · 10 FPS · non-loop giữ F3

Nguồn: `jump-sheet-v1.png` (2079×756), `jump-sheet-v2.png`, `jump-sheet-v3.png` (2172×724) – mỗi sheet 4 nhân vật cao 418–561 px, nền trong suốt viền mềm (mặt nạ = alpha ≥ 128). Script: **`tools/chatgpt-anim-to-px.py`** (mới – dùng lại các bước thu/khoá màu/dọn/ổn định của `chatgpt-sheet-to-px.py`, thêm dò mắt mới, tỉ lệ theo cỡ đầu, căn theo khung chống đất/bay do mình chỉ định; xem đầu file). `chatgpt-sheet-to-px.py` **không đổi**. Phiên Run đã có sẵn script + `run64/` khi phiên này bắt đầu nên không phải đợi.

```
python3 tools/chatgpt-anim-to-px.py --sheet art/nhan-vat/lam-chatgpt/jump-sheet-v3.png --so-khung 4 --ra art/nhan-vat/lam-chatgpt/jump64 \
  --ten jump --fps 10 --chong-dat 0,1 --khung-cao-chuan 1 --do-cao 0,-8,-18,-26          # (v1, v2: --ra jump64/v1, jump64/v2 --khong-anh)
python3 tools/lam-anim-64-ghep.py so-sanh-jump
```

Xem: **`so-sanh-jump-v1-v2-v3-x4.png`** (3 bản, số hàng mắt/chân từng khung), `jump-x4.png` / `jump-x8.png` (số khung + ms), `jump.gif` (×4, 10 FPS – **GIF lặp để xem, trong game non-loop giữ F3**), `so-sanh-goc-x4.png`, `chong-silhouette.png`, `trong-game-x1.png`/`-x4.png` (480×270, pivot đặt ở y = 241 + 0/−8/−18/−26), `lat-check.png`, `kiem-tra.json`. Bản không chọn: `v1/`, `v2/` (4 khung PNG + kiem-tra.json). Sheet game: `game/anim/lam-chatgpt-80.png` hàng 2 + `lam-chatgpt-80.anim.json` (`jump: row 2, 4 khung, 10 fps, loop false`).

## Chọn bản nào – **v3**

| | v1 | v2 | **v3 (chọn)** |
|---|---|---|---|
| F0 khuỵu | có (mắt hàng 46) | có (46) nhưng thân gập về trước, ngực bị mép mũ che | có (46), chân rộng, kiếm hạ thấp |
| F1 bật duỗi | **không** – gần như đứng yên (giống idle) | thân ngả tới, chân ra sau (trông như đã bay) | **có** – chân trước/sau choãi, thân đổ tới đạp đất |
| F2 gối bắt đầu co | chân thẳng buông xuống | chân kéo sau, hơi gập | chân kéo sau, mũi chân duỗi |
| F3 gối co rõ | hơi co (chân +3 so pivot) | co (+6) | **co rõ (+11)** |
| Đầu thẳng hàng F1–F3 | hàng mắt 37/37/37 | 37/37/37 | 33/33/33 |
| Đọc như một cú nhảy? | yếu (đứng → đứng → hơi co) | được, F0 lạ | **rõ nhất** |

v3 đọc đúng trình tự khuỵu → đạp → bay → co gối; v1 hai khung giữa gần như đứng; v2 F0 vẽ gập người bất thường. Mọi số liệu cả 3 bản ở `v1/kiem-tra.json`, `v2/kiem-tra.json`, `kiem-tra.json`.

## Tỉ lệ thu (điểm cần biết)

ChatGPT vẽ Lam ở sheet jump **đầu to hơn** sheet run một chút. Script đo 2 cách: theo **cỡ đầu** (mắt → đỉnh mũ = 19,5 px như Run 64 → s = 0,1269) và theo **chiều cao** (F1 cao 64 → s = 0,1199), lấy trung bình nhân **s = 0,1233** → đầu 19,0 px (Run 19,5), cao ra F0 54 / F1 66 / F2 68 / F3 54. Thu đa số khối (điểm 154) thắng nearest (406). 12 màu bảng, alpha chỉ 0/255 (kiểm từng file).

## Căn – theo đúng yêu cầu, KHÔNG dịch sprite lên

* Ngang: tâm 2 mắt → **cột 48 ở cả 4 khung** (cùng cột Run 64 → không trượt ngang khi đổi animation).
* F0, F1 chống đất: đáy ủng = **hàng 79**. F2, F3 bay: **giữ hàng mắt = 33 của F1** (không nâng sprite); chân ở đâu thì ở đó.

| Khung | hàng mắt | đáy chân | so pivot | bbox (x0,y0→x1,y1) | cao×rộng | px | màu | mắt tự giữ | đạt? |
|---|---|---|---|---|---|---|---|---|---|
| F0 khuỵu | 46 | **79** | 0 | 1,26→69,79 | 54×69 | 1972 | 11 | có | khuỵu ✓, nhưng thân hạ **13 px** (tiêu chí 1–2 px) |
| F1 bật | 33 | **79** | 0 | 7,14→72,79 | 66×66 | 2078 | 12 | có | ✓ |
| F2 bay lên | 33 | 79 | **0** | 11,14→75,79 | 66×65 | 1881 | 11 | có | **chưa** – chân vẫn chạm hàng 79 (xem Thẳng thắn 1) |
| F3 gần đỉnh | 33 | 68 | **+11** | 14,15→69,68 | 54×56 | 1566 | 11 | có | co rõ ✓, nhưng vượt mức 2–5 px |

Lật: 4/4 khung lệch 0, 0 pixel sai. Không pixel nào rơi ngoài ô 80. Ổn định thời gian vùng đầu: 46/59/54/46 px. Sai khác khung kề: 2347 (F0→F1, khuỵu→bật là bước lớn nhất, đúng ý) · 1351 · 1297. `anim2d.html` headless: nạp sheet 640×400, chọn jump, "Kiểm lật" ĐẠT, 0 lỗi JS (`anim2d-check.png`).

## Tiêu chí (docs/tieu-chi-animation-lam.md §2)

* F0 khuỵu, thân hạ: **đạt một nửa** – khuỵu rõ nhưng hạ 13 px thay vì 1–2 px (ChatGPT vẽ ngồi thấp hẳn).
* F1 bật, chân duỗi, thân vươn: đạt.
* F2 bay lên, gối bắt đầu co, áo trễ: **chưa đạt** phần chân (chân còn chạm 79); áo choàng trễ xuống: đạt.
* F3 gối co rõ, thân ổn định: đạt (co 11 px – nhiều hơn 2–5 px).
* Tay xa cầm kiếm, không đổi tay: kiếm **ở tay gần camera** (cùng lỗi với Run – ChatGPT vẽ kiếm trước ngực), không đổi tay ✓.
* Chuông không rời chỗ gắn: đạt (F3 chuông hơi nhỏ lại, 32 px vàng so với 45–53).
* Pivot [40,79] cố định, không dịch sprite lên: đạt. Non-loop giữ F3: JSON `loop:false` ✓.
* Xuất PNG/sheet/JSON/GIF, alpha, bảng màu, lật: đạt.

## Thẳng thắn

1. **F2 không "bay"**: ở cả 3 bản ChatGPT vẽ F2 với chân duỗi dài hơn F1 (nguồn F2 cao 549 vs F1 534). Giữ đầu ngang F1 thì chân chạm đúng hàng 79 → F2 trông như "đạp hết cỡ" chứ chưa rời đất. Muốn chân cao hơn pivot thì phải dịch sprite lên (bị cấm) – nên để nguyên và ghi nhận. Trong game F2 phát ở độ cao −18 px theo physics nên vẫn ổn trên màn (xem `trong-game-x4.png`).
2. **Khuỵu quá sâu** F0: đầu tụt 13 px so với F1 và 10 px so với idle (run-0). Chuyển idle → jump sẽ thấy giật đầu xuống 10 px trong 1 khung (100 ms); là anticipation nên chấp nhận được nhưng mạnh hơn tiêu chí.
3. **Đầu to hơn Run** ~ 6 % ở nguồn; đã chia đôi sai lệch (đầu 19,0 vs 19,5 px) – nhìn chuỗi không thấy pop đầu.
4. **F3 co gối 11 px** (tiêu chí 2–5): ChatGPT vẽ tư thế ôm gối; chuyển sang fall F0 (chân 75) chân "thả" xuống 7 px trong 1 khung – thấy được nhưng hợp lý (bắt đầu rơi thì duỗi chân).
5. Kiếm tay gần, chuông ở vai gần – sai thiết kế gốc như Run, chưa sửa.
6. Idle vẫn tạm = run-0.

**Prompt gen lại (nếu cần, ngắn):** "Same character, same size as run sheet. 4-frame jump, side view facing right, transparent background: F0 slight crouch (knees bent, body only 2 px lower), F1 push-off legs fully extended toes on ground, F2 rising with both knees starting to bend feet clearly off ground, F3 near apex knees tucked moderately. Keep head at the same height in F1–F3. Sword in the far hand."
