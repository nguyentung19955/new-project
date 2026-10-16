# Nút Đánh to lại, chống bấm nhầm (17/10)

Chủ game báo (17/10 02:07): "Sao lại cho nhỏ chỗ ấn bắn đánh thường vậy, tôi bị ấn nhầm mấy lần."
Nguyên nhân: Tư vấn 1 làm nút Đánh nhỏ bằng nút Né (~60 px), các nút khác xếp sát ngay trên.
Không đổi luật, số liệu, sát thương. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Đã làm (`js/stage.js`: `boCucTo`, `nutTai`)

| Nút | 844×390 | 667×375 | Ghi chú |
|---|---|---|---|
| **Đánh** | **84 px** | **78 px** | lớn nhất, bán kính ≥ 28 đơn vị (bằng nút cũ trước Tư vấn 1) |
| Né | 65 px | 62 px | bên trái Đánh |
| Đặc biệt / Chưởng | 50 px | 48 px | vòng cung phía trên Đánh |
| Bình máu | 39 px | 36 px | xa Đánh nhất |
| Khe mép tới mép (nhỏ nhất) | 14,9 px | 14,9 px | mọi cặp nút |

- **Vùng chạm Đánh** rộng hơn hình vẽ ~11 px mỗi phía; phần góc dưới phải (phía mép màn hình và phía đáy) tính là Đánh tới tận mép.
- Chạm vào chỗ hai vùng chạm chồng nhau: **ưu tiên Đánh** (~5 px). Chạm rõ ràng gần nút khác hơn thì ra nút đó.
- **Kéo ngón** từ Đánh sang nút khác: không bật nút kia (ngón giữ vai trò lúc chạm xuống).
- Không đè thanh máu, ô vũ khí, dải linh khí, ô bản đồ. Người mới (chỉ Đánh, Né, Bình máu) thì Bình máu nằm ngay trên Đánh, gọn.
- Máy tính (1280×720): cùng bố cục, nút to theo khung.

## Cài đặt "Cỡ nút" (Anh Mõ → Cài đặt → Âm thanh, pin, điều khiển)

Hàng mới **Cỡ nút: Nhỏ / Vừa / To** (mặc định Vừa = cỡ ở bảng trên). Nhỏ ×0,85 (Đánh 71 px ở 844×390), To ×1,15 (Đánh 96 px). Khe giữa nút vẫn ≥ 14 px ở mọi cỡ.
Lưu ở `save.coNut` (`'nho'` / `'to'`; Vừa thì không ghi), đi theo bản lưu cả trên máy lẫn trên mây. Có tiếng Anh (Button size / Small / Normal / Large).
Hàng này thay dòng chữ giải thích cũ dưới bảng (nút Tiết kiệm pin vẫn ghi "30 khung/giây").

## Cờ quay lui

| Cờ | Tác dụng |
|---|---|
| `?nutcu=1` | Bố cục cũ trước Tư vấn 1 (như trước, không đổi) |
| `?nuttv1=1` | Bố cục của Tư vấn 1 (Đánh = Né ~60 px) |

## Kiểm (không chơi tay: đặt bản lưu, chạm giả bằng CDP)

- `node --check` mọi `js/*.js`: đạt. `python3 build.py`, `python3 build.py --hai-tep`: đạt. `tests/smoke.py`: 0 lỗi.
- `tests/nut_danh_shots.py` (mới): **67/67 đạt** — cỡ, khe, không đè HUD ở 3 cỡ màn hình × người mới / đủ nút; chạm trượt 8 px trên / trên-trái nút Đánh ra Đánh; chạm sát mép phải và góc dưới phải ra Đánh; giữa khe Đánh–Né ra Đánh, sát Né ra Né; giữa Đặc biệt–Chưởng ra đúng nút gần hơn; kéo từ Đánh sang Né / Chưởng không bật nút; cỡ Nhỏ / To; Cài đặt lưu đúng; hai cờ quay lui.
- `tests/mo_dan_shots.py`: sửa mức cỡ / khe theo bố cục mới, **24/24 đạt**.

Ảnh (`anh/`; tệp `-vung-cham` tô vùng chạm: đỏ Đánh, xanh Né, vàng Đặc biệt, tím Chưởng, lục Bình máu, vòng trắng = hình nút):
`844x390-*`, `667x375-*`, `1280x720-*` (`nguoi-moi`, `du-nut`), `844x390-du-nut-co-nho/to`, `cai-dat-co-nut(-en).png`, `co-nutcu.png`, `co-nuttv1.png`.

## Còn để ý

- Ở 667×375, dòng nhắc chữ dưới đáy (ải hướng dẫn) chạm mép trái nút Né một chút (chỉ phần chữ, không chặn chạm) — giống bố cục cũ trước Tư vấn 1.
- Cỡ To: Bình máu không còn chỗ trên vòng cung nên tự lùi sang trái, phía trên Né.
