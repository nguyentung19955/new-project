// 28/10 camera kiểu Dead Cells (chèn bởi tao-p0c.py vào BẢN CHÉP khoi-phong-b.js): camera đi liên tục A → F nên nền giữa không còn
// "mỗi phòng một bộ, hoà theo phần màn" (camera dừng giữa 2 phòng → 2 bộ chồng nhau mờ 50 %). Thay bằng MỘT dải mảnh đặt thưa theo toạ độ
// PARALLAX liên tục: u = x trên màn khi camera ở mép trái phòng A (gx = u − (camx − mép A) × 0,4). Khoảng hở giữa 2 mảnh ≥ 100 px (trừ cặp
// tháp + cây của F giữ nguyên như thiết kế F). Mỗi mảnh giữ kiểu / nén sáng / độ mờ của phòng gốc; vị trí chọn để khi camera ở GIỮA phòng
// mảnh nằm gần chỗ cũ: A tháp cửa sổ vàng như cũ; B tháp LẬT NGANG (khỏi trùng hình tháp A ngay bên trái) sau ván (màn 467–667); C cây trái; D chỉ cây ở 2 mép (giữa D tối như phản hồi 8);
// E không còn mảnh riêng (thấy cây D bên trái, tháp F bên phải); F (cuối thế giới) đúng y như cũ. Bản ?cam=phong: bộ cũ ở trên.
const NEN_LIEN = [[PA_SO, 0, -150], [PA_SO, 1, 470], [PB_SO, 1, 800, true], [PC_SO, 0, 1110], [PD_SO, 1, 1900], [PF_SO, 0, 2440], [PF_SO, 1, 2660]];
if (!CAM.phong) NEN_ABC.giua = NEN_LIEN.map(([so, i, u, lat]) => Object.assign({}, so.nen.giua[i], {x: u, rc: PA.x0 * T, w: 1, lien: true}, lat ? {lat: true} : {}));
