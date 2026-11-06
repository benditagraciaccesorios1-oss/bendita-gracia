"""Extract only the three artwork panels from the user-provided home reference.

Source labels are deliberately retained; the page does not print them twice.
The original file and the catalog photographs are never modified.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/references'
# AI-enlarged versions from scripts/upscale-photos.py replace the 445x232 crops when present.
AI = ROOT / 'images' / 'ai' / 'references'
EXPORT = Path(sys.argv[sys.argv.index('--export') + 1]) if '--export' in sys.argv else None
PANELS = {
    'velas-regalo': (50, 615, 495, 847),
    'figuras-pebetero': (521, 615, 966, 847),
    'sachets-colgantes': (991, 615, 1436, 847),
}
with Image.open(ROOT / 'Bendita Gracia imagen del home.png') as original:
    for name, bounds in PANELS.items():
        image = original.crop(bounds).convert('RGB')
        if EXPORT:
            image.save(EXPORT / f'home-creation-{name}.png')
            continue
        target = OUT / f'home-creation-{name}.webp'
        enlarged = AI / target.name
        if enlarged.exists():
            with Image.open(enlarged) as source:
                source.convert('RGB').save(target, quality=95, method=6)
            image = Image.open(target)
        else:
            image.save(target, lossless=True, method=6)
        print(f'{target.name}: {image.width}x{image.height}')
