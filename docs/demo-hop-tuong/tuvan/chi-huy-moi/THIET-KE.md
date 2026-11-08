# CHỈ HUY MỚI (08/11) — mỗi bậc Trắng / Xanh / Tím / Vàng đều có chỉ huy

Người dùng duyệt ("Có"): thêm chỉ huy để bậc nào cũng có. Tư vấn ChatGPT (chat chữ, 12 ứng viên, 08/11) → chọn 5, chỉnh số cho hợp thang của game.
Đích: **2 Trắng · 2 Xanh · 2 Tím · 2 Vàng** (8 chỉ huy). Giá mana vẫn **×2 sau mỗi lần dùng**, như 3 chỉ huy cũ.

## Bảng chọn

| id | Tên kỹ năng | Bậc | Giá | Hồi chiêu | Tác dụng (số) | Vì sao vui |
|---|---|---|---|---|---|---|
| `tech` | **QUICK TUNE** | Trắng | 25 | 20 s | Mọi ụ Tấn công **1★–2★** đang có: **+40 % tốc bắn 10 s** (chụp danh sách lúc dùng; ụ băng/đá không nhận) | Đơn giản, công bằng: mạnh đầu trận, tự yếu đi khi bàn lên sao → câu hỏi "dùng mana cho Summon hay cho kỹ năng?" |
| `tide` | **DRAG NET** | Trắng | 30 | 24 s | Lưới trên **đường của mình**: quái **chậm 25 %** (trùm 12 %) **6 s** | Chỉ huy phòng thủ đầu tiên, dễ hiểu; chậm gộp kiểu nhân với ụ Băng, trần 90 % (trùm 50 %) |
| `hero` | REINFORCE | Xanh | 30 | 15 s | (giữ nguyên) 2 ụ 1★ miễn phí | — |
| `twin` | **TWIN SIGNAL** | Xanh | 35 | 22 s | **Chạm chỉ huy rồi chạm 1 ụ Tấn công** có "anh em" (cùng loại + cùng sao) trên bàn → cả cặp **+60 % sát thương 12 s**. Ghép 1 trong 2 ụ = mất buff | Đúng câu hỏi gốc của game: **giữ cặp để bắn hay ghép ngay?** |
| `dahlia` | RAGE | Tím | 40 | 25 s | (giữ nguyên) | — |
| `hawk` | **CROSSFIRE** | Tím | 45 | 28 s | **Chạm 1 ô**: hàng + cột qua ô đó (chữ thập, tối đa 7 ô). Đếm **số loại ụ khác nhau** trong chữ thập → mỗi ụ Tấn công trong đó **+20 % sát thương mỗi loại (tối đa +100 %) 10 s** | Thưởng xếp bàn **đa dạng** theo hàng/cột (họ hàng với Lửa Thập Tự): chọn ô giao nào lợi nhất |
| `eve` | HOLY SHIELD | Vàng | 40 | 25 s | (giữ nguyên) | — |
| `weaver` | **NEXUS LINK** | Vàng | 50 | 30 s | **Chạm 1 ụ Tấn công** (ụ chủ lực): nối tới **tối đa 3 ụ Hỗ trợ cùng hàng/cột, KHÔNG kề** (gần nhất trước, hoà → ô nhỏ). Mỗi dây: **+(15 + 5×sao Hỗ trợ) % sát thương + 10 % tốc** cho ụ chủ lực, **11 s**. Dây đứt nếu Hỗ trợ bị băng/đá, đổi chỗ, bị ghép; ghép ụ chủ lực = hết | Bài toán xếp bàn như Pháo La Bàn: đặt ụ chủ lực ở **ngã tư** của các ụ Hỗ trợ (3 dây 7★ = +150 % sát thương, +30 % tốc cho 1 ụ) |

Không chọn (để dành): LAST LINE, FOCUS LINK, KILL ZONE (gần trùng TWIN/CROSSFIRE), CHAIN REACTION, CATALYZE, GRID WARP (đảo hàng — dễ phá bàn), FUSION WINDOW (ghép +2★ — lăn cầu tuyết PVP).
Đổi tên so với ChatGPT: CROSS LINK → **NEXUS LINK** (khỏi lẫn với CROSSFIRE). Chỉnh số: TWIN 55 → 60 %, CROSSFIRE 4 loại → 5 loại (+100 %), NEXUS LINK dây = theo sao Hỗ trợ (không chép bảng buff kề phức tạp).

## Cách dùng (chạm)

- Trắng: chạm thẻ chỉ huy = dùng ngay (như cũ).
- Xanh TWIN / Tím CROSSFIRE / Vàng NEXUS: chạm thẻ → **chế độ ngắm** (ô hợp lệ sáng viền màu bậc, dải chữ "Tap a turret" / "Tap a cell"); chạm ô hợp lệ → dùng. Chạm lại thẻ, chạm ngoài bàn, hoặc 6 s → huỷ, **không trừ mana**. Không có ô hợp lệ → báo lý do (như "NOT ENOUGH MANA"), không vào ngắm.
- Máy (AI / bàn đối thủ / đồng đội máy) tự chọn đích tốt nhất (tất định: điểm số + ô nhỏ khi hoà).

## Luật chung (giữ luật game)

- Tất định: không `Math.random`; đích chọn bằng thứ tự ô; online gói `mv` mang thêm ô đích `o` → bàn con rối áp đúng ô.
- Buff có thời hạn (QUICK TUNE, TWIN, CROSSFIRE, NEXUS) **ở lại suốt thời gian** (không chỉ chớp); vào nhóm cộng gộp sát thương/tốc (`T.buf`), RAGE vẫn ×2 riêng.
- Ụ băng/đá: không nhận buff mới lúc dùng; dây NEXUS đứt khi Hỗ trợ bị băng/đá. Ụ Hỗ trợ **không bao giờ bắn** (chỉ là nguồn dây).
- Ghép = thân mới → mất buff chỉ huy (buff gắn với thân ụ). Tăng sao tại chỗ (Merge King…) KHÔNG phải ghép → giữ buff (TWIN: cặp vẫn tính theo thân ụ, không xét lại sao).
- DRAG NET: chậm gộp nhân với chậm có sẵn, trần 90 % (trùm 50 %); quái kháng chậm (`khangCham`) không bị; chỉ quái bàn đó bắn được (CO-OP: làn mình + đoạn chung; PVP: làn mình). Hiệu ứng vẽ dọc tim đường.
- PVP: không chỉ huy nào đụng ụ đối thủ → không có đòn "kết thúc trận".
- Đồng hồ tác dụng dừng lúc nghỉ giữa wave khi bàn không còn quái (như RAGE/khiên).

## Cách có (tối giản, an toàn)

| Bậc | Chỉ huy | Cách mở |
|---|---|---|
| Trắng | QUICK TUNE, DRAG NET | Miễn phí |
| Xanh | REINFORCE | Miễn phí (mặc định) |
| Xanh | TWIN SIGNAL | Kỷ lục **wave 15** HOẶC **150 ngọc** |
| Tím | RAGE | Miễn phí (đã có — không bao giờ lấy lại) |
| Tím | CROSSFIRE | Kỷ lục **wave 30** HOẶC **400 ngọc** |
| Vàng | HOLY SHIELD | Miễn phí (đã có) |
| Vàng | NEXUS LINK | Kỷ lục **wave 50** HOẶC **1000 ngọc** |

- Kỷ lục wave = `KT.s.tk.wave` (đã có, thành tựu wave 30/50 dùng chung). Mở bằng ngọc ngay ở bảng chọn chỉ huy (nút giá ngọc), lưu `turret_kt.mvMo`. Không có trong rương/vòng quay.
- Bản lưu cũ: `turret_bo.mv` = id cũ → nạp như cũ; id chưa mở (sửa tay) → về REINFORCE. Online: chỉ huy của bạn kia không kiểm (máy bạn đã kiểm).

## Hình

Chân dung "một thiên hà nhiều chủng tộc" (khác hẳn 3 chân dung cũ): QUICK TUNE — kỹ sư Terran tàn nhang, áo liền cam, kính bảo hộ, cờ lê sáng · DRAG NET — hộ vệ thủy triều Thalassi (vây ngọc lam, giáp ngọc trai, lưới sáng) · TWIN SIGNAL — nhạc trưởng người máy Synthari trắng-cyan, 2 bàn tay máy nối sợi sáng · CROSSFIRE — chiến lược gia chim ưng Ferrin, quân phục xanh đậm, tia ngắm đỏ chéo nhau · NEXUS LINK — người dệt plasma Voltari xanh cobalt, giáp pha lê vàng, nối 4 ngôi sao bằng sợi sáng.
Icon kỹ năng 5 cái (cờ lê, lưới, 2 tín hiệu, chữ thập ngắm, nút mạng). VFX: dùng lại vòng/hạt có sẵn + icon mới.
