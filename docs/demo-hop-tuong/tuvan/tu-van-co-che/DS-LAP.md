# Danh sách ụ "lặp / nhạt" cần làm lại cơ chế (07/11/2026)

Nguồn: bảng 93 ụ trong [BRIEF.md](../tu-van-game/BRIEF.md), bảng họ băng [BANG-BANG.md](../tu-van-bang/BANG-BANG.md), code `thap/js/` (text.js, data.js, skilldemo.js). Số LV9.
Người dùng (07/11 19:55): *"Nhiều ụ chỉ làm chậm → không hay. Muốn kỹ năng về CÁCH GHÉP, CHỖ ĐẶT, LIÊN KẾT giữa các ụ, cùng 1 ụ mà mỗi bản một cơ chế (như Sói thường / thức tỉnh) — người chơi phải nghĩ cách tối ưu."*

Lý do "lặp": làm chậm KHÔNG cộng dồn (mỗi quái chỉ giữ giá trị chậm lớn nhất), nên 2 ụ chậm ≈ 1 ụ; hỗ trợ "+X% cho 4 ô kề" chỉ khác chỉ số; ụ "cho ụ miễn phí" chỉ là kinh tế ngẫu nhiên; 3 ụ bắn nảy/lan gần như giống nhau.

## A. Họ BĂNG / CHẬM / THỜI GIAN (danh tính = làm chậm)
| id | Tên | Bậc | Vai | Luật hiện tại (rút gọn) |
|---|---|---|---|---|
| bang | Frost | Trắng | Đặc biệt | mỗi 6 s đóng băng quái đầu 2 s (trùm 0.6 s), sau đó chậm 30% 2 s; không gây sát thương |
| kiembang | Ice Blade | Xanh | Tấn công | ×5 ST vào quái bị chậm (3★ ×6, 7★ ×8); mỗi đòn làm chậm 20% quanh 44 px |
| lanhgia | Chiller | Xanh | Hỗ trợ | đòn của 4 ô kề làm chậm 12→28%; 5★ +ST vào quái chậm; 7★ mỗi 8 s 1 đòn đóng băng 0.8 s |
| baotuyet | Blizzard | Tím | Tấn công | chu kỳ 4–11 s: chậm TẤT CẢ quái 30–60% 3 s + đánh 150% + đóng băng quái nhỏ |
| khoathoigian | Chrono Lock | Tím | Đặc biệt | khoá quái đầu 1.2–2.5 s, tích ST, nổ 40–95% ST đã tích |
| nhatthuc | Eclipse | Vàng | Tấn công | đổi mỗi 8 s: NGÀY tia đốt / ĐÊM sóng nón làm chậm 25% |
| lophanung | Cryo Reactor | Đỏ | Hỗ trợ | hào quang chậm 20–40%; ụ Tấn công kề +ST vào quái chậm; chạm: đóng băng vùng 2.5 s |
| ngaithoigian | Chrono Throne | Đỏ | Đặc biệt | mọi quái chậm dần 1%/s tới 35%; 3★ chạm: TUA NGƯỢC 15–30% đường + ×6 ST |

## B. Hỗ trợ "+X% cho 4 ô kề" (chỉ khác chỉ số)
| id | Tên | Bậc | Luật hiện tại |
|---|---|---|---|
| bua | Hammer | Trắng | ụ TC kề +tỉ lệ & +ST chí mạng; chí mạng làm khựng |
| chimang | Crit Antenna | Xanh | 4 ô kề +6.8→22.5% tỉ lệ chí mạng |
| radar | Radar | Xanh | 4 ô kề +18→42% tốc bắn (đã được duyệt jackpot PERFECT FREQUENCY) |
| tron | Fusion Mixer | Xanh | ụ TC kề +9% tốc, +3% mỗi loại TC khác trong hàng+cột |
| nangsao | Star Lift | Tím | 4 ô kề +10%/★ tốc (ụ sao thấp nhất ×1.5, tối đa +50%) — trùng Radar |
| thaukinh | Focus Lens | Tím | ô kề +ST chí mạng, chí mạng xuyên — trùng Hammer |

## C. Ụ "cho ụ miễn phí" (kinh tế ngẫu nhiên, ít quyết định)
| id | Tên | Bậc | Luật hiện tại |
|---|---|---|---|
| nhanban | Cloner | Tím | ghép → thêm 1 ụ 1★ (ghép 3★ → 2★) |
| sinhdoi | Twin Maker | Vàng | ghép → thêm 1 ụ cùng sao (10%+ cao hơn 1★) |
| tienhoa | Evolver | Vàng | đếm giờ rồi thành ụ ngẫu nhiên +1★ |
| hopbi | Mystery Box | Tím | sau 58 s thành ụ ngẫu nhiên 1–6★ |
| anhsang | Lighthouse | Tím | quả cầu sáng định kỳ triệu hồi ụ 1★ |

## D. Ụ bắn lan / nảy giống nhau
| id | Tên | Bậc | Luật hiện tại |
|---|---|---|---|
| set | Tesla | Trắng | sét lan N quái (N = sao) |
| bao | Storm Gun | Tím | đòn tức thì có thể lan; bắn chậm hơn khi đứng cạnh ụ cùng loại |
| nayda | Ricochet | Tím | đĩa nảy thêm N lần (N = sao), mỗi lần mạnh hơn |

## Giữ nguyên (đã có cơ chế quyết định / đã duyệt jackpot)
Ember Relay, Chain Link, Railgun, Combo Core, Quantum Choir (Grand Chorus), Scrap Forge (Masterwork), Orbital (Cascade), Prism Thief (Chromatic Heist), Compass Cannon (True North), Blood Circuit (Blood Eclipse), Pandora (Six Seals), Werewolf, Lone Ace, Resonance Grid, Merge King, Copycat, Mimic, Teleporter.
