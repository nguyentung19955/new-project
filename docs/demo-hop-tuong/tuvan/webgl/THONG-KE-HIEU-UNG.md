# THỐNG KÊ ẢNH HIỆU ỨNG THEO CHỦ — để NẠP TRƯỚC lúc vào trận (WebGL)

Sinh tự động bằng `tools/thap-thong-ke-hieu-ung.py` lúc 2026-11-12T01:14Z từ `thap/js` + `thap/assets` (2409 ảnh). Bản máy đọc: `THONG-KE-HIEU-UNG.json` (cùng thư mục).

**Cách dùng:** vào trận, với mỗi id trong bộ bài của CẢ HAI bàn nạp `u[id]`; với trùm sắp ra nạp `trum[id]`; chỉ huy nạp `chihuy[id]`; `dung_chung` nạp theo tình huống (xem cột nguồn).
**Giới hạn (quét tĩnh):** chủ xác định theo TÊN ảnh, rồi theo vị trí chuỗi trong mã (khối `SKILLS.<id>` / khoá `<id>:` gần nhất phía trên). Tên dựng lúc chạy chỉ bắt được dạng `'tiền_tố_' + …` và `id + '_hậu_tố'`. Chưa đối chiếu bằng trận thật — nên chạy 1 lượt ghi `REN.img(tên)` trong trận bot để bắt phần sót.

Tổng: 98 ụ có ảnh riêng (1231 ảnh) · 12 trùm (94) · 0 chỉ huy (0) · dùng chung 253 · không thấy tham chiếu 25.

## 1. Theo ụ

| id | số ảnh | ảnh (ngoài đầu/bệ) |
|---|---|---|
| `anhsang` | 10 | `fx_anhsang_dan`, `fx_anhsang_hieu`, `fx_anhsang_no`, `fx_anhsang_tia`, `fx_anhsang_trung` |
| `aten` | 10 | `fx_aten_dan`, `fx_aten_hieu`, `fx_aten_no`, `fx_aten_trung`, `p3_aten` |
| `bang` | 21 | `bang_cutin_nen`, `bang_trum_nen`, `bang_wave_nen`, `dan_bang`, `dosig_hex`, `dosig_sen`, `dosig_tran`, `fx_bang_dan`, `fx_bang_hieu`, `fx_bang_no`, `fx_bang_trung`, `fx_bang_vo`, `fx_la`, `fx_song_xung`, `fx_vet_trang`, `p3_bang` |
| `bao` | 10 | `fx_bao_dan`, `fx_bao_hieu`, `fx_bao_no`, `fx_bao_tia`, `fx_bao_trung` |
| `baotuyet` | 10 | `fx_baotuyet_dan`, `fx_baotuyet_hieu`, `fx_baotuyet_no`, `fx_baotuyet_trung`, `p3_baotuyet` |
| `bienmau` | 14 | `bienmau_hop_1`, `bienmau_hop_2`, `bienmau_hop_3`, `bienmau_hop_4`, `bienmau_m_do`, `bienmau_m_lam`, `bienmau_m_luc`, `bienmau_m_vang`, `fx_bienmau_hop`, `fx_bienmau_sk` |
| `blackhole` | 10 | `fx_blackhole_dan`, `fx_blackhole_hieu`, `fx_blackhole_no`, `fx_blackhole_trung`, `p2_blackhole` |
| `bocap` | 7 | — |
| `bomhen` | 10 | `fx_bomhen_dan`, `fx_bomhen_hieu`, `fx_bomhen_no`, `fx_bomhen_trung`, `p3_bomhen` |
| `bua` | 9 | `fx_bua_dan`, `fx_bua_hieu`, `fx_bua_no`, `fx_bua_trung` |
| `canon` | 26 | `fx_canon_dan`, `fx_canon_hieu`, `fx_canon_no`, `fx_canon_ten`, `fx_canon_trung`, `p3_canon` |
| `cauvong` | 9 | `fx_cauvong_dan`, `fx_cauvong_hieu`, `fx_cauvong_no`, `fx_cauvong_trung` |
| `chimang` | 10 | `fx_chimang_dan`, `fx_chimang_hieu`, `fx_chimang_no`, `fx_chimang_trung`, `sup_chimang` |
| `chuato` | 16 | `fx_chuato_dacbiet`, `fx_chuato_dan`, `fx_chuato_dan2`, `fx_chuato_dan3`, `fx_chuato_hieu`, `fx_chuato_no`, `fx_chuato_trung`, `fx_chuato_trung3` |
| `cobac` | 8 | `cb_xu` |
| `combo` | 13 | `fx_combo_dan`, `fx_combo_hieu`, `fx_combo_no`, `fx_combo_trung`, `fx_vong_trieu` |
| `congap` | 5 | `trung_1` |
| `cuongno` | 19 | `fx_cuongno_dacbiet`, `fx_cuongno_dan`, `fx_cuongno_dan2`, `fx_cuongno_dan3`, `fx_cuongno_hieu`, `fx_cuongno_no`, `fx_cuongno_trung`, `fx_cuongno_trung3` |
| `cuuvi` | 21 | `fx_cuuvi_dacbiet`, `fx_cuuvi_dan`, `fx_cuuvi_dan2`, `fx_cuuvi_dan3`, `fx_cuuvi_hieu`, `fx_cuuvi_hoho`, `fx_cuuvi_no`, `fx_cuuvi_trung`, `fx_cuuvi_trung3`, `p3_cuuvi` |
| `dichchuyen` | 9 | `fx_dichchuyen_dan`, `fx_dichchuyen_hieu`, `fx_dichchuyen_no`, `fx_dichchuyen_trung` |
| `doc` | 10 | `dan_doc`, `fx_doc_dan`, `fx_doc_hieu`, `fx_doc_no`, `fx_doc_trung` |
| `docton` | 10 | `fx_docton_dan`, `fx_docton_hieu`, `fx_docton_no`, `fx_docton_tia`, `fx_docton_trung` |
| `dongbo` | 20 | `fx_dongbo_dacbiet`, `fx_dongbo_dan`, `fx_dongbo_dan2`, `fx_dongbo_dan3`, `fx_dongbo_hieu`, `fx_dongbo_no`, `fx_dongbo_tia`, `fx_dongbo_trung`, `fx_dongbo_trung3` |
| `drone` | 10 | `fx_drone_bom`, `fx_drone_dan`, `fx_drone_hieu`, `fx_drone_no`, `fx_drone_trung` |
| `epxung` | 9 | `fx_epxung_dan`, `fx_epxung_hieu`, `fx_epxung_no`, `fx_epxung_trung` |
| `guongcong` | 14 | `fx_guongcong_dan`, `fx_guongcong_hieu`, `fx_guongcong_no`, `fx_guongcong_trung`, `hu_manhguong`, `vfxp0_tudong` |
| `haoquang` | 10 | `fx_haoquang_dan`, `fx_haoquang_hieu`, `fx_haoquang_no`, `fx_haoquang_tia`, `fx_haoquang_trung` |
| `hasao` | 9 | `fx_hasao_dan`, `fx_hasao_hieu`, `fx_hasao_no`, `fx_hasao_trung` |
| `hopbi` | 27 | `fx_bui`, `fx_cham_trang`, `fx_hopbi_dacbiet`, `fx_hopbi_dan`, `fx_hopbi_dan2`, `fx_hopbi_dan3`, `fx_hopbi_hieu`, `fx_hopbi_no`, `fx_hopbi_trung`, `fx_hopbi_trung3`, `fx_than`, `fx_vet_trang`, `fx_vong_mong`, `fx_vong_trieu`, `p3_hopbi`, `tai_day` |
| `hopca` | 5 | `fx_hopca_sk` |
| `hutmana` | 9 | `fx_hutmana_dan`, `fx_hutmana_hieu`, `fx_hutmana_no`, `fx_hutmana_trung` |
| `hydra` | 26 | `fx_hydra_dacbiet`, `fx_hydra_dan`, `fx_hydra_dan2`, `fx_hydra_dan3`, `fx_hydra_hieu`, `fx_hydra_no`, `fx_hydra_tia`, `fx_hydra_trung`, `fx_hydra_trung3`, `hydra_dau`, `hydra_dau_ha`, `hydra_than`, `hydra_than_tt`, `p3_hydra` |
| `kepha` | 9 | `fx_kepha_dan`, `fx_kepha_hieu`, `fx_kepha_no`, `fx_kepha_trung` |
| `khien` | 13 | `fx_khien_dan`, `fx_khien_hieu`, `fx_khien_no`, `fx_khien_trung`, `fxb_cham`, `fxb_chet`, `fxb_khien`, `sup_khien` |
| `khoathoigian` | 10 | `fx_khoathoigian_dan`, `fx_khoathoigian_hieu`, `fx_khoathoigian_no`, `fx_khoathoigian_trung`, `hu_khoa` |
| `khoisinh` | 14 | `fx_khoisinh_dan`, `fx_khoisinh_hieu`, `fx_khoisinh_no`, `fx_khoisinh_tia`, `fx_khoisinh_trung`, `fx_vong_trieu` |
| `khuech` | 10 | `fx_khuech_dan`, `fx_khuech_hieu`, `fx_khuech_no`, `fx_khuech_trung`, `sup_khuech` |
| `kiembang` | 9 | `fx_kiembang_dan`, `fx_kiembang_hieu`, `fx_kiembang_no`, `fx_kiembang_trung` |
| `lanhgia` | 10 | `fx_lanhgia_dan`, `fx_lanhgia_hieu`, `fx_lanhgia_no`, `fx_lanhgia_trung`, `sup_lanhgia` |
| `laser` | 10 | `fx_laser_dan`, `fx_laser_hieu`, `fx_laser_no`, `fx_laser_tia`, `fx_laser_trung` |
| `leviathan` | 13 | `fx_leviathan_dan`, `fx_leviathan_hieu`, `fx_leviathan_no`, `fx_leviathan_tia`, `fx_leviathan_trung` |
| `lien` | 10 | `dan_lien`, `fx_lien_dan`, `fx_lien_hieu`, `fx_lien_no`, `fx_lien_trung` |
| `lienket` | 20 | `fx_lienket_dacbiet`, `fx_lienket_dan`, `fx_lienket_dan2`, `fx_lienket_dan3`, `fx_lienket_hieu`, `fx_lienket_no`, `fx_lienket_trung`, `fx_lienket_trung3`, `fx_vong_mong` |
| `loa` | 9 | `fx_loa_dan`, `fx_loa_hieu`, `fx_loa_no`, `fx_loa_trung` |
| `lophanung` | 19 | `fx_lophanung_dacbiet`, `fx_lophanung_dan`, `fx_lophanung_dan2`, `fx_lophanung_dan3`, `fx_lophanung_hieu`, `fx_lophanung_no`, `fx_lophanung_trung`, `fx_lophanung_trung3` |
| `loren` | 11 | `fx_loren_dan`, `fx_loren_hieu`, `fx_loren_no`, `fx_loren_trung`, `loren_songsinh` |
| `lualien` | 12 | `fx_lualien_sk`, `lua_t1`, `lua_t2`, `lua_t3`, `lua_t4` |
| `luoicheo` | 19 | `fx_luoicheo_dacbiet`, `fx_luoicheo_dan`, `fx_luoicheo_dan2`, `fx_luoicheo_dan3`, `fx_luoicheo_hieu`, `fx_luoicheo_no`, `fx_luoicheo_trung`, `fx_luoicheo_trung3` |
| `luutru` | 12 | `fx_la`, `fx_luutru_sk`, `kho_bay`, `kho_icon`, `kho_no` |
| `mana` | 19 | `fx_mana_dan`, `fx_mana_hieu`, `fx_mana_no`, `fx_mana_trung`, `fx_vong_mong`, `fxb_cham`, `fxb_chet`, `fxb_crit`, `fxb_dmg`, `fxb_khien`, `fxb_mana`, `fxb_max`, `fxb_toc`, `sup_mana` |
| `marionette` | 15 | `fx_marionette_dan`, `fx_marionette_day`, `fx_marionette_hieu`, `fx_marionette_no`, `fx_marionette_tay`, `fx_marionette_thanh`, `fx_marionette_trung` |
| `mauhut` | 21 | `fx_mauhut_b1`, `fx_mauhut_b2`, `fx_mauhut_b3`, `fx_mauhut_nova`, `fx_mauhut_sk` |
| `maychem` | 10 | `fx_maychem_dan`, `fx_maychem_hieu`, `fx_maychem_no`, `fx_maychem_trung`, `p3_maychem` |
| `mimic` | 9 | `fx_mimic_dan`, `fx_mimic_hieu`, `fx_mimic_no`, `fx_mimic_trung` |
| `min` | 11 | `fx_min_dan`, `fx_min_hieu`, `fx_min_mo`, `fx_min_no`, `fx_min_trung`, `p3_min` |
| `mortar` | 11 | `fx_mortar_chum`, `fx_mortar_dan`, `fx_mortar_hieu`, `fx_mortar_no`, `fx_mortar_trung`, `p3_mortar` |
| `nam` | 9 | `fx_nam_dan`, `fx_nam_hieu`, `fx_nam_no`, `fx_nam_trung` |
| `nangluong` | 9 | `fx_nangluong_dan`, `fx_nangluong_hieu`, `fx_nangluong_no`, `fx_nangluong_trung` |
| `nangsao` | 9 | `fx_nangsao_dan`, `fx_nangsao_hieu`, `fx_nangsao_no`, `fx_nangsao_trung` |
| `nayda` | 10 | `fx_nayda_dan`, `fx_nayda_hieu`, `fx_nayda_no`, `fx_nayda_trung`, `hu_luoicua` |
| `nemesis` | 14 | `fx_nemesis_dan`, `fx_nemesis_hieu`, `fx_nemesis_no`, `fx_nemesis_tia`, `fx_nemesis_trung`, `p3_nemesis` |
| `ngaithoigian` | 20 | `fx_ngaithoigian_dacbiet`, `fx_ngaithoigian_dan`, `fx_ngaithoigian_dan2`, `fx_ngaithoigian_dan3`, `fx_ngaithoigian_hieu`, `fx_ngaithoigian_no`, `fx_ngaithoigian_trung`, `fx_ngaithoigian_trung3`, `hu_khoa` |
| `ngoisao` | 20 | `fx_ngoisao_dacbiet`, `fx_ngoisao_dan`, `fx_ngoisao_dan2`, `fx_ngoisao_dan3`, `fx_ngoisao_hieu`, `fx_ngoisao_no`, `fx_ngoisao_trung`, `fx_ngoisao_trung3`, `p3_ngoisao` |
| `nguyenrua` | 5 | `fx_nguyenrua_sk` |
| `nhanban` | 9 | `fx_nhanban_dan`, `fx_nhanban_hieu`, `fx_nhanban_no`, `fx_nhanban_trung` |
| `nhanmana` | 9 | `fx_nhanmana_dan`, `fx_nhanmana_hieu`, `fx_nhanmana_no`, `fx_nhanmana_trung` |
| `nhatthuc` | 15 | `fx_nhatthuc_dan`, `fx_nhatthuc_hieu`, `fx_nhatthuc_no`, `fx_nhatthuc_tia`, `fx_nhatthuc_trung`, `hu_trangkhuyet`, `p3_nhatthuc` |
| `nhieusong` | 9 | `fx_nhieusong_dan`, `fx_nhieusong_hieu`, `fx_nhieusong_no`, `fx_nhieusong_trung` |
| `no5` | 9 | `fx_no5_dan`, `fx_no5_hieu`, `fx_no5_no`, `fx_no5_trung` |
| `orbital` | 23 | `fx_orbital_bomno`, `fx_orbital_dacbiet`, `fx_orbital_dan`, `fx_orbital_dan2`, `fx_orbital_dan3`, `fx_orbital_hieu`, `fx_orbital_no`, `fx_orbital_thuc`, `fx_orbital_tia`, `fx_orbital_trung`, `fx_orbital_trung3`, `p2_orbital` |
| `overlord` | 21 | `fx_overlord_dacbiet`, `fx_overlord_dan`, `fx_overlord_dan2`, `fx_overlord_dan3`, `fx_overlord_hieu`, `fx_overlord_no`, `fx_overlord_tia`, `fx_overlord_trung`, `fx_overlord_trung3`, `p2_overlord` |
| `pandora` | 29 | `fx_lev_bang`, `fx_pandora_dan`, `fx_pandora_hieu`, `fx_pandora_no`, `fx_pandora_trung`, `fx_wyrm_lua`, `lev_rong`, `pandora_dia`, `sig_l04_crest`, `sig_l04_hammer`, `sig_l04_star`, `sig_l06_seal`, `sig_l16_icons`, `sig_l16_vault`, `sig_l16_wheel`, `sig_m06_comb`, `sig_m06_crest`, `sig_m06_drone`, `sig_m06_pulse`, `sig_m06_queen`, `wyrm_rong` |
| `phagiap` | 9 | `fx_phagiap_dan`, `fx_phagiap_hieu`, `fx_phagiap_no`, `fx_phagiap_trung` |
| `phun` | 9 | — |
| `radar` | 10 | `fx_radar_dan`, `fx_radar_hieu`, `fx_radar_no`, `fx_radar_trung`, `sup_radar` |
| `railgun` | 11 | `fx_railgun_dan`, `fx_railgun_hieu`, `fx_railgun_no`, `fx_railgun_tia`, `fx_railgun_trung`, `p3_railgun` |
| `ronglua` | 37 | `fx_ronglua_dacbiet`, `fx_ronglua_dan`, `fx_ronglua_dan2`, `fx_ronglua_dan3`, `fx_ronglua_dive`, `fx_ronglua_hieu`, `fx_ronglua_no`, `fx_ronglua_trung`, `fx_ronglua_trung3`, `fx_ronglua_vet`, `ronglua_f1_canh`, `ronglua_f2_canh`, `ronglua_f3_canh`, `ronglua_f4_canh` |
| `santhuong` | 9 | `fx_santhuong_dan`, `fx_santhuong_hieu`, `fx_santhuong_no`, `fx_santhuong_trung` |
| `saochep` | 9 | `fx_saochep_dan`, `fx_saochep_hieu`, `fx_saochep_no`, `fx_saochep_trung` |
| `set` | 12 | `fx_set_dan`, `fx_set_hieu`, `fx_set_nho`, `fx_set_no`, `fx_set_tia`, `fx_set_trung`, `p3_set` |
| `sinhdoi` | 9 | `fx_sinhdoi_dan`, `fx_sinhdoi_hieu`, `fx_sinhdoi_no`, `fx_sinhdoi_trung` |
| `soi` | 25 | `fx_cham_trang`, `fx_soi_dacbiet`, `fx_soi_dan`, `fx_soi_dan2`, `fx_soi_dan3`, `fx_soi_hieu`, `fx_soi_no`, `fx_soi_song`, `fx_soi_trung`, `fx_soi_trung3`, `fx_soi_vuot`, `p3_soi`, `soi_dau_thuctinh`, `soi_dau_thuong` |
| `sungluc` | 10 | `fx_sungluc_dan`, `fx_sungluc_hieu`, `fx_sungluc_no`, `fx_sungluc_tia`, `fx_sungluc_trung` |
| `taylo` | 10 | `fx_taylo_dan`, `fx_taylo_hieu`, `fx_taylo_no`, `fx_taylo_trung`, `sup_taylo` |
| `thacmana` | 4 | — |
| `thanhdia` | 5 | `fx_thanhdia_sk` |
| `thaukinh` | 9 | `fx_thaukinh_dan`, `fx_thaukinh_hieu`, `fx_thaukinh_no`, `fx_thaukinh_trung` |
| `tia` | 15 | `dan_tia`, `fx_tia_dan`, `fx_tia_hieu`, `fx_tia_no`, `fx_tia_sao`, `fx_tia_tia`, `fx_tia_trung`, `tia_laser`, `tia_lua`, `tia_set` |
| `tienhoa` | 26 | `fx_tienhoa_dacbiet`, `fx_tienhoa_dan`, `fx_tienhoa_dan2`, `fx_tienhoa_dan3`, `fx_tienhoa_hieu`, `fx_tienhoa_no`, `fx_tienhoa_tia`, `fx_tienhoa_trung`, `fx_tienhoa_trung3`, `trung_1`, `trung_2`, `trung_3`, `trung_chay7`, `trung_no`, `trung_vo` |
| `tron` | 9 | `fx_tron_dan`, `fx_tron_hieu`, `fx_tron_no`, `fx_tron_trung` |
| `tudo` | 4 | — |
| `tuthan` | 11 | `fx_tuthan_dan`, `fx_tuthan_hieu`, `fx_tuthan_no`, `fx_tuthan_trung`, `p3_tuthan`, `sup_tuthan` |
| `vughep` | 10 | `fx_vughep_dan`, `fx_vughep_hieu`, `fx_vughep_no`, `fx_vughep_trung` |
| `vungdoc` | 10 | `fx_vungdoc_dan`, `fx_vungdoc_hieu`, `fx_vungdoc_no`, `fx_vungdoc_trung`, `p3_vungdoc` |
| `wallgen` | 11 | `fx_wallgen_dan`, `fx_wallgen_hieu`, `fx_wallgen_no`, `fx_wallgen_trung`, `fx_wallgen_vang`, `p3_wallgen` |
| `xaotron` | 9 | `fx_xaotron_dan`, `fx_xaotron_hieu`, `fx_xaotron_no`, `fx_xaotron_trung` |
| `xucxac` | 9 | `fx_xucxac_dan`, `fx_xucxac_hieu`, `fx_xucxac_no`, `fx_xucxac_trung` |
| `xuonganh` | 7 | `fx_cham_trang`, `fx_xuonganh_sk`, `tier_ring_vang` |

## 2. Theo trùm

| id | số ảnh | ảnh |
|---|---|---|
| `freezer` | 7 | `trum_freezer`, `trum_freezer_8`, `trum_freezer_atk_16`, `trum_freezer_m`, `trum_freezer_m_khoi`, `trum_freezer_m_sang`, `trum_freezer_portrait` |
| `hive` | 10 | `fx_hive_drone`, `fx_hive_lao`, `fx_hive_no`, `fx_hive_vet`, `trum_hive_8`, `trum_hive_atk_16`, `trum_hive_m`, `trum_hive_m_ong`, `trum_hive_m_sang`, `trum_hive_portrait` |
| `jammer` | 8 | `fx_trum_jammer`, `trum_jammer_8`, `trum_jammer_atk_16`, `trum_jammer_m`, `trum_jammer_m_nap`, `trum_jammer_m_sang`, `trum_jammer_m_vanh`, `trum_jammer_portrait` |
| `janus` | 7 | `trum_janus`, `trum_janus_8`, `trum_janus_atk_16`, `trum_janus_m`, `trum_janus_m_p0`, `trum_janus_m_sang`, `trum_janus_portrait` |
| `joker_king` | 13 | `trum_joker_king`, `trum_joker_king_8`, `trum_joker_king_atk_16`, `trum_joker_king_m`, `trum_joker_king_m_nap`, `trum_joker_king_portrait`, `trum_joker_king_r_body`, `trum_joker_king_r_glow_body`, `trum_joker_king_r_glow_lid`, `trum_joker_king_r_inside`, `trum_joker_king_r_lid`, `trum_joker_king_r_shadow`, `trum_joker_king_r_spring` |
| `leech` | 6 | `fx_trum_leech`, `trum_leech_8`, `trum_leech_atk_16`, `trum_leech_m`, `trum_leech_m_sang`, `trum_leech_portrait` |
| `mad_crown` | 8 | `sig_l04_crown`, `trum_mad_crown`, `trum_mad_crown_8`, `trum_mad_crown_atk_16`, `trum_mad_crown_m`, `trum_mad_crown_m_sang`, `trum_mad_crown_m_vm`, `trum_mad_crown_portrait` |
| `nightmare` | 6 | `trum_nightmare`, `trum_nightmare_8`, `trum_nightmare_atk_16`, `trum_nightmare_m`, `trum_nightmare_m_sang`, `trum_nightmare_portrait` |
| `octopus` | 7 | `trum_octopus`, `trum_octopus_8`, `trum_octopus_atk_16`, `trum_octopus_m`, `trum_octopus_m_p0`, `trum_octopus_m_sang`, `trum_octopus_portrait` |
| `patcher` | 7 | `fx_trum_patcher`, `trum_patcher_8`, `trum_patcher_atk_16`, `trum_patcher_m`, `trum_patcher_m_nap`, `trum_patcher_m_sang`, `trum_patcher_portrait` |
| `prism` | 7 | `fx_trum_prism`, `prism_seg`, `trum_prism_8`, `trum_prism_atk_16`, `trum_prism_m`, `trum_prism_m_sang`, `trum_prism_portrait` |
| `twin_core` | 8 | `trum_twin_core_8`, `trum_twin_core_atk_16`, `trum_twin_core_m`, `trum_twin_core_m_p0`, `trum_twin_core_m_p1`, `trum_twin_core_m_p2`, `trum_twin_core_m_sang`, `trum_twin_core_portrait` |

## 3. Theo chỉ huy

| id | ảnh |
|---|---|

## 4. Dùng chung / theo tình huống (không gắn với 1 ụ)

| ảnh | nơi dùng |
|---|---|
| `cb_cam` | jackpot.js |
| `cb_cap` | jackpot.js |
| `cb_dua` | jackpot.js |
| `cb_dung` | jackpot.js |
| `cb_jp` | jackpot.js |
| `cb_khung3` | jackpot.js |
| `cb_lai` | jackpot.js |
| `cb_nho` | jackpot.js |
| `cf_dau_sao` | ghepfx.js |
| `cf_hut` | ghepfx.js |
| `cf_no` | ghepfx.js |
| `cf_o_nha` | ghepfx.js |
| `cf_vong_hop` | ghepfx.js, tvb.js |
| `cf_vong_ren` | camgiac.js, ghepfx.js, trumvfx.js, tvb.js |
| `cong` | hieuung.js, hud-anime.js, hud2.js, render.js |
| `dan_phao` | fxu.js, render.js, skills.js, skills2.js |
| `de_chung` | ghepfx.js, hieuung.js, nongskill.js, render.js |
| `dosig_nut` | dosig.js |
| `duong_goc` | render.js, taitai.js |
| `duong_mui` | comoi.js, demkn.js, render.js, skilldemo.js |
| `duong_nga3` | render.js |
| `duong_thang` | render.js, taitai.js |
| `evo_bom` | growfx.js |
| `evo_xacbom` | growfx.js |
| `fx_awaken` | growfx.js, hieuung.js, nongskill.js, ui.js |
| `fx_bingo` | hieuung.js, ui.js, fxu.js («fx_…»), render.js («fx_…») |
| `fx_buff` | skilldemo.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_cb_no` | jackpot.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_cham_trang` | camgiac.js, comoi.js, fxu-meta.js, fxu.js |
| `fx_chop_nong` | ui.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_dien` | nongskill.js, ui.js, vfxp2.js, fxu.js («fx_…») |
| `fx_evo_xit` | growfx.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_evolve` | hieuung.js, ui.js, fxu.js («fx_…»), render.js («fx_…») |
| `fx_giot_nuoc` | dosig.js, fxu-meta.js, fxu.js («fx_…»), render.js («fx_…») |
| `fx_hoa_giay` | dosig.js, fxu-meta.js, fxu.js («fx_…»), render.js («fx_…») |
| `fx_khoi_doc` | nongskill.js, skills.js, ui.js, fxu.js («fx_…») |
| `fx_la` | dosig.js, fxu-meta.js, vangsig.js, fxu.js («fx_…») |
| `fx_link` | hieuung.js, nongskill.js, ui.js, fxu.js («fx_…») |
| `fx_merge` | ghepfx.js, hieuung.js, ui.js, fxu.js («fx_…») |
| `fx_no_phao` | ui.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_p14_khoi` | bangfx.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_p14_song` | bangfx.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_p14_vong` | bangfx.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_st_cauvong` | fxu-meta.js, trumvfx.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_cham` | fxu-meta.js, quaianim.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_chay` | fxu-meta.js, quaianim.js, trumvfx.js, fxu.js («fx_st_…») |
| `fx_st_choang` | fxu-meta.js, quaianim.js, trumvfx.js, fxu.js («fx_st_…») |
| `fx_st_dau` | fxu-meta.js, trumvfx.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_doc` | fxu-meta.js, quaianim.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_doclay` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_dong` | fxu-meta.js, quaianim.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_frostbite` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_giapvo` | fxu-meta.js, trumvfx.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_keo` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_kep` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_khienvang` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_tua` | fxu-meta.js, growfx.js, fxu.js («fx_st_…»), fxu.js («fx_…») |
| `fx_st_xutu` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_st_yeu` | fxu-meta.js, fxu.js («fx_st_…»), fxu.js («fx_…»), quaianim.js («fx_st_…») |
| `fx_starup` | camgiac.js, hieuung.js, skilldemo.js, ui.js |
| `fx_summon` | hieuung.js, skilldemo.js, ui.js, fxu.js («fx_…») |
| `fx_vet_trang` | dosig.js, fxu-meta.js, fxu.js, render.js |
| `fx_vo_dan` | fxu-meta.js, fxu.js («fx_…»), render.js («fx_…»), skills7.js («fx_…») |
| `fx_vong_lv` | render.js, skilldemo.js, taitai.js, ui.js |
| `fx_vong_mong` | buffvfx.js, chihuy-moi.js, chihuy-the.js, fxu-meta.js |
| `fx_vong_trieu` | fxu.js, hieuung.js, skills3.js, skills5.js |
| `fx_wyrm_lua2` | sigfx.js, skills5.js, fxu.js («fx_…»), render.js («fx_…») |
| `fx_wyrm_lua2_2` | sigfx.js, fxu.js («fx_…»), render.js («fx_…»), skills5.js («fx_wyrm_lua2_…») |
| `fx_wyrm_lua2_3` | sigfx.js, fxu.js («fx_…»), render.js («fx_…»), skills5.js («fx_wyrm_lua2_…») |
| `fxb_cham` | buffvfx.js |
| `fxb_chet` | buffvfx.js |
| `fxb_khien` | buffvfx.js |
| `ha_canh` | hud-anime.js |
| `ha_cong` | hud-anime.js |
| `ha_duong` | hud-anime.js |
| `ha_goc` | hud-anime.js |
| `ha_ic_dung` | hud-anime.js |
| `ha_ic_toc` | hud-anime.js |
| `ha_khay` | hud-anime.js |
| `ha_khung_do` | hud-anime.js, hud-anime.js («ha_khung_…») |
| `ha_khung_tim` | hud-anime.js, hud-anime.js («ha_khung_…») |
| `ha_khung_trang` | hud-anime.js, hud-anime.js («ha_khung_…») |
| `ha_khung_vang` | hud-anime.js, hud-anime.js («ha_khung_…») |
| `ha_khung_xanh` | hud-anime.js, hud-anime.js («ha_khung_…») |
| `ha_loi` | hud-anime.js |
| `ha_mana` | hud-anime.js |
| `ha_mau_ranh` | hud-anime.js |
| `ha_mau_trum` | hud-anime.js |
| `ha_mau_xanh` | hud-anime.js |
| `ha_nen` | hud-anime.js |
| `ha_nga3` | hud-anime.js |
| `ha_o_rong` | hud-anime.js |
| `ha_o_vuong` | hud-anime.js |
| `ha_top` | hud-anime.js |
| `ha_trieu` | hud-anime.js |
| `hat_tuyet` | dosig.js, render.js, ui.js |
| `hh_sao1` | hud2.js |
| `hh_sao2` | hud2.js |
| `hh_sao3` | hud2.js |
| `hh_sao4` | hud2.js |
| `hh_sao5` | hud2.js |
| `hh_sao6` | hud2.js |
| `hh_sao7` | hud2.js |
| `hu_cauvong` | nongskill.js, skills2.js, ui.js |
| `hu_hoden` | nongskill.js, skills.js, ui.js, vfxp2.js |
| `hu_khoa` | nongskill.js, skills3.js, ui.js |
| `hu_min` | nongskill.js, skills2.js, ui.js |
| `hu_vongbang` | growfx.js, nongskill.js, trumvfx.js |
| `khay` | render.js, taitai.js |
| `khoi_0` | ghepfx.js, render.js, taitai.js, ghepfx.js («khoi_…») |
| `khoi_1` | ghepfx.js, render.js, taitai.js, ghepfx.js («khoi_…») |
| `khoi_2` | ghepfx.js, render.js, taitai.js, ghepfx.js («khoi_…») |
| `khoi_3` | ghepfx.js, render.js, taitai.js, ghepfx.js («khoi_…») |
| `khung_chon` | buff.js, demkn.js, hud2.js, keoghep.js |
| `khung_tt` | hud2.js |
| `lev_abyss` | demkn.js |
| `loi` | corehud.js, hud-anime.js, render.js, taitai.js |
| `loi_hu1` | corehud.js, ui.js |
| `loi_hu2` | corehud.js, ui.js |
| `loi_khuc_day` | hud2.js |
| `loi_vong_giua_sang` | hud2.js, corehud.js («loi_vong_…_sang») |
| `loi_vong_giua_tat` | hud2.js, corehud.js («loi_vong_…_tat») |
| `loi_vong_no` | corehud.js, hud2.js |
| `loi_vong_phai_sang` | hud2.js, corehud.js («loi_vong_…_sang») |
| `loi_vong_phai_tat` | hud2.js, corehud.js («loi_vong_…_tat») |
| `loi_vong_trai_sang` | hud2.js, corehud.js («loi_vong_…_sang») |
| `loi_vong_trai_tat` | hud2.js, corehud.js («loi_vong_…_tat») |
| `mui_tiep` | comoi.js, hieuung.js, taitai.js |
| `ngoc_do` | ui.js, taitai.js («ngoc_…») |
| `ngoc_tim` | ui.js, taitai.js («ngoc_…») |
| `ngoc_trang` | ui.js, taitai.js («ngoc_…») |
| `ngoc_vang` | motvong.js, ui.js, taitai.js («ngoc_…») |
| `ngoc_xanh` | motvong.js, ui.js, taitai.js («ngoc_…») |
| `nhan_kn` | hud2.js, keoghep.js, render.js, ui.js |
| `nut_cong` | hud2.js |
| `nut_lon_thep` | hud2.js |
| `nut_lon_vang` | hud2.js |
| `nut_lon_xanh` | hud2.js |
| `nut_nho` | hud2.js |
| `p1_manh_sao` | camgiac.js |
| `p1_sao3` | camgiac.js |
| `p1_sao5` | camgiac.js |
| `p1_sao7` | camgiac.js |
| `p1_vach_lv` | camgiac.js |
| `p2_chronolock` | p2-meta.js, vfxp2.js |
| `p2_copycat` | p2-meta.js, vfxp2.js |
| `p2_cryo` | p2-meta.js, vfxp2.js |
| `p2_ember` | comoi.js, p2-meta.js, vfxp2.js |
| `p2_evolver` | p2-meta.js, vfxp2.js |
| `p2_genesis` | p2-meta.js, vfxp2.js |
| `p2_halo` | p2-meta.js, vfxp2.js |
| `p2_herotile` | p2-meta.js, vfxp2.js |
| `p2_rewind` | p2-meta.js, vfxp2.js |
| `phu_bang` | render.js, ui.js |
| `phu_da` | render.js, ui.js |
| `phu_lua` | render.js, skilldemo.js, ui.js |
| `phu_ngam` | render.js, skilldemo.js, ui.js |
| `quai_bay` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_bay_8` | nongskill.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_bay_bang` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_bay_bang_8` | nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…»), ui.js («quai_…_8») |
| `quai_bo` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_bo_8` | nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…»), ui.js («quai_…_8») |
| `quai_khong_lo` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_khong_lo_8` | nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…»), ui.js («quai_…_8») |
| `quai_khong_lo_m` | nongskill.js («quai_…»), quaianim.js («quai_…_m»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_que_tach` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_que_tach_8` | nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…»), ui.js («quai_…_8») |
| `quai_que_tach_m` | nongskill.js («quai_…»), quaianim.js («quai_…_m»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_tach` | quaianim.js, nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…») |
| `quai_tach_8` | nongskill.js («quai_…»), quaianim.js («quai_…»), render.js («quai_…»), ui.js («quai_…_8») |
| `quai_tach_m` | nongskill.js («quai_…»), quaianim.js («quai_…_m»), quaianim.js («quai_…»), render.js («quai_…») |
| `san_tran` | render.js |
| `sao_chu` | taitai.js |
| `sao_hex` | render.js, ui.js |
| `sao_hex7` | render.js, ui.js |
| `seg_sang` | hud2.js, trumvfx.js |
| `seg_tat` | trumvfx.js |
| `seg_trum` | hud2.js |
| `sig_l06_courier` | sig-meta.js, sigfx.js («sig_l06_…»), sigfx.js («sig_…») |
| `sig_l06_gift` | sig-meta.js, sigfx.js («sig_l06_…»), sigfx.js («sig_…») |
| `sig_l06_shatter` | sig-meta.js, sigfx.js («sig_l06_…»), sigfx.js («sig_…») |
| `sig_l06_thief` | sig-meta.js, sigfx.js («sig_l06_…»), sigfx.js («sig_…») |
| `sig_l14_beam` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l14_bite` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l14_fusion` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l14_heads` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l14_hit` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l16_o_atk` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l16_o_def` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l16_o_gold` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l16_o_heal` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l16_o_void` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l16_o_zap` | sig-meta.js, sigfx.js («sig_l16_…»), sigfx.js («sig_…») |
| `sig_l22_hand` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l22_immune` | sig-meta.js, sigfx.js («sig_…») |
| `sig_l22_shadow` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l22_stage` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l22_string` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_l22_toy` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m01_crush` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m01_lens` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m01_release` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m01_shards` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m01_swirl` | sig-meta.js, sigfx.js, vfxp2.js, sigfx.js («sig_…») |
| `sig_m05_echo` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m05_hands` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m05_hourglass` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m05_throne` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m07_breath` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m07_corner` | sig-meta.js, sigfx.js, sigfx.js («sig_…») |
| `sig_m07_jaw` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m07_neck` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m07_sigil` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m09_cone` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m09_crest` | sig-meta.js, sigfx.js, vfxmoi.js, sigfx.js («sig_…») |
| `sig_m09_wake` | sig-meta.js, sigfx.js, vfxmoi.js, sigfx.js («sig_…») |
| `sig_m09_wings` | sig-meta.js, sigfx.js («sig_…») |
| `sig_m09_wyrm` | sig-meta.js, sigfx.js («sig_…») |
| `sup_khung` | support.js, ui.js |
| `sup_link` | buff.js, chihuy-moi.js, render.js, support.js |
| `sup_link_vang` | chihuy-moi.js, skills7.js, support.js, ui.js |
| `sup_ring` | buff.js, ghepfx.js, keoghep.js, nhandien.js |
| `tier_ring_do` | taitai.js («tier_ring_…») |
| `tier_ring_tim` | taitai.js («tier_ring_…») |
| `tier_ring_trang` | taitai.js («tier_ring_…») |
| `tier_ring_xanh` | taitai.js («tier_ring_…») |
| `trum_xich_day` | render.js, ui.js, nongskill.js («trum_…»), quaianim.js («trum_…») |
| `trum_xich_vong` | render.js, ui.js, nongskill.js («trum_…»), quaianim.js («trum_…») |
| `trung_1` | demkn.js, growfx.js, skills2.js, skills7.js |
| `tv_dich1` | tvb.js |
| `tv_dich2` | tvb.js |
| `tv_dich3` | tvb.js |
| `tv_dich4` | tvb.js |
| `tv_ghep1` | tvb.js |
| `tv_ghep2` | tvb.js |
| `tv_ghep3` | tvb.js |
| `tv_ghep4` | tvb.js |
| `tv_ghep5` | tvb.js |
| `tv_ghep6` | tvb.js |
| `tv_ghep7` | tvb.js |
| `tv_ghep8` | tvb.js |
| `tv_hang1` | tvb.js |
| `tv_hang2` | tvb.js |
| `tv_hang3` | tvb.js |
| `tv_hang4` | tvb.js |
| `tv_keo_bong` | tvb.js |
| `tv_khong` | tvb.js |
| `tv_lui1` | tvb.js |
| `tv_lui2` | tvb.js |
| `tv_lui3` | tvb.js |
| `tv_lui4` | tvb.js |
| `vong_xich` | growfx.js, render.js, ui.js |

## 5. Có trong assets nhưng KHÔNG thấy tham chiếu tĩnh (có thể là tên dựng lúc chạy, hoặc ảnh thừa)

`cb_cam_m`, `cb_dua_m`, `cb_khung`, `cb_nho_m`, `cb_no_ic`, `chon_de_xanh`, `chon_huy`, `ci_quet`, `den_tim_bat`, `den_tim_tat`, `ha_ic_dung2`, `ha_trieu_cam`, `ha_vien_xanh`, `hang_sang`, `ht_tim`, `khung_bang`, `led_xanh`, `logo`, `logo_aa`, `phim`, `phim_nhan`, `tai_khung`, `the_vien`, `tv_o_co`, `tv_o_trong`

## 6. Ụ không có ảnh hiệu ứng riêng

—
