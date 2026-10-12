# Gói tham vấn: rút game Linh Khí về 1 nhân vật "Zed"

Game: Linh Khí (spiritblade.web.app), game hành động pixel 2D (HTML5 canvas, JS), chơi điện thoại ngang.
Chủ dự án muốn: chỉ còn **1 nhân vật tên Zed**, sửa gameplay theo 1 nhân vật, hệ thống animation cũng chỉ cần 1 nhân vật.
Nhờ ChatGPT đọc gói này rồi viết **yêu cầu cụ thể** để Claude làm.

## 1. Hiện trạng: 4 em bé

Định nghĩa ở `code/data.js` (G.HEROES, G.HKEYS):

| key | Tên | Máu | Mana | Tốc | Vũ khí hợp (+10% sát thương) | Nội tại | Nét riêng của chưởng | Mở khoá |
|---|---|---|---|---|---|---|---|---|
| smith | Cu Tí | 100 | 100 | 1,0 | kiếm, búa | Vũ khí nhận dấu ấn nhanh +20% | Chưởng đẩy lùi quái | Có sẵn |
| hunter | Cu Tèo | 75 | 90 | 1,15 | cung, giáo | +25% sát thương lên quái bị choáng/đóng băng/giữ chân/lộ điểm yếu | Chưởng xa +30%, nhanh +25% | Hạ Mộc Tinh |
| healer | Cái Bống | 85 | 130 | 1,0 | giáo, cung | Hiệu ứng kéo dài +30% | Chưởng trúng hồi 1,5% máu (tối đa 3 lần) | Hạ Ngư Tinh |
| wrestler | Cu Lì | 140 | 80 | 0,9 | búa, giáo | Giảm 25% sát thương nhận, phản 50% sát thương cận chiến | Chưởng gần (60%), to gấp rưỡi, +15% | Hạ Hồ Tinh |

Mỗi em bé có **cấp, kinh nghiệm, điểm kỹ năng, cây chưởng riêng** (`code/engine.js` dòng ~297–386: `save.heroes[key]`, `save.hero` = em bé đang chọn).

## 2. Những chỗ gameplay dựa vào việc có 4 em bé

- **Cứu em bé sau mỗi trùm** — `code/stage.js` ~dòng 501–510: hạ trùm vùng (Mộc Tinh / Ngư Tinh / Hồ Tinh) lần đầu thì mở em bé `reg.rescue`, em mới theo về ở cấp gần cấp em cao nhất. Đây là **phần thưởng chính của 3 trận trùm**.
- **Cốt truyện** — `code/truyen.js`: Cu Tí là nhân vật chính, đi cứu 3 bạn bị yêu tinh bắt; có lời thoại khi cứu, cảnh cả 4 bạn ngồi quanh Cụ Đồ, vũ khí khởi đầu riêng từng bé (dòng ~143–146).
- **Màn chọn em bé** — `code/village.js` ~dòng 602 trở đi (Ông Từ, tab "hero").
- **Nội tại trong chiến đấu** — `code/combat.js` dòng 113, 116, 117, 151, 170, 448, 636.
- **Nét riêng chưởng** — `code/chuong.js` dòng 33–39, 174.
- **Lực chiến** — `code/luc_chien.js` dòng 69–90.
- **Hành trang / bảng chỉ số** — `code/hanh_trang.js` dòng 81, 408.
- Lưu mây (Google) lưu toàn bộ `save.heroes` — người chơi cũ có thể đã luyện nhiều em bé.

## 3. Hiện trạng hình và animation

- Mỗi em bé có sprite khung 48×48: tấm thân gốc + tấm đòn đánh (`-don`), và cho 3 bộ đồ vùng (rung = Rừng Già, bien = Hang Biển, lau = Lâu Đài), mỗi bộ cũng có tấm đòn.
- **Cu Tí (smith) là em bé duy nhất có ĐỦ cả 8 tấm** (gốc + đòn, × gốc/Rừng/Biển/Lâu). Ảnh mẫu trong `anh/`.
- Cu Tèo thiếu tấm đòn bộ Rừng; Cái Bống thiếu cả tấm đòn 3 bộ (đang tạm tắt thân bộ).
- Mọi sửa animation gần đây (cầm kiếm, kiếm không che mặt, vệt chém, dáng chạy, nắm tay theo tấm) đều phải đo và chỉnh **riêng cho từng tấm của từng em bé** → tốn gấp ~4 lần công.

## 4. Đề xuất của Claude (để ChatGPT xem xét, sửa)

1. **Zed dùng hình Cu Tí**, chỉ đổi tên (nhanh nhất, đủ hình). Vẽ nhân vật mới thì phải gen lại ~8 tấm sprite.
2. **Thay phần thưởng "cứu em bé"** của 3 trùm bằng thứ khác: ví dụ mỗi trùm mở 1 nét riêng chưởng của em bé cũ (đẩy lùi / bay xa / hồi máu / chưởng to) hoặc 1 nội tại để Zed mạnh dần.
3. **Chỉ số Zed** = Cu Tí, cộng thêm phần nội tại của 3 bé kia mở dần theo trùm (ý 2).
4. **Save cũ**: Zed lấy cấp/kinh nghiệm/cây chưởng của em bé cấp cao nhất; vũ khí, đồ, vàng giữ nguyên.
5. **Bỏ màn chọn em bé**; tab Ông Từ thành "xem chỉ số Zed".
6. **Cốt truyện**: viết lại các đoạn "cứu bạn" (cần ý của chủ dự án / ChatGPT: Zed đi để làm gì?).
7. **Không xoá** hình 3 bé kia, chỉ tắt; có công tắc `?zed=0` quay về 4 em bé như cũ.
8. Lưu ý: tên "Zed" trùng tên một tướng trong Liên Minh Huyền Thoại, và lệch phong cách tên dân gian (Cu Tí, Cái Bống). Chỉ là chữ, đổi được bất cứ lúc nào.

## 5. Câu hỏi cần ChatGPT/chủ dự án chốt

1. Zed dùng hình Cu Tí hay thiết kế mới (nếu mới: mô tả ngoại hình)?
2. Trùm thưởng gì thay cho việc cứu em bé?
3. Zed có vũ khí hợp riêng không (Cu Tí đang hợp kiếm + búa), hay hợp mọi vũ khí?
4. Cốt truyện mới của Zed.
5. Có giữ tên Zed không.
6. Các hàng động tác cần giữ cho 1 nhân vật (đứng, đi, chạy, lộn, trúng đòn, chết, kiếm, cung, giáo, búa, chưởng) — có thêm/bớt gì?

## Nội dung gói
- `code/`: 12 tệp JS liên quan đến em bé (bản đang chạy trên web, nhánh khoi-tao-du-an, commit 229e263d).
- `anh/`: tấm đòn của 4 em bé (thân gốc) + 3 tấm thân bộ của Cu Tí + hàng chạy, hàng chém kiếm của Cu Tí.
