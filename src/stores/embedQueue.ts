import { writable } from 'svelte/store';

export const embedQueue = writable({} as Record<string, boolean>);