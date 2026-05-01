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
  const riskPart = parseFloat(els.riskPart.value) || 0;
  const mode = els.mode.value;

  if (deposit <= 0 || payoutPercent <= 0 || steps <= 0) return;

  const payoutCoeff = payoutPercent / 100;
  const usedDeposit = deposit * (riskPart / 100);

  let stakes = [];

  if (mode === 'equal') {
    const s = usedDeposit / steps;
    for (let i = 0; i < steps; i++) stakes.push(s);
  } else {
    // МАТЕМАТИЧЕСКИЙ РАСЧЕТ ДОГОНА
    // Коэффициент (q) должен быть больше чем (1 + 1/payout)
    // Добавляем 0.1 сверху для гарантированного профита
    const q = (1 / payoutCoeff) + 1.1;

    // s1 = Сумма * (q - 1) / (q^n - 1)
    let s1 = usedDeposit * (q - 1) / (Math.pow(q, steps) - 1);

    for (let i = 0; i < steps; i++) {
      stakes.push(s1 * Math.pow(q, i));
    }
  }

  renderTable(stakes, payoutCoeff, usedDeposit, deposit);
}

function renderTable(stakes, payoutCoeff, usedDeposit, deposit) {
  els.rows.innerHTML = '';
  let totalSpent = 0;

  stakes.forEach((stake, index) => {
    totalSpent += stake;
    const potentialProfit = stake * payoutCoeff;
    // Чистая прибыль = Выплата текущего шага - Сумма всех прошлых убытков
    const netProfit = potentialProfit - (totalSpent - stake);

    const tr = document.createElement('tr');
    const isWin = netProfit > 0;
    const resultStyle = isWin ? 'color: #22c55e; font-weight: bold;' : 'color: #ef4444;';

    tr.innerHTML = `
            <td>Шаг ${index + 1}</td>
            <td>${rub.format(stake)}</td>
            <td>${rub.format(stake + potentialProfit)}</td>
            <td style="${resultStyle}">${isWin ? '+' : ''}${rub.format(netProfit)}</td>
        `;
    els.rows.appendChild(tr);
  });

  els.usedDeposit.innerText = rub.format(totalSpent);
  els.totalStake.innerText = rub.format(totalSpent);
  els.leftover.innerText = rub.format(deposit - totalSpent);
}

[els.deposit, els.payout, els.steps, els.riskPart, els.mode].forEach(input => {
  input.addEventListener('input', calculate);
});

calculate();