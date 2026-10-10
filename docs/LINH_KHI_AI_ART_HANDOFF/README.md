# LINH KHÍ — Gói bàn giao ảnh AI (đọc file này trước)

> **SỰ THẬT QUAN TRỌNG:** game Linh Khí **không dùng file ảnh**.
> - Toàn bộ em bé, quái, trùm, vũ khí, hiệu ứng và nền đều được **vẽ bằng code** (Canvas 2D) trên lớp thế giới 480×270.
> - Ảnh AI tạo ra trước hết là **concept hoặc ảnh tham chiếu**.
> - Muốn đưa ảnh vào game thì phải qua hậu kỳ pixel và tệp `.sprite.json`. Hiện chỉ làm được cho em bé (thân), quái và trùm (thân), vũ khí, trang phục và biểu tượng vật phẩm.

Thứ tự đọc:
1. `BAO-CAO.md`: tóm tắt, nên làm gì trước, cái gì chưa chắc.
2. `anh/contact/00_TONG_QUAN.png`, sau đó các contact sheet trong `anh/contact/`.
3. `ART_STYLE_GUIDE.md`: phong cách hiện tại và đề xuất.
4. `IMAGE_GENERATION_BRIEFS.md`: brief và prompt để dán vào công cụ AI.
5. `INTEGRATION_AND_QA.md`: cách đưa ảnh vào game và tiêu chí đạt / không đạt.
6. `ASSET_REFERENCE_INDEX.md`: mục lục từng ảnh.
7. `GAME_ASSET_MANIFEST.json`: dữ liệu máy đọc cho 96 asset.

Chụp lại ảnh khi code đổi (chạy từ thư mục gốc repo, không cần `playwright install`):
```
python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/chup_tham_chieu.py
python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/lam_contact_sheet.py
python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/tao_manifest.py
python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/tu_kiem.py
```
