# TURRET MERGE — Tài khoản + CO-OP online (Firebase)

Code: `thap/js/online/*.js`, `thap/css/online.css` · Kiểm: `tools/thap-kt-online.js` (+ máy chủ giả `tools/thap-online-mock-server.js`) · 2026-11-05

## 1. Dự án Firebase (đã cấu hình sẵn trên console)

- Project: **turret-merge** (gói Spark, miễn phí) — chủ game đã tạo; cấu hình web: `thap/js/online/firebase-config.js`
  (`window.FIREBASE_CONFIG`, nay đã thêm `databaseURL`). Đây là cấu hình web công khai, không phải mật khẩu.
- Authentication: bật **Anonymous** + **Google**. Tên hiển thị "Turret Merge". Authorized domain: `nguyentung19955.github.io` (localhost có sẵn).
- Realtime Database: `https://turret-merge-default-rtdb.asia-southeast1.firebasedatabase.app` (Singapore).
- Không dùng dự án `sontinhthuytinh` (Talesworn): không đụng Firestore, luật, đăng nhập hay code của Talesworn.
- Mọi dữ liệu game nằm dưới `turretmerge/`:
  - `turretmerge/profiles/{uid}` — hồ sơ: `name`, `av` (ảnh phi công), `bestWave`, `wins`, `games`, `g` (đã nối Google), `at`.
  - `turretmerge/rooms/{CODE}` — phòng CO-OP online: `meta{host,at,st,seed,k0}` · `members/{uid}=true` · `khach` (uid khách) ·
    `pl/{uid}` (tên, ảnh, bộ bài, chỉ huy, READY, online) · `act/` (hành động trong trận) · `snap/{uid}` (ảnh chụp bàn) · `ping/{uid}` · `state` (tim, wave, kết thúc).
- Rules đang publish (bản do phiên cấu hình console dán) — code online chạy được NGAY với luật này:
```json
{"rules":{"turretmerge":{
  "profiles":{"$uid":{".read":"auth != null",".write":"auth != null && auth.uid === $uid"}},
  "rooms":{"$code":{".read":"auth != null",
    ".write":"auth != null && (!data.exists() || data.child('members').child(auth.uid).exists() || newData.child('members').child(auth.uid).exists())"}}}}}
```
- SDK: Firebase JS 10.14.1 bản compat, **để sẵn trong repo** (`thap/js/online/vendor/`, ~340 KB) thay vì CDN gstatic — chỉ tải sau khi menu hiện.

## 2. Chủ game cần làm gì trong console?

**Bắt buộc: không cần làm gì** — dự án, đăng nhập, tên miền, database và luật đã có.

**Nên làm (5 phút, tăng bảo mật):** luật hiện tại cho mọi người đã đăng nhập đọc mọi phòng và mọi thành viên ghi bất cứ gì trong phòng.
Bản luật chặt hơn ở mục 4 (đúng yêu cầu: phòng chỉ thành viên đọc/ghi, tối đa 2 người, giới hạn kích thước):
1. Mở https://console.firebase.google.com → dự án **turret-merge**.
2. Menu trái **Build** → **Realtime Database** → tab **Rules**.
3. Xoá hết chữ trong ô → dán nguyên khối JSON ở mục 4 (hoặc file `docs/demo-hop-tuong/turretmerge-database.rules.json`) → bấm **Publish**.
4. Mở game, tạo phòng thử. Nếu báo `permission_denied` → quay lại tab Rules, bấm **Rules history** (biểu tượng đồng hồ) → chọn bản cũ → Restore, rồi báo lại.

## 3. Cách chơi

- Menu: chip **tài khoản** (góc trên trái: ảnh + tên + GUEST/GOOGLE) → đổi tên, chọn ảnh phi công, xem Best wave / Wins / Matches,
  **SIGN IN WITH GOOGLE**: khách đang chơi được **nối** vào Google (giữ nguyên hồ sơ); Google đã có hồ sơ ở máy khác → chuyển sang hồ sơ đó.
  Máy tính: cửa sổ bật lên (popup; bị chặn → tự chuyển trang). iPhone/iPad (Safari, cả khi mở từ màn hình chính): **chuyển trang (redirect)**,
  kết quả xử lý khi trang mở lại (`getRedirectResult`). Khách → Google dùng `linkWithPopup` / `linkWithRedirect` nên **giữ nguyên uid**.
  *Rủi ro đã biết:* Safari chặn bộ nhớ chéo tên miền (ITP) giữa `github.io` và `turret-merge.firebaseapp.com`; nếu trên iPhone bấm Google
  xong quay lại vẫn ghi GUEST → báo lại để đổi sang popup (1 dòng trong `net.js`: `chuyenTrang = this.laIOS() || this.laApp()`).
- Nút **ONLINE** (hàng chế độ) → **CREATE ROOM** (mã 4 chữ + **SHARE INVITE LINK** `…/thap/?phong=ABCD`) hoặc gõ mã → **JOIN**.
- Sảnh: thẻ 2 người (ảnh, tên, đèn online, 5 ụ + chỉ huy, READY). Cả 2 **READY** → cùng vào trận. Phòng đủ 2 người → người thứ 3 "Room is full".
- Trong trận: mỗi người điều khiển bàn của mình (bàn dưới); bàn trên là đồng đội thật, nhãn bàn ghi `Tên · NN ms` (độ trễ). 3 tim chung.
  Tốc độ khoá 1×; nút tạm dừng = tạm dừng cả 2.
- Mất mạng / bạn kia thoát: trận dừng, đếm 10 s. Quay lại kịp → chơi tiếp. Quá 10 s → **CONTINUE WITH AI** (bàn bạn kia giao cho máy) hoặc **END MATCH**.
  Tải lại trang giữa trận → ONLINE → **REJOIN MATCH** (khôi phục bàn + wave + tim).
- Hết trận → chủ phòng **xoá phòng** sau 5 s (khách nhận kết quả trước rồi tự rời) → **PLAY ONLINE AGAIN** (mở bảng ONLINE, tạo / vào phòng mới) / **EDIT DECK**.
- Phòng cũ hơn **2 giờ** (`meta.at`) bị bỏ qua: JOIN báo "not found", REJOIN không hiện; tạo phòng không ghi đè phòng của người khác (đổi mã).
- CO-OP với máy (offline), SOLO, PVP giữ nguyên. `?net=0` = tắt online.

## 4. Đề xuất rules (chặt hơn — tuỳ chọn, khuyên dùng)

**Code KHÔNG cần đổi rules**: đã kiểm với máy chủ giả thi hành đúng rules đang publish (mục 1) — 0 lần bị từ chối (mục 6).
Bản dưới chỉ để tăng bảo mật; phiên này **không** đổi console.

```json
{
  "rules": {
    "turretmerge": {
      "profiles": {
        "$uid": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid === $uid",
          ".validate": "newData.hasChildren(['name'])",
          "name": {
            ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 16"
          },
          "av": {
            ".validate": "newData.isString() && newData.val().length <= 24"
          },
          "bestWave": {
            ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999"
          },
          "wins": {
            ".validate": "newData.isNumber() && newData.val() >= 0"
          },
          "games": {
            ".validate": "newData.isNumber() && newData.val() >= 0"
          },
          "g": {
            ".validate": "newData.isBoolean()"
          },
          "at": {
            ".validate": "newData.isNumber()"
          }
        }
      },
      "rooms": {
        "$code": {
          ".validate": "$code.matches(/^[A-Z]{4}$/) && newData.hasChildren(['meta', 'members'])",
          ".read": "auth != null && data.child('members').child(auth.uid).exists()",
          ".write": "auth != null && ((!data.exists() && newData.child('meta/host').val() === auth.uid && newData.child('members').child(auth.uid).exists()) || (!newData.exists() && (data.child('meta/host').val() === auth.uid || data.child('meta/at').val() < now - 21600000)))",
          "meta": {
            ".read": "auth != null",
            ".write": "auth != null && data.child('host').val() === auth.uid && newData.exists()",
            ".validate": "newData.hasChildren(['host', 'at', 'st', 'seed']) && newData.child('host').val() === auth.uid",
            "host": {
              ".validate": "newData.isString() && newData.val().length <= 128"
            },
            "at": {
              ".validate": "newData.isNumber() && newData.val() <= now"
            },
            "st": {
              ".validate": "newData.val() === 'cho' || newData.val() === 'tran'"
            },
            "seed": {
              ".validate": "newData.isNumber()"
            },
            "k0": {
              ".validate": "newData.isString() && newData.val().length <= 40"
            },
            "v": {
              ".validate": "newData.isNumber()"
            },
            "$other": {
              ".validate": false
            }
          },
          "members": {
            "$uid": {
              ".write": "auth != null && $uid === auth.uid && (!newData.exists() || newData.parent().parent().child('khach').val() === auth.uid)",
              ".validate": "newData.isBoolean()"
            }
          },
          "khach": {
            ".write": "auth != null && ((!data.exists() && newData.val() === auth.uid && data.parent().child('meta').exists() && data.parent().child('meta/host').val() !== auth.uid) || (data.val() === auth.uid && (newData.val() === auth.uid || !newData.exists())) || (data.parent().child('meta/host').val() === auth.uid && !newData.exists()))",
            ".validate": "newData.isString() && newData.val().length <= 128"
          },
          "pl": {
            ".write": "auth != null && data.parent().child('meta/host').val() === auth.uid && !newData.exists()",
            "$uid": {
              ".write": "auth != null && $uid === auth.uid && data.parent().parent().child('members').child(auth.uid).exists()",
              "name": {
                ".validate": "newData.isString() && newData.val().length <= 16"
              },
              "av": {
                ".validate": "newData.isString() && newData.val().length <= 24"
              },
              "deck": {
                ".validate": "newData.isString() && newData.val().length <= 200"
              },
              "mv": {
                ".validate": "newData.isString() && newData.val().length <= 16"
              },
              "ready": {
                ".validate": "newData.isBoolean()"
              },
              "on": {
                ".validate": "newData.isBoolean()"
              },
              "vao": {
                ".validate": "newData.isBoolean()"
              },
              "$other": {
                ".validate": false
              }
            }
          },
          "act": {
            ".write": "auth != null && data.parent().child('meta/host').val() === auth.uid && !newData.exists()",
            "$id": {
              ".write": "auth != null && !data.exists() && data.parent().parent().child('members').child(auth.uid).exists()",
              ".validate": "newData.hasChildren(['u', 'k', 'tk']) && newData.child('u').val() === auth.uid && $id.length <= 40",
              "u": {
                ".validate": "newData.isString()"
              },
              "k": {
                ".validate": "newData.isString() && newData.val().length <= 8"
              },
              "tk": {
                ".validate": "newData.isNumber()"
              },
              "d": {
                ".validate": "newData.isString() && newData.val().length <= 1000"
              },
              "$other": {
                ".validate": false
              }
            }
          },
          "snap": {
            ".write": "auth != null && data.parent().child('meta/host').val() === auth.uid && !newData.exists()",
            "$uid": {
              ".write": "auth != null && $uid === auth.uid && data.parent().parent().child('members').child(auth.uid).exists()",
              ".validate": "newData.isString() && newData.val().length <= 3000"
            }
          },
          "ping": {
            ".write": "auth != null && data.parent().child('meta/host').val() === auth.uid && !newData.exists()",
            "$uid": {
              ".write": "auth != null && $uid === auth.uid && data.parent().parent().child('members').child(auth.uid).exists()",
              "t": {
                ".validate": "newData.isNumber()"
              },
              "e": {
                ".validate": "newData.isNumber()"
              },
              "$other": {
                ".validate": false
              }
            }
          },
          "state": {
            ".write": "auth != null && data.parent().child('meta/host').val() === auth.uid",
            "tim": {
              ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10"
            },
            "wave": {
              ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 999"
            },
            "end": {
              "thang": {
                ".validate": "newData.isBoolean()"
              },
              "ly": {
                ".validate": "newData.isString() && newData.val().length <= 80"
              },
              "$other": {
                ".validate": false
              }
            },
            "$other": {
              ".validate": false
            }
          },
          "$other": {
            ".validate": false
          }
        }
      }
    }
  }
}
```

Luật làm gì:
- Ngoài `turretmerge/` mọi thứ đóng (mặc định của Realtime Database).
- `profiles/{uid}`: người đã đăng nhập (kể cả khách) đọc được; chỉ chủ tài khoản ghi; tên 1–16 ký tự, số trong khoảng hợp lý.
- `rooms/{CODE}`: mã đúng 4 chữ in hoa; tạo mới phải tự ghi mình là `meta.host` + `members`. **Chỉ thành viên** đọc/ghi;
  người ngoài chỉ đọc `meta` (để biết phòng có tồn tại). Vào phòng = ghi `khach` (chỉ khi còn trống) + `members/{mình}` trong 1 lần → tối đa 2 người.
  Mỗi người chỉ ghi `pl/` `snap/` `ping/` của mình; `act/` chỉ thêm mới, không sửa/xoá của người khác, ≤ 1000 ký tự; `snap` ≤ 3000 ký tự;
  `state` (tim, wave, kết thúc) chỉ chủ phòng ghi; chủ phòng xoá được phòng.
- **Dọn rác (TTL)**: Realtime Database không tự xoá theo thời gian. Game tự xoá phòng khi chủ phòng rời phòng **và khi hết trận**;
  phòng bỏ dở quá **2 giờ** bị game bỏ qua (luật đề xuất còn cho phép ai cũng xoá phòng > 6 giờ; game không tự xoá phòng của người khác). Mỗi phòng vài chục KB; gói Spark (1 GB lưu, 10 GB tải/tháng,
  100 kết nối cùng lúc) dư cho chơi thử. Dọn tay: Realtime Database → Data → `turretmerge/rooms` → xoá.

## 5. Kỹ thuật đồng bộ ("lockstep-lite")

- Cả 2 máy chạy cùng mô phỏng; mỗi wave sinh bằng RNG hạt giống chung (`meta.seed`, công thức như PVP) → cùng loại quái/trùm/thời điểm.
  Chủ phòng quyết định lúc bắt đầu mỗi wave (`act w`), máy khách chờ; khách đổi làn để làn 0 luôn là của mình.
- Chỉ gửi **hành động** kèm tick: `tr` triệu hồi (ô, ụ, sao) · `gh` ghép (2 ô + ụ ra) · `nc` nâng cấp · `mv` chỉ huy · `cd` kỹ năng chủ động ·
  `l` khách lọt quái · `pa` tạm dừng chung · `vao` đã vào trận · `bye` rời. Bàn đồng đội = con rối dựng từ hành động của bạn kia
  (AI không lái, triệu hồi ngẫu nhiên bị chặn).
- Mỗi 1 s gửi **ảnh chụp bàn** (15 ô `id:sao`, LV, mana, chỉ huy) + mã băm FNV; bên nhận băm bàn con rối, lệch → sửa đúng ô lệch.
  Ảnh chụp cũng là nhịp tim: > 4 s không nghe gì = mất kết nối.
- Tim chung: host giữ; quái lọt làn host → host trừ; quái lọt làn khách → khách gửi `l` → host trừ → `state.tim` cho cả 2.
  Quái lọt làn đồng đội trong máy mình không tính. Hết tim → host ghi `state.end` → cả 2 hiện kết quả.
- Ping: mỗi 2 s ghi `ping/{uid}.t`, bên kia trả `e` ngay → vòng đi-về.
- Giới hạn đã biết: sát thương/chí mạng vẫn ngẫu nhiên riêng từng máy → số quái còn sống ở làn đồng đội có thể lệch đôi chút
  (không ảnh hưởng tim, vì mỗi làn chỉ máy chủ làn đó tính); hiệu ứng kỹ năng của bạn kia lên bàn mình chạy theo máy mình.

## 6. Kiểm (2026-11-05)

Máy kiểm không gọi được Firebase thật (mạng chặn `*.firebasedatabase.app`, `identitytoolkit`, `gstatic`) và không tải được Firebase emulator
(cần `storage.googleapis.com`) → kiểm bằng **máy chủ giả** mô phỏng phần Realtime Database đã dùng + 2 trình duyệt Playwright:

```bash
DELAY=40 NODE_PATH=<thư mục có node_modules/ws> node tools/thap-online-mock-server.js 8787 &
OUT=docs/demo-hop-tuong/tuvan/online/ node tools/thap-kt-online.js
```

Kết quả: `docs/demo-hop-tuong/tuvan/online/ket-qua.txt` + ảnh cùng thư mục.
Đã kiểm thêm: SOLO / CO-OP máy / PVP chơi bình thường, không lỗi; SDK Firebase thật tải + khởi tạo không lỗi JS (chỉ lỗi mạng của máy kiểm).
Trình duyệt tự động (navigator.webdriver) không gọi Firebase thật trừ khi có `?net=fb` (để bài kiểm của các phiên khác không bị lỗi mạng).
Chưa chạy thử trên Firebase thật — lần đầu mở trên điện thoại nếu chip ghi `OFFLINE` / bảng ghi lỗi, chụp màn hình gửi lại.

### Kiểm thêm theo đúng rules đang publish (phiên 2, 2026-11-05)

Firebase thật vẫn bị mạng máy kiểm chặn (403 cho `gstatic`, `identitytoolkit.googleapis.com`, `*.firebasedatabase.app`) → chạy
**đúng đường code Firebase** (`?net=fb`, `NET._moFirebase`) nhưng thay 3 tệp `js/online/vendor/*` bằng SDK giả nối tới máy chủ giả
**thi hành nguyên văn rules đang publish** (đọc chỉ ở `profiles/$uid`, `rooms/$code`; ghi `rooms/$code` chỉ khi phòng chưa có / đã là
`members/{uid}` / tự thêm mình vào `members`). Công cụ: `tools/thap-fb-gia/` (`server.js`, `client.js`, `kt-2-may.py`).
Kết quả (2 context Playwright 390×844, ảnh `tuvan/online/2may_*.jpg` — 2 điện thoại cạnh nhau):
- Khách ẩn danh mặc định ✔ · nối Google: máy tính = popup, iPhone UA = redirect, **uid giữ nguyên** cả 2 ✔
- Phòng 3 giờ tuổi → "Room not found" ✔ · mã sai → "not found" ✔ · tạo phòng + JOIN → `members` có đúng 2 uid ✔ · người thứ 3 → "full" ✔
- Cả 2 READY → vào trận; 2 wave: cùng wave 3/3, bàn mình ↔ bàn đồng đội máy kia **15/15 ô** cả 2 chiều ✔
- Tim chung: khách lọt 1 quái → host trừ → cả 2 còn 2/3 ✔
- Đóng hẳn context khách → host "PARTNER DISCONNECTED" + dừng trận, `pl/{uid}/on=false` (onDisconnect) ✔ → mở lại (cùng uid) → REJOIN MATCH →
  cùng wave, tim 2, bàn khôi phục 15/15, host chạy tiếp; chơi thêm 1 wave vẫn 15/15 ✔
- Hết trận → cả 2 thấy kết quả; chủ phòng xoá phòng; khách tự rời im lặng; PLAY ONLINE AGAIN mở bảng ONLINE ✔
- Máy chủ: **0 thao tác bị rules từ chối**, 0 phòng còn lại (đã xoá phòng thử), 0 lỗi trang.
`tools/thap-kt-online.js` (máy chủ giả cũ) cũng cập nhật cho luồng mới: hết trận → phòng bị xoá → phòng mới → trận mới — toàn bộ OK.

## 7. Quay lui

- Tắt online cho mọi người: để `apiKey: ""` trong `thap/js/online/firebase-config.js` (hoặc xoá 6 dòng `js/online/*.js` + 1 dòng `css/online.css` trong `thap/index.html`).
- Một người: thêm `?net=0` vào link.
- Xoá dữ liệu: Realtime Database → Data → xoá `turretmerge/rooms` (hồ sơ ở `turretmerge/profiles`).
