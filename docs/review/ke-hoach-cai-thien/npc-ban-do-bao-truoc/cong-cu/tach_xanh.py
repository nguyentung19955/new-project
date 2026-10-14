"""Tách nền xanh có alpha (unmix): điểm C = α·F + (1−α)·B, B = màu nền đo được (~#03F80D, gần #00FF00).
F ∈ [0,1] ⇔ α ≥ 1 − C_lục/B_lục và α ≥ (C_k − B_k)/(1 − B_k) với kênh đỏ, lam. Lấy α NHỎ NHẤT thoả cả 3 kênh,
rồi tính lại F = (C − (1−α)B)/α — nên lòng đỏ bán trong pha nền xanh (nâu / vàng lục) trở về đỏ trong suốt, không còn ám xanh.
Nhiễu nền (α ≤ ~0,07) bỏ hẳn."""
import numpy as np
NEN = np.array([3, 248, 13], np.float32) / 255
def unmix(rgb, nen=NEN, nhieu=0.07):
    c = rgb.astype(np.float32) / 255; B = nen
    a = np.zeros(c.shape[:2], np.float32)
    # kênh lục (nền sáng): α ≥ 1 − C/B; kênh đỏ, lam (nền gần 0, nhiễu ±5): chỉ ràng buộc phía trên α ≥ (C − B)/(1 − B)
    a = np.maximum(a, 1 - c[..., 1] / B[1])
    for k in (0, 2): a = np.maximum(a, (c[..., k] - B[k]) / (1 - B[k]))
    a = np.clip(a, 0, 1)
    f = (c - (1 - a[..., None]) * B) / np.maximum(a[..., None], 1e-3)
    f = np.clip(f, 0, 1)
    a2 = np.clip((a - nhieu) / (1 - nhieu), 0, 1)
    out = np.concatenate([f * 255, a2[..., None] * 255], -1).round().astype(np.uint8)
    out[a2 <= 0] = 0
    return out
def thu_rgba(a, w, h):
    """co ảnh RGBA có alpha (nhân trước) bằng BOX"""
    from PIL import Image
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, a[..., 3:4]], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((w, h), Image.BOX)) for k in range(4)]
    A = ch[3]; o = np.zeros((h, w, 4), np.float32)
    for k in range(3): o[..., k] = np.where(A > 0.5, ch[k] / np.maximum(A, 1e-3) * 255, 0)
    o[..., 3] = A
    return np.clip(o.round(), 0, 255).astype(np.uint8)
