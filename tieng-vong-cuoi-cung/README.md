# The Last Echo – Tiếng Vọng Cuối Cùng

Metroidvania pixel 2D, chơi trên iPhone xoay ngang, chạy trên trình duyệt.

**Chơi:** https://tieng-vong-cuoi-cun.web.app/ (Firebase Hosting). Mỗi lần đẩy lên nhánh `tieng-vong-cuoi-cung`,
GitHub Actions (`.github/workflows/tvcc-firebase.yml`) tự kiểm thử rồi đưa bản mới lên. Không còn bản gói một file trên claude.ai.

## Thư mục

| Thư mục | Nội dung |
| --- | --- |
| `game/` | Mã game: `index.html` (màn chọn), `vung-1/` (Vùng 1 + trùm), `lang-chuong/` (Làng Chuông), `phong-demo/`, `cot-truyen/` (tranh mở đầu, hội thoại, teleport), `an/` (bí mật + nhật ký), `he-thong/` (Lattice/Charm), `thu-mat-na/` (động cơ nhân vật, quái, lớp sức mạnh), lưu máy/mây, đăng nhập |
| `art/` | Mọi ảnh trong game (ChatGPT vẽ; hoạt hình nhân vật có PixelLab). File `*nguon-chatgpt.png` là ảnh gốc để cắt lại khi cần; `art/kiem-khach-thiet-ke/` là thiết kế gốc nhân vật |
| `tools/` | Công cụ dựng và kiểm thử (Playwright, Python). `tools/vung-1/xem/` là ảnh chuẩn kiểm thử |
| `docs/` | Sổ tay `KINH-NGHIEM-CHUYEN-GIAO.md`, tư vấn ChatGPT, báo cáo từng mảng, yêu cầu ảnh (`yeu-cau-anh/`), bảng tên tiếng Anh |
| `firebase.json`, `firestore.rules` | Cấu hình Firebase Hosting + quy tắc Firestore |

## Kiểm thử nhanh

```
cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &
node tools/vung-1/kiem-tra-vung1.js        # đi P01 → P12
node tools/vung-1/kiem-thu-f.js            # rồi: git checkout -- tools/vung-1/xem
python3 game/vung-1/cong-cu-man/kiem-tra.py --khong-ve
```

Các bộ khác: `tools/suc-manh/`, `tools/firebase/`, `tools/cot-truyen/`, `tools/he-thong/`, `tools/an/`.
Báo cáo dọn dự án: `docs/don-du-an/BAO-CAO.md`.
