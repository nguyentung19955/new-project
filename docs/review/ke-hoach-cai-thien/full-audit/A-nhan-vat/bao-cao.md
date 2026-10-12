# Rà soát toàn bộ — Phần A: nhân vật, trang bị, animation, sprite sheet (12/10/2026)

Phạm vi: mục 1 và 2 của `../YEU-CAU.md`. Phần hiệu ứng chiến đấu (B) và giao diện + bản đồ (C) do phiên khác làm.
Không làm lại việc của các phiên sửa cùng mảng hôm nay (tay-kiem-mat, dang-chay, vet-chem, trang-phuc, nhap-anh-12-10/-b, cai-bong,
pha-trum, ho-tinh-pha, don-cu-ti-cu-teo); phiên này kiểm lại kết quả của các phiên đó và mở rộng ra mọi em bé × thân × vũ khí × trạng thái.

## 1. Cách kiểm (đo bằng máy, không đoán)

| Công cụ (thư mục `kiem/`) | Kiểm gì |
|---|---|
| `do_khung.py` + `phan_tich.py` | Đọc thẳng **70 tấm sprite có hoạt ảnh** (20 thân em bé + 4 tấm đòn, 33 quái/trùm nhỏ, 3 trùm × 3 pha, 7 người làng): từng khung đo đáy chân, đỉnh, tâm x, chân x so với điểm gốc; khung rỗng, khung vượt ảnh, khung chạm mép ô (bị cắt), khung trùng khung trước; nhảy vị trí trong hàng và khi đổi trạng thái (đứng → hàng khác). Kết quả: `kiem/khung-quai-em-be.txt` |
| `bang.py` | Bảng tiếp xúc phóng to từng hàng, vạch đỏ = đường chân, vạch xanh = điểm gốc |
| `quet_em_be.py` + `phan_tich_em_be.py` + `tong_mat.py` | Vẽ bằng chính hàm game `G.art.hero` trên **bản hai tệp như web**: 4 em bé × 4 thân (gốc, Rừng, Biển, Lầu) × 4 vũ khí × hai hướng × 2 bộ đồ × **37 tư thế** (đứng 3, chạy 8 khung, đánh 6, chạy+đánh, giữ lấy đà 3, chưởng 2, chiêu 3, lộn 5, trúng 2, chết 4) = **6 512 ô**. Mỗi ô vẽ 4 lần (đủ đồ / chỉ thân / thân + vũ khí / thân + đồ) rồi lấy hiệu ảnh: vũ khí hay đồ đè lên **đĩa mặt tự đo** (`SC.matKhung`), vũ khí / đồ lơ lửng không chạm thân, mất vũ khí, nhảy vị trí giữa các khung liền nhau |
| `ve_o.py`, `o.py` | Phóng to từng ô để nhìn tận mắt các ô máy báo |
| `anh_truoc_sau.py` | Ảnh trước / sau: "trước" = mở game với `?mulun=0&vknemat=0&dauthat=0` |
| `choi.py` | Chơi thật ải Rừng già 1 bằng bot, vẽ màn hình thật, 4 em bé × 4 vũ khí |
| `srv2.py`, `dung_lai.sh` | `srv.py` của kiem-thu-12-10 không phục vụ thư mục `anh/` của bản ảnh rời (lấy basename) → bản sao phục vụ được cả `anh/*.webp`; gói lại + khởi động lại máy chủ |

## 2. Danh sách lỗi theo mức độ

### Nghiêm trọng (thấy ngay khi chơi)
| # | Lỗi | Nhóm | Tệp | Nguyên nhân gốc | Trạng thái |
|---|---|---|---|---|---|
| A1 | **Giáo dựng đứng xuyên giữa mặt** khi đứng (41/41 ô đứng cầm giáo, cả 4 em bé, mọi thân); chạy cầm giáo cán đi ngang mặt 74/107 | render/layer | `js/hero_tinhlinh.js` (`kiemKhop`, `vkGhep`) | Luật né mặt của phiên tay-kiem-mat chỉ áp cho **kiếm lúc đang đánh**; lúc đứng/chạy, vũ khí theo góc khung xương code (giáo thẳng đứng, kiếm dựng) và luôn vẽ TRƯỚC thân, bám vào bàn tay AI ở ngang ngực → cán/lưỡi đi qua mặt | **Đã sửa** |
| A2 | **Kiếm dựng trước mũi** khi đứng (41/41), khi chạy 96/107; **đầu búa đè mặt khi chạy** 105/107 | render/layer | như trên | như trên | **Đã sửa** (còn 12 / 23 / 24 ô chỉ chạm cằm hoặc mép má, xem mục 4) |
| A3 | **Nón lá như "hai tầng đầu"**: chóp nón nằm hẳn trên đỉnh tóc, bên dưới là dải quai đen–đỏ ngang đỉnh đầu trông như mặt nạ mắt đỏ (cả 4 em bé, mọi tư thế) | sprite/asset (số neo) | `art/custom/tp-hats-non_la.sprite.json` (nhập 12/10) | Điểm `dinh_dau` của ảnh nón đặt ở y = 8 trong khi đáy chóp nón ở 7,5 → đỉnh đầu nằm **dưới** chóp; quai trong ảnh chỉ là vòng ngắn dưới vành, không tới cằm | **Đã sửa** |
| A4 | **Mũ, khăn chụp xuống che mắt khi chưởng / ra chiêu** (Cu Lì: khăn xếp, nón lá che hẳn mắt ở cả 6 khung chưởng; Cái Bống, Cu Tèo lệch 2–2,5 điểm ảnh) | animation (điểm ghép) | `art/custom/ghep-*.sprite.json` (điểm `cast:*`), `js/sprite_custom.js` | Điểm đỉnh đầu của hàng chưởng trong tệp ghép không khớp đầu đang vẽ: Cu Lì chưởng vẽ đầu cao hơn khung đứng ~5–6 điểm ảnh mà điểm vẫn ở −25 | **Đã sửa** (hệ chung, không sửa tay từng tệp) |
| A5 | **Heo Rừng Con (quái đầu tiên của game)**: chân bị cắt cụt ở hàng chạy, đánh, trúng đòn; chân của hàng chạy rơi sang mép trên ô hàng lấy đà (thấy mẩu chân lơ lửng trên đầu heo lúc lấy đà); chân lún 3–6 điểm ảnh dưới bóng | sprite (toạ độ cắt) | `art/custom/heoCon.sprite.json` | Lưới cắt dọc lệch: nội dung mỗi hàng dời xuống 2–5 điểm ảnh so với ô (mọi quái khác chân ở +1) | **Đã sửa** |

### Trung bình
| # | Lỗi | Tệp | Nguyên nhân | Trạng thái |
|---|---|---|---|---|
| A6 | Mũ sừng, mũ vây cá, mũ tai cáo, mũ da cá, khăn đá lửa, vòng lá, khăn xếp **ngồi trên đỉnh tóc** (chỉ phủ 1–2,5 điểm ảnh đầu) | `tp-hats-*.sprite.json` | cùng nguyên nhân A3: điểm `dinh_dau` sát mép dưới mũ | **Đã sửa** (độ lún 2,5–4,5, mép dưới mũ vẫn trên mắt) |
| A7 | Búa lúc lấy đà / giữ lấy đà giơ qua đầu đè lên đầu | `hero_tinhlinh.js` | như A1 | **Sửa một phần**: búa ngả ra sau đầu tối đa 60°; khung mà ngả cũng chạm mặt thì giữ như cũ (vẽ sau thân thì búa khuất hẳn sau đầu lúc giữ lấy đà lâu — tệ hơn) |
| A8 | Thân theo bộ (Rừng/Biển/Lầu, 12 tấm) **không có hàng đòn theo vũ khí** (atk_sword/bow/spear/hammer, cast): mặc áo bộ thì 4 vũ khí cùng một động tác vung chung; giữ lấy đà cung dùng hàng `tele` (ngồi thụp) nên **cung khuất sau người** (Cu Tí, Cu Tèo thân Lầu) | asset thiếu | `em-be-*-{rung,bien,lau}` | thiếu ảnh | **Chưa xử lý** — cần ảnh mới (mục 6) |
| A9 | Lúc chết, khung đầu (0,2 s) vũ khí còn dựng đứng trên tay khi thân đã ngã | `hero_tinhlinh.js` (khung xương code `die`) | góc vũ khí theo khung xương code, thân AI ngã nhanh hơn | **Chưa xử lý** (thấy 0,2 s; sửa cần đổi đường vũ khí lúc chết, để phiên sau) |

### Nhẹ
| # | Lỗi | Tệp | Trạng thái |
|---|---|---|---|
| A10 | Khung trùng khung trước (đứng hình 1 nhịp): Cu Lì thân Biển hàng đánh khung 2; Sóc Nổ đánh khung 2, chết khung 2 và 6; Hồ Tinh pha 2 đánh khung 6 | ảnh AI | **Chưa xử lý** — prompt mục 6 |
| A11 | Ông Từ (`nl-tu`) hàng đứng khung 3 lật chổi sang bên kia, thân lệch 8 điểm ảnh | ảnh AI | **Không ảnh hưởng hiện tại**: người làng đang đứng yên một khung (`G.NL_DONG` tắt). Bật lại hoạt ảnh thì phải gen lại khung này |
| A12 | Chóp ngọn (đèn lồng Hồ Tinh pha 1, vây đầu Ngư Tinh pha 2) chạm mép trên ô ở vài khung — có thể cụt ≤ 1 điểm ảnh | ảnh AI | **Chưa xử lý** (gần như không thấy) |
| A13 | Lúc lộn, bùa đeo hông (bùa hút máu) chĩa ra khỏi quả bóng như cái râu | `hero_tinhlinh.js` / `tinhDatMon` | **Chưa xử lý** (0,4 s, nhỏ) |
| A14 | Cái Bống hàng chạy: khung bật bước A cao hơn bước B 0,5 điểm ảnh (phiên dang-chay đã chỉnh, còn dư) | ảnh | Bỏ qua (dưới 1 điểm ảnh game) |

### Đã kiểm, KHÔNG có lỗi
- Kích thước khung, số khung, toạ độ cắt mọi tấm (trừ Heo Rừng Con): không khung rỗng, không vượt ảnh.
- Điểm chân (anchor): mọi quái, trùm (3 pha cùng điểm chân), người làng, 20 thân em bé nằm trên đường chân ±1 (trừ Heo Rừng Con).
- Lật trái/phải: số đo hai hướng đối xứng (độ dời đổi dấu, không lệch thêm) ở cả 6 512 ô.
- Không có vũ khí hay đồ lơ lửng (cách thân > 2 điểm ảnh) ở ô nào; không mất vũ khí trừ A8.
- "Nhảy vị trí" máy báo khi đổi trạng thái (chạy → đánh dời 3 điểm ảnh, trúng → chết dời 4,5, Hổ Lửa / Cua Đá vồ dời 5–7) là dáng vẽ chủ ý (ngả người, lao tới), không phải lệch neo; khung bật trong hàng chạy (đáy −3..−4) là bước nhảy của dáng chạy mới.
- Thứ tự lớp kiếm khi chém, bàn tay nắm chuôi, vệt chém (phiên tay-kiem-mat): kiểm lại trên bản đã gộp — giữ nguyên, không đổi.

## 3. Đã sửa (3 cờ mới, đều sửa ở hệ ghép dùng chung, tắt được)

1. **`G.VK_NE_MAT`** (`js/hero_tinhlinh.js`, tắt `?vknemat=0`): mở rộng luật né mặt `kiemKhop` sang **giáo, búa** và sang **đứng, chạy, trúng đòn**:
   - đứng / chạy / trúng: cán hoặc lưỡi đi qua đĩa mặt → nghiêng vũ khí về phía trước từng 5° (tối đa 50°), không được thì ngả ra sau (tối đa 45°), vẫn không được thì vẽ sau thân;
   - giáo, búa lúc đánh / giữ / chiêu: không xoay hướng đòn đâm; chỉ khi chạm mặt mới ngả ra sau đầu (tối đa 60°); giáo vẫn chạm thì vẽ sau thân, búa thì giữ như cũ;
   - bề dày tính va chạm theo vũ khí (kiếm 1,5, giáo 2, búa 3 điểm ảnh); kiếm lúc đánh **y hệt** phiên tay-kiem-mat.
   Không đổi đòn, tầm, vùng trúng, thời gian, vệt chém lúc đánh của kiếm.
2. **`G.MU_LUN`** (`js/sprite_custom.js`, tắt `?mulun=0`): bảng `SC.MU_LUN` đặt lại điểm đỉnh đầu của 8 ảnh mũ (nón lá 4,5; khăn xếp 4; mũ sừng 8,5; vòng lá 3,5; mũ da cá 8; khăn đá lửa 3,5; mũ vây cá 9; mũ tai cáo 9) và cắt dải quai dưới vành nón lá. Chỉ áp khi ảnh đúng cỡ đã đo — nhập ảnh mũ mới khác cỡ thì tự thôi. Mũ rơm đã đạt, giữ nguyên.
3. **`G.DAU_THAT`** (`js/sprite_custom.js`, tắt `?dauthat=0`): bọc `SC.diemKhung` — ở hàng chưởng, đánh, lấy đà, trúng đòn: so đĩa mặt tự đo của khung với khung đứng 0; điểm đầu (đỉnh đầu, tâm đầu, mắt, gáy) lệch dọc quá 1,5 điểm ảnh thì dời theo đầu thật (tối đa 6). Bỏ qua khi đĩa đầu đo không chắc (bán kính < 85% khung đứng, ví dụ Cu Lì trúng đòn khung 3 đầu ngả) và ở đứng/chạy/lộn/chết. Mũ, mặt nạ bám đúng đầu ở mọi khung chưởng.
4. **Heo Rừng Con** (`art/custom/heoCon.sprite.json`): `kiem/cat_lai_hang.py` tìm 6 dải hình theo chiều dọc, đặt lại từng dải vào đúng ô của hàng với chân ở y = gốc + 1 như mọi quái (dời −2, −5, −1, −3, −3, +1 điểm ảnh). Không vẽ lại, không co giãn, không đổi cỡ ô, điểm gốc, hitbox.

## 4. Kết quả trước / sau (số đo, bản hai tệp)

Ô có vũ khí đè > 25% đĩa mặt (thân gốc, hướng phải, bộ đồ 1; `kiem/mat-che-truoc.txt` → `kiem/mat-che-sau.txt`):

| Vũ khí · trạng thái | Trước | Sau |
|---|---|---|
| Giáo · đứng | 41/41 | **1/41** |
| Giáo · chạy | 74/107 | **0/107** |
| Giáo · giữ lấy đà | 36/36 | 16/36 |
| Giáo · đánh | 81/88 | 63/88 (xem ghi chú) |
| Kiếm · đứng | 41/41 | **12/41** (chỉ chắn tay chạm cằm) |
| Kiếm · chạy | 96/107 | **23/107** |
| Búa · chạy | 105/107 | **24/107** |
| Búa · đánh, giữ | 67/88, 12/36 | 67/88, 12/36 (A7) |
| Cung (mọi trạng thái) | 36 | 36 (cung để sau thân, máy đếm cả dây cung — nhìn ảnh không che) |
| Đồ (mũ…) che mặt | 40 | 28 — **còn lại toàn là bộ đồ 2 có mặt nạ** (mặt nạ che mặt là đúng) và vài khung chết/trúng khung đầu |

Ghi chú: đĩa mặt máy đo rộng (gồm cả cằm, má); ở các ô "đánh" giáo/kiếm còn bị đếm, nhìn ảnh phóng to thấy lưỡi đi ngang cằm/ngực, mặt vẫn rõ
(`anh/vu-khi-truoc-sau.png`). Không ô nào mới bị che sau khi sửa (so tập hợp ô, chỉ 1 ô Cu Tí thân Rừng chạy+đánh giáo mới vượt ngưỡng ở mức chạm cằm).

Ảnh (nén, mỗi tấm < 40 KB):
- `anh/vu-khi-truoc-sau.png` — giáo, kiếm đứng; búa, giáo chạy; búa giữ lấy đà.
- `anh/mu-dung-truoc-sau.png` — 5 mũ trên Cu Tí và Cái Bống (nón lá hết "hai tầng", hết dải quai mắt đỏ).
- `anh/mu-chuong-truoc-sau.png` — Cu Lì chưởng/chiêu đội khăn xếp, nón lá (trước che mắt), Cái Bống, Cu Tèo chưởng.
- `anh/heo-con-truoc-sau.png` — bảng hàng Heo Rừng Con (vạch đỏ = đường chân).

Kiểm thử:
- `node --check` mọi `game/js/*.js`: đạt. `node game/tests/cloud_save_regression.test.js`: PASS. `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep`: chạy được.
- `game/tests/anim_smoke.py` (5 ải, ~81 000 khung vẽ): `errors []`.
- Quét 6 512 ô trên bản hai tệp (`linh-khi-nhe.html?cloud=0`) trước và sau, và lại sau khi gộp với nhánh mới nhất (Rà soát B, C, Lực chiến): **0 pageerror**, 0 ô lỗi vẽ.
- Chơi thật ải Rừng già 1 (bot, rAF thật, 4 em bé × 4 vũ khí): **0 pageerror**.
- Không đụng đăng nhập Google, lưu mây, `?cloud=0`. Không có ảnh custom (thân code) thì `kiemKhop` không chạy (cần thân AI) và `muLun` chỉ áp lên ảnh mũ có thật → như trước.

## 5. Vùng chưa kiểm đủ

- **Em bé thân code** (khi chưa nạp ảnh AI) và Xưởng Sprite / trang công cụ: không quét (game web luôn có ảnh AI).
- **Mặt nạ** và **cánh cấp 1, 2** mới thử 1 món mỗi loại trong bảng quét; cánh cấp 3 lửa và cánh chuồn chuồn cấp 1 có trong quét. Phiên trang-phuc đã kiểm từng món ở 4 tư thế.
- **Vũ khí theo bậc**: quét dùng một dòng mỗi loại (kiếm dòng 3, cung 2, giáo 1, búa 3). Vũ khí bậc cao dài hơn có thể còn chạm mặt ở vài khung — luật né mặt tính theo chiều dài thật của từng ảnh nên vẫn áp, nhưng chưa chụp đủ 40 dòng.
- **Quái/trùm khi ở trong trận** (màu nhuộm trạng thái, chớp trúng đòn, chuyển pha): chỉ đo trên tấm sprite và nhìn bảng; chuyển pha trùm đã có phiên pha-trum kiểm.
- **Chiêu đặc biệt từng loại** (Trảm Nguyệt…): dùng nhịp `specT` chung; hiệu ứng chiêu thuộc phiên B.
- Hàng chém kiếm vẽ lại của Cu Tí, Cu Tèo, Cu Lì được phiên khác nhập (commit `6500406`) trong lúc phiên này chạy. Sau khi gộp: quét lại 6 512 ô (0 pageerror; số ô che mặt của kiếm lúc chém không đổi: 45/87) và nhìn phóng to 6 ô chém có đội mũ (nón lá, khăn xếp, mũ tai cáo) — mặt rõ, mũ bám đầu. Chưa đo lại từng khung hàng mới bằng bảng tiếp xúc.

## 6. Khung cần gen lại (code không cứu được)

Ảnh tham chiếu đánh dấu đỏ: [`tham-chieu-khung-can-ve-lai.png`](tham-chieu-khung-can-ve-lai.png). Đếm khung từ trái sang, từ 1.

| Đối tượng | Tệp / hàng | Khung | Lỗi |
|---|---|---|---|
| Cu Lì thân Biển | `em-be-wrestler-bien`, hàng 4 (đánh) | 2 | trùng y hệt khung 1 |
| Sóc Nổ | `socNo`, hàng 4 (đánh) | 2 | trùng khung 1 |
| Sóc Nổ | `socNo`, hàng 6 (chết) | 2, 6 | trùng khung trước |
| Hồ Tinh pha 2 | `hoTinh-p2`, hàng 3 (đánh) | 6 | trùng khung 5 |
| Ông Từ | `nl-tu`, hàng 1 (đứng) | 3 | lật chổi, lệch người (chỉ cần nếu bật lại hoạt ảnh người làng) |
| 4 em bé × 3 thân bộ | `em-be-<em>-{rung,bien,lau}` | (cả tấm mới) | thiếu hàng đòn theo vũ khí + chưởng (A8) |

**Prompt — Cu Lì thân Biển, hàng đánh khung 2:**
> Ảnh gửi kèm là hàng đánh 6 khung của bé Cu Lì mặc bộ Hang Biển (pixel art chibi, nhìn nghiêng sang phải). Khung 2 (viền đỏ) đang y hệt
> khung 1. Chỉ vẽ lại khung 2: động tác ở giữa khung 1 và khung 3 (thân bắt đầu xoay tới, tay trước đưa ra trước ngang ngực, tay không
> cầm vũ khí). Mặt nhìn rõ, tay không che mặt. Giữ nguyên nhân vật, bộ đồ, màu, viền đen, cỡ người, vị trí chân như các khung còn lại.
> Nền xanh lá trơn #00ff00, ô 48×48 như ảnh gốc, xuất riêng khung đó.

**Prompt — Sóc Nổ, hàng đánh khung 2 và hàng chết khung 2, 6:**
> Ảnh gửi kèm là hai hàng của quái Sóc Nổ (pixel art, nhìn nghiêng sang phải): hàng đánh 6 khung và hàng chết. Các khung viền đỏ đang
> trùng khung đứng trước nó. Vẽ lại riêng các khung đó: hàng đánh khung 2 là lúc rướn người lấy đà (giữa khung 1 và 3); hàng chết khung 2
> là lúc ngả ra sau, khung 6 là lúc nằm gần sát đất (giữa khung 5 và 7). Giữ nguyên con sóc, màu, viền, cỡ, đường chân như các khung khác.
> Nền xanh lá trơn #00ff00, đúng cỡ ô như ảnh gốc.

**Prompt — Hồ Tinh pha 2, hàng đánh khung 6:**
> Ảnh gửi kèm là hàng đánh 6 khung của Hồ Tinh pha 2 (cáo chín đuôi mắt tím, khí lam tím, pixel art nhìn nghiêng sang phải). Khung 6 đang
> trùng khung 5. Vẽ lại khung 6 là lúc thu đòn về: lửa đuôi tắt dần, thân trở về gần dáng đứng của khung 1. Giữ nguyên cỡ thân, điểm chân,
> màu, viền như các khung khác. Nền hồng tím trơn như ảnh gốc, đúng cỡ ô.

**Prompt — Ông Từ, hàng đứng khung 3 (chỉ khi muốn người làng có hoạt ảnh):**
> Ảnh gửi kèm là hàng đứng 6 khung của Ông Từ (ông cụ đội nón, cầm chổi, pixel art nhìn nghiêng sang phải). Khung 3 (viền đỏ) bị lật chổi
> sang bên phải và lệch người. Vẽ lại khung 3 giống khung 2 (chổi chéo ở bên trái người, người đứng giữa ô), chỉ khác nhịp thở nhẹ.
> Giữ nguyên nhân vật, màu, viền, cỡ, vị trí chân. Nền xanh lá trơn #00ff00, đúng cỡ ô.

**Prompt — hàng đòn theo vũ khí cho thân bộ (A8, mỗi em bé × mỗi bộ một tấm, làm sau nếu muốn):**
> Ảnh gửi kèm: (1) tấm đòn theo vũ khí của bé <tên> thân gốc (5 hàng × 6 khung: chém kiếm, bắn cung, đâm giáo, nện búa, chưởng), (2) tấm
> thân bé <tên> mặc bộ <Rừng Già / Hang Biển / Lâu Đài>. Vẽ lại ĐÚNG 5 hàng × 6 khung động tác của tấm (1) nhưng mặc bộ đồ của tấm (2).
> Tay không cầm vũ khí (game vẽ vũ khí). Tay không che mặt; tay sau thấy một phần, có viền đen tách khỏi thân. Giữ cỡ người, vị trí chân,
> nét, bảng màu như tấm (2). Nền xanh lá trơn #00ff00, ô 48×48.

## 7. Tệp đã đổi

- `game/js/hero_tinhlinh.js` — `kiemKhop` (G.VK_NE_MAT).
- `game/js/sprite_custom.js` — `SC.MU_LUN` + `muLun` (G.MU_LUN), bọc `SC.diemKhung` (G.DAU_THAT).
- `game/art/custom/heoCon.sprite.json` — cắt lại hàng.
- `game/dist/*` gói lại.
- Thư mục này: báo cáo, `anh/`, `tham-chieu-khung-can-ve-lai.png`, `kiem/` (công cụ đo + số đo).

## 8. Bổ sung — lần chạy thứ hai (cùng nhiệm vụ A, chạy song song; 12/10 chiều)

Một phiên thứ hai được giao cùng phần A và chạy song song với lần đầu. Khi lần đầu đã đẩy lên (13554f6, 33cabf2), lần hai **bỏ phần trùng**
(né mặt giáo/kiếm lúc đứng–chạy, Heo Rừng Con) và chỉ giữ những gì lần đầu chưa có, viết đè lên code của lần đầu. Công cụ: `kiem/lan2/`.

### 8.1 Cách kiểm thêm
- `kiem/lan2/em_be.py`: 4 em × 4 thân × **86 tư thế** (đứng 6, chạy 8, lộn 8, kiếm 3 nhát × 4 thời điểm, cung/giáo/búa × 6, giữ lấy đà 4 vũ khí × 3 mức,
  chiêu, chưởng, trúng, chết 6, chạy+chém) × 2 hướng = 1 376 khung; mỗi khung vẽ thân trần / có vũ khí / **từng món** đồ (13 mũ, 6 đồ lưng, 8 bùa,
  4 cánh × 3 cấp). Đo: lật trái/phải, vũ khí đè vùng đầu, **đồ thấp hơn mặt đất**, đồ lệch so với đầu/mình. Kết quả `ket-qua-em-be-truoc.json.gz`
  (= bản hiện tại với 3 cờ mới tắt) và `-sau.json.gz`.
- `chup.py`: ảnh trước/sau trên cùng tấm (trên = SAU, dưới = TRƯỚC). `quai.py`: vẽ quái bằng `SC.veQuai` có bóng.
- `do_tinh.py`, `manh_mep.py`, `do_than.py`: đo tĩnh 69 tấm (đối chiếu với `kiem/khung-quai-em-be.txt` của lần đầu: khớp).
- Kiểm **10 dòng** mỗi loại vũ khí lúc đứng (lần đầu chỉ dùng 1 dòng mỗi loại) → ra lỗi A15, A16.

### 8.2 Lỗi thêm (lần đầu chưa có)
| # | Lỗi | Nhóm | Tệp | Nguyên nhân gốc | Trạng thái |
|---|---|---|---|---|---|
| A15 | **Bùa đeo hông cắm xuống đất** giữa hai chân 2–4 điểm ảnh khi ngồi thụp (giương cung, nện búa, giữ lấy đà, chiêu, chưởng): **76 khung** (bùa hút, linh, đá lửa, nanh rắn, vỏ ốc, tàn lửa… × 4 em bé) | render | `js/sprite_custom.js` (`tinhDatMon`) | bùa treo từ điểm eo với chiều dài cố định, eo hạ thấp khi ngồi thụp mà không có giới hạn mặt đất | **Đã sửa** (`G.BUA_TREN_DAT`) |
| A16 | **Bút Lông (giáo dòng 9) bé tí** (ảnh dài 27, giáo khác 37–52: co xong chỉ thò khỏi nắm tay ~6 điểm ảnh, như tay không); cung dòng 7 nhỏ (dài 9, cung khác 11–20) | sprite (tỉ lệ) | `js/sprite_custom.js` (`coVk`) | mọi món cùng loại co chung một hệ số | **Đã sửa** (`G.CO_VK_DONG`) |
| A17 | Đao/kiếm **bản to** (dòng 1, 3, 5, 6, 7, 8, 9) lúc đứng vẫn che nửa mặt sau lần đầu: bề dày lưỡi tính cố định 1,5 điểm ảnh nên máy cho là "không chạm" | render | `js/hero_tinhlinh.js` (`kiemKhop`) | bề dày cố định | **Đã sửa** (`G.VK_KHOP`) |
| A7′ | Búa lấy đà / giữ lấy đà (A7 của lần đầu, "sửa một phần"): Cu Tí, Cu Tèo, Cái Bống đầu búa vẫn đè mặt vì ngả ra sau 60° vẫn chạm | render | như trên | chỉ thử một phía | **Đã sửa thêm** cho thân gốc (`G.VK_KHOP`); thân bộ còn (A18) |
| A18 | Thân bộ (nhất là **Lầu**, mũ trùm cáo): búa lấy đà, giáo đứng vẫn qua mặt | render | `js/sprite_custom.js` (`SC.matKhung`) | vùng mặt máy tự đo trên thân bộ (mũ trùm to, hàng "atk"/"tele" chung) lệch | **Chưa sửa** — cần bảng đo tay vùng mặt cho 12 thân bộ (như `SC.TAY_KIEM`); hoặc có hàng đòn riêng (A8) |
| A19 | **Cua Đá** (trùm nhỏ) đứng thở: khung 1 vẽ khác 5 khung còn lại (đỉnh mai lệch 4–5 điểm ảnh) → mỗi vòng thở giật một cái | animation (ảnh) | `cuaDa` hàng đứng | ảnh AI | Cần gen lại 1 khung |
| A20 | **Ngư Tinh** (trùm vùng) đi: khung 1 khác hẳn (đầu thấp, mất mỏ neo, tâm lệch 5,6) → mỗi vòng đi giật | animation (ảnh) | `nguTinh` hàng đi | ảnh AI | Cần gen lại 1 khung |
| A21 | Heo Rừng Con sau khi lần đầu cắt lại: hàng chạy khung 3 chạm mép trên ô, 2 mẩu bụi rời ở khung 3–4 (≤ 15 điểm ảnh nét) | sprite | `heoCon` | — | Rất nhẹ, bỏ qua |
| A22 | Hồ Tinh pha 1 (= A12): đỉnh đèn lồng / ngọn lửa chạm mép trên ở 14 khung | sprite | `hoTinh` | ô 208×128 thấp hơn hình sau khi phóng ×1,6 | Đề xuất: **cắt lại** (không cần gen) từ `docs/anh-goc/2026-10-12/hoTinh-pha1.png` với ô cao 136, gốc y 132 (cả pha 2, 3); ảnh đánh dấu `anh/tham-chieu-hoTinh-cat-dinh.png` |

### 8.3 Đã sửa thêm (3 cờ, mỗi cờ tắt riêng; tắt cả 3 = đúng bản lần đầu)
| Cờ | Sửa | Tệp |
|---|---|---|
| `G.VK_KHOP` (`?vkkhop=0`) | (1) bề dày lưỡi khi xét chạm mặt ước từ ảnh = diện tích / chiều dài × 60%, tối đa 3 điểm ảnh (chỉ khi `G.VK_NE_MAT` bật); (2) **búa** đang đánh / giữ lấy đà: ngả ra sau không khỏi mặt thì thử nghiêng về phía trước (tối đa 70°), vẫn vẽ trước thân nên thấy rõ búa; không áp ở hàng "tele" (thân bộ cuộn người — bản thử đầu áp cho cả giáo ở hàng này làm giáo xoay ngang qua mặt thân bộ, đã chặn) | `js/hero_tinhlinh.js` (`kiemKhop`), khai báo cờ ở `js/sprite_custom.js` |
| `G.BUA_TREN_DAT` (`= false` để tắt) | bùa hông trên thân AI: đáy bùa (sau co, xoay) thấp hơn mặt đất thì nâng lên cho đáy ở y = −1 | `js/sprite_custom.js` (`tinhDatMon`) |
| `G.CO_VK_DONG` (`= null` để tắt) | hệ số co thêm theo dòng: `{ 'spear-9': 1.45, 'bow-7': 1.35 }` (ngang món nhỏ nhất còn lại cùng loại). Chỉ là hình | `js/sprite_custom.js` (`coVk`) |

Không đổi cơ chế, sát thương, tốc độ, hitbox, tầm, thời điểm đòn; không đụng đăng nhập Google, lưu mây, `?cloud=0`; thân vẽ code (không ảnh AI) không qua các nhánh này.
Vệt chém (`js/fx.js`) không sửa: vệt đọc vị trí vũ khí qua `tip()` → `vkGhep` nên đi theo hình mới.

### 8.4 Trước / sau (bản hai tệp `linh-khi-nhe.html?cloud=0`, cùng bản, "trước" = tắt 3 cờ mới)
| Chỉ số (1 376 khung × 2 hướng, vũ khí dòng 0) | Trước | Sau |
|---|---|---|
| Khung đồ thấp hơn mặt đất | **76** | **0** |
| Khung vũ khí đè vùng đầu > 15 điểm ảnh | 144 | 118 |
| — búa đánh + giữ lấy đà, **thân gốc** | 13 | 6 |
| — búa đánh + giữ lấy đà, thân bộ | 58 | 50 (A18) |
| — đứng / chạy | 27 | 21 |
| Tổng điểm ảnh vũ khí đè vùng đầu | 7 881 | 6 572 |
| Hình quay trái lật lại lệch hình quay phải | 0 | 0 |
| pageerror (chụp 2 × 16 lượt) | 0 | 0 |

"Vùng đầu" của số đo = 42% trên của hộp thân, gồm cả tóc/mũ và (khi ngồi thụp) một phần ngực — nên số còn lại không phải đều là che mặt;
nhìn ảnh phóng to để kết luận. Ảnh:
- `anh/lan2-1-vu-khi-sau-tren-truoc-duoi.png` — 4 em bé: đứng kiếm/giáo/búa, búa lấy đà 2 thời điểm, giữ lấy đà búa (Cu Tí, Cu Tèo búa hết đè mặt).
- `anh/lan2-2-bua-dao-to-but-long-sau-tren-truoc-duoi.png` — bùa lúc giương cung / nện búa (không còn cắm đất), Bút Lông, đao bản to dòng 7, 1, 8,
  thân Rừng giữ giáo (không đổi — đúng), thân Rừng búa lấy đà.

Kiểm thử lần hai: `kiem/lan2/choi.py` chơi thật bản hai tệp 4 em × 4 vũ khí × 900 nhịp (đánh, giữ lấy đà, chiêu, lộn, chạy; vẽ 300 cảnh mỗi lượt):
**0 pageerror, 0 lỗi vẽ**, `G.spriteCustom.loi` rỗng. `node --check` mọi `js/*.js`, `node tests/cloud_save_regression.test.js` PASS,
`tests/anim_smoke.py` errors [], `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được.

### 8.5 Prompt gen lại thêm (ảnh đánh dấu đỏ trong `anh/`)
**Cua Đá — đứng thở, khung 1** (`anh/tham-chieu-cuaDa-idle-khung1.png`):
> Ảnh kèm là hàng đứng thở 6 khung của trùm Cua Đá (pixel art, nhìn nghiêng sang phải). Chỉ vẽ lại khung 1 (viền đỏ) cho giống khung 2–6:
> cùng cỡ mai đá, cùng chỗ cây và ngôi nhà nhỏ trên mai, chỉ khác nhịp thở rất nhẹ. Chân, càng, đáy chân đúng vị trí như khung 2.
> Giữ nguyên nét, màu, viền đen, cỡ ô 140×80. Nền xanh lá trơn #00ff00, xuất riêng khung đó.

**Ngư Tinh — đi, khung 1** (`anh/tham-chieu-nguTinh-move-khung1.png`):
> Ảnh kèm là hàng đi 6 khung của trùm Ngư Tinh (pixel art, quay phải). Vẽ lại khung 1 (viền đỏ) nối tiếp khung 6 và dẫn sang khung 2:
> đầu cùng độ cao, mỏ neo và xích treo bên phải như các khung còn lại, thân uốn ở giữa nhịp. Giữ cỡ, màu, viền, đường đáy như khung 2.
> Ô 180×116, nền xanh lá trơn #00ff00.

### 8.6 Vùng chưa kiểm đủ (thêm)
- Vũ khí bậc hệ (lửa/băng/độc giai đoạn 2–3) trên tay: chỉ chụp dòng thường; biến thể hệ dùng cùng điểm cầm.
- Quái trong trận thật cạnh nhau (lớp trước/sau giữa quái) — thuộc phần C bản đồ.
- Áo, mặt nạ không có trong vòng đo từng khung của `lan2/em_be.py` (lần đầu và phiên trang-phuc đã kiểm).
- Chưa kiểm trên iPhone thật (Chromium không màn hình 844×390).

Chạy lại: `LK_HAI_TEP=1 python3 game/build.py --hai-tep`, `python3 kiem/lan2/srv.py game/dist 8791 &`, rồi trong `kiem/lan2/`:
`python3 em_be.py http://localhost:8791/linh-khi-nhe.html?cloud=0 <ra>` (KEYS=smith để chạy một em; thêm đối số JS
`"() => { G.VK_KHOP = false; G.CO_VK_DONG = null; G.BUA_TREN_DAT = false; G.tinhLinh.clearCache(); }"` cho bản trước), `python3 phan_tich.py <ra>/em-be-so.json`,
`python3 choi.py http://localhost:8791/linh-khi-nhe.html?cloud=0`.
