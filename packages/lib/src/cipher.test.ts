import { generateCipherKey } from './cipher-key';
import { decryptText, encryptText } from './cipher';

const staticEncodedCipherKey = 'ABNe4AcXv7QsORJdoHPaDQ0R0Ku2uYXwb8YFCyCp513I_SRuKnP-O74LB-3ykFnzZUV1Uj2nyIEUk1PZAu1UzVoKK5VurEVgJAVZNSg8Do3QXtIaSFlyYoGo439gr5gOqURGiECTkjAY7VMB1La89_-Usb1PyvkoXrs8VCb8WwTzDBviMy5uVG_zHiZwGz1Vf18-V4z6SjzNJOGmnFMe50weYxrQkfLpqYjuhjU5YjE8EyYdGl4mypaFv1ZAmbOlSZ4htUjUfi8Be0VzCES5eYvSrMItpft2n2yfSLT8-lJy5ul4RwywfdQTRd1qfF4mIJueL2zans9GT0TtXG2alhutTrbrus-oUu0QLHv5JWOOg3Twjit_MKiNskJeevC2FpyJoJHimQFHXE8BcgwUdG6ONE3bZIxkK8j0e63Dpvby8aSJqAfnwJwXzLjT2lx-MtnFhis56gQ3D5mGJiwlE9Ylr-akTjZGBliEetxv3ejQ8ShiMQI64vOUEuJu11112D1KzJ56Z7K-weAdLwq9YQSiLUKVxvqLOCuDsFcJHo499itrWa8qPVkN_m4Jx5rE5Bpreo9637HYIELvGzSFH76o60w18zeBf92ZXJJXP8dkUgEpd5Jf_9o2r92xDd5trS-fkt1cB8YTboolhj-cm-oz2DLxO7pfPdB2sD69BDTvHW67ZyWPHMY41QkV7gswEYjpMCHlIuGVoBaRw-hbI6GPBvNDy_5RK2XdCzF79OPo-zgFzGgiE3H5g_9Rp9_H_9xE6UFkRfHluhAxh6Kz2I8RRhycwAa06FRbtuM-Gtb_2jF83JeW--5-Ka0_4EaLoIgKrAsCpIKtQ9oAhoZI7pFBOYnfpu-wKLlREKvcH8UI5N8b3xYhlxBNeGlOHfvc9-BMYkYk67bVACwujfTrDvwFYI6Q-XqLa7nizhvcRQJffOEqM5_XE3wjrIAT8s4hmFSiqkGC2bShR3_ca0DxLk3Yf-fpNN3aJk5V04VYYuAoGGwR2nrFSiOEELh68SGYNypd9jIOxSsI-zNkFzX1AheUfAhWkcAlLScms4Mwxmn1dfthuY97t7JxO60FNsGSnWZq-Bs4KWiCyzFWaq7x2AJhVLFo3CW0OSLQMeJclRaCX7liQL-5GzOyzx5qgimptoww6vuzM-l0rkq5GAU9p1aZFdSQae-AkRLsAw0xdQJzqGu_IMfwlwrQ2ZGXh81aC3WppQ_92cACmsMp7vU6fmcZ0WiXUjTXtueD8dWhsuRfH_ph6UL8gPEfWBc_DB9xgE5tE5Q53WWp2tQoUaUOibc9YDKkn0pkW9wnm6HGrnmx2HtkqtbE-8ifvPvhGB_egLc3Kqfh4TTEYH6c2eUAjFUM1A6FLVFhSnGWttZsJboDHMhYcO5r24C7nNu1RGJCsfg8WOfNN3x0fQlyvLSsXA1XpN5ZruhwSh2mloPqRRgw_m0l2J3cGvS_ZPgqVoE8brlVPtv9zVLSM_0ZxYFqNYmHQs68XoUQGYfUOQHGgTJP8A6_-tFra_aHogIUyknZGW8C2gbKGDZ9-6HT09aFOO7ExWCzIcvOeJ604s7Xed6k7pqz1G8kffo1MjDWLobfGVkwa8QtZtgyKWmYgHSqjR2D0-wSWpr-LeYYOFDxudzIo2g-Afg6DPttLtfIgFN9n3St8yKTRyxQ9VwjT-IYZ3NjX6L_-EUI7eGWb1yNYxEdqw';

test('Encrypting a payload with a static ciper key', async () => {
	const input = 'testing blah keuken';
	const encrypted = await encryptText(staticEncodedCipherKey, input);
	const expected = [
		'Rain came pouring down',
		'And he keeps a picture of you in his office downtown',
		'"Your roommate\'s cheap-ass screw-top rosé, that\'s how"',
		'Small talk, he drives',
		'\'Cause karma is my boyfriend',
		'It\'s been a while since I have even heard from you',
		'(Stay) Hey, all you had to do was stay',
		'The less I know',
		'I\'m only cryptic and Machiavellian',
		'And every day is like a battle (And every day is like a battle)',
		'If you fail to plan, you plan to fail',
		'The less I know',
		'Drive out of the city, away from the crowds"',
		'What should\'ve been you',
		'At the same time',
		'It can\'t last',
	];

	const santisedEncryptedData = encrypted.split('\n').filter(Boolean);

	// Remove last lyric due to random bit padding
	santisedEncryptedData.pop();

	expect(santisedEncryptedData).toStrictEqual(expected);
});

test('Encrpying and decrypting returns the same result', async () => {
	const input = 'Neuken in de keuken';

	const cipherKey = await generateCipherKey();
	const encrypted = await encryptText(cipherKey, input);
	const decrypted = await decryptText(cipherKey, encrypted);

	expect(decrypted).toBe(input);
});
