# Công cụ chuyển ảnh sang pixel

`pixelize.py` nhận một ảnh vẽ phẳng trên nền trơn và xuất ra hình pixel nền trong suốt.
Nó tách nền, thu nhỏ về đúng cỡ, giảm số màu, thêm viền tối và xoá các điểm lẻ.

Đây là bản đầu tiên, mới thử trên ảnh mẫu tự tạo, chưa thử trên ảnh thật từ Pippit.

## Cài đặt (làm một lần)

Cần Python 3.9 trở lên. Mở cửa sổ dòng lệnh tại thư mục dự án rồi chạy:

```
pip install -r tools/requirements.txt
```

## Cách dùng

Một nhân vật đứng nguyên, cao 32 điểm ảnh, 8 màu:

```
python tools/pixelize.py art/raw/tho-ren.png --height 32 --colors 8
```

Kết quả nằm ở `art/pixel/tho-ren.png`, kèm `tho-ren_x8.png` là bản phóng to 8 lần để xem.

Một tấm mảnh rời (đầu, thân, tay, chân vẽ tách nhau):

```
python tools/pixelize.py art/raw/tho-ren-manh.png --split --scale-ref art/raw/tho-ren.png --out art/parts/tho-ren
```

`--scale-ref` trỏ tới ảnh nhân vật đứng nguyên. Công cụ lấy tỉ lệ thu nhỏ và bảng màu từ ảnh đó,
để các mảnh rời khớp cỡ và khớp màu với nhân vật.

Boss cao 128 điểm ảnh, 12 màu:

```
python tools/pixelize.py art/raw/moc-tinh.png --height 128 --colors 12
```

## Thông số

| Thông số | Ý nghĩa | Mặc định |
|---|---|---|
| `--height` | Chiều cao hình sau khi thu nhỏ, đã tính cả viền | 32 |
| `--colors` | Số màu tối đa | 8 |
| `--tol` | Độ rộng khi nhận màu nền. Tăng nếu còn sót nền, giảm nếu nhân vật bị ăn mất | 90 |
| `--split` | Tách từng mảnh rời thành file riêng | tắt |
| `--scale-ref` | Ảnh nhân vật đứng nguyên, dùng làm chuẩn tỉ lệ và màu cho các mảnh | không |
| `--no-outline` | Không thêm viền tối | có viền |
| `--preview` | Hệ số phóng to của ảnh xem trước, đặt 1 để tắt | 8 |
| `--out` | Tên file hoặc thư mục xuất | `art/pixel/<tên ảnh>` |

## Giới hạn hiện tại

- Chi tiết quá mảnh (lưỡi kiếm mỏng, sợi dây) có thể mất khi thu nhỏ về 32 điểm ảnh.
- Các mảnh rời phải cách hẳn nhau trên ảnh gốc. Hai mảnh chạm nhau sẽ bị tính là một.
- Mảnh được đánh số theo vị trí (`manh_01`, `manh_02`...), chưa tự đặt tên là đầu, thân hay tay.
- Chưa có phần tạo cử động.
