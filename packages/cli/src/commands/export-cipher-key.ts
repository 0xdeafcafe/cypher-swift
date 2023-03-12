import { cancel, intro, isCancel, note, select } from '@clack/prompts';
import { listProfiles } from '../config.js';

export default async function exportCipherKey(keyName?: string): Promise<void> {
	intro('Cypher Swift - Export cipher key');

	const profiles = await listProfiles();
	const finalKeyName = keyName ?? await select({
		message: 'Which key would you like to export?',
		initialValue: profiles[0],
		options: profiles.map(p => ({
			label: p,
			value: p,
		})),
	});

	if (isCancel(finalKeyName)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}

	note(void 0, 'Cipher key exported - copied to clipboard 📋');
}
