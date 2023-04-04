export function parsePrompts(input: string) {
    const promptWeightPairs = [];
    const regex = /((?:[^:]+|:(?!:))+)(?:::(\d+(?:\.\d+)?))?(?=\s|$)/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
        const prompt = match[1].trim();
        const weight = match[2] ? parseFloat(match[2]) : 1;
        if (prompt) {
            promptWeightPairs.push([prompt, weight]);
        }
    }

    return promptWeightPairs;
}

export function processString(input: string) {
    // Remove newline characters from the beginning and end of the input
    input = input.replace(/^\n+|\n+$/g, "");

    // Check if the string contains prompt separators
    if (input.includes("::")) {
        return parsePrompts(input);
    }

    // Check if the string contains newline characters
    if (input.includes("\n")) {
        return input.split("\n").map((s) => s.trim()).map(s => [s, 1]);
    }

    // Split into sentences and count the number of delimiters
    const sentences = input.match(/[^.!?]+[.!?]+/g) || [];
    const numSentenceDelimiters = sentences.length;

    // Split into comma-separated concepts and count the number of commas
    const concepts = input.split(",").map((s) => s.trim());
    const numCommas = concepts.length - 1;

    // Determine if the input is a paragraph or a list of concepts
    if (numSentenceDelimiters > numCommas) {
        return sentences.map((sentence) => sentence.trim()).map(s => [s, 1]);
    } else {
        return concepts.map(s => [s, 1]);
    }
}