// Giả lập Safari kiểu B: hộp mực = max(hộp phông, hộp mực thật), làm tròn lên số nguyên
(() => {
  const P = CanvasRenderingContext2D.prototype, m0 = P.measureText;
  const wrap = (m) => { const w = m.width; return { width: w,
      actualBoundingBoxAscent: Math.ceil(Math.max(m.fontBoundingBoxAscent, m.actualBoundingBoxAscent) - 1e-9),
      actualBoundingBoxDescent: Math.ceil(Math.max(m.fontBoundingBoxDescent, m.actualBoundingBoxDescent) - 1e-9),
      actualBoundingBoxLeft: Math.ceil(m.actualBoundingBoxLeft - 1e-9), actualBoundingBoxRight: w + Math.ceil(m.actualBoundingBoxRight - w - 1e-9),
      fontBoundingBoxAscent: m.fontBoundingBoxAscent, fontBoundingBoxDescent: m.fontBoundingBoxDescent }; };
  P.measureText = function (t) { return wrap(m0.call(this, t)); };
})();
