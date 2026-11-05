# TRÙM MỚI — bộ 12 trùm của TURRET MERGE (2026-11-05)

Nguồn nghiên cứu: `TRUM-DCDW.md`. Code: `thap/js/trum.js` (dữ liệu + chiêu 6 trùm mới, cắm vào lịch trùm game.js).
Hình: TẤT CẢ ảnh ChatGPT (prompt: `HINH-VE-CODE-AUDIT.md` mục "Pass 6 — new bosses"). Trong lúc chờ ảnh, trùm mới mượn
dải ảnh của 1 trùm cũ (`anhTam`) — code không vẽ hình.

## Luật chung (giữ như cũ)
- Trùm mỗi 10 wave; lọt −2 tim. Chiêu nhắm ụ: báo trước 1,4 s (tâm ngắm trên ụ), khiên Ma vương / Máy Khiên chặn.
- Máu gốc = `mauWave(w) × 30 × (1 + w/35)` × **hệ số máu riêng** (bảng dưới). PVP đột tử: × (1 + 0,5k) như cũ.
- Hồi chiêu: `max(6, 10 − w/15)` s như cũ (riêng từng trùm có thể ×).
- **Chế độ**: SOLO/PVP lấy ngẫu nhiên từ bể trùm (chỉ trùm có `tuWave ≤ wave`). CO-OP: thứ tự cố định 6 trùm cũ tới wave 59 (không đổi), từ wave 60 ngẫu nhiên cả bể 12.
- Gỡ lỗi: `?trum=<id>` → mọi wave trùm là trùm đó, trùm ra ngay sau 2 s (kèm `&wave=N` để chọn sức mạnh).

## Bảng trùm
| # | id | Tên | Chiêu | Từ wave | Máu × | Tốc | Chế độ |
|---|---|---|---|---|---|---|---|
| 1 | mad_crown | MAD CROWN | SCRAMBLE — đổi 3 ụ sang loại ngẫu nhiên | 10 | 1.0 | 15 | tất cả |
| 2 | freezer | FREEZER | FREEZE — đóng băng ụ mạnh nhất 7 s | 10 | 1.0 | 15 | tất cả |
| 3 | janus | JANUS CUBE | PETRIFY — hoá đá 1 ụ | 10 | 1.0 | 15 | tất cả |
| 4 | joker_king | JOKER KING | FORCE MERGE — ném Mimic ép ghép | 10 | 1.0 | 15 | tất cả |
| 5 | nightmare | NIGHTMARE | SNIPE — −1★ ụ sao cao nhất | 10 | 1.0 | 15 | tất cả |
| 6 | octopus | OCTOPUS EYES | BURN — đốt 3 ụ, hết lửa −1★ | 10 | 1.0 | 15 | tất cả |
| 7 | hive | HIVE MOTHER | SWARM — nhả 4 drone bay đi TRƯỚC trùm (wave ≥40: 6 drone) | 10 | 0.85 | 13 | tất cả |
| 8 | jammer | STATIC JAMMER | JAM — câm 2 ụ (ưu tiên ụ HỖ TRỢ): không bắn, không ghép, tắt hào quang 6 s | 20 | 0.9 | 15 | tất cả |
| 9 | prism | PRISM WARDEN | PRISM SHIELD — giảm 90% sát thương tới khi bị 3 LOẠI ụ khác nhau bắn (wave ≥40: 4 loại); vỡ 7 s rồi dựng lại | 20 | 1.15 | 13 | tất cả |
| 10 | twin_core | TWIN CORE | SPLIT — chết tách 2 lõi con (mỗi con 35% máu, nhanh 1,5×, lọt −1 tim) | 30 | 0.7 | 15 | tất cả |
| 11 | patcher | PATCH TITAN | REPAIR — hồi 12% máu bản thân + 35% máu mọi quái thường trên làn | 30 | 0.85 | 12 | tất cả |
| 12 | leech | STAR LEECH | STAR THEFT — rút 1★ ụ sao cao nhất (ụ ≥2★) rồi LAO 2 s (×2,4 tốc, miễn chậm/choáng). Giết được → trả lại toàn bộ sao đã cướp | 40 | 0.8 | 16 | tất cả |

## Chi tiết 6 trùm mới

### 7. HIVE MOTHER (`hive`) — gọi quái (kiểu Red Star / Snake)
- **Hình**: tàu mẹ cơ khí hình tổ ong lục giác, 4 chân nhện ngắn, bụng có cửa khoang mở, đèn hổ phách. Không giống Red Star.
- **Chiêu SWARM**: báo 1,4 s (cửa khoang sáng) → 4 drone `bay` sinh ở đoạn đường phía TRƯỚC trùm 30–72 px (máu ×1,3 drone thường); wave ≥40: 6 drone.
- **Khắc chế**: ụ lan / tia chuỗi; ụ chống bay. Khiên KHÔNG chặn (không nhắm ụ).
- **Băng giới thiệu**: "Launches drone swarms ahead of itself".

### 8. STATIC JAMMER (`jammer`) — câm ụ (kiểu Silence)
- **Hình**: cột ăng-ten đi bằng 2 chân gà, đĩa radar lệch, cuộn dây phát tia tĩnh điện xanh tím.
- **Chiêu JAM**: nhắm 2 ụ (ưu tiên ụ hỗ trợ, rồi ụ sao cao) → 6 s: không bắn, không ghép, hào quang hỗ trợ tắt. Dùng trạng thái xích có sẵn (`st.kep` + `st.cam`) → mọi kỹ năng xoá debuff / Eve gỡ được.
- **Khắc chế**: khiên chặn; xoá debuff; dàn hỗ trợ ở nhiều ô.
- **Băng**: "Jams 2 turrets — supports first".

### 9. PRISM WARDEN (`prism`) — khiên đổi điều kiện (mới, đòi bộ bài đa dạng)
- **Hình**: hộ vệ pha lê-thép, thân lăng trụ tam giác, 3 tấm khiên lăng kính bay quanh vai.
- **Chiêu PRISM SHIELD**: khiên bật khi ra sân: −90% sát thương. Mỗi LOẠI ụ khác nhau bắn trúng = 1 vạch; đủ 3 loại (wave ≥40: 4) → khiên vỡ 7 s (sát thương bình thường) → dựng lại (báo 1,4 s). Sát thương không có ụ (độc, nổ ăn theo) không tính vạch.
- **Khắc chế**: bộ bài ≥3 ụ gây sát thương; dàn đều loại trên bàn. Bộ 1 loại sẽ đánh rất khổ (cố ý).
- **Băng**: "Shield breaks only to 3 different turrets".

### 10. TWIN CORE (`twin_core`) — tách khi chết (kiểu Red Lightning Zarramim / Slime)
- **Hình**: lõi lò phản ứng hai nửa ghép, nối bằng cầu sét đỏ, đi bằng 4 chân robot.
- **Chiêu SPLIT** (bị động): chết → 2 lõi con (35% máu gốc mỗi con, tốc 22, cỡ 0,72×, lọt −1 tim, không tách nữa, không có chiêu).
- **Khắc chế**: giết sớm ở đầu đường; sát thương lan.
- **Băng**: "Splits in two when destroyed".

### 11. PATCH TITAN (`patcher`) — hồi máu (kiểu Magician)
- **Hình**: rô-bốt thợ sửa to con, lưng đeo bình chất lỏng xanh lá, 2 tay cờ-lê + vòi phun nano.
- **Chiêu REPAIR**: báo 1,4 s → hồi 12% máu tối đa của bản thân, 35% máu mọi quái thường trên cùng làn, 6% cho trùm khác.
- **Khắc chế**: dồn sát thương nổ (burst), giữ quái thường không sống sót tới lúc hồi.
- **Băng**: "Repairs itself and every enemy".

### 12. STAR LEECH (`leech`) — cướp sao + lao nhanh (yêu cầu user; kiểu Leon)
- **Hình**: rô-bốt đỉa / bọ hút dài, vòi hút hình ống, bụng kính chứa các ngôi sao đã cướp phát sáng.
- **Chiêu STAR THEFT**: báo 1,4 s trên ụ sao cao nhất (≥2★) → −1★, ngôi sao bay vào bụng trùm; trùm LAO 2 s (×2,4 tốc, miễn chậm/choáng). Bị giết → mọi sao đã cướp trả về (+1★ cho ụ ngẫu nhiên <7★, hết chỗ thì đổi thành mana). Lọt → mất luôn.
- **Khắc chế**: khiên; sát thương cao lúc nó vừa lao xong; giết để lấy lại sao (thưởng lớn).
- **Băng**: "Steals your stars — kill it to get them back".

## Đường cong máu / tốc (số tham khảo, máu gốc ×1,0)
| Wave | Máu gốc | hive 0.85 | jammer 0.9 | prism 1.15 | patcher 0.85 | twin_core 0.7 (+2×35%) | leech 0.8 |
|---|---|---|---|---|---|
| 10 | ≈ 22 400 | 19 000 | 20 200 | 25 800 | 19 000 | 15 700 (+11 000) | 17 900 |
| 20 | ≈ 82 000 | 69 700 | 73 800 | 94 300 | 69 700 | 57 400 (+40 200) | 65 600 |
| 30 | ≈ 306 800 | 260 700 | 276 100 | 352 800 | 260 700 | 214 700 (+150 300) | 245 400 |
| 40 | ≈ 1 275 000 | 1 083 800 | 1 147 500 | 1 466 300 | 1 083 800 | 892 500 (+624 800) | 1 020 000 |

Cân bằng (sim không giao diện `node tools/thap-sim-trum.js`): kết quả ở mục cuối file.

## Kết quả sim (`node tools/thap-sim-trum.js tran 3`)
Bàn đầy 15 ụ tĩnh (không ghép thêm), 5 loại ụ, + 4 quái hộ tống. Số = % quãng đường trùm (cả lõi con) đi được khi chết — càng cao càng khó; 100 = lọt.
Chuẩn = 6 trùm cũ. Mục tiêu: trùm mới nằm trong khoảng của trùm cũ (±15 điểm), không trùm nào lọt với bàn hợp lý, không trùm nào chết quá sớm.
```
Bàn đầy lien,canon,bang,tia,set · sao TB theo wave w10=3★ w20=4★ w30=6★ (máu trùm ×0.3 bù nâng cấp/ụ mạnh) w40=7★ (máu trùm ×0.12 bù nâng cấp/ụ mạnh) · số = % quãng đường trùm đi được khi chết (TB 3 lần; L = lọt)
trùm              w10      w20      w30      w40    ★ mất@w30
mad_crown         23%      50%      38%      43%     0.0
freezer           25%      60%      34%      43%     0.0
janus             28%      69%      35%      48%     0.0
joker_king        26%      70%      33%      45%     7.7
nightmare         25%      63%      34%      42%     3.0
octopus           26%      65%      34%      45%     6.0
hive              22%      54%      26%      36%     0.0
jammer            26%      56%      32%      39%     0.0
prism             24%      58%      32%      44%     0.0
twin_core         31%      73%      40%      52%     0.0
patcher           21%      74%      29%      46%     0.0
leech             31%      75%      38%      53%     0.0
```
- PRISM với bộ 1 loại (Gatling ×15) ở wave 20: **lọt 3/3** (bộ 5 loại: 58%) → đúng vai "phạt bộ bài đơn điệu". Freezer cùng bài: 70%.
- TWIN CORE với bộ 1 loại: 90% (khó nhất cho bài thiếu sát thương lan) — cố ý.
- Sim không đo phần phá ghép (JAMMER chặn ghép, LEECH cướp sao) vì bàn tĩnh; LEECH cướp ~1–2★/trận ở wave 30 rồi trả lại khi chết.
- Chạy bot tự chơi từ wave 1 (`node tools/thap-sim-trum.js 4`): bot hiện chỉ tới wave ~10–18 với mọi trùm, nên chỉ dùng để bắt lỗi (không lỗi).

## Kiểm tra trình duyệt (390×844, Playwright) — `docs/demo-hop-tuong/tuvan/trummoi/`
- `<id>_dai.jpg` (tổng: `TONG.jpg`): dải ảnh theo thời gian mỗi trùm mới (đi trái / đi xuống / đi phải, báo chiêu, tung chiêu, chết/tách). `coop_*`: CO-OP.
- Không lỗi trang (pageerror/console error) ở SOLO và CO-OP. Đường hiện tại chỉ có đoạn đi TRÁI → XUỐNG → PHẢI (không có đoạn đi lên).
- Hình hiện tại = dải MƯỢN của trùm cũ (chờ ảnh Pass 6). Băng giới thiệu dùng tên + dòng đe doạ mới.

## Khi ảnh Pass 6 về
1. `python3 tools/thap-cat-p6-trum.py <id>` → trum_<id>_8 / _side_8 / _back_8 (đăng ký chung 24 khung), fx_trum_<id> (16 khung), trum_<id>_portrait.
2. Thêm `<id>` vào `TRUM_ANH` (trum.js) → bỏ ảnh mượn, hiệu ứng chiêu dùng fx_trum_<id>; dải side/back do hệ hướng nhìn (quaianim.js, session "enemy facing") chọn theo hướng đi.
