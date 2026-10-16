# Còn vẽ tay 6: nối 16 ảnh chủ game gen vào chỗ hình code đã chặn

Ngày 16/10/2026, nhánh `khoi-tao-du-an`.

**Chưa chơi thử.** Phiên này chỉ chạy headless để chụp ảnh soát tĩnh và kiểm lỗi JS:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt.
- `tests/smoke.py`: `errors: []`.
- Mọi lượt chụp (`cong-cu/soat.py`): 0 pageerror. `G.fxAnh.loi` và `G.spriteCustom.loi` rỗng.

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`. Đăng nhập Google, lưu mây và `?cloud=0` giữ nguyên. Không chép apiKey.

Không đổi sát thương, tầm, thời gian, vùng va chạm. Chặn vẽ code (`G.ganChan` / `G.moVe`) vẫn giữ. Ảnh mới **chỉ vẽ khi đang chặn**. Với `?vecode=1`, game vẽ code y như cũ và không thêm ảnh nào.

## Dung lượng tải

Người chơi tải (bản hai tệp, ảnh rời WebP): **16,34 / 20 MB**. Trước phiên này là 16,30 MB.

- Lõi tải trước vùng đầu: 5,63 MB.
- Trang chính nén: 1,13 / 1,50 MB.
- Bản một tệp: 28,49 / 30 MB.

16 tệp mới tổng cộng 66 KB (JSON base64). `hu-bong-chan` và `hu-hat-no` được đưa vào nhóm ảnh lõi (`build.py` `HU_CO_BAN`), vì trận nào cũng cần.

## 1. Cắt ảnh

Công cụ: `cong-cu/dung-dot6.py`. Cách làm giống đợt 3: khử nền `#00FF00`, net 2, lượng tử màu, kiểm khớp từng điểm, đo neo. Khác đợt 3:

- **Tách khung theo lưới đều**, không theo khe cột. Ranh giới là cột trống nhất trong khoảng ±80 điểm ảnh quanh ranh giới đều, vì hạt băng và tia lửa lấn sang ô bên cạnh.
- **Neo tính theo gốc ô đều.** Nhờ vậy chuyển động trong dải giữ đúng như ảnh gen: vòng to dần, khói nở, mũi tên nhún.
- **Khử nền theo từng ảnh:**
  - `hu-bong-chan` (khử `bong`): bỏ màu xanh lục do ăn nền, lấy 3 nấc theo độ tối. Kết quả: màu `#14182e`, alpha 45 / 30 / 15 %.
  - `gd-cot-nang-rung` (khử `nang`): tách 3 dải theo độ sáng. Kết quả: màu `#fff4b0`, alpha 30 / 20 / 10 %, không còn viền xanh lục.
  - `hu-moi-truong-rung-domdom` (khử `sang`): alpha theo kênh đỏ, cùng cách `vong-hoi-quai`. Quầng thành vàng nhạt trong dần.
  - `hu-giot-he-poison` và `hu-moi-truong-rung-la` (khử `chat`): vật xanh lục trên nền xanh lục, nên chỉ bỏ điểm gần màu nền.
  - `gd-dau-phong` (khử `phong`): giữ màu gốc (rêu trên đá) cho điểm gần đặc, chỉ tách trộn ở mép.
  - Các ảnh còn lại (khử `tach`): ảnh trắng để game nhuộm theo màu cũ.

Bản xem từng dải (nền tím): `cong-cu/ra6/xem-*.png`. Số đo: `cong-cu/ra6/so-do.json`.

## 2. Ảnh nối vào đâu

| Ảnh | Thay cho (đã chặn) | Chỗ nối | Vị trí / cỡ / thời gian |
|---|---|---|---|
| `hu-bong-chan` | elip bóng dưới chân | `fx_anh.js` `G.bongAnh`. Gọi từ `zed_moi.js` `veLop` (Zed), `monster_art.js` `MA.draw` (quái, trùm; vẽ lên bút thật `c.__that`), `sprite_custom.js` `veQuai`, `art.js` (hero / quái / trùm code dự phòng, NPC, vật), `env_art.js` `shadow` | đúng chỗ bóng cũ. Co theo nửa bề ngang bóng cũ (`rx / 16`). Nhạt dần theo `P.bong` / alpha lúc chết |
| `hu-vong-song` | `ring` (`addRing`: đòn hệ, nện, nhát kết, trúng đạn...) | `fx.js` `drawFx` `'ring'` → `vongAnh` | khung theo tiến độ. Bán kính khung (`ban_kinh` trong tệp) bằng bán kính vòng cũ. Kéo dẹt theo tỉ lệ `ry / r` cũ. Nhuộm màu vòng |
| `hu-giot-he-fire` / `-ice` / `-poison` | `drawFlames` (tongue), `drawIce`, `drawDrips` | `fx_he.js` `giotAnh` | giữa hình đòn: cung trước mặt, đường đâm, hoặc 2 bên vòng quét. Cỡ theo bán kính / độ dài đòn. Xoay theo hướng nhắm như hình cũ |
| `hu-hat-no` | hạt code loại 0, 1, 3, 4, 6, 10 (burst, tia, lấp lánh) | `fx.js` `emit` → `hatAnh` | mỗi **chùm** từ 3 hạt sinh cùng lúc trở lên (cùng chỗ) thành 1 ảnh, nhuộm màu giữa dải màu hạt. Hạt lẻ rơi theo đường bay đạn hay bước chân không thành ảnh. Tối đa 8 ảnh mới mỗi khung |
| `hu-khoi-tron` | hạt loại 2 (`puffs`, bụi gót, bụi nện) | cùng `hatAnh` | như trên, nhuộm theo màu bụi |
| `hu-quang-dan` | `fx_dan.js` `glow` + `trail` | `fx.projAnh`, gọi ở `combat.js` khi đang chặn | đầu quầng ở tâm đạn, xoay theo hướng bay (16 hướng). Màu như cũ: đạn của bé theo hệ (không hệ thì trắng), đạn quái theo hệ / màu đạn. Cỡ theo độ dài vệt cũ |
| `hu-sao-chop` | `star` trong chớp `'flash'` (không phải chớp vuông) | `fx.js` `drawFx` `'flash'` | cỡ theo bán kính chớp, khung theo tiến độ, nhuộm `c2` |
| `hu-vet-luot` | `'dashline'` (lướt) | `fx.js` `drawFx` | neo mép trước ở chỗ em bé, dài theo vệt cũ, lật theo hướng, nhuộm màu hệ |
| `hu-tu-luc-vong` | `drawCharge` (vạch lấy đà trên đầu), `drawThrob` (vòng co quanh thân khi dính nhịp độc) | `fx_he.js`, `fx_ky_nang.js` | lấy đà: ở đúng chỗ vạch, rộng ~26. Vòng co dần theo mức đà (khung 1–4); đầy thì nảy sáng (khung 4–6), nhấp nháy vàng; màu như vạch cũ. Nhịp độc: khung 1–4 co vào, rộng bằng vòng cũ |
| `hu-moi-truong-rung-domdom` | `ambLive` `'fly'` | `room_art.js` | chỉ Rừng già. Đường lượn và nhịp nháy giữ như cũ. Co 0,7, nhạt 70% để gần độ nổi của chấm cũ |
| `hu-moi-truong-rung-la` | `ambLive` `'leaf'` | `room_art.js` | chỉ Rừng già. Đường rơi giữ như cũ. Khung 1–3 khi rơi (lật theo chiều đung đưa), khung 4–8 khi nằm trên sàn rồi tan |
| `gd-dau-phong` | `mark` / `ringMark` (dấu loại phòng) | `room_art.js` `dauPhongAnh`, lớp sống dưới đồ trang trí | tâm phòng. Phòng Bắt đầu: ảnh gốc, đậm 50% |
| `gd-mui-ten-cua` | `arrow0` (mũi tên cửa đã mở) | `room_art.js` `muiTenAnh` | tâm trùng mũi tên cũ. Cửa dưới / trái / phải xoay ảnh. Khung theo nhịp nhún cũ |
| `gd-cot-nang-rung` | `shaft` / `lightPass` (cột nắng Rừng già) | `room_art.js` `cotNangAnh` (ghi vào `g.amb` loại `'nang'` lúc dựng phòng) | từ nóc tường tới vệt trên sàn như cột cũ. Lật cho ngả trái. Đỉnh dải sáng đặt ở `bx` |

**Dấu phòng các phòng khác dùng tạm cùng ảnh `gd-dau-phong`.** Ảnh được nhuộm xám rồi nhân màu vòng cũ, phóng theo bán kính vòng cũ, đậm 35%:

| Phòng | Màu | Phóng |
|---|---|---|
| tinh anh | cam `#ff8a3a` | ×1,5 |
| thử thách | ngọc `#4ad0c0` | ×1,7 |
| lời nguyền | tím `#b46aff` | ×1,2, lệch lên 4 như cũ |
| trùm | màu ánh sáng vùng | ×2,9 |

## 3. Ảnh soát (`anh-soat/`)

Mỗi tệp `truoc-sau-*.png` có hai hàng: trên là `?vecode=1` (hình code cũ), dưới là bản mới. `*-truoc.png` / `*-sau.png` là cả màn hình ở khung đầu.

| Cảnh | Nội dung |
|---|---|
| `chu-nhan` | như `con-ve-tay-5/anh-chu-nhan.png`: Rừng già 5, phòng Bắt đầu, kiếm Mầm hệ Độc chém Bọ Hung. Có bóng chân, giọt độc, dấu phòng, đom đóm |
| `luot` | lướt hệ Lửa, lộn, nổ hạt: vệt lướt, khói, hạt nổ, lưỡi lửa, vòng sóng |
| `tu-luc` | búa Băng giữ nút đánh: vòng tụ lực trên đầu, rồi nện |
| `dan-quai` | đạn quái 6 kiểu và phi tiêu: quầng đạn, nổ khi trúng |
| `phong-bat-dau` | cửa mở: mũi tên 4 phía, dấu phòng, cột nắng, đom đóm, lá |
| `phong-tinh-anh` | dấu phòng dùng tạm, nhuộm cam |

## 4. Nên gen lại / còn thiếu

**Nên gen lại:**

- `hu-hat-no`, `hu-khoi-tron`: gen ra 5 khung, prompt là 6. Khung cuối của dải trống nên đã bỏ; vẫn dùng được. Gen lại thì nhắc "exactly 6 frames".
- `gd-cot-nang-rung`: dải sáng mảnh hơn cột cũ (cột cũ rộng 14 → 22, ảnh mới khoảng 8–10 điểm ảnh) và chéo hơn. Nếu muốn giống cột cũ: gen lại "wider beam, steeper (more vertical)".
- `gd-dau-phong`: lòng đá đặc nên trông như tấm thảm hơn là "faint sigil". Khi nhuộm cho phòng khác, cả đĩa thành mảng màu, phải hạ còn 35%. Nên gen riêng `gd-dau-phong-tinh-anh` / `-thu-thach` / `-nguyen` / `-trum` (vòng khắc rỗng giữa, theo màu từng loại).
- `hu-vong-song`: ảnh gen là vòng TRÒN, không dẹt như prompt (64×32). Game kéo dẹt nên vẫn đúng hình, nhưng nét trên / dưới mảnh hơn nét hai bên.

**Còn thiếu ảnh (vẫn để trống):**

- Đom đóm / lá / bụi bay của Hang biển, Lâu đài, Sông sâu (`hu-moi-truong-bien|lau|song`). Sông sâu có đom đóm vàng code (`'fly'`) nay không hiện.
- Cột sáng Hang biển và Lâu đài (`gd-cot-nang-bien|lau`).
- Lưỡi lửa ở vùng cháy / tên lửa (`tongue` ngoài nhát chém), chớp sao ở đầu mũi đâm (`thrust`, `dashline` kiểu giáo): chưa nối, vẫn chặn.
- Vệt vung vũ khí `trailDraw`: chưa nối. Vệt chém `hu-chem-*` đã thay phần chính.
- Các mục 9–12 của báo cáo vẽ tay 5 (nước dâng, địa hình Sông sâu, lục bình / đèn dầu, 4 quái Sông sâu): vẫn giữ vẽ code.

## 5. Rủi ro (vì chưa chơi thử)

- **Hạt nổ gom theo chùm.** Nổ lớn (nhiều hạt toả rộng hơn 14 điểm ảnh) có thể thành 2–3 ảnh cạnh nhau. Cảnh đánh đông thì tối đa 8 ảnh mới mỗi khung.
- **Bóng chân trên quái có ảnh AI vẽ lên bút thật** (`c.__that`), bên trong lúc `monster_art.js` đang mượn bút giả. Đã soát: bóng hiện đúng dưới Bọ Hung (rx 17) và Zed (rx 9).
- **Ảnh tải sau (bản hai tệp):** chỗ nào ảnh chưa về thì trống như phiên trước. Bóng chân và hạt nổ nằm trong nhóm lõi nên về sớm.

## 6. Quay lui

- Thêm `?vecode=1`: vẽ code như cũ, không ảnh mới.
- Hoặc xoá 16 tệp `game/art/custom/{hu,gd}-*.sprite.json` của phiên này: mọi chỗ trở về trống như vẽ tay 5.
- Hoặc `git revert` commit này.

## 7. Tệp đổi

- `game/art/custom/`: 16 tệp mới.
- `game/js/`:
  - `fx_anh.js`: `ban_kinh`, `G.anhThay`, `G.bongAnh`.
  - `fx.js`: vòng, sao, vệt lướt, hạt / khói.
  - `fx_he.js`: giọt hệ, vòng lấy đà.
  - `fx_ky_nang.js`: nhịp độc.
  - `fx_dan.js`: `projAnh`.
  - `combat.js`: gọi `projAnh`.
  - `room_art.js`: dấu phòng, mũi tên, cột nắng, đom đóm, lá.
  - `zed_moi.js`, `monster_art.js`, `sprite_custom.js`, `art.js`, `env_art.js`: bóng chân.
- `game/build.py`: `HU_CO_BAN` thêm `bong-chan`, `hat-no`.
- `game/dist/*`, `tools/xuong-sprite/*`: đóng gói lại.
- `docs/review/ke-hoach-cai-thien/con-ve-tay-6/`: báo cáo, `anh-soat/`, `cong-cu/` (`dung-dot6.py`, `soat.py`, `ra6/`).
