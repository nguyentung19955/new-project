# Báo cáo: Zed cầm vũ khí lúc đứng / đi / chạy (13/10/2026)

Làm theo `YEU-CAU.md` cùng thư mục (chủ dự án chốt "2a"). **Mã commit: `0c83b261`** (nhánh `khoi-tao-du-an`).

## Đã làm
- **Cầm bằng TAY PHẢI** — tay phía sau thân, cũng là tay cầm vũ khí lúc chém, nên khi bắt đầu chém vũ khí không nhảy sang tay khác.
  - **Kiếm**: nắm ở tay phải, lưỡi chếch lên và chĩa ra trước (góc −15°, lúc đi/chạy đung đưa ±2–5°). Lưỡi đi sau thân rồi ló ra trước ngực. Lúc đầu tôi để dốc hơn (−30°) thì lưỡi trông như mọc ra sau đầu, che sát mặt, nên đã hạ xuống.
  - **Thương, búa**: tay phải nắm cán phía sau, tay trái nắm phía trước (trường `tay2`). Cán đi qua đúng hai nắm tay của từng khung. Có một khung chạy (khung 2) tay trái không với tới cán hợp lý: khung đó chỉ cầm tay phải, cán chúi xuống-ra sau theo góc trung bình của hàng chạy.
  - **Phi tiêu**: một chiếc nhỏ trong nắm tay phải.
- **Đi, chạy**: điểm cầm là nắm tay của khung đang vẽ. Góc được nội suy êm giữa hai khung liền nhau nên vũ khí không giật. Khung chạy nào tay phải khuất sau thân thì vũ khí vẽ sau người.
- **Lộn, trúng đòn, chết**: không vẽ vũ khí. Hết lộn thì vũ khí hiện lại ngay trên tay.
- **Chuyển giữa đứng/đi/chạy và đòn đánh**:
  - Vào đòn: góc vũ khí đi tiếp từ góc đang cầm, theo cách "vào thế" sẵn có.
  - Hết đòn: trong 0,18 giây đầu, góc đi dần từ góc cuối đòn về thế cầm.
  - Lúc nào cũng quay theo đường ngắn nhất, nên không lật 360°.
- **Cả 4 bộ trang phục** (ninja, Rừng, Biển, Lâu đài): các bộ khác lấy neo theo hàng ninja tương ứng như `dung_bo` đang làm, dùng `chinh_nam` bán kính 18. Danh sách `BO_KHAC` không sửa.
- **Chạy + chém** (commit 79e8d4d, 82e2409, ghép eo `zed_eo_data.js`): giữ nguyên, nửa trên vẫn lấy khung đòn. Mũi vũ khí dùng cho vệt chém và lướt chém cũng giữ như cũ: phần cầm vũ khí lúc đứng/đi/chạy không đụng vào.

## Cách tắt
- `?camvk=0`: đứng/đi/chạy tay không như trước.
- `?zedmoi=0`: vẫn về hình Zed cũ như trước.

## Tệp đã sửa / thêm
- `docs/anh-goc/zed/gan-vk/cam-vk.py` (mới): ghi điểm nắm tay phải/trái từng khung của 01-dung, 02-di, 03-chay-v4, rồi tính góc và ghi vào `neo.json`. Mỗi tổ hợp hàng × vũ khí là một mục `"<hàng>#<loại>"`, ví dụ `"02-di#thuong"`, theo định dạng `[x, y, góc, sau, [tay2]]`.
- `docs/anh-goc/zed/dung-zed-game.py`: dựng thêm 12 hàng `dung_/di_/chay_` × `kiem/thuong/bua/phitieu` trong tấm thân. Các hàng này dùng chung ảnh thân với đứng/đi/chạy, chỉ có neo và hàng nắm tay riêng. Đồng thời ghi ảnh soát. Các hàng cũ không đổi: ảnh xem trước cũ dựng lại vẫn giống hệt.
- `game/js/zed_moi.js`: đứng/đi/chạy chọn hàng cầm theo vũ khí đang mang, có nội suy góc và vào/ra thế êm.
- `game/js/data.js`: thêm `G.CAM_VK` và cờ `?camvk=0`.
- `game/art/custom/zed-*.sprite.json` và `game/dist/*`: dựng lại bằng script và `build.py`.

## Ảnh soát
- `xem-cam-vk.png`: bộ ninja, hàng đứng/đi/chạy × 4 vũ khí cấp 1, ghép như trong game (rộng 3890 điểm ảnh).
- `xem-cam-vk-rung.png`, `xem-cam-vk-bien.png`, `xem-cam-vk-lau.png`: cùng nội dung cho 3 bộ còn lại.

## Kiểm tra
- Theo luật, **không chạy test, không chạy game**. Chỉ chạy script dựng ảnh, `build.py`, xem ảnh soát tĩnh và `node --check` (`zed_moi.js`, `data.js`: đạt).
- Không đụng `master`, không force push, không mở PR, không chép apiKey, không sửa phần đăng nhập Google / lưu mây.

## Lưu ý
Ảnh chạy gốc vẽ tay phải lúc khuất lúc hiện, vị trí không đều. Ở các khung tay khuất (3, 4, 6, 7, 9, 10), điểm cầm là **ước lượng**. Những khung này vũ khí vẽ sau người nên phần lớn bị thân che. Nếu thấy trong game vũ khí nhích lệch ở vài khung chạy, chỉ cần sửa số trong `cam-vk.py`, rồi chạy lại `cam-vk.py` → `dung-zed-game.py` → `build.py`.
