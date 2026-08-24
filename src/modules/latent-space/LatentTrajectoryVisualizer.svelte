<script lang="ts">
	import { trajectoryState, updateLatentTrajectory } from './index';
	import { modelData } from '~/store';
	import { onMount } from 'svelte';

	let isExpanded = false;
	let hoveredLayer: number | null = null;

	$: if ($modelData) {
		updateLatentTrajectory();
	}

	onMount(() => {
		updateLatentTrajectory();
	});

	$: points = $trajectoryState;
	$: pathD = points.length > 0
		? `M ${points.map(p => `${p.vector2D[0]},${p.vector2D[1]}`).join(' L ')}`
		: '';
</script>

<div class="relative">
	<!-- Trigger Pill -->
	<button
		type="button"
		class="latent-trajectory-btn flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white/95 px-3 py-2 text-xs font-semibold text-sky-900 shadow-2xs transition hover:bg-sky-50 focus:outline-none select-none"
		on:click={() => (isExpanded = !isExpanded)}
	>
		<span class="flex h-4 w-4 items-center justify-center rounded bg-sky-600 text-white text-[10px]">
			🌌
		</span>
		<span>Latent Trajectory (2D PCA)</span>
		<svg
			class="h-3.5 w-3.5 text-sky-400 transition-transform duration-200"
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
		<div class="absolute left-0 top-full z-50 mt-2 w-[600px] max-w-[95vw] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-all">
			<!-- Header -->
			<div class="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
				<div>
					<h4 class="text-sm font-bold text-gray-800 flex items-center gap-1.5">
						<span>🌌 Latent Space Trajectory</span>
						<span class="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-800 font-semibold">2D Semantic Projection</span>
					</h4>
					<p class="text-xs text-gray-500">How token vector representations migrate through intermediate layers</p>
				</div>
				<button
					type="button"
					class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
					on:click|stopPropagation={() => (isExpanded = false)}
				>
					✕
				</button>
			</div>

			<!-- 2D SVG Canvas -->
			<div class="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-2 shadow-inner">
				<svg viewBox="0 0 600 360" class="h-64 w-full">
					<!-- Semantic Background Regions -->
					<circle cx="90" cy="270" r="70" fill="#3b82f6" opacity="0.15" />
					<text x="50" y="330" fill="#60a5fa" font-size="11" font-weight="bold">1. Syntactic Input Space</text>

					<circle cx="280" cy="180" r="75" fill="#8b5cf6" opacity="0.15" />
					<text x="220" y="245" fill="#c084fc" font-size="11" font-weight="bold">2. Contextual Attention (QKV)</text>

					<circle cx="510" cy="100" r="65" fill="#10b981" opacity="0.15" />
					<text x="440" y="55" fill="#34d399" font-size="11" font-weight="bold">3. Target Logit Basin</text>

					<!-- Animated Connecting Path -->
					{#if pathD}
						<path
							d={pathD}
							fill="none"
							stroke="url(#gradient-path)"
							stroke-width="3"
							stroke-dasharray="6,4"
							class="animate-pulse"
						/>
					{/if}

					<!-- Gradient definition -->
					<defs>
						<linearGradient id="gradient-path" x1="0%" y1="100%" x2="100%" y2="0%">
							<stop offset="0%" stop-color="#3b82f6" />
							<stop offset="50%" stop-color="#a855f7" />
							<stop offset="100%" stop-color="#10b981" />
						</linearGradient>
					</defs>

					<!-- Layer Nodes -->
					{#each points as point}
						<g
							class="cursor-pointer"
							on:mouseenter={() => (hoveredLayer = point.layerIdx)}
							on:mouseleave={() => (hoveredLayer = null)}
						>
							<!-- Invisible larger hit area to ensure smooth, flicker-free hover -->
							<circle
								cx={point.vector2D[0]}
								cy={point.vector2D[1]}
								r="16"
								fill="transparent"
							/>
							<!-- Visible node circle -->
							<circle
								cx={point.vector2D[0]}
								cy={point.vector2D[1]}
								r={hoveredLayer === point.layerIdx ? 6.5 : 4.5}
								fill={point.layerIdx === 1 ? '#38bdf8' : point.layerIdx === 12 ? '#34d399' : '#c084fc'}
								stroke={hoveredLayer === point.layerIdx ? '#ffffff' : '#e2e8f0'}
								stroke-width={hoveredLayer === point.layerIdx ? '2' : '1.5'}
								class="pointer-events-none transition-all duration-150"
							/>
							<!-- Subtle glow ring on hover -->
							{#if hoveredLayer === point.layerIdx}
								<circle
									cx={point.vector2D[0]}
									cy={point.vector2D[1]}
									r="11"
									fill="none"
									stroke={point.layerIdx === 1 ? '#38bdf8' : point.layerIdx === 12 ? '#34d399' : '#c084fc'}
									stroke-width="1.5"
									opacity="0.7"
									class="pointer-events-none"
								/>
							{/if}
							<!-- Node label -->
							<text
								x={point.vector2D[0] + 9}
								y={point.vector2D[1] + 3}
								fill={hoveredLayer === point.layerIdx ? '#38bdf8' : '#ffffff'}
								font-size={hoveredLayer === point.layerIdx ? '10' : '9'}
								font-family="monospace"
								font-weight="bold"
								class="pointer-events-none select-none transition-colors duration-150"
							>
								L{point.layerIdx}
							</text>
						</g>
					{/each}
				</svg>

				<!-- Hover details HUD -->
				<div class="mt-2 flex min-h-[2.25rem] items-center justify-between rounded bg-slate-800/90 px-3 py-1.5 text-xs text-white">
					<div>
						{#if hoveredLayer !== null}
							{@const pt = points[hoveredLayer - 1]}
							<span class="font-bold text-sky-400">Layer {hoveredLayer}:</span>
							<span class="ml-1 text-gray-200">{pt?.clusterLabel}</span>
						{:else}
							<span class="text-gray-400">💡 Hover over layer nodes (L1–L12) to inspect stage details</span>
						{/if}
					</div>
					<span class="font-mono text-[10px] text-gray-400">Dim: 768d ➔ 2D PCA</span>
				</div>
			</div>
		</div>
	{/if}
</div>
