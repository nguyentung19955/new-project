# Bước 2 — Báo cáo Phiên E: cân bằng + chốt

Làm 15/10/2026 theo `KE-HOACH.md` mục 4 "Phiên E" và mục 5, `bao-cao-phien-0/A/B/C/D.md`, `QUYET-DINH.md`, `docs/ke-hoach/LUAT-CAN-BANG.md`,
có tính chỗ tiêu vàng mới của bộ đồ mua (`docs/review/ke-hoach-cai-thien/bo-do-mua/`). Nhánh `khoi-tao-du-an`. Không chơi thử bằng trình duyệt,
không đụng master / đăng nhập Google / lưu mây / `?cloud=0`, không tạo PR.

**Kết quả ngắn**: với số thưởng gốc (Phiên A / B / C), ba hệ làm game **nhanh hơn 12% số lần chơi** và **dư thêm 29% vàng lúc qua 3-5**
— vượt luật cân bằng. Phiên E giảm khoảng một nửa vàng và bớt đá của ba hệ (khối "PHIÊN E" cuối `game/js/data.js`, cờ quay lui `?thuongb2=goc`).
Sau khi chỉnh: **−7% số lần chơi** (luật: không quá −10%), **vàng còn lúc qua 3-5 như cũ** (1.610 so với 1.619), Sức mạnh lúc qua từng ải như cũ.

## 1. Đã làm

| Tệp | Việc |
|---|---|
| `tools/can-bang/tinh.js` | **Mục 7** "Việc hôm nay + Sổ + Thành tựu": mỗi ngày giả (8 lượt) cộng 3 việc + rương ngày (xong 3/3 ở 80% số ngày), rương tuần mỗi 7 ngày (xác suất đủ 5/7 ngày); sổ cộng khi hạ trùm vùng lần đầu (★ mọi trang, ★★ 70% trang, ★★★ tinh anh + trùm nhỏ); thành tựu cộng theo mốc (cấp, quái đã hạ, Mầm / Thức tỉnh, ép Tím, mài +10, cứu bạn…). In bảng có / không ba hệ: lượt cày từng ải, Sức mạnh lúc tới ải, vàng / linh khí / đá mỗi ngày. Cờ `--khong-buoc2` (tắt ba hệ ở mọi bảng), `--b2-goc` (số thưởng gốc). |
| `game/tests/cay.py` | `--viec`: mỗi lần về làng bot bấm Nhận hết (3 việc, rương ngày, rương tuần, `G.soYQ.nhanHet`, mọi thành tựu); cộng riêng phần ba hệ (cả phần "quên nhận → hôm sau tự cộng"), đếm mọi đá / bùa; in dòng **"Mỗi ngày giả"** (vàng, linh khí, đá, bùa, quặng; tách phần Bước 2) và **"Bước 2 cả chiến dịch"** (vàng việc / sổ / thành tựu, rương). |
| `game/js/data.js` | Khối mới **cuối tệp** "BƯỚC 2 — PHIÊN E": đè số thưởng (bảng gốc ở khối A / B / C giữ nguyên để so). Cờ `?thuongb2=goc` (hoặc `G.THUONG_B2_GOC = true` trước khi nạp) → số gốc. |
| `game/tests/thuong_b2.test.js` (mới) | 9 điều kiện: số đã chỉnh, số gốc qua cờ, nhận thật "Bước đầu" +50 vàng. |
| `game/tests/so_yeu_quai.test.js`, `viec_ngay.test.js`, `thanh_tuu.test.js` | Một dòng: chạy với `?thuongb2=goc` (bài kiểm luật bằng bảng gốc; số mới kiểm ở `thuong_b2.test.js`). |
| `game/README.md` | Bảng người làng: Ông Từ (Zed · Sổ yêu quái · Thành tựu), Anh Mõ (Việc hôm nay · Cài đặt); mục mới "Việc hôm nay, Sổ yêu quái, Thành tựu" (cách chơi, cờ quay lui); lệnh kiểm mới. |
| `game/dist/*`, `tools/xuong-sprite/*` | Dựng lại bằng `python3 game/build.py` và `--hai-tep`. |

## 2. Số thưởng đã chỉnh (khối PHIÊN E)

| | Gốc (Phiên A / B / C, Q4 = a) | Phiên E |
|---|---|---|
| Việc Dễ / Vừa / Khó — mức 1 | 60·2q / 90·3q / 120·4q | 30·1q / 45·2q / 60·2q |
| — mức 2 | 120·3q / 180·4q / 240·6q | 50·2q / 75·2q / 100·3q |
| — mức 3 | 200·4q / 300·6q / 400·8q | 80·2q / 120·3q / 160·4q |
| 3 việc mỗi ngày (mức 1 / 2 / 3) | 270 / 540 / 900 vàng · 9 / 13 / 18 quặng | **135 / 225 / 360 vàng · 5 / 7 / 9 quặng** |
| Rương ngày (mức 1 / 2 / 3) | 2 / 3 / 4 đá + 8 / 12 / 16 linh khí | **1 / 1 / 2 đá** + 8 / 12 / 16 linh khí |
| Rương tuần | 1 bùa + 5 / 8 / 12 đá | giữ nguyên |
| Sổ ★ vàng (thường · tinh anh · trùm nhỏ · trùm vùng, vùng 1/2/3) | 20/40/60 · 50/80/120 · 80/120/180 · 150/250/400 | **10/20/30 · 25/40/60 · 40/60/90 · 75/125/200** |
| Sổ ★★★ đá (tinh anh · trùm nhỏ · trùm vùng) · thưởng vùng | 1 · 2 · 3 · 5/8/12 | 1 · **1 · 2 · 3/5/8** |
| Sổ cả game | 2.640 V · 198 LK · 46 Đ | **1.320 V** · 198 LK · **31 Đ** |
| Thành tựu cả game | 1.800 V · 130 LK · 19 Đ · 6 bùa · 10 quặng | **900 V** · 130 LK · **12 Đ** · 6 bùa · 10 quặng |

Linh khí, bùa, danh hiệu không đổi. Vì sao: (1) vàng là chỗ lệch nhất (dư 29% lúc qua 3-5) dù đã có bộ đồ mua bằng vàng; (2) thử chỉ giảm vàng
(lần thử P1 dưới đây) game vẫn nhanh hơn 10% — do **đá nâng bậc** (+38% đá cả chiến dịch → ép đồ sớm), nên bớt cả đá; (3) kế hoạch dặn "giảm cột Mức 3 trước"
→ việc mức 3 còn 40%, mức 1 còn 50%.

## 3. Đo bằng bot Node (`tests/cay.py 12 --node --ngay=8`, kiểu khuyen, mua bộ + để dành vàng như bot bộ đồ mua)

"Không ba hệ" = `--pre='G.SU_KIEN_BAT=false'` (2 × 12 lượt). "Có" = `--viec` (bot bấm Nhận hết mỗi lần về làng; Phiên E: 3 × 12 lượt).
Hai lần đo "không" cùng mã chênh 40 / 42 lần chơi, 188 / 197 phút → nhiễu khoảng ±5% tổng, ±30% từng ải.

| | Không ba hệ | Số gốc A/B/C | P1: chỉ ½ vàng | **Phiên E (chốt)** |
|---|---|---|---|---|
| Lượt chiến dịch | 24 | 12 | 12 | 36 |
| Số lần chơi qua 15 ải | 40,8 | 36 (**−12%**) | 37 (−9%) | **38,0 (−7%)** |
| Thời gian qua 15 ải | 192 phút | 177 (−8%) | 172 (−11%) | **180 (−6%)** |
| Sức mạnh lúc qua 3-5 | 575 | 588 | 573 | 587 |
| Vàng còn lúc qua 3-5 | 1.619 | 2.095 (**+29%**) | 1.616 | **1.610 (−1%)** |
| Linh khí còn / quặng còn lúc qua 3-5 | 430 / 236 | 453 / 229 | 468 / 217 | 504 / 239 |
| Mỗi ngày giả: vàng | 4.716 | 6.792 (+44%) | 5.937 | **5.678 (+20%)** |
| Mỗi ngày giả: linh khí | 683 | 757 | 782 | 762 (+12%) |
| Mỗi ngày giả: đá nâng bậc (mọi nguồn) | 24,4 | 35,3 (+45%) | 33,6 | 31,1 (+27%) |
| Phần ba hệ mỗi ngày | 0 | 1.549 V · 47 LK · 7,3 Đ · 15,5 quặng | 776 V · 44 LK · 6,8 Đ | **713 V · 44 LK · 4,5 Đ · 9,4 quặng** |
| Ba hệ cả chiến dịch (vàng: việc / sổ / thành tựu) | — | 6.323 (2.350 / 2.373 / 1.600) | 3.167 | **3.066 (1.080 / 1.131 / 854)**, 40 quặng, 185 LK, 19 Đ |
| Mua bộ Rừng / Biển (trung vị) | 2-2 / 3-2 | 2-1 / 3-1 | — | 2-1…2-2 / 3-1…3-2 |

Số lần chơi trung bình từng ải:

| Ải | Không ba hệ (24) | Số gốc (12) | Phiên E (36) | Lệch Phiên E | Sức mạnh khi qua: không / Phiên E |
|---|---|---|---|---|---|
| 1-1 | 1.0 | 1.0 | 1.0 | +0% | 100 / 100 |
| 1-2 | 1.0 | 1.0 | 1.0 | +0% | 109 / 108 |
| 1-3 | 1.8 | 1.5 | 2.3 | +26% | 131 / 129 |
| 1-4 | 1.6 | 2.0 | 1.2 | −25% | 144 / 145 |
| 1-5 | 3.3 | 2.6 | 2.9 | −12% | 178 / 181 |
| 2-1 | 1.1 | 1.2 | 1.2 | +1% | 191 / 201 |
| 2-2 | 3.6 | 2.8 | 2.2 | **−38%** | 222 / 224 |
| 2-3 | 4.5 | 4.1 | 4.8 | +5% | 269 / 269 |
| 2-4 | 1.9 | 1.2 | 1.5 | −23% | 284 / 285 |
| 2-5 | 3.8 | 3.9 | 4.3 | +13% | 312 / 311 |
| 3-1 | 1.2 | 1.8 | 2.1 | +75% | 320 / 324 |
| 3-2 | 3.6 | 2.2 | 2.5 | −30% | 350 / 359 |
| 3-3 | 5.3 | 4.5 | 3.8 | −28% | 434 / 432 |
| 3-4 | 2.0 | 1.9 | 1.5 | −25% | 466 / 456 |
| 3-5 | 4.8 | 3.9 | 5.7 | +17% | 550 / 561 |
| Vùng 1 / 2 / 3 | 8,8 / 15,0 / 16,9 | 8,1 / 13,2 / 14,3 | 8,4 / 14,0 / 15,6 | −5% / −7% / −8% | |

**Cảnh báo kế hoạch mục 5** (ải giảm quá 30%): 2-2 (−38%) và đúng ngưỡng 3-2 (−30%). Đây là hai ải bot **để dành vàng mua bộ** (báo cáo bộ đồ mua: 2,1 → 3,9
và 1,3 → 2,5 lần); vàng của ba hệ làm bộ mua sớm hơn khoảng nửa ải, phần cày dồn sang 2-3 / 3-1 (+75%) — tổng vùng chỉ −7% / −8%, nằm trong nhiễu từng ải.
Vùng 3 trung bình 3,1 lượt / ải (ngưỡng ≥ 2). Không ải nào quá 9 lần; mọi luật của `cay.py` đạt; ải ngày thắng 100%.

**Luật cân bằng**: (1) số thêm mỗi ngày / mỗi lượt ghi ở mục 2 và bảng trên (mỗi lượt ải ≈ +89 vàng, +5,5 linh khí, +0,56 đá, +1,2 quặng);
(2) số lần chơi −7% (≤ 10%), kinh tế sau 3-5 không dư (vàng −1%, quặng như cũ, linh khí +17% còn dư vì bot bị chặn ở giá nâng vũ khí kế, như Phiên B ghi);
(3) thưởng mới được bù bằng cách **bớt chính thưởng của ba hệ** (một nửa vàng, bớt đá) + chỗ tiêu vàng mới của bộ đồ mua; (4) cờ quay lui `?thuongb2=goc`, `?sukien=0`…

## 4. Mô hình số (`node tools/can-bang/tinh.js`, mục 7; chiến dịch có mua bộ)

| | Tổng lượt có / không | Ba hệ cả chiến dịch | Phần vàng ba hệ / vàng cả chiến dịch | Phần đá |
|---|---|---|---|---|
| Số gốc (`--b2-goc`) | 30 / 32 (−6%) | 5.724 V (việc 1.584, sổ 2.640, thành tựu 1.500), 45 quặng, 246 LK, 25 Đ | 27% | 20% |
| **Phiên E** | **31 / 32 (−3%)** | 2.718 V (việc 648, sổ 1.320, thành tựu 750), 28 quặng, 246 LK, 15 Đ | **15%** | 13% |

Mô hình chậm hơn bot (chỉ ~4 ngày giả cho 15 ải, việc xong 80%) nhưng cùng chiều: sau khi chỉnh, ba hệ thêm ~15% vàng — đúng khoảng
"10–20%" kế hoạch mục 5 nhắm tới. Người chơi thật chơi 15–20 phút / ngày nên một chiến dịch dài hơn nhiều ngày → phần việc ngày lớn hơn trong bot;
nếu chủ game thấy vẫn nhiều, nút vặn kế tiếp là `V.thuong` mức 3 trong khối PHIÊN E.

## 5. Kiểm

```
node --check game/js/data.js tools/can-bang/tinh.js game/tests/thuong_b2.test.js   # đạt
python3 game/build.py && python3 game/build.py --hai-tep                            # không lỗi
node game/tests/thuong_b2.test.js        # PASS 9
node game/tests/so_yeu_quai.test.js      # PASS 41  (?thuongb2=goc)
node game/tests/viec_ngay.test.js        # PASS 36  (?thuongb2=goc)
node game/tests/thanh_tuu.test.js        # PASS 35  (?thuongb2=goc)
node game/tests/su_kien.test.js          # PASS 83
node game/tests/cloud_save_regression.test.js   # 7 PASS
node game/tests/bo_do_mua.test.js        # ĐẠT 22
python3 game/tests/cay.py 12 --node --ngay=8 --viec                          # bảng mục 3 (mã thoát 0)
python3 game/tests/cay.py 12 --node --ngay=8 --viec --pre='G.SU_KIEN_BAT=false'   # cột "không ba hệ"
node tools/can-bang/tinh.js [--b2-goc | --khong-buoc2]
```

Không chơi thử bằng trình duyệt (theo luật phiên); giao diện không đổi nên không chụp lại ảnh soát (chữ thưởng đọc từ bảng số, tự theo số mới).

## 6. Để chủ game quyết

- Số mới **khác Q4 = a** ("thưởng như bảng mục 1") vì luật cân bằng bắt buộc (QUYET-DINH.md). Muốn số gốc: `?thuongb2=goc` để thử, hoặc xoá khối PHIÊN E cuối `data.js`.
- Bot không đổi vũ khí / không đổi việc nên chỉ xong 3/3 khoảng một nửa số ngày; bé thật xong nhiều hơn → nhận nhiều hơn bot một chút (mô hình tính 80%).

## 7. Commit

- `98bb30b3` Bước 2 Phiên E: cân bằng ba hệ — tinh.js mục 7, cay.py --viec, khối PHIÊN E cuối data.js + cờ ?thuongb2=goc, thuong_b2.test.js, README.
- `5449e385` Bước 2 Phiên E: dựng lại dist.
- (commit báo cáo này)
