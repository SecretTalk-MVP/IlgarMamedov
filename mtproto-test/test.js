const { TelegramClient } = require('teleproto');
const { StringSession } = require('teleproto/sessions');
const { createInterface } = require('node:readline/promises');
const fs = require('node:fs');
const path = require('node:path');

const apiId = 34979728;
const apiHash = process.env.TELEGRAM_API_HASH;

if (!apiHash) {
    throw new Error(
        'TELEGRAM_API_HASH is not set'
    );
}

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const sessionFile = path.join(
    __dirname,
    '.session'
);

const savedSession =
    fs.existsSync(sessionFile)
        ? fs.readFileSync(
            sessionFile,
            'utf8'
        ).trim()
        : '';

const session =
    new StringSession(
        savedSession
    );

const client = new TelegramClient(
    session,
    apiId,
    apiHash,
    {
        connectionRetries: 5
    }
);

async function main() {

    await client.start({

        phoneNumber: async () => {
            return await rl.question(
                'Telegram phone number: '
            );
        },

        password: async () => {
            return await rl.question(
                '2FA password: '
            );
        },

        phoneCode: async () => {
            return await rl.question(
                'Telegram login code: '
            );
        },

        onError: (error) => {
            console.error(
                'Telegram error:',
                error
            );
        }
    });

    const me = await client.getMe();

    console.log(
        '\nMTProto connection successful.'
    );

    console.log(
        'Telegram ID:',
        me.id?.toString()
    );

    console.log(
        'Username:',
        me.username || 'none'
    );

    console.log(
        'First name:',
        me.firstName || 'none'
    );

    const sessionString =
    client.session.save();

fs.writeFileSync(
    sessionFile,
    sessionString,
    {
        encoding: 'utf8',
        mode: 0o600
    }
);

console.log(
    '\nMTProto session saved locally.'
);

    await client.disconnect();
    rl.close();
}

main().catch((error) => {

    console.error(
        '\nMTProto test failed:'
    );

    console.error(error);

    rl.close();

});
