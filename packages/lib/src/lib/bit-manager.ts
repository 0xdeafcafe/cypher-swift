import { randomInteger } from "./crypto";

export enum SeekOrigin {
	Begin,
	Current,
	End,
}

export default class BitManager {
	private internalBits: boolean[] = [];
	private internalOffset: number = 0;

	constructor(arr?: Uint8Array) {
		if (!arr)
			return;

		// Populate internal data if provided
		arr.forEach(b => this.writeUint8(b));

		// Reset offset to start
		this.seekToOffset(0, SeekOrigin.Begin);
	}

	get offset() {
		return this.internalOffset;
	}

	get bits() {
		return this.internalBits;
	}

	get length() {
		return this.internalBits.length;
	}

	readBit(): boolean {
		if (this.offset > this.length)
			throw new RangeError('Offset out of bounds');

		return this.internalBits[this.internalOffset];
	}

	writeBit(bit: boolean) {
		this.internalBits[this.internalOffset] = bit;
		this.seekToOffset(1, SeekOrigin.Current);
	}

	writeRandomBit() {
		const randomBit = Boolean(randomInteger(0, 1));

		this.internalBits[this.internalOffset] = randomBit;
		this.seekToOffset(1, SeekOrigin.Current);
	}

	readUint8(): number {
		return this.readBitsAsNumber(8);
	}

	writeUint8(num: number) {
		if (num < 0) throw new RangeError('Uint8 can not be negative');
		if (num > 255) throw new RangeError('Uint8 exceeds max value');

		this.writeNumberAsBits(num, 8);
	}

	readUint10(): number {
		return this.readBitsAsNumber(10);
	}

	writeUint10(num: number) {
		if (num < 0) throw new RangeError('Uint10 can not be negative');
		if (num > 1023) throw new RangeError('Uint10 exceeds max value');

		this.writeNumberAsBits(num, 10);
	}

	seekToOffset(offset: number, seekOrigin = SeekOrigin.Begin): number {
		let newOffset = null;

		switch (seekOrigin) {
			case SeekOrigin.Begin:
				newOffset = offset;
				break;

			case SeekOrigin.Current:
				newOffset = this.offset + offset;
				break;

			case SeekOrigin.End:
				newOffset = (this.length - 1) + offset;
				break;

			default:
				throw new Error('Unknown SeekOrigin option specified');
		}

		if (newOffset < 0)
			throw new RangeError('Proposed offset is less than 0');

		this.internalOffset = newOffset;

		return newOffset;
	}

	toUint8Array(): Uint8Array {
		const out: number[] = [];

		if (this.length % 8 !== 0)
			throw new RangeError('Bit alignment does not match 8 bits');

		for (let i = 0; i < this.length; i+= 8) {
			let byte = 0x00;

			for (let bi = 0; bi < 8; bi++) {
				const bit = this.bits[i + bi];

				if (bit)
					byte |= (1 << bi);
			}

			out.push(byte);
		}

		return new Uint8Array(out);
	}

	private writeNumberAsBits(num: number, bitLength: number): void {
		const binaryString = num.toString(2).split('').reverse();

		for (let i = 0; i < bitLength; i++) {
			const bit = binaryString[i] || '0';

			this.internalBits[this.offset] = bit === '1';
			this.seekToOffset(1, SeekOrigin.Current);
		}
	}

	private readBitsAsNumber(bitLength: number): number {
		// Allow this function to read out of range, but don't allow it to start reading out of range
		if (this.offset > this.length) throw new RangeError('Offset out of bounds');

		const slice = this.bits.slice(this.offset, this.offset + bitLength);
		const binaryString = slice.map(b => b ? '1' : '0').reverse().join('');
		const value = parseInt(binaryString, 2);

		this.seekToOffset(bitLength, SeekOrigin.Current);

		return value;
	}
}
