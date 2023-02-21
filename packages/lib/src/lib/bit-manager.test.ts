import BitManager, { SeekOrigin } from './bit-manager';

test('Seek to offset works as `SeekOrigin.Begin`', () => {
	const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
	const bitManager = new BitManager(data);

	bitManager.seekToOffset(0x10, SeekOrigin.Begin);

	expect(bitManager.offset).toBe(0x10);
});

test('Seek to offset works as `SeekOrigin.Current`', () => {
	const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
	const bitManager = new BitManager(data);

	bitManager.seekToOffset(0x05, SeekOrigin.Begin);
	bitManager.seekToOffset(0x02, SeekOrigin.Current);

	expect(bitManager.offset).toBe(0x07);

	bitManager.seekToOffset(-0x03, SeekOrigin.Current);

	expect(bitManager.offset).toBe(0x04);
});

test('Seek to offset works as `SeekOrigin.End`', () => {
	const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
	const bitManager = new BitManager(data);

	bitManager.seekToOffset(-0x02, SeekOrigin.End);

	expect(bitManager.offset).toBe(bitManager.length - 0x03);
});

test('Seek to offset rejects unknown origin options', () => {
	const data = new Uint8Array();
	const bitManager = new BitManager(data);

	expect(() => bitManager.seekToOffset(0x02, 0x69)).toThrowError('Unknown SeekOrigin option specified');
});

test('Seek to offset rejects negative final offsets', () => {
	const data = new Uint8Array();
	const bitManager = new BitManager(data);

	expect(() => bitManager.seekToOffset(-0x20, SeekOrigin.Begin)).toThrowError('Proposed offset is less than 0');
});
