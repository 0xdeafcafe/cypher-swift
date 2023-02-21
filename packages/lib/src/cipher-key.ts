import BitManager, { SeekOrigin } from './lib/bit-manager.js';
import lyricsList from './data/lyrics-list.json' assert { type: 'json' };
import { cryptoArrayShuffle } from './lib/crypto.js';
import { decodeWebsafeBase64, encodeWebsafeBase64 } from './lib/base-64.js';

const cipherLyricCount = 1024;

export async function generateCipherKey(): Promise<string> {
	// 1.1 & 1.2 - Read and clone master lyric list
	const masterLyricsList = lyricsList.slice(0, 1024);

	// 1.2.1 - Shuffle lyric list
	const shuffledLyricList = await cryptoArrayShuffle(masterLyricsList);

	// 1.3.0 - Create bit array
	const bitManager = new BitManager();

	// 1.3.1 - Write empty padding byte
	bitManager.writeUint8(0x00);

	// 1.3.2 - Write magic byte
	bitManager.writeUint8(0x13);

	// 1.3.3 - Write the bespoke lyric indices
	for (let i = 0; i < cipherLyricCount; i++) {
		const lyric = shuffledLyricList[i];
		const lyricIndex = lyricsList.findIndex(l => l === lyric);

		bitManager.writeUint10(lyricIndex);
	}

	// 1.4.0 & 1.4.1 - Calculate bit padding length
	const bitPaddingLength = 8 - (((2 * 8) + (cipherLyricCount * 10)) % 8);

	// 1.4.2 - Write bit padding length
	if (bitPaddingLength !== 8) {
		bitManager.seekToOffset(0x01, SeekOrigin.Begin);
		bitManager.writeUint8(bitPaddingLength);
		bitManager.seekToOffset(0x00, SeekOrigin.End);

		// 1.4.3 - Write padding bytes
		for (let i = 0; i < bitPaddingLength; i++)
			bitManager.writeRandomBit();
	}

	// 1.5.0 - Generate raw cipher key
	const rawCipherKey = bitManager.toUint8Array();

	// 1.6.0 - Generate encoded cipher key
	const encodedCipherKey = encodeWebsafeBase64(rawCipherKey);

	return encodedCipherKey;
}

export async function decodeCypherKey(encodedCipherKey: string): Promise<string[]> {
	// 2.1 & 2.2.0 - Accept and decode the cipher key
	const rawCipherKey = decodeWebsafeBase64(encodedCipherKey);

	// 2.3 - Open raw cypher key into a bit array
	const bitManager = new BitManager(rawCipherKey);

	// 2.2.1 - Read padding byte
	const paddingByte = bitManager.readUint8();

	// 2.2.2 - Read magic byte
	if (bitManager.readUint8() !== 0x13)
		throw new Error('Invalid magic byte');

	const bespokeLyricIndices: number[] = [];

	for (let i = 0; i >= 0; i++) {
		// 2.4.1
		if (paddingByte == 0x00) {
			// If there is no padding, just check when the end is reached
			if (bitManager.offset >= bitManager.length - 1)
				break;
		} else {
			// If there is padding, check when that is all that is left
			if (bitManager.offset >= bitManager.length - (1 + paddingByte))
				break;
		}

		// 2.4.0
		bespokeLyricIndices.push(bitManager.readUint10());
	}

	// 2.5 - Parse the master lyrics list
	const masterLyricsList = lyricsList.slice(0, 1024);
	const lyricList: string[] = [];

	// 2.6 - Read though bespoke lyrics
	for (let i = 0; i < bespokeLyricIndices.length; i++) {
		lyricList[i] = masterLyricsList[bespokeLyricIndices[i]];
	}

	// 2.7 - return lyric list
	return lyricList;
}
