# SPEC — vẽ pixel bằng CLI (cho session Claude, không cần bấm tay)

Luồng chuẩn: **viết spec JSON → chạy CLI → xem ảnh bằng Read → sửa spec → `--nap` → commit**.
Lõi sinh sprite dùng chung với trang `tools/ve-pixel.html` (`tools/ve-pixel-core.js`) — cùng spec cho ra cùng điểm ảnh.
Quy chuẩn hình: [`QUY-CHUAN.md`](QUY-CHUAN.md) · mã cần vẽ: [`DANH-SACH.md`](DANH-SACH.md) · hướng dẫn trang HTML: [`HUONG-DAN-TOOL.md`](HUONG-DAN-TOOL.md).

```
node tools/ve-pixel.js --spec spec.json                         # chỉ kiểm tra (mã thoát 1 + dòng "E_…: …" nếu sai)
node tools/ve-pixel.js --spec spec.json --xem /tmp/xem          # ảnh phóng to từng mã + /tmp/xem/tong-quan.png → Read
node tools/ve-pixel.js --spec spec.json --out goi-pixel.zip     # gói nạp tay trong game (Cài đặt → Gói pixel)
node tools/ve-pixel.js --spec spec.json --nap                   # ghi tools/pixel/src/<nhóm>/<mã>.txt + build-pixel --strict
node tools/ve-pixel.js --spec thu-muc/                          # gộp mọi *.json trong thư mục
node tools/ve-pixel.js --thu-vien [nhóm | nhóm/mã] [--loai vk]  # tra thư viện mẫu vẽ tay / bộ phận
node tools/ve-pixel.js --mau                                    # dựng lại bộ mẫu tools/pixel/mau/ (+ tong-quan.png)
```

- `--nap` = cách để **game tự dùng khi khởi động**: nguồn vào `tools/pixel/src`, `tools/build-pixel.js --strict` dựng
  `assets/pixel/<nhóm>/<mã>.png|.json|-chan-dung.png`, `js/pixel/<nhóm>.js` (manifest) và `js/asset-list.js`. Commit cả nguồn lẫn file
  sinh ra. Không ghi đè nguồn đã có (bản vẽ tay) — báo `E_NAP_TON_TAI`; chắc chắn thay thì thêm `--ghi-de`.
  Game vẫn chỉ vẽ pixel khi bật (`?pixel=1`, nút **Pixel: Bật** trong Cài đặt, hoặc `PIXEL_BAT` trong `js/pixel.js`).
- Thư viện mẫu vẽ tay `tools/pixel/thu-vien.js` gom nguồn của nhánh chính **và các nhánh pixel chưa gộp** (đọc bằng git show):
  chạy lại `git fetch origin && node tools/build-thu-vien.js` khi có sprite vẽ tay mới. Danh sách mã + bảng màu:
  `node tools/build-ve-pixel.js` (khi DANH-SACH / palette đổi). Test báo nếu quên.

## Định dạng

Một tệp là `{ "ma": [ … ] }`, hoặc một mảng `[ … ]`, hoặc một mã `{ "ma": "nhóm/mã", … }`. Mỗi mã:

| khoá | bắt buộc | ý nghĩa |
|---|---|---|
| `ma` | ✓ | `"nhóm/mã"` — nhóm: `tuong quai boss nen icon do an-phu ky-nang than-khi giao-dien canh`; mã chữ thường không dấu, nối `-` / `_` |
| `ten` | | tên hiển thị (mặc định: theo DANH-SACH) |
| `mo` | | mô tả ngắn — tool đọc từ khoá (bảng dưới). Bỏ trống: dùng mô tả trong DANH-SACH |
| `co` | | `"32x32"` … (mặc định theo nhóm / DANH-SACH; boss `48x48` / `64x64`) |
| `hanh` | | `kim moc thuy hoa tho` — màu phép khung `cast` |
| `bo_phan` | | chọn thẳng bộ phận (ghi đè `mo`), xem bảng dưới |
| `mau` | | `"nhóm/mã"` trong **thư viện vẽ tay**: dựng từ bản vẽ tay đó (giữ nguyên dáng + mọi khung động tác) |
| `thay` | | (cùng `mau`) thay bộ phận: `{ "gay": "tuong/tanvien:gay" }`; `"gay*": "tuong/tanvien:gay*"` thay cả bộ `gay, gay_ngang, gay_cheo…` |
| `doi_mau` | | (cùng `mau`) `{ "son": "cham" }` đổi cả dải 3 tông (dải: `son lua vang dong sat bac trang den dat cat la lama reu cham nuoc tim ngoc hong da troi`) hoặc một màu `{ "son-sang": "lua-sang" }` |
| `dong_tac` | | chỉnh `{ "idle": { "fps": 4, "lap": true } }` |
| `ve_tay` | | vẽ đè từng điểm: `{ "mau": { "z": "sang" }, "khung": { "idle.0": [ 32 dòng × 32 ký tự ] } }` — `.` giữ nguyên, `_` xoá, ký tự khác = màu khai báo; `"idle.3"` (số kế tiếp) = thêm khung |
| `ghi_chu`, `so_sanh`, `nguong` | | ghi chú; mã thư viện để so; ngưỡng lệch (0..1) — dùng trong bộ mẫu |

**Bộ phận** (`bo_phan`) — tướng / quái / boss: `dang` (nguoi · thu · ran) · `than` (nguoi · xuong · da · ma · giay · go · dong · cay) ·
`dau` (ngan · bui · dung · dai · troc) · `mu` (khong · khan · non · long · mien · mudong · trum · sung) · `ao` (ao · giaolinh · giap · tran) ·
`quan` (quan · kho · vay) · `vk` (khong · gay · giao · riu · kiem · cung · cheo · chuong) · `canh` (khong · co) · `dien` (boss: khong · co) ·
màu: `mauToc mauMu mauAo mauQuan mauVk choang` (= tên dải ở trên; `choang` thêm `khong`) · `hanh`.
Icon / đồ / kỹ năng / ấn phù / thần khí: `khung` (tron · khien · vuong · khong), `hinh` (lua · nuoc · la · nui · kiem · riu · khien · muiten ·
set · mattroi · tim · xu · sao · ngoc), `mauKhung`, `mauHinh`. Ô nền: `nen` (co · dat · da · nuoc · cat · gach · tron), `mauNen`.

**Từ khoá `mo`** (tiếng Việt / Anh, khớp nguyên từ): bộ xương · người đá · hồn / ma · giấy / vàng mã · con rối / đất nung · thân đồng · ma cây ·
tóc búi / dựng / dài / trọc · khăn · nón · mũ lông chim / quạt lông · vương miện · mũ trùm · sừng · mũ · áo / giáp / giao lĩnh / cởi trần ·
khố / váy / quần · áo choàng · gậy / giáo / rìu / kiếm / đao / cung / nỏ / chèo / chuông / tay không · cánh · hổ / nghê / lân / trâu / rùa (thú) ·
rắn / rồng / cá / thuồng luồng · hành Kim / Mộc / Thủy / Hỏa / Thổ · màu: đỏ son cam vàng đồng sắt xám bạc trắng đen nâu kem rơm rêu
xanh lá chàm xanh dương nước tím ngọc hồng. Cụm cách nhau `,` `·` `+` `;`; màu đi theo danh từ cùng cụm.

**Nên dùng `mau`** khi đã có bản vẽ tay gần giống (cùng dáng): ra hình đẹp, đủ động tác, chỉ cần thay bộ phận / đổi màu / vẽ đè.
Sinh từ `mo` / `bo_phan` chỉ là **phác thảo** (khối thô) — luôn xem ảnh `--xem` rồi `ve_tay` chỉnh, hoặc vẽ tiếp trong trang HTML.

## Ví dụ

```json
{ "ma": [
  { "ma": "tuong/thu-gay", "ten": "Thử", "mau": "tuong/giong",
    "thay": { "gay*": "tuong/tanvien:gay*" }, "doi_mau": { "son": "cham" }, "dong_tac": { "idle": { "fps": 4 } } },
  { "ma": "quai/thu-xuong", "mo": "bộ xương, giáp đồng, giáo", "hanh": "tho" },
  { "ma": "icon/thu-set", "co": "16x16", "bo_phan": { "khung": "tron", "hinh": "set", "mauHinh": "vang" } },
  { "ma": "nen/thu-gach", "bo_phan": { "nen": "gach", "mauNen": "son" } }
] }
```

## Mã lỗi (mã thoát 1, không ghi file nào)

`E_SPEC_JSON` JSON hỏng · `E_SPEC` sai khung tệp · `E_MA` mã sai dạng · `E_NHOM` nhóm lạ · `E_KHOA` khoá lạ · `E_CO` sai cỡ ·
`E_HANH` · `E_BO_PHAN` bộ phận lạ · `E_GIA_TRI` giá trị bộ phận lạ · `E_MAU_TV` mẫu không có trong thư viện · `E_THAY` bộ phận thay sai ·
`E_DOI_MAU` · `E_DONG_TAC` · `E_VE_TAY` · `E_TRUNG` mã trùng · `E_QUY_CHUAN` không đạt QUY-CHUAN (động tác / số khung / khung trống) ·
`E_NAP_TON_TAI` (`--nap` gặp nguồn có sẵn) · `E_BUILD` build-pixel báo lỗi (mã thoát 2) · `E_LECH` (`--mau`: mẫu lệch quá ngưỡng).
Cảnh báo (vẫn ghi): `! … điểm chạm nền không phải màu viền` — thêm viền hoặc sửa điểm lơ lửng.

## Bộ mẫu input → output — `tools/pixel/mau/<nhóm>/`

Mỗi mẫu: `<tên>.spec.json` (input) · `<tên>.png` (dải khung tool sinh) · `<tên>-xem.png` (phóng to) · `<tên>-goc.png` (bản vẽ tay,
`tools/build-pixel.js` dựng, khi có `so_sanh`). Ảnh gộp: `tools/pixel/mau/tong-quan.png` (vẽ tay trái | tool phải, % lệch).
Test `tests/ve-pixel/cli.test.js` dựng lại và kiểm: mẫu có `nguong` lệch bản vẽ tay ≤ ngưỡng (so từng điểm ảnh PNG), ảnh trong repo khớp spec.

| nhóm | mẫu | input | lệch vẽ tay |
|---|---|---|---|
| tuong | `giong` · `adv` · `lactuong` | `mau` = chính mã đó | 0% (ngưỡng 2%) |
| tuong | `giong-gay-son-tinh` | `mau` giong + `thay` `gay*` ← tanvien + `doi_mau` son → chàm | biến thể |
| tuong | `lactuong-mo-ta` | chỉ `mo` + `hanh` + `than: dong` | tham khảo (phác thảo khác xa bản vẽ tay) |
| quai | `tom` · `casau` | `mau` | 0% |
| quai | `casau-dau-tom` | `mau` casau + đổi xanh → tím + walk fps 8 | biến thể |
| boss | `thuongluong` / `thuongluong-mo-ta` | `mau` / `mo` | 0% / tham khảo |
| nen | `co` · `nuoc` / `co-mo-ta` | `mau` / `mo` | 0% / tham khảo |
| icon | `hanh-kim` / `hanh-moc-thanh-hoa` | `mau` / `mau` + đổi màu | 0% / biến thể |
| ky-nang | `giong-q` | `mau` | 0% |
| an-phu | `g-air` | `mau` | 0% |

Thư viện (`--thu-vien`): mỗi mẫu là nguồn build-pixel (bộ phận `part` + công thức khung `frame` — `use` / `shift` / `swap` / `set` /
`rot` / `outline`); bộ phận xếp loại theo tên: `dau` · `than` · `chan` · `tay` · `vk` · `phep` · `canh` · `khac`
(`--thu-vien tuong --loai vk`). Mẫu `vfx/*` dùng bảng màu riêng của nhánh vfx — màu ngoài `palette.txt` bị bỏ khi dựng.
