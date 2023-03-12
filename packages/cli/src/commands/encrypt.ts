import { intro, select, note, text, isCancel, cancel } from '@clack/prompts';
import { listProfiles, readProfile } from '../config.js';
import * as cypherSwift from '@cypher-swift/lib';

export default async function encrypt(keyName?: string, plainText?: string): Promise<void> {
	intro('Cypher Swift - Encrypt');

	const profiles = await listProfiles();

	const finalKeyName = keyName ?? await select({
		message: 'Which key would you like to use to encrypt this data?',
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

	const finalPlainText = plainText ?? await text({
		message: 'What would you like to encrypt?',
		placeholder: 'Something supersecret?',
		validate(value) {
			if (!value)
				return 'Plaintext is empty.';
		},
	});

	if (isCancel(finalPlainText)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	const cypherKey = await readProfile(finalKeyName);
	const cypherText = await cypherSwift.encryptText(cypherKey, finalPlainText);

	note(cypherText, 'Encryption successful - copied to clipboard 📋');
}
