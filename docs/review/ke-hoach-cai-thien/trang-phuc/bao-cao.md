# Phiên kiểm trang phục 12/10/2026 — mọi đồ mặc khi mặc lên em bé

Câu hỏi của chủ dự án: "các phụ kiện, áo, mũ khác đã test chưa?" Trước phiên này: **chưa**. Phiên này mặc **từng món** (mọi ô, cánh đủ 3 cấp, cả món vẽ code) lên **4 em bé thân AI gốc** (Cu Tí `smith`, Cu Tèo `hunter`, Cái Bống `healer`, Cu Lì `wrestler`) ở 4 tư thế **đứng, chạy, đánh, lộn**, thêm 1 lượt **thân theo bộ** (3 bộ vùng) và 1 lượt **mặc đủ món lẻ**; sửa bằng code mọi lỗi sửa được (mỗi sửa có cờ tắt), soạn prompt vẽ lại cho món hỏng.

## 1. Tóm tắt

| | Số món | Ghi chú |
|---|---|---|
| Hình đồ mặc đã kiểm | **59** (37 món người chơi mặc được, cánh tính 3 cấp = 45 hình; 14 hình đồ khởi đầu vẽ code) | bảng ở mục 4 |
| Lỗi tìm thấy | **31 món** có lỗi trên thân AI | áo không hiện (7 áo lẻ), dấu "+" lơ lửng (thêm 3 áo bộ), bùa thõng quá chân (8), mũ to / ngồi chồng trên tóc / nét ×1 lệch phong cách (9), đồ lưng to bằng thân (2), áo choàng sai dáng (1), cánh lửa cấp 3 hơi to (1) |
| Đã sửa bằng code | **25 món** (10 áo, 8 bùa, 4 mũ, 2 đồ lưng, 1 cánh) + bông tuyết "+" + nón nhô khỏi thẻ Ông Từ | mục 2; 6 món trong số đó vẫn nên vẽ lại |
| Cần **vẽ lại** | **12 món → 2 tấm ảnh** | 9 mũ (1 tấm), 3 đồ lưng (1 tấm) — `PROMPT-VE-LAI.md` |

Tiêu chí: mũ rộng ≤ ~1,4 lần đầu (đầu kể cả tóc ~16 × 14) và không che mắt; áo khớp thân; đồ lưng không to hơn thân (29); cánh không che đầu; không trượt khỏi người khi chạy/đánh/lộn; cùng phong cách với thân (nét ×2, độ chi tiết).

## 2. Đã sửa bằng code (mỗi mục một cờ tắt)

| # | Lỗi (ai thấy) | Sửa | Cờ tắt | Tệp |
|---|---|---|---|---|
| 1 | **Mặc áo mà thân vẫn trần** (tester C2): thân AI gốc chưa bao giờ khoác áo, áo chỉ hiện bằng dấu 3×3 "+" trên ngực | Ảnh áo `tp-robes-*` khoác lên thân AI gốc: cổ áo đặt ngay dưới cằm (đo tâm, bán kính đầu và hướng thân **trên chính khung đang vẽ**), co đều để đoạn cổ→hông bằng thân AI (8 điểm ảnh, áo cũ vẽ cho thân code nên dài hơn, hệ số ~0,8), rồi **cắt theo hình bóng thân** khung đó và **bỏ phần đè lên đầu** → áo ôm thân ở đứng, chạy, đánh (cả 4 vũ khí), không bao giờ che mặt; khung lăn cuộn tròn thì tạm ẩn như mũ, cánh. Thân theo bộ đã vẽ sẵn áo: không khoác, không dấu "+". Viền màu bậc áo giữ như cũ | `G.AO_THAN_AI = false` hoặc `?aothan=0` | `js/sprite_custom.js` (`SC.aoTrenThan`) |
| 2 | **Dấu "+" trắng lơ lửng** (tester C2) — hai nguồn: dấu ngực của áo (mục 1) và **bông tuyết hệ Băng** (đồ hệ Băng như Bùa sương) vẽ hình chữ thập 3×3 rơi ngang ngực | Dấu ngực bỏ (khi bật mục 1); bông tuyết thành **một chấm**, rơi hai bên thân, không rơi ngang ngực | `G.TUYET_CHAM = false` | `js/hero_tinhlinh.js` (`motes`) |
| 3 | Cỡ / chỗ từng món trên thân AI: 8 bùa dài 13 thõng từ eo xuống **quá bàn chân**, nằm giữa háng; bầu hồ lô 19×28, trống đồng 15×25 **to gần bằng cả thân**; mũ tai cáo, mũ vây cá, mũ sừng **ngồi chồng trên tóc** như hai tầng đầu; cánh lửa cấp 3 cao 28 nhô 4 điểm ảnh trên đầu | Bảng chỉnh theo món `G.spriteCustom.TP_CHINH` (co quanh điểm neo, dời): bùa ×0,75 dời ra hông trước; hồ lô ×0,62, trống ×0,68; mũ tai cáo ×0,85 hạ 2, mũ vây cá ×0,9 hạ 2, mũ sừng hạ 1; cánh lửa cấp 3 ×0,88. Chỉ áp cho thân AI. Mỗi dòng ghi cỡ ảnh cũ: **nhập ảnh vẽ lại khác cỡ thì dòng đó tự thôi áp** | `G.spriteCustom.TP_CHINH = null` | `js/sprite_custom.js` (`chinhMon`), `js/hero_tinhlinh.js` (`cx.ai`) |
| 4 | **Nón lá** (đang dùng hình code vì nón AI cũ to hơn người, che mặt): vành 23 (~1,5 đầu), chấm trắng ở mép vành, quai đỏ thành vệt sẫm dọc má "như vết sẹo" | Trên thân AI: vành 19 (~1,2 đầu), bỏ ánh bóng (chấm trắng), bỏ quai (khung đầu code không trùng mặt AI nên quai luôn rơi vào má). Thân code y hệt cũ | `G.NON_LA_GON = false` | `js/hero_tinhlinh.js` |
| 5 | **Nón lá nhô khỏi thẻ** ở Ông Từ (tester, ảnh 14) | Em bé trong thẻ chọn được vẽ trong khung thẻ (cắt phần lòi ra) | `G.THE_EM_BE_CAT = false` | `js/village.js` (1 dòng ở bảng Ông Từ) |

Chỉ số đồ **không đổi**; chỉ đổi hình. Đăng nhập Google, lưu mây, `?cloud=0` không đụng tới.

Ảnh trước / sau:
- `anh/so-sanh-truoc-sau.png` — 10 món tiêu biểu phóng to (áo vải, áo the, giáp đá, áo lá lúc đánh, bùa hút máu, hồ lô, trống đồng, mũ tai cáo, nón lá, cánh lửa cấp 3).
- `anh/bang-tho-may-truoc-sau.png` — dựng lại đúng cảnh tester (Cu Tí, nón lá, áo vải thô, bùa sương bậc Lam): trước có dấu "+" trên ngực và bông tuyết chữ thập, thân trần; sau mặc áo vải nâu, không còn "+".
- `anh/bang-tho-may-2-truoc-sau.png` — Cái Bống mặc khăn xếp, giáp đá bậc Tím, hồ lô, bùa hút, cánh chuồn chuồn.
- `anh/bang-ong-tu-truoc-sau.png` — thẻ chọn em bé ở Ông Từ.
- Bảng tiếp xúc theo ô (mỗi tấm < 1 MB): `anh/truoc-<ô>.png` và `anh/sau-<ô>.png` với ô = `hats`, `robes`, `backs`, `hands`, `wings` (cánh 3 cấp), `masks` (chỉ bản sau: không đổi), `bo` (thân theo bộ), `du-do` (mặc đủ món lẻ). Hàng = món, cột = 4 em bé × (đứng, chạy, đánh có kiếm, lộn); vạch trắng = cao thân 29.

## 3. Vẽ lại (2 tấm ảnh)

Prompt đầy đủ, chép từ trang công cụ: **`PROMPT-VE-LAI.md`**. Cả 2 tấm: dán vào **cuộc trò chuyện mới**, **gửi kèm 1 ảnh** `tham-chieu-em-be-4-nhan-vat.png` (4 em bé đứng cạnh thước điểm ảnh, chỉ để so cỡ và phong cách).

| Tấm | Lô trên trang Tách Đồ (`tools/tach-do`) | Món | Vì sao |
|---|---|---|---|
| 1 | **VẼ LẠI 12/10 · Mũ (9 món, nét gấp đôi, ôm đầu)** — lưới 3×3, nền hồng tím | nón lá 22×12, khăn xếp 18×9, mũ rơm 22×10, mũ sừng 20×14, vòng lá 18×7, mũ da cá 18×14, khăn đá lửa 18×9, mũ vây cá 19×15, mũ tai cáo 18×16 | Cả 9 mũ AI đang có là **nét thường (×1)**, thân em bé nét gấp đôi → mũ thô, khối to, lệch phong cách; mũ ôm đầu (da cá, vây cá, tai cáo, sừng) **ngồi chồng trên đỉnh tóc** thay vì trùm đầu; mũ rơm 12×9 **nhỏ quá** (0,75 đầu); nón lá AI cũ to hơn người, đang tạm dùng hình code |
| 2 | **VẼ LẠI 12/10 · Đồ đeo lưng (3 món)** — lưới 3×1, nền xanh lá | áo choàng 14×16, bầu hồ lô 12×18, trống đồng nhỏ 12×16 | Áo choàng vẽ thành **lá cờ / tấm thảm bay** đỏ nhỏ trên vai (sai dáng); hồ lô và trống đồng **to gần bằng thân** (code đang co tạm, ảnh co bằng điểm ảnh gần nhất nên hơi vụn) |

Công cụ đã chỉnh cho 2 lô này (`tools/tach-do/index.html`):
- Cỡ chuẩn mới theo thân AI thật (đo: thân cao 29, đầu kể cả tóc ~16 × 14): mũ rộng ≤ 22, mũ ôm đầu cao 14–16; đồ lưng cao ≤ 18. Cập nhật cả bảng cỡ trong `docs/LUAT-VE-CHUNG.md` và câu "em bé cao 29, đầu ~16×14" trong prompt mọi lô trang phục (trước ghi 33 / 13).
- Điểm **đỉnh đầu** của mũ đặt cách mép dưới mũ 4 điểm ảnh (vòng lá: 2) và **chỉ một điểm neo** (không thêm điểm gáy ước lượng, vì hai điểm làm game co mũ ×1,15 và xoay theo gáy): vành mũ ngang lông mày, mép dưới mũ ở y = −23 (mắt −21) cho cả 4 em bé.
- Prompt có `CAU_PHONG_CACH` (LUẬT VẼ CHUNG) như mọi lô, câu "ôm lấy đầu… không ngồi chồng trên tóc, không che mắt, rộng ≤ 1,4 đầu" / "không to hơn thân", câu ảnh tham chiếu; nền chọn tránh màu món (mũ có lá xanh → hồng tím; đồ lưng có áo choàng đỏ → xanh lá).
- Cắt ra **đúng mã tệp cũ** (`tp-hats-non_la`, `tp-hats-khan_xep`…, `tp-backs-ao_choang`…), độ nét gấp đôi.

Đã thử bằng ảnh lưới máy vẽ (chưa có ảnh ChatGPT thật): `kiem/thu_lo_ve_lai.py` — 12/12 món cắt đúng mã, nét ×2, đúng cỡ chuẩn, đỉnh đầu đúng chỗ; nạp 12 tệp đó vào game: 9 mũ × 4 em bé mép dưới mũ ở −23 / −25 (mắt −21) → **không che mắt**, không bị co giãn; `TP_CHINH` tự thôi áp; 0 pageerror.

## 4. Bảng từng món

Kết quả trên thân AI gốc trước phiên này → sau sửa code. "Khởi đầu (code)": đồ mặc sẵn của thân vẽ code, **thân AI không mặc** (game không khoác đồ khởi đầu lên thân AI), không có trong kho người chơi; vẫn kiểm cho đủ.

### Mũ (ô hats, 13 hình)
| Món | Ảnh | Trước | Sửa code | Sau | Vẽ lại |
|---|---|---|---|---|---|
| Nón lá rừng `non_la` | code (AI cũ cất ở `art/du-tru`) | to quá (vành 23), chấm trắng, quai đỏ dọc má; nhô khỏi thẻ Ông Từ | vành 19, bỏ chấm, bỏ quai; cắt trong thẻ | ĐẠT tạm (hình code phẳng, lệch phong cách) | **Có** (tấm 1, 22×12) |
| Khăn xếp `khan_xep` | AI 12×9, nét ×1 | ngồi trên tóc, nhỏ; lệch phong cách (×1) | — | lệch phong cách | **Có** (18×9) |
| Mũ rơm `mu_rom` | AI 12×9, ×1 | nhỏ quá (0,75 đầu), như mũ tí hon trên chỏm; ×1 | — | nhỏ quá, lệch phong cách | **Có** (22×10) |
| Mũ sừng gỗ `mu_sung` (bộ Rừng) | AI 17×14, ×1 | ngồi chồng trên tóc; ×1 | hạ 1 | ĐẠT chỗ, lệch phong cách | **Có** (20×14) |
| Vòng lá `vong_la` | AI 10×7, ×1 | đúng chỗ (trên tóc); ×1 | — | lệch phong cách nhẹ | **Có** (18×7) |
| Mũ da cá `mu_da_ca` | AI 15×16, ×1 | to, ngồi chồng trên tóc; hạ xuống thì chạm mắt Cái Bống | — (không hạ) | to, lệch phong cách | **Có** (18×14) |
| Khăn đá lửa `khan_lua` | AI 12×9, ×1 | nhỏ, ngồi trên tóc; ×1 | — | lệch phong cách | **Có** (18×9) |
| Mũ vây cá `mu_vay_ca` (bộ Biển) | AI 17×17, ×1 | to quá, ngồi chồng; ×1 | ×0,9, hạ 2 | ĐẠT cỡ, lệch phong cách | **Có** (19×15) |
| Mũ tai cáo `mu_tai_cao` (bộ Lâu) | AI 17×19, ×1 | to quá (cao 19, thành hai tầng đầu) | ×0,85, hạ 2 | vẫn cao, lệch phong cách | **Có** (18×16) |
| Mũ trùm sừng / chóp nhọn / mầm lá / khăn đỏ `trum_*` | AI 17–20 × 17–20, ×1 | khởi đầu (code): thân AI không đội | — | không áp dụng | Không |

### Áo (ô robes, 13 hình)
| Món | Ảnh | Trước | Sửa code | Sau | Vẽ lại |
|---|---|---|---|---|---|
| Áo vải thô `ao_vai` | AI 12×11, ×2 | **không hiện** (dấu "+") | khoác áo cắt theo thân (mục 2.1) | ĐẠT | Không |
| Áo da biển `ao_da_bien` | AI 11×12 | không hiện | như trên | ĐẠT | Không |
| Áo giáp đá `giap_da` | AI 14×13 | không hiện | như trên | ĐẠT | Không |
| Áo tơi lá `ao_toi` | AI 15×14 | không hiện | như trên | ĐẠT | Không |
| Áo the `ao_the` | AI 12×11 | không hiện | như trên | ĐẠT (màu chàm tối, nhìn kỹ mới rõ trên thân đỏ) | Không |
| Áo lá `ao_la` | AI 15×14 | không hiện | như trên | ĐẠT | Không |
| Giáp tre `giap_tre` | AI 15×13 | không hiện | như trên | ĐẠT | Không |
| Áo vỏ cây `ao_vo_cay` (bộ Rừng) | AI | đổi sang thân bộ Rừng (áo vẽ sẵn) + dấu "+" | bỏ dấu "+" | ĐẠT | Không |
| Áo vảy `ao_vay` (bộ Biển) | AI | thân bộ Biển + "+" | bỏ "+" | ĐẠT | Không |
| Áo lông trắng `ao_long` (bộ Lâu) | AI | thân bộ Lâu + "+" | bỏ "+" | ĐẠT | Không |
| Áo trùm `ao_trum`, Áo da `ao_da` | AI | khởi đầu (code) | (khoác được nếu ai mặc) | không áp dụng | Không |
| Khố đô vật `kho_vat` | code, không có ảnh AI | khởi đầu (code) | — | không áp dụng | Không |

### Đồ đeo lưng (ô backs, 6 hình)
| Món | Ảnh | Trước | Sửa code | Sau | Vẽ lại |
|---|---|---|---|---|---|
| Áo choàng đỏ `ao_choang` | AI 13×12 | **sai dáng**: mảnh đỏ như lá cờ / thảm bay trên vai | — | sai dáng | **Có** (tấm 2, 14×16) |
| Bầu hồ lô `ho_lo` | AI 19×28 | **to quá** (gần bằng cả thân) | ×0,62 (~12×17) | ĐẠT cỡ, hơi vụn do co | **Có** (12×18) |
| Trống đồng nhỏ `trong_nho` (bộ Lâu) | AI 15×25 | **to quá** | ×0,68 (~10×17) | ĐẠT cỡ, hơi vụn | **Có** (12×16) |
| Ống tên `ong_ten` | AI 14×18 | ĐẠT | — | ĐẠT | Không |
| Gùi tre độc `gui_tre` (bộ Rừng) | AI 12×14 | ĐẠT | — | ĐẠT | Không |
| Khăn choàng sương `khan_bang` (bộ Biển) | AI 12×16 | ĐẠT | — | ĐẠT | Không |

### Bùa, cầm tay (ô hands, 10 hình)
| Món | Ảnh | Trước | Sửa code | Sau | Vẽ lại |
|---|---|---|---|---|---|
| Bùa hút máu, Bùa linh, Bùa đá lửa, Bùa nanh rắn, Bùa vỏ ốc, Bùa tàn lửa (`bua_hut`, `bua_linh`, `bua_lua`, `bua_nanh`, `bua_oc`, `bua_tan`) | AI 3–5 × 12–13 | **lệch chỗ / to quá**: thõng từ eo xuống quá bàn chân (đáy ở +4, dưới mặt đất), nằm giữa háng | ×0,75, dời ra hông trước | ĐẠT (tua bùa ở hông, tới gối) | Không |
| Bùa sương, Bùa tham (`bua_suong`, `bua_tham`) | AI 5×10 | như trên (ngắn hơn); bùa sương hệ Băng còn rắc bông tuyết "+" | ×0,75 dời hông; bông tuyết một chấm | ĐẠT | Không |
| Búa rèn tí hon `bua_con`, Găng đồng `gang_dong` | AI / code | khởi đầu (code) | — | không áp dụng | Không |

### Cánh (ô wings, 4 loại × 3 cấp = 12 hình)
| Món | Cấp 1 | Cấp 2 | Cấp 3 | Sửa code | Vẽ lại |
|---|---|---|---|---|---|
| Cánh chuồn chuồn `chuon` | ĐẠT (11×12) | ĐẠT (17×16) | ĐẠT (23×26) | — | Không |
| Cánh lá `la` (bộ Rừng) | ĐẠT | ĐẠT | ĐẠT (22×26) | — | Không |
| Cánh lửa `lua` (bộ Lâu) | ĐẠT | ĐẠT | hơi to (22×28 = cao cả thân, chóp nhô 4 trên đầu) | cấp 3 ×0,88 | Không |
| Cánh băng `bang` (bộ Biển) | ĐẠT | ĐẠT | ĐẠT (19×24) | — | Không |

Cánh mọc sau lưng, nằm sau thân: không che đầu ở mọi tư thế; lúc lăn cuộn tròn tạm ẩn (như cũ).

### Dấu mặt (ô masks, 5 hình: `lua`, `la`, `xoay`, `du`, `ho`)
Vẽ code, khởi đầu, không có trong kho người chơi. Trên thân AI là vài điểm ảnh nhỏ ở mặt, không che mắt: ĐẠT, không vẽ lại.

### Thân theo bộ (`anh/sau-bo.png`)
3 bộ × (chỉ áo, đủ 4 món + cánh cấp 3, áo bộ + mũ rơm và áo choàng khác bộ): thân đổi đúng bộ, món cùng bộ ẩn đúng, cánh khoác rời đúng chỗ, lộn cuộn tròn đúng. **Một điểm chờ quyết định** (chưa sửa): mặc áo bộ + mũ **khác bộ** thì mũ khác bộ đội **chồng lên mũ vẽ sẵn** của thân bộ (ví dụ mũ rơm trên mũ tai cáo). Hai cách: (a) giữ như hiện nay (luật Q1: món khác bộ vẫn khoác rời); (b) thân bộ đang đội mũ khác bộ thì ẩn mũ khác bộ. Mặc định: giữ (a).

## 5. Kiểm tra

- 0 pageerror: bảng tiếp xúc (6 ô + bộ + đủ đồ, cả trước và sau), bảng Thợ May / Ông Từ, trận ở ải Rừng già 1 (bản một tệp và bản hai tệp `linh-khi-nhe.html`), trang Tách Đồ, nạp 12 tệp thử vào game.
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được; `node --check` mọi `game/js/*.js`; `node game/tests/cloud_save_regression.test.js` PASS.
- Tắt cả 5 cờ (`G.AO_THAN_AI=false; G.TUYET_CHAM=false; G.NON_LA_GON=false; G.THE_EM_BE_CAT=false; G.spriteCustom.TP_CHINH=null; G.tinhLinh.clearCache()`) → hình như trước phiên (ảnh `truoc-*.png` chụp đúng cách này).

Chạy lại:
```
python3 -m http.server 8782 &
python3 game/build.py
python3 game/tests/trang_phuc_shots.py docs/review/ke-hoach-cai-thien/trang-phuc/anh sau
python3 game/tests/trang_phuc_shots.py docs/review/ke-hoach-cai-thien/trang-phuc/anh truoc "() => { G.AO_THAN_AI = false; G.TUYET_CHAM = false; G.NON_LA_GON = false; G.spriteCustom.TP_CHINH = null; G.tinhLinh.clearCache(); }"
python3 game/tests/trang_phuc_bang.py <thư mục ra>
python3 docs/review/ke-hoach-cai-thien/trang-phuc/kiem/thu_lo_ve_lai.py
```

## 6. Quay lui

Từng mục: cờ tắt ở bảng mục 2. Cả phiên: `git revert` các commit "Phiên kiểm trang phục".
