# ẢNH THỰC DÙNG (trận bot) ↔ QUÉT TĨNH `THONG-KE-HIEU-UNG.json`

> Sinh tự động: `python3 tools/thap-nong-meta.py sinh` (2026-11-12T03:13Z). Dữ liệu thô: `ANH-THUC-DUNG-TRAN.json` · máy đọc: `ANH-THUC-DUNG.json` · bảng game: `thap/js/nong-meta.js` (15 KB).

- Trận: 20 trận lưới (mỗi ụ ở ≥ 2 trận, 2 bộ × 5 ụ, co-op, wave 20 → ~33, đặt thẳng 7★ / 5★ + bot triệu hồi – ghép, chỉ huy dùng mỗi ~12 s) + 12 trận ép trùm. k = 0.90698.
- Ảnh khác nhau được vẽ bằng lớp GL: **925** (không kể dải quái / trùm: 893).
- Gán: theo ụ **886** lượt (98 ụ có ảnh; ít nhất (3, 'thanhdia'), nhiều nhất (28, 'ronglua')) · chỉ huy 6 · trùm 78 · dùng chung đầu trận `dau` **55** (6.6 MB ở tầng đo) · nạp nền `nen` **27** (4.2 MB) · hiếm (không nạp trước) 7.
- MB texture / ụ ở tầng đo (k = 0.90698): trung vị 0.6 · lớn nhất blackhole 9.8, overlord 6.6, mauhut 6.5, nguyenrua 6.3, nhatthuc 5.0.

## Quét tĩnh ÔM NHẦM / THỪA (có trong `u[id]` tĩnh, không vào bảng của ụ đó)

| loại | số lượt | ví dụ |
|---|---|---|
| được vẽ, nhưng CHỈ ở trận không có ụ đó (ôm nhầm tên) | 18 | `dosig_sen`→bang, `dosig_tran`→bang, `fx_canon_trung`→canon, `fxb_cham`→khien, `fxb_cham`→mana, `fxb_khien`→mana, `sig_l04_crest`→pandora, `sig_l04_hammer`→pandora, `dan_tia`→tia, `tia_set`→tia |
| chỉ được TẢI ở trận có ụ, không vẽ bằng lớp GL (DOM / thẻ / ghép vào canvas khác / chưa tới trạng thái) | 186 | `fx_anhsang_hieu`→anhsang, `fx_anhsang_tia`→anhsang, `fx_aten_hieu`→aten, `fx_aten_trung`→aten, `dan_bang`→bang, `fx_bang_hieu`→bang, `fx_bao_hieu`→bao, `fx_baotuyet_dan`→baotuyet, `fx_baotuyet_hieu`→baotuyet, `bienmau_hop_2`→bienmau, `bienmau_hop_3`→bienmau, `fx_blackhole_dan`→blackhole, `bocap_nong_s2`→bocap, `bocap_nong_s3`→bocap, `fx_bomhen_hieu`→bomhen, `canon_de`→canon, `canon_de_10`→canon, `sup_chimang`→chimang, `fx_chuato_dacbiet`→chuato, `fx_chuato_dan2`→chuato, `combo_nong_s3`→combo, `combo_phu`→combo, `fx_cuongno_dacbiet`→cuongno, `fx_cuongno_hieu`→cuongno, `cuuvi_nong_s2`→cuuvi, `fx_cuuvi_dacbiet`→cuuvi, `fx_dichchuyen_hieu`→dichchuyen, `dan_doc`→doc, `fx_doc_hieu`→doc, `fx_docton_hieu`→docton, `fx_dongbo_dacbiet`→dongbo, `fx_dongbo_dan2`→dongbo, `drone_nong`→drone, `fx_epxung_hieu`→epxung, `fx_hopbi_dacbiet`→hopbi, `fx_hopbi_dan`→hopbi, `fx_hopca_sk`→hopca, `fx_hutmana_hieu` |
| không hề được xin trong trận có ụ | 270 | `anhsang_nong_v1`→anhsang, `anhsang_phu`→anhsang, `aten_nong_v1`→aten, `aten_phu`→aten, `bang_cutin_nen`→bang, `bang_nong_v1`→bang, `bao_nong_v1`→bao, `bao_phu`→bao, `baotuyet_nong_v1`→baotuyet, `baotuyet_phu`→baotuyet, `bienmau_phu`→bienmau, `blackhole_nong_v1`→blackhole, `blackhole_phu`→blackhole, `bomhen_nong_v1`→bomhen, `bomhen_phu`→bomhen, `bua_nong_v1`→bua, `bua_phu`→bua, `canon_nong_v1`→canon, `cauvong_nong_v1`→cauvong, `cauvong_phu`→cauvong, `chimang_nong_v1`→chimang, `chimang_phu`→chimang, `chuato_nong_v1`→chuato, `chuato_phu`→chuato, `cobac_de`→cobac, `cobac_phu`→cobac, `combo_nong_v1`→combo, `congap_phu`→congap, `cuongno_nong_s1`→cuongno, `cuongno_nong_s1_v1`→cuongno, `cuuvi_nong_s1_v1`→cuuvi, `cuuvi_nong_s2_v1`→cuuvi, `dichchuyen_nong_v1`→dichchuyen, `dichchuyen_phu`→dichchuyen, `doc_nong_v1`→doc, `doc_phu`→doc, `docton_nong_v1`→docton, `docton_phu`→docton, `dongbo_nong_s1_v1 |

## Quét tĩnh SÓT (được vẽ, gán cho ụ, không có trong `u[id]` tĩnh): 153 lượt

- `aten`: `fx_st_doc`
- `bao`: `fx_link`
- `bienmau`: `fx_lophanung_dacbiet`, `fx_lophanung_hieu`, `fx_lophanung_no`, `fx_lophanung_trung`, `fx_lophanung_trung3`, `lophanung_de`, `lophanung_nong`, `lophanung_nong_s1`, `lophanung_nong_s2`, `lophanung_nong_s3`, `lophanung_vien`, `tia_set`
- `blackhole`: `fx_song_xung`, `sig_m01_crush`, `sig_m01_lens`, `sig_m01_release`, `sig_m01_shards`, `sig_m01_swirl`
- `cauvong`: `fx_st_cauvong`
- `chimang`: `fxb_mana`
- `chuato`: `dosig_hex`, `fx_hive_drone`, `fx_hive_lao`, `fx_hive_no`, `fx_hive_vet`, `sig_m06_comb`, `sig_m06_crest`, `sig_m06_drone`, `sig_m06_pulse`, `sig_m06_queen`
- `cobac`: `cb_cam`, `cb_cam_m`, `cb_cap`, `cb_dua`, `cb_dua_m`, `cb_dung`, `cb_jp`, `cb_khung3`, `cb_lai`, `cb_nho`, `cb_nho_m`, `de_chung`, `fx_cb_no`, `fx_hoa_giay`, `fx_nhieusong_dan`, `fx_nhieusong_no`, `fx_nhieusong_trung`, `nhieusong_de`, `nhieusong_nong`, `nhieusong_vien`
- `combo`: `de_chung`
- `congap`: `de_chung`, `h2_ic_chong`
- `cuongno`: `fxb_max`
- `cuuvi`: `fx_lophanung_dacbiet`, `fx_lophanung_hieu`, `fx_lophanung_trung`, `fx_lophanung_trung3`, `ic_chet`, `lophanung_de`, `lophanung_nong_s1`, `lophanung_nong_s2`, `lophanung_nong_s3`, `lophanung_vien`
- `dongbo`: `fx_link`, `fx_st_doc`
- `guongcong`: `fx_giot_nuoc`
- `haoquang`: `de_chung`, `fx_evolve`, `fx_merge`, `h2_vfx_ghep`, `sup_link`, `trung_1`
- `hasao`: `sig_l06_courier`, `sig_l06_gift`
- `hopbi`: `fx_evolve`
- `hopca`: `fx_giot_nuoc`
- `hydra`: `fx_la`
- `kepha`: `fx_evolve`
- `khien`: `fx_link`
- `khoathoigian`: `p2_chronolock`
- `khoisinh`: `dosig_sen`, `ic_sao`, `khung_chon`
- `khuech`: `fx_st_doc`
- `lanhgia`: `fxb_cham`
- `lien`: `fx_canon_no`, `fx_canon_ten`, `p3_canon`
- `lienket`: `fx_link`
- `lualien`: `fx_ronglua_vet`, `p2_ember`
- `luutru`: `fx_st_chay`
- `marionette`: `fx_la`, `sig_l22_shadow`, `sig_l22_toy`
- `mauhut`: `fx_giot_nuoc`
- `maychem`: `fx_song_xung`, `fxb_chet`
- `min`: `fxb_max`
- `mortar`: `fx_canon_no`, `fx_canon_ten`, `p3_canon`
- `nangluong`: `ic_mana`
- `nguyenrua`: `trung_1`
- `nhanmana`: `fxb_mana`
- `nhatthuc`: `fx_st_chay`
- `no5`: `fxb_chet`
- `overlord`: `dosig_nut`, `fx_song_xung`
- `pandora`: `dan_phao`, `sig_l16_o_atk`
- `phun`: `fx_dien`, `fxb_max`, `tia_set`
- `railgun`: `fx_canon_no`, `fx_canon_ten`, `fx_canon_trung`, `p3_canon`
- `ronglua`: `fx_st_chay`, `fx_wyrm_lua2`, `fx_wyrm_lua2_3`, `lua_t1`, `lua_t3`
- `santhuong`: `ic_truyna`
- `saochep`: `nho/saochep`, `p2_copycat`, `tudo_de`, `tudo_nong`, `tudo_vien`
- `sinhdoi`: `fx_bingo`
- `taylo`: `ic_taylo`
- `thacmana`: `fx_dien`, `fx_giot_nuoc`, `tia_set`
- `thaukinh`: `fx_st_chay`, `sup_link_vang`
- `tia`: `fxb_mana`
- `tienhoa`: `fx_evolve`, `fx_la`
- `tuthan`: `fxb_chet`
- `vughep`: `sig_l04_crest`, `sig_l04_crown`, `sig_l04_hammer`, `sig_l04_star`, `sup_link`
- `vungdoc`: `fx_st_doc`
- `wallgen`: `tia_set`
- `xucxac`: `fxb_chet`, `fxb_max`
- `xuonganh`: `p2_herotile`

## Trùm

- Ôm nhầm / không vẽ (25): freezer: trum_freezer_portrait; hive: fx_hive_drone, fx_hive_lao, fx_hive_no, fx_hive_vet, trum_hive_portrait; jammer: trum_jammer_m_vanh, trum_jammer_portrait; janus: trum_janus_portrait; joker_king: trum_joker_king_portrait, trum_joker_king_r_body, trum_joker_king_r_glow_body, trum_joker_king_r_glow_lid, trum_joker_king_r_lid, trum_joker_king_r_spring; leech: trum_leech_portrait; mad_crown: trum_mad_crown_portrait; nightmare: trum_nightmare_portrait; octopus: trum_octopus_portrait; patcher: trum_patcher_portrait; prism: prism_seg, trum_prism_portrait; twin_core: trum_twin_core_m_p1, trum_twin_core_m_p2, trum_twin_core_portrait
- Sót (9): hive: tb_to; jammer: tb_xich, trum_xich_vong; joker_king: tb_mimic; leech: h2_sao, tb_sao; mad_crown: tb_doiloai; patcher: tb_suachua; twin_core: fx_st_giapvo

## Dùng chung

- `dung_chung` tĩnh 253 ảnh — không được vẽ ở trận nào: 138 (cf_o_nha, cf_vong_hop, cong, duong_goc, duong_nga3, duong_thang, evo_bom, evo_xacbom, fx_buff, fx_evo_xit, fx_khoi_doc, fx_st_dau, fx_st_doclay, fx_st_frostbite, fx_st_keo, fx_st_kep, fx_st_tua, fx_st_xutu, fx_st_yeu, fx_vo_dan, ha_canh, ha_duong, ha_goc, ha_ic_dung, ha_ic_toc…)
- Vẽ thật, dùng chung, quét tĩnh không ghi (không ở `dung_chung` lẫn `u`): 13 (cmd_capsule, cmd_ic_twin, h2_glint, h2_tag, h2_vfx_cong, ic_dmg, ic_toc, tb_bang, tb_da, tb_khien, tb_lua, tb_snipe, tb_trum)
- `dau` (màn mở đầu): cf_dau_sao, cf_hut, cf_no, duong_mui, fx_awaken, fx_bui, fx_cham_trang, fx_laser_tia, fx_no_phao, fx_st_choang, fx_st_khienvang, fx_starup, fx_summon, fx_than, fx_tia_sao, fx_vet_trang, fx_vong_lv, fx_vong_mong, fx_vong_trieu, fxb_dmg, fxb_toc, h2_glint, h2_tag, h2_vfx_cong, ha_cong, ha_loi, hh_sao1, hh_sao2, hh_sao3, hh_sao4, hh_sao5, hh_sao6, hh_sao7, khoi_0, khoi_1, khoi_2, khoi_3, ngoc_vang, ngoc_xanh, nhan_kn, p1_sao3, p1_sao5, tai_day, tb_bang, tb_trum, tia_laser, tia_lua, tv_ghep1, tv_ghep2, tv_ghep3, tv_ghep4, tv_ghep5, tv_ghep6, tv_ghep7, tv_ghep8
- `nen` (nạp nền, theo thứ tự): fx_st_cham, fx_st_dong, cmd_capsule, fx_laser_trung, fxb_crit, p1_manh_sao, p1_sao7, fx_baotuyet_trung, ic_dmg, fx_chop_nong, fx_p14_khoi, fx_p14_song, fx_p14_vong, tb_da, fx_bang_vo, tb_snipe, dan_tia, fxb_khien, ha_mana, tb_lua, phu_da, phu_lua, tb_khien, fx_cuuvi_dan, hat_tuyet, ic_toc, vfxp0_tudong
- thấy ở trận thêm (x…), không gán được cho ụ nào (không nạp trước): 
- hiếm, không nạp trước: cf_vong_ren (c4), cmd_ic_twin (h5), dosig_tran (c7), fx_wyrm_lua2_2 (h8), lev_abyss (h8), p2_cryo (c9/h9), sig_l16_o_gold (h7)

## Ngoại lệ ghi tay (`tools/thap-nong-ngoai-le.json`)

```json
{}
```

## Giới hạn

- Mỗi ụ chỉ có 2 trận × 60 s (wave 20 → ~32): hiệu ứng rất hiếm (tỉ lệ thấp, cần tổ hợp ụ đặc biệt, wave > 35) có thể chưa xuất hiện → vẫn tải ở lần dùng đầu như trước (napsan.js không chặn gì).
- Gán theo lưới: ảnh do TƯƠNG TÁC 2 ụ cùng trận sinh ra được gán cho ụ có mặt ở cả 2 trận thấy nó; ảnh chỉ thấy 1 trận mà quét tĩnh không ghi chủ → `hiem`.
- Tầng đo ở k = 0.90698 (DPR 1); máy thật k lớn hơn → napsan.js hạ tầng theo log2(k / k đo) (nạp nét hơn, không bao giờ thô hơn cần).
