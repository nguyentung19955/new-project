# Xem trước tự cử động — ảnh dựng xương đợt 2–3 (60 nhân vật)

Mỗi `<mã>.webp`: đứng thở → đánh (lấy đà · ra đòn · thu về) → trúng đòn. `tong-hop.jpg`: 3 khung (đứng · ra đòn · trúng đòn) của cả 60.
Dựng bằng chính engine (`cdBuildRig` + `cdRigFrame` trong js/tu-cu-dong.js) với rig ở js/rigs.js.
Chân (dưới đường hông) đứng yên tuyệt đối — đã đo: không điểm ảnh nào dưới hông đổi giữa các khung.

## Ảnh cầm vũ khí KHÁC game (đã chọn chuyển động theo vũ khí trong ẢNH)

| Mã | Game | Trong ảnh → kiểu đánh |
|---|---|---|
| haisen | gậy phép | không cầm gậy → giơ tay phát phép (orb) |
| halong | tay không | giáo → đâm |
| hotinh | gậy phép | giáo dựng đứng → bổ (biên độ 0.45) |
| kimquy | tay không | đinh ba → đâm |
| kinhduong | kiếm | gậy lưỡi lá → bổ |
| kybinh | giáo | không vũ khí → nhún nguyên khối |
| kylan | tay không | giáo → đâm |
| langlieu | gậy phép | giáo 2 tay → đâm |
| linhan | giáo | không vũ khí → nhún nguyên khối |
| llq | kiếm | giáo → đâm |
| longnu | tay không | kiếm → chém |
| lucsi | tay không | vác giáo sau lưng — giữ đấm tay phải |
| matroi | gậy phép | giáo → bổ |
| mau | gậy phép | kiếm cầm ngang thân → đâm |
| maudia | gậy phép | kiếm 2 tay → đâm |
| mauthoai | gậy phép | giáo → đâm |
| melua | gậy phép | quang gánh lúa + liềm → nhún nguyên khối |
| mychau | tay không | kiếm 2 tay → đâm |
| nghedong | tay không | 2 kiếm → đâm |
| ngutinh | tay không | đinh ba → bổ |
| ongho | tay không | kiếm → chém |
| ongtao | gậy phép | đao → đâm |
| phuthuy | gậy phép | rồng nhỏ không gậy → nhún nguyên khối |
| potaoapui | kiếm | giáo → đâm |
| sodua | tay không | giáo → đâm |
| tanvien | gậy phép | giáo → đâm |
| thachsanh | rìu | giáo → đâm |
| thansan | giáo | đao → chém |
| thansuong | tay không | giáo → bổ |
| thienloi | rìu | kiếm cầm ngang → đâm |
| thocong | gậy phép | đao 2 tay → đâm |
| thogom | tay không | vồ gốm + khiên → bổ |
| thoren | rìu | giáo → bổ |
| thosan | kiếm | cung → bắn |
| thuongluong | tay không | giáo rìu → đâm |
| tiendung | gậy phép | kiếm → chém (biên độ 0.6) |
| tom | giáo | càng tôm → đấm |
| tre | giáo | kiếm cắm đất bên cạnh, tay không cầm → nhún nguyên khối |
| trieuda | kiếm | kích → bổ |
| truongchi | gậy phép | giáo → đâm |
| trutroi | giáo | kiếm → chém |
| viemde | gậy phép | giáo ngắn → đâm |
| xathu | cung | đao, không thấy cung → chém |
| yeutinh | rìu | không vũ khí → nhún nguyên khối |

Khớp game: lachau, lactuong, lyngu, nguphu, ongdung, ongthoi, thaylang, thaymo, thuytinh, trongdong; quái không người nhún nguyên khối: muc, nongnoc, ran, rua, thachtinh, voichien.

## Tách nền khó
- **muc**: thân hồng trùng màu nền — giữ được thân, còn vài lỗ nhỏ trong xúc tu và 1 mảng hồng nhỏ giữa xúc tu phải.
- **kinhduong**: viền trắng kiểu sticker (giữ nguyên), 1 chấm hồng nhỏ dưới chân.
- **potaoapui**: giữ lửa dính thân / giáo, bỏ tia lửa và dấu ✦ rời.
- **haisen**: lư đồng đặt cạnh (rời thân) — giữ lại, đứng yên.

## Rig phải chỉnh tay
Rig tự đoán của engine bắt nhầm dải băng / tóc / đuôi ở hầu hết ảnh → cả 46 rig có tay đều đặt tay (tools/rig-dung-xuong.txt).
Phải sửa lại sau khi xem khung động: hotinh (đầu giáo rộng hơn khối rig), thansuong (lệch cán giáo), ngutinh (khối đinh ba ăn vào tóc), kinhduong (viền trắng sót → thêm hút mảnh viền), các cán dài dựng đứng (thêm `amp`).
