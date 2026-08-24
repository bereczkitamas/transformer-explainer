<script lang="ts">
	import { kvCacheState, formatBytes, formatOps } from './index';
	import { autoregressiveState } from '../autoregressive';

	$: layers = $kvCacheState.layers;
	$: totalTokens = $autoregressiveState.currentStep + 1;
	$: memoryBytes = $kvCacheState.memoryUsageBytes;
	$: savedOps = $kvCacheState.totalSavedOps;

	let isExpanded = false;
</script>

<div class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-300">
	<!-- Header -->
	<div
		class="flex cursor-pointer items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40 px-4 py-3 select-none hover:bg-slate-100/60"
		on:click={() => (isExpanded = !isExpanded)}
	>
		<div class="flex items-center gap-2.5">
			<span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
				</svg>
			</span>
			<div>
				<h4 class="text-sm font-bold text-gray-800">
					KV Cache Szimulátor & Memóriapuffer
				</h4>
				<p class="text-xs text-gray-500">
					Key-Value tenzorok tárolása az $O(N^2)$ újraszámítás elkerülésére
				</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<span class="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">
					RAM: {formatBytes(memoryBytes)}
				</span>
				<span class="rounded bg-emerald-50 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-700">
					Megspórolva: {formatOps(savedOps)}
				</span>
			</div>
			<svg
				class="h-5 w-5 text-gray-400 transition-transform duration-200"
				class:rotate-180={isExpanded}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</div>
	</div>

	<!-- Collapsible Content -->
	{#if isExpanded}
		<div class="border-t border-slate-100 p-4">
			<!-- Explanation Banner -->
			<div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div class="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
					<div class="font-bold flex items-center gap-1.5 text-amber-800">
						<span>❌ Hagyományos Újraszámítás</span>
					</div>
					<p class="mt-1">
						Minden új tokennél a modell <strong>minden korábbi szóra</strong> újból kiszámolja a Query, Key és Value mátrixokat. Időigény: <code class="bg-amber-100 px-1 rounded font-bold">O(N²)</code>.
					</p>
				</div>
				<div class="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
					<div class="font-bold flex items-center gap-1.5 text-emerald-800">
						<span>✅ KV Cache Gyorsítás (Modern LLM-ek)</span>
					</div>
					<p class="mt-1">
						A korábbi Key és Value vektorok a memóriában maradnak. Csak az <strong>1 db új token</strong> Query-jét kell kiszámolni. Időigény: <code class="bg-emerald-100 px-1 rounded font-bold">O(N)</code>.
					</p>
				</div>
			</div>

			<!-- Memory Tape Visualizer -->
			<div class="rounded-lg border border-gray-100 bg-slate-50/80 p-3">
				<div class="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
					<span>12 Rétegű KV Memóriasáv (Layer 1 – Layer 12)</span>
					<span class="font-mono text-[11px] text-gray-500">Puffer méret: {totalTokens} token slot</span>
				</div>

				<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each Array(12) as _, layerIdx}
						<div class="flex items-center justify-between rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs">
							<span class="font-semibold text-gray-700">L{layerIdx + 1}</span>
							<div class="flex items-center gap-1">
								<span class="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-blue-800">
									K: {totalTokens}×64
								</span>
								<span class="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-purple-800">
									V: {totalTokens}×64
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
