import { cancel, intro, isCancel, note, text } from '@clack/prompts';
import isValidFilename from 'valid-filename';
import { writeProfile } from '../config.js';
import * as cypherSwift from '@cypher-swift/lib';

export default async function generateCipherKey(name?: string): Promise<void> {
	intro('Cypher Swift - Generate cipher key');

	const finalName = name ?? await gatherName();
	const cipherKey = await cypherSwift.generateCipherKey();

	await writeProfile(finalName, cipherKey);

	note(
		`You can now select the "${finalName}" key when you use the encrypt or decrypt commands.`,
		'Key created swiftly...',
	);
}

async function gatherName(): Promise<string> {
	const name = await text({
		message: 'What would you like to call this key?',
		placeholder: 'Your friends name?',
		validate(value) {
			if (!isValidFilename(value))
				return 'Name contains invalid characters';
		},
	});

	if (isCancel(name)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}

	return name;
}
