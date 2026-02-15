<script lang="ts">
	import { theme } from '$lib/stores/theme-store';

	interface Props {
		show: boolean;
	}

	let { show }: Props = $props();

	interface Particle {
		id: number;
		x: number;
		y: number;
		color: string;
		size: number;
		delay: number;
		duration: number;
	}

	let particles = $state<Particle[]>([]);

	const neonColors = [
		'#ff2d95', '#00d4ff', '#39ff14', '#ffe600', '#ff6600', '#bf00ff', '#ffd700'
	];

	const xpColors = [
		'#0054E3', '#4E98FF', '#37B337', '#ECE9D8', '#316AC5', '#FFFFFF', '#EBB214'
	];

	const colors = $derived($theme === 'xp' ? xpColors : neonColors);
	const isXp = $derived($theme === 'xp');

	$effect(() => {
		if (show) {
			particles = Array.from({ length: 40 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				color: colors[Math.floor(Math.random() * colors.length)],
				size: Math.random() * 12 + 4,
				delay: Math.random() * 0.5,
				duration: Math.random() * 1 + 0.5
			}));

			setTimeout(() => {
				particles = [];
			}, 2000);
		}
	});
</script>

{#if particles.length > 0}
	<div class="reveal-overlay" class:xp-overlay={isXp}>
		{#each particles as p (p.id)}
			<div
				class="particle"
				class:xp-particle={isXp}
				style="
					left: {p.x}%;
					top: {p.y}%;
					background: {p.color};
					width: {p.size}px;
					height: {p.size}px;
					animation-delay: {p.delay}s;
					animation-duration: {p.duration}s;
					{isXp ? '' : `box-shadow: 0 0 ${p.size}px ${p.color};`}
				"
			></div>
		{/each}
		<div class="reveal-text" class:neon-text={!isXp} class:xp-reveal-text={isXp}>OPEN!</div>
	</div>
{/if}

<style>
	.reveal-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.xp-overlay {
		background: rgba(0, 120, 215, 0.15);
	}

	.reveal-text {
		font-family: var(--font-display);
		font-size: 6rem;
		color: var(--color-neon-pink);
		animation: reveal-text-pop 0.6s ease-out forwards;
		letter-spacing: 12px;
	}

	.xp-reveal-text {
		background: var(--color-button-face);
		border: 2px solid var(--color-neon-pink);
		border-radius: 8px;
		padding: 0.5rem 2rem;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
		color: var(--color-neon-pink);
		font-family: var(--font-display);
		font-size: 4rem;
	}

	@keyframes reveal-text-pop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		60% {
			transform: scale(1.3);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	.particle {
		position: absolute;
		border-radius: 50%;
		animation: particle-burst 1s ease-out forwards;
	}

	.xp-particle {
		border-radius: 2px;
		box-shadow: none;
	}

	@keyframes particle-burst {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: scale(2) translateY(-50px);
			opacity: 0;
		}
	}
</style>
