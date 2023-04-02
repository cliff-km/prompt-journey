export function parsePrompts(input:string) {
    const promptWeightPairs = [];
    const regex = /((?:[^:]+|:(?!:))+)(?:::(\d+(?:\.\d+)?))?(?=\s|$)/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
        const prompt = match[1].trim();
        const weight = match[2] ? parseFloat(match[2]) : 1;
        if(prompt) {
        promptWeightPairs.push({ prompt, weight });
        }
    }

    return promptWeightPairs;
}
