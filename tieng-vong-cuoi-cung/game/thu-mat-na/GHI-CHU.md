# Thử Mặt Nạ Trắng – 31/10/2026

Trang chơi thử: Mặt Nạ Trắng (`art/mat-na/`) đánh 5 loại quái (`art/quai-moi/`). Trang RIÊNG – không sửa `thu-pixellab` hay trang nào khác.
Vật lý (nhảy, bám vách, nhảy vách, lướt) chép từ `thu-pixellab/dong-co.js`; cảnh dùng lại `art/huong-moi/lam-pixel/canh/` ghép 2 bản → màn dài 80 ô.

**Điều khiển:** ← → trôi · Z/Space nhảy (bấm lần 2 trên không = nhảy đôi, giữ khi rơi = lượn) · X chém (đất: combo 3 đòn; trên không: chém trên không; ↓ + X trên không: đập đất) · C/Shift lướt · V hồi máu (tốn 3 Tiếng Vọng, mỗi đòn trúng +1) · 1/2/3 hoặc nút trên cùng: đổi Cấp (Sơ Âm / Vang Âm / Cộng Hưởng) · H hộp va chạm · T chậm ×4.
Điện thoại: cần gạt trái, nút Chém / Hồi / Lướt / Nhảy bên phải; gạt xuống + Chém = đập đất.
Tham số URL: `?hitbox=1` bật hộp · `?cap=2` cấp đầu · `?cham=4` chậm · `?tu=1` không tự chạy (kiểm thử: `TV.buoc(n, 'ra')`).

## Tệp
- `index.html` – nạp, đầu vào, vẽ, HUD. `dong-co-mn.js` – vật lý + đòn + AI quái (không vẽ). `sprite-mn.js` – nạp/vẽ hình từng file.
- `nhan-vat.json` – hình + thời gian + khung trúng + hộp đánh của nhân vật (theo Cấp). `quai.json` – mọi thứ về quái + chỗ đặt.

## Quy ước chung
- **Điểm ảnh** (`chan`, `than`, `hop`, `hop_danh`, `lech`) tính theo ảnh gốc. **Khoảng cách / tốc độ** (`tam_*`, `toc_do*`, `cao`) tính theo px logic: 1 điểm ảnh = `ti_le` (2) px logic, 1 ô = 48 px logic, mặt đất màn = 432.
- Khung đếm từ **0**. `ms` = số (mọi khung bằng nhau) hoặc mảng từng khung.
- **Một clip:** `{"thu_muc": "phu/danh", "tien_to": "f", "so_hinh": 9, "bat_dau": 0, "ms": 100, "lap": true, "chan": [x, y]}` → nạp `<goc><thu_muc>/<tien_to>NN.png`.
  `tien_to` mặc định `f` (ảnh ghép hiệu ứng dùng `c`). Bỏ `so_hinh` → trang tự dò f00, f01… tới khi hết. `lap: false` → giữ khung cuối.
- **Thiếu thư mục / ảnh không làm hỏng trang:** vẽ khối màu (`mau_khoi`) cỡ `than`, gameplay vẫn chạy theo `so_hinh`/`ms`; tên clip thiếu hiện ở ô chữ góc trái ("THIẾU HÌNH: …").

## quai.json
```
"goc": "../../art/quai-moi/",  "ti_le": 2,
"loai": { "<id>": {
  "ten": "Phu Đèn Lạc", "mau_khoi": "#b39161",      // tên + màu khối khi thiếu hình
  "chan": [44, 74],          // điểm neo (chân; quái bay: đáy hình) trong khung ảnh, quay TRÁI. Mặc định cho mọi trạng thái (clip nào khác thì ghi "chan" riêng trong clip đó)
  "than": [28, 62],          // thân (hộp ăn đòn) rộng × cao, điểm ảnh, đáy giữa = neo
  "hinh": { "dung": clip, "di": clip, "danh": clip, "trung": clip, "chet": clip },
  "fx_danh": {"thu_muc": "phu/fx-danh", "tien_to": "c", "so_hinh": 9, "lech": [110, 30]},
        // ảnh ghép quái + hiệu ứng; lech = chỗ khung quái nằm trong ảnh ghép → neo = lech + chan. Có thì VẼ thay "danh", dùng ms của "danh". Bỏ key = vẽ "danh" trơn.
  "mau": 40, "sat_thuong": 1,          // máu quái · số máu trừ của nhân vật (nhân vật có 6)
  "bay": false, "bay_cao": 40,         // quái bay: không trọng lực, không va chạm ô; khi đuổi giữ chân cao hơn chân nhân vật bay_cao px
  "toc_do": 0.8, "toc_do_duoi": 1.5,   // px/bước khi tuần tra / khi đuổi
  "tam_phat_hien": 320,                // thấy nhân vật trong khoảng ngang này (theo đuổi tới 1,4×)
  "tam_danh": 120,                     // khoảng ngang tâm–tâm để bắt đầu đánh
  "khung_bao_truoc": 3, "bao_truoc_them_ms": 200,   // khung 0..2 = báo trước (dấu ! hổ phách); giữ khung báo trước cuối thêm 200 ms
  "khung_trung": [3, 4, 5, 6, 7],      // khung có hộp đánh (mỗi đòn chỉ trúng 1 lần)
  "hop_danh": [-69, -59, 75, 63],      // [dx, dy, rộng, cao] điểm ảnh so với neo, quay TRÁI (dx âm = phía trước). Quay phải code tự lật
  "lao": null,                         // hoặc [khung_từ, khung_tới, điểm ảnh] – lao tới trước trong các khung đó
  "hoi_chieu_ms": 1300,                // nghỉ giữa 2 đòn
  "day_lui": 4, "sieu_giap": false,    // lực bị đẩy khi trúng · true = đang đánh thì không bị ngắt (tinh anh)
  "hoi_sinh_ms": 4000                  // chết: phát "chet", mờ dần 0,5 s sau khung cuối, hồi sinh chỗ cũ sau từng này
}},
"dat": [ {"loai": "phu", "cot": 10, "tu": 6, "den": 12, "cao": 170} ]
        // cot = cột ô chỗ đứng; tu..den = vùng tuần tra (cột ô, khi đuổi được ra thêm 1 ô); cao = (quái bay) độ cao trên mặt đất, px logic
```
AI: tuần tra trong vùng (dừng nghỉ ở mép, không rơi khỏi bệ) → thấy nhân vật thì đuổi → tới `tam_danh` và hết hồi chiêu thì đánh (khung báo trước → khung trúng) → nghỉ → đuổi tiếp. Trúng đòn: chớp trắng + đẩy lùi + clip `trung` (trừ khi `sieu_giap` và đang đánh).
Đổi quái: sửa/ thêm một mục trong `loai` + một dòng trong `dat`. Không cần sửa code.

## nhan-vat.json
- `clip.<tên>` – như clip ở trên, hình quay PHẢI. Tên trạng thái game: dung, troi, nhay, nhaydoi, roi, tiepdat, luot, bamtuong, dapdat, luon, trungdon, hoimau, chet.
  Neo nhân vật 84×84 = (41, 70) (đáy đuôi khói, đo từ ảnh); clip ảnh ghép `fx/…` neo = vị trí nhân vật trong khung + (41, 70).
- Riêng `dapdat`: `khung_lao` (giữ khung này khi lao xuống), `trung`, `hop`, `sat_thuong`. `hoimau`: `khung_hoi` (khung cộng máu).
- `cap[0..2]` = Sơ Âm / Vang Âm / Cộng Hưởng: `sat_thuong` + `clip` don1, don2, don3, chemkhong (ảnh `fx-cap/<đòn>/capN/cNN`), mỗi clip có
  `trung` (khung trúng), `hop` [dx, dy, rộng, cao] điểm ảnh so với neo mặt phải (đo theo vùng hiệu ứng các khung trúng của đúng cấp đó), `lao` [khung_từ, khung_tới, điểm ảnh], `nhan` (hệ số sát thương).
- Combo: bấm Chém lúc nào cũng được ghi nhận; đòn kế bắt đầu ngay sau khung trúng cuối của đòn trước. Lướt chỉ huỷ đòn sau khung trúng.

> Đã kiểm nhanh bằng Chromium không màn hình: nạp đủ hình, không lỗi JS, 5 quái đều đánh trúng, combo / nhảy đôi / lượn / đập đất / lướt chạy, thiếu thư mục → khối màu.
