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

Bỏ qua: `tuong` `quai` `boss` (đã đủ, có bản vẽ tay ở nhánh chính / `claude/pixel-quai-boss`), `an-phu` (`claude/pixel-anphu-thankhi`),
`ky-nang` (`claude/pixel-ky-nang-2`), `vfx` (`claude/vfx-pixel-2`).

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

## 7. Sau khi nạp

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
