# Cua Đá (trùm nhỏ Hang biển) — chiêu "Tường tinh thể" quá dễ né, làm khó lên (15/10 17:10)

Chủ dự án chơi thử: chiêu Tường tinh thể (`game/js/chieu_trum.js` hàm `tuongTinhThe`, bảng `SO.cuaTuong`, gọi qua `CT.mini` cho `cuaDa` chieu2) **quá dễ né**.

Vì sao dễ (đọc code):
- Hai bức tường luôn dựng **cố định giữa phòng** (cx ± 70), không theo vị trí em bé → đứng xa giữa phòng là xong.
- Mảnh tinh thể bắn ngang từ tường chỉ dài tối đa `manhDai` 96 → đứng cách tường > 96 là an toàn tuyệt đối.
- Mảnh chạy theo hàng cách nhau `hang` 30, rộng `manhRong` 14 → khe an toàn 16 giữa hai hàng, đứng yên trong khe là không trúng.
- Báo trước 1 giây, chỉ một loạt mảnh (nổi giận mới thêm loạt).
- Tường chỉ làm vướng, chạm tường lúc trồi mới mất máu.

Việc — làm chiêu này **khó né thật** nhưng vẫn công bằng (sàn báo trước ≥ 0,6 s vùng to theo `G.NOI_GIAN.san`):
1. Tường **nhốt em bé**: hai tường dựng hai bên chỗ em bé đứng lúc ra chiêu (cách mỗi bên ~45–55, kẹp trong sàn), có thể thêm tường thứ ba chắn ngang phía trên hoặc dưới tạo hình chữ U/hộp hở một khe — phải có lối thoát rõ (một khe ≥ 24) nhưng phải chạy tới đó.
2. Mảnh tinh thể phủ **cả hai phía mỗi tường tới hết sàn** (bỏ giới hạn 96), và **2 loạt so le** (loạt 2 lệch nửa hàng, sau 0,45 s) ngay ở pha thường → không còn đứng yên trong khe được, phải di chuyển giữa hai loạt.
3. Trong lúc tường đứng (`giu`), Cua Đá **vẫn đánh tiếp** (một đòn đập càng / rung sàn nhắm em bé, báo ≥ 0,6 s) thay vì đứng chờ — tường thành chướng ngại thật.
4. Giữ / chỉnh số trong `SO.cuaTuong` (thêm khoá mới nếu cần), nổi giận vẫn cộng thêm như `G.NOI_GIAN` (pha 2 thêm loạt). Sát thương mỗi mảnh giữ như cũ hoặc giảm nhẹ nếu số nhát trúng tăng mạnh.
5. Cờ `?cuade=1` → chiêu như cũ.
6. Đo bằng bot cân bằng (`game/tests/balance.py`/`do_trum.py` của phiên `noi-gian-manh`, `--node`): ải 2-1, 2-2, 2-3 (trùm Cua Đá) thắng trùm trước/sau; mục tiêu: trùm khó hơn rõ (máu mất do chiêu này tăng ≥ 2 lần) nhưng thắng ải ở Sức mạnh khuyên dùng không tụt quá 12 điểm %. Nếu tụt quá thì hạ sát thương mảnh, không bỏ cơ chế.
7. Ảnh soát tĩnh `xem-tuong.png`: sơ đồ trên xuống trước/sau (tường, hàng mảnh, khe thoát, vị trí em bé) qua vài thời điểm.

**KHÔNG TEST bằng trình duyệt** — chỉ bot cân bằng Node, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên `quai-moi-lau` đang chạy song song (ảnh + sprite_custom) — pull --rebase cẩn thận. Viết `bao-cao.md` (ngắn, dễ hiểu).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
