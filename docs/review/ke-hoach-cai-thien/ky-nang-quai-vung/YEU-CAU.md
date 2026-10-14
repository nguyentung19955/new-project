# Bộ kỹ năng quái con riêng theo từng vùng (14/10 19:48 — chủ dự án)

Nguyên văn: "Cho tôi 1 bộ skill quái con ở các cửa là khác nhau, tức là ở hang biển và rừng sâu tôi chơi thì thấy skill lặp lại ở quái kiểu cầu gai hay lao đến, thiết kế cho tôi 1 bộ skill khác nhau như vậy".

Hiện tại: 8 vai (`G.ROLES` data.js:481) dùng CHUNG cách đánh ở cả 3 vùng, chỉ khác hình (`G.MOB_ART` data.js:493). Việc này: mỗi con trong 24 con có cách đánh RIÊNG theo bảng dưới. GIỮ NGUYÊN vai (dùng để chia đợt, `cost` ở stage.js:121, máu/sát thương/tốc độ gốc của vai), chỉ thay hành vi tấn công + báo trước. Tinh anh, trùm nhỏ, trùm vùng: không đổi.

Luật chung cho mọi kỹ năng mới:
- Có báo trước rõ trên sàn (dùng hệ báo trước hiện có `bao_truoc.js` / ảnh `gd-bt-*`) ít nhất bằng thời gian báo trước của vai cũ; né được bằng lướt/chạy.
- Sát thương một lần trúng xấp xỉ vai cũ (lệch ≤ 10%), tần suất tương đương — không làm game khó hơn đáng kể. Vùng 1 dễ nhất, vùng 3 nhiều mẹo nhất.
- Dùng hàng động tác sprite: tele (báo đòn) → atk (đánh). Hiệu ứng: dùng lại ảnh `hu-*` đã có (đổi màu theo hệ nếu cần). THIẾU ảnh thì vẽ tạm tối giản bằng code và ghi prompt vào `PROMPT-ANH.md` (pixel art, nền #00FF00, dải 6–8 khung xếp ngang CÁCH XA NHAU, không bóng/chữ/logo; mỗi prompt một khối code riêng + tên ảnh mẫu cần gửi). Ảnh máy chủ đang 25,67/26 MB → KHÔNG thêm ảnh mới vào build trong phiên này.
- Lời chỉ dẫn vai (`stage.js:1406` và tương tự, bản tiếng Anh `ngon_ngu_en.js` + `tools/ngon-ngu/tu-dien`) viết lại theo từng con.
- Cờ `?kynangcu=1` → dùng lại cách đánh chung cũ.

## Rừng già (dễ, dạy cơ bản: đất, cây, độc nhẹ)
| Vai | Con | Kỹ năng mới |
|---|---|---|
| rusher | Heo Con | **Húc thẳng**: cào chân 0,6 s rồi lao một đường thẳng dài, trượt quá đà, đâm tường thì choáng 1 s. |
| swarm | Ong Vò | **Vòng vây chích**: bay vòng quanh người chơi 1 vòng rồi lần lượt từng con bổ thẳng vào (3 nhát nhỏ). |
| shield | Bọ Hung | **Lăn cầu đất**: giáp trước chặn đòn; đẩy một cục đất lăn thẳng chậm, chạm tường vỡ. Đánh từ sau/bên ăn đủ sát thương. |
| archer | Hoa Bào Tử | **Mưa bào tử**: bắn 3 hạt bay vòng cung rơi xuống chỗ người chơi, đáp đất thành vũng độc nhỏ 2 s. |
| nimble | Chồn Bóng | **Lẩn bóng**: mờ đi 1 s, hiện lại SAU LƯNG người chơi rồi cào 1 nhát (có dấu báo ở chỗ sẽ hiện). |
| kami | Nấm Phồng | **Nổ bào tử**: phồng to 1 s rồi nổ, để lại đám mây độc tồn tại 3 s (đứng trong mất máu chậm). |
| bomber | Sóc Nổ | **Ném hạt dẻ**: ném hạt dẻ cong, nảy 1 lần rồi nổ vòng nhỏ. |
| spiky | Nhím Độc | **Cuộn lăn**: cuộn tròn lăn thẳng, chạm tường bật lại 1 lần (không còn bắn cầu gai). |

## Hang biển (nước: kéo, đẩy, làm chậm)
| Vai | Con | Kỹ năng mới |
|---|---|---|
| rusher | Cua | **Lướt ngang kẹp**: chạy NGANG (trục X) tới thẳng hàng người chơi rồi kẹp hai càng (vùng hình quạt hẹp). |
| swarm | Cá Con | **Đàn sóng**: cả đàn bơi xuyên phòng theo đường hình sin, đi qua rồi vòng lại 1 lần. |
| shield | Ốc | **Rút vỏ**: đánh trúng thì rút vào vỏ 1,5 s (miễn sát thương), bò ra để lại vệt nhớt làm chậm 40%. |
| archer | Hải Quỳ | **Quạt tia nước**: bắn 3 tia nước hình quạt; người chơi đứng sát thì quét xúc tu vòng gần. |
| nimble | Cá Chuồn | **Vọt đáp**: nhảy vọt lên, bóng tròn báo chỗ rơi dưới người chơi, đáp xuống tạo vòng nước. |
| kami | Cá Nóc | **Hút rồi nổ gai**: phồng lên, hút nhẹ người chơi lại gần 1 s, rồi nổ 8 gai toả đều. |
| bomber | Sứa | **Vũng điện**: thả vũng điện nhấp nháy theo nhịp (sáng mới gây sát thương + choáng 0,3 s). |
| spiky | Nhím (biển) | **Gai xoắn ốc**: bắn gai theo vòng xoáy xoay dần (có khe để luồn), không bắn cầu gai đều. |

## Lâu đài cổ (ma, lửa: dịch chuyển, lừa)
| Vai | Con | Kỹ năng mới |
|---|---|---|
| rusher | Linh Ma | **Chớp chém**: đánh dấu điểm sau người chơi, biến mất rồi hiện ở đó chém một đường. |
| swarm | Dơi Thần | **Bổ nhào chữ V**: xếp hình chữ V bổ nhào qua người chơi; trúng thì hồi máu cho dơi. |
| shield | Tượng Đá | **Đập đất**: đứng im như tượng (giáp nặng); người chơi vào gần thì đập đất, sóng vòng lan ra. |
| archer | Đèn Lồng | **Lửa ma đuổi**: bắn quả lửa chậm đuổi theo người chơi 3 s; chém trúng thì tan. |
| nimble | Mèo Đen | **Phân thân**: tạo 2 bóng ảo chạy cùng; chỉ con thật nhận sát thương, bóng chạm thì tan (sát thương nhỏ). |
| kami | Hũ Lửa | **Lăn vệt lửa**: lăn tới, vỡ ra, để lại vệt lửa theo đường đã lăn 2 s. |
| bomber | Tiểu Yêu | **Bùa tam giác**: đặt 3 lá bùa thành tam giác, sau 1,2 s nối lại nổ cả vùng tam giác. |
| spiky | Nhím Thần | **Gai trồi**: gai lửa trồi từ đất thành hàng lan dần về phía người chơi. |

Ảnh soát tĩnh (Pillow, KHÔNG chạy game): `xem-ky-nang.png` — 24 ô nhỏ, mỗi ô sơ đồ vùng đánh/đường đi của một kỹ năng (vẽ từ đúng số trong code).
**TUYỆT ĐỐI KHÔNG TEST** — chỉ ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Xung đột với phiên trùm vùng (`trum-chet-pha3`, đang sửa boss.js/fx.js) khi rebase: giữ thay đổi của cả hai; game/dist lấy bản trên nhánh rồi build lại. Viết `bao-cao.md` (từng con: đã làm gì, số báo trước/sát thương so với cũ, ảnh còn thiếu).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
