# PixelLab vẽ lại quái vùng 3 (Lâu đài Than Hồng) và vùng 4 (Đầm Sương) — 05/11/2026

> Bản đang làm: **vùng 3 đã xong và đã đẩy lên**; vùng 4 đang làm (báo cáo sẽ cập nhật khi xong).

## Tóm tắt cho chủ game

Mọi quái của **Lâu đài Than Hồng** (8 quái thường, 2 tinh anh, trùm nhỏ, trùm vùng 3 pha) đã được **PixelLab vẽ lại kiểu truyện cổ tích châu Âu**,
động tác dựng bằng khung xương PixelLab (mỗi con một nhân vật PixelLab, mọi động tác của con đó đi từ cùng một khung xương nên không lệch nhau).
**Chỉ đổi HÌNH**: luật chơi, chỉ số, hộp va chạm, thời điểm ra đòn, kỹ năng giữ nguyên. Không chơi thử bằng tay (chỉ chụp headless).

| Mã quái (giữ nguyên) | Trước | Nay (PixelLab) |
|---|---|---|
| `linhMa` | Lính Ma Giáp Gỉ | **Rusty Armour Ghost** — bộ giáp gỉ rỗng có hồn ma, cầm giáo |
| `doiThan` | Bầy Dơi Than | **Cinder Bat** — dơi than cánh màng cam |
| `tuongDa` | Tượng Đá Cầm Khiên | **Gargoyle Shieldbearer** — gargoyle đá cầm khiên tròn |
| `denLong` | Đèn Lồng Ma | **Will-o'-Wisp Lantern** — đèn lồng sắt có mặt ma trong kính |
| `meoDen` | Mèo Đen Hai Đuôi | **Witch's Black Cat** — mèo đen phù thuỷ hai đuôi, nơ đỏ (không chuông) |
| `huLua` | Hũ Lửa Sống | **Ember Kettle** — ấm đồng biết đi |
| `tieuYeu` | Tiểu Yêu Ném Pháo | **Bomb Imp** — tiểu quỷ đỏ cầm bom tròn |
| `nhimThan` | Nhím Than Hồng | **Ember Hedgehog** — nhím gai đầu than hồng |
| `tuongMa` (tinh anh) | Tướng Ma | **Haunted Knight Captain** — hiệp sĩ ma áo choàng đỏ |
| `huChua` (tinh anh) | Hũ Lửa Chúa | **Great Cauldron** — vạc phù thuỷ đội nắp vương miện |
| `hoLua` (trùm nhỏ) | Hổ Lửa | **Cinder Lion** — sư tử bờm than hồng (có hàng riêng: Vồ lửa, Gầm phun lửa, nổi giận pha 2) |
| `hoTinh` (trùm vùng) | Hồ Tinh chín đuôi đeo mặt nạ | **Vulpina the Fox Witch** — phù thuỷ cáo, mũ phù thuỷ, gậy cong, **một** đuôi lửa (hàng riêng cho cả 5 chiêu + chuyển pha 2, pha 3) |

**Hiệu ứng PixelLab** (thay ảnh ChatGPT cũ của các quái này, cùng cỡ khung / điểm neo / số khung / thời lượng như cũ): bom của Bomb Imp,
cầu lửa ma của Vulpina, lửa phun của Cinder Lion, vệt dầu của Great Cauldron, lá bùa của Bomb Imp, nổ lửa (ấm / vạc tự nổ), ngọn lửa bùng,
vệt cào, bụi lao, đập đất, vòng gai, tia sáng lấy đà (5 cái sau chỉ đổi khi quái vùng 3–4 ra đòn, quái vùng khác vẫn như cũ).

**Quay lui:** `?quaipl=0` → tất cả về hình và hiệu ứng cũ y như trước (cùng cờ với quái vùng 1–2). Hoặc revert commit.

Ảnh soát (thư mục `anh/`): `tran-3-quai.png` / `tran-3-quai-cu.png` (10 quái đứng, mới / cũ), `tran-3-ra-don-1[-cu].png` (đang ra đòn),
`tran-3-trum-nho[-cu].png`, `tran-3-trum-nho-chieu-1.png` (Cinder Lion vồ), `tran-3-trum[-cu].png`, `tran-3-trum-chieu-2.png` (Vulpina vồ nhảy).
GIF từng động tác (phóng ×3): `anh/gif-<tên>-<hàng>.gif` (vd `gif-vulpina-atk_c3.gif`).

## Cách làm (theo đúng quy trình pixellab-quai-nam)

1. Ảnh gốc hướng nam: `POST /create-image-pixen` (3–4 seed mỗi con, chọn một) → 8 hướng `generate-8-rotations-v3` → nhập nhân vật
   `create-character-v3` (khung xương `mannequin`; mèo, nhím: `cat`; sư tử: `lion`).
2. Động tác hướng south-east (game tự lật): `POST /characters/animations` chế độ `skeleton-v3`, mô tả thuần động tác.
   **Đèn lồng và ấm đồng** không có tay chân người — khung xương làm tay mọc ngang mặt / chân kéo dài → dùng chế độ **`v3`** (PixelLab vẽ lại
   từng khung từ mô tả, không khung xương) cho các hàng đó (ghi trong `docs/anh-goc/pixellab-quai-vung-3-4/chon.json`).
3. Soát từng khung phóng ×2 (bảng ghép mọi hàng) + soát tự động (mảnh rời, điểm ảnh mờ, màu lửa lạ). Hỏng thì chạy lại seed / mô tả khác;
   khung nhoè lẻ ở giữa hàng thì bỏ khung đó (`_bo` trong chon.json — chỉ bỏ, không vẽ / vá).
4. Ghép: `cong-cu/dung-quai-34.py` (chỉ cắt + đặt + ghép, một ô cắt chung mỗi con, neo = giữa chân ảnh đứng). Con vẽ ra to hơn hẳn con cũ
   (ấm, nhím, gargoyle, hiệp sĩ) dùng `net 3` để thân trong game gần cỡ cũ; còn lại `net 2`.
5. Tấm cũ → `<mã>-plcu` (`cong-cu/doi-cu.py`, mục `quai_cu_cua`, cơ chế của phiên vùng 1–2) — chỉ nạp khi `?quaipl=0`, không tính vào tải đầu.
6. `game/js/quai_pl_34.js` (mới, nạp sau `js/quai_pl.js`): hàng riêng từng chiêu / pha (`tele_c1`… `atk_c5`, `tele_chieu1`…, `idle_p2`,
   `tele_p2`, `idle_p3`, `tele_p3`) + đổi hiệu ứng. Không sửa `js/quai_pl.js`, `js/sprite_custom.js`, `game/build.py`.

## Kiểm (kết quả thật, vùng 3)

- `bash tools/phat-hanh/cong_kiem.sh`: **ĐẠT** (cú pháp JS, lưu mây, 6 bản lưu mẫu, kiểm ảnh 817 tệp, dựng dist, trần dung lượng,
  smoke test 14 bước gồm `?cloud=0`, EN/VI).
- Dung lượng: bản một tệp **24,33 / 30 MB**, **web tải đầu 17,40 / 20 MB** (trước phiên này 19,9x MB: tấm cũ không còn tính vào tải đầu).
- Chụp headless 844×390 trên site đã gói (`cong-cu/chup34.py`, `?cloud=0`), cùng cảnh với `?quaipl=0`: **0 lỗi trang**.
- Không đụng: đăng nhập Google, lưu mây, `?cloud=0`, bản lưu, `master`, tệp Rowan / vũ khí, luật chơi.

## Việc còn lại / đề xuất

- Vùng 4 (đang làm).
- Lời thoại Vulpina vẫn nói "Nine tails of fire and a mask!" (chữ, ngoài phạm vi "chỉ hình") — đề xuất phiên chữ đổi cho khớp một đuôi + mũ phù thuỷ.
- Giữ nguyên ảnh cũ (lý do): `hu-tam-giac-bua` (tam giác ấn của Bomb Imp — ảnh khớp 3 đỉnh vùng trúng bằng số đo cố định trong
  `js/ky_nang_quai.js`, vẽ lại sẽ lệch vùng trúng), `hu-dan-lua` (đạn lửa chung của mọi quái bắn lửa), `hu-cot-lua` (cột lửa chung), vạch / vòng
  báo nguy hiểm đỏ (giao diện chung, giữ để dễ đọc), vệt lửa vẽ code khi Cinder Lion vồ (vẽ trong `js/boss.js`, không phải ảnh).
- Các tấm `-muotcu` / `-netcu` cũ (cờ `?anhmuotcu=1`, `?netcu=1`) vẫn trỏ về hình ChatGPT cũ khi bật các cờ đó.

## Chi phí PixelLab (vùng 3)

Khoảng 530 lượt (generations) cho vùng 3 (ảnh gốc 49, 8 hướng 48, ~125 động tác, 18 hiệu ứng). Số dư lúc bắt đầu 6.112,55; tài khoản dùng chung
với phiên Rowan và phiên vùng 1–2 nên số dư giảm nhiều hơn phần của phiên này.
