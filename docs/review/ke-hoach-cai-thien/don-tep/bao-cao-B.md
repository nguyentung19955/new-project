# Báo cáo dọn nhóm (B): bỏ các bản cũ chỉ dùng cho cờ quay lui (15/10)

Yêu cầu: chủ game quyết bỏ hẳn nhóm (B) trong `bao-cao.md` cùng thư mục. Nhánh `khoi-tao-du-an`, mỗi cờ một commit (tiêu đề bắt đầu bằng `don-tep B:`).

## Tóm tắt

- Đã bỏ **14 cờ** quay lui và phần code chỉ chạy khi bật các cờ đó. Đã xoá **30 tệp** `game/art/custom/*-cu.sprite.json` (892 753 byte).
- Code game: `game/js` giảm **38 452 byte** (thêm 253 dòng, bớt 678 dòng). Phần lớn số dòng thêm là dòng sửa lại, không phải code mới.
- Khi không bật cờ nào, game chạy y như trước: mọi nhánh bị bỏ đều là nhánh chỉ chạy khi bật cờ.
- **Giữ `?authcu`** để không đụng tới đăng nhập Google (lý do ở dưới). `?cloud=0`, đăng nhập và lưu mây không đổi.
- Không chơi thử bằng trình duyệt. Các bước kiểm ở mục cuối.

## Cờ đã bỏ

| Cờ (biến) | Commit | Đã bỏ |
|---|---|---|
| `?chopcu=1` (`G.CHOP_NHE`) | 4c151b74, 0a989557 | Chớp trắng phủ cả thân khi trúng đòn. Nay luôn là viền sáng + đỏ nhẹ (`js/sprite_custom.js`). Có bỏ thêm một chỗ đọc `G.CHOP_NHE` mà phiên soát mượt vừa thêm. |
| `?btcu=1` | ed9e85b2 | Cờ này trùng với `?baoanh=0` (`js/bao_truoc.js`). |
| `?biacu=1` | 5d930305 | Màn chào cũ: bố cục `TL_CU`, Cu Tí đứng góc, lớp tối `titleVeil` (`js/village.js`). Bỏ cả đường chọn cũ trong `js/bia.js`, thẻ màn tải `index.html`, ghi chú trong `build.py` và `tools/anh-truyen/dung.py`. |
| `?truyencu=1` | 6a6dc430 | Lời truyện 4 khung cũ `MO_DAU_CU`, `VUNG_CU`, `KET_CU`, tiêu đề cũ, `TR.CU` (`js/truyen.js`). Khi ảnh chưa về, nền vẽ code vẫn giữ. |
| `?chucu=1` (`G.CHU_CU`) | cfbdbced | Mọi nhánh vẽ chữ kiểu cũ (chữ nằm ngoài lòng khung), ở 9 tệp: `ui_theme`, `village`, `stage`, `hanh_trang`, `ep_do`, `chuong_ui`, `bang_vang`, `ai_ngay`, `luc_chien`. Bỏ cả tham số `cu:` không còn ai dùng. `T.chuMoi()` vẫn còn, luôn trả `true`, để mã các phiên khác đang gọi không gãy. |
| `?kynangcu=1` | 0f361b82 | `G.knQuai.on` luôn bật. Bỏ dòng hướng dẫn "Các loại quái" kiểu cũ. Con nào không có trong bảng kỹ năng riêng vẫn đánh chung theo vai như trước. |
| `?cbcu=1` (`G.CB_CU`) | 7a64dfca | Số cân bằng cũ: Hút máu, số quái các ải, mảnh san hô của Ngư Tinh. Giữ bảng `G.STAGE_K_CU` vì Độ khó 2 vẫn dùng. |
| `?chieucu=1` (`G.CHIEU_MOI`) | 6dd72edf | Thân 10 chiêu cũ: Ngư Tinh Đớp, Mưa băng nhọn, Xoáy nước; Hồ Tinh Vồ mồi, Vòng lửa ma (`js/boss.js`, nay `f: null`, thân chiêu ở `js/chieu_trum.js`); Mưa tinh thể, Bão bào tử (trùm nhỏ); Gai xoáy, Mưa bào tử, Vòng cầu lửa (tinh anh, `js/mobs.js`); hai mục cũ `cuaMua`, `namBao` trong `G.NOI_GIAN`. Tên chiêu mới ghi thẳng vào `G.MINI_SK` và `G.bossSK`. |
| `?giancu=1` (`G.NOI_GIAN_BAT`) | c472915d | Bỏ cờ ở 6 tệp. Các chỗ kiểm `G.NOI_GIAN` có hay không vẫn giữ để phòng bảng thiếu. Sửa ví dụ `LK_Q` trong `tests/node_trang.js` và `tests/balance.py`. |
| `?fxcu=1` (`G.FX_CU`) | 54125f96 | `G.huKn` không còn đọc cờ. Khi ảnh chưa tải, vẫn vẽ tạm bằng code như trước. |
| `?trumcu=1` (`G.TRUM_MOI`) | 17b27bbb | Nhịp khung và hiệu ứng trùm cũ: đổi pha 3 khung, gai băng, căn tâm (`ctLuon`), bóng chân, đạn vòng elip, vòng cột lửa vẽ code (`o.vongLua`, `o.coVe`) (`boss.js`, `fx.js`, `monster_art.js`, `sprite_custom.js`, `data.js`). Khi trùm chưa có ảnh, cái chết vẫn vẽ như cũ. |
| `?vkcu=1` (`G.VK_CU`) | 321d8cd9 | `ICON.w_*`/`ICON.s_*` (81 dòng) và hàm `blade`; giáo tre cũ của Phi Thương (`fx_he.js`); hai vũ khí bay ở làng (`drawWeapon`); khi chờ ảnh: người làng, ô mặt, sậy, áo phơi, lửa lò, khung cửi, đò, gà, cọc, nền code vẽ bằng code; em bé và mũi tên vẽ code (`sprite_custom.js`, `zed_moi.js`); bậc màu ô cũ. `README.md` đã sửa theo. |
| `?vetaycu=1` (`G.VE_TAY_MOI`) | 1831e0bf | Hiệu ứng vẽ code cũ trong trận: hạt và ô vuông chớp, bọt độc 2×2, vết cháy elip, sao choáng, quầng giận và đốm lửa vuông (`NG.veTren` nay rỗng), vòng hồi máu elip (`healFx`), tô tam giác bùa (`fx.js`, `mobs.js`, `ky_nang_quai.js`, `noi_gian.js`, `monster_art.js`, `art.js`, `fx_anh.js`). `G.huVt(mã)` nay chỉ hỏi ảnh đã sẵn sàng chưa. |
| `?quaicu=1` (`G.QUAI_CU`, mục `cu_cua`) | 958f29aa | Đường nạp tấm cũ, bảng `QUAI_MOI` (`sprite_custom.js`); `cu_cua` trong `build.py` (`RUNTIME_KEYS`, phần đếm "không tính"). **Đã xoá 30 tệp** `*-cu.sprite.json`: boHung, caChuon, caCon, caNoc, caNocChua, chonBong, cua, cuaTuong, denLong, doiThan, haiQuy, heoCon, heoNanh, hoaBaoTu, huChua, huLua, linhMa, meoDen, namPhong, namPhongChua, nhim, nhimDoc, nhimThan, oc, ongVo, socNo, sua, tieuYeu, tuongDa, tuongMa. |
| `?hethongcu=1` | (không cần commit) | Đã bỏ từ đợt 2 (13/10). Trong code chỉ còn ghi chú lịch sử. |

Đóng gói lại `game/dist` và `tools/xuong-sprite`: commit a3df0add. Kế hoạch `docs/ke-hoach/buoc-3/KE-HOACH.md` và `docs/ke-hoach/khong-pixel/KE-HOACH.md` đã ghi rằng `?kynangcu`, `?truyencu` và `?quaicu` không còn. Các báo cáo cũ trong `docs/review/**` giữ nguyên, vì đó là lịch sử.

### Hình quái vẽ tay bằng code (`monster_art.js`): giữ phần còn dùng

- Đã kiểm: **cả 36/36 quái** trong `monster_art.js` (24 quái con, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng) đều có tấm ảnh AI trong `game/art/custom`, nên trong trận thân quái là ảnh.
- Phần vẽ thân bằng code (`DEFS`, `veKhung`) **chưa xoá**, vì cờ tắt nó vẫn chạy ở hai chỗ:
  - `js/sprite_custom.js` (`noiQuai`) dùng nó trong lúc ảnh của quái chưa nạp xong.
  - Xưởng Sprite và các trang `tools/tach-*` gọi `G.monsterArt.drawCode` để so hình. Hệ cử động (Pose, mốc ra đòn, bóng) cũng nằm trong tệp này.
- Đã bỏ phần chỉ chạy khi bật `?vetaycu=1` / `?trumcu=1`: sao choáng vẽ code, đổi pha kiểu cũ, gai băng kiểu cũ, vòng cột lửa. Các nhánh `!MA._vt2` vẫn giữ, vì trang công cụ và truyện (không truyền `bao: false`) còn dùng.

### Phần cũ còn giữ có chủ đích

- `G.weaponArt` (`js/weapon_art.js`): game vẫn cần `fromWeapon` và `tipLen` để tra ảnh vũ khí và tính tầm mũi. Xưởng Sprite và `tools/tach-do` vẽ bằng nó. Chỉ bỏ những chỗ game gọi `draw` khi bật `?vkcu=1`.
- `VS.npcCode`, các hàm `ga`, `coc`, `luaKhung` và hình code dựng sẵn ở làng: `tools/tach-lang` và Xưởng Sprite dùng.
- Bảng số so sánh `KN.CU`, `CT.CU`: công cụ vẽ ảnh soát đọc. Chúng là số, không phải cờ.

## Cờ còn giữ và lý do

| Cờ / tệp | Lý do |
|---|---|
| `?authcu=1` (+ `lk_authcu`, `?authmoi=1`) | **Giữ nguyên.** Đường "cũ" (authDomain `sontinhthuytinh.firebaseapp.com` + cửa sổ phụ) chưa phải code chết: mở trong trình duyệt thường thì game vẫn đi đường này. `js/cloud.js` cũng **tự** quay về đường này (ghi `lk_authcu`) khi lần đăng nhập kiểu mới đầu tiên không trả kết quả, ví dụ Google báo `redirect_uri_mismatch`. Bỏ `?authcu` thì chủ game mất cách cứu tay một máy kẹt đăng nhập, mà không bớt được dòng code nào đáng kể. Vì không chắc là an toàn nên giữ, theo yêu cầu. |
| `?baoanh=0` | Không có trong danh sách. `tests/bt_khop.py`, `tests/bao_truoc.py` và `tests/bt_tuong.py` kiểm đường vẽ báo trước cũ qua cờ này. Chỉ bỏ cờ trùng `?btcu=1`. |
| `game/art/du-tru/ho-lua-tu-hoTinh-cu.sprite.json` | Để dành cho vùng Núi lửa, theo yêu cầu. |
| `?cloud=0` | Giữ, theo yêu cầu. Các bài Node và bot chạy bằng cờ này. |
| Cờ của tính năng đang làm: `?sukien ?soyq ?viecngay ?thanhtuu ?noisuy ?anhmuotcu ?truyentu ?cuade ?vung4 ?hudot3 ?hutrum ?huthem ?humo ?chopmo ?phatrum ?khungtrang ?epdo ?uimuot`… | Không đụng tới. Tấm `<mã>-muotcu` của `?anhmuotcu` giữ nguyên. Phần đếm "không tính" trong `build.py` nay chỉ còn tính các tấm này. |

## Dung lượng

Đo bằng `python3 game/build.py` và `LK_ANH_ROI=1 python3 game/build.py --hai-tep`. Lần "trước" dựng trên bản chép lúc đầu phiên (745ed19a). Lần "sau" dựng trên nhánh lúc cuối phiên. Trong khoảng đó các phiên khác cũng đã thêm ảnh và code: 8 tấm `-muotcu`, ảnh soát mượt, vùng 4, Sổ yêu quái… Vì vậy cột chênh lệch thô **không** phải chỉ do lần dọn này.

| Tệp / số đo | Trước | Sau | Chênh lệch thô |
|---|---|---|---|
| `dist/linh-khi.html` (một tệp) | 29 368 078 B | 28 704 831 B | −663 247 B |
| `dist/artifact.html` | 29 367 459 B | 28 704 212 B | −663 247 B |
| `dist/xuong-sprite.html` | 1 612 088 B | 1 613 565 B | +1 477 B |
| `dist/linh-khi-nhe.html` (2 tệp, ảnh rời) | 3 495 440 B (nén 1 053 KB) | 3 533 479 B (nén 1 071 KB) | +38 039 B |
| `dist/anh/` (máy chủ) | 526 ảnh, 36 528 072 B | 505 ảnh, 39 261 708 B | +2 733 636 B |
| NGƯỜI CHƠI TẢI | 15,66 MB | 15,80 MB | +0,14 MB |

Phần **chỉ do lần dọn này** (đo trên cùng một bản code, chỉ khác có hay không 30 tệp `-cu`; hoặc tính thẳng từ các commit `don-tep B`):

| Phần | Giảm |
|---|---|
| Repo: 30 tệp `*-cu.sprite.json` | **−892 753 B** (872 KB) |
| Bản một tệp (`linh-khi.html`, `artifact.html`, `xuong-sprite-thu.html`): 30 tấm không còn nhúng | ≈ **−0,89 MB** mỗi tệp (29 597 064 → 28 704 831 B) |
| Máy chủ `dist/anh/`: 30 PNG + 30 WebP của tấm cũ | **−1 246 024 B** (40 507 732 → 39 261 708 B) |
| Mã nguồn `game/js` | **−38 452 B** (≈ −12 KB sau nén, ước theo tỉ lệ nén chung của `game/js` là 0,32) |
| Người chơi tải ảnh | Không đổi. Tấm cũ vốn không được tải khi không bật `?quaicu=1`. |

## Lưu ý

- Các script dựng quái cũ (`docs/review/ke-hoach-cai-thien/quai-moi-{4-con,6-con,bien,lau}/cong-cu/dung-*.py`, `ve-soat.py`) đọc tấm `-cu` khi chạy lại. Muốn chạy lại thì lấy tệp từ lịch sử git: `git show 958f29aa~1:game/art/custom/<mã>-cu.sprite.json`. Game và công cụ không cần các tệp này.
- Các nhánh dọn khỏi `ui_theme.js`, `village.js`, `stage.js`… chỉ chạy khi bật cờ cũ, nên hình mặc định không đổi. Dù vậy, chủ game nên liếc qua màn chào, làng, bảng Hành trang và một trận trùm trong lần chơi thử tới.

## Kiểm tra

- `node --check` mọi `game/js/*.js`: đạt (kiểm sau từng commit và lúc cuối).
- `python3 game/build.py` và `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: chạy được. Người chơi tải 15,80 / 20 MB, trang nén 1,05 / 1,50 MB.
- `game/tests/cloud_save_regression.test.js`: 7/7 PASS. `su_kien`, `thanh_tuu`, `viec_ngay`, `so_yeu_quai`, `vung4`, `cam_giac_danh` đều đạt. `may_luat` bỏ qua vì thiếu thư viện, như trước.
- Bot cân bằng chạy luật game trong Node (`tests/balance.py … --node --trum`): chạy sau các cờ đổi luật (`chieucu`, `giancu`, `trumcu`, `vkcu`, `vetaycu`), đủ 15 ải. Không có lỗi trang, tỉ lệ thắng cùng mức với bản đầu phiên (26/30 so với 6/7).
- Thử **vẽ** trên canvas giả của `tests/node_trang.js`: màn chào, làng, 6 ải (có 3 trùm vùng), bot tự chơi, khoảng 16 600 lần gọi `scene.draw()`. **0 lỗi**, bằng bản đầu phiên (16 481 lần, 0 lỗi). Hạn chế: ảnh không nạp được trong Node nên chỉ thử được đường "chưa có ảnh".
- Không chơi thử bằng trình duyệt, theo yêu cầu.
