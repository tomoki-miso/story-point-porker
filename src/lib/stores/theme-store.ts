import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'neon' | 'xp';

const initial: Theme = browser ? ((localStorage.getItem('theme') as Theme) ?? 'neon') : 'neon';
export const theme = writable<Theme>(initial);

if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
	});
}
