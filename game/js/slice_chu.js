// CHỮ CỦA BẢN THỬ 5 PHÚT ĐẦU (TALESWORN, phiên A — js/slice.js). Chỉ THÊM chuỗi mới qua bộ dịch có sẵn (G.ngonNgu.them):
// khoá là câu tiếng Việt, giá trị là câu tiếng Anh. Không sửa bảng dịch chung (js/ngon_ngu_en.js — phiên B lo).
// Tên riêng giữ tiếng Anh ở cả hai ngôn ngữ: Rowan, Thornwood, Toadstool King, Fire Ink, Fire Guard, Page Scrap, Hollin, Forge.
(function () {
  const G = window.G;
  if (!G) return;
  // Câu dùng trong js/slice.js (giữ đúng từng chữ ở cả hai nơi)
  G.SLICE_CHU = {
    hStart: 'Kéo cần trái để đi. Bấm Đánh để chém quái.',
    hNe: 'Thấy vạch đỏ là quái sắp lao tới: bấm Né lăn sang bên, rồi chém trả!',
    hTrang: 'Một trang sách đỏ đang bay tới… Đi lại chạm vào nó!',
    hLua: 'Fire Ink! Kiếm hóa Lửa tới hết ải. Chém quái cho cháy!',
    hTrum: 'Toadstool King học cách bạn đánh. Nhặt Thương Băng ngay trên đường!',
    hSwap: 'Có 2 vũ khí: bấm ĐỔI để đổi. Băng phá Fire Guard rất nhanh.',
    bLua: 'FIRE INK! Kiếm của Rowan bốc Lửa',
    bBang: 'Nhặt được Thương Băng! Bấm ĐỔI để cầm',
    bGuard: 'FIRE GUARD! Lửa yếu đi, thử Băng',
    bVo: 'Phá Fire Guard! Đánh mạnh ngay!',
    bTan: 'Fire Guard tan rồi',
    bLon: 'Kiếm nhớ {0} đòn Lửa của bạn và lớn lên!',
    trang: 'Page Scrap (mảnh trang) ×{0}',
    lang: 'Forge (lò rèn) đã mở! Gặp Ông Thợ Rèn để luyện kiếm.',
    nut: 'ĐỔI',
    trum: 'Toadstool King',
    trumRa: 'Toadstool King xuất hiện ở Thornwood!',
  };
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Kéo cần trái để đi. Bấm Đánh để chém quái.': 'Drag the left stick to move. Press Attack to slash.',
    'Thấy vạch đỏ là quái sắp lao tới: bấm Né lăn sang bên, rồi chém trả!': 'A red line means a charge is coming: press Dodge to roll aside, then strike back!',
    'Một trang sách đỏ đang bay tới… Đi lại chạm vào nó!': 'A red page is drifting your way… Walk over and touch it!',
    'Fire Ink! Kiếm hóa Lửa tới hết ải. Chém quái cho cháy!': 'Fire Ink! Your sword burns until the end of this stage. Set them ablaze!',
    'Toadstool King học cách bạn đánh. Nhặt Thương Băng ngay trên đường!': 'The Toadstool King learns how you fight. Grab the Ice Spear on the path!',
    'Có 2 vũ khí: bấm ĐỔI để đổi. Băng phá Fire Guard rất nhanh.': 'Two weapons: press SWAP to switch. Ice breaks the Fire Guard fast.',
    'FIRE INK! Kiếm của Rowan bốc Lửa': 'FIRE INK! Rowan\'s blade catches fire',
    'Nhặt được Thương Băng! Bấm ĐỔI để cầm': 'Ice Spear picked up! Press SWAP to wield it',
    'FIRE GUARD! Lửa yếu đi, thử Băng': 'FIRE GUARD! Fire is weaker, try Ice',
    'Phá Fire Guard! Đánh mạnh ngay!': 'Fire Guard broken! Hit it now!',
    'Fire Guard tan rồi': 'The Fire Guard fades',
    'Kiếm nhớ {0} đòn Lửa của bạn và lớn lên!': 'Your blade remembers {0} Fire hits, and it grows!',
    'Page Scrap (mảnh trang) ×{0}': 'Page Scrap ×{0}',
    'Forge (lò rèn) đã mở! Gặp Ông Thợ Rèn để luyện kiếm.': 'The Forge is open! Visit the Smith to temper your blade.',
    'ĐỔI': 'SWAP',
    'Toadstool King xuất hiện ở Thornwood!': 'The Toadstool King appears in Thornwood!',
  });
})();
