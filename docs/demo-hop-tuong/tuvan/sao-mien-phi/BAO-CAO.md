# Rà soát "tăng sao / thưởng không tốn mana" — báo cáo (09/11)

Yêu cầu người dùng: *"rà soát chỉnh sửa 1 chút về các cơ chế có thể tăng sao, thưởng tăng sao… hạn chế những cái đó, vì những cái đó khiến người chơi không cần quá nhiều mana vẫn có thể tăng tiến sức mạnh được"* và *"tôi đang không biết các cơ chế nào sinh ra ụ mới khi ghép, và cơ chế ẩn thưởng của nó nên không tư vấn được"*.

Người dùng chốt 14:08: **không** đặt trần 5★ chung; Gold King giữ +2★; Evolver giữ nở +1★; Genesis Core, Merge King giữ nguyên; Star Lift chỉ đưa số + phương án (mục 3). Làm: Pandora giảm tỉ lệ quà +★, Hex Saboteur ngoài PVP thôi +★.

## 1. Đã sửa trong code

| Ụ | Trước | Sau | Lý do / bù |
|---|---|---|---|
| **Pandora Vault** (Hộp Pandora, Vàng) — kết quả "STAR GIFT" (quà +1★, chữ nổi VAULT STAR / ALLY STAR) | Túi 6 kết quả, mỗi 6 lần mở chắc chắn có 1 lần +1★ (1/6) | +1★ chỉ có ở vòng túi **lẻ** (lần mở 1–6, 13–18…): **1/12 lần mở**. Vòng chẵn ô +★ đổi thành **bom kho báu lần 2** (5 quả, sát thương như bom thường) | Bù bằng sát thương, không bù bằng mana / sao. Vẫn tất định (túi theo hạt giống trận), online hai máy giống nhau. |
| **Hex Saboteur** (Kẻ Nguyền, Vàng) — chơi nhóm (co-op) | Trúng: 1 ụ đồng đội +1★ | Trúng: 1 ụ **bắn** của đồng đội **+50% tốc bắn trong 6 giây**; không đổi sao | Solo vốn đã không +★ (làm chậm + yếu quái đầu) — giữ nguyên. PVP giữ −1★ đối thủ. |

Đã cập nhật mô tả ụ (trang ụ, bảng kỹ năng, câu ngắn họ ụ, clip minh hoạ Hex), bản dịch tiếng Việt (`vi.json` → `ngonngu-vi.js`), test `tools/thap-kt-vang-moi2.js` (ca co-op Hex).

## 2. Số đo (mô phỏng)

Công cụ mới: `node tools/thap-do-sao-mien-phi.js chitiet [số hạt] [wave]` (bọc mọi kỹ năng ghép / cập nhật / chạm, chỉ huy, chiêu trùm, quái chết; ghi chênh lệch ★ trên bàn, số ụ, mana). Bản đầy đủ: [`so-do-mo-phong.txt`](so-do-mo-phong.txt).

Cách đo: SOLO, AI của game tự chơi bàn người chơi, 3 hạt giống, tới wave 30 hoặc thua (AI thường thua ở wave 15–27). Bộ bài = Gatling + Compass Cannon + Set (3 ụ nền) + **2 ụ cần đo**; chỉ huy REINFORCE. Số là **trung bình 1 trận** với bộ bài có ụ đó — người chơi thật ghép khéo hơn AI nên số thật có thể cao hơn; ụ hiếm khi được AI ghép (Pandora, Copycat) thì số thấp hơn thực tế.

Mốc so sánh — trận không có ụ "cho không" nào (bộ nền): wave ~18, mana giết quái ~9 500, ~41 lần triệu hồi tốn mana.

Pandora trước → sau: quà +1★ từ 1/6 → 1/12 lần mở. Trong mô phỏng AI chỉ mở ~4 lần/trận nên cả hai vẫn ra ~0,7★/trận (lần mở đầu vẫn ở vòng có +★); trận dài, mở nhiều (ví dụ 18 lần) thì 3★ → 1–2★.

## 3. Star Lift (Bệ Nâng Sao) — chưa sửa, để người dùng chọn

Hiện tại: từ 5★, cứ 2 wave ụ kề thấp sao nhất được 1 nấc; 3 nấc = +1★ (7★: 2 nấc). Tức 1 Star Lift ≥5★ cho **+1★ mỗi 6 wave** (7★: mỗi 4 wave), không giới hạn số lần, nâng được tới 7★. Mô phỏng: AI không đưa Star Lift lên 5★ trước khi thua nên đo được 0; tính tay: có Star Lift 5★ từ wave 15 → tới wave 50 thêm ~6★ cho ụ kề, tới wave 70 ~9★.

- **Phương án A — giữ nguyên.** Đã cần ụ 5★ (tốn ~16 ụ 1★ ghép lên), tốc độ chậm.
- **Phương án B — gấp đôi nấc:** 6 nấc = +1★ (7★: 4) → +1★ mỗi 12 wave (7★: 8 wave). Bù: tăng tốc bắn ô kề +10%/★ → +12%/★.
- **Phương án C — không nâng ụ đã 5★ trở lên:** nấc chỉ dồn vào ụ ≤4★ (vẫn mỗi 6 wave) → không tạo 6–7★ miễn phí, nhưng vẫn giúp ụ thấp đuổi kịp.

## 4. BẢNG TỔNG — mọi cách có thêm ụ / thêm ★ / thêm mana / thêm mạng **không qua "triệu hồi + ghép thường"**

Đọc bảng: **Tốn mana?** = người chơi có phải trả mana cho chính lần thưởng đó không (ụ thì lúc nào cũng phải triệu hồi bằng mana trước đã). **Mức cho không**: *thấp* = gần như không đổi sức mạnh / đổi bằng thứ khác; *vừa* = rõ nhưng có điều kiện; *cao* = sức mạnh lớn, đều đặn, không tốn gì thêm. Số "mỗi trận" lấy từ mô phỏng mục 2 (trận SOLO ~15–27 wave), "—" = AI không dùng nên chưa có số, ghi cách tính tay.

### (a) Khi GHÉP: sinh thêm ụ mới, hoặc kết quả khác ghép thường

Ghép thường = 2 ụ cùng loại cùng sao → 1 ụ **ngẫu nhiên trong bộ bài**, sao +1.

| Ụ (tên trong game) | Bậc | Khi nào | Được gì | Mỗi trận (mô phỏng) | Tốn mana? | Mức cho không |
|---|---|---|---|---|---|---|
| **Twin Maker** (Máy Sinh Đôi) | Vàng | Ghép 2 Twin Maker (hoặc ghép thật có Twin Maker) | Thêm **1 ụ ngẫu nhiên cùng sao** với 2 ụ đem ghép; 10% (thẻ cao tới 16%) ụ đó cao hơn 1★ | ~15 ụ thêm, **+27★** | Không | **Cao** (nhiều nhất nhóm ghép) |
| **Cloner** (Máy Nhân Bản) | Tím | Ghép 2 Cloner | Thêm 1 ụ 1★ (2★ nếu ghép ra ≥3★); không làm tăng giá triệu hồi | ~8 ụ, +10★ | Không | Vừa |
| **Merge King** (Vua Ghép) | Vàng | Kéo lên ụ cùng sao (kể cả ô đá/băng) | Ụ đó +1★ **giữ nguyên loại** (ghép thường thì ra loại ngẫu nhiên) | 7–13 lần kéo | Không thêm (vẫn mất 1 ụ như ghép) | Thấp (bằng ghép thường, chỉ được giữ loại) |
| **Merge King VÀNG** (Gold King) | Vàng | 10% Merge King xuất hiện là bản vàng (thẻ cao tới 22%) | Kéo lên: **+2★** | +0,7 … +4,7★ hơn ghép thường | Không | Vừa |
| **Wild Link** (Khớp Nối Vạn Năng) | Vàng | Ghép với BẤT KỲ ụ, bất kỳ sao | Ụ ngẫu nhiên, sao = trung bình 2 ụ làm tròn lên; 10–30% (theo cấp thẻ) **+1★** | +2,7★ thưởng | Không | Thấp–vừa (thường mất sao, đổi lấy ghép tự do) |
| **Mimic** | Xanh | Ghép với bất kỳ ụ cùng sao | Ghép được khác loại; ụ ra +công 8 s | — | Không | Thấp |
| **Copycat** (Máy Sao Chép) | Vàng | Kéo lên ụ cùng sao | Copycat **thành bản sao** của ụ đó (70–94% sát thương) — không +★ | — (AI không kéo) | Không | Thấp–vừa (đổi ụ yếu thành ụ mạnh cùng sao) |
| **Compass Cannon** (Pháo La Bàn) | Vàng | Ghép 2 La Bàn | Gộp hướng bắn, sao = trung bình (không +1★) | — | Không | Không cho (bị giảm sao) |
| **Twin Anvil**, **Prism Thief** (hợp thể 4 màu), **Blood Circuit** (đánh dấu) | Vàng | Kéo đặc biệt | Cộng dồn chỉ số / hợp thể — không thêm ụ, không +★ | — | Không | Thấp |
| **Scrambler** (Máy Xáo Trộn) | Tím | Ghép 2 Scrambler | Solo/co-op: biến ụ lẻ của mình thành loại ghép được (cùng sao) | — | Không | Thấp |
| **Pandora Vault** (Hộp Pandora) | Vàng | Ghép 2 Pandora | Mở 1 trong 6: mưa mana **30×★**, đóng băng hết quái, **+1★ 1 ụ ngẫu nhiên** (sau sửa: 1/12 lần mở), 5 bom, khiên 5 ụ, cuồng bắn +60% 10 s. Ghép ra 6★: quay 2 lấy cái tốt; 7★: 2 hiệu ứng | ~4 lần mở, +0,7★, mưa mana ~100–200 | Không | Vừa (mana + ★) |
| **Mana Doubler** (Máy Nhân Mana) | Xanh | Ghép 2 Mana Doubler | **Mana ngay** (tăng theo ★ và cấp thẻ) | ~8 lần, **+500 mana** | Không | Vừa |
| **Signal Jammer** | Tím | Ghép 2 | PVP làm chậm đối thủ; **co-op: lần triệu hồi kế của đồng đội MIỄN PHÍ**; solo chậm quái | — | Không | Thấp (co-op: vừa) |
| **Hex Saboteur** (Kẻ Nguyền) | Vàng | Ghép 2 (hồi 8 s) | PVP: ụ đối thủ −1★; **co-op: (trước) đồng đội +1★ → (sau) +50% tốc bắn 6 s**; solo: yếu quái đầu | 0 (solo) | Không | Trước: vừa (co-op) → sau: thấp |
| **Mirror Gate** (Cổng Gương) | Vàng | Co-op, mỗi 20 s | **Chép hiệu ứng ghép của đồng đội** ở ½ sao (Twin Maker, Cloner, Pandora, Mana Doubler, Drone, Jammer…) lên bàn mình → có thể ra **ụ / ★ / mana miễn phí** | — (co-op) | Không | Vừa (chỉ co-op) |
| Drone Bay, Orbital, Wall Projector, Jammer, Cooldown Horn, Combo Core, Hero Foundry, Chrono Lock | Xanh–Vàng | Ghép 2 cùng loại | Hiệu ứng đánh/buff/giảm hồi chiêu — **không thêm ụ, không +★, không mana** | — | Không | Thấp |

### (b) +★ hoặc ụ sao cao KHÔNG qua ghép thường (theo thời gian / tự động)

| Ụ / cơ chế | Bậc | Khi nào | Được gì | Mỗi trận (mô phỏng) | Tốn mana? | Mức cho không |
|---|---|---|---|---|---|---|
| **Genesis Core** (Lõi Khởi Sinh) | Đỏ | Mỗi 12 s (nhanh hơn theo cấp thẻ) | **+1★ cho ô kề thấp sao nhất**; số lần = sao lúc xuất hiện, hết thì vỡ. Từ 3★ chạm (30 mana): gọi 1 ụ 1★ | **+40★** (rất nhiều Genesis 1★ cho 1 lần rồi vỡ) | Không (chạm: 30) | **Cao** (lớn nhất) |
| **Evolver** (Trứng Tiến Hoá) | Vàng | Trứng nở sau 10 s + 2 s/★ | Thành **ụ ngẫu nhiên +1★**; trứng 6★ cháy thành 7★ không nở → chạm +20 mana | ~21 lần, **+21★** | Không | **Cao** |
| **Mystery Box** (Hộp Bí Ẩn) | Tím | Sau 58 s (từ 3★: 46 s) | Thành ụ ngẫu nhiên **1–6★** (không thấp hơn sao hộp; 5★: ≥3★; 7★: 5–7★) — hộp 1★ có thể ra 6★ | ~4 lần, **+8★** | Không | **Cao** (mỗi lần trung bình +2★) |
| **Star Lift** (Bệ Nâng Sao) | Tím | Từ 5★: mỗi 2 wave 1 nấc | 3 nấc = +1★ cho ô kề thấp nhất (7★: 2 nấc) | — (AI chưa tới 5★); tính tay +1★/6 wave | Không | Vừa (xem mục 3) |
| Merge King / Gold King | Vàng | Kéo | +1★ / +2★ tại chỗ (xem (a)) | | | |
| Pandora "STAR GIFT" | Vàng | Ghép | +1★ 1 ụ ngẫu nhiên (xem (a)) | | | |
| Hex Saboteur co-op | Vàng | Ghép | (đã bỏ +★) | | | |
| Wild Link / Twin Maker | Vàng | Ghép | % +1★ thêm (xem (a)) | | | |
| **Chỉ huy REINFORCE** | Xanh | Chạm chỉ huy (30 mana, giá ×2 mỗi lần dùng: 30→60→120…) | **2 ụ 1★ miễn phí** (không tăng giá triệu hồi); bàn đầy → +1★ cho ụ yếu nhất | 4–6 lần, **~9 ụ**, +1,3★; tốn 450–1 900 mana | **Có** | Vừa (trả mana nhưng rẻ hơn triệu hồi) |
| **Trùm STAR LEECH** | — | Hạ trùm | Trả lại số ★ đã cướp vào ụ ngẫu nhiên (không còn ụ nhận → mana) | 0 (chưa gặp) | — | Không (chỉ trả lại) |
| Trùm Joker King / Nightmare / Octopus | — | Chiêu trùm | Ép ghép / −1★ / đốt −1★ — **mất** sao | −1 … −4★ | — | Âm |

### (c) Ụ miễn phí theo thời gian (không cần ghép)

| Ụ | Bậc | Khi nào | Được gì | Mỗi trận | Tốn mana? | Mức cho không |
|---|---|---|---|---|---|---|
| **Lighthouse** (Tháp Ánh Sáng) | Tím | Mỗi max(9, 21 − 1,6×★) s, khi còn ô trống | **1 ụ 1★ miễn phí** | **~72 ụ** | Không | **Cao** (nhiều ụ nhất — mỗi 2 ụ 1★ ghép được 2★…) |
| **Hatchery Gate** (Cổng Ấp Nở) | Vàng | Mỗi 11 s; số lượt = sao (+★ tại chỗ thêm lượt) | **1 ụ 1★ miễn phí** (không tăng giá triệu hồi) | **~30 ụ** | Không | **Cao** |
| Genesis Core (chạm) | Đỏ | Từ 3★, chạm | 1 ụ 1★ cạnh nó | ~0,3 | 30 mana | Thấp |

### (d) Mana thưởng, mạng, và thưởng ẩn khác trong trận

| Nguồn | Khi nào | Được gì | Mỗi trận | Mức cho không |
|---|---|---|---|---|
| Hạ quái (mọi trận) | Mỗi quái chết | 10 + 2×(wave − 1) mana (quái to ×2, quái con ×0,3) | 5 000 – 22 000 mana | Gốc kinh tế (không phải thưởng ẩn) |
| **Hạ trùm** | Mỗi 10 wave | **×12** mana một quái thường (wave 10: ~340, wave 20: ~580) | 220 – 1 200 | Thấp |
| **Mana Core** (Máy Mana, Trắng) | Mỗi 7 s (3★: 6 s, 7★: 5 s) | ~9×★ mana (×1,25 từ 5★) | **~2 100 mana** | Vừa |
| **Mana Leech** (Máy Hút Mana, Xanh) | Mỗi phát trúng | Ít mana, có trần mỗi giây | chưa tách được | Thấp |
| **Bounty Beacon** (Tím) | Quái được đánh dấu chết | Thêm mana (trùm ×5; co-op chia đôi) | chưa tách được (gộp trong mana giết quái) | Thấp–vừa |
| **Prism Thief** (Vàng) màu vàng | Bắn trúng | Mana (có trần) | chưa tách được | Thấp |
| Evolver trứng cháy | Chạm trứng 7★ | +20 mana | hiếm | Thấp |
| Pandora mưa mana / Mana Doubler | Ghép | Xem (a) | | |
| **Chrono Throne** (Đỏ) 7★ | Chạm REWIND | **+1 mạng** (1 lần mỗi trận) | hiếm | Thấp |
| Lucky Slot | Xuất hiện | Điểm trái cây (buff sát thương/tốc/chí mạng) — không ★, không mana | — | Thấp |
| Chỉ huy khác (RAGE, HOLY SHIELD, QUICK TUNE, DRAG NET, TWIN SIGNAL, CROSSFIRE, NEXUS LINK) | Chạm, trả mana | Buff / khống chế tạm thời — không ụ, không ★ | 3–5 lần | Không |
| Mốc wave / đột biến / sự kiện trong trận | — | **Không có** (rà code: không có thưởng ★/mana/ụ theo mốc wave ngoài trùm) | — | — |
| Ngoài trận (nhiệm vụ, thành tích) | Sau trận | Vàng/ngọc khi làm 3 ụ 5★, 7★ đầu tiên… — **không ảnh hưởng trong trận** | — | — |

### Tóm tắt cho người dùng

Xếp theo lượng "cho không" mỗi trận trong mô phỏng: **Lighthouse (~72 ụ 1★) › Genesis Core (+40★) › Hatchery Gate (~30 ụ 1★) › Twin Maker (+27★, 15 ụ) › Evolver (+21★) › Cloner (~8 ụ) › Mystery Box (+8★) › Gold King (đến +5★)**; Pandora, Wild Link, Star Lift, REINFORCE thấp hơn. Nếu muốn "phải có mana mới mạnh" thì các ụ đầu bảng là chỗ đáng cân nhắc tiếp (lần này giữ nguyên theo quyết định 14:08).

## 5. Kiểm tra

- `node tools/thap-kt-nguyen-tac.js` đạt 52 ca (gồm tất định + +★ tự động bỏ đá/băng); `thap-kt-khong-ban` đạt; `thap-kt-sao-tai-cho` đạt (trang thật); `thap-kt-vi`: không chuỗi mới nào chưa dịch (44 chuỗi cũ chưa dịch có sẵn từ trước).
- `thap-kt-vang-moi2` (trang thật, máy chủ trỏ đúng bản sửa): ca Hex co-op mới đạt; 1 lỗi còn lại "cấp thẻ Blood Rite/Hex/Prism" có sẵn ở bản gốc.
- `thap-kt-cong-huong-luat` (34/406), `thap-kt-conghuong2` (Copycat/Merge King/Star Breaker), `thap-kt-co-bac` (1), `thap-kt-kynang-vd` (lỗi chạy) — **trượt y hệt ở bản gốc chưa sửa**, không liên quan Pandora/Hex.
- Ảnh trang ụ 390×844 (đã xem): Pandora Vault EN/VI, Hex Saboteur EN/VI — không lỗi trang, mô tả mới hiện đúng (đọc chữ trong trang).
