import { get } from 'svelte/store';
import { autoregressiveState, type GenerationStep } from './index';
import { inputText, predictedToken, isModelRunning } from '~/store';
import { updateKVCacheOnStep, resetKVCache } from '../kv-cache';

let timer: ReturnType<typeof setTimeout> | null = null;
let isStepInProgress = false;

function waitUntilModelIdle(timeoutMs = 4000): Promise<void> {
	return new Promise((resolve) => {
		if (!get(isModelRunning)) {
			resolve();
			return;
		}
		let timeoutId: ReturnType<typeof setTimeout>;
		let unsubscribe: (() => void) | null = null;

		const cleanup = () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (unsubscribe) unsubscribe();
		};

		timeoutId = setTimeout(() => {
			cleanup();
			resolve();
		}, timeoutMs);

		unsubscribe = isModelRunning.subscribe((running) => {
			if (!running) {
				cleanup();
				resolve();
			}
		});
	});
}

function waitForNewPrediction(timeoutMs = 4000): Promise<void> {
	return new Promise((resolve) => {
		let timeoutId: ReturnType<typeof setTimeout>;
		let unsubscribe: (() => void) | null = null;
		let sawRunning = false;

		const cleanup = () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (unsubscribe) unsubscribe();
		};

		timeoutId = setTimeout(() => {
			cleanup();
			resolve();
		}, timeoutMs);

		unsubscribe = isModelRunning.subscribe((running) => {
			if (running) {
				sawRunning = true;
			} else if (sawRunning && !running) {
				cleanup();
				// Small tick for Svelte store reactive statements to propagate
				setTimeout(resolve, 30);
			}
		});
	});
}

export const stepGeneration = async () => {
	if (isStepInProgress) return;
	isStepInProgress = true;

	try {
		// 1. Wait until model finishes any current inference
		if (get(isModelRunning)) {
			await waitUntilModelIdle();
		}

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

		// 2. Prepare waiter for the NEXT forward pass
		const nextPredictionPromise = waitForNewPrediction();

		// 3. Trigger model forward pass
		inputText.set(nextText);

		// 4. Await forward pass completion before releasing lock
		await nextPredictionPromise;
	} finally {
		isStepInProgress = false;
	}
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

		await stepGeneration();

		const updatedState = get(autoregressiveState);
		if (updatedState.isPlaying && !updatedState.isPaused) {
			timer = setTimeout(runLoop, Math.max(100, updatedState.generationDelayMs));
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
	isStepInProgress = false;
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
