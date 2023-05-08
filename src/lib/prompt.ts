import { OutputMode, type MultiPrompt } from "../types.js";
import { replaceAliasesWithSlotValue } from "./slots.js";
import { getDisplayWeight } from "./weights.js";

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

function trimTrailingCommas(str: string) {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }

    const lastIndex = str.length - 1;
    let newStr = str;

    while (newStr[lastIndex] === ',') {
        newStr = newStr.slice(0, lastIndex);
    }

    return newStr;
}

function removeListMarkers(str: string) {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }

    const listMarkers = ['-', '#', '*', '•', '◦', '>', '<', '+', '^', '~', '(', ')', '[', ']', '{', '}'];
    let newStr = str.trim();

    while (listMarkers.includes(newStr[0])) {
        newStr = newStr.slice(1).trim();
    }

    // Handle cases like "1. ", "2) ", or "3) "
    if (/^\d+(\.|\))\s/.test(newStr)) {
        newStr = newStr.replace(/^\d+(\.|\))\s/, '');
    }

    return newStr;
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
        return input.split("\n").map(s => removeListMarkers(trimTrailingCommas(s))).filter(s => s.length > 0).map(s => [s, 1]);
    }

    // Split into sentences and count the number of delimiters
    const sentences = input.match(/[^.!?]+[.!?]+/g) || [];
    const numSentenceDelimiters = sentences.length;

    // Split into comma-separated concepts and count the number of commas
    const concepts = input.split(",").map(s => removeListMarkers(trimTrailingCommas(s))).filter(s => s.length > 0);
    const numCommas = concepts.length - 1;

    // Determine if the input is a paragraph or a list of concepts
    if (numSentenceDelimiters > numCommas) {
        return sentences.map(s => removeListMarkers(trimTrailingCommas(s))).filter(s => s.length > 0).map(s => [s, 1]);
    } else {
        return concepts.map(s => [s, 1]);
    }
}

export function getPromptList(activePrompt: MultiPrompt, useWeightOrdering: boolean, showZeroPrompts: boolean) {
    let list = Object.entries(activePrompt.weightedPrompts);
    console.log(list);

    if (useWeightOrdering) list = list.sort((a, b) => getDisplayWeight(activePrompt, parseInt(b[0])) - getDisplayWeight(activePrompt, parseInt(a[0])));
    console.log(list);
    if (!showZeroPrompts) list = list.filter((e) => showZeroPrompts || getDisplayWeight(activePrompt, parseInt(e[0])));
    console.log(list);

    return list;
}

function isCompleteSentence(text: string) {
    return text.trim().endsWith('.');
}

function joinSentencesAndFragments(textList: string[]) {
    let result = '';
    let fragmentBuffer: string[] = [];

    textList.forEach((text, index) => {
        if (isCompleteSentence(text)) {
            if (fragmentBuffer.length > 0) {
                result += fragmentBuffer.join(', ').replace(/,*\s*,/g, ',') + '. ';
                fragmentBuffer = [];
            }
            result += text + ' ';
        } else {
            fragmentBuffer.push(text.trim());
        }
    });

    if (fragmentBuffer.length > 0) {
        result += fragmentBuffer.join(', ').replace(/,*\s*,/g, ',') + '.';
    }

    return result.trim();
}



export function getPromptText(activePrompt: MultiPrompt, seed: string, outputMode: OutputMode, useWeightOrdering: boolean, showZeroPrompts: boolean) {
    console.log('get prompt text', activePrompt, seed, outputMode, useWeightOrdering, showZeroPrompts)
    if (outputMode === OutputMode.Multi) return getPromptList(activePrompt, useWeightOrdering, showZeroPrompts).map(([id, wp], idx) => {
        const text = replaceAliasesWithSlotValue(wp.text, `${seed}${id}${idx}`)
        return `${text}::${getDisplayWeight(
            activePrompt,
            parseInt(id)
        )}`;
    })
        .join(" ");

    const promptTextList = getPromptList(activePrompt, useWeightOrdering, showZeroPrompts).map(([id, wp], idx) => replaceAliasesWithSlotValue(wp.text, `${seed}${id}${idx}`));
    if (outputMode === OutputMode.Single) {
        const promptText = joinSentencesAndFragments(promptTextList);
        console.log(promptText);
        return promptText;
    }

    return promptTextList.join('\n');
}