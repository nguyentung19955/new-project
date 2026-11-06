# ĐỀ XUẤT CƠ CHẾ MỚI — làm ghép có "chiều sâu vị trí" (06/11/2026)

> Việc này CHỈ là đề xuất thiết kế. **Chưa sửa code gameplay.** Bạn chọn trước, session sau mới làm.
> Tuân `thap/QUY-TAC-HINH.md` (quy tắc 7: gọn như DCDW; MỘT vòng quanh ụ). Hình mới chỉ là prompt gen, không vẽ bằng code.

**Mục tiêu (lời bạn):** nghĩ theo kiểu cơ chế DCDW — ghép cái gì với cái gì, ở ô nào; combo lớn dần — thay cho "+% chỉ số" phẳng. Được phép sửa tướng hiện có.

---

## 0. Tóm tắt 1 phút

- Đề xuất **16 lần làm lại** tướng cũ + **5 ý tướng mới hoàn toàn**. Xếp hạng ở §4.
- Ba thứ nên làm trước: **Lửa Thập Tự** (Ember Relay làm lại), **Pháo La Bàn** (Cannon thành ụ HƯỚNG + SỐ), **Drone Kéo Xa** (Drone Bay tính quãng kéo).
- Mọi đề xuất đều giữ **1 luật ghép** (cùng loại + cùng sao như cũ). Chỗ nào "giữ loại khi ghép" thì dùng đúng cơ chế đã có của Vua Ghép (`ghepDB.cungLoai`). Không thêm vòng; chỉ thêm 1 huy hiệu nhỏ ở góc ô cho vài ụ thật cần.
- Danh sách **"Cần bạn quyết"** ở §6.

---

## 1. Nghiên cứu DCDW (Destiny Child: Defense War) — tìm được gì, KHÔNG tìm được gì

Game: **데스티니 차일드: 디펜스 워**. Ra 24/11/2020, ngừng phục vụ 25/07/2024. Bàn 5×3, ghép 2 Child cùng sao → +1★ ra Child **ngẫu nhiên** trong bộ (giống luật ghép hiện tại của mình).
namu.wiki, fandom và DC Inside vẫn **chặn tải tự động** lần này (giống các session trước). Vì vậy nguồn chính là báo Hàn, blog hướng dẫn và các bản tóm tắt cũ trong repo (`docs/demo-hop-tuong/DCDW-WIKI.md`, `tuvan/conghuong2/DCDW-COMBO.md`, `tuvan/tuong_vang/DCDW-LEGEND.md`).

### 1a. Hai ví dụ bạn nhớ

| Bạn nhớ | Tìm được | Độ tin |
|---|---|---|
| "Katarina": lửa cả HÀNG, cộng lửa cho mọi Katarina con trên hàng/cột | Đúng tên là **카라라트리 Kalaratri** (ra 04/02/2022). Câu gốc: *"보유한 불꽃의 숫자만큼 대미지와 치명타 확률이 증가하며, 전투 시 합체하면 **십자 방향**에 있는 동일 차일드에게 불꽃을 지급하고, 공속 버프가 주어진다."* Nghĩa: sát thương + chí mạng tăng theo số lửa đang giữ; ghép thì trao lửa cho Kalaratri **theo hướng chữ thập** + buff tốc đánh. "Hướng chữ thập" có thể hiểu là **cả hàng + cả cột** (đúng như bạn nhớ), không chỉ 4 ô sát. Bản mình đang làm chỉ cho 4 ô sát, tối đa 5 lửa. — [MuMu KR](https://www.mumuplayer.com/kr/blog/destiny-child-new-character.html) | Câu kỹ năng: **chắc**. Không có con số. |
| Ụ có MŨI TÊN + SỐ (cùng hướng cộng, ngược hướng trừ, vuông góc giữ nguyên) | **Không tìm thấy** trong mọi nguồn đọc được (báo, blog, tiprelay, DC Inside tóm tắt, LDPlayer, MrGuider). Có thể là tướng cuối đời game không có bài báo, hoặc nhớ lẫn sang game khác. | **chưa xác minh** → mình thiết kế theo đúng luật bạn tả (§3-A) |

### 1b. Cơ chế DCDW đáng học (chọn lọc)

| # | Child | Cơ chế | Loại cơ chế | Nguồn |
|---|---|---|---|---|
| 1 | Kalaratri 카라라트리 | lửa cộng dồn; ghép → trao lửa theo chữ thập | trao cộng dồn theo vị trí | MuMu KR (trên) |
| 2 | 제거티 Removal Tee | đủ HÀNG = +sát thương, đủ CỘT = +tốc | bingo hàng/cột | [tiprelay](https://tiprelay.com/%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88-%EC%B0%A8%EC%9D%BC%EB%93%9C-%EB%94%94%ED%8E%9C%EC%8A%A4%EC%9B%8C-%EB%8D%B1-%EC%B6%94%EC%B2%9C-%EC%A1%B0%ED%95%A9-%EC%A0%95%EB%A6%AC/) |
| 3 | Won | mạnh theo số Child cùng loại nối liền | nhóm liền kề | DCDW-WIKI (namu 04/11) |
| 4 | 코스밈 Cosmem | mạnh theo số Child CÙNG SAO trên bàn (trần 15) | đếm toàn bàn | gameinn 1897, DC#2161 |
| 5 | 다비 Darby | tổng ★ trên bàn, mỗi bội 10 → nhanh hơn | đếm toàn bàn | DCDW-WIKI, tiprelay |
| 6 | 아우로라 Aurora (vàng) | mỗi lần ghép → sát thương cộng dồn | cộng dồn theo ghép | [inven 261166](https://www.inven.co.kr/webzine/news/?news=261166) |
| 7 | 루살카 Rusalka | ghép → nhận GIỌT NƯỚC = số sao; đánh quái chậm mạnh hơn | cộng dồn theo ghép | [khgames 135069](https://www.khgames.co.kr/news/articleView.html?idxno=135069) |
| 8 | 뤼팽 Lupin | đổi màu Đỏ→Vàng→Xanh; ghép 2 cùng MÀU → combo | trạng thái quay vòng, ghép đúng lúc | [xportsnews 1678181](https://www.xportsnews.com/article/1678181) |
| 9 | 구미호 Gumiho | ghép với BẤT KỲ Child (không cần cùng sao); giữ "quả cầu" khi ghép | ghép lệch sao, giữ đồ qua ghép | BlueStacks tin vắn |
| 10 | 세멜레 Semele | dùng sao để đổi chỗ 1 Child với chính nó | đổi chỗ có giá | BlueStacks tin vắn |
| 11 | 마프데트 Mafdet | ghép → MỌI Mafdet trên bàn thức tỉnh | kích hoạt toàn bàn | inven 251472 |
| 12 | 워울프 Werewolf | 30% ra bản thức tỉnh | cược khi gọi | DC#16750, tiprelay |
| 13 | 모아 Moa / Daron | sau thời gian biến thành Child ngẫu nhiên (+★) | biến hình có hẹn giờ | [MrGuider](https://www.mrguider.org/articles/destiny-child-defense-war-tier-list-best-deck-guide-tips-strategies/) |
| 14 | 샤마시 Shamash | chép Child cùng sao (giữ cả dạng thức tỉnh + buff) | sao chép | DC#16750, DC#19527 |
| 15 | 베리트 Berit / 상아 Chang'e | ghép → gọi thêm Child | ghép sinh thêm | MrGuider, LDPlayer |
| 16 | 이미르 Ymir | +400% vào quái bị chậm | combo hai ụ | [gameinsight 21782](https://www.gameinsight.co.kr/news/articleView.html?idxno=21782) |
| 17 | 멀린 Merlin | dời Child trên bàn (để xếp bingo) | sửa vị trí | DC#19693 |
| 18 | Trùm Janus Cube / Octopus Eyes | hoá đá (đá ghép với đá) / đốt 3 Child, hết lửa giảm sao | trùm phá vị trí | DCDW-WIKI |

**Bài học chung:** DCDW thú vị nhất ở chỗ (1) **vị trí trên bàn có nghĩa** (hàng, cột, chữ thập, liền kề), (2) **con số/trạng thái đi theo qua lần ghép** (lửa, giọt nước, màu), (3) **ghép vào ĐÂU** (ụ đích) quan trọng ngang **ghép CÁI GÌ**.
Bên mình đã có (2) ở vài tướng mới (Combo, Fusion Archive, Leviathan). Nhưng (1) và (3) còn yếu: phần lớn hỗ trợ chỉ "+x% cho 4 ô kề", và đa số ụ tấn công chỉ "+% theo sao".

Không mở được: namu.wiki (`데스티니 차일드: 디펜스 워`, `/카드`, bản en.namu), gachagames.fandom, YouTube hướng dẫn chính thức.

---

## 2. Đọc 93 ụ trong code — ụ nào phẳng / trùng / bị kẹp trần

Đọc từ `meta.js` (ROSTER_EMBED), `skills*.js`, `vangmoi1.js`, `hotro.js`, `data.js`. **Báo cáo giới hạn** (`docs/demo-hop-tuong/tuvan/gioi-han/BAO-CAO.md`) lên nhánh đúng lúc commit (xem §5) → phần "trần" dưới đây là mình tự đọc code (`HOTRO.CAP`: tốc 45%, sát thương 35%, chí mạng 20%… × hệ số bậc).

| Nhóm | Ụ | Vấn đề |
|---|---|---|
| Bắn phẳng | `canon` Cannon, `sungluc` Revolver, `phun` Scatter, `lien` Gatling, `nam` Iron Fist | chỉ "sao tăng chỉ số"; không có quyết định ghép/vị trí |
| Đếm/nhịp đơn lẻ | `no5` Fifth Shot, `set` Tesla, `laser` | nhịp riêng từng ụ, không tương tác bàn |
| Hỗ trợ 4 ô kề giống nhau | `radar`, `chimang`, `tron`, `khuech`, `lanhgia`, `thaukinh`, `taylo` | 7 ụ cùng một hình "chữ thập 1 ô", lại bị trần chung 45%/35% → chồng nhiều vô ích |
| Đếm toàn bàn trùng nhau | `lienket` Chain Link, `hopca` Quantum Choir, `dongbo` Sync, `ngoisao` Star Cannon | 3 ụ cùng ý "đếm cùng sao / cùng loại" |
| Cộng dồn theo ghép trùng | `combo`, `luutru` Fusion Archive, `cuuvi` | hai ụ gần như giống hệt (+% vĩnh viễn mỗi lần ghép) |
| Biến hình trùng | `hopbi` Mystery Box, `tienhoa` Evolver, `pandora` | ba ụ "đợi rồi ra ngẫu nhiên" |
| Khống chế PVP trùng | `kepha`, `xaotron`, `nhieusong`, `nguyenrua` | bốn ụ "khi ghép phá đối thủ"; ở SOLO gần như vô dụng |
| Kinh tế phẳng | `mana`, `nhanmana`, `hutmana`, `santhuong` | chỉ "+mana", không có lựa chọn |
| Đã đúng hướng, chỉ quá hẹp | `lualien` Ember Relay | 4 ô sát, tối đa 5 lửa, lửa mất khi ghép |

---

## 3. Đề xuất làm lại (16 ụ)

Ký hiệu bàn 5 cột × 3 hàng: `[ ]` ô trống, chữ = ụ. Mũi tên `↑↓←→`, số = con số trên huy hiệu.
"Cấp thẻ" = lên cấp ngoài trận (bảng `KY_NANG_CAP`). "Power-up" = nâng trong trận (+25% sát thương gốc/bước, giữ như cũ cho mọi ụ).
Mọi con số là **điểm bắt đầu**. Phải chạy `tools/thap-sim-tier.js` trước khi chốt.

### A. Cannon (`canon`, Trắng) → **PHÁO LA BÀN** — ụ HƯỚNG + SỐ  ★ đề xuất số 1

**Bây giờ:** bắn chậm, nổ lan; sao chỉ làm vùng nổ to hơn.
**Mới:**
- Khi gọi ra: có 1 **mũi tên** ngẫu nhiên (↑ ↓ ← →) và **số = 1**.
- Ghép Pháo La Bàn vào Pháo La Bàn (cùng sao): kết quả **vẫn là Pháo La Bàn**, +1★, ở ô ĐÍCH. Đây là ghép đặc biệt giữ loại, giống Vua Ghép.
  - **Cùng hướng** → giữ hướng, **số cộng**: 2 + 1 = 3.
  - **Vuông góc** → giữ hướng và số của ụ ĐÍCH. Số của ụ kéo mất.
  - **Ngược hướng** → giữ hướng của ĐÍCH, **số trừ**, không dưới 1. Bù lại: phần bị trừ **nổ thành sóng** dọc làn, gây (số bị trừ × 6) lần sát thương một phát lên mọi quái. Như vậy ngược hướng là cách "rút tiền", không phải lỗi.
  - Ghép với Mimic / ụ khác loại → ra ụ ngẫu nhiên như luật thường, số mất.
- **Sát thương:** mỗi điểm số +15% sát thương. **Đạn bay theo mũi tên**: ↑ bắn lên làn trên, ← làn trái, ↓ làn dưới; → (phía lõi) bắn quái gần lõi nhất. Đạn xuyên mọi quái trên đường thẳng đó.
- **Mốc sao:** 3★ nổ lan to hơn (giữ chất Cannon) · 5★ số ×1,5 khi ở hàng/cột sát làn theo mũi tên · 7★ mỗi 8 s bắn 1 phát theo CẢ 4 hướng.

```
 Ghép cùng hướng:        Ghép vuông góc:        Ghép ngược hướng:
 [→2][→1]  kéo →1 vào →2  [→3][↑2]  kéo ↑2 vào →3  [→5][←2]  kéo ←2 vào →5
 = [ ][→3] (2★)           = [ ][→3]  (↑2 mất)      = [ ][→3] + sóng 2×6 = 12 phát
```

**Vì sao vui:** mỗi lần ghép là một câu hỏi: ghép vào ụ nào (đích giữ hướng)? Đợi ụ cùng hướng hay ghép bừa để lên sao? Đặt ụ ↑ ở hàng trên cho gần làn. Số lớn dần thành "ụ con cưng" của trận.
**Cân bằng:**
- Ghép toàn cùng hướng: 7★ cần 64 ụ 1★ (2⁶), mỗi lần ghép chỉ 1/4 khả năng cùng hướng → số thực tế khoảng 6–15.
- Đề nghị trần mềm: từ số 20 trở lên mỗi điểm chỉ +5%. Chỉ thêm trần này nếu sim cho thấy cần.
**Cấp thẻ:** +15% mỗi số → +1%/cấp, tối đa +21%. **Power-up:** như cũ.
**Online (lockstep):** hướng bốc bằng RNG hạt giống của lượt gọi (cùng chỗ đang bốc loại ụ). `T.huong`, `T.so` phải nằm trong trạng thái ụ được đồng bộ và gói ghép. Thứ tự sóng nổ = theo `o` tăng dần.
**Giao diện:** 1 huy hiệu MŨI TÊN ảnh PNG (xoay bằng code, đúng QT3) ở góc trên ô + số chữ trắng bên cạnh. Lúc kéo, ô đích sáng lên kèm chữ nhỏ "+3", "=3" hoặc "−2 💥" (chỉ hiện khi đang kéo). Không thêm vòng.
**Hình cần gen:** `arrow badge, chunky metal arrow pointing right, gold rim, game UI icon, grid 1x1, solid #FF00FF background, same style as attached, no text` · `shockwave line strip, orange energy, horizontal, 4 frames, #FF00FF background`.

### B. Ember Relay (`lualien`, Vàng) → **LỬA THẬP TỰ** (Kalaratri đúng nghĩa)  ★ đề xuất số 2

**Bây giờ:** ghép → +1 lửa cho Relay ở 4 ô SÁT; tối đa 5; mỗi lửa +12% sát thương, +3% chí mạng.
**Mới:**
- Ghép có Relay → +1 lửa cho **MỌI Relay cùng HÀNG và cùng CỘT** với ô ghép, xa mấy cũng được (đúng chữ "십자 방향").
- **Lửa không mất khi ghép:** 2 Relay bị ghép bỏ lại lửa của mình, chia đều cho các Relay còn lại trên chữ thập. Không còn Relay nào thì lửa thành "than" của bàn: Relay gọi ra sau nhận ngay than đó (tối đa 3).
- Trần lửa **5 → 9** (9 là số đẹp). Mỗi lửa +10% sát thương, +3% chí mạng. Đủ 9 lửa = "Hoả Thập Tự": đạn đốt cả hàng làn gần nhất.
- Giữ +15% tốc 5 s sau khi ghép.

```
 [R ][  ][R ][  ][R ]   ghép 2 Relay ở ô giữa hàng 2 (*)
 [  ][  ][* ][  ][R ]   → R cùng cột (trên, dưới) +1, R hàng 2 (phải) +1
 [  ][  ][R ][  ][  ]   → R ở góc trên-phải KHÔNG nhận (không cùng hàng/cột)
```

**Vì sao vui:** xếp Relay thành chữ thập/hàng, ghép ở **ô giao** để chia lửa nhiều nhất. Ghép Relay nào (Relay "cháy" thì giữ, Relay ít lửa thì đem ghép). Bàn sắp xếp có chủ đích, không phải ghép bừa.
**Cân bằng:** tối đa 4 + 2 = 6 Relay nhận mỗi lần ghép (hàng 5, cột 3). Có 9 lửa: +90% sát thương, +27% chí mạng. Bậc Vàng có trần chung chí mạng nếu cần.
**Cấp thẻ:** +10%/lửa → +0,75%/cấp, tối đa +14,5%.
**Online:** chỉ đọc trạng thái bàn; chia lửa lẻ theo `o` tăng dần.
**Giao diện:** giữ huy hiệu `n/9` đã có (demkn), thêm vệt lửa chạy dọc hàng/cột lúc ghép (VFX).
**Hình:** `fire trail strip running along a straight line, orange-gold flames, 6 frames, #FF00FF background, same style as attached`.

### C. Radar (`radar`, Xanh) → **RADAR QUÉT TIA** — hỗ trợ theo hướng, hình do ghép tạo ra

**Bây giờ:** +tốc 4 ô kề (12% → 28%), dính trần 45%.
**Mới:**
- Radar có **1 cánh** theo mũi tên ngẫu nhiên khi gọi ra. Nó buff **cả tia** theo hướng đó tới mép bàn, xa mấy cũng được.
- Ghép Radar vào Radar (giữ loại): **cánh của ụ kéo được thêm vào** ụ đích. Cùng hướng → tia +10% mạnh hơn. Hướng mới → thêm 1 tia, Radar thành hình chữ L / chữ T / chữ thập.
- Mỗi ô trong tia: +10% tốc (1★) → +22% (7★). Ụ đứng xa hơn 2 ô nhận ×0,7.

```
 [A ][A ][R→][A ][A ]  R→ buff 2 A bên phải ;  ghép thêm R← vào → R↔ buff cả 4 A trong hàng
```

**Vì sao vui:** 1 Radar đặt khéo buff cả hàng thay vì 4 ô. Ghép Radar để "xây hình". **Giảm** số ụ hỗ trợ 4 ô na ná nhau.
**Cân bằng:** tia dài nhưng mỗi ô ít hơn, vẫn vào trần 45%.
**Online / Giao diện:** cánh là danh sách `T.canh`. Huy hiệu mũi tên nhỏ, dùng chung ảnh với A. Khi chạm vào Radar, tia sáng hiện trong bảng chạm-mở.
**Hình:** dùng lại mũi tên A.

### D. Tesla (`set`, Trắng) → **LƯỚI TESLA** — nối nhau theo hàng/cột

**Bây giờ:** sét chuỗi N quái = số sao.
**Mới:** mỗi Tesla **nối dây** với Tesla khác cùng hàng/cột mà **không bị ụ khác chắn giữa**. Mỗi dây nối +1 bước nhảy sét và +8% sát thương. 4 Tesla thành ô vuông (2×2 góc) → "Lồng Sét": mỗi 6 s giật toàn bộ quái trong tầm.

```
 [T ][  ][T ]   T—T nối (ô giữa trống) ✔
 [T ][X ][T ]   T X T: bị X chắn ✘
```

**Vì sao vui:** cố tình **để ô trống** giữa hai Tesla hoặc dời ụ chắn ra. Ngược hẳn với kiểu "lấp đầy bàn".
**Cân bằng:** Tesla là bậc Trắng nên tối đa +3 bước nhảy.
**Giao diện:** dây sét mờ giữa các ô (VFX ảnh, chỉ vẽ khi có Tesla).
**Hình:** `thin electric arc segment, horizontal, tileable, cyan, 4 frames, #FF00FF background`.

### E. Revolver (`sungluc`, Trắng) → **SÚNG LỤC DI SẢN** — vết khắc truyền sang ụ mới

**Mới:** mỗi phát giết = +1 **vết khắc** (tối đa 3 + số sao). Khi Revolver bị ghép, mọi vết khắc của **cả 2 nguyên liệu** truyền sang ụ KẾT QUẢ, dù kết quả là loại gì. Ụ đó giữ "Di sản": +4% sát thương mỗi vết, vĩnh viễn, tối đa +40%.
**Vì sao vui:** Revolver thành "bình tích". Phải chọn ghép **khi đầy**, và ghép vào ô ở vị trí tốt (vì ụ ngẫu nhiên ra ở ô đích).
**Online:** `T.disan` đi theo gói ghép. **Giao diện:** số nhỏ ở góc chỉ khi > 0.

### F. Guillotine (`maychem`, Trắng) → **MÁY CHÉM MÀI LƯỠI** — cộng dồn toàn bàn

**Mới:** mỗi lần Guillotine chém chết ngay → **bàn** +1 lưỡi (tối đa 20). Mỗi lưỡi +0,2% tỉ lệ chém cho MỌI Guillotine. Lưỡi **không mất** khi Guillotine bị ghép đi. Mất 5 lưỡi mỗi lần quái lọt.
**Vì sao vui:** cộng dồn cả trận ("bàn này đã mài 18 lưỡi"); để quái lọt thì mất lưỡi. **Effort nhỏ.**

### G. Chain Link (`lienket`, Tím) → **XÍCH HÌNH KHỐI** — hình nhóm quan trọng

**Mới:** vẫn đếm nhóm cùng loại liền kề, nhưng thêm thưởng theo **hình dạng**:
- **Thẳng 3** (hàng/cột) → +30% tốc
- **Chữ L** → +15% chí mạng
- **Vuông 2×2** → +60% sát thương
- **Chữ T** → mỗi 5 s bắn xích trói quái đầu 1 s

Thưởng nào có trong nhóm thì nhận cả (nhóm lớn có thể có nhiều hình).
**Vì sao vui:** "xếp hình" như Tetris, cùng Teleporter làm công cụ dời ụ.
**Giao diện:** khi chạm vào ụ, bảng chi tiết hiện tên hình. Bàn chơi không thêm gì.

### H. Mystery Box (`hopbi`, Tím) → **HỘP LÁNG GIỀNG** — biến hình theo vị trí

**Bây giờ:** sau 58 s biến thành ụ ngẫu nhiên 1–6★.
**Mới:** khi mở, hộp biến thành **loại xuất hiện nhiều nhất trên hàng + cột của nó**, ở sao = sao cao nhất của loại đó trên chữ thập (tối đa 6★). Hoà thì bốc ngẫu nhiên theo hạt giống. Chữ thập trống → như cũ.

```
 [S3][  ][S2][  ][  ]
 [  ][  ][? ][S1][  ]   → ? mở ra Sniper (S) 3★  (S xuất hiện 3 lần)
 [  ][  ][M2][  ][  ]
```

**Vì sao vui:** cược có điều khiển. Đặt hộp đúng chỗ để "nhân bản" ụ mạnh. Khác hẳn Evolver/Pandora (thuần may rủi).

### I. Mana Core (`mana`, Trắng) → **KÉT LÃI** — tiết kiệm hay tiêu

**Mới:** mỗi 7 s sinh mana cố định như cũ **+ lãi 2% của mana đang để dành** (×sao/3, tối đa 12 × sao mỗi lần).
**Vì sao vui:** lựa chọn kinh tế thật sự: giữ mana chờ lãi hay gọi ụ ngay. Hợp với Energy Cannon (`nangluong`, mạnh theo mana đang có).
**Cân bằng:** trần mỗi lần để không lăn cầu tuyết. **Effort nhỏ.**

### J. Fifth Shot (`no5`, Tím) → **NỎ NHỊP CHUNG** — nhịp toàn bàn

**Mới:** mọi Fifth Shot trên bàn đếm **chung 1 nhịp**. Phát thứ 5 của bàn → **MỌI** Fifth Shot cùng bắn loạt 3 mũi nổ một lúc. Có 3+ Fifth Shot thì loạt thứ 5 thêm +1 mũi.
**Vì sao vui:** càng nhiều nỏ, loạt bắn càng dày và càng đồng bộ, rất "đã" khi nhìn. Giữ hay ghép nỏ là quyết định thật. **Effort nhỏ.**
**Giao diện:** số nhịp dùng chung huy hiệu đã có, không thêm.

### K. Fusion Mixer (`tron`, Xanh) → **BỘ TRỘN HÀNG** — đa dạng cả hàng

**Mới:** đếm **số loại Tấn công khác nhau trên CẢ HÀNG của nó** (không phải 4 ô kề). Cả hàng nhận +4% tốc mỗi loại. Đủ 4 loại khác nhau trên hàng → "Full House": +10% sát thương thêm.
**Vì sao vui:** ngược hẳn Railgun (muốn hàng thuần một loại). Hai bộ bài khác nhau sẽ xếp hàng ngược nhau.

### L. Quantum Choir (`hopca`, Vàng) → **BÀN POKER** — mẫu sao trên hàng

**Bây giờ:** +sát thương theo số ụ cùng sao (trùng ý với Sync Cannon và Cosmem).
**Mới:** mỗi wave tính "**tay bài**" của HÀNG có Choir (theo số sao các ụ):
- **Đôi** (2 ụ cùng sao) → +20%
- **Hai đôi** → +35%
- **Sám** (3 cùng sao) → +50%
- **Sảnh** (5 ô sao liên tiếp, ví dụ 1-2-3-4-5★) → +90%
- **Cù lũ** (3 + 2) → +110%

Thưởng áp cho mọi ụ Tấn công trên hàng.

```
 [2★][3★][4★][5★][6★]  = SẢNH → cả hàng +90%
```

**Vì sao vui:** ai cũng hiểu luật poker. "Ghép ụ 4★ lên 5★" giờ có thể **phá sảnh**, nên có lúc NÊN giữ không ghép.
**Giao diện:** khi mở bảng chạm, tên tay bài hiện ở mép hàng (chữ). Cần 5 ảnh nhỏ cho 5 tay bài.

### M. Fusion Archive (`luutru`, Vàng) → **Ổ MẸ** — hệ "con"

**Bây giờ:** gần giống hệt Combo (+% vĩnh viễn mỗi lần ghép).
**Mới:**
- Ụ 1★ nào **được gọi ra trên hàng hoặc cột của Ổ Mẹ** thành "**con**" (chấm nhỏ). Con giữ dấu khi được ghép lên sao.
- Mỗi lần một con bị ghép → Ổ Mẹ +1 sữa (tối đa 30). Mỗi sữa +3% sát thương cho chính Ổ Mẹ.
- Khi Ổ Mẹ bị ghép: **mọi con trên bàn** nhận +1% sát thương cho mỗi sữa, vĩnh viễn ("thừa kế").

**Vì sao vui:** đặt Mẹ ở ô giao nhiều ô trống nhất. Chọn **lúc nào** "hy sinh" Mẹ để cả đàn con mạnh lên. Đúng chất "Katarina con" bạn kể.
**Online:** cờ `T.con`, `T.me` đồng bộ. **Effort vừa.**

### N. Drone Bay (`drone`, Xanh) → **DRONE KÉO XA**  ★ đề xuất số 3

**Mới:** số drone khi ghép = **quãng kéo** (số ô Manhattan từ ụ kéo tới ụ đích) + sao/3. Kéo từ góc này sang góc kia (6 ô) = 6+ drone.

```
 [D ][  ][  ][  ][  ]
 [  ][  ][  ][  ][  ]
 [  ][  ][  ][  ][D ]   kéo D trên-trái → D dưới-phải: 6 ô = 6 drone
```

**Vì sao vui:** muốn cặp Drone đứng **XA nhau**, ngược với mọi ụ khác. Thao tác kéo dài trên tay rất đã. **Effort nhỏ** (đã có ô nguồn và ô đích).

### O. Cloner (`nhanban`, Tím) → **MÁY NÉM BẢN SAO** — ụ mới rơi theo hướng kéo

**Mới:** ụ 1★ thêm **rơi vào ô tiếp theo trên đường kéo**, tính từ ô đích. Ô đó đầy hoặc ngoài bàn → ô trống gần nhất như cũ.
**Vì sao vui:** người chơi tự "ngắm" chỗ ụ mới ra. Hợp với Hộp Láng Giềng, Ổ Mẹ, Railgun.

### P. Scrambler (`xaotron`, Tím) → **MÁY NGHIÊNG BÀN** (kiểu 2048)  — vui nhất, rủi ro nhất

**Bây giờ:** khi ghép xáo ụ đối thủ (PVP); SOLO gần như vô dụng. Trùng ý với 3 ụ khống chế khác.
**Mới:**
- Có mũi tên như A. Khi ghép → **nghiêng bàn của mình** theo mũi tên của ụ đích: mọi ụ trượt hết về phía đó.
- Hai ụ cùng loại + cùng sao **va nhau thì tự ghép** (luật ghép thường, ra ụ ngẫu nhiên +1★). Mỗi cặp chỉ ghép 1 lần mỗi lần nghiêng, như 2048.
- **PVP:** nghiêng **bàn đối thủ** theo hướng ngược lại (không tự ghép bên đó).
- Ô đá không trượt, chặn đường.

```
 Trước (nghiêng →):         Sau:
 [A1][  ][A1][B2][  ]   →   [  ][  ][  ][A?2][B2]   (A1+A1 tự ghép)
```

**Vì sao vui:** một lần ghép làm cả bàn chuyển động, có thể nổ chuỗi ghép. Người chơi phải tính trước.
**Rủi ro:** dễ phá xếp hình (Railgun, Lửa Thập Tự). Kéo theo nhiều hiệu ứng trượt. Online cần thứ tự xử lý cố định (quét theo hướng, `o` tăng dần).
**Effort lớn.** Nên làm sau cùng hoặc thành ụ mới (§3b).

### Q. Iron Fist (`nam`, Trắng) → **NẮM ĐẤM ĐẨY**

**Mới:** mỗi cú đấm thứ 4 đẩy lùi quái đầu (trùm ×0,3). Mỗi Iron Fist **khác** đứng cùng **cạnh bàn sát làn** +1 lực đẩy.
**Vì sao vui:** vị trí sát làn đã có nghĩa với Iron Fist; giờ xếp cả dãy dọc làn thành "tường đấm". **Effort nhỏ.** (Ưu tiên thấp.)

### 3b. Ý tưởng ụ MỚI (không ụ cũ nào hợp)

| # | Tên | Cơ chế | Vì sao |
|---|---|---|---|
| N1 | **Đồng Xu** (Đặc biệt) | Kéo lên ụ bất kỳ cùng sao: tung đồng xu (hạt giống). Ngửa → kết quả +2★. Sấp → kết quả 1★ nhưng hoàn 60% mana đã gọi. Huy hiệu đếm chuỗi ngửa, 3 ngửa liền = vàng. | cược rõ ràng, nhìn thấy ngay |
| N2 | **Gương Đối Xứng** (Hỗ trợ) | Liên kết với ô **đối xứng** qua cột giữa (cột 1↔5, 2↔4). Ụ ở ô đối xứng được chép 30% sát thương. Ghép Gương → đổi chỗ 2 ụ đối xứng. | bàn có trục, xếp đối xứng |
| N3 | **Ký Sinh** (Đặc biệt) | Kéo lên ụ khác: bám vào (không mất ụ chủ). Ký sinh đi theo ụ chủ qua mọi lần ghép (kể cả kết quả ngẫu nhiên). Mỗi lần chủ được ghép → ký sinh +1, +5% sát thương cho chủ, tối đa 10. | "đồ đi theo qua ghép" kiểu Gumiho |
| N4 | **Domino** (Tấn công) | Có mũi tên. Khi bắn chí mạng, nổ truyền sang ụ kế tiếp theo mũi tên. Ụ đó bắn thêm 1 phát; nếu cũng là Domino thì truyền tiếp. | chuỗi phản ứng theo hướng |
| N5 | **Đèn Màu Lupin** (làm lại `bienmau`, đã có) | Đang có màu R/Y/B. Đề xuất thêm: ghép 2 cùng màu thì **kết quả giữ màu** và màu dừng quay 20 s. | hoàn thiện ý Lupin DCDW |

---

## 4. Xếp hạng (vui ÷ công làm)

| Hạng | Đề xuất | Vui (1–5) | Công | Ghi chú |
|---|---|---|---|---|
| 1 | B. Lửa Thập Tự (`lualien`) | 5 | Nhỏ | đã có code lửa, chỉ đổi phạm vi + giữ lửa |
| 2 | A. Pháo La Bàn (`canon`) | 5 | Vừa | đúng ví dụ bạn đưa; cần huy hiệu mũi tên |
| 3 | N. Drone Kéo Xa (`drone`) | 4 | Nhỏ | 1 công thức |
| 4 | H. Hộp Láng Giềng (`hopbi`) | 4 | Nhỏ | |
| 5 | L. Bàn Poker (`hopca`) | 4,5 | Vừa | cần 5 ảnh tay bài |
| 6 | M. Ổ Mẹ (`luutru`) | 4,5 | Vừa | hệ "con" |
| 7 | J. Nỏ Nhịp Chung (`no5`) | 3,5 | Nhỏ | |
| 8 | D. Lưới Tesla (`set`) | 4 | Vừa | |
| 9 | O. Máy Ném Bản Sao (`nhanban`) | 3,5 | Nhỏ | |
| 10 | G. Xích Hình Khối (`lienket`) | 4 | Vừa | |
| 11 | I. Két Lãi (`mana`) | 3,5 | Nhỏ | |
| 12 | E. Súng Lục Di Sản (`sungluc`) | 3,5 | Vừa | |
| 13 | K. Bộ Trộn Hàng (`tron`) | 3,5 | Nhỏ | |
| 14 | C. Radar Quét Tia (`radar`) | 4 | Vừa | đụng trần hỗ trợ |
| 15 | F. Máy Chém Mài Lưỡi (`maychem`) | 3 | Nhỏ | |
| 16 | P. Máy Nghiêng Bàn (`xaotron`) | 5 | Lớn | rủi ro cao |
| 17 | Q. Nắm Đấm Đẩy (`nam`) | 2,5 | Nhỏ | |

---

## 5. Lưu ý chung khi làm

- **Một luật ghép:** vẫn "cùng loại + cùng sao". A, C, P dùng kiểu giữ loại của Vua Ghép (`ghepDB.cungLoai`). Không thêm luật ghép lệch sao.
- **Một vòng:** `MOT_VONG` giữ nguyên. Thông tin mới chỉ là **1 huy hiệu ảnh ở góc ô**, có số chữ khi cần, và chỉ cho A, C, P, E. Mọi chi tiết khác nằm trong bảng chạm-mở (QT7).
- **QT6 đồng bộ:** huy hiệu và VFX phải hiện ở SOLO, CO-OP (cả bàn đồng đội), PVP (cả bàn đối thủ), ONLINE, Test range, hướng dẫn.
- **Online lockstep:**
  - mọi thứ ngẫu nhiên (hướng, đồng xu, hoà khi mở hộp) dùng `rngHat` theo hạt giống trận;
  - trạng thái mới (`huong`, `so`, `canh`, `lua`, `disan`, `con`, `me`) phải vào ảnh chụp trạng thái + gói ghép;
  - mọi phép duyệt bàn theo `o` tăng dần.
- **Sim trước khi chốt số:** `tools/thap-sim-tier.js` (median đúng bậc) + `tools/thap-kt-hoiquy.js` phải XANH trước khi push (QT9).
- **Văn bản:** cập nhật `meta.js` (kyNang/kyNang_vi), `ngonngu-vi.js`, `KY_NANG_CAP`, skilldemo, trang ụ.
- Báo cáo giới hạn (`tuvan/gioi-han/BAO-CAO.md`) vừa lên nhánh lúc commit. Khớp với đề xuất này ở 3 chỗ: Fusion Mixer nên đếm cả hàng/cột (≈ K), Iron Fist/Wyrm chết ở hàng giữa (≈ Q), Radar bị trần tốc ăn (≈ C). Báo cáo đó hiểu "십자 방향" của Kalaratri là **4 ô sát** (cũng ghi chưa xác nhận) → câu 4 bên dưới là lựa chọn THIẾT KẾ, không phải chép đúng game gốc.

---

## 6. CẦN BẠN QUYẾT

1. **Làm ụ nào trước?** Mình đề nghị đợt 1 = **B Lửa Thập Tự + A Pháo La Bàn + N Drone Kéo Xa**. Ba ụ này cho cảm giác mới rõ nhất mà công nhỏ/vừa.
2. **Pháo La Bàn** thay **Cannon** (ụ Trắng, ai cũng có), hay làm **ụ mới** để giữ Cannon cũ? Mình nghiêng về **thay Cannon**: Cannon đang phẳng nhất, và ụ Trắng xuất hiện nhiều nên mũi tên gặp nhau thường xuyên.
3. **Ghép ngược hướng** ở A: dùng luật bạn nhớ (chỉ trừ, tối thiểu 1) hay thêm **sóng nổ bù** như mình đề xuất? Mình nghiêng về **có sóng nổ**: nếu không có thì không ai chủ động ghép ngược.
4. **Lửa Thập Tự:** "chữ thập" = **cả hàng + cả cột** (đề xuất) hay chỉ 4 ô sát như bây giờ? Lửa có **giữ qua ghép** không? Trần **9** hay giữ **5**?
5. **Máy Nghiêng Bàn (2048):** làm lại Scrambler, làm thành **ụ mới**, hay **bỏ**?
6. **Bàn Poker** thay Quantum Choir: được không? (Quantum Choir hiện trùng ý với Sync Cannon.)
7. **Ổ Mẹ** thay Fusion Archive: được không? (Fusion Archive hiện trùng ý với Combo.)
8. Có muốn thêm **ụ mới** nào ở §3b không (Đồng Xu / Gương / Ký Sinh / Domino)?
9. **Hình:** cho phép viết prompt và gửi session điều phối gen huy hiệu mũi tên + 3 dải VFX (sóng, vệt lửa, dây sét) ngay khi bạn chốt?
