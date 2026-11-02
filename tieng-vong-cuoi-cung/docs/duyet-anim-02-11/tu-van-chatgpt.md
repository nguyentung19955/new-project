# Tư vấn ChatGPT – duyệt animation 02/11 (17 nhóm)

Đi kèm bảng số đo tự động: thong-ke.md. Ưu tiên: P0 = sửa ngay, P1 = nên sửa, P2 = giữ/tinh chỉnh.

## Nhóm 1 – Kiếm Khách di chuyển (ChatGPT)
Quy tắc chung: khoá gốc chân (128,172); tách dịch chuyển của game khỏi hình; đo trượt chân chỉ ở pha chân chạm đất; ms nên là bội của 16,67ms (1 khung 60fps) hoặc engine dùng bộ tích luỹ thời gian; đổi ms không sửa được trượt chân do hình.
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| troi (chạy) | Nguy cơ giật/trượt cao: thân lên xuống 18%, chân trụ trượt 8,7% | Căn lại gốc chân từng khung theo chân trụ; kiểm tra đối xứng F1↔F5, nối F8→F1; sửa độ cao đầu/hông bất thường; sau đó thử 8×83ms (5 tick); còn giật thì vẽ lại riêng khung chuyển pha | P0 |
| luot (lướt) | Dễ giật ở đoạn ra: từ thấp bật đứng trong 1 khung | Thêm 1–2 khung đứng dậy trung gian; giữ 2–3 khung lao (hold có chủ ý); thử 33/33/50/50/50/67ms | P0 |
| tiepdat | Snap khi đứng dậy (y 3,9%, cao 19%), 2 khung đầu trùng | Căn điểm chạm chân; thêm khung đứng dậy; thử 33/50/83ms | P0 |
| nhay | 2 khung cuối trùng, nhịp đều 70ms | Thử 50/67/83/83ms; chỉnh khung trung gian; kiểm tra nối nhay→roi | P1 |
| nhaydoi | Dùng chung hình nhảy → khó đọc cú bật thứ 2 | Vẽ cú bật giữa không riêng (co gối, đá lên, tóc bật) hoặc thêm VFX nhỏ; 4×67ms | P1 |
| roi | 1 khung tĩnh, hơi cứng khi rơi lâu | Giữ 1 khung, hoặc thêm 2–3 khung tóc/áo bay nhẹ | P1 |
| leoday | Cần kiểm tra nhịp tay–chân, đổi cao 22% | Đặt gốc ở trục dây; bỏ dịch dọc thừa trong hình nếu game tự dịch | P1 |
| dung, bamtuong, luon, treoday | Ổn | Giữ nguyên; treoday nếu lắc cứng thì thêm khung giữa | P2 |

## Nhóm 2 – Kiếm Khách đòn đánh (ChatGPT)
Ý chính: khung trùng không mặc nhiên gây giật (giữ dáng 50–100ms tạo lực), lỗi là khi VỆT KIẾM đứng im 2 khung hoặc chuyển dáng quá đột ngột. Không tự đổi ms nếu hitbox/cancel đang dùng mốc cũ.
| Clip | Kết luận | Cách sửa (ms thử A) | Ưu tiên |
|---|---|---|---|
| dapdat | Khựng rõ F3→F4 (đảo người → chạm đất 1 bước); gai cyan F5–F10 kéo dài | Thêm 1 khung chuyển giữa F3–F4 (thân gần ngang, chân hướng đất); gai đỉnh F5–F7 rồi thu; ms 55,55,45,45,45,45,50,55,55,55,55,55,70,80 (765) | P0 |
| don4 | F4→F5→F6 đổi hình mạnh; chân trượt 10%; F6≈F7≈F8 vệt đứng hình | Khoá chân F0–F4; thêm 1–2 khung giữa (kiếm 1/3 và 2/3 quỹ đạo); F7–F8 vệt mảnh dần; ms 60,65,50,40,35,65,55,60,80 (510) | P0 |
| chemkhong | F2→F3→F4 xoay "nhảy ảnh" | Thêm 1 khung xoay giữa F2–F3 (và F3–F4 nếu cần); ms 50,50,45,50,50,65,70 | P0 |
| don1 | F3≈F4: vệt kiếm đứng 115ms | F4 cùng dáng nhưng vệt mỏng/đứt; ms 65,60,45,65,45,45,55,65 | P1 |
| don2 | F3≈F4 lặp cung sáng | F4 vệt mỏng kéo đuôi; ms 60,65,45,65,40,45,60,65 | P1 |
| don3 | F1≈F2 chờ, F3≈F4 hitstop dài | ms 65,65,40,70,40,60,65,65; thêm khung giữa đường chéo nếu kiếm nhảy xa | P1 |
| cheolen | Như don2, trên không | ms 60,60,45,65,40,50,65,65; F4 vệt mờ dần | P1 |
| cheoxuong | Như don3, trên không | ms 65,65,40,70,40,60,65,65 | P1 |
| chemday | Ổn (IoU .70) | Neo tay bám cố định; ms 75,50,65,50,65,90 | P1 có điều kiện |
| chemtuong | Ổn (IoU .73) | Neo tay/chân bám tường; ms 65,50,65,50,65,80 | P1 có điều kiện |
Thứ tự làm: don4 → dapdat → chemkhong → tay neo chemday/chemtuong → fade/hold don1–3, cheolen/cheoxuong.

## Nhóm 3 – Kiếm Khách trúng đòn / hồi máu / chết (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| chet | Không đạt: F1→F2 đổi dáng lớn mà giữ 130ms; F2≈F3 khựng giữa lúc ngã; F3→F4 "bị kéo xuống"; F5≈F6 kéo dài | Thành 8 khung: thêm 1 khung khuỵu gối/hạ hông giữa F3–F4; sửa F3 cho khác F2; ms 50,67,67,67,83,100,100,200 (~734); sau đó giữ khung cuối (không lặp); căn theo điểm chạm đất | P0 |
| trungdon | Chưa mượt: F1≈F2 mất nhịp va chạm, F3≈F4 dừng giữa phản ứng | Vẽ lại F2 (ngực bật lùi, tóc văng) và F4 (hạ hông, đầu hồi); ms 33,33,50,50,67,67 (300); khoá chân F5–F6 | P1 |
| hoimau | Dùng lại khung đứng → không thấy hành động hồi máu | Chỉnh nhẹ 4 dáng (cúi đầu tập trung → khung 3 kích hoạt) + VFX hổ phách riêng (hạt tụ vào ngực, vòng sóng đồng, loé ở F3); ms 150,200,250,150 | P1 |
Thứ tự: chết → trúng đòn → hồi máu.

## Nhóm 4 – Phu Đèn Lạc (phòng demo) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| fx_danh | Màu đẹp nhưng không khớp đòn: vòng lửa bùng ở F6–F7 như phép riêng | Lửa kéo theo đèn F4–F5, đỉnh ở điểm đánh F6, tàn F7–F8, tắt hẳn F9; bớt vòng tròn; ms 50×4, 67×5 | P0 |
| chet | Đoạn ngã F8–F9 nằm xuống đột ngột, trượt chân 8,8% | Thêm/sửa dáng chống tay ở F7; ms 83,83,83,100,100,117,117,117,100; giữ khung cuối | P0 |
| danh | Thiếu điểm nhấn va chạm, F1–F3 gần dáng đứng, trượt chân 5,2% | ms 100,83,67,67,50,83,83,100,100; F5 là điểm đánh; khoá chân | P1 |
| trung | Phản ứng chưa rõ, ánh vàng kéo dài | ms 33,33,50,50,50,50,50,67,67; giật vai/đầu ở F3–F4 | P1 |
| dung | Khá mượt nhưng F2–F4 có vệt trắng lạ trước mặt | Xoá vệt trắng | P1 |
| di | Mượt, hơi chậm | 9×83ms | P1 |

## Nhóm 5 – Bọ Vỏ Mộc (phòng demo) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| chet | HỎNG: ảnh chết đang là bản sao y hệt đòn đánh (đã xác nhận trùng file) – bọ không hề ngã | Vẽ lại 9 khung: giật mạnh → chân trước khuỵu → vỏ nghiêng → đổ nghiêng → chạm đất bụi → chân co giật → nằm yên; ms 60,65,70,80,90,90,100,120,180; giữ khung cuối | P0 |
| danh | Thiếu lực, khung đầu/cuối giống đứng | Hạ đầu lấy đà F0–F2, húc nhanh F3–F4, va chạm F5; ms 100,100,65,70,60,65,75,90,110; nếu thiếu dáng húc thì vẽ lại F3–F5 | P1 |
| di | Khó thấy chân nào chạm đất, thân nhấp nhô 17% | Chia 6 chân thành 2 nhóm bước xen kẽ, giữ điểm chạm; ms ~90 | P1 |
| trung | Khá tốt | ms 40,45,55,45,45,45,45,45,50 | P2 |
| dung | Khá mượt, hơi rung | Giảm nhấp nhô 1–2px | P2 |
| fx_danh | Chưa có ảnh để duyệt | Đồng bộ với khung húc | – |
Lưu ý: số "trượt chân" 10–16% của bọ 6 chân không chắc là trượt thật (đo theo pixel thấp nhất).

## Nhóm 6 – Dơi Rễ (phòng demo) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| chet | Giật nặng F6→F7: đang rơi giữa không trung → nằm sát đất trong 1 bước | Thêm 2 khung rơi giữa F6–F7 (thân hạ dần, cánh gập; gần chạm đất, cánh chạm trước); 11 khung ms 67,67,67,67,67,50,50,50,67,83,150; giữ khung cuối | P0 |
| danh | Đọc được nhưng chuẩn bị lâu, ra đòn chưa sắc | ms 67,83,83,50,50,50,67,83,100; F7 là dáng đánh rõ nhất | P1 |
| fx_danh | Chưa có ảnh | Neo vào điểm đánh, nở nhanh rồi tan | P1 |
| dung | Khá mượt | Giữ; kiểm tra nối F9→F1 | P2 |
| di | Thân nhấp nhô hơi mạnh (17%) | ms 83,83,83,67,83,83,83; giảm dao động dọc thân | P2 |
| trung | Phản ứng đến muộn (3 khung đầu như đứng) | Bỏ F2 hoặc F3; 8 khung ms 33,33,50,50,50,50,67,67 | P2 |

## Nhóm 7 – Nấm Thở (phòng demo) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| danh | Mượt nhưng KHÔNG đọc được là đang đánh (chỉ nghiêng đầu nhẹ, cao đổi 4%) | Vẽ lại F3–F7: mũ co tích lực → nghiêng tới → F5 phun bào tử mạnh → giật lùi; ms 120,100,100,67,50,67,83,100,100 | P0 |
| chet | F1–F4 gần đứng yên rồi F5→F6 nằm ngang đột ngột | Thêm dáng gập thân/khuỵu giữa F5–F6; ms 83,83,83,100,100,117,117,117,100; giữ xác | P0 |
| di | Mượt nhưng gần như đứng nhún, F1≈F2 | Làm rõ 2 pha bước (F1, F5 đối chân); 9×100ms | P1 |
| trung | Thiếu lực, ánh vàng xuất hiện muộn (F7–F8) | Đưa loé về đầu clip; ms 33,33,33,50,50,50,50,50,67 | P1 |
| dung | Khá mượt, thân nhún hơi mạnh (18%) | Khoá chân, chỉ cho mũ phồng/xẹp; giảm biên độ 20–30% | P1 |
| fx_danh | Chưa có ảnh | Bào tử phát ra từ mũ, tụ → bùng → tan | P1 |

## Nhóm 8 – Chuông Kén Nứt (tinh anh phòng demo) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| di | Vòng lặp giật ở F8→F0 (thân + tua khác hẳn) | Vẽ lại F8 gần F0 hơn hoặc thêm 1 khung nối; 9×110ms | P0 |
| danh | F4≈F5 giữ rồi F5→F6 bùng mạnh (tâm nhảy 11,5%) | Thêm 1 khung giữa F5–F6 (vỏ mở nửa, tua hất, điểm phát sáng); ms 100,100,100,90,80,60,80,100,120 | P0 |
| fx_danh | Sóng âm bùng đột ngột F5→F6 | Thêm vòng trung gian ~70% bán kính; ms 55,55,55,55,50,50,65,60,65; đồng bộ với pha phát lực | P1 |
| chet | Diễn biến tốt nhưng F6→F7 rơi xuống đất như dịch chuyển | Thêm 1 khung chạm đất (vỏ ép thấp, tua xoè); ms 100,100,90,90,85,85,75,110,180 | P1 |
| trung | Khá ổn, phản lực hơi yếu | ms 40,45,50,45,45,45,45,45,45 | P2 |
| dung | Khá mượt | Giữ | P2 |

## Nhóm 9 – Khuyết Cẩu (Vùng 1) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| danh | Chưa đạt: chân trượt 15,4% – trông như bước tới cắn chứ không phải đứng há mõm bắn; nhịp không đều | Khoá chân trụ; F3 hạ cổ tích năng lượng, F4–F5 há mõm, F6 nhả cầu, F7 giật lùi, F8–F9 hồi; ms 67,83,100,67,50,50,67,83,100 | P0 |
| chet | F1–F4 đứng chờ lâu, F5→F6 gục nhanh | ms 67,67,67,83,83,83,100,117,150; khuỵu sớm hơn; thêm 1 khung nếu F5→F6 giật | P1 |
| di | Khá mượt, trượt chân 5,6% | Khoá chân trong pha chống; 9×67ms | P2 |
| trung | Phản ứng đến muộn | ms 33,33,50,50,50,50,50,67,67; rõ giật đầu/vai ở F2 | P2 |
| dung | Tốt | Giữ | P2 |

## Nhóm 10 – Vọng Tàn (tinh anh Vùng 1) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| di | Lỗi nặng nhất nhóm: trôi chân 22,4%, đáy nhấp nhô 18,8% – như vừa bước vừa nhảy | Căn lại từng khung theo chân/rễ chạm đất; 2 pha chống chân rõ, chuông đung đưa nặng; sửa/vẽ lại khung chuyển trọng lượng sai; 9×117ms | P0 |
| danh | Đọc được ý nhưng thiếu lực, không có khung va chạm sắc; dáng thấp kéo dài | ms 133,117,100,83,50,67,100,117,133; chọn đúng khung chuông chạm đất làm impact và cho sóng ra đúng khung đó; khoá chân; thêm khung chuông giữa đường nếu F4→F5 gắt | P0 |
| chet | Ngã đọc được nhưng trượt ngang 22,8% | Căn điểm chạm đất; chuông không xuyên sàn; ms 100×4, 117×5 | P1 |
| trung | Phản ứng yếu | ms 33,33,33,50,50,50,50,50,67; vai giật, chuông rung trễ | P1 |
| dung | Khá mượt | Khoá chân | P2 |
Ghi chú: vật nặng → thân đi trước, chuông/rễ theo sau; đập nhanh, hồi chậm.

## Nhóm 11 – Hồn Vải (Vùng 1) (ChatGPT)
Phán quyết: chưa chốt. Quái bay: không khoá chân; IoU thấp do vải bay không mặc nhiên là giật.
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| chet | Rơi đột ngột F6→F7 (IoU 0,24, cao giảm 73%) – teleport 1 khung | Thêm 1 khung giữa F6→F7 (thân lưng chừng, mặt nạ nghiêng, vải gập); ms 90,90,85,85,80,80,80,110,160; nếu engine cho rơi bằng trọng lực thì sprite chỉ biến dạng khi chạm đất | P0 |
| danh | Chưa rõ lúc bắn sóng âm; F5≈F6 giữ lâu | ms 100,100,90,90,80,65,65,90,110 (790); cần thì vẽ lại F4–F6 (co vải → mặt nạ chĩa → giật lùi) | P1 |
| trung | Đọc được, hơi nhẹ | ms 40,45,50,45,45,45,45,45,45 | P2 |
| di, dung | Ổn | Giữ; kiểm nối vòng F8→F0 | P2 |

## Nhóm 12 – Kèn Câm (Vùng 1) (ChatGPT)
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| danh | Chuẩn bị quá lâu, lúc bắn chỉ 70ms; đường nâng kèn F4→F6 chưa liền | ms 67,83,100,83,67,67,50,83,100 (700); khoá chân; đạn ra đúng miệng kèn ở F7; giật lùi F8; nếu F4→F5/F5→F6 giật thì thêm 1 khung nâng kèn | P0 |
| chet | Đầu clip giữ lâu, ngã F5→F6 quá nhanh; trượt chân 9% | ms 67,67,67,83,83,83,100,117,150 (817); giữ khung cuối; cần thì thêm khung khuỵu gối giữa F5–F6 | P1 |
| di | Chân hơi trượt 4,6% | ms 9×100; khoá chân chống đất | P2 |
| trung | Khá | ms 33,33,50,50,50,50,50,67,67 | P2 |
| dung | Khá | Giữ 9×130 | P2 |

## Nhóm 13 – Màn Tang (Vùng 1) (ChatGPT)
Quái treo trần: thân đi trước – vải kéo theo – dao động tắt dần; khoá điểm treo, không căn đáy.
| Clip | Kết luận | Cách sửa | Ưu tiên |
|---|---|---|---|
| chet | Lỗi nặng: F3→F4 IoU 0,15 – từ treo nhảy thẳng xuống nằm bẹp | Thêm tư thế đang rơi giữa không trung (F3–F5); ms 67,67,67,83,100,117,117,133,133; tốt nhất tách tuột → rơi (engine trọng lực) → chạm đất | P0 |
| danh | Giật F6→F7 (IoU 0,36) | Thêm 1 khung lao nửa đường giữa F6–F7; ms 100,100,100,83,67,50,50,83,117 (750) | P0 |
| trung | Phản ứng yếu | ms 33,33,33,50,50,50,50,50,67; giữ điểm treo | P1 |
| di, dung | Khá mượt | Giữ 9×110 / 9×130; engine điều khiển gốc treo | P2 |

## Nhóm 14–17 – Hiệu ứng (VFX) (ChatGPT)
Quy tắc: IoU thấp ở VFX không đồng nghĩa giật; khung cuối gần trống là cách kết thúc hợp lệ. Chưa có lỗi P0.
| Hiệu ứng | Kết luận | Cách sửa (ms thử) | Ưu tiên |
|---|---|---|---|
| ken (14) | F3 chạm mép (bị cắt) | Mở rộng khung/đệm, không ép nhỏ; 50,55,65,65,60,65 | P1 |
| tan (14, sóng đất Vọng Tàn cũ) | F3 chạm mép | Tăng vùng chứa theo hướng lan; 55,60,65,70,60,50 | P1 |
| ken_tron (14, đạn Kèn Câm) | Tâm quả đạn đổi 19%/12% → nguy cơ chuyển động kép khi engine cũng dịch đạn | Khoá tâm quả cầu, chỉ cho đuôi/quầng đổi; tốt nhất tách sinh đạn → bay lặp → nổ | P1 |
| cau, cau_tim, vai, vai_nhat, tang, ken_tu, bui_tuong (14) | Đạt / đạt có điều kiện | Giữ; chỉnh nhẹ ms | P2 |
| ngang, cung, cheo, no (15, trúng đòn) | Đạt có điều kiện | Giữ 6 khung; ms ngang 35,45,55,55,55,55; cung 40,50,60,55,50,45; cheo 35,50,60,55,50,50 (bớt trắng nếu che nhân vật); no 40,50,60,55,50,45 | P2 |
| nut_dat, song_dat, re_troi (16) | Chạm mép; song_dat tâm nhảy 14,6% | Thêm đệm, neo gốc ở mặt đất, kiểm tra không dịch kép | P1 |
| bao_quet, vet_quet (17) | F0 chạm mép | Thêm đệm theo hướng quét | P1 |
| dich_mat_na, cot_song, day_vai (17) | Đạt | dich_mat_na cần mờ dần bằng engine thay vì tắt ngay | P2 |

## Đã làm (02/11, mức 1 – không đụng hình nhân vật)
- Nhịp từng khung của Kiếm Khách theo đúng số ms ChatGPT đề xuất: nhảy, nhảy đôi, tiếp đất, lướt, trúng đòn, hồi máu, chết, đập đất, đòn 1–4, chém chéo lên/xuống, chém trên không, chém khi bám dây/tường (cả 3 cấp).
- Các clip chạy theo tỉ lệ (lướt, trúng đòn, nhảy, tiếp đất) nay cũng tôn trọng ms từng khung (trước chia đều).
- Hiệu ứng hồi máu khớp lại mốc cộng máu mới.
## Còn lại (cần ChatGPT/PixelLab vẽ thêm khung chuyển – chờ người dùng đồng ý)
- Kiếm Khách: đòn 4, đập đất, chém xoay, chết, lướt, tiếp đất, trúng đòn (khung giữa).
- Quái: chết của Hồn Vải, Màn Tang, Kèn Câm, Dơi, Chuông Kén…; Màn Tang vồ; Kèn Câm bắn.
- VFX: thêm đệm cho các dải chạm mép, khoá tâm đạn Kèn Câm.
