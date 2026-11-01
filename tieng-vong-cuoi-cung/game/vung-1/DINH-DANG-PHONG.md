# Định dạng phòng – Vùng 1 (LUỒNG A ↔ LUỒNG B)

Luồng B (dựng màn) xuất file theo đúng định dạng này. **Không đổi tên trường.**

## 1. `game/vung-1/ban-do.json` – danh sách phòng + kết nối

```json
{
  "phien_ban": 1,
  "phong_dau": "P01",
  "cua_dau": "P01-tay",
  "phong": [
    {"id": "P01", "ten": "Cửa Rễ", "x": 0, "y": 0},
    {"id": "P02", "ten": "Ngã Ba Mối", "x": 1, "y": 0}
  ]
}
```

- `phong[].x / y`: toạ độ ô trên **bản đồ nhỏ** (phím M) – mỗi phòng 1 ô (có thể thêm `"rong": 2, "cao_bd": 1` nếu phòng to).
- Kết nối thật giữa phòng nằm trong `cua` của từng phòng (bên dưới). `ban-do.json` chỉ cần danh sách.
- `cua_dau` (tuỳ chọn): cửa nhân vật xuất hiện khi bắt đầu game mới. Nếu không có, nhân vật xuất hiện ở `"bat_dau":{"cot","hang"}` của phòng đầu, hoặc ở Chuông Lưu.

## 2. `game/vung-1/phong/<ID>.json` – một phòng

```json
{
  "id": "P01",
  "ten": "Cửa Rễ",
  "luoi": [
    "########################",
    "#......................#",
    "#......................#",
    "........====...........#",
    "........................",
    "........................",
    "########################"
  ],
  "cua": [
    {"id": "P01-dong", "cot": 23, "hang": 3, "cao": 3, "huong": "phai", "toi": "P02", "toi_cua": "P02-tay"}
  ],
  "quai": [
    {"loai": "cau", "cot": 10, "hang": 5, "tu": 6, "den": 16}
  ],
  "vat_pham": [
    {"id": "P01-manh-1", "loai": "manh_am", "cot": 5, "hang": 5, "so": 20}
  ],
  "chuong_luu": null,
  "den": [{"cot": 4, "hang": 2}],
  "tinh_anh": false,
  "trum": false,
  "bat_dau": {"cot": 2, "hang": 5}
}
```

### Lưới `luoi`
- Mảng chuỗi, mỗi chuỗi là 1 hàng, mọi hàng **cùng độ dài**. Ô logic = **48 px**.
- Hàng 0 ở trên cùng. `cot` tính từ 0 bên trái, `hang` từ 0 trên cùng.
- Phòng nhỏ nhất nên ≥ 20 cột × 12 hàng (màn hình hiện ~20×11 ô); camera tự cuộn khi phòng to hơn.

| Ký tự | Ý nghĩa |
|---|---|
| `#` | Đặc (đứng, va chạm) |
| `.` | Trống |
| `H` | Dây leo (nhấn ↑ để bám, ↑↓ leo) – ô không va chạm |
| `N` | Tường nứt: đặc, chém 3 phát thì vỡ thành trống (lộ hốc) |
| `G` | Tường giả: vẽ như đặc nhưng đi xuyên được |
| `=` | Sàn mỏng: đứng được từ trên xuống, nhấn ↓ + nhảy để rơi qua |

Ký tự lạ khác coi như `.`.

### Cửa `cua`
- `cot, hang`: ô **trên cùng** của lỗ cửa; `cao`: số ô chiều cao (cửa trái/phải) hoặc **chiều rộng** (cửa trên/dưới, khi đó `cot` là ô trái nhất).
- `huong`: `trai` | `phai` | `tren` | `duoi` – cửa nằm ở mép nào của phòng. Các ô của lỗ cửa trong `luoi` phải là `.` (mở ra mép).
- `toi`: ID phòng đích, `toi_cua`: ID cửa trong phòng đích – nhân vật xuất hiện ngay trong cửa đó.
- Đi chạm mép phòng tại cửa → màn tối chuyển cảnh → sang phòng đích.
- Cửa đi lên (`tren`): nhân vật được đẩy nhẹ lên để không rơi lại; nên có sàn/dây ngay dưới cửa `duoi` của phòng trên.

### Quái `quai`
- `loai`: khoá trong `game/thu-mat-na/quai.json` (vd `cau` Khuyết Cẩu, `vai` Hồn Vải, `man` Màn Tang, `ken` Kèn Câm, `tan` Vọng Tàn…). Luồng A sẽ in danh sách khoá đúng ở cuối file này.
- `cot, hang`: ô quái đứng (chân ở đáy ô). `tu, den`: cột giới hạn đi tuần (tuỳ chọn). `cao`: độ cao bay (ô) cho quái bay (tuỳ chọn).

### Vật phẩm `vat_pham`
- `id` **duy nhất toàn vùng** (dùng để lưu "đã nhặt").
- `loai`: `manh_am` (Mảnh Âm, `so` = số lượng) · `chuong_vo` (Chuông Vỡ – nhiệm vụ "Ba tiếng chuông lạc") · `hat_vong` (Hạt Vọng, +1 lần hồi) · `tang_mau` (+1 máu tối đa) · `the_ten` (thẻ tên, nhiệm vụ B – đợt sau).

### Khác
- `chuong_luu`: `{"cot","hang"}` ô Chuông Lưu (checkpoint) hoặc `null`.
- `den`: đèn treo – toả sáng trong bóng tối.
- `tinh_anh`: phòng có tinh anh (khoá cửa khi đánh, mở khi thắng). `trum`: phòng trùm.
- `khoa` (tuỳ chọn): `{"cua":"P11-dong","can":"chuong_vo","so":3}` – cửa đó bị chặn cho tới khi có đủ `so` vật phẩm `can`.
- `bat_dau` (tuỳ chọn): điểm xuất hiện khi bắt đầu game ở phòng này.

## 3. Khoá loại quái đúng (từ `game/thu-mat-na/quai.json`)

| Khoá `loai` | Tên | Ghi chú |
|---|---|---|
| `cau` | Khuyết Cẩu | đi đất, lao cắn |
| `phu` | Phu Đèn Lạc | đi đất |
| `ken` | Kèn Câm | đi đất, đánh tầm xa |
| `bo` | Bọ Vỏ Mộc | đi đất |
| `nam` | Nấm Thở | đi đất, chậm |
| `doi` | Dơi Rễ | bay |
| `vai` | Hồn Vải | bay |
| `tang` | Màn Tang | treo dưới gờ (đặt `hang` = ô ngay dưới trần) |
| `chuong` | Chuông Kén Nứt | bay chậm, tinh anh nhỏ |
| `tan` | Vọng Tàn | **tinh anh P11** (đặt trong phòng `"tinh_anh": true`) |

Trùm P12 không cần đặt trong `quai`: phòng có `"trum": true` thì Luồng A tự sinh "Mẫu Chuông Rỗng" ở giữa phòng (hoặc tại `"trum_o":{"cot","hang"}` nếu có).
