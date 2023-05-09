import { aGitFileLine } from "./factories";

const REGEX: Record<string, RegExp> = {
	number: /^\d*$/,
};

describe("factories", () => {
	describe("aGitFileLine", () => {
		it("should begin with the correct prefix if isBinary is false", () => {
			const actual = aGitFileLine();
			const [numAdded, numDeleted] = actual.split("\t");
			expect(numAdded).toMatch(REGEX.number);
			expect(numDeleted).toMatch(REGEX.number);
		});
	});
});
