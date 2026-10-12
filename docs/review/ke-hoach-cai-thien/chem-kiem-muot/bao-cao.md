# Chém kiếm mượt — báo cáo (12/10)

Yêu cầu: [`YEU-CAU.md`](YEU-CAU.md). Làm trên nhánh `khoi-tao-du-an`. Cờ mới **`G.KIEM_MUOT`** (tắt: mở game với `?kiemmuot=0`
→ vẽ **y hệt** bản trước, đã so từng điểm ảnh 353 khung hình: khác 0).

## 1. Đã kiểm code gì (mục 2 của yêu cầu)

| # | Phần | Nằm ở | Kết luận |
|---|---|---|---|
| 1 | Nhân vật người chơi, trạng thái đòn | `js/combat.js` (`P.atkT`, `P.atkDur`, `G.heroArgs`: `atk = 1 − atkT/atkDur`), `js/moves.js` (`swordChain`, `swordGlide`, `begin`) | 3 nhát: 0,30 / 0,30 / 0,46 giây, gây sát thương ở 45% đòn, chuỗi tự về đầu sau 0,45 giây. Kiếm **không có** giữ lấy đà (giữ nút = chém chuỗi). Không đổi gì. |
| 2 | Hệ hoạt ảnh | `js/hero_tinhlinh.js` (`pick`, `pose`, `ATK.sword`, `nhip`), `js/sprite_custom.js` (`SC.chonEmBe`, `khungDon`) | Thân em bé là **ảnh AI**: hàng `atk_sword` 6 khung = 3 nhát × 2 khung (lấy đà / chém), đổi khung ở u = 0,4. Góc kiếm thì lấy từ **khung xương code** 10 khung — hai hệ không liên quan nhau. |
| 3 | Sprite sheet, cắt khung | `game/art/custom/em-be-<key>-don.sprite.json` | 6 khung đủ, đúng thứ tự, chân đúng chỗ (phiên tay-kiem-mat đã kiểm, kiểm lại bằng `kiem/quat_goc.py`). Không phải nguyên nhân. |
| 4 | Hướng nhìn / đánh | `hero` (lật `scale(f,1)`), `aimRot` (đánh chếch 8 hướng) | Quay trái và phải ra **cùng một dãy góc** (đo: y hệt). Không phải nguyên nhân. |
| 5 | Vẽ thân, tay, kiếm, vệt | `drawFrame`, `vkGhep` (chuôi gắn vào nắm tay đo trên ảnh: `SC.TAY_KIEM`), `kiemKhop` (né mặt), `js/fx.js` (`cungVk`: vệt ảnh bám mũi kiếm) | Kiếm là hình riêng gắn vào tay (không nằm trong ảnh AI). Xoay ảnh kiếm đã là xoay điểm ảnh gần nhất, bước 5° (`SC.xoayVk`): **không nhoè**. |
| 6 | Bấm nút, thời lượng, chuyển trạng thái | `moves.js` (`M.input`, bộ đệm bấm), `combat.js` | Không khoá nút vô hạn; không đổi. |
| 7 | Va chạm, vùng trúng | `moves.js` `boxHit` (hộp theo hướng nhắm), `M.hit` lúc 0,45 | Không đổi. |
| 8 | Cỡ, dời, điểm xoay, lớp | `HOLD`, `lechCo` (ảnh kiếm co 0,66), `neoTay`, `front` | Chuôi luôn ở nắm tay (lệch ≤ 0,7 điểm ảnh, trước và sau). Lớp trước/sau: xem mục 2. |

## 2. Nguyên nhân đã xác minh bằng số

Công cụ: `kiem/do_goc.py` vẽ thật từng khung hình **60 fps** (dùng chung một đối tượng người chơi như trong game) và ghi góc kiếm,
khung thân AI, lớp trước/sau thân, chỗ chuôi so với nắm tay. Số đầy đủ: [`so-do-goc-truoc.txt`](so-do-goc-truoc.txt) và
[`so-do-goc-sau.txt`](so-do-goc-sau.txt) (góc: 0 = trước mặt, âm = chĩa lên, dương = chúc xuống; chữ `s` = kiếm vẽ sau thân).

Ví dụ Cu Tí, nhát 2 (chém ngược), trước khi sửa — đúng điều chủ dự án thấy:

```
-67 (đứng) -60 -60 11 11 45 45 45 -5 -55 -55 -68 -115s -106s -71 -71 -67 -67 -67 ...
            chúc xuống ↑      nằm ngang ↑    vung qua đầu ↑ (ra sau thân)   lại chúc về
```

1. **Góc kiếm không theo cánh tay ảnh AI.** Thân AI chỉ có 2 khung mỗi nhát, nhưng góc lấy từ khung xương code 10 khung có quỹ đạo
   riêng: trong 0,3 giây kiếm đổi chiều quay 3 lần lớn (+112° → −160° → +51°). Cả 4 em bé như nhau (cùng khung xương).
2. **Kiếm quay quanh nắm tay đứng yên.** Lúc thân AI không đổi khung, góc vẫn nhảy ≥ 30° mỗi khung hình: nhát 2 có 5 lần
   (71°, 34°, 50°, 47°, 35°); sau cú chém, kiếm quay ngược lên 83–110° (32 → 19 → −4 → −51) trong khi thân vẫn đứng ở khung chém
   → "kiếm quay quanh một điểm".
3. **Lớp trước/sau đổi 2 lần mỗi nhát** (nhát 2: trước → sau → trước) vì luật né mặt bật/tắt theo từng khung.
4. **Đầu đòn, cuối đòn nhảy góc**: đứng −67° → vào đòn −107°/−114° ngay khung đầu; chiêu Trảm Nguyệt đứng im ở 16° rồi nhảy về −67°
   trong một khung; lướt chém 0° → −66° trong một khung.
5. **Chạy mà chém**: thân là hàng chạy, kiếm vẫn đi theo khung xương đứng → cùng lỗi đảo chiều (Cu Tèo nhảy 111°, 127°/khung).

Không phải nguyên nhân (đã đo): thứ tự / cắt khung ảnh, điểm chân, độ dời chuôi (luôn đúng nắm tay), lật trái/phải, thời lượng khung,
nhoè do xoay.

## 3. Đã sửa gì

Tệp sửa: **`game/js/hero_tinhlinh.js`** (hàm mới `kiemMuot`, gọi trong `vkGhep`; ghi góc đã vẽ trong `drawFrame`; `tip()` báo
thêm kiếm đang vẽ trước hay sau thân), **`game/js/fx.js`** (1 dòng: cung vệt chém bỏ đoạn kiếm vẽ sau thân), gói lại `game/dist/*`.
Không đổi ảnh, không đổi tệp dữ liệu, không thêm thư viện.

Mỗi nhát kiếm nay là **một đường vung** cho từng em bé, góc lấy theo cánh tay của chính khung ảnh AI
(tờ chọn góc: [`anh/quat-goc.png`](anh/quat-goc.png) — vạch đỏ: góc lấy đà, xanh lá: góc chém, vàng: theo đà):

| Pha | Thời điểm trong đòn (u) | Kiếm làm gì |
|---|---|---|
| Vào thế (wind-up) | 0 → 0,12 | đi tiếp từ góc đang cầm (đứng, hay cuối nhát trước) tới thế lấy đà; 60% ngay ở khung thân đổi |
| Lấy đà (anticipation) | 0 → 0,26 | kéo lùi thêm 14°, chậm dần |
| Giữ | 0,26 → 0,33 | gần đứng yên (nén lực) |
| Vung (attack) | 0,33 → 0,48 | nhanh dần rồi chậm dần; thân đổi khung ở 0,40 **đúng giữa cú vung** (cú quay lớn nhất rơi đúng lúc tay đổi tư thế); lúc đòn chạm 0,45 mũi kiếm ở trước mặt |
| Theo đà (follow-through) | 0,48 → 0,62 | vượt góc chém thêm 20°, chậm dần |
| Thu kiếm (recovery) | 0,62 → 1 | lùi chậm 30% về góc đứng |
| Về đứng (idle) | 0,14 giây sau đòn | xoay nốt về góc đứng, chậm dần, không nhảy (cả sau Trảm Nguyệt và lướt chém) |

- Góc chỉ đổi liên tục; trong cú vung chỉ đi **một chiều**. Chuôi luôn ở nắm tay (kiếm xoay quanh chuôi, không quanh tâm ảnh).
- Lớp trước/sau thân **cố định trong mỗi khung thân** (lấy đà: sau thân khi kiếm qua vai/sau đầu; chém: trước thân) → đổi tối đa
  1 lần mỗi nhát, đúng lúc thân đổi khung. Lưỡi không bao giờ vẽ đè lên mặt (đoạn nào đi ngang mặt thì kẹp lại, không xoay giật).
- Chạy mà chém: cùng các pha; Cu Tèo có góc riêng (nắm tay lúc chạy sát mặt).
- Trảm Nguyệt: góc tính liền theo thời gian thay vì 7 khung xương (hết cảnh đứng im 5 khung rồi nhảy).
- Kiếm vẫn xoay theo bước 5° điểm ảnh gần nhất như trước → giữ nét pixel.

## 4. Kết quả đo (trước → sau)

Số lần góc kiếm nhảy ≥ 30° trong một khung hình **khi thân AI không đổi khung** (cảm giác "quay quanh một điểm"),
và số lần đổi lớp trước/sau:

| Em bé | Nhát 2 đứng | Chuỗi 3 nhát đứng | Chạy chém 3 nhát | Đổi lớp (chuỗi 3 nhát) | Đổi chiều quay lớn trong nhát 2 |
|---|---|---|---|---|---|
| Cu Tí | 5 → 1 | 10 → 3 | 11 → 9 † | 6 → 4 | 2 → 1 |
| Cu Tèo | 4 → 2 | 9 → 5 | 9 → 10 † | 6 → 4 | 2 → 2* |
| Cu Lì | 4 → 2 | 9 → 4 | 12 → 9 † | 6 → 4 | 2 → 1 |
| Cái Bống | 4 → 1 | 9 → 3 | 11 → 9 † | 6 → 4 | 2 → 1 |

† Số sau lần kiểm chéo (mục 9): chạy mà chém nay vào thế êm suốt 0,33 đầu đòn thay vì nhảy 60% trong một khung, nên có thêm vài
bước 30–47°/khung nhưng không còn bước 83–98°/khung (trước kiểm chéo: 8 / 8 / 7 / 8).

\* Cu Tèo: lần thứ hai là lúc về thế đứng sau đòn (khung đứng của Cu Tèo bắt kiếm nghiêng ra trước để khỏi che mặt), không phải giữa cú chém.

Ghi chú trung thực: khi **chạy mà chém** thân không có khung đòn (chân vẫn bước), nên cú vung nhanh (0,15 giây cho 150–240°) vẫn
là kiếm quay quanh nắm tay; khác biệt là nay đi một chiều, có lấy đà – theo đà – thu kiếm, không quay đi quay lại.
Ví dụ Cu Tí nhát 2 sau khi sửa: `-67 (đứng) -6 29 47 51 54 55 56 30 -44 -53 -59 -62 -62 ...` (hạ kiếm lấy đà → hất lên → dừng, không quay lại).

Ảnh (trên: trước, dưới: sau; phóng ×4; GIF 30 hình/giây lấy từ 60):

- Đứng chém liên tục 3 nhát: [`anh/truoc-sau-dung.gif`](anh/truoc-sau-dung.gif)
- Vừa chạy vừa chém: [`anh/truoc-sau-chay.gif`](anh/truoc-sau-chay.gif)
- Quay trái: [`anh/truoc-sau-trai.gif`](anh/truoc-sau-trai.gif)
- Trảm Nguyệt rồi lướt chém sau né: [`anh/truoc-sau-chieu.gif`](anh/truoc-sau-chieu.gif)
- Từng khung 60 fps (không bỏ khung) nhát 1 và nhát 3, 4 em bé: [`anh/tung-khung-60fps.png`](anh/tung-khung-60fps.png)
- Trong trận thật (có vệt chém, khựng hình), iPhone ngang 844×390: [`anh/tran-iphone-dung.gif`](anh/tran-iphone-dung.gif)

Đã tự xem các ảnh trên (dải từng khung, các khung trích từ GIF): kiếm nằm trong nắm tay ở mọi khung, lúc lấy đà kiếm qua vai / sau
đầu không che mặt, cú chém đi một chiều, sau đòn kiếm xoay về thế đứng.

## 5. Kiểm thử

| Kiểm | Kết quả |
|---|---|
| Bản hai tệp như web (`LK_HAI_TEP=1 python3 game/build.py --hai-tep`, `linh-khi-nhe.html?cloud=0`), iPhone 844×390 dpr 3 và máy tính 1280×720 | 0 lỗi trang (pageerror) ở mọi lần chạy |
| Trận thật, 4 em bé × (đứng chém chuỗi, chạy chém, quay trái): khung gây sát thương và tổng sát thương lên bia | **y hệt** trước/sau: chạm ở khung 10, 32, 58; 42 sát thương mỗi em bé ([`so-tran-iphone.json`](so-tran-iphone.json), [`so-tran-may-tinh.json`](so-tran-may-tinh.json)). Lúc chạm, kiếm chĩa ra trước (nhát 1: 6–13°, nhát 3: 25–35°) hoặc hất lên trước (nhát 2) — đi qua vùng đánh đúng lúc. |
| Không gây sát thương thừa | Mỗi nhát 1 lần chạm (3 nhát → 3 lần), không đổi |
| Không kẹt trạng thái | Sau khi thả nút, về đứng trong 0,14 giây (đo), hết đòn đúng như trước |
| `?kiemmuot=0` | 353/353 khung giống từng điểm ảnh bản trước (`kiem/so_px.py`) |
| `tests/au_vu_khi.py 20 2`, `tests/au_dps.py 8` | số **y hệt** bản trước (so cùng lúc với bản cũ) |
| `tests/smoke.py`, `tests/anim_smoke.py` | 0 lỗi |
| `node --check game/js/*.js`, `cloud_save_regression.test.js`, `python3 game/build.py` | đạt |
| Đứng, chạy, trúng đòn, lộn | không đổi (cờ chỉ chạm lúc chém kiếm và 0,14 giây sau đòn) |

## 6. Chưa xác minh được

- Chưa chạy trên iPhone thật (chỉ giả lập khung 844×390, dpr 3 trong Chromium). Chưa có người chơi thử cảm giác "có lực".
- "Giữ lấy đà" với kiếm: game không có (kiếm giữ nút = chém chuỗi), nên không có gì để sửa.
- Vũ khí khác (giáo, búa, cung) không đổi.
- Lúc **đứng yên** (không đánh), kiếm của Cái Bống vẫn đi sát má như trước (luật `G.VK_NE_MAT` của phiên rà soát A) — không thuộc phiên này.

## 7. Khung ảnh AI (không bắt buộc)

Không cần vẽ lại để chạy đúng. Nếu muốn thân Cu Tí theo kiếm rõ hơn: ở hàng chém của Cu Tí, khung 2 và khung 4 (đếm từ 1) nắm tay
vẫn ở trước ngực nên nhát 1 và nhát 2 chỉ có kiếm chuyển động. Ảnh tham chiếu: hàng "smith" trong [`anh/quat-goc.png`](anh/quat-goc.png).

> Ảnh gửi kèm là hàng chém kiếm 6 khung của bé Cu Tí (pixel art chibi, nhìn nghiêng sang phải). Chỉ vẽ lại khung 2 và khung 4.
> Khung 2: tay trước duỗi thẳng ra trước ngang ngực như vừa chém ngang, nắm tay ở xa trước người. Khung 4: tay trước hất cao lên
> phía trước, nắm tay cao hơn vai, không che mặt. Tay không cầm vũ khí (kiếm do game vẽ thêm). Giữ nguyên nhân vật, màu, viền đen,
> cỡ người, vị trí chân như các khung còn lại; nền xanh lá trơn #00ff00, ô 48×48 như ảnh gốc.

Vẽ lại thì cần đo lại bảng tay `SC.TAY_KIEM` cho 2 khung đó (bảng tự bỏ qua khung đổi số điểm ảnh).

## 8. Công cụ (thư mục `kiem/`)

`do_goc.py` (đo góc/lớp/chuôi từng khung 60 fps), `quat_goc.py` (tờ chọn góc), `gif_truoc_sau.py` (GIF trước/sau),
`dai_khung.py` (dải từng khung), `tran_gif.py` (trận thật + số chạm), `so_px.py` (so điểm ảnh khi tắt cờ). Phục vụ `game/dist` bằng
`docs/review/ke-hoach-cai-thien/full-audit/A-nhan-vat/kiem/srv2.py`.

## 9. Kiểm chéo độc lập (phiên thứ hai, cùng yêu cầu) và 2 sửa nhỏ

Một phiên khác chạy song song với **cùng yêu cầu** và tự làm một bản riêng (cũng cờ `G.KIEM_MUOT`, đường vung ~ tương tự). Bản ở trên
(8cac41b) đã lên nhánh trước, nên **giữ nguyên bản này**, không đẩy bản thứ hai; phiên thứ hai chỉ dùng bộ đo riêng của mình
(`kiem/kiem-cheo/`, đo khác cách: chung một người chơi suốt kịch bản, đo cả trong trận thật có vệt chém, khựng hình) để kiểm lại.

**Kết quả kiểm chéo** (gộp 4 em bé × 2 hướng mặt, so với bản trước phiên; đầy đủ: `kiem/kiem-cheo/bang.md`; "cú vung" = u 0,40 → 0,50):

| Kịch bản | Nhảy góc lớn nhất ngoài cú vung (độ/khung) | Khung "giữ rồi giật ≥ 30°" | Đổi lớp mỗi nhát | Lưỡi qua mặt | Lệch chuôi |
|---|---|---|---|---|---|
| Nhát 1 / 2 / 3 đứng | 61 / 71 / 68 → 53 / 63 / 68 | 0 / 2 / 16 → **0 / 0 / 0** | 2 / 2 / 2 → 2 / **0** / 2 | 0 → 0 | ≤ 0,71 |
| Chém liên tục 3 nhát | 71 → 58 | 24 → **2** | 2,0 → **1,3** | 0 → 0 | ≤ 0,71 |
| Vừa chạy vừa chém | 102 → **38** | 30 → **0** | 2,0 → **1,3** | 0 → 0 | ≤ 0,71 |
| Trảm Nguyệt | 90 → 67 | 8 → **0** | 2 → 2 | 0 → 0 | ≤ 0,71 |
| Né rồi lướt chém | 74 → 66 (khung đầu cú lộn, không thuộc đòn) | 8 → **0** | 2 → 2 | 0 → 0 | ≤ 0,71 |

Các bước 53–68° (đứng) là chủ ý của bản này: ở khung đầu nhát kiếm nhảy 60% tới thế lấy đà **cùng lúc thân AI đổi khung**
(đổi tư thế kiểu pixel art "từ thế này sang thế kia"), để kiếm không quay lâu quanh nắm tay đứng yên.

Trong trận thật (`kiem/kiem-cheo/tran_that.py`: luật game thật, giữ Đánh đứng yên → nhả, chạy phải, chạy trái, Trảm Nguyệt, né + lướt;
iPhone 844×390 dpr 3 và 1280×720 dpr 1): 0 lỗi vẽ, 0 pageerror; bia mất máu đúng một lần mỗi nhát, ở khung vẽ đầu tiên sau 0,45, lúc đó
kiếm chĩa ra trước (nhát 1: 6–13°, nhát 2: −8…−65°, nhát 3: 25–35°). Cung vệt chém (`kiem/kiem-cheo/vet.py`) bám đường mới, giữa cung
luôn hướng ra trước (−3° … −35°).

**Sửa 1 — góc lật 360° (lỗi tiềm ẩn):** lúc "vào thế", góc cũ được quy về số gần **góc đang tính**; góc đang tính chạy qua mốc ±180°
so với góc cũ thì cách quy lật 360° giữa hai khung. Bản gốc chỉ còn cách 3–7° là gặp (nhát 1 nối sau nhát 3: góc cũ 26–30°, đường vung
−134…−150°); khi kéo dài vào thế (sửa 2) đã thấy thật trong trận: −39° → −202° trong một khung. Nay quy về số gần **đầu đường vung**
(cố định cả nhát) — `kiemMuot` trong `game/js/hero_tinhlinh.js`.

**Sửa 2 — chạy mà chém vào thế êm:** thân hàng chạy không đổi khung để "che" cú nhảy 60%, nên trong trận thật kiếm nhảy 98°/khung
(nhát 1: 30° → −68°) và giữ −15° tám khung rồi nhảy 83° (nhát 3). Nay khi chạy mà chém, kiếm vào thế êm suốt 0,33 đầu đòn (chậm–nhanh–chậm):
lớn nhất **47°/khung** trong trận, không còn "giữ rồi giật" (16 → 0). Đứng chém giữ nguyên như thiết kế ở trên.
GIF chạy chém đã vẽ lại: [`anh/truoc-sau-chay.gif`](anh/truoc-sau-chay.gif); số đo `so-do-goc-sau.txt` đo lại (chỉ dòng `chay` đổi).

Đã kiểm sau 2 sửa: `?kiemmuot=0` vẫn **y hệt từng điểm ảnh** bản trước phiên (64/64 dải ảnh, 8 kịch bản × 4 bé × 2 hướng); giáo, búa, cung
bật/tắt cờ giống hệt (1 440 khung); đứng chém, Trảm Nguyệt, lướt: số đo không đổi; `smoke.py` 0 lỗi; `node --check` đạt; gameplay không đụng.

Còn lại (chưa sửa, để chủ dự án xem rồi quyết): nhát 1 nối sau nhát 3 khi **đứng** chém, khung đầu nhảy ~90° (19° → −73°) cùng lúc thân đổi
khung — nếu vẫn thấy "giật" ở đầu nhát thì có thể cho đứng chém cũng vào thế êm như chạy chém (đổi một dòng, `vao` trong `kiemMuot`).

