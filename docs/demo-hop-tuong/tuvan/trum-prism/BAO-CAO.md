# PRISM WARDEN — làm cho "nhìn là hiểu" (10/11)

Người dùng (Solo đợt 50): "Tôi chả hiểu con boss này là như nào, đang làm gì, vì hiệu ứng như cứt rồi còn lệch lệch".
Ảnh trước/sau: `truoc-sau.jpg` (393×852: trước · khiên bật · sắp bật lại · khiên vỡ · PVP tiếng Anh).

## Cơ chế (nói gọn cho người chơi)
**Prism Warden mang khiên lăng kính: khi khiên bật, mọi đòn chỉ gây 10% sát thương (−90%). Muốn phá khiên phải bắn trúng nó bằng
3 LOẠI ụ khác nhau (từ đợt 40: 4 loại); khiên vỡ thì trùm nhận đủ sát thương khoảng 8 giây, rồi tự dựng lại khiên.**

(Luật trong `thap/js/trum.js`, KHÔNG đổi: `PRISM_GIAM 0.1`, `prismCan` 3/4, vỡ `PRISM_BE 7 s` + niệm 1,4 s.)

## Vì sao khó hiểu (gốc lỗi)
1. Băng dưới bàn chỉ ghi tên "KHIÊN LĂNG KÍNH" + số "2s/1s" nhảy vòng vô nghĩa: khiên đang bật thì trùm không có chiêu, `capNhatTrum`
   thử lại mỗi 2 s → băng đếm 2→1→2… (Twin Core cũng bị y hệt; Star Leech khi chưa có ụ 2★ cũng vậy).
2. Khiên vẽ bằng 3–4 mảnh cung `prism_seg` xoay quanh — mảnh tối mờ to như bóng, mảnh sáng lệch sang một bên → "lệch lệch"; cộng thêm
   lớp "khiên vàng" (giapT → `fx_st_khienvang`) phủ lên thân.
3. Nổ tên lửa Pháo La Bàn (`fx_canon_trung`, 56 px, vẽ đặc — source-over) chồng 5–10 vụ cùng lúc đúng tâm trùm (thân 86 px) → mây nổ trắng-vàng che kín thân.
   Bản vẽ dải dựng sẵn của `camgiac.js`/`vfxp3.js` (thay REN.veMot) đọc thẳng `a.co`, nên phải thu cỡ ở vòng vẽ chứ không chỉ ở một hàm.
4. Số sát thương: mỗi màu/kiểu một số riêng, cùng chỗ `E.y − 16` → chồng nhau.

## Đã sửa (chỉ hiển thị — không đổi luật, thời gian, tất định; không Math.random, không filter/shadowBlur)
- **Vỏ lăng kính** (`trumvfx.js` `veLangKinh`): khiên bật = lục giác trong suốt ôm sát thân, viền sáng cyan + trắng, 3 mặt cắt; ảnh nướng sẵn 1 lần mỗi cỡ.
  Thân trùm luôn thấy rõ. N viên kim cương trong mép dưới vỏ: viên sáng = loại ụ đã trúng (đủ N → vỡ).
- **Nhịp báo**: lúc trùm niệm dựng lại khiên (1,4 s) viền lục giác chớp 2,5 Hz, co từ 1,35× về ôm thân. **Vỡ**: vỏ bung ra mờ dần 0,35 s.
- **Loé khúc xạ** khi bị đánh lúc có khiên: mặt lục giác trắng nhỏ ở mép phía ụ bắn + 3 tia lệch (lam/tím/vàng) 0,2 s — đòn bị bẻ cong,
  chỉ 10% lọt qua. ≤ 3 loé/trùm, cách nhau ≥ 70 ms.
- Bỏ lớp khiên vàng phủ thân cho trùm có `E.khien` (giapT vẫn giữ trong luật).
- **Băng chữ ghi TÁC DỤNG** (`hud-anime.js` `HA.cbChu`, 2 dòng, EN + VI):
  khiên bật "KHIÊN LĂNG KÍNH: −90% ST / Bắn bằng 4 loại ụ khác nhau để phá · 2/4" (không đếm giây) ·
  sắp bật "Khiên sắp bật lại!" + giây · vỡ "KHIÊN VỠ: NHẬN ĐỦ ST / Khiên bật lại sau" + giây.
  Mọi trùm khác: dòng 2 = tác dụng ngắn (`VT.NGUY`, vd "Đóng băng ngẫu nhiên 3–5 ụ").
- **Nổ quanh trùm** (`render.js` `danhDauNoTrum`, `camgiac.js` `kA`): mỗi trùm chỉ vẽ 2 vụ nổ ụ mới nhất trong bán kính thân, cỡ ≤ 0,36 thân,
  độ đậm × 0,5; vòng nổ ≤ 0,4 thân. Hiệu ứng CHIÊU của trùm (`TRM.fx` → `FX.cuaTrum`) giữ nguyên.
- **Số sát thương trên trùm** (`fx.js` `chu1`): mọi số trong thân trùm < 0,3 s cộng vào 1 số (chí mạng nâng số đó lên vàng); số mới xếp so le 3 làn.
- Mô tả trùm (băng giới thiệu / danh sách trùm): "Shield breaks to 3–4 turret types" (VI dịch sai "Khiên vỡ thành…") →
  "−90% damage until hit by 3–4 turret types" / "−90% sát thương tới khi trúng 3–4 loại ụ khác nhau".

## Rà các trùm khác (khiên / miễn nhiễm / biến hình)
| Trùm | Chiêu | Cùng lỗi? | Xử lý |
|---|---|---|---|
| Twin Core | tách đôi khi chết (bị động) | Có: băng "SPLIT 2s/1s" vô nghĩa | bỏ đếm, dòng 2 "Tách làm đôi khi bị phá huỷ" |
| Star Leech | cướp sao rồi lao | Có khi bàn chưa có ụ 2★ (thử lại mỗi 2 s) | bỏ đếm khi không có ụ 2★ |
| Static Jammer, Hive, Patch Titan | nhắm ụ / tự niệm | Không | thêm dòng tác dụng |
| 6 trùm cũ (Mad Crown…Octopus) | nhắm ụ | Không có khiên/miễn nhiễm trên thân | thêm dòng tác dụng |
Không trùm nào khác có khiên trên thân; "khiên vàng" PVP (giáp đối thủ) giữ nguyên.

## Kiểm
- Ảnh 393×852 (Solo VI: khiên bật / vỡ / tắt / niệm sáng / niệm tối / bật lại; PVP EN) — đã xem tận mắt; ghép `truoc-sau.jpg`.
- `thap-kt-trum-don` XANH · `thap-kt-san-trum` đạt · `thap-kt-tu-kich` 29/29 · `thap-kt-matran` 3 lỗi có sẵn (da/bang × copyLen, Lửa Thập Tự) ·
  `thap-kt-vi` trượt vì 61 chuỗi chưa dịch CÓ SẴN (Hydra, Copycat…) — không có chuỗi mới của phần này.
