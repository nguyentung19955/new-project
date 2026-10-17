// Giả lập cách Safari/WebKit trả số đo hộp mực chữ: GlyphOverflow làm tròn LÊN số nguyên (đơn vị px của cỡ phông), không âm.
(() => {
  const P = CanvasRenderingContext2D.prototype, m0 = P.measureText;
  const wrap = (m) => {
    const w = m.width;
    return { width: w,
      actualBoundingBoxAscent: Math.max(0, Math.ceil(m.actualBoundingBoxAscent - 1e-9)),
      actualBoundingBoxDescent: Math.max(0, Math.ceil(m.actualBoundingBoxDescent - 1e-9)),
      actualBoundingBoxLeft: Math.ceil(m.actualBoundingBoxLeft - 1e-9),
      actualBoundingBoxRight: w + Math.ceil(m.actualBoundingBoxRight - w - 1e-9),
      fontBoundingBoxAscent: m.fontBoundingBoxAscent, fontBoundingBoxDescent: m.fontBoundingBoxDescent };
  };
  P.measureText = function (t) { return wrap(m0.call(this, t)); };
  if (window.OffscreenCanvasRenderingContext2D) { const O = OffscreenCanvasRenderingContext2D.prototype, o0 = O.measureText; O.measureText = function (t) { return wrap(o0.call(this, t)); }; }
})();
