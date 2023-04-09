import { derived } from 'svelte/store';
import { replaceAliasesWithSlotValue } from "$lib/slots";
import { seedStore, seed } from "./slotSets";
import { directiveText } from './directiveText';
import { metaPromptStore } from './metaPromptStore';

export function createInstructions(directives: string, metaprompt: string) {
    return `${directives}

Use the following text to generate output based on the instructions above:

${metaprompt}`;
}

export const dealiasedInstructions = derived([directiveText, metaPromptStore, seedStore], ($values) => {
    return replaceAliasesWithSlotValue(createInstructions($values[0], $values[1]), $values[2]);
});
