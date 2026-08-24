import { writable } from 'svelte/store';
import type { AutoregressiveState } from './types';

export const autoregressiveState = writable<AutoregressiveState>({
	isPlaying: false,
	isPaused: false,
	currentStep: 0,
	maxTokens: 20,
	generationDelayMs: 600,
	history: []
});

export * from './types';
