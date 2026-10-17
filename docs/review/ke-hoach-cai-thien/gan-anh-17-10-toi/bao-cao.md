# Gắn ảnh mới 17/10 tối — kiếm vuông theo hệ, kiếm "gân", vệt kiếm nặng gọn, lửa bám thân rộng

Ảnh chủ game vừa gen (đã có trong repo):

1. `docs/anh-goc/zed/moi/vk-kiem-vuong-he.png` — kiếm vuông theo hệ, 3 hàng (Lửa / Độc / Băng) × 3 cột (Mầm, Thành hình, Thức tỉnh)
2. `docs/anh-goc/zed/moi/vk-kiem-vuong-gan.png` — 3 kiếm "gân" (Trắng, Mầm, Thành hình)
3. `docs/anh-goc/kiem-nang/vet-kiem-nang-gon-trang-4x6.png` — vệt kiếm nặng mới, ngắn gọn hơn, vẽ màu trắng
4. `docs/anh-goc/hieu-ung-moi-17-10/lua-bam-than-rong.png` — lửa cháy bè ngang (4 khung)

**Chỉ đổi HÌNH.** Không sửa sát thương, vùng trúng, thời lượng đòn hay luật chơi (`moves.js`, `combat.js` không đụng). Không vẽ hiệu ứng nào bằng code: chỉ dùng 4 ảnh trên. Mọi ảnh thu nhỏ bằng cách thu nét (`do-net/cong-cu/thu_net.py`). Không đụng đăng nhập Google, lưu mây hay `?cloud=0`. Không chơi thử bằng tay: mọi số đo và ảnh đều do bot chạy không màn hình.

## Tóm tắt (cho chủ game)

| Việc | Kết quả | Cờ tắt (về như trước) |
|---|---|---|
| Kiếm vuông theo hệ | Kiếm Lửa / Độc / Băng giờ dùng **ảnh vẽ riêng** (vân lửa, dây độc, tinh thể băng) ở cả 3 cấp Mầm / Thành hình / Thức tỉnh. Áp cho kiếm trên tay Cu Tí, ô đồ, Lò rèn, Luyện. Kiếm Trắng vẫn dùng ảnh thường. Bỏ chặn tạm của phiên kiếm vuông. | `?kiemvuonghe=0` (về kiếm nhuộm màu hệ như trước) |
| Kiếm "gân" | Ảnh gân mới cho kiếm vuông (Trắng, Mầm, Thành hình) hiện ở các cấp Luyện **giữa** hai mốc. Bỏ chặn tạm. | `?kiemvuonggan=0` |
| Vệt kiếm nặng gọn | Thay 4 vệt kiếm nặng bằng ảnh mới. Vệt **nhuộm theo hệ**: Lửa cam đỏ, Độc xanh lá, Băng xanh nhạt; kiếm không hệ thì trắng-xanh như cũ. Viền sáng theo bậc (`?hebac`) vẫn giữ. Vệt **không còn vẽ xa hơn chỗ trúng thật**: lệch giảm từ +10…+24 xuống **−4…+4**. | `?vetgon=0` |
| Lửa bám thân rộng | Quái thân bè hoặc to (trùm, tinh anh, Bọ Hung, Cua, Heo…) giờ có lửa cháy **trải ngang cả thân**, co theo bề ngang thân thật. Quái nhỏ hoặc cao giữ lửa cũ. Số ca lửa "quá nhỏ so với thân": **18 → 0**. | `?luarong=0` |

**Dung lượng:**

- Bản một tệp: **29,86 MB** / trần 30 MB. Lúc bắt đầu phiên là 29,95 MB; nếu chỉ thêm ảnh mới thì sẽ lên **30,06 MB** (vượt trần). Đã kéo xuống bằng hai bước:
  - Nén lại **không mất** ảnh bảng màu của 78 tệp (điểm ảnh y hệt).
  - Nén **256 màu** tấm ảnh gân.
- Web tải đầu: **19,53 MB** / 20 MB. Con số này đã gộp phần Thuồng Luồng vừa đẩy lên (bản đó 19,51 MB); phần của phiên này chỉ thêm khoảng 0,02 MB.

## Đã làm

### 1. Kiếm vuông theo hệ

- Công cụ mới `docs/anh-goc/zed/dung-kiem-vuong-he.py` (chạy lại được). Các bước:
  - **Bỏ nền:** chỉ bỏ xanh gần thuần #00FF00. Công cụ cắt cũ `cat-diem-anh.py` làm **mất màu Độc** (xanh lá #72C943 bị coi là nền), nên không dùng.
  - **Tách 9 kiếm.**
  - **Đo trên mỗi kiếm:** chỗ đốc chắn, tâm cán (phần quấn đỏ) và mũi.
  - **Co theo lưỡi:** co sao cho lưỡi (từ đốc tới mũi) dài **đúng bằng lưỡi kiếm vuông gốc** cùng cấp.
  - **Đặt vào ô:** đặt vào ô **cùng cỡ** ô kiếm vuông, đốc và tâm cán trùng chỗ kiếm gốc. Nhờ vậy điểm cầm, nắm tay, chặn đất và mũi vệt đều giữ nguyên. Phần lửa / băng tràn ra ngoài ô bị cắt: **0–1,6 %**.
- Ra `game/art/custom/zed-vk-he.sprite.json` (tệp mới, 42 KB, tải sau khi vào trận). Nội dung:
  - `vk.kiem_vuong[hệ][cấp]`: ô ảnh từng kiếm.
  - `mui_kv[hệ][cấp]`: khung phía mũi (gồm cả lửa / dây / mảnh băng), dùng khi chặn đất.

  | Cấp | Ô (điểm ảnh ô vũ khí) | Tràn ô bị cắt (Lửa / Độc / Băng) |
  |---|---|---|
  | Mầm | 147×50 | 0 / 0 / 1,6 % |
  | Thành hình | 167×81 | 0,1 / 1,0 / 0,3 % |
  | Thức tỉnh | 151×67 | 1,1 / 0,2 / 1,2 % |

- **Game** (`js/vien_vk.js`, `G.vkHeAnh`): đang dùng kiếm vuông thì lấy ô `kiem_vuong` theo hệ, thay cho trả rỗng như trước. Chỉ chạy được khi ảnh **cùng cỡ ô** kiếm vuông. Vì vậy với `?kiemvuong=0` (kiếm cong cũ), ảnh mới tự không dùng, kiếm vẫn nhuộm như cũ.
- **Mũi không xuyên đất** (`js/zed_moi.js` `muiVk` + `G.vkHeMui`): khi cầm kiếm có ảnh hệ, chặn đất và "đặt mũi chạm đất" tính theo khung phía mũi **rộng hơn** (gồm lửa / dây / băng). Lửa / dây / băng vì thế chạm vạch đất, còn lưỡi cao hơn khoảng 2–3 điểm. Tia lửa lê đất được nới ngưỡng tương ứng nên vẫn hiện (`js/fx.js` `nangHe`).
  - Đo bằng bot (`cong-cu/dat.py`, combo kiếm nặng, 111 nhịp × 4 cấp × 3 hệ, đếm **mọi** điểm ảnh dưới vạch đất):
    - Lửa, Độc, Băng ở Mầm và Thức tỉnh: **0** điểm ảnh dưới đất.
    - Thành hình: còn 2 / 8 / 9 điểm ảnh ở 2–4 nhịp. Đó là **cánh chắn tay và tua đỏ** của Thành hình, lỗi đã có từ trước. Với `?kiemvuonghe=0` chỗ này là 49 điểm ảnh, tức là nay còn ít hơn.
  - Số đo: `so/dat-sau.txt`, `so/dat-kiemvuonghe0.txt`. Trước khi sửa chặn đất, ảnh hệ làm lọt đất tới 388 điểm ảnh (Băng Thức tỉnh).
- **Soát cầm vũ khí** `cam-vk-chuan/soat.py`:
  - Thêm tuỳ chọn `--kiemvuonghe=fire|poison|ice|gan` để thay ô kiếm bằng ảnh hệ / gân, giống game.
  - Kết quả: **0 lỗi** với cả 4 bộ ảnh. Đứng 0/32, đi 0/32, chạy 0/48, kiếm 1 0/16, kiếm 2 0/12, kiếm 3 0/12, kiếm đặc biệt 0/24.

### 2. Kiếm "gân"

- Cùng công cụ, cùng cách đặt (đốc, tâm cán, độ dài lưỡi khớp kiếm gốc). Ảnh dán **dưới** tấm `zed-vk-gan` cũ, thêm mục `vk.kiem_vuong = [Trắng, Mầm, Thành hình, null]`. Các ô cũ (thương, búa, phi tiêu) giữ nguyên.
- **Ảnh gân vẽ hơi khác dáng gốc:** lưỡi mảnh hơn một chút, khác 8–23 % điểm ảnh. Nếu ghép độ trong của ảnh gốc vào thì lộ hai lớp mép, nên đã dùng đúng hình của ảnh gân.
- Tấm gân cũ có khoảng 18 000 màu (chế độ RGBA, co bằng `Image.BOX`). Đã nén **256 màu**: sai khác trung bình dưới 1 mức màu, tệp từ 64 KB còn 23 KB.
- `js/vien_vk.js` `G.vkGanAnh`: đang dùng kiếm vuông thì lấy `vk.kiem_vuong`.
- Gân hiện ở Trắng Luyện 2, Mầm Luyện 4–5, Thành hình Luyện 7–11, như luật cũ. Kiếm gân có hệ vẫn nhuộm 30 % màu hệ như trước, vì ảnh gân không có bản theo hệ.

### 3. Vệt kiếm nặng gọn

**Cắt ảnh**

- `docs/anh-goc/kiem-nang/cat-vet-kiem-nang.py --gon` cắt giống hệt cách cũ (bỏ nền, khung bao chung, thu nét, ≤ 48 màu), ra `hu-chem-kiem-nang-gon-1..4`. Mốc ảnh ở `vet-moc-gon.json`.
- Có cả **bản nét 4** (`tam_n4`, chỉ tải khi bật `?netcao`), làm theo cách phiên net-cao: `net-cao/cong-cu/cat_vet_n4.py --gon --ghi`.

| Hàng | Khung cũ (điểm game) | Khung mới |
|---|---|---|
| 1 tia lê đất | 51×19 | 43×28 (game vẽ ×0,7 cho vừa mũi kiếm) |
| 2 hất lên | 51×40 | 39×37 |
| 3 bổ xuống + nổ đất | 51×45 | 37×36 |
| 4 chém ngang | 51×31 | 43×21 |

**Gắn vào game** (`js/fx.js`, mục "VỆT GỌN")

- Cùng chỗ đặt, cùng lúc thả như vệt cũ.
- **Nhuộm** bằng dải màu của `js/fx_he_moi.js`, kiểu mới `hemoigon`: ảnh trắng có độ sáng 0,6–1 được giãn ra để vệt có đủ đậm nhạt. Thêm dải `trang` (trắng-xanh, đo từ ảnh vệt cũ) cho kiếm không hệ.
  - Dải màu và phép nhuộm được dời lên **trước** chỗ `?hemoi=0` thoát, nên vệt gọn vẫn có màu khi tắt `hemoi`.
  - Khi `?hemoi=0`, không hình nào khác dùng kiểu nhuộm này, nên các hình khác vẫn y hệt trước.
- **Viền sáng theo bậc** (`?hebac`) vẽ bằng đúng kiểu nhuộm của vệt.

**Không vẽ xa hơn chỗ trúng** (`gonGioi`)

- Tầm đòn của nhát đang ra lấy từ số trong `moves.js`: 32 / 34 / 40, ×1,15 nếu vũ khí có dòng "tầm".
- Lưới quái đo được mép thân quái xa nhất còn trúng ≈ 0,9 × tầm. Khung ảnh (kể cả viền sáng +6 %) được vượt tối đa **4 điểm**.
- Nếu quá: thu ảnh quanh điểm neo (không nhỏ hơn 0,6 lần), quá nữa thì lùi điểm neo về phía Cu Tí.
- Tia lửa lê đất (bám mũi kiếm từng hình) được kẹp lại ở mỗi hình.

**Hạt văng ra lúc vung** (giọt độc, tàn lửa, mảnh băng có sẵn; `js/fx_he_moi.js` `giotSan`)

- Áp riêng combo kiếm nặng khi bật vệt gọn: hạt cũng không bay xa hơn giới hạn trên.
- Mỗi hạt nhớ giới hạn và chỗ đứng của nhát lúc nó sinh ra.
- Trong 0,5 giây sau khi trúng quái thì để nguyên, vì đó là hạt trúng nằm trên thân quái.

**Đo tầm** bằng công cụ của hieu-ung-he (`do.py` + `tam.py`, kiếm 3 nhát, 3 hệ × 4 bậc)

- "Lệch" = hình xa hơn mép thân quái xa nhất còn trúng, đơn vị điểm game. Số đủ: `so/tam-truoc.json`, `so/tam-sau.json`.
- `?vetgon=0` cho **đúng y** số trước (`so/tam-vetgon0.json`).

| Nhát (tầm trúng) | Trước | Sau | Chỉ riêng ảnh vệt (sau) |
|---|---|---|---|
| Nhát 1 lê → hất lên (30) | +18…+24 | **+1…+6** | ≤ +2 |
| Nhát 2 bổ xuống (30) | +10…+19 | **+1…+7** | ≤ +4 |
| Nhát 3 chém ngang (36 / 48 / 72) | +2…+15 | **−7…+15** | ≤ −2 |

Mục tiêu **≤ +6 đạt ở nhát 1 và 2**, trừ Băng Thức tỉnh nhát 2: **+7**. Phần còn vượt **không phải ảnh vệt**:

- **Độc nhát 1–2 (+6):** hạt giọt độc rơi sát giới hạn.
- **Độc nhát 3 (+9 Mầm, +12 Thành hình, +15 Thức tỉnh):** ngoài hạt giọt độc còn có **mây độc / vòng độc / độc toé** của luật Thành hình–Thức tỉnh. Đó là vùng chơi, không bỏ.
- **Băng nhát 3 (+12 / +13):** **hàng gai băng** của luật, có trúng thật tới 72.
- **Băng Thức tỉnh nhát 2 (+7):** gai băng còn sót sang khung này.

Phía sau lưng: tia lửa lê đất vẫn hiện như cũ (−38…−49).

### 4. Lửa bám thân rộng

- `docs/anh-goc/hieu-ung-moi-17-10/cat-lua-bam-rong.py` cắt 4 khung, đặt đáy-giữa chung để gốc lửa không nhảy, thu nét về 40×23 điểm game. Ra `hu-bam-lua-rong` (lặp 0,45 giây như `hu-bam-lua`), có cả bản nét 3 / 4.
- `js/fx.js` `fx.entity`: dùng ảnh rộng khi quái là **trùm, tinh anh**, hoặc **thân rộng ≥ 38 điểm và rộng ≥ 1,3 × cao** (theo bảng neo `dinh_quai_bang.js`).
  - Cỡ: 90 % bề ngang thân, lửa không cao quá 80 % thân.
  - Quái nhỏ hoặc cao (Ong Vò Vẽ, Hoa Bào Tử…) giữ `hu-bam-lua` cũ.
- **Đo dính quái** bằng công cụ của hieu-ung-dinh-quai (`do_a.py … t` + `phan_tich.py`, NET 2, 48 quái × 2 mặt):
  - "Trạng thái: Cháy": **78 dính / 18 sai cỡ → 96 dính / 0 sai cỡ**. Trước là `?luarong=0`; số ở `hieu-ung-dinh-quai/so-lieu/lua-*.json`.
  - Không ca nào "trùm lấp thân". 0 lỗi JS.

## Ảnh soát (thư mục này)

- `luoi-kiem-vuong-he-x3.png` — kiếm vuông **trên tay Cu Tí** (hàm vẽ thật của game, ×3).
  - Mỗi ô 2 dáng: đứng cầm kiếm và nhát 3 chém ngang ★.
  - Hàng: Lửa / Độc / Băng × Mầm / Thành hình / Thức tỉnh; hàng cuối: gân Trắng (Luyện 2), gân Mầm (Luyện 4), gân Thành hình (Luyện 7), Trắng.
- `kiem-vuong-he-x4.png` — từng ô ảnh ×4: gốc | Lửa | Độc | Băng | gân.
- `so-o-do.png` — hình kiếm trong ô đồ (túi, Lò rèn, Luyện). Trên: mặc định; dưới: `?kiemvuonghe=0&kiemvuonggan=0`.
- `anh/sau/` và `anh/truoc/` (trước = `?vetgon=0&kiemvuonghe=0&luarong=0`) — combo kiếm nặng **Thức tỉnh**, 3 hệ × **trúng 3 / trượt**.
  - Mỗi ca 3 tệp: `.gif` (đúng tốc độ), `-cham-x3.gif` (chậm ×3), `-khung.png` (chuỗi khung).
  - Tên: `sword-<lua|doc|bang>-thuc-tinh-<trung-3|truot>`.
- `lua-truoc-sau.png` — lửa trên **Cua Đá, Mộc Tinh**, Bọ Hung, Cua, Heo Nanh (tinh anh), Heo Rừng Con, Ong Vò Vẽ, Hoa Bào Tử: trái `?luarong=0`, phải mới.
- `cong-cu/` — công cụ dựng ảnh soát và đo:
  - `luoi_kiem.py`, `o_do.py`, `lua_truoc_sau.py`: ảnh soát.
  - `dat.py`: đo đất.
  - `nen_bang_mau.py`: nén không mất.

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` (dựng lại sau khi gộp Thuồng Luồng) | Đạt. Một tệp **29,86 MB** / 30; web tải đầu **19,53 MB** / 20 |
| Bot chơi có vẽ (`hieu-ung-he/cong-cu/bot_loi.py`: 4 vũ khí × 3 hệ, Mầm / Thức tỉnh, bấm cả Đặc biệt và Chưởng), chạy với: mặc định, `?vetgon=0`, `?kiemvuonghe=0`, `?kiemvuonggan=0`, `?luarong=0`, `?hemoi=0`, tắt cả 4 cờ mới, `?kiemvuong=0`, `?netcao=4` | **0 lỗi JS**, `G.fx.errs = 0`, `fx_he_moi` không lỗi |
| Ảnh soát (lưới kiếm, ô đồ, lửa, GIF, đo dính quái, đo tầm) | 0 lỗi trang |
| Bản web `linh-khi-nhe.html` (ảnh rời, qua máy chủ thử): mặc định / tắt cả 4 cờ mới | 0 lỗi JS; `zed-vk-he`, `zed-vk-gan`, `hu-bam-lua-rong`, vệt gọn tải đúng; ảnh hệ dùng / tắt đúng |
| `?vetgon=0` | Số đo tầm trùng **y hệt** bản trước phiên |
| `cam-vk-chuan/soat.py` (ảnh thường + 3 hệ + gân) | **0 lỗi** |
| `tests/smoke.py`, `tests/*.test.js` | 0 lỗi; đều đạt (`may_luat` bỏ qua như trước vì thiếu thư viện) |
| `tests/cloud_save_regression.test.js` | Đạt (không đụng lưu mây) |

## Chỗ còn yếu / cần chủ game xem

1. **Vùng độc / gai băng của luật Thành hình–Thức tỉnh** vẫn vẽ xa hơn chỗ trúng của nhát kiếm, +12…+15 ở nhát 3. Đây là vùng thật của luật (mây độc, hàng gai băng trúng tới 72), không phải vệt chém, nên để nguyên.
2. **Ảnh gân kiếm vuông** vẽ lưỡi mảnh hơn ảnh gốc một chút, nhất là Thành hình (khác 23 % điểm ảnh). Trong game nhìn được nhưng hơi "gầy" so với kiếm thường cùng cấp. Muốn khít hẳn thì gen lại, dặn "keep EXACT blade width".
3. **Kiếm gân có hệ** vẫn nhuộm 30 % màu hệ (chưa có ảnh gân theo hệ).
4. **Kiếm Thành hình** còn 1–9 điểm ảnh **cánh chắn tay / tua đỏ** chạm đất ở 2–4 nhịp. Lỗi này có từ trước, nay ít hơn.
5. **Lửa rộng trên Heo Rừng Con** (thân bè) cũng đổi sang lửa rộng. Muốn chỉ áp cho trùm / tinh anh / quái to thì nâng ngưỡng 38 điểm (1 dòng trong `fx.js`).
6. **Vệt gọn hàng 1** (tia lê đất) trong ảnh gen có cả móc vệt nên to hơn tia cũ. Game đang vẽ ×0,7 (`KN_GON_CO` trong `fx.js`).
7. **Dung lượng sát trần:** bản một tệp còn ~0,14 MB dưới trần 30 MB, web tải đầu còn ~0,47 MB dưới trần 20 MB. Lần thêm ảnh tới sẽ cần dọn thêm.
   - Đề xuất: bỏ khỏi bản một tệp các tấm cũ chỉ dùng cho cờ quay lui (`hu-chem-kiem-nang-1..4` khi đã quen vệt gọn; bản trùng `-netcu`).
   - Hoặc nén 256 màu các tấm trùm to hiện còn 129–146 màu.

## Quay lui

- Từng mục: `?kiemvuonghe=0`, `?kiemvuonggan=0`, `?vetgon=0`, `?luarong=0`.
- Hoặc `git revert` commit này. Tệp ảnh mới: `zed-vk-he`, `hu-chem-kiem-nang-gon-1..4`, `hu-bam-lua-rong`; thêm mục trong `zed-vk-gan`. 78 tệp chỉ nén lại không mất (điểm ảnh y hệt).
