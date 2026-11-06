# Bảng cộng hưởng kỹ năng đặc biệt × nhau (06/11/2026)

Nối tiếp [../conghuong/BANG.md](../conghuong/BANG.md) (kỹ năng × ô ĐÁ / BĂNG, đã xong — không làm lại). Nguồn DCDW: [DCDW-COMBO.md](DCDW-COMBO.md).
Kiểm tự động: `tools/thap-kt-conghuong2.js` (nằm trong `tools/thap-kt-hoiquy.js`). "Hiện tại" = đọc code + chạy thử trong trình duyệt (bàn dựng tay, gọi `ghep`).
**Chữ đậm = đã sửa lần này.**

## Luật nền (giữ)
- Ghép THƯỜNG: 2 ụ cùng loại + cùng sao (Mimic: bất kỳ) → ụ ngẫu nhiên +1★; chạy kỹ năng "khi ghép" của cả 2 nguyên liệu, mỗi kỹ năng 1 lần.
- Ghép ĐẶC BIỆT (`ghepDB`, kỹ năng của ụ KÉO): Merge King (+★), Teleporter (đổi chỗ), Copycat (chép), Overclock (+65 % tốc), Scrap Forge (ăn). **Không** chạy kỹ năng "khi ghép" của ụ đích (Twin, Pandora, Combo, Drone…) — vì không phải ghép.
- Ụ sáng khi kéo = `hopLeGhep` (một hàm chung cho bàn, hướng dẫn kéo, ghepfx) → ô sáng luôn khớp luật.

## Bảng
| Combo | Hiện tại (code + thử) | DCDW | Lỗi / lệch? | Sửa |
|---|---|---|---|---|
| Merge King → Copycat-copy / Mimic / Twin / Evolver / Pandora / Combo | +1★ (vàng +2★), giữ loại, giữ bản sao, đồng hồ Evolver giữ | Aurora King +1★ (với ụ đặc biệt: chưa rõ) | không | — |
| Merge King + Merge King | 1 MK +1★, giữ vàng nếu 1 trong 2 vàng | chưa rõ | không | — |
| Merge King → Combo / Twin / Pandora | không đếm COMBO, không sinh đôi, không quay hộp (không phải ghép thường) | chưa rõ | không (nhất quán) | — |
| **Copycat → Merge King vàng / Sói thức tỉnh** | **trước: bản sao quay lại 10 % vàng / 30 % thức tỉnh (thử: 4/20 vàng, 8/20 thức tỉnh)** | Shamash chép Sói thức tỉnh → ra Sói thức tỉnh (DC#16750) | **lệch DCDW + online không tất định** | **bản sao giữ đúng dạng ụ gốc (vàng / thức tỉnh / không)** |
| **Copycat đang có buff Aurora (Mimic) / Overclock → chép** | **trước: bản sao mất buff** | "Sói thức tỉnh có buff Aurora" (DC#16750) | **lệch** | **bản sao giữ Aurora + Ép Xung của thân Copycat** |
| Copycat → Mimic / Twin / Evolver / Star Cannon / hỗ trợ | ra bản sao loại đó (−50 % sát thương), kỹ năng đầy đủ; Evolver-copy tự đếm giờ | Shamash "biến" thành Child trong bộ | không | — |
| Copycat → Copycat | không được | chưa rõ | giữ | — |
| Overclock → bản sao | được (+65 % tốc) | chưa rõ | không | — |
| Scrap Forge ăn Merge King / Copycat ≤3★ | được (+lò) | (mới) | không | — |
| Mimic + Twin / Mimic + Combo / Mimic + Pandora | Twin gọi đúng 1 ụ; COMBO +1; Pandora quay | chưa rõ | không | — |
| Twin / Cloner / Pandora "sao" → Star Cannon, Sync Cannon | đếm tức thì (tính lại mỗi khung) | 다비 đếm tổng ★ | không | — |
| **Teleporter → xếp bingo Railgun** | đổi chỗ → bingo tính lại ngay (thử: 4/5 → 5/5) | Merlin dùng để xếp bingo 제거티 | không | thêm kiểm + dải khung |
| Teleporter → Chain Link / Resonance Grid / Sync Cannon / ô kề hỗ trợ | tính lại theo ô mới mỗi khung | Merlin dời ụ | không | — |
| **Ô ĐÁ trong hàng / cột Railgun** | **trước: đá Railgun vẫn tính bingo (thử: 5/5 dù 1 ô đá)** | đá "chỉ chiếm ô", không phải Child | **lệch** (Resonance Grid & Sync Cannon đã bỏ qua đá, Railgun thì không) | **đá không tính bingo** |
| **Ô ĐÁ trong Chain Link** | **trước: đá nối chuỗi (thử: chuỗi 3 qua ô đá)** | như trên | **lệch** | **đá cắt chuỗi**; Súng Bão: Bão đá không làm chậm Bão kề |
| **Star Breaker (`hasao`) "ghép cạnh nó → bùng tốc"** | **trước: Copycat / Overclock / Forge cạnh nó cũng bùng (Copycat còn bùng nhầm ụ GỐC)** | Giltine: chưa rõ | **lỗi** (không phải ghép) | **chỉ ghép thường + Merge King nâng sao** |
| Werewolf / Nine-Tail / Forge: bộ đếm khi nâng sao, dời chỗ, chép | MK nâng sao: giữ (giet, duoi, lo); Teleporter: giữ; bản sao: bộ đếm về 0 (thân mới) nhưng giữ dạng; ghép thường: ụ mới về 0 | ghép: chưa rõ | không | — |
| Chỉ huy REINFORCE / Eve × kỹ năng | REINFORCE bỏ qua đá, Eve tẩy đá/băng | — | không | — |
| **Trùm Mad Crown biến ụ** | **trước: ụ mới không chạy hook sinh (MK không quay vàng, Sói không 30 % thức tỉnh, Nine-Tail không khởi tạo)** | Mad Clown: chưa rõ | **lỗi** | **chạy hook sinh bằng RNG trùm (tất định, 2 máy như nhau)** |
| Trùm Joker King ép ghép bằng Mimic | ghép thường → kỹ năng khi ghép chạy | chưa rõ | không | — |
| Trùm Nightmare / Star Leech × ụ đặc biệt | bỏ qua đá; −1★ / lấy sao | chưa rõ | không | — |
| **ONLINE: ghép đặc biệt trên bàn con rối** (Teleporter, Copycat, Overclock, Forge, MK lên ụ khác loại) | **trước: bàn con rối chạy như GHÉP THƯỜNG → Teleporter làm MẤT ụ kia (tới ảnh chụp 1 s sau), Copycat mất bản sao, Overclock mất +65 %, MK lên Orbital/Drone/Pandora/Chrono Lock chạy kỹ năng khi ghép THỪA (phóng drone, quay hộp…)** | — | **lỗi lệch máy** | **gói 'gh' có `db` + trạng thái đúng 2 ô; con rối chạy đúng kỹ năng (hình) rồi chốt theo máy bạn** |
| **ONLINE: Pandora** | **trước: con rối tự quay → 2 máy ra phép khác nhau (vd. máy này "đóng băng", máy kia "+1★ cho đồng đội")** | — | **lỗi** | **gửi phép đã quay (`pd`), con rối mở đúng phép** |
| **ONLINE: ảnh chụp bàn sửa lệch** | **trước: lệch sao → tạo ụ MỚI (mất đá, bản sao, ép xung, vàng)** | — | **lỗi** | **cùng loại chỉ sửa sao; ảnh chụp có thêm cờ ô (`f`) → đá / bản sao / ép xung / lò / dạng khớp máy bạn** |
| **ONLINE: triệu hồi Sói / MK** | **trước: con rối không biết thức tỉnh / vàng** | — | **lỗi hiển thị** | **'tr' mang `vg` / `th`** |
| **ONLINE: Hộp Bí Ẩn / Evolver trên bàn con rối** | **trước: con rối tự mở ra ụ NGẪU NHIÊN khác máy bạn, ảnh chụp sửa lại sau** | — | **lỗi nháy ụ sai** | **con rối chờ ảnh chụp** |
| ONLINE: Twin Maker | đã gửi `tw` (giữ) | — | không | — |
| ONLINE: kỹ năng chủ động đỏ (Genesis…) có ngẫu nhiên | con rối chạy lại 'cd' với RNG riêng → ảnh chụp sửa trong ≤ 1 s (nay giữ cờ) | — | còn lệch ngắn | ghi lại, chưa sửa (cần gửi kết quả từng ô) |

## Chữ (bảng chạm, tiếng Anh)
- Copycat: "…becomes a copy (−50% damage) · keeps its form (Awakened, Gold) and the Copycat's own buffs".
- Railgun: "(stones don't count)" · Chain Link: "(stones break the chain)".

## Dải khung (390×844 DPR 3, kéo chạm thật)
- `dai-copycat-soi-thuctinh.png` — Copycat lên Sói thức tỉnh → bản sao thức tỉnh.
- `dai-teleporter-bingo.png` — Teleporter đưa Railgun vào hàng giữa → 5/5 bingo.
- `dai-da-pha-bingo.png` — 1 ô đá giữa hàng 5 Railgun → 4/5; Merge King nâng ô đá (vẫn đá, vẫn 4/5).
- `dai-copycat-mk-vang.png` — Copycat chép Merge King vàng → bản sao vàng nâng Pháo 2★ → 4★.
- `dai-starbreaker-ghep-that.png` — Copycat cạnh Star Breaker không bùng; Merge King cạnh nó bùng tốc.
