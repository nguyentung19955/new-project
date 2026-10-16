# Báo cáo: xoá Cu Tí cũ và công cụ cũ (16/10)

Chủ game quyết (16/10 07:24): "Xoá đi [ảnh Cu Tí cũ], công cụ nào cũ cũng xoá đi, chỉ dùng các công cụ hiện tại."

## Kết quả: CHƯA xoá được. Đã lập danh sách để phiên điều phối xoá

- Lệnh `git rm` bị bộ phân loại an toàn của phiên chặn (lý do: "Irreversible Local Destruction").
- Theo yêu cầu mục 4, tôi **dừng xoá** và không tìm cách lách. Phiên này không xoá tệp nào, và không sửa code game.
- Danh sách xoá đầy đủ, mỗi dòng một tệp, đã kiểm tra là không còn ai đọc:
  **`docs/review/ke-hoach-cai-thien/don-tep/xoa-cu-ti-cu.txt`**. Gồm **410 tệp, khoảng 149 MB** (149 324 767 byte).
- Danh sách **chờ**, chưa nên xoá ngay (lý do ở mục "Chờ" bên dưới): `don-tep/xoa-cu-ti-cu-cho.txt`. Gồm 47 tệp, khoảng 5,5 MB.

Phiên điều phối xoá bằng lệnh (chạy từ thư mục gốc repo):

```bash
git pull --rebase
tr '\n' '\0' < docs/review/ke-hoach-cai-thien/don-tep/xoa-cu-ti-cu.txt | xargs -0 git rm -q --ignore-unmatch
python3 game/build.py && python3 game/build.py --hai-tep
```

Lịch sử git vẫn giữ các tệp này, nên khôi phục lại được bất cứ lúc nào.

## Cu Tí HIỆN TẠI: GIỮ

Đã kiểm bằng grep `game/build.py`, `game/js`, `tools/`, `game/tests/` và các script dựng.

| Phần | Vì sao giữ |
|---|---|
| `game/art/custom/zed-moi`, `zed-vk`, `zed-rung`, `zed-bien`, `zed-lau` `.sprite.json`, `gd-the-zed.sprite.json` | Game nạp các tệp này (`build.py` nhúng mọi `*.sprite.json`, `js/zed_moi.js` đọc) |
| `docs/anh-goc/zed/dung-zed-game.py` | Script dựng 5 tệp zed-* ở trên |
| `docs/anh-goc/zed/cat-than.py` | Sinh điểm eo cho `js/zed_moi.js` |
| `docs/anh-goc/zed/cat-diem-anh.py` | `gan-vk/nam_chuoi.py` nạp nó; `soat-muot/cong-cu/thay-hang.py` và `be-sen/cong-cu/dung-be-sen.py` dùng để cắt khung |
| `docs/anh-goc/zed/moi/` (137 MB) | Nguồn thân Cu Tí mới mà `dung-zed-game.py` đọc |
| `docs/anh-goc/zed/gan-vk/` (33 MB) | `neo.json`, `nam_chuoi.py`, `ghep-thu-vk.py` (do `cam-vk.py` và `tim-tay.py` nạp), `cam-vk.py`… đều đang dùng |
| `docs/anh-goc/zed/trang-phuc/bo-2-rung`, `bo-3-bien`, `bo-4-lau` (259 MB) | `dung-zed-game.py` đọc để dựng các bộ Rừng, Biển, Lâu đài |
| `docs/anh-goc/zed/hieu-ung/` (48 MB) | `cat_phi_tieu.py` được `ep-do/cat_ep_do.py`, `buoc-2/cat_buoc_2.py` và `cat_dot_3.py` nạp |
| `docs/anh-goc/zed/prompt-moi/` | Bộ prompt của Cu Tí mới (27 động tác + vũ khí) |
| `docs/anh-goc/zed/sua-tay/` | Là ảnh của Cu Tí **mới** (13/10). Kế hoạch `docs/ke-hoach/khong-pixel/KE-HOACH.md` còn dùng làm ảnh mẫu |
| `game/js/hero_tinhlinh.js` | Code game: vẽ 3 bạn NPC và hình dự phòng của Cu Tí khi ảnh chưa tải. Không sửa |
| `docs/phac-thao/hero-tinh-linh/nguon/to.js` | `docs/phac-thao/quai-hoat-hinh/nguon/xem.py` nạp tệp này. Công cụ quái `monster_art.js` đang dùng |

## Đã đưa vào danh sách xoá

Mỗi mục đều đã grep toàn bộ code (`*.py`, `*.js`, `*.html`, `*.yml`, `*.sh`, `*.gd`, trừ `game/dist`). Không có code nào nằm ngoài danh sách đọc chúng.
Có vài chỗ nhắc tên, nhưng chỉ trong ghi chú hoặc chuỗi chữ. Tôi đã xem từng chỗ.

### 1. Ảnh và công cụ của Cu Tí cũ: 230 tệp, 75,9 MB

Cu Tí cũ gồm bản ninja khăn đỏ và bản v2 tóc trắng có sừng, cùng làm ngày 12/10. Hệ ghép lớp v2 dùng chúng đã bỏ từ khi có Cu Tí mới 13/10.

| Đường dẫn | Số tệp | Dung lượng |
|---|---|---|
| `docs/anh-goc/zed/v2/` (23 tấm gốc v2: thân, đòn, giáp, nón, áo choàng) | 24 | 37,6 MB |
| `docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/anh/` (ảnh kiểm do `ghep-thu.py` ghi) | 26 | 18,5 MB |
| `docs/anh-goc/zed/goc/` (ảnh gốc ninja và v2 bản đầu) | 7 | 14,4 MB |
| `zed-canonical.png`, `zed-tham-chieu.png`, `zed-tham-chieu-v2.png`, `zed-v2-tham-chieu.png`, `zed-v2-tham-chieu-to.png` | 5 | 2,7 MB |
| `docs/anh-goc/zed/kiem/` (kết quả `kiem-sheet.py` trên 2 tấm canonical) | 14 | 1,8 MB |
| `lop-ghep/zed-v2-ao-choang.png`, `lop-ghep/zed-v2-lop.json` | 2 | 0,6 MB |
| `docs/anh-goc/zed/neo/` (`zed-v2.neo*.json`) | 3 | 0,1 MB |
| `prompt-ninja/`, `prompt-v2/`, `prompt-v2-toc-trang/`, `prompt-v3/` (có cả `tao-ban-v2.py`), `prompt-1-…` đến `prompt-13-….txt` | 144 | 0,1 MB |
| Công cụ ghép lớp v2: `ghep-thu.py`, `ghep-thu-cu.py`, `README-ghep-lop.md`, `kiem-sheet.py`, `xem-gif.py` | 5 | 0,1 MB |

- `kiem-sheet.py` và `xem-gif.py` là công cụ kiểm tấm của hệ ghép lớp.
- Nay việc cắt khung và xuất GIF do `cat-diem-anh.py` làm.

### 2. Công cụ và bản thử của các hệ đã bỏ: 180 tệp, 73,4 MB

| Đường dẫn | Số tệp | Dung lượng | Vì sao xoá |
|---|---|---|---|
| `godot/` (bản mẫu Godot 10/10: tự ráp bộ phận, xuất sprite) | 24 | 31,9 MB | Hệ ráp bộ phận / Xưởng Rối đã bỏ. Game, công cụ và workflow đều không dùng |
| `docs/LINH_KHI_AI_ART_HANDOFF/` + `.zip` | 83 | 25,0 MB | Gói bàn giao 10/10, viết lúc "game không dùng file ảnh", chụp 4 hero em bé cũ. `cong_cu/` chỉ phục vụ gói này |
| `docs/phong-cach-moi/` (chibi Gemini, `ghep-thu/rig.py`, `cut.py`, `anim.py`) | 15 | 7,7 MB | Xưởng Rối / chibi rig đã gỡ ngày 10/10 |
| `docs/phac-thao/hero-tinh-linh/` (trừ `nguon/to.js`) | 23 | 6,1 MB | Tờ phác 4 bé hero và công cụ dựng tờ (`dung.py`, `dung_phong.py`, `thu.py`, `thu.html`, `muon-phong/`). `kiem_tra.py` chạy thử thì hỏng (`Cannot read properties of undefined (reading 'helm')`), vì đồ mặc cũ đã bỏ ở đợt 2 |
| `docs/phac-thao/hero/` (4 hướng hero cũ + công cụ `nguon/`, `ban-2/nguon/`) | 35 | 2,3 MB | Hero cũ. Không ai đọc |

## Chờ: chưa đưa vào danh sách xoá (`xoa-cu-ti-cu-cho.txt`)

- **`docs/anh-goc/zed/zed-v2-canonical.png`** và **`lop-ghep/zed-v2-non-sau.png`, `zed-v2-giap.png`, `zed-v2-non-truoc.png`** (3,7 MB):
  - Đây là Cu Tí cũ, nhưng `docs/thu-modular/tao-bo-thu.py` hiện vẫn đọc (dòng 10 và dòng 525–529).
  - Một phiên khác đang làm lại bộ thử modular bằng Cu Tí mới. Xoá bây giờ thì script của phiên đó gãy, và dễ xung đột khi phiên đó rebase.
  - Khi `tao-bo-thu.py` không còn đọc các tệp này nữa thì xoá.
- **Ảnh và JSON trong `docs/thu-modular/`** (`nhan-vat-zed-dung*.png`, `ghep-thu-giap-non-*`, `que-*`, `bo-phan*`, `kiem-tra.html`…; 1,9 MB):
  - Hiện tất cả đều dựng từ Cu Tí cũ (`zed-v2-canonical.png`).
  - Phiên kia sẽ ghi đè chúng khi dựng lại bằng Cu Tí mới. Xoá bây giờ sẽ gây xung đột "sửa/xoá" cho phiên đó.
  - Tôi để nguyên. Danh sách chờ chỉ để đối chiếu: tệp nào sau khi phiên kia xong vẫn còn dùng Cu Tí cũ thì xoá.
- **`docs/review/ke-hoach-cai-thien/zed-asset/tham-khao/`** (7,7 MB): bảng tham chiếu chủ game đưa cho thiết kế modular (lớp áo, mũ, neo vũ khí). Không ai đọc, nhưng có thể phiên modular còn tham khảo. Tôi để lại và không đưa vào danh sách chờ.

## Công cụ đã soát và GIỮ

- **`tools/`**: các trang `tach-*`, `xuong-sprite/`, `anh-truyen/`, `can-bang/`, `ngon-ngu/`, `pixelize.py`, `kiem-alpha.py` đều đang dùng. Các trang `tach-*` là trang tự chứa, không tham chiếu tệp nào trong danh sách xoá.
  Không còn công cụ Xưởng Rối, chibi_rig hay tach-ghep-lop trong `tools/`: các lần dọn trước đã bỏ.
- **`docs/**/cong-cu/`**: mỗi thư mục gắn với một việc của quái, trùm, NPC, vùng 4, soát mượt hay bể sen hiện tại. Không thư mục nào phục vụ Cu Tí cũ. Giữ hết.
- **`game/tests/`**: giữ hết.
  - Kiểm tĩnh: các tên `G.*` mà bài kiểm dùng đều còn trong `game/js`, hoặc do chính thư viện kiểm định nghĩa. Vài tên còn lại là hàm gián điệp tự gắn.
  - Không bài nào trỏ tới tệp `js/*.js` đã mất, hay tới hệ ghép lớp v2, rig hoặc hero cũ.
  - Các bài về cung, em bé NPC và lưu cũ (`outfit`, `helm`) vẫn kiểm code còn trong game.
- **Script dựng sprite quái, trùm, NPC, vùng 4**: không đụng.

## Kiểm sau khi lập danh sách

Phiên này không xoá tệp nào, nên đây là kiểm trên cây hiện tại. Riêng các tệp trong danh sách xoá thì đã kiểm tĩnh là không ai đọc.

- `node --check` cả 65 tệp `game/js/*.js`: đạt.
- `python3 game/build.py`: chạy được. Build chỉ đọc `game/art/custom`, `game/art/truyen|bia`, `game/js` và không đọc gì trong danh sách xoá.
- `python3 game/build.py --hai-tep`: chạy được (mã thoát 0; bản một tệp 28,31 / 30 MB).
- `node game/tests/cloud_save_regression.test.js`: đạt (lưu mây, đăng nhập Google, `?cloud=0` không đổi).
- Đã chạy thử một phần `game/tests/*.py`:
  - Đạt: `au_am_thanh`, `au_bang`, `au_bao_truoc`, `au_dps`, `au_he`, `au_hieu_ung`, `au_hinh`, `au_hitbox_shots`.
  - `au_c_ban_do` và `au_giao_dien_c` cần máy chủ cục bộ ở cổng 8765, không liên quan.
  - Tôi dừng giữa chừng vì các bài `*_shots` ghi đè ảnh soát trong `docs/review`. Đã trả các tệp đó về như cũ.
- Bản dựng trong `game/dist` đã trả về như cũ, không commit.

## Việc tiếp theo cho phiên điều phối

1. Chạy lệnh xoá ở đầu báo cáo. Commit theo 2 nhóm: Cu Tí cũ (230 tệp đầu, đường dẫn `docs/anh-goc/zed/…`, `zed-asset/ghep-sua/anh/…`) và công cụ cũ (phần còn lại).
2. Khi phiên thu-modular đã chuyển sang Cu Tí mới, xoá các tệp trong `xoa-cu-ti-cu-cho.txt` mà không còn ai đọc.
3. Có thể dọn tiếp, ngoài phạm vi lần này: các bản động tác cũ của Cu Tí **mới** trong `docs/anh-goc/zed/moi/` mà `dung-zed-game.py` không dùng. Ví dụ `03-chay`, `03-chay-v3`, `08-kiem-1-b2`, `16-thuong-xoc-b2`, `chua-ro-6khung`. Cần grep riêng `gan-vk/*.py` trước khi xoá.
