import { MoreVert } from "@mui/icons-material";
import { FormControlLabel, Stack } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ChartJS from "chart.js/auto";
import _ from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import { FC, ReactNode, useEffect, useRef, useState } from "react";

const NOTE_NAMES = [
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
const FUNCTION_BY_INTERVAL = [
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
];
const CHORD_QUALITY_BY_NAME: Record<string, ChordQuality> = {
	major: { decorate: (label) => label.toUpperCase(), spelling: [0, 4, 7] },
	minor: { decorate: (label) => label.toLowerCase(), spelling: [0, 3, 7] },
	minorSeventh: {
		decorate: (label) => (
			<>
				{label.toLowerCase()}
				<sup>7</sup>
			</>
		),
		spelling: [0, 3, 7, 10],
	},
};
const NORMALIZATION_VALUES = ["none", "sum", "max"] as const;
const NUM_BEATS_PER_ROW = 16;

type NormalizationValue = (typeof NORMALIZATION_VALUES)[number];
type NoteName = (typeof NOTE_NAMES)[number];
type ChordQuality = {
	decorate: (label: string) => ReactNode;
	spelling: number[];
};
type Chord = {
	qualityName: keyof typeof CHORD_QUALITY_BY_NAME;
	root: NoteName;
};
type Section = {
	chords: (Chord & { durationInBeats: number })[];
	name: string;
};

const circleOfFifths = NOTE_NAMES.map(
	(_noteName, index) => NOTE_NAMES[(index * 7) % NOTE_NAMES.length]
);
const hueByNoteName = Object.fromEntries(
	circleOfFifths.map((noteName, index) => [
		noteName,
		(index / circleOfFifths.length) * 360,
	])
);

const sections: Section[] = [
	{
		chords: [
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
		],
		name: "Intro",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
		],
		name: "Verse",
	},
	{
		chords: [
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "B" },
		],
		name: "PreChorus",
	},
	{
		chords: [
			{ durationInBeats: 4, qualityName: "minor", root: "E" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "major", root: "D" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "minor", root: "A" },
			{ durationInBeats: 4, qualityName: "major", root: "B" },
		],
		name: "Chorus",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
		],
		name: "Verse",
	},
	{
		chords: [
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 1.5, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "minor", root: "B" },
			{ durationInBeats: 5, qualityName: "minor", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "B" },
		],
		name: "PreChorus",
	},
	{
		chords: [
			{ durationInBeats: 4, qualityName: "minor", root: "E" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "major", root: "D" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "minor", root: "A" },
			{ durationInBeats: 4, qualityName: "major", root: "B" },
		],
		name: "Chorus",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "A" },
			{ durationInBeats: 8, qualityName: "major", root: "G" },
			{ durationInBeats: 4, qualityName: "major", root: "G" },
		],
		name: "Bridge",
	},
	{
		chords: [
			{ durationInBeats: 4, qualityName: "minor", root: "E" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 1.5, qualityName: "major", root: "D" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G" },
			{ durationInBeats: 4, qualityName: "major", root: "C" },
			{ durationInBeats: 4, qualityName: "minor", root: "B" },
			{ durationInBeats: 4, qualityName: "minor", root: "A" },
			{ durationInBeats: 4, qualityName: "major", root: "B" },
		],
		name: "Chorus",
	},
];

const colorBySectionName = Object.fromEntries(
	_.uniqBy(sections, "name").map(({ name }, index, sectionsNames) => [
		name,
		`hsl(${(index / sectionsNames.length) * 360}, 100%, 50%, 0.5)`,
	])
);

const ChordChip: FC<{
	chordFunction: string;
	durationInBeats: number;
	isOutOfKey?: boolean;
	qualityName: string;
	root: NoteName;
}> = ({ chordFunction, durationInBeats, isOutOfKey, qualityName, root }) => (
	<div style={{ width: `${100 * (durationInBeats / NUM_BEATS_PER_ROW)}%` }}>
		<Stack
			alignItems="center"
			className="px-1 mx-1"
			direction="row"
			justifyContent="space-between"
			style={{
				backgroundColor: `hsl(${hueByNoteName[root]}, 100%, 50%, 0.3)`,
				...(isOutOfKey ? { border: "solid red 2px" } : {}),
			}}
		>
			<MoreVert htmlColor="#aaa" />
			<Stack alignItems="center" direction="column">
				<div>{CHORD_QUALITY_BY_NAME[qualityName].decorate(chordFunction)}</div>
				<div>{CHORD_QUALITY_BY_NAME[qualityName].decorate(root)}</div>
			</Stack>
			<MoreVert htmlColor="#aaa" />
		</Stack>
	</div>
);

const notesInChord = ({ qualityName, root }: Chord) =>
	CHORD_QUALITY_BY_NAME[qualityName].spelling.map(
		(numHalfSteps) =>
			NOTE_NAMES[(NOTE_NAMES.indexOf(root) + numHalfSteps) % NOTE_NAMES.length]
	);

const SongChart: NextPage = () => {
	const radarChartRef = useRef<HTMLCanvasElement>(null);

	const [normalization, setNormalization] = useState<NormalizationValue>("max");

	const noteNameCountsBySection = Object.fromEntries(
		Object.entries(_.groupBy(sections, "name")).map(
			([sectionName, instances]) => [
				sectionName,
				instances
					.flatMap((instance) => instance.chords)
					.reduce<Partial<Record<NoteName, number>>>(
						(noteNameCounts, chord) =>
							Object.assign(
								noteNameCounts,
								Object.fromEntries(
									notesInChord(chord).map((noteName) => [
										noteName,
										(noteNameCounts[noteName] ?? 0) + chord.durationInBeats,
									])
								)
							),
						{}
					),
			]
		)
	);

	const noteNameCountsTotal = Object.values(noteNameCountsBySection).reduce(
		(acc, noteNameCountsForSection) =>
			Object.assign(
				acc,
				Object.fromEntries(
					Object.entries(noteNameCountsForSection).map(([noteName, count]) => [
						noteName,
						(acc[noteName as NoteName] ?? 0) + count,
					])
				)
			),
		{}
	);
	const meanIndexInCircleOfFifths = _.mean(
		Object.entries(noteNameCountsTotal).flatMap(([noteName, count]) =>
			Array(Math.round(count)).fill(
				circleOfFifths.indexOf(noteName as NoteName)
			)
		)
	);
	const tonicIndex = NOTE_NAMES.indexOf(
		circleOfFifths[(Math.round(meanIndexInCircleOfFifths) + 10) % 12]
	);

	useEffect(
		function createChart() {
			if (radarChartRef.current) {
				const radarChart = new ChartJS(radarChartRef.current, {
					data: {
						datasets: Object.entries(noteNameCountsBySection).map(
							([sectionName, noteNameCountsForSection]) => ({
								backgroundColor: colorBySectionName[sectionName],
								data: circleOfFifths.map(
									(noteName) =>
										(noteNameCountsForSection[noteName] ?? 0) /
										(normalization === "max"
											? Math.max(...Object.values(noteNameCountsForSection))
											: normalization === "sum"
											? _.sum(Object.values(noteNameCountsForSection))
											: 1)
								),
								fill: true,
								label: sectionName,
							})
						),
						labels: circleOfFifths,
					},
					options: {
						scales: {
							r: {
								angleLines: { display: true },
								grid: { display: false, drawTicks: false },
								pointLabels: {
									color: ({ label }) =>
										`hsl(${hueByNoteName[label]}, 100%, 30%, 1)`,
									font: { size: 20 },
								},
								startAngle: 180 + (meanIndexInCircleOfFifths / 12) * 360,
								ticks: { display: false },
							},
						},
					},
					type: "radar",
				});

				return () => {
					radarChart.destroy();
				};
			}
		},
		[normalization]
	);

	return (
		<>
			<Head>
				<title>Song Chart | Beaunus</title>
			</Head>
			<div className="flex flex-col gap-5 w-full">
				<div className="text-2xl font-semibold text-center text-cyan-700">
					Song Chart
				</div>
				<Stack direction={{ md: "column", xl: "row" }}>
					<List className="w-full max-w-5xl">
						{sections.map((section, sectionIndex) => (
							<ListItem key={`${section.name}-${sectionIndex}`}>
								<Stack marginTop={0.5} width="100%">
									<ListItemText
										className="px-2"
										primary={section.name}
										style={{
											backgroundColor: colorBySectionName[section.name],
										}}
									/>
									<Stack
										direction="row"
										flexWrap="wrap"
										marginTop={1}
										rowGap={1}
									>
										{section.chords.map((chord, chordIndex) => (
											<ChordChip
												chordFunction={
													FUNCTION_BY_INTERVAL[
														(NOTE_NAMES.indexOf(chord.root) - tonicIndex + 12) %
															12
													]
												}
												durationInBeats={chord.durationInBeats}
												isOutOfKey={notesInChord(chord).some(
													(noteName) =>
														Math.abs(
															Math.round(meanIndexInCircleOfFifths) -
																((circleOfFifths.indexOf(noteName) + 12) % 12)
														) > 3
												)}
												key={`${section}-${sectionIndex}-${chord.root}-${chordIndex}`}
												qualityName={chord.qualityName}
												root={chord.root}
											/>
										))}
									</Stack>
								</Stack>
							</ListItem>
						))}
					</List>
					<Stack className="shrink w-full xl:w-1/2">
						<FormControl className="px-14">
							<FormLabel id="normalization-radio-buttons-group-label">
								Normalization
							</FormLabel>
							<RadioGroup
								aria-labelledby="normalization-radio-buttons-group-label"
								defaultValue={normalization}
								name="normalization-radio-buttons-group"
								onChange={(_event, newValue) =>
									setNormalization(newValue as NormalizationValue)
								}
								row
								value={normalization}
							>
								{NORMALIZATION_VALUES.map((normalizationValue) => (
									<FormControlLabel
										control={<Radio />}
										key={normalizationValue}
										label={normalizationValue}
										value={normalizationValue}
									/>
								))}
							</RadioGroup>
						</FormControl>
						<canvas ref={radarChartRef} />
					</Stack>
				</Stack>
			</div>
		</>
	);
};

export default SongChart;
