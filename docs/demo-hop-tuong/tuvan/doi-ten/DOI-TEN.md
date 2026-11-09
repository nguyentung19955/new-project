# Đổi tên game: TURRET MERGE → ASTRAL ARSENAL (09/11)

Người dùng chốt 18:10. Tên trong game: **Astral Arsenal**. Tên đầy đủ trên cửa hàng: **Astral Arsenal: Merge Defense**.
Hợp chủ đề anime fantasy-tech (các chủng tộc anime điều khiển cỗ máy chạy bằng phép thuật), giao diện "Royal Twilight"
(indigo #10162F, vàng champagne #E9CCA0, cyan #71E4EE, cam đào #FFB866 — `../huong-anime/BANG-MAU.md`).

## Logo

Vẽ bằng ChatGPT, đính kèm `../huong-anime/mockup-D-royal-twilight.jpg` + ảnh HOME hiện tại; nền phẳng #FF00FF.
Ảnh thô: `docs/demo-hop-tuong/thap-art/`.

| Ảnh | Bố cục | Chính tả | Nhận xét |
|---|---|---|---|
| `raw_logo_aa_1.png` | 2 dòng ASTRAL / ARSENAL, cánh vàng, quả cầu chòm sao, sao cyan | ĐÚNG | **CHỌN** |
| `raw_logo_aa_2.png` | 2 dòng trên tấm bảng, nòng pháo pha lê nhỏ + vòng quỹ đạo phía trên | ĐÚNG | đẹp, nhưng nòng pháo nhỏ trông như ống nhòm, khối chữ nặng hơn |
| `raw_logo_aa_3.png` | 1 dòng trên bảng ngang, sao 8 cánh pha lê to giữa | ĐÚNG | chữ nhỏ khi hiện 280 px, sao giữa đè chữ "L A" |

Lý do chọn số 1: chữ to và rõ nhất ở cỡ hiện (280–290 css px), bố cục 2 dòng giữ đúng chỗ/tỉ lệ logo cũ (≈2,48:1 so với 2,44:1)
nên không phải sửa bố cục HOME; chi tiết sao/chòm sao hợp chữ "Astral", viền chàm dày đọc được cả trên nền thép màn tải lẫn nền đêm HOME.

- Tách nền: `python3 tools/thap-cat-logo-aa.py` → `thap/assets/logo_aa.png` (960×387 RGBA; bản .webp do `tools/thap-ver.py` sinh lúc xuất bản).
- Icon app: `raw_icon_aa.png` (huy hiệu vàng + sao pha lê cyan + nòng pháo pha lê, nền chàm đầy, không chữ) → `python3 tools/thap-icon.py` → `thap/assets/icon/*`.
- Ảnh trước/sau 390×844 (tải EN · HOME EN · HOME VI): `truoc-sau-390.jpg`.

## Đã đổi

| Chỗ | Cũ | Mới |
|---|---|---|
| `thap/index.html` `<title>` | TURRET MERGE | ASTRAL ARSENAL |
| meta `apple-mobile-web-app-title`, `application-name` | Turret Merge | Astral Arsenal |
| meta `description` | (không có) | Astral Arsenal: Merge Defense — … |
| `thap/manifest.webmanifest` name / short_name | TURRET MERGE / Turret Merge | Astral Arsenal: Merge Defense / Astral Arsenal |
| Logo màn tải (index.html css nội tuyến, `css/taitai.css`, nạp trước, `js/taitai.js`) | assets/logo.png | assets/logo_aa.png |
| Logo HOME `img.hm-logo` (src + alt) | logo.png / TURRET MERGE | logo_aa.png / ASTRAL ARSENAL |
| Logo màn ảnh gen `css/anhgen.css` | logo.png | logo_aa.png |
| `js/ngonngu.js` document.title | TURRET MERGE | ASTRAL ARSENAL |
| `js/rasoat.js` màn xoay dọc | Turret Merge is played in portrait only | Astral Arsenal is played in portrait only |
| `js/online/phong.js` chia sẻ phòng co-op | Join my TURRET MERGE co-op room / TURRET MERGE co-op | ASTRAL ARSENAL |
| `js/sound.js` SFX LAB, `nghe-am-thanh.html` | TURRET MERGE · … | ASTRAL ARSENAL · … |
| `docs/demo-hop-tuong/tuvan/ngonngu/vi.json` → `js/ngonngu-vi.js` | 4 khoá TURRET MERGE / Turret Merge | khoá + bản Việt tương ứng |
| Icon app `thap/assets/icon/*` | huy hiệu thép bát giác | huy hiệu Astral Arsenal |

## Cố ý KHÔNG đổi (giữ dữ liệu người chơi / hạ tầng)

| Thứ | Lý do |
|---|---|
| Khoá localStorage `turret_*`, `tm_*`, bộ đệm SW `tm-*` | đổi là người chơi mất tiến trình / tải lại hết |
| Firebase project `turret-merge`, tên miền `turret-merge.web.app`, gốc dữ liệu `turretmerge/`, `firebase-config.js`, `.firebaserc`, `firebase*.json` | hạ tầng + dữ liệu online |
| SKU mẫu `com.turretmerge.*` (kinhte.js, chưa dùng) | chỉ là ví dụ; đặt bundle id thật khi lên cửa hàng |
| Thư mục `thap/`, workflow `.github/workflows/*`, id nội bộ, tên biến | không hiện cho người chơi |
| Chú thích đầu file `// TURRET MERGE — …`, tài liệu cũ | không hiện; sửa hàng loạt dễ xung đột với phiên khác |
| `thap/assets/logo.png` (ảnh cũ) | giữ lại phòng quay lui; không còn được nạp |
| "Any turret merge counts" (skilldemo.js) | là câu mô tả "ghép ụ", không phải tên game |

## Việc cần làm khi lên cửa hàng

1. **Tra nhãn hiệu** "Astral Arsenal" (USPTO TESS, EUIPO eSearch, WIPO Global Brand Database, Cục SHTT Việt Nam) nhóm 9 & 41; tra trùng tên trên App Store / Google Play / Steam.
2. Đặt bundle id / package name mới (vd `com.<studio>.astralarsenal`) — đổi sau khi phát hành là không được.
3. Tên miền / trang chủ (nếu cần), mạng xã hội cùng tên.
4. Icon cửa hàng 1024×1024: `thap/assets/icon/icon-1024.png`; ảnh logo trong suốt: `thap/assets/logo_aa.png` (cần bản lớn hơn → cắt lại từ `raw_logo_aa_1.png`).
