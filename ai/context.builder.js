async build(userId, messages) {

    console.log("🧠 Building context...");

    const memory = await this.memoryService.loadMemory(userId);

    console.log("Memory loaded:", memory.profile?.name);

    const context = [];

    if (memory.profile?.name) {

        context.push({
            role: "system",
            content: `User name: ${memory.profile.name}`
        });

    }

    context.push(...messages);

    return context;

}
