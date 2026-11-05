# DCDW hiện bộ đếm / số ụ trên bàn thế nào (2026-11-05)

Người dùng hỏi: *"sao cannon không còn đếm count so với trên bàn nữa"* → *"check lại xem với các skill tính bằng số sao trên bàn thì hiện như nào trong DCDW"*.
Commit trước (9a852bf) đã bỏ số nhỏ dưới thẻ bộ bài (số ụ loại đó trên bàn) vì tưởng người dùng nhầm với số sao của Star Cannon. Thực ra người dùng **muốn giữ** con số đó.

## 1. Kết quả tìm hiểu

Ký hiệu: **[XN]** = đã xác nhận (có nguồn / ảnh) · **[?]** = chưa chắc.

### Destiny Child: Defense War (DCDW)
- **[XN]** Ra mắt Hàn Quốc 24/11/2020; bộ bài = 1 Ma vương + 5 Child, bàn 5×3, giá triệu hồi tăng dần. Nguồn: [gameinsight](https://www.gameinsight.co.kr/news/articleView.html?idxno=21782), [MobyGames](https://www.mobygames.com/game/176430/destiny-child-defense-war/).
- **[XN]** Kỹ năng theo số đếm có thật: Darby (다비) — tổng ★ trên bàn bội 10 → tăng tốc, đủ 50★ → thức tỉnh +350% (hướng dẫn bộ bài ["giữ 40★ trở lên"](https://tiprelay.com/%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88-%EC%B0%A8%EC%9D%BC%EB%93%9C-%EB%94%94%ED%8E%9C%EC%8A%A4%EC%9B%8C-%EB%8D%B1-%EC%B6%94%EC%B2%9C-%EC%A1%B0%ED%95%A9-%EC%A0%95%EB%A6%AC/)); Kararatri — sát thương/chí mạng tăng theo số ngọn lửa đang giữ ([mumuplayer](https://www.mumuplayer.com/kr/blog/destiny-child-new-character.html): "보유한 불꽃의 숫자만큼 대미지와 치명타 확률이 증가"); Jegeoti — bingo.
- **[XN] (ảnh trận co-op của ta, `tham-chieu/dcdw_coop_wave6.png`)**: thẻ bộ bài dưới cùng = chân dung + **LV** + **giá nâng cấp (giọt mana 100)**; dải đồng đội trên cùng = chân dung + LV + huy hiệu **"+1"** (mức nâng trong trận). Ụ trên bàn: **pip sao trên đầu**, mũi tên nhỏ khi được buff. Không thấy chữ dài, không thấy thanh to.
- **[?] → nghiêng về CÓ**: ghi chép 10 video DCDW của phiên điều phối (`QUAN-SAT-10-VIDEO-DCDW.md` mục A.4): *"số nhỏ góc trên trái = số bản trên bàn"* trên thẻ bộ bài. Trong khung ảnh wave 6 đã lưu không đọc rõ số này (ảnh nhỏ), nên đánh dấu chưa chắc; nhưng đây là quan sát trực tiếp duy nhất, và đúng là điều người dùng đang thấy thiếu.
- **[?]** Darby/Kararatri hiện bộ đếm trên con ụ hay chỉ trong bảng chạm: không tìm được nguồn chữ (namu.wiki, thisisgame chặn đọc tự động; bài gamemeca chỉ nói ghép "cùng số sao, cùng nhân vật").

### Random Dice (tham chiếu 2)
- **[XN]** Nâng cấp trong trận = chạm ô xúc xắc ở thanh dưới, trả SP ([fandom Dice Mechanics](https://random-dice.fandom.com/wiki/Dice_Mechanics), [Pocket Tactics](https://www.pockettactics.com/random-dice/guide)).
- **[XN]** Xúc xắc "sạc": lượng sạc **hiện ngay trên nút nâng cấp ở thanh dưới** ("充電量はパワーアップボタンで示され", [atwiki JP](https://w.atwiki.jp/randomdicejpwiki/pages/12.html)) → trạng thái cả loại đặt ở thẻ bộ bài.
- **[XN]** Combo: sát thương theo số combo tăng khi ghép ([randomdicehub](https://randomdicehub.com/dice/combo/)); Growth: bản 5.4.3 thêm **chỉ báo trên xúc xắc** còn bao lâu biến hình ([wiki.gg](https://randomdice.wiki.gg/wiki/Random_Growth_Dice)). Moon/Solar kích theo số xúc xắc cùng loại trên bàn.
- **[?]** Random Dice có hiện "số xúc xắc loại này trên bàn" không: không tìm thấy.

### Kết luận áp dụng (gọn kiểu DCDW)
1. Thẻ bộ bài **có lại số ụ loại đó trên bàn** — nhưng kèm **icon chồng ụ** để không nhầm với sao; đặt góc dưới-phải ô chân dung (LV giữ góc trên-phải, hai tấm không dính nhau).
2. Bộ đếm kỹ năng **đặt trên chính con ụ** (như chỉ báo Growth / pip sao của DCDW): 1 tấm nhỏ ở đáy ô = icon + số chính xác, chỉ hiện khi có số. Chi tiết dài vẫn ở bảng chạm (vd. Star Cannon "Stars counted 47/50 · next ×10 at 50").

## 2. Đã làm (`thap/js/demkn.js`, `thap/css/demkn.css`)

| Ụ | Tấm đếm trên ụ | Ý nghĩa (đọc thẳng từ luật mỗi khung) |
|---|---|---|
| Star Cannon `ngoisao` | ★ `29/50` (vàng khi bội 10 / ≥50) | tổng ★ mọi ụ trên bàn của chủ ụ |
| Combo Core `combo` | ⚔ `×4` | số COMBO của bàn |
| Chain Link `lienket` | ⚔ `×3` (≥2) | số ụ Chain Link nối liền |
| Sync Cannon `dongbo` | ⚔ `×2` | số ụ Tấn công kề cùng sao |
| Resonance Grid `luoicheo` | ⚔ `3/4` | ô chéo đã có ụ |
| Railgun `railgun` | ⚔ `3/5` + » `2/3` (≥2) | bingo hàng ngang / cột dọc |
| Nine-Tail `cuuvi` | 💀 `6/9` | số đuôi |
| Scrap Forge `loren` | ⚔ `6/15` | cộng dồn lò |
| Leviathan `leviathan` | ⚔ `41` | cộng dồn VỰC SÂU (thay nhãn số riêng cũ) |
| Energy Cannon `nangluong` | 💎 `+250%` | thưởng sát thương theo mana đang có |
| Werewolf `soi` | 💀 `12` | số quái đã giết |
| Lone Ace `docton` | » `+100%` / `−30%` | ACE (không ụ kề) / quá đông (≥3 kề) |

(icon trong bảng chỉ để đọc; trong game là PNG `ic_sao`, `ic_dmg`, `ic_toc`, `ic_chet`, `ic_mana` trên khung `h2_tag`.)
Hydra: số nòng = số ★ (đã thấy ở pip sao) → không thêm tấm.

- Thẻ bộ bài: icon `h2_ic_chong` + số ụ trên **bàn của mình** (`G.ban[0]`; co-op/pvp không cộng bàn kia). Dải thẻ nhỏ đồng đội/đối thủ: số ụ trên **bàn của họ**.
- Tấm trên ụ vẽ trong lớp huy hiệu (`ND.veHuyHieu`) → có ở SOLO, CO-OP (cả bàn đồng đội), PVP (cả bàn đối thủ), ONLINE, Test range.
- Ảnh mới cần (không bắt buộc): `HINH-VE-CODE-AUDIT.md` → "Pass 8 — counters".

## 3. Kiểm tra (390×844 DPR3, `tuvan/demsao2/`)
- `solo_ban.jpg`, `coop_ban.jpg`, `pvp_ban.jpg` + ảnh phóng `coop_zoom_ban.jpg`, `coop_zoom_the.jpg`, `pvp_zoom_doithu.jpg`; `testrange_ngoisao.jpg` (16/50 = 4+3+3+3+3 ✓), `testrange_combo.jpg`.
- So số với bàn thật (cả 3 chế độ): thẻ bộ bài ngoisao 1 · combo 2 · railgun 3 · lienket 3 · canon 2 = đếm B.t ✓; Star Cannon 35/50 = tổng ★ bàn mình ✓ (bàn kia 20–21/50 = tổng ★ bàn kia, bot đồng đội có triệu hồi thêm); Railgun 3/5 (hàng 0 có 3 Railgun) ✓; Chain Link ×3 ✓; Sync ×2 ✓; Forge 6/15, Nine-Tail 7/9, Leviathan 41, Werewolf 12 ✓; Energy +250% ở 300 mana ✓.
- Không có lỗi trang.
