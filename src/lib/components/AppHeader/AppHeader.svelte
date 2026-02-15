<script lang="ts">
	import { theme } from '$lib/stores/theme-store';

	function toggleTheme() {
		$theme = $theme === 'neon' ? 'xp' : 'neon';
	}
</script>

<header class="app-header">
	<a href="/" class="app-logo neon-text">PORKER</a>
	<button class="theme-toggle" onclick={toggleTheme}>
		{$theme === 'neon' ? 'XP Theme' : 'Neon Theme'}
	</button>
</header>

<style>
	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1.5rem;
		border-bottom: 1px solid var(--color-surface);
	}

	:global([data-theme='xp']) .app-header {
		background: linear-gradient(180deg, #0a246a 0%, #3a6ea5 40%, #0a246a 100%);
		border-bottom: 2px solid #003087;
	}

	.app-logo {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--color-neon-pink);
		text-decoration: none;
		letter-spacing: 4px;
		transition: opacity 0.2s ease;
	}

	.app-logo:hover {
		opacity: 0.8;
	}

	:global([data-theme='xp']) .app-logo {
		color: #ffffff;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		font-weight: bold;
	}

	.theme-toggle {
		background: var(--color-surface);
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-muted);
		padding: 0.3rem 0.8rem;
		border-radius: var(--radius);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		color: var(--color-text);
		border-color: var(--color-text);
	}

	:global([data-theme='xp']) .theme-toggle {
		background: linear-gradient(180deg, #ffffff 0%, #ece9d8 90%, #d6d2c2 100%);
		border: 1px solid var(--color-button-dk-shadow);
		color: var(--color-text);
		box-shadow:
			inset 1px 1px 0 var(--color-button-highlight),
			inset -1px -1px 0 var(--color-button-shadow);
	}

	:global([data-theme='xp']) .theme-toggle:hover {
		background: linear-gradient(180deg, #fff4cf 0%, #ffd870 100%);
	}
</style>
