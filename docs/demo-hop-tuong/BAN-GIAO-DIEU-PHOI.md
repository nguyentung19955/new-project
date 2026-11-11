# BÀN GIAO ĐIỀU PHỐI — Astral Arsenal (Turret Merge)

> Viết 11/11/2026 ~10:00 (giờ VN) bởi phiên điều phối cũ (phiên quá dài, hay bị ngắt). Phiên mới: đọc file này + `CLAUDE.md` + `docs/demo-hop-tuong/TAI-LIEU-GOC.md` rồi làm tiếp. Khi tình hình đổi, CẬP NHẬT file này.

## 1. Vai trò và cách làm việc người dùng yêu cầu
- Điều phối: giao việc cho phiên con (agent nền), tự XEM ảnh chụp bằng Read, xuất bản, báo người dùng bằng **tiếng Việt, ngắn, kết luận trước**.
- **Mỗi lần MỘT phiên con**; xong việc nào dọn tạm và đẩy lên bản chạy thật việc đó ("cứ clear đi mỗi khi up git xong").
- Người dùng dùng điện thoại (iPhone), hay hỏi "Xong chưa" → trả lời thẳng đang ở đâu.
- Người dùng tạo ảnh bằng ChatGPT: mình gửi **ảnh mẫu + prompt tiếng Anh, mỗi prompt là MỘT khối copy được, đã ghép phần chung** (không bắt ghép tay). Không dùng Chrome của người dùng khi họ ở điện thoại.
- Đổi số gameplay: gửi bảng trước khi áp, trừ khi người dùng đã bảo "làm luôn".
- Không tự nhận xong khi chưa kiểm; nói rõ cái chưa kiểm (vd chưa thử iPhone thật, chưa chạy test online).

## 2. Ràng buộc cứng
- KHÔNG đụng `demo/`, `firebase.json` gốc, `.firebaserc`, `.github/workflows/firebase-hosting.yml`. Không in/commit khoá API.
- Không gõ mật khẩu / thêm tài khoản ChatGPT; chỉ dùng tab Chrome do Claude tạo và đóng lại.
- Online tất định: không `Math.random` trong gameplay; hiệu ứng không đổi kết quả trận.
- Không đổi khoá localStorage `turret_*`, dự án Firebase, tên miền.
- Thay đổi cấu hình production (luật Firebase, OAuth) → người dùng tự bấm.
- Email người dùng là riêng tư. Tài khoản Google ADMIN trong game: xem `thap/js/admin.js` (kiểm phía máy khách).

## 3. Repo, nhánh, xuất bản
- Repo `nguyentung19955/new-project`. Nhánh nguồn `claude/demo-hop-tuong` (game ở `thap/`). Nhánh chạy thật `claude/mobile-tower-defense-game-k5oxzo` → https://turret-merge.web.app (GitHub workflow `thap-firebase-hosting.yml` tự deploy).
- Máy làm việc ổ đĩa rất chật (~2,8 GB trống): KHÔNG checkout cả repo. Phiên con dùng worktree thưa ở `/dev/shm`:
  `git worktree add --no-checkout --detach /dev/shm/<tên> FETCH_HEAD; git sparse-checkout set --no-cone /thap/ /tools/ …; git checkout -q`. `/dev/shm` mất khi máy khởi động lại → phiên con commit + push 15–20 phút/lần.
- Công cụ xuất bản của điều phối: `tools/dieu-phoi/` (`pub.sh`, `thap-ver.py`, `tut.js`). Trên máy cũ nằm ở `/home/claude/pubtools/` và worktree nhánh chạy thật ở `/home/claude/wt-live`. Máy mới: tạo lại
  `git worktree add /home/claude/wt-live origin/claude/mobile-tower-defense-game-k5oxzo` (sparse `/thap/` nếu cần), chép `tools/dieu-phoi/*` vào `/home/claude/pubtools/`, sửa đường dẫn nếu khác.
- Quy trình xuất bản:
  1. `F=$(git diff --name-only --diff-filter=AM <commit đã xuất bản lần trước> <commit mới> -- thap/)`; với mỗi file: `git show <mới>:$f > /home/claude/wt-live/$f` (xoá file bị xoá); `node --check` file JS.
  2. `timeout 520 /home/claude/pubtools/pub.sh "<mô tả>"; cat /home/claude/pubtools/pubq.st` → phải `PUSHED` (SMOKEFAIL/VERFAIL/PUSHFAIL = hỏng). Lệnh chạy 2–4 phút: đặt timeout lệnh ≥ 540 s.
  3. Chờ ~80 s rồi `gh run list --repo nguyentung19955/new-project --workflow thap-firebase-hosting.yml --limit 1` → phải `completed success`.
- Commit nguồn đã xuất bản gần nhất: **`e05be10a6`** (WebGL đợt 1, mặc định TẮT). Lần xuất bản sau: diff từ commit này.
- Dòng cuối mọi commit:
  ```
  Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
  Claude-Session: <đường dẫn phiên hiện tại>
  ```
- Tham số gỡ lỗi: `?notut=1&mode=solo|pvp|coop&deck=id,…&wave=&fill=1&auto=1&speed=&ios=1&net=0&gl=0|1`; `UP.mo('<id>')`; `HD.moKhoa=()=>true`; admin ảo: `localStorage turret_admin` + `ADMIN._v=true; ADMIN.apDung()`. Playwright: `NODE_PATH=/opt/npm-tools/node_modules`, 390×844.

## 4. Nguyên tắc thiết kế người dùng đã chốt (chi tiết ở TAI-LIEU-GOC mục 15)
- Game "vừa đủ khó", không cầm tay. Đỏ hiếm và mạnh hơn Vàng.
- Cân bằng: so trong cùng bậc; cơ chế KHÓ được mạnh hơn DỄ. **Mạnh nhờ hiệu ứng kỹ năng, không nhờ chỉ số cơ bản** (chỉ ụ không có cơ chế mới tăng chỉ số gốc). Ụ tấn công Vàng không được thua ụ hỗ trợ Đỏ.
- Dải đích đo tĩnh (`tools/thap-can-bang-so.js`): Đỏ tấn công 4,5–5,5; Vàng tấn công 2,5–3,5. **Nhưng người dùng đã chỉ ra bài đo tĩnh không phản ánh trận thật** → phải đo bằng trận bot thật với đúng bộ người dùng chơi (xem mục 6).
- Không sát thương lan/tràn cho ụ mới. Ụ Khởi Sinh không được quá mạnh (7★ không gieo thêm ụ).
- **Tự do sáng tạo hình**: mỗi ụ là một vật thể/sinh vật riêng (không khuôn nòng-pháo-trên-bệ); mỗi phi công là một sinh vật khác loài (không "người anime đổi màu"). Mẫu prompt + ảnh mẫu: `/home/claude/xem/umoi/ref_u_tudo.png`, `ref_nhom1.png` (máy cũ), nguồn đã lưu ở `docs/demo-hop-tuong/thap-art/raw_anime_u_tudo_t*.png`, `docs/demo-hop-tuong/tuvan/phi-cong-moi/`.
- Hướng kỹ thuật: chuyển màn trận sang **WebGL** (giữ tranh 2D, thêm ánh sáng + vật lý cho HIỆU ỨNG); **Unity để sau** (người dùng sẽ làm sau; nên tách luật trận khỏi phần vẽ dần).

## 5. Đã xong và đang chạy trên bản thật (10–11/11)
- Cân bằng đợt 1–2 Vàng/Đỏ tấn công (bảng: `docs/demo-hop-tuong/tocban/CAN-BANG-VANG-DO.md`).
- Ụ mới **Crimson Sting `bocap`**: chí mạng cộng dồn STING không trần, ghép/hạ sao mất hết; đã chuyển lên bậc ĐỎ, 13% ST/STING ở LV11.
- Làm rõ Genesis Core; sửa gốc lỗi ụ vẽ phóng to; khung thẻ Partners theo bậc; admin nhận tài khoản Google nối từ khách.
- 24 ảnh phi công mới (sinh vật) + phi công bọ cạp; căn lại mặt 96 thẻ.
- 26 ụ hình mới kiểu tự do (14 tấm), 7 ụ có 3 dạng.
- Tối ưu giật co-op (lọc ảnh `'low'` khi vẽ khung…): −26–40% thời gian khung trên máy đo; CHƯA xác nhận trên iPhone.

## 6. Việc đang làm và hàng đợi (theo thứ tự)
1. **WebGL đợt 1 — XONG, đã lên bản thật nhưng mặc định TẮT** (`MAC_DINH = false` trong `thap/js/gl/glr.js`; thử bằng `?gl=1`). Đã sang GL: quái, bóng, quầng trạng thái, 12 trùm, lưới DRAG NET, tia laser, đạn + vệt, thanh máu. `GLR.x` = ngữ cảnh thay thế kiểu canvas 2D (hàm vẽ cũ chỉ cần nhận `GLR.x` thay `ctx`). Băm trạng thái trước = gl0 = gl1. Chi tiết + số đo: `docs/demo-hop-tuong/tuvan/webgl/KE-HOACH.md`, công cụ `tools/thap-kt-webgl.js`.
   - VÌ SAO TẮT: (a) trên máy đo (GPU giả lập bằng CPU) bản lai GL + 2D CHẬM hơn (trung vị 32 → 51 ms cảnh A) — lợi ích trên iPhone chưa chứng minh; (b) khi ụ + hiệu ứng còn ở 2D thì thứ tự lớp lệch: quái nằm trên ụ, chớp đầu nòng tối hơn, hình sự kiện trên ụ nằm dưới quái; (c) trùm Hive/Patcher/Octopus tải lại 6 texture canvas tạm mỗi khung (33,5 → 44,9 ms).
   - Người dùng đã bảo "có công tắc thì cứ làm luôn WebGL" → cứ làm tiếp, nhưng CHỈ bật mặc định khi cả màn trận ở GL, hết lệch lớp, và người dùng thử `?gl=1` trên iPhone thấy mát/mượt hơn.
2. **VIỆC TIẾP THEO NGAY: WebGL đợt 2 + 3 GỘP** (phiên con khuyên gộp; ụ 100% và hiệu ứng 97,7–100% lệnh vẽ là drawImage thuần nên truyền `GLR.x` là chạy): ụ, bệ, sao, tấm đếm, nhãn bàn, cổng/lõi, lớp hiệu ứng + khoét `destination-out` (cần framebuffer riêng), `VX.veDs`, chữ số, khiên vector trùm Prism; đánh dấu canvas đệm đổi nội dung bằng `GLR.ban(c)`; sửa tải lại texture mỗi khung của Hive/Patcher/Octopus; tính lại ngân sách texture; mục tiêu: 0 lệch thứ tự lớp so với bản 2D và bỏ được 2 canvas phủ thừa. Sau đó đợt 4 (chớp sáng hắt lên ụ/quái, mảnh vỡ + xu văng nảy, rung khi trùm ra chiêu; chỉ hình ảnh, tự giảm khi tải nặng; lưới DRAG NET liền mạch).
   - Nhờ người dùng thử trên iPhone (so `?gl=0` với `?gl=1`): quái/đạn có mờ/lệch, mép thanh máu nhấp nháy, khoá máy rồi quay lại quái còn không, trùm Hive có khựng, nhiệt/pin 10 phút co-op wave 35+.
3. **Cân bằng bằng trận bot thật** với bộ người dùng chơi: (a) `cobac,vughep,sinhdoi,saochep,tudo` co-op — kẹt wave ~35, bàn đầy, mana thừa 32k không có chỗ tiêu; (b) bộ Hex Saboteur `nguyenrua` + Twin Maker `sinhdoi` + Genesis Core `khoisinh` — kẹt wave ~32. Sửa: ụ ĐẶC BIỆT Vàng phải đóng góp thật (ST nền hoặc thưởng ghép), có chỗ tiêu mana khi bàn đầy. Mốc đích tạm: người chơi trung bình co-op tới ~wave 50 (người dùng chưa xác nhận con số). Gửi bảng "bộ nào tới wave mấy, trước/sau" rồi mới áp.
4. Giai đoạn E (hạn 23/11): sự kiện xoay vòng 4 tuần, cửa hàng sự kiện, rương nổi bật. Giai đoạn F (hạn 30/11): tài khoản + lưu đám mây, kiểm phía máy chủ, chống gian lận, thống kê, đóng gói ứng dụng.

## 7. Câu hỏi còn treo với người dùng
- Crimson Sting: có hãm khi xếp cạnh Crit Antenna + Hammer + Focus Lens không (10 phút ~1 600 STING, ~7,8× bình thường)? Giữ 13% hay 16%/STING? Bệ đỏ có bị "đỏ trên đỏ"?
- Leviathan/Blood Circuit/Nemesis cuối trận có quá tay không (chờ người dùng chơi).
- Đăng nhập Google từ icon màn hình chính iPhone đã được chưa (Safari đã được).
- Ụ còn dễ lẫn chưa vẽ lại: nhóm Trắng cũ (xucxac, lien, phun, maychem, phagiap, nam), mana/dichchuyen/nhanmana, canon/aten, 3 ụ đồng hồ (dongbo, bomhen, khoathoigian), overlord/blackhole. 3 ảnh phi công hơi tối: docton, lophanung, bang.
- Chưa kiểm: test đồng bộ online (cần máy chủ giả 8787), quy đổi thẻ bocap cũ qua đồng bộ Firebase thật, hình mới trong co-op/PVP.

## 8. Bài kiểm đang trượt sẵn (không phải do thay đổi mới)
`vetay` (61 dòng), `vach` ("cả đầu > 60% ô"), `kynang-vd` (crash hotro.js), `vang-moi`, `vang-moi2`, `co-bac` (2 ca "ẩn giá"), `chi-huy-moi` (1), `giat` (trum:hive), `keo` (cuon-doc). Phát hiện có sẵn chưa sửa: `VX.bien` (`growfx.js`) đặt `T.cd = 0.01` theo đồng hồ khung vẽ.

## 9. Ảnh người dùng đã gửi, CHỜ GHÉP (lưu ở `docs/demo-hop-tuong/thap-art/cho-ghep/`)
Ghép theo đúng quy trình commit `2ac6673d2` (ụ: `tools/thap-cat-u-tudo.py`) và `4b751c7c2` (phi công: `tools/thap-cat-phicong-moi.py`); ghép xong thì xoá dòng ở đây.
- `t15_cuongno_vungdoc_khuech.png` — tấm ụ 3 hàng × 4 cột (lắp ráp · bệ · đầu · huy hiệu): hàng 1 Berserker `cuongno` (đầu lợn rừng mào đỏ), hàng 2 Toxic Pool `vungdoc` (đầu cá sấu ngậm độc tím), hàng 3 Amplifier `khuech` (vẹt mào + 2 loa). Giữ bệ hiện có trong game; đầu đứng thẳng, không xoay lộn.
- ĐỦ 10 ảnh phi công mới (1254×1254, JPEG q92) `cho-ghep/pilot_<id>.jpg`: `nhieusong` (Signal Jammer, sứa tím), `nangsao` (Star Lift, ngôi sao sống), `luoicheo` (Resonance Grid, dế âm thoa), `railgun` (Salvo Battery, hải mã đàn ống), `no5` (Fifth Shot, hoa thép), `nguyenrua` (Hex Saboteur, búp bê bùa), `epxung` (Overclock, robot nồi hơi), `orbital` (cú máy), `santhuong` (Bounty Beacon, sói đồng cỏ — mặt hơi lệch phải, mắt trái che bằng miếng tâm ngắm), `sinhdoi` (Twin Maker, đôi cá koi áp má — mốc mặt = điểm giữa hai đầu). Người dùng đã duyệt hướng; ghép cùng lượt với tấm ụ t15.
- Đề xuất chưa được người dùng trả lời: gợi ý cách chơi Prism Thief (đường mờ + ngón tay vuốt khi đủ 4 màu liền nhau; chấm màu còn thiếu trên thẻ) — người dùng nói "Prism Thief tôi chẳng biết chơi".
