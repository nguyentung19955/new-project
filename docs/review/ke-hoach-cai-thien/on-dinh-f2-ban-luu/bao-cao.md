# F2 — Bảo vệ bản lưu (05/11/2026)

Mục tiêu: **không bao giờ mất tiến trình người chơi**. Làm theo mục 4 "HỆ THỐNG SAVE" của `docs/tu-van-toan-cau/chatgpt-05-11/on-dinh-chatgpt.txt`.
Không đụng tệp của F1 (workflow, firebase.json, build.py) và F3 (sprite_custom.js, vòng lặp engine.js). Không sửa luật Firestore.
Không đổi luật chơi / cân bằng.

**Tóm tắt cho chủ game:** bản lưu giờ có "số phiên bản" và "số lần lưu"; mỗi lần lưu trên máy đều ghi nháp trước, kiểm lại rồi mới thay bản chính,
và luôn giữ vài bản sao cũ. Bản lưu hỏng không còn bị thay bằng bản trắng: game hiện màn **Khôi phục** cho chọn bản sao.
Khi bản trên máy và trên mây khác nhau mà cả hai đều đã chơi tiếp, game **hỏi** (Dùng bản mây / Giữ máy này / Huỷ) thay vì tự chọn theo giờ máy.
Lưu mây chỉ ghi khi bản trên mây đúng là bản game đã đọc trước đó (không ghi đè lần lưu của máy khác), và giữ 3 bản sao mây gần nhất.
Muốn quay về cách lưu cũ y như trước: mở game với **`?luucu=1`**.

---

## 1. Kiểm kê: luồng cũ và các chỗ có thể mất dữ liệu

### Luồng cũ
- **Máy:** `js/engine.js` — `G.loadSave` đọc `localStorage['linhkhi_save_v1']` → `G.fixSave` (bọc thêm bởi linhkhi.js, vk_moi.js, luyen.js, su_kien.js, so_yeu_quai.js, ai_ngay.js, ep_do.js, mo_dan.js) → `G.save`.
  `G.persist` = `setItem` thẳng vào khoá chính. Bản lưu chỉ có `v: 1`, không có phiên bản / số lần lưu.
- **Bản sao lẻ tẻ đã có:** `_hong` (bản đọc lỗi), `_truoc_he_moi`, `_truoc_luyen` (một lần khi chuyển hệ), `_khach` (trước khi đổi sang Google).
- **Mây:** `js/cloud.js` — tự đăng nhập khách; `_onUser` → `pull()`; `push()` = `doc.set()` thẳng vào `linhkhi_users/{uid}` (gộp 4 giây).
  `pull()` chọn bản theo **giờ máy** (`updatedAt` mây so với `savedAt` máy), chỉ hỏi khi chênh "tiến độ" ≥ 8 điểm.
- **`?cloud=0`**: tắt mây, chỉ lưu máy. **Google:** liên kết khách (giữ uid) hoặc chuyển sang tài khoản đã có (`credential-already-in-use`).

### Chỗ nguy hiểm tìm thấy
| # | Chỗ | Nguy cơ |
|---|-----|---------|
| N1 | `G.loadSave` (engine.js) | JSON hỏng / `v` khác 1 / phần sửa lỗi → **trả bản trắng**; lần `G.persist()` kế tiếp (vào làng) **ghi đè** khoá chính. Chỉ còn một bản `_hong` (lần hỏng thứ ba trở đi ghi đè `_hong2`). |
| N2 | `G.persist` | Ghi thẳng một khoá, không bản sao. Bản lỗi do mã mới (migration sai) thay luôn bản tốt. Không phân biệt bộ nhớ đầy (lỗi bị nuốt im lặng). |
| N3 | `cloud.pull` | Chọn bản theo **đồng hồ máy** → máy chỉnh giờ sai / hai máy lệch giờ có thể lấy bản cũ đè bản mới. Chênh < 8 điểm thì không hỏi. |
| N4 | `cloud.pull` cuối | Bản máy mới hơn (theo giờ) → **ghi mây ngay lúc vừa đăng nhập**, không hỏi, không sao lưu bản mây cũ. |
| N5 | `cloud.push` | `set()` mù: máy khác vừa ghi thì bị ghi đè (không so-sánh-rồi-ghi). Không có bản sao mây. |
| N6 | Mất mạng → có mạng lại | Đẩy thẳng bản máy, không đọc lại mây trước. |
| N7 | Hai thẻ cùng mở | Thẻ cũ (dữ liệu cũ trong bộ nhớ) lưu sau → đè tiến trình thẻ mới. |
| N8 | Bản lưu "mới hơn mã" | Không có số phiên bản → mã cũ (bản web còn trong bộ nhớ đệm / quay lui) có thể hiểu sai; `v !== 1` thì thành bản trắng (N1). |
| N9 | Đổi sang Google đã có tiến trình | Bản khách chỉ được chép sang `_khach` khi đã qua ải; bản mây có thể tự thay nếu chênh ít. |
| N10 | "Xoá hết" | Không còn bản cũ để cứu. |

## 2. Đã sửa gì

### Tệp mới `game/js/luu_an_toan.js` (G.luuAT) — nạp ngay sau `js/engine.js` (thêm 1 dòng trong `game/index.html`)
- **Phiên bản bản lưu (mục 2):** thêm `schemaVersion` (=2), `saveId`, `revision`, `updatedAt`, `gameBuild`, `tgChoi` (thời gian chơi, chỉ để hiện).
  Giữ `v: 1` và **mọi trường cũ / trường lạ** → mã cũ (`?luucu=1`, bản web cũ) vẫn đọc được (đã kiểm). Nâng cấp tuần tự `G.luuAT.BUOC[1]` (1→2),
  `G.luuAT.nangCap()` là hàm **thuần**: chép rồi nâng, không sửa bản vào, không mạng / đồng hồ / ngẫu nhiên (saveId của bản cũ lấy theo nội dung).
  Bản có `schemaVersion` mới hơn mã → vẫn chơi được nhưng **không ghi đè** (máy lẫn mây) + màn "Cần cập nhật game".
- **Ghi máy an toàn (mục 4):** kiểm hợp lệ → ghi `_tam` → đọc lại xác minh → bản cũ sang `_bk1` (`_bk1` cũ sang `_bk2` khi đã quá 10 phút) →
  ghi khoá chính → đọc lại → xoá `_tam`. Thêm `_phien` (bản lúc mở phiên trước) và `_bk_doi` (bản cuối trước khi đổi sang bản lưu khác hẳn:
  Xoá hết, chọn bản khôi phục, nhận bản mây khác dòng). `revision` chỉ tăng khi nội dung đổi.
  Mở game: chọn bản hợp lệ tốt nhất giữa chính / `_tam` (lần ghi trước bị ngắt) / `_bk1` / `_bk2` / `_phien` / `_bk_doi`.
  **Bộ nhớ đầy:** bỏ `_tam`, `_bk2` rồi thử ghi thẳng một lần; vẫn đầy thì giữ nguyên bản cũ, báo "Bộ nhớ máy đầy". **Không bao giờ xoá khoá chính.**
- **Đọc lỗi không reset ngầm (mục 7):** khoá chính hỏng → bản hỏng cất ở `_hong` (bản hỏng khác ở `_hong2`), tạm dùng bản sao gần nhất,
  **khoá ghi** và mở màn **Khôi phục**: liệt kê bản sao trên máy → bản mây chính → bản sao mây (khi kết nối được); "Chơi mới" phải bấm hai lần.
  Không còn bản nào thì bản trắng chỉ để màn chào chạy, không ghi gì cho tới khi người chơi chọn.
- **Hai thẻ:** thẻ thấy khoá chính khác lần đọc/ghi cuối (hoặc nhận sự kiện `storage`) → thôi ghi, báo "Game đang mở ở thẻ khác" + nút Tải lại.
- **Màn hỏi** (xung đột / khôi phục / thông báo) vẽ trên canvas bằng `G.theme.panel / inset / btn` (khung + nút ảnh gd-* sẵn có), chữ VI + EN qua `G.t`
  (từ điển EN đăng ký bằng `G.ngonNgu.them`, không sửa tệp từ điển sinh tự động). Không mở giữa trận (chờ về làng / màn chào), trừ thông báo
  "thẻ khác" và "bộ nhớ đầy". Ảnh: `chon-ban-luu-vi.png`, `khoi-phuc-en.png` trong thư mục này.

### `game/js/cloud.js` — nhánh mới (nhánh cũ giữ nguyên cho `?luucu=1`)
- `pull()` → `pullMoi()`: đọc mây, nâng cấp + `G.fixSave` bản mây, quyết định theo **bảng mục 4.4** bằng hàm thuần `G.luuAT.quyetDinh`:
  mây trống → **không ghi lúc vừa đăng nhập**, lần lưu thật đầu tiên mới đưa lên · máy trắng + mây có → tải mây (bản máy cất `_xd_thietbi`) ·
  giống nội dung → không làm gì · một bản kế thừa bản kia (theo dấu lần đồng bộ cuối `linhkhi_luu_dongbo`) → đồng bộ bản mới ·
  hai bản tiến triển độc lập / chưa rõ lịch sử → **màn chọn** (Dùng bản mây / Giữ máy này / Huỷ), sao lưu cả hai (`_xd_thietbi`, `_xd_may`) trước ·
  mây hỏng → dùng máy, cất bản mây hỏng (`_may_hong` + trong bản sao mây) · mây phiên bản mới hơn → chặn ghi. **Không chọn theo đồng hồ, không cộng gộp.**
- `push()` → `pushMoi()`: **Firestore transaction so-sánh-rồi-ghi**: đọc tài liệu, chỉ ghi khi dấu (nội dung + updatedAt) đúng bằng lần đọc trước;
  sai → đọc lại và quyết định lại (thường là hỏi). `revision` trên mây luôn tăng. Ngoại tuyến: vẫn lưu máy, `dirty` chờ; có mạng lại transaction đọc trước rồi mới ghi.
  Đang chờ chọn / tạm dừng / bản mây chờ thay giữa trận → không đẩy. Bản mây chờ thay giữa trận: về làng **đọc lại và quyết định lại** (không đè kết quả ải vừa đánh).
- **Bản sao mây:** luật Firestore hiện hành chỉ cho `linhkhi_users/{uid}` với 5 trường (`save, updatedAt, prog, v, ver`), `save` < 400000 ký tự.
  Nên bản sao nằm **bên trong chuỗi `save`** (trường `_saoLuuMay`, tối đa 3 bản, cách nhau ≥ 15 phút hoặc khi đổi dòng / chọn "Giữ máy này"),
  tự bớt khi tài liệu > 380000 ký tự. Bản sao không xuống máy (bỏ khi nhận bản mây). **Không cần sửa rules.**

### Bài kiểm / test hạ tầng
- Mới: `game/tests/luu_an_toan.test.js` (47 mục), `game/tests/luu_may.test.js` (26 mục, Firestore giả trong Node), `game/tests/luu_lib.js`,
  `game/tests/fixtures-luu/` (6 bản lưu cũ + README).
- Sửa cho đúng API mới: `tests/fake_firebase.js` thêm `runTransaction` (thử lại khi tài liệu bị đổi, như Firestore thật);
  `tests/su_kien.test.js` mục 9 thêm `runTransaction` cho Firestore giả; `tests/may.py` mục "chon" viết lại theo luật mới
  (luật cũ "chọn theo giờ" chính là điều kế hoạch cấm) + thêm mục e kiểm `?luucu=1` vẫn hiện hộp HTML cũ.

## 3. Kết quả kiểm (05/11, máy chủ thử, Node + Chromium headless; không dùng tài khoản / dữ liệu thật)

| Bài | Kết quả |
|-----|---------|
| `node game/tests/luu_an_toan.test.js` | **ĐẠT 47/47**: nâng cấp thuần/tất định; 6 fixture nạp không mất vàng/sao/cấp/Luyện/trang phục/Page Scrap/trường lạ, lưu→nạp lại không đổi, mã cũ `?luucu=1` đọc được; JSON hỏng có/không bản sao; **đóng thẻ sau từng bước ghi** (tam / bk / chinh) → mở lại ra bản mới nhất; bộ nhớ đầy một phần / hẳn; hai thẻ; bản phiên bản mới hơn; ≥2 bản sao; Xoá hết cứu được; `?luucu=1`; màn hỏi bấm đúng toạ độ, dùng khung/nút ảnh |
| `node game/tests/luu_may.test.js` | **ĐẠT 26/26**: đăng nhập máy có / mây trống; máy trắng / mây có; giống; kế thừa hai chiều; độc lập → 3 lựa chọn; ghi chen giữa; ngoại tuyến → có mạng (mây không đổi / có máy khác ghi); mây hỏng; mây mới hơn; bản sao mây ≤3 & <400000; khôi phục từ mây; đổi sang Google đã có tiến trình; `?luucu=1` |
| `python3 game/tests/may.py chon` (trình duyệt, Firebase giả) | **ĐẠT 14/14** (chạm nút thật trên canvas). Một lần trong 4 lần chạy có 1 mục "mở lại không ghi thừa" hỏng do thời điểm tải lại; đã thêm số liệu vào dòng báo để lần sau soi. |
| `cloud_save_regression`, `su_kien`, `thanh_tuu`, `viec_ngay`, `bo_do_mua`, các test vùng 4 / trùm / sông | ĐẠT |
| `luyen.test.js` (mục 10 dòng khoá), `vung4_truyen.test.js` (mục 1) | Hỏng **cả trên bản gốc trước khi sửa** (chữ đổi tên Talesworn) — không liên quan bản lưu |
| `may.py` các mục khác (tat/luu/google/gopy…) | Có mục hỏng **cả trên bản gốc** (chữ tiếng Anh mặc định, nhãn nút đổi) — không do phiên này |
| Smoke test của F1 (`tools/phat-hanh/dong_goi_site.sh` + `smoke_dist.py`) sau khi rebase lên F1 | ĐẠT 14/14 (lưu → tải lại giữ nguyên, ?cloud=0, EN/VI) |
| `node --check` mọi `game/js/*.js` + test mới | ĐẠT |
| Dựng dist: `python3 game/build.py` + `LK_ANH_ROI=1 python3 game/build.py --hai-tep` | ĐẠT (cả hai lệnh thoát 0; `linh-khi.html`, `linh-khi-nhe.html`, `artifact.html` có `G.luuAT`) |

Chưa thử trên iPhone / Android thật (không có thiết bị). Firestore thật chưa chạy transaction từ phiên này (chỉ Firestore giả) — cần chủ game chơi thử trên staging/production.

## 4. Đề xuất luật Firestore (CHƯA áp dụng — chờ chủ game duyệt)
Không bắt buộc (bản hiện tại chạy với luật cũ). Nếu muốn bản sao mây nằm riêng thay vì trong chuỗi `save` (gọn hơn, không giới hạn chung 400000 ký tự),
thêm vào khối Linh Khí trong `game/firebase/linhkhi.rules`, rồi báo agent chuyển `_saoLuuMay` sang đường này:
```
match /linhkhi_users/{uid}/saveBackups/{rev} {
  allow read, delete: if request.auth != null && request.auth.uid == uid;
  allow create: if request.auth != null && request.auth.uid == uid
    && request.resource.data.keys().hasOnly(['save', 'updatedAt', 'prog', 'rev'])
    && request.resource.data.save is string && request.resource.data.save.size() < 400000
    && request.resource.data.updatedAt is number && request.resource.data.rev is int;
  allow update: if false;
}
```

## 5. Cờ quay lui
- **`?luucu=1`** — tắt toàn bộ phần mới: `G.luuAT.bat = false`, `G.loadSave` / `G.persist` của engine.js và nhánh `pull/push` cũ của cloud.js chạy y như trước
  (đã kiểm: không khoá tạm / bản sao, `pull` cũ ghi thẳng `set`, hộp HTML hỏi cũ). Bản lưu đã có trường mới vẫn đọc được ở chế độ này.
- Gỡ hẳn: xoá dòng `<script src="js/luu_an_toan.js">` trong `game/index.html` (cloud.js tự về nhánh cũ khi không có `G.luuAT`), dựng lại dist.
- Các khoá mới trong localStorage chỉ thêm, không thay khoá cũ: `linhkhi_save_v1_{tam,bk1,bk2,bkt,phien,bk_doi,xd_thietbi,xd_may,may_hong,hong2}`, `linhkhi_luu_dongbo`.

## 6. Dựng dist & commit
Đã chạy `python3 game/build.py` và `LK_ANH_ROI=1 python3 game/build.py --hai-tep` (bước WebP chạy nền, chờ xong): thoát 0. Cảnh báo "máy chủ quá 60 MB" là cảnh báo có sẵn về tổng ảnh, không do phiên này.

Commit: "F2 bảo vệ bản lưu: schemaVersion/saveId/revision + nâng cấp tuần tự, ghi máy an toàn …" (nhánh khoi-tao-du-an). Khi `git pull --rebase` bị đụng nhau ở game/dist (do F1 vừa dựng): lấy dist của F1 rồi dựng lại cả hai bản.

## 7. Đề xuất cho phiên khác (không tự sửa)
- **F1:** thêm `node game/tests/luu_an_toan.test.js` và `node game/tests/luu_may.test.js` vào CI (bước "save migration test"); `G.VERSION` (buildId) đang được ghi vào `gameBuild`.
- **F3 / vòng lặp:** khi `pagehide` / `visibilitychange → hidden` nên gọi `G.persist()` (lưu checkpoint) trước khi dừng vòng lặp.
- `js/luu_luot.js` (lưu giữa ải, khoá `linhkhi_luot_v1`) vẫn ghi thẳng một khoá — mất khoá này chỉ mất lượt ải đang dở, không mất tiến trình chính; có thể làm tương tự sau.
