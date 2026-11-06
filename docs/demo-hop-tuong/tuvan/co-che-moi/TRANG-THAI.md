# Cơ chế mới đợt 1 — trạng thái (07/11, dừng theo `ban-giao/DUNG-LAI.md`)

Phiên này đọc lệnh DỪNG giữa chừng → làm xong commit đang dở, đẩy lên `claude/demo-hop-tuong`, **KHÔNG xuất bản** lên nhánh live.

## Đã xong (code trên `claude/demo-hop-tuong`)
- **B. Lửa Thập Tự** (`lualien`, vangmoi1.js): ghép có Relay → +1 lửa cho MỌI Relay cùng hàng + cùng cột (o tăng dần); tối đa 8; mỗi lửa +10% (LV9) → 15% (LV15) ST, +2% chí mạng; ụ ra là Relay giữ lửa max của 2 nguyên liệu (+1). Huy hiệu `n/8`, dạng grow 0 / 1–7 / 8, vệt lửa chạy dọc hàng/cột (tờ `p2_ember`; `cm_vetlua` khi về).
- **A. Pháo La Bàn** (thay `canon`, skills.js): mũi tên ngẫu nhiên (online: rngHat hạt giống + bàn + ô + số lần) + số 1. Ghép Pháo vào Pháo cùng sao = ghép giữ loại (ụ đích +1★): cùng hướng cộng · vuông góc giữ số đích · ngược trừ (tối thiểu 1) + sóng nổ (số ụ kéo × 6 phát lên mọi quái trên làn). Mỗi số +15% ST (cấp thẻ → 21%), số > 20 tính 1/3; 5★ TRUE NORTH số ×1.5; 7★ FOUR WINDS +30% ST + 4 hướng mỗi 8 s. Ngắm theo mũi tên, đạn xuyên 60%. Kết quả ghép luôn là ụ thật; Copycat giữ mũi tên + số; Merge King giữ; Mimic → ngẫu nhiên (mất số). Huy hiệu mũi tên + số ở tấm đếm đáy ô (mọi bàn), lúc kéo hiện số sẽ ra (vàng; cam = ngược hướng). Online: cờ `h<hướng>;n<số>;` (oTT/datO), gói `tr.hu`, `gh.hn`.
- **N. Drone Kéo Xa** (`drone`, skills2.js): số drone = quãng kéo (Manhattan) + sao/3, tối đa 8, ×18 ST/drone; dây kéo nối 2 ô; lúc kéo hiện `×n`.
- AI (game.js `aiCapTot`): Pháo ưu tiên cùng hướng → vuông góc vào số lớn → ngược; Drone chọn cặp xa nhất.
- Văn bản EN/VI (meta.js, roster.json, text.js, vi.json → ngonngu-vi.js), Turret File (luật ghép riêng Pháo), Test range (skilldemo: 3 kịch bản mới), hướng dẫn (bước ghép tránh cặp Pháo + chú thích), MOC_RIENG canon, KY_NANG_CAP canon/lualien.
- Ảnh: `CAN-VE.json` (5 prompt). Công cụ cắt `tools/thap-cat-cm.py` → `cm_mui_0..3`, `cm_songno`, `cm_vetlua`, `cm_daykeo` + `js/cm-meta.js` (code tự dùng khi có). Chưa có tờ nào về → đang dùng ảnh mượn (mui_tiep xoay, p2_ember, p3_canon, fx_cham_trang).

## Kiểm đã chạy
- `tools/thap-kt-matran.js` XANH (thêm trạng thái `cmSo` + 3 bất biến: luật Pháo, chữ thập Relay, số drone). MA-TRAN.md ghi lại.
- `tools/thap-kt-ngoai-deck.js` XANH (3006 trận).
- Sim (bộ 4 ụ trắng + X, 10–20 hạt): Pháo 32.73 → 16.2 wave (áp đảo) → hạ ST 26.5 → ~14.0 (cũ 13.1). Drone 10.1 → ~11.5 (giữa bậc xanh). Relay 11.7 → ~12.7 (giữa bậc vàng).

## Còn lại (khi tiếp tục)
1. `tools/thap-kt-hoiquy.js` (≈ 20 phút) — CHƯA chạy; test cũ dùng Cannon làm ụ "trơn" để ghép có thể cần đổi sang `lien` (Pháo + Pháo giờ giữ loại).
2. Soak `SO=60 tools/thap-qa-ngam.js` — chưa chạy.
3. Chụp ảnh từng chế độ (CO-OP bàn đồng đội, PVP bàn đối thủ, ONLINE, Turret File) — mới chụp SOLO: `anh/solo_390x844_dot1.png`.
4. Vẽ CAN-VE bằng ChatGPT → `thap-art/raw_cm_*.png` → `python3 tools/thap-cat-cm.py`.
5. Xuất bản thap/ lên `claude/mobile-tower-defense-game-k5oxzo` (+ `tools/thap-ver.py`) sau khi hồi quy XANH.
