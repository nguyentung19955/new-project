# Báo cáo: Zed vừa chạy vừa chém (13/10/2026)

Nhánh `khoi-tao-du-an`, đã push (không đụng master, không force push, không mở PR, không chép apiKey).

| Commit | Nội dung |
|---|---|
| **`79e8d4d`** | Chạy + chém đồng thời: tách di chuyển / chiến đấu, ghép eo bằng script mới `cat-than.py`, chốt hướng chém, bộ đệm 0,13 s, nối combo, cờ `?chaydanh=0`, 7 kiểm thử |
| **`82e2409`** | Vũ khí mượt: góc vũ khí nội suy giữa các khung + vào thế êm (theo phần bổ sung "mượt bằng hoặc hơn bản Zed cũ"), đo so sánh cũ/mới |

> Lưu ý: trong lúc làm, YEU-CAU.md trên nhánh có thêm dòng "CHỦ DỰ ÁN ĐỔI Ý (12:11): KHÔNG TEST". Lời giao việc của phiên này lại ghi rõ "Lần này ĐƯỢC kiểm thử: chạy đủ 7 kiểm thử", nên tôi làm theo lời giao việc. Kiểm thử chỉ chạy trên máy ảo, không thay đổi gì trong game. Nếu không muốn giữ thì xoá được thư mục `kiem-thu/`, `kiem-thu-cu/` và tệp `game/tests/zed_chay_danh.py`.

## Xem / tắt
- Mở game như thường: Zed chạy mà bấm Đánh thì **chân vẫn chạy, thân trên chém**.
- **`?chaydanh=0`**: quay về cách cũ (tốc độ, bộ đệm, cách nhắm, cách vẽ như trước phiên này).
- Các cờ cũ vẫn chạy (đã thử, không lỗi): `?zedbo=rung|bien|lau`, `?zedmoi=0`, `?cloud=0`. Không đụng `BO_KHAC` hay `dung_bo` trong `dung-zed-game.py`, cũng không đụng phần đăng nhập Google và lưu mây.

## A. Hiện trạng trước khi sửa (so với 7 mục yêu cầu)
| Mục | Trước | Sau |
|---|---|---|
| 1 Di chuyển khi chém | Vẫn đi, nhưng chậm: kiếm 0,85, giáo 0,8, cung 0,7, búa 0,55 | Chém thường ≥ 0,9; chỉ đòn nặng chậm nhẹ (≥ 0,6) |
| 2 Hình chạy + chém | Thân giữ hàng chạy, vũ khí nhảy theo neo khung đòn, **không nằm trong tay** | Ghép ở thắt lưng: chân lấy từ khung chạy, thân trên + tay + vũ khí lấy từ khung đòn. Vũ khí nằm trong tay |
| 3 Hướng chạy / hướng chém | Mặt đã khoá trong lúc chém. Riêng phi tiêu **ngắm lại lúc ném** (giữa nhát) | Hướng chém chốt lúc ra đòn, phi tiêu cũng vậy. Chân quay theo hướng chạy, thân trên theo hướng chém |
| 4 Combo | Bộ đệm 0,25 s; nhát sau phải chờ hết khung cuối | Bộ đệm 0,13 s; được nối ở khung thu tay cuối (u ≥ 0,85, sau khi đã chạm) |
| 5 Ưu tiên | Né đã ngắt đòn. Hết Né hoặc hết lướt thì chen **1 khung đứng** | Hết Né / lướt mà còn giữ cần thì chạy ngay |
| 6 Kỹ thuật | Nhịp chạy `P.chayT` vốn không reset (đạt sẵn) | Giữ nguyên. Không đổi cỡ, gốc, neo chân. Toạ độ ảnh nguyên, không làm mờ |

## B. Code chiến đấu (`moves.js`, `combat.js`)
- **Tách trạng thái**: phần di chuyển (cần → vận tốc, nhịp chân `P.chayT`) và phần chiến đấu (`atkT`, `cdT`, combo, bộ đệm) chạy độc lập, mỗi bên một đồng hồ. Ra đòn không đặt vận tốc về 0, không reset nhịp chạy. Không có đòn thường nào tự lao tới mục tiêu. Xốc tới và Nhát lướt giữ như cũ.
- **Tốc độ khi đang ra đòn** (`G.CHAY_DANH_CFG`):

  | Loại đòn | Hệ số tốc độ |
  |---|---|
  | Kiếm, đấm | 0,95 |
  | Giáo đâm, phi tiêu | 0,92 |
  | Nhát kết kiếm, quét giáo | 0,75 |
  | Búa nện | 0,65 |
  | Nện đất | 0,6 |
  | Đặc biệt (khi chạy) | 0,7 |

- **Bộ đệm 0,13 s** (trước 0,25). Lý do: 0,25 s nhớ nút quá lâu nên dễ "tự đánh thêm một nhát" sau khi đã thả. 0,13 s nằm trong khoảng 100–150 ms, vẫn nối được vì mỗi nhát kiếm/giáo dài 0,3–0,52 s.
- **Giữ nút**: kiếm tự combo theo nhịp. Giáo, búa và phi tiêu thì giữ nút là **lấy đà** (luật vốn có của game) nên không tự combo; bấm liên tục thì combo bình thường.
- **Không đổi** thời lượng đòn, `hitAt`, hay khung chạm.
- **Trúng đòn / Choáng**: người chơi không có cơ chế khựng khi trúng đòn. "Trúng" chỉ là chớp đỏ, nên tôi không thêm cơ chế khựng để tránh đổi cân bằng. Đóng băng vẫn ngắt cả chạy lẫn đánh như cũ.

## C. Hình chạy + chém
- **Script mới `docs/anh-goc/zed/cat-than.py`**: đọc tấm thân đã dựng của 4 bộ trang phục và tự dò đai từng khung.
  - Màu đai từng bộ: ninja đỏ, Rừng vàng, Biển xanh ngọc, Lâu đài vạt đỏ.
  - Đường cắt nằm ở đáy đai; điểm khớp là tâm hông ngay dưới đai.
  - Kết quả ghi vào `game/js/zed_eo_data.js`.
  - Khung nào dò lệch quá 4 điểm ảnh so với bộ ninja cùng khung thì dùng điểm của ninja (các bộ cùng tư thế). Số khung phải dùng điểm ninja: Rừng 1, Biển 34, Lâu đài 20.
- **Ảnh xem trước**: `ghep-eo-moi.png`, `ghep-eo-rung.png`, `ghep-eo-bien.png`, `ghep-eo-lau.png`. Mỗi cặp ảnh gồm khung đòn gốc và khung đã ghép.
- **Cách game ghép** (`zed_moi.js`):
  - Nửa dưới lấy khung chạy hiện tại, quay theo hướng chạy.
  - Nửa trên lấy khung đòn, dời nguyên khối về điểm eo.
  - Vũ khí, nắm tay và vệt chém dời theo nửa trên.
  - Không có ảnh nào bị chồng toàn thân lên nhau (không ra bốn tay, bốn chân).
- **Hàng được ghép** (thân trên thẳng): kiếm 1, kiếm 2, thương 1–3, phi tiêu, ném chùm, phi tiêu ngắm, thương giữ, đấm, chưởng.
- **Vũ khí mượt** (theo phần bổ sung):
  - Điểm cầm luôn là nắm tay của khung đang vẽ, nên vũ khí luôn nằm trong tay.
  - Góc vũ khí nội suy liên tục từ khung này sang khung sau.
  - Đầu nhát, vũ khí đi tiếp từ góc cuối nhát trước trong 0,33 đầu đòn, không nhảy.

### RunAttack còn thiếu (ghép eo không áp dụng được, hiện vẽ toàn thân hàng đòn + chậm lại)
| Hàng | Số khung | Vì sao |
|---|---|---|
| `kiem_3` (Nhát kết, bổ xuống) | 6 | Cúi / khuỵu người |
| `thuong_quet` | 6 | Xoay người quét |
| `bua_nen` | 8 | Cúi nện |
| `bua_nen_dat` | 6 | Cúi nện |
| `bua_giu` (giữ đà búa) | 4 | Tư thế khuỵu |
| `thuong_xoc` | 4 | Đòn lao, có chuyển động riêng |
| `db_kiem`, `db_thuong`, `db_bua`, `db_phitieu` (đặc biệt) | 6 mỗi hàng | Cả người tham gia đòn |

**Trượt chân**: ở các hàng trên, khi đang chạy thì chân đứng yên trong lúc người vẫn trượt đi với tốc độ 0,6–0,75. Trong ảnh kiểm thử, nhát kết kiếm thấy **trượt chân rõ**. Muốn hết hẳn thì cần vẽ thêm bản chạy riêng (RunAttack) cho đúng các hàng trên, tổng **68 khung** cho mỗi bộ trang phục.

Ngoài ra, hàng **đứng / đi / chạy không cầm vũ khí** vì `neo.json` không có neo cho các hàng này. Vì vậy giữa hai đợt chém (đang chạy, không đánh) vũ khí biến mất như trước.

## D. Kiểm thử (Playwright headless, Chromium sẵn có; `python3 game/tests/zed_chay_danh.py`)
Mỗi tình huống ghi theo từng khung (1/60 s): vận tốc, `P.face`, hướng đòn, combo, tiến độ đòn, khung thân dưới / thân trên. Kết quả nằm trong thư mục `kiem-thu/`:
- `kq-N.json`: số liệu từng khung
- `dai-N.png`: dải ảnh
- `chay-danh-N.gif`: ảnh động

| # | Tình huống | Bản mới | Cách cũ (`?chaydanh=0`) |
|---|---|---|---|
| 1 | Đứng chém liên tục: vận tốc 0, combo 0→1→2→0→1→2, không rơi về Đứng | **ĐẠT** | đạt |
| 2 | Chạy phải chém liên tục: chém thường thấp nhất 95% tốc độ, nhát kết 75%; chân qua đủ 12 khung chạy; kiếm 1/2 ghép eo 64/64 khung | **ĐẠT** | không đạt (chậm 85%/…) |
| 3 | Chạy trái chém phải: vx < 0, `face` = 1, aimX > 0; chân quay trái, thân trên quay phải | **ĐẠT** | không đạt |
| 4 | Chạy chéo combo 3 nhát: combo 0,1,2; vx, vy > 0 suốt | **ĐẠT** | không đạt |
| 5 | Đổi hướng cần giữa nhát: hướng chém và mặt không đổi trong nhát (0 nhát đổi); hướng chạy đổi ngay | **ĐẠT** | đạt |
| 6 | Chạy + giữ Đánh rồi Né: Né ra đúng khung bấm, ngắt đòn; hết Né chạy ngay; còn giữ Đánh thì đánh tiếp | **ĐẠT** | không đạt (chen khung Đứng) |
| 7 | Thả Đánh vẫn giữ cần: hết nhát chạy lại đủ tốc ngay, về hàng chạy, không khựng | **ĐẠT** | đạt |

**Kết quả: 7/7 đạt.** Không có lỗi trang, không có lỗi vẽ.

**So độ mượt vũ khí** (`--muot`; chạy phải + giữ chém kiếm 100 khung; góc vũ khí lấy từ hình đang vẽ). Ảnh động đặt cạnh nhau: `kiem-thu/muot-cu-moi.gif` (trái là bản cũ, phải là bản mới).

| Độ lệch góc giữa hai khung liền nhau | Bản cũ `?zedmoi=0` | Bản mới |
|---|---|---|
| Lớn nhất | 113° | **59°** |
| 95% số khung không vượt | 64° | **52°** |
| Trung bình | 15° | 19° |
| Khung đánh có vũ khí trong tay | 100/100 | 100/100 |

Độ lệch lớn nhất và mức 95% của bản mới đều nhỏ hơn bản cũ. Độ lệch trung bình cao hơn một chút. Lý do: hình kiếm mới vung rộng hơn rồi thu kiếm về thế sau mỗi nhát, nên tổng góc quay trong một combo lớn hơn (1 880° so với 1 485°).

## Tệp đổi
- **Mới**: `docs/anh-goc/zed/cat-than.py`, `game/js/zed_eo_data.js`, `game/tests/zed_chay_danh.py`, ảnh và kết quả trong thư mục này.
- **Sửa**: `game/js/{moves,combat,zed_moi}.js`, `game/index.html` (thêm `zed_eo_data.js`), `game/dist/*` (đóng gói lại bằng `python3 game/build.py`).
