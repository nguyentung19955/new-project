# RÀ SOÁT 100% HÌNH VẼ TAY — VÙNG FX (2026-11-05)

Vùng: `thap/js/fx.js, hieuung.js, tiervfx.js, growfx.js, fxu.js, fxu-meta.js, quaianim.js, skills.js…skills5.js (phần vẽ), support.js, skilldemo.js, statthuc.js` — không đổi luật/số của kỹ năng.

**Tổng: 93 thứ vẽ bằng code** → **70 thay bằng PNG ChatGPT có sẵn**, **5 dùng PNG có sẵn tạm (chờ ảnh mới)**, **18 bỏ hẳn** (phần lớn là bản vẽ code dự phòng khi ảnh chưa tải). Ảnh mới cần gen: tờ `raw_p4_fx_1.png` (HINH-VE-CODE-AUDIT.md mục 'Pass 4 — fx').

Cách làm: thêm bộ vẽ **PX** (fxu.js) — mọi vòng / cung / tia / chấm / sao / bóng / thanh máu trong vùng FX chỉ còn là **đặt vị trí / xoay / phóng / mờ / tô màu ảnh PNG** (`fx_vong_mong`, `fx_laser_tia`, `fx_cham_trang`, `fx_tia_sao`, `tai_day`, `fx_vong_trieu`…); cung tiến độ = ảnh vòng + **mặt nạ cắt (clip) vô hình**, dựng sẵn vào bộ đệm. `fxu.js` bỏ 2 lớp ghi đè cũ (ong máy, nón lửa) vì skills5.js đã vẽ thẳng PNG.

Ảnh trước/sau (390×844 DPR 3): `docs/demo-hop-tuong/tuvan/vetay/fx/` — `truoc_*.jpg`, `sau_*.jpg`, `so_*.jpg` (ghép trái = trước, phải = sau). Kiểm thử: `tools/thap-kt-vetay-fx.js` (0 lỗi trang).

| # | Thứ vẽ code (người chơi thấy) | file:dòng | Thay bằng | Trạng thái |
|---|---|---|---|---|
| 1 | Vòng mảnh dùng chung VX.vong (sóng triệu hồi/ghép/nâng sao/hú) | `hieuung.js:49` | fx_vong_mong tô màu (PX.vong) | PNG |
| 2 | Vòng phù văn vẽ code (vongPhu code=true: 2 vòng + 3 cung + 8 vạch) | `hieuung.js:51` | fx_vong_trieu tô màu họ | PNG |
| 3 | Vòng tiến độ grow-up thứ 2 quanh bệ (nền đen + cung + vạch mốc) | `hieuung.js:duoiDau` | — (trùng vòng đo growfx) | Bỏ |
| 4 | Đĩa đen + viền màu sau icon kỹ năng khi ghép | `hieuung.js:331` | h2_vong_xam | PNG |
| 5 | Bóng mềm dưới quái (radial-gradient) | `quaianim.js:20` | fx_cham_trang tô đen (PX.bong) | PNG |
| 6 | Quầng báo chiêu trùm (radial-gradient) | `quaianim.js:~120` | fx_cham_trang tô màu trùm | PNG |
| 7 | Chấm tím thay quái khi ảnh chưa tải | `quaianim.js:~155` | — (không vẽ) | Bỏ |
| 8 | Thanh máu quái (fillRect nền + mức) | `quaianim.js:~172` | tai_day tô đen + tai_day tô màu CẮT theo % (PX.thanh) · chờ thanh_quai | PNG tạm |
| 9 | Thanh máu trùm trên đầu (fillRect) | `quaianim.js:~177` | tai_day (PX.thanh) · chờ thanh_trum | PNG tạm |
| 10 | Dây nét đứt trùm → ụ bị nhắm (setLineDash) | `quaianim.js:~180` | fx_laser_tia tô màu trùm, lặp trượt (PX.tia) | PNG |
| 11 | Nền ô tô màu ụ hỗ trợ (roundRect fill) | `support.js:khungGoc` | — (chỉ còn sup_khung) | Bỏ |
| 12 | Viền strokeRect khi thiếu sup_khung | `support.js:khungGoc` | — (không vẽ) | Bỏ |
| 13 | Ô tối không liên quan (roundRect fill) | `support.js:veHoTro` | o_trong tô tối | PNG |
| 14 | Nhãn viên thuốc + mũi nhọn (roundRect+stroke+tam giác) | `support.js:veHoTro` | nhan_kn | PNG |
| 15 | Lõi màu vệt đạn tỉa (lineTo) | `skills.js:HU.tiaTia` | fx_laser_tia tô màu | PNG |
| 16 | Dây ép xung giữa ụ (lineTo rgba) | `skills.js:~337` | fx_laser_tia tô màu | PNG |
| 17 | Đường ngắm nét đứt Railgun (setLineDash) | `skills.js:~366` | fx_laser_tia trượt | PNG |
| 18 | Tường ánh sáng (linear-gradient + vạch fillRect) | `skills.js:~416` | fx_laser_tia dày tô lục lam + tia_set | PNG |
| 19 | Hố đen dự phòng (gradient + tay xoáy + lõi đen) | `skills.js:~458` | — (hu_hoden đã có) | Bỏ |
| 20 | 5 chấm nhịp dưới bệ (arc fill) | `skills2.js:~598` | fx_cham_trang tô màu | PNG |
| 21 | Vòng tầm lạnh nét đứt Cryo | `skills2.js:veThem` | — (session board đã bỏ, giữ bản board) | Bỏ |
| 22 | Đĩa bóng drone (arc fill) | `skills2.js:~966` | PX.bong | PNG |
| 23 | Cầu vồng dự phòng (6 nét màu) | `skills2.js:~1020` | — (hu_cauvong đã có) | Bỏ |
| 24 | Lưỡi cưa dự phòng (đĩa+răng+vành) | `skills3.js:~66` | — (hu_luoicua đã có) | Bỏ |
| 25 | 2 vòng số nét đứt Combo | `skills3.js:~108` | fx_vong_trieu tô cam, quay ngược | PNG |
| 26 | Nhãn ×N viên thuốc Combo | `skills3.js:~118` | h2_tag + chữ | PNG |
| 27 | Kính lục giác dự phòng Chrono | `skills3.js:~181` | — (hu_khoa đã có) | Bỏ |
| 28 | Vành tiến độ + kim Chrono (arc + lineTo) | `skills3.js:~186` | fx_vong_mong cắt quạt + fx_laser_tia | PNG |
| 29 | Tia Hydra hợp đầu 2 nét stroke | `skills3.js:HU.hydraTia` | fx_laser_tia tô ngọc | PNG |
| 30 | 9 chấm đuôi Cửu Vĩ (arc fill + viền) | `skills3.js:veThem` | fx_cham_trang tô màu | PNG |
| 31 | 6 tia màu Pandora (lineTo) | `skills3.js:~370` | fx_laser_tia tô màu | PNG |
| 32 | Icon Pandora dự phòng (sao 10 cánh / bom arc) | `skills3.js:vePandora` | — (ic_* đã có) | Bỏ |
| 33 | Đĩa Pandora dự phòng (arc fill + viền vàng) | `skills3.js:~412` | — (pandora_dia đã có) | Bỏ |
| 34 | Kim chỉ tam giác trên đĩa Pandora | `skills3.js:~420` | fx_tia_sao | PNG |
| 35 | Vòng dồn thời gian trên quái (arc) | `skills3.js:HU.thr` | fx_vong_mong + cung cắt quạt | PNG |
| 36 | Phủ đỏ toàn màn + sọc VHS (fillRect) | `skills3.js:HU.rewind` | — chờ raw_p4_fx_1 'vhs' | Bỏ · chờ ảnh |
| 37 | Mặt đồng hồ tua ngược (arc + 12 vạch + kim) | `skills3.js:HU.rewind` | fx_khoathoigian_hieu tô đỏ, xoay ngược | PNG |
| 38 | Vệt lùi của quái (lineTo) | `skills3.js:HU.rewind` | fx_laser_tia | PNG |
| 39 | Ký tự ♥ và ◀◀ làm icon | `skills3.js:461/465` | chữ 'LIFE' / bỏ ◀◀ | Bỏ |
| 40 | Vòng ace đỏ Overlord-like (arc) | `skills4.js:62` | fx_vong_mong tô đỏ | PNG |
| 41 | Huy hiệu $ lục giác dự phòng + chữ $ | `skills4.js:~178` | — (ic_truyna đã có) | Bỏ |
| 42 | 2 nửa vành ngày/đêm (arc) | `skills4.js:~222` | fx_vong_mong cắt nửa | PNG |
| 43 | Quạt + cung sóng trăng dự phòng | `skills4.js:~243` | — (hu_trangkhuyet đã có) | Bỏ |
| 44 | Mảnh gương thoi dự phòng | `skills4.js:~301` | — (session board đã bỏ) | Bỏ |
| 45 | Dây rối Marionette (quadraticCurveTo) + vòng | `skills4.js:~386` | đoạn fx_laser_tia theo đường cong + fx_vong_mong | PNG |
| 46 | Ong máy vẽ code (cánh tam giác, thân, mắt) | `skills5.js:veDrone` | fx_chuato_dan / fx_chuato_hieu | PNG |
| 47 | Ngòi chích (lineTo) | `skills5.js:HU.chich` | fx_laser_tia tô màu | PNG |
| 48 | Vệt lao SWARM (polyline) | `skills5.js:HU.ongLao` | đoạn fx_laser_tia | PNG |
| 49 | Vây vạch vàng Leviathan (lineTo) | `skills5.js:veThem` | fx_tia_sao tô vàng | PNG |
| 50 | Nhãn số VỰC (viên thuốc) | `skills5.js:veThem` | h2_tag + chữ | PNG |
| 51 | Xoáy nước 3 cung (arc) | `skills5.js:HU.xoay` | fx_leviathan_hieu xoay | PNG |
| 52 | Tia thở thuỷ triều 2 nét | `skills5.js:~246` | fx_laser_tia tô lam | PNG |
| 53 | 3 vành nét đứt Genesis | `skills5.js:veThem` | fx_vong_trieu tô vàng/hồng | PNG |
| 54 | 8 cánh sen thoi | `skills5.js:veThem` | fx_tia_sao tô vàng | PNG |
| 55 | Cung sáng cong (polyline) | `skills5.js:HU.cungSang` | đoạn fx_laser_tia | PNG |
| 56 | Nón lửa dựng gradient + lưỡi lửa cong (anhNon) | `skills5.js:anhNon` | fx_ronglua_dan (dạng 2/3 tô lửa xanh) | PNG |
| 57 | Rồng lao: cánh, 5 đốt thân, đầu, mắt (lineTo/arc) + bóng | `skills5.js:HU.rongBo` | fx_ronglua_no + PX.bong · chờ 'rong_bay' | PNG tạm |
| 58 | Cột sáng trời cotTroi (linear-gradient stroke) | `growfx.js:18` | 2 lớp fx_laser_tia tô màu | PNG |
| 59 | Sprite g_hoi (quả cầu '?') | `growfx.js:taoSprite` | fx_hopbi_trung | PNG |
| 60 | Sprite g_xi_nong (giọt xỉ) | `growfx.js:taoSprite` | fx_cuuvi_dan | PNG |
| 61 | Sprite g_kim_bang | `growfx.js:taoSprite` | fx_kiembang_dan | PNG |
| 62 | Sprite g_tia_lam | `growfx.js:taoSprite` | fx_bang_dan | PNG |
| 63 | Sprite g_dan_cam | `growfx.js:taoSprite` | fx_cuongno_dan | PNG |
| 64 | Sprite g_dan_do | `growfx.js:taoSprite` | fx_lien_dan | PNG |
| 65 | Sprite g_sao_nho | `growfx.js:taoSprite` | fx_hasao_dan | PNG |
| 66 | Sprite g_sao_choi | `growfx.js:taoSprite` | fx_anhsang_dan | PNG |
| 67 | Sprite g_vong_tim | `growfx.js:taoSprite` | vong_xich | PNG |
| 68 | Sprite g_xi_vang2 | `growfx.js:taoSprite` | fx_haoquang_dan | PNG |
| 69 | Sprite g_kim_ngoc | `growfx.js:taoSprite` | fx_tia_dan | PNG |
| 70 | Sprite g_ho_xanh | `growfx.js:taoSprite` | fx_cuuvi_dan tô xanh | PNG |
| 71 | Sprite g_kim_gio | `growfx.js:taoSprite` | fx_khoathoigian_dan | PNG |
| 72 | Sprite g_vong_ngoc | `growfx.js:taoSprite` | fx_vong_mong tô ngọc | PNG |
| 73 | Vòng đo 3 cung grow-up (nền đen + cung + lớp trắng + đốm chạy) | `growfx.js:veGauge` | fx_vong_mong cắt quạt (chỉ cung tiến độ; bỏ nền + vòng đầy dạng 3) · chờ 'grow_cung' | PNG tạm |
| 74 | Cung nạp kỹ năng chủ động (arc) | `growfx.js:veGauge` | fx_vong_mong cắt quạt | PNG |
| 75 | 6 vệt hút khi biến hình (lineTo) | `growfx.js:veBien` | fx_laser_tia | PNG |
| 76 | 8 gai chớp khi biến hình (lineTo) | `growfx.js:veBien` | fx_tia_sao | PNG |
| 77 | Vết cháy cột sét (arc fill + stroke) | `growfx.js:HU.gXem` | PX.bong + fx_vong_mong | PNG |
| 78 | Tia vàng mảnh 2 nét | `growfx.js:HU.gTiaVang` | fx_laser_tia ×2 | PNG |
| 79 | Sàn lưới lục giác băng (canvas dựng sẵn) | `growfx.js:anhLuoi` | hu_vongbang + fx_lanhgia_hieu · chờ 'luoi_bang' | PNG tạm |
| 80 | Vệt vuốt cung tròn (arc) | `growfx.js:HU.gVuot` | fx_soi_hieu | PNG |
| 81 | Vệt lướt Sói (lineTo) | `growfx.js:HU.gLuot` | fx_laser_tia | PNG |
| 82 | Vòng ngắm + 4 vạch (gTam) | `growfx.js:HU.gTam` | fx_tia_hieu tô màu | PNG |
| 83 | Tâm ngắm đỏ + chấm (gGiao) | `growfx.js:HU.gGiao` | fx_nhieusong_hieu | PNG |
| 84 | Sao 4 cánh lấp lánh (sao5 fill) | `growfx.js:HU.gLap` | fx_tia_sao | PNG |
| 85 | Nổ sao 5 cánh viền + 5 sao nhỏ | `growfx.js:HU.gNoSao` | fx_hasao_trung + fx_tia_sao | PNG |
| 86 | Chuỗi mắt xích tròn (arc) | `growfx.js:veXich` | vong_xich | PNG |
| 87 | Sóng âm 3 cung | `growfx.js:HU.gSong` | fx_nhieusong_dan tô vàng | PNG |
| 88 | Dấu ấn lục giác Hydra | `growfx.js:veLucGiac` | fx_vong_mong + fx_tia_sao | PNG |
| 89 | Vệt kim đồng hồ (nét đứt khi 'ma') | `growfx.js:HU.gKim` | fx_laser_tia (trượt khi ma) | PNG |
| 90 | Dấu đồng hồ (vòng + 12 vạch + kim) | `growfx.js:HU.gDauGio` | fx_st_tua tô vàng | PNG |
| 91 | Hàm dựng hình growfx: quang / sao5 / vienCapsule | `growfx.js:45-47` | — (xoá hàm chết) | Bỏ |
| 92 | Cột mờ 2 bên bàn Test range (fillRect) | `skilldemo.js:~525` | o_trong tô tối | PNG |
| 93 | Hộp nền băng chữ dự phòng (fillRect) | `skilldemo.js:~674` | — (bang_wave_nen đã có) | Bỏ |

## Lệnh vẽ còn lại trong vùng FX (grep) — lý do từng dòng

| file:dòng | lệnh | lý do được phép (QUY-TAC-HINH mục 3) |
|---|---|---|
| hieuung.js:33-35 | createLinearGradient + fillRect `destination-in` | mặt nạ alpha xoá phần vòng elip của ảnh fx_summon/fx_starup (không vẽ ra hình) |
| hieuung.js:42 · support.js:39 · fxu.js:48 | fillRect `color` / `source-atop` | tô màu ảnh PNG (biến đổi ảnh) |
| fxu.js:PX.cung | arc + clip trên canvas đệm | mặt nạ cắt quạt vô hình cho ảnh vòng PNG |
| skilldemo.js:612/628 | arc + clip | mặt nạ cắt tròn chân dung PNG |
| skilldemo.js:620 | fillRect toàn màn (mờ dần 260 ms) | chuyển cảnh tối nhanh, không phải vật thể |
| skills2.js:1009 · skills3.js:176/503 · skilldemo.js:501 | strokeText/fillText | chữ số / chữ (viền chữ) |

Chuỗi `N★` trong mô tả/nhãn nổi (vd `+1★`, `TWIN 5★`) là ký hiệu số sao dạng chữ trong toàn game — chưa đổi (ngoài phạm vi vẽ; cần điều phối quyết nếu muốn đổi thành ảnh `h2_sao`).

Ngoài vùng FX (đã báo session board, session board đã sửa trong cf3191e): vòng màu vai trò quanh ụ, vòng tầm nét đứt, chấm vai trò — `render.js / nhandien.js / buff.js`.
