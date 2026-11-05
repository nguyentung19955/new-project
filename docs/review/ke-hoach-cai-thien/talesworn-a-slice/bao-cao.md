# Báo cáo phiên A — Bản thử 5 phút đầu TALESWORN (05/11/2026)

Làm theo tư vấn ChatGPT (mục 3.2, 3.5, lộ trình 01) và hướng đã chốt: cổ tích châu Âu, Rowan, Thornwood, Toadstool King.
Chỉ đổi **ải đầu tiên (1-1) cho người mới**. Luyện Lv1–15, số liệu vũ khí, các ải sau: giữ nguyên.

## Người chơi mới sẽ thấy gì

| Lúc | Chuyện gì xảy ra |
|---|---|
| 0:00–0:20 | Mở game, chạm **Chơi** ở màn đầu là vào thẳng ải 1-1. Không bắt đăng nhập Google, không có mấy trang truyện trước trận. (Mời đăng nhập vẫn hiện như cũ **sau** khi qua ải 1.) |
| 0:20–1:00 | Phòng 1: 3 con heo con. Lời chỉ: kéo cần trái để đi, bấm Đánh để chém. |
| 1:00–1:45 | Phòng 2: một con **Heo Nanh** (tinh anh) báo đòn rất rõ bằng vạch đỏ rồi húc thẳng. Lời chỉ: thấy vạch đỏ thì Né lăn sang bên, rồi chém trả. Ở phòng thường không thể thua (như ải hướng dẫn cũ). |
| 1:45–2:30 | Phòng 3: **Fire Ink** — một trang sách đỏ bốc lửa bay tới. Chạm vào là kiếm đổi sang **kiếm Lửa thật** (ảnh kiếm vuông hệ Lửa cấp Mầm có sẵn), nút Đánh cũng đổi sang Lửa. Đây là sức mạnh **tạm** tới hết ải; về làng kiếm vẫn đúng cấp Luyện cũ (Lv3 mới chọn hệ như trước). Sau đó vài con quái để thử kiếm Lửa. |
| 2:30–3:50 | Phòng trùm: **Toadstool King** (tạm dùng hình Nấm Chúa). **Thương Băng** nằm ngay trên đường từ cửa tới trùm, đi qua là nhặt (chỉ trong ải này). Có 2 vũ khí thì hiện nút **ĐỔI** to (tiếng Anh: SWAP). Đánh trùm bằng Lửa **4 đòn** → nó dựng **Fire Guard** trong 7 giây: sát thương Lửa giảm 30% (không miễn hẳn), dưới chân hiện vòng phép màu Lửa, trên đầu hiện biểu tượng Lửa + khiên, thanh máu có thẻ "Kháng Lửa · Yếu Băng", dòng báo ngắn "FIRE GUARD! Lửa yếu đi, thử Băng". Lúc Guard đứng, **3 đòn Băng** là vỡ Guard, trùm choáng 2,5 giây (lộ điểm yếu). Chưa đầy 4 đòn thì trên đầu trùm có các chấm Lửa cho biết nó đang "học". Chỉ dùng Lửa + né khéo vẫn thắng được (Guard tự tan, nghỉ 3 giây, lần sau cần 5 đòn). |
| 3:50–5:00 | Hạ trùm: Rowan tự cầm lại kiếm, kiếm **lớn lên** thành hình Thành hình hệ Lửa (tới hết ải), dòng báo "Kiếm nhớ N đòn Lửa của bạn và lớn lên!", nhận **Page Scrap ×1** (ghi ở màn kết quả, lưu vào bản lưu). Về làng: dòng báo "Forge (lò rèn) đã mở! Gặp Ông Thợ Rèn để luyện kiếm." (Lò rèn vốn mở sau ải 1 theo luật mở dần.) |

## Ảnh tự soát (844 × 390, chụp tự động, không chơi tay)

| Mốc | Ảnh |
|---|---|
| Fire Ink | `anh/1-fire-ink.png` |
| Fire Guard | `anh/2-fire-guard.png` |
| Nhặt Thương Băng (có nút ĐỔI) | `anh/3-nhat-bang.png` |
| Hạ trùm | `anh/4-ha-trum.png` (thêm `anh/4b-ket-qua.png`: màn kết quả có dòng Page Scrap) |
| Về làng | `anh/5-ve-lang.png` |

## Cờ quay lui

- `?slice=0` — ải 1-1 và màn đầu y như trước (6 phòng hướng dẫn cũ, chạm màn đầu là vào làng).
- Bản lưu cũ đã qua ải 1-1 **không bao giờ** vào bản thử, không bị bắt chơi lại. Bản lưu không mất gì: chỉ thêm một ô mới `trangSach` (số Page Scrap).

## Kiểm tra đã chạy

- `node --check` các tệp đã sửa / thêm: đạt.
- `python3 game/build.py`: bản một tệp **26,20 MB** (trần 30 MB).
- `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: web tải đầu **19,12 MB** (trần 20 MB).
- Chạy tự động trong trình duyệt không màn hình: không có lỗi; tiếng Anh và `?slice=0` đều chạy; phòng 2 ra đúng Heo Nanh.
- Không chạy bộ test (chủ game chưa nói "test").

## Cần ảnh (đang mượn ảnh có sẵn gần nhất)

Chi tiết + prompt tiếng Anh nền magenta: `docs/yeu-cau-anh/talesworn-slice/001-trang-muc.md`

1. Trang mực đỏ bay (Fire Ink) — đang dùng trang Sổ yêu quái nhuộm đỏ + lửa nhỏ.
2. Khiên Fire Guard (lặp + vỡ) — đang dùng vòng phép nhuộm Lửa + khiên nước nhỏ.
3. Biểu tượng Fire Guard trên đầu trùm — đang dùng biểu tượng hệ Lửa phóng to.
4. Thương Băng nằm trên đường (có ánh sáng) — đang dùng ảnh thương Băng + vòng phép + lấp lánh.
5. Page Scrap (mảnh trang) — hiện chỉ có chữ.
6. Mặt nút ĐỔI (SWAP) — đang dùng nút vuông + ảnh vũ khí kế tiếp.

## Tệp đã đụng

- Mới: `game/js/slice.js` (toàn bộ luật bản thử), `game/js/slice_chu.js` (chữ Việt + Anh của bản thử, thêm qua bộ dịch có sẵn).
- Sửa ít: `game/js/stage.js` (8 dòng móc, đều có chữ `G.slice`), `game/index.html` (thêm 2 thẻ script), `game/dist/*` (dựng lại).
- Không đụng: hình Rowan / màn đầu (phiên C), bảng dịch chung và tên hiển thị khắp game (phiên B). Lời thoại trùm Nấm Chúa trong bong bóng vẫn là câu cũ (phiên B sửa).

## Ghi chú cho lần sau

- Sau khi thắng, nút Đặc biệt / Chưởng hiện ngay trong phòng trùm (luật mở dần cũ: qua ải 1 là mở) — như trước phiên này.
- Bong bóng lời trùm lúc ra mắt che bớt hộp chỉ dẫn bên trái vài giây đầu.
- Số liệu chỉnh ở đầu `game/js/slice.js` (bảng `SO`: số đòn Lửa, thời gian Guard, % giảm, số đòn Băng phá Guard…).

## Commit

Tên commit: `Talesworn bản thử 5 phút đầu (phiên A): ải 1-1 mới — vào trận ngay, Fire Ink, Toadstool King dựng Fire Guard, Thương Băng + nút ĐỔI, Page Scrap; ?slice=0 quay lui + dựng lại dist`
