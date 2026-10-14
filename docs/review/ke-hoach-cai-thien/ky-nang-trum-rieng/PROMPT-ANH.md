# Prompt ảnh còn thiếu cho 10 chiêu mới của trùm vùng / trùm nhỏ / tinh anh

Ngày 14/10/2026. Ảnh máy chủ đang sát trần 26 MB nên phiên này **không thêm ảnh mới vào build**. Các hình dưới đây đang vẽ tạm tối giản bằng code trong `game/js/chieu_trum.js` (hàm `ve` của từng vật). Khi có chỗ: vẽ ảnh theo prompt, tách bằng trang công cụ `tools/tach-hieu-ung` thành `game/art/custom/<mã>.sprite.json`, rồi trong hàm `ve` tương ứng gọi `G.fxAnh.veK(...)` khi `coAnh('<mã>')` (giữ phần vẽ code làm dự phòng).

Mọi ảnh: pixel art, nền trơn **#00FF00**, dải 6–8 khung xếp NGANG, các khung CÁCH XA NHAU (khoảng trống ít nhất bằng một khung), không bóng đổ, không chữ, không logo. Gửi kèm ảnh mẫu ghi ở mỗi mục để ChatGPT bắt đúng nét.

Đã dùng lại ảnh có sẵn (không cần vẽ): `hu-cot-nuoc` (Cột nước đuổi), `hu-xoay-nuoc` (Xoáy hút), `hu-bang-vo` (nổ tâm xoáy, tường tinh thể vỡ), `hu-nut-dat` (vết nứt Bổ rìu), `hu-no-lua` (đáp Vồ nhảy), `hu-phan-than` (bóng cáo hiện / tan, nấm con bị chém), `hu-no-doc` (nấm con nổ, Nấm Phồng Chúa đáp), `hu-nam-moc` (nấm con trồi — dùng tạm khung 5 làm dáng đứng), `hu-gai-bang` (tường tinh thể dựng), `hu-vung-lua` (vệt dầu cháy), `hu-va-cham` (Cá Nóc Chúa dội tường). Bóng cáo của Hồ ly phân thân vẽ bằng chính ảnh thân Hồ Tinh (mờ 70%).

## 1. `hu-manh-san-ho` — mảnh san hô văng của Bổ rìu san hô (Ngư Tinh c1)

Ảnh mẫu cần gửi: `nguTinh.sprite.json` (khung đứng, thấy rìu san hô) và `hu-nut-dat.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 6 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU (khoảng trống ít nhất bằng một khung), nền trơn một màu xanh lá #00FF00. Nội dung: MỘT MẢNH SAN HÔ nhọn vỡ ra từ chiếc rìu san hô, đang BAY SANG PHẢI sát mặt sàn, nhìn hơi chếch từ trên xuống (game nhìn từ trên). Mảnh san hô dài khoảng 8 điểm ảnh, hồng san hô #ff7a8a, mảng sáng #ffd0d8, lõi trắng #ffe0e6, vài chấm bọt nước xanh nhạt #a6deff bám theo sau. Khung 1–2: mảnh vừa bật ra, nhỏ, kèm vệt bụi nước; khung 3–4: mảnh bay, xoay nửa vòng, vệt sáng phía sau dài ra; khung 5–6: mảnh chạm sàn vỡ vụn thành 3–4 hạt hồng nhỏ rồi tan. Viền ngoài một nét tối #14182e. Không bóng đổ, không chữ, không logo, không vẽ con Ngư Tinh.
```

## 2. `hu-tuong-tinh-the` — một khúc tường tinh thể của Cua Đá (Tường tinh thể)

Ảnh mẫu cần gửi: `cuaDa.sprite.json` (thấy tinh thể trên lưng cua) và `hu-gai-bang.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 8 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: MỘT KHÚC TƯỜNG TINH THỂ băng mọc thẳng từ sàn đá, nhìn chếch từ trên xuống: một cụm 3 cột tinh thể lục giác đứng sát nhau, rộng khoảng 12 điểm ảnh, cao khoảng 22 điểm ảnh, xanh băng #5fb8e0, mặt sáng #d8f6ff, cạnh trắng #ffffff, chân cột có vài mảnh đá vụn xám #6a7080. Khung 1–3: tinh thể trồi lên từ sàn (thấp → cao hẳn), có bụi đá bắn nhẹ; khung 4–5: đứng yên, lấp lánh một điểm sáng chạy dọc cạnh; khung 6: rạn nứt trắng chạy khắp cột (sắp vỡ); khung 7–8: vỡ tung thành nhiều mảnh tinh thể nhỏ văng ra hai bên TRÁI và PHẢI (vuông góc với tường), mảnh mờ dần. Viền ngoài một nét tối #14182e. Không bóng đổ, không chữ, không logo, không vẽ con cua.
```

## 3. `hu-vet-dau` — vệt dầu của Hũ Chúa (Đổ dầu châm lửa)

Ảnh mẫu cần gửi: `huChua.sprite.json` và `hu-vung-lua.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 6 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: MỘT ĐOẠN VỆT DẦU ĐEN loang trên sàn đá, nhìn từ trên xuống, hình dải dẹt nằm ngang dài khoảng 24 điểm ảnh, cao khoảng 9 điểm ảnh, mép lượn sóng mềm (đầu trái và đầu phải nối liền được với đoạn khác). Màu nâu đen dầu #28180a, lòng #3a2410, vệt bóng loáng vàng đục #a08240 và vài chấm sáng trắng. Khung 1–4: dầu óng ánh nhẹ (vệt bóng trượt dần sang phải), khung 4 nối được về khung 1; khung 5–6: mép dầu bắt đầu đỏ rực #c43c10 và có tia lửa nhỏ #ffd23c (sắp bắt lửa). Viền ngoài mảnh #14182e. Không bóng đổ, không chữ, không logo, không vẽ cái hũ.
```

## 4. `hu-nam-con` — nấm con của Nấm Chúa (Nấm mẹ đẻ con)

Ảnh mẫu cần gửi: `namChua.sprite.json` và `hu-nam-moc.sprite.json`.

```
Vẽ MỘT tấm ảnh pixel art 2D: dải 8 khung xếp NGANG trên một hàng, các khung CÁCH XA NHAU, nền trơn một màu xanh lá #00FF00. Nội dung: MỘT CÂY NẤM CON độc nhỏ đứng trên sàn, nhìn chếch từ trên xuống, cao khoảng 14 điểm ảnh: mũ tròn tím #9a48d4 có đốm xanh chanh #c4f43c, mép mũ sáng #d894ff, thân trắng ngà #e8e0c4, hai chấm mắt đen nhỏ trên thân. Khung 1–2: nấm con vừa trồi khỏi đất (thấp, đất vụn quanh chân); khung 3–5: đứng nhún nhảy (mũ phồng lên xẹp xuống nhẹ); khung 6–8: mũ PHỒNG TO dần, đốm sáng chớp trắng, mép mũ nứt ra có khí độc xanh chanh rỉ ra (sắp nổ). Viền ngoài một nét tối #14182e. Không bóng đổ, không chữ, không logo, không vẽ Nấm Chúa.
```
