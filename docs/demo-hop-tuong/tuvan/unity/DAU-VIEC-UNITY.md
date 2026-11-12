# ĐẦU VIỆC CHUYỂN ASTRAL ARSENAL SANG UNITY (thống kê 12/11/2026 16:30 — người dùng chốt: chuyển HẾT sang Unity)

Đọc kèm `KE-HOACH-UNITY.md` (quyết định kỹ thuật, rủi ro). Số liệu lấy từ nhánh `claude/demo-hop-tuong` tại `678c8e822`: 113 file JS / ~39 400 dòng, 1 912 file trong `thap/assets`, ~98 ụ, 12 trùm.
Cột "Nơi làm": **L** = làm được trên máy Linux của Claude (không cần Unity Editor) · **W** = phải làm trên máy Windows có Unity (Claude chỉ làm được khi phiên nối vào máy đó) · **N** = người dùng.

## A. Môi trường (làm 1 lần)
| Mã | Việc | Nơi làm |
|---|---|---|
| A1 | Unity Hub + Unity 6.3 LTS, module Windows Build (iOS/Android để sau) | N/W |
| A2 | Project 2D URP, IL2CPP; cấu trúc thư mục `Core/` (C# thuần) · `Game/` (Unity) · `Editor/` (script dựng) | W |
| A3 | Kho git riêng cho project Unity (`.gitignore` Unity, Git LFS cho ảnh/âm thanh) | N/W |
| A4 | Nối Claude với Unity Editor (MCP for Unity) để Claude tự Play, chụp ảnh, đọc log | W |
| A5 | Script Editor: nhập ảnh → Sprite Atlas theo nhóm, ASTC, Tight Mesh | L viết · W chạy |

## B. Xuất dữ liệu từ bản web (làm ở repo web, không cần Unity)
| Mã | Việc | Nơi làm |
|---|---|---|
| B1 | Công cụ xuất `data.js` → JSON: bậc, luật, quái, trùm, chỉ huy, wave theo chủ đề, bố cục bàn, bảng cấp thẻ, cấp kỹ năng | L |
| B2 | Xuất chữ EN + VI (`text.js`, `ngonngu-vi.js` 5 800 dòng) → bảng dịch | L |
| B3 | Xuất bảng kinh tế: rương, khe rương, gacha, QUESTS, EVENT, SHOP, cúp PVP, thưởng Race Track / Raid / Push, cấp phi công | L |
| B4 | Danh mục ảnh theo chủ (đã có `THONG-KE-HIEU-UNG.json`: 98 ụ/1 231 ảnh, 12 trùm/94, 253 dùng chung) + khung hình/animation (`quaianim.js`, `anim.js`) | L |
| B5 | "Đề thi mẫu": chạy bot web (`tools/thap-bot-tran.js`) cho 32 bộ bài × nhiều hạt, lưu BĂM TRẠNG THÁI theo wave | L |

## C. Lõi luật C# (thuần, tất định, chạy `dotnet test`)
| Mã | Việc | Nguồn web | Nơi làm |
|---|---|---|---|
| C1 | RNG có hạt, vòng lặp trận, bàn/ô, mana, triệu hồi, ghép thường | `game.js` (1 071 dòng), `data.js` | L |
| C2 | Luật ghép đặc biệt + kéo đường (Merge King, Compass, Prism, Copycat, Twin Anvil…) | `game.js`, `keoghep.js`, `skills2.js` | L |
| C3 | Kỹ năng ~98 ụ | `skills.js` … `skills7.js` (~5 200 dòng), `vangmoi1.js`, `nongskill.js` | L |
| C4 | 12 trùm + xích/băng/hoá đá | `trum.js` | L |
| C5 | Quái thường + 4 quái mới, wave chủ đề, máu theo wave, hậu kỳ | `data.js` | L |
| C6 | Chỉ huy (MAVUONG), cấp thẻ, hệ số sao | `data.js` | L |
| C7 | Chế độ: Co-op, PVP + cúp, Race Track, Raid, Push, Tutorial | `chedo-*.js` | L |
| C8 | Bộ so băm với B5 — lệch = lỗi dịch | — | L |

## D. Trận đấu nhìn thấy (Unity)
| Mã | Việc | Nguồn web | Nơi làm |
|---|---|---|---|
| D1 | Bàn, đường đi, bố cục co-op / PVP / 1 bàn | `render.js`, `data.js boCuc` | W |
| D2 | Ụ: bệ, đầu, dạng đặc biệt, sao 1–7★, trạng thái | `render.js`, `hud2.js` | W |
| D3 | Quái + trùm + animation | `quaianim.js`, `trumvfx.js` | W |
| D4 | Đạn, hiệu ứng kỹ năng (1 578 ảnh hiệu ứng), ghép, lớn lên | `hieuung.js`, `sigfx.js`, `dosig.js`, `growfx.js`, `ghepfx.js`, `vfxmoi.js`, `fxu.js` | W |
| D5 | Điều khiển: chạm–chạm, kéo–thả, gợi ý ghép, dải thông tin ụ | `ui.js`, `dkcham.js`, `dkkeo.js` | W |
| D6 | HUD trận, thẻ nâng cấp, tốc độ 1–3×, tạm dừng, kết quả trận | `ui.js`, `hud2.js` | W |
| D7 | Cảnh thử hiệu năng (mật độ wave 70, 3×) + nhãn FPS/bộ nhớ | — | W |

## E. Ngoài trận
| Mã | Việc | Nguồn web | Nơi làm |
|---|---|---|---|
| E1 | Trang chính + chọn chế độ | `home.js` | W |
| E2 | Bộ bài, bộ sưu tập, trang ụ, video kỹ năng | `unitpage.js`, `skilldemo.js`, `sohuu.js` | W |
| E3 | Rương, 4 khe rương, bảo hiểm rương thứ 7, gacha, jackpot | `khe.js`, `kinhte*.js`, `jackpot.js` | L luật · W màn |
| E4 | QUESTS 3 thẻ, EVENT, SHOP, cấp phi công, tiến trình | `nv-the.js`, `tientrinh.js` | L luật · W màn |
| E5 | Lưu máy + lưu tài khoản; chuyển tiến trình từ web qua tài khoản | `meta.js` | L luật · W |

## F. Online
| Mã | Việc | Nơi làm |
|---|---|---|
| F1 | Firebase Unity SDK, đăng nhập Google/Apple (cùng dự án `turret-merge`) | W + N (cấu hình) |
| F2 | Phòng 4 chữ, đồng bộ co-op/PVP, biểu cảm | L giao thức · W |
| F3 | Bảng xếp hạng Race Track, cúp | W + N (rules) |

## G. Âm thanh, ngôn ngữ, hướng dẫn
| Mã | Việc | Nguồn web | Nơi làm |
|---|---|---|---|
| G1 | Nhạc + hiệu ứng âm thanh | `sound.js`, `nhac.js` | W |
| G2 | 2 ngôn ngữ EN/VI, font | B2 | W |
| G3 | Tutorial riêng | `chedo-dd.js` | W |

## H. Build + phát hành
| Mã | Việc | Nơi làm |
|---|---|---|
| H1 | Build Windows để chơi thử + đo số nền | W |
| H2 | Build iPhone (cần macOS + Xcode + Apple Developer) — đo cổng XS Max | N quyết cách |
| H3 | Android (người dùng chưa có máy Android) | sau |
| H4 | Gói cài < 200 MB (atlas, nạp theo nhu cầu), TestFlight | W/N |

## I. Công cụ kiểm
| Mã | Việc | Nơi làm |
|---|---|---|
| I1 | Chế độ admin: nhãn FPS, chọn wave/bộ bài/tốc độ, tự chơi | W |
| I2 | Script tự chạy cảnh → chụp ảnh từng màn (thay 155 bài kiểm giao diện web) | L viết · W chạy |

## Thứ tự làm
1. A1–A4 (môi trường) song song B1–B5 (xuất dữ liệu — làm ngay được ở Linux).
2. D7 + H1: cảnh thử hiệu năng trước, lấy số nền.
3. C1–C8 (lõi luật, so băm với web) — phần lớn nhất làm được không cần Editor.
4. D1–D6 → chơi trọn 1 trận co-op.
5. E → F → G → H2–H4.

## Bản web trong lúc này
Đóng băng luật tại `678c8e822` (nguồn `claude/demo-hop-tuong`), bản chạy `b842be1b2`. Chỉ sửa lỗi làm không chơi được; luật mới ghi vào "chờ chuyển".

## Chưa biết (ghi thật)
- Trạng thái project Unity trên máy Windows của người dùng (đã cài tới đâu, đã có project/kho git chưa): phiên viết file này KHÔNG nối được vào máy đó.
- Chưa có số đo nào của Unity trên XS Max; cổng hiệu năng vẫn lùi tới khi có đường build iPhone.
