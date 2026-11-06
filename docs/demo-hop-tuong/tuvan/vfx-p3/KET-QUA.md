# VFX P3 — hiệu ứng riêng cho 79 ụ còn lại (06/11)

Yêu cầu: tuvan/vfx/YEU-CAU-ANIM.md (không ảnh tĩnh lắc / phập phồng / nhấp nháy) + REVIEW-VFX-93 §III. Kiểm toán: [AUDIT.md](AUDIT.md). Ảnh cần vẽ: [CAN-VE.json](CAN-VE.json) (20 tờ 4×4, chưa có — ANH-TRE.md).
Luật chơi KHÔNG đổi (vùng trúng / sát thương / thời điểm / mục tiêu); không Math.random mới (hạt dùng băm); Copycat = cùng id → cùng hình; mọi chế độ dùng chung FX/HU/SKILLS.

## Đã làm (chỉ code, đợt 1)
- **Nổ trúng + chớp nòng của mọi ụ** (52/79 ụ dùng ảnh tĩnh phóng 0,6→1,1): `CG.K3` (camgiac.js) dựng từ CHÍNH ảnh ChatGPT của ụ 1 dải 6 khung
  loé → bung → khoét tâm + bẻ mép thành mảnh → tan (chớp nòng 4 khung phụt → dài → tắt), cộng tia lửa màu nguyên tố + vòng dư âm cho đòn lớn.
  Dựng sẵn lúc vào trận (rảnh, 60 ms/dải), ≤ 2 dải/khung nếu thiếu, trần 48 dải. Ảnh lệch nguyên tố (Tesla lõi cam) → dải phủ màu nguyên tố.
- **27 ụ có ảnh lắc / phập phồng / nhấp nháy riêng** → đứng yên hoặc hạt thật (bảng AUDIT): Laser (tia rung + điểm cháy xoay → điểm cháy = dải lặp khung),
  Wall Projector (nhấp nháy khi tắt → tắt dần), Time Bomb (đèn nháy → ngòi phụt lửa nhanh dần), Mine, Drone (nhún → lửa đuôi), Mystery Box (lắc → đứng, sáng rỉ),
  Berserker (nháy 20 rad/s → than đỏ bay lên), Mana Core, Mimic, Hive Queen (ong phập phồng/lắc), Pandora (hộp lắc), Combo, Hydra, Nine-Tail, Lone Ace, Scrap Forge,
  Mirror Gate, Resonance Grid, Merge King, Blood Circuit, Prism Thief, Chain Link, Werewolf, Cloner/Copy glow, khối băng Freezer.
- EFFECTS Full / Balanced / Minimal: tia lửa ×1 / ×0,62 / ×0,34, Minimal bỏ vòng dư âm; REDUCE FLASH: khung loé sau mờ ×0,85.

## Khi tờ ChatGPT về (1 lệnh, tự gắn)
`python3 tools/thap-cat-p3.py` → cắt `docs/demo-hop-tuong/thap-art/raw_p3_<ụ>.png` thành `thap/assets/p3_<ụ>.png` + `thap/js/p3-meta.js` → `vfxp3.js` tự dùng
(nổ trúng 12 ụ, Time Bomb ngòi→nổ, Mine đèn→nổ, tường vàng dựng→rung→vỡ, Mystery Box rung→bật nắp, Toxic Pool sủi lặp, Eclipse / Blizzard / Nine-Tail lúc ra chiêu).
Tờ lệch màu nguyên tố → điền `SAC = {'<ụ>': hue}` trong thap-cat-p3.py, chạy lại, rồi `node tools/thap-kt-mau.js` phải XANH.

## Kiểm
- `node tools/thap-kt-p3.js` → `strips/<id>_atk.jpg` / `<id>_sk.jpg` (8 khung × 0,07 s, iPhone 13) cho 61 ụ có thay đổi; `MODE=coop|pvp` (bàn đồng đội / đối thủ): `*_coop.jpg`, `*_pvp.jpg`;
  `strips/gon/` = EFFECTS Minimal + REDUCE FLASH. 0 lỗi trang (SOLO / CO-OP / PVP).
- Màu: `thap-kt-mau` XANH 116/116 (trước sửa Tesla 1★ ra cam 26° — đã sửa).
- Hiệu năng `node tools/thap-kt-p3-perf.js` (CPU ×4, 15 ụ trộn, 30 quái, sau làm ấm): trước p50 9,0 / 8,8 ms, p95 19,9 / 16,4, tb 9,96 / 9,74 — sau p50 8,9 / 8,3, p95 14,0 / 16,7, tb 9,22 / 9,09 (không tụt).
- Hồi quy 390×844 NHANH: XANH (1752 s, 0 lỗi).
