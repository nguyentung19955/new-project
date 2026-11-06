# Đưa TURRET MERGE lên Firebase (làm 1 lần)

Sau khi làm xong, mỗi lần game được xuất bản, **https://turret-merge.web.app** tự cập nhật.
Link GitHub Pages cũ vẫn chạy như bình thường.

**a) Bật Hosting**
console.firebase.google.com → dự án **turret-merge** → **Build** → **Hosting** → **Get started** → bấm **Next** đến hết.

**b) Lấy khoá**
Bánh răng ⚙️ → **Project settings** → **Service accounts** → **Generate new private key** → tải file **.json** về.
⚠️ File này là MẬT KHẨU: không gửi cho ai, không dán vào chat.

**c) Cất khoá vào GitHub**
github.com/nguyentung19955/new-project → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
- Name: `FIREBASE_SERVICE_ACCOUNT_TURRET_MERGE`
- Secret: mở file .json, chép **toàn bộ** chữ trong đó, dán vào
- Bấm **Add secret**, rồi **xoá file .json** trên máy.

**d) Chạy lần đầu**
GitHub → **Actions** → **Deploy TURRET MERGE to Firebase** → **Run workflow** (hoặc chờ lần xuất bản sau).
Xong: mở https://turret-merge.web.app

---
Ghi chú kỹ thuật (không cần làm gì):
- Cấu hình: `firebase-thap.json` (đăng thư mục `thap/`), workflow: `.github/workflows/thap-firebase-hosting.yml`.
- Đăng nhập Google từ web.app: Firebase → **Authentication** → **Settings** → **Authorized domains** phải có
  `turret-merge.web.app` và `turret-merge.firebaseapp.com` (thường tự có). Nếu đăng nhập báo lỗi tên miền thì bấm **Add domain** thêm vào.
- Link mời bạn (SHARE LINK) tự dùng tên miền đang mở → mở từ web.app thì link mời là web.app, mở từ GitHub thì là github.io.
- Chưa có secret thì workflow chỉ hiện cảnh báo vàng, không báo đỏ.
