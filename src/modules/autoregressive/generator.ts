import { get } from 'svelte/store';
import { autoregressiveState, type GenerationStep } from './index';
import { inputText, predictedToken, isModelRunning } from '~/store';
import { updateKVCacheOnStep, resetKVCache } from '../kv-cache';

let timer: ReturnType<typeof setTimeout> | null = null;

export const stepGeneration = async () => {
	const currentPred = get(predictedToken);
	const currentInput = get(inputText);
	const state = get(autoregressiveState);

	if (!currentPred || !currentPred.token) {
		return;
	}

	const nextText = currentInput + currentPred.token;
	const newStep: GenerationStep = {
		stepIndex: state.currentStep + 1,
		tokenId: currentPred.tokenId,
		tokenText: currentPred.token,
		probability: currentPred.probability,
		logits: [],
		timestamp: Date.now()
	};

	autoregressiveState.update((s) => ({
		...s,
		currentStep: s.currentStep + 1,
		history: [...s.history, newStep]
	}));

	updateKVCacheOnStep(state.currentStep + 1, nextText.length);

	inputText.set(nextText);
};

export const startGeneration = () => {
	autoregressiveState.update((s) => ({
		...s,
		isPlaying: true,
		isPaused: false
	}));

	const runLoop = async () => {
		const state = get(autoregressiveState);
		if (!state.isPlaying || state.isPaused) return;

		if (state.currentStep >= state.maxTokens) {
			pauseGeneration();
			return;
		}

		const running = get(isModelRunning);
		if (!running) {
			await stepGeneration();
		}

		const updatedState = get(autoregressiveState);
		if (updatedState.isPlaying && !updatedState.isPaused) {
			timer = setTimeout(runLoop, Math.max(200, updatedState.generationDelayMs));
		}
	};

	runLoop();
};

export const pauseGeneration = () => {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	autoregressiveState.update((s) => ({
		...s,
		isPlaying: false,
		isPaused: true
	}));
};

export const resetGeneration = (initialInput?: string) => {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	autoregressiveState.set({
		isPlaying: false,
		isPaused: false,
		currentStep: 0,
		maxTokens: 20,
		generationDelayMs: 600,
		history: []
	});
	resetKVCache();
	if (initialInput !== undefined) {
		inputText.set(initialInput);
	}
};
