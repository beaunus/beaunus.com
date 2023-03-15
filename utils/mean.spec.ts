import _ from "lodash";

import { geometricMean } from "./mean";

describe("mean", () => {
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
