# Vừa đi / chạy vừa ra đòn: chân không còn bị bóp méo (17/10)

Lỗi chủ game báo (17/10 01:56): *"Vừa đi vừa đâm thương chân bị bóp méo, không biết kiếm và búa, phi tiêu có bị thế không."*

## Tóm tắt

- **Có bị**: thương 1/2/3 + thương giữ, kiếm 1/2, phi tiêu ném / ngắm / chùm — cả khi đi lẫn khi chạy, cả hai hướng. Chân lệch hình **29–48 %** (ngưỡng lỗi 8 %).
- **Không bị méo**: búa (mọi đòn), kiếm 3, thương quét, thương xốc, mọi chiêu đặc biệt — các đòn này vốn vẽ nguyên khung đòn.
- **Đã sửa tận gốc**: chân lệch còn **0 %** ở mọi tổ hợp, hết hở eo, hết "nhảy chỗ" khi vào đòn. Không co giãn hình người nữa.
- **Cờ `?chandon=0`**: về y như cũ.
- **Không đổi luật**: tốc độ, sát thương, vùng trúng, thời gian đòn giữ nguyên. Chỉ đổi HÌNH.
- Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## Nguyên nhân

Khi vừa di chuyển vừa đánh, game ghép **thân trên của khung đòn** với **chân của khung chạy**. Cách ghép cũ (zed-eo-sua, 13/10) có 3 chỗ sai:

1. **Cắt ở giữa đùi, rồi kéo giãn.** Nửa trên mang theo hông và đùi của **thế tấn rộng** (thương, phi tiêu đứng chân rộng). Chân chạy thì hẹp. Để hai nửa khớp, code **kéo giãn ngang** 5 hàng điểm ảnh ở chỗ nối, tới ×1,8 → đùi bè ra thành hình cái nêm. Đây chính là "chân bị bóp méo".
2. **Khớp ngang theo "tâm hông".** Ở hàng chạy mới 16/10, tâm hông nhảy qua lại 42–54 điểm ảnh theo bước chân → thân trên lắc ngang.
3. **Kiếm 2 mới (16/10) đo nhầm đai.** Khung 1–2 cúi thấp, máy dò đai bắt nhầm **mắt đỏ** (hàng 58–59; đai thật ở hàng 72–73) → cắt mất nửa thân.

Hàng mới 16/10 (cỡ ×1,2, đầu 25,2, căn bàn chân trước) **không lệch cỡ** với hàng chạy: đầu, đai, chân cùng cỡ trong khoảng 1–2 điểm ảnh. Lỗi nằm ở **cách ghép**, không phải ở cỡ ảnh.

Thêm 2 chỗ nhỏ:

- Khi **đi bộ** mà đánh, chân lại lấy của hàng **chạy** → vào đòn là bộ chân đổi.
- Khi cầm thương mà chạy, game dùng hàng chạy hai tay. Vào đòn thì chân đổi sang hàng chạy thường.

## Cách sửa (game/js/zed_moi.js)

**Ghép ở ĐAI, không co giãn:**

- Thân trên: khung đòn, từ đầu tới đáy đai.
- Chân: khung đi / chạy, từ đáy đai xuống bàn chân.
- Hai nửa khớp **tâm đai** (cột nguyên, không lệch nửa điểm ảnh).
- Bàn tay vung sát hông của khung chạy được xoá, cùng mảnh nào không nối với bàn chân. Thân trên đã có tay riêng.

**Chân đúng bộ:**

- Đi bộ → chân hàng đi.
- Chạy → chân hàng chạy.
- Cầm thương / búa mà chạy → chân hàng chạy hai tay.

Chân bước theo đúng quãng đường như lúc không đánh.

**Số đo mới** nằm trong `game/js/zed_eo_data.js`, chỉ thêm vào, số cũ giữ nguyên. Đo bằng `docs/anh-goc/zed/eo-dai-17-10.py`.

| Vũ khí | Khi đi / chạy | Lý do |
|---|---|---|
| **Thương** 1/2/3, thương giữ | Ghép ở đai (chân bước) | Thân trên đâm thẳng nằm gọn trên chân chạy. Nhát đâm chỉ 0,34–0,38 giây, giữ thương có khi lâu: đứng chân sẽ trượt rõ. |
| Thương quét, thương xốc, đặc biệt | **Nguyên khung đòn**, người trượt theo hướng đi (như cũ) | Quét là xoay cả người (có khung quay lưng), xốc là lao người. Ghép vào chân chạy trông vặn. |
| **Kiếm** 1, 2 | Ghép ở đai | Chém bằng tay, thân thẳng. Kiếm 2 cúi rồi hất lên: nay đúng đai nên thân không bị cắt. |
| Kiếm 3, đặc biệt | Nguyên khung đòn | Nhát kết đứng tấn rộng, game đã cho chậm lại 25 %. |
| **Búa** (nện, giữ, nện đất, đặc biệt) | Nguyên khung đòn | Cúi khuỵu sâu, búa nện xuống đất. Ghép thì thân bị lùn. Búa vốn không méo. |
| **Phi tiêu** ném, ngắm, chùm | Ghép ở đai | Ném bằng tay, thân thẳng. |
| Phi tiêu đặc biệt | Nguyên khung đòn | Tung cả người. |

**Bộ trang phục Rừng / Biển / Lâu đài** dùng cùng cách sửa. Đã chụp soát chạy + kiếm và đi + thương ở cả ba bộ: không lỗi.

## Kiểm tra bằng máy (headless, không chơi tay)

**Đã quay:** 2 kiểu (đi, chạy) × 4 vũ khí × 2 hướng = 16 kịch bản bấm phím giả. Mỗi kịch bản chạy đủ mọi đòn của vũ khí đó. Mỗi chế độ (trước / sau) 3 664 nhịp, mỗi nhịp 1/60 giây.

**Mỗi nhịp máy tự đo** (`do.py`):

| Lỗi | Cách đo |
|---|---|
| Chân kéo / bóp | Tỉ lệ cao / rộng của chân lệch > 8 % so với khung đi / chạy gốc |
| Eo lệch | Thân trên lệch khỏi chân > 1 điểm game (so tâm đai với tâm hông) |
| Eo hở | Có khe trống ở eo |
| Hai bộ chân | Chân có nhiều mảnh hơn khung gốc |
| Đầu nhảy | Đầu nhảy > 1,5 điểm game |
| Trượt chân | Quãng đi thật lệch quãng chân bước |
| Nhảy chỗ | Bộ chân đổi hàng hoặc nhảy cóc khung |

Bảng đầy đủ từng đòn: **`bang.md`**. Số thô: `do-truoc.json`, `do-sau.json`. Tóm tắt (gộp hai hướng, TRƯỚC → SAU):

| | Chân lệch lớn nhất | Nhịp chân > 8 % | Eo lệch lớn nhất | Nhịp eo hở | Nhảy chỗ khi vào đòn |
|---|---|---|---|---|---|
| Thương 1/2/3 + giữ (đi + chạy) | 35–48 % → **0 %** | 444 → **0** | 3,75–10,25 → **0,5–4,75** | 162 → **0** | 34 → **0** |
| Kiếm 1/2 (đi + chạy) | 29–41 % → **0 %** | 128 → **0** | 7,25–7,75 → **0,75–1,75** | 60 → **0** | 8 → **0** |
| Phi tiêu ném / ngắm / chùm (đi + chạy) | 29–33 % → **0 %** | 378 → **0** | 5–7,75 → **0,75–1** | 184 → **0** | 12 → **1** |
| Búa, kiếm 3, quét, xốc, đặc biệt | 0 → 0 (không đổi) | 0 | 0 | 0 | không đổi |

### Ghi chú thẳng

- **"Eo lệch" còn > 1 điểm ở một số nhịp thương** (lớn nhất 4,75). Máy đo theo mép dải màu đỏ của đai. Ở hàng thương, đuôi đai bay ngang đúng hàng đai nên số bị kéo lệch. Đã soi bằng mắt từng khung lệch nhất (ảnh ×3): thân nằm đúng trên hông, không hở, không chồng. Kiếm và phi tiêu ≤ 1,75.
- **"Đầu nhảy" 2 điểm** ở 8 nhịp (2 kiếm 1, 6 phi tiêu, chỉ khi chạy). Đây là thân nhún theo bước chạy, đúng như hàng chạy gốc (đầu hàng chạy cũng lên xuống 2,5 điểm).
- **Trượt chân**:
  - Các đòn **nguyên khung** vẫn **100 %**: chân đứng, người trượt. Đây là cách đã chọn ở bảng trên, giống trước.
  - Các đòn **ghép**: phần lớn **0–9 %**. Riêng **đi bộ** + giữ thương / ngắm / chùm là 25–42 %. Lý do: lúc giữ đòn tốc độ đi chậm hẳn, mà nhịp chân có mức tối thiểu (35 %, đặt từ phiên cu-ti-to-muot). Không phải lỗi hình của phiên này. Chạy + chùm 155 % → 80 % cũng cùng lý do.
- Một số khung chạy ở bộ Rừng / Lâu đài còn **1–2 điểm ảnh đuôi đai** sát hông. Chỉ thấy khi phóng to.

## Ảnh / GIF (thư mục này)

**`gif/<đi|chay>-<thuong|kiem|bua|phitieu>-x3.gif`** — 8 GIF, phóng ×3, 20 khung / giây:

- Hàng trên: hướng phải. Hàng dưới: hướng trái.
- Cột trái: TRƯỚC (`?chandon=0`). Cột phải: SAU.
- Vạch đất chạy theo quãng đường thật. Chân đứng yên trên vạch là không trượt.
- Mỗi GIF chạy đủ mọi đòn của vũ khí: thương 1 → 2 → 3 → quét → giữ → xốc → đặc biệt; kiếm 1 → 2 → 3 → đặc biệt; búa nện → giữ → nện đất → đặc biệt; phi tiêu ném ×2 → ngắm → chùm → đặc biệt.
- GIF búa trước / sau giống nhau: búa không đổi.

**`so-sanh.png`** — 6 khung tiêu biểu, TRƯỚC trên, SAU dưới. Thương lúc đâm thấy rõ đùi hình nêm ở bản cũ.

**Dựng lại** (từ gốc repo, sau `python3 game/build.py`):

```
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/quay.py <ra-truoc> '&chandon=0'
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/quay.py <ra-sau>
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/do.py <ra-truoc> docs/review/ke-hoach-cai-thien/chan-di-danh/do-truoc.json
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/do.py <ra-sau> docs/review/ke-hoach-cai-thien/chan-di-danh/do-sau.json
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/gif.py <ra-truoc> <ra-sau> docs/review/ke-hoach-cai-thien/chan-di-danh/gif
python3 docs/review/ke-hoach-cai-thien/chan-di-danh/bang.py > docs/review/ke-hoach-cai-thien/chan-di-danh/bang.md
```

`quay.py` mở trang với `&modan=0`, chỉ để đòn đặc biệt có sẵn trong kịch bản.

## Kiểm

- `node --check` zed_moi.js, zed_eo_data.js: đạt.
- `python3 game/build.py` và `python3 game/build.py --hai-tep`: đạt (trang chính nén 1,24 / 1,50 MB).
- 16 kịch bản ở cả hai chế độ (thường / `?chandon=0`), cộng bộ Rừng / Biển / Lâu đài: **0 lỗi JS**, `G.zedMoi.loi` rỗng.
- Đã gộp phần "thương nâng tay trái" (phiên thuong-tay-trai-cao) vào nhánh ghép mới: cẳng tay trái nâng cao vẫn hiện khi đi / chạy + đâm.
- `tests/zed_chay_danh.py`: xem mục cuối.

### tests/zed_chay_danh.py

Kết quả **4 / 7 đạt**, giống hệt trước phiên này (cu-ti-to-muot đã ghi 4 / 7, đúng 3 mục đó). 3 mục hỏng là test cũ, không do phiên này:

- Mục 2, 3, 4: test đòi nhát kết kiếm giảm tốc ≤ 40 %. Luật hiện tại cho chậm 25 %. Phiên này không đổi luật.
- Mục 3: test đòi "chân quay theo hướng chạy". Từ zed-eo-sua (13/10), chạy ngược hướng chém là chạy lùi, chân cùng hướng thân.

Các ảnh / số liệu test tự ghi vào zed-chay-danh/kiem-thu đã trả lại như cũ.
