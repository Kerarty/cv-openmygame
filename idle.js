// Состояние и правила игры. Про DOM движок не знает: main.js подписывается
// на события и сам решает, что перерисовать.
const Game = {
  state: null,
  onTick: null,     // fn(state) — каждый тик таймера
  onBuy: null,      // fn(factId) — раскрыт платный факт
  onSynergy: null,  // fn() — раскрыта синергия
  onComplete: null, // fn() — открыты все платные факты
  onBooster: null,  // fn() — куплен кофе

  init() {
    this.state = {
      balance: ECONOMY.startBalance,
      bought: {},
      synergyUnlocked: false,
      boosterUsed: false,
      boosterLeft: 0,
      elapsed: 0,
      finished: false,
    };
  },

  revealedCount() {
    return Object.keys(this.state.bought).length + (this.state.synergyUnlocked ? 1 : 0);
  },

  rate() {
    let r = ECONOMY.baseRate + ECONOMY.ratePerFact * this.revealedCount();
    if (this.state.boosterLeft > 0) r *= ECONOMY.booster.multiplier;
    return r;
  },

  tick(dt) {
    const s = this.state;
    s.elapsed += dt;
    if (s.boosterLeft > 0) s.boosterLeft = Math.max(0, s.boosterLeft - dt);
    s.balance += this.rate() * dt;
    if (this.onTick) this.onTick(s);
  },

  canBuy(id) {
    const s = this.state;
    return !s.bought[id] && s.balance >= ECONOMY.facts[id].cost;
  },

  buy(id) {
    const s = this.state;
    if (!this.canBuy(id)) return false;
    s.balance -= ECONOMY.facts[id].cost;
    s.bought[id] = true;
    if (this.onBuy) this.onBuy(id);
    this.checkSynergy();
    if (!s.finished && Object.keys(s.bought).length >= ECONOMY.paidFactsToFinish) {
      s.finished = true;
      if (this.onComplete) this.onComplete();
    }
    return true;
  },

  checkSynergy() {
    const s = this.state;
    if (s.synergyUnlocked) return;
    if (ECONOMY.synergy.requires.every(id => s.bought[id])) {
      s.synergyUnlocked = true;
      if (this.onSynergy) this.onSynergy();
    }
  },

  buyBooster() {
    const s = this.state;
    if (s.boosterUsed || s.balance < ECONOMY.booster.cost) return false;
    s.balance -= ECONOMY.booster.cost;
    s.boosterUsed = true;
    s.boosterLeft = ECONOMY.booster.duration;
    if (this.onBooster) this.onBooster();
    return true;
  },

  // Каскад для «Показать всё»: факты по возрастанию цены, с интервалом,
  // чтобы HR успел увидеть, что открылось.
  revealAll() {
    const ids = Object.keys(ECONOMY.facts)
      .sort((a, b) => ECONOMY.facts[a].cost - ECONOMY.facts[b].cost);
    ids.forEach((id, i) => {
      setTimeout(() => {
        this.state.balance = Math.max(this.state.balance, ECONOMY.facts[id].cost);
        this.buy(id);
      }, i * 160);
    });
  },
};

Game.init();
setInterval(() => Game.tick(0.1), 100);
