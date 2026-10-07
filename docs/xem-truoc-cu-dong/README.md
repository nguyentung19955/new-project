# Xem trước tự cử động — 90 ảnh dựng xương (phần 1–3)

Mỗi `<mã>.webp`: đứng thở → đánh (lấy đà · ra đòn · thu về) → trúng đòn. `tong-hop.jpg`: 3 khung (đứng · ra đòn · trúng đòn) của cả 90.
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
| phuthuy | gậy phép | Sứa Tinh vẽ thành rồng nhỏ → nhún nguyên khối |
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
| adv | nỏ | kiếm → chém |
| antiem | tay không | giáo → đâm |
| auco | gậy phép | giáo → đâm |
| baahoa | tay không | đuốc lửa → phép |
| caolo | nỏ | kiếm trong vỏ cầm ngang → đâm |
| caong | tay không | giáo → đâm |
| cdt | gậy phép | giáo cầm chéo → đâm |
| chantinh | rìu | giáo → đâm |
| chantrau | nỏ | gậy đầu trâu → bổ |
| chodo | giáo | đao → chém |
| chuongdong | gậy phép | chiêng đồng → phép |
| cungan | cung | không thấy cung → nhún nguyên khối |
| cuoi | Chú Cuội (rìu) | đòn gánh vác vai → nhún nguyên khối (tách sẽ gãy gánh) |
| daibang | tay không | giáo → bổ |
| dapde | giáo | gậy đầu thú → bổ |
| dotnuong | kiếm | giáo → bổ |

Khớp game: anvuong, giaodong, giong, haba, denroi (đèn lồng → phép), lachau, lactuong, lyngu, nguphu, ongdung, ongthoi, thaylang, thaymo, thuytinh, trongdong; quái không người nhún nguyên khối: camap, cao, casau, chimbao, cua (càng dính sát mặt), dacon, doi, echme, giaolong, muc, nongnoc, ran, rua, thachtinh, voichien.

## Tách nền khó
- **muc**: thân hồng trùng màu nền — giữ được thân, còn vài lỗ nhỏ trong xúc tu và 1 mảng hồng nhỏ giữa xúc tu phải.
- **kinhduong**: viền trắng kiểu sticker — nhánh tu-cu-dong đã bóc viền (giữ khung, rig vẫn khớp).
- **potaoapui**: giữ lửa dính thân / giáo, bỏ tia lửa và dấu ✦ rời.
- **haisen**: lư đồng đặt cạnh (rời thân) — giữ lại, đứng yên.

- **Phần 1** (tách nền ở nhánh claude/tu-cu-dong): cao, casau, chimbao, cungan, cua bị ăn mất chân / hở giữa người (thân hồng-đỏ trùng màu nền) → tách lại bằng `tools/tach-nen-hong.py --strict … --shadow chimbao` (không khoét lỗ kín; bóng hồng của chimbao chỉ bỏ phần nằm ngoài nét viền đen). 25 ảnh phần 1 còn lại giữ bản của nhánh kia.

## Rig phải chỉnh tay
Rig tự đoán của engine bắt nhầm dải băng / tóc / đuôi ở hầu hết ảnh → cả 48 rig có tay (đợt 2–3) và 19 rig phần 1 đều đặt tay (tools/rig-dung-xuong.txt).
Phải sửa lại sau khi xem khung động: dapde (đầu gậy sót lại → nới khối), caolo, anvuong (khối giáo ăn vào áo choàng), cua (đổi sang nguyên khối), hotinh (đầu giáo rộng hơn khối rig), thansuong (lệch cán giáo), ngutinh (khối đinh ba ăn vào tóc), kinhduong (viền trắng sót → thêm hút mảnh viền), các cán dài dựng đứng (thêm `amp`).

## Cần GEN LẠI (ảnh vẽ sai — game đang loại trừ bằng `CD_SKIP` trong js/tu-cu-dong.js, giữ hiển thị cũ)
Rig trong js/rigs.js của các mã này vẫn để đó (vô hại vì `CD_SKIP` chặn ảnh đơn); gen lại ảnh thì soát lại rig.

| Mã | Đúng ra (docs/PROMPT-DUNG-XUONG) | Ảnh hiện tại | Lý do |
|---|---|---|---|
| cao | Cáo Con | rồng con hồng có sừng | sai loài |
| camap | Cá Mập Yêu | rồng con xanh vây cá | sai loài |
| cua | Cua Khổng Lồ | rồng con đỏ có 1 càng | sai loài |
| chimbao | Chim Bão | rồng con hồng có cánh | sai loài |
| rua | Rùa Giáp | rồng con xanh mai rùa | sai loài |
| ran | Rắn Độc | rồng con xanh lá | sai loài |
| dacon | Đá Con | rồng con xanh | sai loài |
| nongnoc | Nòng Nọc | rồng con xanh | sai loài |
| phuthuy | Sứa Tinh | rồng con xanh đuôi cá | sai loài |
| thachtinh | Thạch Tinh | người có sừng, không vũ khí | sai loài |
| voichien | Voi Chiến | người có sừng | sai loài |
| linhan | Quỷ Giáo (giáo) | người có sừng, không giáo | sai loài + thiếu vũ khí |
| cungan | Sói Cung Thủ (cung) | rồng/người có sừng, không cung | sai loài + thiếu vũ khí |
| hotinh | Hồ Tinh Chín Đuôi (boss) | rồng nhiều tay cầm giáo | sai loài |
| chantinh | Chằn Tinh (boss, rìu) | người-rồng cầm giáo | sai loài + sai vũ khí |
| nguphu | Ngư Phủ Sông Đà (tướng, giáo) | tiên cá cầm đinh ba | sai loài |
| tre | Dũng Sĩ Tre Làng (giáo) | kiếm cắm đất bên cạnh, tay không cầm | vũ khí rời |
| dotnuong | Chàng Đốt Nương (kiếm) | kiểu 3D bóng, cầm giáo | lệch phong cách + sai vũ khí |

### Nên gen lại thêm (chưa trong `CD_SKIP`, tôi soát thấy khi làm rig)
| Mã | Đúng ra | Ảnh hiện tại | Lý do |
|---|---|---|---|
| casau | Cá Sấu | rồng con hồng mõm cá sấu, có sừng | sai loài (lai rồng) |
| doi | Dơi Hang | rồng con có cánh dơi | sai loài (lai rồng) |
| echme | Ếch Mẹ | ếch có đuôi rồng, đội mũ | lệch loài nhẹ |
| kybinh | Quỷ Cưỡi Lợn (giáo) | người đầu lợn rừng, không cưỡi, không giáo | sai mô tả + thiếu vũ khí |
| xathu | Xạ Thủ Văn Lang (cung) | cầm đao, không có cung | sai vũ khí (lớp cung thủ) |
| thosan | Thợ Săn Rừng (kiếm) | cầm cung | sai vũ khí |
| yeutinh | Yêu Tinh Rừng (rìu) | không vũ khí | thiếu vũ khí |
| haisen (Cô Hái Sen), melua (Mẹ Lúa) | gậy phép | không gậy (lư đồng / quang gánh lúa) | thiếu vũ khí |
| cuoi | Chú Cuội (rìu) | vác đòn gánh | sai vũ khí |
Các tướng cầm giáo/kiếm/đao thay vì gậy phép / tay không (bảng ở trên) chạy được bình thường; chỉ cần gen lại nếu muốn hình khớp kiểu đánh trong game.
