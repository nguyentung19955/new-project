# Báo cáo: 3 trùm nhỏ mới 2 pha, 7 hiệu ứng, 4 khung giao diện — 14/10

Commit: **`cf25947`** (nhánh `khoi-tao-du-an`, đã rebase lên `0c2b7bb` cốt truyện; game/dist lấy bản trên nhánh rồi build lại). Không chạy game, không Playwright: chỉ xử lý ảnh, ảnh soát tĩnh, `node --check` toàn bộ `game/js/*.js`, `python3 game/build.py` (cả `--hai-tep`). Không đổi số cân bằng. Không đụng `firebase-config.js`, đăng nhập Google, lưu mây, `?cloud=0`.

## 1. Nấm Chúa, Cua Đá, Hổ Lửa mới — pha 1 + pha 2 (`cong-cu/dung-trum-nho.py`)
- Thay `namChua`, `cuaDa`, `hoLua.sprite.json` (pha 1: 6 hàng) và thêm `namChua-p2`, `cuaDa-p2`, `hoLua-p2` (pha 2: idle, tele, atk, hit). Nét ×2, mỗi tệp một bảng 128 màu.
- **Co cỡ**: mỗi hàng một hệ số, đo bằng SIFT so với hàng đứng cùng pha (trung vị mọi cặp khung). Giữa hai pha: SIFT hàng đứng p2 ↔ p1 (Nấm 1,06; Cua 1,04; Hổ 0,97).
- Nấm `p2-2-bao-don` vẽ quay trái → đã lật ngang. SIFT không đo được hàng này nên lấy theo chiều cao khung đầu.
- **Cỡ đứng pha 1 bằng con cũ**: Nấm 64, Cua 74, Hổ 60 điểm game. Giữ `rong`/`cao` cũ. Hộp va chạm (`BODY` trong boss.js) không đụng.
- **Đất**: trung vị chân của hàng. Neo ngang theo giữa dải chân, bỏ các điểm hiệu ứng rực màu.
- **Nhịp đòn**:
  - Đòn thường gây sát thương ngay đầu hàng atk. Chiêu 1/2 gây sát thương ở u = 0,5, tức khung đầu hàng atk.
  - Vì vậy hàng atk bắt đầu từ khung chạm: Nấm p1 khung 2, p2 khung 1 (vệt quét); Cua khung 2 (đập càng); Hổ khung 2 (vuốt). Các khung vung trước đó nối vào cuối hàng tele.
- **Đổi pha (chỉ đổi hình)**:
  - `PHA_MA` trong sprite_custom.js mở rộng thêm namChua, cuaDa, hoLua.
  - `mobs.js` truyền `o.phase = 2` khi máu < 50%. Chiêu, nhịp và `b.phase` không đổi.
  - Lúc gục dùng hàng chết của pha 1.
  - Cờ tắt `?trumnho=0`: giữ hình pha 1 suốt trận.
- Cỡ tệp: 0,42 / 0,62 / 0,42 MB (pha 1) và 0,30 / 0,39 / 0,36 MB (pha 2). Ảnh AI cũ khoảng 0,25 MB mỗi con.

## 2. Bảy hiệu ứng (`cong-cu/dung-hieu-ung-them.py`)
Cờ tắt `?huthem=0` (riêng) hoặc `?hutrum=0` (chung). Thiếu ảnh thì vẽ bằng code như cũ. Không đổi vùng, sát thương, thời gian.

| Mã | Móc vào | Cỡ |
|---|---|---|
| hu-dap-san | `dapSan` (Cua chiêu 1). Khung bùng to đúng lúc vùng nổ, vẫn giữ vòng báo trước | vòng thật r 80 |
| hu-nam-moc | `boss.js` đặt ảnh tại đúng 7 vùng nấm thật (`anhVungThem`). Trong trận `monster_art` không vẽ thêm | vùng r 14 |
| hu-phun-lua-quat | Hổ chiêu 2: từ miệng, xoay theo hướng, quay trái thì lật ngang (không lộn ngược) | dài 112 = tầm quạt |
| hu-hat-linh-khi | `fx.js` case `orb`: xoay theo hướng bay, nhuộm `pal(el).c`; trùm dùng co 1,5 | ~16 điểm |
| hu-nut-san | `fx.js` case `crack`: chỉ khung 1, mờ dần ở 25% cuối | theo `o.r` (chuẩn 30) |
| hu-quai-hien | `CH.spawn`: bỏ hạt / bụi vẽ code, giữ dáng thân | theo bề ngang thân (chuẩn 34) |
| hu-quai-dap | `DON.don` kiểu `dap` (Tượng Đá, Bọ Hung) | `tam / 28` |

## 3. Bốn khung giao diện 9 mảnh (`cong-cu/dung-khung-giao-dien.py`)
- Tệp mới:
  - `gd-khung-bang` (khung bảng). Có `lap_canh`: cạnh và lòng lát lặp, không kéo giãn hoa văn. Đã thêm `lap_canh` vào `GD_KEYS` của build.py và `gdGhep9`.
  - `gd-nut-thuong` / `-chinh` / `-nguy` / `-chon`.
  - `gd-khung-thoai`.
  - `gd-thanh-tren` và `gd-thanh-tren-vach`.
- Nét ×2, 32–96 màu, tổng khoảng 63 KB.
- **Cách vẽ (ui_theme.js)**:
  - `T.panel`: viền phủ x−3…x+w+3 như viền code, có vạch đồng dưới tiêu đề.
  - `T.btn`, `T.sbtn`, `T.tab`: theo tông thường / chính / nguy / chọn. Tông vàng kim, tím, màu riêng vẫn vẽ code. Nút mờ dùng bản tối, nút đang bấm dùng bản sáng.
  - Nút “chọn” màu vàng có chữ nâu sẫm. Các nút khác giữ chữ kem.
  - `T.dialog`: hai trục cuộn thò ra 6 điểm mỗi bên để chữ (vẫn ở x+7) nằm trên giấy kem, chữ nâu sẫm. Thẻ tên và đuôi vẽ như cũ.
  - `T.topBar`: 8 tài nguyên chia 4 ô bằng vạch (vàng + quặng · 3 nguyên liệu · 3 mảnh · chữ bên phải).
- Khung nhỏ hơn tổng hai góc thì game thu **đều** cả hình, nên góc không bị bẹp.
- Toạ độ chữ, biểu tượng và vùng chạm không đổi.
- Cờ tắt `?khunganh=0` (`G.KHUNG_ANH = false`). Cờ này tắt luôn các khung 9 mảnh Làn C5 cũ.

## Ảnh soát (thư mục này)
- `xem-trum-nho.png`: mọi hàng × 2 pha × 3 con, cùng tỉ lệ, có hàng đứng con cũ ở trên. Đỏ là đất, vàng là đỉnh đầu lúc đứng.
- `xem-hieu-ung-them.png`: 7 hiệu ứng ở cỡ game, kèm vùng sát thương thật.
- `xem-giao-dien.png`: dựng thử bằng script (cắt 9 mảnh như game): bảng, nút 4 tông ở 3 cỡ, đang bấm, mờ, hộp thoại 1 và 3 dòng, thanh trên. Phông chữ trong ảnh khác phông của game.

## Cần chủ dự án xem khi chơi
1. **Đổi pha trùm nhỏ**: hình đổi ngay khi máu dưới 50%, không có cảnh chuyển. Cua và Hổ pha 2 có ô khung to hơn pha 1 (do gai và lửa), nhưng thân vẫn cùng cỡ.
2. **Nhịp đòn**: xem khung chạm (càng đập, vệt quét, vuốt) có trùng lúc vùng đỏ nổ không. Hàng tele 7–8 khung cuối có các khung vung đòn.
3. **Hổ phun lửa**: ảnh neo ở điểm miệng của hình code cũ (`P.pt(10, 57)`), có thể lệch với miệng con hổ mới.
4. **Cua đập sàn**: ảnh vẽ dưới thân cua nên đá văng lên ở khung 3 bị thân che một phần.
5. **Quái xuất hiện**: ảnh cột xoáy che quái trong lúc hiện. Quái lặn xuống đất (cử động xuất hiện chạy ngược) cũng sẽ hiện cột xoáy.
6. **Giao diện**:
   - Đã **bỏ ô chân dung** của hộp thoại, vì game chưa vẽ chân dung và ô đó sẽ đè lên chữ. Muốn có chân dung thì cần thêm phần vẽ mặt NPC.
   - Thanh trên bỏ 3 vạch cố định của ảnh, game tự đặt vạch theo nhóm tài nguyên.
   - Các bảng có lòng nâu thay cho lòng xanh ngọc. Cần xem các ô con (`T.inset`, xanh ngọc) và chữ phụ xám xanh có còn hợp không.
   - Nút rất nhỏ (cao 14) có hoa văn mây thu nhỏ.
7. **Dung lượng (vượt trần, như đợt trước)**:
   - Bản một tệp 31,33 / 30 MB.
   - Ảnh trên máy chủ (`--hai-tep`) 34,92 / 26 MB, trong đó PNG 21,42 MB và WebP 13,50 MB.
   - Đợt này thêm khoảng 2,5 MB, chủ yếu là tấm trùm nhỏ. Hạ xuống 96 màu chỉ bớt khoảng 0,15 MB nên không hạ.
