extends SceneTree
## Dựng lại 3 cảnh mẫu (em_be.tscn, vu_khi.tscn, hieu_ung_kiem.tscn) với hình giữ chỗ.
## Chạy: godot --headless --path . --script res://_cong_cu/tao_mau.gd
## Người dùng KHÔNG cần chạy tệp này.

const GOC := Vector2(512, 960)


func _init() -> void:
	tao_em_be()
	tao_vu_khi()
	tao_hieu_ung()
	tao_bon_chan()
	tao_ao()
	print("Đã dựng 3 cảnh mẫu")
	quit()


# ---------- tiện ích ----------
func o_mau(w: int, h: int, mau: Color, tron := false) -> GradientTexture2D:
	var g := Gradient.new()
	if tron:
		g.offsets = PackedFloat32Array([0.0, 0.96, 1.0])
		g.colors = PackedColorArray([mau, mau, Color(mau, 0.0)])
	else:
		g.offsets = PackedFloat32Array([0.0, 1.0])
		g.colors = PackedColorArray([mau.lightened(0.15), mau.darkened(0.15)])
	var t := GradientTexture2D.new()
	t.gradient = g
	t.width = w
	t.height = h
	if tron:
		t.fill = GradientTexture2D.FILL_RADIAL
		t.fill_from = Vector2(0.5, 0.5)
		t.fill_to = Vector2(1.0, 0.5)
	else:
		t.fill_from = Vector2(0, 0)
		t.fill_to = Vector2(1, 1)
	return t


func khop(ten: String, cha: Node, chu: Node, vi_tri: Vector2, anh_w: int, anh_h: int, mau: Color, lech: Vector2, tron := false) -> Node2D:
	var n := Node2D.new()
	n.name = ten
	n.position = vi_tri
	cha.add_child(n)
	n.owner = chu
	var s := Sprite2D.new()
	s.name = "Anh"
	s.texture = o_mau(anh_w, anh_h, mau, tron)
	s.offset = lech
	n.add_child(s)
	s.owner = chu
	return n


func them(a: Animation, duong: String, khoa: Array) -> void:
	# khoa: [[giây, giá trị], ...]
	var i := a.add_track(Animation.TYPE_VALUE)
	a.track_set_path(i, NodePath(duong))
	a.track_set_interpolation_type(i, Animation.INTERPOLATION_CUBIC)
	a.value_track_set_update_mode(i, Animation.UPDATE_CONTINUOUS)
	for k in khoa:
		a.track_insert_key(i, k[0], k[1])


func anim(ten: String, dai: float, lap: bool) -> Animation:
	var a := Animation.new()
	a.resource_name = ten
	a.length = dai
	a.loop_mode = Animation.LOOP_LINEAR if lap else Animation.LOOP_NONE
	return a


const MAC_DINH := {
	"Hinh:position": Vector2.ZERO, "Hinh:rotation": 0.0,
	"Hinh/Than:position": Vector2(0, -130), "Hinh/Than:rotation": 0.0,
	"Hinh/Than/Dau:rotation": 0.0, "Hinh/Than/TayTruoc:rotation": 0.0, "Hinh/Than/TaySau:rotation": 0.0,
	"Hinh/ChanTruoc:rotation": 0.0, "Hinh/ChanSau:rotation": 0.0,
}


## Mỗi động tác đều có đủ các rãnh (thiếu thì giữ tư thế đứng), để đổi động tác không bị dính tư thế cũ.
func day_du(a: Animation) -> void:
	for duong in MAC_DINH:
		if a.find_track(NodePath(duong), Animation.TYPE_VALUE) < 0:
			them(a, duong, [[0.0, MAC_DINH[duong]]])


func luu(goc: Node, duong: String) -> void:
	var p := PackedScene.new()
	var e := p.pack(goc)
	if e != OK:
		push_error("pack lỗi " + duong)
	ResourceSaver.save(p, duong)
	goc.free()


# ---------- EM BÉ ----------
func tao_em_be() -> void:
	var r := Node2D.new()
	r.name = "EmBe"
	r.position = GOC
	r.set_script(load("res://xuat_sprite.gd"))
	var hinh := Node2D.new()
	hinh.name = "Hinh"
	r.add_child(hinh)
	hinh.owner = r
	var da := Color("f3d9c4")
	var ao := Color("479544")
	khop("ChanSau", hinh, r, Vector2(-28, -130), 56, 130, ao.darkened(0.3), Vector2(0, 62))
	var than := khop("Than", hinh, r, Vector2(0, -130), 170, 200, ao, Vector2(0, -90))
	khop("ChanTruoc", hinh, r, Vector2(28, -130), 56, 130, ao.darkened(0.1), Vector2(0, 62))
	var tay_sau := khop("TaySau", than, r, Vector2(-62, -160), 48, 125, da.darkened(0.25), Vector2(0, 52))
	tay_sau.show_behind_parent = true
	khop("Dau", than, r, Vector2(0, -180), 250, 250, Color("2f6b33"), Vector2(0, -110), true)
	var tay_truoc := khop("TayTruoc", than, r, Vector2(62, -160), 48, 125, da, Vector2(0, 52))
	tay_truoc.z_index = 1
	var vk := Sprite2D.new()
	vk.name = "VuKhiXem"
	vk.texture = o_mau(190, 34, Color("b4c0d4"))
	vk.position = Vector2(0, 110)
	vk.offset = Vector2(70, 0)
	tay_truoc.add_child(vk)
	vk.owner = r
	var an: Array[NodePath] = [NodePath("Hinh/Than/TayTruoc/VuKhiXem")]
	r.set("an_khi_xuat", an)

	var ap := AnimationPlayer.new()
	ap.name = "AnimationPlayer"
	r.add_child(ap)
	ap.owner = r
	var lib := AnimationLibrary.new()
	var T := "Hinh/Than"
	# Đứng thở
	var a := anim("idle", 1.2, true)
	them(a, T + ":position", [[0.0, Vector2(0, -130)], [0.6, Vector2(0, -137)], [1.2, Vector2(0, -130)]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.6, 0.05], [1.2, 0.0]])
	them(a, T + "/TayTruoc:rotation", [[0.0, 0.0], [0.6, 0.1], [1.2, 0.0]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.0], [0.6, -0.1], [1.2, 0.0]])
	lib.add_animation("idle", a)
	# Đi
	a = anim("move", 0.6, true)
	them(a, T + ":position", [[0.0, Vector2(0, -130)], [0.15, Vector2(0, -142)], [0.3, Vector2(0, -130)], [0.45, Vector2(0, -142)], [0.6, Vector2(0, -130)]])
	them(a, "Hinh/ChanTruoc:rotation", [[0.0, 0.5], [0.3, -0.5], [0.6, 0.5]])
	them(a, "Hinh/ChanSau:rotation", [[0.0, -0.5], [0.3, 0.5], [0.6, -0.5]])
	them(a, T + "/TayTruoc:rotation", [[0.0, -0.6], [0.3, 0.6], [0.6, -0.6]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.6], [0.3, -0.6], [0.6, 0.6]])
	them(a, T + ":rotation", [[0.0, 0.08], [0.6, 0.08]])
	lib.add_animation("move", a)
	# Chuẩn bị đánh (lấy đà)
	a = anim("tele", 0.7, false)
	them(a, T + ":position", [[0.0, Vector2(0, -130)], [0.7, Vector2(0, -118)]])
	them(a, T + ":rotation", [[0.0, 0.0], [0.7, -0.18]])
	them(a, T + "/TayTruoc:rotation", [[0.0, 0.0], [0.7, -2.3]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.0], [0.7, 0.5]])
	them(a, "Hinh/ChanTruoc:rotation", [[0.0, 0.0], [0.7, 0.35]])
	them(a, "Hinh/ChanSau:rotation", [[0.0, 0.0], [0.7, -0.35]])
	lib.add_animation("tele", a)
	# Đánh (vung kiếm)
	a = anim("atk", 0.55, false)
	them(a, T + ":rotation", [[0.0, -0.18], [0.12, 0.25], [0.55, 0.0]])
	them(a, T + ":position", [[0.0, Vector2(0, -118)], [0.12, Vector2(14, -126)], [0.55, Vector2(0, -130)]])
	them(a, T + "/TayTruoc:rotation", [[0.0, -2.3], [0.12, 1.3], [0.35, 1.1], [0.55, 0.0]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.5], [0.12, -0.6], [0.55, 0.0]])
	them(a, "Hinh/ChanTruoc:rotation", [[0.0, 0.35], [0.12, -0.3], [0.55, 0.0]])
	them(a, "Hinh/ChanSau:rotation", [[0.0, -0.35], [0.12, 0.4], [0.55, 0.0]])
	lib.add_animation("atk", a)
	# Trúng đòn
	a = anim("hit", 0.35, false)
	them(a, "Hinh:position", [[0.0, Vector2.ZERO], [0.08, Vector2(-22, 0)], [0.35, Vector2.ZERO]])
	them(a, T + ":rotation", [[0.0, 0.0], [0.08, -0.32], [0.35, 0.0]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.08, -0.25], [0.35, 0.0]])
	them(a, T + "/TayTruoc:rotation", [[0.0, 0.0], [0.08, -0.9], [0.35, 0.0]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.0], [0.08, 0.9], [0.35, 0.0]])
	lib.add_animation("hit", a)
	# Chết (ngã ngửa)
	a = anim("die", 1.1, false)
	them(a, "Hinh:rotation", [[0.0, 0.0], [0.5, -1.45], [0.65, -1.35], [1.1, -1.45]])
	them(a, "Hinh:position", [[0.0, Vector2.ZERO], [0.5, Vector2(220, -20)], [1.1, Vector2(220, -20)]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.5, -0.3], [1.1, 0.1]])
	them(a, T + "/TayTruoc:rotation", [[0.0, 0.0], [0.5, -1.8], [1.1, -1.5]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.0], [0.5, -1.4], [1.1, -1.2]])
	lib.add_animation("die", a)
	# Né (lao người tới, co chân)
	a = anim("ne", 0.27, false)
	them(a, "Hinh:position", [[0.0, Vector2.ZERO], [0.13, Vector2(0, -40)], [0.27, Vector2.ZERO]])
	them(a, "Hinh:rotation", [[0.0, 0.0], [0.13, 0.9], [0.27, 0.0]])
	them(a, "Hinh/ChanTruoc:rotation", [[0.0, 0.0], [0.13, -1.1], [0.27, 0.0]])
	them(a, "Hinh/ChanSau:rotation", [[0.0, 0.0], [0.13, -0.6], [0.27, 0.0]])
	them(a, T + "/TayTruoc:rotation", [[0.0, 0.0], [0.13, 1.4], [0.27, 0.0]])
	them(a, T + "/TaySau:rotation", [[0.0, 0.0], [0.13, 1.2], [0.27, 0.0]])
	lib.add_animation("ne", a)
	for ten in lib.get_animation_list():
		day_du(lib.get_animation(ten))
	ap.add_animation_library("", lib)
	ap.autoplay = "idle"
	luu(r, "res://em_be.tscn")


# ---------- VŨ KHÍ ----------
func tao_vu_khi() -> void:
	var r := Node2D.new()
	r.name = "VuKhi"
	r.set_script(load("res://xuat_vu_khi.gd"))
	var s := Sprite2D.new()
	s.name = "Anh"
	s.texture = o_mau(520, 90, Color("b4c0d4"))
	s.position = Vector2(512, 512)
	r.add_child(s)
	s.owner = r
	var cam := Marker2D.new()
	cam.name = "Cam"
	cam.position = Vector2(300, 512)
	cam.gizmo_extents = 30
	r.add_child(cam)
	cam.owner = r
	var mui := Marker2D.new()
	mui.name = "Mui"
	mui.position = Vector2(770, 512)
	mui.gizmo_extents = 30
	r.add_child(mui)
	mui.owner = r
	luu(r, "res://vu_khi.tscn")


# ---------- HIỆU ỨNG KIẾM ----------
func trang_khuyet(ban_kinh: float, day: float, goc_mo: float) -> PackedVector2Array:
	var p := PackedVector2Array()
	var n := 24
	for i in n + 1:
		var a := -goc_mo / 2 + goc_mo * i / n
		p.append(Vector2(cos(a), sin(a)) * ban_kinh)
	for i in n + 1:
		var a := goc_mo / 2 - goc_mo * i / n
		var t := sin(PI * i / n)
		p.append(Vector2(cos(a), sin(a)) * (ban_kinh - day * t))
	return p


func hinh(ten: String, cha: Node, chu: Node, diem: PackedVector2Array, mau: Color) -> Polygon2D:
	var g := Polygon2D.new()
	g.name = ten
	g.polygon = diem
	g.color = mau
	g.modulate = Color(1, 1, 1, 0)
	cha.add_child(g)
	g.owner = chu
	return g


func tao_hieu_ung() -> void:
	var r := Node2D.new()
	r.name = "HieuUngKiem"
	r.position = Vector2(512, 512)
	r.set_script(load("res://xuat_sprite.gd"))
	r.set("ma", "hu-kiem-guom-rong")
	r.set("ten", "Hiệu ứng Gươm Rồng")
	r.set("loai", "hieu-ung")
	r.set("cao_trong_game", 48)
	r.set("dong_tac", PackedStringArray(["chem_ngang", "chem_nguoc", "nhat_ket", "nhat_luot", "tram_nguyet", "trung_don"]))
	hinh("VetChem", r, r, trang_khuyet(260, 70, 2.2), Color("dff3ff"))
	hinh("Trang", r, r, trang_khuyet(200, 80, 2.6), Color("ffe08a"))
	var sao := PackedVector2Array()
	for i in 16:
		var rr := 150.0 if i % 2 == 0 else 45.0
		var a := TAU * i / 16
		sao.append(Vector2(cos(a), sin(a)) * rr)
	hinh("TiaTrung", r, r, sao, Color("fff6c8"))
	var ap := AnimationPlayer.new()
	ap.name = "AnimationPlayer"
	r.add_child(ap)
	ap.owner = r
	var lib := AnimationLibrary.new()
	var AN := Color(1, 1, 1, 0)
	var HIEN := Color(1, 1, 1, 1)
	var a := anim("chem_ngang", 0.3, false)
	them(a, "VetChem:rotation", [[0.0, -1.3], [0.3, 0.9]])
	them(a, "VetChem:scale", [[0.0, Vector2(0.7, 0.7)], [0.3, Vector2(1.0, 1.0)]])
	them(a, "VetChem:modulate", [[0.0, HIEN], [0.15, HIEN], [0.3, AN]])
	them(a, "Trang:modulate", [[0.0, AN]])
	them(a, "TiaTrung:modulate", [[0.0, AN]])
	lib.add_animation("chem_ngang", a)
	a = anim("chem_nguoc", 0.3, false)
	them(a, "VetChem:rotation", [[0.0, 0.9], [0.3, -1.3]])
	them(a, "VetChem:scale", [[0.0, Vector2(0.7, -0.7)], [0.3, Vector2(1.0, -1.0)]])
	them(a, "VetChem:modulate", [[0.0, HIEN], [0.15, HIEN], [0.3, AN]])
	them(a, "Trang:modulate", [[0.0, AN]])
	them(a, "TiaTrung:modulate", [[0.0, AN]])
	lib.add_animation("chem_nguoc", a)
	a = anim("nhat_ket", 0.46, false)
	them(a, "VetChem:rotation", [[0.0, -1.6], [0.25, 1.2]])
	them(a, "VetChem:scale", [[0.0, Vector2(0.9, 0.9)], [0.25, Vector2(1.35, 1.35)]])
	them(a, "VetChem:modulate", [[0.0, HIEN], [0.25, HIEN], [0.46, AN]])
	them(a, "TiaTrung:position", [[0.0, Vector2(230, 0)]])
	them(a, "TiaTrung:scale", [[0.0, Vector2(0.1, 0.1)], [0.2, Vector2(0.2, 0.2)], [0.46, Vector2(1.2, 1.2)]])
	them(a, "TiaTrung:modulate", [[0.0, AN], [0.2, HIEN], [0.46, AN]])
	them(a, "Trang:modulate", [[0.0, AN]])
	lib.add_animation("nhat_ket", a)
	a = anim("nhat_luot", 0.12, false)
	them(a, "VetChem:rotation", [[0.0, 0.0]])
	them(a, "VetChem:scale", [[0.0, Vector2(0.4, 0.25)], [0.12, Vector2(1.5, 0.35)]])
	them(a, "VetChem:modulate", [[0.0, HIEN], [0.12, AN]])
	them(a, "Trang:modulate", [[0.0, AN]])
	them(a, "TiaTrung:modulate", [[0.0, AN]])
	lib.add_animation("nhat_luot", a)
	a = anim("tram_nguyet", 0.5, false)
	them(a, "Trang:position", [[0.0, Vector2.ZERO], [0.5, Vector2.ZERO]])
	them(a, "Trang:rotation", [[0.0, 0.0], [0.5, 0.0]])
	them(a, "Trang:scale", [[0.0, Vector2(0.6, 0.6)], [0.1, Vector2(1.0, 1.0)], [0.5, Vector2(1.05, 1.05)]])
	them(a, "Trang:modulate", [[0.0, AN], [0.08, HIEN], [0.4, HIEN], [0.5, Color(1, 1, 1, 0.6)]])
	them(a, "VetChem:modulate", [[0.0, AN]])
	them(a, "TiaTrung:modulate", [[0.0, AN]])
	lib.add_animation("tram_nguyet", a)
	a = anim("trung_don", 0.25, false)
	them(a, "TiaTrung:position", [[0.0, Vector2.ZERO]])
	them(a, "TiaTrung:scale", [[0.0, Vector2(0.2, 0.2)], [0.25, Vector2(1.0, 1.0)]])
	them(a, "TiaTrung:rotation", [[0.0, 0.0], [0.25, 0.4]])
	them(a, "TiaTrung:modulate", [[0.0, HIEN], [0.25, AN]])
	them(a, "VetChem:modulate", [[0.0, AN]])
	them(a, "Trang:modulate", [[0.0, AN]])
	lib.add_animation("trung_don", a)
	ap.add_animation_library("", lib)
	luu(r, "res://hieu_ung_kiem.tscn")


# ---------- BỐN CHÂN ----------
const MAC_DINH_4 := {
	"Hinh:position": Vector2.ZERO, "Hinh:rotation": 0.0,
	"Hinh/Than:position": Vector2(0, -120), "Hinh/Than:rotation": 0.0, "Hinh/Than/Dau:rotation": 0.0,
	"Hinh/ChanTruocGan:rotation": 0.0, "Hinh/ChanTruocXa:rotation": 0.0, "Hinh/ChanSauGan:rotation": 0.0, "Hinh/ChanSauXa:rotation": 0.0,
	"Hinh/Than/Duoi1:rotation": -0.35, "Hinh/Than/Duoi2:rotation": 0.0, "Hinh/Than/Duoi3:rotation": 0.35,
}


func tao_bon_chan() -> void:
	var r := Node2D.new()
	r.name = "BonChan"
	r.position = GOC
	r.set_script(load("res://xuat_sprite.gd"))
	r.set("ma", "hoTinh")
	r.set("ten", "Hồ Tinh")
	r.set("doi_tuong", "quai")
	r.set("khung", "bon-chan")
	r.set("cao_trong_game", 119)
	r.set("dong_tac", PackedStringArray(["idle", "move", "tele", "atk", "hit", "die"]))
	var hinh := Node2D.new()
	hinh.name = "Hinh"
	r.add_child(hinh)
	hinh.owner = r
	var long := Color("f2e6cf")
	for t in [["ChanSauXa", -40], ["ChanTruocXa", 66], ["ChanSauGan", -54], ["ChanTruocGan", 90]]:
		var k := khop(t[0], hinh, r, Vector2(t[1], -120), 50, 150, long.darkened(0.2 if t[0].ends_with("Xa") else 0.05), Vector2(0, 62))
	var than := khop("Than", hinh, r, Vector2(0, -120), 300, 190, long, Vector2(0, -24))
	for i in 3:
		var d := khop("Duoi%d" % (i + 1), than, r, Vector2(-120, -40), 220, 50, Color("e8442a"), Vector2(-100, 0))
		d.show_behind_parent = true
	khop("Dau", than, r, Vector2(115, -60), 170, 170, long.darkened(0.05), Vector2(40, -60), true)
	var ap := AnimationPlayer.new()
	ap.name = "AnimationPlayer"
	r.add_child(ap)
	ap.owner = r
	var lib := AnimationLibrary.new()
	var T := "Hinh/Than"
	var D := [T + "/Duoi1:rotation", T + "/Duoi2:rotation", T + "/Duoi3:rotation"]
	var goc_duoi := [-0.35, 0.0, 0.35]
	var a := anim("idle", 1.2, true)
	them(a, T + ":position", [[0.0, Vector2(0, -120)], [0.6, Vector2(0, -126)], [1.2, Vector2(0, -120)]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.6, 0.06], [1.2, 0.0]])
	for i in 3:
		them(a, D[i], [[0.0, goc_duoi[i]], [0.2 + i * 0.15, goc_duoi[i] - 0.15], [0.8 + i * 0.1, goc_duoi[i] + 0.08], [1.2, goc_duoi[i]]])
	lib.add_animation("idle", a)
	a = anim("move", 0.6, true)
	them(a, T + ":position", [[0.0, Vector2(0, -120)], [0.15, Vector2(0, -130)], [0.3, Vector2(0, -120)], [0.45, Vector2(0, -130)], [0.6, Vector2(0, -120)]])
	them(a, "Hinh/ChanTruocGan:rotation", [[0.0, 0.45], [0.3, -0.45], [0.6, 0.45]])
	them(a, "Hinh/ChanSauXa:rotation", [[0.0, 0.45], [0.3, -0.45], [0.6, 0.45]])
	them(a, "Hinh/ChanTruocXa:rotation", [[0.0, -0.45], [0.3, 0.45], [0.6, -0.45]])
	them(a, "Hinh/ChanSauGan:rotation", [[0.0, -0.45], [0.3, 0.45], [0.6, -0.45]])
	them(a, T + "/Dau:rotation", [[0.0, -0.04], [0.3, 0.04], [0.6, -0.04]])
	for i in 3:
		them(a, D[i], [[0.0, goc_duoi[i] - 0.1], [0.3, goc_duoi[i] + 0.12], [0.6, goc_duoi[i] - 0.1]])
	lib.add_animation("move", a)
	a = anim("tele", 0.7, false)
	them(a, T + ":position", [[0.0, Vector2(0, -120)], [0.7, Vector2(-10, -104)]])
	them(a, T + ":rotation", [[0.0, 0.0], [0.7, -0.08]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.7, 0.2]])
	them(a, "Hinh/ChanTruocGan:rotation", [[0.0, 0.0], [0.7, -0.35]])
	them(a, "Hinh/ChanTruocXa:rotation", [[0.0, 0.0], [0.7, -0.3]])
	them(a, "Hinh/ChanSauGan:rotation", [[0.0, 0.0], [0.7, 0.4]])
	them(a, "Hinh/ChanSauXa:rotation", [[0.0, 0.0], [0.7, 0.35]])
	for i in 3:
		them(a, D[i], [[0.0, goc_duoi[i]], [0.7, goc_duoi[i] - 0.35]])
	lib.add_animation("tele", a)
	a = anim("atk", 0.55, false)
	them(a, "Hinh:position", [[0.0, Vector2.ZERO], [0.12, Vector2(60, 0)], [0.55, Vector2.ZERO]])
	them(a, T + ":position", [[0.0, Vector2(-10, -104)], [0.12, Vector2(0, -132)], [0.55, Vector2(0, -120)]])
	them(a, T + ":rotation", [[0.0, -0.08], [0.12, 0.12], [0.55, 0.0]])
	them(a, T + "/Dau:rotation", [[0.0, 0.2], [0.12, -0.3], [0.3, -0.25], [0.55, 0.0]])
	them(a, "Hinh/ChanTruocGan:rotation", [[0.0, -0.35], [0.12, -0.8], [0.55, 0.0]])
	them(a, "Hinh/ChanTruocXa:rotation", [[0.0, -0.3], [0.12, -0.7], [0.55, 0.0]])
	them(a, "Hinh/ChanSauGan:rotation", [[0.0, 0.4], [0.12, 0.5], [0.55, 0.0]])
	them(a, "Hinh/ChanSauXa:rotation", [[0.0, 0.35], [0.12, 0.45], [0.55, 0.0]])
	for i in 3:
		them(a, D[i], [[0.0, goc_duoi[i] - 0.35], [0.12, goc_duoi[i] + 0.3], [0.55, goc_duoi[i]]])
	lib.add_animation("atk", a)
	a = anim("hit", 0.35, false)
	them(a, "Hinh:position", [[0.0, Vector2.ZERO], [0.08, Vector2(-26, 0)], [0.35, Vector2.ZERO]])
	them(a, T + ":rotation", [[0.0, 0.0], [0.08, -0.15], [0.35, 0.0]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.08, -0.3], [0.35, 0.0]])
	lib.add_animation("hit", a)
	a = anim("die", 1.1, false)
	them(a, T + ":position", [[0.0, Vector2(0, -120)], [0.5, Vector2(0, -50)], [1.1, Vector2(0, -50)]])
	them(a, T + "/Dau:rotation", [[0.0, 0.0], [0.5, 0.5], [1.1, 0.45]])
	them(a, "Hinh/ChanTruocGan:rotation", [[0.0, 0.0], [0.5, -1.3]])
	them(a, "Hinh/ChanTruocXa:rotation", [[0.0, 0.0], [0.5, -1.1]])
	them(a, "Hinh/ChanSauGan:rotation", [[0.0, 0.0], [0.5, 1.3]])
	them(a, "Hinh/ChanSauXa:rotation", [[0.0, 0.0], [0.5, 1.1]])
	for i in 3:
		them(a, D[i], [[0.0, goc_duoi[i]], [0.6, goc_duoi[i] + 0.7]])
	lib.add_animation("die", a)
	for ten in lib.get_animation_list():
		var an := lib.get_animation(ten)
		for duong in MAC_DINH_4:
			if an.find_track(NodePath(duong), Animation.TYPE_VALUE) < 0:
				them(an, duong, [[0.0, MAC_DINH_4[duong]]])
	ap.add_animation_library("", lib)
	ap.autoplay = "idle"
	luu(r, "res://bon_chan.tscn")


# ---------- ÁO (TRANG PHỤC) ----------
func tao_ao() -> void:
	var r := Node2D.new()
	r.name = "Ao"
	r.set_script(load("res://xuat_ao.gd"))
	var s := Sprite2D.new()
	s.name = "Anh"
	s.texture = o_mau(300, 280, Color("d8b45c"))
	s.position = Vector2(512, 512)
	r.add_child(s)
	s.owner = r
	luu(r, "res://ao.tscn")
