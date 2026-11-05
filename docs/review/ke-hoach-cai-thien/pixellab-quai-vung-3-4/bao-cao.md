# PixelLab vẽ lại quái vùng 3 (Lâu đài Than Hồng) và vùng 4 (Đầm Sương) — CHƯA LÀM ĐƯỢC (05/11/2026, đã chạy 2 lần)

## Tóm tắt cho chủ game

Lần chạy tự động tối 05/11 **chưa vẽ được con quái nào**: phiên này **không có khoá API PixelLab**.
Lời giao việc ghi "khoá sẽ gửi ở tin nhắn tiếp theo", nhưng việc chạy theo lịch thì không có tin nhắn tiếp theo, và máy làm việc
không có sẵn khoá (không có tệp khoá, không có biến môi trường). Không có khoá thì không gọi được PixelLab (lỗi 401).

- **Game không bị đổi gì**: không sửa tệp nào trong `game/`, không có bản đăng web mới. Chỉ thêm báo cáo này.
- **Không tốn lượt PixelLab nào** (không gọi được API nên không đo được số dư).
- Bản lưu, đăng nhập Google, lưu mây, `?cloud=0`: không đụng tới.

## Lần chạy thứ 2 (cũng tối 05/11, theo lịch)

Lại **không có khoá PixelLab** (không có `/root/.plk`, không có biến môi trường, không có tin nhắn kèm khoá). Không gọi PixelLab, không tốn lượt,
không sửa `game/`. Chỉ bổ sung danh sách mã quái đầy đủ (đọc từ `G.MOB_ART` trong `game/js/data.js`) để lần sau làm ngay:

| Vai | Vùng 3 Lâu đài cổ | Vùng 4 Sông sâu |
|---|---|---|
| Lính xông | `linhMa` | `raiCa` |
| Bầy nhỏ | `doiThan` | `diaTrau` |
| Khiên | `tuongDa` | `baBa` |
| Xạ thủ | `denLong` | `cocTia` |
| Nhanh | `meoDen` | `ranNuoc` |
| Cảm tử | `huLua` | `echPhinh` |
| Đặt bom | `tieuYeu` | `maDa` |
| Gai | `nhimThan` | `traiGai` |
| Tinh anh | `tuongMa`, `huChua` | `raiCaChua`, `cocChua` |
| Trùm nhỏ | `hoLua` (→ Cinder Lion) | `caTre` (→ Old Mudwhisker) |
| Trùm vùng | `hoTinh` (→ Vulpina) | `thuongLuong` (→ Lindworm, 3 giai đoạn, `game/js/thuong_luong.js`) |

Tổng 24 con. Ước lượng chi phí PixelLab (theo phiên vùng 1–2): quái thường ~40–60 lượt/con, tinh anh ~60–80, trùm ~150–250 → khoảng
1.300–1.800 lượt cho cả hai vùng, sát trần 1.800 của lời giao.

## Cần chủ game làm gì

Chạy lại việc này trong một phiên **có người** (không phải chạy theo lịch), rồi gửi khoá API PixelLab dạng tệp .txt đính kèm
ngay tin nhắn đầu. Hoặc sửa lời giao việc theo lịch để khoá có sẵn trên máy làm việc theo cách an toàn (không dán khoá vào repo).

## Đã chuẩn bị sẵn cho lần sau

- Đã đọc `AGENTS.md` và quy trình mẫu `pixellab-quai-nam/bao-cao.md` (+ `cong-cu/dung-quai-pl.py`, `game/js/quai_pl.js`).
- Mã trùm đã thấy trong `game/js/boss.js` / `chieu_trum.js` / `thuong_luong.js` (cần soát lại đủ danh sách quái thường + tinh anh từ bảng quái khi làm):
  - Vùng 3: `hoTinh` (trùm vùng — sẽ thành Vulpina Phù Thuỷ Cáo, một đuôi lửa + mũ phù thuỷ), `hoLua` (trùm nhỏ hổ lửa → Cinder Lion).
  - Vùng 4: `caTre` (trùm nhỏ Cá Trê Râu Roi → Old Mudwhisker), trùm `thuong` / Thuồng Luồng (→ Lindworm, 3 giai đoạn, thân rắn: có thể phải dùng chế độ không khung xương).
- Kế hoạch giữ nguyên như lời giao: để mục của vùng 3–4 trong tệp riêng `game/js/quai_pl_34.js` (nạp sau `quai_pl.js`) để không đụng phiên vùng 1–2;
  cờ `?quaipl=0` quay lui toàn bộ; trần 1800 lượt PixelLab.

## Cách quay lui

Không có thay đổi game nào để quay lui. Muốn bỏ báo cáo này: revert commit thêm tệp.
