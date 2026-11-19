// Leonida Trophy Guide & Tracker — checklist, filters, spoiler mode, roadmap,
// export/import, all running offline on app/data/trophies.json. No network use.
const STORE_KEY = 'gta6-trophy-checklist-v2';

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty-state');
const resultEl = document.getElementById('result-count');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const gradeCountsEl = document.getElementById('grade-counts');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade-select');
const spoilerToggle = document.getElementById('spoiler-toggle');
const hideEarnedToggle = document.getElementById('hide-earned');
const roadmapList = document.getElementById('roadmap-list');
const sourceListEl = document.getElementById('source-list');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourcesById = new Map(doc.sources.map((s) => [s.id, s]));

const state = {
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: true,
  hideEarned: false,
  open: new Set(),
};
let earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));

function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', general: 'Free roam & combat' }[kind] ?? kind;
}

function isStory(t) {
  return t.kinds.includes('story');
}

function isHiddenBySpoiler(t) {
  return state.spoiler && isStory(t) && !earned.has(t.id);
}

function trophyMatches(t) {
  if (state.kind === 'missable' && !t.missable) return false;
  if (state.kind === 'online') return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && !t.kinds.includes(state.kind)) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.hideEarned && earned.has(t.id)) return false;
  if (state.query) {
    const q = state.query.toLowerCase();
    const hay = isHiddenBySpoiler(t)
      ? `${t.grade} ${t.kinds.map(kindLabel).join(' ')}`
      : `${t.name} ${t.description} ${t.guide} ${t.mission ?? ''} ${t.kinds.map(kindLabel).join(' ')}`.toLowerCase();
    if (!hay.toLowerCase().includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const ofGrade = trophies.filter((t) => t.grade === g);
    const got = ofGrade.filter((t) => earned.has(t.id)).length;
    return `${gradeLabel(g)} ${got}/${ofGrade.length}`;
  });
  gradeCountsEl.textContent = parts.join(' · ');
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceList(t) {
  const ul = el('ul', 'sources');
  for (const sid of t.sources) {
    const s = sourcesById.get(sid);
    if (!s) continue;
    const li = document.createElement('li');
    li.append('Source: ');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  return ul;
}

function buildDetail(t) {
  const box = el('div', 'detail');
  if (t.missable && t.missable_note) {
    const warn = el('p', 'warn');
    warn.append(el('strong', null, 'Missable: '), document.createTextNode(t.missable_note));
    box.append(warn);
  }
  if (t.unconfirmed) {
    const note = el('p', 'warn');
    note.append(el('strong', null, 'Not yet confirmed: '), document.createTextNode('early reports list this trophy as having no confirmed unlock method yet. The guide below is the best reading of its official description.'));
    box.append(note);
  }
  box.append(el('h4', null, 'Guide'));
  box.append(el('p', null, t.guide));
  const facts = [];
  if (t.chapter !== undefined) facts.push(`Chapter: ${t.chapter}`);
  if (t.mission) facts.push(`Mission: ${t.mission}`);
  if (t.count !== undefined) facts.push(`Count to reach: ${t.count.toLocaleString('en-US')}`);
  if (t.stage !== undefined) facts.push(`Roadmap stage: ${t.stage}`);
  if (facts.length) {
    box.append(el('h4', null, 'Facts from the official list'));
    box.append(el('p', null, facts.join(' · ')));
  }
  box.append(el('h4', null, 'Sources'));
  box.append(sourceList(t));
  return box;
}

function trophyCard(t) {
  const card = el('article', 'trophy');
  card.id = `trophy-${t.id}`;
  if (earned.has(t.id)) card.classList.add('earned');
  const top = el('div', 'trophy-top');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderAll();
  });
  top.append(box);

  const main = el('div', 'trophy-main');
  const hidden = isHiddenBySpoiler(t);
  const name = el('h3', 'trophy-name', hidden ? 'Hidden story trophy' : t.name);
  if (earned.has(t.id)) name.append(el('span', 'earned-mark', '✓ Earned'));
  main.append(name);
  main.append(el('p', 'trophy-desc', hidden ? 'Hidden until earned — turn the spoiler setting off to reveal it, or earn it in the game.' : t.description));

  const tags = el('div', 'tags');
  tags.append(el('span', `tag tag-${t.grade}`, gradeLabel(t.grade)));
  for (const k of t.kinds) {
    if (k === 'missable') continue; // the red MISSABLE badge below covers it
    tags.append(el('span', 'tag', kindLabel(k)));
  }
  if (t.missable) tags.append(el('span', 'tag tag-missable', 'Missable'));
  if (t.unconfirmed) tags.append(el('span', 'tag tag-unconfirmed', 'Method unconfirmed'));
  if (t.count !== undefined) tags.append(el('span', 'tag tag-count', `× ${t.count.toLocaleString('en-US')}`));
  main.append(tags);

  if (hidden) {
    main.append(el('p', 'spoiler-hidden', 'Its guide stays hidden too — no spoilers here until you earn it.'));
  } else {
    const toggle = el('button', 'guide-toggle', state.open.has(t.id) ? 'Hide guide ▲' : 'Read the guide ▼');
    toggle.type = 'button';
    toggle.addEventListener('click', () => {
      if (state.open.has(t.id)) {
        state.open.delete(t.id);
        toggle.textContent = 'Read the guide ▼';
        const old = main.querySelector('.detail');
        if (old) old.remove();
      } else {
        state.open.add(t.id);
        toggle.textContent = 'Hide guide ▲';
        main.append(buildDetail(t));
      }
    });
    main.append(toggle);
    if (state.open.has(t.id)) main.append(buildDetail(t));
  }
  top.append(main);
  card.append(top);
  return card;
}

function renderRoadmap() {
  roadmapList.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    li.append(el('span', 'stage-num', String(stage.stage)));
    const body = document.createElement('div');
    body.append(el('h3', null, stage.title));
    body.append(el('p', null, stage.text));
    const chips = el('div', 'stage-trophies');
    for (const id of stage.trophies) {
      const t = trophies.find((x) => x.id === id);
      if (!t) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = isHiddenBySpoiler(t) ? 'Hidden story trophy' : t.name;
      b.addEventListener('click', () => {
        document.getElementById(`trophy-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      chips.append(b);
    }
    body.append(chips);
    li.append(body);
    roadmapList.append(li);
  }
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  for (const t of shown) listEl.append(trophyCard(t));
  resultEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  if (state.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies in this list — all 55 trophies are single-player, and every one is earned offline. The official list has no online trophy, so this filter is empty by design.';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophy matches these filters. Try clearing the search or choosing another kind.';
  } else {
    emptyEl.hidden = true;
  }
}

function renderSources() {
  sourceListEl.replaceChildren();
  const intro = document.createTextNode('The sources this guide cites: ');
  sourceListEl.append(intro);
  doc.sources.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    sourceListEl.append(a);
    if (i < doc.sources.length - 1) sourceListEl.append(document.createTextNode(' · '));
  });
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

document.getElementById('kind-chips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-kind]');
  if (!btn) return;
  state.kind = btn.dataset.kind;
  for (const c of document.querySelectorAll('#kind-chips .chip')) c.classList.toggle('active', c === btn);
  renderList();
});
gradeSelect.addEventListener('change', () => { state.grade = gradeSelect.value; renderList(); });
searchInput.addEventListener('input', () => { state.query = searchInput.value.trim(); renderList(); });
spoilerToggle.addEventListener('change', () => { state.spoiler = spoilerToggle.checked; renderAll(); });
hideEarnedToggle.addEventListener('change', () => { state.hideEarned = hideEarnedToggle.checked; renderList(); });

document.getElementById('export-btn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = ids.filter((id) => Number.isInteger(id) && trophies.some((t) => t.id === id));
    earned = new Set(valid);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Clear every earned tick? This cannot be undone.')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

// Deep links, used by the screenshots and shareable by readers:
// #trophy-<id> opens that trophy's guide, #roadmap jumps to the roadmap,
// #kind=<kind> picks a filter, #spoiler=off reveals the story trophies.
function applyHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  for (const part of hash.split('&')) {
    const [key, value] = part.split('=');
    if (key === 'roadmap') {
      document.getElementById('roadmap')?.scrollIntoView();
      continue;
    }
    if (key.startsWith('trophy-')) {
      const id = Number(key.slice('trophy-'.length));
      if (trophies.some((t) => t.id === id)) {
        state.open.add(id);
        renderList();
        document.getElementById(`trophy-${id}`)?.scrollIntoView({ block: 'center' });
      }
      continue;
    }
    if (key === 'kind' && value) {
      state.kind = value;
      for (const c of document.querySelectorAll('#kind-chips .chip')) c.classList.toggle('active', c.dataset.kind === value);
      if (value === 'online' || value === 'missable') document.getElementById('list-heading')?.scrollIntoView();
    }
    if (key === 'spoiler' && value === 'off') {
      state.spoiler = false;
      spoilerToggle.checked = false;
    }
    if (key === 'trophy') {
      const id = Number(value);
      if (trophies.some((t) => t.id === id)) {
        state.open.add(id);
        renderList();
        document.getElementById(`trophy-${id}`)?.scrollIntoView({ block: 'center' });
      }
    }
  }
}

window.addEventListener('hashchange', applyHash);

applyHash();
renderSources();
renderAll();
if (state.open.size) {
  const first = [...state.open][0];
  document.getElementById(`trophy-${first}`)?.scrollIntoView({ block: 'center' });
}
