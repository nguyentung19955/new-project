# Prism Thief (bienmau) — làm lại lần 2: TƯỚNG HỢP THỂ (08/11)

Nguồn: GHI-CHU.md §7 + ý người dùng 08/11: "giữ ụ xong di thì nó thấy hình mặt nạ nằm dọc, đáng ra phải nằm ngang chứ, vuốt nó không biến thành mặt nạ 4 màu à?" · "Tại vì nó đang là tướng có thể tăng sức mạnh sau khi hợp thể, càng hợp thể nhiều càng mạnh".
Nguyên tắc chốt (A7): điều kiện càng khó → thưởng càng cao; cộng dồn kỹ năng đặc biệt không trần.
Code: `thap/js/skills7.js` (SKILLS.bienmau, HU.pmHop, vệt vuốt) · test: `tools/thap-kt-prism.js` · ảnh tổng: `TONG.jpg`.

## 1. Prism đơn (giữ như §7)

- Xuất hiện (triệu hồi / ghép / sinh / chép) → 1 màu NGẪU NHIÊN (RNG hạt trận + bàn + ô + số lần quay), giữ suốt đời. Đầu = mặt nạ màu `bienmau_m_*`.
- Đỏ 4% giết ngay quái thường · Vàng 6% +2 mana · Lam 8% đóng băng 1 s · Lục 10% +40% ST chí mạng đòn đó. Mỗi lần kích → +1 cộng dồn màu đó.
- Trần cộng dồn ụ đơn 10 → 18 theo cấp thẻ (đúng ghi chú §7). Prism đơn + Prism đơn cùng sao vẫn ghép thường (ra ụ ngẫu nhiên +1★).

## 2. HỢP THỂ — SPECTRUM PRISM (mặt nạ 4 màu)

- **Cách làm:** vuốt 1 đường qua 4 ô liền nhau (trên/dưới/trái/phải, không chéo, không lặp) toàn Prism, các Prism ĐƠN trên đường khác màu nhau. Khi đủ 4 ô hợp lệ, vệt vuốt sáng trắng + chữ "Release: FUSE into 1 mask".
- **Kết quả:** 1 mặt nạ 4 màu ở **ô cuối** vuốt, 3 ô kia trống. **Là ghép thật** (đi qua `ghep()` bằng `ghepDB.laGhep` → Archive, MERGE SURGE, nhiệm vụ, thống kê đếm 1 lần).
- **Số hợp thể n** (hiện trên ô: icon mặt nạ + "×n"): n = tổng n của nguyên liệu + 1. Không trần.
- **Cộng dồn:** cộng dồn của 4 nguyên liệu CỘNG HẾT vào đúng màu (Prism đơn góp màu của nó, mặt nạ góp cả 4).
- **Sao:** sao CAO NHẤT trong 4 ụ (chọn thay vì ceil(trung bình) kiểu La Bàn: hợp thể đã tiêu 3 ụ, không bắt người chơi mất sao; muốn sao cao thì hợp thể cùng Prism sao cao hoặc dùng Merge King).
- **Hồi chiêu:** không (hợp thể tiêu ụ — chi phí đã đủ). Bỏ CHROMATIC CIRCUIT / đòn kết theo màu cuối.

## 3. Sức mạnh mặt nạ n (khó hơn → thưởng cao hơn, không trần)

| Mục | Công thức |
|---|---|
| Hiệu ứng | đủ 4 màu mỗi phát (mỗi màu quay riêng, hồi 1 s / quái / màu) |
| Tỉ lệ mỗi màu | gốc × (1 + 0.25 n) (n=1: 5/7.5/10/12.5% · n=4: 8/12/16/20%) |
| Sát thương | +300% × n (cùng nhóm cộng gộp; = sát thương của 3 ụ đã tiêu cho mỗi lần hợp thể) |
| Tốc bắn | +10% × n |
| Trần cộng dồn mỗi màu | trần đơn × (1 + n) (10 → 20 → 30…; LV17: 18 × (1 + n)) |
| Vàng | +2 + ⌊n/2⌋ mana mỗi lần kích; trần mana/giây cả bàn 6 + 2 × n lớn nhất |
| Bậc sáng ảnh | n 1–2 `bienmau_hop_1` · 3–4 `_2` · 5–9 `_3` · 10+ `_4` |

## 4. Hợp thể lại & các luật ghép

- **Hợp thể lại (khuyến nghị đã làm):** mặt nạ trên đường vuốt là **ô đại diện** (tính là màu nào cũng được). Vuốt mặt nạ + 3 Prism khác màu nhau (bất kỳ 3 màu khác nhau) → n cộng. Vuốt kết thúc ở mặt nạ thì mặt nạ ở nguyên ô; kết thúc ở Prism khác thì mặt nạ "chuyển" sang ô đó. Có thể có nhiều mặt nạ trên cùng 1 đường (n cộng hết).
- **Mặt nạ + mặt nạ (kéo):** cho phép, là ghép thật: n = a + b + 1, cộng dồn cộng hết, sao cao nhất.
- **Mặt nạ KHÔNG ghép thường** (với Prism đơn, Mimic, ép ghép kéo-thả thường): tránh lỡ tay mất n.
- **Merge King / thưởng sao tại chỗ:** không phải ghép, không reset — giữ thân, n, cộng dồn.
- **Copycat chép mặt nạ:** bản sao là lần xuất hiện mới → **Prism ĐƠN** màu ngẫu nhiên mới, 0 cộng dồn (luật "chép / sinh → quay lại"; khớp nhánh ngẫu-nhiên-khi-xuất-hiện). Mặt nạ gốc giữ nguyên.
- **Hoá đá / đóng băng:** không hợp thể được tới khi giải.

## 5. Hình ảnh

- Mặt nạ LUÔN nằm ngang/thẳng: `gocDau` = 0 khi vẽ mặt nạ, đầu dự phòng `bienmau_nong` xoay −90°; bản cầm kéo (ghost) vẽ đúng mặt nạ (`dauGhost`) và không nghiêng theo tay.
- Vệt vuốt: tia màu nối các ô đã đi qua (đủ 4 ô hợp lệ → sáng trắng).
- Hiệu ứng hợp thể (`HU.pmHop`, 1.1 s): mặt nạ nguồn bay vòng về ô cuối (giữ ngang) → dải `fx_bienmau_hop` 8 khung (4 quả cầu màu xoáy vào, chớp, vòng cầu vồng nổ) + chữ "FUSION n". Chỉ hình ảnh, không đổi luật.
- Mặt nạ hợp thể: 4 đốm màu quay quanh (dưới đầu), bậc sáng theo n.
- Ảnh mới (ChatGPT, 08/11): `bienmau_hop_1..4.png` (320×320), `fx_bienmau_hop.png` (8 × 256). Chưa có bản pixel → `docs/pixel/DANH-SACH.md` mục Bổ sung; ảnh chưa tải thì vẽ mặt nạ màu đơn / dải `fx_bienmau_sk` cũ.

## 6. Tất định & online

- RNG hạt giống (không Math.random). Gói `pm` = { o: đường vuốt, r: cờ ô kết quả } — máy chủ bàn không gửi thêm `gh`. Bàn con rối chạy đúng hợp thể rồi chốt ô cuối theo `r` (lệch → vẫn chốt). Cờ ô: `q` màu · `u` cộng dồn đơn · `F` n · `K` cộng dồn 4 màu (a.b.c.d).
- Mặt nạ + mặt nạ (kéo) đi gói `gh` ghép đặc biệt như các ghepDB khác.

## 7. AI

- Có đường hợp thể hợp lệ → vuốt (ưu tiên đường kết thúc ở mặt nạ có sẵn / sao cao). Có ≥ 2 mặt nạ → kéo gộp.
