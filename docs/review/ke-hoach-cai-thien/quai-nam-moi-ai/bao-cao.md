# Quái nấm PixelLab ở mọi ải + đổi tên chữ cho khớp hình (05/11/2026)

Chủ game duyệt lúc 15:41 ngày 05/11 (đề xuất mục 6 của `docs/review/ke-hoach-cai-thien/pixellab-quai-nam/bao-cao.md`).

## Tóm tắt cho chủ game

1. **Toadstool King thay hình Nấm Chúa ở MỌI ải** (trước chỉ ở bản thử 5 phút đầu). Ví dụ ải 1-2 phòng trùm giờ là vua nấm đội vương miện
   áo choàng đỏ. Chỉ đổi **hình**: máu, sát thương, chiêu, hộp va chạm, thời điểm ra đòn y như cũ (mã quái vẫn là `namChua`).
   Thế "giơ gậy chắn" lúc **Fire Guard** vẫn chạy — Fire Guard hiện chỉ có trong bản thử (js/slice.js), nên thế chắn chỉ xuất hiện ở đó; ải khác không có luật Fire Guard nên không có thế chắn.
2. **Đổi tên chữ** theo hình mới (cả tên, lời nhắc lần đầu gặp, câu nhắc ngắn trong trận, trang Sổ / Bestiary):

| Mã nội bộ (giữ nguyên) | Tên cũ VI → **mới VI** | Tên cũ EN → **mới EN** |
|---|---|---|
| `heoCon` | Heo Rừng Con (câu ngắn: "Heo Con") → **Quỷ Lùn Mũ Gai** | Boar Piglet → **Thorncap Goblin** |
| `hoaBaoTu` | Hoa Phun Bào Tử (câu ngắn: "Hoa Bào Tử") → **Bông Bào Tử** | Spore Flower → **Spore Puff** |
| `namChua` | Nấm Chúa (đã hiện "Vua Nấm") → **Vua Nấm Độc** | Mushroom King (đã hiện "Toadstool King") → **Toadstool King** (giữ) |

   Vì sao không dùng đúng gợi ý:
   - "Yêu tinh mũ gai": game đang có luật đổi chữ "yêu tinh" → "quái vật" (thuật ngữ), nên tên này dễ bị đổi lại thành "Quái vật mũ gai".
     Dùng **Quỷ Lùn Mũ Gai** (goblin = quỷ lùn), vẫn tự nhiên.
   - "Nấm phồng bào tử": trùng với quái khác đã có tên **Nấm Phồng** (và trùm Nấm Phồng Chúa) → người chơi dễ lẫn. Dùng **Bông Bào Tử** ("puff" = bông).
   - "Vua Nấm Độc": dùng đúng gợi ý (toadstool = nấm độc).
3. Bản lưu, mã quái, luật chơi, cân bằng: **không đổi gì**. Sổ yêu quái vẫn nhớ đúng số con đã hạ (lưu theo mã, không theo tên).

## Đã sửa

- `game/js/quai_pl.js`: thêm `namChua: 'toadstoolKing'` vào `G.quaiPl.THAY` (bảng "quái nào mượn tấm hình nào"). Giữ ngoại lệ cũ: trong bản thử
  có cờ `?slicecu=1` thì vẫn hình mượn cũ như trước. Thế Fire Guard (hàng `ne` → `noi`) giữ nguyên cách làm.
- `game/js/ten_moi.js` (lớp đổi tên — mọi chữ sắp vẽ lên màn hình đi qua đây):
  - VI: `Heo Rừng Con` / `Heo Con` → Quỷ Lùn Mũ Gai; `Hoa Phun Bào Tử` / `Hoa Bào Tử` → Bông Bào Tử; `Nấm Chúa` → Vua Nấm Độc (trước là "Vua Nấm").
  - EN: `Boar Piglet` → Thorncap Goblin; `Boar charges straight` → Thorncap Goblin charges straight (câu nhắc ngắn); `Spore Flower` / `Spore flower` → Spore Puff.
    (`Mushroom King` → Toadstool King đã có từ trước.) Không đụng "Longtusk Boar" (Heo Rừng Nanh Dài, quái khác).
- **Vì sao sửa ở `ten_moi.js` chứ không sửa thẳng `js/ky_nang_quai.js`**: câu nhắc trong `ky_nang_quai.js` là "chìa khoá" để tra bản tiếng Anh
  (`js/ngon_ngu_en.js`) và để `js/stage.js` nhận ra câu nhắc ngắn; sửa thẳng sẽ làm mất bản EN và câu ngắn. Lớp đổi tên đổi chữ lúc vẽ nên cả tên,
  lời nhắc, Sổ, tooltip, thanh máu trùm đều đổi theo, và **cờ `?ten=cu` tự trả lại tên cũ**.
- `game/dist/*`: dựng lại.
- Không đụng: loader, trang sprite, `vien_vk.js`, `cong_kiem.sh` (phiên F4), các tệp HUD (phiên PixelLab HUD).

## Kiểm (kết quả thật)

- `bash tools/phat-hanh/cong_kiem.sh` → **CỔNG KIỂM: ĐẠT** (153 giây): node --check, lưu mây, kiểm ảnh, dựng dist, trần dung lượng
  (một tệp 27,39 MB / 30; web tải đầu 19,73 MB / 20 — không đổi vì không thêm ảnh), smoke test 14/14 bước đạt (?cloud=0, EN/VI, lưu → tải lại).
- Chụp headless 844×390 `?cloud=0` (`cong-cu/chup.py`, ảnh ở `anh/`), **0 lỗi trang**:
  - `trum-1-2.png` — ải 1-2 (không phải bản thử, `S.slice = false`), phòng trùm: hình **Toadstool King**, thanh máu "Toadstool King".
    `trum-1-2-cu.png` — cùng cảnh với `?quaipl=0`: hình Nấm Chúa cũ.
  - `so-heoCon-vi/en.png`, `so-hoaBaoTu-vi/en.png`, `so-namChua-vi/en.png` — trang Sổ / Bestiary: tên mới, lời nhắc mới, ô hình đã là hình PixelLab.
  - `so-heoCon-en-tencu.png` — `?ten=cu`: hiện lại "Boar Piglet", "Old Forest"… như cũ.
  - `ban-thu-fire-guard.png` — bản thử 5 phút đầu vẫn chạy: Toadstool King giơ gậy chắn trong vòng Fire Guard (chạy lại `pixellab-quai-nam/cong-cu/chup.py`, 0 lỗi trang).
- Soát chữ qua lớp đổi tên (trong trang): 4 câu nhắc + tên ra đúng ở VI và EN; "Heo Rừng Nanh Dài"/"Longtusk Boar" và "Nấm Phồng Chúa"/"Puffshroom King" không bị đổi nhầm;
  chạy lớp đổi tên lần hai trên chữ VI mới không đổi thêm (không chồng tên).

## Cách quay lui

- Hình: `?quaipl=0` → cả 3 quái nấm về hình cũ (như trước). Chỉ bản thử: `?slicecu=1` → trùm bản thử về hình mượn cũ.
- Tên: `?ten=cu` → toàn bộ tên cũ (Heo Rừng Con / Boar Piglet…).
- Bỏ hẳn: revert commit của phiên này (một commit) rồi push.

## Việc còn lại / đề xuất

- Lời nhắc "cào chân rồi húc" (paws the ground) vẫn đúng với động tác hiện tại nên giữ; nếu muốn chữ "đậm chất goblin" hơn thì phiên chữ viết lại câu.
- Ghi chú trong mã (`monster_art.js`, `stage.js`…) vẫn gọi tên cũ — chỉ là chú thích cho người làm, không hiện lên game.

## Tệp

- `game/js/quai_pl.js`, `game/js/ten_moi.js`, `game/dist/*`
- Thư mục này: `bao-cao.md`, `cong-cu/chup.py`, `anh/`

Commit đã đẩy lên `khoi-tao-du-an`: `138e3c1` (code + dist + báo cáo + ảnh).
