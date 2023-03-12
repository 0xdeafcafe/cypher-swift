#!/usr/bin/env node

import { Command } from 'commander';
import { outro } from '@clack/prompts';
import { ensureConfigSetup } from './config.js';
import generateCipherKey from './commands/generate-cipher-key.js';
import encrypt from './commands/encrypt.js';
import decrypt from './commands/decrypt.js';
import exportCipherKey from './commands/export-cipher-key.js';

const cli = new Command();

cli.name('cypher-swift')
	.description('Easily encrypt/decrypt data into Taylor Swift lyrics')
	.version('1.0.0');

cli.command('generate-cipher-key')
	.aliases(['generate-key', 'g'])
	.argument('[name]', 'The name assigned to the key.')
	.action(generateCipherKey);

cli.command('export-cipher-key')
	.alias('export-key')
	.argument('[key name]', 'The name of the cipher key to export')
	.action(exportCipherKey);

cli.command('import-cipher-key');
cli.command('delete-cipher-key');

cli.command('encrypt')
	.alias('e')
	.argument('[key name]', 'The name of the cipher key to use.')
	.argument('[text]', 'The text to encrypt.')
	.action(encrypt);

// NOTE(afr): Broken until multi-line support added for `text`
cli.command('decrypt')
	.alias('d')
	.argument('[key name]', 'The name of the cipher key to use')
	.argument('[cipher text]', 'The cipher text to decrypt.')
	.action(decrypt);

await ensureConfigSetup();
await cli.parseAsync();

outro('👋');
