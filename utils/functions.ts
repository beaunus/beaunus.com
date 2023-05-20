import _ from "lodash";

import { A_FREQUENCY, A_KEY_NUMBER } from "./constants/music";

export const areRotations = <T>(arrayA: T[], arrayB: T[]) => {
	for (let i = 0; i < arrayA.length; ++i)
		if (_.isEqual(rotateArray(arrayA, i), arrayB)) return true;
	return false;
};

export function combineElements<T>(elements: T[], indexesToChoose: number[]) {
	return indexesToChoose.map((value, index, array) =>
		_.sum(
			index < array.length - 1
				? elements.slice(value, array[index + 1])
				: elements.slice(value)
		)
	);
}

export const convertDiffToAccidental = (diff: number) =>
	Array.from({ length: Math.abs(diff / 0.5) }, () =>
		diff < 0 ? "♭" : "♯"
	).join("");

export function factorial(n: number): number {
	let result = 1;
	for (let i = 2; i <= n; ++i) result *= i;
	return result;
}

export function* generateAllCombinations<T>(
	elements: T[],
	numToChoose: number
): Generator<T[], void, unknown> {
	if (numToChoose > elements.length || numToChoose < 0) return;
	if (numToChoose === elements.length) yield elements;
	else if (numToChoose < 1) yield [];
	else
		for (let i = 0; i < elements.length; ++i)
			for (const smaller of generateAllCombinations(
				elements.slice(i + 1),
				numToChoose - 1
			))
				yield [elements[i], ...smaller];
}

export const keyNumberToFrequency = (keyNumber: number) =>
	2 ** ((keyNumber - A_KEY_NUMBER) / 12) * A_FREQUENCY;

export const romanNumerals = (intervals: number[], baseIntervals: number[]) =>
	intervals.map(
		(_interval, index) =>
			convertDiffToAccidental(
				_.sum(intervals.slice(0, index)) - _.sum(baseIntervals.slice(0, index))
			) + ["I", "II", "III", "IV", "V", "VI", "VII"][index]
	);

export const rotateArray = <T>(array: T[], offset: number) =>
	array.slice(offset).concat(array.slice(0, offset));
