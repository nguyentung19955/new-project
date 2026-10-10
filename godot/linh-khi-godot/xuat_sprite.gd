@tool
extends Node2D
## XUẤT SPRITE CHO GAME LINH KHÍ
## Mở cảnh (em_be.tscn hoặc hieu_ung_kiem.tscn) rồi bấm F6 ("Chạy cảnh này").
## Godot sẽ tự phát từng động tác, chụp từng khung, rồi ghi kết quả vào thư mục xuat/ của dự án:
##   - <mã>.sprite.json : tệp game đọc được (gửi tệp này cho Claude, hoặc chép vào game/art/custom/)
##   - xem_truoc/<mã>.png : tấm sprite cỡ to để bạn tự xem lại
## Đừng sửa phần code bên dưới; chỉ chỉnh các ô ở bảng Inspector bên phải.

@export var ma := "em-be-hunter"                ## Mã trong game. Em bé: em-be-smith, em-be-hunter, em-be-healer, em-be-wrestler
@export var ten := "Thợ Săn"                    ## Tên hiển thị
@export_enum("em-be", "hieu-ung") var loai := "em-be"
@export var cao_trong_game := 33                ## Em bé: chiều cao khi đứng (điểm ảnh trong game). Hiệu ứng: chiều cao lớn nhất.
@export var khung_moi_giay := 12                ## Số khung hình mỗi giây khi chụp
@export var dong_tac: PackedStringArray = ["idle", "move", "tele", "atk", "hit", "die", "ne"]  ## Các động tác sẽ xuất (đúng tên trong AnimationPlayer)
@export var an_khi_xuat: Array[NodePath] = []   ## Những thứ chỉ để xem thử, ẩn đi khi chụp (ví dụ vũ khí cầm tay)
@export var co_xem_truoc := 256                 ## Chiều cao mỗi khung trong ảnh xem trước

@export_group("Tự ráp từ ảnh Gemini")
@export var anh_gemini: Texture2D                ## Kéo ảnh tách bộ phận của Gemini vào đây
@export_tool_button("Tự ráp từ ảnh Gemini") var nut_tu_rap = tu_rap

var _chu: Label


func _ready() -> void:
	if Engine.is_editor_hint():
		return
	var vp := get_viewport()
	vp.transparent_bg = true
	for p in an_khi_xuat:
		var n := get_node_or_null(p)
		if n is CanvasItem:
			n.visible = false
	var ap: AnimationPlayer = get_node_or_null("AnimationPlayer")
	if ap == null:
		push_error("Thiếu nút AnimationPlayer")
		return
	ap.callback_mode_process = AnimationMixer.ANIMATION_CALLBACK_MODE_PROCESS_MANUAL
	await get_tree().process_frame
	var goc := get_global_transform_with_canvas().origin
	var hang: Array = []
	for t in dong_tac:
		if not ap.has_animation(t):
			print("Bỏ qua động tác không có: ", t)
			continue
		var anim := ap.get_animation(t)
		var giay := anim.length
		var lap := anim.loop_mode != Animation.LOOP_NONE
		var n := clampi(roundi(giay * khung_moi_giay), 3 if not lap else 4, 24)
		if t == "ne":
			n = maxi(n, 6)
		ap.play(t)
		var ks: Array = []
		for i in n:
			var u := float(i) / n if lap else float(i) / maxi(1, n - 1)
			ap.seek(u * giay, true)
			await get_tree().process_frame
			await RenderingServer.frame_post_draw
			ks.append(vp.get_texture().get_image())
		hang.append({"ten": t, "giay": giay, "lap": lap, "ks": ks})
	if hang.is_empty():
		push_error("Không có động tác nào để xuất")
		return
	# Khung chung vừa đủ mọi khung hình (luôn chứa điểm chân).
	var r := Rect2i(Vector2i(goc), Vector2i.ONE)
	for h in hang:
		for img in h["ks"]:
			var u: Rect2i = img.get_used_rect()
			if u.size.x > 0:
				r = r.merge(u)
	r = r.grow(2).intersection(Rect2i(Vector2i.ZERO, hang[0]["ks"][0].get_size()))
	# Tỉ lệ thu nhỏ về cỡ trong game.
	var cao_goc := float(r.size.y)
	if loai == "em-be":
		var u0: Rect2i = hang[0]["ks"][0].get_used_rect()
		cao_goc = float(maxi(1, u0.size.y))
	var k := float(cao_trong_game) / cao_goc
	var fw := maxi(1, ceili(r.size.x * k))
	var fh := maxi(1, ceili(r.size.y * k))
	var nmax := 0
	for h in hang:
		nmax = maxi(nmax, h["ks"].size())
	var tam := Image.create(fw * nmax, fh * hang.size(), false, Image.FORMAT_RGBA8)
	var kx := float(co_xem_truoc) / r.size.y
	var xw := maxi(1, roundi(r.size.x * kx))
	var xem := Image.create(xw * nmax, co_xem_truoc * hang.size(), false, Image.FORMAT_RGBA8)
	var dt := {}
	for j in hang.size():
		var h: Dictionary = hang[j]
		for i in h["ks"].size():
			var cat: Image = h["ks"][i].get_region(r)
			cat.convert(Image.FORMAT_RGBA8)
			var lon := cat.duplicate()
			lon.resize(xw, co_xem_truoc, Image.INTERPOLATE_LANCZOS)
			xem.blit_rect(lon, Rect2i(Vector2i.ZERO, lon.get_size()), Vector2i(i * xw, j * co_xem_truoc))
			cat.resize(fw, fh, Image.INTERPOLATE_LANCZOS)
			tam.blit_rect(cat, Rect2i(Vector2i.ZERO, cat.get_size()), Vector2i(i * fw, j * fh))
		dt[h["ten"]] = {"hang": j, "so": h["ks"].size(), "giay": snappedf(h["giay"], 0.001), "lap": h["lap"], "bien": 100, "toc": 100, "mo": 0.6 if h["ten"] == "die" else null}
	var rong := fw
	if loai == "em-be":
		var u0: Rect2i = hang[0]["ks"][0].get_used_rect()
		rong = maxi(1, roundi(u0.size.x * k))
	var tep := {
		"loai": "linh-khi-sprite", "phien_ban": 1, "nguon": "godot",
		"ma": ma, "ten": ten, "doi_tuong": "em-be" if loai == "em-be" else "hieu-ung", "vung": "moi",
		"tam": "data:image/png;base64," + Marshalls.raw_to_base64(tam.save_png_to_buffer()),
		"khung_rong": fw, "khung_cao": fh,
		"goc": [roundi((goc.x - r.position.x) * k), roundi((goc.y - r.position.y) * k)],
		"rong": rong, "cao": cao_trong_game, "bong": roundi(maxf(6.0, rong * 0.62)),
		"dong_tac": dt,
	}
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://xuat/xem_truoc"))
	var duong := "res://xuat/" + ma + ".sprite.json"
	var f := FileAccess.open(duong, FileAccess.WRITE)
	f.store_string(JSON.stringify(tep, "  "))
	f.close()
	xem.save_png("res://xuat/xem_truoc/" + ma + ".png")
	var bao := "XONG! Đã xuất %d động tác, mỗi khung %d×%d.\nTệp: %s" % [hang.size(), fw, fh, ProjectSettings.globalize_path(duong)]
	print(bao)
	_hien(bao)


func _hien(s: String) -> void:
	var lop := CanvasLayer.new()
	add_child(lop)
	_chu = Label.new()
	_chu.text = s + "\n\n(Đóng cửa sổ này để quay lại)"
	_chu.position = Vector2(24, 24)
	_chu.add_theme_font_size_override("font_size", 22)
	_chu.add_theme_color_override("font_color", Color.WHITE)
	_chu.add_theme_color_override("font_outline_color", Color.BLACK)
	_chu.add_theme_constant_override("outline_size", 6)
	lop.add_child(_chu)
	if DisplayServer.get_name() == "headless" or OS.get_cmdline_user_args().has("--tu-dong"):
		get_tree().quit()


# ---------- TỰ RÁP (bấm nút trong Inspector) ----------
func tu_rap() -> void:
	if loai != "em-be":
		push_warning("Tự ráp chỉ dùng cho em bé")
		return
	if anh_gemini == null:
		push_warning("Hãy kéo ảnh Gemini (tách bộ phận) vào ô Anh Gemini trước")
		return
	var manh := TuRap.tach(anh_gemini.get_image())
	var c := TuRap.chia_nguoi(manh)
	if c.has("loi"):
		push_warning("Tự ráp: " + c["loi"])
		print("Tự ráp: ", c["loi"])
		return
	var thu_muc := "res://anh/tach/" + ma + "/"
	var hinh: Node2D = $Hinh
	var than: Node2D = $Hinh/Than
	var gan := func(khop: Node2D, m: Dictionary, ten_tep: String, truc: Vector2) -> void:
		var anh: Sprite2D = khop.get_node("Anh")
		anh.texture = TuRap.luu_anh(m["anh"], thu_muc + ten_tep + ".res")
		anh.region_enabled = false
		anh.centered = true
		anh.offset = Vector2(m["o"].size) / 2.0 - truc
	var co := func(m: Dictionary) -> Vector2: return Vector2(m["o"].size)
	# Chân: khớp hông gần đỉnh, bàn chân chạm đất.
	var sct: Vector2 = co.call(c["chan_truoc"])
	var scs: Vector2 = co.call(c["chan_sau"])
	var pct := Vector2(sct.x / 2, minf(sct.x * 0.45, sct.y * 0.18))
	var pcs := Vector2(scs.x / 2, minf(scs.x * 0.45, scs.y * 0.18))
	var L := maxf(sct.y - pct.y, scs.y - pcs.y)
	var st: Vector2 = co.call(c["than"])
	var hong := Vector2(st.x / 2, st.y * 0.86)
	var dx := st.x * 0.12
	$Hinh/ChanTruoc.position = Vector2(dx, -L)
	$Hinh/ChanSau.position = Vector2(-dx, -L)
	gan.call($Hinh/ChanTruoc, c["chan_truoc"], "chan_truoc", pct)
	gan.call($Hinh/ChanSau, c["chan_sau"], "chan_sau", pcs)
	gan.call(than, c["than"], "than", hong)
	# Tay: khớp vai ở hai bên ngực.
	var sta: Vector2 = co.call(c["tay_truoc"])
	var sts: Vector2 = co.call(c["tay_sau"])
	var pta := Vector2(sta.x / 2, minf(sta.x * 0.5, sta.y * 0.2))
	var pts := Vector2(sts.x / 2, minf(sts.x * 0.5, sts.y * 0.2))
	var vai_y := st.y * 0.2 - hong.y
	$Hinh/Than/TayTruoc.position = Vector2(st.x * 0.28, vai_y)
	$Hinh/Than/TaySau.position = Vector2(-st.x * 0.28, vai_y)
	gan.call($Hinh/Than/TayTruoc, c["tay_truoc"], "tay_truoc", pta)
	gan.call($Hinh/Than/TaySau, c["tay_sau"], "tay_sau", pts)
	$Hinh/Than/TaySau/Anh.modulate = Color(0.82, 0.82, 0.82)
	$Hinh/ChanSau/Anh.modulate = Color(0.82, 0.82, 0.82)
	# Đầu: cổ cắm sâu vào cổ áo.
	var sd: Vector2 = co.call(c["dau"])
	$Hinh/Than/Dau.position = Vector2(0, st.y * 0.06 - hong.y)
	gan.call($Hinh/Than/Dau, c["dau"], "dau", Vector2(sd.x / 2, sd.y * 0.93))
	# Vũ khí xem thử ở bàn tay trước.
	var vk: Sprite2D = $Hinh/Than/TayTruoc/VuKhiXem
	vk.position = Vector2(0, sta.y - pta.y - sta.x * 0.3)
	if c["vu_khi"] != null:
		vk.texture = TuRap.luu_anh(c["vu_khi"]["anh"], thu_muc + "vu_khi.res")
		vk.offset = Vector2(c["vu_khi"]["o"].size.x * 0.3, 0)
		vk.scale = Vector2.ONE
	# Phụ kiện (áo choàng, đuôi...): treo sau lưng ở cổ.
	for n in than.get_children():
		if n.name.begins_with("PhuKien"):
			than.remove_child(n)
			n.queue_free()
	var i := 0
	for m in c["phu_kien"]:
		i += 1
		var k := Node2D.new()
		k.name = "PhuKien%d" % i
		k.position = Vector2(0, st.y * 0.12 - hong.y)
		k.show_behind_parent = true
		than.add_child(k)
		k.owner = self
		var a := Sprite2D.new()
		a.name = "Anh"
		k.add_child(a)
		a.owner = self
		gan.call(k, m, "phu_kien_%d" % i, Vector2(co.call(m).x / 2, 0))
	# Cỡ: cả người cao khoảng 700 điểm trong khung 1024.
	var H := L + (hong.y - st.y * 0.06) + sd.y * 0.93
	var S := 700.0 / H
	hinh.scale = Vector2(S, S)
	# Chỉnh các động tác mẫu theo người mới (độ nhún của thân tỉ lệ theo chiều cao).
	var L_cu: float = get_meta("rap_L", 130.0)
	var H_cu: float = get_meta("rap_H", 530.0)
	var ap: AnimationPlayer = $AnimationPlayer
	for ten_dt in ap.get_animation_list():
		var a: Animation = ap.get_animation(ten_dt)
		var tr := a.find_track(NodePath("Hinh/Than:position"), Animation.TYPE_VALUE)
		if tr < 0:
			continue
		for kk in a.track_get_key_count(tr):
			var v: Vector2 = a.track_get_key_value(tr, kk)
			a.track_set_key_value(tr, kk, Vector2(0, -L) + (v - Vector2(0, -L_cu)) * (H / H_cu))
	than.position = Vector2(0, -L)
	set_meta("rap_L", L)
	set_meta("rap_H", H)
	var bao := "Tự ráp xong: %d mảnh (%s). Bấm ▶ ở AnimationPlayer để xem, F6 để xuất." % [manh.size(), "có vũ khí" if c["vu_khi"] != null else "không vũ khí"]
	print(bao)
	if Engine.is_editor_hint():
		EditorInterface.mark_scene_as_unsaved()
