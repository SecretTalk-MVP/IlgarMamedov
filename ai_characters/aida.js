const fs = require("fs");
const path = require("path");

const systemPrompt = fs.readFileSync(
    path.join(__dirname, "esko.system.md"),
    "utf8"
);

module.exports = {
    name: "Esko",
    systemPrompt
};
