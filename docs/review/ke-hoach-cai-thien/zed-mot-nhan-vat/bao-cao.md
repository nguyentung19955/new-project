# Báo cáo: Linh Khí bản Zed (một nhân vật)

Làm theo `YEU-CAU-2.md`. Mã commit code: **8321a2b** (nhánh `khoi-tao-du-an`).

> **CHƯA TEST.** Theo lời dặn của chủ dự án: không chạy Playwright, không mở trình duyệt, không chạy bộ test trong `game/tests`, không chụp ảnh/quay GIF. Mục I của YEU-CAU-2 bỏ qua. Chỉ chạy `node --check` cho mọi tệp JS (đều qua) và 2 lệnh build (đều xong). **Chủ dự án tự kiểm trên web.**

Tắt bản Zed bất cứ lúc nào: thêm `?zed=0` vào cuối địa chỉ (ví dụ `spiritblade.web.app/?zed=0`) → game y như bản 4 em bé trước đây, dùng chung bản lưu.

## 1. Cấu trúc code đã khảo sát

- Dữ liệu em bé: `js/data.js` (`G.HEROES`, `G.HKEYS`; mỗi vùng có `rescue` = em bé được cứu khi hạ trùm vùng).
- Bản lưu: `js/engine.js` (`G.newSave`, `G.fixSave` sửa từng phần; `save.heroes[key]` = cấp, kinh nghiệm, điểm kỹ năng, cây chưởng; `save.hero` = em đang chơi). Lưu mây (`js/cloud.js`) cũng đưa bản tải về qua `G.fixSave`, nên chuyển bản lưu ở đó là đủ cho cả máy lẫn mây.
- Chiến đấu: `js/combat.js` (`G.buildPlayer`: chỉ số + nội tại; `G.pDamage`: sở trường +10%; nhánh nội tại Cu Tèo/Cu Lì), `js/moves.js` (4 bộ vũ khí, không phụ thuộc em bé), `js/chuong.js` (nét riêng chưởng theo em bé).
- Cứu em bé sau trùm: `js/stage.js` (hàm `settle`).
- Làng: `js/village.js` (bảng Ông Từ chọn em bé), `js/village_scene.js` (ba bé ngồi sân đình, chạm để đổi).
- Hành trang, Lực chiến, Bảng vàng, Truyện: `js/hanh_trang.js`, `js/luc_chien.js`, `js/bang_vang.js`, `js/truyen.js`.
- Hình: mọi hình em bé tra theo khoá (`smith`…). Cu Tí là bé duy nhất đủ 8 tấm (gốc + đòn × gốc/Rừng/Biển/Lâu) nên Zed giữ khoá `smith` → không phải sửa hình, animation, vệt chém nào.

## 2. Tệp đã sửa và lý do

| Tệp | Sửa gì |
|---|---|
| `js/data.js` | Cờ `G.ZED` (+ `?zed=0`), bảng `G.ZED_DAY` (con số nét mỗi bạn dạy), hàm `G.zedHoc`, `G.favOf`, `G.passiveOf`, `G.skillDescOf`; đổi tên hiển thị `smith` thành **Zed** |
| `js/engine.js` | `G.fixSave`: phần "Zed" chuyển bản lưu cũ (mục 3) |
| `js/combat.js` | Nội tại thành số trên người chơi (`ccMult`, `reflect`, `drNT`) thay cho `P.key === 'hunter'/'wrestler'`; Zed nhận nội tại đã học; sở trường qua `G.favOf` |
| `js/chuong.js` | `CH.heroMod`: nét chưởng của Zed = đẩy lùi + các nét đã học |
| `js/luc_chien.js` | Phần giảm sát thương từ nội tại tính một nửa (như cũ với Cu Lì), áp cả cho Zed |
| `js/stage.js` | Hạ trùm vùng lần đầu (độ khó thường): bạn dạy Zed, ghi `save.zed.hoc`, dòng báo giữa trận + 3 dòng ở bảng kết quả; không còn dòng "Em bé mới đã mở" |
| `js/village.js` | Ông Từ: bảng **"Sân đình: chỉ số Zed"** (chân dung, cấp, sức mạnh, sở trường, nội tại, 3 bạn đã/chưa dạy); hướng dẫn Chưởng |
| `js/village_scene.js` | Ba bạn ngồi sân đình là NPC (chạm thì nói chuyện, không đổi nhân vật); Ông Từ đề "Xem chỉ số Zed"; báo một lần khi bản lưu cũ vừa chuyển |
| `js/hanh_trang.js` | Thẻ Nhân vật / Kỹ năng / Linh khí: tên Zed, nội tại + nét chưởng + sở trường đầy đủ; nút "Nét đã học: Ông Từ" |
| `js/truyen.js` | Lời truyện: Cu Tí → Zed; bạn được cứu thì "dạy Zed …" thay cho "đổi em bé" |
| `js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/zed.json` | Bản tiếng Anh cho mọi chữ mới (39 câu) |
| `game/README.md` | Mục "Bản Zed" |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Gói lại bằng 2 lệnh build |

Không đụng: `cloud.js`, `cloud_ui.js`, `firebase-config.js`, cấu hình/luật Firebase, `?cloud=0`, hình ảnh, test.

## 3. Thay đổi về nhân vật, vũ khí, phần thưởng trùm

**Nhân vật.** Chỉ còn Zed (máu 100, mana 100, tốc 100%, sở trường kiếm + búa, nội tại "vũ khí nhận dấu ấn nhanh hơn 20%", chưởng đẩy lùi mạnh) — y như Cu Tí. Cấp, điểm kỹ năng, cây chưởng, đồ, trang phục dùng như cũ. Cu Tèo, Cái Bống, Cu Lì vẫn bị bắt trong truyện, vẫn được cứu, về ngồi chơi ở sân đình (NPC).

**Vũ khí.** Không sửa gì ở 4 bộ vũ khí (kiếm 3 nhát, giáo đâm/quét/xốc/Phi Thương, cung bắn nhanh/giương/Mưa Tên, búa nện/tích lực/Địa Chấn) — code `moves.js` không phụ thuộc em bé nào. Zed dùng hình Cu Tí là bộ hình đủ đòn của cả 4 vũ khí.

**Phần thưởng trùm (thay cho mở em bé).** Hạ trùm vùng lần đầu ở độ khó thường (đúng điều kiện cũ) → bạn được cứu dạy Zed, cấp **đúng 1 lần**, lưu ở `save.zed.hoc` (lưu cả trên mây vì nằm trong bản lưu):

| Trùm | Bạn dạy | Nội tại | Nét chưởng | Sở trường thêm |
|---|---|---|---|---|
| Mộc Tinh | Cu Tèo | +15% sát thương lên quái bị choáng/đóng băng/giữ chân/lộ điểm yếu (gốc +25%) | bay xa hơn 20%, nhanh hơn 20% (gốc 30%/25%) | Cung +10% |
| Ngư Tinh | Cái Bống | hiệu ứng gây ra kéo dài hơn 20% (gốc 30%) | trúng quái hồi 1% máu, tối đa 3 lần mỗi phát (gốc 1,5%) | Giáo +10% |
| Hồ Tinh | Cu Lì | giảm 12% sát thương nhận, phản 30% sát thương cận chiến (gốc 25%/50%) | to hơn 30%, nổ/mây rộng hơn 20%, mạnh hơn 10% (gốc: tầm chỉ 60%, to 1,5 lần, +15%) — **không** rút tầm vì đã có nét bay xa của Cu Tèo | — |

Cân bằng: vì Zed gom cả ba (cộng với nội tại của chính Cu Tí), mỗi nét lấy khoảng 50–80% sức của bản gốc. Hết 3 trùm thì cả 4 vũ khí đều là sở trường (+10%). Sức mạnh và Lực chiến tự tính theo các nét này (phần giảm sát thương nội tại vẫn chỉ tính một nửa như luật cũ). Tất cả con số ở một chỗ: `G.ZED_DAY` trong `js/data.js`.

Thông báo: giữa trận hiện dòng "Cu Tèo dạy Zed: …"; bảng kết quả có "Cứu được Cu Tèo! Bạn ấy dạy Zed:" kèm 2 dòng ngắn; truyện về làng có câu "Cu Tèo dạy Zed …: xem ở Ông Từ". Không còn dòng "mở em bé".

**Bản lưu cũ** (chạy một lần lúc nạp, cả bản trên máy lẫn bản tải từ mây):
- Zed nhận cấp, kinh nghiệm, điểm kỹ năng, cây chưởng của em bé **cấp cao nhất** (bằng cấp thì lấy em nhiều kinh nghiệm hơn; Cu Tí cao nhất thì giữ nguyên).
- Dữ liệu cũ của Cu Tí được cất ở `save.zed.cuTi`; dữ liệu ba bé kia **giữ nguyên** trong `save.heroes` — không xoá gì.
- Trùm vùng đã hạ (bé đã được cứu, hoặc đã có sao ải trùm) = bạn đó đã dạy Zed.
- Vũ khí, đồ, trang phục, vàng, nguyên liệu, sao, truyện: không đụng.
- Có chuyển thì lần đầu vào làng hiện một dòng báo: "Bản lưu cũ đã chuyển sang Zed: cấp X lấy từ Y, N bạn đã dạy Zed. Xem ở Ông Từ."
- Dữ liệu `zed` lỗi/sai kiểu → dựng lại theo luật trên (không mất gì). Phần sửa bản lưu chạy trong khung "sửa từng phần" có sẵn: lỗi ở phần này không làm hỏng phần khác.

## 4. Test đã chạy

- **Không test theo yêu cầu** của chủ dự án: không chạy Playwright, không mở trình duyệt, không chạy `game/tests`, không chụp ảnh.
- Đã chạy: `node --check game/js/*.js` → tất cả qua (không lỗi cú pháp); `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` → xong (trang chính nén 0,88/1,50 MB).
- Chưa kiểm: khởi động game, làng, Ông Từ, 4 vũ khí, trùm và phần thưởng, bản lưu cũ/mây, tiếng Anh — **chủ dự án tự kiểm trên web**.

Gợi ý tự kiểm nhanh: (1) vào làng thấy "Zed · cấp …" ở góc phải trên; (2) gặp Ông Từ thấy bảng chỉ số Zed, không còn chọn em bé; (3) chạm ba bạn ở sân đình chỉ nói chuyện; (4) hạ Mộc Tinh lần đầu thấy "Cu Tèo dạy Zed"; (5) mở `?zed=0` thấy lại 4 em bé.

## 5. Lỗi hoặc rủi ro còn lại

- Chưa chạy thử nên có thể còn lỗi giao diện (chữ dài tràn ô ở bảng Ông Từ, nhất là tiếng Anh) hoặc lỗi chạy chưa thấy được khi chỉ đọc code.
- Lượt chơi dở được lưu bằng em bé khác Cu Tí (tính năng "chơi tiếp lượt dở") sẽ bị bỏ sau khi chuyển sang Zed (game coi là lượt của nhân vật khác). Chỉ ảnh hưởng một lượt dở.
- Bảng vàng: kỷ lục cũ của người chơi khác ghi tên em bé cũ (Cu Tèo…) vẫn hiện tên đó; kỷ lục mới ghi Zed.
- Bộ test cũ trong `game/tests` có thể còn giả định 4 em bé / chọn em bé (ví dụ đổi `save.hero`); khi chạy test cần thêm `?zed=0` hoặc sửa test.
- Chuyển bản lưu làm Zed lên cấp của em bé cao nhất: nếu người chơi từng cày một bé khác rất cao, Zed sẽ mạnh ngay; đó là ý của yêu cầu.
- Chạy `?zed=0` sau khi đã chuyển: Cu Tí lúc đó mang cấp đã chuyển (bản cũ của Cu Tí vẫn nằm ở `save.zed.cuTi` nếu cần trả lại tay).
- Tên "Zed" trùng một tướng trong Liên Minh Huyền Thoại (đã nêu ở DOC-TRUOC); đổi tên chỉ cần sửa một dòng `G.HEROES.smith.name = 'Zed'` và các câu truyện.

## 6. Tài nguyên animation còn thiếu

Không thiếu gì cho Zed: Zed dùng nguyên bộ hình Cu Tí (8 tấm: thân gốc + tấm đòn, cho gốc / Rừng Già / Hang Biển / Lâu Đài), đủ hàng đứng, đi, chạy, lộn, trúng đòn, gục, đòn kiếm, giáo, cung, búa, chưởng. Hình ba bạn còn lại giữ nguyên (dùng làm NPC ngồi sân đình, truyện, bảng Ông Từ); các chỗ thiếu tấm đòn của họ (Cu Tèo bộ Rừng, Cái Bống ba bộ) không còn ảnh hưởng vì họ không ra trận nữa. Không thêm, không xoá ảnh nào.

## 7. Cách chạy

- Web: `spiritblade.web.app` (tự triển khai khi đẩy lên nhánh `khoi-tao-du-an`). Bản 4 em bé cũ: thêm `?zed=0`.
- Trên máy: mở `game/index.html` (hoặc `game/dist/linh-khi.html`) bằng trình duyệt.
- Gói lại sau khi sửa code: `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep`.
