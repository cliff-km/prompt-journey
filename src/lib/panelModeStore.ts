import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'panelModeStore';

export function storablePanelMode() {
    const store = writable("select");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateMode: (m) => {
            if (!m || !isBrowser) return;
            localStorage[STORE_KEY] = m;
            set(m);
        },
        getMode: () => {
            const m = get(store);
            return m;
        },
        resetMode: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("select");
        },
    };
}

export const panelModeStore = storablePanelMode();


export const panelMode = derived(panelModeStore, $panelModeStore => get(panelModeStore))