# Đề xuất tách bản sắc các ụ trùng chức năng (11/11) — CHỈ ĐỀ XUẤT, chưa sửa code

Nguồn: [DS-LAP.md](../tu-van-co-che/DS-LAP.md) (07/11), báo cáo "Đánh giá gameplay Turret Merge", code `thap/js/`. Nguyên tắc (người dùng): game **vừa đủ khó**; mỗi ụ mạnh khi người chơi **xếp/ghép/kết hợp đúng**; không tự động hoá, không gỡ điều kiện. Mỗi đề xuất giữ tên/ảnh/vai của ụ, đổi *lý do để chọn nó*.

## A. Họ làm chậm (chậm không cộng dồn → 2 ụ chậm ≈ 1 ụ)
| Ụ | Vấn đề | Đề xuất (bản sắc riêng, có điều kiện) |
|---|---|---|
| Frost (bang, Trắng) | Đóng băng quái đầu = Chiller/Cryo yếu hơn | **Băng vỡ**: quái đang đóng băng nhận +X% ST từ đòn đầu tiên rồi vỡ băng → thưởng cho việc đặt ụ ST to cạnh Frost (combo người chơi tự tìm). |
| Ice Blade (kiembang, Xanh) | Tự làm chậm rồi tự ăn ×5 → không cần ai | Bỏ phần tự làm chậm diện rộng, giữ ×5 vào quái chậm: **bắt buộc ghép đội** với nguồn chậm khác (Chiller, Blizzard, Eclipse đêm…). |
| Chiller (lanhgia, Xanh HT) | Chậm cho ô kề — trùng Cryo Reactor | Thành **ụ "lạnh dần"**: mỗi đòn của ụ kề cộng 1 tầng lạnh (tối đa 5) → tầng 5 đóng băng 0.5 s rồi về 0; số tầng theo SỐ Ụ KỀ đang bắn → thưởng xếp cụm. |
| Blizzard (baotuyet, Tím) | Chậm toàn bàn, mạnh, không cần xếp | Giữ, nhưng sóng chỉ phủ **hàng/cột** nơi đặt Blizzard trên đường (đoạn đường đi qua hàng/cột đó) → chỗ đặt có ý nghĩa. |
| Chrono Lock (khoathoigian, Tím ĐB) | Khoá quái đầu ≈ Frost | Giữ khoá + **tích ST**; mốc mới: nổ lan cho quái cùng LOẠI trên đường → mạnh với wave đồng loại (quyết định thời điểm chạm). |
| Eclipse (nhatthuc, Vàng) | Đêm = chậm 25% (trùng) | Đêm: thay chậm bằng **đánh dấu** (quái trúng nón nhận +ST từ ụ khác 3 s) → Eclipse là ụ "mở đòn", cần ụ ST đi kèm. |
| Cryo Reactor (lophanung, Đỏ HT) | Hào quang chậm + ST vào quái chậm | Giữ (đỏ, vai trung tâm của họ băng); là nguồn chậm "chuẩn" mà Ice Blade/Frost tận dụng. |
| Chrono Throne (ngaithoigian, Đỏ ĐB) | Chậm dần toàn bàn | Giữ TUA NGƯỢC (bản sắc thời gian); bỏ phần chậm dần thụ động, thay bằng **tích "giây"** khi quái bị chậm bởi ụ khác → TUA NGƯỢC xa hơn. |

## B. Hỗ trợ "+X% cho 4 ô kề"
| Ụ | Vấn đề | Đề xuất |
|---|---|---|
| Star Lift (nangsao) ≈ Radar | Cả hai +tốc ô kề | Star Lift thuần **nâng sao**: mỗi N giây +1★ cho ụ kề sao THẤP NHẤT (không lên quá sao Star Lift) — công cụ ghép, không còn buff tốc. Radar giữ +tốc. |
| Focus Lens (thaukinh) ≈ Hammer (bua) | Cả hai +chí mạng | Focus Lens buff theo **HÀNG** (cả hàng, không chỉ kề) nhưng chỉ ụ CÙNG LOẠI trong hàng → thưởng xếp hàng đồng loại; Hammer giữ "chí mạng làm khựng" cho ô kề. |
| Crit Antenna (chimang) | +tỉ lệ chí mạng thuần chỉ số | Giữ là bản "sơ cấp" (Xanh); thêm mốc 7★: ụ kề chí mạng lần đầu mỗi wave chắc chắn → nhắm trùm. |
| Fusion Mixer (tron) | +tốc theo số loại khác nhau | Giữ (đã có điều kiện đa dạng loại) — làm rõ trên thẻ "càng nhiều loại khác nhau trong hàng+cột càng mạnh". |

## C. "Cho ụ miễn phí"
| Ụ | Vấn đề | Đề xuất |
|---|---|---|
| Cloner (nhanban) ≈ Twin Maker (sinhdoi) | Cả hai: ghép → thêm ụ | Cloner: bản sao xuất hiện ở ô **đối xứng** qua tâm bàn (nếu trống) → người chơi tính chỗ trống. Twin Maker giữ "cùng sao", chỉ khi ghép **cùng hàng** (điều kiện xếp). |
| Mystery Box (hopbi) | Chờ 58 s → ngẫu nhiên | Giữ; cho phép "mở sớm" bằng cách ghép 1 ụ vào hộp (ụ đó mất, sao ra = sao ụ ghép +1) → quyết định đánh đổi. |
| Lighthouse (anhsang) | Định kỳ triệu hồi 1★ | Quả cầu chỉ triệu hồi loại ụ **đang kề Lighthouse nhiều nhất** → xếp để chọn loại. |
| Evolver (tienhoa) | Đếm giờ thành ụ ngẫu nhiên | Giữ (đã có trứng cháy 7★ + tái chế mana). |

## D. Bắn lan / nảy
| Ụ | Vấn đề | Đề xuất |
|---|---|---|
| Tesla (set, Trắng) | Lan N quái | Giữ là bản cơ bản. |
| Storm Gun (bao, Tím) | Nảy ngẫu nhiên (đã: +5%/Súng Bão kề) | Giữ hướng "cụm Súng Bão" — thêm mốc 3 Súng Bão thẳng hàng: nảy chắc chắn 1 lần → thưởng xếp. |
| Ricochet (nayda, Tím) | Nảy N lần mạnh dần | Nảy **chỉ sang quái khác loại** (mỗi lần đổi loại +ST) → mạnh với wave hỗn hợp, yếu với bầy đồng loại. |
| Thác Mana (Đỏ) | Nảy tới 8 quái theo mana giữ | Giữ (đối lập Pháo Năng Lượng — xem dưới). |
| Pháo Năng Lượng (nangluong, Xanh) | Cùng ăn "mana đang giữ" với Thác Mana; late game luôn ở trần | Đổi thành mạnh theo **mana ĐÃ TIÊU trong wave** → khuyến khích tiêu, đối lập Thác Mana khuyến khích giữ. |

## E. 6 ụ chỉ có tác dụng PVP/Co-op (Solo ≈ 0)
| Ụ | Vấn đề | Đề xuất |
|---|---|---|
| Shield Gen, Reaper Pillar, Jammer, Scrambler, Signal Jammer, Mirror Gate | Bẫy cho người chơi Solo | (1) Nhãn **PVP** trên thẻ + cảnh báo khi đưa vào bộ Solo; hoặc (2) hiệu ứng Solo nhỏ cùng chủ đề: Jammer/Signal Jammer → làm nhiễu **tinh anh/trùm** (hoãn chiêu trùm 1–2 s); Scrambler → đảo vị trí 2 quái trên đường; Mirror Gate → phản 1 chiêu trùm; Shield Gen → khiên chặn 1 lần mất tim; Reaper Pillar → kết liễu quái dưới X% máu. |

Ưu tiên gợi ý: E(1) nhãn PVP (rẻ, hết bẫy) → B Star Lift / Focus Lens → A Ice Blade / Eclipse / Frost → C Cloner → D Ricochet / Năng Lượng.
