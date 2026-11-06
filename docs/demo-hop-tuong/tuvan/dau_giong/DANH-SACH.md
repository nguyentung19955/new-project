# Đầu ụ giống nhau — kiểm toàn bộ 85 đầu bàn chơi

Nguyên nhân phát hiện: người chơi tưởng có 2 **Twin Maker** (sinhdoi), thật ra con thứ 2 là **Copycat** (saochep) — 2 đầu cùng viền vàng, cùng tâm xám, cùng 2 màn hình xanh lơ phía trước. Luật chơi đúng, chỉ hình gây nhầm.

Công cụ: `python3 tools/thap-dau-giong.py` (điểm = ½ dáng [màu HSV · SSIM · IoU bóng] + ½ bản đồ màu nhấn không tính màu viền độ hiếm). Kiểm hồi quy: `--kiem` (2 ụ cùng độ hiếm ≥ 0,80 → đỏ).

Ảnh: `cap_giong_truoc.png` (trước), `cap_giong.png` (sau), `copycat_truoc_sau.png` (bàn chơi).

## Top 15 cặp giống nhất (trước khi vẽ lại)

# | điểm | ụ A | ụ B | độ hiếm
---|---|---|---|---
1 | 0.844 | Resonance Grid (`luoicheo`) | Mirror Gate (`guongcong`) | Legendary
2 | 0.841 | Star Cannon (`ngoisao`) | Scrap Forge (`loren`) | Legendary
3 | 0.841 | Wall Projector (`wallgen`) | Marionette (`marionette`) | Legendary
4 | 0.838 | Star Cannon (`ngoisao`) | Marionette (`marionette`) | Legendary
5 | 0.835 | Merge King (`vughep`) | Pandora Vault (`pandora`) | Legendary
6 | 0.821 | Scrap Forge (`loren`) | Marionette (`marionette`) | Legendary
7 | 0.820 | Overclock (`epxung`) | Lighthouse (`anhsang`) | Epic
8 | 0.812 | Cleanser (`taylo`) | Storm Gun (`bao`) | Epic
9 | 0.803 | Scrambler (`xaotron`) | Overclock (`epxung`) | Epic
10 | 0.802 | Nemesis (`nemesis`) | Scrap Forge (`loren`) | Legendary
11 | 0.800 | Scrambler (`xaotron`) | Ricochet (`nayda`) | Epic
12 | 0.797 | Overclock (`epxung`) | Ricochet (`nayda`) | Epic
13 | 0.789 | Star Lift (`nangsao`) | Overclock (`epxung`) | Epic
14 | 0.789 | Mine Layer (`min`) | Mystery Box (`hopbi`) | Rare / Epic
15 | 0.789 | Twin Maker (`sinhdoi`) | Copycat (`saochep`) | Legendary

## Xem bằng mắt (cùng độ hiếm, dễ nhầm trên bàn) → vẽ lại

Thứ tự | vẽ lại | giống với | độ hiếm | lý do
---|---|---|---|---
1 | Copycat `saochep` | Twin Maker `sinhdoi` | Legendary | 2 màn hình xanh lơ có hình người — **đã làm riêng** (raw_u3_saochep.png)
2 | Ricochet `nayda` | Overclock `epxung` | Epic | tâm cùng ký hiệu », phía trước cùng bánh răng tròn
3 | Fusion Mixer `tron` | Teleporter `dichchuyen` | Rare | cùng xoáy tím
4 | Cleanser `taylo` | Storm Gun `bao` | Epic | cùng nòng dài xanh lơ
5 | Combo Core `combo` | Chain Link `lienket` | Epic | cùng vòng xích hồng-tím
6 | Mirror Gate `guongcong` | Resonance Grid `luoicheo` | Legendary | cùng khung xanh lơ phía trước
7 | Pandora Vault `pandora` | Merge King `vughep` | Legendary | cùng khối ngọc tím

Không vẽ lại lần này (ghi lại): Overlord ≈ Wyrm Engine (Mythic, cả 2 đều có ảnh lớn dần 3 dạng — vẽ lại phải vẽ cả 3 dạng); Star Cannon ≈ Star Lift (khác độ hiếm, khung khác màu); Scrap Forge ≈ Marionette (nòng khác hẳn khi nhìn gần).

Prompt ChatGPT: `CAN-VE.json` (ảnh 1 = ref, ảnh 2 = avoid).
