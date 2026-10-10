# Báo cáo phiên "ghep-loi" (lõi game ghép trang bị)

Ngày 10/10/2026. Chẩn đoán trước khi sửa: `chan-doan.md` (cùng thư mục).

## Tóm tắt dễ hiểu

- Game giờ đã biết **điểm neo**: trên người em bé (đỉnh đầu, mắt, cổ, hai vai, eo, hông, tay, chân, chỗ cầm vũ khí, lưng, chỗ mọc cánh) và trên ảnh món đồ. Món đồ có điểm thì game **đặt điểm trùng điểm**, đúng ở **từng khung** (đứng, chạy, chém, lăn, ngã).
- Có thể **chỉnh riêng cho từng cặp nhân vật + món đồ** (dời, co giãn nhẹ, xoay, đổi lớp trước/sau, ẩn ở một động tác, dùng ảnh riêng) bằng tệp `ghep-<nhân vật>.sprite.json`, không đụng vào tệp món đồ.
- **Chưa có tệp ghép và món đồ chưa có điểm thì game y hệt trước**: đã so 5964 khung, khác 0 điểm ảnh.
- Chưa có ảnh AI nào được thêm vào game. Mọi món thử chỉ nạp tạm trong trình duyệt.

## ĐÃ SỬA THẬT

| Việc | Tệp | Ghi chú |
|---|---|---|
| Nhận tệp `ghep-<key>.sprite.json` (không ảnh) khi gói game | `game/build.py` | Trước đây tệp này làm **hỏng bản gói** (bắt buộc có ảnh). Giữ trường `loai, phien_ban, ma, ten, doi_tuong, nhan_vat, diem, diem_theo, cap`. Mã phải là `ghep-smith`, `ghep-hunter`, `ghep-healer` hoặc `ghep-wrestler`. |
| Đọc tệp ghép vào `G.spriteCustom.ghep[key]` | `game/js/sprite_custom.js` (`themGhep`) | Kiểm số: điểm trong ±200, `sx/sy` kẹp 0,8–1,25, `dx/dy` ±60, `xoay` ±180, `lop` chỉ nhận `sau/than/truoc/truoc_tay`. Thêm/bỏ tệp ghép thì xoá hình đã nhớ. |
| Đọc `trang_phuc.diem`, `trang_phuc.co_chuan` | `sprite_custom.js` (`themDo`) | Chỉ nhận đúng 21 tên điểm của định dạng. |
| Điểm thân code theo từng khung | `game/js/hero_tinhlinh.js` (`diemTuKhung`, `taoCx`) | Tính từ khung xương `B`, `H`, hai bàn tay, hai bàn chân, điểm cầm vũ khí của **chính khung đang vẽ** (có nghiêng, lộn, ngã, đầu lắc). Nguồn `xuong`. |
| Điểm thân AI theo từng khung | `sprite_custom.js` (`SC.diemAI`, `neoGhep`) | Lấy `diem_theo` (khung thắng động tác), thiếu thì `diem` + phần game tự đo (`khopEmBe`: điểm đầu dời theo đầu, còn lại theo thân); lăn/ngã: xoay, dời cả khối. Nguồn `tep` hoặc `uoc-luong`. Không có tệp ghép: ước lượng từ khung xương đứng + `neo` + `khopEmBe` (nguồn `uoc-luong`). |
| Quy tắc đặt mục 4 | `sprite_custom.js` (`SC.tinhDatMon`, `khopDiem`) | 1 điểm chung: trùng điểm, giữ góc của thân. ≥2 điểm: dời theo trung bình, co **đều** (kẹp 0,85–1,15), xoay (kẹp ±20° quanh góc thân), tính theo bình phương nhỏ nhất. Không có điểm chung: đường cũ y nguyên (đánh dấu "chưa hiệu chỉnh"). Sau cùng cộng `cap`. Biến thể `bien_the` được dùng nếu cùng ô đồ. |
| Vẽ ảnh có co giãn | `sprite_custom.js` (`veVaoKhung` thêm `kx, ky`) | Không ghi thì như cũ từng điểm ảnh. Giữ nét gấp đôi (điểm con lấy đúng chỗ trên ảnh gốc). |
| Thứ tự lớp `cap.lop` | `hero_tinhlinh.js` (`drawKid`: `hoan`, `chay`) | `sau` (sau thân, cùng lớp đồ lưng), `than` (ngay sau áo), `truoc` (sau mũ/mặt nạ/đồ cầm), `truoc_tay` (sau cả tay gần). Thân AI: `sau` vào lớp sau thân AI, còn lại vào lớp trước. |
| Ẩn theo động tác/khung (`theo.an`) | `sprite_custom.js` | Ví dụ ẩn mũ khi ngã: `"theo": { "die": { "an": true } }`. |
| Vũ khí theo cặp | `hero_tinhlinh.js` (`drawFrame`), `sprite_custom.js` (`SC.capVuKhi`) | Khoá `cap`: mã tệp vũ khí (vd `vk-sword-3`), rồi `vk-<loại>-<dòng>`, rồi `vk-<loại>` (cụ thể nhất thắng). Chỉ dời/xoay **hình** quanh điểm cầm; đòn đánh, tầm, sát thương, thời gian giữ nguyên. |
| Bộ nhớ đệm | `hero_tinhlinh.js` (`frame`, `lopDo`) | Khoá đệm có thêm phiên bản tệp ghép + khung AI (khi có tệp ghép). Không tạo canvas mỗi khung: mọi thứ tính lúc dựng khung (đã nhớ). |
| Giữ nguyên | | Ánh viền bậc, chớp trắng/băng/độc, bóng, lật hướng, lăn/ngã xoay cả khối (bản 2240), nét gấp đôi, ô đồ (hình món đứng riêng không áp ghép). |
| API cho công cụ | `sprite_custom.js` | Xem mục "Cách dùng API" dưới. |

## Kiểm tra (đã chạy)

- `node --check` mọi `game/js/*.js`, `node game/tests/cloud_save_regression.test.js`, `python3 game/build.py`: qua. Workflow đăng web: xanh.
- So ảnh **khác 0**: `anh-loi/so-khac-0.txt`. 5964 khung, bản trước và bản mới, không tệp ghép, món không có `diem` (thân code smith/hunter và một thân AI tạm; mọi động tác; 4 vũ khí + tay không; đồ code, cánh AI có sẵn, 6 món AI thử; độ nét 1× và 2×). Khác: **0**.
- Ảnh so cũ/mới: `anh-loi/so-cu-moi.png`. 6 hàng: thân code cũ, thân AI cũ, thân code mới, thân code mới có chấm vàng (điểm neo thân), thân AI mới, thân AI mới có chấm vàng. Cột: đứng, chạy, chém, lăn, ngã. Mặc cùng lúc mũ + áo + đồ lưng + bùa + dấu mặt + cánh + kiếm. Ở hàng mới: mũ ẩn khi ngã (`theo.die.an`), bùa vẽ trước tay (`lop: truoc_tay`), kiếm dời 1 điểm ảnh (`cap["vk-sword"]`).
- Kết quả API mẫu: `anh-loi/api-mau.json`. Cách làm lại: `anh-loi/kiem/` (`cat.py` cắt 6 món thử từ ảnh nguồn; `chup.js` so khác 0; `chup-ghep.js` chụp ảnh so). Thân AI thử là tấm dựng tạm từ em bé code trong trình duyệt, **không** lưu vào game.

## CHỈ ĐỀ XUẤT (chưa làm)

1. **Vũ khí thân AI tự theo điểm `cam`**: hiện vũ khí thân AI vẫn dời bằng `neo.tay` (như cũ) + `cap["vk-..."]`. Có thể tính `neo.tay` tự động = `cam` (tệp ghép) − `cam` (khung xương). Chưa làm để không đổi hình vũ khí đang có.
2. **Vệt chém** (`G.tinhLinh.tip`) chưa cộng `cap` vũ khí: khi dời vũ khí vài điểm ảnh, vệt có thể lệch đúng chừng ấy.
3. **Găng tay** (ảnh nhỏ đặt ở `tay_truoc`, `tay_sau`): định dạng chưa có kiểu "găng". Đề xuất thêm `trang_phuc.kieu: "gang"` sau.
4. **Ẩn mặt nạ AI ở khung quay đầu** (đề xuất của phiên ghep-thu): đã làm được bằng dữ liệu (`cap[mã].theo["atk:2"].an = true`), chưa có luật tự động.
5. Áo choàng, khăn choàng neo vào `co` (đề xuất của phiên ghep-thu): game **đã hỗ trợ** (điểm chung tên gì cũng khớp). Chỉ cần ghi `"diem": { "co": [...] }` trong tệp món đồ thay vì `lung`.

## CẦN VẼ LẠI ẢNH

- Game chỉ dời, co giãn đều nhẹ, xoay; **không kéo méo**. Áo vẽ quá khác dáng thân (rộng gấp đôi, nhìn thẳng mặt trước có hai tay áo xoè) sẽ bị kẹp co 0,85 nên vẫn to. Cách đúng: vẽ lại áo **nhìn nghiêng, không tay** (prompt mới của Tách Đồ), hoặc vẽ biến thể riêng cho nhân vật rồi ghi `cap[mã].bien_the`.
- Các món phiên ghep-thu đã xếp "không hợp" (áo choàng, khăn choàng sương, trống đồng nhỏ, dấu lá, dấu đô vật, găng đồng): vẫn cần vẽ lại, điểm neo không cứu được dáng sai.

## Những chỗ chưa rõ, đã tự chọn

- **Cách đếm toạ độ**: theo vị trí điểm ảnh (như ví dụ số nguyên trong định dạng): điểm ảnh thứ `i` nằm ở `i`. Điểm trên thân và trên món đồ chỉ cần ghi cùng một cách là khớp.
- **Đồ cầm tay** (`hands`, kiểu `cam`): điểm `tay_truoc` hoặc `tay_sau` của món đều khớp vào **bàn tay đang cầm đồ** (tay xa, chỉ hiện khi tay rảnh), vì tay gần cầm vũ khí. Như game cũ.
- **Cánh**: chỉ dùng điểm `goc_canh`; hai lá (xa tối, gần) vỗ quanh đúng chỗ mọc cánh. Lá xa đặt lệch như cũ so với lá gần.
- **Bùa đeo hông**: vẫn lắc theo bước như cũ (cộng thêm vào điểm `eo`).
- **`cap.dx, dy`** tính theo hướng thân (thân nghiêng/lộn thì dời theo). Co giãn và xoay quanh điểm neo (trung bình các điểm chung). Có `cap` mà không có điểm chung: lấy tâm ảnh ở chỗ cũ làm điểm neo.
- **Khoá `theo`** (của `cap` và `diem_theo`) ghi tên động tác kiểu code hay kiểu AI đều được: `run`=`move`, `dodge`=`ne`, `hurt`=`hit`, `hold`=`tele`; `spec`, `cast`, `sweep` cũng nhận khoá `atk`.
- **Không áp ghép cho ô đồ** (hình món đứng riêng trong túi đồ, đồ rơi), để ô đồ y như cũ.

## Trường tuỳ chọn THÊM (không đổi tên trường đã chốt)

Không thêm trường nào vào tệp. Chỉ thêm trường ở **kết quả API** (xem dưới): `xa`, `hien`, `an`, `chua_chinh`, `diem_chung`, `bien_the`, `rong`, `cao`, `net`, `than`, `dong_tac`, `khung` (datDo); `nguon`, `uoc_luong`, `goc`, `gocThan`, `gocDau`, `than` (diemNhanVat).

## Cách dùng API (cho trang công cụ, ví dụ tools/tach-ghep)

Nạp game thật (như `tools/tach-do` nạp `xuong-sprite.html`), lấy `G = khung.contentWindow.G`. Nạp món đồ và tệp ghép bằng `G.spriteCustom.add(tep)` (tệp ghép nạp lại thì thay cái cũ; `G.spriteCustom.remove('ghep-smith')` để bỏ).

### `G.spriteCustom.diemNhanVat(...)`

Gọi một trong các cách:

```js
SC.diemNhanVat(o)                               // o: đối tượng vẽ em bé của game (key, anim/f hoặc move/atk/dodge/p, weapon, outfit)
SC.diemNhanVat('smith', { anim: 'run', f: 3, weapon: { type: 'sword', family: 0 } })   // key + đối tượng vẽ
SC.diemNhanVat('smith', 'run', 3)               // key, động tác, khung
SC.diemNhanVat({ key: 'smith', dong_tac: 'atk', khung: 4, vu_khi: 'spear', v: 0 })
```

- Có em bé thân AI (`em-be-<key>` hoặc `em-be`) thì là thân AI: `dong_tac` theo tên AI (`idle, move, tele, atk, hit, die, ne`; tên code cũng nhận). Không có thì là thân code: `dong_tac` theo tên code (`idle, run, atk, dodge, die, hurt, spec, cast, hold, sweep, dash, gong`), `vu_khi` mặc định `'sword'` (ghi `null` là tay không).
- Trả về:

```js
{ diem: { dinh_dau: [x, y], ... },           // tính từ chân, quay phải
  nguon: { dinh_dau: 'xuong' | 'tep' | 'uoc-luong', ... },
  uoc_luong: ['tay_truoc', ...],              // tên các điểm đang ước lượng
  than: 'code' | 'ai', dong_tac, khung, goc: { than, dau }, gocThan, gocDau }
```

### `G.spriteCustom.datDo(...)`

```js
SC.datDo('smith', 'tp-robes-leaf', 'atk', 2)          // key, mã món, động tác, khung (tuỳ chọn thứ 5: { vu_khi, v, outfit })
SC.datDo('smith', 'tp-robes-leaf', o)                 // key, mã món, đối tượng vẽ
SC.datDo(o, 'tp-robes-leaf')                          // đối tượng vẽ, mã món  ← giống game nhất (cùng nhịp đung đưa)
```

Trả về (toạ độ tính từ chân, quay phải):

```js
{ x, y, sx, sy, xoay,          // vẽ: translate(x, y); rotate(xoay độ); scale(sx, sy); drawImage(ảnh, 0, 0, rong, cao)
  lop: 'sau'|'than'|'truoc'|'truoc_tay', da_chinh, uoc_luong, chua_chinh, an, hien,
  diem_chung: ['co', 'vai_sau', ...], bien_the, ma, o, rong, cao, net, than, dong_tac, khung,
  xa: { x, y, sx, sy, xoay, toi: true } }   // chỉ có ở cánh: lá xa (vẽ tối hơn)
```

- `chua_chinh: true`: món không có điểm chung với thân, đặt như cũ. `uoc_luong: true`: có dùng điểm ước lượng (hoặc đặt như cũ).
- `an: true` thì `x, y` là `null`. `hien: false`: đồ cầm tay ở khung tay đang bận (game không vẽ).
- Khi `xoay` = 0 game làm tròn `x, y`. Khi xoay khác 0 game dựng từng điểm ảnh (như vũ khí); vẽ bằng canvas xoay có thể lệch 1 điểm ảnh. Muốn y hệt game thì vẽ cả em bé bằng `G.art.hero(c, o)`.
- Thân AI gọi theo (key, động tác, khung): nhịp lắc của bùa/áo suy từ động tác AI; trong game nó theo động tác thân code cùng lúc (lệch tối đa 1 điểm ảnh ở bùa). Gọi `datDo(o, mã)` thì giống hệt.

### `G.spriteCustom.chuaChinh(key, o)`

Danh sách món **đang mặc** (ảnh AI) cần cảnh báo: `[{ ma, o, look, ly_do: ['mon-chua-co-diem' | 'khong-co-diem-chung' | 'uoc-luong' | 'chua-duyet'] }]`. `o` (tuỳ chọn): đối tượng có `outfit`. Game không hiện gì.

### Khác

- `SC.capVuKhi(key, vũ khí, loại, động tác, khung)` → `{ dx, dy, xoay }` hoặc `null`.
- `SC.ghep[key]`: tệp ghép đã đọc (`diem`, `theo`, `cap[mã] = { goc, theo }`).
- `SC.capTheo(key, mã, { ten, i })`: `cap` đã gộp `theo` của một khung.
- `SC.khopDiem(P, Q, gocDo)`: phép khớp điểm (để công cụ tự kiểm).

## Tệp đã đổi

- `game/js/sprite_custom.js`, `game/js/hero_tinhlinh.js`, `game/build.py`, `game/dist/*` (gói lại).
- `docs/review/ghep-trang-bi/chan-doan.md`, `loi-bao-cao.md`, `anh-loi/*`.
- Không sửa `tools/*`, `outfit.js`, `tailor.js`, không thêm ảnh vào `game/art/custom/`.
