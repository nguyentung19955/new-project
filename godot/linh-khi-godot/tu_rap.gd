class_name TuRap
## Tự xoá nền trắng, tự cắt bộ phận từ ảnh Gemini và tự ráp vào khung xương em bé.
## Các cảnh mẫu gọi các hàm ở đây qua nút trong Inspector. Không cần sửa tệp này.

const RONG_LAM_VIEC := 1400   # thu ảnh về bề ngang này trước khi xử lý cho nhanh
const NGUONG_NEN := 40        # khác màu nền ít hơn ngần này thì coi là nền
const LUOI := 4               # ô lưới khi tìm các mảnh rời


static func _nen(img: Image) -> Color:
	var w := img.get_width()
	var h := img.get_height()
	var s := Color(0, 0, 0, 0)
	var n := 0
	for p in [Vector2i(2, 2), Vector2i(w - 3, 2), Vector2i(2, h - 3), Vector2i(w - 3, h - 3), Vector2i(w / 2, 2), Vector2i(w / 2, h - 3)]:
		s += img.get_pixelv(p)
		n += 1
	return s / n


static func _khac(c: Color, nen: Color) -> int:
	return int(maxf(maxf(absf(c.r - nen.r), absf(c.g - nen.g)), absf(c.b - nen.b)) * 255.0)


## Trả về danh sách mảnh: [{ "o": Rect2i trong ảnh làm việc, "anh": Image nền trong suốt }], xếp theo diện tích giảm dần.
static func tach(goc: Image, ti_le_nho := 0.004) -> Array:
	var img: Image = goc.duplicate()
	img.convert(Image.FORMAT_RGBA8)
	if img.get_width() > RONG_LAM_VIEC:
		var k := float(RONG_LAM_VIEC) / img.get_width()
		img.resize(RONG_LAM_VIEC, roundi(img.get_height() * k), Image.INTERPOLATE_LANCZOS)
	var nen := _nen(img)
	var W := img.get_width()
	var H := img.get_height()
	# Lưới thô: ô nào có điểm khác nền là "có hình".
	var gw := W / LUOI
	var gh := H / LUOI
	var co := PackedByteArray()
	co.resize(gw * gh)
	for gy in gh:
		for gx in gw:
			for d in [Vector2i(0, 0), Vector2i(2, 0), Vector2i(0, 2), Vector2i(2, 2), Vector2i(1, 1), Vector2i(3, 3)]:
				var c := img.get_pixel(gx * LUOI + d.x, gy * LUOI + d.y)
				if c.a > 0.5 and _khac(c, nen) > NGUONG_NEN:
					co[gy * gw + gx] = 1
					break
	# Nới 2 ô để chi tiết mảnh (lá, chim, tua) dính vào mảnh chính.
	var no := co.duplicate()
	for gy in gh:
		for gx in gw:
			if co[gy * gw + gx] == 1:
				for dy in range(-2, 3):
					for dx in range(-2, 3):
						var x := gx + dx
						var y := gy + dy
						if x >= 0 and y >= 0 and x < gw and y < gh:
							no[y * gw + x] = 1
	# Đánh số vùng liền.
	var nhan := PackedInt32Array()
	nhan.resize(gw * gh)
	var vung: Array = []
	for i in gw * gh:
		if no[i] == 0 or nhan[i] != 0:
			continue
		var so := vung.size() + 1
		var hang := [i]
		nhan[i] = so
		var x0 := gw
		var y0 := gh
		var x1 := 0
		var y1 := 0
		var dt := 0
		while not hang.is_empty():
			var j: int = hang.pop_back()
			var x := j % gw
			var y := j / gw
			dt += co[j]
			x0 = mini(x0, x); y0 = mini(y0, y); x1 = maxi(x1, x); y1 = maxi(y1, y)
			for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
				var xx: int = x + d[0]
				var yy: int = y + d[1]
				if xx >= 0 and yy >= 0 and xx < gw and yy < gh:
					var k2 := yy * gw + xx
					if no[k2] == 1 and nhan[k2] == 0:
						nhan[k2] = so
						hang.append(k2)
		vung.append({"so": so, "dt": (x1 - x0 + 1) * (y1 - y0 + 1) if dt > 6 else 0, "o": Rect2i(x0, y0, x1 - x0 + 1, y1 - y0 + 1)})
	var nho := ti_le_nho * gw * gh
	var ket: Array = []
	for v in vung:
		if v["dt"] < nho:
			continue
		var o: Rect2i = v["o"]
		var r := Rect2i(o.position * LUOI, o.size * LUOI).grow(4).intersection(Rect2i(0, 0, W, H))
		var anh := img.get_region(r)
		_xoa_nen(anh, nen, func(px: int, py: int) -> bool:
			var gx2 := clampi((r.position.x + px) / LUOI, 0, gw - 1)
			var gy2 := clampi((r.position.y + py) / LUOI, 0, gh - 1)
			var l := nhan[gy2 * gw + gx2]
			return l == 0 or l == v["so"])
		var u := anh.get_used_rect()
		if u.size.x < 4 or u.size.y < 4:
			continue
		ket.append({"o": Rect2i(r.position + u.position, u.size), "anh": anh.get_region(u), "dt": v["dt"]})
	ket.sort_custom(func(a, b): return a["dt"] > b["dt"])
	return ket


## Xoá nền nối với mép ảnh (giữ chỗ trắng bên trong viền như áo trắng, mắt), làm mềm mép.
static func _xoa_nen(anh: Image, nen: Color, cua_minh: Callable) -> void:
	var w := anh.get_width()
	var h := anh.get_height()
	var la_nen := PackedByteArray()
	la_nen.resize(w * h)
	var hang: Array = []
	for x in w:
		hang.append(x); hang.append((h - 1) * w + x)
	for y in h:
		hang.append(y * w); hang.append(y * w + w - 1)
	while not hang.is_empty():
		var i: int = hang.pop_back()
		if la_nen[i] == 1:
			continue
		var x := i % w
		var y := i / w
		if _khac(anh.get_pixel(x, y), nen) > NGUONG_NEN:
			continue
		la_nen[i] = 1
		if x > 0: hang.append(i - 1)
		if x < w - 1: hang.append(i + 1)
		if y > 0: hang.append(i - w)
		if y < h - 1: hang.append(i + w)
	for y in h:
		for x in w:
			var i := y * w + x
			if la_nen[i] == 1 or not cua_minh.call(x, y):
				anh.set_pixel(x, y, Color(0, 0, 0, 0))
				continue
			var sat := (x > 0 and la_nen[i - 1] == 1) or (x < w - 1 and la_nen[i + 1] == 1) or (y > 0 and la_nen[i - w] == 1) or (y < h - 1 and la_nen[i + w] == 1)
			if sat:
				var c := anh.get_pixel(x, y)
				c.a = clampf(_khac(c, nen) / 120.0, 0.25, 1.0)
				anh.set_pixel(x, y, c)


static func luu_anh(anh: Image, duong: String) -> Texture2D:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(duong.get_base_dir()))
	ResourceSaver.save(ImageTexture.create_from_image(anh), duong)
	return ResourceLoader.load(duong, "", ResourceLoader.CACHE_MODE_REPLACE)


static func _cao_rong(m: Dictionary) -> float:
	var o: Rect2i = m["o"]
	return float(o.size.y) / maxf(1.0, o.size.x)


## Chia mảnh của khung Người: đầu, thân, 2 tay, 2 chân, phần còn lại là phụ kiện (mảnh dài nằm ngang = vũ khí).
static func chia_nguoi(manh: Array) -> Dictionary:
	if manh.size() < 6:
		return {"loi": "Chỉ tìm thấy %d mảnh, cần ít nhất 6 (đầu, thân, 2 tay, 2 chân)." % manh.size()}
	var cy := []
	for m in manh:
		cy.append(m["o"].get_center().y)
	var lo: float = cy.min()
	var hi: float = cy.max()
	for _l in 8:
		var a := []
		var b := []
		for v in cy:
			(a if absf(v - lo) <= absf(v - hi) else b).append(v)
		if a.is_empty() or b.is_empty():
			break
		lo = a.reduce(func(s, v): return s + v, 0.0) / a.size()
		hi = b.reduce(func(s, v): return s + v, 0.0) / b.size()
	var tren := []
	var duoi := []
	for m in manh:
		var y: float = m["o"].get_center().y
		(tren if absf(y - lo) <= absf(y - hi) else duoi).append(m)
	var vk: Variant = null
	var phu := []
	# Vũ khí: mảnh dài nằm ngang (rộng gấp 2,5 lần cao trở lên).
	for m in manh:
		if 1.0 / _cao_rong(m) > 2.5:
			vk = m
			break
	tren.erase(vk)
	duoi.erase(vk)
	var dau_than := tren.duplicate()
	dau_than.sort_custom(func(a, b): return a["dt"] > b["dt"])
	if dau_than.size() < 2:
		dau_than = manh.duplicate()
		dau_than.erase(vk)
	var hai := dau_than.slice(0, 2)
	hai.sort_custom(func(a, b): return a["o"].position.x < b["o"].position.x)
	var dau: Dictionary = hai[0]
	var than: Dictionary = hai[1]
	var con := []
	for m in manh:
		if m != dau and m != than and m != vk:
			con.append(m)
	# Tay: 2 mảnh dọc ở hàng trên; chân: 2 mảnh dọc ở hàng dưới.
	var tay_ung := con.filter(func(m): return tren.has(m))
	var chan_ung := con.filter(func(m): return duoi.has(m))
	tay_ung.sort_custom(func(a, b): return _cao_rong(a) > _cao_rong(b))
	chan_ung.sort_custom(func(a, b): return _cao_rong(a) > _cao_rong(b))
	if tay_ung.size() < 2 or chan_ung.size() < 2:
		var doc := con.duplicate()
		doc.sort_custom(func(a, b): return a["o"].get_center().y < b["o"].get_center().y)
		if doc.size() < 4:
			return {"loi": "Không đủ 2 tay và 2 chân."}
		tay_ung = doc.slice(0, 2)
		chan_ung = doc.slice(2, 4)
	var tay := tay_ung.slice(0, 2)
	var chan := chan_ung.slice(0, 2)
	for m in con:
		if not tay.has(m) and not chan.has(m):
			phu.append(m)
	tay.sort_custom(func(a, b): return a["o"].position.x < b["o"].position.x)
	chan.sort_custom(func(a, b): return a["o"].position.x < b["o"].position.x)
	return {"dau": dau, "than": than, "tay_truoc": tay[0], "tay_sau": tay[1], "chan_truoc": chan[0], "chan_sau": chan[1], "vu_khi": vk, "phu_kien": phu}
