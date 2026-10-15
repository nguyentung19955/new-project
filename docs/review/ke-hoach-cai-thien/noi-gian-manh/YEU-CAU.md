# Quái nổi giận phải mạnh rõ rệt (15/10 08:18 — chủ dự án)

Nguyên văn: "Quái nổi giận tôi chưa thấy khác biệt gì skill vẫn vậy, giảm thời gian cast hoặc tăng các đòn lên để nó mạnh lên chứ".

Hiện tại (`js/boss.js`): trùm vùng pha 2/3 chỉ nhanh ×1,1/×1,2, nghỉ 1,3→1,0→0,8 s, mở thêm c4/c5, vài chiêu thêm 1 hàng; trùm nhỏ ×1,08/×1,16 và đổi hình ở 50% máu ("chỉ là hình, chiêu giữ nguyên", `mobs.js:885`); tinh anh không có nổi giận. Người chơi không cảm nhận được.

Làm cho nổi giận / hóa cuồng THẤY và CẢM được (đọc kỹ cả `js/chieu_trum.js` — 10 chiêu mới — và kỹ năng quái con `js/ky_nang_quai.js`):

## Trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh)
| | Pha 1 | Pha 2 "nổi giận" (≤ 66% máu) | Pha 3 "hóa cuồng" (≤ 33%) |
|---|---|---|---|
| Tốc ra chiêu (cử động + báo trước) | ×1 | ×1,3 | ×1,55 |
| Nghỉ giữa chiêu | như cũ | ×0,7 | ×0,5 |
| Số đòn mỗi chiêu | như cũ | +1 đợt / +30% đạn, cột, gai (mỗi chiêu tự chọn cách tăng hợp lý, ghi bảng) | +2 đợt / +60% |
| Nối chiêu | không | 35% ra liền chiêu thứ hai (nghỉ 0,3 s) | 60% nối 2 chiêu, 20% nối 3 |
| Sát thương | ×1 | ×1,1 | ×1,2 |
| Di chuyển | ×1 | ×1,2 | ×1,4 |
| Mệt sau chiêu lớn (`tire`) | như cũ | ×0,8 | ×0,6 (vẫn có cửa phản công) |
**Sàn công bằng:** báo trước của mọi vùng KHÔNG ngắn hơn 0,45 s (vùng to/nhiều đợt ≥ 0,6 s), có vùng báo trên sàn như cũ; đạn bay nhanh hơn tối đa ×1,25.
**Nhìn thấy được:** lúc chuyển pha giữ chuỗi cử động/hiệu ứng hiện có; thêm dấu hiệu bền suốt pha: viền đỏ/hào quang nhấp nháy quanh thân (dùng ảnh `hu-*` có sẵn hoặc tô đỏ thân `tint` nhẹ có nhịp), mắt/hiệu ứng mạnh hơn; pha 3 thêm rung nhẹ khi trùm dậm và màn hơi đỏ ở mép. Biểu ngữ "nổi giận!/hóa cuồng!" giữ, thêm dòng nhỏ mô tả ("Ra chiêu nhanh hơn, nối chiêu").

## Trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa)
Pha 2 THẬT ở ≤ 50% máu (không chỉ đổi hình): tốc ×1,3, nghỉ ×0,65, mỗi chiêu +1 đợt, 40% nối chiêu, sát thương ×1,1, có biểu ngữ "{tên} nổi giận!" + dấu hiệu như trên.

## Tinh anh
Nổi giận ở ≤ 35% máu: tốc chiêu ×1,3, hồi chiêu riêng ×0,6, sát thương ×1,1, hào quang đỏ; một lần duy nhất.

## Cân bằng
Chạy bot cân bằng (`tests/cay.py ... --node`, như bước 1 — là mô hình tính số, KHÔNG phải test game) đo tỉ lệ thắng trùm trước/sau. Nếu tỉ lệ thắng ở mức Sức mạnh khuyên dùng tụt quá 10 điểm % thì hạ bớt hệ số sát thương (không hạ tốc/nối chiêu — cảm giác "mạnh lên" là mục tiêu) hoặc nâng nhẹ `G.STAGE_REC`; ghi cũ → mới.
Mọi hệ số gom vào một bảng `G.NOI_GIAN` (data.js) để chỉnh dễ. Cờ `?giancu=1` → như cũ.
Ảnh soát tĩnh `xem-noi-gian.png`: dòng thời gian một chuỗi chiêu mỗi trùm ở pha 1/2/3 (vạch báo trước, nổ, nghỉ) để thấy nhịp nhanh dần.
**KHÔNG TEST game** — chỉ ảnh soát tĩnh, bot cân bằng, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
