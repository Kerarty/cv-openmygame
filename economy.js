// Экономика резюме. Все числа живут здесь: баланс-лист в режиме
// дизайнера читает эти данные, при правке цен меняется только файл.
const ECONOMY = {
  startBalance: 30,
  baseRate: 1,
  ratePerFact: 0.6,
  booster: { cost: 25, multiplier: 2, duration: 30 },

  departments: [
    { id: 'design', factIds: ['echoloop', 'eridor', 'gdd'] },
    { id: 'engines', factIds: ['splash', 'mobrush', 'sdk'] },
    { id: 'analytics', factIds: ['playtests', 'economy', 'math'] },
  ],

  facts: {
    echoloop:  { cost: 10, dept: 'design',  github: 'https://github.com/Kerarty/echoloop-playble' },
    eridor:    { cost: 45, dept: 'design' },
    gdd:       { cost: 75, dept: 'design' },
    splash:    { cost: 20, dept: 'engines', github: 'https://github.com/Kerarty/splash-kitty-playable-ad' },
    mobrush:   { cost: 60, dept: 'engines', github: 'https://github.com/Kerarty/playable-ad-mob-rush' },
    sdk:       { cost: 80, dept: 'engines', github: 'https://github.com/Kerarty/playble-ads' },
    playtests: { cost: 5,  dept: 'analytics' },
    economy:   { cost: 35, dept: 'analytics' },
    math:      { cost: 65, dept: 'analytics' },
  },

  // Бесплатная карточка: награда за диверсификацию вложений.
  synergy: { id: 'synergy', requires: ['echoloop', 'splash'] },

  paidFactsToFinish: 9,
};
