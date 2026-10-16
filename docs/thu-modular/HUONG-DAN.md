# Bộ thử mặc đồ modular — Cu Tí MỚI

Mục đích: thử cách **ghép đồ lên khung xương**. Có hai cách:

- vẽ một món đồ một lần, máy dời và xoay theo xương ở từng khung;
- vẽ món đồ cho từng khung của chu kỳ chạy, máy đặt đúng chỗ.

Tất cả nằm trong `docs/thu-modular/`, **không đụng code game**. Sinh lại bằng `python3 docs/thu-modular/tao-bo-thu.py` (khoảng 10 giây).

> **Chỉ dùng Cu Tí MỚI**, tức nhân vật đang có trong game: ảnh `docs/anh-goc/zed/moi/`, sprite `game/art/custom/zed-moi.sprite.json`. Cu Tí cũ (`zed-v2-canonical.png`, `zed-v2-*`, `lop-ghep/zed-v2-*`) **đã bỏ**. Trong bộ thử này không còn ảnh hay JSON nào của Cu Tí cũ.

## 1. Nguồn

| Dùng cho | Ảnh |
|---|---|
| Ảnh mẫu (gửi kèm mọi prompt) | `docs/anh-goc/zed/moi/00-anh-mau.png` |
| Dáng đứng | `moi/01-dung-gif/dung/khung-01.png` (khung 1 hàng `dung` của game, cùng dáng ảnh mẫu) |
| Chạy | `moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png`: hàng `chay` **game đang dùng** khi tay không, cầm kiếm hoặc phi tiêu (`dung-zed-game.py`: `('chay','03-chay-v4')`) |

Hàng `03-chay-2tay` chỉ dùng khi cầm thương/búa nên không đo ở đây.

Cách co và đặt khung vào ô game lấy y hệt `docs/anh-goc/zed/dung-zed-game.py`. Mỗi lần sinh, script so với tấm game thật `zed-moi.sprite.json` và bắt buộc trùng 100% ở mọi khung (IoU = 1); không trùng thì dừng.

## 2. Trong thư mục có gì

| Tệp | Là gì |
|---|---|
| `soat-cu-ti-moi.png` | Soát nhân vật: ảnh mẫu, khung đứng và khung chạy đặt cạnh nhau |
| `nhan-vat-cu-ti-dung.png` | Cu Tí đứng, nền trong suốt, cỡ thật 271×497 |
| `nhan-vat-khop.png` | Cu Tí đứng ×2, 23 khớp đánh số, toạ độ (ô que, ảnh khung, tấm gốc, game) |
| `nhan-vat.json` | Khớp, xương (độ dài, góc), lớp vẽ, toạ độ ảnh gốc và điểm game |
| `que-dung.png`, `-x1.png`, `-luoi.png`, `-chong-hinh.png` | Que đứng: ×2 có số; cỡ thật (giấy nền vẽ đồ); có lưới; chồng lên Cu Tí |
| `que-chay-12.png`, `.gif` | Que chạy 12 khung, ô 256×320, cùng đường chân y = 308 |
| `que-chay-12-luoi.png` | Que chạy ×2 có lưới (vạch mảnh mỗi 8, số mỗi 32) |
| `que-chay-12-chong-hinh.png`, `.gif` | Que chồng lên **Cu Tí thật từng khung**, ×2 |
| `que-chay-12-chong-mo.png` | Như trên, Cu Tí mờ, khớp có số |
| `cu-ti-chay-12-hang.png` | 12 khung Cu Tí chạy trơn trên nền `#00FF00`, đúng ô que (**gửi kèm khi gen**) |
| `que-dung.json`, `que-chay-12.json` | Dữ liệu từng khung: khớp (6 hệ toạ độ), góc xương, neo đồ |
| `chinh-tay-dung.json`, `chinh-tay-chay.json` | **Tệp chỉnh tay**: khớp đo bằng mắt, theo điểm ảnh ảnh khung. Sửa số rồi chạy lại script |
| `neo-do-chay-12.png`, `neo-do-dung.png` | Neo áo, quần, tóc/mũ, phụ kiện vẽ lên Cu Tí từng khung, kèm góc thân, đầu và cỡ |
| `bo-phan/dung/*.png`, `bo-phan/chay/*.png` | 14 bộ phận **tách từ điểm ảnh thật** của Cu Tí từng khung; mỗi tệp là một hàng ô cùng cỡ ô que |
| `bo-phan/*/_ban-do-mau.png`, `bo-phan.png`, `bo-phan.json` | Bản đồ màu bộ phận, ảnh tổng, pivot, góc và lớp từng khung |
| `mau-gen/vung-<món>-chay.png`, `-dung.png` | Vùng một món (mũ, áo, quần, găng, giày) tô màu trên Cu Tí từng khung (**gửi kèm khi gen**) |
| `ghep-thu-chay-12.png`, `.gif`, `ghep-thu-dung.png` | Đồ thử máy vẽ (nón, giáp, túi, xà cạp, bao tay) đặt theo neo lên Cu Tí thật |
| `kiem-tra.html` | Trang kiểm tra, một tệp tự chứa, mở thẳng bằng trình duyệt |

## 3. Toạ độ

- Cu Tí nhìn **nghiêng 3/4 sang phải**. Phải/trái là tay chân **của nhân vật**:
  - **phải**: gần người xem, bên trái màn hình, **vẽ trước thân**;
  - **trái**: xa, bên phải màn hình, vẽ sau thân (que màu xanh lam).
- **Gốc (0, 0) = góc trên-trái ô.** x sang phải, y xuống, đơn vị điểm ảnh.
- Ô que **cùng tỉ lệ ảnh khung**: 1 điểm ảnh ô = 1 điểm ảnh nguồn.
  - Ô đứng 320×544, chân ở (160, 520).
  - Ô chạy 256×320, chân ở (150, 308).
  - Điểm chân là chỗ game đặt chân, tức [24, 45] trong khung game 48×48.
- Mỗi khớp trong `que-*.json` có 6 bộ toạ độ:

  | Khoá | Hệ toạ độ |
  |---|---|
  | `khop_px` | ô que |
  | `khop_nguon` | ảnh khung đã cắt |
  | `khop_tam_goc` | tấm gốc 2172×724 |
  | `khop_o96` | ô 96 của tấm game (`he_neo: nguon-96`) |
  | `khop_game` | khung game 48×48 |
  | `khop_game_tu_chan` | điểm game tính từ chân |

  Phép đổi ghi ở `he_toa_do` và ở `game.sx/sy/dx/dy` của từng khung.
- **Cỡ**: trong ảnh nguồn, Cu Tí chạy chỉ bằng `neo_do.ti_le_so_voi_dung` ≈ 0,57 Cu Tí đứng. Trong game hai dáng cùng cỡ, vì game co mỗi hàng một tỉ lệ cho đầu bằng nhau. Vì vậy đồ vẽ trên ô que đứng phải co ×0,57 khi đặt vào ô que chạy. `kiem-tra.html` tự làm việc này.
- Góc: 0° = sang phải, 90° = xuống. `xoay_so_voi_dung` dương = xoay theo chiều kim đồng hồ trên màn hình.
- Lớp (số nhỏ vẽ trước):

  | Lớp | Phần |
  |---|---|
  | 10–12 | tay trái |
  | 20–22 | chân trái |
  | 30 | thân |
  | 35 | áo/giáp |
  | 36 | đai, túi |
  | 40–42 | chân phải |
  | 45 | quần (ống gần) |
  | 50 | đầu |
  | 55 | mặt nạ |
  | 70–72 | tay phải |
  | 75 | vũ khí |
  | 85 | nón/mũ |

## 4. Neo cho từng món (`neo_do` của mỗi khung)

| Món | Khoá neo | Bám xương | Xoay khi chạy (so với đứng) |
|---|---|---|---|
| Tóc giả, mũ, nón, mặt nạ | `toc_mu`: `tam_dau`, `dinh_dau`, `co`, `cam`, `ban_kinh_dau` | đầu | ~1° (đầu chỉ nhấp lên xuống, không nghiêng) |
| Áo, giáp thân | `ao`: `co`, `eo`, 2 vai, 2 hông | thân | +24…+34° (chạy nghiêng người tới trước) |
| Tay áo | `ao.tay_ao_phai` / `ao.tay_ao_trai`: vai, khuỷu | cánh tay trên | −38…+34° |
| Quần | `quan`: `eo`, `hong`; `ong_phai` / `ong_trai`: hông, gối, cổ chân | đùi, cẳng chân | đùi tới 120°, cẳng tới 180° |
| Găng, bao tay | `phu_kien.gang_*`: cổ tay | cẳng tay | −44…+71° |
| Giày, dép | `phu_kien.giay_*`: cổ chân, mũi | bàn chân | tới 125° |
| Áo choàng, đồ sau lưng | `phu_kien.lung` | thân | như thân |
| Túi, đai | `phu_kien.eo_treo_tui` | thân | như thân |
| Vũ khí | `phu_kien.tay_cam_phai` / `_trai` | (game đã có neo riêng) | — |

Kết luận:

- **Mũ/tóc và áo thân**: vẽ một lần ở dáng đứng rồi để máy xoay là được.
- **Quần, găng, giày, tay áo**: xoay quá nhiều, xoay ảnh pixel sẽ méo. Phải **vẽ theo từng khung chạy** (mục 6, prompt C2–C5).

## 5. Trang `kiem-tra.html`

- Chọn động tác: đứng, hoặc chạy 12 khung. Có nút ◀ ▶ Chạy và thanh khung. Nhịp ×1 = nhịp game, 62,5 ms mỗi khung.
- **Cu Tí thật (dưới que)** bật sẵn ở **mọi khung**, có thanh độ rõ.
- **Xem MỌI khung cùng lúc**: hiện cả 12 khung, khung nào cũng có Cu Tí thật dưới que. Bấm một khung để xem to.
- Bật/tắt từng lớp: bộ phận tô màu, lưới, xương, khớp, tên khớp, neo đồ, từng món đồ thử.
- **Ảnh 1 món**: vẽ trên ô que đứng 320×544 (chồng lên `que-dung-x1.png`). Chọn xương bám và lớp; máy dời, xoay và co theo từng khung.
- **Ảnh theo từng khung**: một hàng ô cùng cỡ ô que (như `que-chay-12.png`, 12 ô 256×320). Máy đặt từng ô vào đúng khung. Nền `#00FF00` tự bỏ.
- Bảng bên phải: toạ độ khớp (ô que, game), góc và neo của khung đang xem.

## 6. Prompt mẫu: gen trang phục theo từng phần cho cả chu kỳ chạy

Gửi ảnh trước, rồi dán chữ. Mọi prompt đều gửi **ảnh 1 = `docs/anh-goc/zed/moi/00-anh-mau.png` (Cu Tí MỚI)**. Mỗi lần chỉ gen **một phần**. Các phần dùng chung lưới ô, nên ghép lại sẽ khớp.

**C0. Mũ / nón (một lần, máy xoay theo đầu)**

Gửi kèm:
1. `moi/00-anh-mau.png`
2. `mau-gen/vung-mu-dung.png`
3. `que-dung-x1.png`

> Pixel art. Vẽ CHỈ một chiếc nón lá cho cậu bé ninja tóc đen ở ảnh 1, đúng cỡ đầu, nghiêng 3/4 sang phải, trùm lên vùng màu cam ở ảnh 2. Ảnh ra cỡ 320×544, nón nằm đúng chỗ đầu như ảnh 3. Không vẽ người. Nền #00FF00 thuần, không chữ, không bóng đổ, viền tối 1 điểm ảnh.

**C1. Áo thân (một lần, máy xoay theo thân)**

Gửi kèm:
1. `moi/00-anh-mau.png`
2. `mau-gen/vung-ao-dung.png`
3. `que-dung-x1.png`

> Pixel art. Vẽ CHỈ chiếc áo giáp da nâu viền đồng cho nhân vật ở ảnh 1, phủ đúng vùng xanh lục ở ảnh 2 (thân + bắp tay). Ảnh ra cỡ 320×544, đúng vị trí như ảnh 3. Không vẽ đầu, tay, chân. Nền #00FF00 thuần, không chữ, không bóng đổ.

C2–C5 cùng gửi 4 ảnh theo thứ tự:
1. `moi/00-anh-mau.png`
2. `cu-ti-chay-12-hang.png`
3. `que-chay-12-chong-hinh.png`
4. `mau-gen/vung-<phần>-chay.png`

Ảnh ra phải là **1 hàng 12 ô, mỗi ô 256×320**, giữ đúng vị trí như ảnh 2.

**C2. Áo + tay áo cả chu kỳ chạy.** Ảnh 4: `mau-gen/vung-ao-chay.png`
> Pixel art, 1 hàng 12 khung, mỗi ô 256×320, đúng vị trí và cỡ như ảnh 2. Ở mỗi khung vẽ CHỈ chiếc áo ngắn tay màu nâu của cậu bé ở ảnh 1, phủ đúng vùng xanh lục ở ảnh 4 của khung đó. Tay áo theo que vai–khuỷu ở ảnh 3: tay gần (bên trái màn hình) trước thân, tay xa sau thân. Không vẽ người, không vẽ que. Nền #00FF00 thuần, không chữ, không bóng.

**C3. Quần cả chu kỳ chạy.** Ảnh 4: `mau-gen/vung-quan-chay.png`
> Pixel art, 1 hàng 12 khung, mỗi ô 256×320, đúng vị trí như ảnh 2. Ở mỗi khung vẽ CHỈ chiếc quần võ ống rộng màu chàm, phủ đúng vùng xanh dương ở ảnh 4 (đùi + ống tới cổ chân), gập gối như que hông–gối–cổ chân ở ảnh 3. Ống gần trước, ống xa sau. Không vẽ người, không vẽ que. Nền #00FF00 thuần, không chữ, không bóng.

**C4. Găng / bao tay cả chu kỳ chạy.** Ảnh 4: `mau-gen/vung-gang-chay.png`
> Pixel art, 1 hàng 12 khung, mỗi ô 256×320, đúng vị trí như ảnh 2. Ở mỗi khung vẽ CHỈ đôi bao tay vải đỏ (từ khuỷu tới nắm tay), phủ đúng vùng màu đỏ ở ảnh 4 của khung đó, nắm tay khép như ảnh 1. Không vẽ người. Nền #00FF00 thuần, không chữ, không bóng.

**C5. Giày / dép cả chu kỳ chạy.** Ảnh 4: `mau-gen/vung-giay-chay.png`
> Pixel art, 1 hàng 12 khung, mỗi ô 256×320, đúng vị trí như ảnh 2. Ở mỗi khung vẽ CHỈ đôi dép rơm ở vùng màu tím ở ảnh 4, đúng góc bàn chân từng khung (chân đạp sau thì mũi chúc xuống). Không vẽ người. Nền #00FF00 thuần, không chữ, không bóng.

Nhận ảnh về thì mở `kiem-tra.html`:
- C0, C1: dùng **Ảnh 1 món**, bám đầu hoặc thân.
- C2–C5: dùng **Ảnh theo từng khung**, lớp 35 hoặc 45.

Bật **Xem MỌI khung** để soát cả chu kỳ. Món đúng chỗ thì nằm gọn trong vùng tô màu của khung cùng số. Nếu AI vẽ lệch ô, gửi ảnh cho Claude đo lại theo neo trong `que-chay-12.json`, rồi cắt và dời từng ô.

## 7. Giới hạn đã biết

- Khớp đo bằng mắt trên ảnh ×2 có lưới, sai khoảng ±3–4 điểm ảnh nguồn (±0,3–0,4 điểm game). Gối và khuỷu nằm trong quần thụng và ống tay nên kém chính xác nhất. Sửa trong `chinh-tay-*.json` rồi chạy lại.
- Ở hàng chạy, tay xa (bên phải màn hình) luôn đưa tới trước, gần như không vung. Ảnh gốc vẽ như vậy, không phải lỗi đo.
- Chân A (`phai`) đỡ người ở khung 1, chân B (`trai`) đỡ người ở khung 7. Ảnh AI không cho biết rõ chân nào gần, nên tên phải/trái của chân chỉ là quy ước để liền mạch qua 12 khung.
- Bộ phận tách tự động theo xương. Ráp lại thì trùng ảnh gốc 100%. Ranh giới giữa các mảnh thì chỉ xấp xỉ: tay gần đè thân, quần thụng, đuôi đai đỏ bay.
- Đồ thử `ghep-thu-*` là hình máy vẽ để kiểm neo, không phải asset.
