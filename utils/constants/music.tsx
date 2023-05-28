import _ from "lodash";
import { ReactNode } from "react";

import { moduloPositive } from "..";
import { INTERVALS, ModeSet, ScaleDirection } from "../../types";
import { combineElements, generateAllCombinations } from "../functions";

const {
	perfectUnison,
	minorSecond,
	majorSecond,
	diminishedThird,
	minorThird,
	augmentedSecond,
	majorThird,
	diminishedFourth,
	perfectFourth,
	diminishedFifth,
	augmentedFourth,
	perfectFifth,
	augmentedFifth,
	diminishedSeventh,
	minorSeventh,
	majorSeventh,
} = INTERVALS;

export const A_FREQUENCY = 440;

export const BASE_INTERVALS = [1, 1, 0.5, 1, 1, 1, 0.5];

export const CHORD_NAME_BY_INTERVALS = Object.fromEntries(
	new Map<INTERVALS[], ReactNode>([
		[[perfectUnison, minorSecond, diminishedFifth], "sus♭2ø"],
		[[perfectUnison, minorSecond, perfectFifth], "sus♭2"],
		[[perfectUnison, majorSecond, perfectFifth], "sus2"],
		[[perfectUnison, majorSecond, augmentedFifth], "sus2+"],
		[[perfectUnison, augmentedSecond, augmentedFifth], "sus+2+"],

		[[perfectUnison, diminishedThird, diminishedFifth], "m♭3"],
		[
			[perfectUnison, diminishedThird, diminishedFifth, diminishedSeventh],
			"m♭3o7",
		],
		[[perfectUnison, minorThird, diminishedFifth], "ø"],
		[[perfectUnison, minorThird, diminishedFifth, diminishedSeventh], "o7"],
		[[perfectUnison, minorThird, diminishedFifth, minorSeventh], "ø7"],
		[[perfectUnison, minorThird, perfectFifth], "m"],
		[[perfectUnison, minorThird, perfectFifth, diminishedSeventh], "m♭♭7"],
		[[perfectUnison, minorThird, perfectFifth, minorSeventh], "m7"],
		[[perfectUnison, minorThird, perfectFifth, majorSeventh], "mM7"],

		[[perfectUnison, majorThird, diminishedFifth, minorSeventh], "7♭5"],
		[[perfectUnison, majorThird, perfectFifth], ""],
		[[perfectUnison, majorThird, perfectFifth, minorSeventh], "7"],
		[[perfectUnison, majorThird, perfectFifth, majorSeventh], "Δ"],
		[[perfectUnison, majorThird, augmentedFifth], "+"],
		[[perfectUnison, majorThird, augmentedFifth, majorSeventh], "+Δ"],

		[[perfectUnison, diminishedFourth, diminishedFifth], "susø4ø"],
		[[perfectUnison, perfectFourth, diminishedFifth], "sus4ø"],
		[[perfectUnison, perfectFourth, perfectFifth], "sus4"],
		[[perfectUnison, perfectFourth, augmentedFifth], "sus4+"],
		[[perfectUnison, augmentedFourth, perfectFifth], "sus♯4"],
		[[perfectUnison, augmentedFourth, augmentedFifth], "sus+4+"],
	]).entries()
);

export const CHORD_QUALITY_BY_NAME: Record<string, ChordQuality> = {
	diminished: {
		decorate: (label) => (
			<>
				{label.toLowerCase()}
				<sup>o7</sup>
			</>
		),
		spelling: [0, 3, 6, 9],
	},
	halfDiminished: {
		decorate: (label) => (
			<>
				{label.toLowerCase()}
				<sup>ø7</sup>
			</>
		),
		spelling: [0, 3, 6, 10],
	},
	major: { decorate: (label) => label.toUpperCase(), spelling: [0, 4, 7] },
	majorNinth: {
		decorate: (label) => (
			<>
				{label.toUpperCase()}
				<sup>Δ9</sup>
			</>
		),
		spelling: [0, 4, 7, 11, 14],
	},
	majorSeventh: {
		decorate: (label) => (
			<>
				{label.toUpperCase()}
				<sup>Δ7</sup>
			</>
		),
		spelling: [0, 4, 7, 11],
	},
	minor: { decorate: (label) => label.toLowerCase(), spelling: [0, 3, 7] },
	minorNinth: {
		decorate: (label) => (
			<>
				{label.toLowerCase()}
				<sup>9</sup>
			</>
		),
		spelling: [0, 3, 7, 10, 14],
	},
	minorSeventh: {
		decorate: (label) => (
			<>
				{label.toLowerCase()}
				<sup>7</sup>
			</>
		),
		spelling: [0, 3, 7, 10],
	},
	power: { decorate: (label) => `${label.toUpperCase()}5`, spelling: [0, 7] },
	seventh: {
		decorate: (label) => (
			<>
				{label.toUpperCase()}
				<sup>7</sup>
			</>
		),
		spelling: [0, 4, 7, 10],
	},
	seventhFlatFive: {
		decorate: (label) => (
			<>
				{label.toUpperCase()}
				<sup>7♭5</sup>
			</>
		),
		spelling: [0, 4, 6, 10],
	},
	sixth: {
		decorate: (label) => (
			<>
				{label.toUpperCase()}
				<sup>6</sup>
			</>
		),
		spelling: [0, 4, 8],
	},
} as const;

export type Chord = {
	bass?: NoteName;
	durationInBeats: number;
	qualityName?: ChordQualityName;
	root?: NoteName;
};

export type ChordQuality = {
	decorate: (label: string) => ReactNode;
	spelling: readonly number[];
};

export type ChordQualityName = keyof typeof CHORD_QUALITY_BY_NAME;

export const FUNCTION_BY_INTERVAL = [
	"i",
	"♭ii",
	"ii",
	"♭iii",
	"iii",
	"iv",
	"♭v",
	"v",
	"♭vi",
	"vi",
	"♭vii",
	"vii",
] as const;

export const INDEXES_BY_CHORD_CLASS = Object.fromEntries(
	Object.entries({
		/* eslint-disable sort-keys */
		// eslint-disable-next-line @typescript-eslint/naming-convention
		"": [1, 3, 5],
		sus2: [1, 2, 5],
		sus4: [1, 4, 5],
		seven: [1, 3, 5, 7],
		/* eslint-enable sort-keys */
	}).map(([chordName, indexes]) => [
		chordName,
		indexes.map((index) => index - 1),
	])
);

export const INTERVALS_OF_WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

export const KEY_NUMBER_A = 69;
export const KEY_NUMBER_C = 60;

export const LABEL_BY_SCALE_DIRECTION: Record<ScaleDirection, string> = {
	[ScaleDirection.down]: "⇘",
	[ScaleDirection.up]: "⇗",
	[ScaleDirection.upDown]: "⇗⇘",
};

const MODES_DIATONIC: ModeSet[] = [
	{
		baseIntervals: [1, 1, 0.5, 1, 1, 1, 0.5],
		namesLists: [
			["Ionian"],
			["Dorian"],
			["Phrygian"],
			["Lydian"],
			["Mixolydian"],
			["Aeolian"],
			["Locrian"],
		],
	},
	{
		baseIntervals: [1, 0.5, 1, 1, 1, 1, 0.5],
		namesLists: [
			["Melodic Minor ↗"],
			["Phrygian ♯6", "Dorian ♭2"],
			["Lydian Augmented"],
			["Lydian Dominant"],
			["Aeolian Dominant", "Mixolydian ♭6"],
			["Half-diminished"],
			["Altered Dominant"],
		],
	},
	{
		baseIntervals: [1, 0.5, 1, 1, 0.5, 1.5, 0.5],
		namesLists: [
			["Harmonic minor"],
			["Locrian ♯6"],
			["Ionian ♯5"],
			["Ukrainian Dorian"],
			["Phrygian Dominant"],
			["Lydian ♯2"],
			["Altered Diminished"],
		],
	},
	{
		baseIntervals: [1, 1, 0.5, 1, 0.5, 1.5, 0.5],
		namesLists: [
			["Harmonic major"],
			["Dorian ♭5", "Locrian ♯2 ♯6"],
			["Phrygian ♭4", "Altered Dominant ♯5"],
			["Lydian ♭3", "Melodic Minor ♯4"],
			["Mixolydian ♭2"],
			["Lydian augmented ♯2"],
			["Locrian ♭♭7"],
		],
	},
	{
		baseIntervals: [0.5, 1.5, 0.5, 1, 0.5, 1.5, 0.5],
		namesLists: [
			["Double harmonic"],
			["Lydian ♯2 ♯6"],
			["Phrygian ♭♭7 ♭4", "Altered diminished ♯5"],
			["Hungarian minor"],
			["Locrian ♮6 ♮3", "Mixolydian ♭5 ♭2"],
			["Ionian ♯5 ♯2"],
			["Locrian ♭♭3 ♭♭7"],
		],
	},
];

const MODES_PENTATONIC: ModeSet[] = MODES_DIATONIC.flatMap((mode) =>
	[...generateAllCombinations(_.range(7), 5)].map(
		(indexesToInclude, indexA) => ({
			baseIntervals: combineElements(
				mode.baseIntervals.concat(
					mode.baseIntervals.slice(0, indexesToInclude[0])
				),
				indexesToInclude
			),
			namesLists: Array.from({ length: 5 }, (_value, indexB) =>
				mode.namesLists[0].map((thing) => `${thing} ${indexA} ${indexB}`)
			),
		})
	)
);

export type ModeCategoryName = "diatonic" | "pentatonic";

// eslint-disable-next-line sort-exports/sort-exports
export const MODES_BY_CATEGORY_NAME: Record<ModeCategoryName, ModeSet[]> = {
	diatonic: MODES_DIATONIC,
	pentatonic: MODES_PENTATONIC,
};

export const NOTE_NAMES = [
	"C",
	"C♯/D♭",
	"D",
	"D♯/E♭",
	"E",
	"F",
	"F♯/G♭",
	"G",
	"G♯/A♭",
	"A",
	"A♯/B♭",
	"B",
] as const;
export type NoteName = (typeof NOTE_NAMES)[number];
// eslint-disable-next-line sort-exports/sort-exports
export const CIRCLE_OF_FIFTHS = NOTE_NAMES.map(
	(_noteName, index) => NOTE_NAMES[(index * 7) % NOTE_NAMES.length]
);

export const OSCILLATOR_TYPES: OscillatorType[] = [
	"sawtooth",
	"sine",
	"square",
	"triangle",
];

export const notesInChord = ({
	bass,
	qualityName,
	root,
}: Pick<Chord, "bass" | "qualityName" | "root">) =>
	(bass ? [bass] : []).concat(
		...(root && qualityName && CHORD_QUALITY_BY_NAME[qualityName]
			? CHORD_QUALITY_BY_NAME[qualityName].spelling.map(
					(numHalfSteps) =>
						NOTE_NAMES[
							moduloPositive(NOTE_NAMES.indexOf(root) + numHalfSteps, 12)
						]
			  )
			: [])
	);

export const notesInScale = (tonicIndex: number) =>
	[0, 2, 4, 5, 7, 9, 11].map(
		(interval) => NOTE_NAMES[moduloPositive(tonicIndex + interval, 12)]
	);
