# Ảnh cho giao diện NGOÀI TRẬN anime (B3, 09/11) — prompt gen ChatGPT

**ĐÃ GEN 09/11 (cả 7 mục, đạt lần đầu):** raw_ui3_vongquay, raw_ui3_icon_nho, raw_ui3_banner (băng shop + khung băng sự kiện chung 1 tấm), raw_ui3_ruong, raw_ui3_tam, raw_ui3_nen_home (cũng thay nen_menu.jpg của màn tải). Cắt: `tools/thap-cat-ui3.py` mục 7.

Đang dùng ảnh TẠM (cắt từ tấm có sẵn bằng `tools/thap-cat-ui3.py`, hoặc tấm chàm + icon). Gen xong: đặt raw vào
`docs/demo-hop-tuong/thap-art/raw_ui3_<ten>.png`, thêm bước cắt vào `tools/thap-cat-ui3.py` (ghi đúng tên `thap/assets/ua_*.png`)
rồi đổi 1 dòng CSS/JS ghi ở cột "Chỗ dùng".

Tiền tố chung (MASTER STYLE): "Create an image. Premium 2D anime fantasy-tech mobile game UI, dark indigo ceramic surfaces, subtle magical cyan
energy, thin champagne-gold accents, elegant clean geometry, polished anime gacha aesthetic, crisp readable silhouettes, consistent top-left
lighting, restrained bloom, no heavy industrial machinery, no hazard stripes, no bolts, no text, no watermark. Same style as attached
(raw_ui2_nut.png, raw_ui2_icon_home.png). Solid flat magenta #FF00FF background."

| Ưu tiên | Tên raw → ảnh | Đang tạm bằng | Chỗ dùng | Prompt (thêm sau tiền tố) |
|---|---|---|---|---|
| 1 | `raw_ui3_vongquay` → `ua_vq_banh`, `ua_vq_khung`, `ua_vq_mui` | vòng quay thép cam cũ (shop_banh / shop_banh_khung / shop_mui) | KTA.banh / banhKhung / mui (kinhte-ui.js) — đổi trong UA.doiDuLieu | "3 separate parts on one sheet, 1×3 grid: (1) flat top-down LUCKY SPIN WHEEL disc, 8 equal wedges alternating deep indigo and violet-blue glass, thin champagne-gold spokes, small cyan gem hub, EMPTY wedges (no icons, no numbers); (2) the wheel's ornate round FRAME RING + short pedestal stand, champagne gold and indigo ceramic, cyan gems at 4 points, hollow center; (3) small POINTER arrow, gold with cyan gem, pointing down. Square 3:1." |
| 1 | `raw_ui3_icon_nho` → `ua_ic_khoa`, `ua_ic_cong`, `ua_ic_tick` | ổ khoá: chưa có (TTA.khoa rỗng, chỉ nhãn chữ) · ô bộ bài trống: nút tròn rỗng | TTA.khoa = 'ua_ic_khoa' (tientrinh.js) · `.o-bo:not([data-id]) > img.dc-cong` (ui-anime.css) | "1×3 grid of small icons, readable at 20–32 px: (1) PADLOCK, champagne-gold body with small cyan gem keyhole; (2) PLUS sign glyph, glowing cyan with thin gold edge, no circle; (3) CHECKMARK glyph, cyan with thin gold edge. Wide 3:1." |
| 2 | `raw_ui3_banner_shop` → `ua_bn_shop` | tấm chàm + icon túi (băng DAILY SPECIALS) | `.kt-bn > img` (ui-anime.css: bỏ content:url ua_ic_shop) | "Wide shop banner illustration 3.4:1, NO frame, NO text: anime fantasy merchant stall at twilight, floating crystals, open treasure chest with gold coins and pink gems on the RIGHT third, LEFT 60% calm dark indigo area for title text, soft cyan magic sparkles. Edges fade to transparent-friendly dark indigo #10162F." |
| 2 | `raw_ui3_banner_sk` → `ua_bn_sk` | tấm chàm (băng ụ nổi bật sự kiện) | `.kt-skd > .kt-skd-bn` | "Wide event banner frame 3.3:1, EMPTY center: ornate champagne-gold and indigo ceramic frame with laurel and star motif at top center, cyan inner edge, left square socket for a portrait, dark translucent indigo glass inside. 9-slice friendly, symmetric." |
| 3 | `raw_ui3_ruong` → `ua_ru_{thuong,vang,than}` (+ `_mo`) | rương thép/vàng/đen cũ (shop_ru_*) | KTA.ru / ruMo | "2×3 grid: three TREASURE CHESTS (Normal: indigo ceramic + silver trim + cyan gem; Gold: champagne-gold + white ceramic + cyan gem; Mythic: black-violet obsidian + rose-red crystals + gold trim), top row CLOSED, bottom row OPEN with soft light burst. 3/4 view, same size." |
| 3 | `raw_ui3_tam` → `ua_tam2` | ua_tam (cắt từ ô mana HUD, viền vàng dày, có loé sáng) | biến `--ua-t` | "Large empty dialog PANEL, 9-slice friendly, 3:2: thin champagne-gold outer rim, chamfered corners with tiny cyan gem at each corner, thin cyan inner line, dark translucent indigo glass center with very faint rune circle, NO bright glare spots." |
| 4 | `raw_ui3_nen_home` → `ua_nen.jpg` | ghép trời lâu đài + vòng phép từ raw_ui2_ban | `.hm-nen/.dk-nen/.kt-nen/#up .up-nen` | "Portrait 1:2 mobile menu BACKGROUND, NO UI, NO characters: twilight sky over a crystal castle on a distant cliff in the TOP third, soft clouds and stars, middle third calm dark indigo (character will stand there), bottom third faint glowing cyan magic circle on the floor with pink cherry blossoms at both bottom corners. Low contrast, darker than the HUD." |

Ghi chú: logo/tên game do phiên đổi tên "Astral Arsenal" lo — không gen ở đây.
