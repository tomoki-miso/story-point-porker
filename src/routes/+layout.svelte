<script lang="ts">
	import favicon from '$lib/assets/iruka.svg';
	import '../app.css';
	import { theme } from '$lib/stores/theme-store';
	import { browser } from '$app/environment';
	import XpAssistant from '$lib/components/XpAssistant.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';

	let { children } = $props();

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', $theme);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppHeader />
{@render children()}
<XpAssistant />
