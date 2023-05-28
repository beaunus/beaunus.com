import encHex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { Dayjs } from "dayjs";

export const identity = <T>(x: T) => x;

export const isBrowser = (): boolean => typeof window !== "undefined";

export const isDateWithinSelectedRange = (
	date: Date | Dayjs | string | number,
	{ fromTimestamp, toTimestamp }: { fromTimestamp: number; toTimestamp: number }
) => {
	const dateValue =
		date instanceof Date || date instanceof Dayjs
			? date.valueOf()
			: typeof date === "string"
			? new Date(date).valueOf()
			: date;
	return dateValue >= fromTimestamp && dateValue < toTimestamp;
};

export const moduloPositive = (dividend: number, divisor: number) =>
	((dividend % divisor) + divisor) % divisor;

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stringToHex(string: string) {
	return `#${sha256(string).toString(encHex).slice(0, 6)}`;
}

export function stringToHsl(
	string: string,
	{ alpha, lightness, saturation } = {
		alpha: 0.5,
		lightness: 50,
		saturation: 100,
	}
) {
	return `hsl(${
		stringToInt(string) % 360
	}, ${saturation}%, ${lightness}%, ${alpha})`;
}

export function stringToInt(string: string) {
	return parseInt(sha256(string).toString(encHex), 16);
}
