# Thiết kế Hệ thống tiến triển / Charm / cây kỹ năng – bản 2 (theo tư vấn ChatGPT)

Nguồn: **tu-van-chatgpt.txt** (ChatGPT, 02/11). Dữ liệu: `game/he-thong/du-lieu.json` (phiên bản 2). Những chỗ ChatGPT chưa nói chi tiết được ghi `de_xuat` trong dữ liệu và gom vào **cau-hoi-chatgpt-2.md** để ChatGPT duyệt sau.

## Nguyên tắc (ChatGPT)
Khám phá là nền, loot tạo động lực chơi lại, kỹ năng/hoạt ảnh mới là thưởng đáng nhớ nhất. **Không bắt cày cấp** để qua cửa/đánh trùm; kỹ năng di chuyển (Double Jump, Rope Mastery, Ground Break) là thưởng cốt truyện, không nằm trong cây; Echo Note chỉ mua lựa chọn chiến đấu; khám phá lần đầu luôn thưởng hơn đứng giết quái.

## Vòng lặp 3 tầng
| Tầng | Làm | Nhận |
|---|---|---|
| Ngắn 30 s–2 ph | đánh nhóm quái, thử combo | Echo Shard, Resonance XP |
| Trung 30–90 ph | đường tắt, bí mật, tinh anh, trùm | Charm, Memory Shard, kỹ năng di chuyển (cốt truyện) |
| Dài nhiều tuần | 9 chặng, săn Charm biến thể, tối ưu build | build riêng, ngoại hình, thành tựu |

## Resonance XP → cấp → Echo Note
- XP: quái thường 3–5 · quái mạnh (máu ≥ 45) 8–12 · tinh anh lần đầu 45 / tái đấu 15 · trùm lần đầu 160 · bí mật lần đầu 30 (phiên "an" gọi) · Memory Trial 60.
- Mốc: cấp 2:60 · 3:150 · 4:270 · 5:420 · 6:600 · … · 12:2310; sau đó +360 + 45(L−12) mỗi cấp; tối đa 30. Mỗi cấp +1 Echo Note.
- Vùng 1 nhắm cấp 3–5. Mô phỏng 400 lượt (kiem-thu-logic.js): trước trùm không bí mật → cấp 2; xong Vùng 1 + 5 bí mật → cấp 4.
- Giảm dần khi cày quái yếu (de_xuat): vượt cấp mục tiêu vùng (Vùng 1 = 5) thì XP quái giảm 25%/cấp, tối thiểu 20%.

## The Resonance Lattice (3 tab EDGE / ECHO / VESSEL)
| Cấp | Nút | Giá | Hiệu ứng (de_xuat trừ ghi chú) |
|---|---|---|---|
| 2 | Keen Edge (Edge) | 1 | +10% sát thương kiếm; combo có **Frostline Slash** (FX ChatGPT chọn) |
| 3 | Lingering Echo (Echo) | 1 | +15% Echo Shard, +10% XP (tạm – chưa có bóng Echo) |
| 4 | Ashen Resolve (Vessel) | 1 | +8 khung bất tử sau trúng đòn |
| 5 + hạ trùm V1 | Resonant Cut (Edge) | 2 | +15% sát thương |
| 7 | Phantom Pursuit | 2 | chờ cơ chế Echo (vùng sau) |
| 10 + thử thách | **Fifth Toll** | 3 | nhát combo 5 animation riêng – KHÔNG ở Vùng 1, cần ảnh + duyệt riêng |
| 14 / 20 | Echo Reversal / Last Chime | 3 | nhiệm vụ / thử thách, vùng sau |

Kiếm 10/13/16 giữ hình gốc, **rèn ở Morrow** bằng Ancient Bronze + Echo Shard, không tốn Note (Morrow chưa có ở Vùng 1 → tắt). Bản 1 cho rèn kiếm trong cây – đã bỏ theo ChatGPT.

## Charm
- Độ hiếm: **Faded** 0 dòng · **Whispered** 1 · **Haunted** 2 · **Eternal** 3. Vùng 1: 75/23/2/0; endgame 65/27/7/1.
- Dòng phụ: Blade's Hunger 2–5% sát thương · Shard Whisper 4–10% Echo Shard · Deep Remembrance 3–8% XP · Gentle Reprieve 4–8% hồi máu (máu nguyên → xác suất +1) · Ashen Guard +1–2 khung bất tử · Swift Echo / Bellward (chờ cơ chế Echo / bẫy, Vùng 1 không lăn).
- Trần cộng dồn từ Charm: +20% sát thương, −15% hồi Echo, +3 khung bất tử.
- 3 Charm Vùng 1: **Bell's Return** (2 ô) · **Ashen Mercy** (2 ô) · **Rootbound Oath** (1 ô). Bản Vùng 1 (de_xuat, vì chưa có bóng Echo/cộng hưởng): Bell's Return = 10 đòn trúng hoàn 1 lượt hồi (hồi nội bộ 30 s); Ashen Mercy = kết liễu hồi 1 máu (20 s); Rootbound Oath = +12 khung bất tử khi trúng đòn trên không/trên dây.
- **Tinh anh đầu tiên → CHỌN** Bell's Return hoặc Ashen Mercy (không RNG, không rơi thêm Charm ngẫu nhiên lần đó). Sau đó tinh anh lần đầu / trùm / rương rơi Charm ngẫu nhiên; quái thường không rơi.
- Không đồ rác: Charm Faded trùng mẫu đã có tự phân rã thành **Echo Dust**; phân rã tay được (Faded 10 · Whispered 25 · Haunted 60 · Eternal 150 – de_xuat).
- Ô: 3 đầu + 1 ô mỗi mốc Memory Shard 6/12/…/42 (đọc `LuuChung.soKyUc()`) = tối đa 10. Không cắm 2 Charm cùng mẫu.
- Tái rèn ở Morrow (logic có, đang tắt): chọn 1 dòng rèn, dòng khác giữ, được giữ kết quả cũ; giá 40 Dust + 100 Shard → 80 + 200 → 160 + 400.

## Hình ảnh mở khoá (luật: chỉ bật khi ảnh ChatGPT có)
10 nâng cấp hình ảnh nhỏ ChatGPT đề xuất là **lớp VFX riêng**, không sửa pixel nhân vật. Làm trước 2 cái ChatGPT chọn: **Frostline Slash** (6 khung, Keen Edge) và **Resonance Halo** (6 khung, khi lên cấp/học nút). Dáng đứng mới bản 1 đã huỷ. Fifth Toll hoãn tới vùng cấp 10.

## Giao diện (iPhone ngang 844×390, nút ≥ 44 px)
- Lattice: tiêu đề, cấp/XP/Notes, 3 tab, danh sách nút trái + chi tiết phải với nút **Learn**.
- Charms (chỉ hiện khi có ảnh Charm + ô độ hiếm): danh sách trái ~280 · thông tin giữa ~300 · loadout phải ~180; chọn rồi bấm **Equip / Unequip / Dismantle** (không chỉ kéo thả).
- Mảnh giao diện ChatGPT vẽ (yêu cầu 008–010) tự dùng khi có; chưa có thì giữ khung chữ Chuông Lưu sẵn có.

## Phối hợp
- Phiên **an**: gọi `MocHeThong.ht.congDiem('bi_mat')` khi tìm bí mật (đã có). Có thêm `MocHeThong.congDiem(nguon)` (có thông báo lên cấp + Halo).
- Phiên **sucmanh**: `MocHeThong.ht.trangBiDangDung()` → [{uid, mau, hiem}] (mau = bells_return/ashen_mercy/rootbound_oath; hiem = faded/whispered/haunted/eternal), `capSucManh()` 0–3, `chiSo()`.
