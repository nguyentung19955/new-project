# GĐ2 — Nhóm 2A: Trùm và cân bằng trùm (phiên gd2-a)

Nhánh: `gd2-a` (tách từ `khoi-tao-du-an` lúc e0919706, đã có code Giai đoạn 1).
Theo yêu cầu chủ dự án: **chưa chạy bài kiểm tra nào**, chỉ chạy `node --check` cho `data.js`, `boss.js`, `mobs.js`, `tests/may_luat.test.js` (đều qua).
Tệp đã sửa: `game/js/data.js`, `game/js/boss.js`, `game/js/mobs.js` (chỉ dòng bầy nhỏ + một chú thích), `game/firebase/linhkhi.rules`,
`game/tests/may_luat.test.js`, `docs/review/gd2/*`. **Không** sửa `monster_art.js` (không cần, xem V8).

## Đã sửa gì

| ID | Tệp / hàm | Số cũ → số mới, sửa gì |
|---|---|---|
| **V5** (Q2) | `data.js` `G.STAGE_K.boss` (chỉ cột sát thương; cột máu giữ nguyên) | Cách tối thiểu: đặt riêng cột sát thương trùm nhỏ (không sửa `makeBoss`). 2-1: 2,95 → **2,0**; 3-1: 4,54 → **2,0**; 3-2: 4,28 → **2,1**; 3-3: 4,43 → **2,0**; 3-4: 4,74 → **1,8**. Đòn gốc (`b.dmg`, tính tay): 2-1 104 → **71** (2-2 là 71, Ngư Tinh 155); 3-1 371 → **163**; 3-2 357 → **175**; 3-3 412 → **186**; 3-4 506 → **192** (Hồ Tinh 232). Ghi chú: số ví dụ trong TONG-HOP (2,6/2,6/2,7/2,9) cho 3-3 = 251 và 3-4 = 309, **vẫn mạnh hơn Hồ Tinh** và ~75–90% máu bé, trái với yêu cầu "không mạnh hơn trùm vùng" và tiêu chí "≤ 45% máu bé". Số mới chọn để đạt cả hai (máu bé khuyên dùng theo `AUDIT-VONG-LAP` 3.2: 3-1 311/16%, 3-3 341/18%, 3-4 355/18% → đòn gốc sau giảm ≈ 44–45%). Nếu thấy ải 3-x quá dễ thì nhích lên nhưng giữ ≤ 2,1 (3-3) / ≤ 2,1 (3-4) để còn ≤ Hồ Tinh. |
| **V14** (Q3) | `boss.js` `SK` | Thêm `later(b, D, () => tire(b, 1.0))` (mệt 1 giây, nhận ×1,5 sát thương qua `b.exposed`) vào chiêu có từ pha 1: Mộc Tinh `c3` Mưa quả độc, Ngư Tinh `c2` Sóng thần, Hồ Tinh `c4` Vòng lửa ma. Vì `c4` chỉ mở từ pha 2 (`thinkBig`), Hồ Tinh thêm mệt sau `c3` Quạt đuôi để pha 1 cũng có. Mệt cũ ở `c5` (1,4–1,5 s) giữ nguyên. |
| **V14** (Q3) | `boss.js` `thinkMini`, `tire` | Trùm nhỏ mệt **0,8 s** sau `chieu1` (cả 3 trùm nhỏ). Vì trùm nhỏ không có hình 'stun' riêng, `tire` đặt thêm `b.st.stun` cho trùm nhỏ → `mobs.js` vẽ hình lảo đảo và ô hiệu ứng "choáng" (`fx.js`) hiện. |
| **V8** (Q4) | `boss.js` `thinkBig`, chiêu `ho.c2` | Vồ mồi thêm `tele: 0.63` = báo trước tối thiểu. Trước: 0,44 s (pha 1), 0,40 (pha 2), 0,37 (pha 3) → nay **0,63 s mọi pha**. Cách làm: kéo dài phần lấy đà (hình chạy chậm `spd·T0/T` tới lúc ra đòn, rồi về tốc độ thường), cả chiêu dài thêm đúng phần đó; cú vồ thứ hai (đã báo 0,50 s) giữ nguyên nhịp so với cú đầu. Không cần đổi mốc ở `monster_art.js` vì hình vẫn vồ đúng lúc vùng đỏ nổ. Chọn 0,63 (không phải 0,60) để "dư" ≥ 0,25 s cả với Đô Vật (ra nhanh nhất 0,37 s). |
| **V8** (Q4) | `mobs.js` dòng 365 | Bầy nhỏ (Ong Vò Vẽ, Cá Con, Dơi Than) báo trước **0,42 → 0,5 s**. Hình lấy đà tự trải theo thời gian báo (đã có từ trước). Sửa chú thích dòng ~684 cho đúng số. |
| **V38** | `boss.js` `thinkMini` | Trùm nhỏ có lớp "Chống áp sát" và em bé đứng gần (< 75) → thêm `'chieu1'` ×2 vào lựa chọn (Cua Đá đập sàn quanh mình, Nấm Chúa hàng nấm, Hổ Lửa vồ lửa). Trước đây lớp này chỉ là nhãn. |
| **V16** (Q8 = chỉ sửa câu) | `data.js` `G.HINTS[4]` | "Lửa hợp với bầy quái, Độc hợp với quái trâu và trùm, Băng hợp với quái nhanh." → "Lửa đốt cháy; từ Thức tỉnh, quái đang cháy mà chết thì nổ lan sang con đứng gần. Độc cộng dồn tầng, mạnh với quái trâu, trùm và cả bầy đông. Băng làm chậm, đủ tầng thì đóng băng, hợp với quái nhanh." **Không** đổi số Lửa. |
| **V48** | `data.js` `G.HINTS[5]` | Thêm: "Độc gặp Băng không phản ứng, nhưng Băng làm Độc tan chậm một nửa. Phản ứng chỉ có giữa hai vũ khí khác hệ (đổi vũ khí khi quái còn dính hệ cũ); chưởng không gây phản ứng với vũ khí." (Trang "Ba hệ" ở Cụ Đồ ghép `HINTS[4] + HINTS[5]`.) |
| **V23** (Q1) | `firebase/linhkhi.rules` khối `linhkhi_scores` | Khách ẩn danh không ghi (`sign_in_provider != 'anonymous'`); `power` ≤ 1.000.000 → **≤ 1.500**; `stars` ≤ 90 → **≤ 3 × far** (= 45 khi qua đủ 15 ải), riêng khi `far = 15` cho tới 90 (sao Độ khó 2 được cộng vào tổng — chặn cứng 45 sẽ khoá người chơi thật; đã ghi rõ cho chủ dự án); hạ trùm ≥ 5 s → **≥ 20 s**, và `b_moc` cần `far ≥ 5`, `b_ngu` ≥ 10, `b_ho` ≥ 15. **Chưa đưa lên Firebase** — hướng dẫn: `docs/review/gd2/LUAT-FIRESTORE.md`. |
| **V23** | `tests/may_luat.test.js` | Bài thử ghép khối mới từ `linhkhi.rules` vào `firestore.rules.gop` lúc chạy. Dữ liệu mẫu đổi `far` 5 → 10 (vì có `b_ngu`), `g: true`. Thêm ca: power 2.000 / 1.501 bị từ chối; 31 sao khi qua 10 ải, 46 sao khi qua 14 ải bị từ chối; hạ Mộc Tinh 19 s bị từ chối; có thời gian Ngư Tinh/Hồ Tinh khi chưa qua ải trùm bị từ chối; 1.500 SM + 45 sao + 20 s được; 90 sao khi qua 15 ải được; khách ẩn danh ghi bị từ chối, đọc bảng và gửi góp ý vẫn được. |
| **b.skillName** (cho 2C) | `boss.js` | `b.skillName` = tên chiêu trùm vừa bắt đầu (tiếng Việt). Trùm vùng lấy `SK[kind][k].name` (vd "Vồ mồi", "Sóng thần"); trùm nhỏ theo bảng `MINI_SK` (Cua Đá: Kẹp càng / Đập càng rung sàn / Mưa tinh thể; Nấm Chúa: Phun bào tử / Hàng nấm độc / Bão bào tử; Hổ Lửa: Cào / Vồ lửa / Gầm phun lửa); Hồ Tinh chống đánh xa: "Biến ra sau lưng vồ"; Hồ Tinh bật lùi: "Vũng lửa ma". Thêm: mọi vùng đỏ/đạn tạo qua `Z`, `circle`, `shot` (và tường nước, vồ sau lưng, vũng bật lùi) có trường **`skill`** = tên chiêu lúc tạo — chính xác hơn `b.skillName` khi vũng/đạn còn sót lại lúc trùm đã sang chiêu khác. `G.hurtPlayer(amt, el, src, melee)` nhận `src` = trùm, nên 2B/2C đọc `src.skillName`; nếu 2B muốn chính xác tới từng vùng thì cần truyền vùng/đạn (có `skill`). |

## Cần kiểm tra khi test (TONG-HOP mục 4 dòng 2A)

1. `au_spam.py`: Hổ Lửa 3-3, bot không né cần **≥ 2 đòn** mới gục (trước: 1 đòn, 8/8). Đòn gốc trùm nhỏ ≤ trùm vùng cùng vùng.
2. `au_trum.py`: % thời gian "mệt" **5–12%** ở mọi pha trùm vùng; **> 0** ở trùm nhỏ. Pha 1: Mộc Tinh mệt sau c3, Ngư Tinh sau c2, Hồ Tinh sau c3; pha 2 thêm Hồ Tinh c4; pha 3 thêm c5 (cũ). Nếu % mệt pha 3 vượt 12% thì hạ 1,0 → 0,8.
3. `au_bao_truoc.py`: mọi dòng "dư" **≥ 0,25 s** — Hồ Tinh c2 nay 0,63 s (dư ≈ 0,26–0,30), bầy nhỏ 0,5 s (dư ≈ 0,20–0,25: **có thể vẫn hơi thiếu** với Đô Vật; nếu cần thì 0,55). Heo Rừng Nanh Dài / Mèo Đen (dư 0,20) **không** thuộc phạm vi đã duyệt, chưa đổi.
4. `au_trum_hoc.py`: trùm nhỏ có "Chống áp sát" ra `chieu1` nhiều hơn khi em bé đứng sát.
5. `tests/campaign.py`, `tests/cay.py 12 khuyen` (tổng 2,5–4 giờ), `tests/balance.py`, `tests/quai.py`: ải 2-1, 3-1..3-4 dễ hơn rõ (đòn trùm nhỏ giảm ~32–62%); có thể phải hạ `G.STAGE_REC` các ải này. Trận trùm ngắn lại chút (thêm cửa sổ mệt).
6. `node game/tests/may_luat.test.js` (cần Java + emulator): power 2.000 và khách bị từ chối; các ca cũ vẫn đạt.
7. Thử tay: Hồ Tinh Vồ mồi — thấy vùng đỏ rồi đi bộ ra kịp; hình vồ khớp lúc vùng đỏ nổ (phần lấy đà chậm hơn, không giật). Trùm vùng pha 1 có lúc choáng sau Mưa quả độc / Sóng thần, đánh vào thấy số to. Trùm nhỏ lảo đảo ~0,8 s sau chiêu 1. Trang "Ba hệ" ở Cụ Đồ: chữ không tràn khung (câu dài hơn trước).
8. `au_noi_dung.py`: số câu `G.HINTS` không đổi (10).

## Rủi ro / ghi chú cho người điều phối

- **Bảng thua (2C)**: đọc `src.skillName` (src là trùm) hoặc trường `skill` của vùng/đạn; trường chỉ có ở trùm (quái thường không có).
- **Khách ẩn danh + luật mới**: `bang_vang.js` `B.sync` vẫn gửi điểm khi là khách → bị luật từ chối → `cloud.js` `_fail` đặt `status = 'error'` (dòng chữ "Đang ngoại tuyến" trong Cài đặt có thể hiện sai). Nên thêm `|| C.isGuest()` vào điều kiện thoát sớm của `B.sync` (ngoài phạm vi 2A) trước khi chủ dự án đưa luật lên.
- `firestore.rules.gop` chưa đồng bộ khối Linh Khí mới (ngoài phạm vi); bài thử tự ghép.
- Trùm nhỏ mệt dùng `st.stun` thật: trong lúc đó Thợ Săn được +25% (đã có sẵn vì `exposed` cũng tính) — không cộng dồn thêm.
- V5 chọn số thấp hơn ví dụ TONG-HOP (lý do ở bảng trên). Đây là số cân bằng, cần `cay.py` xác nhận.
