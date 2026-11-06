# QA NGÂM — bot chơi thật hàng trăm trận (06/11)

Câu hỏi của bạn: *"Bạn có chắc là test full hết rồi không?"* — Trước hôm nay thì **chưa**: mỗi lần chỉ kiểm riêng từng tính năng.
Lần này có một **con bot chơi như người thật**, chơi rất nhiều trận liên tục, và một bộ **luật kiểm tự động** soi trạng thái game ở
**mọi khung hình**. Thấy gì sai là ghi lại đúng hạt giống + bước để chơi lại y hệt.

## 1. Đã chơi bao nhiêu

Vòng ngâm chính (06/11, 69 phút, máy 2 lõi, hạt giống 1000–1299):

| Chế độ | Số trận | Tổng số wave đã chơi | Wave cao nhất | Thắng |
|---|---:|---:|---:|---:|
| SOLO | 100 | 3 495 | 70 | 19 |
| CO-OP (2 bot) | 100 | 3 455 | 70 | 22 |
| PVP (bot đấu bot) | 100 | 3 290 | 75 (đột tử) | 11 |
| ONLINE CO-OP (2 máy thật + máy chủ giả) | 3 | 20 | 7 | — |
| **Cộng** | **303** | **≈ 10 260 wave** | | |

- Thêm các vòng dò lỗi trước đó (≈ 120 trận) và vòng xác nhận sau khi kéo code mới nhất (16 trận, XANH).
- 10 trận được **chạy lại cùng hạt giống**: 9 khớp từng mốc; 1 lệch (xem mục 4).
- 5 trận chụp ảnh iPhone 13 chơi đúng nhịp thật (≈ 60 ảnh + màn kết quả), đã xem bằng mắt.
- Bộ nhớ: đo sau mỗi 10 trận trên cùng 1 trang (dọn rác rồi đo): luôn 9–14 MB, **không tăng dần** qua 130+ trận.
- Đỉnh số đối tượng cả vòng: đạn 32, hiệu ứng kỹ năng 102, quái 180, hạt 320 (trần), chữ nổi 48 — không phình.


- **Bot làm gì:** triệu hồi, ghép thường, **ghép đặc biệt / kéo thả** (Copycat, Merge King, Blood Circuit, Scrap Forge, Teleporter,
  Fusion Mixer, Overclock…), power-up, chạm skill ụ ĐỎ khi đầy, dùng chỉ huy (Hero / Dahlia / Eve) — tất cả qua **đúng hàm game**
  mà nút bấm và kéo thả gọi. Quyết định ngẫu nhiên nhưng có lý (bàn đầy thì ghép nhiều, ưu tiên sao thấp…).
- **Bộ bài:** ngẫu nhiên trong 93 ụ, nghiêng mạnh về ụ đặc biệt / biến hình / vàng & đỏ mới; 30 % trận dùng **bộ thật của bạn**
  (Star Cannon + Mystery Box + Leviathan hoặc ụ đỏ khác + Evolver + Copycat).
- **Kiểu trận:** *thường* (từ wave 1 tới khi thua / wave 45), *vào muộn* (bắt đầu wave 30–65, bàn đầy 4–6★, nhiều trùm mới),
  *dài* (bất tử, chơi tới **wave 70+**). Tốc độ 1× / 2× / 3×. Cấp thẻ ngẫu nhiên 0–10.
- **Chế độ:** SOLO, CO-OP (2 bot), PVP (bot đấu bot, có đột tử từ wave 30), **ONLINE CO-OP** (2 trình duyệt thật + máy chủ giả).
- **Chụp ảnh iPhone 13** (390×664, DPR 3) một nhóm trận chơi đúng nhịp thật, mỗi ~8 giây trận 1 ảnh + màn kết quả.

## 2. Bot kiểm những gì (mỗi khung hình)

| Kiểm | Ý nghĩa |
|---|---|
| Ụ trên bàn ⊆ bộ bài | không có ụ lạ ngoài 5 thẻ (bất kể ghép, biến hình, chiêu trùm) |
| Bản sao Copycat giữ dấu + % | qua mọi biến hình (Mystery Box, Evolver, Scrambler, Mad Crown…) |
| Dấu báo chiêu / tâm ngắm trùm | không còn sau khi trùm chết, hết wave, hết trận (cả trạng thái lẫn hình vẽ thật trên canvas) |
| Sao 1–7 | không có 0★ hay 8★ |
| Mana / giá / tim | không NaN, không âm |
| Trạng thái kẹt | Evolver 7★ "xịt" mà đã bị giảm sao (lúc không bị khoá), băng > 30 s, quái máu > tối đa, wave chạy > 400 s |
| Lỗi trang | mọi lỗi JS / console.error / ảnh tải hỏng (404) |
| Lớp phủ sai chế độ | bảng mạng / online không được hiện trong trận offline |
| Đếm đối tượng | đạn, hiệu ứng, quái, hạt… không phình; bộ nhớ (heap sau GC) không tăng dần qua các trận |
| Màn kết quả | phải hiện, vừa màn, không chữ tràn, băng thông báo trận đã tắt |
| Vẽ | 2 vòng khác nhau chồng cùng tâm trên 1 ô; chữ/ảnh tràn khung (ảnh iPhone 13) |
| Tái lập | chạy lại cùng hạt giống → cùng kết quả từng mốc 10 giây trận |
| ONLINE | bàn mình ở máy này = bàn đồng đội ở máy kia, cùng wave, cùng tim chung, không bị giao AI khi mạng tốt |

## 3. Lỗi tìm được

| # | Mức độ | Lỗi | Cách gặp | Sửa |
|---|---|---|---|---|
| 1 | **Nặng** | **Dấu đỏ / tâm ngắm của trùm nằm lại trên ụ sau khi trùm chết** (đúng lỗi bạn thấy) | Trùm đang báo chiêu (1,4 s) thì bị giết → ụ bị nhắm giữ tâm ngắm đỏ mãi. Bot gặp ở **25 / 82 trận** dò lỗi đầu (≈ 1/3) | ✅ Phiên "dấu báo chiêu trùm" sửa (cc1c21f); vòng ngâm sau đó: **0 lần** |
| 2 | **Nặng** | **Ụ lạ ngoài bộ bài trên bàn** (đúng lỗi bạn thấy) | Joker King ném Mimic vào ụ không có cặp cùng sao (hoặc 7★) → Mimic nằm lại. **21 / 82 trận** | ✅ Phiên "ụ ngoài bộ bài" sửa (cd6f890); vòng ngâm: **0 lần** |
| 3 | **Nặng** | **Bản sao Copycat mất dấu / mất −%** khi bị biến hình | Copycat chép Evolver / Mystery Box rồi nó tự biến; Mad Crown biến bản sao. **3 / 12 trận** đầu (trước khi ma trận gộp) | ✅ Phiên "ma trận tương tác" sửa (2d8ccde); vòng ngâm: **0 lần** |
| 4 | Vừa | **Ụ 0★** (sao không hợp lệ, rồi lan qua biến hình: Mad Crown biến ụ 0★ ra ụ 0★, Joker ra Mimic 0★) | PVP đột tử có 2 Star Leech cùng lúc: cả 2 báo chiêu nhắm 1 ụ 2★, con đầu hút còn 1★, con sau hút về **0★**. Hạt 116 | ✅ **Phiên này sửa**: lúc tung chiêu kiểm lại, ụ < 2★ thì không hút (trum.js). Hồi quy: 2 Leech × SOLO/CO-OP/PVP |
| 5 | Nhẹ | **Tải ảnh hỏng 404 `trum_jammer.png`** (và 5 trùm mới khác) | Trùm mới ra khi dải ảnh 8 hướng chưa nạp xong (vào trận muộn) → game xin tên ảnh cũ không tồn tại, lặp lại nhiều lần | ✅ **Phiên này sửa** (quaianim.js): trùm mới luôn dùng tên dải 8 hướng. Hồi quy: không còn 404 |
| 6 | Nhẹ | **Chữ "LV16+1" lòi ra khỏi khung thẻ** ở khay dưới (iPhone 13) — mọi chế độ | Cấp thẻ ≥ 10 + đã power-up → nhãn 6 ký tự đặt lệch trái 15 % nên chạm/vượt mép phải khung. Ảnh trước: `lv_truoc.png`, sau: `lv_sau.png` | ✅ **Phiên này sửa** (ui.js + otoigian.css): nhãn dài canh giữa ô. Hồi quy: SOLO/CO-OP/PVP nhãn nằm trong khung |
| 7 | Nhẹ | **Hai vòng chồng nhau trên 1 ô**: vòng triệu hồi + vòng LV / vòng bậc vàng + vòng LV | Thấy 2 lần (hạt 103, 1157) | ✅ Phiên "MỘT VÒNG" đã gộp (0322b212) — vòng xác nhận sau gộp: 0 lần |

Báo động giả đã loại khỏi bộ kiểm (không phải lỗi game): tâm ngắm Hex Saboteur / Signal Jammer ở PVP (là chiêu của ụ, có hạn giờ, tự hết);
Evolver xịt còn hình xịt lúc đang bị đóng băng / câm (skill tạm dừng khi bị khoá, hết khoá là đếm lại); thua sớm ở wave 2 (bot cũ đốt hết
mana đầu trận vào power-up — đã sửa bot).


## 4. Còn mở / ghi chú

- **Giật khi ra 1 bước luật (cảnh báo, chưa phải lỗi chắc chắn):** 21 / 300 trận có 1 bước luật mất 250–1 170 ms (thường ngay sau ghép đặc
  biệt / Mad Crown / chỉ huy, lúc hiệu ứng dựng ảnh lần đầu). Máy đo dùng chung 2 lõi cho 2 trận + máy chủ nên số này ồn; đã ghi kèm sự kiện
  vào `tran.jsonl` (`cham`) để phiên "giật khi ra skill" xem tiếp. Bộ kiểm chỉ báo lỗi khi > 1 000 ms.
  → **Đã xử lý 06/11** (`tuvan/giat-ghep/BAO-CAO.md`): nguyên nhân = lần đầu vẽ tờ ảnh lớn (chép + lên GPU + mip) và dọn rác dồn do canvas
  tạo-rồi-bỏ; làm nóng lúc rảnh + canvas nháp dùng lại; hồi quy `tools/thap-kt-giat-ghep.js` (CPU ×4, ≤ 120 ms).
- **Tái lập:** luật game tất định khi hiệu ứng hình dùng RNG riêng (bộ kiểm tách sẵn). 1 trận (hạt 1000, CO-OP) lệch ngay mốc đầu — đó là trận
  ĐẦU TIÊN của trang mới, lúc ảnh đầu súng còn đang tải: vị trí đầu nòng (nơi đạn bay ra) tính theo cỡ ảnh đầu súng → đạn trúng sớm/muộn vài
  khung. Không ảnh hưởng người chơi (online đồng bộ bằng hành động, không bằng sát thương), chỉ ghi lại.
- **Nhãn tên ụ sau khi ghép đè nhau** khi ghép 2 ô cạnh nhau liên tiếp ở 3× — **đã sửa 06/11** (`js/keoghep.js`: tấm mới thay tấm cũ chồng lên nó;
  kiểm `tools/thap-kt-giat-ghep.js`, SOLO/CO-OP/PVP).
- **ONLINE**: 3 trận × ~7 wave, 2 bàn soi gương khớp, cùng wave, cùng tim, không giao AI — ít trận vì mỗi trận phải chạy đúng nhịp thật
  (~2 phút). Muốn ngâm online lâu hơn: `ONLINE=10 ONLINE_S=300`.
- Trận chụp ảnh chỉ chơi tới ~wave 7 (chơi nhịp thật, tốn thời gian); trùm và wave cao được soi bằng vẽ canvas thật trong chế độ tua nhanh.


## 5. Chạy lại bất cứ lúc nào

```bash
# gốc repo
python3 -m http.server 8765 &
NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &     # chỉ cần cho ONLINE
NODE_PATH=/opt/npm-tools/node_modules node tools/thap-qa-ngam.js                        # 300 trận + 4 online + 12 tái lập (~70 phút, máy 2 lõi)
```

- Ít trận cho nhanh: `SO=30 ONLINE=0 NHIN=0 node tools/thap-qa-ngam.js` (~6 phút).
- Chơi lại đúng 1 trận bị lỗi: `SEED=<hạt> node tools/thap-qa-ngam.js` (hạt in trong `loi.txt`), thêm `THEM='{"ktMoi":1,"nkMax":60}'`
  để kiểm từng bước và in 60 sự kiện cuối trước lỗi.
- Biến: `SO` số trận · `LUONG` số trang song song (2) · `CHE=solo,coop,pvp` · `SEED0` hạt đầu · `NHIN` số trận chụp ảnh iPhone 13 ·
  `TAILAP` số trận chạy lại so tái lập · `ONLINE` số trận online · `PHUT` trần thời gian · `KHONG_DAI=1` bỏ trận tới wave 70 · `OUT` thư mục ra.
- Kết quả: `OUT/ket-qua.json` (mọi trận), `OUT/tran.jsonl` (ghi dần từng trận), `OUT/loi.txt` (gọn: loại lỗi × số lần + hạt giống + 14 sự kiện
  trước lỗi), ảnh `OUT/anh/`. Mã thoát 1 nếu có lỗi.
- **Hồi quy** (`tools/thap-kt-hoiquy.js`, bước `qangam`) chạy `tools/thap-kt-qa-ngam-repro.js`: tình huống nhỏ của từng lỗi ở trên
  (SOLO/CO-OP/PVP) + ngâm ngắn 9 trận. `CHI=ngam` để chạy riêng.

Cách hoạt động (cho session sau): `tools/thap-qa-ngam-trang.js` được tiêm vào trang trước mọi script game. Nó khoá vòng rAF lại và tự
bước luật (bước cố định 1/60 s) → 1 trận 70 wave chạy trong ~1 phút; cứ 20 bước vẽ 1 khung thật (để soi canvas). Hiệu ứng / âm thanh /
HUD chạy bằng RNG riêng, luật chạy bằng RNG hạt giống → tái lập được. Trận chụp ảnh thì để vòng rAF thật của game chạy (đúng nhịp).

## 6. Tệp trong thư mục này

- `vong-chinh.json` — tóm tắt vòng ngâm chính: từng trận (hạt, chế độ, kiểu, tốc độ, bộ bài, wave, thắng/thua, lỗi, bước giật), đỉnh đối tượng, bộ nhớ, tái lập.
- `vong-chinh-loi.txt` — danh sách lỗi gọn của vòng chính (toàn báo động giả Hex PVP + cảnh báo giật — xem mục 3, 4).
- `lv_truoc.png` / `lv_sau.png` — khay thẻ iPhone 13 trước / sau sửa nhãn "LV16+1".
- `iphone13_pvp_w4.jpg` — 1 khung trận PVP chơi nhịp thật (bot) trên iPhone 13. ("RIVAL ♥ 9979" là do bộ kiểm cho bàn đối thủ bất tử để trận kéo dài, không phải lỗi.)
