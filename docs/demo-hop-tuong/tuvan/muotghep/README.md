# Mượt kéo ghép (merge_drag_stutter.png)

Người chơi báo: "kéo ghép hiệu ứng merge cứ giật giật".

## Nguyên nhân tìm được (đo bằng `tools/thap-kt-muotghep.js`)

Máy thử: Playwright, CPU chậm 4× (CDP), 390x844 DPR 3, chạm. Bàn đầy 15 ụ (grow-up/thần thoại), 40 quái, FX v2.
Đồng hồ ảo 16,67 ms/khung (máy thử không có GPU nên raster rất chậm; đo **thời gian luồng chính mỗi khung** = mô phỏng + vẽ + HUD).

1. **Mỗi khung dựng canvas MỚI khi cỡ thay đổi**: ụ nhấc lên (0.95→1.14→1.10), hút ghép (1.06→0.32), huy hiệu sao nảy, con dấu sao (1.35→0.9→1), tấm kết quả (1.25→1), bóng ụ cầm (lọc blur) — mỗi cỡ mới = thu nhỏ nhiều bước từ PNG 3× + blur. Lúc nhấc: 7–13 canvas/khung, 50–110 ms/khung.
2. **Tấm hiệu ứng ghép (cf_no, cf_vong_ren, cf_dau_sao, cf_hut…) chỉ được giải mã + chép canvas + dựng mip đúng khung thả** → khựng ~100 ms lúc ghép.
3. **Kết quả ghép là loại NGẪU NHIÊN trong bộ bài** → ảnh của nó dựng lần đầu đúng lúc lộ ra.
4. **Lùi DPR 3→2 tự động (REN.doKhung) có thể xảy ra giữa lúc kéo** → dựng lại toàn bộ bộ nhớ ảnh: 1 khung ~780 ms.
5. pointermove đọc `getBoundingClientRect()` mỗi lần rê (ép tính bố cục).
6. **Lỗi thật ở CO-OP/PVP**: bàn AI đồng đội/đối thủ ghép → xoá luôn ô người chơi đang chọn (chạm–chạm không ghép được).

## Sửa (chỉ đổi cách vẽ, KHÔNG đổi hình — vẫn ảnh ChatGPT, FX v2 MAGNETIC FORGE)

- `render.js veU`: phóng động dùng LẠI ảnh thân/đầu đã dựng ở cỡ ô, phóng bằng ma trận (không dựng canvas mới).
- `REN.qd / huyHieuDong / veHuyHieuDong`: cỡ huy hiệu đang nảy → bậc cỡ 8 % cố định (dựng 1 lần, vẽ thu ≤ 8 %).
- `REN.nong / chayNong`: hàng việc dựng sẵn, 1 việc nhỏ/khung. Ấn giữ ụ → dựng sẵn bóng + huy hiệu sao sẽ dùng; thả → dựng sẵn ụ kết quả + chữ + huy hiệu trong 405 ms trước khi lộ.
- `ghepfx.js GF.nongTran`: vào trận → giải mã + mip mọi tấm hiệu ứng kéo/ghép và thân/đầu mọi loại ụ trong bộ bài (rải theo khung).
- Bóng ụ cầm: 1 cỡ cố định. Không lùi DPR khi đang kéo/ghép.
- `ui.js`: đo khung canvas 1 lần lúc chạm; pointermove chỉ ghi toạ độ (vẽ ở rAF).
- `keoghep.js`: chỉ bỏ chọn chạm–chạm khi ghép trên bàn mình.

## Số đo trước → sau (ms luồng chính mỗi khung, solo, 2 lần kéo + thả)

| CPU | Cửa sổ | p95 | max | khung > 50 ms |
|---|---|---|---|---|
| 1× | thả + ghép (800 ms) | 33 → **16** | 40 → 31 | 0 → 0 |
| 1× | đang kéo | 14 → **12** | 38 → 34 | 0 → 0 |
| 1× | toàn bộ | 16.1 → **11.8** | 39.7 → 34.4 | 0 → 0 |
| 2× | thả + ghép | 42 → **30** | 112 → **47** | 3 → **0** |
| 2× | đang kéo | 26 → 23 | 107 → 56 | 1 → 2 |
| 4× | thả + ghép | 59 → **43** | 91 → 117* | 7 → **2** |
| 4× | đang kéo | 51 → **43** | 113 → 129* | 29 → **17** |
| 4× | toàn bộ | 50.8 → **43.8** | 112.6 → 129* | 37 → **26** |

Chi phí riêng lớp kéo/ghép (ms trung bình mỗi khung, CPU 4×):

| Lớp | Trước | Sau |
|---|---|---|
| Phát lại ghép (GF.veGhep) | 4.73 | **0.64** |
| Lớp kéo (ụ cầm + bật về) | 1.23 | **0.48** |
| Ụ đang cầm (GF.veUCam) | 0.96 | **0.33** |
| Canvas tạo mới trong 800 ms sau thả | 223 | 127 (còn lại = hiệu ứng giao chiến) |

**Thật thà về mục tiêu p95 ≤ 16,7 ms ở 4×**: CHƯA đạt trên máy thử này. Bàn đầy đứng yên (không kéo) đã tốn ~16–20 ms/khung ở 4× (vẽ 40 quái + 15 ụ đang bắn + FX v2, canvas không GPU); các khung dài còn lại (*) đến từ hiệu ứng giao chiến (veFx/veQuai/chữ sát thương), xuất hiện cả khi không kéo. Kéo/ghép giờ gần như không thêm chi phí (lớp kéo/ghép < 0,7 ms). Ở 1× đạt p95 ≤ 16,7 ms và không có khung > 50 ms; ở 2× không còn khung > 50 ms lúc thả.

## Kiểm mọi chế độ (`tools/thap-kt-muotghep-chedo.js`, DPR 3, chạm) — `chedo.json`

| Chế độ | Kéo ghép | Chạm–chạm | Ghép bàn khác | Lỗi trang |
|---|---|---|---|---|
| SOLO | ✓ | ✓ | — | 0 |
| CO-OP | ✓ | ✓ (trước: ✗ do bàn AI ghép) | ✓ | 0 |
| PVP | ✓ | ✓ (trước: ✗) | ✓ | 0 |
| ONLINE (2 máy, máy chủ giả) | ✓ | ✓ | — | 0 / 0 |
| Test range (nhanban, mimic, vughep) | clip chạy | — | — | 0 (chỉ cảnh báo vibrate của Chromium headless, có sẵn từ trước) |

Ảnh: `*_1_dang_keo.jpg`, `*_2_lo_ket_qua.jpg`, `*_3_cham_chon.jpg`, `*_4_ban_khac.jpg`, `online_5_may_B.jpg`, `testrange_*.jpg`.
Dải khung + GIF kéo → thả → lộ kết quả: `dai_khung_keo_ghep.jpg`, `keo_ghep.gif`.

## Chạy lại

```
python3 -m http.server 8765   # gốc repo
NODE_PATH=$(npm root -g) CPU=4 TL=1 OUT=/tmp/mg/ TAG=sau node tools/thap-kt-muotghep.js solo   # YEN=1: ụ không bắn
NODE_PATH=$(npm root -g) MOT=1 SHOTS=1 CPU=1 OUT=/tmp/mg/ node tools/thap-kt-muotghep.js solo && python3 tools/thap-muotghep-dai.py /tmp/mg sau_solo <ra>
NODE_PATH=<có ws> node tools/thap-online-mock-server.js 8787 &  NODE_PATH=$(npm root -g) OUT=<ra>/ node tools/thap-kt-muotghep-chedo.js
```
