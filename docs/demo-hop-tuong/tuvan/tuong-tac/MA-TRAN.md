# Ma trận tương tác: trạng thái ụ × sự kiện (06/11/2026)

**Vì sao có file này:** người chơi (iPhone, SOLO wave 7) thấy Copycat chép **Hộp Bí Ẩn**, hộp hết giờ biến thành 1 ụ **đủ 100 % sức mạnh** — mất phần giảm của bản sao. Lần rà soát trước (commit 123c503) chọn tay vài cặp nên sót. Lần này **mọi cặp** (trạng thái × sự kiện) đều được máy kiểm: `tools/thap-kt-matran.js` (nằm trong `tools/thap-kt-hoiquy.js`). Bảng bên dưới do chính tool đó sinh ra (`GHI_MD=1`), nên bảng = luật đang kiểm.

## Cách kiểm 1 cặp
Dựng bàn không đầu, RNG gieo hạt. Chạy sự kiện 2 lần cùng hạt: **đối chứng** (ụ không có trạng thái) và **thật** (ụ có trạng thái), rồi so ụ kết quả.
Nếu ụ kết quả là **bản sao**: kiểm thêm sát thương = ụ thật cùng loại, cùng sao × % sao chép, và dải xem nhanh (chạm ụ trong trận) có **dấu Copycat + %**.
Thêm 2 kiểm: bom Orbital của bản sao cũng × % sao chép; Hộp Bí Ẩn bản sao mở ra → sức mạnh theo cấp của **loại mới** × % sao chép.

## Luật nền (mặc định, nghiêng DCDW)
1. **Bản sao luôn là bản sao** khi chính nó biến hình hoặc bị biến tại chỗ (Hộp Bí Ẩn, Evolver, Scrambler, trùm Mad Crown): ụ mới giữ −% và dấu tím.
2. **Ghép = ụ mới** (ghép thường, Mimic, Twin/Cloner, Blood Circuit, Joker King ép ghép): trạng thái 2 ụ nguyên liệu không mang sang. (Ngoại lệ có sẵn: Merge King + Merge King giữ vàng; Mimic cho buff 8 s.)
3. **Cùng thân** (Merge King +★, Teleporter đổi chỗ, Overclock, trùm −★/đá/băng, +★ bằng kỹ năng): giữ mọi thứ.
4. **Buff/debuff tạm và bộ đếm riêng** (Overclock, buff Mimic, bùng tốc, giảm tốc, kẹp, cháy, tê liệt, lò Forge, lửa Ember, điểm Archive, Orbital thức tỉnh) **hết** khi ụ bị thay bằng thân mới. Riêng Copycat: buff Mimic + Overclock trên thân Copycat đi theo bản sao (luật cũ, DCDW).
5. **Đá / băng chặn** kỹ năng, ghép, biến hình (đồng hồ Hộp/Evolver dừng) tới khi được tẩy. Merge King, Teleporter, +★ vẫn được (chỉ đổi sao/chỗ).
6. **Cấp thẻ / nâng cấp trong trận** luôn theo **loại kết quả** (tính theo loại mỗi khung).
7. Khiên 1 lần chặn chiêu trùm và phá của đối thủ; biến tại chỗ giữ khiên.

Nguồn DCDW: không đọc được namu.wiki (chặn tự động); trang tiếng Anh/Hàn khác chỉ nói "Shamash chép ụ cùng sao, có giảm" — không có chi tiết hộp/bom. Nên luật 1–7 là mặc định hợp lý, các điểm chưa chắc ở mục **Cần bạn quyết**.

## Đã sửa lần này
- **Copycat → Mystery Box / Evolver: hết giờ ra ụ đủ sức** → nay giữ bản sao (−%, quầng tím, dấu Copycat). Lỗi gốc ở `chuyenU` (skills2.js) tạo ụ mới không mang cờ bản sao.
- **Scrambler (SOLO/CO-OP/PVP) và trùm Mad Crown biến bản sao → ụ đủ sức** → giữ bản sao (cùng hàm `giuKhiBien`).
- **Scrambler / Mad Crown / Joker King biến hoặc ép ghép ụ đang ĐÁ/BĂNG** → nay bỏ qua ô khoá.
- **Bom Orbital của bản sao không giảm** → nay × % sao chép.
- **Dải xem nhanh trong trận không cho biết ụ là bản sao** → thêm dấu Copycat (ảnh PNG) + "COPY 70%" (mọi chế độ, cả sau khi biến hình).
- ONLINE: cờ bản sao `c` đã đi trong ảnh chụp bàn → con rối nhận đúng bản sao sau khi hộp mở bên máy bạn (đã kiểm `onlKhac`).

## Cần bạn quyết (đang để mặc định)
1. **Bản sao bị Scrambler / Mad Crown biến** — đang: vẫn là bản sao (để phá/biến không thành "quà" bỏ −%). Khác: biến = ụ mới đủ sức.
2. **Overclock trên Evolver / ụ bị biến** — đang: +% tốc vĩnh viễn mất khi Evolver biến hình. Khác: mang sang ụ mới.
3. **Copycat chép ụ có lò Forge / lửa Ember / điểm Archive / Orbital đang thức tỉnh** — đang: bản sao về 0 (thân mới), chỉ giữ DẠNG (vàng, thức tỉnh Sói). Khác: chép cả bộ đếm.
4. ~~Copycat chép ô ĐÁ~~ — session Copycat-đá đã làm xong (9d79bd2): chép được ô đá/băng → bản sao thường (không mang khoá). Ma trận đã bắt được thay đổi này và đổi luật theo.
5. **Hộp Bí Ẩn bản sao** — đồng hồ đếm lại từ đầu (thân mới), không lấy giờ còn lại của hộp gốc.
6. **Tê liệt Hex (2.5 s)** — đang: dừng đồng hồ Hộp/Evolver như băng, nhưng vẫn kéo/ghép được. Khác: khoá hẳn như băng.
7. **Bản sao Mana Core / ụ hỗ trợ** — % sao chép đang chỉ giảm SÁT THƯƠNG (và bom Orbital); mana sinh ra và buff hỗ trợ của bản sao vẫn đủ.

## Bảng (sinh tự động)
<!-- BANG-BAT-DAU -->
<!-- BẢNG SINH TỰ ĐỘNG: GHI_MD=1 node tools/thap-kt-matran.js -->
| Sự kiện \ Trạng thái | banSao | da | bang | vang | thuc | orbThuc | epxung | aurora | khien | tocT | giam | kep | lua | hex | lo | lc | kho |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **ghepKeo** Ghép thường — ụ có trạng thái là ụ KÉO | mất | CHẶN | CHẶN | GIỮ | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất |
| **ghepDich** Ghép thường — ụ có trạng thái là ụ ĐÍCH | mất | CHẶN | CHẶN | GIỮ | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất |
| **ghepMimic** Ghép với Mimic | mất | CHẶN | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất |
| **twin** Twin Maker: ụ sinh đôi khi ghép | mất | CHẶN | CHẶN | — | — | — | mất | mất | mất | mất | mất | mất | mất | mất | — | — | — |
| **cloner** Cloner: ụ tặng khi ghép | mất | CHẶN | CHẶN | — | — | — | mất | mất | mất | mất | mất | mất | mất | mất | — | — | — |
| **mkLen** Merge King kéo LÊN ụ (+★) | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **mkKeo** Merge King có trạng thái bị kéo đi (+★ cho ụ khác) | mất | CHẶN | CHẶN | mất | — | — | mất | mất | mất | mất | mất | mất | mất | mất | — | — | — |
| **teleLen** Teleporter kéo lên ụ (đổi chỗ) | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **teleKeo** Teleporter có trạng thái tự đổi chỗ | GIỮ | CHẶN | CHẶN | — | — | — | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | — | — | — |
| **copyLen** Copycat chép ụ có trạng thái | GIỮ | mất | mất | GIỮ | GIỮ | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất |
| **copyKeo** Copycat có trạng thái đi chép ụ khác | GIỮ | CHẶN | CHẶN | — | — | — | GIỮ | GIỮ | GIỮ | mất | mất | mất | mất | mất | — | — | — |
| **ocLen** Overclock lên ụ | GIỮ | CHẶN | CHẶN | GIỮ | GIỮ | · | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | · | GIỮ | GIỮ |
| **mauhut** Blood Circuit hiến ụ (2 ụ → 1 ụ ngẫu nhiên) | mất | CHẶN | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất |
| **forge** Scrap Forge ăn ụ | mất | CHẶN | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | mất | · | mất | mất |
| **hopMo** Mystery Box hết giờ → ụ ngẫu nhiên | GIỮ | CHẶN | CHẶN | — | — | — | mất | mất | GIỮ | mất | mất | mất | mất | CHẶN | — | — | — |
| **tienHoa** Evolver hết giờ → ụ ngẫu nhiên +★ | GIỮ | CHẶN | CHẶN | — | — | — | mất | mất | GIỮ | mất | mất | mất | mất | CHẶN | — | — | — |
| **xaoTron** Scrambler SOLO (biến ụ lẻ của mình thành cặp) | GIỮ | CHẶN | CHẶN | mất | mất | mất | mất | mất | GIỮ | mất | mất | mất | mất | mất | mất | mất | mất |
| **xaoCoop** Scrambler CO-OP (biến ụ lẻ của đồng đội) | GIỮ | CHẶN | CHẶN | mất | mất | mất | mất | mất | GIỮ | mất | mất | mất | mất | mất | mất | mất | mất |
| **xaoPVP** Scrambler PVP (biến ụ đối thủ) | GIỮ | CHẶN | CHẶN | mất | mất | mất | mất | mất | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất |
| **madCrown** Trùm Mad Crown biến ụ | GIỮ | CHẶN | CHẶN | mất | mất | mất | mất | mất | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất |
| **joker** Trùm Joker King ném Mimic + ép ghép | mất | CHẶN | CHẶN | mất | mất | mất | mất | mất | CHẶN | mất | mất | mất | mất | mất | mất | mất | mất |
| **janus** Trùm Janus hoá đá | GIỮ | — | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | CHẶN | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **freezer** Trùm Freezer đóng băng | GIỮ | — | — | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | CHẶN | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **nightmare** Trùm Nightmare −1★ | GIỮ | — | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | CHẶN | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **leech** Trùm Star Leech lấy 1★ | GIỮ | — | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **nangSao** +1★ bằng kỹ năng (REINFORCE / Pandora / Genesis / Star Lift — cùng hàm nangSao) | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ |
| **eve** Chỉ huy Eve HOLY SHIELD (tẩy) | GIỮ | mất | mất | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | mất | GIỮ | GIỮ | GIỮ | GIỮ |
| **sanctum** Sanctum xuất hiện cạnh ụ (tẩy + khiên) | GIỮ | mất | mất | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | mất | mất | mất | mất | GIỮ | GIỮ | GIỮ |
| **cleanser** Cleanser tẩy ụ kề | GIỮ | mất | mất | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | GIỮ | mất | mất | mất | GIỮ | GIỮ | GIỮ | GIỮ |
| **onlCung** ONLINE: ảnh chụp bàn sửa cờ ô (cùng loại) | GIỮ | GIỮ | — | GIỮ | GIỮ | — | GIỮ | — | — | — | — | — | — | — | GIỮ | GIỮ | GIỮ |
| **onlKhac** ONLINE: con rối nhận ụ khác loại (vd. Hộp Bí Ẩn mở bên máy bạn) | GIỮ | GIỮ | — | — | — | — | GIỮ | — | — | — | — | — | — | — | — | — | — |

Ký hiệu: **GIỮ** = ụ kết quả còn trạng thái · **mất** = không mang sang (ụ mới / hết) · **CHẶN** = sự kiện không xảy ra · **—** = không thể có trong trận · **·** = không áp dụng (vd. Overclock không lên ụ không bắn). Tổng 527 cặp: kiểm 455, đạt 455, không thể có 69, không áp dụng 3.

### Lý do từng cặp (rút gọn)
- **ghepKeo** — mất: ghép ra ụ mới (banSao, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · GIỮ: Merge King + Merge King = 1 Merge King +1★, giữ vàng (vang) · mất: ụ mới (khien)
- **ghepDich** — mất: ghép ra ụ mới (banSao, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · GIỮ: Merge King + Merge King = 1 Merge King +1★, giữ vàng (vang) · mất: ụ mới (khien)
- **ghepMimic** — mất: ghép ra ụ mới (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · mất: ụ mới (khien)
- **twin** — mất: ghép ra ụ mới (banSao, epxung, aurora, tocT, giam, kep, lua, hex) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: loại ụ không khớp (vang, thuc, orbThuc, lo, lc, kho) · mất: ụ mới (khien)
- **cloner** — mất: ghép ra ụ mới (banSao, epxung, aurora, tocT, giam, kep, lua, hex) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: loại ụ không khớp (vang, thuc, orbThuc, lo, lc, kho) · mất: ụ mới (khien)
- **mkLen** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, khien, tocT, giam, kep, lua, hex, lo, lc, kho) · GIỮ: chỉ đổi sao/chỗ, khoá giữ nguyên (da, bang)
- **mkKeo** — mất: Merge King biến mất, ụ đích không nhận gì (banSao, vang, epxung, aurora, tocT, giam, kep, lua, hex) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: loại ụ không khớp (thuc, orbThuc, lo, lc, kho) · mất: Merge King biến mất (khien)
- **teleLen** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, khien, tocT, giam, kep, lua, hex, lo, lc, kho) · GIỮ: chỉ đổi sao/chỗ, khoá giữ nguyên (da, bang)
- **teleKeo** — GIỮ: cùng thân (banSao, epxung, aurora, khien, tocT, giam, kep, lua, hex) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: loại ụ không khớp (vang, thuc, orbThuc, lo, lc, kho)
- **copyLen** — GIỮ: cùng thân (banSao) · mất: Copycat chép được ô đá/băng → bản sao THƯỜNG đúng loại thật, ô gốc giữ khoá (9d79bd2, copycat-da/DCDW.md) (da, bang) · GIỮ: bản sao giữ DẠNG (DCDW Shamash chép Sói thức tỉnh) (vang, thuc) · mất: thân mới: không chép buff/bộ đếm của ụ gốc (orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · mất: bản sao lấy khiên của thân Copycat (khien)
- **copyKeo** — GIỮ: cùng thân (banSao, khien) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: Copycat không có dạng này (vang, thuc) · —: loại ụ không khớp (orbThuc, lo, lc, kho) · GIỮ: buff trên thân Copycat đi theo bản sao (DCDW) (epxung, aurora) · mất: thân mới (tocT, giam, kep, lua, hex)
- **ocLen** — GIỮ: cùng thân (banSao, vang, thuc, aurora, khien, tocT, giam, kep, lua, hex, lc, kho) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · GIỮ: cộng dồn (epxung)
- **mauhut** — mất: ghép ra ụ mới (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: ô khoá không bị kéo lên (da, bang) · mất: ụ mới (khien)
- **forge** — mất: ụ bị ăn (banSao, vang, thuc, orbThuc, epxung, aurora, khien, tocT, giam, kep, lua, hex, lc, kho) · CHẶN: ô khoá không bị kéo lên (da, bang)
- **hopMo** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: ụ là Hộp/Evolver (vang, thuc) · —: loại ụ không khớp (orbThuc, lo, lc, kho) · mất: biến hình: buff/đếm của thân cũ hết (epxung, aurora, tocT, giam, kep, lua) · GIỮ: biến tại chỗ giữ khiên (khien) · CHẶN: tê liệt: đồng hồ dừng (như băng) tới khi hết 2.5 s (hex)
- **tienHoa** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · —: ụ là Hộp/Evolver (vang, thuc) · —: loại ụ không khớp (orbThuc, lo, lc, kho) · mất: biến hình: buff/đếm của thân cũ hết (epxung, aurora, tocT, giam, kep, lua) · GIỮ: biến tại chỗ giữ khiên (khien) · CHẶN: tê liệt: đồng hồ dừng (như băng) tới khi hết 2.5 s (hex)
- **xaoTron** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · mất: thành loại khác (vang, thuc) · mất: biến hình: buff/đếm của thân cũ hết (orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · GIỮ: biến tại chỗ giữ khiên (khien)
- **xaoCoop** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · mất: thành loại khác (vang, thuc) · mất: biến hình: buff/đếm của thân cũ hết (orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · GIỮ: biến tại chỗ giữ khiên (khien)
- **xaoPVP** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · mất: thành loại khác (vang, thuc) · mất: biến hình: buff/đếm của thân cũ hết (orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khiên chặn phá của đối thủ (khien)
- **madCrown** — GIỮ: BIẾN tại chỗ: bản sao vẫn là bản sao (lỗi cũ: mất −%) (banSao) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · mất: thành loại khác (vang, thuc) · mất: biến hình: buff/đếm của thân cũ hết (orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khiên chặn chiêu trùm (khiên mất) (khien)
- **joker** — mất: bị ép GHÉP → ụ mới (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · CHẶN: khoá chặn kỹ năng, ghép, biến hình (da, bang) · CHẶN: khiên chặn chiêu trùm (khiên mất) (khien)
- **janus** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · —: trùm không nhắm ô đá (da) · GIỮ: thêm/bớt trên ụ đang băng (bang) · CHẶN: khiên chặn chiêu trùm (khiên mất) (khien)
- **freezer** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · —: trùm không nhắm ô đá (da) · —: đã băng (bang) · CHẶN: khiên chặn chiêu trùm (khiên mất) (khien)
- **nightmare** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, tocT, giam, kep, lua, hex, lo, lc, kho) · —: trùm không nhắm ô đá (da) · GIỮ: thêm/bớt trên ụ đang băng (bang) · CHẶN: khiên chặn chiêu trùm (khiên mất) (khien)
- **leech** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, khien, tocT, giam, kep, lua, hex, lo, lc, kho) · —: trùm không nhắm ô đá (da) · GIỮ: thêm/bớt trên ụ đang băng (bang)
- **nangSao** — GIỮ: cùng thân (banSao, vang, thuc, orbThuc, epxung, aurora, khien, tocT, giam, kep, lua, hex, lo, lc, kho) · GIỮ: chỉ đổi sao/chỗ, khoá giữ nguyên (da, bang)
- **eve** — GIỮ: cùng thân (banSao, vang, thuc, khien) · mất: được tẩy (da, bang, lua) · GIỮ: không phải hiệu ứng xấu Eve tẩy (orbThuc, epxung, aurora, tocT, giam, kep, hex, lo, lc, kho)
- **sanctum** — GIỮ: cùng thân (banSao, vang, thuc, khien) · mất: được tẩy (da, bang, giam, kep, lua, hex) · GIỮ: không xấu (orbThuc, epxung, aurora, tocT, lo, lc, kho)
- **cleanser** — GIỮ: cùng thân (banSao, vang, thuc, khien) · mất: được tẩy (da, bang, giam, kep, lua) · GIỮ: không xấu (orbThuc, epxung, aurora, tocT, hex, lo, lc, kho)
- **onlCung** — GIỮ: cờ ô qua mạng (banSao, vang, thuc, epxung, lo, lc, kho) · GIỮ: cờ S (da) · —: băng do trùm chạy y hệt 2 máy (bang) · —: tạm, chạy y hệt 2 máy (orbThuc, aurora, tocT, giam, kep, lua, hex) · —: khiên chạy y hệt 2 máy (khien)
- **onlKhac** — GIỮ: cờ ô qua mạng (banSao, epxung) · GIỮ: cờ S (da) · —: băng do trùm chạy y hệt 2 máy (bang) · —: cờ riêng của loại đó (vang, thuc, lo, lc, kho) · —: tạm, chạy y hệt 2 máy (orbThuc, aurora, tocT, giam, kep, lua, hex) · —: khiên chạy y hệt 2 máy (khien)
<!-- BANG-KET-THUC -->
