# Copycat (Shamash) chép ô ĐÁ — DCDW làm gì? (06/11/2026)

Câu hỏi người dùng: "Copycat phải copy được hoá đá chứ, hay tôi bị nhầm, DCDW có làm được thế không" (SOLO wave 21, Copycat 1★ kéo lên ô đá 1★ không có gì xảy ra).

## Đã tìm
| Nguồn | Nói gì | Liên quan |
|---|---|---|
| namu.wiki (tóm ở `docs/demo-hop-tuong/DCDW-WIKI-TOM-TAT.md` dòng 62) | **Shamash: sao chép bất kỳ Child cùng sao** (bản sao −50% sát thương) | Không có điều kiện "trừ đá" |
| namu.wiki (tóm ở `DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md` dòng 27–29) | Janus Cube hoá đá Child; đá ghép với đá cùng sao. Freezer đóng băng 1 Child (**vẫn ghép được**) | Đá/băng vẫn là "Child cùng sao" trên bàn |
| DC Inside raid guide 10/06/2021 — <https://gall.dcinside.com/mgallery/board/view/?id=defense&no=29958> (tóm ở `tuvan/conghuong/DCDW-NGHIEN-CUU.md` mục 4) | "돌덩이끼리 합체한다고 유닛이 나오는게 아닌 등급높은 돌덩이가 된다" (đá + đá → đá bậc cao); **Frey biến hình được ô đá** | Kỹ năng của Child khoẻ vẫn tác động được lên ô đá |
| gamemeca / gameinsight (<https://www.gameinsight.co.kr/news/articleView.html?idxno=21782>) | Janus: đá "không bắn, chỉ chiếm ô" | Đá chỉ mất khả năng TỰ bắn / dùng kỹ năng |
| Lần này (06/11): namu.wiki bị chặn khi đọc lại (client_error); tìm web "샤마쉬 돌덩이 복사", "Shamash copy petrified" — **không có trang nào nói Shamash bị cấm chép đá** | — | — |

## Kết luận
- **Không có nguồn nào cấm** Shamash chép ô đá. Mô tả gốc là "bất kỳ Child cùng sao"; trong DCDW kỹ năng của Child khoẻ (Frey biến hình, Aurora King nâng sao) vẫn tác động lên ô đá. → Làm theo người dùng (người chơi DCDW): **Copycat chép được ô đá**.
- Độ tin: **trung bình–thấp** (không có câu viết thẳng "Shamash chép được đá"; có thể kiểm lại bằng video gameplay nếu sau này tìm được).
- Kết quả chép: chưa nguồn nào nói → chọn theo ý người dùng: **ụ THƯỜNG đúng loại thật dưới lớp đá** (Shamash chép "Child", không chép "lời nguyền"); ô đá giữ nguyên là đá.

## Luật trong game (sau sửa)
- Copycat khoẻ kéo lên ô **đá** hoặc ô **băng** CÙNG SAO → ô Copycat thành bản sao thường (không đá, không băng) của loại thật, % sao chép theo cấp thẻ Copycat (70% cấp đầu); ô đá/băng giữ nguyên.
- Copycat đang bị đá / băng: không dùng kỹ năng chép (như mọi ụ bị khoá). Copycat đá + đá cùng sao: theo luật đá + đá.
- Khi cầm Copycat, ô đá/băng cùng sao sáng (ô ghép được) — dùng chung `hopLeGhep` nên SOLO / CO-OP / PVP / ONLINE / Turret File demo đều giống.
- Mã: `thap/js/skills2.js` `SKILLS.saochep.ghepDB.quaKhoa = true` (cùng cơ chế Merge King / Teleporter). Kiểm: `tools/thap-kt-copycat-da.js` (trong `thap-kt-hoiquy.js`), `tools/thap-kt-conghuong.js` cập nhật.
