# Vùng 4 Sông sâu — Phiên 1: khung vùng 4 chạy được bằng hình tạm

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` (mục 1, mục 5 hàng "1", mục 8.1–8.3) và `QUYET-DINH.md`
(chủ game: làm code ngay bằng hình tạm; câu chưa trả lời dùng đề xuất in đậm: Q2 = A, Q7 = A, Q8 = A, Q9 = A, Q11 = A). Không chơi thử bằng trình duyệt.

## Tóm tắt

- Vùng thứ 4 **Sông sâu** (mã `song`, chỉ số 3, trùm `thuong` = Thuồng Luồng, trùm nhỏ Cá Trê) có trong bảng vùng, **20 ải chơi được từ đầu tới cuối**:
  vào ải, đánh quái, trùm nhỏ, trùm vùng, nhận thưởng, lưu, bảng vàng.
- **Cờ quay lui `?vung4=0`** (hoặc `G.VUNG4 = false` trước khi nạp): game y hệt hôm nay — đã so `js/data.js` bản cũ với bản mới ở `?vung4=0`:
  mọi bảng giống hệt, chỉ có thêm 5 tên trợ giúp (`G.VUNG4`, `G.VUNG4_MUON`, `G.SO_AI`, `G.matAi`, `G.vungVe`) chạy như cũ.
- **Hình tạm**: mọi quái / tinh anh / trùm nhỏ / trùm vùng của vùng 4 **mượn con của Hang biển** (cùng kỹ năng riêng của con đó: Cá Trê tạm là
  Cua Đá, Thuồng Luồng tạm là Ngư Tinh với bộ chiêu Ngư Tinh), phòng dựng như Hang biển. Lúc vẽ trận vùng 4, quái được **nhuộm xanh rêu**
  (`ctx.filter`, trình duyệt không hỗ trợ thì giữ màu gốc) và nền phòng **phủ màu nước đục** — để nhìn là biết vùng khác.
  Không dùng nhánh vẽ tay cũ `?vetaycu`.
- Bản lưu cũ 15 ải nạp không lỗi; bản lưu mới / bản lưu cũ có thêm **ô mảnh trùm thứ 4** (mảnh Thuồng Luồng). Nguyên liệu vẫn 3 loại (Q2 = A).

## Đã làm (theo danh sách mục 8.1)

| Tệp | Thay đổi |
|---|---|
| `js/data.js` | Cờ `G.VUNG4`. Sau cờ: `G.REGIONS` thêm vùng Sông sâu (`mat: 'Nguyên liệu'`, `matChung: true` — không có nguyên liệu riêng; `rescue: null`); `G.MOB_ART` mọi vai + `elite`, `mini`, `boss.thuong` (mượn Hang biển); `HP_RANGE [390, 520]`, `DMG_RANGE [24, 30]`; `G.STAGE_K` mob `[1,3; 3,0]` ×5, boss `[1,3; 2,3]` ×4 + `[1,3; 2,4]`; `G.STAGE_REC` + `540, 565, 595, 630, 690`; `G.DIFF2` + `[1,1; 1,15]`, `G.DIFF2_REC` + `1,33`; `G.BOSS_HP_OF.thuong = 20`; `G.ROI_MOI` (vk 45 vàng / 10 linh khí, rương 20, áo 30, áo trùm 38); `G.EP_DO.roi` (2 / 4 / 6 / 12). Trợ giúp `G.matAi(r, i)` (ải vùng 4 cho lần lượt Đá lửa, Gỗ linh, Vảy cá, Đá lửa, Gỗ linh), `G.vungVe(r)` (vùng dùng để vẽ), `G.SO_AI()`. **Số xuất phát theo mục 5, phiên 4 (cân bằng) đo lại bằng bot.** `G.LK_THUA_MAT`, `G.AI_NGAY` không đổi (Q2 = A, Q11 = A: sau cân bằng). |
| `js/engine.js` | Bản lưu mới `shards` theo số vùng; `fixSave`: mảnh trùm thêm ô thứ 4 (= 0) cho bản lưu cũ; tắt vùng 4 vẫn **giữ** ô thứ 4 đã có (không xoá dữ liệu). `mats` vẫn 3 ô. |
| `js/village.js` | Bản đồ **hai trang**: trang 1 như cũ; nút **"Sông sâu ›"** (chấm đỏ khi vùng 4 vừa mở) sang trang 2, nút "‹ Ba vùng đầu" quay lại; chọn ải đang tới tự mở đúng trang. Vòng chọn ải tính đủ 4 vùng. Độ khó 2: ba vùng đầu **giữ điều kiện cũ** (qua 15 ải = hạ Hồ Tinh), vùng 4 khó 2 mở khi hạ Thuồng Luồng (Q8 = A). Dòng thưởng ghi đúng nguyên liệu vùng cũ của ải. |
| `js/vung4.js` (mới, nạp sau `truyen.js`) | `VS.MAP2` (toạ độ 5 ải), `VS.mapArt2` (tranh Sông sâu vẽ code: sông uốn từ bến làng lên vực, lau sậy, nhà sàn, thác, bóng Thuồng Luồng, núi có sét); nhuộm hình tạm; chữ tiếng Anh tên mới. Phiên 2C thay tranh bằng ảnh (Q7 = A). |
| `js/village_scene.js` | Thanh tài nguyên thêm ô mảnh Thuồng Luồng (chỉ hiện khi đã hạ Hồ Tinh hoặc đã có mảnh). |
| `js/ui_theme.js` | Biểu tượng `shard3`; vùng không có nguyên liệu riêng không vào bảng biểu tượng chữ; thanh ảnh 9 ô vẫn chia vạch. |
| `js/hanh_trang.js` | Thẻ Tài nguyên: ô mảnh thứ 4, không có dòng nguyên liệu vùng 4. |
| `js/stage.js` | Thưởng nguyên liệu qua `G.matAi`; màu nổ theo vùng thứ 4; rương báu kẹp theo độ dài bảng; đồ rơi sau trùm (mảnh `shard3`, nguyên liệu đúng loại); nút "Sang vùng mới" ở độ khó 2 không dẫn vào vùng 4 khi chưa hạ Thuồng Luồng. |
| `js/do_roi.js` | Mảnh `shard3` hút xa, màu xanh rêu. |
| `js/mobs.js` | `clamp(region, 0, 2)` → theo số vùng (trước đây vùng 4 lặng lẽ dùng quái vùng 3). |
| `js/boss.js` | `SPEED.thuong`, khoảng đứng như Ngư Tinh; **`SK.thuong = SK.ngu`** (hình tạm, cùng đối tượng nên chiêu mới của `chieu_trum.js` cũng áp vào) — phiên 3B / 3C thay bằng bộ chiêu riêng. |
| `js/art.js`, `js/env_art.js`, `js/room_art.js` | Vẽ code dự phòng / nền / theme phòng theo `G.vungVe` (vùng 4 → Hang biển). `room_art.js`: thiếu theme thì **báo `console.warn`** thay vì lặng lẽ dùng Lâu đài. |
| `js/sprite_custom.js` | Tải theo vùng: 4 ô `moVung`; chọn vùng 4 thì tải luôn ảnh vùng mượn (Hang biển) và chờ đủ cả hai; ảnh `vung: 3` được khoá theo vùng; các kẹp `Math.min(2, …)` theo số vùng. |
| `js/nhac.js` | Vùng 4 chưa có bài riêng → dùng bài vùng mượn (Hang biển); phiên 2C thêm `B.vung3` thì tự dùng. |
| `js/truyen.js` | Đếm vùng theo số đoạn kết đang có (`VUNG.length`, vùng 4 chưa có → dừng ở 3, không chiếu gì lạ); `t.v` cho phép tới 4; lời trùm nhỏ `'mini3'`. Đoạn kết Hồ Tinh giữ nguyên. |
| `js/vk_moi.js`, `js/ep_do.js`, `js/upgrade.js` | Thưởng / đá nâng bậc kẹp theo độ dài bảng (vùng 4 dùng phần tử thứ 4); gợi ý "chơi lại ải" tính cả vùng 4. Giá / mài vẫn 3 nguyên liệu. |
| `js/cloud.js`, `js/bang_vang.js` | `BOSSES` thêm `thuong` (kỷ lục `b_thuong`); bảng vàng ngoại tuyến 4 cột trùm. **Luật Firestore cũ từ chối** (far > 15, sao > 90, `b_thuong`) → game **tự ghi lại bản cắt** (far 15, sao 90, bỏ `b_thuong`) và nhớ để lần sau ghi thẳng — bảng vàng không hỏng khi chủ game chưa dán luật. |
| `firebase/linhkhi.rules`, `firebase/firestore.rules.gop` | `b_thuong`, far ≤ 20, sao ≤ 3 × far (+45 từ 15 ải, tối đa 120 khi đủ 20), `okBoss('b_thuong', 20)`, `notSlower('b_thuong')`. Khối `linhkhi_scores` trong `.gop` chép đúng bản `linhkhi.rules` (trước đó `.gop` còn khối cũ chưa siết GĐ2). |
| `build.py` | `TRUM_VUNG` + `thuongLuong`; `VUNG_SO` / `VUNG_TEN_GD` + `song: 3`; regex `gd-(nen|cua|tt)-(…|song)-`; thứ tự tải sau; bảng dung lượng nhóm "Vùng Sông sâu". |
| `tests/vung4.test.js` (mới), `tests/may_luat.test.js` | Bài kiểm 38 điều kiện (dưới); luật bảng vàng 20 ải. |

Không đụng: ảnh / quái / trùm của 3 vùng cũ, đăng nhập Google, `?cloud=0`, Sổ yêu quái / Thành tựu / Việc hôm nay (khối của bước 2), `G.ZED_BO` (Q6 = A).

## Commit
- `8be20bdb` bảng dữ liệu vùng Sông sâu + mở rộng chỗ cứng 3 vùng (mobs, boss, nền, bản lưu mảnh trùm)
- `db542129` bản đồ hai trang (nút Sông sâu), tải ảnh vùng mượn, ô mảnh Thuồng Luồng, thưởng nguyên liệu vùng 4
- `8d7d92f6` `js/vung4.js`, nhạc / truyện / thưởng / ép đồ theo 4 vùng, bảng vàng `b_thuong` + luật Firestore 20 ải, `build.py` vùng `song`
- `cc226dd2` sửa nhạc vùng 4 (lỗi mất biến `W` do bài kiểm bắt được), tiếng Anh, `tests/vung4.test.js`, `may_luat.test.js`
- `da6f6b0f` đồ rơi sau trùm vùng 4 (mảnh `shard3`, nguyên liệu vùng cũ theo ải)
- (commit cuối) báo cáo này + dựng lại `dist`

## Cách kiểm (đã chạy)
- `node --check game/js/*.js`: sạch.
- `node game/tests/vung4.test.js` — **PASS 38 điều kiện**, hai bản game trong Node (bản thường và `?vung4=0`):
  1. bảng số 4 vùng / 20 ải; `?vung4=0` đúng 3 vùng / 15 ải, không phần tử thừa; số 15 ải cũ (stageStats thường + khó 2, khuyên dùng, rơi đồ, hình quái) **giống hệt** giữa hai bản;
  2. **bản lưu cũ 15 ải** (mảnh 3 ô, truyện `v = 3`) nạp không lỗi, phần cũ giữ nguyên, thêm ô mảnh = 0; `?vung4=0` y như cũ; bản lưu đã chơi vùng 4 nạp ở `?vung4=0` không lỗi, không mất sao / mảnh vùng 4, vẽ bản đồ + làng không lỗi;
  3. mở khoá: hạ Hồ Tinh → ải đang tới 4-1, bản đồ tự sang trang Sông sâu; độ khó 2 vùng 4 chỉ mở khi hạ Thuồng Luồng;
  4. bot (bất tử, chỉ kiểm luồng) qua ải 4-1 (29 quái) và hạ Thuồng Luồng ở 4-5: `W.region = 3`, trùm `thuong`, không NaN, +nguyên liệu vùng cũ, +3 mảnh Thuồng Luồng, kỷ lục `b.thuong`; nhạc vùng 4 chọn được bài;
  5. vẽ bản đồ 2 trang (ngày / đêm), làng, Hành trang thẻ Tài nguyên, tiếng Việt + Anh không lỗi, tên mới có tiếng Anh;
  6. bảng vàng: luật cũ từ chối → ghi lại bản cắt, lần sau ghi thẳng; luật mới nhận đủ far 20 + `b_thuong`.
- `node game/tests/cloud_save_regression.test.js` (7 PASS), `su_kien` (83), `so_yeu_quai` (41), `thanh_tuu` (35), `viec_ngay` (36), `cam_giac_danh` (15): đạt.
- `may_luat.test.js`: SKIP (máy này thiếu Java + emulator); đã thêm ca 20 ải / `b_thuong` — chạy theo hướng dẫn đầu tệp khi có emulator.
- So `js/data.js` trước phiên (commit `321d8cd9`) với bản mới ở `?vung4=0`: mọi bảng giống hệt.
- `node tools/can-bang/tinh.js` chạy không lỗi (vẫn tính 3 vùng; phiên 4 mở rộng).
- `python3 game/build.py`: một tệp **27,37 / 30 MB**. `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: **người chơi tải 15,80 / 20 MB** (phiên 1 không thêm ảnh nào; mã mới ~10 KB chưa nén, chủ yếu `js/vung4.js`). Nhóm "Vùng Sông sâu" chưa có ảnh nên chưa hiện trong bảng.

## Việc chủ game cần làm
1. **Dán luật Firestore mới** (để bảng vàng nhận đủ 20 ải và thời gian hạ Thuồng Luồng): Firebase console → Firestore → Rules → thay khối
   `match /linhkhi_scores/{uid} { … }` bằng khối cùng tên trong `game/firebase/linhkhi.rules` (hoặc dán toàn bộ `game/firebase/firestore.rules.gop`) → Publish.
   **Chưa dán cũng không hỏng gì**: game tự ghi bản vừa luật cũ (người chơi vùng 4 hiện "xa nhất 15 ải", không có cột Thuồng Luồng trên mây).
   Lưu ý: khối trong `.gop` nay là bản đã siết ở GĐ2 (khách ẩn danh không ghi bảng vàng, Sức mạnh ≤ 1.500…) — đúng như `linhkhi.rules` vẫn ghi.
2. Không cần làm gì khác để thử: vào bản đồ Chú Lái Đò, hạ Hồ Tinh thì có nút **"Sông sâu ›"**. Muốn tắt hẳn: thêm `?vung4=0`.

## Còn để các phiên sau (đã chừa chỗ)
- **2A / 3A / 3B**: quái, tinh anh, Cá Trê, Thuồng Luồng thật → thay mã trong `G.MOB_ART` (vùng 4), `SK.thuong` riêng, rồi đặt `G.VUNG4_MUON = null`
  (hết nhuộm màu, hết tải ảnh Hang biển khi chọn vùng 4, `G.vungVe(3)` = 3). Ảnh quái `vung: 'song'`, ảnh nền `gd-*-song-*` đã được `build.py` xếp vào nhóm vùng 4.
- **2B**: theme phòng `song` (thêm vào `THEMES` của `room_art.js`, `TH` của `env_art.js`), luật dòng chảy… (`?dongchay=0`).
- **2C**: ảnh bản đồ mới (thay `VS.mapArt2` / toạ độ `VS.MAP2` ở `js/vung4.js`), `MO_VUNG` / `VUNG[3]` / `KET` vùng 4 (truyện tự đếm tới vùng 4 khi có `VUNG[3]`), lời `TRUM.thuong` / `mini3`, câu người làng mốc 4, nhạc `B.vung3` / `trum3`.
- **4 (cân bằng)**: mọi số vùng 4 ở trên là số xuất phát; `tests/cay.py`, `cd_lib.py`, `campaign.py`… và `tools/can-bang/tinh.js` vẫn cứng 15 ải / 3 vùng (đúng kế hoạch: phiên 4 mở rộng khi đo). Ải ngày bậc 4 (Q11).
- Biết trước, chưa sửa (ngoài phạm vi phiên 1): quái vùng 4 đang mượn mã Hang biển nên **Sổ yêu quái / Việc hôm nay đếm chúng như quái Hang biển**;
  thành tựu "Trọn sao" (45 sao) đếm tổng sao nên có thể đạt bằng sao vùng 4 — khối Thành tựu của bước 2, để phiên sau quyết.
