# Nét cao: Cu Tí nét hơn nữa được không? (thử nghiệm 17/10)

Chủ game hỏi: *"Bạn đang giảm nét như nào, có thể tăng lên được không?"*

**Trả lời ngắn:** tăng được, tới **gấp đôi độ chi tiết hiện nay** (nét 4) là hết mức có ích trên điện thoại. Đã làm xong dưới dạng **thử nghiệm, mặc định TẮT**. Bật bằng `?netcao=4` (hoặc `?netcao=3`), hoặc trong cài đặt của Anh Mõ bấm nút Độ nét tới **"Rất cao"** (nút này chỉ hiện ở bản web). Giá phải trả: máy yếu dễ giật, tốn thêm RAM, và Cu Tí sẽ nét hơn hẳn quái (quái vẫn như cũ). **Khuyên: chưa bật mặc định.** Chủ game nên mở thử `?netcao=4` trên điện thoại của mình rồi quyết.

Không chơi thử bằng tay: mọi ảnh đều dựng bằng lệnh rồi chụp headless. Không đổi luật chơi, số liệu, vùng trúng, khung đòn hay neo vũ khí. Không đụng đăng nhập Google, lưu mây hay `?cloud=0`.

## 1. Hiện nay đang "giảm nét" ở đâu

| Bước | Số điểm ảnh | Mất bao nhiêu |
|---|---|---|
| Ảnh AI gốc của Cu Tí | cao ~490 điểm | — |
| Thu nhỏ vào tấm game (`thu_net.py`, mỗi điểm lấy một màu có thật) | ~64 điểm (ô 96), bản to ×1,2 ≈ **77 điểm** | bỏ ~5/6 chi tiết |
| Canvas thế giới | 480×270 điểm game × **G.NET 2** = 960×540 | **đây là trần**: ảnh nét hơn canvas thì cũng không hiện ra |
| Màn hình (CSS phóng lên) | điện thoại 844×390 dpr 3: vùng trận trên màn ≈ **2080×1170 điểm thật** → mỗi điểm canvas thành ~2,2 điểm màn | không mất, chỉ to ra |

Như vậy chỗ chặn là **canvas 960×540**. Muốn Cu Tí nét hơn thì phải **(a)** làm canvas to hơn và **(b)** thu ảnh gốc ra cỡ lớn hơn cho vừa canvas đó. Phiên này làm cả hai.

## 2. Đã làm gì (chỉ chạy khi bật, mặc định không đổi gì)

1. **Canvas nét 3 / 4** (`js/engine.js`): `G.setNet` nhận 3 và 4 (canvas 1440×810 / 1920×1080). Mọi chỗ trong game đều vẽ qua `G.wxDat` / `G.NET` (nền, phòng, làng, truyện, báo trước, đồ rơi, hiệu ứng, rung màn, làm tròn vị trí), nên đã soát và **không phải sửa chỗ nào khác**. Chữ, HUD và nút nằm ở lớp `#ui` riêng, không bị ảnh hưởng. Toạ độ chạm tính theo khung CSS, không theo cỡ canvas, nên không lệch. Ảnh chụp ở nét 3/4 không vỡ bố cục: [anh/ca-man-m844-n4-kiem.png](anh/ca-man-m844-n4-kiem.png).
2. **Ảnh Cu Tí cỡ lớn** (`cong-cu/dung_net_cao.py`): chạy lại **đúng đường dựng bản to** của phiên do-net (`dung_zed_net.py` → `dung_to`, cùng ảnh gốc, cùng mảnh, cùng chỗ dán), cùng với `dung-kiem-nang.py` cho 3 hàng kiếm nặng. Chỉ đổi hệ số: ×1,8 (nét 3) và ×2,4 (nét 4) thay cho ×1,2.
   - **Đã kiểm hình học:** chạy lại ở ×1,2 thì ra **trùng 100 %** với bản to đang có (552/552 ô, mặt nạ trùng 1,0000).
   - **Chỉ dựng các hàng game thật sự vẽ.** Bot chạy 9 ải với kiếm, thương và búa (`cong-cu/o_dung.py`), cộng thêm hàng chết và các hàng nắm tay 16/10. Tổng cộng **314/552 ô**, gồm: đứng, đi, chạy, chạy hai tay, lộn, trúng đòn, chưởng, kiếm nặng ×3, thương ×6, búa ×3, phi tiêu ×3, chiêu đặc biệt ×4, đấm, và các hàng nắm tay. Ô nào thiếu thì game tự lấy bản ×1,2 (vẫn đúng chỗ, chỉ kém nét).
   - Mỗi bản chia thành **3 trang ảnh**, mỗi trang ≤ 8 hàng ô (`chia_trang.py`). Lý do: một tấm 17 triệu điểm vượt trần giải mã ảnh của nhiều điện thoại.
   - Tệp `zed-moi.sprite.json` **chỉ có thêm** `tam_n3/to_n3/tam_n4/to_n4`. Mọi trường cũ giữ nguyên (đã so).
3. **Cách vẽ** (`js/zed_moi.js`): khi bật nét N, canvas phụ của Cu Tí dựng ở nét N × 1,2 từ bản ảnh đúng cỡ rồi chép **1:1** ra canvas thế giới, nên không có phép phóng nào lúc vẽ. Ảnh chưa tải về thì vẽ như nét 2 rồi phóng lên (đúng cỡ, chỉ kém nét).
4. **Vệt chém kiếm nặng** (`cong-cu/cat_vet_n4.py`): cắt lại 4 hàng từ đúng ảnh gốc `vet-kiem-nang-4x6.png`, cùng khung, cùng neo, ở 4 điểm/điểm game (`tam_n4`). `js/fx_anh.js` chỉ dùng khi nét ≥ 3.
5. **Vũ khí:** kiếm, búa và phi tiêu đã được game tự thu sẵn đúng cỡ mới (cách `nhoAnh` của do-net tính theo phép biến hình thật). Đo được: chép ra ×1,00 ở cả nét 3 và nét 4.
6. **Quái, trùm, nền:** để nguyên, vẽ phóng nguyên lần (nét 4 = ×2, đều; nét 3 = ×1,5, xem mục 4).
7. **Cài đặt** (Anh Mõ): nút Độ nét bấm vòng Cao → **Rất cao** (= nét 4) → Thường → Cao. "Rất cao" chỉ hiện khi bản game có ảnh nét cao (bản web). Bản lưu nhận `net: 'ratcao'`, giữ theo máy như "Thường". `?netcao=0` bỏ qua cài đặt này.

## 3. Đo

Có 2 loại ảnh chụp. **Cảnh trận**: ải 1-1, Cu Tí cầm kiếm đứng / chém nhát 1 kiếm nặng ở khung ★ có vệt, nấm và 2 ong đứng cạnh (`cong-cu/chup_tran.py`, ngẫu nhiên có gieo hạt, đồng hồ đứng yên). **Từng hình riêng**: `cong-cu/do_tran.py`, chép từ do-net.

**Ảnh cạnh nhau, nét 2 | 3 | 4:**
- Vùng Cu Tí trên màn 844×390 dpr 3: [anh/man-m844-kiem-ti.png](anh/man-m844-kiem-ti.png), [anh/man-m844-dung-ti.png](anh/man-m844-dung-ti.png)
- Vùng Cu Tí trên màn 1280×720: [anh/man-m1280-kiem-ti.png](anh/man-m1280-kiem-ti.png), [anh/man-m1280-dung-ti.png](anh/man-m1280-dung-ti.png)
- Canvas thật, cùng 12 điểm/điểm game (phóng ×4 vùng Cu Tí): [anh/canvas-kiem-ti.png](anh/canvas-kiem-ti.png), [anh/canvas-dung-ti.png](anh/canvas-dung-ti.png)
- Từng hình: [anh/canh-nhau-ti-ninja-dung.png](anh/canh-nhau-ti-ninja-dung.png), `-kiem`, `-chay`, `-spear-chem`, `quai-heoCon`, `quai-nhim`
- Cả màn: [anh/ca-man-m844-n2-kiem.png](anh/ca-man-m844-n2-kiem.png) | [anh/ca-man-m844-n4-kiem.png](anh/ca-man-m844-n4-kiem.png)

### Độ chi tiết thật: Cu Tí nét hơn quái bao nhiêu

"Điểm thật / điểm game" = số hàng điểm ảnh **khác nhau thật** trên mỗi điểm game hiển thị (bỏ các hàng lặp do phóng). Số càng lớn, hình càng chi tiết.

| Hình | Nét 2 | Nét 3 | Nét 4 |
|---|---|---|---|
| Cu Tí đứng / chạy / chém kiếm nặng / búa / phi tiêu | 2,0 | **3,0** | **4,0** |
| Cu Tí cầm thương (hàng đứng) | 1,9 | 2,5 | 3,1 |
| Cu Tí thương "nâng tay trái" (khung ảnh thay) | 1,8 | 2,1 | 2,4 |
| Mọi quái (heoCon, Nhím, Hải Quỳ…) | 2,0 | 2,0 | 2,0 |
| Trùm vẽ nhỏ hơn ảnh (Hồ Tinh pha 2) | 2,0 | 2,5 | 3,8 |

Chỉ số nhoè (NHOE, đã gộp hàng lặp để so được giữa các nét) của Cu Tí gần như không đổi: đứng 8,1 / 7,7 / 7,7, kiếm 7,5 / 6,2 / 7,9, chạy 9,3 / 7,6 / 8,0 (chuẩn heoCon 10,3). Nghĩa là mỗi điểm ảnh vẫn sạch như hiện nay, chỉ có **nhiều điểm hơn**. Số đầy đủ: [anh/so-lieu-net.json](anh/so-lieu-net.json).

**Lệch phong cách:** ở nét 4, Cu Tí chi tiết **gấp 2 lần quái theo mỗi chiều** (gấp 4 lần số điểm). Ở nét 3 là gấp 1,5 lần. Nhìn ảnh thì thấy rõ: mặt, tóc, tay của Tí mịn hẳn, còn nấm và ong vẫn ô vuông to như cũ. Ở cảnh đông quái thì người nét, quái thô. Muốn đều nhau thì phải dựng lại cả quái từ ảnh gốc theo cùng cách. Việc này làm được (công cụ `dung_quai_net.py` đã có) nhưng tốn dung lượng.

### Màn hình có hiện ra được không

- **Điện thoại 844×390 dpr 3:** vùng trận trên màn ≈ 2080 điểm ngang. Nét 4 (1920) ≈ **1 điểm canvas : 1 điểm màn**, nên thấy rõ khác biệt. Đây cũng là **trần**: nét 5 trở lên màn không hiện thêm được gì.
- **Máy tính 1280×720:** vùng trận chỉ 1280 điểm. Nét 3 (1440) và nét 4 (1920) **to hơn màn**, trình duyệt phải thu nhỏ lại, nên lợi ít hơn và ở nét 4 có vài chỗ lấm tấm.

### Máy yếu có giật không

Thời gian vẽ một khung (ms) trong cảnh trên, headless 844×390, có ép trình duyệt vẽ xong. Mỗi khung có **16,7 ms** để giữ 60 hình/giây.

| | Nét 2 (mặc định) | Nét 3 | Nét 4 |
|---|---|---|---|
| Máy thường: trung bình / 90 % khung | 2,6 / 3,0 | 4,3 / 5,4 | 5,8 / 6,7 |
| **CPU chậm ×4** (giả lập máy yếu): trung bình / 90 % khung | 11,1 / 14,3 | **17,2 / 21,7** | **24,7 / 30,5** |

→ Máy yếu: nét 2 vừa đủ 60 hình/giây, nét 3 hụt nhẹ (~50), nét 4 tụt còn khoảng 35–40 hình/giây. Lưu ý: headless không có GPU, nên trên điện thoại thật có thể nhẹ hơn, nhưng số điểm phải tô vẫn gấp 2,25 lần (nét 3) và 4 lần (nét 4). Số thô: [so-lieu-chup-tran.json](so-lieu-chup-tran.json).

**RAM thêm khi bật:** ảnh nét cao giải mã ~38 MB (nét 3) hoặc ~68 MB (nét 4). Canvas thế giới tăng từ 2 MB lên 4,7 MB hoặc 8,3 MB. Máy RAM ít có thể bị trình duyệt tải lại trang.

## 4. Giá phải trả và còn thiếu

| | |
|---|---|
| **Dung lượng** | Bản một tệp **29,85 MB** (≤ 30, ảnh nét cao KHÔNG nằm trong đó; chỉ thêm ~10 KB mã). Bản web tải đầu **17,74 MB** (không đổi, ≤ 20). Ảnh nét cao là tệp riêng, **chỉ tải khi bật**: nét 3 ≈ 0,61 MB (Cu Tí 0,54 + vệt 0,07), nét 4 ≈ 0,97 MB. Mỗi người chỉ tải một bản. |
| Máy yếu | xem bảng trên: nét 4 tụt xuống ~35–40 hình/giây khi CPU chậm ×4 |
| Lệch phong cách | Cu Tí gấp 1,5× (nét 3) hoặc 2× (nét 4) độ chi tiết so với quái |
| Nét 3 | Quái, nền và Cu Tí ở làng bị phóng ×1,5 (cứ 2 điểm thì 1 điểm lặp, ô vuông không đều nhau). Nét 4 phóng ×2, đều. **Nên dùng nét 4 hơn nét 3.** |
| Vũ khí | Ảnh vũ khí `zed-vk` lưu không đủ lớn cho nét cao: **thương bị phóng ×1,14 (nét 3) và ×1,52 (nét 4)**, kiếm ×1,07 ở nét 4. Muốn nét hẳn phải dựng lại tấm vũ khí to hơn từ ảnh gốc. Việc này chưa làm vì tấm này có nhiều chỗ dùng (gân, hệ, nắm tay, viền). |
| Chưa có bản lớn | Khung thương "nâng tay trái" (ảnh thay riêng), các ảnh nắm tay nhỏ, Cu Tí ở làng (cỡ ×1), và 3 bộ trang phục Rừng / Biển / Lâu đài (chỉ làm bộ Ninja như yêu cầu). Những chỗ này vẫn đúng chỗ, chỉ kém nét. |
| Bảo trì | Sửa tấm Cu Tí (ví dụ chạy lại `dung-kiem-nang.py`) thì phải chạy lại `cong-cu/dung_net_cao.py --ghi` và `cat_vet_n4.py --ghi`. Nếu không, bản nét cao sẽ lệch hình với bản thường. |

## 5. Khuyên

**Chưa bật mặc định.** Nét 4 làm Cu Tí đẹp rõ trên điện thoại, nhưng (1) máy yếu giật, (2) người nét hẳn so với quái, (3) thương vẫn chưa nét. Đề nghị:

1. Chủ game mở `…/?netcao=4` (bản web) trên điện thoại của mình, chơi một ải rồi nói cảm nhận. Đây là chủ game tự chơi; phiên này không chơi thử.
2. Nếu thích: giữ "Rất cao" làm lựa chọn cho máy mạnh. Bước tiếp theo nên làm là tấm vũ khí to (cho thương), sau đó dựng lại một số quái hay gặp để đỡ lệch phong cách.
3. Nếu thấy lệch phong cách khó chịu: bỏ thử nghiệm. Mọi thứ nằm sau cờ, mặc định không đổi.

## 6. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt: một tệp 29,85 MB (sau khi gộp phiên Tư vấn 17/10); người chơi tải 17,74 MB / 20; ảnh nét cao in riêng |
| `dist/linh-khi.html?cloud=0` headless, mặc định / `?netcao=3` / `?netcao=4`, màn 844×390 và 1280×720 | **0 lỗi JS** (bản một tệp không có ảnh nét cao, nên chỉ canvas to hơn, Cu Tí dùng bản ×1,2) |
| Bản web `linh-khi-nhe.html` mặc định / 3 / 4 | 0 lỗi JS. Chỉ có dòng 404 của `sw.js`: máy chủ thử không có tệp này, khi đăng lên web thì có. |
| **Mặc định giống hệt trước** (cảnh trận đứng + kiếm nặng, cả màn + canvas, 2 cỡ màn, so với bản đóng gói trước phiên) | **0 điểm ảnh khác** / 12 ảnh |
| `tests/smoke.py`, `tests/*.test.js` | 0 lỗi; đều đạt (`may_luat` bỏ qua như trước: thiếu thư viện) |
| Dựng lại ở ×1,2 so bản to đang có | 552/552 ô trùng 100 % |

Dựng lại: `python3 cong-cu/o_dung.py` (tuỳ chọn) → `python3 cong-cu/dung_net_cao.py --ghi` → `python3 cong-cu/cat_vet_n4.py --ghi` → build. Đo: `chup_tran.py <url> <ra> 2,3,4 --cham`, `LK_URL=… do_tran.py <ra> '&netcao=4' ti-ninja`, `phan_tich.py <gốc> anh`.
