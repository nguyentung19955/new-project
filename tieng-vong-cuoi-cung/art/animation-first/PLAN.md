# Animation-First – reference analysis and plan (Claude, Technical Artist)

Status: **waiting for the Animation Director's (ChatGPT) review.** Nothing has been sent to PixelLab yet.

## 1. Reference analysis (`reference-sheet.jpg`)
The character is about 20–24 px tall: a white rounded-square head with two black dot eyes, a small white body, a **red scarf**, and stubby limbs. The sword is barely visible: a few dark pixels.

**Key finding:** in every attack, *the sword is almost never drawn while it moves.* On the contact frame a large **white crescent smear** replaces both the sword and the arm. Afterwards, 2–3 frames of thin, fading **speed lines** stay where the blade passed while the body recovers. The scarf follows the motion one frame late (follow-through). Readability comes from silhouette changes (lean, crouch, turning away, hopping), not from detail.

| Animation | Frames | Structure |
|---|---|---|
| Attack 1 | 5 | ready, sword low behind → crouch and twist (anticipation) → **diagonal smear, contact** → sword raised in front with a small leftover arc → recovery |
| Attack 2 | 5 | sword raised overhead → **low horizontal smear wrapping round the body (2 frames)** → trailing line → recovery |
| Attack 3 | 8 | guard → turns away, scarf flies up → steps in → **big rising smear** → sword up with trail → hold → fading line → recovery |
| Attack 4 | 7 | ready → **body spins until the back faces the camera** (strong anticipation) → **2 frames of huge vertical crescent with dust and speed lines** → 3 recovery frames as the lines fade |
| Air Attack | 5 | the same smear language as Attack 2, airborne |
| Death | 7 | hit and recoil → stagger → topples → **flat body on the ground (3 frames)** |

**Timing:** short anticipation of 1–2 frames; contact is 1–2 frames with the biggest silhouette; recovery is long (2–3 frames) with lines fading. Feet stay planted except for small hops and steps.

## 2. Proposed Minimal Character Master
- **Canvas:** 64×64. **Character:** about 36 px tall, viewed from the side (sidescroller), facing right.
- **Head:** white rounded square, about 14×13 px, two black 2×3 eyes, no mouth or hair.
- **Body:** small red tunic. **Limbs:** short white arms and legs, tiny dark feet.
- **Sword:** short straight blade, grey/white with a dark hilt, held in the front hand.
- **Palette:** 8 colors or fewer, 1 px dark outline.
- **Smear color:** the same white as the head, so the smear reads as part of the character, exactly as in the reference.

## 3. PixelLab test plan (compare real results, do not guess)
1. **Master:** "Create Character" with the **Sidescroller** camera, a 48 px box, low detail and a single-color outline. Keep only the side view facing right.
2. **Idle (4 f):** compare Skeleton v3 "Breathing Idle" against V3 free-motion "idle".
3. **Walk/Run (6–8 f):** compare Skeleton v3 Walking/Running against V3.
4. **Attack 1 (6–8 f):** three routes side by side, each as a real-speed GIF (about 70 ms/f) at 1× and 3×:
   - **A.** V3 free-motion with a choreography prompt, including "white crescent smear".
   - **B.** Skeleton v3 custom with the same choreography.
   - **C.** Hybrid: the best generated key poses, plus a smear and speed lines drawn pixel by pixel in the reference style (no resampling).
5. **QA:** silhouette, weight shift, a continuous sword path, smear direction, jitter, and how it reads at 1×.

## 4. First PixelLab prompt (character master)
```
Minimal chibi pixel-art swordsman for a side-scrolling action game, side view facing right. Large white rounded-square head with two small black vertical eyes, no mouth, no hair. Small red tunic body, short stubby white arms and legs, tiny dark feet. Holds a short simple straight grey sword with a dark hilt in the front hand, pointing down-forward. Flat colors, 1-pixel dark outline, very limited palette, clean pixel clusters, strong readable silhouette. No armor, no accessories, no background.
```
