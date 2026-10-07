#!/usr/bin/env python3
"""Đóng gói bộ chuẩn animation thành một file zip để gửi cho AI khác / họa sĩ:
  python3 tools/dong-goi-animation.py      → docs/bo-animation.zip
Gồm: hướng dẫn, chuẩn (md + txt), 90 prompt (txt + csv), ảnh mẫu lưới, ảnh mẫu từng nhân vật (ảnh đang có trong game,
đính kèm cho AI giữ đúng nhân vật), công cụ ghép / cắt. Chạy lại sau node tools/build-prompts.js."""
import csv, os, zipfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'docs', 'bo-animation.zip')
TOP = 'bo-animation/'
HUONG_DAN = """BỘ ANIMATION — THẦN THOẠI VIỆT
============================================================
Gửi cho AI tạo ảnh (Gemini, ChatGPT, Midjourney, Leonardo, Pippit…) hoặc họa sĩ.

CÁCH DÙNG NHANH (mỗi nhân vật một ảnh):
1. Mở PROMPT-GUI-AI.txt, tìm khối của nhân vật, chép phần giữa hai đường kẻ ------ dán vào AI.
2. Đính kèm 2 ảnh:
   - ảnh nhân vật: anh-mau-nhan-vat/<mã>.png (để AI giữ đúng nhân vật)
   - ảnh lưới: mau-luoi/hero12.png (tướng) · enemy6.png (quái) · enemy6-bay.png (quái bay: doi, chimbao) · boss9.png (boss)
3. Thêm câu: "Use the first image as the exact character reference. The second image is only a layout guide — do NOT draw its numbers, lines or labels."
4. Tải ảnh về, lưu đúng tên ghi trên khối (ví dụ lactuong.png), gửi lại để cắt vào game.

TRONG GÓI:
- CHUAN-ANIMATION.txt / .md   chuẩn đầy đủ: phong cách, quy cách lưới, nhịp phát, mẫu prompt, danh sách kiểm tra
- PROMPT-GUI-AI.txt           90 prompt sẵn (60 tướng + 21 quái + 9 boss)
- PROMPT-HIEU-UNG.txt         48 prompt HIỆU ỨNG (ảnh hạt kiểu Kenney, dải khung chiêu, triệu hồi, đạn bay) — đọc phần đầu file
- prompts-tuong.csv, prompts-quai.csv   cùng nội dung, dạng bảng (Excel / Google Sheets)
- mau-luoi/                   ảnh lưới trống có số ô + đường đáy chân, và một tấm ví dụ
- anh-mau-nhan-vat/           ảnh hiện có của từng nhân vật, đặt tên theo mã
- cong-cu/                    ghep-luoi.py (ghép ảnh rời thành lưới), cat-sheet.py (cắt lưới thành khung game), cat-fx.py (cắt hiệu ứng)
- mau-luoi/mau-hieu-ung-kenney.png   32 ảnh hạt hiện tại, đính kèm làm mẫu khi gen hiệu ứng phần A

AI chỉ ra từng dáng một hoặc dùng AI video: xem mục 7 trong CHUAN-ANIMATION.txt.
"""


def main():
    files = [('docs/CHUAN-ANIMATION.md', 'CHUAN-ANIMATION.md'), ('docs/CHUAN-ANIMATION.txt', 'CHUAN-ANIMATION.txt'),
             ('docs/PROMPT-GUI-AI.txt', 'PROMPT-GUI-AI.txt'), ('docs/prompts-tuong.csv', 'prompts-tuong.csv'),
             ('docs/prompts-quai.csv', 'prompts-quai.csv'), ('docs/PROMPT-HIEU-UNG.txt', 'PROMPT-HIEU-UNG.txt'), ('tools/cat-fx.py', 'cong-cu/cat-fx.py'),
             ('tools/ghep-luoi.py', 'cong-cu/ghep-luoi.py'), ('tools/cat-sheet.py', 'cong-cu/cat-sheet.py')]
    for f in sorted(os.listdir(os.path.join(ROOT, 'docs/mau-luoi'))):
        files.append((f'docs/mau-luoi/{f}', f'mau-luoi/{f}'))
    for src, pose in (('docs/prompts-tuong.csv', 'idle.png'), ('docs/prompts-quai.csv', 'walk1.png')):
        for r in csv.DictReader(open(os.path.join(ROOT, src), encoding='utf-8-sig')):
            p = f"assets/packs/{r['ma']}/{pose}"
            if os.path.exists(os.path.join(ROOT, p)): files.append((p, f"anh-mau-nhan-vat/{r['ma']}.png"))
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr(TOP + 'HUONG-DAN.txt', HUONG_DAN)
        for src, dst in files:
            z.write(os.path.join(ROOT, src), TOP + dst)
    print(len(files) + 1, 'file →', os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main()
