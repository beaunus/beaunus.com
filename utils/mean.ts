/**
 * @see https://en.wikipedia.org/wiki/Arithmetic_mean
 */
export const arithmeticMean = (numbers: number[]): number | undefined =>
	numbers.length
		? numbers.reduce((sum, number) => sum + number) / numbers.length
		: undefined;

/**
 * @see https://en.wikipedia.org/wiki/Geometric_mean
 */
export const geometricMean = (numbers: number[]): number | undefined =>
	numbers.length
		? numbers.reduce((product, number) => product * number, 1) **
		  (1 / numbers.length)
		: undefined;
