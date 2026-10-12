# Ngư Tinh pha 2, pha 3 — nhập ảnh ChatGPT 12/10

Ảnh gốc: `docs/anh-goc/2026-10-12/nguTinh-pha2.png` (nổi giận: gai đỏ, mắt đỏ) và `nguTinh-pha3.png` (hoá băng), nền hồng tím, lưới 8 cột × 4 hàng.
Thay: `game/art/custom/nguTinh-p2.sprite.json`, `game/art/custom/nguTinh-p3.sprite.json`. Không đụng pha 1, không sửa code đổi pha, không đổi máu/sát thương.

## Nhìn nhanh
- `ba-pha.png`: 3 pha cạnh nhau trong phòng trùm thật (cắt quanh trùm).
- `pha-1.png`, `pha-2.png`, `pha-3.png`: cả màn hình 844×390, hạ máu để game TỰ chuyển pha (60% → pha 2, 30% → pha 3).
- `don-tan-cong.gif` (95 KB): lấy đà + tấn công, pha 1 | pha 2 | pha 3 cạnh nhau.
- `chuyen-pha.gif` (~150 KB): pha 1 → 2 → 3 trong phòng thật.
- `can-canh.png`: đúng đường vẽ của game, 3 pha × đứng, lấy đà, tấn công, trúng đòn, chạy, gục.

## Định dạng (giữ như tệp -p2/-p3 cũ)
| | pha 1 | pha 2 | pha 3 |
|---|---|---|---|
| ô / nét | 180×116, nét ×1 | 180×116, nét ×2 | 180×116, nét ×2 |
| điểm gốc | [90,112] | [90,112] | [90,112] |
| đứng · lấy đà · tấn công · trúng đòn | 6 · 4 · 6 · 4 | **6 · 4 · 6 · 4** (đủ, không phải lặp khung) | **6 · 4 · 6 · 4** |
| chạy, gục | có | dùng dáng đứng / trúng đòn pha 2 (logic phiên "Kiểm 3 pha trùm", 1542f27) | như pha 2 |
| màu | — | 24 | 24 |
| dung lượng tệp | 0,56 MB | **0,15 MB** (cũ 1,15 MB) | **0,16 MB** (cũ 1,23 MB) |

## Cách cắt (`cong-cu/nhap.py`)
1. Cắt theo vạch lưới đo được trên ảnh (bỏ 4 điểm sát vạch).
2. Tách nền hồng tím: điểm có min(đỏ, lam) − lục > 100 là nền. Quầng ám hồng tím sát nền bỏ thêm 2 lượt; ám còn lại ở 3 điểm mép thì khử (không khử trong thân để bụng giữ màu).
3. Bỏ vụn < 6 điểm và mẩu nhỏ chạm mép ô (vạch kẻ sót); **giữ bông tuyết, giọt nước nằm trọn trong ô**. Lấp lỗ kín nhỏ (≤ 40 điểm gốc) bằng màu lân cận.
4. Cỡ: một tỉ lệ cho cả pha, đo sao cho **bề ngang thân chính khung đứng = pha 1 (116 điểm game)** — không tính bông tuyết/giọt nước. Pha 2 × 0,629, pha 3 × 0,632.
5. Vị trí: đáy thân từng khung đặt đúng vạch chân y = 112 (như pha 1); ngang giữ đúng chỗ trong ô gốc (đòn lao tới vẫn lao), cả pha dời sao cho tâm khung đứng = 90 như pha 1.
6. Thu về đúng cỡ game (lấy trung bình ô, cắt alpha cứng), 24 màu không pha trộn, rồi phóng ×2 khít điểm (nét ×2, khối 2×2, không nhoè). Lưu PNG bảng màu (đã so từng điểm).

Bị cắt: pha 2 lấy đà khung 1 và 3 chóp gai đỏ vượt mép trên ô 3–4 điểm game. Không khung nào bị cắt ngang.

## Kiểm (`kiem.py`)
- Phòng trùm Hang biển (Ngư Tinh), pha 1 → hạ máu → game tự chuyển pha 2, pha 3. Pha 2, 3 vẽ đứng / lấy đà / tấn công / trúng đòn từ `nguTinh-p2` / `nguTinh-p3`; chạy, gục dùng dáng đứng / trúng đòn của chính pha đó (đã gộp 1542f27, kiểm lại sau gộp). **0 pageerror**, 0 lỗi trang (`ket-qua.json`).
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được. Sau khi gộp các phiên song song: hai tệp **22,39 MB / trần 26 MB** (hai tệp Ngư Tinh nhẹ đi ~2 MB so với trước).

## Ghi chú
- Pha 1 đang nét ×1; pha 2, 3 nét ×2 nhưng vẽ khối 2×2 nên độ chi tiết bằng pha 1 — đổi pha không thấy "nét hơn/nhoè hơn".
- Muốn chạy pha 2, 3 có màu riêng: nhờ ChatGPT vẽ thêm hàng chạy; game đọc sẵn hàng `move` trong tệp pha.
