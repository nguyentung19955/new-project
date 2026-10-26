# Lam – rig "tay chân rời" v2 (sửa theo YEU-CAU-RIG-V2 + đủ chu kỳ chạy)

Làm theo `../YEU-CAU-RIG-V2.md`. rig-v1 giữ nguyên ở `../rig-v1/`.
Không gen ảnh AI: mọi mảnh lấy từ `3-bang-manh.png`, phần sửa mũ lấy điểm ảnh từ `2-nhin-ngang.png`.
Tư thế/chu kỳ do người đặt mốc bằng số (không IK). **Chưa chạy thử trên iPhone/Safari** – mọi số "px logic" là tính toán.
Đã sửa gì, số đo, cái còn chưa đẹp, câu hỏi cần quyết: **GHI-CHU.md**.

## Xem gì trước
| File | Nội dung |
|---|---|
| `chay/chay-112px-x4.gif` | **Chu kỳ chạy** 112 px logic phóng ×4 (nearest) – 32 khung × 20 ms = 0,64 s |
| `chay/chay-112px.gif` | đúng cỡ 112 px logic 1:1 |
| `chay/chay-lon.gif`, `chay/chay-lon-cham-x4.gif` | cỡ lớn (½ ảnh ngang); bản chậm ×4 để soi chân bám đất |
| `chay/chay-contact-sheet.png` | toàn chu kỳ 32 khung: lớn + 112 px 1:1 + bóng; ghi ms, ủng nào đang chịu lực |
| `tu-the/01-bang-duyet.png` | 4 tư thế mới (lấy từ chu kỳ): màu/bóng, lớn, 112 px 1:1, ×4 |
| `tu-the/02-so-sanh-v1-v2.png` | rig-v1 ↔ rig-v2, cùng khung |
| `tu-the/03-sua-gay-mu.png` | sửa gáy mũ/chóp phóng to (ảnh mẫu / v1 / v2 / vùng lệch / 112 px ×4) |
| `tu-the/06-thu-toi-10.png`, `chay/chay-toi10-*.gif` | thử tối tay sau + ủng xa 10 % (có/không) |
| `chay/bieu-do-van-toc-ung.png` | vận tốc ngang điểm chạm của ủng chịu lực so với tốc độ đất; vận tốc giữa đế; khe hở ↔ đất |
| `chay/bieu-do-vong-noi.png` | vị trí các nút qua chỗ nối khung cuối → đầu |
| `so-lieu.json`, `chay/van-toc-ung.csv` | mọi số đo (640 mẫu/chu kỳ cho vận tốc) |

Mọi ảnh/GIF dùng **cùng một khung cố định**: cùng gốc (tam giác xanh dưới đất), cùng canvas, cùng đường đất đỏ.
Vạch xám dưới đất trôi sang trái đúng tốc độ đất → ủng đang chịu lực phải đứng yên so với vạch.

Ảnh duyệt khác trong `tu-the/`: `00-nghi-so-sanh.png` (dáng nghỉ ↔ ảnh mẫu, IoU), `04-chop-mu-lac.png` (chóp −10…+10°),
`05-ung-chuan-hoa.png` (hai ủng v1 ↔ v2), `07-tay-sau-duong-di.png` (đường đi tay sau v1 ↔ v2), `08-manh.png` (mảnh + pivot),
`tu-the-<ten>-lon.png / -112px.png / -112px-x4.png`.

## Chạy (độc lập – chỉ cần thư mục rig-v2)
```
pip install pillow numpy scipy matplotlib
cd code
python3 chay_het.py           # chạy hết ~4–5 phút (kể cả dò cỡ mảnh ~1 phút), kết thúc bằng kiem_tra
python3 chay_het.py --nhanh   # bỏ tách/dò cỡ, dùng lại manh/goc/ (~2 phút)
```
Ảnh nguồn đã chép kèm trong `nguon/`: `2-nhin-ngang.png`, `3-bang-manh.png`, `1-mau-chuan-nhin-cheo.png` (chỉ để tham
khảo), và `nguon/rig-v1/` (bản sao `lam-moi.json` + `manh/` + `rig_v1.py` của rig-v1, chỉ để vẽ ảnh so sánh v1 ↔ v2).
Đã thử: chép riêng `rig-v2/` ra chỗ khác, xoá hết đầu ra, chạy `chay_het.py` → ra lại y hệt, kiểm tra ĐẠT.

Từng bước (thứ tự):
```
python3 tach_manh.py   # 1a tách 9 mảnh từ nguon/3-bang-manh.png → manh/goc/
python3 khop_co.py     # 1b dò cỡ/góc/tâm từng mảnh trên nguon/2-nhin-ngang.png → manh/goc/khop.json
python3 chuan_hoa.py   # 1c phóng mảnh về cỡ ảnh ngang; HAI ỦNG CÙNG CỠ → manh/*.png
python3 sua_mu.py      # 1d sửa gáy mũ/chóp bằng code; tạo lớp manh/mu-gay.png
python3 chu_ky.py      # 2–3 rig + chu kỳ chạy + 4 tư thế → lam-moi-v2.json
python3 phan_tich.py   # số đo vận tốc/vòng nối/tay sau → so-lieu.json, chay/bieu-do-*.png, chay/van-toc-ung.csv
python3 duyet.py       # ảnh duyệt → tu-the/
python3 chay.py        # GIF + contact sheet → chay/
python3 kiem_tra.py    # kiểm tự động (mã thoát 1 nếu lỗi)
```
Chỉnh chuyển động: sửa các bảng mốc ở đầu `code/chu_ky.py` (`UNG_NHAC`, `UNG_GOC`, `UNG_X_BAY`, `THAN_DY`, `MU_*`,
`CHOP`, `CHUONG`, `TAY_SAU_*`, `CHU_KY_S`, `DUTY`) rồi `python3 chay_het.py --nhanh`.

## File code
| File | Việc |
|---|---|
| `chung.py` | đường dẫn (tương đối, trỏ vào `nguon/`), font, tách nền trắng, khử viền trắng |
| `tach_manh.py`, `khop_co.py` | như v1 (tách mảnh, dò cỡ) |
| `chuan_hoa.py` | phóng mảnh; **mới**: hai ủng cùng diện tích bóng |
| `sua_mu.py` | **mới**: sửa gáy mũ/chóp từ điểm ảnh ảnh ngang, tạo lớp gáy mũ |
| `rig.py` | cây xương, ma trận, vẽ; ủng đặt theo (x, khe hở, góc) – điểm thấp nhất đúng mặt đất |
| `noi_suy.py` | Hermite bậc 3 tuần hoàn, tiếp tuyến không vượt (Fritsch–Butland) + kiểm vượt bằng số |
| `chu_ky.py` | bảng mốc chu kỳ, tích phân lăn đế không trượt, 32 khung + 4 tư thế, ghi JSON |
| `khung.py` | khung cố định, nền, đường đất, vạch đất trôi |
| `phan_tich.py`, `duyet.py`, `chay.py`, `kiem_tra.py` | đo đạc, ảnh duyệt, GIF, kiểm tra |

## Dùng JSON trong game (gợi ý, chưa làm)
`lam-moi-v2.json`: vẽ theo `rig.thu_tu_ve`; mỗi nút `W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc)`, vẽ ảnh mảnh sao cho
`pivot` trùng gốc nút. `chu_ky.khung[k]` (32 khung, 20 ms/khung) đã tính sẵn **mọi** `dich/goc` – chỉ cần áp công thức,
không cần IK hay tự bắt đất. Muốn mượt hơn 32 khung thì nội suy giữa hai khung kề (sai lệch rất nhỏ) hoặc tính lại từ
`chu_ky.kenh`. Gốc cố định; đất/nền trôi sang trái `chu_ky.van_toc_dat_px_moi_s` (px ảnh ngang/s) × `he_so_112`.
Đơn vị = px ảnh ngang; nhân `so-lieu.json → he_so_112` (≈ 0,1046) ra px logic. Góc dương = thuận kim đồng hồ (giống
`ctx.rotate`). Làm tối thử: `lam_toi_thu` (mặc định tắt).
