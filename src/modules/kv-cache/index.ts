import { writable } from 'svelte/store';
import type { KVCacheState } from './types';

export const kvCacheState = writable<KVCacheState>({
	enabled: true,
	layers: [],
	totalSavedOps: 0,
	memoryUsageBytes: 0
});

export * from './types';
