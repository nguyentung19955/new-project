# Thử PixelLab + combat kiểu Dead Cells – 30/10/2026 – TRANG MỚI, CHỜ NGƯỜI DÙNG XEM

Làm theo `docs/gameplay/PHAN-HOI-20-PIXELLAB-COMBAT.md` (quyết định 30/10: phát triển trên engine hiện có, Lam kiểu 4 chibi 64×64,
combat nhanh kiểu Dead Cells, hình từ PixelLab). **Trang riêng** – P0-B, P0-C, `thu-lam-moi-2`, `thu-lam-pixel` KHÔNG sửa.
Không xây từ demo ChatGPT (`PH20-goi-chatgpt-pixellab/`).

**Chơi thử (iPhone xoay ngang):**
https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-pixellab/index.html

## 0. Mới nhất (29/10): đã ghép bộ Lam chibi v3 – CHỜ NGƯỜI DÙNG XEM

Thay toàn bộ hình Lam bằng bộ chibi đã duyệt `art/huong-moi/lam-pixel/chibi/v3/` (bảng động tác `DONG-TAC-LAM-CHIBI.md`).
Hình gốc South-East = quay phải; quay trái game lật gương. Dùng PNG sạch (không dùng file `*-xem-vfx`), `--khong-mat` (mắt đã hổ phách).
Mọi clip neo chân CHUNG: điểm (32, 61) của khung 64×64; Chết khung 80×72 lệch −8 → neo (40, 61) → chân cùng mặt đất.

| Động tác game | Clip | Hình | Phát | Khớp engine |
|---|---|---|---|---|
| đứng | `dung` ← idle-se | 4 | 8 FPS, lặp | – |
| chạy | `chay` ← run-se | 6 | theo quãng đường 132 px/vòng (như clip chạy cũ) | – |
| chém 1 | `chem1` ← chem1-se/hybrid | 5 | lấy đà hình 1–2 · **mạnh hình 3** · hồi 4–5 | hình 3 hiện đúng 8 bước hộp chém bật (su 7 · ac 8 · re 8 giữ nguyên) |
| chém 2 | `chem2` ← chem2-se | 5 | lấy đà 1–2 · **mạnh 3** · hồi 4–5 | như trên |
| chém 3 | `chem3` ← chem3-se | 7 | lấy đà 2–4 (hình 1 = đứng, bỏ để chuông tích sáng đủ lâu) · **mạnh 5** · hồi 6–7 | + **khựng 3 bước (50 ms)** đúng lúc ra hình 5, trúng hay trượt (`dong-co.js`) |
| bị đánh | `bi-danh` ← hurt-se | 3 | theo thời gian bị đẩy (18 bước ≈ 300 ms) | chớp trắng ấm 50 ms + đẩy lùi bằng code |
| chết | `chet` ← death-se | 6 | 10 FPS, giữ hình cuối | hồi sinh vẫn bước 104 |

**VFX bằng code** (`vfx.js` + `vfx-lam.js`): cung âm thanh pixel bậc thang, không khử răng cưa, lật gương khi quay trái, vẽ THEO HÌNH đang hiện,
đúng toạ độ + màu bản xem thử đã duyệt (amber 255,190,80 · cyan 120,230,230 · cyan mờ 70,150,160 · trắng ấm 255,244,200).
Chém 1: hình 3 cung ")" cao 20 điểm, lõi amber viền cyan → hình 4 cyan mờ → tắt. Chém 2: cung chéo thấp → cao trước mặt → hình 4 cyan mờ.
Chém 3: hình 3–4 vòng sáng quanh chuông (không đè nĩa) · hình 5 sóng âm kép + vòng ngoài nét đứt + vòng đứt quanh chuông · hình 6 dư âm cyan mờ, vòng ngoài dịch ra 4 điểm.
Điểm VFX do `art/huong-moi/lam-pixel/code/xuat_vfx_lam.py` tính lại từ bản xem thử → ghi `vfx-lam.js` (đừng sửa tay). Hất / trên không / pogo vẫn dùng vệt cũ theo hộp.

**CHỜ HÌNH** (đang mượn hình chibi gần nhất): nhảy + nhảy vách = hình 2 của chạy · rơi + pogo = hình 5 của chạy · lướt = hình 4 của chạy ·
bám vách + tiếp đất = clip đứng · chém hất = clip chém 2 · chém trên không = clip chém 1. Hình tạm Lam kiểu 4 (`tam-…`) không còn dùng.

Lệnh đã chạy (từ `tieng-vong-cuoi-cung/`, `V=art/huong-moi/lam-pixel/chibi/v3`):
```
nhap_pixellab.py dung    $V/idle-se/idle-se-?.png        --neo 32,61 --fps 8 --lap --khong-mat
nhap_pixellab.py chay    $V/run-se/run-se-?.png          --neo 32,61 --quang 132 --khong-mat
nhap_pixellab.py chem1   $V/chem1-se/hybrid/chem1-?.png  --neo 32,61 --fps 12 --khong-lap --manh 2 --pha 0-1:2:3-4 --khong-mat
nhap_pixellab.py chem2   $V/chem2-se/chem2-?.png         --neo 32,61 --fps 12 --khong-lap --manh 2 --pha 0-1:2:3-4 --khong-mat
nhap_pixellab.py chem3   $V/chem3-se/chem3-?.png         --neo 32,61 --fps 12 --khong-lap --manh 4 --pha 1-3:4:5-6 --khong-mat
nhap_pixellab.py bi-danh $V/hurt-se/hurt-?.png           --neo 32,61 --khong-mat
nhap_pixellab.py chet    $V/death-se/death-?.png         --neo 40,61 --fps 10 --khong-lap --khong-mat
xuat_vfx_lam.py
```
(chỉ số hình trong lệnh tính từ 0: "hình 3" = 2). Cần biết: hộp chém vẫn cỡ cũ (cho Lam 108 px) nên bật ▣ Hộp sẽ thấy hộp cao hơn nĩa chibi
một chút – trúng/trượt không đổi; nếu muốn hạ hộp cho khớp hình thì báo.

> Theo yêu cầu, phiên này KHÔNG chạy thử / quay / đo trang (chỉ kiểm cú pháp code). Nếu trang báo lỗi nạp ở góc trên trái, chụp màn gửi lại.

## 1. Điều khiển + nút

| Cảm ứng | Bàn phím | Việc |
|---|---|---|
| kéo cần trái | ← → (A D) | chạy |
| cần gạt lên/xuống rõ (≈ 45°) + **Chém** | ↑ / ↓ + X | chém hất lên · pogo (trên không) |
| **Nhảy** | Z / Space | nhảy · nhảy vách (đang bám vách) |
| **Chém** | X / J | chém 1 → 2 → 3 (dưới đất) · chém trên không |
| **Lướt** | C / Shift | lướt |

Nút góc trên phải: **▣ Hộp** (hộp va chạm xanh, vùng ăn đòn xanh lá, hộp chém đỏ, mục tiêu vàng, đòn quái cam/đỏ) · **Chậm ×4** ·
**Hình?** (hiện tên trạng thái → clip → hình / pha đòn trên đầu Lam) · **DC: bật/tắt** (tải lại trang với `?dc=0` để so luật cũ).

Cảnh: cảnh pixel của `thu-lam-pixel` (2 nộm đứng sát nhau để thử 1 nhát trúng 2 mục tiêu, bậc đá, miếu chuông, gò cây) + **2 vách đá thêm**
ở cuối cảnh (một vách treo + một vách cao) để thử móc vách / nhảy vách + **quái Chuông Gỗ** (chưa có hình – khối pixel tạm, loé vàng khi lấy đà,
đập trúng thì Lam mất 1 chuông máu; vỡ rồi 3 giây sau xuất hiện lại). Hết 5 chuông máu → chết → hồi sinh chỗ xuất phát.

## 2. Đã làm gì

| Phần | File | Ghi chú |
|---|---|---|
| Engine combat | `dong-co.js` | CHÉP luật `thu-lam-moi-2`: nhịp 60 Hz cố định, chạy 264 px/s, nhảy mềm (cao 118, trọng lực 0,768), coyote 6, đệm nhảy 8 bước, collider 20×30, vùng ăn đòn 40×120, combo 1-2-3 (su 7/7/9 · ac 8 · re 8/8/16), hất, chém trên không, pogo (hộp [−26,−24,64,82], tự động 1 lần/lần rời đất, khựng chém trên không đầu), lướt 8 bước ×11 px, bám vách (móc) + trượt + nhảy vách, hàng chờ 1 nhát P0-A, hitstop 3/4/6, bị đánh/chết. Bỏ: Tiếng Vọng, Cộng hưởng, Thế, Dư Âm, rút dao, ván 1 chiều. Engine KHÔNG vẽ gì. |
| Nạp sprite | `sprite-pixellab.js` | đọc `art/huong-moi/lam-pixel/pixellab/lam-pixellab.json`; thiếu clip → hình tạm → khối màu |
| Animation | `hoat-anh.js` | bộ điều khiển hình, tách khỏi gameplay (mục 5) |
| Vệt chém | `vfx.js` | cung pixel 3 màu vẽ ĐÚNG trong hộp chém, tách khỏi sprite; `?vfx=0` tắt |
| Trang | `index.html` | cảnh 320×180 điểm (1 điểm = 3 px logic), Lam PixelLab 1 điểm = 2 px logic, cả khung 960×540 phóng **số nguyên** ×M (iPhone ngang: ×2 → điểm cảnh 6 px màn, điểm Lam 4 px màn), nearest-neighbor |
| Script nhập | `art/huong-moi/lam-pixel/code/nhap_pixellab.py` | mục 3 |
| Clip Lam | `pixellab/*.png` | bộ chibi v3 (mục 0); clip chạy PixelLab cũ 96×96 (`chay-0..5.png`) đã được thay |

## 3. Xuất từ PixelLab → nhập vào game (người dùng làm)

1. Trong PixelLab, mở animation đã duyệt (hướng **East** = quay phải). Tải về **PNG từng khung** (mỗi hình một file) – hoặc **sprite sheet**
   (một ảnh nhiều ô) – đều được. Không tải GIF/preview phóng to. Không cần cắt nền: để nguyên canvas PixelLab (64×64, 96×96…).
2. Bỏ các file vào một thư mục, ví dụ `art/huong-moi/lam-pixel/pixellab/tai-ve/chem1/` (hoặc gửi file cho Claude nhập hộ).
3. Chạy **một dòng** từ thư mục `tieng-vong-cuoi-cung/` (đổi `chem1` thành tên động tác):

```
python3 art/huong-moi/lam-pixel/code/nhap_pixellab.py chem1 art/huong-moi/lam-pixel/pixellab/tai-ve/chem1/
```

Sheet: thêm cỡ ô, ví dụ `... nhap_pixellab.py dung tai-ve/idle-sheet.png --o 64x64`.
Tuỳ chọn hay dùng: `--manh 2,3` (hình "mạnh" = lúc dao chém qua, khớp lúc hộp chém bật) · `--ms 100` / `--fps 8` / `--lap` (đứng, chết…) ·
`--quang 132` (chạy) · `--neo-x chan` (neo giữa hai ủng thay vì giữa canvas) · `--khong-mat` (không tô mắt) · `--doc` (chỉ xem, không ghi).

Script tự: đọc mọi khung (sắp theo số trong tên file) → **cắt nền thừa bằng MỘT khung chung cho mọi hình** (mọi hình dịch cùng một lượng,
KHÔNG căn từng hình theo khung bao → không rung, chung một neo chân; neo y = đáy ủng thấp nhất, neo x = giữa canvas PixelLab) →
dò **mắt**: chỉ điểm sáng + lạnh (xanh/trắng) nằm lọt trong vùng mặt đen ở 40 % trên của hình → ghi toạ độ + bảng đổi sang hổ phách
(lưỡi nĩa bạc, mũ xanh KHÔNG bị đổi) → ghi `pixellab/<tên>.png` (sheet một hàng, điểm gốc 1:1) + cập nhật `lam-pixellab.json`
(giữ nguyên clip khác + hình tạm). Mở lại trang là thấy.

Tên động tác game đang tìm: `dung` · `chay` · `nhay` · `roi` · `tiep-dat` · `luot` · `tuong` (bám/trượt vách) · `nhay-vach` · `chem1` · `chem2` · `chem3` ·
`chem-len` (hất) · `chem-khong` (trên không) · `pogo` · `bi-danh` · `chet`. Thiếu tên nào thì trạng thái đó dùng hình tạm (bảng `trang_thai` trong JSON).

Đã chạy cho clip chạy: `python3 art/huong-moi/lam-pixel/code/nhap_pixellab.py chay art/huong-moi/lam-pixel/pixellab/chay-?.png --quang 132`
→ ô gốc 96×96 cắt chung 54×61, chân [21, 61], mắt 6–7 điểm/hình (#b8ccd3 → #f2a33a, #c4d7db → #ffe08a, viền mờ → nâu hổ phách).

## 4. Cấu trúc `lam-pixellab.json`

```json
{
 "ti_le_mac_dinh": 2,                       // px logic mỗi điểm sprite (Lam 54 điểm × 2 = 108 px logic)
 "clip": {
  "chay": {
   "anh": "chay.png",                      // hoặc ["a-0.png", "a-1.png"] với "xep": "tung_file"
   "xep": "hang",                          // hang (một hàng) | luoi (nhiều hàng, thêm "cot") | tung_file | tung_khung ("khung": [[x,y,w,h]…])
   "o": [54, 61], "so_hinh": 6,
   "chan": [21, 61],                       // điểm chân trong ô, mặt phải; quay trái game tự lật quanh điểm này
   "phat": "quang_duong", "quang": 132,    // chạy: đổi hình theo quãng đường
   "ms": 100, "fps": 10, "lap": true,      // clip theo thời gian (đứng, chết…). ms có thể là danh sách từng hình
   "manh": [2, 3],                         // hình mạnh = pha ra đòn
   "pha": {"layda": [0, 1], "rado": [2, 3], "hoi": [4, 5]},   // (tuỳ chọn) chia hình theo pha – ghi đè "manh"
   "mat": {"diem": [[[28, 21], …] /* từng hình */], "doi": {"#b8ccd3": "#f2a33a"}},
   "tam": true                             // chỉ ghi cho hình tạm
  }
 },
 "trang_thai": {"chem2": ["chem2", "chem1", "tam-chem"], …}   // trạng thái → clip thử lần lượt
}
```

Hình tạm hiện có (Lam kiểu 4 pixel Claude dựng, `lam4-*.png`, cùng tỉ lệ ×2): `tam-dung`, `tam-chay`, `tam-nhay`, `tam-roi`, `tam-luot`,
`tam-chem` (cắt bỏ cung chém vẽ sẵn – vệt do `vfx.js` vẽ). Không có hình tạm cho **chết** → khối màu.

## 5. Animation tách khỏi gameplay

- Engine quyết **khi nào** (lấy đà atkT < su · ra đòn su ≤ atkT < su+ac · hồi); `hoat-anh.js` chỉ chọn **hình nào**: trong mỗi pha, hình =
  tỉ lệ thời gian của pha × số hình của pha đó. Clip 4 hình hay 12 hình thì chém 1 vẫn dài đúng 7 + 8 + 8 bước, hình "mạnh" hiện đúng bước hộp bật,
  hitstop dừng cả hình lẫn đòn. Pha không có hình → giữ hình kề (vd pogo su = 0 → bỏ qua lấy đà).
- Chạy theo quãng đường; bị đánh / lướt / nhảy-rơi / tiếp đất / nhảy vách theo biến game (hurtT, bước lướt, vy, landT, wjT);
  đứng và chết theo ms trong JSON (chết vẫn hồi sinh đúng bước 104 của engine dù clip dài/ngắn).
- Thứ tự ưu tiên hình: **chết > bị đánh > lướt > chém > vách > trên không > tiếp đất > chạy > đứng**.
- `?anim=debug` (hoặc nút **Hình?** / phím G): dòng chữ trên đầu Lam, vd `chem1 → TẠM tam-chem hình 3/5 · pha RA ĐÒN 1/8 · atkT 7`.

## 6. Combat kiểu Dead Cells – phần nào mới, phần nào có sẵn

| Yêu cầu | Trạng thái | Cờ |
|---|---|---|
| Đệm phím nhảy ≈ 100 ms | **có sẵn** trong engine cũ: 8 bước = 133 ms (+ coyote 6 bước). Giữ nguyên, không rút ngắn | – |
| Đệm phím chém cho combo (bấm trước khi đòn trước hết) | **có sẵn**: hàng chờ 1 nhát P0-A (bấm lúc nào trong đòn cũng nhớ, hạn = hết đòn + 6 bước; nối nhát kế ngay khi hết pha ra đòn) | – |
| Nối combo khi bấm SAU khi đòn vừa hết | **MỚI**: trong 10 bước sau khi chém 1/2 hết hẳn, bấm Chém → nhát 2/3 (luật cũ: quay lại nhát 1) | `dc_combo` |
| Huỷ đòn bằng lướt trong pha hồi (tuỳ chọn pha lấy đà) | **MỚI**: luật cũ cho lướt huỷ đòn MỌI lúc. Nay: được trong pha hồi + lấy đà; bấm lướt lúc RA ĐÒN → giữ phím, lướt ngay khi hết pha ra đòn (tối đa 11 bước) | `dc_luot`, `dc_layda=0` (chỉ pha hồi) |
| Lướt trên không 1 lần / lần nhảy | **có sẵn**: hồi lại khi chạm đất, nhảy vách, nảy pogo (nảy = một lần nhảy mới) | – |
| Đẩy lùi nhẹ khi trúng | quái Chuông Gỗ **có sẵn** (4,4 / 6 px với nhát 3, không đẩy khi nó đang đập); **MỚI**: hình nộm cũng bị đẩy 2,6 / 4,2 px rồi trôi về chỗ | `dc_day` |
| Một nhát trúng nhiều mục tiêu, mỗi mục tiêu 1 lần | **có sẵn** (engine duyệt mọi mục tiêu, ghi mã nhát) – thử bằng 2 nộm sát nhau | – |
| Ưu tiên chết > bị đánh > lướt > chém > di chuyển | chết/bị đánh huỷ đòn + hàng chờ (có sẵn); **MỚI**: đang bị đẩy (hurtT > 8) không lướt được (luật cũ: lướt thoát được) | `dc_uutien` |
| Hitstop | **có sẵn**: 3 / 4 / 6 bước theo nhát, 6 khi bị đánh, 3 khi nảy pogo | – |

Tất cả cờ MỚI mặc định **bật**. `?dc=0` tắt toàn bộ phần mới (= đúng luật `thu-lam-moi-2`). Bật/tắt riêng: `?dc_combo=0`, `?dc_luot=0`,
`?dc_layda=0`, `?dc_day=0`, `?dc_uutien=0` (hoặc `?dc=0&dc_luot=1` để chỉ bật một phần).

## 7. Bảng cờ link

| Cờ | Việc |
|---|---|
| `?dc=0` | tắt mọi phần combat mới (mục 6) |
| `?dc_<tên>=0/1` | bật/tắt từng phần: combo, luot, layda, day, uutien |
| `?anim=debug` | hiện tên trạng thái → clip → hình → pha đòn |
| `?hitbox=1` | hiện hộp |
| `?cham=4` | chậm 4 lần |
| `?vfx=0` | tắt vệt chém + tia trúng |
| `?mat=goc` | không tô mắt hổ phách (xem màu PixelLab gốc) |
| `?lien=1` | phóng lấp đầy màn (KHÔNG nguyên – chỉ để so độ đều điểm ảnh) |

Ghép nhiều cờ bằng `&`, ví dụ `index.html?anim=debug&hitbox=1&cham=4`.

## 8. Tự đánh giá / điều cần biết (chưa phải duyệt)

- Lam PixelLab trong `chay` cao ≈ 58–60 điểm (gồm chóp mũ nhún) → ≈ 116–120 px logic, cao hơn mức 54 điểm / 108 px mong muốn một chút
  (PixelLab vẽ nhân vật lớn hơn trong canvas 96). Không co ảnh (co sẽ hỏng điểm); nếu muốn đúng 54 nên xuất lại ở canvas 64 hoặc giữ cỡ nhân vật như ref 64.
- (Cũ, trước 29/10) Chạy là PixelLab, các trạng thái khác là **hình tạm Lam kiểu 4** – hai bản khác nhau (PixelLab: nĩa giống cờ lê, không thấy đèn lồng ba lô;
  kiểu 4: có đèn lồng) nên đổi giữa chạy ↔ đứng sẽ thấy nhảy hình. Hết khi có đủ clip PixelLab.
- Neo chân mặc định = giữa canvas PixelLab; nếu thấy Lam lệch so với hộp va chạm (bật ▣ Hộp) thì nhập lại với `--neo-x chan` hoặc `--neo X,Y`.
- Quái Chuông Gỗ, vách thêm: vẽ bằng code (khối pixel tạm), chưa phải hình duyệt.
- Âm thanh: chưa có trên trang này.
