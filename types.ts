export interface AudioConfig {
	audioCtx?: AudioContext;
	durationInSeconds: number;
	numRepetitions: number;
	octave: number;
	oscillatorType: OscillatorType;
}

export enum INTERVALS {
	/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
	perfectUnison = 0,
	diminishedSecond = 0,
	minorSecond = 0.5,
	augmentedUnison = 0.5,
	semitone = 0.5,
	majorSecond = 1,
	diminishedThird = 1,
	tone = 1,
	minorThird = 1.5,
	augmentedSecond = 1.5,
	majorThird = 2,
	diminishedFourth = 2,
	perfectFourth = 2.5,
	augmentedThird = 2.5,
	diminishedFifth = 3,
	augmentedFourth = 3,
	tritone = 3,
	perfectFifth = 3.5,
	diminishedSixth = 3.5,
	minorSixth = 4,
	augmentedFifth = 4,
	majorSixth = 4.5,
	diminishedSeventh = 4.5,
	minorSeventh = 5,
	augmentedSixth = 5,
	majorSeventh = 5.5,
	diminishedOctave = 5.5,
	perfectOctave = 6,
	augmentedSeventh = 6,
	/* eslint-enable @typescript-eslint/no-duplicate-enum-values */
}

export interface ModeSet {
	baseIntervals: number[];
	namesLists: string[][];
}

export enum ScaleDirection {
	up,
	down,
	upDown,
}
