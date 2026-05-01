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

  // Теперь это поле задает именно сумму ПЕРВОЙ ставки
  const firstStake = parseFloat(els.riskPart.value) || 0;

  const mode = els.mode.value;

  if (deposit <= 0 || payoutPercent <= 0 || steps <= 0 || firstStake <= 0) return;

  const payoutCoeff = payoutPercent / 100;
  let stakes = [];

  if (mode === 'equal') {
    // Режим Флэт: все шаги по 100р
    for (let i = 0; i < steps; i++) stakes.push(firstStake);
  } else {
    // Режим Догон: Шаг 1 = 100р, Шаг 2 и далее - на повышение
    // Коэффициент перекрытия (q)
    const q = (1 / payoutCoeff) + 1.1;

    for (let i = 0; i < steps; i++) {
      stakes.push(firstStake * Math.pow(q, i));
    }
  }

  renderTable(stakes, payoutCoeff, firstStake, deposit);
}