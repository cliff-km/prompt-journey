import { writable } from 'svelte/store';
import type { Embeddings } from '../types';

export const activeEmbeddings = writable({} as Embeddings);