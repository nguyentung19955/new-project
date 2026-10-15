# Báo cáo đợt 3: đưa 10 ảnh hiệu ứng nhỏ vào game

Ngày 15/10/2026. Commit code: `cd301c61` (nhánh `khoi-tao-du-an`). Commit này đã rebase lên `c4b4761b` của phiên khác. Phiên kia chỉ thêm tài liệu và ảnh gốc truyện, nên không phải đóng gói lại.

**Chưa chơi thử.** Theo yêu cầu, phiên này không chạy game, không chạy bot. Đã kiểm:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt.
- Ảnh soát tĩnh: `xem-dot3.png` (cùng thư mục).
- Riêng phép ánh xạ 3 đỉnh (`G.fxAnh.veAffine`) có kiểm số bằng node: 3 đỉnh ảnh rơi đúng 3 đỉnh đích, sai số 0,000.

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`. Đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên. Không chép apiKey.

Không đổi luật chơi: vùng va chạm, sát thương, thời gian giữ nguyên. Phiên này chỉ đổi phần vẽ.

## Dung lượng người chơi tải (`build.py --hai-tep`, ảnh rời)

| | Trang nén | Ảnh | Tổng / trần 20 MB | Không WebP |
|---|---|---|---|---|
| Trước (`2885d1e7`) | 0,95 MB | 14,39 MB | 15,34 MB | 18,19 MB |
| Sau | 0,96 MB | 14,48 MB | 15,44 MB | 18,30 MB |

10 ảnh mới cộng lại khoảng 160 KB (tệp `.sprite.json`). Chúng tải theo vùng như các `hu-*` khác:

- Ảnh chỉ một vùng dùng thì ghi `vung` trong tệp: `hu-tuong-song` (Hang biển), `hu-khoi-doc-nho` (Rừng già), `hu-tam-giac-bua` (Lâu đài cổ).
- 7 ảnh còn lại nhiều vùng cùng dùng, nên nằm ở nhóm lõi và tải sau như cũ.

## 1. Mười ảnh mới

Công cụ: `cong-cu/dung-dot3.py` (chạy `--ghi` để ghi vào `game/art/custom`). Cách cắt giống đợt 2: net 2, khử nền `#00FF00`, tách khung theo khe cột, lượng tử màu, có kiểm khớp từng điểm.

| Mã | Khung | Ô (điểm game, co 1) | Cỡ khi co 1 | Neo | Ghi chú |
|---|---|---|---|---|---|
| `hu-bot-doc` | 6 | 15×18 | vũng rộng 12 | giữa vũng | xem "Khử nền" bên dưới |
| `hu-cao-quai` | 5 | 40×35 | hộp 48×32 | giữa | trắng, có `xoay` |
| `hu-lao-bui` | 5 | 31×19 | hộp 40×16 | đuôi vạch (trái), đáy | — |
| `hu-gai-toa` | 6 | 66×68 | khung 4 rộng 64 (bán kính 32) | tâm | trắng |
| `hu-tia-mom` | 5 | 16×19 | hộp 16×16 | tâm | trắng, quầng nhiều nấc alpha |
| `hu-vong-hoi-quai` | 6 | 106×113 | vòng khung 4 rộng 90 | tâm vòng | quầng nhiều nấc alpha |
| `hu-tuong-song` | 6 (lặp) | 55×51 | hộp 64×48 | mép trước (phải), đáy | — |
| `hu-khoi-doc-nho` | 6 (lặp) | 18×27 | hộp 24×24 | gốc khói | — |
| `hu-hao-quang-gian` | 6 (lặp) | 50×47 | vòng rộng 40 | tâm vòng | — |
| `hu-tam-giac-bua` | 6 | 73×82 | khung 3 rộng 64 | trọng tâm tam giác | 3 đỉnh đo ra (0; −28), (±25,6; 14) |

### Khử nền theo từng ảnh

- **`bot-doc`** (bọt xanh lục trên nền xanh): chỉ bỏ điểm gần đúng màu nền (khoảng cách < 48) và điểm lục chói sát nền. Viền đen giữ nguyên.
- **`vong-hoi-quai`** (vòng xanh nhạt trên nền xanh): tách theo **độ sáng** kênh đỏ / lam và viền tối, không theo màu thuần.
  - Điểm tối hơn nền (viền) giữ đặc.
  - Điểm sáng thì tách trộn với nền, nên vẫn giữ màu xanh nhạt của vòng.
  - Kết quả **tách sạch**, kể cả quầng mờ ở khung 5. **Không cần gen lại nền tím.**
- **`tia-mom`, `cao-quai`, `gai-toa`, `lao-bui`, `tuong-song`, `hao-quang-gian`, `tam-giac-bua`** (vật không xanh lục): tách trộn với nền.
  - Quầng mờ ám xanh của `tia-mom` thành trắng.
  - Quầng hồng của `tam-giac-bua` (khung 5) ban đầu ra màu kaki. Đã tô lại hồng nhạt.
- **`khoi-doc-nho`**: cách của đợt 2, để đốm vàng lục không bị ăn mất.
- **`tia-mom`, `vong-hoi-quai`, `tam-giac-bua`**: alpha giữ 5 nấc (0 / 80 / 140 / 200 / 255) để quầng không thành mảng đặc.

### Tách khung

- **`gai-toa`:** khung 4 rỗng ở giữa nên tự đo khe bị lẫn. Biên khung đã đo tay.
- **`tam-giac-bua`:** khung 1, 2, 6 chỉ có nét chấm. Mỗi khung được dời cho khớp khung 3 bằng tương quan mặt nạ. Ảnh soát cho thấy tam giác các khung trùng nhau.

## 2. Nối vào game

Mọi chỗ dưới đây đều theo hai luật chung:

- **Ảnh chưa tải:** không vẽ gì.
- **`?vetaycu=1`:** vẽ code cũ, như trước đợt 1.

| # | Chỗ | Đợt 2 | Đợt 3 (nay) | Tệp |
|---|---|---|---|---|
| 4 | Bọt độc từ vũng độc / vùng độc nổ | tắt | `hu-bot-doc` trên sàn, đúng chỗ bọt sinh ra. Gộp chùm như ảnh sàn đợt 2. Bọt trên thân quái dính độc và ở tay vũ khí độc vẫn tắt | `fx.js` (`botDoc`: nổ độc, vùng nổ hệ độc, vũng `z.el === 'poison'`) |
| 6 | Vệt cào cận chiến (DON `chem`) | tắt | `hu-cao-quai` (chi tiết dưới bảng) | `monster_art.js` |
| 7 | Bụi + vạch khi lao (DON `lao`) | tắt | `hu-lao-bui` (chi tiết dưới bảng) | `monster_art.js` |
| 8 | Vòng gai toả (DON `gai`) | tắt | `hu-gai-toa` (chi tiết dưới bảng) | `monster_art.js` |
| 9 | Tia ở miệng lúc lấy đà (bắn / ném / phun) | tắt | `hu-tia-mom` ở miệng, nhuộm màu đòn, 5 khung theo độ lấy đà, co 1 | `monster_art.js` (`DON.bao`) |
| 10 | Vòng hồi máu | `hu-hoi-mau` trên mỗi con được hồi | `hu-vong-hoi-quai` dưới con hồi máu (chi tiết dưới bảng) | `mobs.js`, `ky_nang_quai.js` (`chuaBan`) |
| 11 | Tường sóng Ngư Tinh (`fx.js wave`) | không đổi | `hu-tuong-song` (chi tiết dưới bảng) | `fx.js` |
| 12 | Khói độc quanh thân Nấm / Mộc Tinh (`khiDoc`, 3 chỗ) | tắt | `hu-khoi-doc-nho` (chi tiết dưới bảng) | `monster_art.js` |
| 13 | Quầng nổi giận | giữ tạm quầng elip | `hu-hao-quang-gian` dưới chân (chi tiết dưới bảng) | `noi_gian.js` |
| 14 | Lòng tam giác Tiểu Yêu | giữ tô code | `hu-tam-giac-bua` (chi tiết dưới bảng) | `ky_nang_quai.js`, `fx_anh.js` |

Chi tiết các mục cần đo cỡ / tâm:

- **#6 vệt cào:** nhuộm màu giữa của đòn quái (`cols[1]`).
  - Quay theo hướng đòn. Sang trái thì lật rồi xoay, nên không bị lộn ngược.
  - Tâm ảnh ở (4 + tam/2) trước mặt, co tam/48. Vệt phủ từ ~4 tới ~tam + 4, đúng quạt va chạm (bán kính tam + 6).
- **#7 bụi lao:** lật theo hướng lao, vạch ở phía sau.
  - Co (0,9·tam + 10)/31, giới hạn 0,7–1,6.
  - Mép trước của bụi chạm gót quái.
- **#8 vòng gai:** nhuộm màu đòn, tâm giữa thân.
  - Co tam/32, nên vòng khung 4 đúng bán kính tam.
  - Đạn gai thật vẫn bay.
- **#10 vòng hồi máu:** co 2. Vòng khung 4 rộng 180 = bán kính hồi 90. Độ đậm 0,85, nằm ở lớp sàn.
- **#11 tường sóng:** xếp chồng dọc hai đoạn tường, chừa đúng khe. Ảnh lật vì sóng chạy sang trái.
  - Mép trước ảnh ở z.x − 6, đúng luật trúng |x − z.x| < 6.
  - Co 0,45: nửa trước thân sóng (~12) là dải trúng.
  - Lúc báo trước vẫn dùng hình nhấp nháy cũ. Chấm đỏ mép trước và mép khe trắng giữ nguyên.
- **#12 khói độc:** hai làn ở x ± 0,85 r (một làn lật, lệch 3 khung), co r/16.
  - Một làn ở giữa thì bị thân ảnh AI che hết (khói vẽ dưới thân), nên phải đặt hai bên.
- **#13 quầng nổi giận:** co 2·rx·1,1/40, cấp 1 nhạt hơn cấp 2.
  - Thân nhuộm đỏ có nhịp và màn đỏ ở mép (pha 3) giữ nguyên.
- **#14 tam giác Tiểu Yêu:** dùng hàm mới **`G.fxAnh.veAffine`**: ánh xạ affine để 3 đỉnh tam giác của ảnh trùng **đúng** 3 đỉnh vùng va chạm `o.V`. Vùng này xoay ngẫu nhiên, dẹt 0,75 và bị kẹp vào tường.
  - Lúc chờ nổ: khung 1–4 chạy theo độ chờ. Khi đã chờ quá 70% thì nhấp nháy nhanh như cũ.
  - Lúc nổ (0,3 giây): khung 5 rồi khung 6.
  - Ba cạnh đỏ báo trước vẫn vẽ suốt. Nhờ vậy, khi ảnh chưa tải vẫn còn tín hiệu né.

## 3. Ảnh soát `xem-dot3.png`

Công cụ: `cong-cu/ve-soat-dot3.py`. Mỗi hàng vẽ một ảnh ở cỡ game (co đúng như code gọi), phóng ×3, đã nhuộm như `FA.nhuom`:

- **Bên trái:** ảnh đặt lên khung đứng của quái dùng nó, đúng điểm đặt theo code. Dấu + đỏ là chân quái.
- **Bên phải:** dải mọi khung.

Các vòng / đường xanh là vùng thật để so:

- bán kính tam (gai toả);
- elip hồi máu bán kính 90;
- dải trúng z.x ± 6 và khe (tường sóng);
- cạnh tam giác vùng va chạm. 3 đỉnh ảnh trùng 3 đỉnh xanh ở cả 3 góc xoay thử.

## 4. Rủi ro (vì chưa chơi thử)

- **#11 hiện không hiện ra trong trận.** Đợt 2 đã thấy không còn chỗ nào tạo vùng `z.wave`; phiên này rà lại và xác nhận vẫn vậy. Ảnh đã nối đúng chỗ YEU-CAU-3 ghi (`fx.js wave`). Sóng thần đang chạy thật là `z.wall` (`mobs.js drawWall`), dùng `hu-song-than` từ 14/10, và **chưa đổi**. Xem mục 6.
- **Cỡ chỉ đo trên giấy** ở các chỗ sau. Lệch thì chỉnh hệ số trong code:
  - vệt cào: `4 + tam/2`, `tam/48`;
  - bụi lao: `/31`;
  - khói độc: `0,85 r`, `r/16`;
  - quầng giận: `1,1/40`;
  - tường sóng: `0,45`, bước 12.
- **Vòng hồi máu co 2 khá to.** Bề ngang đúng tầm hồi, nhưng các dấu cộng bay lên cao ~150 điểm. Nếu rối, hạ `sc` hoặc `mo` ở `mobs.js` / `ky_nang_quai.js`.
- **Ảnh tải sau.** Ở vài giây đầu ván các hình này trống (đúng yêu cầu "ảnh chưa tải thì không vẽ").
- **Tam giác Tiểu Yêu bị xô nghiêng** khi một đỉnh bị kẹp sát tường: các hoa văn bị kéo méo theo. Đổi lại, khớp đúng vùng va chạm.

## 5. Quay lui

- Cả đợt: `git revert cd301c61`.
- Thêm `?vetaycu=1` vào địa chỉ trang: mọi chỗ của đợt 1, 2 và 3 vẽ code như cũ.

## 6. Tệp đổi và cần duyệt

Tệp đổi:

- `game/art/custom/hu-{bot-doc,cao-quai,lao-bui,gai-toa,tia-mom,vong-hoi-quai,tuong-song,khoi-doc-nho,hao-quang-gian,tam-giac-bua}.sprite.json` (mới).
- `game/js/fx.js`, `fx_anh.js`, `monster_art.js`, `mobs.js`, `ky_nang_quai.js`, `noi_gian.js`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: đóng gói lại.
- `docs/review/ke-hoach-cai-thien/con-ve-tay/cong-cu/dung-dot3.py`, `ve-soat-dot3.py`, `xem-dot3.png`, `bao-cao-3.md`.

Cần duyệt:

1. Có dùng `hu-tuong-song` thay `hu-song-than` cho sóng thần đang chạy thật (`mobs.js drawWall`) không? Phiên này chưa đổi, vì đó là ảnh trùm đã duyệt từ 14/10.
2. Cỡ vòng hồi máu (co 2) và khói độc hai làn khi chơi thử.
