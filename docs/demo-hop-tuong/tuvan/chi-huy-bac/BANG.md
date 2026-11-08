# BẬC CHỈ HUY (08/11) — người dùng: "chỉ huy cũng cần phân cấp trắng xanh tím vàng"

Nguồn dữ liệu: `thap/js/data.js` (`MAVUONG.<id>.bac`, `mvBac`, `mvDS`). Bậc **chỉ để hiển thị** (viền/khung/nhãn cùng bộ màu `TIERS` của ụ) —
không đổi giá, hồi chiêu, tác dụng, đồng bộ online. Không chỉnh số kỹ năng nào (không bậc nào lệch rõ so với sức mạnh).

## Kiểm kê chỉ huy

| id | Tên (kỹ năng) | Giá mana (×2 mỗi lần) | Hồi chiêu | Tác dụng | Cách có |
|---|---|---|---|---|---|
| hero | REINFORCE | 30 | 15 s | 2 ụ 1★ miễn phí (không tăng giá Summon); hết ô → +1★ ụ yếu nhất | mặc định, miễn phí |
| dahlia | RAGE | 40 | 25 s | +100% sát thương cả bàn 10 s | miễn phí (chọn ở bảng chỉ huy) |
| eve | HOLY SHIELD | 40 | 25 s | tẩy băng/đá/lửa + chặn chiêu trùm & hiệu ứng ghép của đối thủ 8 s | miễn phí |

Chỉ huy **không** có trong rương/gacha, cửa hàng, nhiệm vụ → không có tỉ lệ rơi hay giá để đặt theo bậc; bản lưu (`turret_bo.mv`) chỉ lưu id → bản cũ nạp nguyên vẹn.

## Bảng bậc

| id | Bậc | Lý do (1 dòng) |
|---|---|---|
| hero | **Xanh (Hiếm)** | Chỉ huy khởi đầu: rẻ nhất (30/15 s), dễ dùng, giá trị kinh tế đều suốt trận — không để người mới cầm thẻ "yếu nhất" Trắng. |
| dahlia | **Tím (Sử thi)** | Sức mạnh thô lớn (×2 sát thương cả bàn) nhưng chỉ cần bấm đúng lúc trùm — mạnh, đơn giản. |
| eve | **Vàng (Huyền thoại)** | Phức tạp nhất: phản chiêu trùm + chặn đối thủ PVP + giải trạng thái; cần đọc trận, giá trị cao nhất ở wave cao/PVP. |
| — | Trắng (Thường) | Để dành cho chỉ huy đơn giản sau này. |

## Hiển thị (dùng lại ảnh có sẵn, không gen ảnh mới)

- Ô tối giản (`o_vien_<bậc>.png` + vương miện `o_mien.png`): thẻ chỉ huy khay trận `#the-mv` (mọi chế độ), băng chỉ huy màn bộ bài, bảng chọn chỉ huy, hàng ô nhỏ (bộ mẫu, sảnh ONLINE, kết quả), dải đối thủ/đồng đội.
- Khung lớn `the_khung_<bậc>.png` (như ụ) thay `the_khung_mv` ở các đường vẽ dự phòng (khung Pass 9).
- Nhãn bậc (COMMON/RARE/EPIC/LEGENDARY — đã có bản Việt): bảng chọn chỉ huy, băng chỉ huy, trang chi tiết chỉ huy (màu trang = màu bậc), dải thông tin `#tt`.
- Bảng chọn + trang chi tiết xếp chỉ huy theo bậc (`mvDS`). Không thêm bộ lọc (3 chỉ huy — lọc thừa).
