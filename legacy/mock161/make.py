import os, re
H = os.path.dirname(os.path.abspath(__file__))
OUT = "/mnt/user-data/outputs/Parsec settings and automations ideas mock-up.html"
head = open(os.path.join(H, 'frame_head.html'), encoding='utf-8').read().replace('<title>Parsec · Tooltips</title>', '<title>Parsec · Settings and automations</title>')
body = open(os.path.join(H, 'frame_body.html'), encoding='utf-8').read()
body = body.replace('<small>Tooltips · text and styling</small>', '<small>Settings · automations</small>')
body = body.replace('>Light</button>', '>Ivory</button>').replace('>Dark</button>', '>Graphite</button>')
body = re.sub(r'<section class="ip-now">.*?</section>', '<section class="ip-now"><h2>How it looks now</h2><div id="ip-nowx"></div></section>', body, flags=re.S)
scr = open(os.path.join(H, 'frame_script.js'), encoding='utf-8').read()
a = scr.index("var APP ="); b = scr.index("];", scr.index("var IDEAS")) + 2
scr = scr[:a] + open(os.path.join(H, 'ideas.js'), encoding='utf-8').read() + "\ndocument.getElementById('ip-nowx').innerHTML = NOW;\n" + scr[b:]
scr = scr.replace("' for the ' + TOPIC.toLowerCase() + ' — pick", "' for the automations and the Settings page — the Assistant and the time-stamp automation are gone. Pick")
css = open(os.path.join(H, 'v161.css'), encoding='utf-8').read()
html = head + css + body + '<script>' + scr + '</script>\n</body>\n</html>\n'
open(OUT, 'w', encoding='utf-8').write(html); open(os.path.join(H, 'out.html'), 'w', encoding='utf-8').write(html)
print('wrote', len(html) // 1024, 'KB')
