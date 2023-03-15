import _ from "lodash";

import { arithmeticMean, geometricMean } from "./mean";

describe("mean", () => {
  describe("arithmeticMean", () => {
    it("should return the sum of a collection of numbers divided by the count of numbers in the collection", () => {
      const numbers = Array.from({ length: _.random(5, 10) }, () =>
        Math.random()
      );
      const sum = numbers.reduce((acc, cur) => acc + cur);

      expect(arithmeticMean(numbers)).toBe(sum / numbers.length);
    });
  });

  describe("geometricMean", () => {
    it("should return the nth root of the product of n numbers", () => {
      const numbers = Array.from({ length: _.random(5, 10) }, () =>
        Math.random()
      );
      const product = numbers.reduce((acc, cur) => acc * cur, 1);

      expect(geometricMean(numbers)).toBe(product ** (1 / numbers.length));
    });
  });
});
