# Ghi chú – quái chuông gỗ + boss Chuông Gác Làng

Viết cho người không rành kỹ thuật. Mở trước: `xem-thu/so-co-voi-Lam-3x.png`, rồi các GIF `xem-thu/*-lon.gif`
(cỡ lớn, có hộp đòn đỏ ở khung chạm) và `*-1x.gif` (đúng cỡ chơi). Không gen ảnh AI: mọi mảnh cắt bằng code từ hai
ảnh nguồn. Dáng do người đặt mốc bằng số (không IK). **Chưa chạy thử trên iPhone/Safari.**

## 1. Đã làm gì
**Tách mảnh** (`manh/`, ảnh `xem-thu/<nv>-manh.png`, `chi-tiet-bu-va-cat.png`):
- Quái: thân chuông (mắt, quai treo nằm trong thân), **quả lắc riêng**, 2 nắm tay, 2 chân. Nắm tay và chân vốn đã rời
  nên cắt sạch. Quả lắc nằm đè lên vành miệng chuông → cắt theo mặt nạ (vùng màu gỗ + vành nét đen 16 px), chỗ bị che
  trên thân **được bù**: vành miệng chuông và nét đen dưới cùng nội suy chạy liền qua (theo đường cong mép dưới), lòng
  chuông tô màu tối sẵn có. Chỉ lộ ra khi quả lắc đung đưa.
- Boss: thân chuông + mái (mắt, khoen, đoạn xích nằm trên thân giữ luôn trong thân), **đoạn xích treo riêng** (từ mắt
  xích dọc đầu tiên dưới khoen trở xuống, đung đưa quanh chỗ móc), 2 nắm tay đá (vốn rời). Không phải vẽ bù mặt
  chuông vì chỗ cắt nằm ngay mép viền phải của chuông.
- Thêm cho clip chết: thân **chẻ đôi** dọc vết nứt có sẵn trên hình (mép chẻ tô thêm nét tối 7 px như vết nứt).
- Dáng nghỉ ráp lại trùng ảnh nguồn: IoU bóng quái **0,994**, boss **0,996** (phần lệch là viền khử răng cưa).

**Cỡ trong game** (Lam 112 px logic):
| | Cao (px logic) | So với Lam | Lý do |
|---|---|---|---|
| Quái | **116** (đỉnh quai treo → đế chân) | 1,04× | Hitbox gameplay 72×108 (không tính quai). Ở 116 px: thân + chân không quai ≈ 102 px, thân chuông rộng ≈ 77 px → khớp hitbox; quái "ngang tầm" Lam, chỉ cao hơn nhờ cái quai. |
| Boss | **330** (đỉnh núm mái → mặt đất) | 2,95× | Theo yêu cầu ~3× Lam. Boss không có chân nên **lơ lửng**: quả lắc (điểm thấp nhất) cách đất 6 px, vành miệng chuông ~14 px. Hitbox gameplay 200×290 phủ thân chuông tới chân mái. |

**Animation** (nhịp lấy từ `game/demo.html`, 60 tick/s; mọi clip nội suy theo thời gian, đo được: vượt biên = 0):
| Clip | Thời lượng | Khung | Ghi chú |
|---|---|---|---|
| quái đứng | 1,6 s lặp | 24 × 66,7 ms | thân phồng/xẹp nhẹ quanh đáy, tay nổi lệch pha, quả lắc đưa ±3° |
| quái đi tuần | 0,6 s lặp (2 bước) | 18 × 33,3 ms | tốc độ 54 px/s (0,9 px/tick). Chân chịu lực: đế phẳng, nằm đúng mặt đất, trôi đúng tốc độ đất – đo lệch **0** (lấy mẫu mỗi 1 ms) |
| quái đấm | 1,2 s | 36 × 33,3 ms | lấy đà 500 ms → vung → **chạm khung 18–20** (= tick 5–10 của 'strike') → thu. Nắm tay nằm 100 % trong hộp đấm gameplay ở cả 3 khung chạm |
| quái trúng đòn | 267 ms | 8 | giật lùi + nháy trắng (khung 0–1, 4–5) |
| quái chết | 1,0 s, giữ khung cuối | 31 | nháy → vỡ đôi (khung 4) → rơi, đổ sang hai bên, quả lắc lăn ra, tay chân rơi/ngã → nằm yên, tối dần 30 % |
| boss đứng | 1,6 s lặp | 32 × 50 ms | bồng bềnh 4 px, tay đá nổi, xích đung đưa ±3° (dùng cả khi boss lướt đi) |
| boss đập xuống | 1,7 s | 34 | chuẩn bị 500 → trên không (game có thể giữ khung 10–17 khi còn bay) → **chạm khung 19–21**: thân rơi chạm đất, hai nắm tay nện đúng mặt đất → thu 750 ms |
| boss quét ngang | 1,35 s | 27 | chuẩn bị 500 → nắm tay trước miết sát đất từ sau ra trước → **chạm khung 11–13** (= tick 2–10 của 'sweep'), chồng hộp quét gameplay → thu |
| boss trúng đòn | 300 ms | 6 | giật lùi + nháy (game hiện chỉ nháy, clip để dùng khi cần) |
| boss chết | 1,6 s, giữ khung cuối | 33 | rung, nháy → tay rơi → thân chìm chạm đất → 700 ms (≈ lúc game bắn mảnh) nứt đôi, hai nửa nghiêng toác ra, xích rơi; tối dần |

Kiểm tự động 49/49 ĐẠT (`so-lieu.json`): không xuyên đất ở mọi 5 ms của mọi clip; clip lặp nối vòng liền; mọi clip
không lặp bắt đầu/kết thúc đúng dáng nghỉ, và khung 0 của clip đứng cũng đúng dáng nghỉ → đổi clip không giật;
sheet cùng khung/neo, không chạm mép, không vẽ dưới đất.

**Hitbox**: lấy từ gameplay, ghi trong JSON từng clip (`hitbox_than_gameplay`, `hop_don_gameplay`), KHÔNG lấy theo
hình. GIF lớn vẽ chúng để soi.

## 2. Còn gì chưa đẹp / cần biết
- **Boss rất nặng khi dùng sprite sheet**: khung 1018×744 px (2x) ≈ 2,9 MB khi giải nén; cả 132 khung ≈ **380 MB**
  bộ nhớ ảnh nếu nạp hết (quái: 0,5 MB/khung, ≈ 61 MB cho 117 khung). File PNG boss 2,6–9,6 MB mỗi trang. Trên iPhone
  điều này gần như chắc chắn quá nặng nếu nạp cùng lúc. Gợi ý: nạp theo clip, hoặc (tốt hơn cho boss) vẽ rig trực tiếp
  từ `boss.json` + 6 mảnh (đã tính sẵn tư thế từng khung), hoặc sheet 1x cho boss. Chưa đo trên máy thật.
- Canvas boss rộng vì cú quét (nắm tay ra tới ~−270 px) và cú đập (tay giơ cao trên mái) – mọi clip dùng chung.
- **Chỗ bù sau quả lắc** (quái): khi quả lắc đung đưa mạnh (trúng đòn, chết) lộ một mảng nội suy có sọc ngang mờ ở
  vành miệng chuông (`chi-tiet-bu-va-cat.png`). Ở cỡ chơi gần như không thấy.
- **Xích boss**: chỗ móc giữa đoạn xích treo và đoạn trên thân là một đường cắt thẳng – khi xích lắc mạnh (−22° lúc đập)
  thấy một khấc nhỏ ở mắt xích đầu và vài mẩu nét đen rất nhỏ của viền chuông/xích. Biên độ lắc thường ±3–8° thì khó
  thấy. Đoạn xích trên thân không lắc.
- **Thân chẻ đôi** chỉ là cắt theo đường gấp khúc dọc vết nứt (không vẽ thêm mặt cắt). Lúc vừa vỡ có khe sáng giữa hai
  nửa; hai nửa của quái khi nằm trông như hai tấm gỗ dài. Boss: hai nửa chỉ nghiêng toác ra (−16° / +14°), không đổ
  nằm hẳn – đổ hẳn thì canvas boss phải rộng gần gấp đôi.
- Nháy trắng được nướng sẵn vào sheet (trúng đòn, chết). Nếu game tự nháy (`q.flash`, `b.flash`) thì sẽ nháy chồng.
- Quái đấm: game dời quái 18 px trong 5 tick đầu 'strike' → trong clip hai chân nhón nhảy nhỏ 3 px cho khỏi trượt.
- Quái đi: hai chân sát nhau (rộng 26 px, tâm cách 26 px) nên lúc bước qua nhau hai chân chồng thoáng qua (chân xa vẽ sau).
  Chân xa đứng cao hơn 1,3 px (chiều sâu 3/4 của ảnh nguồn) – giữ nguyên.
- Boss "đi" trong game hiện là lướt (`moveX`) → dùng clip đứng; không làm clip đi riêng.
- Boss treo trần (pha 2) chưa có clip riêng – dùng clip đứng, xích có thể cần dài hơn (mảnh xích hiện chỉ có đoạn trong ảnh).
- Clip quét 1350 ms (27 × 50 ms) dài hơn gameplay 1333 ms đúng 17 ms; khung cuối là dáng nghỉ.
- Hướng: ảnh nguồn quay trái; quay phải là lật ngang – mắt/khoen/xích sẽ đổi bên (giống mọi sprite lật).

## 3. Câu hỏi cần chủ dự án quyết
1. **Cỡ quái 116 px** (thân không quai ≈ 102 px, khớp hitbox 72×108) – được chưa, hay muốn quái thấp hơn Lam (vd. 104)?
2. **Boss lơ lửng** (quả lắc cách đất 6 px, không chân) – giữ, hay muốn boss ngồi hẳn xuống đất?
3. **Boss dùng sprite sheet 2x hay rig trực tiếp?** Sheet 2x ≈ 380 MB giải nén nếu nạp hết; rig trực tiếp chỉ 6 mảnh.
   Hoặc boss sheet 1x (¼ bộ nhớ, mờ hơn)?
4. **Nhịp khung**: quái 30 hình/s (đứng 15), boss 20 hình/s. Lam chạy 50 hình/s. Có cần boss mượt hơn (tốn bộ nhớ hơn)?
5. **Chết**: quái vỡ đôi + đổ nằm; boss nứt đôi nghiêng – được chưa? Muốn boss đổ nằm hẳn (canvas rộng gấp đôi) hay vỡ
   kiểu khác (vd. mái rơi ra)?
6. **Nháy trắng** nướng trong sheet hay để game tự nháy (bỏ khỏi sheet)?
7. Có cần thêm: clip quái thức dậy (`sleep/awake` của quái gác), boss gầm (`intro`), boss treo trần + bị kéo xuống (pha 2)?
