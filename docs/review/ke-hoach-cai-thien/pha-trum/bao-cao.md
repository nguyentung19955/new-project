# Kiểm 3 pha trùm vùng (12/10/2026)

Chủ dự án báo (iPhone): "đánh thử trùm chỉ mới thấy 1 pha".

## Kết luận nhanh

- **Luật pha vẫn chạy đúng**: cả 3 trùm vùng đổi pha theo máu (dưới 66% → pha 2, dưới 33% → pha 3), có cảnh chuyển pha (trùm không nhận sát thương), chữ "<Trùm> nổi giận!" / "<Trùm> hóa cuồng!", rung màn, tiếng cồng, xoá đạn của trùm.
- **Nguyên nhân chính (lỗi hình)**: tệp dáng pha `-p2`/`-p3` chỉ có 4 hàng (đứng thở, lấy đà, đánh, trúng đòn). Lúc trùm **đi lại** (giữa các chiêu, rất thường xuyên với Ngư Tinh) và lúc **gục**, game mượn hàng của tệp **pha 1** → trùm cứ hiện về hình pha 1. Nhìn trên máy gần như lúc nào cũng thấy dáng pha 1, chỉ loé dáng mới lúc ra chiêu.
- **Nguyên nhân phụ (có thể xảy ra trên iPhone)**: ảnh tải sau được giải mã bằng `img.decode()`. Safari đôi khi từ chối `decode()` với ảnh lớn dù ảnh vẫn nạp được; code cũ coi ngay là "ảnh hỏng" → tệp đó không bao giờ dùng được (tệp dáng pha là 3 MP, gấp ~3 lần tệp pha 1). Không thử được Safari thật ở đây, nhưng đã chặn đường hỏng này.
- **Tải ảnh không phải nguyên nhân**: bản web (hai tệp) có đủ `mocTinh-p2/-p3`, `nguTinh-p2/-p3` trong tệp ảnh tải sau, nằm ngay sau ảnh pha 1 của trùm (khoảng 9–14 MB đầu của tệp). Giả lập mạng chậm ~1,3 MB/giây: đủ 3 dáng Mộc Tinh sau **9 giây** kể từ lúc mở game — người chơi tới ải 1-5 mất nhiều phút. Nếu ảnh về muộn giữa trận, hình tự đổi sang dáng pha ngay khung kế tiếp (game kiểm mỗi khung). Không đổi thứ tự tải (để không giẫm phiên Tải nhanh).
- Hồ Tinh: tệp `-p2/-p3` do phiên khác vừa nhập (gộp trong lúc làm phiên này); game tự dùng, không cần sửa code, đã kiểm lại bên dưới.

## Đã sửa

| Tệp | Sửa |
|---|---|
| `game/js/sprite_custom.js` (`SC.veQuai`) | Trùm ở pha 2/3 có tệp dáng pha: **đi** → dùng hàng đứng thở của tệp pha (thân vẫn trôi theo bước đi); **gục** → hàng trúng đòn của tệp pha rồi mờ dần. Không còn quay về hình pha 1. |
| `game/js/sprite_custom.js` (`SC.napAnh`) | `img.decode()` bị từ chối mà ảnh chưa nạp xong → chờ `onload`/`onerror` thật, không coi là hỏng. |
| `game/js/boss.js` | Đầu cảnh chuyển pha: thân trùm chớp trắng mạnh rồi nhạt (0,14 đầu cảnh) cho mọi trùm vùng có ảnh AI. Giữ nguyên chữ, rung, cồng đã có. |
| `game/tests/au_pha_trum.py` | Bài kiểm mới: bản HAI TỆP qua máy chủ thật, đánh 3 trùm tới chết, ghi máu đổi pha, tệp ảnh vẽ thân theo từng trạng thái, chụp ảnh; `--cham` giả lập mạng chậm. |

Cờ tắt: `?phatrum=0` (hoặc `G.PHA_TRUM_DU = false`) → hình như cũ. Không đổi máu, sát thương, ngưỡng pha, chiêu.

## Máu lúc đổi pha (bản hai tệp, mỗi nhát 4% máu)

| Trùm | Sang pha 2 | Sang pha 3 | Chữ báo | Gục |
|---|---|---|---|---|
| Mộc Tinh | 64% | 32% | Mộc Tinh nổi giận! / hóa cuồng! | có |
| Ngư Tinh | 64% | 32% | Ngư Tinh nổi giận! / hóa cuồng! | có |
| Hồ Tinh | 64% | 28%* | Hồ Tinh nổi giận! / hóa cuồng! | có |

(*nhát rơi trúng lúc trùm đang miễn sát thương nên lệch một nhát; ngưỡng thật vẫn 66% / 33%.)

## Tệp ảnh vẽ thân theo trạng thái (sau khi sửa)

- Mộc Tinh: pha 2 đứng / chiêu / chuyển pha → `mocTinh-p2`; pha 3 đứng / chiêu / mệt → `mocTinh-p3`; gục ở pha 3 → `mocTinh-p3`.
- Ngư Tinh: pha 2 **đi** → `nguTinh-p2` (trước: `nguTinh` pha 1); pha 3 **đi** → `nguTinh-p3` (trước: pha 1).
- Hồ Tinh (sau khi gộp tệp dáng pha của phiên khác): pha 2 → `hoTinh-p2`, pha 3 → `hoTinh-p3` (đứng, chiêu, mệt, chuyển pha, gục).
- Chi tiết: `ket-qua.json`.

## Ảnh

- Trước / sau, Ngư Tinh pha 2 đang đi: `nguTinh-pha2-dang-di-truoc.jpg` (hình pha 1) · `nguTinh-pha2-dang-di-sau.jpg` (hình pha 2).
- Ba pha: `mocTinh-pha1/2/3.jpg`, `nguTinh-pha1/2/3.jpg`, `hoTinh-pha1/2/3.jpg`.

## Kiểm tra

- Gói sau khi gộp: 25,93 MB / trần 26 MB (phần lớn do ảnh Hồ Tinh pha 2, 3 của phiên khác) — sát trần, nên để ý.
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được (cảnh báo tệp đầu 5,08 MB đã có từ trước, không do phiên này).
- `node --check` mọi tệp sửa, `cloud_save_regression.test.js` PASS, `tests/smoke.py` 0 lỗi, `au_pha_trum.py` 0 pageerror.
- Chạy lại: `cd game && LK_HAI_TEP=1 python3 build.py --hai-tep && python3 tests/au_pha_trum.py` (thêm `--cham` để thử mạng chậm).

## Bổ sung (phiên thứ hai, cùng ngày): ảnh trùm tải hỏng thì thử lại, vào phòng trùm thì tải trước

Phiên thứ hai làm song song và tìm ra đúng hai lỗi hình ở trên. Phần dưới đây là phần mới, chỉ đụng tới việc **ảnh dáng pha có về kịp hay không**. Trong lúc làm, phiên Tải nhanh đã đổi cách tải sang ẢNH RỜI: mỗi ảnh một tệp, có hàng chờ ưu tiên, trùm và dáng pha được ưu tiên khi vào ải 4–5. Code dưới đây khớp theo cách tải mới.

- **Rủi ro còn lại trên iPhone**: khoá máy, chuyển ứng dụng hoặc mạng chập chờn làm một ảnh tải hỏng. Game thử lại 2 lần (sau 3 giây và sau 10 giây) rồi bỏ ảnh đó. Ảnh bị bỏ chỉ được thử lại khi trình duyệt báo sự kiện `online`, mà sự kiện này thường không đến khi chỉ khoá máy. Khi đó trùm đổi pha nhưng vẫn mang hình pha 1 (hoặc hình vẽ bằng code) suốt buổi chơi.
- **Đã sửa** (cờ tắt `?uutien=0` / `G.UU_TIEN_TRUM = false`):
  - Vào phòng trùm (`js/stage.js` gọi `SC.uuTienTrum(mã, true)`): ảnh trùm nào đã bị bỏ thì thử lại ngay (`SC.roiThuLai`). Cả 3 dáng pha 1, -p2, -p3 được báo "đang cần" nên tải trước mọi thứ khác.
  - Trùm đã sang pha mà dáng pha chưa về: `SC.phaTrum` báo "đang cần" để tải ngay. Dáng pha về tới là hình đổi ở khung kế tiếp.
  - Quay lại trang (visibilitychange): game thử lại mọi ảnh đã bị bỏ.
  - Nếu tắt ảnh rời (`LK_ANH_ROI=0`, quay về tệp `linh-khi-anh.<mã>.json`): `build.py` ghi vị trí byte các dòng ảnh trùm vào `G.ANH_SAU.trum`. Khi vào ải của vùng, nếu ảnh trùm chưa về thì game tải riêng các dòng đó bằng yêu cầu Range. Lượt tải cả tệp đã thôi thì game thử lại khi vào ải hoặc quay lại trang.
- **Kiểm tra**: `cd game && LK_HAI_TEP=1 python3 build.py --hai-tep && python3 tests/au_pha_trum_tai.py`. Máy chủ thử làm hỏng 4 lần đầu của mỗi ảnh trùm (WebP 1 lần, rồi PNG 3 lần), nên game bỏ cả 9 ảnh trùm. Sau đó bài thử đánh từng trùm tới chết.
  - Code mới: vào phòng trùm là có đủ 3 dáng, 0 pageerror.
    - Mộc Tinh đổi pha ở 65,1% / 32,3%, vẽ đúng `mocTinh-p2` / `mocTinh-p3`.
    - Ngư Tinh đổi pha ở 66,0% / 32,7%, vẽ đúng `nguTinh-p2` / `nguTinh-p3`.
    - Hồ Tinh đổi pha ở 65,6% / 32,9%, vẽ đúng `hoTinh-p2` / `hoTinh-p3`.
  - Code cũ (`LK_THEM='&uutien=0'`): cả 3 trùm không có ảnh nào, đúng như triệu chứng.
  - Bản tệp JSON (`LK_ANH_ROI=0`, làm hỏng mọi lượt tải cả tệp, chỉ trả lời Range) cũng đạt: đủ 3 dáng cho cả 3 trùm. Kết quả này đo trước khi gộp cách tải ảnh rời.
