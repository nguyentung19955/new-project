# Báo cáo FALL – Lam từ sheet ChatGPT → pixel **cao 64, ô 80×80**, pivot [40,79], 2 khung · 8 FPS · loop

Nguồn: `fall-sheet-v1.png`, `fall-sheet-v2.png` (1774×887, 2 nhân vật cao 683–756 px kể cả áo choàng bay). Script `tools/chatgpt-anim-to-px.py`:

```
python3 tools/chatgpt-anim-to-px.py --sheet art/nhan-vat/lam-chatgpt/fall-sheet-v1.png --so-khung 2 --ra art/nhan-vat/lam-chatgpt/fall64 \
  --ten fall --fps 8 --loop --hang-mat-bay 33 --do-cao=-20,-20            # (v2: --ra fall64/v2 --khong-anh)
```

Xem: `fall-x4.png` / `fall-x8.png`, `fall.gif` (×4, 8 FPS loop), `so-sanh-goc-x4.png`, `chong-silhouette.png`, `trong-game-x1.png`/`-x4.png` (pivot ở y = 241 − 20), `lat-check.png`, `kiem-tra.json`; bản không chọn `v2/`. Sheet game: `lam-chatgpt-80.png` hàng 3, JSON `fall: row 3, 2 khung, 8 fps, loop true`.

## Chọn bản nào – **v1**

| | **v1 (chọn)** | v2 |
|---|---|---|
| F0 | thân hơi cúi, chân buông xuống, áo nâng nhẹ | thân cúi, áo choàng và **chuông bay rời khỏi mũ** |
| F1 | thân thẳng hơn, gối hơi co, áo vểnh lên sau lưng | cả người ngả ra sau, chân văng sau – khác F0 nhiều |
| Khác nhau F0↔F1 (px) | 1256 | 1469 |
| Vòng F1→F0 "rất nhẹ"? | chưa – đầu đổi độ nghiêng (xem Thẳng thắn) | tệ hơn (cả thân đổi góc) |

## Tỉ lệ, căn

Không có khung chống đất nên tỉ lệ chỉ theo **cỡ đầu** (mắt → đỉnh mũ 19,5 px như Run): s = 0,0916 → cao ra 63 / 69 (69 vì áo bay cao hơn đầu). Thu đa số khối (76 vs 220). Hàng mắt cả 2 khung = **33 = hàng mắt jump F1–F3** (để jump F3 → fall F0 đầu không nhảy), cột mắt 48. Không dịch sprite theo độ rơi.

| Khung | hàng mắt | đáy chân | so pivot | bbox | cao×rộng | px | màu | mắt tự giữ |
|---|---|---|---|---|---|---|---|---|
| F0 | 33 | 75 | +4 | 7,13→78,75 | 63×72 | 1868 | 11 | có |
| F1 | 33 | 73 | +6 | 11,5→76,73 | 69×66 | 1963 | 11 | có |

Lật 2/2 đúng, 0 px sai; không rơi ngoài ô. `anim2d.html` headless "Phát 20 vòng": không khung nào sai thứ tự, điểm nối 1→0 liền mạch về thời gian; "Kiểm lật" ĐẠT.

## Tiêu chí (§3)

* F0 thân hơi duỗi, chân hướng xuống, áo nâng nhẹ: đạt.
* F1 gối hơi co, tay giữ thăng bằng: đạt (gối co, tay trái giơ ra sau).
* Bàn chân dao động 1–2 px: đạt (75 → 73 = 2 px).
* Tay gần dịch 1–2 px, áo/chuông trễ 1–2 px: **không đạt** – áo choàng đổi hẳn hình (bay sau lưng → vểnh lên trên đầu, ~1256 px khác nhau), chuông đổi chỗ 3–4 px.
* Không nhún toàn thân quá mạnh: đầu cùng hàng ✓ nhưng độ nghiêng đầu đổi giữa 2 khung.
* Chân cao hơn pivot 2–4 px: F0 +4 ✓, F1 +6 (hơi nhiều).
* Khép vòng F1→F0 rất nhẹ: **chưa đạt** (ở 8 FPS thấy áo giật qua lại).
* Pivot cố định, không cộng độ rơi: đạt. PNG/sheet/JSON/GIF/alpha/bảng màu/lật: đạt.

## Thẳng thắn

1. **Hai khung khác nhau quá nhiều để loop**: ChatGPT vẽ F0 và F1 như hai tư thế rơi riêng (đầu nghiêng khác, áo choàng khác hẳn, chuông lệch) thay vì một tư thế + biến thiên nhỏ. Lặp 8 FPS trông như "vẫy áo". Cả v2 cũng vậy, nặng hơn. Cách đỡ nhất không scale/không vẽ lại: dùng tạm F0 lặp 1 khung (JSON `frames: 1`) nếu thấy giật – tôi **vẫn để 2 khung** theo tiêu chí, để người xem quyết.
2. **Chuông**: v1 F1 chuông tách khỏi mép mũ 2–3 px (nguồn vẽ rời); v2 F0 bay hẳn ra ngoài.
3. Kiếm tay gần camera (như Run/Jump), chưa đúng thiết kế "kiếm tay xa".
4. Tỉ lệ chỉ theo đầu vì không có khung đứng; so với Run thì đầu bằng, thân (vai→chân) dài hơn ~3 px – không thấy pop ở chuỗi.
5. Chuyển fall F1 → run F0 (tiếp đất): đầu tụt 3 px, chân xuống 6 px – hợp lý.

**Prompt gen lại (ngắn):** "Same character/size as the run sheet. 2-frame falling loop, facing right, transparent: both frames nearly identical – upright body, feet 3–4 px above ground line, knees slightly bent; only the cape (2–3 px), the free hand (1–2 px) and the bell (1 px) change between frames. Keep head angle and position identical. Sword in the far hand."
