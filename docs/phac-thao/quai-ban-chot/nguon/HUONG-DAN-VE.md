# Cách vẽ quái bản chốt (đọc trước khi vẽ)

Dự án game pixel "Linh Khí": game hành động màn ngang, dân gian Việt Nam, khung logic 480x270. Hero là em bé tinh linh chibi cao 25 điểm ảnh. Mọi chữ viết ra (tên, mô tả, chú thích trong mã) dùng tiếng Việt có dấu, câu đơn giản. Không dùng dấu gạch ngang dài.

## Nét chuẩn (bắt buộc theo)
Nét chuẩn là "bản 2 vùng biển". MỞ XEM ảnh và ĐỌC mã trước khi vẽ:
- Ảnh: `docs/phac-thao/quai-bien/ban-2/quai-bien.png`, `tinh-anh-va-trum-nho.png`, `ngu-tinh.png`
- Mã: `docs/phac-thao/quai-bien/nguon/but.js` (bút vẽ: S, set, get, ell, rect, line, poly, mirror, outline, bbox, draw, shadow), `docs/phac-thao/quai-bien/ban-2/nguon/quai2.js` (ball4, mat = mắt dữ, mieng = miệng răng nhọn, vien = viền tối, ha, bong, các con Q2.*), `tinhanh2.js` (lap, Q2.cuaTuong, Q2.caNocChua, Q2.cuaDa), `ngutinh2.js` (Q2.nguTinh), `quai-bien/nguon/tinhanh.js` (crystal, aura), `ngutinh.js` (pl = đường gấp khúc).
- Bảng màu rừng và lâu đài có sẵn trong `docs/phac-thao/quai-ban-chot/nguon/chung.js` (LUCR, NAUG, TIMD, DOCX, DOCAM, LUAV, THANH, XUONGT; mỗi dải 4 màu từ tối đến sáng). Được thêm màu riêng.

Yêu cầu nét: pixel sắc, viền tối (gọi `vien(g)` sau khi vẽ thân, hiệu ứng phát sáng vẽ sau viền); DỮ vừa phải (mày chau, mắt xếch có tròng sáng dùng `mat()`, răng nhọn dùng `mieng()`, gai, nanh, vuốt sắc, dáng chúi về trước); NHIỀU CHI TIẾT (vảy, vân, bóng 3 lớp bằng `ball4`, phụ kiện nhỏ, sẹo, rêu, vết nứt, đốm sáng); hình bóng đọc được ngay ở cỡ thật. KHÔNG được dễ thương, KHÔNG sơ sài. Chủ dự án đã chê: "Quái cho thêm nhiều chi tiết", "Quái dữ hơn".

Cỡ (cao tính theo `bbox(g).h`, điểm ảnh): quái thường 20 đến 32; tinh anh 38 đến 44; trùm nhỏ 55 đến 65; trùm vùng 100 đến 130.
Quái nhìn về BÊN TRÁI (hero đứng bên trái) hoặc nhìn thẳng.
Mỗi hàm trả về một lưới `g` (tạo bằng `S(w,h)`). Nếu có hiệu ứng thừa ra dưới chân thì đặt `g.foot`, `g.cx`.

## Cách dựng và xem thử
Thư mục làm việc: `docs/phac-thao/quai-ban-chot/nguon/`. Chỉ nạp file của mình để không vướng người khác:

    cd docs/phac-thao/quai-ban-chot/nguon
    python3 dung.py --js TENFILE.js xem "TO.xemLuoi(DOITUONG, 5)" /đường/dẫn/tạm/xem.png

`TO.xemLuoi(obj, s, cols)` vẽ mọi hàm trong `obj` (gọi không tham số) phóng `s` lần, có em bé bên cạnh, ghi cỡ từng con. Muốn xem biến thể: `TO.xemLuoi({a: QX.con(true), b: QX.con2()}, 5)`.
Rồi dùng công cụ Read MỞ ảnh ra NHÌN, sửa đến khi đẹp: không vỡ nét, không bị cắt mép lưới, đủ dữ, đủ chi tiết, đúng cỡ. Nên xem thử sớm và nhiều lần, mỗi lần vài con.
Nếu trang báo "LỖI" thì đó là lỗi mã, phải sửa.

## Luật
- CHỈ viết đúng file được giao trong thư mục `nguon/`. Ảnh xem thử ghi ra thư mục tạm (scratchpad), KHÔNG ghi vào kho.
- Tên biến, hàm ở mức ngoài cùng của file phải có tiền tố riêng được giao (các file nạp chung một trang, trùng tên `const` là hỏng).
- KHÔNG đụng git (không commit, không push, không đổi nhánh), trừ khi lời giao việc nói khác.
- Không hỏi lại ai. Hết giờ thì dừng với cái tốt nhất đang có, mã phải chạy được.
- Trả lời cuối: ngắn, tiếng Việt: đã vẽ những gì, cỡ từng con, chỗ nào còn chưa ưng.
