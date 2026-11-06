# Bảng cộng hưởng kỹ năng × ô ĐÁ / BĂNG (06/11/2026)

Nguồn DCDW: [DCDW-NGHIEN-CUU.md](DCDW-NGHIEN-CUU.md). Kiểm tự động: `tools/thap-kt-conghuong.js` (nằm trong `tools/thap-kt-hoiquy.js`).

**Luật chung (mọi ụ):** ụ bị ĐÁ (Janus) hoặc BĂNG (Freezer) không bắn, không chạy kỹ năng, đồng hồ kỹ năng dừng, không nhận buff hỗ trợ (`HOTRO.nhan` bỏ qua đá), trùm không nhắm lại ô đá. Ụ bị khoá **kéo đi thì không dùng được kỹ năng ghép đặc biệt**. Ụ đỏ bị khoá: không chạm dùng kỹ năng chủ động được (từ nay AI cũng không).
**Luật mới (theo DCDW):** ụ KHOẺ có kỹ năng chỉ đổi **sao** hoặc **chỗ** (`ghepDB.quaKhoa`) được kéo lên ô đá / băng. Đá + đá cùng sao → **khối đá +1★** (loại ngẫu nhiên nằm dưới đá), không chạy kỹ năng "khi ghép".

Chữ đậm = đã đổi trong lần này.

| Ụ của mình (bậc) | Kỹ năng | Với ô ĐÁ | Với ô BĂNG | Với ụ đặc biệt khác | DCDW tương ứng | Lệch? |
|---|---|---|---|---|---|---|
| **Merge King** `vughep` (vàng) | kéo lên ụ cùng sao → +1★ (vàng +2★); MK+MK → MK +1★ | **trước: không được. Nay: được, ô đá +1★ (vàng +2★), vẫn là đá → 2 ô đá cùng sao ghép được** | **trước: không. Nay: +1★, vẫn băng** | MK lên MK đá: MK đá +1★. MK đá / băng kéo đi: không dùng kỹ năng | Aurora King. Người chơi xác nhận nâng sao ô đá được | **ĐÃ SỬA** |
| Ô ĐÁ + ô ĐÁ (Janus) | 2 đá cùng sao ghép | **trước: ra ụ thường ngẫu nhiên +1★. Nay: ra khối ĐÁ +1★ (DCDW "등급높은 돌덩이")**; kỹ năng khi ghép của 2 cục đá **không chạy** (vd. Twin Maker đá không gọi ụ, Mimic đá không buff Aurora, Combo không đếm) | băng + băng: không ghép (chưa rõ ở DCDW, giữ) | đá + ụ khoẻ: không (giữ) | Janus Cube, DC 29958 | **ĐÃ SỬA** |
| **Teleporter** `dichchuyen` (xanh) | kéo lên ụ cùng sao → đổi chỗ | **trước: không. Nay: đổi chỗ, ô kia vẫn là đá** | **Nay: đổi chỗ, vẫn băng** | Teleporter đá kéo đi: không | Merlin (chưa rõ với đá). Theo cùng quy tắc với Merge King: chỉ đổi chỗ, không chạm sức mạnh | **ĐÃ SỬA** (suy theo luật Merge King) |
| Copycat `saochep` (vàng) | kéo lên ụ cùng sao → thành bản sao (−50% sát thương) | không (giữ): đá không có kỹ năng để chép | không (giữ) | — | Shamash — chưa rõ với đá | giữ (chưa rõ) |
| Overclock `epxung` (tím) | kéo lên ụ Tấn công cùng sao → +65% tốc | không (giữ): buff vào cục đá vô ích | không (giữ) | — | Pararamim — chưa rõ | giữ |
| Mimic `mimic` (xanh) | ghép với BẤT KỲ ụ cùng sao | không (giữ): đá chỉ ghép với đá | không (giữ) | Mimic đá + đá: ra khối đá, không buff Aurora | Aurora — chưa rõ với đá | giữ |
| Scrap Forge `loren` (vàng) | kéo ụ 1–3★ vào lò → buff ụ Tấn công | không (giữ) | không (giữ) | — | (mới) | giữ |
| Cleanser `taylo` (tím) | mỗi 12 s tẩy băng / đá / cháy / kẹp cho 2 ụ kề | tẩy được — cả **khối đá sau ghép** (lộ ụ thật cùng sao) | tẩy được | ghép với Merge King: nâng sao đá rồi tẩy = ụ sao cao | Frey (biến hình ô đá), Gemina | khớp (thêm kiểm) |
| Eve (chỉ huy) | xoá băng / đá / cháy mọi ụ + chặn chiêu trùm 8 s | tẩy được | tẩy được | — | Eve | khớp |
| Shield Gen `khien` (tím), Holy Halo `haoquang` (đỏ), Mirror Gate `guongcong` (vàng) | khiên chặn chiêu trùm / khống chế | chặn được hoá đá trước khi dính; không cấp khiên cho ô đá đang là đá | Halo: băng chỉ còn ½ | — | Mona / Eve chặn hoá đá | khớp |
| Twin Maker `sinhdoi` (vàng) | khi ghép gọi thêm 1 ụ cùng sao | **2 Twin Maker đá ghép: không gọi (trước: vẫn gọi)** | không ghép được | — | Berit | **ĐÃ SỬA** (qua luật đá + đá) |
| Cloner `nhanban` (tím), Drone `drone`, Mana Doubler `nhanmana`, Cooldown Horn `loa` (xanh), Combo `combo`, Scrambler `xaotron`, Jammer `nhieusong`, Clamp `kepha` (tím), Pandora `pandora` (vàng), Orbital `orbital` (vàng) | kỹ năng "khi ghép" | **đá + đá: không chạy** (trước: chạy) | không ghép được | Pandora "sao", Scrambler bỏ qua ô đá khi chọn mục tiêu (giữ) | Chang'e… | **ĐÃ SỬA** (qua luật đá + đá) |
| Star Lift `nangsao` (tím) | 5★: mỗi wave 1 nấc sao cho ụ kề thấp nhất | bỏ qua ô đá (giữ) | nhận nấc | — | Brownie — chưa rõ | giữ: tự chọn mục tiêu, nếu chọn đá thì là phạt ẩn người chơi không điều khiển |
| Lõi Khởi Sinh `khoisinh` (đỏ) | +1★ ụ thấp nhất theo giờ; chủ động gọi ụ | bỏ qua ô đá (giữ); **khi chính nó là đá: AI không dùng kỹ năng chủ động (trước: AI vẫn dùng)** | như đá | — | Brownie / Aurora King | **ĐÃ SỬA** (AI) |
| Evolver `tienhoa` (vàng), Mystery Box `hopbi` (tím) | sau một lúc biến thành ụ ngẫu nhiên | đồng hồ **dừng** khi là đá (giữ) | dừng khi băng (giữ) | Merge King lên Evolver đá: +★, biến hình sau khi tẩy | Moa / Daron — chưa rõ | giữ |
| Chỉ huy REINFORCE / Pandora "sao" | +★ tự động | bỏ qua đá (giữ) | nhận | — | — | giữ (lý do như Star Lift) |
| Ụ đỏ có kỹ năng chủ động: `blackhole`, `overlord`, `lophanung`, `ngaithoigian`, `chuato`, `leviathan`, `ronglua`, `khoisinh` | chạm khi nạp đầy | không dùng được khi đá; **AI cũng không** | không dùng được khi băng; AI cũng không | — | — | **ĐÃ SỬA** (AI) |
| Mọi ụ Tấn công / Hỗ trợ còn lại (tím: `cuongno` `baotuyet` `lienket` `no5` `bao` `anhsang` `tuthan` `nayda` `khoathoigian` `docton` `thaukinh` `santhuong` · vàng: `aten` `dongbo` `railgun` `ngoisao` `soi` `cauvong` `wallgen` `hydra` `cuuvi` `luoicheo` `nemesis` `nhatthuc` `marionette` `hasao`) | bắn / buff | ngừng; hỗ trợ không buff ô đá; Star Cannon vẫn đếm sao của đá (đá vẫn là ★ trên bàn) | ngừng tới khi tan (7 s) | — | — | khớp |

## Chỗ hiển thị đã cập nhật
- Kéo ụ: ô đá / băng ghép được **sáng như ô hợp lệ** (dùng chung `hopLeGhep` → `keoghep.js`, `ghepfx.js`, `render.js`), nhãn "Special merge", huy hiệu xem trước sao.
- Chữ: Merge King, Teleporter (bảng chạm + trang ụ), trạng thái STONE, mô tả Janus Cube, dòng "Stone" trên trang ụ.
- ONLINE: hành động `gh` gửi kèm cờ đá (`da`) → bàn đồng đội trên máy kia cũng là đá (tất định, không quay ngẫu nhiên thêm).

## Dải khung
- `dai-mk-da-ghep-da.png`: Merge King lên đá 2★ → đá 3★ → kéo đá 3★ lên đá 3★ → khối đá 4★.
- `dai-teleporter-da.png`: Teleporter đổi chỗ với ô đá.
- `dai-mk-bang-copycat-da.png`: Merge King lên ô băng → băng 4★; Copycat lên đá: ô không sáng, thả không đổi.
