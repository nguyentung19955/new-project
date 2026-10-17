# Nét cao cho QUÁI, TINH ANH, TRÙM, NGƯỜI LÀNG (thử nghiệm 17/10)

Tiếp theo phiên "Nét cao" của Cu Tí ([../net-cao/bao-cao.md](../net-cao/bao-cao.md)): ở đó chủ game được báo *"Cu Tí nét hơn hẳn quái, quái vẫn ô vuông to như cũ"*. Phiên này làm cho **quái thường, tinh anh, trùm nhỏ, trùm vùng (mọi pha) và người làng** nét lên theo **đúng cách đã làm cho Cu Tí**, để khi bật nét cao cả trận đều nét như nhau.

**Trả lời ngắn:** đã xong, **60 tấm hình** (35 quái thường + tinh anh + 4 quái Sông, 3 trùm nhỏ × 2 pha, 3 trùm vùng × 3 pha, 8 người làng, 3 em bé ở làng). Mọi tấm **đều còn ảnh gốc** và **khớp đúng khung** ở 1 664 / 1 739 khung (96 %). Vẫn là **thử nghiệm, mặc định TẮT**: chỉ hiện khi bật `?netcao=3`, `?netcao=4` hoặc nút Độ nét **"Rất cao"** của Anh Mõ (bản web). Mặc định **không đổi một điểm ảnh nào** (đã so).

Không chơi thử bằng tay: mọi ảnh dựng bằng lệnh, kiểm bằng ảnh chụp headless và bot. Không đổi luật chơi, số liệu, vùng trúng, khung đòn, hitbox, neo. Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## 1. Kiểm kê từng con

Bảng đầy đủ (từng con: còn gốc không, khớp bao nhiêu khung, ảnh gốc chi tiết tới đâu, dung lượng, khung nào không khớp): **[bang-kiem-ke.md](bang-kiem-ke.md)**.

| Nhóm | Số tấm | Khớp ảnh gốc | Ảnh gốc có bao nhiêu điểm cho 1 điểm game* |
|---|---|---|---|
| Trùm vùng: Mộc Tinh, Ngư Tinh, Hồ Tinh (mỗi con 3 pha) | 9 | 265 / 285 khung | **2,5 – 3,5** |
| Trùm nhỏ: Nấm Chúa, Cua Đá, Hổ Lửa (mỗi con 2 pha) | 6 | 163 / 168 | 4,1 – 6,0 |
| Tinh anh (6 con) | 6 | 198 / 203 | 4,2 – 9,1 |
| Quái thường (24 con + 4 con Sông) | 28 | 911 / 951 | 3,5 – 13 |
| Người làng (8 người) | 8 | 91 / 96 | 12 – 17 |
| Em bé ở làng (Cái Bống, Cu Tèo, Cu Lì) | 3 | 36 / 36 | 16 – 18 |

\* Số này cho biết bản nét cao có **chi tiết thật** tới đâu: ≥ 4 thì cả nét 4 đều là chi tiết thật của ảnh gốc; 3–4 thì nét 3 thật, nét 4 có chút phóng; dưới 3 thì một phần cũng là phóng.

- **Không có tấm nào mất ảnh gốc** → danh sách "thiếu gốc" **trống**. Ảnh gốc nằm ở `docs/anh-goc/quai-moi/dong-tac`, `trum-moi/<trùm>` (cả tấm gục `trum-moi/chet`), `soat-muot` (các hàng đã thay), `npc-moi`.
- **75 khung không khớp** (4 %), gần hết là **khung gục cuối đang mờ dần** (ảnh gốc mờ, tấm game đã chỉnh), vài khung **ghép tay** ở phiên soát mượt / khung trùng, và hàng "nói" của **Ông Từ** (5/6 khung đã sửa tay). Các khung này trong bản nét cao **lấy khung cũ phóng lên** (y như bây giờ, đúng chỗ). Không đáng gen lại: đa số chỉ hiện 1/10 giây lúc quái gục. Nếu muốn, hàng nói của Ông Từ có thể gen lại theo `docs/anh-goc/npc-moi/prompt-dong-tac.txt` (cùng prompt cũ, hàng "2-noi").
- **Hình vẽ bằng code** (không phải ảnh, không có gốc để dựng): bộ quái vẽ code cũ `js/monster_art.js` chỉ hiện khi thiếu ảnh / bật cờ cũ; hình tạm vùng 4 (mượn con Hang biển, nhuộm màu) — phiên Tư vấn 17/10 đang kiểm kê. Không thuộc việc này, giữ nguyên.

## 2. Đã làm (chỉ chạy khi bật, mặc định không đổi gì)

1. **Tìm lại cách dựng của từng khung** (`cong-cu/kiem_ke.py`). Các công cụ dựng cũ không chạy lại được (nhiều tấm đã qua tay nhiều phiên), nên làm ngược như `do-net/cong-cu/dung_quai_net.py`, nhưng tìm trên **mọi khung gốc** của con đó: với mỗi khung đang dùng, tìm khung ảnh gốc + tỉ lệ + chỗ dán cho ra **đúng hình** của khung đó (so mặt nạ, chấp nhận khi trùng ≥ 97 %, hoặc ≥ 93 % mà chỉ lệch mép 1 điểm do cách cắt alpha khác nhau — đã xem ảnh so, vị trí trùng). Có thử lật ngang.
2. **Dựng lại từ ảnh gốc ở nét 3 và nét 4** (`cong-cu/dung_net_cao.py`): cùng khung gốc, tỉ lệ × N/2, chỗ dán × N/2, thu nhỏ bằng `thu_net.py` của do-net (**mỗi điểm một màu có thật, không pha**, có viền tối 1 điểm như heoCon). Soát: thu bản mới về nét 2 thì trùng hình khung cũ trung bình 95–98 %.
3. **Cắt sát, xếp kín** (`cong-cu/ghi_net_cao.py`): không lưu nguyên lưới ô (tấm Hồ Tinh nét 4 nguyên lưới tới **30 triệu điểm = 120 MB RAM** khi giải mã). Mỗi khung đang dùng cắt sát phần có hình rồi xếp kín vào trang ảnh ≤ 3072×2048 → Hồ Tinh còn **9,7 triệu điểm** (2 trang). Tổng nét 4: **133 triệu điểm** thay vì 271.
   - Tệp `<mã>.sprite.json` chỉ **thêm** `tam_n3`, `tam_n4` (trang ảnh), `o_n3`, `o_n4` (chỗ từng khung trong trang) và `net_cao` (ghi chú). Mọi mục cũ giữ nguyên từng ký tự (công cụ tự so).
4. **Cách vẽ** (`js/sprite_custom.js`, hàm vẽ khung `SC.veKhung` — dùng chung cho quái, trùm, người làng, em bé): khi canvas đang ở nét 3/4 và con đó có bản nét đó → tải lười **lần đầu cần vẽ** (vào vùng nào thì chỉ tải con của vùng đó, đúng con đang hiện), vẽ mảnh cắt sát đúng chỗ trong ô, cỡ ÷ N → **chép 1:1**, không phóng. Chưa về thì vẽ tấm thường như cũ. **Bản nào 45 giây không vẽ thì bỏ** cho trình duyệt thu hồi RAM (cần lại thì tải lại, thường từ bộ nhớ đệm) → đi qua nhiều vùng không cộng dồn.
   - Vẫn dùng tấm thường (như cũ) cho: **thân nhuộm theo trạng thái** (cháy / độc / băng, Đợt 7), các **lớp phủ** chớp trắng / nhuộm / viền đỏ (lớp mờ chồng lên, mép lệch tối đa 1 điểm nét 2, khó thấy).
5. **Đóng gói** (`game/build.py`, phần máy dùng chung — chỉ thêm tên mục): `tam_n3/4`, `o_n3/4` vào danh sách mục game đọc; `o_n3/4` vào danh sách mục nét cao để **bản một tệp bỏ hết** như phiên Cu Tí. Bản web: mỗi trang ảnh thành tệp riêng `anh/<mã>-n3|n4.<mã nội dung>.png` (cách của phiên Cu Tí, không sửa).

## 3. Ảnh so nét 2 | 3 | 4

Mỗi ảnh: **hàng trên** = ảnh chụp màn 844×390 dpr 3 (iPhone ngang) ở nét 2 | 3 | 4, cùng vùng; **hàng dưới** = phóng ×4 vùng khung vàng (đầu / mặt). Vẽ bằng chính hàm vẽ của game trên nền trơn (`cong-cu/chup_quai.py`, `lam_anh.py`).

- **Trùm vùng:** [Hồ Tinh](anh/quai-hoTinh.png) · [pha 2](anh/trum-hoTinh-p2.png) · [pha 3](anh/trum-hoTinh-p3.png) — [Mộc Tinh](anh/quai-mocTinh.png) · [pha 2](anh/trum-mocTinh-p2.png) · [pha 3](anh/trum-mocTinh-p3.png) — [Ngư Tinh](anh/quai-nguTinh.png) · [pha 2](anh/trum-nguTinh-p2.png) · [pha 3](anh/trum-nguTinh-p3.png)
- **Trùm nhỏ:** [Cua Đá](anh/quai-cuaDa.png) · [pha 2](anh/trum-cuaDa-p2.png) — [Hổ Lửa](anh/quai-hoLua.png) · [pha 2](anh/trum-hoLua-p2.png) — [Nấm Chúa](anh/quai-namChua.png) · [pha 2](anh/trum-namChua-p2.png)
- **Tinh anh:** [Heo Nanh](anh/quai-heoNanh.png), [Cá Nóc Chúa](anh/quai-caNocChua.png), [Tượng Ma](anh/quai-tuongMa.png)
- **Quái thường:** [Heo Rừng Con](anh/quai-heoCon.png), [Sứa](anh/quai-sua.png), [Ba Ba](anh/quai-baBa.png)
- **Làng:** [Cụ Đồ](anh/lang-nl-do.png), [Bà Hàng Xén](anh/lang-nl-xen.png), [Cái Bống](anh/em-em-be-healer.png)

Nhận xét khi xem ảnh:
- **Quái thường, tinh anh, người làng:** ảnh gốc chi tiết gấp nhiều lần → nét 3, nét 4 nét rõ (lông heo, vảy, mặt người làng). Đây là chỗ được lợi nhiều nhất.
- **Trùm vùng:** ảnh gốc chỉ có 2,5–3,5 điểm cho 1 điểm game → **nét 3 đã lấy gần hết chi tiết của ảnh gốc**, nét 4 nhìn gần như nét 3 (vẫn sạch, không nhoè). Muốn trùm nét 4 thật thì phải gen lại ảnh trùm to hơn (mỗi khung cao ≥ 600 điểm thay vì ~370).
- Hồ Tinh pha 3 game vẽ nhỏ lại ×0,72: vẫn thu sẵn bằng cách lấy màu có thật như do-net, nay lấy từ bản nét cao.

## 4. Giá phải trả

| | |
|---|---|
| **Dung lượng** | Bản một tệp **29,86 MB** (≤ 30; ảnh nét cao KHÔNG nằm trong đó, chỉ thêm ít mã). Bản web tải đầu **17,78 MB** / 20 (trước 17,74: thêm 0,03 MB bảng chỗ khung trong trang nhẹ). **Ảnh nét cao quái/trùm/làng: nét 3 = 26,8 MB, nét 4 = 42,5 MB** (PNG, tổng mọi vùng; chỉ tải khi bật, mỗi người chỉ tải một bản, và chỉ con đang hiện). Mỗi vùng ≈ 8–9 MB (nét 3) / 13–14 MB (nét 4); Sông 0,8 / 1,4 MB; làng 0,4 / 0,7 MB. |
| **RAM** (khi bật) | Ảnh giải mã ≈ 4 MB / triệu điểm. Phòng quái thường ở nét 4: thêm ~20–40 MB. **Trận trùm vùng nét 4: ~40 MB mỗi pha** (Hồ Tinh 9,7 triệu điểm / pha; lúc đổi pha có 2 pha cùng lúc trong 45 giây). Cộng với Cu Tí (~68 MB, phiên trước) và canvas 8 MB. Máy RAM ít có thể bị tải lại trang → lý do nữa để **chưa bật mặc định**. |
| Máy yếu | Số điểm tô mỗi khung hình đã tính ở phiên Cu Tí (canvas to hơn); vẽ quái từ ảnh nét cao là chép 1:1, không thêm phép tính nào. |
| Kho mã (git) | Thêm ~95 MB (ảnh PNG dạng chữ base64 trong 60 tệp `.sprite.json`). |
| Bảo trì | Sửa tấm quái nào (thay hàng, dựng lại) thì chạy lại 3 lệnh ở mục 6 cho con đó; nếu không, bản nét cao sẽ là hình cũ. Công cụ báo khung không khớp nên dễ thấy. |

## 5. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,86 MB; người chơi tải 17,78 MB / 20; ảnh nét cao in riêng |
| **Mặc định giống hệt trước** — 60 hình (mọi quái, trùm các pha, làng, em bé) vẽ bằng hàm game, canvas thật + ảnh chụp màn 844×390 dpr 3, so với bản dựng từ commit trước phiên | **0 điểm ảnh khác / 120 ảnh** |
| Cảnh trận mặc định (`net-cao/cong-cu/chup_tran.py`, đứng + chém kiếm nặng, 2 cỡ màn, canvas + màn) so với trước | **0 điểm ảnh khác / 12 ảnh** |
| `dist/linh-khi.html?cloud=0` (bản một tệp) mặc định / `?netcao=3` / `?netcao=4`, vẽ quái + trùm + làng | **0 lỗi JS** (không có ảnh nét cao → vẽ tấm thường, đúng như thiết kế) |
| Bản web mặc định / 3 / 4, vẽ cả 60 hình | **0 lỗi JS**; nét 3 và 4: **60/60 hình vẽ bằng ảnh nét cao**. (Chỉ có dòng lỗi mạng: máy thử không ra được Google Fonts / Firebase, và `sw.js` 404 như phiên trước.) |
| Xếp kín so với lưới đủ: cùng 60 hình ở nét 3 / 4 | 59/60 trùng từng điểm; Hồ Tinh pha 3 (vẽ ×0,72, thu sẵn) lệch pha lấy mẫu, cùng khung bao |
| **Bot** (`cong-cu/bot_netcao.py`, bản web, vòng lặp game chạy thật): 3 vùng × (phòng 10 quái mọi vai + tinh anh, 10 giây) + (trùm vùng bị trừ máu tới chết qua đủ 3 pha) | Nét 2 / 3 / 4: **0 lỗi JS**; 3 trùm đều qua pha 1 → 2 → 3 → gục ở cả 3 nét. Nét 3: 20 040 lần vẽ thân bằng ảnh nét cao, 96 lần bằng tấm thường (đúng lúc ảnh đang về); nét 4: 19 313 / 118. Nét 2: 0 lần ảnh nét cao. Số thô: `cong-cu/ra/bot.json` (không lưu repo) |
| `tests/smoke.py`, `tests/*.test.js` | 0 lỗi; đều đạt (`may_luat` bỏ qua như trước: thiếu thư viện) |

## 6. Đề xuất cho phần máy dùng chung (không sửa ở phiên này)

1. `build.py`, dòng in "trình duyệt không có WebP: … MB" đang **cộng cả ảnh nét cao** (phiên Cu Tí cộng vào `tong_png`) → nay in **90 MB** dù người chơi không WebP vẫn chỉ tải ~21 MB như trước. Chỉ là số in sai, game không ảnh hưởng; nên tách ảnh nét cao khỏi số này.
2. Ảnh nét cao chỉ có PNG (đúng cách phiên Cu Tí). Đã thử WebP lossless: chỉ nhỏ hơn ~6 % → không đáng thêm.
3. Nếu sau này bật nét cao cho nhiều người: nên có cách hạ về nét 2 khi máy báo thiếu RAM, và ảnh trùm vùng gen to hơn (mục 3).

## 7. Dựng lại

```
cd docs/review/ke-hoach-cai-thien/net-cao-quai/cong-cu
python3 kiem_ke.py [mã,…]          # tìm gốc + khớp khung → ra/khop.json
python3 dung_net_cao.py [mã,…]     # dựng nét 3, 4 → ra/<mã>-net3|4.png
python3 ghi_net_cao.py [mã,…]      # cắt sát, xếp trang, ghi vào game/art/custom (--xoa: bỏ hết, quay lui)
python3 bang.py                    # bảng kiểm kê
cd ../../../../../game && python3 build.py && python3 build.py --hai-tep
# kiểm: chup_quai.py <url web> <ra> 2,3,4 → lam_anh.py; bot_netcao.py <url web> 2,3,4
```

**Quay lui hoàn toàn:** `python3 ghi_net_cao.py --xoa` rồi build — tệp quái về đúng như trước phiên; mã vẽ tự bỏ qua khi không có bản nét cao.
