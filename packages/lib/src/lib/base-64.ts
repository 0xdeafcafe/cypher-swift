import { isBrowser } from './poly.js';

export function encodeWebsafeBase64(binaryData: Uint8Array): string {
	if (isBrowser) {
		const textDecoder = new TextDecoder();
		const binaryString = textDecoder.decode(binaryData);

		return btoa(binaryString).replace(/\//g, '_').replace(/\+/g, '-');
	}

	return Buffer.from(binaryData).toString('base64url');
}

export function decodeWebsafeBase64(encodedString: string): Uint8Array {
	if (isBrowser) {
		const binaryString = atob(encodedString.replace(/_/g, '/').replace(/-/g, '+'));
		const textEncoder = new TextEncoder();

		return textEncoder.encode(binaryString);
	}

	return Uint8Array.from(Buffer.from(encodedString, 'base64url'));
}
