import fs from 'node:fs';
import path from 'path';
import os from 'os';

const fsp = fs.promises;
const configPath = path.join(os.homedir(), '.cypher-swift');
const profilesPath = path.join(configPath, 'profiles');

export async function ensureConfigSetup() {
	if (!fs.existsSync(configPath))
		await fsp.mkdir(configPath);

	if (!fs.existsSync(profilesPath))
		await fsp.mkdir(profilesPath);
}

export async function writeProfile(name: string, key: string) {
	const profilePath = path.join(profilesPath, name);

	await fsp.writeFile(profilePath, key, 'utf-8');
}

export async function listProfiles(): Promise<string[]> {
	const files = fsp.readdir(profilesPath);

	return files;
}

export async function readProfile(profileName: string): Promise<string> {
	const profilePath = path.join(profilesPath, profileName);

	return await fsp.readFile(profilePath, 'utf-8');
}
