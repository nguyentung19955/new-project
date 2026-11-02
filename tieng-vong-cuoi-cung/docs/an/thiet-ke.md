# Thiết kế Vật phẩm ẩn + Nhiệm vụ ẩn – BẢN NHÁP (phiên "an", 02/11)

> Chưa hỏi được ChatGPT (không có Chrome). Mọi thứ dưới đây là **nháp** để ChatGPT sửa (docs/an/cau-hoi-chatgpt.md → docs/an/tu-van-chatgpt.txt).
> Đang chạy được (khi bật `?an=1`) chỉ những mục dùng **cơ chế + hình đã có sẵn** ở Vùng 1. Mục mới cần hình/ý tưởng mới để TẮT.

## Nguyên tắc (nháp, theo gdd mục "Nhịp khám phá")
- Mỗi vùng: ~3 phòng bí mật (tường giả / tường nứt), 1 thử thách platforming lấy Mảnh Ký Ức, 1 nhân vật phụ có nhiệm vụ riêng, 3–5 nhiệm vụ ẩn.
- Dấu hiệu tinh tế, không chỉ thẳng: dấu bí mật vẽ sẵn trong phòng (`dau_hieu` loại `bi_mat`), vật phẩm nhìn thấy mà chưa với tới, vết nứt.
- Nhật ký nhiệm vụ ẩn chỉ hiện dòng khi người chơi đã chạm vào manh mối (chưa lộ thì không có gì, kể cả "???").
- Không bao giờ lỡ vĩnh viễn: nhiệm vụ "không trúng đòn" làm lại được mỗi lần vào phòng trùm; phần thưởng chưa trao được thì giữ chờ; bản lưu cũ được tính bù.

## Vùng 1 – bí mật (5 đang bật + 1 chờ)
| id | Phòng / vị trí | Điều kiện | Dấu hiệu | Thưởng | Khó | Trạng thái |
|---|---|---|---|---|---|---|
| v1-tuong-nut-p02 | P02 tầng thấp, cột 13 | chém vỡ tường nứt | dấu bí mật vẽ sẵn | hốc + lối tắt P06, Âm Điểm | 1 | BẬT |
| v1-hoc-h1-p03 | P03 cột 14 | chém vỡ tường nứt | dấu bí mật vẽ sẵn | Thẻ Tên + Mảnh Âm trong hốc, Âm Điểm | 2 | BẬT |
| v1-tuong-gia-p06 | P06 góc tây-dưới, cột 3 | đi xuyên tường giả | dấu bí mật vẽ sẵn | Mảnh Âm, Âm Điểm | 2 | BẬT |
| v1-gieng-p04 | P04 giếng hẹp cột 80–83 | bật tường/nhảy đôi tới đáy, nhặt Mặt Nạ Sinh Lực | nhánh đông cụt | +1 máu, Âm Điểm | 3 | BẬT |
| v1-hoc-treo-p02 | P02 hốc treo trên cầu rễ | nhặt Thẻ Tên | thấy thẻ từ dưới | Thẻ Tên, Âm Điểm | 2 | BẬT |
| v1-chuong-duoi-tro | P04 chuông vùi tro (33,6) | đứng im 3 giây cạnh chuông | (chờ ChatGPT + ảnh 002, 005) | Mảnh Ký Ức | 3 | TẮT |

(Âm Điểm chỉ trao khi Hệ thống đồ bật; nếu tắt thì giữ chờ, bật lên sẽ nhận.)

## Vùng 1 – nhiệm vụ ẩn
| id | Tên | Lộ khi | Xong khi | Thưởng | Trạng thái |
|---|---|---|---|---|---|
| nv-v1-nhung-cai-ten | Những Cái Tên Bị Quên | nhặt Thẻ Tên đầu tiên | đủ 4 Thẻ Tên (P02, P03-H1, P04, P09) | +60 Mảnh Âm, Mảnh Ký Ức, thành tựu; đoạn truyện (chờ ChatGPT) | BẬT |
| nv-v1-lang-nhu-tro | Lặng Như Tro | hạ trùm không trúng đòn | như trên | +150 Mảnh Âm, thành tựu; Âm Phù hiếm (chờ hệ thống đồ) | BẬT |
| nv-v1-ve-cua-re | Về Cửa Rễ | vào P01 sau khi hạ trùm | như trên | +40 Mảnh Âm, thành tựu; câu thoại bóng trùm (chờ ChatGPT) | BẬT |
| nv-v1-tho-san | Kẻ Nghe Tiếng Rễ | tìm bí mật đầu tiên | tìm hết bí mật đang bật | +80 Mảnh Âm, thành tựu | BẬT |
| nv-v1-ba-tieng-ngan | Ba Tiếng Ngân | (chờ) | đánh 3 chuông P03 theo thứ tự | Đồng Cổ | TẮT – chờ ChatGPT + cách đánh dấu chuông |

## Giao diện
- Thông báo: dòng chữ có sẵn của Vùng 1, xếp hàng (không đè chữ nhặt đồ): "Đã tìm thấy bí mật · … (x/5)", "Nhật Ký Tiếng Vọng: “…”", "Hoàn thành ẩn: …".
- Nút "Nhật Ký · Bí mật x/5" trong bảng Chuông Lưu → bảng "Nhật Ký Tiếng Vọng" (bí mật, thành tựu, Mảnh Ký Ức, các dòng nhiệm vụ đã lộ). Nút/dòng cao ≥ 44 px.
- Chờ ảnh: hiệu ứng phát hiện (002), khung nhật ký (003), biểu tượng thành tựu (004), Mảnh Ký Ức (005) – có ảnh thì dùng, không vẽ bằng code.

## Các vùng sau
Xem docs/an/de-xuat-cho-vung-2.md (mẫu dùng cho mọi vùng mới).
