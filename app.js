/* =========================================================================
   Lectio — moteur de la roadmap
   - Construit un plan jour par jour à partir de l'ordre pédagogique (data.js)
   - Dose les chapitres selon l'objectif (chapitres_totaux / jours)
   - Livres "skim" comptés à poids réduit (survol guidé)
   - Un psaume par jour en fil rouge (150 répartis sur la durée)
   - Persistance locale, rattrapage multi-jours, lectures AELF du jour
   ========================================================================= */

const STORE = 'lectio.v1';
const TOTAL_CH = LIVRES.reduce((s, l) => s + l.ch, 0); // 1178

const PACES = [
  { d: 365, label: '1 an' },
  { d: 182, label: '6 mois' },
  { d: 91,  label: '3 mois' },
  { d: 60,  label: '2 mois' },
];

/* --------- état --------- */
let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE));
    if (s && s.done) {
      // migration : l'ancien système calait le jour sur la date de début
      if (typeof s.day !== 'number')
        s.day = s.start ? Math.max(0, daysBetween(s.start, todayISO())) : 0;
      return s;
    }
  } catch (e) {}
  return { days: 365, custom: null, day: 0, done: {} };
}
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }

function todayISO(dt) {
  const d = dt ? new Date(dt) : new Date();
  return d.toISOString().slice(0, 10);
}
function daysBetween(aISO, bISO) {
  const a = new Date(aISO + 'T00:00'), b = new Date(bISO + 'T00:00');
  return Math.round((b - a) / 86400000);
}
function targetDays() { return state.custom || state.days; }
function clampDay() {
  state.day = Math.max(0, Math.min(state.day || 0, targetDays() - 1));
}

/* =========================================================================
   PLAN — on transforme la liste de livres en une file de "segments" de
   lecture (livre + plage de chapitres), puis on découpe en jours.
   ========================================================================= */
function buildPlan() {
  const days = targetDays();
  // poids : un chapitre "skim" compte 0.4 pour alléger les livres redondants
  const SKIM = 0.4;
  const weightOf = (l) => l.skim ? l.ch * SKIM : l.ch;
  const totalWeight = LIVRES.reduce((s, l) => s + weightOf(l), 0);
  const perDay = totalWeight / days; // charge cible par jour (en poids)

  // File de chapitres unitaires, dans l'ordre pédagogique, avec leur poids.
  const chapters = [];
  for (const l of LIVRES)
    for (let c = 1; c <= l.ch; c++)
      chapters.push({ book: l, ch: c, w: l.skim ? SKIM : 1 });

  // Découpe en `days` jours en suivant le poids cumulé : le chapitre k va
  // au jour floor(poidsCumulé / perDay). Garantit exactement ~days jours.
  const buckets = Array.from({ length: days }, () => []);
  let cum = 0;
  for (const c of chapters) {
    let day = Math.floor((cum + c.w / 2) / perDay);
    if (day >= days) day = days - 1;
    buckets[day].push(c);
    cum += c.w;
  }

  // Fusionne les chapitres consécutifs d'un même livre en segments (ch. x–y)
  const plan = buckets.map(chs => {
    const segs = [];
    for (const c of chs) {
      const last = segs[segs.length - 1];
      if (last && last.book.id === c.book.id && c.ch === last.to + 1) last.to = c.ch;
      else segs.push({ book: c.book, from: c.ch, to: c.ch });
    }
    return segs;
  });

  // Retire d'éventuels jours vides en fin de liste
  while (plan.length && plan[plan.length - 1].length === 0) plan.pop();
  return plan;
}

let PLAN = buildPlan();

/* =========================================================================
   RENDU
   ========================================================================= */
const $ = (s) => document.querySelector(s);

function currentDayIndex() {
  clampDay();
  return state.day; // 0 = premier jour
}

/* Déplace le curseur "jour actuel" du parcours. `targetIdx` est l'index
   0-based du jour où l'on veut se trouver. Les jours précédents sont
   considérés lus (marque les livres entièrement couverts comme faits) —
   utile pour reprendre directement au milieu du parcours ou sauter
   plusieurs jours d'un coup, sans dépendre du calendrier réel. */
function goToDayIndex(targetIdx) {
  const days = targetDays();
  const idx = Math.max(0, Math.min(targetIdx, days - 1));
  if (idx > 0) completeUpToDay(idx - 1);
  state.day = idx;
  save();
}

function readBooksSet() { return new Set(Object.keys(state.done).filter(k => state.done[k])); }

function render() {
  PLAN = buildPlan();
  clampDay();
  renderPaces();
  renderStats();
  renderToday();
  renderPsalmThread();
  renderPhases();
  save();
}

/* ----- objectif ----- */
function renderPaces() {
  const row = $('#paceRow');
  row.innerHTML = '';
  const activeDays = targetDays();
  PACES.forEach(p => {
    const b = document.createElement('button');
    b.className = 'pace' + (!state.custom && state.days === p.d ? ' sel' : '');
    b.innerHTML = `<span class="big">${p.label.split(' ')[0]}</span>
      <span class="lbl">${p.label} · ${Math.round(TOTAL_CH / p.d * 10) / 10} ch./jour</span>`;
    b.onclick = () => { state.days = p.d; state.custom = null; $('#customDays').value = ''; render(); };
    row.appendChild(b);
  });
  $('#customDays').value = state.custom || '';
  $('#dayInput').max = activeDays;
  $('#dayInput').value = currentDayIndex() + 1;
}

/* Chapitres effectivement parcourus : compte les livres entiers cochés,
   plus la progression partielle (via le plan) des livres pas encore finis —
   pour que le % avance chapitre par chapitre et pas seulement livre par
   livre. */
function chaptersProgressed(done) {
  const reached = {};
  const last = lastCompletedDay();
  for (let d = 0; d <= last; d++) {
    for (const seg of planForDay(d)) {
      reached[seg.book.id] = Math.max(reached[seg.book.id] || 0, seg.to);
    }
  }
  let total = 0;
  for (const l of LIVRES)
    total += done.has(l.id) ? l.ch : Math.min(reached[l.id] || 0, l.ch);
  return total;
}

/* ----- stats ----- */
function renderStats() {
  const done = readBooksSet();
  // Psaumes comptés comme "livre achevé" seulement si tous parcourus — ici on
  // considère les 72 livres cochables + Psaumes via le fil rouge.
  const booksDone = done.size;
  const chDone = chaptersProgressed(done);
  const pct = Math.round(chDone / TOTAL_CH * 100);
  const dayIdx = currentDayIndex();

  $('#stDay').textContent = Math.min(dayIdx + 1, targetDays());
  $('#stBooks').innerHTML = booksDone + '<span style="font-size:20px;color:var(--parchemin-doux)">/73</span>';
  $('#stPct').textContent = pct + '%';
  $('#stPace').textContent = (Math.round(TOTAL_CH / targetDays() * 10) / 10);
  $('#progBar').style.width = pct + '%';
}

/* ----- aujourd'hui ----- */
function planForDay(i) { return PLAN[Math.min(i, PLAN.length - 1)] || []; }
function psalmForDay(i) {
  // 150 psaumes étalés sur la durée cible
  const step = PSAUMES_TOTAL / targetDays();
  return Math.min(PSAUMES_TOTAL, Math.floor(i * step) + 1);
}

function renderToday() {
  const i = currentDayIndex();
  const body = $('#todayBody');
  const dateFmt = new Intl.DateTimeFormat('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  $('#todayDate').textContent = dateFmt.charAt(0).toUpperCase() + dateFmt.slice(1);

  const segs = planForDay(i);
  const psalm = psalmForDay(i);

  let html = '';

  // bloc psaume du jour
  html += `<div class="today-block">
    <span class="pill psalm">Méditation du jour</span>
    <div class="assign">Psaume <span class="rng">${psalm}</span> <span style="color:var(--parchemin-doux);font-size:18px">· le fil rouge</span></div>
    <div class="aelf" id="aelfBox">Lectures du jour dans l'Église : <span class="ref">chargement…</span></div>
  </div>`;

  // bloc lecture du jour
  html += `<div class="today-block"><span class="pill read">Lecture suivie</span>`;
  if (segs.length === 0) {
    html += `<div class="assign">Parcours achevé — rendez grâce&nbsp;!</div>`;
  } else {
    segs.forEach(seg => {
      const rng = seg.book.ch === 1 ? '' :
        (seg.from === 1 && seg.to === seg.book.ch ? ' (en entier)' :
         ` <span class="rng">ch. ${seg.from}${seg.to > seg.from ? '–' + seg.to : ''}</span>`);
      html += `<div class="assign">${seg.book.nom}${rng}</div>`;
      if (seg.book.note) html += `<div class="assign-note">${seg.book.note}</div>`;
    });
  }
  html += `</div>`;

  // actions
  const days = targetDays();
  const isLast = i >= days - 1;
  html += `<div class="today-actions">
    <button class="btn btn-primary" id="markToday"${isLast ? ' disabled' : ''}>J'ai lu aujourd'hui ✓</button>
    <span class="skip-days">
      <input id="skipInput" type="number" min="1" max="${Math.max(1, days - i - 1)}" placeholder="jours">
      <button class="btn btn-ghost" id="skipBtn">Passer plusieurs jours d'un coup</button>
    </span>
  </div>`;

  body.innerHTML = html;

  $('#markToday').onclick = () => {
    goToDayIndex(i + 1);
    toast('Journée validée. Bonne route !');
    render();
  };
  $('#skipBtn').onclick = () => {
    const n = parseInt($('#skipInput').value, 10);
    if (!n || n < 1) { toast('Indiquez un nombre de jours à passer.'); return; }
    goToDayIndex(i + n);
    toast(`${n} jour${n > 1 ? 's' : ''} passé${n > 1 ? 's' : ''} d'un coup.`);
    render();
  };

  fetchAELF();
}

/* Marque comme lus tous les livres entièrement couverts jusqu'au jour `i`
   inclus (utilisé par la validation du jour et par les sauts de jour). */
function lastCompletedDay() { return state.lastDay ?? -1; }
function completeUpToDay(i) {
  state.lastDay = Math.max(lastCompletedDay(), i);
  // marque comme lu tout livre dont le dernier chapitre a été atteint au jour i
  const reached = {};
  for (let d = 0; d <= i; d++) {
    for (const seg of planForDay(d)) {
      reached[seg.book.id] = Math.max(reached[seg.book.id] || 0, seg.to);
    }
  }
  for (const l of LIVRES) if (reached[l.id] >= l.ch) state.done[l.id] = true;
  save();
}

/* ----- fil rouge psaumes ----- */
function renderPsalmThread() {
  const i = currentDayIndex();
  const p = psalmForDay(i);
  $('#psalmBar').style.width = Math.round(p / PSAUMES_TOTAL * 100) + '%';
  $('#psalmCount').textContent = `Psaume ${p} sur ${PSAUMES_TOTAL}`;
}

/* ----- vue d'ensemble ----- */
function renderPhases() {
  const done = readBooksSet();
  const box = $('#phases');
  box.innerHTML = '';
  PHASES.forEach((ph, idx) => {
    const books = LIVRES.filter(l => l.phase === ph.id);
    const nDone = books.filter(l => done.has(l.id)).length;
    const el = document.createElement('div');
    el.className = 'phase' + (idx === 0 ? ' open' : '');
    el.style.setProperty('--teinte', ph.teinte);
    el.innerHTML = `
      <div class="phase-head">
        <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>
        <div>
          <p class="pname">${ph.nom}</p>
          <p class="pdesc">${ph.desc}</p>
        </div>
        <div class="pcount">${nDone}/${books.length} livres</div>
      </div>
      <div class="phase-body"></div>`;
    const bodyEl = el.querySelector('.phase-body');
    books.forEach(l => bodyEl.appendChild(bookRow(l, done.has(l.id))));
    el.querySelector('.phase-head').onclick = () => el.classList.toggle('open');
    box.appendChild(el);
  });
}

function bookRow(l, isDone) {
  const row = document.createElement('div');
  row.className = 'book' + (isDone ? ' done' : '') + (l.note ? ' showdetail' : '');
  const lvlTag = `<span class="tag lv${l.level}">${['','accessible','intermédiaire','exigeant'][l.level]}</span>`;
  const skimTag = l.skim ? `<span class="tag skim">survol guidé</span>` : '';
  row.innerHTML = `
    <div class="check" role="checkbox" aria-checked="${isDone}" tabindex="0" aria-label="Marquer ${l.nom}">
      <svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg>
    </div>
    <div class="bmeta">
      <div class="bname">${l.nom}</div>
      <div class="bsub">${l.ch} chapitre${l.ch > 1 ? 's' : ''}</div>
      ${l.note ? `<div class="bnote">${l.note}</div>` : ''}
    </div>
    <div class="tags">${lvlTag}${skimTag}</div>`;
  const toggle = () => { state.done[l.id] = !state.done[l.id]; save(); render(); };
  const chk = row.querySelector('.check');
  chk.onclick = toggle;
  chk.onkeydown = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } };
  return row;
}

/* =========================================================================
   AELF — lectures du jour dans l'Église (repli si hors-ligne / bloqué)
   ========================================================================= */
async function fetchAELF() {
  const box = $('#aelfBox');
  if (!box) return;
  const d = todayISO();
  try {
    const r = await fetch(`https://api.aelf.org/v1/messes/${d}/france`, { mode: 'cors' });
    if (!r.ok) throw 0;
    const j = await r.json();
    const lectures = (j.messes && j.messes[0] && j.messes[0].lectures) || [];
    const ps = lectures.find(x => (x.type || '').toLowerCase().includes('psaume'));
    const ev = lectures.find(x => (x.type || '').toLowerCase().includes('évangile'));
    let out = [];
    if (ps && ps.ref) out.push(`psaume ${ps.ref}`);
    if (ev && ev.ref) out.push(`Évangile ${ev.ref}`);
    box.innerHTML = out.length
      ? `Aujourd'hui dans la liturgie : <span class="ref">${out.join(' · ')}</span>`
      : `Lectures du jour disponibles sur <a href="https://www.aelf.org" target="_blank" rel="noopener">aelf.org</a>.`;
  } catch (e) {
    box.innerHTML = `Lectures du jour dans l'Église : <a href="https://www.aelf.org" target="_blank" rel="noopener">aelf.org</a> <span style="color:var(--parchemin-doux)">(hors-ligne ici, actif dans votre navigateur)</span>`;
  }
}

/* =========================================================================
   Divers
   ========================================================================= */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

$('#customDays').addEventListener('input', (e) => {
  const v = parseInt(e.target.value, 10);
  state.custom = (v && v >= 30) ? v : null;
  renderStats(); renderToday(); renderPsalmThread(); save();
});
$('#customDays').addEventListener('change', render);
$('#dayGoBtn').addEventListener('click', () => {
  const n = parseInt($('#dayInput').value, 10);
  if (!n || n < 1) { toast('Indiquez un numéro de jour valide.'); return; }
  goToDayIndex(n - 1);
  toast(`Vous êtes maintenant au jour ${n}.`);
  render();
});
$('#resetBtn').addEventListener('click', () => {
  if (confirm('Réinitialiser toute la progression et les réglages ?')) {
    localStorage.removeItem(STORE); state = load(); render(); toast('Parcours réinitialisé.');
  }
});

/* ----- Export / Import de la progression (fichier .json) ----- */
$('#exportBtn').addEventListener('click', () => {
  const payload = { app: 'lectio', version: 1, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lectio-progression-${todayISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Progression exportée.');
});

$('#importBtn').addEventListener('click', () => $('#importFile').click());
$('#importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const imported = (data && data.state) ? data.state : data; // accepte les deux formats
      if (!imported || typeof imported.done !== 'object')
        throw new Error('structure inattendue');
      // reconstruit un état propre en repartant des valeurs par défaut
      const fresh = { days: 365, custom: null, day: 0, done: {} };
      state = Object.assign(fresh, imported);
      state.done = Object.assign({}, imported.done);
      // migration : anciens exports calaient le jour sur une date de début
      if (typeof imported.day !== 'number' && imported.start)
        state.day = Math.max(0, daysBetween(imported.start, todayISO()));
      save(); render();
      toast('Progression importée.');
    } catch (err) {
      toast('Fichier illisible — import annulé.');
    }
    e.target.value = ''; // permet de réimporter le même fichier ensuite
  };
  reader.readAsText(file);
});

render();
