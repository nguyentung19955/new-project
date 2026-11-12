# Quy cách ảnh cho bản Unity

> Bản gốc (người dùng sửa ở đó): https://claude.ai/artifact/LQVWjiU5bWKrbhEPby7FAt — file này là bản chép vào kho, đồng bộ lần cuối 12/11/2026 21:45 (bản sửa 11). Khi hai bản khác nhau thì theo bản gốc và chép lại vào đây.

Nov 12, 2026 · @Tung

Bước 1 (hình giống web) **không cần ảnh mới**: Unity dùng nguyên 1 900 ảnh hiện có. Quy cách này dành cho ảnh MỚI hoặc vẽ lại, để Unity tự làm animation (gắn xương, xoay, co giãn) thay cho dải khung vẽ sẵn.

## Nguyên tắc chung

Mọi ảnh giao là PNG nền trong suốt (hoặc PSD có lớp), cùng góc nhìn và ánh sáng với bộ hình hiện tại, vẽ to gấp 2–3 lần cỡ hiển thị lớn nhất.

| Mục | Quy cách |
| --- | --- |
| Định dạng | PNG 32-bit (RGBA), nền trong suốt, không nén mất dữ liệu. Hoặc PSD/PSB: mỗi bộ phận 1 lớp (Unity nhập thẳng PSD và gắn xương) |
| Hệ màu | sRGB. Không viền trắng/đen quanh nét (halo): cạnh trong suốt phải sạch |
| Góc nhìn | Đầu súng xoay đủ 360° nên vẽ NHÌN THẲNG TỪ TRÊN XUỐNG, nòng chĩa lên trên; bệ ụ cũng nhìn từ trên. Quái và trùm giữ góc nhìn của bộ hiện tại (xem ảnh mẫu) |
| Ánh sáng | Giữ hướng sáng của bộ hiện tại (đối chiếu ảnh mẫu); với đầu súng xoay, ánh sáng nên dịu, không lệch hẳn một phía; bóng đổ KHÔNG vẽ vào ảnh (Unity vẽ bóng riêng để đi theo animation) |
| Phong cách | Giữ đúng bộ hiện tại: nét viền, độ bão hoà, kiểu kim loại/đá quý. Gửi kèm 3–5 ảnh cũ làm mẫu khi nhờ vẽ hoặc tạo bằng AI |
| Canvas | Hình vuông, cạnh là lũy thừa của 2 (256, 512, 1024, 2048). Mọi lớp của 1 đối tượng dùng CHUNG 1 canvas và đứng đúng vị trí: chồng lên là ra hình gốc |
| Vùng an toàn | Chừa trống ít nhất 8% mỗi cạnh để còn chỗ cho animation (nhún, giật, phát sáng) không bị cắt |
| Phần bị che | Vẽ ĐỦ phần bị bộ phận khác che (thân sau tay, ruột hộp, chân sau) — khi cử động mới không lộ chỗ trống |
| Tâm xoay và điểm gắn | Ghi trong file `<tên>_diem.json` (toạ độ pixel trên canvas) hoặc đánh dấu bằng chấm màu trên 1 lớp `_diem` riêng |
| Cỡ hiển thị tham chiếu | Màn logic 430×860; 1 ô bàn ≈ 49 đơn vị; trên iPhone XS Max ≈ 140 pixel thật, trên máy tính bảng tới ≈ 200 |

## Ụ súng (97 loại)

Mỗi ụ gồm bệ đứng yên và đầu xoay; Unity tự làm xoay, giật lùi, nhún, chớp nòng, phát sáng — người vẽ chỉ cần tách đúng lớp.

| Lớp | Tên file | Bắt buộc | Canvas | Ghi chú |
| --- | --- | --- | --- | --- |
| Bệ | `<id>_de.png` | Có | 512×512 | Nhìn từ trên, tâm bệ = tâm canvas. Hiện tại 179×179 |
| Đầu súng | `<id>_nong.png` | Có | 512×512 | Nòng chĩa THẲNG LÊN; trục xoay = tâm canvas. Hiện tại 300×300 |
| Viền bậc | `<id>_vien.png` | Giữ như cũ | 512×512 | Vòng viền theo bậc (Trắng/Xanh/Tím/Vàng/Đỏ). Hiện tại 203×203 |
| Lớp phụ | `<id>_phu.png` | Giữ như cũ | 512×512 | Lớp phụ hiện có của bộ web |
| Lớp phát sáng | `<id>_nong_sang.png` | Nên có | 512×512 | Chỉ các phần tự phát sáng (đá quý, đèn, lõi). Unity tăng giảm độ sáng khi nạp chiêu, lên sao |
| Bộ phận chuyển động | `<id>_nong_<bộ phận>.png` | Tuỳ ụ | 512×512 | Ví dụ cụm nòng quay (Liên Thanh), nắp (Hộp Bí Ẩn), cánh (Drone). Vẽ đủ phần bị che bên dưới |
| Dạng lớn dần | `<id>_nong_d1/_d2/_d3.png` | Chỉ ụ grow-up | 512×512 | Ụ đổi dạng khi đạt điều kiện (Overlord, Sói, Cuồng Nộ, Lò Phản Ứng…): 3 đầu, cùng trục xoay |

**Điểm bắt buộc ghi trong `<id>_diem.json`** (pixel trên canvas 512):

- `nong`: đầu mỗi nòng khi đầu chĩa lên (ụ nhiều nòng ghi đủ từng nòng, theo thứ tự bắn). Ví dụ `{"nong": [[256, 40]]}`.
- `xoay`: trục xoay của từng bộ phận chuyển động (nếu có).

**Lưu ý luật:** vị trí đạn xuất phát trong trận đã được chốt thành số luật lấy từ ảnh web cũ. Điểm `nong` của ảnh mới chỉ dùng để VẼ chớp nòng và đạn đúng chỗ; muốn đổi vị trí đạn thật là đổi luật, phải kiểm lại với web.

**Sao, số cấp, vòng nạp chiêu** là giao diện do Unity vẽ, KHÔNG vẽ vào ảnh ụ.

### Ụ có chùm nòng quay (Liên Thanh và các ụ nhiều nòng xoay)

Bài học từ bộ mẫu ngày 12/11: Liên Thanh vẽ nghiêng (chùm nòng dựng đứng như cột) không dùng được. Khi đầu xoay theo quái, ảnh trông như miếng dán bị vặn, còn nòng thì không thể quay thật vì chỉ có 1 ảnh. Từ nay các ụ này làm theo **cách A: vẽ 4 khung chùm nòng, Unity lật khung để tạo cảm giác quay**.

- **Góc nhìn:** thẳng từ trên xuống, giống bệ. Chùm nòng nằm dọc, chĩa THẲNG LÊN mép trên canvas, nhìn thấy 4–6 ống nòng song song cạnh nhau. Không vẽ nghiêng, không vẽ miệng nòng tròn hướng về người xem.
- **Tách lớp** (cùng canvas 512×512, cùng vị trí, không tự căn giữa lại từng file):
  - `lien_nong_than.png`: khối thân và vòng kẹp giữ nòng, KHÔNG có nòng. Vẽ đủ phần thân nằm dưới chùm nòng.
  - `lien_nong_cumnong_1.png` … `lien_nong_cumnong_4.png`: chỉ chùm nòng, 4 khung quay.
  - `lien_nong_sang.png`: chỉ đèn và đá quý trên thân.
- **Cách vẽ 4 khung quay:** viền ngoài của chùm nòng giữ y hệt nhau ở cả 4 khung, chỉ chi tiết bên trong dịch đi. Mỗi khung, các ống nòng cùng gờ sáng và vết bóng trên nòng dịch ngang ¼ khoảng cách giữa 2 nòng, luôn theo cùng một chiều. Khung 4 nối tiếp sang khung 1 phải liền mạch để lặp vòng không bị giật.
- **Unity tự làm:** khi bắn thì lật khung nhanh (khoảng 20–30 khung/giây); khi ngừng bắn thì chậm dần rồi dừng. Unity cũng thêm giật lùi, chớp nòng và hơi nóng ở đầu nòng, người vẽ không cần vẽ những thứ này.
- **Ghi trong `lien_diem.json`:** `nong` ghi đầu từng nòng nhìn thấy ở khung 1, theo thứ tự từ trái sang phải; không cần `xoay.cumnong` nữa.
- **Kiểm trước khi gửi:** ghép 4 khung thành ảnh động và xem lặp vài vòng. Chùm nòng phải trông như đang quay, viền ngoài không được rung hay nhảy.

## Quái thường (14 loại)

Quái nhỏ giữ kiểu **dải khung** (rẻ, ổn định ở cỡ nhỏ); chỉ quái to mới nên tách lớp để Unity gắn xương.

**Kiểu A — dải khung (mặc định cho mọi quái):**

- 1 file = 1 hàng ngang 8 khung đi bộ, khung vuông bằng nhau, không khoảng hở: `quai_<id>_8.png`. Khung 256×256 → file 2048×256. Hiện tại khung 112–280 px.
- Chân quái chạm cùng một đường ngang ở mọi khung (để không nhảy lên xuống); tâm quái = tâm khung.
- Vòng lặp khép kín: khung 8 nối mượt về khung 1.
- Hướng nhìn: bản hiện tại chỉ có 1 hướng. Nếu muốn quái quay đúng hướng khi rẽ: thêm `quai_<id>_side_8.png` (đi ngang, mặt sang phải — Unity lật cho sang trái) và `quai_<id>_back_8.png` (đi ra xa).
- Không vẽ hiệu ứng trúng đòn, chết, đóng băng vào dải: Unity tự làm (chớp trắng, lắc, vỡ, phủ màu băng).

**Kiểu B — tách lớp (chỉ quái to, tuỳ chọn):** 1 PSD hoặc nhiều PNG cùng canvas 1024×1024, các lớp tối thiểu: `than`, `dau`, `tay_trai`, `tay_phai`, `chan_truoc`, `chan_sau` (hoặc phần tương ứng: vỏ, khiên, cánh), mỗi lớp vẽ đủ phần bị che; ghi khớp xoay trong `_diem.json`.

| Quái | Tên | Ảnh hiện có | Đề xuất |
| --- | --- | --- | --- |
| `bo` | Crawler | Dải riêng | A |
| `bay` | Flyer | Dải riêng | A |
| `bay_bang` | Frost Flyer | Dải riêng | A |
| `khong_lo` | Giant | Dải riêng | **B — mẫu thử đầu tiên** |
| `tach` | Splitter | Dải riêng | A |
| `que_tach` | Big Splitter | Dải riêng | A hoặc B |
| `nho` | Spawnling | Mượn ảnh Splitter | A (riêng) |
| `bay_dan` | Swarmling | Mượn ảnh Splitter | A (riêng) |
| `toc_hanh` | Runner | Mượn ảnh Crawler | A (riêng) |
| `tinh_anh` | Elite | Mượn ảnh Giant | B |
| `bo_khien` | Shield Beetle | Chưa có dải | A + lớp khiên riêng `_khien` (Unity cho vỡ khi hết khiên) |
| `nam_hoi` | Healer | Chưa có dải | A |
| `ca_no` | Exploder | Chưa có dải | A |
| `ma_troi` | Wisp | Chưa có dải | A (Unity làm mờ khi tàng hình) |

## Trùm (12 con)

Trùm dùng rig nhiều lớp: Unity tự làm đi, nhún, lấy đà, tung chiêu, trúng đòn, chết — không cần vẽ dải khung đi bộ hay dải đánh.

- 1 PSD/PSB, hoặc PNG từng lớp cùng canvas 1024×1024; chồng đủ lớp = ảnh trùm nguyên vẹn (hiện tại ảnh nguyên 340–398 px).
- Chân/đáy trùm chạm vạch ngang ở 85% chiều cao canvas; tâm ngang = giữa canvas.
- Mỗi bộ phận cử động riêng = 1 lớp, vẽ đủ phần bị che; phần ruột lộ ra khi mở (hộp, nắp, miệng) = lớp `_ruot` riêng.
- Lớp phát sáng tách riêng `_sang_<bộ phận>`; khớp xoay ghi trong `trum_<id>_diem.json`.
- Có mắt/miệng thì thêm biến thể cùng vị trí: `mat_mo`, `mat_nham`, `mieng_ha`.

| Trùm | Hiện có | Cần tạo thêm |
| --- | --- | --- |
| joker\_king | Đủ 7 lớp | Không |
| jammer | Thân, ăng-ten, vành gai | Không |
| janus | Khối, 8 mảnh bay | Không |
| twin\_core | 2 lõi, khối nối, tia | Không |
| octopus | Chậu, hoa lửa | Không |
| mad\_crown | Thân thạch, vương miện | Không |
| patcher | Bánh răng, khung cờ lê | Không |
| hive | Tổ, 3 con ong | Nắp tổ + ruột tổ (nếu muốn chiêu mở tổ) |
| **freezer** | 1 khối băng liền | Mũ băng/nhũ băng phía trên; lõi bông tuyết bên trong vẽ đủ |
| **leech** | 1 thân liền | Đầu/miệng riêng + hình miệng há; thân chia 3–4 khúc |
| **nightmare** | 1 hình liền | Mắt (+ mí để chớp), 2 sừng, 2 cánh lửa, thân |
| **prism** | 1 hình liền | Viên pha lê giữa, 3 viên ngoài, khung vòng (vẽ đủ phần bị che) |

Không cần vẽ: bóng đổ, hiệu ứng chiêu, số máu, khiên Prism — Unity vẽ riêng.

## Hiệu ứng

Phần lớn hiệu ứng Unity tự tạo bằng hệ hạt; chỉ cần vài texture nhỏ, còn đạn/nổ/trúng đòn đặc trưng mỗi ụ thì giữ ảnh cũ hoặc vẽ dải khung.

| Loại | Tên file | Quy cách |
| --- | --- | --- |
| Đạn của ụ | `fx_<id>_dan.png` | 1 hình, đầu đạn hướng SANG PHẢI, canvas 256×128. Hiện tại \~280×140 |
| Chớp nòng / nổ | `fx_<id>_no_8.png` | Dải 8 khung vuông 256×256 (file 2048×256), khung 1 nhỏ nhất → bung → tan; nền trong suốt, dùng kiểu cộng sáng (additive) nên nền đen cũng được |
| Trúng đòn | `fx_<id>_trung_8.png` | Như trên |
| Hiệu ứng chiêu / vùng | `fx_<id>_hieu_8.png` hoặc 1 hình | Vòng/vùng nhìn từ trên, tâm = tâm canvas 512×512 |
| Texture hạt dùng chung | `hat_<tên>.png` | 64×64 hoặc 128×128, trắng xám (Unity tô màu): chấm tròn mềm, tia lửa, khói, mảnh vỡ, ngôi sao, tia sét, bông tuyết. Khoảng 10–15 file là đủ cho mọi ụ |
| Tía lửa, khói, than, bụi | — | Không cần ảnh: Unity tạo bằng hệ hạt từ texture dùng chung |

Hiện web có 1 578 ảnh hiệu ứng; bước giống web dùng lại toàn bộ, chỉ thay dần những cái được duyệt làm mới.

## Đặt tên và giao file

Tên file dùng đúng mã `<id>` của game (chữ thường, không dấu, gạch dưới), để công cụ nhập ảnh của Unity tự nhận.

- Thư mục giao: `Giao/<ngay>_<nhom>/` — ví dụ `Giao/2026-11-15_trum_freezer/`.
- Ụ: `<id>_de`, `<id>_nong`, `<id>_vien`, `<id>_phu`, `<id>_nong_sang`, `<id>_nong_<bộ phận>`, `<id>_nong_d1..d3`, `<id>_diem.json`.
- Quái: `quai_<id>_8`, `quai_<id>_side_8`, `quai_<id>_back_8`; tách lớp: `quai_<id>.psd` hoặc `quai_<id>_<lớp>.png`.
- Trùm: `trum_<id>.psd` hoặc `trum_<id>_<lớp>.png`, `trum_<id>_diem.json`.
- Hiệu ứng: `fx_<id>_dan`, `fx_<id>_no_8`, `fx_<id>_trung_8`, `fx_<id>_hieu_8`, `hat_<tên>`.
- Danh sách mã `<id>` của 97 ụ, 14 quái, 12 trùm: lấy từ tên file ảnh hiện có trong `thap/assets` (Claude xuất bảng đầy đủ khi cần).

**Kiểm trước khi giao:**

- [ ] Nền trong suốt, không viền trắng/đen quanh nét
- [ ] Đúng canvas, chồng các lớp lên ra đúng hình gốc
- [ ] Phần bị che đã vẽ đủ
- [ ] Đầu súng chĩa thẳng lên, trục xoay ở tâm
- [ ] Dải khung: 8 khung bằng nhau, chân cùng 1 đường, khung 8 nối về khung 1
- [ ] Có file `_diem.json` (đầu nòng, khớp xoay)
- [ ] Đúng tên file theo mã `<id>`
- [ ] Cùng phong cách với ảnh mẫu đã gửi

## Thử nghiệm và duyệt

Không tạo hàng loạt trước khi mẫu thử được duyệt trong Unity.

1. **Mẫu thử:** tạo theo quy cách này cho 1 trùm (đề xuất freezer), 1 quái to (Giant) và 2 ụ (1 ụ một nòng, 1 ụ có bộ phận chuyển động, ví dụ Liên Thanh).
2. **Claude nhập vào Unity:** gắn xương, làm animation đi, chờ, tung chiêu, trúng đòn, chết; quay video ngắn và ảnh tổng hợp các pha.
3. **Duyệt:** người làm game xem video, chốt hoặc sửa quy cách (góc nhìn, cỡ, độ chi tiết, cách tách lớp).
4. **Tạo hàng loạt theo đợt:** đợt 1 = ụ của đội hình đầu game + các quái + 4 trùm thiếu lớp; các ụ còn lại bổ sung theo đợt, mỗi đợt duyệt bằng ảnh tổng hợp.
5. **Kiểm trên máy thật:** mỗi đợt ảnh mới đo lại hiệu năng trên iPhone XS Max và Android yếu (ảnh to hơn làm nặng bộ nhớ).

Khi tạo bằng AI: đưa kèm 3–5 ảnh cũ cùng loại làm mẫu phong cách, yêu cầu nền trong suốt và đúng góc nhìn; tách lớp thường phải làm thêm bằng tay hoặc công cụ tách lớp, rồi vẽ bù phần bị che.

## Bổ sung 12/11/2026 — cách gen bằng ChatGPT (rút từ đợt mẫu thử Freezer / Giant / Gatling / Scatter)

Quy cách ở trên là chuẩn của FILE GIAO. Phần này là cách ra được file đó khi người dùng gen ảnh bằng ChatGPT rồi Claude xử lý.

- **Mỗi đối tượng 1 lần gen riêng**: gửi 1 ảnh tham chiếu (ảnh web cũ, nền xám) + 1 khối prompt tiếng Anh hoàn chỉnh. Không gộp nhiều đối tượng vào 1 ảnh (ChatGPT chỉ xuất ~1254 px; ô 2×2 còn ~480 px mỗi hình).
- **Nền hồng đặc #FF00FF**, không xin nền trong suốt. Claude tách nền: nền ChatGPT không thuần (lệch tới ~55 đơn vị màu ở mép) → ngưỡng `alpha = clip((d-65)/60)` với d = khoảng cách tới (255,0,255), rồi khử ám hồng ở mép.
- **Ảnh nhiều lớp**: xin 1 tờ lưới 2×2 (hoặc 2×1): ô 1 = hình ráp đủ, các ô còn lại = từng lớp "cùng cỡ, cùng vị trí trong ô", có vẽ phần bị che. Lớp nào ChatGPT vẽ lệch dạng thì gen lại riêng lớp đó, đính chính tờ lưới làm tham chiếu.
- **Đầu súng**: mục tiêu là hình nhìn THẲNG TỪ TRÊN, nòng nằm dọc chĩa lên. Lệnh "top-down view" trần trụi làm ChatGPT vẽ thành nhìn thẳng vào miệng nòng; lệnh "xoay hình nhìn ngang 90°" thì ra hình nghiêng 3/4, nòng dựng như cột (mẫu Liên Thanh 12/11 — đã bị loại). Prompt phải nói rõ cả hai: "flat orthographic view from directly above, like a blueprint; the barrels lie flat as long parallel tubes pointing to the top edge; no perspective, no visible muzzle holes, no 3/4 angle". Bệ ụ hiện có đã là nhìn từ trên → giữ nguyên, không gen lại.
- **Ụ chùm nòng quay**: chỉ nhờ ChatGPT vẽ thân + 1 chùm nòng; 4 khung quay do Claude dựng bằng máy (giữ viền ngoài, dịch hoạ tiết bên trong ¼ khoảng cách nòng mỗi khung) rồi tự xem ảnh động trước khi giao.
- **Lớp phát sáng xanh lơ của ụ**: lớp ChatGPT vẽ riêng bị lệch chỗ → Claude lọc từ chính hình ráp (khớp tuyệt đối nhưng thô). Muốn đẹp: gen riêng 1 ảnh chỉ lớp sáng, đính hình ráp.
- **Lớp sáng tím/hồng trên nền hồng** (vết nứt Giant…): tách bằng kênh G và (255−R), không dùng khoảng cách tới màu hồng.
- **Quái / trùm không tay chân** (đúng hướng thiết kế của game): tách theo bộ phận thật của nó (thân, rêu/mũ/nắp, lõi sáng), không theo "thân, đầu, tay, chân". Trùm không vẽ mắt/mặt trừ khi người dùng yêu cầu.
- **`_diem.json` do Claude đo từ ảnh** (trục xoay = tâm canvas theo cách ảnh web cũ; đầu nòng; khớp), người gen ảnh không cần làm.
- **Claude phải tự xem ảnh xem trước** (ráp lại + từng lớp trên nền tối) và nói thật chỗ còn yếu trước khi báo đạt.
- File giao đặt ở `Giao/<ngày>_<nhóm>/`; công cụ cắt lớp mẫu: xem `tools/unity-cat-lop-mau.py`.
