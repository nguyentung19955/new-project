# Câu hỏi soạn sẵn để gửi ChatGPT – kế hoạch Vùng 2 (chưa gửi)

Lượt chạy 02/11 không có Claude in Chrome nên CHƯA hỏi được ChatGPT. Lượt sau có Chrome: mở cuộc trò chuyện mới, đính kèm ảnh chụp Vùng 1 (chụp bằng Playwright các phòng P01, P03, P11, P12 + trận trùm, đẩy lên repo rồi gửi theo CHUNG.md) và dán nguyên văn phần dưới. Lưu câu trả lời vào docs/vung-2/ke-hoach-chatgpt.txt.

---

You are the lead game designer for "Tiếng Vọng Cuối Cùng" (The Last Echo), a dark 2D pixel-art metroidvania (root caves, bronze bells, masks) played on iPhone in landscape. Please write your WHOLE answer into one downloadable .txt file AND also print the full content in the chat.

What Region 1 already is (attached screenshots):
- 9 rooms built by a Python script (tile grid, 48 px tiles): P01 Cửa Rễ 48×20, P02 Ngã Ba Mối 60×34, P03 Xưởng Chuông 70×30, P04 Hành Lang Tro 90×18, P05 save bell 32×16, P06 Hố Vỏ 50×36, P09 Miệng Kèn 44×44, P11 Sảnh Chuông Vỡ 56×24 (save bell + elite), P12 Đàn Chuông Câm 40×16 (boss).
- An automatic path checker: whole region reachable, no soft-locks, no one-way traps, gaps ≥3 tiles, every ledge jumpable.
- Room art baked from tiles by a script with a region palette; all props, enemies, VFX, UI drawn by ChatGPT (no code-drawn shapes).
- Player: the Swordsman (run, jump, double jump, wall slide/jump, rope climb, dash, 3-hit combo, parry). Echo mechanic: record 3 s, replay a ghost that holds switches / adds one hit.
- Region 1 enemies: ~10 types (root crawlers, bell creatures, horn spitter, cloth mourner…), 1 elite, 1 boss with phases and 20–30 frame telegraphs. Gate = roots that retract after collecting 3 Broken Bells + an Echo Core.

World (GDD section 8, the Bell Tree, top to bottom): Đỉnh Sấm (lightning on bell rhythm; boss Thunder Bird), Tán Gió (wind that flips direction, giant leaves; Cicada Mother), Tổ Sắt (rope ladders, pulleys, bell hooks; Tick-Tock), Thư Viện Vang (flying books as steps, words become walls; Headless Librarian), Làng Chuông hub, Xưởng Đồng Bỏ Hoang (conveyors, pistons, collapsing floors; Bell Foundry Machine), Rễ Mục (rotting walls break after 2 s; Mold Mother), Hồ Ngầm Phản Chiếu (water mirror clone; Kha – final), Vực Lặng (silence, echo is the only light; Silent Keeper – endgame).

Questions:
1. Region 1 is "Làng Chuông → Rễ Mục" area. In which ORDER should I build regions 2–9 for best progression/difficulty curve, and which region is Region 2?
2. Full plan for Region 2: room list (ids, names, sizes in tiles, connections, save bells, shortcuts, 3 secret rooms with fake walls, 1 hard platforming challenge for a Memory Shard), pacing.
3. Terrain mechanic: exact rules + numbers (timings in ms/frames) and how it is taught room by room.
4. 3–5 enemy types: look, size, HP, attacks, telegraph (frames + visual + sound), animations needed (idle/move/attack/hurt/death) with frame counts.
5. 1 elite and 1 boss: phases, every attack with telegraph, arena layout, required art.
6. Ability unlocked in Region 2 and how rooms gate/use it.
7. A complete art request list (backgrounds far/mid, tile material + palette hex, props, lights, natural animated gate — NOT a flat door, enemy/boss sheets, VFX, item icons).
