# Arcane Cascade / Thác Mana (`thacmana`, Đỏ, Tấn công, họ MANA) — ảnh cần sinh (ChatGPT)

Hiện dùng **ảnh TẠM** (đổi màu ảnh Tesla `set` → tím/xanh lơ mana, `/home/claude/mana-tools/recolor.py` — không commit tool):
`thap/assets/thacmana_de.png`, `thacmana_nong.png`, `thacmana_phu.png`, `thacmana_vien.png`, `nho/thacmana.png`, `glyph/thacmana.png`.
Số cỡ trong `artscale.js` / `meta.js ART_META` đang chép của Tesla — sinh ảnh thật xong thì cắt bằng quy trình ụ mới (`docs/demo-hop-tuong/tuvan/u-moi/cat-game.json`) và ghi lại số cỡ.
**Chưa có**: chân dung chỉ huy `pilot_thacmana.png` (+ `pn/`), ảnh lớn `hero/hero_thacmana.jpg` — code tự dùng icon `nho/thacmana` (thẻ, khay) và `portraitOf` (trang ụ) thay thế.
Có ảnh chân dung → thêm `thacmana` vào `PILOTS` (`thap/js/text.js`), mốc mặt vào `chandung.js` PO_NEO/HERO_NEO + `khung.js` FACE_BOX, `tools/thap-cat-chandung.json`.

## 1. Ụ (bệ + đầu súng + vòng phụ) — 1 tấm lưới 2×2, đính kèm ảnh Tesla/Energy Cannon làm mẫu phong cách
```
Same style as attached (top-down mobile tower-defense turret, chunky sci-fi metal, thick dark outline, cel shading).
Grid 2x2 on solid magenta #FF00FF background, no text, each item centered with padding:
(1) turret BASE, top-down, round-triangular gunmetal platform with three glowing violet mana crystal nodes and cyan energy channels, Mythic red-gold trim accents;
(2) turret HEAD, top-down, pointing RIGHT: a floating violet-blue arcane mana orb held by three curved metal prongs, small cyan runes, crackling purple energy;
(3) small ring accessory under the head: cyan-violet arcane coil ring with rune segments;
(4) thin outline ring of the base silhouette (light gray), same shape as (1).
```

## 2. Chân dung chỉ huy (pilot) — đính kèm 2 chân dung chỉ huy Đỏ có sẵn (vd. pilot_ronglua, pilot_cobac)
```
Same style as attached (anime gacha commander portrait, bust, 3/4 view, rich cel shading). Solid magenta #FF00FF background, no text.
A calm arcane battle-mage engineer in dark gunmetal sci-fi armor with violet glowing mana conduits, long silver-lavender hair,
holding a floating violet-blue mana orb that leaks bouncing purple lightning; cyan rune tattoos; Mythic red-gold trim on shoulder plates.
```

## 3. Hiệu ứng (tuỳ chọn, thay tia sét tô màu `tia_set`)
```
Same style as attached. Solid magenta #FF00FF background, no text. Horizontal tileable strip 1024x128:
a violet-blue arcane mana lightning bolt with a white-hot core and small cyan rune sparks, both ends soft so tiles overlap seamlessly.
```
