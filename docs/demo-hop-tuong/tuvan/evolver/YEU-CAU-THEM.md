# Evolver — extra user rule (06/11 13:19)

User: "nhưng nếu bị giảm sao do boss hoặc bằng cách nào đó tương tác của ụ nào khác làm nó giảm sao thì lại hoàn lại đếm ngược"

= A 7★ dud Evolver (husk shown, no effect) that later DROPS BELOW 7★ (boss star-down skill, or any other turret/skill that lowers stars) becomes a working Evolver again:
remove the bomb husk, restart the countdown from the full delay for its new star count, and it can transform again as normal.
Applies in every mode (SOLO/CO-OP/PVP/ONLINE, deterministic online). Add a regression test (7★ dud → star-down to 6★ → countdown restarts → transforms).

## Done (06/11) — note for the green skill-ring session
Evolver (`SKILLS.tienhoa.bomDem = true`) draws its own TIME-BOMB countdown (growfx.js `veEvoBom`, called from `veGauge`).
Any new generic skill-timer ring MUST skip skills with `bomDem` (Evolver + Copycat copies of it). Check: `node tools/thap-chup-evolver.js`.
