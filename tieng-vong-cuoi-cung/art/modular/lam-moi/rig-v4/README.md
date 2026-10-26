# Lam – rig v4: clip CHẠY NHANH (sải dài) cho 264 px logic/s – BẢN CHỜ DUYỆT CHUYỂN ĐỘNG

Làm theo `../YEU-CAU-CHAY-NHANH-C.md` (phương án **c**, mục 1). Code copy từ `../rig-v3/code/` rồi sửa; **rig-v3 giữ nguyên
làm đối chứng** (không sửa file nào trong `rig-v3/`). Cùng mảnh, cùng thiết kế, cùng cỡ Lam 112 px, cùng cỡ ủng, cùng biên độ
nhún thân + lắc đầu/chóp/chuông như v3. Không gen ảnh. **Chưa thử trên iPhone/Safari.**
Đã đổi gì, số đo, cái chưa đẹp: **GHI-CHU.md**. So sánh trong màn game thật: `../../../../game/kiem-thu-chay-nhanh/`.

## Xem gì trước
| File | Nội dung |
|---|---|
| `chay/chay-112px.gif` | chu kỳ chạy ở **đúng 112 px logic 1:1** (không phóng), 25 khung × 20 ms = 0,50 s đúng nhịp |
| `chay/chay-lon.gif` | cỡ lớn (½ ảnh ngang), 25 khung × 20 ms = 0,50 s |
| `chay/chay-lon-cham-x4.gif` | 30 khung × 60 ms (chậm ×3,6) – soi chân bám vạch đất |
| `chay/chay-contact-sheet.png` | toàn chu kỳ 30 khung: lớn + 112 px 1:1 + bóng |
| `tu-the/01-bang-duyet.png` | 4 tư thế: chạm đất (khung 0), chịu lực (5), đạp (9), bay (12) |
| **`sprite/lam-chay-2x.png`** | sprite sheet RGBA 2142×970, 8×4 ô (30 khung + 2 ô trống cuối), ô 266×241, neo (123, 234) – **đúng ô/neo/cỡ của v3** |
| **`sprite/lam-chay-2x.json`** | toạ độ khung, `phien_ban_clip: "v4"`, `toc_do_chuan.quang_duong_moi_chu_ky_px_logic = 132`, cách giữ pha |
| `sprite/kiem-sheet-ghep*.gif`, `kiem-sheet-luoi.png` | ghép lại từ chính sheet để chứng minh neo đúng (GIF 20 ms/khung → chậm hơn thật 1,2×) |
| `so-lieu.json` | mọi số đo (trượt, vào/rời đất, vòng nối, nảy đầu, bậc chóp, tối 10 %, tốc độ game) |
| `lam-moi-v4.json` | **rig nguồn** v4 (sheet chỉ là đầu ra) |

## Chạy lại (độc lập – chỉ cần thư mục rig-v4)
```
pip install pillow numpy scipy matplotlib
cd code
python3 chay_het.py --nhanh   # ~5 phút, dùng lại manh/goc/, kết thúc bằng kiem_tra (ĐẠT)
```
Chỉnh chuyển động: đầu `code/chu_ky.py` (`QUANG_LOGIC`, `DUTY`, `UNG_X_BAY`, `UNG_NHAC`, `UNG_GOC`, `THAN_GOC`,
`BIEN_DO_TAY_TRUOC`, `SO_KHUNG`). `BANG['V4']` = bảng nhún/lắc đầu của v3 (giữ nguyên theo yêu cầu).

## File code đổi so với rig-v3
| File | Việc |
|---|---|
| `chu_ky.py` | bảng mốc chạy nhanh (mục 1 GHI-CHU), 30 khung, 0,50 s |
| `chung.py` | đường dẫn → `lam-moi-v4.json` |
| `khung.py` | vạch đất trôi = ¼ quãng đất mỗi chu kỳ (v3 cố định 200 px) |
| `chay.py` | GIF đúng nhịp 25 × 20 ms; bỏ GIF so nhún v2/v3 và bản phóng nearest |
| `sprite.py` | giữ đúng ô + neo của v3 nếu vừa; JSON thêm `phien_ban_clip` |
| `phan_tich.py`, `duyet.py`, `kiem_tra.py` | theo 30 khung / 0,50 s / 264 px/s; kiểm biên độ đầu/chóp = v3 |
