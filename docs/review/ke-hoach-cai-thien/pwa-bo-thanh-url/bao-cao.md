# Báo cáo: PWA bỏ thanh URL + giữ đăng nhập 1–2 ngày (15/10/2026)

Làm theo `YEU-CAU.md` cùng thư mục. Không chơi thử game: kiểm bằng đọc code, `node --check` mọi `game/js/*.js` + `game/web/sw.js`,
`node game/tests/cloud_save_regression.test.js` (đạt hết), `python3 game/build.py` và `--hai-tep` (ảnh rời), và chạy thử riêng đoạn chọn
authDomain trong Node với 11 tình huống (bảng ở mục 3).
Không curl được `spiritblade.web.app` từ máy làm việc (proxy chặn tên miền này, lỗi 403 CONNECT) — nên phần "tệp có trên site" dưới đây là đọc
workflow đăng site, không phải tải về thật.

## 1. Nguyên nhân

Tóm tắt: **hai** nguyên nhân. (a) Trang thật trên site không có manifest (lỗi đóng gói, mục 3) → Android chỉ tạo lối tắt mở tab Chrome có thanh URL.
(b) Đăng nhập Google mở trang ở tên miền khác (mục 1) → cả iPhone lẫn Android hiện khung trình duyệt có thanh URL; iPhone còn đẩy sang Safari,
nên đăng nhập nằm ở Safari chứ không ở ứng dụng → "lại bắt đăng nhập".

### Mục 1 — Đăng nhập Google đi ra tên miền khác (NGUYÊN NHÂN CHÍNH)
- `game/js/firebase-config.js`: `authDomain = 'sontinhthuytinh.firebaseapp.com'`, còn game chạy ở `spiritblade.web.app`. Trang đăng nhập của
  Firebase (`/__/auth/handler`) vì vậy luôn mở ở **tên miền khác**, ngoài phạm vi (`scope`) của ứng dụng.
- `game/js/cloud.js` (hàm `google()`): code chuyển trang (`signInWithRedirect`) có sẵn nhưng đang TẮT (`void app`), **luôn dùng cửa sổ phụ**
  (`linkWithPopup` / `signInWithPopup`), kể cả khi mở từ màn hình chính. Ghi chú cũ: "chuyển trang bị mất kết quả" — đúng, vì với authDomain
  khác tên miền, Safari/Chrome chặn bộ nhớ bên thứ ba nên kết quả chuyển trang không về được.
- Ở chế độ ứng dụng, cửa sổ phụ sang tên miền khác:
  - **iPhone**: mở ra một khung Safari (có thanh địa chỉ) — hoặc mở hẳn sang ứng dụng Safari, nơi thanh địa chỉ nằm **ở dưới** (mặc định từ iOS 15).
    Ứng dụng ở màn hình chính trên iPhone có **bộ nhớ riêng**, tách hẳn khỏi Safari. Nếu người chơi xong đăng nhập lại chơi tiếp trong khung/tab
    Safari đó thì đang chơi trên Safari (có thanh URL dưới), còn ứng dụng ở màn hình chính vẫn là "Khách".
  - **Android (Chrome)**: cửa sổ phụ mở thành một thẻ Chrome có thanh URL; ứng dụng chỉ về toàn màn hình khi thẻ đó đóng lại.
- Đây đúng là trường hợp Firebase có hướng dẫn riêng ("signInWithRedirect trên trình duyệt chặn bộ nhớ bên thứ ba"), cách 1: cho `authDomain`
  bằng chính tên miền game khi game nằm trên Firebase Hosting **cùng dự án**.
- Kiểm: `.github/workflows/linh-khi-hosting.yml` đăng site `spiritblade` bằng `firebase --project sontinhthuytinh` → site nằm trong dự án
  `sontinhthuytinh`, Firebase Hosting tự phục vụ `/__/auth/handler`, `/__/auth/iframe`, `/__/firebase/init.json` trên `spiritblade.web.app`.

### Mục 2 — Link / điều hướng khác ra ngoài scope
Rà `game/js/*.js` và `game/index.html`: **không có** chỗ nào trong game chuyển trang hay mở trang khác (`location.href=`, `window.open`,
`<a href>`, `navigator.share`…). Bảng vàng, góp ý, chia sẻ đều vẽ trong canvas, không rời trang. Các trang công cụ (`xuong-sprite.html`,
`tach-*.html`, `linh-khi.html`) không có lối vào từ game. → Không phải nguyên nhân, không cần sửa.

### Mục 3 — start_url / scope / service worker (TÌM RA NGUYÊN NHÂN THỨ HAI, nặng nhất với Android)
- **Trang thật trên site KHÔNG có `<link rel="manifest">`.** `game/index.html` có thẻ này, nhưng `build.py` (hàm `trang()` trong `main()`) dựng
  trang đóng gói chỉ từ `<meta>`, `<title>` và link phông chữ → mất cả `<link rel="manifest">` lẫn `<link rel="apple-touch-icon">`. Bản build
  `--hai-tep` trước khi sửa: đầu `dist/linh-khi-nhe.html` (= `index.html` trên site) không có hai thẻ đó. Lỗi có từ lúc thêm PWA (commit 97f51cc4,
  09/10): commit đó sửa `index.html` mà không sửa `build.py`.
  - **Android (Chrome)**: không có manifest → không "cài" được ứng dụng; "Thêm vào màn hình chính" chỉ tạo **lối tắt** mở một tab Chrome bình
    thường → có thanh URL (nằm **dưới** nếu Chrome đang để thanh địa chỉ ở dưới). `display: fullscreen` trong manifest chưa bao giờ có tác dụng.
  - **iPhone**: vẫn mở như ứng dụng nhờ thẻ `apple-mobile-web-app-capable`, nhưng không có biểu tượng riêng (iOS chụp ảnh trang làm biểu tượng)
    — và vẫn dính lỗi đăng nhập ở mục 1.
  - Đã sửa: `build.py` giữ đúng 2 thẻ đó trong trang đóng gói (`linh-khi-nhe.html`, `linh-khi.html`), không có ở `artifact.html` và bản game thử
    của Xưởng Sprite; hàm `check()` cho phép đúng 2 đường tương đối này và **dừng gói** nếu trang mất manifest (để lỗi này không quay lại).
- `manifest.webmanifest`: `start_url "./"`, `scope "./"` (= cả site `spiritblade.web.app/`), `display "fullscreen"`, cùng tên miền. Đúng.
- Sau khi sửa: `dist/linh-khi-nhe.html` (→ `index.html`) có `<link rel="manifest" href="manifest.webmanifest">` và apple-touch-icon (đã kiểm bản
  build `--hai-tep` ảnh rời và `--mot-tep`). `game/web/*` (manifest, sw.js, biểu tượng) được workflow chép cạnh `index.html`.
- `main.js` đăng ký `sw.js` (đường tương đối, ở gốc site → phạm vi cả site). Đúng.
- `build.py` dòng ~600 (`re.sub(... manifest|apple-touch-icon ...)`) chỉ áp vào `tools/xuong-sprite/thu.html` (bản thử trong repo của Xưởng Sprite),
  không áp vào bản deploy — bản deploy mất manifest vì hàm `trang()` như trên, không phải vì dòng này.
- Có một chỗ phải sửa đi kèm mục 1: `sw.js` chặn MỌI yêu cầu cùng tên miền, nên khi trang đăng nhập chạy trên `spiritblade.web.app` nó sẽ bị
  sw.js lưu đệm và — lúc mất mạng — bị thay bằng trang game. Đã cho sw.js bỏ qua mọi đường `/__/`.

### Mục 4 — Android
Manifest xin `fullscreen`. Máy/trình duyệt nào không cho (hoặc biểu tượng cài dạng `standalone`/`minimal-ui`) thì còn thanh trạng thái / thanh
điều hướng. Trước đây chỉ có nút "Toàn màn hình" ở Anh Mõ. Đã thêm tự xin toàn màn hình ở lần chạm đầu (mục 2 dưới).

### Mục 5 — iPhone
`game/index.html` đã có `apple-mobile-web-app-capable=yes`, `apple-mobile-web-app-status-bar-style=black-translucent`,
`apple-mobile-web-app-title`, `apple-touch-icon`, `viewport-fit=cover`, biến vùng an toàn `env(safe-area-inset-*)`. Không có gì làm game thoát
chế độ ứng dụng ngoài chuyện đăng nhập ở mục 1. Lưu ý: iOS 26 có công tắc **"Mở dưới dạng ứng dụng web"** lúc "Thêm vào MH chính"; tắt công tắc
này thì biểu tượng chỉ là lối tắt mở Safari (thanh URL dưới). Hướng dẫn cài lại ở mục 4 nhắc bật công tắc này.

### Phần THÊM — vì sao "đăng nhập 30 phút rồi lại bắt đăng nhập"
Đọc code, các nghi vấn trong YEU-CAU:
- **Persistence**: `cloud.js` đã `setPersistence(LOCAL)` (indexedDB, lưu tới khi đăng xuất) và CHỜ xong rồi mới gắn `onAuthStateChanged`. Đúng, không phải SESSION/NONE.
- **Ẩn danh đè**: `signInAnonymously` chỉ chạy trong `onAuthStateChanged(null)` — tức là sau khi Firebase đã đọc xong bộ nhớ và thật sự không có ai.
  Không chạy sớm. Không có chỗ nào gọi `signOut`.
- **Service worker**: chỉ xoá tệp ảnh của bản cũ (`sprite_custom.js donBanCu*`), không đụng indexedDB / localStorage.
- Vậy nguyên nhân là **cùng gốc với mục 1**: tài khoản Firebase được lưu theo TÊN MIỀN + theo "nơi chạy". Trên iPhone, ứng dụng màn hình chính
  và Safari là hai kho riêng. Cửa sổ đăng nhập (tên miền khác) đẩy người chơi sang Safari; đăng nhập xong là đăng nhập **trong Safari**. Lúc sau
  mở lại từ biểu tượng (kho riêng của ứng dụng) thì vẫn là Khách → "lại bắt đăng nhập". Khoảng "30 phút" là lúc người chơi quay lại bằng biểu tượng,
  không phải Firebase hết hạn (Firebase tự gia hạn thẻ mỗi giờ qua `securetoken.googleapis.com`, không cần đăng nhập lại).
- Sau bản sửa: ở chế độ ứng dụng, đăng nhập chạy NGAY TRONG ứng dụng (chuyển trang trong cùng tên miền, chỉ trang chọn tài khoản Google là ở
  ngoài), tài khoản lưu vào kho của chính ứng dụng → mở lại sau 1–2 ngày (thực tế: tới khi đăng xuất) vẫn đăng nhập.
- Ghi chú: Safari có thể xoá dữ liệu trang web **không dùng 7 ngày liền** (ITP). Ứng dụng đã thêm vào màn hình chính trên iPhone thì không bị luật
  7 ngày này; chơi bằng tab Safari thì có thể bị. Trên iPhone, đăng nhập trong Safari và trong ứng dụng màn hình chính vẫn là 2 lần riêng (iOS tách
  bộ nhớ) — không sửa được bằng code; tiến trình vẫn chung vì cùng tài khoản Google.

## 2. Đã sửa gì

| Tệp | Sửa |
|---|---|
| `game/js/firebase-config.js` | Thêm đoạn chọn authDomain (KHÔNG đụng/không chép apiKey): khi **đúng site spiritblade** (`spiritblade.web.app` / `spiritblade.firebaseapp.com`), https, và **đang ở chế độ ứng dụng** (display-mode fullscreen/standalone/minimal-ui hoặc `navigator.standalone`) → `authDomain = location.hostname`. Mọi chỗ khác (tab trình duyệt thường, github.io, tên miền khác) **giữ authDomain cũ** như trước. Ghi trạng thái vào `window.LK_AUTH` (`moi`, `ly`). |
| `game/js/cloud.js` | `google()`: chế độ ứng dụng + authDomain mới → **chuyển trang** (`linkWithRedirect` cho khách, giữ nguyên tiến trình) thay cho cửa sổ phụ. Còn lại: cửa sổ phụ như cũ. Khi quay về (`getRedirectResult`): thành công → nhớ `lk_authmoi_ok`; tài khoản Google đã có tiến trình → cất bản lưu khách (`linhkhi_save_v1_khach`, như `guestKeep`) rồi chuyển tài khoản như cũ; không có kết quả / lỗi (trừ mất mạng) và máy chưa từng đăng nhập kiểu mới thành công → **tự quay lui** (`lk_authcu=1`), báo người chơi mở lại game rồi bấm Đăng nhập lần nữa (lần sau dùng cách cũ). |
| `game/build.py` | Trang đóng gói giữ `<link rel="manifest">` + `<link rel="apple-touch-icon">` (mục 3); `check()` dừng gói nếu thiếu manifest. Bản game thử Xưởng Sprite và `artifact.html` không có. |
| `game/dist/*.html` | Đóng gói lại. |
| `game/web/sw.js` | Bỏ qua mọi đường `/__/` (trang đăng nhập Firebase): không lưu đệm, không thay bằng trang game khi mất mạng. |
| `game/js/main.js` | Android, chế độ ứng dụng mà display-mode chưa phải `fullscreen`: lần chạm/nhấn đầu tiên gọi `requestFullscreen({navigationUI:'hide'})`. Mở lại game (quay từ ứng dụng khác) thì thử lại một lần. Không chạy trong tab trình duyệt thường, trong khung nhúng, trên iPhone. |

Không đổi: lưu mây (`push/pull`, Firestore), `?cloud=0` (vẫn tắt hẳn mây trước khi Firebase được nạp), luật Firestore, manifest.webmanifest, index.html.

### Cờ
- `?authcu=1` — dùng lại authDomain cũ (`sontinhthuytinh.firebaseapp.com`) + cửa sổ phụ, đúng như trước bản sửa. Máy **nhớ** lựa chọn này.
- `?authmoi=1` — bỏ nhớ `authcu` (kể cả tự quay lui); trong tab trình duyệt thường thì còn bật luôn authDomain mới cho lần mở đó (để thử trên máy tính).
- Lưu ý: trên iPhone, ứng dụng màn hình chính không nhận được `?…`, và bộ nhớ của nó tách khỏi Safari → cờ gõ trong Safari không ảnh hưởng ứng dụng.
  Trên Android (Chrome), ứng dụng và Chrome chung bộ nhớ → gõ `https://spiritblade.web.app/?authcu=1` trong Chrome là ứng dụng cũng theo.
  Cần quay lui cho mọi người: sửa 1 dòng ở `firebase-config.js` (`cfg.authDomain = location.hostname;` → bỏ dòng đó).

### Bảng thử đoạn chọn authDomain (chạy trong Node)
| Tình huống | authDomain |
|---|---|
| spiritblade.web.app, ứng dụng (fullscreen / standalone / iPhone standalone) | spiritblade.web.app |
| spiritblade.web.app, tab trình duyệt | sontinhthuytinh.firebaseapp.com (cũ) |
| tab trình duyệt + `?authmoi=1` | spiritblade.web.app |
| ứng dụng + `?authcu=1` | cũ (và nhớ) |
| ứng dụng, máy đã tự quay lui | cũ |
| ứng dụng + `?authmoi=1` sau khi quay lui | spiritblade.web.app (xoá nhớ) |
| github.io, sontinhthuytinh.web.app | cũ |

## 3. Chủ game cần làm (một lần, trên máy tính)

### 3a. "Authorized domains" (Firebase) — **không cần thêm**
`spiritblade.web.app` đã có sẵn: đăng nhập Google bằng cửa sổ phụ đang chạy được trên site này, mà Firebase chỉ cho chạy khi tên miền đã nằm trong
Authorized domains. Muốn tự xem: https://console.firebase.google.com → dự án **sontinhthuytinh** → **Authentication** → **Settings** → **Authorized domains**:
thấy `spiritblade.web.app` là được. Chưa có thì bấm **Add domain**, gõ `spiritblade.web.app`, **Add**.

### 3b. Địa chỉ quay về của Google — **CẦN THÊM** (nếu chưa có)
Đổi authDomain thì Google trả người chơi về `https://spiritblade.web.app/__/auth/handler`; Google chỉ cho về địa chỉ đã khai. Chưa khai thì trang
Google báo **"Lỗi 400: redirect_uri_mismatch"** — người chơi tắt hẳn game rồi mở lại là game tự quay về cách cũ (cửa sổ phụ, đăng nhập được như trước), nhưng thanh URL vẫn còn tới khi khai.
1. Mở https://console.cloud.google.com/apis/credentials (đăng nhập đúng Gmail chủ dự án), chọn dự án **sontinhthuytinh** ở ô chọn dự án trên cùng.
2. Mục **OAuth 2.0 Client IDs** → bấm vào dòng **Web client (auto created by Google Service)**.
3. Kéo tới **Authorized redirect URIs** → bấm **+ ADD URI** → dán: `https://spiritblade.web.app/__/auth/handler`
4. Bấm **SAVE** ở cuối trang. Chờ khoảng 5 phút.
5. Kiểm trên máy tính: mở `https://spiritblade.web.app/?authmoi=1`, bấm **Đăng nhập Google** → chọn tài khoản → về game, thấy tên Google là xong.
   (Thấy "redirect_uri_mismatch" là bước 3 chưa đúng/chưa lưu.)

## 4. Chủ game cài lại biểu tượng trên điện thoại

Làm SAU KHI bản mới đã lên site (xem tab Actions, workflow "Linh Khí lên spiritblade.web.app" xanh) và đã làm 3b.
Android: mục (a) hết ngay khi cài lại, không cần 3b; 3b chỉ để lúc đăng nhập không hiện thanh.

Tiến trình không mất (lưu trên mây theo tài khoản Google, và lưu trên máy).

### iPhone
1. Nhấn giữ biểu tượng **Linh Khí** ở màn hình chính → **Xoá ứng dụng** (hoặc "Xoá dấu trang") → **Xoá**.
2. Mở **Safari** (không dùng Chrome/Zalo/Facebook), vào `spiritblade.web.app`.
3. Bấm nút **Chia sẻ** (ô vuông có mũi tên lên; iOS 26: bấm **⋯** rồi **Chia sẻ**) → kéo xuống → **Thêm vào MH chính**.
4. Nếu có công tắc **"Mở dưới dạng ứng dụng web"** thì để **BẬT** → bấm **Thêm**.
5. Mở game bằng biểu tượng mới. Thấy vẫn có thanh địa chỉ thì là bước 4 bị tắt — xoá rồi làm lại.
6. Ở Anh Mõ (hoặc màn chào) bấm **Đăng nhập Google** → trang Google hiện ra (lúc này có thanh trên cùng là bình thường) → chọn tài khoản →
   tự về game, thanh biến mất. Từ nay mở lại không phải đăng nhập lại.
   Lưu ý: iPhone giữ đăng nhập của ứng dụng màn hình chính RIÊNG với Safari, nên lần đầu trong ứng dụng vẫn phải đăng nhập 1 lần.

### Android (Chrome)
1. Nhấn giữ biểu tượng **Linh Khí** → **Gỡ cài đặt** (hoặc kéo vào "Xoá").
2. Mở **Chrome**, vào `spiritblade.web.app`.
3. Bấm **⋮** (góc trên phải) → **Cài đặt ứng dụng** (nếu không có thì **Thêm vào màn hình chính** → chọn **Cài đặt**, không chọn "Tạo lối tắt").
4. Mở game bằng biểu tượng mới → chạm vào màn hình một lần: game tự xin toàn màn hình (nếu máy chưa tự mở toàn màn hình).
   Biểu tượng cũ là lối tắt tạo lúc trang chưa có manifest, nên **bắt buộc** gỡ và cài lại mới hết thanh URL.
5. Đăng nhập Google như bình thường (trang Google có thanh trên cùng, xong là tự về toàn màn hình).
   Android dùng chung đăng nhập với Chrome, đã đăng nhập trong Chrome thì ứng dụng cũng đã đăng nhập.

### Nếu đăng nhập trong ứng dụng bị lỗi
Game tự quay lại cách cũ ở lần mở sau (tắt hẳn game, mở lại, bấm Đăng nhập Google lần nữa). Làm 3b rồi để dùng lại cách mới:
- Android: mở `https://spiritblade.web.app/?authmoi=1` trong Chrome một lần, rồi mở lại ứng dụng.
- iPhone: xoá biểu tượng và cài lại như trên (ứng dụng mới bắt đầu sạch).

## 5. Chưa kiểm được
- Chưa thử trên iPhone/Android thật (yêu cầu không chơi thử). Không tải được tệp trên `spiritblade.web.app` từ máy làm việc (proxy chặn).
- Không biết chắc Web client OAuth đã có `https://spiritblade.web.app/__/auth/handler` chưa (không có quyền xem Google Cloud) → mục 3b, có tự quay lui
  nên đăng nhập Google không bị hỏng trong lúc chờ.
