# Lực chiến + thông báo tăng/giảm khi thay đồ (12/10/2026)

Câu hỏi của chủ dự án: "Lúc mặc đồ mạnh hơn không thấy có thông báo tăng lực chiến nhỉ". Nay game có con số **Lực chiến**
(tiếng Anh "Combat Power") và dải thông báo kiểu game điện thoại mỗi khi con số đổi. Chỉ là phần hiển thị: không đổi sát thương,
máu, chỉ số đồ, cân bằng; không thêm trường nào vào bản lưu.

> Lưu ý: game đã có sẵn **"Sức mạnh"** (`G.power`, tiếng Anh "Power"), con số dùng để so với "Sức mạnh khuyên dùng" của từng ải
> và xếp hạng Bảng vàng. Sức mạnh giữ nguyên (đổi nó là đổi luật thưởng khi cày). Lực chiến là con số thứ hai, đi theo mọi món đồ,
> nên tiếng Anh dùng "Combat Power" / "CP" để không trùng chữ "Power".

## Công thức (`G.lucChien(save, heroKey)`, tệp `game/js/luc_chien.js`)

Hàm thuần: dựng em bé bằng đúng `G.buildPlayer()` (hàm tạo P lúc vào trận), bản lưu không đổi.

- **Đòn mỗi vũ khí đang mang**: `G.pDamage(P, w)` (sát thương gốc × bậc/Vàng vùng × mốc linh khí × mài × cấp × điểm Công × sở trường)
  × **nhịp đánh** đọc từ `G.MOVES` (tổng hệ số các nhát / tổng thời gian: kiếm 3,63, giáo 3,26, cung 2,63, búa 1,25)
  × (1 + chí mạng của điểm Công + 10% nếu có dòng phụ chí mạng) × dòng phụ (mana ×1,03, tầm ×1,03)
  × dòng mạnh (Diệt yêu ×1,10, Thấm hệ ×1,05, Mở màn ×1,05) × thưởng hệ đủ bộ trang phục (nếu vũ khí theo hệ đó)
  × (1 + nửa phần "+15% lên quái dính hiệu ứng").
- **DPS** = 0,75 × vũ khí mạnh hơn + 0,25 × vũ khí kia (ô trống = 0, như Sức mạnh: trùm thích nghi hệ nên cần đủ hai món)
  × hệ số chưởng (`G.chuong.powerMult`) × (1 + nửa phần hồi chiêu nhanh)
  × mana và đòn Đặc biệt (Đặc biệt rẻ hơn 0,6%/mana, mana tối đa 0,08%/điểm, hồi mana mỗi đòn 3%/điểm)
  × hiệu ứng kéo dài, nổ kết hợp hệ, đổi vũ khí chắc gây hiệu ứng (phần nhỏ).
- **Độ bền (EHP)** = máu tối đa / (1 − giảm sát thương, trần 75%; nội tại Cu Lì tính một nửa)
  × (1 + 0,3 × kháng hệ trung bình) × (1 + hồi máu mỗi phòng) × lộn nhanh hơn, cánh, tác dụng trang phục (4%/món), tốc chạy.
- **Lực chiến = làm tròn(7 × √(DPS × EHP))**.

Mức: em bé mới (Cu Tí cấp 1, Kiếm Rèn + Cung Tre) = **411**; cấp 10 Lam +3 ≈ 650; cấp 20 Tím +6 Thành hình ≈ 1.050;
cấp 40 Vàng +15 Thức tỉnh ≈ 2.400, thêm trang phục bộ lên khoảng 3.000–4.000. Số có dấu ngăn nghìn: `1.087` (tiếng Việt), `1,087` (tiếng Anh).

## Nơi hiện

| Chỗ | Hiện gì | Ảnh |
|---|---|---|
| Hành trang › Nhân vật | "Lực chiến 988" to nhất (cỡ 11), "Sức mạnh 235 (so với khuyên dùng…)" ở dòng dưới | `anh/1-hanh-trang-chi-so.jpg` |
| Hành trang › Vũ khí (món trong rương đang chọn) | bên phải tên: "Lực chiến ▲ +80 (ô 2)" (ô có lợi nhất, tính thử, không mang thật), cạnh dòng ▲/▼ cũ | `anh/2-ruong-so-sanh.jpg` |
| Hành trang › Trang phục (món đang chọn) | "Mặc vào: Lực chiến ▲ +86" / "Tháo ra: Lực chiến ▼ −X" | `anh/5-trang-phuc-thu.jpg` |
| Ông Từ (chọn em bé) | mỗi thẻ thêm dòng "Lực chiến 1.087" (bé đó mang đúng đồ hiện có) | `anh/6-ong-tu.jpg` |
| Dải trên cùng ở làng | "Cu Tí · cấp 9 · sức mạnh 260 · lực chiến 972" | `anh/7-lang-hud-sau.jpg` |

Chữ mới đều ≥ 7,5 đơn vị (≈ 11 pt trên iPhone ngang); không có nút mới nên không thêm vùng chạm.

## Thông báo

- Dải pixel (khung `T.toast` của `ui_theme.js`): "Lực chiến 1.037 ▲ +61" (số vàng nhạt, phần tăng xanh) hoặc "Lực chiến 958 ▼ −107" (đỏ nhạt).
  Ảnh: `anh/3-thong-bao-tang.jpg`, `anh/4-thong-bao-giam.jpg`.
- Số chạy dần 0,6 giây (chậm dần), nảy xuống khi hiện, phần +X nảy nhẹ khi chạy xong, tự tắt sau 1,5 giây, mờ dần.
- Tiếng có sẵn: tăng = tiếng "mark" cao (ting), giảm = "pick" trầm; đi qua `G.sfx` nên theo thanh Tiếng / nút Âm thanh trong Cài đặt; tối đa một tiếng mỗi 0,35 giây.
- Không chặn chạm (chỉ vẽ, không đọc ngón tay). Thay đổi liên tiếp gộp vào một dải: số chạy tiếp từ chỗ đang hiện, "+X" tính từ lúc dải bắt đầu.
- Cách bắt thay đổi: mỗi 0,15 giây (lúc vẽ) tính lực chiến em bé đang chọn và so với lần trước, nên mọi việc đều được bắt mà không phải
  sửa từng nút: mang/tháo/thay vũ khí, mặc/tháo trang phục, mài, luyện, nâng bậc, lò, may, nâng cánh, lên cấp, học kỹ năng, cây chưởng.
- Đổi em bé, nạp bản lưu khác (đăng nhập, lưu mây), mở game: chỉ ghi mốc mới, không báo.
- Chỉ hiện ở làng và **màn kết quả** của ải (lên cấp/tiến hoá trong trận thì báo ở màn kết quả, dải ở mép trên: `anh/8-ket-qua.jpg`); trong trận không hiện.
- Ở làng dải nằm ở y = 200 (trên dải gợi ý đáy); trong lúc số chạy, engine vẽ đủ khung (một dòng trong `canhYen` của `engine.js`).

## Cờ tắt

`?lucchien=0` hoặc `G.LUC_CHIEN = false`: không hiện con số ở đâu cả, không thông báo; các bảng về như trước (đã kiểm).

## Tệp đổi

- `game/js/luc_chien.js` (mới): công thức, tính thử (`G.lucChienUI.thuVuKhi`, `thuTrangPhuc` trên bản sao nông), dải thông báo, bộ theo dõi (gắn vào `T.endFrame`).
- `game/index.html`: nạp tệp mới sau `upgrade.js`. `game/js/engine.js`: 1 dòng (vẽ đủ khung khi dải đang chạy).
- `game/js/hanh_trang.js`, `game/js/village.js` (thẻ Ông Từ), `game/js/village_scene.js` (dải trên cùng).
- `game/js/ngon_ngu_en.js` + `tools/ngon-ngu/tu-dien/luc-chien.json`: 5 chuỗi tiếng Anh (thêm tay vào ngon_ngu_en.js vì chạy `gop.py` sẽ xoá 4 chuỗi phiên khác thêm tay).

## Kết quả kiểm (Playwright, iPhone ngang 844×390 dpr 3, bản HAI TỆP `linh-khi-nhe.html?cloud=0`)

Kiểm số bằng chạm/thao tác thật (`kiem_anh.py`):

| Việc | Trước | Sau |
|---|---|---|
| Mang Kiếm Tím (crit, mana) thay ô 1 | 988 | 1.049 ▲ (thử trước báo +61, đúng) |
| Tháo vũ khí ô 2 | 1.049 | 942 ▼ |
| Mài +1 | 942 | 972 ▲ |
| Mặc Mũ tai cáo Vàng (bấm nút Mặc) | 972 | 1.058 ▲ (thử trước báo +86, đúng) |
| Lên 2 cấp liền | 1.058 | 1.087 (một dải gộp, base 1.058 → 1.087) |
| Đổi sang Cu Tèo | — | không báo |
| Lên cấp trong trận | — | trong trận không báo; màn kết quả báo 766 → 777 |

So với sát thương mỗi giây đo bằng bot đánh bia (cùng kịch bản `game/tests/au_dps.py`, kiếm giữ nút 10 giây; `kiem_dps.py`):

| Cấu hình | Lực chiến | DPS đo |
|---|---|---|
| cấp 5 Thường +0 | 452 | 35,7 |
| cấp 10 Lam +3 | 636 | 54,5 |
| cấp 10 Lam +6 | 694 | 65,1 |
| cấp 20 Tím +6 | 931 | 83,3 |
| cấp 30 Vàng +10 | 1.454 | 140,2 |

Cùng chiều ở mọi bước. Khác:

- 0 pageerror (lỗi 404 duy nhất là tệp script ngoài có sẵn từ trước, không liên quan).
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được.
- `au_ui.py`: không lỗi JS. `au_luu.py`: chạy xong, kết luận như trước (một mục "CÓ VẤN ĐỀ" về nút Chơi tạm khi đăng nhập khách lỗi mạng là phát hiện cũ, không đụng).
- `cloud_save_regression.test.js`: PASS. `hanh_trang.py`: 40/41 — mục hỏng "thẻ Linh khí ghi đúng dấu ấn" hỏng y hệt trên bản trước khi sửa (số mốc cũ trong bài kiểm), không do phiên này.
