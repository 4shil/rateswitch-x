require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');

// Tokens and IDs from .env
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Discord Client
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Initialize Telegram Bot
const telegramBot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// --- DISCORD TO TELEGRAM ---
discordClient.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only forward messages from the specified Discord channel
    if (message.channelId === DISCORD_CHANNEL_ID) {
        const text = `[Discord] **${message.author.username}**: ${message.content}`;
        try {
            await telegramBot.sendMessage(TELEGRAM_CHAT_ID, text, { parse_mode: 'Markdown' });
            console.log('Forwarded Discord -> Telegram');
        } catch (error) {
            console.error('Error sending to Telegram:', error.message);
        }
    }
});

// --- TELEGRAM TO DISCORD ---
telegramBot.on('message', async (msg) => {
    // Ignore if not from the target Telegram chat
    if (msg.chat.id.toString() !== TELEGRAM_CHAT_ID) return;
    
    // Ignore bot messages to prevent infinite loops if bots reply to each other
    if (msg.from.is_bot) return;

    // Basic text message forwarding
    const text = `[Telegram] **${msg.from.first_name || msg.from.username}**: ${msg.text || '[Media/Non-text message]'}`;
    
    try {
        const channel = await discordClient.channels.fetch(DISCORD_CHANNEL_ID);
        if (channel) {
            await channel.send(text);
            console.log('Forwarded Telegram -> Discord');
        }
    } catch (error) {
        console.error('Error sending to Discord:', error.message);
    }
});

discordClient.once('ready', () => {
    console.log(`Discord bot logged in as ${discordClient.user.tag}`);
});

telegramBot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
});

// Start Discord Bot
discordClient.login(DISCORD_TOKEN);
console.log('Bridge starting...');