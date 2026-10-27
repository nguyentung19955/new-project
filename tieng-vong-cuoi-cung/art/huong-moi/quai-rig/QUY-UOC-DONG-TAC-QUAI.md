# Quy ước động tác quái (hướng "Cổ tích chuông tàn") – áp dụng cho MỌI quái từ nay

Đặt ra sau khi chủ dự án chê động tác Bọ Vỏ Mộc (28/10/2026): quay đầu trông như **lật trang sách**, chết **lật ngửa** trông như bọ chết hoạt hình.
Hướng mỹ thuật: huyền bí, có sức nặng, **không hài**. Làm mẫu đầu tiên: Bọ Vỏ Mộc bản 4 (`bo-vo-moc/`, `game/thu-bo-vo-moc/GHI-CHU.md` mục "Bản 4").

## 1. Quay đầu = lật gương TỨC THÌ, che bằng tư thế
- Như Hollow Knight, Dead Cells, Blasphemous: hình lật gương **trong đúng 1 bước** (bước game đổi hướng), không có khung "nửa lật".
- **Không co dẹt theo chiều ngang**: không khung nào `scaleX` của thân / cả con < **0,9** (cách cũ co về 0,58 rồi lật = lật trang sách).
- Che cú lật bằng **tư thế trước / sau**: trước = hãm (chân trước cắm, thân dồn ra sau, đầu / chi rụt về thân → bóng gần đối xứng);
  ngay lúc lật = bụi nhỏ ở chân (sát đất, màu đất, tắt nhanh); sau = phần nặng nảy nhẹ do quán tính, chân bước lại tại chỗ, đầu thò ra.
- Clip quay khoá **mỗi bước** (hoặc runtime không nội suy qua bước lật) để khung trước-lật và sau-lật không trộn lẫn nhau.

## 2. Không chết kiểu lật ngửa hoạt hình
- Cấm: lật ngửa bốn chân chổng lên, giãy chân trên không, mắt chữ X, bật nảy tưng tưng, nổ tung thành mảnh bay xa.
- Choáng / ngã cũng không lật ngửa: dùng **sụp sấp** (chân khuỵu, thân đổ xuống đất, run nhẹ) và lộ điểm yếu bằng chính bộ phận bị phá
  (mai vỡ bật hé lệch ra, giáp tróc, nắp mở…).

## 3. Chết = sụp xuống + tan vụn THEO CHẤT LIỆU
- Nhịp: **khựng** (1 nhịp ngắn) → **khuỵu / đổ sụp** (chậm rồi nhanh, dồn sức nặng xuống đất, bụi thấp) → phần cứng **nứt tách, trượt rơi**
  vài px (không bay) → phần mềm **xẹp** → nằm im một lúc → **tan** (~1 s) → biến mất.
- Tan theo chất liệu của quái, không dùng một hiệu ứng chung:

  | Chất liệu | Tan thành |
  |---|---|
  | **Gỗ / vỏ cây** | vụn vỏ rơi + bụi bào tử xám ấm bay lên chậm |
  | **Vải** | sợi / mảnh vải mủn, rũ xuống, bụi vải xám |
  | **Nấm** | bào tử phun nhẹ rồi lắng, mũ nấm héo xẹp |
  | **Đồng** | gỉ bong thành vảy, tiếng ngân tắt dần, không phát sáng |
- Màu tan: ấm, xỉn, tối dần (dải #39312E → #65503C → #A78046, bụi xám ấm). **Không teal / không sáng rực** (teal dành cho Vọng / Cộng hưởng).
- Âm thanh: trầm, khô, nhỏ dần. Không "pop" vui tai.

## 4. Không đổi luật khi chỉ đổi hình
- Sửa động tác **không** được đổi số / luật gameplay: thời lượng trạng thái, bước đổi hướng, hộp đòn, choáng, thời điểm biến mất…
  Clip phải khớp đúng các mốc gameplay đã có. Muốn đổi luật thì làm việc riêng, ghi rõ trong ghi chú.
- Trạng thái gameplay giữ tên cũ được (vd. Bọ vẫn có trạng thái `lat`), chỉ đổi clip hình.

## 5. Cần kiểm lại khi làm đòn / động tác
- **Chuông Gỗ** (quái cũ trong demo): kiểm quay đầu (có co dẹt không) và chết (rơi / vỡ thế nào) khi làm lại đòn của nó.
- **4 quái hướng mới** trong `quai-rig/` – `doi-re`, `nam-tho`, `nguoi-gac-cam`, `phu-den-lac`: chưa làm đòn; khi làm phải theo quy ước này
  (quay đầu lật tức thì có tư thế che; chết sụp + tan theo chất liệu: Dơi Rễ = gỗ / lá (đang bay thì rơi xuống đất rồi mới tan),
  Nấm Thở = nấm, Phu Đèn Lạc = vải + đồng (đèn tắt, không nổ), Người Gác Câm = vải quấn + đồng (chuông ngực ngân tắt dần)).
- Boss: cùng quy ước, nhưng cái chết boss được phép dài và có nghi thức riêng (vẫn không hài).
