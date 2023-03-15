/**
 * @see https://en.wikipedia.org/wiki/Geometric_mean
 */
export const geometricMean = (numbers: number[]): number =>
  numbers.reduce((product, number) => product * number, 1) **
  (1 / numbers.length);
