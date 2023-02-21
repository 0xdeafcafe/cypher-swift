import { decodeCypherKey } from './cipher-key.js';
import BitManager, { SeekOrigin } from './lib/bit-manager';
import { randomInteger } from './lib/crypto.js';

export async function encryptText(encodedCipherKey: string, input: string): Promise<string> {
	const textEncoder = new TextEncoder();
	const encodedText = textEncoder.encode(input);

	return await encrypt(encodedCipherKey, encodedText);
}

export async function decryptText(encodedCipherKey: string, input: string): Promise<string> {
	const decrypted = await decrypt(encodedCipherKey, input);

	const textDecoder = new TextDecoder();

	// 3.8 - Decode binary data into utf-8 string
	const decodedText = textDecoder.decode(decrypted);

	return decodedText;
}

export async function encrypt(encodedCipherKey: string, input: Uint8Array): Promise<string> {
	// 3.1 - Decode cipher key
	const cipherKey = await decodeCypherKey(encodedCipherKey);

	// 3.2 & 3.3.0 - Accept input & create bit manager
	const bitManager = new BitManager();

	// 3.3.1 - Write empty padding byte
	bitManager.writeUint8(0x00);

	// 3.3.2 - Write magic byte
	bitManager.writeUint8(0x69);

	// 3.3.3 - Write inputted bits
	input.forEach(b => bitManager.writeUint8(b));

	// 3.4.0 & 3.4.1 - Calculate bit padding length
	const paddingLengthByte = 10 - (bitManager.length % 10);

	// 3.4.1 & 3.4.2 - Write padding length
	if (paddingLengthByte !== 10) {
		bitManager.seekToOffset(0x00, SeekOrigin.Begin);
		bitManager.writeUint8(paddingLengthByte);
		bitManager.seekToOffset(0x00, SeekOrigin.End);

		// 3.4.3 - Write random padding bytes
		for (let i = 0; i < paddingLengthByte; i++)
			bitManager.writeRandomBit();
	}

	// 3.5 - Create lyric array
	const lyrics: string[] = [];

	// 3.6.1 - Reset offset to 0
	bitManager.seekToOffset(0x00, SeekOrigin.Begin);

	// pre-3.6.3 - Storage for verse length
	let nextVerseLength = randomInteger(5, 7);

	// 3.6.2 - Read all `uint10`'s
	for (let i = 0; i >= 0; i++) {
		if (paddingLengthByte == 0x00) {
			// If there is no padding, just check when the end is reached
			if (bitManager.offset >= bitManager.length - 1)
				break;
		} else {
			// If there is padding, check when that is all that is left
			if (bitManager.offset >= bitManager.length - (1 + paddingLengthByte))
				break;
		}

		// 3.6.2 - Read lyrics
		lyrics.push(cipherKey[bitManager.readUint10()]);

		// 3.6.3 - Add random verses
		if (i !== 0 && i % nextVerseLength === 0) {
			lyrics.push('');

			nextVerseLength = randomInteger(5, 7);
		}
	}

	// 3.7 - Return lyrics
	return lyrics.join('\n');
}

export async function decrypt(encodedCipherKey: string, input: string): Promise<Uint8Array> {
	// 4.1 - Decode cipher key
	const cipherKey = await decodeCypherKey(encodedCipherKey);

	// 4.1.1 - Create inverse lookup map
	const inverseLyricMap = cipherKey.reduce<Record<string, number>>((acc, val, index) => ({
		...acc,
		[val]: index,
	}), {});

	// 4.2.0 & 4.2.1 - Sanitise input
	const lyrics = input.split('\n').map(l => l.trim()).filter(Boolean);

	// 4.2.2 - Get bespoke lyric indices
	const bespokeLyricIndices = lyrics.map(l => inverseLyricMap[l]);

	// 4.3.0 - Create bit array
	const bitManager = new BitManager();

	// 4.3.1 - Write all bespoke lyric indices
	bespokeLyricIndices.forEach(i => bitManager.writeUint10(i));

	// 4.4.0 - Reset offset
	bitManager.seekToOffset(0x00, SeekOrigin.Begin);

	// 4.4.1 - Read padding length byte
	const paddingLengthByte = bitManager.readUint8();

	// 4.4.2 - Read & validate magic byte
	if (bitManager.readUint8() !== 0x69)
		throw new Error('Invalid magic byte');

	// 4.5.0
	const byteData: number[] = [];

	// 4.6.0 - Remove padding bit randomness
	if (paddingLengthByte !== 0x00) {
		bitManager.seekToOffset(-paddingLengthByte, SeekOrigin.End);

		for (let i = 0; i < paddingLengthByte; i++)
			bitManager.writeBit(false);
	}

	// 4.7.0 - Reset to binary data start
	bitManager.seekToOffset(0x10, SeekOrigin.Begin);

	// 4.7.1 - Read binary data
	while (bitManager.offset <= (bitManager.length - 1) - paddingLengthByte)
		byteData.push(bitManager.readUint8());

	// 4.9 - Return the decrypted data
	return new Uint8Array(byteData);
}
