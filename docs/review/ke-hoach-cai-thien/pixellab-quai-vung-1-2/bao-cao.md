# PixelLab vẽ lại quái vùng 1 Rừng Gai và vùng 2 Hang Chìm (05/11/2026)

Chủ game (05/11 19:55): "vẽ lại quái… bằng PixelLab cho nhiều hiệu ứng và động tác hơn; dùng PixelLab cho mọi thứ".
Phiên này làm theo đúng cách đã chạy tốt ở phiên quái nấm (`pixellab-quai-nam/bao-cao.md`): **ảnh gốc PixelLab → 8 hướng → nhập thành nhân vật
PixelLab → động tác khung xương (skeleton) PixelLab**, code chỉ cắt / đặt vị trí / ghép tấm. **Chỉ đổi HÌNH**: không đổi luật chơi, chỉ số,
hộp va chạm, thời điểm ra đòn, thời lượng động tác (giữ nguyên số giây của từng hàng như tấm cũ). Không chơi thử bằng tay — chỉ chụp headless.

> TRẠNG THÁI: **Vùng 1 Rừng Gai: XONG, đã đẩy.** Vùng 2 Hang Chìm: đang làm (mục 7 cập nhật khi xong).

## 1. Tóm tắt cho chủ game

### Vùng 1 — Rừng Gai (9 con; 3 con nấm của phiên trước giữ nguyên)

| Mã quái (luật giữ nguyên) | Tên cũ | Hình mới (cổ tích châu Âu) | Hàng động tác |
|---|---|---|---|
| `ongVo` (Lính bầy) | Bầy Ong Vò Vẽ | **Thimble Wasp** — ong bầu đội đê khâu bạc làm mũ, ngòi là cây kim khâu | đứng, bay, báo đòn (cong ngòi), đâm, trúng đòn, rơi xuống |
| `boHung` (Khiên) | Bọ Hung Mai Cứng | **Acorn Beetle** — bọ hung mai là quả sồi bóng | đứng, bò, cúi đầu lấy đà, húc đẩy, trúng, lật ngửa |
| `chonBong` (Nhanh) | Chồn Bóng | **Hooded Weasel** — chồn tím khoác áo choàng trùm đầu | đứng, chạy lom khom, thu áo choàng, vồ cào, trúng, nằm gục |
| `namPhong` (Cảm tử) | Nấm Phồng | **Puffcap** — nấm đỏ chấm trắng mặt cau có | đứng, lạch bạch, phồng lên, xẹp xuống bật lên, trúng, héo đổ |
| `socNo` (Đặt bom) | Sóc Ném Quả Nổ | **Pinecone Squirrel** — sóc đội mũ thợ săn lông chim, đeo túi, cầm quả thông | đứng, nhảy, giơ tay lấy đà, ném, trúng, ngã ngửa |
| `nhimDoc` (Gai) | Nhím Gai Độc | **Briar Hedgehog** — nhím lông gai bụi mâm xôi, đội mũ đấu sồi | đứng, đi, cuộn tròn, lăn (lặp), trúng, ngã |
| `heoNanh` (Tinh anh) | Heo Rừng Nanh Dài | **Longtusk Boar** — heo rừng nanh dài khoác giáp da hiệp sĩ | đứng, chạy, cúi đầu cào chân, húc lao, trúng, ngã |
| `namPhongChua` (Tinh anh) | Nấm Phồng Chúa | **Puffcap King** — vua nấm béo đội vương miện vàng, râu | đứng, đi, phồng má, cúi lắc mũ, trúng, đổ; **chiêu Nhảy dập: ngồi xổm lấy đà + nhảy lên dập xuống** |
| `mocTinh` (Trùm vùng) | Mộc Tinh | **Grimbark the Briar King** — cây sồi già biết đi, mặt khắc trên thân, vương miện cành gai, nấm tím trên vai | đứng, đi, trúng, gục quỳ; **mỗi chiêu một cặp hàng riêng**: Quật cành (giơ cành → quật ngang), Rễ đâm (giơ hai tay → đập xuống đất), Mưa quả độc (dang tay → lắc cả tán cây), Bùa bay (thu tay → vung ra), Rừng gai (nhấc chân rễ → dậm); **gầm chuyển pha** (giơ hai tay há miệng) |

Hiệu ứng đổi sang dải khung PixelLab (công cụ VFX của PixelLab), cùng cỡ khung, điểm neo, số khung, thời lượng, xoay như ảnh cũ:
cục đất lăn của Bọ Hung (`hu-cau-dat-lan`), gai rễ của Grimbark (`hu-gai-re`), quả độc rơi (`hu-qua-doc-roi`), nứt đất rễ trồi (`hu-nut-re-moc`),
quả thông nổ của Sóc (`hu-dan-qua-no`).

**Quay lui:** thêm `?quaipl=0` vào địa chỉ → mọi quái + hiệu ứng ở trên (và 3 quái nấm của phiên trước) về hình cũ y như trước. Hoặc revert commit.

## 2. Cách làm (đúng quy trình phiên quái nấm)

1. **Ảnh gốc (hướng nam)**: `POST /generate-image-v2` với ảnh quái cũ làm ảnh tham chiếu (giữ loại sinh vật, dáng, tông màu) + mô tả cổ tích
   (không chuông / tiếng vọng). Mỗi lượt ra 4–9 ảnh, chọn ảnh nhìn thẳng (nam). Trùm 224 điểm ảnh: 3 seed, chọn bản có vương miện cành gai.
2. **8 hướng** `generate-8-rotations-v3` (Heo Rừng chạy 3 lần vì hướng đông-nam lần đầu nhìn thẳng mặt, không nghiêng sang phải).
3. **Nhập nhân vật** `create-character-v3` đủ 8 hướng, khung xương `mannequin`, góc nhìn low top-down.
4. **Động tác** `POST /characters/animations` chế độ `skeleton-v3`, hướng **south-east** (game tự lật khi quay trái). Mô tả thuần động tác,
   luôn kèm "không thêm chân tay, không hiệu ứng, không bụi / khói, một khối liền".
5. **Soát**: tấm soát từng con phóng ×2 nền caro (tự soát bằng mắt từng khung) + soát tự động (mảnh rời > 6 điểm ảnh, điểm ảnh bán trong suốt).
   Hỏng thì chạy lại động tác đó với seed / mô tả khác, hoặc **bỏ khung hỏng** (chỉ dùng các khung đạt của chính bản PixelLab đó, không vá điểm ảnh):

| Con | Động tác | Vì sao chạy lại / bỏ khung | Bản dùng |
|---|---|---|---|
| Wasp | gục | seed 2 cánh nát nhoè | seed 1 |
| Hedgehog | lăn | seed 1 có khung đứng bật dậy giữa lúc lăn | seed 2 (cuộn tròn lắc tới, lặp khung 1–5) |
| Weasel | đi, vồ, gục | đi: mảnh rời; vồ: vụn đất cạnh móng; gục: đuôi mờ như ma | seed 2 cả ba; vồ bỏ khung 4 (vụn đất) |
| Puffcap | trúng đòn | khung 0 có đám bụi | seed 2 |
| Squirrel | báo đòn, ném | lần 1 tay gần như không động | ném seed 2 |
| Puffcap King | nhảy dập | khung 3 vương miện bay rời, khung 4–5 nền nấm lem | giữ khung 0–2, 6–7 |
| Grimbark | báo đòn / đánh các chiêu | khung đầu mỗi động tác hay có cánh tay nhoè (lỗi đã biết của khung 0 skeleton) | bỏ khung nhoè: quật cành 2–5, rễ đâm báo 2–5 / đánh 2–4, mưa quả 1–5 / 0–4, bùa bay báo 1–5 / đánh seed 2, dậm chân bỏ khung 1, 4 (vụn rời) |
| Grimbark | gục, gầm | lần 1 ngã ra ngoài khung hình; gầm khung 0 nhoè | gục seed 2 (quỵ tại chỗ); gầm seed 2 khung 1–7 |

Kết quả soát cuối: mọi khung dùng là một khối liền, 0 điểm ảnh bán trong suốt, không lửa / khói / tia, không thừa chân tay.
GIF từng động tác (phóng ×3 NEAREST, đứng → động tác → đứng, vạch đỏ = điểm neo chân): `anh/gif-<mã>-<động tác>.gif`; toàn tấm: `anh/tam-<mã>-x2.png`.

## 3. Ghép vào game

- `cong-cu/dung-quai-pl.py --ghi` (khung ở `docs/anh-goc/pixellab-quai-vung-1-2/<mã>/khung/`, `cong-cu/cau-hinh.json` = hàng + số giây,
  lấy đúng số giây của tấm cũ). Một ô cắt chung cho mọi khung của một con, điểm neo = giữa chân khung đứng, net 2.
- **Tấm mới mang THẲNG mã quái cũ** (`game/art/custom/<mã>.sprite.json`, mục `quai_moi`). Tấm ChatGPT cũ chuyển thành `<mã>-plcu.sprite.json`
  (mục `quai_cu_cua`, cả dáng pha `mocTinh-p2/-p3`), **chỉ tải khi `?quaipl=0`** — người chơi không phải tải hai bản (cách y như vũ khí cũ `?vkpl=0`).
  Sửa nhỏ: `game/js/sprite_custom.js` (đọc `quai_cu_cua` / `quai_moi`, cờ `G.QUAI_PL` đọc sớm), `game/build.py` (tấm `quai_cu_cua` không vào bản
  một tệp, không tính vào "người chơi tải", không chia trang — như `vk_cu_cua`; thêm 2 mục vào danh sách khoá giữ lại).
- `game/js/quai_pl.js`: bảng `V12` (mã quái → tên hình mới), **hàng riêng của chiêu** (`tele_<chiêu>` / `atk_<chiêu>` / `phase`, đọc từ tệp vì
  sprite_custom.js chỉ nạp 9 hàng chuẩn): lúc quái ra chiêu có hàng riêng, game vẽ bằng "bản nhìn" của tấm mà hàng báo đòn / đánh trỏ sang hàng
  riêng → mốc ra đòn, nhịp khung vẫn do game tính như cũ. Bảng `HU`: hiệu ứng cũ → `hu-pl-<tên>` (đổi mã lúc vẽ, ảnh mới chưa tải thì vẽ ảnh cũ).
- Vì sao không dùng `THAY` như 3 quái nấm: nếu giữ tấm cũ dưới mã cũ thì người chơi tải cả hai bản → vượt trần 20 MB (đã thử: 20,69 MB).

## 4. Kiểm (kết quả thật, vùng 1)

- `bash tools/phat-hanh/cong_kiem.sh`: **ĐẠT** — 120 tệp JS, lưu mây + 6 bản lưu mẫu, kiểm ảnh 793 tệp, dựng dist,
  **bản một tệp 25,00 / 30 MB**, **người chơi tải 17,88 / 20 MB** (trước khi làm vùng 1: tấm cũ + mới cùng tải = 20,69 MB), smoke test 14 bước.
- Chụp headless 844 × 390 (`cong-cu/chup.py`, site của cổng kiểm phục vụ qua http, `?cloud=0`): `anh/tran-v0-*.png` — mọi quái thường + 2 tinh
  anh đứng yên và đang ra đòn, Grimbark đứng + từng chiêu c1–c5; cùng cảnh `?quaipl=0` (`*-cu.png`) → hình cũ y như trước. **0 lỗi trang.**
  (Mở bằng `file://` thì game có sẵn lỗi `info is not defined` ở `js/mobs.js ttQuai` — ảnh bị trình duyệt coi là "tainted"; cả bản cũ `?quaipl=0`
  cũng bị, không liên quan phiên này; qua http không có.)

## 5. Hiệu ứng để nguyên (và vì sao)

| Hiệu ứng | Vì sao giữ ảnh cũ |
|---|---|
| `hu-la-chem` (lá chém của Grimbark) | 3 lần PixelLab VFX (lite, pro, pro sửa) đều ra vòng mảnh / bị cắt mép, kém xa ảnh cũ |
| `hu-khoi-doc-nho` (làn khói độc quanh thân) | bản PixelLab chỉ là vệt mảnh hoặc khói xám mờ bán trong suốt |
| `hu-dan-bua` (bùa bay), `hu-dan-hat-doc`, `hu-quai-cao`, `hu-dan-gai`… | ảnh dùng chung với quái vùng 3–4 (phiên khác) → không đụng |
| Vạch / vòng báo nguy hiểm, vùng độc, đạn vẽ bằng code | là phần luật chơi dùng chung mọi vùng (vùng báo = hộp trúng đòn); đổi sẽ đụng mọi quái — đề xuất phiên riêng |

## 6. Chi phí PixelLab (số thật, GET /balance + `usage` từng việc)

- Đầu phiên: 6.112,55 lượt. Đến lúc đẩy vùng 1: số dư 4.104,25 (tài khoản dùng chung với phiên Rowan và phiên quái vùng 3–4).
- Phiên này tính riêng (cộng `usage` của từng việc): **811 lượt** đến lúc đẩy vùng 1 (đã gồm ảnh gốc + 8 hướng + nhập + một phần động tác vùng 2).

## 7. Vùng 2 — Hang Chìm

(đang làm)

## 8. Việc còn lại / đề xuất

- Một số quái vùng 1 nhỏ hơn hình cũ ~20–30% (Acorn Beetle, Pinecone Squirrel, Briar Hedgehog, Hooded Weasel) vì khung PixelLab 84 điểm ảnh;
  hộp va chạm không đổi. Muốn to bằng cũ: tạo lại ảnh gốc 112 điểm ảnh rồi chạy lại động tác (~45 lượt / con). Vùng 2 đã chọn cỡ khung theo hình cũ.
- Tên chữ (sổ yêu quái, lời nhắc) vẫn là tên cũ (Bầy Ong Vò Vẽ…) — ngoài phạm vi "chỉ hình"; đề xuất phiên chữ đổi tên theo bảng mục 1.
- Lỗi sẵn có `info is not defined` (`js/mobs.js ttQuai`, chỉ khi mở bằng file://) — đề xuất phiên khác sửa (thiếu hàm `info`).

## Tệp

- `game/art/custom/<mã>.sprite.json` (9 tấm mới vùng 1), `<mã>-plcu.sprite.json` (tấm cũ, chỉ `?quaipl=0`), `hu-pl-*.sprite.json` (5 hiệu ứng)
- `game/js/quai_pl.js`, `game/js/sprite_custom.js`, `game/build.py`, `game/dist/*`
- `docs/anh-goc/pixellab-quai-vung-1-2/` — ảnh gốc, 8 hướng, khung đã chọn, tấm ghép, dải hiệu ứng, `chon.json`
- `cong-cu/`: `dung-quai-pl.py`, `cau-hinh.json`, `gif.py`, `chup.py`; `cong-cu/pipeline/` (các lệnh gọi PixelLab đã dùng; khoá đọc từ `/root/.plk`, không nằm trong repo)
