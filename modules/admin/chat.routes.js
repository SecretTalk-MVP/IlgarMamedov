class ChatRoutes {

    async handle(bot, msg) {

        if (msg.text !== "/admin") {
            return false;
        }

        return true;
    }

}

module.exports = new ChatRoutes();
