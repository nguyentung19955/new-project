# BÁO CÁO – MƯỢT MỨC 2: THÊM KHUNG CHUYỂN TIẾP (02/11)

Người dùng đồng ý làm "mức 2" (vẽ thêm khung chuyển tiếp). Phiên này ghi yêu cầu ảnh + ảnh tham chiếu, phiên chính nhờ ChatGPT vẽ, phiên này kiểm và lắp vào game. Nguồn: `docs/duyet-anim-02-11/tu-van-chatgpt.md`.

## Kết quả ngắn gọn
- **16 clip đã mượt và đang chạy trong game** (7 Kiếm Khách + 9 clip của 5 quái hiện có), kiểm thử đều ĐẠT. (Thêm Bọ Vỏ Mộc chết đã lắp nhưng quái này sau đó bị xoá theo yêu cầu.)
- **Không còn clip nào chờ ảnh.**
- 6 lần ảnh bị trả "VẼ LẠI" vì nhòe/lệch phong cách hoặc lún-nảy; phiên chính vẽ lại; 3 bản đã lắp, 3 bản không cần nữa vì quái đã bị xoá (xem dưới).
- Giữ nguyên 100% thiết kế gốc: chỉ chèn khung mới hoặc thay khung lỗi; khung gốc giữ nguyên từng byte; màu khung mới được ép về đúng bảng màu gốc của nhân vật/quái.

## Kiếm Khách (đã lắp)
| Clip | Trước → sau | Việc | ms mới |
|---|---|---|---|
| Đòn 4 (nhát kết) | 9 → 11 khung | 2 khung giữa F4–F5–F6 (kiếm 1/3, 2/3 quỹ đạo) | 60,65,50,40,33,33,50,33,55,60,80 |
| Đập đất | 14 → 15 | 1 khung sắp chạm đất giữa F3–F4 | 55,55,45,45,33,45,45,45,50,55,55,55,55,70,80 |
| Chém xoay trên không | 7 → 9 | 2 khung xoay (giữa F2–F3 và F3–F4) | 50,50,45,33,45,33,50,65,70 |
| Chết | 7 → 8 | sửa F3 (khác F2) + 1 khung khuỵu gối | 50,67,67,67,83,100,100,200 |
| Lướt | 6 → 8 | 2 khung đứng dậy | 33,33,50,50,50,33,50,67 |
| Tiếp đất | 3 → 4 | 1 khung đứng dậy | 33,50,50,67 |
| Trúng đòn | 6 → 6 | vẽ lại F2 (ngực bật lùi) + F4 (hạ hông) | giữ 33,33,50,50,67,67 |

- Khung trúng/lao đã dời cho cả 3 cấp: đòn 4 `trung [6,7,8,9]`, `lao [2,8,20]`; chém xoay `trung [2..6]`; đập đất `trung [5..9]` (khung giữ khi lao vẫn là F3).
- Lớp sức mạnh (vết nứt mặt nạ 1–3, ấn chuông ngực) cho khung mới: dùng lại đúng ảnh lớp ChatGPT của khung gốc giống dáng nhất, dời theo điểm neo đo; khung nào mặt nạ bị che/không đo được thì ẩn lớp (trúng đòn F2 – chỉ 33 ms). `neo-kiem-khach.json` đo lại bằng `do-neo.py`.

## Quái (đã lắp)
| Quái – clip | Trước → sau | Việc | Sự kiện dời |
|---|---|---|---|
| Khuyết Cẩu – đánh | 9 → 9 | vẽ lại F3 (hạ cổ tích lực), F7 (giật lùi); ms ChatGPT | khung_ban giữ 4 |
| Khuyết Cẩu – chết | 9 → 10 | 1 khung gục giữa F5–F6 | – |
| Vọng Tàn – di | 9 → 9 | vẽ lại F0 (khung nối F8→F1); 9×117 ms | – |
| Vọng Tàn – đánh | 9 → 10 | 1 khung chuông giữa đường F4–F5 | khung_trung [6,7], chan_dong 6 |
| Hồn Vải – chết | 9 → 10 | 1 khung rơi lưng chừng F6–F7 | – |
| Kèn Câm – đánh | 9 → 10 | 1 khung nâng kèn F5–F6 | khung_ban 7 |
| Kèn Câm – chết | 9 → 10 | 1 khung khuỵu gối F5–F6 (vẽ lại 2 lần) | – |
| Màn Tang – chết | 9 → 11 | 2 khung đang rơi giữa F3–F4 | – |
| Màn Tang – vồ | 9 → 10 | 1 khung lao nửa đường F6–F7 | khung_trung [6,7,8,9] |
| Bọ Vỏ Mộc – chết | (đã lắp 9 khung mới) | – | quái này sau đó bị xoá |

## Không làm / bị huỷ
- **Bọ Vỏ Mộc, Dơi Rễ, Nấm Thở, Chuông Kén Nứt, Phu Đèn Lạc**: một phiên khác đã xoá hẳn 5 quái cũ này **theo yêu cầu người dùng** (commit "Xoá hết quái cũ theo yêu cầu…", kèm yêu cầu 007–012, 022, 025). Đây là xoá có chủ ý nên phiên này không khôi phục. Bọ Vỏ Mộc chết đã lắp trước đó cũng đi theo.
- Các mục P1 không cần vẽ khung (VFX thêm đệm, khoá tâm đạn, ms của trúng đòn quái…) nằm ngoài phạm vi "thêm khung" – chưa làm.
- Hồi máu Kiếm Khách (cần VFX riêng), nhảy đôi (cần dáng mới), Hồn Vải đánh ("cần thì vẽ lại") – chưa yêu cầu.

## Kiểm thử (sau lần lắp cuối)
- `tools/muot-2/kiem-phong-demo.js` (mới): phòng demo + Vùng 1 – không lỗi JS, không thiếu ảnh, ms/khung sự kiện khớp số khung: ĐẠT.
- `kiem-thu-f.js` 66/66 · `kiem-thu-g.js` hỏng 0 · `kiem-thu-h.js` hỏng 0 · `kiem-tra-vung1.js` đi hết P01→P12, không thiếu hình.
- `tools/suc-manh/kiem-thu-lop.js` TẤT CẢ ĐẠT · `kiem-anh-lop.py` 4 lớp TẤT CẢ ĐẠT.
- Mỗi clip có ảnh ghép trước/sau + GIF (để ngoài repo) – đã tự xem: không nhảy, không trượt chân; đáy chân khớp khung kề (dời tối đa ±4 px nguyên điểm ảnh).

## Công cụ (tools/muot-2/)
- `tao-yeu-cau.py` + `ds-*.py`: tạo file yêu cầu và ảnh tham chiếu [khung trước | ô viền đứt | khung sau] ×3, nền #FF00FF.
- `lap-clip.py <tên>`: kiểm cỡ/mép, ép bảng màu gốc, căn đáy, đánh số lại fNN, sửa ms/sự kiện (giữ kiểu JSON), lớp sức mạnh, ảnh trước/sau. `--thu` = chỉ kiểm.
- `danh-dau.py`: đổi trạng thái yêu cầu. `ghi_json.py`: ghi JSON giữ nguyên trình bày gốc.

## Bài học
- Ảnh ChatGPT thu nhỏ bằng nội suy → sau khi ép bảng màu thành lấm tấm. Prompt cần "same 1-pixel dark outline, flat crisp shading, no blur, no noise" và thu NEAREST đúng bội số điểm ảnh. Quái nhỏ (76–112 px) dễ hỏng nhất; Kiếm Khách đạt ngay lần đầu.
- Khung chuyển tiếp không được thấp hơn cả hai khung kề (Kèn Câm chết lần 1 bị lún-nảy).
