# Prompt ChatGPT — ảnh cho DEMO "NEON GRID — Merge Defense" (`demo/`, cyberpunk)

**Cách dùng (mở nhiều cuộc trò chuyện ChatGPT song song):**

1. Làm **LÔ 0** trước trong 1 cuộc trò chuyện → được ảnh `style-reference.png`. Lưu lại (không cần thả vào game).
2. Mở các cuộc trò chuyện khác, mỗi cuộc **1 lô** (LÔ 1 … LÔ 5). Trong mỗi cuộc: **đính kèm `style-reference.png`**, rồi
   dán **nguyên khối của lô đó** (đã có sẵn STYLE GUIDE ở đầu). Gõ "next" để ChatGPT làm ảnh tiếp theo trong lô.
3. Tải từng ảnh, **đổi tên đúng tên file ghi trong prompt**, thả vào đúng thư mục `demo/assets/...`.
   Demo tự dùng ảnh mới; chưa có ảnh thì vẽ bằng code như hiện tại. Tải lại trang (Ctrl+F5) để thấy.

> Ảnh phải là **PNG nền trong suốt thật** (trừ nền thành phố). Nếu ChatGPT trả nền caro giả / nền đen, nói:
> "Re-export as PNG with a real transparent alpha background, no checkerboard, no black backdrop."
> Tướng là **người** (chibi cyberpunk), quái/boss là máy. Ảnh nhân vật nên **nhìn sang PHẢI**, đứng chính giữa, chân chạm mép dưới (game căn theo đáy ảnh).

| Thư mục | Tên file game đọc |
|---|---|
| `demo/assets/units/` (8 tướng) | `scorch.png` `frost.png` `arc.png` `lance.png` `warp.png` `miner.png` (BROKER) `glitch.png` `venom.png` |
| `demo/assets/enemies/` | `thuong.png` (Drone) `nhanh.png` (Skitter) `trau.png` (Bulwark) |
| `demo/assets/bosses/` | `firewall.png` `overclock.png` `corruptor.png` |
| `demo/assets/bg/` | `city.png` `cell.png` `core.png` `portal.png` |
| `demo/assets/ui/` | `summon.png` `card.png` `button.png` |

---

## LÔ 0 — Style reference (làm TRƯỚC, 1 ảnh)

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Premium mobile merge tower-defense, cyberpunk night city. CHIBI ANIME style: clean cel-shaded 2D anime
  illustration with glossy highlights, big head (about 1:1 with the body), big expressive anime eyes with two
  white highlights and irises in the faction color, spiky/stylized anime hair with a shine band, short legs.
  Cool and confident, crisp thick dark outline, silhouette readable at 64 px. NOT pixel art, NOT photoreal, NOT 3D.
- Techwear outfits: dark jackets/armor (#1d2336 #3c4762, highlights #6b7a99), glossy black visors, glowing emissive
  trims and weapons in the hero's faction color. Diverse skin tones and hairstyles.
- Neon rim light: cyan #3ce7ff back-left, magenta #ff2bd6 back-right; faction color glows on trims/eyes/weapon.
- 3/4 front view from slightly above, facing RIGHT, full body, centered, feet on bottom edge, small glowing hover
  pad under the feet in the faction color.
- 1024x1024 PNG, TRANSPARENT background, no text, no logo, no frame. One hero per image.
- Faction colors: PLASMA #ff6a2a · CRYO #5ee7ff · VOLTAGE #ffe24a · LASER #ff3c8e · VOID #a35cff ·
  NANITE #4d8dff · HACK #00ffa3 · TOXIN #b4ff2a. Enemies are machines: red #ff3355 / magenta #ff2bd6 / orange #ff8a1a.

Image: style-reference.png — a lineup sheet on a DARK background (this one only, not transparent) showing 3 chibi
chibi anime cyberpunk heroes side by side in exactly the style above (an orange pyro mercenary with a flamethrower gauntlet,
a cyan ice mage girl with a crystal staff, a pink rail-sniper with a visor), plus one small red enemy drone and a
sample glass neon UI button. This image is the visual reference for all next images.
```

---

## LÔ 1 — Tướng 1–4 (4 ảnh, 1024×1024, nền trong suốt) → `demo/assets/units/`

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Premium mobile merge tower-defense, cyberpunk night city. CHIBI ANIME style: clean cel-shaded 2D anime
  illustration with glossy highlights, big head (about 1:1 with the body), big expressive anime eyes with two
  white highlights and irises in the faction color, spiky/stylized anime hair with a shine band, short legs.
  Cool and confident, crisp thick dark outline, silhouette readable at 64 px. NOT pixel art, NOT photoreal, NOT 3D.
- Techwear outfits: dark jackets/armor (#1d2336 #3c4762, highlights #6b7a99), glossy black visors, glowing emissive
  trims and weapons in the hero's faction color. Diverse skin tones and hairstyles.
- Neon rim light: cyan #3ce7ff back-left, magenta #ff2bd6 back-right; faction color glows on trims/eyes/weapon.
- 3/4 front view from slightly above, facing RIGHT, full body, centered, feet on bottom edge, small glowing hover
  pad under the feet in the faction color.
- 1024x1024 PNG, TRANSPARENT background, no text, no logo, no frame. One hero per image.

Make these 4 images, one at a time (wait for "next"):

1) scorch.png — SCORCH, PLASMA (#ff6a2a). Pyro mercenary man, tan skin, orange glowing mohawk, goggles on forehead,
   red-brown armored leather jacket, fuel tank on his back, a heavy plasma flamethrower gauntlet on his right arm
   pointing right with a hot orange nozzle glow and sparks.

2) frost.png — FROST, CRYO (#5ee7ff). Cryomancer young woman, pale skin, long white-blue hair, long dark navy coat
   with cyan trims, holding a tall staff topped by a glowing ice crystal, small ice shards floating around.

3) arc.png — ARC, VOLTAGE (#ffe24a). Electro swordsman, spiky black hair with a yellow streak, dark grey techwear
   with yellow trims, holding a glowing yellow energy katana raised forward-right, crackling lightning on the blade.

4) lance.png — LANCE, LASER (#ff3c8e). Rail sniper, dark skin, short hair, glowing pink visor across the eyes,
   dark burgundy tactical jacket, aiming a very long railgun rifle to the right with a pink emissive line and scope.
```

---

## LÔ 2 — Tướng 5–8 (4 ảnh, 1024×1024, nền trong suốt) → `demo/assets/units/`

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Premium mobile merge tower-defense, cyberpunk night city. CHIBI ANIME style: clean cel-shaded 2D anime
  illustration with glossy highlights, big head (about 1:1 with the body), big expressive anime eyes with two
  white highlights and irises in the faction color, spiky/stylized anime hair with a shine band, short legs.
  Cool and confident, crisp thick dark outline, silhouette readable at 64 px. NOT pixel art, NOT photoreal, NOT 3D.
- Techwear outfits: dark jackets/armor (#1d2336 #3c4762, highlights #6b7a99), glossy black visors, glowing emissive
  trims and weapons in the hero's faction color. Diverse skin tones and hairstyles.
- Neon rim light: cyan #3ce7ff back-left, magenta #ff2bd6 back-right; faction color glows on trims/eyes/weapon.
- 3/4 front view from slightly above, facing RIGHT, full body, centered, feet on bottom edge, small glowing hover
  pad under the feet in the faction color.
- 1024x1024 PNG, TRANSPARENT background, no text, no logo, no frame. One hero per image.

Make these 4 images, one at a time (wait for "next"):

5) warp.png — WARP, VOID (#a35cff). Void witch, long dark-violet hair, flowing dark purple robe, a glowing purple
   halo ring with four light nodes behind her head, a small swirling singularity orb floating above her right hand.

6) miner.png — BROKER, NANITE (#4d8dff). Data broker woman, brown skin, hair in a bun, blue glowing visor, sharp dark
   navy suit with blue trims, holding a holographic blue chart screen, a golden hexagon credit-coin hologram floating
   above her hand.

7) glitch.png — GLITCH, HACK (#00ffa3). Netrunner in a deep dark hood, face hidden in shadow except a glowing
   mint-green visor bar, dark green techwear, a compact EMP pistol pointing right, small floating mint code blocks
   (abstract, no readable text).

8) venom.png — VENOM, TOXIN (#b4ff2a). Toxin assassin, dark skin, spiky hair with a lime tip, metal gas mask with two
   glowing lime filters, dark olive tactical gear, twin needle guns pointing right with lime glowing tips.
```

---

## LÔ 3 — Quái + boss (6 ảnh, nền trong suốt) → `demo/assets/enemies/`, `demo/assets/bosses/`

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Premium mobile merge tower-defense, cyberpunk night city. Stylized 3D render, chunky proportions, hard-surface,
  crisp silhouette readable at 32–64 px. NOT pixel art, NOT anime, NOT photoreal.
- Hostile machines: dark plates with HOSTILE glow colors (red #ff3355, magenta #ff2bd6, orange #ff8a1a), menacing but not gory.
- Neon rim light cyan #3ce7ff back-left, magenta #ff2bd6 back-right. 3/4 view, moving to the RIGHT, centered,
  bottom of the body on the bottom edge. TRANSPARENT background PNG, no text, no logo, no frame. One per image.

Make these 6 images, one at a time (wait for "next"):

1) thuong.png (512x512) — DRONE: hovering disc drone, dark red-metal body, one big glowing red eye, two small rotors on top.
2) nhanh.png (512x512) — SKITTER: low fast glitch-virus crawler, angular dark-violet shell with magenta glitch stripes,
   four thin legs, white-hot arrow-shaped eye, slight digital-glitch offset effect on its edges.
3) trau.png (512x512) — BULWARK: heavy tank mech on treads, boxy armor, a big front shield plate with orange emissive
   stripes, narrow orange visor slit. Clearly slow and very tough.
4) firewall.png (1024x1024) — BOSS FIREWALL: giant hexagonal armored wall-creature covered in a glowing red grid of
   cells, a row of red flame-like spikes on top, one wide angry red visor slit, two stubby legs. It locks down the player's turrets.
5) overclock.png (1024x1024) — BOSS OVERCLOCK: round heavy core machine with a blazing golden-amber reactor orb in the
   center, a huge spinning gear ring around it, three piston legs, heat haze. Color amber #ffb31a.
6) corruptor.png (1024x1024) — BOSS CORRUPTOR: a mass of corrupted purple data cubes clumped into a creature, several
   glowing magenta tendrils, one big white-magenta eye in the middle, digital glitch fragments. Color #c04dff.
```

---

## LÔ 4 — Nền, ô, Core, cổng quái (4 ảnh) → `demo/assets/bg/`

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Cyberpunk megacity at night in heavy rain, neon cyan #3ce7ff and magenta #ff2bd6 dominant, deep violet sky #0c0422,
  stylized 3D render, soft volumetric glowing fog, wet reflective surfaces. NOT pixel art, NOT photoreal.
- No text, no logos, no readable signs, no characters.

Make these 4 images, one at a time (wait for "next"):

1) city.png (1688x780, landscape, NOT transparent) — wide game background: distant neon skyscrapers silhouetted along
   the upper half (a glowing magenta horizon haze, rain streaks, floating holographic billboards without text), the
   lower half is a dark wet ground plane with a faint perspective neon grid. The CENTER of the image must stay dark
   and low-detail (the game board and road are drawn on top). Dark overall, so neon UI stays readable.
2) cell.png (256x256, transparent) — one square glass floor tile for placing units, top-down: dark translucent glass
   with a thin cyan edge, small cyan corner brackets, subtle inner grid, slightly rounded corners. Seamless square.
3) core.png (512x512, transparent) — the MAINFRAME CORE the player defends: hexagonal metal pedestal with a bright
   cyan energy orb floating above it, two thin glowing orbit rings around the orb. 3/4 view.
4) portal.png (512x512, transparent) — enemy spawn portal: a tall oval rift with a magenta glowing dashed rim,
   pitch-black inside with faint glitch static, sparks. Front view.
```

---

## LÔ 5 — Nút giao diện (3 ảnh, nền trong suốt) → `demo/assets/ui/`

```text
STYLE GUIDE — "NEON GRID" (keep identical across every image; match the attached style-reference.png)
- Cyberpunk game UI, glassmorphism: dark translucent smoky glass (#0a0e24 at ~60% opacity look), thin neon edges in
  cyan #3ce7ff and magenta #ff2bd6, subtle inner glow, tiny tech corner details. Flat front view.
- EMPTY CENTER — absolutely NO text, NO icons, NO numbers (the game writes text on top).
- TRANSPARENT background outside the button shape. PNG.

Make these 3 images, one at a time (wait for "next"):

1) summon.png (800x352) — the big main action button: wide rounded rectangle, gradient neon border cyan→magenta,
   slightly brighter glass inside with faint diagonal light streak. Very premium.
2) card.png (400x344) — upgrade card frame: dark glass panel with a thin neutral light-blue border, a darker strip
   along the bottom (for the price), small corner notches.
3) button.png (192x152) — small square-ish icon button: dark glass, thin cyan border, slight bevel, empty center.
```

---

### Kiểm tra sau khi thả ảnh
- Mở `demo/index.html` (bấm đúp được) hoặc bản web `/demo/`. Màn chọn tướng hiện ảnh mới → đã nhận.
- Ảnh tướng dùng cho cả nhân vật trên sân lẫn **thẻ bài** (game tự cắt bán thân, đầu nên ở 1/3 trên ảnh).
- Ảnh tướng/quái chỉ cần **1 tư thế** — game tự thêm nhún, quầng sáng, giật bắn, vạch hạng.
- Tên file viết thường đúng như bảng. Ảnh quá to vẫn chạy nhưng nên giữ cỡ ghi trong prompt cho nhẹ.
