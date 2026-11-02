END = ' The creature faces LEFT.'
def P(desc, task): return 'This strip shows consecutive frames of a 2D side-view pixel-art animation of ' + desc + '.' + END + ' ' + task
BO='the Rotbark Beetle (dark bark-shelled six-legged horned beetle with old-bronze/amber markings)'
DOI='the Root Bat (bat made of dark roots and bark)'
NAM='the Breathing Shroom (grey-blue mushroom creature with a breathing cap)'
CHUONG='the Cracked Cocoon Bell (elite floating cracked bell-cocoon with tendrils, ash-violet and brick-red)'
CAU='the Hollow Hound (bony skull-headed hound with branches growing on its back)'
TAN='the Ruin Echo (elite: bird-skull creature carrying a huge bronze bell on its back, magenta-purple root tendrils)'
VAI='the Cloth Wraith (floating ragged cloth ghost with a mask)'
KEN='the Mute Horn (thin root-wood figure holding a long brass horn with a hanging banner)'
TANG='the Mourning Veil (bird-skull veil creature hanging from a ceiling branch)'

item(so='013', ten='cau-danh', tieu_de='Khuyết Cẩu – đánh: VẼ LẠI F3 và F7', uu_tien='P0', loai='q', q='cau', st='danh',
  cells=[2, None, 4, 6, None, 8], viec='Vẽ **2 khung** `thay-03` (thay F3) và `thay-07` (thay F7). Giữ F4–F6 (há mõm/nhả cầu).',
  dang='"Chưa đạt: chân trượt 15,4% – trông như bước tới cắn chứ không phải đứng há mõm bắn. Khoá chân trụ; F3 hạ cổ tích năng lượng, F4–F5 há mõm, F6 nhả cầu, F7 giật lùi, F8–F9 hồi."',
  chi_tiet=['thay-03: hạ cổ thấp tích năng lượng, mõm còn khép/hé – 4 chân đứng yên đúng chỗ các khung khác.', 'thay-07: giật lùi sau khi nhả cầu – đầu hất lên-ra sau, thân dồn về sau, chân không đổi chỗ.'],
  prompt=P(CAU, 'Draw ONLY the 2 empty dashed cells: cell 2 = head and neck lowered, charging energy, jaw still closed or barely open; cell 5 = recoil right after spitting the energy orb - head tossed up and back, weight shifted back. All four feet stay exactly where they are in the other frames (no stepping).'),
  ra=['thay-03.png', 'thay-07.png'], thu_tu='F0 F1 F2 **thay-03** F4 F5 F6 **thay-07** F8 (9 khung)',
  ms='67, 83, 100, 67, 50, 50, 67, 83, 100 (667 ms, bộ ChatGPT)', su_kien='số khung giữ 9; chieu.khung_ban giữ 4.')
item(so='014', ten='tan-di', tieu_de='Vọng Tàn – di: VẼ LẠI F0 (khung chuyển trọng lượng sai)', uu_tien='P0', loai='q', q='tan', st='di',
  cells=[8, None, 1], viec='Vẽ **1 khung** `thay-00`, THAY F0 (F0 hiện co cụm khác hẳn F1–F8 nên vòng lặp F8→F0→F1 nhảy).',
  dang='"Lỗi nặng nhất nhóm: trôi chân 22,4%, đáy nhấp nhô 18,8% – như vừa bước vừa nhảy. Căn lại từng khung theo chân/rễ chạm đất; 2 pha chống chân rõ, chuông đung đưa nặng; sửa/vẽ lại khung chuyển trọng lượng sai."',
  chi_tiet=['Dáng bước nằm giữa F8 và F1 (cùng chiều cao thân, chuông lệch nhẹ theo quán tính), chân/rễ chạm đất ở vạch +.'],
  prompt=P(TAN, 'This is a looping walk: left = last frame, right = second frame. Draw ONLY the missing frame for the middle empty dashed cell: the walking pose halfway between them, same body height, the heavy bell lagging slightly behind the body, feet/roots planted on the ground line "+".'),
  ra=['thay-00.png'], thu_tu='**thay-00** F1 … F8 (9 khung, lặp)', ms='9 × 117 ms (bộ ChatGPT)', su_kien='tan.hinh.di: ms 117.')
item(so='015', ten='tan-danh', tieu_de='Vọng Tàn – đánh: 1 khung chuông giữa đường F4–F5', uu_tien='P0', loai='q', q='tan', st='danh',
  cells=[4, None, 5], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F4.',
  dang='"Đọc được ý nhưng thiếu lực, không có khung va chạm sắc. Chọn đúng khung chuông chạm đất làm impact; khoá chân; thêm khung chuông giữa đường nếu F4→F5 gắt." (đo IoU F4→F5 = 0,59, thấp nhất clip)',
  prompt=P(TAN, 'Draw ONLY the missing in-between frame for the middle empty dashed cell: the huge bell halfway down in its slam, body bending forward, tendrils trailing behind - between the raised pose on the left and the bell-on-ground impact on the right. Feet stay planted.'),
  ra=['moi-01.png'], thu_tu='F0 … F4 **moi-01** F5 … F8 (10 khung)',
  ms='133, 117, 100, 83, 50, 33, 67, 100, 117, 133 (933 ms; bộ ChatGPT + 33 ms khung giữa đường)',
  su_kien='so_hinh 9→10; khung_trung [5,6]→[6,7]; chieu.chan_dong 5→6 (sóng ra đúng khung chuông chạm đất).')
item(so='016', ten='vai-chet', tieu_de='Hồn Vải – chết: 1 khung giữa F6–F7', uu_tien='P0', loai='q', q='vai', st='chet',
  cells=[6, None, 7], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F6.',
  dang='"Rơi đột ngột F6→F7 (IoU 0,24, cao giảm 73%) – teleport 1 khung. Thêm 1 khung giữa F6→F7 (thân lưng chừng, mặt nạ nghiêng, vải gập)."',
  prompt=P(VAI, 'Draw ONLY the missing in-between frame for the middle empty dashed cell: the wraith halfway down, mask tilted, cloth folding and crumpling - between the floating pose on the left and the collapsed heap on the right.'),
  ra=['moi-01.png'], thu_tu='F0 … F6 **moi-01** F7 F8 (10 khung)',
  ms='90, 90, 85, 85, 80, 80, 80, 80, 110, 160 (940 ms; bộ ChatGPT + 80 ms khung giữa)', su_kien='vai.hinh.chet: so_hinh 9→10.')
item(so='017', ten='ken-danh', tieu_de='Kèn Câm – đánh: 1 khung nâng kèn giữa F5–F6', uu_tien='P0', loai='q', q='ken', st='danh',
  cells=[5, None, 6], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F5.',
  dang='"Chuẩn bị quá lâu, lúc bắn chỉ 70ms; đường nâng kèn F4→F6 chưa liền. Khoá chân; nếu F4→F5/F5→F6 giật thì thêm 1 khung nâng kèn." (đo IoU F4→F5 = 0,93, F5→F6 = 0,59 → chèn giữa F5–F6)',
  prompt=P(KEN, 'Draw ONLY the missing in-between frame for the middle empty dashed cell: the horn halfway along its raise between the left and right frames, banner swinging along, body and feet unchanged.'),
  ra=['moi-01.png'], thu_tu='F0 … F5 **moi-01** F6 F7 F8 (10 khung)',
  ms='67, 83, 100, 83, 67, 67, 50, 50, 83, 100 (750 ms; bộ ChatGPT + 50 ms khung nâng kèn)', su_kien='so_hinh 9→10; chieu.khung_ban 6→7.')
item(so='018', ten='tang-chet', tieu_de='Màn Tang – chết: 2 khung đang rơi giữa F3–F4', uu_tien='P0', loai='q', q='tang', st='chet',
  cells=[3, None, None, 4], viec='Vẽ **2 khung mới** `moi-01`, `moi-02`, chèn SAU F3.',
  dang='"Lỗi nặng: F3→F4 IoU 0,15 – từ treo nhảy thẳng xuống nằm bẹp. Thêm tư thế đang rơi giữa không trung; tốt nhất tách tuột → rơi → chạm đất."',
  chi_tiet=['moi-01: vừa tuột khỏi cành, đang rơi giữa không trung (thân nghiêng ~45°, vải bay lên).', 'moi-02: sắp chạm đất (thân gần nằm ngang, vải chùng), ngay trên mặt đất.'],
  prompt=P(TANG, 'Left = tearing loose from its branch, right = lying on the floor. Draw ONLY the 2 missing frames for the 2 empty dashed cells: cell 2 = falling in mid-air, body tilted about 45 degrees, veil cloth fluttering upward; cell 3 = just above the floor, body almost horizontal, cloth slackening.'),
  ra=['moi-01.png', 'moi-02.png'], thu_tu='F0 … F3 **moi-01** **moi-02** F4 … F8 (11 khung)',
  ms='67, 67, 67, 83, 50, 50, 100, 117, 117, 133, 133 (984 ms; bộ ChatGPT + 2×50 ms khung rơi)', su_kien='tang.hinh.chet: so_hinh 9→11.')
item(so='019', ten='tang-danh', tieu_de='Màn Tang – vồ: 1 khung lao nửa đường giữa F6–F7', uu_tien='P0', loai='q', q='tang', st='danh',
  cells=[6, None, 7], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F6.',
  dang='"Giật F6→F7 (IoU 0,36). Thêm 1 khung lao nửa đường giữa F6–F7." Treo trần: khoá điểm treo.',
  prompt=P(TANG, 'Draw ONLY the missing in-between frame for the middle empty dashed cell: the lunge halfway between the left and right frames. The hanging point on the ceiling branch stays fixed.'),
  ra=['moi-01.png'], thu_tu='F0 … F6 **moi-01** F7 F8 (10 khung)',
  ms='100, 100, 100, 83, 67, 50, 50, 33, 83, 117 (783 ms; bộ ChatGPT + 33 ms khung lao)', su_kien='so_hinh 9→10; khung_trung [6,7,8]→[6,7,8,9].')
