"""Создаёт оригинальные иллюстрации и короткие ролики для демо Lumo.

Нужен FFmpeg с librsvg и libx264. Для обычного запуска сайта скрипт не нужен:
готовые обложки и ролики уже включены в репозиторий.
"""
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1] / 'public'
(ROOT / 'covers').mkdir(parents=True, exist_ok=True)
(ROOT / 'media').mkdir(parents=True, exist_ok=True)
random.seed(24)

DEFS = '''<defs>
<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#90b7a4"/><stop offset=".7" stop-color="#e2d6a2"/><stop offset="1" stop-color="#f1d6a0"/></linearGradient>
<linearGradient id="purple" x2=".8" y2="1"><stop stop-color="#302c55"/><stop offset="1" stop-color="#a881a8"/></linearGradient>
<linearGradient id="ocean" x2="0" y2="1"><stop stop-color="#98c9c6"/><stop offset="1" stop-color="#1c656a"/></linearGradient>
<linearGradient id="night" x2="0" y2="1"><stop stop-color="#202b4c"/><stop offset="1" stop-color="#c78691"/></linearGradient>
<linearGradient id="earth" x2=".7" y2="1"><stop stop-color="#d4ae86"/><stop offset="1" stop-color="#ac745a"/></linearGradient>
<radialGradient id="sun"><stop stop-color="#fff3be"/><stop offset="1" stop-color="#ebcb85"/></radialGradient>
<radialGradient id="planet" cx=".3" cy=".2"><stop stop-color="#d5c3ec"/><stop offset=".6" stop-color="#8379b3"/><stop offset="1" stop-color="#343052"/></radialGradient>
<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="12" dy="25" stdDeviation="22" flood-color="#201f2428"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
</defs>'''

def mountain():
    return '''<rect width="1280" height="720" fill="url(#sky)"/>
<circle cx="890" cy="198" r="94" fill="url(#sun)"/><circle cx="890" cy="198" r="117" fill="none" stroke="#fff3c0" opacity=".17"/>
<path d="M0 470 110 330 220 400 470 188 600 335 750 265 875 365 1080 176 1280 353V720H0" fill="#78998a"/>
<path d="m355 300 115-112 72 84-67-27-33 32-25-12zM1000 263l80-87 76 67-71-18-33 28z" fill="#d0d7b6" opacity=".8"/>
<path d="M0 540 130 390 288 492 485 339 660 530 780 424 1018 540 1280 358V720H0" fill="#497f70"/>
<path d="M0 670 220 470 422 605 665 480 883 651 1064 505 1280 596V720H0" fill="#24594f"/>
<path d="M0 720 230 594 451 720M676 720l184-94 220 94" fill="#19463e"/>
<path d="M1050 480q-30 60-30 240h45q-34-136-15-240" fill="#839d77"/>
<path d="M0 695q220-70 460 25" stroke="#b1bc88" stroke-width="3" fill="none" opacity=".3"/>
<g fill="#244d3f"><path d="m1070 570 42-148 42 148h-25l39 84h-114l40-84z"/><path d="m1180 590 36-126 36 126h-21l34 73h-98l34-73z"/></g>'''

def design():
    return '''<rect width="1280" height="720" fill="#e7dfdd"/><path d="M0 530h1280v190H0z" fill="#d4c8cb"/>
<ellipse cx="700" cy="570" rx="440" ry="65" fill="#aa96a9" opacity=".2"/>
<g filter="url(#shadow)"><path d="M330 552V300a180 180 0 0 1 360 0v252H590V300a80 80 0 0 0-160 0v252z" fill="#f5ece0"/>
<rect x="710" y="330" width="220" height="220" rx="4" fill="#9b83ab"/>
<circle cx="805" cy="252" r="96" fill="#cfb4c7"/>
<path d="M400 552v-95a68 68 0 0 1 136 0v95z" fill="#776086"/>
<ellipse cx="1000" cy="553" rx="70" ry="15" fill="#aa96a9"/><path d="M960 550q-35-148 25-217 60 96 15 217" fill="#9caa8e"/><path d="M984 551q-8-74 74-122 3 76-74 122" fill="#bec5a0"/></g>'''

def music():
    return '''<rect width="1280" height="720" fill="url(#earth)"/>
<path d="M0 560h1280v160H0z" fill="#9c6e55"/>
<g opacity=".1" stroke="#fff" stroke-width="2">''' + ''.join(f'<path d="M{x} 0v560"/>' for x in range(30, 1280, 90)) + '''</g>
<g filter="url(#shadow)"><rect x="325" y="245" width="620" height="340" rx="17" fill="#514d42" transform="rotate(-7 635 415)"/>
<circle cx="600" cy="400" r="205" fill="#242923"/>
<g fill="none" stroke="#5a5d4c" opacity=".4">''' + ''.join(f'<circle cx="600" cy="400" r="{r}"/>' for r in range(80, 201, 11)) + '''</g>
<circle cx="600" cy="400" r="68" fill="#d6bd88"/><circle cx="600" cy="400" r="8" fill="#323b2c"/>
<path d="M871 302v186l-100 59" stroke="#d9d6bb" stroke-width="13" stroke-linecap="round" fill="none"/><circle cx="870" cy="294" r="23" fill="#ddd2b1"/>
<rect x="735" y="529" width="45" height="17" rx="4" fill="#e8d6a6" transform="rotate(-30 735 529)"/></g>
<circle cx="1078" cy="163" r="52" fill="#e7c795" opacity=".7"/>'''

def ocean():
    return '''<rect width="1280" height="720" fill="url(#ocean)"/>
<path d="M0 0h1280v170Q950 70 690 154T0 130" fill="#e9d9b5"/>
<path d="M0 134q350 130 670 34t610 28" stroke="#f8f3da" stroke-width="21" fill="none" opacity=".8"/>
<path d="M-40 282q350 130 670 34t700 28M-40 457q350 130 670 34t700 28M-40 624q350 130 670 34t700 28" stroke="#c3e5d4" stroke-width="5" fill="none" opacity=".65"/>
<path d="M-40 296q350 130 670 34t700 28M-40 470q350 130 670 34t700 28" stroke="#eff1d9" stroke-width="2" fill="none" opacity=".4"/>
<ellipse cx="960" cy="355" rx="52" ry="17" fill="#164d51" opacity=".25"/><path d="m918 334 55-56 49 56z" fill="#fff4d1"/><path d="M973 271v82m-45-14h92l-24 17h-48z" fill="#c48e5d" stroke="#8e7452" stroke-width="3"/>'''

def space():
    stars = ''.join(f'<circle cx="{random.randrange(1280)}" cy="{random.randrange(720)}" r="{random.choice([1,1,2,3])}" fill="#eddfef" opacity="{random.uniform(.3,.8):.2f}"/>' for _ in range(120))
    return f'''<rect width="1280" height="720" fill="url(#purple)"/>{stars}
<ellipse cx="760" cy="380" rx="440" ry="100" transform="rotate(-25 760 380)" fill="none" stroke="#c1a6bc" stroke-width="27" opacity=".65"/>
<circle cx="760" cy="380" r="213" fill="url(#planet)"/>
<path d="M372 558q210 25 450-85t333-273" fill="none" stroke="#d1b6cb" stroke-width="27" opacity=".65"/>
<circle cx="280" cy="180" r="45" fill="#c6b3bd"/><circle cx="295" cy="170" r="44" fill="#6e5e86"/>'''

def city():
    scene = '<rect width="1280" height="720" fill="url(#night)"/><circle cx="900" cy="180" r="72" fill="#e7baac"/>'
    for x, y, w, color in [(20,290,180,'#586078'),(230,160,150,'#353e55'),(425,300,180,'#62647c'),(640,240,150,'#3c4d65'),(835,390,160,'#545574'),(1020,220,220,'#414960')]:
        scene += f'<rect x="{x}" y="{y}" width="{w}" height="{720-y}" fill="{color}"/>'
        for yy in range(y+24, 680, 37):
            for xx in range(x+18, x+w-15, 28):
                if random.random() > .4:
                    scene += f'<rect x="{xx}" y="{yy}" width="9" height="15" fill="{random.choice(["#d3b38c","#a7acba","#b78694"])}" opacity=".7"/>'
    return scene + '<path d="M0 671h1280v49H0z" fill="#272f42"/><path d="M0 699h1280" stroke="#cc9f98" opacity=".5" stroke-width="2"/>'

def creative():
    return '''<rect width="1280" height="720" fill="#e4dba5"/>
<rect x="170" y="110" width="940" height="510" rx="8" fill="#f3ecc9" transform="rotate(-6 640 360)" filter="url(#shadow)"/>
<circle cx="480" cy="360" r="173" fill="#abbd98"/><path d="M480 187a173 173 0 0 1 0 346z" fill="#486f61"/>
<rect x="670" y="200" width="210" height="333" rx="105" fill="#b68c7b"/>
<circle cx="760" cy="300" r="63" fill="#f2d8ab"/><path d="m290 530 100-171 99 171z" fill="#d5ae65"/>
<path d="M920 257v210m-45-165h90m-90 120h90" stroke="#78947b" stroke-width="8" fill="none"/>
<circle cx="1010" cy="560" r="32" fill="#a2af7c"/>'''

def future():
    return '''<rect width="1280" height="720" fill="#b1c6bc"/>
<ellipse cx="665" cy="575" rx="377" ry="60" fill="#718f82" opacity=".3"/>
<g filter="url(#shadow)"><path d="M360 485V263q0-30 30-30h460q30 0 30 30v222z" fill="#3a5b50"/>
<rect x="377" y="250" width="486" height="219" rx="5" fill="#d7e4ca"/>
<circle cx="620" cy="354" r="73" fill="#6d9a81"/><path d="m590 325 65 29-65 30z" fill="#e6edcc"/>
<path d="m300 485 60 70h520l60-70z" fill="#e0e7d4"/><path d="m536 485 18 29h132l18-29" fill="#a7bcb0"/>
<rect x="960" y="317" width="95" height="215" rx="19" fill="#2b5043"/><rect x="969" y="335" width="77" height="171" rx="8" fill="#9cba9a"/><circle cx="1007" cy="422" r="22" fill="#d6e6b6"/>
<circle cx="264" cy="480" r="63" fill="#d4d9c0"/><circle cx="264" cy="467" r="50" fill="#e9ead8"/></g>'''

def forest():
    trees = ''
    for x, y, scale, color in [(50,440,1.3,'#184b3d'),(200,320,1.2,'#34644c'),(350,380,.8,'#5d8156'),(870,300,1.4,'#628158'),(1020,400,1.6,'#234e3e'),(1190,340,1.5,'#1c4938')]:
        trees += f'<g transform="translate({x} {y}) scale({scale})" fill="{color}"><rect x="-9" width="18" height="300"/><path d="M0-230-85 20h40l-75 150h240L45 20h40z"/></g>'
    return '''<rect width="1280" height="720" fill="#b3c5a0"/><circle cx="650" cy="190" r="99" fill="#efdf9c"/><path d="M0 430q340-80 640 10t640-40v320H0" fill="#8ba47a"/><path d="M0 560q340-80 640 10t640-40v190H0" fill="#67875f"/><path d="M640 440q-150 100-270 280h340q-160-140-70-280" fill="#c8c394"/>''' + trees

SCENES = {'mountains': mountain, 'design': design, 'music': music, 'ocean': ocean, 'space': space, 'city': city, 'creative': creative, 'future': future, 'forest': forest}
for name, draw in SCENES.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">{DEFS}<g filter="url(#grain)">{draw()}</g></svg>'
    cover = ROOT / 'covers' / f'{name}.svg'
    cover.write_text(svg, encoding='utf-8')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(cover),
        '-vf', "zoompan=z='min(zoom+0.0005,1.1)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=192:s=1280x720:fps=24",
        '-frames:v', '192', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-threads', '2',
        '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', str(ROOT / 'media' / f'{name}.mp4')], check=True)
    print(f'Создано: {name}', flush=True)
