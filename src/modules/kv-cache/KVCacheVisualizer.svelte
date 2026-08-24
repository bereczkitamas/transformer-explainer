<script lang="ts">
	import { kvCacheState, formatBytes, formatOps } from './index';
	import { autoregressiveState } from '../autoregressive';

	$: layers = $kvCacheState.layers;
	$: totalTokens = $autoregressiveState.currentStep + 1;
	$: memoryBytes = $kvCacheState.memoryUsageBytes;
	$: savedOps = $kvCacheState.totalSavedOps;

	let isExpanded = false;
</script>

<div class="relative">
	<!-- Trigger Header -->
	<button
		type="button"
		class="kv-cache-btn flex cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-2xs select-none hover:bg-slate-50 transition-all focus:outline-none"
		on:click={() => (isExpanded = !isExpanded)}
	>
		<div class="flex items-center gap-1.5">
			<span class="flex h-4 w-4 items-center justify-center rounded bg-indigo-600 text-white shadow-2xs text-[10px]">
				⚡
			</span>
			<span class="font-bold text-gray-800">KV Cache</span>
		</div>

		<div class="flex items-center gap-1.5">
			<span class="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700">
				RAM: {formatBytes(memoryBytes)}
			</span>
			<span class="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
				Saved: {formatOps(savedOps)}
			</span>
			<svg
				class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
				class:rotate-180={isExpanded}
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</div>
	</button>

	<!-- Floating Popover (Absolute Overlay) -->
	{#if isExpanded}
		<div class="absolute right-0 top-full z-50 mt-2 w-[480px] max-w-[90vw] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all">
			<div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
				<div>
					<h4 class="text-sm font-bold text-gray-800">KV Cache Memory Buffer</h4>
					<p class="text-xs text-gray-500">Storing Key-Value tensors across layers to eliminate O(N²) recalculation</p>
				</div>
				<button
					type="button"
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					on:click|stopPropagation={() => (isExpanded = false)}
				>
					✕
				</button>
			</div>

			<!-- Comparison Cards -->
			<div class="mb-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
				<div class="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900">
					<div class="font-bold flex items-center gap-1 text-amber-800">
						<span>❌ Naive Recalculation</span>
					</div>
					<p class="mt-1">
						Re-computes Q, K, V for <strong>all past tokens</strong> at every step. Complexity: <code class="bg-amber-100 px-1 rounded font-bold">O(N²)</code>.
					</p>
				</div>
				<div class="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900">
					<div class="font-bold flex items-center gap-1 text-emerald-800">
						<span>✅ KV Cache (Modern LLMs)</span>
					</div>
					<p class="mt-1">
						Past K and V vectors are retained in RAM. Only <strong>1 new token</strong> Query is computed. Complexity: <code class="bg-emerald-100 px-1 rounded font-bold">O(N)</code>.
					</p>
				</div>
			</div>

			<!-- Memory Tape -->
			<div class="rounded-lg border border-gray-100 bg-slate-50/80 p-2.5">
				<div class="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
					<span>12-Layer KV Memory Slots (L1 – L12)</span>
					<span class="font-mono text-[11px] text-gray-500">Buffer size: {totalTokens} tokens</span>
				</div>

				<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
					{#each Array(12) as _, layerIdx}
						<div class="flex items-center justify-between rounded border border-gray-200 bg-white px-2 py-1 text-xs shadow-2xs">
							<span class="font-semibold text-gray-700">L{layerIdx + 1}</span>
							<div class="flex items-center gap-1">
								<span class="rounded bg-blue-100 px-1 py-0.2 font-mono text-[9px] font-medium text-blue-800">
									K: {totalTokens}×64
								</span>
								<span class="rounded bg-purple-100 px-1 py-0.2 font-mono text-[9px] font-medium text-purple-800">
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
