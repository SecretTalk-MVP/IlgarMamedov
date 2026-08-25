cat > memory.run.js <<'EOF'
const memory = require("./memory");

console.log("\n=== UNIFIED MEMORY CHECK ===\n");

const memory1 = memory.createEmpty();

console.log("1. Empty memory:");
console.log(JSON.stringify(memory1, null, 2));

const memory2 = memory.update(
    memory1,
    "Меня зовут Ильгар"
);

console.log("\n2. After name:");
console.log(JSON.stringify(memory2, null, 2));

const memory3 = memory.update(
    memory2,
    "Я говорю по-русски"
);

console.log("\n3. After language:");
console.log(JSON.stringify(memory3, null, 2));

console.log("\n4. Relevant profile:");
console.log(
    JSON.stringify(
        memory.getRelevant(memory3, ["profile"]),
        null,
        2
    )
);

console.log("\n=== CHECK FINISHED ===\n");
EOF
