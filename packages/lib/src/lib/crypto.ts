import crypto from 'node:crypto';

export async function cryptoArrayShuffle<T>(array: Array<T>) {
	const randomIntegers: number[] = [];

	for (let i = array.length - 1; i > 0; i--)
		randomIntegers.push(randomInteger(0, i));

	// apply durstenfeld shuffle with previously generated random numbers
	for (let i = array.length - 1; i > 0; i--) {
		const j = randomIntegers[array.length - i - 1];
		const temp = array[i];

		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

// min and max are both inclusive
export function randomInteger(min: number, max: number) {
	const randomBuffer = new Uint32Array(1);

	crypto.getRandomValues(randomBuffer);

	const randomNumber = randomBuffer[0] / (0xffffffff + 1);
	const minCeil = Math.ceil(min);
	const maxFloor = Math.floor(max);

	return Math.floor(randomNumber * (maxFloor - minCeil + 1)) + minCeil;
}
