# Báo cáo B — Cảm giác đánh 4 món + Đòn nối khi đổi vũ khí (16/10)

Theo góp ý ChatGPT (GOP-Y-CHATGPT.md mục 1, 5, 6) và QUYET-DINH.md của chủ game. **Không đổi** nhịp đánh, sát thương, tầm (`G.MOVES`, `G.WTYPES` giữ nguyên). Không thêm hình vẽ bằng code trong trận: chỉ dời mốc khung ảnh có sẵn và dùng lớp nháy có sẵn của ô vũ khí.

## Tóm tắt

| Việc | Đã làm | Cờ tắt |
|---|---|---|
| Khựng hình theo món | kiếm 45 / nhát kết 70 ms, thương đâm 55 / quét 65, búa 90 / nện đất 110 (đánh trùm 50), phi tiêu 25 / ném chùm 35 | `?camgiac=0` |
| Bù nhịp | phần khựng **dài hơn số cũ** được trả lại cho đồng hồ đòn ngay sau đó | `?bukhung=0` |
| Đẩy lùi theo món | kiếm 4 (nặng 5) px, thương 2,5 (3), búa 10 (12) + choáng như cũ, phi tiêu 1 | `?camgiac=0` |
| Búa báo trước | khung "búa giơ cao" giữ ~0,24 giây trước nhát nện (trước 0,16) | `?camgiac=0` |
| Đòn nối | đổi vũ khí trong 0,18 giây sau khi trúng → món mới tự ra 1 đòn = **60%** đòn đầu chuỗi (hạ từ 70%, xem dưới) | `?donnoi=0` |
| Nháy ô vũ khí | ô món vừa đổi nháy 0,08 giây (lớp nháy có sẵn của ô) | luôn bật (chỉ là giao diện) |

DPS trên bia của mỗi món sau Việc 1 lệch **≤ 2%** so với trước (128 hạt giống). Đòn nối dùng tối ưu tăng sát thương tối đa **+6,7%** (≤ 8%). Thời gian cày 15 ải: 184 → 189 phút (+2,7%, trong nhiễu).

## Việc 1 — Cảm giác đánh

### Khựng hình hiện tại làm gì
`fx.js` `stop(ms)`: khi đòn trúng, **cả thế giới** đứng yên `ms` (gồm cả đồng hồ đòn của Tí), có trần 150 ms mỗi 0,5 giây, lần sau trong cửa sổ x0,6. Bot đo cân bằng (`G.sim`) không vẽ nên **không có** khựng; khi chơi thật, khựng làm nhịp đánh chậm đi (đo được: kiếm −13%, thương −9%, búa −8%, phi tiêu −7%).

### Chọn gì và vì sao
Khựng mới dài hơn ở thương đâm (45 → 55) và búa (70 → 90), ngắn hơn ở nhát kết kiếm / quét thương (90 → 70 / 65) và phi tiêu ném chùm (50 → 35). Để món nào dài hơn cũng **không tụt DPS**, tôi chọn **"khựng hình, trả lại đồng hồ đòn"**:
- Hình vẫn khựng đủ (cả Tí lẫn quái đứng yên đúng số ms mới — cảm giác nặng tay như yêu cầu).
- Phần khựng **dài hơn số cũ** của chính đòn đó (ví dụ búa: 90 − 70 = 20 ms, tức 22% mỗi lần khựng) được ghi thành "nợ"; ngay sau khi hết khựng, đồng hồ đòn (`P.atkT`, `P.cdT`) chạy nhanh hơn tối đa 50% cho tới khi trả hết. Động tác vẫn liền mạch, chỉ phần thu tay nhanh hơn vài ms.
- Không chọn "không khựng đồng hồ đòn trong lúc khựng" vì khi hết khựng tư thế Tí sẽ **nhảy cóc** 5–7 khung (thấy rõ ở búa).
- Phần ngắn hơn số cũ thì giữ lợi (không làm chậm lại cho bằng) — nhịp chỉ tăng ≤ 1,6%.

Trùm: búa đánh trùm chỉ khựng 50 ms. Chí mạng +25 ms (≤ 115), kết liễu +15 ms (≤ 100) như bậc cũ.

### Đẩy lùi
`G.DAY_VK` (js/combat.js): kiếm [4, 5], thương [2,5, 3], búa [10, 12], phi tiêu [1, 1] điểm ảnh ([thường, nặng/chí mạng]). Vẫn giữ trần **80% tầm vũ khí** nên nhát sau của chuỗi không hụt. Trùm, quái giáp nhân 0,2 (búa lên trùm ≈ 2,4 px), tinh anh 0,5. Đòn kết có quãng riêng trong `G.MOVES` (kiếm 10, quét 8, đâm 3 đẩy 6) **giữ nguyên**.

Bot kiểm (tests/cam_giac_vk.test.js mục 4): quái đứng yên chỉ bị đẩy, đánh 8 giây — kiếm 26/26, thương 23/23, búa 10/10 lúc chạm đều trúng.

### Búa báo trước
`js/zed_moi.js`: hàng ảnh `bua_nen` có 8 khung, khung 2 là búa giơ cao quá đầu. Mốc cũ: khung 1 (vào thế) 0–0,15, khung 2 0,15–0,35. Mốc mới: khung 1 0–0,05, khung 2 **0,05–0,35** (giữ ~0,24 giây). Lúc chạm (0,35 = 0,28 giây) và thời lượng 0,8 giây không đổi. Ảnh so sánh: `anh-B/bua-bao-truoc-moi.png` / `-cu.png`.

### Bảng DPS trước / sau (Việc 1, chưa tính đòn nối)

Đo bằng `tests/dps.py 60 128 khonghe --node` (bia tập kiểu cũ, 60 giây x 128 hạt giống, cùng hạt giống). "Trước" = cờ tắt (`G.CAM_GIAC_VK=false`, đã kiểm trùng đúng số với mã cũ). Đòn nối tắt khi đo để tách riêng.

| Món | Logic (bot cân bằng) trước → sau | Thật (có khựng, `that`) trước → sau | Giữ món chính (`DPS_MON=1`) trước → sau |
|---|---|---|---|
| Kiếm | 62,3 → 63,3 (+1,6%) | 54,3 → 54,9 (+1,1%) | 62,3 → 63,3 (+1,6%) |
| Phi tiêu | 48,4 → 48,4 (0%) | 45,2 → 45,7 (+1,1%) | 48,4 → 48,4 (0%) |
| Thương | 42,7 → 42,5 (−0,5%) | 39,0 → 38,5 (−1,3%) | 59,0 → 58,8 (−0,3%) |
| Búa | 41,7 → 40,9 (−1,9%) | 38,5 → 38,4 (−0,3%) | 51,2 → 52,2 (+2,0%) |

Ghi chú đo:
- Với 48 hạt giống nhiễu tới ±3% (kiếm từng ra +4,6% rồi về +1,6% ở 128 hạt giống), nên số chốt dùng 128.
- Mặc định `dps.py` cho bot món chính Kiếm + phụ Phi tiêu, nên khi đo Thương / Búa bot đổi qua lại liên tục (số Thương / Búa là số trộn). Cột "Giữ món chính" sửa điều đó (cờ mới `DPS_MON=1`, mặc định không đổi).
- Lệnh mặc định `python3 tests/dps.py --node` **đã "không đạt" từ trước** (cung không thấp nhất, cận chiến lệch 25%) — trước và sau như nhau, không do phiên này.

## Việc 2 — Đòn nối khi đổi vũ khí

### Luật (js/combat.js `G.DON_NOI_SO`, js/moves.js `M.donNoi`)
- Đòn đánh / đặc biệt trúng → mở cửa sổ **0,18 giây** (mưa phi tiêu và chính đòn nối không mở).
- Đổi vũ khí trong cửa sổ → món mới **đánh ngay** một đòn = `k` x đòn thường đầu chuỗi: kiếm Chém ngang, thương Đâm, búa Nện (hộp trúng của đòn đó), phi tiêu Ném (một phát, không xuyên).
- Không tốn và **không cộng** mana, không ra Đặc biệt, không mở luật hệ (vệt cháy, nổ, vỡ băng, tách độc…), gây hệ với **nửa** tỉ lệ thường, 1 tầng; không dùng lượt "đổi xong chắc chắn gây hệ"; búa vẫn không choáng trùm.
- Không đặt thời gian chờ đòn: đánh tiếp được ngay (đồng hồ đòn giữ nguyên). Tư thế: mượn khung ảnh có sẵn của đòn đó từ lúc chạm tới hết, rút còn ~0,14 giây.
- Mỗi món làm đòn nối **một lần trong một chuỗi**; chuỗi hết khi quá 1,5 giây kể từ đòn nối gần nhất.
- Thời gian chờ đổi giữ **0,75 giây**. Đổi xong ô vũ khí nháy 0,08 giây (lớp nháy có sẵn của `G.btnArt.slot`, thêm tham số `flashDur`).

### Đo bằng bot (128 hạt giống, giữ món chính, đánh 60 giây)
"Đổi nối tối ưu" (`DPS_NOI=1`): vừa trúng, hết chờ đổi, món kế chưa nối → bấm đổi ngay; sau đó bot tự đổi về món chính.

| Món chính | Không đổi (chơi thường) | Đổi theo nhịp, không đòn nối | Đổi theo nhịp + đòn nối k=0,6 | Tăng so với cách chơi tốt nhất không đòn nối |
|---|---|---|---|---|
| Kiếm | 63,3 | 50,4 | 55,2 | 0% (đứng yên đánh kiếm vẫn hơn) |
| Phi tiêu | 48,4 | 52,1 | 55,6 | **+6,7%** |
| Thương | 58,8 | 47,7 | 53,4 | 0% (giữ thương vẫn hơn) |
| Búa | 52,2 | 50,3 | 54,5 | +4,4% |

- Với **k = 0,7** (số góp ý): phi tiêu +9,0%, búa +9,0% (128 hạt giống) → **vượt 8%**, nên hạ còn **k = 0,6** (đã thử 0,55: 6,9% / 6,3%, khác 0,6 trong nhiễu). Số nằm ở `G.DON_NOI_SO.k`.
- Riêng phần đòn nối (cùng lối đổi, có / không đòn nối): +6,7% đến +11,9% — tức đòn nối bù gần hết cái thiệt của việc đổi vũ khí, nhưng chỉ vượt cách chơi tốt nhất ≤ 6,7%.
- Bot cân bằng mặc định (không cố đổi nối) đôi khi ra đòn nối ngẫu nhiên vì nó tự xoay món: Thương 42,5 → 45,0, Búa 40,9 → 42,6 trong lệnh mặc định (số trộn, xem ghi chú trên).

### Thời gian cày (`tests/cay.py 12 --node`, 12 lượt chiến dịch, 15 ải)
| | Trung bình | Trung vị | Lần chơi |
|---|---|---|---|
| Trước (cờ tắt) | 184 phút | 187 | 39 |
| Sau (mặc định) | 189 phút (+2,7%) | 188 | 40 |
| Sau, bot cố đổi nối mọi lúc | 210 phút (+14%) | 207 | 43 |

Bot cày chỉ nâng Kiếm + Phi tiêu; cố đổi nối làm nó cầm cả Thương / Búa chưa nâng nên **chậm hơn** — đòn nối không làm cày nhanh lên. Không ải nào "không đạt".

## Cách tắt
- `?camgiac=0` — khựng hình, đẩy lùi, khung búa về như cũ.
- `?bukhung=0` — giữ khựng mới nhưng không trả lại thời gian cho đồng hồ đòn.
- `?donnoi=0` — tắt đòn nối (nháy ô 0,08 giây vẫn có).
- Trong mã: `G.CAM_GIAC_VK`, `G.BU_KHUNG`, `G.DON_NOI`; số: `G.KHUNG_VK`, `G.DAY_VK`, `G.DON_NOI_SO`.

## Kiểm tra
- `node --check` mọi tệp js/*.js, tests/*.js: đạt. `python3 build.py` và `--hai-tep`: đạt (dựng lại dist).
- `tests/smoke.py`: 0 lỗi. Mọi `tests/*.test.js` đạt (mới: `tests/cam_giac_vk.test.js` 24 mục; `cam_giac_danh.test.js` sửa câu chữ quãng lùi kiếm).
- `tests/moves.py`: 85/93 — 8 mục SAI **giống hệt bản trước khi sửa** (đã chạy lại trên mã cũ để so).
- Ảnh headless: `tests/cam_giac_vk_shots.py` → `anh-B/bua-bao-truoc-moi.png`, `bua-bao-truoc-cu.png`, `don-noi.png`, `don-noi-tran.png`.
- Công cụ đo thêm vào `tests/dps.py` (mặc định không đổi): `that` (chạy như có vẽ, có khựng), `DPS_VK=` (đo vài món), `DPS_MON=1` (giữ món chính), `DPS_NOI=1` (bot đổi nối tối ưu).

## Rủi ro
- **Đẩy lùi đổi vị trí quái** → đổi luật chơi một chút: búa đẩy 10 px làm quái thường giãn ra khỏi nhau; đo DPS búa −1,9% … +2,0% tuỳ cách đo (trong ngưỡng 3%).
- **Trả nợ khựng**: phần thu tay của đòn ngay sau khựng dài có thể nhanh hơn ~10 ms; nếu thấy "giật" thì `?bukhung=0` (búa khi đó chậm ~2% khi chơi thật).
- **Đòn nối với 2 món** (đa số người chơi chỉ nâng 2 món): chuỗi 1,5 giây + chờ đổi 0,75 giây nên tối đa khoảng 1 đòn nối / 0,75 giây khi xoay liên tục. Nếu người chơi thật tìm ra nhịp tốt hơn bot (ví dụ đổi đúng lúc phi tiêu vừa trúng rồi về kiếm), mức tăng có thể nhỉnh hơn 6,7% — theo dõi; hạ `G.DON_NOI_SO.k` là đủ.
- Đòn nối của phi tiêu ném ngay trong khung đổi nên nếu đổi lúc đang khựng hình, phát ném ra sau khựng (nút đổi được giữ lại, như mọi nút khác).
- Bot chỉ đo bia tập; chưa đo riêng trên trùm (đòn nối không choáng trùm, búa lên trùm đẩy ~2 px).
