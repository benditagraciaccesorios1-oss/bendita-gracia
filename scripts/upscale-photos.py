"""Enlarge small catalog photographs and illustrative scenes 4x with Real-ESRGAN (realesrgan-x4plus).

Usage: python scripts/upscale-photos.py PATH/TO/realesrgan-ncnn-vulkan.exe
Get the executable from https://github.com/xinntao/Real-ESRGAN/releases (ncnn-vulkan, Windows).
The AI reconstructs detail that is not in the source; review every result before publishing.
Results are kept as WebP (quality 96) so they stay small enough to version:
photographs in images/ai/ (longest side 1600 px), illustrative scenes in images/ai/references/ (2000 px).
Then run the three prepare-*.py scripts to rebuild the published files.
"""
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
tool = Path(sys.argv[1]).resolve()
JOBS = [  # exporting script, flag, output folder, longest side
    ('prepare-original-images.py', '--export-small', ROOT / 'images' / 'ai', 1600),
    ('prepare-reference-images.py', '--export', ROOT / 'images' / 'ai' / 'references', 2000),
    ('prepare-home-creations.py', '--export', ROOT / 'images' / 'ai' / 'references', 2000),
]
for script, flag, out, side in JOBS:
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as small, tempfile.TemporaryDirectory() as large:
        subprocess.run([sys.executable, '-I', str(ROOT / 'scripts' / script), flag, small], check=True)
        subprocess.run([str(tool), '-i', small, '-o', large, '-n', 'realesrgan-x4plus', '-s', '4', '-f', 'png'], check=True, cwd=tool.parent)
        for png in sorted(Path(large).glob('*.png')):
            with Image.open(png) as image:
                image.thumbnail((side, side), Image.Resampling.LANCZOS)
                image.save(out / f'{png.stem}.webp', quality=96, method=6)
            print(f'{out.name}/{png.stem}.webp')
