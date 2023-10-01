import encHex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { Dayjs } from "dayjs";

export const NUM_MS_IN_ONE_DAY = 1000 * 60 * 60 * 24;

export const cartesianToPolar = ({ x, y }: { x: number; y: number }) => ({
	radius: Math.hypot(x, y),
	theta: Math.atan2(y, x),
});

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

export const polarToCartesian = ({
	radius,
	theta,
}: {
	radius: number;
	theta: number;
}) => ({ x: radius * Math.cos(theta), y: radius * Math.sin(theta) });

export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const stringToHex = (string: string) =>
	`#${sha256(string).toString(encHex).slice(0, 6)}`;

export const stringToHsl = (
	string: string,
	{ alpha, lightness, saturation } = {
		alpha: 0.5,
		lightness: 50,
		saturation: 100,
	}
) =>
	`hsl(${stringToInt(string) % 360}, ${saturation}%, ${lightness}%, ${alpha})`;

export const stringToInt = (string: string) =>
	parseInt(sha256(string).toString(encHex), 16);
