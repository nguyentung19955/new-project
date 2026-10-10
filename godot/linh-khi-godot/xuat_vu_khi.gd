extends Node2D
## XUẤT VŨ KHÍ CHO GAME LINH KHÍ
## Mở vu_khi.tscn rồi bấm F6. Godot chụp hình vũ khí, đo điểm cầm (chấm Cam) và mũi (chấm Mui),
## rồi ghi xuat/<mã>.sprite.json để game dùng. Game tự xoay, vung, đâm vũ khí theo từng đòn.
## Chỉ chỉnh các ô ở bảng Inspector, đừng sửa code.

@export var ma := "vk-sword-3"                   ## vk-<loại>-<dòng>, dòng đếm từ 0 (Gươm Rồng là dòng thứ 4 của Kiếm → 3)
@export var ten := "Gươm Rồng"
@export_enum("sword", "bow", "spear", "hammer") var loai_vu_khi := "sword"  ## sword=Kiếm, bow=Cung, spear=Giáo, hammer=Búa
@export var dong := 3
@export var dai_trong_game := 46                 ## Chiều dài vũ khí trong game (điểm ảnh)


func _ready() -> void:
	var vp := get_viewport()
	vp.transparent_bg = true
	for c in [$Cam, $Mui]:
		c.visible = false
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var img := vp.get_texture().get_image()
	var r := img.get_used_rect()
	if r.size.x <= 0:
		push_error("Không thấy hình vũ khí: hãy gắn ảnh vào nút Anh")
		return
	var k := float(dai_trong_game) / r.size.x
	var w := maxi(1, roundi(r.size.x * k))
	var h := maxi(1, roundi(r.size.y * k))
	var cat := img.get_region(r)
	cat.convert(Image.FORMAT_RGBA8)
	var to := cat.duplicate()
	cat.resize(w, h, Image.INTERPOLATE_LANCZOS)
	var doi := func(n: Node2D) -> Array:
		var p := n.get_global_transform_with_canvas().origin
		return [snappedf((p.x - r.position.x) * k, 0.01), snappedf((p.y - r.position.y) * k, 0.01)]
	var tep := {
		"loai": "linh-khi-sprite", "phien_ban": 1, "nguon": "godot",
		"ma": ma, "ten": ten, "doi_tuong": "vu-khi", "vung": "moi", "rong": w, "cao": h,
		"anh": "data:image/png;base64," + Marshalls.raw_to_base64(cat.save_png_to_buffer()),
		"vu_khi": {"loai": loai_vu_khi, "dong": dong, "he": null, "gd": null, "cam": doi.call($Cam), "mui": doi.call($Mui), "day": null},
	}
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://xuat/xem_truoc"))
	var duong := "res://xuat/" + ma + ".sprite.json"
	var f := FileAccess.open(duong, FileAccess.WRITE)
	f.store_string(JSON.stringify(tep, "  "))
	f.close()
	to.save_png("res://xuat/xem_truoc/" + ma + ".png")
	var bao := "XONG! Vũ khí %d×%d điểm ảnh.\nTệp: %s" % [w, h, ProjectSettings.globalize_path(duong)]
	print(bao)
	var lop := CanvasLayer.new()
	add_child(lop)
	var chu := Label.new()
	chu.text = bao + "\n\n(Đóng cửa sổ này để quay lại)"
	chu.position = Vector2(24, 24)
	chu.add_theme_font_size_override("font_size", 22)
	chu.add_theme_constant_override("outline_size", 6)
	chu.add_theme_color_override("font_outline_color", Color.BLACK)
	lop.add_child(chu)
	if DisplayServer.get_name() == "headless" or OS.get_cmdline_user_args().has("--tu-dong"):
		get_tree().quit()
