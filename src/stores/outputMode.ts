import { get, writable, derived } from 'svelte/store'
import { OutputMode } from '../types';

const STORE_KEY = 'outputMode';

export function storableOutputMode() {
    const store = writable(OutputMode.Multi);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) ? localStorage[STORE_KEY] : OutputMode.Multi);

    return {
        subscribe,
        update: (o: OutputMode) => {
            if (!isBrowser) return;
            localStorage[STORE_KEY] = o;
            set(o);
        },
        get: () => {
            const m = get(store);
            return m;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set(OutputMode.Multi);
        },
    };
}

export const outputMode = storableOutputMode();