# Lệnh dùng tool vẽ pixel — xuất gói từng nhóm (claude/xuat-goi-pixel)

Mọi hình dưới đây **sinh bằng tool** `node tools/ve-pixel.js` từ spec trong `tools/pixel/spec/<nhóm>.json` — không vẽ tay từng điểm.
Chạy ở thư mục gốc dự án, **từng lệnh một, theo thứ tự**: kiểm tra → xem ảnh → xuất zip → nạp vào game. Định dạng spec: [`SPEC.md`](SPEC.md).

| nhóm | số mã | spec | gói zip | cách sinh |
|---|---|---|---|---|
| do (đồ) | 98 | `tools/pixel/spec/do.json` | `tools/pixel/goi/do.zip` | thư viện hình vật (rìu, nỏ, gậy, mũ, giáp…) + màu theo độ hiếm / bộ |
| icon | 160 | `tools/pixel/spec/icon.json` | `tools/pixel/goi/icon.zip` | khung đĩa trống đồng / ô / không khung + hình vật |
| than-khi (thần khí) | 60 | `tools/pixel/spec/than-khi.json` | `tools/pixel/goi/than-khi.zip` | ô khung đồng + vật theo truyện nhân vật |
| giao-dien | 45 | `tools/pixel/spec/giao-dien.json` | `tools/pixel/goi/giao-dien.zip` | bộ sinh giao diện: khung · nút · nút tròn · thanh · ô · thẻ · huy hiệu · dải · núi |
| nen (nền) | 51 | `tools/pixel/spec/nen.json` | `tools/pixel/goi/nen.zip` | ô lát: **mẫu vẽ tay** `nen/co · dat · nuoc` + `doi_mau`; vật / cổng / đế: hình vật nền trong suốt |
| canh (cảnh) | 37 | `tools/pixel/spec/canh.json` | `tools/pixel/goi/canh.zip` | bộ sinh cảnh: trời 3 dải + núi xa + đất / nước / vật theo chủ đề |
| an-phu (ấn phù) | 36 | `tools/pixel/spec/an-phu.json` | `tools/pixel/goi/an-phu.zip` | `mau` = bản vẽ tay nhánh `claude/pixel-anphu-thankhi` (tên cũ `g-air` → mã `g_air`) |
| ky-nang (kỹ năng) | 240 | `tools/pixel/spec/ky-nang.json` | `tools/pixel/goi/ky-nang.zip` | 40 `mau` = bản vẽ tay nhánh `claude/pixel-ky-nang-2` (`giong-q` → `giong_q`, khung tô lại theo phím); 200 = **mỗi chiêu một hình riêng** (`tools/ve-pixel-ky-nang.js`: khung theo phím Q/W/E/R + nền theo hành + hình chính + hình phụ + hiệu ứng), bảng thiết kế `tools/build-ky-nang-spec.js` |
| ban-do (bản đồ) | 14 | `tools/pixel/spec/ban-do.json` | `tools/pixel/goi/ban-do.zip` | bộ sinh bản đồ 320×148 từ dữ liệu game (`node tools/build-ban-do-spec.js`) |

Bỏ qua: `tuong` `quai` `boss` (đã đủ, có bản vẽ tay ở nhánh chính), `vfx` (`claude/vfx-pixel-2`).

## 1. Đồ (do)

```
node tools/ve-pixel.js --spec tools/pixel/spec/do.json
node tools/ve-pixel.js --spec tools/pixel/spec/do.json --xem /tmp/xem-do
node tools/ve-pixel.js --spec tools/pixel/spec/do.json --out tools/pixel/goi/do.zip
node tools/ve-pixel.js --spec tools/pixel/spec/do.json --nap
```

## 2. Icon

```
node tools/ve-pixel.js --spec tools/pixel/spec/icon.json
node tools/ve-pixel.js --spec tools/pixel/spec/icon.json --xem /tmp/xem-icon
node tools/ve-pixel.js --spec tools/pixel/spec/icon.json --out tools/pixel/goi/icon.zip
node tools/ve-pixel.js --spec tools/pixel/spec/icon.json --nap
```

## 3. Thần khí (than-khi)

```
node tools/ve-pixel.js --spec tools/pixel/spec/than-khi.json
node tools/ve-pixel.js --spec tools/pixel/spec/than-khi.json --xem /tmp/xem-than-khi
node tools/ve-pixel.js --spec tools/pixel/spec/than-khi.json --out tools/pixel/goi/than-khi.zip
node tools/ve-pixel.js --spec tools/pixel/spec/than-khi.json --nap
```

## 4. Giao diện (giao-dien)

```
node tools/ve-pixel.js --spec tools/pixel/spec/giao-dien.json
node tools/ve-pixel.js --spec tools/pixel/spec/giao-dien.json --xem /tmp/xem-giao-dien
node tools/ve-pixel.js --spec tools/pixel/spec/giao-dien.json --out tools/pixel/goi/giao-dien.zip
node tools/ve-pixel.js --spec tools/pixel/spec/giao-dien.json --nap
```

## 5. Nền (nen)

```
node tools/ve-pixel.js --spec tools/pixel/spec/nen.json
node tools/ve-pixel.js --spec tools/pixel/spec/nen.json --xem /tmp/xem-nen
node tools/ve-pixel.js --spec tools/pixel/spec/nen.json --out tools/pixel/goi/nen.zip
node tools/ve-pixel.js --spec tools/pixel/spec/nen.json --nap
```

## 6. Cảnh (canh)

```
node tools/ve-pixel.js --spec tools/pixel/spec/canh.json
node tools/ve-pixel.js --spec tools/pixel/spec/canh.json --xem /tmp/xem-canh
node tools/ve-pixel.js --spec tools/pixel/spec/canh.json --out tools/pixel/goi/canh.zip
node tools/ve-pixel.js --spec tools/pixel/spec/canh.json --nap
```

## 7. Ấn phù (an-phu)

```
node tools/ve-pixel.js --spec tools/pixel/spec/an-phu.json
node tools/ve-pixel.js --spec tools/pixel/spec/an-phu.json --xem /tmp/xem-an-phu
node tools/ve-pixel.js --spec tools/pixel/spec/an-phu.json --out tools/pixel/goi/an-phu.zip
node tools/ve-pixel.js --spec tools/pixel/spec/an-phu.json --nap
```

## 8. Kỹ năng (ky-nang)

Sửa thiết kế ở bảng `BANG` trong `tools/build-ky-nang-spec.js` (hình mới: thêm vào `HINH` / `NHO` của `tools/ve-pixel-ky-nang.js`), rồi:

```
node tools/build-ky-nang-spec.js
node tools/kiem-ky-nang.js --anh /tmp/xem-ky-nang-tong.png
node tools/ve-pixel.js --spec tools/pixel/spec/ky-nang.json
node tools/ve-pixel.js --spec tools/pixel/spec/ky-nang.json --xem /tmp/xem-ky-nang
node tools/ve-pixel.js --spec tools/pixel/spec/ky-nang.json --out tools/pixel/goi/ky-nang.zip
node tools/ve-pixel.js --spec tools/pixel/spec/ky-nang.json --nap --ghi-de
node tests/ve-pixel/ky-nang.test.js
```

## 9. Bản đồ (ban-do)

Spec đọc từ dữ liệu bản đồ của game (đường đi + ô đặt tướng đúng như trong trận) — thêm / sửa bản đồ trong `js/data.js` thì chạy lại lệnh đầu.

```
node tools/build-ban-do-spec.js
node tools/ve-pixel.js --spec tools/pixel/spec/ban-do.json
node tools/ve-pixel.js --spec tools/pixel/spec/ban-do.json --xem /tmp/xem-ban-do
node tools/ve-pixel.js --spec tools/pixel/spec/ban-do.json --out tools/pixel/goi/ban-do.zip
node tools/ve-pixel.js --spec tools/pixel/spec/ban-do.json --nap --ghi-de
```

Quy tắc bản đồ: ô SÁT đường (ô đặt tướng) cùng một kiểu bệ đá elip viền đậm → nhận ra ngay chỗ đặt được; vùng xa đường chỉ là nền
trang trí theo chủ đề (cỏ, đá, cây, lau, nước…), không viền ô; đường cắt nhau (nhiều nhánh / tự cắt) → cầu tre.

## 10. Sau khi nạp

```
node tools/build-thu-vien.js
node tools/build-ve-pixel.js
node tests/run-all.js pixel ve-pixel
```

## Ghi chú

- `--nap` **không ghi đè** nguồn đã có (báo `E_NAP_TON_TAI`). Chạy lại sau khi sửa spec (nguồn do chính tool sinh ra): thêm `--ghi-de`,
  ví dụ `node tools/ve-pixel.js --spec tools/pixel/spec/nen.json --nap --ghi-de`. Không dùng `--ghi-de` lên bản vẽ tay.
- `--nap` lỗi build (mã thoát 2) thì tool **gỡ lại các nguồn vừa ghi** — không để nguồn dở dang.
- Gói zip nạp tay trong game: Cài đặt → Gói pixel → Nạp gói (.zip) → bật Pixel. Mỗi lần nạp thay gói cũ (gộp nhiều nhóm: chạy
  `node tools/ve-pixel.js --spec tools/pixel/spec/ --out goi-tat-ca.zip` — gộp mọi `*.json` trong thư mục).
- Xem nhanh mọi mã một nhóm: mở `/tmp/xem-<nhóm>/tong-quan.png` (hoặc từng `<nhóm>-<mã>.png`).
- Hình sinh bằng tool là **phác thảo khá** — muốn đẹp hơn: mở `tools/ve-pixel.html`, nạp `tools/pixel/goi/<nhóm>.zip`, chỉnh tay, xuất lại.
