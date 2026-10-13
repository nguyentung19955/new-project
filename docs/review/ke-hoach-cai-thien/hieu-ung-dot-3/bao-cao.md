# Báo cáo: đưa ảnh hiệu ứng đợt 3 vào game

**Commit:** `6d37876c` (nhánh `khoi-tao-du-an`). Làm theo `YEU-CAU.md` cùng thư mục.

**Đã kiểm:** script cắt ảnh, `node --check` (mọi tệp `game/js/*.js` đều qua), `python3 game/build.py` (đã dựng lại `game/dist`).
**KHÔNG chạy game, KHÔNG chạy bài kiểm tra nào** (không Playwright). Không sửa `zed_moi.js`. Không đụng đăng nhập Google, lưu mây, `?cloud=0`, không chép apiKey.

## 1. Cắt ảnh

Script: `docs/anh-goc/zed/hieu-ung/cat_dot_3.py` (dùng lại `cat_phi_tieu.py`). Cắt khung THEO ĐƯỜNG VIỀN (dải cột trống dài nhất; S8 có hai khung dính nhau nên tách ở cột ít điểm nhất), xoá nền xanh alpha mềm, net 2.
- Ảnh trắng K2, K7, K11, K12: điểm ám xanh đổi sang xám để game tự nhuộm.
- Ảnh xanh thật K6, K9, S2, S7: giữ màu, chỉ bỏ điểm xanh lá thuần ở mép.
- Thêm kiểu canh `'o'`: giữ vị trí ngang của khung trong ô đều của tấm gốc (K1, K2, K11: hình dời chỗ giữa các khung).

`xem-truoc.png`: mọi khung đã cắt, phóng to, nền tối, chấm đỏ = điểm neo.

| Ảnh | Mã | Khung | Cỡ (điểm ảnh game) | Điểm neo |
|---|---|---|---|---|
| K1 | hu-lon | 5 | 40×20 | đống bụi, sát đất |
| K2 | hu-xoc-toi | 5 | 52×21 | mép trái (chỗ bắt đầu lao) |
| K3 | hu-song-dat | 4, lặp | 31×22 | chân gờ đất |
| K4 | hu-nut-dat | 6 | 26×28 | giữa vết nứt |
| K5 | hu-gai-bang | 6 | 22×23 | chân cụm gai |
| K6 | hu-doc-toe | 6 | 30×22 | đáy bãi nhớt |
| K7 | hu-doi-vk | 5 | 26×24 | tâm vòng |
| K8 / K9 / K10 | hu-bam-lua / hu-bam-doc / hu-bam-bang | 4, lặp | cao 30 | giữa đáy (chân) |
| K11 | hu-va-cham | 4 | 26×18 | tâm sao |
| K12 | hu-tich-chuong | 6 | 22×25 | tâm cầu |
| S1 | hu-khien-nuoc | 6 | 32×34 | tâm bong bóng |
| S2 | hu-day-leo | 6 | 30×36 | chân |
| S3 | hu-song-doi | 5 | 64×48 | tâm vòng |
| S4 | hu-phan-don | 4 | 48×31 | tâm khiên |
| S5 | hu-khi-the | 6, lặp | 34×51 | vòng dưới chân |
| S6 | hu-phan-than | 5 | 25×30 | chân |
| S7 | hu-nhua-rung | 4, lặp | 28×32 | vòng dưới chân |
| S8 | hu-am-sat | 4 | 40×23 | giữa vệt |
| H | gd-nut-danh-bow | 1 | 24×24 | (thay ảnh nút cũ) |
| I | gd-nut-dac-biet-bow | 1 | 24×24 | (thay ảnh nút cũ) |

Ngoài 17 ảnh dặn trong lời giao việc (K1–K12, S1, S3–S6), làm luôn S2, S7, S8, H, I vì `YEU-CAU.md` có ghi.

## 2. Móc vào game (giữ code cũ làm dự phòng khi thiếu ảnh)

Cờ **`?hudot3=0`** (hoặc `G.HU_DOT3 = false`): `G.huDot3(mã)` trả false, mọi chỗ dưới đây vẽ bằng code như cũ. Khai báo ở `js/fx_anh.js`. Cùng tệp đó thêm:
- `G.fxAnh.nhuom(a, màu, kiểu)`: nhuộm ảnh trắng theo hệ (nhân màu + cộng lại 25% ảnh gốc, giống cách nhuộm vòng tụ lực). Kiểu `'sang'` chỉ nhuộm điểm gần trắng (ánh trong khe nứt). Tấm nhuộm làm một lần rồi dùng lại.
- `G.fxAnh.veK(...)`: vẽ đúng một khung (khiên nước, cầu tích chưởng, dây leo).
- `G.fxAnh.ve` và hình `'anh'` của `fx.js` nhận thêm `mau`/`kieu` (nhuộm) và `mo` (độ đậm).

| Mã | Chỗ thay |
|---|---|
| hu-lon | `fx.js` `dodge`: ảnh đặt ở chỗ bắt đầu lộn, lật theo hướng lộn ngang; bỏ bụi + vệt gió vẽ code |
| hu-xoc-toi | `fx.js` `dash` (chỉ Xốc tới thương): xoay theo hướng lao thật 8 hướng, nhuộm hệ; bỏ `dashline` + chớp |
| hu-song-dat | `fx_he.js` `drawWave`: lặp, xoay theo hướng chạy, nấc 2 to ×1,25, ánh trắng nhuộm hệ |
| hu-nut-dat | `fx_he.js` `drawCrack`: mỗi đoạn 18 điểm ảnh dọc rãnh bắt đầu khi đầu sóng đất đi qua, phát xong giữ khung cuối tới khi rãnh tan; vệt nứt báo trước giữ code |
| hu-gai-bang | `fx_he.js` `drawSpikes`: vài cụm dọc hướng đòn (hoặc toả vòng), mọc lần lượt |
| hu-doc-toe | `fx_he.js` FINISH.poison (thay giọt bắn, vòng tím), đích của `heSpread`, và `fx_chuong.js` `chSpread` |
| hu-doi-vk | `fx.js` `swap`: ở tay, nhuộm theo hệ vũ khí mới |
| hu-bam-lua / doc / bang | `fx.js` `fx.entity`: thay lưỡi lửa, vệt độc, tinh thể / khối băng; cỡ theo thân `(B.h+4)/30` (0,5–1,5; người chơi ×0,85); `fx_ky_nang.js` bỏ hào quang độc khi có ảnh. Số tầng độc/băng vẫn hiện |
| hu-va-cham | `fx_he.js` `punch`, `spPin` (nhuộm hệ giáo); `fx_dan.js` `impact` khi phi tiêu xuyên qua quái (có hướng bay) |
| hu-tich-chuong | `fx_chuong.js` `drawCharge`: khung theo độ tích (1→5), đầy thì nhấp nháy khung 5–6; nhuộm theo cây chưởng (hoả/độc/băng); thanh tích trên đầu giữ |
| hu-khien-nuoc | `bo_skill.js` `veKhien` (khung 1–4 lặp); vỡ (`K.chan`) → khung 5 rồi 6 trong 0,3 giây thay `burst` |
| hu-day-leo | `bo_skill.js` `veSan`: mầm → vươn trong 0,32 giây đầu, giữ (khung 4–5), 0,25 giây cuối héo |
| hu-song-doi | `bo_skill.js` `veSan` vòng `'song'`; vòng `'trieu'` dùng cùng ảnh nhuộm lam đậm |
| hu-phan-don | `bo_skill.js` `K.phanDon`: thay `sparkle`, lật theo `P.face` |
| hu-khi-the | `bo_skill.js` `veKhiThe`: lặp, vẽ ở lớp SAU người |
| hu-phan-than | `bo_skill.js` `K.tick`, bóng hết giờ: thay hai `burst` tối |
| hu-nhua-rung | `bo_skill.js`: lặp dưới chân (sau người) khi đang hồi, thay đốm `sparkle` |
| hu-am-sat | `bo_skill.js` `K.danh`: tại quái, lật theo hướng đòn; chữ "Ám sát!" giữ |

## 3. Cần xem khi chạy thử (chưa kiểm vì không được chạy game)

- Cỡ và điểm neo là ước lượng từ ảnh (xem `xem-truoc.png`), chưa nhìn trong cảnh thật: hu-song-doi (cỡ theo bán kính /60), hu-khi-the (cao 51), hu-bam-* trên quái to.
- Nhuộm dùng `getImageData` một lần mỗi màu; nếu trình duyệt chặn đọc ảnh thì vẽ ảnh gốc không nhuộm (không lỗi).
- hu-lon đứng yên ở chỗ bắt đầu lộn (không bám theo Zed); lộn chéo chỉ lật trái/phải.
- Ảnh hiệu ứng đợt 3 thuộc nhóm tải sau (`build.py`): trước khi ảnh về, game vẽ code.
