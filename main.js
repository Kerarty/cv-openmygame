// Рендер и связка DOM с движком. Весь текст берётся из TEXT[LANG],
// все числа — из ECONOMY: здесь только вывод.
let LANG = 'ru';
const T = () => TEXT[LANG];
const $ = sel => document.querySelector(sel);
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fmtRate(r) {
  const u = T().hud.unit;
  return '+' + r.toFixed(1) + ' ' + u + '/' + u;
}

function fmtTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(Math.floor(sec % 60)).padStart(2, '0');
  return m + ':' + s;
}

/* ---------- рендер ---------- */

function renderStatic() {
  document.title = T().docTitle;
  document.documentElement.lang = LANG;
  $('#name').textContent = T().header.name;
  $('#role').textContent = T().header.role;
  $('#pitch').textContent = T().header.pitch;
  $('#sub').textContent = T().header.sub;
  $('#balance-caption').textContent = T().hud.balance;
  $('#lang-btn').textContent = T().hud.langBtn;
  $('#showall-btn').textContent = T().hud.showAll;
  $('#designer-btn').textContent = T().hud.designer;
  $('#pdf-hud').textContent = T().hud.pdf;
  $('#print-link').textContent = T().footer.print;
  $('#made').textContent = T().footer.made;
  $('#others').textContent = T().footer.others;
  $('#print-sub').textContent = T().print.subtitle;
  $('#print-name').textContent = T().header.name;
  $('#print-contacts').textContent = T().contacts.phone + ' · ' + T().contacts.email + ' · ' + T().contacts.github;
}

function factCardHTML(id) {
  const f = T().facts[id];
  const meta = ECONOMY.facts[id];
  const open = !!Game.state.bought[id];
  const link = meta.github
    ? `<a class="fact-link" href="${meta.github}" target="_blank" rel="noopener">${f.link} ↗</a>`
    : '';
  return `
  <article class="fact" data-id="${id}" data-state="${open ? 'open' : 'locked'}">
    <div class="fact-head">
      <h3>${f.title}</h3>
      <span class="cost">${meta.cost} ${T().hud.unit}</span>
    </div>
    <div class="lock-ui">
      <p class="lock-label">${T().locked.next}</p>
      <div class="fill"><div class="fill-bar"></div></div>
      <button class="buy-btn" data-id="${id}" disabled>${T().locked.buy} · ${meta.cost} ${T().hud.unit}</button>
    </div>
    <div class="fact-body">
      <p>${f.body}</p>
      <ul class="nums">${f.nums.map(n => `<li>${n}</li>`).join('')}</ul>
      ${link}
    </div>
  </article>`;
}

function renderBoard() {
  $('#board').innerHTML = ECONOMY.departments.map(dept => {
    const d = T().dept[dept.id];
    return `
    <section class="dept dept-${dept.id}">
      <header class="dept-head"><h2>${d.name}</h2><p>${d.tag}</p></header>
      <div class="facts">${dept.factIds.map(factCardHTML).join('')}</div>
    </section>`;
  }).join('');

  $('#board').querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => Game.buy(btn.dataset.id));
  });
}

function renderSynergy() {
  const s = T().synergy;
  $('#synergy').innerHTML = `
    <div class="syn-head"><span class="syn-badge">✦</span><h2>${s.title}</h2></div>
    <p>${s.body}</p>
    <ul class="nums">${s.nums.map(n => `<li>${n}</li>`).join('')}</ul>`;
  $('#synergy').dataset.state = Game.state.synergyUnlocked ? 'open' : 'hidden';
}

function renderFinale() {
  const f = T().finale;
  const c = T().contacts;
  const subject = encodeURIComponent(LANG === 'ru' ? 'Резюме: геймдизайнер' : 'Resume: game designer');
  $('#finale').innerHTML = `
    <h2>${f.title}</h2>
    <p class="fin-body">${f.body.replace('{T}', Math.floor(Game.state.elapsed))}</p>
    <div class="fin-btns">
      <a class="hud-btn primary" href="mailto:${c.email}?subject=${subject}">${f.write}</a>
      <a class="hud-btn" href="assets/Yaroslav_Kukar_CV.pdf" target="_blank">${f.pdf}</a>
      <a class="hud-btn" href="https://github.com/Kerarty" target="_blank" rel="noopener">${f.github}</a>
      <button class="hud-btn" id="again-btn">${f.again}</button>
    </div>
    <div class="contacts">
      <a href="tel:${c.phone.replace(/ /g, '')}">${c.phone}</a>
      <a href="mailto:${c.email}">${c.email}</a>
      <span>${c.github}</span>
    </div>
    <p class="fin-ps">${f.ps}</p>`;
  $('#again-btn').addEventListener('click', restart);
  $('#finale').classList.toggle('hidden', !Game.state.finished);
}

function renderDesigner() {
  const d = T().designer;
  const u = T().hud.unit;
  const forWord = LANG === 'ru' ? 'на' : 'for';
  const costs = Object.values(ECONOMY.facts).map(f => f.cost);
  const b = ECONOMY.booster;
  const values = {
    start: ECONOMY.startBalance + ' ' + u,
    base: ECONOMY.baseRate + ' ' + u + '/' + u,
    growth: '+' + ECONOMY.ratePerFact + ' ' + u + '/' + u,
    coffee: `${b.cost} ${u} → ×${b.multiplier} ${forWord} ${b.duration} ${u}`,
    prices: Math.min(...costs) + '…' + Math.max(...costs) + ' ' + u,
    synergy: '0 ' + u,
    finale: '0 ' + u,
  };
  const rowKeys = ['start', 'base', 'growth', 'coffee', 'prices', 'synergy', 'finale'];
  $('#designer-panel').innerHTML = `
    <h2>${d.title}</h2>
    <p class="ds-intro">${d.intro}</p>
    <table class="ds-table">
      <thead><tr><th>${d.colK}</th><th>${d.colV}</th><th>${d.colWhy}</th></tr></thead>
      <tbody>
        ${rowKeys.map(k => `<tr><td>${rowLabel(k)}</td><td class="ds-v">${values[k]}</td><td>${d.rows[k]}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="ds-ab"><h3>${d.abTitle}</h3><p>${d.abText}</p></div>
    <p class="ds-closing">${d.closing}</p>`;
}

function rowLabel(k) {
  const u = T().hud.unit;
  return {
    start: T().hud.balance + ': ' + ECONOMY.startBalance + ' ' + u,
    base: LANG === 'ru' ? 'базовая ставка' : 'base rate',
    growth: LANG === 'ru' ? 'рост ставки' : 'rate growth',
    coffee: LANG === 'ru' ? 'кофе HR' : 'HR coffee',
    prices: LANG === 'ru' ? 'цены фактов' : 'fact prices',
    synergy: LANG === 'ru' ? 'синергия' : 'synergy',
    finale: LANG === 'ru' ? 'финал' : 'finale',
  }[k];
}

/* ---------- обновление на тике ---------- */

function update() {
  const s = Game.state;
  $('#balance').textContent = Math.floor(s.balance);
  $('#rate').textContent = fmtRate(Game.rate());
  $('#timer').textContent = fmtTimer(s.elapsed);

  const coffeeBtn = $('#coffee-btn');
  if (s.boosterUsed) {
    coffeeBtn.disabled = s.boosterLeft <= 0;
    coffeeBtn.textContent = s.boosterLeft > 0
      ? '☕ ×2 · ' + Math.ceil(s.boosterLeft) + ' ' + T().hud.unit
      : T().hud.coffeeDone;
    coffeeBtn.classList.toggle('active', s.boosterLeft > 0);
  } else {
    coffeeBtn.disabled = s.balance < ECONOMY.booster.cost;
    coffeeBtn.textContent = T().hud.coffee;
  }

  document.querySelectorAll('.fact[data-state="locked"]').forEach(card => {
    const id = card.dataset.id;
    const cost = ECONOMY.facts[id].cost;
    const pct = Math.min(100, (s.balance / cost) * 100);
    card.querySelector('.fill-bar').style.width = pct + '%';
    const affordable = Game.canBuy(id);
    card.classList.toggle('affordable', affordable);
    card.querySelector('.buy-btn').disabled = !affordable;
  });
}

/* ---------- события движка ---------- */

Game.onTick = update;

Game.onBuy = id => {
  const card = document.querySelector(`.fact[data-id="${id}"]`);
  if (card) {
    card.dataset.state = 'open';
    if (!REDUCED_MOTION) card.classList.add('just-bought');
  }
};

Game.onSynergy = () => {
  const el = $('#synergy');
  el.dataset.state = 'open';
  if (!REDUCED_MOTION) el.classList.add('just-bought');
};

Game.onComplete = () => {
  renderFinale();
  $('#finale').scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
};

Game.onBooster = update;

/* ---------- управление ---------- */

function restart() {
  Game.init();
  renderBoard();
  renderSynergy();
  renderFinale();
  update();
  window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
}

$('#lang-btn').addEventListener('click', () => {
  LANG = LANG === 'ru' ? 'en' : 'ru';
  renderStatic();
  renderBoard();
  renderSynergy();
  renderFinale();
  renderDesigner();
  update();
});

$('#designer-btn').addEventListener('click', () => {
  const p = $('#designer-panel');
  p.classList.toggle('hidden');
  $('#designer-btn').classList.toggle('active', !p.classList.contains('hidden'));
  if (!p.classList.contains('hidden')) p.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
});

$('#showall-btn').addEventListener('click', () => Game.revealAll());
$('#coffee-btn').addEventListener('click', () => Game.buyBooster());
$('#print-link').addEventListener('click', e => { e.preventDefault(); window.print(); });

/* ---------- старт ---------- */

renderStatic();
renderBoard();
renderSynergy();
renderFinale();
renderDesigner();
update();
