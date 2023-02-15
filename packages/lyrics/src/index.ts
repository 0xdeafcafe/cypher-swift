import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import jsonc from 'jsonc-parser';
import Genius from 'genius-lyrics';
import limit from 'await-limit';

const songIdsFilePath = path.join('.', 'data', 'song-ids.jsonc');
const albumsFilePath = path.join('.', 'data', 'album-ids.jsonc');
const relevantSongIdsFilePath = path.join('.', 'data', 'relevant-song-ids.jsonc');
const lyricsFolderPath = path.join('.', 'data', 'lyrics');
const compiledLyricsFile = path.join('.', 'compiled-lyrics', 'lyrics.list');

const geniusClient = new Genius.Client(process.env['GENIUS_API_KEY']!);

async function main() {
	await fs.rm('./compiled-lyrics', { recursive: true, force: true });
	await fs.mkdir('./compiled-lyrics');

	// await fetchArtistSongIds();
	// await fetchSongLyrics(await fetchRelevantSongs());
	await createSingularLyricsFile();
}

async function fetchArtistSongIds() {
	await fs.rm(songIdsFilePath, { force: true });

	const taylorSwift = await geniusClient.artists.get(1177);
	const songs: Genius.Song[] = [];
	let page = 1;

	while (true) {
		const songBatch = await taylorSwift.songs({ perPage: 50, page: page++ });

		if (songBatch.length === 0)
			break;

		songs.push(...songBatch);
	}

	const songIds = songs.map(s => s.id);

	await fs.writeFile(songIdsFilePath, JSON.stringify(songIds), 'utf-8');
}

async function fetchRelevantSongs(): Promise<Genius.Song[]> {
	await fs.rm(relevantSongIdsFilePath, { force: true });

	const albumsFile = await fs.readFile(albumsFilePath, 'utf-8');
	const songIdsFile = await fs.readFile(songIdsFilePath, 'utf-8');
	const albums = jsonc.parse(albumsFile) as number[];
	const songIds = jsonc.parse(songIdsFile) as number[];

	const relevantSongs: Genius.Song[] = [];

	await limit.all(50, songIds.map(s => async () => {
		const song = await geniusClient.songs.get(s);

		if (albums.includes(song.album?.id!))
			relevantSongs.push(song);
	}));

	return relevantSongs;
}

async function fetchSongLyrics(songs: Genius.Song[]) {
	await fs.rm('./data/lyrics', { recursive: true, force: true });
	await fs.mkdir('./data/lyrics');

	await Promise.all(songs!.map(async s => {
		const lyrics = await s.lyrics(true);
		const lyricsFilePath = path.join('.', 'data', 'lyrics', `${s.album!.name}-${s.title}`);

		await fs.writeFile(lyricsFilePath, lyrics, 'utf-8');
	}));
}

async function createSingularLyricsFile() {
	const names = await fs.readdir(lyricsFolderPath);
	const lyricLines: string[] = [];

	for (const name of names) {
		const filePath = path.join(lyricsFolderPath, name);
		const file = await fs.readFile(filePath, 'utf-8');
		const trimmedLyricsLines = file.split('\n').filter(Boolean);
		
		lyricLines.push(...trimmedLyricsLines);
	}

	const uniqueLyrics = lyricLines.filter((x, i, a) => a.indexOf(x) === i);

	await fs.writeFile(compiledLyricsFile, uniqueLyrics.join('\n'), 'utf-8');
}

await main();
