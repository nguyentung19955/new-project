# Yêu cầu: chạy + chém bị vặn người, eo bị bóp nhỏ (chủ dự án báo 13/10 13:17)

"Vừa chạy vừa đánh bị vặn người làm bóp nhỏ eo đi."

## Nguyên nhân (điều phối soát `zed-chay-danh/ghep-eo-moi.png`)
- Ghép eo: nửa trên lấy khung ĐÒN (thế đứng rộng, hông to), nửa dưới lấy khung CHẠY (nhìn nghiêng, hông hẹp) → chỗ nối thắt lại như bị bóp eo.
- Khi chạy ngược hướng chém, chân quay một hướng, thân trên quay hướng kia → trông như vặn người.

## Cần làm (sửa `game/js/zed_moi.js`, `docs/anh-goc/zed/cat-than.py`, `game/js/zed_eo_data.js`)
1. **Hết vặn người**: khi đang ra đòn, chân LUÔN quay cùng hướng thân trên (hướng chém). Chạy ngược hướng chém thì chân chạy lùi (phát hàng chạy ngược thứ tự khung, nhịp chậm lại ~0,8) thay vì quay chân ngược lại.
2. **Hết bóp eo**:
   - Dời đường cắt xuống thấp hơn: lấy cả đai + hông + đùi trên (tới khoảng giữa đùi) từ khung ĐÒN; khung CHẠY chỉ góp phần từ giữa đùi xuống bàn chân.
   - Vùng nối 4–6 điểm ảnh nguồn: nửa nào hẹp hơn thì kéo giãn ngang dần (từ bề rộng của nó lên bằng bề rộng nửa kia ở mép nối), không để chỗ nối thắt lại; vẽ nửa trên đè lên nửa dưới ở vùng nối.
   - Đo lại bề rộng chỗ nối từng khung cho cả 4 bộ (ninja, Rừng, Biển, Lâu đài), ghi vào `zed_eo_data.js`.
3. Không đổi luật chạy + chém (tốc độ, bộ đệm, chốt hướng, combo), không đổi phần cầm vũ khí đứng/đi/chạy, không đổi phần quay 8 hướng (làm SAU phiên `zed-8-huong`, git pull trước, đọc code mới).
4. Ảnh soát `xem-eo-sua.png`: trước/sau cho kiếm 1, kiếm 2, thương 1, phi tiêu (bộ ninja và Lâu đài), cả trường hợp chạy cùng hướng và ngược hướng chém. Ngang ≤ 4000 điểm ảnh.
5. Cờ `?eosua=0` để về như trước.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ script Python dựng ảnh soát, `node --check`, `python3 game/build.py`.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Không chép apiKey trong `game/js/firebase-config.js`; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` (tiếng Việt, mã commit, cách tắt), push, tự dừng.
