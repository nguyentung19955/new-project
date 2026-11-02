# Sức mạnh hiện lên người Kiếm Khách – Thiết kế (CHỐT theo ChatGPT 02/11)

> Nguồn: tư vấn ChatGPT `docs/suc-manh/tu-van-chatgpt.txt` (phiên chính hỏi hộ, chat "Thiết kế tiến hoá hình ảnh"). Bản nháp cũ đã được thay toàn bộ theo tư vấn này. Mọi lớp vẫn **TẮT** cho tới khi có ảnh ChatGPT vẽ → nhân vật y hệt hiện tại.

## 1. Hướng chung
- "Mystical Decay & Awakening": linh hồn cổ thức tỉnh dưới mặt nạ nứt – **không** thành chiến binh giáp nặng.
- **Không sửa pixel nào của sprite gốc.** Mọi thay đổi = lớp PNG riêng (phủ từng khung) hoặc phụ kiện gắn điểm neo, hoặc độ sáng bật/tắt.
- 4 tầng ngoại hình (Level 0–3) + 3 cấp hình thái vệt kiếm + phụ kiện Echo Charm độc lập. **Không** làm 9 bộ cho 9 vùng, **không** Level 4.
- Khoá theo **CỜ cốt truyện**, không theo số vùng/số nút kỹ năng đã mở.

## 2. Các tầng (thứ tự dấu hiệu: mặt nạ → ngực → lưng)
| Cấp | Tên | Lớp hiện | Điều kiện (cờ trong `LuuChung`) |
|---|---|---|---|
| 0 | The Veiled One | (gốc, không phát sáng) | – |
| 1 | First Resonance | `mat-na-nut-1` – 1 vết nứt mảnh ngà/xanh băng chéo một bên mặt nạ, đứng yên thì "thở" sáng chậm | `ha_trum:vung-1` (hạ Hollow Bell Mother – cờ đã có sẵn, do trum.js ghi) |
| 2 | Bellbound Soul | `mat-na-nut-2` + `an-chuong-nguc` (ấn chuông cổ ở ngực, viền đồng xỉn, lõi ngà lạnh) | + `tien_hoa:bellbound` (Echoing Library – hiểu nguồn gốc Broken Bell) |
| 3 | The Last Reverberation | `mat-na-nut-3` (nứt ~nửa mặt nạ, vẫn nguyên dáng) + `khan-ngan` (dải vải bạc mảnh sau lưng) | + `tien_hoa:last-reverberation` (sau nghi thức ký ức, trước Vực Lặng) |

Phụ kiện độc lập: `chuong-hong` (Echo Charm Bell) – mở gắn ở Bell Village, chuông có ở Bronze Foundry; nối qua `theo_am_phu` khi phiên "do" chốt mẫu Âm Phù.
Phân bổ thưởng theo khu (ChatGPT): Bell Village L0 + mở gắn Echo Charm · Weeping Heartwood L1 · Bronze Foundry chuông hông · Iron Nest kiếm Tier II · Wind Canopy hạt gió (tạm) · Thunder Crown kiếm Tier III · Echoing Library L2 · Mirror Lake nghi thức · Silent Abyss L3.
Hai cờ `tien_hoa:*` để phiên cốt truyện ghi khi làm tới các vùng đó.

## 3. Cỡ đọc được (thân thật ~40×75 px nguồn)
Nứt mặt nạ dài 9–15 px, nét sáng 2 px · ấn ngực ≥ 6×8 px · chuông hông 6–8 × 8–11 px · dải vải rộng 3–5, dài 16–25 px · rune 1–2 px **không** làm dấu hiệu chính · giáp vai ~7×5 px (tuỳ chọn, P6 – chưa làm).

## 4. Giữ nhận diện + màu
Khoá: tóc bạc, mặt nạ trắng, khoảng tối mắt, trang phục tối, dáng song kiếm, ánh xanh băng. Không áo choàng lớn, cánh, sừng, mũ, vũ khí thứ ba. Chỉ 1–2 điểm sáng cùng lúc; khi đánh, song kiếm phải sáng nhất.
Bảng màu lớp mới: Ivory `#E9E4D9` · Cold Silver `#B7C6D2` · Ice Cyan `#85D9E8` · Deep Cyan `#447E98` · Ancient Bronze `#9C6B30` · Bell Gold `#D0A45B`.

## 5. Kỹ thuật (đã làm – `game/thu-mat-na/lop-trang-bi.js` + `trang-bi.json`)
| Lớp | Kiểu | Ảnh cần | Ghi chú |
|---|---|---|---|
| mat-na-nut-1/2/3, an-chuong-nguc | `khung` (phủ từng khung) | `art/kiem-khach-lop/<id>/<clip>/fNN.png` 256×256, chân [128,172], quay phải | `tho` (thở sáng khi đứng), `alpha_clip.trungdon = 0.5` (giảm sáng khi trúng đòn) |
| khan-ngan | `neo`, vẽ SAU thân | `neo00..neo03.png` = 4 tư thế: nghỉ / kéo ra sau / văng lên / hồi về | `hinh_theo_clip` chọn tư thế theo clip; cần điểm neo lưng từng khung |
| chuong-hong | `neo`, vẽ TRÊN thân | `neo00..neo02.png` = yên / lắc ra sau / hất lên | ẩn khi lướt (`an_clip`); cần điểm neo hông từng khung |

- JS chỉ chọn ảnh, vị trí, độ sáng – **không tự vẽ hình**. Clip chưa có ảnh/điểm neo → lớp tự ẩn ở clip đó, không mượn toạ độ clip khác.
- Cấp: `theo_co_truyen: true` → cấp = max(cấp tay, cấp theo cờ `LuuChung`). Chưa có ảnh nên bật cờ cũng không đổi hình.
- Cầu nối phiên "do": `tu_dong_cap` (dùng `capSucManh()` theo số nút) **để TẮT** – ChatGPT bảo khoá theo cờ cốt truyện, không theo cây kỹ năng.
- Chỉ số: `chi_so` các cấp để trống, `ap_chi_so: false`. ChatGPT: chỉ số chỉ gắn mốc lớn (L1 ~ năng lực cộng hưởng; L2 ~ Echo Charm/Broken Bell; L3 ~ năng lực vào Vực Lặng); đối chiếu cây Silver String của phiên "do"; đừng để vết nứt sáng bị hiểu là tăng sát thương nếu thưởng thật là phòng thủ.
- Thử: `game/phong-demo/index.html?trangbi=mat-na-nut-1` hoặc `?sucmanh=2` (chỉ có tác dụng với lớp đã có ảnh).

## 6. Số khung tối thiểu (lớp bám mặt nạ/ngực)
dung 4 · chay 8 · nhay 4 · don1 8 · don2 8 · don4 9 · roi 1 · tiepdat 3 · luot 6 (có thể ẩn phụ kiện) · trungdon 6 (giảm sáng) = **57 vị trí cần kiểm**. Khung cùng tư thế/góc mặt nạ dùng chung ảnh được nếu căn đúng. Chuông/dải vải: 1–4 hình + điểm neo.

## 7. Vệt kiếm theo cấp (không đổi màu xanh băng – đổi HÌNH THÁI)
Tier I "Frost Whisper" vệt mảnh · Tier II "Echo Severance" vệt đôi + hạt bạc ngà · Tier III "Silent Requiem" dư ảnh ngắn + sóng âm đứt đoạn. Dự án đã có vệt kiếm theo cấp đòn (`capClip`); việc gắn Tier vào mốc Iron Nest/Thunder Crown để khi làm các vùng đó. Hào quang thường trực rất yếu; hiệu ứng mạnh chỉ lúc mở khoá/cộng hưởng/kết liễu.

## 8. Thứ tự vẽ (ChatGPT)
P0 First Resonance – dung 4 + chay 8 (thử độ đọc trên iPhone) → P1 nứt L1 đủ clip → P2 ấn chuông ngực → P3 chuông hông → P4 dải vải 4 tư thế → P5 VFX tiến hoá/cộng hưởng → P6 giáp vai (tuỳ chọn).
Nghiệm thu: sprite gốc không đổi; overlay khớp 256×256 + chân (128,172); không giật; không che mắt/kiếm; lật trái đúng; rõ trên iPhone; thiếu dữ liệu tự ẩn; không giảm FPS.

## 9. Tham khảo
Blasphemous (silhouette biểu tượng, bảng màu hạn chế) · Dead Cells (sức mạnh qua tốc độ/hiệu ứng trúng) · Hollow Knight (nhân vật cực nhất quán) · Katana ZERO (vệt chém, dư ảnh) · Prince of Persia: The Lost Crown (trình bày kỹ năng mới rõ).
