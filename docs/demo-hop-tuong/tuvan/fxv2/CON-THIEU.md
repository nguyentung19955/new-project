# Hiệu ứng v2 — còn thiếu gì (sau phần 2, 2026-11-05)

**Tờ hiệu ứng theo ụ: ĐỦ.** Cả 85 ụ đều có tờ riêng (T01–T22) và 15 ụ đổi dạng + Hive Queen có tờ G1–G4. Không ụ nào còn dùng hiệu ứng vẽ code (`tools/thap-kt-vetay.js`: 44 dòng cũ, không thêm dòng mới).

## Đã có ảnh, chưa nối (việc code nhỏ cho session sau — không cần gen)
| Ụ | Ảnh | Lý do chưa nối |
|---|---|---|
| Rainbow `cauvong` | `fx_cauvong_hieu` | ảnh là 1 khúc cong, không lặp ngang được → giữ `hu_cauvong` (dải lặp S5). Cần tờ X1 ô 1. |
| Pandora `pandora` | `fx_pandora_hieu` | ảnh đã vẽ sẵn 6 biểu tượng, code cũng vẽ 6 biểu tượng lên đĩa → trùng; giữ `pandora_dia`. |
| Ricochet `nayda` | `fx_nayda_hieu` | doc cho giữ `hu_luoicua`; vệt nảy hiện dùng hạt chung. |
| Mystery Box `hopbi` | `fx_hopbi_dacbiet` | khoảnh khắc mở hộp nằm trong sigfx.js (không dời móc của sigfx). |
| Frenzy `cuongno` | `fx_cuongno_dacbiet` | chớp đôi dạng 3 vẫn là 2 chớp nòng `fx_cuongno_no`. |
| Mana Core `mana` / Mana Leech `hutmana` | `fx_mana_dan`, `fx_hutmana_hieu` | mảnh/giọt mana bay về thanh mana đang là hạt chung tô màu. |
| Hydra / Chain Link / Chrono / Sync / DNA / Hive | `*_dan2`, `hydra_dan3`, `lienket_dan3`, `chuato_dan2` | đạn cùng 1 sprite cho mọi dạng; cần tách theo dạng khi bắn. |

## Tờ cần gen (tuỳ chọn, cho đẹp hơn)
**raw_fx_X1** — 4 dải lặp ngang dùng trên đường:
```
4 rows, each a long horizontal seamless tileable strip (left edge matches right edge), top-down game FX, same style as attached, solid #FF00FF background, no text:
1 rainbow road segment, 2 green toxic goo trail, 3 icy frost trail, 4 burning ember trail
```
