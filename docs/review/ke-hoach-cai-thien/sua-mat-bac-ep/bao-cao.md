# Báo cáo: sửa lỗi mất bậc ép sau "Xoá hết"

Theo `YEU-CAU.md` (nguồn: `kiem-can-bang/bao-cao-B.md` mục 7, đề xuất 1 và 1b). Commit code: `0ca038df`.

## Đã sửa

| # | Tệp | Thay đổi |
|---|---|---|
| 1 | `game/js/vk_moi.js` (`VM.canLai`) | Khi dựng lại 4 vũ khí, vũ khí mới **giữ `ep`** của vũ khí cũ (chỉ khi là object, không phải mảng). `js/ep_do.js` bọc `G.fixSave` sau đó vẫn chuẩn hoá `ep` như cũ (kẹp bậc, lọc dòng, `may`). |
| 2 | `game/js/engine.js` (`G.resetSave`) | Đặt `G.save.canLai = G.SAVE_CAN_LAI \|\| 1` trước `G.persist()`. **Không** thêm vào `G.newSave` (giữ đúng ghi chú ở `G.SAVE_CAN_LAI`: vòng "thiếu gì thì bù" sẽ chép cờ sang bản cũ). Chỗ tạo bản mới khác (`G.fixSave(null)` / bản hỏng) đã có cờ sẵn từ `js/vk_moi.js`, không phải sửa. |
| 3 | `game/tests/cay.py` (4 chỗ), `game/tests/balance.py`, `docs/.../noi-gian-manh/do_trum.py` | Đặt `canLai = G.SAVE_CAN_LAI` trước `G.fixSave` khi nạp bản lưu (`cay_luu.json`, bản tạm `--luu`). Không sửa `cay_luu.json`. |
| – | `game/dist/*` | Chạy lại `build.py`. |

Không đổi số cân bằng nào. Định dạng bản lưu không đổi (chỉ thêm cờ `canLai` sẵn có vào bản "Xoá hết"). Bản lưu cũ trên máy / mây thiếu cờ vẫn đi qua `VM.canLai` một lần như trước, giờ không mất bậc ép. Không đụng `js/cloud.js`, đăng nhập Google, `?cloud=0`.

## Kiểm tra (Node, `tests/node_trang.js`, không trình duyệt)

Chuỗi trong bao-cao-B mục 7: `G.resetSave()` → kiếm `ep = { b: 4, d: [chiMang, stChiMang] }`, `daBac = 7` → `G.persist()` → `G.loadSave()`.

| | Trước sửa | Sau sửa |
|---|---|---|
| `canLai` ngay sau `resetSave` | không có | 1 |
| Nạp lần 1: kiếm `ep` | **null** (mất Bậc Vàng + 2 dòng) | giữ `b: 4`, 2 dòng |
| Nạp lần 2 | null | giữ |
| Bản cũ thiếu `canLai` có `ep`, mài 99 (đường mây / máy cũ) | `ep` mất, mài kẹp 15 | `ep` giữ, mài kẹp 15 (hoàn như cũ), `canLai = 1` |
| `ep` rác (`'rac'`) | bỏ | bỏ (ep_do.js) |
| `G.newSave()` có `canLai` | không | không (đúng ý) |

### Sức mạnh 15 bản lưu `cay_luu.json` (nạp như công cụ bot cũ, không đặt cờ)

| Ải | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 2-1 | 2-2 | 2-3 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | **3-5** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Trước | 100 | 107 | 126 | 141 | 174 | 181 | 207 | 250 | 265 | 293 | 312 | 346 | 392 | 411 | **455** |
| Sau | 100 | 107 | 129 | 144 | 183 | 190 | 217 | 271 | 288 | 318 | 352 | 390 | 452 | 464 | **514** |

Sau sửa, nạp có cờ và không cờ cho cùng số (đặt cờ ở công cụ là để chắc chắn, và cho bản cũ hơn). Khớp bao-cao-B: 455 → 514.

Chạy thử công cụ: `balance.py 1 - 14 --node` in "sức mạnh 514/520"; `do_trum.py moi 14 2` chạy được (thắng trùm 2/2); 3 đoạn JS nạp bản lưu trong `cay.py` chạy trong Node trả 514.
`node --check js/vk_moi.js js/engine.js` sạch; `python3 -m py_compile` 3 tệp công cụ sạch; `build.py` chạy xong.

## Lưu ý

- Các số "Sức mạnh thắng 75%" / khuyên dùng đo trước đây bằng `cay.py --kd`, `balance.py`, `do_trum.py` là trên bản đã mất bậc ép (Sức mạnh thấp hơn tới ~12% ở 3-x). Phiên này **không** đo lại và không đổi `G.STAGE_REC`; nên chạy lại `cay.py --kd` ở phiên cân bằng sau nếu cần số mới.
- Người chơi đã mất bậc ép trước bản sửa thì không lấy lại được (dữ liệu đã bị ghi đè).
- `ep` hỏng kiểu `{ b: 99, d: 'x' }` trên bản cũ giờ được ep_do.js kẹp về bậc 6 và bù dòng (cách ep_do.js vẫn làm với mọi bản đã có cờ), trước đây bị bỏ cùng lúc dựng lại. Không gặp ở bản lưu thật.
