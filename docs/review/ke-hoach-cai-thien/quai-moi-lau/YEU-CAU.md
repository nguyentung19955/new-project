# Đưa 10 quái Lâu đài cổ vẽ lại (6 động tác) vào game (15/10 17:00)

Làm y như phiên `quai-moi-bien` (đọc `../quai-moi-bien/YEU-CAU.md` + `bao-cao.md`, DÙNG LẠI `../quai-moi-bien/cong-cu/`, `../quai-moi-6-con/cong-cu/`) cho 10 mã:
`linhMa`, `doiThan`, `tuongDa`, `denLong`, `meoDen`, `huLua`, `tieuYeu`, `nhimThan`, `tuongMa`, `huChua`.

Ảnh đã cắt: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (1-dung idle, 2-di move, 3-bao-don tele, 4-danh atk, 5-trung-don hit 4 khung, 6-chet die). Ảnh mẫu `docs/anh-goc/quai-moi/<mã>-mau-moi.png`. Đủ cả 60 bước.

Lưu ý riêng:
- Loại thân: Dơi Than (bầy 3 con, bay — căn theo tâm bầy, giữ độ cao bay như tấm cũ; hàng chết rơi xuống đất), Đèn Lồng (bay lơ lửng; hàng chết rơi xuống đất). Còn lại có đất: Lính Ma, Tượng Đá, Tiểu Yêu, Tướng Ma, Hũ Lửa, Hũ Chúa (2 chân), Mèo Đen, Nhím Than (4 chân).
- Kỹ năng (`game/js/ky_nang_quai.js`, `chieu_trum.js`): Lính Ma hiện sau lưng chém (atk = quét chổi); Dơi Than bổ nhào chữ V; Tượng Đá đập đất (atk có vết nứt, bụi — giữ); Đèn Lồng lửa ma đuổi (đạn do code vẽ, ảnh atk chỉ chớp ở miệng); Mèo Đen bóng ảo (bóng dùng lại tấm của mèo); Hũ Lửa lăn tới rồi vỡ (atk = lăn tròn — có thể lặp khung 2–4 suốt lúc lăn); Tiểu Yêu đặt bùa tam giác (lá bùa do code/`hu-bua-tam-giac`); Nhím Than gai lửa trồi (code vẽ); Tướng Ma, Hũ Chúa là tinh anh: `chieu1/chieu2` dùng lại hàng gần nhất như các phiên trước; Hũ Chúa atk = đổ dầu (vũng dầu trong ảnh khung 4–5 là một phần dáng, vệt dầu thật vẫn là `hu-vet-dau`).
- Hàng chết đã khử ánh xanh; Lính Ma, Mèo Đen khung 5–6 và Đèn Lồng khung 6 là bản mờ dần của khung trước (AI vẽ mờ thành màu xanh).
- Chuẩn cỡ theo thân (nhiều tấm AI vẽ to/nhỏ khác nhau: Tướng Ma, Tượng Đá trúng đòn to hơn; Dơi Than các tấm cỡ dơi khác nhau).

Việc: dựng 10 tấm `game/art/custom/<mã>.sprite.json` (giữ `rong/cao` cũ, `net: 2`, `can_tam`, `goc`), thời gian khớp kỹ năng, mở rộng `?quaicu=1` cho 10 con, ảnh soát `xem-lau.png` + `xem-lau.gif`, dung lượng người chơi tải trước/sau (trần 20 MB; trước ~14,9 MB; nếu vượt thì giảm màu/viền trống, ghi rõ). Ảnh Lâu đài chỉ tải khi vào vùng.

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
