# Bản đồ ải từ vùng 5 (BAN-DO.md)

Lập 16/10/2026, trả lời câu chủ game hỏi lúc 07:19: *"Từ màn 5 đi map có thay đổi chút không để người chơi trải nghiệm?"*
**Chỉ là kế hoạch**, chưa sửa code game. Đọc cùng: `VUNG.md` (mục 1.4 / 2.4 / 3.4 / 4.4), `TONG-HOP.md` (lộ trình), `QUYET-DINH.md`, `../LUAT-CAN-BANG.md`, code `game/js/mapgen.js`.

**Trả lời ngắn: có.** Mỗi vùng 5–8 có **một kiểu bản đồ riêng** hợp chủ đề vùng (leo núi, hang tối, đảo mây, đền tròn).
Giữ nguyên những thứ đã cân bằng: số phòng có quái mỗi lượt (4 phòng + Trùm), cỡ một phòng, cách đánh trong phòng, Suối hồi đứng ngay trước Trùm.
Cái thay đổi là **đường đi giữa các phòng** và vài **phòng nhỏ tuỳ chọn** (phòng ẩn, phòng đố) — thêm chuyện để khám phá, không thêm chỗ cày.

Khi tệp này được chủ game duyệt, câu "Giữ bản đồ 8 phòng của `mapgen.js`" ở VUNG.md mục 1.4 / 2.4 / 3.4 / 4.4 đổi thành "theo BAN-DO.md".

---

## 1. Bản đồ bây giờ thế nào

- Mỗi ải là **8 phòng vuông** trên lưới nhỏ (tối đa 5 ô ngang × 4 ô dọc), sinh ngẫu nhiên theo hạt giống. Số phòng cố định: 0 = Bắt đầu, 6 = Suối hồi, 7 = Trùm.
- Bộ phòng **luôn giống nhau**: Bắt đầu (có quái) + 2 phòng Quái + 1 Tinh anh + 1 Rương + 1 phòng Phụ (Thương nhân / Thử thách / Lời nguyền) + Suối hồi + Trùm.
- Có **3 kiểu xếp**: **A** đường chính ngoằn ngoèo + 2 phòng phụ; **B** mê cung 3×3 có đường vòng, cửa Trùm mở khi dọn đủ 3 phòng quái; **C** sảnh giữa, 3 cánh giữ 3 mảnh chìa (ải cuối vùng luôn là C).
- Mọi vùng 1–4 dùng chung 3 kiểu này. Bản đồ nhỏ góc phải chỉ hiện phòng đã qua và phòng kề.
- Số đo cũ (`docs/review/AUDIT-VONG-LAP.md` 3.4, bot): phòng Quái ~20 giây, Tinh anh ~23, Bắt đầu ~10, Rương/Suối/Phụ 1–4, Trùm ~66; **một ải 2,5–6,5 phút**; ~70% số lượt là chơi lại ải cũ → người chơi gặp 3 kiểu này **rất nhiều lần**. Đó là lý do nên đổi từ vùng 5.

Ví dụ Kiểu A hôm nay:

```
 [Rương]                         
    │                            
 [Bắt đầu]──[Quái 1]──[Quái 2]   
                         │       
             [Phụ]──[Tinh anh]   
                         │       
           [TRÙM]──[Suối hồi]    
```

---

## 2. Mỗi vùng một kiểu bản đồ

Ký hiệu trong sơ đồ: `──` `│` cửa thường (đi hai chiều) · `═` `║` cầu gió **một chiều** (đi theo mũi tên) · `┆` dây thang (mở khi đứng ở trên) · `🔒` cửa có điều kiện · `▒` vách nứt (phòng ẩn).
Sơ đồ là **một ví dụ**; máy sẽ xoay, lật, đổi chỗ phòng phụ theo hạt giống để mỗi lượt khác nhau một chút.

### 2.1 Vùng 5 Núi Sét — Kiểu **S "Leo núi"** (8 phòng, như cũ)

Ý: đi **từ chân núi lên đỉnh**, mỗi hàng là một tầng ruộng bậc thang. Đỉnh núi (Trùm) **luôn thấy trên bản đồ nhỏ** ngay từ đầu → bé biết mình đang leo đi đâu.

```
 Tầng 4 (đỉnh)                  [TRÙM]
                                   │
 Tầng 3            [Tinh anh]──[Suối hồi]
                       │           ┆  dây thang: thả xuống khi bé tới Suối hồi
 Tầng 2  [Hang bão]──[Quái 2]──[Phụ]
          (Rương)      │
 Tầng 1  [Bắt đầu]──[Quái 1]
```

- **Lên tầng** qua cửa bậc đá (ảnh cửa riêng, có mũi tên lên). Đi ngang trong một tầng như bình thường.
- **Hang tránh bão** = phòng Rương nằm trong hang đá có mái: **không có sét trời** trong phòng này (chỗ thở). Không hồi máu (để Suối hồi vẫn là chỗ hồi duy nhất).
- **Lối tắt dây thang**: từ Suối hồi nhìn xuống thấy phòng Phụ ngay dưới; lúc tới Suối hồi thì dây thang tự thả → bé quên phòng Phụ có thể **xuống 1 bước rồi lên lại**, thay vì vòng 3 phòng. Từ dưới nhìn lên dây còn cuộn (biểu tượng khoá dây) → bé hiểu "lên trên rồi mới mở".
- Thử thách tuỳ chọn (phòng Phụ loại Thử thách) bản vùng 5: **"Trụ giữa cơn giông 30 giây"** — dùng đúng đồng hồ và phần thưởng của phòng Thử thách hiện có.
- Ải 5-5: tầng 4 là **sân Thần Sét trên đỉnh** (VUNG 1.4), Suối hồi là miếu Thần Sét ngay dưới.

### 2.2 Vùng 6 Rừng đá vôi — Kiểu **H "Hang tối"** (8 phòng + 1 phòng ẩn)

Ý: mê cung nhỏ 3×3 (dựa trên Kiểu B đã chạy tốt) nhưng **bản đồ chưa lộ**: phòng kề chỉ hiện trên bản đồ nhỏ khi bé **thắp ít nhất 1 đuốc** trong phòng đang đứng (đuốc là luật vùng 6 sẵn có). Phòng chưa lộ hiện dấu **?** mờ đúng chỗ cửa — bé luôn biết "bên kia cửa còn phòng".

```
 [Quái 1]──[Rương]      [TRÙM]
    │         │            ║🔒 mở khi dọn đủ 3 phòng quái (như Kiểu B)
 [Bắt đầu]  [Phụ]──────[Suối hồi]
    │         │
 [Quái 2]──[Tinh anh] ▒ [Phòng ẩn]
```

- **Phòng ẩn** nằm đúng **ô trống** mà Kiểu B vẫn bỏ đi (nên lưới không to hơn). Cửa vào là **vách nứt**: có gió lùa, đom đóm bay ra, tiếng rì rào — đánh 1 nhát bất kỳ là vỡ. Bên trong: **Kho của Bác Tiều** (rìu cũ, nồi, đèn) + 1 **mảnh tranh khắc đá** (đồ sưu tầm, mục 3.3). Không có quái.
- **Không bao giờ lạc** (luật cứng cho Kiểu H):
  - Cửa bé vừa đi vào **luôn có đuốc cháy sẵn** (VUNG 2.4) → nhìn ánh đuốc là biết đường lui.
  - **Sợi chỉ đỏ của Bác Tiều**: trên bản đồ nhỏ luôn vẽ một nét đỏ từ phòng đang đứng về Bắt đầu và (nếu đã thấy) về Suối hồi.
  - Suối hồi và Trùm **hiện mờ trên bản đồ từ đầu** ("nghe tiếng gầm vọng ra") — chỉ giấu đường đi, không giấu đích.
  - Tuỳ chọn "Hang sáng hơn" (VUNG Q7) bật thì **mọi phòng kề hiện luôn** như vùng 1–4.
- Thử thách vùng 6: **"Thắp hết đuốc trước khi đèn lồng tắt"**.

### 2.3 Vùng 7 Đỉnh mây — Kiểu **M "Đảo mây"** (10 phòng, mỗi lượt đi ~8)

Ý: các đảo mây nối bằng cầu treo. Giữa ải có **ngã ba gió**: gió thổi một chiều nên **chọn một đảo, qua rồi không quay lại**. Hai đảo **thấy trước** trên bản đồ (kèm biểu tượng cái gì ở đó) → chọn có hiểu biết, không phải đoán mò.

```
             Đảo Giông (khó)
            [Tinh anh]═►[Rương]
                ▲          ║
 [Phụ]          ║          ▼
   │                                          
 [Bắt đầu]──[Quái 1]     [Quái 3]──[Suối hồi]──[TRÙM]
                ║          ▲
                ▼          ║
            [Quái 2]══►[Rương]
             Đảo Nắng (dễ)
```

- **Đảo Giông**: Tinh anh + Rương (có thêm 1 lông vũ = mảnh tranh lần đầu). **Đảo Nắng**: 1 phòng Quái thường + Rương. Cả hai đường đều đi qua **4 phòng có quái** rồi mới tới Trùm (Bắt đầu, Quái 1, Tinh anh *hoặc* Quái 2, Quái 3) — bằng Kiểu A bây giờ.
- Thưởng "rủi ro" của Đảo Giông **chỉ là thứ đã có**: rơi đồ và dấu ấn của Tinh anh. Không thêm rương xịn hơn → không tạo đường cày (mục 3.2).
- Ở Quái 1 có **biển báo bằng hình** (không chữ dài): mũi tên gió + hình đảo + hình Tinh anh / hình Quái. Lần đầu gặp có 1 câu mẹo: *"Gió chỉ thổi một chiều — chọn đảo rồi đi tiếp nhé!"*
- Sau cầu một chiều **không có ngõ cụt**: phòng nào qua cầu gió tới cũng còn đường tới Trùm (máy kiểm, mục 4.1).
- Thử thách vùng 7: **"Hạ hết quái bay trước khi gió đổi chiều"**.

### 2.4 Vùng 8 Đền trống đồng — Kiểu **V "Đền vòng"** (9 phòng)

Ý: đền hình tròn như mặt trống. **Trùm ở chính giữa**, luôn thấy trên bản đồ. Bé đi **vòng quanh đền** (rẽ trái hay phải đều được), gõ đủ **3 mặt trống** (dọn 3 phòng quái) thì **cửa giữa** từ Suối hồi vào Trùm mở — mỗi tiếng trống làm sáng 1 đèn trên cửa.

```
 [Tinh anh]──[Suối hồi]──[Rương]
     │           ║🔒          │
 [Quái 1]     [TRÙM]       [Quái 2]
     │                       │
   [Phụ]────[Bắt đầu]────[Đố nhịp]
```

- Đi một vòng là gặp hết; muốn đủ 3 trống thì đi qua Suối hồi sang bên kia **1–2 phòng** rồi quay lại (đi lại phòng đã dọn chỉ vài giây).
- Mỗi phòng trong vòng mang **luật ôn của ải đó** (VUNG 4.3: 8-1 dòng chảy, 8-2 sét, 8-3 tối, 8-4 gió) — đi vòng đền = đi lại hành trình.
- **Phòng Đố nhịp** (tuỳ chọn, không quái, ≤ 15 giây): 4 mặt trống nhỏ sáng theo thứ tự 3 nhịp, bé gõ lại đúng thứ tự. Sai thì sáng lại từ đầu, **không mất máu, không hết giờ**. Đi ngang qua bỏ không đố cũng được (cửa không khoá). Đố đúng lần đầu ở mỗi ải: 1 mảnh tranh.
- Thử thách vùng 8: **"Hạ quái đúng nhịp trống"** (đòn trúng đúng nhịp tính đôi vào thanh thử thách).

### 2.5 Luật chung cho trẻ con (cả 4 kiểu)

1. **Đích luôn thấy**: Trùm (hoặc hướng tới Trùm) hiện trên bản đồ nhỏ từ phòng đầu tiên ở cả 4 kiểu.
2. **Không có ngõ cụt sau cửa một chiều**, không có hết giờ vì lạc, không mất máu vì đi sai đường.
3. Cửa có điều kiện luôn **vẽ điều kiện bằng hình** (3 đèn trống, 3 chìa…) và đếm số đã có.
4. Mỗi thứ mới chỉ **1 câu mẹo + 1 mũi tên** lần đầu gặp; câu mẹo ngắn, có cả tiếng Anh (`ngon_ngu_en.js`).
5. **Một thứ mới mỗi lúc**: ải x-1 của vùng dùng kiểu cũ (A/B/C) để bé học luật vùng trước; bản đồ mới từ ải x-2 (Câu hỏi 1).
6. Bấm bản đồ nhỏ → bản đồ to như bây giờ, thêm chú giải các ký hiệu mới.

---

## 3. Ràng buộc

### 3.1 Số phòng và thời gian một ải (giữ cân bằng)

Mục tiêu: **mỗi đường đi tới Trùm vẫn qua đúng 4 phòng có quái** (như Kiểu A) và **thời gian một ải trong khoảng ±10% Kiểu A**. Ước tính bằng số đo phòng của bot (giây trong game, mục 1):

| Kiểu | Tổng phòng | Phòng thường đi qua | Phòng có quái mỗi đường | Thời gian ước tính | So với A (~164 s) |
|---|---|---|---|---|---|
| A / B / C (cũ) | 8 | 6–8 | 4 | ~164 s | — |
| **S** Leo núi | 8 | 6–8 | 4 | ~160 s (dây thang bớt đi lại) | −2% |
| **H** Hang tối | 8 + 1 ẩn | 7–9 | 4 | ~170–178 s (tìm vách nứt ~8 s, đi tối chậm hơn chút) | +4…+8% |
| **M** Đảo mây | 10 | 7–8 | 4 | ~160–163 s (Đảo Nắng nhanh hơn ~3 s) | −2…0% |
| **V** Đền vòng | 9 | 8–9 | 4 | ~168–183 s (đi lại 1–2 phòng; Đố nhịp tuỳ chọn ≤ 15 s) | +2…+11% |

Nếu bot đo thấy kiểu nào vượt **+10%** thì bớt: H — vách nứt đặt ở phòng trên đường chính; V — đặt 2 trong 3 trống cùng một phía vòng.

### 3.2 Phần thưởng tuỳ chọn có trần (theo LUAT-CAN-BANG)

| Thứ mới | Thưởng mỗi lượt | Thưởng một lần | Vì sao không thành chỗ cày |
|---|---|---|---|
| Lối tắt dây thang (5) | 0 | 0 | Chỉ bớt đi lại |
| Hang tránh bão (5) | Rương thường như cũ | 0 | Là phòng Rương sẵn có, chỉ đổi cảnh |
| Phòng ẩn (6) | 0 tài nguyên | 1 mảnh tranh / ải (5 / vùng) | Lần sau vào phòng ẩn chỉ còn dấu "đã tìm" |
| Đảo Giông / Đảo Nắng (7) | Như phòng Tinh anh / Quái hiện có | 1 lông vũ (mảnh tranh) / ải | Không thêm rương xịn; Đảo Giông chỉ có thứ Tinh anh vốn cho |
| Đố nhịp (8) | 0 | 1 mảnh tranh / ải | Đố lại không được gì |
| Thử thách bản vùng (5–8) | **Bằng phòng Thử thách hiện có** | 0 | Chỉ đổi mục tiêu, không đổi thưởng |
| Bộ tranh (đủ 5 mảnh một vùng) | — | Tranh treo ở làng + 1 dòng Thành tựu (thưởng theo luật Thành tựu hiện có) | Một lần, có trần: 4 vùng × 1 |

- **Vàng / quặng / đá / linh khí / Sức mạnh thêm mỗi lượt: 0**. Một lần cả 4 vùng: chỉ phần Thành tựu (4 dòng) — nếu chủ game chọn thêm vàng thì **trừ đúng số đó** ở thưởng lần đầu qua ải x-5 (Câu hỏi 3).
- Luật soát: **vàng mỗi phút chơi không được tăng** so với Kiểu A (bot đo `kiem-can-bang/do_b.py kinhte` trước/sau).
- Đảo Nắng không có Tinh anh → mỗi lượt đi Đảo Nắng rơi ít hơn chút; bot đo cả hai kiểu chọn, chênh kinh tế ≤ 5%.

### 3.3 Bot `cay.py` vẫn chạy được

- Bot chọn phòng bằng `G.botNextDoor` (`tests/bot.js`) → `M.path` với luật cửa. Chỉ cần **gom mọi luật cửa vào một hàm `M.pass`** (mục 4.1) thì bot tự hiểu cầu một chiều, dây thang, vách nứt; `cay.py` không đổi cách chạy.
- Thêm vài nút cấu hình bot: `G.botCfg.dao = 'kho' | 'de' | 'ngau'` (chọn đảo), `timAn` (tỉ lệ tìm phòng ẩn, mặc định 0,5), `doNhip` (có đố hay không). Phiên cân bằng mỗi vùng chạy đủ các kiểu.
- Cờ quay lui **`?bando=0`**: vùng 5–8 dùng lại A/B/C như cũ — để đo trước/sau đúng luật.
- Chạy được cả chế độ `--node` (mapgen không đụng trình duyệt).

### 3.4 Bản lưu / lưu mây

- **Lưu giữa ải** (`luu_luot.js`) đã ghi `kind + seed + cleared + seen + known` và dựng lại bản đồ từ hạt giống → kiểu mới chỉ cần **sinh ra giống hệt từ cùng hạt** (luật sẵn có của `M.make`). Thêm 2 ô: `mo` (dây thang / vách nứt đã mở) và `duoc` (phòng đã thắp đuốc, cho Kiểu H). Bản ghi cũ thiếu 2 ô này vẫn nạp được (coi như rỗng).
- **Bản lưu chính** thêm một ô nhỏ `save.bd = { tranh: { 4: [0,0,0,0,0], 5: …, 6: …, 7: … } }` (mảnh tranh đã có). `G.fixSave` điền mặc định; `cloud.js` gộp kiểu **"có ở đâu thì giữ"** (OR từng ô) → không bao giờ mất mảnh khi đồng bộ hai máy.
- `save.lastKind` nhận thêm `S/H/M/V`; tắt `?bando=0` thì `pickKind` lọc bỏ, không lỗi.

### 3.5 Điện thoại cầm ngang

- Lưới mọi kiểu **vẫn vừa 5 × 4 ô** (S 3×4, H 3×3, M 5×3, V 3×3) → bản đồ nhỏ góc phải không to thêm, không che nút.
- **Cỡ phòng không đổi** (`G.roomArt.geo`), cửa vẫn ở 4 phía → điều khiển, chỗ đứng nút, tầm nhìn như cũ.
- Biển báo, khoá, đèn trống **bằng hình**, không chữ nhỏ. Vách nứt to, dễ thấy cả trên màn 5 inch.

---

## 4. Ảnh hưởng code, ảnh cần, lộ trình

### 4.1 Code (khi làm, chưa làm bây giờ)

| Tệp | Việc |
|---|---|
| `game/js/mapgen.js` | Thêm `genS`, `genH`, `genM`, `genV`. Giữ quy ước 0 = Bắt đầu, 6 = Suối hồi, 7 = Trùm; phòng thêm đánh số 8, 9. Thêm danh sách **luật cửa** trên bản đồ: `map.luat = [{a, b, loai: 'motchieu' / 'thang' / 'vachnut'}]`. Hàm mới **`M.pass(map, a, b, st)`** (st = cleared, mo) gom luật cửa có điều kiện + luật mới; `M.walk`, `M.path` dùng nó. `M.pickKind(i, last, rnd, r)` nhận thêm vùng: vùng 5–8 trả kiểu riêng (theo Câu hỏi 1–2). `M.check` chia theo kiểu: số phòng 8–10, **mọi đường tới Trùm ≥ 4 phòng có quái**, không ngõ cụt sau cầu một chiều, Trùm chỉ một cửa thông Suối hồi, lưới ≤ 5×4. `M.sig` thêm luật cửa. |
| `game/js/stage.js` | `startStage` gọi `pickKind` có vùng. `W.doors` dùng `M.pass` (cửa ngược gió hiện "gió chặn", dây thang cuộn, vách nứt là vật đánh được). `buildRoom` thêm loại phòng `an` (phòng ẩn) và `do` (đố nhịp). Kiểu H: `known` chỉ thêm khi thắp đuốc (móc vào luật đuốc vùng 6). |
| `game/js/minimap.js` | Vẽ mũi tên cầu một chiều, nét đứt + khoá dây thang, dấu `?`, vách nứt sau khi tìm, sợi chỉ đỏ (Kiểu H), Trùm hiện sẵn, chú giải mới ở bản đồ to. |
| `game/js/luu_luot.js` | Ghi / nạp `mo`, `duoc`. |
| `engine.js` (`fixSave`), `cloud.js` | `save.bd.tranh` + gộp OR. |
| Làng / Hành trang | Ô "Bộ tranh" (4 tranh, mảnh đã có / chưa) — nhỏ, đặt cạnh Sổ yêu quái. |
| `tests/bot.js` | `botNextDoor` dùng `M.pass`; `botCfg.dao / timAn / doNhip`; bot đánh vỡ vách nứt khi `timAn`. |
| `tests/au_mapgen.py`, `tests/mapgen.py`, `tests/doors.py` | Chạy thêm 4 kiểu × 3.000 hạt: không lỗi `M.check`, đếm thời gian đi thử, đếm đường đi qua 4 phòng quái. |

### 4.2 Ảnh cần gen (chỉ liệt kê, prompt viết sau theo khuôn pixel vùng 4)

| Vùng | Ảnh | Số tấm (ước) |
|---|---|---|
| Chung | Biểu tượng bản đồ nhỏ: cầu một chiều, dây thang (cuộn / thả), dấu `?`, vách nứt, phòng ẩn, đố nhịp, hang bão, mảnh tranh | 9 |
| Chung | Khung "Bộ tranh" + 4 tranh (máy tự cắt mỗi tranh thành 5 mảnh) | 5 |
| 5 | Cửa bậc đá lên / xuống tầng (2), dây thang cuộn + thả (2), nền Hang tránh bão (1) | 5 |
| 6 | Vách nứt nguyên + vỡ (2) + mảnh vỡ hiệu ứng (1), nền Kho Bác Tiều (1), sợi chỉ đỏ (1) | 5 |
| 7 | Cầu gió một chiều + cầu dây thường (2), biển báo hai đảo (1), mũi tên gió ở cửa (1) | 4 |
| 8 | Cửa trống giữa đóng / mở + 3 đèn (3), nền phòng Đố nhịp (1), mặt trống nhỏ tắt / sáng (2) | 6 |
| **Tổng** | | **~34 tấm, ~0,3–0,4 MB** (dưới trần ~3,5 MB/vùng) |

### 4.3 Chèn vào lộ trình TONG-HOP.md (mục 3)

| Đợt | Việc thêm (ghép vào phiên ghi trong ngoặc) | Ảnh |
|---|---|---|
| **0 · Khung** | (Phiên A) Gom luật cửa vào `M.pass`, `M.check` theo kiểu, bot dùng `M.pass`, cờ `?bando=0`, ô `save.bd` + gộp mây. **Bản đồ cũ không đổi**: bot đo trước/sau phải y hệt. | Claude viết prompt ảnh "Chung" + vùng 5 |
| **4** | (Phiên A, khung vùng 5) Kiểu **S** bằng hình tạm + dây thang + bản đồ nhỏ theo tầng | Chung (9 + 5), vùng 5 (5) |
| **8** | (Phiên B, cân bằng vùng 5) đo S so với A/B/C | Prompt vùng 6 |
| **9** | (Phiên A, khung vùng 6) Kiểu **H** + sương bản đồ theo đuốc + sợi chỉ đỏ; (Phiên B) phòng ẩn | Vùng 6 (5) |
| **11** | (Phiên C) ô Bộ tranh ở làng | — |
| **12** | (Phiên C, cân bằng vùng 6) đo H, `timAn` 0 / 0,5 / 1 | Prompt vùng 7 |
| **13** | (Phiên A, khung vùng 7) Kiểu **M** + cầu gió một chiều + biển báo | Vùng 7 (4) |
| **16** | (Phiên A, cân bằng vùng 7) đo M với `dao = kho / de / ngau` | Prompt vùng 8 |
| **17** | (Phiên A, khung vùng 8) Kiểu **V** + cửa trống giữa | Vùng 8 (6) |
| **18** | (Phiên B) phòng Đố nhịp (dùng nhịp trống 1,2 s của vùng 8) | — |
| **20** | Cân bằng 40 ải gồm cả 4 kiểu mới | — |

Mỗi đợt thêm khoảng **nửa phiên** việc; không cần đợt mới.

---

## 5. Câu hỏi cho chủ game (★ = đề xuất)

1. **Ải nào trong vùng dùng bản đồ mới?**
   A. ★ Ải x-1 dùng kiểu cũ (học luật vùng trước), **x-2 → x-4 dùng kiểu vùng** · B. Cả 5 ải đều kiểu vùng · C. Từ x-2 trộn ngẫu nhiên: 70% kiểu vùng, 30% kiểu cũ (đỡ quen tay khi chơi lại nhiều).
2. **Ải trùm vùng (x-5)** — bây giờ luôn là Kiểu C:
   A. ★ Dùng kiểu vùng (đỉnh núi / hang Chằn Tinh / tổ Đại Bàng / điện trống giữa đền) · B. Giữ Kiểu C cho mọi trùm vùng.
3. **Thưởng phòng ẩn, Đố nhịp, Bộ tranh**
   A. ★ Chỉ trang trí + Thành tựu (0 tài nguyên mới mỗi lượt) · B. Thêm một lần nhỏ khi đủ bộ (≈300 vàng/vùng), **trừ** đúng số đó ở thưởng lần đầu qua x-5 · C. Bỏ phòng ẩn và Bộ tranh, chỉ đổi đường đi.
4. **Ngã ba gió vùng 7**
   A. ★ Một chiều, thấy trước hai đảo, có biển báo hình · B. Hai chiều (đi được cả hai đảo, dài hơn ~12%, mất cái hay của việc chọn) · C. Bỏ ngã ba, chỉ giữ cầu treo nối đảo.
5. **Có mang vài nét này về vùng 1–4 không?**
   A. ★ Không — vùng 1–4 đã cân bằng xong, giữ nguyên · B. Chỉ phòng ẩn (trang trí, 0 tài nguyên) ở vùng 1–4 để chơi lại có thứ tìm · C. Có, đổi cả bản đồ vùng 1–4 (phải đo lại 20 ải cũ).
