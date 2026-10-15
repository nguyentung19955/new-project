# Bước 2 — Báo cáo Phiên 0: nền chung "sự kiện" + ngày + bản lưu

Làm 15/10/2026 theo `KE-HOACH.md` mục 2, mục 4 "Phiên 0", đoạn "Tránh đụng nhau khi chạy song song", Phụ lục kỹ thuật; `QUYET-DINH.md`;
`LUAT-CAN-BANG.md`. Commit `d43b6840` trên nhánh `khoi-tao-du-an`. Không đụng master, không PR, không đổi đăng nhập Google / lưu mây / `?cloud=0`.

## 1. Đã làm gì

| Tệp | Thay đổi |
|---|---|
| `game/js/su_kien.js` (mới) | Bus sự kiện, `G.ngay`, bọc `G.fixSave` (so / nv / tt), mọi móc **bọc từ ngoài** (không sửa `combat.js`, `stage.js`, `bang_vang.js`, `ai_ngay.js`). |
| `game/index.html` | Thêm `<script src="js/su_kien.js">` ngay sau `stage.js`, trước `village_scene.js` (build.py đọc theo thứ tự này). |
| `game/js/village.js` | Hàng thẻ trên băng tiêu đề của Ông Từ (**Cu Tí \| Sổ \| Thành tựu**) và Anh Mõ (**Việc hôm nay \| Cài đặt**); 3 hàm rỗng `PANELS.so`, `PANELS.thanhTuu`, `PANELS.viecNgay`; `VA.khungThe`, `VA.theMo`, `VA.theCua`, `VA.THE_NGUOI`. |
| `game/js/village_scene.js` | `checkNews`: 1 dòng — Ông Từ / Anh Mõ có chấm đỏ khi một thẻ Bước 2 báo `.cham(sv) = true`. |
| `game/tests/su_kien.test.js` (mới) | Bài Node 83 điều kiện (mục 4 dưới). |
| `game/dist/*`, `tools/xuong-sprite/*` | Sinh lại bằng `python3 game/build.py`. |

Ghi chú:
- Thẻ đầu của Ông Từ ghi **tên nhân vật trong game** (`G.HEROES.smith.name` = "Cu Tí"), vì chữ "Zed" chỉ là tên nội bộ; mã thẻ vẫn là `hero`.
- Hàm rỗng mang cờ `.rong = true` → **thẻ chưa hiện** cho tới khi Phiên A / B / C gán hàm thật. Vì vậy bản hiện tại người chơi thấy Ông Từ, Anh Mõ y như cũ.
- Có hàng thẻ thì tiêu đề bảng rút ngắn thành "Sân đình" / "Cổng làng" cho đủ chỗ; không có thẻ thì giữ tiêu đề cũ. Thẻ tự co theo chữ (VI / EN).
- Phiên 0 **không thêm thưởng, không đổi luật đánh**: không gọi `G.rnd`, không đổi sát thương → không có gì để đo trước/sau theo `LUAT-CAN-BANG.md`
  (đo thử 6 ải bot có / không cờ: thời gian chạy tương đương). Đo cân bằng thật là việc của Phiên E khi đã có thưởng.

## 2. API cho Phiên A / B / C

### 2.1 Bus sự kiện — `G.suKien`

```js
const go = G.suKien.on('haQuai', (d) => { ... });  // trả hàm gỡ; go() để gỡ
G.suKien.off(ten, fn); G.suKien.phat(ten, duLieu); G.suKien.bat(); // bat() = false khi ?sukien=0
```
Lỗi trong hàm nghe bị bắt và in ra console, không làm hỏng trận. Mọi sự kiện phát **sau** khi hàm gốc chạy xong.
Ở `?sukien=0` không có gì được bọc, `phat` không làm gì.

| Tên | Khi nào | Dữ liệu `d` |
|---|---|---|
| `vaoAi` | sau `G.startStage` (Lái Đò, Chơi lại, Ải tiếp, ải ngày, **và** khi `luu_luot.js` khôi phục lượt dở) | `S, r, i, diff, aiNgay ({loai, muc} \| null), tut` |
| `vaoPhong` | `S.W` đổi (vào ải, qua cửa) | `S, W, id, loai` (fight, chest, challenge, boss…) |
| `gapQuai` | mỗi con quái lần đầu có mặt trong phòng bé đứng (cả đợt mọc sau); bỏ `e.add`, `e.illusion` | `e, ma (= e.art, trùng mã trang sổ), ten, vai (e.role), tinhAnh, trum ('nho' \| 'vung' \| null), vung, S` |
| `haQuai` | sau `G.kill` làm quái chết; bỏ `e.add`, `e.illusion` (số lần = `S.loot.kills`) | như `gapQuai` + `el` (hệ đòn kết liễu, có thể null), `ch` (chưởng kết liễu), `he: {fire, poison, ice}` (đang dính hiệu ứng **do vũ khí**, đã bỏ phần do chưởng), `w, wType, aiNgay, diff` |
| `phanUng` | Nổ lan / Lây độc (`G.moves.onKill`), Băng vỡ (`G.moves.onHit`) — chỉ vũ khí Thức tỉnh | `loai: 'noLan' \| 'layDoc' \| 'bangVo', e, w, S` |
| `lonNe` | `P.dodgeT` vừa bật | `P, S` |
| `dacBiet` | `P.specCd` vừa được đặt (tung đòn Đặc biệt) | `P, S` |
| `doiVk` | `P.cur` đổi | `P, S, tu, sang` |
| `chuong` | `G.chuong.fire` bắn thành công | `P, cay ('hoa' \| 'doc' \| 'bang'), S` |
| `moRuong` | vật rương vừa `used` (đã chọn thưởng) | `S, prop` |
| `thuThach` | thắng phòng thử thách (dọn kịp giờ) | `S, W, conGiay` |
| `hetAi` | hết ải thường (sau hàm Bảng vàng) **và** hết ải ngày (bọc `G.aiNgay.thuong`); mỗi lượt đúng 1 lần, cả thua / bỏ ải | `S, R, win, r, i, diff, aiNgay, tut, quit, stars, starNote, khongBinh, khacChe (= starNote[2]), kills, trumVung`; ải ngày thêm `tinhLuot` (thắng có trừ lượt, có thưởng) |
| `nangCap` | `G.persist` ở làng mà mài / cấp vũ khí / bậc ép / lò / điểm kỹ năng / điểm chưởng / cấp bộ tăng, hoặc ép tốn đá | `loai: ['mai' \| 'vk' \| 'ep' \| 'lo' \| 'diem' \| 'chuong' \| 'bo', …]` |

Gợi ý dùng: `R.lines.push(G.t(...))` trong `hetAi` để thêm dòng vào bảng kết quả (Phiên B "Việc hôm nay: 2/3"); dòng báo trong ải:
`S.W.banner = { s, col, t }` hoặc `G.getWorld().texts`. Số đếm cộng thẳng vào `G.save.so / nv / tt` (chỉ là đối tượng bộ nhớ, không ghi `localStorage` mỗi con);
`settle` và `luu_luot.js` đã gọi `G.persist()` khi hết ải / qua cửa.

### 2.2 Ngày — `G.ngay`

| Hàm | Trả về |
|---|---|
| `homNay()` | `{ key: 'YYYY-MM-DD', thu: 0..6 (0 = CN), d }` — đúng hàm của ải ngày (giờ máy, đổi lúc 0 giờ) |
| `dauTuan(key?)` | `'YYYY-MM-DD'` thứ Hai đầu tuần |
| `thuTuan(key?)` | 0 = thứ Hai … 6 = Chủ nhật (ô trong dải tuần) |
| `cong(key, n)` | ngày cộng n |
| `sau(a, b)` | `a > b` (b rỗng thì true) — chống chỉnh lùi giờ: chỉ tiến khi `sau(homNay().key, nv.cuoi)` |
| `conLaiGiay()` | giây tới 0 giờ |
| `bam(chuoi)`, `ngauNhien(hat)` | băm 32 bit; hàm ngẫu nhiên có định → `G.ngay.ngauNhien(G.ngay.bam(key + ':' + nv.hat))` |

### 2.3 Bản lưu — `so`, `nv`, `tt` (đúng mục 2 kế hoạch)

`G.fixSave` (máy và mây đều qua) luôn trả bản có đủ ba phần, mỗi phần `v: 1`:
- `so = { v, q: { <mã>: { g, h, k, n } }, vung: { <0..2>: bit }, bu? }`
- `nv = { v, hat (tạo một lần), cuoi, ds: [{ m, x, can, d, nhan }] (≤ 3), doi, ruong, hom, tuan: { ma, ngay: [0..6] }, tuanNhan, demRuong }`
- `tt = { v, dem: {…}, xong: {…: 1}, nhan: {…: 1}, dh?, bu? }`

Sai kiểu thì dựng lại **riêng phần đó**; dữ liệu đúng giữ nguyên; mục lạ trong `so.q`, `tt.dem` được giữ (tối đa 300 khoá) — Phiên A / C tự lọc theo bảng của mình.
`v > 1` (bản game mới hơn) thì để nguyên. **Cờ `bu` không được đặt ở Phiên 0** và không có trong `G.newSave`: Phiên A / C đặt `so.bu = 1` / `tt.bu = 1`
sau khi bù bản lưu cũ (nên bọc `G.fixSave` của mình sau tệp này, hoặc bù lúc vào làng). `G.suKien.suaBanLuu(sv)` gọi lại phần sửa nếu cần.

### 2.4 Thẻ ở làng (tránh đụng nhau)

```js
const VA = G.villageApi;
VA.PANELS.so = function () {                 // Phiên A (Phiên C: PANELS.thanhTuu, Phiên B: PANELS.viecNgay với khungThe('mo', …))
  VA.khungThe('tu', 'Sân đình: sổ yêu quái'); // khung bảng + hàng thẻ (tiêu đề dài chỉ dùng khi không có hàng thẻ)
  // vẽ trong x 160..464 (CX..CX+CW), y 68..262; nút Nhận dùng G.theme.btn / sbtn
  return 'Câu ông Từ nói';                   // chữ trong bóng nói bên trái
};
VA.PANELS.so.mo = (sv) => true;              // tuỳ chọn: thẻ mở chưa (Việc hôm nay: sv.stars['0-1']…)
VA.PANELS.so.cham = (sv) => coThuongChoNhan; // tuỳ chọn: chấm đỏ trên thẻ + chấm đỏ người làng
```
- Gán **đè cả hàm** (không đặt `.rong`). Tệp của phiên nạp sau `village.js` nên `G.villageApi.PANELS` đã có.
- Thẻ tắt (`?sukien=0`, `.mo()` = false) mà đang mở → tự về Cu Tí / Cài đặt. Anh Mõ mở thẻ Việc hôm nay trước khi thẻ đó hiện; Ông Từ nhớ thẻ vừa xem (`V.ttab`).
- Muốn mở thẳng một thẻ: `VA.open('tu'); VA.V.tab = 'so';`. Chấm đỏ người làng đã nối sẵn, **không cần sửa `village_scene.js`** (`G.suKien.chamNguoi`).
- Chữ mới: thêm bản dịch bằng `G.ngonNgu.them({...})` trong tệp của phiên. `data.js`: mỗi phiên thêm khối riêng ở cuối tệp.

## 3. Cờ quay lui

`?sukien=0` (hoặc đặt `G.SU_KIEN_BAT = false` trước khi nạp): không bọc hàm nào (kể cả `G.fixSave`), không phát sự kiện, bản lưu không thêm / không sửa
`so`, `nv`, `tt` (dữ liệu sẵn có giữ nguyên), mọi thẻ Bước 2 ẩn dù đã có hàm. `G.suKien`, `G.ngay` vẫn có (chỉ để mã khác khỏi lỗi).

## 4. Cách kiểm (đã chạy, không mở trình duyệt)

```
node --check game/js/su_kien.js game/js/village.js game/js/village_scene.js
python3 game/build.py                       # ra dist/ không lỗi
node game/tests/su_kien.test.js             # PASS — 83 điều kiện (khoảng 1 phút)
node game/tests/cloud_save_regression.test.js   # 7 PASS
```
`su_kien.test.js` chạy hai bản game qua `tests/node_trang.js` (bản thường và `LK_Q=sukien=0`):
1. 15 bản lưu cũ (`tests/cay_luu.json`) + 1 bản dựng tay: `G.fixSave` ra **y hệt** bản `?sukien=0` ở mọi khoá cũ, chỉ thêm so / nv / tt rỗng, chưa có cờ `bu`; `G.newSave` không có ba khoá.
2. so / nv / tt hỏng → dựng lại; dữ liệu đúng giữ; sửa hai lần cùng kết quả; `v > 1` để nguyên.
3. `G.ngay`: trùng ải ngày, thứ Hai đầu tuần, qua tháng / năm, chống lùi ngày, hạt giống có định.
4. Bot thắng ải 0-1: `vaoAi → vaoPhong → … gapQuai / haQuai (= số quái hạ) … → hàm Bảng vàng → hetAi` (đúng 1 lần), Bảng vàng vẫn ghi kỷ lục, gán lại `G.onStageEnd` vẫn giữ lớp bọc.
5. Ải ngày: `hetAi` có `aiNgay`, thắng có `tinhLuot`.
6. Lộn né, đặc biệt, đổi vũ khí, chưởng, rương, thử thách, Nổ lan / Lây độc / Băng vỡ, vào phòng.
7. Nâng cấp ở làng: mài, học điểm, nâng lò phát `nangCap`; lưu không đổi gì / thêm vàng thì không.
8. Thẻ Ông Từ / Anh Mõ: hàm rỗng thì ẩn; có hàm thì hiện đúng thứ tự, `.mo()` ẩn thẻ, `.cham()` bật chấm đỏ; vẽ làng không lỗi.
9. Mây giả (Firestore giả trong Node, `C.pull` / `C.push`): kéo bản lưu cũ từ mây → tiến độ giữ nguyên, có so / nv / tt; bản đẩy lên đọc lại y nguyên, ~3 KB.
10. `?sukien=0`: không sự kiện, không thêm so, thẻ ẩn.

Chưa chạy: `tests/may.py`, `tests/au_luu.py` (cần Playwright / trình duyệt — phiên này không chơi thử bằng trình duyệt). Phần lưu mây thật không bị sửa:
`cloud.js` vẫn bọc `G.persist` ngoài cùng và gọi `G.fixSave` như cũ.

## 5. Lưu ý cho phiên sau

- `vaoAi` cũng phát khi `luu_luot.js` khôi phục lượt dở sau khi tải lại trang; đếm "qua ải" nên dựa vào `hetAi`.
- `hetAi` phát cả khi thua / bỏ ải (`win = false`, `quit`); ải hướng dẫn có `tut = true`.
- Lớp bọc `G.tick` / `G.startStage` / `G.persist` của tệp này nằm **trong** lớp của `luu_luot.js`, `cloud.js`, `sprite_custom.js` (nạp sau) — vẫn chạy mỗi lần.
- Đổi vũ khí: bot cân bằng không đổi vũ khí, nên số `doiVk` trong bot luôn 0 (khi đo Phiên E nhớ điều này).
