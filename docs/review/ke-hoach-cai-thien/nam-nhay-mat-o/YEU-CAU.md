# Lỗi: Nấm Phồng Chúa (tinh anh) tung chiêu "Nhảy dập / Mưa bào tử" hay bị MẤT 1 Ô độc trên sàn (15/10 12:40)

Chủ dự án chơi ải 1: tinh anh Nấm Phồng Chúa nhảy 3 lần, mỗi lần đáp để lại một ô (vòng) độc trên sàn — nhưng hay chỉ thấy 2 ô, mất 1 ô.
Code: `game/js/chieu_trum.js` hàm `namPhongNhay` (SO.namPhongNhay: lan 3, dau 0.2, cach 0.4, bao 0.6, bay 0.35; TEN dur 1.9, T 0.7), `song()`, `G.mobZone(... cancel: true, then: S.may ...)`, `nhay()`/`ctNhay`, `G.later` (mobs.js). Phiên 15/10 `noi-gian-manh` vừa thêm nổi giận tinh anh (≤35% máu: tốc chiêu ×1,3, báo trước chia 1,3 nhưng sàn 0,6 s chiêu riêng) — `docs/review/ke-hoach-cai-thien/noi-gian-manh/bao-cao.md`. Phiên `quai-moi-6-con` đổi ảnh Nấm Phồng Chúa (hàng chieu1 dùng lại tele/atk).

Việc:
1. Tìm đúng nguyên nhân (ví dụ: lượt nhảy đầu báo trước lúc T - 0,4 < 0 khi tốc ×1,3; `o.end`/`D` bị chia tốc làm `e.act` kết thúc trước lần nhảy 3 nên `song()` sai; `cancel: true` huỷ vùng khi tinh anh bị đánh choáng/ngắt; vùng trùng chỗ đè lên nhau vì `xa` 60 bị kẹp `trong()` sát tường; ảnh `hu-no-doc`/mây độc không hiện...). Dùng mô phỏng Node (luật game chạy trong Node như `game/tests/node_trang.js`, bot cân bằng) ghi lại lượt nhảy và vùng tạo ra qua nhiều lượt, có và không nổi giận, có và không bị đánh.
2. Sửa để mỗi lần tung chiêu luôn đủ 3 ô độc đúng 3 chỗ đáp (trừ khi tinh anh chết). Nếu bị choáng giữa chừng thì chiêu dừng hẳn và báo rõ (không để vòng đỏ báo mà không nổ) — ghi rõ chọn cách nào.
3. Rà nhanh các chiêu nhiều lượt cùng kiểu `G.later` + `song()` của tinh anh/trùm nhỏ khác (Phồng lăn Cá Nóc Chúa, Đổ dầu Hũ Chúa...) xem có cùng lỗi không, sửa luôn nếu cùng nguyên nhân.
4. Ảnh soát tĩnh `xem-nam-nhay.png`: vị trí 3 ô qua vài lượt mô phỏng trước/sau.

**KHÔNG TEST game bằng trình duyệt** — chỉ mô phỏng Node, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Viết `bao-cao.md` (ngắn, có nguyên nhân bằng lời dễ hiểu).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
