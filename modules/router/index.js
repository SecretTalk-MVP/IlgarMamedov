const routes = require("./routes");

class Router {

    async handle(bot, msg) {
        return await routes.handle(bot, msg);
    }

}

module.exports = new Router();
