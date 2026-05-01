const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const els = {
  deposit: document.getElementById('deposit'),
  payout: document.getElementById('payout'),
  steps: document.getElementById('steps'),
  riskPart: document.getElementById('riskPart'),
  mode: document.getElementById('mode'),
  rows: document.getElementById('rows'),
  usedDeposit: document.getElementById('usedDeposit'),
  totalStake: document.getElementById('totalStake'),
  leftover: document.getElementById('leftover'),
  sendBtn: document.getElementById('sendBtn'),
};

function money(value) {
  return Number(value || 0).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getNumber(input, fallback) {
  const value = Number(String(input.value).replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function calculate() {
  const deposit = getNumber(els.deposit, 100);
  const payoutPercent = getNumber(els.payout, 85);
  const payout = payoutPercent / 100;
  const steps = Math.max(1, Math.min(30, Math.floor(getNumber(els.steps, 5))));
  const riskPart = Math.max(1, Math.min(100, getNumber(els.riskPart, 100))) / 100;
  const usedDeposit = deposit * riskPart;
  const mode = els.mode.value;

  let stakes = [];

  if (mode === 'equal') {
    const stake = usedDeposit / steps;
    stakes = Array.from({ length: steps }, () => stake);
  } else {
    // Схема перекрытия: каждый следующий вход пытается закрыть прошлые минусы и дать прибыль как на первом входе.
    const targetProfit = usedDeposit * 0.03; // базовая цель 3% от распределяемой суммы
    let previousLoss = 0;
    for (let i = 0; i < steps; i++) {
      const stake = (previousLoss + targetProfit) / payout;
      stakes.push(stake);
      previousLoss += stake;
    }

    const total = stakes.reduce((a, b) => a + b, 0);
    if (total > usedDeposit) {
      const ratio = usedDeposit / total;
      stakes = stakes.map(v => v * ratio);
    }
  }

  let totalStake = 0;
  const rows = stakes.map((stake, index) => {
    totalStake += stake;
    const grossPayout = stake * payout;
    const netIfWin = grossPayout - totalStake;

    return {
      step: index + 1,
      stake,
      grossPayout,
      netIfWin,
      totalBefore: totalStake,
    };
  });

  render(rows, usedDeposit, totalStake, deposit - totalStake);
  return { deposit, payoutPercent, steps, riskPart: riskPart * 100, mode, rows, usedDeposit, totalStake };
}

function render(rows, usedDeposit, totalStake, leftover) {
  els.usedDeposit.textContent = money(usedDeposit);
  els.totalStake.textContent = money(totalStake);
  els.leftover.textContent = money(leftover);

  els.rows.innerHTML = rows.map(row => `
    <tr>
      <td>Шаг ${row.step}</td>
      <td>${money(row.stake)}</td>
      <td>${money(row.grossPayout)}</td>
      <td class="${row.netIfWin >= 0 ? 'plus' : 'minus'}">${money(row.netIfWin)}</td>
    </tr>
  `).join('');
}

function buildText(data) {
  const modeName = data.mode === 'equal' ? 'Ровно по шагам' : 'С перекрытием убытка';
  const lines = [
    '📊 Расчёт депозита',
    `Депозит: ${money(data.deposit)}`,
    `Выплата: ${data.payoutPercent}%`,
    `Шагов: ${data.steps}`,
    `Режим: ${modeName}`,
    '',
    ...data.rows.map(r => `Шаг ${r.step}: вход ${money(r.stake)} | выплата ${money(r.grossPayout)} | итог ${money(r.netIfWin)}`),
  ];
  return lines.join('\n');
}

Object.values(els).forEach(el => {
  if (el && ['INPUT', 'SELECT'].includes(el.tagName)) {
    el.addEventListener('input', calculate);
    el.addEventListener('change', calculate);
  }
});

els.sendBtn.addEventListener('click', () => {
  const data = calculate();
  const text = buildText(data);

  if (tg) {
    tg.sendData(JSON.stringify({ type: 'deposit_calculation', text, data }));
    tg.close();
  } else {
    navigator.clipboard?.writeText(text);
    alert('Расчёт скопирован. В Telegram он будет отправляться боту автоматически.');
  }
});

calculate();
