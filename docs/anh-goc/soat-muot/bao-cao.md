# Soát mượt — gắn ảnh gen P1, P2, P3, P4, P6 vào game

Phiên này cắt 8 ảnh gen trong thư mục này và thay đúng **một hàng** trong tấm sprite của từng con. Không đổi luật chơi hay số liệu: thời gian ra đòn, vùng sát thương, máu, hồi chiêu giữ nguyên. Chỉ đổi hình và cách phát khung.

Ảnh soát tĩnh: [`xem-truoc.png`](xem-truoc.png). Mỗi con có 2 dải: **CŨ** và **MỚI**. Mỗi dải gồm khung "vào" (khung đứng ngay trước), các khung của hàng (có đánh số), rồi khung "về" (đứng thở). Đã cộng `can_tam` như trong game. Vạch đỏ là điểm neo, vạch xanh là đường đất. Không chơi thử bằng trình duyệt.

## 1. Đã làm

| Con | Hàng | Cũ → mới | Bảng phát | Vá tạm Phiên 1 đã tắt cho tấm mới |
|---|---|---|---|---|
| Cá Nóc Chúa (P1) | đánh | 6 → 6 khung | lặp lăn `lap_tu 3, lap_den 4` (khung 4–5 có vệt xoáy) | `xi_vao` (xì hơi trước khi đánh) |
| Nhím Biển (P2) | đánh | 6 → 6 | `khung [0,1,2,3]`, lặp 2–3, **`ve [4,5]`** | `xi_ve` (thu gai bằng hàng báo đòn phát ngược) |
| Nhím Gai Độc (P2) | đánh | 6 → 6 | `khung [1,2,3]` (bỏ khung 1 dáng đứng), lặp 2–3, `ve [4,5]` | `xi_vao` |
| Nhím Than (P2, thêm) | đánh | 6 → 6 | `khung [0,1,2,3]`, lặp 2–3, `ve [4,5]` | `xi_vao` |
| Heo Nanh Dài (P3) | trúng đòn | 4 → 4 | như cũ | (không có vá) |
| Hổ Lửa pha 2 (P4) | trúng đòn | 4 → 4 | như cũ | `khung_trang` (khung 2 trắng) |
| Nấm Chúa pha 2 (P4) | trúng đòn | 4 → 4 | như cũ | `khung_trang` (khung 3 trắng) |
| Hồ Tinh pha 1 (P6) | đánh | **3 → 6** | như cũ (trùm, nhịp đều) | (không có vá) |

Ghi chú:

- **Nhím Than**: ảnh `P2-nhimThan-…` về sau (commit `aac63d22`), làm thêm theo cùng cách với hai con Nhím kia.
- **`ve` (mục mới trong hàng đánh)**: là các cột "duỗi về dáng đứng". Khi lượt đánh hết, game phát 2 khung này trong 0,15 giây rồi mới về đứng, thay cho vá "thu gai" (hàng báo đòn phát ngược).
  - Không dùng cờ `?xihoi`. Cờ `?dondu=0` thì tắt luôn đoạn này.
  - Phần chính của hàng đánh dùng bảng `khung` (cần `G.KHUNG_TRUNG`, mặc định đang bật), nên 2 khung duỗi không bị phát giữa lượt.
- **Nhím Gai Độc**: khung 1 của ảnh gen vẫn là dáng đứng, trong khi hàng báo đòn đã cuộn tròn. Vì vậy bảng phát bỏ khung 1 để vào thẳng khung cuộn.
- **Nhím Than**: hàng báo đòn kết thúc ở dáng đứng, nên giữ khung 1.

## 2. Cách làm (công cụ cũ)

1. **Cắt** bằng `docs/anh-goc/zed/cat-diem-anh.py` (cùng công cụ đã tạo các `*-cat/` cạnh ảnh cũ). Kết quả ở `<ảnh>-cat/<hàng>/khung-NN.png` và `bao-cao.json`.
   - Cắt tự động đạt cho Nhím Biển, Heo Nanh, Nấm Chúa p2.
   - Các ảnh còn lại dùng cắt tay `<ảnh>-tay.json`, cắt ở khe trống giữa hai hình. Lý do: mảnh rời nhỏ (bụi, tia lửa) làm máy đếm sai số khung, hoặc hai hình chạm nhau.
   - **Hồ Tinh**: quả cầu lửa ở khung 3 bay sang ô khung 4. Đã tô nền lên quả cầu trong ô khung 4 (`P6-…-sua.png`, vùng x 1028–1172, y < 405). Khung 3 còn lại đốm lửa ở lòng bàn tay. Quả cầu bay là đạn do code vẽ, nên bỏ khỏi hình.
   - Đã xoá `debug.png` và GIF trong `*-cat/`, theo đợt dọn tệp `95dbbf0b`.
2. **Thay hàng** bằng [`cong-cu/thay-hang.py`](cong-cu/thay-hang.py). Script dùng lại các hàm của phiên quai-moi-4-con / quai-moi-6-con: `do`, `mat_na`, `thu` (LANCZOS, alpha 0/255) và SIFT `ti_le`. Các bước:
   - **Cỡ**: một hệ số cho cả hàng, so khung tham chiếu cùng dáng. Hệ số = trung bình nhân của SIFT và căn bậc hai diện tích thân. Khung tham chiếu:
     - Cá Nóc Chúa: khung đánh 1 so với khung báo đòn 6 (phồng hết cỡ).
     - Nhím: khung duỗi 5–6 so với hàng đứng.
     - Heo, trùm p2: khung 3–4 so với hàng đứng.
     - Hồ Tinh: khung 5–6 so với hàng đứng.
   - **Đặt khung**: tâm thân trên sàn đặt vào điểm neo, đáy thân đặt lên đường đất của tấm cũ. Cá Nóc Chúa là con bơi: cả hàng giữ đúng độ cao như trên ảnh gen, tâm khung 1 trùng tâm khung báo đòn 6. `can_tam` của hàng được đo lại.
   - **Giữ nguyên**: cỡ khung game, điểm neo `goc`, hướng nhìn sang phải, mọi hàng khác (từng điểm ảnh) và bảng màu cũ. Màu mới gán vào màu gần nhất của bảng cũ, thêm tối đa 16 màu riêng.
   - Số đo từng con ở [`cong-cu/so-do.json`](cong-cu/so-do.json).
3. **Ảnh soát** dựng bằng [`cong-cu/xem-truoc.py`](cong-cu/xem-truoc.py).

Chạy lại: `python3 cong-cu/thay-hang.py --ghi [--chi ma,...]`. Script luôn dựng lại từ tấm cũ `<mã>-muotcu`.

## 3. Cờ quay lui

**`?anhmuotcu=1`** (biến `G.ANH_MUOT_CU`): nạp tấm cũ của cả 8 con và tắt tấm mới. Khi đó các vá tạm Phiên 1 tự chạy lại như trước (`xi_vao`, `xi_ve`, `khung_trang`), vì tấm cũ không có mục `bo_va`.

Cách làm:

- Tấm cũ chép nguyên sang `game/art/custom/<mã>-muotcu.sprite.json`, có mục `"muot_cua": "<mã>"`. Tấm mới có mục `"muot"` và `"bo_va"`.
- `build.py`: tấm `-muotcu` không tính vào dung lượng người chơi tải (giống tấm `-cu` của `?quaicu=1`), và không nhúng vào bản một tệp (để bản đó giữ dưới trần 30 MB).
- **Cờ chỉ có ở bản web hai tệp.**
- Các cờ cũ vẫn chạy: `?quaicu=1`, `?khungtrang=1`, `?xihoi=0`, `?dondu=0`.

Tệp code đã sửa:

- `game/js/sprite_custom.js`: cờ, đổi tấm, đọc `bo_va`, `ve`, bỏ `KHUNG_TRANG` cho tấm có `bo_va`.
- `game/js/mobs.js`: `boVa`, `veAnh`.
- `game/build.py`: thêm khoá `muot_cua`, `muot`, `bo_va`; không tính / không nhúng `-muotcu`; số "không có WebP" thôi tính tấm cũ.

Không đụng phần đăng nhập Google, lưu mây hay `?cloud=0`.

## 4. Kiểm tra

- `node --check game/js/sprite_custom.js`, `game/js/mobs.js`: đạt.
- Thử `SC.add` trong Node, có và không có `?anhmuotcu=1`:
  - Bình thường: nạp tấm mới. Ví dụ Nhím có `boVa: ['xi_ve']`, `ve: [4,5]`, bảng phát 4 cột. Tấm `-muotcu` bị bỏ qua.
  - Có cờ: tấm mới bị bỏ, tấm cũ nạp dưới đúng mã, `boVa: null`.
- `python3 game/build.py`: bản một tệp 28,21 MB / trần 30 MB.
- `python3 game/build.py --hai-tep`:

| | Trước (HEAD trước phiên) | Sau |
|---|---|---|
| Ảnh người chơi tải | 14,48 MB | 14,60 MB (+0,12 MB) |
| **Người chơi tải** | 15,64 MB | **15,79 MB / trần 20 MB** |
| Không có WebP | 18,51 MB (có tính nhầm tấm cũ) | 18,03 MB (đã bỏ tấm cũ) |
| Tấm cũ chỉ tải khi bật cờ | 30 tấm, 0,56 MB | 38 tấm, 2,23 MB (không tính) |

Phần trang tăng 1,01 → 1,04 MB, chủ yếu do các phiên khác vào cùng lúc (Bước 2 A/B/C, gộp trước khi đẩy).

## 5. Chỗ ảnh chưa ổn (cần gen lại nếu muốn đẹp hơn)

1. **Cá Nóc Chúa khung 1–2**: khung game 97×111 chật, nên vương miện san hô bị cắt sát mép trên (khung 1 mất 110 điểm ảnh ở cỡ ×2). Khung 6 nhỏ hơn dáng đứng một chút, nên lúc về đứng vẫn nhích cỡ nhẹ. Khắc phục: gen lại với thân nhỏ hơn ~8%, hoặc nới khung lúc dựng tấm sau.
2. **Nhím Gai Độc khung 3–4**: gai bắn bay ra ngoài ô khung, bị cắt (156 và 86 điểm ảnh). Không đáng kể, vì gai bay là đạn code vẽ. Khung 1 của ảnh vẫn là dáng đứng thay vì cuộn (đã bỏ khỏi bảng phát). Khi gen lại nên yêu cầu khung 1 = quả cầu cuộn của hàng báo đòn.
3. **Nhím Biển**: cả 6 khung đều là quả cầu gai. Khung 5–6 "duỗi" chỉ khác khung đứng ở gai, nên chỗ nối thì tốt nhưng không thấy rõ động tác duỗi. Chấp nhận được.
4. **Nhím Than**: ảnh gen cho Nhím Than **cuộn tròn lăn** (khung 2–4), trong khi chiêu là "gai lửa trồi từ đất" và con quái đứng yên tại chỗ. Hàng cũ là dáng đứng phun lửa. Nên chủ game xem lại: nếu không hợp chiêu thì quay về bằng `?anhmuotcu=1`, rồi gen lại với prompt "đứng dựng gai, than bừng sáng".
5. **Hồ Tinh khung 3**: cắt bỏ quả cầu lửa vì chồng sang ô khung 4, nên chỉ còn lửa ở bàn tay. Nếu muốn khung "phóng" thật, gen lại với khoảng trống giữa các khung lớn hơn (≥ 1 khung).
6. **Hổ Lửa p2 khung 3–4**: còn vài đốm sáng vàng trắng, nhưng không còn khung trắng toàn thân. Đạt yêu cầu P4.

Chưa có ảnh: P5, P7, P8, P9.
