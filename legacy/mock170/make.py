import os, re, json
H = os.path.dirname(os.path.abspath(__file__))
OUT = "/mnt/user-data/outputs/Parsec RO global settings ideas mock-up.html"
head = open(os.path.join(H, 'frame_head.html'), encoding='utf-8').read().replace('<title>Parsec · Tooltips</title>', '<title>Parsec · RO global settings</title>')
body = open(os.path.join(H, 'frame_body.html'), encoding='utf-8').read()
body = body.replace('<small>Tooltips · text and styling</small>', '<small>RO global settings</small>')
body = body.replace('>Light</button>', '>Ivory</button>').replace('>Dark</button>', '>Graphite</button>')
body = re.sub(r'<section class="ip-now">.*?</section>', '<section class="ip-now"><h2>How it looks now</h2><div id="ip-nowx"></div></section>', body, flags=re.S)
scr = open(os.path.join(H, 'frame_script.js'), encoding='utf-8').read()
a = scr.index("var APP ="); b = scr.index("];", scr.index("var IDEAS")) + 2
ideas = open(os.path.join(H, 'ideas.js'), encoding='utf-8').read()
I = json.load(open(os.path.join(H, 'imgs.json')))
rick = [v for k, v in I.items() if k.startswith('Rick')][0]
for ph, src in (('__TB__', rick[0]), ('__TBT__', rick[1]), ('__TG__', I['Red Mesa Hauling'][0]), ('__TX__', I['Red Mesa Hauling'][1]), ('__TM__', I['Midway Auto Transport'][0])):
    ideas = ideas.replace(ph, src)
scr = scr[:a] + ideas + "\ndocument.getElementById('ip-nowx').innerHTML = NOW;\n" + scr[b:]
css = open(os.path.join(H, 'v170.css'), encoding='utf-8').read()
html = head + css + body + '<script>' + scr + '</script>\n</body>\n</html>\n'
open(os.path.join(H, 'out.html'), 'w', encoding='utf-8').write(html)
if os.environ.get('SHIP'): open(OUT, 'w', encoding='utf-8').write(html)
print('wrote', len(html) // 1024, 'KB')
