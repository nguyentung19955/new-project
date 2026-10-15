# Soát mượt — Phiên 1 "Quái động mượt": báo cáo

Ngày 15/10/2026, nhánh `khoi-tao-du-an`. Làm đúng "Phiên 1" ở mục 4 của `bao-cao.md`: các mục **2, 3, 4, 6A, 10A, 11A, 18, 19**.

**Chỉ đổi hình, không đổi luật chơi.** Không đụng thời gian ra đòn, vùng sát thương, tốc độ, hồi chiêu hay đường đi. Các ô mới trên quái (`e.duT`, `e.diT`, `e.dh`, `e.anNho`, `e.buocT`) chỉ dùng lúc vẽ.

Không chơi thử bằng trình duyệt. Kiểm bằng `node --check`, `build.py`, ba bài `tests/*.test.js`, bot Node và băng hình dựng từ code game thật (xem mục 3).

Xem: `xem-phien-1.gif` (trái là HIỆN TẠI, tức trước phiên; phải là SAU PHIÊN 1).

## 1. Đã làm gì, ở đâu, cờ quay lui

| Mục | Việc | Tệp | Cờ quay lui |
|---|---|---|---|
| 2 | Hàng đánh chạy đủ tới khung cuối. Lượt đánh thật hết ở `e.act.end`, nên hàng ảnh được **nén** cho vừa (chỉ nén, không kéo giãn). Hết lượt thì giữ khung cuối 60 ms rồi mới về đứng. Đòn nặng của tinh anh / quái giáp vẫn giữ khung như cũ, nay vẫn tới khung cuối. | `mobs.js` (`gioDanh`, `stepAct`, phần vẽ) | `?dondu=0` (`G.DON_DU`) |
| 3 | Quái choáng gửi `'stun'` như `boss.js`: lảo đảo trên hàng trúng đòn, **không chớp viền**. Chỉ áp cho quái có ảnh AI; hình vẽ bằng code không có cử động `stun` nên giữ như cũ. | `mobs.js` (phần vẽ) | `?choangcu=1` (`G.CHOANG_YEN`) |
| 4 | Vùng đệm thời gian: hết đi 0,13 giây mới đổi sang đứng. Mỗi hàng đi / đứng nhớ đồng hồ riêng; quay lại trong 0,2 giây thì đi tiếp từ khung cũ, không về khung 1. Có ở cả quái thường (`diDung`) và trùm (`updateBoss`). | `mobs.js`, `boss.js` | `?didung=0` (`G.DI_DUNG_EM`) |
| 6A | Báo đòn của quái có ảnh AI chạy như trùm vùng: hàng báo ~12 khung/giây một lượt, rồi đưa đi đưa lại 3 khung cuối. Nhịp được chỉnh nhẹ để đúng lúc ra đòn đang ở khung cuối. Báo ngắn (không đủ một lượt) thì vẫn trải đều như cũ. | `mobs.js` (truyền `o.baoDeu`), `sprite_custom.js` (`SC.baoDeu`) | `?baodeu=0` (`G.BAO_DEU`) |
| 10A | Khung nối "xì hơi / thu gai" bằng hàng báo đòn phát ngược. Lúc **vào đánh** (0,1 giây): caNoc, caNocChua, nhimDoc, nhimThan. Lúc **về đứng** (0,15 giây, thay cho giữ khung 60 ms): nhim. | `mobs.js` (`XI_VAO`, `XI_VE`), `sprite_custom.js` (`SC.xiHoi`) | `?xihoi=0` (`G.XI_HOI`) |
| 11A | Thêm `'hoLua-p2': { hit: { 1: 0 } }` và `'namChua-p2': { hit: { 2: 1 } }` vào `KHUNG_TRANG`. Đo lại: 23% và 15% thân trắng. | `sprite_custom.js` | `?khungtrang=1` (có sẵn) |
| 18 | Bước chân theo quãng đi thật, chia cho tốc độ gốc, trong khoảng 0,5–1,5: bị băng làm chậm thì bước chậm. Đi ngược hướng mặt (quái bắn xa lùi ra) thì hàng đi phát ngược. | `mobs.js` (`buoc`, phần vẽ) | `?buoctoc=0` (`G.BUOC_TOC`) |
| 19 | `e.hitT` chạy 0,3 giây, nay trải đủ hàng trúng đòn trong 0,3 giây (khung 4 không còn chỉ ~2 lượt tính). | `mobs.js` (phần vẽ) | `?trungdu=0` (`G.TRUNG_DU`) |

Bảng ở `bao-cao.md` không ghi cờ cho mục 19. Phiên này thêm `?trungdu=0` để mục nào cũng có cờ riêng.

Tắt cả phiên 1: `?dondu=0&choangcu=1&didung=0&baodeu=0&xihoi=0&buoctoc=0&trungdu=0` (thêm `&khungtrang=1` nếu muốn bỏ luôn bảng vá khung trắng, kể cả 6 chỗ cũ).

## 2. Không làm / làm khác đề xuất (và vì sao)

- **Mục 4, vùng đệm khoảng cách (vào >6, ra <2).** Không làm. Cách này đổi chỗ quái đứng, tức đổi luật (vị trí quái, khoảng cách đòn). Vùng đệm thời gian cộng đồng hồ riêng mỗi hàng đã dập phần giật.
- **Mục 2, lượt đánh dài hơn hàng ảnh** (kỹ năng đặt `end` dài, Nhím lăn lặp `lap_tu`). Giữ như cũ: đứng ở khung cuối, hoặc lặp đoạn lăn. Kéo giãn sẽ làm hỏng đoạn lăn.
- **ongVo (Ong Vò Vẽ).** Đòn chích chỉ hiện hàng đánh ~0,12 giây rồi kỹ năng tự đổi sang hàng đi (`H.loop(q, 'move')` trong `ky_nang_quai.js`). Trước hiện k3, nay k3–k4. Muốn đủ hàng thì phải đổi kỹ năng, nên để nguyên.
- **Đòn `chieu1` của tinh anh** (báo → đánh nằm trong một cử động) và **Mộc Tinh pha 3** (trùm vùng) không nằm trong mục 10A. Trùm vùng đã chạy nhịp đều riêng (`SC.chonTrum`).
- **Báo đòn rất ngắn** (Cá Chuồn 0,35 giây) vẫn một lượt, ~17 khung/giây: báo đòn phải xong đúng lúc ra đòn. Phần (B) gen ảnh P7 là việc sau.

## 3. Kiểm

### 3.1 Luật không đổi (bot Node, `game/tests/node_trang.js`)

Chạy trọn 4 ải bằng `G.probeRun(900)` với hạt ngẫu nhiên cố định: 1-1, 1-5, 2-3, 3-5, có cả phòng trùm. Mỗi lần băm kết quả (thời gian từng phòng, máu, nguồn sát thương) cùng vị trí / máu em bé và từng quái lúc kết thúc.

| Bản | 1-1 | 1-5 | 2-3 | 3-5 |
|---|---|---|---|---|
| Code TRƯỚC phiên (git stash) | 982e82a1 | d99dda29 | 1d7346a0 | aabd8eb3 |
| SAU, cờ mặc định | 982e82a1 | d99dda29 | 1d7346a0 | aabd8eb3 |
| SAU, tắt cả 7 cờ | 982e82a1 | d99dda29 | 1d7346a0 | aabd8eb3 |

Ba bản trùng từng số. Theo `LUAT-CAN-BANG.md`:

- Tỉ lệ thắng từng ải lệch **0 điểm**.
- Số lần chơi và kinh tế không đổi.
- Không thêm thưởng nào (0 vàng / quặng / đá / linh khí / sức mạnh mỗi lượt và mỗi ngày), nên không cần bù.

Vì luật trùng hệt nên không chạy lại bot cân bằng dài (`balance.py`, `do_b.py`). Các bài `tests/cloud_save_regression.test.js`, `may_luat.test.js`, `su_kien.test.js` đều qua.

Không đụng đăng nhập Google, lưu mây, `?cloud=0` hay `firebase-config.js`.

### 3.2 Hình: chạy code game thật, không trình duyệt (`cong-cu/phien1_ghi.js`)

Mỗi cảnh chạy game trong Node (canvas giả) **hai lần cùng hạt ngẫu nhiên**: một lần tắt 7 cờ, một lần mặc định. Mỗi lượt tính (60/giây) gọi `G.art.enemy` thật với một "bút ghi" để biết hàm vẽ đã chọn hàng / cột ảnh nào, có lớp viền chớp không. Sau đó dán đúng khung đó từ `.sprite.json` thành `xem-phien-1.gif`.

Trong cảnh, em bé đứng im (không đánh, không mất máu), cùng cho hai bản.

Quét 30 quái thường + tinh anh, mỗi con 6 giây, cách 50 điểm ảnh (`cong-cu/quet-phien-1.txt`):

- **Khung cuối hàng đánh không bao giờ hiện:** trước **16/29** con (caCon không ra đòn trong cảnh), sau **1/29** (ongVo, xem mục 2 ở trên).
- **Lật đi↔đứng** (tổng 30 con): trước **49** lần, sau **27** lần. Phần còn lại là đổi thật: đi tới rồi dừng hẳn.
- **Báo đòn, số lần đổi khung** trong lúc báo: caNoc 5 → 18; Nhím các loại 5 → 30; namPhong 5 → 13; quái bắn xa 6 → 10.

| Quái | Vai | Khung cuối | Hàng đánh đã hiện TRƯỚC | SAU | Báo đòn: đổi khung / lượt, TRƯỚC | SAU | Lật đi↔đứng |
|---|---|---|---|---|---|---|---|
| heoCon | rusher | k6 | k2 k3 k4 k5 k6 | k2 k3 k4 k5 k6 | 11/72 | 11/72 | 0 → 0 |
| cua | rusher | k6 | k2 k3 k4 k5 | k2 k3 k4 k5 k6 | 11/72 | 11/72 | 4 → 1 |
| linhMa | rusher | k6 | k3 k4 k5 | k3 k4 k5 k6 | 21/90 | 21/90 | 0 → 0 |
| ongVo | swarm | k6 | k3 | k3 k4 | 5/35 | 5/35 | 1 → 1 |
| caCon | swarm | k6 | — | — | 11/153 | 11/153 | 2 → 2 |
| doiThan | swarm | k6 | k1 … k6 | k1 … k6 | 11/66 | 11/66 | 0 → 0 |
| boHung | shield | k6 | k2 k3 k4 | k2 k3 k4 k5 k6 | 11/72 | 11/72 | 0 → 0 |
| oc | shield | k6 | k3 k4 k5 | k3 k4 k5 k6 | 11/72 | 11/72 | 3 → 2 |
| tuongDa | shield | k6 | k4 k5 k6 | k4 k5 k6 | 11/84 | 19/84 | 0 → 0 |
| hoaBaoTu | archer | k6 | k3 k4 k5 | k3 k4 k5 k6 | 6/45 | 10/45 | 2 → 1 |
| haiQuy | archer | k6 | k4 k5 | k4 k5 k6 | 6/45 | 10/45 | 2 → 1 |
| denLong | archer | k6 | k4 k5 k6 | k4 k5 k6 | 7/51 | 11/51 | 2 → 1 |
| chonBong | nimble | k6 | k2 k3 k4 k5 | k2 k3 k4 k5 k6 | 11/49 | 11/49 | 2 → 1 |
| caChuon | nimble | k6 | k4 k5 | k4 k5 k6 | 5/21 | 5/21 | 1 → 1 |
| meoDen | nimble | k6 | k4 k5 k6 | k4 k5 k6 | 17/84 | 17/84 | 4 → 1 |
| namPhong | kami | k6 | k5 k6 | k5 k6 | 5/60 | 13/60 | 1 → 1 |
| caNoc | kami | k6 | k3 k4 k5 k6 | k3 k4 k5 k6 (+ xì hơi) | 5/60 | 18/67 | 0 → 0 |
| huLua | kami | k6 | k2 k3 k5 k6 | k2 k3 k5 k6 | 5/51 | 9/51 | 0 → 0 |
| socNo | bomber | k6 | k4 k5 k6 | k4 k5 k6 | 8/43 | 8/43 | 2 → 1 |
| sua | bomber | k6 | k2 k3 k4 k5 | k2 k3 k4 k5 k6 | 5/31 | 5/31 | 2 → 1 |
| tieuYeu | bomber | k6 | k3 k4 k5 k6 | k3 k4 k5 k6 | 5/31 | 5/31 | 2 → 1 |
| nhimDoc | spiky | k6 | k1 … k6 | k1 … k6 (+ xì hơi) | 5/133 | 30/140 | 2 → 1 |
| nhim | spiky | k5 | k1 … k5 | k1 … k5 (+ thu gai) | 5/133 | 30/143 | 2 → 1 |
| nhimThan | spiky | k6 | k3 k4 k5 k6 | k3 k4 k5 k6 (+ xì hơi) | 5/133 | 30/140 | 2 → 1 |
| heoNanh | elite | k6 | k2 k3 | k2 k3 k4 k5 k6 | 11/72 | 11/72 | 2 → 2 |
| namPhongChua | elite | k6 | k2 k3 k4 | k2 k3 k4 k5 k6 | 11/84 | 19/84 | 2 → 1 |
| cuaTuong | elite | k6 | k4 k5 | k4 k5 k6 | 15/73 | 16/73 | 2 → 2 |
| caNocChua | elite | k6 | k1 k2 k3 k4 | k1 … k6 (+ xì hơi) | 12/60 | 20/74 | 3 → 1 |
| tuongMa | elite | k6 | k4 k5 | k4 k5 k6 | 14/87 | 14/87 | 2 → 1 |
| huChua | elite | k6 | k4 k5 | k4 k5 k6 | 11/84 | 19/84 | 2 → 1 |

Các cảnh trong `xem-phien-1.gif` (số đếm trong `xem-phien-1.json`):

1. **cua đánh rồi nhích (mục 2, 4).**
   - Trước: k5 → đứng 1 lượt → đi → đứng.
   - Sau: tới k6, giữ 4 lượt, rồi về.
2. **heoNanh (mục 2).**
   - Trước: dừng ở k3/6.
   - Sau: tới k6.
3. **heoCon trúng đòn (mục 19).** Khung 4 hiện 3 lượt → 5 lượt.
4. **heoCon choáng 1,6 giây (mục 3).**
   - Trước: 65 lượt có viền chớp.
   - Sau: 0 lượt.
5. **heoCon bị băng ×0,55 (mục 18).** Mỗi bước đứng 6 lượt → 10 lượt, đúng tốc độ thật.
6. **hoaBaoTu lùi ra xa (mục 18).**
   - Trước: hàng đi k1 → k6, tức bước tới.
   - Sau: k6 → k1, tức bước lùi.
7. **caNoc báo 1 giây (mục 6A, 10A).**
   - Trước: mỗi khung đứng 9–10 lượt (~6 khung/giây).
   - Sau: ~12 khung/giây rồi đưa qua lại k4–k6; ra đòn: k6 → k1 xì hơi trong 0,1 giây.
8. **nhimDoc cuộn 2,2 giây (mục 6A, 10A).**
   - Trước: 22 lượt mỗi khung.
   - Sau: 12 khung/giây + qua lại, rồi bung dần trước khi lăn.
9. **nhim xoay bắn gai xong (mục 10A).**
   - Trước: k2 của đoạn xoay → bật về đứng.
   - Sau: thu gai k6 → k1 trong 0,15 giây.
10. **11A.** Hàng trúng đòn hoLua-p2 và namChua-p2: khung trắng → khung kề + phủ trắng nhẹ.

### 3.3 Khác

- `node --check`: `mobs.js`, `boss.js`, `sprite_custom.js`, `phien1_ghi.js` đều qua.
- `python3 game/build.py` chạy xong; đã đóng gói lại `dist/` và `tools/xuong-sprite/index.html`.

## 4. Cách chạy lại công cụ

Xem `cong-cu/CACH-CHAY.md`, bước 6–7:

```
cd docs/review/ke-hoach-cai-thien/soat-muot/cong-cu
python3 xem_phien_1.py ..                   # → ../xem-phien-1.gif, ../xem-phien-1.json   (IN=1 để in chuỗi khung từng lượt)
python3 quet_phien_1.py > quet-phien-1.txt  # bảng 30 quái
```

## 5. Gợi ý cho chủ game khi chơi thử

- Cảm giác dễ thấy nhất là đòn đánh "thu về" thay vì giật về đứng, và quái choáng hết nháy trắng.
- Nếu thấy báo đòn của Nhím / Cá Nóc "rung" nhiều quá ở 3 khung cuối, tắt bằng `?baodeu=0`.
- Nếu thấy đòn của Cá Nóc ra trễ (xì hơi 0,1 giây trước khi gai bay), tắt bằng `?xihoi=0`. Gai và sát thương vẫn ra đúng lúc như cũ; chỉ hình xì hơi chen vào trước.
- Khi có ảnh mới P1–P3 (bao-cao.md mục 3), bỏ con đó khỏi `XI_VAO` / `XI_VE` trong `js/mobs.js`.
