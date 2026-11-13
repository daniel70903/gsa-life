'use strict';
const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const campusModule = require('../dist/campus-systems.js');
const copy = value => JSON.parse(JSON.stringify(value));

function verifyEconomy() {
  const campus = campusModule.createAPI({
    rng: () => 0.5,
    shift: (s, changes) => { for (const [key, value] of Object.entries(changes)) s.stats[key] = (s.stats[key] || 0) + value; },
    note: () => {}, addLearning: () => {},
    clamp: (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n)),
    round: n => Math.round(n * 10) / 10
  });
  const traits = ['intelligence', 'social', 'athletics', 'discipline', 'luck', 'creativity', 'resilience', 'leadership'];
  const starts = Array.from({ length: 120 }, (_, seed) => E.create('생활비 검증', seed, { gender: 'male' }));
  starts.sort((a, b) => traits.reduce((sum, key) => sum + a.stats[key] - b.stats[key], 0));
  for (let i = 0; i < starts.length; i++) {
    assert.equal(starts[i].money.allowance, 5000);
    assert.ok(starts[i].money.balance >= 10000 && starts[i].money.balance <= 25000);
    if (i) assert.ok(starts[i - 1].money.startingBalance >= starts[i].money.startingBalance);
  }
  assert.ok(starts[0].money.startingBalance > starts.at(-1).money.startingBalance);
  assert.equal(E.create('같은 생활비', 53, { gender: 'male' }).money.balance, E.create('같은 생활비', 53, { gender: 'female' }).money.balance);

  // A pair of inexpensive consumables uses a week's budget. Durable items are
  // reachable savings goals rather than free purchases out of starting funds.
  const price = id => E.shopItems.find(item => item.id === id).price;
  const basket = price('snack') + price('milk');
  assert.ok(basket >= 5000 && basket <= 6000);
  for (const id of ['earplugs', 'eye_mask', 'research_notebook', 'basketball', 'shoes']) {
    const item = E.shopItems.find(item => item.id === id);
    assert.ok(item.reusable && item.price >= 10000 && item.price <= 45000);
  }
  assert.ok(starts.every(s => s.money.balance < price('basketball') && s.money.balance < price('shoes')));

  const spend = E.create('매주 간식과 우유', 53, { gender: 'male' });
  spend.pendingEvent = null; spend.eventQueue = [];
  let purchases = 0, spent = 0;
  for (let turn = 0; turn < 48; turn++) {
    spend.turn = turn;
    campus.beginWeek(spend);
    const paidOnce = copy(spend.money);
    assert.equal(campus.beginWeek(spend).started, false);
    assert.deepEqual(spend.money, paidOnce, 'Opening a week twice never pays twice');
    for (const id of ['snack', 'milk']) {
      if (campus.getShop(spend).find(item => item.id === id).available) {
        campus.buyItem(spend, id); purchases++; spent += price(id);
      }
    }
    assert.ok(spend.money.balance >= 0);
  }
  const normalBudget = spend.money.startingBalance + 47 * 5000;
  assert.equal(spend.money.balance + spent, normalBudget);
  assert.ok(purchases >= 88 && purchases < 96, 'Basic regular shopping is sustainable with occasional restraint or help work');
  assert.ok(spend.money.balance < 5000, 'Regular consumption does not leave an oversized idle wallet');

  // Legacy savings are never confiscated or retroactively repriced. The next
  // allowance changes exactly once while all transaction/ownership data stays.
  const legacy = E.create('이전 생활비', 55, { gender: 'male' });
  legacy.pendingEvent = null; legacy.turn = 18;
  legacy.money.balance = 184500;
  legacy.money.startingBalance = 57000;
  legacy.money.allowance = 10000;
  delete legacy.money.economyVersion;
  legacy.money.ownedItems = ['shoes'];
  legacy.money.ledger = [{ turn: 17, amount: -3000, reason: '에너지 음료', balance: 184500 }];
  const oldMoney = copy(legacy.money), oldRng = legacy.rng;
  const resumed = E.migrate(copy(legacy));
  assert.equal(resumed.money.balance, oldMoney.balance, 'Public save migration retains savings');
  assert.equal(resumed.money.allowance, 5000, 'Public save migration updates future income');
  assert.deepEqual(resumed.money.ledger, oldMoney.ledger);
  assert.deepEqual(resumed.money.ownedItems, oldMoney.ownedItems);
  campus.migrate(legacy);
  const expectedMoney = { ...oldMoney, allowance: 5000, economyVersion: 2 };
  assert.deepEqual(legacy.money, expectedMoney);
  assert.equal(legacy.rng, oldRng);
  campus.migrate(legacy);
  assert.deepEqual(legacy.money, expectedMoney, 'The migration is idempotent');
  campus.beginWeek(legacy);
  assert.equal(legacy.money.balance, oldMoney.balance + 5000);

  const lowSkill = E.create('작은 도움', 12, { gender: 'male' });
  const highSkill = copy(lowSkill);
  for (const key of traits) { lowSkill.stats[key] = 0; highSkill.stats[key] = 100; }
  const lowBefore = lowSkill.money.balance, highBefore = highSkill.money.balance;
  campus.handleAction(lowSkill, 'earn'); campus.handleAction(highSkill, 'earn');
  assert.equal(lowSkill.money.balance - lowBefore, 2500);
  assert.equal(highSkill.money.balance - highBefore, 6500);
  assert.ok(highSkill.stats.fatigue > 15, 'Extra money still costs effort');

  return { result: 'pass', startingSampleSize: starts.length, allowance: 5000,
    startingMin: Math.min(...starts.map(s => s.money.startingBalance)),
    startingMax: Math.max(...starts.map(s => s.money.startingBalance)),
    cheapWeeklyBasket: basket, regularPurchases: purchases,
    totalBudget: normalBudget, endingBalance: spend.money.balance };
}
module.exports = verifyEconomy;
if (require.main === module) console.log(JSON.stringify(verifyEconomy()));
