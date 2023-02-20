// import {
// 	generateCypherKey,
// 	decodeCypherKey,
// 	decodeText,
// 	encodeCypherKey,
// 	encodeText,
// } from '@cypher-swift/lib';

type ScreenView = 'encode' | 'decode' | 'home';

let inActiveTransition: boolean = false;

document.querySelector('#btn-encode')!.addEventListener('click', () =>
	transitionToScreen('encode'),
);
// document.querySelector('#btn-decode')!.addEventListener('click', () =>
// 	transitionToScreen('decode'),
// );

async function transitionToScreen(screenView: ScreenView) {
	// Don't bother transitioning if we're in an active one
	if (inActiveTransition)
		return;

	inActiveTransition = true;

	// TODO(afr): Handle `home` screen view

	// Insert the record
	document.querySelector('.album-record')?.classList.remove('ejecting');
	document.querySelector('.album-record')?.classList.add('playing');

	// Wait for animation to finish
	await delay(250);

	// Fade away album listing & Slide "Cypher Swift" to the bottom
	document.querySelector('.album-listing')?.classList.add('hidden');
	document.querySelector('.album-sleave')?.classList.add('app-view');

	// Wait for animations to finish
	await delay(500);

	// Fade in decode or encode flows
}

async function delay(ms: number) {
	return new Promise(resolve => window.setTimeout(resolve, ms));
}
