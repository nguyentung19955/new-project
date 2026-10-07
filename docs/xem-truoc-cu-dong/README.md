# Xem trước tự cử động — 90 ảnh dựng xương (phần 1–3)

Mỗi `<mã>.webp`: đứng thở → đánh (lấy đà · ra đòn · thu về) → trúng đòn. `tong-hop.jpg`: 3 khung (đứng · ra đòn · trúng đòn) của cả 90.
Dựng bằng chính engine (`cdBuildRig` + `cdRigFrame` trong js/tu-cu-dong.js) với rig ở js/rigs.js.
Chân (dưới đường hông) đứng yên tuyệt đối — đã đo: không điểm ảnh nào dưới hông đổi giữa các khung.

<!-- bang-90 (node tools/build-prompt-gen-lai.js — đừng sửa tay) -->
## Rà soát cả 90 ảnh: vật cầm có hợp nhân vật không (gen lại 57 · giữ 33)

| Mã | Tên | Vật / dáng trong ảnh | Vật hợp lý | Quyết định |
|---|---|---|---|---|
| lactuong | Lạc Tướng | rìu đồng | rìu xéo Đông Sơn | giữ |
| lucsi | Lực Sĩ Núi | tay không (giáo đeo lưng) | tay không / tảng đá | giữ |
| xathu | Xạ Thủ Văn Lang | đao | cung | **gen lại** — cầm đao, không có cung — Xạ Thủ là lớp cung thủ duy nhất bắn quái bay ở đầu game (vai trò Tầm xa) |
| thosan | Thợ Săn Rừng | cung + ống tên | cung / dao săn — cung hợp thợ săn → game đổi sang cung | giữ |
| thaymo | Thầy Mo Lửa | gậy đầu rồng lửa | gậy hồ lô lửa | giữ |
| thansuong | Thần Sương Núi | giáo | tinh thể băng / phép sương | **gen lại** — cầm giáo — Thần Sương là thần sương núi, phép băng |
| giong | Thánh Gióng | giáo | gậy sắt / tre — hợp | giữ |
| llq | Lạc Long Quân | giáo | kiếm / giáo — vua rồng chiến binh, hợp | giữ |
| kimquy | Thần Kim Quy | NGƯỜI đuôi rồng cầm đinh ba | rùa vàng thần | **gen lại** — người đuôi rồng cầm đinh ba — Kim Quy là RÙA VÀNG thần |
| thachsanh | Thạch Sanh | giáo | rìu tiều phu | **gen lại** — cầm giáo — Thạch Sanh là tiều phu: rìu đốn củi (Q "Rìu Đốn Củi") + cung tên vàng |
| caolo | Cao Lỗ | kiếm trong vỏ | nỏ máy | **gen lại** — cầm kiếm trong vỏ — Cao Lỗ là người chế nỏ thần (dòng Cao Lỗ xuyên giáp) |
| antiem | Mai An Tiêm | giáo | quả dưa hấu | **gen lại** — cầm giáo — Mai An Tiêm là người trồng dưa trên đảo |
| auco | Âu Cơ | giáo | đũa lông hạc / bọc trứng | **gen lại** — cầm giáo — Âu Cơ là Mẹ Tiên (bọc trăm trứng) |
| cdt | Chử Đồng Tử | giáo | gậy thần + nón | **gen lại** — cầm giáo — Chử Đồng Tử gắn với gậy thần + nón thần (nội tại / Q "Gậy Thần") |
| tiendung | Tiên Dung | kiếm | quạt tiên | **gen lại** — cầm kiếm — Tiên Dung là công chúa (quạt tiên, mưa hoa) |
| langlieu | Lang Liêu | giáo | mâm bánh chưng | **gen lại** — cầm giáo — Lang Liêu là hoàng tử hiền làm bánh chưng |
| giaodong | Dũng Sĩ Giáo Đồng | giáo đồng | giáo đồng | giữ |
| chuongdong | Thầy Chuông Đồng | chiêng đồng | chuông / chiêng | giữ |
| nghedong | Nghê Đồng | NGƯỜI cầm song kiếm | linh thú Nghê bằng đồng | **gen lại** — người cầm song kiếm — Nghê Đồng là LINH THÚ bằng đồng (chó-sư tử canh đình) |
| mychau | Mỵ Châu | kiếm | áo lông ngỗng, tay rắc lông | **gen lại** — cầm kiếm — Mỵ Châu là công chúa (áo lông ngỗng) |
| kylan | Kỳ Lân Vàng | NGƯỜI cầm giáo | linh thú kỳ lân | **gen lại** — người đội mũ kỳ lân cầm giáo — Kỳ Lân là LINH THÚ |
| thienloi | Thiên Lôi | kiếm cầm ngang | lưỡi / búa tầm sét | **gen lại** — cầm kiếm ngang — Thiên Lôi gắn với lưỡi / búa tầm sét (nội tại "Búa Tầm Sét", R "Búa Thiên Lôi") |
| tre | Dũng Sĩ Tre Làng | kiếm cắm đất, tay không | sào tre cầm tay | **gen lại** — kiếm cắm đất bên cạnh, tay không cầm gì — vũ khí rời |
| ongthoi | Thợ Săn Ống Thổi | nỏ | ống thổi / nỏ săn — vẫn là vũ khí săn bắn xa | giữ |
| sodua | Sọ Dừa | giáo | quả dừa / sáo | **gen lại** — cầm giáo — Sọ Dừa là chàng trai hiền thổi sáo |
| cuoi | Chú Cuội | đòn gánh + giỏ | rìu / đòn gánh tiều phu — hợp | giữ |
| melua | Mẹ Lúa | liềm + gùi lúa | bó lúa / liềm — hợp | giữ |
| dapde | Người Đắp Đê | giáp vàng + gậy chĩa đầu thú | xẻng / cuốc nông dân | **gen lại** — giáp vàng cầm gậy chĩa đầu thú — Người Đắp Đê là nông dân đắp đê |
| chantrau | Trẻ Chăn Trâu | gậy đầu trâu | gậy chăn trâu / ná — gậy hợp → game đổi cận chiến | giữ |
| ongdung | Ông Đùng | giáo | đòn gánh đất | **gen lại** — cầm giáo — Ông Đùng là người khổng lồ gánh đất |
| thocong | Thổ Công | đại đao | gậy tre hồ lô | **gen lại** — cầm đại đao — Thổ Công là thần đất giữ nhà hiền lành |
| tanvien | Sơn Tinh | giáo | giáo / gậy — thần núi chiến đấu, hợp | giữ |
| maudia | Mẫu Địa | NAM cầm kiếm | nữ thần cầm chum hạt giống | **gen lại** — nam giới cầm kiếm — Mẫu Địa là Thánh MẪU (nữ thần đất) |
| chodo | Chàng Chèo Đò | giáp + đao | mái chèo | **gen lại** — giáp cầm đao — Chàng Chèo Đò là người lái đò |
| haisen | Cô Hái Sen | tay không, lư đồng bên cạnh | ô lá sen / bông sen — không cầm vũ khí, hợp | giữ |
| lyngu | Lý Ngư Tướng Quân | giáo | đao cán dài — tướng võ, hợp | giữ |
| truongchi | Trương Chi | giáp + giáo | sáo trúc | **gen lại** — giáp cầm giáo — Trương Chi là chàng đánh cá hát hay thổi sáo |
| halong | Rồng Mẹ Hạ Long | NGƯỜI đội mũ rồng cầm giáo | rồng | **gen lại** — người đội mũ rồng cầm giáo — Rồng Mẹ Hạ Long là RỒNG |
| longnu | Long Nữ Động Đình | NAM cầm kiếm | nữ thần cầm ngọc rồng | **gen lại** — nam giới cầm kiếm — Long Nữ là nữ thần rồng (ngọc rồng) |
| dotnuong | Chàng Đốt Nương | giáo (kiểu 3D bóng) | dao rựa + đuốc | **gen lại** — kiểu 3D bóng, cầm giáo — lệch phong cách + sai vũ khí |
| denroi | Cô Thả Đèn Trời | đèn lồng | đèn trời | giữ |
| potaoapui | Vua Lửa Pơtao Apui | giáo | gươm thần (lửa) | **gen lại** — cầm giáo — Pơ Tao Apui (Vua Lửa) giữ gươm thần (nội tại "Gươm Thần Gia Rai", Q "Gươm Lửa") |
| baahoa | Bà Hỏa | đuốc lửa | lửa trong tay — hợp | giữ |
| kinhduong | Kinh Dương Vương | đại đao lưỡi lá | kiếm / đao — vua chiến binh, hợp | giữ |
| viemde | Viêm Đế Thần Nông | giáo ngắn | cuốc lửa | **gen lại** — cầm giáo ngắn — Viêm Đế Thần Nông là thần nông (dạy cày cấy) |
| thoren | Thợ Rèn Đông Sơn | giáo | búa rèn | **gen lại** — cầm giáo — Thợ Rèn gắn với búa lò rèn |
| nguphu | Ngư Phủ Sông Đà | tiên cá + đinh ba | người + chĩa ba / lưới | **gen lại** — vẽ thành tiên cá cầm đinh ba — sai loài |
| thogom | Thợ Gốm Phù Lãng | bình gốm + đĩa gốm | bình gốm — khớp game (ném bình) | giữ |
| thaylang | Thầy Lang Lá Thuốc | gậy chống | gậy chống | giữ |
| trongdong | Thần Trống Đồng | trống cầm tay | dùi trống / trống | giữ |
| caong | Thần Cá Ông | NGƯỜI cầm giáo | cá voi thần | **gen lại** — người râu cầm giáo — Cá Ông là CÁ VOI thần |
| ongtao | Ông Táo | đại đao | kẹp than / quạt bếp | **gen lại** — cầm đại đao — Ông Táo là thần bếp |
| matroi | Nữ Thần Mặt Trời | giáo | quyền trượng mặt trời | **gen lại** — cầm giáo — Nữ Thần Mặt Trời dắt mặt trời |
| mauthoai | Mẫu Thoải | NAM cầm giáo | nữ thần, gậy gáo nước | **gen lại** — nam giới cầm giáo — Mẫu Thoải là Thánh MẪU sông nước |
| trutroi | Thần Trụ Trời | kiếm | cột trời | **gen lại** — cầm kiếm — Thần Trụ Trời là người khổng lồ đắp cột chống trời |
| ongho | Chúa Sơn Lâm | NGƯỜI cầm kiếm | hổ | **gen lại** — người khăn vàng cầm kiếm — Chúa Sơn Lâm (Ông Ba Mươi) là HỔ |
| lachau | Lạc Hầu | búa / rìu đá | búa đá + khiên đồng | giữ |
| thansan | Thần Săn Ba Vì | đao | giáo / dao săn — đao rừng hợp thợ săn | giữ |
| adv | An Dương Vương | kiếm | nỏ thần Linh Quang | **gen lại** — cầm kiếm — An Dương Vương gắn với nỏ thần Linh Quang (nội tại "Nỏ Linh Quang" bắn xuyên hàng) |
| mau | Mẫu Thượng Ngàn | NAM cầm kiếm | nữ thần cầm cành hoa | **gen lại** — nam giới cầm kiếm — Mẫu Thượng Ngàn là bà chúa núi rừng |
| camap | Cá Mập Yêu | rồng con vây cá | cá mập | **gen lại** — rồng con xanh có vây cá — sai loài |
| cao | Cáo Con | rồng con hồng | cáo | **gen lại** — rồng con hồng có sừng — sai loài |
| cua | Cua Khổng Lồ | rồng con 1 càng | cua | **gen lại** — rồng con đỏ có 1 càng — sai loài |
| kybinh | Quỷ Lợn Rừng | người đầu lợn rừng | quỷ lợn rừng — hợp (game đổi tên) | giữ |
| voichien | Voi Chiến | người có sừng | voi chiến | **gen lại** — người có sừng — sai loài |
| tom | Tôm Binh | tôm có càng | tôm, càng — hợp | giữ |
| casau | Cá Sấu | rồng hồng mõm cá sấu | cá sấu | **gen lại** — rồng con hồng mõm cá sấu, có sừng — lai rồng |
| rua | Rùa Giáp | rồng con mai rùa | rùa | **gen lại** — rồng con xanh đeo mai rùa — sai loài |
| phuthuy | Sứa Tinh | rồng con | sứa tinh + cành san hô | **gen lại** — rồng con xanh, không cành san hô — sai loài + thiếu vật cầm |
| chimbao | Chim Bão | rồng con có cánh | chim bão | **gen lại** — rồng con hồng có cánh — sai loài |
| echme | Ếch Mẹ | ếch đuôi rồng đội mũ | ếch | **gen lại** — ếch có đuôi rồng, đội mũ — lệch loài |
| nongnoc | Nòng Nọc | rồng con | nòng nọc | **gen lại** — rồng con xanh — sai loài |
| giaolong | Giao Long Con | rồng con | giao long — hợp | giữ |
| yeutinh | Yêu Tinh Rừng | yêu tinh lá rừng, tay không | yêu tinh rừng — hợp | giữ |
| ran | Rắn Độc | rồng con | rắn | **gen lại** — rồng con xanh lá — sai loài |
| doi | Dơi Hang | rồng cánh dơi | dơi | **gen lại** — rồng con có cánh dơi — lai rồng |
| thachtinh | Thạch Tinh | người có sừng | golem đá | **gen lại** — người có sừng, không phải golem đá — sai loài |
| dacon | Đá Con | rồng con | đá con | **gen lại** — rồng con xanh — sai loài |
| linhan | Quỷ Giáo | người có sừng, không giáo | quỷ giáo cầm giáo + khiên | **gen lại** — người có sừng, KHÔNG cầm giáo — thiếu vũ khí |
| cungan | Sói Cung Thủ | rồng/người, không cung | sói cầm cung | **gen lại** — rồng / người có sừng, không có cung — sai loài + thiếu vũ khí |
| muc | Mực Tinh | bạch tuộc | mực / bạch tuộc — hợp | giữ |
| anvuong | Quỷ Vương Ân | quỷ vương sừng cầm kích | kích — hợp | giữ |
| chantinh | Chằn Tinh | người-rồng cầm giáo | chằn tinh cầm chuỳ đá | **gen lại** — người-rồng cầm giáo — sai loài + sai vũ khí (boss) |
| haba | Hà Bá | quỷ sừng cầm giáo | đinh ba / giáo — hợp | giữ |
| ngutinh | Ngư Tinh | ngư tinh cầm đinh ba | hợp | giữ |
| thuongluong | Thuồng Luồng | người sừng đuôi rồng cầm giáo rìu | thuồng luồng (rắn nước) | **gen lại** — người sừng đuôi rồng cầm giáo rìu — Thuồng Luồng là THUỒNG LUỒNG (rắn nước khổng lồ) |
| thuytinh | Thủy Tinh | thủy thần cầm giáo | đinh ba / giáo — hợp | giữ |
| trieuda | Hổ Vương Triệu Đà | hổ vương cầm kích | kích / đao — hợp | giữ |
| daibang | Đại Bàng Tinh | người-rồng có cánh cầm giáo | chim đại bàng | **gen lại** — người-rồng có cánh cầm giáo — Đại Bàng Tinh là CHIM ĐẠI BÀNG khổng lồ |
| hotinh | Hồ Tinh Chín Đuôi | rồng nhiều tay cầm giáo | hồ ly chín đuôi | **gen lại** — rồng nhiều tay cầm giáo — sai loài (boss) |
<!-- /bang-90 -->

## Ảnh cầm vũ khí KHÁC game (đã chọn chuyển động theo vũ khí trong ẢNH)

> Bảng dưới là lần soát đầu (theo vũ khí). Quyết định cuối theo bảng "Rà soát cả 90 ảnh" ở trên: chỉ ảnh có vật cầm hợp nhân vật mới giữ (game sửa theo ảnh), còn lại gen lại theo `docs/PROMPT-GEN-LAI.txt` và đang chặn bằng `CD_SKIP`.

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
