# Đề xuất bí mật / nhiệm vụ ẩn cho Vùng 3–8 + Làng Chuông (phiên "an", theo ChatGPT 02/11)

> Gửi các phiên dựng vùng / Làng Chuông (game/lang-chuong) / Cốt truyện. Phiên "an" không sửa thư mục của các phiên đó; khi có id phòng/vật phẩm thật sẽ thêm vào game/an/du-lieu.json.
> Mẫu "chừa sẵn khi dựng phòng" giống docs/an/de-xuat-cho-vung-2.md (3 phòng tường giả, 1 thử thách platforming lấy Mảnh Ký Ức, 1 NPC, ≥ 6 lối tắt).

| Vùng | Bí mật / Nhiệm vụ ẩn / Mảnh Ký Ức | Nhiệm vụ "hành động lạ" (ChatGPT) | Thưởng |
|---|---|---|---|
| V1 Weeping Heartwood | 6 / 4 / 4 | **The Patient Root** – đứng yên dưới rễ biết thở 5 giây (chỗ an toàn) | 40 Ancient Bronze |
| V2 Bronze Foundry | 7 / 4 / 5 | **A Bell Without a Tongue** – đánh chuông bằng Echo thay vì kiếm | Echo Charm trang trí |
| V3 Iron Nest | 7 / 4 / 5 | **The Unhatched Choir** – đi qua 3 tổ không đánh vỡ · **The Third Footstep** – Echo tái diễn đường chạy để 2 bóng chạm 2 dấu chân | 100 Echo Shards · 150 Echo Shards |
| V4 Wind Canopy | 8 / 4 / 5 | **The Wind That Waited** – đứng yên trên cầu gió qua 3 cơn gió | 1 Mảnh Ký Ức |
| V5 Thunder Crown | 8 / 5 / 5 | **Borrowed Thunder** – lướt qua 3 luồng sét theo thứ tự ký hiệu | 120 Ancient Bronze |
| V6 Echo Library | 9 / 5 / 6 | **The Page That Listened** – đứng trước kệ, dùng Echo tái diễn động tác | truyện + 1 Mảnh Ký Ức |
| V7 Mirror Lake | 9 / 5 / 6 | **Face Beneath the Water** – đứng im khi bóng phản chiếu cử động | 1 Mảnh Ký Ức |
| V8 Silent Abyss | 10 / 6 / 6 | **The Last Unspoken Word** – bỏ qua 1 kẻ địch không thù địch rồi quay lại · **The Hollow Benediction** – đứng trong vùng không tiếng, không tấn công 8 giây | truyện + thành tựu · Echo Charm phụ trợ nhẹ |
| Bell Village (hub) | 6 / 6 / 6, ≥ 6 kết nối | **No Bell Rings Alone** – chạm 3 chuông nhỏ trong cùng 1 chu kỳ Echo · **A Name Returned** – mang 4 Name Tag (Vùng 1) về bia tưởng niệm | 80 Ancient Bronze · truyện + VFX chuông lưu |

Luật ChatGPT cho mọi vùng:
- Mọi nhiệm vụ có dấu hiệu môi trường; Mảnh Ký Ức cần cho kết thật không đặt sau hành động không có manh mối.
- Câu đố âm thanh luôn có kênh hình (1/2/3 vạch); tắt tiếng vẫn giải được; không bắt đứng yên ở chỗ nguy hiểm.
- Phần thưởng là hình/hiệu ứng (Bronze Afterimage, Mourning Edge, Hollow Impact, Echo Halo, Bellwake Landing, Mask Glint) chỉ là lớp phủ theo neo – KHÔNG đổi sprite/hitbox/khung Kiếm Khách. Charm cơ học nhẹ (Ashbound Thread, Bronze Mercy, Stillwater Step); không khoá kỹ năng thiết yếu sau bí mật.
- Nhiều nhiệm vụ dùng **Echo replay** (kỹ năng tái diễn 3 giây) – phiên Sức mạnh / Vùng mới cần có kỹ năng này trước; phiên "an" để các mục đó TẮT tới khi có.
- **Làng Chuông**: nhiệm vụ "A Name Returned" cần 1 bia tưởng niệm trong làng (phiên Cốt truyện / Làng Chuông đặt chỗ + ảnh ChatGPT); điều kiện dùng sẵn `{"dem":{"loai":"the_ten","so":4}}` + vào phòng có bia.
