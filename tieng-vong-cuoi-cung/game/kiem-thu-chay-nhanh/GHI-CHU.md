# So sánh clip chạy cũ (rig-v3) và clip chạy nhanh mới (rig-v4) trong game – 26/10/2026

> **BẢN CHỜ DUYỆT CHUYỂN ĐỘNG – CHƯA HOÀN THIỆN.** Clip v4 chỉ là đề xuất để chủ dự án xem; chưa gọi là xong trước khi duyệt.
> **CHƯA thử trên iPhone thật** (không có máy) – mọi số dưới đây đo trong Chromium headless trên máy tính.

Làm theo `art/modular/lam-moi/YEU-CAU-CHAY-NHANH-C.md` mục 1–3 (chỉ phần chạy; chém/nhảy để phiên khác).

## Xem gì
| File | Nội dung |
|---|---|
| **`chay-v3-canh-v4-60fps.mp4`** | **bản chính**: ghép cạnh nhau, trái = clip cũ v3, phải = clip mới v4, đủ 60 khung/s, cùng màn, cùng phím |
| `chay-v4-60fps.mp4` | riêng clip mới v4 (960×540, 60 fps, 14,2 s) |
| `chay-v3-60fps.mp4` | riêng clip cũ v3 phát nhanh ở 264 px/s |
| `112px-1-chay-trai-va-tuong-dung.gif` | chạy trái → va tường (giữ phím) → dừng |
| `112px-2-chay-phai-tang-giam-toc.gif` | chạy phải, nhả/giữ phím liên tục (tăng – giảm tốc) → va bậc đá |
| `112px-3-nhay-tiep-dat-quay-dau.gif` | nhảy lên bậc, tiếp đất chạy tiếp, quay đầu trái, dừng |
| `112px-4-dung-yen-tang-toc-giam-toc.gif` | từ đứng yên tăng tốc chạy phải, nhả phím giảm tốc tới dừng |
| `112px-5-chay-trai-nhay-tiep-dat-dung.gif` | chạy trái, nhảy, tiếp đất, dừng |
| `so-do.json`, `log-tung-buoc-v3.csv`, `log-tung-buoc-v4.csv` | số đo đầy đủ + log từng bước logic |

GIF 112 px = cắt **1:1** quanh Lam từ màn game 960×540 (Lam cao đúng 112 px logic, **không phóng**), trái v3 | phải v4,
30 khung/s (xem nhanh). Nhịp chân chuẩn xem ở mp4 60 fps.
Góc trên trái video: tên clip, tình huống, khung/số khung, pha, dx thực của bước.

## Chơi thử
- Clip mới (mặc định): https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
- Clip cũ để so, trong cùng game: thêm **`?clip=v3`** vào cuối địa chỉ (`demo.html?clip=v3`).
- Thêm `&debug=anim` (hoặc `?debug=anim`) để xem bảng: clip, khung, pha, dx thực. Màn bắt đầu cũng ghi clip đang dùng.
- `game/demo-doi-chieu-v3.html` (bản giữ đối chiếu) **không sửa**.

## Đã ghép thế nào (mục 2 yêu cầu)
| | |
|---|---|
| Phát theo quãng đường thực | mỗi bước logic, chỉ khi **chạy trên đất**: `pha = (pha + |dx_thực| / QUANG) mod 1`, khung = `floor(pha × số khung)`. `dx_thực` = dịch ngang **sau** xử lý va chạm (không tính camera). QUANG đọc từ JSON: v4 = **132**, v3 = 83,66 |
| Sát tường | đẩy vào tường → dx_thực = 0 → không chạy, hiện dáng đứng, **pha đứng yên** (không đạp chân) |
| Đổi tốc độ | pha **không bao giờ reset** (tăng/giảm tốc, dừng, nhảy, quay đầu); chạy lại tiếp đúng pha cũ |
| Tiếng Vọng | mỗi bước ghi **clip (`cl`) + khung (`k2`) + pha (`p2`)** + lật; bóng vẽ đúng clip + khung đã ghi, không tính lại theo va chạm của bóng |
| Không đổi | tốc độ (264 px/s), collider 20×30, vùng ăn đòn, lực nhảy, khoảng cách màn – kiểm: vị trí x/y + trạng thái của hai lượt v3/v4 **giống hệt từng bước** |
| Khung TẠM ngoài chạy | dáng nghỉ (dùng chung, v4 cùng ô/neo với v3); nhảy/rơi/lướt dùng khung bay của clip (v4: 12/30, v3: 14/32) |

File đổi: `demo.html` (chọn clip `?clip=v3`, ghi `cl` vào Lam/Tiếng Vọng/vệt lướt, kiểm `phien_ban_clip` của JSON khi nạp),
`build-demo.py` (nhúng cả hai clip, PNG nguyên bản; bản build ≈ 4,8 MB, `?clip=v3` vẫn chạy trong bản build),
`tools/kiem-thu-chay-nhanh.py` (quay + đo, file này), `tools/diem-cham-clip.py` (đọc rig để đo trượt chân),
`tools/kiem-thu-chay-lam.py` (chỉ đổi sang mở `?clip=v3` để vẫn đo đúng clip cũ).

## Số đo (cùng màn Cổng làng, cùng 264 px logic/s, 850 bước logic = 14,2 s)
| | **v3 cũ (phát nhanh)** | **v4 mới** |
|---|---|---|
| Quãng đường / chu kỳ | 83,66 px | **132 px** |
| Chu kỳ ở 264 px/s | 19,01 bước logic = **0,317 s** | 30,00 bước = **0,500 s** |
| Bước chân / giây | **6,31** | **4,00** |
| Sải mỗi bước chân | 41,8 px (0,37 chiều cao Lam) | **66 px (0,59 chiều cao Lam)** |
| Khung sheet tiến mỗi bước logic (tốc độ tối đa) | 1,68 → bỏ qua khung, chỉ **19/32 khung** hiện ra mỗi chu kỳ | **1,00** → **30/30 khung** đều hiện |
| Bước nhảy khung giữa 2 bước chạy (số lần: 0 / 1 / 2 khung) | 11 / 94 / 117 | 27 / 195 / 0 |
| Nhảy khung lớn nhất **khi đổi tốc** (74 lần đổi vx) | 2 khung (= bình thường) | **1 khung** |
| Pha nhảy/reset sai | 0 (lệch ≤ 1·10⁻¹⁶) | 0 (lệch ≤ 1·10⁻¹⁶) |
| **Trượt chân** ở tốc độ tối đa (mỗi bước, lớn nhất / trung bình) | 1,81 / 1,13 px | **0,04 / 0,007 px** |
| Trượt chân khi tăng/giảm tốc (lớn nhất / trung bình) | 2,26 / 0,99 px | 4,07 / 1,83 px |
| Trượt tích luỹ lớn nhất trong một lần chạm đất | 2,20 px | 2,88 px |
| Va tường (112 bước giữ phím vào tường, 3 lần) | pha đứng yên, 0 bước vẽ khung chạy | pha đứng yên, 0 bước vẽ khung chạy |
| Tiếng Vọng (104 bước ghi, 103 bước phát) | bản ghi khớp clip+khung+pha; 0 bước sai; vẽ đúng | bản ghi khớp clip+khung+pha; 0 bước sai; vẽ đúng |
| Lỗi trang | không | không |

Cách đo trượt: lấy điểm vật chất ở đế đang chạm đất (từ chính rig của clip) và xem nó dịch bao nhiêu trên nền thế giới giữa
hai bước logic liền nhau (`|dx_thực + hướng × dịch_trong_hình|`, px logic). Trượt khác 0 chỉ do làm tròn khung (khung hiện ra
trễ tối đa 1 khung so với quãng đường thật) nên không dồn lại: v3 tối đa 1 khung = 2,6 px, v4 1 khung = 4,4 px.
- Ở **tốc độ tối đa** v4 khớp gần tuyệt đối (mỗi bước đúng 1 khung = 4,4 px) – đây là lý do v4 dùng 30 khung thay 32.
- Khi **tăng/giảm tốc** v4 lệch lớn hơn v3 (4,1 vs 2,3 px lúc nặng nhất) vì mỗi khung v4 "dài" 4,4 px: lúc đi chậm hơn 4,4
  px/bước, có bước khung đứng yên rồi bước sau mới nhích. Chỉ xảy ra trong ~5–6 bước tăng/giảm tốc (0,1 s).
- Riêng **lúc quay đầu** (bước 501): bấm phím ngược, Lam lật mặt ngay nhưng thân còn trôi theo đà cũ 1–2 bước → chân đạp tới
  trong khi thân lùi: trượt 4,7 px (v3) / 2,1 px (v4). Có từ trước (logic quay đầu của game, cả hai clip), không tính vào bảng trên.

## Nhận xét (từ video/khung đã quay + số đo; tôi không xem được trên máy thật)
- **v4 đỡ "líu chân" rõ**: 4 bước/giây thay 6,3; mỗi bước dài 0,59 chiều cao Lam thay 0,37 – nhìn ra dáng chạy sải, có pha bay
  hai chân rời đất thấy được (37,5 % chu kỳ). v3 phát nhanh trông như chạy lạch bạch, chân đổi liên tục.
- **v4 mượt hơn ở 60 fps**: mỗi bước logic hiện đúng 1 khung mới (v3 nhảy 1–2 khung, bỏ 13/32 khung mỗi chu kỳ).
- Chân chịu lực v4 bám đất ở tốc độ tối đa (0,04 px); khi tăng/giảm tốc chân có lúc "đứng khựng" 1 bước rồi nhích (≤ 4,4 px).
- Đổi tốc độ, dừng, va tường, nhảy – tiếp đất: không thấy giật khung (bước nhảy khung lớn nhất 1).
- Vật lý giữ nguyên hoàn toàn: cảm giác điều khiển y như cũ, chỉ khác hình.

## Cái chưa đẹp / chưa làm
- **Chưa thử iPhone/Safari**: chưa đo tốc độ vẽ, bộ nhớ (sheet 2x ~8,3 MB RGBA giải nén + bản tô màu cho bóng); chỉ nạp
  một clip mỗi lần nên bộ nhớ như bản v3.
- Đầu/chóp giữ đúng biên độ v3 nhưng nảy **nhanh hơn** (gia tốc đỉnh mũ 1140 → 2090 px/s² vì bước ngắn hơn) – xem có thấy
  "giật đầu" không (theo yêu cầu chưa đổi ở lượt này).
- Tăng/giảm tốc: lệch chân tối đa 4,1 px (mục trên). Nếu thấy rõ, hướng sửa sau: nội suy 2 khung hoặc sheet nhiều khung hơn
  cho tốc độ thấp (chưa làm).
- Lúc quay đầu thân trôi ngược 1–2 bước (có từ trước, cả v3).
- Nhảy, rơi, lướt vẫn là **một khung bay đứng yên** (TẠM); đứng, chém, bị đánh… là dáng nghỉ TẠM. Lúc vào chạy từ đứng yên và
  lúc dừng, hình đổi thẳng dáng nghỉ ↔ khung chạy (chưa có clip khởi động/dừng).
- Nền vẫn gradient TẠM; quái/boss/gạch bản cũ.

## Chạy lại
`python3 -B game/tools/kiem-thu-chay-nhanh.py` (cần playwright + Chromium, ffmpeg, numpy/pillow/scipy; ~6 phút).
Thêm `--khong-quay` để chỉ đo, không quay video.
