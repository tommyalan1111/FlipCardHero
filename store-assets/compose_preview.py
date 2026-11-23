from pathlib import Path
from PIL import Image, ImageDraw

base = Path(r"E:\Work\FlipCardHero\store-assets")
shots = sorted((base / "screenshots").glob("phone-*.png"))

W, H = 1400, 1010
canvas = Image.new("RGB", (W, H), "#0b1b34")
draw = ImageDraw.Draw(canvas)

icon = Image.open(base / "icon-512.png").convert("RGB").resize((190, 190), Image.LANCZOS)
feat = Image.open(base / "feature-graphic-1024x500.png").convert("RGB").resize((900, 439), Image.LANCZOS)

canvas.paste(icon, (40, 30))
canvas.paste(feat, (260, 30))

phone_w, phone_h = 210, 373
gap = 16
total = len(shots) * phone_w + (len(shots) - 1) * gap
x = (W - total) // 2
y = 520
for s in shots:
    im = Image.open(s).convert("RGB").resize((phone_w, phone_h), Image.LANCZOS)
    canvas.paste(im, (x, y))
    x += phone_w + gap

out = base / "preview" / "overview.png"
canvas.save(out, optimize=True)
print("wrote", out, canvas.size)
