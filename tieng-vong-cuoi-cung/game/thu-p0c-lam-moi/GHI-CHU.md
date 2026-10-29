# P0-C · LAM MỚI – bản tích hợp riêng (29/10/2026, PH14)

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-14-LAM-MOI-MOC-VET-CONG.md` ("Gửi Claude", mục 7 bước 4): **duyệt Lam mới cho một bản
tích hợp P0 RIÊNG, chưa thay mặc định**. Trang này = **P0-C đầy đủ** (tinh anh Chuông Gỗ Gác Lớn, né / lướt xuyên, chết / hồi sinh, Ấn Rèn I, đe rèn, Âm Đao cấp 3,
Dư Âm) nhưng Lam vẽ bằng **Lam mới** (máy hình + sheet + vệt gen + móc tường của `game/thu-lam-moi-2/`).
**P0-C (`thu-p0c/`) và P0-B (`thu-p0b/`) GIỮ Lam cũ** để so người chơi.

> **29/10 – người dùng thử iPhone thật** (ảnh `docs/gameplay/anh-nguoi-dung/2910-iphone-*.png`): còn giật, bám móc to hơn đứng, cổng chưa ưng, chết xấu → PH15 bước 1 (xem `thu-lam-moi-2/GHI-CHU.md` mục "PH15 bước 1"): sheet móc thu ×0,81, bù gần sàn liên tục, chết mới (không bóp dẹt / cắt ngang), chém 1 sửa 3.
> **Đo giật trên iPhone**: ⚙ → "Đồng hồ khung hình: BẬT" (hoặc `?fps=1`) → chơi một tuyến 30–60 giây (chạy, nhảy, móc hai vách, combo, chết 1 lần, sang phòng) → ⚙ → "Chép log khung hình" → dán gửi Claude.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0c-lam-moi/index.html

| Thêm vào link | Tác dụng |
|---|---|
| `?lam=cu` | Lam CŨ ngay trong trang này (hoặc ⚙ → "Lam: cũ") |
| `?vao=e` | vào thẳng sân tinh anh (như P0-C) |
| `?fps=1` | đồng hồ khung hình (⚙ → Chép log khung hình) |
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

Phiên hiện tại: **`p0cLM-2910-b739260d`** (29/10 tối, PH15 bước 1: móc thu ×0,81 + bù gần sàn liên tục, chết mới, đồng hồ khung hình, chém 1 sửa 3; trước `p0cLM-2910-75d305d6`, `p0cLM-2910-ae49b204`) (nền P0-C `p0c-2910-e9cba386`). Luật: giống P0-C – **LUẬT-RƠI v2** (xem "Thay đổi luật" trong `thu-p0a/GHI-CHU-AM-DAO.md`).

## Video chơi thật – `video/choi-that-p0c-lam-moi-60fps.mp4` (60 hình/s, 1773 bước ≈ 30 s)

Bot = đúng bot luồng người chơi của P0-C (`thu-p0c/cong-cu/quay-p0c.py`, `bot_luong`), **không bất tử**: tinh anh chỉ bằng đánh thường (thấy giơ tay → lướt lùi, thấy húc → lướt
xuyên) → hạ tinh anh → nhặt Ấn Rèn I → sang F, đứng cạnh đe → bấm Rèn → cấp 3 → giữ Chém 26 tick rồi thả = **Dư Âm** vào hình nộm → quay lại E, 2 Chuông Gỗ (Dư Âm trong lúc nó hồi).
Góc dưới: máu · việc bot · nhãn tư thế Lam mới. Log từng bước: `video/log-choi-that.json`.

Kết quả (Chromium, không phải cảm nhận người chơi): tinh anh hạ, Ấn nhặt, rèn 1 lần, **Dư Âm 3 lần, vết vang trúng 3**, 2 Chuông Gỗ hạ, 0 lỗi trang.
Video quay trước đợt 29/10 chiều (chưa có TV / BM / tranh mới – xem GIF trong `thu-lam-moi-2/xem-thu/chay-duam-vach-2910/`). Lần quay này bot **không bị đánh trúng** (máu 5 suốt) – nên video **không có** cảnh chết / hồi sinh; hình chết tạm xem `thu-lam-moi-2/xem-thu/sua-ph14/chet-tam.gif`.

## Hình Lam mới trong luồng P0-C

| Việc | Hình |
|---|---|
| đứng, chạy, combo 1→2→3, hất, trên không, nhảy / rơi, pogo, lướt, bị đánh, bám móc | tư thế gen (bộ 3–5) |
| chết | **tạm (code, PH15)**: hình bị đánh hạ thấp nhẹ (dịch, không bóp) → tan bằng mặt nạ nhiễu cố định + bụi than thưa, 48 tick; chuông thấp tắt dần. Chờ sheet chết `thu8-chet-*.png` |
| tụ Dư Âm | **TV1** (ảnh gen `thu6-tu-vang-3o.png`, 29/10) – dao sát ngực dưới |
| chém vang (Dư Âm) | **TV1** lấy đà (atkT 1–5) → **TV2** thả chém vang đúng tick hộp (atkT 6–13) → **TV3** kết (14–27); luật Dư Âm giữ nguyên |
| nhảy tường | **BM1** (tick nhảy) → **BM2** (tick kế) = ô cuối móc tường + móc rút về bằng code → lật ra phòng, J1 2 tick → J2 (29/10, không gen) |
| màn bắt đầu / kết | **tranh mới kiểu "Cổ tích chuông tàn"** (Lam mũ tối) – thay tranh Lam mũ trắng cũ ở mọi trang |
| rút dao lúc vào màn | D (tạm) |
| đe rèn / Ấn / tinh anh / Chuông Gỗ | giữ nguyên P0-C |

## Chưa làm / cần người thử

- **Thử Safari iPhone thật** (PH14 mục 7.5): đa chạm, nút xuống + pogo, bám / nhảy tường hai bên, vòng chết / hồi sinh, bóng Vọng, rèn và Dư Âm, khung hình / bộ nhớ sau đổi phòng
  nhiều lần, vùng bị ngón tay che. Chưa có số Safari → **không xác nhận hiệu năng** từ Chromium.
- Chỉ khi đạt mới chọn một bản Lam mới cố định cho **cả A/B của P0-B** và bắt đầu lượt so mới (không trộn kết quả cũ / mới).
