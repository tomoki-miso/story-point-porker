<script lang="ts">
	import { theme } from '$lib/stores/theme-store';
	import irukaPng from '$lib/assets/iruka.png';
	import irukaSvg from '$lib/assets/iruka.svg';

	const images = [irukaPng, irukaSvg];

	const messages = [
		'それ、"簡単"って言う人、だいたい簡単じゃない説あるぽよ。',
		'"あとでやる"って言った瞬間、だいたい"やらない"に変換されるぽよ。',
		'スコープ増えてるのにポイント据え置きって、魔法使いぽよ？',
		'"予想外"って言う前に、リスク出ししとくとヒーローぽよ。',
		'ポイントは嘘つかないけど、人は嘘つくことあるぽよ。…誰とは言わないぽよ。',
		'それ、テストとレビュー込みでそのポイントぽよ？強気すぎて好きぽよ。',
		'"たぶん大丈夫"は祈りになりがちぽよ。根拠も添えると無敵ぽよ。',
		'それ、いいと思うぽよ。私の許可はいらないけどぽよ。',
		'ちょっと待って、今"賢そうなこと言った"よねぽよ？メモしたぽよ〜！',
		'できるできるぽよ。…できなかったら私が"ほらね"って言うぽよ。'
	];

	let currentMessage = $state(messages[Math.floor(Math.random() * messages.length)]);
	let currentImage = $state(images[Math.floor(Math.random() * images.length)]);

	$effect(() => {
		if ($theme !== 'xp') return;

		const interval = setInterval(() => {
			currentMessage = messages[Math.floor(Math.random() * messages.length)];
			currentImage = images[Math.floor(Math.random() * images.length)];
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

{#if $theme === 'xp'}
	<div class="assistant">
		<div class="speech-bubble">{currentMessage}</div>
		<img
			src={currentImage}
			alt="アシスタント"
			class="dolphin"
		/>
	</div>
{/if}

<style>
	.assistant {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 900;
		text-align: center;
	}

	.dolphin {
		width: 100px;
		height: auto;
		animation: float 3s ease-in-out infinite;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
	}

	.speech-bubble {
		background: #ffffcc;
		border: 1px solid #000;
		border-radius: 8px;
		padding: 8px 12px;
		font-size: 12px;
		font-family: 'Tahoma', sans-serif;
		margin-bottom: 8px;
		max-width: 200px;
		position: relative;
		animation: fadeIn 0.3s ease-in;
		color: #000;
	}

	.speech-bubble::after {
		content: '';
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid #ffffcc;
	}

	.speech-bubble::before {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
		border-top: 9px solid #000;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.dolphin {
			width: 60px;
		}
		.speech-bubble {
			max-width: 150px;
			font-size: 11px;
		}
	}
</style>
