# Dọn ảnh / tệp / thư mục không còn dùng

Chủ game: "check xem ảnh hay các file nào, thư mục nào không dùng nữa thì bỏ đi". Repo hiện: docs/ 2,8 GB (docs/anh-goc 2,4 GB, docs/review 260 MB),
game/ 129 MB (game/art/custom 25 MB, game/dist 84 MB), .git 8,6 GB.

QUAN TRỌNG — đang có nhiều phiên khác chạy song song (Bước 2 phiên 0/A/B/C, bìa mới, PWA, soát mượt, sự kiện ải). Chỉ XOÁ tệp, không sửa nội dung
tệp code đang dùng trừ khi bắt buộc; pull --rebase ngay trước khi commit; commit nhỏ theo nhóm.

1. Lập danh sách theo 4 nhóm (ghi đường dẫn + dung lượng):
   (A) KHÔNG còn dùng ở đâu: không được code game (game/js, build.py, index.html, web/, sw.js), công cụ (tools/*, docs/**/cong-cu, *.py đang chạy được),
       tests, workflow .github, hay tài liệu đang có hiệu lực tham chiếu. Ví dụ hay gặp: ảnh tạm, bản cắt thử, -cat thư mục trung gian đã thành sprite,
       gif/png soát cũ của đợt đã đóng, __pycache__, tệp tạm, bản trùng (cùng md5).
   (B) Chỉ dùng cho cờ quay lui (?quaicu=1, ?vkcu=1, ?chopcu=1, ?vetaycu=1, ?khunganh=0, *-cu.sprite.json, monster_art vẽ tay...) — KHÔNG xoá,
       chỉ liệt kê + dung lượng + cờ nào cần bỏ theo, để chủ game quyết sau khi chơi thử.
   (C) Ảnh GỐC chủ game gen (docs/anh-goc/**: *-mau*.png, ảnh gen gốc 1 hàng động tác, ảnh truyện/bìa/giao diện gốc) — GIỮ (là nguồn để cắt lại).
       Chỉ xoá bản trung gian sinh ra từ chúng có thể dựng lại bằng script.
   (D) game/dist: tệp build sinh ra — chỉ giữ những gì workflow deploy đang dùng (.github/workflows/linh-khi-hosting.yml); xoá bản cũ thừa.
2. XOÁ nhóm (A) và phần thừa (D). Mỗi xoá phải chắc chắn bằng grep tên tệp / tên thư mục trên toàn repo (kể cả tên không đuôi, mã sprite trong JSON,
   mẫu tên trong script). Nghi ngờ thì để sang danh sách "chưa chắc", không xoá.
3. Thêm vào .gitignore những thứ sinh ra không nên commit (__pycache__, tệp tạm, ảnh soát dựng lại được nếu hợp lý).
4. Sau khi xoá: node --check mọi game/js, python3 game/build.py và --hai-tep chạy được, các test Node chính (tests/) chạy được, workflow tham chiếu đủ tệp.
5. Ghi chú về .git 8,6 GB: lịch sử git vẫn giữ tệp đã xoá; KHÔNG viết lại lịch sử (không force push). Chỉ ghi khuyến nghị trong báo cáo.
Báo cáo bao-cao.md: tổng dung lượng giải phóng (thư mục làm việc), danh sách đã xoá theo nhóm (gọn), danh sách (B) chờ chủ game quyết, danh sách "chưa chắc".
KHÔNG chơi thử game. Không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập Google / lưu mây / ?cloud=0.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong push, tự dừng.
