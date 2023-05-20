import _ from "lodash";

import {
	convertDiffToAccidental,
	rotateArray,
	factorial,
	generateAllCombinations,
	combineElements,
} from "./functions";

describe("utils", () => {
	describe("convertDiffToAccidental", () => {
		it("should return an empty string if there is no diff", () =>
			expect(convertDiffToAccidental(0)).toBe(""));
		it("should return a string of '♭' characters for each half step if the diff is negative", () => {
			for (let i = 1; i < 10; ++i)
				expect(convertDiffToAccidental(-i * 0.5)).toMatch(
					new RegExp(`^♭{${i}}$`)
				);
		});
		it("should return a string of '♯' characters for each half step if the diff is positive", () => {
			for (let i = 1; i < 10; ++i)
				expect(convertDiffToAccidental(i * 0.5)).toMatch(
					new RegExp(`^♯{${i}}$`)
				);
		});
	});

	describe("rotateCircularArray", () => {
		it("should return an array of the same size as the given array", () => {
			const array = Array.from({ length: _.random(5, 10) }, Math.random);
			const actual = rotateArray(array, Math.random());
			expect(actual).toHaveLength(array.length);
		});
		it("should return an array whose element's indexes are offset by the given offset % the given array's length", () => {
			const array = Array.from({ length: _.random(5, 10) }, Math.random);
			for (let i = 0; i < array.length; ++i) {
				const actual = rotateArray(array, i);
				for (let j = 0; j < array.length; ++j) {
					expect(actual[j]).toStrictEqual(array[(i + j) % array.length]);
				}
			}
		});
	});

	describe("factorial", () => {
		it("should return 1 for arguments 0 and 1", () =>
			expect(factorial(0)).toBe(1));

		it("should return the correct value for positive integers greater than 1", () => {
			for (let i = 2; i < 100000; i = Math.ceil(i * (1 + Math.random())))
				expect(factorial(i)).toBe(i * factorial(i - 1));
		});
	});

	describe("generateAllCombinations", () => {
		it("should generate the proper number of combinations", () => {
			for (let numElements = 1; numElements < 10; ++numElements) {
				const elements = _.range(numElements);
				for (let numToChoose = 0; numToChoose <= numElements; ++numToChoose)
					expect([
						...generateAllCombinations(elements, numToChoose),
					]).toHaveLength(
						factorial(numElements) /
							(factorial(numToChoose) * factorial(numElements - numToChoose))
					);
			}
		});

		it("all combinations should be a subset of the given elements", () => {
			for (let numElements = 1; numElements < 10; ++numElements) {
				const elements = _.range(numElements);
				for (let numToChoose = 0; numToChoose <= numElements; ++numToChoose)
					for (const combination of generateAllCombinations(
						elements,
						numToChoose
					))
						for (const element of combination)
							expect(elements).toContain(element);
			}
		});

		it("all combinations should be unique", () => {
			for (let numElements = 1; numElements < 10; ++numElements) {
				const elements = _.range(numElements);
				for (let numToChoose = 0; numToChoose <= numElements; ++numToChoose) {
					const allCombinations = [
						...generateAllCombinations(elements, numToChoose),
					];
					expect(new Set(allCombinations).size).toBe(allCombinations.length);
				}
			}
		});
	});

	describe("combineElements", () => {
		it("should properly combine elements", () => {
			const EXPECTED_BY_INDEXES_TO_CHOOSE = new Map<number[], string[]>();
			EXPECTED_BY_INDEXES_TO_CHOOSE.set([0, 1, 2, 3], ["a", "b", "c", "d"]);
			EXPECTED_BY_INDEXES_TO_CHOOSE.set([0, 2, 3], ["ab", "c", "d"]);
			EXPECTED_BY_INDEXES_TO_CHOOSE.set([0, 3], ["abc", "d"]);
			EXPECTED_BY_INDEXES_TO_CHOOSE.set([0], ["abcd"]);

			const EXPECTED_BY_INDEXES_TO_CHOOSE_BY_ELEMENTS = new Map<
				string[],
				Map<number[], string[]>
			>();
			EXPECTED_BY_INDEXES_TO_CHOOSE_BY_ELEMENTS.set(
				["a", "b", "c", "d"],
				EXPECTED_BY_INDEXES_TO_CHOOSE
			);
			for (const [
				elements,
				expectedByIndexesToChoose,
			] of EXPECTED_BY_INDEXES_TO_CHOOSE_BY_ELEMENTS.entries())
				for (const [
					indexesToChoose,
					expected,
				] of expectedByIndexesToChoose.entries())
					expect(combineElements(elements, indexesToChoose)).toStrictEqual(
						expected
					);
		});
	});
});
