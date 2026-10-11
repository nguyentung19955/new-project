# Linh Khí — Rà soát sprite sheet nhân vật và hệ thống mũ/phụ kiện

11/10/2026 · Trả lời brief "Rà soát sprite sheet nhân vật và hệ thống trang bị". Ảnh được rà: tấm "Cu Tí · Bộ Rừng Già" ChatGPT vừa vẽ (lưới 8×7, nền hồng tím). Mã nguồn đã có sẵn trong repo nên phần kiến trúc **đối chiếu với code đang chạy**, không đề xuất trên giấy.

## 1. Executive summary

- Tấm sprite sheet vừa vẽ **không dùng được**: đồ không nhất quán giữa các khung (3 hàng mất mũ hoàn toàn), 2 khung vỡ hình, hàng 1 thừa khung, mũ sai kiểu so với món đồ đang có trong game. Nguyên nhân là prompt chỉ tả đồ bằng chữ và không ép "đủ đồ ở mọi khung". Đã sửa prompt (bắt gửi kèm ảnh 4 món đồ thật, ép đủ đồ mọi khung) — cần gen lại.
- Hệ thống trang bị **đã được chốt và đã chạy trong game** theo mô hình lai: **áo = thân nguyên bộ** (phương án 3, chỉ cho áo), **mũ / đồ lưng / cánh / bùa / vũ khí = lớp rời ghép bằng điểm neo theo từng khung** (phương án 2). Không cần thiết kế lại; việc còn lại là nhập asset và tinh chỉnh số đo.
- POC mà brief yêu cầu **đã làm xong ở Đợt 3** (Cu Tí + mũ + đồ lưng + kiếm qua 7 hàng động tác, có ảnh lưới), lỗi còn lại (kiếm lệch 3 khung, mũ chưa có điểm neo) đang được **Đợt 5** xử lý. Không mở refactor nào thêm.

## 2. Đánh giá sprite sheet hiện tại (tấm Bộ Rừng Già)

| Hàng | Động tác (theo lưới chuẩn) | Số khung yêu cầu | Thấy trong ảnh | Kết luận |
|---|---|---|---|---|
| 1 | đứng thở | 6 | **7** khung, có mũ | thừa 1 khung — **lỗi chắc chắn** |
| 2 | chạy | 6 | 6 khung, **không mũ** | lỗi chắc chắn |
| 3 | lấy đà | 4 | 4 khung có mũ + **2 khung vỡ** (chỉ còn gùi và tay) | lỗi chắc chắn, thừa 2 ô rác |
| 4 | đánh | 6 | 6 khung, **không mũ** | lỗi chắc chắn |
| 5 | trúng đòn | 4 | 4 khung, **không mũ, không gùi** | lỗi chắc chắn |
| 6 | ngã | 8 | 8 khung; 2 khung đầu có mũ, 6 khung sau không | lỗi chắc chắn |
| 7 | lộn né | 6 | 8 khung lẫn lộn (2 có mũ, 2 cuộn tròn, 2 đứng, 2 cuộn) | lỗi chắc chắn |

Nhận xét khác:
- Hướng nhân vật: quay phải ở mọi khung — **đạt**.
- Cỡ và vị trí trong ô: thân chiếm ~70% ô, chân sát đáy — **đạt**; đầu to đều — đạt.
- Phong cách: viền tối một nét, 3 nấc bóng, màu phẳng — **đạt**, khớp 4 thân đang có.
- Đồ: gùi và áo vỏ cây gần đúng; **mũ** là mũ sừng kiểu Viking có cờ, khác "Mũ sừng gỗ" trong game (`tp-hats-mu_sung`: gỗ, hai sừng cong, không cờ) — lỗi chắc chắn (do prompt). Bùa nanh rắn hầu như không thấy — nghi vấn (có thể bị thân che).
- **Không xác minh được từ ảnh**: nền có trong suốt hay không (ảnh là hồng tím phẳng, công cụ sẽ tách), toạ độ cắt chính xác (công cụ dò lưới), pivot (công cụ đặt chân vào `goc` [24,45]), hitbox (hitbox trong game là số cố định, không phụ thuộc ảnh), timing (lấy từ `dong_tac` của tệp thân gốc: idle 1 s, move 0,6 s, tele 0,4 s, atk 0,4 s, hit 0,2 s, die 0,6 s, ne 0,4 s).
- **Dùng được ngay**: không có gì — vì luật của game là thân nguyên bộ phải có đồ ở mọi khung. Phải gen lại toàn tấm.

## 3. So sánh ba phương án (đối chiếu với code `hero_tinhlinh.js`, `sprite_custom.js`, `outfit.js`)

| Tiêu chí | PA1 · vẽ cố định trong thân | PA2 · tách lớp (thân / đầu / mũ / vũ khí) | PA3 · mỗi bộ một sprite trọn |
|---|---|---|---|
| Đổi ngoại hình ngay khi trang bị | có, nhưng mỗi tổ hợp phải có sẵn ảnh | có | có (theo bộ) |
| Công sức asset | 4 em bé × (13 mũ × 3 lưng × 4 cánh…) = **không khả thi** | 1 ảnh/món, dùng cho mọi em bé | 12 tấm (4 em bé × 3 bộ) |
| Độ phức tạp code | thấp | vừa: điểm neo theo khung, thứ tự lớp, ẩn khi lăn | thấp |
| Độ chính xác animation | tuyệt đối | mũ/lưng/bùa/cánh: tốt (điểm neo theo khung); **áo: kém** (đã thử, không ôm thân, che mặt) | tuyệt đối |
| Mở rộng khi thêm mũ | bùng nổ tổ hợp | tuyến tính (1 ảnh/mũ) | bùng nổ nếu mỗi mũ là 1 bộ |
| Hiệu năng/dung lượng | nặng | nhẹ (ảnh mũ 17×14) | 12 tấm ≈ 12 × 0,3 MB |

**Khuyến nghị (= quyết định Q1 đã duyệt, đã chạy):** PA3 cho **áo** (12 thân theo bộ: `em-be-<key>-<rung|bien|lau>`), PA2 cho **mũ, đồ lưng, cánh, bùa, vũ khí**. Lý do: áo là thứ duy nhất phải "ôm" theo dáng từng khung; các món còn lại bám một điểm (đỉnh đầu, lưng, gốc cánh, eo, tay) nên ghép lớp đủ chính xác và rẻ. Phụ kiện không ghép ổn giữa các tư thế (ví dụ mặt nạ) → đã **bỏ hẳn** (cosmetic, không giá trị chơi) thay vì cố ghép.

## 4. Kiến trúc được khuyến nghị (đang có trong repo)

| Việc | Ở đâu | Trạng thái |
|---|---|---|
| Đồ đang mặc | `save.outfit.wear[hat/robe/back/hand/wing]` (`outfit.js`) | có |
| Áo chọn thân bộ | `O.look` → `fx.bo_than`; `SC.boCua/SC.thanBo` tìm `em-be-<key>-<bo>`, lùi `em-be-<key>`, lùi thân code | có (Đợt 3) |
| Ẩn lớp rời cùng bộ khi dùng thân bộ | `SC.anBo` | có (Đợt 3) |
| Điểm neo trên thân theo khung | `ghep-<key>.sprite.json`: `diem` + `diem_theo["atk:3"]` | Cu Tí có; 3 em bé còn lại: Đợt 5 |
| Điểm neo trên món đồ | `trang_phuc.diem.dinh_dau / lung / goc_canh / eo / tay_truoc` | lưng, cánh, bùa: có; **13 mũ chưa có** → Đợt 5 |
| Quy tắc đặt | `DINH-DANG-GHEP.md` mục 4: 1 điểm chung → dời trùng; ≥ 2 điểm → trung bình + co 0,85–1,15, xoay ±20°; không điểm → cách cũ | có |
| Ẩn mũ/cánh khi lăn, xoay cả khối khi ngã | `lopDo` (`hero_tinhlinh.js`) | có |
| Hướng | mọi ảnh quay phải, game lật cả khối (thân + lớp) → điểm neo lật theo, không cần số riêng cho hướng trái | có |
| Thứ tự lớp | sau thân → thân → trước thân → trước tay cầm vũ khí (`lop`) | có |
| Cache | khung ghép xong cache theo (em bé, động tác, khung, bộ đồ, hướng); vẽ 1 `drawImage`/nhân vật | có (`KCACHE`) |
| Tải asset | mọi `.sprite.json` nhúng vào 1 tệp HTML (`build.py`); tách tải sau là Q5 | có / Q5 |

Hình dạng khác nhau (tóc dài, sừng, tai): giải quyết bằng **điểm neo riêng trên từng mũ** (`dinh_dau` nằm ở chỗ vành chạm đầu, không phải tâm ảnh) + `lop` (sừng: trước; khăn trùm: sau tóc không cần vì thân bộ đã vẽ tóc) + `cap[mã].theo` để chỉnh riêng một mũ trên một em bé nếu lệch.

## 5. Cấu trúc asset và quy tắc căn chỉnh

- Tên: `em-be-<key>` (thân gốc), `em-be-<key>-<bo>` (thân bộ), `tp-<ô>-<mã>` (món rời), `ghep-<key>` (số đo neo theo khung), `vk-<loại>-<dòng>[-<hệ>]` (vũ khí). `key` ∈ smith, hunter, healer, wrestler; `bo` ∈ rung, bien, lau.
- Lưới thân: 8 cột × 7 hàng ô 48×48 px game (ảnh 96×96 ở `net: 2`); hàng idle 6, move 6, tele 4, atk 6, hit 4, die 8, ne 6; chân ở `goc` [24,45]; thân 16×29.
- Mũ: ảnh rời, `diem.dinh_dau` = điểm giữa mép dưới vành (px game trên ảnh mũ); thân: `diem.dinh_dau` ở `idle:0` + `diem_theo` cho khung nào đầu dời/nghiêng.
- Khi vẽ mũ lên thân bộ: thân bộ đã vẽ sẵn mũ **cùng bộ** → ẩn mũ rời cùng bộ (`AN_BO`); mũ khác bộ vẫn ghép rời. Quyết định mở: nếu thấy hai mũ chồng xấu thì chuyển sang ẩn mọi mũ rời khi dùng thân bộ (câu 2 báo cáo Đợt 3).

## 6. Kế hoạch POC — đã làm, không cần làm lại

Đợt 3 (báo cáo `dot-3/bao-cao.md`, ảnh `dot-3/anh/ghep-cu-ti-8-hang.png`): Cu Tí + Mũ sừng gỗ + Gùi tre + Kiếm, 7 hàng động tác, đổi/tháo từng món thấy ngay, chỉ số không đổi (so bảng trước/sau), không tệp ghép → 0 điểm ảnh khác bản cũ. Kết quả: mũ và đồ lưng đạt; **kiếm lệch 3 khung** (lấy đà, đầu đòn, trúng đòn). Đợt 5 (đang chạy) bổ sung đúng phần brief đòi: 2 mũ hình khác hẳn (sừng gỗ vs tai cáo) có điểm neo, 4 vũ khí × 4 em bé, tệp ghép 3 em bé còn lại.

## 7. Tiêu chí nghiệm thu (dùng cho Đợt 5 và khi nhập 12 thân bộ)

- Đổi hướng trái/phải liên tục 20 lần khi đang chạy: mũ không lệch, không nháy.
- Chuyển động tác đứng→chạy→đánh→lăn→ngã→đứng: mũ đúng vị trí mọi khung (lệch ≤ 1 px game), lăn ẩn mũ/cánh, ngã xoay cùng thân.
- Đổi 13 mũ liên tiếp trong 5 giây: không rơi khung, cache không phình (đo `KCACHE.size` ≤ số tổ hợp đã vẽ).
- Tải lại game: ngoại hình đúng theo bản lưu.
- Không có tệp ghép / không có thân bộ: y hệt bản cũ (so ảnh = 0 khác).
- Hitbox, tầm đòn, thời điểm sát thương: số liệu `kiem.py` trước/sau giống nhau; bot ải 1 thắng.
- 12 thân bộ khi về: mỗi tấm qua checklist: đủ 6/6/4/6/4/8/6 khung, đồ đủ ở 100% khung, mặt không bị che, mũ đúng kiểu món đồ trong game.

## 8. Rủi ro, giới hạn, quyết định cần chốt

- **ChatGPT vẽ tấm 8×7 có đồ nhất quán là việc khó** (bằng chứng: tấm vừa rồi). Dự phòng: nếu 2 lần gen vẫn rụng đồ, chia nhỏ — gen từng hàng (1×6) có kèm ảnh hàng tương ứng của thân gốc, rồi công cụ ghép 7 hàng lại (cần thêm chế độ "ghép từng hàng" vào Tách Anh Hùng — ~1 giờ, chưa làm).
- Kiếm theo khung chỉ sửa được phần lớn, không tuyệt đối (3 kiểu chém dùng chung số) — chấp nhận hoặc vẽ lại hàng đánh (đã chọn 2b).
- Dung lượng: 12 thân bộ ≈ +3,5 MB (nét gấp đôi) — nằm trong trần 20 MB nếu tách tải sau (Q5).
- Quyết định mở: (1) mũ khác bộ trên thân bộ — chờ ảnh thật; (2) có làm chế độ "gen từng hàng" ngay không, hay thử gen lại 2 lần trước.
