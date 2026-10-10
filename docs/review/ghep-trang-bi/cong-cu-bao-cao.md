# Báo cáo phiên "ghep-cong-cu": trang Ghép Trang Bị

Ngày 10/10/2026. Trang mới: **https://spiritblade.web.app/tach-ghep.html** (tệp `tools/tach-ghep/index.html`).
Thanh menu của 4 trang Tách (Quái, Anh hùng, Đồ, Hiệu ứng) có thêm mục thứ 5 **"Ghép đồ"**.

## 1. Tóm tắt

| Phần | Tình trạng |
|---|---|
| Trang Ghép Trang Bị (chọn nhân vật, động tác, khung, thả nhiều tệp, mặc đồ theo từng ô) | **ĐÃ LÀM THẬT** |
| Xem: kết quả ghép / nhân vật gốc / chỉ lớp đồ / so sánh trước-sau, nền caro, phóng to, lưới, điểm neo, bật tắt từng lớp, chạy liên tục | **ĐÃ LÀM THẬT** |
| Đặt điểm thân AI bằng chạm/kéo (ghi vào `diem` hoặc `diem_theo`, nút "áp cho cả động tác") | **ĐÃ LÀM THẬT** |
| Đặt điểm món đồ trên ảnh món (`trang_phuc.diem`, tự ghi `co_chuan`) | **ĐÃ LÀM THẬT** |
| Chỉnh theo cặp: kéo để dời, xoay, co giãn (kẹp 0,8–1,25), lớp, ẩn ở động tác/khung, ảnh riêng (biến thể), "đã chỉnh" | **ĐÃ LÀM THẬT** |
| Lưu cho cặp này, chép sang nhân vật khác, khôi phục mặc định, tải `ghep-<tên>.sprite.json`, tải lại món đồ có điểm, tải tất cả .zip, lưu nháp trên máy | **ĐÃ LÀM THẬT** |
| Cảnh báo "Món này chưa hiệu chỉnh cho …", "điểm đang ước lượng", "co giãn/xoay quá giới hạn" | **ĐÃ LÀM THẬT** |
| Dùng API của game (`G.spriteCustom.diemNhanVat`, `datDo`) để kết quả giống hệt game | **ĐÃ LÀM THẬT** (phiên ghep-loi đã đẩy API, trang đã thử chạy với API) |
| Không sửa `game/js`, không thêm ảnh vào `game/art/custom/` | Giữ đúng |

Không phải sửa JSON bằng tay: mọi thao tác đều bằng nút và chạm.

## 2. Cách dùng từng bước (trên iPhone hay máy tính đều được)

**Bước 1 – Đưa đồ vào**
1. Mở https://spiritblade.web.app/tach-ghep.html.
2. Bấm một nhân vật: Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật.
3. Bấm khung có viền chấm "Bấm để chọn tệp" và chọn các tệp:
   - món đồ `tp-….sprite.json`, vũ khí `vk-….sprite.json`, hoặc tệp `.zip` tải từ trang Tách Đồ (kể cả `…_2-ban.zip`: trang tự lấy bản nét gấp đôi, bỏ bản thường);
   - thân AI `em-be-<tên>.sprite.json` (nếu có);
   - tệp đã lưu lần trước `ghep-<tên>.sprite.json`.
   Chọn nhiều tệp một lúc được.
4. Phần "Đang mặc": chọn món cho từng ô (Mũ, Áo, Đồ lưng, Bùa / đồ cầm tay, Mặt nạ, Cánh) và loại vũ khí. Món vừa thả tự mặc vào ô còn trống.
5. Có thân AI thì hai nút "Thân vẽ bằng code" / "Thân AI" để đổi qua lại.

**Bước 2 – Xem**
- Bấm động tác: Đứng, Chạy, Lấy đà, Đánh, Trúng đòn, Ngã, Lăn.
- "⏸ Dừng" để đứng ở một khung, ◀ ▶ để đi từng khung; "▶ Chạy liên tục" để xem chạy.
- "−" "+" để phóng to, thu nhỏ.
- 4 cách xem: **Kết quả ghép**, **Nhân vật gốc** (không đồ), **Chỉ lớp đồ**, **So sánh trước / sau** (trái: cách đặt cũ, phải: có ghép).
- Ô đánh dấu: nền caro, lưới điểm ảnh, điểm nhân vật (chấm xanh; chấm cam rỗng là **ước lượng**), điểm món đồ (chấm hồng), và "Hiện …" để tắt bật từng món.
- Hộp vàng bên dưới là cảnh báo; hộp xanh là đã ổn.

**Bước 3 – Chỉnh** (3 thẻ a, b, c)
- **a. Điểm của thân AI** (chỉ thân AI; thân code thì game tự tính ở mọi khung, không cần đặt):
  chọn tên điểm (cổ, vai trước, mắt…), rồi **chạm vào hình** ở bước 2. Chạm gần chấm có sẵn rồi kéo để dời.
  "Chỉ khung này" / "Cả động tác này" chọn chỗ ghi. Ở khung Đứng đầu tiên, điểm ghi vào điểm chung (`diem`).
  Nút "Áp các điểm khung này cho cả động tác" gom điểm riêng của khung thành điểm của cả động tác.
- **b. Điểm của món đồ**: chọn món, chọn tên điểm (tên in đậm là điểm nên có cho loại đồ này: mũ = đỉnh đầu, gáy; mặt nạ = mắt; áo = cổ, hai vai, hông/eo; đồ lưng = lưng; cánh = gốc cánh; bùa = eo; đồ cầm = tay trước), rồi **chạm lên ảnh món** phóng to. Kéo để dời.
- **c. Chỉnh theo cặp** (chỉ cho nhân vật đang chọn + món này, không đổi món gốc):
  kéo trên hình ở bước 2 để dời (hoặc mũi tên), nút xoay, nhỏ/to/hẹp/rộng/thấp/cao, chọn lớp (sau thân, sát thân, trước thân, trước cả tay),
  "Ẩn ở động tác này", "Ẩn ở khung này", "Dùng ảnh khác cho nhân vật này", "Đã chỉnh, đã duyệt".
  "Mọi động tác / Chỉ động tác này / Chỉ khung này" chọn chỗ ghi phần dời và xoay.

**Bước 4 – Lưu và tải**
- "Lưu cho cặp này": đánh dấu cặp nhân vật + món là đã chỉnh, đã duyệt.
- "Chép cấu hình cặp này sang: …": chép sang nhân vật khác (đánh dấu chưa duyệt để xem lại).
- "Khôi phục mặc định": bỏ hết chỉnh của cặp.
- "Tải tệp ghep-…": tải hồ sơ của nhân vật đang chọn.
- "Tải lại món đồ đã thêm điểm": tải món đồ (giữ nguyên ảnh, nét gấp đôi, mọi số cũ; thêm `diem`, `co_chuan`).
- "Tải tất cả (.zip)": mọi tệp ghép + mọi món đã có điểm.
- Trang tự lưu nháp trên máy (điểm, chỉnh). Ảnh không lưu nháp vì nặng: lần sau thả lại các tệp đồ và thân là mọi thứ hiện lại.
- Gửi các tệp tải về cho Claude để đưa vào game.

## 3. Cách trang vẽ

- Trang nạp **game thật** (`xuong-sprite.html`) trong hai khung ẩn:
  - khung "mới": đồ có điểm neo + tệp ghép;
  - khung "cũ": đồ đã bỏ điểm neo, không tệp ghép = cách đặt cũ (dùng cho "So sánh trước / sau").
- Game có API `diemNhanVat` / `datDo` (đã có từ bản ghép của phiên ghep-loi): kết quả ghép **do chính game vẽ**; điểm nhân vật, chỗ đặt món, "ước lượng" đều hỏi game. Trang đã thử chạy với API.
- Game cũ không có API: trang tự tính theo mục 4 của DINH-DANG-GHEP.md (hàm `datMonTuTinh`). Kết quả gần đúng; trang báo rõ điều này.
- Để xem đúng một khung của thân AI, trang thay hàm chọn khung `chonEmBe` **chỉ trong khung ẩn của trang** (không đụng game thật).

## 4. Định dạng

- Theo đúng DINH-DANG-GHEP.md, **không thêm trường mới**.
- Khoá `diem_theo` và `cap.theo` dùng tên động tác của định dạng: `idle`, `run`, `tele`, `atk`, `hit`, `die`, `ne` (và `run:3`…). Game đọc được cả tên kiểu khác (`move`, `dodge`…); tệp cũ có `move` thì trang đổi sang `run` khi nạp.
- `cap` mới tạo có đủ trường: `dx, dy, sx, sy, xoay, lop, bien_the, theo, da_chinh`.
- Toạ độ điểm làm tròn 0,5 điểm ảnh game.
- Nạp lại tệp ghép giữ nguyên mọi trường (kể cả trường lạ), nên lưu ra lại y như lúc nạp.

## 5. Đã kiểm

- `node --check` phần script của trang (tách script, `new Function`): không lỗi. `python3 game/build.py`: chạy được.
- Một lượt Playwright (điện thoại giả lập 390×844, chạm bằng ngón tay), 3 món thử tách nhanh từ `nguon/` (áo chàm, đồ lưng, dấu mặt) và một thân AI tự dựng (không đưa vào repo):
  - chạm đặt 4 điểm áo, 1 điểm đồ lưng, 1 điểm mặt nạ: ghi đúng toạ độ;
  - kéo dời áo, xoay, to hơn, lưu cặp, dời riêng 1 khung;
  - tải `ghep-smith.sprite.json` và món áo có điểm, mở trang mới (xoá nháp), thả lại: **tệp ghép giống hệt**, **chỗ đặt áo do game tính giống hệt**;
  - thân AI: chạm đặt "cổ" ở khung đứng đầu: game đọc đúng điểm, nguồn "tep" (không còn ước lượng);
  - không có lỗi trang.
- Không thêm ảnh nào vào `game/art/custom/`. Tệp thử để ở thư mục tạm, đã bỏ.

## 6. Chỗ chưa trọn, chọn cách hợp lý

- **Chỉ đề xuất / gần đúng** khi game KHÔNG có API: lớp "sát thân" và "trước thân" đều vẽ sau cả em bé, lớp "trước cả tay" vẽ sau cùng; cánh tự tính chỉ vẽ một lá (game vẽ hai lá, lá xa tối hơn). Nay game đã có API nên kết quả trên trang là của game.
- Ô xem "Chỉ lớp đồ" luôn dựng theo cách đặt (từ API khi có); lớp đồ cũ không có điểm neo lấy đúng hình game vẽ.
- Chỉnh theo cặp cho **vũ khí**: game đã đọc (`capVuKhi`), nhưng trang này chưa có ô chỉnh riêng cho vũ khí (chỉ chọn loại vũ khí để xem). **Đề xuất** thêm ở lần sau nếu cần.
- Thân AI lúc "Lấy đà": trong game chỉ hiện khung cuối; trang cho xem mọi khung để đặt điểm.
- **Cần vẽ lại ảnh**: trang báo khi phải co giãn ngoài 0,85–1,15 hoặc xoay quá 20° mới khớp (ví dụ áo thử rộng hơn vai thân code) — món như vậy nên vẽ lại cỡ nhỏ hơn hoặc dùng ảnh riêng cho nhân vật đó ("Dùng ảnh khác cho nhân vật này").
- Trang chỉ chạy đầy đủ trên trang web đã đăng (hoặc máy chủ cục bộ); mở tệp trực tiếp thì không nạp được game, vẫn đặt điểm và tải tệp được.

---

# Cập nhật 10/10/2026: trang Ghép đồ có sẵn MỌI ĐỒ và MỌI ĐỘNG TÁC

Ảnh: `anh-cong-cu-day-du.png` (cùng thư mục).

## Cách dùng ngắn

1. Mở https://spiritblade.web.app/tach-ghep.html, **chờ vài giây**: dòng "✔ Đã có sẵn 28 món trang phục ảnh AI và 40 vũ khí ảnh AI…" hiện ra là xong. Không cần thả tệp.
2. Bấm nhân vật. Nhân vật mặc sẵn **bộ khởi đầu** (nút "Mặc bộ khởi đầu" để mặc lại).
3. Phần "Đang mặc": mỗi ô (Mũ, Áo, Đồ lưng, Bùa / đồ cầm tay, Cánh) là một lưới hình nhỏ, **vuốt trong khung** để xem hết, **chạm để mặc**.
   - Nhãn **ảnh AI**: đồ ảnh có trong game (hoặc tệp vừa thả). Đặt điểm neo được (mục 3b).
   - Nhãn **vẽ code**: đồ vẽ bằng code. Không đặt điểm neo trên ảnh món được.
   - Dòng nhỏ dưới hình: "⚠ chưa có điểm neo", "• chưa chỉnh cho Thợ Rèn", "✔ đã chỉnh".
   - Cánh có thêm "Cấp 1 / 2 / 3". Ô Mặt nạ đã bỏ (game không còn mặt nạ).
4. Vũ khí: chọn **Loại**, **Dòng 0–9** (hình nhỏ, nhãn ảnh AI / vẽ code), **Hệ** (Thường, Lửa, Độc, Băng), **Giai đoạn** 0–3, **Bậc** (Thường, Lam, Tím, Vàng). Game vẽ y như trong trận.
5. Mục 2, chọn động tác theo nhóm:
   - Đi lại: Đứng, Chạy, Lướt, Lăn (chọn thêm hướng lăn: lên hẳn, chếch lên, ngang, chếch xuống, xuống hẳn).
   - Đánh: Đánh 1, 2, 3 (chuỗi), Đòn đặc biệt, Quét vòng (chỉ giáo), Lấy đà, Lấy đà vừa bước, Chưởng / phép, Gồng. Cầm cung thì là **Bắn tên**, **Giương cung** (chọn thêm hướng nhắm).
   - Bị đánh: Trúng đòn, Ngã.
   - Nút mờ là động tác không có với vũ khí đang cầm (ví dụ tay không thì không có Đòn đặc biệt).
   - **Thanh "Khung"**: kéo để đứng ở một khung. **Thanh "Tốc độ"**: chạy chậm hay nhanh. "▶ Chạy liên tục": chạy đúng nhịp như game (đòn chuỗi có lấy đà).
6. Mục 3, 4 dùng như cũ (đặt điểm, chỉnh theo cặp, lưu, chép, khôi phục, tải). Muốn thêm hay thay một món: thả tệp như trước, món thả vào thay món có sẵn cùng mã.

## Khoá ghi vào tệp ghép

- Thân code: "Chỉ động tác này" / "Chỉ khung này" ghi khoá riêng của động tác: `idle`, `run`, `atk` (ba đòn chuỗi dùng chung `atk:<khung>`), `spec`, `sweep`, `cast`, `tele` (lấy đà, giương cung), `dash`, `gong`, `hit`, `ne`, `die`.
- Game **đã đọc sẵn** các khoá này (hàm `khoaTheo` của phiên ghep-loi): `spec`, `cast`, `sweep` thiếu thì lấy `atk`; `dash` thiếu thì lấy `run`; `gong` thiếu thì lấy `idle`. **Không thêm khoá mới, không sửa game.**
- Thân AI chỉ có 7 động tác: chọn động tác không có (ví dụ Chưởng) thì trang hiện động tác AI gần nhất (Đánh) và ghi rõ trên trang; điểm và chỉnh ghi vào khoá AI đó.

## Cách trang lấy đồ

- Đồ ảnh AI: trang tải bản game đã gói (trang chủ spiritblade.web.app; trong repo là `game/dist/linh-khi.html`), đọc dòng `G.customSpriteData` (mọi tệp `game/art/custom` do `build.py` nhúng), lấy món trang phục và vũ khí: đủ ảnh gốc, `net` (nét gấp đôi), điểm neo, thông số. Nên "Tải lại món đồ đã thêm điểm" ra tệp giữ nguyên ảnh và `net`. Không sửa `build.py`.
- Đồ vẽ code: lấy từ `G.heroLooks` của game trong khung ẩn (ghi lại trước khi đưa ảnh AI vào). Món code đã có ảnh AI cùng tên thì không hiện riêng (game dùng ảnh AI) — trang ghi số món như vậy cạnh tên ô.
- Bản nháp chỉ lưu điểm neo **đã đổi** của món có sẵn. "Tải tất cả (.zip)" chỉ gồm món thả vào và món có sẵn đã đổi điểm.

## Đã kiểm

- Tách script + `new Function`: không lỗi. `python3 game/build.py`: chạy được. Workflow đăng web: **xanh, đã đăng** (lượt 38068693040).
- Một lượt Playwright (iPhone giả lập 390×844, chạm), mở trang không thả tệp: có 28 trang phục + 40 vũ khí ảnh AI và đồ vẽ code (13 mũ, 1 áo, 3 đồ lưng, 1 găng); mặc áo lá, mũ code, cánh lửa, bầu hồ lô; kiếm dòng 3 hệ Lửa giai đoạn 2 bậc Tím; chọn Đánh 3, Đòn đặc biệt, Lăn, Chưởng, Lấy đà, Giương cung, Quét vòng (giáo), kéo thanh khung; chỉnh áo lá "chỉ động tác này" ở Đòn đặc biệt ghi đúng `cap.theo.spec`. Không có lỗi trang (chỉ báo thiếu phông chữ do máy thử không có mạng, và các địa chỉ thử dò không có).

## Chưa trọn, chọn cách hợp lý

- **Chỉnh theo cặp cho đồ vẽ code**: trang cho chỉnh và lưu vào tệp ghép (khoá `code-<ô>-<tên>`, ví dụ `code-hats-trum_sung`) và vẽ thử trên trang, nhưng **game chưa đọc** (game chỉ áp `cap` cho đồ ảnh AI). Trang ghi rõ điều này. **Đề xuất**: nếu cần thì thêm vào `drawKid` (hero_tinhlinh.js) sau.
- Đánh chếch lên / xuống (8 hướng) của kiếm, giáo, búa: game có, nhưng khi xem theo động tác cố định thì game luôn đánh thẳng; trang chỉ cho chọn hướng nhắm với cung.
- Chưa có tệp thân AI nào trong game, nên phần "thân AI chỉ có 7 động tác" chưa thử với tệp thật (mã dùng lại phần cũ đã thử).
- Lần đầu mở trang phải tải bản game (~9 MB) để lấy ảnh đồ: trên điện thoại mạng chậm có thể chờ vài giây.
