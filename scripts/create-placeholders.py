"""Generate original vector placeholders; these are not product photographs."""
from pathlib import Path
import math

OUT = Path(__file__).resolve().parents[1] / 'public/images/products'
OUT.mkdir(parents=True, exist_ok=True)
DEFS = '''<defs>
<linearGradient id="back" x2=".8" y2="1"><stop stop-color="#e5d3ba"/><stop offset="1" stop-color="#b89b7c"/></linearGradient>
<radialGradient id="light"><stop stop-color="#fff8e9" stop-opacity=".85"/><stop offset="1" stop-color="#fff8e9" stop-opacity="0"/></radialGradient>
<radialGradient id="pink" cx=".3" cy=".2"><stop stop-color="#ffe1d5"/><stop offset=".55" stop-color="#de9b98"/><stop offset="1" stop-color="#ac605e"/></radialGradient>
<radialGradient id="cream" cx=".3" cy=".2"><stop stop-color="#fff7df"/><stop offset=".6" stop-color="#ebd4a8"/><stop offset="1" stop-color="#b9a079"/></radialGradient>
<radialGradient id="purple" cx=".3" cy=".2"><stop stop-color="#e5d9eb"/><stop offset=".6" stop-color="#ae8db9"/><stop offset="1" stop-color="#78617f"/></radialGradient>
<linearGradient id="stone" x2="0" y2="1"><stop stop-color="#f4e9d3"/><stop offset="1" stop-color="#c6af8d"/></linearGradient>
<linearGradient id="glass"><stop stop-color="#fff" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
<filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>
</defs>'''


def rose(x, y, radius, color):
    petals = ''
    for ring, count, scale in [(1, 7, 1), (.62, 6, .7), (.3, 5, .42)]:
        for i in range(count):
            a = 2 * math.pi * i / count + ring
            px, py = math.cos(a) * radius * ring * .48, math.sin(a) * radius * ring * .48
            petals += f'<ellipse cx="{px:.1f}" cy="{py:.1f}" rx="{radius * scale * .52:.1f}" ry="{radius * scale * .37:.1f}" transform="rotate({i * 360 / count:.1f} {px:.1f} {py:.1f})" fill="url(#{color})" stroke="#fff7eb" stroke-opacity=".32" stroke-width="1.2"/>'
    return f'<g transform="translate({x} {y})">{petals}<path d="M-5 2 Q-7-9 4-7 Q13 0 0 6 Q-8 7-5 2" fill="none" stroke="#fff9ef" stroke-opacity=".65" stroke-width="2"/></g>'


def floral(color, peony=False, dome=False):
    result = '<ellipse cx="320" cy="469" rx="153" ry="19" fill="#644937" opacity=".22" filter="url(#shadow)"/>'
    result += '<path d="M162 425v35c0 44 316 44 316 0v-35" fill="url(#stone)"/><ellipse cx="320" cy="425" rx="158" ry="36" fill="#f0e2c9"/>'
    if peony:
        for ring in range(3):
            for i in range(12):
                angle = i * 30 + ring * 12
                result += f'<ellipse cx="320" cy="{328 + ring * 17}" rx="{37 - ring * 6}" ry="{111 - ring * 23}" transform="rotate({angle} 320 340)" fill="url(#{color if ring < 2 else "cream"})" stroke="#fff5ed" stroke-opacity=".4" stroke-width="2"/>'
    else:
        result += f'<circle cx="320" cy="304" r="126" fill="url(#{color})"/>'
        for x, y, r in [(0, -87, 41), (-62, -59, 43), (62, -57, 44), (-95, 0, 39), (-34, -4, 47), (40, 7, 46), (99, 12, 35), (-75, 65, 38), (-5, 73, 43), (68, 72, 38)]:
            result += rose(320 + x, 304 + y, r, color)
    result += '<path d="M320 192q-6-18 0-31" fill="none" stroke="#fff9e9" stroke-width="5" stroke-linecap="round"/>'
    if dome:
        result += '<path d="M158 430V264a162 162 0 01324 0v166Z" fill="url(#glass)" stroke="#f7ebd8" stroke-opacity=".8" stroke-width="3"/><path d="M185 282q0-110 90-140" fill="none" stroke="white" stroke-opacity=".45" stroke-width="8" stroke-linecap="round"/><ellipse cx="320" cy="441" rx="176" ry="23" fill="#b98450"/><ellipse cx="320" cy="431" rx="174" ry="22" fill="#d7b482"/>'
    return result


def figures():
    result = '<ellipse cx="320" cy="460" rx="209" ry="30" fill="url(#stone)"/>'
    for x, y, angle, color in [(205, 263, -15, 'pink'), (320, 235, 0, 'cream'), (430, 265, 15, 'pink')]:
        result += f'<g transform="translate({x} {y}) rotate({angle})"><rect x="-33" y="-10" width="66" height="190" rx="17" fill="url(#{color})" stroke="#fff0db" stroke-width="2"/><path d="M0-63 13-37 42-33 21-12 26 16 0 2-26 16-21-12-42-33-13-37Z" fill="url(#{color})" stroke="#fff3df" stroke-width="3"/><path d="M0-64v-22" stroke="#fff8ed" stroke-width="4"/></g>'
    return result


def sachets():
    result = ''
    for x, y, angle in [(215, 324, -18), (410, 332, 15)]:
        result += f'<g transform="translate({x} {y}) rotate({angle})"><path d="M-55-118-88-185-10-140 67-190 48-114 100 126Q0 165-100 126Z" fill="#fff" fill-opacity=".16" stroke="#fff8e8" stroke-opacity=".6"/><rect x="-77" y="-80" width="154" height="203" rx="60" fill="url(#cream)"/><circle cy="-55" r="8" fill="#a88a67"/><path d="M0-58V-134M-55-133Q-11-173 0-133Q44-175 56-133Q12-113 0-133Q-21-108-55-133" fill="none" stroke="#aa7955" stroke-width="5"/>'
        for i in range(7):
            a = i * math.pi * 2 / 7
            result += f'<ellipse cx="{math.cos(a) * 24:.1f}" cy="{20 + math.sin(a) * 24:.1f}" rx="12" ry="24" transform="rotate({i * 51} {math.cos(a) * 24:.1f} {20 + math.sin(a) * 24:.1f})" fill="#80684f" opacity=".75"/>'
        result += '<circle cy="20" r="10" fill="#b59a71"/></g>'
    return result

for slug, art in {
    'rosas-rosa': floral('pink'),
    'rosas-marfil': floral('cream'),
    'peonia-en-domo': floral('purple', True, True),
    'peonia-morada': floral('purple', True),
    'figuras-con-estrella': figures(),
    'sachet-botanico': sachets(),
}.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="560" viewBox="0 0 640 560">{DEFS}<path fill="url(#back)" d="M0 0h640v560H0z"/><path d="M80 420V225a240 240 0 01480 0v195" fill="#a98d6e" opacity=".2"/><ellipse cx="110" cy="100" rx="420" ry="290" fill="url(#light)"/><path d="M0 433q300-29 640 0v127H0" fill="#ddc8aa"/>{art}</svg>'
    (OUT / f'{slug}.svg').write_text(svg, encoding='utf-8')
