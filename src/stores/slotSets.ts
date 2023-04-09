import type { SlotSet, SlotSetDict } from '../types';
import { get, writable, derived } from 'svelte/store'

const storeKey = 'slotSet';

export function storableSlotSets() {
    const store = writable({} as SlotSetDict);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith(storeKey)) {
            const id = key.split('_')[1];
            acc[id] = JSON.parse(localStorage[key]) as SlotSet;
        }
        return acc;
    }, {} as SlotSetDict)) || {});

    return {
        subscribe,
        update: (id: string, p: SlotSet) => {
            const currentStore = get(store);
            const currentDoc = currentStore[id] || {};
            const updatedDoc = { ...currentDoc, ...p };

            isBrowser && (localStorage[`${storeKey}_${id}`] = JSON.stringify(updatedDoc));

            const updatedStore = { ...currentStore, [id]: updatedDoc };
            set(updatedStore);
        },
        get: (id: string) => {
            const currentStore = get(store);

            return currentStore[id];
        },
        getAll: () => {
            const currentStore = get(store);

            return currentStore;
        },
        delete: (id: string) => {
            isBrowser && delete localStorage[`${storeKey}_${id}`];

            const newStore = { ...get(store) };
            delete newStore[id];

            set(newStore);
        },
    };
}

export const slotSetStore = storableSlotSets();

export const slotSets = derived(slotSetStore, $slotSetStore => get(slotSetStore))

function getRandomSeed() {
    return (Math.random() * 1000000).toFixed(0);
}

export function storableSeed() {
    const store = writable(getRandomSeed());
    const { subscribe, set } = store;

    return {
        subscribe,
        get: () => {
            const currentStore = get(store);

            return currentStore;
        },
        shuffle: () => {
            set(getRandomSeed());
        },
    };
}

export const seedStore = storableSeed();

export const seed = derived(seedStore, $seedStore => get(seedStore));