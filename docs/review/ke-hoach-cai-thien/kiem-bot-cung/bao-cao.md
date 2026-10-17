# Kiếm bớt cứng (17/10) — báo cáo

## Phần A — hình que + prompt để gen lại 3 hàng kiếm (xong)

- Hình que người đặc mới (thư mục `docs/khung-que-8-huong/nguoi-dac/`):
  - `kiem-1-v3-e.png` — kiếm 1, 7 khung, **★ khung 4**
  - `kiem-2-v3-e.png` — kiếm 2, 6 khung, **★ khung 3**
  - `kiem-3-v3-e.png` — kiếm 3, 7 khung, **★ khung 4**
  - GIF xem thử: `kiem-1-v3-que.gif`, `kiem-2-v3-que.gif`, `kiem-3-v3-que.gif` (thủ thế → đòn đúng mốc thời gian game, chậm ×3 → thủ thế)
  - Script dựng lại: `python3 docs/khung-que-8-huong/nguoi-dac/ve-kiem-v3.py`; số đo: `kiem-v3-so-do.json`.
- Prompt: `PROMPT.md` (thư mục này) — 3 prompt riêng, 1 prompt gộp (tuỳ chọn, kém chắc hơn), 1 prompt tấm vệt chém 3×3.

Điểm khác so với hình que 16/10:

| | Hình que 16/10 | Hình que v3 |
|---|---|---|
| Số khung | 5 / 5 / 6 | **7 / 6 / 7** |
| Chân | gần như đứng im | lấy đà gập gối, chân trước bước lên rồi lùi về; **chân sau ghim cố định** (máy tính tự giữ) |
| Bàn chân trước nhích tới tối đa | ~0 | kiếm 1: 6 · kiếm 2: 3 · kiếm 3: 7 (≈ 1 bàn chân) |
| Đầu nhún (thấp nhất → cao nhất) | ~3 | kiếm 1: −12 → +0 · kiếm 2: −8 → −1,5 · kiếm 3: −14 → −1 |
| Thân | luôn thẳng | ngả ra sau lúc lấy đà (−8 / −10°), đổ tới lúc chạm (22° / 28°) |
| Mũi kiếm so với đất | xuyên đất (kiếm 1 khung 4, kiếm 3 khung 5–6) | luôn trên đất (thấp nhất còn cách 15 đơn vị) |

(Đơn vị = đơn vị hình que; người cao ≈ 90.)

Khung ★ đặt sao cho khi ghép vào game, mốc thời gian (bảng trong PROMPT.md) đưa ★ đúng lúc chạm cũ u = 0,45 — không đổi thời lượng đòn.

## Phần B — làm kiếm bớt cứng trên hàng kiếm hiện tại (xong, chỉ đổi HÌNH)

Chờ trước: phiên "Thay khung 6 thương quét" đã xong sẵn (báo cáo `thuong-tay-trai-cao/bao-cao.md` có mục "Lần 2: khung 6 quét") → làm ngay, không phải đợi.

**Cờ tắt: `?kiemmuot=0`** → kiếm về y như trước (đã so: hình vẽ ra giống bản trước tới từng điểm ảnh, 0 điểm khác, cả kiếm cấp 1 và cấp 4). Lưu ý: `?kiemmuot=0` vốn cũng là cờ tắt đường vung kiếm của bộ vẽ cũ (trước khi có Cu Tí ảnh mới) — phần đó gần như không còn dùng.

**Không đổi cân bằng**: không sửa dòng nào trong `moves.js` / `combat.js`. Thời lượng đòn, lúc chạm (u = 0,45), vùng trúng, sát thương giữ nguyên. Cu Tí nhích người / nghiêng chỉ là hình — vị trí thật và hộp va chạm không đổi.

### Đã làm (`game/js/zed_moi.js`, mục "KIẾM BỚT CỨNG")

1. **Kiếm vung liền một đường, không khựng ở mỗi khung.** Trước: trong mỗi khung, kiếm đi chậm–nhanh–chậm rồi dừng → mỗi khung kiếm khựng lại một chút, nhìn như các tư thế chụp rời. Nay: góc kiếm là MỘT đường cong liền cho cả nhát, đi đúng chiều vung, đầu nhát chậm (lấy đà), **nhanh nhất ngay trước khung ★**, chậm dần lúc thu về.
2. **Người có lực.** Thân trên nghiêng quanh eo: ngả ra sau khi lấy đà (kiếm 1: 3°, kiếm 3: 5°), đổ tới khi chém trúng (kiếm 1: 6°, kiếm 2: 4°, kiếm 3: 8°); thân trên nhún xuống 1–1,5 điểm ảnh khi lấy đà; cả người nhích tới khi chạm (kiếm 1: 1,5, kiếm 2: 1, kiếm 3: 2,5 điểm ảnh) rồi trả về. Kiếm 3 trước chưa có số đo eo → đo thêm (`do-eo-kiem-3.py`, chèn vào `zed_eo_data.js`, số cũ không đổi; kiếm 3 vẫn không ghép chạy + chém như cũ).
3. **Hết lưỡi xuyên đất.** Góc kiếm 1 khung 4: 60° → 35°; kiếm 3 khung 5–6: 120° / 110° → 40° / 32° (mũi chúc ra TRƯỚC, không quét xuống sau chân). Thêm chốt chặn: mũi kiếm không bao giờ thấp hơn vạch đất, tính theo độ dài lưỡi đúng cấp kiếm (cấp 4 dài hơn cấp 1).
4. **Hit-stop (dừng hình khi trúng)**: ~~game chưa có cơ chế này~~ — **ghi nhầm, sửa 17/10:** game ĐÃ có dừng hình theo vũ khí từ 16/10 (`js/fx.js` `khungVk`: kiếm 45 / nhát kết 70 ms, thương 55 / 65, búa 90 / 110, phi tiêu 25 / 35). Phiên này không đổi nó. Số đo thật và phần chỉnh cho kiếm nặng: `tu-van-17-10-don-kiem/bao-cao.md`.
5. **Vệt chém**: game ĐÃ có ảnh vệt chém `hu-chem-kiem` (ảnh, bám theo đường mũi kiếm thật) → vẫn dùng, và tự đi theo đường vung mới. Đã để **chỗ chờ** cho 3 ảnh vệt riêng từng nhát `hu-chem-kiem-1`, `-2`, `-3` (`game/js/fx.js`): khi chủ game gen tấm vệt 3×3 (PROMPT.md, prompt 4) và cắt thành 3 tệp này, game tự dùng; chưa có thì dùng ảnh cũ. Không vẽ hiệu ứng bằng code.

### Số đo (bot quay headless, đứng yên chém 1 → 2 → 3, 60 nhịp/giây; đủ trong `so-do.json`)

| | Góc nhảy lớn nhất / nhịp | Lúc vung nhanh nhất (u) | Mũi kiếm thấp nhất so với đất (cấp 1 / cấp 4) |
|---|---|---|---|
| Kiếm 1 trước | 48° | 0,75 (lúc thu về!) | **8,5 / 15,3 điểm ảnh DƯỚI đất** |
| **Kiếm 1 sau** | 60° | **0,42 (ngay trước ★ 0,45)** | **trên đất** |
| Kiếm 2 trước | 32° | 0,75 | trên đất |
| **Kiếm 2 sau** | 50° | **0,42** | trên đất |
| Kiếm 3 trước | 32° | 0,56 | **10,5 / 18,1 điểm ảnh DƯỚI đất** |
| **Kiếm 3 sau** | 42° | **0,42** | **trên đất** |

- Góc nhảy lớn nhất tăng là CỐ Ý: tốc độ dồn vào ngay trước lúc chạm (nhát chém có lực), các lúc khác chậm hơn trước.
- Kiếm 2 sau: kiếm giữ thấp phía trước ~4 nhịp (0,07 giây) rồi hất lên — đó là lúc "lấy đà" của nhát hất, không phải khựng.

### Kiểm

- `node --check` (zed_moi.js, fx.js, zed_eo_data.js): đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. `dist/linh-khi.html` = 30 464 KB (29,75 MB) < 30 MB.
- Nạp `dist/linh-khi.html?cloud=0` headless (bot, không chơi tay), chế độ thường và `?kiemmuot=0`: **0 lỗi JS**, 0 lỗi vẽ. Thêm bot đi / chạy + chém kiếm (kịch bản `chan-di-danh/quay.py`): 0 lỗi.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

### Ảnh / GIF (thư mục này)

- `kiem-1-truoc-sau.gif`, `kiem-2-truoc-sau.gif`, `kiem-3-truoc-sau.gif`: trái = TRƯỚC, phải = SAU; trên = kiếm cấp 1, dưới = kiếm cấp 4; vạch xanh = mặt đất. Dựng bằng hàm vẽ thật của game, **đúng thời lượng** (50 hình/giây). Chữ vàng "*" = lúc chạm.
- Dựng lại: `quay.py` (bot quay) rồi `do.py` (số đo + GIF) — cách chạy ghi đầu mỗi tệp.

### Khi chủ game gen xong ảnh mới (phần A)

- Hàng kiếm v3 (7 / 6 / 7 khung): cắt bằng `docs/anh-goc/zed/cat-diem-anh.py`, dựng như hàng 16/10, đặt mốc khung theo bảng trong `PROMPT.md` (★ đúng u 0,45), đo eo lại. Phần B vẫn chạy được với hàng mới (đường cong góc tự tính theo neo từng khung); có thể giảm độ nghiêng thân vì ảnh mới đã tự có dáng người.
- Tấm vệt chém 3×3: cắt thành `hu-chem-kiem-1/-2/-3` → game tự dùng.
