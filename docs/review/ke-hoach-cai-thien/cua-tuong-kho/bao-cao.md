# Báo cáo — Cua Đá không còn chỗ đứng an toàn (15/10, theo YEU-CAU.md bản sửa 17:08)

Chỉ đo bằng mô phỏng / bot Node (không mở trình duyệt). Ảnh soát tĩnh: `xem-cua-da.png`. Cờ `?cuade=1` → Cua Đá y hệt cũ.

## 1. Vì sao đứng sát mép trên / dưới là "ăn"

Mô phỏng (`mo_phong.py`, `do_cho_dung.py cua`): em bé giữ một chỗ trên lưới 8 × 6 ô của sàn, vùng đỏ tới thì bot cân bằng tự né rồi quay về
chỗ cũ; đo % máu tối đa mất mỗi phút (TB ải 2-1, 2-2, 2-3 × pha 1, 2; 8 phút mỗi ô).

| Cua Đá cũ | mép trên | mép dưới | mép trái | mép phải | giữa |
|---|---|---|---|---|---|
| %/phút | **17** | **18** | 39 | 39 | 56 |
| pha 1 (cả 3 ải) | **0** | **0** | 16–24 | 31–45 | 41–50 |

Nguyên nhân (cả con trùm, không riêng một chiêu):

1. **Tường tinh thể đặt cố định giữa phòng** (x = giữa ± 70), các hàng mảnh chỉ từ y ≈ 97 tới 217. Dải sát mép trên (cao ~23) và mép dưới
   không bao giờ có mảnh bay tới. Giữa hai hàng mảnh còn khe 16 điểm đứng yên được → bot né trúng **0 / ~1.000 lần** Tường ra chiêu.
2. **Cua Đá chậm và dừng xa**: đi 30 điểm/giây (đi dọc chỉ 24, em bé 72), dừng khi cách em bé 56 — Kẹp càng tầm 58 chỉ chạm rìa,
   lùi 2–3 điểm là hụt (trúng 1–3% số lần ra ở mọi chỗ).
3. **Đập càng chỉ là vòng quanh thân** (r 80, bề dọc chỉ 68 vì sàn dẹt). Em bé ở mép trên thì cua đứng ngay dưới; một cú lộn là qua.
4. Em bé ở xa (≥ 70) thì cua ưu Tường (2/3 số lần) — mà Tường không tới mép. Nên đứng mép xa trùm gần như chẳng phải né gì.

## 2. Đã sửa (`game/js/boss.js` G.CUA_SO, `game/js/chieu_trum.js` tuongNhot / SO.cuaNhot, cờ ở `game/js/data.js`)

- **Đuổi tới mép**: cua đi ngang × 1,8, dọc × 1,1 (cũ × 1 / × 0,8), dừng cách 52 (cũ 56); em bé xa hơn 96 thì **lướt ngang** 84 điểm (nghỉ 2,4 s).
- **Kẹp càng nhắm theo em bé**: càng vươn tới chỗ em bé (tầm 58–96; vươn xa thì quạt hẹp hơn, trùm lao theo lúc kẹp).
- **Đập càng**: giữ vòng đập + vành (pha 2); thêm **vết nứt** từ rìa vòng đập chạy qua hướng em bé **tới tận mép sàn** (không bị cắt),
  nổ 0,55 s sau vòng đập (tách nhịp để né được cả hai); em bé đứng xa trùm (> 60) mà sát mép (< 40) thì **đá rơi dọc chân tường** đó
  (5 tảng, chỉ phủ ≤ 22 điểm từ mép — bước vào trong là né). Đây là chiêu phạt đứng xa / sát mép.
- **Tường tinh thể nhốt em bé**: 2 tường dọc hai bên chỗ em bé đứng (cách 42; sát mép thì tường phòng là vách), cao hết sàn, **đúng một khe
  thoát ≥ 24**. Tường vỡ: mảnh bay ngang **phủ hết sàn** (tới cả hai mép phòng), **2 loạt so le** (loạt 2 lệch nửa hàng, báo 0,6 s ngay khi
  loạt 1 nổ; nổi giận thêm loạt 3) → không còn khe đứng yên; né bằng bước sang hàng vừa nổ hoặc lộn. Tường còn đứng thì cua không dựng
  tường mới nhưng **vẫn kẹp / đập**. Mảnh nay ghi đúng tên "Tường tinh thể" trên bảng thua (trước lấy tên chiêu trùm đang ra lúc mảnh bay).
- Công bằng (`kiem_cong_bang.py`, ép từng chiêu ở 7 chỗ đứng × 2 pha): **1512/1512 mục đúng** — báo trước đòn thường ≥ 0,45 s
  (Kẹp càng ≥ 0,58), vùng to ≥ 0,6 s (vòng đập ≥ 0,62, vết nứt ≥ 1,1, đá rơi ≥ 0,9, tường ≥ 0,69, mảnh 1,0 / 0,6); Kẹp càng luôn với tới
  em bé; vết nứt luôn tới mép; mỗi loạt mảnh chừa dải trống ≥ 16, các loạt cộng lại phủ hết bề cao sàn; đúng 1 khe ≥ 24.

## 3. Kết quả

| Cua Đá mới | mép trên | mép dưới | mép trái | mép phải | giữa |
|---|---|---|---|---|---|
| %/phút | **85** | **82** | **74** | **61** | 50 |

Từng ải × pha: 5/6 trường hợp mọi mép ≥ giữa. Riêng 2-3 pha 2 giữa (86) nặng hơn mép (64–99) — mép vẫn mất ≥ 64%/phút, không còn an toàn.

**Bot cân bằng** (`tests/balance.py --node --trum`, bản lưu đúng Sức mạnh khuyên dùng, 100 lượt mỗi ải):

| thắng ải | 2-1 | 2-2 | 2-3 | | thắng phòng trùm | 2-1 | 2-2 | 2-3 |
|---|---|---|---|---|---|---|---|---|
| cũ (?cuade=1) | 87% | 49% | 36% | | cũ | 99% | 89% | 97% |
| mới | 87% | 59% | 37% | | mới | 93% | 83% | 88% |

Không tụt (2-2 lên là nhiễu; mức thắng < 60% ở 2-2, 2-3 là có sẵn từ trước). Bản đầu tụt 12 / 6 / 10 điểm nên đã **hạ sát thương, giữ cơ chế**:
Kẹp càng khi vươn xa × 1,2 → 1,0; vết nứt 0,8 → 0,65; đá rơi 0,8 → 0,7; mảnh tường 1,0 → 0,8; dừng cách 46 → 52.
`do_trum.py` (vào thẳng phòng trùm): cũ 100%, mới 98–100%.

`?cuade=1`: chạy `do_trum.py` cùng hạt ngẫu nhiên → kết quả **trùng từng số** với bản trước phiên. Các trùm khác (1-1, 1-5, 2-5, 3-1, 3-5)
cũng trùng từng số (không bị đụng).

## 4. Rà các trùm khác (`do_cho_dung.py ra-soat`, 4 phút mỗi ô)

| trùm | mép thấp nhất / giữa | ghi chú |
|---|---|---|
| Nấm Chúa (1-1) | pha 1: trái 5 / giữa 8 (0,55×); pha 2: 0,69× | pha 1 chỗ nào cũng nhẹ (mép trên 18 > giữa); không có mép ≈ 0 |
| Hổ Lửa (3-1) | ≥ 1,1× | mép nặng hơn giữa |
| Mộc Tinh (1-5) | 1,0× / 0,89× / 0,72× (pha 3 mép trái) | |
| Ngư Tinh (2-5) | 0,70× (pha 1 mép trên / dưới) / 0,81× / 0,91× | |
| Hồ Tinh (3-5) | 0,91× / 0,91× / 0,94× | |

Không con nào có "mép an toàn" kiểu Cua Đá cũ (mép ≈ 0). Vài mép nhẹ hơn giữa 20–45% (Ngư Tinh pha 1, Mộc Tinh pha 3, Nấm Chúa) nhưng vẫn
mất máu đều; nguyên nhân không chung với Cua Đá (các trùm này đuổi tới và chiêu nhắm em bé), nên **không sửa** trong phiên này.

## 5. Tệp

- `mo_phong.js` / `mo_phong.py`: mô phỏng chỗ đứng (kiểu `dung` đứng yên, `bot` né rồi quay về, `chay` chạy dọc mép, `ne` né thô).
- `do_cho_dung.py`: bảng trên + `xem-cua-da.json`. `kiem_cong_bang.py`: soát công bằng. `ve_xem.py`: vẽ `xem-cua-da.png`.
- Đã chạy: `node --check` (boss.js, chieu_trum.js, data.js, mo_phong.js), `build.py` (dist cập nhật).
