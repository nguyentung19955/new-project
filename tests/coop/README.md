# Kiểm thử chơi nhóm (v141)

```bash
node tests/coop/run-all.js        # tất cả
node tests/coop/test-solo.js      # chơi đơn giữ nguyên hành vi
node tests/coop/test-lockstep.js  # 2 trang chơi nhóm
```

- Mở `index.html` bằng `file://` trong Chromium của Playwright (`--allow-file-access-from-files`), chặn `firebase-config.js` để không kết nối Firebase thật.
- `harness.js` có **RelayServer** — "máy chủ" trung gian chạy trong Node thay cho Firestore (cùng ngữ nghĩa: phòng, `cmds` chỉ tạo mới và chỉ người điều phối ghi, `reqs`, `snap`, mất mạng / có mạng lại). Mỗi trang dùng lớp `RelayNet` (cùng giao diện với `CoopFireNet` trong `js/coop.js`) qua `page.exposeFunction`.
- `test-lockstep.js`: tạo / vào phòng bằng giao diện; hai "người chơi máy" thao tác ngẫu nhiên trên nửa của mình tới đợt 7 → hash hai trang giống nhau ở mọi mốc chung; làm lệch dữ liệu một trang → phát hiện và tự đồng bộ lại; mất mạng → người còn lại điều khiển cả hai nửa, có mạng lại thì vào lại trận; tải lại trang → *Vào lại phòng*; hết trận → cả hai nhận Ngân khố, chơi đơn trở lại bình thường.
- Chạy nhanh hơn thời gian thật (`COOP_CFG.timeScale = 3`) nên mất khoảng 2–3 phút.
