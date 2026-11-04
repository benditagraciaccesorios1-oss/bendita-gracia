"""Extract only the three artwork panels from the user-provided home reference.

Source labels are deliberately retained; the page does not print them twice.
The original file and the catalog photographs are never modified.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/references'
PANELS = {
    'velas-regalo': (50, 615, 495, 847),
    'figuras-pebetero': (521, 615, 966, 847),
    'sachets-colgantes': (991, 615, 1436, 847),
}
with Image.open(ROOT / 'Bendita Gracia imagen del home.png') as original:
    for name, bounds in PANELS.items():
        image = original.crop(bounds).convert('RGB')
        target = OUT / f'home-creation-{name}.webp'
        image.save(target, lossless=True, method=6)
        print(f'{target.name}: {image.width}x{image.height}')
