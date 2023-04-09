import { writable, derived } from 'svelte/store';
import { replaceAliasesWithSlotValue } from "$lib/slots";
import { seedStore, seed } from "./slotSets";

export function createInstructions(directives: string, metaprompt: string) {
    return `${directives}

Use the following text to generate output based on the instructions above:

${metaprompt}}`;
}

export const instructions = writable("");
export const dealiasedInstructions = derived([instructions, seedStore], ($values) => {
    return replaceAliasesWithSlotValue($values[0], $values[1]);
});
