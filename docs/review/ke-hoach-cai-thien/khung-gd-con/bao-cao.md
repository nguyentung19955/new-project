# Báo cáo: 9 khung giao diện còn vẽ code → ảnh (khung-gd-con)

Làm theo `YEU-CAU.md` cùng thư mục. Commit `c0fd57fb` trên nhánh `khoi-tao-du-an` (đã rebase lên `0351a3df` của phiên khác; giữ nguyên thay đổi của họ, chỉ dựng lại `game/dist`).
**Không chạy thử game**: chỉ `node --check` mọi tệp `game/js/*.js`, `python3 game/build.py` (cả `--hai-tep` để đo dung lượng) và ảnh soát tĩnh `xem-khung.png`.

## Tệp ảnh mới (`game/art/custom/`, doi_tuong `giao-dien`, net 2)

| Ảnh gốc (dot2/) | Mã | Cỡ game | vien [t,r,b,l] | Thay cho |
|---|---|---|---|---|
| khung-nho.png | gd-khung-nho | 64×19 | 5,5,5,5 | `T.plate` → tooltip `T.endFrame`, dòng thông báo / nhãn / tinh anh trong `stage.js`, nền `MM.draw`, HUD linh khí (`linhkhi.js`, `vk_moi.js`), nút túi `hanh_trang.js` |
| dai-thong-bao.png | gd-dai-thong-bao | 109×18 | 0,11,0,11 (lặp) | `T.toast` / `T.toastFit`, popup `luc_chien.js` |
| o-con-2-trang-thai.png | gd-o-con / gd-o-con-chon | 34×33 / 35×34 | 5 / 6 | `T.inset` (mọi nơi gọi: hanh_trang, village, chuong_ui, ep_do, vk_moi, bang_vang, ai_ngay, stage) |
| the-nho.png | gd-the-nho | 39×10 | 0,3,0,3 | chip Kháng / Yếu dưới thanh trùm (`stage.js` drawHud) — game nhuộm (nhân màu) theo màu chip |
| khung-vach-lk.png | gd-khung-vach-lk + gd-khung-vach-lk-moc | 32×7 (lặp) + 2×7 | 0,4,0,4 | vỏ vạch `LK.hud`, `LK.panel` (`linhkhi.js`); vạch mốc cắt riêng, đặt theo mốc thật (đã đạt: ảnh gốc; chưa: bản tối) |
| thanh-cuon.png | gd-thanh-cuon + gd-thanh-cuon-num | 4×32 / 3×9 | 3,0,3,0 / 2,0,2,0 | thanh cuộn `hanh_trang.js` region() |
| khung-canh-bao.png | gd-khung-canh-bao | 84×19 (lặp) | 5,5,5,5 | hộp hỏi xác nhận đỏ `ep_do.js` E.panel |
| the-sap-co-b.png | gd-the-sap-co | 32×10 | 0,4,0,4 | thẻ "Sắp có" bản đồ vùng `village.js` (chọn bản **b**, chỉ lấy tấm gỗ: vòng treo sẽ đè lên tên vùng ngay trên) |
| khung-mau-quai.png | gd-khung-mau-quai | 82×4 | 0,2,0,2 | thanh máu nhỏ quái thường / tinh anh `stage.js` mobBars (đầu mút đã đơn giản hoá: núm co về đúng chiều cao thân) |

Khử nền xanh: điểm nền (G cao, G − max(R,B) > 60) bỏ; vành 4 điểm quanh nền: ám xanh mạnh bỏ, nhẹ thì ép G = max(R,B); sau khi thu nhỏ kiểm lại mép — **0 điểm còn ám xanh** ở cả 12 tệp. Lòng xanh đậm khung-nho không bị đụng.
Lòng: `gd-khung-nho` (#183117) và `gd-o-con(-chon)` (#241611) đục rỗng lòng để game đổ đúng màu lòng ảnh — khung nhỏ bán trong suốt theo `o.a` như code cũ, ô con nhận thêm `o.fill` phủ lên; các khung khác giữ lòng tối đục trong ảnh.

## Mã
- `js/ui_theme.js`: `T.plate`, `T.toast`, `T.inset` vẽ ảnh khi có; hàm mới `T.theNho`, `T.mauQuai`, `T.vachLk`, `T.vachLkMoc`, `T.thanhCuon`, `T.khungCanhBao`, `T.theSapCo` (trả `false` khi thiếu ảnh / cờ tắt → nơi gọi vẽ code như cũ). `T.MA_KHUNG` thêm 12 mã. Bộ nhớ lớp khung mỗi ảnh 24 → 48 cỡ (khung nhỏ có nhiều cỡ trong một khung hình).
- Giữ nghĩa màu: `o.col` của ô con (màu hệ / đủ điều kiện / tối đa) vẽ thành nét 1 điểm ngay trong viền ảnh; viền màu hệ dấu Linh Khí quanh máu quái → khung ảnh phủ màu hệ 70%; chip nhuộm màu chip.
- Chữ, màu lòng thanh (máu, linh khí), nhấp nháy / chớp sáng, toạ độ và vùng chạm không đổi. Ô con "chọn" tràn 0,5 điểm mỗi bên (quầng vàng); vỏ vạch linh khí và máu quái có núm hai đầu nằm ngoài lòng thanh (trang trí, không đổi bố cục).
- Cờ `?khunganh=0` (G.KHUNG_ANH = false) bật lại toàn bộ vẽ code. Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey.

## Dung lượng người chơi tải (`build.py --hai-tep`, trần 20 MB)
- Trước: trang 0,95 MB + ảnh 14,37 MB = **15,31 MB** (lõi 3,82 MB)
- Sau: trang 0,95 MB + ảnh 14,38 MB = **15,33 MB** (lõi 3,83 MB; 12 tệp mới ≈ 22 KB JSON, nằm trong ảnh lõi vì gd-* bắt buộc)
- Bản một tệp: 25,99 → 26,02 MB / trần 30 MB.

## Ảnh soát
`xem-khung.png` (dựng bằng `cong-cu/xem-khung.py`, cắt 9 mảnh giống `SC.veGd`): mỗi khung ở cỡ game cạnh bản code cũ, kèm vài cỡ kéo giãn. Công cụ dựng: `cong-cu/dung-khung-gd-con.py --ghi`.

## Còn lưu ý (chưa thử trên máy thật)
- Khung nhỏ ở cỡ 12–14 cao: núm góc chỉ ~3 điểm, móc góc gần như mất; lòng nay xanh đậm (màu ảnh) thay gỗ nâu cũ.
- Ô con mặc định nay lòng nâu tối (màu ảnh) thay xanh ngọc; ô "chọn" nhận biết bằng khung vàng có quầng thay vì lòng xanh sáng. Một vài đốm quầng vàng 1 điểm nét x2 ở mép ô chọn.
- Dải thông báo rộng (>110) lặp đoạn giữa, thấy mờ đường nối ở lòng; hộp cảnh báo cao 36 có nút chạm sát viền đáy; vạch mốc linh khí ở cỡ game rất mảnh.
- `LK.hud` / `LK.panel` là đường cũ (hệ mới `vk_moi.js` dùng tấm "Linh khí N" = `T.plate`), và `LK.panel` hiện không có nơi gọi — vỏ vạch chỉ hiện khi `vk_moi` không vẽ được tấm (đường dự phòng).
