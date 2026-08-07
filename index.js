TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');
const AIService = require('./ai/ai.service');

const aiService = new AIService();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

