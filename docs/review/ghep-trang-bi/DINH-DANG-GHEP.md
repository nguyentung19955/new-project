# Định dạng ghép trang bị (bản chốt chung cho 3 phiên)

Ngày 10/10/2026. Các phiên **ghep-loi** (game), **ghep-cong-cu** (trang công cụ mới) và **ghep-thu** (thử 5 lô đồ) cùng dùng định dạng này.
Phiên nào thấy cần đổi thì chỉ được **thêm** trường tuỳ chọn, không được đổi tên trường đã chốt, và phải ghi lại vào báo cáo của mình.

Quy ước chung:
- Mọi toạ độ tính theo **điểm ảnh game**, như mọi tệp `.sprite.json` khác. Trường `net` chỉ áp cho ảnh.
- Hình quay mặt sang PHẢI.
- Toạ độ trên nhân vật tính từ **chân** (gốc `goc` của khung, `[0,0]`). `x` dương là về phía trước mặt, `y` âm là đi lên.
- Toạ độ trên ảnh món đồ tính từ góc trên-trái của ảnh món đồ, theo điểm ảnh game (`rong` × `cao`).
- Tên phía: `_sau` là bên xa người xem (tay, vai phía sau lưng khi quay phải), `_truoc` là bên gần người xem.

## 1. Tên điểm neo (dùng chung cho nhân vật và món đồ)

| Tên | Ý nghĩa |
|---|---|
| `dinh_dau` | đỉnh đầu (chỗ mũ đặt lên) |
| `tam_dau` | tâm đầu |
| `gay` | gáy (sau đầu) |
| `mat` | tâm vùng mắt (chỗ đặt mặt nạ, dấu mặt) |
| `co` | cổ (giữa hai vai) |
| `vai_sau`, `vai_truoc` | hai vai |
| `nguc` | ngực |
| `eo` | eo (thắt lưng, chỗ đeo bùa) |
| `hong` | hông (giữa) |
| `khuyu_sau`, `khuyu_truoc` | khuỷu tay |
| `tay_sau`, `tay_truoc` | bàn tay (nắm) |
| `goi_sau`, `goi_truoc` | đầu gối |
| `chan_sau`, `chan_truoc` | bàn chân |
| `cam` | điểm cầm vũ khí |
| `lung` | chỗ đeo đồ sau lưng (giữa hai bả vai, phía sau) |
| `goc_canh` | chỗ mọc cánh |

## 2. Hồ sơ hình thể nhân vật: tệp `ghep-<key>.sprite.json`

`key` là `smith`, `hunter`, `healer` hoặc `wrestler`. Đặt trong `game/art/custom/` như mọi tệp khác.

```json
{
  "loai": "linh-khi-sprite", "doi_tuong": "ghep", "ma": "ghep-smith", "nhan_vat": "smith",
  "diem": { "dinh_dau": [1, -31], "mat": [3, -22], "co": [0, -17], "vai_sau": [-3, -16], "vai_truoc": [3, -16], "eo": [0, -9], "lung": [-4, -14], "goc_canh": [-4, -15] },
  "diem_theo": { "run": { "dinh_dau": [1, -30] }, "atk:3": { "tay_truoc": [7, -12] } },
  "cap": {
    "tp-robes-leaf": { "dx": 0, "dy": 1, "sx": 1, "sy": 1, "xoay": 0, "lop": "truoc", "bien_the": null,
                       "theo": { "ne": { "an": false }, "atk:2": { "dx": 1 } }, "da_chinh": true }
  }
}
```

- `diem`: điểm của thân ở khung đứng đầu tiên (`idle:0`). Áp cho **thân AI**.
  - Thân vẽ code không cần tệp này: game tự tính điểm từ khung xương ở **từng khung**, đúng tuyệt đối.
  - Tệp này vẫn có thể có `cap` cho thân code.
- `diem_theo`: ghi đè điểm theo động tác (`"run"`) hoặc theo khung (`"atk:3"`). Ghi theo khung thì thắng ghi theo động tác.
  - Thiếu điểm nào thì lấy `diem`, rồi dời theo phần game tự đo (`SC.khopEmBe`). Khi đó điểm ở trạng thái **"ước lượng"**.
- `cap`: chỉnh riêng theo cặp **nhân vật + món đồ** (khoá là mã món đồ). Không ghi đè số liệu gốc của món đồ.
  - `dx`, `dy`: dời.
  - `sx`, `sy`: co giãn, chỉ cho trong khoảng 0,8–1,25.
  - `xoay`: độ.
  - `lop`: `sau` (sau thân), `than` (sát thân), `truoc` (trước thân), `truoc_tay` (trước cả tay cầm vũ khí).
  - `bien_the`: mã một tệp món đồ khác để dùng riêng cho nhân vật này.
  - `theo`: ghi đè theo động tác hoặc khung (`dx`, `dy`, `xoay`, `an`: ẩn).
  - `da_chinh`: `true` nghĩa là người đã chỉnh và duyệt.

## 3. Hồ sơ món đồ: thêm trường tuỳ chọn trong tệp `tp-*.sprite.json` và `vk-*`

```json
"trang_phuc": { "o": "robes", "look": "leaf", "lech": [0, 0], "lop": "sau", "kieu": "bua", "tay_ao": true,
  "diem": { "co": [7, 1], "vai_sau": [2, 3], "vai_truoc": [12, 3], "hong": [7, 12] },
  "co_chuan": [15, 14] }
```

- `diem`: điểm neo **trên ảnh món đồ**, cùng tên với điểm trên nhân vật. Các điểm nên có theo loại món đồ:

| Ô | Điểm nên có |
|---|---|
| hats | `dinh_dau` (bắt buộc), `gay` |
| masks | `mat` |
| robes | `co`, `vai_sau`, `vai_truoc`, `hong` hoặc `eo` |
| backs | `lung` |
| wings | `goc_canh` |
| hands, kiểu `bua` | `eo` |
| hands, kiểu `cam` | `tay_truoc` |

- Vũ khí vẫn dùng `vu_khi.cam` / `mui` / `day`. Muốn khác điểm cầm theo nhân vật thì dùng `cap` của tệp `ghep-<key>`.
- `co_chuan`: cỡ đã đo khi xuất, để báo nếu bị co giãn quá tay.

## 4. Quy tắc đặt (game và công cụ phải ra cùng kết quả)

1. Có `cap[mã].bien_the` thì dùng tệp biến thể đó thay cho món đồ.
2. Món đồ có `diem` và nhân vật có điểm cùng tên (tính cho đúng động tác và khung đang vẽ):
   - **Một điểm chung:** dời để điểm của món đồ trùng điểm của thân.
   - **Từ hai điểm chung trở lên** (ví dụ hai vai): dời theo trung bình các điểm. Được co giãn đều và xoay nhẹ để khớp, nhưng co giãn kẹp trong 0,85–1,15 và xoay kẹp trong ±20°. Áo không bao giờ bị kéo méo.
3. Không có điểm chung thì làm **như cũ** (`lech` + neo H/B + neo đầu/thân). Đánh dấu món đó **"chưa hiệu chỉnh"**.
4. Sau cùng cộng thêm `cap` (`dx`, `dy`, `sx`, `sy`, `xoay`, `lop`, `theo`).
5. Khi lăn hoặc ngã: đồ ghép lên thân rồi xoay và dời **cả khối** như hiện nay (bản 2240).
6. Không có tệp `ghep-*` và món đồ không có `diem` thì game phải **y hệt** bản `lk-2026.10.10-2249`.
