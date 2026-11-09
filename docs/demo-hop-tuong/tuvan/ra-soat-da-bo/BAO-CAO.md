# Rà phần đã bỏ còn sót ở các màn khác (09/11)

Người dùng: "rà lại trong game xem có những cái gì đã bỏ đi, thì những cái đó ở các màn hình khác cũng cần bỏ nhé".
Nguồn danh sách: GAMEPLAY.md (04/11 → 09/11), `git log` 2 tuần, `docs/demo-hop-tuong/KE-HOACH.md`, `tuvan/tien-trinh/THIET-KE.md`.
Cách rà: grep từ khoá/hàm cũ trong `thap/js`, `thap/css`, `index.html`, `vi.json`; xem chữ thật trên trang ụ, bảng chạm ụ, clip Test range, kết quả trận (Playwright 390×844).
Không đổi gameplay, không thêm UI mới.

## Bảng

| # | Đã bỏ / đổi | Chỗ còn sót | Xử lý |
|---|---|---|---|
| 1 | Bỏ thông báo nổi hình tròn (icon ụ) khi kỹ năng khi-ghép kích hoạt + biểu tượng sinh đôi Twin Maker (08/11) | `ui.js` vẫn nạp ảnh `fx_sinhdoi_hieu` mỗi trận có Twin Maker; chú thích `skills2.js:792` còn tả biểu tượng | Bỏ nạp ảnh (ui.js). Chú thích skills2.js để lại (file đang có 2 agent sửa, chỉ là comment). Nhãn chữ `nhanU` đã tắt toàn cục từ trước — không còn chỗ nào hiện. Clip Test range dùng chung VX nên cũng đã hết |
| 2 | Salvo: bỏ nhãn bingo "⚔ n/5 » n/3" → mũi tên đỏ/xanh (09/11) | Không còn ở trang ụ / clip / bảng chạm (DEMKN.DS.railgun đã xoá nên "Bottom tag" tự ẩn). `motvong.js` TAG.railgun còn nhưng không bao giờ hiện | Để lại (dữ liệu chết vô hại, file thuộc agent tự kích) |
| 3 | Bỏ bảo đảm "summon ra ụ Tấn công" — về đều 20% (09/11) | Chữ nút SUMMON, hướng dẫn, trang ụ: sạch. Chú thích cuối `hotro.js` còn tả "SÀN TẤN CÔNG" | Sửa chú thích hotro.js |
| 4 | Bỏ câu Pháo La Bàn ở bước ghép hướng dẫn | Đã sạch (huongdan.js) | — |
| 5 | Bỏ "mở cả 85 ụ sau hướng dẫn" (giờ chỉ mở Trắng + Xanh, bậc cao theo cấp phi công) | **Màn kết quả trận hướng dẫn** vẫn ghi "Tutorial cleared — all 85 turrets unlocked" / "đã mở khoá cả 85 ụ"; chú thích huongdan.js ("5/85"), bobai.js ("Khoá bộ sưu tập 85 ụ") | Đổi thành "Tutorial cleared — Common and Rare turrets unlocked" / "Xong hướng dẫn — đã mở ụ Thường và Hiếm" (khớp chữ khoá ở bộ bài); sửa 2 chú thích |
| 6 | Ember: không bắn lan; Ember + Ember ra Ember mới 0 lửa; bỏ trần lửa | **Clip Test range Ember**: câu cuối "Max 70 flames (more at LV11+)"; chú thích clip "= max(★, 3 + 1) = 4" | Câu clip → "No flame limit" / "Không giới hạn lửa"; sửa chú thích. Chữ thẻ / trang ụ / họ / mốc dạng đã đúng (không có "splash", có "0 flames", "no flame limit") |
| 7 | Súng Bão: bỏ phạt −15%/ụ kề (10/11) | Sạch: text.js, ROSTER_EMBED, clip đều nói "+5% nảy mỗi Súng Bão kề" | — |
| 8 | Bỏ hướng dẫn "2/3 hay 5 kiếm" trong trận | Không tìm thấy chữ/ảnh nào còn lại (nhãn ⚔ Salvo đã xoá; chỉ còn chú thích lịch sử trong demkn.js/hieuung.js) | — |
| 9 | Không có hệ năng lượng; không tràn sát thương | Sạch (chữ "energy" chỉ là họ ụ ENERGY / ụ Pháo Năng Lượng; "OVERFLOW" là tên mốc 5★ Mana Well) | — |
| 10 | Bỏ mọi trần hỗ trợ (07/11) | **Trang ụ, mọi ụ Hỗ trợ**: "…and each buff type has a cap"; **mốc sao**: Radar 7★ "(cap +15% during it)" (thatso.js) và "(fire-rate cap still applies)" (phattrien.js), Hammer 5★ "(crit damage cap 50%)", Mirror Gate 5★ "(resist cap 52%)" | Bỏ hết phần "cap"; Radar 7★ → "every 8s: +25% fire rate 2s" (đúng code: CAP.toc = ∞). Câu "Copies of the same Support don't stack" giữ (vẫn đúng: lấy bản mạnh nhất) |
| 11 | Bàn gọn: bỏ hàng 3 viên ngọc dạng (07/11), chỉ còn 1 hạt ngọc ở góc huy hiệu sao khi đã lên dạng; ụ cộng dồn không có ngọc | **Trang ụ "On-board icons"**: "3 gems under the star badge"; **bảng chạm ụ / dải xem nhanh**: "Gems: form 1/3" cả khi không có hạt ngọc (dạng 1, ụ cộng dồn như Leviathan) | Trang ụ: "Gem on the star badge corner: blue = middle form, gold = final form (…)", ảnh ngọc xanh + vàng; ụ cộng dồn không hiện mục ngọc. Bảng chạm: chỉ nhắc ngọc khi thật sự vẽ (`MV.coNgoc`) |
| 12 | Fusion Archive: bỏ 3 xung Archive + Archive; mỗi điểm +1% → +2% | Clip: "It flies to one Archive: +1% damage"; chú thích clip "Archive + Archive → 3 xung nổ" | Câu clip lấy số thật (`DIEM` → +2%); sửa chú thích |
| 13 | Bỏ jackpot các ụ khác (chỉ còn Lucky Slot), bỏ Blood Rite, bỏ tim/bông tuyết cạnh thanh máu, bỏ vòng khoanh ụ cùng loại khi chạm thẻ | Sạch ở mọi màn (chỉ còn chú thích lịch sử "bù jackpot … đã bỏ") | — |
| 14 | Tạm gác skin ụ, hiệu ứng ghép, biểu cảm (KE-HOACH 09/11) | Không có UI cửa hàng/sự kiện nào nhắc skin / hiệu ứng ghép. **Chat ONLINE** (`online/chat.js`) có 4 "biểu cảm tạm" (icon có sẵn) cạnh 8 câu soạn sẵn | Để lại — đây là nút chat có sẵn chứ không phải vật phẩm biểu cảm; co-op/online đang tạm dừng kiểm. Cần anh quyết: giữ hay ẩn 4 nút biểu cảm |

## Rà lại sau (việc đang làm song song, chưa push)

Tự kích (chỉ Black Hole + Thác Mana bấm tay) + bỏ vòng xanh nạp chiêu — các chỗ nhắc tới sẽ phải đổi khi nhánh đó vào:
- "Green ring / Vòng xanh lá …" — `motvong.js` (bảng chạm ụ, dải xem nhanh, trang ụ "On-board icons", câu "No ring or gems on this turret"), 8 chỗ.
- "Tap when full / tap it on the board / READY: TAP TO USE / Tap: …" — 27 chỗ trong `text.js`, `skills3.js`, `skills5.js`, `thacmana.js`, `skilldemo.js` (câu clip "Tap: …", `cham:` mốc chạm), `unitpage.js` (mục Mythic "Tap it on the board when charged…"), `bopopup.js`, `motvong.js`; `vi.json` tương ứng.
- `MV.tenChieu` tìm mốc theo chữ "active skill" — đổi chữ mốc thì kiểm lại.

## Kiểm

- `tools/thap-kt-vi.js`: không còn chuỗi mới nào thiếu bản Việt; 44 chuỗi thiếu có sẵn (Thác Mana, Cổng Ấp Nở, mô tả Ember/Blood Circuit…) không do nhánh này.
- `tools/thap-kt-motvong.js`: bảng chạm Leviathan hết "Gems", Werewolf thức tỉnh còn "Gems: form 2/2"; 0 lỗi trang.
- `tools/thap-kt-tien-trinh.js`: như bản gốc (1 ✗ có sẵn: link mời ONLINE khi chưa cấp 4). `tools/thap-kt-kynang-vd.js`: lỗi có sẵn ở bản gốc (hotro.js gọi SKILLS[id] undefined trong vm), không do nhánh này.
- Câu clip đọc trực tiếp từ `SD_K` (EN → VI): Ember "No flame limit → Không giới hạn lửa", Archive "+2% damage → +2% sát thương".
- Ảnh đã xem (390×844, xoá sau khi xong): trang ụ Werewolf / Mirror Gate / Radar EN+VI (mục biểu tượng, mốc sao), kết quả trận hướng dẫn EN+VI, trang ụ Leviathan (thap-kt-motvong).
