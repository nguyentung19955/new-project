# User correction (06/11 11:59 VN) — READ BEFORE BALANCING THE SHOP

User: "Không, phải cày cuốc mới có thẻ đỏ được, chứ không thể có dễ dàng vậy được"
= NO. Red (Mythic) cards must require real grinding; they must NOT be easy to get.

Override the original brief:
- Do NOT target "a Mythic copy every 2–3 days". Mythic (red) copies must be RARE: think weeks of regular play per copy, like DCDW Ancient.
- Remove guaranteed Mythic from: daily login day 7, the free daily shop slot, the lucky wheel free spin. No "Mythic Chest guaranteed red" bought cheaply.
- Mythic odds in chests very low (e.g. ≤0.5% per card in Gold Chest; a Mythic Chest, if kept, must be very expensive in gems and gems must be slow to earn). Pity counter long (e.g. ~100+ Gold Chests) or remove pity.
- Daily Specials: Mythic offer at most rarely (e.g. 1 slot appears ~1 day per week) and very expensive in gold.
- Lucky wheel: Mythic slice tiny (e.g. ≤0.3%) and only on paid gem spins.
- Weekly event may give at most 1 Mythic copy at the very end of a long event track.
- Gold/Common/Rare/Epic can be easier; Gold (Legendary) also clearly grindy but less than red.
- Document the grind in KINH-TE.md: expected days of play per Mythic copy and to max a Mythic card (should be long, months).

## Addendum (06/11 12:00 VN)
User: "Đỏ vàng phải cày như trong game DCDW ấy" = BOTH red and gold must be as grindy as in DCDW.
- Research and mirror DCDW's real economy as closely as possible: DCDW bag/box odds for Legendary and Ancient, Legendary box price in gems, gem income rates, Daily Specials Legendary price/frequency, copies needed per level (namu.wiki 데스티니 차일드:디펜스 워, inven.co.kr, bluestacks/tiprelay guides, YouTube box-opening stats). Cite sources in KINH-TE.md; where DCDW numbers are unknown, choose values at least as strict.
- Gold (Legendary) is NOT "easier" than described above unless DCDW was — treat gold as DCDW Legendary-grind, red as DCDW Ancient-grind (rarer still).

## Addendum 2 (06/11 12:01 VN) — future monetisation
User: "Sau này tôi sẽ hướng tới đẩy lên store nên phải có cơ chế như vậy để thu tiền, nhưng đó là chuyện sau này"
= Later the game will be published on the App Store / Google Play and must earn money; not now.
- Design the economy IAP-READY like DCDW (gems are the premium currency; chests/passes/daily specials priced in gems), but add NO payment code, no store SDK, no real prices now.
- Keep a clean seam: one module for currency grants (e.g. TIEN.cong(loai, so, nguon)) so a future IAP / ad-reward / server receipt can call it; record source tags ('quest','event','shop','iap' reserved).
- Leave UI slots that can later hold paid offers (e.g. a hidden 'Gem packs' tab, a Season Pass track with free + premium rows where the premium row is locked/hidden for now).
- Note in KINH-TE.md which numbers would change once paid gems exist.
