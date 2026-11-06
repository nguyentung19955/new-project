# Hướng nhìn tinh anh / trùm — đợt 4 (ráp đủ ảnh raw_p12 + raw_p6)

✅ có ảnh · ⇋ trái = lật dải phải (không bao giờ hiện mặt trước khi đi ngang)

| id | loại | trước (xuống) | ngang (phải) | trái | sau (lên) | tung chiêu (nhìn bàn) |
|---|---|---|---|---|---|---|
| bo | thường | ✅ | ✅ | ⇋ | ✅ | — |
| bay | thường (bay) | ✅ | ✅ | ⇋ | ✅ | — |
| bay_bang | thường (bay) | ✅ | ✅ | ⇋ | ✅ (mới) | — |
| tach | thường | ✅ | ✅ | ⇋ | ✅ | — |
| khong_lo | TINH ANH | ✅ | ✅ (mới) | ⇋ | ✅ (mới) | — |
| que_tach | TINH ANH | ✅ | ✅ | ⇋ | ✅ (mới) | — |
| mad_crown | trùm cũ | ✅ | ✅ (mới, nét pixel — nên vẽ lại) | ⇋ | ✅ (mới) | dải trước, khung 3 dải 4 cũ |
| freezer | trùm cũ | ✅ | ✅ | ⇋ | ✅ | khung 3 dải 4 cũ |
| janus | trùm cũ | ✅ | ✅ | ⇋ | ✅ (mới) | khung 3 dải 4 cũ |
| joker_king | trùm cũ | ✅ | ✅ (mới, nét pixel) | ⇋ | ✅ (mới) | khung 3 dải 4 cũ |
| nightmare | trùm cũ | ✅ | ✅ | ⇋ | ✅ | khung 3 dải 4 cũ |
| octopus | trùm cũ | ✅ | ✅ | ⇋ | ✅ (mới) | khung 3 dải 4 cũ |
| hive | trùm mới | ✅ | ✅ | ⇋ | ✅ | dải thân 16 (trum_hive_atk_16) |
| jammer | trùm mới | ✅ | ✅ | ⇋ | ✅ | dải trước + fx_trum_jammer (cắt lại 288 px, phát đủ 16 khung) |
| prism | trùm mới | ✅ | ✅ (mới) | ⇋ | ✅ (mới) | dải trước + fx_trum_prism (khiên vỡ) |
| twin_core | trùm mới | ✅ (mới) | ✅ (mới) | ⇋ | ✅ (mới) | chiêu TÁCH lúc chết: dải thân lõi nứt 16 (trum_twin_core_atk_16) tại chỗ, rồi 2 lõi con |
| patcher | trùm mới | ✅ (mới) | ✅ (mới) | ⇋ | ✅ (mới) | dải trước + fx_trum_patcher (sương xanh trên mỗi quái được hồi) |
| leech | trùm mới | ✅ (mới) | ✅ (mới) | ⇋ | ✅ (mới) | dải trước + fx_trum_leech (hút sao + lao, tại thân trùm) |

Chân dung băng giới thiệu: đủ 6 trùm mới (leech mới thêm). 12 trùm đều trong bể trùm (TRUM_POOL) + `?trum=<id>`.

Tệp: `to_dai_cat.jpg` (tờ kiểm mọi dải đã cắt, nền tối + sáng: viền hồng / cỡ / đường chân) ·
`tong_solo.jpg`, `tong_coop.jpg`, `tong_pvp.jpg` (dải khung khi đi thật xuống/phải/trái/lên + lúc tung chiêu, 390×844 DPR 3) ·
`ketqua.json` (tools/thap-kt-huong.js: hướng từng đoạn, nhìn bàn lúc chiêu + quay lại làn, fx 16 khung, fps, 404).

Công cụ: `tools/thap-huong-quai.py` (raw_p12), `tools/thap-cat-p6-trum.py` (raw_p6; `--chi-fx <id>` chỉ cắt lại fx rời), `tools/thap-huong4-tobang.py` (tờ kiểm).
