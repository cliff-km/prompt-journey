import { get, writable, derived } from 'svelte/store'
import type { PromptEvent, PromptHistory } from '../types';

const STORE_KEY = 'promptHistory';

export function storablePromptHistory() {
    const store = writable([] as PromptHistory);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    const load = ((isBrowser && JSON.parse(localStorage[STORE_KEY] || "[]")) || []).map((m: PromptEvent) => ({...m, date: new Date(m.date)}));
    set(load);

    return {
        subscribe,
        add: (m: PromptEvent) => {
            if (!m || !isBrowser) return;
            const current = get(store);
            
            const newHistory = [...current, m];
            localStorage[STORE_KEY] = JSON.stringify(newHistory);
            set(newHistory);
        },
        update: (h: PromptHistory) => {
            if (!h || !isBrowser) return;
            localStorage[STORE_KEY] = h;
            set(h);
        },
        get: () => {
            const m = get(store);
            return m;
        },
        remove: (id: string) => {
            if (!isBrowser) return;
            const current = get(store);
            const newHistory = current.filter((m) => m.id !== id);
            localStorage[STORE_KEY] = JSON.stringify(newHistory);
            set(newHistory);
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set([]);
        },
    };
}

export const promptHistory = storablePromptHistory();