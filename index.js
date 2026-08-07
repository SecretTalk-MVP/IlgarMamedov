TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiUsers = {};
const memories = {};
const waitingUsers = [];
const dialogs = {};
const users = {};
const waitingTimers = {};
let chatHistory = {};
const onlineUsers = new Set();
const userHistory = {};
async function saveUser(msg) {
