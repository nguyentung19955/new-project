# Nguyên tắc cộng hưởng · ghép · liên kết · phá huỷ (08/11/2026)

Người dùng: *"Vì game này tư duy chiến thuật nhiều nên tôi muốn các cơ chế cộng hưởng ghép nối phá huỷ nó cần ăn khớp nhau"*. Mọi cơ chế mới / sửa phải khớp 10 nguyên tắc dưới; chỗ lệch hiện tại: [AUDIT-0811.md](AUDIT-0811.md).

1. **Hướng ghép là chiến thuật:** ghép cùng loại → kết quả theo ô ĐÍCH (bản sao, dạng, chủ sở hữu cộng dồn).
2. **Ghép ra ụ ngẫu nhiên mới** = 1 ụ mới thật; đặc tính ngẫu nhiên quay lại.
3. **+★ / −★ tại chỗ và biến hình KHÔNG phải ghép:** không đặt lại, không chạy móc "khi ghép".
4. **Ngẫu nhiên khi xuất hiện** quay lại MỖI lần xuất hiện, kể cả bản sao.
5. **Copycat chép không phải ghép.**
6. **Hiệu ứng khi rời bàn** (Ember relay) chạy với MỌI đường rời bàn; KHÔNG chạy khi ụ bị hoá đá, đóng băng, biến hình hay hạ sao.
7. **Ụ đá / băng** không nhận debuff mới nhưng vẫn mất sao.
8. **Cộng dồn do hành động thuộc về ụ** (ụ mới = 0); cộng dồn theo điều kiện bàn dùng chung. Ngoại lệ đã chốt: **Ember + Ember ghép ra Ember = Ember MỚI 0 lửa** (người dùng 08/11, `game.js` ghep) — lửa A + C chỉ truyền cho Ember KHÁC cùng hàng/cột; Ember triệu hồi / ra từ ghép khác vẫn lửa = ★.
9. **Tất định:** chỉ RNG có hạt giống; hiệu ứng hình không bao giờ đổi luật.
10. **Ụ Hỗ trợ không bao giờ bắn.**

**Đã áp (09/11):** nguyên tắc 1 cho cờ bản sao Copycat — hàm `giuBanSao(N, dich)` (`thap/js/game.js`), dùng ở La Bàn + La Bàn, hợp thể Prism (ô cuối);
Anvil + Anvil, Merge King + Merge King vốn giữ ụ đích.

**Phân biệt (người dùng 09/11):** *"cái cơ chế mà ụ loại A merge ụ loại A ra ụ loại A nó khác với ụ loại A + ụ loại A ra ụ ngẫu nhiên, dù ngẫu nhiên ra ụ loại A
cũng không thể coi đó là cùng 1 ụ"*. Nguyên tắc 1 CHỈ áp cho ghép ĐẶC BIỆT cùng loại được thiết kế để ụ đích đi tiếp (La Bàn hợp hướng, hợp thể Prism,
Anvil + Anvil cùng dạng, Merge King + Merge King tại chỗ). GHÉP THƯỜNG (X + X, Mimic, Wild Link) theo nguyên tắc 2: luôn ụ mới THẬT — kể cả khi bốc trúng
lại đúng loại X (Rồng Máy, Leviathan, Hộp, Evolver, Ember…): `banSao = false`, cộng dồn riêng ụ = số lúc sinh (riêng Ember + Ember → Ember: 0 lửa), không mang buff thân. Test: `tools/thap-kt-ban-sao-giu.js` (cả 2 chiều + online).
Trước khi đụng tới tương tác giữa các ụ: đọc file này + chạy test đó.

**Đã áp (09/11, đợt sửa AUDIT-0811):** Q1–Q9 đã chốt (bảng "Đã sửa" ở AUDIT-0811.md). Biến hình thành ụ KHÁC (cả Copycat) = ụ mới: buff thân mất (Q4 = B).
RNG luật có hạt `rngLuat` (`game.js`) cho mọi quyết định đổi bàn; `nhanSaoTuDong` cho +★ tự động. Test ma trận: `tools/thap-kt-nguyen-tac.js`.
