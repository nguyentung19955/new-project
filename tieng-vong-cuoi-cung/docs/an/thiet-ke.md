# Thiết kế Vật phẩm ẩn + Nhiệm vụ ẩn – BẢN CHỐT theo ChatGPT (phiên "an", 02/11)

> Nguồn: **docs/an/tu-van-chatgpt.txt** (ChatGPT trả lời 5/5 câu hỏi trong docs/an/cau-hoi-chatgpt.md). Dữ liệu chạy: game/an/du-lieu.json.
> Nguyên tắc ChatGPT: *"A secret should feel remembered, not randomly hidden."* Tách riêng: **lối tắt** / **bí mật có thưởng** / **nhiệm vụ ẩn** / **thử thách kỹ năng** – không cộng chung 1 bộ đếm.

## Tổng toàn game (ChatGPT)
| Vùng | Bí mật thưởng | Nhiệm vụ ẩn | Mảnh Ký Ức |
|---|---|---|---|
| V1 Weeping Heartwood | 6 | 4 | 4 |
| V2 Bronze Foundry | 7 | 4 | 5 |
| V3 Iron Nest | 7 | 4 | 5 |
| V4 Wind Canopy | 8 | 4 | 5 |
| V5 Thunder Crown | 8 | 5 | 5 |
| V6 Echo Library | 9 | 5 | 6 |
| V7 Mirror Lake | 9 | 5 | 6 |
| V8 Silent Abyss | 10 | 6 | 6 |
| Bell Village (hub) | 6 | 6 | 6 |
| **Tổng** | **70** | **43** | **48** |

Độ khó: dễ 40% / vừa 40% / khó 20% (vùng đầu 50/35/15). Mỗi vùng: 3 phòng sau tường giả, 1 thử thách platforming lấy Mảnh Ký Ức, 1 NPC có nhiệm vụ riêng, ≥6 lối tắt (hub ≥6 kết nối).
48 Mảnh Ký Ức (kết thật) KHÔNG đòi làm xong hết 70 bí mật + 43 nhiệm vụ; không khoá kết thật bằng no-hit.

## Vùng 1 – bí mật (đếm "Secret Found" = S2–S7; S1 là lối tắt)
| id | Tên | Phòng | Điều kiện | Dấu hiệu | Thưởng | Khó | Trạng thái |
|---|---|---|---|---|---|---|---|
| v1-tuong-nut-p02 | S1 Rootscar Passage | P02 | chém tường nứt (cột 13) | vết nứt xoắn, bụi rơi | mở lối P02 ↔ P06 – "Passage Opened", **không đếm** | 1 | BẬT |
| v1-hoc-h1-p03 | S2 The Bellmaker's Hollow | P03 | chém tường nứt (cột 14) → hốc | dấu bí mật vẽ sẵn (+ vết đục đồng: chờ ảnh) | 80 Mảnh Âm (40 trong hốc + 40) + Name Tag MARA | 2 | BẬT |
| v1-tuong-gia-p06 | S3 Beneath the Husk | P06 | đi xuyên tường giả | dấu bí mật vẽ sẵn (+ rễ màu tro: chờ ảnh) | 120 Mảnh Âm (35 + 85) | 2 | BẬT |
| v1-gieng-p04 | S4 The High Mourning | P04 | vượt giếng hẹp, nhặt Mặt Nạ Sinh Lực | nhánh cụt (+ vệt móng tay: chờ ảnh) | +1 máu tối đa | 3 | BẬT |
| v1-ru-tro | S5 Ashen Lullaby | P04 (33,6) | đứng yên cạnh chuông vùi tro 3 giây | 3 nhịp rung hình + vòng tiến độ | 1 Mảnh Ký Ức + đoạn truyện | 2 | TẮT – chờ ảnh 016/017, chữ truyện chờ ChatGPT |
| v1-chuong-chua-dap | S6 The Unanswered Bell | P09 (phòng mới) | Echo replay giữ công tắc + chạm chuông | chuông thiếu quả lắc, 2 điểm tương tác | 1 Mảnh Ký Ức + 60 Ancient Bronze | 4 | TẮT – chờ kỹ năng Echo replay + phòng mới |
| v1-hoc-treo-p02 | S7 The Rootbound Witness | P02 | lên hốc treo | thấy thẻ từ dưới | Name Tag ELDEN + 40 Mảnh Âm | 2 | BẬT |

Thông báo: `Secret Found · <tên> · 3 / 4 Discovered` (mẫu số = bí mật đang bật; đủ 6 khi S5, S6 bật). Bí mật đều có thêm Âm Điểm (nguồn `bi_mat` của Hệ thống đồ – chỉ trao khi hệ thống đó bật, không thì giữ chờ).

## Vùng 1 – nhiệm vụ ẩn
| id | Tên | Lộ / xong | Thưởng | Khó | Trạng thái |
|---|---|---|---|---|---|
| nv-v1-nhung-cai-ten | Q1 Names Beneath the Bark | lộ ở Thẻ Tên đầu; xong khi đủ 4 (P02, P03, P04, P09) | 1 Mảnh Ký Ức + đoạn truyện (chữ ChatGPT) | 2 | BẬT |
| nv-v1-lang-nhu-tro | Q2 A Blade Without Blood | hạ Hollow Bell Mother không trúng đòn (tính từ lúc vào phòng trùm, làm lại được) | thành tựu **Untouched by Silence** + Echo Charm biến thể (chờ Hệ thống đồ + ảnh); KHÔNG Mảnh Ký Ức | 5 | BẬT |
| nv-v1-ve-cua-re | Q3 The Mother's Last Echo | quay lại P01 sau khi hạ trùm | câu "Even in silence, I kept their names." + 30 Ancient Bronze (giữ chờ) | 2 | BẬT (bóng Echo hiện khi có ảnh 020) |
| nv-v1-ba-tieng-ngan | Q4 Three Notes for the Lost | đánh 3 chuông P03 thấp → trung → cao; sai reset nhẹ | 100 Ancient Bronze + bản khắc | 3 | TẮT – chờ chuông đánh được + ảnh 016 |
| nv-v1-iria | What the Ash Remembers (NPC Iria, the Ash Listener, gần P05) | tìm 3 dấu tích ở P03, P06, P09 | 1 Mảnh Ký Ức | 2 | TẮT – chờ nhân vật (phiên Cốt truyện) |

Thành tựu: **Untouched by Silence** (Q2), **Root Listener** (tìm hết bí mật đang bật của Vùng 1).
Mảnh Ký Ức Vùng 1 (4): Ashen Lullaby, The Unanswered Bell, Names Beneath the Bark, Iria. *ChatGPT ghi chú: còn thiếu thử thách platforming thưởng Mảnh Ký Ức (The High Mourning đang thưởng máu) – khi dựng thêm phòng thì đổi 1 nguồn sang platforming, tổng không quá 4.*

### 4 Thẻ Tên (chữ trong game)
- P02 **ELDEN** – "I held the gate until the bells fell silent."
- P03 **MARA** – "I cast the last bell for those without names."
- P04 **SERA** – "The ash remembers what the living forget."
- P09 **ORIN** – "Do not let the Mother ring alone."
Đủ 4 → "Four names remembered." + "Memory Shard acquired." + đoạn truyện *Names Beneath the Bark* (đọc lại trong nhật ký).

## Lối tắt Vùng 1 (đếm riêng, không vào Secret Found)
- P02↔P06 **Rootscar Passage** (có sẵn, chém tường nứt) – BẬT.
- P05↔P09 **The Rest Bell Root** – ĐÃ DỰNG (lượt 2): lỗ sàn mỏng cột 9–11 ở Chuông Lưu P05, dây rễ thòng từ vòm xuống lỗ; P09 có dây cột 10 từ T3 lên trần. Đi ngang P05 không rơi (đường chính như cũ); leo dây từ P09 lên về Chuông Lưu; ở P05 bám dây (↓) leo xuống P09. Cổng P11 vẫn cần đủ 3 Chuông Vỡ (kiem-tra.py xác nhận).
- Còn đề xuất (chưa dựng – các phòng không kề nhau trên bản đồ, cần mở rộng phòng): P03↔P05 · P04↔P06 · P06↔P11 · P09↔P12 (sau trùm).

## Câu đố âm thanh trên iPhone (ChatGPT)
Luôn ≥ 2 kênh (âm + hình): LOW 1 vạch · MID 2 vạch · HIGH 3 vạch. Tắt tiếng vẫn giải được; không dùng màu làm dấu hiệu duy nhất; không flash mạnh; tuỳ chọn "Visual Sound Cues" mặc định bật; không bắt đứng yên ở chỗ nguy hiểm.

## Giao diện (ChatGPT, iPhone 844×390)
- Secret toast 270×58 góc trên phải (trong safe area), 2,5–3 s; Achievement toast 300×66; nhật ký 760×320 (tab 148 / danh sách 250 / chi tiết 340), dòng 52–58, nút ≥ 44.
- Trạng thái dòng: Whispers / Discovered / Unfinished / Remembered. Không hiện "???" cho mục chưa biết.
- **Hiện tại** (chưa có ảnh): thông báo dùng dòng chữ có sẵn của Vùng 1; nhật ký là bảng chữ HTML (mục Whispers, Name Tags, Remembered, Achievements). Khi ảnh 006–019 XONG sẽ thay khung/biểu tượng.

## Chống kẹt (ChatGPT, đã làm trong code)
ID ổn định; tách "đã mở" và "đã nhận thưởng" (thưởng chưa trao được giữ chờ); bản lưu cũ tính bù, tường nứt P02 đã đếm cũ tự chuyển sang lối tắt; mở lối tắt không tăng Secret Found; Thẻ Tên không mất/không nhận trùng; no-hit làm lại được, không khoá kết thật.

## 12 nhiệm vụ "hành động lạ" toàn game → docs/an/de-xuat-cac-vung-sau.md
