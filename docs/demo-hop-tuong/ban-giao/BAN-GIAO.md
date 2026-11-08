# BÀN GIAO — TURRET MERGE (07/11/2026, 05:25 giờ VN)

> For the next Claude session/account: read this whole file first. Write to the user in **Vietnamese**; write prompts for other sessions/ChatGPT in **English**.

## 1. Dự án
- Game: **TURRET MERGE** — merge tower-defense kiểu DCDW (운빨존많겜 / Lucky Defense), 93 ụ, 12 trùm, chỉ huy; SOLO / CO-OP / PVP / ONLINE.
- Repo: `nguyentung19955/new-project`
  - Nhánh làm việc: `claude/demo-hop-tuong`, thư mục `thap/` (docs ở `docs/demo-hop-tuong/`).
  - Nhánh live: `claude/mobile-tower-defense-game-k5oxzo` — xuất bản = chỉ thay thư mục `thap/` bằng bản của nhánh làm việc (`git fetch` → `git checkout FETCH_HEAD -- thap`), commit 'thap: xuất bản — …', push.
- Live: https://nguyentung19955.github.io/new-project/thap/ và https://turret-merge.web.app (tự deploy từ nhánh live).
- Nhánh làm việc (từ 08/11) chỉ còn Turret Merge; trên nhánh live **KHÔNG đụng** phần của game kia (`demo/`, `firebase.json` gốc, `.firebaserc`, `.github/workflows/firebase-hosting.yml`). Không in/commit khoá API (PixelLab, Firebase apiKey, service account).
- Luật bắt buộc trong code: `thap/QUY-TAC-HINH.md` (hình chỉ từ ChatGPT PNG; luật 6 = sửa ở 1 chỗ thì áp mọi chế độ/màn; luật 7 = nghiêng về DCDW; luật 8 = chạy `node tools/thap-kt-hoiquy.js` trước khi xuất bản). Online phải tất định (gameplay không phụ thuộc hiệu ứng/FPS).

## 2. Người dùng làm việc thế nào (quan trọng)
- Không rành kỹ thuật, dùng iPhone. Trả lời ngắn, tiếng Việt, chữ dễ hiểu.
- Phiên chính = **điều phối**: tự tạo + chạy phiên mới (cloud session) theo phán đoán, không cần hỏi; ~3 phiên song song (đang dùng nhiều hơn khi việc độc lập); việc trùng thì xếp hàng.
- Mỗi phần lên live → báo ngay kèm ảnh chụp + link. Tự kiểm kết quả trước khi gửi (không gửi rồi mới báo lỗi nhỏ).
- Chỉ chạy test khi người dùng nói "test" (các phiên vẫn chạy hồi quy theo luật 8 trước khi xuất bản).
- Góp ý ở 1 chỗ → áp cho mọi chỗ tương tự.
- Câu cần người dùng chọn: hỏi bằng câu hỏi nhiều lựa chọn, lựa chọn khuyên dùng để đầu.
- Hình: vẽ bằng **ChatGPT**, prompt tiếng Anh NGẮN, mở nhiều tab song song, xong là đóng tab.
- Giờ kiểm tra định kỳ: tự kiểm, tự chạy việc tiếp theo, không hỏi.

## 3. Cách điều phối (phiên chính)
- Tạo phiên: tool `create_trigger` (prompt tự đủ: repo/nhánh/luật/việc/kiểm/xuất bản/trailer commit) rồi `fire_trigger`. Xem trạng thái: `list_triggers` (last_run PENDING = đang chạy, SUCCEEDED = xong).
- Hẹn giờ kiểm: `send_later` (25–40 phút).
- Kiểm nhanh: clone/fetch repo, `git log` nhánh làm việc + nhánh live; phiên xong mà chưa xuất bản → tạo phiên nhỏ chỉ để xuất bản.
- Ghi chú cho phiên đang chạy: viết file vào repo (vd `tuvan/<việc>/YEU-CAU-THEM.md`) — không chắc nó đọc, nên kiểm lại sau.
- Mỗi phiên khi cần hình sẽ ghi `docs/demo-hop-tuong/tuvan/<việc>/CAN-VE*.json` = `[{name, ref, prompt}]` → phiên chính vẽ bằng ChatGPT, tải lên `docs/demo-hop-tuong/thap-art/<name>`.

## 4. Quy trình vẽ hình ChatGPT (Claude in Chrome, tài khoản ChatGPT của người dùng)
Các script trong thư mục này:
- `spoke.js` — dán vào mỗi tab ChatGPT mới (sau khi đặt `window._me='raw_x.png'; window._need=1;`). Nhận prompt + ảnh tham chiếu qua `BroadcastChannel('refch')`, tự dán prompt; kiểm `[window._n, độ dài .ProseMirror, số nút Remove]` rồi focus `.ProseMirror` + phím Return.
- Ảnh tham chiếu: trang chatgpt.com không tải được raw.githubusercontent → mở 1 tab raw bằng `window.open` từ 1 tab spoke (tab "forwarder", gắn nút bấm REF2), trong tab raw vẽ ảnh lên canvas nền #FF00FF rồi `opener.postMessage({ref:1,to:[names],name,b64},'*')`; tab forwarder chuyển sang `BroadcastChannel('refch')`.
- Lấy ảnh xong: trong mỗi tab lấy ảnh to nhất (`naturalWidth>=1000`, cái cuối), fetch → base64 → `BroadcastChannel('rel2')`; tab forwarder chuyển tới tab GitHub upload (mở bằng nút GH2 → `window._gh`).
- Tab GitHub `https://github.com/nguyentung19955/new-project/upload/claude/demo-hop-tuong/docs/demo-hop-tuong/thap-art`: dán `github-upload-acc.js` (gom file), gửi `{flush:true}`, chờ hết "Uploading N", bấm "Commit changes". **Tối đa 3 file / commit.** Kiểm lại bằng `git ls-tree`.
- `wave-gen.py` / `upload-gen.py`: sinh sẵn chuỗi lệnh browser_batch cho một đợt tab (sửa đường dẫn JSON cho đợt mới).
- Lỗi hay gặp: ChatGPT "unable to generate" → nhắn "Please try again" trong cùng chat; đính kèm trùng → bấm Remove bớt; người dùng tự đóng tab giữa chừng → mở lại chat theo URL rồi lấy ảnh.

## 5. Đang chạy lúc bàn giao (kiểm bằng list_triggers)
| Phiên | Việc | Kết quả mong đợi / cần kiểm |
|---|---|---|
| trig_01Dhk2WWDTFpr3heTWP1axhX | Hệ thống chuyển động ụ (idle, ngắm, tụ lực, giật nòng, cửa nòng, 30/60 FPS) theo `tuvan/vfx/REVIEW-VFX-93-v2-ANIM.txt` | Kiểm luật thêm `tuvan/anim/YEU-CAU-THEM.md`: **ụ hỗ trợ KHÔNG bắn** (không ngắm/giật/đạn). Nếu chưa làm → mở phiên sửa. Có thể ghi `tuvan/anim/CAN-VE.json` → vẽ. |
| trig_01SBUxb39vxr4G6Y6xT3THbf | Gắn 20 tờ VFX P3 (`raw_p3_*`, đã tải đủ) | Ảnh dải ở `tuvan/vfx-p3/strips-art/` → báo người dùng. |
| trig_01UPThPfL1CU6XDWG3uk7Tvf | Icon app (mẫu A = `thap-art/raw_app_icon.png`; B/C = raw_app_icon_b/c) | Báo cách thêm vào màn hình chính iPhone (Safari → Chia sẻ → Thêm vào MH chính). |
| trig_01JhhwXLB2rC3okXuDNFCWrU | 3 quyết định đã chốt: power-up kiểu DCDW cho 10 ụ không sát thương; cấp thẻ nâng trần ụ hỗ trợ; Evolver mất sao (mọi mức) → đếm lại | Báo bảng số mới. |
| trig_012eqyYFpCzW1d8Yinz3BbbG | Rà giới hạn sức mạnh 93 ụ (trần stack, chỉ ô kề, +1/lần…) so DCDW — CHỈ báo cáo | `tuvan/gioi-han/BAO-CAO.md` → hỏi người dùng chọn → mở phiên sửa. Ember Relay đứng đầu (người dùng muốn kiểu Katarina: cả hàng/cột, không trần 5). |
| trig_011V79mUjakXCii6dNJEDEWc | Thiết kế cơ chế ghép thú vị kiểu DCDW (ụ có HƯỚNG + SỐ: cùng hướng cộng, vuông góc giữ, ngược hướng trừ ≥1; hàng/cột…) — làm mới ~15–20 ụ — CHỈ đề xuất | `tuvan/co-che-moi/DE-XUAT.md` → hỏi người dùng chọn → mở phiên làm (hình mới vẽ bằng ChatGPT). |

Bản live gần nhất lúc bàn giao: `7458242` (mục IX: số sau trần, Mirror Gate 35%, Radar 1 câu).

## 6. Đã xong hôm nay (để khỏi làm lại)
Rồng băng/lửa trồi lên từ ụ (16 khung) · một vòng xanh quanh ụ · nhãn ◆100/◆30-40 nâng lên · soát mô tả 93 ụ · VFX P2 (12 chiêu lớn, 16 khung) · VFX P3 đợt 1 (code, 79 ụ, bỏ ảnh rung) · QA ngâm 303 trận (`tuvan/qa-ngam/BAO-CAO.md`, chạy lại: `tools/thap-qa-ngam.js`) · chống giật lần đầu ra chiêu + tấm tên không đè · mục IX/X review v2.

## 7. Tài liệu chính trong repo
- `thap/QUY-TAC-HINH.md` — luật code/hình.
- `docs/demo-hop-tuong/tuvan/` — mỗi việc 1 thư mục (yêu cầu, báo cáo, ảnh kiểm). Quan trọng: `vfx/REVIEW-VFX-93.txt`, `vfx/REVIEW-VFX-93-v2-ANIM.txt` (tư vấn ChatGPT), `vfx/YEU-CAU-ANIM.md` (không dùng ảnh rung), `muc-ix/KIEM.md`, `qa-ngam/BAO-CAO.md`, `tuong-tac/MA-TRAN.md`.
- `docs/demo-hop-tuong/thap-art/` — mọi ảnh gốc ChatGPT (`raw_*.png`).
- Hồi quy: `node tools/thap-kt-hoiquy.js`.

## 8. Luật game người dùng đã chốt (nhắc lại)
- Mọi ụ trên bàn chỉ đến từ 5 thẻ trong bộ bài (có bất biến + fuzz test).
- Copycat giữ phần giảm sức mạnh qua mọi biến hình; chép được ụ hoá đá/đóng băng.
- **Trước khi đụng tới tương tác giữa các ụ** (ghép, biến hình, nâng/hạ sao, đá/băng, online): đọc `docs/demo-hop-tuong/tuvan/conghuong/NGUYEN-TAC.md` (chiều ghép = chiến thuật, kết quả theo ô đích…).
- Evolver: bom hẹn giờ; 7★ = xác bom xịt, không tác dụng; mất sao → đếm lại.
- Báo động chiêu trùm biến mất khi trùm chết. Hiệu ứng lửa phải màu lửa.
- Không dùng "ảnh tĩnh rung" làm hiệu ứng — phải là hoạt ảnh thật.
- Ụ hỗ trợ không bắn (như DCDW). Thẻ đỏ/vàng phải "cày" như DCDW. Tối đa 1 ụ Thần thoại / bộ.
- Không viết code thanh toán tiền thật lúc này.

---
## 9. CẬP NHẬT TIẾN ĐỘ (ghi dần, mới nhất ở cuối)

### 07/11 05:55 (giờ VN)
**Đã xong (code đã đẩy, chờ/đã lên live):**
- Mục IX review v2 — LIVE `7458242`.
- Icon app (mẫu A) + manifest PWA — code `4b8fb21`, chờ xuất bản.
- VFX P3 đợt 2: 20 tờ ChatGPT đã gắn (`thap/assets/p3_*`) — code `38e6925`/`0480705`, chờ xuất bản.
- Báo cáo giới hạn sức mạnh: `tuvan/gioi-han/BAO-CAO.md` (`8ebef51`).
- Đề xuất cơ chế mới kiểu DCDW: `tuvan/co-che-moi/DE-XUAT.md` (`50d82d7`). Ghi chú: "Katarina" thật ra là **Kalaratri** (lửa theo chữ thập); ụ mũi tên + số **không tìm được nguồn** → thiết kế theo lời người dùng.
- Chuyển động ụ: đã có `tuvan/anim/ARCHETYPE.md` + dải ảnh; cần 4 hình `tuvan/anim/CAN-VE.json` (nòng gatling, ổ quay revolver, tinh thể băng, mặt vũng độc).

**Người dùng đã chốt (05:50):**
- Giới hạn sức mạnh: **làm hết theo khuyên dùng** (mọi mục option A) → phiên `trig_017qHBP9YbuJ6aQ1xx5x2FQe` (không đụng Ember).
- Cơ chế mới đợt 1: **B Lửa Thập Tự (Ember lan cả hàng + cột, trần 8, giữ lửa qua ghép) + A Pháo La Bàn (THAY Cannon, ngược hướng thì trừ ≥1 + bắn sóng nổ bù) + N Drone Kéo Xa** → phiên `trig_01NL75Vcu1n5v4KP6iwjCvBz` (sẽ ghi `tuvan/co-che-moi/CAN-VE.json` → vẽ ChatGPT).
- Còn để đợt sau trong DE-XUAT §6: Bàn Poker (thay Quantum Choir), Ổ Mẹ (thay Fusion Archive), Máy Nghiêng Bàn 2048, Hộp Láng Giềng, Nỏ Nhịp Chung, ụ mới (Đồng Xu / Gương / Ký Sinh / Domino).

**Đang chạy:** chuyển động ụ `trig_01Dhk2WW…`, 3 quyết định power-up/trần/Evolver `trig_01JhhwXL…`, gắn P3 (gần xong), icon (gần xong), cân bằng giới hạn `trig_017qHBP9…`, cơ chế mới đợt 1 `trig_01NL75Vc…`.

### 07/11 06:15 (giờ VN) — NGƯỜI DÙNG YÊU CẦU DỪNG / TẠM HOÃN
Đã ghi `ban-giao/DUNG-LAI.md` (bảo các phiên đang chạy dừng, không xuất bản). Đã tắt lịch kiểm tra định kỳ. Không thể tắt cưỡng bức phiên cloud từ phiên điều phối — phiên nào đang chạy có thể vẫn làm nốt.

**Đã LIVE:** mục IX (`7458242`), icon app + manifest PWA (`3d05d02`).

**Đã xong code nhưng CHƯA LIVE (lần sau chỉ cần 1 phiên xuất bản + kiểm hồi quy):**
- VFX P3 đợt 2 — 20 tờ ChatGPT gắn vào game (`38e6925`, `0480705`).
- Chuyển động ụ (anim.js: thở lõi, tụ lực, giật/hồi theo sự kiện bắn thật, cửa nòng, 13 kiểu) (`b1803e6`). Cần kiểm: ụ hỗ trợ KHÔNG bắn (`tuvan/anim/YEU-CAU-THEM.md`); 4 hình `raw_anim_*` đã tải (`d1d298c`) nhưng có thể chưa gắn.
- 3 quyết định: power-up nâng số kỹ năng thật cho 10 ụ không sát thương, cấp thẻ nới trần hỗ trợ, Evolver mất sao đếm lại (`f8ab58b`) — kiểm xem phiên đã làm đủ chưa.

**Đang dở (phiên có thể vẫn chạy khi bàn giao — kiểm list_triggers / git log):**
- Cân bằng giới hạn sức mạnh (làm hết theo khuyên dùng, trừ Ember) — `trig_017qHBP9YbuJ6aQ1xx5x2FQe`. Đánh dấu "Đã làm" trong `tuvan/gioi-han/BAO-CAO.md`.
- Cơ chế mới đợt 1: Lửa Thập Tự / Pháo La Bàn (thay Cannon, ngược hướng trừ + sóng nổ) / Drone Kéo Xa — `trig_01NL75Vcu1n5v4KP6iwjCvBz`. Đã ghi `tuvan/co-che-moi/CAN-VE.json` (`36e5e16`): huy hiệu mũi tên 4 hướng, đầu Pháo La Bàn, 3 dải VFX — **CHƯA vẽ** (phải vẽ bằng ChatGPT rồi tải lên `thap-art/`).
- Gắn P3 `trig_01SBUxb3…` — đã commit xong, chỉ còn xuất bản.

**Việc chờ (chưa mở):** cơ chế mới đợt 2 theo `tuvan/co-che-moi/DE-XUAT.md` §6 (Bàn Poker, Ổ Mẹ, 2048, Hộp Láng Giềng, Nỏ Nhịp Chung, ụ mới).

**Khi tiếp tục:** xoá `ban-giao/DUNG-LAI.md`; xem git log từ `d301d0f`; xuất bản phần đã xong (kiểm hồi quy); vẽ CAN-VE cơ chế mới; mở lại phiên nào chưa xong.

### 07/11 07:20 (giờ VN) — TRẠNG THÁI CUỐI SAU KHI DỪNG
**Không còn phiên nào chạy** (mọi phiên SUCCEEDED, lịch kiểm tra đã tắt).

**LIVE (nhánh live, mới nhất `7725640`):** mục IX · icon app · mục IX 'Đã quyết' (power-up nâng số kỹ năng thật cho 10 ụ không sát thương, cấp thẻ nới trần hỗ trợ, Evolver mất sao đếm lại) — phiên này đã xuất bản ngay trước khi đọc lệnh dừng.

**XONG trên nhánh làm việc, CHƯA LIVE (chỉ cần 1 phiên: chạy `node tools/thap-kt-hoiquy.js` rồi xuất bản):**
- VFX P3 đợt 2 — 20 tờ (`38e6925`, `0480705`, trạng thái `1e20a55`).
- Chuyển động ụ anim.js (`b1803e6`) — còn phải kiểm: ụ hỗ trợ không bắn; 4 hình `raw_anim_*` (`d1d298c`) có thể chưa gắn.
- Cân bằng giới hạn sức mạnh mục 2–9 (`fe3cfa4`, `24220c4`, `a014426`) — xem §7 trong `tuvan/gioi-han/BAO-CAO.md`.
- Cơ chế mới đợt 1: Pháo La Bàn (thay Cannon), Lửa Thập Tự (Ember cả hàng + cột), Drone Kéo Xa (`2850979`, `a30abf8`) — đang dùng hình tạm; **CHƯA vẽ** hình ở `tuvan/co-che-moi/CAN-VE.json` (huy hiệu mũi tên 4 hướng, đầu Pháo La Bàn, 3 dải VFX).

**Khi tiếp tục:** xoá `ban-giao/DUNG-LAI.md` → vẽ CAN-VE cơ chế mới bằng ChatGPT → 1 phiên gắn hình anim + cơ chế mới, kiểm luật "ụ hỗ trợ không bắn", chạy hồi quy + QA ngâm ngắn (SO=60), xuất bản tất cả → mở đợt 2 cơ chế mới (`DE-XUAT.md` §6).

### 07/11 10:30 (giờ VN) — TIẾP TỤC (tài khoản mới, phiên điều phối mới)
**LIVE `e2ac58d4`** (thap/ = `4052fff5`, ver `74278cbb4a`): VFX P3 đợt 2 · chuyển động ụ anim.js · giới hạn kỹ năng 2–9 · cơ chế mới đợt 1 (Pháo La Bàn, Lửa Thập Tự, Drone Kéo Xa) + sửa hồi quy (VI 7 chuỗi, cấp thẻ Pháo La Bàn rải 14 cấp, bài kiểm theo luật mới). Hồi quy đủ bộ: còn 1 mục mạng chập chờn → chạy riêng XANH; giật ghép, Quantum Choir, chữ tràn 430 chạy riêng XANH. Hướng quái XANH trên bản xuất bản.
**Xong, chưa gắn game:** 24 sheet trùm không tay chân (`raw_trum2_*`, GIF ở `tuvan/trum-moi/gif/`) · 6 quái thường không tay chân + Janus chiêu v2 (`raw_quai2_*`, `tuvan/quai-moi/`) · đo nhận diện 93 ụ (`tuvan/nhandien/`, nhánh `claude/kiem-nhan-dien`) · độ rối 15 ụ (`tuvan/vfx15/SO-LIEU.md` — 5 đề xuất sửa chưa làm).
**Nhánh `claude/u-module`** (chưa gộp): 7 ụ module (bệ riêng + đầu mới) trong game, chờ người dùng duyệt.
**Đang chạy:** phiên phụ thiết kế lại 86 ụ còn lại (chia 6 họ, ≥30% thiết bị không nòng, gen theo đợt ≤10 tab, `tuvan/u-moi/`).
Người dùng chốt: trùm + quái nhỏ + tinh anh là vật thể KHÔNG tay chân; gen xong đóng tab Chrome; việc ảnh tách phiên song song, không bắt chờ.

## Việc chờ (người dùng 07/11 20:07) — chân dung tướng đại diện
- Lỗi hiện tại: có chân dung bị che mặt khi cắt khung thẻ, có chân dung không có nền sau (vd Overlord nền đen trơn), có chân dung hình vô lý (vd Hero Foundry búa trông như gãy).
- Hướng mới (làm SAU khi 93 ụ mới lên game): vẽ lại chân dung đại diện "free style" dựa trên hình ụ — không nhất thiết là người (có thể là chính cỗ máy/sinh vật/biểu tượng), có nền sau, mặt/chủ thể không bị khung che; gen bằng ChatGPT, kiểm từng tấm.
