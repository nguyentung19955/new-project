# BỘ 24 TƯỚNG v2 — 6 chủ đề, thiết kế theo khung xương PixelLab (chốt 04/11/2026)

Giữ nguyên **cơ chế, bậc, hệ, mục tiêu** của 24 tướng trong `tu-van-chatgpt-the-gioi-24-tuong-70-wave.txt`. Chỉ đổi **ngoại hình + chủ đề + động tác**.
Chủ đề chia ngẫu nhiên (xáo trộn seed 2411), mỗi chủ đề 4 tướng:
1 Hậu tận thế tái sinh (Hopepunk/Solarpunk) · 2 Thần thoại châu Á & võ hiệp (Eastern Fantasy/Wuxia Punk) · 3 Kinh dị vũ trụ + cơ khí sinh học (Biomechanical/Cosmic Horror) · 4 Huyền ảo tăm tối (Dark Fantasy) · 5 Neon tương lai (Cyberpunk/Techwear) · 6 Cận đại hoài cổ (Steampunk/Urban Fantasy).
Bộ thử SENTINEL / PULSE / ANCHOR (v4–v6) và 3 ảnh ChatGPT v7 chỉ là bản thử quy trình — không thuộc bể 24.

## PHONG CÁCH CHỐT (04/11 16h13)
Anime game vui tươi, sáng sủa, biểu cảm sinh động (cười, nháy mắt, tự tin), màu tươi; tỉ lệ đầu ~1/4 thân — không chibi trẻ con, không nghiêm túc u tối. Mẫu: `nguon-tuong/v7/scorch_vui.png`, `frost_vui.png`, `arc_vui.png`.

## Chuẩn để PixelLab skeleton-v3 chạy sạch (bắt buộc khi vẽ ảnh gốc)
- Dáng chữ A: đứng thẳng, hai chân tách rộng bằng vai thấy rõ, hai tay buông hơi tách khỏi thân (không chạm hông), bàn tay mở/thả lỏng.
- Tay chân lộ rõ khớp: KHÔNG váy/áo choàng dài che chân, KHÔNG tay áo rộng thùng thình.
- KHÔNG chi tiết bay: tóc rất dài xõa, ruy băng, khăn, đuôi áo dài, cánh to, vật lơ lửng. Tóc buộc gọn; phụ kiện nhỏ gắn chặt người.
- Hình khối rõ, viền đen, nền trắng trơn, toàn thân, mặt trước, góc từ trên cao chéo xuống.
- Thú 4 chân: dùng khung `dog`/`cat`/`lion`/`horse`/`bear` — vẽ đứng 4 chân, nhìn 3/4 mặt trước, chân tách rõ, đuôi ngắn/gọn. Không côn trùng/ốc/drone (không có khung xương).

## Luật thiết kế để hợp PixelLab
- Phần lớn là người (khung mannequin), một số là THÚ 4 CHÂN (VENOM chó máy bồn độc, BASTION gấu đá pháo đài, QUILL mèo nhím gai thép, PATCHWORK gấu bông). Nam/nữ cân bằng.
- **Không cầm vũ khí/đồ vật trong tay.** Trang bị phải **gắn liền người**: găng, ống phóng gắn cẳng tay, ba lô, bình đeo, cánh nhỏ, gai trên lưng.
- **Hình dáng nói lên vai:** sát thương = dáng tấn công; hỗ trợ/kinh tế = đồ phát sóng/ba lô, dáng hiền; khống chế = áo choàng, phép.
- Tránh chi tiết bay lơ lửng, khăn/dải vải dài, cánh/mũ quá to (che người khi xoay).
- Ảnh gốc mặt trước: **ChatGPT vẽ** (đẹp, mặt người lớn) theo góc từ trên cao → PixelLab xoay 8 hướng + động tác. Hiệu ứng: ChatGPT vẽ riêng.

## Bảng động tác (đã thử trên PixelLab)
| Mã | Động tác | Cách gọi | Tình trạng |
|---|---|---|---|
| ĐỨNG | thở | mẫu `breathing-idle` (skeleton-v3) | sạch 8 hướng |
| ĐẤM | đấm thẳng 1 tay → tia/đạn bay từ nắm đấm | mẫu `lead-jab` | sạch (3 khung) |
| PHÉP | hai tay giơ lên rồi vung ra trước | tự mô tả, tay trống, 6 khung | sạch |
| SÓNG | hai tay ngang ngực mở lòng bàn tay rồi hạ | tự mô tả, 6 khung | sạch |
| ĐÁ | đá cao / đá xoay (cận chiến) | mẫu `high-kick` / `roundhouse-kick` | cần thử |
Không dùng: `fireball` (tự vẽ lửa), `throw-object` (nhoè đầu, vẽ vật), `pushing` (cúi rạp), nhảy/bay (rời ô).

## 24 tướng
| # | Tên | Bậc | Hệ · mục tiêu | Chủ đề | Ngoại hình (dáng theo vai) | Đánh |
|---|---|---|---|---|---|---|
| 01 | SCORCH | TRẮNG | Lửa · ĐẦU | Võ hiệp | Nam võ sư Hoả Quyền, vạm vỡ, búi tóc đỏ, áo võ cụt tay đỏ cam, băng quấn tay cháy sém, đai đen | ĐẤM (quyền lửa) |
| 02 | FROST | TRẮNG | Băng · ĐẦU | Huyền ảo tăm tối | Nữ phù thuỷ băng tang tóc, da tái, vương miện băng gai, áo choàng xám lam gấu rách, găng đen | PHÉP |
| 03 | ARC | TRẮNG | Sét · GẦN (cận chiến) | Hậu tận thế tái sinh | Nam thợ điện năng lượng mặt trời, áo canvas vá, tấm pin mặt trời trên lưng, găng đồng to quấn dây | ĐÁ (sét) |
| 04 | VENOM | TRẮNG | Độc · MẠNH | Huyền ảo tăm tối | Nữ thầy độc đầm lầy, áo choàng rêu xanh, bình độc đeo thắt lưng, móng tay xanh lục | PHÉP (phun độc) |
| 05 | EMBERBUG | TRẮNG | Lửa · CUỐI | Kinh dị vũ trụ | Nam người lai bọ, giáp xác đỏ cam, túi đèn phát sáng sau lưng, râu ăng-ten | ĐẤM (tàn lửa liên tục) |
| 06 | TIDAL | TRẮNG | Nước · ĐẦU | Cận đại hoài cổ | Nữ thợ lặn đồng, mũ lặn đồng tròn có kính, bình nước đồng sau lưng nối ống vào cổ tay | ĐẤM (giọt nước) |
| 07 | NEEDLE | TRẮNG | Xuyên · YẾU | Kinh dị vũ trụ | Nữ thợ săn sinh học, cẳng tay phải mọc gai xương dài (liền tay), mắt côn trùng | ĐẤM (phóng kim xương) |
| 08 | LANCE | LAM | Điện từ · MẠNH | Cận đại hoài cổ | Nam xạ thủ quý tộc, áo đuôi tôm, kính một mắt, ống phóng đồng gắn cẳng tay phải | ĐẤM (tia xuyên) |
| 09 | BRAMBLE | LAM | Thực vật · ĐẦU | Neon tương lai | Nữ hacker thực vật, áo techwear đen, dây leo phát sáng xanh lục quấn hai tay, tóc rêu | PHÉP (gai trói) |
| 10 | ECHO | LAM | Âm · ĐÁM | Võ hiệp | Nữ ca kỹ áo lụa tím, chuỗi chuông đồng nhỏ quanh eo, búi tóc cài trâm | PHÉP (sóng âm) |
| 11 | QUILL | LAM | Vật lý · GẦN | Huyền ảo tăm tối | Nam kỵ sĩ nhím, giáp đen gỉ, lưng mọc chùm gai thép tỏa | PHÉP (bắn gai tỏa) |
| 12 | MOTH | LAM | Ảo ảnh · NGẪU NHIÊN | Võ hiệp | Nữ đạo sĩ bướm đêm, áo đạo tím than, cánh bướm nhỏ hoa văn mắt sau lưng, mạng che mặt | PHÉP (bụi phấn) |
| 13 | BASTION | LAM | Đất · ĐẦU | Kinh dị vũ trụ | Nam khổng lồ đá-sinh học, mai đá có hốc phát sáng trên lưng, hai nắm tay to như tảng đá | ĐẤM (chấn động) |
| 14 | WARP | TÍM | Hư không · CUỐI | Kinh dị vũ trụ | Nữ phi hành gia bị vũ trụ nhập, mũ kính nứt, bộ đồ phi hành rách, mắt tím phát sáng | PHÉP (cầu hư không) |
| 15 | SPECTER | TÍM | Linh thể · MẠNH | Cận đại hoài cổ | Nam thám tử ma, mũ quả dưa, áo măng tô, da trong mờ xám xanh, kính một mắt sáng | ĐẤM (chỉ tay đánh dấu) |
| 16 | TESLA | TÍM | Sét · ĐÁM | Cận đại hoài cổ | Nữ nhà phát minh, kính bảo hộ, ba lô cuộn coil đồng, găng cao su dài | PHÉP (tia xích) |
| 17 | ALCHEM | TÍM | Hoá học · ĐẦU | Hậu tận thế tái sinh | Nữ nhà giả kim làm vườn, mũ rơm, tạp dề nhiều túi, bình thuỷ tinh hai màu đeo thắt lưng | PHÉP |
| 18 | HUSH | TÍM | Bóng tối · YẾU | Neon tương lai | Nữ sát thủ techwear, mặt nạ câm, hoodie đen viền tím, găng phi tiêu gắn cổ tay | ĐẤM (phi tiêu ngắt) |
| 19 | BROKER | VÀNG | Kinh tế · BÀN | Hậu tận thế tái sinh | Nam thương nhân chợ tái sinh, áo choàng chắp vá, ba lô to đầy hàng, kính tròn | SÓNG |
| 20 | GLITCH | VÀNG | Hack · BÀN/ĐẦU | Neon tương lai | Nam người máy đầu màn hình CRT mặt pixel xanh bạc hà, cáp cắm sau lưng | SÓNG |
| 21 | PATCHWORK | VÀNG | Biến hình · Ô KỀ | Hậu tận thế tái sinh | Người gấu bông khâu tay cỡ người lớn, hai nửa xanh/đỏ, cúc áo, đường chỉ to | SÓNG |
| 22 | MIRROR | VÀNG | Sao chép · Ô KỀ | Võ hiệp | Nữ pháp sư gương, gương đồng tròn gắn sau lưng như vầng hào quang, áo hai nửa đen/trắng | SÓNG |
| 23 | CROWN ZERO | ĐỎ | Thời gian · ĐẦU/BÀN | Neon tương lai | Nam vua lỗi, vương miện vỡ ánh hologram, áo choàng lưới neon, áo giáp đen | PHÉP |
| 24 | ORACLE | ĐỎ | Vận mệnh · BÀN/ĐÁM | Huyền ảo tăm tối | Nữ tiên tri, áo choàng đen thêu sao, mắt đơn lớn vẽ trên trán, tóc bạc dài tết | PHÉP |

## Thứ tự làm
Mỗi lần 3 tướng (người dùng duyệt cùng lúc). Ảnh gốc ChatGPT → soát góc nhìn → PixelLab xoay 8 hướng (chọn nguyên bộ) → nhập nhân vật → ĐỨNG + động tác đánh → soát từng khung → GIF → hiệu ứng ChatGPT → ghép game.

## BẢN PHÁ CÁCH (04/11 17h50 — thay ngoại hình cũ của các tướng chưa làm)
Phong cách anime vui tươi; mỗi tướng 1 điểm nhận diện "lạ" mà vẫn hợp khung xương PixelLab (người / chó / mèo / sư tử / ngựa / gấu).
| Tên | Khung | Ngoại hình phá cách |
|---|---|---|
| EMBERBUG | người | Người bọ cánh cứng, bụng đèn lồng phát sáng cam trên lưng |
| TIDAL | người | Nữ thợ lặn đồng, mũ lặn tròn có cửa kính lộ mặt, bình nước sau lưng |
| NEEDLE | người | Búp bê gỗ khớp nối cỡ người, mắt cúc áo, kim may to gắn cẳng tay |
| LANCE | người | Kỵ sĩ đầu là ngọn hải đăng thu nhỏ có đèn quét |
| BRAMBLE | người | Cô gái xương rồng mặc hoodie, gai nhỏ, hoa nở trên đầu |
| ECHO | người | Ca sĩ đầu là quả chuông đồng lớn, áo vest tím |
| MOTH | người | Bướm đêm hình người, áo choàng chính là đôi cánh khép |
| WARP | người | Phi hành gia, mặt kính mũ là một hố đen xoáy tím |
| SPECTER | người | Thám tử ma đầu là ngọn nến cháy xanh, áo măng tô |
| TESLA | sư tử | Sư tử máy, bờm là các cuộn coil đồng phát điện |
| ALCHEM | người | Nhà giả kim mặt nạ mỏ chim, tạp dề đầy bình hai màu |
| HUSH | mèo | Mèo đen ninja, khăn bịt mặt, chuông câm ở cổ |
| BROKER | người | Thương nhân béo đầu là chiếc két sắt có mặt số |
| GLITCH | người | Người máy đầu TV CRT mặt pixel xanh bạc hà |
| PATCHWORK | gấu | Gấu bông khâu tay cỡ lớn, hai nửa xanh/đỏ |
| MIRROR | người | Người pha lê, thân là gương phản chiếu nhiều mặt |
| CROWN ZERO | ngựa | Ngựa ma đen đội vương miện vỡ, bờm lửa tím |
| ORACLE | người | Nữ tiên tri, mắt đơn lớn giữa trán, tóc là bầu trời sao |

## CHỐT CUỐI (04/11 17h57): PHONG CÁCH DESTINY CHILD — THAY TOÀN BỘ NGOẠI HÌNH Ở TRÊN
Mọi tướng là **thần thoại / truyền thuyết hoá thân thành cô gái anime gacha** (nhân vật nguyên bản, chỉ mượn phong cách), tỉ lệ SD chibi cao cấp như nhân vật chiến đấu DCDW (đầu ~1/3 thân, mặt thiếu nữ trưởng thành, không trẻ con), trang phục kín đáo, trang sức cầu kỳ, pixel art chi tiết viền đen 1px, góc nhìn từ trên cao, dáng chữ A, tay không. Tóc buộc gọn (tóc xoã dài làm PixelLab nhoè khi chuyển động). Cơ chế/bậc/hệ giữ nguyên.
| # | Tên | Hoá thân | Điểm nhận diện | Đòn |
|---|---|---|---|---|
| 01 | SCORCH | Agni (lửa) | tóc đỏ buộc cao, sừng lửa vàng, võ phục đỏ vàng | ĐẤM |
| 02 | FROST | Skadi (băng) | vương miện sừng hươu băng, áo lông trắng, váy rune | PHÉP |
| 03 | ARC | Raijin (sấm) | sừng nhỏ, vòng trống sấm sau lưng, áo khoác tia sét | ĐẤM |
| 04 | VENOM | Medusa | tóc là các rắn nhỏ cuộn gọn, áo xanh lục, bình độc ở hông | PHÉP |
| 05 | EMBERBUG | Hotaru (thần đom đóm) | kimono ngắn đỏ cam, đèn lồng đom đóm ở thắt lưng | PHÉP |
| 06 | TIDAL | Amphitrite (biển) | vương miện vỏ sò, váy san hô xanh nước, vòng ngọc trai | PHÉP |
| 07 | NEEDLE | Arachne (thợ dệt) | áo hoa văn mạng nhện, găng chỉ bạc, búi tóc cài kim | ĐẤM |
| 08 | LANCE | Artemis (mặt trăng) | áo thợ săn trắng bạc, giáp vai trăng khuyết | ĐẤM |
| 09 | BRAMBLE | Dryad (cây) | tóc lá buộc gọn, hoa trên đầu, váy rễ cây ngắn | PHÉP |
| 10 | ECHO | Benzaiten (âm nhạc) | tai nghe vỏ ốc, váy tím, dải nốt nhạc thêu | PHÉP |
| 11 | QUILL | Cửu vĩ hồ | tai cáo, đuôi cáo gọn, giáp vảy thép | ĐẤM |
| 12 | MOTH | Nyx (đêm) | đôi cánh bướm đêm nhỏ, áo tím than, mạng che mặt | PHÉP |
| 13 | BASTION | Gaia (núi) | giáp đá phát sáng tím, khiên-tháp nhỏ trên lưng | ĐẤM |
| 14 | WARP | Nut (bầu trời Ai Cập) | áo đen rắc sao, vòng hư không tím sau lưng | PHÉP |
| 15 | SPECTER | Hel (âm phủ) | nửa trắng nửa đen, đèn lồng hồn ở hông | PHÉP |
| 16 | TESLA | Zeus (nữ) | vương miện tia sét, toga ngắn trắng vàng | PHÉP |
| 17 | ALCHEM | Hecate (giả kim) | mũ phù thủy nhỏ, đai đầy bình thuốc hai màu | PHÉP |
| 18 | HUSH | Bastet | tai mèo, đồ ninja đen vàng Ai Cập, chuông ở cổ | ĐẤM |
| 19 | BROKER | Fortuna (vận may) | mũ cánh nhỏ, túi tiền vàng, áo vàng trắng | SÓNG |
| 20 | GLITCH | Pandora | chiếc hộp phát sáng đeo hông, áo công nghệ xanh bạc hà | SÓNG |
| 21 | PATCHWORK | Tsukumogami búp bê vải | áo chắp vá hai nửa xanh/đỏ, đường khâu, cúc áo | SÓNG |
| 22 | MIRROR | Amaterasu (gương) | gương bát giác sau lưng, kimono trắng đỏ | SÓNG |
| 23 | CROWN ZERO | Nữ hoàng thời gian | vương miện vỡ, áo choàng đen hoa văn đồng hồ | PHÉP |
| 24 | ORACLE | Pythia (tiên tri) | mắt thứ ba trên trán, tóc bạc tết, áo trắng vàng sao | PHÉP |
Ảnh gốc: ChatGPT (nhiều phiên song song). Sau đó PixelLab: xoay 8 hướng → nhập (mannequin) → đứng thở (breathing-idle) + đòn 12 khung tự mô tả.

## CẬP NHẬT (04/11 18h10): TỰ DO GIỚI TÍNH & LOÀI — VẪN NÉT VẼ DESTINY CHILD
Người dùng: "cả nam cả nữ, cả quái vật, rồng… free style". Nét vẽ gacha Hàn kiểu DC giữ nguyên; nam = chàng trai anime điển trai trưởng thành, SD chibi cao cấp; quái/rồng = sinh vật 4 chân đẹp kiểu gacha (khung xương PixelLab: dog/cat/lion/bear).
Thay đổi so với bảng trên (các tướng không nhắc giữ nguyên là nữ):
| # | Tên | Mới | Loại / khung xương | Đòn |
|---|---|---|---|---|
| 11 | QUILL | Cửu vĩ hồ dạng thú: cáo trắng chín đuôi gọn, giáp vảy thép | thú · dog | VỒ |
| 13 | BASTION | Atlas, nam khổng lồ trẻ, giáp đá tím, khiên-tháp trên lưng | nam · mannequin | ĐẤM |
| 15 | SPECTER | Anubis, nam, mặt nạ chó rừng đen vàng, áo choàng hồn | nam · mannequin | PHÉP |
| 16 | TESLA | Zeus, nam, vương miện tia sét, toga trắng vàng | nam · mannequin | PHÉP |
| 17 | ALCHEM | Hermes Trismegistus, nam giả kim, kính một mắt, đai bình thuốc | nam · mannequin | PHÉP |
| 18 | HUSH | Bastet dạng thú: báo đen mắt vàng, trang sức Ai Cập | thú · cat | VỒ |
| 19 | BROKER | Fafnir: rồng con vàng ôm của, vảy vàng, sừng ngọc | rồng · lion | VỒ |
| 20 | GLITCH | Loki, nam lừa lọc, áo công nghệ xanh bạc hà, sừng | nam · mannequin | SÓNG |
| 21 | PATCHWORK | Gấu bông khâu tay khổng lồ (tsukumogami), nửa xanh nửa đỏ | quái · bear | ĐẬP |
| 23 | CROWN ZERO | Chronos, nam vua thời gian, vương miện vỡ, áo choàng đồng hồ | nam · mannequin | PHÉP |
| 24 | ORACLE | Nhân sư (Sphinx): sư tử cánh, mặt nạ vàng, mắt thứ ba | quái · lion | VỒ |
Tỉ lệ: 13 nữ · 6 nam · 5 quái/rồng.

## CHỐT (04/11 18h40): THIẾT KẾ THEO THƯ VIỆN ĐỘNG TÁC PIXELLAB (tư vấn ChatGPT + chỉnh)
Ý người dùng: tận dụng động tác có sẵn của PixelLab để tạo cá tính & kỹ năng (vd. `drinking` → uống bia được buff). Thay thế bảng "TỰ DO GIỚI TÍNH & LOÀI" ở trên.
| # | Tên | Hoá thân | Loài · khung | Đứng chờ | Đòn thường | Kỹ năng (động tác → tác dụng) |
|---|---|---|---|---|---|---|
| 01 | SCORCH | Agni, nữ võ sư lửa | nữ · mannequin | fight-stance-idle | đấm (tự mô tả 12 khung) | surprise-uppercut → cột lửa tại quái, thiêu đốt |
| 02 | FROST | Skadi, nữ thần băng kiêu kỳ | nữ | breathing-idle | đẩy hai tay (tự mô tả) | pushing → sóng băng làm chậm, quái đã chậm thì đóng băng |
| 03 | ARC | Raijin, nữ thần sấm nghịch ngợm | nữ | fight-stance-idle | đấm | hurricane-kick → đá xoay, điện 3 quái gần, choáng |
| 04 | VENOM | Medusa | nữ | breathing-idle | phép | surprise-uppercut → ánh mắt hoá đá quái mạnh nhất |
| 05 | EMBERBUG | Hotaru, linh đom đóm mê ngủ | nữ | breathing-idle | throw-object | two-footed-jump → 5 đom đóm tự tìm mục tiêu |
| 06 | TIDAL | Amphitrite | nữ | breathing-idle | pushing | phép → bong bóng nước nảy 4 quái, gây Ướt (tăng sát thương Sét) |
| 07 | NEEDLE | Arachne, thợ dệt cầu toàn | nữ | breathing-idle | lead-jab | cross-punch → chùm kim xuyên cả hàng |
| 08 | LANCE | Artemis, không bao giờ bắn trượt | nữ | fight-stance-idle | lead-jab | pushing → hút quái lại rồi bắn tia xuyên |
| 09 | BRAMBLE | Dryad nghịch ngợm | nữ | breathing-idle | phép | crouching → getting-up → gai mọc trên đường giữ chân quái |
| 10 | ECHO | Benzaiten | nữ | breathing-idle | lead-jab (sóng âm) | surprise-uppercut → nốt cao, vòng sóng âm ngắt kỹ năng quái |
| 11 | QUILL | Cửu vĩ hồ | thú · dog | idle | bark (gai thép gần) | running → lao ra mép ô rồi về, giảm giáp |
| 12 | MOTH | Nyx | nữ | breathing-idle | phép | backflip → 2 phân thân ảo bắn vài giây |
| 13 | BASTION | Gaia: gấu đá mê bia mật ong | thú · bear | idle-long | attack-left/right | **drinking** → uống thùng bia mật ong: tăng phòng thủ + sát thương; stand-on-hind-legs → chấn động làm chậm |
| 14 | WARP | Nut | nữ | breathing-idle | phép | pushing → cổng không gian đưa 3 quái về sau (không áp dụng boss) |
| 15 | SPECTER | Anubis | nam · mannequin | breathing-idle | phép (hồn) | taking-punch → đánh dấu quái yếu, chết thì nổ hồn |
| 16 | TESLA | Rồng sấm (Raijū) | rồng · lion | idle | vồ | vồ tại chỗ → sét chuyền sang quái bị Ướt |
| 17 | ALCHEM | Thoth, nhà giả kim lập dị | nam | breathing-idle | throw-object | **drinking** → uống thuốc thử: ngẫu nhiên tăng tốc đánh / sát thương / đòn gây Độc |
| 18 | HUSH | Bastet: hắc miêu ninja | thú · cat | idle | vồ | rình (sneak) → ám sát quái cuối hàng, chí mạng lớn |
| 19 | BROKER | Hermes, ông chủ ngân hàng | nam | breathing-idle | throw-object (đồng xu) | **picking-up** → nhặt vàng, tạo vàng (có giới hạn mỗi đợt) |
| 20 | GLITCH | Loki, hacker | nam | fight-stance-idle | lead-jab | surprise-uppercut → giảm kháng, khoá kỹ năng quái |
| 21 | PATCHWORK | Chimera (sư tử–dê–rồng) | quái · lion | idle | vồ | gầm → đổi 3 dạng Lửa/Độc/Xuyên |
| 22 | MIRROR | Kỳ Lân vảy gương | thần thú · horse | idle | giậm | nhảy → sao chép kỹ năng tướng kề bên (yếu hơn) |
| 23 | CROWN ZERO | Chronos, hoàng đế thời gian | nam | fight-stance-idle | cross-punch | pushing → dừng thời gian quái thường (boss chỉ chậm) |
| 24 | ORACLE | Urðr, nữ thần vận mệnh | nữ | breathing-idle | phép | two-footed-jump → đánh dấu quái nguy hiểm, đồng minh đánh mạnh hơn |
Tỉ lệ: 13 nữ · 5 nam · 6 quái/thú/rồng. Ưu tiên cơ chế: WARP, BROKER, MIRROR, PATCHWORK, CROWN ZERO.
Lưu ý: `fireball` tự vẽ lửa → đòn "phép" dùng động tác tự mô tả tay không; id động tác của mèo/sư tử/ngựa đối chiếu khi nhập nhân vật.
