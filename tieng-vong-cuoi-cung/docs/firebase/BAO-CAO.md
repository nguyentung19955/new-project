# Báo cáo phiên Lưu game bằng Firebase (firebase) – 02/11/2026 (lượt 2, cập nhật chiều)

## ✅ CẬP NHẬT 02/11 05:59 UTC: người dùng đã dán quy tắc Firestore – LƯU MÂY ĐÃ CHẠY
Kiểm tự động trên dự án thật: ĐẠT đăng nhập khách · ĐẠT đọc bản lưu · ĐẠT ghi bản lưu theo quy tắc mới. Phần "Việc bạn cần làm" bên dưới đã xong.

## Tóm tắt dễ hiểu
- **Link chơi (iPhone/máy tính): https://tieng-vong-cuoi-cun.web.app/** – đã cập nhật bản mới. Mỗi khi nhánh có thay đổi trong `game/`, GitHub Actions tự đưa lên lại.
- **Lưu mây đã làm lại 100% theo tư vấn ChatGPT** (`docs/firebase/tu-van-chatgpt.txt`): máy cũ **không bao giờ âm thầm đè** tiến độ của máy khác.
- **CÒN 1 VIỆC BẠN CẦN LÀM (2 phút):** dán quy tắc bảo mật mới vào Firestore (máy tự động không có quyền làm việc này). Chưa dán thì game **vẫn chơi và lưu trên máy bình thường**, chỉ là chưa lưu lên mây được (menu hiện "Cloud save needs attention").

## ⚠️ Việc bạn cần làm: dán quy tắc Firestore
1. Mở https://console.firebase.google.com/project/tieng-vong-cuoi-cun/firestore/rules
2. Xoá hết chữ trong khung, dán **toàn bộ** nội dung file này:
   https://github.com/nguyentung19955/new-project/blob/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/firestore.rules
   (bấm nút "Copy raw file" ở góc phải trên của trang GitHub).
3. Bấm **Publish**. Xong.

Kiểm lại: vào GitHub ▸ Actions ▸ `tvcc-firebase` ▸ "Run workflow" – bước "Kiểm dự án Firebase thật" sẽ ghi `ĐẠT Firestore: ghi bản lưu thử…`.
(Không bắt buộc – để lần sau máy tự cập nhật quy tắc: Google Cloud Console ▸ IAM ▸ tài khoản dịch vụ bạn đã tạo khoá cho GitHub ▸ thêm vai trò **Firebase Rules Admin**. Không tốn tiền.)

Tình trạng dự án thật (kiểm tự động trên GitHub Actions lúc 05:21 UTC):
- ĐẠT Hosting: game đã lên.
- ĐẠT Authentication: đăng nhập khách (Anonymous) hoạt động.
- CHƯA Firestore: quy tắc trên dự án vẫn là bản cũ → máy chủ từ chối ghi theo cấu trúc mới (cần bước dán ở trên).

## Lưu mây hoạt động thế nào
1. Mở game → tự đăng nhập **khách**, không cần làm gì. Game luôn lưu vào máy trước (chơi không cần mạng).
2. Khoảng 10 giây sau mỗi lần lưu (và khi ẩn/thoát trang) bản lưu được gửi lên mây. Chỉ khi máy chủ xác nhận mới hiện **"Cloud save up to date"**; đang chờ thì hiện "Saving to cloud…".
3. Máy mới / đã xoá dữ liệu trình duyệt: game chờ tối đa 2,5 giây để lấy bản lưu trên mây rồi mới hiện "Continue".
4. Nút **"Keep progress with Google"** trong menu Vùng 1: gắn tài khoản Google → sang iPhone/máy khác bấm nút đó, đăng nhập cùng Google là có tiến độ. Trên iPhone nếu cửa sổ bật lên bị chặn thì tự chuyển trang đăng nhập.
5. **Hai máy cùng chơi:** mỗi bản lưu có "số phiên bản". Máy nào ghi sau mà mây đã bị máy kia đổi → **không đè**, menu hiện "Cloud save needs attention" với 2 nút: **"Use cloud save"** (dùng bản trên mây) hoặc **"Keep this device's save"** (giữ bản máy này). Bản bị thay luôn được giữ 1 bản dự phòng (trên máy và trên mây).
6. Máy đang mở game mà máy khác vừa lưu bản mới hơn → hiện "Newer cloud save found · Reload to apply" (không đè game đang chạy).
7. **Export save / Import save** (menu Vùng 1): tải bản lưu ra file / nạp lại từ file. Dùng được cả khi không có mạng – phòng khi Safari tự xoá dữ liệu web.
8. **Không có mạng:** game vẫn mở được những phần đã từng mở (service worker `game/sw.js`, chỉ chạy trên link Firebase, không tải trước gì để tiết kiệm băng thông miễn phí), chơi và lưu trên máy; có mạng lại thì tự gửi lên. Trang bị chặn mạng hẳn (vd trong Artifact claude.ai) → lưu mây tự tắt, không lỗi.
9. Được đồng bộ: `tvcc-vung1`, `tvcc-chung`, `tvcc-he-thong`, `tvcc-an`, `tvcc-trang-bi-v1`. Vùng 1 và Làng Chuông đã nối.

## Đã làm lượt này
- `game/luu-may.js` bản 2: mỗi khoá 1 tài liệu `nguoi_choi/{uid}/ban_luu/{khoá}` (tenKhoa, du, revision, capNhat = giờ máy chủ, thietBi, saoLuuTruoc); ghi bằng **transaction**; đọc bằng `getDocFromServer`; không dùng đồng hồ máy để chọn bản; đổi tài khoản Google đã có bản lưu thì **không** đẩy tiến độ khách lên mà cho chọn; authDomain cùng tên miền trang game (Google trên Safari); chữ trạng thái theo đúng gợi ý ChatGPT.
- `firestore.rules`: đúng mẫu ChatGPT (chỉ chủ đọc/ghi, danh sách khoá cho phép, revision tăng đúng 1, tối đa 16.000 ký tự, không xoá).
- `game/sw.js`: chơi offline phần đã mở.
- Menu Vùng 1 (`game/vung-1/index.html`): dòng trạng thái, nút Google, 2 nút chọn khi xung đột, Export/Import – gọn 1–2 dòng vừa màn ngang iPhone.
- Làng Chuông (`game/lang-chuong/`): nạp lưu mây, chờ bản mây trước khi đọc (2 dòng).
- GitHub Actions `.github/workflows/tvcc-firebase.yml`: phép thử lõi + **Firebase Emulator thật** → triển khai Hosting → thử cập nhật quy tắc → **kiểm dự án thật** (kết quả ở trang tóm tắt của lần chạy).
- Không cần ảnh mới (chỉ chữ/nút trong menu có sẵn) → không ghi yêu cầu ảnh.

## Kiểm thử (đều đạt)
- `node tools/firebase/kiem-thu-luu-may.js` – lõi **27/27** (danh sách khoá khớp rules, revision, xoá máy rồi lấy lại, mất mạng, 2 máy ghi cùng lúc → xung đột không mất gì, chọn bản, đổi tài khoản Google, xuất/nhập, bản quá lớn, localStorage bị chặn).
- `node tools/firebase/kiem-tra-trinh-duyet.js` – Playwright + Firebase giả lập **24/24** (chơi → lưu → xoá localStorage → tải lại có tiến độ; Google 2 máy; xung đột hiện nút và chọn được; Export tải file, Import ở máy không mạng; rớt mạng rồi tự gửi; chặn mạng vẫn chơi; không lỗi JS).
- `tools/firebase/kiem-thu-emulator.mjs` trên GitHub Actions với **Firebase Emulator thật + firestore.rules**: **17/17** (gồm 10 phép kiểm quy tắc bảo mật: người khác không đọc/ghi được, khoá lạ, nhảy revision, quá lớn, trường lạ, xoá… đều bị chặn).
- Vùng 1: kiem-thu-f **66/66**, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0, kiem-tra-vung1 đi P01→P12 không thiếu hình (chỉ báo không tải được phông Google vì máy kiểm bị chặn mạng – bản gốc cũng y vậy). Cốt truyện: lưu chung 48/48, làng + trình duyệt đạt.

## Giới hạn gói miễn phí Spark (theo ChatGPT)
- Firestore: 50.000 đọc + 20.000 ghi mỗi ngày, 1 GiB. Mỗi lần mở game đọc 5 tài liệu; ghi gom 10 giây/lần → thừa cho vài chục người chơi/ngày.
- Hosting: 10 GB lưu trữ, **360 MB tải/ngày**. Dung lượng thật đưa lên: **~20 MB / 828 tệp** (`art/` trong repo ~60 MB, nhưng ~17 MB ảnh nguồn `*-nguon-chatgpt.png`, thư mục `art/kiem-khach-thiet-ke/`, `docs/`, `tools/`, *.md/*.py/*.txt đều bị `firebase.json` loại – con số "~700 MB" ở báo cáo trước là sai). Một người tải TRỌN game ~20 MB → tối đa ~18 lượt tải trọn/ngày; thực tế người chơi chỉ tải phần đang chơi và service worker giữ lại ảnh đã có, nên lần mở sau gần như không tốn. Mỗi lần triển khai chỉ tải lên tệp đổi; nên vào Hosting ▸ "Release storage settings" đặt giữ **2–3 bản** cũ.
- Hết hạn mức thì chỉ **tạm ngừng** đến hôm sau, **không tự tính tiền**. Tuyệt đối không bấm "Upgrade/Blaze", không thêm thẻ.

## Chưa làm (theo thứ tự ưu tiên của ChatGPT – để sau)
- Tự hợp nhất tiến độ không đảo ngược (trùm đã hạ, kỹ năng đã mở) khi xung đột – hiện cho người chơi chọn.
- App Check – ChatGPT khuyên bản đầu chưa cần.
- Màn "Pause → Settings → Save & Cloud" như ChatGPT gợi ý: Vùng 1 hiện chưa có màn tạm dừng/cài đặt, nên các nút lưu mây + Export/Import tạm đặt ở menu chính (chữ đúng như ChatGPT gợi ý). Khi có màn Pause thì chuyển sang đó.
- Thử thật trên iPhone Safari (đăng nhập Google, khôi phục tiến độ) – cần bạn mở link trên iPhone sau khi dán quy tắc.
- Lượt này chạy trên máy chủ đám mây theo lịch, không có Chrome nên không hỏi thêm ChatGPT được; mọi thay đổi đều làm theo bản tư vấn đã lưu.

## Cho các phiên khác (vùng mới)
Trong trang, trước script game: `<script src="../firebase/cau-hinh.js"></script><script src="../luu-may.js"></script>`;
trước khi đọc bản lưu: `if (window.LuuMay && LuuMay.coMay()) await LuuMay.cho(2500);`.
**Khoá lưu mới** (vd `tvcc-vung2`) phải thêm vào CẢ `KHOA_CHO_PHEP` trong `game/luu-may.js` VÀ `allowedKey` trong `firestore.rules` (phép thử lõi báo hỏng nếu lệch), rồi dán lại quy tắc.
