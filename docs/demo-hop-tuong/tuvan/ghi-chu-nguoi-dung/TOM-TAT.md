# TÓM TẮT — ý người dùng → ChatGPT tinh chỉnh → câu hỏi → ảnh (07–08/11/2026)

Nguồn: [`GHI-CHU.md`](GHI-CHU.md) (ghi chú gốc), [`CHATGPT.md`](CHATGPT.md) (hội thoại), [`CHATGPT-SPEC.md`](CHATGPT-SPEC.md) (đặc tả đầy đủ: bảng tương tác B1–B5, ca test số B5).
**Chưa làm cơ chế trong code** — chờ người dùng duyệt. Số dưới đây là ĐỀ XUẤT ở LV9 (D = sát thương gốc của ụ).
Lưu ý: mục A2 của ChatGPT (ụ không có ghi chú) lúc đầu tự bịa luật vì brief không có luật hiện tại — lượt 2 đã sửa: **giữ nguyên luật đang có**, chỉ áp bảng cấp thẻ.

## Chung

| Việc | Ý người dùng | ChatGPT chốt |
|---|---|---|
| Cấp thẻ 10–17 (Vàng/Đỏ) | Tấn công +ST +tốc; Hỗ trợ +% cơ chế; Khống chế +% buff/kháng | Mỗi cấp trên 9: Tấn công **+5% ST, +2% tốc** (LV17 +40% / +16%); Hỗ trợ **+4%** giá trị cơ chế (LV17 +32%); Khống chế/kháng **+3%** (LV17 +24%); Đặc biệt **+3%**. Cộng vào cùng nhóm, không nhân kép; không tăng số mục tiêu/tỉ lệ kích hoạt trừ khi ghi riêng |
| Huy hiệu sao | Vẽ 1…6 ngôi sao, 7 = 1 sao to hẳn | Đồng ý; 1–4 sao 1 hàng, 5 = 3+2, 6 = 3+3 (2 hàng), 7 = 1 sao to đỏ ruby viền vàng; không ghi số. Ảnh đã vẽ (4★ đang là cụm 2×2 — nếu muốn 1 hàng thì xếp lại bằng code hoặc vẽ lại) |
| Bất biến | — | Phân biệt rõ **ghép thật** / biến hình / tăng sao: chỉ ghép thật mới tính Archive, Compass…; RNG có hạt giống, 1 lần quay cho mỗi quyết định; vuốt gửi danh sách ô, không theo pixel |

## Tướng Vàng

| # | Ụ | Ý người dùng (tóm) | ChatGPT tinh chỉnh (số) | Cần người dùng quyết | Ảnh |
|---|---|---|---|---|---|
| 1 | Pháo La Bàn | Hướng random khó lên; làm sao chọn hướng có ý nghĩa | Hướng N/E/S/W = 4 đoạn đường đi (0–25/25–50/50–75/75–100% quãng đường); bắn đoạn của mình +30% ST, +25% ST chí mạng; chạm huy hiệu xoay 90° giá **15 mana**, 1 lần/20 s; số: cùng hướng = a+b+1 (trần 40), vuông góc = max+1, ngược = |a−b| + sóng nổ 2.0D; +12% ST/số; đột phá 4/8/16/32; TRUE NORTH 3 lần ghép cùng hướng/45 s → +110% ST 15 s. **Phương án A:** Compass+Compass luôn ra Compass. **Phương án B (nếu giữ kết quả ngẫu nhiên):** "Dấu hướng" — ô đích giữ dấu 30 s, ụ nào đứng đó +40% ST vào đoạn đường của hướng | A (luôn ra Compass) hay B (dấu hướng)? 15 mana xoay có hợp lý? | chưa vẽ (dùng ảnh hiện có + mũi tên code) |
| 2 | Lửa Thập Tự | Ghép 2 Relay cộng lửa, tổng cho mọi Relay cùng hàng+cột; mốc 10/30/50/70; trần 70→100→130 theo thẻ 11/13/15; icon lửa trắng/xanh/vàng/đỏ | Tổng = min(trần, lửaA+lửaB) của 2 ụ bị ghép; mọi Relay còn trên hàng/cột ô đích: lửa = **max(cũ, tổng)** (không cộng dồn, không lan tiếp); không còn Relay nào thì mất. **+2% ST và +0.12 điểm % chí mạng mỗi lửa**; trần LV9 **50**, LV11 70, LV13 100, LV15 130. Icon: <10 cam, ≥10 trắng, ≥30 xanh, ≥50 vàng, ≥70 đỏ | Trần LV9 = 50 (đề xuất) hay 70 (→100/130/160)? | **lua_bac1–4** (trắng/xanh/vàng/đỏ) |
| 3 | Hợp Xướng Lượng Tử | Bỏ hoặc làm hay hơn | Đổi thành **Harmonic Choir**: mỗi ụ kề 4 hướng CÙNG SAO = 1 Harmony (tối đa 4), mỗi cái +25% ST +8% ST chí mạng; 2 = bắn thêm mục tiêu thứ 2 (50%); 3 = +30% tốc; 4 = +50% ST chí mạng + đòn vang 1.5D mỗi loạt thứ 3; 7★ +25% tốc; ô đá không tính | Giữ bản "kề cùng sao" hay xoá thẻ? | chưa vẽ |
| 4 | Kho Lưu Hợp Nhất | Mỗi lần ghép bất kỳ +1 stack vào 1 Archive ngẫu nhiên (bay vào); không có Archive thì mất; Merge King không tính; mốc 10/20/30/40; trần 40 LV9, +10 ở thẻ 11/13/15 | Đúng ý; chọn Archive sau khi ghép xong; bỏ 3 xung cũ. +1% ST/stack; 10 = +15% tốc, 20 = +8 điểm % chí mạng, 30 = +25% ST, 40 = +40% ST chí mạng, 50/60/70 = thêm +20/+30/+40% ST; trần 40/50/60/70 | Đồng ý bỏ "Archive+Archive 3 xung"? | **raw_gc_luutru_bay** (viên bay, vệt, nổ chạm, pip stack) |
| 5 | Lò Rèn Phế Liệu → **Twin Anvil** | Làm lại: 2 dạng ST/tốc ngẫu nhiên; chỉ ghép cùng dạng (khác sao vẫn được); tổng stack, tỉ lệ thành công (1−(tổng−1)/14); max 14; buff mọi ụ; thẻ tăng tỉ lệ cho tổng 8–14 | Stack ban đầu = sao; tỉ lệ = 100×(1−(tổng−1)/14) **+4 điểm %/cấp trên 9 chỉ khi tổng ≥8** (14 stack: 7.14% LV9 → 39.14% LV17). Thành công: giữ ụ đích, sao = max 2 ụ (không +1★). **Thất bại: mất ụ kéo, ụ đích giữ stack lớn hơn**, không tăng sao. Cả 2 đều tính 1 lần ghép cho Archive. Kéo Anvil lên ụ khác: Anvil mất, ụ nhận **+3% ST/stack** hoặc **+2% tốc/stack** (×1+0.03/cấp; LV17 14 stack = +52% ST / +34.7% tốc); mỗi ụ tối đa 1 buff mỗi dạng (mới mạnh hơn mới thay); buff theo ụ con khi ụ đó ghép (lấy max, không cộng); giữ khi băng/hạ sao, tạm tắt khi hoá đá; không tính Archive | +4 điểm %/cấp (thay 10)? Thất bại mất ụ cho? 1 ụ được mang cả 2 dạng buff? Tên mới "Twin Anvil"? | **raw_gc_forge_dmg**, **raw_gc_forge_toc** (2×2) |
| 6 | Vệ Tinh | — (jackpot ORBITAL CASCADE) | Giữ luật cũ (Đặc biệt, không bắn); ghép lúc đang thức tỉnh → Cascade +100% ST + mưa bom, làm mới không cộng | — | — |
| 7 | Siêu Trộm Lăng Kính | 4 màu ngẫu nhiên (đỏ giết ngay/vàng tiền/lam băng/lục ST chí mạng), stack ≤10 tăng theo thẻ; 4 màu kề nhau → vuốt nối | Trần stack 10/12/14/16/18 (LV9/11/13/15/17); mỗi ụ hồi kích hoạt 1 s/mục tiêu. ĐỎ 4% giết ngay quái thường (+1 đầu lâu = +2% ST vào quái thường); VÀNG 6% +2 mana (trần cả đội **6 mana/s**), +1% ST/stack; LAM 8% đóng băng 1.0 s (+0.06 s/stack, tinh anh/trùm miễn); LỤC 10% đòn đó +40% ST chí mạng, +5% ST chí mạng vĩnh viễn/stack. **CHROMATIC CIRCUIT**: 4 ụ 4 màu ở 4 ô liền nhau, vuốt 1 đường qua đủ 4 ô (không chéo, không lặp) — hoặc chạm lần lượt 4 ụ (cho hình chữ T); hồi **25 s** cả đội; mỗi ụ tiêu ≤3 stack của mình (+5%/stack, tối đa ×1.6); **màu cuối quyết định đòn kết**: Đỏ +70% ST quái thường/+25% tinh anh 6 s; Vàng +8+2×stack mana (≤18); Lam băng 6 quái 1.5 s + choáng 2 tinh anh 0.3 s; Lục +70% ST chí mạng +10 điểm % chí mạng 6 s. Không tính là ghép | Cho phép chạm 4 ụ thay vuốt (hình T)? Màu cuối = đòn kết, hồi 25 s? | **raw_gc_prism4** + cắt **bienmau_do/vang/lam/luc** |
| 8 | Mạch Máu | Vamp ăn dần ụ bị kéo tới, thời gian theo sao; chỉ đánh dấu, 2 ụ vẫn chạy; xong cho máu — máu dùng gì? | Đánh dấu 1 ụ cùng bàn (không phải đá / Mạch Máu khác); thời gian **5 + 3×sao** giây (1★ 8 s, 7★ 26 s); mục tiêu +1★ → +3 s, −1★ → −3 s (≥1 s còn lại); mục tiêu chết/ghép/bị xáo/hoá đá → huỷ hoặc dừng. Xong: nuốt mục tiêu, nhận **5×sao Máu** (không trần, riêng ụ). Dùng Máu: chạm Mạch Máu rồi 1 ụ Tấn công kề → tiêu **10 Máu**: **Blood Rite +30% ST +15% tốc 20 s** (1 buff/lúc, làm mới không cộng) | Cho nuốt ụ 7★? Cho nuốt Trứng/Anvil/Genesis/Hỗ trợ? | chưa vẽ |
| 9 | Hộp Pandora | — (SIX SEALS) | Giữ 6 hiệu ứng cũ; mỗi lần ghép Pandora thứ 6 → ROYAL VAULT: ụ Tấn công mạnh nhất +220% ST 12 s | — | — |
| 10 | Railgun → **Salvo Battery** | Railgun không hợp tốc đánh; đổi tên + hình | Tên chọn **Salvo Battery** (khác: Volley Cannon, Storm Battery; "Gatling Array" trùng ụ Gatling). Giữ bingo: hàng 5/5 +200% ST, cột 3/3 +150% tốc; thêm thưởng dở dang **hàng 3/5 +25%, 4/5 +65% ST; cột 2/3 +35% tốc**; ô băng vẫn tính, ô đá phá chuỗi | Đồng ý tên? Có thưởng dở dang không? | **raw_gc_salvo** (2×2: 4 nòng + trống đạn) |
| 11–12 | Vua Ghép, Máy Sinh Đôi | — | Giữ luật cũ; Vua Ghép tăng sao **không phải ghép** (không tính Archive); Sinh Đôi: 1 lần ghép thật + 1 ụ triệu hồi thêm (không tính ghép) | — | — |
| 13 | Máy Sao Chép | "Chưa chép được ụ đá — check" | Luật: chép là **biến hình, không phải ghép**; bản chép từ ụ đá: đề xuất bản chép giữ trạng thái đá, chỉ hồi loại thật khi được tẩy; không chép stack/bộ đếm/buff Anvil. Code hiện tại (game.js `ghepDBHop` + saochep `quaKhoa: true`) về logic CHO PHÉP chép ô đá → lỗi nằm ở chỗ khác (thao tác kéo/kiểm tra ô đích), cần tái hiện ở phase sau | Bản chép từ ô đá: là ụ THƯỜNG (như code đang định) hay vẫn là ĐÁ (ChatGPT)? | — |
| 14 | Hộp Tiến Hoá → **Trứng** | Bỏ bom, thành trứng nở dần; 6→7 vẫn là trứng thì trứng cháy 7★ | 1–5★ nở sau **10 + 2×sao** giây (1★ 12 s … 5★ 20 s) thành ụ ngẫu nhiên +1★ (biến hình, không tính ghép); 6★ sau **22 s** thành **trứng cháy 7★** (không bắn, không nở, Vua Ghép/Sao Chép không cứu); đề xuất **giữ 2 s để tái chế trứng cháy lấy +20 mana**; băng/đá dừng đồng hồ; cấp thẻ rút thời gian ÷(1+0.03/cấp) | Cho tái chế trứng cháy +20 mana? | **raw_gc_trung** + cắt **trung_1/2/3/no/chay7/vo** |
| 15 | Xưởng Anh Hùng | 12 s yếu thì bỏ | Làm mạnh: ô đích thành Ô ANH HÙNG **25 s**, ụ trên ô **+80% tốc +30% ST chí mạng**; 1 ô/bàn; không thì xoá thẻ | Giữ bản 25 s hay xoá? | — |
| 16–18 | Kẻ Nguyền, Rối Máy, Dựng Tường | — | Giữ luật cũ + bảng cấp thẻ | — | — |
| 19 | Sói Máy | Làm lại hình + hiệu ứng: thường 1 nòng chậm; thức tỉnh há mồm 3 nòng, luôn chí mạng, tốc mạnh | Tỉ lệ thức tỉnh 30% +1 điểm %/cấp (LV17 38%), quay 1 lần lúc sinh. Thường: **1.0D mỗi 1.8 s**. Thức tỉnh: **3 viên × 0.5D** cách 0.1 s, loạt mỗi **1.2 s**, luôn chí mạng (≈2.25× DPS bản thường, chưa tính chí mạng). Chuyển từ cận chiến sang bắn | Tỉ lệ +1 điểm %/cấp hay chỉ ở vài cấp? | **raw_gc_soi_thuong**, **raw_gc_soi_thuctinh** (2×2; mặt sói nhìn thẳng như ảnh cũ — code cần xoay/đặt đúng hướng) |
| 20 | Hydra | Số đầu = sao; nhiều sao bắn liên tiếp, 7★ như súng máy trong thời gian ngắn (tăng theo thẻ); dùng mana để kích hoạt thay nâng cấp; bỏ tia 7★ | 1–6★: loạt **s viên** cách 0.18 s, mỗi viên 0.35D+0.08D×sao, nghỉ max(1.6, 2.2−0.1×sao) s; **bỏ nút nâng cấp mana**; chủ động từ 3★: giá **10+5×sao mana** (7★ = 45), hồi 20 s, kéo dài 4+0.5×sao (+0.25 s/cấp thẻ); 3–6★ bắn nhanh gấp đôi; **7★ 10 viên/s × 0.45D trong 7.5 s (LV17 9.5 s)**. Ảnh: 1 thân + 1 module đầu xoè bằng code | Cho ụ Vàng có kỹ năng chạm từ 3★? Hồi 20 s ổn? | **raw_gc_hydra_dau** (đầu ngậm/há, mẫu 7 đầu, đạn) |
| 21 | Cửu Vĩ | — (đột phá 1/3/6/10 lần xả) | Đồng ý mốc; vì dễ đạt nên đề xuất thưởng bằng **50%** mức đột phá chung | Đồng ý giảm 50%? | — |
| 22–23 | Pháo Thanh Tẩy, Pháo Ngôi Sao | — | Giữ luật cũ + bảng cấp thẻ | — | — |
| 24 | Nữ Thần Phán Xử | Mỗi 10 đòn phán xử: quái nhỏ nhiều hơn → +tốc vĩnh viễn (có trần); hoà 5–5 → +ST vĩnh viễn (có trần) | Đếm 10 đòn trúng trực tiếp (DoT/lan không tính). Quái thường > tinh anh/trùm → **+4% tốc** (trần **+40%**); ngược lại hoặc hoà → **+6% ST** (trần **+60%**); cấp thẻ: +0.2 / +0.3 điểm %/cấp mỗi lần (LV17 5.6% / 8.4%), trần giữ nguyên. **Bỏ kết liễu máu thấp + %máu trùm cũ** | Bỏ hẳn kết liễu cũ? | — |
| 25 | Nhật Thực | (đang hỏi riêng phần làm chậm) | Không bàn trong đợt này | — | — |
| 26–31 | 6 ụ Hỗ trợ | — | Giữ luật cũ + Hỗ trợ +4%/cấp | — | — |

## Tướng Đỏ

| # | Ụ | Ý người dùng | ChatGPT tinh chỉnh (số) | Cần quyết | Ảnh |
|---|---|---|---|---|---|
| 1 | Thuỷ Quái | Điểm riêng từng ụ, ụ mới từ 0 | Đồng ý; đề xuất thêm: giết tinh anh +3, trùm +10 ABYSS | Điểm tinh anh/trùm? | — |
| 2 | Chúa Tổ | Drone quay quanh = số sao, đủ thì bay ra; hồi 2→14 s theo sao; càng thả nhiều càng mạnh + hồi nhanh | 1 drone/2 s, tối đa = sao, đủ thì thả hết; mỗi drone (0.70+0.15×sao)D, cả loạt +8%/drone thêm (7★ đủ 7 = 18.1D). **Hồi = 2×sao / [1+0.15×(số drone thả−1)] / [1+0.02×(cấp−9)]** → 7★ thả đủ 7: 14 s → 7.37 s. SWARM (3★+, hồi 25 s): thả ngay +35% ST, lần nạp sau 1.5 s/drone. Vẽ tối đa 4 drone + số "×7" | Duyệt công thức hồi chiêu? | **raw_gc_chuato_drone** (drone bay vòng, lao, vệt, nổ) |
| 3 | Rồng Máy | ST thiêu = giây thiêu / 2 × sao | Phun nón 70° mỗi 1.5 s, 0.70D/quái (≤5 quái), thiêu 3 s; **tổng thiêu = 0.15D × (giây/2) × sao** (7★ = 1.575D/3 s) chia 6 nhịp 0.5 s; không cộng dồn (lấy nguồn mạnh nhất), làm mới thời gian; DRAGON DIVE 3★+: hồi 30 s, 3.5D tối đa 8 quái + thiêu, trùm 50% | Hệ số 0.15D? | — (đã có ảnh vệt lửa) |
| 4 | Overlord | — | Giữ luật cũ | — | — |
| 5 | Hố Đen | Làm cho xứng tướng Đỏ mạnh | Mỗi 10−0.5(sao−1) s đặt hố 2 s ở cụm đông nhất, bán kính 64+4×sao; hút quái thường ≤12 px/0.2 s trong 1.2 s (tinh anh ½, trùm không bị kéo), rồi nghiền **(2.0+0.6×sao)D**; trùm 50%. Chủ động 3★+ **SINGULARITY COLLAPSE** 30 mana, hồi 40 s: hố tiếp theo +24 px, +1 s, +3.0D, trùm mất thêm 0.5% máu tối đa. Online: khuyên chỉ "giữ chân" (không kéo lùi quãng đường thật) | Kéo thật hay chỉ giữ chân? | — |
| 6–7 | Lò Phản Ứng Băng, Ngai Thời Gian | (đang hỏi riêng) | Không bàn | — | — |
| 8 | Hào Quang Thánh | **Bỏ** | Bỏ khỏi bộ bài/gacha; cần chính sách bù cho người đã có | Bù gì cho thẻ đã sở hữu? | — |
| 9 | Lõi Khởi Sinh | Nâng ụ sao thấp nhất trong dấu cộng; số sao phát = sao của lõi; hết thì tự nổ | Mỗi **12 s** (LV17 9.68 s) chọn ụ kề 4 hướng sao thấp nhất (<7, không đá/băng/Genesis; hoà → ô số nhỏ hơn), +1★ tại chỗ (không biến hình, không tính ghép); lượt = sao lúc sinh; hết lượt → tự huỷ, để trống ô; không có ô hợp lệ thì chờ, không mất lượt; lõi bị hạ sao → lượt = min(lượt, sao); lõi được tăng sao **không** hồi lượt. GENESIS 3★+: 30 mana, hồi 45 s, gọi 1 ụ 1★ vào ô trống kề | Lõi tăng sao có hồi lượt không (ChatGPT: không)? | — |

## Câu hỏi cần người dùng trả lời (gộp)

1. Pháo La Bàn: ghép 2 Compass luôn ra Compass (A) hay giữ ngẫu nhiên + "dấu hướng" (B)? Xoay hướng 15 mana?
2. Lửa Thập Tự: trần LV9 = 50 hay 70?
3. Hợp Xướng: giữ bản "kề cùng sao" hay xoá thẻ?
4. Kho Lưu: bỏ "Archive+Archive 3 xung"?
5. Twin Anvil: +4 điểm %/cấp? thất bại mất ụ cho? 1 ụ mang cả 2 dạng buff? đặt tên mới?
6. Prism Thief: cho chạm 4 ụ thay vuốt (hình chữ T)? màu cuối = đòn kết, hồi 25 s?
7. Mạch Máu: cho nuốt ụ 7★ / Trứng / Anvil / Genesis / Hỗ trợ? Máu dùng cho Blood Rite như trên?
8. Salvo Battery: duyệt tên; có thưởng bingo dở dang?
9. Sao Chép ô đá: bản chép là ụ thường hay đá?
10. Trứng cháy 7★: cho tái chế +20 mana?
11. Xưởng Anh Hùng: bản 25 s hay xoá?
12. Hydra: kỹ năng chạm từ 3★, hồi 20 s?
13. Nemesis: bỏ hẳn kết liễu cũ?
14. Chúa Tổ: duyệt công thức hồi chiêu; Hố Đen: kéo thật hay giữ chân; Rồng Máy hệ số 0.15D.
15. Hào Quang Thánh: bù gì cho người đã có thẻ?

## Ảnh đã tạo (ChatGPT, nền magenta, `docs/demo-hop-tuong/thap-art/`)

Thô: `raw_gc_sao17`, `raw_gc_lua4`, `raw_gc_prism4`, `raw_gc_forge_dmg`, `raw_gc_forge_toc`, `raw_gc_soi_thuong`, `raw_gc_soi_thuctinh`, `raw_gc_trung`, `raw_gc_luutru_bay`, `raw_gc_chuato_drone`, `raw_gc_hydra_dau`, `raw_gc_salvo` (.png).
Đã cắt nền trong suốt: `sao_1…sao_7`, `lua_bac1_trang`, `lua_bac2_xanh`, `lua_bac3_vang`, `lua_bac4_do`, `bienmau_do/vang/lam/luc`, `trung_1/2/3/no/chay7/vo` (.png).
Bảng xem nhanh: [`ANH-MOI.jpg`](ANH-MOI.jpg).

Chưa vẽ (chờ duyệt cơ chế): Compass (mũi tên/đoạn đường), Harmonic Choir, Blood Circuit (dấu, dây nối, giọt máu), hiệu ứng vuốt/đòn kết Prism, Nemesis (thước 10 đòn), Hố Đen mới, Genesis (dấu cộng), ô Anh Hùng; bản pixel art cho các hình mới (theo `docs/pixel/QUY-CHUAN.md`) ghi vào `docs/pixel/DANH-SACH.md` ở phase làm code.
