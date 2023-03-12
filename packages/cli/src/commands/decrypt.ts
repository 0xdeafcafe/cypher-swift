import { intro, select, note, text, isCancel, cancel } from '@clack/prompts';
import { listProfiles, readProfile } from '../config.js';
import * as cypherSwift from '@cypher-swift/lib';

export default async function decrypt(keyName?: string, cipherText?: string): Promise<void> {
	intro('Cypher Swift - Decrypt');

	const profiles = await listProfiles();

	const finalKeyName = keyName ?? await select({
		message: 'Which key would you like to use to decrypt this data?',
		initialValue: profiles[0],
		options: profiles.map(p => ({
			label: p,
			value: p,
		})),
	});

	if (isCancel(finalKeyName)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	const finalCipherText = cipherText ?? await text({
		message: `Please enter the cipher text to decrypt using the ${finalKeyName} key?`,
		validate(value) {
			if (!value)
				return 'Cipher text is empty';
		},
	});

	if (isCancel(finalCipherText)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	const cypherKey = await readProfile(finalKeyName);
	const plainText = await cypherSwift.decryptText(cypherKey, finalCipherText);

	note(plainText, 'Decryption successful - copied to clipboard 📋');
}
