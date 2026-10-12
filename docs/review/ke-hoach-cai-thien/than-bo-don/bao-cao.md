# Đòn theo vũ khí cho THÂN BỘ (rà soát A, đề xuất A8) — 12/10/2026

**Lỗi trước:** em bé mặc đủ một bộ (Rừng Già, Hang Biển, Lâu Đài) thì game đổi sang thân vẽ liền cả bộ `em-be-<key>-<bộ>`,
nhưng thân bộ không có hàng đòn theo vũ khí → kiếm, cung, giáo, búa cùng một động tác (`atk`), giữ lấy đà cung dùng hàng `tele`
(ngồi thụp) nên cây cung khuất sau thân.

**Nay:** thân bộ có tệp đòn `em-be-<key>-<bộ>-don` thì đánh bằng 5 hàng đòn riêng (atk_sword, atk_bow, atk_spear, atk_hammer,
cast) y như thân gốc; chưa có tệp thì vẫn như cũ (đã kiểm: Cu Tèo, Cu Lì, Cái Bống mặc bộ Rừng vẫn dùng `atk` / `tele`).
Đã nhập **3 tấm của Cu Tí** (Rừng Già, Hang Biển, Lâu Đài — tấm Biển và Lâu Đài đã có sẵn trong thư mục khi chạy).
Tắt cả tính năng đòn theo vũ khí: `?donvk=0` (như trước).

## Code đã đổi (`game/js/sprite_custom.js`)

Phần lớn khung sườn đã có từ Phiên 3 (`themDon` nhận mã `em-be-<key>-<bộ>-don`, ghép xuống dưới tấm thân bộ đúng điểm chân,
`SC.cuaEmBe` chọn thân bộ, `build.py` kiểm mã tệp và xếp tệp `-don` vào ảnh tải sau). Phiên này thêm:

1. **`SC.TAY_KIEM` theo từng tấm thân**: khoá `'<key>-<bộ>'` (ví dụ `'smith-rung'`) cho thân bộ; hàm `khoaTay` chọn khoá theo
   `sp.ma`. Thân bộ KHÔNG mượn bảng của thân gốc (ảnh khác, số điểm ảnh có thể tình cờ lọt sai số → nắm tay sai — lỗi từng gặp
   ở Cu Lì phiên nhập chém). Đã kiểm trong trang: 18/18 khung kiếm của 3 thân bộ lấy tay từ bảng đo (`nguon = 'bang-do'`),
   thân gốc vẫn dùng bảng cũ.
2. **Tải nhanh**: khi ảnh thân (thân bộ) về tới mà tệp đòn của nó chưa về thì báo tải tệp đòn ngay (trước đây tệp đòn chỉ được
   ưu tiên khi chính thân đang được gọi tải lần đầu; thân đã tải sẵn theo vùng thì tệp đòn phải xếp hàng bình thường).
   Tệp mới được đóng gói thành ảnh rời WebP như mọi tệp em bé tải sau (`dist/anh/`, 617 ảnh, trần trang 0,87/1,5 MB nén,
   ảnh 20,26/26 MB).
3. Các luật khác chạy sẵn trên hàng mới vì đều đo trên chính tấm đang vẽ: `G.KIEM_KHOP` + `SC.matKhung` (kiếm ra sau thân /
   né mặt), `G.KIEM_MUOT` (đường vung, đo mặt theo khung), `G.VK_NE_MAT`, `khopEmBe`, `G.DAU_THAT`, máy đo `doTay` cho cung,
   giáo, búa, chưởng; `ghep-smith` (điểm `atk:*`) áp như với tệp đòn của thân gốc. Không đụng phần đường vung của phiên
   "Chém kiếm mượt" và trường `khung` của phiên "Bỏ khung trùng" (tệp đòn không dùng trường đó).

Không đổi gameplay: chỉ đổi khung hình được vẽ; đòn, thời điểm chạm, sát thương, tầm giữ nguyên.

## Tệp đã nhập

| Tệp | Nguồn | Ghi chú |
|---|---|---|
| `em-be-smith-rung-don.sprite.json` | `docs/anh-goc/2026-10-12/than-bo/em-be-smith-rung-don.png` | giữ màu lá xanh rêu |
| `em-be-smith-bien-don.sprite.json` | `…/em-be-smith-bien-don.png` | hàng cung ChatGPT vẽ sẵn cây cung → **xoá cung** (`--xoa-cung`), game vẽ cung theo vũ khí đang cầm (đẹp hơn đánh dấu "vẽ sẵn": cung đúng loại / hệ, có dây kéo theo độ căng). Vài nét cung nằm đè lên thân còn sót như nét viền mảnh, cung code che phần lớn. |
| `em-be-smith-lau-don.sprite.json` | `…/em-be-smith-lau-don.png` (bản gen lại 9f90f75: đúng thứ tự hàng, không vẽ cung / cầu lửa) | nhập thẳng. Bản cũ `-v1-bo.png` (hàng giáo / cung đổi chỗ, cung và cầu lửa vẽ sẵn) đã thử nhập được bằng `--hang kiem,giao,cung,bua,chuong --xoa-cung --xoa-cau` nhưng không dùng |

Cả 3: khung 48×48 nét ×2, điểm chân [24, 45], co một tỉ lệ cho cả tấm để khung đứng cao bằng khung đứng của thân bộ
(57–58 điểm ảnh nét ×2; đo trong game: khung thế đứng đầu các hàng đòn 54–58, búa giơ cao 60–63, búa nện ngồi thấp 44–51 — như tệp đòn thân gốc; không nhảy cỡ khi đổi trạng thái), đáy chân 90,
mỗi hàng dời ngang để đầu khung đầu hàng trùng đầu khung đứng; bảng màu đưa về 48 màu của thân bộ; thời lượng mỗi hàng như
`em-be-smith-don` (0,45 / 0,45 / 0,45 / 0,55 / 0,4 giây).

Lưu ý hình: hàng kiếm ChatGPT vẽ cho thân bộ theo **ảnh tham chiếu cũ** (khung 5 tay đưa ra trước, không giơ qua đầu như hàng
chém vẽ lại 12/10 của thân gốc). Kiếm vẫn ra đúng nắm tay; nếu muốn khớp hẳn hàng chém mới thì gen lại hàng kiếm.

Nắm tay hàng kiếm (vòng đỏ): [rừng](anh/smith-rung-tay-kiem.png) · [biển](anh/smith-bien-tay-kiem.png) · [lâu đài](anh/smith-lau-tay-kiem.png).
Đã sửa tay các khung máy đo bắt nhầm má: Biển khung 5, 6 → [7, -7,5], [8, -7]; Lâu Đài khung 2, 4 → [5, -8,5], [6, -8].

## Cách dùng `nhap.py` (11 tấm còn lại)

Đặt ảnh vào `docs/anh-goc/<ngày>/than-bo/em-be-<key>-<bộ>-don.png` rồi:

```
cd docs/review/ke-hoach-cai-thien/than-bo-don
python3 nhap.py <key> <bo> [--thu] [--xoa-cung] [--xoa-cau] [--hang kiem,giao,cung,bua,chuong] [--tim] [--anh <tệp>]
python3 nhap.py healer <bo> --than        # Cái Bống: tấm THÂN BỘ MỚI 8×7 em-be-healer-<bo>.png (thay em-be-healer-<bo>.sprite.json)
```

- key: smith (Cu Tí), hunter (Cu Tèo), wrestler (Cu Lì), healer (Cái Bống); bo: rung, bien, lau.
- `--thu`: chỉ ghi ra `tam/` để xem trước (`tam/<mã>-xem.png` phóng ×2, `tam/<mã>-tay.png` lưới toạ độ hàng kiếm).
- Script in một dòng `TAY_KIEM: '<key>-<bo>': { so: [...], tay: [...] }` → **mở `tam/<mã>-tay.png` xem vòng đỏ có nằm trên nắm
  tay không** (máy đo lấy điểm da xa nhất về phía trước, dưới đầu; khung ngồi thấp / giơ tay qua đầu có thể bắt nhầm má),
  sửa số nếu cần rồi dán vào `SC.TAY_KIEM` trong `game/js/sprite_custom.js`.
- Cu Lì: nếu thân bộ của Cu Lì da tím thì thêm `--tim` (xem `tam/…-xem.png`).
- Sau đó: `python3 game/build.py` (và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` để thử như web), kiểm bằng
  `kiem/kiem.py` (bên dưới).
- Cái Bống `--than`: số khung, thời lượng, neo lấy theo `em-be-healer-<bo>.sprite.json` hiện có; cỡ theo khung đứng thân gốc
  `em-be-healer`; bỏ dấu `"cu": true` (thân bộ cũ đang tạm tắt, 404b935) nên game dùng lại thân bộ ngay. Chưa có ảnh để chạy thử phần này — lần đầu nên chạy với `--thu` và xem kỹ.

## Kiểm (bản HAI TỆP như web)

`LK_HAI_TEP=1 python3 game/build.py --hai-tep`, phục vụ `game/dist` bằng `full-audit/A-nhan-vat/kiem/srv2.py` cổng 8790,
mở `linh-khi-nhe.html?cloud=0`; chạy `python3 kiem/kiem.py <thư mục ảnh> smith rung bien lau`.

- Cả 3 thân bộ ghép đủ 12 hàng (7 hàng thân + 5 hàng đòn), `donMa = em-be-smith-<bộ>-don`.
- Vẽ 4 vũ khí × (đứng, chạy, 6 khung đòn, chạy + đánh, giữ lấy đà 3 mức, chưởng 2 khung): 0 lỗi vẽ; vũ khí đúng nắm tay,
  không che mặt (kiếm ra sau thân ở khung lấy đà như thân gốc); **giữ lấy đà cung nay dùng hàng cung, cây cung hiện rõ**
  (trước: ngồi thụp hàng `tele`, cung khuất).
- Chơi thật ải 1-1, mặc đủ 4 món của từng bộ, 4 vũ khí, bot đánh: thân `em-be-smith-<bộ>`, tệp đòn đã ghép; **0 pageerror**.
- Thân bộ chưa có tệp đòn (Cu Tèo, Cu Lì, Cái Bống bộ Rừng): vẫn hàng `atk` / `tele` như cũ.
- `node game/tests/cloud_save_regression.test.js` đạt; `python3 game/build.py` chạy được, dưới trần.

Ảnh trước / sau (phóng ×4; hàng: kiếm, cung, giáo, búa; trên = trước, dưới = sau):

- [Rừng Già](anh/smith-rung-truoc-sau-x4.png) · [Hang Biển](anh/smith-bien-truoc-sau-x4.png) · [Lâu Đài](anh/smith-lau-truoc-sau-x4.png)
- Tấm đã nhập: [rừng](anh/smith-rung-don-tam.png) · [biển](anh/smith-bien-don-tam.png) · [lâu đài](anh/smith-lau-don-tam.png)
- Trong trận (cung): [rừng](anh/tran-rung-cung.png) · [biển](anh/tran-bien-cung.png) · [lâu đài](anh/tran-lau-cung.png)

## Bổ sung: nắm tay cung, giáo, búa của thân bộ (`SC.TAY_DON`)

Phiên chạy song song cùng yêu cầu (bản này) đo trong trang thấy **máy tự đo bàn tay bắt nhầm đồ của bộ** ở các hàng KHÁC kiếm
(bảng `TAY_KIEM` ở trên chỉ phủ hàng kiếm). Đo `SC.diemKhung(...).tay_truoc` trên bản 6f71aa9:

- Rừng: cung khung 2 nắm tay ở (8,5; −25,5) = **sừng mũ** → cây cung vẽ trên đầu; giáo khung 2 (−5,5; −13,5), búa khung 3, 4, 6
  (−5,5…−6,5) = **gùi sau lưng** → giáo/búa mọc ra sau lưng.
- Biển: cung khung 2, 6, giáo khung 6, búa khung 3, 4, 6 ở x = −7,5…−8,5 (khăn choàng sau lưng); nhiều khung "ước lượng" (không đo được).
- Lâu Đài: cung khung 2, 5, giáo khung 1, búa khung 4 ở x = −8,5…−9,5 (gùi).

Sửa (`game/js/sprite_custom.js`): bảng **`SC.TAY_DON['<key>-<bộ>'][atk_bow|atk_spear|atk_hammer]`** (cùng dạng `TAY_KIEM`: số điểm ảnh
từng khung để tự thôi khi ảnh đổi + nắm tay từng khung); `tayBang` dùng nó cho thân bộ ở các hàng đó (thân gốc không đổi; tắt cùng
`?donvk=0`). 54 khung của 3 thân bộ Cu Tí đều lấy tay từ bảng (`bang-do`). Đo bằng `tay-don/tay_don.py <key> <bộ>` (in sẵn bảng để dán
+ ảnh soát `tay-don/tay-<key>-<bộ>.png`, vòng đỏ = nắm tay) rồi sửa tay khung máy đo sai: búa lấy đà giơ tay (Rừng khung 1 →
(9; −21), Biển khung 1 → (9; −17), Lâu khung 3 tay giơ sau đầu → (−7; −22)), búa tay chụm ở ngực (Rừng 2, Biển 2, Lâu 1).
**Nhập tấm mới cho em bé khác: chạy thêm `tay_don.py`, soát ảnh, dán bảng** (cạnh dòng `TAY_KIEM` của `nhap.py`).

Kiểm bản hai tệp (`tay-don/kiem_tay.py`: trước = bản 6f71aa9 dựng ở worktree riêng, cổng 8791; sau = bản này, cổng 8790; 4 vũ khí ×
đứng, chạy, đánh 6 nhịp, chạy+đánh, giữ lấy đà 3 mức, chưởng, trúng): 0 pageerror, vũ khí không rời thân, không nhảy cỡ; nay cung
không còn vẽ trên đầu, giáo/búa không còn mọc sau lưng (ảnh, trên = trước, dưới = sau, hàng kiếm không đổi):
[Rừng](tay-don/anh/truoc-sau-smith-rung.png) · [Biển](tay-don/anh/truoc-sau-smith-bien.png) · [Lâu Đài](tay-don/anh/truoc-sau-smith-lau.png).
Còn: búa lấy đà giơ trước mặt (khung 1 Rừng/Biển) vẫn đè một phần mặt theo luật chung `G.VK_NE_MAT` (như thân gốc).

## Đợt 2 — Cu Tèo Biển, Cu Tèo Lâu Đài, Cu Lì Rừng, Cu Lì Lâu Đài (12/10)

Nhập 4 tấm mới trong `docs/anh-goc/2026-10-12/than-bo/` (4/12 Cu Tèo Rừng, 8/12 Cu Lì Biển chưa có ảnh khi chạy). Cu Tèo, Cu Lì
mặc đủ bộ Hang Biển / Lâu Đài (Cu Tèo) hoặc Rừng Già / Lâu Đài (Cu Lì) nay đánh bằng 5 hàng đòn riêng như Cu Tí. Code game chỉ thêm
4 khoá `SC.TAY_KIEM`; không đụng đường vung kiếm, trường `khung`, dấu tạm tắt thân bộ Cái Bống. Không đổi gameplay.

**`nhap.py` thêm 2 tuỳ chọn:**

- `--vung y0,y1[,x0,x1]`: chỉ cắt trong vùng lưới (điểm ảnh gốc) — bỏ dải hình tham chiếu ở trên / dải thừa dưới lưới. Nên đặt vùng
  **đúng trên vạch kẻ ngoài cùng** (nếu chừa lề trắng, viền lưới bị giữ lại thành nét đen trong khung).
- `--tu-do`: lưới kẻ không đều — mọi vạch hàng tìm được là biên hàng, mỗi hàng tự dò vạch cột của riêng hàng đó.

| Tệp | Lệnh | Xử lý |
|---|---|---|
| `em-be-hunter-bien-don` | `nhap.py hunter bien --vung 258,998,13,1524` | bỏ dải 2 hình tham chiếu (trên, nền trắng); lưới 8×5 đều |
| `em-be-hunter-lau-don` | `nhap.py hunter lau --vung 209,1024 --tu-do` | bỏ hàng tham chiếu; cột rộng hẹp khác nhau (biên 0, 223, 426, 633, 840, 1048, 1279) — cắt theo vạch thật |
| `em-be-wrestler-rung-don` | `nhap.py wrestler rung --vung 0,985` | đúng 8×5; bỏ dải thừa 40 điểm ảnh dưới lưới |
| `em-be-wrestler-lau-don` | `nhap.py wrestler lau --vung 0,993` | như trên; hàng chưởng khung 2 tay giơ cạnh đầu — giữ |

- **Thứ tự hàng** xác nhận bằng mắt cả 4 tấm: kiếm, cung, giáo, búa, chưởng (hàng búa có khung giơ tay / nện thấp; giáo vươn tay xa
  hơn cung). Không tấm nào vẽ sẵn vũ khí / cầu lửa → không cần `--xoa-cung` / `--xoa-cau`.
- **Màu nền**: chỉ xoá xanh lá rực nối mép ô — tóc trắng của Cu Lì, lá xanh rêu bộ Rừng, tóc xanh lá của Cu Tèo còn nguyên (xem ảnh tấm).
  Da Cu Lì thân bộ là da đào (không `--tim`).
- **Cỡ / chân**: cao khung đứng đầu các hàng đòn = khung đứng thân bộ (58–59 nét ×2); đáy chân 89–91 mọi khung; khung nện búa / khung
  ngồi cuối hàng thấp hơn như tệp đòn thân gốc (Cu Tèo Lâu Đài: khung 6 mọi hàng là thế ngồi thụp 43–49). Không nhảy cỡ khi đổi trạng thái.
- **Nắm tay kiếm** (`SC.TAY_KIEM` khoá `hunter-bien`, `hunter-lau`, `wrestler-rung`, `wrestler-lau`): máy đo của `nhap.py` bắt nhầm
  cằm ở nhiều khung, và mũ / áo cam bộ Lâu Đài cùng màu da nên máy không phân được → đặt tay theo ảnh lưới toạ độ (vòng đỏ = số đã
  dùng): khung giơ tay qua đầu Cu Tèo Biển khung 6 → [-5, -22], Cu Tèo Lâu Đài khung 5 → [-3, -26]; còn lại nắm tay trước bụng / ngực.
  Trong trang: 24/24 khung kiếm của 4 thân lấy tay từ bảng (`nguon = 'bang-do'`).

Kiểm bản HAI TỆP (`LK_HAI_TEP=1 python3 game/build.py --hai-tep`, `srv2.py`, `linh-khi-nhe.html?cloud=0`, `kiem/kiem.py`):
4 thân bộ ghép đủ 12 hàng, 4 vũ khí × 14 tư thế + chưởng: 0 lỗi vẽ, vũ khí ở nắm tay, không che mặt; chơi thật ải 1-1 mặc đủ bộ
× 4 vũ khí (bot đánh): thân `em-be-<key>-<bộ>`, tệp đòn đã ghép; **0 pageerror**. `cloud_save_regression` đạt; `python3 game/build.py`
dưới trần (trang 0,87 / 1,5 MB nén, ảnh 20,83 / 26 MB).

Lưu ý hình (giống đợt 1, do máy đo tay chung `doTay`, không sửa phiên này): khung thế đứng / thế ngồi cuối hàng cung (Cu Tèo Lâu Đài
khung 6, Cu Lì Lâu Đài khung 1, 6) cây cung đặt ở tay sau, sau lưng — không che mặt, chỉ ở khung đầu / cuối đòn.

Ảnh (phóng ×3; hàng: kiếm, cung, giáo, búa; cột: đứng, chạy, 6 khung đòn, chạy + đánh, giữ lấy đà 3 mức, chưởng 2 khung):
[Cu Tèo Biển](anh/hunter-bien-sau-x3.png) · [Cu Tèo Lâu Đài](anh/hunter-lau-sau-x3.png) ·
[Cu Lì Rừng](anh/wrestler-rung-sau-x3.png) · [Cu Lì Lâu Đài](anh/wrestler-lau-sau-x3.png)

- Tấm đã nhập: [hunter-bien](anh/hunter-bien-don-tam.png) · [hunter-lau](anh/hunter-lau-don-tam.png) ·
  [wrestler-rung](anh/wrestler-rung-don-tam.png) · [wrestler-lau](anh/wrestler-lau-don-tam.png)
- Nắm tay kiếm: [hunter-bien](anh/hunter-bien-tay-kiem.png) · [hunter-lau](anh/hunter-lau-tay-kiem.png) ·
  [wrestler-rung](anh/wrestler-rung-tay-kiem.png) · [wrestler-lau](anh/wrestler-lau-tay-kiem.png)

Còn thiếu ảnh: 4/12 Cu Tèo Rừng, 8/12 Cu Lì Biển, 10–12 thân bộ Cái Bống.
