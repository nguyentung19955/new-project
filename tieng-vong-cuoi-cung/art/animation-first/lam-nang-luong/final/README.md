# Lam: locked animations (PixelLab Editor)

| Animation | Source | Frames | ms/frame | Notes |
|---|---|---|---|---|
| idle | `editor_idle_v3_clean` (Skeleton v3, fixed head Always, template idle, South-east) | 4 | 160 | Locked by ChatGPT QA + technical QA |
| run | `editor_run_v1_clean`, **played in reverse order (F8 to F1)** | 8 | 80 | The user chose this order after watching the GIF. R1–R2: round wrist orb replaced by a pointed wrist flame via PixelLab Inpaint (Pro Flash, `run_lua/`). Whole body leaned forward 5 px (`nghieng2.py 5`; the mask rows share one shift so the face never jogs) |

Post-process: only floating pixel pieces detached from the body were deleted (`don-manh.py`); nothing was drawn.

Rebuild the run package: `python3 nghieng2.py 5 run_lua run_lua/nghieng5 && python3 lam-dong-goi.py run_lua/nghieng5 final/run 80`
