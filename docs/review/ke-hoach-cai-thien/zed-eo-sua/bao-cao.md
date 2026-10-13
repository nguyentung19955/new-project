# Báo cáo: sửa vặn người + bóp eo khi chạy chém (13/10/2026)

Mã commit: **7b08fdb** (sửa code + dữ liệu + ảnh soát), **e345c26** (gói lại game `game/dist` sau `git pull --rebase`).
Nhánh `khoi-tao-du-an`. Không test (không Playwright, không chạy game) — chỉ dựng ảnh soát bằng Python, `node --check`, `python3 game/build.py`.

## Đã làm
1. **Hết vặn người** (`game/js/zed_moi.js`): khi đang chạy + ra đòn ở hàng thẳng người (ghép eo), chân KHÔNG còn lật theo hướng chạy — luôn
   cùng hướng thân trên (hướng chém). Chạy ngược hướng chém → hàng chạy phát **ngược thứ tự khung**, nhịp ×0,8 (`LUI_NHIP`) = chạy lùi.
   Phép thử "ngược hướng" giữ như cũ (|mdx| > 0,2 và khác dấu với mặt).
2. **Hết bóp eo**:
   - Đường cắt dời xuống **giữa đùi**: c = đáy đai + 35% quãng đai → bàn chân. Nửa trên (khung ĐÒN) lấy đai + hông + đùi trên; nửa dưới
     (khung CHẠY) chỉ từ giữa đùi xuống bàn chân.
   - Ngang: nửa trên dời theo tâm hông như cũ (thân không nhảy); dọc: hàng cắt đòn khớp hàng cắt chạy.
   - **Vùng nối 5 hàng nguồn**: nửa nào hẹp hơn thì giãn ngang dần (hàng xa mép giữ nguyên → ở mép nối khớp đúng mép trái/phải nửa kia),
     giới hạn hệ số ≤ 1,8 và mép dời ≤ 10 điểm ảnh nguồn (quá thì không kéo để khỏi méo). Nửa dưới lấn lên 1 hàng, nửa trên vẽ đè.
   - Khi thân trên nghiêng (zed-8-huong, đâm/ném gần thẳng lên/xuống): chỉ phần từ đai trở lên xoay quanh eo như cũ; dải hông + đùi trên
     đứng yên cùng chân, vẫn lót dải đai để chỗ nối không hở.
   - Mũi vũ khí / vệt (`doiTip`) và trục nghiêng dùng cùng độ dời mới → vũ khí vẫn nằm trong tay.
3. **Đo lại cả 4 bộ** (ninja, Rừng, Biển, Lâu đài) bằng `docs/anh-goc/zed/cat-than.py` → `game/js/zed_eo_data.js` **phiên bản 2**: mỗi khung
   `[y, x, c, l, r]` — y/x = điểm eo cũ (đáy đai, tâm hông: giữ cho trục nghiêng và cách cũ), c = đường cắt giữa đùi, l/r = mép trái/phải
   hình ở đó (bỏ da tay, bỏ màu đai/đuôi đai, gộp hai đùi cách ≤ 4 điểm ảnh, trung vị 3 hàng). Thêm `vung_noi`, `keo_toi_da`, `doi_toi_da`.
   Điểm eo cũ của bộ Lâu đài đổi 5 khung vì tấm Lâu đài đã dựng lại sau lần đo trước (ảnh `zed-chay-danh/ghep-eo-lau.png` cập nhật theo).
4. **Ảnh soát** `xem-eo-sua.png` (2454×1576): kiếm 1, kiếm 2, thương 1, phi tiêu × bộ ninja và Lâu đài, mỗi đòn 3 khung; 4 cột nhóm:
   CŨ cùng hướng | MỚI cùng hướng | CŨ chạy ngược (chân lật = vặn người) | MỚI chạy ngược (chạy lùi). Ảnh dựng y phép ghép của game
   (hàm `ghep_moi`/`keo_noi` trong cat-than.py giống `keoNoi` + vẽ hàng trong zed_moi.js).

## Không đổi
- Luật chạy + chém (tốc độ, bộ đệm, chốt hướng, combo), `js/moves.js`, `js/combat.js`: không đụng. Chỉ đổi HÌNH.
- Cầm vũ khí đứng/đi/chạy (bản mới vẽ vũ khí ra trước người, commit 8d0a0b6 — đã pull trước khi push), quay đòn 8 hướng: giữ nguyên.
- Hàng cúi/khuỵu (kiếm 3, búa, quét, đặc biệt) vẫn vẽ toàn thân hàng đòn như trước.
- Đăng nhập Google, lưu mây, `?cloud=0`, `firebase-config.js`: không đụng.

## Cách tắt
`?eosua=0` (G.EO_SUA, `js/data.js`) → ghép eo như trước (cắt ở đai, chân lật theo hướng chạy). `?chaydanh=0` vẫn về cách chạy chém cũ hơn.

## Lưu ý để chủ dự án xem khi chơi
- Khung thương 1 tấn dài (chân sau duỗi rất xa) — sau sửa phần đùi trên của thế tấn được giữ, cẳng chân là của khung chạy nên dáng hơi lạ ở
  1–2 khung đó (xem hàng thương_1 cột #2 trong ảnh soát). Nếu thấy chướng, có thể đưa thương 1 sang nhóm vẽ toàn thân hàng đòn.
- Chưa chạy thử trong game (theo luật KHÔNG TEST).
