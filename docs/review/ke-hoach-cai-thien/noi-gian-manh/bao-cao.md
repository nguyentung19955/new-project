# Báo cáo — Quái nổi giận phải mạnh rõ rệt (15/10)

Yêu cầu: `YEU-CAU.md` cùng thư mục. Nhánh `khoi-tao-du-an`.
**Không test game** — chỉ: ảnh soát tĩnh (`xem-noi-gian.png`), bot cân bằng (luật game chạy trong Node, `--node`), `node --check`, `build.py`.

## 1. Tóm tắt

- Trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh): pha 2 "nổi giận" / pha 3 "hóa cuồng" nay **ra chiêu nhanh hơn (×1,3 / ×1,55)**, **nghỉ ngắn hơn**, **mỗi chiêu nhiều đòn hơn**, **nối chiêu** (pha 2: 35% ra liền chiêu thứ hai; pha 3: 60% nối 2, 20% nối 3), đi nhanh hơn, mệt ngắn hơn.
- Trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa): có **pha 2 thật ở ≤ 50% máu** (trước chỉ đổi hình): nhanh ×1,3, nghỉ ×0,65, mỗi chiêu +1 đợt, 40% nối chiêu, biểu ngữ "{tên} nổi giận!".
- Tinh anh: **nổi giận một lần ở ≤ 35% máu**: tốc chiêu ×1,3, hồi chiêu riêng ×0,6, hào quang đỏ, chữ "Nổi giận!".
- **Nhìn thấy suốt pha**: thân tô đỏ nhẹ có nhịp, quầng đỏ nhấp nháy dưới chân, đốm lửa giận bốc quanh thân (pha 3 đỏ hơn, nhịp nhanh hơn, nhiều đốm hơn); pha 3 thêm rung nhẹ mỗi lần trùm dậm và màn hơi đỏ ở mép; biểu ngữ giữ, thêm dòng nhỏ mô tả; chữ "Nối chiêu!" trên đầu khi trùm nối chiêu.
- Mọi hệ số ở **một bảng `G.NOI_GIAN`** (`game/js/data.js`). **Cờ `?giancu=1`** → y hệt cũ.
- **Sàn công bằng giữ**: báo trước ≥ 0,45 giây, vùng to / nhiều đợt ≥ 0,6 giây (đo trên luật thật: ngắn nhất 0,49 giây — vạch Bổ rìu, vùng thường), đạn nhanh hơn tối đa ×1,15 (< ×1,25).
- **Cân bằng**: với đúng số sát thương của yêu cầu (×1,1 / ×1,2) bot thắng trùm tụt 30–60 điểm % → theo luật của yêu cầu, **hạ hệ số sát thương** (giữ nguyên tốc, nối chiêu, số đòn). Sau khi hạ, thắng ải ở Sức mạnh khuyên dùng lệch ≤ 10 điểm % (ải lệch nhất 1-5 đo lại 150 lượt: 81% → 74%), thắng riêng trận trùm lệch ≤ 7 điểm khi giảm, chiến dịch không ải nào quá 9 lần chơi (bảng mục 6). `G.STAGE_REC` **giữ nguyên**.

## 2. Bảng `G.NOI_GIAN` (game/js/data.js) — số cuối

Mọi hệ số so với pha 1.

| | Pha 1 | Pha 2 "nổi giận" (≤ 66%) | Pha 3 "hóa cuồng" (≤ 33%) | Ghi chú |
|---|---|---|---|---|
| Tốc ra chiêu (cử động + báo trước) `toc` | ×1 | ×1,3 | ×1,55 | đúng yêu cầu (cũ ×1,1 / ×1,2) |
| Nghỉ giữa chiêu `nghi` | 1,3 s | ×0,7 = 0,91 s | ×0,5 = 0,65 s | đúng yêu cầu (cũ 1,0 / 0,8 s) |
| Số đòn mỗi chiêu `chieu` | như cũ | +1 đợt / +30–40% | +2 đợt / +60% | bảng mục 3 |
| Nối chiêu `noi`, `noiNghi` | không | 35% nối 2 (nghỉ 0,3 s) | 60% nối 2, 20% nối 3 | đúng yêu cầu |
| Sát thương `sat` | ×1 | **×0,5** | **×0,45** | yêu cầu ×1,1 / ×1,2 — hạ sau đo bot (mục 6) |
| Nhát của đợt thêm `satDot` | — | ×0,5 | ×0,5 | thêm (mục 6) |
| Di chuyển `diChuyen` | ×1 | ×1,2 | ×1,4 | đúng yêu cầu |
| Mệt sau chiêu lớn `met` | như cũ | ×0,8 | ×0,6 | đúng yêu cầu (vẫn có cửa phản công) |
| Tốc đạn bay `dan` | ×1 | ×1,1 | ×1,15 | trần ×1,25 (`san.danMax`) |

| Trùm nhỏ (`nho`) | Pha 1 | Pha 2 (≤ 50% máu, `nguong`) |
|---|---|---|
| Tốc / nghỉ | ×1 | ×1,3 / ×0,65 (Nấm Chúa 1,7 → 1,1 s; Cua Đá 1,5 → 0,98 s; Hổ Lửa 1,05 → 0,68 s) |
| Mỗi chiêu | như cũ | +1 đợt (mục 3) |
| Nối chiêu | không | 40% (nghỉ 0,3 s) |
| Sát thương | ×1 | **×0,7** (yêu cầu ×1,1 — hạ sau đo bot) |
| Đạn | ×1 | ×1,1 |

| Tinh anh (`tinhAnh`) | |
|---|---|
| Ngưỡng | ≤ 35% máu, một lần duy nhất |
| Tốc chiêu | ×1,3 (cử động chiêu ×1,3; báo trước chia 1,3 nhưng không dưới 0,45 s đòn thường / 0,6 s chiêu riêng) |
| Hồi chiêu riêng | ×0,6 (cả lượt hồi đang chạy lúc nổi giận) |
| Sát thương | **×0,85** (yêu cầu ×1,1 — hạ sau đo bot) |

Sàn công bằng `san`: `bao` 0,45 s, `baoTo` 0,6 s. Chiêu đánh dấu `to: true` trong `js/boss.js` (Quật cành, Rễ đâm, Mưa quả độc, Rừng gai, Sóng thần, Phun băng, Quạt đuôi, Hồ ly phân thân / Vòng lửa ma) khi nổi giận mà báo trước tính theo tốc ngắn hơn 0,6 s thì phần lấy đà được kéo dài cho đủ (cùng cơ chế `tele` có sẵn), phần sau chiêu vẫn chạy nhanh. Đợt thêm luôn hiện vùng báo trước ≥ 0,6 s (vồ lửa thêm của Hổ Lửa: 0,5 s, vạch thẳng).

## 3. Số đòn mỗi chiêu (`G.NOI_GIAN.chieu`)

"Cùng hướng" = đợt thêm đánh lại đúng hướng đợt đầu (đã né ra khỏi vùng đợt đầu là an toàn — dồn dập nhưng không đuổi). "Nhắm lại" = kiểu đuổi, đợt thêm nhắm chỗ em bé lúc nó hiện (`nham: true`).

| Trùm | Chiêu | Pha 1 | Pha 2 | Pha 3 | Cách tăng |
|---|---|---|---|---|---|
| Mộc Tinh | c1 Quật cành | 1 lần | 2 | 3 | lần 2 quật NGƯỢC ra sau lưng (đứng sau lưng chém không còn an toàn), lần 3 quật lại phía trước |
| | c2 Rễ đâm | 1 hàng | 2 hàng (như cũ) + 1 đợt | 2 hàng + 2 đợt | đợt thêm: một hàng rễ nhắm lại, cách 0,75 s |
| | c3 Mưa quả độc | 5 quả | 7 | 8 | cũ 5 / 5 / 6; > 6 quả thì rải rộng ×1,2 |
| | c4 Bùa bay (từ pha 2) | 5 lá | 7 | 8 | cùng quạt ~1,8 rad |
| | c5 Rừng gai (pha 3) | — | — | 5 vòng | cũ 3; vòng 4, 5 lan lại từ trong ra, khe đổi chỗ |
| Ngư Tinh | c1 Bổ rìu san hô | 1 nhát | 2 | 3 | nhát thêm: vết nứt mới nhắm lại (không văng mảnh), sau lúc mảnh văng, cách 0,7 s |
| | c2 Sóng thần | 1 tường | 2 | 3 | cũ 1 / 2 / 2; mỗi tường sau 0,5 s, khe lệch xen kẽ |
| | c3 Phun băng | 1 lần, 3 ô gai | 2 lần, 4 ô | 3 lần, 5 ô | cùng hướng, cách 0,6 s |
| | c4 Cột nước đuổi (từ pha 2) | 6 cột | 8 | 10 | mỗi cột vẫn báo trước 0,6 s |
| | c5 Xoáy hút (pha 3) | — | — | + 2 vòng sóng | sau cú nổ giữa, vành khăn 40→85, 85→130, cách 0,4 s |
| Hồ Tinh | c1 Hồ hoả | 5 cầu lửa | 7 | 8 | cũ 5 / 6 / 8 |
| | c2 Vồ nhảy | 1 lần | 3 | 4 | cũ 1 / 2 / 2; lần 3, 4 nghỉ chia tốc pha, báo trước 0,62 s |
| | c3 Quạt đuôi | 1 lần | 2 | 3 | cùng hướng, cách 0,7 s |
| | c4 Hồ ly phân thân (từ pha 2) | 4 lượt lao | 5 | 6 | lượt 5, 6: bóng giả lao ngược về góc cũ; báo trước mỗi đường ≥ 0,6 s |
| | c5 Bão hồ hoả (pha 3) | — | — | 5 đợt | cũ 3 |
| Nấm Chúa | Hàng nấm độc | 1 hàng | 2 hàng | | hàng thêm nhắm lại; pha 2 để lại vũng độc |
| | Nấm mẹ đẻ con | 3 nấm con | 4 | | |
| Cua Đá | Đập càng rung sàn | 1 lần | 2 | | đập thêm sau vòng sóng |
| | Tường tinh thể | 1 loạt mảnh | 2 | | loạt 2 sau 0,5 s, lệch nửa hàng |
| Hổ Lửa | Vồ lửa | 1 lần | 2 | | lần thêm nhắm lại, KHÔNG để vệt lửa |
| | Gầm phun lửa | 1 lần | 2 | | cùng hướng |

Đòn thường của trùm nhỏ (`nhoDon`) không phải chiêu nên không thêm nhát (đặt `[1, 2]` để bật). Chiêu cũ của cờ `?chieucu=1` (Đớp, Mưa băng nhọn, Xoáy nước, Vồ mồi, Vòng lửa ma, Bão bào tử, Mưa tinh thể) vẫn nhận tốc / nghỉ / nối chiêu / sát thương; số đòn chỉ thêm ở Bão bào tử (`namBao` 2 → 3 đợt) và Mưa tinh thể (`cuaMua` 5 → 7).

## 4. Nhìn thấy được (`game/js/noi_gian.js`, chỉ là hình)

- **Bền suốt pha** (trùm vùng pha 2, 3; trùm nhỏ pha 2; tinh anh đã nổi giận): thân tô đỏ nhẹ theo nhịp (`o.tint`, dùng được cho cả hình vẽ code lẫn ảnh AI; nhịp độc/cháy có trước thì giữ), quầng đỏ hai lớp nhấp nháy dưới chân + chấm đỏ chạy vòng viền quầng, đốm lửa giận bốc lên quanh thân. Pha 3: đỏ đậm hơn, nhịp nhanh hơn (10 so với 6,5 lần/giây), 10 đốm thay 6, đốm to hơn.
- **Pha 3 trùm vùng**: rung nhẹ (0,12) mỗi lần đòn chính hoặc đợt thêm nổ; màn hơi đỏ ở bốn mép (độ đậm 0,1–0,15, nhịp chậm), vẽ trước số sát thương.
- **Chuyển pha**: giữ nguyên chuỗi cử động / hiệu ứng có sẵn. Biểu ngữ "{tên} nổi giận!" / "{tên} hóa cuồng!" giữ; thêm dòng nhỏ: "Ra chiêu nhanh hơn, nối chiêu" (pha 2) / "Nhanh hơn nữa, nối chiêu dồn dập" (pha 3) — dòng thứ hai của dải thông báo (cờ đọc trận tắt thì nối sau biểu ngữ).
- **Nối chiêu**: chữ "Nối chiêu!" trên đầu trùm khi chiêu nối liền chiêu trước. Tinh anh: chữ "Nổi giận!" + chớp đỏ lúc nổi giận.
- Thanh máu trùm nhỏ: một vạch pha ở 50% (cờ cũ: hai vạch như trước).
- Chưa làm: mắt sáng riêng từng trùm (không có toạ độ mắt chung cho cả hình vẽ code và ảnh AI) — thay bằng tô đỏ nhịp + đốm lửa.
- Chữ mới có bản tiếng Anh: `tools/ngon-ngu/tu-dien/noi-gian.json` (đã thêm vào cuối `js/ngon_ngu_en.js`; không chạy lại `gop.py` vì tệp hiện tại đã lệch thứ tự với bản gộp — chạy lại sẽ xáo 345 dòng không liên quan).

## 5. Ảnh soát tĩnh `xem-noi-gian.png`

Dòng thời gian 12 giây mỗi pha của 6 trùm, kèm một hàng "CŨ" (cờ `?giancu=1`) ở pha cuối để so. Dữ liệu ghi từ luật thật chạy trong Node (`ve_xem.py`, em bé đứng yên, không nhận sát thương): xanh = đang ra chiêu, tím = mệt, nền = nghỉ, vạch vàng = vùng đỏ báo trước → chấm đỏ = nổ, tam giác cam = loạt đạn, "nối" = chiêu nối. Số liệu thô: `xem-noi-gian.json`. Vẽ lại: `python3 docs/review/ke-hoach-cai-thien/noi-gian-manh/ve_xem.py`.

Thống kê 60 giây mỗi pha (cùng cách ghi):

| Trùm | Pha | Chiêu / phút | Vùng nổ + loạt đạn / phút | Nối chiêu (% chiêu) | Nghỉ giữa chiêu TB (giây) | Báo trước ngắn nhất (giây) |
|---|---|---|---|---|---|---|
| Mộc Tinh | 1 | 16,0 | 66 | 0% | 1,22 | 0,55 |
| Mộc Tinh | 2 nổi giận | 23,0 | 141 | 26% | 0,72 | 0,60 |
| Mộc Tinh | 3 hóa cuồng | 23,0 | 195 | 52% | 0,44 | 0,60 |
| Mộc Tinh | 3 (cũ) | 21,0 | 92 | 0% | 0,76 | 0,46 |
| Ngư Tinh | 1 | 17,0 | 59 | 0% | 1,22 | 0,76 |
| Ngư Tinh | 2 nổi giận | 21,0 | 114 | 14% | 0,78 | 0,58 |
| Ngư Tinh | 3 hóa cuồng | 21,0 | 133 | 43% | 0,47 | 0,49 |
| Ngư Tinh | 3 (cũ) | 20,0 | 68 | 0% | 0,76 | 0,51 |
| Hồ Tinh | 1 | 16,0 | 48 | 0% | 1,22 | 0,65 |
| Hồ Tinh | 2 nổi giận | 19,0 | 103 | 16% | 0,77 | 0,60 |
| Hồ Tinh | 3 hóa cuồng | 18,0 | 118 | 44% | 0,46 | 0,60 |
| Hồ Tinh | 3 (cũ) | 18,0 | 73 | 0% | 0,75 | 0,62 |
| Nấm Chúa | 1 | 17,0 | 61 | 0% | 1,61 | 0,75 |
| Nấm Chúa | 2 nổi giận | 24,0 | 124 | 29% | 0,83 | 0,58 |
| Nấm Chúa | ≤ 50% máu (cũ) | 19,0 | 62 | 0% | 1,34 | 0,69 |
| Cua Đá | 1 | 18,0 | 39 | 0% | 1,43 | 0,75 |
| Cua Đá | 2 nổi giận | 23,0 | 191 | 22% | 0,79 | 0,58 |
| Cua Đá | ≤ 50% máu (cũ) | 21,0 | 174 | 0% | 1,17 | 0,69 |
| Hổ Lửa | 1 | 21,0 | 21 | 0% | 1,00 | 0,75 |
| Hổ Lửa | 2 nổi giận | 28,0 | 41 | 29% | 0,55 | 0,50 |
| Hổ Lửa | ≤ 50% máu (cũ) | 25,0 | 25 | 0% | 0,81 | 0,69 |

Nghỉ giữa chiêu TB = (thời gian không bận, không mệt) / số chiêu. Báo trước ngắn nhất ≥ 0,45 giây mọi pha nổi giận (0,49: vạch Bổ rìu pha 3; 0,50: vồ thêm của Hổ Lửa; 0,58: đòn thường trùm nhỏ, Bổ rìu pha 2 — đều là vùng thường; vùng to / nhiều đợt ≥ 0,6). Trùm vùng pha 1 giữ như cũ (Mộc Tinh Rễ đâm 0,55).

## 6. Cân bằng (bot cân bằng, Node — mô hình tính số, không phải chơi thử)

### Cách đo
- `game/tests/balance.py 60 - - --node --trum`: mỗi ải 60 lượt từ bản lưu thật của bot lúc vừa đủ Sức mạnh khuyên dùng (`tests/cay_luu.json`); `--trum` (mới) in thêm tỉ lệ tới phòng trùm và thắng trùm trong số đó. Bản cũ: cùng mã, biến môi trường `LK_Q=giancu=1` (mới, `tests/node_trang.js` thêm cờ vào địa chỉ trang giả).
- `do_trum.py` (cùng thư mục, mới): vào thẳng phòng trùm — đo riêng trận trùm, ít nhiễu; `LK_MAU` (vào trùm với một phần máu), `LK_LOP` (lớp thích nghi như lượt thật: Kháng Lửa, Chống áp sát), `LK_NGUON=1` (máu mất theo từng chiêu) để tìm chiêu gây tụt.
- `game/tests/cay.py 6 khuyen --kd=4 --node` như bước 1: lần chơi mỗi ải và Sức mạnh để bot thắng 75%.

### Lần 1 — đúng số của yêu cầu (sát thương ×1,1 / ×1,2, trùm nhỏ ×1,1, tinh anh ×1,1, đạn ×1,15 / ×1,25)
`do_trum.py`, vào thẳng trùm đủ máu, 60 lượt mỗi ải, thắng trùm cũ → mới: **Mộc Tinh 83% → 55%**, **Cua Đá 2-1 100% → 48%, 2-2 97% → 37%**, 2-3 98% → 77%, **Hồ Tinh 92% → 38%**, Ngư Tinh 12% → 0%. Cả ải (`balance.py`): 1-5 77% → 3%. Tụt xa hơn 10 điểm %.

Tìm nguyên nhân (`LK_NGUON=1`): đòn cận chiến to (Quật cành, Kẹp càng, Vồ lửa) trúng nhiều hơn hẳn — đợt thêm nhắm lại theo em bé ngay sau lúc né đợt đầu; vệt lửa gấp đôi của Vồ lửa; nhát thường thêm của trùm nhỏ; mảnh san hô thêm phủ kín hai bên vết nứt Bổ rìu (không còn chỗ né); tường nước 3–4 bức.

### Sửa (giữ nguyên tốc, nối chiêu; số đòn vẫn tăng)
1. Cách tăng đòn công bằng hơn: đợt thêm đánh **cùng hướng** (trừ kiểu đuổi: Rễ đâm, Hàng nấm, Vồ lửa, Bổ rìu); Quật cành lần 2 quật ra sau lưng; Bổ rìu thêm **nhát bổ mới** thay vì thêm mảnh; Vồ lửa thêm không để vệt lửa; Sóng thần [1, 3, 4] → [1, 2, 3] (đúng "+1 / +2 đợt" so với pha 1); đòn thường trùm nhỏ không thêm nhát.
2. **Hạ hệ số sát thương** (cũ = số yêu cầu → mới): trùm vùng `sat` 1,1 / 1,2 → **0,5 / 0,45**; trùm nhỏ 1,1 → **0,7**; tinh anh 1,1 → **0,85**; nhát của đợt thêm `satDot` → **×0,5**; đạn 1,15 / 1,25 → 1,1 / 1,15. Đã thử lần lượt 0,8/0,7 → 0,75/0,65 → 0,6/0,5 (lệch còn 10–25 điểm ở Ngư Tinh, Hồ Tinh khi bot vào trùm đã mất máu và trùm có lớp thích nghi) → 0,5/0,45.
   Vì sao hạ sâu vậy mà trùm vẫn "mạnh lên": mỗi nhát nhẹ hơn nhưng số chiêu / phút tăng 15–45%, số vùng nổ + loạt đạn / phút tăng gấp 1,6–3 lần (bảng mục 5), nghỉ giữa chiêu còn 0,44–0,8 giây, nên trùm đánh dồn, khó đứng chém lâu; nhưng mỗi lần trúng không đột ngột lấy quá nhiều máu.
3. `G.STAGE_REC` **giữ nguyên** (Sức mạnh để bot thắng 75% vẫn sát khuyên dùng — bảng dưới).

### Kết quả cuối — cả ải, `balance.py 60 --node --trum` (cũ = `LK_Q=giancu=1`)

| Ải | Sức mạnh bản lưu / khuyên dùng | Thắng ải: cũ → mới | Lệch | Tới phòng trùm: cũ → mới | Thắng trùm (trong số tới): cũ → mới |
|---|---|---|---|---|---|
| 1-1 | 100/95 | 60/60 (100%) → 60/60 (100%) | +0 | 60 → 60 | 100% → 100% |
| 1-2 | 107/105 | 60/60 (100%) → 59/60 (98%) | -2 | 60 → 60 | 100% → 98% |
| 1-3 | 126/125 | 60/60 (100%) → 57/60 (95%) | -5 | 60 → 59 | 100% → 97% |
| 1-4 | 141/140 | 59/60 (98%) → 55/60 (92%) | -7 | 59 → 56 | 100% → 98% |
| 1-5 | 174/175 | 51/60 (85%) → 42/60 (70%) | -15 | 60 → 55 | 85% → 76% |
| 2-1 | 181/180 | 54/60 (90%) → 52/60 (87%) | -3 | 56 → 55 | 96% → 95% |
| 2-2 | 207/215 | 35/60 (58%) → 33/60 (55%) | -3 | 39 → 38 | 90% → 87% |
| 2-3 | 250/260 | 30/60 (50%) → 27/60 (45%) | -5 | 30 → 30 | 100% → 90% |
| 2-4 | 265/275 | 6/60 (10%) → 13/60 (22%) | +12 | 6 → 13 | 100% → 100% |
| 2-5 | 293/305 | 6/60 (10%) → 2/60 (3%) | -7 | 10 → 6 | 60% → 33% |
| 3-1 | 312/310 | 52/60 (87%) → 54/60 (90%) | +3 | 52 → 54 | 100% → 100% |
| 3-2 | 346/330 | 46/60 (77%) → 46/60 (77%) | +0 | 49 → 49 | 94% → 94% |
| 3-3 | 392/410 | 31/60 (52%) → 34/60 (57%) | +5 | 34 → 37 | 91% → 92% |
| 3-4 | 411/420 | 21/60 (35%) → 22/60 (37%) | +2 | 21 → 25 | 100% → 88% |
| 3-5 | 455/520 | 13/60 (22%) → 13/60 (22%) | +0 | 27 → 33 | 48% → 39% |

Tổng 15 ải: mới thắng 569/900 (63%), cũ 540/900 (60%); tới phòng trùm 630 / 614; thắng trùm trong số lượt tới: mới 90%, cũ 88%.
Nhiễu: 60 lượt mỗi ải ⇒ ±6–9 điểm. Ải lệch nhiều nhất (1-5) đo thêm 150 lượt mỗi bên: **cũ 122/150 (81%) → mới 111/150 (74%), −7 điểm**; gộp cả hai lần đo: 82% → 73% (−9). Mọi ải còn lại lệch ≤ 7 điểm (2-4, 3-3 tăng: bản lưu dưới khuyên dùng, ít lượt tới trùm).

### Kết quả cuối — riêng trận trùm (`do_trum.py`)

| Ải (trùm) | Đủ máu, không lớp thích nghi (120 lượt): cũ → mới | Vào trùm còn 60–70% máu, có lớp thích nghi như lượt thật: cũ → mới |
|---|---|---|
| 1-1 (Nấm Chúa) | 100% → 100% | — |
| 1-2 (Nấm Chúa) | 100% → 100% | 100% → 100% (100 lượt, 60% máu, Kháng Lửa) |
| 1-3 (Nấm Chúa) | 100% → 100% | — |
| 1-4 (Nấm Chúa) | 100% → 100% | 100% → 100% (100 lượt, 60% máu, Kháng Lửa) |
| 1-5 (Mộc Tinh) | 81% → 94% | 51% → 61% (150 lượt, 70% máu, Kháng Lửa + Chống áp sát) |
| 2-1 (Cua Đá) | 100% → 98% | 94% → 88% (100 lượt, 60% máu, Kháng Lửa) |
| 2-2 (Cua Đá) | 99% → 99% | 89% → 82% (100 lượt, 60% máu, Kháng Lửa) |
| 2-3 (Cua Đá) | 95% → 100% | 98% → 99% (100 lượt, 60% máu, Kháng Lửa) |
| 2-4 (Cua Đá) | 98% → 98% | — |
| 2-5 (Ngư Tinh) | 16% → 36% | 51% → 56% (150 lượt, 70% máu, Kháng Lửa + Chống áp sát) |
| 3-1 (Hổ Lửa) | 99% → 100% | 86% → 94% (100 lượt, 60% máu, Kháng Lửa) |
| 3-2 (Hổ Lửa) | 99% → 100% | 85% → 89% (100 lượt, 60% máu, Kháng Lửa) |
| 3-3 (Hổ Lửa) | 100% → 99% | — |
| 3-4 (Hổ Lửa) | 100% → 100% | 87% → 93% (100 lượt, 60% máu, Kháng Lửa) |
| 3-5 (Hồ Tinh) | 96% → 100% | 33% → 30% (150 lượt, 70% máu, Kháng Lửa + Chống áp sát) |

Cột 2 là đo "sạch" (`do_trum.py moi|cu <ải> 120`): trùm vùng nay dễ hơn khi vào đủ máu vì mỗi nhát nhẹ hơn. Cột 3 giống lượt thật hơn (bot vào trùm đã mất máu, trùm có lớp thích nghi theo cách bot chơi — bot hay bị Kháng Lửa và Chống áp sát): trùm nhỏ giảm nhiều nhất 7 điểm (Cua Đá 2-2: 89% → 82%), trùm vùng −3 … +10 điểm. Cùng điều kiện cột 3, sát thương 0,6 / 0,5 cho 2-5 25%, 3-5 19%, 1-5 40% (lệch 26 / 14 / 11 điểm) — lý do hạ xuống 0,5 / 0,45.

### Chiến dịch `cay.py 6 khuyen --kd=4 --node` (cũ → mới)

| | Cũ | Mới |
|---|---|---|
| Lần chơi trung bình mỗi ải 1-1 … 3-5 | 1 · 1 · 1 · 2 · 3,5 · 1 · 2,2 · 5,3 · 4 · 6,2 · 1 · 2,3 · 3,2 · 2,3 · 4,7 | 1 · 1 · 1,2 · 2,3 · 4 · 1 · 2 · 4,8 · 4 · 7 · 1 · 1,7 · 3 · 3 · 6,5 |
| Tổng lần chơi / thời gian đi hết 15 ải | 41 lần, 194 phút | 44 lần, 209 phút |
| Ải nào quá 9 lần (luật ✗ của cay.py) | không | không |
| Sức mạnh để bot thắng 75% (1-5 / 2-5 / 3-5) | 159 / 301 / 561 | 157 / > 292 / 539 |

Sức mạnh thắng 75% của mọi ải vẫn trong khoảng nhiễu của số đo bước 1 (4 lượt mỗi bản lưu) và không ải nào vượt khuyên dùng quá 15% → **`G.STAGE_REC` giữ nguyên** `[95, 105, 125, 140, 175, 180, 215, 260, 275, 305, 310, 330, 410, 420, 520]`.
(Lần đo giữa chừng với Sóng thần 3–4 tường và Bổ rìu thêm mảnh: 2-5 phải chơi 9,8 lần trung bình, một lượt 17 lần → đã sửa như mục 6.)

## 7. Đã chạy

- `node --check` mọi tệp JS đã sửa / thêm: boss.js, chieu_trum.js, mobs.js, data.js, stage.js, noi_gian.js, ngon_ngu_en.js, tests/node_trang.js — đạt.
- `python3 game/build.py` — đạt (dist/linh-khi.html, artifact.html, xuong-sprite*.html; tools/xuong-sprite/index.html, thu.html thêm `noi_gian.js`).
- `python3 tools/ngon-ngu/kiem.py noi-gian game/js/noi_gian.js` — 0 mục thiếu.
- Bot cân bằng như mục 6; ảnh soát tĩnh như mục 5. KHÔNG chạy bài test game nào, không mở trình duyệt.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0` (cloud.js, cloud_ui.js, firebase-config.js không đổi; bot Node chạy `?cloud=0`).

## 8. Tệp

- Mới: `game/js/noi_gian.js` (hình nổi giận, tinh anh nổi giận, màn đỏ pha 3); `tools/ngon-ngu/tu-dien/noi-gian.json`; thư mục này: `ve_xem.py`, `xem-noi-gian.png`, `xem-noi-gian.json`, `do_trum.py`, `bao-cao.md`.
- Sửa: `game/js/data.js` (bảng `G.NOI_GIAN`, cờ `?giancu=1`), `game/js/boss.js` (tốc, sàn báo trước, nghỉ, nối chiêu, đợt thêm, sát thương / di chuyển / mệt / đạn theo pha, trùm nhỏ 2 pha, hình), `game/js/chieu_trum.js` (đợt thêm của 5 chiêu trùm vùng mới + 2 chiêu trùm nhỏ, mệt theo pha, sàn báo trước Hồ ly phân thân), `game/js/mobs.js` (tinh anh nổi giận, hình trùm nhỏ / tinh anh, hình pha 2 trùm nhỏ theo `b.phase`), `game/js/stage.js` (vạch pha 50% trên thanh máu trùm nhỏ), `game/js/ngon_ngu_en.js` (4 chữ), `game/index.html` (+ `noi_gian.js`), `game/tests/balance.py` (`--trum`), `game/tests/node_trang.js` (`LK_Q`), `game/dist/*`, `tools/xuong-sprite/*` (build.py).

## 9. Lưu ý / chưa làm

- Bot là mô hình né đơn giản (phản xạ 0,2 s, đi bộ ra khỏi vùng, lộn 50%) — rất nhạy với báo trước quanh 0,6 s và với đòn cận chiến to. Người chơi lộn được sẽ thấy trùm khó hơn bot đo; nếu thấy dễ quá, nâng dần `G.NOI_GIAN.vung.sat` (0,5 / 0,45 → 0,6 / 0,5 …) — mọi số ở một chỗ.
- 2-5 Ngư Tinh vốn khó nhất với bot (bản lưu dưới khuyên dùng: 293 / 305; Bổ rìu san hô pha 1 là nguồn mất máu lớn nhất cả trước phiên này).
- Chiêu riêng của tinh anh mới (Nhảy dập, Phồng lăn, Đổ dầu) có nhịp bên trong cố định: nổi giận chỉ rút ngắn lấy đà, cử động và hồi chiêu, không nén khoảng giữa các cú nhảy / lăn.
- Đợt thêm của Bổ rìu, Rừng gai vòng 4–5 dùng lại cử động chiêu (không có ảnh hiệu ứng riêng cho vết nứt thêm).
