# Ghép quái + boss vẽ từ mảnh vào game/demo.html chính (27/10/2026)

> **Chưa thử trên iPhone thật.** Mọi số đo dưới đây là Chromium headless trên máy chủ Linux (không GPU thật).

Quái Chuông Gỗ + boss Chuông Gác Làng giờ vẽ trực tiếp từ **14 mảnh PNG + 1 JSON rig** trong `game/demo.html` (game chính),
giống hệt bản thử đã duyệt hướng (`game/thu-quai-boss/`). Phần Lam (clip chạy rig-v4, sheet hành động) và hiệu ứng ảnh gen **giữ nguyên**.

Chơi thử: https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
- `?vao=quai` vào thẳng Sân chuông (3 quái), `?vao=boss` vào thẳng phòng boss.
- Hitbox: phím **H**, nút **▣** góc trên phải (điện thoại), hoặc `?hitbox=1`.

## Xem gì
| File | Nội dung |
|---|---|
| `lam-quai-boss-60fps.mp4` | quay **trong demo.html chính**, 60 khung/s, mỗi khung = đúng 1 bước logic (45,9 s): đoạn 1 `?vao=quai` – Lam hạ 3 quái (2 quái đi tuần né đấm rồi chém, quái gác vỏ cứng hạ bằng Cộng hưởng) · đoạn 2 `?vao=boss` – trận boss đủ 2 pha tới lúc thắng |
| `so-do.json` | số đo nạp (demo.html, bản build), lỗi console, số bước mỗi đoạn |

Trong video Lam do **bot** điều khiển (chỉ bấm phím). Bot **không** nằm trong demo.html: `game/tools/quay-ghep-quai-boss.py` lấy phần bot
của bản thử (`thu-quai-boss/cong-cu/khoi-thu.js`) chèn vào trang lúc quay. Lam **không bất tử** (bot né được hết, máu Lam giữ 5/5).
Không ghép bất tử / kiểm đòn / API quay vào demo.html.

## Đã ghép gì (8 chỗ theo `thu-quai-boss/GHI-CHU.md` mục 7 + overlay)
1. `<script src="runtime/quai-boss-runtime.js">` trước khối script chính.
2. `SRC`: bỏ `qb` (sheet chibi cũ), thêm `qbr: 'runtime/quai-boss/'`.
3. `updateQuai`: chọn khung sheet → `QBR.capNhatQuai(q,S.frame)`.
4. `bossAnim()` → `QBR.capNhatBoss(boss,S.frame,BOSS_G)`.
5. `drawQuai` / `chain` / `drawBoss` thay bằng khối vẽ từ mảnh (neo đúng mặt đất, không co giãn thêm, nháy trắng / lóe vàng bằng ảnh cache).
6. `boot()`: nạp + decode mảnh bằng `QBR.nap` **ở màn nạp** (trước nút Bắt đầu); bỏ tô màu sheet cũ. Hộp đấm quái `QHB` giữ số gameplay {−90,−81,66,37}.
7. Đầu `render()`: `ANIM_AL` – khi dừng / khựng đòn giữ đúng tư thế của bước hiện tại.
8. Debug (`?debug=anim`): chữ trạng thái quái dùng `q.H.info`.

Thêm: **overlay hitbox** như bản thử (xanh thân, lục vùng ăn đòn Lam, đỏ đặc đòn đang gây sát thương, cam sắp bật, tím nắm tay theo hình,
chữ "trạng thái game → clip/khung"); `?vao=quai|boss` (chỉ đặt chỗ đứng khi vào ải); màn Bắt đầu có 1 dòng số nạp mảnh.

**Gameplay không đổi**: hitbox, thời lượng, sát thương, tốc độ, collider, `ATK`, `P` giữ nguyên số. Boss đập theo trạng thái gameplay
(chuẩn bị → trên không theo vy/độ cao thật → bước tiếp đất game báo → hồi), quét/đấm khớp cửa sổ sát thương, trúng đòn không ngắt
attack của boss, nháy trắng do game quản lý – y như bản thử (bảng khớp hitbox xem `thu-quai-boss/GHI-CHU.md` mục 4–5).

`runtime/quai-boss-runtime.js`: `QBR.nap(base, tienDo, nhung)` nhận thêm tham số `nhung` = `{json, anh:{'quai/than.png': data URI…}}`
cho bản build (không tải mạng). Bản thử `thu-quai-boss.html` vẫn chạy như cũ (đã kiểm nạp).

## Bản build tự chứa (`python3 game/build-demo.py` → `demo.build.html`)
- Chèn **inline** `runtime/quai-boss-runtime.js` thay cho thẻ `<script src>`.
- Nhúng `TV.NHUNG.qbr` = JSON rig + **14 PNG mảnh nguyên bản** (data URI, kiểm cỡ ảnh = `co_anh` trong JSON, đếm đủ 14).
- **Không nhúng sheet boss 2x**, không còn nhúng sheet quái+boss chibi cũ.
- Kích thước: **10,33 MB** (trước 9,4 MB). Mở bằng `file://` trong Chromium: nạp xong, 0 lỗi.

## File xoá
**Không xoá file nào.** Đã grep: `game/anim/quai-boss.json/.png` vẫn được `game/demo-doi-chieu-v3.html` dùng (`SRC.qb`) – file đó không
được sửa nên giữ. Các file `game/anim/` khác vẫn dùng: `lam-nghi-2x.png` (dáng nghỉ TẠM của Lam, demo + build), `the-gioi.json/.png`
(lát rễ cây, demo + build). demo.html và build-demo.py **không còn** tham chiếu `anim/quai-boss.*`.

## Nạp và bộ nhớ ảnh (Chromium headless, localhost, DPR 2)
| | Số liệu |
|---|---|
| Ảnh quái + boss | **14 PNG mảnh = 960 KB** + JSON rig 77 KB; 42 ảnh cache (trắng / vàng / tối mỗi mảnh) tạo 1 lần lúc nạp |
| Bộ nhớ giải mã | PNG 3,89 MB + cache 11,67 MB = **≈ 14,8 MB** (sheet chibi cũ không còn tải) |
| Thời gian nạp mảnh (`QBR.so.ms_tong`) | demo.html **116,5 ms** (JSON 10,9 · tải + decode 63,6 · cache + vẽ thử 42,0) · bản build 118,7 ms |
| Mở trang → sẵn sàng (cả game) | demo.html 0,48 s · bản build (10,3 MB, file://) 0,77 s |
| Lỗi console / lỗi trang / yêu cầu 4xx | **0** ở cả 4 lần mở (demo thường, build, 2 đoạn quay) – chỉ chặn font Google vì máy chủ không ra mạng |

Qua mạng thật (githack / iPhone) thời gian tải do mạng quyết định (~1 MB thêm cho mảnh); **chưa đo**.

## Chưa làm / cần biết
- **Chưa thử iPhone / Safari thật**: thời gian nạp qua mạng, thời gian vẽ GPU, độ nét mảnh 2 px/px logic.
- Những điểm chưa đẹp của bản thử vẫn còn (tư thế pha 2 đặt tay bằng số, nện trần hơi cơ khí, `giat → roi` hơi đột ngột…) – xem
  `thu-quai-boss/GHI-CHU.md` mục 6.
- `thu-quai-boss/cong-cu/tao-tu-demo.py` sinh bản thử từ demo.html **trước khi ghép** – giờ demo.html đã chứa các chỗ ghép nên script đó
  không chạy lại được nữa; bản thử giữ nguyên làm mốc so sánh.
- Quay lại video: `python3 -B game/tools/quay-ghep-quai-boss.py` (chạy từ bất kỳ đâu; cần Playwright Chromium + ffmpeg).
