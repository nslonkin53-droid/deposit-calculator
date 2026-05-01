// Пример для Node.js + axios.
// Вставь этот код в своего бота или адаптируй под свою структуру.

import axios from 'axios';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID; // ID группы или канала
const MINI_APP_URL = process.env.MINI_APP_URL; // например: https://your-site.vercel.app

async function sendDepositCalculatorButton() {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: '📊 Калькулятор распределения депозита\n\nНажми кнопку ниже, введи депозит, процент выплаты и количество шагов.',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📊 Открыть калькулятор',
            web_app: { url: MINI_APP_URL }
          }
        ]
      ]
    }
  });
}

sendDepositCalculatorButton().catch(console.error);
