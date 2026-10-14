# Báo cáo: bỏ hình và tên vũ khí cũ còn sót (14/10)

Làm theo `YEU-CAU.md` cùng thư mục, gồm cả phần bổ sung lúc 17:41 (làng cũ, nhân vật cũ, xoá ảnh cũ). Nhánh `khoi-tao-du-an`.

Theo yêu cầu, **không chạy bài kiểm tra nào** và không mở game. Những gì đã chạy:

- xử lý ảnh bằng Pillow;
- hai ảnh soát tĩnh;
- `node --check` cho mọi tệp JS đã sửa (đều qua);
- `python3 build.py` (bản một tệp) và `python3 build.py --hai-tep` (bản web).

Không đổi luật hay số cân bằng nào. Đăng nhập Google, lưu mây, `?cloud=0` và `apiKey` không bị đụng tới.

## Cờ xem lại kiểu cũ

Thêm `?vkcu=1`, đặt `G.VK_CU = true` (khai báo trong `js/data.js`). Mặc định là tắt: không còn chỗ nào vẽ hình cũ. Khi bật, mọi chỗ dưới đây vẽ lại y như trước.

Các công cụ trong `tools/` cần em bé hoặc người làng vẽ bằng code để so sánh (Xưởng Sprite, tách đồ) thì mở kèm `?vkcu=1`.

## Đã làm theo từng mục

**1. Làng: bỏ 2 vũ khí "sống" bay cạnh nhân vật** (`js/village_scene.js`)
- Không còn vẽ (`drawWeapon` chỉ chạy khi có `?vkcu=1`) và không còn chạm vào được.
- Xem vũ khí nay ở Ông Thợ Rèn, thẻ Linh khí, nút "Xem linh khí". Câu hướng dẫn và README đã sửa theo.

**2. Phi Thương** (`js/fx_he.js` `drawSpear`)
- Cây thương bay, cắm, quay về nay vẽ bằng ô `zed-vk` loại `thuong`, đúng cấp và màu hệ của cây đã ném. Ô lấy qua hàm mới `G.vkMoi.anhO(w)` trong `js/vk_moi.js`.
- Thương xoay theo hướng bay, mũi nằm đúng chỗ đang bay. Cỡ bằng thương trên tay Zed (hệ số `vk_tl` 0,35249, cấp Trắng dài khoảng 40 điểm game).
- Lúc cắm thì rung, lúc bay về thì xoay vòng, như trước.
- Ảnh chưa tải xong thì không vẽ gì. Giáo tre cũ (`G.weaponArt`) chỉ còn khi có `?vkcu=1`.

**3. Nút Đánh / Đặc biệt**
- Dựng lại 6 ảnh `gd-nut-danh-*` và `gd-nut-dac-biet-*` cho sword, spear, hammer bằng `dung-nut-vk.py`. Phong cách giống hai nút `-bow`: 48×48, nền trong, viền tối 1 điểm, ô `zed-vk` cấp Trắng đặt chéo, mũi chĩa lên phải.
- Nút Đặc biệt thêm nét hiệu ứng lấy từ ảnh có sẵn:
  - kiếm: vệt chém cong, `hu-chem-kiem` khung 2;
  - thương: vệt phóng thẳng, `hu-dam-giao` khung 2, xoay chéo;
  - búa: sóng đất và đá, `hu-nen-dat` khung 2.
- Ảnh soát tĩnh **`xem-nut-vk.png`**: hàng trên là Đánh, hàng dưới là Đặc biệt; các cột lần lượt là kiếm, thương, búa và phi tiêu (`-bow` có sẵn để so). Dưới cùng là cỡ thật 24 điểm.
- Hình dự phòng khi thiếu ảnh nút (`js/btn_art.js` `iconBuf`): không còn dùng `ICON.w_*`/`ICON.s_*` vẽ bằng code. Nay dùng ô `zed-vk` cấp Trắng đặt chéo. `zed-vk` chưa về thì nút để trống, về rồi thì nút tự dựng lại (khoá bộ nhớ đệm `gdTag` có thêm dấu). `ICON.w_*`/`s_*` chỉ còn khi có `?vkcu=1`.

**4. Icon vũ khí lúc chờ tải** (`js/vk_moi.js`)
- `G.art.weaponIcon` không còn rơi về `A.weaponIcon`/`WA.icon` cũ. `zed-vk` chưa xong thì không vẽ gì.
- `zed-vk` vốn đã nằm trong nhóm ảnh lõi tải trước màn chào (`bat_buoc`). Thêm gọi `layVk()` ngay khi tệp chạy để xin ảnh sớm.
- Phi tiêu bay (`js/zed_moi.js`): `zed-vk` chưa về thì cũng không vẽ mũi tên cũ.

**5. Tên và chữ cũ**
- Đổi "Giáo" thành "Thương" ở `G.WTYPES.spear.name` (`data.js`), `weapon_art.js TYPE_NAMES`, sở trường của Cái Bống ("thương +10%"), lời nhắc vũ khí (`moves.js`), trang "Chiêu Đặc biệt" ở Cụ Đồ và README.
- Đổi "Cung … Mưa Tên" thành "Phi tiêu … Mưa phi tiêu":
  - `G.WTYPES.bow` (tên đặt ngay trong bảng);
  - `MOVE_TIPS.bow`;
  - trang "Chiêu Đặc biệt";
  - sở trường của Cu Tèo ("phi tiêu +10%");
  - lời chỉ dẫn tinh anh ở ải đầu ("đổi sang phi tiêu").
- Câu "đổi giữa hai vũ khí" đổi thành "đổi sang vũ khí kế tiếp (xoay vòng 4 món)".
- Bậc màu cũ `G.RARITY` (Thường/Lam/Tím/Vàng) nay theo **bậc ép đồ** `G.EP_DO`. Thêm `G.bacMauVk(w)`, `G.bacTenVk(w)`, `G.oBacVk(...)` trong `js/ep_do.js`. Đã thay ở:
  - `stage.js weaponLine`: ô bằng `G.oBacVk`, tên màu theo bậc ép;
  - thẻ vũ khí ở màn kết quả: nhãn "bậc Trắng/…/Rực lửa", màu tên;
  - ô vũ khí trong trận: khung luôn `gd-o-vk-0`, viền màu bậc ép đồ do `E.vien` vẽ, kể cả bậc Trắng;
  - `hanh_trang.js` dòng "Vũ khí đang mang";
  - `village.js`: màn Xem vũ khí (ô, màu tên) và danh sách mài ở lò rèn; bỏ "Cần bậc Lam";
  - `linhkhi.js`: "(tối đa bậc Thường)" đổi thành "(tối đa)";
  - hai câu gợi ý trong `G.HINTS` nói về bốn bậc màu: viết lại theo bảy bậc ép đồ.
- Bỏ câu "xem ở Bà Hàng Xén" ở màn kết quả, cả màn thắng lẫn màn thua.
- Tiếng Anh:
  - Xoá 47 dòng không còn dùng: tên dòng vũ khí cũ (Cung Rồng Rắn, Cung Đàn Bầu, Ná Thun, Phi Tiêu …, Giáo Đồng Đông Sơn, Kiếm Lá Lúa, Búa Đầu Trâu…), "Cung", "Giáo", "Mưa Tên", và các câu cũ đã đổi.
  - Thêm 14 bản dịch cho các câu mới và sửa 1 câu đã có.
  - Sửa ở cả `js/ngon_ngu_en.js` lẫn nguồn `tools/ngon-ngu/tu-dien/*.json`: xoá đúng các dòng đó, thêm các dòng mới vào `zed.json`.
  - Lưu ý: ngay trên HEAD trước phiên này, `ngon_ngu_en.js` đã lệch với kết quả `gop.py` (khoảng 110 dòng mỗi chiều). Vì vậy tôi **không** chạy lại `gop.py`, chỉ sửa tay đúng các dòng liên quan ở cả hai nơi.

**6, 8. Đồng hành và nhân vật ở mọi màn**
- Chuỗi `G.art.hero` (`js/zed_moi.js`, lớp ngoài cùng):
  - Zed chưa vẽ được bằng ảnh `zed-*` thì **không vẽ gì**, không rơi về em bé code `hero_tinhlinh` hay `A.heroOld`.
  - Bạn nhỏ chưa có ảnh `em-be-*` cũng không vẽ gì. Lớp `em-be` trong `js/sprite_custom.js` cũng chặn như vậy.
  - Chỗ này áp dụng cho mọi màn: làng, sân đình, màn chào, bản đồ vùng, Ông Từ, Hành trang, trong ải (kể cả bóng mờ, bóng lộn, phân thân) và truyện.
- Vì thế ở truyện, bạn nhỏ chưa có ảnh không còn hiện thành em bé code cầm vũ khí cũ. Bạn đã có ảnh thì vẫn không được đưa vũ khí (`truyen.js`, như cũ).
- `weapon_art.js` vẫn giữ trong mã cho đồng hành/NPC truyện như yêu cầu nói, nhưng mặc định không còn đường nào vẽ nó ra màn hình.
- Ô đỏ dự phòng khi vẽ em bé lỗi ở làng cũng bỏ.

**7. Làng cũ** (`js/village_scene.js`)
- Nhà, cây, đạo cụ, đò, khung cửi, lửa lò, gà, cóc chưa có ảnh `gd-lang-*`/`hu-lang-*`: không vẽ hình code. Đèn lồng rời đi kèm vật vẽ code cũng thôi.
- Nền:
  - Chờ `gd-lang-nen` thì chỉ một màu cỏ phẳng, không vẽ nền code. Lúc có ảnh, lớp code bên dưới cũng không vẽ nữa.
  - `gd-lang-nen` được đưa ra khỏi `HINH_LON_SAU` trong `build.py` để về cùng ảnh lõi.
- Người làng chưa có ảnh `nl-*`: không vẽ người code, cả bóng chân lẫn ô mặt ở dải lối tắt. `VS.npcCode` vẫn còn cho công cụ.
- Bỏ khóm sậy và áo phơi vẽ code. Ảnh `gd-lang-day-phoi` chỉ có cọc và dây nên dây phơi nay để trống.
- Còn giữ: hiệu ứng môi trường không phải hình cũ (vệt nước trôi, gợn cá đớp, lấp lánh, quầng đèn, khói lò, lá đa rụng, đom đóm). Đây là chuyển động phủ lên ảnh mới, không phải nhà, người hay vật kiểu cũ.
- Ảnh soát tĩnh **`xem-lang-moi.png`** (dựng bằng `dung-xem-lang.py`) ghép từ ảnh những gì còn lại trong làng:
  - nền, 6 công trình, các đạo cụ, gà;
  - 7 người làng, 3 bạn ngồi ở sân đình;
  - Zed cầm kiếm `zed-vk`.
  - Vị trí lấy theo toạ độ trong mã nên có thể lệch vài điểm so với game.

**9. Xoá ảnh cũ không còn dùng**

Ô vũ khí và ô đồ nay chỉ dùng khung bậc 0 (`B.slot` và `T.slot` luôn bậc 0 khi không có `?vkcu=1`), nên các khung theo bậc màu cũ không còn chỗ gọi. Đã xoá khỏi repo và khỏi bản build (git vẫn giữ lịch sử):

| Tệp | Dung lượng |
| --- | ---: |
| gd-o-vk-1.sprite.json | 2 424 B |
| gd-o-vk-2.sprite.json | 2 265 B |
| gd-o-vk-3.sprite.json | 2 410 B |
| gd-o-do-1.sprite.json | 1 934 B |
| gd-o-do-2.sprite.json | 1 923 B |
| gd-o-do-3.sprite.json | 1 956 B |
| gd-o-do-1-chon.sprite.json | 2 067 B |
| gd-o-do-2-chon.sprite.json | 2 052 B |
| gd-o-do-3-chon.sprite.json | 1 969 B |
| **Tổng giảm** | **19 000 B (≈ 18,6 KB)** |

- `B.MA_THAN` và `T.MA_KHUNG` đã bỏ các mã này.
- Không còn tệp ảnh vũ khí, nhân vật hay làng cũ nào khác: `vk-*`, `tp-*`, `ghep-*`, `em-be-smith*` đã xoá từ đợt 2. Mọi tấm `gd-lang-*`, `nl-*`, `em-be-*`, `zed-*` đều đang dùng.
- Không xoá quái, trùm, hiệu ứng hay giao diện đang dùng.
- 6 ảnh nút dựng lại tăng tổng cộng khoảng 5,6 KB (11,4 KB lên 17,1 KB).

## Số đo bản build

- `python3 build.py`: `dist/linh-khi.html` 21,22 MB / trần 30 MB, 461 hình (trước đây 470).
- `python3 build.py --hai-tep`:
  - trang chính nén 0,87 / 1,50 MB;
  - **ảnh trên máy chủ 25,67 / 26 MB** (PNG 13,82 MB + WebP 11,85 MB).
  - Bản này không lưu trong repo (`.gitignore`), workflow tự dựng lúc đăng.
  - Lưu ý: chỉ còn khoảng 0,33 MB tới trần ảnh máy chủ.

## Còn để ý / chưa làm

- Chưa xem trong game thật vì phiên này không được chạy game hay bài kiểm tra. Các chỗ nên xem bằng mắt khi chủ dự án mở game:
  - nút Đánh / Đặc biệt mới (cỡ thật);
  - Phi Thương bay, cắm, quay về;
  - viền bậc ép đồ ở ô vũ khí trong trận;
  - làng lúc ảnh đang tải (nền một màu, chưa có người hay nhà).
- Các bài kiểm tra cũ có so ảnh hoặc đếm số mã có thể lệch vì số hình đổi từ 470 xuống 461 và tên "Giáo"/"Cung" đã đổi. Ví dụ `docs/review/giao-dien-c4|c5/kiem.py` gỡ `gd-o-vk-3`, `gd-o-do-3`. Chưa sửa vì không được chạy bài kiểm tra.
- `G.HINTS` còn vài câu về dấu ấn của hệ thống cũ (đủ 60 dấu ấn thì khoá nhánh…). Câu đó không thuộc tên hay hình vũ khí nên để nguyên.
