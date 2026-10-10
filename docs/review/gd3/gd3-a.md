# Giai đoạn 3 — Nhóm 3A: Phòng và vòng lặp (nhánh `gd3-a`)

**Trạng thái:** đã sửa code, **chưa chạy bài kiểm tra nào** (theo yêu cầu của chủ dự án). Chỉ chạy `node --check` cho các file js đã sửa: đều qua.
Không đổi cấu trúc bản lưu (không thêm trường nào vào `G.save`). Không đụng hình ảnh. Tự ngắm vẫn vào quái gần nhất (không đổi).

## Đã sửa gì

| ID | Sửa gì | File / hàm | Số cũ → số mới |
|---|---|---|---|
| **V19** (Q10) — phòng mục tiêu | Mỗi ải **luôn** có đúng **một** phòng mục tiêu. Nếu phòng phụ bốc ra là Thử thách thì mục tiêu đặt ở đó; nếu là Thương nhân hay Lời nguyền thì **một phòng Đánh quái** mang mục tiêu (vẫn là phòng quái: cửa Trùm, mảnh chìa Kiểu C, Suối hồi tính như cũ). Vẫn 8 phòng, bộ loại phòng không đổi, bản đồ liên thông như cũ. Bố cục bản đồ của mỗi hạt giống **giữ nguyên** (mục tiêu dùng dãy ngẫu nhiên riêng). `M.check` kiểm thêm "đúng một phòng mục tiêu, nằm ở Thử thách hoặc Đánh quái". Ải hướng dẫn không có phòng mục tiêu. | `mapgen.js`: `GOALS`, `addGoal`, `M.make`, `M.check`; `stage.js`: `startStage`, `buildRoom`, `G.gotoRoom` | Phòng có mục tiêu khác: 1/3 số ải → **mọi ải** (trừ ải hướng dẫn) |
| V19 — kiểu "Trụ được 30 giây" | Hai kiểu mục tiêu, bốc 50/50: **"Hạ hết quái trong 30 giây"** (như cũ) và **"Trụ được 30 giây"**: quái ra theo đợt của phòng Thử thách, hết đợt mà chưa hết giờ thì thêm đợt nữa; hết giờ = dọn phòng (quái còn lại tan, vòng mọc đang chờ bị huỷ), thưởng như cũ (1 đá tôi hoặc 6 quặng + 80 vàng). Vào phòng có dòng báo mục tiêu; HUD ghi "Thử thách: trụ thêm N giây". Phòng Đánh quái mang mục tiêu dùng số đợt của phòng Thử thách (2 đợt) và có bệ đồng hồ cát. | `stage.js`: `buildRoom`, vòng `update` (phần đợt quái và đồng hồ), `clearRoom`, `drawHud` | Phòng Đánh quái mang mục tiêu: 3–4 đợt → 2 đợt (kiểu "hạ hết") hoặc đợt nối tiếp trong 30 giây (kiểu "trụ") |
| V19 — bùa hệ hết ải | Bùa hệ ở **Rương** kéo dài **đến hết ải** (bùa nằm trên em bé của lượt này nên ra khỏi ải là hết). Vũ khí đổi ở Suối hồi cũng được phủ bùa. HUD ghi "Bùa Lửa đến hết ải". Bùa của **Thương nhân** cũng đổi thành hết ải (cho thống nhất, giá giữ 80 vàng). Sửa chữ ở Rương và lời chỉ dẫn ải đầu. | `stage.js`: `COAT_STAGE`, `coatStage`, `rebuildWeapons`, `panelChest`, `panelMerchant`, `chestOptions`, `TUT.chest`, `drawHud` | 60 giây → hết ải |
| **V20** — mẫu vật mang hệ | `addEnv` xếp vật mang hệ theo 4 mẫu: **rải** 1–2 vật như cũ (40%), **hàng giữa** 3 vật cùng hệ ngang giữa phòng (20%), **bốn góc** cùng hệ (20%), **hai bên** 2 vật khác hệ trái/phải (20%). Chỗ nào của mẫu vướng lối cửa, vật khác hay chỗ đứng đầu phòng thì chỗ đó lấy ngẫu nhiên như cũ (luật tránh lối cửa tách ra hàm `spotOk`, dùng chung với `propSpot`). Không thêm va chạm vật cản. | `stage.js`: `spotOk` (mới), `propSpot`, `addEnv` | Trung bình ~1,5 vật/phòng → ~2,4 vật/phòng |
| **V51** | Tối đa **2 xạ thủ** mỗi đợt. | `stage.js` `buildWaves` | không chặn → ≤ 2 |
| **V52** | `freeSpot` thử nhiều chỗ hơn; thêm: chỗ cách vật mang hệ < 14 điểm ảnh bị coi là không đạt (bớt quái mọc đè vật). | `stage.js` `freeSpot` | 14 → **30** lần thử |
| **V56** | Vũ khí rơi khi rương đồ đầy: dòng báo ghi rõ "**Kiếm Tím bị đổi thành 90 vàng vì rương đầy**" (màn kết quả, dòng "Trong ải", và dòng báo trên trận khi tinh anh rơi). | `stage.js`: `G.giveWeapon` (ghi `G.lastSold`), `G.soldText` (mới), `G.onEliteDown`, `settle`, `panelChest` | "vàng (rương đồ đầy)" → tên + bậc + số vàng |
| **V57** | Bảng vàng: trong khung "kỷ lục của con" (khi không có mạng) hàng **thời gian hạ trùm** lên **trước** ba ô Sức mạnh / Tổng sao / Xa nhất. Bảng xếp hạng trên mạng **vẫn một bảng Sức mạnh** vì trong code có ghi chủ dự án đã chọn "chỉ MỘT bảng"; thêm công tắc `B.TRUM_TRUOC` (đang `false`): đổi thành `true` thì có thẻ thời gian hạ từng trùm, đặt **trước** thẻ Sức mạnh. | `bang_vang.js`: `cats`, `B.panel` | — |
| **V59** | Thương nhân: thay "3 quặng / 100 vàng" bằng **Huyết ấn** — món chỉ có trong ải: trả **25% máu tối đa** (không tốn vàng; chỉ mua được khi máu > 35%) để **dấu ấn ×1,5 đến hết ải** (cộng dồn với Lời nguyền). Lời chỉ dẫn ải đầu sửa theo. | `stage.js` `panelMerchant`, `TUT.merchant` | 3 quặng → Huyết ấn |

Sửa kèm bài kiểm tra (chưa chạy): `tests/setup.js` `G.testGoto` ưu tiên phòng cùng loại **không** mang mục tiêu (để bài kiểm phòng Đánh quái thường không rơi nhầm vào phòng thử thách); `tests/room_shots.py` chữ chú thích Thương nhân.

## Cần kiểm tra khi test (TONG-HOP mục 4 dòng 3A)

- `tests/mapgen.py`: `M.check` nay đòi đúng một phòng mục tiêu → mọi hạt giống phải đạt; ba ca "bắt lỗi" vẫn bắt được.
- `tests/doors.py`: phòng thử thách (dòng 71–75) — nếu bốc phải kiểu "trụ", hàm `clear()` phải chờ đủ 30 giây trong game mới xong (có 4000 vòng nên vẫn đủ). Kiểu C: phòng chìa mang mục tiêu "trụ" vẫn cho mảnh chìa khi hết giờ.
- `au_mapgen.py`: đếm số ải có phòng mục tiêu (phải là 100%), bộ loại phòng không đổi (vẫn 3 bộ), đếm quái mọc "gần em bé" (V52, kỳ vọng < 0,6%) và "đè vật" (kỳ vọng giảm dù số vật tăng).
- `tests/env_rooms.py`, `room_shots.py`: nhìn 4 mẫu vật (hàng giữa, bốn góc, hai bên, rải) — không vật nào chắn lối cửa, không đè bệ đồng hồ cát.
- `tests/cay.py 12`: tổng thời gian vẫn 2,5–4 giờ. Điểm dễ lệch: (1) bùa hết ải cho 100% gây hệ cả ải → mạnh hơn, trùm học hệ nhanh hơn; (2) phòng Đánh quái mang mục tiêu ít đợt hơn và có thêm thưởng (80 vàng + đá/quặng) ở ~2/3 số ải; (3) nhiều vật mang hệ hơn. `tests/cay.py --nhanh`, `tests/quai.py` cho V51.
- `tests/ui_input.py` (dòng 255–275): bảng Thương nhân vẫn mua được bình máu ở ô đầu; ô thứ ba nay là Huyết ấn.
- Chơi tay 5 ải: thấy dòng báo mục tiêu khi vào phòng, đồng hồ "trụ thêm N giây" chạy, hết giờ quái tan và cửa mở; bùa ở Rương hiện "đến hết ải" và còn sau khi đổi vũ khí ở Suối hồi; rương đồ đầy (12 món) → dòng báo ghi tên + bậc + vàng; bảng vàng khi tắt mạng.

## Việc còn lại / ngoài phạm vi 3A

- **Bản đồ nhỏ** (`minimap.js`, không thuộc 3A): phòng Đánh quái mang mục tiêu vẫn vẽ như phòng Đánh quái. Nếu muốn có biểu tượng đồng hồ cát cho phòng này: đọc `S.map.rooms[id].goal`.
- **V57**: chủ dự án quyết có bật `B.TRUM_TRUOC = true` (bảng thời gian hạ trùm lên trước) hay giữ một bảng Sức mạnh như đã chọn trước đây.
