# Báo cáo luồng J – combo don1–4 có "ngôn ngữ" riêng, trúng đòn/chết của Kiếm Khách

Nguồn: docs/duyet-animation-toan-bo-chatgpt.txt (P0-04, P1 don1–4, trungdon/chet). Engine chung → áp dụng cho phòng demo, Vùng 1 và trang thử Mặt Nạ.

## 1. Vệt chém
- Kết quả tìm hiểu: vệt chém **nằm trong pixel khung** (art/kiem-khach/<clip>/fNN.png), không phải lớp FX riêng. Vệt dùng **chung màu với lưỡi kiếm** (27,209,237), nên không tách được theo màu kiếm.
- `tools/tiet-che-chem.py` (chạy 1 lần trên ảnh gốc): tách vệt = thành phần cyan lớn (≥150 điểm) + nét viền tối của vệt; **bảo vệ thân**: không đụng điểm nào cách thân sáng ≤2 px, cũng như cách phần thân còn lại ≤2 px; chỉ xoá điểm FX hoặc dời màu viền FX có sẵn vào trong. Không thêm điểm, không vẽ tay. Script tự kiểm (assert) rằng 0 điểm thân bị đổi; kiểm lại độc lập cũng ra 0.
  - don1: vệt ngang mỏng đi 1 px (nhát nhẹ, mảnh).
  - don4, chemkhong: vệt mỏng đi 2 px ở đoạn dày. Mũi mảnh và lưỡi kiếm giữ nguyên.
  - Chừa mặt nạ (don4 f05–f08, chemkhong f01–f04): xoá FX trong bán kính 18 px quanh mắt mặt nạ, vành ngoài mờ dần. Thực tế chỉ chemkhong f01 và f04 có FX lọt vào vùng này.
  - Chỉ ghi lại 13 ảnh có đổi; don2 và don3 giữ nguyên (hướng vệt đã riêng: cung hất lên / chữ X chéo).
- Phân biệt bằng code (nhan-vat.json, cả 3 cấp; engine đọc):

| nhát | dừng hình | rung màn | đẩy lùi quái | tia trúng |
|---|---|---|---|---|
| don1 | 2 bước | 1.0, ngang | ×0.9 | `ngang`: tia dẹt theo hướng chém |
| don2 | 3 | 1.6, hất lên | ×1.2 + nhấc quái 3.2 | `cung`: quạt hất lên |
| don3 | 4 | 2.2, chéo xuống | ×1.6 | `cheo`: vệt chéo xuống |
| don4 | 7 (~117 ms) | 3.2 + loé màn trắng-cyan 5 bước | ×2.4 + nhấc 2.2 | `no`: nổ tròn + vòng ngoài |

  - `E.tiaTrung(e)` chỉ trả số liệu hạt, trang tự vẽ (engine vẫn không vẽ). Loé màn: `S.loe`, các trang tự vẽ lớp phủ.
  - Riêng với trùm (`def.ai`): dừng hình giới hạn ở 1 bước (`P.hitstopTrum`) để không kéo dài nhịp báo đòn đã nghiệm thu. Lý do: kiem-thu-f đo báo đòn theo khung thật, với dừng hình đầy đủ thì kết quả lên 32–33 khung, vượt ngưỡng 30. Loé, rung và tia trúng trùm vẫn giữ đủ.
- Combo vẫn 3 nhát (don1 → don2 → don4) như quyết định trước đó; don3 đã có thông số riêng nếu sau này đưa lại vào chuỗi.

## 2. Trúng đòn và chết
- Trúng đòn: giật lùi ngang 5.8 rồi hãm ×0.88 mỗi bước (lùi ~33 px, nhanh rồi khựng), nảy nhẹ ~10 px. Dừng hình 5 bước (~83 ms), rung màn ngang ngắn. Loé trắng `E.trangNV()` trong 2 bước đầu, cộng thời gian dừng hình thì ≈ 2 khung trungdon. Nhấp nháy i-frame giữ như cũ.
- Chết: vận tốc ngang về 0 ngay khi chết và giữ 0 trong suốt lúc chết. Chỉ còn rơi thẳng nếu chết trên không; khung cuối giữ yên. Đo bằng Playwright: x không đổi trong 30 lần chụp.

## Kiểm tra
- Playwright (phòng demo, ảnh để ngoài repo): chụp chuỗi combo don1→don4, trúng đòn và chết. Tia trúng khác nhau rõ, don4 có loé và dừng hình 7 bước, không có lỗi JS.
- kiem-thu-f: 65/65 đạt · kiem-thu-g: hỏng 0 · kiem-thu-h: hỏng 0. Ảnh ghi ra ngoài repo, tools/vung-1/xem không đổi.
