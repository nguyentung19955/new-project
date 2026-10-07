#!/usr/bin/env python3
"""Cắt cả thư mục ảnh AI vừa gen (theo docs/PROMPT-CAN-GEN.txt) thành bộ ảnh game — chạy trên máy người dùng.

  Windows: bấm đúp tools/cat-anh.bat (hoặc kéo thư mục ảnh thả vào file .bat)
  python cat_anh.py [thư mục ảnh] [thư mục ra]
        mặc định đọc  D:\\ảnh game   ghi ra  <thư mục ảnh>\\da-cat\\  (cùng cấu trúc assets/ của game)
        + da-cat\\bao-cao.html (xem trước từng khung, báo ảnh lỗi) + da-cat.zip (gửi cho Claude)
  python cat_anh.py [thư mục ảnh] [thư mục ra] --toi-da 20     mỗi zip tối đa 20 MB (quá thì chia -phan-1, -phan-2…)
  python cat_anh.py --ghep <da-cat.zip …| thư mục da-cat>     (chạy trong repo game; nhận nhiều phần một lần)
        chép assets/ vào game và ghi số khung vào PACK_FRAMES (js/render.js)

Tự nhận loại ảnh theo tên file (thaymo.png → tướng 4×3, trieuda.png → boss 3×3, trung-kim.png → dải hiệu ứng,
icon-<mã>.png → 4 icon kỹ năng …); tên lệch như "Thaymo (1).PNG", "thaymo.png.png" vẫn đoán được.
Cắt giống hệt tools/cat-sheet.py · cat-fx.py · cat-icons.py (cùng thuật toán, cùng cỡ khung, cùng tên file);
thêm: ảnh AI trả về sai cỡ / lệch lề → dò lưới theo vùng không-hồng-tím rồi mới cắt.
Bản chạy trong trình duyệt, không cần cài gì: tools/cat-anh.html.
"""
import io, json, os, re, shutil, subprocess, sys, unicodedata, zipfile

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass


def can_thu_vien():
    """Thiếu Pillow / numpy / scipy → tự pip install."""
    try:
        import PIL, numpy, scipy  # noqa: F401
        return
    except ImportError:
        pass
    print('Đang cài thư viện Pillow, numpy, scipy (chỉ lần đầu)…')
    cmd = [sys.executable, '-m', 'pip', 'install', '--user', 'pillow', 'numpy', 'scipy']
    if os.environ.get('VIRTUAL_ENV'): cmd.remove('--user')
    subprocess.check_call(cmd)


if __name__ == '__main__': can_thu_vien()
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = 400_000_000   # ảnh AI gốc rất to (vài nghìn px) vẫn mở được

MAC_DINH_VAO = 'D:\\ảnh game'

# DANH-SACH (sinh bằng node tools/build-cat-anh.js — đừng sửa tay)
DANH_SACH = json.loads(r"""{"023feeefd6":["tex",{"file":"tiles/duong-gach.jpg","side":512},"Kết cấu đường · gạch thành"],"03d58d7cc9":["tex",{"file":"tiles/duong-de.jpg","side":512},"Kết cấu đường · bờ ruộng (đê)"],"09f34132ac":["chua","dan-6","6 đạn / vũ khí nhỏ (giáo, khiên, đĩa, lông, sét, hũ lửa)"],"0cebb78997":["vat",{"dir":"","size":128,"files":["do-ghep_cung-mat-chim.png","do-ghep_bua-chim-lac.png","do-ghep_ao-vay-ca.png","do-ghep_ngoc-tran-thuy.png"]},"Đồ ghép 3 (lưới 2×2: cung, bùa chim Lạc, áo vảy cá, ngọc trấn thủy)"],"127e45df08":["bo","ảnh gần như đen hết, không rõ dùng làm gì","Ảnh đen"],"1589d52fc1":["chua","khung-doc-3","3 khung dọc tối viền hồng"],"1752e1cb34":["vat",{"dir":"ui","size":64,"files":["ic-cham.png","ic-choang.png","ic-dot.png","ic-doc.png","ic-dong-bang.png"]},"Icon nhỏ · trạng thái 1"],"1aa24dfe2f":["vat",{"dir":"tiles","size":128,"files":["cong-phong-chau.png","cong-ban-rung.png","cong-hang.png",null,"cong-lang-tre.png","cong-co-loa.png"]},"Cổng thành (lưới 3×2, 6 công trình — ô 4 thừa, bỏ; xem lại thứ tự)"],"227bcc1df2":["vat",{"dir":"ui","size":64,"files":["ic-mau.png","ic-chi-mang.png","ic-tam-danh.png","ic-hoi-chieu.png","ic-nang-luong.png"]},"Icon nhỏ · chỉ số 2"],"3099f5076c":["chua","nut-nha-4","4 nút (nhà · làm lại · cuộn giấy · đồng xu)"],"31a7b41eb1":["chua","thap-6","6 tháp (giống thap-phong-thu)"],"3b41972ae4":["bo","trùng dáng Hà Bá (đã có haba_pose01..04)","Hà Bá một dáng"],"3fc810885d":["chua","tui-lua-ngoc-trong","Túi đỏ · thúng gạo · ngọc xanh · trống gỗ (chưa có tấm nào trong game khớp)"],"517a6cf10e":["chua","huy-chuong-4","4 huy chương (đồng · bạc · vàng · khoá) — khác tấm ui-huy-chuong (vàng · bạc · đồng · vương miện)"],"6973ee4fba":["chua","o-dong-6","6 ô đồng vuông"],"75f39d6a3b":["tex",{"file":"tiles/duong-nuoc.jpg","side":512},"Kết cấu đường · nước"],"7b5e50b411":["vat",{"dir":"ui","size":64,"files":["ic-boss.png","ic-cam-lang.png","ic-tinh-anh.png","ic-lan.png"]},"Icon nhỏ · trạng thái 3 (lưới 2×2)"],"827e7b7475":["tex",{"file":"tiles/duong-dat.jpg","side":512},"Kết cấu đường · đất rừng"],"895024fdac":["vat",{"dir":"tiles","size":128,"files":["de-tuong-thuong.png","de-tuong-san-sang.png","de-tuong-chon.png","de-tuong-ngap.png","de-tuong-nui.png"]},"Đế đặt tướng · 5 trạng thái"],"8c8c8789a5":["chua","nut-dieu-khien","4 nút đồng tròn (dừng · chạy · cài đặt · …)"],"8cb488889a":["vat",{"dir":"ui","size":64,"files":["ic-tui-vang.png","ic-diem-ky-nang.png","ic-diem-an-phu.png","ic-luc-chien.png","ic-cap-do.png"]},"Icon nhỏ · tiền tệ"],"8de72839c9":["vat",{"dir":"ui","size":64,"files":["ic-suc-manh.png","ic-nhanh-nhen.png","ic-tri-tue.png","ic-giam-sat-thuong.png","ic-xuyen-giap.png"]},"Icon nhỏ · chỉ số 3"],"8e58465bb8":["chua","dia-tron-4","4 đĩa tròn (cộng · nhân đôi · dấu tích · khoá)"],"932f9e5416":["chua","hieu-ung-6","6 icon hiệu ứng (sét, nước, lửa, lá, vàng, tím)"],"9adfb4d954":["bo","trùng dáng Hà Bá nổi giận (đã có haba_pose04)","Hà Bá nổi giận"],"9d1879c378":["vat",{"dir":"ui","size":64,"files":["ic-sa-lay.png","ic-khien.png","ic-hoi-mau.png","ic-noi-gian.png","ic-bay.png"]},"Icon nhỏ · trạng thái 2"],"a8e4c60527":["vat",{"dir":"","size":128,"files":["do-ghep_giap-dong-bat-diet.png","do-ghep_luoi-hai-chi-tu.png","do-ghep_mui-sung-pha-giap.png","do-ghep_riu-quet-song.png"]},"Đồ ghép 2 (lưới 2×2: giáp đồng, lưỡi hái, mũi sừng, rìu sóng)"],"adf118847c":["chua","vong-sang-4","4 vòng sáng / tia sáng"],"adv":["hero12","adv","An Dương Vương"],"afterimage":["dai","afterimage","Hiệu ứng · afterimage"],"antiem":["hero12","antiem","Mai An Tiêm"],"anvuong":["boss9","anvuong","Boss · Quỷ Vương Ân"],"auco":["hero12","auco","Âu Cơ"],"b21143d0d9":["vat",{"dir":"ui","size":64,"files":["ic-hanh-moc.png","ic-hanh-hoa.png","ic-hanh-tho.png","ic-hanh-kim.png","ic-hanh-thuy.png"]},"Icon nhỏ · ngũ hành (AI vẽ theo thứ tự Mộc · Hỏa · Thổ · Kim · Thủy)"],"baahoa":["hero12","baahoa","Bà Hỏa"],"c1ce972fa3":["chua","the-4","4 thẻ dọc (mặt trời · vòng · vòng vàng · khoá)"],"c3244b848f":["tex",{"file":"tiles/duong-da.jpg","side":512},"Kết cấu đường · đá lát hang"],"c3c4a1f249":["vat",{"dir":"ui","size":64,"files":["ic-kho.png","ic-nuoc-dang.png","ic-khac-che.png","ic-nang-cap.png","ic-xuyen-phep.png"]},"Icon nhỏ · khác"],"camap":["enemy6","camap","Quái · Cá Mập Yêu"],"camapden":["enemy6","camapden","Quái · Cá Mập Bóng Đêm"],"cao":["enemy6","cao","Quái · Cáo Con"],"caolo":["hero12","caolo","Cao Lỗ"],"caong":["hero12","caong","Thần Cá Ông"],"casau":["enemy6","casau","Quái · Cá Sấu"],"cdt":["hero12","cdt","Chử Đồng Tử"],"ce75d53ffa":["tex",{"file":"tiles/duong-cat.jpg","side":512},"Kết cấu đường · cát biển"],"chanlua":["enemy6","chanlua","Quái · Chằn Lửa"],"chantinh":["boss9","chantinh","Boss · Chằn Tinh"],"chantrau":["hero12","chantrau","Trẻ Chăn Trâu"],"chet-boss":["dai","chet-boss","Boss chết (nổ lớn + cột sáng)"],"chet-quai":["dai","chet-quai","Quái chết (khói tan)"],"chimbao":["enemy6","chimbao","Quái · Chim Bão"],"chodo":["hero12","chodo","Chàng Chèo Đò"],"chuongdong":["hero12","chuongdong","Thầy Chuông Đồng"],"clean-button-disabled":["chua","nut","Nút chữ nhật · khoá mờ (1 vật)"],"clean-button-hover":["chua","nut","Nút chữ nhật · rê chuột (1 vật)"],"clean-button-locked":["chua","nut","Nút chữ nhật · có khoá (1 vật)"],"clean-button-normal":["chua","nut","Nút chữ nhật · thường (1 vật)"],"clean-button-pressed":["chua","nut","Nút chữ nhật · nhấn (1 vật)"],"clean-button-selected":["chua","nut","Nút chữ nhật · đang chọn (1 vật)"],"clean-tower-ballista":["chua","thap","Tháp nỏ lớn (1 vật)"],"clean-tower-bamboo":["chua","thap","Tháp tre (1 vật)"],"clean-tower-bunker":["chua","thap","Tháp lô cốt (1 vật)"],"clean-tower-drum":["chua","thap","Tháp trống (1 vật)"],"clean-tower-elephant":["chua","thap","Tháp voi đá (1 vật)"],"clean-tower-pagoda":["chua","thap","Tháp chùa (1 vật)"],"coins":["dai","coins","Hiệu ứng · coins"],"cua":["enemy6","cua","Quái · Cua Khổng Lồ"],"cungan":["enemy6","cungan","Quái · Sói Cung Thủ"],"cungtlua":["enemy6","cungtlua","Quái · Sói Cung Lửa"],"cuoi":["hero12","cuoi","Chú Cuội"],"dacon":["enemy6","dacon","Quái · Đá Con"],"daibang":["boss9","daibang","Boss · Đại Bàng Tinh"],"dan-1":["hatmau",["dan_fireball","dan_frostbolt","dan_arrow","dan_bolt","dan_orb"],"Hạt hiệu ứng · dan_fireball, dan_frostbolt, dan_arrow, dan_bolt, dan_orb"],"dan-2":["hatmau",["dan_feather","dan_petal","dan_melon","dan_rice","dan_evil"],"Hạt hiệu ứng · dan_feather, dan_petal, dan_melon, dan_rice, dan_evil"],"dan-he":["hatmau",["dan-kim","dan-moc","dan-thuy","dan-hoa","dan-tho"],"Đạn bay theo hệ (5 ô: Kim · Mộc · Thủy · Hỏa · Thổ)"],"dan-tan-cong":["chua","dan-tan-cong","Đạn tấn công (6 vật)"],"dapde":["hero12","dapde","Người Đắp Đê"],"dd6a584e29":["vat",{"dir":"","size":128,"files":["do-ghep_trong-dong.png","do-ghep_song-riu-cuong-no.png","do-ghep_gay-tam-gioi.png","do-ghep_gay-thoi-khong.png"]},"Đồ ghép 1 (có chữ nhỏ dưới icon — tự bỏ)"],"denroi":["hero12","denroi","Cô Thả Đèn Trời"],"doi":["enemy6","doi","Quái · Dơi Hang"],"doima":["enemy6","doima","Quái · Dơi Ma"],"dotnuong":["hero12","dotnuong","Chàng Đốt Nương"],"dust":["dai","dust","Hiệu ứng · dust"],"e4a5ee3b81":["vat",{"dir":"ui","size":64,"files":["ic-giap.png","ic-khang-phep.png","ic-toc-chay.png","ic-toc-danh.png","ic-sat-thuong.png"]},"Icon nhỏ · chỉ số 1"],"e5e26c252d":["chua","cho-4","4 vật (sạp chợ · hồ lô · hộp · đèn lồng)"],"ec8ea89215":["chua","o-hong-3","3 ô vuông hồng (ô 3 có khoá)"],"echme":["enemy6","echme","Quái · Ếch Mẹ"],"f185e43ba1":["vat",{"dir":"tiles","size":128,"files":["de-tuong-co.png","de-tuong-dat.png","de-tuong-da.png","de-tuong-cat.png","de-tuong-gach.png"]},"Đế đặt tướng · theo chủ đề (cỏ · gốc cây · đá hang · cát · gạch)"],"f2ddbbe18d":["chua","sao-4","4 ngôi sao (rỗng · đồng · vàng · đỏ)"],"f7577582d3":["khung",{"dir":"ui","max":160,"files":["ai-mo.png","ai-chon.png","ai-khoa.png"]},"Huy hiệu ải · mở / đang chọn / khoá"],"fb0899a136":["chua","phan-thuong-4","4 phần thưởng (túi · xu · rương · rương lớn)"],"fbfb56ed7f":["chua","khung-the-4","4 khung thẻ dọc ruột tím"],"fire-burst":["dai","fire-burst","Hiệu ứng · fire-burst"],"fire-pillar":["dai","fire-pillar","Hiệu ứng · fire-pillar"],"flood-rise":["dai","flood-rise","Hiệu ứng · flood-rise"],"freeze":["dai","freeze","Hiệu ứng · freeze"],"giaodong":["hero12","giaodong","Dũng Sĩ Giáo Đồng"],"giaolong":["enemy6","giaolong","Quái · Giao Long Con"],"giong":["hero12","giong","Thánh Gióng"],"haba":["boss9","haba","Boss · Hà Bá"],"haisen":["hero12","haisen","Cô Hái Sen"],"halong":["hero12","halong","Rồng Mẹ Hạ Long"],"hat-1":["hat",["circle_02","circle_03","circle_05","light_03"],"Hạt hiệu ứng · circle_02, circle_03, circle_05, light_03"],"hat-2":["hat",["magic_01","magic_02","magic_03","magic_05"],"Hạt hiệu ứng · magic_01, magic_02, magic_03, magic_05"],"hat-3":["hat",["fire_01","fire_02","flame_05","flame_06"],"Hạt hiệu ứng · fire_01, fire_02, flame_05, flame_06"],"hat-4":["hat",["muzzle_02","scorch_01","scorch_02","dirt_01"],"Hạt hiệu ứng · muzzle_02, scorch_01, scorch_02, dirt_01"],"hat-5":["hat",["smoke_03","smoke_07","smoke_09","flare_01"],"Hạt hiệu ứng · smoke_03, smoke_07, smoke_09, flare_01"],"hat-6":["hat",["slash_01","slash_03","scratch_01","trace_05"],"Hạt hiệu ứng · slash_01, slash_03, scratch_01, trace_05"],"hat-7":["hat",["spark_01","spark_06","twirl_01","twirl_02"],"Hạt hiệu ứng · spark_01, spark_06, twirl_01, twirl_02"],"hat-8":["hat",["star_04","star_06","star_08","star_09"],"Hạt hiệu ứng · star_04, star_06, star_08, star_09"],"heal":["dai","heal","Hiệu ứng · heal"],"hieu-ung-chien-dau":["chua","hieu-ung-chien-dau","Hiệu ứng chiến đấu (6 icon)"],"hieu-ung_binh-gom":["don","hieu-ung_binh-gom","Hiệu ứng · hieu-ung_binh-gom"],"hieu-ung_chai":["don","hieu-ung_chai","Hiệu ứng · hieu-ung_chai"],"hieu-ung_da-lan":["don","hieu-ung_da-lan","Hiệu ứng · hieu-ung_da-lan"],"hieu-ung_den-troi":["don","hieu-ung_den-troi","Hiệu ứng · hieu-ung_den-troi"],"hieu-ung_dua-hau":["don","hieu-ung_dua-hau","Hiệu ứng · hieu-ung_dua-hau"],"hit-spark":["dai","hit-spark","Hiệu ứng · hit-spark"],"hoden":["enemy6","hoden","Quái · Hồ Ly Bóng Đêm"],"hook":["dai","hook","Hiệu ứng · hook"],"hotinh":["boss9","hotinh","Boss · Hồ Tinh Chín Đuôi"],"ice-ring":["dai","ice-ring","Hiệu ứng · ice-ring"],"icon-adv":["icon4","adv","Icon kỹ năng · An Dương Vương"],"icon-antiem":["icon4","antiem","Icon kỹ năng · Mai An Tiêm"],"icon-auco":["icon4","auco","Icon kỹ năng · Âu Cơ"],"icon-baahoa":["icon4","baahoa","Icon kỹ năng · Bà Hỏa"],"icon-caolo":["icon4","caolo","Icon kỹ năng · Cao Lỗ"],"icon-caong":["icon4","caong","Icon kỹ năng · Thần Cá Ông"],"icon-cdt":["icon4","cdt","Icon kỹ năng · Chử Đồng Tử"],"icon-chantrau":["icon4","chantrau","Icon kỹ năng · Trẻ Chăn Trâu"],"icon-chodo":["icon4","chodo","Icon kỹ năng · Chàng Chèo Đò"],"icon-chuongdong":["icon4","chuongdong","Icon kỹ năng · Thầy Chuông Đồng"],"icon-cuoi":["icon4","cuoi","Icon kỹ năng · Chú Cuội"],"icon-dapde":["icon4","dapde","Icon kỹ năng · Người Đắp Đê"],"icon-denroi":["icon4","denroi","Icon kỹ năng · Cô Thả Đèn Trời"],"icon-dotnuong":["icon4","dotnuong","Icon kỹ năng · Chàng Đốt Nương"],"icon-giaodong":["icon4","giaodong","Icon kỹ năng · Dũng Sĩ Giáo Đồng"],"icon-giong":["icon4","giong","Icon kỹ năng · Thánh Gióng"],"icon-haisen":["icon4","haisen","Icon kỹ năng · Cô Hái Sen"],"icon-halong":["icon4","halong","Icon kỹ năng · Rồng Mẹ Hạ Long"],"icon-kimquy":["icon4","kimquy","Icon kỹ năng · Thần Kim Quy"],"icon-kinhduong":["icon4","kinhduong","Icon kỹ năng · Kinh Dương Vương"],"icon-kylan":["icon4","kylan","Icon kỹ năng · Kỳ Lân Vàng"],"icon-lachau":["icon4","lachau","Icon kỹ năng · Lạc Hầu"],"icon-lactuong":["icon4","lactuong","Icon kỹ năng · Lạc Tướng"],"icon-langlieu":["icon4","langlieu","Icon kỹ năng · Lang Liêu"],"icon-llq":["icon4","llq","Icon kỹ năng · Lạc Long Quân"],"icon-longnu":["icon4","longnu","Icon kỹ năng · Long Nữ Động Đình"],"icon-lucsi":["icon4","lucsi","Icon kỹ năng · Lực Sĩ Núi"],"icon-lyngu":["icon4","lyngu","Icon kỹ năng · Lý Ngư Tướng Quân"],"icon-matroi":["icon4","matroi","Icon kỹ năng · Nữ Thần Mặt Trời"],"icon-mau":["icon4","mau","Icon kỹ năng · Mẫu Thượng Ngàn"],"icon-maudia":["icon4","maudia","Icon kỹ năng · Mẫu Địa"],"icon-mauthoai":["icon4","mauthoai","Icon kỹ năng · Mẫu Thoải"],"icon-melua":["icon4","melua","Icon kỹ năng · Mẹ Lúa"],"icon-mychau":["icon4","mychau","Icon kỹ năng · Mỵ Châu"],"icon-nghedong":["icon4","nghedong","Icon kỹ năng · Nghê Đồng"],"icon-nguphu":["icon4","nguphu","Icon kỹ năng · Ngư Phủ Sông Đà"],"icon-ongdung":["icon4","ongdung","Icon kỹ năng · Ông Đùng"],"icon-ongho":["icon4","ongho","Icon kỹ năng · Chúa Sơn Lâm"],"icon-ongtao":["icon4","ongtao","Icon kỹ năng · Ông Táo"],"icon-ongthoi":["icon4","ongthoi","Icon kỹ năng · Thợ Săn Ống Thổi"],"icon-potaoapui":["icon4","potaoapui","Icon kỹ năng · Vua Lửa Pơtao Apui"],"icon-sodua":["icon4","sodua","Icon kỹ năng · Sọ Dừa"],"icon-tanvien":["icon4","tanvien","Icon kỹ năng · Sơn Tinh"],"icon-thachsanh":["icon4","thachsanh","Icon kỹ năng · Thạch Sanh"],"icon-thansan":["icon4","thansan","Icon kỹ năng · Thần Săn Ba Vì"],"icon-thansuong":["icon4","thansuong","Icon kỹ năng · Thần Sương Núi"],"icon-thaylang":["icon4","thaylang","Icon kỹ năng · Thầy Lang Lá Thuốc"],"icon-thaymo":["icon4","thaymo","Icon kỹ năng · Thầy Mo Lửa"],"icon-thienloi":["icon4","thienloi","Icon kỹ năng · Thiên Lôi"],"icon-thocong":["icon4","thocong","Icon kỹ năng · Thổ Công"],"icon-thogom":["icon4","thogom","Icon kỹ năng · Thợ Gốm Phù Lãng"],"icon-thoren":["icon4","thoren","Icon kỹ năng · Thợ Rèn Đông Sơn"],"icon-thosan":["icon4","thosan","Icon kỹ năng · Thợ Săn Rừng"],"icon-tiendung":["icon4","tiendung","Icon kỹ năng · Tiên Dung"],"icon-tre":["icon4","tre","Icon kỹ năng · Dũng Sĩ Tre Làng"],"icon-trongdong":["icon4","trongdong","Icon kỹ năng · Thần Trống Đồng"],"icon-truongchi":["icon4","truongchi","Icon kỹ năng · Trương Chi"],"icon-trutroi":["icon4","trutroi","Icon kỹ năng · Thần Trụ Trời"],"icon-viemde":["icon4","viemde","Icon kỹ năng · Viêm Đế Thần Nông"],"icon-xathu":["icon4","xathu","Icon kỹ năng · Xạ Thủ Văn Lang"],"kimquy":["hero12","kimquy","Thần Kim Quy"],"kinhduong":["hero12","kinhduong","Kinh Dương Vương"],"kybinh":["enemy6","kybinh","Quái · Quỷ Cưỡi Lợn"],"kylan":["hero12","kylan","Kỳ Lân Vàng"],"lachau":["hero12","lachau","Lạc Hầu"],"lactuong":["hero12","lactuong","Lạc Tướng"],"langlieu":["hero12","langlieu","Lang Liêu"],"lightning":["dai","lightning","Hiệu ứng · lightning"],"linhan":["enemy6","linhan","Quái · Quỷ Giáo"],"llq":["hero12","llq","Lạc Long Quân"],"longnu":["hero12","longnu","Long Nữ Động Đình"],"lucsi":["hero12","lucsi","Lực Sĩ Núi"],"lyngu":["hero12","lyngu","Lý Ngư Tướng Quân"],"mark":["dai","mark","Hiệu ứng · mark"],"matroi":["hero12","matroi","Nữ Thần Mặt Trời"],"mau":["hero12","mau","Mẫu Thượng Ngàn"],"maudia":["hero12","maudia","Mẫu Địa"],"mauthoai":["hero12","mauthoai","Mẫu Thoải"],"melua":["hero12","melua","Mẹ Lúa"],"meteor":["dai","meteor","Hiệu ứng · meteor"],"mountain-rise":["dai","mountain-rise","Hiệu ứng · mountain-rise"],"muc":["enemy6","muc","Quái · Mực Tinh"],"mucdoc":["enemy6","mucdoc","Quái · Mực Độc"],"music-notes":["dai","music-notes","Hiệu ứng · music-notes"],"mychau":["hero12","mychau","Mỵ Châu"],"nghedong":["hero12","nghedong","Nghê Đồng"],"nguphu":["hero12","nguphu","Ngư Phủ Sông Đà"],"ngutinh":["boss9","ngutinh","Boss · Ngư Tinh"],"no-hoa":["dai","no-hoa","Vụ nổ hệ Hỏa (đạn nổ lan)"],"no-kim":["dai","no-kim","Vụ nổ hệ Kim (đạn nổ lan)"],"no-moc":["dai","no-moc","Vụ nổ hệ Mộc (đạn nổ lan)"],"no-tho":["dai","no-tho","Vụ nổ hệ Thổ (đạn nổ lan)"],"no-thuy":["dai","no-thuy","Vụ nổ hệ Thủy (đạn nổ lan)"],"nongnoc":["enemy6","nongnoc","Quái · Nòng Nọc"],"ongdung":["hero12","ongdung","Ông Đùng"],"ongho":["hero12","ongho","Chúa Sơn Lâm"],"ongtao":["hero12","ongtao","Ông Táo"],"ongthoi":["hero12","ongthoi","Thợ Săn Ống Thổi"],"phuthuy":["enemy6","phuthuy","Quái · Sứa Tinh"],"potaoapui":["hero12","potaoapui","Vua Lửa Pơtao Apui"],"rain":["dai","rain","Hiệu ứng · rain"],"ran":["enemy6","ran","Quái · Rắn Độc"],"ranbang":["enemy6","ranbang","Quái · Rắn Băng"],"revive":["dai","revive","Hiệu ứng · revive"],"ring":["dai","ring","Hiệu ứng · ring"],"rocks":["dai","rocks","Hiệu ứng · rocks"],"rua":["enemy6","rua","Quái · Rùa Giáp"],"shield-gold":["dai","shield-gold","Hiệu ứng · shield-gold"],"slash-gold":["dai","slash-gold","Hiệu ứng · slash-gold"],"sodua":["hero12","sodua","Sọ Dừa"],"spawn-ring":["dai","spawn-ring","Hiệu ứng · spawn-ring"],"streak":["dai","streak","Hiệu ứng · streak"],"sweep":["dai","sweep","Hiệu ứng · sweep"],"tanvien":["hero12","tanvien","Sơn Tinh"],"thachsanh":["hero12","thachsanh","Thạch Sanh"],"thachtinh":["enemy6","thachtinh","Quái · Thạch Tinh"],"thachvang":["enemy6","thachvang","Quái · Thạch Tinh Vàng"],"than-khi-adv":["tk3","adv","Thần Khí · An Dương Vương"],"than-khi-antiem":["tk3","antiem","Thần Khí · Mai An Tiêm"],"than-khi-auco":["tk3","auco","Thần Khí · Âu Cơ"],"than-khi-baahoa":["tk3","baahoa","Thần Khí · Bà Hỏa"],"than-khi-caolo":["tk3","caolo","Thần Khí · Cao Lỗ"],"than-khi-caong":["tk3","caong","Thần Khí · Thần Cá Ông"],"than-khi-cdt":["tk3","cdt","Thần Khí · Chử Đồng Tử"],"than-khi-chantrau":["tk3","chantrau","Thần Khí · Trẻ Chăn Trâu"],"than-khi-chodo":["tk3","chodo","Thần Khí · Chàng Chèo Đò"],"than-khi-chuongdong":["tk3","chuongdong","Thần Khí · Thầy Chuông Đồng"],"than-khi-cuoi":["tk3","cuoi","Thần Khí · Chú Cuội"],"than-khi-dapde":["tk3","dapde","Thần Khí · Người Đắp Đê"],"than-khi-denroi":["tk3","denroi","Thần Khí · Cô Thả Đèn Trời"],"than-khi-dotnuong":["tk3","dotnuong","Thần Khí · Chàng Đốt Nương"],"than-khi-giaodong":["tk3","giaodong","Thần Khí · Dũng Sĩ Giáo Đồng"],"than-khi-giong":["tk3","giong","Thần Khí · Thánh Gióng"],"than-khi-haisen":["tk3","haisen","Thần Khí · Cô Hái Sen"],"than-khi-halong":["tk3","halong","Thần Khí · Rồng Mẹ Hạ Long"],"than-khi-kimquy":["tk3","kimquy","Thần Khí · Thần Kim Quy"],"than-khi-kinhduong":["tk3","kinhduong","Thần Khí · Kinh Dương Vương"],"than-khi-kylan":["tk3","kylan","Thần Khí · Kỳ Lân Vàng"],"than-khi-lachau":["tk3","lachau","Thần Khí · Lạc Hầu"],"than-khi-lactuong":["tk3","lactuong","Thần Khí · Lạc Tướng"],"than-khi-langlieu":["tk3","langlieu","Thần Khí · Lang Liêu"],"than-khi-llq":["tk3","llq","Thần Khí · Lạc Long Quân"],"than-khi-longnu":["tk3","longnu","Thần Khí · Long Nữ Động Đình"],"than-khi-lucsi":["tk3","lucsi","Thần Khí · Lực Sĩ Núi"],"than-khi-lyngu":["tk3","lyngu","Thần Khí · Lý Ngư Tướng Quân"],"than-khi-matroi":["tk3","matroi","Thần Khí · Nữ Thần Mặt Trời"],"than-khi-mau":["tk3","mau","Thần Khí · Mẫu Thượng Ngàn"],"than-khi-maudia":["tk3","maudia","Thần Khí · Mẫu Địa"],"than-khi-mauthoai":["tk3","mauthoai","Thần Khí · Mẫu Thoải"],"than-khi-melua":["tk3","melua","Thần Khí · Mẹ Lúa"],"than-khi-mychau":["tk3","mychau","Thần Khí · Mỵ Châu"],"than-khi-nghedong":["tk3","nghedong","Thần Khí · Nghê Đồng"],"than-khi-nguphu":["tk3","nguphu","Thần Khí · Ngư Phủ Sông Đà"],"than-khi-ongdung":["tk3","ongdung","Thần Khí · Ông Đùng"],"than-khi-ongho":["tk3","ongho","Thần Khí · Chúa Sơn Lâm"],"than-khi-ongtao":["tk3","ongtao","Thần Khí · Ông Táo"],"than-khi-ongthoi":["tk3","ongthoi","Thần Khí · Thợ Săn Ống Thổi"],"than-khi-potaoapui":["tk3","potaoapui","Thần Khí · Vua Lửa Pơtao Apui"],"than-khi-sodua":["tk3","sodua","Thần Khí · Sọ Dừa"],"than-khi-tanvien":["tk3","tanvien","Thần Khí · Sơn Tinh"],"than-khi-thachsanh":["tk3","thachsanh","Thần Khí · Thạch Sanh"],"than-khi-thansan":["tk3","thansan","Thần Khí · Thần Săn Ba Vì"],"than-khi-thansuong":["tk3","thansuong","Thần Khí · Thần Sương Núi"],"than-khi-thaylang":["tk3","thaylang","Thần Khí · Thầy Lang Lá Thuốc"],"than-khi-thaymo":["tk3","thaymo","Thần Khí · Thầy Mo Lửa"],"than-khi-thienloi":["tk3","thienloi","Thần Khí · Thiên Lôi"],"than-khi-thocong":["tk3","thocong","Thần Khí · Thổ Công"],"than-khi-thogom":["tk3","thogom","Thần Khí · Thợ Gốm Phù Lãng"],"than-khi-thoren":["tk3","thoren","Thần Khí · Thợ Rèn Đông Sơn"],"than-khi-thosan":["tk3","thosan","Thần Khí · Thợ Săn Rừng"],"than-khi-tiendung":["tk3","tiendung","Thần Khí · Tiên Dung"],"than-khi-tre":["tk3","tre","Thần Khí · Dũng Sĩ Tre Làng"],"than-khi-trongdong":["tk3","trongdong","Thần Khí · Thần Trống Đồng"],"than-khi-truongchi":["tk3","truongchi","Thần Khí · Trương Chi"],"than-khi-trutroi":["tk3","trutroi","Thần Khí · Thần Trụ Trời"],"than-khi-viemde":["tk3","viemde","Thần Khí · Viêm Đế Thần Nông"],"than-khi-xathu":["tk3","xathu","Thần Khí · Xạ Thủ Văn Lang"],"thansan":["hero12","thansan","Thần Săn Ba Vì"],"thansuong":["hero12","thansuong","Thần Sương Núi"],"thap-phong-thu":["chua","thap-phong-thu","Tháp phòng thủ (6 tháp)"],"thaylang":["hero12","thaylang","Thầy Lang Lá Thuốc"],"thaymo":["hero12","thaymo","Thầy Mo Lửa"],"thienloi":["hero12","thienloi","Thiên Lôi"],"thietky":["enemy6","thietky","Quái · Lợn Giáp Sắt"],"thocong":["hero12","thocong","Thổ Công"],"thogom":["hero12","thogom","Thợ Gốm Phù Lãng"],"thoren":["hero12","thoren","Thợ Rèn Đông Sơn"],"thosan":["hero12","thosan","Thợ Săn Rừng"],"thuongluong":["boss9","thuongluong","Boss · Thuồng Luồng"],"thuytinh":["boss9","thuytinh","Boss · Thủy Tinh"],"tiendung":["hero12","tiendung","Tiên Dung"],"tom":["enemy6","tom","Quái · Tôm Binh"],"tomlua":["enemy6","tomlua","Quái · Tôm Lửa"],"tre":["hero12","tre","Dũng Sĩ Tre Làng"],"trieu-hoi_cay-da-than":["don","trieu-hoi_cay-da-than","Hiệu ứng · trieu-hoi_cay-da-than"],"trieu-hoi_chim-lac":["don","trieu-hoi_chim-lac","Hiệu ứng · trieu-hoi_chim-lac"],"trieu-hoi_chim-than":["don","trieu-hoi_chim-than","Hiệu ứng · trieu-hoi_chim-than"],"trieu-hoi_giong-bay":["don","trieu-hoi_giong-bay","Hiệu ứng · trieu-hoi_giong-bay"],"trieu-hoi_ho-ba-vi":["don","trieu-hoi_ho-ba-vi","Hiệu ứng · trieu-hoi_ho-ba-vi"],"trieu-hoi_lac-tu":["don","trieu-hoi_lac-tu","Hiệu ứng · trieu-hoi_lac-tu"],"trieu-hoi_ngua-sat":["don","trieu-hoi_ngua-sat","Hiệu ứng · trieu-hoi_ngua-sat"],"trieuda":["boss9","trieuda","Boss · Hổ Vương Triệu Đà"],"trongdong":["hero12","trongdong","Thần Trống Đồng"],"trung-hoa":["dai","trung-hoa","Trúng đòn hệ Hỏa (đạn chạm quái)"],"trung-kim":["dai","trung-kim","Trúng đòn hệ Kim (đạn chạm quái)"],"trung-moc":["dai","trung-moc","Trúng đòn hệ Mộc (đạn chạm quái)"],"trung-tho":["dai","trung-tho","Trúng đòn hệ Thổ (đạn chạm quái)"],"trung-thuy":["dai","trung-thuy","Trúng đòn hệ Thủy (đạn chạm quái)"],"truongchi":["hero12","truongchi","Trương Chi"],"trutroi":["hero12","trutroi","Thần Trụ Trời"],"tuongthuy":["enemy6","tuongthuy","Quái · Tướng Thủy Quân"],"ui-trang-thai-nut":["chua","ui-trang-thai-nut","Nút trạng thái (1 hàng nút đồng)"],"viemde":["hero12","viemde","Viêm Đế Thần Nông"],"voichien":["enemy6","voichien","Quái · Voi Chiến"],"volley":["dai","volley","Hiệu ứng · volley"],"vong-chieu-hoa":["dai","vong-chieu-hoa","Vòng chiêu / hào quang hệ Hỏa (dưới chân tướng khi tung chiêu)"],"vong-chieu-kim":["dai","vong-chieu-kim","Vòng chiêu / hào quang hệ Kim (dưới chân tướng khi tung chiêu)"],"vong-chieu-moc":["dai","vong-chieu-moc","Vòng chiêu / hào quang hệ Mộc (dưới chân tướng khi tung chiêu)"],"vong-chieu-tho":["dai","vong-chieu-tho","Vòng chiêu / hào quang hệ Thổ (dưới chân tướng khi tung chiêu)"],"vong-chieu-thuy":["dai","vong-chieu-thuy","Vòng chiêu / hào quang hệ Thủy (dưới chân tướng khi tung chiêu)"],"vortex":["dai","vortex","Hiệu ứng · vortex"],"warn":["dai","warn","Hiệu ứng · warn"],"water-wave":["dai","water-wave","Hiệu ứng · water-wave"],"xathu":["hero12","xathu","Xạ Thủ Văn Lang"],"yeutinh":["enemy6","yeutinh","Quái · Yêu Tinh Rừng"]}""")
# HET-DANH-SACH

# ───────────── lõi cắt: chép nguyên từ tools/cat-sheet.py (giữ y hệt để ảnh ra giống) ─────────────
NAMES = {'hero': (3, 2, ['idle', 'wind', 'strike', 'cast', 'front', 'head']),
         'enemy': (3, 1, ['walk1', 'walk2', 'attack']),
         'boss': (2, 2, ['idle', 'attack', 'skill', 'rage']),
         'boss4': (2, 2, ['walk1', 'walk2', 'attack', 'rage']),
         'hero12': (4, 3, ['idle_1', 'idle_2', 'idle_3', 'head', 'attack_1', 'attack_2', 'attack_3', 'attack_4', 'cast_1', 'cast_2', 'cast_3', 'hurt']),
         'enemy6': (3, 2, ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'attack_1', 'attack_2']),
         'boss9': (3, 3, ['walk_1', 'walk_2', 'walk_3', 'walk_4', 'attack_1', 'attack_2', 'attack_3', 'rage_1', 'rage_2'])}
ALIAS = {'hero12': {'idle': 'idle_1', 'front': 'idle_1', 'wind': 'attack_2', 'strike': 'attack_3', 'cast': 'cast_2'},
         'enemy6': {'walk1': 'walk_1', 'walk2': 'walk_3', 'attack': 'attack_2'},
         'boss9': {'idle': 'walk_1', 'walk1': 'walk_1', 'walk2': 'walk_3', 'attack': 'attack_2', 'skill': 'attack_3', 'rage': 'rage_1'}}


def frame_counts(names):
    """Số khung từng động tác (như register_frames của cat-sheet.py)."""
    cnt = {}
    for n in names:
        if n == 'head': continue
        if '_' not in n: cnt[n] = 1; continue
        a = n.rsplit('_', 1)[0]
        while f'{a}_{cnt.get(a, 0) + 1}' in names: cnt[a] = cnt.get(a, 0) + 1
    return cnt


def key_magenta(im):
    if is_pink(border_color(im)): return key_pink(im)
    a = np.asarray(im.convert('RGBA')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)
    bg = d < 120
    mask = Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    edge = (np.asarray(mask) > 0) & ~bg
    m = np.minimum(r, b) - g
    alpha = a[..., 3].astype(np.float64)
    k = np.clip((m - 20) / 150.0, 0, 1)
    alpha = np.where(edge, alpha * (1 - k), alpha)
    alpha[bg] = 0
    ex = np.clip(m, 0, None)
    nr = np.where(edge, np.clip(r - ex, 0, 255), r)
    nb = np.where(edge, np.clip(b - ex, 0, 255), b)
    rim = edge & (nr > 150) & (nb > g + 8)
    nb = np.where(rim, g, nb)
    out = np.stack([nr, g, nb, alpha.round()], -1).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def border_color(im):
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    e = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return np.median(e, axis=0)


def is_pink(c):
    r, g, b = c
    return r > 150 and g < 120 and b > 60 and r > b + 40 and b > g + 20


def key_pink(im):
    a = np.asarray(im.convert('RGB')).astype(np.float64)
    c = border_color(im).astype(np.float64)
    s = (a @ c) / (c @ c)
    res = np.sqrt(((a - s[..., None] * c) ** 2).sum(-1))
    loose = (res < 34) & (s > 0.55) & (s < 1.18)
    strict = (res < 18) & (s > 0.75) & (s < 1.12)
    lab, _ = ndimage.label(loose)
    edge_ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge_ids[edge_ids > 0]) | strict
    n = lab.max()
    if n:
        sizes = ndimage.sum(loose, lab, range(1, n + 1)); mres = ndimage.mean(res, lab, range(1, n + 1))
        big = [i + 1 for i in range(n) if sizes[i] >= 3e-4 * loose.size and mres[i] < 22]
        bg |= np.isin(lab, big)
    near = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    band = near & ~bg
    k = np.clip((res - 14) / 60.0, 0, 1)
    alpha = np.where(bg, 0.0, np.where(band, np.maximum(k, 0.0), 1.0))
    alpha = np.where(band & (k < 0.25), 0.0, alpha)
    sc = np.clip(s, 0.5, 1.2)[..., None] * c
    al = np.maximum(alpha, 1e-3)[..., None]
    fix = np.clip((a - (1 - alpha[..., None]) * sc) / al, 0, 255)
    rgb = np.where(band[..., None], fix, a)
    out = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def wipe_ai_mark(sheet):
    a = np.asarray(sheet).copy(); H, W = a.shape[:2]
    y0, x0 = int(H * 0.83), int(W * 0.92)
    c = a[y0:, x0:].astype(np.int32); r, g, b = c[..., 0], c[..., 1], c[..., 2]
    mark = (r > 170) & (b > 120) & (r > g + 30) & (b > g + 10)
    a[y0:, x0:, 3][mark] = 0
    return Image.fromarray(a, 'RGBA')


def wipe_labels(sheet, cols, rows, xs=None, ys=None):
    """Như cat-sheet.py; xs / ys: đường lưới dò được (ảnh lệch) thay cho chia đều."""
    a = np.asarray(sheet.convert('RGB')).copy()
    H, W = a.shape[:2]
    cw, ch = W // cols, H // rows
    for rr in range(rows):
        for cc in range(cols):
            if xs is None:
                y0, x0, bw, bh = rr * ch, cc * cw, cw, ch
            else:
                y0, x0 = max(0, ys[rr]), max(0, xs[cc]); bw, bh = xs[cc + 1] - xs[cc], ys[rr + 1] - ys[rr]
            box = a[y0:y0 + int(bh * 0.1), x0:x0 + int(bw * 0.55)]
            sel = (box[..., 0] > 160) & (box[..., 2] > 160)
            box[sel] = (255, 0, 255)
    return Image.fromarray(a, 'RGB')


def drop_lines(im):
    a = np.asarray(im).copy()
    op = a[..., 3] > 20
    H, W = op.shape
    dark = (a[..., :3].astype(int).sum(-1) < 200) & op
    rows = (op.sum(1) > 0.85 * W) & (dark.sum(1) > 0.8 * W)
    cols = (op.sum(0) > 0.85 * H) & (dark.sum(0) > 0.8 * H)
    a[rows, :, 3] = 0
    a[:, cols, 3] = 0
    return Image.fromarray(a, 'RGBA')


def key_border(im):
    """Như cat-sheet.py (loang từ mép = nhãn liên thông 4 hướng chạm mép)."""
    a = np.asarray(im.convert('RGB')).astype(np.int32)
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    q = (border // 16)
    keys, cnt = np.unique(q, axis=0, return_counts=True)
    order = np.argsort(-cnt); tot = cnt.sum(); acc = 0; pal = []
    for i in order:
        pal.append(keys[i] * 16 + 8); acc += cnt[i]
        if acc > 0.97 * tot or len(pal) >= 6: break
    pal = np.array(pal)
    dist = np.min(np.sqrt(((a[:, :, None, :] - pal[None, None]) ** 2).sum(-1)), axis=-1)
    like = dist < 34
    lab, _ = ndimage.label(like)
    ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, ids[ids > 0])
    out = np.dstack([a, np.where(bg, 0, 255)]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def drop_specks(im, min_px=40):
    """Như cat-sheet.py (mảnh liên thông 4 hướng nhỏ hơn min_px điểm → trong suốt), tính bằng scipy cho nhanh."""
    a = np.asarray(im).copy()
    m = a[..., 3] > 20
    lab, n = ndimage.label(m)
    if n:
        sizes = np.bincount(lab.ravel())
        small = sizes < min_px; small[0] = False
        a[small[lab], 3] = 0
    a[..., 3][(a[..., 3] <= 20)] = 0
    return Image.fromarray(a, 'RGBA')


def drop_below(im):
    a = np.asarray(im).copy(); m = a[..., 3] > 20
    lab, n = ndimage.label(m)
    if n < 2: return im
    sizes = ndimage.sum(m, lab, range(1, n + 1)); big = int(np.argmax(sizes)) + 1
    bottom = np.where(lab == big)[0].max()
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if i != big and sl[0].start > bottom - 2: a[lab == i, 3] = 0
    return Image.fromarray(a, 'RGBA')


def cut_lines(sheet, n, size, axis, forced=None):
    """Như cat-sheet.py; forced (list) ghi lại đường cắt phải cắt ngang hình (không có khe trống)."""
    al = np.asarray(sheet)[..., 3] > 20
    prof = al.sum(axis=axis)
    step = size / n
    lines = [0]
    for i in range(1, n):
        c = int(round(i * step)); w = int(step * 0.25)
        full = al.shape[axis]
        near = prof[max(0, c - 4):c + 5]
        if prof[c] == 0 or near.max() > 0.6 * full:
            lines.append(c); continue
        zeros = [j for j in range(c - w, c + w + 1) if 0 <= j < len(prof) and prof[j] == 0]
        if not zeros and forced is not None: forced.append(c)
        lines.append(min(zeros, key=lambda j: abs(j - c)) if zeros else c)
    lines.append(size)
    return lines


def save_light(im, path):
    q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
    q.save(path, optimize=True)


# ───────────── dò lưới khi ảnh AI sai cỡ / lệch lề ─────────────
def runs_of(prof, thr):
    occ = prof >= thr
    runs, i, L = [], 0, len(prof)
    while i < L:
        if occ[i]:
            j = i
            while j < L and occ[j]: j += 1
            runs.append([i, j]); i = j
        else:
            i += 1
    return runs


def detect_lines(al, n, axis, pitch_hint=None):
    """Đường lưới theo một chiều từ mặt nạ hình (al: True = có hình). Lấy n-1 khe trống rộng nhất làm ranh giới ô,
    bước ô = khoảng cách đều giữa các ranh giới; trả về (danh sách n+1 đường, chắc chắn hay không)."""
    L, other = (al.shape[1], al.shape[0]) if axis == 0 else (al.shape[0], al.shape[1])
    prof = al.sum(axis=axis)
    runs = [r for r in runs_of(prof, max(2, other // 200)) if r[1] - r[0] >= max(2, L // 150)]
    if n == 1 or not runs:
        return [0, L], n == 1
    gaps = [(runs[i + 1][0] - runs[i][1], i) for i in range(len(runs) - 1)]
    if len(gaps) < n - 1:
        s, e = runs[0][0], runs[-1][1]
        p = (e - s) / n
        return [int(round(s + i * p)) for i in range(n + 1)], False
    top = sorted(sorted(gaps, key=lambda g: -g[0])[:n - 1], key=lambda g: g[1])
    bnd = [(runs[i][1] + runs[i + 1][0]) / 2 for _, i in top]
    if n >= 3:
        p = (bnd[-1] - bnd[0]) / (n - 2)
    elif pitch_hint:
        p = pitch_hint
    else:
        p = max(bnd[0] - runs[0][0], runs[-1][1] - bnd[0]) * 1.1
    lines = [int(round(bnd[0] - p + i * p)) for i in range(n + 1)]
    lines[0] = min(lines[0], runs[0][0] - 1); lines[-1] = max(lines[-1], runs[-1][1] + 1)
    sure = all(abs(b - (bnd[0] + i * p)) < 0.12 * p for i, b in enumerate(bnd))
    return lines, sure


def find_grid(sheet, cols, rows):
    al = np.asarray(drop_specks(sheet, 60))[..., 3] > 20
    xs, sx = detect_lines(al, cols, 0)
    px = (xs[-2] - xs[1]) / max(1, cols - 2) if cols >= 3 else None
    ys, sy = detect_lines(al, rows, 1, pitch_hint=px)
    if cols < 3 and rows >= 3:
        xs, sx = detect_lines(al, cols, 0, pitch_hint=(ys[-2] - ys[1]) / (rows - 2))
    return xs, ys, sx and sy


# ───────────── cắt từng loại ─────────────
class Ket:
    """Kết quả cắt một ảnh: files {đường dẫn trong assets/: Image}, cảnh báo, lỗi, số khung."""
    def __init__(self):
        self.files, self.alias, self.warn, self.err, self.frames, self.marks, self.anim = {}, {}, [], [], None, [], []


def sheet_frames(raw, kind, ket):
    """Cắt tấm nhân vật (hero12 / enemy6 / boss9 / hero / enemy / boss4) → {tên khung: Image đã thu nhỏ}."""
    cols, rows, names = NAMES[kind]
    raw = raw.convert('RGB')
    r0, g0, b0 = raw.getpixel((raw.width // 2, 3))
    pink = is_pink(border_color(raw))
    magenta = (r0 > 180 and b0 > 180 and g0 < 90) or pink

    def key(img, xs=None, ys=None):
        s = drop_specks(wipe_ai_mark(key_pink(img)), 400) if pink else key_magenta(wipe_labels(img, cols, rows, xs, ys)) if magenta else key_border(img)
        sa = np.asarray(s).copy(); wm = max(40, img.width // 24)
        sa[-wm:, -wm:, 3] = 0
        return Image.fromarray(sa, 'RGBA')
    if not magenta: ket.warn.append('nền không phải hồng tím #FF00FF — xoá nền theo màu mép ảnh')
    sheet = key(raw)
    W, H = sheet.size
    forced = []
    xs = cut_lines(sheet, cols, W, axis=0, forced=forced)
    ys = cut_lines(sheet, rows, H, axis=1, forced=forced)
    want = cols / rows
    ratio = (W / H) / want
    ins = 8
    def cut(sh, xs, ys):
        return [drop_specks(drop_lines(sh.crop((xs[c] + ins, ys[r] + ins, xs[c + 1] - ins, ys[r + 1] - ins)))) for r in range(rows) for c in range(cols)]
    cells = cut(sheet, xs, ys)
    empty = sum(1 for c in cells if not c.getbbox())
    if abs(ratio - 1) > 0.04 or forced or empty:
        why = []
        if abs(ratio - 1) > 0.04: why.append(f'ảnh {W}×{H} không đúng tỉ lệ lưới {cols}×{rows}')
        if forced: why.append('đường chia đều cắt ngang hình')
        if empty: why.append(f'{empty} ô trống khi chia đều')
        gx, gy, sure = find_grid(key(raw), cols, rows)
        sheet2 = key(raw, gx, gy)
        gx2 = snap_lines(sheet2, gx, 0); gy2 = snap_lines(sheet2, gy, 1)
        cells2 = cut(sheet2, gx2, gy2)
        empty2 = sum(1 for c in cells2 if not c.getbbox())
        if empty2 < empty or ((abs(ratio - 1) > 0.04 or forced) and empty2 <= empty):
            sheet, cells, xs, ys, empty = sheet2, cells2, gx2, gy2, empty2
            ket.warn.append('sai lưới (' + '; '.join(why) + ') → đã dò lưới theo vùng có hình' + ('' if sure else ' (không chắc, xem kỹ từng khung)'))
        elif abs(ratio - 1) > 0.04 or forced:
            ket.warn.append('sai lưới (' + '; '.join(why) + ')')
    if pink: cells = [drop_below(c) for c in cells]
    body = [i for i, n in enumerate(names) if n != 'head']
    boxes = {i: cells[i].getbbox() for i in range(len(cells))}
    if not any(boxes[i] for i in body):
        ket.err.append('không thấy hình nào trong ảnh'); return {}
    top = min(boxes[i][1] for i in body if boxes[i])
    bot = max(boxes[i][3] for i in body if boxes[i])
    out = {}
    for i, n in enumerate(names):
        bb = boxes[i]
        if not bb:
            ket.err.append(f'thiếu khung {n} (ô {i + 1} trống)'); continue
        if n == 'head':
            im = cells[i].crop(bb); hh = 240
        else:
            im = cells[i].crop((bb[0], top, bb[2], bot)); hh = 480
        hh = min(hh, im.height)
        k = hh / im.height
        out[n] = im.resize((max(1, round(im.width * k)), hh), Image.LANCZOS)
    giong_nhau(out, ket)
    return out


def snap_lines(sheet, lines, axis):
    """Đường lưới dò được: dời đường bên trong tới khe trống gần nhất (±25% ô) như cut_lines."""
    al = np.asarray(sheet)[..., 3] > 20
    prof = al.sum(axis=axis); L = len(prof)
    res = [lines[0]]
    for i in range(1, len(lines) - 1):
        c = min(max(lines[i], 0), L - 1); w = int((lines[i + 1] - lines[i - 1]) / 2 * 0.25)
        if prof[c] == 0: res.append(c); continue
        zeros = [j for j in range(c - w, c + w + 1) if 0 <= j < L and prof[j] == 0]
        res.append(min(zeros, key=lambda j: abs(j - c)) if zeros else c)
    res.append(lines[-1])
    return res


def giong_nhau(frames, ket):
    """Báo hai khung giống hệt nhau (AI chép lại một dáng)."""
    sig = {}
    for n, im in frames.items():
        if n == 'head': continue
        t = np.asarray(im.convert('RGBA').resize((32, 32), Image.BILINEAR)).astype(np.int16)
        sig[n] = t
    ks = list(sig)
    for i in range(len(ks)):
        for j in range(i + 1, len(ks)):
            if np.abs(sig[ks[i]] - sig[ks[j]]).mean() < 1.5:
                ket.err.append(f'khung {ks[i]} và {ks[j]} giống hệt nhau')


def cat_nhan_vat(raw, kind, code, ket):
    fr = sheet_frames(raw, kind, ket)
    base = f'packs/{code}/'
    for n, im in fr.items(): ket.files[base + n + '.png'] = ('light', im)
    if kind in ALIAS:
        for old, new in ALIAS[kind].items():
            if new in fr: ket.alias[base + old + '.png'] = base + new + '.png'
        ket.frames = {code: frame_counts([n for n in NAMES[kind][2] if n in fr])}
        if kind == 'hero12': ket.marks.append(base + '.v2')
    ket.anim = [base + n + '.png' for n in NAMES[kind][2] if n in fr and n != 'head']


def nen_fx(raw):
    a = np.asarray(raw.convert('RGB')).astype(int)
    b = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    r, g, bl = np.median(b, axis=0)
    return 'magenta' if r > 150 and bl > 150 and g < 100 else 'black'


def xoa_den(im, xam=False):
    a = np.asarray(im.convert('RGB')).astype(np.float64)
    lv = np.percentile(a.max(-1), 5)
    if xam:
        lum = (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2] - lv) / max(1, 255 - lv)
        v = (np.clip(lum, 0, 1) * 255).round().astype(np.uint8)
        return Image.fromarray(np.dstack([v, v]), 'LA')
    al = np.clip((a.max(-1) - lv) / max(1, 255 - lv), 0, 1)
    rgb = np.clip(a / np.maximum(al[..., None], 1e-3), 0, 255)
    rgb[al < 0.02] = 0
    return Image.fromarray(np.dstack([rgb, al * 255]).round().astype(np.uint8), 'RGBA')


def bo_nen(raw, xam=False):
    if nen_fx(raw) == 'magenta':
        im = key_magenta(raw.convert('RGB'))
        return im.convert('LA') if xam else im
    return xoa_den(raw, xam)


def bo_dau(im):
    a = np.asarray(im).copy(); wm = max(24, im.width // 40)
    a[-wm:, -wm:, -1] = 0
    return Image.fromarray(a, im.mode)


def cat_o(im, n):
    W, H = im.size; cw = W / n; ins = max(2, int(cw * 0.02))
    return [im.crop((round(i * cw) + ins, ins, round((i + 1) * cw) - ins, H - ins)) for i in range(n)]


def o_trong(cells, names, ket):
    for i, c in enumerate(cells):
        if not c.getbbox() or (c.mode in ('RGBA', 'LA') and np.asarray(c)[..., -1].max() < 8):
            ket.err.append(f'ô {i + 1} ({names[i] if i < len(names) else i + 1}) trống')


def cat_hat(raw, names, mau, ket):
    im = bo_dau(bo_nen(raw, xam=not mau))
    size = 128 if mau else 256
    cells = cat_o(im, len(names))
    o_trong(cells, names, ket)
    for name, c in zip(names, cells):
        if mau:
            bb = c.getbbox()
            if bb: c = c.crop(bb)
            s = max(c.size); sq = Image.new(c.mode, (s, s)); sq.paste(c, ((s - c.width) // 2, (s - c.height) // 2)); c = sq
        c = c.resize((size, size), Image.LANCZOS)
        ket.files['fx/' + name + '.png'] = ('png', c)
    W, H = raw.size
    if abs(W / H - len(names)) > 0.15 * len(names): ket.warn.append(f'ảnh {W}×{H}: mong đợi {len(names)} ô vuông một hàng')


def cat_dai(raw, name, ket):
    W, H = raw.size
    n = max(1, round(W / H))
    im = bo_dau(bo_nen(raw))
    hh = min(192, H)
    parts = cat_o(im.crop((0, 0, round(n * H), H)) if W >= n * H else im, n)
    o_trong(parts, [f'khung {i + 1}' for i in range(n)], ket)
    cells = [c.resize((hh, hh), Image.LANCZOS) for c in parts]
    out = Image.new('RGBA', (n * hh, hh))
    for i, c in enumerate(cells): out.paste(c, (i * hh, 0))
    ket.files['vfx/' + name + '.png'] = ('png', out)
    if n != 6: ket.warn.append(f'dải có {n} khung (ảnh {W}×{H}; prompt yêu cầu 6 khung 1536×256)')
    sig = [np.asarray(c.convert('RGBA').resize((32, 32), Image.BILINEAR)).astype(np.int16) for c in cells]
    for i in range(len(sig) - 1):
        if np.abs(sig[i] - sig[i + 1]).mean() < 1.0 and sig[i][..., 3].max() > 0:
            ket.err.append(f'khung {i + 1} và {i + 2} giống hệt nhau')


def cat_don(raw, name, ket):
    im = drop_specks(bo_dau(bo_nen(raw)))
    bb = im.getbbox()
    if not bb: ket.err.append('ảnh trống'); return
    im = im.crop(bb)
    if im.height > 256: im = im.resize((max(1, round(im.width * 256 / im.height)), 256), Image.LANCZOS)
    ket.files[name + '.png'] = ('light', im)


def clean_mark(im):
    """Như tools/cat-icons.py."""
    a = np.asarray(im).copy(); al = a[..., 3] > 20
    lab, n = ndimage.label(al)
    if n < 2: return im
    sizes = ndimage.sum(al, lab, range(1, n + 1)); h, w = al.shape
    for i, s in enumerate(sizes, 1):
        if s >= sizes.max() * 0.03: continue
        ys, xs = np.where(lab == i)
        if ys.min() > h * 0.7 and xs.min() > w * 0.7: a[lab == i, 3] = 0
    return Image.fromarray(a, 'RGBA')


def cat_icon(raw, code, n, ket):
    names = [f'tk-{i + 1}' for i in range(n)] if n == 3 else [f'sk-{k}' for k in 'qwer']
    sheet = key_magenta(raw.convert('RGB'))
    W, H = sheet.size
    xs = cut_lines(sheet, n, W, axis=0)
    for i, k in enumerate(names):
        ins = 8
        c = drop_specks(drop_lines(sheet.crop((xs[i] + ins, ins, xs[i + 1] - ins, H - ins))))
        c = clean_mark(c)
        bb = c.getbbox()
        if not bb: ket.err.append(f'ô {k} trống'); continue
        c = c.crop(bb); side = int(max(c.size) * 1.08)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(c, ((side - c.width) // 2, (side - c.height) // 2))
        ket.files[f'packs/{code}/{k}.png'] = ('light', sq.resize((128, 128), Image.LANCZOS))
    if abs(W / H - n) > 0.15 * n: ket.warn.append(f'ảnh {W}×{H}: mong đợi {n} ô vuông một hàng')


# ───────────── ảnh một vật / tấm nhiều vật không theo lưới (ảnh ghi tay trong tools/cat-anh-them.json) ─────────────
def xoa_nen(raw):
    """Xoá nền tự nhận: hồng sen Pippit → key_pink; gần #FF00FF → key_magenta; màu khác (tím, xám…) → loang từ mép
    theo màu viền, cộng mọi điểm rất sát màu viền ở bên trong (lòng vòng, khe giữa tay chân)."""
    raw = raw.convert('RGB'); c = border_color(raw)
    if is_pink(c): return wipe_ai_mark(key_pink(raw))
    if np.sqrt((255 - c[0]) ** 2 + c[1] ** 2 + (255 - c[2]) ** 2) < 120: return key_magenta(raw)
    a = np.asarray(raw).astype(np.int32)
    im = key_border(raw)
    d = np.sqrt(((a - np.asarray(c)) ** 2).sum(-1))
    o = np.asarray(im).copy(); o[d < 18, 3] = 0
    return Image.fromarray(o, 'RGBA')


def tach_vat(im, min_frac=0.06):
    """Tách các vật rời trong ảnh đã xoá nền → danh sách ảnh RGBA cắt sát, theo thứ tự đọc (hàng trên→dưới, trái→phải).
    Mảnh nhỏ hơn min_frac vật lớn nhất (chữ chú thích, dấu watermark, hạt bụi) bị bỏ."""
    a = np.asarray(im.convert('RGBA')); m = a[..., 3] > 20
    r = max(3, round(min(im.size) * 0.015))
    lab, n = ndimage.label(ndimage.maximum_filter(m, size=2 * r + 1))
    objs = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        mm = m[sl] & (lab[sl] == i)
        if not mm.any(): continue
        ys, xs = np.nonzero(mm)
        y0, y1, x0, x1 = sl[0].start + ys.min(), sl[0].start + ys.max() + 1, sl[1].start + xs.min(), sl[1].start + xs.max() + 1
        sub = a[y0:y1, x0:x1].copy(); sub[..., 3][~(m[y0:y1, x0:x1] & (lab[y0:y1, x0:x1] == i))] = 0
        objs.append({'area': int(mm.sum()), 'box': (x0, y0, x1, y1), 'im': Image.fromarray(sub, 'RGBA')})
    if not objs: return []
    big = max(o['area'] for o in objs)
    objs = [o for o in objs if o['area'] >= min_frac * big]
    hs = sorted(o['box'][3] - o['box'][1] for o in objs); mh = hs[len(hs) // 2]
    objs.sort(key=lambda o: (o['box'][1] + o['box'][3]) / 2)
    rows, cur = [], []
    for o in objs:
        cy = (o['box'][1] + o['box'][3]) / 2
        if cur and cy - (cur[0]['box'][1] + cur[0]['box'][3]) / 2 > 0.5 * mh: rows.append(cur); cur = []
        cur.append(o)
    rows.append(cur)
    return [o['im'] for row in rows for o in sorted(row, key=lambda o: o['box'][0])]


def vuong(c, size):
    """Như cat-items.py: đặt vật vào ô vuông (cạnh = cạnh dài × 1.08) rồi thu về size px."""
    side = int(max(c.size) * 1.08)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.paste(c, ((side - c.width) // 2, (side - c.height) // 2))
    return sq.resize((size, size), Image.LANCZOS)


def gioi_han(c, mx):
    s = mx / max(c.size)
    return c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS) if s < 1 else c


def cat_vat(raw, spec, kind, ket, ten):
    """Tấm nhiều vật (icon 1 hàng, lưới 2×2, 3×2…): tách từng vật, gán tên theo thứ tự đọc."""
    vats = tach_vat(xoa_nen(raw))
    files = spec['files']
    if len(vats) != len(files):
        ket.err.append(f'tìm thấy {len(vats)} vật, cần {len(files)} — đã để các vật vào chua-dung/{ten}/ để xem')
        for i, c in enumerate(vats): ket.files[f'chua-dung/{ten}/{ten}-{i + 1}.png'] = ('light', gioi_han(c, 256))
        return
    d = spec['dir'] + '/' if spec.get('dir') else ''
    for f, c in zip(files, vats):
        if f is None: continue
        ket.files[d + f] = ('light', vuong(c, spec['size']) if kind == 'vat' else gioi_han(c, spec['max']))


def cat_chua(raw, ten, ket):
    """Chưa có chỗ trong game: xoá nền, cắt sát từng vật (ảnh một vật thì chỉ xoá nền + cắt sát), cạnh dài ≤ 256 px."""
    vats = tach_vat(xoa_nen(raw))
    if not vats: ket.err.append('không thấy vật nào sau khi xoá nền'); return
    if len(vats) == 1: ket.files[f'chua-dung/{ten}.png'] = ('light', gioi_han(vats[0], 256)); return
    for i, c in enumerate(vats): ket.files[f'chua-dung/{ten}/{ten}-{i + 1}.png'] = ('light', gioi_han(c, 256))
    ket.warn.append(f'chưa có chỗ dùng trong game — tách {len(vats)} vật vào assets/chua-dung/{ten}/')


def cat_tex(raw, spec, ket):
    """Kết cấu đường (như cat-items.py texture): cắt vuông giữa ảnh, thu về side px, JPG."""
    im = raw.convert('RGB'); s = min(im.size)
    im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
    ket.files[spec['file']] = ('jpg', im.resize((spec['side'], spec['side']), Image.LANCZOS))


POSE = re.compile(r'^(.*?)[\s_-]*(pose|dang|frame|khung)[\s_-]*0*(\d+)$')
POSE_KIND = {'boss9': lambda n: 'boss4' if n <= 4 else 'boss9', 'enemy6': lambda n: 'enemy' if n <= 3 else 'enemy6', 'hero12': lambda n: 'hero' if n <= 6 else 'hero12'}


def la_pose(fn):
    """'daibang_pose01.png' → ('daibang', 1): mỗi ảnh một dáng của nhân vật."""
    m = POSE.match(chuan_ten(fn))
    if not m: return None
    key, _ = nhan_dien(m.group(1) + '.png')
    return (key, int(m.group(3))) if key and DANH_SACH[key][0] in POSE_KIND else None


def mo_anh(p):
    raw = Image.open(p); raw.load()
    if raw.mode in ('RGBA', 'LA', 'P') and raw.convert('RGBA').getextrema()[3][0] < 255:
        bg = Image.new('RGBA', raw.size, (255, 0, 255, 255)); bg.alpha_composite(raw.convert('RGBA')); return bg.convert('RGB')
    return raw.convert('RGB')


def cat_pose(paths, key, ket):
    """Mỗi ảnh một dáng (không cần chia lưới): xoá nền, bỏ chữ / watermark, các dáng cắt chung khung dọc như cat-sheet.py
    (đỉnh cao nhất → chân thấp nhất, giữ đường chân), cao tối đa 480 px. Boss 4 dáng → walk1 · walk2 · attack · rage."""
    kind = POSE_KIND[DANH_SACH[key][0]](len(paths)); code = DANH_SACH[key][1]
    names = NAMES[kind][2]
    ket.kind = kind + ' (từng dáng)'
    if len(paths) > len(names): ket.warn.append(f'{len(paths)} dáng, chỉ dùng {len(names)} dáng đầu'); paths = paths[:len(names)]
    size = None; cells = []
    for p in paths:
        raw = mo_anh(p)
        if size is None: size = raw.size
        elif raw.size != size: raw = raw.resize(size, Image.LANCZOS); ket.warn.append('các dáng khác cỡ ảnh — đã đưa về cùng cỡ')
        im = drop_specks(xoa_nen(raw), 400)
        vats = tach_vat(im, 0.06)
        a = np.zeros((size[1], size[0], 4), np.uint8)
        if vats:                                           # giữ vật lớn nhất (nhân vật) + mảnh lớn liền (lửa, vũ khí); bỏ chữ / watermark
            al = np.asarray(im)[..., 3] > 20
            r = max(3, round(min(size) * 0.015))
            lab, _ = ndimage.label(ndimage.maximum_filter(al, size=2 * r + 1))
            sizes = np.bincount(lab[al].ravel(), minlength=lab.max() + 1); sizes[0] = 0
            keep = sizes >= 0.06 * sizes.max()
            a = np.asarray(im).copy(); a[..., 3][~keep[lab]] = 0
        cells.append(Image.fromarray(a, 'RGBA'))
    boxes = [c.getbbox() for c in cells]
    body = [i for i, n in enumerate(names[:len(cells)]) if n != 'head' and boxes[i]]
    if not body: ket.err.append('không thấy hình nào'); return
    top = min(boxes[i][1] for i in body); bot = max(boxes[i][3] for i in body)
    fr = {}
    for i, n in enumerate(names):
        if i >= len(cells) or not boxes[i]: ket.err.append(f'thiếu dáng {n} (ảnh thứ {i + 1})'); continue
        bb = boxes[i]
        im, hh = (cells[i].crop(bb), 240) if n == 'head' else (cells[i].crop((bb[0], top, bb[2], bot)), 480)
        hh = min(hh, im.height)
        fr[n] = im.resize((max(1, round(im.width * hh / im.height)), hh), Image.LANCZOS)
    giong_nhau(fr, ket)
    base = f'packs/{code}/'
    for n, im in fr.items(): ket.files[base + n + '.png'] = ('light', im)
    ket.anim = [base + n + '.png' for n in names if n in fr and n != 'head']


# ───────────── nhận loại ảnh theo tên file ─────────────
def bo_dau_tv(s):
    s = unicodedata.normalize('NFD', s)
    return ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn').replace('đ', 'd').replace('Đ', 'D')


def chuan_ten(fn):
    """'Thaymo (1).PNG' → 'thaymo'; 'trung-kim.png.png' → 'trung-kim'."""
    s = bo_dau_tv(os.path.basename(fn)).lower().strip()
    while True:
        t = re.sub(r'\.(png|jpe?g|webp|gif|bmp)$', '', s).strip()
        if t == s: break
        s = t
    s = re.sub(r'\s*\(\d+\)$', '', s)                       # "(1)" của Windows khi tải trùng tên
    s = re.sub(r'[\s_-]*(copy|ban sao|sao chep)(\s*\d+)?$', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = s.replace('_', '-') if s.replace('_', '-') in DANH_SACH and s not in DANH_SACH else s
    return s


def lev(a, b):
    if abs(len(a) - len(b)) > 2: return 9
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def nhan_dien(fn):
    """(khóa trong DANH_SACH hoặc None, đoán hay chắc)."""
    s = chuan_ten(fn)
    if s in DANH_SACH: return s, False
    if re.match(r'[0-9a-f]{10}', s) and s[:10] in DANH_SACH: return s[:10], False   # tên mã băm (Doubao/Jimeng), ghi tay
    t = s
    while True:
        t2 = re.sub(r'[\s_-]*(v?\d+|final|new|moi|sheet|anh|hero|boss|fx)$', '', t)
        if t2 == t or not t2: break
        t = t2
        if t in DANH_SACH: return t, True
    flat = re.sub(r'[\s_-]', '', s)
    for k in DANH_SACH:
        if re.sub(r'[\s_-]', '', k) == flat: return k, True
    for k, v in DANH_SACH.items():                         # tên tiếng Việt: "Thầy Mo Lửa.png" → thaymo
        if v[0] in NAMES and re.sub(r'[^a-z0-9]', '', bo_dau_tv(v[2].split(' · ')[-1]).lower()) == re.sub(r'[^a-z0-9]', '', flat): return k, True
    hits = [k for k in DANH_SACH if len(k) >= 3 and re.search(r'(^|[^a-z])' + re.escape(k) + r'($|[^a-z])', s)]
    if hits: return max(hits, key=len), True
    near = sorted((lev(flat, re.sub(r'[\s_-]', '', k)), k) for k in DANH_SACH if len(k) >= 5)
    if near and near[0][0] <= (1 if len(flat) < 7 else 2) and (len(near) < 2 or near[1][0] > near[0][0]): return near[0][1], True
    return None, False


def kieu_theo_anh(key, raw):
    """Kiểu cắt: theo danh sách, riêng quái cũ 3 ô một hàng (576×192) → 'enemy'."""
    kind, arg, _ = DANH_SACH[key]
    W, H = raw.size
    if kind == 'enemy6' and W / H > 2.4: return 'enemy', arg
    return kind, arg


def ten_ra(path, key):
    """Tên thư mục chua-dung/: tên tự đặt giữ nguyên (thap-phong-thu_v2 khác _v3); tên mã băm → tên ghi tay."""
    s = chuan_ten(path)
    if not re.match(r'[0-9a-f]{10}', s): return re.sub(r'[^a-z0-9_-]', '-', s)
    arg = DANH_SACH[key][1]
    return (arg + '-' if isinstance(arg, str) else '') + key


def cat_mot(path, key):
    ket = Ket()
    raw = Image.open(path); raw.load()
    kind, arg = kieu_theo_anh(key, raw)
    if kind in ('vat', 'khung', 'chua', 'tex', 'bo'):
        ket.kind = kind
        if kind == 'bo': ket.warn.append('bỏ qua: ' + arg); return ket
        raw = mo_anh(path)
        if kind == 'tex': cat_tex(raw, arg, ket)
        elif kind == 'chua': cat_chua(raw, ten_ra(path, key), ket)
        else: cat_vat(raw, arg, kind, ket, ten_ra(path, key))
        return ket
    if kind not in ('hat', 'hatmau', 'dai', 'don') and raw.mode in ('RGBA', 'LA', 'P') and raw.convert('RGBA').getextrema()[3][0] < 255:
        # ảnh có sẵn nền trong suốt → đặt lên nền hồng tím rồi cắt như thường
        bg = Image.new('RGBA', raw.size, (255, 0, 255, 255)); bg.alpha_composite(raw.convert('RGBA')); raw = bg.convert('RGB')
    ket.kind = kind
    if kind in NAMES: cat_nhan_vat(raw, kind, arg, ket)
    elif kind == 'icon4': cat_icon(raw, arg, 4, ket)
    elif kind == 'tk3': cat_icon(raw, arg, 3, ket)
    elif kind in ('hat', 'hatmau'): cat_hat(raw, arg, kind == 'hatmau', ket)
    elif kind == 'dai': cat_dai(raw, arg, ket)
    elif kind == 'don': cat_don(raw, arg, ket)
    return ket


def save_png(im, path):
    """PNG không mất gì: ảnh ≤ 256 màu → bảng màu (điểm ảnh giữ y nguyên, file nhỏ hơn nhiều); còn lại như cat-fx.py."""
    a = np.asarray(im.convert('RGBA'))
    flat = a.reshape(-1, 4).copy(); flat[flat[:, 3] == 0] = 0
    cols, idx = np.unique(flat.view(np.uint32).ravel(), return_inverse=True)
    if len(cols) <= 256:                                   # (điểm trong suốt hẳn coi như một màu)
        pal = cols.view(np.uint8).reshape(-1, 4)
        p = Image.fromarray(idx.reshape(a.shape[:2]).astype(np.uint8), 'P')
        p.putpalette(pal[:, :3].ravel().tolist())
        p.save(path, optimize=True, transparency=bytes(pal[:, 3].tolist()))
    else:
        im.save(path, optimize=True)


def luu(ket, out_assets):
    for rel, (how, im) in ket.files.items():
        p = os.path.join(out_assets, *rel.split('/'))
        os.makedirs(os.path.dirname(p), exist_ok=True)
        if how == 'light': save_light(im, p)
        elif how == 'jpg': im.save(p, quality=86, optimize=True)
        else: save_png(im, p)
    for rel, src in ket.alias.items():
        shutil.copyfile(os.path.join(out_assets, *src.split('/')), os.path.join(out_assets, *rel.split('/')))
    for rel in ket.marks:
        p = os.path.join(out_assets, *rel.split('/')); os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'w').close()


ANH = re.compile(r'\.(png|jpe?g|webp|gif|bmp)$', re.I)


def chay(vao, ra, toi_da=20 * 1048576):
    vao, ra = os.path.abspath(vao), os.path.abspath(ra)
    files = []
    for d, sub, fs in os.walk(vao):
        sub[:] = [s for s in sub if os.path.abspath(os.path.join(d, s)) != ra and s != 'da-cat']
        files += [os.path.join(d, f) for f in sorted(fs) if ANH.search(f)]
    if not files:
        print('Không thấy ảnh nào trong', vao); return []
    if os.path.isdir(os.path.join(ra, 'assets')): shutil.rmtree(os.path.join(ra, 'assets'))
    out_assets = os.path.join(ra, 'assets'); os.makedirs(out_assets, exist_ok=True)
    rows, frames, taken = [], {}, {}
    # ảnh từng dáng (daibang_pose01..04) → gom theo mã, cắt chung một lượt
    poses, viec = {}, []
    for f in files:
        ps = la_pose(f)
        if ps:
            if ps[0] not in poses: poses[ps[0]] = []; viec.append(('pose', ps[0]))
            poses[ps[0]].append((ps[1], f))
        else: viec.append(('anh', f))
    for loai, f in viec:
        if loai == 'pose':
            key, ds = f, sorted(poses[f])
            paths = [x[1] for x in ds]
            rel = ', '.join(os.path.relpath(x, vao) for x in paths)
            doan = False
        else:
            rel = os.path.relpath(f, vao)
            key, doan = nhan_dien(f)
        row = {'file': rel, 'key': key, 'doan': doan, 'files': [], 'warn': [], 'err': [], 'anim': []}
        rows.append(row)
        if not key:
            row['err'].append('không nhận ra tên file — đổi tên đúng như "lưu tên:" trong PROMPT-CAN-GEN.txt'); print('?', rel, '→ không nhận ra'); continue
        row['label'] = DANH_SACH[key][2]
        row['uid'] = key + '|' + ten_ra(f, key) if loai == 'anh' and DANH_SACH[key][0] == 'chua' else key
        if row['uid'] in taken: row['warn'].append(f'trùng với {taken[row["uid"]]} — ảnh này ghi đè ảnh trước')
        taken[row['uid']] = rel
        if doan: row['warn'].append(f'đoán là "{key}" theo tên file')
        try:
            if loai == 'pose':
                ket = Ket(); cat_pose(paths, key, ket)
            else:
                ket = cat_mot(f, key)
        except Exception as e:
            row['err'].append(f'lỗi khi cắt: {e}'); print('✗', rel, e); continue
        luu(ket, out_assets)
        row.update(kind=ket.kind, files=sorted(list(ket.files) + list(ket.alias) + ket.marks), anim=ket.anim, alias=dict(ket.alias), frames=ket.frames or {})
        row['warn'] += ket.warn; row['err'] += ket.err
        if ket.frames: frames.update(ket.frames)
        print('✓' if not ket.err else '!', rel, '→', key, f'({ket.kind}, {len(ket.files)} ảnh)', *(['· ' + x for x in ket.warn + ket.err]))
        del ket                                             # giải phóng ảnh ngay, ảnh sau mới mở
    json.dump(frames, open(os.path.join(ra, 'pack-frames.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    aliases = {a: src for r in rows for a, src in r.get('alias', {}).items()}
    json.dump(aliases, open(os.path.join(ra, 'alias.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    bao_cao(rows, ra)
    zps = dong_zip(rows, ra, frames, toi_da)
    ok = sum(1 for r in rows if not r['err']); bad = len(rows) - ok
    print(f'\nXong: {ok} ảnh tốt, {bad} ảnh cần xem lại.')
    print('Kết quả:', ra, '\nBáo cáo:', os.path.join(ra, 'bao-cao.html'))
    tong = sum(os.path.getsize(z) for z in zps)
    print(f'Gửi Claude {"file" if len(zps) == 1 else str(len(zps)) + " file"} (tổng {mb(tong)}):')
    for z in zps: print('   ', z, mb(os.path.getsize(z)))
    return rows


def mb(n):
    return f'{n / 1048576:.1f} MB' if n >= 104858 else f'{n / 1024:.0f} KB'


def bao_cao_txt(rows):
    out = []
    for r in rows:
        x = f"{r['file']} → {r.get('key') or '?'}" + (f" ({r['kind']})" if r.get('kind') else '')
        if r['err']: x += ' · LỖI: ' + '; '.join(r['err'])
        if r['warn']: x += ' · ' + '; '.join(r['warn'])
        out.append(x)
    return '\r\n'.join(out) + '\r\n'


def dong_zip(rows, ra, frames, toi_da):
    """Đóng zip để gửi: chỉ ảnh thật (tên cũ chép từ khung đại diện ghi trong alias.json, --ghep tự tạo lại).
    Quá toi_da byte → chia da-cat-phan-1.zip, -phan-2.zip… (mỗi ảnh gốc nằm trọn trong một phần)."""
    base = ra.rstrip('\\/')
    d0 = os.path.dirname(base) or '.'
    for x in os.listdir(d0):                                # xoá zip lần chạy trước
        if re.fullmatch(re.escape(os.path.basename(base)) + r'(-phan-\d+)?\.zip', x): os.remove(os.path.join(d0, x))
    last = {}
    for r in rows:
        if r.get('kind'): last[r['uid']] = r
    groups = []
    for r in last.values():
        fs = [f for f in r['files'] if f not in r.get('alias', {})]
        size = sum(os.path.getsize(os.path.join(ra, 'assets', *f.split('/'))) for f in fs)
        groups.append((r, fs, size))
    parts, cur, cs = [], [], 0
    for g in groups:
        if cur and cs + g[2] > toi_da: parts.append(cur); cur, cs = [], 0
        cur.append(g); cs += g[2]
    parts.append(cur)
    out = []
    for i, part in enumerate(parts):
        zp = base + ('.zip' if len(parts) == 1 else f'-phan-{i + 1}.zip')
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_STORED) as z:
            codes, al = set(), {}
            for r, fs, _ in part:
                for f in fs: z.write(os.path.join(ra, 'assets', *f.split('/')), 'assets/' + f)
                al.update(r.get('alias', {}))
                codes |= set(r.get('frames', {}))
            z.writestr('pack-frames.json', json.dumps({k: frames[k] for k in frames if k in codes}, ensure_ascii=False, indent=1), zipfile.ZIP_DEFLATED)
            z.writestr('alias.json', json.dumps(al, ensure_ascii=False, indent=1), zipfile.ZIP_DEFLATED)
            if i == 0: z.writestr('bao-cao.txt', bao_cao_txt(rows), zipfile.ZIP_DEFLATED)
        out.append(zp)
    return out


def bao_cao(rows, ra):
    import html
    e = html.escape
    parts = []
    for r in rows:
        st = 'loi' if r['err'] else 'canh' if r['warn'] else 'tot'
        imgs = ''.join(f'<img src="{e(p)}" title="{e(p)}">' for p in r['files'] if p.endswith('.png') and '/' in p and not any(p.endswith('/' + a + '.png') for a in ('idle', 'front', 'wind', 'strike', 'cast', 'walk1', 'walk2', 'attack', 'skill', 'rage')))
        anim = f'<img class="anim" data-f="{e(json.dumps(r["anim"]))}" src="{e(r["anim"][0])}">' if r['anim'] else ''
        msg = ''.join(f'<li class="e">{e(x)}</li>' for x in r['err']) + ''.join(f'<li class="w">{e(x)}</li>' for x in r['warn'])
        parts.append(f'<section class="{st}"><h3>{e(r["file"])} → {e(r.get("key") or "?")} <small>{e(r.get("label", ""))} {e(r.get("kind", ""))}</small></h3><ul>{msg}</ul><div class="row">{anim}<div class="cells">{imgs}</div></div></section>')
    ok = sum(1 for r in rows if not r['err'])
    doc = f'''<!doctype html><meta charset="utf-8"><title>Báo cáo cắt ảnh</title>
<style>body{{font:14px system-ui,sans-serif;margin:16px;background:#f6f1e7;color:#2a1608}}section{{background:#fff;border-radius:8px;padding:8px 12px;margin:10px 0;border-left:6px solid #3a3}}
section.canh{{border-color:#e9a400}}section.loi{{border-color:#d33}}h3{{margin:4px 0;font-size:15px}}small{{color:#876;font-weight:400}}li.e{{color:#c22}}li.w{{color:#a60}}
.row{{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap}}.cells img{{height:72px;margin:2px;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/12px 12px;border-radius:4px}}
img.anim{{height:150px;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px;border-radius:6px}}</style>
<h1>Báo cáo cắt ảnh</h1><p>{ok}/{len(rows)} ảnh tốt. Ô viền đỏ: cần gen lại hoặc sửa tên; viền vàng: xem lại khung. Gửi file <b>da-cat.zip</b> cho Claude để ghép vào game.</p>
{"".join(parts)}
<script>for(const im of document.querySelectorAll('img.anim')){{const f=JSON.parse(im.dataset.f);let i=0;setInterval(()=>{{i=(i+1)%f.length;im.src=f[i]}},160)}}</script>'''
    open(os.path.join(ra, 'bao-cao.html'), 'w', encoding='utf-8').write(doc)


# ───────────── ghép kết quả vào repo game ─────────────
def ghep(srcs):
    """Chép da-cat.zip (hoặc các phần -phan-N.zip, hoặc thư mục da-cat) vào assets/ của repo, tạo lại tên cũ
    từ alias.json và ghi số khung vào PACK_FRAMES trong js/render.js."""
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
    render = os.environ.get('CAT_SHEET_RENDER') or os.path.join(root, 'js', 'render.js')
    assets = os.environ.get('CAT_ANH_ASSETS') or os.path.join(root, 'assets')
    n, frames, alias = 0, {}, {}
    for src in srcs:
        if zipfile.is_zipfile(src):
            z = zipfile.ZipFile(src)
            for name in z.namelist():
                if name.startswith('assets/') and not name.endswith('/'):
                    p = os.path.join(assets, *name.split('/')[1:]); os.makedirs(os.path.dirname(p), exist_ok=True)
                    open(p, 'wb').write(z.read(name)); n += 1
            rd = lambda f: json.loads(z.read(f)) if f in z.namelist() else {}
        else:
            for d, _, fs in os.walk(os.path.join(src, 'assets')):
                for x in fs:
                    rel = os.path.relpath(os.path.join(d, x), os.path.join(src, 'assets'))
                    p = os.path.join(assets, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
                    shutil.copyfile(os.path.join(d, x), p); n += 1
            rd = lambda f: json.load(open(os.path.join(src, f), encoding='utf-8')) if os.path.exists(os.path.join(src, f)) else {}
        frames.update(rd('pack-frames.json')); alias.update(rd('alias.json'))
    for a, b in alias.items():
        shutil.copyfile(os.path.join(assets, *b.split('/')), os.path.join(assets, *a.split('/')))
    if frames:
        s = open(render, encoding='utf8').read()
        m = re.search(r'^const PACK_FRAMES = (\{.*\});', s, re.M)
        data = json.loads(m.group(1)); data.update(frames)
        line = 'const PACK_FRAMES = ' + json.dumps(dict(sorted(data.items())), separators=(',', ':'), ensure_ascii=False) + ';'
        open(render, 'w', encoding='utf8').write(s[:m.start()] + line + s[m.end():])
    print(f'Đã chép {n} file (+{len(alias)} tên cũ) vào {assets}; PACK_FRAMES +{len(frames)} mã. Nhớ tăng phiên bản game (CLAUDE.md).')


def main(argv):
    if argv and argv[0] == '--ghep':
        return ghep(argv[1:])
    toi_da = 20 * 1048576
    if '--toi-da' in argv:                                  # --toi-da <MB>: cỡ tối đa mỗi file zip
        i = argv.index('--toi-da'); toi_da = int(float(argv[i + 1]) * 1048576); argv = argv[:i] + argv[i + 2:]
    vao = argv[0] if argv else MAC_DINH_VAO
    if not os.path.isdir(vao):
        print(f'Không thấy thư mục "{vao}".')
        try:
            vao = input('Kéo thả thư mục ảnh vào đây rồi bấm Enter: ').strip().strip('"')
        except EOFError:
            return
        if not os.path.isdir(vao): print('Vẫn không thấy thư mục.'); return
    ra = argv[1] if len(argv) > 1 else os.path.join(vao, 'da-cat')
    print('Đọc ảnh trong:', vao); print('Ghi ra:', ra, '\n')
    chay(vao, ra, toi_da)


if __name__ == '__main__':
    main(sys.argv[1:])
