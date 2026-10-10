# Giai đoạn 2 — Nhóm 2B (vũ khí, độ trễ, phản hồi) — phiên gd2-b

Nhánh: `gd2-b` (tách từ `khoi-tao-du-an` sau Giai đoạn 1). Chưa gộp, chưa đóng gói (`build.py`).
Theo yêu cầu: **chỉ sửa code, chưa chạy bài kiểm tra nào** (chỉ `node --check` cho các tệp JS đã sửa: đều đạt).
Không làm V11 (cảnh đông) — phiên hình ảnh gd5-c đang làm các tệp fx*.js.
Giữ bất tử khi Né **0,32 giây** (Q13), không đổi.

## Đã sửa gì

| ID | Tệp / hàm | Cũ → mới |
|---|---|---|
| **V12** | `moves.js` `M.act` (nhánh vũ khí có giữ-thả), `M.speed` | Cung/giáo/búa: trước phải giữ đủ **0,16 giây** (hoặc nhấc ngón) mới có động tác → nay **vào tư thế giương / lấy đà ngay khung chạm nút** (`mv.holding = true`). Luật không đổi: đà bắt đầu từ số âm (`chargeT = holdT − 0,16`) nên trong 0,16 giây đầu đà = 0, không đi chậm; nhấc ngón trước 0,16 giây vẫn ra **đòn bấm** đúng lúc nhấc ngón như cũ; giữ lâu thì đà đầy đúng thời điểm như cũ. Thời lượng, sức đánh mỗi đòn không đổi. |
| **V15** (Q5) | `moves.js` `G.MOVES.hammer.swing.hitAt`, `begin`, `hammerTap`; `combat.js` `updatePlayer` (dòng kiểm tra lúc chạm), `startAttack` | Nhát **Nện** chạm ở **45% động tác (0,36 giây) → 35% (0,28 giây)**. Thời lượng 0,8 giây, sức đánh giữ nguyên. Các đòn khác vẫn 45% (mặc định `P.hitAt` = null → 0,45, đúng như "còn 55% thời gian" cũ). |
| **V15** (Q5) | `combat.js` `updatePlayer` (lúc bấm Né) | Né huỷ nhát đang vung: trước giữ nguyên thời gian chờ (búa phải chờ thêm ~0,43 giây sau cú lộn) → nay thời gian chờ còn **tối đa 0,1 giây** (`P.cdT = min(P.cdT, 0.1)`), chỉ khi thật sự đang vung (`P.atkT > 0`). Bất tử 0,32 giây giữ nguyên. |
| **V13** | `combat.js` `G.damage` (lớp "Chống đánh xa"); cuối `fx.js` thêm `G.fx.farHint` | Tên bắn từ xa vào trùm có "Chống đánh xa": còn **30% → 50%** sát thương. Báo hiệu: số sát thương **xám** (fx.js vốn tự làm xám khi hệ số < 0,8 — có sẵn) + chữ **"Xa quá!"** trên đầu trùm lần đầu bị giảm, nhắc lại tối đa mỗi 6 giây. Ở fx.js chỉ **thêm** một hàm nhỏ ở cuối tệp, gọi hàm chữ sẵn có `G.fx.text`; không sửa phần khác. Hồ Tinh dịch chuyển khi trúng tên: không đổi. |
| **V46** | `combat.js` `playerHit` (tỉ lệ gây hệ) | Tỉ lệ gây hệ mỗi nhát nhân với `nhịp vũ khí / 0,36` (không dưới 1), tối đa 100%: kiếm ×1 (giữ nguyên), giáo ×1,22, cung ×1,39, búa ×2,22. Ví dụ Mầm 20%: búa 20% → 44%. |
| **V17** (phần dữ liệu) | `combat.js` `G.newWorld`, `G.hurtPlayer`, nhịp cháy/độc trong `updatePlayer`, các chỗ vùng/vũng/sóng/tường nước trong `updateWorld` | Ghi máu bé **thật sự mất** theo nguồn, cộng dồn **cả lượt** (sổ gắn vào `S.stats` của ải nên mọi phòng dùng chung). Chi tiết trường ở dưới. Không đổi luật mất máu. |
| **V50** | `mobs.js` — chỉ dòng vẽ dấu "!" (cuối hàm vẽ quái) | Trước: quái có biểu tượng dấu hiệu (tinh anh luôn có) **không bao giờ** có "!" báo sắp ra đòn → nay luôn có, đặt **lệch sang phải hàng biểu tượng** (cách 3 điểm ảnh); quái không có biểu tượng vẫn ở giữa như cũ. |

### Tên trường cho phiên 2C (bảng thua đọc trong `stage.js`)

- `W.hurtBy[key] = { key, name, amt, n, boss }` — `amt` máu mất cộng dồn cả lượt, `n` số lần, `name` chữ hiện được ngay.
  - `key` là vai quái (`'rusher'`, `'swarm'`, `'shield'`, `'archer'`, `'nimble'`, `'elite'`, `'kami'`, `'bomber'`, `'spiky'`; `name` lấy từ `G.ROLES`, ví dụ "Xạ thủ", "Gai"),
  - `'gaiPhan'` — "Gai phản đòn" (đánh cận chiến vào quái Gai đang dựng gai),
  - `'trum'` — "Đòn của trùm" (đòn trực tiếp, đạn, vùng đỏ cận chiến), `'trumVung'` — "Vùng đỏ của trùm" (vùng nổ, vũng, sóng, tường nước). Hai mục này có `boss` = tên trùm.
  - `'vung'` — "Vùng nguy hiểm" (vùng/vũng không rõ chủ ở phòng thường), `'chay'` — "Cháy", `'doc'` — "Trúng độc" (máu mất mỗi nhịp sau khi dính hệ).
- `W.lastHurt = { key, name, skill, boss, amt, el, t, fatal }` — lần mất máu gần nhất; `fatal: true` nếu chính lần này hạ bé. `skill` = `b.skillName` của trùm (do phiên 2A đặt trong `boss.js`; khi 2A chưa gộp thì là `null`). Bản sao cũng nằm ở `S.stats.lastHurt`.
- Mẹo đọc: "mất máu nhiều nhất" = mục có `amt` lớn nhất trong `W.hurtBy`; "gục vì" = `W.lastHurt` khi `fatal`.

## Cần kiểm tra khi test (TONG-HOP mục 4, dòng 2B)

- `au_input.py` A1: "vào động tác" ≤ 20 ms cho **mọi** vũ khí (cung/giáo/búa giờ tính từ lúc vào tư thế); "gây sát thương" của cung/giáo khi bấm nhanh **không đổi** so với trước (đòn bấm vẫn ra lúc nhấc ngón).
- `tests/moves.py`: đã sửa sẵn một dòng ("Cung: giữ dưới 0,16 giây…" nay mong đợi đã vào tư thế nhưng đà = 0, chưa đi chậm). Để ý thêm các dòng **búa** (nhát thường, khựng 0,4 giây) vì búa chạm sớm hơn 0,08 giây.
- `au_vu_khi.py`: búa %huỷ ở đám ≤ 30%; st/giây đám ≥ 85% kiếm; 1 quái búa không vượt kiếm quá 10%; búa đánh lại sau Né ≤ 20 khung; dấu ấn/phút búa ≥ 70% kiếm.
- `VK=hammer au_he.py`: búa Băng ≥ 90% búa Độc. `tests/dps.py`, `tests/linhkhi.py` (V46 làm búa/cung có hệ mạnh lên), `au_dps.py` không đổi quá 3%.
- `au_hitbox_shots.py` + **xem ảnh búa**: hình nện (`hero_art.js` khung trúng ~43–53% động tác — không thuộc phạm vi phiên này) có thể chậm hơn lúc gây sát thương (35%) một chút. Nếu nhìn lệch rõ thì phiên hình ảnh chỉnh khung hình, hoặc đổi `hitAt` 0,35 → 0,4.
- `au_trum_hoc.py`; `tests/cay.py` với `prefer: 'bow'` (V13: Chống đánh xa nhẹ hơn, 30% → 50%).
- Thử tay: bắn cung từ xa vào trùm có "Chống đánh xa" → số xám + "Xa quá!" (lần đầu, rồi tối đa mỗi 6 giây); bấm nhanh cung/giáo/búa → có tư thế ngay khi chạm (có thể thấy thanh lấy đà rỗng chớp rất ngắn trên đầu — thanh do `fx_he.js` vẽ khi đang giữ; nếu thấy rối mắt, phiên hình ảnh có thể chỉ vẽ thanh khi `mv.chargeT > 0`); phòng tinh anh: dấu "!" hiện bên phải biểu tượng khi tinh anh sắp đánh (`quai_shots.py`).
- Bảng thua (sau khi 2C làm phần hiện): thua 3 kiểu khác nhau — quái thường, vùng đỏ trùm, đòn trùm — xem dòng "mất máu nhiều nhất" đúng nguồn.
- Né: bất tử vẫn 0,32 giây (`au_ne.py` không đổi).

## Ghi chú

- Các bài kiểm tra tự viết (`au_dps.py`, `au_input.py`…) thay `G.hurtPlayer` bằng hàm bọc: không ảnh hưởng vì phần ghi sổ nằm trong hàm gốc.
- `fx.js`: chỉ thêm đoạn cuối tệp (khối `V13 (Giai đoạn 2, phiên gd2-b)`), dễ ghép với phiên gd5-c.
- `mobs.js`: chỉ sửa đúng một dòng vẽ dấu "!" (kèm một dòng chú thích).
