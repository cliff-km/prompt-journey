import Rand, { PRNG } from 'rand-seed';
import { slotSetStore } from "../stores/slotSets";

export function getSlotAlias(name: string) {
    let alias = name.replace(/\s+/g, "_");
    alias = alias.toUpperCase();
    return "$" + alias;
}

export function validateSlotName(name: string) {
    const lengthValid = name.length > 0 && name.length < 32;
    const regexValid = /^[a-zA-Z0-9 ]+$/.test(name);
    const startValid = /^[a-zA-Z]/.test(name);
    const endValid = /[a-zA-Z0-9]$/.test(name);

    return lengthValid && regexValid && startValid && endValid;
}

function getByAlias() {
    const slotSets = slotSetStore.getAll();

    const slotSetsByAlias = Object.values(slotSets).reduce((acc, slotSet) => {
        const alias = getSlotAlias(slotSet.name);

        if (alias) {
            acc[alias] = [...slotSet.values];
        }

        return acc;
    }, {} as Record<string, string[]>);

    return slotSetsByAlias;
}

function shuffleWithSeed(byAlias: Record<string, string[]>, seed: string) {
    const rand = new Rand(seed);

    const shuffled = Object.entries(byAlias).reduce((acc, [alias, values]) => {
        acc[alias] = [...values].sort(() => rand.next() - 0.5);

        return acc;
    }, {} as Record<string, string[]>);

    return shuffled;
}

export function replaceAliasesWithSlotValue(input: string, seed: string) {
    let shuffledAliases = shuffleWithSeed(getByAlias(), seed);
    let output = input;

    for (const [alias, values] of Object.entries(shuffledAliases)) {
        if (values.length === 0) continue;
        let replaceCount = 0;
        while (output.includes(alias)) {
            if (replaceCount >= values.length) replaceCount = 0;
            output = output.replace(alias, values[replaceCount]);
            replaceCount++;
        }
    }

    return output;
}