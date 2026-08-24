<script lang="ts">
	import { autoregressiveState } from './index';

	$: history = $autoregressiveState.history;

	const getProbColor = (prob: number) => {
		if (prob >= 0.5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
		if (prob >= 0.2) return 'bg-blue-100 text-blue-800 border-blue-300';
		if (prob >= 0.05) return 'bg-amber-100 text-amber-800 border-amber-300';
		return 'bg-rose-100 text-rose-800 border-rose-300';
	};
</script>

{#if history.length > 0}
	<div class="mt-3 rounded-lg border border-gray-100 bg-white/90 p-3 shadow-sm">
		<div class="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500">
			<span>Generált tokenfolyam (Idővonal & Valószínűség)</span>
			<span class="text-[10px] text-gray-400">({history.length} új token hozzáfűzve)</span>
		</div>
		<div class="flex flex-wrap gap-1.5">
			{#each history as step, idx}
				<div
					class="group relative flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs shadow-2xs transition-all hover:scale-105 {getProbColor(step.probability)}"
				>
					<span class="font-bold">{step.tokenText.replace(/ /g, '␣')}</span>
					<span class="text-[10px] opacity-75">({(step.probability * 100).toFixed(0)}%)</span>

					<!-- Tooltip on hover -->
					<div class="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg group-hover:block z-20">
						Lépés #{step.stepIndex} | Token ID: {step.tokenId} | P = {(step.probability * 100).toFixed(2)}%
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
