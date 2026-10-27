# 3 nhân vật địch mới: Nấm Mốc, Dơi Chuông, Mẹ Nấm Mốc

Làm theo **đúng cách đã duyệt** của quái chuông gỗ và boss Chuông Gác Làng (`art/the-gioi-moi/quai-boss/`). Mảnh được
cắt bằng code từ ảnh nguồn, không gen ảnh mới. Mỗi con có rig cha–con, mốc đặt tay, nội suy không vượt biên, kiểm bằng
số, và vẽ thẳng từ mảnh + JSON trong game (không dùng sprite sheet).

> ⚠️ **Chưa thử trên iPhone thật.** Mọi số đo đều lấy từ Chromium headless, xem `game/thu-quai-moi/GHI-CHU.md`.
> ⚠️ **Game chưa có ba con này**, nên **mọi số gameplay ở dưới chỉ là ĐỀ XUẤT**: hitbox, tốc độ, tầm, nhịp đòn. Chưa
> sửa `game/demo.html`.

**Xem chạy thử (xoay ngang trên iPhone):**
https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-quai-moi/thu-quai-moi.html
Có nút chọn từng con hoặc cả ba, nút **Hitbox**, **Chậm ×4**, và bảng số nạp/vẽ.
Video 60 hình/s (đã bật hitbox): `game/thu-quai-moi/video/nam-60fps.mp4`, `doi-60fps.mp4`, `menam-60fps.mp4`, `ca-ba-60fps.mp4`.

## 1. Đã làm gì
1. **Tách mảnh từ bản nguyên** (hình đã ráp sẵn bên trái ảnh nguồn). Mảnh rời vẽ lại bên phải ảnh khác dáng và khác cỡ
   so với bản nguyên, nên **không dùng thẳng** mà chỉ dùng để **bù phần bị che**. Ví dụ: đỉnh thân nằm dưới mũ nấm,
   phần túi bào tử nằm sau thân. Code tự căn mảnh rời vào bản nguyên (tìm tỉ lệ, góc, vị trí), rồi chỉ lấy điểm ảnh ở
   đúng chỗ bị che. Chỗ che nhỏ thì vá bằng inpaint, còn chỗ che lớn (mũ dưới chuông) thì chép vân của chính mũ sang
   rồi kẻ thêm nét viền. Ở dáng nghỉ phần bù luôn bị che, nên hình ráp lại vẫn trùng ảnh nguồn.
2. **Lật ngang.** Ảnh nguồn nhìn sang phải, còn quy ước game (giống quái và boss cũ) là nhân vật **quay trái**; quay
   phải thì lật quanh điểm neo.
3. **Rig, mốc, nội suy, kiểm tra.** Dùng chung bộ máy của quái cũ (`rig.py`, `dong_tac.py`, `noi_suy*.py`). Kiểm tự
   động **65/65 ĐẠT** (`so-lieu.json`).
4. **Gói runtime** `game/runtime/quai-boss/quai-moi-rig.json` + thư mục `nam/`, `doi/`, `menam/`, kèm
   **`QBR.napThem()`** trong `game/runtime/quai-boss-runtime.js`. Code mới chỉ được **thêm vào cuối file**, phần cũ
   giữ nguyên.
5. **Trang thử riêng** `game/thu-quai-moi/thu-quai-moi.html`, có đo nạp/giải mã/vẽ, kèm video 60 hình/s.

Đã làm đúng các yêu cầu tích hợp (`YEU-CAU-TICH-HOP-QUAI-BOSS.md`):
- vẽ từ mảnh, không dùng sheet;
- hitbox do gameplay quyết (khung xanh/đỏ trong ảnh chỉ là đề xuất);
- **clip không có nháy trắng**, game tự nháy bằng ảnh trắng cache sẵn;
- cờ bật/tắt mảnh (thân chuông vỡ đôi, bào tử) **đổi bậc, không nội suy**;
- ảnh trắng / tối / vàng làm sẵn 1 lần cho mỗi ảnh lúc nạp;
- đổi clip thì hoà từ tư thế đang hiện, không giật về dáng nghỉ.

## 2. Cỡ (Lam = 112 px logic)
| | Cao | Rộng dáng nghỉ | Khớp ảnh nguồn (IoU) | Hitbox thân đề xuất | Mảnh |
|---|---|---|---|---|---|
| **Nấm Mốc** | **116 px** (= quái chuông gỗ) | 89 px | **0,9945** | 72×100 | mũ, chuông, thân, 2 nắm tay, 2 chân + bào tử ×6 |
| **Dơi Chuông** | **56 px** (½ Lam) | 89 px (sải cánh) | **0,9923** | 44×44 | thân chuông, quả lắc, 2 cánh + 2 nửa chuông (lúc chết) |
| **Mẹ Nấm Mốc** | **330 px** (= boss cũ, ≈ 3× Lam) | 333 px | **0,9937** | 200×300 | gò rễ, thân, mũ, chuông, 2 túi bào tử, 2 vuốt + bào tử ×8 |

Yêu cầu là IoU ≥ 0,98. Ảnh so cỡ (cùng đường đất, có cả quái và boss cũ): `xem-thu/so-co-voi-Lam-3x.png`,
`-1x.png`, `so-co-man-hinh-960x540.png`.
Điểm neo là **giữa đáy hitbox**: Nấm và Mẹ Nấm thì neo ở mặt đất, Dơi thì neo ở đáy quả lắc.

## 3. Clip (nhịp 60 bước/s, lấy theo quái/boss cũ)
**Nấm Mốc.** Đòn chọn: **ĐẤM** (không phun bào tử). Lý do: dùng lại nguyên máy trạng thái của quái chuông gỗ đang có
trong game, chỉ cần thay hình và hộp đấm. Phun bào tử để dành cho Mẹ Nấm Mốc cho khỏi trùng đòn.
| Clip | Thời lượng | Ghi chú |
|---|---|---|
| đứng | 1,6 s lặp | thở, **mũ nấm phập phồng**, chuông nghiêng ±3° |
| đi | 0,6 s lặp | chân chịu lực trôi đúng 54 px/s (= 0,9 px/bước của game), mũ lắc trễ nhịp |
| đấm | 1,2 s | chuẩn bị 30 bước (ngả sau, mũ phồng to dần, chuông rung) → chạm khung 18–20 → thu |
| trúng | 267 ms | giật lùi, mũ dẹt rồi nảy |
| chết | 1 s, giữ khung cuối | **mũ bật khỏi thân, lật ra sau rồi rơi nằm trên đất**, 6 bào tử bay lên rồi mờ dần, thân ngả, nắm tay rơi |

**Dơi Chuông** (quái bay): xem thêm `art/nhan-vat/doi-chuong/GHI-CHU.md`.
| Clip | Thời lượng | Ghi chú |
|---|---|---|
| bay | 0,4 s lặp | vỗ cánh 2,5 lần/s, thân nhấp nhô, quả lắc lắc trễ |
| lao | 1,4 s | chuẩn bị 27 bước (bốc lên, ngửa, giơ cánh rung) → **lao** 450–950 ms (chúi 35°, cụp cánh) → hồi |
| trúng | 267 ms | ngửa, cánh xoè bật |
| chết – rơi | 0,3 s lặp | lộn nhào trong lúc game cho rơi |
| chết – vỡ | 0,9 s, giữ cuối | chạm đất, **chuông nứt đôi theo vết nứt**, quả lắc lăn, cánh rũ |

**Mẹ Nấm Mốc** (boss, không chân, ngồi trên gò rễ). Mỗi đòn có **telegraph 27–30 khung** đúng như gdd.
| Clip | Thời lượng | Ghi chú |
|---|---|---|
| đứng | 1,6 s lặp | thở, **mũ phập phồng**, túi bào tử đập như tim |
| quét | 1,3 s | chuẩn bị 27 bước (vuốt kéo ra sau, giơ cao) → quét 14 bước, vuốt miết sát đất ra trước → hồi |
| đập | 1,5 s | chuẩn bị 30 bước (hai vuốt giơ qua mũ) → đập 5 bước → **chạm đất ở 583 ms** (sự kiện để game tạo sóng) → hồi |
| phun | 1,3 s | chuẩn bị 30 bước (**hai túi phồng tới 1,36× theo nhịp giật**) → **nổ ở 500 ms**, bào tử phụt ra → hồi |
| trúng | 300 ms | chỉ dùng khi boss đứng yên; trúng đòn không ngắt đòn đang đánh |
| chết | 1,8 s, giữ cuối | rung, vuốt rơi, túi xẹp, bào tử bay lên, **mũ sụp xuống thân, chuông lăn khỏi mũ rơi xuống đất** |

Xem từng khung: `xem-thu/<nv>-contact-sheet.png`.
GIF cỡ lớn (có đường đất, neo, hitbox, hộp đòn đỏ ở khung chạm): `xem-thu/<nv>-<clip>-lon.gif`.
GIF đúng cỡ chơi 1:1: `xem-thu/<nv>-<clip>-1x.gif`.
Mỗi con có ảnh so dáng nghỉ (`<nv>-nghi-so-sanh.png`) và bảng mảnh + pivot (`<nv>-manh.png`).
Ảnh của Dơi nằm ở `art/nhan-vat/doi-chuong/xem-thu/`.

## 4. Đề xuất số gameplay (chưa có trong game – cần anh duyệt)
| Con | Đề xuất |
|---|---|
| Nấm Mốc | HP như quái chuông gỗ. Đi 0,9 px/bước. Đấm: wind 30 → strike 16 (lao 3,6 px/bước ở bước 0–5, hộp bật bước 5–10) → rec 26. Hộp đấm **{dx −92, dy −62, w 60, h 40}** (thấp hơn hộp quái cũ {−90,−81,66,37}, vì nắm tay Nấm ở ngang thân). Hitbox 72×100. |
| Dơi Chuông | Bay lơ lửng ở độ cao đáy hitbox **≈ 150 px trên đất** (dao động ±6 px), đuổi ngang 1,2 px/bước. Thấy Lam trong **tầm 220 px ngang** thì: chuẩn bị 27 bước → lao 30 bước với vận tốc (−4,4; +4,5) px/bước (đi xuống ≈ 135 px, tiến ≈ 130 px), hitbox thân 44×44 gây sát thương lúc lao → hồi 27 bước về chỗ cũ → nghỉ ≥ 90 bước. HP 2 nhát. Chết: rơi trọng lực 0,5 px/bước², chạm đất mới chuyển sang clip vỡ. |
| Mẹ Nấm Mốc | Hitbox thân 200×300. Quét: hộp sát đất **{dx −275, dy −62, w 205, h 62}** bật ở bước 2–10 của pha quét. Đập: hộp **{dx −250, dy −70, w 110, h 70}** + 2 sóng chạy hai bên 5 px/bước từ chỗ hai vuốt chạm đất. Phun: lúc nổ (500 ms) bắn 3 đạn bào tử chậm (≈ 2,2–2,8 px/bước, hơi rơi) từ tâm hai túi (toạ độ có trong JSON, `su_kien`). Đòn chọn theo khoảng cách: gần thì quét, vừa thì đập, xa thì phun. |

## 5. Cái chưa đẹp / cần anh xem
- **Phần bù lộ ra khi chết**: đỉnh thân Nấm khi mũ bay đi, mũ Mẹ Nấm dưới chuông khi chuông lăn ra. Các chỗ này là vân
  chép/vá, nhìn gần thì hơi nhoè. Ở cỡ chơi khó thấy, nhưng nếu anh muốn đẹp hẳn thì cần một ảnh gen "mũ không chuông"
  và "thân không mũ".
- **Dơi Chuông vỡ**: cắt đôi theo vết nứt cho ra một nửa to, một nửa nhỏ. Nửa to vẫn đứng gần như nguyên chuông, nên
  trông giống "mẻ một miếng" hơn là "vỡ đôi".
- Lòng chuông Dơi sau cuống quả lắc là chỗ vá. Khi quả lắc văng mạnh (lúc lao) có thể thấy một vệt tối trong miệng
  chuông.
- Nhớt chảy từ mũ Nấm xuống thân bị cắt ở mép mũ: phần dưới đi theo thân, phần trên đi theo mũ. Lúc đứng yên không
  thấy, chỉ lộ khi mũ rơi.
- Mũ Mẹ Nấm khi sụp kéo theo chuông bị méo nhẹ. Đã bù co giãn nhưng mũ còn nghiêng nên lệch chút.
- Bào tử dùng chung một hình bong bóng cắt từ `art/re-muc/nguon/re-muc-do-vat.png` (màu xanh ngọc hơi lục, Nấm thì
  xanh lơ hơn).

## 6. Cách ghép vào `game/demo.html` (chưa làm)
1. Sau `QBR.nap(SRC.qbr, …)` thêm `await QBR.napThem(SRC.qbr, 'quai-moi-rig.json', p => setLoad(…))`, cùng thư mục
   `runtime/quai-boss/`. Bản build tự chứa thì nhúng giống `TV.NHUNG.qbr`: đối số thứ 4 là `{json, anh: {'nam/than.png':
   'data:…'}}`, và `build-demo.py` cần thêm một khối nhúng cho `quai-moi-rig.json`.
2. **Nấm Mốc**: tạo quái như quái chuông gỗ, chạy cùng `updateQuai`. Mỗi bước gọi `QBR.capNhatNam(q, S.frame)` thay
   cho `capNhatQuai`; khi vẽ dùng `QBR.ve(ctx,'nam',q.H.cur,x,y,flip,{alpha:q.fade,trang:nhay(q.flash)})`. Đổi hộp
   đấm QHB sang số đề xuất ở trên (hoặc giữ số cũ, anh quyết).
3. **Dơi Chuông**: cần thêm `updateDoi` với các trạng thái `fly / diveWind / dive / diveRec / hit / fall / dead`
   (đúng tên mà `QBR.capNhatDoi` nhận), theo số ở mục 4. Code mẫu có trong hàm `buoc()` của trang thử.
4. **Mẹ Nấm Mốc**: cần `updateBoss` mới với `idle / sweepPrep / sweep / sweepRec / clawPrep / clawSlam / clawRec /
   sporePrep / sporeBurst / sporeRec / hit / die` → `QBR.capNhatMeNam`. Sự kiện chạm đất ở bước 5 của `clawSlam`, nổ
   bào tử ở cuối `sporePrep`.
5. Hitbox và đạn đều do code game tính; animation chỉ thể hiện đúng lúc. Nháy trắng dùng `trang:` của `QBR.ve`.

## 7. Chạy lại (độc lập, chỉ cần `pip install pillow numpy scipy opencv-python-headless`)
```
cd art/re-muc/quai-boss/code
python3 chay_het.py           # ~6 phút: tách mảnh → rig → clip → ảnh xem thử → kiểm tra
python3 chay_het.py --nhanh   # ~10 s: bỏ tách mảnh + GIF, dùng khi chỉnh mốc trong clip_*.py
python3 ../../../../game/runtime/xuat-quai-moi.py   # xuất lại gói runtime
```
| File | Việc |
|---|---|
| `code/tach_manh.py` | tách mảnh: đường cắt/đa giác đặt tay, căn mảnh rời để bù, vá, lật ngang |
| `code/dung_rig.py` | rig, pivot, cỡ trong game (lý do ghi đầu file) |
| `code/clip_nam.py`, `clip_doi.py`, `clip_menam.py` | **bảng mốc đặt tay** + nhịp + số gameplay đề xuất |
| `code/xuat.py` | ghi clip vào `nam.json` / `menam.json` / `art/nhan-vat/doi-chuong/doi.json` |
| `code/xem_thu.py`, `code/kiem_tra.py` | ảnh/GIF xem thử; kiểm tự động → `so-lieu.json` |
| `code/rig.py`, `dong_tac.py`, `noi_suy*.py`, `chung.py` | bộ máy chung, chép từ quái/boss cũ |

Đầu ra:
- `manh/nam/`, `manh/menam/` (Dơi: `art/nhan-vat/doi-chuong/manh/doi/`): mảnh RGBA cỡ gốc + `tach.json` (vị trí, cách
  bù);
- `nam.json`, `menam.json`, `doi.json`: rig + mọi clip (mốc từng kênh + tư thế tính sẵn từng khung).

Không viết kiểm thử tự động ngoài phần đo / kiểm số ở trên.
