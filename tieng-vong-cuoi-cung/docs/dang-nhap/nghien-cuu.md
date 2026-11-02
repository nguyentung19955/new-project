# Nghiên cứu: đăng nhập Google + phiên 7 ngày (phiên "dangnhap", 02/11/2026)

Không hỏi được ChatGPT (máy đám mây không có Chrome) → tự đọc tài liệu Firebase Auth. Tóm tắt những điều đã dùng:

## 1. Giữ đăng nhập lâu dài (persistence)
- Firebase Auth trên web mặc định giữ phiên **cho đến khi đăng xuất** (`browserLocalPersistence` / IndexedDB). Phiên không tự hết hạn: ID token sống 1 giờ nhưng SDK tự làm mới bằng refresh token.
- `initializeAuth(app, {persistence:[...], popupRedirectResolver})` cho phép nêu **danh sách** cách lưu theo thứ tự ưu tiên; loại nào trình duyệt chặn thì SDK tự lùi sang loại sau. Game dùng: `indexedDBLocalPersistence` → `browserLocalPersistence` → `browserSessionPersistence` → `inMemoryPersistence`. Phải kèm `browserPopupRedirectResolver` thì popup/redirect mới chạy (initializeAuth không tự nạp).
  Nguồn: [Customize your Auth Dependencies](https://firebase.google.com/docs/auth/web/custom-dependencies), [platform_browser/index.ts](https://github.com/firebase/firebase-js-sdk/blob/939a060a67f097c51ee110723359ae5086c28530/packages/auth/src/platform_browser/index.ts).
- Safari Private / chặn hết lưu trữ: rơi về bộ nhớ → mở lại trang là thành khách mới (bản lưu trên máy cũng không còn – nên có Export save).

## 2. Safari / iPhone (ITP)
- Safari có **giới hạn 7 ngày** với dữ liệu do trang tự ghi (localStorage, IndexedDB): nếu người dùng **không mở trang đó** suốt 7 ngày dùng Safari thì dữ liệu bị xoá. Mở game ít nhất 1 lần/tuần thì không sao. Trang "Thêm vào Màn hình chính" (web app) được miễn.
  Nguồn: [What Safari's 7-day cap… means for PWA developers](https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519), [WebKit bug 211775](https://bugs.webkit.org/show_bug.cgi?id=211775).
- Hệ quả trùng hợp với yêu cầu: phiên Google tối đa 7 ngày; nếu Safari xoá sớm hơn thì người chơi chỉ cần đăng nhập lại (tiến độ trên mây vẫn còn).

## 3. Đăng nhập Google trên Safari: popup trước, redirect sau
- Safari chặn lưu trữ bên thứ ba → `signInWithRedirect` chỉ chạy ổn khi **authDomain cùng tên miền với trang game**. Game trên Firebase Hosting (`tieng-vong-cuoi-cun.web.app`) nên authDomain = chính tên miền đó (Hosting tự phục vụ `/__/auth/handler`) – đây là cách 1 trong tài liệu chính thức.
  Nguồn: [Best practices for using signInWithRedirect on browsers that block third-party storage access](https://firebase.google.com/docs/auth/web/redirect-best-practices).
- `linkWithPopup` / `signInWithPopup` phải gọi **ngay trong sự kiện chạm** (không `await` gì trước) thì Safari mới không chặn popup. Bị chặn → chuyển sang `linkWithRedirect` (chỉ khi cùng tên miền).
- Authorized domains phải có `tieng-vong-cuoi-cun.web.app` và `tieng-vong-cuoi-cun.firebaseapp.com` (GitHub Actions kiểm/tự thêm).

## 4. Mốc 7 ngày: claim `auth_time`
- ID token có `auth_time` = **lúc người dùng đăng nhập** (giờ máy chủ Google), KHÔNG đổi khi token tự làm mới mỗi giờ; `iat` = lúc cấp token. Đọc bằng `getIdTokenResult().authTime` hoặc giải phần giữa của JWT.
  Nguồn: [IdTokenResult](https://firebase.google.com/docs/reference/js/auth.idtokenresult). Mẫu chính thức của Firebase cũng dùng `auth_time` để buộc đăng nhập lại sau N phút: [Manage Session Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).
- Game: hết hạn khi `max(giờ máy, iat lớn nhất đã thấy) − auth_time ≥ SO_NGAY_PHIEN ngày`. Vặn lùi đồng hồ máy không kéo dài được, vì token mới (iat do máy chủ ghi) luôn cho biết giờ thật.
- Gắn Google vào tài khoản khách (link): nếu máy chủ không làm mới auth_time (tài khoản khách tạo từ lâu) → game **xác thực lại** bằng chính thông tin Google vừa nhận để có auth_time mới; không được thì dùng `iat` (giờ máy chủ) lúc vừa đăng nhập làm mốc dự phòng. Phép thử Emulator ghi lại máy chủ làm theo cách nào.
- Kiểm lúc: mở game; mỗi lần gửi lên mây; mỗi 10 phút; mỗi lần quay lại trang (iPhone để trang mở nhiều ngày).
- Không mạng: đọc token đã lưu (auth_time vẫn đúng) để kiểm; quá hạn thì vẫn đăng xuất được (không cần mạng), game vẫn chơi.

## 5. Tài khoản Google đã có bản lưu (`auth/credential-already-in-use`)
Làm đúng tư vấn ChatGPT (docs/firebase/tu-van-chatgpt.txt mục D): không đẩy tiến độ khách lên; lấy credential từ lỗi (`GoogleAuthProvider.credentialFromError`), `signInWithCredential`, kéo bản mây; khác bản máy → "Cloud save needs attention" + 2 nút **Use cloud save / Keep this device's save**.

## 6. Bật Google provider qua API
- Identity Toolkit Admin API: `GET/PATCH projects/{id}/config` (authorizedDomains, anonymous) và `projects/{id}/defaultSupportedIdpConfigs/google.com` (enabled, clientId, clientSecret).
- Bật lần đầu cần OAuth client (clientId/secret). Bấm "Enable" trong Firebase Console thì Google tự tạo client này; qua API thì phải tự có client → lần đầu nên bấm tay. Đã cấu hình mà đang tắt thì API bật lại được.
