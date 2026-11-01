# Báo cáo Luồng B – Dựng màn Vùng 1 "Ruột Cây Than Khóc" (Đợt 1)

## Đã làm
- **9 phòng** `game/vung-1/phong/P01…P12.json` đúng `DINH-DANG-PHONG.md`: P01, P02, P03 (+ hốc H1), P04, P05, P06, P09, P11, P12.
- **`game/vung-1/ban-do.json`**: `phong_dau: "P01"`, `bat_dau`, danh sách phòng có `x, y, rong, cao_bd` (đơn vị bản đồ nhỏ = **10 ô phòng**, số lẻ được) + `x_o, y_o, w, h` (vị trí thật tính bằng ô phòng trên bản đồ thế giới; mọi cửa nối khớp đúng toạ độ thế giới) + `ket_noi`.
- **Công cụ** `game/vung-1/cong-cu-man/`:
  - `dung-phong.py` – dựng toàn bộ phòng bằng lệnh khoét (khoang tròn, hầm cong, gờ, dây leo). Sửa phòng thì sửa file này rồi chạy `python3 dung-phong.py`.
  - `fiz.py` – vật lý nhân vật chép từ `game/thu-mat-na/dong-co-mn.js` (hộp 28×96 px, ô 48 px). Đo được: **nhảy thường cao ~2,7 ô / xa ~4 ô; nhảy đôi cao ~4,7 ô / xa ~7,5 ô** (`python3 fiz.py`).
  - `kiem-tra.py` – kiểm tra tất cả + vẽ ảnh xem trước `xem/P*.png` và `xem/ban-do.png`. Chạy `python3 kiem-tra.py` (~35 giây).
- **Kết quả kiểm tra hiện tại: 0 lỗi, 0 cảnh báo.**
  - Cửa khớp 2 chiều, hướng đối nhau, ô cửa thông, cửa ngang có sàn, mép phòng kín trừ cửa.
  - Mọi quái / vật phẩm / Chuông Lưu / điểm bắt đầu đứng trên sàn; quái đi tuần trên sàn liền.
  - Mô phỏng hộp (đi bộ + nhảy + nhảy đôi + dây leo; **không** bám/bật tường, **không** lướt; tường nứt coi là đặc): đi được P01 → P12, nhặt đủ 3 Chuông Vỡ **trước** khi cửa trùm mở; khi chưa đủ chuông thì không vào được P12; **mọi chỗ tới được đều quay ra được** (không kẹt); mọi chỗ đứng có ≥ 3 ô trống phía trên.
  - Tất cả vật phẩm nhặt được bằng hộp; 2 món trong H1 cần chém tường nứt.

## Danh sách phòng
| ID | Tên | Cỡ (cột×hàng) | Quái | Đồ | Ghi chú |
|---|---|---|---|---|---|
| P01 | Cửa Rễ | 48×20 | 1 Khuyết Cẩu | 3 Mảnh Âm | Hướng dẫn: đi → nhảy bậc → chui hầm thấp → nhảy hố tro → Khuyết Cẩu; tuỳ chọn nhảy đôi lên gờ mỏng, leo dây lên hốc trên. Bắt đầu ở (4,15). |
| P02 | Ngã Ba Mối | 60×34 | 2 Khuyết Cẩu, 1 Bọ Vỏ | Thẻ tên, 2 Mảnh Âm | Khoang mối tròn nhiều tầng. 3 lối: tây P01, đông-trên P03 (leo dây cột 51), đáy P06 (lối tắt sau tường nứt cột 13). |
| P03 | Xưởng Chuông | 70×30 | 1 Phu Đèn, 2 Bọ Vỏ | **Chuông Vỡ 1**, 2 Mảnh Âm, H1 | Hành lang trên → sảnh chuông. Chuông Vỡ 1 trên giàn (36,12): leo dây cột 42, nhảy sang. Ống khói bí mật cột 59–61 (nhảy đôi qua 2 mấu). Ra: giếng dây cột 57 xuống P04. |
| P04 | Hành Lang Tro | 90×18 | 1 Khuyết Cẩu, 3 Phu Đèn | **Tăng Máu**, thẻ tên, 2 Mảnh Âm | Rơi từ P03 ở cột 57, đi TÂY: dốc lên đỉnh tro (cột 30–35) rồi xuống hõm tro, lên cửa tây. Khoang thẻ tên trên cao (dây cột 21). Nhánh ĐÔNG cụt: giếng hẹp cột 80–83 → Tăng Máu. |
| P05 | Chuông Lưu | 32×16 | – | – | **Chuông Lưu 1** (15,12), xác người ngồi cạnh. |
| P06 | Hố Vỏ | 50×36 | 2 Bọ Vỏ, 2 Khuyết Cẩu | **Chuông Vỡ 2**, 3 Mảnh Âm | Gờ vào đông → bậc zig-zag xuống đáy. Đáy = đấu trường nhỏ, Chuông Vỡ 2 giữa (25,32). Dây cột 31 lên lối tắt P02. Hốc tường giả cột 3 (Mảnh Âm). Ra P09 ở đông-dưới. |
| P09 | Miệng Kèn | 44×44 | 3 Kèn Câm, 2 Phu Đèn | **Chuông Vỡ 3**, thẻ tên, 2 Mảnh Âm | Vào tầng giữa. Xuống giếng dây cột 19 tới khoang đáy lấy Chuông Vỡ 3, leo lại. Leo tầng zig-zag (mỗi bậc 2 ô); Kèn Câm đứng đầu tầng thổi ngang (T1 phải, T3 trái, gờ ra) → cửa đông-trên → P11. |
| P11 | Sảnh Chuông Vỡ | 56×24 | **tinh anh Vọng Tàn** | 1 Mảnh Âm | Bậc rễ xuống sảnh; Vọng Tàn giữa sảnh (`tinh_anh: true`). **Chuông Lưu cuối** ở hốc đông (50,18). Cửa đông → P12 **khoá cần 3 Chuông Vỡ**. |
| P12 | Đàn Chuông Câm | 64×22 | trùm (tự sinh) | – | Sàn phẳng hàng đứng 16, vòm cao, 2 sàn mỏng né. `trum_o: (40,16)`. |

## Đường chính
P01 → P02 (leo dây lên lối đông) → P03 (lấy **Chuông Vỡ 1** trên giàn) → giếng xuống P04 → đi tây → **P05 Chuông Lưu** → P06 (xuống hố, hạ quái, **Chuông Vỡ 2**) → P09 (xuống đáy lấy **Chuông Vỡ 3**, leo tầng) → P11 (hạ Vọng Tàn, nghỉ Chuông Lưu cuối, cửa mở vì đủ 3 chuông) → P12 trùm.
Lối tắt: từ đáy P06 leo dây cột 31 lên P02, chém tường nứt cột 13 (P02) → về P02/P01 nhanh.

## Bí mật / hốc thưởng
- **H1** (P03): tường nứt `N` cột 14 hàng 22–24 (dưới bậc xuống sảnh, có chuông nhỏ lệch nhịp làm dấu) → thẻ tên `P03-the-ten-H1`, 40 Mảnh Âm, hài cốt (trang trí).
- P01: gờ mỏng cao 4 ô (nhảy đôi) + hốc trên đỉnh dây.
- P02: khoang dưới sàn (xuống lỗ dây cột 18) có Mảnh Âm; tường nứt cột 13 = lối tắt P06.
- P03: ống khói cột 59–61 (2 mấu sàn mỏng, nhảy đôi hoặc bật tường) → 30 Mảnh Âm.
- P04: giếng hẹp đông cột 80–83 (mấu giữa, nhảy đôi / bật tường) → **Tăng Máu**; dấu hiệu bụi rơi.
- P06: tường giả `G` cột 3 hàng 30–32 → 35 Mảnh Âm.
- P09: hốc trái cao (nhảy đôi từ tầng T3) → thẻ tên.

## Quy ước / giả định đã tự quyết
- `hang` của quái / vật phẩm / Chuông Lưu / `bat_dau` = **ô trống** đứng trong (chân ở đáy ô) – đúng cách khuyên dùng trong `DINH-DANG-PHONG.md`.
- Cửa dọc luôn có **dây leo xuyên qua** (P02↔P06, P03↔P04) để đi lên/xuống chắc chắn với cách đặt nhân vật hiện tại của luồng A (đẩy lên rồi tự bám dây khi rơi).
- P07/P08/P10 chưa có ở Đợt 1 → tạm nối **P06 → P09** và **P09 → P11** trực tiếp. Đợt 2 sẽ chèn P07/P08 giữa P06–P09 và P10 giữa P09–P11 (đổi `toi`/`toi_cua`).
- Thẻ tên đặt đủ 4 chỗ theo nhiệm vụ B (P02/P04/H1/P09) dù nhiệm vụ để đợt sau – luồng A đã nhặt/lưu được.
- Không đặt Hạt Vọng (Đợt 1 chỉ yêu cầu 1 nâng cấp máu = Tăng Máu ở P04).
- Tường nứt lối tắt P02 vỡ được từ **cả hai phía**. Nếu muốn đúng "mở từ phía P06" thì luồng A có thể cho `N` này chỉ vỡ khi chém từ bên trái.
- Tuyến chính cần **nhảy đôi** ở vài chỗ (bậc 3–4 ô), không cần bám/bật tường, không cần lướt, không cần chém vỡ tường.
- Trường thêm (luồng A có thể bỏ qua): `trang_tri` (đồ trang trí theo ID, có `ghi`), `ghi_chu`, `trum_o`; trong `ban-do.json`: `x_o, y_o, w, h, ket_noi, chuong_luu, tinh_anh, trum`.
- Gợi ý cho luồng A: Chuông Vỡ 2 ở P06 có thể chỉ hiện khi đã hạ hết quái đấu trường; P04 cột 0–60 phủ khói tro mờ.

## Chỗ cần hình riêng (theo ID trong `trang_tri`)
- **Cổng rễ** `P01-cong-re` (sau lưng điểm bắt đầu). Gợi ý phím `P01-bien-nhay`, `P01-bien-day`.
- **Tường nứt** `P02-tuong-nut`, `P03-tuong-nut-H1` (3 mức nứt, bụi rơi). **Tường giả** `P06-tuong-gia`.
- **Chuông Lưu** (tắt/sáng) `P05-chuong-luu`, `P11-chuong-luu`; **xác người ngồi** `P05-xac`.
- **Hài cốt** `P03-hai-cot-H1`; **đầu lâu** `P01-dau-lau-1`, `P02-dau-lau`, `P03-dau-lau`, `P04-dau-lau`, `P06-dau-lau`, `P09-dau-lau`.
- P02 `P02-to-moi` (cột tổ mối treo trần). P03 `P03-lo-duc` (lò đúc chuông nguội), `P03-gian-chuong` (giàn gỗ + chuông đồng lớn treo dây).
- P04 `P04-khoi` (lớp khói tro), `P04-dau-hieu` (bụi rơi). P06 `P06-be-chuong` (bệ đá), `P06-vo-bo` (vỏ bọ khổng lồ).
- P09 `P09-mieng-ken` (miệng kèn đá khổng lồ trên trần). P11 `P11-chuong-vo-lon` (chuông đồng vỡ đôi), `P11-cua-trum` (cửa rễ 3 hốc chuông sáng dần).
- P12 `P12-tuong-me` (chỗ trùm), `P12-ong-chuong` (dàn ống chuông câm trên trần).

## Ảnh xem trước
`cong-cu-man/xem/P01.png … P12.png`, `xem/ban-do.png`. Màu: nâu = đặc, xanh đậm = chỗ hộp tới được, tím = chỉ tới được sau khi chém tường nứt, xanh lá = dây leo, cam = tường nứt, tím đậm = tường giả, vàng nhạt = sàn mỏng; đỏ = quái (vạch = đường tuần), vàng = Chuông Vỡ, hồng = Tăng Máu, tím nhạt = thẻ tên, chấm nhỏ = Mảnh Âm, khung xanh = Chuông Lưu, khung lục = cửa (đỏ = cửa khoá), vòng cam = đèn.
