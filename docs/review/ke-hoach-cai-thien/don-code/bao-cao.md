# Báo cáo: dọn code thừa sau khi bỏ nhân vật/hệ thống cũ

Theo `YEU-CAU.md` cùng thư mục. Nhánh `khoi-tao-du-an`, commit chính **`67264270`**.

**Chưa test** (đúng yêu cầu: không Playwright, không chạy game). Chỉ kiểm: grep mọi tên trước khi xoá (trong `game/js`, `game/index.html`, `game/build.py`, `game/tests`, `tools/**`), `node --check` toàn bộ `game/js/*.js` và `tools/xuong-sprite/nguon/*.js` (sạch), `python3 game/build.py` (chạy hết, không lỗi).

## 1. `js/zed_moi.js`

- Xoá `const bat = () => G.ZED !== false && G.ZED_MOI !== false` (luôn đúng) và bỏ `bat()` ở 4 chỗ gọi (bọc `G.art.hero`, `G.art.proj`, `G.tinhLinh.tip`, `lechHinh`).
- Bỏ chú thích cờ `?zedmoi=0` / `?zed=0` (dòng 13), sửa chú thích `lechHinh` (bỏ "Zed cũ").
- Bỏ `if (cu._ghepLop) moi._ghepLop = true` (dấu của `js/ghep_lop.js` đã xoá ở đợt 2).
- Giữ nguyên mọi cờ còn dùng: `?camvk`, `?huongvk`, `?eosua`, `?chaydanh`, `?zedbo`, `?buakhop`, `?hudot3`, `?tuluc`, `?gonhu`, `?skillbo`…

## 2. Các tệp `js` khác

| Tệp | Đã xoá | Vì sao chết |
|---|---|---|
| `data.js` | `G.HE_MOI`, `G.ZED`, `G.ZED_MOI`, `G.HKEYS_CHOI` (4 dòng gán + chú thích) | không mã, công cụ, bài kiểm nào đọc (sau khi bỏ `bat()`). **Không đụng bảng số cân bằng.** |
| `truyen.js` | khối `{ MO_DAU[3].loi = …; VUNG… }` ghi đè lời | lời Zed ghi thẳng vào bảng; bỏ bản "Cu Tí / gặp Ông Từ để đổi em bé" của cờ `?zed=0`. Chữ hiện ra y như trước. |
| `art.js` | `HELM_COL`, `ARMOR_COL` và 7 nhánh vẽ mũ/áo giáp (`o.helm`, `o.armor`); `stage3` | không nơi nào còn truyền `helm/armor` (đợt 2 bỏ đồ mặc cũ) |
| `village_scene.js` | `helm: null, armor: null` khi vẽ NPC; `G.VillageDemo` | thừa / không ai gọi |
| `stage.js` | `goldKeepHint` (nhắc "luyện món cũ lên Vàng ở Thợ Rèn") + `R.v18`; `G.SPAWN_MODES` | `vk_moi.chuan` đặt mọi vũ khí `rarity = 0` mỗi lần nạp → điều kiện `wRar === 3` không bao giờ đúng; Thợ Rèn không còn luyện Vàng |
| `ui_theme.js` | `T.swordIcon`, `T.TOP_H`, `T.costItems` | không ai gọi (bảng giá mua/rèn đồ cũ) |
| `mobs.js` | hàm `scan()`; `G.mobBlast`, `G.mobShoot`, `G.mobSummonSpot`, `G.mobIcon` (chỉ dòng xuất ra G, hàm trong vẫn dùng) | không ai gọi |
| `combat.js` | `G.zoneRect` | không ai gọi |
| `sprite_custom.js` | `T.resIconCode`; biến `sv` thừa trong `dangDung` | không ai đọc |
| `fx_ky_nang.js` | `fx.capNhan` | không ai gọi |
| `fx.js`, `fx_he.js`, `fx_dan.js`, `moves.js`, `env_art.js`, `bang_vang.js` | `stageOf`, `VENOM`, `C0`, `CONE`, `ri`, `foam`, `GOOD` | biến/hằng cục bộ không ai đọc |
| `cloud.js` | hằng `REDIR` (mảng mã lỗi không ai đọc) | không đụng gì khác: đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên |

Không còn nhánh `if (!G.ZED)`, `G.ZED_MOI === false`, `!G.HE_MOI` nào trong `game/js` (grep sạch).

## 3. Giữ lại (còn dùng, hoặc không chứng minh được là chết)

| Giữ | Lý do |
|---|---|
| `G.wRar`, `G.RARITY`, `G.wRarMult`, `G.GOLD_MULT` | công thức sát thương và màu chữ vẫn đọc; đổi là đụng bảng cân bằng (phiên khác đang chỉnh) |
| `w.marks` / `w.branch` | `vk_moi.js` lưu cấp vũ khí bằng dấu ấn đúng mốc `G.MARKS`; `linhkhi.js` hiển thị |
| `fixSave`, `vk_moi.js` (`AO_CU`, `boAoCu`, `moCu`…), `engine.js` đọc `save.heroes`, `w.tier`, `w.affix`; `luu_luot.js` khôi phục `g.w` | đường đọc save cũ |
| Thẻ vũ khí ở bảng kết quả (`l.w`) | còn tới được khi khôi phục lượt chơi lưu từ bản cũ |
| Hình 3 em bé NPC, `LOOK`/`heroBody` trong `art.js` (hình dự phòng qua `heroOld`), 4 họ `weapon_art.js` | NPC + hình dự phòng khi ảnh chưa tải |
| `ICON.h_hunter/h_healer/h_wrestler`, `HERO_FACE` trong `btn_art.js` | trang `tools/tach-giao-dien` vẽ nút kỹ năng của cả 4 bé |
| Móc kiểm thử: `G.veYen`, `G.luuLuot`, `G.mobIconCo`, `G.mobBomb`, `T.gdHinhLon`, `T.vungCham`, `G.TIERS` | bài kiểm / công cụ dùng (phiên bot đo cân bằng) |
| `monster_art.js` | tệp ghép tự động từ `docs/phac-thao/quai-hoat-hinh/nguon` — có vài hàm không gọi (`cotNuoc`, `nuocDai`, `muonDon`, `ctDom`, `ctRung`) nhưng sửa ở đây sẽ bị ghi đè; phải sửa nguồn rồi ghép lại |

## 4. Hợp nhất trùng lặp

Đã dò hàm một dòng giống hệt nhau ở nhiều tệp: `gdAnh` (5 tệp), `num` (`engine`/`vk_moi`), `so1` (`hanh_trang`/`vk_moi`), `scr` (`fx_he`/`fx_chuong`), `DOC` (`stage`/`fx`), `FX` (`boss`/`mobs`), `taoNho` dự phòng (5 tệp), `gocGan` (`zed_moi`/`hero_tinhlinh`), bảng màu `SOFT/TXT/GOLD/GOOD/WARN` (5 tệp). **Không gộp**: mỗi bản chỉ 1 dòng, gộp phải thêm phụ thuộc thứ tự nạp tệp, và một số tệp (`room_art`, `btn_art`, `hero_tinhlinh`, `sprite_custom`) được trang công cụ nạp riêng lẻ — bản dự phòng tại chỗ là cố ý. Không đáng rủi ro khi không được test.

## 5. Dung lượng trước / sau

| | Trước | Sau |
|---|---|---|
| `game/js` (52 tệp) | 2 659 832 B | **2 653 959 B** (−5 873 B) |
| `dist/linh-khi.html` (một tệp) | 25 395 910 B | **25 390 037 B** (−5 873 B) |
| `dist/xuong-sprite.html` | 1 516 833 B | 1 515 462 B |

Mã chết lớn đã được xoá ở đợt 2; đợt này chủ yếu là phần sót nhỏ (18 tệp, +30 / −117 dòng).

## 6. Lưu ý cho phiên sau

- Cần chủ dự án chơi thử: màn mở đầu + lời sau mỗi trùm vùng (truyen.js), bảng kết quả sau trận, nút trong trận, NPC trong làng.
- `ngon_ngu_en.js` còn bản dịch câu "Món cũ {0} có {1} linh khí…" (không còn dùng) — dọn bằng `tools/ngon-ngu/gop.py` nếu muốn.
- `monster_art.js`: xoá 5 hàm thừa ở tệp nguồn rồi ghép lại.
