# Phụ lục 7: Tệp ảnh, sprite sheet, JSON và cách đóng gói

Phụ lục này phục vụ mục 14 của yêu cầu (tệp hình ảnh, sprite sheet, JSON atlas, cấu hình), cùng một phần mục 7 (sprite sheet, cắt khung, chỉ số khung, thời lượng) và mục 13 (sai khung, khung trùng). Số liệu đo ở commit `229e263` (nhánh `khoi-tao-du-an`).

**Cách đo.** Script Python chỉ đọc (Pillow 12.3), đặt ở `scratchpad/pl7/kiem_ke.py` và `thua.py`. Script giải mã từng ảnh `tam`/`anh` (PNG base64), lấy kích thước thật, rồi cắt từng khung theo `khung_rong×net`, `khung_cao×net`. Với mỗi khung, script đếm số điểm ảnh có alpha>0 và băm MD5 (hash) điểm ảnh để tìm khung trùng. Lần đo này không chạy `game/build.py` và không ghi vào `game/`. Mọi con số dưới đây là **đã đo**, trừ chỗ ghi rõ "suy luận".

---

## 1. Kiểm kê toàn bộ tệp

### 1.1 Tổng quan

| Nhóm (theo mã / `doi_tuong`) | Số tệp | Byte JSON | Byte PNG (giải base64) | `net` | Khung (game px) | Kiểu ảnh |
|---|---:|---:|---:|---|---|---|
| `em-be-<key>`: thân gốc (`em-be`) | 4 | 642 340 | 480 147 | 2 | 48×48 | `tam`, 8 cột × 7 hàng |
| `em-be-<key>-<bộ>`: thân bộ (`em-be`) | 12 | 2 508 837 | 1 876 614 | 2 | 48×48 | `tam`, 8×7 |
| `em-be-…-don`: đòn theo vũ khí (`em-be`) | 12 | 1 729 823 | 1 293 240 | 2 | 48×48 | `tam`, 8×5 |
| `ghep-<key>` (`ghep`, chỉ số liệu) | 4 | 27 550 | 0 | — | — | không có ảnh |
| Quái thường (`quai`) | 33 | 3 549 281 | 2 650 706 | **không ghi** (=1) | 40×32 … 140×80 | `tam`, 8×6 (vài con 8×5) |
| Trùm pha 1: `mocTinh`, `nguTinh`, `hoTinh` | 3 | 2 720 774 | 2 039 559 | `hoTinh` 2, hai con kia không ghi (=1) | 168×140, 180×116, 208×128 | `tam`, 8×6 |
| Dáng pha trùm `-p2`/`-p3` | 6 | 1 843 585 | 1 380 879 | 2 | như pha 1 | `tam`, 8×4 |
| Người làng `nl-*` (`nguoi-lang`) | 7 | 381 464 | 284 543 | 2 | 56×52 | `tam`, 8×2 |
| Hiệu ứng `hu-*` (`hieu-ung`) | 101 | 6 261 705 | 4 675 442 | 2 | 8×12 … 192×160 | `tam`, một dải ngang |
| Vũ khí `vk-*` (`vu-khi`) | 160 | 446 718 | 301 701 | 2 | — | `anh` (một ảnh tĩnh) |
| Trang phục `tp-*` (`trang-phuc`) | 52 | 85 391 | 51 349 | 2 (4 tệp `tp-hats-trum_*` không ghi) | — | `anh` |
| Vật phẩm `vp-*` (`vat-pham`) | 14 | 22 935 | 15 307 | 2 | — | `anh` |
| Giao diện, nền, phòng `gd-*` (`giao-dien`) | 218 | 1 780 266 | 1 306 253 | 2 (`gd-lang-nen`, `gd-ban-do-vung` không ghi) | — | `anh` |
| **Cộng `game/art/custom/`** | **626** | **22 000 669** | **16 355 740** | | | |
| `game/art/du-tru/` (không đóng gói) | 2 | 600 020 | 449 450 | — | | |

Hai tệp trong `game/art/du-tru/`:

| Tệp | `ma` bên trong | Nội dung | Ghi chú |
|---|---|---|---|
| `ho-lua-tu-hoTinh-cu.sprite.json` | `hoTinh` | Hồ Tinh pha 1 bản cũ: net 1, 1664×768, 6 hàng | **cùng mã** với `custom/hoTinh` |
| `tp-hats-non_la-ai-cu.sprite.json` | `tp-hats-non_la` | nón lá bản cũ | **cùng mã** với `custom/tp-hats-non_la` |

`build.py` chỉ đọc `art/custom` (`CUSTOM = os.path.join(ROOT, 'art', 'custom')`, `game/build.py:356`), nên `du-tru` không vào game. Nếu chép lại vào `custom/` thì tệp nào nạp sau sẽ đè tệp nạp trước (`SC.ds[sp.ma] = sp`, `game/js/sprite_custom.js:146`).

### 1.2 Tệp có động tác (sprite sheet): em bé, người làng, trùm

Bảng ghi `so khung / giay`. `L` là `lap: true`; `mo` là mốc bắt đầu mờ của hàng chết. Kích thước ảnh là điểm ảnh thật (đã nhân `net`).

| Mã | net | Ảnh thật | Mong đợi (khung×max so × hàng) | idle | move | tele | atk | hit | die | ne / noi |
|---|---|---|---|---|---|---|---|---|---|---|
| em-be-smith / -hunter / -healer / -wrestler (thân gốc) | 2 | 768×672 | 768×672 ✓ | 6/1L | **8**/0.65L (smith, healer), **8**/0.6L (hunter, wrestler) | 4/0.4 | 6/0.4 | 4/0.2, **healer 3**/0.2 | 8/0.6 | ne 6/0.4 |
| em-be-<key>-rung/-bien/-lau (12 thân bộ) | 2 | 768×672 | 768×672 ✓ | 6/1L | **6**/0.6L | 4/0.4 | 6/0.4 (wrestler-bien có `khung`) | 4/0.2 | 8/0.6 | ne 6/0.4 |
| em-be-…-don (12 tệp) | 2 | **768**×480 | 576×480 | atk_sword 6/0.45 · atk_bow 6/0.45 · atk_spear 6/0.45 · atk_hammer 6/**0.55** · cast 6/0.4 | | | | | | |
| nl-do, lai, may, mo, ren, tu, xen | 2 | **896**×208 | 672×208 | 6/1.2L | — | — | — | — | — | noi 6/0.9L |
| mocTinh | — (1) | 1344×840 | ✓ | 6/1.4L | 6/0.8L | 4/0.7 | 6/0.6 | 4/0.3 | 8/1.2 mo 0.6 | |
| mocTinh-p2, -p3 | 2 | **2688**×1120 | 2016×1120 | 6/1.4L | — | 4/0.7 | 6/0.6 | 4/0.3 | — | |
| nguTinh | — (1) | 1440×696 | ✓ | như mocTinh | | | | | | |
| nguTinh-p2, -p3 | 2 | **2880**×928 | 2160×928 | như mocTinh-p2 | | | | | | |
| hoTinh | 2 | 3328×1536 | ✓ | như mocTinh | | | | | | |
| hoTinh-p2, -p3 | 2 | **3328**×1024 | 2496×1024 | như mocTinh-p2 (p2 atk có `khung`) | | | | | | |

**Vì sao ảnh rộng hơn số khung khai báo.** Các công cụ tách luôn dựng lưới **8 cột**: `const TW = FW * 8, TH = FH * NR` ở `tools/tach-anh-hung/index.html:1032` và `const TW = FW * 8, TH = FH * SH` ở `tools/tach-quai/index.html:971`. Hai cột thừa (cột 6, 7) của `-don`, `nl-*`, `-p2`/`-p3` đều **trong suốt hoàn toàn** (0 điểm ảnh, đã đo), trừ một chỗ ở §1.4.

**Điểm chân (`goc`).** Cả 28 tệp `em-be` đều dùng `goc` [24, 45], `rong`×`cao` 16×29. Bảy tệp `nl-*` dùng [28, 49]. Mép dưới của hình (alpha bbox) nằm ở y 45–46,5 trên mọi hàng, trừ hàng move của thân gốc. Ở hàng này hình nhấc lên tới 4,5 px (hunter 41,5; wrestler 41; smith 42; healer 43) vì nhún đã vẽ sẵn trong ảnh. Vì vậy cả 4 thân gốc có `"nhun_buoc": false`.

### 1.3 Quái thường (33 tệp)

Cả 33 tệp đều có đủ 6 hàng idle, move, tele, atk, hit, die. Không tệp nào có `ne`/`noi`. Không tệp nào ghi `net`, nên game đọc thành 1 (`docNet`, `game/js/sprite_custom.js:93`). Kích thước ảnh đúng bằng `khung×6 cột` (8 cột cho hàng die) × 6 hàng. Mẫu chung:

| Mẫu | Số tệp (ví dụ) | idle | move | tele | atk | hit | die |
|---|---|---|---|---|---|---|---|
| Quái nhỏ | 25 (cua, nhim, caCon, heoCon…) | 6/1.2L | 6/0.6L | 4/0.5 | 6/0.5 | 4/0.3 | 8/1.2 mo 0.6 |
| Quái to / tinh anh | cuaDa, hoLua, namChua, namPhongChua | 6/1.4L | 6/0.8L | 4/0.7 | 6/0.6 | 4/0.3 | 8/1.2 mo 0.6 |
| Lệch mẫu | boHung (move 0.7), chonBong (1/0.45/0.4/0.4), hoaBaoTu (1.4/1/0.6), namPhong (tele 0.6), ongVo (0.6/0.4/0.4/0.4), socNo (1/0.5) | | | | | | |

Kích thước khung: nhỏ nhất `nhim` 40×32, lớn nhất `cuaDa` 140×80.

### 1.4 Bất thường đã đo

| # | Tệp | Bất thường | Số đo | Ảnh hưởng |
|---|---|---|---|---|
| B1 | `em-be-healer` | hàng hit khai báo `so: 3`, nhưng cột 3 vẫn còn hình | cột 3 hàng 4: 1 330 điểm ảnh | Cố ý. `docs/review/ke-hoach-cai-thien/cai-bong/bao-cao.md:8` ghi: "khung 4 … nằm ngửa … đổi `so` về 4 là dùng lại". Thân bộ và 3 thân gốc kia dùng 4 khung, nên **không đồng nhất** (§4) |
| B2 | `em-be-wrestler-bien` | atk khung 0 = khung 1 (băm trùng) | 2 217 = 2 217 điểm ảnh | đã xử lý bằng `"khung": [0,2,3,4,5], "cham": 4` |
| B3 | `socNo` | atk 0 = 1; die 0 = 1 và 4 = 5 | trùng 100 % | đã xử lý: atk `khung [0,2,3,4,5] cham 4`; die `khung [0,2,3,4,6,7]` |
| B4 | `hoTinh-p2` | atk khung 4 = khung 5 (khung cuối) | 42 912 = 42 912 | đã xử lý: `khung [0,1,2,3,4] cham 4` |
| B5 | `em-be-hunter`, `em-be-wrestler` | move khung 3 = khung 7 (hai khung không liền nhau, băm trùng) | trùng 100 % | Không làm giật hình, vì đây là tư thế chân qua nhau, lặp lại ở hai bước. Báo cáo khung-trung không bắt được trường hợp này vì chỉ so khung **liền trước** |
| B6 | `hu-trung` (hiệu ứng trúng đòn thường) | khung 0 = khung 1 | băm trùng | **chưa xử lý**: `fx_anh.js` không đọc `khung` (§4.3). Khung đầu đứng yên 2/5 × 0,2 s = 0,08 s |
| B7 | 12 tệp `-don`, 7 `nl-*`, 6 `-p2/-p3` | ảnh 8 cột, chỉ khai báo 6 | 2 cột thừa, 0 điểm ảnh | tốn chỗ: 25 % bề ngang ảnh trong suốt (PNG nén tốt nên byte tăng ít, nhưng giải mã vẫn tốn RAM, xem §6) |
| B8 | 35 quái + `mocTinh`, `nguTinh` | không có `net` → 1×. Dáng pha `-p2`/`-p3` của chúng có `net: 2` | mocTinh idle ~11 800 px (1×), p2 ~42 500 px (2×) | đổi pha thì trùm chuyển từ ảnh 1× sang ảnh 2× (độ chi tiết khác hẳn). Cỡ hình trong game vẫn khớp vì `khung_rong` tính theo điểm ảnh game |
| B9 | `hoTinh` (custom) và `du-tru/ho-lua-tu-hoTinh-cu` | cùng mã `hoTinh` | — | §1.1 |
| B10 | hu-* dạng nổ/mờ (34 tệp) | khung cuối gần rỗng (min < 20 % max) | ví dụ hu-chem-luot-fire min 86 / max 1 741 | tự nhiên: hiệu ứng tan dần. Không phải lỗi |

Những gì **không** gặp, đã kiểm trên cả 626 tệp: không ảnh nào nhỏ hơn số khung khai báo; không khung nào nằm ngoài ảnh; không khung nào rỗng hẳn (0 điểm ảnh); không hàng ảnh nào có hình mà thiếu khai báo trong `dong_tac`; không hai động tác nào dùng chung một hàng; không ảnh `anh` nào lệch `rong×net`/`cao×net`.

### 1.5 Hiệu ứng `hu-*` (101 tệp, `game/js/fx_anh.js`)

Mỗi tệp là một dải ngang `so` khung, `cot = floor(img.width / (fw*net))` (`fx_anh.js:34`). Mọi dải đều đúng bằng `so×fw×2` × `fh×2`. Tóm tắt theo loại (đủ 101 dòng có trong `scratchpad/pl7`):

| Loại | Ví dụ | Khung | so | giay | lap | xoay | tron |
|---|---|---|---|---|---|---|---|
| Vệt vũ khí | hu-chem-kiem 56×48, hu-chem-bua 56×56, hu-dam-giao 56×20, hu-quet-giao 104×36, hu-chem-luot 64×28 | | 5–8 | 0.18–0.3 | không | không | thuong |
| Trúng đòn | hu-trung 32×32, hu-trung-nang 40×40, hu-chi-mang 56×56, hu-pha-giap 48×48 | | 5–6 | 0.2–0.4 | không | không | cong/thuong |
| Đạn (lặp, xoay theo hướng bay) | hu-dan-ten 24×8 (bản theo hệ 28×12), hu-dan-lua, hu-chuong-* | | 4 | 0.3–0.4 | có | có | |
| Nổ, vùng | hu-no-* 96×80, hu-trum-no 192×160, hu-vung-* | | 6–8 | 0.5–0.9 | vùng: có | không | |
| Làng | hu-lang-khung-cui 28×22, hu-lang-lua-lo 12×15 | | 3 | 1.364 / 0.429 | có | (không ghi) | (không ghi) |

Ghi chú: hai tệp `hu-lang-*` không có `xoay`/`co`/`tron`. Game hiểu là `false`/1/`thuong` (`fx_anh.js:28-29`).

---

## 2. Schema JSON hiện tại

### 2.1 Khoá cấp trên: số tệp có khoá, chỗ đọc, ý nghĩa

| Khoá | Số tệp | Đọc ở (tệp:dòng) | Ý nghĩa / ràng buộc |
|---|---:|---|---|
| `loai` | 628 | `build.py:392` | luôn `"linh-khi-sprite"`, thiếu thì build dừng. Game không đọc |
| `phien_ban` | 550 | (không nơi nào đọc) | luôn 1. Thiếu ở 77 tệp (36 quái, 28 em-be, 7 nl, 6 trùm), vì `tepEmBe` của `tools/tach-anh-hung/index.html:1262` không ghi khoá này |
| `ma` | 628 | `sprite_custom.js:101`, `fx_anh.js:20`, `build.py:392` | `^[A-Za-z0-9_-]{1,40}$`. Tiền tố quyết định loại (§2.3) |
| `ten` | 628 | `sprite_custom.js:118` | tên hiển thị |
| `doi_tuong` | 628 | `sprite_custom.js:99-105`, `118` | `quai` · `em-be` · `nguoi-lang` · `hieu-ung` · `ghep` · `giao-dien` · `vu-khi` · `trang-phuc` · `vat-pham` |
| `tam` | 179 | `sprite_custom.js:106,144`; `themDon` `:523,539`; `fx_anh.js:22,34,37` | sprite sheet PNG (data URL, hoặc `anh/<mã>.<băm>.png` ở bản ảnh rời, `SC.laAnh` `:72`) |
| `khung_rong`, `khung_cao` | 179 | `:107-108` (1..1024); `fx_anh.js:23-24` (1..512) | cỡ MỘT khung, theo **điểm ảnh game** (chưa nhân net) |
| `goc` | 179 | `:107,118` → `sp.ax, sp.ay`; `fx_anh.js:25` | điểm neo chân trong khung (em bé, quái) hoặc tâm (hiệu ứng) |
| `net` | 581 | `docNet` `:93`; `fx_anh.js:30` | ảnh thật gấp `net` lần (1..4), mặc định 1 |
| `dong_tac` | 78 | `:110-115`; `themDon` `:527-530` | `{tên: {hang, so, giay, lap, mo, khung, cham}}`, xem 2.2 |
| `rong`, `cao` | 523 | `:120` (`sp.rong`, `sp.cao`), bóng `:120`, danh sách quái `:445`; đồ `:1392` tính lại từ ảnh | cỡ hình gốc theo điểm ảnh game |
| `vung` | 43 | `:120`; `build.py:167,331` | `rung` · `bien` · `laudai`, dùng để xếp ưu tiên tải |
| `neo` | 16 | `docNeo` `:484-491`, `SC.neoCua` `:494` | `{dau, than, tay: [dx,dy]}` dời chỗ khoác đồ trên thân em bé (±30). Có thể ghi riêng theo động tác (chỉ ANIMS), hiện **không tệp nào** dùng bản riêng |
| `nhun_buoc` | 4 | `:133` | `false`: game không nhún thêm khi chạy (thân gốc đã vẽ nhún) |
| `cu` | 3 | `:138`, `SC.thanBo` `:508-512` | `true`: thân bộ cũ bị tắt (3 thân bộ healer) |
| `so`, `giay`, `lap`, `xoay`, `co`, `tron` | 101/101/101/99/99/99 | `fx_anh.js:28-29` | chỉ ở hiệu ứng: số khung, tổng thời lượng, lặp, xoay theo góc, tỉ lệ, `cong` = hoà sáng `lighter` |
| `anh` | 445 | `themDo` `:1406`; `themGd` `:2198` | ảnh tĩnh của đồ / giao diện |
| `vu_khi` | 160 | `:1376-1378` | `{loai, dong, he, gd, cam, mui, day}`: điểm cầm, mũi, dây cung (điểm ảnh game) |
| `trang_phuc` | 53 | `:1381-1385` | `{o, look, lech, lop, kieu, tay_ao, diem, co_chuan}` (53 = 52 tp + 1 du-tru) |
| `vat_pham` | 14 | `:1387` | loại vật phẩm |
| `vien` | 16 | `themGd` `:2186` | 4 số cắt 9 mảnh (chỉ ở `gd-*`) |
| `nhan_vat`, `diem`, `diem_theo`, `diem_theo_than`, `cap` | 4 | `themGhep` `:1850-1861` | điểm khớp trang bị theo động tác:khung, ví dụ `run:0..7`. Đây là **dữ liệu animation** nằm ngoài sprite sheet (§5) |
| (đọc nhưng chưa tệp nào có) `huong`/`quay`, `bong`, `dung_yen`, `nhun`, `khoac_do` | 0 | `:119`, `:120`, `:125`, `:126`, `:131` | `huong:"trai"`: ảnh vẽ quay trái. **Lưu ý:** `huong`/`quay` không có trong `RUNTIME_KEYS` (`build.py:361-363`), nên build sẽ **lọc mất** (§6, L5) |
| (build thêm) `webp`, `_u` | — | `sprite_custom.js:2463`, `:2438,2462` | chỉ ở bản ảnh rời (§3.3) |

### 2.2 Khoá trong `dong_tac.<tên>`

| Khoá | Số hàng có | Đọc ở | Ý nghĩa | Thực sự được dùng khi phát? |
|---|---:|---|---|---|
| `hang` | 432 | `:113` | chỉ số hàng trong tấm | có: `sy = a.hang * fh * net` (`SC.veKhung` `:311`) |
| `so` | 432 | `:113` (tối thiểu 1, **không trần**), `themDon :529` (1..16) | số khung | có |
| `giay` | 432 | `:113` (mặc định 0.6), `themDon :529` (0.4) | thời lượng cả hàng | **chỉ** với hàng lặp (`khungLap` `:167-170`) và hàng chết của em bé (`:603`). Hàng một lần (tele, atk, hit, ne, `atk_*`, cast) phát theo tiến độ `u` do gameplay đưa vào (`khungMot` `:171-174`, `khungDon` `:586-591`). Quái có định nghĩa code thì thời lượng lấy `MA.dur` (`monster_art.js:1455`), không lấy `giay` (§4.2) |
| `lap` | 126 | `:113` | lặp hay không; thực tế game chọn lặp theo **tên** (`lap('idle')`, `lap('move')`, `:330-334`, `:599`) chứ không theo khoá này. `lap` chỉ chép vào danh sách quái `:446` |
| `mo` | 37 | `:113`, `:339` | mốc bắt đầu mờ (0..1) của hàng die (quái) |
| `khung` | 4 | `docBang` `:177-189` | danh sách cột phát (bỏ khung trùng), cờ `G.KHUNG_TRUNG` `:62-66` |
| `cham` | 3 | `docBang` `:182-186` | cột giữ đúng mốc cũ (khung chạm) |

Tên động tác game nhận: `ANIMS = ['idle','move','tele','atk','hit','die','ne','noi']` (`:13`), em bé thêm `HANG_DON = ['atk_sword','atk_bow','atk_spear','atk_hammer','cast']` (`:23`). Tên khác bị bỏ qua, không báo lỗi. Thiếu `idle` thì tệp bị loại (`:116`).

```js
// game/js/sprite_custom.js:113-114
dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: a.mo != null ? +a.mo : null };
const bg = docBang(a, dt[k].so); if (bg) dt[k].bang = bg; // "khung" / "cham" (bỏ khung trùng); không có thì không thêm gì
```

Tài liệu cũ `docs/xuong-sprite/DUA-VAO-GAME.md` còn nhắc `bien`, `toc` (do `tools/xuong-sprite/nguon/khung.js:634` xuất) và `cong_cu`. Hiện **không tệp nào** trong `custom/` có các khoá này. Build bỏ `cong_cu` (không có trong `RUNTIME_KEYS`) nhưng giữ nguyên `dong_tac`, nên `bien`/`toc` nếu có sẽ lọt qua mà không ai đọc.

### 2.3 Quy tắc mã → đường nạp

| Mã | Hàm nạp | Ràng buộc (build) |
|---|---|---|
| `hu-*` | `G.fxAnh.add` (`sprite_custom.js:99` → `fx_anh.js:18`) | `build.py:394-398`, giữ `HU_KEYS` (`:364`) |
| `ghep-(smith\|hunter\|healer\|wrestler)` | `themGhep` | `build.py:399-404`, `GHEP_KEYS` `:365` |
| `gd-*` | `themGd` `:2183` | `build.py:405-413`, `GD_KEYS` `:366` |
| `vk-*`, `tp-*`, `vp-*` (`DO_LOAI`) | `themDo` `:1372` | `build.py:414-420`, bỏ `tam`, `dong_tac` |
| `em-be(-key(-bo)?)?-don` | `themDon` `:520` → `ghepDon` `:544` dán xuống dưới tấm thân | `build.py:425-431` |
| `em-be`, `em-be-<key>`, `em-be-<key>-<bộ>` | `SC.add` → `noiEmBe` `:1208` | `build.py:435-436` |
| `<trùm>-p2`/`-p3` | `SC.add`, `PHA_MA` `:18`, không thêm vào danh sách quái (`:149-150`) | |
| `nl-*` (`nguoi-lang`) | `SC.add` → `noiNguoiLang` `:1312` | |
| còn lại (`quai`) | `SC.add` → `noiQuai` `:448` (thay `MA.draw`, `MA.dur`) | |

---

## 3. Công cụ tạo ảnh và đường vào game

### 3.1 Công cụ

| Công cụ | Tạo ra | Ghi chú |
|---|---|---|
| `tools/xuong-sprite/index.html` (1,78 MB, gói sẵn), nguồn `tools/xuong-sprite/nguon/*.js`, bản đăng `game/dist/xuong-sprite.html` | `*.sprite.json` (quái, em bé, đồ) | công cụ gốc. Xuất `dong_tac` có thêm `bien`, `toc` (`nguon/khung.js:634`) và `cong_cu` (`nguon/giao-dien.js:808,820`). Do `build.py` tự dựng (`build_tool`, `build.py:452`) |
| `tools/tach-anh-hung/index.html` | `em-be-*` (thân gốc, thân bộ, `-don`), `nl-*` | lưới 8 cột (`:1032`), `tepEmBe` `:1257-1262` (không ghi `phien_ban`) |
| `tools/tach-quai/index.html` | quái, trùm, `-p2`/`-p3` | lưới 8 cột × SH hàng (`:971`); dáng pha "8 cột × 4 hàng" (`:395`); mặc định số khung, giay ở `:237` |
| `tools/tach-hieu-ung/index.html` | `hu-*` | bảng mặc định (`:211-231`, ví dụ `hu-trung` 32×32, so 5, giay 0.2) |
| `tools/tach-lang`, `tach-phong`, `tach-giao-dien` | `gd-*`, `hu-lang-*` | |
| `tools/tach-do`, `tools/vk-cap-he` | `vk-*`, `tp-*`, `vp-*` | |
| `tools/tach-ghep` | `ghep-*` | |
| Script nhập ở `docs/review/…` (ví dụ `than-bo-don/nhap.py`, `nhap-anh-12-10/ngu-tinh/cong-cu/nhap.py`) | ghi thẳng vào `game/art/custom` | sửa `khung`, `nhun_buoc`, `diem_theo_than`… bằng tay hoặc bằng script |

### 3.2 Đường vào game

```
công cụ → game/art/custom/<mã>.sprite.json
  → build.py custom_sprites() (:378) lọc khoá theo loại
  → gom() (:84-99) chèn "(window.G = window.G || {}).customSpriteData = [...]" NGAY TRƯỚC js/sprite_custom.js
  → sprite_custom.js:2592  for (const t of G.customSpriteData) SC.add(t); delete G.customSpriteData;
  → SC.add → SC.napAnh(img, tep.tam) → img.onload: sp.ready = true
```

Thứ tự nạp trong `game/index.html`: `fx_anh.js` (dòng 87) và `monster_art.js` (88) đứng trước `sprite_custom.js` (89), nên lúc `SC.add` chạy, `G.fxAnh` và `G.monsterArt` đã có sẵn.

---

## 4. Đóng gói và tải (`game/build.py`, `sprite_custom.js`)

### 4.1 Ba chế độ

| Chế độ | Cờ | Đầu ra | Ảnh ở đâu |
|---|---|---|---|
| Một tệp (mặc định) | không cờ / `--mot-tep` | `dist/linh-khi.html`, `artifact.html` (`build.py:105-115`) | toàn bộ 626 tệp nhúng base64 trong JS (khoảng 22 MB JSON). Trần cảnh báo 30 MB (`:128`) |
| Hai tệp, Đợt 10 | `--hai-tep` + `LK_ANH_ROI=0`/`--anh-json` | `linh-khi-nhe.html` (chỉ ảnh `bat_buoc`) + `linh-khi-anh.<băm>.json` (mỗi hình một dòng, xếp theo `thu_tu_sau` `:159-176`) | `G.ANH_SAU = {tep, so, byte, trum}` (`:209-210`); game đọc từng dòng (`taiMotLuot` `:2280`), trùm tải riêng bằng Range (`SC.uuTienTrum` `:2373-2410`) |
| Hai tệp, ảnh rời (mặc định khi `--hai-tep`) | `anh_roi_bat()` `:248-249` | `linh-khi-nhe.html` (**không còn byte ảnh**, `:337-338` kiểm) + `dist/anh/<mã>.<băm10>.png` và `.webp` (WebP lossless khi nhỏ hơn, `ma_webp` `:252-261`, so lại điểm ảnh) | `G.ANH_ROI = {so, webp}` (`:332-333`); mỗi mục mang `_u = [bậc, byte, vùng, trùm]` (`:331`) và `webp` (`:321`) |

```python
# game/build.py:326-331
# _u: [bậc ưu tiên tĩnh, số byte tải, vùng (0 rừng, 1 biển, 2 lâu đài, -1 không theo vùng), trùm/dáng pha]
# bậc 0: cần cho màn chào / làng (luật bat_buoc ở trên) · 1: hiệu ứng, vũ khí, thân em bé theo bộ… · 2: quái thường · 3: trùm và dáng pha
bac = 0 if bat_buoc(custom[i]) else 3 if trum else 2 if quai else 1
t['_u'] = [bac, tot, VUNG_SO.get(t.get('vung'), -1) if quai else -1, 1 if trum else 0]
```

### 4.2 `bat_buoc` (`build.py:137-156`): hình cần ngay ở màn đầu

Theo luật trong code, tính trên 626 tệp hiện có: **320 tệp bắt buộc (2,61 MB JSON)** và **306 tệp tải sau (19,39 MB)**.

| Bắt buộc (bậc 0) | Số tệp |
|---|---:|
| `ghep-*` | 4 |
| thân gốc `em-be-<key>` (không `-rung/-bien/-lau/-don`) | 4 |
| `nl-*` | 7 |
| `gd-*`, trừ `HINH_LON_SAU = {gd-lang-nen, gd-ban-do-vung, gd-khung-ban-do}` (`:134`) | 215 |
| `vp-*`, `tp-*` | 14 + 52 |
| `vk-sword-0*`, `vk-bow-3*` | 8 |
| `HU_CO_BAN` (`:131`): hu-chem-kiem, chem-bua, chem-luot(+3 hệ), dam-giao, trung, trung-nang, chi-mang, pha-giap, quai-chet, dan-ten(+3 hệ) | 16 |

Tải sau: 12 thân bộ, 12 `-don`, 42 quái và trùm, 152 vũ khí, 85 hiệu ứng (trong đó có `hu-quet-giao*`, là vệt nhát cuối của giáo, và `hu-tram-nguyet*`), 3 `gd` lớn.

### 4.3 Thứ tự ưu tiên khi tải ảnh rời (`sprite_custom.js:2417-2589`)

```js
// game/js/sprite_custom.js:2488
const v = vungNay(), uu = (it) => (it.can ? 0 : it.bac === 0 ? 1 : it.bac === 2 ? (it.vung === v ? 2 : 4) : it.bac === 3 ? (trumMo && it.vung === v ? 2 : 5) : 3);
```

| u | Nhóm | Khi nào được tải |
|---|---|---|
| 0 | hình game đang cần mà chưa có (`roiCan`, gọi từ `SC.get` `:161`, `MA.draw` `:456`, `SC.phaTrum` `:348`, `FA.get/co` `fx_anh.js:50-53`). Thân em bé kéo theo `<mã>-don` (`:2475`) | ngay, tối đa 24 tệp cùng lúc (`MAX_GAP`) |
| 1 | bậc 0 (màn chào, làng) | ngay khi trang chạy, **trước** `roiMo` |
| 2 | quái vùng đang chơi; trùm + dáng pha khi vào ải 4–5 (`trumMo`, `:2581`) | sau `SC.napSau` (do `engine.js:637` gọi khi màn chào đã vẽ) |
| 3 | bậc 1 (hiệu ứng, vũ khí, thân bộ, `-don`) | như trên, tối đa 16 |
| 4 / 5 | quái vùng khác / trùm vùng khác | tối đa 3 cùng lúc (`MAX_THAP`) |

Cùng mức u thì tệp nhỏ tải trước (`:2490`). Kiểm WebP bằng một ảnh 1×1 (`:2443-2451`). WebP hỏng 3 lần thì chuyển sang PNG cho mọi ảnh còn lại (`:2512-2515`). Ảnh PNG hỏng thì thử lại sau 3 s rồi 10 s (`CHO_THU` `:2248`), sau đó bỏ (`:2516-2517`). Có mạng lại (`online`) hoặc quay lại tab (`visibilitychange`) thì thử lại (`:2584-2586`). Ảnh giải mã xong được báo cho game theo từng đợt ≤ 6 ms (`keo` `:2527-2545`).

### 4.4 Rơi về canvas khi thiếu ảnh

| Nơi | Đoạn code | Hành vi |
|---|---|---|
| Quái | `MA.draw` `:456`: `if (!sp \|\| !sp.ready) { … return draw0.call(MA, c, id, x, y, o); }` | vẽ quái bằng code (`monster_art.js`) |
| Em bé | `A.hero` `:1213-1218`: `SC.cuaEmBe` trả null (chưa `ready`) → `hero0` | vẽ em bé bằng code (`hero_tinhlinh.js`) |
| Thân bộ | `SC.cuaEmBe` `:513`: thân bộ chưa có thì về thân gốc, rồi `em-be` | |
| Đòn theo vũ khí | `-don` chưa về: `dt.atk_*` chưa có → `don()` trả null (`:601`) → hàng `atk` chung | đổi tấm (`ghepDon`) ngay giữa lúc chơi khi ảnh về |
| Dáng pha trùm | `SC.phaTrum` `:345-350` → null → vẽ pha 1 | |
| Hiệu ứng | `FA.ve` `fx_anh.js:68`: chưa `ready` → `false`, nơi gọi tự vẽ bằng code | |
| Đồ, giao diện | `themDo`/`themGd`: chưa `ready` thì nơi gọi vẽ code | |
| Ảnh hỏng | `img.onerror` → `SC.loi.push(... 'ảnh hỏng')` (`:143`) | sprite giữ `ready=false` mãi, nên **vẽ code mãi** |

---

## 5. Kiểm tra nhất quán `khung`, `lap`, `mo`, `giay` giữa các tệp cùng loại

### 5.1 Em bé: thân gốc và thân bộ (đã đo)

| Hàng | Thân gốc smith | hunter | healer | wrestler | 12 thân bộ | Chênh lệch |
|---|---|---|---|---|---|---|
| idle | 6 / 1.0 L | 6 / 1.0 L | 6 / 1.0 L | 6 / 1.0 L | 6 / 1.0 L | — |
| move | **8 / 0.65** L | **8 / 0.6** L | **8 / 0.65** L | **8 / 0.6** L | **6 / 0.6** L | số khung 8 và 6; giay 0.65 và 0.6. Thân gốc `nhun_buoc:false`, thân bộ không ghi → game nhún thêm ở khung `i%3===1` (`SC.nhunBuoc` `:620-628`) |
| tele | 4 / 0.4 | 4 | 4 | 4 | 4 | — |
| atk | 6 / 0.4 | 6 | 6 | 6 | 6; chỉ `wrestler-bien` có `khung [0,2,3,4,5] cham 4` | |
| hit | 4 / 0.2 | 4 | **3** / 0.2 | 4 | 4 | healer gốc 3 khung (B1) |
| die | 8 / 0.6 | 8 | 8 | 8 | 8 | không có `mo` (em bé không mờ khi chết) |
| ne | 6 / 0.4 | 6 | 6 | 6 | 6 | |
| `neo` | có | có | có | có | có (12) | giá trị riêng mỗi tệp, ví dụ `dau` [−1..3, −4..−2] |
| `cu` | — | — | — | — | `true` ở healer-rung/bien/lau | 3 thân bộ healer bị tắt |

`-don` (12 tệp): mọi hàng đều 6 khung; giay 0.45 (sword/bow/spear), **0.55** (hammer), 0.4 (cast). Nhưng `giay` của `-don` **không được dùng**: `khungDon` (`:586-591`) chọn khung theo `u` và bảng `MOC_DON` (`:585`).

**Thiếu tệp `-don`.** Theo tên tệp có trong thư mục: smith 4 tệp (gốc, rung, bien, lau); hunter 3 (gốc, bien, lau; **không có `em-be-hunter-rung-don`**); healer 1 (gốc); wrestler 4. Theo `:519`, thân bộ không mượn đòn của thân gốc. Vì vậy Cu Tí mặc bộ Rừng đánh bằng hàng `atk` chung (suy luận từ code; số đo hình ảnh xem phụ lục đòn đánh).

### 5.2 Quái: `giay` của hàng một lần không có tác dụng

Cả 36 mã quái có tệp custom (trừ `-p2/-p3`) đều có `def('<mã>'…)` trong `monster_art.js`. Lệnh grep cho từng mã đều ra ≥ 1 kết quả. Khi đó `MA.draw` gọi `SC.veQuai(..., D)` với `D = dur0.call(MA, id, o.anim)` (`:461`), tức thời lượng code (`DEFS[id].anims[anim].d`, mặc định `DMAC` ở `monster_art.js:1406`). Thời lượng code này thắng `giay` của JSON ở `chonQuai` (`:331`). Vì vậy `tele 0.5/0.7`, `atk 0.5/0.6`, `hit 0.3`, `die 1.2` trong 42 tệp quái **chỉ là thông tin cho công cụ**. Chỉ `idle.giay`, `move.giay` (hàng lặp) và `die.mo` là có tác dụng.

### 5.3 `khung` và `cham`

| Tệp | Hàng | khung | cham | Có tác dụng? |
|---|---|---|---|---|
| em-be-wrestler-bien | atk | [0,2,3,4,5] | 4 | có: `khungMot` dùng `bang` khi `G.KHUNG_TRUNG` (`:172`) |
| hoTinh-p2 | atk | [0,1,2,3,4] | 4 | có (`veQuai` → `chonQuai` của tệp pha) |
| socNo | atk | [0,2,3,4,5] | 4 | có |
| socNo | die | [0,2,3,4,6,7] | — | có |

Có hai đường **bỏ qua** `khung`:

1. `themDon` (`:529`) không gọi `docBang`, và `khungDon` dùng `doi6`. Nếu một tệp `-don` ghi `khung`, giá trị đó sẽ bị lờ đi mà không báo lỗi.
2. `fx_anh.js` không đọc `khung` (`FA.khung` `fx_anh.js:57-63` chia đều `so`), nên khung trùng của `hu-trung` (B6) không sửa được bằng dữ liệu.

Các đường còn lại của quái đều đi qua `khungMot`/`khungLap` nên có dùng `bang`: `stun` (`:338`), gục ở pha 2/3 (`:371`).

### 5.4 `lap`

Mọi `idle`/`move`/`noi` có `lap: true`; không hàng một lần nào có `lap: true`. Dữ liệu nhất quán, nhưng game không đọc `lap` để quyết định có lặp hay không (§2.2).

### 5.5 `mo`

37 hàng có `mo: 0.6`, đều là hàng `die` của quái (6 hàng thiếu do 6 tệp `-p2/-p3` không có hàng die). Em bé không có `mo`.

---

## 6. Dữ liệu animation nằm ngoài JSON (rải rác trong JS)

| Dữ liệu | Tệp:dòng | Nội dung |
|---|---|---|
| Tên động tác, động tác lặp | `sprite_custom.js:13-14` | `ANIMS`, `LOOP` |
| Tên hàng đòn | `sprite_custom.js:23` | `HANG_DON` |
| Mốc khung đòn theo vũ khí | `sprite_custom.js:585` | `MOC_DON` (bow, spear, hammer, cast: 6 mốc u) |
| Kiếm: khung theo combo | `sprite_custom.js:588` | `i6 = 2*(combo%3) + (u >= 0.4 ? 1 : 0)` |
| Đổi 6 khung sang N khung | `sprite_custom.js:592` | `doi6` |
| Khung giữ nút | `sprite_custom.js:594` | `giuDon` (bow theo độ căng, sword 4, còn lại 0/1) |
| Máy trạng thái chọn hàng em bé | `sprite_custom.js:595-617` | `SC.chonEmBe`: thứ tự ưu tiên dead > dodge > dash > spec (0.35 s) > cast (0.4 s) > hold > atk > hurt (0.2 s) > move > idle |
| Chọn hàng quái | `sprite_custom.js:328-343` | `SC.chonQuai` (stun dao động sin, chiêu = 40 % tele + 60 % atk, spawn mờ dần) |
| Nhún khi chạy | `sprite_custom.js:620-628` | `i % 3 === 1 ? -1 : 0` (viết cho vòng 6 khung) |
| Lộn (ne) quay 360° khi đo mặt | `sprite_custom.js:700` | `goi = 360*i/n` |
| Chạy mà đánh | `sprite_custom.js:30-40`, `:610-611` | `G.CHAY_DANH` ('than' / 'lai' u 0.2–0.65 / 'nhun') |
| Đổi tên động tác code ↔ AI | `sprite_custom.js:1872-1873` | `CHUAN`, `DOI_CODE` (run↔move, dodge↔ne, hurt↔hit, hold↔tele) |
| Chớp trắng trúng đòn | `sprite_custom.js:376`, `emBeTint :629-635` | flash 0.75 khi u<0.3; tint trắng 0.6 |
| Người làng không động | `sprite_custom.js:1288-1289` | `G.NL_DONG` mặc định tắt → luôn `idle` khung 0. Hàng `noi` và idle 1..5 của 7 tệp `nl-*` **không bao giờ hiện** |
| Thời lượng đòn em bé | `combat.js:533` (`atkDur = T.cd`), `:564` (`specT = 0.35`), `:632` (`hurtT = 0.2`), `:760` (`dodgeT = 0.27`), `:801` (chạm ở `1 - hitAt`, mặc định 0.45), `:1060` (atk, dodge thành u) | |
| Chuỗi đòn và thời lượng từng nhát | `moves.js:16` `G.MOVES`; kiếm `:33-42` (0.3, 0.3, …, 0.46), cung `:44-55`, giáo `:57-67`, búa `:71-82` (`dur 0.8, hitAt 0.35`) | |
| Cooldown vũ khí | `data.js:29-38` `G.WTYPES` (sword 0.36, bow 0.5, spear 0.44, hammer 0.8) | |
| Né | `data.js:300` `G.DODGE` | |
| Khung xương em bé vẽ code (keyframe vũ khí) | `hero_tinhlinh.js:909` `REST`, `:910` `HOLD`, `:911` `KDEF`, `:988-1008` `ATK` (sword 3 combo × 6 keyframe, spear, bow, hammer), `:1009-1016` `SPEC`, `:1017` `ATKN`, `:1477` `NE_MAT_DAY` | |
| Em bé code cũ | `hero_art.js:829` `BASE`, `:841` `EASE`, `:900` `ATKN` | |
| Quái code | `monster_art.js:1107` `MA.fps = 12`, `:1406` `DMAC` (idle 1.2, move 0.6, tele 0.7, atk 0.55, hit 0.35, die 1.1, spawn 1.1), `:1413` `A(d, f, {lap, moc})`, `:1430` chọn khung, `:1455` `MA.dur` | |
| Vũ khí xoay | `weapon_art.js:2288` `REST`, `:1520` `SPW`, `:1880` `HMW` | |
| Hiệu ứng ảnh | `fx_anh.js:57-63` `FA.khung` (lặp hoặc −1 khi hết) | |
| Cường độ VFX | `vfx_cfg.js:5-15` `G.VFX` (rung, khung, hat, vet, nhun, …) | |
| Điểm khớp trang bị theo khung | `art/custom/ghep-*.sprite.json`: `diem_theo` (atk:0-5, hit:0-3, run:0-5, tele:0-3; healer run:0-7, hit:0-2), `diem_theo_than` (run:0-7 cho thân gốc), `cap` | **dữ liệu theo chỉ số khung**: đổi số khung của một hàng thì phải sửa cả tệp ghép. Không có khoá cho `atk_*`/`cast`/`ne`/`die` |
| Mũ lún | `sprite_custom.js:1358` `SC.MU_LUN` (cỡ ảnh mũ cứng trong code) | |
| Cờ tắt / bật | `G.DON_VK :24`, `G.KHUNG_TRUNG :62`, `G.NAP_SAU_MOI :47`, `G.PHA_TRUM_DU :53`, `G.THAN_BO_CU :505`, `G.NHUN_BUOC :39`, `G.UU_TIEN_TRUM :2368`, `G.NL_DONG :1289` | |

---

## 7. Lỗi tiềm ẩn về dữ liệu ảnh

| # | Lỗi | Bằng chứng | Loại |
|---|---|---|---|
| L1 | Vòng chạy không đồng nhất: thân gốc 8 khung (nhún vẽ sẵn, `nhun_buoc:false`), thân bộ 6 khung (game nhún thêm 1 px). Đổi áo bộ ↔ áo rời giữa trận thì nhịp chân và kiểu nhún đổi theo | §5.1; `SC.nhunBuoc :620-628` | đã đo dữ liệu, ảnh hưởng hình là suy luận |
| L2 | `SC.nhunBuoc` dùng `i % 3 === 1` (viết cho 6 khung). Nếu sau này có thân 8 khung mà quên `nhun_buoc:false`, thân sẽ nhún ở khung 1, 4, 7: hai bước không đối xứng | `sprite_custom.js:627` | suy luận |
| L3 | `giay` của hàng một lần không có tác dụng (em bé: atk, hit, ne, tele, `-don`; quái có định nghĩa code: tele, atk, hit, die). Người vẽ chỉnh `giay` trong công cụ sẽ không thấy gì đổi trong game | §2.2, §5.2; `:331`, `:461`, `:603-614` | đã thấy trong code |
| L4 | `so` ở `SC.add` không có trần và không so với bề ngang ảnh (`Math.max(1, a.so \| 0)`, `:113`). Khai báo `so` lớn hơn số cột sẽ vẽ khung trống mà không báo lỗi (hiện chưa xảy ra) | `:113` (so với `themDon :529` có trần 16) | suy luận |
| L5 | Build lọc mất `huong`/`quay` (không có trong `RUNTIME_KEYS`, `build.py:361-363`), trong khi `SC.add` đọc hai khoá này (`:119`). Ảnh vẽ quay trái sẽ đúng trong công cụ nhưng **ngược** trong bản đóng gói (hiện không tệp nào dùng) | `build.py:361`, `sprite_custom.js:119` | đã thấy trong code |
| L6 | `khung` bị bỏ qua ở `-don` và `hu-*` (§5.3), nên `hu-trung` vẫn còn khung trùng 0=1 | `:529`, `fx_anh.js:28`, B6 | đã đo |
| L7 | `-don` tải sau (bậc 1, u=3). Lúc mới vào game, nhát đánh dùng hàng `atk` chung, rồi `ghepDon` đổi tấm ngay giữa lúc chơi (thay `sp.img`, xoá bộ nhớ đo `xoaDoDem`) | `build.py:150-151`, `sprite_custom.js:142`, `:544-569` | suy luận (code) |
| L8 | 3 thân bộ healer có `cu:true` không bao giờ được vẽ, nhưng vẫn được nhúng (bản một tệp) và vẫn được tải nền (bản ảnh rời: `SC.add` luôn gọi `SC.napAnh`, `:144`, bậc 1). Tốn khoảng 610 KB JSON / 456 KB PNG | `:138`, `:508-512`, `:2458-2469` | đã thấy trong code + đã đo byte |
| L9 | Hàng `noi` và idle 1..5 của `nl-*` không bao giờ hiện (`G.NL_DONG` tắt) nhưng vẫn nằm trong ảnh bắt buộc ở màn đầu | `:1289`, `bat_buoc` | đã thấy trong code |
| L10 | Thiếu `em-be-hunter-rung-don` và `em-be-healer-*-don`, nên một số tổ hợp nhân vật × bộ chỉ có hàng `atk` chung | danh sách tệp, `:519` | đã đo (danh sách tệp) |
| L11 | Trùm `mocTinh`/`nguTinh`: pha 1 ở 1×, pha 2/3 ở 2×. Chất lượng hình đổi khi chuyển pha; quái thường đều 1× trong khi em bé 2× | B8 | đã đo |
| L12 | Lưới 8 cột cứng ở công cụ: 25 tệp có 2 cột trong suốt. Bộ nhớ giải mã tăng: ví dụ `hoTinh-p2` 3328×1024×4 B ≈ 13,6 MB RAM khi giải mã, trong đó khoảng 3,4 MB là phần thừa | B7, `tach-anh-hung:1032`, `tach-quai:971` | đã đo kích thước; RAM là phép tính |
| L13 | Dữ liệu theo **chỉ số khung** nằm ở nhiều nơi: `diem_theo`/`diem_theo_than` (ghép), `cap.*.theo` (`tele:0`…`hit:3`), `MOC_DON`, `giuDon`, `i%3`. Đổi số khung một hàng (ví dụ healer hit 3→4, thân bộ move 6→8) thì phải sửa đồng bộ tất cả, không có kiểm tra tự động | §6 | đã thấy trong code |
| L14 | Trùng mã giữa `du-tru` và `custom` (`hoTinh`, `tp-hats-non_la`): chép nhầm thì một tệp đè tệp kia, không báo lỗi | §1.1, `:146` | suy luận |
| L15 | Ảnh hỏng (`onerror`) ở đường `SC.add` thường (không qua ảnh rời) không có lượt thử lại: sprite giữ `ready=false`, vẽ code mãi | `:143` | đã thấy trong code |

---

## 8. Cần giữ lại khi thiết kế lại

- Ý nghĩa `net` (mọi số trong tệp tính theo điểm ảnh game, ảnh gấp `net` lần) và `goc` = điểm chân. `SC.veKhung` (`:309-324`) vẽ đúng cỡ game bất kể `net`.
- Đường rơi về canvas (§4.4): mọi hình thiếu hoặc hỏng đều vẽ bằng code, game không bao giờ trắng hình.
- `build.py`: kiểm tra mã và loại, lọc khoá, ba chế độ đóng gói, `bat_buoc`/`_u`. Thứ tự ưu tiên tải nằm trong `sprite_custom.js:2488`.
- Cơ chế `khung`/`cham` giữ đúng mốc chạm đòn khi bỏ khung trùng (`docBang`).
- Tách bạch "thời lượng do gameplay" (`atkDur`, `hurtT`, `dodgeT`, `MA.dur`) và "ảnh chỉ chọn khung theo u". Nếu muốn animation mới đổi thời lượng, phải đổi phía gameplay chứ không phải `giay`.

## 9. Gợi ý cấu trúc dữ liệu (cho mục G)

- Một schema duy nhất cho mọi sheet: `{hang, so, khung?, cham?, mo?, moc?: [u…], giu?: cột, nhun?: [dy…]}`. Đưa `MOC_DON`, `giuDon`, `i%3` vào dữ liệu thay vì hằng số trong JS. `khung` cần áp dụng cho cả `-don` và `hu-*`.
- Ghi rõ trong schema rằng `giay` chỉ dùng cho hàng lặp. Hoặc bỏ `giay` ở hàng một lần, để công cụ không gây hiểu lầm.
- Thêm kiểm tra vào `custom_sprites()`: `so×khung_rong×net ≤ rộng ảnh`, `(max hang+1)×khung_cao×net ≤ cao ảnh`, không băm trùng liền kề khi không có `khung`, và số khung `diem_theo` phải khớp `so`.
- Cho phép lưới theo số khung thật (không cố định 8 cột), hoặc ghi `cot` vào tệp.
- Thống nhất `net` (2× cho mọi nhân vật, quái, trùm) và số khung giữa thân gốc và thân bộ.

## 10. Điều chưa chắc

- Chưa đo trong trình duyệt xem `-don` về muộn hay thân bộ 6 và 8 khung trông khác nhau thế nào trong trận. L1 và L7 chỉ là suy luận từ code.
- Chưa kiểm mọi trường hợp của `ghep-*` (`cap.*.theo`) với số khung thật. Phần này thuộc phụ lục ghép trang bị.
- Bảng đủ 101 hiệu ứng và số điểm ảnh từng khung của mọi tệp nằm ở `scratchpad/pl7/kq.json` (dữ liệu thô của script đo).
