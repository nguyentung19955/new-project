# Ảnh đầu ụ grow-up / thức tỉnh bị cắt — 05/11/2026

Người dùng: "grow up hoặc awaken up có bị cắt hình không". Có — ở ảnh dạng `_s1/_s2/_s3` và vài đầu ụ thường.

## Kiểm (tự động)
- `tools/thap-kt-cat-hinh.py`: mọi `<id>_nong*.png`, bệ `*_de.png`/`de_chung*`, chân dung thức tỉnh `af_*` — cờ mép phẳng (lưỡi cắt), mảnh lạ có cạnh thẳng, chạm mép khung, s1==s2.
- `tools/thap-cat-du.py kiem`: chắc chắn hơn — tìm lại ảnh trong tấm raw ChatGPT, so với **đủ** thành phần liên thông của hình trong raw
  (`mat_px` = phần hình bị xén mất, `manh_px` = mảnh hình bên cạnh lọt vào). Đã chạy cho cả 85 đầu v2 + 47 ảnh dạng.
- `audit_before.png` (204 ảnh, viền đỏ = có cờ), `kiem_before.json` / `kiem_after.json`, `audit_after_tat_ca.png`.

## Kết quả
| ảnh | lỗi | sửa |
|---|---|---|
| dongbo_s1–s3, lophanung_s1–s3, lienket_s1–s3, tienhoa_s2/s3, cuongno_s2/s3, ngoisao_s2/s3, soi_s3, hopbi_s3 | đỉnh (sừng/lửa/cánh/kim cương) bị xén phẳng | cắt lại đủ từ `raw_grow_stages.png` / `raw_grow_stages2.png` |
| cuuvi_s1/s2 | đuôi trái bị xén + mảnh cánh Chrono Throne bên phải | cắt lại từ `raw_new_h2.png`, bỏ mảnh lạ |
| ngaithoigian_s1/s2 (cánh trái), ngaithoigian_s3 | xén | `raw_new_h2.png`, `raw_new_h3.png` |
| ngoisao_s3 + lienket_s3 | 2 hình DÍNH NHAU trong raw | tách theo cổ thắt (bào mòn + chia theo mảnh gần nhất) |
| **đầu đang dùng trong trận**: taylo (đuôi trái + bong bóng), aten (mút cánh), hasao (đỉnh búa + vụn đá), sungluc (mép trái) | xén | cắt lại từ `raw_fs4/fs5/fs9/fs1`, dựng lại icon `nho/` |
| dichchuyen, khuech, tron, xaotron | báo nhầm (quầng TÍM sát màu nền magenta → ảnh cũ để bán trong) | giữ nguyên |
| ronglua_nong | báo nhầm (mảnh hình dưới lọt vào vùng) | giữ nguyên |
| s1 == s2: cuuvi, hydra, luoicheo, ngaithoigian, ronglua | raw chỉ có đầu gốc + đầu thức tỉnh | giữ tạm; prompt ChatGPT ở `HINH-VE-CODE-AUDIT.md` mục 18 |

Khung nới quanh tâm khi hình đủ to hơn khung cũ (`cat-du.json` cột `e`): cuongno_s3 ×1.109, hopbi_s3 ×1.102, soi_s3 ×1.039, tienhoa_s3 ×1.273,
hasao ×1.023 → `tools/thap-cat-du-ap.py` chỉnh STAGE_K_CHO/HEAD_K ×e, STAGE_TIP_CHO/ART_META.tip ÷e (cỡ hiển thị + điểm bắn không đổi).
Điểm đặc của ảnh cũ giữ nguyên màu; chỉ thêm phần bị xén / bỏ mảnh lạ. Cỡ: ảnh dạng 256–334 px, vẽ tối đa ~0.6× điểm ảnh PNG ở 390×844 DPR 3 (QUY-TAC-HINH mục 5 đạt).

## Lưu ý quan trọng
Trong trận hiện nay **cả 3 dạng dùng chung đầu v2** `<id>_nong.png` + quầng màu (growfx.js mục 7, `STAGE_K = {}`); ảnh `_s1/_s2/_s3` vẽ theo đầu CŨ nên đang
tạm cất (`STAGE_K_CHO`). Muốn thấy rõ đổi dạng: gen hàng 3 dạng theo đầu v2 (prompt mục 18) rồi đưa id về `STAGE_K`.

## Ảnh kiểm
- `audit_after.png`: 15 ụ grow-up — đầu thường + s1/s2/s3 trên bệ chung, cỡ trong trận (1×) và phóng 3×.
- `truoc_sau.png`: từng ảnh đã cắt lại, cũ | mới.
- `ban_390_dpr3_that.jpg`: bàn 390×844 DPR 3, 15 ụ × dạng 1/2/3 (cấu hình thật). `ban_390_dpr3_anh_s.jpg`: ép dùng ảnh `_s` (tools/thap-kt-growcut.js anh_s).
  Không đầu nào bị cắt, không lỗi trang, không thiếu ảnh.
