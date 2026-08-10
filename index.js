const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const db = require('./database/db');

const AIService = require('./ai/ai.service');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const aiService = new AIService();
const searchRoutes = require('./search/routes');
const aiUsers = {};

console.log("✅ Bot initialized");
console.log("✅ AiDa initialized");

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(
        msg.chat.id,
        "Добро пожаловать в SecretTalk 💌\n\nВыберите действие:",
        {
            reply_markup: {
                keyboard: [
                    ["🤖 Поговорить с ИИ"]
                ],
                resize_keyboard: true
            }
        }
    );

});

bot.on("message", async (msg) => {

    const searchHandled = await searchRoutes.handle(
        bot,
        msg,
        aiUsers
    );

    if (searchHandled) {
        return;
    }

    if (msg.text === "🤖 Поговорить с ИИ") {

        aiUsers[msg.chat.id] = true;

        bot.sendMessage(
            msg.chat.id,
            "🤖 Режим AiDa включён.\nНапишите любое сообщение."
        );

        return;
    }

    if (!aiUsers[msg.chat.id]) {
        return;
    }

    try {

        console.log("🤖 AiDa request:", msg.chat.id, msg.text);

        const answer = await aiService.ask(
            msg.chat.id,
            [
                {
                    role: "user",
                    content: msg.text
                }
            ]
        );

        console.log("🤖 AiDa answer:", answer);

        await bot.sendMessage(
            msg.chat.id,
            answer
        );

    } catch (error) {

        console.error("❌ AiDa error:", error);

        await bot.sendMessage(
            msg.chat.id,
            "❌ AiDa не смогла ответить. Ошибка записана в лог."
        );
    }

});
