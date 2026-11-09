# GIAI ĐOẠN D — THỬ THÁCH TUẦN · VÔ TẬN (SAU WAVE 70) · BẢNG XẾP HẠNG (thiết kế 09/11/2026)

> Nguồn: `tuvan/tien-trinh/THIET-KE.md` §4.3 (Thử thách tuần), §4.4 (Vô tận), N5–N6 (nhãn nguồn, chỉ xem bảng xếp hạng) ·
> khung chế độ C `tuvan/che-do-c/THIET-KE.md` (GAME MODE, RNG có hạt, khoá con `turret_kt.cd.*`, Tinh thể Đỏ) ·
> gacha `tuvan/gacha-thu-thap/BANG-MO-NHOM.md` (thưởng = rương, chỉ ụ trong bể rơi). Mã: `thap/js/chedo-d.js` + `thap/css/chedo-d.css`.
> Trả lời người dùng: *"Có chế độ endless khi qua level nào đó chưa"* — trước giai đoạn D **chưa có** (Solo dừng ở wave 70). Giai đoạn D thêm Vô tận.
> Mọi số = đề xuất ban đầu; đo lại khi có dữ liệu người chơi.

## 0. Nguyên tắc (giữ triết lý người dùng)

- **Vừa đủ khó**, không cầm tay chỉ việc: màn chọn chỉ nêu **luật** + **mốc**; không gợi ý bộ bài / cách vượt.
- **Đỏ hiếm**: không chế độ nào rơi bản Đỏ. Mỗi chế độ cho **tối đa 1 Tinh thể Đỏ / tuần** (mốc khó) → Ấn Đỏ (15 tinh thể).
- **Thưởng theo MỐC TUYỆT ĐỐI** (1 lần / tuần), **không theo thứ hạng** → điểm giả trên bảng xếp hạng không đổi ra tài nguyên (N6).
- **Tất định**: wave sinh bằng `rngHat` có hạt; code chế độ D **không gọi `Math.random`**; VFX không đổi gameplay.
- Không sát thương lan/tràn mới, không đột biến móc vào sát thương (chỉ luật lúc SINH quái — bảng `CDC.dot` của chế độ C).
- Không đổi khoá lưu cũ: khoá con mới `turret_kt.cd.vt` (Vô tận) và `turret_kt.cd.tw` (Thử thách tuần).

## 1. VÔ TẬN (ENDLESS) — sau wave 70 của Solo

**Mở**: thắng Solo (qua wave 70) — đúng lúc đó là lúc mở, nên không cần khoá theo cấp.

| Mục | Luật |
|---|---|
| Vào | (a) Solo qua wave 70 → bảng **"WAVE 70 CLEARED"**: `FINISH` (thắng như cũ) hoặc `ENDLESS` (đánh tiếp, trận dừng lại tới khi chọn). (b) GAME MODE → **ENDLESS** (mở sau lần thắng Solo đầu): trận Solo bình thường, qua wave 70 **tự vào Vô tận** không hỏi |
| Bàn / bộ bài | Giữ nguyên bàn Solo đang có (bộ tự chọn, cấp thẻ thật) — Vô tận là **Solo kéo dài**, không bàn mới |
| Máu quái | Theo đường cong Solo sẵn có (`mauWave`: ×1,08 mỗi wave sau wave 40) — không thêm hệ số |
| Trùm | wave 71–90: mỗi **5** wave (75, 80, 85, 90) · 91–100: mỗi **2** wave (92 … 100) · từ 101: **mỗi wave 1 trùm** + nửa wave quái thường. Trùm bốc tất định từ bể `trumBe(w)` theo hạt trận, không lặp liền |
| Đột biến | từ wave 101, **+1 đột biến mỗi 10 wave** (101, 111, 121 …), bốc tất định theo (tuần, chặng) trong {Swift, Thick Hide, Horde, Giants, Sky Raid} — giống nhau với mọi người trong tuần |
| Kết thúc | hết tim, hoặc bỏ cuộc trong menu tạm dừng → **vẫn tính THẮNG Solo** (đã qua 70) + điểm Vô tận |
| Điểm | **wave đạt được** (wave đang đánh khi kết thúc); hoà → thời gian trận ngắn hơn đứng trên |
| Túi trận | công thức Solo, trần 14 lượt (không lượt vô hạn) — §3.3 tiến trình |

**Mốc tuần** (1 lần / tuần, theo kỷ lục tuần): wave **80** = 2 000 vàng · **90** = 30 ngọc · **100** = **1 Tinh thể Đỏ** · **110** = 50 ngọc · **120** = **Rương Huyền thoại** (1 bản Vàng bảo đảm, chỉ ụ trong bể). Nhãn nguồn `endless`.
Lưu: `turret_kt.cd.vt = { best, bestT, tuan, tBest, tBestT, nhan{} }`.

## 2. THỬ THÁCH TUẦN (WEEKLY CHALLENGE) — mở Cấp phi công 8

| Mục | Luật |
|---|---|
| Xoay vòng | đổi mỗi **thứ Hai** (`KT.tuan()`); hạt tuần `H = bam('tw:' + tuần)` → **cùng hạt cho mọi người** |
| Bộ bài | **5 ụ cố định** bốc từ TOÀN roster theo H: 1 Vàng + 2 Tím + 1 Xanh + 1 Trắng, **không Đỏ**, ≥ 3 ụ gây sát thương. Cho mượn (không cần sở hữu) |
| Chỉ huy | cố định theo H (cho mượn) |
| Cấp thẻ | **chuẩn hoá +5** mọi thẻ (bỏ qua cấp của người chơi) → bảng xếp hạng công bằng |
| Đột biến | **2 / tuần** theo H trong {Swift, Thick Hide, Horde, Giants, Sky Raid} (không Glass Core — 50 wave 1 tim quá nặng) |
| Trận | wave 1 → **50**, mana 100, 3 tim, trùm mỗi 10 wave (lịch trùm theo H → như nhau); thành phần + nhịp sinh quái theo `rngHat(H, wave)` |
| Thắng / thua | qua wave 50 + sạch sân = hoàn thành; hết tim = dừng ở wave đó |
| Lượt | **không giới hạn**, lấy kết quả tốt nhất tuần |
| Điểm | wave đạt được (qua 50 = 51); hoà → thời gian ngắn hơn |
| Không tính | kỷ lục Solo, mốc wave Solo, điểm sự kiện, nhiệm vụ theo wave, Rương Trận (giống chế độ C) |

**Mốc tuần** (1 lần / tuần): wave **15** = 1 000 vàng · **25** = 30 ngọc · **35** = 1 bản **thẻ Vàng của bộ tuần** nếu ụ đó đã trong bể rơi của người chơi, nếu không → **Rương Huyền thoại** (1 Vàng bảo đảm, bể của mình) · **45** = **1 Tinh thể Đỏ**. Nhãn nguồn `weekly`.
Lưu: `turret_kt.cd.tw = { tuan, best, bestT, nhan{} }` (tuần mới → làm mới).

## 3. BẢNG XẾP HẠNG (LEADERBOARD) — chỉ để XEM

- 3 bảng: **Thử thách tuần** (tuần này) · **Vô tận tuần này** · **Vô tận mọi thời đại**. Hiện top 50 + dòng của mình.
- Ghi (Realtime Database, dưới gốc `turretmerge/`): `lb/tw/{tuần}/{uid}`, `lb/vt/{tuần}/{uid}`, `lb/vtAll/{uid}` =
  `{ n: tên ≤16, av, w: wave, t: giây trận, k: w·100000 + (99999 − t), at: giờ máy chủ, v: 1 }`. Đọc: `orderByChild('k').limitToLast(50)`.
- Chỉ gửi khi **vượt kỷ lục của mình** (máy giữ kỷ lục; gửi lỗi → thử lại lần mở bảng sau).
- **Ngoại tuyến / chưa có rules / chưa đăng nhập**: bảng hiện **kỷ lục cá nhân** + nhãn **"NOT CONNECTED"** (không lỗi, không chặn chơi).

### 3.1 Chống gian lận tối thiểu (giai đoạn D)

| Lớp | Cách |
|---|---|
| Rules | phải đăng nhập (ẩn danh được), chỉ ghi ô `uid` của mình; `w` 1…51 (tuần) / 1…999 (vô tận); `t ≥ 6·w` giây (không thể nhanh hơn); `k` khớp công thức; `k` **chỉ tăng**; `at = now`; tên ≤ 16 ký tự; không trường lạ |
| Client | điểm lấy từ trận thật (`G.wave`, `G.t`), không gửi từ trận thử (`?mana=`, `?wave=`…) |
| Thiết kế | thưởng theo mốc tuyệt đối → giả điểm không có lợi tài nguyên; bảng chỉ để xem |

**GIỚI HẠN (ghi rõ)**: bản lưu + mô phỏng chạy ở MÁY người chơi → người sửa mã vẫn gửi được điểm giả hợp lệ theo rules. Giai đoạn **F** mới làm sổ cái phía server
(Cloud Functions ghi điểm, kiểm bằng **phát lại** hạt + chuỗi thao tác, khoá theo tài khoản Google). Tới lúc đó: quản trị xoá tay mục bất thường (đọc ở bảng điều khiển Firebase).

### 3.2 ĐỀ XUẤT RULES (anh tự triển khai — phiên này KHÔNG sửa `firebase.json`, `.firebaserc`, workflow)

Thêm vào `docs/demo-hop-tuong/turretmerge-database.rules.json`, trong `"turretmerge"` (cạnh `"profiles"`, `"rooms"`):

```json
"lb": {
  ".read": "auth != null",
  "tw":    { "$tuan": { ".indexOn": ["k"], "$uid": { ".write": "auth != null && auth.uid === $uid",
      ".validate": "newData.hasChildren(['n','w','t','k','at']) && newData.child('w').val() <= 51 && (!data.exists() || newData.child('k').val() > data.child('k').val())" } } },
  "vt":    { "$tuan": { ".indexOn": ["k"], "$uid": { ".write": "auth != null && auth.uid === $uid",
      ".validate": "newData.hasChildren(['n','w','t','k','at']) && (!data.exists() || newData.child('k').val() > data.child('k').val())" } } },
  "vtAll": { ".indexOn": ["k"], "$uid": { ".write": "auth != null && auth.uid === $uid",
      ".validate": "newData.hasChildren(['n','w','t','k','at']) && (!data.exists() || newData.child('k').val() > data.child('k').val())" } },
  "$other": { ".validate": false }
}
```

và trong mỗi `$uid` ở trên thêm các ô (chép y nguyên cho cả 3 bảng):

```json
"n":  { ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 16" },
"av": { ".validate": "newData.isString() && newData.val().length <= 24" },
"w":  { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 999" },
"t":  { ".validate": "newData.isNumber() && newData.val() >= newData.parent().child('w').val() * 6 && newData.val() < 100000" },
"k":  { ".validate": "newData.isNumber() && newData.val() === newData.parent().child('w').val() * 100000 + 99999 - newData.parent().child('t').val()" },
"at": { ".validate": "newData.val() === now" },
"v":  { ".validate": "newData.isNumber()" },
"$other": { ".validate": false }
```

Triển khai: `firebase deploy --only database` (dự án `turret-merge`). Chưa triển khai → bảng ở chế độ ngoại tuyến (§3), game không ảnh hưởng.
Sổ cái tuần cũ: giữ (nhẹ, ≤ 50 × số người); giai đoạn F thêm hàm dọn > 8 tuần.

## 4. Kinh tế cộng thêm / tuần (tối đa)

| Nguồn | Vàng | Ngọc | Rương | Tinh thể Đỏ |
|---|---|---|---|---|
| Thử thách tuần | 1 000 | 30 | 1 bản Vàng (thẻ tuần hoặc Rương HT) | 1 (wave 45) |
| Vô tận | 2 000 | 80 | 1 Rương HT (wave 120) | 1 (wave 100) |

Người Thường (wave Solo 25–35) gần như chỉ lấy mốc 15/25 của Thử thách tuần (+1 000 vàng, +30 ngọc). Người Giỏi: tối đa **2 tinh thể/tuần** từ D
(+1 Trùm tuần của C) → Ấn Đỏ ≈ 1 / 5–8 tuần (khớp §4 thiết kế C). Đỏ vẫn hiếm hơn Vàng rõ rệt.

## 5. Nơi vào + hình

| Chế độ | Mở | Nơi vào |
|---|---|---|
| Thử thách tuần | Cấp 8 | HOME → GAME MODE → WEEKLY CHALLENGE → PLAY (bảng: bộ tuần, đột biến, mốc, bảng xếp hạng, START) |
| Vô tận | thắng Solo | Solo wave 70 → ENDLESS · hoặc GAME MODE → ENDLESS → PLAY (bảng: luật, mốc, bảng xếp hạng, START) |

Hình (chỉ ảnh có sẵn, phong cách Royal Twilight `ua_*`): Thử thách tuần = `ua_ic_su` (lịch sự kiện) · Vô tận = `ua_ic_trum`… (xem mã `CDD.ICON`).
Không filter blur / drop-shadow động; animation liên tục chỉ transform/opacity (lỗi nóng iPhone).
Prompt chờ gen (lưới 2×2, nền magenta #FF00FF, same style as attached ua_ic_*): "endless emblem: infinity ring of stars" · "weekly challenge emblem: calendar with crossed swords" · "leaderboard emblem: laurel podium".

## 6. Thứ tự làm + kiểm

1. Vô tận — `tools/thap-kt-vo-tan.js` · 2. Thử thách tuần — `tools/thap-kt-thu-thach-tuan.js` · 3. Bảng xếp hạng — `tools/thap-kt-bxh.js` (ngoại tuyến + giả lập NET).
Mỗi mục chạy kèm `thap-kt-thap-leo`, `thap-kt-san-trum`, `thap-kt-tien-trinh`, `thap-kt-so-huu`, `thap-kt-shop`; chơi thật 390×844 + 844×390, EN + VI, xem ảnh tận mắt.
