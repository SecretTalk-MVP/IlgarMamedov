const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');

const AIService = require('./ai/ai.service');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiService = new AIService();

console.log("✅ Bot initialized");
console.log("✅ AiDa initialized");
