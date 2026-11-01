# Nhờ ChatGPT vẽ nốt các hình còn vẽ tạm ở Vùng 1 (01/11/2026)

Các hình dưới đây trong game hiện vẫn vẽ tạm bằng code: khối màu, hình tròn, hình vuông.

**Cách dùng:**
1. Mỗi mục là một lần gen. Dán nguyên đoạn trong khung vào ChatGPT.
2. Nên đính kèm 1–2 hình đã vẽ trước để giữ cùng phong cách, ví dụ `art/vung-1/dao-cu/chuong-luu-sang.png` và `art/vung-1/trum/nghi.png`.
3. Nhờ ChatGPT tách nền (PNG trong suốt) như lần trước.
4. Lưu đúng tên và thư mục ghi ở mỗi mục rồi đẩy lên nhánh `tieng-vong-cuoi-cung`. Luồng sau sẽ ráp vào game.

Phong cách chung (đã có sẵn trong mỗi prompt): pixel art 2D u tối, tông nâu đỏ rễ cây, đồng cũ, xương trắng ngà, điểm sáng hổ phách ấm. KHÔNG dùng màu xanh cyan, trừ Mảnh Âm và bình hồi vốn màu xanh ngọc.

---

## 1. Bộ biểu tượng vật phẩm (6 món) → `art/vung-1/vat-pham/vat-pham.png`
```
Vẽ 6 biểu tượng vật phẩm pixel art cho game metroidvania 2D u tối, xếp 1 hàng ngang, mỗi món trong 1 ô vuông bằng nhau, cách đều, nền trong suốt, viền tối rõ để nổi trên nền hang tối. Phong cách giống hình đính kèm (rễ cây nâu đỏ, đồng cũ, xương ngà, ánh hổ phách).
Thứ tự từ trái sang phải:
1. Mảnh Âm – mảnh pha lê hình thoi nhỏ, xanh ngọc phát sáng nhẹ, có vân sóng âm bên trong (tiền tệ).
2. Chuông Vỡ – quả chuông đồng nhỏ bị nứt một đường, mẻ miệng, hơi sáng hổ phách (vật phẩm chính, cần 3 cái để mở cửa).
3. Hạt Vọng – hạt tròn xanh rêu ngả ngọc, có mầm rễ nhỏ mọc ra (tăng bình hồi máu).
4. Mặt Nạ Sinh Lực – mặt nạ trắng ngà hình bầu dục không mắt, một vệt đỏ son ở giữa (tăng máu tối đa).
5. Thẻ Tên – thẻ gỗ/đồng cũ hình chữ nhật buộc dây, khắc vài vạch chữ mờ (chìa khoá cốt truyện).
6. Lõi Vọng Tàn – khối cầu lửa hổ phách đỏ cam nằm trong lồng rễ khô, phát sáng (rơi ra từ tinh anh).
Mỗi biểu tượng nhìn rõ ở cỡ nhỏ 24×24 điểm ảnh, hình khối đơn giản, không chữ.
```

## 2. Túi Mảnh Âm (rơi ở chỗ chết) → `art/vung-1/dao-cu/tui-manh-am.png`
```
Vẽ 1 đạo cụ pixel art: túi vải cũ thắt dây nằm trên đất, đầy ắp mảnh pha lê xanh ngọc phát sáng lấp ló ở miệng túi, vài mảnh rơi vãi cạnh túi. Đây là túi người chơi đánh rơi khi chết, phải quay lại nhặt. Nhìn ngang (side view) đúng góc game 2D, đáy túi phẳng đặt trên mặt đất. Nền trong suốt, viền tối, phong cách giống hình đính kèm. Cỡ khoảng bằng 1/3 chiều cao nhân vật.
```

## 3. Mặt nạ rơi của trùm (chiêu Mưa Mặt Nạ) → `art/vung-1/trum/mat-na-roi.png`
```
Vẽ 2 hình pixel art xếp ngang, nền trong suốt, cùng phong cách với trùm "Mẫu Chuông Rỗng" đính kèm:
1. Một chiếc mặt nạ trắng ngà hình bầu dục không mắt, nứt nhẹ, có dải vải đỏ sờn buộc phía sau bay phấp phới – đang rơi từ trên xuống (vật nguy hiểm).
2. Cùng chiếc mặt nạ đó vỡ thành 4–5 mảnh văng ra kèm bụi trắng (khung vỡ khi chạm đất).
Nhìn rõ ở cỡ nhỏ (khoảng 30×36 điểm ảnh mỗi hình).
```

## 4. Trùm pha 2 – giơ chuông với mặt nạ vỡ → `art/vung-1/trum/gio-chuong-vo.png`
```
Dựa trên 2 hình đính kèm (gio-chuong.png và vo-mat-na.png) của trùm "Mẫu Chuông Rỗng": vẽ lại tư thế GIƠ CHUÔNG (chuông đồng nghiêng nhấc lên, tay rễ vươn móng vuốt) nhưng mặt nạ ĐÃ VỠ như hình vo-mat-na (mảnh mặt nạ rơi, lộ vệt đỏ bên trong, vết nứt đỏ cháy trên chuông). Giữ nguyên tỉ lệ, cỡ khung, hướng quay TRÁI, cùng điểm chân. Nền trong suốt. Đây là hình báo đòn ở pha 2.
```

## 5. Hiệu ứng chiêu trùm và tinh anh → thư mục `art/hieu-ung/chieu-trum/`
Mỗi ảnh là 1 hàng 5 khung bằng nhau, nền trong suốt. Hướng: sóng và vệt quét chạy sang TRÁI.
```
Vẽ 3 dải hiệu ứng pixel art (mỗi dải 1 ảnh riêng, 1 hàng 5 khung bằng nhau, nền trong suốt), tông xám bạc lạnh pha đồng cũ, KHÔNG dùng cyan, phong cách game metroidvania u tối:
A) song-dat.png – "Sóng câm" chạy dọc mặt đất: cột đá vụn và bụi xám bật lên khỏi mặt sàn rồi sụp xuống, cao khoảng 1 ô (bằng nửa người), di chuyển sang trái. 5 khung lặp được.
B) quet-chuong.png – vệt quét ngang của quả chuông đồng khổng lồ sát mặt đất: cung sáng màu đồng – xám bạc quét từ phải sang trái, kèm bụi và mảnh đá văng, khung cuối mờ dần.
C) vong-cam.png – vòng sóng âm câm toả ra trên mặt đất (elip dẹt nhìn nghiêng), từ nhỏ lan to rồi tan, màu xám bạc mờ.
```

## 6. Giao diện máu / bình hồi / chuông (HUD) → `art/giao-dien/hud.png`
```
Vẽ bộ biểu tượng giao diện pixel art cho game metroidvania u tối, xếp 1 hàng, nền trong suốt, mỗi món trong ô vuông bằng nhau:
1. Ô máu ĐẦY – mặt nạ nhỏ trắng ngà (giống mặt nạ trong game) sáng.
2. Ô máu RỖNG – cùng mặt nạ đó nhưng tối, nứt, mờ.
3. Bình hồi ĐẦY – lọ thuỷ tinh tròn nhỏ chứa chất lỏng xanh ngọc phát sáng.
4. Bình hồi RỖNG – lọ đó cạn, tối.
5. Chuông Vỡ ĐÃ CÓ – chuông đồng nhỏ sáng hổ phách.
6. Chuông Vỡ CHƯA CÓ – bóng chuông tối mờ.
Mỗi biểu tượng rõ ở cỡ 18×18 điểm ảnh, viền tối dày, không chữ.
```

---
Không cần gen lại: Chuông Lưu, cửa khoá, trùm (3 hình), quái thường, hiệu ứng chiêu quái, vệt chém. Những hình này đã có và đang dùng. Mặt đất của các phòng nay đã có bề dày (nướng bằng `tools/vung-1/ve-phong.py`), nên không cần gen.
