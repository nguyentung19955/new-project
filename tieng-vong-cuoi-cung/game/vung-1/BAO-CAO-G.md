# Báo cáo Luồng G – Phân vai phòng, dẫn hướng, chiêu trùm pha 2, cân thời gian hạ trùm

Làm theo phần P1 (phân vai + chống nhàm, dẫn hướng/ánh sáng, cân TTK) và P2 (1 chiêu trùm pha 2) trong
`docs/duyet-2-vung-1-chatgpt.txt`, có tham khảo `docs/tu-van-choi-thu-vung-1-chatgpt.txt`.

**Kết quả kiểm:**
- Kiểm đường đi `game/vung-1/cong-cu-man/kiem-tra.py`: **0 lỗi, 0 cảnh báo**. Đi được P01 → P12, đủ 3 Chuông Vỡ, mọi chỗ đều quay về được P05, khe ≥ 3 ô.
- `tools/vung-1/kiem-thu-f.js`: **65/65**. Có sửa 1 dòng: trước đây phép thử ghi cứng máu trùm = 300, nay so với số máu trong `TRUM_DEF`.
- `game/tools/kiem-thu-vung-1.js` (`?thu=1`): đạt hết, không lỗi JS.
- `kiem-tra-vung1.js`: đi P01 → P12, không thiếu hình, không lỗi JS.
- `thu-e.js`: đạt. Trong danh sách chiêu trùm giờ có thêm `re`.
- `kiem-tra-d.js` (chống kẹt dây leo 5 tình huống × 20 lần): 0 lần kẹt.
- Phép thử mới `tools/vung-1/kiem-thu-g.js`: **4/4** (xem mục 1 và 3).

Không sửa engine. Không đụng `art/quai-moi/ken`.

## 1. Phân vai phòng + chống nhàm

Mọi thay đổi đều sửa trong `cong-cu-man/dung-phong.py` rồi chạy lại để ra `phong/*.json`, sau đó nướng lại ảnh bằng `tools/vung-1/ve-phong.py`. Không sửa tay file JSON. Quái giữ nguyên chỗ, chỉ dời nhẹ vùng đi tuần (ghi rõ ở từng phòng).

| Phòng | Vai | Biến thể địa hình (có mục đích) | Địa danh |
|---|---|---|---|
| **P01** Cửa Rễ | Hướng dẫn | **Gò rễ** cao 1 ô ở cột 36–38. Chia sàn ngang dài 21 ô thành 2 phần: chỗ đấu Khuyết Cẩu và chân dây leo. Khuyết Cẩu đi tuần 28–35 (trước là 29–37). | Chuông đồng đổ nghiêng trên gò; bia đá ở cổng |
| **P02** Ngã Ba Mối | Phân nhánh cao – thấp | **Hốc treo** bằng sàn mỏng có 2 xích treo từ vòm (cột 26–33, đứng hàng 8), bên trên có thẻ tên. Từ sàn hang nhìn thấy hốc nhưng **không nhảy tới được**: gờ gần nhất bên dưới thấp hơn 6 ô. Phải leo dây cột 51 lên tầng trên, rồi đi **cầu rễ cao** mới (cột 38–47, đứng hàng 10) sang trái. Tuyến thấp: lỗ có rễ quấn → tường nứt → lối tắt P06. Thêm bậc đá trước chân dây; bỏ 2 gờ cũ thừa. | Bia đá ngã ba khắc chuông ở giữa sàn |
| **P03** Xưởng Chuông | Xưởng chuông | **Hố đúc** sâu 2 ô, rộng 5 ô (cột 30–34) giữa sàn xưởng. **Bàn đúc** (khối 3×1, cột 35–37) làm bậc. Bệ đúc chắn đạn vẽ bằng khuôn chuông úp. Khuyết Cẩu dời từ 27 → 24, đi tuần 19–28. | Hố đúc có chuông/khuôn vỡ dưới đáy, khuôn chuông lớn, giàn treo Chuông Vỡ 1 |
| **P04** Hành Lang Tro | Hành lang áp lực | **Hõm tro + dây vượt hố**: hõm sâu 4 ô, rộng 6 ô (cột 12–17), có dây rủ từ trần ở cột 15. Cách qua: nhảy bám dây giữa không rồi bật sang bờ tây, hoặc nhảy đôi thẳng qua. Rơi xuống thì leo dây hoặc nhảy đôi ra, không kẹt. Hồn Vải tuần ngay trên hõm tạo áp lực lúc đang bám dây. Mảnh Âm đặt dưới đáy hõm. | Chuông đồng vùi tro trên đỉnh dốc; hài cốt dưới hõm |
| **P09** Miệng Kèn | Đấu tầm xa | **Vật chắn**: bia đá 2×2 ô ở bờ đông miệng giếng (cột 22–23), nằm giữa giếng và Kèn Câm. Đạn kèn nổ vào bia, nên đứng ở miệng giếng hay leo dây xuống đáy lấy Chuông Vỡ 3 đều không bị bắn. **Tuyến cao né đạn**: sàn mỏng thấp (cột 9–12) → gờ mỏng (cột 3–6) → T3 → T4 → T5 → gờ ra đông, đi suốt trên đầu tầm bắn (Màn Tang ở T5 là mối nguy riêng, xen kẽ với kèn). T2 dời sang đông 3 ô để chừa đầu bia. Kèn đi tuần 25–29. | Loa kèn đồng khổng lồ úp dưới đáy giếng; miệng kèn đá trên trần |

**Đã đo bằng Playwright** (`kiem-thu-g.js`):
- Đứng ở miệng giếng sau bia 12 s: **0 lần trúng**.
- Cùng chỗ đó nhưng gỡ bia (chỉ trong phép thử): **có trúng**. Vậy bia thật sự chắn đạn.
- Đứng ở T4 (tuyến cao) 12 s: **0 lần trúng**.

**Hai điều chỉnh vì phép đo:**
- **P01:** đã thử thêm ngách tường nứt dưới hố tro. Công cụ kiểm báo ngách là chỗ một chiều (vào được, không ra được: trần ngách thấp nên không nhảy lên lại được 1 ô). Tôi bỏ ngách đó, không cố giữ.
- **P03:** hố đúc **không** dùng làm chỗ nấp đạn kèn. Đo ra kèn chỉ phát hiện người chơi trong 560 px, mà hố ở xa hơn tầm đó; bệ đúc cũ đã chắn sẵn rồi. Hố đúc chỉ là địa danh và chỗ đổi độ cao.

**Hình đồ vật cho các khối chắn** (`ve-phong.py`, loại trang trí mới):
- `bia_chan`, `be_duc`, `ban_duc`: khối va chạm `#` được vẽ bằng hình bia đá, khuôn chuông úp, hoặc phiến đá có vệt đồng, thay vì cục đá vuông hay bệ rễ.
- Thêm `bia_nga_ba`, `khuon_chuong`, `mo_tro`, `hoc_treo` (xích treo hốc) và `re_quan`.
- Mọi hình đều lấy từ ảnh sẵn có trong `tools/phong-demo/*.png`.

## 2. Dẫn hướng + ánh sáng (`ve.js`, dữ liệu ở `dau_hieu` trong phòng)

**Hai loại dấu, dùng giống nhau ở mọi phòng:**
- **Lối chính:** cọc gỗ treo **chuông nhỏ hổ phách** đung đưa, có quầng hổ phách sáng nhịp chậm. Đặt gần cửa đi tiếp:
  - P01: cửa đông;
  - P02: chân dây và hầm đông;
  - P03: giếng xuống;
  - P04: cửa tây;
  - P05: cửa tây;
  - P06: lối ra P09;
  - P09: miệng giếng và gờ ra đông;
  - P11: hốc cửa trùm.
- **Bí mật:** **vết nứt đỏ sẫm** âm ỉ, có bụi rơi lác đác, **không** có ánh hổ phách.
  - Đặt trên: tường nứt P02 và P03, tường giả P06, giếng Tăng Máu P04.
  - Vết nứt được vẽ sau lớp tường giả, nên không bị che.

**P05 – bia chỉ đường** (`bang_chi_duong`), cạnh cửa tây:
- Bia có 3 ổ chuông, sáng dần theo số Chuông Vỡ đã có.
- Chữ "Chuông Vỡ n/3" và "Còn thiếu n · ← Sảnh Chuông Vỡ" kèm mũi tên khắc chỉ đường đi P06 → P09 → P11.
- Khi đủ 3 thì đổi thành "← Đủ 3 · Cửa Đàn Chuông Câm".
- Ảnh: `P05-bia-0/2/3.png`.
- Đèn trong P05 dời 2 ô để không đè lên bia.

**Sáng cục bộ:**
- Vật phẩm sáng hơn (bán kính 30, trước là 22).
- Dấu lối chính, vết nứt bí mật và bia P05 đều có quầng sáng riêng.
- Nền xa vẫn tối, không tăng sáng toàn màn.

## 3. Trùm: chiêu pha 2 "Rễ Móc Mộ" (`trum.js` + `ve.js`)

**Cách chiêu chạy:**
- Chỉ dùng ở pha 2. Trùm giơ chuông, rồi **3 vết nứt đỏ** lần lượt toác trên sàn:
  - vết 1 ngay dưới chân người chơi;
  - vết 2 và 3 lùi dần ra xa trùm, mỗi vết cách nhau ~2,2 ô và ra sau vết trước 0,27 s;
  - người chơi sát tường thì đổi phía.
- Mỗi vết nứt **báo trước 0,6 s** (yêu cầu ≥ 0,5 s). Trong lúc báo có cột đỏ mờ cao đúng bằng rễ và sỏi bật lên.
- Sau đó rễ trồi lên: **cao 92 px** (thấp hơn tầm nhảy thường), gây sát thương trong 0,45 s rồi rút.
- Đứng yên thì trúng rễ 1. Chạy thẳng ra xa thì gặp rễ 2 và 3. Muốn né phải **nhảy qua** hoặc **đổi chỗ vào gần trùm**.

**Hình rễ:**
- Khối điểm ảnh 6 px, thân cong, có gai nhánh và móc quặp ở đỉnh.
- Màu **đen + đỏ gạch**, không dùng cyan.
- Vẽ sau lớp bóng tối nên luôn thấy rõ (ảnh `re-1…4`).

**Nhịp pha 2 đổi hẳn**, không chỉ tăng sát thương:
- Vòng chiêu mới: Mưa Mặt Nạ → Rễ Móc Mộ → Quét/Gõ → lặp lại.
- Vẫn giữ quy tắc: chắc chắn có Mưa Mặt Nạ trong mỗi 3 chiêu, và Rễ Móc Mộ cũng có trong mỗi 3 chiêu.
- Đã đo: pha 1 không ra rễ; pha 2 ra rễ; mỗi rễ báo nứt ít nhất 36 khung.
- Phép thử luồng F xác nhận vẫn **0 lần trúng đòn không báo trước**.

**Thời gian hạ trùm (TTK):** đo bằng `tools/vung-1/do-ttk.js`.
- Người chơi máy "trung bình": áp sát, chém liên tục (nhả phím giữa các lần), chỉ né được một phần đòn, thỉnh thoảng lùi ra xa. Không cộng sát thương giả.
- Máu trùm cũ 300: trung bình **28,8 s**, quá nhanh.
- Máu trùm mới **640** (chuyển pha vẫn ở 50%), 6 trận:

| Chỉ số | Kết quả |
|---|---|
| Thời gian hạ trùm | **trung bình 61,7 s** (50–73 s) |
| Lúc chuyển sang pha 2 | giây 23–39 |
| Số lần ra Rễ Móc Mộ | 4–6 lần mỗi trận |

- Người thật thường đánh ít liên tục hơn người chơi máy, nên trận thật sẽ rơi vào khoảng 60–90 s.
- Kết quả từng trận nằm trong `tools/vung-1/xem/g/ttk.txt`.

## 4. Ảnh đã chụp và tự xem (`tools/vung-1/xem/g/`)

| Nhóm | Ảnh |
|---|---|
| Từng phòng | `P01-*`, `P02-*` (ngã ba, hốc treo, chân dây, tường nứt), `P03-*` (hố đúc, xưởng, giếng), `P04-*` (hõm tro, đỉnh dốc, cửa tây), `P05-bia-0/2/3`, `P06-*`, `P09-*` (bia chắn, tuyến cao, đáy giếng, cửa đông), `P11-hoc-dong`, `P12` |
| Rễ Móc Mộ | `re-1-bao-nut`, `re-2-troi-1`, `re-3-ca-ba`, `re-4-rut` |
| Kết quả kiểm | `ket-qua-g.txt`, `ttk.txt` |

**Đã sửa sau khi tự xem ảnh:**
- Bia P05 bị đèn thờ đè → dời đèn, làm đỉnh bia bo tròn, chữ to hơn.
- Vết nứt bí mật nhỏ và bị tường giả che → phóng ×1,6, vẽ sau lớp tường giả, đặt đúng lên tường.
- Rễ trùm mảnh và tối → làm thân dày hơn, thêm gân đỏ gạch, gai và móc to.
- Loa kèn P09 không đặt được (va sàn mỏng) → thêm tham số cỡ `co`, nay đã hiện.
- Bàn đúc P03 ban đầu chiếm chỗ đứng trước dây cột 42 (phép thử dây leo của luồng D báo lỗi) → dời sát mép hố.

## Cách chạy
```
cd tieng-vong-cuoi-cung && python3 -m http.server 8765
python3 game/vung-1/cong-cu-man/dung-phong.py && python3 tools/vung-1/ve-phong.py   # dựng phòng + nướng ảnh
python3 game/vung-1/cong-cu-man/kiem-tra.py --khong-ve                          # kiểm đường đi
node tools/vung-1/kiem-thu-g.js     # bia chắn, tuyến cao, Rễ Móc Mộ
node tools/vung-1/do-ttk.js 6       # đo thời gian hạ trùm
node tools/vung-1/chup-g.js ; node tools/vung-1/chup-re.js   # ảnh
```

## Còn lại / gợi ý
- Hốc treo P02: tôi đo được gờ gần nhất bên dưới thấp hơn 6 ô (nhảy đôi cao ~4,7 ô), nên coi là không với tới từ dưới. Nên cho người thật thử thêm.
- Người chơi máy trúng 22–32 đòn mỗi trận (máu được hồi liên tục). Người thật sẽ chết vài lần trước khi thắng. Nếu thấy quá khó, có thể giảm máu trùm còn ~560 hoặc giảm tần suất Quét ở pha 2.
- Rễ Móc Mộ đang vẽ bằng khối điểm ảnh. Nếu muốn đồng bộ với hình trùm, có thể nhờ ChatGPT vẽ 1 dải hình "root spike" 4–6 khung (đen + đỏ gạch, nền #FF00FF).
- Chưa có âm thanh cho vết nứt và rễ (chờ phần âm thanh P2).
