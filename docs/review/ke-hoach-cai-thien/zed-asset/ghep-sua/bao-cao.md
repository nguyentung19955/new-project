# Báo cáo: sửa tận gốc ghép lớp sprite Zed v2 (nón lá, giáp, áo choàng)

*12/10/2026. Làm theo [YEU-CAU.md](YEU-CAU.md) và [YEU-CAU-2.md](YEU-CAU-2.md); chỗ nào hai tài liệu khác nhau thì theo YEU-CAU-2.*

## Tóm tắt cho chủ dự án

- **Nón lá không còn che mặt.** Máy đếm 0 điểm ảnh mặt/mắt bị che ở cả 24 khung (đứng, đi, chạy, mỗi động tác 8 khung). Claude cũng đã mở ảnh đầu phóng to ×3 ra xem: thấy rõ mắt ở cả 24 khung.
- **Hai sừng thật hiện đủ.** Nón được đục lỗ đúng hình sừng ở từng khung, nên sừng thật nhô qua nón. Sừng không bị vẽ lại.
  **Vẫn còn lỗi:** ảnh nón gốc có sẵn mẩu sừng và viền lỗ vẽ ở chỗ cố định. Ở nhiều khung, chỗ đó không trùng sừng thật, nên lộ ra mẩu đỏ và vệt trắng cạnh sừng. Cần gen lại ảnh nón (prompt ở mục 7).
- **Dây nón không cắt ngang mặt.** Dây được tách ra và vẽ sau đầu. Nút dây hơi lơ lửng cạnh cằm vì dây trong ảnh gốc dài gấp khoảng 1,5 lần đầu Zed. Cũng cần gen lại.
- **Giáp nằm đúng ngực và vai, áo choàng nằm sau lưng** ở cả 24 khung. Cả hai bám theo cổ và lưng đo riêng từng khung.
- **Máy cắt ảnh không còn tự cắt hay gộp hình cho đủ 8 khung.** Tấm nào thiếu hoặc thừa khung thì máy báo LỖI và dừng.
- **Chưa thể coi là xong hết:** còn lỗi mẩu sừng vẽ sẵn, nút dây, tóc thò qua chóp nón, và áo choàng tràn ô khi đưa vào game (mục 6). Mắt người phải xem lại GIF.

Xem nhanh: [ảnh đầu ×3](anh/luoi-dau-than-tat-ca.png) · [8 khung × 3 hàng, đủ đồ](anh/luoi-than-tat-ca.png) · [trước/sau](anh/truoc-sau.png) · GIF [đứng](anh/gif-than-tat-ca-1-dung.gif) · [đi](anh/gif-than-tat-ca-2-di.gif) · [chạy](anh/gif-than-tat-ca-3-chay.gif) · [điểm neo khi chạy](anh/debug-neo-3-chay.png) · [báo cáo máy](anh/bao-cao-kiem.json)

---

## 1. Đã kiểm tra gì

- Đã đọc nguyên văn hai tài liệu yêu cầu, hai script `cat-diem-anh.py` (bản commit `60d4668`) và `ghep-thu.py` (bản `0f19747`), cùng `xem-gif.py`, `kiem-sheet.py`, SPEC, `tools/tach-ghep-lop/nguon.html` và `game/js/ghep_lop.js`.
- Đã mở 4 tấm nguồn và xác nhận cỡ: `v2/00-than-dung-di-chay.png` 2048×768 (giống từng điểm ảnh với `zed-v2-canonical.png`), `05-lop-giap-do.png` 2048×768, `06-lop-non-la.png` 2046×768, `07-lop-ao-choang.png` 2048×768.
- Cả 4 tấm tự tách được **8/8/8 khung mà không cần ép**. Mỗi khung nằm đúng ô cột của nó, không chạm mép ảnh, và không có mảnh nhỏ nào bị bỏ.
- Đã chạy bản cũ trên đúng các ảnh này. Kết quả "TRƯỚC" ở [truoc-sau.png](anh/truoc-sau.png).
- Không chạy game, Playwright hay `game/tests`, đúng như chủ dự án dặn.

## 2. Nguyên nhân gốc

**XN** = đã xác nhận bằng code và ảnh chạy thật. **GT** = giả thuyết, chưa chứng minh được.

| # | Tệp, hàm, dòng (bản cũ) | Nguyên nhân | Hậu quả | Cách sửa | Cách kiểm |
|---|---|---|---|---|---|
| 1 | `ghep-thu.py` d.40–44 (nón) | Đường vành lấy là "hàng rộng nhất trong 70% trên". Cắt bỏ mọi thứ dưới vành+4. Phóng theo bề ngang tóc ×1,35 (tối đa 1,2). Đặt vành tại `H*0.16` của khung bao | **XN**: chạy lại thì nón lơ lửng trên đỉnh đầu ở hàng đứng/đi, và nhảy theo tỉ lệ khung bao. Phần dây ở ngang vành vẫn bị vẽ **trước** đầu, nên ở hàng chạy đuôi dây cắt ngang tóc. Mẩu sừng vẽ sẵn trên nón thành **sừng thứ ba, thứ tư**. **GT**: ảnh "nón che gần hết mặt" mà chủ dự án thấy chưa tái hiện được bằng bản `0f19747`. Có thể ảnh đó đến từ một lần chạy với tham số hoặc mặt nạ khác | Làm lại hoàn toàn (mục 3) | `mat_bi_che_diem_anh` = 0 ở 24/24 khung; ảnh `luoi-dau-*` |
| 2 | `ghep-thu.py` d.17–18, 27–28 | Neo = khoảng ngang điểm ảnh ở **dải tỉ lệ cố định** của khung bao (thân 48–72%, đầu 5–40%). Đây chính là "tâm khung bao làm neo" | **XN**: khi tóc, khăn hay chân thay đổi khung bao (đuôi khăn bay khi chạy), neo nhảy theo dù đầu không đổi chỗ | Neo giải phẫu đo theo màu và hình học trên từng khung (mặt da, mắt đỏ, sừng chạm tóc, cổ dưới cằm, eo là dải đai đỏ) | `debug-neo-*.png` |
| 3 | `ghep-thu.py` d.30–38 | Giáp: tỉ lệ = bề ngang thân ×1,35, đặt ở `H*0.44`. Áo choàng: tỉ lệ ×1,6 (đứng) hoặc ×2,4 (đi, chạy), đặt ở `H*0.44` | **XN**: tỉ lệ đổi **theo từng khung** nên giáp và áo phình, co khi chạy. Áo choàng hàng đi/chạy to gấp 1,5 lần hàng đứng | Một tỉ lệ cho cả 3 hàng (đo ở hàng đứng). Vị trí theo cổ (giáp) và lưng (áo) của từng khung | `bao-cao-kiem.json` → `ti_le`; lưới `luoi-than-giap.png` |
| 4 | `ghep-thu.py` d.32, 37, 43, 45 | `LANCZOS` khi đổi cỡ đồ, rồi thu cả khung 400→320 bằng bicubic mặc định | **XN**: viền nhoè, alpha trung gian, sinh màu mới (xem [so-sanh-doi-co.png](anh/so-sanh-doi-co.png)) | Tỉ lệ 1 thì không đổi cỡ. Khác 1 thì NEAREST + alpha nhị phân. Ảnh xem thử phóng bằng NEAREST ×2/×3 | `alpha_trung_gian` = 0 ở 24/24 khung |
| 5 | `ghep-thu.py` d.30, 35, 39 (`if k<len(...)`), d.16 | Không kiểm số khung. Lớp nào thiếu khung thì **bỏ qua im lặng** | **XN** từ code: thiếu một khung nón thì GIF vẫn xuất "thành công", nhưng khung đó trần đầu | Tách bằng `tach_sheet` chế độ chính thức. Sai số khung thì dừng | Thử với ảnh hỏng (mục 4) |
| 6 | `ghep-thu.py` d.34–44 | Thứ tự vẽ cố định: áo → thân → giáp → nón (cả nón). Không có lớp nào nằm sau đầu | **XN**: dây và mặt dưới nón (nằm dưới vành) luôn đè lên mặt hoặc tóc | Tách nón thành `non_truoc` (trên thân) và `non_sau` (sau thân) theo mép dưới vành từng cột của chính ảnh nón | `day_non_trong_vung_mat` = 0 |
| 7 | `cat-diem-anh.py` d.52–86 `sua_so_hinh`, d.123–130, d.114 (`--so 8` mặc định) | Thiếu hình thì cắt hình rộng nhất ở cột ít điểm ảnh. Thừa thì gộp mảnh nhỏ nhất vào hình gần nhất. Bật **mặc định**, không ghi lại | **XN**: hàng nào cũng "đủ 8" dù ảnh hỏng. Cảnh báo "không phải 8" ở d.170 **không bao giờ in ra** vì đã bị ép đủ 8 | Bỏ khỏi đường chính thức. Sai số khung thì LỖI, mã thoát 1. Chế độ `--che-do phuc-hoi` riêng có tên `-SUY-DOAN`/`-PHUC-HOI`, mã thoát 2 | Ảnh thử `thieu.png` (xoá 1 khung) cho LỖI; `dinh.png` (hai khung dính) cho LỖI và cảnh báo "rộng 303 (trung vị 162) — có thể hai hình dính nhau"; phục hồi ghi khung 1.1, 1.2 là suy đoán |
| 8 | `cat-diem-anh.py` d.27 `binary_opening` | Phép mở ăn mất mọi nét mảnh dưới 3 điểm ảnh | **XN**: mất 1 923 điểm ảnh ở tấm thân, 1 690 ở áo choàng (đầu tóc, mép áo, viền) | Chỉ bỏ chấm nhiễu dưới 4 điểm ảnh (cả 4 tấm: 0 chấm) | `tach_nen.cham_nhieu_bo` = 0 |
| 9 | `cat-diem-anh.py` d.46 | Mảnh nhỏ bị **bỏ im lặng** | **XN** từ code (với 4 tấm này thì 0 mảnh) | Liệt kê trong `manh_bo`. Mảnh từ 40 điểm ảnh trở lên thì cảnh báo, và vẽ hộp tím trong `debug.png` | `bao-cao-kiem.json` → `tach.*.manh_bo` |
| 10 | `cat-diem-anh.py` d.10–12 so với main | Docstring hứa "xuất khung-NN.png" nhưng code không làm. Không kiểm khung có nằm đúng ô cột không | **XN** | Có ghi `khung-NN.png` (chỉ khi ĐẠT). Kiểm ô cột (sai thì LỖI "sai thứ tự hoặc thiếu/thừa khung phía trước") | Thử `thieu.png`: khung 4–7 báo nằm ở ô 5–8 |
| 11 | `cat-diem-anh.py` d.156, `xem-gif.py` d.112 | LANCZOS khi làm GIF xem thử | Viền nhoè trong GIF xem thử, dễ đánh giá sai nét | `cat-diem-anh.py`: GIF không đổi cỡ (1:1). `xem-gif.py`: **chưa sửa** (không nằm trong phạm vi hai script; ghi ở tồn đọng) | — |

## 3. Cách mới hoạt động

1. **Tách**: `cat-diem-anh.tach_sheet(..., che_do='chinh-thuc')` cho 4 tấm. Sai thì dừng. Khung k của thân ghép với khung k cùng hàng của từng lớp.
2. **Neo thân** (`do_neo_than`, từng khung): mặt là vùng da lớn nhất ở nửa trên. Mắt là điểm ảnh đỏ trong mặt. **Vùng mặt bảo vệ** đi từ trên mắt 4 điểm ảnh xuống tới cằm. Hai sừng là vùng đỏ trên mắt, rộng hơn 60 điểm ảnh, **chạm tóc**; điều kiện chạm tóc loại được đuôi khăn bay lên khi chạy (đã gặp ở khung chạy 4–5). Cổ ở ngay dưới cằm. Eo là hàng có nhiều điểm đỏ nhất của đai. Vai và lưng lấy trên hàng 1/4 đoạn cổ→eo. Mỗi neo có `tin_cay`; neo nào không đo được thì ghi vào `can_chinh_tay`. Riêng `tay_cam` để trống ở cả 24 khung, vì ba món này không cần và máy không đo tin được.
3. **Nón**: tỉ lệ 1 (giữ nguyên điểm ảnh). Tách trước/sau theo mép dưới vành từng cột của chính ảnh nón, không đoán phần bị che. Vị trí là chỗ **thấp nhất** mà `non_truoc` không chạm vùng mặt, lệch ngang tối đa ±12 điểm ảnh quanh giữa đầu để lỗ sừng vẽ sẵn của nón trùng sừng thật nhiều nhất. Sau đó đục `non_truoc` đúng hình sừng của khung đó.
4. **Giáp**: tỉ lệ 0,599 = trung vị hàng đứng của (cổ→eo thân)/(cổ→đai giáp). Đặt tâm lỗ cổ giáp thấp hơn cổ thân 6 điểm ảnh. Nếu vẫn chạm vùng mặt thì hạ thêm, tối đa 20; thực tế hạ 0–3 điểm ảnh, có ghi lại.
5. **Áo choàng**: tỉ lệ đo được 1,006, lấy tròn **1** (vì lệch dưới 3%, giữ nguyên điểm ảnh). Khuy áo đặt vào neo lưng của từng khung. Vẽ sau thân.
6. **Thứ tự vẽ**: áo choàng 20 → `non_sau` 35 → thân 40 → giáp 60 → `non_truoc` 85.
7. **Lý do chọn cách đổi cỡ**: giáp phải thu 0,6. NEAREST giữ nguyên bảng màu và alpha 0/255; đổi lại vài hàng/cột điểm ảnh bị rơi nên nét viền vàng dày mỏng không đều. BOX/LANCZOS làm nhoè và sinh alpha trung gian. Pixel art cần sắc nét nên chọn NEAREST. Muốn hết lỗi rơi nét thì phải gen giáp đúng cỡ thân (prompt `sua-giap-do.txt`).

**Schema neo thống nhất ba nơi** (cờ `G.GHEP_LOP` vẫn **tắt** mặc định):

- **SPEC**: mục 2 thêm slot `mu_sau` (lớp 35); mục 6 thêm các trường `mat`, `sung`, `co`, `nguc`, `eo`, `vai`, `tin_cay`, `can_chinh_tay`, `nguon_neo`; thêm mục 7.1b (tệp `linh-khi-neo` có phiên bản, hệ toạ độ "nguon-khung", tệp chỉnh tay thắng tệp máy đo).
- **Trang ghép** (`nguon.html` → `index.html`): thêm slot `mu_sau`, vẽ khung mặt và chấm sừng, báo "Cần chỉnh tay". Đặt tay một neo thì neo đó được tính là đã xác nhận. Thân Zed v2 nhúng sẵn neo máy đo (`dong-goi.py`).
- **`ghep_lop.js`**: biết slot `mu_sau`. Món gắn và vũ khí **không vẽ** khi neo của nó còn trong `can_chinh_tay`. Đã build lại `game/dist` (một tệp + hai tệp) và đồng bộ Pages.

## 4. Kiểm tra đã chạy thật

| Kiểm | Lệnh / bằng chứng | Kết quả |
|---|---|---|
| Tách 4 tấm (chính thức) | `cat-diem-anh.py … --hang 3 --so 8` | 4/4 ĐẠT, 8/8/8, 0 mảnh bị bỏ |
| Tấm thiếu 1 khung (tự tạo) | xoá khung 4 hàng 1 | LỖI "tìm được 7 hình, cần 8" + "khung 4–7 nằm ở ô 5–8", mã thoát 1, không xuất khung/GIF |
| Hai khung dính (tự tạo) | dời khung 2 đè khung 1 | LỖI + cảnh báo "rộng 303 (trung vị 162)", mã thoát 1 |
| Chế độ phục hồi | `--che-do phuc-hoi` | Xuất `dung-PHUC-HOI/khung-01-SUY-DOAN.png`, `khung-02-SUY-DOAN.png`; báo `suy_doan: [[1,1],[1,2]]`; mã thoát 2 |
| Ghép + kiểm tự động | `python3 docs/anh-goc/zed/ghep-thu.py` | **ĐẠT tự động**: 0 lỗi, 23 cảnh báo (ghi trong `bao-cao-kiem.json`) |
| Mặt / mắt bị lớp trên che | `mat_bi_che_diem_anh`, `mat_mat_bi_che_diem_anh` | 0 / 0 ở 24/24 khung |
| Sừng bị che | `sung_hien_ti_le` | 1,0 ở 24/24. Con số này đúng theo cách làm (vì đã đục lỗ); nó chỉ chặn được lỗi do chỉnh tay sau này, **không** chứng minh sừng trông đẹp |
| Mẩu sừng vẽ sẵn của nón còn lộ | `mau_sung_ve_san_con_lo` trong `zed-v2.neo.json` | đứng 6 082/8 622, đi 4 757/8 520, chạy 5 596/8 546 điểm ảnh (gồm cả viền lỗ trắng). **Đây là lỗi còn lại** |
| Giáp nằm trên người | `giap_tren_nguoi_ti_le` | 0,70–0,96; dưới 0,75 ở 4 khung chạy (vai giáp chìa ra), có cảnh báo |
| Áo choàng lộ phía trước người | `ao_choang_lo_phia_truoc` | 0 ở 24/24 |
| Alpha trung gian | `alpha_trung_gian` | 0 ở 24/24 |
| Dây nón lộ ngoài viền người | `day_non_lo_ngoai_nguoi` | 1 395–3 252 điểm ảnh mỗi khung (mặt dưới nón, đuôi dây, nút). Không đè mặt, nhưng cần mắt người đánh giá |
| Thử tệp chỉnh tay | ghi tạm `than.dung.2.co`, `lop.non_la.dung.1.lech`, `lop.giap.di.3.lech` | Áp đúng, nguồn ghi `chinh-tay` (cả trong `neo-game.json`); tệp chỉnh tay thật để trống |
| Cú pháp JS | `node --check` script của `nguon.html`/`index.html`; `new Function(ghep_lop.js)` | OK |
| Build game | `python3 game/build.py`; `LK_HAI_TEP=1 python3 game/build.py --hai-tep` | Chạy xong, mã 0. **Không chạy game** |

**Kiểm bằng mắt (Claude đã mở các ảnh PNG; chủ dự án chưa xác nhận):**

- `luoi-dau-than-tat-ca.png`: mắt và mặt rõ ở cả 24 khung. Sừng trước nhô qua lỗ nón có viền trắng. Sừng sau hiện ở mép phải chóp. **Còn**: mẩu đỏ và vệt trắng của lỗ vẽ sẵn lệch khỏi sừng ở nhiều khung đứng/đi; tóc phía sau thò qua chóp nón (đứng 3, 4, 7…); dây nón chạy dọc mép má phải và nút đỏ cạnh cằm (đứng 4–7) trông hơi lơ lửng.
- `luoi-than-giap.png`: giáp ở dưới cằm, phủ ngực và vai ở cả 3 hàng; khi chạy, vạt giáp phủ hông.
- `luoi-than-tat-ca.png`: áo choàng sau lưng, bay về sau khi chạy. Áo dài gần tới gót (vì tỉ lệ 1).
- **GIF**: công cụ xem ảnh ở đây chỉ hiện khung tĩnh, nên Claude **chưa xem được chuyển động**. Độ giật được kiểm bằng số thay thế: giáp bám cổ, chỉ dao động 0–3 điểm ảnh do bước "hạ tránh cằm". Chủ dự án cần xem GIF.

## 5. Tệp đã đổi hoặc thêm

- `docs/anh-goc/zed/cat-diem-anh.py`: viết lại (kiểm số khung, phục hồi riêng, cắt tay, báo cáo, debug, NEAREST).
- `docs/anh-goc/zed/ghep-thu.py`: viết lại (neo từng khung, tách nón, kiểm, ảnh kiểm, xuất lớp chính thức, neo cho game).
- `docs/anh-goc/zed/ghep-thu-cu.py`: **mới**, bản cũ giữ nguyên thuật toán, chỉ để xuất ảnh "TRƯỚC".
- `docs/anh-goc/zed/neo/zed-v2.neo.json` (máy đo), `zed-v2.neo.chinh-tay.json` (để trống, có ví dụ), `zed-v2.neo-game.json` (toạ độ 48×48).
- `docs/anh-goc/zed/lop-ghep/zed-v2-{ao-choang,non-sau,giap,non-truoc}.png` + `zed-v2-lop.json`: lớp chính thức (GENERATED), cùng bố cục với tấm thân 2048×768.
- `docs/anh-goc/zed/README-ghep-lop.md`: hướng dẫn chạy lại và chỉnh neo.
- `docs/anh-goc/zed/prompt-v3/sua-non-la.txt`, `sua-giap-do.txt`: prompt gen lại.
- `docs/review/ke-hoach-cai-thien/zed-asset/ghep-sua/anh/*`: ảnh kiểm, GIF, debug, trước/sau, `bao-cao-kiem.json`.
- `docs/review/ke-hoach-cai-thien/zed-asset/LINH_KHI_MODULAR_SPRITE_SPEC.md`, `tools/tach-ghep-lop/{nguon.html,index.html,dong-goi.py}`, `game/js/ghep_lop.js`, `game/dist/*`.

## 6. Lệnh chạy lại

```bash
python3 docs/anh-goc/zed/ghep-thu.py                 # ghép + kiểm + ảnh + (nếu ĐẠT) lớp chính thức + neo
python3 tools/tach-ghep-lop/dong-goi.py              # nhúng neo mới vào trang ghép
python3 docs/anh-goc/zed/cat-diem-anh.py <tam.png> --hang 3 --so 8 --ten dung,di,chay   # chỉ cắt một tấm
```

## 7. Checklist nghiệm thu

### YEU-CAU-2 mục 8

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Hai script đã được sửa trực tiếp | **ĐẠT** | commit `58a6d2c` |
| Chạy lại pipeline bằng lệnh rõ ràng | **ĐẠT** | mục 6, README |
| Không còn cơ chế âm thầm cắt/gộp frame | **ĐẠT** | `sua_so_hinh` chỉ còn trong `--che-do phuc-hoi` (đổi tên `phuc_hoi_hang`, ghi suy đoán); thử thiếu/dính khung cho LỖI |
| Tất cả frame hợp lệ đúng thứ tự | **ĐẠT** | 4 tấm 8/8/8; kiểm ô cột từng khung; lưới 8 khung theo thứ tự |
| Mặt Zed không bị nón che bất hợp lý | **ĐẠT (máy + Claude xem ảnh); chờ chủ dự án xác nhận** | 0 điểm ảnh ở 24/24; `luoi-dau-*.png` |
| Hai sừng rõ ràng ở cả ba trạng thái | **CHƯA ĐẠT hoàn toàn** | Sừng thật hiện đủ 24/24, nhưng mẩu sừng và viền lỗ vẽ sẵn của nón còn lộ cạnh sừng thật (khoảng 55–70% điểm ảnh mẩu vẽ sẵn). Cần ảnh nón mới |
| Áo choàng và giáp đúng vùng, không trôi | **ĐẠT trên ảnh ghép; chuyển động chưa xem bằng mắt** | Giáp 70–96% trên người, bám cổ (0–3 điểm ảnh); áo lộ phía trước 0; GIF cần chủ dự án xem |
| Pixel art sắc nét, alpha đúng | **ĐẠT** (có ghi chú) | alpha trung gian 0; nón và áo không đổi cỡ; giáp thu 0,6 bằng NEAREST nên viền dày mỏng không đều |
| Đã chạy kiểm thử thực tế | **ĐẠT** | mục 4 |
| Có ảnh preview để xác nhận bằng mắt | **ĐẠT** | thư mục `anh/` |
| Có hướng dẫn chạy lại và chỉnh điểm neo | **ĐẠT** | `docs/anh-goc/zed/README-ghep-lop.md` |

### YEU-CAU mục 8

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Script chạy được trên bộ ảnh nguồn thực tế | **ĐẠT** | mục 4 |
| Đủ frame đúng thứ tự cho từng animation | **ĐẠT** | 8/8/8 × 4 tấm |
| Nón không che mắt và mặt | **ĐẠT (chờ chủ dự án xác nhận)** | như trên |
| Hai sừng vẫn hiển thị đúng | **CHƯA ĐẠT hoàn toàn** | mẩu sừng vẽ sẵn của nón |
| Giáp và áo choàng bám đúng vị trí trên cả 8 frame | **ĐẠT trên ảnh ghép**; **CHƯA ĐẠT** khi cắt theo ô game | Áo choàng lấn sang ô bên cạnh ở 24/24 khung, tràn ra ngoài tấm ở 3 khung đầu hàng (cảnh báo trong `bao-cao-kiem.json`) |
| Không cắt mất chi tiết quan trọng | **ĐẠT** | bỏ `binary_opening`; 0 khung chạm mép; 0 mảnh bị bỏ |
| Có báo cáo kiểm thử và ảnh/GIF | **ĐẠT** | `anh/` |
| Không có lỗi nghiêm trọng bị bỏ qua | **ĐẠT** (mọi lỗi còn lại đã ghi ở đây) | mục 8 |

**Kết luận: CHƯA HOÀN THÀNH.** Lỗi chính (nón che mặt, dây cắt mặt, ép đủ 8 khung) đã sửa. Nhưng sừng chưa sạch hoàn toàn và lớp chưa đưa vào game được, cho tới khi có ảnh nón mới và khung game rộng hơn cho áo choàng.

## 8. Việc tồn đọng

1. **Mẩu sừng và viền lỗ vẽ sẵn trên nón** không trùng sừng thật. Khoảng cách hai lỗ nón: đứng 68, đi 60, chạy 58 điểm ảnh; khoảng cách chân hai sừng thật: 60,5 / 61 / 55,5. Sửa đúng cách: **gen lại nón** với lỗ để trống (máy đã tự đục lỗ theo sừng). Không vẽ đè hay xoá mẩu đó bằng code, vì như vậy là đoán phần bị che.
2. **Dây nón quá dài** so với đầu Zed: cằm chỉ cách vành khoảng 37–44 điểm ảnh. Dây đã vẽ sau thân nên không che mặt, nhưng nút dây lơ lửng cạnh cằm. Cần gen lại (`sua-non-la.txt`). Bản thử không dây: `--day-non an`.
3. **Tóc phía sau thò qua chóp nón** ở một số khung đứng/đi. Tóc không được xoá (theo yêu cầu). Muốn ẩn thì dùng `an_toc` (SPEC 7.1), nhưng cần chủ dự án đồng ý vì như vậy là ẩn tóc.
4. **Giáp vẽ to hơn thân khoảng 1,67 lần** nên phải thu 0,6 và rơi nét. Nên gen lại đúng cỡ thân (`sua-giap-do.txt`).
5. **Áo choàng lấn ô**: khi đưa vào game (khung 48×48), cần khung rộng hơn cho lớp lưng, hoặc ô riêng.
6. Neo `tay_cam` chưa đo (24/24 khung `can_chinh_tay`). Neo `dau` trong `neo-game.json` luôn ở trạng thái cần chỉnh tay, nên game chưa dùng cho đến khi có người xác nhận trên trang ghép.
7. `xem-gif.py` vẫn dùng LANCZOS khi xem thử (không nằm trong hai script được giao).
8. Các lớp mới ở trạng thái **GENERATED**. Lên VALIDATED cần chủ dự án xem GIF và đi qua checklist SPEC 9.3.

## 9. Ảnh cần gen lại

- **Nón lá**: `docs/anh-goc/zed/prompt-v3/sua-non-la.txt`. Lỗ sừng đúng chỗ và để trống, dây ngắn, nút dưới cằm.
- **Giáp đỏ**: `docs/anh-goc/zed/prompt-v3/sua-giap-do.txt`. Đúng cỡ thân, vạt ngắn khi chạy, chừa chỗ tay trước.
- **Áo choàng**: không cần gen lại. Ảnh hiện tại dùng được ở tỉ lệ 1.
