# Hoạt hình cử động cho quái và trùm: báo cáo

Mọi hình đều lấy từ bản chốt (`docs/phac-thao/quai-ban-chot/`), giữ nguyên nét vẽ. Máy hoạt hình cắt từng con thành các bộ phận (càng, chân, đuôi, mũ nấm, cành cây…) rồi cho từng bộ phận xoay, uốn, nhún theo thời gian. Lúc đứng yên, hình giống hệt bản chốt.

Tổng cộng **36 con**: 24 quái thường, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng.

## Ảnh để duyệt (trong thư mục này)

| Tệp | Nội dung |
|---|---|
| `quai-bien.gif/png` | Hang biển: 8 quái thường + 2 tinh anh (hai tinh anh nay có ô to riêng, hết bị cắt) |
| `quai-rung.gif/png` | Rừng già: 8 quái thường + 2 tinh anh |
| `quai-lau-dai.gif/png` | Lâu đài cổ: 8 quái thường + 2 tinh anh |
| `trum-nho.gif/png` | Ba trùm nhỏ: Cua Đá, Nấm Chúa, Hổ Lửa |
| `ngu-tinh.gif/png`, `moc-tinh.gif/png` | Trùm vùng: toàn bộ cử động, từ pha 1 qua pha 2, pha 3 đến lúc chết |
| `ho-tinh.gif/png` + `ho-tinh-pha.gif` | Hồ Tinh: GIF thứ nhất là pha 1 và cái chết; GIF thứ hai là chuyển pha, pha 2, pha 3 (chia đôi cho mỗi tệp dưới 4MB) |
| `tam-huong.gif/png` | Một đòn đánh theo 8 hướng, kể cả hướng chéo |

Tệp GIF là hình động; tệp PNG là bảng khung hình tĩnh (mỗi cử động vài khung) để soi kỹ.

## Tên cử động (tên `anim` dùng trong game)

Gọi: `G.monsterArt.draw(c, id, x, y, {anim, t, face, dir, phase, hit})`. `t` là số giây từ lúc bắt đầu cử động, `dir` là góc đòn (0 = sang phải, π/2 = xuống). `G.monsterArt.dur(id, anim)` cho biết cử động dài bao nhiêu giây.

| Tên anim | Nghĩa | Lặp? |
|---|---|---|
| `idle` | Đứng thở | lặp |
| `move` | Di chuyển | lặp |
| `tele` | Báo trước đòn (vùng đỏ trên sàn đầy dần, chớp sáng lúc sắp đánh) | không |
| `atk` | Ra đòn | không |
| `hit` | Trúng đòn (chớp trắng, giật lùi) | không |
| `die` | Chết | không |
| `spawn` | Xuất hiện | không |
| `chieu1`, `chieu2` | Chiêu riêng (tinh anh có 1, trùm nhỏ có 2) | không |
| `intro` | Ra mắt (trùm vùng) | không |
| `c1` … `c5` | Năm chiêu của trùm vùng. Mỗi chiêu tự gồm ba đoạn: báo trước → ra đòn → dư âm. Mốc chuyển đoạn nằm ở `G.monsterArt.list[..].anims[..].moc` (ví dụ `[.4, .62]`: 40% đầu là báo trước, tới 62% là ra đòn, còn lại là dư âm) | không |
| `phase2`, `phase3` | Chuyển pha: gồng mình, chớp trắng, hình đổi sang pha mới ở giữa cử động, gầm lên | không |
| `stun` | Choáng (lảo đảo, sao vàng quay quanh đầu) | lặp |

Trùm vùng cần truyền `phase: 1 | 2 | 3` để vẽ đúng hình của pha.

## Từng con

### Hang biển (đã duyệt kiểu từ trước)

| Con | Ra đòn | Xuất hiện | Chết | Chiêu riêng |
|---|---|---|---|---|
| Cua Lính | chém càng | chui lên từ cát | vỡ băng | |
| Bầy Cá Con | lao cả bầy | nổi lên từ nước | tan bụi nước | |
| Ốc Mượn Hồn | chém càng to | chui lên từ cát | vỡ | |
| Hải Quỳ | ném bong bóng | mọc lên | tan | |
| Cá Chuồn | lao dài | nổi lên từ nước | tan bụi nước | |
| Cá Nóc | bắn gai toả tròn | nổi lên từ nước | nổ | |
| Sứa Bom | nổ | nổi lên từ nước | nổ | |
| Nhím Biển | bắn gai | chui lên từ cát | vỡ | |
| Cua Tướng (tinh anh) | chém càng | chui lên từ cát | vỡ băng | **kẹp chéo**: hai càng chém chéo hình chữ X |
| Cá Nóc Chúa (tinh anh) | gai toả tròn | nổi lên từ nước | nổ | **gai xoáy**: hai đợt gai băng toả tròn lệch nhau |

### Rừng già

| Con | Ra đòn | Xuất hiện | Chết | Chiêu riêng |
|---|---|---|---|---|
| Heo Rừng Con | lao húc, bờm dựng | xông ra từ đám bụi | rã xuống đất | |
| Bầy Ong Vò Vẽ | cả bầy lao chích, cánh vẫy nhanh | bay tới | rơi tan | |
| Bọ Hung Mai Cứng | giơ mai rồi đập xuống | đào đất chui lên | vỡ mai | |
| Hoa Phun Bào Tử | há miệng bắn viên bào tử | mọc lên | héo rũ | |
| Chồn Bóng | lao vụt để lại bóng tím | hiện ra từ bóng tối | hồn tím bay lên | |
| Nấm Phồng | phồng to (đổi sang hình phồng) rồi nổ khí độc | bào tử tụ lại | nổ khí độc | |
| Sóc Ném Quả Nổ | ném quả nổ vòng cung | nhảy từ cây xuống | cháy rụi | |
| Nhím Gai Độc | xù gai (đổi sang hình xù) rồi bắn gai | mảnh ghép lại | tan | |
| Heo Rừng Nanh Dài (tinh anh) | lao húc dài | hiện từ sương rừng | gục rồi chìm vào đất | **húc ba lần** zíc zắc |
| Nấm Phồng Chúa (tinh anh) | nổ khí độc lớn | mọc lên | nổ | **mưa bào tử**: 5 quả rơi quanh, để lại khí độc |

### Lâu đài cổ

| Con | Ra đòn | Xuất hiện | Chết | Chiêu riêng |
|---|---|---|---|---|
| Lính Ma Giáp Gỉ | đâm giáo, áo choàng bay | hiện từ khói | hồn lửa bay lên | |
| Bầy Dơi Than | cả bầy sà xuống | bay tới | tan thành tro | |
| Tượng Đá Cầm Khiên | đập khiên xuống đất | đá ghép lại | vỡ đá | |
| Đèn Lồng Ma | phun cầu lửa | đèn bén lửa sáng lên | cháy rụi | |
| Mèo Đen Hai Đuôi | cào vụt | hiện từ bóng | tan | |
| Hũ Lửa Sống | phồng to rồi nổ, lửa cháy trên sàn | rơi xuống | nổ | |
| Tiểu Yêu Ném Pháo | ném pháo vòng cung | hiện trong tiếng nổ | rã thành tro | |
| Nhím Than Hồng | xù gai đỏ rồi bắn gai lửa | chui lên từ than | nguội thành than xám | |
| Tướng Ma (tinh anh) | chém đại đao | hiện từ trên xuống | chìm xuống, lửa cháy quanh | **đao xoáy**: xoay hai vòng chém quanh mình |
| Hũ Lửa Chúa (tinh anh) | nổ lửa, vương miện nảy | nổ ra | nổ | **vòng cầu lửa**: hai đợt cầu lửa toả tròn |

### Ba trùm nhỏ (7 cử động + 2 chiêu)

| Trùm | Chiêu 1 | Chiêu 2 |
|---|---|---|
| Cua Đá | **đập càng rung sàn**: sàn nứt, sóng chấn động lan ra (chạy ra ngoài vòng đỏ) | **mưa tinh thể**: tinh thể trên lưng bắn lên rồi cắm xuống 5 chỗ |
| Nấm Chúa | **hàng nấm độc**: nấm mọc vọt nối nhau theo hướng bé, phụt khí độc | **bão bào tử**: hai đợt bào tử toả tròn và vòng khí độc |
| Hổ Lửa | **vồ lửa**: chồm tới một đường dài, để lại vệt lửa trên sàn | **gầm phun lửa**: phun lửa hình quạt rộng |

### Ba trùm vùng

Mỗi trùm: ra mắt, đứng thở, di chuyển, 5 chiêu (đều có báo trước, ra đòn, dư âm), chuyển pha 2, chuyển pha 3, choáng, trúng đòn, chết hoành tráng (rung dữ, nổ lốp bốp khắp thân, tia sáng toả, chớp trắng rồi tan).

| Trùm | Ra mắt | 5 chiêu | Chết |
|---|---|---|---|
| **Ngư Tinh** | bọt nổi, cá trồi lên giữa cột nước, há miệng gầm | c1 đớp (lao tới đớp); c2 sóng thần (bức tường nước chạy theo hướng bé); c3 phun băng (quạt băng, sàn mọc gai băng rồi vỡ); c4 mưa băng nhọn (băng rơi thẳng xuống 7 chỗ); c5 xoáy nước (xoáy quanh thân rồi bung vòng sóng) | chìm xuống nước (pha 3: vỡ băng) |
| **Mộc Tinh** | đất nứt, rễ ngoi lên, cây trồi khỏi đất, lá bay | c1 quật cành (vệt lá chém hình quạt); c2 rễ đâm (hàng gai rễ trồi lên nối nhau); c3 mưa quả độc (vỡ thành vũng độc); c4 bùa bay (5 lá bùa bay uốn lượn rồi cháy nổ); c5 rừng gai (ba vòng gai lan ra, chừa bốn khe để né) | héo khô, lá rụng |
| **Hồ Tinh** (dáng rình mồi) | đốm lửa ma tụ thành cáo, chín đuôi xoè ra như quạt, gào | c1 hồ hoả (9 cầu lửa ma từ đầu đuôi bay vòng cung); c2 vồ mồi (vồ hai lần, vết vuốt); c3 quạt đuôi (ba lớp vệt lửa trăng khuyết, sàn cháy xanh); c4 vòng lửa ma (hai vòng cột lửa lệch chỗ nhau); c5 bão hồ hoả (ba đợt cầu lửa toả tròn xoáy) | hoá thành lửa ma bay lên |

- Pha 2 Hồ Tinh: mắt tím (theo bản chốt) và hai bóng cáo mờ màu tím lượn hai bên, có trong mọi cử động.
- Pha 3 Hồ Tinh: to gấp rưỡi (hình bản chốt pha 3), thêm lửa liếm khắp thân.
- Người chơi không nhảy, nên không chiêu nào phủ kín sàn: vùng đỏ luôn có lối chạy ra hoặc khe trống để đứng.

## Tám hướng

Game nhìn từ trên xuống. Hình quái chỉ lật trái/phải theo hướng đòn (nửa phải lật sang phải, còn lại quay trái). Vùng báo trước, vệt chém, đường lao, đạn, lửa phun đều vẽ xoay theo góc `dir` bất kỳ, nên đánh chéo vẫn khớp. Xem `tam-huong.gif`.

## Điểm còn yếu

- **Hồ Tinh**: chín đuôi động liên tục nên GIF rất nặng. Phải tách hai tệp, và tệp chuyển pha chỉ còn 6 khung/giây (trong game vẫn mượt 12 khung/giây).
- **Hướng lên/xuống thẳng**: quái không có hình nhìn từ trước hay sau, chỉ có hình nhìn ngang lật trái/phải, nên đánh thẳng lên hoặc xuống trông hơi nghiêng.
- **Lao tới rồi lùi về**: các cú lao/vồ (Heo Nanh Dài, Hổ Lửa, Hồ Tinh, Ngư Tinh đớp) cho thân lao ra rồi tự lùi về chỗ cũ để xem lặp được. Trong game, nếu muốn quái dừng ở chỗ mới thì game tự dời vị trí và chỉ dùng nửa đầu cử động.
- **Đòn cảm tử** (Nấm Phồng, Hũ Lửa): cuối đòn quái biến mất rồi hiện lại cho dễ xem; trong game thì sau đòn này nên xoá quái.
- **Quái nhỏ trong ảnh duyệt**: hiệu ứng ở một vài con nhỏ (bùa bay, lá rơi, sao choáng) chỉ vài điểm ảnh, xem trong game cỡ thật sẽ rõ hơn ảnh thu nhỏ.
- **Vùng biển**: tám quái thường vùng biển giữ nguyên bộ cử động đã duyệt. Riêng hai tinh anh được thêm chiêu riêng.
- Các con không có bộ phận cắt riêng (Nhím Than Hồng, Cá Chuồn, Cá Nóc, Sứa…) cử động bằng cả thân (nhún, nghiêng, phồng). Nhìn vẫn sống nhưng ít chi tiết hơn những con cử động được chân và càng.

## Cách dựng lại

Mã nguồn nằm trong `nguon/`: `may.js` (máy hoạt hình, chiêu dùng chung), `bien.js`, `rung.js`, `laudai.js`, `trumnho.js`, `ngutinh.js`, `moctinh.js`, `hotinh.js` (cử động từng con), `to.js` + `xem.js` (dàn ảnh duyệt).

- `python3 nguon/ghep.py` ghép lại `game/js/monster_art.js`.
- `python3 nguon/xem.py gif quai-rung` dựng lại một ảnh duyệt.
- `python3 nguon/xem.py dai hoTinh c3 ra.png 150` cho dải khung hình một cử động.
