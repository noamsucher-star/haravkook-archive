// כרטיס ציטוט אחד. אותו קוד רץ גם בבנייה (Node) וגם בדפדפן (תוצאות חיפוש), כדי שהכרטיס ייראה זהה בכל מקום.
// q: ציטוט מקוצר {i,t,q,r,b,bi:[{x,a,ro}],tp,n,h}. o: {n,total,hide,open,base,topics:{id:name}}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
// *מילה* בביאור (כמו בוואטסאפ) = הדגשה
function rich(s) { return esc(s).replace(/\*([^*\n]{1,80})\*/g, '<b>$1</b>'); }
function biurHTML(q, open, label) {
  if (!q.bi.length) return '';
  // שם הכותב ותוארו, גם כשהביאור סגור
  var who = q.bi.filter(function (b) { return b.a; }).map(function (b) { return '<span class="wh"><b>' + esc(b.a) + '</b>' + (b.ro ? '<span>' + esc(b.ro) + '</span>' : '') + '</span>'; }).join('');
  return '<details class="biur"' + (open ? ' open' : '') + '><summary><span class="bbtn plaque">' + (label || 'ביאור') + ' <span class="pm" aria-hidden="true"></span></span>' + (who ? ' <span class="who">' + who + '</span>' : '') + '</summary>'
    + '<div class="biurbox plaque">' + q.bi.map(function (b) {
      return '<div><p class="biurtext">' + rich(b.x) + '</p>' + (b.a ? '<p class="by"><b>' + esc(b.a) + '</b>' + (b.ro ? ' <span>' + esc(b.ro) + '</span>' : '') + '</p>' : '') + '</div>';
    }).join('') + '</div></details>';
}
function cardHTML(q, o) {
  var base = o.base || '';
  var url = base + 'q/' + q.i + '.html';
  var tags = q.tp.filter(function (id) { return id !== o.hide; }).map(function (id) { return '<a href="' + base + 'topic/' + id + '.html">' + esc(o.topics[id]) + '</a>'; }).join('');
  var Tag = o.h1 ? 'h2' : 'h3';
  return '<article class="card plaque" id="q' + q.i + '" data-i="' + q.i + '" data-t="' + esc(q.t) + '" data-b="' + esc(q.b) + '" data-h="' + esc(q.h) + '" data-tp="' + q.tp.join(' ') + '" data-bi="' + (q.bi.length ? 1 : 0) + '"><div class="cardin plaque">'
    + (o.self ? '' : '<div class="cardtop"><' + Tag + ' class="title"><a href="' + url + '">' + esc(q.t) + '</a></' + Tag + '>' + (o.total ? '<p class="num">' + o.n + ' מתוך ' + o.total + '</p>' : '') + '</div>')
    + '<p class="quote">' + esc(q.q) + '</p>'
    + (q.r ? '<p class="ref">' + esc(q.r) + '</p>' : '')
    + (q.n ? '<p class="note">' + esc(q.n) + '</p>' : '')
    + biurHTML(q, o.open)
    + '<div class="cardbar"><div class="tags">' + tags + '</div><span class="spacer"></span>'
    + '<a href="' + url + '" data-wa="' + q.i + '" target="_blank" rel="noopener">שיתוף בוואטסאפ</a>'
        + '<button type="button" data-copy="' + q.i + '">העתקה</button></div></div></article>';
}
// "חצי דקה להיום" בדף הבית
function todayHTML(q, base) {
  return '<p class="kicker">חצי דקה להיום</p>'
    + '<div><p class="q"><a href="' + (base || '') + 'q/' + q.i + '.html">' + esc(q.q) + '</a></p><p class="ref">' + esc(q.r) + '</p></div>'
    + biurHTML(q, false, 'לביאור')
    + '<p class="todaybar"><a href="' + (base || '') + 'q/' + q.i + '.html" data-wa="' + q.i + '" target="_blank" rel="noopener">שיתוף בוואטסאפ</a><button type="button" data-copy="' + q.i + '">העתקה</button><button type="button" data-another>ציטוט נוסף</button></p>';
}

// הקוד של האתר בדפדפן. card.js מודבק לפני הקובץ הזה בבנייה.
(function () {
  var root = document.documentElement;
  var BASE = root.getAttribute('data-base') || '';
  var SITE = root.getAttribute('data-site') || '';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var TOPICS = {};
  try { TOPICS = JSON.parse($('#topicnames').textContent); } catch (e) {}

  // ---------- הגדלת מלל ----------
  var big = false;
  try { big = localStorage.getItem('big') === '1'; } catch (e) {}
  function setBig(v) { big = v; document.body.classList.toggle('big', v); var b = $('#bigger'); if (b) b.setAttribute('aria-pressed', String(v)); }
  setBig(big);

  function toast(msg) { var old = $('.toast'); if (old) old.remove(); var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200); }

  // ---------- האור: רק בפתיח, רק על מה שהעכבר קרוב אליו ----------
  var homeEl = $('.home');
  // ניסוי רקע לפתיח: index.html?bg=1/2/3 (0 = הרקע הנוכחי). מוחקים אחרי שנועם בוחר
  var hbv = new URLSearchParams(location.search).get('bg');
  if (homeEl && hbv !== null) {
    if (/^[1-9]$/.test(hbv)) homeEl.classList.add('hb' + hbv);
    var sw = document.createElement('nav'); sw.className = 'hbswitch'; sw.setAttribute('aria-label', 'בחירת רקע לניסיון');
    sw.innerHTML = [['0', 'היום'], ['1', '1'], ['2', '2'], ['3', '3']].map(function (o) { return '<a href="?bg=' + o[0] + '"' + (o[0] === hbv ? ' aria-current="true"' : '') + '>' + o[1] + '</a>'; }).join('');
    document.body.appendChild(sw);
  }
  if (homeEl) {
    var hadMouse = false, raf = 0, ptr = null;
    var paint = function (x, y) { $$('.home .lit').forEach(function (el) { var r = el.getBoundingClientRect(); el.style.setProperty('--lx', (x - r.left) + 'px'); el.style.setProperty('--ly', (y - r.top) + 'px'); }); };
    var rest = function () { $$('.home .lit').forEach(function (el) { el.style.removeProperty('--lx'); el.style.removeProperty('--ly'); }); };
    document.addEventListener('pointermove', function (e) {
      // רק מחשב עם עכבר אמיתי עובר לאור שעוקב אחרי העכבר; טלפון וטאבלט נשארים עם האור שזז בגלילה
      if (e.pointerType === 'touch' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      hadMouse = true;
      if (e.clientY > homeEl.getBoundingClientRect().bottom) { rest(); return; }
      ptr = e; if (!raf) raf = requestAnimationFrame(function () { raf = 0; paint(ptr.clientX, ptr.clientY); });
    });
    // בטלפון (בלי עכבר): האור עובר לאט על הכותרת, ובגלילה זז מעט; האור סביב הקשת מטייל על המסגרת לפי הגלילה
    var arch = $('.home .arch');
    var step = function (t) {
      var hb = homeEl.getBoundingClientRect();
      if (hb.bottom > 0) {
        var p = Math.min(1, Math.max(0, -hb.top / Math.max(1, hb.height * .7)));
        var h = $('.home h1');
        if (h) { var r = h.getBoundingClientRect(), k = (Math.sin(t / 2800) + 1) / 2; $$('.lit', h).forEach(function (el) { var b = el.getBoundingClientRect(); el.style.setProperty('--lx', (r.left + r.width * (.1 + .8 * k) + r.width * .12 * p - b.left) + 'px'); el.style.setProperty('--ly', (r.top + r.height * (.35 + .25 * p) - b.top) + 'px'); }); }
        if (arch) { var ab = arch.getBoundingClientRect(), ang = -Math.PI / 2 + p * Math.PI * 1.1 + Math.sin(t / 3200) * .18, R = ab.width * .52;
          arch.style.setProperty('--lx', (ab.width / 2 + Math.cos(ang) * R) + 'px'); arch.style.setProperty('--ly', (ab.width / 2 + Math.sin(ang) * R) + 'px'); }
      }
    };
    var drift = function (t) { if (hadMouse) return; step(t); requestAnimationFrame(drift); };
    if (!reduce) {
      requestAnimationFrame(drift);
      // גם בגלילה עצמה, כדי שהאור יגיב מיד לאצבע
      addEventListener('scroll', function () { if (!hadMouse) step(performance.now()); }, { passive: true });
    }
    // שתי שורות הכותרת באותו רוחב בדיוק
    var fitHeadline = function () {
      var lines = $$('.home h1 > span'); if (lines.length !== 2) return;
      lines.forEach(function (l) { l.style.fontSize = ''; });
      var w = lines.map(function (l) { return l.getBoundingClientRect().width; }), min = Math.min.apply(null, w);
      lines.forEach(function (l, i) { if (w[i] > min + 1) l.style.fontSize = (parseFloat(getComputedStyle(l).fontSize) * min / w[i]).toFixed(2) + 'px'; });
    };
    fitHeadline();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeadline);
    addEventListener('resize', fitHeadline);
  }

  // ---------- חצי דקה להיום: מתחלף כל יום ----------
  var pool = $('#pool'), todayBox = $('.today .in');
  if (pool && todayBox) {
    try {
      var P = JSON.parse(pool.textContent);
      var d = P[Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5) % P.length];
      if (d && String(d.i) !== todayBox.getAttribute('data-i')) { todayBox.innerHTML = todayHTML(d, BASE); todayBox.setAttribute('data-i', d.i); todayBox.setAttribute('data-t', d.t); }
    } catch (e) {}
  }

  // ---------- עמודי רשימה: סינון, מספור ו"עוד" ----------
  var list = $('#list');
  var STEP = 15, shown = STEP;
  function applyList(keepShown) {
    if (!list) return;
    var only = $('#onlybiur') && $('#onlybiur').checked;
    var sel = $('#filter'), key = sel && sel.getAttribute('data-key'), val = sel && sel.value;
    var cards = $$('.card', list), vis = [];
    cards.forEach(function (c) {
      var ok = (!only || c.getAttribute('data-bi') === '1') && (!val || (key === 'tp' ? (' ' + c.getAttribute('data-tp') + ' ').indexOf(' ' + val + ' ') > -1 : c.getAttribute('data-' + key) === val));
      if (ok) vis.push(c);
    });
    if (!keepShown) shown = STEP;
    cards.forEach(function (c) { c.hidden = true; });
    vis.forEach(function (c, i) { var n = $('.num', c); if (n) { n.textContent = (i + 1) + ' מתוך ' + vis.length; n.hidden = vis.length < 2; } if (i < shown) c.hidden = false; });
    var cnt = $('#count'); if (cnt) cnt.textContent = vis.length === 1 ? 'ציטוט אחד' : vis.length + ' ציטוטים';
    var more = $('#more'), left = vis.length - shown;
    if (more) { more.parentNode.hidden = left <= 0; more.textContent = Math.min(STEP, left) === 1 ? 'עוד ציטוט אחד' : 'עוד ' + Math.min(STEP, left) + ' ציטוטים'; }
    var empty = $('#empty'); if (empty) empty.hidden = vis.length > 0;
    return vis;
  }
  if (list && !list.hasAttribute('data-search')) {
    // קישור ישיר לציטוט בתוך הרשימה (#q123): לפתוח עד אליו
    var target = location.hash && /^#q\d+$/.test(location.hash) && $(location.hash);
    var vis = applyList();
    if (target) { var idx = vis.indexOf(target); if (idx >= shown) { shown = idx + 5; applyList(true); } var dt = $('details', target); if (dt) dt.open = true; target.scrollIntoView({ block: 'center' }); }
  }
  document.addEventListener('change', function (e) { if (e.target.id === 'onlybiur' || e.target.id === 'filter') applyList(); });

  // ---------- חיפוש (בלי ניקוד, בלי גרשיים) ----------
  var norm = function (s) { return String(s || '').replace(/[֑-ׇ]/g, '').replace(/["'״׳.,:;!?()\[\]{}\-–—]/g, ' ').replace(/\s+/g, ' ').trim(); };
  // סימון המילה שחיפשו: עובד גם כשבטקסט יש ניקוד. אם המילה רק בביאור, הביאור נפתח לבד
  function highlight(scope, words, query) {
    if (!words.length) return;
    var N = '[\u0591-\u05C7]*';
    // כתיב מלא וחסר: ו' וי' לא חובה (ירושלים = ירושלם)
    var pat = words.map(function (w) { var core = w.length >= 4 ? w.replace(/[וי]/g, '') : w; return (w.length >= 4 ? '(?:[וי]' + N + ')?' : '') + core.split('').map(function (ch) { return ch.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + N; }).join(w.length >= 4 ? '(?:[וי]' + N + ')?' : ''); }).join('|');
    var re = new RegExp('(' + pat + ')', 'g');
    $$('.card, .today .in', scope).forEach(function (card) {
      $$('.title a, .quote, .biurtext', card).forEach(function (el) {
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
        while ((n = walk.nextNode())) nodes.push(n);
        nodes.forEach(function (node) {
          re.lastIndex = 0; if (!re.test(node.nodeValue)) return;
          var span = document.createElement('span'); span.innerHTML = esc(node.nodeValue).replace(re, '<mark>$1</mark>');
          node.parentNode.replaceChild(span, node);
        });
      });
      if (!$('.quote mark, .title mark', card) && $('.biurtext mark', card)) { var d = $('details', card); if (d) d.open = true; }
      if (query) $$('.title a', card).forEach(function (a) { a.href = a.getAttribute('href').split('?')[0] + '?hl=' + encodeURIComponent(query); });
    });
  }
  var hl = new URLSearchParams(location.search).get('hl');
  if (hl && !(list && list.hasAttribute('data-search'))) highlight(document, norm(hl).split(' ').filter(Boolean));

  if (list && list.hasAttribute('data-search')) {
    var query = (new URLSearchParams(location.search).get('q') || '').trim();
    var input = $('#q'); if (input) input.value = query;
    var head = $('.pagehead h1'); if (head && query) head.textContent = query;
    if (query) document.title = query + ' | חיפוש | אוצר חצי דקה הרב קוק';
    var words = norm(query).split(' ').filter(Boolean);
    var status = $('#count');
    if (!words.length) { if (status) status.textContent = ''; $('#empty').hidden = false; $('#empty').textContent = 'מה מחפשים? כתבו מילה אחת או שתיים, למשל: שמחה, תשובה, ירושלים.'; }
    else {
      if (status) status.textContent = 'מחפשים...';
      fetch(BASE + 'assets/search.json').then(function (r) { return r.json(); }).then(function (all) {
        var found = all.filter(function (q) { var s = q._s || (q._s = norm([q.t, q.q, q.r, q.b, q.bi.map(function (b) { return b.x + ' ' + b.a; }).join(' ')].join(' '))); var s2 = q._s2 || (q._s2 = s.replace(/[וי]/g, '')); return words.every(function (w) { return s.indexOf(w) > -1 || (w.length >= 4 && s2.indexOf(w.replace(/[וי]/g, '')) > -1); }); });
        // כותרת שמתאימה = קודם
        found.sort(function (a, b) { return (words.every(function (w) { return norm(b.t).indexOf(w) > -1; }) ? 1 : 0) - (words.every(function (w) { return norm(a.t).indexOf(w) > -1; }) ? 1 : 0); });
        list.innerHTML = found.map(function (q, i) { return cardHTML(q, { n: i + 1, total: found.length, base: BASE, topics: TOPICS }); }).join('');
        highlight(list, words, query);
        var e = $('#empty'); e.textContent = 'לא נמצאו ציטוטים עם "' + query + '". כדאי לנסות מילה אחת קצרה, או לבחור נושא מהרשימה.';
        applyList();
        var live = $('#live'); if (live) live.textContent = found.length ? (found.length === 1 ? 'נמצא ציטוט אחד' : 'נמצאו ' + found.length + ' ציטוטים') : 'לא נמצאו ציטוטים';
      }).catch(function () { if (status) status.textContent = ''; $('#empty').hidden = false; $('#empty').textContent = 'החיפוש לא נטען. כדאי לרענן את העמוד.'; });
    }
  }

  // ---------- פרשת השבוע (לפי לוח ארץ ישראל) ----------
  // מחזיר את הפרשה (או שתיים מחוברות) של השבת הקרובה, או null בשבת של חג
  function weeklyParasha(now) {
    var NAMES = 'bereshit noach lech-lecha vayera chayei-sara toldot vayetze vayishlach vayeshev miketz vayigash vayechi shemot vaera bo beshalach yitro mishpatim teruma tetzave ki-tisa vayakhel pekudei vayikra tzav shemini tazria metzora acharei-mot kedoshim emor behar bechukotai bamidbar naso behaalotcha shlach korach chukat balak pinchas matot masei devarim vaetchanan ekev reeh shoftim ki-tetze ki-tavo nitzavim'.split(' ');
    var fmt = new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' });
    var heb = function (d) { var o = {}; fmt.formatToParts(d).forEach(function (p) { o[p.type] = p.value; }); return { m: o.month, d: +o.day }; };
    var day = function (d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12); };
    var key = function (d) { return d.getFullYear() * 1e4 + d.getMonth() * 100 + d.getDate(); };
    var target = day(now, (6 - now.getDay() + 7) % 7);
    var start = target, i, h;
    for (i = 0; i < 400; i++) { h = heb(start); if (/^Tishri/.test(h.m) && h.d === 1) break; start = day(start, -1); }
    if (i === 400) return null;
    // כל שבתות השנה, עם ציוני הדרך
    var sats = [], leap = false, pesach = 0, shavuot = 0, av9 = 0, end = 0, d = start, T;
    for (i = 0; i < 400; i++, d = day(d, 1)) {
      h = heb(d); T = /^Tishri/.test(h.m);
      if (i > 0 && T && h.d === 1) { end = i; break; }
      if (h.m === 'Adar I') leap = true;
      if (h.m === 'Nisan' && h.d === 15) pesach = i;
      if (h.m === 'Sivan' && h.d === 6) shavuot = i;
      if (h.m === 'Av' && h.d === 9) av9 = i;
      if (d.getDay() === 6) sats.push({ i: i, k: key(d), tishri: T ? h.d : 0, hol: (T && (h.d <= 2 || h.d === 10 || (h.d >= 15 && h.d <= 22))) || (h.m === 'Nisan' && h.d >= 15 && h.d <= 21) || (h.m === 'Sivan' && h.d === 6) });
    }
    if (!end || !pesach || !shavuot || !av9) return null;
    // תשרי: וילך והאזינו, או רק האזינו
    var open = sats.filter(function (s) { return s.tishri && s.tishri < 22 && !s.hol; });
    var out = {}; if (open.length === 2) { out[open[0].k] = ['vayelech']; out[open[1].k] = ['haazinu']; } else if (open.length === 1) out[open[0].k] = ['haazinu'];
    var S = sats.filter(function (s) { return !s.hol && !(s.tishri && s.tishri <= 22); });
    var a = S.filter(function (s) { return s.i < pesach; }).length, b = S.filter(function (s) { return s.i > pesach && s.i < shavuot; }).length;
    var vaet = S.filter(function (s) { return s.i > av9; })[0]; if (!vaet) return null;
    var c = S.filter(function (s) { return s.i > shavuot && s.i <= vaet.i; }).length;
    var dbl = {};
    if (leap) { if (45 - (a + b + c) >= 1) dbl.matot = 1; }
    else { if (25 - a >= 1) dbl.vayakhel = 1; var nb = 9 - b; ['tazria', 'acharei-mot', 'behar'].forEach(function (n) { if (nb-- > 0) dbl[n] = 1; }); if (11 - c >= 1) dbl.matot = 1; }
    // אם בשנה הבאה אין שבת בין יום כיפור לסוכות, ניצבים ווילך מחוברות
    var nextRH = day(start, end), two = false; for (i = 10; i <= 13; i++) if (day(nextRH, i).getDay() === 6) two = true;
    var seq = [], n; for (n = 0; n < NAMES.length; n++) { if (dbl[NAMES[n]]) { seq.push([NAMES[n], NAMES[n + 1]]); n++; } else seq.push([NAMES[n]]); }
    if (!two) seq[seq.length - 1].push('vayelech');
    if (seq.length !== S.length) return null; // החישוב לא מתיישב: עדיף לא להציג כלום
    S.forEach(function (s, j) { out[s.k] = seq[j]; });
    return out[key(target)] || null;
  }
  window.__weeklyParasha = weeklyParasha;
  var pmapEl = $('#pmap');
  if (pmapEl) {
    try {
      var PM = JSON.parse(pmapEl.textContent), wk = weeklyParasha(new Date()) || [], hit = null;
      wk.forEach(function (s) { if (!hit && PM[s]) hit = PM[s]; });
      if (hit) {
        var row = $('.bookrow[data-p="' + hit[0] + '"]'), label = hit[1];
        if (row) { row.classList.add('now'); row.setAttribute('aria-current', 'true'); }
        var wEl = $('#weekly');
        if (wEl) { wEl.innerHTML = 'השבוע: <a href="' + BASE + 'parasha/' + hit[0] + '.html">פרשת ' + esc(label) + ' <span aria-hidden="true">←</span></a>'; wEl.hidden = false; }
      }
    } catch (e) {}
  }

  // ---------- שיתוף ----------
  function getQ(id) {
    var el = $('[data-i="' + id + '"]'); if (!el) return null;
    var t = el.getAttribute('data-t') || ($('.title', el) ? $('.title', el).textContent : '');
    // הביאור עצמו, עם ההדגשות שלו (*מילה*) ושם הכותב ותוארו
    var wa = function (node) { return [].map.call(node.childNodes, function (c) { return c.nodeType === 3 ? c.nodeValue : c.tagName === 'B' ? '*' + c.textContent + '*' : wa(c); }).join(''); };
    var bi = $$('.biurbox > div', el).map(function (d) {
      var x = $('.biurtext', d), by = $('.by b', d), ro = $('.by span', d);
      return { x: x ? wa(x).trim() : '', a: by ? by.textContent.trim() : '', ro: ro ? ro.textContent.trim() : '' };
    }).filter(function (b) { return b.x; });
    return { i: id, t: t.trim(), q: ($('.quote, .q', el) || {}).textContent || '', r: ($('.ref', el) || {}).textContent || '', bi: bi, url: SITE + 'q/' + id + '.html' };
  }
  var CHANNEL = root.getAttribute('data-channel') || '';
  // ההודעה בוואטסאפ: כותרת, ציטוט, מראה מקום, הביאור המלא, והצטרפות לערוץ בבולד
  function shareText(q) {
    return (q.t ? '*' + q.t + '*\n' : '') + '"' + q.q.trim() + '"\n' + (q.r ? '{' + q.r.trim() + '}\n' : '')
      + (q.bi || []).map(function (b) { return '\n*ביאור:*\n' + b.x + (b.a ? '\n_' + b.a + (b.ro ? ', ' + b.ro : '') + '_' : '') + '\n'; }).join('')
      + (CHANNEL ? '\n*להצטרפות מהירה לערוץ הוואטסאפ* 👇👇\n*' + CHANNEL + '*' : '');
  }

  // התמונה הממותגת (גם תמונת התצוגה של הקישור נבנית מהציור הזה)
  var imgCache = {};
  function loadImg(src) { return imgCache[src] || (imgCache[src] = new Promise(function (ok, no) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = no; im.src = src; })); }
  function wrap(ctx, text, maxW) {
    var out = [];
    String(text).split('\n').forEach(function (para) {
      var line = '';
      para.split(/\s+/).filter(Boolean).forEach(function (w) { var test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test; });
      if (line) out.push(line);
    });
    return out;
  }
  function plaquePath(ctx, x, y, w, h, s) {
    ctx.beginPath();
    ctx.moveTo(x + s, y); ctx.lineTo(x + w - s, y); ctx.arc(x + w, y, s, Math.PI, Math.PI / 2, true);
    ctx.lineTo(x + w, y + h - s); ctx.arc(x + w, y + h, s, -Math.PI / 2, Math.PI, true);
    ctx.lineTo(x + s, y + h); ctx.arc(x, y + h, s, 0, -Math.PI / 2, true);
    ctx.lineTo(x, y + s); ctx.arc(x, y, s, Math.PI / 2, 0, true); ctx.closePath();
  }
  function gold(ctx, x0, y0, x1, y1) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#fff3d0'); g.addColorStop(.35, '#f0d08e'); g.addColorStop(.7, '#d4a356'); g.addColorStop(1, '#b8873c'); return g; }
  function dark(ctx, x0, y0, x1, y1) { var g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#170f06'); g.addColorStop(.52, '#2a1a0a'); g.addColorStop(1, '#4b3015'); return g; }
  // מתאים גודל מלל לתיבה: מחזיר שורות וגודל
  function fit(ctx, text, maxW, maxH, from, to, weight, lh) {
    for (var s = from; s >= to; s -= 2) { ctx.font = weight + ' ' + s + 'px Platforma'; var L = wrap(ctx, text, maxW); if (L.length * s * lh <= maxH) return { lines: L, size: s }; }
    ctx.font = weight + ' ' + to + 'px Platforma'; var L2 = wrap(ctx, text, maxW), max = Math.max(1, Math.floor(maxH / (to * lh)));
    if (L2.length > max) { L2 = L2.slice(0, max); L2[max - 1] = L2[max - 1].replace(/\s*\S+$/, '') + '...'; }
    return { lines: L2, size: to };
  }
  function drawShare(q, kind) {
    var W = kind === 'og' ? 1200 : 1080, H = kind === 'og' ? 630 : 1350;
    var c = document.createElement('canvas'); c.width = W; c.height = H; var ctx = c.getContext('2d');
    return Promise.all([loadImg(BASE + 'assets/logo.png'), kind === 'og' ? loadImg(BASE + 'assets/rav.jpg') : null, document.fonts ? Promise.all([document.fonts.load('700 40px Platforma'), document.fonts.load('400 40px Platforma'), document.fonts.load('300 40px Platforma')]) : null]).then(function (r) {
      var logo = r[0], rav = r[1];
      ctx.direction = 'rtl'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#faf6ee'; ctx.fillRect(0, 0, W, H);
      var i, y;
      if (kind === 'og') {
        // שמאל: לוח כהה עם הרב בקשת. ימין: הציטוט על בהיר
        var PW = 400; ctx.fillStyle = dark(ctx, 0, 0, PW, H); ctx.fillRect(0, 0, PW, H);
        var ax = 70, aw = PW - 140, ay = 64, ah = 400;
        ctx.save(); ctx.beginPath(); ctx.moveTo(ax, ay + aw / 2); ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw, ay + ah); ctx.lineTo(ax, ay + ah); ctx.closePath(); ctx.clip();
        var sw = aw * 1.26, sh = sw * rav.height / rav.width; ctx.drawImage(rav, ax - aw * .25, ay - sh * .024, sw, sh); ctx.restore();
        ctx.strokeStyle = 'rgba(233,207,148,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay + ah); ctx.lineTo(ax, ay + aw / 2); ctx.arc(ax + aw / 2, ay + aw / 2, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw, ay + ah); ctx.stroke();
        ctx.textAlign = 'center'; ctx.font = '700 46px Platforma'; ctx.fillStyle = gold(ctx, 60, 500, 340, 560);
        ctx.fillText('אור גדול+', PW / 2, 528); ctx.fillText('בחצי דקה', PW / 2, 578);
        var lw = 230, lh = lw * logo.height / logo.width; ctx.drawImage(logo, W - 60 - lw, 40, lw, lh);
        var X = W - 60, maxW = W - PW - 120;
        ctx.textAlign = 'right';
        var top0 = 40 + lh + 20, avail = H - 40 - top0;
        var tH0 = q.t ? 58 : 0, rH0 = q.r ? 50 : 0;
        var f = fit(ctx, '"' + q.q.trim() + '"', maxW, avail - tH0 - rH0, 50, 26, '400', 1.36);
        y = top0 + Math.max(0, (avail - (tH0 + f.lines.length * f.size * 1.36 + rH0)) / 2);
        if (q.t) { ctx.font = '700 40px Platforma'; ctx.fillStyle = '#8a5a2b'; ctx.fillText(q.t, X, y + 40, maxW); y += tH0; }
        ctx.fillStyle = '#33240f'; ctx.font = '400 ' + f.size + 'px Platforma';
        for (i = 0; i < f.lines.length; i++) { y += f.size * 1.36; ctx.fillText(f.lines[i], X, y - f.size * .25); }
        ctx.font = '300 28px Platforma'; ctx.fillStyle = '#58462d'; if (q.r) ctx.fillText(q.r.trim(), X, y + 42, maxW);
      } else {
        var lw2 = 330, lh2 = lw2 * logo.height / logo.width; ctx.drawImage(logo, (W - lw2) / 2, 64, lw2, lh2);
        var bandH = 190, cx = 70, cy = 64 + lh2 + 44, cw = W - 140, ch = H - bandH - 50 - cy;
        ctx.fillStyle = '#d9c79f'; plaquePath(ctx, cx, cy, cw, ch, 22); ctx.fill();
        ctx.fillStyle = '#ffffff'; plaquePath(ctx, cx + 2, cy + 2, cw - 4, ch - 4, 21); ctx.fill();
        ctx.textAlign = 'center';
        var inner = cw - 140, top = cy + 70, room = ch - 70 - 60;
        var tH = 0; if (q.t) { ctx.font = '700 46px Platforma'; tH = 46 + 34; }
        var rH = q.r ? 34 + 30 : 0;
        var f2 = fit(ctx, q.q, inner, room - tH - rH, 70, 32, '400', 1.42);
        var blockH = tH + f2.lines.length * f2.size * 1.42 + rH;
        y = top + Math.max(0, (room - blockH) / 2);
        if (q.t) { ctx.font = '700 46px Platforma'; ctx.fillStyle = '#8a5a2b'; ctx.fillText(q.t, W / 2, y + 40, inner); y += tH; }
        ctx.font = '400 ' + f2.size + 'px Platforma'; ctx.fillStyle = '#33240f';
        for (i = 0; i < f2.lines.length; i++) { y += f2.size * 1.42; ctx.fillText(f2.lines[i], W / 2, y - f2.size * .3); }
        if (q.r) { ctx.font = '300 34px Platforma'; ctx.fillStyle = '#58462d'; ctx.fillText(q.r.trim(), W / 2, y + 44, inner); }
        ctx.fillStyle = dark(ctx, 0, H - bandH, W, H); ctx.fillRect(0, H - bandH, W, bandH);
        ctx.font = '700 64px Platforma'; ctx.fillStyle = gold(ctx, W / 2 - 300, H - 140, W / 2 + 300, H - 60); ctx.fillText('אור גדול+ בחצי דקה', W / 2, H - bandH + 88);
        ctx.font = '300 32px Platforma'; ctx.fillStyle = '#e2d3b3'; ctx.fillText('ציטוט יומי מכתבי הראי"ה, עם ביאור, בוואטסאפ', W / 2, H - bandH + 145);
      }
      return c;
    });
  }
  window.__drawShare = drawShare; // לבניית תמונות התצוגה

  // ---------- לחיצות ----------
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.skip')) { var m = $('#main'); if (m) { e.preventDefault(); m.setAttribute('tabindex', '-1'); m.focus(); m.scrollIntoView(); } return; }
    if (t.closest('#bigger')) { setBig(!big); try { localStorage.setItem('big', big ? '1' : '0'); } catch (err) {} return; }
    if (t.id === 'more') { shown += STEP; var before = $$('.card:not([hidden])', list).length; applyList(true); var next = $$('.card:not([hidden])', list)[before]; if (next) { var a = $('.title a', next) || next; a.focus({ preventScroll: true }); } return; }
    var wa = t.closest('[data-wa]');
    // הקישור עצמו הופך לקישור וואטסאפ ברגע הלחיצה (עובד בכל דפדפן, גם בלי חלונות קופצים)
    if (wa) { var q = getQ(wa.getAttribute('data-wa')); if (q) wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText(q)); return; }
    var cp = t.closest('[data-copy]');
    if (cp) { var q2 = getQ(cp.getAttribute('data-copy')); if (!q2) return; (navigator.clipboard ? navigator.clipboard.writeText(shareText(q2)) : Promise.reject()).then(function () { toast('הועתק'); }, function () { toast('לא הצלחנו להעתיק. אפשר לסמן את הטקסט ולהעתיק ידנית'); }); return; }
    if (t.closest('[data-another]') && pool && todayBox) { try { var PP = JSON.parse(pool.textContent), cur = todayBox.getAttribute('data-i'), nx; do { nx = PP[Math.floor(Math.random() * PP.length)]; } while (String(nx.i) === cur && PP.length > 1); todayBox.innerHTML = todayHTML(nx, BASE).replace('חצי דקה להיום', 'ועוד חצי דקה'); todayBox.setAttribute('data-i', nx.i); todayBox.setAttribute('data-t', nx.t); var b2 = $('[data-another]', todayBox); if (b2) b2.focus(); var lv = $('.today .q'); if (lv) lv.setAttribute('aria-live', 'polite'); } catch (err) {} return; }
    var cl = t.closest('[data-copylink]');
    if (cl) { (navigator.clipboard ? navigator.clipboard.writeText(cl.getAttribute('data-copylink')) : Promise.reject()).then(function () { toast('הקישור הועתק'); }, function () {}); }
  });
})();
