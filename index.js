TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

