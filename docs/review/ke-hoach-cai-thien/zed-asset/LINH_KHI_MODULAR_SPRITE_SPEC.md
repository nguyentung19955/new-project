# LINH KHÍ — QUY CÁCH SPRITE GHÉP LỚP (MODULAR) CHO ZED

*Phiên bản 1 — 12/10/2026. Làm theo [YEU-CAU-2-MODULAR.md](YEU-CAU-2-MODULAR.md) (thắng khi khác [YEU-CAU.md](YEU-CAU.md)) và chốt của chủ dự án: 4 vũ khí = **kiếm, thương, búa, phi tiêu** (bỏ cung).*

> **Canonical đổi giữa phiên.** Yêu cầu của phiên này ghi canonical = `zed-canonical.png` (Zed ninja tóc đen, không sừng). Trong lúc làm, repo có commit mới hơn **"Chốt tấm thân Zed v2 (đứng/đi/chạy) làm canonical"** → `zed-v2-canonical.png` (tóc trắng, hai sừng, cởi trần, khăn đỏ, quần đen rộng, dép). Quy cách này **không phụ thuộc** nhân vật: khung, số khung, neo, lớp, validator, trang ghép, module game giống hệt cho cả hai. Prompt có **hai bộ cùng bố cục** (`prompt-v3/` = v2, `prompt-v3/ninja/` = ninja); trang ghép nhúng sẵn **cả hai** thân. Mặc định theo commit mới nhất: **v2**. Chủ dự án xác nhận lại một lần là đủ.

**Đọc nhanh (cho chủ dự án):**
- Zed sẽ được **ghép từ nhiều tấm ảnh chồng lên nhau**: thân trơn → quần → áo/giáp → đai → giáp vai → găng → mũ → đồ lưng/cánh → vũ khí. Đổi một món = đổi một lớp, không vẽ lại cả người.
- Đồ **ôm theo người** (áo, quần, giáp, găng, giày) phải có ảnh **cho từng khung** của từng động tác. Đồ **cứng** (mũ, gùi, cánh, vũ khí, phi tiêu đang bay) chỉ cần **1 ảnh** (cánh: 1 hàng vỗ cánh) và được **gắn vào điểm neo** đo trên thân.
- Thời lượng đòn và lúc gây sát thương **không đổi**: số khung mỗi đòn được chọn để khung "chạm" hiện đúng lúc game trừ máu (bảng mục 5).
- Chưa có ảnh nào **INTEGRATED**. Hai canonical đều **GENERATED** (v2: kiểm tự động ĐẠT; ninja: LỖI vì hàng chạy chạm mép ô). Điểm neo tay, đầu, lưng **chưa đo** — để trống, không bịa.

---

## 1. Đánh giá asset hiện có

Số đo thật bằng `docs/anh-goc/zed/kiem-sheet.py` (kết quả đầy đủ: `docs/anh-goc/zed/kiem/zed-canonical/ket-qua.txt`).

| Asset | Hiện trạng (đo) | Quyết định |
|---|---|---|
| `zed-v2-canonical.png` (2048×768, 8×3) — **canonical mới** | Kiểm tự động **ĐẠT** (`kiem/zed-v2-canonical/ket-qua.txt`): không lưới (1 vạch lẻ), ô không đều (rộng 244–277, cao 251–262) → máy dò khe để chia; người cao 234 (đứng) / 229 (đi) / 217 (chạy) điểm ảnh, đều trong hàng; không chạm mép; tỉ lệ về game **0,2644**; tâm thân 47,5% / 44,1% / 48,5% bề ngang ô. Khăn đỏ, quấn tay, quần rộng, dép **vẽ liền**; thân trên cởi trần. | **GIỮ** làm chuẩn nhận diện + thân xem thử (trang ghép, mặc định). Thân production vẫn cần **thân trơn** (prompt `01`, bản v2: giữ cởi trần, đổi quần rộng → quần bó, bỏ khăn/quấn tay/dép) vì cùng lý do: đồ vẽ liền không tháo được. Chờ người xem GIF → mới VALIDATED. |
| `zed-canonical.png` (1536×1024, 8×3) — ninja, canonical theo yêu cầu phiên | Ô **không đều** (rộng 189–192, cao 333–348 điểm ảnh), **có đường kẻ lưới** xanh đậm 1–2 điểm ảnh; người cao 281 điểm ảnh (đứng), 276 (đi), 270 (chạy), cỡ đều trong từng hàng (lệch < 4%); bảng màu ổn định; đường đất: đứng 95% chiều cao ô, đi 94%, chạy 89%. **Hàng chạy: 8/8 khung chạm mép phải ô** (tóc mái nhô sát ranh, có thể bị cắt 1–3 điểm ảnh), khung 8 chạm cả mép trái (đuôi khăn). Tâm thân lệch ngang giữa các hàng (52% / 49% / 47% bề ngang ô). Quần áo, khăn, đai **vẽ liền vào người**. | **GIỮ** làm (1) chuẩn nhận diện, (2) **thân "Zed mặc định (gộp)"** để xem thử và làm nền cho trang ghép ngay bây giờ. **KHÔNG dùng làm thân gốc production** vì không tách được lớp: giáp hẹp hơn quần rộng/khăn bay không che được phần vẽ liền, và không thể "cởi" áo mặc định khi mặc giáp. |
| Thân trơn Zed (chưa có) | — | **GEN MỚI** (prompt `01`): sửa từ chính canonical (giữ đầu, mặt, tóc, dây buộc đỏ, dáng 8×3), thay quần áo bằng **đồ lót bó màu than**, bỏ khăn, đai, giày → thân gốc production. Lý do ghi ở trên; canonical giữ nguyên để đối chiếu. |
| `docs/anh-goc/zed/goc/*` (bản thử cũ) | Zed bản cũ (có sừng / dáng khác) | **Không dùng** (chốt của chủ dự án). Không xoá. |
| `zed-tham-chieu*.png`, `prompt-v2/*`, `prompt-*.txt` | Prompt cũ (có lưới, có cung) | **Thay bằng** `docs/anh-goc/zed/prompt-v3/`. Không xoá bản cũ. |
| `prompt-ninja/`, `prompt-v2-toc-trang/` (phiên điều phối viết cùng ngày) | Prompt theo từng đòn (thân tay không + vũ khí riêng), mũ vẽ theo từng ô | **Dùng được song song**: ảnh nào ra đúng quy cách mục 3 (nền xanh, ô đều, không lưới) đều qua được validator và trang ghép. `prompt-v3` khác ở chỗ: tách thân trơn / đồ mặc định, ảnh 'có vũ khí' để ĐO góc, số khung theo mục 5. |
| Ảnh Cu Tí `em-be-smith*.sprite.json` (Zed đang dùng trong game) | 48×48, net 2, goc [24,45], cao 29; vũ khí ghép bằng code | **Giữ nguyên trong game** cho tới khi bộ ghép lớp có đủ ảnh thật (cờ `G.GHEP_LOP` tắt mặc định). |
| Trang phục `tp-*` (52 tệp), vũ khí `vk-*` (160 tệp) | Ảnh tĩnh gắn theo điểm neo của hệ cũ | **Giữ** cho hệ cũ. Vũ khí `vk-*` **dùng lại được** trong hệ ghép lớp (kiểu `game`, mục 7.4): chỉ cần góc + điểm tay đo trên thân mới. Áo `tp-robes-*` không dùng lại được (không có khung theo tư thế). |

---

## 2. Kiến trúc: các lớp và thứ tự vẽ

Một Zed hoàn chỉnh = **thân** + các **lớp** theo bảng dưới. Mỗi lớp là một asset riêng (một ảnh + một tệp số liệu). Renderer **không biết tên món**: chỉ đọc `slot`, `lop` (số thứ tự vẽ), `kieu` và neo → thêm món mới không phải sửa code.

| Thứ tự `lop` | Slot | Gồm | Kiểu | Ghi chú |
|---|---|---|---|---|
| 0 | `bong` | bóng dưới chân | code | renderer tự vẽ |
| 10 | `canh` (phần sau) | cánh | `gan` (neo `lung`) | vỗ cánh: 1 hàng khung lặp riêng, nhịp theo động tác |
| 20 | `lung` phần `sau` | gùi, ba lô, đuôi khăn bay, bao kiếm | `gan` (neo `lung`) hoặc `khung` | phần nằm SAU thân |
| 30 | `vu_khi` khi `sau` | vũ khí lúc đeo sau lưng / tay xa | `gan` | từng khung ghi `sau`/`truoc` |
| 35 | `mu_sau` | phần mũ nằm SAU đầu: mặt dưới nón lá, dây nón, nút dây, đuôi dây | `khung` | thêm 12/10 (ghep-sua): dây không bao giờ cắt ngang mặt; chỉ lộ ngoài viền người |
| 40 | `than` | thân trơn (đầu, mặt, tóc, tay, chân, đồ lót) | `khung` | luôn vẽ **đủ**, không bao giờ bị cắt lỗ |
| 50 | `chan` | giày, giáp chân | `khung` | |
| 55 | `quan` | quần | `khung` | phủ lên giày 1–2 điểm ảnh ở cổ chân nếu là quần rộng |
| 60 | `ao` / `giap_than` | áo, áo giáp thân | `khung` | phủ xuống quá cạp quần 1–2 điểm ảnh |
| 65 | `dai` | đai, túi hông | `khung` | che đường nối áo–quần |
| 70 | `vai` | giáp vai | `khung` | |
| 75 | `tay` | găng, giáp tay, tay áo trước | `khung` | |
| 80 | `lung` phần `truoc` | quai gùi, dây đeo trước ngực | `khung` | |
| 85 | `mu` | mũ, khăn đội đầu, mặt nạ | `gan` (neo `dau`) | có thể ẩn bớt tóc (mục 7.1) |
| 90 | `vu_khi` khi `truoc` | vũ khí trước thân | `gan` | |
| 95 | `tay_nam` | nắm tay vẽ lại đè lên chuôi | cắt từ thân | tuỳ chọn, như `G.KIEM_SAU` cũ |
| — | `dan` | phi tiêu đang bay | ảnh riêng | do code đạn vẽ, không nằm trên người |

**Món gộp nhiều ô.** Một asset có thể chiếm nhiều slot (`chiem: ["ao","dai"]`). Mặc một món vào BẤT KỲ slot nào trong `chiem` thì cả món gộp được tháo. Ví dụ bộ mặc định: `ao-mac-dinh` chiếm `ao`+`dai`+khăn cổ; `quan-mac-dinh` chiếm `quan`+`chan`.

**Lật hướng.** Mọi ảnh vẽ quay **sang phải**. Quay trái = lật ngang cả khối quanh neo chân; thứ tự lớp **giữ nguyên** (tay xa vẫn sau thân).

**Quy ước tay.** "Tay phải / tay cầm" = **tay gần người xem** (vẽ trước thân) như ảnh em bé hiện nay; "tay trái / tay phụ" = tay xa. Phi tiêu: tay phải (gần) ném, tay trái (xa) đưa ra trước giữ thăng bằng.

---

## 3. Quy cách ảnh

### 3.1 Ảnh nguồn (AI sinh)
- Nền **#00FF00 thuần** toàn ảnh. **Không** kẻ lưới, không chữ, không số khung, không bóng đổ, không quầng sáng, không hiệu ứng.
- Chia ô đều theo số cột × hàng ghi trong prompt; mỗi ô một khung; **chừa lề ≥ 8% mỗi phía** (tóc, khăn, vũ khí không chạm ranh ô).
- Cỡ người, vị trí chân, hướng nhìn giữ như ảnh tham chiếu gửi kèm (canonical hoặc thân trơn).
- Lớp đồ kiểu `khung`: **sửa từ ảnh thân** (gửi kèm) để giữ đúng bố cục ô và tư thế; chỉ giữ lại món đồ, mọi thứ khác (cả người Zed) tô #00FF00. Chỗ tay/tóc che món đồ thì để trống.
- Asset kiểu `gan` (mũ, gùi, cánh, vũ khí, đạn): 1 ảnh, món đồ ở giữa, nhìn ngang quay phải, cùng độ to điểm ảnh với canonical.

### 3.2 Ảnh production (sau kiểm)
- `kiem-sheet.py` tách nền (loang từ mép ô + xoá xanh thuần + khử viền xanh), chuẩn hoá về **khung game 48×48 điểm ảnh logic, net 2 (ảnh 96×96 mỗi ô), chân tại goc [24,45]** — đúng như `em-be-*.sprite.json` hiện nay.
- **Tỉ lệ thu nhỏ** lấy từ thân: chiều cao người đứng (trung vị hàng `dung`) → **31 điểm ảnh logic** (Cu Tí cũ 29; Zed đầu to hơn). Canonical: 281 điểm ảnh → tỉ lệ **0,2206** (đo). Mọi lớp `khung` dùng **cùng tỉ lệ và cùng đường đất/neo ngang** của thân (`--theo do-dac.json`).
- **Neo ngang mỗi hàng** = tâm thân đo được (trung vị trọng tâm dải hông–bụng), **đường đất mỗi hàng** = phân vị 90 đáy chân. Không lấy giữa ô (canonical lệch 47–52% bề ngang ô giữa các hàng → nhân vật sẽ "giật" khi đổi động tác nếu lấy giữa ô).
- Lớp `gan`: ảnh giữ cỡ nguồn, kèm `ti_le` (logic px / px ảnh) và `diem_gan` đo trên trang ghép.

---

## 4. Thân gốc: động tác cơ bản

| Động tác | Hàng | Số khung | Thời lượng | Lặp | Game dùng khi |
|---|---|---|---|---|---|
| `dung` | 1 | 8 | 1,2 s | có | đứng yên (`P.t`) |
| `di` | 2 | 8 | 0,9 s | có | đi chậm: đang giữ nút lấy đà (người chơi bị chậm), ở làng |
| `chay` | 3 | 8 | 0,6 s một vòng (nhịp theo `P.chayT`) | có | `P.moving` |

Ảnh nguồn 8 cột × 3 hàng (như canonical). Khung 8 nối liền khung 1.

---

## 5. Động tác chiến đấu: số khung khớp gameplay

Nguồn số: `game/js/moves.js` (`G.MOVES`), `combat.js:801` (điểm chạm `u ≥ hitAt`, mặc định 0,45; búa 0,35), số đo Playwright ở `he-thong-animation/PHU-LUC-4` (kiếm chạm u=0,50 / 0,471; giáo 0,48; búa 0,354; tên/phi tiêu buông 0,45). `u` = tiến độ đòn 0→1 (`1 − atkT/atkDur`). **`moc`** = mốc u bắt đầu mỗi khung; **khung chạm** (★) phải bắt đầu **trước hoặc đúng** lúc game trừ máu và kéo qua mốc đó.

### 5.1 Kiếm (ảnh 6 cột × 3 hàng)
| Động tác | Hàng | Khung | Thời lượng (game) | `moc` | ★ chạm |
|---|---|---|---|---|---|
| `kiem_1` Chém ngang | 1 | 5 (ô 6 trống) | 0,30 s | 0 · 0,2 · **0,4** · 0,62 · 0,82 | khung 3 (u 0,40–0,62; game chạm 0,50) |
| `kiem_2` Chém ngược | 2 | 5 | 0,30 s | như trên | khung 3 |
| `kiem_3` Nhát kết | 3 | 6 | 0,46 s | 0 · 0,14 · 0,28 · **0,42** · 0,6 · 0,8 | khung 4 (game chạm 0,471) |
| Nhát lướt (sau Né, 0,12 s) | — | dùng `kiem_1` khung 3–5 | | | |
| Giữ nút (kiếm không lấy đà) | — | `kiem_3` khung 2 | | | |

### 5.2 Thương (ảnh 6 cột × 5 hàng)
| Động tác | Hàng | Khung | Thời lượng | `moc` | ★ |
|---|---|---|---|---|---|
| `thuong_1` Đâm | 1 | 4 | 0,38 s | 0 · 0,22 · **0,42** · 0,7 | khung 3 (game 0,482) |
| `thuong_2` Đâm | 2 | 4 | 0,34 s | như trên | khung 3 (0,49) |
| `thuong_3` Đâm | 3 | 4 | 0,34 s | như trên | khung 3 |
| `thuong_4` Quét vòng | 4 | 6 | 0,52 s | 0 · 0,15 · 0,3 · **0,42** · 0,62 · 0,82 | khung 4 (0,481) |
| `thuong_giu` lấy đà Xốc tới | 5 | 2 (ô 1–2) | theo đà | khung 1 khi đà < 0,4, khung 2 khi ≥ 0,4 | — |
| `thuong_xoc` Xốc tới | 5 | 2 (ô 3–4) | 0,16 s | 0 · 0,5 | khung 1 |

### 5.3 Búa (ảnh 8 cột × 2 hàng)
| Động tác | Hàng | Khung | Thời lượng | `moc` | ★ |
|---|---|---|---|---|---|
| `bua` Nện | 1 | 8 | 0,80 s | 0 · 0,08 · 0,16 · 0,25 · **0,33** · 0,48 · 0,64 · 0,82 | khung 5 (game chạm 0,354 — sửa luôn lỗi cũ "trừ máu khi búa còn trên đầu") |
| `bua_giu` lấy đà | 2 | 2 (ô 1–2) | theo đà | khung 1 đà < 0,4; khung 2 ≥ 0,4 | — |
| Nện đất (thả đà) | — | dùng `bua` từ u 0,36 (đòn vào ở phase 0,36) | | | khung 5 |

### 5.4 Phi tiêu — thay chỗ cung (ảnh 6 cột × 2 hàng)
| Động tác | Hàng | Khung | Thời lượng | `moc` | ★ |
|---|---|---|---|---|---|
| `phitieu` Ném | 1 | 6 | 0,38 s đứng / 0,45 s chạy | 0 · 0,15 · 0,3 · **0,45** · 0,62 · 0,8 | khung 4 = **buông tay**, đạn sinh ở u 0,45 |
| `phitieu_giu` ngắm (giữ nút) | 2 | 3 (ô 1–3) | theo đà | khung = min(2, ⌊đà×3⌋) như cung cũ | — |
| `phitieu_tung` Mưa Phi Tiêu (Đặc biệt) | 2 | 3 (ô 4–6) | 0,35 s | 0 · 0,3 · 0,6 | khung 2 |

**Đạn phi tiêu** (`dan-phi-tieu`): 1 hàng 4 khung xoay, cỡ ~9×9 điểm ảnh logic, lặp 0,16 s/vòng; code đạn vẽ, không xoay theo hướng bay (phi tiêu xoay tròn).

**Đề xuất ánh xạ cung → phi tiêu (tạm, chưa sửa `moves.js`):**
| Cung hiện nay (`moves.js`, `combat.js`) | Phi tiêu | Đổi gì |
|---|---|---|
| `type: 'bow'`, `G.MOVES.bow.shot` (Bắn: still 0,38, move 0,45, tầm 180, tốc 290, xuyên 1) | **Ném phi tiêu** | Giữ nguyên số; chỉ đổi tên hiển thị + hình đạn (`fx_dan.js` / `A.proj` vẽ `dan-phi-tieu` thay mũi tên) |
| `bow.charge` (Tên mạnh: giữ 0,75 s, mult 1,2→3,0, xuyên 1/1/2) | **Phi tiêu mạnh** (ngắm lâu, ném xoáy) | Giữ số; hình `phitieu_giu` |
| `bow.rain` (Mưa Tên, đặc biệt) | **Mưa Phi Tiêu** (tung lên trời, rơi xuống vùng) | Giữ số; hình `phitieu_tung` |
| `G.MOVE_TIPS.bow`, tên `G.WTYPES.bow` | "Phi tiêu: bấm để ném, giữ rồi thả ném mạnh. Đặc biệt: Mưa Phi Tiêu" | Chỉ đổi chữ |
| `bow.nock/nockX/z0/zFly` (chỗ tên rời dây) | điểm rời tay = neo `tay_phai` khung 4 | Lấy từ số đo trên ảnh thật |
| Ảnh vũ khí `vk-bow-*` | phi tiêu cầm tay (ảnh `phi-tieu`) | Dòng vũ khí giữ khoá `bow` trong bản lưu để không hỏng save |
Khoá nội bộ vẫn là `bow` (bản lưu, nâng cấp, hệ không đổi). Việc đổi chữ và hình đạn làm ở phiên sau, sau khi có ảnh thật.

### 5.5 Động tác chung (ảnh 8 cột × 4 hàng, thân trơn)
| Động tác | Hàng | Khung | Thời lượng game | Ghi chú |
|---|---|---|---|---|
| `lon` (Né) | 1 | 6 | 0,27 s | `dodgeT` |
| `trung` (trúng đòn) | 2 | 3 | 0,20 s | `hurtT` |
| `chet` | 3 | 8 | 0,6 s, giữ khung cuối | `deadT` |
| `chuong` (Chưởng, và Đặc biệt kiếm/thương/búa) | 4 | 6 | chưởng 0,3 s (`castT`); đặc biệt 0,35 s (`specT`) | `moc` 0 · 0,12 · 0,25 · **0,4** · 0,6 · 0,8; module mới chia đúng 0,3 (sửa lỗi cũ chia 0,4 làm mất 2 khung đầu) |

### 5.6 Vì sao không ép 8×3
Đòn kiếm 0,3 s ở 60 nhịp/giây chỉ có 18 nhịp → 5 khung ≈ 3,6 nhịp/khung (mỗi khung ~60 ms) là mịn mà không thừa. Búa 0,8 s cần 8 khung để thấy nặng. Thương đâm ngắn 4 khung. Mỗi bảng ảnh vì vậy có số cột riêng; ô thừa để trống (máy kiểm chỉ cảnh báo, không báo lỗi).

---

## 6. Số liệu (metadata) mỗi asset

Một tệp `<id>.lop.json` (định dạng `linh-khi-lop`) **cho mỗi ảnh**. Một món có nhiều ảnh (cơ bản đứng/đi/chạy, bộ kiếm, bộ thương…) → nhiều tệp cùng `slot` + `mon` (thân: cùng `nhan_vat`), ví dụ `zed-than-tron` và `zed-than-tron-kiem`; renderer gộp theo tên động tác. Tệp đặt ở `game/art/lop/` **chỉ khi đã VALIDATED**; trước đó nằm ở `docs/anh-goc/zed/lop/`. `build.py` nhúng `game/art/lop/*.lop.json` vào game (thư mục đang trống → bản build y hệt).

```jsonc
{
  "loai": "linh-khi-lop", "phien_ban": 1,
  "id": "zed-than-tron",                 // mã duy nhất
  "ten": "Zed thân trơn",
  "slot": "than",                        // than|ao|giap_than|quan|chan|dai|vai|tay|mu|lung|canh|vu_khi|dan
  "chiem": ["than"],                     // các slot món này chiếm (món gộp: nhiều slot)
  "phan": null,                          // lung/canh: "sau" | "truoc"
  "kieu": "khung",                       // khung = ảnh theo từng khung thân; gan = 1 ảnh gắn vào neo; game = vũ khí của game (vk-*)
  "lop": 40,                             // thứ tự vẽ (mục 2)
  "nhan_vat": "zed",
  "bo": "zed-than-tron",                 // CHỈ thân: tên bộ thân; các tệp thân cùng "bo" (đứng/đi/chạy, kiếm, thương…) ghép thành một thân
  "mon": [],                             // mã món trong game (outfit.js) mà lớp này vẽ cho, vd ["giap_tre"]; vũ khí: ["sword"]
  "trang_thai": "GENERATED",             // GENERATED | VALIDATED | INTEGRATED
  "nguon": { "anh": "docs/anh-goc/zed/...png", "prompt": "docs/anh-goc/zed/prompt-v3/01-than-tron.txt", "kiem": ".../ket-qua.txt" },
  "tam": "data:image/png;base64,...",    // ảnh production (khung: 96×96 mỗi ô; gan: ảnh nguồn đã tách nền)
  "khung_rong": 48, "khung_cao": 48, "net": 2, "goc": [24, 45], "huong": "phai",
  "ti_le": 0.2206,                       // khung: tỉ lệ đã áp khi xuất; gan: logic px / px ảnh (đo trên trang ghép)
  "dong_tac": {                          // tên động tác → vị trí trong ảnh
    "dung":   { "hang": 0, "so": 8, "giay": 1.2,  "lap": true },
    "kiem_1": { "hang": 0, "so": 5, "giay": 0.30, "moc": [0, 0.2, 0.4, 0.62, 0.82], "cham": 2 }
  },
  "neo": {                               // CHỈ thân: điểm neo từng khung (logic px trong khung 48×48), null = CHƯA ĐO
    "dung": [ { "dau": [x, y, goc], "lung": [x, y, goc], "tay_phai": [x, y], "tay_trai": [x, y],
                "vk": { "x": 0, "y": 0, "goc": -90, "lop": "sau" } }, null, ... ]
  },
  "lech": { "dung": [[0, 0], ...] },     // lớp khung: dời tay từng khung (logic px) đo trên trang ghép
  "diem_gan": [px, py],                  // lớp gan: điểm trên ảnh đặt trùng neo (mũ: giữa vành trán; gùi/cánh: chỗ chạm lưng; vũ khí: tâm chuôi chỗ nắm)
  "goc_anh": 0,                          // vũ khí gan: hướng lưỡi trong ảnh (độ; 0 = mũi chỉ sang phải)
  "an_toc": null,                        // mũ: { "vung": [x, y, w, h] } tính từ neo đầu (logic px): điểm ảnh thân trong vùng bị ẩn trước khi vẽ mũ
  "lap": null,                           // cánh: { "so": 8, "giay": 0.8 } vòng vỗ cánh riêng
  // Thêm 12/10 (ghep-sua, không bắt buộc, đọc được bởi trang ghép + ghep_lop.js): trong mỗi phần tử neo[dong_tac][i] có thể có
  //   "mat": [x0,y0,x1,y1] vùng mặt bảo vệ, "sung": [[x,y],[x,y]] đỉnh hai sừng, "co", "nguc", "eo": [x,y], "vai": [[x,y],[x,y]],
  //   "tin_cay": { "mat": 0.9, ... } (0–1), "can_chinh_tay": ["dau", ...] (neo máy đo chưa người xác nhận),
  //   "nguon_neo": { "dau": "tu-dong" | "chinh-tay" }.  Neo có tên trong can_chinh_tay → game KHÔNG dùng cho món gắn (như neo null);
  //   đặt lại trên trang ghép = xác nhận (trang tự bỏ tên khỏi can_chinh_tay, ghi nguon_neo "chinh-tay").
  "tuong_thich": { "than": ["zed-than-tron"], "dong_tac": ["dung", "di", "chay"] }
}
```

Quy ước góc: **độ, 0 = chĩa ra trước (sang phải), âm = chĩa lên** — trùng `G.weaponArt.draw` để dùng lại vũ khí `vk-*`.

**Trạng thái:**
- **GENERATED** — có ảnh AI (đã lưu `docs/anh-goc/zed/...`). Chưa ai bảo đảm gì.
- **VALIDATED** — `kiem-sheet.py` ĐẠT **và** người xem GIF + trang ghép theo checklist 9.3 **và** mọi neo cần dùng đã đo (không còn `null` ở động tác khai báo). Ghi tên người duyệt + ngày vào `nguon.duyet`.
- **INTEGRATED** — tệp nằm trong `game/art/lop/`, chạy trong game với `?ghep=1` và chủ dự án đã xem trên máy thật. Chỉ chủ dự án đổi sang trạng thái này.

Game (`?ghep=1`) **chỉ dùng** asset `VALIDATED` hoặc `INTEGRATED`; `GENERATED` bị bỏ qua.

---

## 7. Điểm neo và quy tắc lớp

Neo đo trên **ảnh thật** ở trang ghép (`tach-ghep-lop.html`, chạm/kéo), hoặc máy đo (chân, tâm thân, đường đất). **Không có neo giả định trong production**: neo `null` → renderer không vẽ lớp `gan` cần neo đó ở khung ấy (và báo trên trang ghép).

| Neo | Đo ở đâu | Dùng cho |
|---|---|---|
| `goc` (chân) | máy đo: neo ngang hàng + đường đất hàng → [24,45] | mọi lớp |
| `dau` [x, y, góc nghiêng] | giữa vành trán (chỗ mũ ngồi), góc = độ nghiêng đầu | mũ |
| `lung` [x, y, góc] | giữa hai bả vai, sát lưng | gùi, cánh, đuôi khăn, bao kiếm |
| `tay_phai`, `tay_trai` | tâm nắm tay | vũ khí, phi tiêu rời tay |
| `vk` {x, y, goc, lop} | điểm nắm + góc lưỡi đo trên ảnh **có vũ khí** (prompt "…-co-vu-khi") | mọi vũ khí cùng loại |

### 7.1 Mũ và tóc
- Mũ là lớp `gan` trên neo `dau`, xoay theo góc nghiêng đầu. (Được phép làm mũ kiểu `khung` — một ô cho mỗi khung thân — nếu mũ mềm/biến dạng; renderer nhận cả hai.)
- **Zed v2 có hai sừng:** mũ phải khoét lỗ cho sừng; `an_toc.vung` **không bao giờ** gồm sừng (sừng là nhận diện). Mũ trùm kín cũng chừa hai lỗ sừng.
- `an_toc.vung` = hình chữ nhật (tính từ neo đầu) mà **điểm ảnh thân bị ẩn** trước khi vẽ mũ. Quy tắc: **ẩn phần tóc nhô trên đỉnh và hai bên vành** (sẽ đâm xuyên mũ); **giữ đuôi tóc buộc và dây đỏ** phía sau-dưới vành (nhận diện Zed); **không bao giờ ẩn mặt, mắt, cằm** (vùng ẩn không được xuống dưới đường lông mày).
- **Nón lá Zed v2 (thêm 12/10, `ghep-sua/`)**: ảnh nguồn 8×3 theo khung → kiểu `khung`, **tách hai tệp**: `mu` (lop 85) = chóp + vành (mọi điểm ảnh từ mép dưới vành trở lên, từng cột) **đục lỗ đúng hình sừng của thân ở khung đó** (sừng thật hiện qua, không vẽ lại); `mu_sau` (lop 35) = mặt dưới nón + dây + nút + đuôi dây, vẽ sau thân. Vị trí: nón thấp nhất mà phần `mu` không chạm `mat` (vùng mặt bảo vệ). Công cụ: `docs/anh-goc/zed/ghep-thu.py`.
- Nón lá / mũ rộng: `an_toc` chỉ phủ đỉnh đầu. Mũ trùm kín (mũ sắt): phủ cả đuôi tóc, ghi rõ trong `ten`. Mũ không che tóc (băng đô, khăn buộc trán): `an_toc: null`.

### 7.1b Neo máy đo trên ảnh nguồn (`linh-khi-neo`, thêm 12/10)
`docs/anh-goc/zed/ghep-thu.py` đo neo **từng khung** trên tấm nguồn và ghi `docs/anh-goc/zed/neo/zed-v2.neo.json`:
```jsonc
{ "loai": "linh-khi-neo", "phien_ban": 1, "he_toa_do": "nguon-khung: điểm ảnh tấm nguồn, gốc = góc trên-trái khung_bao của hình",
  "than": { "anh": "...00-than-dung-di-chay.png", "dong_tac": { "dung": [ {
      "khung": 1, "khung_bao": [x0,y0,x1,y1],
      "neo": { "dinh_dau": [x,y], "tam_mat": [x,y], "mat": [x0,y0,x1,y1], "mat_mat": [x0,y0,x1,y1],
               "sung_trai": {"dinh":[x,y],"chan":[x,y],"khung_bao":[..]}, "sung_phai": {...},
               "co": [x,y], "eo": [x,y], "nguc": [x,y], "vai_sau": [x,y], "vai_truoc": [x,y], "lung": [x,y], "tay_cam": null, "chan": [x,y] },
      "tin_cay": { "mat": 0.9, "sung": 0.85, ... }, "can_chinh_tay": ["tay_cam"], "nguon_neo": { "co": "tu-dong" } } ] } },
  "lop": { "non_la": { "ti_le": 1.0, "dong_tac": { "dung": [ { "khung": 1, "neo": { "vanh_trai", "vanh_phai", "dinh_non", "lo_sung_ve_san" },
                                                          "dat": [x,y] /* góc trên-trái lớp trong hệ khung thân */, "nguon_dat": "tu-dong" } ] } },
           "giap": {...}, "ao_choang": {...} } }
```
- **Tệp chỉnh tay** `zed-v2.neo.chinh-tay.json` (`"loai": "linh-khi-neo-chinh-tay"`) **thắng** tệp tự động: `than.<dong_tac>.<khung>.<ten_neo>`, `lop.<lop>.<dong_tac>.<khung>.{lech:[dx,dy] | dat:[x,y]}`, `ti_le.<lop>`.
- Đổi sang toạ độ game (logic 48×48, goc [24,45]) theo đúng phép của `kiem-sheet.py`: `zed-v2.neo-game.json` → `tools/tach-ghep-lop/dong-goi.py` nhúng vào thân của trang ghép (các trường thêm ở mục 6).
- Đổi cỡ lớp: tỉ lệ trong ±3% quanh 1 → giữ 1 (không đổi cỡ); khác → NEAREST + alpha nhị phân (ngưỡng 128). Không LANCZOS.

### 7.2 Khe hở giữa lớp
1. **Thân không bao giờ bị khoét.** Lớp đồ chỉ vẽ **đè lên**; dưới mọi khe là đồ lót màu than của thân trơn → khe đọc như bóng, không thành lỗ trong suốt.
2. **Chồng mép 1–2 điểm ảnh logic**: áo phủ quá cạp quần, quần rộng phủ cổ giày, găng phủ cổ tay áo; thứ tự 50→75 bảo đảm mép trên che mép dưới.
3. Chỗ **tay gần người xem đi ngang trước ngực**: lớp áo/giáp để trống phần bị tay che (prompt dặn); tay áo của món đó (nếu có) nằm ở lớp `tay` (75) để đè lên tay đúng chỗ.
4. Nếu vẫn hở/lệch: chỉnh `lech` từng khung trên trang ghép; không được thì tạo **asset bổ trợ** (ví dụ `ao-x-tay-truoc`, chỉ phần tay áo trước) thay vì sửa thân.

### 7.3 Đồ lưng và cánh
- Gùi, ba lô: lớp `gan` phần `sau` (lop 20) trên neo `lung` + lớp `khung` phần `truoc` (lop 80) cho quai trước ngực. Hai tệp cùng `mon`.
- Cánh: `gan`, phần `sau` (lop 10), có `lap` riêng (vỗ cánh). Nhịp vỗ: đứng 1×, chạy 1,6×, đòn chiến đấu giữ khung đang có (không vỗ loạn khi chém).
- Đồ mềm chuyển động mạnh (đuôi khăn khi chạy): dùng `khung` (vẽ theo từng khung) thay vì `gan`.

### 7.4 Vũ khí
- Ba kiểu, renderer chọn theo tệp có sẵn: `gan` (ảnh vũ khí mới, 1 ảnh, `diem_gan` = tâm chuôi), `game` (ảnh `vk-*` hiện có qua `G.weaponArt.draw` — giữ được 160 dòng vũ khí, bậc, hệ), `khung` (ảnh vũ khí vẽ theo từng khung — chỉ khi đòn cần biến dạng, ví dụ vệt mờ).
- Góc và điểm nắm từng khung nằm ở **thân** (`neo.<dong_tac>[i].vk`), đo trên ảnh "có vũ khí" → mọi vũ khí cùng loại dùng chung, **không đổi cỡ** giữa các khung.
- `vk.lop = "sau"` khi lưỡi nằm sau thân/đầu ở khung đó (vd giơ kiếm sau vai); renderer vẽ ở lop 30 thay vì 90.
- Đứng/đi/chạy: vũ khí cầm tay thả xuống (kiếm, búa) hoặc vác vai (thương); phi tiêu: tay không (phi tiêu giấu trong tay áo) — `vk: null`.

---

## 8. Quy trình 11 bước (asset nào cũng qua)

1. Gửi canonical (và thân trơn khi gen lớp đồ) làm ảnh tham chiếu.
2. Dùng đúng prompt trong `docs/anh-goc/zed/prompt-v3/` (mỗi prompt = 1 ảnh, thứ tự ở `DANH-SACH.md`).
3. Gen → lưu ảnh vào `docs/anh-goc/zed/v3/<NN>-<ten>.png` → **GENERATED**.
4. `python3 kiem-sheet.py <anh> --cot … --hang … --ten … --giay … --loai … [--chuan zed-canonical.png | --theo <do-dac thân>]`.
5–7. Cắt khung, tách nền, khử viền, đo cỡ (máy làm ở bước 4). LỖI → sửa prompt / gen lại; **không dùng ảnh lỗi**.
8. Mở `https://spiritblade.web.app/tach-ghep-lop.html`: thả `sheet-game.png` + `do-dac.json`, chỉnh neo/lệch, xuất JSON.
9. Ghép thử với thân và các lớp khác trên trang ghép.
10. Xem phát liên tục và từng khung theo checklist 9.3.
11. Đạt → **VALIDATED** → chép `<id>.lop.json` vào `game/art/lop/`, build → thử `?ghep=1` trên máy → chủ dự án duyệt → **INTEGRATED**.

---

## 9. Kiểm tra

### 9.1 Máy kiểm (`docs/anh-goc/zed/kiem-sheet.py`)
| Kiểm | Cách | Mức |
|---|---|---|
| Nền xanh thuần | tỉ lệ điểm ảnh `G>150, G−max(R,B)>80` ≥ 35% | LỖI nếu thấp |
| Lưới | cột/hàng ≥ 85% không phải nền, dày ≤ 4 | CẢNH BÁO (dùng để chia ô, bỏ khi tách) |
| Số hàng × cột | chia theo lưới; không lưới → khe trống gần chỗ chia đều; hình đè qua ranh → LỖI | LỖI / CẢNH BÁO |
| Ô trống | ô không có hình | CẢNH BÁO (combo ít khung cố ý để trống) |
| Chạm mép ô | khung bao cách mép ≤ 2 điểm ảnh | LỖI |
| Chữ / số | ≥ 3 mảnh nhỏ cùng cỡ xếp một dòng | LỖI |
| Mảnh vụn | mảnh nhỏ xa người | CẢNH BÁO (đã bỏ) |
| Xanh kẹt trong hình | xanh thuần không nối ra mép | CẢNH BÁO (đã xoá; xem kẽ tay chân) |
| Viền xanh | điểm sát nền có G trội | tự khử, đếm |
| Cỡ người (thân) | chiều cao lệch trung vị hàng >8% cảnh báo, >15% lỗi; so canonical (cao/ô) >12% cảnh báo | |
| Vị trí chân (thân) | đáy chân cao hơn đường đất hàng >3,5% ô (trừ chạy/lộn/chết) | CẢNH BÁO |
| Bảng màu (thân) | >22% điểm ảnh người không gần bảng màu canonical (24 màu) | LỖI (>11% cảnh báo) |
| Tràn khung game | sau khi về 48×48, điểm ảnh ra ngoài ô | CẢNH BÁO → cần khung rộng hơn cho hàng đó |
| Lệch ngang giữa hàng | tâm thân các hàng lệch >5% bề ngang ô | CẢNH BÁO, tự bù bằng neo hàng |

Ra: `ket-qua.txt`, `do-dac.json`, `tong-quan.jpg`, GIF từng hàng (giữ vị trí ngang, đúng tốc độ game theo `--giay`), `sheet-game.png` (+ `sheet-sach.png` với `--sach`). Mã thoát 0 = ĐẠT, 1 = LỖI.

### 9.2 Kết quả chạy thật (12/10/2026)
- `zed-canonical.png` (ninja): **LỖI** 8 (hàng chạy 8/8 khung chạm mép ô), CẢNH BÁO 10 (lưới, ô không đều, xanh kẹt 47–223 điểm ảnh ở kẽ chân/khăn). Cỡ người đều, màu đúng, không chữ → GENERATED.
- `zed-v2-canonical.png`: **ĐẠT** kiểm tự động, CẢNH BÁO 12 (một vạch lưới lẻ, ô không đều, xanh kẹt 42–287 điểm ảnh) → GENERATED, chờ người xem để VALIDATED (làm tham chiếu; không làm thân production vì đồ vẽ liền).
- `zed-v2-tham-chieu-to.png` (ảnh nhỏ nền ca-rô): **LỖI** đúng như mong đợi (nền không phải #00FF00, hình đè ranh ô) — máy bắt được ảnh không dùng được.

### 9.3 Checklist người xem (máy không thấy được)
- [ ] Mặt, tóc, dây buộc đỏ, tỉ lệ đầu/thân giống canonical ở **mọi** khung.
- [ ] Chân không trượt khi đứng; bước đi/chạy đều, khung cuối nối khung đầu.
- [ ] Tay thật sự nắm chuôi; vũ khí không xuyên thân/đầu, không đổi dài ngắn.
- [ ] Khung ★ chạm trông như lúc trúng (lưỡi ở xa nhất / búa chạm đất / phi tiêu rời tay).
- [ ] Lớp đồ không trôi khỏi người khi chạy/chém; không hở thấy nền.
- [ ] Mũ không trôi, không che mắt; tóc thò đúng quy tắc 7.1.
- [ ] Đồ lưng/cánh đúng lớp trước/sau; quai không bị thân che.
- [ ] Không còn chấm xanh, viền xanh, nét lưới, chữ.
- [ ] Đổi động tác (đứng → chạy → chém → đứng) không giật vị trí.

---

## 10. Runtime trong game

- Module `game/js/ghep_lop.js`, cờ **`G.GHEP_LOP` (TẮT mặc định)**, bật bằng `?ghep=1`. Tắt → không bọc gì, game y hệt.
- Bật → bọc ngoài cùng `G.art.hero`: chỉ vẽ khi **đủ** asset VALIDATED/INTEGRATED cho động tác hiện tại (thân có hàng đó; vũ khí cầm tay có neo `vk` ở khung đó, hoặc tay không). Thiếu bất cứ gì → gọi lại cách vẽ cũ (thân Cu Tí + vũ khí code). Không đổi gì ở `moves.js`, `combat.js`, bản lưu, lưu mây.
- Chọn động tác từ các đồng hồ gameplay giống `SC.chonEmBe` (chết > lộn > đặc biệt > chưởng > giữ lấy đà > đánh > trúng > chạy > đứng); khung theo `moc` của tệp.
- Đồ đang mặc: `G.tinhLinh.outfitOf` → mỗi slot tìm lớp có `mon` chứa mã món. Món chưa có lớp → không vẽ (thân trơn + lớp mặc định của slot đó).
- Dữ liệu: `G.lopGhepData` (build nhúng từ `game/art/lop/*.lop.json`).
- Chưa làm (phiên sau, khi có ảnh thật): đạn phi tiêu trong `fx_dan.js`, đổi chữ cung → phi tiêu, viền bậc áo / hào quang trang phục trên thân ghép.
