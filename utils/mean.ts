/**
 * @see https://en.wikipedia.org/wiki/Arithmetic_mean
 */
export const arithmeticMean = (numbers: number[]): number =>
  numbers.reduce((sum, number) => sum + number) / numbers.length;

/**
 * @see https://en.wikipedia.org/wiki/Geometric_mean
 */
export const geometricMean = (numbers: number[]): number =>
  numbers.reduce((product, number) => product * number, 1) **
  (1 / numbers.length);
