# Kiếm vuông — thay kiếm cong bằng kiếm mới đầu vuông, cán dài (17/10)

Ảnh chủ game gen: `docs/anh-goc/zed/moi/vk-kiem-vuong.png` (4 cấp: Trắng, Mầm, Thành hình, Thức tỉnh).

**Chờ trước:** phiên "Thử độ nét cao hơn cho Cu Tí" có báo cáo `net-cao/bao-cao.md` lúc 08:13 (chờ khoảng 20 phút, không quá 150 phút) → làm TRÊN nền phiên đó. Phiên "Tư vấn 17/10 – cảm giác đòn kiếm nặng" đẩy lên trong lúc làm → đã gộp (không sửa phần của nó: dừng hình, rung, âm, nhịp); riêng đoạn "nhát 1 mũi trượt qua dưới chân" (`KN_MUOT`, `quetDat`) được thêm bù góc đầu vuông để mũi vuông cũng không lọt đất. Mọi phép so / bot chạy lại trên nền đã gộp.

## Tóm tắt (cho chủ game)

- Cu Tí giờ cầm **kiếm vuông mới** ở **mọi chỗ có kiếm**: đứng / đi / chạy cầm kiếm, combo kiếm nặng 3 nhát, Trảm Nguyệt, hàng kiếm cũ (`?kiemnang=0`), cả 4 bộ trang phục (Ninja, Rừng, Biển, Lâu đài). Hình kiếm trong **HUD, túi đồ, Lò rèn, bảng Luyện, nút vũ khí** cũng đổi theo.
- **Cân bằng KHÔNG đổi:** không sửa dòng nào trong `moves.js` / `combat.js`. Vùng trúng, tầm đánh, sát thương, thời lượng đòn giữ y nguyên. Chỉ đổi HÌNH.
- **Độ dài:** lưỡi (từ chắn tay tới mũi) dài **đúng bằng lưỡi kiếm cũ** cùng cấp (81 / 97 / 113 / 111 điểm ảnh ảnh), nên từ nắm tay tới mũi kiếm trên màn **như cũ**, hình không dài vượt vùng trúng. Cán dài hơn cán cũ (đúng như ảnh gen) nên phần cán thò ra sau tay dài hơn.
- **Cầm:** tay trước nắm **sát chắn tay** ở mọi khung (một tay và hai tay). Ở khung hai tay, tay sau nằm ngay sau tay trước trên cán. Soát cầm vũ khí: **0 lỗi**, 4 cấp.
- **Mũi kiếm không xuyên đất:** chặn đất tính lại theo **góc thấp nhất của đầu vuông**. Bot đo: 0 điểm ảnh lưỡi kiếm dưới mặt đất (kiếm cong cũ có 6 nhịp lọt đất ở đầu nhát 1).
- **Vệt chém kiếm nặng** đặt theo mũi kiếm mới (giữa cạnh đầu vuông).
- **Ảnh theo hệ và ảnh "gân"** (vẽ theo kiếm cong cũ) **tạm tắt cho kiếm**. Kiếm có hệ dùng **nhuộm màu hệ** trên ảnh kiếm vuông. Prompt gen lại: `PROMPT.md`.
- **Cờ tắt: `?kiemvuong=0`** → kiếm cũ **y hệt trước**. Đã so bằng bot: hình Cu Tí **0 điểm ảnh khác** suốt combo, cấp 1 và cấp 4.
- Dung lượng: bản một tệp **29,88 MB** (≤ 30). Người chơi tải **17,76 MB** (≤ 20). Ảnh kiếm mới chỉ 9 KB.

## Đã làm

1. **Cắt + bỏ nền** (`docs/anh-goc/zed/cat-diem-anh.py` → ĐẠT, đúng 4 khung, `moi/vk-kiem-vuong-gif/`).
2. **Thu nhỏ kiểu nét** (`do-net/cong-cu/thu_net.py`, mỗi điểm ảnh lấy một màu có thật, 64 màu, PNG bảng màu) bằng công cụ mới `docs/anh-goc/zed/dung-kiem-vuong.py`. Cùng tỉ lệ ô với tấm vũ khí `zed-vk` (game vẽ ×`vk_tl` như cũ). Kết quả ghi thành mục **`kiem_vuong`** trong `game/art/custom/zed-vk.sprite.json`. **Mọi mục cũ của tệp giữ nguyên** (đã so). `dung-zed-game.py` được sửa để giữ mục này khi dựng lại tấm.

   | Cấp | Ô cũ | Ô mới | Lưỡi cũ → mới (chắn tay → mũi) | Bề dày cán cũ / mới | Cán phía sau nắm tay trước |
   |---|---|---|---|---|---|
   | 1 Trắng | 111×29 | 135×33 | 81 → 81 | 9 / 11 | 45,6 (≈ 10 điểm game) |
   | 2 Mầm | 124×48 | 147×50 | 97 → 97 | 10 / 10 | 41,6 (≈ 9) |
   | 3 Thành hình | 142×68 | 167×81 | 113 → 113 | 10 / 11 | 40,6 (≈ 9) |
   | 4 Thức tỉnh | 140×79 | 151×67 | 111 → 111 | 9 / 8 | 28,6 (≈ 6) |

   (đơn vị: điểm ảnh ô vũ khí; 1 điểm ô ≈ 0,22 điểm game). Ảnh so cũ / mới ×4: `kiem-vuong-x4.png`.
3. **Ghép vào game** (`js/sprite_custom.js`, hàm `ghepKiemVuong`): lúc nạp tấm `zed-vk`, ảnh 4 kiếm mới được dán xuống dưới tấm cũ và ô kiếm 4 cấp trỏ sang ảnh mới. Vì mọi chỗ (trên tay, ô đồ, Lò rèn, Luyện, nút, viền theo bậc ép đồ) đều đọc cùng tấm này, nên đổi một chỗ là đổi khắp nơi. Ảnh rời (bản web) dùng được.
4. **Điểm cầm** (`js/zed_moi.js`, `bienThe` → `kiemVuongB`): mọi hàng cầm kiếm dùng điểm cầm của ảnh mới: cách chắn tay đúng bằng khoảng cũ (nắm tay trước sát chắn tay), giữa bề dày cán. Neo tay, góc, tỉ lệ không đổi.
   - **Hai tay:** neo của 10 khung kiếm nặng đặt tay cầm là tay **phía chắn tay**, tay thứ hai nằm **sau** trên cán. Như vậy tay trước sát chắn tay, tay sau ngay sau nó.
   - **Chỗ chưa đạt ý "tay sau gần chuôi":** thân Cu Tí trong ảnh gen vẽ **hai nắm tay gần như chạm nhau** (cách 1,5–2 điểm game), không được đổi dáng tay. Nên tay sau chỉ ở khoảng giữa cán, còn khoảng 6–8 điểm game cán (có núm chuôi) thò ra sau tay. Muốn hai tay cách xa trên cán dài thì phải gen lại khung thân (prompt (c) trong `PROMPT.md`).
   - **Soát `cam-vk-chuan/soat.py`** (đã cho máy đo hiểu kiếm vuông, mặc định bật; `--kiemvuong=0` đo kiếm cũ): **0 lỗi** mọi hàng kiếm × 4 cấp — đứng 0/32, đi 0/32, chạy 0/48, kiếm 1 0/16, kiếm 2 0/12, kiếm 3 0/12, kiếm đặc biệt 0/24; các vũ khí khác vẫn 0 lỗi. `--kiemvuong=0`: kiếm cũ vẫn 0 lỗi.
5. **Chặn đất** (`js/zed_moi.js`, `datGoc`): đầu kiếm vuông có hai góc (trên / dưới trục cán). Chặn đất và "mũi chạm đất" của kiếm nặng giờ tính theo góc nào đang thấp hơn, với đúng độ dài lưỡi từng cấp.
6. **Vệt chém** (`doiTip`): "mũi" cho vệt = giữa cạnh đầu vuông (hướng + độ dài tới điểm đó). Vệt hất lên / chém ngang co theo hai điểm mũi như cũ; tia lửa lê đất và nổ đất đặt dưới mũi mới. Bán kính vệt gần như cũ vì lưỡi dài bằng lưỡi cũ.
7. **Ảnh theo hệ / gân** (`js/vien_vk.js`): `G.vkHeAnh` và `G.vkGanAnh` trả rỗng cho kiếm khi kiếm vuông đang bật → game nhuộm 30 % màu hệ lên ảnh mới (cơ chế NHUOM sẵn có); kiếm đang "gân" hiện ảnh cấp thường. Thương / búa / phi tiêu không đổi.

## Ảnh soát (thư mục này)

- `luoi-kiem-vuong.png` — combo kiếm nặng 10 khung × 4 cấp, ×3. Hình **thật trong game** (bot), lấy đúng mốc khung, có chặn đất. ★ = khung chạm, vạch xanh = mặt đất, số = điểm ảnh lọt dưới đất.
- `combo-vet-x1.gif`, `combo-vet-x3.gif` — combo 3 nhát có vệt (cắt từ màn trận thật, bot), đúng thời lượng, kiếm cấp 1. `combo-vet-cap4-x3.gif` — cấp 4.
- `truoc-sau-x3.gif` — Cu Tí riêng: trái kiếm cũ (`?kiemvuong=0`), phải kiếm vuông; trên cấp 1, dưới cấp 4.
- `so-hud-tran.png`, `so-tui-do.png`, `so-xem-vk.png`, `so-lo-ren.png`, `so-luyen.png` — trái cũ / phải mới, cấp 1 và cấp 4 (màn 960×540 headless).
- `kiem-vuong-x4.png` — 4 cấp kiếm cũ (trên) / mới (dưới), căn điểm cầm, ×4.
- Dựng lại: `python3 docs/anh-goc/zed/dung-kiem-vuong.py` → build → `soat.py quay …` (hai lần: mặc định và `'&kiemvuong=0'`) → `soat.py anh <tắt.npz> <mới.npz>`; `python3 chup.py`.

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,88 MB** / 30; người chơi tải **17,76 MB** / 20 |
| Headless `dist/linh-khi.html?cloud=0` (bot, không chơi tay): mặc định và `?kiemvuong=0` | **0 lỗi JS**, `G.zedMoi.loi` rỗng (combo 4 cấp, làng, Lò rèn, Luyện, túi đồ, Xem vũ khí, vào ải) |
| Bản web `linh-khi-nhe.html` (ảnh rời): mặc định / `?kiemvuong=0` | 0 lỗi JS; kiếm vuông nạp đúng / tắt đúng |
| `?kiemvuong=0` so bản trước phiên | hình Cu Tí **0 điểm ảnh khác** (111 nhịp × cấp 1, cấp 4) |
| Mũi kiếm dưới đất (bot, 4 cấp × cả combo) | **0** khung có lưỡi lọt đất (kiếm cũ: 6 nhịp lê kiếm đầu nhát 1 mỗi cấp, mũi cong lọt đất) |
| `cam-vk-chuan/soat.py` | 0 lỗi, mọi hàng × 4 cấp |
| `tests/smoke.py`, `tests/*.test.js` | 0 lỗi; đều đạt (`may_luat` bỏ qua như trước: thiếu thư viện) |

Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Chỗ còn yếu / cần chủ game xem

1. **Tay sau chưa "gần chuôi"** (xem mục 4 ở trên): do thân vẽ hai nắm tay sát nhau. Cán thò sau tay 6–10 điểm game, nhìn như cầm ở đầu cán. Cách sửa: gen lại khung thân (prompt (c)).
2. **Cấp 3 Thành hình**: cánh chắn tay to. Ở khung 7 (mũi sát đất) mép dưới cánh chắn lọt đất **1 điểm ảnh** trong 3 nhịp. Lúc **đứng yên**, tua đỏ ở chuôi chạm / lọt đất 1–2 điểm ảnh. Chặn đất chỉ tính phần lưỡi (như kiếm cũ), không tính chắn tay và tua.
3. **Cấp 4 trông nhỏ hơn cấp 3** một chút: ảnh gen vẽ lưỡi cấp 4 rất dài, co cho lưỡi bằng lưỡi cũ thì cán và chắn tay nhỏ lại (cán dày 8 so với 11). Nếu muốn cấp 4 to hơn thì hình sẽ dài vượt vùng trúng. Nói nếu muốn nới.
4. **Kiếm có hệ** đang là nhuộm 30 % màu hệ (không có dấu hệ riêng) cho tới khi có ảnh gen lại theo `PROMPT.md`. Sau khi gen cần một phiên nhỏ để dựng ô hệ / gân theo cỡ ô kiếm vuông.
5. **Nút Đánh to** trong trận vẽ bằng ảnh giao diện riêng (`gd-nut-danh-kiem`, kiếm cong), không lấy từ tấm vũ khí → **chưa đổi**. Muốn đổi cần gen lại ảnh nút đó.
6. **Nét cao:** tấm vũ khí chưa có bản ảnh nét cao (net-cao/bao-cao.md mục 4), nên kiếm vuông dùng cùng cỡ ảnh như kiếm cũ. Ở `?netcao=4`, kiếm vẫn hơi phóng (≈ ×1,07, như kiếm cũ).
7. Sửa tấm vũ khí (chạy lại `dung-zed-game.py`) xong thì chạy lại `dung-kiem-vuong.py`, để khoảng chắn tay và độ dài lưỡi khớp tấm mới.
