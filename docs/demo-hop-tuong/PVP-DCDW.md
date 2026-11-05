# PVP kiểu DCDW / Random Dice — nghiên cứu & luật áp dụng cho TURRET MERGE

Lý do: chủ dự án nói "PvP của game DCDW có như bạn đang làm đâu". Bản cũ = "giết quái thì gửi quái sang đối thủ" (ghi trong `DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md`, `thap-art/TU-VAN-TOAN-GAME.txt` mục 4 — mục 4 gắn nhãn "CONFIRMED" nhưng nguồn là chính dự án, không phải game gốc). Chủ dự án bác bỏ → bỏ luật đó.

## Nguồn đã đọc được
| # | Nguồn | Nói gì về PvP |
|---|---|---|
| S1 | BlueStacks — DCDW Beginner's Guide (03/2022) https://www.bluestacks.com/blog/game-guides/destiny-child-defense-war/dcdw-beginner-guide-en.html | "Each player has their own lane and HP pool, and the first to lose all their lives will lose." · "Every enemy that manages to slip by and reach the end of the lane will subtract one life" · Archfiend: "save these for boss stages or for when you're at risk of getting overwhelmed" · triệu hồi = Child ngẫu nhiên trong đội, tốn mana; mana từ giết quái + qua wave. |
| S2 | BlueStacks — DCDW Tips & Tricks (03/2022) https://www.bluestacks.com/blog/game-guides/destiny-child-defense-war/dcdw-tips-tricks-en.html | "Control: These units often boast effects that can disrupt the enemy's formations… Great for PvP matches." |
| S3 | Level Winner — Random Dice guide (08/2021) https://www.levelwinner.com/random-dice-guide-tips-tricks-strategies/ | "Before each round starts in a PvP match, you will be greeted with a boss roulette" — trùm PvP tác động lên bàn của chính mình (khoá/xáo/phá/hạ cấp xúc xắc). Ghép ra loại ngẫu nhiên. |
| — | namu.wiki DCDW, Random Dice Fandom | Không đọc được (lỗi / chặn). |

## Xác nhận vs giả định
**XÁC NHẬN (có nguồn):**
- Mỗi người một làn + một quỹ tim riêng; ai mất hết tim TRƯỚC thì thua (S1) → người trụ lâu hơn thắng.
- Quái lọt cuối làn trừ tim (S1).
- Triệu hồi ngẫu nhiên trong bộ, ghép ra loại ngẫu nhiên, mana từ giết quái (S1, S3).
- Archfiend/chỉ huy là kỹ năng tốn mana, dành cho lúc trùm / nguy (S1).
- Nhóm Control phá đội hình đối phương, hợp PvP (S2) → tương tác TRỰC TIẾP với đối thủ là qua kỹ năng của một số tướng.
- PvP Random Dice có trùm mỗi vòng (S3).

**GIẢ ĐỊNH (không nguồn nào nói rõ; theo mô tả của chủ dự án + kiến thức chung về thể loại):**
- Hai bên nhận CÙNG đợt quái (cùng loại / máu / nhịp) cùng lúc — không có luật gửi quái khi giết.
- Nếu chưa phân thắng bại sau lâu, trùm mạnh dần liên tục (đột tử) đến khi một bên vỡ.
- Số tim PvP = 3 (giữ như bản hiện tại).

## Luật áp dụng trong game (thap/)
1. **Cùng wave**: mỗi wave sinh 1 lần bằng RNG có hạt giống (hạt của trận + số wave) và đổ GIỐNG HỆT vào 2 làn (cùng loại quái, cùng máu, cùng thời điểm). Hai làn dài bằng nhau.
2. **Không gửi quái**: giết quái chỉ cho mana cho bàn giết. Bỏ hẳn "gửi quái" (kể cả Freeze Archfiend-chip gửi quái nhỏ, Bounty theo quái gửi).
3. **3 tim mỗi bên**, quái thường −1, quái to/trùm −2. Hết tim trước = thua.
4. **Trùm mỗi 10 wave**, cùng loại cho 2 bên. **Đột tử từ wave 30**: wave nào cũng là trùm, máu ×(1 + 0,5·k) (k = số wave đột tử đã qua), thêm 1 trùm nữa mỗi 3 wave đột tử. Không có "thắng khi hết 70 wave" trong PvP.
5. **Tương tác trực tiếp duy nhất**: kỹ năng nhắm đối thủ — Star Breaker (−1★), Scrambler (xáo), Jammer (kẹp −40%), Signal Jammer (nhiễu), Mirror Gate (chặn + phản), Rainbow (quái làn đối thủ trâu hơn).
6. **Đối thủ máy**: bộ bài ≥3 ụ gây sát thương; triệu hồi, ghép, nâng cấp; dùng chỉ huy khi có trùm trên làn mình hoặc còn 1 tim.
