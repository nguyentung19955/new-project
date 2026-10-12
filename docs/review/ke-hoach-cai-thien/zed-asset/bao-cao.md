# Báo cáo: Zed ghép lớp (modular sprite) — 12/10/2026

Làm theo `YEU-CAU-2-MODULAR.md` (mục 12) + `YEU-CAU.md`. Nhánh `khoi-tao-du-an`.

> **CHƯA TEST GAME** (theo lời dặn): không Playwright, không mở trình duyệt, không chạy `game/tests`, không quay GIF game. Đã chạy: `node --check` mọi tệp `game/js/*.js` (qua), 2 lệnh build (đều xong), validator trên ảnh thật, và chạy thử phần logic của trang ghép + module game bằng node với đối tượng giả (không lỗi). **Chủ dự án tự kiểm.**
>
> **Trạng thái asset: CHƯA CÓ ASSET NÀO INTEGRATED** (cũng chưa có cái nào VALIDATED). Mọi ảnh hiện có là GENERATED. Điểm neo tay/đầu/lưng/vũ khí **chưa đo** (để trống, không bịa).

## ⚠ Một việc cần anh xác nhận: Zed nào?
Yêu cầu của phiên này ghi canonical = **Zed ninja** (`zed-canonical.png`, tóc đen, khăn đỏ, không sừng). Trong lúc làm, repo có commit mới hơn **"Chốt tấm thân Zed v2 (đứng/đi/chạy) làm canonical"** → **Zed v2** (`zed-v2-canonical.png`, tóc trắng, hai sừng, cởi trần). Em làm cho **cả hai** (mọi thứ dùng chung, chỉ prompt khác câu nhận diện) và **mặc định theo v2** vì là quyết định mới nhất. Anh chỉ cần nói "v2" hoặc "ninja".

## 1. Giữ lại gì, gen lại gì
| Asset | Kết quả kiểm (số đo thật) | Quyết định |
|---|---|---|
| `zed-v2-canonical.png` | **ĐẠT** kiểm tự động: không lưới, không chạm mép, cỡ đều (cao 234/229/217 điểm ảnh đứng/đi/chạy), 12 cảnh báo nhỏ (ô không đều, vài chấm xanh kẹt kẽ chân) | **Giữ**: chuẩn nhận diện + thân xem thử trên trang ghép |
| `zed-canonical.png` (ninja) | **LỖI**: hàng chạy 8/8 khung chạm mép phải ô (tóc mái có thể bị cắt); có kẻ lưới; ô không đều | **Giữ** làm tham chiếu, thân xem thử thứ hai |
| Cả hai canonical làm **thân production** | Quần áo, khăn, quấn tay, dép **vẽ liền** vào người → không tháo được áo mặc định khi mặc giáp; giáp hẹp không che được quần rộng | **Gen mới "thân trơn"** (prompt `01`): sửa từ chính canonical, giữ đầu/mặt/tóc/sừng/dáng, bỏ đồ. Bộ đồ mặc định thành lớp riêng (`02`, `03`) |
| `goc/*` bản thử cũ | — | Không dùng, không xoá |
| Ảnh Cu Tí đang chạy trong game | — | Giữ nguyên cho tới khi có lớp VALIDATED |
| Vũ khí `vk-*` (160 ảnh) | — | **Dùng lại** trong hệ ghép (chỉ cần góc + điểm tay đo trên thân mới) |

## 2. Tệp đã thêm / sửa
| Tệp | Nội dung |
|---|---|
| `docs/review/ke-hoach-cai-thien/zed-asset/LINH_KHI_MODULAR_SPRITE_SPEC.md` | Quy cách: các lớp + thứ tự vẽ, quy cách ảnh, số khung từng đòn khớp lúc gây sát thương, metadata, neo, quy tắc mũ/tóc/sừng, khe hở, đồ lưng trước/sau, vũ khí, ánh xạ cung → phi tiêu, validator, quy trình 11 bước, trạng thái |
| `docs/anh-goc/zed/prompt-v3/` | 32 prompt bản v2 + `ninja/` 32 prompt bản ninja (cùng bố cục) + `DANH-SACH.md` (thứ tự, tên lưu, lệnh kiểm) + `tao-ban-v2.py` |
| `docs/anh-goc/zed/kiem-sheet.py` | Validator (cạnh `xem-gif.py`) |
| `docs/anh-goc/zed/kiem/zed-v2-canonical/`, `kiem/zed-canonical/` | Kết quả chạy thật: `ket-qua.txt`, `tong-quan.jpg`, GIF 3 hàng, `sheet-game.png`, `do-dac.json` |
| `tools/tach-ghep-lop/` (`nguon.html`, `dong-goi.py`, `index.html`) | Trang Ghép Lớp (đăng tự động) |
| `game/js/ghep_lop.js` (mới), `game/index.html` (thêm 1 dòng nạp), `game/build.py` (nhúng `game/art/lop/*.lop.json`), `game/art/lop/README.md` | Module ghép lớp trong game, sau cờ tắt mặc định |
| `game/dist/*`, `tools/xuong-sprite/thu.html`, nhánh Pages `linh-khi/index.html` | Gói lại bằng 2 lệnh build |

Không đụng: `moves.js`, `combat.js`, bản lưu, `cloud*.js`, `firebase-config.js`, `?cloud=0`, ảnh cũ.

## 3. Trang xem thử
**https://spiritblade.web.app/tach-ghep-lop.html** (workflow tự đăng mọi `tools/tach-*/index.html`; có sau vài phút khi bản đăng chạy xong).

**Cách dùng trên iPhone:**
1. Mở trang: thấy Zed v2 đứng thở (thân xem thử nhúng sẵn). Ô **Thân** đổi sang Zed ninja.
2. Chọn động tác (dung / di / chay), ▶ / ⏸ phát–dừng, ◀ ▶ xem từng khung, **⇆ Lật** xem quay trái, thanh **Phóng to** / **Tốc độ**.
3. **Thêm ảnh**: mở mục "Thêm ảnh / tệp", chọn Slot (vd Áo / giáp thân), Kiểu (khung hoặc gan), gõ mã, số cột/hàng, tên động tác → chọn tệp. Nhận: `sheet-game.png` + `do-dac.json` (từ validator), tệp `.lop.json` đã xuất, hoặc **ảnh AI thô** nền xanh (trang tự tách nền và đưa về cỡ thân để xem nhanh).
4. **Bật/tắt lớp**: ô tích từng dòng; **đổi món**: hộp chọn từng dòng.
5. **Đo neo** (trên khung đang dừng): ô "Chế độ chạm" → "Đặt neo ĐẦU" rồi chạm lên đầu; tương tự LƯNG, TAY PHẢI, TAY TRÁI. **Vũ khí**: chọn "Đo VŨ KHÍ", chạm chuôi rồi chạm mũi (dùng ảnh "có vũ khí" 08/15/18/22 làm thân khi đo). "Chép neo khung trước" cho nhanh.
6. **Chỉnh lớp lệch**: chọn món ở danh sách (thành "món đang sửa"), chế độ "Kéo dời lớp" rồi kéo; "Áp dời cho cả hàng". Món gắn (mũ, cánh, vũ khí): chỉnh tỉ lệ, điểm gắn, vùng ẩn tóc ở mục "Món gắn đang sửa", hoặc kéo ở chế độ "Kéo dời món gắn".
7. **So sánh**: tích "Hiện thân trần bên cạnh".
8. **Xuất**: mục "Xuất số liệu JSON" → chọn trạng thái → "Xuất THÂN" / "Xuất LỚP" → bấm link tải `.lop.json` (hoặc chép chữ trong ô).
9. Nút "Thêm lớp **MẪU THỬ**": 3 hình vẽ bằng code (mũ, kiếm, cánh) chỉ để thử trang; **không xuất được, không vào game**.

**Trong game:** mở `spiritblade.web.app/?ghep=1`. Hiện chưa có tệp nào trong `game/art/lop/` nên **vẫn y như bây giờ**. Không có `?ghep=1` → game y hệt, kể cả khi đã có tệp.

## 4. Ảnh anh cần gen tiếp (theo thứ tự, chi tiết ở `prompt-v3/DANH-SACH.md`)
Vertical slice: **01** thân trơn → **02** đồ thân trên mặc định (khăn + quấn tay) → **03** quần + dép mặc định → **04** giáp tre → **05** nón lá (chừa lỗ sừng) → **06** cánh lá → **07** kiếm → **08** Zed cầm kiếm 3 nhát (để đo) → **09** như 08 đã xoá kiếm → **10, 11, 12** đồ mặc định + giáp tre cho 3 nhát kiếm.
Sau đó: 13 (lộn/trúng/gục/chưởng), 14–16 thương, 17–19 búa, 20–23 phi tiêu (+ đạn bay), 24–31 đồ thêm (giáp vai, găng, giày giáp, đai, áo Thầy Lang, gùi trước/sau, mũ giáp), mẫu 90 cho đồ × từng bộ đòn.
Mỗi ảnh: lưu vào `docs/anh-goc/zed/v3/NN-ten.png`, nhờ Claude chạy lệnh kiểm trong DANH-SACH.

## 5. Còn thiếu
- **Ảnh thật** cho mọi lớp (chưa có gì ngoài 2 canonical) → chưa VALIDATED, chưa INTEGRATED.
- **Neo đo thật** (đầu, lưng, tay, vũ khí từng khung) — làm trên trang ghép khi có thân trơn + ảnh "có vũ khí".
- Phi tiêu trong game: mới có ánh xạ đề xuất (SPEC 5.4); chưa đổi chữ cung → phi tiêu, chưa vẽ đạn phi tiêu ở `fx_dan.js`.
- Thân ghép trong game chưa có: chớp trắng khi trúng đòn, viền màu bậc áo, hào quang trang phục, nắm tay vẽ đè chuôi (`tay_nam`).
- Validator không phân biệt được tay cầm sai, vũ khí xuyên người, đồ trôi — phải xem theo checklist SPEC 9.3.
- Ảnh lớp nhúng thẳng vào trang chính game (chưa tách ra ảnh rời như ảnh cũ) — khi có nhiều lớp cần chuyển sang cách tải ảnh rời.
