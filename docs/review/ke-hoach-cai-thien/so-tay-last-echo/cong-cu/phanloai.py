import json
r = json.load(open('ket-qua-ban-that.json'))
A='A'; C='C'; D='D'; B='B'
L = {
 'ui_theme.js:980': (A,'Lòng ô con (ô kỹ năng, cây chưởng, nhân vật, đồ…) tô màu gỗ bằng code bên trong khung ảnh gd-o-con'),
 'ui_theme.js:981': (A,'Lòng ô con tô màu riêng (o.fill) bằng code'),
 'ui_theme.js:985': (A,'Nét vàng sáng bên trong ô đang chọn (4 vạch)'),
 'ui_theme.js:989': (A,'Viền màu hệ / màu chọn quanh ô con (4 vạch) — Cây chưởng, Kỹ năng'),
 'ep_do.js:305': (A,'Ô nền tối sau số bậc vũ khí (ô vũ khí HUD trong trận, bảng Luyện)'),
 'ui_theme.js:1185': (A,'Ruột thanh có màu riêng (thanh tiến độ ô vũ khí trong trận, thanh Luyện) — không dùng ảnh gd-ruot-thanh'),
 'engine.js:677': (A,'Hộp chữ nhật tô màu (ui.rect): vạch khắc thanh máu trùm, ô dấu hệ, dải kết quả Luyện, ô gợi ý, khung bản đồ ải; một phần là nền tối bảng (được phép)'),
 'engine.js:678': (A,'Viền chữ nhật (ui.rect): ô dấu hệ trên đầu quái/thanh, dải kết quả Luyện, dòng gợi ý, khung vùng bản đồ ải'),
 'ui_theme.js:1236': (A,'Thanh máu trùm: phần "máu vừa mất" tô vàng bằng code'),
 'ui_theme.js:1237': (A,'Thanh máu trùm: vạch trắng trên phần máu vừa mất'),
 'ui_theme.js:1248': (A,'Thanh máu trùm: chớp trắng khi trúng (khi không dán được ảnh)'),
 'stage.js:1217': (A,'Thanh máu quái nhỏ: tô đỏ bằng code khi ảnh gd-mau-quai-nho không dán được (chỗ hở dự phòng)'),
 'stage.js:1218': (A,'Thanh máu quái nhỏ: vạch sáng (như trên)'),
 'room_art.js:56': (A,'Dấu vòng chấm trên sàn theo loại phòng (ringMark, 64 chấm) + dải sáng ở cửa (phần này là ánh sáng)'),
 'village_scene.js:1061': (A,'Dải nền đặc mép trên cảnh làng (sau dải chân dung)'),
 'fx_he.js:474': (D,'Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện'),
 'fx_he.js:475': (D,'Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện'),
 'fx_he.js:477': (D,'Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện'),
 'fx_he.js:478': (D,'Dựng sẵn hình vũng hệ bằng code trước khi kiểm có ảnh hu-vung-lua/hu-vung-doc — có ảnh thì không hiện'),
 'ui_theme.js:80': (A,'Bộ vẽ điểm/khối của giao diện: nút code khi không có ảnh nút đúng tông (vàng/tím/màu riêng), biểu tượng bitmap nhỏ (tài nguyên, trống đồng), vạch khắc thanh; một phần là bóng đổ (được phép)'),
 'village.js:1005': (C,'Gạch đồng hai bên chữ SPIRITBLADE ở màn chào — chỉ khi thiếu ảnh gd-bia-gach (chạy 2 lần lúc ảnh chưa giải mã)'),
 'hero_tinhlinh.js:158': (C,'Dựng Cu Tí bằng code (xương em bé) khi ảnh Cu Tí chưa giải mã xong — 1 giây đầu ở màn chào / làng; có thể loé hình code'),
 'village_scene.js:1127': (C,'Đom đóm làng bằng code — chỉ lúc ảnh hu-moi-truong-rung-domdom chưa có (lúc mở game)'),
 'weapon_art.js:266': (D,'Dựng vũ khí bằng code chỉ để tính mũi kiếm cho vệt chém — không hiện ra'),
 'village_scene.js:19': (D,'Dựng nền làng bằng code (cỏ, đường, hàng rào) lúc vào làng — bị ảnh gd-lang-nen che, không hiện; dựng 2 lần'),
 'village_scene.js:16': (B,'Vệt nước trôi trên sông, ánh đèn đò in xuống nước, nước lấp lánh (mỗi khung) + một phần dựng nền làng ngầm (không hiện)'),
 'village_scene.js:1188': (B,'Hình tròn làm mặt nạ cắt chân dung NPC (clip), không tô'),
 'village_scene.js:1130': (B,'Phủ tối cảnh làng khi mở bảng'),
 'village_scene.js:354': (B,'Tô viền tối quanh hình (source-in) lúc dựng'),
 'village_scene.js:364': (B,'Xoá canvas'),
 'village_scene.js:440': (B,'Nền trơn một màu chờ ảnh nền làng (dựng 1 lần, bị ảnh che)'),
 'village_scene.js:1295': (A,'Viền 3 nét quanh tranh bản đồ vùng (bảng Chú Lái Đò) — khung bằng code'),
 'engine.js:839': (B,'Mờ đen khi chuyển màn'),
 'engine.js:629': (B,'Xoá lớp giao diện mỗi khung'),'engine.js:766': (B,'Xoá canvas chuyển màn'),'engine.js:820': (B,'Nền đen chuyển màn'),'engine.js:838': (B,'Mờ màn chuyển cảnh'),
 'zed_moi.js:1402': (B,'Xoá canvas phụ dựng Cu Tí'),'zed_moi.js:1410': (B,'Xoá canvas phụ'),'fx_he_moi.js:110': (B,'Xoá canvas'),'fx.js:1972': (B,'Xoá canvas'),'ui_theme.js:641': (B,'Xoá canvas'),
 'do_roi.js:122': (B,'Bóng elip dưới đồ rơi (độ tối)'),'do_roi.js:126': (B,'Ánh elip dưới đồ rơi theo màu bậc (ánh sáng)'),'do_roi.js:22': (B,'Tô màu ảnh (source-in)'),
 'fx.js:2955': (B,'Chớp sáng cả màn khi trúng đòn mạnh'),
 'fx_anh.js:98': (B,'Bóng dưới bom/đá bay (mobs.js:602) + mờ đen chuyển phòng (stage.js:1168)'),
 'bia.js:119': (B,'Ánh nước lấp lánh trên ảnh bìa'),'bia.js:144': (B,'Quầng tối dịu sau chữ LINH KHÍ (dải màu)'),'bia.js:150': (B,'Quầng tối (dải màu)'),'bia.js:154': (B,'Quầng (dải màu)'),'bia.js:157': (B,'Quầng (dải màu)'),
 'village.js:556': (B,'Mặt nạ cắt (clip) ô chân dung ba bạn'),'village.js:533': (B,'Mặt nạ cắt chân dung Cu Tí'),'village.js:994': (B,'Mặt nạ cắt vệt sáng chữ logo'),
 'hanh_trang.js:57': (B,'Mặt nạ cắt vùng chữ cuộn'),'hanh_trang.js:74': (B,'Dải tối dưới chân dung (độ tối)'),'hanh_trang.js:75': (B,'Mặt nạ cắt'),
 'room_art.js:70': (B,'Mặt nạ cắt khi lát ảnh tường/sàn'),'art.js:23': (B,'Quầng sáng/tối elip trong phòng (glow)'),
 'chuong_ui.js:82': (B,'Phủ màu hệ 12% lên cột cây chưởng đang chọn'),
 'sprite_custom.js:359': (B,'Nhuộm ảnh quái (chớp trắng / đỏ) bằng source-in'),
 'bao_truoc.js:767': (B,'Cắt lát ảnh quạt báo trước (clip)'),'bao_truoc.js:671': (B,'Phủ màu lên ảnh báo trước'),
 'hinh_thai.js:87': (B,'Tô màu ảnh (source-in)'),'ui_theme.js:1002': (B,'Tô màu ảnh (source-in)'),
}
rows=[]; tot={}
for k,s in r['sites'].items():
    n=sum(s['ops'].values()); cat,desc = L.get(k,('?','CHƯA PHÂN LOẠI'))
    tot[cat]=tot.get(cat,[0,0]); tot[cat][0]+=1; tot[cat][1]+=n
    sc=[x for x in s['scenes'] if x!='boot']
    rows.append((cat,-n,k,desc,n,sc,s['main'],s['off']))
rows.sort()
print(tot)
json.dump([list(x) for x in rows], open('bang.json','w'), ensure_ascii=False)
for x in []: print(x[0],x[2],x[4],x[6],x[7],x[5][:4], x[3][:60])
