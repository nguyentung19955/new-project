# Trùm vùng gục ở pha 2, pha 3 — có ảnh rồi, đưa vào game (15/10 09:40)

Chủ dự án đã gen đủ 6 tấm theo `../trum-chet-pha3/PROMPT-ANH.md` (đọc tệp này và `../trum-chet-pha3/bao-cao.md` trước):
`docs/anh-goc/trum-moi/chet/{moc-tinh,ngu-tinh,ho-tinh}-{p2,p3}-chet.png` — mỗi tấm 8 khung xếp ngang.
**Lưu ý: 6 tấm này nền TRONG SUỐT (RGBA, ChatGPT tự bỏ nền), không phải nền xanh** — tách theo alpha. Hào quang/lửa/nước quanh thân có alpha mờ và các khung có thể chạm nhau (Hồ Tinh p2 khung 1–3, Ngư Tinh) → cắt theo cột hẹp nhất, không để mẩu khung bên cạnh lọt vào; cắt hào quang mờ quá yếu (alpha thấp) nếu nó làm dính khung.

Việc:
1. Tách mỗi tấm thành hàng `die` (8 khung, ~1,2 s, `"mo": 0.6`) trong đúng tệp `game/art/custom/<trùm>-p2` / `<trùm>-p3` (xem PROMPT-ANH: `SC.phaTrum` đã nhận hàng `die`, không phải sửa code). Dùng `tools/tach-quai` hoặc script tương đương.
2. Chuẩn cỡ: thân khung 1 hàng die khớp cỡ thân hàng idle/hit của cùng pha (AI vẽ cỡ khác) — đo thân, không đo hào quang. Căn chân cùng đường đất, căn tâm như các hàng khác của tấm đó (`can_tam` nếu tấm có).
3. Giữ đúng bảng màu/số màu như các hàng khác của tấm (lượng tử như tấm hiện có), alpha cắt sắc.
4. Bỏ đường tạm "chết bằng hàng trúng đòn" cho pha 2/3 nếu giờ đã có hàng die (chỉ khi code có nhánh đó; không vẽ code mới).
5. Ảnh soát `xem-trum-chet.png` (6 hàng die, cùng tỉ lệ với hàng idle của pha đó, vạch đất) + `xem-trum-chet.gif`.
6. Dung lượng "người chơi tải" trước/sau (trần 20 MB, `build.py`). Phiên `quai-moi-6-con` và `hieu-ung-ky-nang` chạy song song cũng thêm ảnh — nếu vượt trần thì giảm màu/cắt viền trống tấm của mình, ghi rõ.

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Pull --rebase cẩn thận, giữ thay đổi phiên khác. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
