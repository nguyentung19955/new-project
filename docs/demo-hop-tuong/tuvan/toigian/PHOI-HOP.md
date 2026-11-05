# Phối hợp — 2 phiên "thẻ tối giản kiểu DCDW" (đọc trước khi sửa)

The coordinator accidentally started TWO sessions from trigger trig_01KTd72bwt9m4kdfcgXeTuDt. Each got a different extra message. Split the work like this:

- Session whose extra message is about the BATTLE TRAY (dcdw_khay_toigian.png):
  - Owns the shared minimal UNIT TILE component (css/js, rim art cutting from raw_p10_khung_toigian.png).
  - Owns the battle tray in SOLO / CO-OP / PVP / ONLINE / Test.
  - Commit the tile component FIRST, in a separate commit whose message contains "o-toigian".
- Session whose extra message is about the DECK SCREEN (dcdw_man_deck.png):
  - Owns the deck builder layout: presets row, compact commander banner, 5 slots, sort/filter row, candidates grid, collection, presets screen.
  - Before using the tile, git pull until the "o-toigian" commit exists (or 40 min), then reuse that tile. Don't make a second tile component.
- Both sessions:
  - Run git pull --rebase before every push, and never revert the other's work.
  - Results / lobby / inspect: the tray session does these after the tray is done.
