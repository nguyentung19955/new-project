# Chống rối "15 ụ cùng bắn" — trước / sau (nhánh claude/chong-roi)

Đo bằng `tools/thap-kt-15u.js` (đã chép từ nhánh claude/kiem-nhan-dien; thêm biến `OUT=` để đổi thư mục ra), iPhone 13, BASE `http://localhost:8774/thap/`.
Ảnh: `truoc/A.jpg`, `truoc/B.jpg` (bản sạch, trước khi sửa) · `sau/A.jpg`, `sau/B.jpg` · số từng khung: `*/so-lieu.json`.

| Kịch bản | Dải nổ (trần 90) | Hạt (trần 320) | Chữ nổi (trần 48) |
|---|---|---|---|
| A trước | 90 (chạm trần cả 8 khung) | 320 | 36→48 (chạm trần 6/8 khung) |
| A sau | 90 — 89/90 là **chớp nòng** (chop_nong, giữ nguyên theo yêu cầu) | 320 | **2** |
| B trước | 57→90 (chạm trần 4/8 khung) | 320 | 33→48 |
| B sau | **14→35** | 320 | **6–7** |

## Đã sửa
- b) `fx.js FX.no()`: nổ trúng cùng loại, cách < 0,3 ô, vụ cũ mới bắt đầu < 80 ms → không đẻ dải mới; vụ cũ phóng +6%/lần (tổng ≤ +25%) và sống thêm 0,03 s (≤ ×1,35). Chớp nòng, co ≥ 70 và `trum_*` không gộp.
- b2) `fx.js FX.chu1()`: số sát thương (chỉ chữ số, kiểu thường/chí mạng, cùng màu) trùng chỗ (±24 × ±18 px) trong 150 ms → cộng dồn vào 1 số.
- c) `fxu.js PX.vongHoi()` (mọi vòng nạp: render.js + growfx.js): nạp < 70% và không đang chạm xem ụ → mờ ×0,25; loé khi đầy/nhả giữ đủ sáng. Hàm chung `uDangXem(T)` (fx.js) = dải #tt đang mở cho ụ hoặc đang soi vùng ụ hỗ trợ.
- c2) `buffvfx.js`: bùng khi nhận buff giữ nguyên; hào quang lặp sau 1,5 s dịu dần (0,5 s) về 20%; đang chạm xem ụ → đủ sáng.
- d) Hố Đen: vẽ DƯỚI lớp quái (`render.js`), đĩa xoáy ×0,5 (`vfxp2.js`), hình mở màn mảnh/mống mắt/xoáy ≤ 0,5 (`sigfx.js`); nhiều hố trùng tâm (3 ụ cùng nhịp) chỉ vẽ 1 đĩa + 1 bộ mở màn (trước: 3 lớp 50% chồng thành gần đục).

## Nhìn tận mắt
- Dải số sát thương không đọc được → còn 1 số/quái (A) hoặc 3 số rời (B).
- Hố Đen: quái/trùm đứng trong vùng xoáy thấy rõ (so `truoc/B.jpg` khung 7,5 s với `sau/B.jpg`).
- Vòng nạp: trong kịch bản B các ụ được đặt cùng lúc nên nạp đồng nhịp (blackhole 0,64→0,85, bang 0,75→1,0 — đa số ≥ 70% → vẫn sáng đúng luật); ụ dưới 70% (doc 0,2–0,4) đã mờ.
- **Đốm trắng góc dưới phải KHÔNG phải nổ trúng chồng**: xoá hết FX.anim/hat/chu vẫn còn — đó là quầng cổng lõi (`render.js veCongLoi` + `corehud.js veLoi`, 128 px 'lighter'). Chưa sửa (ngoài 5 mục đã chốt).
- Còn chạm trần: hạt 320 (tia lửa trúng `lua #ffd080` ~240 hạt ở A) và dải nổ 90 ở A do chớp nòng 15 Liên Thanh (mỗi ụ ~6 chớp nòng chồng). Gợi ý bước sau: mỗi ụ chỉ giữ 1 chớp nòng sống (chớp mới thay chớp cũ), giảm hạt tia lửa khi trúng điểm đã gộp.
- Trận thường: `tran-390x844.jpg` (iPhone DPR 3), `tran-844x390.jpg` — không vỡ hình.
