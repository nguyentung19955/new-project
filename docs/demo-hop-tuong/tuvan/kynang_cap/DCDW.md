# Cấp thẻ tăng KỸ NĂNG (kiểu DCDW) — Copycat % sao chép + mọi ụ kỹ năng (06/11/2026)

Yêu cầu: "Copycat theo DCDW thì có % giảm sức mạnh … khi tăng sức mạnh ở gacha thì chính là tăng cái % này lên."

Ký hiệu: **[nguồn]** = trang web nói rõ · **[suy ra]** = mình tự đặt / suy luận · **[không tìm thấy]**.

## 1. Tìm hiểu DCDW

| Câu hỏi | Kết quả | Nguồn |
|---|---|---|
| Shamash (샤마시) chép ở bao nhiêu % sức mạnh, tăng bao nhiêu mỗi cấp | **[không tìm thấy]** — namu.wiki chặn đọc tự động; tiprelay chỉ liệt kê Shamash trong bộ bài (vd "다비, 샤마시, 베리트, 모아, 오로라밈킹") và nhắc "샤마시 디버프" (PVP) | tiprelay.com (deck guide 2020), gameinsight.co.kr (review 2020) |
| Cấp thẻ tăng gì | Huyền thoại ≈ **+10%/cấp**, Cosmem ≈ +20% vì còn tăng tốc đánh ("타 전설들은 1레벨당 약 10%씩 강해지지만, 코스밈은 공속도 빨라져 약 20%가 강해진다") → cấp thẻ tăng cả **chỉ số kỹ năng**, không chỉ sát thương gốc | [nguồn] tiprelay |
| Werewolf | 30% ra bản thức tỉnh ("각성워울프 … 30% 확률"), thức tỉnh = mọi đòn chí mạng; % theo cấp: không tìm thấy | [nguồn] tiprelay |
| Aurora King (vàng / +2★), Darby, hỗ trợ (buff %) theo cấp | **[không tìm thấy]** số cụ thể | — |

Kết luận: DCDW có mô hình "lên cấp thẻ = mạnh hơn chính kỹ năng" (Cosmem), nhưng **không có số chính thức** cho Shamash hay % mỗi cấp của kỹ năng → toàn bộ số dưới đây là **[suy ra]**, đặt sao cho **cấp đầu = y hệt trước** và cấp 15 ≈ +40% (hỗ trợ) / Copycat gần 100%.

## 2. Luật mới của mình

- Bảng duy nhất `KY_NANG_CAP` trong `thap/js/data.js` (cũng là `THE.kyNang`): `{ten, base, buoc, max, dv, tien, dmg, ht}`. Giá trị = `base + buoc × (số cấp đã lên trên cấp đầu)`, kẹp ở `max` (đúng chạm max ở cấp 15). Hàm: `knGt`, `knThe(B,id)`, `knHe(B,id)`, `heSaoChep(B)`.
- Trong trận cấp lấy từ `B.capThe` → **online**: cấp đọc từ chuỗi bộ bài đã gửi trong phòng (`#…`), 2 máy cùng số; **máy (bạn co-op / đối thủ PVP)**: cấp trung bình như cũ.
- Ngoài trận (trang ụ): cấp trong bộ sưu tập. Hàng **CARD LV** hiện `Copy 50% → 57%`, `Rate buff +12% → +12.4%`…; dòng 2 = thiếu bản sao/vàng hoặc `dmg +0% → +10%` (ụ có cả sát thương).

### Copycat (Shamash)
- Bản sao = **chỉ số ụ gốc × % sao chép**. % theo **cấp thẻ COPYCAT** của bàn đó: cấp 9 (đầu, Huyền thoại) **50%** → +7%/cấp → cấp 15 **92%** (50·57·64·71·78·85·92).
- Cấp thẻ của **ụ gốc** vẫn áp (bản sao mang chỉ số ụ gốc đã lên cấp, rồi × %).
- % chỉ áp vào **sát thương** (như trước). Bản sao của ụ hỗ trợ giữ buff như trước (để cấp đầu không đổi độ khó).
- Huy hiệu bản sao trên bàn giữ nguyên. Bảng chỉ số thật trong trận: `×0.71 · copy (71% power)`.
- Copycat vẫn có +% sát thương mỗi cấp cho phát bắn của chính nó.

### Ụ kỹ năng khác (kỹ năng + vẫn giữ +% sát thương nếu có đòn bắn)
| Ụ | Giá trị | Cấp đầu → cấp 15 |
|---|---|---|
| Mimic | buff sau ghép | +50% → +74% |
| Merge King | xác suất bản vàng (+2★) | 10% → 22% |
| Overclock | +tốc bắn mỗi lần kéo | +65% → +87.5% |
| Star Cannon (Darby) | mọi mốc ★ (tốc/sát thương) | ×100% → ×130% |
| Werewolf | xác suất thức tỉnh | 30% → 48% |
| Mana Doubler | mana khi ghép (1★) | +32 → +56 |
| Cooldown Horn | giảm hồi chiêu Ma vương (1★) | −4.5s → −7.5s |
| Guillotine | giết ngay (1★) | 3.75% → 5.85% |

### Ụ chỉ kỹ năng (không bắn → chỉ kỹ năng)
| Ụ | Giá trị | Cấp đầu → cấp 15 |
|---|---|---|
| Mana Core | lượng mana sinh | ×100% → ×156% |
| Frost | thời gian đóng băng | 2.0s → 3.0s |
| Venom | dấu +sát thương nhận | +12% → +17.6% |
| Shield Gen | hồi khiên | 18s → 14.4s |
| Mystery Box | mở sau | 47s → 38s |

### Hỗ trợ (giá trị buff ở 1★; đường cong sao, trần chung HOTRO.CAP giữ nguyên) — THAY cho "+½ % sát thương mỗi cấp"
Radar +12→16.8% tốc · Armor Breaker +22→30.4% vào quái lộ · Hammer +30→42.6% sát thương chí mạng · Crit Antenna +6→8.4% chí mạng · Fusion Mixer +6→8.4% tốc · Chiller 8→11% chậm · Amplifier +9→12.6%/đòn · Cleanser +8→11.6% · Star Lift +6→8.7% tốc · Reaper Pillar 8→11.6% giết ngay · Focus Lens +14→19.4% · Sync Cannon (Cosmem) +7.5→10.5% · Star Breaker +10→14.2% · Rainbow +13→18.4% · Resonance Grid +8→11.3% · Mirror Gate 15→21% kháng · Cryo Reactor +14→19.6%.
(Crit Antenna, Star Lift trước đây KHÔNG tăng theo cấp thẻ — nay có.)

### Không đổi (chỉ +% sát thương mỗi cấp như bản effd3b0)
Ụ tấn công thuần, và các ụ kỹ năng không có con số % rõ ràng để tăng: Twin Maker (luôn gọi đúng 1 ụ), Teleporter, Cloner, Scrambler, Clamp, Drone, Orbital, Evolver, Pandora, Holy Halo, Genesis… (để đợt sau nếu cần).

## 3. Cân bằng (tools/thap-sim-vaitro.js deck 3; `CAPTHE=k` = mọi thẻ +k cấp)
| Kiểu bộ | trước (cấp đầu) | mới cấp đầu | +3 cấp | +6 cấp | max |
|---|---|---|---|---|---|
| 3A+1Sup+1Sp | 15.8 | 15.8 | 18.3 | 20.0 | 23.1 |
| 2A+2Sup+1Sp | 16.0 | 16.0 | 17.3 | 19.2 | 21.7 |
| 3A+2Sp | 19.1 | 19.1 | 18.4 | 20.6 | 20.9 |
| 4A+1Sp | 18.7 | 18.7 | 20.6 | 20.4 | 24.0 |
| 2A+1Sup+2Sp | 16.6 | 16.6 | 18.7 | 19.9 | 22.3 |
Cấp đầu: **y hệt trước**. Mọi mức: các kiểu bộ trong ±15% của trung bình. `node tools/thap-sim-vaitro.js che`: solo/coop/pvp không lỗi.

## 4. Kiểm
- `tools/thap-kt-kynangcap.js` (có trong `thap-kt-hoiquy.js`): bảng chạm max đúng cấp 15; bản sao = ụ gốc × 50/71/92%; cấp ụ gốc vẫn áp; Radar 12/14.4/16.8%; Overclock 87.5%; Merge King ~22%; online giải mã `#30726` → 71% / +14.8%; trang ụ hiện đúng chữ.
- Ảnh (390×844 DPR3): `saochep_lv9/12/15.png`, `radar_lv3/9/15.png`, `epxung_lv6/10/15.png`, `vughep_lv9/12/15.png`, `dongbo_lv9/12/15.png`, `tran_banSao_71.png` (bản sao 63 dmg cạnh Cannon thật 88 = 71%).
