# TURRET MERGE — ghi chú thay đổi (GAMEPLAY)

> Game merge tower-defense trong `thap/`. Luật game và bàn giao: `docs/demo-hop-tuong/ban-giao/BAN-GIAO.md`, luật code/hình: `thap/QUY-TAC-HINH.md`.
> Mỗi session thêm một mục `## claude/<tên-nhánh> — …` ở CUỐI file (file gộp kiểu union, không xung đột).

## claude/demo-hop-tuong — TURRET MERGE (thap/): ảnh ụ súng ChatGPT + hoạt ảnh "juicy" (04/11)
- Ụ súng dùng ảnh `thap/assets/<id>_de.png` (đế) + `<id>_nong.png` (đầu súng, nòng hướng phải, xoay quanh tâm ảnh); đầu súng chuẩn hoá theo vành đế bằng số đo từng ảnh (`ART` trong render.js); hình vẽ code chỉ còn làm dự phòng.
- Sao = chấm kiểu mặt xúc xắc 1–7 trên vành đế (chấm giữa nằm trên tâm đầu súng). Bóng tiếp xúc + bóng đầu súng, ánh sáng cố định từ trên-trái.
- Hoạt ảnh: xoay mượt + quét chậm khi rảnh; giật lùi lò xo; chớp đầu nòng gắn theo nòng (ảnh fx_chop_nong), khói/vỏ đạn/phun độc; tesla nạp sáng cuộn dây trước khi phóng; laser tia lõi + quầng + ảnh tia + nổ ở đích; pháo bay vòng cung có bóng + ảnh nổ + vòng đúng bán kính nổ; băng có vệt sao lấp lánh + ảnh vỡ băng; radar quay chảo + vòng ping; máy mana bập bềnh, sáng + lấp lánh khi sinh mana; mimic đổi màu cầu vồng.
- Summon: rơi từ trên xuống, bẹp/nảy, vòng bụi + chớp. Merge: 2 ụ bay vào nhau trắng dần → chớp trắng, sóng, sao bung, ụ mới bật ra quá đà, chữ "+1★". Kéo: ụ nhấc lên có bóng, ô ghép được nảy + sáng, ô khác tối đi. Nâng cấp: vòng quét quanh mọi ụ cùng loại.
- Trùm: vòng báo trước + dấu "!" trên ụ bị nhắm (SNIPE = ống ngắm đỏ), đóng băng = khối băng, hoá đá = ụ xám + vết nứt. Số sát thương bật to (chí mạng to hơn, màu), quái trúng độc có mây độc, bị chậm phủ lạnh.
- UI: nút SUMMON thở khi đủ mana, số mana nảy khi đổi, băng rôn wave trượt vào.

## claude/demo-hop-tuong — TURRET MERGE (thap/) VIẾT LẠI theo DCDW (04/11, phiên luật + kỹ năng + hoạt ảnh)
- thap/ được viết lại hoàn toàn (không còn engine tướng của demo/): `js/data.js` (luật, bậc, quái, trùm, bố cục), `js/skills.js` (BẢNG KỸ NĂNG đăng ký theo id), `js/game.js` (luật), `js/render.js` (vẽ), `js/fx.js` (hạt), `js/ui.js` (giao diện), `js/sound.js`, `js/meta.js` (tự sinh: tỉ lệ đầu súng + roster nhúng).
- Dữ liệu ụ đọc từ `assets/roster.json` (64 ụ: id, tên, bậc, thẻ DCDW, kỹ năng). Ụ chơi được = có `SKILLS['<id>']`; bảng chọn liệt kê đủ 64, ụ chưa có kỹ năng hiện "SẮP CÓ" và không chọn được. Thêm ụ: viết `SKILLS.<id> = { vai, dmg, toc, nham, ban(G,B,T,E) | capNhat(G,B,T,dt), hoTro, ghep, mo }` trong skills.js — không cần sửa chỗ khác.
- 16 ụ đã có kỹ năng: canon, lien, bang, doc, tia, set, mana (TRẮNG) · radar, mimic, laser, mortar (XANH) · railgun, orbital, wallgen (VÀNG) · blackhole, overlord (ĐỎ).
- Luật DCDW: triệu hồi 10 rồi +10; ghép 2 ụ cùng loại cùng sao → ụ NGẪU NHIÊN trong bộ +1 sao (tối đa 7); Mimic ghép với mọi ụ cùng sao (+50% công 8 s); hỗ trợ buff 4 ô kề; nâng cấp theo loại 100/200/400/700; Ma vương 3 lựa chọn (Gọi viện / Cuồng lực / Khiên thánh), mana ×2 mỗi lần dùng + hồi chiêu; mục tiêu mặc định = quái đầu.
- Chế độ: SOLO 3 tim (đường chữ U ôm bàn); CO-OP 2 cổng → vùng chung → 1 lõi, lọt 1 quái là thua, mỗi bàn chỉ bắn nhánh mình + vùng chung; PVP quái mình giết bị GỬI sang đối thủ, 3 tim. Quái to/trùm lọt mất 2 tim.
- Quái: thường, bay nhanh, bay xanh miễn chậm, khổng lồ, tách (chết đẻ 5), que tách (wave 30+, chết đẻ 3 tách). Trùm mỗi 10 wave (Mad Crown, Freezer, Janus Cube, Joker King, Nightmare, Octopus Eyes) — báo trước 1,4 s bằng tâm ngắm đỏ trên ụ + khung tung chiêu.
- Hình: `tools/thap-cat-hinh.py` chép ảnh đã cắt ở docs/demo-hop-tuong/thap-art/ vào thap/assets/ (khay thu nhỏ, đường cắt sát dải, lớp phủ bỏ ụ mẫu ở giữa), tự cắt từ raw_*.png nếu còn thiếu, sinh ảnh nhỏ `assets/nho/<id>.png` cho bảng chọn và `js/meta.js`.
- Kiểm thử nhanh bằng tham số: `?mode=solo|coop|pvp&deck=a,b,c,d,e&wave=10&fill=4&mana=2000&auto=1&speed=2&af=hero|dahlia|eve`.
- (04/11 tối) ĐỦ 64/64 Ụ CHƠI ĐƯỢC: 48 ụ còn lại ở `js/skills2.js` theo thẻ DCDW (ghép kích kỹ năng, hỗ trợ 4 ô kề, PVP phá đối thủ ↔ CO-OP/SOLO giúp đồng đội/mình, biến hình, sát thương ngẫu nhiên, bom/mìn/vũng độc/cầu vồng trên đường, ụ ĐỎ có kỹ năng chủ động: CHẠM ụ khi nạp đầy). Nhãn kỹ năng ngắn hiện trên ụ khi kích hoạt. Ghép đặc biệt (kéo ụ này thả lên ụ khác): Bộ Trộn (mọi ụ, sao trung bình), Dịch Chuyển (đổi chỗ cùng sao), Ép Xung (+65% tốc), Vua Ghép (+1★/+2★), Sao Chép (bản sao −50%). Khiên 1 lần trên ụ (Máy Khiên) chặn chiêu trùm và phá của đối thủ. Mô phỏng bot cân bằng: `node tools/thap-sim.js 4 solo`.

## claude/demo-hop-tuong — TURRET MERGE lên Firebase Hosting (turret-merge.web.app)
- `firebase-thap.json` (gốc repo): đăng thư mục `thap/` lên site `turret-merge` (bỏ *.md, tệp ẩn, nghe-am-thanh.html, docs/tools/raw). Bộ đệm: `/`, *.html, *.json (ver.json, roster.json) no-cache; css/ + js/ (đã có `?v=băm`) 1 năm immutable, trừ js/skilldemo.js (nạp không ?v=) 5 phút; ảnh/phông/nhạc 1 ngày (nhiều ảnh còn nạp không ?v=).
- Workflow mới `.github/workflows/thap-firebase-hosting.yml` ("Deploy TURRET MERGE to Firebase"): chạy khi đẩy thap/** lên nhánh chính hoặc bấm tay; thiếu secret `FIREBASE_SERVICE_ACCOUNT_TURRET_MERGE` → chỉ cảnh báo vàng. Không đụng firebase.json/.firebaserc/firebase-hosting.yml của game kia.
- Đường dẫn trong game đều tương đối → chạy được cả ở gốc tên miền (web.app) lẫn /new-project/thap/ (GitHub Pages); link mời = tên miền đang mở. Hướng dẫn 4 bước: `docs/demo-hop-tuong/FIREBASE-HOSTING-THAP.md`.

## claude/demo-hop-tuong — thap: 4 ụ VÀNG mới đợt 2 (06/11)
- **Blood Circuit** (`mauhut`, Strigoi, Đặc biệt): kéo lên BẤT KỲ ụ của mình → cả 2 thành 1 ụ ngẫu nhiên trong bộ ở sao = max (không tự lên sao). Cùng sao +1 VAMP (7★ +2; tối đa 10; +6% sát thương/VAMP cho mọi Blood Circuit, LV15 +9%). Khác sao: tốn 2 VAMP → xung máu 220% (5★+ 300%).
- **Hex Saboteur** (`nguyenrua`, Guiltyne, Đặc biệt): ghép 2 con → sau 1.5 s nguyền 1 ụ (RNG gieo hạt). PVP −1★ (1★: tê liệt 2.5 s), khiên / Mirror Gate chặn lúc trúng; CO-OP ụ đồng đội +1★ (7★ không bị chọn); SOLO quái đầu chậm + yếu. 35% (LV9) +2%/cấp +5%/sao, trần 80%; hồi chung 8 s.
- **Sanctum** (`thanhdia`, Bari, Hỗ trợ): xuất hiện → tẩy + khiên ô kề; ụ Tấn công kề +sát thương; khiên nạp 14 s (7★ 4 s); 5★ 8 ô.
- **Prism Thief** (`bienmau`, Lupin, Tấn công): đạn đổi màu đỏ (đốt) / vàng (+40% chí mạng) / xanh (chậm) mỗi 3 s; ghép 2 con cùng màu → COMBO (+6%/combo sát thương, +4% tốc; tối đa 10, có 5★ → 15); 7★ mỗi phát cả 3 màu.
- js/skills7.js; % kỹ năng theo cấp thẻ trong KY_NANG_CAP; online: cờ ô VAMP/COMBO (dongbo.js); ngoài RANDOM tới khi có hình (SK7.CHUA_ANH). Kiểm: tools/thap-kt-vang-moi2.js (trong hồi quy). Hình: docs/demo-hop-tuong/tuvan/tuong_vang/CAN-VE-2.json.

## claude/demo-hop-tuong — 4 ụ vàng mới đợt 1 (06/11)
- Ember Relay (lualien): ghép có Relay → +1 lửa cho Relay ở 4 ô kề (tối đa 5); mỗi lửa +12% sát thương (LV15 18%) +3% chí mạng; nhận lửa +15% tốc 5 s.
- Quantum Choir (hopca): +18%/ụ khác cùng sao trên bàn mình (tối đa 7; LV15 30%); 7★ +12% tốc.
- Fusion Archive (luutru): mỗi lần ghép +1 điểm lưu (tối đa 40, +2.5%/điểm, LV15 4%); Archive mới nhận 50% số lần ghép; Archive+Archive = 3 xung 160%.
- Hero Foundry (xuonganh): ghép 2 Foundry → ô ANH HÙNG 12 s, +20% tốc (+2%/cấp, +4%/★; tối đa 2 ô).
- Code thap/js/vangmoi1.js, kiểm tools/thap-kt-vang-moi.js (trong hồi quy), ảnh kiểm docs/demo-hop-tuong/tuvan/tuong_vang/dot1/.

## claude/demo-hop-tuong — tiếp tục sau DỪNG (07/11 sáng): sửa hồi quy cơ chế mới đợt 1
- Bỏ `ban-giao/DUNG-LAI.md` (người dùng cho tiếp tục + xuất bản).
- Tiếng Việt: thêm 7 chuỗi Pháo La Bàn / Lửa Thập Tự vào `vi.json` → dựng lại `ngonngu-vi.js`.
- Pháo La Bàn: cấp thẻ "mỗi số" 15% → 21% rải đều 14 cấp (bước 0,43; trước +1/cấp chạm trần ở LV8, phí 7 cấp) — `data.js`.
- Bài kiểm cập nhật theo luật mới: Lửa Thập Tự cả hàng + cột, tối đa 8 lửa (`thap-kt-vang-moi.js`); kiểm online bỏ trường mũi tên+số của Pháo La Bàn khi so cờ đá/bản sao (`thap-kt-conghuong2.js`, `thap-kt-copycat-da.js`).
- Luật hình (`thap/QUY-TAC-HINH.md` mục 2): gen ảnh xong là đóng tab Chrome ngay.
- Ảnh mới tải lên `thap-art/`: `raw_mod_*` (7 ụ mẫu kiểu module, nhánh claude/kiem-nhan-dien đo nhận diện).

## claude/u-module — 7 ụ module: bệ riêng + đầu mới (Pháo La Bàn, Liên Thanh, Tesla, Băng, Radar, Hố Đen, Độc)
- Ảnh ChatGPT `thap-art/raw_mod_<id>.png` (lưới 2×2) cắt bằng `tools/thap-cat-umod.py`: ô 2 → `<id>_de.png` (bệ, tâm ảnh = điểm gắn đầu), ô 3 → `<id>_nong.png` (đầu, xoay 90° cho nòng hướng phải như mọi đầu cũ, tâm ảnh = trục xoay lấy từ ô 1 lắp sẵn), ô 4 → `<id>_phu.png` (canon/set/bang/radar/blackhole; chưa dùng, để dành cho anim PART_B). Đầu cũ vẫn còn ở `<id>_nong_v1`.
- Khoá magenta: lõi đặc giữ nguyên, viền ~1 px alpha mềm + tách trộn nền; thu Lanczos nhân-trước-alpha; đo `thap-kt-min3x` (430×932): bệ r ≤ 0,87, đầu r ≤ 0,72.
- `render.js than()`: ụ trong `REN.DE_RIENG` vẽ bệ riêng (cỡ = bệ chung × hệ số khung) khi ảnh đã tải; đang tải/lỗi → `de_chung`. Khoá bộ đệm thân theo id cho các ụ này. `ui.js dsTran` nạp trước `<id>_de`. `artscale.js` HEAD_K canon/lien/doc nâng (trục lệch tâm hình). Không đổi luật chơi.
- Nhận diện (`tools/thap-kt-nhandien.js`, ô thật iPhone 46,5 px), điểm giống nhất trước → sau: Pháo La Bàn 0,86→0,74 · Liên Thanh 0,88→0,76 · Tesla 0,84→0,65 · Băng 0,91→0,84 · Radar 0,89→0,84 · Hố Đen 0,88→0,46 · Độc 0,91→0,83; cặp ≥ 0,80 cả bảng 1.553→1.430. Kết quả + ảnh trong `docs/demo-hop-tuong/tuvan/nhandien/game/`.
- Còn nợ: đầu Độc (bình), Radar (đĩa), Pháo (nòng) vẽ nghiêng 3/4 chứ chưa top-down thật; Tesla thiếu vòng cuộn xanh (là PART_B, chưa gắn); thẻ/biểu tượng `nho/<id>` và trang ụ vẫn hình cũ.
- (07/11 11:00) Sửa méo tam giác cảnh báo ở 2 đầu băng trùm (`bang_trum_nen`): border-image cắt 40/70 và tỉ lệ đều ngang–dọc ở băng báo trùm trong trận (tvb.css, anhgen.css) và băng "BOSSES THIS MATCH" đầu trận (vaotran.css). Ảnh kiểm 390×844 + 844×390.

## claude/u-module — gắn cả 93 ụ module (bệ riêng + đầu xoay + PART_B) vào game
- `tools/thap-cat-umod.py` viết lại cho 93 tấm `raw_mod_<id>.png` (5 ụ gen lại bệ không tròn: loa, mana, saochep, tienhoa, vughep; thanhdia tấm 4:3): tách nền loang từ viền ô + vũng magenta kín (lỗ vòng/khung), bỏ vụn rời xa khối chính, giữ chi tiết nhỏ sát khối (giọt, tia sáng, dây cung); viền alpha mềm 1 px + tách trộn nền, kéo ánh hồng ở viền; so mẫu nhiều tỉ lệ (SQDIFF có mặt nạ) để đặt bệ + đầu như ô 1 → trục xoay = tâm bệ. Ô 1 vẽ khác bộ phận (set, radar, bua, thanhdia) → trục = điểm sâu nhất của đầu, tỉ lệ trung vị 0,90. Ảnh kiểm khớp: `KT=thư-mục`. Số đo từng ụ: `docs/demo-hop-tuong/tuvan/u-moi/cat-game.json`.
- Ra `thap/assets/<id>_de.png`, `<id>_nong.png`, `<id>_phu.png`, `nho/<id>.png` (icon trang ụ/thẻ dựng lại từ bệ + đầu mới, đầu chĩa lên). Tool tự ghi `artscale.js`: HEAD_K 93 ụ, `DE_RIENG`, `PHU_K`, `PHU_GIUA`, `UMOD_TIP` (mũi nòng → ART_META.tip).
- Mọi ụ nằm TRONG Ô ở mọi góc xoay: bán kính xa nhất của đầu tính từ trục ≤ 0,485 cạnh ô, vượt thì thu cả ụ (Bắn Tỉa 0,67, Súng Phun 0,70, Liên Thanh/Tesla vừa ô).
- `render.js`: bệ riêng cho cả 93 ụ (`?ucu=1` → bệ chung); phần phụ tại trục `vePhu`: Tesla vòng cuộn (quay chậm, sáng khi sắp phóng), Mạch Máu trái tim, Lõi Combo lõi sáng; Máy Mana đầu đứng (−90°). 37 THIẾT BỊ hỗ trợ/đặc biệt chưa có `gocDau` → quay chậm tại chỗ (0,35 rad/s), không xoay theo quái như súng; luật bắn không đổi, đòn phát từ lõi. Ụ hỗ trợ vẫn không bắn (`thap-kt-khong-ban` đạt).
- 15 ụ đổi dạng có ảnh `_s1.._s3` cũ (vẽ theo đầu trước) → dùng đầu mới cho cả 3 dạng + quầng màu dạng (STAGE_DAU_MOI). Trang ụ: ô dạng dùng icon `nho/<id>` thay bệ chung + đầu.
- Cần GEN LẠI (đầu vẽ nghiêng/chính diện, không phải nhìn từ trên): canon, doc, radar, sungluc, xucxac, docton, nangluong, anhsang, loa, phun, mimic, pandora, phagiap, ngaithoigian, nhieusong, maychem, xaotron, saochep, tuthan, nhanban, loren, hopca, min, xuonganh, nguyenrua, khoathoigian. Ô 1 khác bộ phận: set, radar. PART_B chưa vẽ (để anim sau) nên một số ụ thiếu chi tiết so với ô 1: dây cung no5, trống đạn phun, chùm lông xuonganh, bàn nâng nangsao.
- Nhận diện trong game (`thap-kt-nhandien.js`, ô 46,5 px): cặp ≥ 0,80 = 213 (bản 7 ụ: 1.430; KET-QUA đo trên ô 1 là 95) — các cặp sát nhất là thiết bị tròn viền vàng (dongbo/sinhdoi/orbital 0,90, baotuyet/taylo, bang/khien). Bảng: `docs/demo-hop-tuong/tuvan/nhandien/game-93/`.
- Test: `thap-kt-khong-ban` 25/25, `thap-kt-mau` 116 mục, `thap-kt-keo` 3 cỡ 23/23 (sửa test: chờ màn tải xong thay vì chờ cố định 2,5 s — trước trượt ở 390 khi máy tải chậm), `thap-kt-trum-don` XANH, `thap-kt-ketqua-vua` đạt khi chạy riêng. Hồi quy NHANH=1 390×844 còn đỏ các mục đo khung/CPU/online (máy 2 lõi đang chạy test của phiên khác, tải ~7) — cần chạy lại một mình trước khi publish.

## claude/u-module — gen lại 26 đầu ụ nhìn từ trên + PART_B thiếu (07/11)
- ChatGPT (đính kèm tấm cũ `raw_mod_<id>.png` ở 0cbfbd61 làm mẫu, giữ màu/họ hình bóng): gen lại 33 tấm 2×2 nhìn thẳng từ trên, đầu chĩa lên — 25/26 ụ danh sách (canon, doc, radar, sungluc, xucxac, docton, nangluong, anhsang, loa, phun, mimic, pandora, phagiap, ngaithoigian, nhieusong, maychem, xaotron, saochep, tuthan, nhanban, loren, hopca, min, xuonganh, nguyenrua, khoathoigian), set + radar (ô 1 cùng bộ phận), no5/phun/xuonganh/nangsao (dây cung / trống đạn / chùm lông / bàn nâng nằm trong ĐẦU ô 3 + PART_B ô 4 liền khối). Câu nhắc chung: nòng nằm ngang = hình chữ nhật dẹt, không lộ lỗ nòng.
- Nhận diện: dongbo (tam giác, đồng đỏ + ngọc lam), sinhdoi (thoi, đen-trắng-hồng), orbital (bệ vuông, xanh hải quân, 2 tấm pin rất dài), hasao (bệ diều, trắng-tím) — bỏ bệ tròn viền vàng.
- Chưa gen được (ChatGPT hết lượt ảnh trong ngày, mở lại sau ~10 giờ): lualien (đổi bệ vuông); gen lại lần 2 cho anhsang, mimic, ngaithoigian, xaotron (đầu vẫn hơi chính diện), xucxac, docton (còn thấy lỗ nòng). Prompt sẵn trong localStorage tab ChatGPT không còn — dùng lại câu trong ghi chú này + PHAN-HO.md.
- `tools/thap-cat-umod.py` cắt lại 33 id: KHONG_KHOP = set (ô 1 vẫn vẽ bệ tam giác ngược), pandora (ô 1 bình đậy nắp, ô 3 miệng mở), bua, thanhdia; radar bỏ khỏi danh sách (khớp tốt). Phun 0,73 / orbital 0,71 / nangsao 0,81 / sungluc 0,86 thu nhỏ để đầu xoay vẫn trong ô.
- Đo nhận diện trong game (thap-kt-nhandien.js, như game-93): cặp ≥ 0,80: 213 → 186. dongbo/sinhdoi/orbital (0,90) ra khỏi top 200 (< 0,80); hasao 0,88 → 0,83. Cặp sát nhất giờ baotuyet ↔ taylo 0,92 (chưa đổi); nguyenrua ↔ ngoisao lên 0,90 (đầu lâu vàng nhìn từ trên). Bảng: `docs/demo-hop-tuong/tuvan/nhandien/game-93-v2/` (+ ảnh bàn 93 ụ BAN-*.png).
- Test: thap-kt-khong-ban 25/25, thap-kt-mau 116 mục khớp, thap-kt-dau-v2 390×844 + 844×390 không lỗi trang.
- (Lượt 2, tài khoản ChatGPT mới) gen nốt 9 tấm, đính kèm tấm hiện tại làm mẫu: lualien (bệ VUÔNG vát góc), anhsang (mái đèn tròn + quạt sáng phẳng), mimic (rương mở nắp nhìn xuống), ngaithoigian (lần 3: mặt bằng — đĩa đồng hồ nằm phẳng + nệm + 2 tay vịn), xaotron (lần 3: nắp máy nhìn từ trên, 3 trục dạng khe dọc), xucxac + docton (nòng nằm phẳng, nắp kín, không lộ lỗ). Cặp dễ nhầm: taylo bệ CHỮ THẬP xanh lá chanh + thép (bỏ bánh răng tím); ngoisao xanh da trời/bạc, bệ sao la bàn 8 cánh xanh hải quân (bỏ vàng).
- Ảnh lấy về repo: ảnh ChatGPT (blob) → dataURL → sự kiện copy (ctrl+c) → paste listener trên trang upload GitHub → input file (≤ 4 tấm/commit). Ref: trang ChatGPT tải thẳng raw.githubusercontent bằng `Image.crossOrigin` (không cần tab raw).
- Cắt lại 9 id (`tools/thap-cat-umod.py`), đo nhận diện → `docs/demo-hop-tuong/tuvan/nhandien/game-93-v3/`: cặp ≥ 0,80: 186 → 155; baotuyet↔taylo 0,92 → 0,81, ngoisao↔nguyenrua 0,90 → 0,82. Cặp sát nhất giờ tron↔santhuong 0,90, tron↔thanhdia 0,89, nangluong↔ngoisao 0,89 (chỉ số bóng mờ; nhìn mắt thường khác hẳn: sao xanh vs viên nang vàng). Ảnh bàn 93 ụ: BAN-390x844.png, BAN-844x390.png (xoá FX giữa các bàn).
- Test: thap-kt-khong-ban 25/25, thap-kt-mau 116 mục khớp.
## claude/trum-quai-moi — trùm không mắt (07/11)
- Người dùng (18:46): trùm không cần mắt — khung hoạt ảnh lệch thì mắt nhảy/méo rất xấu. Rà 12 trùm + 6 quái: có mắt/mặt → gen lại ChatGPT (đính kèm dải cũ, giữ ý tưởng/màu/dáng/bố cục, bỏ mắt-mặt-miệng, nhận diện bằng lõi sáng/rune): trùm mad_crown (ngọc vàng trong thạch), freezer (lõi bông tuyết), janus (rune sao vàng mỗi mặt hộp), joker_king (hình rô đỏ trên nắp, rương mimic không mặt), nightmare (lõi pha lê đỏ tròn), octopus (nụ than hồng + rune lửa trên chậu) — cả dải đi + dải chiêu; quái bo, bay, bay_bang (gen 2 lần, lần đầu còn mặt nạ), khong_lo, tach. Giữ nguyên: hive, jammer, prism, twin_core, patcher, leech, que_tach (không mắt).
- Prompt + bảng thay thế: `docs/demo-hop-tuong/tuvan/trum-moi/PROMPT-KHONG-MAT.md`. Raw ghi đè `thap-art/raw_trum2_<id>_{di,chieu}.png` (janus: `chieu_v2`), `raw_quai2_<id>.png`.
- Cắt lại `tools/thap-cat-trum2.py` (+ chân dung). Thêm 2 ngoại lệ hẹp: `CHAN_ID={mad_crown}` (thân hồng sát màu nền: viền đen chặn loang, dải đi không coi mảng hồng là túi nền, dải chiêu túi nền phải đúng màu nền — trước đó thuỳ trái slime bị thủng); `KHU_TIM={freezer}` (khói băng pha tím trong vòng → bỏ). K8 trong `quaianim.js` cập nhật theo ảnh mới (bo 0.708, bay 0.776, …) để cỡ hiển thị giữ như cũ. Gameplay không đổi.
- GIF 320 px (1 bảng màu MEDIANCUT, không dither) + ảnh trước/sau + ảnh trong trận: `docs/demo-hop-tuong/tuvan/trum-moi/gif-khong-mat/`.
- Kiểm (server riêng cổng 8795): thap-kt-huong SOLO — 0 lỗi trang, 0 404, mọi trùm nhìn bàn lúc chiêu (freezer/janus "sau chiêu 0/0 khung" do máy tải 10+ → chạy lại riêng: đạt); chỉ báo fps < 50 do máy đang chạy test session khác. thap-kt-trum-don SOLO XANH 264 tình huống. Xem tận mắt 844×390 + 390×844 (đi + tung chiêu).

## claude/trum-quai-moi — thap: gắn 12 trùm + 6 quái "không tay chân" (07/11)
- Ảnh mới (người dùng duyệt GIF `tuvan/trum-moi`, `tuvan/quai-moi`): trùm/quái là VẬT THỂ không tay chân (slime vương miện, khối băng, hộp đá Janus, hộp hề, mắt ác mộng, hoa lửa, tổ ong, mìn gai, lăng kính, lõi đôi, bánh răng, ốc sao; quái: slime, mắt dơi, tinh thể bay, đá lăn, chùm slime, bọc trứng).
- Cắt bằng `tools/thap-cat-trum2.py` (loang nền từ viền ô, không khoá magenta toàn cục; khử ánh hồng; bỏ đốm lẻ; Lanczos nhân-trước-alpha ≤ 3× cỡ hiển thị). Ra: `trum_<id>_8` (đi), `trum_<id>_atk_16` (tung chiêu 8 khung, ô ×1.5 để hiệu ứng không bị cắt, Janus dùng `chieu_v2`), `trum_<id>_portrait` (băng giới thiệu), `quai_<id>_8`; dải 4 khung dự phòng cho 6 trùm cũ + quái.
- Không còn hướng nhìn: xoá các dải `_side_8` / `_back_8`; `quaianim.js` HUONG_CHUNG = 1 dải cho mọi hướng, không lật (chữ/mặt không bị soi gương); `trum.js` TRUM_ATK + TRUM_CHANDUNG đủ 12 trùm, TRUM_HUONG rỗng; dải chiêu chỉ làm nóng trùm sắp ra (nongskill.js), không nạp cả 12. K8 đo lại để thân to ~như cũ. Gameplay không đổi.
- `tools/thap-kt-huong.js`: vật thể HUONG_CHUNG không xin dải hướng (tránh 404).
- Kiểm: thap-kt-huong (solo) XANH — 12 trùm nhìn bàn khi chiêu, 0 404, fps 58; thap-kt-trum-don solo XANH 264 tình huống; chụp 844×390 + 390×844 xem tận mắt.
## claude/demo-hop-tuong — sửa màn tải đứng ở 20% (07/11)
- `thap/js/taitai.js`: trọng số mỗi file khi tính % tải bị chặn ở 350 KB (ảnh nền lớn không còn "nuốt" thanh tiến độ); vạch tải trận chỉ tạo sau khi khởi động xong, menu luôn cập nhật vạch. Đo mạng 4G giả lập: % tăng đều 20→60% trong 30 s thay vì đứng yên ở 20%.

## claude/demo-hop-tuong — bỏ trần cộng dồn 4 ụ đặc biệt (07/11)
- Người dùng chốt: kỹ năng cộng dồn đặc biệt KHÔNG có trần (như Kalaratri DCDW), tiếp nối Ember Relay (f5cbf778).
- Quantum Choir (`hopca`): đếm MỌI ụ cùng sao trên bàn (bỏ tối đa 7).
- Fusion Archive (`luutru`): bỏ MAX 40 (sinh / capNhat / hook ghép); GROW 0–9 / 10–29 / 30+, chỉ vòng tiến độ bão hoà ở 40.
- Scrap Forge (`loren`): bỏ trần 15 cộng dồn (luôn cho ăn được) và trần +60% mỗi ụ nhận — nhiều Forge cộng thẳng; power-up giữ +0.3%/cộng dồn; GROW 15+.
- Leviathan: bỏ trần 100 ABYSS; tấm đếm luôn hiện số (không còn 'MAX'), ≥100 chữ sáng hơn.
- Chữ EN/VI (text.js, roster.json, meta.js, skilldemo, hudb, demkn) + vi.json/ngonngu-vi.js; test thap-kt-vang-moi (cân bằng đạt), thap-kt-kynang-vd, thap-kt-leviathan cập nhật.

## claude/demo-hop-tuong — bỏ mọi trần hỗ trợ + ĐỘT PHÁ cho kỹ năng cộng dồn (07/11)
- Người dùng chốt (12:15): bỏ HẾT trần hỗ trợ (`hotro.js`): tốc / sát thương thường / sát thương có điều kiện (lộ, chậm, cầu vồng) / Amplifier / chí mạng / ST chí mạng / suy yếu quái (25%) — các trần nhân bậc × cấp thẻ không còn. Trần riêng Star Lift 50%, Resonance Grid (+10% trần), Reaper (nhóm giết ngay) cũng bỏ.
- Giữ giới hạn tự nhiên: tỉ lệ chí mạng ≤ 100% (critU), xác suất giết ngay / kháng khống chế ≤ 100%, làm chậm ≤ 90% (trùm giữ 15%). ST chí mạng không trần. Reaper: power-up +0.5%/bước cộng thẳng vào tỉ lệ giết ngay.
- Chữ: bỏ "(cap …)", "MAX +x%", "fire-rate cap" (Radar OVERDRIVE nay đúng +25%), hàng CARD LV không còn dòng "cap".
- ĐỘT PHÁ (`DOTPHA`, cuối vangmoi1.js): cộng dồn vượt ngưỡng → thưởng bậc cộng dồn: I +15% tốc bắn · II +30% ST chí mạng · III +25% sát thương · IV +10% chí mạng & +50% ST chí mạng.
  Ngưỡng: Ember 5/10/20/40 lửa · Choir 3/5/8/12 ụ · Archive 10/25/50/100 · Forge 6/15/30/60 (thưởng vào ụ nhận) · Leviathan 25/50/100/200 · Chain Link 3/5/8/12 · Combo 5/10/20/40 · Nine-Tail 1/3/6/10 lần xả cầu lửa (giữ qua ghép).
  Chữ kỹ năng thêm "BREAKTHROUGH II: … · next breakthrough at N" (VI: ĐỘT PHÁ). Lên bậc: nổ PNG no_phao + chữ nổi.
- Màu bậc: icon tấm đếm (demkn.js) + lửa Ember (vfxp2.js) = bản sao PNG lọc màu (ctx.filter) dựng 1 lần (`DOTPHA.ten`): cam → vàng → lam → tím → trắng; tấm Ember không còn "/8".
- (12:54) Trùm: trần chậm 15% → 50% (HOTRO.CHAM_TRUM + Frost/Jammer/Rainbow/Static… dùng chung; chữ "(bosses max 50%)").
- (12:54) Bớt rối trên ụ cộng dồn: BỎ hào quang lửa to (buffvfx.js, hào quang "DAMAGE UP" fxb_dmg vì ụ tự buff sát thương) và 3 viên ngọc dạng (motvong.js, ngoc_xanh = dạng grow 1–3) → thay bằng 1 vòng sáng mảnh fx_vong_mong tô màu bậc dưới ụ (cam → vàng → lam → tím → cầu vồng 6 màu), ảnh tô 1 lần rồi giữ. Ụ nhận Scrap Forge cũng dùng vòng này. Ảnh trước/sau: docs/demo-hop-tuong/tuvan/dot-pha/.
- Test: thap-kt-vang-moi (thêm mục Đột phá, cân bằng đạt), thap-kt-vfx-p0 (cập nhật luật không trần, sửa câu Radar OVERDRIVE bị lặp), thap-kt-kynang-tx (suy yếu không trần), thap-kt-vi, tests/can-bang-vang. Ảnh xem: 844×390 bàn có đủ 5 bậc.

## claude/demo-hop-tuong — sửa 2 lỗi cộng hưởng (07/11)
- Vua Ghép VÀNG kéo lên Vua Ghép giờ +2★ (trước chỉ +1★ — luật MK+MK đè luật vàng). Vua Ghép thường kéo lên Vua Ghép vẫn +1★.
- Hộp Bí Ẩn và Hộp Tiến Hoá (thẻ ghi "Does not shoot") không còn "chọc" gây sát thương (growfx chocU). Thêm `tools/thap-kt-khong-ban.js` vào hồi quy: mọi ụ thẻ ghi không bắn phải gây 0 sát thương.

## claude/chong-roi — Chống rối hiệu ứng khi 15 ụ cùng bắn
- Gộp nổ trúng trùng tâm (`fx.js FX.no`): cùng loại, < 0,3 ô, < 80 ms → phóng vụ cũ 1 bậc +25% thay vì đẻ dải mới; chớp nòng / nổ lớn / trùm giữ nguyên.
- Gộp số sát thương trùng chỗ trong 150 ms thành 1 số cộng dồn (`FX.chu1`).
- Vòng nạp chiêu < 70% mờ 25% (trừ ụ đang chạm xem) — `fxu.js PX.vongHoi`; hào quang buff dịu về 20% sau 1,5 s (`buffvfx.js`).
- Hố Đen vẽ dưới quái, đĩa/mở màn ≤ 50% đục, hố trùng tâm chỉ vẽ 1 lần (`render.js`, `vfxp2.js`, `sigfx.js`).
- Chỉ đổi hình (không đổi luật, không thêm Math.random). Số đo trước/sau: `docs/demo-hop-tuong/tuvan/vfx15/sau/SAU.md`; công cụ `tools/thap-kt-15u.js` (thêm biến OUT).

## claude/gop-0711 — gộp chong-roi + trum-quai-moi; hào quang "tăng 1 lần" chỉ loé rồi tắt (07/11 13:15)
- Luật người dùng: TĂNG sát thương / tốc / chí mạng kiểu 1 lần (thêm cộng dồn, thưởng vĩnh viễn như Ép Xung, tăng 1 lần) → hào quang chỉ LOÉ ~0,35 s rồi mờ hẳn về 0 ở ~0,9 s (không đọng, không giữ 20%); mỗi lần tăng thêm thì loé lại. Ụ vừa đặt / vào trận đã có sẵn cộng dồn: không loé.
- BUFF THẬT có thời hạn / điều kiện (RAGE ×2, khiên, chậm chạm, hành quyết, buff từ ụ hỗ trợ KỀ, sát thương có điều kiện, Aurora, tăng tốc tạm thời, Berserker cuồng nộ) → vẫn hiện suốt thời gian còn hiệu lực, dịu về ~20% sau 1,5 s như chong-roi (chạm xem ụ → đủ sáng).
- Cách phân: `BVX.doManh` tính thêm phần "bền" `out.p` (nguồn từ ụ khác trong `T.nguon` + dkHien/aurora + tocT/cuongT/rage); `capNhat` đánh dấu `ben/tang` từng loại; `ve` bỏ loại "tăng 1 lần" đã hết loé. Vòng màu bậc ĐỘT PHÁ ở ụ cộng dồn giữ nguyên.
- Ảnh trước/sau 844×390 (0,3 s và 3 s sau khi Ép Xung 10 ụ, Radar ở giữa buff 4 ụ kề): `docs/demo-hop-tuong/tuvan/loe-0711/truoc-sau-844x390.jpg`.
- Kèm: đánh dấu `vetay-ok` dòng lọc màu vòng mảnh (vangmoi1.js DOTPHA.tenVong) — thap-kt-vetay báo trượt từ 99cf82e8.
## claude/demo-hop-tuong — rà lỗi cộng hưởng luật (07/11)
- Test mới `tools/thap-kt-cong-huong-luat.js` (339 cặp, trong thap-kt-hoiquy.js): ghép đặc biệt × đá/băng/vàng/thức tỉnh/7★/bản sao × mọi ụ; kỹ năng khi ghép chạy đúng 1 lần (0 lần khi đá+đá / ghép đặc biệt) ở SOLO/PVP/CO-OP; RAGE ×2 và bản sao −% trên đòn của mọi ụ; bộ đếm × ghép / mất sao; chiêu trùm × khiên / Mirror / Holy Shield / Halo; PVP Holy Shield × hiệu ứng ghép đối thủ; 26 ca từ ChatGPT.
- Sửa 4 lỗi: RAGE ×2 nay áp lên bom Drone và nổ Blood Circuit; Fusion Archive chỉ đếm ghép thật (Teleporter đổi chỗ qua lại từng nuôi vô hạn; Copycat/Overclock/Forge cũng không tính); Holy Shield chặn cả +mana triệu hồi của Signal Jammer.
- Tài liệu: docs/demo-hop-tuong/tuvan/cong-huong/ (BAO-CAO, KIEM-KE, CHATGPT, CHATGPT-SPECIAL — đề xuất cân bằng chưa áp dụng, CAN-HOI 10 câu A/B).

## claude/demo-hop-tuong — làm lại hiệu ứng Rối Máy (07/11)
- Lỗi cũ: bàn tay tím ma (sig_l22_hand) nhìn NGANG, ngón chĩa sang phải chứ không xuống quái, khung lệch số ngón + phát tới-lui theo sin → ngón giật; dây móc gần như không thấy; 3 dạng sao không khác nhau.
- Mới (ảnh ChatGPT, `raw_fx_marionette_{tay,thanh,day}.png` → `tools/thap-cat-marionette.py` → `thap/assets/fx_marionette_*.png`): 1–3★ STRINGS = thanh rối gỗ hạ xuống trên đầu quái, 3 dây vàng búng xuống móc vào, thanh lắc khi kéo lùi; 4–6★ GOLDEN HAND = găng cơ khí vàng nhìn từ trên hạ xuống, khép ngón (8 khung mở → nắm) bấu đỉnh quái, thân quái vẫn thấy; 7★ TWIN = 2 găng (con thứ 2 lật gương, nhỏ hơn). Hết giờ: găng mở ngón buông / thanh bay lên rồi nổ rối đồ chơi như cũ.
- Chỉ đổi hình (js/sigfx.js `SIG.K.roi.moi`), luật không đổi; thiếu ảnh mới → vẽ bản cũ. Xem `docs/demo-hop-tuong/tuvan/marionette/TRUOC-SAU.gif`.

## claude/demo-hop-tuong — thẻ trận +1/+2/MAX, chống vuốt nhầm thành kéo (07/11)
- Thẻ trong trận (#bo-the, SOLO/CO-OP/PVP/ONLINE): bỏ chữ "LV" — cấp trận 1 không hiện gì, mỗi lần nâng "+1/+2/+3", tối đa (lv ≥ 5) "MAX" vàng ngay ở chỗ nhãn cấp; bỏ thẻ chữ MAX góc trên-trái cũ, ô giá vẫn ẩn khi MAX → MAX chỉ hiện 1 lần (`THEBAI.nhanTran`, `css/otoigian.css`). Bảng thông tin ụ cùng cách ghi: "3★ · +2" / "3★ · MAX" / "3★" (ui.js, ttgon.js; ngonngu.js nhận tiền tố mới để dịch phần sau).
- Nhãn giá ◆ nâng lên sát/đè nhẹ viền dưới khung thẻ (neo theo đáy ô `--ot-sq`, `css/khongvien-mana.css` 5b); giá chỉ huy theo cùng hàng (80 → 69 px, nổi trên khung). Màn ngang (chữ to `--ot-k`) giữ dưới nhãn +n/MAX.
- Màn XÂY BỘ BÀI (js/dkkeo.js): cảm ứng trên thẻ lưới xê dịch > 8 px trước khi giữ đủ = CUỘN (mọi hướng — trước: đi ngang > 8 px hoặc giữ 150 ms = kéo); kéo chỉ khi giữ yên 280 ms hoặc kéo thẳng lên khỏi mép trên lưới; chuột vẫn kéo ngay. Giữ yên để mở trang chi tiết 400 → 550 ms (dkcham.js) để kịp bắt đầu kéo sau 280 ms. Bộ sưu tập (cuộn gốc) không đổi.
- Test mới `tools/thap-kt-vuot-deck.js` (cảm ứng CDP 390×844 + chuột 1280×800). Ảnh trước/sau: `docs/demo-hop-tuong/tuvan/the-tran/`.
- 13:30 áp luật người dùng chốt (CAN-HOI 1B 3B 6B 7B 8B 10B): Mimic + Scrap Forge = ghép thường; khiên ụ chặn cả +mana Signal Jammer; Mirror phản bị khiên / Holy Shield đối thủ chặn (không dây chuyền); ụ đá/băng không nhận trạng thái xấu mới nhưng vẫn mất sao khi bị hạ sao; REINFORCE bỏ ụ băng; ô băng không nhận buff hỗ trợ. Test 361 cặp.

## claude/demo-hop-tuong — rà soát VFX triệu hồi/đạn/chủ động (07/11)
- Quay 16 hiệu ứng trong trận 844×390 + đo ms/khung + độ "bật" ảnh; bảng `docs/demo-hop-tuong/tuvan/vfx-ra-soat/BANG.md`, tư vấn ChatGPT `CHATGPT.md`.
- Sửa hình (luật giữ nguyên): Overlord bỏ chớp trắng toàn màn + rung vừa; Hydra 7★ tia dừng sau quái xa nhất bị xuyên, bỏ phủ xanh toàn màn; Black Hole bỏ phủ tím toàn màn; đạn Mortar nhỏ lại (trước to hơn ụ).
- Gen sẵn 5 dải ảnh (hoả hồ Nine-Tail, nổ Orbital, mìn chờ, nổ chùm Mortar, drone bom) — chưa gắn, chờ duyệt cùng danh sách việc đụng nhịp luật.

## claude/demo-hop-tuong — gắn 5 hiệu ứng mới + Rồng bổ nhào + khớp nhịp (07/11)
- 6 dải ChatGPT mới (cắt bằng `tools/thap-cat-vfx5.py`: tách trộn magenta, loang nền từ viền ô, khử viền, bỏ đảo lẻ, thu 3×) gắn trong `thap/js/vfxmoi.js`, ảnh chưa tải thì vẽ hình cũ:
  lửa cáo Nine-Tail (`fx_cuuvi_hoho`, mũi lửa kéo sau hướng bay) · nổ quỹ đạo Orbital đúng lúc bom trừ máu (`fx_orbital_bomno`, bỏ 2 ảnh nổ cũ chồng) ·
  mìn chờ đèn nháy Mine Layer (`fx_min_mo`) · nổ chùm 5 cánh Mortar CLUSTER (`fx_mortar_chum`) · drone bom Drone Bay (`fx_drone_bom`, quay theo hướng bay) ·
  Rồng Máy DRAGON DIVE: rồng nhìn từ trên lao dọc đường (`fx_ronglua_dive`, raw `raw_fx_ronglua_dive.png` gen mới) đúng toạ độ trúng, vẽ trên lớp nổ; bỏ đầu rồng 1,7 ô trên ụ + luồng lửa kẻ từ ụ.
- Fusion Archive: 3 xung nổ lúc ụ mới lộ ra (0,47 s, cách nhau 0,25 s) thay vì 0 ms; trước `o.t` bị cộng 2 lần/bước nên 3 xung dồn trong 0,25 s. Vị trí chọn lại ở xung đầu (chỗ quái đông nhất, tất định). Tổng sát thương giữ nguyên 3 × 160%.
- Chúa Tổ SWARM: drone mất mục tiêu (quái chết do drone trước) bám quái sống GẦN CHỖ ĐÓ nhất thay vì quái đầu đường → không còn drone bay ngang bàn ~2 s sau khi chùm nổ xong. Sát thương mỗi drone giữ nguyên.
- Lớp phủ màu cả màn sau sét Overlord: `FX.chop` (chớp màn) chỉ giảm trong vòng mô phỏng → bàn đứng (tạm dừng / TAI.doi giải mã ảnh sau chiêu lớn) thì đọng nguyên lớp phủ. Nay vẫn tắt theo thời gian thực (`js/ui.js`).
- GIF trước/sau: `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-<tên>.gif`.

## claude/demo-hop-tuong — sửa drone SWARM nổ sớm, nổ chùm cối bị cắt mép (07/11)
- SWARM: cả bầy cất cánh cùng lúc, chia mục tiêu lúc cất cánh (dự tính quái đã đủ chết) và cùng tới sau 0,5 s (trước lệch −0,05 s/con + chuỗi đổi mục tiêu kéo tới 1,3 s); ngòi chích thường (đạn cùng ảnh drone) không nổ "WOW" bậc đỏ trong lúc bầy bay — đây là "drone nổ sớm khúc dưới"; nổ chùm Mortar / nổ Orbital / Rồng bổ nhào sát mép canvas dời tâm vào trong (tối đa 40% bề rộng), không còn bị cắt. GIF `TRUOC-SAU-swarm2.gif`, `TRUOC-SAU-mortar-mep.gif`.

## claude/demo-hop-tuong — BÀN GỌN cho mọi ụ (người dùng 07/11 15:48)
- Mở rộng cách làm của ụ cộng dồn (99cf82e8) ra TOÀN BỘ 93 ụ: hào quang lửa/chớp to (fxb_max / fxb_dmg / fxb_toc / fxb_crit) KHÔNG còn đọng trên ụ.
  - Tăng 1 lần (cộng dồn, thưởng vĩnh viễn, Ép Xung…) → loé hào quang ~0,35 s rồi tắt hẳn ~0,9 s (luật 84243b79).
  - Buff bền có hạn / điều kiện (RAGE, hỗ trợ kề, có điều kiện, tăng tốc tạm thời, cuồng nộ) → 1 VÒNG MẢNH dưới ụ (`fx_vong_mong` tô màu 1 lần, giữ trong REN.anh): RAGE vàng cam · sát thương đỏ cam · tốc vàng · chí mạng tím; 1,5 s đầu rõ rồi dịu ~40% (chạm xem ụ → rõ). Ụ đã có vòng bậc ĐỘT PHÁ thì không thêm vòng.
  - Khiên / chậm chạm / hành quyết giữ hào quang nhưng dịu (×0,6) và vẫn dịu về ~20% sau 1,5 s.
- Bỏ hàng 3 viên ngọc dạng (motvong.js `MV.veNgoc`) cho MỌI ụ (`MV.GON = true`; false = hình cũ). Dạng đã thấy ở hình ụ; chỉ còn 1 hạt ngọc nhỏ ở góc dưới-phải huy hiệu sao khi đã lên dạng (lam = dạng giữa, vàng = dạng cuối), nảy nhẹ lúc vừa lên dạng.
- Ảnh trước/sau 93 ụ (7 trang × 15 ô, 3,5 s sau khi đặt): `docs/demo-hop-tuong/tuvan/ban-gon/{truoc,sau}-390x844.jpg`, `{truoc,sau}-844x390.jpg`; ụ có dạng: `dang-truoc-sau-390.jpg`.
- Test: thap-kt-vfx-p0, thap-kt-khong-ban, thap-kt-vang-moi, thap-kt-mau, thap-kt-vetay XANH.

## claude/u-module — gộp bàn gọn (8b577bc1) + sửa lệch RNG 30/60 FPS (07/11)
- Gộp `claude/demo-hop-tuong` (bàn gọn: bỏ 3 viên ngọc dạng → 1 hạt ở huy hiệu sao, hào quang buff chỉ loé) — không xung đột.
- `fx.js` `FX.no1`: góc xoay ảnh nổ trúng lấy từ toạ độ thay vì `Math.random()`. Lý do: `FX.no` gộp dải nổ theo `A.t` (chỉ tăng theo nhịp vẽ), nên số lần gọi `Math.random` trong bước luật phụ thuộc FPS → RNG luật lệch giữa 30/60 FPS (nguy cơ lệch online lockstep). Lỗi có sẵn, lộ ra khi hình học đầu nòng 93 ụ module đổi (thap-kt-anim đỏ → xanh).
## claude/demo-hop-tuong — bỏ khung bậc rườm rà trên thẻ, giữ khung vuông (07/11)
- Người dùng: "bỏ khung vàng thừa, cả khung đỏ/xanh/tím; giữ khung vuông như giờ". Ô ụ mọi bậc (lưới XÂY BỘ BÀI + BỘ SƯU TẬP, 5 ô bộ bài, khay trận, dải vào trận/đối thủ, bảng xem nhanh/#tt, bóng kéo) dùng chung khung vuông `o_vien_trang.png`; bậc đọc bằng viền mảnh 1,5 px màu bậc (CSS outline: trắng bạc · xanh · tím · vàng · đỏ). Bỏ hàng ngọc bậc ở đáy ô.
- Chỉ huy giữ viền vàng + vương miện (phân biệt chỉ huy). LV, bộ đếm 0/1, viền đang chọn, khoá/mờ giữ nguyên.
- Code: `thap/js/otoigian.js` (OT.gan tham số mv; ụ → o_vien_trang, không ngọc), `thap/css/otoigian.css` (--otc theo data-otb), `thap/js/dkkeo.js` (bóng kéo ô vuông 76×76, thôi dùng khung Pass 9).
- Ảnh trước/sau: `docs/demo-hop-tuong/tuvan/khung-the/` (deck, bộ sưu tập, khay trận 390×844; deck, bộ sưu tập 844×390; bóng kéo).
- Test: thap-kt-vuot-deck 24/24, thap-kt-bo2hang, thap-kt-chon, thap-kt-bopopup không lỗi.

## claude/demo-hop-tuong — chi tiết ụ hiện cấp sau tăng gì (07/11)
- Trang ụ (TURRET FILE): hàng **Next level** ngay dưới hàng CARD LV / nút LEVEL UP — tối đa 2 số có nhãn dạng `Damage 49 → 53 (+4)` (xanh lục), còn lại `+N more` → chạm mở bảng chi tiết, cuộn tới mục **Next card level** (đủ mọi số đổi + đoạn kỹ năng có số đổi). Thẻ MAX: `Next level · MAX`.
- Ô thông số: số tăng nhỏ màu xanh ở góc dưới phải (Damage `+4`, Fire rate nếu đổi; ụ hỗ trợ: ô Boosts = bước buff thẻ).
- Cách tính (unitpage.js `upCapSau`): dựng bàn tạm, đặt `B.capThe[id] = k` và `k+1`, chạy CHÍNH hàm trận ở 1★ — `dmgU`, `tocTT`, `knThe` (KY_NANG_CAP), `THATSO.capThe`, `SUP.chu` / `sk.mo` (gồm số VM1/SK7 theo cấp, Copycat %, Orbital bom…) — so từng đoạn ` · ` chỉ giữ số đổi; đoạn trùng chỉ số kỹ năng thẻ thì bỏ; phần tự xem trước `(LV9 → LV10: …)` bỏ khỏi so sánh. Ngẫu nhiên lúc sinh cố định hạt cho 2 lần chạy. Không chép công thức.
- thebai-ui.js: hàng CARD LV chèn trước `.up-sau` (để hàng Next level nằm dưới). Tiếng Việt: vi.json (Cấp sau, Cấp thẻ kế tiếp, +# nữa, Trần…). Ảnh: docs/demo-hop-tuong/tuvan/chi-tiet-cap/.

## claude/demo-hop-tuong — Abyss mưa từ trời, hiệu ứng dừng trên đường, lửa Wyrm Engine (07/11)
- Người dùng 19:05: bỏ đầu rồng của Leviathan TIDAL BREATH; hiệu ứng sân phải dừng trên đường; lửa Wyrm Engine "xấu quá".
- Leviathan TIDAL BREATH (`thap/js/sigfx.js` SIG.K.tho): bỏ đầu rồng `lev_rong` + luồng băng kẻ từ ụ. Cột nước + quả cầu nước bắn thẳng lên trời từ ngọc ụ, rồi mưa giáo nước rơi đều dọc cả đường (1 giọt / ~24 px, toạ độ nằm trên đường), vương miện toé lúc chạm. Mỗi giọt chạm đất đúng nhịp HU.thoThuy trừ máu chỗ đó (nhịp 0,1 s, đầu sóng ≤ s + 85 px). Ảnh ChatGPT sẵn có: `fx_leviathan_tia` / `fx_leviathan_dan` / `fx_leviathan_trung`. Luật (vùng trúng, ×4+0,1·Abyss, đẩy lùi, 1,4 s) giữ nguyên. Chữ mô tả kỹ năng (text.js / ngonngu-vi) vẫn nói "ice dragon" — chưa đổi.
- Hiệu ứng sân dừng trên đường (`thap/js/vfxmoi.js` VXD): vùng cắt = dải đường (rộng 0,62 × DUONG_RONG mỗi bên, nối tròn ở khúc rẽ, cắt đúng 2 đầu đường), tâm ảnh ghim lên đường. Áp cho: vũng độc Toxic Pool, mìn + nổ mìn (P3), Máy Dựng Tường (tường thường + tường vàng; tia chiếu từ ụ không cắt), Hố Đen (đĩa xoáy + khoảnh khắc M01), nổ Orbital (bomno; vạch từ trời không cắt), nổ chùm Mortar, nổ đạn Mortar / Toxic Pool / Mine Layer / Orbital (FX.no + vòng), Rồng bổ nhào (rồng 68 px + huy hiệu kết không lố đầu đường, vệt cháy), nổ sét Overlord (tờ P2), TIDAL BREATH (vòng ở đầu sóng), Bão Tuyết (bông tuyết rơi xuống dọc đường thay vì rải khắp sân). Bỏ VXM.vao (dời nổ vào trong canvas) — nay ghim trên đường. Chỉ trình bày, cap() gốc giữ nguyên.
- Wyrm Engine (ronglua) nón lửa: dải mới ChatGPT `raw_fx_wyrm_lua2.png` 8 khung (mũi phun hẹp sáng ở nòng → nón lửa sạch toả tới tầm; bắt lửa 0–2, chảy lặp 3–5, tàn 6–7) → `fx_wyrm_lua2.png` + dạng 2/3 đổi kênh đỏ↔lam `fx_wyrm_lua2_2/_3.png` (`tools/thap-cat-wyrm2.py`). Mũi lửa = tầm, bề ngang ở 70% = nón trúng (VUNG_ANH.wyrm2X/Y; thap-kt-vfx-p0 đo dải mới). Chưa tải → dải cũ `fx_wyrm_lua`.
- GIF: `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-{abyss,duong,wyrm}.gif`.

## claude/vien-bac — viền bậc quanh bệ mọi ụ (07/11, người dùng duyệt 18:25)
- Mỗi ụ có **viền kim loại ôm sát hình bóng bệ, màu = bậc**: Trắng → bạc · Xanh → lam · Tím → tím · Vàng → vàng · Đỏ → đỏ (Vàng/Đỏ có ánh kim nhẹ). Đầu ụ giữ màu riêng để nhận diện. Ụ xám (bị vô hiệu) → viền bạc.
- Ảnh: `thap/assets/<id>_vien.png` (93 ụ, trắng có vát sáng trên-trái + rãnh tối sát bệ) sinh từ alpha của `<id>_de.png` trong `tools/thap-cat-umod.py` (`CHI_VIEN=1 python3 tools/thap-cat-umod.py` để dựng lại riêng viền; `VIEN_PX` độ dày, mặc định 8 px ảnh). Khung = bệ + 12 px mỗi phía, cùng tâm.
- Game: `REN.vienBac(id, bac, da)` tô màu 1 lần (multiply + giữ alpha, như DOTPHA.tenVong) rồi giữ trong `REN.anh`; `REN.than()` vẽ viền ngay dưới bệ (cache thân theo bậc). Không có ảnh viền / bệ chung → không viền (dự phòng). `window.KHONG_VIEN=1` tắt.
- Vòng ĐỘT PHÁ (vòng sáng mềm tròn dưới ụ cộng dồn) giữ nguyên — tròn, mờ, to hơn bệ nên vẫn tách khỏi viền bậc (đã xem ảnh). Ảnh trước/sau: `docs/demo-hop-tuong/tuvan/vien-bac/`.

## claude/demo-hop-tuong — FREEZER đóng băng ụ NGẪU NHIÊN (07/11)
- DEEP FREEZE nay chọn **ngẫu nhiên** 3–5 ụ mỗi lần (bỏ ưu tiên ụ nhiều sao). Vẫn tất định theo `rngTrum` (online khớp), cùng số ụ (`LUAT_BANG.so`) và 6 s; ô đá không bị chọn, ụ đang băng được tránh nếu còn ụ khác; Halo/khiên như cũ; co-op chia 2 bàn như cũ.
- Chữ mô tả trùm (EN + VI): "Freezes 3 random turrets…" / "Đóng băng ngẫu nhiên # ụ…"; màn vào trận: "Freezes 3–5 random turrets".

## claude/demo-hop-tuong — giữ tay thẻ Vàng/Đỏ: bỏ khung cũ, trả khung bậc ô lưới (07/11)
- Người dùng: ý là khi NHẤN GIỮ thẻ Vàng/Đỏ hiện khung kiểu cũ (khung Pass 9 có cánh/sừng/lửa) — bỏ khung đó, chứ không bỏ khung bậc trên lưới.
- Trả lại khung bậc ô lưới như trước 56baba3f (`o_vien_<bậc>` + hàng ngọc) cho lưới XÂY BỘ BÀI/BỘ SƯU TẬP, 5 ô bộ bài, khay trận, dải vào trận (`thap/js/otoigian.js`, `thap/css/otoigian.css`).
- Bóng kéo / giữ tay (`thap/js/dkkeo.js`): thôi dùng `KHUNG.url` (Pass 9), dựng ô vuông 76×76 cùng khung ô lưới (`OT.gan` + `MAT.fit` chân dung); thiếu OT thì vẽ dự phòng như cũ. Bộ sưu tập giữ tay không hiện bóng (chỉ mở trang ụ) — không có khung cũ.
- Ảnh 390×844 (DPR 3) trước/sau: `docs/demo-hop-tuong/tuvan/khung-the/giu-tay/` (so-sanh-giu-vang-do.jpg). Test: thap-kt-vuot-deck 24/24.

## claude/demo-hop-tuong — Abyss: cầu nước bay LÊN rồi mưa khắp đường · lửa Wyrm Engine hết cụt (07/11 tối)
- Người dùng 20:11: TIDAL BREATH "trông như tia bắn từ trên xuống" → muốn từ ụ bắn giọt/cầu nước LÊN trời (thấy bay khỏi ụ), rồi rơi xuống khắp đường. 20:12: lửa Wyrm Engine "cụt lửa".
- Leviathan TIDAL BREATH (`thap/js/sigfx.js` SIG.K.tho): BỎ cột tia dọc `fx_leviathan_tia`. Pha 1 (0 → ~0,6 s): 5 cầu nước `fx_leviathan_dan` (3 khi EFFECTS gọn) lệch nhịp 0,05 s bắn từ ngọc ụ, quả đầu thẳng lên, các quả sau vòng nhẹ ra 2 bên, vọt quá mép trên; càng cao càng nhỏ + mờ; toé nhỏ ở ngọc lúc bắn. Pha 2: mưa giáo nước rơi tới các điểm đều dọc cả đường (~24 px/giọt); độ cao / thời gian rơi / cỡ / nghiêng lệch nhau cố định theo giọt (đọc thành mưa); chạm đất đúng nhịp HU.thoThuy (như cũ) → vương miện toé `fx_leviathan_trung`. Luật, thời điểm trừ máu và vùng cắt VXD giữ nguyên. Lưu ý: đầu sóng bắt đầu ở LÕI ngay o.t ≈ 0, nên các giọt sát lõi buộc phải chạm sớm (cùng lúc cầu đang bay lên); phần còn lại của đường rơi sau.
- Chữ kỹ năng: bỏ "ice dragon / rồng băng" → "water orbs shoot up from the turret and rain down along the whole path" / "cầu nước bắn vọt lên trời từ ụ rồi đổ mưa xuống khắp đường đi" (text.js, skills5.js `mo`, skilldemo.js, vi.json → ngonngu-vi.js).
- Wyrm Engine: nguyên nhân cụt = ảnh ChatGPT `raw_fx_wyrm_lua2.png` khung 3–5 chạm mép phải ô → lửa bị chặt thẳng đứng (không phải vùng cắt VXD; HU.nonLua không bị cắt). `tools/thap-cat-wyrm2.py` nay làm mờ dần ~34% cuối mỗi khung theo mép răng cưa cố định → mũi lửa mềm; đo lại mũi / bề ngang cùng ngưỡng thap-kt-vfx-p0 → VUNG_ANH.wyrm2X 0,801 / wyrm2Y 0,645 (mũi lửa vẫn = tầm). Cả 3 dạng (cam / xanh / trắng) sinh lại.
- GIF: `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-abyss2.gif`, `TRUOC-SAU-wyrm2.gif`; ảnh trận `tran-390x844-abyss2.jpg`, `tran-844x390-abyss2.jpg`.

## claude/demo-hop-tuong — 10 cơ chế đặc biệt theo tư vấn ChatGPT + cộng gộp thưởng (07/11)
Nguồn: `docs/demo-hop-tuong/tuvan/tu-van-game/TOM-TAT.md` (người dùng duyệt 18:44). Code: `thap/js/jackpot.js` (khung JP chung) + móc nhỏ ở game.js / skills*.js / vangmoi1.js.
- **Cộng gộp:** mọi +% cùng loại (ST / tốc / ST chí mạng) từ hỗ trợ, cộng dồn, đột phá, jackpot, Mimic, số Pháo La Bàn, ST có điều kiện của hỗ trợ → cộng trong nhóm rồi nhân nhóm (ST × tốc × chí mạng). Không trần (tỉ lệ chí mạng ≤ 100%). Nhân riêng có chủ ý: RAGE ×2, suy yếu quái, bản sao −%, mốc sao 5/7★. Đo ca xấu nhất (`node tools/thap-sim-jackpot.js boi`, Ember 7★ 40 lửa + Mimic + 4 hỗ trợ 7★ + Forge 60 + ô anh hùng + Masterwork + Overclock + RAGE): **×3287 kiểu nhân → ×436 cộng gộp** (không RAGE ≈ ×218).
- **Khung jackpot:** điều kiện chỉ đọc trạng thái bàn + G.t (tất định, không Math.random); thưởng vào T.buf (cùng nhóm cộng); hồi chiêu riêng từng jackpot; ụ đá/băng không góp, không nhận; bản sao Copycat không chép tiến độ/thưởng; PVP/CO-OP chỉ bàn mình; nhật ký `G.jpLog`. Hình: nổ fx_awaken tô màu ≤ 0,42 s trên ụ nhận + 1 lấp lánh fx_tia_sao góc trên-trái khi đang chạy + tiến độ n/N trong tấm đếm (≤ 3 dấu hiệu/ụ); thưởng jackpot không bật hào quang buff. Tên jackpot chỉ hiện khi bật gợi ý trận.

| Jackpot (ụ) | Khó | Điều kiện (số cuối) | +ST / +tốc / +STCM | Giây | Hồi | Thêm |
|---|---|---|---|---|---|---|
| MASTERWORK (Scrap Forge) | 5 | cho Lò ăn 1★+2★+3★ trong 75 s | +240 / +85 / +150 | 15 | 90 s/Lò từ lúc kích | ụ Tấn công sao cao nhất (hoà: ô nhỏ); đòn đầu mỗi trùm +800% D9 |
| ORBITAL CASCADE (Orbital) | 3 | 2 lần ghép Vệ Tinh+Vệ Tinh **≥ 2★** trong 1 lần thức tỉnh 23 s | +100 / +45 / +60 | 10 | 45 s | mỗi Vệ Tinh 4 bom ×180% vào quái nhiều máu nhất |
| CHROMATIC HEIST (Prism Thief) | 4 | ghép cùng màu ĐỎ→VÀNG→XANH trong 60 s | +160 / +65 / +120 | 10 | 30 s sau khi hết | mỗi phát thứ 3 xuyên (không thêm hệ số) |
| CHAIN REACTOR (Chain Link) | 4 | nhóm ≥ 4, ≥ 3 ụ mỗi ụ 3 đòn trực tiếp trong 5 s | +150 / +60 / +90 | 12 | 40 s/nhóm | mỗi 6 đòn: tia sét 250% D9 sang quái khác |
| BLOOD ECLIPSE (Blood Circuit) | 4 | ≥ 6 VAMP, 2 lần hiến khác sao trong 25 s → tiêu 2 VAMP cuối | +180 / +70 / +110 | 11 | 30 s | 3 xung xuyên làn × 300% D9 |
| TRUE NORTH (Compass Cannon) | 3 | 3 ghép cùng mũi tên trong 45 s, không ghép ngược xen giữa, số ≥ 6 | +110 / +45 / +70 | 12 | 30 s | 1 phát xuyên ×600% D9 |
| GRAND CHORUS (Quantum Choir) | 4 | ≥ 6 ụ cùng sao **≥ 3★** (có Choir, ≥ 3 loại Tấn công) giữ 10 s | +160 / +60 / +110 | 12 | 50 s | vỡ đội hình mất tiến độ; phải vỡ rồi dựng lại |
| SIX SEALS → ROYAL VAULT (Pandora) | 5 | túi xáo 6 phép (hạt giống), lần mở thứ 6 | +220 / +85 / +150 | 15 | — | ụ Tấn công sao cao nhất + 100 mana; online gửi dấu 6 trong gói ghép |
| LOADED DICE (Dice Gun) | 3 | Pháo **≥ 3★**, 12 phát có đủ 3 dải (chí mạng không tính) | 6 phát đúng 300% / +70 / +80 | ≤ 8 | 30 s | |
| PERFECT FREQUENCY (Radar) | 4 | Radar **≥ 3★**, 4 ô thẳng là ụ Tấn công ≥ 3 loại, giữ 8 s | +85 / +50 / +90 | 10 | 50 s | Radar bị khoá/câm → tắt sớm |

- **ĐỘT PHÁ theo độ khó** (`DOTPHA.KHO/BANG`): khó 2 (Choir, Archive) I +12% tốc · II +25 STCM · III +20% ST · IV +8% CM / +40 · khó 3 (Ember, Leviathan, Compass) = mốc cũ · khó 4 (Forge, Chain Link, Combo, Nine-Tail) +20% · +40 · +35% · +12% / +65. Choir 1★ không đột phá; Leviathan mốc 5/10/20/40; Compass mốc số 4/8/16/32.
- **Cộng dồn do HÀNH ĐỘNG = riêng từng ụ (người dùng 18:57):** ABYSS Leviathan chỉ ụ nuốt mới tăng, ụ mới = 0, ghép 2 Leviathan ra Leviathan giữ số lớn hơn (GIU_CONG_DON). Nine-Tail / Scrap Forge vốn đã riêng ụ. Cộng dồn theo điều kiện bàn (Choir, Railgun, Chain Link, Star Cannon, Combo, VAMP, Prism COMBO) giữ nguyên.
- **Pháo La Bàn lên bậc VÀNG (người dùng 20:10):** roster `bac: vang` (cấp thẻ bắt đầu LV9, hệ số bậc ×2.6), sát thương gốc 26.5 → 20; bộ hướng dẫn thay Pháo bằng Sniper; họ EXPLOSIVE: Pháo sang hàng Vàng; đột phá khó 3 theo số.
- **Nhịp đo** (`node tools/thap-sim-jackpot.js nhip 4`, bot sim-vaitro + cho Lò ăn): JACKPOT đầu Solo: Pandora W13, Choir W15, Dice W9.5, Chain W16, Orbital W17 · PvP: Dice W7, Orbital W8, Pandora W13.5; ĐỘT PHÁ đầu: Forge W6–6.5, Choir W6–9.5, Chain W7.5–10, Leviathan W12–15.5. Prism / Blood / Masterwork cần chơi có chủ đích (bot không căn màu / không giữ VAMP) → chỉ kiểm bằng test luật.
- Test: `tools/thap-kt-cong-huong-luat.js` nhóm 10 (53 ca jackpot: kích / không kích / đá-băng / Copycat / PVP / online Pandora / ABYSS riêng / cộng gộp) — 414+ cặp đạt.
- Ảnh: `docs/demo-hop-tuong/tuvan/tu-van-game/anh/`.

## claude/demo-hop-tuong — rà soát hướng dẫn kỹ năng 93 ụ: clip Test range + chữ kỹ năng tiếng Anh đơn giản (07/11)
- Người dùng (20:24): clip hướng dẫn có đủ/đúng không; chữ phải dễ hiểu cho người yếu tiếng Anh. Bảng 93 ụ: `docs/demo-hop-tuong/tuvan/huong-dan-u/BANG.md`, ảnh `anh/`.
- Lỗi chung: băng chú thích nằm đúng lên đường trên → quái + số sát thương bị che ở MỌI clip. Khung cắt y 150…530 → 112…532 (`skilldemo.js` SD_Y0/SD_CAO, `unitpage.js` khungXem, `css/unitpage.css`); chú thích xuống đáy khung, chữ 19 px, câu dài 2 dòng (dịch cả câu trước khi tách), nằm giữa nút "4★" và nút dừng; ô mana/hồi chiêu lên góc trên-phải.
- Clip cụ thể hơn: Pháo La Bàn số TO trên mỗi Pháo + câu "2 + 1 = 3", "3 − 1 = 2", "3 × 15% = +45%" (ụ chính ≤5★ để lần ghép 2 luôn hợp lệ); Lửa Thập Tự mũi tên dọc hàng + cột, "+1" trên Relay nhận lửa, "✗" trên Relay lệch, số lửa mỗi Relay (`ks.ve` lớp vẽ riêng kịch bản); Hộp Bí Ẩn khoảng sao đúng luật (4★ → 4–6★); Đèn Săn Thưởng không trượt sự kiện mana; số thứ tự Tesla/Đĩa Nảy/Hydra hiện 0,8 s; dòng cuối bị cắt (Drone, Leviathan, Khoá Thời Gian, Độc) viết ngắn lại; "Aura ×…" → "Buff ×… vs 1★".
- Chữ: 93 câu `TEXT.turret[id].skill` viết lại A2 (LÀM GÌ → CÁCH KÍCH → MẸO; từ khoá Merge/Summon/Neighbours (4 sides)/Row/Column/★/Stack/Breakthrough/Freeze/Stone/Boss), sửa lệch luật (Star Lift bỏ "max +50%", Venom 2 quái ở sao cao, Mixer/Armor Breaker bỏ số cố định sai); ~100 câu chú thích clip đơn giản hoá. VI: +186 mẫu kỹ năng + ~140 câu clip trong vi.json.
- Công cụ: `tools/thap-chup-huongdan.js` (chụp mọi chú thích của mọi clip, ghi lỗi + sự kiện trượt). Chưa làm: dòng chi tiết `SKILLS[id].mo` (skills*.js đang có thay đổi của session jackpot).

## claude/demo-hop-tuong — hiệu ứng sân: đặt TÂM lên tim đường thay vì CẮT ảnh (07/11 23:09)
- Người dùng 23:09 (ảnh nổ bị cắt thành dải dọc đường trên): không ép vừa đường bằng cách cắt ảnh; làm ảnh nhỏ lại, đặt TÂM / CHÂN (điểm chạm đất) vào giữa đường, mép được tràn ra ngoài, nhưng chỗ trúng phải dồn trên đường; hiệu ứng vỡ đất lấy đường làm tâm.
- `thap/js/vfxmoi.js` VXD: bỏ hẳn vùng cắt (ctx.clip theo dải đường). Thay bằng `VXD.dat(ctx, x, y, D, f)` = dời tâm lên điểm gần nhất trên tim đường (polyline G.duong) + thu nhỏ quanh tâm để khung ảnh ≤ `VXD.DMAX` = 2,2 × DUONG_RONG (~101 px, thân sáng ≈ 1,5 bề rộng đường); `VXD.doi(o, pad, f)` = chỉ dời tâm. Không lố qua 2 đầu đường: tâm dời vào trong dọc đường (pad ≈ 0,42 × cỡ ảnh), không cắt.
- Áp cho: Toxic Pool (vũng ~2,4r), mìn chờ + nổ mìn P3, Máy Dựng Tường (tường thường/vàng, tia chiếu tới đúng tâm mới), Hố Đen (đĩa xoáy 2r + khoảnh khắc M01 cùng hệ thu nhỏ), nổ Orbital (vạch từ trời + nổ chạm cùng 1 điểm trên tim đường), nổ chùm Mortar (132 → 101 px), nổ/vòng FX.no + FX.vong1 của Mortar / Toxic Pool / Mine / Orbital / tường / hố đen / Overlord / TIDAL BREATH (vẽ lại tại tim đường, cỡ ≤ DMAX), sét Overlord (đầu tia chạm tim đường, tờ p2_overlord 248 → 101 px), Rồng bổ nhào (rồng + vệt cháy + huy hiệu kết trên tim đường), Bão Tuyết (bông tuyết rơi sát tim đường). `VXM.vao` = không dời (VXD đã dời — tránh dời 2 lần).
- `thap/js/sigfx.js` TIDAL BREATH (Abyss): giọt mưa chạm đúng tim đường (bỏ lệch ngang 3 px), giọt đầu/cuối kẹp cách đầu đường 20 px.
- Chỉ trình bày: cap() / vùng trúng / sát thương / thời điểm giữ nguyên. Lưu ý: ảnh Hố Đen lớn (r > 50) nay nhỏ hơn bán kính hút thật (thap-kt-vfx-p0 đo cỡ vẽ gốc trước khi thu nhỏ nên vẫn xanh).
- Ảnh: `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-tam-duong.gif`, `tam-duong-390x844-*.jpg`, `tam-duong-844x390-*.jpg`.

## claude/demo-hop-tuong — Hố Đen về đúng bán kính hút + vòng hồng sét Overlord thu nhỏ, tâm trên đường (07/11 23:26)
- Người dùng 23:26: (1) sau bản đặt tâm lên đường, hình Hố Đen nhỏ hơn vùng hút thật → cho hình Hố Đen khớp lại bán kính hút (chỉ Hố Đen được miễn giới hạn cỡ), vẫn đặt tâm trên đường, không cắt; (2) vòng hồng quanh mỗi cú sét Overlord vẫn to kiểu cũ → thu nhỏ theo cỡ các hiệu ứng sân khác (~bề rộng đường) và đặt tâm đúng điểm sét đánh trên đường.
- `thap/js/vfxmoi.js`: HU.hoden + SIG.K.hoden (M01) gọi VXD.dat với giới hạn 1e9 → không thu nhỏ, mép xoáy = o.r (1★ 68 · 4★ 80 · 7★ 92 px), chỉ dời tâm lên tim đường.
- Vòng hồng = vòng dư âm `FX.vong1` do `CG.veMot` (camgiac.js) sinh ra LÚC VẼ nổ trúng `fx_overlord_trung` (r1 = 0,62 × 110 ≈ 68 px) → lọt ra ngoài VXD (cũ: to ~157 px, tâm lệch theo quái). Nay bọc lời gọi veMot trong VXD.dang → vòng vào VXD.vong: cỡ ≤ 1,1 × DMAX, tâm ghim trên tim đường. Vùng trúng / sát thương không đổi.
- `tools/thap-kt-vfx-p0.js`: đo mép xoáy Black Hole tính cả hệ thu nhỏ của ctx (trước đo cỡ trước khi thu nên không bắt được lỗi; bản cũ nay báo 50,6/80 → đỏ, bản mới 80/80).
- Test: thap-kt-vfx-p0 xanh, thap-kt-khong-ban đạt. Ảnh: `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-hoden-overlord.jpg` (390×844 + 844×390).

## claude/demo-hop-tuong — vệt lửa Dragon Dive mới (07/11)
- User 23:31 "rồng lửa chạy để lại vệt lửa hơi xấu": vệt cháy sau Rồng Máy DRAGON DIVE trước là chuỗi chấm quầng cam rời (HU.vetChay, 1 chấm/0,08 s).
  Nay = dải ChatGPT `fx_ronglua_vet` (raw `docs/demo-hop-tuong/thap-art/raw_fx_ronglua_vet.png`, cắt bằng `tools/thap-cat-vet-lua.py`; 8 khung: 0–5 lửa cháy lặp, 6–7 tàn than)
  LÁT NỐI dọc TIM ĐƯỜNG sau lưng rồng: đoạn đặt đều theo lưới trên đường, xoay theo hướng đường, tâm dải trên tim đường (mép tràn, không cắt), 2 đầu khung làm mềm sẵn nên gối nhau không lộ nối;
  mỗi đoạn bắt lửa → cháy lặp → chuyển tàn than → tắt hết trong đúng thời gian cháy 3 s (`thap/js/vfxmoi.js`, khối cuối).
- Luật giữ nguyên (vùng cháy/sát thương/thời gian của HU.vetChay). Vệt dưới nón phun thường giữ hình cũ; chưa tải ảnh → hình cũ.
- GIF trước/sau `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-vet-lua.gif`, ảnh `tran-390x844-vetlua.jpg`, `tran-844x390-vetlua.jpg`. Test: thap-kt-vfx-p0, thap-kt-khong-ban, thap-kt-vetay đạt.

## claude/demo-hop-tuong — Copycat không chép ụ đang hoá đá (08/11)

- Người dùng chốt: **Copycat (Máy Sao Chép) KHÔNG chép ô đang HOÁ ĐÁ**. Ô đá không sáng khi cầm Copycat, thả lên không có gì xảy ra. Ô BĂNG cùng sao vẫn chép được như cũ (bản sao thường).
- Code: `SKILLS.saochep.ghepDB.hopLe` thêm `!b.st.da` (skills2.js); chữ kỹ năng: "frozen too, NOT stone".
- Test cập nhật: `tools/thap-kt-copycat-da.js`, `tools/thap-kt-conghuong.js`.

## claude/demo-hop-tuong — vệt lửa Dragon Dive: bám đuôi rồng + cua mềm (08/11)
- User góp ý bản 0942d62d: vệt phải CHÁY DẦN sau lưng rồng, đầu vệt dính đuôi rồng; góc đường không gãy/chồng/hở; co-op không bay sang nửa đồng đội.
- `thap/js/vfxmoi.js` (khối cuối, viết lại): vệt vẽ thẳng từ o.t của HU.rongBo (cùng công thức toạ độ rồng) → đầu vệt luôn ở đuôi rồng ở mọi khung/tốc độ (1×/2×/3×, khung thấp);
  mỗi điểm trên đường có đồng hồ 3 s riêng tính từ lúc rồng qua (bắt lửa → cháy → tàn than nằm dưới, lửa lụi dần → tắt; đầu cũ tắt trước).
  Dải dựng sẵn thành dải lặp liền (khung gối nhau), vẽ thành lát mỏng dọc tim đường: đoạn thẳng lát khít mép (ghim lưới điểm ảnh, không vằn sọc),
  cua làm tròn tim đường (bán kính 30) + lát xoay theo hướng, nở phía ngoài cua. Vẽ dưới quái (ngay sau nhãn bàn). Chấm quầng cũ của vệt rải không vẽ nữa khi có ảnh.
- `tools/thap-cat-vet-lua.py`: mép trên/dưới nền đất mềm hơn (không lộ mép hộp lúc tàn than).
- Co-op (kiểm 2 máy, máy chủ giả): rồng của mình chỉ bay ĐƯỜNG CỦA MÌNH (làn mình + hành lang chung tới lõi), sát thương chỉ trúng quái mình được bắn
  (banDuocQuai: làn mình + vùng chung) — không trúng làn riêng của đồng đội. Rồng thấy trên làn đồng đội = chiêu của ĐỒNG ĐỘI (máy B phát lại 'cd' trên bàn 1). Luật không đổi.
- GIF `docs/demo-hop-tuong/tuvan/vfx-ra-soat/TRUOC-SAU-vet-lua-2.gif`, ảnh `tran-390x844-vetlua-2.jpg`, `tran-844x390-vetlua-2.jpg`, `goc-vetlua-truoc-sau.jpg`.
  Test: thap-kt-vfx-p0, thap-kt-khong-ban, thap-kt-vetay đạt; tests/coop đạt; thap-kt-online như trước (cùng 1 lỗi sảnh có sẵn).

## claude/demo-hop-tuong — gắn bộ SFX anime / hào hùng (mẫu MP3) + luật trộn + ghi công (08/11)
- Người dùng 23:44: "bạn quyết định âm thanh". Chọn 1/3 phương án cho 25 sự kiện bằng đo phổ/độ dài/độ to/lách tách (numpy) — bảng chọn + lý do: `docs/demo-hop-tuong/tuvan/am-thanh-anime/CHON.md`. Mã hoá MP3 mono 96 kbps 44.1 kHz (iOS không phát OGG): `thap/assets/sfx/<sự-kiện>.mp3`, 25 file, 406 KB.
- `thap/js/sound.js` v4: mẫu phát trước, synth cũ làm dự phòng (mẫu chưa nạp / `?nomau`). Tải trước sau `load`, giải mã ở lần chạm đầu; mở khoá chỉ ở sự kiện có quyền phát (touchend/pointerup cảm ứng, mousedown, phím thường). Đi qua bus SFX → theo nút/thanh âm lượng SFX.
- Ánh xạ: họ bắn (súng/pháo/tỉa/phóng → ban-sung dời giọng; laser/năng lượng; băng; độc; sét; cận chiến) + họ LỬA mới (`W.lua`, `gLua`); chết, crit, nổ, UI chạm / quay lại (nút đóng/về), triệu hồi, ghép thường / sao cao (+ mốc sao), hỗ trợ, đầu đợt, **hết đợt** mới (`game.js` khi sân sạch), đột phá (thức tỉnh), **jackpot** riêng (`jackpot.js`), trùm ra / kỹ năng / gục, thắng / thua.
- Luật trộn: trần 24 giọng + 4 mức ưu tiên (P0–P1 cướp giọng P3), giới hạn tần suất/giọng từng sự kiện + cả nhóm bắn (≤ 6 giọng, ~16 phát/s), lệch cao độ ±1.5–5 %, né nhạc theo dB lấy mức sâu nhất (bắn/nổ thường không né), bỏ giọng "WAVE" mỗi wave, 1 BRAAM khi trùm ra (bỏ stinger nhạc nếu có mẫu), chuỗi tổng bỏ nhấn 2.8 kHz + limiter −9 dB/tanh → nén 3.5:1 + limiter −2 dB (độ to nhạc giữ như cũ). Tiếng trúng 90 → 160 ms.
- Ghi công CC BY 4.0 (Oculus Audio Pack 01, 8 file): Cài đặt → nút **CREDITS / GHI CÔNG** (ô trống cạnh CHAT, không thêm hàng) → bảng tác giả / nguồn / giấy phép (`home.js` moCre, `css/tvc.css`), VI trong vi.json.
- Test: `tools/thap-kt-am-thanh.js` mới đạt (nạp 25/25, ánh xạ 25, giới hạn giọng, tắt SFX, ?nomau, trận 60 s 390×844 xen kẽ mẫu/synth: giọng max 14, CPU trong SND.* 5.7 vs 11.8 ms/s, node 163 vs 301, CPU khung ngang nhau); thap-kt-vi "Tiếng Việt đủ", thap-kt-khong-ban, thap-kt-vfx-p0 xanh. Ảnh: `docs/demo-hop-tuong/tuvan/am-thanh-anime/anh/`.
- Cần người dùng nghe thử trên điện thoại thật (Claude không nghe được): độ to tương đối mẫu ↔ synth còn lại (trúng, lên cấp, chỉ huy) và nhạc.

## claude/demo-hop-tuong — sửa hoạt ảnh 12 trùm lệch lạc (08/11)
- Soát hồi quy gộp hỏng fa1146a8: `quaianim.js`, `trum.js`, dải `trum_*` trên nhánh đều trùng bản 994f0b28 (không còn dấu xung đột / lùi bản).
- **Lỗi chính — dải TUNG CHIÊU lệch so với dải ĐI** (`tools/thap-cat-trum2.py`): tâm cắt ô chiêu bị nhân tỉ lệ `sc` hai lần (truyền toạ độ đã phóng vào `dat()` vốn tự nhân `sc`) + khớp thân bằng "lõi ăn mòn" sai → lúc báo chiêu thân trùm nhảy lên-trái tới 15% ô và phình/co (prism, janus, jammer, patcher, nightmare, mad_crown…). Nay khớp bằng **mặt nạ alpha** (dò tỉ lệ + tịnh tiến, IoU) khung chiêu 8 ↔ khung đi 1/8, chia `sc` đúng; bỏ mảnh lọt từ ô raw bên cạnh (chấm đen trên đầu janus). Cắt lại 12 `trum_<id>_atk_16.png` (`--chi-atk`: không đụng dải đi / chân dung). Độ lệch tâm thân đi↔chiêu: trước 3–13% → sau ≤ 1%.
- `quaianim.js`: trùm **không hoà khung** (dải trùm đổi hình lớn giữa 2 khung → hoà ra 2 vương miện/2 thân chồng); bỏ dự phòng khung 3 dải 4 khung cũ lúc tung chiêu (lệch tâm, sai cỡ K8); dải chiêu dùng cùng góc lắc với dải đi; **chết giữa chiêu** nổ đúng cỡ dải chiêu (trước co còn 2/3); không hoà hướng nhìn khi 2 lớp cùng 1 dải (vật thể không tay chân); thanh máu trùm 0.55 → 0.6 cỡ (đỉnh nảy mad_crown/freezer/joker_king chạm thanh). Chỉ là hình — luật/đồng bộ online không đổi.
- Ảnh trước/sau (844×390 + 390×844, đi 1×, chiêu, chết giữa chiêu) + bảng khớp dải: `docs/demo-hop-tuong/tuvan/trum-anim/`.
- Còn cần ảnh mới (không tự gen): dải chiêu **mad_crown** vẽ khác thiết kế dải đi (mũ hề có chuông + đế viền bèo) → đổi dáng khi tung chiêu.
- Test: thap-kt-trum-don (1320 tình huống), thap-kt-anim, thap-kt-vfx-p0, thap-kt-khong-ban xanh; thap-kt-hoiquy: lỗi còn lại có sẵn trên nhánh trước khi sửa (Copycat/đá, canon cấp 15, màu overlord) — không dính trùm.

## claude/demo-hop-tuong — chân dung mới "Một thiên hà, nhiều chủng tộc" cho 93 ụ (08/11)
- Sinh 82 ảnh mới bằng ChatGPT (8 tab song song) theo `docs/demo-hop-tuong/tuvan/chan-dung-moi/STYLE.md` + `prompts-93.json`; overlord vẽ lại nền xanh thép tương phản (đọc rõ ở ô 50 px). Gốc 1536×1024: `docs/demo-hop-tuong/tuvan/chan-dung-moi/raw/cd_<id>.png`.
- Nối vào game: `tools/thap-cat-chandung.py` (+ mốc mặt `tools/thap-cat-chandung.json`) cắt `pilot_<id>.png` 427, `pn/pilot_<id>.png` 256 (ô vuông 46 % chiều cao, mắt ở 40 % ô), `hero/hero_<id>.jpg` 1170×1020 (giữa 1174×1024) và ghi lại `PO_NEO`/`HERO_NEO` (chandung.js), `FACE_BOX` (khung.js) cho 89 ụ.
- Canon giữ nguyên. 3 ụ chưa có ảnh mới (hết lượt tạo ảnh ChatGPT Plus, không còn tài khoản đã lưu): **kiembang, chimang, dichchuyen** → giữ ảnh + mốc cũ.
- Bảng tổng: `docs/demo-hop-tuong/tuvan/chan-dung-moi/TONG-93.jpg`. Đã xem: kho, bộ bài, 6 trang ụ, khay trận ở 390×844 và 844×390.
- Test: thap-kt-khong-ban đạt; thap-kt-vuot-deck 24/24; thap-kt-chandung: không lỗi cắt mặt; còn lỗi có sẵn "chip up-q đè vùng mặt" ở thẻ kho (mọi ụ, kể cả ảnh cũ) và 1 ô bộ bài bienmau "không có mốc" (trước sửa: 8 ụ không có mốc).

## claude/demo-hop-tuong — nhóm B: tướng ĐỎ + Sói Máy / Hydra / Nemesis theo ý người dùng (duyệt 08/11)
- Nguồn: `docs/demo-hop-tuong/tuvan/ghi-chu-nguoi-dung/` (TOM-TAT, CHATGPT-SPEC, GHI-CHU). Luật tất định (không Math.random trong luật mới; bàn con rối online chờ ảnh chụp bàn).
- **Sói Máy** (skills2.js): chuyển cận chiến → BẮN. Thường 1 nòng 1.0D mỗi 1.8 s; thức tỉnh há 3 nòng, loạt 3 × 0.5D cách 0.1 s, loạt mỗi 1.2 s, luôn chí mạng (D = 55, giữ ~DPS bản thường cũ). Đầu sói mới `soi_dau_thuong/_thuctinh` (nhìn thẳng) — code xoay theo hướng bắn (`veDau`, móc mới ở render.js).
- **Hydra** (skills3.js): số đầu = số sao, chuỗi s viên cách 0.18 s ((0.35 + 0.08×sao)D/viên), nghỉ max(1.6, 2.2 − 0.1×sao) s; 7★ 7 viên cách 0.15 s. BỎ power-up mana (`khongNang`: nangCap từ chối, ô giá ẩn, AI bỏ qua). Chạm từ 3★: 10 + 5×sao mana, hồi 20 s, kéo dài 4 + 0.5×sao + 0.25/cấp thẻ: 3–6★ bắn nhanh ×2, 7★ SÚNG MÁY 10 viên/s × 0.45D (LV9 7.5 s). Bỏ tia hợp đầu. Đầu rắn `hydra_dau/_ha` vẽ s đầu, mỗi đầu xoay theo mục tiêu riêng. D = 40.
- **Nemesis** (skills4.js): bỏ kết liễu máu thấp + phán quyết %máu trùm + mốc 7★ nhảy. Mỗi 10 đòn trúng trực tiếp: thường nhiều hơn → +4% tốc (trần 40%), tinh anh/trùm nhiều hơn hoặc hoà → +6% ST (trần 60%); +0.2/+0.3 điểm %/cấp thẻ trên 9. Thước 10 chấm dưới ụ.
- **Chúa Tổ** (skills5.js): drone bay vòng = sao; hồi cả bầy 2×sao / [1 + 0.15×(số thả trước − 1)] / [1 + 0.02×(cấp − 9)]; đủ bầy + có quái → thả hết, mỗi con (0.70 + 0.15×sao)D × (1 + 0.08×(n−1)). SWARM 3★+ hồi 25 s: thả ngay +35%, lần nạp kế 1.5 s/drone. Bỏ ngòi chích, drone đậu ụ kề, drone vàng 7★. Vẽ ≤ 4 drone + "×N"; ảnh `fx_hive_drone/lao/vet/no`. D = 80.
- **Rồng Máy**: thiêu 3 s = 0.15D × 1.5 × sao (ST/giây 0.075×sao×D), nguồn mạnh nhất, làm mới thời gian. Không đụng vệt lửa Dragon Dive (vfxmoi.js).
- **Hố Đen** (skills.js): mỗi 10 − 0.5(sao−1) s, bán kính 64 + 4×sao, CHỈ GIỮ CHÂN (thường 1.2 s, tinh anh 0.6 s, trùm không) rồi nghiền (2.0 + 0.6×sao)D (trùm 50%); bỏ rút máu + kéo lùi. SINGULARITY COLLAPSE 3★+: 30 mana, hồi 40 s → hố kế +24 px, giữ 2 s, +3.0D, trùm −0.5% máu tối đa. D = 90.
- **Lõi Khởi Sinh** (skills5.js): mỗi 12 s ÷ (1 + 0.03×(cấp − 9)) (power-up −3%/bước) +1★ ụ kề dấu cộng sao thấp nhất (<7, không đá/băng/Lõi; hoà → ô nhỏ hơn); lượt = sao lúc sinh, hết → tự huỷ; không có ô hợp lệ → chờ, không mất lượt; hạ sao → lượt = min; tăng sao không hồi. GENESIS 3★+: 30 mana, hồi 45 s, gọi 1★ vào ô trống kề nhỏ nhất (hạt giống). Không tự phát (tốn mana). Bỏ +★ ụ đồng đội co-op và hạt giống 7★.
- **Thuỷ Quái**: đòn của chính ụ hạ tinh anh +3, trùm +10 ABYSS (điểm riêng từng ụ như cũ).
- **Hào Quang Thánh BỎ** (thebai.js `THE_BO`): lọc khỏi danh sách ụ lúc nạp (ui.js) → bộ bài/gacha/cửa hàng/bộ ngẫu nhiên không còn. Bù: thẻ đã có → thẻ Đỏ đầu tiên chưa có (có hết → thẻ Đỏ đầu), giữ cấp lớn hơn + cộng bản sao, ghi `d.doi`; bộ bài `turret_bo` + bộ mẫu `turret_pre` thay đúng ô; gộp hồ sơ Firebase (KT.gop) chạy lại bù; bộ bài người khác online (bản cũ) thay bằng thẻ Đỏ đầu chưa có trong bộ (dongbo.js). Bộ mẫu SHIELD WALL đổi sang Genesis Core. Ảnh chụp bàn online có id lạ đã bị bỏ qua sẵn (datO).
- Kỹ năng chạm tốn mana dùng chung `traMana` (thiếu → nhãn "Need X mana"; bàn con rối chạy lại lệnh 'cd' không trừ). Hàm `capThe9` = số cấp thẻ trên LV9.
- Chữ: mo(), TEXT, roster.json/meta.js, mốc sao, trang ụ, demo kỹ năng; ~225 bản dịch Việt mới (vi.json → ngonngu-vi.js). Ảnh: `tools/thap-cat-do-b.py`; bản pixel chưa có → ghi `docs/pixel/DANH-SACH.md` "Bổ sung".
- Test: `tools/thap-kt-do-nhomb.js` mới (32 luật + chụp 844×390 / 390×844 trận + trang ụ) đạt; thap-kt-khong-ban, vfx-p0 (cập nhật: Halo bỏ, Genesis không tự phát, chu kỳ mới), trum-don, conghuong2, vang-sua, ngoai-deck đạt; thap-kt-vi và cong-huong-luat chỉ còn lỗi Copycat có sẵn.
## claude/demo-hop-tuong — làm lại tướng VÀNG nhóm A theo quyết định người dùng 08/11 (TOM-TAT / CHATGPT-SPEC)

- **Cấp thẻ 10–17 (Vàng/Đỏ):** thẻ Vàng/Đỏ lên tới **LV17** (`THE.lvMaxBac`, thêm 2 bậc bản sao/vàng — bậc khác vẫn 15). Mỗi cấp trên cấp đầu: **Tấn công +5% ST và +2% tốc** (`tocThe` trong tocU), **Hỗ trợ +4%** giá trị (bảng KY_NANG_CAP các ụ Hỗ trợ Vàng: ×1.32 ở LV17), **Đặc biệt/Khống chế +3%** (`heDB`). Đỏ tính theo số cấp trên cấp đầu (LV11) — không đổi mức khởi đầu. Bản lưu cũ giữ nguyên.
- **Pháo La Bàn:** giữ nguyên (không sửa).
- **Ember Relay:** ụ mới lửa = số sao; ghép 2 Relay → mọi Relay cùng hàng + cột: lửa = max(cũ, A + B). Mỗi lửa +2% ST, +0.12% chí mạng. Trần **70** (LV11 100 · LV13 130 · LV15 160). Đột phá 10/30/50/70. Icon lửa theo mốc: cam → trắng/xanh/vàng/đỏ (`lua_t1–4`), 1 ngọn lửa nhỏ lượn quanh đầu ụ.
- **Quantum Choir → HARMONY:** mỗi ụ kề 4 hướng cùng số sao = 1 Hoà âm (tối đa 4, ụ băng tính, đá không): +25% ST +8% ST chí mạng mỗi cái; 2 = bắn thêm quái thứ 2 (50%); 3 = +30% tốc; 4 = +50% ST chí mạng + đòn vang 150% mỗi phát thứ 3; 7★ +25% tốc. Bỏ GRAND CHORUS + đột phá cũ.
- **Fusion Archive:** mỗi lần **ghép thật** (thường, đá+đá, Anvil+Anvil) → +1 điểm cho **1** Archive ngẫu nhiên (hạt giống theo số lần ghép), viên lưu bay vào (`kho_bay`/`kho_no`). Vua Ghép, Sao Chép, Dịch Chuyển, Ép Xung, đánh dấu Mạch Máu, buff Anvil, trứng nở: không tính. +1% ST/điểm; mốc 10 +15% tốc · 20 +8% chí mạng · 30 +25% ST · 40 +40% ST chí mạng · 50/60/70 +20/30/40% ST; trần 40 (50/60/70 ở LV11/13/15). Bỏ 3 xung Archive + Archive.
- **Scrap Forge → TWIN ANVIL:** dạng ST (búa) / tốc (bánh răng) quay hạt giống lúc sinh; cộng dồn đầu = sao, tối đa 14. Anvil + Anvil **cùng dạng** (khác sao được, khác dạng không ghép): tỉ lệ 100×(1−(tổng−1)/14) + 4 điểm %/cấp (khi tổng ≥ 8); thành công: đích sao max, cộng dồn = tổng; hỏng: mất ụ kéo, đích giữ cộng dồn lớn hơn. Kéo lên ụ khác: +3% ST hoặc +2% tốc mỗi cộng dồn × (1+3%/cấp), **mỗi ụ 1 loại buff**; ghép 2 ụ có buff → lấy buff mạnh hơn; tắt khi hoá đá. Bỏ MASTERWORK. Ảnh cắt từ `raw_gc_forge_dmg/toc`.
- **Prism Thief:** 4 màu cố định (mặt nạ `bienmau_m_*`): đỏ 4% giết quái thường, vàng 6% +2 mana (trần 6 mana/s/bàn), lam 8% đóng băng 1 s (+0.06 s/cộng dồn), lục 10% +40% ST chí mạng; trần cộng dồn 10→18 (LV9→17). **CHROMATIC CIRCUIT**: vuốt 1 đường qua 4 Prism 4 màu liền nhau (không chéo/lặp) — hồi 25 s, mỗi Prism tiêu ≤ 3 cộng dồn (+5%/cộng dồn), màu cuối = đòn kết. Online: gói `pm`. Bỏ CHROMATIC HEIST.
- **Blood Circuit:** kéo lên ụ mình = ĐÁNH DẤU (không di chuyển); sau 5 + 3×sao giây nuốt → +5×sao Máu (±3 s khi mục tiêu lên/xuống sao; đá: dừng; mất/đổi: huỷ). Không nuốt 7★, Trứng, Twin Anvil, Lõi Khởi Sinh, Hỗ trợ. **Chạm** khi ≥ 10 Máu → Blood Rite: ụ Tấn công kề mạnh nhất +30% ST +15% tốc 20 s. Bỏ VAMP / BLOOD ECLIPSE.
- **Railgun → SALVO BATTERY:** đổi tên + hình (`raw_gc_salvo`); thêm thưởng dở dang: hàng 3/5 +25%, 4/5 +65%, 5/5 +200% ST · cột 2/3 +35%, 3/3 +150% tốc.
- **Evolver → TRỨNG:** nở sau (10 + 2×sao) s ÷ (1+3%/cấp) thành ụ ngẫu nhiên +1★ (không phải ghép); 6★ sau 22 s → **trứng cháy 7★** (không nở, không bắn, hạ sao vẫn cháy); **chạm trứng cháy = +20 mana**. Ảnh `trung_1/2/3/no/chay7/vo`.
- **Hero Foundry:** giữ bản 25 s: ô GHÉP thành ô anh hùng 25 s, +80% tốc +30% ST chí mạng (+3%/cấp), 1 ô/bàn.
- **Huy hiệu sao:** ảnh số ngôi sao `hh_sao1–7` (4★ xếp 1 hàng, ghép từ 2 ảnh 2★; 7★ = 1 sao đỏ to) thay khiên số; chưa tải → khiên số cũ.
- Ảnh mới chưa có bản pixel: ghi `docs/pixel/DANH-SACH.md` mục "Bổ sung". Dịch tiếng Việt: thêm vào `vi.json` → `ngonngu-vi.js`.
- Test: mới `tools/thap-kt-vang-g2.js` (luật thuần, số B5) + `PW=1` / `thap-kt-vang-g2-pw.js` (trận thật + vuốt pointer + ảnh 844×390 & 390×844) + `thap-kt-vang-g2-demo.js` (khung Test range 27 clip). Cập nhật kỳ vọng (luật đổi có chủ ý) ở thap-kt-cong-huong-luat, thap-kt-vang-moi, thap-kt-vang-moi2, thap-kt-vang-sua, thap-kt-kynangcap, thap-kt-vfx-p0. Lõi Khởi Sinh: dòng cấp thẻ 'Raise time' theo bảng mới (94.3% LV11 → 80.6% LV17). Còn lỗi CÓ SẴN (không do đợt này): kynangcap 'canon, haoquang' (bảng Pháo La Bàn cũ / Hào Quang đã bỏ), thap-kt-kynang-vd lỗi hotro.apDung từ trước.

## claude/demo-hop-tuong — Pháo La Bàn tổ hợp hướng (08/11)
- Người dùng (08/11): la bàn sinh ra 1 hướng N/S/W/E, chọn Pháo để ghép → tổ hợp NE NS NW SW SE WE → NSW NSE NWE SWE → NSWE; mỗi hướng bắn 1 **tên lửa đuổi**; NSWE + NSWE cộng dồn stack tăng sát thương (không trần). Thay toàn bộ luật cũ "mũi tên + số" (cùng hướng cộng số, ngược hướng trừ + sóng nổ, đạn xuyên) — bỏ hết.
- **Gọi ra:** 1 hướng ngẫu nhiên, `T.hb` = mặt nạ bit (1 N · 2 E · 4 S · 8 W), bốc bằng `rngHat(hạt trận + bàn + ô + số lần)` — tất định cả offline (trước offline dùng Math.random).
- **Ghép Pháo + Pháo:** khác sao vẫn được (người dùng 08/11); kết quả = HỢP hướng ở ô đích (ụ thật). **Sao = trung bình 2 sao, làm tròn lên** (N 3★ + S 4★ = NS 4★; NS 2★ + W 5★ = NSW 4★) — KHÔNG +1★.
- **Không thêm hướng → không ghép** (N+N, NS+N, N+NS, NSWE+N…): `hopLeGhep` trả false → ô không sáng khi kéo. Ngoại lệ **NSWE + NSWE** → NSWE, stack = stack 2 bên + 1, **không trần**, 7★ + 7★ vẫn ghép (sao giữ 7).
- **08/11 lần 2 (người dùng: "2 ụ la bàn cùng hướng cũng merge được… chỉ là không merge được với nswe thôi")**: mọi cặp Pháo La Bàn đều ghép được — cùng hướng / tập con giữ nguyên hướng (N+N → N, NS+N → NS), hướng mới thì hợp (NSW+SE → NSWE, stack 0), sao = trung bình làm tròn lên; CHỈ cấm Pháo chưa đủ + Pháo NSWE (2 chiều kéo, ô không sáng). NSWE+NSWE vẫn +1 stack. `SKILLS.canon.hopNhat`, chữ mo()/trang chi tiết/text.js + vi.json, `tools/thap-kt-la-ban.js`.
- **Bắn:** mỗi hướng 1 tên lửa phóng ra đúng hướng la bàn từ mép bệ, 0,12 s sau rẽ dần đuổi quái xa nhất về phía hướng đó (chết → quái gần nhất; hết quái → nổ tại chỗ); tốc độ bay + tốc độ rẽ tăng theo thời gian, chỉ dùng dt + vị trí quái (`game.js danDuoi`) → tất định online. Nổ lan 26+5×sao px.
- **Sát thương:** mỗi quả × [1.0, 1.1, 1.0, 0.9] theo số hướng 1–4 → tổng 1.0 / 2.2 / 3.0 / 3.6 lần 1 phát (bù việc gộp không +1★: 4 Pháo 1★ → NSWE 1★ ≈ 3.6× ≈ ụ 3★ thường). **Mỗi stack +50%** ST (cấp thẻ Vàng LV9→17: 50% → 70%, `KY_NANG_CAP.canon` 'Per stack'; cùng nhóm cộng gộp ST). 8 Pháo 1★ = stack 1 ≈ 5.4×; stack s cần 4(s+1) Pháo.
- **Mốc sao:** 5★ TRUE NORTH +20% ST, mỗi stack tính ×1.5 · 7★ FOUR WINDS +30% ST, mỗi 8 s 1 loạt tên lửa cả 4 hướng (×0.7). **Đột phá** theo stack 1 / 3 / 7 / 15 (màu bậc trên icon stack + vòng dưới ụ như các ụ cộng dồn khác).
- **Jackpot TRUE NORTH:** 3 lần ghép Pháo La Bàn trong 45 s, lần thứ 3 ra NSWE (đủ 4 hướng hoặc thêm stack) → như cũ (+110% / +45% / +70, 12 s + phát xuyên ×600%).
- **Tương tác:** Merge King +★ giữ tổ hợp + stack · Copycat chép giữ tổ hợp + stack (bản sao ghép gộp hướng → ụ thật) · Mimic + Pháo → ụ ngẫu nhiên +1★ (luật thường) · Teleporter đổi chỗ giữ nguyên · đá chỉ ghép đá cùng sao (ra đá ngẫu nhiên) · Pháo băng không kéo / không nhận ghép.
- **Kỹ năng "xoay hướng 15 mana":** chỉ là đề xuất trong TOM-TAT (chưa từng code) → không làm, không còn hợp với luật gộp hướng.
- **Online:** cờ ô `h<mặt nạ>;n<stack>;` (oTT/datO), gói gọi `hu` = mặt nạ, gói ghép `hn = [mặt nạ, stack]` (`online/dongbo.js`).
- **Hiển thị:** tấm đáy ô = icon la bàn `canon_phu` + chữ tổ hợp (N / NS / NSWE) · NSWE có stack → "+n" màu bậc đột phá; lúc kéo: tấm ô đích hiện kết quả sẽ ra · **ảnh ChatGPT mới**: 15 bệ `canon_de_<mặt nạ>` (gai hướng đang có sáng xanh + mũi tên, gai không có tối; NSWE lõi vàng) + tên lửa vàng `fx_canon_ten` — 1 tờ 4×4 (`docs/demo-hop-tuong/thap-art/raw_laban_tohop.png`), cắt `tools/thap-cat-laban.py` (khung 211 = canon_de + 17 px, cùng tâm; render.js vẽ SD × 211/177) · thêm chevron `duong_mui` trên đầu súng (đầu xoay + tấm đếm che gai N/S) · dự phòng khi ảnh chưa tải: bệ `canon_de` + chấm sáng/tối PNG, tên lửa `fx_lien_dan` (`comoi.js` CM.veDe / CM.veMui, `fxu.js` FXU.THAY.ten_laban). Bản pixel: ghi `docs/pixel/DANH-SACH.md` mục Bổ sung.
- Chữ: `mo()`, trang chi tiết (Directions / Combine / Star / No new direction / Stack / Other merges), thẻ kỹ năng, roster, clip Test range ("N + S = NS: 2 homing rockets", "NS + WE = NSWE: 4 rockets"), bản Việt (`vi.json`, chữ tổ hợp giữ HOA — `UP_GIU`).
- Test: mới `tools/thap-kt-la-ban.js` (225 cặp hợp lệ, sao trung bình, ghép sai, stack không trần, số tên lửa 1–4, tên lửa trúng, tất định, ghép đặc biệt, AI, gói online khứ hồi, kéo chuột thật + ảnh 844×390 & 390×844). Sửa kỳ vọng: `thap-kt-cong-huong-luat` (Pháo + Pháo không còn ghép thường; TRUE NORTH mới), `thap-kt-matran` (cmSo → hb + stack), `thap-kt-kynangcap` (canon chạm max đúng LV17).
- Ảnh: `docs/demo-hop-tuong/tuvan/la-ban-to-hop/` (15 tổ hợp trong game, tên lửa bay, PROMPT.md).

## claude/demo-hop-tuong — Pháo La Bàn: mũi tên hướng không bị đầu súng che (08/11)
- Người dùng (08/11): "không được che mũi tên đỏ ở đầu… xoay đến hướng đó thì mũi tên đỏ đè vào". Chỉ đổi hình, luật không đổi.
- `CM.veMui` (comoi.js): mũi tên hướng (`duong_mui`) vẽ ở LỚP CỐ ĐỊNH sau đầu súng (không xoay) → mũi đỏ luôn nằm dưới. N / E / W ở vành ngoài 0,43 S (ngoài tầm mũi đầu súng ~0,41 S); S ngay trên tấm đáy ô (0,2 S) để tấm không che. Lót bóng tối + quầng xanh nhẹ; nạp sẵn `duong_mui` khi bộ bài có Pháo.
- Tấm đáy ô khi có tiến độ TRUE NORTH: bỏ chữ hướng (cờ `jpGon`, jackpot.js) → chỉ "★ 2/3" (NSWE có stack: "+n ★ 2/3") → không tràn ô hẹp.
- Ảnh soát: `docs/demo-hop-tuong/tuvan/la-ban-to-hop/mui-ten-khong-che.png` (15 tổ hợp × đầu N/E/S/W/45°, 390×844 + 844×390, 4 cỡ khác).

## claude/demo-hop-tuong — Mad Crown: vẽ lại dải tung chiêu cùng thiết kế dải đi (08/11)
- Lỗi: dải chiêu cũ `trum_mad_crown_atk_16.png` có mũ hề + chuông + cổ áo bèo, xúc xắc → lúc tung chiêu trùm như "thay đồ". Người dùng duyệt vẽ lại.
- Ảnh mới ChatGPT (gửi kèm dải đi làm mẫu thiết kế, dải chiêu cũ chỉ làm mẫu nhịp): lưới 4×2, nền magenta; slime hồng + ngọc vàng + vương miện y dải đi, KHÔNG tay chân, KHÔNG mắt. Nhịp: 1–2 lấy đà (dẹt, ngọc sáng) · 3–5 ngọc nạp/xung, vương miện lắc, vòng năng lượng hồng-vàng nổ giữa thân · 6–7 hồi · 8 = tư thế đứng.
- Nguồn `docs/demo-hop-tuong/thap-art/raw_trum2_mad_crown_chieu_v2.png` (tool tự ưu tiên `_v2`); cắt `python3 tools/thap-cat-trum2.py mad_crown --chi-atk`. Tool: bản `_v2` giữ chế độ tách nền thân hồng (không coi mảng hồng-tím trong thân thạch là túi nền) — trước đó thùy trái bị khoét thủng.
- Khớp thân dải đi ↔ chiêu: IoU 0,979 (cũ 0,806), lệch tâm 0,3 % ô (11 trùm kia 0–0,3 %).
- Ảnh trước/sau (đi → chiêu → hồi, chết giữa chiêu; 844×390 + 390×844): `docs/demo-hop-tuong/tuvan/trum-anim/mad_crown-v2.jpg`.
- Test: thap-kt-trum-don (solo 264 tình huống) xanh · thap-kt-vfx-p0 xanh · thap-kt-anim ĐỎ sẵn từ trước (roster 92/93, 30/60 FPS, đạn canon xa nòng — ụ, không liên quan trùm; dải chiêu cũ cũng đỏ y vậy).

## claude/demo-hop-tuong — sửa lỗi tester đợt Vàng/Đỏ (08/11)
- **Ember Relay:** icon lửa trên tấm đáy ô dùng thẳng `lua_t1–4` đã tô màu (≥10 trắng · ≥30 lam · ≥50 vàng · ≥70 đỏ), không phủ lọc màu bậc DOTPHA nữa (`demkn.js`, cờ `giuMau`); ụ khác giữ lọc như cũ.
- **Chữ:** Copycat "chép được ụ Băng, KHÔNG chép ụ Đá" (cả chữ ngắn roster `meta.js`/`roster.json`, bỏ "the copy is never stone") · Ember "số lửa (tối đa 70, thêm theo cấp thẻ)" · Choir "Hoà âm: ụ cùng sao kề bên (x/4)" · Blood Circuit / Trứng (`chuDongMoiSao`) bỏ "mở ở 3★" khỏi vòng xanh · Hydra 1★ "1 head: 1 shot" · Nemesis thêm "+0.3% máu tối đa mỗi đòn" (bản Việt thêm vào `vi.json` rồi dựng lại `ngonngu-vi.js` bằng `tools/thap-vi-dung.py`).
- **Clip Prism Thief:** bỏ cú kéo-ghép mặc định 7→8 (kieu 'tc') → đủ 4 Prism suốt clip, khớp chữ "Swipe all 4".
- **Khay trận màn ngang (844×390, 667×375):** kẹp hệ số chữ/ngọc nhãn giá ở 1.5 → không còn "10C" chồng nhau; giá chỉ huy lên ≤ 2 px. `tools/thap-kt-nhangia.js` thêm 2 cỡ ngang + kiểm 2 nhãn giá không chồng nhau.
- **Huy hiệu sao (người dùng: "Cho sao ở giữa đi trên ụ 1 tý", 7★ "Vàng viền đỏ đi"):** huy hiệu GIỮA ô theo chiều ngang, đáy hàng sao ở mép trên ô +0.28d (5★/6★ hai hàng +0.42d, sao nhỏ hơn 0.38d) → nằm ngay trên đầu ụ, trong khe giữa tấm đếm ô trên và thân ụ. 1–6★ cùng cỡ mỗi ngôi sao (3★ hết nhỏ). 7★ = 1 sao VÀNG to (`hh_sao1`) viền ĐỎ + quầng đỏ-cam + nhịp sáng 1.4 s. `REN.veHuyHieuTren` / `REN.saoTamY` (hud2.js), neo `bx/by` (nhandien.js); sao xem trước khi rê và con dấu sao lúc ghép (ghepfx.js) cũng về giữa ô. Ảnh hh_sao chưa tải → khiên số cũ ở góc như trước.
- **Hố Đen ở cổng quái:** tâm hố trượt dọc đường (≤ 1.25 r) tới chỗ gần nhất mà cả đĩa xoáy + mảnh vỡ (~1.3 r) nằm gọn trong khung → không bị cắt mép phải (`SKILLS.blackhole.choVua`).
- **Bỏ hẳn jackpot TRUE NORTH (Pháo La Bàn, người dùng 08/11):** bỏ luật / tiến độ "★ 2/3" trên tấm đếm / chữ thẻ (`jackpot.js`), tấm chỉ còn tổ hợp hướng hoặc "+n" stack (bỏ cờ `jpGon`, `comoi.js`). Bù: sát thương mỗi tên lửa +15% (`SKILLS.canon.MOI` 1.0/1.1/1.0/0.9 → 1.15/1.25/1.15/1.05) — ước tính: jackpot ≈ ×3 sát thương trong 12 s, kích được ~1 lần / 2–2.5 phút → ≈ 8% thời gian × +200% ≈ +15% trung bình. Mốc 5★ TRUE NORTH (+20% ST, stack ×1.5) giữ nguyên. Test: `thap-kt-cong-huong-luat` (3 ghép ra NSWE không còn jackpot), `thap-kt-la-ban`.
- **Test cũ theo luật mới:** kynangcap (bỏ thẻ THE_BO; ảnh bản sao 82%), matran (Copycat không chép đá; trứng đếm `egg`; Ember 5+2 = 7 cả hàng/cột), shop (Pháo La Bàn thẻ Vàng → cấp đầu LV9), nhãn hoiquy Copycat. `thap-kt-anim`: roster 92 ụ (bỏ Holy Halo), bỏ kiểm "đạn ở cửa nòng" cho tên lửa Pháo La Bàn (cố ý phóng từ mép bệ theo hướng mũi tên). Lệch 30/60 FPS của `thap-kt-anim` có sẵn từ trước (đỏ cả trên nhánh chính chưa có sửa này: FX chống rối đọc trạng thái hình → luồng Math.random luật lệch) — chưa sửa.

## claude/demo-hop-tuong — tất định 30/60 FPS: lỗi nằm ở test, không ở luật (08/11)

- **Triệu chứng:** `tools/thap-kt-anim.js` báo 30 FPS và 60 FPS lệch (268/300 mẫu, sự kiện bắn khác) từ khi có Pháo La Bàn tổ hợp hướng (9272d041).
- **Điểm lệch đầu tiên:** bước 1 — `T.hb` (hướng Pháo La Bàn) khác nhau giữa 2 lần chạy. Hướng bốc bằng `rngHat(G.hat + bàn + ô + B._cmN)` (đúng thiết kế, tất định), nhưng test chạy 2 TRANG riêng: mỗi trang có `G.hat` ngẫu nhiên (`1 + rint(1e9)`) và bộ đếm `B._cmN` khác nhau sau `fill=1` → 2 lần chạy là 2 hạt giống khác nhau, không phải do FPS.
- **Sửa (chỉ test):** đầu mỗi lần chạy ép `G.hat = 424242`, `G.uid = 1e6`, đưa các bộ đếm RNG của bàn (`B._cmN/_anN/_pmN/_evN/_anR`…) về 0. Kết quả: 0/300 mẫu lệch, 186 = 186 phát bắn trùng bước — ANIM: XANH. Không đổi code game.
- **Đã soát:** vẽ (REN.ve / FX.capNhat) không ghi trường luật nào của đạn/quái/ụ (chỉ trường `_…` của hình); `FX.hat1` có rút Math.random với số lần phụ thuộc trần hạt theo nhịp vẽ — vô hại vì luật bản thật không dùng Math.random có hạt giống, nhưng nếu sau này lockstep bằng Math.random có hạt thì phải cho FX RNG riêng. Lưu ý: luật vẫn dùng Math.random ở nhiều chỗ (vd chí mạng trong `trung`).

## claude/demo-hop-tuong — ụ cờ bạc mới + bỏ jackpot các ụ khác (08/11)
- **Ụ mới LUCKY SLOT / Máy Xèng (`cobac`, ĐỎ, Tấn công, họ JOKER)** — `thap/js/jackpot.js` (viết lại: chỉ còn ụ này, đối tượng `CB`). Bắn xu vàng 1 phát/s vào quái đầu, ST gốc 50 (×2,7 Đỏ), +15% chí mạng gốc, không kỹ năng chủ động.
  - Mỗi lần **xuất hiện** (triệu hồi / ghép / bản sao / AI) và mỗi lần **sao tăng** (Genesis, Merge King, quà sao…) → quay máy xèng 1,0 s (đang quay không bắn) ra **CAM** (+3% ST/điểm) · **DƯA HẤU** (+2% tốc/điểm, giảm dần, trần +150%) · **NHO** (+10% ST chí mạng/điểm) → cộng **số sao hiện tại** vào ngăn quả đó. Mất sao rồi lên lại đúng sao cũ không quay lại.
  - **JACKPOT 10%**: cả 3 quả nổ toé → mỗi ngăn **+2 × sao** (kỳ vọng mỗi lượt = 1,5 × sao).
  - Ngăn quả là **của bàn** (`B.cb`), dùng chung cho mọi Lucky Slot đã quay xong, không mất khi ụ bị ghép đi; không trần (trừ tốc); tỉ lệ chí mạng không đổi. Cộng vào chung nhóm buff (`T.buf`). Cấp thẻ: "Fruit power" 100% (LV11) → 130% (LV17), +5%/cấp (nhân mọi số/điểm) + như ụ Tấn công Đỏ khác (+5% ST, +2% tốc mỗi cấp).
  - Ghép theo luật thường (cùng loại cùng sao → ụ ngẫu nhiên +1★). Lucky Slot ra từ ghép quay lại.
  - Tất định: kết quả lượt n = `rngHat(hạt trận·7331 + bàn·977 + n·104729)`. Online: máy chủ bàn gửi gói `cb {o, f, s, st, n}`; bàn con rối không tự quay, phát lại cuộn xèng + nhận ngăn; ảnh chụp mang `cb`/`cbN` + cờ ô `z<sao đã quay>` (chỉ tăng).
  - Hình: khung cửa sổ máy xèng trên ô, quả cuộn chậm dần rồi dừng; jackpot = huy hiệu nổ + dải `fx_cb_no` 8 khung + 3 quả bay toé + âm `jackpot`; quay = âm `quay` (dùng lại). Khay trận: 3 icon quả + số dưới chân dung thẻ (nháy khi tăng, số đổi màu ở mốc 10/25/50/100). Bảng chỉ số tách dòng "Orange ×n / Watermelon ×n / Grape ×n".
  - Cân bằng (sim 60 s, 4★ wave 12, cấp thẻ +3): không ngăn ≈ 40k/phút · 10/10/10 ≈ 60k · 20/20/20 ≈ 95k · 40/40/40 ≈ 165k (Hive Queen ≈ 88k, Leviathan ≈ 170k cùng kịch bản); wave 12 thường 10–15/ngăn và 2–3 Lucky Slot.
  - Ảnh ChatGPT: `docs/demo-hop-tuong/thap-art/raw_mod_cobac.png` (đầu/bệ/xu → `tools/thap-cat-umod.py cobac`), `raw_cb_icon.png` + `raw_cb_no.png` (→ `tools/thap-cat-co-bac.py`), chân dung tộc NYX "nữ chia bài sòng bạc vũ trụ" `docs/demo-hop-tuong/tuvan/chan-dung-moi/raw/cd_cobac.png` (→ `tools/thap-cat-chandung.py cobac`). Pixel: chưa vẽ, ghi ở `docs/pixel/DANH-SACH.md` mục Bổ sung (thiếu ảnh → code vẽ dự phòng).
  - Tích hợp: roster (+ docs), ROSTER_EMBED, ART_META/artscale, chân dung (PILOTS, PO_NEO/HERO_NEO/FACE_BOX), KY_NANG_CAP, GROW 3 dạng (SLOT / HIGH ROLLER / GRAND CASINO), họ JOKER, clip hướng dẫn (skilldemo: quay CAM rồi Lucky Slot thứ 2 JACKPOT), tiếng Việt (vi.json → ngonngu-vi.js), bể Đỏ (gacha / cửa hàng / bộ máy tự có theo roster).
- **Bỏ mọi jackpot cũ** (người dùng: jackpot chỉ là cơ chế của ụ cờ bạc): khung `JP`, `T.jp`, chữ thẻ, tiến độ "★ n/N" trên tấm đếm, nhãn bảng chỉ số, test. Bù (ước kỳ vọng như TRUE NORTH: tỉ lệ thời gian × thưởng):
  - Orbital (ORBITAL CASCADE, jackpot đầu ~W17): bom +12% (`bomDmg` ×1,12).
  - Chain Link (CHAIN REACTOR, ~W16, hồi 40 s): ST gốc 18 → 19,8 (+10%).
  - Pandora (ROYAL VAULT mỗi 6 lần mở): mưa mana 25 → 30 ×★, bom hộp +20%; túi xáo SIX SEALS giữ (chuyển sang `skills3.js pandoraTui`), gói online không còn dấu 6.
  - Dice Gun (LOADED DICE, ~W9.5, 6 phát 300%): ST gốc 16 → 18,4 (+15%).
  - Radar (PERFECT FREQUENCY, khó, hồi 50 s): tốc buff +8% (`KY_NANG_CAP.radar` 18/0,6/25,2 → 19,5/0,65/27,3; chữ thẻ +19,5% 1★ / +45% 7★).
  - Masterwork / Chromatic Heist / Blood Eclipse / Grand Chorus đã chết từ trước (ụ làm lại) → chỉ dọn phần còn sót, không bù. True North đã bù trước đó (+15% tên lửa).
  - Đổi tên để chữ "jackpot" chỉ thuộc Lucky Slot: mốc 5★ Pháo La Bàn TRUE NORTH → **POLE STAR** (giữ +20% ST, stack ×1,5); mốc 7★ Hộp Bí Ẩn JACKPOT → **TOP PRIZE**; họ JOKER của Pandora "merge opens 1 of 6 vault effects". (JACKPOT ở vòng quay kinh tế ngoài trận giữ nguyên.)
- Test: `tools/thap-kt-co-bac.js` mới (quay khi xuất hiện/lên sao, không bắn lúc quay, số mỗi điểm, tốc giảm dần, chung bàn, tất định, JACKPOT 9,97%/20 000 lượt, ghép, PVP/AI, gói online khứ hồi, khay thẻ 3 số, ảnh 390×844 + 844×390). Sửa: `thap-kt-cong-huong-luat` nhóm 10 (jackpot cũ không còn kích, Six Seals không còn dấu 6, cộng gộp dùng ngăn quả), `thap-kt-vang-g2`, `thap-kt-la-ban` (POLE STAR). Bỏ `tools/thap-sim-jackpot.js`.

## claude/demo-hop-tuong — Lucky Slot: chỉ quay 1 lần + không nâng cấp trong trận (08/11)
- Lucky Slot (`cobac`) chỉ quay xèng **1 lần khi xuất hiện** (triệu hồi / ghép / bản sao / trùm biến); tăng sao tại chỗ (Merge King, Genesis Core, nâng sao…) KHÔNG thay ụ → không quay lại, không chạy móc ghép (online: bàn con rối chỉ nhận đúng 1 gói `cb`/ụ); **không nâng cấp bằng mana trong trận** (`khongNang` như Hydra: ẩn giá, bấm thẻ không nâng, AI bỏ qua, cấp lỡ có → về 1, online bỏ gói `nc`/cấp ảnh chụp) — dải số quả trên khay chiếm chỗ ô giá, chữ to hơn (màn ngang ép ngang); chữ thẻ/roster/vi cập nhật; test `tools/thap-kt-co-bac.js` mục 2/7/8.

## claude/demo-hop-tuong — dải xem ụ trong trận: khối chỉ số DMG · SPD /s · CRIT · CRIT DMG (08/11)
- **Người dùng:** "Chi tiết ụ trong trận không rõ cả tốc đánh nhỉ" — dải chạm ụ chỉ có 2 số nhỏ DMG / RATE ở góc.
- **Mới:** chạm ụ trong trận → dải có hàng 4 ô (icon PNG `ic_dmg / ic_toc / ic_crit / ic_cdmg`): **DMG** (1 phát) · **SPD /s** (phát mỗi giây) · **CRIT** (tỉ lệ) · **CRIT DMG** (hệ số, 200% gốc). Đang được buff (ụ hỗ trợ kề, ngăn quả Lucky Slot, Overclock, stack Pháo La Bàn, cấp thẻ, mốc sao…) → số **xanh** + số gốc gạch nhỏ bên dưới; bất lợi (đóng băng → SPD 0, kẹp) → đỏ. Ụ hỗ trợ / không bắn: "Does not shoot" + hiệu lực đang cho. Dòng kỹ năng và dòng dạng/bộ đếm giữ dưới hàng số.
- **Số thật:** `chiSoTT(T)` (`thap/js/statthuc.js`) dùng chính `statThuc` → `dmgU / tocU / critU`; riêng Pháo La Bàn (`k` tên lửa mỗi lượt: DMG `k×` `SKILLS.canon.dmgMoi` — tách từ `banMot`, cùng công thức; SPD = tocU × k) và Sói Máy (nhịp riêng `nhipU`; thức tỉnh `3×` 50% DMG, loạt mỗi 1,2 s, CRIT 100%). Gốc = ụ ở sao hiện tại, cấp thẻ 1, không buff. Chỉ hiển thị — không đổi luật / online / tất định.
- **Bố cục:** dải SOLO neo đáy ngay trên khay (`hudb.js` + `tvb.js` HB.dat), cao tự do, mọc lên vùng trống dưới làn đường dưới — không che ô / làn. CSS ở `thap/css/statthuc.css` (lớp `#tt.hb-cs`).
- **Tiếng Việt:** `SPD` → TỐC, `CRIT DMG` → ST CHÍ MẠNG (`vi.json` → `tools/thap-vi-dung.py`).
- **Test:** `tools/thap-kt-tt-chiso.js` mới (SPD = tocU, DMG = dmgU, Radar/Overclock/ngăn quả/stack La Bàn làm số tăng + xanh, Sói thức tỉnh, đóng băng, "Does not shoot", vừa khung + không lấn làn ở 390×844 / 844×390 / 667×375 + tiếng Việt). khong-ban, vfx-p0, vi, co-bac, la-ban xanh.

## claude/demo-hop-tuong — luật "tăng sao tại chỗ / kỹ năng kéo thả KHÔNG phải ghép" (08/11)
- **Luật (người dùng 08/11):** "Những hiệu ứng tăng sao từ ally hoặc từ ụ khác không làm reset các ụ nên không được tính là merge" · "Kể cả copy cũng vậy, khi A copy B để thành B thì phải B vào B mới tính là merge".
  - **+★ / −★ TẠI CHỖ** (Merge King +1★ / vàng +2★, Merge King + Merge King, Genesis Core, Star Lift, chỉ huy REINFORCE, Pandora VAULT/ALLY STAR, Hex Bell, Star Leech trả sao, trùm −★, Star Leech hút sao, ảnh chụp bàn / gói ghép online): CÙNG thân ụ, giữ mọi cộng dồn / bộ đếm / dạng / buff có hạn (Archive, lửa Ember, Twin Anvil, trứng Evolver, Nemesis, Sói thức tỉnh, hướng + stack Pháo La Bàn, ABYSS, Blood, Overclock, Aurora, khiên, bản sao…). Ngoại lệ đã duyệt giữ nguyên: Evolver MẤT sao → trứng đếm lại; Genesis bị hạ sao → lượt = min(lượt, sao); dấu Blood Circuit ±3 s theo sao; Star Breaker "5★ đầu mỗi wave" (mốc sao, không phải ghép).
  - **GHÉP THẬT** = ghép thường (cùng loại / Mimic / đá + đá / ép ghép của trùm / gói online) hoặc ghép đặc biệt khai `laGhep`: **Pháo La Bàn + Pháo La Bàn** (mới khai — B vào B), Twin Anvil + Twin Anvil. **Không phải ghép:** Merge King (+★, kể cả MK + MK), Copycat chép (bản sao giữ dạng + buff, không bao giờ là đá, không chép ô đá — giữ như cũ), Teleporter, Overclock, buff Twin Anvil, Mạch Máu đánh dấu.
  - Một hàm chung `laGhepThat(a, b, ep)` (game.js, gọi trước `ghep`) cho mọi thứ "khi ghép": Archive (vangmoi1), MERGE SURGE Star Breaker (hotro — trước đây Merge King có kích), Mirror Gate chép kỹ năng khi ghép (skills4 — trước đây MK/Copycat/Teleporter lên ụ có kỹ năng ghép cũng chép), bước GHÉP hướng dẫn (huongdan), đếm ghép / 5★ / 7★ nhiệm vụ (kinhte), chớp ghép HUD2, tấm kết quả ghép + đếm mẹo (keoghep). Kỹ năng khi ghép (`sk.ghep`), Twin Maker, Mimic Aurora, combo vốn chỉ chạy ở ghép thường — giữ.
  - Mẹo khi rê: Merge King → "Same turret, +n★" ("Giữ nguyên ụ, +n★"); Copycat / Teleporter / Overclock / buff Anvil / Mạch Máu → "Skill, not a merge" ("Kỹ năng, không phải ghép"); chỉ ghép đặc biệt thật còn "Special merge". Trang ụ: mục "Special merge" → "Drag skill" ("Kỹ năng kéo thả") với kỹ năng không phải ghép.
  - Online: Pandora VAULT/ALLY STAR chọn ô bằng RNG hạt giống trận (hạt × bàn × số lần ghép thật `B.ghepN`) thay `Math.random` → 2 máy chọn cùng ô; ảnh chụp bàn / gói ghép Merge King sửa sao tại chỗ (giữ thân ụ — đã đúng, nay có test).
  - Lucky Slot (session khác): quay CHỈ khi xuất hiện; test mới báo CHỜ nếu `jackpot.js` vẫn quay khi sao tăng.
- Test: mới `tools/thap-kt-sao-tai-cho.js` (10 nguồn tại chỗ × 13 ụ có trạng thái; 6 kỹ năng kéo thả × solo/co-op/PVP + đối chứng ghép thật; Mirror Gate; Pandora tất định; trang thật: hướng dẫn / nhiệm vụ / chớp / tấm kết quả). Đạt: cong-huong-luat, vang-g2, la-ban, khong-ban, vfx-p0, do-nhomb, vi; copycat-da đạt luật, chỉ lỗi 404 `assets/glyph/cobac.png` có sẵn từ đợt Lucky Slot.

## claude/demo-hop-tuong — Lucky Slot: máy xèng 3 ô thật (08/11)
- **Luật mới** (`thap/js/jackpot.js` CB, người dùng 08/11): khi xuất hiện (vẫn chỉ 1 lần, vẫn không nâng cấp mana) 3 cuộn quay 1,2 s rồi **dừng lần lượt trái → phải** (cách 0,35 s), mỗi ô cam / dưa hấu / nho. **Cặp** (đúng 2 ô giống) = **+1 điểm** quả đó · **3 giống = JACKPOT: mỗi ngăn +2** · **3 khác nhau = tự quay lại** (0,45 s nghỉ + 0,7 s cuộn) tới khi có cặp/jackpot; đang quay (mọi lượt) ụ không bắn. Điểm KHÔNG còn nhân sao; súng tăng sao như mọi ụ (×(1 + 0,85·(sao−1)) trong `dmgU`).
- Cuộn đều (1/3 mỗi ô): 3 giống 1/9, cặp 2/3, khác hết 2/9 → mỗi lần quay xong **JACKPOT ≈ 14,3 %** (1/7), cặp 85,7 %, trung bình 1,29 lượt; đo 20 000 lần: 14,03 % / 22,07 % lượt đầu khác hết / 1,284 lượt. Jackpot +2 mỗi ngăn (= 6 điểm, gấp 6 lần cặp) — mỗi lần quay kỳ vọng 12/7 ≈ 1,71 điểm, jackpot chiếm một nửa → cảm giác "trúng lớn" rõ.
- **Số mỗi điểm** ×1,5 cũ: cam **+4,5 % ST** (cũ 3 %) · dưa **+3 % tốc** (cũ 2 %, giữ giảm dần + trần +150 %) · nho **+15 % ST chí mạng** (cũ 10 %). Lý do (`tools/thap-sim-co-bac.js diem` — bot tự chơi cùng trận, so "điểm kiểu cũ" kỳ vọng 0,5 × sao/ngăn): điểm cũ / điểm mới ≈ 1,2–1,6 (trung bình ~1,4) → ×1,5 giữ ngang, bù thêm thời gian đứng quay. `dps` (4★ W12 cấp thẻ +3, 400 s): cũ 10/10/10 ≈ 102k ↔ mới ~7/7/7 ≈ 110k; cũ 20/20/20 ≈ 172k ↔ mới ~14 ≈ 178k (Hive Queen ≈ 75k).
- **Trần** (người dùng chốt: theo đề xuất): cam / nho KHÔNG trần; dưa giữ giảm dần + trần +150 % (đã đủ: tốc là chỉ số nguy hiểm nhất khi cộng gộp). Điểm thực tế (sim): bộ thường 1 Lucky Slot — W20 ≈ 10/ngăn (lớn nhất 26), W40–70 ≈ 15–17 (lớn nhất 35); bộ toàn Lucky Slot (cực đoan) — W20 ≈ 60, W40 ≈ 132, W60 ≈ 195, W70 ≈ 201 (lớn nhất 229); PVP vô tận ước +3,3/ngăn/wave → W100 ~330: 3 chữ số là mức thực tế, 4 chữ số gần như không tới.
- **Khay thẻ**: số tự co theo bề rộng thật của ô (`CB.vuaO`: bóp ngang, dọc ≥ 80 %), 1–3 chữ số không đè nhau ở 390×844 / 844×390 / 667×375 (xem tận mắt 7/45/153 và 999/88/1); ≥ 1000 rút gọn "1.2k" (chỉ trên khay; bảng chỉ số + chữ kỹ năng giữ số đúng). Nháy số chỉ chớp sáng (không phóng to → không đè ô bên).
- **Tất định**: ô j lượt k lần quay n = `rngHat(hạt·7331 + bàn·977 + n·104729 + k·7919 + j·131 + 17)`; tối đa 12 lượt (lượt 12 ép ô 3 = ô 1). Online: gói `cb { o, q: [[a,b,c]…] mọi ô mọi lượt, f, s, st, n }` → bàn con rối phát lại đúng chuỗi + cùng thời gian không bắn; gói cũ chỉ `f` vẫn hiểu. Hình/âm không đổi luật.
- **Hình** (ChatGPT, `docs/demo-hop-tuong/thap-art/raw_cb_xeng3.png` → `tools/thap-cat-xeng3.py`): `cb_khung3` (khung 3 ô kính, rộng 1,5 ô, đặt trên đầu ụ), `cb_cam_m/cb_dua_m/cb_nho_m` (quả nhoè dọc — cuộn đang quay, sinh từ icon cũ), `cb_dung` (ngoặc vàng "cạch" khi ô dừng + quả nảy), `cb_cap` (vòng sáng xanh lá 2 ô trùng + "+1"), `cb_lai` (khác hết: ô tối đỏ + mũi tên quay lại xoay), `cb_jp` (bùng nổ JACKPOT) + dải `fx_cb_no` + 3 quả toé + chữ "JACKPOT!". Thiếu PNG → vẽ dự phòng. Pixel: chưa vẽ, ghi `docs/pixel/DANH-SACH.md` mục Bổ sung. (`cb_khung` / `cb_no_ic` cũ không còn dùng trong trận.)
- **Âm** (`sound.js`): `cbCuon` tích-tích suốt lượt cuộn, `cbDung(j)` "cạch" mỗi ô (cao dần trái → phải), `cbCap` chuông cặp, `cbHut` "hụt" khi khác hết, `jackpot` (mẫu jackpot.mp3).
- Chữ: `mo()`, text.js, roster.json + mục cobac trong ROSTER_EMBED (meta.js), clip hướng dẫn (khác hết → quay lại → cặp dưa; Lucky Slot thứ 2 → 3 nho JACKPOT), GROW / NHIP / họ JOKER; vi.json → ngonngu-vi.js.
- Test: `tools/thap-kt-co-bac.js` viết lại (tất định cùng hạt, cặp +1, 3 giống +2 mỗi ngăn, khác hết quay lại, tỉ lệ 20 000 lần, số mỗi điểm/không trần cam-nho, online phát lại cả chuỗi, khay 3 số 3 cỡ màn + Playwright khung hình); `thap-kt-tt-chiso` (Nho 10 → 350 %). Tờ liên hoàn: `docs/demo-hop-tuong/tuvan/co-bac/xeng-3-o.jpg`. Mô phỏng: `tools/thap-sim-co-bac.js diem|dps`.

## claude/demo-hop-tuong — bậc chỉ huy Trắng / Xanh / Tím / Vàng (08/11)
- Người dùng: "chỉ huy cũng cần phân cấp trắng xanh tím vàng". Bậc **chỉ hiển thị** (`MAVUONG.<id>.bac`, `mvBac`, `mvDS` trong `thap/js/data.js`); không đổi giá, hồi chiêu, tác dụng, online.
  - REINFORCE (mặc định) = **Xanh** · RAGE = **Tím** · HOLY SHIELD = **Vàng** · Trắng để dành. Lý do: `docs/demo-hop-tuong/tuvan/chi-huy-bac/BANG.md`.
- Ô chỉ huy dùng viền `o_vien_<bậc>` như ụ (trước đây luôn viền vàng) + giữ vương miện: thẻ khay trận (mọi chế độ), băng chỉ huy màn bộ bài, bảng chọn chỉ huy, hàng ô nhỏ (bộ mẫu, sảnh ONLINE, kết quả), dải đối thủ/đồng đội (trước đây rơi về viền trắng). Khung lớn dự phòng = `the_khung_<bậc>`.
- Nhãn bậc (COMMON/RARE/EPIC/LEGENDARY, đã có bản Việt) ở bảng chọn, băng chỉ huy, trang chỉ huy (màu trang = màu bậc), dải `#tt`. Bảng chọn + trang chỉ huy xếp theo bậc.
- Chỉ huy miễn phí (không gacha/cửa hàng) → không có tỉ lệ/giá theo bậc; bản lưu cũ giữ nguyên chỉ huy đã chọn. Không ảnh mới.
- Test: mới `tools/thap-kt-chi-huy-bac.js` (bậc hợp lệ, luật không đổi, bản lưu cũ/id lạ, viền đúng màu ở mọi chỗ × 390×844 / 844×390 / 667×375, tiếng Việt).

## claude/demo-hop-tuong — chân dung đa dạng: hết "na ná nhau" (08/11)
- Người dùng: "Nhiều hình đại diện trông na ná nhau". Rà 94 ô ở 64 px + 128 px và đo histogram HSV / L2 ảnh thu nhỏ trên vùng mặt → 9 nhóm trùng (Nyx tím tóc bạc nền tím ×10, Voltari tím ×4, cô gái thủy tộc tóc ngọc ×6, Cryon da nhạt ×8, tóc vàng nền vàng ×~17, trai tóc tím, 3 sói + 3 sư tử, plasma xanh ×3…). Chi tiết: `docs/demo-hop-tuong/tuvan/chan-dung-moi/TRUNG-NHAU.md`.
- Vẽ lại bằng ChatGPT 36 ảnh (giữ phong cách đã chốt, thêm câu "Distinctive look … DOMINANT COLOURS …", đổi tộc/tuổi/dáng/tóc-mũ/màu chủ đạo): 28 ụ trùng nhóm + 5 ảnh yếu (hasao, tuthan mặt tối; baotuyet mặt nhạt; ngaithoigian mặt đồng hồ có số → chỉ vạch; vughep vương miện bay → đội chặt) + 3 ụ còn ảnh cũ (kiembang báo tuyết, chimang bướm đêm, dichchuyen cô đưa thư áo cam). Prompt: `prompts-da-dang.json`; bảng tộc mới (⟳) trong `STYLE.md`.
- Cắt + nối bằng `tools/thap-cat-chandung.py` (mốc mặt mới trong `tools/thap-cat-chandung.json`) → pilot/pn/hero + PO_NEO/HERO_NEO/FACE_BOX cho 36 ụ.
- Đo lại: cặp histogram ≥ 0,70: 15 → 3; cặp L2 < 45: 22 → 3 (còn lại: maychem↔tia, cuuvi↔haoquang — Holy Halo đã bỏ khỏi game).
- Ảnh: `TRUOC-SAU-da-dang.jpg` (trước/sau 36 ụ), `TONG-94.jpg` (bảng tổng mới). Đã xem: kho, bộ bài, trang ụ, sảnh, khay trận ở 390×844 và 844×390.
- Test: thap-kt-khong-ban đạt (25 ụ); thap-kt-vuot-deck 24/24; thap-kt-chandung: không lỗi cắt mặt ở 36 ụ mới — còn lỗi có sẵn "chip up-q đè mặt" ở thẻ kho (mọi ụ) và cobac (chip cuộn cb-q ở khay/đồng đội, ô bộ bài "không có mốc") thuộc việc Lucky Slot.

## claude/demo-hop-tuong — đầu ụ luôn đè vòng · máy xèng Lucky Slot gọn 1 ô · tăng sức Lucky Slot (08/11)
- Người dùng: "vòng green quay không được phép che ụ, ụ cần ưu tiên đè hình ảnh". Vòng xanh = vòng nạp chiêu `PX.vongHoi` (#3be36b; Mạch Máu, Genesis Core… luôn có) trước vẽ SAU đầu súng. `thap/js/render.js veU`: vòng nạp + `skT.veThem` (vòng/hào quang/vật bay quanh ụ, vòng nạp ụ có dạng qua `veGauge`) giờ vẽ TRƯỚC đầu súng, trên bệ. Ngoại lệ `SKILLS.x.veThemTren = true` vẽ sau đầu như cũ (Pháo La Bàn: mũi tên cố định — `comoi.js`). Huy hiệu sao, số đếm, icon chạm vẫn ở lớp huy hiệu trên cùng; bùng nổ ngắn (ghép, jackpot, FX) vẫn đè hết. Hào quang buff (`VX.duoiDau`) và ô Hero Foundry (`duoi`) vốn đã ở dưới.
- Người dùng: "ụ lucky đầu roll-let to hơn khung 1 ô". Khung máy xèng lúc quay (`HU.cbQuay`, `cb_khung3`) trước rộng 1,5 ô, lấn ô kề → rộng `CB.K3.k = 0.98` ô, giữa ô. 3 cuộn vẫn đọc được (cam / dưa / nho khác màu rõ). Chữ "+1" bay lên xuất phát trên huy hiệu sao (trước bị sao che). Không cần vẽ lại ảnh.
- Người dùng: "Lucky Slot yếu", tăng khoảng +20–30%: ST gốc 50 → 58; mỗi điểm cam 4,5 → 5% ST, dưa 3 → 3,5% tốc (vẫn giảm dần, trần +150%), nho 15 → 17% ST chí mạng. `node tools/thap-sim-co-bac.js dps 600` (4★ W12, thẻ +3): 0/0/0 53k → 62k · 7/7/7 102k → ~125k (+23%) · 14/14/14 179k → ~231k (+29%) · Hive Queen ~73–75k. (Sim thêm hàng 7/7/7 và 14/14/14.)
- Test: thap-kt-co-bac (ép số mới), thap-kt-tt-chiso (Nho 10 → CRIT DMG 370%), thap-kt-vfx-p0, thap-kt-khong-ban, thap-kt-la-ban: đạt. Ảnh đã xem: vòng trước/sau 390×844 + 844×390 (Mạch Máu đầy, Genesis, Vệ Tinh thức tỉnh, La Bàn, ô anh hùng); máy xèng quay/dừng/cặp/jackpot 390×844 + 844×390; khay 667×375.

## claude/demo-hop-tuong — Prism Thief làm lại lần 2: TƯỚNG HỢP THỂ (mặt nạ 4 màu, 08/11)
- Người dùng: "giữ ụ xong di thì nó thấy hình mặt nạ nằm dọc… vuốt nó không biến thành mặt nạ 4 màu à?" · "tướng có thể tăng sức mạnh sau khi hợp thể, càng hợp thể nhiều càng mạnh". Thiết kế đủ: `docs/demo-hop-tuong/tuvan/prism/THIET-KE.md`.
- Vuốt 1 đường qua 4 Prism liền nhau, Prism đơn khác màu → HỢP THỂ thành 1 **Spectrum Prism** (mặt nạ 4 màu) ở ô cuối, 3 ô trống; là ghép thật (bộ đếm ghép +1). Bỏ CHROMATIC CIRCUIT + hồi 25 s.
- Số hợp thể n (ô hiện "×n") = tổng n nguyên liệu + 1, không trần; cộng dồn 4 màu cộng hết; sao = cao nhất. Mặt nạ: đủ 4 hiệu ứng, tỉ lệ × (1 + 0.25n), +300% ST và +10% tốc mỗi n, trần cộng dồn mỗi màu = trần đơn × (1 + n), vàng +2 + ⌊n/2⌋ mana (trần/giây 6 + 2n).
- Hợp thể lại: mặt nạ là ô đại diện trên đường vuốt (+3 Prism khác màu) · kéo mặt nạ lên mặt nạ (n = a + b + 1). Mặt nạ không ghép thường (Prism đơn, Mimic). Merge King giữ n. Copycat chép → Prism đơn màu ngẫu nhiên mới.
- Mặt nạ luôn NGANG (cả bản cầm kéo, không nghiêng); vệt vuốt màu + mẹo "Release: FUSE into 1 mask"; hiệu ứng `HU.pmHop` (mặt nạ bay về + dải `fx_bienmau_hop`) + "FUSION n"; bảng chỉ số hiện dòng SPECTRUM PRISM sống. Ảnh ChatGPT mới: `bienmau_hop_1..4` (4 bậc sáng n 1/3/5/10+), `fx_bienmau_hop` (8 khung).
- Online: gói `pm` mang đường vuốt + cờ ô kết quả (`F` n, `K` cộng dồn 4 màu). AI tự hợp thể / gộp 2 mặt nạ. Chữ: text.js, roster.json, ROSTER_EMBED, trang ụ, clip hướng dẫn (4 màu → vuốt → mặt nạ → hợp thể 2); tiếng Việt qua vi.json.
- Test: `tools/thap-kt-prism.js` (luật, tất định, online khứ hồi, AI, vuốt Playwright 390×844 + 844×390) đạt; sửa phần Prism trong thap-kt-vang-g2 / -pw / vang-moi2. Giữ xanh: khong-ban, vfx-p0, vi, cong-huong-luat, sao-tai-cho, tt-chiso, co-bac, la-ban. Ảnh đã xem: `docs/demo-hop-tuong/tuvan/prism/TONG.jpg`.
## claude/demo-hop-tuong — ngẫu nhiên khi xuất hiện: copy / sinh ra đều quay MỚI (08/11)
- Người dùng: "khi copy hoặc được sinh ra thì cũng sẽ random với các ụ có quy tắc random". Ụ có dạng quay lúc sinh: Pháo La Bàn (1 hướng), Prism Thief (màu), Merge King (vàng), Sói Máy (thức tỉnh), Twin Anvil (dạng ST/tốc), Lucky Slot (quay máy xèng).
- Rà mọi đường xuất hiện (triệu hồi, ghép thường, Copycat, Twin Maker, Cloner, REINFORCE, Hộp Bí Ẩn/Evolver/Scrambler, Mad Crown/Genesis, AI): chỉ **Copycat** giữ cố định (giuBienThe chép vàng / thức tỉnh / NSWE + stack) → bỏ. Bản sao là lần xuất hiện mới: quay lại vàng/thức tỉnh, La Bàn 1 hướng ngẫu nhiên + 0 stack, Prism màu mới + 0 cộng dồn, Anvil dạng mới, Lucky Slot quay. Buff không ngẫu nhiên trên thân Copycat (Aurora, Overclock) giữ như cũ. Chỉ ghép thật La Bàn + La Bàn mới gộp hướng.
- Merge King vàng / Sói thức tỉnh bỏ Math.random → `rngSinh` (rngHat: hạt trận + bàn + ô + số lần quay của bàn; sinhR của trùm/Genesis vẫn ép RNG riêng).
- Online: gói 'tr', 'gh' (kết quả ghép thường) và Twin ('tw') mang đủ cờ ô `fl` (oTT) → bàn con rối ra đúng màu Prism / dạng Anvil ngay (trước đây gói triệu hồi không có màu Prism → con rối hiện màu đỏ tới ảnh chụp kế).
- Prism Thief: mặt nạ luôn thẳng — khi cầm kéo (ghost) vẽ đúng mặt nạ màu, không xoay; đầu dự phòng bienmau_nong xoay −90° cho thẳng. Các đầu "mặt" khác đã đứng yên (gocDau) hoặc là vũ khí/sinh vật cố ý xoay. Không đổi luật Chromatic Circuit.
- Chữ Copycat: "random traits (colour, direction, Gold, Awakened, slot spin…) roll anew · keeps the Copycat's own buffs" (+ bản Việt trong vi.json).
- Test: mới `tools/thap-kt-ngau-nhien-sinh.js` (6 ụ × 9 đường, phân bố + tất định + online khứ hồi). Đổi kỳ vọng có chủ đích: thap-kt-la-ban (Copycat chép NSWE → 1 hướng, 0 stack), thap-kt-cong-huong-luat (Copycat không còn giữ vàng/thức tỉnh), thap-kt-matran (copyLen của vàng/thức tỉnh/La Bàn = QUAY MỚI).

## claude/demo-hop-tuong — Salvo Battery bắn loạt tên lửa (hết laze) + hiệu ứng hàng / cột / cả bàn (08/11)

- Người dùng: "Salvo battery sao vẫn bắn laze vậy?" + "thêm hiệu ứng hàng cột khi đủ hàng đủ cột, khi đủ cả bàn thì toàn bộ các ụ sáng hơn 1 chút".
- **Luật giữ nguyên** (`HU.rail`, `thap/js/skills.js`): vẫn 1 đường xuyên tại t = 0,38 s, cùng quái trúng, cùng ST, cùng lúc; không thêm Math.random (thap-kt-anim xanh).
- **Hình mới:** bỏ vạch ngắm + tia laze. Mỗi phát = loạt **4–6 tên lửa** (1–2★ 4 · 3–4★ 5 · 5★+ 6) phóng so le 0,045 s từ đúng **4 nòng** của đầu mới (dời ngang đo từ `railgun_nong.png`, qua `AN.muzzle` → đúng mọi góc xoay), bay vòng cung nhẹ, chạm đúng lúc trừ máu (+ so le 0,02 s), mỗi nòng có chớp lửa riêng, mỗi quả nổ khói-lửa. Quái xuyên dư (nhiều hơn số tên lửa) vẫn có nổ.
- Ảnh dùng lại: tên lửa `fx_canon_ten` (vàng + ngọc xanh, hợp Salvo; chưa có → `FXU.THAY.ten_laban`), chớp nòng `fx_canon_no`, nổ `fx_canon_trung`. `FXU.MUON.railgun` cho Salvo mượn chớp nòng/nổ trúng của pháo (ảnh `fx_railgun_*` cũ là điện/laze) — cả nổ khi giết quái. Tiếng bắn: pháo (`SND.phao`) thay tiếng zap; tiếng nạp về họ "phóng".
- **Hàng / cột ĐỦ** (`VX.salvo`, `thap/js/hieuung.js`): lúc vừa đủ → vệt vàng `fx_bingo` quét + ô loé (đã có, nay vẽ **dưới đầu ụ**); đang đủ → vệt vàng mờ thường trực dọc hàng/cột, dưới đầu ụ. **Đủ cả bàn** (15 ô đều Salvo, không ô đá): loé mừng 1 lần (quét cả 3 hàng + quầng vàng + chữ "FULL BOARD SALVO!") rồi mọi ụ sáng hơn chút suốt lúc còn đủ (`SKILLS.railgun.sangDau`). Chỉ trình bày, trạng thái hình trong WeakMap.
- Chữ: "piercing rail + BINGO lines" → "rocket salvo down a line + BINGO lines" (vi.json → `tools/thap-vi-dung.py`). Ảnh xem: `docs/demo-hop-tuong/tuvan/salvo/ban.jpg`.

## claude/demo-hop-tuong — Rồng Máy (Wyrm Engine) làm lại "LÒ PHẢN ỨNG" + 4 dạng đổi hình (08/11)
- Người dùng: "chưa thấy là tướng đỏ, không có cơ chế, dame yếu, hiệu ứng xấu, biến hình không đổi hình dạng". Tư vấn ChatGPT 3 cơ chế (Infernal Reactor / Crossforge hàng-cột / Hoard) → chọn LÒ PHẢN ỨNG + nạp nhiệt bằng ghép hàng/cột: `docs/demo-hop-tuong/tuvan/rong-may/THIET-KE.md`.
- Luật (skills5.js): nón lửa 0.7D/nhịp × 5 nhịp/s + cháy 3 s như cũ · **TIA TIM LÒ** từ 3★: +1.6D (3–4★) / +2.0D (5–6★) / +2.0D vào 2 quái (7★) mỗi nhịp vào quái đầu, tầm 1.6 × nón ·
  **NHIỆT** không trần: +1 mỗi nhịp trúng, +5 × ★ ụ ra mỗi GHÉP THẬT có ô kết quả cùng HÀNG/CỘT với Rồng, nguội 2%/s (phun đều ~250); +0.2% ST/nhiệt, ≥100 +25% tốc phun, ≥250 +100% ST chí mạng; Rồng+Rồng ra Rồng giữ nhiệt ·
  **DRAGON DIVE** (3★+, hồi 32 s) đốt HẾT nhiệt: 25D × (1 + nhiệt/100) mỗi quái, vệt × (1 + nhiệt/200). Người chơi để đầy chỉ tự lao khi có trùm (giữ lò = quyết định); AI lao khi trùm / nhiệt ≥200 / ≥6 quái và ≥100. Vệt lửa Dive (vfxmoi.js) giữ nguyên.
- Số đo 4★ W12 cấp thẻ +3 (đơn / đông hs20, k/phút): Hive Queen 71/77 · Rồng cũ 9/101 · **Rồng mới 84–88/174**; 7★ 250/713 (Hive 310/279).
- 4 DẠNG đổi HÌNH thật (ảnh ChatGPT `raw_mod_ronglua_f1–4.png` → `tools/thap-cat-rong-may.py` → `ronglua_f<n>_{nong,de,vien,canh}.png`, `nho/ronglua_f<n>.png`, `RONG_DANG` trong artscale.js): 1–2★ Hatchling Engine · 3–4★ Winged Wyrm · 5–6★ Armored Dragon (lửa xanh) · 7★ Inferno Dragon (lửa trắng).
  Vẽ `SKILLS.ronglua.veDau`: 2 cánh vỗ quanh gốc (nhịp theo dạng, dang cánh khi phun), giật lùi + đầu phồng khi phun, tim lò sáng theo nhiệt, 7★ lơ lửng; đổi dạng 0,65 s (co + trắng → bung); bệ theo dạng (móc `deAnh` mới trong render.js than()). Ảnh chưa tải → đầu/bệ cũ.
- Tia tim lò = dải `fx_wyrm_lua2` kéo hẹp + loé trúng; nhiệt = tấm đếm nhỏ (lửa cam → vàng ≥100 → trắng ≥250); trang ụ: hàng FORMS 4 dạng (unitpage.js `GROW.hinh`), "4 forms".
- Online: nhiệt theo cờ ô `H` (dongbo.js); luật không số ngẫu nhiên. Chữ: mo(), text.js, roster.json + ROSTER_EMBED, mốc sao 3/5/7, clip hướng dẫn (ghép cùng hàng +nhiệt, chạm Dive), ~90 bản dịch (vi.json → ngonngu-vi.js). Pixel: ghi `docs/pixel/DANH-SACH.md` "Bổ sung".
- Test: mới `tools/thap-kt-rong-may.js` (luật, 4 dạng, tất định, online, số đo, ảnh 844×390 + 390×844) 21/21; thap-kt-khong-ban, vfx-p0, vi, cong-huong-luat, sao-tai-cho, do-nhomb (kỳ vọng thiêu cập nhật: D gồm thưởng nhiệt), tt-chiso đạt. Ảnh tổng `docs/demo-hop-tuong/tuvan/rong-may/TONG.jpg`.
- **08/11 lửa khạc → TIA** (user "để là tia, bỏ lửa rộng"): bỏ nón; 1 tia thẳng từ miệng tới quái đầu, XUYÊN mọi quái trên đường tia (nửa ngang 12–18 px) 1.0D/quái (nón cũ 0.7D) + cháy; tia tim lò GỘP vào tia = LÕI TIM 3★+ (tia dài 1.6× tầm, lõi dày, +1.0D/+1.4D/+1.4D quái đầu), 7★ TIA ĐÔI (tia 2 nhắm quái đầu ngoài tia 1); nhiệt +1/nhịp trúng; số đo k/phút đơn/đông 4★ 92/140 (cũ 82/155) · 5★ 151/233 (136/245) · 7★ 265/646 (236/588).
## claude/demo-hop-tuong — 5 chỉ huy mới: mỗi bậc Trắng / Xanh / Tím / Vàng có 2 chỉ huy (08/11)
- Người dùng duyệt ("Có"). Tư vấn ChatGPT (12 ứng viên) → chọn 5; thiết kế + lý do: `docs/demo-hop-tuong/tuvan/chi-huy-moi/THIET-KE.md`. Giá vẫn ×2 mỗi lần dùng.
  - **Trắng QUICK TUNE** (`tech`, 25 mana / 20 s): ụ Tấn công 1★–2★ đang có +40 % tốc bắn 10 s. **Trắng DRAG NET** (`tide`, 30 / 24 s): quái bàn mình bắn được chậm 25 % (trùm 12 %) 6 s, gộp nhân với chậm sẵn có, trần 90 % (trùm 50 %), kháng chậm không bị; lưới vẽ dọc tim đường.
  - **Xanh TWIN SIGNAL** (`twin`, 35 / 22 s): chạm thẻ → chạm 1 ụ Tấn công có anh em (cùng loại + sao, gần nhất) → cả cặp +60 % sát thương 12 s. **Ghép 1 trong 2 ụ = cả cặp mất buff** (người dùng chốt); +★ tại chỗ / Teleporter / Copycat-biến tại chỗ KHÔNG phải ghép → giữ.
  - **Tím CROSSFIRE** (`hawk`, 45 / 28 s): chạm 1 ô → ụ Tấn công trong hàng + cột +20 % sát thương mỗi loại ụ khác nhau trong chữ thập (tối đa +100 %) 10 s.
  - **Vàng NEXUS LINK** (`weaver`, 50 / 30 s): chạm ụ chủ lực → dây tới tối đa 3 ụ Hỗ trợ cùng hàng/cột KHÔNG kề (gần nhất, hoà → ô nhỏ); mỗi dây +(15 + 5×sao)% sát thương + 10 % tốc 11 s; dây đứt vĩnh viễn khi Hỗ trợ băng/đá/đổi chỗ/bị ghép; ghép ụ chủ lực = hết. Ụ Hỗ trợ vẫn không bắn.
- **Luật chung** (`thap/js/chihuy-moi.js` CHM + `chihuy.js`): đích tất định (không Math.random), không có đích → "NO TARGET", không trừ mana; ô chạm sai → không trừ; buff gắn thân ụ, vào nhóm cộng gộp `T.buf` (RAGE vẫn ×2 riêng); ụ băng/đá không nhận lúc dùng; đồng hồ dừng lúc nghỉ giữa wave như RAGE. Biến tại chỗ chuyển buff qua `giuKhiBien → CHM.thay`.
- **Chạm**: Trắng chạm là dùng; TWIN/CROSSFIRE/NEXUS chạm thẻ → chế độ ngắm (vòng màu trên ô hợp lệ + dải chữ trên khay), chạm ô → dùng; chạm lại thẻ / chỗ khác / 6 s → huỷ. AI + bàn máy tự chọn đích tốt nhất. Online: gói `mv` thêm ô đích `o` (gói cũ không có `o` → tự chọn).
- **Cách có**: Trắng + 3 chỉ huy cũ miễn phí (không bao giờ lấy lại); TWIN = kỷ lục wave 15 hoặc 150 ngọc · CROSSFIRE = wave 30 hoặc 400 ngọc · NEXUS = wave 50 hoặc 1000 ngọc — nút giá ngọc ngay ở bảng chọn chỉ huy, lưu `turret_kt.mvMo` (gộp OR khi đồng bộ hồ sơ). Bản lưu chọn chỉ huy chưa mở → REINFORCE; trang chi tiết khoá hiện "Wave N or N gems".
- **Hình** (ChatGPT): 5 chân dung "một thiên hà nhiều chủng tộc" (kỹ sư Terran, thuỷ tộc Thalassi, người máy Synthari, chim ưng Ferrin, plasma Voltari) + 5 icon kỹ năng + lưới — raw `docs/demo-hop-tuong/tuvan/chi-huy-moi/raw/` → `tools/thap-cat-chi-huy-moi.py` (af_<id>.png, hero/hero_af_<id>.webp, hero/home_af_<id>.webp, cmd_ic_<id>.png, cmd_fx_luoi.png); mốc mặt FACE_BOX / HERO_NEO. VFX: vòng `fx_vong_mong`, dây `sup_link` / `sup_link_vang`, dấu icon trên ụ đang được buff suốt thời gian. Pixel: ghi `docs/pixel/DANH-SACH.md` mục Bổ sung (thiếu ảnh → dự phòng). Âm: dùng lại `SND.mv`.
- Chữ: `mo()`, trang chi tiết (UP_MV), clip Skill preview cho cả 5, bảng chọn, bản Việt (vi.json → ngonngu-vi.js).
- Test: mới `tools/thap-kt-chi-huy-moi.js` (114 ca: luật từng kỹ năng, ghép/tại chỗ, tất định, online khứ hồi, AI, cách có, bản lưu cũ, chạm-ngắm, ảnh 3 cỡ); mở rộng `thap-kt-chi-huy-bac` (bậc + giá 5 chỉ huy mới, khay trận). Đạt: khong-ban, vi, vfx-p0, shop, nhangia, tt-chiso, sao-tai-cho, co-bac, test-chihuy. Tờ liên hoàn: `docs/demo-hop-tuong/tuvan/chi-huy-moi/TONG.jpg`.

## claude/demo-hop-tuong — thử hoạt ảnh TRÙM BẰNG CODE (3 trùm: hive · prism · mad_crown) (08/11)
- Vấn đề (người dùng): dải đi gen từng khung → hoa văn/ngọc/vân đổi hình giữa các khung, trùm lăn mà hoạ tiết không lăn theo ("sôi").
- Cách thử: vẽ 1 **ảnh gốc** `trum_<id>_m.png` (cắt từ khung 1 dải đi, không gen mới — `tools/thap-trum-master.py`) và chỉ biến đổi bằng code (`quaianim.js` `TRUM_ANIM_CODE`; ảnh gốc chưa nạp / trùm khác / `?trumanim=0` → dải khung cũ):
  - **hive = LĂN**: góc quay = quãng đường thật / bán kính → hoa văn lăn khớp chuyển động; bóng sáng trên-trái + tối dưới-phải CỐ ĐỊNH (PNG fx_cham_trang cắt theo thân) nên vẫn sáng từ trên.
  - **prism = LƠ LỬNG**: nhấp nhô sin, nghiêng theo hướng đi + vào cua, giãn/nén khi rẽ, thở ±1,8 %, lớp sáng lõi `_m_sang` nhấp nháy; bóng đất nhỏ lại khi lên cao.
  - **mad_crown = NHẢY thạch**: nén lấy đà → bật giãn → chạm đất nén (neo ở đáy); **vương miện tách rời** `_m_vm` (thân đã vá chỗ khuyết) theo nhịp trễ 8 % → lắc theo quán tính; ngọc vàng sáng nhấp nháy.
  - Chiêu (cả 3): lấy đà theo tiến độ báo chiêu (nén, lùi + ngả khỏi bàn, lõi sáng dần, rung cuối) → lúc chiêu nổ giãn + chớp trắng + lao về bàn rồi lò xo về (0,6 s); hiệu ứng chiêu rời giữ nguyên. Trúng đòn: chớp trắng + nén. Chết: "xác nổ" cũ dùng ảnh thân hiện tại.
  - Theo thời gian thực / quãng đường (không đếm khung) → 30/60 FPS, 1×/3× như nhau. Thanh máu, quầng báo chiêu, dấu trạng thái giữ chỗ cũ. Gameplay không đổi.
- GIF trước | sau 390×844 (đi 1×, 3× + rẽ, chiêu, trúng, chết) + bảng khung + ảnh trong trận: `docs/demo-hop-tuong/tuvan/trum-anim-code/` (dựng lại: `tools/thap-chup-trumcode.js`, bước mô phỏng tay → tất định).
- Test: thap-kt-trum-don XANH (1320 tình huống) · thap-kt-anim XANH · thap-kt-vfx-p0 XANH.
- Thêm **freezer** (khối băng nhảy, dẻo 0,6: lõi bông tuyết bùng sáng + 2 cụm sương toả ở đất lúc chạm) và **joker_king** (hộp + NẮP rời `_m_nap`: lạch cạch khi chạm đất, lấy đà rung hé, tung chiêu bật mở lộ lò xo rồi sập) — ảnh cắt bằng `tools/thap-trum-master-nhay2.py`, GIF `trum-anim-code/{freezer,joker_king}_truoc-sau.gif`; test trum-don/anim/vfx-p0 XANH.
- Đánh bóng thử nghiệm: **mad_crown** chạm đất có vũng thạch hồng loang ở đất + thân rung thạch tắt dần, vương miện lắc mạnh hơn (vmK 2,6 + bị hất khi chạm); **prism** nhấp nhô cao hơn (bob 0,085), nghiêng vào cua rõ hơn (tối đa 0,22 rad), chớp + bùng sáng lúc tung chiêu mạnh hơn (chop 1,5); GIF 2 trùm cập nhật.
- Thêm 4 trùm **lơ lửng** (nền prism) có PHẦN RỜI cắt từ ảnh cũ (`tools/thap-trum-master-bay.py`): **nightmare** (lõi mắt đỏ nhấp nháy) · **twin_core** (2 vòng lõi đủ tròn tách–khép + quỹ đạo ngược pha, tia sét kéo giãn nối 2 tâm) · **janus** (8 mảnh bay quanh khối: co vào lúc lấy đà, văng ra lúc tung) · **octopus** (hoa lửa uốn lắc neo mép chậu, bùng cao lúc tung); GIF `trum-anim-code/{nightmare,twin_core,janus,octopus}_truoc-sau.gif`; test trum-don/anim/vfx-p0 XANH.
- Đợt 2 (jammer · patcher · leech + sửa hive): hive LĂN 3D (trục lăn ⟂ hướng đi, đi dọc hoa văn lăn dọc; dải xích đạo trộn triplanar) + 3 ong tách lớp `_m_ong` bay vòng · jammer vành gai quay, thân giữ nguyên, ăng-ten `_m_nap` lắc trễ · patcher bánh răng quay sau giá chữ X + cờ lê đứng yên (`_m_nap`) · leech BÒ sâu đo giãn dọc đường + sáng bụng sao đập theo nhịp; ảnh gốc `tools/thap-trum-master-lan.py`, GIF `<id>_truoc-sau.gif`.
- **jammer gen lại 3 lớp** (ChatGPT, nền magenta → `tools/thap-trum-master-jammer.py`): vành gai `_m_vanh` tròn đều nhìn từ trên (12 gai, giữa rỗng) QUAY THUẬN KIM ĐỒNG HỒ liên tục (quay chậm lúc đứng + theo quãng đường, không đổi chiều theo hướng đi; lấy đà chiêu quay nhanh dần, tung chiêu vành phồng-chớp rồi chậm về) nén dọc theo phối cảnh, nửa sau sau thân / nửa trước che đáy thân → hết mảnh gai vụn; thân `_m` đứng thẳng nhún nhẹ; ăng-ten `_m_nap` cắm lỗ đỉnh vòm lắc trễ; GIF `trum-anim-code/jammer_truoc-sau.gif` (trước = bản code cũ); test trum-don/anim/vfx-p0 XANH. Chỉ hình.

## claude/demo-hop-tuong — Bỏ vòng sáng khoanh ụ cùng loại khi chạm thẻ khay trận (08/11)

- Chạm thẻ ở khay trận không còn vẽ vòng `sup_ring` (tròn xanh-trắng có vạch) quanh mọi ụ cùng loại trên bàn (`ND.veSoi` không vẽ gì); chạm thẻ vẫn nâng cấp bằng mana như cũ. Vệt hàng/cột Salvo dưới đầu ụ giữ nguyên.
## claude/demo-hop-tuong — tên lửa không bay ra ngoài bàn (08/11)
- "sao tên lửa lại bắn lên tận ngoài thế này": Pháo La Bàn (tên lửa đuổi, khói, hạt, nổ khi hết quái) + Salvo Battery (đường bay, điểm rơi) chỉ VẼ trong hộp bàn + đường (mép đường + 10 px, `epKhungTL` game.js, render.js noiSuy) — luật bay/ST/thời điểm trúng giữ nguyên (mô phỏng tất định so trước/sau trùng hash). Ảnh: `docs/demo-hop-tuong/tuvan/ten-lua/truoc-sau.jpg`.

## claude/demo-hop-tuong — Bỏ icon cạnh thanh máu trùm/quái (08/11)

- Bỏ 2 trái tim (`ui_tim`, số tim mất nếu trùm lọt, hiện khi trùm đi quá 70% đường) và bông tuyết (`ic_cham`, dấu bị chậm) cạnh thanh máu trùm/quái (`trumvfx.js`, `quaianim.js`, `render.js`); bị chậm vẫn thấy qua thanh máu xanh băng + vòng gió lạnh/băng trên thân. Giữ sao Star Leech đang giữ (giết trả lại ★) và mảnh khiên Prism. Đạt: trum-don, vfx-p0, khong-ban.

## claude/demo-hop-tuong — Ember Relay: hiệu ứng nhận lửa hàng/cột (08/11)

- Lửa Thập Tự: ghép 2 Relay → vệt lửa (`fx_ronglua_vet`) chạy từ ô ghép dọc hàng/cột tới Relay được cộng lửa (~0,25–0,46 s, dưới đầu súng; chỉ đốm lửa màu mốc ở đầu vệt nằm trên), Relay nhận hiện "+N" màu mốc (cam/trắng/lam/vàng/đỏ) + icon lửa trên tấm đếm loé 1 nhịp; ụ ra là Relay hiện số lửa mới. Chỉ hình (`LUA_VET`, vangmoi1.js; móc `demkn.js`; bàn con rối online chỉ "+N" — `dongbo.js`), không đổi luật. Ảnh: `docs/demo-hop-tuong/tuvan/ember/hieu-ung-hang-cot.jpg`.
## claude/demo-hop-tuong — Ụ mới WILD LINK / Khớp Nối Vạn Năng (`tudo`, TÍM, Đặc biệt, họ JOKER) (08/11)

- Người dùng: "có ụ tím mà dạng special nó có thể ghép với bất kỳ ụ nào không, số sao là của ụ đó + ụ được ghép / 2 và nó cũng có thể kích hoạt twin"; chốt thêm: "ghép được với hoá đá và băng, nếu dùng nó ghép pháo la bàn prism và lucky slot thì ra random 1 ụ mới".
- **Luật** (`thap/js/game.js` `tdW` / `laTuDo` / `saoGhep` / `ghep`): kéo Wild Link lên BẤT KỲ ụ (hoặc ụ bất kỳ lên nó) — mọi loại, mọi sao (cả 7★), cả ô **ĐÁ / BĂNG**, cả **Pháo La Bàn / Prism Thief (kể cả mặt nạ hợp thể) / Lucky Slot**. Kết quả = 1 ụ **ngẫu nhiên trong bộ bài** (như ghép thường — giữ đúng luật "ghép = 2 ụ mất, ra ụ mới", nên kỹ năng khi ghép như Twin Maker chạy đúng nghĩa; giữ loại đích sẽ thành "nâng sao tại chỗ" mà game đã chốt KHÔNG phải ghép), loại bốc bằng RNG hạt giống trận (tất định). **Sao = ⌈(sao 2 ụ)/2⌉**, không +1★ (1+2 → 2, 3+4 → 4, 2+6 → 4). Kết quả luôn là ụ thường (hết đá/băng), không mang stack/hướng/hợp thể; ụ mới quay lại dạng ngẫu nhiên lúc sinh (hướng La Bàn, màu Prism, máy xèng…).
  - Wild Link bị khoá (đá/băng) không dùng được kỹ năng; ụ KÉO bị khoá cũng không (luật nguồn khoá). Wild Link đá + đá cùng sao: luật đá cũ (ra đá +1★). Merge King lên nó: +★ tại chỗ (không phải ghép); Copycat chép được; Copycat / Teleporter / Overclock / Merge King kéo lên Wild Link vẫn dùng kỹ năng của chúng (ghép đặc biệt ưu tiên).
  - **Ghép thật**: đi đúng đường ghép thường → bộ đếm ghép, Fusion Archive, Star Breaker, MERGE SURGE, nhiệm vụ, kỹ năng KHI GHÉP của 2 nguyên liệu chạy 1 lần. Khác sao: kỹ năng khi ghép thấy cả 2 nguyên liệu ở sao ⌈trung bình⌉ → **Twin Maker gọi thêm 1 ụ ở sao trung bình** (10%+: +1★), Mana Doubler cho mana như ghép ở sao đó; Mirror Gate (co-op) cũng dùng sao trung bình.
  - **Cấp thẻ**: "Bonus +1★" — xác suất kết quả +1★ trên sao trung bình: 10% (cấp đầu Tím) → 28% (+2%/cấp). Bắn nhẹ như Mimic / Twin Maker (Đặc biệt nhóm ghép có bắn): ST 8,5, 1,2 phát/s.
  - **Xem trước khi kéo**: huy hiệu sao trên ô đích = sao kết quả (ghepfx.js dùng `saoGhep`) + chữ luôn hiện "Wild merge: random 4★ (−2★) · 10%: 5★" (−★ = mất sao so với ụ cao hơn).
  - Online: đi gói `gh` thường (loại + sao + ụ sinh đôi); bàn con rối nhận đúng sao qua `G._tdS` (dongbo.js apGhep). AI: chỉ ghép khi 2 sao lệch ≤ 1 (không mất sao), ưu tiên ụ có kỹ năng khi ghép (Twin Maker…).
- Hình: đầu 2 vòng xích hình số 8 + ngọc nhiều màu, bệ 4 cánh tím, phần phụ vòng 4 chốt màu (ChatGPT, `docs/demo-hop-tuong/thap-art/raw_mod_tudo.png` → `tools/thap-cat-umod.py tudo`); chân dung tộc **Voltari** (plasma tím, cầm xích số 8) `docs/demo-hop-tuong/tuvan/chan-dung-moi/raw/cd_tudo.png` → `tools/thap-cat-chandung.py tudo`. Pixel: ghi ở `docs/pixel/DANH-SACH.md` mục Bổ sung (dự phòng vẽ ảnh thường).
- Trang ụ (mục Merge rules), clip hướng dẫn (Wild 3★ lên Twin Maker 4★), tiếng Việt (vi.json → `tools/thap-vi-dung.py`).
- Test: `node tools/thap-kt-ghep-tu-do.js` (luật sao, mọi loại/sao, đá/băng, La Bàn/Prism/Lucky Slot, ghép thật + Twin Maker 1 lần, bộ đếm, cấp thẻ, tất định, gói online khứ hồi, AI; Playwright kéo thật 390×844 + 844×390). `thap-kt-cong-huong-luat` cập nhật mong đợi cho đích Wild Link.

## claude/demo-hop-tuong — Bản sao Copycat theo Ô ĐÍCH khi ghép cùng loại (09/11)
- Lỗi người dùng báo: thả Pháo La Bàn thật vào Pháo La Bàn bản sao → ra La Bàn thật (mất −% bản sao). Người dùng chốt: chiều ghép là chiến thuật —
  ghép CÙNG LOẠI ra đúng loại đó thì kết quả theo **ụ đích**: ụ thật → bản sao = bản sao; bản sao → ụ thật = ụ thật.
- Sửa (hàm chung `giuBanSao` trong `thap/js/game.js`): La Bàn + La Bàn (trước luôn tẩy thành thật), hợp thể Prism (trước chỉ bản sao khi CẢ 4 là bản sao → nay theo ô cuối),
  ghép thường X + X ra lại X (Ember, Leviathan, Evolver, Rồng… — trước luôn thật), sửa ụ ngoài bộ (ktDeck — trước mất cờ). Anvil + Anvil, Merge King + Merge King: đã giữ ụ đích, giữ nguyên.
- Ghép ra loại khác / Mimic vẫn ra ụ thật. Online: gói 'gh' / 'pm' / ảnh chụp mang cờ 'c' (đã có, test khứ hồi).
- Chữ Copycat thêm: "merging into a copy keeps it a copy; merging a copy into a real one makes it real" (+ tiếng Việt trong vi.json → ngonngu-vi.js).
- Nguyên tắc tương tác chung cho mọi phiên sau: `docs/demo-hop-tuong/tuvan/conghuong/NGUYEN-TAC.md`. Test mới: `tools/thap-kt-ban-sao-giu.js`.

## claude/demo-hop-tuong — Ember Relay: sửa luật truyền lửa theo người dùng (08/11)

- Người dùng: "ember phải cùng sao mới merge được 2 ụ ember, lửa truyền cho các ember cùng hàng cột = lửa ember A + ember C + ember được truyền"; "ember vì 1 lý do nào mà biến mất thì sẽ truyền lửa, còn vẫn ở đó như hoá đá, biến đổi thành 1 tướng khác do skill của ụ hoặc boss, hoặc đóng băng thì không truyền lửa"; "Cả bị súng bắn trừ sao cũng vậy".
- **Luật chung (`LUA_ROI`, `vangmoi1.js`):** Ember RỜI BÀN vì bất kỳ lý do gì (bị ghép mất — Ember+Ember, Mimic, ghép đặc biệt; Blood Circuit nuốt; bán/xoá; trùm phá; trừ sao ở 1★ làm vỡ) → lửa của nó **cộng** vào mọi Ember khác cùng hàng + cột với ô **của chính nó** (trần của ụ nhận). Ember chung đường với cả A và C nhận A + C; mỗi Ember rời bàn chỉ góp 1 lần. Bỏ luật cũ `max(cũ, A + B)` (spec ChatGPT).
- **Không truyền (Ember vẫn ở đó):** hoá đá, đóng băng, bị biến thành ụ khác tại chỗ (trùm / kỹ năng / Joker King), Teleporter đổi chỗ, bị bắn trừ sao (giữ lửa).
- Móc ở mức bàn: so ảnh chụp Ember trước/sau mỗi `capNhatBan` và mỗi `ghep` (không theo từng kỹ năng → ụ đa năng mới tự áp dụng). Không nhận: Ember cũng rời trong cùng lượt, ụ đứng ở ô Ember vừa rời (ụ ra của ghép), Ember mới xuất hiện cùng lượt, ô đá.
- Ghép Ember chỉ khi cùng sao (luật ghép thường, thêm chặn trong `SKILLS.lualien.ghep`). Ụ ra là Ember: giữ như cũ = max(★, A + C) — còn hỏi người dùng.
- Online: bàn con rối không tự truyền; số lửa theo cờ ô `r` từ máy chủ bàn (2 máy cùng số), "+N" qua `LUA_VET.conRoi`.
- Hiệu ứng: vệt lửa từ ô của MỖI Ember rời bàn; "+N" = lửa thật cộng thêm (gộp nhiều nguồn). Chữ: `mo()`, `text.js`, `ROSTER_EMBED` (lualien), họ kỹ năng, clip hướng dẫn (ô 7 → ô 8: ô 6 +4, ô 3/13 +1) + `vi.json` → `thap-vi-dung.py`.
- Test: `thap-kt-vang-g2` (các đường rời bàn / ở lại), `thap-kt-vang-moi`, `thap-kt-cong-huong-luat`, `thap-kt-matran`, `thap-kt-p2`. Ảnh xem: 390×844 ghép 2 Ember nuôi 2 Ember (+9 hàng, +3 cột).
- **claude/demo-hop-tuong — Ember sửa 08/11:** ghép Ember + Ember (hoặc Mimic / Wild Link / ghép đặc biệt nuốt Ember) → lửa của (cả 2) Ember truyền theo hàng + cột của Ô GHÉP (ô đích, nơi ụ ra hiện) — A 5, B 5, C 5, kéo B vào C → Ember cùng hàng/cột ô C = 15; rời bàn đơn lẻ (bán, nuốt, trùm phá, vỡ) vẫn theo ô của chính nó; vệt lửa + "+N" xuất phát từ ô ghép.
- **claude/demo-hop-tuong — Ember Relay tăng sức (08/11, "hơi ít nhỉ, so với các tướng vàng có cộng dồn"):** mỗi lửa +8% ST / +0,4 điểm % chí mạng (tổng ≤ 100%) / +4% ST chí mạng (cũ +2% / +0,12 / 0), BỎ TRẦN lửa (cũ 70→160, giữ màu mốc 10/30/50/70), đột phá độ khó 5 (cũ 3: I +25% tốc · II +50% STCM · III +45% ST · IV +15% CM +85% STCM); sim DPS 5★ wave 20: 50 lửa 970→3607, 70 lửa 1043→5560 (La Bàn NSWE 3687, +1 stack 6339; Prism hợp 2 lần ~2.8–3.7k). Bảng 5★ 70 lửa: CRIT 28%→53%, CRIT DMG 280%→615%. Test: vang-g2, vang-moi, cong-huong-luat, tt-chiso, khong-ban.

## claude/demo-hop-tuong — Sửa các phát hiện AUDIT-0811 (cộng hưởng · ghép · rời bàn · đá-băng · online) theo quyết định người dùng 09/11
- **Sửa luật 09/11 (người dùng: "A + A ra A khác với A + A ra ụ ngẫu nhiên, dù ngẫu nhiên ra A cũng không thể coi đó là cùng 1 ụ")**: ghép THƯỜNG bốc trúng lại đúng loại (vd Rồng Máy + bản sao) KHÔNG theo ô đích nữa — luôn ụ mới THẬT, mọi chiều (bỏ đường 3 của giuBanSao / 6c81f290). Chỉ ghép đặc biệt cùng loại (La Bàn, hợp thể Prism, Anvil + Anvil, MK + MK) theo ô đích. Chữ thẻ Copycat, NGUYEN-TAC.md, `thap-kt-ban-sao-giu`.
- **Q1 = A** ghép thường ra ụ TRÙNG loại (Leviathan, Hộp, Evolver, Rồng, Nine-Tail, Ép Xung…) = ụ MỚI, cộng dồn riêng ụ về 0: bỏ `GIU_CONG_DON` (+ `ronglua`), nhánh Ép Xung trong `ghep`, giữ đuôi / số lần xả Nine-Tail. Ember + Ember bốc trúng Ember: Ember MỚI, lửa = ★ (bỏ max(★, A + C)); lửa A + C vẫn truyền cho Ember KHÁC cùng hàng/cột ô ghép. Chữ thẻ Leviathan.
- **Q2 = A** buff Twin Anvil của nguyên liệu mất khi ghép thường (cả Wild Link). **Q3 = A** MK vàng kéo vào MK thường: +2★, đích giữ dạng thường.
- **Q4 = B** biến hình thành ụ KHÁC (Mad Crown, Hộp, Scrambler, Evolver nở, Joker, Copycat) = ụ mới: Ép Xung, buff Anvil, Aurora, khiên MẤT (`giuKhiBien` chỉ giữ góc + bản sao + buff chỉ huy có thời hạn). +★ tại chỗ / Rồng đổi dạng / Sói thức tỉnh giữ hết. Chữ thẻ Copycat.
- **Q5 = A** ụ băng không nhận lửa Ember / nhiệt Rồng từ ghép hàng-cột. **Q6 = A** dấu Mạch Máu trên ụ băng dừng đếm. **Q7** ghép 2 Ember: truyền A + C đúng 1 lần (móc rời bàn). **Q8 = A** Joker biến Ember rồi ép ghép: không truyền. **Q9** Wild Link vẫn ghép ụ khoá.
- **F3** Freezer không băng lại / kéo dài ụ đang băng (hết ụ → chiêu hụt). **F4** móc Ember quét thêm trước `trieu` / `sinhDoi` / `dungMV`; đồng bộ mạng bàn mình không truyền. **F10** `nhanSaoTuDong` (bỏ đá + băng) cho Pandora + Star Leech — như Genesis / REINFORCE / Star Lift; Merge King kéo tay vẫn lên đá/băng (luật DCDW). **F13** TWIN / CROSSFIRE bỏ ụ khoá. **F17** gói `cd` không gỡ đá/băng.
- **NT9** `rngLuat(B, muối, ô)` (hạt trận + NGƯỜI chơi + bộ đếm) thay Math.random cho ụ ra ghép thường, ô/loại triệu hồi, Twin Maker offline, Hộp Bí Ẩn, Scrambler + Signal Jammer PVP (2 máy cùng ô, cùng loại). Còn Math.random chiến đấu (chí mạng, Dice Gun, hỗ trợ giết ngay/choáng, hồi chiêu đầu) — không đổi bàn.
- **F14** cờ ô online mới: ABYSS, đuôi Nine-Tail, Nemesis, Genesis, Hive, khiên, Aurora, cháy, kẹp.
- Chưa làm: F18 (chữ thẻ sao ghép cùng loại). Test mới `tools/thap-kt-nguyen-tac.js` (52 ca); sửa kỳ vọng cũ: `ban-sao-giu` (ghép thường X + X luôn thật), `cong-huong-luat`, `matran` (F19 + MK + Copycat/khiên + Pháo NSWE), `vang-g2` B5-4, `rong-may`, `ngau-nhien-sinh`, `conghuong2`, `kynang-vd` (Nine-Tail).

- 08/11 (người dùng): ghép 2 Ember mà ngẫu nhiên ra Ember → Ember mới có **0 lửa** (không phải = ★). Sửa 1 dòng trong `ghep()` (game.js), áp cả bàn con rối online (apGhep gọi ghep).

- 08/11 (người dùng: "xứng đáng tướng vàng hơn"): **Wild Link** (`tudo`) lên bậc **VÀNG** (roster + ROSTER_EMBED, họ JOKER bậc 3, khung vàng, LV9→17; xác suất +1★ cấp thẻ 10%→30%, `buoc` 2.5); luật ghép một chiều / ⌈trung bình⌉ giữ nguyên. Thẻ Tím đã có: giữ cấp + bản sao (dưới LV9 được nâng lên LV9).

- 08/11 (người dùng: "hydra làm không đâu vào với đâu" + "ấn vào tướng bên dưới thì kích hoạt toàn bộ, tốn mana tăng dần"): **Hydra** vẽ lại thành vương miện n đầu (= sao) xoè đối xứng quanh thân tròn giữa ô, cổ ngắn, mọi đầu nằm trong ô, mỗi đầu ngoảnh tối đa ±30°/±23° về mục tiêu + giật lùi khi phun, đạn ra từ miệng, bóng cầm kéo cũng vẽ vương miện; bỏ kỹ năng chạm từng ụ — **chạm THẺ Hydra ở khay** = mọi Hydra 3★+ cùng bật (3–6★ bắn nhanh gấp đôi, 7★ SÚNG MÁY), giá 40 mana gấp đôi mỗi lần (40→80→160…), thẻ hiện giá, xám khi thiếu mana/không có Hydra 3★+ sẵn sàng; online gói `hy`, AI tự dùng; chữ EN/VI + clip hướng dẫn cập nhật; ảnh `docs/demo-hop-tuong/tuvan/hydra/truoc-sau.jpg`.

## claude/demo-hop-tuong — Hydra: đầu cố định, cả vương miện xoay liền khối (08/11)
- Các đầu rắn không còn ngoảnh/giật riêng (hết lắc khi 2 đầu): cả vương miện xoay mượt quanh tâm ô theo hướng mục tiêu (T.goc), giật rất nhẹ cả khối; viên bắn ra từ miệng theo vị trí đã xoay; gameplay giữ nguyên.

## claude/demo-hop-tuong — Chiêu trùm nhắm ụ NGẪU NHIÊN (08/11)
- Nightmare bắn tỉa 1 ụ ngẫu nhiên (bỏ "ụ nhiều sao nhất"); Jammer phần ngoài ụ Hỗ trợ chọn ngẫu nhiên (bỏ xếp sao); Mad Crown/Octopus/Janus/Joker chọn ngẫu nhiên trong ụ KHÔNG khoá (đủ số trúng); Star Leech giữ nhắm ụ mạnh nhất (bản sắc). RNG rngTrum có hạt — online tất định.

## claude/demo-hop-tuong — Sói Máy: ĐÁNH LAN (08/11)
- Sói Máy (`soi`, skills2.js): mỗi viên trúng lan 40% sát thương lên quái trong 0.6 ô (thức tỉnh 50% · 0.8 ô); lan chỉ chí mạng khi viên chính chí mạng; D 55 → 52 (đơn mục tiêu −5%, +1 quái lân cận +32%/+42%, +2 quái +70%/+89%); VFX `HU.soiLan` vòng sóng + 3 vết vuốt giữa điểm trúng; tất định (không Math.random).

## claude/demo-hop-tuong — Trùm: không bị cắt ở làn mép, bỏ bóng 3 cánh Prism, chớp tung chiêu dịu (08/11)
- Trùm làn sát mép canvas (x≈27 / x≈404) vẽ lùi vào trong cho trọn thân (chỉ hình, vị trí gameplay giữ nguyên; quaianim.js trumLech); vòng khiên Prism chỉ vẽ khi khiên bật (trumvfx.js); chớp tung chiêu = lớp sáng cộng ~42–50%/0,12 s thay phủ trắng đặc, chớp trúng đòn nhẹ hơn (0,45→0,3).

## claude/demo-hop-tuong — Copycat chép cả ô ĐÁ, KHÔNG chép ô BĂNG (08/11, chốt lại)

- Người dùng: "copy cả đá nhé, không cho copy băng thôi" — Copycat kéo lên ô đá cùng sao ra bản sao thường đúng loại thật (ô đá giữ nguyên); ô đóng băng không chép được (`SKILLS.saochep.ghepDB.hopLe` chặn `b.st.bang > 0`); chữ kỹ năng EN/VI, roster cập nhật; test `tools/thap-kt-copycat-da.js`, `tools/thap-kt-conghuong.js`.

## claude/demo-hop-tuong — Mạch Máu (Blood Circuit) thành ụ TẤN CÔNG theo Máu (09/11)
- `mauhut` (skills7.js): vai 'tc', bắn đạn máu vào quái đầu. Máu riêng từng ụ, KHÔNG trần; mỗi Máu +5% ST, +0.6% tốc, +0.2% chí mạng (≤100%), +3% ST chí mạng cho CHÍNH nó. Ụ mới (gọi ra / ghép thường / Copycat) = 0 Máu; nâng sao tại chỗ giữ Máu.
- Giữ đánh dấu → nuốt (+5 Máu/★), danh sách cấm, mục tiêu băng/đá dừng đếm. Cấp thẻ: thời gian nuốt −4%/cấp (LV17 −32%, trang ụ "Devour time"). BỎ Blood Rite + vòng nạp xanh; dấu = icon tim nhỏ ở mục tiêu + tấm "Ns" đáy ô.
- Mốc 20 / 50 / 100 / 200: 4 dạng (hình ChatGPT `raw_mod_mauhut_f2–f4` → `tools/thap-cat-mauhut.py` → `mauhut_f<n>_*`, `MAUHUT_DANG` trong artscale.js; chưa tải ảnh → hình cũ), thưởng dạng +15/+40/+60/+90% ST, đạn to dần (`fx_mauhut_b1–b3`), từ 100 Máu mỗi phát thứ 6 nổ NOVA máu ×1.2 ST bán kính 55 (200: thứ 4, `fx_mauhut_nova`); lên dạng: loé biến hình. Số Máu ở góc TRÊN-PHẢI ô, màu theo mốc.
- Online: cờ ô 'B' Máu · 'P' dạng · 'Q' đếm phát (nova tất định) · 'M'/'C' dấu. AI: còn ≤ 2 ô trống → đánh dấu ụ lẻ (không có cặp ghép) ≤4★ sao thấp; bàn đầy hết cặp → ụ sao thấp nhất.
- Cân bằng (sim 30 s, wave 20, 4★/7★ DPS): Blood 20: 438/1325 · 50: 1227/3683 · 100: 5691/15658 · 200: chạm trần sim (20520) — so Ember 50: 2038/7020, Ember 70: 4521/10434, Compass NSWE st3: 7352/20437, Prism hợp thể 2 đầy: 2047/5358.
- Test: Blood trong `tools/thap-kt-vang-g2.js` (đạt; ca Ember Wild Link lỗi sẵn từ trước), `thap-kt-vang-moi2.js` đổi kỳ vọng dòng CARD LV.

## claude/demo-hop-tuong — sửa chạm trứng cháy (08/11)
- Chạm trứng cháy 7★ (Evolver) luôn tái chế +20 mana — kể cả trứng bị băng/đá/câm (`chamSan`, game.js) và ngón tay rung ≤ 10 px vẫn là chạm (ui.js); ụ có ▶ chạm = dùng chiêu, không mở dải; dải xem Evolver ghi rõ giây nở / trứng cháy chạm +20 mana.

## claude/demo-hop-tuong — sửa lỗi "chơi tướng mới phải thoát ra vào lại mới load được" (08/11)
- Bản mới: trang cũ (mạng chậm > 3,5 s → SW trả index cũ / app nằm nền) giờ tự nạp lại sang bản mới ở menu (kiểm ver.json lúc mở + khi app quay lại + 3 phút/lần; bấm PLAY khi đã biết có bản mới → nạp lại thay vì vào trận bằng bản cũ; nạp bằng `?r=` để SW không trả lại index cũ, tối đa 2 lần/bản/phiên — không lặp); sw.js lưu index mạng đúng cách (waitUntil gọi ngay); nongskill.js: decode() treo quá 1,5 s thì vẫn vẽ ảnh (trước: ảnh ụ kẹt "chưa giải mã" tới khi mở lại app).

## claude/demo-hop-tuong — Fusion Archive lần đầu: sao lơ lửng · bỏ thông báo nổi hình tròn khi kỹ năng khi-ghép kích hoạt (08/11)
- Sao vàng lơ lửng trên ô "trống" (ảnh người dùng, Fusion Archive lần đầu): ô đó CÓ Fusion Archive nhưng ảnh bệ riêng + đầu súng (và bệ chung dự phòng `de_chung`, vốn không ụ nào khác dùng) chưa sẵn — giải mã ảnh treo trên Safari iOS (đã sửa gốc ở 65fc9a5f: hết 1,5 s thì thôi đợi `decode()`). Huy hiệu sao vẫn vẽ vì `hh_sao` đã có. Thêm chốt chặn `render.js veU`: thân + đầu đều chưa vẽ được thì KHÔNG vẽ huy hiệu sao (không còn sao lơ lửng). Không đổi luật / RNG.
- Sao ụ hàng trên nằm sát mép trên ô: đúng thiết kế 08/11 (sao giữa, trên ụ) — giữ nguyên.
- Fusion Archive 0 điểm không hiện số lưu (chỉ hiện từ 1/40) — đúng quy tắc gọn; số trên thẻ khay ("1"/"2") = số ụ loại đó đang có trên bàn.
- BỎ thông báo nổi hình tròn trên đầu ụ (khung `h2_vong_xam` + icon `nho/<id>`) khi kỹ năng KHI GHÉP kích hoạt (`hieuung.js` sự kiện `kh`) — áp cho mọi ụ có `ghep`: Orbital, Wall Projector, Mana Doubler, Drone Bay, Cooldown Horn, Cloner, Jammer, Scrambler, Twin Maker, Combo Core, Chrono Lock, Pandora Vault, Signal Jammer, Hero Foundry, Blood Circuit, Hex Saboteur, Prism Thief. Giữ vòng phù văn. BỎ cả biểu tượng sinh đôi nổi trên 2 ô của Twin Maker (`fx_sinhdoi_hieu`), giữ tia + vòng vàng. Nhãn tên ụ khi kéo, sao, số trên ụ, đếm ngược trứng không đổi.

## claude/demo-hop-tuong — Cân bằng HẬU KỲ: tướng Đỏ / ụ Vàng gánh late game, máu quái dịu sau wave 25 (09/11)
- Người dùng: "chỉ tầm round 30 hơn 30 là gãy" (cả bộ có tướng Đỏ tấn công / ụ Vàng). Đo bằng bot mô phỏng (môi trường `tools/thap-sim-vaitro.js` + trum.js, bot "chơi tốt": cấp thẻ 8, ưu tiên POWER-UP; 6 hạt giống/bộ).
- Chỗ gãy: `mauWave` ×1.15 mỗi wave mãi mãi (×4 mỗi 10 wave) trong khi sát thương bàn chỉ tăng tuyến tính theo sao/power-up và chững lại khi bàn đã max (mana dư hàng nghìn). Trùm wave 30 (~306k máu) ≈ toàn bộ sát thương bàn cả wave → lọt 2 tim; trùm 40 (×4.2 máu) → thua. Ụ Vàng/Đỏ không có gì tăng theo late game (hệ số bậc Đỏ 2.7 chỉ hơn Vàng 2.6).
- Sửa (`thap/js/data.js`, `game.js`, `statthuc.js`):
  - Máu quái: sau wave 25 tăng ×1.12/wave (trước ×1.15). wave 30/40/50/60: 4 936 / 13 735 / 40 430 / 122 712 (trước 5 507 / 19 900 / 75 000 / 305 000). PVP giữ ×1.15 (nhịp ĐỘT TỬ không đổi). Trùm vẫn = mauWave × 30 × (1 + w/35).
  - GÁNH HẬU KỲ `heHauKy(T)`: ụ Tấn công VÀNG +3.5%, ĐỎ +4% sát thương mỗi wave sau wave 20 (nhân riêng trong `dmgU` → gồm đòn kỹ năng/chủ động: hố đen, sấm Overlord, bầy Chúa Tổ, Rồng Lửa, Leviathan…). Wave 40: ×1.70 / ×1.80; wave 60: ×2.40 / ×2.60. Tất định theo `G.wave`, mọi chế độ. Bảng chỉ số thực hiện dòng "×N · sức mạnh hậu kỳ".
  - Đo bậc (`thap-sim-tier.js`, wave 20) không đổi (hệ số = 1 tới wave 20).
- Wave trung bình (bot chơi tốt) trước → sau: Đỏ blackhole/overlord/chuato 46.8 → 58.0 · Đỏ ronglua/leviathan/overlord 56 → 70 (thắng) · Vàng canon/aten/railgun 35.7 → 42.3 · Vàng soi/nemesis/ngoisao 30.0 → 32.8 · Tím cuongno… 36.0 → 36.7. Bot thường (không cấp thẻ): Đỏ 39.7 → 46.5, ronglua 44.8 → 54.5.

## claude/demo-hop-tuong — Buff hậu kỳ riêng 3 ụ Vàng yếu: Sói Máy, Nemesis, Pháo Ngôi Sao (09/11)
- Người dùng chốt: không giảm bộ Rồng/Thuỷ Quái, không làm chỗ tiêu mana; tăng riêng bộ Vàng yếu Sói/Nemesis/Ngôi Sao. Chỉ sửa kỹ năng của chính 3 ụ (không đụng hệ số chung).
- Nguyên nhân (bot chơi tốt, 24 hạt giống): bộ soi/nemesis/ngoisao/dongbo/vughep gãy ~wave 33–34 ở wave THƯỜNG (không phải trùm) — từ wave 30 có quái que tách → bầy quái nhỏ + quái bay lọt nguyên máu. Nemesis và Ngôi Sao đều đánh đơn mục tiêu; Ngôi Sao cần tổng ★ ≥ 50 mới có sát thương nhưng bàn thật chỉ ~35–50★; Sói là ụ dọn bầy duy nhất nhưng lan yếu (40% · 0.6 ô).
- Sói Máy (`skills2.js`): sát thương 52 → 58; lan 40% · 0.6 ô → 70% · 1 ô; thức tỉnh 50% · 0.8 ô → 85% · 1.2 ô.
- Pháo Ngôi Sao (`skills2.js` luat): mỗi mốc 10★ +15% tốc (trước 10%) VÀ +10% sát thương (mới); mỗi mốc 50★ +100% sát thương (trước 50%). Thưởng đúng mốc giữ nguyên.
- Nemesis (`skills4.js`): % máu tối đa mỗi đòn 0.3–1.2% → 0.5–2% theo sao; trần với trùm 0.8% → 1.2% (`TRAN_TRUM`); trần phán quyết tốc 40% → 60%, sát thương 60% → 100%.
- Mô tả cập nhật: text.js, roster.json/meta.js (kyNang + kyNang_vi), skilldemo.js, vi.json (+ câu mới cho Pháo Ngôi Sao) → ngonngu-vi.js.
- Wave trung bình trước → sau: soi/nemesis/ngoisao/dongbo/vughep 32.2 → 41.2 (24 hạt; bộ Vàng canon 43.3) · soi/nemesis/ngoisao/thanhdia/saochep 32.8 → 36.1 · aten/railgun/soi 45.0 → 44.6 (không quá mạnh).
- Ụ Vàng tấn công khác còn yếu (chỉ ghi, chưa sửa): bộ nhatthuc/lualien/hopca 31.2, luutru/mauhut/bienmau 24.6 (bộ 1 ụ tấn công: bienmau 15.8, luutru 17, hopca 19, lualien 20.8; hydra 15.8 do bot không dùng kỹ năng chạm).

## claude/demo-hop-tuong — Buff hậu kỳ 6 ụ Vàng tấn công yếu, ưu tiên TỐC BẮN (09/11)
- Người dùng: tăng các ụ Vàng yếu; phản hồi khi chơi: "Lửa Thập Tự 260 lửa, 18k dame mà bắn không nổi" → phát to nhưng chậm, đơn mục tiêu. Bot (môi trường thap-sim, cấp thẻ 8, ưu tiên power-up) cho thấy cả 6 ụ gãy ở wave ~31–34 vì bầy quái tách/bay từ wave 30: tăng sát thương mỗi phát gần như không đổi kết quả, tăng TỐC BẮN mới có tác dụng.
- Nhật Thực: tốc 0.9 → 1.5 · tia ngày ×1.5–2.5 → ×2.2–3.8 · cháy 40% → 60% · nón trăng đêm ×0.6 → ×1 (`DEM_K`, `CHAY_K`).
- Lửa Thập Tự: ST 17 → 24 · tốc 1.0 → 1.5 · MỚI: lửa cho tốc bắn trần mềm +200% × n / (n + 60) (10 lửa +29%, 60 lửa +100%, 260 lửa +162%) — `tocLua`, `TOC_MAX`, `TOC_K`. Luật truyền lửa giữ nguyên.
- Hợp Xướng: ST 15 → 24 · tốc 1.0 → 2.0 · mỗi Hoà âm +25% → +35% ST · mục tiêu thứ 2 50% → 80%.
- Kho Lưu Hợp Nhất: ST 15 → 24 · tốc 1.0 → 2.0 · mỗi điểm +1% → +2% ST (mốc giữ nguyên).
- Mạch Máu: ST 17 → 22 · tốc 0.9 → 1.3 · nova máu từ 20 Máu mỗi phát thứ 10 (50/100/200 Máu: 6/5/4; trước chỉ từ 100 Máu: 6, 200: 4).
- Siêu Trộm Lăng Kính: ST 15 → 24 · tốc 1 → 2 · tỉ lệ màu đơn 4/6/8/10% → 8/10/12/15% (luật hợp thể theo ô đích giữ nguyên).
- Bot chơi tốt (24 hạt) trước → sau: nhatthuc/lualien/hopca/dongbo/vughep 31.2 → 43.4 · luutru/mauhut/bienmau/dongbo/vughep 24.6 → 44.8 (trung vị 38; Máu không trần nên có ván chạy tới 70). Ụ tấn công duy nhất (+ lien, phun, dongbo, vughep; mốc Aten 29.8, Sói 33.2): Nhật Thực 24.4 → 34.2, Mạch Máu 22.9 → ~35, Lửa Thập Tự 17.8 → 27.2, Hợp Xướng 20.8 → 27.5, Kho Lưu 17.9 → 27.0, Lăng Kính 18.7 → 25.2 (bot không vuốt hợp thể / xếp Hoà âm).
- Test `tools/thap-kt-vang-g2.js`: cập nhật kỳ vọng số (Hoà âm, điểm Kho Lưu); còn 1 lỗi CÓ SẴN trước đợt này (Ember kéo vào Wild Link).

## claude/demo-hop-tuong — Rà TỐC BẮN mọi ụ Tấn công: đổi ST mỗi phát sang tốc bắn cho ụ quá chậm (09/11)
- Người dùng: "bắn không thấy dame đâu vì tốc bắn quá chậm". Bảng đo đủ 45 ụ Tấn công (khoảng bắn 1★/4★/7★, số mục tiêu, DPS w30/w40): `docs/demo-hop-tuong/tuvan/tocban/BANG-TOC-BAN.md`.
- Ụ chậm > 1.2 s ở 7★ đã đổi (DPS gần như giữ nguyên, không đổi cơ chế):
  - Sniper (tia): tốc 0.35 → 0.47, ST 69.6 → 51.8 (7★: 2.0 s → 1.43 s; giữ bản sắc bắn tỉa chậm).
  - Ice Blade (kiembang): tốc 0.75 → 1.1, ST 16.8 → 11.45 (1.36 s → 0.91 s).
  - Mortar: tốc 0.4 → 0.56, ST 27.5 → 19.6 (7★: 1.67 s → 1.2 s).
  - Purifier (aten): tốc 0.65 → 1.0, ST 36 → 23.4 (1.58 s → 1.0 s).
  - Salvo Battery (railgun): tốc 0.33 → 0.5, ST 70 → 46.2 (7★: 2.5 s → 1.67 s).
  - Sói Máy: nghỉ 1.8 s → 1.2 s, loạt thức tỉnh 1.2 s → 0.8 s, ST 58 → 38.7.
  - Overlord: giữ nạp sấm nhưng rút ngắn (7 − 0.5/★) → (5.6 − 0.4/★) s, ST 28 → 22.4 (7★: 3.75 s → 2.73 s).
- Giữ nguyên (chu kỳ là cơ chế): Mìn (min), Máy Tạo Tường (wallgen), Chúa Tổ (bầy drone), Hố Đen. Revolver (sungluc 1.11 s) dưới ngưỡng.
- Bot chơi tốt 12 hạt, trước → sau (bỏ các ván bot chỉ gọi ra ụ Hỗ trợ và thua ở wave 2): Đỏ blackhole 55.0 → 58.2 · Đỏ ronglua/leviathan/overlord 69.9 → 68.8 · Vàng canon/aten/railgun 43.3 → 43.2 · soi/nemesis/ngoisao 38.0 → 37.2 · Xanh kiembang… 16.1 → 17.8 · Trắng lien/tia/set/mortar 23.6 → 22.3.

## claude/demo-hop-tuong — rà độ hợp lý + độ mượt hình 95 ụ (09/11, chỉ ghi chú, không đổi code)
- Logic: dump `SKILLS[id]` + `mo()` của 95 ụ trong ROSTER (Playwright 390×844) so với chữ kỹ năng hiển thị (`text.js` TEXT.turret) — khớp. Ụ Hỗ trợ đều `dmg 0`, không bắn; cờ `chiTC` khớp chữ "ụ Tấn công kề" (Phá Giáp, Búa, Bộ Trộn, Khuếch Đại, Đồng Bộ, Hạ Sao, Cầu Vồng, Lò Băng, Thánh Địa); ụ chỉ có tác dụng PVP/co-op đều có nhánh Solo (Kẹp Phá, Xáo Trộn, Nhiễu Sóng, Nguyền Rủa, Cổng Gương, Hạ Sao). Hào Quang Thánh = thẻ đã bỏ (THE_BO), không sinh được — bình thường.
- Chữ CŨ chỉ còn ở bản dự phòng `ROSTER_EMBED` (meta.js) / `kyNang_vi` của roster.json (dùng khi fetch roster lỗi + ô tìm bộ bài): Máy Tẩy Lỗi / Máy Khiên / Bệ Nâng Sao vẫn ghi "Khi GHÉP …" (code: định kỳ / hỗ trợ tốc), Ăng-ten 9→30% (thật 6,8→22,5%), Radar 18→42% (thật 20→46%), Phá Giáp +22% (thật +13→31%). Chưa sửa vì agent cân bằng đang sửa meta.js/roster.json — sửa cùng lượt đó.
- Lệch nguyên tắc cần người dùng chốt: Ember + Ember ra Ember → `game.js` đặt 0 lửa (người dùng 08/11) nhưng NGUYEN-TAC (09/11, NT2/NT8 "cộng dồn riêng ụ = số lúc sinh"), `mo()` ("new Relays start with flames = ★") và `tools/thap-kt-nguyen-tac.js` (đang ✗ 1/52) kỳ vọng lửa = ★.
- Thiết kế cần chốt: chiêu chủ động tốn mana không đồng đều — Hố Đen / Lõi Khởi Sinh 30 mana, Hydra 40 nhân đôi; Chúa Tổ, Thuỷ Quái, Rồng Máy, Ngai Thời Gian, Lò Băng miễn phí (chỉ nạp). Lò Băng không khoá 3★ như các ụ Đỏ khác.
- Hình: đặt đủ 95 ụ ở 1★/4★/7★ (7 bàn × 3 mức), quái chạy liên tục 5 s/bàn; đo góc đầu súng mỗi khung (chuẩn hoá 60 khung/s): không ụ nào nhảy góc (lò xo xoayDau ≤ ~0,6 rad/khung, chỉ lúc đổi mục tiêu); huy hiệu sao 1–7 đúng ảnh, không che nhãn; không thấy ảnh vỡ/lệch tâm. Đuôi sao chổi lòi khỏi ô Cầu Vồng là đạn `fx_cauvong_dan`, không phải đầu ụ.
- FPS (headless Chromium, raster phần mềm — chỉ để so tương đối): bàn đầy 15 ụ khác nhau 30–60 fps; thấp nhất bàn Đỏ/Tím-mới (Hố Đen…Thấu Kính) ~30–39. 15 bản cùng loại: Lò Băng 21, Ngai Thời Gian 23, Pandora 28, Nhật Thực 31 (các ụ khác 50–60). Cần đo lại trên máy thật trước khi tối ưu.
- (09/11, tiếp) Đã sửa mô tả cũ ở `ROSTER_EMBED` (meta.js) + roster.json: Tẩy Lỗi / Khiên / Nâng Sao (định kỳ, không còn "Khi GHÉP"), Ăng-ten 6,8→22,5%, Radar 20→46%, Phá Giáp +13→31%, thêm nhánh Solo cho Kẹp Phá / Xáo Trộn / Nhiễu Sóng / Nguyền Rủa. Ember + Ember → Ember MỚI 0 lửa là quyết định người dùng: NGUYEN-TAC.md (NT8 + đoạn ghép thường), `mo()` Ember (+ vi.json / ngonngu-vi.js), chú thích vangmoi1.js và `tools/thap-kt-nguyen-tac.js` đã khớp 0 lửa (52/52 đạt).

## claude/demo-hop-tuong — Tăng trưởng theo sao mới + máu quái 3 đoạn + Súng Bão (tư vấn ChatGPT, người dùng duyệt 10/11)
- (A) Ụ Tấn công bắn thường: ST theo sao 1 + 0.85/★ → 1 + 0.50/★ (7★ ×6.1 → ×4); tốc bắn +10.5 điểm %/★ cộng vào nhóm tốc cùng mốc 3★ +20% (7★ ×1.2 → ×1.83) → DPS 7★ giữ ~×9.5, bắn dồn dập hơn (`data.js`: `heSaoST`, `heSaoToc`, `SAO_CU`; dùng trong `dmgU`, `hsU`, `statThuc`, `mocBuf`). tocSao riêng (Liên Thanh, Súng Phun, Súng Bão…) vẫn nhân thêm. Giữ hệ số cũ: Rồng Máy, Thuỷ Quái (người dùng chốt) + Máy Tạo Tường, Chúa Tổ, Mìn, Hố Đen (chu kỳ là cơ chế). Bảng chỉ số thực có dòng "+X% tốc · tốc theo sao". Các chỉnh tốc riêng 09/11 (cda4d7b1/fab1cb73) chỉ đổi giá trị gốc nên không cộng trùng (DPS 7★ đo lại ±15%, xem `docs/demo-hop-tuong/tuvan/tocban/BANG-TOC-BAN.md`). Lưu ý: 3–5★ DPS thấp hơn ~10%; ụ có buff tốc lớn tự có (Lone Ace, Súng Cuồng Nộ) giảm ~20% DPS 7★ do cộng gộp.
- (B) Máu quái Solo/Co-op: ×1.15 tới wave 25, ×1.12 wave 26–40, ×1.08 từ wave 41 (wave 50: 40.4k → 28.6k, wave 60: 123k → 60.2k). Hậu kỳ Vàng/Đỏ: tuyến tính tới wave 40 (×1.70 / ×1.80), sau đó ×1.02 / ×1.023 mỗi wave. PVP giữ nguyên.
- (C) Súng Bão: bỏ phạt −15% tốc/ụ kề cùng loại; mỗi Súng Bão kề +5 điểm % nảy (gốc 20%). (Nảy vẫn dùng Math.random như cũ — ghi nhận, chưa đổi.)
- Bot chơi tốt 12 hạt (bỏ ván thua wave 2) trước → sau: Đỏ blackhole 58.2 → 63.7 · Rồng/Thuỷ Quái 68.8 → 70.0 (chạm trần 70) · Vàng canon 43.2 → 45.2 · soi 37.2 → 37.4 · nhatthuc 41.6 → 46.3 · luutru 48.6 → 50.7 · Tím cuongno 35.2 → 34.3 · Xanh 17.8 → 17.2 · Trắng 22.3 → 22.4.
- Test `tools/thap-kt-vang-g2.js`: kỳ vọng tốc trừ phần tốc theo sao; còn 1 lỗi có sẵn (Ember kéo vào Wild Link). `thap-kt-kynang-tim.js` cập nhật công thức sao (tool vốn đã lỗi khi chạy, trước và sau như nhau).

## claude/demo-hop-tuong — RNG có hạt cho xác suất trong kỹ năng (10/11)
- Đổi Math.random → `rngLuat(B, muối, ô)` (tất định online): Súng Bão nảy (31), Xúc Xắc chí mạng + cuộn 3–300% (37), Máy Chém giết ngay (41), Mìn chọn chỗ + mìn sao (43), Cửu Vĩ thêm đuôi 5★ (47).
- Còn Math.random trong luật (chưa sửa — đụng lõi): chí mạng chung `trung()` (game.js), và `pick/rnd/rint` (Math.random) khi chọn mục tiêu ngẫu nhiên (`quaiNgauNhien`, Mortar…) trong skills*.js.

## claude/demo-hop-tuong — HOME: xem thông tin 12 TRÙM (09/11)
- Người dùng: "không có phần xem thông tin về boss ở màn hình bên ngoài". Trước đây chỉ có băng giới thiệu trùm trong trận (vaotran.js) — không có màn ngoài nào (kể cả ẩn).
- HOME: nút thứ 3 **BOSSES / TRÙM** cạnh DECK · COLLECTION (hàng .hm-tab 3 cột). Chạm → bảng trượt (HM.mo) danh sách 12 trùm theo TRUM_POOL: chân dung `trum_<id>_portrait.png`, tên Anh (+ tên Việt khi chọn Tiếng Việt), tên chiêu + mô tả (TRUM.kn/mo — chữ thật của code), "FROM WAVE N" (trumTuWave) và máu ở wave đó.
- Chạm 1 trùm → chi tiết: chiêu (CHỦ ĐỘNG / BỊ ĐỘNG / KHI BỊ HẠ) + nhịp tung chiêu max(6, 10 − wave/15) s, báo 1.4 s; xuất hiện (Solo & PvP ngẫu nhiên từ wave N; Co-op thứ tự cố định wave 10–50); máu ở wave N/30/50/70 theo công thức sinhTrum (mauWave × 30 × (1 + w/35) × hệ số TRUM_MOI.hp, không tính PvP đột tử); mọi trùm: lọt −2 mạng, hạ = mana ×12. Nút ALL BOSSES quay lại.
- "Chưa gặp": kỷ lục wave (TK.ho / tm_hoso / KT tk.wave) < wave xuất hiện → chân dung mờ + "REACH WAVE N" (vẫn đọc được).
- File: `thap/js/trumxem.js`, `thap/css/trumxem.css` (chỉ tấm/nút PNG có sẵn), index.html nạp 2 file; 17 khoá dịch mới trong vi.json → ngonngu-vi.js. Act `tx-*` (home.js nuốt act `hm-*` lạ).

## claude/demo-hop-tuong — Nguồn mảnh thẻ VÀNG / ĐỎ mới, Đỏ hiếm hơn (09/11)
- Người dùng: "các cơ chế kiếm thêm mảnh ụ Vàng, Đỏ — Đỏ sẽ khó kiếm hơn". Mã mới `thap/js/manh.js` + `thap/css/manh.css` (bọc kinhte.js / kinhte-ui.js / thebai-ui.js, không đổi luật cũ). Bảng số: `docs/demo-hop-tuong/tuvan/shop/KINH-TE.md` §7.
- **Mốc wave SOLO lần đầu** (kỷ lục Solo): w20 1 Vàng · w30 2 Vàng · w40 3 Vàng · w50 3 Vàng + 1 Đỏ · w60 4 Vàng + 1 Đỏ · w70 5 Vàng + 2 Đỏ (tổng 18 Vàng / 4 Đỏ). Co-op/PVP/online không tính.
- **Hạ trùm lần đầu**: mỗi trùm (12) = 1 bản Vàng; hạ đủ 12 trùm = 1 bản Đỏ (mọi chế độ, chỉ trùm bàn mình hạ).
- **Nhiệm vụ ngày mới** "Reach wave 30" = 1 bản Vàng (vào bể chọn 3 nhiệm vụ/ngày; danh sách hôm nay giữ nguyên).
- **Lò rèn mảnh** (SHOP, dưới CHESTS): 30 bản của 1 thẻ Sử thi + 2 000 vàng → 1 bản Vàng ngẫu nhiên (3 lần/tuần) · 10 bản của 1 thẻ Vàng + 10 000 vàng → 1 bản Đỏ ngẫu nhiên (1 lần/tuần). Chạm ĐỔI → bảng chọn thẻ nguồn.
- Hết trận tự nhận mốc/trùm mới mở; màn kết quả thêm thẻ nhận được vào ô REWARDS + dòng "SOLO WAVE 30/40 · FIRST KILL". Tab QUESTS có mục LEGENDARY & MYTHIC (mốc, lưới 12 chân dung trùm, nút NHẬN cho phần chưa nhận). Trang ụ Vàng/Đỏ có dòng "WHERE TO GET".
- Lưu `turret_kt.mh` (khoá mới; bản cũ: kỷ lục Solo trong `turret_best` mở mốc nhận được ngay, không mất gì). Gộp hồ sơ Firebase: cờ OR, kỷ lục lớn nhất. Thẻ ngẫu nhiên chọn bằng `KT.cho` (hạt giống mã người chơi + khoá + bộ đếm lưu) rồi lưu ngay → tải lại không đổi.
- Kiểm: `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-manh.js` (mới) + `tools/thap-kt-shop.js` XANH; chữ Việt qua vi.json.

## claude/demo-hop-tuong — Ụ ĐỎ MỚI ARCANE CASCADE / Thác Mana (`thacmana`): bắn nảy mạnh theo MANA đang có (09/11)
- Người dùng: tướng Đỏ bắn lan, mana càng nhiều sát thương càng cao, qua ngưỡng mana thì lan nhiều quái hơn (giữ mana dư late game là để ụ này có ý nghĩa; không sát thương tràn). Không đụng Pháo Năng Lượng (nangluong, Xanh, đơn mục tiêu).
- Code riêng `thap/js/thacmana.js` (nạp sau jackpot.js); chèn tối thiểu: roster.json + meta.js (ROSTER_EMBED, ART_META), text.js, index.html, artscale.js (số cỡ chép Tesla), anim-meta.js (nhóm chain), online/dongbo.js (cờ ô `U` thời gian thác ×100, `V` mana đã xả), skilldemo.js (clip + khoá chiêu 3★), vi.json → ngonngu-vi.js. Họ MANA bậc 5 (ô trống "new idea needed"), bể triệu hồi Đỏ tự lấy từ roster.
- Vai Tấn công, ST gốc 13, 1 phát/s, nhắm quái đầu; quả cầu nảy sang quái gần nhất (≤ 125 px, thứ tự tất định khoảng cách → uid), mỗi lần nảy −10% (sàn 50%).
- Sát thương × k(M) = 1 + 0.5 × √(M/100), M = mana đang có (nhân ngoài dmgU → đã gồm hệ số bậc Đỏ 2.7, sao, power-up, heHauKy): 100 ×1.5 · 400 ×2 · 1000 ×2.58 · 2500 ×3.5 · 4000 ×4.16 · 10000 ×6 — không trần.
- Ngưỡng nảy: <100: 1 quái · 100: 2 · 300: 3 · 600: 4 · 1000: 5 · 2000: 6 · 4000: 8 · sau đó +1 mỗi lần gấp đôi (8000: 9, 16000: 10…).
- Chủ động MANA FLOOD (3★+, hồi 30 s, chạm): xả 20% mana (tối thiểu 50; thiếu thì không dùng/không trừ) → 4 s, mỗi 0.5 s một làn thác đánh MỌI quái trên đường × 0.8 × k(mana còn + mana đã xả) + 50% tốc bắn. Sau chiêu k chỉ giảm ~10%. Để đầy: chỉ tự xả khi có trùm; AI xả khi có trùm hoặc ≥ 6 quái và ≥ 300 mana. 5★/7★ dùng mốc chung (DOUBLE TAP / APEX).
- Bot "chơi tốt" (`/tmp/simcb/do.js` + post.js: cấp thẻ 8, ưu tiên power-up; đo trên bản đã có đợt tăng trưởng sao mới d97e68ec; bỏ ván bot chỉ gọi ra ụ Hỗ trợ thua wave 2): thacmana/overlord/chuato/lophanung/haoquang **64.1** (20 ván; ST 15 → 67.0 nên hạ còn 13) · cùng bộ thay Hố Đen 63.8 · bộ Rồng ronglua/leviathan/overlord/lophanung/khoisinh 70 (chạm wave 70 mọi ván) · với bộ Vàng aten/railgun/dongbo/vughep (24 ván): Thác Mana 50.2 · Hố Đen 48.6 · Rồng 57.7 · Thuỷ Quái 58.5. Bot giữ 1–15k mana khi bàn đầy.
- Hình TẠM (đổi màu ảnh Tesla sang tím/xanh lơ mana): `thacmana_de/_nong/_phu/_vien`, `nho/thacmana`, `glyph/thacmana`; chưa có chân dung/hero (code dùng icon thay). Prompt cần sinh: `docs/demo-hop-tuong/tuvan/thac-mana/PROMPT.md`. Ảnh chụp 390×844 (bắn nảy + MANA FLOOD): `docs/demo-hop-tuong/tuvan/thac-mana/ban-lan-va-thac.jpg`.
- Test: `node tools/thap-kt-thac-mana.js` (32/32: bảng k/ngưỡng, chuỗi nảy tất định, ST tỉ lệ k(M), chiêu xả 20% đánh mọi quái, khoá 3★, thiếu mana, cờ online, không Math.random). Các tool test/mô phỏng nạp thêm `thacmana` vào danh sách tệp.

## claude/demo-hop-tuong — Quái tinh anh / quái to: hoạt ảnh bằng code như trùm (09/11)
- Người dùng: "animation quái tinh anh cũng bị giống các boss". Soát: dải đi `quai_khong_lo_8` / `quai_que_tach_8` / `quai_tach_8` gen từng khung → đá/rêu/lõi đổi hình giữa các khung ("sôi"), sỏi văng lúc có lúc không, thân thạch nảy lệch 13–25% ô theo khung; quả cầu đá (cỡ 70) ở làn sát mép (x≈27) bị mép canvas cắt nửa.
- Sửa (`thap/js/quaianim.js`, `QUAI_ANIM_CODE`, tái dùng nguyên bộ `cdTinh`/`cdVe` của trùm): 1 ảnh gốc `quai_<id>_m.png` (cắt 1 khung dải đi bằng `tools/thap-quai-master.py`, không gen ảnh mới; quả cầu bỏ sỏi rời + dời tâm) → KHÔNG LỚN (khong_lo) lăn theo quãng đường, bóng sáng/tối cố định; QUÉ TÁCH / TÁCH / NHỎ nhảy thạch (nén–giãn neo đáy, nảy thấp, nhịp theo giờ + quãng đường); nghiêng nhẹ khi rẽ; trúng đòn chớp trắng + nén; bị đóng băng/choáng thì khựng tại chỗ; chết nổ từ ảnh đang thấy (dùng bộ đệm, không dựng canvas).
- Chèn mép (`trumLech`) áp cho cả tinh anh (`E.d.to`) và quái code; thanh máu đi theo thân đã chèn. Chỉ hình — mô phỏng/hitbox không đổi. `?quaianim=0` → dải khung cũ để so sánh.
- Hiệu năng: quái lăn không vẽ qua canvas tạm mỗi khung (thân quay thẳng trên ctx + 1 canvas bóng dựng 1 lần/cỡ). Đo 390×844 DPR3, 77 quái (21 tinh anh), mô phỏng+vẽ: trước 1.18 ms/khung → sau 1.10 ms/khung.

## claude/demo-hop-tuong — P0: bảo đảm ụ Tấn công khi triệu hồi + RNG luật có hạt (11/11)
- **Triệu hồi** (`trieu()` game.js — dùng chung SOLO / CO-OP / PVP / online, chỉ huy, kỹ năng gọi ụ): trên bàn có **< 2 ụ vai 'tc'** → chỉ bốc trong các ụ Tấn công của bộ (bộ không có ụ 'tc' thì bốc đều cả bộ) — đúng chữ nút SUMMON. Vẫn 1 luồng `rngLuat(B, 13)`, thứ tự quay (ô → loại) giữ nguyên; online gói 'tr' mang đúng ô/loại như cũ. Kết quả GHÉP / Twin Maker vẫn đều ngẫu nhiên trong bộ.
- **Bỏ Math.random khỏi luật** → `rngLuat` (muối mới, bộ đếm riêng nên không lệch luồng cũ): Reaper Pillar giết ngay (61), Mirror Gate kháng khống chế (67), chí mạng chung trong `trung()` (53), mục tiêu ngẫu nhiên Scatter/Mortar `quaiNgauNhien(B, T)` (59), góc 3 quả chùm Mortar (73), Orbital chọn quái (71), Time Bomb chọn quái (79).
- Còn Math.random (chỉ hình hoặc nhỏ): lệch x `rnd(-8, 8)` bom Orbital / giáo dự phòng, `quaiNgauNhien(B)` của giáo dự phòng Orbital (không T → muối 59 ô 0, đã tất định).
- Kiểm: deck 1 Tấn công + 4 Hỗ trợ, 8 hạt → 2 lần triệu hồi đầu luôn ra ụ Tấn công (trước: 8/8 hạt trượt); cùng G.hat khác Math.random → cùng chuỗi; bot 240 s lên wave 4 (trước wave 2). thap-kt-nguyen-tac 53✓, thap-kt-ngau-nhien-sinh 63✓, thap-kt-cong-huong-luat 35✗ có sẵn y hệt bản gốc, thap-kt-ngoai-deck 3✓ + fuzz 2200/3000 không ✗ (dừng vì hết giờ 300 s), thap-kt-khong-ban 26✓.
