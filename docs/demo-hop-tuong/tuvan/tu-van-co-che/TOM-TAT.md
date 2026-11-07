# Tóm tắt tư vấn ChatGPT — kỹ năng theo QUYẾT ĐỊNH người chơi (07/11/2026)

Nguồn: [CHATGPT.md](CHATGPT.md) (2 câu trả lời đầy đủ, tiếng Anh) · danh sách ụ lặp: [DS-LAP.md](DS-LAP.md). **CHƯA ÁP DỤNG** — số là đề xuất LV9 của GPT, chưa mô phỏng.
Yêu cầu người dùng: bớt ụ "chỉ làm chậm"; thêm kỹ năng về CÁCH GHÉP, CHỖ ĐẶT, LIÊN KẾT, mỗi bản một cơ chế (như Sói) — **theo tinh thần Pháo La Bàn (mũi tên + số, ghép cùng hướng cộng / ngược hướng trừ + sóng nổ) và Ember Relay (ghép → +1 lửa cho mọi Relay cùng hàng + cột)**.
Quy ước: S = ụ KÉO, T = ụ ĐÍCH (ghép S lên T). "Ghép cùng loại" = 2 ụ cùng loại cùng sao → GIỮ LOẠI, T +1★ (như Pháo La Bàn), rồi chạy hiệu ứng. ST/Tốc/STCM = % sát thương / % tốc bắn / điểm % sát thương chí mạng (cộng vào nhóm chung, không nhân nhau). Bộ đếm không trần; ghép 2 ụ có bộ đếm thì T lấy số LỚN HƠN (không cộng).

## 1. Cơ chế kiểu Pháo La Bàn / Ember Relay (ưu tiên đọc trước)
Bản 2 (sau khi phản biện "khuôn mẫu, toàn công thức modulo") — 3 nguyên tắc: **ghép TOẢ ra đổi vĩnh viễn ụ khác trên bàn** (cả cách bắn), **biến thể đổi HÀNH VI** (S lên T ≠ T lên S), **đọc trong 1 giây**: 1 icon biến thể + tối đa 1 con số + xem trước vùng toả khi kéo; 0 phương trình sao.

**10 ụ TOẢ kiểu Ember** (tia thẳng xuyên qua ụ/ô trống, dừng ở đá; gương/mã nhảy thẳng):
| Ụ | Thuộc tính từng bản | Ghép → toả | Thưởng |
|---|---|---|---|
| Frost | 🔒 Ghim (đóng băng quái đầu 1.5 s/8 s) / 🔓 Giải (gỡ băng ụ mình bị đóng lâu nhất mỗi 10 s) | ghép KHÁC dạng: T Ghim → xung theo HÀNG, T Giải → theo CỘT; mọi Frost trúng + T được 1 Pha Lê | mỗi Pha Lê: ụ TC kề +5/+1/+7 |
| Chiller | 🧊 Sương (ô kề làm chậm 20%) / ♨ Hơi (ô kề +tốc vào quái chậm) | ghép khác dạng: mọi Chiller trên 2 ĐƯỜNG CHÉO đổi sang dạng của T, +1 Cuộn | mỗi Cuộn: TC kề +6/+2/+9 |
| Blizzard | ☁ Rộng (xung vùng 130%/10 s) / 🎯 Mũi (3 phát 130%/10 s) | khác dạng: T Rộng toả cả HÀNG, T Mũi cả CỘT; Blizzard trúng đổi theo T, +1 Gió; nổ 1 xung 240% | mỗi Gió +10/+2/+12 vĩnh viễn |
| Eclipse | ☀ Mặt Trời (tia xuyên + đốt) / 🌙 Mặt Trăng (nón rộng + chậm) | khác dạng: T +1 Chân Trời; Eclipse ở ô GƯƠNG (☀ gương trái-phải, 🌙 gương trên-dưới) nhận dạng của T, +2 | mỗi Chân Trời +14/+4/+18 |
| Cryo Reactor | 🔥 Lò (đòn TC kề phá giáp) / ❄ Ngưng (đòn TC kề thỉnh thoảng đóng băng) | khác dạng: T +1 Làm Lạnh, Reactor khác trên đường toả +1 (Lò: hàng+cột; Ngưng: 2 chéo) | mỗi điểm: TC kề +7/+3/+10 |
| Chrono Throne | ⏪ Tua (chạm: quái lùi 20%) / ⏩ Gấp (chạm: TC tăng tốc 5 s) | khác dạng: T +1 Kỷ, Throne ở ô gương dọc +2 | mỗi Kỷ: TC cùng cột (Tua) / hàng (Gấp) +10/+4/+13; hồi 32 s |
| Star Lift | ⬆ Nâng (buff ụ kề sao THẤP hơn) / ⬇ Ép (buff ụ kề sao CAO hơn) | khác dạng: toả xuống CỘT, Star Lift trúng đổi sang dạng T, +1 | mỗi điểm +8/+4/+9 |
| Lighthouse | thẻ deck + mũi tên ↑→↓← | T giữ thẻ, lấy mũi tên của S, +1 Cầu; mọi Lighthouse trên tia mới +1 Cầu | tiêu 1 Cầu: đặt ụ 1★ thẻ đó vào ô trống CHỌN trên tia; 1 Cầu/22 s; con TC +40/+16/+70 10 s |
| Tesla | ➕ Nhánh (lan 3 quái) / ➖ Giáo (1 đòn tập trung tầm xa) | khác cực: ➕ toả HÀNG, ➖ toả CỘT; Tesla trúng đổi sang cực T, +1 Cuộn | mỗi Cuộn +8/+2/+11 vĩnh viễn |
| Storm Gun | ⚡ Sét (1 đòn 300%) / ⛓ Xích (3 tia 70%) | khác dạng: mọi Storm Gun ở ô NƯỚC MÃ (2+1) đổi sang dạng NGƯỢC của T, +1 Dâng | mỗi Dâng +12/+3/+14 |

**Kiểu Pháo La Bàn (số học giữa 2 bản)** — Ice Blade ⚔ Chém 280% / 🌀 Xoáy 3×90% + số Lưỡi 1–3: cùng dạng → CỘNG số; khác dạng → giữ số lớn + dạng của T + 1 đòn vỡ 350%; Lưỡi ≥ 6: +135/+30/+160 khi còn giữ, mỗi Lưỡi +4% ST (khó 4). Chrono Lock ⏳ Tích / 💥 Nổ: Tích lên Nổ → kích nổ ST đã tích ×2; Nổ lên Tích → giữ ST tích + 1 Vọng (+5% lần nổ sau); quái bị đánh dấu 8 s: TC +95/+20/+125 (khó 4).
Bản 1 (17 cơ chế "thuộc tính + phép ghép", xem CHATGPT.md M01–M17) có thêm: cực N/S ghép cùng cột, Răng chẵn/lẻ, bộ 3 nốt A+B+C trên 1 hàng, gió vuông góc tạo bão chữ L, mặt số trừ về 0, cặp Mặt Trời/Trăng ở ô GƯƠNG (cột S + cột T = 6) +200/+50/+230, mạch +/− hai đầu trên cùng hàng/cột với ô giữa trống… — bị chê khó đọc nên bản 2 rút gọn.

## 2. 21 ụ: cũ → mới (bản 2; người chơi quyết định gì)
- **Frost** (khó 3): đóng băng → Ghim/Giải, toả hàng/cột. *Ghép Ghim lên Giải hay ngược lại: khoá quái hay cứu ụ khỏi trùm Freezer.*
- **Ice Blade** (4): ×5 vào quái chậm → số Lưỡi cộng dồn + 2 kiểu đánh. *Cộng số to hay giữ kiểu đánh mình muốn.*
- **Chiller** (4): làm chậm 4 ô → Sương/Hơi lan theo đường chéo. *Dạng nào chiếm các đường chéo.*
- **Blizzard** (4): chậm toàn sân → Rộng (hàng) / Mũi (cột). *Hàng bão diện rộng hay cột diệt trùm.*
- **Chrono Lock** (4): khoá + nổ → Tích/Nổ. *Nổ ngay hay tích thêm trước trùm.*
- **Eclipse** (4): ngày/đêm tự đổi → Mặt Trời/Trăng truyền sang ô gương. *Ụ gương nào nhận hành vi nào.*
- **Cryo Reactor** (4): hào quang chậm → Lò (chữ thập) / Ngưng (chéo). *Hạ tầng phá giáp hình chữ thập hay đóng băng hình chéo.*
- **Chrono Throne** (5): tua ngược → Tua/Gấp + cặp gương dọc. *Giữ cặp gương để mạnh tua hay mạnh hoả lực.*
- **Hammer** (3): +chí mạng 4 ô → ổ chữ L ↖↗↙↘, 2 ụ TC kề ở 2 ô của ổ CÙNG SAO: +80/+18/+125. *Đỡ góc nào.*
- **Crit Antenna** (3): +tỉ lệ CM → tần số 🟣/🟡; 2 Antenna cùng tần số kẹp 2 bên 1 ụ TC: ụ giữa +35/+10/+185 và +12% CM. *Giữ cặp đúng thay vì ghép mất.*
- **Fusion Mixer** (3): +tốc → ⛽ Nhiên liệu / 🧪 Axit; 1 Nhiên liệu + 1 Axit kẹp 2 bên 1 ụ TC: +90/+38/+115. *Bên kia đang thiếu dạng nào.*
- **Star Lift** (3): trùng Radar → Nâng/Ép, toả theo cột. *Cột này buff ụ yếu hay ụ mạnh.*
- **Focus Lens** (5): +STCM → hướng ↔↕◢◣; ô có ụ đầu tiên ở 2 tia ngược nhau là 2 ụ TC KHÁC LOẠI: cả 2 +155/+35/+205, CM xuyên thêm 1. *Hướng nào nối 2 ụ mạnh.*
- **Cloner** (3): ra ụ 1★ ngẫu nhiên → Gen = 1 thẻ deck; S lên T: con là thẻ Gen CŨ của T, đặt vào ô S vừa trống, Cloner mới mang Gen của S (đảo chiều = ra thẻ khác). *Tiêu Gen nào, giữ Gen nào.*
- **Twin Maker** (5): ra ụ cùng sao → Ấn ◀/▶; 2 ấn ngược ở 2 ô GƯƠNG cùng hàng, ghép → chọn 1 ụ TC cùng sao trong 2 bước, bản sao mới hiện ở ô S; cả 2 +180/+45/+220 10 s. *Ụ nào đáng nhân đôi.*
- **Evolver** (3): đếm giờ ngẫu nhiên → 🌱 Hạt (+1 Lớn/s) / 🔧 Ghép cành (+3 mỗi lần ghép cùng loại trong hàng); 35 Lớn → TỰ CHỌN thẻ deck +1★. *Kiên nhẫn hay đặt cạnh chỗ hay ghép.*
- **Mystery Box** (5): 1–6★ ngẫu nhiên → nhóm ⚔/🛡/⚙; ghép khác nhóm −12 s; 45 s chọn đúng thẻ trong nhóm, nếu 2 ô kề đã có ụ cùng loại đó → +2★ thay vì +1★. *Chuẩn bị ụ nào, có chờ đủ 2 ụ kề không.*
- **Lighthouse** (4): triệu hồi ngẫu nhiên → thẻ + mũi tên, mạng lưới Cầu (xem bảng mục 1).
- **Tesla** (3): sét lan → +/− toả hàng/cột (mục 1).
- **Storm Gun** (4): sét lan, chậm khi đứng cạnh nhau → Sét/Xích theo nước mã (mục 1).
- **Ricochet** (5): nảy N lần → ◀ ưu tiên quái cuối / ▶ quái đầu; đứng HÀNG GIỮA với ≥ 2 ô TRỐNG liền tới mép về phía mình chọn: +170/+40/+210 khi hành lang còn trống; cùng bên +1 Nảy, khác bên lấy bên của S +2 (+6% mỗi Nảy). *Bỏ trống ô quý để có ụ cực mạnh?*

## 3. 10 nguyên mẫu cơ chế MỚI (chưa có trong game)
1. **Khắc Ô** (Tím Hỗ trợ, khó 3): ghép cùng loại → khắc mọi ô TRỐNG cùng hàng; ụ TC triệu hồi trả tiền rơi vào ô khắc được +50/+12/+70 vĩnh viễn. *Khắc trước hay triệu hồi trước.* (GPT đánh giá hứa hẹn nhất)
2. **Quét Đồng Bộ** (Vàng TC, 4): ghép → ụ TC đầu tiên trên 4 tia; nếu ≥ 2, phát bắn kế tiếp của chúng trùng nhau trong 1 s, mỗi phát +130% ST, +60 STCM.
3. **Đấu Giá Cao–Thấp** (Xanh TC, 3): Giá 1–4; kéo Giá LỚN lên Giá nhỏ → bắn (S−T) tia 320% và lấy Giá của S; ngược lại giữ Giá T, +65% tốc 5 phát.
4. **Đấu Giá Đạn** (Trắng ĐB, 3): 1–4 Đạn; ghép bắn đúng số Đạn của S thành phát 160% xen kẽ 2 ụ TC gần nhất cùng hàng với T; S ≥ 3 Đạn → phát kế +120 STCM.
5. **Săn Đôi** (Vàng TC, 4): 🐺 Thợ Săn (quái máu cao nhất) / 🎯 Đao Phủ (máu thấp nhất); Săn lên Đao → 3 phát 200% xuyên giáp; ngược lại 3 phát nổ lan 80%.
6. **Quản Mìn** (Tím TC, 4): 🪤 Gài (mìn mỗi 5 phát) / 💣 Kích (nổ mìn gần 250% mỗi 5 phát); Gài lên Kích → nổ hết mìn trong vùng + 1 nổ 500%; ngược lại gài ngay 2 mìn.
7. **Dây Giật** (Đỏ TC, 4): chọn 2 ụ TC trong 3 bước; mỗi đòn của ụ 1 dồn 40% ST vào đòn kế của ụ 2 (ụ 2 chậm 10%); mỗi ụ 1 dây.
8. **Cổng Một Ô** (Tím Hỗ trợ, 4): 2 ụ TC khác loại cùng hàng cách đúng 1 ô trống → mỗi 6 đòn xen kẽ bắn 1 đạn cổng 600%; lấp ô là mất.
9. **Bốc Hai Thẻ** (Vàng ĐB, 3): mỗi lần ghép bốc 2 thẻ (tất định), chọn 1 làm lượt triệu hồi kế tiếp +1★; không sinh ụ thêm.
10. **Đặt Trước** (Tím ĐB, 4): trả 20 mana giữ 1 thẻ ở 1 ô trống; trống liên tục 18 s → thành ụ 2★ thẻ đó; bị chiếm thì huỷ, hoàn 10 mana.

## 4. Bảng tương tác (dịch gọn — chi tiết ở CHATGPT.md phần C)
Thứ tự xử lý 1 nhịp: kiểm tra chiêu trùm/PvP → trừ S, nâng T, kế thừa thuộc tính → chạy 1 hiệu ứng ghép của loại đó → toả theo thứ tự ô tăng dần → tính lại liên kết/hỗ trợ/đội hình → xếp hàng đạn thêm/kinh tế/VFX. **Hiệu ứng do ghép sinh ra KHÔNG phải một lần ghép** (không đệ quy).
| Nhóm | Jackpot (Masterwork, Cascade, Heist, Chain Reactor, Blood Eclipse, True North, Grand Chorus, Six Seals) | Hỗ trợ | Copycat / Mimic | Merge King | Đá / đóng băng | Chiêu trùm | PvP |
|---|---|---|---|---|---|---|---|
| Toả (R) | xung toả KHÔNG tính là ghép Vệ Tinh / màu Prism / mũi tên La Bàn / VAMP / rút Pandora; Lò ăn ụ có dấu → mất bộ đếm; buff toả chỉ tăng ST thật của Chain Link, 0 lượt trúng | buff cộng vào ST ụ TC; ụ hỗ trợ bị đóng băng = 0 buff | Copycat chép icon + số (70% ST), lần ghép đầu của bản sao không toả / không thêm bộ đếm; Mimic → ụ ngẫu nhiên, mất hết | T giữ loại + dạng + số, +1★, KHÔNG toả | đá chặn tia, không nhận dấu; gương/mã nhảy qua đá nhưng không tác dụng lên ô đá; ụ đóng băng giữ dấu, không phát | −1★: giữ dạng + bộ đếm, tính lại mốc sao; Hoá đá: dạng/dấu ngủ, ghép đá-đá là mất; Xáo vị trí giữ bộ đếm, SCRAMBLE đổi loại xoá sạch; Ép ghép → ụ ngẫu nhiên, 0 toả; Chặn ghép → không tốn, không xung | Jammer chặn ghép = không xung; xáo vị trí giữ bộ đếm nhưng đổi hình tia; Hex chỉ đổi sao |
| Số học (A) | số không đổi thành VAMP/Pandora; đạn thưởng là "proc", không tính đòn Chain Link | proc dùng chỉ số sau hỗ trợ 1 lần | Copycat chép số; lần ghép đầu giữ số lớn, không bắn thưởng; Mimic mất số | giữ số, không cộng/trừ/bắn | đá: số ngủ, ghép đá mất; băng: giữ số | −1★ giữ số / ST tích | Jammer chặn payout |
| Biến thể (V) | đổi dạng không mở/kéo dài thức tỉnh, không tính chuỗi màu/mũi tên | đổi dạng → tính lại buff ngay | Copycat chép dạng, lần ghép đầu không thưởng; Mimic mất dạng | giữ dạng, không thưởng khác dạng | đá/băng: giữ dạng, không hoạt động | SCRAMBLE ra dạng mới ngẫu nhiên | xáo giữ dạng |
| Liên kết (L) | ăn 1 đầu dây → đứt; ST truyền qua dây không phải VAMP, không tạo lượt trúng | buff áp lên đòn thật trước khi truyền, không áp lại | bản sao là nút mới (70%), không kế thừa dây | tính lại liên kết, không thưởng thêm | đầu dây hoá đá/đóng băng → ngắt; đá chặn tia Focus Lens | −1★ có thể phá điều kiện cùng sao | xáo vị trí → tính lại, dây chọn tay bị đứt nếu đầu dây bị dời |
| Hành lang (P) | ô trống/cổng không phải sự kiện ghép; đạn cổng là proc | chỉ đòn thật của 2 đầu được buff | bản sao chiếm ô thật → tính lại hành lang | ô S trống ra → tính lại | đá/ụ băng chiếm ô → phá hành lang/cổng | Hoá đá lấp ô → vỡ ngay | xáo có thể tạo/phá khoảng trống |
| Kinh tế chọn (E) | ụ sinh ra là ụ mới, tiến độ jackpot tính từ lần ghép thật sau | ụ con nhận buff sau khi xuất hiện | Copycat không chép Lớn/Cầu/hẹn giờ; ghép đầu không ra ụ con; Mimic xoá sạch | giữ Gen/kho/giờ, +1★, không ra con | không đặt vào ô đá; đá lên ô Đặt Trước → huỷ, hoàn 10 mana; băng tạm dừng giờ | Ép ghép → không ra con, mất kho | Jammer chặn ghép đặc biệt mới |
Quy tắc "TỔNG HỢP": ụ sinh miễn phí / bản Copycat ở lần ghép đầu tiên không được sinh thêm bộ đếm, ụ con hay đòn thưởng (chặn vòng lặp Cloner → Copycat → Cloner). Luật Copycat hiện có của Pháo La Bàn giữ nguyên.

## 5. Ưu tiên & bẫy
**Top 5 làm trước (GPT):** (1) **Tesla +/−** — thử xem "toả đổi hành vi cả hàng/cột" có vui không · (2) **Ice Blade số Lưỡi** — gần Pháo La Bàn nhất, 1 số + 2 kiểu đánh · (3) **Frost Ghim/Giải** — thay ụ đóng băng thuần bằng lựa chọn khoá quái hay cứu ụ · (4) **Ricochet hành lang trống** — thử "ô trống là tài nguyên" · (5) **Cloner Gen** — kinh tế tự chọn qua chiều ghép. Đo: tỉ lệ người chơi CỐ Ý hoãn/đảo/dời một lần ghép vì có lợi hơn; khó 5 nên đạt 5–15% số trận.
**3 bẫy:** (1) sinh ụ miễn phí đệ quy → luật "tổng hợp" ở trên; (2) toả chồng nhiều tia cộng nhiều lần → mỗi ụ nhận tối đa 1 bộ đếm / 1 lần ghép, kế thừa lấy max, các thưởng cộng chứ không nhân; nếu vỡ cân bằng thì trên 20 bộ đếm chỉ tính 1/3 như Pháo La Bàn; (3) proc dây chuyền với Chain Reactor/jackpot → mỗi đòn gắn nhãn đòn thường / đòn thưởng / hiệu ứng ghép, chỉ đòn thường tính tiến độ.
**Nhận xét của Claude:** bản 2 bám sát yêu cầu hơn bản 1; nên chọn bộ "toả + biến thể" (mục 1) làm hướng chính, giữ Hammer/Antenna/Mixer kiểu "kẹp 2 bên" vì dễ đọc. ⚠ Cần người dùng chốt: ghép cùng loại GIỮ LOẠI cho 21 ụ này (khác luật DCDW ghép ra ụ ngẫu nhiên — làm bàn dễ tích hơn, cần thử cân bằng); Ricochet hàng giữa + 2 ô trống có thể quá khó trên bàn 5×3.
