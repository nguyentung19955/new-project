# Báo cáo Luồng A – Code gameplay Vùng 1 (Đợt 1 MVP)

## Đã làm
- **Trò chơi nhiều phòng**: mở `game/vung-1/index.html`. Có màn bắt đầu (Tiếp tục / Chơi mới). Đi chạm mép phòng ở chỗ có cửa → màn tối chuyển cảnh → sang phòng mới, đứng đúng ở cửa tương ứng. Camera tự cuộn khi phòng to hơn màn hình.
- **Định dạng phòng** cho luồng B: `DINH-DANG-PHONG.md` (đã đẩy sớm). Game tự dùng `ban-do.json` + `phong/<ID>.json` của luồng B nếu có; chưa có thì dùng 3 phòng thử ở `phong-thu/` (T1 có Chuông Lưu + hốc tường nứt + sàn mỏng + dây leo, T2 tinh anh + tường giả + cửa khoá, T3 trùm).
- **Ô đặc biệt** (sửa engine `dong-co-mn.js`, phòng demo vẫn chạy): `=` sàn mỏng (↓ + Nhảy để rơi xuống), `N` tường nứt (chém 3 nhát thì vỡ, lộ hốc, nhớ vĩnh viễn), `G` tường giả (đi xuyên, mờ đi khi đứng trong).
- **Ô tạm**: đá rễ tông nâu đỏ tối vẽ bằng code, rễ rủ dưới trần, dây leo, sàn mỏng; nền xa/giữa lấy từ `art/phong-demo`; bóng tối + đèn (`den`), ánh quanh Chuông Lưu và vật phẩm như phòng demo.
- **Mảnh Âm**: rơi khi giết quái (bay về nhân vật) + nhặt trên sàn. Nghỉ ở chuông = **gửi** Mảnh Âm (an toàn).
- **Nhiệm vụ "Ba tiếng chuông lạc"**: nhặt 3 Chuông Vỡ → cửa có `khoa` mở ngay + thưởng 120 Mảnh Âm. Cửa khoá vẽ song rễ, chạm vào báo còn thiếu bao nhiêu.
- **Chuông Lưu** (đứng gần, nhấn ↑ hoặc nút "Nghỉ ở Chuông"): hồi đầy máu + lượt hồi, lưu game, quái sống lại, gửi Mảnh Âm; menu mua **Sinh lực +1** (80 Mảnh Âm, 1 cấp).
- **Chết**: về Chuông Lưu gần nhất (đã nghỉ lần cuối); mất 30% Mảnh Âm **chưa gửi**, rơi thành túi ở chỗ ngã, quay lại nhặt được. Chết lần nữa trước khi nhặt thì túi cũ mất.
- **Lưu/tải**: localStorage khoá `tvcc-vung1`, có `phien_ban: 1`, bọc try/catch (không lưu được thì vẫn chơi, có báo). Giữ: vật phẩm đã nhặt, phòng đã vào, tường đã vỡ, tinh anh đã hạ, trùm, túi, nâng cấp.
- **HUD**: máu (ô trắng), lượt hồi (chấm xanh), Mảnh Âm, 3 biểu tượng Chuông Vỡ, Lõi Vọng Tàn; tên phòng khi vào; thanh máu tinh anh/trùm ở dưới.
- **Bản đồ nhỏ** (phím M / nút "Bản đồ"): phòng đã vào, phòng kề hiện dấu "?", vị trí nhân vật, chuông, cửa khoá, trùm, túi rơi. Mở bản đồ thì game dừng.
- **Hồi máu**: đổi sang **lượt hồi** (mặc định 2 lượt, mỗi lượt +2 máu, nạp lại ở chuông; Hạt Vọng +1 lượt).
- **Tinh anh Vọng Tàn**: vào phòng `tinh_anh` → rễ khép cửa; đập chuông tạo **sóng đất** chạy 2 phía dọc sàn (nhảy né). Dưới 50% máu: **nhịp giả** (giơ chuông, dấu "!" xám, vòng xám đứt nét, không sóng) rồi **nhịp thật** ngay sau. Thắng → mở cửa, rơi **Lõi Vọng Tàn** + 60 Mảnh Âm, không hồi sinh nữa.
- **Trùm "Mẫu Chuông Rỗng"** (phòng `trum: true`): hình tạm vẽ canvas (~2.5× nhân vật: áo đá, chuông ngực thủng, mặt nạ không mắt, tay rễ). Thức dậy khi cửa khép. **Gõ Không Tiếng**: báo 0.5 s (tay giơ, chuông ngực loé, "!") → sóng câm chạy 2 phía sát sàn, nhảy né. **Mưa Mặt Nạ**: vạch cam + bóng trên sàn báo 0.5 s → mặt nạ rơi, nảy 1 lần rồi vỡ. **Chuyển pha ở 50%**: bất tử ~1.7 s, mặt nạ nứt đỏ; pha 2: sóng đôi, 6 mặt nạ, nghỉ ngắn hơn. Thắng → màn **"Hết Vùng 1"** (thời gian, số lần ngã).
- **Nút cảm ứng** (điện thoại xoay ngang): cần trái có mũi tên ← → ↑ ↓ (↑ bám/leo dây, nghỉ chuông; ↓ đập đất/xuống sàn mỏng), nút phải Chém / Nhảy / Lướt / Hồi, nút "Bản đồ" góc trên, nút "Nghỉ ở Chuông" hiện khi đứng gần chuông. Bán trong suốt, đa chạm.

## Phím chơi (máy tính)
← → (A D) đi · Z / Space nhảy (2 lần = nhảy đôi) · X chém (trên không ↓+X = đập đất) · C / Shift lướt · V hồi máu · ↑ bám dây / nghỉ ở chuông · ↓ + Z rơi qua sàn mỏng · M bản đồ · Enter/Z chọn trong menu.
Thêm cho người thử: `?moi=1` xoá bản lưu, `?phong=T3` vào thẳng phòng, `?thu=1` ép dùng phòng thử, `?hitbox=1` hiện hộp va chạm.

## Giả định đã tự quyết (theo kế hoạch)
- Chuông Vỡ ở P03/P06/P09 như đề bài Đợt 1 (kế hoạch gốc ghi P03/P08/P10). Code không gắn cứng phòng – luồng B đặt ở đâu cũng được.
- Trùm 300 máu (~30 nhát cấp 1), tinh anh dùng 150 máu từ `quai.json`. Nâng cấp máu giá 80. Mất 30% Mảnh Âm *chưa gửi*.
- Quái chết thì nằm yên tới khi nghỉ chuông hoặc ngã (không hồi sinh sau 4 giây như phòng demo).
- Rơi xuống đáy phòng không có cửa: mất 1 máu, đưa về chỗ an toàn.
- Tạo 3 phòng thử thay vì 2 (cần thêm phòng trùm để thử trọn vòng).

## Còn thiếu / để đợt sau
- Phòng thật P01–P12 (luồng B). Chưa có `cua_dau` → game mới bắt đầu ở `bat_dau` / chuông của phòng đầu.
- Kỹ năng/khoá kỹ năng (Bật Tường, lướt xuyên khe gió), Bản Khắc chiêu, bùa, nhiệm vụ B–E, kho đồ 3 tab, dịch chuyển giữa chuông, tuỳ chọn âm lượng/rung/cỡ nút. Chưa có âm thanh.
- Skill trùm 3–4 (Khâu Miệng Hầm, Đảo Nhịp) và pha 3; Vọng Tàn chưa có "quét chuông hình cung" và "gọi 2 Chuông Gác".
- Thẻ tên (`the_ten`) đã nhặt được và lưu, nhưng chưa có nhật ký.

## Cần hình (luồng C) – theo ID
- **Trùm** `trum.json` → thư mục `art/trum-vung-1/<id>/f00.png…` (quay TRÁI, 1 điểm ảnh = 2 px logic, cao ~120 điểm ảnh): `dung` 6 · `go` 6 (khung 3 = chạm sàn) · `tha_mat_na` 6 · `chuyen_pha` 8 · `trung` 3 · `chet` 10. Điền `thu_muc` trong `trum.json` là game tự dùng, không cần sửa code.
- **FX**: sóng câm sát sàn (dải ~15×20 điểm ảnh, 4–6 khung), mặt nạ rơi (15×15, vài khung xoay + mảnh vỡ), vòng sóng; sóng đất Vọng Tàn.
- **Ô/tile**: đá vách, mặt sàn, trần có rễ rủ, sàn mỏng `=`, tường nứt `N` (3 mức nứt), song rễ cửa khoá, dây leo `H` (16×16 điểm cảnh).
- **Đồ vật**: Chuông Lưu (tắt/sáng), icon Mảnh Âm, Chuông Vỡ, Hạt Vọng, Mặt Nạ Sinh Lực, Thẻ Tên, Lõi Vọng Tàn, túi Mảnh Âm rơi.
- **UI**: ô máu, chấm lượt hồi, khung bản đồ.
