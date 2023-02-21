import { decodeWebsafeBase64, encodeWebsafeBase64 } from './base-64';

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
const input = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
const output = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjEyMzQ1Njc4OTA';

test('Encoding produces no non-websafe characters', () => {
	const encodedText = textEncoder.encode(input);
	const encoded = encodeWebsafeBase64(encodedText);

	expect(encoded).toStrictEqual(encodeURIComponent(encoded));
});

test('Encoded matches known output', () => {
	const encodedText = textEncoder.encode(input);
	const encoded = encodeWebsafeBase64(encodedText);

	expect(encoded).toStrictEqual(output);
});

test('Decoded matches known input', () => {
	const encodedText = textEncoder.encode(input);
	const decoded = decodeWebsafeBase64(output);
	
	expect(decoded).toStrictEqual(encodedText);
});
