/**
 * SecretTalk
 * Navigation Module
 *
 * Responsible only for user navigation state.
 *
 * No Telegram logic.
 * No UI logic.
 * No AI logic.
 * No business logic.
 */

class Navigation {

    constructor() {

        this.stacks = new Map();

    }


    getStack(userId) {

        if (!userId) {
            throw new Error(
                "Navigation requires userId"
            );
        }

        if (!this.stacks.has(userId)) {

            this.stacks.set(
                userId,
                ["main"]
            );
        }

        return this.stacks.get(userId);
    }


    reset(userId) {

        if (!userId) {
            throw new Error(
                "Navigation requires userId"
            );
        }

        this.stacks.set(
            userId,
            ["main"]
        );

        return this.getStack(userId);
    }


    push(userId, screen) {

        if (!userId) {
            throw new Error(
                "Navigation requires userId"
            );
        }

        if (!screen) {
            throw new Error(
                "Navigation requires screen"
            );
        }

        const stack =
            this.getStack(userId);

        if (
            stack[stack.length - 1] !== screen
        ) {

            stack.push(screen);
        }

        return stack;
    }


    pop(userId) {

        const stack =
            this.getStack(userId);

        if (stack.length <= 1) {

            return "main";
        }

        stack.pop();

        return stack[stack.length - 1];
    }


    current(userId) {

        const stack =
            this.getStack(userId);

        return stack[stack.length - 1];
    }
}


module.exports = new Navigation();
