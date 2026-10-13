> **CHỦ DỰ ÁN ĐỔI Ý (13/10 12:11): KHÔNG TEST. Bỏ 7 kiểm thử Playwright và phần quay GIF/đo so sánh; chỉ sửa code, kiểm cú pháp (node --check) rồi push để chủ dự án tự kiểm trên điện thoại.**

# Zed: Di chuyển + Tấn công đồng thời (13/10/2026)

Yêu cầu nguyên văn của chủ dự án ở cuối tệp. Mục tiêu: chạy liên tục, chân có nhịp chạy tự nhiên, tay chém dứt khoát, combo nối mượt, không giật khung, không khoá di chuyển, không trượt chân.

## Hiện trạng đã đọc (điểm xuất phát — tự kiểm lại trước khi sửa)
- `combat.js:771` tốc độ khi đánh = `MV.speedAtk(P)` → `G.CHAM_DANH.danh` (moves.js:209): kiếm 0.85, giáo 0.8, cung/phi tiêu 0.7, búa 0.55, tay 0.8.
- `combat.js:561` combo: nối nếu bấm trong `T.cd + 0.35` s; `combat.js:780` khi đang đánh không đổi `P.face` theo cần.
- Hướng đòn: `moves.js` `aimM` (P.aimX/aimY: quái gần nhất trong tầm → hướng cần → hướng đi cuối → mặt).
- Hình: `G.CHAY_DANH='than'` (sprite_custom.js:31): đang chạy mà đánh thì thân giữ hàng chạy, vũ khí vung theo neo khung đòn — trong `game/js/zed_moi.js` vũ khí KHÔNG nằm trong tay lúc này (báo cáo zed-tich-hop mục 9) → đây là lỗi hình cần sửa.
- Sprite Zed mới là TOÀN THÂN, 4 bộ trang phục (ninja/rung/bien/lau) dựng bởi `docs/anh-goc/zed/dung-zed-game.py`; neo vũ khí `docs/anh-goc/zed/gan-vk/neo.json`. Chạy = hàng `03-chay-v4` 12 khung, neo ngang theo tâm đầu (NEO_DAU/DAU_X).

## Việc cần làm
A. Kiểm tra cấu trúc animation + code hiện tại, ghi tóm tắt vào báo cáo (cái gì đã đạt, cái gì chưa so với 7 mục yêu cầu).
B. Code chiến đấu (combat.js, moves.js):
   1. Tách trạng thái di chuyển và trạng thái chiến đấu, timer riêng; bắt đầu đòn KHÔNG đặt vận tốc về 0, KHÔNG reset nhịp chạy (`P.chayT`/khung chạy).
   2. Tốc độ khi chém thường 0.85–1.0 (kiếm/giáo/phi tiêu/tay ≥ 0.9); chỉ đòn nặng (búa nện, nhát 3 kiếm, quét giáo, đặc biệt) giảm nhẹ (≥ 0.6). Không tự lao tới mục tiêu ở nhát thường (giữ các đòn lao vốn có của chiêu riêng như Xốc tới, Nhát lướt).
   3. Hướng chạy = cần; hướng chém = auto-target/hướng ngắm, CHỐT tại lúc ra đòn, không đổi giữa nhát; hết nhát mới cập nhật cho nhát sau.
   4. Combo 1→2→3, input buffer 100–150 ms (hiện đệm 0.25 s: chỉnh về ~0.13 s nếu không phá cảm giác; ghi lý do), nối ở điểm hợp lý (sau khung chạm, không bắt chờ khung cuối), giữ nút = tự combo theo nhịp. Hitbox/sát thương giữ đúng khung chạm (`hitAt`, MOC trong zed_moi.js).
   5. Ưu tiên Dodge > Hit/Stun > Attack > Run > Idle; Attack và Run song song. Dodge ngắt Attack trong cửa sổ cancel; hết Dodge mà còn giữ cần thì chạy ngay.
   6. Nhịp đánh cơ bản (thời lượng đòn, hitAt) KHÔNG đổi trừ phần buffer/nối combo nói trên.
C. Hình chạy + chém (toàn thân, chưa tách thân trên/dưới):
   - KHÔNG ghép đè hai sprite toàn thân. Làm ghép lớp CÓ CĂN CHỈNH ở THẮT LƯNG: chân (từ đai trở xuống) lấy từ khung chạy hiện tại; thân trên + tay + vũ khí lấy từ khung đòn hiện tại; khớp hai nửa theo điểm giữa đai (dò đai tự động trong script dựng, lưu dữ liệu đường cắt + điểm khớp cho từng khung, mỗi bộ trang phục). Viết script mới (ví dụ `docs/anh-goc/zed/cat-than.py`), xuất dữ liệu riêng, KHÔNG sửa BO_KHAC/dung_bo của dung-zed-game.py (đang có phiên khác thêm bộ Lâu đài vào đó) — nếu bắt buộc sửa thì pull --rebase trước và chỉ thêm, không đổi.
   - Chỉ bật ghép eo cho các hàng thân trên thẳng (kiếm 1, kiếm 2, thương đâm 1–3, ném phi tiêu, đấm, chưởng…). Hàng cúi người/khuỵu (kiếm 3 bổ xuống, búa nện, nện đất, quét, đặc biệt): khi chạy thì dùng toàn thân hàng đòn + giảm tốc theo mục B2 (≥ 0.6) — kiểm không bị trượt chân rõ; nếu trượt chân rõ thì báo.
   - Vũ khí phải nằm trong tay khi chạy-chém (neo lấy từ khung đòn, dịch theo phần thân trên đã khớp).
   - Không đổi cỡ, gốc, neo chân, tỉ lệ; pixel art sắc (imageSmoothing tắt, toạ độ nguyên).
   - Liệt kê CHÍNH XÁC các RunAttack còn thiếu (hàng nào, bao nhiêu khung) nếu ghép eo không đạt cho hàng nào — không tự dùng sai sprite.
D. Kiểm thử (chủ dự án YÊU CẦU lần này): chạy headless Playwright (Chromium có sẵn ở /opt/pw-browsers, KHÔNG `playwright install`), mô phỏng phím/cần cho 7 tình huống: (1) đứng chém liên tục (2) chạy phải chém liên tục (3) chạy trái chém phải (4) chạy chéo combo 3 nhát (5) đổi hướng cần giữa nhát (6) chạy + giữ đánh rồi lộn (7) thả đánh vẫn giữ cần. Mỗi tình huống ghi lại vận tốc, P.face, hướng đòn, combo index, khung thân dưới/trên theo thời gian; xuất GIF hoặc dải ảnh chụp vào thư mục này; ghi đạt/không đạt vào báo cáo.

## Luật
- Nhánh `khoi-tao-du-an`, KHÔNG master, KHÔNG force push, KHÔNG PR. Không chép apiKey. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Có cờ tắt `?chaydanh=0` về cách cũ.
- Push bị từ chối thì pull --rebase (có thể có phiên bộ Lâu đài vừa push), giải xung đột cẩn thận, không mất phần của phiên kia.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong viết `bao-cao.md` cạnh file này (tiếng Việt, mã commit, kết quả 7 kiểm thử, danh sách RunAttack cần bổ sung nếu có), push, tự dừng.

## Yêu cầu nguyên văn của chủ dự án
1. Di chuyển khi tấn công: giữ joystick thì tiếp tục chạy kể cả đang chém; không đặt vận tốc về 0 khi bắt đầu Attack; chém thường giữ 85–100% tốc độ; chỉ giảm nhẹ ở đòn mạnh/kết combo; không tự lao tới mục tiêu mỗi nhát.
2. Animation chạy + chém: chân tiếp tục Run; thân trên, tay, vũ khí làm Attack; sprite full-body thì dùng RunAttack riêng hoặc ghép lớp căn chỉnh chuẩn; tuyệt đối không ghép đè hai sprite full-body (bốn tay, bốn chân, bóng); không trượt chân, khựng, giật về Idle giữa combo.
3. Hướng chạy và hướng chém độc lập: joystick quyết định hướng chạy; auto-target/hướng ngắm quyết định hướng chém; chạy trái chém phải được; hướng chém chốt lúc ra đòn, không đổi giữa nhát; hết đòn cập nhật cho đòn sau.
4. Combo liên tục: Attack 1→2→3; input buffer 100–150 ms; chuyển combo ở điểm nối hợp lý, không bắt phát hết khung cuối rồi về Idle; không reset animation chạy mỗi nhát; giữ nút Attack thì tự combo theo nhịp; hitbox/sát thương đồng bộ khung chém.
5. Ưu tiên: Dodge > Hit/Stun > Attack > Run > Idle; Attack và Run song song; Dodge ngắt Attack trong cửa sổ cancel; hết Dodge còn giữ cần thì Run ngay.
6. Kỹ thuật: tách movement state và combat state; timer riêng; không reset velocity/Run animation khi Attack; deltaTime; không đổi kích thước, gốc, anchor chân, tỉ lệ; giữ pixel art, không làm mờ.
7. Kiểm thử bắt buộc: (1) đứng chém liên tục (2) chạy phải chém liên tục (3) chạy trái chém phải (4) chạy chéo combo 3 nhát (5) đổi hướng joystick trong lúc chém (6) chạy giữ Attack rồi Dodge (7) thả Attack vẫn giữ joystick: tiếp tục chạy, không khựng.
Kiểm tra cấu trúc animation và code trước khi sửa; ưu tiên sprite có sẵn; thiếu RunAttack thì liệt kê chính xác, không tự dùng sai sprite. Lâu dài: tách animation chân và thân trên.

## Bổ sung của chủ dự án (13/10, 12:00): "Trước hoạt ảnh vừa chạy vừa chém mượt hơn bây giờ"
- Bản Zed cũ (`?zedmoi=0`, đường vung `G.KIEM_MUOT`) chạy chém MƯỢT HƠN bản Zed mới hiện tại (`G.CHAY_DANH='than'`: thân giữ hàng chạy, vũ khí nhảy theo neo từng khung đánh, không nằm trong tay).
- Bắt buộc: bản mới sau khi làm phải mượt BẰNG hoặc HƠN bản cũ. Góc và vị trí vũ khí nội suy giữa các khung (không nhảy cóc), vũ khí luôn nằm trong tay, vào thế/ra thế êm như bản cũ (kiemMuot: vào thế êm suốt 0,33 đầu đòn).
- Kiểm thử thêm: quay GIF chạy chém bản cũ (`?zedmoi=0`) và bản mới cạnh nhau, đo độ lệch góc vũ khí mỗi khung (bản mới không được lớn hơn bản cũ), ghi số đo vào BAO-CAO.md.
