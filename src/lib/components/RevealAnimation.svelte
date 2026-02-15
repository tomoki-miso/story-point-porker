<script lang="ts">
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

	$effect(() => {
		if (show) {
			particles = Array.from({ length: 40 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				color: neonColors[Math.floor(Math.random() * neonColors.length)],
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
	<div class="reveal-overlay">
		{#each particles as p (p.id)}
			<div
				class="particle"
				style="
					left: {p.x}%;
					top: {p.y}%;
					background: {p.color};
					width: {p.size}px;
					height: {p.size}px;
					animation-delay: {p.delay}s;
					animation-duration: {p.duration}s;
					box-shadow: 0 0 {p.size}px {p.color};
				"
			></div>
		{/each}
		<div class="reveal-text neon-text">OPEN!</div>
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

	.reveal-text {
		font-family: var(--font-display);
		font-size: 6rem;
		color: var(--color-neon-pink);
		animation: reveal-text-pop 0.6s ease-out forwards;
		letter-spacing: 12px;
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
