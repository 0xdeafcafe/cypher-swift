import { cancel, isCancel } from '@clack/prompts';

export function handleCancel(result: unknown): never | void {
	if (!isCancel(result)) return;

	cancel('Operation cancelled.');
	process.exit(0);
}
