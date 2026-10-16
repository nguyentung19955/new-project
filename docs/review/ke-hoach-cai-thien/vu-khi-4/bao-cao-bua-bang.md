# Búa Băng — đề xuất 1b + 2 (16/10/2026)

Chủ game chọn (16/10): `bao-cao.md` mục 6, đề xuất **1b** — quái bị **đóng băng bởi búa** thì miễn đóng băng sau đó 5 → 3 giây;
làm thêm đề xuất **2** (quái vừa tan băng vẫn tính dấu ấn Băng khi chết). Cờ quay lui `?buabang=0`.

## 0. Đọc nhanh

- Đã làm cả hai, có cờ `?buabang=0`. Kiếm / thương / phi tiêu Băng **không đổi một số nào** (code chỉ chạy khi nhát búa đóng băng).
- **Không đạt mục tiêu búa Băng ≥ 90% búa Độc.** `au_he.py` (VK=hammer, 18 hạt, Thức tỉnh): **68,4 / 99,6 = 69%** cả trước lẫn sau;
  `dps.py`: 83,9 / 102,4 = 82% cả trước lẫn sau. Dấu ấn búa Băng chỉ nhích +1–2%.
- Lý do: thời gian miễn **không phải chỗ nghẽn**. Sau khi đóng băng, `iceN` về 0 và búa cần 5 nhát × 0,8 giây = **4 giây** để đủ 5 tầng,
  dài hơn 3 giây miễn mới, nên miễn 3 giây không cho đóng băng sớm hơn được bao nhiêu; quái trong bài đo lại hiếm khi sống tới lần đóng băng
  thứ hai (đếm trong `au_he`: 41 lần búa đóng băng / 241 con hạ, **cùng số** khi bật và tắt cờ).
- `dps.py` đạt (trước và sau), `cay.py --vk=bua` lệch +1,5%, tỉ lệ thắng từng ải lệch ≤ 2/8 (trong nhiễu). Cần chủ game chọn hướng khác (mục 5).

## 1. Đã đổi gì

| Tệp, chỗ | Nội dung | Cờ quay lui |
|---|---|---|
| `game/js/combat.js` đầu tệp (cạnh `G.HE_THEO_NHIP`) | `G.BUA_BANG` (đọc `?buabang=0`), `G.bangBuaCon(st)` = cờ bật, `st.bangBua`, `st.freezeImm > 0` | `?buabang=0` → `G.BUA_BANG = false` |
| `combat.js` `G.applyStatus` | Thêm đối số thứ 5 `ao` (`{ bua: true }`). Đủ 5 tầng → đóng băng: nếu do nhát búa và **không phải trùm** thì `freezeImm = 3` và `st.bangBua = true`; còn lại `freezeImm = 5`, `bangBua = false`. Trùm vẫn choáng 0,5 giây, miễn 5 giây như cũ. Sốc nhiệt (Lửa + Băng) tiêu băng thì xoá `bangBua` | như trên |
| `combat.js` `playerHit` | Nhát gây hệ của búa (`w.type === 'hammer'`) gọi `applyStatus(..., { bua: true })`. Các nguồn Băng khác (gai băng của đòn đặc biệt, mảnh Băng vỡ, chưởng, đạo cụ) không đổi | như trên |
| `combat.js` `G.kill` | Khi tính dấu ấn: quái vừa tan băng **do búa** (`G.bangBuaCon`) coi như còn dính Băng (vẫn bỏ nếu băng do chưởng) | như trên |
| `game/js/linhkhi.js` `LK.markEl` | Cùng luật với `G.kill` (dấu hiện trên quái khớp với dấu ấn nhận được) | như trên |

Đề xuất 2 chỉ áp cho quái **bị búa đóng băng** (không mở cho mọi vũ khí như ghi ở `bao-cao.md`), để kiếm / thương / phi tiêu Băng
không đổi. Đã kiểm trực tiếp trong trình duyệt (`G.applyStatus` 5 lần lên một quái): búa → miễn 3 giây, `bangBua`; vũ khí khác → 5 giây;
trùm → 5 giây + choáng; tan băng rồi hạ → +1,2 dấu ấn (cờ tắt: 0). Với `?buabang=0`: mọi trường hợp 5 giây, 0 dấu ấn.

## 2. Búa: `au_he.py 60 18`, `VK=hammer` (cụm 5, máu ×2,5)

Trước = `PRE='G.BUA_BANG=false'`, sau = mặc định. Ô: st/giây · % khống chế · dấu ấn/phút.

| Hệ | Mốc | Trước | Sau |
|---|---|---|---|
| Băng | Mầm | 45,9 · 27% · 5,1 | 45,9 · 27% · 5,1 |
| Băng | Thành hình | 61,2 · 37% · 9,4 | 61,2 · 37% · 9,6 |
| Băng | Thức tỉnh | 68,4 · 33% · 11,1 | 68,4 · 33% · 11,2 |
| Độc | Thức tỉnh | 99,6 · 10% · 20,0 | 99,6 · 10% · 20,0 |
| Lửa | Thức tỉnh | 93,3 · 10% · 16,5 | 93,3 · 10% · 16,5 |
| **Băng ÷ Độc Thức tỉnh** | | **69%** (dấu ấn 56%) | **69%** (dấu ấn 56%) — mục tiêu ≥ 90%: **không đạt** |

Ghi chú: `bao-cao.md` ghi búa Băng Thức tỉnh 80,9 / 104,1 = 78% (6 hạt, cả 4 vũ khí một lượt). Đo lại 6 hạt hôm nay: 76,4 / 102,7 = 74%;
18 hạt: 69%. Chênh do số hạt giống ít (đúng như `bao-cao.md` mục 6.5 đã cảnh báo), không do lần chỉnh này (bật / tắt cờ ra cùng số).

Đếm thêm (`au_he` 18 hạt, Thức tỉnh Băng): búa đóng băng 41 lần, nguồn khác 13 lần, hạ 241 con; số lần đóng băng **bằng nhau** khi bật / tắt.
Đề xuất 2 cứu được 1 con (quái đã tan băng nhưng còn trong 3 giây miễn khi bị hạ).

## 3. Ba vũ khí còn lại, Băng Thức tỉnh (`au_he.py 60 18`, từng vũ khí)

| Vũ khí | Trước (st/giây · dấu ấn/phút) | Sau |
|---|---|---|
| Kiếm | 90,3 · 17,1 | 90,3 · 17,1 |
| Thương | 86,5 · 16,2 | 86,5 · 16,2 |
| Phi tiêu | 75,2 · 12,2 | 75,2 · 12,2 |

Giống hệt từng chữ số (code mới không chạy với các vũ khí này).

## 4. `tests/dps.py`, `tests/cay.py`, tỉ lệ thắng

| Bài | Trước (`?buabang=0` / `PRE`) | Sau |
|---|---|---|
| `dps.py` (trình duyệt, bia tập) | **đạt** (phi tiêu thấp hơn kiếm 23%, cận chiến lệch 9%, thấp nhất 77%, 3 hệ lệch 8%) | **đạt** (24%, 9%, 76%, 8%) |
| `dps.py` búa Băng: st/giây · dấu ấn | 83,9 · 34,0 | 83,9 · 34,5 |
| `dps.py` búa Băng ÷ búa Độc | 82% | 82% |
| `cay.py --node --vk=bua` (12 lượt) | 185,3 phút TB (157–204) | 188,1 phút TB (175–211) → **+1,5%** (≤ ±10%: đạt) |
| `balance.py 8 <index.html?cloud=0[&buabang=0]> vukhi:hammer` | 111/120 | 114/120 |

Tỉ lệ thắng từng ải (balance, búa, trước → sau, mỗi ô 8 lượt): 1-5 7→8, 2-3 6→8, 3-4 8→6, 3-5 4→6, còn lại bằng nhau. Lệch ≤ 2/8 cả hai chiều,
cùng cỡ với dao động búa ghi ở `bao-cao.md` mục 4 khi búa không đổi code → **trong nhiễu**.

Lưu ý: `dps.py --node` hiện **không đạt** cả trước lẫn sau (thương / búa Trắng 43 thay vì 57 / 52 như bản trình duyệt) — sai khác giữa
`node_trang.js` và trình duyệt, không do lần chỉnh này; bảng trên dùng bản trình duyệt như `bao-cao.md`.

Kiểm khác: `node --check` mọi tệp `game/js/`; `python3 game/build.py` và `--hai-tep` chạy được (đã dựng lại `dist`);
`node tests/cam_giac_danh.test.js` đạt 15 mục; `node tests/song_luat.test.js` đạt 40 điều kiện; `python3 tests/moves.py` 85/93 trước và sau
như nhau (8 mục sai có sẵn). Không đụng đăng nhập Google / lưu mây / `?cloud=0`. Không chơi thử bằng trình duyệt.

## 5. Vì sao không đạt, hướng tiếp (cần chủ game chọn)

Nhịp đóng băng của búa bị giới hạn bởi **số tầng**, không bởi thời gian miễn: 5 tầng × 0,8 giây = 4 giây ≥ 3 giây miễn. Miễn 3 giây chỉ có ích
khi một con sống qua ~5,5 giây sau lần đóng băng trước — quái trong bài đo (và trong ải) hiếm khi sống lâu vậy dưới búa Thức tỉnh.
Băng cũng không có sát thương theo nhịp, trong khi Độc theo nhịp tính theo sát thương nhát (búa 21) — đó mới là phần chênh (búa Độc "nhịp" 26,8 st/giây,
búa Băng 0,3).

Các hướng (chưa làm):
1. **Đề xuất 1a** của `bao-cao.md`: Độc theo nhịp chia hệ số nhịp (`src × 0,06 / k`) — đưa tỉ lệ lên ~90% bằng cách **giảm** búa Độc.
2. **Búa gây 2 tầng Băng mỗi nhát** (đủ 5 tầng sau 3 nhát = 2,4 giây; lúc đó miễn 3 giây mới thành chỗ nghẽn và mới có tác dụng).
3. **Băng vỡ 2 lần mỗi lần đóng băng** cho búa (vế sau của 1b): tăng sát thương trực tiếp, không cần đóng băng nhiều hơn.

Giữ hay gỡ lần chỉnh này: vô hại (số giữ nguyên, bật / tắt cờ ra cùng kết quả), và là điều kiện cần cho hướng 2. Gỡ bằng `?buabang=0`
hoặc đặt `G.BUA_BANG = false`.

## 6. Cờ

| Cờ | Tác dụng |
|---|---|
| `?buabang=0` | `G.BUA_BANG = false`: búa đóng băng miễn 5 giây như mọi vũ khí; quái tan băng không còn tính dấu ấn Băng (luật trước 16/10) |

## Lần 2: 2 tầng mỗi nhát (16/10/2026)

Chủ game chọn (16/10) hướng 2 ở mục 5: **nhát gây hệ của búa mang Băng gây 2 tầng Băng** (đủ 5 tầng sau 3 nhát ≈ 2,4 giây), giữ miễn 3 giây
của lần 1. Cờ quay lui mới `?bua2tang=0`.

### Đọc nhanh

- Búa Băng Thức tỉnh `au_he.py 60 18`: 68,4 → **83,2** st/giây = **84% búa Độc** (trước 69%). **Chưa tới 90%** → không hạ (không vượt 110%).
- `dps.py` đạt; búa Băng ÷ búa Độc 82% → **88%**. `cay.py --vk=bua` −1,5% (đạt ±10%). Tỉ lệ thắng từng ải: trong nhiễu (code không chạy, xem dưới).
- Kiếm / thương / phi tiêu, búa Độc / Lửa: không đổi một số nào. Trùm vẫn chỉ choáng 0,5 giây (luật trong `G.applyStatus` không đổi).

### Đã đổi gì

| Tệp, chỗ | Nội dung | Cờ quay lui |
|---|---|---|
| `game/js/combat.js` cạnh `G.BUA_BANG` | `G.BUA_2TANG` (đọc `?bua2tang=0`) | `?bua2tang=0` → `G.BUA_2TANG = false` |
| `combat.js` `playerHit` | `w.type === 'hammer' && el === 'ice'` → `G.applyStatus(..., 2, BUA_O)`; mọi trường hợp khác 1 tầng như cũ. Gai băng đòn đặc biệt, mảnh vỡ, chưởng, đạo cụ không đổi | như trên |

Trong 3 giây miễn, tầng vẫn bị kẹp ở 4 (luật cũ), nên hết miễn là nhát kế tiếp đóng băng ngay.

### Bảng trước / sau

Trước = `PRE='G.BUA_2TANG=false'` (au_he), `DPS_PRE='G.BUA_2TANG=false'` (dps), `--pre=G.BUA_2TANG=false` (cay), `index.html?cloud=0&bua2tang=0` (balance).

| Bài | Trước | Sau |
|---|---|---|
| `au_he.py 60 18` VK=hammer, Băng Mầm (st/giây · % khống · ấn/phút) | 45,9 · 27% · 5,1 | 50,1 · 29% · 5,3 |
| Băng Thành hình | 61,2 · 37% · 9,6 | 64,5 · 36% · 10,6 |
| Băng Thức tỉnh | 68,4 · 33% · 11,2 | **83,2** · 31% · 14,4 |
| Độc / Lửa Thức tỉnh | 99,6 / 93,3 | 99,6 / 93,3 (giống hệt) |
| **Búa Băng ÷ búa Độc Thức tỉnh** | **69%** | **84%** (mục tiêu 90–105%: **chưa đạt**) |
| `dps.py` (trình duyệt) | **đạt** (phi tiêu −23%, cận chiến lệch 9%, thấp nhất 78%, 3 hệ lệch 8%) | **đạt** (−23%, 9%, 77%, 7%) |
| `dps.py` búa Băng st/giây · dấu ấn | 83,9 · 34,5 | 90,6 · 39,9 |
| `dps.py` búa Băng ÷ búa Độc | 82% | **88%** |
| `dps.py` kiếm / giáo / phi tiêu Băng | 94,6 / 90,4 / 86,9 | giống hệt (giáo Trắng 58,7 → 58,8: lệch số ngẫu nhiên, không qua code mới) |
| `cay.py 12 --node --vk=bua` | 188,6 phút TB (179–212) | 185,7 phút TB (167–203) → **−1,5%** (≤ ±10%: đạt) |
| `balance.py 8 … vukhi:hammer` | 113/120 | 110/120 |

Tỉ lệ thắng từng ải (búa, trước → sau, 8 lượt): 1-5 8→7, 2-1 8→5, 2-4 7→8, 2-5 7→8, 3-2 8→7, 3-3 6→8, 3-5 7→5, còn lại bằng nhau.
Mọi bản lưu trong `tests/cay_luu.json` có vũ khí nhánh **Lửa** (vukhi chỉ đổi loại vũ khí), nên nhát búa không bao giờ gây Băng →
code mới **không chạy** trong `balance.py`; chênh lệch là nhiễu (balance không có hạt giống). Chạy lại riêng 2-1: trước 7/8, sau 8/8.

Kiểm khác: `node --check` mọi `game/js/*.js`; `python3 game/build.py` và `--hai-tep` chạy được (đã dựng lại `dist`);
`node tests/cam_giac_danh.test.js` đạt 15 mục; `node tests/song_luat.test.js` đạt 40 điều kiện. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.
Không chơi thử bằng trình duyệt.

### Vì sao vẫn chưa tới 90% (đo thử, chưa đưa vào game)

`au_he.py 60 18` VK=hammer, Băng Thức tỉnh, chỉnh trong bộ nhớ bằng `PRE`:

| Thử | st/giây | ÷ búa Độc |
|---|---|---|
| 2 tầng (bản đã làm) | 83,2 | 84% |
| 2 tầng + miễn búa 2 giây thay vì 3 | 83,6 | 84% |
| **3 tầng** mỗi nhát (đủ 5 tầng sau 2 nhát) | 89,5 | **90%** |

Miễn 3 giây không còn là chỗ nghẽn đáng kể (2 giây chỉ +0,4). Phần chênh còn lại vẫn là Độc có sát thương theo nhịp (26,8 st/giây) mà Băng
không có. Muốn tới 90% cần chủ game chọn tiếp: **3 tầng mỗi nhát** (vừa chạm 90%, sát đáy), hoặc hướng 3 ở mục 5 (Băng vỡ thêm cho búa),
hoặc 1a (giảm búa Độc). Không tự làm vì ngoài phạm vi đã chọn.

### Cờ

| Cờ | Tác dụng |
|---|---|
| `?bua2tang=0` | `G.BUA_2TANG = false`: nhát búa Băng gây 1 tầng như trước lần 2 (giữ miễn 3 giây của lần 1; tắt cả hai thì thêm `?buabang=0`) |
