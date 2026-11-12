# KẾ HOẠCH CHUYỂN ASTRAL ARSENAL SANG UNITY (viết 12/11/2026, phiên điều phối cũ — người dùng yêu cầu)

## 1. Vì sao chuyển, và mốc để coi là thành công
- Bản web trên iPhone XS Max (A12, 2018): máy nóng là còn 4–5 khung/giây ở co-op wave 27+ tốc độ 3×. Số đo 12/11: tính toán trận ~5 ms/khung, lệnh vẽ ~9–14 ms/khung, phần còn lại (~190 ms) là GPU tô điểm ảnh ở độ phân giải đầy đủ + Safari trộn lại canvas. Ép 1× thì lên 40–55 khung/giây, nhưng **người dùng chốt KHÔNG giảm chất lượng hình**.
- Unity giải quyết đúng chỗ đó: vẽ thẳng qua Metal (không qua lớp trộn của Safari), cắt sát viền sprite (bớt tô phần trong suốt), nén ảnh ASTC, hiệu ứng mờ vẽ ở bộ đệm thấp hơn, gom lệnh vẽ theo atlas.
- **MỐC ĐẠT (cổng quyết định ở Giai đoạn 0):** iPhone XS Max, cảnh mật độ như co-op wave 70 tốc độ 3×, chất lượng hình đầy đủ: ≥ 55 khung/giây trung bình, không dưới 40, suốt 10 phút, không văng, bộ nhớ < 600 MB. Không đạt ở Giai đoạn 0 thì DỪNG, không làm tiếp.

## 2. Quyết định kỹ thuật (đề xuất — sửa được trước khi bắt đầu)
- **Unity 6.3 LTS** (hỗ trợ tới 12/2027 — unity.com/releases/unity-6/support), **2D**, URP 2D Renderer, IL2CPP, Metal (iOS) / Vulkan-GLES3 (Android). KHÔNG làm 3D: hình hiện có là 2D, 3D nặng hơn và phải vẽ lại toàn bộ.
- Repo MỚI riêng (đề xuất `astral-arsenal-unity`); repo web giữ nguyên làm chuẩn đối chiếu.
- **Tách 2 lớp:** (A) LÕI LUẬT = C# thuần, không phụ thuộc UnityEngine, tất định (cùng hạt → cùng trạng thái), chạy được bằng `dotnet test` trên Linux; (B) TRÌNH BÀY = Unity (sprite, hiệu ứng, UI, âm thanh, nhập liệu) chỉ ĐỌC trạng thái lõi.
- **Bản web là "đề thi mẫu":** chuyển lõi bằng cách dịch từng file JS → C# giữ nguyên tên hàm/biến; với mỗi bộ bài + hạt, chạy trận bot ở web (đã có `tools/thap-bot-tran.js`) và ở lõi C#, so BĂM TRẠNG THÁI theo từng wave. Lệch = lỗi dịch. Đây là cách duy nhất giữ đúng 97 ụ + 12 trùm với hàng trăm ngoại lệ.
- Dữ liệu (data.js, bảng cấp thẻ, text EN/VI, bảng thưởng) xuất ra JSON bằng 1 công cụ ở repo web → Unity đọc; không gõ lại tay.
- Ảnh: 1 898 PNG (313 MB) → Sprite Atlas theo nhóm (ụ theo bậc, quái, trùm, hiệu ứng theo ụ, UI), ASTC 6×6 (UI/chữ 4×4), Tight Mesh; trùm + hiệu ứng ít dùng nạp theo nhu cầu (Addressables) để gói cài nhỏ.
- Online: Firebase Unity SDK, CÙNG dự án `turret-merge` (Auth Google/Apple + Realtime Database), giữ giao thức phòng 4 chữ + "lockstep-lite". Không chơi chéo web ↔ Unity (số thực có thể lệch giữa 2 nền).
- Lưu: bản app không đọc được localStorage của web → chuyển tiến trình QUA TÀI KHOẢN (hồ sơ Firebase gộp sẵn có). Vì vậy phần "tài khoản + lưu đám mây" (Giai đoạn F của web) phải xong ở web trước khi phát hành app.

## 3. GIỚI HẠN THẬT cần biết trước
- **Phiên Claude chạy trên máy Linux đám mây, KHÔNG mở được Unity Editor, không build được iOS, không nhìn thấy game Unity chạy.** Claude làm được: viết toàn bộ C# (lõi + trình bày), viết script Editor tự dựng scene / prefab / atlas từ ảnh, chạy test lõi bằng `dotnet`, đọc ảnh chụp / video / log người dùng gửi. KHÔNG làm được: bấm trong Editor, chỉnh tay bố cục, build ra máy.
- → Cần MỘT trong hai: (a) người dùng có máy Mac + Xcode + Unity 6.3 để mở dự án, bấm Build, cài lên iPhone (mỗi vòng thử ~10–20 phút của người dùng); hoặc (b) dựng build tự động trên GitHub Actions với máy macOS + giấy phép Unity (tốn công dựng 2–4 ngày, tốn phút macOS). Cả hai đều cần tài khoản Apple Developer (99 USD/năm) để cài bản thử qua TestFlight.
- Giấy phép Unity: bản Personal miễn phí dưới ngưỡng doanh thu — kiểm điều khoản hiện hành trước khi phát hành thu tiền.
- Ước lượng thời gian bên dưới là PHỎNG ĐOÁN (chưa có số đo); phụ thuộc nhiều vào tốc độ vòng thử trên máy thật.

## 4. Các giai đoạn
| GĐ | Việc | Ra gì | Ước lượng |
|---|---|---|---|
| **0 — Chứng minh hiệu năng** | 1 scene: bàn co-op, 30 ụ + 150 quái + đạn + quầng/hiệu ứng dùng ẢNH THẬT, mật độ wave 70 ở 3× (chuyển động giả, chưa có luật); nhãn FPS/bộ nhớ; build lên XS Max | Số đo 10 phút + video. **CỔNG: đạt mốc mục 1 mới đi tiếp** | 3–5 ngày |
| **1 — Lõi luật** | Dịch `game.js`, `data.js`, `skills*.js` (97 ụ), `trum.js` (12 trùm), wave có chủ đề, 4 quái mới, chỉ huy, các chế độ (Co-op, PVP + cúp, Race Track, Raid, Push, Tutorial); công cụ xuất JSON; bộ so băm với web | Thư viện C# + `dotnet test` xanh: 32 bộ × nhiều hạt khớp web tới wave 60 | 3–4 tuần |
| **2 — Trận đấu nhìn thấy** | Bàn, đường, ụ (đầu/bệ/dạng/sao), quái, trùm, đạn, hiệu ứng (`fx_*`, `p2_/p3_/sig_`), kéo–thả + chạm–chạm + gợi ý ghép, HUD trận, tốc độ 1–3×, tạm dừng | Chơi được trọn 1 trận co-op với máy trên iPhone | 3–4 tuần |
| **3 — Ngoài trận** | Trang chính, bộ bài, bộ sưu tập, rương/gacha/khe rương, QUESTS 3 thẻ, EVENT, SHOP, cấp phi công, lưu máy + lưu tài khoản | Vòng chơi đầy đủ 1 người | 2–3 tuần |
| **4 — Online** | Đăng nhập, phòng bạn bè, đồng bộ, bảng xếp hạng | Co-op 2 máy thật | ~2 tuần |
| **5 — Hoàn thiện + phát hành thử** | Âm thanh, 2 ngôn ngữ, hướng dẫn, tối ưu gói cài, TestFlight; bản Android | Bản thử cho người ngoài | 2–3 tuần |
Tổng: khoảng 12–16 tuần nếu vòng thử trên máy thật đều đặn. Sau GĐ 2 đã biết chắc game mượt hay không ở trận thật.

## 5. Trong lúc làm Unity, bản web thế nào
- Bản web = nơi thử luật + cân bằng + nguồn đối chiếu. **Đóng băng luật ở web vào ngày bắt đầu GĐ 1** (ghi commit mốc); luật mới sau đó ghi vào danh sách "chờ chuyển", làm ở web trước rồi dịch, để hai bản không lệch.
- Web chỉ làm thêm việc rẻ giúp đỡ giật mà không giảm độ nét: lớp quầng/hiệu ứng ở nửa độ phân giải, cắt sát viền ảnh, khoá 30 khung/giây đều khi máy nóng. Dừng "WebGL hoàn toàn" ở mức hiện tại.

## 6. Dùng lại được / phải làm lại
- Dùng lại: toàn bộ ảnh, âm thanh, chữ EN/VI, số liệu, tài liệu gốc (`TAI-LIEU-GOC.md`), bot + bảng cân bằng, dự án Firebase, thiết kế UI (làm mẫu bố cục).
- Làm lại: mọi mã (42 000 dòng JS: ~6 200 dòng luật ụ + lõi, ~750 trùm, ~6 000 vẽ + hiệu ứng, ~4 700 chế độ + kinh tế, ~1 850 online, phần còn lại UI); bố cục UI (dựng bằng script từ ảnh chụp web); 155 bài kiểm `thap-kt-*` → giữ phần luật dưới dạng so băm, phần giao diện kiểm bằng ảnh chụp trên máy.

## 7. Rủi ro chính
1. Không có Editor trong phiên Claude → mọi thứ phải dựng bằng mã; lỗi bố cục chỉ thấy khi người dùng build. Giảm: script Editor xuất ảnh chụp scene tự động khi build; người dùng gửi ảnh.
2. Lệch luật khi dịch (97 ụ, nhiều ngoại lệ) → so băm với web là bắt buộc, không bỏ qua.
3. Tất định số thực giữa iOS/Android cho online → dùng cùng bản build 2 bên; hàm lượng giác/căn dùng bảng tra hoặc thư viện số cố định ở phần ảnh hưởng luật.
4. Gói cài lớn (ảnh 313 MB) → atlas + ASTC + nạp theo nhu cầu; mục tiêu gói tải đầu < 200 MB.
5. Hai bản chạy song song kéo dài → đóng băng luật web (mục 5).

## 8. Việc cần người dùng quyết / chuẩn bị trước Giai đoạn 0
1. Có máy Mac + Xcode không? (không có → phải dựng build tự động trên GitHub, hoặc mượn/thuê Mac đám mây).
2. Tài khoản Apple Developer (để cài lên iPhone qua TestFlight).
3. Đồng ý tạo repo mới + đóng băng luật web khi vào GĐ 1.
4. Đồng ý cổng quyết định ở GĐ 0 (không đạt mốc thì dừng).

## 9. CẬP NHẬT 12/11 13:00 — người dùng chốt: LÀM TRÊN WINDOWS TRƯỚC (chưa lo build iPhone)
- Unity Editor chạy trên Windows của người dùng; chơi thử bằng nút Play. Build iPhone (cần macOS/Xcode) để SAU.
- Hệ quả phải nhớ: cổng hiệu năng XS Max ở Giai đoạn 0 bị LÙI lại → rủi ro làm nhiều tuần rồi mới biết máy thật có mượt không. Giảm rủi ro: (a) cảnh thử hiệu năng vẫn làm đầu tiên và đo trong Editor + bản build Windows để có số nền; (b) có điện thoại Android thì build thử ngay (không cần Mac); (c) chạy thử iPhone sớm nhất có thể khi có đường build (Mac mượn/thuê hoặc GitHub macOS).
- Vì sao ước lượng 12–16 tuần: phần lớn KHÔNG phải thời gian gõ mã mà là số vòng "người dùng mở Unity → Play → gửi ảnh/video → sửa" (Claude không thấy được Unity), cộng khối lượng phải SOI BẰNG MẮT (512 ảnh hiệu ứng, ~25 màn giao diện, 97 ụ × dạng). Rút ngắn được nhiều nếu: script Editor tự chạy cảnh + tự chụp ảnh ra thư mục (1 lần bấm, gửi cả lô); hoặc nối phiên Claude với máy Windows qua app Claude desktop để Claude tự chạy Unity ở chế độ dòng lệnh và tự xem ảnh; và cắt phạm vi đợt đầu (chỉ CO-OP + toàn bộ ụ, chưa online / chưa cửa hàng).
