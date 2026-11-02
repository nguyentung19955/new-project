KK = 'Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords'
def P(desc, task): return 'This strip shows consecutive frames of a 2D side-view pixel-art animation of ' + desc + '. The creature faces LEFT. ' + task
item(so='020', ten='kk-chemkhong-2', tieu_de='Kiếm Khách – chém xoay: khung xoay thứ 2 giữa F3–F4', uu_tien='P1', dir='art/kiem-khach/chemkhong', vitri='cap[0..2].clip.chemkhong',
  cells=[3, None, 4], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F3 gốc (giữa F3 và F4). Làm SAU 003.',
  dang='"F2→F3→F4 xoay nhảy ảnh. Thêm 1 khung xoay giữa F2–F3 (và F3–F4 nếu cần)." (đo IoU F3→F4 = 0,39)',
  prompt='This strip shows consecutive frames of a 2D side-view pixel-art mid-air spinning sword slash of ' + KK + '. Draw ONLY the missing in-between frame for the middle empty dashed cell: the body rotated halfway between the left and right frames, swords and circular cyan trail continuing smoothly. Same body centre position.',
  ra=['moi-01.png'], thu_tu='(sau 003) F0 F1 F2 moi(003) F3 **moi-01** F4 F5 F6 (9 khung)',
  ms='50, 50, 45, 33, 45, 33, 50, 65, 70 (441 ms)', su_kien='so_hinh 8→9; trung [2,3,4,5]→[2,3,4,5,6].')
item(so='021', ten='kk-trungdon', tieu_de='Kiếm Khách – trúng đòn: VẼ LẠI F2 và F4', uu_tien='P1', dir='art/kiem-khach/trungdon', vitri='clip.trungdon',
  cells=[1, None, 3, None, 5], viec='Vẽ **2 khung** `thay-02`, `thay-04`, THAY F2 và F4 (đang gần trùng F1, F3).',
  dang='"Chưa mượt: F1≈F2 mất nhịp va chạm, F3≈F4 dừng giữa phản ứng. Vẽ lại F2 (ngực bật lùi, tóc văng) và F4 (hạ hông, đầu hồi); khoá chân F5–F6."',
  prompt='This strip shows consecutive frames of a 2D side-view pixel-art hurt reaction of ' + KK + '. Draw ONLY the 2 empty dashed cells: cell 2 = chest snapping backward from the hit, hair whipping; cell 4 = hips lowering, head coming back forward (recovering). Feet stay planted at "+".',
  ra=['thay-02.png', 'thay-04.png'], thu_tu='F0 F1 **thay-02** F3 **thay-04** F5 (6 khung)', ms='33, 33, 50, 50, 67, 67 (giữ)', su_kien='số khung giữ 6. Lớp sức mạnh có thư mục trungdon → phiên lắp tự đặt lại lớp cho 2 khung thay.')
item(so='022', ten='chuong-chet', tieu_de='Chuông Kén Nứt – chết: 1 khung chạm đất giữa F6–F7', uu_tien='P1', loai='q', q='chuong', st='chet',
  cells=[6, None, 7], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F6.',
  dang='"Diễn biến tốt nhưng F6→F7 rơi xuống đất như dịch chuyển. Thêm 1 khung chạm đất (vỏ ép thấp, tua xoè)."',
  prompt=P('the Cracked Cocoon Bell (elite floating cracked bell-cocoon with tendrils)', 'Draw ONLY the missing in-between frame for the middle empty dashed cell: the moment of hitting the ground - shell squashed low, tendrils splayed out.'),
  ra=['moi-01.png'], thu_tu='F0 … F6 **moi-01** F7 F8 (10 khung)', ms='100, 100, 90, 90, 85, 85, 75, 60, 110, 180', su_kien='chuong.hinh.chet: so_hinh 9→10.')
item(so='023', ten='cau-chet', tieu_de='Khuyết Cẩu – chết: 1 khung gục giữa F5–F6', uu_tien='P1', loai='q', q='cau', st='chet',
  cells=[5, None, 6], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F5.',
  dang='"F1–F4 đứng chờ lâu, F5→F6 gục nhanh; khuỵu sớm hơn; thêm 1 khung nếu F5→F6 giật."',
  prompt=P('the Hollow Hound (bony skull-headed hound with branches on its back)', 'Draw ONLY the missing in-between frame for the middle empty dashed cell: legs buckling, body halfway collapsing between the left and right frames. Feet on the ground line "+".'),
  ra=['moi-01.png'], thu_tu='F0 … F5 **moi-01** F6 F7 F8 (10 khung)', ms='67, 67, 67, 83, 83, 83, 67, 100, 117, 150', su_kien='cau.hinh.chet: so_hinh 9→10.')
item(so='024', ten='ken-chet', tieu_de='Kèn Câm – chết: 1 khung khuỵu gối giữa F5–F6', uu_tien='P1', loai='q', q='ken', st='chet',
  cells=[5, None, 6], viec='Vẽ **1 khung mới** `moi-01`, chèn SAU F5.',
  dang='"Đầu clip giữ lâu, ngã F5→F6 quá nhanh; trượt chân 9%; giữ khung cuối; cần thì thêm khung khuỵu gối giữa F5–F6."',
  prompt=P('the Mute Horn (thin root-wood figure with a long brass horn and hanging banner)', 'Draw ONLY the missing in-between frame for the middle empty dashed cell: knees buckling, body halfway falling, horn dropping - between the left and right frames. Feet stay at "+".'),
  ra=['moi-01.png'], thu_tu='F0 … F5 **moi-01** F6 F7 F8 (10 khung)', ms='67, 67, 67, 83, 83, 83, 67, 100, 117, 150', su_kien='ken.hinh.chet: so_hinh 9→10.')
item(so='025', ten='phu-chet', tieu_de='Phu Đèn Lạc – chết: VẼ LẠI F7 (chống tay)', uu_tien='P1', loai='q', q='phu', st='chet',
  cells=[6, None, 8], viec='Vẽ **1 khung** `thay-07`, THAY F7.',
  dang='"Đoạn ngã F8–F9 nằm xuống đột ngột, trượt chân 8,8%. Thêm/sửa dáng chống tay ở F7; giữ khung cuối."',
  prompt=P('the Lost Lampbearer (hunched lantern-carrying wanderer)', 'Draw ONLY the frame for the middle empty dashed cell: falling and catching himself with one hand on the ground, halfway between the left and right frames. Feet at "+".'),
  ra=['thay-07.png'], thu_tu='F0 … F6 **thay-07** F8 (9 khung)', ms='83, 83, 83, 100, 100, 117, 117, 117, 100', su_kien='số khung giữ.')
