import { derived } from 'svelte/store';
import { replaceAliasesWithSlotValue } from "$lib/slots";
import { seed } from "./slotSets";
import { directiveText } from './directiveText';
import { metaPrompt } from './metaPrompt';

export function createInstructions(directives: string, metaprompt: string) {
    return `${directives}

Use the following text to generate output based on the instructions above:

${metaprompt}`;
}

export const dealiasedInstructions = derived([directiveText, metaPrompt, seed], ($values) => {
    return replaceAliasesWithSlotValue(createInstructions($values[0], $values[1]), $values[2]);
});
