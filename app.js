const tg = window.Telegram.WebApp;
tg.expand();

const els = {
  deposit: document.getElementById('deposit'),
  payout: document.getElementById('payout'),
  steps: document.getElementById('steps'),
  riskPart: document.getElementById('riskPart'),
  mode: document.getElementById('mode'),
  usedDeposit: document.getElementById('usedDeposit'),
  totalStake: document.getElementById('totalStake'),
  leftover: document.getElementById('leftover'),
  rows: document.getElementById('rows'),
  sendBtn: document.getElementById('sendBtn')
};

// Форматтер для красивого вывода рублей
const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 2
});

function calculate() {
  const deposit = parseFloat(els.deposit.value) || 0;
  const payoutPercent = parseFloat(els.payout.value) || 0;
  const steps = parseInt(els.steps.value) || 0;
  const riskPercent = parseFloat(els.riskPart.value) || 0;
  const mode = els.mode.value;

  if (deposit <= 0 || payoutPercent <= 0 || steps <= 0) return;

  const payoutCoeff = payoutPercent / 100;

  // ВЫЧИСЛЯЕМ ПЕРВЫЙ ШАГ: 1% от депозита (100 рублей)
  const firstStake = deposit * (riskPercent / 100);

  let stakes = [];

  if (mode === 'equal') {
    // Все шаги по 100 рублей
    for (let i = 0; i < steps; i++) stakes.push(firstStake);
  } else {
    // УМНЫЙ ДОГОН: первый шаг 100, следующие выше для перекрытия
    const q = (1 / payoutCoeff) + 1.1;

    for (let i = 0; i < steps; i++) {
      stakes.push(firstStake * Math.pow(q, i));
    }
  }

  renderTable(stakes, payoutCoeff, firstStake, deposit);
}