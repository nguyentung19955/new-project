# Báo cáo dọn tệp (15/10)

Yêu cầu: `YEU-CAU.md` cùng thư mục.

## Tóm tắt

- **Đã rà xong và lập danh sách. CHƯA xoá được tệp nào.** Bộ phân loại an toàn của phiên chạy tự động từ chối lệnh `git rm` trong `docs/` (lý do: "xoá cục bộ không hoàn tác được"), giống phiên `hieu-nang` trước. Tôi không tìm cách lách.
- Danh sách nhóm (A) đã kiểm bằng grep toàn repo: **705 tệp, 747,4 MB** (khoảng 26% thư mục `docs/`). Từng đường dẫn ở **`xoa-nhom-A.txt`**.
- Muốn xoá thì chạy ở gốc repo (nhánh `khoi-tao-du-an`):
  ```
  git pull --rebase
  git rm -q --pathspec-from-file=docs/review/ke-hoach-cai-thien/don-tep/xoa-nhom-A.txt
  git commit -m "don-tep: xoa nhom A"
  git push
  ```
  Cách khác: cho phép phiên sau được xoá trong `docs/`.
- Đã thêm vào `.gitignore` các tệp tạm, `game/.dem-webp/`, và `debug.png`/GIF xem thử trong `*-cat/` và `*-gif/`. Khi chạy lại script cắt, các tệp này không bị commit lại. Dòng ignore không ảnh hưởng tới tệp đang được theo dõi.
- Kiểm tra trên cây hiện tại: `node --check` mọi `game/js/*.js` đạt. `game/tests/cloud_save_regression.test.js` đạt. `may_luat.test.js` bỏ qua vì thiếu thư viện, như trước. `python3 game/build.py` và `LK_ANH_ROI=1 python3 game/build.py --hai-tep` chạy được (dựng trong bản chép tạm, không ghi đè `game/dist`). Workflow tìm đủ tệp: `game/web/*`, `tools/tach-*/index.html`, `tools/xuong-sprite`.
- Không đụng code game, đăng nhập Google, lưu mây hay `?cloud=0`.

## (A) Không còn dùng: đề xuất xoá (chưa xoá được), 747,4 MB

| Nhóm | Số tệp | Dung lượng | Vì sao chắc chắn |
|---|---|---|---|
| `debug.png` trong `docs/anh-goc/**/<…>-cat/` và `zed/moi/*-gif/` (quai-moi 183, trum-moi 88, zed 124, npc-moi 20) | 415 | 638,9 MB | Chỉ `docs/anh-goc/zed/cat-diem-anh.py` ghi ra (ảnh khung bao để người xem). Không script nào đọc: grep `debug.png`/`debug` trên mọi `.py/.js/.html/.sh/.yml`. Các script dựng (`dung-6-con.py`, `anh_quai.py`, `dung-trum-nho.py`, `dung-moc-ho.py`, `dung-ngu-tinh.py`, `dung-hieu-ung-*.py`, `neo.py`, `dung-npc.py`, `dung-ban-nho.py`, `sift_ti_le.py`, `dung-zed-game.py`, `sua-bang-tay.py`) chỉ đọc `khung-NN.png` + `bao-cao.json`. |
| GIF xem thử trong cùng các thư mục `*-cat/`, `*-gif/` (`1-die.gif`, `N-atk.gif`, `cham.gif`…) (quai-moi 183, trum-moi 82, zed 4, npc-moi 20) | 289 | 108,5 MB | Cũng do script cắt ghi ra. Không script nào đọc `.gif` làm đầu vào. Đã grep đủ 61 tên GIF khác nhau trên 2 575 tệp chữ: không tài liệu nào trỏ tới (2 chỗ khớp chỉ là một phần của tên khác, `gif-than-tat-ca-1-dung.gif`). |
| `text-example.txt` (gốc repo) | 1 | 0 byte | Tệp rỗng từ commit đầu tiên "test". Không chỗ nào nhắc tới. |

Không có `__pycache__`, `.pyc` hay tệp tạm nào đang được theo dõi. `hieu-nang` đã xoá trước các bài kiểm và công cụ chết trong `game/tests` và `tools`.

## (D) game/dist: không xoá gì

Bốn tệp đều do `build.py` ghi lại mỗi lần chạy và đều đang có chỗ dùng:

- `linh-khi.html`, `xuong-sprite.html`, `xuong-sprite-thu.html`: workflow đăng.
- `artifact.html` (28 MB): bản mảnh trang trong `game/README.md`, được `game/tests/ui_build.py` đọc.

Cặp tệp 2 tệp/ảnh rời đã nằm trong `.gitignore`. Không có bản build cũ nào sót lại.

## (B) Chỉ dùng cho cờ quay lui: GIỮ, chờ chủ game quyết sau khi chơi thử

| Tệp / phần | Dung lượng | Bỏ cùng cờ |
|---|---|---|
| `game/art/custom/*-cu.sprite.json` (30 tệp: boHung, caChuon, caCon, caNoc, caNocChua, chonBong, cua, cuaTuong, denLong, doiThan, haiQuy, heoCon, heoNanh, hoaBaoTu, huChua, huLua, linhMa, meoDen, namPhong, namPhongChua, nhim, nhimDoc, nhimThan, oc, ongVo, socNo, sua, tieuYeu, tuongDa, tuongMa) | 936 KB | `?quaicu=1` (mục `cu_cua`, `js/sprite_custom.js`, `build.py`) |
| Hình quái vẽ tay bằng code trong `game/js/monster_art.js` | (code) | `?vetaycu=1` |
| Vũ khí/biểu tượng vẽ code cũ (`ICON.w_*`/`s_*`, `G.weaponArt`, `G.VK_CU`) | (code) | `?vkcu=1` |
| Nhịp/hiệu ứng trùm cũ (`G.TRUM_MOI=false`) | (code) | `?trumcu=1` |
| Chớp trúng đòn trắng cũ | (code) | `?chopcu=1` |
| Các cờ khác chỉ đổi code, không có tệp ảnh riêng: `?fxcu ?giancu ?chieucu ?hethongcu ?cbcu ?chucu ?truyencu ?kynangcu ?biacu ?btcu ?authcu` | (code) | |
| `game/art/du-tru/ho-lua-tu-hoTinh-cu.sprite.json` | 592 KB | Game không nạp. Được giữ có chủ ý làm dự trữ cho vùng Núi lửa (`he-thong-moi/bao-cao-2.md`) |

## (C) Ảnh gốc chủ game gen: GIỮ

Giữ toàn bộ `docs/anh-goc/**`: `*-mau*.png`, ảnh 1 hàng động tác (`<mã>-<n>-<động tác>.png`), `goc/`, `v2/`, `truyen/`, `bia/`, `giao-dien/`, `2026-10-12/`… Cũng giữ khung đã cắt `*-cat/**/khung-NN.png` + `bao-cao.json` (457 MB), vì chúng là **đầu vào** của các script dựng sprite ở trên. Một số bộ còn có cắt tay hay sửa tay (`*-cat-tay-*.json`, `*-tay.json`, `sua-bang-tay.py`), nên chạy lại máy cắt chưa chắc ra đúng y hệt.

## Chưa chắc: KHÔNG xoá, ghi lại để chủ game xem

| Phần | Dung lượng | Lý do chưa xoá |
|---|---|---|
| Khung cắt `*-cat/**/khung-NN.png` + `bao-cao.json` | 457 MB | Đầu vào của script dựng. Có thể cắt lại từ ảnh gốc, nhưng có chỗ sửa tay. |
| `godot/linh-khi-godot` (7 ảnh lớn + cảnh/script) | 31,9 MB | Bản mẫu Godot 10/10. Game, công cụ hay workflow không dùng. `LINH_KHI_AI_ART_HANDOFF/*.md` vẫn nhắc tới `xuat_*.gd` như một cách xuất sprite. |
| Ảnh soát trong `docs/review/**` mà không tài liệu nào gọi đúng tên (≈175 tệp ở `ke-hoach-cai-thien`, cùng `review/anh`, `review/concept`, `vfx/anh-*`, `hanh-trang`, `giao-dien-va-lang`…) | ≈80 MB | Phần lớn do script soát ghi theo mẫu tên (`debug-neo-%d-%s.png`, `truoc-<chỗ>.png`, `kiem-thu-cu/`…). Báo cáo trỏ tới chúng theo thư mục hoặc mẫu tên, nên grep tên tệp không đủ để chắc. |
| `docs/LINH_KHI_AI_ART_HANDOFF.zip` | 12 MB | Có vẻ trùng thư mục `LINH_KHI_AI_ART_HANDOFF/` cạnh nó, nhưng tài liệu có nhắc tới. |
| Bản trùng md5 (42 nhóm, ví dụ `zed/goc/zed-v2-00-…` = `zed/v2/00-than-…` = `zed/zed-v2-canonical.png`, `review/xin-y-kien-hinh-anh/anh/*` = `vfx/anh-nhan-vat/*`) | 9,3 MB | Mỗi bản đều có tài liệu trỏ đúng đường dẫn đó. Xoá một bản thì gãy liên kết. |
| `docs/anh-goc/quai-moi/dong-tac/xem-thu-*.gif` (10 tệp) | 9,2 MB | GIF xem thử, nhưng `quai-moi-4-con/YEU-CAU.md` có nhắc tới. |
| Ảnh gốc nhân vật/trang phục cũ trong `docs/anh-goc/2026-10-12/` (`em-be-*-don`, `chem-kiem-*`, `chay-smith`, `than-bo/`…; `hieu-nang` đề xuất xoá) | 33,8 MB | Là ảnh GỐC (nhóm C), nên giữ theo yêu cầu này. |

## Về .git (8,6 GB)

Lịch sử git vẫn giữ mọi tệp đã xoá, nên xoá ở thư mục làm việc không làm `.git` nhỏ đi. Tôi KHÔNG viết lại lịch sử. Khuyến nghị:

- Nếu cần nhỏ hẳn: chủ dự án tự quyết dùng `git filter-repo` để bỏ `debug.png`/GIF/khung cắt khỏi lịch sử. Cách này cần force push và mọi phiên phải clone lại, nên chỉ làm khi không còn phiên nào chạy.
- Hoặc chuyển ảnh gốc lớn sang Git LFS hay kho riêng cho các ảnh về sau.
- Phiên tự động nên `git fetch origin <nhánh>` thay cho `git fetch` cả repo (nhiều nhánh và thẻ làm lần lấy đầu rất chậm).
