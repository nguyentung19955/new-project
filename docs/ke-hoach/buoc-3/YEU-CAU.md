# Bước 3 — LẬP KẾ HOẠCH chi tiết vùng 4 Sông sâu (CHƯA viết code game)

Chủ game: "lên kế hoạch thực hiện chứ chưa làm vội, lên kế hoạch từng bước một". Phiên này CHỈ đọc code + viết kế hoạch, không sửa game/.
Đọc: docs/cot-truyen/CHUNG.md (Thuồng Luồng, trống đồng, truyện mở), docs/thiet-ke-game.md, docs/ke-hoach/BUOC-2-3-4.md, cách 3 vùng hiện có
được làm (data.js vùng/ải/quái, monster_art.js def, boss.js, chieu_trum.js, ky_nang_quai.js, mapgen.js, room_art.js, env_art.js, truyen.js),
và quy trình ảnh đã dùng: docs/review/ke-hoach-cai-thien/quai-moi-bien/, quai-moi-lau/, hieu-ung-ky-nang/ (ảnh mẫu → khung que → 6 động tác:
1-dung, 2-di, 3-bao-don, 4-danh, 5-trung-don 4 khung, 6-chet), docs/anh-goc/quai-moi/que/ (khung que).

Viết docs/ke-hoach/buoc-3/KE-HOACH.md gồm:
1. Thiết kế vùng: tên, cảm giác, luật riêng của vùng (vd nước dâng, sàn trơn, dòng chảy) — vừa sức trẻ con; 5 ải; bố cục phòng.
2. 8 quái thường (tên Việt, tạo hình, hệ, cách đánh, kỹ năng riêng, khung que nào dùng được hay cần khung mới), 1–2 tinh anh, 1 trùm nhỏ,
   trùm vùng Thuồng Luồng 3 pha (chiêu từng pha, chỗ né, chống đứng sát mép ngay từ đầu). Dựa dân gian Việt, không trùng 30 quái cũ.
3. Truyện vùng 4: lời các trang, người cần cứu, mảnh trống thứ 4, câu móc sang vùng 5. Có cần cảnh truyện mới không.
4. DANH SÁCH ẢNH cần gen theo đúng thứ tự làm, mỗi ảnh một prompt ngắn tiếng Anh (chủ game thích prompt ngắn, mỗi prompt 1 code block),
   ghi ảnh mẫu kèm theo (đường dẫn tệp trong repo: ảnh mẫu phong cách quái heoCon-mau-moi.png, khung que, nền vùng cũ...).
   Gồm: ảnh mẫu từng quái/trùm → các tấm 6 động tác → nền / sàn / tường / cửa / đồ trang trí vùng → hiệu ứng chiêu → khung giao diện vùng nếu cần.
5. Chia việc code thành bước nhỏ, mỗi bước 1 phiên (2–3 phiên song song được), ghi tệp đụng tới, cờ quay lui; cân bằng bằng bot (khuyên dùng, kinh nghiệm, rơi đồ).
6. Dung lượng dự kiến (trần 20 MB người chơi tải; tải theo vùng).
7. Câu hỏi cần chủ game quyết (ngắn, có lựa chọn đề xuất).
Viết tiếng Việt dễ hiểu; phần kỹ thuật để cuối.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Không đụng master, không force push, không PR. Push (bị từ chối thì pull --rebase rồi push lại). Xong push, tự dừng.
