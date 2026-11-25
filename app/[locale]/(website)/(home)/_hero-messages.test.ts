import { describe, expect, test } from "bun:test";
import en from "../../../../messages/en.json";
import fr from "../../../../messages/fr.json";
import sw from "../../../../messages/sw.json";

const LOCALES = { en, fr, sw };

describe("home hero morph words", () => {
	for (const [locale, messages] of Object.entries(LOCALES)) {
		const { titleSecond, morphWords } = messages.home.hero;

		test(`${locale} starts the cycle on the word in the static sentence`, () => {
			const staticWord = /<word>(.*?)<\/word>/.exec(titleSecond)?.[1];
			expect(morphWords[0]).toBe(staticWord);
		});

		test(`${locale} has four words`, () => {
			expect(morphWords).toHaveLength(4);
		});
	}
});
