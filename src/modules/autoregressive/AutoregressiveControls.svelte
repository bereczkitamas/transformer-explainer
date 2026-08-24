<script lang="ts">
	import {
		autoregressiveState,
		startGeneration,
		pauseGeneration,
		stepGeneration,
		resetGeneration
	} from './index';
	import { inputText, isModelRunning } from '~/store';

	export let initialText = '';

	$: isPlaying = $autoregressiveState.isPlaying;
	$: currentStep = $autoregressiveState.currentStep;
	$: maxTokens = $autoregressiveState.maxTokens;
	$: delay = $autoregressiveState.generationDelayMs;

	const handlePlayPause = () => {
		if (isPlaying) {
			pauseGeneration();
		} else {
			startGeneration();
		}
	};

	const handleStep = () => {
		stepGeneration();
	};

	const handleReset = () => {
		resetGeneration(initialText);
	};
</script>

<div class="autoregressive-toolbar flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-3 shadow-sm transition-all duration-300">
	<!-- Left: Control Actions -->
	<div class="flex items-center gap-2">
		<button
			type="button"
			class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
			class:bg-emerald-600={!isPlaying}
			class:hover:bg-emerald-700={!isPlaying}
			class:bg-amber-500={isPlaying}
			class:hover:bg-amber-600={isPlaying}
			on:click={handlePlayPause}
			disabled={$isModelRunning && !isPlaying}
		>
			{#if isPlaying}
				<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1"></rect>
					<rect x="14" y="4" width="4" height="16" rx="1"></rect>
				</svg>
				<span>Szünet (Pause)</span>
			{:else}
				<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"></path>
				</svg>
				<span>Lejátszás (Play)</span>
			{/if}
		</button>

		<button
			type="button"
			class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
			on:click={handleStep}
			disabled={isPlaying || $isModelRunning}
			title="Pontosan 1 új token generálása"
		>
			<svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
			</svg>
			<span>+1 Lépés (Step)</span>
		</button>

		<button
			type="button"
			class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus:outline-none"
			on:click={handleReset}
			title="Visszaállítás az eredeti szövegre"
		>
			<svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
			</svg>
			<span>Alaphelyzet</span>
		</button>
	</div>

	<!-- Center: Step Indicator -->
	<div class="flex items-center gap-2 text-xs font-medium text-gray-600">
		<span class="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
			Lépés: {currentStep} / {maxTokens}
		</span>
		{#if isPlaying}
			<span class="relative flex h-2.5 w-2.5">
				<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
			</span>
		{/if}
	</div>

	<!-- Right: Speed Slider -->
	<div class="flex items-center gap-2">
		<label for="speed-slider" class="text-xs font-medium text-gray-500">Sebesség:</label>
		<input
			id="speed-slider"
			type="range"
			min="150"
			max="1500"
			step="50"
			bind:value={$autoregressiveState.generationDelayMs}
			class="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
		/>
		<span class="w-12 text-right font-mono text-xs text-gray-600">
			{(1000 / delay).toFixed(1)} t/s
		</span>
	</div>
</div>

<style>
	.autoregressive-toolbar {
		backdrop-filter: blur(8px);
	}
</style>
