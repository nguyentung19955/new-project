# HIỆU ỨNG ĐÁNH CHO ĐẦU Ụ MỚI (v2) — KIỂM KÊ + THIẾT KẾ + PROMPT CHATGPT

> Trả lời câu hỏi: **"Có gen hiệu ứng cho hình ảnh mới các ụ chưa?" → CHƯA.** 85 đầu ụ mới (`docs/demo-hop-tuong/thap-art/redo/<id>_nong_v2.png`, chưa nối vào game) đã có, nhưng **chưa có hiệu ứng đánh nào được gen theo đầu mới**. Toàn bộ game vẫn dùng **bộ đạn chung cũ** (5 viên đạn `dan_*` + `tia_lua`) và **5 dải nổ chung** (`fx_no_phao`, `fx_dien`, `fx_bang_vo`, `fx_laser_trung`, `fx_khoi_doc`) + chớp nòng vàng chung `fx_chop_nong` cho 62 ụ; còn lại vẽ bằng code (vệt đạn, hạt, vòng, tia, nón lửa, 23 sprite `g_*` của growfx…).
>
> Tài liệu này **chỉ kiểm kê + viết prompt** (không sửa code `thap/`). Tuân thủ `thap/QUY-TAC-HINH.md`: mọi hình hiệu ứng mới phải gen bằng ChatGPT; code chỉ đặt vị trí / xoay / phóng / mờ / tô màu ảnh PNG.
>
> Nguồn kiểm kê: `thap/js/skills.js … skills5.js` (85 `SKILLS.<id>` + 62 `HU.*`), `growfx.js` (15 ụ đổi dạng + 23 sprite `g_*` vẽ bằng canvas), `render.js` (`veDan`, `veFx`, `veLaser`, `tia`, `set`, `vet`, `cham1`), `quaianim.js` (trạng thái trên quái), `support.js` (ụ hỗ trợ), `fx.js`, `tiervfx.js`. Ngày kiểm: 2026-11-05, nhánh `claude/demo-hop-tuong` @ `d4e7516a`.

---

## 0. TÓM TẮT SỐ LIỆU

| Hạng mục | Số |
|---|---|
| Ụ kiểm kê | **85 / 85** |
| Lượt dùng hiệu ứng **PNG** (đếm trong bảng mục 1, mỗi `P:` = 1; chớp nòng chung tính 62 lượt) | **211** |
| Lượt hiệu ứng **vẽ bằng code** (mỗi `C:` = 1) | **155** |
| Ụ có đạn/tia **riêng theo đúng đầu mới** | **2** (Ricochet `hu_luoicua` lưỡi cưa chanh; Black Hole `hu_hoden` xoáy tím) — 83 ụ còn lại lệch hoặc dùng đồ chung |
| Ụ dùng chớp nòng vàng chung `fx_chop_nong` | 62 |
| Ụ trạng thái "choáng" (`E.chan`) có hình trên quái | 0 (choáng hiện **không có hình nào**) |
| Sprite đạn growfx vẽ bằng canvas (`taoAnh g_*`) | 23 sprite / 15 ụ đổi dạng + Hive Queen, Leviathan, Resonance Grid |
| **Tờ prompt mới đề xuất** | **30 tờ** = 22 tờ ụ (4×4) + 4 tờ dạng 1/2/3 + 3 tờ tia (6 dải) + 1 tờ trạng thái quái |
| PNG đích sau khi cắt | **450** = 340 (85×4) + 12 hạt chung + 64 dạng + 18 tia + 16 trạng thái |

Ký hiệu trong bảng: `P:file` = ảnh PNG trong `thap/assets/` · `C:…` = vẽ bằng code (canvas arc / gradient / lineTo / hạt `cham1`) · `—` = không có.
Viết tắt dùng nhiều: `P:chop` = `fx_chop_nong` (chớp nòng vàng chung, dải 6 khung) · `C:vet` = vệt đạn gradient `REN.vet()` (mọi đạn trừ `dan_phao`) · `C:cham` = chấm sáng gradient `REN.cham1()` (mọi hạt màu không phải cam/vàng, mọi quầng trạng thái) · `C:vong` = vòng `FX.vong1` (arc) · `P:tia_lua` = tia lửa cam (chỉ khi màu `#ffb060/#ffd080`, màu khác rơi về `C:cham`).

### Trạng thái trên quái (dùng chung cho mọi ụ — `quaianim.js` / `render.js`)

| Trạng thái | Hình hiện tại | Nguồn |
|---|---|---|
| Chậm (`E.cham`) | C:cham quầng xanh `#78D9F5` + P:fx_bang_vo nổ 1 lần lúc dính | Frost, Ice Blade, Blizzard, Chiller, Cryo, Chrono Lock, Eclipse, Signal Jammer, Chrono Throne |
| Độc (`E.docT`) | C:cham hạt xanh lá bay lên + màu thanh máu | Venom, Toxic Pool (Venom 5★ lây sang quái gần) |
| Cháy (`E.chayT`, HU.chay) | C:cham than hồng `#ff8a2a` | Holy Halo, Eclipse, Wyrm Engine |
| Suy yếu / phá giáp / cầu vồng / giáp vàng | C:cham quầng tím / đổi 5 màu / vàng | Armor Breaker, Rainbow, PvP |
| Choáng / đứng (`E.chan`) | **— (không có hình)** | Frost 7★, Blizzard, Chrono Lock, Pandora, Marionette, Wall, Leviathan |
| Truy nã | P:ic_truyna + C:khung lục giác | Bounty Beacon |
| Nhiễu (ụ bị kẹp `T.st.kep`) | P:vong_xich | Signal Jammer / trùm |

---

## 1. KIỂM KÊ TỪNG Ụ (85) — hiện trạng hiệu ứng + lệch với đầu mới

| # | id | Tên | Đầu mới (v2) | Đạn / tia / vùng | Chớp nòng | Trúng | Trạng thái quái | Kỹ năng / vật thể | Dạng (growfx) | Lệch với đầu mới |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | canon | Cannon | nòng đồng thau cam | P:dan_phao (vòng cung) + P:khoi_* đuôi khói | P:chop | P:fx_no_phao, P:tia_lua, C:vong | — | — | — | đạn là **viên đạn súng trường cam**, không phải quả pháo sắt |
| 2 | mortar | Mortar | ống cối xanh ô liu | P:dan_phao | P:chop | P:fx_no_phao | — | bom chùm: P:dan_phao nhỏ | — | không có vỏ cối ô liu / bom chùm riêng |
| 3 | bomhen | Time Bomb | bom đen mặt đồng hồ, ngòi cháy | P:dan_phao | P:chop | P:fx_no_phao, P:tia_lua, C:vong | — | bom dính quái P:ic_bom (dự phòng dan_phao) + C:đếm ngược | — | ic_bom là bom tròn thường, **không có mặt đồng hồ** |
| 4 | min | Mine Layer | thùng ô liu + mìn gai đỏ | P:dan_phao | P:chop | P:fx_no_phao, C:cham `#ffd23f` | — | mìn trên đường P:hu_min | — | hu_min xám-cam nhỏ, khác mìn gai đỏ của đầu |
| 5 | bua | Hammer | búa thép sọc vàng-đen | P:dan_phao | P:chop | P:fx_no_phao, C:vong | — | — | — | **bắn đạn**, không có búa / sóng nện |
| 6 | nam | Iron Fist | nắm đấm máy đỏ | C:tiaTia (P:dan_tia kéo dài + C:đường) | — | P:fx_no_phao, C:vong | — | — | — | không có nắm đấm tên lửa |
| 7 | loren | Scrap Forge | đe + búa, kim loại nóng chảy | P:dan_phao | P:chop | P:fx_no_phao, C:cham `#ff6a1a` | — | HU.no + C:tiaTia | — | không có mảnh sắt nóng chảy |
| 8 | phagiap | Armor Breaker | mũi khoan cam | P:dan_tia (xanh) | P:chop | P:fx_dien | C:cham tím (yếu) | — | — | tia xanh lam ≠ mũi khoan cam |
| 9 | lien | Gatling | nòng xoay xám, vòng đỏ | P:dan_lien + C:vet | P:chop | P:tia_lua | — | — | — | gần khớp (giữ phong cách, thêm vỏ đạn) |
| 10 | phun | Scatter | 5 nòng đồng | P:dan_lien + C:vet | P:chop | P:tia_lua | — | — | — | gần khớp; nên là chùm bi đồng |
| 11 | sungluc | Revolver | ổ quay đồng | C:tiaTia (P:dan_tia + C:đường `#ffd080`) | P:chop | P:tia_lua, C:bui vỏ đạn | — | — | — | tia xanh lam kéo dài; nên là đạn đồng |
| 12 | xucxac | Dice Gun | **xúc xắc trắng chấm đỏ** | P:dan_phao (vòng cung) | P:chop | P:fx_no_phao, P:tia_lua | — | — | — | **LỆCH RÕ: bắn viên đạn cam chung, không phải xúc xắc** |
| 13 | tia | Sniper | súng trường mảnh xanh lá | C:tiaTia (P:dan_tia + C:đường `#9fdcff`) | P:chop | C:cham `#9fdcff` | — | — | — | tia xanh lam ≠ xanh lá |
| 14 | no5 | Fifth Shot | ổ 5 buồng xanh lam | P:dan_tia + C:vet | P:chop | P:fx_no_phao, C:vong, C:chấm | — | — | — | gần khớp màu, thiếu phát thứ 5 riêng |
| 15 | railgun | Railgun | thân tím, ray xanh | P:tia_laser + P:dan_tia + P:tia_lua + C:vạch nạp | — | P:fx_dien | — | HU.rail | — | tia_laser **hồng** ≠ ray xanh-tím |
| 16 | docton | Lone Ace | **lá át bích** | C:tiaTia + C:vệt | P:chop | — | — | — | — | không có lá bài |
| 17 | bang | Frost | pháo pha lê băng | P:dan_bang + C:vet + C:cham | P:chop | P:fx_bang_vo | chậm (chung) | — | — | khớp |
| 18 | kiembang | Ice Blade | kiếm băng chuôi bông tuyết | P:dan_bang | P:chop | P:fx_bang_vo, C:vong ×2 | chậm | — | — | mảnh băng ≠ lưỡi kiếm |
| 19 | baotuyet | Blizzard | quả cầu tuyết | — (xung) | — | P:fx_bang_vo | chậm / đứng: C:cham | tuyết rơi P:hat_tuyet | — | thiếu khối băng đóng quái |
| 20 | lanhgia | Chiller | quạt xanh bông tuyết | — (hỗ trợ) | — | — | — | P:sup_lanhgia, P:sup_link, C:cham hạt lạnh | — | không có gió lạnh từ quạt |
| 21 | khoathoigian | Chrono Lock | **ổ khoá vàng + đồng hồ** | P:dan_bang | P:chop | P:fx_bang_vo, C:vong | khoá: P:hu_khoa + C:kim/lục giác | — | — | đạn băng xanh; hu_khoa ngọc lam, không có ổ khoá vàng |
| 22 | guongcong | Mirror Gate | khung gương xanh | P:dan_bang | P:chop | C:mảnh gương ×3 | — | P:hu_manhguong | — | gần khớp |
| 23 | khien | Shield Gen | vòm khiên lục giác xanh | P:dan_bang | P:chop | C:vong | — | P:sup_khien | — | thiếu khiên lục giác |
| 24 | taylo | Cleanser | viên nang trắng + bọt | P:tia_lua (trắng → C:cham) | P:chop | — | — | P:sup_taylo | — | không có bong bóng |
| 25 | doc | Venom | bình sinh hoá xanh chanh rỉ nhựa | P:dan_doc + C:vet + C:cham | — | — | độc (chung) | P:fx_khoi_doc mây | — | gần khớp (nên là cục nhựa nhỏ giọt) |
| 26 | vungdoc | Toxic Pool | thùng tràn nhựa độc | P:dan_doc | P:chop | P:fx_khoi_doc | độc | vũng: P:fx_khoi_doc (HU.may) | — | không có vũng độc trên đường |
| 27 | tuthan | Reaper Pillar | trụ pha lê xanh + lưỡi hái | — (hỗ trợ) | — | — | — | P:sup_tuthan + chữ REAPED | — | không có lưỡi hái |
| 28 | nhanmana | Mana Doubler | 2 quả cầu xanh lục | P:tia_lua (tím → C:cham) | P:chop | — | — | C:hạt mana | — | tím ≠ xanh lục |
| 29 | set | Tesla | cuộn đồng, sét hồng | P:tia_set (vàng) + C:đường gấp khúc | — | P:fx_dien | — | HU.set | — | sét vàng; đầu là sét hồng-vàng |
| 30 | bao | Storm Gun | xoáy tím có sét | P:tia_set + C:đường, C:tiaTia | P:chop | P:fx_dien | — | — | — | **sét vàng ≠ bão tím** |
| 31 | epxung | Overclock | bánh răng cam + tia sét + hơi | P:dan_tia | P:chop | P:fx_dien, C:cham `#ff9a3a` | — | HU.no | — | tia xanh lam ≠ sét cam |
| 32 | nangluong | Energy Cannon | ống plasma xanh lam | P:tia_lua (cam) | P:chop | P:fx_dien | — | — | — | tia lửa cam ≠ plasma xanh |
| 33 | anhsang | Lighthouse | **ngọn hải đăng** | P:tia_lua (HU.cauSang) | — | C:cham `#fff6c0` | — | cầu sáng bay | — | **không có chùm sáng hải đăng** |
| 34 | aten | Purifier | mặt trời có cánh vàng | P:dan_tia (xanh) | P:chop | P:fx_no_phao, C:vong | — | — | — | tia xanh ≠ vàng thánh |
| 35 | haoquang | Holy Halo | sao có cánh + vầng hào quang | C:tiaTia + P:dan_tia | P:chop | P:fx_laser_trung (hồng) | cháy C:cham | C:vong + C:chớp màn | — | trúng hồng ≠ vàng thánh |
| 36 | hasao | Star Breaker | sao vàng bị búa đập | C:tiaTia + P:dan_tia | P:chop | — | — | — | — | không có mảnh sao vỡ |
| 37 | nangsao | Star Lift | sao vàng + mũi tên lên | P:tia_lua | P:chop | — | — | chữ +1★ | — | chung |
| 38 | vughep | Merge King | vương miện vàng-tím | P:tia_lua | P:chop | — | — | — | — | chung |
| 39 | santhuong | Bounty Beacon | đồng xu $ xanh-vàng | P:tia_lua | P:chop | — | truy nã P:ic_truyna + C:lục giác | — | — | đạn chung (dấu truy nã khớp) |
| 40 | pandora | Pandora Vault | rương tím-vàng | P:dan_phao / P:tia_lua | P:chop | P:fx_bang_vo / P:fx_no_phao, C:vong | đứng | vòng quay P:pandora_dia + C:vẽ | — | pandora_dia là ổ quay đồng (giống Revolver) |
| 41 | blackhole | Black Hole | xoáy tím 4 cánh | — | P:chop | P:fx_laser_trung | kéo | P:hu_hoden + C:xoắn/gradient + C:vong | — | khớp (thiếu viên đạn xoáy nhỏ) |
| 42 | dichchuyen | Teleporter | 2 cổng tím + lam | P:tia_lua (C:cham lam) | P:chop | C:vong | — | HU.no | — | không có cổng |
| 43 | tron | Fusion Mixer | máy xay tím xoáy | P:tia_lua (C:cham vàng) | P:chop | — | — | — | — | chung |
| 44 | xaotron | Scrambler | xoáy tím 2 mũi tên | P:tia_lua (C:cham hồng) | P:chop | — | — | — | — | chung |
| 45 | mana | Mana Core | pha lê tím | — | — | — | — | P:sup_mana + C:hạt tím | — | chung |
| 46 | hutmana | Mana Leech | nanh vuốt đỏ + hồng ngọc | P:dan_tia (+C:tím) | P:chop | — | — | P:sup_mana | — | tia xanh ≠ nanh đỏ |
| 47 | khuech | Amplifier | loa tím | — | — | — | — | P:sup_khuech, P:sup_link_vang | — | thiếu sóng âm |
| 48 | saochep | Copycat | ô vuông nét đứt | P:tia_lua (C:cham vàng) | P:chop | — | — | — | — | chung |
| 49 | chimang | Crit Antenna | chảo đỏ có ăng-ten | — | — | — | — | P:sup_chimang | — | thiếu xung đỏ |
| 50 | radar | Radar | màn radar xanh lá | — | — | — | — | C:xung ping (cam) + P:sup_radar | — | xung **cam** ≠ màn xanh lá |
| 51 | thaukinh | Focus Lens | thấu kính xanh viền vàng | — | — | — | — | (chỉ buff, không hình) | — | không có tia hội tụ |
| 52 | luoicheo | Resonance Grid | lưới kim cương ngọc lam | — | — | — | — | C:ping | s2 C:vòng tia lam · s3 C:g_vong_ngoc | khá khớp màu, toàn code |
| 53 | laser | Laser | nón tím, đầu phát hồng | P:tia_laser + C:cham | — | P:fx_laser_trung | — | — | — | khớp |
| 54 | nemesis | Nemesis | cân công lý + mắt đỏ | C:tiaTia + P:dan_tia | P:chop | — | — | HU.chem (P:dan_tia lưỡi + P:fx_no_phao) + chữ JUDGED | — | không có lưỡi phán xử đỏ |
| 55 | nhatthuc | Eclipse | mặt trời đen viền lửa | C:tiaTia + P:dan_tia | — | P:fx_laser_trung | cháy, chậm | P:hu_trangkhuyet (lam) + C:cung ×4 | — | trăng khuyết **xanh lam** ≠ nhật thực cam-đen |
| 56 | marionette | Marionette | thanh rối + rèm đỏ | P:tia_lua (C:cham hồng) | P:chop | P:fx_no_phao | đứng | HU.roi C:dây rối + C:vong | — | dây rối vẽ code |
| 57 | cauvong | Rainbow | lăng kính phát cầu vồng | P:tia_lua (C:cham hồng) | P:chop | — | cầu vồng C:cham 5 màu | P:hu_cauvong (cam) + C:vẽ | — | hu_cauvong là ống cam ≠ cầu vồng |
| 58 | mimic | Mimic | khối cầu vồng có nanh | P:tia_lua | — | C:cham màu ngẫu nhiên | — | — | — | chung |
| 59 | combo | Combo Core | đĩa vạch hồng | P:tia_lua | P:chop | C:vong, C:vẽ ×3 | — | — | — | chung |
| 60 | nayda | Ricochet | **đĩa cưa xanh chanh** | P:hu_luoicua + C:vẽ đuôi | P:chop | P:fx_dien, C:cham `#d6ff3a`, C:vong | — | — | — | **khớp** (giữ) |
| 61 | drone | Drone Bay | nhà chứa vàng có drone | P:dan_lien | P:chop | P:fx_dien / P:fx_no_phao | — | drone bay P:drone_nong (**ảnh đầu ụ cũ**) + C:vẽ | — | dùng nguyên ảnh đầu ụ làm drone |
| 62 | chuato | Hive Queen | **tổ ong hổ phách + ong** | C:g_ngoi (ngòi) | P:chop | C:cham `#ffc23a` | đánh dấu | ong máy C:veDrone, HU.ongLao P:fx_no_phao + C:vẽ | 3 dạng (ATK) | ong vẽ code |
| 63 | kepha | Jammer | càng kẹp cam | P:dan_tia | P:chop | — | — | — | — | không có càng kẹp |
| 64 | nhieusong | Signal Jammer | tháp sóng đỏ | P:dan_tia (tím) | P:chop | — | chậm + nhiễu: C:tâm ngắm | — | — | tím ≠ đỏ |
| 65 | maychem | Guillotine | khung máy chém đỏ | P:dan_tia | P:chop | P:fx_no_phao, C:cham đỏ | — | lưỡi rơi HU.chem P:dan_tia | — | lưỡi = tia xanh lam |
| 66 | sinhdoi | Twin Maker | 2 vòng ngọc lam | P:dan_tia | P:chop | — | — | — | — | chung |
| 67 | nhanban | Cloner | máy photo, giấy cam | P:dan_tia | P:chop | — | — | — | — | chung |
| 68 | loa | Cooldown Horn | kèn vàng + đồng hồ cát | P:tia_lua (C:cham vàng) | P:chop | C:vong ×2 | — | — | — | không có sóng kèn |
| 69 | wallgen | Wall Projector | **tường gạch hologram cam** | — | P:chop | P:fx_dien / P:fx_no_phao | đứng | HU.tuong P:tia_laser + P:tia_set + C:vẽ ×4 | — | tường = tia hồng + sét vàng ≠ gạch cam |
| 70 | khoisinh | Genesis Core | mầm xanh trong vỏ vàng | — | — | — | — | HU.cungSang C:cung sáng, C:vong, C:vẽ ×5 | 3 dạng (ATK) | toàn code |
| 71 | leviathan | Leviathan | rắn biển ngọc lam + sóng | C:g_bot bọt | P:chop | C:cham | đứng | HU.xoay C:xoáy, HU.thoThuy P:tia_laser (hồng) + C:vẽ | 3 dạng (ATK) | bọt code; hơi thở = laser hồng |
| 72 | ronglua | Wyrm Engine | đầu rồng đỏ phun lửa | C:nón lửa `anhNon` (canvas) | — | — | cháy C:cham | HU.vetChay C:vẽ, HU.rongBo C:bóng rồng (19 lệnh vẽ) | s1/s2/s3 C:nón cam/lam/trắng | **toàn code** |
| 73 | overlord | Overlord | huy hiệu quỷ đỏ, sét | — | P:chop | P:fx_dien / P:fx_no_phao | — | HU.sam P:tia_set + C:chớp màn | s2 C:gArc · s3 C:gCot cột trời + C:gXem | sét vàng ≠ đỏ |
| 74 | orbital | Orbital | vệ tinh pin mặt trời | P:dan_tia | P:chop | P:fx_dien | — | HU.vetinh P:tia_laser | s2 C:g_tia_lam + C:gTam · s3 C:gGiao giáo trời | toàn code ở dạng 2/3 |
| 75 | dongbo | Sync Cannon | vòng quỹ đạo lam-vàng | P:dan_tia | P:chop | P:fx_dien | — | — | s1 C:g_xi_vang2 · s2 C:gSong · s3 C:gTiaVang | dạng toàn code |
| 76 | ngoisao | Star Cannon | sao vàng + vòng lam | P:tia_lua | P:chop | C:cham `#ffe46b` | — | — | s1/s2 C:g_sao_nho · s3 C:g_sao_choi + C:gNoSao + C:gThienThach | toàn code |
| 77 | cuongno | Berserker | mặt nạ quỷ đỏ 2 nòng | P:dan_lien | P:chop | C:cham `#ff7a3a` | — | — | s2 C:g_dan_cam · s3 C:g_dan_do + C:vỏ đạn | đạn code |
| 78 | soi | Werewolf | **đầu sói máy** | — | — | — | — | HU.vuot P:dan_tia (vệt cào xanh) | s1–3 C:gVuot cung vuốt · s3 C:gLuot bóng sói | vết cào = tia xanh lam |
| 79 | cuuvi | Nine-Tail | mặt nạ cáo + đuôi lửa | P:tia_lua | P:chop | — | — | HU.hoHoa C:cham | s1 C:g_ho_cam · s2 C:gHoBay · s3 C:g_ho_xanh | lửa cáo code |
| 80 | hopbi | Mystery Box | thùng gỗ dấu ? | — | — | — | — | C:hạt tím | s1 C:g_the_tim · s2 C:g_hoi (chữ "?" vẽ code) · s3 C:hoa giấy | toàn code |
| 81 | lophanung | Cryo Reactor | lò phản ứng pha lê băng | — | — | P:fx_bang_vo | chậm / đứng | HU.voBang, C:vong | s1 C:vòng băng · s2 C:g_kim_bang · s3 C:gBaoLuoi + C:gSuong | toàn code |
| 82 | hydra | Hydra | 3 đầu rắn xanh ngọc | C:tiaTia | P:chop | C:cham `#7dffc4` | — | HU.hydraTia P:tia_laser + C:vẽ ×5 | s1 C:g_kim_ngoc · s2 C:gDauAn · s3 tia hợp | dạng toàn code |
| 83 | lienket | Chain Link | vòng xích tím + ngọc | P:dan_tia | P:chop | P:fx_dien | — | HU.set | s1 C:g_vong_tim · s2 C:gDay · s3 C:gXich | toàn code |
| 84 | ngaithoigian | Chrono Throne | ngai vàng + đồng hồ | C:tiaTia | P:chop | — | chậm C:thrAura | HU.rewind C:vẽ ×11 | s1 C:g_kim_gio · s2 C:gDauGio · s3 C:gKim | toàn code |
| 85 | tienhoa | Evolver | ống ADN xanh lá + lá | — | — | P:fx_no_phao | — | — | s1 C:g_xi_vang · s2 C:g_xi_nong · s3 C:gTiaVang | **hổ phách/vàng ≠ ADN xanh lá** |

**Kết luận kiểm kê:** đạn hiện tại gom về 6 ảnh chung (`dan_phao` 8 ụ, `dan_lien` 4, `dan_tia` 14 ụ bay + 12 ụ dùng làm vệt tia `tiaTia`, `dan_bang` 5, `dan_doc` 2, `tia_lua` 19 — 13 ụ dùng `tia_lua` có màu riêng nên rơi về chấm gradient code). Chỉ **Ricochet** và **Black Hole** có hình khớp đầu mới. Mọi dạng 1/2/3 của 15 ụ đổi dạng là sprite canvas — vi phạm `QUY-TAC-HINH.md` mục 1, phải thay bằng PNG ở mục 3 bên dưới.


---

## 2. QUY ƯỚC CHUNG CHO HIỆU ỨNG MỚI

**Bố cục mỗi tờ ụ (4×4, 1024×1024 → ô 256×256):** mỗi HÀNG = 1 ụ, 4 CỘT = `dan` (đạn / vật bay) · `no` (chớp nòng) · `trung` (nổ khi trúng) · `hieu` (trạng thái trên quái / vật thể kỹ năng / hào quang).

| Hậu tố file | Nội dung | Hướng vẽ | Cỡ lưu (2× DPR) | Code dùng thế nào |
|---|---|---|---|---|
| `fx_<id>_dan.png` | đạn / vật bay | mũi hướng **PHẢI (+x)** | 64×64 | `veDan`: thay `d.img`; xoay theo `d._g` (hướng bay). Vật tròn/lăn (xúc xắc, búa, lá bài, đồng xu, đĩa cưa, bánh răng) cộng thêm tự xoay `d._ra × tốcXoay`. Rộng vẽ = `d.co` hiện tại. Vệt sau đạn: `fx_vet_trang` tô màu (thay `REN.vet` code). |
| `fx_<id>_no.png` | chớp đầu nòng | gốc ở **mép TRÁI giữa ô** (đặt tại `dauNong`), loé sang phải | 64×64 | thay `FX.no('chop_nong')` riêng theo ụ. Ảnh 1 khung: phóng 0.55→1.15 ease-out, alpha (1−u)², sống 0.08–0.12 s, bám nòng (giữ logic `A.T` hiện có). |
| `fx_<id>_trung.png` | nổ khi trúng | tâm ô | 128×128 | thay `FX.no('no_phao'/'dien'/'bang_vo'/'laser_trung')` của ụ đó. 1 khung: xoay ngẫu nhiên, phóng 0.6→1.1, mờ sau 65% thời gian, ≤0.26 s (giữ ngân sách `FX.no`). |
| `fx_<id>_hieu.png` | trạng thái / vật thể kỹ năng | tâm ô | 96×96 (vật trên đường 128) | đặt trên quái/ụ/đường; chỉ nhịp thở (scale ±6%), xoay chậm, mờ — **không** vẽ thêm vòng/gradient code. |
| `fx_<id>_dan2/dan3/trung3/dacbiet.png` | dạng 2/3 của ụ đổi dạng (tờ G) | như trên | như trên | `growfx.js`: thay các sprite canvas `g_*` + các `HU.g*` vẽ bằng arc/gradient. |
| `fx_<id>_tia.png` | thân tia / sét / chùm sáng (tờ B) | dải ngang, **lặp được trái-phải** | 512×48 | `REN.tia(ctx, 'fx_<id>_tia', x0,y0,x1,y1, rộng, cuộn)` — thay `tia_laser`, `tia_set`, `dan_tia` kéo dài và các đường `lineTo` phụ. Sét giữ `R.set` chia đoạn rung, chỉ đổi tên ảnh. |
| `fx_st_<trạng thái>.png` | trạng thái chung trên quái (tờ ST) | tâm ô | 96×96 | `quaianim.js`: thay quầng `cham1` (chậm/yếu/cầu vồng/giáp) và hạt code (độc/cháy); thêm hình cho **choáng** (đang không có). |

**Mặc định 1 khung tĩnh** (code chỉ phóng/xoay/mờ — đúng `QUY-TAC-HINH.md` mục 3). Nếu sau này muốn hoạt ảnh thật cho nổ, gen thêm dải 1×6 cùng tên + `_6f` (dùng `khungMuot` như `fx_no_phao`).

**Quy trình:** gen → cắt khoá magenta (dùng lại `tools/thap-cat-s89.py` hoặc script cắt lưới 4×4) → thu cỡ như bảng → lưu bản gốc tờ ở `docs/demo-hop-tuong/thap-art/fx/fx_sheet_<mã tờ>.png`, ảnh cắt vào `thap/assets/`. **Đính kèm** khi gen: 4 ảnh đầu ụ `docs/demo-hop-tuong/thap-art/redo/<id>_nong_v2.png` của tờ (tờ ST/hạt chung: đính kèm 2–3 tờ đã gen trước để giữ phong cách).

**Họ màu (giữ dễ đọc):** nổ/cam = Cannon, Mortar, Time Bomb, Mine, Hammer, Fist, Forge, Drill · đồng thau = Gatling, Scatter, Revolver · băng lam = Frost, Ice Blade, Blizzard, Chiller, Cryo · ngọc lam = Chrono Lock, Resonance, Leviathan · xanh lá độc = Venom, Toxic Pool, Reaper, Hydra, Evolver · tím phép = Black Hole, Teleporter, Mixer, Scrambler, Mana, Amplifier, Chain Link · vàng thánh/sao = Lighthouse, Purifier, Halo, Star*, Merge King, Bounty, Sync · đỏ = Overlord, Berserker, Nemesis, Guillotine, Signal Jammer, Crit Antenna · riêng biệt = Dice (trắng-đỏ), Ricochet (chanh), Hive (hổ phách), Werewolf (hổ phách → đỏ thẫm), Rainbow/Mimic (cầu vồng), Combo (hồng), Wall (cam hologram).

---

## 3. THIẾT KẾ + PROMPT — 22 TỜ Ụ (T01–T22)


### Tờ T01 — Cannon (`canon`), Mortar (`mortar`), Time Bomb (`bomhen`), Mine Layer (`min`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Cannon** `canon` | black iron cannonball with a bronze band and tiny orange glow | big orange-bronze muzzle blast with a smoke ring | orange fireball explosion with bronze shrapnel | scorched ground mark, dark ring with embers | dan thay dan_phao, giữ vòng cung (cong 30), KHÔNG xoay theo hướng (quả cầu) – chỉ tự lăn 180°/s; trung cỡ = 2.5×bán kính nổ; hieu = vết cháy nằm dưới quái 0.6 s |
| **Mortar** `mortar` | olive-green finned mortar shell | upward olive smoke-and-fire puff | cluster of 3 small fireballs | small olive bomblet | dan vòng cung, xoay theo tiếp tuyến; hieu = bom chùm con (thay dan_phao nhỏ), rơi + nổ bằng fx_mortar_trung ×0.6 |
| **Time Bomb** `bomhen` | round black bomb with a white clock face and lit fuse spark | orange fuse-spark flash | big orange-red explosion with tiny clock gears | clock-face timer bomb stuck on an enemy, fuse burning | hieu thay ic_bom (bom dính quái): nhịp phóng 1.0→1.12 theo đếm ngược, nhanh dần; trung khi nổ ×1.4 |
| **Mine Layer** `min` | small red spiked naval mine | olive hatch puff | red-orange spiky explosion | armed red spiked mine lying flat with a blinking light | hieu thay hu_min (mìn trên đường), đèn nháy = alpha 2 Hz của chính ảnh; dan vòng cung tự xoay 360°/s |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/canon_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/mortar_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/bomhen_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/min_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Cannon (bronze cannon): [1] black iron cannonball with a bronze band and tiny orange glow [2] big orange-bronze muzzle blast with a smoke ring [3] orange fireball explosion with bronze shrapnel [4] scorched ground mark, dark ring with embers.
Row 2: Mortar (olive mortar tube): [1] olive-green finned mortar shell [2] upward olive smoke-and-fire puff [3] cluster of 3 small fireballs [4] small olive bomblet.
Row 3: Time Bomb (black bomb with clock face and lit fuse): [1] round black bomb with a white clock face and lit fuse spark [2] orange fuse-spark flash [3] big orange-red explosion with tiny clock gears [4] clock-face timer bomb stuck on an enemy, fuse burning.
Row 4: Mine Layer (olive crate with red spiked mines): [1] small red spiked naval mine [2] olive hatch puff [3] red-orange spiky explosion [4] armed red spiked mine lying flat with a blinking light.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_canon_dan.png` · `fx_canon_no.png` · `fx_canon_trung.png` · `fx_canon_hieu.png` · `fx_mortar_dan.png` · `fx_mortar_no.png` · `fx_mortar_trung.png` · `fx_mortar_hieu.png` · `fx_bomhen_dan.png` · `fx_bomhen_no.png` · `fx_bomhen_trung.png` · `fx_bomhen_hieu.png` · `fx_min_dan.png` · `fx_min_no.png` · `fx_min_trung.png` · `fx_min_hieu.png` · tờ gốc `fx_sheet_T01.png`


### Tờ T02 — Hammer (`bua`), Iron Fist (`nam`), Scrap Forge (`loren`), Armor Breaker (`phagiap`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Hammer** `bua` | spinning steel hammer head with a yellow-black hazard band | grey dust burst | ground-crack shockwave with rubble | ring of small yellow dizzy stars | dan tự xoay 540°/s (bỏ hướng bay); trung nằm phẳng dưới quái; hieu = choáng (nếu có) xoay chậm trên đầu quái |
| **Iron Fist** `nam` | red rocket-powered mech fist with a flame jet, pointing right | red exhaust burst | white-red punch impact starburst | dented impact mark with small stars | dan thay tiaTia: bay thẳng sp 600, xoay theo hướng; trung ×1.2 khi đòn mạnh |
| **Scrap Forge** `loren` | red-hot chunk of scrap with bolts and a gear | orange forge-spark burst | molten metal splash | small glowing scrap pile with embers | dan vòng cung tự xoay 300°/s; hieu = mảnh sắt nóng đọng 1 s rồi mờ |
| **Armor Breaker** `phagiap` | spinning orange drill bit pointing right | drill dust and sparks | steel armor plate cracking apart | cracked broken shield mark | dan xoay theo hướng + lắc ±4° nhanh (giả quay); hieu = dấu phá giáp thay quầng tím cham1, đặt trên đầu quái |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/bua_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nam_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/loren_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/phagiap_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Hammer (steel hammer with hazard stripes): [1] spinning steel hammer head with a yellow-black hazard band [2] grey dust burst [3] ground-crack shockwave with rubble [4] ring of small yellow dizzy stars.
Row 2: Iron Fist (red mechanical fist): [1] red rocket-powered mech fist with a flame jet, pointing right [2] red exhaust burst [3] white-red punch impact starburst [4] dented impact mark with small stars.
Row 3: Scrap Forge (anvil with glowing hot metal): [1] red-hot chunk of scrap with bolts and a gear [2] orange forge-spark burst [3] molten metal splash [4] small glowing scrap pile with embers.
Row 4: Armor Breaker (orange drill): [1] spinning orange drill bit pointing right [2] drill dust and sparks [3] steel armor plate cracking apart [4] cracked broken shield mark.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_bua_dan.png` · `fx_bua_no.png` · `fx_bua_trung.png` · `fx_bua_hieu.png` · `fx_nam_dan.png` · `fx_nam_no.png` · `fx_nam_trung.png` · `fx_nam_hieu.png` · `fx_loren_dan.png` · `fx_loren_no.png` · `fx_loren_trung.png` · `fx_loren_hieu.png` · `fx_phagiap_dan.png` · `fx_phagiap_no.png` · `fx_phagiap_trung.png` · `fx_phagiap_hieu.png` · tờ gốc `fx_sheet_T02.png`


### Tờ T03 — Gatling (`lien`), Scatter (`phun`), Revolver (`sungluc`), Dice Gun (`xucxac`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Gatling** `lien` | steel tracer bullet with a red tip and short yellow streak | three-prong gatling muzzle star | small yellow spark pop | ejected brass shell casing | giữ vệt chung (đổi sang fx_vet_trang tô #ffb347); hieu = vỏ đạn văng ngang 0.3 s mỗi 3 phát |
| **Scatter** `phun` | cluster of three small brass pellets | wide fan-shaped brass muzzle blast | tiny brass spark pop | small dust puff | no rộng: phóng ngang ×1.4; dan dùng cho mỗi tia của chùm |
| **Revolver** `sungluc` | brass revolver bullet | sharp gold star muzzle flash | gold spark impact | brass shell casing | bỏ tiaTia (tia kéo dài) → đạn bay sp 900 + fx_sungluc_tia ngắn nếu muốn vệt; hieu thay bụi code vỏ đạn |
| **Dice Gun** `xucxac` | small white die with red pips, tumbling | white flash with tiny red pips | burst of red pips and tiny dice shards | glowing white die showing six red pips (max roll) | dan thay dan_phao: bay THẲNG (bỏ cong), tự xoay 720°/s, co 18; trung ×1.5 khi roll ≥240; hieu hiện 0.4 s trên quái khi chí mạng |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/lien_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/phun_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/sungluc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/xucxac_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Gatling (grey multi-barrel gun with red ring): [1] steel tracer bullet with a red tip and short yellow streak [2] three-prong gatling muzzle star [3] small yellow spark pop [4] ejected brass shell casing.
Row 2: Scatter (brass five-barrel gun): [1] cluster of three small brass pellets [2] wide fan-shaped brass muzzle blast [3] tiny brass spark pop [4] small dust puff.
Row 3: Revolver (brass revolver cylinder): [1] brass revolver bullet [2] sharp gold star muzzle flash [3] gold spark impact [4] brass shell casing.
Row 4: Dice Gun (white die with red pips): [1] small white die with red pips, tumbling [2] white flash with tiny red pips [3] burst of red pips and tiny dice shards [4] glowing white die showing six red pips (max roll).
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_lien_dan.png` · `fx_lien_no.png` · `fx_lien_trung.png` · `fx_lien_hieu.png` · `fx_phun_dan.png` · `fx_phun_no.png` · `fx_phun_trung.png` · `fx_phun_hieu.png` · `fx_sungluc_dan.png` · `fx_sungluc_no.png` · `fx_sungluc_trung.png` · `fx_sungluc_hieu.png` · `fx_xucxac_dan.png` · `fx_xucxac_no.png` · `fx_xucxac_trung.png` · `fx_xucxac_hieu.png` · tờ gốc `fx_sheet_T03.png`


### Tờ T04 — Sniper (`tia`), Fifth Shot (`no5`), Railgun (`railgun`), Lone Ace (`docton`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Sniper** `tia` | thin green tracer bolt | thin green-white muzzle spike | green headshot spark ring | green sniper crosshair mark | vệt bắn dùng fx_tia_tia (tờ B1) thay dan_tia kéo dài + đường code; hieu = tâm ngắm trên mục tiêu 0.25 s trước khi bắn |
| **Fifth Shot** `no5` | blue energy bolt | blue ring muzzle flash | blue energy burst | large blue exploding bolt with orange core (5th shot) | hieu dùng làm ĐẠN phát thứ 5 (3 viên, co ×1.4) nổ bằng fx_no5_trung ×1.6 |
| **Railgun** `railgun` | blue-violet charge orb | violet rail discharge flash with blue sparks | blue-violet piercing impact | blue charge-up glow ring | tia xuyên = fx_railgun_tia (B1) thay tia_laser hồng; hieu = vòng nạp ở đầu nòng phóng 0.3→1 trong thời gian nạp (thay vạch code) |
| **Lone Ace** `docton` | spinning ace of spades playing card | red card-fan flash | black spade-shaped burst with red sparks | red spade mark above enemy | dan thay tiaTia: lá bài bay sp 800 tự xoay 900°/s; vệt chém dùng fx_docton_tia (B3) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/tia_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/no5_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/railgun_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/docton_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Sniper (slim green rifle): [1] thin green tracer bolt [2] thin green-white muzzle spike [3] green headshot spark ring [4] green sniper crosshair mark.
Row 2: Fifth Shot (five-chamber blue revolver cylinder): [1] blue energy bolt [2] blue ring muzzle flash [3] blue energy burst [4] large blue exploding bolt with orange core (5th shot).
Row 3: Railgun (sleek violet gun with blue rails): [1] blue-violet charge orb [2] violet rail discharge flash with blue sparks [3] blue-violet piercing impact [4] blue charge-up glow ring.
Row 4: Lone Ace (ace of spades card emblem): [1] spinning ace of spades playing card [2] red card-fan flash [3] black spade-shaped burst with red sparks [4] red spade mark above enemy.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_tia_dan.png` · `fx_tia_no.png` · `fx_tia_trung.png` · `fx_tia_hieu.png` · `fx_no5_dan.png` · `fx_no5_no.png` · `fx_no5_trung.png` · `fx_no5_hieu.png` · `fx_railgun_dan.png` · `fx_railgun_no.png` · `fx_railgun_trung.png` · `fx_railgun_hieu.png` · `fx_docton_dan.png` · `fx_docton_no.png` · `fx_docton_trung.png` · `fx_docton_hieu.png` · tờ gốc `fx_sheet_T04.png`


### Tờ T05 — Frost (`bang`), Ice Blade (`kiembang`), Blizzard (`baotuyet`), Chiller (`lanhgia`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Frost** `bang` | cyan ice crystal shard | frosty mist puff | ice shatter burst | thin icy crust ring around a target | thay dan_bang/bang_vo cho riêng Frost; hieu dùng cho trạng thái chậm do Frost (thay quầng cham1) |
| **Ice Blade** `kiembang` | spinning ice sword blade | icy slash flash | X-shaped ice slash | small frostbite crystals cluster | dan tự xoay 720°/s; trung xoay ngẫu nhiên ±30° |
| **Blizzard** `baotuyet` | snowball with a snowflake | snow puff | big snowflake burst | enemy-sized translucent ice block | hieu = quái bị ĐÓNG (đè lên quái, mờ 0.85); xung bão phát fx_baotuyet_trung ×2 tại ụ |
| **Chiller** `lanhgia` | blue cold-wind gust swirl | fan blast puff | frost sparkle | swirling blue wind aura ring | hỗ trợ: dan = xung bay tới ô được buff (thay sup_link chảy); hieu xoay 60°/s quanh ụ được buff |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/bang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/kiembang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/baotuyet_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/lanhgia_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Frost (ice crystal cannon): [1] cyan ice crystal shard [2] frosty mist puff [3] ice shatter burst [4] thin icy crust ring around a target.
Row 2: Ice Blade (ice sword with snowflake hilt): [1] spinning ice sword blade [2] icy slash flash [3] X-shaped ice slash [4] small frostbite crystals cluster.
Row 3: Blizzard (snow globe with snowflake): [1] snowball with a snowflake [2] snow puff [3] big snowflake burst [4] enemy-sized translucent ice block.
Row 4: Chiller (blue fan with snowflake): [1] blue cold-wind gust swirl [2] fan blast puff [3] frost sparkle [4] swirling blue wind aura ring.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_bang_dan.png` · `fx_bang_no.png` · `fx_bang_trung.png` · `fx_bang_hieu.png` · `fx_kiembang_dan.png` · `fx_kiembang_no.png` · `fx_kiembang_trung.png` · `fx_kiembang_hieu.png` · `fx_baotuyet_dan.png` · `fx_baotuyet_no.png` · `fx_baotuyet_trung.png` · `fx_baotuyet_hieu.png` · `fx_lanhgia_dan.png` · `fx_lanhgia_no.png` · `fx_lanhgia_trung.png` · `fx_lanhgia_hieu.png` · tờ gốc `fx_sheet_T05.png`


### Tờ T06 — Chrono Lock (`khoathoigian`), Mirror Gate (`guongcong`), Shield Gen (`khien`), Cleanser (`taylo`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Chrono Lock** `khoathoigian` | small gold padlock with teal glow | teal-gold tick flash | padlock-click burst with gear sparks | teal hexagon time cage with a gold padlock | dan thay dan_bang; hieu thay hu_khoa (kim đồng hồ vẽ code → bỏ, chỉ xoay nhẹ ảnh ±3°) |
| **Mirror Gate** `guongcong` | blue mirror glass shard | glass glint | shattered mirror shards | small mirror portal frame | trung thay 3 mảnh code; hieu thay hu_manhguong |
| **Shield Gen** `khien` | blue hexagon shield plate | hexagon ripple flash | hexagon shield bubble pop | blue hexagon shield bubble | hieu bọc ụ được khiên (thay vòng code), mờ 0.7 nhịp thở 1 Hz |
| **Cleanser** `taylo` | white-aqua cleansing bubble with a plus sign | bubble burst | bubble pop sparkle | ring of white-aqua cleanse sparkles | dan thay tia_lua tô trắng; hieu khi ghép tẩy ụ (thay hạt cham1) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/khoathoigian_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/guongcong_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/khien_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/taylo_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Chrono Lock (gold padlock with clock): [1] small gold padlock with teal glow [2] teal-gold tick flash [3] padlock-click burst with gear sparks [4] teal hexagon time cage with a gold padlock.
Row 2: Mirror Gate (blue mirror frame): [1] blue mirror glass shard [2] glass glint [3] shattered mirror shards [4] small mirror portal frame.
Row 3: Shield Gen (blue hexagon shield dome): [1] blue hexagon shield plate [2] hexagon ripple flash [3] hexagon shield bubble pop [4] blue hexagon shield bubble.
Row 4: Cleanser (white-blue capsule with bubbles): [1] white-aqua cleansing bubble with a plus sign [2] bubble burst [3] bubble pop sparkle [4] ring of white-aqua cleanse sparkles.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_khoathoigian_dan.png` · `fx_khoathoigian_no.png` · `fx_khoathoigian_trung.png` · `fx_khoathoigian_hieu.png` · `fx_guongcong_dan.png` · `fx_guongcong_no.png` · `fx_guongcong_trung.png` · `fx_guongcong_hieu.png` · `fx_khien_dan.png` · `fx_khien_no.png` · `fx_khien_trung.png` · `fx_khien_hieu.png` · `fx_taylo_dan.png` · `fx_taylo_no.png` · `fx_taylo_trung.png` · `fx_taylo_hieu.png` · tờ gốc `fx_sheet_T06.png`


### Tờ T07 — Venom (`doc`), Toxic Pool (`vungdoc`), Reaper Pillar (`tuthan`), Mana Doubler (`nhanmana`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Venom** `doc` | lime-green goo blob with a drip | green goo splash | goo splat | green poison drips and bubbles overlay | thay dan_doc cho Venom; hieu = trạng thái độc trên quái (thay hạt cham1 xanh) |
| **Toxic Pool** `vungdoc` | lobbed green goo glob | barrel spill splash | big green splash | bubbling toxic green puddle | hieu = vũng độc trên đường (nằm dưới quái, thay fx_khoi_doc của HU.may), phóng 0.4→1 khi đổ ra |
| **Reaper Pillar** `tuthan` | green soul wisp | green crystal flash | green scythe slash arc | ghostly green scythe over a target | hieu + trung khi xử tử (thay chữ REAPED hoặc kèm); dan = linh hồn bay từ quái về trụ |
| **Mana Doubler** `nhanmana` | pair of linked green mana orbs | green flash | green sparkle pop | two linked green orbs glowing | dan thay tia_lua tím; hieu trên ụ khi nhân mana |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/doc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/vungdoc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/tuthan_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nhanmana_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Venom (lime-green biohazard tank dripping goo): [1] lime-green goo blob with a drip [2] green goo splash [3] goo splat [4] green poison drips and bubbles overlay.
Row 2: Toxic Pool (tipped barrel spilling green goo): [1] lobbed green goo glob [2] barrel spill splash [3] big green splash [4] bubbling toxic green puddle.
Row 3: Reaper Pillar (green crystal pillar with scythe): [1] green soul wisp [2] green crystal flash [3] green scythe slash arc [4] ghostly green scythe over a target.
Row 4: Mana Doubler (twin green glowing orbs): [1] pair of linked green mana orbs [2] green flash [3] green sparkle pop [4] two linked green orbs glowing.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_doc_dan.png` · `fx_doc_no.png` · `fx_doc_trung.png` · `fx_doc_hieu.png` · `fx_vungdoc_dan.png` · `fx_vungdoc_no.png` · `fx_vungdoc_trung.png` · `fx_vungdoc_hieu.png` · `fx_tuthan_dan.png` · `fx_tuthan_no.png` · `fx_tuthan_trung.png` · `fx_tuthan_hieu.png` · `fx_nhanmana_dan.png` · `fx_nhanmana_no.png` · `fx_nhanmana_trung.png` · `fx_nhanmana_hieu.png` · tờ gốc `fx_sheet_T07.png`


### Tờ T08 — Tesla (`set`), Storm Gun (`bao`), Overclock (`epxung`), Energy Cannon (`nangluong`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Tesla** `set` | pink-gold ball lightning | copper coil discharge flash | pink-gold electric burst | pink static crackle on an enemy | sét chuỗi dùng fx_set_tia (B3) thay tia_set vàng (giữ R.set chia đoạn rung) |
| **Storm Gun** `bao` | violet storm orb crackling with lightning | violet spark flash | violet lightning burst | small purple storm cloud | sét dùng fx_bao_tia (B3); hieu = mây bão trên đầu quái bị đánh chuỗi |
| **Overclock** `epxung` | orange lightning bolt | steam puff with sparks | orange spark burst | spinning orange gear aura | dan thay dan_tia; hieu = vòng bánh răng xoay 90°/s quanh ụ được ép xung |
| **Energy Cannon** `nangluong` | blue plasma ball with an energy ring | blue energy ring flash | blue plasma burst | charged blue energy ring | dan thay tia_lua cam; trung thay fx_dien vàng |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/set_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/bao_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/epxung_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nangluong_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Tesla (copper coil with pink-gold lightning): [1] pink-gold ball lightning [2] copper coil discharge flash [3] pink-gold electric burst [4] pink static crackle on an enemy.
Row 2: Storm Gun (violet vortex with lightning): [1] violet storm orb crackling with lightning [2] violet spark flash [3] violet lightning burst [4] small purple storm cloud.
Row 3: Overclock (orange cog with lightning and steam): [1] orange lightning bolt [2] steam puff with sparks [3] orange spark burst [4] spinning orange gear aura.
Row 4: Energy Cannon (blue plasma capsule cannon): [1] blue plasma ball with an energy ring [2] blue energy ring flash [3] blue plasma burst [4] charged blue energy ring.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_set_dan.png` · `fx_set_no.png` · `fx_set_trung.png` · `fx_set_hieu.png` · `fx_bao_dan.png` · `fx_bao_no.png` · `fx_bao_trung.png` · `fx_bao_hieu.png` · `fx_epxung_dan.png` · `fx_epxung_no.png` · `fx_epxung_trung.png` · `fx_epxung_hieu.png` · `fx_nangluong_dan.png` · `fx_nangluong_no.png` · `fx_nangluong_trung.png` · `fx_nangluong_hieu.png` · tờ gốc `fx_sheet_T08.png`


### Tờ T09 — Lighthouse (`anhsang`), Purifier (`aten`), Holy Halo (`haoquang`), Star Breaker (`hasao`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Lighthouse** `anhsang` | warm yellow light orb | lighthouse lamp lens flare | golden sunburst glare | dazzled halo of light rays | chùm sáng chính = fx_anhsang_tia (B1) quét; dan = cầu sáng gọi ụ (thay tia_lua HU.cauSang) |
| **Purifier** `aten` | golden winged sun bolt | gold cross flare | holy sun-cross burst | gold-white purify sparkles | dan thay dan_tia xanh; trung thay fx_no_phao |
| **Holy Halo** `haoquang` | spinning golden halo ring | halo flash with feathers | holy golden cross burst | golden holy flames | tia = fx_haoquang_tia (B1); trung thay fx_laser_trung hồng; hieu = cháy thánh (thay than cham1) |
| **Star Breaker** `hasao` | jagged gold star shard | gold flash | star shatter with stone chips | cracked gold star mark | dan thay tiaTia; hieu trên ụ/quái bị hạ sao |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/anhsang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/aten_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/haoquang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hasao_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Lighthouse (red-white lighthouse with yellow lamp): [1] warm yellow light orb [2] lighthouse lamp lens flare [3] golden sunburst glare [4] dazzled halo of light rays.
Row 2: Purifier (golden winged sun): [1] golden winged sun bolt [2] gold cross flare [3] holy sun-cross burst [4] gold-white purify sparkles.
Row 3: Holy Halo (winged golden star with halo): [1] spinning golden halo ring [2] halo flash with feathers [3] holy golden cross burst [4] golden holy flames.
Row 4: Star Breaker (gold star struck by a hammer): [1] jagged gold star shard [2] gold flash [3] star shatter with stone chips [4] cracked gold star mark.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_anhsang_dan.png` · `fx_anhsang_no.png` · `fx_anhsang_trung.png` · `fx_anhsang_hieu.png` · `fx_aten_dan.png` · `fx_aten_no.png` · `fx_aten_trung.png` · `fx_aten_hieu.png` · `fx_haoquang_dan.png` · `fx_haoquang_no.png` · `fx_haoquang_trung.png` · `fx_haoquang_hieu.png` · `fx_hasao_dan.png` · `fx_hasao_no.png` · `fx_hasao_trung.png` · `fx_hasao_hieu.png` · tờ gốc `fx_sheet_T09.png`


### Tờ T10 — Star Lift (`nangsao`), Merge King (`vughep`), Bounty Beacon (`santhuong`), Pandora Vault (`pandora`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Star Lift** `nangsao` | rising gold star orb | gold chevron flash | star pop | gold upward chevron arrows | hieu bật trên ụ được +1★ (kèm chữ code) |
| **Merge King** `vughep` | small gold crown orb | violet-gold flash | crown sparkle burst | floating gold crown | hieu trên ụ được vua ghép tác động |
| **Bounty Beacon** `santhuong` | spinning gold coin | green-gold coin flash | coin burst | gold bounty target mark with a coin | dan tự xoay 600°/s (lật đồng xu = scaleX cos); hieu có thể thay ic_truyna (đang khớp, tuỳ) |
| **Pandora Vault** `pandora` | violet-gold orb with a keyhole | chest lid glow | violet-gold burst | six-slot violet-gold spin wheel | hieu thay pandora_dia (ổ đồng giống Revolver); quay bằng xoay ảnh |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/nangsao_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/vughep_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/santhuong_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/pandora_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Star Lift (gold star with up chevrons): [1] rising gold star orb [2] gold chevron flash [3] star pop [4] gold upward chevron arrows.
Row 2: Merge King (gold-purple crown): [1] small gold crown orb [2] violet-gold flash [3] crown sparkle burst [4] floating gold crown.
Row 3: Bounty Beacon (green-gold dollar coin): [1] spinning gold coin [2] green-gold coin flash [3] coin burst [4] gold bounty target mark with a coin.
Row 4: Pandora Vault (purple-gold treasure chest): [1] violet-gold orb with a keyhole [2] chest lid glow [3] violet-gold burst [4] six-slot violet-gold spin wheel.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_nangsao_dan.png` · `fx_nangsao_no.png` · `fx_nangsao_trung.png` · `fx_nangsao_hieu.png` · `fx_vughep_dan.png` · `fx_vughep_no.png` · `fx_vughep_trung.png` · `fx_vughep_hieu.png` · `fx_santhuong_dan.png` · `fx_santhuong_no.png` · `fx_santhuong_trung.png` · `fx_santhuong_hieu.png` · `fx_pandora_dan.png` · `fx_pandora_no.png` · `fx_pandora_trung.png` · `fx_pandora_hieu.png` · tờ gốc `fx_sheet_T10.png`


### Tờ T11 — Black Hole (`blackhole`), Teleporter (`dichchuyen`), Fusion Mixer (`tron`), Scrambler (`xaotron`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Black Hole** `blackhole` | small violet vortex orb | dark violet ring flash | violet implosion | large violet vortex field | hieu thay/hoặc giữ hu_hoden, xoay 120°/s; bỏ xoắn gradient code; dan = viên ném tạo hố |
| **Teleporter** `dichchuyen` | purple-blue portal orb | portal ripple | swirl burst | pair of purple and blue portal rings | hieu đặt trên đường khi dịch chuyển quái (xoay ngược nhau 2 vòng) |
| **Fusion Mixer** `tron` | purple swirl orb | blender splash | purple swirl burst | purple blending vortex | dan thay tia_lua tô vàng |
| **Scrambler** `xaotron` | violet orb with circling arrows | violet flash | scramble burst | two circling violet arrows | hieu xoay 180°/s trên ụ bị xáo |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/blackhole_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/dichchuyen_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/tron_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/xaotron_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Black Hole (violet vortex star): [1] small violet vortex orb [2] dark violet ring flash [3] violet implosion [4] large violet vortex field.
Row 2: Teleporter (twin purple and blue portals): [1] purple-blue portal orb [2] portal ripple [3] swirl burst [4] pair of purple and blue portal rings.
Row 3: Fusion Mixer (purple blender with swirl): [1] purple swirl orb [2] blender splash [3] purple swirl burst [4] purple blending vortex.
Row 4: Scrambler (violet swirl with two arrows): [1] violet orb with circling arrows [2] violet flash [3] scramble burst [4] two circling violet arrows.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_blackhole_dan.png` · `fx_blackhole_no.png` · `fx_blackhole_trung.png` · `fx_blackhole_hieu.png` · `fx_dichchuyen_dan.png` · `fx_dichchuyen_no.png` · `fx_dichchuyen_trung.png` · `fx_dichchuyen_hieu.png` · `fx_tron_dan.png` · `fx_tron_no.png` · `fx_tron_trung.png` · `fx_tron_hieu.png` · `fx_xaotron_dan.png` · `fx_xaotron_no.png` · `fx_xaotron_trung.png` · `fx_xaotron_hieu.png` · tờ gốc `fx_sheet_T11.png`


### Tờ T12 — Mana Core (`mana`), Mana Leech (`hutmana`), Amplifier (`khuech`), Copycat (`saochep`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Mana Core** `mana` | violet mana crystal shard | crystal glint | violet sparkle | violet crystal glow aura | dan = mảnh mana bay về thanh mana (thay hạt cham1 tím) |
| **Mana Leech** `hutmana` | red-violet leech fang | claw snap flash | red bite burst | violet mana droplet | dan thay dan_tia; hieu = giọt mana bay từ quái về thanh mana |
| **Amplifier** `khuech` | violet sound wave arc | speaker pulse | wave ring burst | purple concentric sound arcs aura | dan = sóng bay tới ô được buff (thay sup_link_vang chảy) |
| **Copycat** `saochep` | cyan dashed-outline cube | cyan flash | dashed copy burst | cyan dashed hologram outline | hieu phủ lên ụ vừa được sao chép |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/mana_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hutmana_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/khuech_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/saochep_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Mana Core (violet crystal): [1] violet mana crystal shard [2] crystal glint [3] violet sparkle [4] violet crystal glow aura.
Row 2: Mana Leech (red claw fangs with ruby): [1] red-violet leech fang [2] claw snap flash [3] red bite burst [4] violet mana droplet.
Row 3: Amplifier (purple megaphone): [1] violet sound wave arc [2] speaker pulse [3] wave ring burst [4] purple concentric sound arcs aura.
Row 4: Copycat (node with dashed copy outline): [1] cyan dashed-outline cube [2] cyan flash [3] dashed copy burst [4] cyan dashed hologram outline.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_mana_dan.png` · `fx_mana_no.png` · `fx_mana_trung.png` · `fx_mana_hieu.png` · `fx_hutmana_dan.png` · `fx_hutmana_no.png` · `fx_hutmana_trung.png` · `fx_hutmana_hieu.png` · `fx_khuech_dan.png` · `fx_khuech_no.png` · `fx_khuech_trung.png` · `fx_khuech_hieu.png` · `fx_saochep_dan.png` · `fx_saochep_no.png` · `fx_saochep_trung.png` · `fx_saochep_hieu.png` · tờ gốc `fx_sheet_T12.png`


### Tờ T13 — Crit Antenna (`chimang`), Radar (`radar`), Focus Lens (`thaukinh`), Resonance Grid (`luoicheo`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Crit Antenna** `chimang` | red crit pulse dot | red dish ping | red crit starburst | red crosshair crit mark | hieu bật trên ụ kề khi buff chí mạng |
| **Radar** `radar` | green radar blip | green sweep ping ring | green blip burst | green radar sweep wedge | thay HU.ping cam (code) bằng no + dan; hieu xoay 180°/s |
| **Focus Lens** `thaukinh` | blue-gold focused light dot | lens glint | focus sparkle | lens flare ring | hiện chưa có hình nào → thêm no/hieu khi buff |
| **Resonance Grid** `luoicheo` | teal echo ring bolt | teal diamond node flash | teal spark ring | teal diamond grid link line | dan = đạn vọng (thay g_vong_ngoc); trung = vòng tia lam dạng 2 (thay code) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/chimang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/radar_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/thaukinh_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/luoicheo_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Crit Antenna (red dish with antenna): [1] red crit pulse dot [2] red dish ping [3] red crit starburst [4] red crosshair crit mark.
Row 2: Radar (green radar screen): [1] green radar blip [2] green sweep ping ring [3] green blip burst [4] green radar sweep wedge.
Row 3: Focus Lens (blue lens with gold rim): [1] blue-gold focused light dot [2] lens glint [3] focus sparkle [4] lens flare ring.
Row 4: Resonance Grid (teal diamond node grid): [1] teal echo ring bolt [2] teal diamond node flash [3] teal spark ring [4] teal diamond grid link line.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_chimang_dan.png` · `fx_chimang_no.png` · `fx_chimang_trung.png` · `fx_chimang_hieu.png` · `fx_radar_dan.png` · `fx_radar_no.png` · `fx_radar_trung.png` · `fx_radar_hieu.png` · `fx_thaukinh_dan.png` · `fx_thaukinh_no.png` · `fx_thaukinh_trung.png` · `fx_thaukinh_hieu.png` · `fx_luoicheo_dan.png` · `fx_luoicheo_no.png` · `fx_luoicheo_trung.png` · `fx_luoicheo_hieu.png` · tờ gốc `fx_sheet_T13.png`


### Tờ T14 — Laser (`laser`), Nemesis (`nemesis`), Eclipse (`nhatthuc`), Marionette (`marionette`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Laser** `laser` | pink laser tip glow | violet emitter flare | pink burn spot | small scorch mark | tia = fx_laser_tia (B1) (gần như tia_laser, chỉ đồng bộ màu tím-hồng mới) |
| **Nemesis** `nemesis` | red judgment blade | red eye flash | crimson slash | glowing red eye mark | HU.chem: lưỡi rơi = dan (xoay 90°, rơi dọc); hieu kèm chữ JUDGED |
| **Eclipse** `nhatthuc` | black orb with a fiery orange corona | corona flare | eclipse burst | orange-black crescent wave | hieu thay hu_trangkhuyet xanh lam; tia = fx_nhatthuc_tia (B2) |
| **Marionette** `marionette` | red-gold puppet string needle | red curtain flash | string snap burst | puppet crossbar with strings above a target | hieu thay dây rối vẽ code (HU.roi), lắc ±6° |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/laser_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nemesis_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nhatthuc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/marionette_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Laser (violet cone with pink emitter): [1] pink laser tip glow [2] violet emitter flare [3] pink burn spot [4] small scorch mark.
Row 2: Nemesis (scales of justice with red eye): [1] red judgment blade [2] red eye flash [3] crimson slash [4] glowing red eye mark.
Row 3: Eclipse (black sun with fiery corona): [1] black orb with a fiery orange corona [2] corona flare [3] eclipse burst [4] orange-black crescent wave.
Row 4: Marionette (puppet crossbar with red curtain): [1] red-gold puppet string needle [2] red curtain flash [3] string snap burst [4] puppet crossbar with strings above a target.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_laser_dan.png` · `fx_laser_no.png` · `fx_laser_trung.png` · `fx_laser_hieu.png` · `fx_nemesis_dan.png` · `fx_nemesis_no.png` · `fx_nemesis_trung.png` · `fx_nemesis_hieu.png` · `fx_nhatthuc_dan.png` · `fx_nhatthuc_no.png` · `fx_nhatthuc_trung.png` · `fx_nhatthuc_hieu.png` · `fx_marionette_dan.png` · `fx_marionette_no.png` · `fx_marionette_trung.png` · `fx_marionette_hieu.png` · tờ gốc `fx_sheet_T14.png`


### Tờ T15 — Rainbow (`cauvong`), Mimic (`mimic`), Combo Core (`combo`), Ricochet (`nayda`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Rainbow** `cauvong` | prism shard with a rainbow tail | rainbow flare | rainbow splash | rainbow road segment | hieu thay hu_cauvong (đang là ống cam); trạng thái cầu vồng trên quái dùng fx_st_cauvong |
| **Mimic** `mimic` | tiny rainbow cube with fangs | rainbow flash | chomp bite burst | rainbow cube face mark | dan thay tia_lua màu ngẫu nhiên |
| **Combo Core** `combo` | magenta energy bar capsule | pink flash | pink chevron burst | pink combo ring with tick marks | hieu = vòng combo quanh ụ (thay vẽ code ×3), phóng theo số combo |
| **Ricochet** `nayda` | lime serrated saw disc | lime spark flash | lime ricochet sparks | lime bounce trail arc | dan = đĩa cưa (hu_luoicua đang khớp — có thể giữ, chỉ thay vệt code bằng hieu) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/cauvong_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/mimic_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/combo_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nayda_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Rainbow (prism emitting a rainbow): [1] prism shard with a rainbow tail [2] rainbow flare [3] rainbow splash [4] rainbow road segment.
Row 2: Mimic (rainbow cube with fangs): [1] tiny rainbow cube with fangs [2] rainbow flash [3] chomp bite burst [4] rainbow cube face mark.
Row 3: Combo Core (disk with pink bars): [1] magenta energy bar capsule [2] pink flash [3] pink chevron burst [4] pink combo ring with tick marks.
Row 4: Ricochet (lime saw disc launcher): [1] lime serrated saw disc [2] lime spark flash [3] lime ricochet sparks [4] lime bounce trail arc.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_cauvong_dan.png` · `fx_cauvong_no.png` · `fx_cauvong_trung.png` · `fx_cauvong_hieu.png` · `fx_mimic_dan.png` · `fx_mimic_no.png` · `fx_mimic_trung.png` · `fx_mimic_hieu.png` · `fx_combo_dan.png` · `fx_combo_no.png` · `fx_combo_trung.png` · `fx_combo_hieu.png` · `fx_nayda_dan.png` · `fx_nayda_no.png` · `fx_nayda_trung.png` · `fx_nayda_hieu.png` · tờ gốc `fx_sheet_T15.png`


### Tờ T16 — Drone Bay (`drone`), Hive Queen (`chuato`), Jammer (`kepha`), Signal Jammer (`nhieusong`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Drone Bay** `drone` | tiny yellow quadcopter drone | hangar exhaust puff | small orange explosion | yellow bomber drone carrying a bomb | hieu thay drone_nong (đang dùng ảnh ĐẦU Ụ CŨ làm drone); dan = đạn drone |
| **Hive Queen** `chuato` | small bee with stinger | honey drip splash | amber honey splat | golden royal bee | dan thay g_ngoi code; ong bay quanh tổ = fx_chuato_dan ×1.3 (thay veDrone code); ong vàng ×3 = hieu |
| **Jammer** `kepha` | small orange clamp claw | claw snap flash | clamp snap burst | orange clamp locked around a target | dan thay dan_tia |
| **Signal Jammer** `nhieusong` | red static wave | red tower sparks | red static burst | red jamming crosshair with static | hieu thay tâm ngắm code của HU.nhieu |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/drone_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/chuato_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/kepha_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nhieusong_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Drone Bay (yellow hazard hangar with drones): [1] tiny yellow quadcopter drone [2] hangar exhaust puff [3] small orange explosion [4] yellow bomber drone carrying a bomb.
Row 2: Hive Queen (amber honeycomb with bees): [1] small bee with stinger [2] honey drip splash [3] amber honey splat [4] golden royal bee.
Row 3: Jammer (orange claw grabber): [1] small orange clamp claw [2] claw snap flash [3] clamp snap burst [4] orange clamp locked around a target.
Row 4: Signal Jammer (red radio tower): [1] red static wave [2] red tower sparks [3] red static burst [4] red jamming crosshair with static.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_drone_dan.png` · `fx_drone_no.png` · `fx_drone_trung.png` · `fx_drone_hieu.png` · `fx_chuato_dan.png` · `fx_chuato_no.png` · `fx_chuato_trung.png` · `fx_chuato_hieu.png` · `fx_kepha_dan.png` · `fx_kepha_no.png` · `fx_kepha_trung.png` · `fx_kepha_hieu.png` · `fx_nhieusong_dan.png` · `fx_nhieusong_no.png` · `fx_nhieusong_trung.png` · `fx_nhieusong_hieu.png` · tờ gốc `fx_sheet_T16.png`


### Tờ T17 — Guillotine (`maychem`), Twin Maker (`sinhdoi`), Cloner (`nhanban`), Cooldown Horn (`loa`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Guillotine** `maychem` | falling steel guillotine blade with red frame edge | red flash | red slash spark | blade shadow warning mark | HU.chem: dan rơi dọc (xoay 90°); hieu = bóng báo trước 0.3 s |
| **Twin Maker** `sinhdoi` | twin cyan orbs | cyan flash | cyan twin burst | pair of cyan rings | dan thay dan_tia |
| **Cloner** `nhanban` | flying orange copy sheet | paper flash | paper burst | stack of orange hologram sheets | dan tự xoay 400°/s |
| **Cooldown Horn** `loa` | blue-gold sound wave | horn blast | wave ring | blue hourglass speed aura | thay 2 vòng code bằng trung |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/maychem_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/sinhdoi_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nhanban_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/loa_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Guillotine (red steel guillotine frame): [1] falling steel guillotine blade with red frame edge [2] red flash [3] red slash spark [4] blade shadow warning mark.
Row 2: Twin Maker (two cyan rings): [1] twin cyan orbs [2] cyan flash [3] cyan twin burst [4] pair of cyan rings.
Row 3: Cloner (copier printing orange sheets): [1] flying orange copy sheet [2] paper flash [3] paper burst [4] stack of orange hologram sheets.
Row 4: Cooldown Horn (gold horn with blue hourglass): [1] blue-gold sound wave [2] horn blast [3] wave ring [4] blue hourglass speed aura.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_maychem_dan.png` · `fx_maychem_no.png` · `fx_maychem_trung.png` · `fx_maychem_hieu.png` · `fx_sinhdoi_dan.png` · `fx_sinhdoi_no.png` · `fx_sinhdoi_trung.png` · `fx_sinhdoi_hieu.png` · `fx_nhanban_dan.png` · `fx_nhanban_no.png` · `fx_nhanban_trung.png` · `fx_nhanban_hieu.png` · `fx_loa_dan.png` · `fx_loa_no.png` · `fx_loa_trung.png` · `fx_loa_hieu.png` · tờ gốc `fx_sheet_T17.png`


### Tờ T18 — Wall Projector (`wallgen`), Genesis Core (`khoisinh`), Leviathan (`leviathan`), Wyrm Engine (`ronglua`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Wall Projector** `wallgen` | orange hologram brick | orange projector flash | wall shatter into bricks | orange hologram brick wall segment | hieu = bức tường chắn đường (thay tia_laser + tia_set + vẽ code của HU.tuong), xoay theo hướng đường |
| **Genesis Core** `khoisinh` | glowing green seed | golden pod flash | leaf and petal burst | steel-gold lotus flower bloom | cung sáng = fx_khoisinh_tia (B2); hieu = hoa sen dạng 2/3 (dạng 3 ×1.3) |
| **Leviathan** `leviathan` | teal water bubble | wave splash | water splash | teal whirlpool | dan thay g_bot (code); dạng 3 = dan ×1.4 + fx_vong_mong; hieu = xoáy nuốt (thay HU.xoay code); hơi thở = fx_leviathan_tia (B2) |
| **Wyrm Engine** `ronglua` | orange flame cone (stage 1), wide end on the right | dragon mouth flare | fire hit burst | burning ground ember patch | dan = NÓN LỬA dạng 1 thay anhNon canvas: gốc ở trái (đầu nòng), dài = tầm, rộng theo góc; 2 lớp lệch pha như cũ; hieu = vệt cháy (thay HU.vetChay code) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/wallgen_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/khoisinh_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/leviathan_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ronglua_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Wall Projector (orange brick hologram wall): [1] orange hologram brick [2] orange projector flash [3] wall shatter into bricks [4] orange hologram brick wall segment.
Row 2: Genesis Core (green sprout in a golden pod): [1] glowing green seed [2] golden pod flash [3] leaf and petal burst [4] steel-gold lotus flower bloom.
Row 3: Leviathan (teal sea serpent with wave): [1] teal water bubble [2] wave splash [3] water splash [4] teal whirlpool.
Row 4: Wyrm Engine (red dragon head breathing fire): [1] orange flame cone (stage 1), wide end on the right [2] dragon mouth flare [3] fire hit burst [4] burning ground ember patch.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_wallgen_dan.png` · `fx_wallgen_no.png` · `fx_wallgen_trung.png` · `fx_wallgen_hieu.png` · `fx_khoisinh_dan.png` · `fx_khoisinh_no.png` · `fx_khoisinh_trung.png` · `fx_khoisinh_hieu.png` · `fx_leviathan_dan.png` · `fx_leviathan_no.png` · `fx_leviathan_trung.png` · `fx_leviathan_hieu.png` · `fx_ronglua_dan.png` · `fx_ronglua_no.png` · `fx_ronglua_trung.png` · `fx_ronglua_hieu.png` · tờ gốc `fx_sheet_T18.png`


### Tờ T19 — Overlord (`overlord`), Orbital (`orbital`), Sync Cannon (`dongbo`), Star Cannon (`ngoisao`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Overlord** `overlord` | red lightning orb | red crest flare | red lightning burst | scorched ring with embers | tia sấm = fx_overlord_tia (B3); dạng 2/3 ở tờ G1 |
| **Orbital** `orbital` | small cyan bolt | cyan flash | cyan burst | red target reticle | dan dạng 1; tia bắn phá HU.vetinh = fx_orbital_tia (B3) |
| **Sync Cannon** `dongbo` | gold pellet with a blue ring | gold-blue flash | gold ring burst | gold sync sound-wave arcs | dan dạng 1 thay g_xi_vang2 code |
| **Star Cannon** `ngoisao` | small gold star shard | gold star flash | star burst | meteor shadow warning ring | dan dạng 1 thay g_sao_nho code (tự xoay 360°/s) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/overlord_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/orbital_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/dongbo_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ngoisao_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Overlord (red demonic crest with lightning): [1] red lightning orb [2] red crest flare [3] red lightning burst [4] scorched ring with embers.
Row 2: Orbital (satellite with solar panels): [1] small cyan bolt [2] cyan flash [3] cyan burst [4] red target reticle.
Row 3: Sync Cannon (blue-gold orbit rings): [1] gold pellet with a blue ring [2] gold-blue flash [3] gold ring burst [4] gold sync sound-wave arcs.
Row 4: Star Cannon (gold star with blue ring): [1] small gold star shard [2] gold star flash [3] star burst [4] meteor shadow warning ring.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_overlord_dan.png` · `fx_overlord_no.png` · `fx_overlord_trung.png` · `fx_overlord_hieu.png` · `fx_orbital_dan.png` · `fx_orbital_no.png` · `fx_orbital_trung.png` · `fx_orbital_hieu.png` · `fx_dongbo_dan.png` · `fx_dongbo_no.png` · `fx_dongbo_trung.png` · `fx_dongbo_hieu.png` · `fx_ngoisao_dan.png` · `fx_ngoisao_no.png` · `fx_ngoisao_trung.png` · `fx_ngoisao_hieu.png` · tờ gốc `fx_sheet_T19.png`


### Tờ T20 — Berserker (`cuongno`), Werewolf (`soi`), Nine-Tail (`cuuvi`), Mystery Box (`hopbi`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Berserker** `cuongno` | yellow-orange tracer round | red muzzle flash | fire spark burst | red rage aura | dan dạng 1; hieu = hào quang cuồng nộ dạng 2/3 |
| **Werewolf** `soi` | single amber claw swipe arc | wolf jaw flash | amber claw hit sparks | three amber claw scratch marks | dan dạng 1 thay gVuot code: đặt tại quái, xoay theo hướng ụ→quái, phóng 0.6→1 trong 0.12 s |
| **Nine-Tail** `cuuvi` | orange foxfire orb | orange fox flame flash | foxfire burst | flicking flame fox tail | dan dạng 1 thay g_ho_cam code |
| **Mystery Box** `hopbi` | violet card shard | crate lid puff | violet card burst | confetti sparkle burst | dan dạng 1 thay g_the_tim code; hieu = dạng 3 sắp mở |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/cuongno_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/soi_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/cuuvi_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hopbi_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Berserker (red demon mask with twin barrels): [1] yellow-orange tracer round [2] red muzzle flash [3] fire spark burst [4] red rage aura.
Row 2: Werewolf (grey mech wolf head): [1] single amber claw swipe arc [2] wolf jaw flash [3] amber claw hit sparks [4] three amber claw scratch marks.
Row 3: Nine-Tail (white fox mask with flame tails): [1] orange foxfire orb [2] orange fox flame flash [3] foxfire burst [4] flicking flame fox tail.
Row 4: Mystery Box (wooden crate with question mark): [1] violet card shard [2] crate lid puff [3] violet card burst [4] confetti sparkle burst.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_cuongno_dan.png` · `fx_cuongno_no.png` · `fx_cuongno_trung.png` · `fx_cuongno_hieu.png` · `fx_soi_dan.png` · `fx_soi_no.png` · `fx_soi_trung.png` · `fx_soi_hieu.png` · `fx_cuuvi_dan.png` · `fx_cuuvi_no.png` · `fx_cuuvi_trung.png` · `fx_cuuvi_hieu.png` · `fx_hopbi_dan.png` · `fx_hopbi_no.png` · `fx_hopbi_trung.png` · `fx_hopbi_hieu.png` · tờ gốc `fx_sheet_T20.png`


### Tờ T21 — Cryo Reactor (`lophanung`), Hydra (`hydra`), Chain Link (`lienket`), Chrono Throne (`ngaithoigian`)

| Ụ | dan | no | trung | hieu | Code dùng |
|---|---|---|---|---|---|
| **Cryo Reactor** `lophanung` | thin icy frost ring | reactor vent frost puff | ice shatter | hexagon frost lattice floor tile | dan = vòng băng dạng 1 (phóng 0.3→1 từ ụ, thay arc code); hieu lát kín ô dạng 3 (thay gBaoLuoi code) |
| **Hydra** `hydra` | emerald fang needle | serpent green flash | green venom spark | green hexagon rune mark | dan dạng 1 thay g_kim_ngoc code; hieu dạng 2 (thay gDauAn code) |
| **Chain Link** `lienket` | hollow violet chain ring | violet flash | violet chain burst | single violet chain link (tileable) | dan dạng 1 thay g_vong_tim code; hieu lặp dọc dây xích dạng 2 (thay gDay code) |
| **Chrono Throne** `ngaithoigian` | gold clock-hand dart with a ruby counterweight | gold tick flash | gold-red time burst | gold 12-tick clock ring | dan dạng 1 thay g_kim_gio code; hieu dạng 2 dấu đồng hồ (thay gDauGio code ×6), thrAura dùng fx_st_cham |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/lophanung_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hydra_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/lienket_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ngaithoigian_nong_v2.png

```
4x4 grid sprite sheet, 16 game VFX sprites. Each row = one turret (attached heads, same order), columns = [1] projectile, [2] muzzle flash, [3] hit burst, [4] status overlay / skill object. Colors and motifs must match that row's turret head.
Row 1: Cryo Reactor (ice crystal reactor with snowflake core): [1] thin icy frost ring [2] reactor vent frost puff [3] ice shatter [4] hexagon frost lattice floor tile.
Row 2: Hydra (three green serpent heads): [1] emerald fang needle [2] serpent green flash [3] green venom spark [4] green hexagon rune mark.
Row 3: Chain Link (purple chain ring with gem): [1] hollow violet chain ring [2] violet flash [3] violet chain burst [4] single violet chain link (tileable).
Row 4: Chrono Throne (gold throne with clock): [1] gold clock-hand dart with a ruby counterweight [2] gold tick flash [3] gold-red time burst [4] gold 12-tick clock ring.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra (theo hàng → cột): `fx_lophanung_dan.png` · `fx_lophanung_no.png` · `fx_lophanung_trung.png` · `fx_lophanung_hieu.png` · `fx_hydra_dan.png` · `fx_hydra_no.png` · `fx_hydra_trung.png` · `fx_hydra_hieu.png` · `fx_lienket_dan.png` · `fx_lienket_no.png` · `fx_lienket_trung.png` · `fx_lienket_hieu.png` · `fx_ngaithoigian_dan.png` · `fx_ngaithoigian_no.png` · `fx_ngaithoigian_trung.png` · `fx_ngaithoigian_hieu.png` · tờ gốc `fx_sheet_T21.png`


### Tờ T22 — Evolver (`tienhoa`) + 12 hạt dùng chung (thay hạt/vệt/vòng vẽ code)

| Ô | File | Nội dung | Code dùng |
|---|---|---|---|
| hàng 1 | `fx_tienhoa_dan.png` | green DNA seed pellet | dan dạng 1 thay g_xi_vang (hổ phách) — đổi màu theo đầu mới xanh lá |
| hàng 1 | `fx_tienhoa_no.png` | green leaf flash | — |
| hàng 1 | `fx_tienhoa_trung.png` | green-gold splash | — |
| hàng 1 | `fx_tienhoa_hieu.png` | green DNA helix | — |
| hàng 2 cột 1 | `fx_vet_trang.png` | white motion-trail streak, bright head on the right, fading left | thay REN.vet() gradient; tô màu bằng REN.toMau theo MAU_VET, kéo dài theo vận tốc |
| hàng 2 cột 2 | `fx_cham_trang.png` | soft round white glow dot | thay REN.cham1() gradient cho mọi hạt; tô màu toMau |
| hàng 2 cột 3 | `fx_vong_mong.png` | thin glowing white ring | thay FX.vong1 arc; phóng r0→r1, mờ dần, tô màu |
| hàng 2 cột 4 | `fx_than.png` | small glowing orange ember | thay hạt than (cham1) của cháy |
| hàng 3 cột 1 | `fx_tia_sao.png` | four-point white sparkle star | tia lấp lánh chung (tô màu) |
| hàng 3 cột 2 | `fx_song_xung.png` | thick white shockwave ring | sóng nổ lớn (trùm / đỏ) |
| hàng 3 cột 3 | `fx_bui.png` | soft grey dust puff | thay REN.bui1() code |
| hàng 3 cột 4 | `fx_vo_dan.png` | single brass shell casing | vỏ đạn văng (Gatling/Revolver/Berserker 3) |
| hàng 4 cột 1 | `fx_giot_nuoc.png` | teal water droplet | hạt nước Leviathan |
| hàng 4 cột 2 | `fx_la.png` | small green leaf | hạt lá Genesis/Evolver |
| hàng 4 cột 3 | `fx_hoa_giay.png` | pink confetti piece | hoa giấy Mystery Box |
| hàng 4 cột 4 | `fx_set_nho.png` | small white electric crackle | tia điện nhỏ chung (tô màu) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/tienhoa_nong_v2.png + tờ T01 và T08 đã gen (giữ phong cách)

```
4x4 grid sprite sheet, 16 game VFX sprites.
Row 1: Evolver (attached green DNA tube head): [1] green DNA seed pellet [2] green leaf flash [3] green-gold splash [4] green DNA helix.
Rows 2-4: generic particles, mostly pure WHITE so the game can tint them: [5] white motion-trail streak, bright head on the right, fading left; [6] soft round white glow dot; [7] thin glowing white ring; [8] small glowing orange ember; [9] four-point white sparkle star; [10] thick white shockwave ring; [11] soft grey dust puff; [12] single brass shell casing; [13] teal water droplet; [14] small green leaf; [15] pink confetti piece; [16] small white electric crackle.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra: `fx_tienhoa_dan/no/trung/hieu.png` + `fx_vet_trang.png` · `fx_cham_trang.png` · `fx_vong_mong.png` · `fx_than.png` · `fx_tia_sao.png` · `fx_song_xung.png` · `fx_bui.png` · `fx_vo_dan.png` · `fx_giot_nuoc.png` · `fx_la.png` · `fx_hoa_giay.png` · `fx_set_nho.png` · tờ gốc `fx_sheet_T22.png`


---

## 4. TỜ DẠNG 1/2/3 — 15 Ụ ĐỔI DẠNG + Hive Queen (G1–G4)

Dạng 1 của mỗi ụ = `fx_<id>_dan/no/trung/hieu` ở tờ T. Tờ G thêm 4 ô/ụ: **`dan2`** (đạn dạng 2) · **`dan3`** (đạn dạng 3) · **`trung3`** (nổ dạng 3, to hơn) · **`dacbiet`** (vật đặc trưng: thiên thạch, bóng sói, tâm ngắm, dấu đồng hồ…). Tất cả thay sprite canvas `g_*` (`GFX.taoSprite`) và các `HU.g*` vẽ bằng arc/gradient trong `growfx.js`. Dạng 3 vẽ to hơn dạng 1 ~1.3× — **không** thêm vòng/quầng code.


### Tờ G1 — `overlord`, `orbital`, `dongbo`, `ngoisao`

| Ụ | dan2 | dan3 | trung3 | dacbiet | Code dùng |
|---|---|---|---|---|---|
| `overlord` | small red electric arc spark ball | vertical red sky lightning pillar | scorched crater ring with embers | short red aftershock arc | dan2 thay gArc; dan3 thay cotTroi/gCot (đặt dọc, gốc ở dưới); dacbiet ×4 quanh tâm |
| `orbital` | longer cyan lance bolt | vertical red-white sky lance | lance impact burst | red reticle locking on | dan2 thay g_tia_lam; dan3 thay gGiao code (rơi dọc); dacbiet thay gTam (co về quái 0.25 s) |
| `dongbo` | gold pellet with sound-wave arcs | gold beam head glow | gold ring burst with crit sparks | gold sound-wave arc | dan3 = đầu tia + thân fx_dongbo_tia (B2); dacbiet thay gSong |
| `ngoisao` | pair of twin gold star shards | shooting-star comet with long tail | star-shaped burst | falling flaming meteor | dan3 thay g_sao_choi; trung3 thay gNoSao; dacbiet thay gThienThach (rơi chéo) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/overlord_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/orbital_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/dongbo_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ngoisao_nong_v2.png + tờ T có các ụ này (dạng 1) để nối tiếp màu

```
4x4 grid sprite sheet, 16 game VFX sprites showing stronger attack stages. Each row = one turret (attached heads, same order); columns = [1] stage-2 projectile, [2] stage-3 projectile (bigger, brighter), [3] stage-3 hit burst, [4] special effect. Match the row's head colors; stage 3 clearly more powerful than stage 2.
Row 1: overlord turret: [1] small red electric arc spark ball [2] vertical red sky lightning pillar [3] scorched crater ring with embers [4] short red aftershock arc.
Row 2: orbital turret: [1] longer cyan lance bolt [2] vertical red-white sky lance [3] lance impact burst [4] red reticle locking on.
Row 3: dongbo turret: [1] gold pellet with sound-wave arcs [2] gold beam head glow [3] gold ring burst with crit sparks [4] gold sound-wave arc.
Row 4: ngoisao turret: [1] pair of twin gold star shards [2] shooting-star comet with long tail [3] star-shaped burst [4] falling flaming meteor.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra: `fx_overlord_dan2.png` · `fx_overlord_dan3.png` · `fx_overlord_trung3.png` · `fx_overlord_dacbiet.png` · `fx_orbital_dan2.png` · `fx_orbital_dan3.png` · `fx_orbital_trung3.png` · `fx_orbital_dacbiet.png` · `fx_dongbo_dan2.png` · `fx_dongbo_dan3.png` · `fx_dongbo_trung3.png` · `fx_dongbo_dacbiet.png` · `fx_ngoisao_dan2.png` · `fx_ngoisao_dan3.png` · `fx_ngoisao_trung3.png` · `fx_ngoisao_dacbiet.png` · tờ gốc `fx_sheet_G1.png`


### Tờ G2 — `cuongno`, `soi`, `cuuvi`, `hopbi`

| Ụ | dan2 | dan3 | trung3 | dacbiet | Code dùng |
|---|---|---|---|---|---|
| `cuongno` | orange round with ember trail | red-white hot round | fiery burst | double red muzzle flash | dan2/3 thay g_dan_cam / g_dan_do; dacbiet thay 2 chop_nong lệch |
| `soi` | X-shaped double amber slash | three crimson claw slashes | crimson claw hit burst | ghostly red wolf head dash | dan2/3 thay gVuot (code cung); dacbiet thay gLuot (3 bóng mờ dọc đường) |
| `cuuvi` | wavy orange foxfire with flame trail | blue-white foxfire orb | blue-white ring burst | flame tail flick | dan2 = fx_cuuvi_dan + lắc sin như gHoBay; dan3 thay g_ho_xanh |
| `hopbi` | spinning violet question-mark bolt | violet confetti sparks shower | violet card burst | crate bursting open with light | dan2 thay g_hoi (đang vẽ chữ "?" bằng code); dacbiet khi mở hộp |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/cuongno_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/soi_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/cuuvi_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hopbi_nong_v2.png + tờ T có các ụ này (dạng 1) để nối tiếp màu

```
4x4 grid sprite sheet, 16 game VFX sprites showing stronger attack stages. Each row = one turret (attached heads, same order); columns = [1] stage-2 projectile, [2] stage-3 projectile (bigger, brighter), [3] stage-3 hit burst, [4] special effect. Match the row's head colors; stage 3 clearly more powerful than stage 2.
Row 1: cuongno turret: [1] orange round with ember trail [2] red-white hot round [3] fiery burst [4] double red muzzle flash.
Row 2: soi turret: [1] X-shaped double amber slash [2] three crimson claw slashes [3] crimson claw hit burst [4] ghostly red wolf head dash.
Row 3: cuuvi turret: [1] wavy orange foxfire with flame trail [2] blue-white foxfire orb [3] blue-white ring burst [4] flame tail flick.
Row 4: hopbi turret: [1] spinning violet question-mark bolt [2] violet confetti sparks shower [3] violet card burst [4] crate bursting open with light.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra: `fx_cuongno_dan2.png` · `fx_cuongno_dan3.png` · `fx_cuongno_trung3.png` · `fx_cuongno_dacbiet.png` · `fx_soi_dan2.png` · `fx_soi_dan3.png` · `fx_soi_trung3.png` · `fx_soi_dacbiet.png` · `fx_cuuvi_dan2.png` · `fx_cuuvi_dan3.png` · `fx_cuuvi_trung3.png` · `fx_cuuvi_dacbiet.png` · `fx_hopbi_dan2.png` · `fx_hopbi_dan3.png` · `fx_hopbi_trung3.png` · `fx_hopbi_dacbiet.png` · tờ gốc `fx_sheet_G2.png`


### Tờ G3 — `lophanung`, `hydra`, `lienket`, `ngaithoigian`

| Ụ | dan2 | dan3 | trung3 | dacbiet | Code dùng |
|---|---|---|---|---|---|
| `lophanung` | sharp ice needle | white ice storm swirl | enemy-sized ice shard shatter | cold frost mist | dan2 thay g_kim_bang; dan3 phủ ô khi bão (xoay 90°/s); dacbiet thay gSuong |
| `hydra` | instant emerald needle with hex rune | fused serpent beam head | green rune burst | green hexagon rune | dan3 = đầu + thân fx_hydra_tia (B2) thay HU.hydraTia tia_laser |
| `lienket` | violet ring trailing a chain | lashing violet chain whip | violet chain burst | violet chain segment tile | dacbiet lặp dọc dây (thay gDay/gXich code) |
| `ngaithoigian` | gold dart stamping a clock ring | long piercing gold clock needle | red ghost time-echo burst | red ghost clock hand | dan3 thay gKim; dacbiet = tiếng vọng (mờ 0.5, trễ 0.3 s) |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/lophanung_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/hydra_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/lienket_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ngaithoigian_nong_v2.png + tờ T có các ụ này (dạng 1) để nối tiếp màu

```
4x4 grid sprite sheet, 16 game VFX sprites showing stronger attack stages. Each row = one turret (attached heads, same order); columns = [1] stage-2 projectile, [2] stage-3 projectile (bigger, brighter), [3] stage-3 hit burst, [4] special effect. Match the row's head colors; stage 3 clearly more powerful than stage 2.
Row 1: lophanung turret: [1] sharp ice needle [2] white ice storm swirl [3] enemy-sized ice shard shatter [4] cold frost mist.
Row 2: hydra turret: [1] instant emerald needle with hex rune [2] fused serpent beam head [3] green rune burst [4] green hexagon rune.
Row 3: lienket turret: [1] violet ring trailing a chain [2] lashing violet chain whip [3] violet chain burst [4] violet chain segment tile.
Row 4: ngaithoigian turret: [1] gold dart stamping a clock ring [2] long piercing gold clock needle [3] red ghost time-echo burst [4] red ghost clock hand.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra: `fx_lophanung_dan2.png` · `fx_lophanung_dan3.png` · `fx_lophanung_trung3.png` · `fx_lophanung_dacbiet.png` · `fx_hydra_dan2.png` · `fx_hydra_dan3.png` · `fx_hydra_trung3.png` · `fx_hydra_dacbiet.png` · `fx_lienket_dan2.png` · `fx_lienket_dan3.png` · `fx_lienket_trung3.png` · `fx_lienket_dacbiet.png` · `fx_ngaithoigian_dan2.png` · `fx_ngaithoigian_dan3.png` · `fx_ngaithoigian_trung3.png` · `fx_ngaithoigian_dacbiet.png` · tờ gốc `fx_sheet_G3.png`


### Tờ G4 — `tienhoa`, `ronglua`, `luoicheo`, `chuato`

| Ụ | dan2 | dan3 | trung3 | dacbiet | Code dùng |
|---|---|---|---|---|---|
| `tienhoa` | molten green-gold DNA slug | green-gold DNA beam head | green-gold splash | ascending green-gold halo | dan2 thay g_xi_nong; dan3 + fx_tienhoa_tia (B2) thay gTiaVang code |
| `ronglua` | blue flame cone, wide end on the right | white flame cone with blue rim | blue fire burst | red dragon silhouette diving, top-down | dan2/3 thay anhNon canvas; dacbiet thay HU.rongBo (19 lệnh vẽ code), bay dọc đường |
| `luoicheo` | teal spark ring | teal echo bolt | teal resonance burst | teal diamond node glow | dan2 thay vòng code; dan3 thay g_vong_ngoc |
| `chuato` | bee drone perched, wings folded | big golden royal bee | golden honey splash | small hexagon honeycomb shield | dan2 khi đậu trên ụ kề; dan3 ong vàng ×3 sát thương |

Đính kèm: docs/demo-hop-tuong/thap-art/redo/tienhoa_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/ronglua_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/luoicheo_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/chuato_nong_v2.png + tờ T có các ụ này (dạng 1) để nối tiếp màu

```
4x4 grid sprite sheet, 16 game VFX sprites showing stronger attack stages. Each row = one turret (attached heads, same order); columns = [1] stage-2 projectile, [2] stage-3 projectile (bigger, brighter), [3] stage-3 hit burst, [4] special effect. Match the row's head colors; stage 3 clearly more powerful than stage 2.
Row 1: tienhoa turret: [1] molten green-gold DNA slug [2] green-gold DNA beam head [3] green-gold splash [4] ascending green-gold halo.
Row 2: ronglua turret: [1] blue flame cone, wide end on the right [2] white flame cone with blue rim [3] blue fire burst [4] red dragon silhouette diving, top-down.
Row 3: luoicheo turret: [1] teal spark ring [2] teal echo bolt [3] teal resonance burst [4] teal diamond node glow.
Row 4: chuato turret: [1] bee drone perched, wings folded [2] big golden royal bee [3] golden honey splash [4] small hexagon honeycomb shield.
Flat solid magenta #FF00FF background everywhere between sprites, no text, no letters, no numbers, no frames, no drop shadows on the background. Top-down mobile tower-defense game VFX, bold cartoon style with thick dark outlines, same style and palette as the attached turret heads. Each sprite centered in its own cell with clear magenta margin, nothing touching cell edges. Projectiles and muzzle flashes point RIGHT.
```

File ra: `fx_tienhoa_dan2.png` · `fx_tienhoa_dan3.png` · `fx_tienhoa_trung3.png` · `fx_tienhoa_dacbiet.png` · `fx_ronglua_dan2.png` · `fx_ronglua_dan3.png` · `fx_ronglua_trung3.png` · `fx_ronglua_dacbiet.png` · `fx_luoicheo_dan2.png` · `fx_luoicheo_dan3.png` · `fx_luoicheo_trung3.png` · `fx_luoicheo_dacbiet.png` · `fx_chuato_dan2.png` · `fx_chuato_dan3.png` · `fx_chuato_trung3.png` · `fx_chuato_dacbiet.png` · tờ gốc `fx_sheet_G4.png`


---

## 5. TỜ TIA (B1–B3) — 6 dải ngang / tờ

Bố cục: 1 cột × 6 hàng, mỗi hàng 1 dải ngang **lặp được trái-phải** (đầu và cuối dải khớp nhau), tâm dải sáng nhất, mép mờ vào magenta. Cắt mỗi hàng → `fx_<id>_tia.png` (512×48). Code: `REN.tia(ctx, 'fx_<id>_tia', x0, y0, x1, y1, rộng, cuộn)` (hàm đã có, đang dùng cho `tia_laser`/`tia_set`); sét: giữ `R.set` gấp khúc, đổi ảnh.


### Tờ B1 — `tia`, `sungluc`, `laser`, `railgun`, `anhsang`, `haoquang`

Đính kèm: docs/demo-hop-tuong/thap-art/redo/tia_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/sungluc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/laser_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/railgun_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/anhsang_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/haoquang_nong_v2.png

```
Sprite sheet of 6 horizontal beam strips stacked vertically (1 column x 6 rows), each strip a seamless left-right tileable energy beam texture filling the full width, brightest along its center line, soft edges fading into the background. Colors match the attached turret heads in the same order.
Strip 1: thin green sniper tracer.
Strip 2: short brass bullet tracer.
Strip 3: pink-violet laser beam.
Strip 4: blue-violet rail beam with white core.
Strip 5: warm yellow lighthouse light beam, soft edges.
Strip 6: holy golden ray with sparkles.
Flat solid magenta #FF00FF background between strips, no text, no letters, no frames, same cartoon game style as the attached turret heads.
```

File ra: `fx_tia_tia.png` · `fx_sungluc_tia.png` · `fx_laser_tia.png` · `fx_railgun_tia.png` · `fx_anhsang_tia.png` · `fx_haoquang_tia.png` · tờ gốc `fx_sheet_B1.png`


### Tờ B2 — `hydra`, `dongbo`, `tienhoa`, `nhatthuc`, `leviathan`, `khoisinh`

Đính kèm: docs/demo-hop-tuong/thap-art/redo/hydra_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/dongbo_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/tienhoa_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nhatthuc_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/leviathan_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/khoisinh_nong_v2.png

```
Sprite sheet of 6 horizontal beam strips stacked vertically (1 column x 6 rows), each strip a seamless left-right tileable energy beam texture filling the full width, brightest along its center line, soft edges fading into the background. Colors match the attached turret heads in the same order.
Strip 1: emerald serpent energy beam.
Strip 2: gold sync beam with blue rings.
Strip 3: green-gold DNA helix beam.
Strip 4: black-orange corona ray.
Strip 5: teal water breath stream.
Strip 6: gold-green vine light arc.
Flat solid magenta #FF00FF background between strips, no text, no letters, no frames, same cartoon game style as the attached turret heads.
```

File ra: `fx_hydra_tia.png` · `fx_dongbo_tia.png` · `fx_tienhoa_tia.png` · `fx_nhatthuc_tia.png` · `fx_leviathan_tia.png` · `fx_khoisinh_tia.png` · tờ gốc `fx_sheet_B2.png`


### Tờ B3 — `set`, `bao`, `overlord`, `orbital`, `nemesis`, `docton`

Đính kèm: docs/demo-hop-tuong/thap-art/redo/set_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/bao_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/overlord_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/orbital_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/nemesis_nong_v2.png, docs/demo-hop-tuong/thap-art/redo/docton_nong_v2.png

```
Sprite sheet of 6 horizontal beam strips stacked vertically (1 column x 6 rows), each strip a seamless left-right tileable energy beam texture filling the full width, brightest along its center line, soft edges fading into the background. Colors match the attached turret heads in the same order.
Strip 1: pink-gold lightning bolt.
Strip 2: violet lightning bolt.
Strip 3: red lightning bolt.
Strip 4: cyan orbital lance.
Strip 5: crimson judgment ray.
Strip 6: red card-slash trail.
Flat solid magenta #FF00FF background between strips, no text, no letters, no frames, same cartoon game style as the attached turret heads.
```

File ra: `fx_set_tia.png` · `fx_bao_tia.png` · `fx_overlord_tia.png` · `fx_orbital_tia.png` · `fx_nemesis_tia.png` · `fx_docton_tia.png` · tờ gốc `fx_sheet_B3.png`


---

## 6. TỜ TRẠNG THÁI QUÁI (ST) — 16 ô

Dùng chung cho mọi nguồn gây trạng thái (`quaianim.js` + `render.js` vẽ quái). Thay toàn bộ quầng `cham1` / hạt code; **thêm hình cho choáng** (hiện không có).

| Ô | File | Nội dung |
|---|---|---|
| 1 | `fx_st_cham.png` | slowed: thin icy frost crust ring |
| 2 | `fx_st_dong.png` | frozen: translucent ice block |
| 3 | `fx_st_doc.png` | poisoned: green drips and bubbles |
| 4 | `fx_st_chay.png` | burning: small orange flames |
| 5 | `fx_st_choang.png` | stunned: ring of yellow dizzy stars |
| 6 | `fx_st_yeu.png` | weakened: violet cracked aura |
| 7 | `fx_st_giapvo.png` | armor broken: cracked shield |
| 8 | `fx_st_cauvong.png` | rainbow shimmer ring |
| 9 | `fx_st_kep.png` | jammed: chain clamp ring |
| 10 | `fx_st_frostbite.png` | frostbite: ice crystals with red tint |
| 11 | `fx_st_dau.png` | marked: red target reticle |
| 12 | `fx_st_khienvang.png` | gold shield bubble |
| 13 | `fx_st_keo.png` | pulled: small violet swirl |
| 14 | `fx_st_tua.png` | rewound: teal clock arrows ring |
| 15 | `fx_st_doclay.png` | poison spread: green spore puff |
| 16 | `fx_st_xutu.png` | reaper mark: green scythe icon |

Đính kèm: tờ T05, T07, T08 đã gen (giữ phong cách) + `thap/assets/quai_bo.png` để thấy cỡ quái

```
4x4 grid sprite sheet, 16 enemy status overlays for a top-down tower-defense game, each drawn around or above an invisible enemy at the cell center (leave the middle mostly see-through, effect at the rim or on top), readable at small size.
[1] slowed: thin icy frost crust ring. [2] frozen: translucent ice block. [3] poisoned: green drips and bubbles. [4] burning: small orange flames. [5] stunned: ring of yellow dizzy stars. [6] weakened: violet cracked aura. [7] armor broken: cracked shield. [8] rainbow shimmer ring. [9] jammed: chain clamp ring. [10] frostbite: ice crystals with red tint. [11] marked: red target reticle. [12] gold shield bubble. [13] pulled: small violet swirl. [14] rewound: teal clock arrows ring. [15] poison spread: green spore puff. [16] reaper mark: green scythe icon.
Flat solid magenta #FF00FF background everywhere, no text, no letters, no numbers, same bold cartoon style as the attached sheets.
```

Code: overlay vẽ sau thân quái, cỡ = `co × 1.1`, alpha 0.85, nhịp thở ±6% 2 Hz; `fx_st_choang` xoay 120°/s trên đầu quái khi `E.chan > 0`; `fx_st_cham` thay `cham1('#78D9F5')`; `fx_st_doc` thay hạt xanh lá; `fx_st_chay` thay than `cham1`; `fx_st_yeu/giapvo/cauvong/khienvang` thay quầng `cham1` tím/5 màu/vàng.


---

## 7. THỨ TỰ GEN ĐỀ XUẤT + DANH SÁCH TỜ

1. **T03** (có Dice Gun — câu hỏi của người dùng) → **T22** (hạt chung, thay `vet`/`cham1`/`vong1` cho mọi ụ) → **ST** (trạng thái, có choáng) — 3 tờ này sửa được nhiều lỗi nhìn nhất.
2. Ụ lệch rõ nhất: T04 (Lone Ace), T09 (Lighthouse), T14 (Eclipse), T16 (Hive Queen, Drone), T18 (Wall, Wyrm), T20 (Werewolf) + B1–B3.
3. Còn lại T01–T21, rồi G1–G4.

| Nhóm | Tờ | Số tờ | PNG ra |
|---|---|---|---|
| Ụ (4 ụ × 4 ô) | T01–T21 | 21 | 336 |
| Evolver + hạt chung | T22 | 1 | 4 + 12 |
| Dạng 2/3 | G1–G4 | 4 | 64 |
| Tia | B1–B3 | 3 | 18 |
| Trạng thái quái | ST | 1 | 16 |
| **Tổng** | | **30** | **450** |

Sau khi có ảnh: session sửa code thay theo cột "Code dùng" ở từng tờ; xoá dần `GFX.taoSprite` (23 sprite canvas), `REN.vet`, `REN.cham1` (cho hiệu ứng), `anhNon`, `veDrone`, các `ve()` dùng arc/gradient trong HU — theo `QUY-TAC-HINH.md`.

---

## Stage heads (đầu dạng 2/3 cho đầu v2)

Đầu v2 (85 ụ, `thap/assets/<id>_nong.png`) đã thay đầu cũ → ảnh `_nong_s1/_s2/_s3` cũ **không còn khớp**. Tạm thời (`artscale.js` `STAGE_DAU_MOI`, `growfx.js` mục 7): cả 3 dạng dùng **đầu mới**, dạng 2 to ×1.04 + quầng viền màu dạng (bóng của chính ảnh đầu), dạng 3 ×1.08 + quầng đậm hơn + `fx_awaken.png`. Số cũ cất trong `STAGE_K_CHO` / `STAGE_TIP_CHO`.

**Cần ảnh mới `_s2` + `_s3` cho 14 ụ** (dạng 1 = đầu v2 hiện tại, không cần gen). Gen theo cặp: đính kèm `thap/assets/<id>_nong.png`, 1 tờ 2 ô (trái = dạng 2, phải = dạng 3).
Đầu prompt chung (dán trước mỗi dòng): *"Same turret head as attached, same style, top-down view, barrel pointing right, centered, same canvas size, solid magenta #FF00FF background, no text. 2 cells side by side: left = stage 2, right = stage 3 (stronger)."*

| id | Tên | Dạng 2 / 3 | Prompt ngắn (sau đầu prompt chung) |
|---|---|---|---|
| overlord | Overlord | CHARGING / OVERCHARGED | `left: red energy coils glowing, crackling sparks on horns; right: horns longer, core blazing white-red, extra capacitor fins` |
| hopbi | Mystery Box | UNSEALING / ABOUT TO OPEN | `left: lid straps loosening, purple light leaking from seams; right: lid cracked open, bright purple glow and floating question-mark gems` |
| tienhoa | Evolver | FORGING / ASCENDING | `left: DNA tank glowing gold, extra vine-metal plating; right: golden wings of metal leaves, radiant core, crown spikes` |
| lophanung | Cryo Reactor | HEATING / CRYO STORM READY | `left: ice crystals grow longer, core pulsing cyan; right: huge frost spikes all around, white-blue storm core, frost mist ring` |
| soi | Werewolf | HUNTER / ALPHA | `left: bigger wolf head, red eyes, claws extended; right: alpha wolf with spiked armor mane, glowing red scars, bigger jaws` |
| cuongno | Berserker | RAGE / FRENZY | `left: spikes heated orange, steam vents; right: red-hot glowing spikes, cracked armor leaking fire, twin barrels flared` |
| ngoisao | Star Cannon | NOVA / SUPERNOVA | `left: star core brighter, extra golden star points; right: blazing white-gold supernova core, rays and bigger star crown` |
| lienket | Chain Link | LINKED / CHAIN MASTER | `left: chains glowing purple, extra links; right: double chain ring, violet energy gem core, spiked chain hooks` |
| dongbo | Sync Cannon | SYNCED / FULL SYNC | `left: orbit rings lit gold, twin barrel aligned; right: triple glowing rings, bright synchronized core, longer barrel` |
| hydra | Hydra | MANY HEADS / FUSED HEAD | `left: five snake heads; right: heads fused into one huge emerald serpent head, glowing green eyes and gem` |
| cuuvi | Nine-Tail | BLAZING TAILS / NINE-TAIL | `left: tails on fire orange; right: nine tails with white-blue foxfire, glowing fox mask` |
| luoicheo | Resonance Grid | HUMMING / RESONANCE | `left: diamond nodes glowing teal; right: grid lines bright, crystal pylons at 4 corners, resonance core` |
| ngaithoigian | Chrono Throne | TWELVE HOURS / THRONE OF TIME | `left: clock face with ruby hands glowing; right: grand throne of gears, ruby crown, floating golden clock rings` |
| ronglua | Wyrm Engine | BLUE WYRM / WHITE WYRM | `left: dragon flames turn blue, horns longer; right: white-silver dragon head, white-blue fire, armored crest` |

Khi có ảnh: cắt khoá magenta, 256 px, thân đúng tâm (chạy lại đo ở `tools/thap-dau-v2.py`), lưu `<id>_nong_s1` (= đầu v2), `_s2`, `_s3`; chuyển id từ `STAGE_K_CHO`/`STAGE_TIP_CHO` về `STAGE_K`/`STAGE_TIP` (đo lại K) và xoá khỏi `STAGE_DAU_MOI`.
