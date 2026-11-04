# Ảnh tháp TURRET MERGE (tuỳ chọn)

Hiện tại mọi tháp được VẼ BẰNG CODE (thap/js/render.js `veThap`). Muốn thay bằng ảnh PNG thì thả file vào thư mục này, đúng tên:

- `<id>_de.png` — ĐẾ tháp nhìn từ trên xuống, ảnh vuông, nền trong suốt (vd. 256×256). Vẽ phủ ~2,1 × bán kính đế.
- `<id>_nong.png` — NÒNG / đầu súng, nòng chĩa sang PHẢI, nền trong suốt. Trục xoay nằm ở 30% bề ngang tính từ mép trái, giữa chiều cao.
  70% bề ngang còn lại = độ dài nòng (`TUONG[id].nong` × cạnh ô trong thap/js/data.js), nên đầu nòng trong ảnh phải chạm mép phải.

`<id>`: canon, bang, set, doc, lien, laser, tia, mana, radar, mimic.
Có ảnh nào thì dùng ảnh đó, thiếu thì vẫn vẽ bằng code. Chấm sao (số sao) đang nằm trên đế vẽ code — nếu dùng ảnh đế riêng thì ảnh đế thay luôn phần đó.

Các thư mục bg/, bosses/, enemies/, ui/, v3/ là ảnh bàn / quái / trùm sao chép từ demo/ (NEON GRID).
