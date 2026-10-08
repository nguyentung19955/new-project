# Quy chuẩn PIXEL ART — Thần Thoại Việt

Toàn bộ hình ảnh game chuyển dần sang **pixel art do Claude vẽ bằng code** (lưới ký tự + bảng màu chung → PNG), không gen AI.
Mẫu gốc: Thánh Gióng 32×32 — khăn vàng, giáp sắt, áo choàng đỏ, gậy sắt, viền đen 1px, phóng to nearest-neighbor.

## 0. PHONG CÁCH (BẮT BUỘC — chỉ đạo của người dùng)

Pixel **ĐỪNG TRẺ CON QUÁ** — bám sát thần thoại / huyền sử Việt, có **khí chất sử thi**:

- **Vẫn chibi nhưng tỉ lệ đầu : thân ≈ 1 : 1,5 – 1 : 2** (32×32: đầu ~10–11 dòng, thân + chân ~17–19 dòng). Không đầu quá
  to kiểu em bé. **Mắt nhỏ có thần** (1 điểm trắng + 1 điểm đen, có lông mày), KHÔNG mắt tròn to long lanh, KHÔNG má hồng mặc
  định. Nét mặt **nghiêm / oai** cho thần, tướng, boss; **dữ tợn** cho quái. Dáng đứng vững, vai rộng.
- **Bảng màu trầm, cổ kính:** đồng hun, son đỏ sẫm, vàng nghệ cũ, chàm, xanh rêu, nâu đất, đen khói (palette.txt đã chỉnh
  theo hướng này). Tránh màu kẹo ngọt / pastel / neon. **Đổ bóng 3 tông** (tối · gốc · sáng), tương phản sáng tối rõ.
- **Họa tiết văn hoá đúng:** hoa văn trống đồng Đông Sơn (vòng tròn chấm, răng cưa, chim Lạc), khố / váy, áo giao lĩnh,
  mũ lông chim, rìu / giáo đồng, nón lá, khăn vấn, rồng / rắn thời Lý–Trần. Tránh phong cách Nhật / Hàn / phương Tây
  (không kimono, không giáp hiệp sĩ).
- **Boss / thần to, uy** (Thủy Tinh, Thuồng Luồng, Sơn Tinh…); **quái theo truyền thuyết** (Ngư tinh, Hồ tinh, Mộc tinh…)
  nhìn đáng sợ vừa phải.
- **Icon / nút / khung:** chất liệu đồng, gỗ sơn son, đá, giấy dó, viền hoa văn trống đồng; không bo tròn kiểu game trẻ em.
- Mẫu cũ (đầu to, má hồng) đã bị coi là quá trẻ con → 3 tướng mẫu `giong`, `tanvien`, `chodo` vẽ lại theo mục này.

### 0b. PHÁ CÁCH (chỉ đạo của người dùng: "cứ phá cách về các nhân vật, vd pháp sư có thể là bộ xương")

- **Được — và khuyến khích — diễn giải lại táo bạo**, miễn hợp thần thoại / tâm linh dân gian Việt và vẫn đọc được vai trò
  trong game. Ví dụ: Thầy Mo / pháp sư = **bộ xương** đội mũ lông chim cầm gậy chuông đồng · thầy cúng = **hình nhân giấy
  vàng mã** · bà đồng = **bóng người mờ đeo mặt nạ** · thợ rèn = **người đá nứt lửa** · lái đò = **hồn ma đội nón lá chèo đò
  sông Âm** · quái = ma cây, ma da, hồn trâu, rắn thần nhiều đầu…
- **GIỮ NGUYÊN:** (1) vai trò / vũ khí / kiểu đánh trong game (cung vẫn bắn xa, chèo vẫn là vật cầm); (2) ngũ hành qua màu
  chủ đạo; (3) giới tính / loài khi đó chính là bản sắc nhân vật.
- **Nhân vật huyền thoại có danh tính rõ** (Thánh Gióng, Sơn Tinh, Thủy Tinh, Âu Cơ, Lạc Long Quân, Mỵ Châu, An Dương Vương,
  Chử Đồng Tử…): giữ dấu hiệu nhận diện cốt lõi, chỉ phá cách ở **tạo hình** (vd Gióng giáp sắt cháy đỏ, lửa bốc từ ngựa
  sắt) — KHÔNG đổi thành sinh vật khác.
- **Đội hình đa dạng hình thể** (người, xương, đá, giấy, gỗ / cây, đất nung, đồng, thú, hồn ma…) để trên sân dễ phân biệt.
- Tránh yếu tố văn hoá nước ngoài (cương thi Trung Hoa, ninja, ma cà rồng / xác ướp phương Tây), tránh ghê rợn máu me,
  vẫn không trẻ con. Gợi ý từng mã: cột **"Hướng phá cách"** trong `DANH-SACH.md` (session vẽ được phép đề xuất hướng khác
  nếu hợp các quy tắc trên — ghi lý do ở chú thích đầu file nguồn).
- **Không vẽ đồ / trang phục trang bị lên người tướng 32px** (chỉ vũ khí bản thân) — quyết định của điều phối.

- Danh sách mọi hình cần vẽ, chia lô: [`DANH-SACH.md`](DANH-SACH.md)
- Bảng màu: [`tools/pixel/palette.txt`](../../tools/pixel/palette.txt) · tool dựng: `node tools/build-pixel.js`
- Mẫu: `tools/pixel/src/tuong/giong.txt` (Thánh Gióng), `tanvien.txt` (Sơn Tinh), `chodo.txt` (Chàng Chèo Đò),
  `quai/tom.txt` (Tôm Binh), `nen/co|dat|nuoc.txt`, `icon/hanh-kim|moc|thuy.txt`
- Thử trong game: mở `index.html?pixel=1` (tắt hẳn: `?pixel=0`). Bật toàn cục: `const PIXEL_BAT = true` trong `js/pixel.js`.
- **Tool vẽ không cần code:** `tools/ve-pixel.html` (sinh sprite theo quy chuẩn từ mô tả / bộ phận, chỉnh tay, xuất `goi-pixel.zip` gồm cả
  nguồn `.txt` cho build-pixel) → game: Cài đặt → **Gói pixel** → Nạp gói (.zip) / Pixel: Bật. Hướng dẫn: [`HUONG-DAN-TOOL.md`](HUONG-DAN-TOOL.md).

---

## 1. Quy trình cho session vẽ một lô

1. Nhận lô trong `DANH-SACH.md` (mỗi lô = một nhóm thư mục). **Chỉ thêm / sửa file trong `tools/pixel/src/<nhóm>/`** của lô mình.
2. Mỗi hình một file `tools/pixel/src/<nhóm>/<mã>.txt` (mã = key trong game: `giong`, `tom`, `hanh-kim`…).
3. Vẽ thử: `node tools/build-pixel.js --nhap --xem <thư mục nháp> <mã>` → ảnh xem trước phóng ×8 (nền ô cờ, có lưới).
   **Mở ảnh xem tận mắt** (công cụ Read) sau mỗi lần sửa; sửa đến khi nhận ra nhân vật qua 2–3 dấu hiệu (mục 7).
4. Xong: `node tools/build-pixel.js --strict` (không `--nhap`) → sinh `assets/pixel/<nhóm>/<mã>.png|.json`
   (+ `<mã>-chan-dung.png` cho tướng / quái / boss), `js/pixel/<nhóm>.js`, `js/asset-list.js`. Commit cả nguồn lẫn file sinh ra.
5. Chạy `node tests/run-all.js pixel` + chụp trong game `?pixel=1` (1920×934, 844×390, 667×375, dọc 390×844), xem ảnh.
6. Ghi `GAMEPLAY.md` (tiêu đề theo tên nhánh), merge nhánh chính, push, báo session cha.

**Xung đột khi gộp:** file sinh ra (`js/pixel/<nhóm>.js`, `js/asset-list.js`) → giữ bản nào cũng được rồi **chạy lại
`node tools/build-pixel.js`** (nó dựng lại từ toàn bộ nguồn). Không bao giờ sửa tay file sinh ra.

---

## 2. Bảng màu chung (46 màu, tông trầm cổ kính)

Chỉ dùng màu trong `tools/pixel/palette.txt` — tool **báo lỗi** khi file nguồn khai báo màu lạ. Thêm màu = sửa palette.txt +
ghi GAMEPLAY.md + báo session điều phối (giữ cả game đồng bộ, đừng thêm tuỳ tiện).

| Nhóm | Tên màu (tối → sáng) | Dùng cho |
|---|---|---|
| Viền | `vien` · `toi` · `khoi` (đen khói) | viền ngoài 1px, viền trong, khe, tóc đen |
| Sắt / bạc (Kim) | `sat-toi` · `sat` · `sat-sang` · `bac` | giáp sắt, gậy sắt, lưỡi |
| Trắng | `trang-xam` · `trang` · `sang` | vải trắng, mắt, điểm sáng phép |
| Da | `da-toi` · `da` · `da-sang` | da người |
| Đất (Thổ) | `dat-toi` · `dat` · `dat-sang` · `cat` | gỗ, cán, đường đất, rơm, tre khô |
| Đồng / vàng | `dong-toi` · `dong` · `dong-sang` · `vang-nghe` · `vang-sang` | trống đồng, mũ đồng, viền đồ Vàng |
| Son / lửa (Hỏa) | `son-toi` · `son` · `son-sang` · `hong` · `lua` · `lua-sang` | áo choàng, khăn, má hồng, lửa |
| Lá (Mộc) | `la-toi` · `la` · `la-ma` · `la-sang` · `reu-toi` · `reu` · `reu-sang` | cỏ, lá, áo xanh núi |
| Chàm / nước (Thủy) | `cham-toi` · `cham` · `cham-sang` · `nuoc` · `nuoc-sang` · `troi` | áo chàm, nước, bọt |
| Tím | `tim-toi` · `tim` · `tim-sang` | độ hiếm Sử thi, ma quái |
| Ngọc | `ngoc` · `ngoc-sang` | ngọc bích, phép nước |

Mã hex xem palette.txt (đã chỉnh tông trầm). Màu đánh dấu `*` trong palette.txt (`vien`, `toi`, `khoi`, `reu-toi`, `sat-toi`, `dat-toi`, `dong-toi`, `son-toi`, `la-toi`, `cham-toi`,
`tim-toi`) là **màu viền hợp lệ**: pixel chạm nền trong suốt phải là một trong các màu này (tool cảnh báo, `--strict` báo lỗi).

---

## 3. Kích thước chuẩn (tool kiểm tra theo nhóm thư mục)

| Nhóm (`<nhóm>`) | Cỡ khung | Ghi chú |
|---|---|---|
| `tuong` — tướng người + linh thú | **32×32** | chibi; chân dung 32×32 tự cắt (hoặc khung `portrait` riêng) |
| `quai` — quái thường, tinh anh, biến thể | **32×32** | quái nhỏ (nòng nọc, dơi) vẽ nhỏ trong khung 32 |
| `boss` | **48×48** (boss thường) · **64×64** (boss cuối chương / to) | |
| `nen` — ô nền, cổng, thành, đế tướng | **16×16** (ô lát liền) · 32 / 48 / 64 (cổng, thành, đế) | ô nền phải lát liền 4 mép |
| `icon` — icon giao diện | **16×16** · **12×12** (icon nhỏ chỉ số / trạng thái) | |
| `do` · `an-phu` · `ky-nang` · `than-khi` | **24×24** | đồ, ấn phù, icon kỹ năng, thần khí |
| `vfx` — hiệu ứng (lửa, băng, choáng, độc, nổ, đạn, hạt…) | tuỳ | **do nhánh `claude/vfx-kenney` đảm nhận** — session vẽ lô khác không vẽ hiệu ứng; tạm có bảng màu riêng `tools/pixel/src/vfx/palette.txt` (build-pixel cộng thêm vào bảng chung, có cảnh báo); nếu nhóm dùng tool dựng riêng thì đặt file `KHONG-BUILD` trong thư mục nhóm để build-pixel bỏ qua |
| `giao-dien` — khung thẻ, thanh máu, nút | tuỳ (8..320), ghi rõ trong DANH-SACH | |
| `canh` — cảnh truyện, nền menu, chương | 160×90 · 320×180 | |
| `ban-do` — nền sân đấu theo từng bản đồ | **320×148** (1280×590 ÷ 4) | sinh bằng tool từ dữ liệu bản đồ (`tools/build-ban-do-spec.js`): ô đặt tướng một kiểu, xa đường chỉ trang trí |

> **Đặt tên mã kỹ năng (chốt 08/10):** dùng **gạch dưới** giữa mã tướng và phím: `lactuong_q`, `giong_w`… (không dùng `giong-q`). Nhánh `pixel-ky-nang-2` phải đổi tên theo trước khi gộp.

**LÀM MƯỢT MỨC 7 — MẶC ĐỊNH (người dùng chốt 08/10, claude/ve-lai-pixel):** vẫn VẼ nguồn đúng quy chuẩn này (bảng màu, viền đen 1px, lưới nhỏ).
`node tools/build-pixel.js` **tự sinh thêm bản làm mượt** `assets/pixel-muot/<nhóm>/<mã>.png` (+ `-chan-dung.png`) cho MỌI mã (trừ ô nền 16×16 lát liền):
sel-out viền → Scale2x ×3 → thu nhỏ trung bình, mỗi điểm gốc thành 2×2 (`tools/pixel/lam-muot.js`, manifest ghi `m: 2`). Game dùng bản này cho cả
canvas (tướng, quái, boss, cổng, bệ, nền bản đồ, khung máu) lẫn `<img>` / khung CSS, vẽ có làm mịn — không tính gì lúc chơi (không giật).
Tắt: Cài đặt → Hình pixel → "Làm mượt: Tắt" (`ttv.pxmuot = '0'`) / `?muot=0` → ảnh gốc nearest như cũ. `--khong-muot`: build không sinh bản mượt.
Commit cả `assets/pixel-muot/` cùng `assets/pixel/` (test so khớp nguồn). Gói `.zip` tự nạp không có bản sinh sẵn → game làm mượt tướng / quái lúc chơi (ngân sách 4 ms/khung).

Trong game: phóng **nearest-neighbor theo bội số nguyên** điểm ảnh màn hình (js/pixel.js `pxBlit`), CSS
`image-rendering: pixelated` cho `<img>` / canvas nhỏ. Tướng cao ≈ ảnh vẽ tay cũ nên thanh máu, vòng tầm đánh giữ nguyên chỗ.

---

## 4. Tỉ lệ chibi, hướng, điểm neo

- **Tỉ lệ đầu : thân 1 : 1,5 – 1 : 2** (mục 0): tướng 32×32 — đầu ~10–11 dòng (dòng 1–12), thân ~9 dòng, chân ~8 dòng; chân
  chạm dòng 29–30.
- **Quay mặt sang PHẢI**, góc 3/4 (game tự lật khi đi trái). Mắt nhỏ 2×1 (trắng + đen), lông mày đậm 2 điểm, không má hồng.
- **Điểm neo** `anchor: x,y` = điểm chân chạm đất (giữa hai bàn chân, dòng dưới cùng của viền). Game đặt điểm này đúng ô.
- Vật cầm ở **tay trước** (bên phải), không che mặt; áo choàng / cánh / đuôi ở **sau lưng** (bên trái).
- Linh thú là **THÚ** (rùa, nghê, kỳ lân, rồng, hổ…), không vẽ người mặc đồ thú. Quái bay: bóng game tự vẽ, sprite không có đất.

## 5. Viền, đổ bóng, hướng sáng

- **Viền ngoài đen nâu 1px** (`vien`) quanh toàn bộ hình — dùng lệnh `outline` ở cuối mỗi khung. Viền trong (tay đè thân,
  đầu và cổ) dùng `toi` hoặc tông tối của màu đó.
- **Ánh sáng từ trên-trái.** Mỗi mảng màu **3 tông**: tông sáng (mép trên-trái) · màu gốc · tông tối (mép phải / dưới,
  khe áo, dưới cằm), tương phản rõ. Không dùng gradient, không khử răng cưa, không điểm lẻ loi (pillow shading cấm).
- Không bóng đổ dưới chân trong sprite (game vẽ bóng elip). Không hào quang trong sprite — game vẽ viền sáng theo sao / chiêu.

## 6. Ngũ hành & độ hiếm

- **Ngũ hành** thể hiện ở màu nhấn + hiệu ứng khung `cast`: Kim = bạc/sắt `bac` · Mộc = `la-ma` · Thủy = `nuoc`/`ngoc` ·
  Hỏa = `lua`/`son-sang` · Thổ = `dong-sang`/`dat-sang`/`reu`. Icon ngũ hành: huy hiệu tròn nền `toi`, vành màu hành.
- **Độ hiếm** (tướng): **Thường** — đồ vải đơn giản, ≤1 màu nhấn, KHÔNG viền vàng, không vương miện. **Tím (Sử thi)** —
  thêm 1 chi tiết đồng / ngọc / tím. **Vàng (Huyền thoại)** — viền `vang-nghe`, mũ / vương miện nhỏ, vật cầm cầu kỳ.
- Đồ (`do`): Thường = gỗ/vải gai (`dat`, `cat`) · Hiếm = đồng (`dong`) · Sử thi = đồng khắc + ngọc · Huyền thoại = vàng ròng.

## 7. Đặc trưng nhân vật (BẮT BUỘC)

Mỗi hình phải giữ đúng đặc trưng trong prompt vẽ đã có: **giới tính, loài, trang phục, màu chủ đạo, vật cầm / vũ khí, phụ kiện
nhận diện, ngũ hành, thần thái**. Nguồn (thứ tự ưu tiên khi mâu thuẫn): `docs/PROMPT-GEN-LAI.txt` (sửa sai loài / vật cầm)
> `docs/PROMPT-DUNG-XUONG.txt|.md` > `docs/prompts-tuong.csv`, `docs/prompts-quai.csv` > cũ hơn (`PROMPT_GEMINI_FULL.md`,
`PROMPT-CAN-GEN.txt`, `PROMPT-THAY-HINH-CODE.txt`, `PROMPT-HIEU-UNG.txt`). `DANH-SACH.md` đã tóm tắt sẵn từng mã + dẫn nguồn.

- Ở 32×32 phải giữ được **2–3 dấu hiệu nhận diện chính**, ví dụ:
  - Thánh Gióng: giáp sắt + gậy sắt + khăn vàng / áo choàng đỏ (ngựa sắt, khóm tre: vẽ ở hiệu ứng / boss to nếu cần)
  - Sơn Tinh: vương miện 3 đỉnh núi + áo giáp xanh núi + gậy thần / núi nhỏ trên tay (chiêu)
  - Chàng Chèo Đò: đầu cạo búi tóc + áo trắng quần chàm + **mái chèo** (không kiếm, không giáp)
- Vật cầm phải hợp nhân vật (dân thường cầm dụng cụ nghề: chèo, cuốc, rìu củi…; thần hiền cầm pháp khí) — xem cột "vật cầm".
- **Chân dung UI 32×32 phóng:** thể hiện mặt + dấu hiệu (mũ, khăn, vương miện…). Tool tự cắt vuông phần đầu từ khung đứng đầu
  tiên; nếu cắt ra mất dấu hiệu thì vẽ khung riêng `anim portrait` (1 khung, cỡ ≤ khung).
- Trong file nguồn ghi 2–3 dòng chú thích đầu file: đặc trưng + dòng nguồn prompt (xem các mẫu).

## 8. Động tác (tool kiểm tra số khung)

| Nhóm | Động tác bắt buộc (số khung) | Thêm (tuỳ) |
|---|---|---|
| `tuong` | `idle` đứng 2–4 · `attack` đánh 3–4 · `cast` chiêu 2–4 · `hurt` trúng đòn 1–2 · `die` chết 2–4 | `win` 1–4, `portrait` 1 |
| `quai`, `boss` | `walk` đi 2–4 · `attack` 3–4 · `hurt` 1–2 · `die` 2–4 | `rage` hoá điên 2 (boss có enraged) |
| khác | `main` 1–8 (ô nước, hiệu ứng: nhiều khung) | |

Game ghép động tác: tướng — `attack` theo pha vung (swing 1→0), `cast` khi tung chiêu, `hurt` khi trúng đòn, `die` khi ngã,
`idle` lặp theo `fps`. Quái — `walk` lặp, `attack` khi ra đòn, `hurt` khi bị đánh, `rage` khi hoá điên.

---

## 9. Định dạng file nguồn `tools/pixel/src/<nhóm>/<mã>.txt`

Tên file viết thường không dấu, nối bằng `-` hoặc `_` (`hanh-kim.txt`, `lactuong_q.txt` — đúng mã trong DANH-SACH). `#` đầu dòng (hoặc sau khoảng trắng) là chú thích — vì vậy
`#` không dùng làm ký tự màu. Ký tự dành riêng: `.` trong suốt (khi đóng dấu: giữ pixel bên dưới), `_` xoá pixel bên dưới.

```
# Thánh Gióng — đặc trưng + nguồn prompt
name: Thánh Gióng          # tên hiển thị
size: 32x32                # đúng cỡ của nhóm
anchor: 15,30              # điểm chân chạm đất
colors:                    # ký tự = tên màu trong palette.txt (mỗi file tự chọn ký tự dễ nhớ)
  k = vien
  F = da
  y = vang-nghe

part tren                  # một mảng lưới (mọi dòng dài bằng nhau); có thể nhỏ hơn khung
....kkkk....
...kFFFFk...
end

anim idle fps=3 loop       # khai báo động tác: fps, loop | once
frame idle                 # dựng một khung bằng các lệnh, chạy lần lượt:
  use chan 0 24            #   use <part> [x y]   đóng dấu part tại (x, y)
  use tren                 #   use @idle.0        chép khung đã dựng (động tác.chỉ số từ 0)
  shift 0 1                #   shift dx dy        dịch cả khung (rơi ra ngoài = lỗi)
  wrap 2 0                 #   wrap dx dy         cuộn vòng (ô nền lát liền)
  swap F h                 #   swap a b           đổi màu ký tự a → b (nháy sáng khi trúng đòn)
  set 17 2 z               #   set x y c          đặt một pixel
  flipx                    #   lật ngang · rot 90|180|270 (90 / 270 chỉ khung vuông; 180 mọi khung)
  outline                  #   viền ngoài 1px bằng màu `vien` (hoặc outline <ký tự>)
end
```

Mẹo: chia nhân vật thành part (`tren` thân trên, `chan` chân, `gay` vũ khí đứng, `gay_ngang`, `tay`, `tay_len`…) rồi ghép;
khung thở = `use tren 0 1`; trúng đòn = `use @idle.0` + `shift -1 0` + nhắm mắt + `swap`; chết = khuỵu (`use tren 0 3`) →
nằm (`rot 90` + `shift`). Vẽ xong bật `--xem` xem ảnh phóng to, chỉnh từng điểm.

## 10. Lệnh tool

```
node tools/build-pixel.js                 dựng tất cả → assets/pixel/, js/pixel/<nhóm>.js, js/asset-list.js
node tools/build-pixel.js tuong/giong     chỉ dựng file khớp chuỗi (manifest vẫn gom đủ)
node tools/build-pixel.js --check         chỉ kiểm tra (mã thoát 1 nếu lỗi) · --strict: cảnh báo cũng là lỗi
node tools/build-pixel.js --nhap          bản nháp: bỏ qua kiểm tra đủ động tác (đang vẽ dở)
node tools/build-pixel.js --xem DIR       thêm ảnh xem trước ×8 vào DIR · --src / --out DIR: thư mục khác (test)
```

Tool **báo lỗi** (không ghi file nào): màu ngoài bảng màu, ký tự chưa khai báo, sai kích thước theo nhóm, dòng lưới lệch độ dài,
thiếu động tác / sai số khung, đóng dấu hoặc dịch tràn khung, khung trống, tên file sai. **Cảnh báo**: viền ngoài không phải màu
viền, động tác lạ.

## 11. File sinh ra (đừng sửa tay)

- `assets/pixel/<nhóm>/<mã>.png` — dải khung nằm ngang (khung i ở x = i × rộng), thứ tự theo `anim` khai báo.
- `assets/pixel/<nhóm>/<mã>.json` — `{ w, h, ax, ay, bbox, n, anims: { idle: { start, n, fps, loop } … } }`.
- `assets/pixel/<nhóm>/<mã>-chan-dung.png` — chân dung (tướng / quái / boss).
- `js/pixel/<nhóm>.js` — manifest theo nhóm cho game (index.html nạp sẵn đủ 12 nhóm).

## 12. Tích hợp kiểu "móc" (cho nhánh chức năng)

Mọi chỗ vẽ chỉ thêm MỘT dòng móc ở đầu hàm vẽ cũ: tra bảng mã → có ảnh pixel thì vẽ pixel và thoát, không có thì chạy tiếp
thân hàm cũ (giữ đường vẽ dự phòng). Ví dụ `drawHeroSprite`: `if (... pxDrawHero(ctx, h, x, y, o)) return …`. Hàm tra:
`pxEntry(nhóm, mã)` (null khi tắt pixel / chưa có ảnh), `pxUrl(nhóm, mã, chanDung)` cho `<img>`, `pxFrame(entry, i)` lấy khung.
Hình mới vẽ bằng code ở nhánh chức năng: thêm móc tương tự + ghi vào mục **Bổ sung** cuối `DANH-SACH.md`.
