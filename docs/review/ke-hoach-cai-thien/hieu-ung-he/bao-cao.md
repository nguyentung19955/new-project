# Hiệu ứng 3 hệ (Độc, Lửa, Băng) — đo và sửa (17/10)

Chủ game nói: *"Các hiệu ứng độc quẹt qua: thứ nhất là nhanh quá, rối; thứ hai là không biết có gây sát thương vào quái không."* và
*"Check cả LỬA và BĂNG ở TOÀN BỘ các bậc tăng hiệu ứng."*

Phiên này chia hai phần: **Phần A — ĐO** (chỉ đọc + bot không màn hình, không đổi game) và **Phần B — SỬA** (chỉ đổi HÌNH và tín hiệu báo trúng,
mỗi mục có cờ tắt riêng, cờ chung `?hemoi=0` về y hệt trước). Không đổi sát thương, vùng trúng, thời lượng đòn, cộng dồn trạng thái, luật chơi.

---

## PHẦN A — ĐO (hiện trạng trước khi sửa)

### Cách đo

- Bot không màn hình (Chromium, bản một tệp `game/dist/linh-khi.html?cloud=0`), không ai chơi thử. Cu Tí cấp 20, đứng giữa phòng trống,
  quái Heo Rừng Con **đứng yên, máu rất dày** (không chết, để đo đủ cả đòn). Công cụ: `cong-cu/do_he.js` (đo trong trang) + `cong-cu/do.py` (chạy cả bảng).
- **3 hệ × 4 bậc hình thái** (Trắng, Mầm, Thành hình, Thức tỉnh) **× 14 đòn**: kiếm nặng 3 nhát, kiếm né rồi lướt chém, Trảm Nguyệt;
  thương 3 đâm + quét vòng, giữ → xốc tới, Phi Thương; búa nện thường, nện đất nấc 1, nấc 2, Địa Chấn; phi tiêu 3 phát, giữ → ném chùm, mưa phi tiêu;
  chưởng theo cây của hệ (chưa học / học đầy cây). Mỗi ca chạy 4 lần: **không quái** (đo hình vệt), **trượt**, **trúng 1 quái**, **trúng 3 quái**.
- Thêm tình huống riêng: Nổ khói (Lửa + Độc), Sốc nhiệt (Lửa + Băng, cả hai chiều), đóng băng 5 tầng rồi vỡ, nổ lan khi quái cháy chết, lây độc khi quái
  trúng độc chết, đánh trùm Mộc Tinh (mỗi hệ, Mầm và Thức tỉnh).
- Mỗi khung ghi: mọi hình hiệu ứng **của Cu Tí** mới sinh (tên ảnh, thời gian hiện, cỡ, nhuộm), số hình đang hiện cùng lúc, số hạt; vẽ thế giới
  2 lần (có / giấu hiệu ứng của Cu Tí) để lấy **điểm ảnh hiệu ứng thấy được**; và **giấu riêng từng loại** để biết loại nào thấy được bao nhiêu.
- Vùng trúng thật: đặt **lưới 555 quái** (cách nhau 6 điểm game) quanh Cu Tí, ra đòn một lần, ghi con nào mất máu vì đòn (`G.damage` nguồn "hit").

Bảng đầy đủ: [`bang-do.md`](bang-do.md) (14 đòn × 3 hệ × 4 bậc, tầm từng nhát, tình huống riêng). Số liệu gọn: `so/gon-a.json`, `so/tam-a.json`,
`so/dac-a.json`, `so/luyen-a.json`.

### A1. Hệ × bậc × đòn — tóm tắt

**Thời gian hiện (đã gồm 0,12 giây giữ khung cuối khi mờ dần):**

| Hình | Thời gian hiện | Ghi chú |
|---|---|---|
| Vệt kiếm nặng `hu-chem-kiem-nang-1…4` | 250 / 320 / 420 / 340 ms | **Không theo hệ**: cả 3 hệ đều là vệt trắng-xanh (nhìn như Băng kể cả khi cầm kiếm Lửa / Độc) |
| Vệt thương `hu-dam-giao`, búa `hu-chem-bua` | 300 ms / 360 ms | không theo hệ (trắng) |
| Vệt có bản theo hệ `hu-chem-luot-*`, `hu-quet-giao-*`, `hu-nen-dat-*`, `hu-ra-chieu-*` | 320–480 ms | đúng màu hệ |
| Lớp "giọt hệ" `hu-giot-he-<hệ>` vẽ đè dọc vệt | 240–420 ms | là thứ DUY NHẤT cho thấy màu hệ ở kiếm nặng / thương / búa; trùng chỗ với vệt |
| Chớp trúng `hu-trung` / `hu-trung-nang` | 320 / 360 ms | trắng-vàng, to 32–40 điểm, **mỗi quái trúng một cái** (3 quái = 3 chớp chồng) |
| Chùm hạt `hu-hat-no`, khói `hu-khoi-tron` | 450 / 620 ms | sinh cả lúc vung (trượt cũng có) và lúc trúng |
| Vòng tím `ring` (độc) + vòng "nhói" mỗi nhịp độc | 220–340 ms | **màu tím** lẫn với hệ Độc xanh lá |

**Số lớp cùng lúc và hạt (trúng 3 quái, tối đa trong đòn):** Mầm tới 13 lớp / 66 hạt; Thức tỉnh tới **23 lớp / 138 hạt** (nặng nhất: búa Băng nện đất nấc 2
23 lớp; phi tiêu mưa Băng 138 hạt; thương Băng 3 đâm + quét 19 lớp / 108 hạt). Ngưỡng tự đặt cho "quá rối": ≥ 12 lớp hoặc ≥ 90 hạt — **18 / 39 ca Thức tỉnh vượt**.

**Loại thấy được nhiều nhất (cộng mọi ca, điểm ảnh × khung):** hạt rơi trên sàn (giọt độc / mảnh băng / mảnh đá) 1,63 triệu; chớp trúng nặng 1,35 triệu;
vòng sóng 0,56 triệu; chớp trúng 0,43 triệu; mây độc 0,43 triệu; hàng gai băng 0,40 triệu; … **3 lớp giọt hệ cộng 0,49 triệu** — trong khi vệt chính
của kiếm nặng (4 ảnh) chỉ 0,31 triệu. Tức là phần "màu hệ" của đòn chủ yếu đến từ lớp phụ đè lên, không phải từ vệt.

**Lên bậc thì hình đổi gì** (bảng đủ ở `bang-do.md` mục "Lên bậc"):

- **Mầm → Thành hình**: luôn đổi rõ (thêm vũng / vệt cháy / mây độc / gai băng — đây là luật mới mở, hình đúng). Nhưng phần "thêm" chủ yếu là **thêm lớp
  và thêm hạt** (lớp +1…+9, hạt +6…+60), điểm ảnh hiệu ứng tăng 30–500 %.
- **Thành hình → Thức tỉnh**: khi đánh quái không chết, **25 / 39 ca "không đổi gì" hoặc "đổi quá ít"** (cùng bộ ảnh, chỉ thêm hạt: ví dụ kiếm Lửa +13 hạt,
  vệt 0 %). Đặc trưng Thức tỉnh (nổ lan, lây độc, băng vỡ) chỉ hiện khi quái chết / đóng băng (đo riêng ở mục A4).
- **Búa nện thường**: cả 3 hệ, Mầm → Thành hình → Thức tỉnh **không đổi gì** về hình (chỉ thêm hạt).
- **Các mốc Luyện 1–15** (`so/luyen-a.json`, kiếm và búa × 3 hệ × 15 cấp): hình hiệu ứng **chỉ đổi ở cấp 3 (Mầm), 6 (Thành hình), 12 (Thức tỉnh)**.
  Các cấp còn lại (1–2, 4–5, 7–11, 13–15) giống hệt cấp liền trước (chênh vài hạt do chí mạng ngẫu nhiên). Cấp 9 (phần phụ) và 15 (Viên mãn) không đổi hình đòn.
- **Ảnh "gân"** (`zed-vk-gan`, js/vien_vk.js): chỉ là hình VŨ KHÍ trên tay / ô đồ đổi dần theo tiến độ Luyện giữa hai mốc; không có hiệu ứng đòn nào đi kèm.

### A2. Đo tầm: hình vệt so với vùng trúng thật

Bảng từng nhát: `bang-do.md` mục 2. "Tầm trúng" = mép thân quái xa nhất còn mất máu (trên hàng ngang của Cu Tí); "tầm hình" = điểm ảnh vệt xa nhất trong
dải cao của thân quái. Lệch dương = **hình kéo xa hơn vùng trúng → quái đứng trong khoảng đó trông như bị chém mà KHÔNG mất máu**.

| Đòn | Tầm trúng | Tầm hình | Lệch | Ghi chú |
|---|---|---|---|---|
| Kiếm nặng nhát 1 (lê → hất lên) | 30 | 62–68 | **+32…+38** | vệt lê đất còn kéo **ra sau lưng 48–56** điểm, sau lưng không trúng |
| Kiếm nặng nhát 2 (bổ xuống) | 30 | 52–62 | **+22…+32** | |
| Kiếm nặng nhát 3 (chém ngang) | 36 | 48–63 | **+12…+27** | Băng Thức tỉnh: gai băng nối dài tới 99 (gai có trúng thật tới 72) |
| Thương đâm 1–3 | 54–60 | 75–107 | **+21…+47** | Độc lệch nhất (giọt rơi dọc sàn kéo dài vệt) |
| Thương quét vòng | 42 | 75–107 | **+30…+65** | ảnh quét rộng hơn vòng quét 44 |
| Búa nện thường | 30 | 44–64 | **+14…+34** | |
| Búa nện đất nấc 1 / 2 | 108 | 88–116 | −20…+8 | sóng chấn trúng xa hơn hình (trúng mà hình ngắn) |
| Thương xốc tới | 60 | 45–87 | −15…+27 | Lửa / Trắng: hình ngắn hơn chỗ trúng |
| Kiếm lướt chém | 60 | 127–147 | (+67…+87) | *chưa chắc*: Cu Tí lộn qua lưới quái dày nên chỗ dừng khác lúc không quái |

Kết luận: **mọi đòn thường cận chiến đều vẽ xa hơn chỗ trúng 12–47 điểm game** (≈ nửa thân tới hai thân quái). Đây đúng là chỗ "không biết có trúng không":
quái đứng ngoài tầm vẫn bị vệt quẹt qua người. Chiêu Đặc biệt (Trảm Nguyệt, Phi Thương, Địa Chấn, mưa phi tiêu) là vật bay / vùng nên hình đi đúng chỗ
trúng theo thời gian (không tính lệch kiểu này).

### A3. Mỗi hệ gây sát thương / trạng thái thế nào và game báo ra sao (đọc `js/combat.js`, `js/fx.js`, `js/mobs.js`)

| Hệ | Luật (không đổi) | Game báo cho người chơi (trước khi sửa) |
|---|---|---|
| **Độc** | Mỗi lần dính +1 tầng (chưởng +2), **tối đa 5**; 5 giây × độ bền, làm mới mỗi lần dính. Nhịp 0,5 giây trừ máu = sức độc × số tầng × 0,5. Mỗi tầng quái nhận thêm 4 % sát thương, giảm giáp. Đang Băng thì độc trôi chậm một nửa. | Thân quái nhuộm xanh 40 % + ảnh `hu-bam-doc` lặp. **Số tầng không hiện**: chữ số vẽ bằng code (`digit`) bị lớp chặn vẽ code chặn mất. Quái thường **không có biểu tượng trên đầu** (đã bỏ ở Đợt 7). Vòng **tím** khi vừa dính + vòng "nhói" tím-xanh mỗi nhịp. |
| **Lửa** | Cháy 3 giây × độ bền (không cộng dồn, làm mới). Nhịp 0,5 giây trừ 10 % sức đòn gây cháy. | Thân nhuộm cam 30–40 % nhấp nháy + ảnh `hu-bam-lua` (ngọn lửa to phủ gần cả thân Heo Rừng). Không biểu tượng, không thời gian còn lại. |
| **Băng** | Mỗi lần dính +1 tầng (búa / chưởng nhiều hơn), chậm 15 %/tầng (chậm nhất còn 40 % tốc độ), 4 giây. Đủ **5 tầng → đóng băng 1,5 giây** (trùm: choáng 0,5 giây), sau đó miễn đóng băng 5 giây (búa 3 giây). Không trừ máu theo nhịp. | Thân nhuộm xanh nhạt 45 % + `hu-bam-bang`; đóng băng: `hu-dong-bang`. **Số tầng chậm không hiện** (cùng lý do chữ số code bị chặn). |
| **Phản ứng** | Lửa + Độc → **Nổ khói** 1,5 × sức đòn lên quái và quái trong 42 điểm, tiêu độc. Lửa + Băng → **Sốc nhiệt** 2,5 ×, tiêu cháy và băng. Hồi 0,6 giây. Một quái giữ tối đa 2 hệ. | Ảnh `hu-no-khoi` 720 ms / `hu-soc-nhiet` 620 ms + chữ tên đòn. Rõ. |
| **Tỉ lệ gây hệ** | Mầm 20 %, Thành hình 50 %, Thức tỉnh 100 % (búa × 2,2, phi tiêu × 1,4, thương × 1,2; tối đa 100 %). | Không báo: ở Mầm 4/5 nhát trúng **không** gây hệ nhưng hình vệt vẫn y như nhát có gây. |

**Báo trúng hiện tại:**

- **Trúng**: cả thân quái chớp **TRẮNG** 0,07 giây (giống nhau mọi hệ, giống cả lúc không có hệ) + ảnh chớp `hu-trung` trắng-vàng + số sát thương màu
  "sáng của hệ" — Lửa **vàng #ffd23f (trùng màu số chí mạng)**, Băng gần trắng #e9f9ff, Độc xanh nhạt. Không có dấu gì riêng của hệ lúc trúng.
- **Nhịp độc / cháy**: thân nhuộm màu hệ 0,22 giây thay chớp trắng; số nhỏ cỡ 6, mờ 70 %, **chỉ ra khi trên màn còn ≤ 4 số khác** — đánh đám là
  số nhịp bị bỏ, người chơi không thấy độc / lửa đang trừ máu.
- **Trượt**: vệt vẫn y như lúc trúng (và kéo xa hơn tầm, A2) → khó phân biệt trúng / trượt; chỉ khác là không có chớp trên quái.
- **Trùm**: hàng biểu tượng `gd-tt-chay / doc / bang` trên đầu (không có số tầng).

### A4. Tình huống riêng (bảng ở `bang-do.md` mục 3)

- Nổ khói / Sốc nhiệt / đóng băng / băng vỡ / nổ lan / lây độc: mỗi cái có **ảnh riêng rõ ràng** (`hu-no-khoi`, `hu-soc-nhiet`, `hu-dong-bang`, `hu-bang-vo`,
  `hu-no-lua`, `hu-doc-toe`), nhưng luôn đi kèm đủ lớp của nhát kiếm (vệt + giọt hệ + chớp + hạt): **7–11 lớp cùng lúc**.
- Đánh trùm: 4–7 lớp (trùm to, ít quái quanh) — không rối bằng đánh đám; số tầng độc trên đầu trùm không có.

### A5. Ảnh chuỗi khung + GIF (trước khi sửa) — `anh/truoc/`

Kiếm nặng 3 nhát (đòn chính của Cu Tí), mỗi hệ ở bậc thấp nhất (Mầm) và cao nhất (Thức tỉnh): trúng 1 quái, trúng 3 quái, trượt.
Mỗi ca 3 tệp: `…​.gif` (đúng tốc độ, 30 hình/giây), `…-cham-x3.gif` (chậm 3 lần), `…-khung.png` (chuỗi khung, mỗi ô 66 ms).
Tên: `sword-<lua|doc|bang>-<mam|thuc-tinh>-<trung-1|trung-3|truot>`. Ảnh GIF bỏ rung màn để nền đứng yên (rung vẫn có trong game).

Thấy ngay trong ảnh: vệt kiếm Lửa / Độc **xanh trắng như Băng**, màu hệ chỉ ở lớp giọt mảnh và hạt; 3 quái trúng = 3 chớp trắng to chồng lên nhau che
kín thân; Độc có vòng **tím** to quanh quái; trượt thì vệt vẫn quét qua chỗ trước mặt rộng gấp đôi tầm thật.

### A6. Kết luận Phần A → việc làm ở Phần B

1. **Nhanh**: vệt chính chỉ 250–420 ms; lớp phụ (giọt hệ, hạt) ngắn hơn nữa → mắt chỉ kịp thấy một chớp sáng.
2. **Rối**: 9–23 lớp cùng lúc; lớp giọt hệ trùng vệt; chớp trắng mỗi quái một cái; hạt rơi dọc sàn; vòng tím lẫn màu.
3. **Bậc**: lên bậc chủ yếu = thêm hạt, thêm lớp; Thành hình → Thức tỉnh nhiều ca không đổi gì về hình khi đánh.
4. **Màu hệ**: vệt chính của kiếm nặng / thương / búa không mang màu hệ.
5. **Tầm**: vệt đòn thường vẽ xa hơn chỗ trúng 12–47 điểm.
6. **Báo trúng**: chớp trắng giống nhau mọi hệ; số tầng độc / băng không hiện (bị chặn); số nhịp độc / cháy hay bị bỏ; quái thường không có biểu tượng trạng thái.

---

## PHẦN B — SỬA

*(đang làm — xem commit sau)*
