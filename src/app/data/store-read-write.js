/* Parsec · data · store-read-write.js
   Reading and writing layout 16: pd16Read walks Parsec Data/ into a state; pd16Write writes only what changed (ROs by folder, the shop by topic, big topics by month), compressing Closed years.
   ── facts (generated; run tools/headers.py to refresh) ──
   declares   pd16Probe pd16Read pd16Commit pd16Meta pdMovePath pd16RmEmpty pd16Group pd16WriteRos pd16WriteShop pd16Write pd16ReadSettled pd16Changed (12 functions)
   uses       kit/ state/
*/
/* ---------- reading layout 16 ---------- */
function pd16Probe(){
  if(!FS.dir) return Promise.resolve("none");
  var has = function(d, n, dir){ return (dir ? d.getDirectoryHandle(n) : d.getFileHandle(n)).then(function(){ return true; }, function(){ return false; }); };
  return pdRoot(false).then(function(pd){
    return readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){
      if(m && +m.layout >= 16) return "16";
      return Promise.all([has(pd, PD_LAYOUT_FILE + ".pending"), pd.getDirectoryHandle(PD_ROS).then(function(r){ return Promise.all([has(r, PD_OPEN, 1), has(r, PD_CLOSED, 1)]); }, function(){ return null; }), has(pd, PD_SHOP, 1)])
        .then(function(x){
          PD16.partial = x[0];
          if(!x[0] && x[1] && (x[1][0] || x[1][1])) return "16";         /* layout 16 whose layout.json went missing */
          return x[1] || x[2] ? "15" : "none";
        });
    });
  }, function(){ return "none"; }).then(function(k){
    if(k !== "none") return k;
    return Promise.all([has(FS.dir, RO_DATA_ROOT, 1), has(FS.dir, SHOP_FILE), has(FS.dir, DATA_FILE)]).then(function(x){ return x[0] || x[1] || x[2] ? "old" : "none"; });
  });
}
function pd16Read(opts){
  opts = opts || {};
  var st = {}, W = {}, dirs = {}, bad = {}, meta = null, ros = [], punches = [], orphans = [];
  var parse = function(path, text){ try{ var o = JSON.parse(text); W[path] = text; return o; }catch(e){ bad[path] = 1; return null; } };
  return pdRoot(false).then(function(pd){
    return (opts.meta ? Promise.resolve(opts.meta) : readJsonFile(pd, opts.pending ? PD_LAYOUT_FILE + ".pending" : PD_LAYOUT_FILE)).then(function(m){ meta = m || {}; })
      .then(function(){ return pd.getDirectoryHandle(PD_SHOP).then(function(shop){
        return dirEntries(shop, "file").then(function(fs){
          return Promise.all(fs.filter(function(f){ return /\.json$/.test(f.name); }).sort(function(a, b){ return a.name < b.name ? -1 : 1; }).map(function(f){
            return pd16ReadText(shop, f.name).then(function(t){ return [f.name, t]; }, function(){ bad["Shop/" + f.name] = 1; return null; }); }));
        }).then(function(L){
          L.forEach(function(x){ if(!x) return; var o = parse("Shop/" + x[0], x[1]); if(!pdPlain(o)) return;
            Object.keys(o).forEach(function(k){ if(k === "orphanPunches" && x[0] === "time.json"){ if(Array.isArray(o[k])) orphans = o[k]; } else st[k] = o[k]; }); });
          /* the busy ones, by period */
          var dirsOf = { clock: 1, activity: 1, timesheets: 1 };
          (meta.has || []).forEach(function(k){ if(PD_SPLIT[k]) st[k] = PD_SPLIT[k] === "timesheets" ? {} : []; });
          return Object.keys(dirsOf).reduce(function(p, dn){ return p.then(function(){
            return shop.getDirectoryHandle(dn).then(function(d){ return dirEntries(d, "file"); }, function(){ return []; }).then(function(fs){
              fs = fs.filter(function(f){ return /\.json$/.test(f.name); }).sort(function(a, b){ return a.name < b.name ? -1 : 1; });
              return shop.getDirectoryHandle(dn).then(function(d){
                return Promise.all(fs.map(function(f){ return pd16ReadText(d, f.name).then(function(t){ return [f.name, t]; }, function(){ bad["Shop/" + dn + "/" + f.name] = 1; return null; }); }));
              }, function(){ return []; }).then(function(L2){
                L2.forEach(function(x){ if(!x) return; var o = parse("Shop/" + dn + "/" + x[0], x[1]); if(!pdPlain(o)) return;
                  Object.keys(o).forEach(function(k){
                    if(Array.isArray(o[k])) st[k] = (Array.isArray(st[k]) ? st[k] : []).concat(o[k]);
                    else if(pdPlain(o[k])) st[k] = Object.assign(pdPlain(st[k]) ? st[k] : {}, o[k]);
                  }); });
              });
            });
          }); }, Promise.resolve());
        });
      }, function(){}); })
      .then(function(){ return pd.getDirectoryHandle(PD_ROS).then(function(root){
        var one = function(parentPath, d){
          var path = parentPath + "/" + d.name, closed = parentPath !== PD_OPEN, names = closed ? ["ro.json.gz", "ro.json"] : ["ro.json", "ro.json.gz"];
          var tryN = function(i){ if(i >= names.length) return Promise.resolve(null);
            return pd16ReadText(d, names[i]).then(function(t){ return [names[i], t]; }, function(e){ return e && e.name === "NotFoundError" ? tryN(i + 1) : (bad["ROs/" + path + "/" + names[i]] = 1, tryN(i + 1)); }); };
          return tryN(0).then(function(x){ if(!x) return null; var o = parse("ROs/" + path + "/" + x[0], x[1]); return o && o.ro && o.ro.id ? { path: path, o: o } : null; });
        };
        var inDir = function(parentPath, h){ return dirEntries(h, "directory").then(function(ds){ return Promise.all(ds.map(function(d){ return one(parentPath, d); })); }); };
        return root.getDirectoryHandle(PD_OPEN).then(function(h){ return inDir(PD_OPEN, h); }, function(){ return []; }).then(function(a){
          return root.getDirectoryHandle(PD_CLOSED).then(function(c){ return dirEntries(c, "directory").then(function(ys){
            return Promise.all(ys.map(function(y){ return inDir(PD_CLOSED + "/" + y.name, y); })).then(function(L){ return a.concat.apply(a, L); }); }); }, function(){ return a; });
        }).then(function(all){
          all.filter(Boolean).sort(function(x, y){ return x.path < y.path ? -1 : 1; }).forEach(function(x){
            if(dirs[x.o.ro.id]) return;                                   /* a stray copy of a folder */
            dirs[x.o.ro.id] = x.path; ros.push(x.o.ro);
            if(Array.isArray(x.o.punches)) punches = punches.concat(x.o.punches);
          });
        });
      }, function(){}); });
  }).then(function(){
    var ord = {}; (meta.roOrder || []).forEach(function(id, i){ ord[id] = i; });
    ros.sort(function(a, b){ var x = a.id in ord ? ord[a.id] : 1e9, y = b.id in ord ? ord[b.id] : 1e9; return x - y; });
    punches = orphans.concat(punches).sort(function(a, b){ var x = String(a && a.start || ""), y = String(b && b.start || ""); return x < y ? -1 : x > y ? 1 : 0; });
    if(meta.v !== undefined) st.v = meta.v; st.savedAt = meta.savedAt || 0;
    if(pdPlain(meta.keyAt)) st.pdKeyAt = meta.keyAt;
    if(meta.shop) st.pdShop = meta.shop;
    st.ros = ros; st.punches = punches;
    return { state: st, meta: meta, W: W, dirs: dirs, bad: bad };
  });
}
/* the folder as read is now what this computer knows is on disk */
function pd16Commit(F){
  PD16.W = F.W; PD16.bad = F.bad || {};
  Object.keys(ROFOLDER).forEach(function(k){ delete ROFOLDER[k]; }); Object.assign(ROFOLDER, F.dirs);
  if(F.meta && F.meta.writeId) PD16.seen = F.meta.writeId;
  if(F.meta && F.meta.moved) PD16.moved = F.meta.moved;
  var nb = Object.keys(PD16.bad);
  if(nb.length){ PD16.warn = nb; console.warn("Parsec couldn't read", nb); }
}

/* ---------- writing layout 16: only what changed ---------- */
function pd16Meta(S, has){
  return { layout: 16, about: "Parsec's data. ROs/Open and ROs/Closed/<year>: one folder per repair order. Shop: everything else, by topic. Parsec writes these files — don't edit them by hand.",
    app: typeof BUILD !== "undefined" ? String(BUILD).split(" · ")[0] : "Parsec 16", v: S.v, savedAt: S.savedAt || 0, savedAtText: new Date(S.savedAt || Date.now()).toISOString(),
    writeId: uid("w"), by: pdWho(), computer: pdPc(), shop: S.pdShop || null, keyAt: pdPlain(S.pdKeyAt) ? S.pdKeyAt : undefined, has: has || [],
    roOrder: (S.ros || []).map(function(r){ return r.id; }), moved: PD16.moved || undefined };
}
/* an RO's folder moves (Open ↔ Closed/<year>, or a new name) with its attachments */
function pdMovePath(root, from, to, ro){
  var data = function(nm){ return nm === "ro.json" || nm === "ro.json.gz" || PD_PAGE_RE.test(nm); };
  return pdDirPath(root, from, false).then(function(src){
    return pdDirPath(root, to, true).then(function(dst){ return copyTree(src, dst, true, data); })
      .then(function(){ return dirEntries(src, "file"); })
      .then(function(fs){ return fs.filter(function(f){ return data(f.name); }).reduce(function(p, f){ return p.then(function(){ return pd16Rm(src, f.name); }); }, Promise.resolve()); })
      .then(function(){ return pd16RmEmpty(root, from); });
  }, function(){})
    .then(function(){
      (ro.bulletins || []).forEach(function(e){ (e.files || []).forEach(function(f){ if(f.folder === from) f.folder = to; }); });
      Object.keys(PD16.W).forEach(function(p){ if(p.indexOf("ROs/" + from + "/") === 0) delete PD16.W[p]; });
    });
}
/* a folder with nothing left in it goes (and an empty Closed/<year> above it) */
function pd16RmEmpty(root, path){
  var parts = path.split("/"), leaf = parts.pop();
  return pdDirPath(root, parts.join("/"), false).then(function(par){
    return par.getDirectoryHandle(leaf).then(function(d){ return dirEntries(d); }).then(function(es){ if(!es.length) return pd16Rm(par, leaf); }, function(){})
      .then(function(){ if(parts.length === 2 && parts[0] === PD_CLOSED) return pd16RmEmpty(root, parts.join("/")); });
  }, function(){});
}
function pd16Group(S){
  var byRo = {}, orphans = [];
  S.ros.forEach(function(ro){ byRo[ro.id] = []; });
  (S.punches || []).forEach(function(p){ if(p && byRo[p.roId]) byRo[p.roId].push(p); else orphans.push(p); });
  return { byRo: byRo, orphans: orphans };
}
function pd16WriteRos(S, names, byRo){
  var live = {};
  return roDataRoot(true).then(function(root){
    return S.ros.reduce(function(pr, ro){
      return pr.then(function(){
        var want = names[ro.id], had = ROFOLDER[ro.id];
        live[want] = 1;
        return (had && had !== want ? pdMovePath(root, had, want, ro) : Promise.resolve()).then(function(){
          var closed = want.indexOf(PD_CLOSED + "/") === 0, fname = closed ? "ro.json.gz" : "ro.json", other = closed ? "ro.json" : "ro.json.gz";
          var text = JSON.stringify({ v: 16, ro: ro, punches: byRo[ro.id] }), key = "ROs/" + want + "/" + fname;
          ROFOLDER[ro.id] = want;
          if(PD16.W[key] === text) return;
          return pdDirPath(root, want, true).then(function(d){
            var page = roPageName(ro);
            return pd16PutData(d, fname, text)
              .then(function(){ return pd16Put(d, page, pd16Page(ro, byRo[ro.id], S.savedAt, closed)); })
              .then(function(){ return dirEntries(d, "file"); })
              .then(function(fs){ return fs.filter(function(f){ return f.name === other || (PD_PAGE_RE.test(f.name) && f.name !== page); })
                .reduce(function(p2, f){ return p2.then(function(){ return pd16Rm(d, f.name); }); }, Promise.resolve()); })
              .then(function(){ PD16.W[key] = text; delete PD16.W["ROs/" + want + "/" + other]; });
          });
        });
      });
    }, Promise.resolve()).then(function(){
      /* an RO that is gone loses its record and its page; its attachments stay where they are */
      var gone = {};
      Object.keys(PD16.W).forEach(function(p){ var m = /^ROs\/(.+)\/ro\.json(\.gz)?$/.exec(p); if(m && !live[m[1]] && !PD16.bad[p]) gone[m[1]] = 1; });
      return Object.keys(gone).reduce(function(pr, path){ return pr.then(function(){
        return pdDirPath(root, path, false).then(function(d){
          return dirEntries(d, "file").then(function(fs){ return fs.filter(function(f){ return f.name === "ro.json" || f.name === "ro.json.gz" || PD_PAGE_RE.test(f.name); })
            .reduce(function(p2, f){ return p2.then(function(){ return pd16Rm(d, f.name); }); }, Promise.resolve()); })
            .then(function(){ return d.getDirectoryHandle(PD_ATT).then(function(a){ return dirEntries(a); }).then(function(x){ if(!x.length) return pd16Rm(d, PD_ATT); }, function(){}); });
        }, function(){}).then(function(){ delete PD16.W["ROs/" + path + "/ro.json"]; delete PD16.W["ROs/" + path + "/ro.json.gz"]; return pd16RmEmpty(root, path); });
      }); }, Promise.resolve());
    });
  });
}
function pd16WriteShop(files){
  return pdSub(PD_SHOP, true).then(function(shop){
    var paths = Object.keys(files);
    return paths.reduce(function(pr, p){ return pr.then(function(){
      if(PD16.W[p] === files[p]) return;
      var rel = p.slice(5), parts = rel.split("/"), leaf = parts.pop();
      return pdDirPath(shop, parts.join("/"), true).then(function(d){
        /* a file Parsec couldn't read is kept beside the new one, never just overwritten */
        var keep = PD16.bad[p] ? d.getFileHandle(leaf).then(function(fh){ return fh.getFile(); }).then(function(f){ return pd16Put(d, leaf + ".unreadable-" + Date.now() + ".txt", f); }).then(function(){ delete PD16.bad[p]; }, function(){}) : Promise.resolve();
        return keep.then(function(){ return pd16PutData(d, leaf, files[p]); }).then(function(){ PD16.W[p] = files[p]; });
      });
    }); }, Promise.resolve()).then(function(){
      /* a month or year with nothing left in it */
      return Object.keys(PD16.W).filter(function(p){ return p.indexOf("Shop/") === 0 && !(p in files); }).reduce(function(pr, p){ return pr.then(function(){
        var rel = p.slice(5), parts = rel.split("/"), leaf = parts.pop();
        return pdDirPath(shop, parts.join("/"), false).then(function(d){ return pd16Rm(d, leaf); }, function(){}).then(function(){ delete PD16.W[p]; });
      }); }, Promise.resolve());
    });
  });
}
/* the whole state → the folder (layout.json last: until it is written, the save hasn't happened) */
/* the whole state → the folder. layout.json goes first (saving: true — a save is under way, here is its write id), then the
   ROs and Shop, then layout.json again with a new write id (saving: false — done). Another computer that looks in the middle
   waits for the second one. Moving to 16 writes layout.json.pending once, at the end. */
function pd16Write(S, opts){
  S = S || STATE; opts = opts || {};
  var names = pd16Names(S), g = pd16Group(S), sf = pd16ShopFiles(S, g.orphans), seen = PD16.seen, raced = false, pd;
  var meta = pd16Meta(S, sf.has), first = Object.assign({}, meta, { saving: true });
  var put = function(m){ return pd16Put(pd, opts.pending ? PD_LAYOUT_FILE + ".pending" : PD_LAYOUT_FILE, JSON.stringify(m, null, 1)); };
  return pdRoot(true).then(function(d){ pd = d;
    if(opts.pending) return;
    return (opts.race ? readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){ if(m && m.writeId && seen && m.writeId !== seen) raced = true; }) : Promise.resolve())
      .then(function(){ if(raced && opts.race){ var e = new Error("another computer saved first"); e.raced = true; throw e; } return put(first); })   /* 17.1: nothing is written over its save — the caller takes it in first */
      .then(function(){ PD16.seen = first.writeId; });
  })
    .then(function(){ return pd16WriteRos(S, names, g.byRo); })
    .then(function(){ return pd16WriteShop(sf.files); })
    .then(function(){ return opts.pending ? null : readJsonFile(pd, PD_LAYOUT_FILE).then(function(m){ if(m && m.writeId && m.writeId !== first.writeId) raced = true; }); })
    .then(function(){ return put(meta); })
    .then(function(){ if(!opts.pending) PD16.seen = meta.writeId; if(raced) Object.defineProperty(meta, "raced", { value: true }); return meta; });
}
/* read, but not in the middle of another computer's save */
function pd16ReadSettled(n){
  return pd16Read().then(function(F){
    if(F.meta && F.meta.saving && (n || 0) < 5) return new Promise(function(r){ setTimeout(r, 600); }).then(function(){ return pd16ReadSettled((n || 0) + 1); });
    return F;
  });
}
/* has another computer saved since this one last read or wrote? */
function pd16Changed(){
  if(!FS.dir) return Promise.resolve(false);
  return pdRoot(false).then(function(d){ return readJsonFile(d, PD_LAYOUT_FILE); }).then(function(m){ return !!(m && m.writeId && m.writeId !== PD16.seen); }, function(){ return false; });
}
