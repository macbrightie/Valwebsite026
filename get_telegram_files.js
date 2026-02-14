const https = require('https');

// Usage: 
// 1. Get your Bot Token from @BotFather
// 2. Set it in your environment or replace it below
// 3. Run: node script_get_updates.js

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN is not set in environment variables.");
    console.error("Usage: export TELEGRAM_BOT_TOKEN=your_token_here && node script_get_updates.js");
    return;
}

const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?allowed_updates=["message"]`;

console.log(`📡 Fetching updates for Bot...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (!response.ok) {
                console.error("❌ Telegram API Error:", response.description);
                return;
            }

            const activeUpdates = response.result.filter(u => u.message && (u.message.audio || u.message.voice || u.message.document));

            if (activeUpdates.length === 0) {
                console.log("⚠️ No audio messages found in recent updates.");
                console.log("👉 Please send an MP3 file to your bot in Telegram, then run this script again.");
                return;
            }

            console.log("\n🎵 Found Audio Files:\n");

            activeUpdates.forEach(u => {
                const audio = u.message.audio || u.message.voice || u.message.document;
                const caption = u.message.caption || "(No caption)";
                const from = u.message.from.first_name;

                console.log(`📄 Name: ${audio.file_name || 'Unknown'}`);
                console.log(`👤 From: ${from}`);
                console.log(`🖇  File ID: ${audio.file_id}`);
                console.log(`📝 Caption: ${caption}`);
                console.log("--------------------------------------------------");
            });

            console.log("\n✅ Copy the 'File ID' and paste it into src/components/ImmersivePlayer.tsx");

        } catch (e) {
            console.error("❌ Error parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.error("❌ Network Error:", err.message);
});
