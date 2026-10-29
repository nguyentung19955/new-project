# P0-C · LAM MỚI – bản tích hợp riêng (29/10/2026, PH14)

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-14-LAM-MOI-MOC-VET-CONG.md` ("Gửi Claude", mục 7 bước 4): **duyệt Lam mới cho một bản
tích hợp P0 RIÊNG, chưa thay mặc định**. Trang này = **P0-C đầy đủ** (tinh anh Chuông Gỗ Gác Lớn, né / lướt xuyên, chết / hồi sinh, Ấn Rèn I, đe rèn, Âm Đao cấp 3,
Dư Âm) nhưng Lam vẽ bằng **Lam mới** (máy hình + sheet + vệt gen + móc tường của `game/thu-lam-moi-2/`).
**P0-C (`thu-p0c/`) và P0-B (`thu-p0b/`) GIỮ Lam cũ** để so người chơi. **Chưa thử iPhone thật.**

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0c-lam-moi/index.html

| Thêm vào link | Tác dụng |
|---|---|
| `?lam=cu` | Lam CŨ ngay trong trang này (hoặc ⚙ → "Lam: cũ") |
| `?vao=e` | vào thẳng sân tinh anh (như P0-C) |
| `?vfx=0` · `?bong=1` · `?hitbox=1` · `?cham=4` | như trang Lam mới 2 (tắt vệt · bóng đen · hộp đòn · chậm ×4); trên iPhone: ⚙ → mục Lam mới |
| `?song=0` · `?moc=cu` · `?mep=sau` · `?congmo=cu` | so các sửa PH14 (xem `thu-lam-moi-2/GHI-CHU.md` mục "Sửa PH14") |
| mọi cờ của P0-C | giữ nguyên (`?debug=p0c`, `?cam=phong`, …) |

## Sinh bằng script – không sửa tay P0-C gốc

`cong-cu/tao-p0c-lam-moi.py` đọc **`game/thu-p0c/index.html` đã sinh** (bằng `thu-p0c/cong-cu/tao-p0c.py`) + `thu-lam-moi-2/cong-cu/khoi-lam-moi-2.js`, rồi thay đúng các móc
Lam mới mà trang Lam mới 2 dùng: `drawLam` → `LM2.ve`, vòng lặp chậm ×N, nạp sheet trước khi dựng nền, chèn khối Lam mới trước `boot()`; đường dẫn Ấn Rèn `p0c/` →
`../thu-p0c/p0c/`; tiêu đề + màn bắt đầu; **mã phiên riêng `p0cLM-<ngày>-<băm>`** (băm P0-C đã sinh + khối Lam mới + script). Chỗ thay lệch → script dừng và báo.

```
python3 game/thu-p0c/cong-cu/tao-p0c.py                    # P0-C gốc (Lam cũ)
python3 game/thu-p0c-lam-moi/cong-cu/tao-p0c-lam-moi.py    # bản này
python3 -B game/thu-p0c-lam-moi/cong-cu/quay-p0c-lam-moi.py # video chơi thật (~6 phút)
```

Phiên hiện tại: **`p0cLM-2910-ae49b204`** (nền P0-C `p0c-2910-e9cba386`). Luật: giống P0-C – **LUẬT-RƠI v2** (xem "Thay đổi luật" trong `thu-p0a/GHI-CHU-AM-DAO.md`).

## Video chơi thật – `video/choi-that-p0c-lam-moi-60fps.mp4` (60 hình/s, 1773 bước ≈ 30 s)

Bot = đúng bot luồng người chơi của P0-C (`thu-p0c/cong-cu/quay-p0c.py`, `bot_luong`), **không bất tử**: tinh anh chỉ bằng đánh thường (thấy giơ tay → lướt lùi, thấy húc → lướt
xuyên) → hạ tinh anh → nhặt Ấn Rèn I → sang F, đứng cạnh đe → bấm Rèn → cấp 3 → giữ Chém 26 tick rồi thả = **Dư Âm** vào hình nộm → quay lại E, 2 Chuông Gỗ (Dư Âm trong lúc nó hồi).
Góc dưới: máu · việc bot · nhãn tư thế Lam mới. Log từng bước: `video/log-choi-that.json`.

Kết quả (Chromium, không phải cảm nhận người chơi): tinh anh hạ, Ấn nhặt, rèn 1 lần, **Dư Âm 3 lần, vết vang trúng 3**, 2 Chuông Gỗ hạ, 0 lỗi trang.
Lần quay này bot **không bị đánh trúng** (máu 5 suốt) – nên video **không có** cảnh chết / hồi sinh; hình chết tạm xem `thu-lam-moi-2/xem-thu/sua-ph14/chet-tam.gif`.

## Hình Lam mới trong luồng P0-C

| Việc | Hình |
|---|---|
| đứng, chạy, combo 1→2→3, hất, trên không, nhảy / rơi, pogo, lướt, bị đánh, bám móc | tư thế gen (bộ 3–5) |
| chết | **tạm (code)**: khuỵu / tan dựng từ hình bị đánh |
| tụ Dư Âm | **tạm**: A (lấy đà) – chờ sheet `thu6-tu-vang-3o.png` |
| chém vang (Dư Âm) | **tạm**: A → B → C → D (đọc như một nhát chém) – chờ sheet `thu6-tu-vang-3o.png` |
| nhảy tường | J1 – chờ sheet `thu6-bat-vach-2o.png` |
| rút dao lúc vào màn | D (tạm) |
| đe rèn / Ấn / tinh anh / Chuông Gỗ | giữ nguyên P0-C |

## Chưa làm / cần người thử

- **Thử Safari iPhone thật** (PH14 mục 7.5): đa chạm, nút xuống + pogo, bám / nhảy tường hai bên, vòng chết / hồi sinh, bóng Vọng, rèn và Dư Âm, khung hình / bộ nhớ sau đổi phòng
  nhiều lần, vùng bị ngón tay che. Chưa có số Safari → **không xác nhận hiệu năng** từ Chromium.
- Chỉ khi đạt mới chọn một bản Lam mới cố định cho **cả A/B của P0-B** và bắt đầu lượt so mới (không trộn kết quả cũ / mới).
