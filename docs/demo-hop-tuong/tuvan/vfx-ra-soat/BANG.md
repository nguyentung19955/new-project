# Rà soát VFX triệu hồi / đạn / kỹ năng chủ động (07/11)

Cách đo: `tools`-ngoài (script tạm) dựng cảnh trong TRẬN 844×390 DPR2 (ụ ở ô 7, 10 quái trên đường, wave 6), kích hoạt kỹ năng
(chuDong / nạp đầy / ghép thật `ghep(B,a,b,true)`), bước mô phỏng cố định 80–150 ms/khung, chụp 36–44 khung + đo ms mỗi khung
(`REN.ve`). Ảnh: `CONTACT-A.jpg`, `CONTACT-B.jpg` (mỗi hàng 4 khung). Máy đo đang tải nặng (load ≈ 17 trên 2 lõi) nên **ms tuyệt
đối chỉ để so tương đối**; "pop" = độ thay đổi ảnh giữa 2 khung liên tiếp lớn nhất / trung vị (≥ 8 = có cú bật/chớp đột ngột).

Tiêu chí người dùng: (1) không giật, (2) đồng bộ với gameplay, (3) hợp lý (hướng, cỡ, lớp, gốc ở nòng), (4) đẹp; thêm (5) **icon nhỏ được không?** —
không phải hiệu ứng nào cũng cần vòng to quanh ụ; vòng kín ô chỉ để cho trạng thái lớn.

| Hiệu ứng | Giật (ms vẽ trung vị / đỉnh · pop) | Đồng bộ | Hợp lý | Đẹp 1–5 | Icon nhỏ được? |
|---|---|---|---|---|---|
| Wyrm Engine — DRAGON DIVE | 6.6 / 76 · 3.6 | "Bổ nhào" thực ra là tia lửa kẻ từ ụ tới từng đoạn đường; không có con rồng lao dọc đường | Đầu rồng ≈ 1,5 ô che ụ bên cạnh | 3 | Không (chiêu lớn) |
| Hive Queen — SWARM | 3.3 / 118 (khung 2) · **11.2** | Nổ trên đường bật lên khi drone còn giữa bàn | Bầy chỉ thấy 1–3 drone nhỏ, không ra "bầy"; cuối có vòng vàng to quanh ụ | 2 | Có — drone là icon nhỏ; bỏ vòng to |
| Leviathan — TIDAL BREATH | 5.5 / 62 · 5.1 | Tia băng chạy dọc đường khớp vùng đánh | Đầu rồng băng to nhưng đúng chiêu lớn; quả cầu băng đọng lại dọc đường | 4 | Không |
| Nine-Tail — 9 foxfire | 2.5 / 61 · 3.4 | Bung toả tròn rồi trôi chậm, trúng muộn | Hoả hồ trông như chong chóng nâu đục, không giống lửa cáo; **vòng vàng kín ô thường trực** | 2 | **Có** — đếm đuôi bằng icon đuôi nhỏ trong ô thay vòng |
| Orbital — AWAKEN bom | 2.7 / 65 · 2.1 | Đòn rơi = vạch hồng mảnh từ mép trên, va chạm gần như không thấy | **Vòng vàng xoay to thường trực 23 s+** | 2 | **Có** — vệ tinh nhỏ quay trong ô |
| Drone Bay — drone bom | 5.1 / 122 · 2.4 | Drone bay chậm, khó thấy lúc nổ | Drone quá nhỏ/mờ | 2 | Có (drone đã nhỏ — cần rõ hơn) |
| Wall Projector — tường | 3.7 / 85 · 5.5 | Tường dựng đúng chỗ chặn | Cột vàng đọc tốt | 3 | — |
| Overlord — sấm | 3.1 / 127 · **46.3** | Sét đánh ngắn trên đường | **Chớp trắng toàn màn** rồi phủ xám kéo dài | 2 | Không — nhưng bỏ chớp toàn màn |
| Lighthouse — quả cầu | 2.9 / 215 (khung 8) · 2.0 | Vòng xanh ở ô trống rồi hiện ụ 1★ — khớp | Quả cầu sáng rất nhỏ | 3 | Đã nhỏ |
| Hydra 7★ — tia hợp nhất | 1.9 / 352 (khung 13) · **14.5** | Trúng đúng lúc | **Tia vượt quá mục tiêu tới mép màn**; phủ màu cả màn | 3 | Không |
| Black Hole | 3.2 / 122 · **10.2** | Hút → nén → nổ khớp | Xoáy bị cắt ở mép canvas; phủ tím cả màn lúc nén | 4 | Không |
| Time Bomb | 2.0 / 16 · 3.6 | Đếm ngược trên quái khớp | Nổ cuối hơi nhỏ | 3 | Đã nhỏ |
| Mortar — CLUSTER | 1.3 / 329 (khung 19) · 2.2 | Đạn bay chậm, nổ nhỏ | **Viên đạn to hơn cả ụ**; đạn chùm phụ không thấy | 2 | Có (đạn nhỏ lại) |
| Mine Layer | 1.3 / 6 · 2.8 | — | Một hình "nổ" đứng yên trên đường > 2,5 s (trông như đóng băng) | 2 | Có |
| Ember Relay — lửa hàng/cột | 1.4 / 8 · 4.0 | Vòng cam to 2 lần khi ghép; không thấy ngọn lửa đi tới Relay cùng hàng/cột | Vòng kín ô cho việc nhỏ | 3 | **Có** — ngọn lửa nhỏ nhảy tới từng Relay |
| Fusion Archive — 3 xung | 1.4 / 11 · 2.9 | **Xung bắn lúc 0 ms, trước khi lộ kết quả ghép (~0,5 s)** | Xung = vòng xanh nhỏ ở quái | 2 | Có |
| Chỉ huy (Hero/Dahlia/Eve) | — | Chưa quay được: `CH.dung` từ chối trong cảnh dựng (cần lượt sau) | — | — | — |

Ghi chú đo: đỉnh ms đơn lẻ (Hydra 352, Mortar 329, Lighthouse 215) rơi giữa chuỗi, không phải khung đầu → nhiều khả năng do máy đang
tải nặng/GC; cần đo lại trên máy rảnh trước khi kết luận giật. "pop" thì là thật (đổi ảnh đột ngột: chớp/phủ màu toàn màn).

## Đã sửa bằng code (chỉ hình, luật không đổi) — 07/11
- **Overlord**: bỏ chớp trắng toàn màn (`FX.sang 0.7→0.1`), rung `12→6` → pop 46 → 16 (`TRUOC-SAU-overlord.gif`). Lớp phủ xám kéo dài vẫn còn — chưa rõ nguồn (có thể là màu nền wave/cảnh báo trùm), cần soi tiếp.
- **Hydra 7★**: tia hợp nhất dừng sau quái xa nhất bị xuyên 40 px (luật xuyên 720 px giữ nguyên), bỏ phủ xanh toàn màn → pop 14.5 → 2.6 (`TRUOC-SAU-hydra.gif`).
- **Black Hole**: bỏ phủ tím toàn màn lúc nén (`0.25→0.08`), rung `8→6` → pop 10.2 → 3.9 (`TRUOC-SAU-blackhole.gif`).
- **Mortar**: đạn cối nhỏ lại (`FXU mortar k 2.3→1.3`, trước to hơn cả ụ) (`TRUOC-SAU-mortar.gif`).
- Đo lại khi máy bớt tải: đỉnh ms của 4 hiệu ứng này còn 5–31 ms → các đỉnh 300+ ms lần đầu là do máy bận, không phải lỗi hiệu ứng.

## Ảnh mới đã gen (top 5 cần hình — CHƯA gắn vào game, chờ duyệt) — `docs/demo-hop-tuong/thap-art/`
| Ảnh | Dùng cho | Cách gắn đề xuất |
|---|---|---|
| `raw_fx_cuuvi_hoho.png` (6 khung) | Nine-Tail: hoả hồ thay chong chóng nâu | thay sprite `hoHoa`, cỡ 18–24% ô; bỏ vòng vàng kín ô → 9 icon đuôi nhỏ |
| `raw_fx_orbital_no.png` (6 khung) | Orbital: nổ khi bom rơi | đặt ở điểm rơi đúng lúc trừ máu, 55–65% ô; vòng thức tỉnh to → chỉ chớp 250 ms đầu |
| `raw_fx_min_mo.png` (6 khung, đèn nháy) | Mine Layer: mìn chờ thay hình "nổ đứng yên" | lặp 600–800 ms dưới chân quái; khi nổ mới dùng ảnh nổ |
| `raw_fx_mortar_chum.png` (6 khung) | Mortar CLUSTER: nổ chùm 5 tia | phát ở điểm rơi viên đạn thứ 3 |
| `raw_fx_drone_bom.png` (6 khung) | Drone Bay: drone bom rõ hơn | 25–30% ô, xoay theo hướng bay |

## Cần người dùng duyệt (đụng nhịp luật hoặc cần thêm hình)
1. **Fusion Archive**: 3 xung nổ lúc 0 ms (trước khi lộ kết quả ghép ~0,34–0,5 s) — sửa đúng là lùi cả sát thương theo (đổi nhịp luật ~0,4 s).
2. **Hive Queen SWARM**: nổ trên đường trước khi drone tới — cần soi luật bay/trừ máu; có thể phải đổi thời điểm trừ máu.
3. **Wyrm DRAGON DIVE**: muốn rồng thật lao dọc đường → cần dải rồng bổ nhào mới + đổi cách vẽ (hiện là tia).
4. **Ember Relay / Lighthouse / Leviathan / Wall / Time Bomb**: các đề xuất hình phụ trong `CHATGPT.md` (ngọn lửa nhỏ nhảy tới Relay, cầu sáng to hơn, mặt sóng băng, dải dựng tường, nổ bom to hơn).
5. **Chỉ huy (Hero/Dahlia/Eve)**: chưa quay được trong cảnh dựng (`CH.dung` từ chối) — làm lượt sau.
