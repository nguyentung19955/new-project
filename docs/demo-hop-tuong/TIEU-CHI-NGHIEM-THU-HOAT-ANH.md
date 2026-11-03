# Tiêu chí nghiệm thu hoạt ảnh tướng (pixel) — áp dụng cho MỌI tướng

Quy trình: ChatGPT vẽ đòn 12 khung (2 hàng × 6) trên nền trong suốt, mỗi hướng một tờ → `tools/demo-cat-luoi-khung-pixel.py` cắt + căn → `demo/assets/v3/pixel/<id>_atk_<hướng>.png`; đứng chờ = khung đầu của đòn + thân trên nhích 0/2/4/2 px.
Hướng 8 hướng: PixelLab (`<id>_8dir.png`).

Mỗi hướng phải đạt ĐỦ trước khi đưa vào game:
1. Không mất hình — vũ khí, tay, chân, hiệu ứng nằm trọn trong ô, không bị cắt.
2. Không giật lùi, KHÔNG nhún, KHÔNG dịch — thân đứng thẳng yên một chỗ suốt đòn (đầu cùng độ cao, chân cùng chỗ, không khom/nhún, không trôi ngang khỏi ô); chỉ tay/vũ khí chuyển động. Prompt ChatGPT phải ghi rõ "body upright and completely still".
3. Khởi điểm = thế cầm vũ khí sẵn sàng; khung đầu ≈ khung cuối để lặp không khựng; đứng chờ dùng đúng thế này.
4. Đúng mặt/màu theo hướng — quay phải thấy nửa bên phải nhân vật, quay trái thấy nửa trái; không lật ngang hướng này ra hướng kia nếu nhân vật không đối xứng. Hướng xuống thấy mặt, hướng lên thấy lưng.
5. Đủ 12 khung, đúng thứ tự giữa các hướng (cùng nhịp `nhip`, cùng khung trúng `trung`).
6. Không có đường kẻ dọc/đường căn trong ảnh và GIF.
7. Nét vẽ do ChatGPT vẽ — code chỉ cắt, đổi cỡ, căn, lật (khi đối xứng), thêm hiệu ứng nhỏ; không bóp méo.
8. Pixel hóa đồng đều: chiều cao thân giống nhau giữa các hướng, chân chạm cùng một mốc.

Hướng nào trượt tiêu chí → bảo ChatGPT vẽ lại hướng đó trước khi làm tiếp.
