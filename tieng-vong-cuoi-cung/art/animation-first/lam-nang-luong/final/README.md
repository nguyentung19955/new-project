# Lam: locked animations (PixelLab Editor)

| Animation | Source | Frames | ms/frame | Notes |
|---|---|---|---|---|
| idle | `editor_idle_v3_clean` (Skeleton v3, fixed head Always, template idle, South-east) | 4 | 160 | Locked by ChatGPT QA + technical QA |
| run | `editor_run_v1_clean`, **played in reverse order (F8 to F1)** | 8 | 80 | The user chose this order after watching the GIF |

Post-process: only floating pixel pieces detached from the body were deleted (`don-manh.py`); nothing was drawn.
