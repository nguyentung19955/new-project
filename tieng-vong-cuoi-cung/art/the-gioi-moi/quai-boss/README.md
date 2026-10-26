# Quái chuông gỗ + Boss Chuông Gác Làng – rig "tay chân rời", animation, sprite sheet 2x

Làm theo cách của rig Lam đã duyệt (`art/modular/lam-moi/rig-v2/`): tách mảnh bằng code từ ảnh nguồn (không gen ảnh),
rig JSON cha–con, dáng do người đặt mốc, nội suy theo thời gian không vượt biên, kiểm bằng số, xuất sprite sheet 2x
cùng canvas/neo đất. **Chưa chạy thử trên iPhone/Safari** – mọi số "px logic" là tính toán.
Đã làm gì, cỡ chọn, cái còn chưa đẹp, câu hỏi cần quyết: **GHI-CHU.md**.

## Xem gì trước
| File | Nội dung |
|---|---|
| `xem-thu/so-co-voi-Lam-3x.png`, `-1x.png` | Lam (rig-v2) + quái + boss trên cùng đường đất, lưới ô 32 px, hitbox gameplay |
| `xem-thu/so-co-man-hinh-960x540.png` | cả ba trong khung màn hình game (đất ở FLOOR = 448) |
| `xem-thu/<nv>-<clip>-lon.gif` | cỡ lớn (quái 4×, boss 2×, vẽ mượt – không phóng ô vuông): đường đất, điểm neo (tam giác xanh), hitbox thân (khung xanh), **hộp đòn đỏ ở khung chạm** |
| `xem-thu/<nv>-<clip>-1x.gif` | đúng cỡ chơi 1:1 (1 px = 1 px logic), thu từ chính sprite sheet |
| `xem-thu/<nv>-contact-sheet.png` | mọi khung mọi clip, ghi số khung / ms / pha; khung chạm viền đỏ |
| `xem-thu/<nv>-nghi-so-sanh.png` | ảnh nguồn / rig ráp lại / chồng + IoU |
| `xem-thu/<nv>-manh.png`, `xem-thu/chi-tiet-bu-va-cat.png` | bảng mảnh + pivot; chỗ bù sau quả lắc và chỗ cắt xích |

`<nv>` = `quai` / `boss`. Clip quái: `dung` (đứng thở), `di` (đi tuần), `dam` (đấm), `trung` (trúng đòn), `chet`.
Clip boss: `dung`, `dap` (đập xuống), `quet` (quét ngang), `trung`, `chet`.

## Đầu ra
| Đường dẫn | Nội dung |
|---|---|
| `manh/quai/*.png`, `manh/boss/*.png` | mảnh RGBA cỡ gốc ảnh nguồn + `tach.json` (vị trí trên ảnh nguồn, cách bù/cắt) |
| `quai.json`, `boss.json` | rig (nút, pivot, thứ tự vẽ, đất, tỉ lệ) + mọi clip: mốc từng kênh + tư thế tính sẵn từng khung |
| `sprite/<nv>-<clip>-2x.png` (+ `-p2.png`) | sprite sheet RGBA 2x (2 px = 1 px logic), không nền/chữ/đường đất |
| `sprite/<nv>-<clip>-2x.json` | trang, ô từng khung, thời lượng (ms), điểm neo, khung chạm, pha, tỉ lệ, hitbox gameplay |
| `so-lieu.json` | kết quả kiểm tự động + số đo (49/49 ĐẠT) |

Sheet: quái khung 544×251, neo (265, 244); boss khung 1018×744, neo (538, 737) – mọi clip của một nhân vật cùng
khung, cùng neo. Neo x = giữa hai chân (quái) / trục chuông (boss); neo y = mặt đất. Nhân vật quay **trái**;
quay phải thì lật quanh neo x. Trang ≤ 4096 px mỗi chiều (clip boss dài chia 2 trang, JSON ghi `trang` của từng khung).

## Chạy (độc lập – chỉ cần thư mục `quai-boss/`)
```
pip install pillow numpy scipy
cd code
python3 chay_het.py           # ~6 phút: tách → rig → clip + sheet → ảnh xem thử → kiểm tra
python3 chay_het.py --nhanh   # bỏ vẽ sheet/GIF (~30 s), dùng để chỉnh mốc rồi kiểm số
```
Ảnh nguồn chép kèm trong `code/nguon/` (2 ảnh ChatGPT + ảnh Lam rig-v2 dáng nghỉ vẽ sẵn 4×). `lam_tham_khao.py` chỉ
dùng một lần để vẽ ảnh Lam đó (cần rig-v2); các bước khác không cần. Đã thử: chép riêng `code/` ra chỗ khác, xoá đầu
ra, chạy `chay_het.py` → chạy hết, kiểm tra ĐẠT.

| File code | Việc |
|---|---|
| `chung.py` | đường dẫn, font, tách nền trắng + khử viền trắng (chép từ rig-v2) |
| `tach_manh.py` | bước 1: tách mảnh, bù chỗ khuất sau quả lắc, cắt đoạn xích, chẻ đôi thân (clip chết) |
| `dung_rig.py` | bước 2: rig + dáng nghỉ, cỡ trong game (lý do ghi đầu file) |
| `rig.py` | ma trận, vẽ tư thế (siêu lấy mẫu), điểm thấp nhất (kiểm xuyên đất) |
| `noi_suy.py` (rig-v2), `noi_suy_mo.py` | Hermite bậc 3 tiếp tuyến Fritsch–Butland: clip lặp / không lặp |
| `dong_tac.py` | mốc → kênh → tư thế; kênh `nhac` (khe chạm đất giải từ hình), `lac` (góc treo tuyệt đối) |
| `clip_quai.py`, `clip_boss.py` | **bảng mốc đặt tay** của từng clip + nhịp lấy từ gameplay |
| `xuat.py` | ghi JSON clip, vẽ sprite sheet 2x |
| `xem_thu.py` | GIF, contact sheet, so cỡ, ảnh duyệt |
| `kiem_tra.py` | kiểm tự động → `so-lieu.json` |

Chỉnh chuyển động: sửa mốc trong `clip_quai.py` / `clip_boss.py` rồi `python3 chay_het.py --nhanh` (xem kiểm tra),
sau đó chạy đủ để vẽ lại sheet.

## Dùng trong game (gợi ý, chưa làm – không sửa `game/demo.html`)
- **Sheet**: vẽ ô `frames[i]` sao cho `diem_neo` trùng chân thực thể (giữa đáy hitbox), ở ½ cỡ. Thời lượng theo `ms`
  (quái 33,3 ms = 2 tick; boss 50 ms = 3 tick; quái đứng 66,7 ms). Khung chạm (`khung_cham`) là để căn hình với cửa
  sổ gây sát thương của gameplay – sát thương vẫn tính bằng hitbox/tick trong code game.
- **Rig trực tiếp** (nhẹ hơn nhiều cho boss): `quai.json` / `boss.json` có `clip.<ten>.khung[k].tu_the` tính sẵn;
  mỗi nút `W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc) · S(ty)`, vẽ ảnh `manh/...` với `pivot` trùng gốc nút,
  `trang`/`toi`/`mo` là hoà trắng / làm tối / độ đục. Đơn vị px ảnh nguồn × `ty_le.px_nguon_sang_px_logic`.
