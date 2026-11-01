# Parsec · Time Log and time fixes — the ideas mock-up (one HTML, Ivory / Graphite, cards with options, Your picks)
import json, os, html
H = os.path.dirname(os.path.abspath(__file__))
OUT = "/mnt/user-data/outputs/Parsec Time Log fixes ideas mock-up.html"
e = html.escape

# ---------- tiny visual building blocks (HTML strings) ----------
def st(tone, words, sub="", menu=False):
    ic = {"hold": '<circle cx="7" cy="7" r="5.25"/>', "run": '<circle cx="7" cy="7" r="5.25"/><path d="M7 3.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>',
          "wait": '<circle cx="7" cy="7" r="5.25" stroke-dasharray="2.3 1.82"/><circle cx="7" cy="7" r="1.75" fill="currentColor"/>',
          "done": '<circle cx="7" cy="7" r="5.25"/><path d="M4.6 7.1l1.6 1.6 3.2-3.4"/>', "bad": '<circle cx="7" cy="7" r="5.25"/><path d="M7 4.2v3.4"/><circle cx="7" cy="9.75" r=".95" fill="currentColor"/>'}
    tone2 = {"hold": "hold", "run": "run", "wait": "wait", "done": "run", "bad": "bad", "cust": "cust"}[tone]
    k = "wait" if tone == "cust" else tone
    return ('<%s class="pst t-%s%s">' % ("button" if menu else "span", tone2, " m" if menu else "")) + '<svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + ic[k] + "</svg>" + e(words) + (('<em>' + e(sub) + "</em>") if sub else "") + ("<i>▾</i>" if menu else "") + ("</button>" if menu else "</span>")

TRUCK = '<svg class="trk" viewBox="0 0 64 30" aria-hidden="true"><path d="M2 22h8V9h12l6 7h8v6h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="11" y="10" width="9" height="6" rx="1" fill="currentColor" opacity=".18"/><path d="M40 22h22V12H40z" fill="currentColor" opacity=".14"/><circle cx="12" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/><circle cx="52" cy="23" r="3.2" fill="var(--panel)" stroke="currentColor" stroke-width="1.6"/></svg>'
def row(no, cust, right="", sub=""):
    return '<div class="r">' + TRUCK + '<span class="no">' + e(no) + '</span><span class="c"><b>' + e(cust) + '</b>' + (('<small>' + sub + '</small>') if sub else "") + '</span><span class="rt">' + right + '</span></div>'
def btn(t, pri=False, sm=True): return '<span class="b%s%s">' % (" pri" if pri else "", " sm" if sm else "") + t + '</span>'
def kbd(t): return '<kbd>' + e(t) + '</kbd>'
def chk(t, on=True, muted=False): return '<div class="ck%s%s"><i></i>%s</div>' % (" on" if on else "", " mu" if muted else "", t)
def bar(p, tone="acc"): return '<span class="bar"><i class="t-%s" style="width:%d%%"></i></span>' % (tone, p)
def tag(t, tone="hold"): return '<span class="tg t-%s">%s</span>' % (tone, e(t))

# ---------- the ideas: (page, [ (key, title, why, visual, [(optkey, label, note)], ) ]) ----------
exec(open(os.path.join(H, 'ideas.py'), encoding='utf-8').read())

CSS = open(os.path.join(H, "mock.css"), encoding="utf-8").read() + open(os.path.join(H, "extra.css"), encoding="utf-8").read()

def card_html(page, k, title, why, vis, opts):
    o = "".join('<button class="opt" data-k="%s" data-v="%s" aria-pressed="false"><i></i><span><b>%s</b>%s</span></button>' % (k, ok, e(lab), ('<small>' + e(note) + '</small>') if note else "") for ok, lab, note in opts)
    return '<article class="idea" id="i-%s"><header><h3>%s</h3><p>%s</p></header><div class="vis">%s</div><div class="ol">%s</div></article>' % (k, e(title), e(why), vis, o)

secs = []
for page, items in IDEAS:
    secs.append('<section class="sec"><h2>%s <small>%d idea%s</small></h2><div class="grid">%s</div></section>' % (e(page), len(items), "" if len(items) == 1 else "s", "".join(card_html(page, *it) for it in items)))
new = "".join('<div><b>%s</b><span>%s</span></div>' % (e(a), e(b)) for a, b in NEW14)
DATA = json.dumps([[p, [[it[0], it[1], [[o[0], o[1]] for o in it[4]]] for it in items]] for p, items in IDEAS])

HTML = '''<!doctype html>
<html lang="en" data-th="ivory">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Parsec · Time Log fixes</title>
<style>''' + CSS + '''</style></head>
<body>
<div class="mk"><h1><svg class="lg" viewBox="-110 -110 220 220" aria-hidden="true"><circle class="c" r="14"/><circle cx="44" r="9.5"/><circle cx="-44" r="9.5"/><circle cx="22" cy="38" r="9.5"/><circle cx="-22" cy="38" r="9.5"/><circle cx="22" cy="-38" r="9.5"/><circle cx="-22" cy="-38" r="9.5"/><circle cy="-84" r="7" class="o"/><circle cy="84" r="7" class="o"/><circle cx="73" cy="42" r="7" class="o"/><circle cx="-73" cy="42" r="7" class="o"/><circle cx="73" cy="-42" r="7" class="o"/><circle cx="-73" cy="-42" r="7" class="o"/></svg>Parsec <small>Time Log · clock in / out fixes</small></h1>
<nav class="jump">''' + "".join('<a href="#s-%d">%s</a>' % (i, e(p)) for i, (p, _) in enumerate(IDEAS)) + '''</nav>
<div class="seg" role="group" aria-label="Theme"><button data-th="ivory" aria-pressed="true">Ivory</button><button data-th="graphite" aria-pressed="false">Graphite</button></div>
<button class="btn sm pri" id="pk-open">Your picks <em id="pk-n"></em></button></div>
<main class="wrap">
<section class="new14"><h2>Already in the Time Log — staying as it is</h2><div class="strip">''' + new + '''</div></section>
<p class="lead">''' + str(sum(len(x[1]) for x in IDEAS)) + ''' ideas for fixing clock in / out and punch problems — the layout and look stay. Pick an option on each, or Skip, then copy Your picks into the chat.</p>
''' + "".join(s.replace('<section class="sec">', '<section class="sec" id="s-%d">' % i, 1) for i, s in enumerate(secs)) + '''
</main>
<div id="picks" hidden></div>
<script>
var D=document,$=function(s,r){return (r||D).querySelector(s)},$$=function(s,r){return [].slice.call((r||D).querySelectorAll(s))};
var DATA=''' + DATA + ''';
var V={th:'ivory',picks:false,v:{},note:''};
try{ var sv=JSON.parse(localStorage.getItem('pk145')||'{}'); if(sv.v) V.v=sv.v; if(sv.note) V.note=sv.note; if(sv.th) V.th=sv.th; }catch(e){}
function save(){ try{ localStorage.setItem('pk145',JSON.stringify({v:V.v,note:V.note,th:V.th})); }catch(e){} }
function esc(t){ return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}); }
function pkText(){ var L=['Parsec · Time Log and time fixes — my picks'], n=0;
  DATA.forEach(function(sec){ var rows=[]; sec[1].forEach(function(it){ var v=V.v[it[0]]; if(!v) return; var lab=(it[2].filter(function(o){return o[0]===v})[0]||[])[1]||v; if(v==='skipit'){ rows.push('· '+it[1]+': skip'); return; } n++; rows.push('· '+it[1]+': '+lab); });
    if(rows.length){ L.push(sec[0]+':'); L=L.concat(rows); } });
  var left=DATA.reduce(function(a,s){return a+s[1].filter(function(it){return !V.v[it[0]]}).length},0);
  if(left) L.push('(not picked yet: '+left+')');
  if(V.note.trim()) L.push('Notes: '+V.note.trim());
  return L.join('\\n'); }
function sync(){ $$('.mk button[data-th]').forEach(function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-th')===V.th)); }); D.documentElement.setAttribute('data-th',V.th);
  $$('.opt').forEach(function(b){ b.setAttribute('aria-pressed',String(V.v[b.getAttribute('data-k')]===b.getAttribute('data-v'))); });
  $$('.idea').forEach(function(a){ a.classList.toggle('picked',!!V.v[a.id.slice(2)]); });
  var n=Object.keys(V.v).length, t=DATA.reduce(function(a,s){return a+s[1].length},0); $('#pk-n').textContent=n?n+'/'+t:''; }
function pkDraw(){ var w=$('#picks'); w.hidden=!V.picks; if(!V.picks) return; var ta=$('#pk-note'); if(ta&&D.activeElement===ta){ $('#picks pre').textContent=pkText(); return; }
  w.innerHTML='<div class="pk-h"><b>Your picks</b><button class="x" data-pk="x" aria-label="Close">✕</button></div><pre>'+esc(pkText())+'</pre><div class="pk-r"><span>Anything else</span><textarea id="pk-note" placeholder="e.g. our shift ends at 16:30 on Fridays">'+esc(V.note)+'</textarea></div><button class="btn pri" data-pk="copy">Copy for the chat</button>'; }
function toast(m){ var t=$('.toast'); if(t) t.remove(); t=D.createElement('div'); t.className='toast'; t.textContent=m; D.body.appendChild(t); clearTimeout(toast.h); toast.h=setTimeout(function(){t.remove()},2600); }
D.addEventListener('click',function(ev){ var t=ev.target,b;
  if((b=t.closest('.mk button[data-th]'))){ V.th=b.getAttribute('data-th'); save(); sync(); return; }
  if(t.closest('#pk-open')){ V.picks=!V.picks; pkDraw(); return; }
  if((b=t.closest('[data-pk]'))){ var a=b.getAttribute('data-pk'); if(a==='x'){ V.picks=false; pkDraw(); }
    if(a==='copy'){ var tx=pkText(); (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(function(){toast('Copied — paste it in the chat.')},function(){ var ta=D.createElement('textarea'); ta.value=tx; D.body.appendChild(ta); ta.select(); try{ D.execCommand('copy'); toast('Copied — paste it in the chat.'); }catch(er){} ta.remove(); }); } return; }
  if((b=t.closest('.opt'))){ var k=b.getAttribute('data-k'), v=b.getAttribute('data-v'); if(V.v[k]===v) delete V.v[k]; else V.v[k]=v; save(); sync(); if(V.picks) pkDraw(); return; }
});
D.addEventListener('input',function(ev){ if(ev.target.id==='pk-note'){ V.note=ev.target.value; save(); var p=$('#picks pre'); if(p) p.textContent=pkText(); } });
D.addEventListener('keydown',function(ev){ if(ev.key==='Escape'&&V.picks){ V.picks=false; pkDraw(); } });
sync();
</script>
</body></html>'''
open(OUT, "w", encoding="utf-8").write(HTML)
open(os.path.join(H, "out.html"), "w", encoding="utf-8").write(HTML)
print("wrote", OUT, len(HTML) // 1024, "KB")
