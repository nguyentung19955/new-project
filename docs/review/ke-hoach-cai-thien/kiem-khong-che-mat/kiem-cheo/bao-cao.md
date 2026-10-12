# Kiểm chéo "kiếm không che mặt" (phiên thứ hai cùng yêu cầu, 12/10)

Hai phiên cùng nhận một yêu cầu. Phiên kia đẩy trước (`c9ab627`, báo cáo [`../bao-cao.md`](../bao-cao.md)); phiên này đã làm xong
một bản riêng cùng ý (hạ kiếm ra sau, vùng đầu ở lớp sau thân, ngón tay AI đè chuôi) nhưng **bỏ bản riêng, giữ bản `c9ab627`**
để không có hai cách vẽ chồng nhau, rồi dùng bộ đo riêng của mình để kiểm chéo bản đó.

## Bộ đo riêng (khác bộ đo của `c9ab627`)

[`kiem/do_mat.py`](kiem/do_mat.py): kịch bản dựng tay (không qua luật game), vẽ `G.art.hero` 3×, 60 hình/giây, chung một người
chơi; 4 em bé × thân gốc + Rừng/Biển/Lâu × 2 hướng × 11 trạng thái = 17 696 khung. Vùng mặt khung nào máy không đo được thì ước
từ **điểm đỉnh đầu** của khung (khác cách "mượn khung gần nhất" của `c9ab627`) — hai cách ước độc lập nên chỗ nào hai cách cùng
nói "sạch" là chắc. Bản hai tệp như web, iPhone ngang 844×390 dpr 3.

## Tìm thấy và đã sửa (2 chỗ nhỏ, chỉ khi `G.KIEM_SAU` bật)

1. **Cu Tí bộ Lâu Đài đứng yên: núm chuôi vẽ đè lên miệng** (ảnh: [`anh/lau-dung-truoc-sau.png`](anh/lau-dung-truoc-sau.png),
   trên: `c9ab627`, dưới: sau sửa). Nguyên nhân: tấm này **không khung đứng nào** đo được mặt (mũ trùm cáo) nên `SC.matKhungGan`
   mượn mặt thân gốc — cao hơn mặt thật ~4 điểm ảnh (thân bộ đầu to, mặt thấp: thân gốc y ≈ −17,5, Lâu Đài y ≈ −13,3). Sửa:
   mượn trước các khung đo được của **chính tấm đó** (hàng chạy, rồi mọi hàng khác), thân gốc chỉ là cách cuối
   (`game/js/sprite_custom.js`, `SC.matKhungGan`).
2. **Mép lưỡi lấn 1–3 điểm ảnh màn hình lên mép mặt** khi chạy chém quay trái (thân ở toạ độ lẻ, mép cắt khử răng cưa): đĩa đầu
   nới từ 2r + 0,5 lên 2r + 1,2 (`game/js/hero_tinhlinh.js`, `dauTu`) — giống số bản riêng của phiên này đã dùng.

## Số đo kiếm (khung có kiếm đè lên điểm ảnh mặt / tổng)

| | Bản web trước (`36dcd37`) | Bản `c9ab627` | Sau kiểm chéo |
|---|---|---|---|
| Mặt đo được (máy dò ra đĩa mặt) | hàng nghìn khung (đứng thân gốc 368/384, tới 31,5 %) | 5 khung, 1–3 điểm ảnh màn hình | **0** |
| Mặt ước (mũ to thân bộ) | tới 79 % mặt (Cu Tí Lâu Đài đứng: kiếm dựng giữa mặt) | 795 khung, tới 34,6 % (gồm Cu Tí Lâu Đài đứng: núm chuôi trên miệng) | 175 khung, tới 23,8 %* |

\* 175 khung còn lại đều ở khung mặt ƯỚC, chỗ hai cách ước lệch nhau (thân cúi thấp lúc bổ kiếm, chạy nghiêng người): đã xem bằng
mắt các khung lớn nhất (Cu Tèo Lâu Đài nhát bổ, Cu Lì Rừng Già chạy, Cu Tí Lâu Đài đứng) — mặt sạch, kiếm ở dưới / sau đầu.
Số đủ: [`so-ban-c9ab627.txt`](so-ban-c9ab627.txt), [`so-sau-kiem-cheo.txt`](so-sau-kiem-cheo.txt).

## Kiểm khác

- `?kiemsau=0` vẫn y hệt bản `36dcd37` (dấu vân 17 696 / 17 696 khung giống, kiếm); hai chỗ sửa chỉ chạy khi cờ bật.
- Trận thật (4 em bé chém chuỗi vào bia): khung chạm, sát thương từng lần, tổng — y hệt bản `36dcd37`.
- 0 pageerror; `node --check`, `python3 game/build.py`, `LK_HAI_TEP=1 python3 game/build.py --hai-tep` đạt.
