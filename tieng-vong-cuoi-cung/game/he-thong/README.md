# game/he-thong – Hệ thống tiến triển / Charm / cây kỹ năng (phiên "do") – bản 2 theo tư vấn ChatGPT

| File | Việc |
|---|---|
| du-lieu.json | Số liệu theo docs/he-thong-do/tu-van-chatgpt.txt: Resonance XP, mốc cấp, The Resonance Lattice, Charm + độ hiếm + dòng phụ + trần, Echo Dust, ô Charm, tái rèn, VFX, mảnh giao diện. Mục "de_xuat" = phiên tự điền, chờ ChatGPT duyệt. |
| he-thong.js | Logic thuần (không vẽ): XP/cấp, mở nút theo cấp/điều kiện, chọn Charm đầu, rơi Charm có độ hiếm + dòng phụ, phân rã, cắm Charm, tái rèn, tổng chỉ số có trần. Chạy cả Node. |
| moc-vung-1.js | Móc vào Vùng 1. **Mặc định TẮT.** Bật thử: `game/vung-1/index.html?hethong=1` (thêm `&hethong_moi=1` để xoá tiến độ). |

Luật hình: Charm (rơi + túi + chọn Charm đầu) chỉ bật khi có đủ biểu tượng Charm + ô độ hiếm; Frostline Slash / Resonance Halo chỉ bật khi đủ mọi khung; Fifth Toll cần ảnh don5; khung giao diện dùng khi có. Không vẽ tạm bằng code.

API: `MocHeThong.ht.trangBiDangDung()`, `.capSucManh()`, `.chiSo()`, `.congDiem('bi_mat')`; `MocHeThong.congDiem(nguon)` (kèm thông báo lên cấp + Halo).

Kiểm thử: `node tools/he-thong/kiem-thu-logic.js` ; `(python3 -m http.server 8765 &) ; node tools/he-thong/kiem-thu-vung1.js`
