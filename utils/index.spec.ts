import { moduloPositive } from ".";

describe("utils", () => {
	describe("moduloPositive", () => {
		it("should return the same as '%' for non-negative operands", () => {
			for (let dividend = 0; dividend < 100; ++dividend) {
				for (let divisor = 0; divisor < 100; ++divisor) {
					expect(moduloPositive(dividend, divisor)).toBe(dividend % divisor);
				}
			}
		});
		it("should return a non-negative result for negative dividends", () => {
			for (let dividend = -1; dividend > -100; --dividend) {
				for (let divisor = 1; divisor < 100; ++divisor) {
					expect(moduloPositive(dividend, divisor)).toBeGreaterThanOrEqual(0);
				}
			}
		});
		it("should return the same series of results over and over", () => {
			for (let dividend = -1; dividend > -100; --dividend) {
				for (let divisor = 1; divisor < 100; ++divisor) {
					expect(moduloPositive(dividend, divisor)).toBe(
						moduloPositive(dividend + divisor, divisor)
					);
				}
			}
		});
	});
});
