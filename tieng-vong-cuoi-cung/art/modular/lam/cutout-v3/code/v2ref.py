"""Nạp code v2 gốc (review-v2/lam-cutout/code) để dựng ảnh đối chứng cùng tư thế. Không sửa v2.
Nếu không có thư mục review-v2 (chạy v3 tách rời), các hàm trả None và bài thử bỏ cột v2."""
import os, sys, importlib

HERE = os.path.dirname(os.path.abspath(__file__))
V2DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'review-v2', 'lam-cutout', 'code'))
_rap2 = None


def rap2():
    global _rap2
    if _rap2 is not None:
        return _rap2
    if not os.path.isdir(V2DIR):
        return None
    cwd = os.getcwd()
    sys.path.insert(0, V2DIR)
    try:
        os.chdir(V2DIR)
        # tránh trùng tên module với v3
        for m in ('khuon2', 'rap2'):
            sys.modules.pop(m, None)
        _rap2 = importlib.import_module('rap2')
    finally:
        os.chdir(cwd)
        sys.path.remove(V2DIR)
    return _rap2


def v2_layers(world_pose, keep=None):
    """world_pose: dict armA/armB/legA/legB (góc thế giới tuyệt đối như v2), lean, tip."""
    r = rap2()
    if r is None:
        return None
    pose = dict(r.REST); pose.update(world_pose)
    L = r.lam(pose)
    out = []
    for img, M in L:
        name = None
        for k, v in r.IM.items():
            if img is v:
                name = k; break
        if name is None:
            name = 'mat'
        if keep is None or name in keep:
            out.append((name, img, M))
    return out
