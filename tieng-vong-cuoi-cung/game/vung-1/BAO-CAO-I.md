# BÁO CÁO LUỒNG I – tách nền quái + tiết chế đập đất + đo cỡ nhân vật (01/11/2026)

Đầu vào: `docs/duyet-animation-toan-bo-chatgpt.txt` (P0-01, P0-02, P0-05, P1 dapdat). Chỉ xử lý ảnh Python có kiểm soát, không vẽ tay, không đổi hình dáng/kích thước ảnh/vị trí chân/màu chủ đạo.

## 1. P0-01 Khuyết Cẩu, P0-02 Kèn Câm (+ nhẹ cho Màn Tang, Vọng Tàn) – `tools/tang-tach-nen-quai.py`
- Tương phản CỤC BỘ, phép theo từng điểm ảnh (màu + lân cận 1–2 px) → áp đồng nhất 180 khung (4 quái × chet/danh/di/dung/trung × 9), không nhấp nháy.
  - Sáng 1 bậc vùng ngà/đồng (lọc màu nâu ấm, loại tím/đỏ gạch/cyan): pha về ngà/đồng đích rồi bám về màu sẵn có trong bảng màu của chính con quái. Khuyết Cẩu: sọ/mõm/xương (sáng ≥ 98). Kèn Câm: kèn đồng, tay, cờ – chỉ điểm sáng hơn trung bình 5×5 xung quanh ≥ 9 (mảng tối giữ nguyên). Màn Tang: mặt nạ ngà (nhẹ). Vọng Tàn: chuông đồng (nhẹ).
  - Viền tối 1px phía ngoài ở mép trên + hai bên, chỉ chỗ mép chưa tối; KHÔNG thêm dưới chân.
  - Viền sáng chọn lọc 1px ở mép hướng lên (chỉ điểm màu ấm).
- Không cyan, không tăng sáng toàn thân. Kích thước ảnh giữ nguyên; đáy chân (y lớn nhất) giữ nguyên 180/180 khung.

| quái | điểm thân đổi màu | ΔL trung bình thân |
|---|---|---|
| Khuyết Cẩu (cau) | 23,6% | +8,3 |
| Kèn Câm (ken) | 35,1% | +12,1 |
| Màn Tang (tang) | 9,7% | +2,1 |
| Vọng Tàn (tan) | 11,7% | +1,6 |

## 2. P1-01 đập đất – `tools/tiet-che-dapdat.py`
- Tách FX theo màu (cyan b−r ≥ 30 + lõi trắng-xanh), bảo vệ mọi điểm trong 2 px quanh thân + màu cyan của kiếm. Kiểm: **0 pixel thân bị đổi** ở cả 14 khung.
- Khung f05–f12: nén dọc lớp FX về mặt đất, cao tối đa 1/3 chiều cao nhân vật đứng (75 px → 25 px; hệ số 0,32–0,89), 6 px mũi gai mờ dần (màu tối FX + ô cờ). Gai còn thấp, sóng sát đất và loé chạm đất (f04) giữ nguyên; f00–f03 (trên không) không đổi.

## 3. P0-05 đo cỡ – `tools/kiem-tra-co-nhan-vat.py`
Khung đứng thẳng nhất mỗi clip (cao/rộng thân lớn nhất), bỏ FX cyan + hạt rời. Chỉ số chính: √diện tích pixel kem tóc + mặt nạ (cách cũ). Cao thân/giáp phụ thuộc tư thế, chỉ tham khảo. KHÔNG scale gì.

| clip | khung | cao thân px | lệch | cao giáp px | lệch | tóc+mặt nạ (√S) lệch | trung vị cả clip | cờ >8% |
|---|---|---|---|---|---|---|---|---|
| bamtuong | f00 | 92 | +22.7% | 92 | +22.7% | +7.6% | +9.0% |  |
| chay | f03 | 74 | -1.3% | 74 | -1.3% | -0.4% | +2.0% |  |
| chemday | f00 | 79 | +5.3% | 79 | +5.3% | -5.4% | -6.3% |  |
| chemkhong | f05 | 69 | -8.0% | 69 | -8.0% | +0.2% | -3.2% |  |
| chemtuong | f00 | 92 | +22.7% | 92 | +22.7% | +7.6% | +5.8% |  |
| cheolen | f00 | 66 | -12.0% | 63 | -16.0% | +5.5% | -4.6% |  |
| cheoxuong | f00 | 80 | +6.7% | 80 | +6.7% | +2.9% | -1.3% |  |
| chet | f02 | 57 | -24.0% | 57 | -24.0% | -8.0% | -7.0% |  |
| dapdat | f03 | 84 | +12.0% | 84 | +12.0% | -4.2% | -9.2% |  |
| don1 | f01 | 77 | +2.7% | 77 | +2.7% | -13.4% | -15.8% | **LỆCH** |
| don2 | f00 | 66 | -12.0% | 63 | -16.0% | +5.5% | -4.6% |  |
| don3 | f00 | 80 | +6.7% | 80 | +6.7% | +2.9% | -1.3% |  |
| don4 | f03 | 111 | +48.0% | 111 | +48.0% | +0.4% | +5.3% |  |
| dung | f00 | 75 | +0.0% | 75 | +0.0% | +0.0% | +0.0% |  |
| leoday | f06 | 78 | +4.0% | 78 | +4.0% | -3.8% | -0.7% |  |
| luot | f05 | 72 | -4.0% | 72 | -4.0% | +1.9% | -1.1% |  |
| nhay | f00 | 75 | +0.0% | 75 | +0.0% | +2.1% | -2.4% |  |
| nhaydoi | f00 | 83 | +10.7% | 64 | -14.7% | -7.1% | -7.0% |  |
| roi | f01 | 86 | +14.7% | 86 | +14.7% | -4.0% | -2.4% |  |
| tiepdat | f02 | 80 | +6.7% | 80 | +6.7% | +5.0% | +4.1% |  |
| treoday | f00 | 87 | +16.0% | 87 | +16.0% | -2.5% | +0.4% |  |
| trungdon | f05 | 72 | -4.0% | 72 | -4.0% | +1.9% | -6.7% |  |

Clip lệch >8% (tóc+mặt nạ): don1

Ghi chú: `don1` lệch −13,4% (trung vị cả clip −15,8%) – xem bằng mắt thì đuôi tóc bị thân che nhiều hơn, đầu/mặt nạ và chiều cao (+2,7%) tương đương `dung`, nên khả năng cao là do tư thế; cần người xem lại trước khi sửa. Gần ngưỡng (theo trung vị): `bamtuong` +9,0%, `dapdat` −9,2% (cúi người) – chưa đổi.

## 4. Ảnh tổng hợp trước/sau (nền #1c1a22)
- `art/kiem-khach-thiet-ke/review/ani_quai_sau.png` – 4 quái × 5 clip, khung f00/f04/f07, trước | sau.
- `art/kiem-khach-thiet-ke/review/ani_nv_dapdat_sau.png` – đập đất f03–f13, trước / sau.

## 5. Kiểm
- Playwright chụp phòng demo (`game/phong-demo`) và Vùng 1 P01 (Khuyết Cẩu), P03 (Kèn Câm), so bản gốc chạy song song cổng 8766: sọ/mõm Khuyết Cẩu và kèn/tay Kèn Câm tách nền rõ hơn, không lỗi JS. Ảnh chụp để ngoài repo.
- `kiem-thu-f.js` 65/65 đạt · `kiem-thu-g.js` hỏng 0, không lỗi JS · `kiem-thu-h.js` hỏng 0.
