# Prompt tạo hình trên Pippit

Pippit chỉ dùng để dựng hình dáng nhân vật. Việc chuyển sang pixel do `tools/pixelize.py` làm,
nên ảnh từ Pippit cần vẽ phẳng, mảng màu lớn, viền đậm, trên nền hồng cánh sen trơn.

## Cách làm

1. Vào Image studio, mở Image editor, chọn Plugins rồi Image generator.
2. Chọn tỉ lệ khung 1:1 cho một nhân vật, 16:9 cho tấm mảnh rời.
3. Dán prompt, tạo vài lần, chọn bản ưng nhất làm bản chuẩn.
4. Tải ảnh về, lưu vào `art/raw/` với tên không dấu, ví dụ `tho-ren.png`.

Hình đạt khi: chỉ có một nhân vật thấy trọn từ đầu đến chân, tay chân không dính vào thân,
màu tô phẳng không loang, nền hồng trơn không có chữ hay cảnh vật.

## Khung prompt chung

Mọi prompt có cùng phần mở đầu và phần kết, chỉ thay câu mô tả ở giữa.

Hero (quay mặt sang phải):

```
Flat 2D game character design of [MÔ TẢ], single character only, full body, side view facing right, chibi proportions 3 heads tall, arms held clearly away from the body and legs apart so no parts overlap, bold dark outline, flat solid [MÀU] colors with no gradients, no shading and no texture, on a plain solid magenta background with no shadow, no text and no scenery.
```

Boss (quay mặt sang trái, vì boss đứng bên phải sân):

```
Flat 2D game boss monster design of [MÔ TẢ], single monster only, full body, side view facing left, bold dark outline, flat solid [MÀU] colors with no gradients, no shading and no texture, simple large shapes, on a plain solid magenta background with no shadow, no text and no scenery.
```

## Hero

| Hero | [MÔ TẢ] | [MÀU] |
|---|---|---|
| Thợ Rèn | a young Vietnamese village blacksmith hero with a cloth headband, brown leather apron over a short tunic, soot-smudged bare forearms and a simple iron sword in his right hand | brown and orange |
| Thợ Săn | a lean Vietnamese hunter hero wearing a conical leaf hat, moss-green tunic, bamboo quiver on the back and a wooden longbow in hand | moss green and tan |
| Thầy Lang | an elderly thin Vietnamese herbal healer hero with a long white beard, traditional wrapped turban, long indigo robe, a dried gourd bottle on the belt, holding a spear like a walking staff | indigo and white |
| Đô Vật | a huge Vietnamese traditional wrestler hero with very broad shoulders, bare chest, red loincloth and red sash, hair in a topknot, a heavy stone war hammer over one shoulder, much wider than a normal person | red and tanned skin |

## Boss

| Boss | [MÔ TẢ] | [MÀU] |
|---|---|---|
| Mộc Tinh | an ancient banyan tree spirit from Vietnamese legend with a grim human face in the trunk bark, a glowing amber sap core inside its open mouth hollow, two massive branch arms, thick roots as legs and hanging aerial roots like a beard | dark brown and amber |
| Ngư Tinh | a monstrous giant fish demon from Vietnamese legend with an enormous mouth as wide as half its body, rows of teeth, a tall spiked dorsal fin, barnacles on its scales and bright glowing gills on its side | gray-blue and bright blue |
| Hồ Tinh | a white nine-tailed fox demon from Vietnamese legend with nine long tails fanned out twice as wide as its body, red markings around glowing eyes, a sharp elegant shape and a menacing stance | white and red |

## Tấm mảnh rời

Tải ảnh bản chuẩn lên làm tham chiếu, chọn tỉ lệ 16:9, rồi dán:

```
Same character, same colors, same flat style. Take it apart into separate body parts for cutout animation at the same scale: head, torso, upper arm, forearm with hand, thigh, lower leg with foot, and the weapon. Every part drawn complete including hidden areas, no part touching or overlapping another, wide gaps between all parts, plain solid magenta background, no text, no labels, no arrows.
```

Tay và chân chỉ cần vẽ một bên, vì ở góc nhìn ngang hai bên giống nhau.

Prompt này chưa cho kết quả ổn định trên Pippit. Nếu không tách được, chỉ cần ảnh nhân vật đứng nguyên,
phần tách tay chân sẽ làm bằng công cụ.

## Lệnh sửa nhanh

```
Move the arms further away from the body and spread the legs apart so no parts overlap.
```

```
Remove all shading and gradients. Use only flat solid colors with a bold dark outline.
```

```
Remove the background and all text. Use a plain solid magenta background only.
```

## Biến thể của boss

Ba lớp thích nghi của Mộc Tinh (tỉ lệ 16:9, kèm ảnh bản chuẩn):

```
Same monster, same pose, same size, same flat style. Show three variants side by side: 1) bark burnt to black charcoal with glowing ember cracks, 2) body overgrown with green mushrooms and moss, 3) body covered in pale frost and icicles. Plain solid magenta background, no text.
```
