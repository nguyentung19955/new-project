# Soát mượt — Phiên 3: Vẽ mượt + giao diện + hiệu năng

Ngày 15/10/2026, nhánh `khoi-tao-du-an`. Làm theo mục 4, dòng "Phiên 3" của `bao-cao.md`: các mục **1, 8, 9A, 16A, 15, 17, 20, 21, 22**.

Phiên này chỉ đổi HÌNH, không đổi luật chơi. Vị trí thật, va chạm, sát thương, thời gian đòn, vùng chạm đều giữ nguyên. Mỗi mục có một cờ quay lui riêng.

Không chơi thử bằng trình duyệt. Cách kiểm ở mục 4 bên dưới.

---

## 1. Cờ quay lui (mỗi mục một cờ)

Tất cả bật mặc định. Thêm cờ vào địa chỉ để tắt, hoặc đặt `G.X = false` trước khi nạp. Bảng cờ cũng ghi ở đầu khối "SOÁT MƯỢT PHIÊN 3" trong `js/engine.js`.

| Mục | Cờ tắt | Biến | Tệp chính |
|---|---|---|---|
| 1. Nội suy khi vẽ + làm tròn nửa điểm ảnh | `?noisuy=0` | `G.NOI_SUY` | `engine.js`, `combat.js`, `zed_moi.js`, `sprite_custom.js`, `hero_tinhlinh.js`, `stage.js` (1 dòng) |
| 8. Hiệu ứng một lần mờ dần + giữ khung cuối + nảy | `?humo=0` | `G.HU_MO` | `fx.js`, `ep_do.js`, `ky_nang_quai.js`, `chieu_trum.js`, `monster_art.js` |
| 9A. Vùng báo trước hoà khung + nhịp sáng cuối | `?bthoa=0` | `G.BT_HOA` | `bao_truoc.js` |
| 16A. Hiệu ứng lặp chậm hoà khung kế | `?hoalap=0` | `G.HOA_LAP` | `fx_anh.js` |
| 15. Chuyển màn, bảng mở / đóng, truyện, thanh kinh nghiệm, màn tải | `?uimuot=0` | `G.UI_MUOT` | `engine.js`, `stage.js` (bọc phần bảng), `truyen.js`, `ui_theme.js` |
| 17. Cu Tí đứng thở / tụ lực búa đi đi về về | `?thocuti=0` | `G.THO_CUTI` | `zed_moi.js` |
| 20. Cu Tí pha bước chung đi / chạy | `?nhipcuti=0` | `G.NHIP_CUTI` | `zed_moi.js` |
| 21. Cỡ ảnh bậc 0,5; đạn xoay 16 hướng | `?tile05=0` | `G.TILE05` | `fx_anh.js`, `fx.js`, `fx_dan.js` |
| 22. Bớt việc vẽ | `?venhe=0` | `G.VE_NHE` | `fx.js`, `ui_theme.js`, `bao_truoc.js`, `combat.js`, `engine.js`, `stage.js`, `ky_nang_quai.js`, `zed_moi.js` |

Bảng cũ ở mục 4 của `bao-cao.md` cho 17 và 20 dùng chung cờ `?nhipcuti=0`. Phiên này tách thành hai cờ (`?thocuti=0`, `?nhipcuti=0`), vì yêu cầu là mỗi mục một cờ. Mục 16A và 22 cũng có cờ riêng (`?hoalap=0`, `?venhe=0`).

---

## 2. Đã làm gì, từng mục

### Mục 1: nội suy khi vẽ + làm tròn cùng kiểu

**Nhớ vị trí.** `G.tick` gọi `G.nsChup()` (`combat.js`) trước mỗi lượt tính. Hàm này nhớ vị trí trước của em bé, quái, trùm và camera.

**Vẽ.** Vòng lặp tính `G.nsAlpha = acc/STEP`. `G.nsVao(alpha)` đặt tạm vị trí trung gian trước `scene.draw()`. `G.nsRa()` trả lại đúng vị trí thật ngay sau đó (trong `finally`). Vì vậy luật, va chạm và chạm luôn dùng vị trí thật.

**Dịch chuyển tức thời.** Dời quá 24 điểm ảnh trong một nhịp (camera: 60) thì không nội suy, vẽ đúng chỗ mới như cũ. Áp cho đổi phòng, lướt xa, đẩy tức thời.

**Làm tròn chung.** `G.lamTron(v)` = `Math.round(v·G.NET)/G.NET` (nửa điểm ảnh khi Độ nét Cao). Dùng chung cho:

- camera (`G.camVe`)
- Cu Tí (`zed_moi.js veLop` và dòng 522)
- em bé khác (`hero_tinhlinh.js`)
- quái ảnh AI (`sprite_custom.js SC.veQuai`)

**Nền.** Các hàm nền tự làm tròn camera về số nguyên. `drawWorld` dời nốt phần nửa điểm ảnh để nền khớp nhân vật.

**Thanh máu quái** (`stage.js mobBars`) dùng cùng camera đã làm tròn.

**Khi tắt** (`?noisuy=0`) hoặc Độ nét Thường: làm tròn số nguyên, không nội suy, như cũ.

### Mục 8: hiệu ứng một lần mờ dần

**Hiệu ứng ảnh không lặp đi qua `fx.anh`** (`fx.js add` / `drawFx`):

- Giữ khung cuối thêm 0,12 giây.
- Mờ dần từ 75% thời lượng tới hết phần giữ.
- Nhóm nổ / trúng đòn (`hu-no*`, `hu-trung*`, `hu-chi-mang*`, `hu-va-cham`, `hu-pha-giap*`, `hu-trum-no*`, `hu-be-trung`, `hu-soc-nhiet`) nảy 1 → 1,08 → 1 trong 0,12 giây đầu. Nảy làm bằng phép phóng quanh điểm neo, nên cỡ gốc vẫn giữ bậc 0,5 của mục 21.
- Hiệu ứng có cờ `mr` cũ (mờ vào / ra riêng) giữ nguyên.

**9 tấm `bao-cao.md` nêu tên, xử lý từng chỗ:**

| Tấm | Xử lý |
|---|---|
| `hu-tia-mom` | Mờ 25% cuối lúc lấy đà |
| `hu-vo-oc` | Vỏ mờ dần 25% cuối, ốc ló ra |
| `hu-bua-tam-giac` | Nổ xong (còn 0,3 giây `o.het`): giữ khung cuối, mờ trong 0,15 giây |
| `hu-vet-dau` | Lúc châm lửa: mờ dần 0,15 giây dưới lửa thay vì tắt |
| `hu-ep-thanh-cong` (và bản thất bại / tụt bậc) | Giữ khung cuối 0,12 giây, mờ 25% cuối |
| `hu-vet-chay`, `hu-nut-san`, `hu-manh-san-ho` | Code hiện tại đã mờ dần sẵn, để nguyên |
| `hu-nam-con` | **Không đổi.** Đây là vật báo nguy hiểm sắp nổ, bị xoá đúng lúc nổ (không còn khung để giữ). Mờ trước khi nổ sẽ làm báo nổ kém rõ. Ảnh nổ hiện ngay lúc đó |

### Mục 9A: vùng báo trước hoà khung

Trong `bao_truoc.js`, `khungVa` trả thêm phần hoà (phần lẻ của u×7) và độ sáng cuối. `veAnh` vẽ ba lớp, cùng một hàm vẽ hình (`veHinh`):

1. khung `fi`
2. khung `fi+1` đè lên theo phần lẻ
3. 0,15 giây cuối trước nổ: lớp cộng sáng (`lighter`) mạnh dần, có nhịp

Khung 7 **không** hoà sang khung 8 (chớp nổ), để không báo nổ sớm. Khung nổ vẫn bắt đầu đúng lúc nổ.

Tường nước và đường ngắm cũng nhận thời gian còn lại (`con`) nên có nhịp sáng cuối.

### Mục 16A: hiệu ứng lặp chậm hoà khung kế

`FA.ve` (`fx_anh.js`): tệp lặp có 4,5 ≤ khung/giây < 9 thì vẽ thêm khung kế với độ hiện 0–35% theo phần lẻ.

Có 14 tấm thuộc diện này: `hu-bam-*`, `hu-vung-*`, `hu-vung-quai-*`, `hu-may-doc`, `hu-cong`, `hu-vet-nhot`, `hu-nhua-rung`, `hu-khien-nuoc`, `hu-len-cap`, `hu-lang-lua-lo`.

Hiệu ứng chậm cố ý (< 4,5 khung/giây, ví dụ `hu-lang-khung-cui` 2,2) để nguyên.

### Mục 15: giao diện

**Chuyển màn** (`engine.js`).

- `setScene` vẫn đổi màn ngay như cũ: `enter()`, luật và chạm của màn mới không trễ.
- Lần vẽ sau chụp màn cũ (`#world` + `#ui` của khung trước).
- 0,1 giây đầu: ảnh màn cũ tối dần về đen. Trong lúc này bỏ chạm và nút chạy ngay, vì màn mới chưa thấy.
- 0,15 giây sau: màn mới hiện dần từ đen.

**Bảng mở / đóng** (`engine.js G.uiBang`).

- Mở: phóng 0,94 → 1 cùng độ hiện trong 0,12 giây (ease-out).
- **Giữ đúng vùng chạm.** Trong lúc phóng, `G.click` và toạ độ nút chạy ngay `G.syncTaps` (đăng nhập Google) được đổi ngược đúng phép phóng. Chạm vào đâu trên hình thì đúng nút đó. Hết phóng thì không đổi gì.
- Ở làng: phóng cả lớp `#ui` khi đang mở bảng. Nền làng tối ở `#world` không phóng. Bản đồ, ải ngày và màn chào không tính là bảng.
- Trong ải: `stage.js` bọc phần vẽ bảng (`G.uiBang.vao()` / `ra()`), nên chỉ bảng phóng, thanh trên không phóng. Gồm Tạm dừng, bản đồ, hành trang, kết quả, rương, thương nhân, bàn thờ.
- Đóng: ảnh bảng vừa đóng mờ dần 0,12 giây đè lên màn mới. Ảnh này không nhận chạm: chạm rơi vào màn mới bên dưới, là màn đang thật sự hoạt động.

**Truyện** (`truyen.js`).

- Sang trang mà cả hai trang đều có ảnh: giữ ảnh cũ, hoà sang ảnh mới trong 0,4 giây, thay cho cắt đen. Người đang nói cũng hoà theo.
- Chữ chạy ~40 chữ/giây, hiện theo **từng từ** (cắt ở dấu cách). Dòng đã ngắt sẵn theo cả đoạn nên khung không đổi cỡ, từ không nhảy dòng.
- Chạm (hoặc Enter / Space / J) lúc chữ đang chạy thì hiện hết chữ. Lần sau mới sang trang. Vùng chạm, nút Bỏ qua và thời gian tự sang trang không đổi.
- Khung chữ cũ (chưa có ảnh, hoặc `?truyencu=1`) vẫn hiện cả đoạn như trước.

**Thanh kinh nghiệm** (`ui_theme.js T.bar` kiểu `'xp'`).

- Nhớ số đang hiện theo chỗ vẽ. Số mới lớn hơn thì chạy tới trong 0,4 giây.
- Số nhỏ đi (lên cấp, đổi em bé) thì hiện ngay.
- Có tác dụng ở cả thẻ em bé (`village.js`) lẫn Hành trang, nhưng không sửa `village.js`.

**Màn tải:** mờ dần 0,3 giây rồi mới gỡ khỏi trang (`#lk-tai` vốn đã `pointer-events: none`).

### Mục 17: Cu Tí đứng thở

Sửa trong `zed_moi.js`, hàm `lapQuaLai`:

- Hàng `dung` phát 1-2-3-4-5-4-3-2 (cùng nhịp mỗi khung, cùng chu kỳ 8 bước).
- Hàng `bua_giu` phát 1-2-3-4-3-2.
- Kèm `i2` (khung sẽ tới), để góc vũ khí đang cầm (`dung_<loại>`) nội suy về đúng khung đó.

### Mục 20: Cu Tí đi ↔ chạy

Sửa trong `zed_moi.js`, hàm `buoc`. Mỗi em bé có một pha bước 0..1 chung cho đi bộ và chạy.

- Đổi đi ↔ chạy giữ đúng chỗ trong bước.
- Vùng đệm: vào chạy khi > 0,65, về đi bộ khi < 0,55.
- Bắt đầu bước thì vào từ khung 1.
- Lướt kiếm đi theo pha bước (nhanh gấp đôi), không theo `P.t`.
- Chân khi chạy + chém (ghép eo) cũng theo pha này, kể cả chạy lùi (nhịp ×0,8).

Chỉ lần vẽ của chính em bé (`o.t === P.t`) mới đẩy pha. Bóng mờ vẽ theo cách cũ.

### Mục 21: cỡ bậc 0,5, đạn 16 hướng

**`FA.bac05` chỉ áp ở chỗ cỡ là tuỳ ý:**

- vệt vũ khí `scVet` (cả đường `anhVk`)
- cào trúng đòn theo thân
- `hu-quai-chet`
- nổ ngẫu nhiên lúc trùm chết

**Không áp cho ảnh co theo bán kính vùng thật:** vũng (`hu-vung-*`), nổ có bán kính sát thương (`noAnh` r/40), chớp va chạm r/7.

**Lệch có chủ ý so với `bao-cao.md`.** Bản báo cáo gợi ý làm tròn cả "r/40". Nhưng làm tròn bậc 0,5 có thể làm hình lệch vùng thật tới 25%, và phiên này phải giữ hình khớp vùng chạm.

**Đạn xoay** (`fx_dan.js`): mũi tên ảnh và đạn ảnh có `xoay` dùng 16 hướng cố định (bước 22,5°). Đường bay không đổi. Bản báo cáo gợi ý "dựng sẵn 16 góc"; phiên này làm tròn góc lúc vẽ, cho cùng hình ổn định mà không cần thêm tấm nhớ.

### Mục 22: bớt việc vẽ

**Viền em bé** (`fx.js vienBe`): ba tấm viền chỉ dựng lại khi khoá hình đổi.

- Khoá lấy từ `G.zedMoi.khoaVe`: động tác, khung, vũ khí + góc làm tròn 2°, mặt, phần lẻ vị trí, nhún / nghiêng, màu viền.
- Đang nhuộm, trúng đòn, Gồng, ánh vũ khí chạy, hoặc em bé không phải bộ Zed: dựng mỗi khung như cũ.
- **Máy yếu:** Tiết kiệm pin bật hoặc `?fps=30` thì bỏ hẳn viền, đúng "máy yếu tắt" trong báo cáo. Thân bé vẫn vẽ đủ.

**Bộ nhớ thanh** (`ui_theme.js`):

- Khoá tấm nhớ không còn độ dài máu: chỉ khung thanh + một tấm vạch khắc. Phần đổ màu tô thẳng bằng `fillRect`, cùng thứ tự lớp nên hình y hệt.
- Bộ nhớ `layer` đầy 700 tấm thì xoá dần 80 tấm lâu không dùng (LRU), không xoá sạch.

**Quạt báo trước** (`bao_truoc.js quatSan`): dựng sẵn tấm quạt đã cắt lát theo ảnh, khung, góc mở và bán kính, nhớ tối đa 24 tấm. Mỗi khung chỉ xoay dán một lần.

**Vệt chém** (`fx.js quad`): đuôi thưa tô cả hàng ở độ đậm 50%, thay cho từng điểm ảnh bàn cờ.

**Mảng / hàm tạo mới mỗi khung:**

- `combat.js drawWorld` dùng lại mảng danh sách vẽ, và mỗi quái chỉ có một mục `{y, f}` tạo một lần.
- `G.coTro` / `G.timTro` thay `[...G.pointers.values()]` ở `ui.button` (mỗi nút mỗi khung), `ui_theme heldIn` và `stage.js` (3 chỗ).

**`ky_nang_quai.js goiBay`:** xét hồi chiêu và số quái trước, chỉ đếm đồng bọn khi đã có thể gọi. Kết quả giống hệt.

---

## 3. Ảnh / GIF tĩnh trước – sau

Thư mục `phien-3/`, dựng bằng `cong-cu/phien3.py` từ đúng ảnh sprite và đúng công thức trong code mới. Không chạy game. Cách chạy: `cd cong-cu && python3 phien3.py ../phien-3`.

| Tệp | Xem gì |
|---|---|
| `p3-01-noi-suy-120hz.png`, `p3-01-noi-suy-90hz.png` | Vị trí em bé trên màn mỗi lần vẽ (logic 60 nhịp, em bé chạy 90 điểm ảnh/giây, camera đuổi). Độ rung so với đường liên tục: **120 Hz 0,44 → 0,21; 90 Hz 0,45 → 0,15** điểm ảnh game |
| `p3-08-hu-trung-mo-dan.png/.gif`, `p3-08-hu-no-khoi-mo-dan.png/.gif` | Trúng đòn / nổ: trái tắt phụt; phải giữ khung cuối, mờ dần, nảy đầu |
| `p3-09-bao-truoc-hoa.png/.gif` | Vùng tròn báo trước 1 giây: trái 7 bậc; phải lan đều + nhịp sáng cuối |
| `p3-16-lap-cham-hoa.png/.gif` | `hu-bam-lua` 8,9 khung/giây: phải hoà khung kế |
| `p3-17-cu-ti-tho.png/.gif` | Cu Tí đứng thở: trái 1→8 rồi bật về 1; phải 1-2-3-4-5-4-3-2 |
| `p3-15a-chuyen-man.png` | Độ đen lúc chuyển màn |
| `p3-15b-bang-mo.png` | Cỡ / độ hiện lúc mở bảng |
| `p3-15c-thanh-kinh-nghiem.png` | Thanh kinh nghiệm chạy |
| `p3-15d-truyen.png` | Truyện hoà ảnh + chữ chạy |
| `p3-20-di-chay.png` | Cần đẩy dao động quanh 0,6: trái pha bước nhảy lung tung; phải pha liên tục |

**Số đo mục 22** (bot không trình duyệt `tests/node_trang.js`, canvas giả đếm lệnh). Ải 0-0, 3 quái, 300 khung, em bé chạy + đánh:

| | drawImage / khung | fillRect / khung | canvas tạo mới / 300 khung |
|---|---|---|---|
| `?venhe=0` (cũ) | 60,8 | 250,7 | 77 |
| mặc định (mới) | 53,3 | 252,7 | 74 |

- Viền bé dựng lại ở ~1/3 số khung khi chạy / đánh (84–94 khoá khác nhau / 240 khung). Khi đứng yên gần như không dựng lại.
- `fillRect` tăng nhẹ vì thanh máu tô thẳng, nhưng không còn sinh tấm nhớ mới mỗi lần máu đổi.
- Tiết kiệm pin: bỏ thêm ~18 lệnh vẽ ảnh / khung của viền.

---

## 4. Cách kiểm đã chạy

- `node --check` mọi tệp `game/js/*.js`: sạch.
- `python3 game/build.py`: xong, bản một tệp 27,9 MB / trần 30 MB.
- `node game/tests/cloud_save_regression.test.js`: PASS (đăng nhập Google, lưu mây không đổi; không đụng `cloud.js`, `cloud_ui.js`, không đụng apiKey; `?cloud=0` giữ nguyên).
- `node game/tests/su_kien.test.js`: PASS 83 điều kiện.
- **Chạy phần vẽ trong Node** (canvas giả, không trình duyệt, không chơi thử):
  - Nạp 182 tệp ảnh (hu-*, zed-*, gd-*, quái), đánh dấu ảnh sẵn sàng.
  - Chạy ải 300 khung có nội suy, bảng Tạm dừng, làng + bảng Hành trang, truyện.
  - Chạy vòng lặp `frame()` thật (đổi màn, mở / đóng bảng, bóng bảng).
  - Chạy cả khi bật hết cờ và khi tắt hết 9 cờ.
  - Kết quả: không lỗi (`G.fx.errs = 0`, không lỗi ngầm, `G.zedMoi.loi` rỗng).

---

## 5. Còn lại / cần người kiểm trên máy thật

**Thử trên máy thật** (như `bao-cao.md` dặn):

- điện thoại màn 90/120 Hz (mục 1)
- Android yếu với `?pin=1` / `?fps=30` (viền bé tắt, mục 22)

**Mở bảng rồi bấm ngay** (trong 0,12 giây đầu): nút phải trúng đúng chỗ đang thấy. Thử cả nút Đăng nhập Google ở Anh Mõ ngay lúc bảng vừa mở.

**Truyện:** chạm lần đầu lúc chữ đang chạy chỉ hiện hết chữ. Bài kiểm tự động nào bấm qua truyện bằng số lần chạm cố định có thể cần thêm một chạm mỗi trang, hoặc chạy với `?uimuot=0`.

**Chưa làm theo đúng chữ của báo cáo** (đã nói lý do ở trên):

- `hu-nam-con` không mờ.
- Mục 21 không làm tròn ảnh co theo bán kính vùng.
- Đạn 16 hướng là làm tròn góc, không dựng sẵn tấm.

**Không sửa** `village.js` và chỉ sửa `stage.js` ở 5 chỗ nhỏ: thanh máu quái, bọc bảng, 3 chỗ hỏi ngón tay. Đó là phần của phiên Bước 2.
