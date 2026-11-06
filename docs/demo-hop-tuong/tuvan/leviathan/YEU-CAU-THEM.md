# Leviathan — extra user request (06/11 16:14)

User asked whether Leviathan should be placed next to the enemy path (devour range 120 px).
ADD: when the player taps/selects a Leviathan (and while dragging one), draw a faint cyan circle showing the real DEVOUR range (same number the code uses), so the player can see which cells are close enough to the path. Inspect bar line (EN/VI): "Nuốt quái trong vòng xanh — đặt sát đường để nuốt nhiều hơn". Same treatment for any other unit whose skill depends on distance to the path (list them in the report).

# UPDATE (06/11 16:36) — user changed the dragon placement, applies to BOTH dragons
User: "Có thể để là đầu rồng băng nhả từ chỗ ụ nhả ra không, rồng lửa cũng thế"
= The ice-dragon head should appear AT THE CASTING TURRET (rise out of / above the Leviathan's own cell), not drop from the sky near the path start. It breathes from there: the ice stream leaves the dragon's mouth at the turret, reaches the path, then sweeps along the path (same hit area/damage/timing as now). Head sinks back into the turret after.
Do the SAME for WYRM ENGINE's DRAGON DIVE / flame: a fire-dragon head emerges from the Wyrm turret's cell and breathes FIRE (orange/red, ember trail — never blue) from the turret to the path and along it. If fire-dragon head art is needed, add raw_wyrm_rong.png to tuvan/leviathan/CAN-VE.json (short prompt, ref thap/assets Wyrm head + raw_lev_rong.png for style, magenta bg) — the coordinator will generate it.
Keep the dragon readable but don't cover the whole board (scale ~1.5–2 cells, slight transparency over other turrets); respect Reduce Flash / FX presets. Turret File demos too.

# UPDATE (06/11 17:37) — Wyrm Engine fire breath is a SHAKING STILL IMAGE
User (screenshot: Wyrm Engine fire near the path start = one big flame picture jittering): "Hình ảnh như 1 cái ảnh rung vậy, không phải là animation khạc ra lửa" = it looks like a single picture shaking, not a real fire-breathing animation.
FIX: the dragon breath (fire for Wyrm, ice for Leviathan) must be a real frame animation from the turret's dragon mouth: frames play in sequence (ignite → stream grows/flows along the path → dissipate), using a 4x4 16-frame sheet; NOT one sprite scaled/jittered. If a fire sheet is missing, add raw_fx_wyrm_lua.png (4x4 16-frame fire breath stream, orange/red, ember sparks, magenta bg, ref thap/assets Wyrm FX) + raw_wyrm_rong.png to tuvan/leviathan/CAN-VE.json; the coordinator generates them.
