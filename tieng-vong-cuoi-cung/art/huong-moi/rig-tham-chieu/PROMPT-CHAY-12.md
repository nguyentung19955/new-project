# Prompt gen Lam CHẠY 12 hình theo rig (thử cách mới – 29/10/2026)

Làm theo `docs/KINH-NGHIEM-GEN-CHUYEN-DONG-BANG-RIG.md`. Rig dựng bằng code: `rig-chay-12.png` (2 hàng × 6, đọc trái → phải, hàng trên rồi hàng dưới).

## Prompt A – gen nhân vật theo rig (dùng trước)

**Đính kèm 3 ảnh, theo thứ tự:**
1. `art/huong-moi/rig-tham-chieu/rig-chay-12.png` (rig)
2. `art/huong-moi/nguon/lam-moi-chuong-tan.png` (Lam chốt)
3. `game/thu-p0a/am-dao/am-dao-cap1.png` (Âm Đao cấp 1, đã cắt riêng; nếu không có thì dùng `art/huong-moi/nguon/vu-khi/vu-khi-mau.png`)

Dán nguyên khối dưới (tiếng Anh):

```
Image 1 is a 12-frame RUN pose rig (2 rows × 6, read left→right, top row first). Image 2 is the approved character Lam, image 3 is her blade (Am Dao, a twin-prong tuning-fork short sword). Draw Lam over EVERY rig frame as a 12-frame run sprite sheet.

Conventions (keep exactly): side view, facing RIGHT; front = right of image. NEAR limbs = Lam's LEFT side = ORANGE in the rig, drawn IN FRONT of the body. FAR limbs = her RIGHT side = BLUE, drawn BEHIND the body. Teal = head and torso. Light-grey outline = the hood and cloak silhouette to fill. The line = ground.

Match each cell to its rig cell: same head position, torso lean (~10° forward), pelvis height, knee and ankle positions, and the same foot-ground contact. Do not invent other poses. The near hand holds the blade low in front of the hip, blade almost horizontal, pointing forward; it barely moves.

Frames: 1 near foot heel contact, far leg behind · 2 near foot takes weight · 3 near leg under body, far knee passes forward · 4 near toe pushes off · 5 flight, both feet off · 6 flight, far foot reaching · 7 far heel contact · 8 far foot takes weight · 9 far leg under body, near knee passes · 10 far toe pushes · 11 flight · 12 flight, near foot reaching.

Same Lam as image 2 in every cell: same big hood size and shape, narrow dark face opening, one small amber eye, bell, rope, gloves, long cloak covering almost all legs – only boot tips show. Head height almost constant (tiny bounce). Same scale in all cells. Replace the rig with the body: no rig lines, dots or colors left.

Output: 12 equal cells, 2 rows × 6, same order, shared ground line per row, full body uncropped with margin, plain white background, no text, numbers, borders or effects.
```

## Prompt B – dự phòng (nếu ChatGPT đổi tỉ lệ / to nhỏ khác nhau / lệch tư thế)

Đính kèm: ảnh kết quả lần A + `rig-chay-12.png` + Lam chốt. Dán:

```
Fix the attached run sheet (image 1) using the rig (image 2) and approved Lam (image 3). Keep the same 12 cells and order; only correct:
- Scale: every cell the same size as image 3 – hood width and height identical in all 12 cells, no cell bigger, smaller or squashed.
- Pose: each cell must sit on its rig cell – head, torso lean, pelvis height and the planted boot exactly where the rig shows. Bounce stays tiny.
- Near (orange, Lam's left) limbs in front of the body, far (blue, right) limbs behind; facing right.
- Cloak stays long, only boot tips visible.
Cells to fix: [ghi số ô, ví dụ 2, 5, 8]. Leave the other cells unchanged.
12 equal cells, 2 rows × 6, shared ground line, white background, no text or borders.
```

## Mẹo

- Nếu máy trả 1 hàng 12 ô thay vì 2 × 6 thì vẫn dùng được (dựng sheet chọn `cot 12 hang 1`).
- Nếu đổi lần nào cũng lệch: thử đính kèm `rig-chay-12-1hang.png` và đổi dòng Output thành "12 equal cells in ONE row".
- Không cần xin nền trong suốt: code đã tách nền trắng tốt.
