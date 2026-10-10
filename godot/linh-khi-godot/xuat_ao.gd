@tool
extends Node2D
## XUẤT TRANG PHỤC (áo, mũ, đồ đeo) CHO GAME LINH KHÍ
## Kéo ảnh Gemini vào ô Texture của nút Anh, bấm nút "Tự xoá nền" ở Inspector, rồi F6.
## Game tự mặc trang phục lên em bé và cho nó cử động theo người.

@export var ma := "tp-robes-ao_toi"              ## tp-<chỗ mặc>-<mã đồ>. Chỗ mặc: robes (áo), hats (mũ), backs (đeo lưng), masks (mặt nạ)
@export var ten := "Áo tơi lá"
@export_enum("robes", "hats", "backs", "masks", "hands") var cho_mac := "robes"
@export var ma_do := "ao_toi"                    ## mã món đồ trong game
@export var cao_trong_game := 14                 ## chiều cao trong game (điểm ảnh)
@export_tool_button("Tự xoá nền và cắt sát") var nut = tu_dat


func _ready() -> void:
	if Engine.is_editor_hint():
		return
	var vp := get_viewport()
	vp.transparent_bg = true
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var img := vp.get_texture().get_image()
	var r := img.get_used_rect()
	if r.size.x <= 0:
		push_error("Không thấy hình: hãy gắn ảnh vào nút Anh")
		return
	var k := float(cao_trong_game) / r.size.y
	var w := maxi(1, roundi(r.size.x * k))
	var h := cao_trong_game
	var cat := img.get_region(r)
	cat.convert(Image.FORMAT_RGBA8)
	var to := cat.duplicate()
	cat.resize(w, h, Image.INTERPOLATE_LANCZOS)
	var moc: Array = {"hats": [0.5, -3.5], "masks": [2.5, 0.5], "robes": [0, -7], "backs": [-5, -8], "hands": [3, -2]}[cho_mac]
	var lech: Array = [roundi(0.5 - w / 2.0), roundi(2 - h)] if cho_mac == "hats" else [roundi(moc[0] - w / 2.0), roundi(moc[1] - h / 2.0)]
	var tep := {
		"loai": "linh-khi-sprite", "phien_ban": 1, "nguon": "godot",
		"ma": ma, "ten": ten, "doi_tuong": "trang-phuc", "vung": "moi", "rong": w, "cao": h,
		"anh": "data:image/png;base64," + Marshalls.raw_to_base64(cat.save_png_to_buffer()),
		"trang_phuc": {"o": cho_mac, "look": ma_do, "lech": lech, "lop": "sau", "kieu": "bua", "tay_ao": true},
	}
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://xuat/xem_truoc"))
	var duong := "res://xuat/" + ma + ".sprite.json"
	var f := FileAccess.open(duong, FileAccess.WRITE)
	f.store_string(JSON.stringify(tep, "  "))
	f.close()
	to.save_png("res://xuat/xem_truoc/" + ma + ".png")
	var bao := "XONG! Trang phục %d×%d điểm ảnh.\nTệp: %s" % [w, h, ProjectSettings.globalize_path(duong)]
	print(bao)
	var lop := CanvasLayer.new()
	add_child(lop)
	var chu := Label.new()
	chu.text = bao + "\n\n(Đóng cửa sổ này để quay lại)"
	chu.position = Vector2(24, 24)
	chu.add_theme_font_size_override("font_size", 22)
	lop.add_child(chu)
	if DisplayServer.get_name() == "headless" or OS.get_cmdline_user_args().has("--tu-dong"):
		get_tree().quit()


func tu_dat() -> void:
	var anh: Sprite2D = $Anh
	if anh.texture == null:
		push_warning("Hãy kéo ảnh vào ô Texture của nút Anh trước")
		return
	var manh := TuRap.tach(anh.texture.get_image(), 0.002)
	if manh.is_empty():
		push_warning("Không tìm thấy hình trong ảnh")
		return
	var img: Image = manh[0]["anh"]
	anh.texture = TuRap.luu_anh(img, "res://anh/tach/" + ma + "/anh.res")
	anh.region_enabled = false
	anh.centered = true
	anh.offset = Vector2.ZERO
	var s := 560.0 / maxf(img.get_width(), img.get_height())
	anh.scale = Vector2(s, s)
	anh.position = Vector2(512, 512)
	print("Đã xoá nền. Bấm F6 để xuất.")
	if Engine.is_editor_hint():
		EditorInterface.mark_scene_as_unsaved()
