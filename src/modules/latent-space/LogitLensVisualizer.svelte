<script lang="ts">
	import { logitLensState, updateLogitLens } from './index';
	import { modelData } from '~/store';
	import { onMount } from 'svelte';

	let isExpanded = false;

	// Automatically update when model outputs change
	$: if ($modelData) {
		updateLogitLens();
	}

	onMount(() => {
		updateLogitLens();
	});

	const getLayerRole = (layer: number) => {
		if (layer <= 3) return { label: 'Szintaxis', color: 'bg-blue-100 text-blue-800' };
		if (layer <= 7) return { label: 'Kontextus', color: 'bg-indigo-100 text-indigo-800' };
		if (layer <= 10) return { label: 'Szemantika', color: 'bg-purple-100 text-purple-800' };
		return { label: 'Kimenet', color: 'bg-emerald-100 text-emerald-800' };
	};
</script>

<div class="relative">
	<!-- Trigger Pill -->
	<button
		type="button"
		class="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white/95 px-3 py-2 text-xs font-semibold text-purple-900 shadow-xs transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300 select-none"
		on:click={() => (isExpanded = !isExpanded)}
	>
		<span class="flex h-4 w-4 items-center justify-center rounded bg-purple-600 text-white text-[10px]">
			👁️
		</span>
		<span>Logit Lens (12 Réteg)</span>
		<svg
			class="h-3.5 w-3.5 text-purple-400 transition-transform duration-200"
			class:rotate-180={isExpanded}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
		</svg>
	</button>

	<!-- Floating Popover Overlay -->
	{#if isExpanded}
		<div class="absolute left-0 top-full z-50 mt-2 w-[480px] max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all">
			<!-- Header -->
			<div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
				<div>
					<h4 class="text-sm font-bold text-gray-800 flex items-center gap-1.5">
						<span>👁️ Logit Lens Műhely</span>
						<span class="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-800 font-semibold">GPT-2 Mélységi Elemzés</span>
					</h4>
					<p class="text-xs text-gray-500">Milyen szót jósolna a modell, ha az adott rétegből közvetlenül a kimenetre kötnénk?</p>
				</div>
				<button
					type="button"
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					on:click|stopPropagation={() => (isExpanded = false)}
				>
					✕
				</button>
			</div>

			<!-- 12 Layer Grid -->
			<div class="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
				{#each $logitLensState as layer}
					{@const role = getLayerRole(layer.layerIdx)}
					<div class="flex items-center gap-2 rounded-lg border border-gray-100 bg-slate-50/80 p-1.5 text-xs transition hover:bg-slate-100">
						<!-- Layer number and Role -->
						<div class="w-16 shrink-0 flex flex-col">
							<span class="font-bold text-gray-700">L{layer.layerIdx}</span>
							<span class="rounded text-[9px] font-medium px-1 {role.color}">{role.label}</span>
						</div>

						<!-- Winner prediction bar -->
						<div class="grow">
							{#if layer.topPredictions[0]}
								<div class="flex items-center justify-between font-mono text-xs">
									<span class="font-bold text-gray-900">{layer.topPredictions[0].token.replace(/ /g, '␣')}</span>
									<span class="text-[11px] text-gray-500 font-semibold">{(layer.topPredictions[0].probability * 100).toFixed(1)}%</span>
								</div>
								<div class="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
										style="width: {Math.max(5, layer.topPredictions[0].probability * 100)}%"
									></div>
								</div>
							{/if}
						</div>

						<!-- Secondary candidates -->
						<div class="w-32 shrink-0 flex flex-col text-[10px] text-gray-500 font-mono text-right">
							{#if layer.topPredictions[1]}
								<span>#2: {layer.topPredictions[1].token.replace(/ /g, '␣')} ({(layer.topPredictions[1].probability * 100).toFixed(0)}%)</span>
							{/if}
							{#if layer.topPredictions[2]}
								<span>#3: {layer.topPredictions[2].token.replace(/ /g, '␣')} ({(layer.topPredictions[2].probability * 100).toFixed(0)}%)</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Pedagogical footnote -->
			<div class="mt-3 rounded-md bg-purple-50 p-2 text-[11px] text-purple-900">
				💡 <strong>Megfigyelés:</strong> A korai rétegekben (L1–L3) a modell még csak a nyelvtani szerkezetet tippelgeti, majd a rétegeken át haladva a valószínűség fokozatosan rácsapódik a végleges szemantikai nyertesre.
			</div>
		</div>
	{/if}
</div>
