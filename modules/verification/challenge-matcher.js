const NUMBER_WORDS = Object.freeze({
    "ноль": 0,
    "один": 1,
    "одна": 1,
    "два": 2,
    "две": 2,
    "три": 3,
    "четыре": 4,
    "пять": 5,
    "шесть": 6,
    "семь": 7,
    "восемь": 8,
    "девять": 9,
    "десять": 10,
    "одиннадцать": 11,
    "двенадцать": 12,
    "тринадцать": 13,
    "четырнадцать": 14,
    "пятнадцать": 15,
    "шестнадцать": 16,
    "семнадцать": 17,
    "восемнадцать": 18,
    "девятнадцать": 19,
    "двадцать": 20,
    "тридцать": 30,
    "сорок": 40,
    "пятьдесят": 50,
    "шестьдесят": 60,
    "семьдесят": 70,
    "восемьдесят": 80,
    "девяносто": 90
});

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function wordsToNumber(words) {
    let total = 0;
    let found = false;

    for (const word of words) {
        if (!Object.prototype.hasOwnProperty.call(NUMBER_WORDS, word)) {
            continue;
        }

        total += NUMBER_WORDS[word];
        found = true;
    }

    return found ? total : null;
}

function normalizeNumberTokens(tokens) {
    const result = [];

    let i = 0;

    while (i < tokens.length) {
        const current = tokens[i];

        if (/^\d+$/.test(current)) {
            result.push(String(Number(current)));
            i += 1;
            continue;
        }

        const first =
            NUMBER_WORDS[current];

        if (
            first !== undefined &&
            first >= 20 &&
            first % 10 === 0 &&
            i + 1 < tokens.length
        ) {
            const second =
                NUMBER_WORDS[tokens[i + 1]];

            if (
                second !== undefined &&
                second >= 1 &&
                second <= 9
            ) {
                result.push(
                    String(first + second)
                );

                i += 2;
                continue;
            }
        }

        if (first !== undefined) {
            result.push(String(first));
            i += 1;
            continue;
        }

        result.push(current);
        i += 1;
    }

    return result;
}

function normalizeChallenge(value) {
    const normalized =
        normalizeText(value);

    if (!normalized) {
        return [];
    }

    return normalizeNumberTokens(
        normalized.split(" ")
    );
}

function matchesChallenge(expected, actual) {
    const expectedTokens =
        normalizeChallenge(expected);

    const actualTokens =
        normalizeChallenge(actual);

    if (
        expectedTokens.length === 0 ||
        actualTokens.length === 0
    ) {
        return false;
    }

    if (
        expectedTokens.length !==
        actualTokens.length
    ) {
        return false;
    }

    return expectedTokens.every(
        (token, index) =>
            token === actualTokens[index]
    );
}

module.exports = {
    normalizeText,
    normalizeChallenge,
    matchesChallenge
};
