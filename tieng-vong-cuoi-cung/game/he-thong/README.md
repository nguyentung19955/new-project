# game/he-thong – Hệ thống đồ / điểm / mở khoá (phiên "do")

| File | Việc |
|---|---|
| du-lieu.json | Số liệu: Âm Điểm, mốc cấp, độ hiếm, dòng phụ, Âm Phù, cây kỹ năng "Dây Ngân". BẢN NHÁP chờ ChatGPT chốt. |
| he-thong.js | Logic thuần (không vẽ): cộng điểm, lên cấp, mở nút, rơi đồ có độ hiếm + dòng phụ, cắm Âm Phù, tổng chỉ số. Chạy cả Node. |
| moc-vung-1.js | Móc vào Vùng 1. **Mặc định TẮT.** Bật thử: mở `game/vung-1/index.html?hethong=1` (thêm `&hethong_moi=1` để xoá tiến độ hệ thống). |

Luật hình: thứ gì cần hình mới (biểu tượng Âm Phù + khung độ hiếm, nhát thứ 5, vệt kiếm mới, dáng đứng mới) **tự tắt** cho tới khi ảnh ChatGPT/PixelLab có đúng đường dẫn trong du-lieu.json (`can_anh`, `anh`, `khung`). Không vẽ tạm bằng code.
Những gì chạy được ngay khi bật thử (dùng hình đã có): Âm Điểm khi hạ quái, lên cấp → Nốt Ngân, rèn kiếm Sơ Âm → Vang Âm → Cộng Hưởng (3 cấp kiếm đã có sẵn trong nhan-vat.json), +% Mảnh Âm, +khung bất tử.

API cho phiên "sucmanh" (lop-trang-bi.js): `MocHeThong.ht.trangBiDangDung()`, `MocHeThong.ht.capSucManh()`, `MocHeThong.ht.chiSo()`.

Kiểm thử: `node tools/he-thong/kiem-thu-logic.js` ; `(python3 -m http.server 8765 &) ; node tools/he-thong/kiem-thu-vung1.js`
