# Sông sâu — kiểm kê hình tạm, bảng màu vùng, prompt gen gộp (17/10)

Theo `../TU-VAN-CHATGPT-17-10.md` mục 2.2 và việc 3: hoàn thiện hình vùng Sông sâu, ưu tiên **Thuồng Luồng → Cá Trê → 2 tinh anh → 4 quái thường còn lại**.
Prompt cũ, dài, mỗi hàng một tin: `docs/ke-hoach/buoc-3/KE-HOACH.md` (A1–A15, C1–C85). Tệp này **gộp** lại theo kiểu `../gen-gop/GEN-GOP.md`:
mỗi ảnh nhiều HÀNG, phiên cắt tách theo hàng rồi theo khung. Gộp hỏng (hàng lệch cỡ, lệch đường chân) thì gen lại riêng hàng đó bằng prompt cũ.

## 1. Kiểm kê: cái gì còn là hình tạm

| Thứ | Mã trong game | Hiện đang là | Người chơi thấy ở |
|---|---|---|---|
| **Thuồng Luồng** (trùm vùng, 3 pha) | `thuongLuong` | Ảnh **Ngư Tinh** (con mực) nhuộm xanh / băng / đỏ theo pha | Ải 4-5, cả trận |
| Thân trồi vòm, đuôi quét, thân siết mép sân | (vẽ code trong `js/thuong_luong.js`) | Hình vẽ code | Ải 4-5 |
| Xoáy, gợn nước, tảng băng / gỗ cháy trôi, mảnh đồng rơi, cảnh bỏ trốn (nhả mảnh trống, ngoạm mảnh mặt trời, vây lưng lặn đi) | (vẽ code) | Hình vẽ code | Ải 4-5 |
| **Cá Trê Râu Roi** (trùm nhỏ, 2 pha) | `caTre` | Ảnh **Cua Đá** nhuộm nâu đen (pha 2 nhuộm cam) | Cuối ải 4-1 → 4-4 |
| **Rái Cá Thủ Lĩnh** (tinh anh) | `raiCaChua` | Ảnh **Tướng Ma** nhuộm nâu | Ải 4-3, 4-5 |
| **Cóc Tía Chúa** (tinh anh) | `cocChua` | Ảnh **Nấm Phồng Chúa** nhuộm tím | Ải 4-4, 4-5 |
| Rắn Nước Sọc | `ranNuoc` | Ảnh Chồn Bóng nhuộm xanh lá | Từ ải 4-1 |
| Ếch Phình Hơi | `echPhinh` | Ảnh Cá Nóc nhuộm xanh | Từ ải 4-2 |
| Ma Da Tóc Rong | `maDa` | Ảnh Tiểu Yêu nhuộm | Từ ải 4-3 |
| Trai Sông Gai | `traiGai` | Ảnh Ốc Mượn Hồn nhuộm nâu xám | Từ ải 4-3 |
| Bản đồ trang 2 (Sông sâu) | `gd-ban-do-song` | Tranh vẽ code | Bản đồ Chú Lái Đò |
| Cảnh truyện kết vùng | nền `b7` | Chưa có ảnh (dùng lại nền khác) | Về làng sau khi hạ Thuồng Luồng |

**Đã có ảnh thật** (không cần làm): Rái Cá, Bầy Đỉa Trâu, Ba Ba, Cóc Tía; sàn / tường / cửa / trang trí / dòng chảy / cầu / lục bình / đèn dầu Sông sâu; sân Thuồng Luồng
(`gd-nen-song-san-tl`); ảnh Ngư Tinh xuất hiện. Hình tạm hiện tại của từng con: `../con-ve-tay-8/mau/quai-<mã>-hien-tai.png`.

## 2. Bảng màu vùng Sông sâu (7 màu) — `mau/bang-mau-song.png`

| # | Màu | Tên | Dùng cho |
|---|---|---|---|
| 1 | `#1A2624` | Đen nước sâu | Nước sâu, bóng tối, viền ngoài cảnh (viền nhân vật vẫn `#14182e` chung cả game) |
| 2 | `#365B55` | Xanh bùn | Tường, bờ, thân tối của quái (ChatGPT gợi ý) |
| 3 | `#4E8F91` | Xanh nước | Mặt nước, dòng chảy, thân sáng của quái nước (ChatGPT gợi ý) |
| 4 | `#8A7A4C` | Bùn cát | Sàn bãi bồi (đúng tông sàn đang có) |
| 5 | `#F2C66D` | Vàng đèn dầu | Điểm nhấn: đèn, mắt quái thường, ánh mảnh trống (ChatGPT gợi ý) |
| 6 | `#66508A` | Tím trầm | Độc: Cóc, lục bình, vệt độc pha 1 (ChatGPT gợi ý) |
| 7 | `#5FF0FF` | Lam phát sáng | **Chỉ** mắt Thuồng Luồng và chỗ điểm yếu — để người chơi nhìn là biết |

Luật kèm (để quái không chìm vào sàn, mục 2.1 của tư vấn): mảng thân lớn nhất của quái **sáng hơn sàn ít nhất 30–40 mức** (sàn Sông sâu nằm khoảng 40–140),
nên thân quái dùng tông sáng của màu 3 / 4 / 6 kèm viền tối `#14182e`; không dùng màu 1–2 làm mảng thân lớn. Mỗi con tối đa ~16 màu, không chuyển sắc hạt.
Thêm câu này vào cuối mọi prompt dưới đây (đã ghi sẵn là **[MÀU]**):
`Use this river palette: deep water #1A2624, mud green #365B55, water teal #4E8F91, mud sand #8A7A4C, lamp gold #F2C66D, dusky purple #66508A; keep the body clearly brighter than a dark green-brown floor.`

## 3. Prompt gộp (theo thứ tự ưu tiên)

Quy ước chung cho mọi tấm: nền phẳng `#00FF00`, không chữ, không bóng, nhìn nghiêng / chếch 3/4 quay sang PHẢI, mỗi hàng cùng cỡ con, chân (hoặc mặt nước) cùng một đường.
Ảnh nộp đặt đúng đường dẫn ghi ở từng mục. Ảnh mẫu kiểu vẽ chung: `docs/review/ke-hoach-cai-thien/tu-van-17-10-nen-song/mau/quai-song-4-con.png` (4 quái Sông sâu đã có).

### Ưu tiên 1 — Thuồng Luồng (8 ảnh thay 18 tấm cũ)

**TL0 · mẫu 3 pha** → `docs/anh-goc/trum-moi/thuong-luong-3-pha.png` (phiên cắt ra `thuong-luong-p1/p2/p3.png`)
Gửi kèm: `docs/anh-goc/trum-moi/ngu-tinh-p1.png` (cỡ, nét), `docs/anh-goc/truyen/b2b-bong-duoi-song.png` (dáng con rắn), `.../tu-van-17-10-nen-song/mau/bang-mau-song.png`
```
Pixel art boss sheet, same style and scale as the first image. One row, 3 poses of the same giant Vietnamese river serpent (thuong luong) from the second image: no wings, thick body rising from dark water in a tall S-curve, saw-tooth back fin, pale belly, glowing cyan eyes, a bronze drum shard on its forehead. Pose 1 POISON: dark green-black, purple poison drips. Pose 2 ICE: frosty blue scales, cold mist. Pose 3 FIRE: drum shard red-hot, ember cracks, steam. Facing right. [MÀU] Flat #00FF00 background, no text, no shadow.
```

**TL1 · pha 1: đứng / báo đòn / đánh** → `docs/anh-goc/trum-moi/thuong-luong/gop-p1-a.png` (hàng 1 → `1-dung`, 2 → `3-bao-don`, 3 → `4-danh`)
Gửi kèm: `thuong-luong-p1.png` (cắt từ TL0)
```
Redraw the exact serpent in the attached image. Pixel art sprite sheet, 3 rows x 6 frames, facing right, same size every frame, waterline at the same height. Row 1 idle: coils sway, head bobs. Row 2 wind-up: rears its head back, mouth opens, eyes flare. Row 3 attack: lunges forward and bites down, then pulls back. Frames far apart. Flat #00FF00 background, no text, no shadow.
```

**TL2 · pha 1: bơi / trúng đòn / lặn** → `.../thuong-luong/gop-p1-b.png` (hàng 1 → `2-di`, 2 → `5-trung-don` 4 khung, 3 → `6-lan`)
Gửi kèm: `thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image. Pixel art sprite sheet, facing right, same size every frame, waterline at the same height. Row 1 (6 frames): swims forward, body rolling through the water. Row 2 (4 frames): recoils, eyes squeezed, then rises again. Row 3 (6 frames): dives into the water until only ripples remain. Frames far apart. Flat #00FF00 background, no text, no shadow.
```

**TL3 · pha 2 Băng: 4 hàng** → `.../thuong-luong/gop-p2.png` (hàng 1–4 → `p2-1-dung`, `p2-2-bao-don`, `p2-3-danh`, `p2-4-trung-don` 4 khung)
Gửi kèm: `thuong-luong-p2.png`
```
Redraw the exact frost serpent in the attached image. Pixel art sprite sheet, facing right, same size every frame, waterline at the same height. Row 1 (6): idle, coils sway in cold mist. Row 2 (6): rears back, icy breath gathers in the mouth. Row 3 (6): lunges and bites, frost burst. Row 4 (4): recoils, frost cracks, rises. Flat #00FF00 background, no text, no shadow.
```

**TL4 · pha 3 Lửa: 4 hàng** → `.../thuong-luong/gop-p3.png` (hàng 1–4 → `p3-1-dung`, `p3-2-bao-don`, `p3-3-danh`, `p3-4-trung-don` 4 khung)
Gửi kèm: `thuong-luong-p3.png`
```
Redraw the exact fire serpent in the attached image. Pixel art sprite sheet, facing right, same size every frame, waterline at the same height. Row 1 (6): idle, drum shard pulsing red. Row 2 (6): rears high, drum shard blazing. Row 3 (6): slams its head down, sparks fly. Row 4 (4): recoils, embers scatter, rises. Flat #00FF00 background, no text, no shadow.
```

**TL5 · bỏ trốn (riêng, vì là cảnh truyện)** → `.../thuong-luong/thuong-luong-p3-5-bo-tron.png`
Gửi kèm: `thuong-luong-p3.png`. Dùng nguyên prompt C85 trong `docs/ke-hoach/buoc-3/KE-HOACH.md`.

**TL6 · thân và đuôi (thay phần vẽ code)** → `docs/anh-goc/trum-moi/thuong-luong/gop-than.png`
Gửi kèm: `thuong-luong-3-pha.png` (TL0)
```
Pixel art parts of the serpent in the attached image, top-down 3/4 view, 4 rows x 4 frames. Rows 1-3: one body coil rising out of water as an arch, then squeezing tight (row 1 poison colors, row 2 ice colors, row 3 fire colors). Row 4: the tail tip rising from water and sweeping sideways with a splash. Same scale as the attached boss. Flat #00FF00 background, no text, no shadow.
```

**TL7 · vật của chiêu** → `docs/anh-goc/trum-moi/thuong-luong/gop-vat.png` (thứ tự trái → phải ghi trong prompt)
Gửi kèm: `docs/anh-goc/vung-4/mau/icon-manh.png` (mảnh trống đang có trong game), `mau/bang-mau-song.png`
```
Pixel art game objects, top-down 3/4 view, one row each, small sizes (24-40 px). Row 1: a red-hot bronze drum shard falling (3 frames) then lying on the ground glowing (1 frame). Row 2: a drifting ice block, a drifting burning log, a dark back fin cutting through water (2 frames). Row 3: a small drum rim piece with a flying Lac bird pattern, a big round sun-centre drum piece shining gold. [MÀU] Flat #00FF00 background, no text, no shadow.
```

### Ưu tiên 2 — Cá Trê Râu Roi (4 ảnh thay 12 tấm)

**CT0 · mẫu 2 pha** → `docs/anh-goc/trum-moi/ca-tre-2-pha.png` (cắt `caTre-mau-moi.png` + `ca-tre-p2.png`)
Gửi kèm: `docs/anh-goc/trum-moi/cua-da-p1.png` (cỡ trùm nhỏ, nét), `mau/quai-song-4-con.png`
```
Pixel art mini-boss, same style and scale as the first image. One row, 2 poses of a big black Vietnamese walking catfish crawling on mud: flat wide head, 4 long whip-like whiskers, pale belly, small mean eyes. Pose 1 calm. Pose 2 ANGRY: red eyes, whiskers glowing orange, mud bubbling, spikier fins. Side view facing right. [MÀU] Flat #00FF00 background, no text, no shadow.
```

**CT1 · pha 1 hàng 1–3** → `docs/anh-goc/trum-moi/ca-tre/gop-p1-a.png` (`1-dung`, `2-di`, `3-bao-don`) · **CT2 · pha 1 hàng 4–6** → `.../ca-tre/gop-p1-b.png` (`4-danh`, `5-trung-don` 4 khung, `6-chet`)
Gửi kèm: `caTre-mau-moi.png`
```
Redraw the exact catfish in the attached image. Pixel art sprite sheet, 3 rows, facing right, same size every frame, belly on the same ground line. <HÀNG>. Frames far apart. Flat #00FF00 background, no text, no shadow.
```
CT1 `<HÀNG>` = `Row 1 (6): idle, whiskers swaying, gills pulsing. Row 2 (6): wriggles forward on its belly. Row 3 (6): lifts its head, whiskers curl back ready to whip`.
CT2 `<HÀNG>` = `Row 1 (6): whips all 4 whiskers out in an X, then dives into mud. Row 2 (4): flinches, pale belly flashes. Row 3 (6): flops over, sinks into mud, fades`.

**CT3 · pha 2: 4 hàng** → `.../ca-tre/gop-p2.png` (`p2-1-dung`, `p2-2-bao-don`, `p2-3-danh`, `p2-4-trung-don` 4 khung). Gửi kèm `ca-tre-p2.png`. Prompt như TL3, thay "frost serpent" bằng "angry catfish",
hàng: `idle with glowing whiskers / whiskers spin up like a wheel / whiskers spin a full circle / flinches, rises`.

### Ưu tiên 3 — 2 tinh anh (5 ảnh thay 14 tấm)

**TA0 · mẫu 2 con** → `docs/anh-goc/quai-moi/tinh-anh-song-mau.png` (cắt `raiCaChua-mau-moi.png`, `cocChua-mau-moi.png`)
Gửi kèm: `mau/quai-song-4-con.png` (Rái Cá và Cóc Tía thường — tinh anh phải nhìn ra "anh lớn" của chúng), `docs/anh-goc/quai-moi/tuongMa-mau-moi.png` (cỡ tinh anh)
```
Pixel art elite monsters, same style as the first image, scale of the second image. One row, 2 designs, 3/4 top-down view facing right. Left: OTTER CHIEF, a big otter like the small otter in the first image, torn conical straw hat, fishing net over one shoulder, holding a bamboo torch with fire. Right: TOAD KING, a giant purple toad like the toad in the first image, yellow warts, crown-like crest, sitting on a big lotus leaf. [MÀU] Flat #00FF00 background, no text, no shadow.
```

**TA1, TA2 · Rái Cá Thủ Lĩnh** → `docs/anh-goc/quai-moi/dong-tac/raiCaChua-gop-a.png` (`1-dung`, `2-di`, `3-bao-don`), `...-gop-b.png` (`4-danh`, `5-trung-don` 4 khung, `6-chet`)
Gửi kèm: `raiCaChua-mau-moi.png`, `docs/review/ke-hoach-cai-thien/tu-van-17-10-nen-song/mau/raiCa-tam-sach.png` (cách xếp hàng của con thường)
```
Redraw the exact otter chief in the attached image. Pixel art sprite sheet, 3 rows x 6 frames (the hit row 4 frames), facing right, same size every frame, feet on one ground line. <HÀNG>. Frames far apart. Flat #00FF00 background, no text, no shadow.
```
TA1 `<HÀNG>` = `Row 1: idle, torch flickering. Row 2: walks forward, net swaying. Row 3: swings the net back, ready to throw`.
TA2 `<HÀNG>` = `Row 1: throws the fishing net wide, then sweeps the torch in a fiery cone. Row 2 (4 frames): flinches, hat tilts. Row 3: falls, torch goes out, fades`.

**TA3, TA4 · Cóc Tía Chúa** → `.../dong-tac/cocChua-gop-a.png`, `...-gop-b.png` (cùng thứ tự hàng). Gửi kèm `cocChua-mau-moi.png`, `mau/raiCa-tam-sach.png`. Prompt như trên, "toad king":
TA3 `<HÀNG>` = `Row 1: idle on the lotus leaf, throat pulsing. Row 2: hops forward with the leaf. Row 3: inflates its throat, tongue ready`.
TA4 `<HÀNG>` = `Row 1: shoots its long tongue straight, then stomps the lotus leaf. Row 2 (4 frames): squashes, pops back. Row 3: deflates and sinks under the leaf, fades`.

### Ưu tiên 4 — 4 quái thường còn lại (9 ảnh thay 28 tấm)

**Q0 · mẫu 4 con** → `docs/anh-goc/quai-moi/quai-song-mau-2.png` (cắt `ranNuoc-`, `echPhinh-`, `maDa-`, `traiGai-mau-moi.png`)
Gửi kèm: `mau/quai-song-4-con.png`
```
Pixel art monster designs, same style and size as the attached 4 river monsters, 3/4 top-down view facing right, one row of 4: a green water snake with yellow stripes and big eyes; a round green frog puffed like a balloon with blue spots; a cute pale-green river imp with long seaweed hair over one eye, round confused eyes (funny, not scary); a big river mussel with a spiky rough shell and a glowing pearl inside. [MÀU] Flat #00FF00 background, no text, no shadow.
```

**Q1–Q8 · mỗi con 2 ảnh** → `docs/anh-goc/quai-moi/dong-tac/<mã>-gop-a.png` (`1-dung`, `2-di`, `3-bao-don`) và `<mã>-gop-b.png` (`4-danh`, `5-trung-don` 4 khung, `6-chet`).
Gửi kèm: `<mã>-mau-moi.png`, `mau/raiCa-tam-sach.png`. Khung prompt như TA1. Hàng (lấy theo chiêu đang chạy trong `js/ky_nang_quai.js`):

| Mã | `-gop-a` (đứng · đi · báo đòn) | `-gop-b` (đánh · trúng đòn · chết) |
|---|---|---|
| `ranNuoc` | coiled, head raised · slithers in S-curves · pulls into a tight S | dives as a ripple then strikes up · body folds · stretches out and fades |
| `echPhinh` | puffing gently · bounces forward · swells huge, skin glowing | jumps and bursts into a cold splash · squashes · deflates flat, fades |
| `maDa` | sways, hair dripping · shuffles forward · lifts a water gourd | throws the gourd · flinches, hair flips · melts into a puddle |
| `traiGai` | shell closed, breathing · shuffles on its foot · opens wide, pearl glows | snaps open and shoots 5 pearls in a fan · shell shakes shut · shell cracks, fades |

## 4. Tổng số ảnh và thứ tự gửi

| Ưu tiên | Ảnh gộp | Thay cho (tấm cũ) |
|---|---|---|
| 1 Thuồng Luồng | TL0–TL7: 8 | A13–A15 + C71–C85 (18) + phần vẽ code |
| 2 Cá Trê | CT0–CT3: 4 | A11, A12 + 10 tấm C |
| 3 Tinh anh | TA0–TA4: 5 | A9, A10 + 12 tấm C |
| 4 Quái thường | Q0 + 8: 9 | A5–A8 + 24 tấm C |
| **Cộng** | **26** | **≈ 70** |

Chưa kịp gen phần nào thì hình tạm vẫn chạy như nay (ảnh mượn nhuộm màu). ChatGPT gợi ý thay ảnh nhuộm bằng **bóng đen thống nhất** cho tới khi có ảnh thật — đây là việc sửa game,
chưa làm ở phiên này; chủ game muốn thì ghi vào lượt sau.
