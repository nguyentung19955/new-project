# Chân dung trùng nhau — rà soát & phương án đa dạng (08/11)

Người dùng: "Nhiều hình đại diện trông na ná nhau". Giữ phong cách đã chốt (anime gacha, một thiên hà nhiều chủng tộc), tăng độ khác biệt ở cỡ khay (~50–64 px).

## Cách rà
- Bảng tiếp xúc 94 ô `pn/pilot_<id>.png` ở 64 px và 128 px, xem bằng mắt.
- Đo khách quan trên vùng mặt (cắt giữa ô 256): giao histogram HSV 12×4×4 (cao = cùng bảng màu) + L2 ảnh thu 12×12 (thấp = cùng bố cục/màu). Cặp đứng đầu dưới đây đều xác nhận lại bằng mắt.

## Các nhóm giống nhau

| Nhóm | Đổi | Giữ (đại diện nhóm) | Bằng chứng |
|---|---|---|---|
| A. Tím hư không (Nyx da chàm, tóc bạc, nền tím, cười) | nangsao, pandora, ngoisao, khoathoigian, nhatthuc, hutmana, hasao, tuthan, ngaithoigian | blackhole, nemesis | 10 ụ Nyx gần như cùng một người: da tím, tóc trắng-tím, vòng hào quang, nền tinh vân tím. Histogram: khoathoigian↔nangsao 0,74; kepha↔khoathoigian 0,70; hasao↔ngoisao L2 44. |
| B. Năng lượng tím (Voltari plasma tím-hồng, tóc lửa tím) | bao, epxung, combo | lienket | 4 ụ cùng thân plasma tím phát sáng; combo↔epxung 0,70. |
| C. Người máy tóc tím | nhieusong | kepha, nhanban | nhieusong ≈ nhanban (cô gái tóc tím-trắng, visor). |
| D. Băng nhạt (Cryon da trắng xanh, tóc bạc, vương miện băng) | baotuyet, lanhgia, thaukinh, kiembang | bang, guongcong, bienmau, lophanung | baotuyet↔thaukinh 0,70, baotuyet↔lanhgia L2 39,5, lanhgia↔thaukinh 44,9. |
| E. Cô gái thủy tộc tóc ngọc lam cười | aten, sinhdoi, hopca, anhsang | cauvong, taylo, hydra, leviathan | aten↔sinhdoi L2 38,4; aten↔hopca 39,5; cauvong↔hopca 40,7. |
| F. Tóc vàng nền vàng (anh hùng/thiếu nữ vàng kim) | vughep, khoisinh, mauhut, marionette, orbital, saochep, thanhdia | chuato, cuuvi, dongbo, railgun, luutru, wallgen, luoicheo, mana, tienhoa, xuonganh | marionette↔mauhut L2 37,7 (sát nhất cả bộ), chuato↔mauhut 38,7, saochep↔wallgen 0,80, dongbo↔orbital 0,75, orbital↔railgun 0,72, haoquang↔vughep 0,74. |
| G. Chàng trai tóc tím nền tím (Terran) | xaotron, docton | no5, nayda, santhuong | docton↔xaotron L2 42,2; docton↔nayda 42,8. |
| H. Thú nhân trùng loài | phagiap, bua | nam, soi, xuonganh, loren | 3 sói xám (phagiap, nam, soi) + 3 sư tử (bua, xuonganh, loren). |
| I. Plasma xanh điện tóc lửa | nangluong, nhanmana | set | 3 ụ cùng một dáng Voltari xanh-trắng. |

Thêm 5 ảnh yếu đã biết (hasao, tuthan mặt tối; baotuyet mặt nhạt; ngaithoigian có số trên mặt đồng hồ; vughep vương miện bay) và 3 ụ còn ảnh cũ (kiembang, chimang, dichchuyen). Holy Halo (haoquang) đã bị bỏ khỏi game nên không vẽ lại.

## Thay đổi từng ụ (36 ảnh)

| id | Tộc cũ → mới | Nhận diện mới (tuổi/dáng/tóc-mũ/màu chủ đạo/biểu cảm) |
|---|---|---|
| hasao | Nyx → Nyx | Nyx đầu trọc, lực lưỡng, da bạc-tím sáng, nền siêu tân tinh cam-vàng (sửa mặt tối) |
| tuthan | Nyx → Nyx | Nyx tóc đen bob, mặt nạ sọ trắng hất lên đầu, lửa ma xanh ngọc (sửa mặt tối) |
| baotuyet | Cryon → Cryon | Cryon già râu trắng, da xanh cobalt đậm, mũ trùm lông navy (sửa mặt nhạt) |
| ngaithoigian | Nyx → Terran | Terran hoàng đế già râu bạc, ngai đồng hồ KHÔNG số (sửa có số) |
| vughep | Terran → Terran | Terran vua nhí da nâu tóc xoăn, vương miện ĐỘI CHẶT trên đầu, xanh hoàng gia (sửa vương miện bay) |
| kiembang | Cryon → Ferrin | Ferrin báo tuyết đốm, kiếm băng (thay ảnh cũ) |
| chimang | Vespari → Vespari | Vespari bướm đêm, râu lông vũ, cánh cam-đen (thay ảnh cũ) |
| dichchuyen | Nyx → Terran | Terran nữ đưa thư áo cam, cổng cam-xanh (thay ảnh cũ) |
| nangsao | Nyx → Synthari | Synthari thợ nâng màu bạc hà, nền bình minh hồng |
| pandora | Nyx → Vespari | Vespari nữ hoàng bọ hung xanh ngọc-đen |
| ngoisao | Nyx → Ferrin | Ferrin gấu trúc đỏ, nền trời đêm xanh |
| khoathoigian | Nyx → Synthari | Synthari máy đồng hồ đồng thau, nền xanh ngọc |
| nhatthuc | Nyx → Nyx | Nyx trọc mặt sơn nửa trắng nửa đen, trời cam máu |
| hutmana | Nyx → Thalassi | Thalassi cá lồng đèn, nam gầy, biển sâu |
| bao | Voltari → Ferrin | Ferrin người chim ưng, mây giông xám-sét vàng |
| epxung | Voltari → Synthari | Synthari đua xe đen-đỏ, khe nhiệt cam |
| combo | Voltari → Ferrin | Ferrin khỉ võ sĩ băng đô đỏ, neon xanh lá |
| nhieusong | Synthari → Synthari | Synthari robot thấp đậm xanh ô-liu, 1 mắt đỏ, sa mạc chiều |
| lanhgia | Cryon → Ferrin | Ferrin gấu Bắc Cực khăn đỏ |
| thaukinh | Cryon → Terran | Terran nữ kỹ sư da sẫm, kính nhiều thấu kính, nền hổ phách |
| aten | Thalassi → Voltari | Voltari sư trọc plasma xanh ngọc lục bảo |
| sinhdoi | Thalassi → Thalassi | Thalassi kỳ giông hồng, mang xòe như vương miện |
| hopca | Thalassi → Thalassi | Thalassi nam da vằn cá voi sát thủ đen-trắng |
| anhsang | Thalassi → Terran | Terran ông già gác hải đăng áo mưa vàng |
| mauhut | Vespari → Vespari | Vespari nam quý tộc chitin đen, nền đỏ thẫm |
| marionette | Synthari → Synthari | Synthari búp bê hề đen-trắng, rèm xanh ngọc |
| khoisinh | Voltari → Voltari | Voltari plasma dung nham đỏ-cam, vương miện đá |
| orbital | Terran → Terran | Terran nam trung niên đầu đinh bạc, giáp phi hành gia trắng-cam |
| saochep | Synthari → Ferrin | Ferrin mèo đen mắt xanh lá, hologram cyan |
| thanhdia | Terran → Terran | Terran sư võ to con áo cà sa cam, nền chiều xanh |
| xaotron | Terran → Ferrin | Ferrin gấu mèo, áo xanh lá, nền carnival xanh |
| docton | Terran → Terran | Terran nam da đen khăn đỏ, hẻm núi đỏ hoàng hôn |
| phagiap | Ferrin → Ferrin | Ferrin tê giác (bỏ sói xám) |
| bua | Ferrin → Ferrin | Ferrin gấu nâu thợ rèn (bỏ sư tử) |
| nangluong | Voltari → Terran | Terran nữ cơ bắp đầu cua, năng lượng xanh lá |
| nhanmana | Voltari → Vespari | Vespari cô ong vàng-đen, 2 tinh thể mana |

Nguyên tắc chung thêm vào prompt (`prompts-da-dang.json`): "Distinctive look … DOMINANT COLOURS: <màu> — ánh sáng bậc chỉ là viền mảnh, không phủ tím/vàng cả tranh; mặt sáng rõ". Tên ánh sáng bậc Tím đổi thành viền mảnh. Bỏ chữ "purple/violet" trong câu kỹ năng của ụ không thuộc tông tím.
