# Cách chạy công cụ (phiên su-kien-ai)

Chỉ đọc `game/`, không sửa, không mở trình duyệt.

```
node docs/review/ke-hoach-cai-thien/su-kien-ai/cong-cu/do-su-kien.js 100        # 100 lượt mỗi vùng, in tóm tắt, ghi cong-cu/ra/so-lieu.json
node docs/review/ke-hoach-cai-thien/su-kien-ai/cong-cu/do-su-kien.js 100 --json # in đủ JSON
python3 docs/review/ke-hoach-cai-thien/su-kien-ai/cong-cu/lay-anh-mau.py         # xuất ảnh mẫu ra su-kien-ai/mau/ (cần Pillow)
```

Hạt ngẫu nhiên cố định (20261015): chạy lại ra cùng số. Khi đã có `G.SU_KIEN` / `G.RUONG` (phiên A, B), thêm các mục đo ở bao-cao.md mục 7.4.
