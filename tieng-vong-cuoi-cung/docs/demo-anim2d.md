# Demo với Lam 2D (sheet ChatGPT cao 64 px) — `?anim=2d`

Cập nhật 17/10/2026. Giai đoạn 2 của hệ `anim2d`: Lam trong `game/demo.html` vẽ bằng `TV.Anim` từ sheet `game/anim/lam-chatgpt-80.png` + `.anim.json` (ô 80×80, pivot [40,79], cao 64 px). **Không có cờ thì demo y hệt bản cũ** (atlas Lam 3D cao 36 px).

## Cách bật

| Ở đâu | Cách |
|---|---|
| Bản GitHub (raw.githack) | https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html?anim=2d |
| Bản artifact (Demo trên claude.ai) | Artifact **không giữ `?query`**, nên: bấm **Bắt đầu** rồi bấm nút **"Lam 3D"** ở góc trên phải → trang tải lại với `#anim=2d`, nút đổi thành **"Lam 2D"**. Bấm lại để về 3D. Mở thẳng `…#anim=2d` cũng được. |
| Tự mở file build | `python3 game/build-demo.py` → `game/demo.build.html` (đã nhúng sheet + JSON dưới data URI), mở với `#anim=2d` hoặc dùng nút. |

Khi đang ở 2D, dưới dòng hướng dẫn có dòng vàng nhỏ: `Lam 2D thử nghiệm (sheet ChatGPT) · thật: idle, run, jump, fall, attack` (hiện vài giây sau khi bấm Bắt đầu).

Đã republish 2 artifact cùng tên "Tiếng Vọng – Demo Làng Chuông": bản mới nhất (`4MSPfW7QAStch3bd5394YU`) và bản trong README (`Q7zF46xo6ZbqnNtfPBa1My`) — cả hai giống nhau, đều có nút Lam 3D/2D.

## Animation nào thật, nào tạm

Lúc tích hợp xong, JSON đã có đủ **5 animation thật** (phiên khác vừa thêm jump/fall/attack cùng lúc): idle (1 khung tạm thời – chỉ là run‑0), run 8@12, jump 4@10 không loop, fall 2@8, attack 6@14 không loop (`hitFrames [2,3]` chỉ là metadata).

Nếu sau này JSON thiếu animation nào, `ghepSheet2D()` trong demo tự thêm hàng tạm vào sheet ghép (không vẽ lại Lam): idle thiếu → chép run‑0; jump/fall thiếu → chép khung run‑2 ("bay"); attack thiếu → khối màu `TV.Anim.placeholder` (và khi đó demo vẽ lại vệt chém cũ để thấy vùng đòn). Dòng vàng sẽ ghi `tạm: …`; `window.TVDEMO.anim2d = {thatSu, tam, pivot, o}` để kiểm.

Trạng thái → animation (`lamAnim2D()`): đứng = idle · chạy = run · vy<0 = jump (giữ khung cuối) · vy>0 = fall · chém = attack (mỗi nhát combo chạy lại từ khung 0; thời lượng đòn vẫn theo bảng `ATK` cũ, animation chỉ hiển thị) · trúng đòn/chết/lướt/áp tường chưa có trong sheet → dùng idle/fall/run tương ứng.

## Kỹ thuật (đã kiểm)

- `bp2.update(1000/60)` chỉ gọi trong `step()` (bước logic 60 Hz), không gọi trong `render()`.
- Pivot lấy từ JSON (`sheet.pivot`), không hard‑code. Chân vẽ tại đáy hitbox (x+5, y+15) như bản cũ → khi đứng, hàng chân (pivot y=79) nằm đúng hàng mặt đất `FLOOR=224` (đo headless: `chanY 224 = FLOOR 224`). Bản cũ chìm 2 px, bản 2D chìm 1 px (bằng quái) — không lơ lửng.
- Hitbox/vật lý Lam **không đổi** (10×15). Chỉ hình cao 64.
- Tiếng Vọng: `recordFrame()` ghi thêm `a2/k2/l2` (tên, khung, lật) mỗi bước; bóng và vệt lướt vẽ bằng `TV.Anim.veKhung()` từ dữ liệu đã ghi, **không** gọi `update()` cho bóng. Sheet bóng = sheet ghép tô `#CEF0D6` như trước.
- `lib/anim2d.js` **không sửa**. `build-demo.py` thêm `TV.ANIM2D_NHUNG` (JSON + PNG data URI) và nhúng `lib/anim2d.js` (5 thư viện thay vì 4).
- Quái / boss giữ atlas cũ.

## Ảnh kiểm (headless Chromium 960×540, `game/xem-thu/anh/`)

`demo-anim2d-dung.png` · `-chay.png` · `-nhay.png` · `-chem.png` · `-echo.png` (bóng đang phát lại, có vệt mờ + dấu "!") · `-echo-giu.png` (bóng giữ tư thế cuối) · `-khong-co.png` (không cờ: Lam 3D cũ, đối chứng).

## Chưa ổn / cần quyết

1. **Lam to hơn quái rõ rệt**: Lam 64 px, Quái Chuông Gỗ 32, boss 48 — chấp nhận tạm, sẽ nâng quái sau nếu giữ cỡ này.
2. **Idle chỉ 1 khung** (run‑0) → đứng im như tượng; sheet Idle 6 khung ChatGPT đã có nhưng chưa vào sheet game.
3. **Hitbox 10×15 nhỏ hơn hình nhiều**: vùng đòn `ATK` vẫn quanh đáy 15 px (ngang đầu gối Lam 64) — gameplay không đổi nhưng nhìn kiếm chém trên cao mà đòn trúng ở thấp. Cần chỉnh `ATK.box`/hitbox riêng cho cỡ 64 trong bước sau.
4. Thiếu animation trúng đòn, chết, lướt, áp tường, bật tường, tiếp đất, cast Vọng → đang tạm bằng idle/fall/run; không có chớp trắng khi trúng đòn (vẫn có nhấp nháy bất tử).
5. Lướt (dash) hiện bằng run; vệt lướt dùng sheet 2D tô màu — nhìn ổn.
6. Nút "Lam 3D/2D" nằm dưới màn Bắt đầu (cùng tầng với ⚙ 🔊), phải bấm Bắt đầu trước.
