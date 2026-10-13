# Báo cáo đợt 2 — dọn hẳn hệ thống / nhân vật cũ

Theo `YEU-CAU-2-DON-CU.md` (đã đọc `bao-cao-1.md` trước). Nhánh `khoi-tao-du-an`, commit chính **`8d013a7`**.

**Chưa test** (đúng yêu cầu: không Playwright, không chạy game). Chỉ kiểm: `node --check` toàn bộ `game/js/*.js` và `tools/xuong-sprite/nguon/*.js` (sạch), `python3 game/build.py` và `build.py --hai-tep` (chạy hết, không lỗi kiểm tệp).

## 1. Cờ đã bỏ

| Cờ | Trước | Sau |
|---|---|---|
| `?hethongcu=1` | quay về luật cũ, bản lưu riêng `linhkhi_save_v1_hecu` | bỏ. `G.HE_MOI` luôn `true`; khoá lưu duy nhất `linhkhi_save_v1` |
| `?zed=0` | chơi 4 em bé như bản trước | bỏ. `G.ZED` luôn `true` (giữ tên vì mã/công cụ còn đọc) |
| `?zedmoi=0` | Zed hình cũ | bỏ. `G.ZED_MOI` luôn `true` |

`js/zed_moi.js` **không sửa**: phiên khác đang sửa tệp này (3 commit trong 2 giờ gần nhất). Vì `data.js` đặt cứng `G.ZED = G.ZED_MOI = true`, hàm `bat()` trong `zed_moi.js` luôn đúng → nhánh cờ cũ là mã chết vô hại. Phiên sau rảnh có thể xoá dòng 13 (chú thích cờ), dòng 30 (`bat`) và nhắc `ghep_lop` ở dòng 555.

## 2. Đã xoá

### Tệp hình (251 tệp, ~4,95 MB JSON)

| Nhóm | Số tệp | Ghi chú |
|---|---|---|
| `em-be-*` cũ | 25 | cả `em-be-smith*`, thân theo bộ (`-rung/-bien/-lau`), tệp đòn `-don` của 4 bé. Riêng 25 tệp này ~4,17 MB |
| `tp-*` trang phục cũ | 52 | |
| `vk-*` vũ khí vẽ cũ | 160 | |
| `ghep-*` hồ sơ ghép | 4 | |
| `gd-nut-ky-nang-healer/hunter/smith/wrestler` | 4 | nút kỹ năng của 4 bé |
| `gd-khien`, `gd-khoa`, `gd-khoa-mo`, `gd-tich` | 4 | không mã nào còn gọi |
| `hu-dan-ten` | 1 | giữ `hu-dan-ten-fire/-ice/-poison` |
| `art/du-tru/tp-hats-non_la-ai-cu` | 1 | giữ `ho-lua-tu-hoTinh-cu` |

### Mã

- Xoá hẳn: `js/outfit.js`, `js/tailor.js`, `js/ghep_lop.js`, `js/ban_do.js`, `js/hero_art.js`, `art/lop/README.md` (gỡ thẻ script trong `index.html`, gỡ khỏi `build.py`: phần nhúng lớp ghép, `TOOL_GAME_JS`).
- `data.js`: bỏ `LK_PHU`, `G.GEAR`, `G.SETS`, `G.TIER_UP`, `goldCost`; bảng rơi/giai đoạn/họ vũ khí chỉ còn số của hệ mới.
- `engine.js`: bỏ nhánh `_hecu`, `newSave` không còn `owned/helm/armor/charm/outfit`; `fixSave` bỏ pha "trang bị"/"trang phục" (giao cho `vk_moi.js`).
- `combat.js`, `stage.js`: bỏ chỉ số từ mũ/áo/bùa/bộ, móc trang phục, bẫy, bình, mưa tên, vũ khí thứ hai, rương vũ khí, rơi đồ cũ, bán/nâng bậc.
- `village.js`, `hanh_trang.js`, `village_scene.js`, `luc_chien.js`, `upgrade.js`…: bỏ Nâng bậc, Tôi lại, Rèn đồ, mua/bán, chọn em bé, tab đồ cũ.
- `fx.js`: bỏ api chết `slam` (api ngoài; hàm trong vẫn dùng), `nung`, `trapPlace`, `trapSnap`, `bottle`/`bottleBreak`, `gong`, `hitStop`, `rainDrop` + vòng mưa, hình bẫy gấu, lấp lánh bẫy, nhánh "hurt blocked".
- `fx_dan.js`: bỏ đuôi mũi tên cũ; phi tiêu cắm (`drawStuck`) giờ vẽ ảnh `zed-vk` phi tiêu (dự phòng: chữ thập nhỏ).
- `sprite_custom.js`: từ chối `vu-khi`, `trang-phuc`, `ghep` và em bé ngoài 3 NPC; bỏ toàn bộ phần ghép áo/vũ khí lên thân em bé.
- `weapon_art.js`: chỉ còn 4 họ khởi đầu (Kiếm Rèn, Phi Tiêu Tre, Giáo, Búa); `hero_tinhlinh.js`: chỉ còn đồ khởi đầu của NPC.
- `build.py`: từ chối `vu-khi/trang-phuc/ghep` và `em-be` ngoài `em-be-hunter|healer|wrestler` (báo "đã bỏ ở đợt 2"); luật `bat_buoc`/`thu_tu_sau` cập nhật.
- Xưởng Sprite (`tools/xuong-sprite/nguon/do.js`, `giao-dien.js`): bỏ nhóm vũ khí/trang phục, em bé chỉ còn 3 NPC.

## 3. Giữ lại (còn dùng)

| Giữ | Vì sao |
|---|---|
| `em-be-hunter`, `em-be-healer`, `em-be-wrestler` | 3 bạn đồng hành (NPC) |
| `gd-bua-*` | bùa phủ hệ vẫn còn trong hệ mới |
| `gd-vat-ruong-do` + vẽ rương trong `env_art` | rương đồ của phòng (lô 18 ô, `tools/tach-phong`) |
| Ống vũ khí/AI trong `hero_tinhlinh.js`, `sprite_custom.js` (`CO_VK`, `coVk`, `namVk`, hàm hỏi ghép trả rỗng) | NPC cầm vũ khí, `tinhLinh.tip()` cho vệt chém, `fx.js` dùng `G.CO_VK` làm cờ |
| 4 họ trong `weapon_art.js` | vũ khí bay ở làng, Phi Thương, hình dự phòng khi ảnh Zed chưa về |
| `G.RARITY`, `G.AFFIX`, `G.POWER` | mô hình dữ liệu bản lưu vẫn đọc |
| `hu-dan-ten-fire/-ice/-poison` | đạn theo hệ |

## 4. Bản lưu cũ vẫn mở được

- `vk_moi.js` thêm `AO_CU` (món → [ô, giá]), `AO_TU_CU` (đồ cũ → [món, độ hiếm]), `aoCu(s)` và `boAoCu(s)`: lần chuyển hệ (`heMoi` lần đầu) hoàn tiền áo/mũ/bùa cũ rồi xoá `outfit/owned/helm/armor/charm`; bản đã chuyển (`heMoi === 1`) chỉ dọn sót.
- `engine.js` vẫn đọc `save.heroes` của 4 bé cũ (dữ liệu Cu Tí nằm ở `save.zed.cuTi`), bạn đã cứu vẫn được tính là đã dạy. Bản sao `..._truoc_he_moi` giữ nguyên.
- Bản lưu đang dùng `?hethongcu=1` (khoá `_hecu`) không còn được đọc — đúng yêu cầu bỏ cờ.
- Không đụng `cloud.js` phần đăng nhập Google / lưu mây / `?cloud=0` (chỉ bỏ dòng tắt mây khi `HE_CU`).

## 5. Dung lượng trước / sau

| | Trước | Sau |
|---|---|---|
| `dist/linh-khi.html` (một tệp) | 29 544 KB (28,85 MB) | **24 363 KB (23,79 MB)** |
| `game/art/custom` | 635 tệp, 27 278 577 B | **385 tệp, 22 323 998 B** |
| `game/js` | 56 tệp, 2 981 106 B | **52 tệp, 2 623 431 B** |
| Hai tệp: `linh-khi-nhe.html` | 3 179 KB (nén 951 KB) | **2 717 KB (nén 836 KB)** |
| Hai tệp: ảnh trên máy chủ | 631 ảnh, PNG 19,34 MB + WebP 8,03 MB = 27,38 / 26 MB **VƯỢT TRẦN** | **385 ảnh, PNG 15,87 MB + WebP 6,99 MB = 22,87 / 26 MB** (dưới trần) |

## 6. Còn lại / lưu ý cho phiên sau

- **Cần chủ dự án chơi thử** (đợt này không test): làng (Ông Từ, Thợ Rèn chỉ còn Mài / Linh khí / Nâng lò, Cô Thợ May), ải 1, rơi áo trùm, mở bản lưu cũ có đồ cũ, Xưởng Sprite.
- `js/zed_moi.js`: nhánh cờ cũ còn (xem mục 1).
- `tests/` chưa cập nhật: `zed_chay_danh.py` còn dùng `?zedmoi=0`, `ghep.py` dùng `TIER_UP` — sẽ hỏng nếu chạy.
- Công cụ `tools/tach-ghep`, `tach-ghep-lop`, `vk-cap-he`, `tach-do`, `tach-anh-hung` chưa dọn; phần vũ khí/trang phục/ghép của chúng giờ vô dụng (build sẽ từ chối tệp chúng xuất ra).
- `docs/phac-thao` còn nhắc `hero_art.js`.
- Chuỗi chữ mới chưa có bản tiếng Anh (`ngon_ngu_en` sinh bằng `tools/ngon-ngu/gop.py`).
