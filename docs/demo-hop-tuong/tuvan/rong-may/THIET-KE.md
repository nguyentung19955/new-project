# Rồng Máy (Wyrm Engine, `ronglua`) — thiết kế lại "LÒ PHẢN ỨNG" (08/11)

## Vì sao làm lại
Người dùng: *"chưa thấy thể hiện gì là tướng đỏ, không có cơ chế gì, dame yếu, hiệu ứng xấu, biến hình không đổi hình dạng"*.
Đo trước khi sửa (`/tmp` script cùng cách `tools/thap-sim-co-bac.js dps`: 4★ wave 12, cấp thẻ +3, ô 2):
đơn mục tiêu **9k/phút** (Hive Queen 71k), đám đông 101k. Cả 3 dạng dùng chung 1 đầu `ronglua_nong` + quầng màu.

## Tư vấn ChatGPT (tóm tắt)
Hỏi 3 cơ chế Đỏ tạo quyết định thật + 4 dạng hình. ChatGPT đề xuất:
1. **INFERNAL REACTOR** — thanh nhiệt: phun tích nhiệt, xả (Vent/Supervent), Dive dùng nhiệt. *(ChatGPT chọn)*
2. **DRAGON CROSSFORGE** — ghép thật cùng HÀNG/CỘT bật ống lửa ngang/dọc 30 s.
3. **DRAGON HOARD** — kho báu từ ghép quanh rồng, không trần, Dive "cướp" kho.
Kèm 4 dạng: Hatchling Engine → Winged Wyrm → Armored Dragon → Inferno Dragon (đổi hình thật, không chỉ màu lửa).

## Chọn: LÒ PHẢN ỨNG (1) + nạp nhiệt bằng ghép hàng/cột (lấy ý 2)
- Bỏ nút "Vent" riêng (1 ụ 2 kiểu chạm dễ nhầm) → **Dragon Dive chính là cú xả**: đốt HẾT nhiệt.
- Lấy phần "ghép cùng hàng/cột" của Crossforge làm **nguồn nhiệt thứ 2** → người chơi phải tính chỗ ghép (kiểu Pháo La Bàn / Ember Relay người dùng thích).
- Không trần nhiệt (luật "không trần cộng dồn"); thay vào đó lò **nguội 2%/giây** → phun liên tục cân bằng ~250, muốn cao hơn phải ghép hàng/cột (điều kiện khó → thưởng lớn).

## Luật (tất định)
| Thành phần | Số |
|---|---|
| Nón lửa | 5 nhịp/s, mỗi nhịp **0.7D** mọi quái trong nón (40→75°, 130→165 px, 7★ ×1.15) + CHÁY 3 s (0.15D × 1.5 × sao, nguồn mạnh nhất) |
| TIA TIM LÒ (từ 3★) | mỗi nhịp thêm **J×D** vào quái ĐẦU trong tầm tia (= 1.6 × tầm nón): J = 1.6 (3–4★) · 2.0 (5–6★) · 2.0 × **2 quái** (7★) |
| NHIỆT | +1 mỗi nhịp có trúng · **+5 × sao ụ ra** mỗi GHÉP THẬT có ô kết quả cùng hàng hoặc cột với Rồng (Rồng là nguyên liệu: không tính) · nguội 2%/s · Rồng+Rồng ra Rồng giữ nhiệt lớn hơn |
| Thưởng nhiệt | **+0.2% ST mỗi nhiệt** (nhóm sát thương) · ≥100 QUÁ NHIỆT +25% tốc phun · ≥250 NÓNG CHẢY +100% ST chí mạng |
| DRAGON DIVE (3★+, hồi 32 s, chạm) | đốt HẾT nhiệt: mỗi quái trên đường **25D × (1 + nhiệt/100)** (+5% máu tối đa trùm), vệt cháy × (1 + nhiệt/200). Nhiệt về 0. |
| Tự dùng | Người chơi để đầy: **chỉ tự lao khi có TRÙM** (giữ lò là quyết định của người chơi). AI: có trùm, hoặc nhiệt ≥ 200, hoặc ≥ 6 quái và nhiệt ≥ 100. |
| Dạng lửa | 5–6★ lửa XANH, 7★ lửa TRẮNG: +30% lên quái to/trùm (nón + tia); 7★ vệt cháy 4 s |

**Quyết định người chơi:** lao sớm cứu đường (mất thưởng nhiệt, đơn mục tiêu giảm) ↔ giữ lò nóng chờ cú lao lớn; đặt Rồng ở hàng/cột nơi hay ghép.
Online: nhiệt đi theo cờ ô `H` (dongbo.js), Dive = gói `cd`, ghép chạy cùng hàm `ghep` ở bàn con rối; không Math.random trong luật (hạt lửa / số nổi chọn theo `banLan`).

## 4 dạng (đổi HÌNH thật)
| Sao | Dạng | Hình (ChatGPT, `raw_mod_ronglua_f<n>.png`) | Đòn |
|---|---|---|---|
| 1–2★ | HATCHLING ENGINE | lò trứng tròn, vỏ trứng nứt, 2 vây nhỏ, bệ tròn nhỏ | phun cam ngắn |
| 3–4★ | WINGED WYRM | cổ dài thon, cánh tua-bin lớn, bệ móng vuốt | nón + tia tim lò, mở Dive |
| 5–6★ | ARMORED DRAGON | ngực giáp rộng, 2 ống xả, cánh lưỡi thép viền xanh, bệ lục giác | lửa XANH +30% quái to |
| 7★ | INFERNO DRAGON | vương miện sừng vàng, lò ngực trắng-vàng, cánh xương lửa chảy, bệ vương miện | lửa TRẮNG, tia trúng 2, vệt 4 s |

Hoạt ảnh (chỉ hình): 2 cánh vẽ riêng (`ronglua_f<n>_canh`) **vỗ quanh gốc cánh** (nhịp/biên độ theo dạng), lúc phun dang cánh + giật lùi + đầu phồng 3,5%, tim lò sáng theo nhiệt, dạng 7★ bay lơ lửng; **đổi dạng 0,65 s**: dạng cũ co + trắng → chớp → dạng mới bung 0,85 → 1,1 → 1. Bệ đổi theo dạng (`ronglua_f<n>_de` + viền bậc riêng). Tia tim lò = dải `fx_wyrm_lua2` kéo hẹp + loé trúng. Nhiệt = tấm đếm nhỏ (ngọn lửa cam → vàng ≥100 → trắng ≥250 + số).
Ảnh chưa tải → vẽ đầu cũ `ronglua_nong` (dự phòng).

## Số đo (`tools/thap-kt-rong-may.js`, cùng cách đo `thap-sim-co-bac dps`: wave 12, cấp thẻ +3, 300 s; đám đông hs 20)
| Ụ | 1★ đơn / đông | 4★ đơn / đông | 7★ đơn / đông |
|---|---|---|---|
| Hive Queen | 8k / 8k | 71k / 77k | 310k / 279k |
| Leviathan | 7k / 13k | 27k / 163k | 147k / 308k |
| Black Hole | – | 31k / 102k | – |
| Werewolf | – | 23k / 23k | – |
| **Rồng Máy cũ** | 2k / 13k | **9k / 101k** | 26k / 252k |
| **Rồng Máy mới** (không lao, lò ~250) | 2k / 15k | **84–88k / 174–175k** | **250k / 713k** |
| Rồng Máy mới, lao mỗi khi nhiệt ≥150 | – | 69k / 228k | – |
(1–2★ không có tia: dạng non chỉ là bước đệm. Lao sớm đổi sát thương đơn lấy sát thương đám đông.)
