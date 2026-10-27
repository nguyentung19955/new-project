# Dơi Chuông (Làng Chuông) – quái bay ≈ ½ Lam, tay chân rời

Ghi chú chung cho cả ba con mới (cách tách mảnh, cỡ, clip, số gameplay đề xuất, cái chưa đẹp, cách ghép vào game)
nằm trong **`art/re-muc/quai-boss/GHI-CHU.md`**. Code cũng dùng chung: `art/re-muc/quai-boss/code/`, phần riêng của
Dơi ở `tach_manh.py` (`tach_doi`) và `clip_doi.py`. Thư mục này chỉ chứa đầu ra của Dơi.

> ⚠️ Chưa thử iPhone thật. Game chưa có Dơi Chuông, nên mọi số gameplay chỉ là ĐỀ XUẤT.

| Đường dẫn | Nội dung |
|---|---|
| `manh/doi/*.png` + `tach.json` | thân chuông, quả lắc, cánh trước, cánh sau, 2 nửa chuông (chỉ dùng lúc chết) – cắt từ bản nguyên, đã lật quay trái |
| `doi.json` | rig + 5 clip (mốc từng kênh + tư thế từng khung) |
| `xem-thu/` | GIF lớn 6× và GIF 1×, contact sheet, so dáng nghỉ (IoU 0,9923), bảng mảnh + pivot |

- **Cỡ**: cao 56 px logic (từ đỉnh quai tới đáy quả lắc), sải cánh 89 px. Hitbox đề xuất 44×44 (chuông + quả lắc,
  không tính cánh).
- **Điểm neo**: đáy quả lắc, giữa trục chuông (giữa đáy hitbox). Lúc bay, game đặt neo ở chỗ con dơi đang bay. Lúc
  chết, game cho rơi tới khi neo chạm đất rồi mới chuyển sang clip `chet-vo`, nên các mảnh nằm đúng trên mặt đất.
- **Clip**:
  - `bay`: lặp 400 ms;
  - `lao`: 1400 ms, chuẩn bị 0–450 → lao 450–950 → hồi;
  - `trung`: 267 ms;
  - `chet-roi`: lặp 300 ms;
  - `chet-vo`: 900 ms, giữ khung cuối.
- **Số gameplay đề xuất**:
  - bay ở độ cao đáy hitbox ≈ 150 px trên đất, dao động ±6 px, đuổi ngang 1,2 px/bước;
  - lao khi Lam trong tầm 220 px ngang: chuẩn bị 27 bước → lao 30 bước với vận tốc (−4,4; +4,5) px/bước, hitbox thân
    gây sát thương → hồi 27 bước → nghỉ ≥ 90 bước;
  - HP 2 nhát;
  - rơi khi chết: trọng lực 0,5 px/bước².
- **Chưa đẹp**: lúc vỡ, một nửa to, một nửa nhỏ (đường nứt có sẵn trên hình lệch về một bên). Miệng chuông sau cuống
  quả lắc là chỗ vá, khi quả lắc văng mạnh có thể thấy vệt tối.
