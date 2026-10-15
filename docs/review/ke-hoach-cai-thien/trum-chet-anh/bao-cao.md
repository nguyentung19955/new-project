# Báo cáo — trùm vùng gục ở pha 2, pha 3: đưa 6 tấm ảnh vào game (15/10)

Không chạy game, không test: chỉ xử lý ảnh, ảnh soát tĩnh, `node --check`, `build.py`.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master.

## Đã làm

**1. Tách 6 tấm thành hàng `die`** (`cong-cu/tach-die.py`, chạy lại an toàn — có hàng die cũ thì bỏ trước):
`docs/anh-goc/trum-moi/chet/{moc-tinh,ngu-tinh,ho-tinh}-{p2,p3}-chet.png` (RGBA, nền trong suốt) →
hàng mới cuối tấm trong `game/art/custom/{mocTinh,nguTinh,hoTinh}-{p2,p3}.sprite.json`:
`"die": {"hang": 4, "so": 8, "giay": 1.2, "mo": 0.6}`. `SC.phaTrum` nhận hàng `die` sẵn → game dùng ngay.

- **Cắt theo alpha**: mỗi chỗ giáp giữa hai khung là một *đường cắt dọc hẹp nhất* (mỗi hàng điểm ảnh lệch ≤ 1 cột, trong dải ±W/14
  quanh mốc W·k/8, chi phí = điểm có alpha ≥ 48). Các khung chạm nhau (Mộc Tinh p2 khung 3–6, Mộc Tinh p3 khung 4–6, Ngư Tinh p3 khung 1–2,
  3–5) — nếu cắt thẳng một cột thì còn 30–70 điểm đặc nằm trên cột cắt; đường cắt uốn theo khe nên **0 điểm đặc trên cả 42 đường cắt** → không mẩu khung bên nào lọt sang.
- **Alpha cắt sắc 128** (sau khi thu phóng trên alpha nhân sẵn, LANCZOS): hào quang/nước/lửa mờ (alpha < 128) bỏ, ảnh chỉ còn 0 / 255 như các hàng khác.
- **Bảng màu**: màu hàng mới đưa về đúng bảng 128 màu sẵn có của từng tấm (màu gần nhất, không hoà sắc), tấm vẫn là PNG bảng màu 129 mục.
  Sai màu trung bình mỗi kênh: Mộc p2 6,4 · Mộc p3 6,9 · Ngư p2 10,4 · Ngư p3 6,7 · Hồ p2 8,7 · Hồ p3 5,9 (trên 255) — xem ảnh soát, không thấy lệch màu.
- **Các hàng cũ giữ y nguyên từng điểm ảnh** (đã so: idle/tele/atk/hit trùng tuyệt đối, phần nới rộng trống); chỉ đổi `tam`, `dong_tac`, `can_tam`.
- Hồ Tinh p3 trước chỉ rộng 7 cột → nới thành 8 cột (2604 → 2976 điểm ảnh) cho đủ 8 khung gục.

**2. Chuẩn cỡ, căn chân / tâm**
- Đo **thân** = khối liền lớn nhất (alpha ≥ 128; bỏ đốm, lá, giọt, hào quang rời). Hệ số = trung bình của (căn bậc hai tỉ lệ diện tích thân) và
  (tỉ lệ chiều cao thân): trung bình các khung idle của tấm pha / khung 1 tấm gục. Dùng cả diện tích vì khung 1 tấm gục giơ vây/cành cao hơn dáng đứng.
  Hệ số: Mộc p2 0,679 · Mộc p3 0,704 · Ngư p2 0,632 · Ngư p3 0,612 · Hồ p2 0,902 · Hồ p3 1,053.
- Chân: đáy điểm đặc mỗi khung đặt đúng đường đất `goc[1]` (như hàng idle: đáy = goc[1]·net).
- Tâm: tâm thân trên sàn (35% dưới, cùng cách đo của `trum-chet-pha3/cong-cu/can-tam.py`) đặt đúng `goc[0]`; rồi ghi `can_tam.die` bằng đúng
  công thức của can-tam.py (hàng một lần: bỏ trung vị + nửa độ nhảy). Kết quả gần như 0; riêng Mộc p2 khung 5 (rộng, đổ về trước)
  phải dịch vào trong ô để không bị cắt mép → `can_tam` −4. Không khung nào bị cắt mất điểm ảnh.

**3. Đường tạm "chết bằng hàng trúng đòn"** (`js/sprite_custom.js`, nhánh `G.PHA_TRUM_DU` trong `SC.veQuai`): nay 6 tấm pha 2/3 đã có `die`
nên `SC.phaTrum(sp, pha, 'die')` trả về tấm pha và **nhánh tạm không còn chạy cho Mộc/Ngư/Hồ Tinh**. Không xoá nhánh vì nó vẫn phục vụ
tấm pha của trùm nhỏ (`namChua-p2`, `cuaDa-p2`, `hoLua-p2` chỉ có 4 hàng, cùng nhánh đó lo cả lúc đi `move`). Chỉ sửa chú thích; không vẽ code mới.
`SC.chonTrum` ('die'): quằn quại hàng hit rồi phát hàng die 10 khung/giây, xong đúng lúc bắt đầu mờ (`mo` 0,6) — như pha 1.

**4. Ảnh soát**: `xem-trum-chet.png` (6 hàng: idle khung 1 + 8 khung die, đã áp `can_tam`, cùng tỉ lệ 1:1 điểm ảnh game, vạch đất đỏ, vạch neo xanh)
và `xem-trum-chet.gif` (6 ô: đứng thở → gục 10 khung/giây → mờ). Vẽ bằng `cong-cu/ve-soat.py`.

**5. Dung lượng** (`python3 build.py --hai-tep`, bản ảnh rời):

| | Trước | Sau |
|---|---|---|
| NGƯỜI CHƠI TẢI (trần 20 MB) | 13,28 MB | **14,11 MB** (+0,83) |
| không WebP | 15,53 MB | 16,41 MB |
| Vùng Rừng / Biển / Lâu đài (WebP) | 3,20 / 2,39 / 2,97 MB | 3,46 / 2,60 / 3,32 MB |
| Tải trước vùng đầu | 4,73 MB | 4,73 MB (không đổi — ảnh trùm tải theo vùng) |
| Một tệp (trần 30 MB) | 22,44 MB | 23,61 MB |

Còn dư ~5,9 MB dưới trần 20 MB → không cần giảm màu / cắt viền. (Phiên `quai-moi-6-con`, `hieu-ung-ky-nang` chạy song song có thể cộng thêm; số trên là lúc build của phiên này.)

## Tệp đã đổi

- `game/art/custom/{mocTinh,nguTinh,hoTinh}-{p2,p3}.sprite.json` — thêm hàng die + `can_tam.die`.
- `game/js/sprite_custom.js` — chỉ chú thích (`node --check` đạt).
- `game/dist/*`, `tools/xuong-sprite/index.html` — build lại.
- `docs/review/ke-hoach-cai-thien/trum-chet-anh/`: `cong-cu/chung.py`, `cong-cu/do.py` (đo cột cắt, thân), `cong-cu/tach-die.py`, `cong-cu/ve-soat.py`, hai ảnh soát, báo cáo này.

## Ghi chú

- Hồ Tinh p2: tấm gục AI vẽ lửa đỏ-cam nhiều hơn dáng pha 2 (đỏ tím); khung 7–8 tan thành lửa hồ ly tím. Đã đưa về bảng màu tấm pha 2 nên tông khớp; thân cùng cỡ.
- Khung 8 của Hồ Tinh p2 chỉ còn vài đốm lửa nhỏ (đúng prompt "a few small fading wisps"), lại đang mờ dần → gần như trống, cố ý.
- Chưa xem trong game (không chạy game theo yêu cầu).
