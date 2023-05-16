import { FormControlLabel, Stack, TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import ChartJS from "chart.js/auto";
import _ from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import { ReactNode, useEffect, useRef, useState } from "react";

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
} as const;
const NORMALIZATION_VALUES = ["none", "sum", "max"] as const;
const NUM_BEATS_PER_ROW = 8;

type NormalizationValue = (typeof NORMALIZATION_VALUES)[number];
type NoteName = (typeof NOTE_NAMES)[number];
type ChordQualityName = keyof typeof CHORD_QUALITY_BY_NAME;
type ChordQuality = {
	decorate: (label: string) => ReactNode;
	spelling: readonly number[];
};
type Chord = {
	qualityName?: keyof typeof CHORD_QUALITY_BY_NAME;
	root: NoteName | null;
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

const DEFAULT_SECTIONS: Section[] = [
	{
		chords: [
			{ durationInBeats: 8, root: null },
			{ durationInBeats: 8, root: null },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 1.5, qualityName: "majorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2.5, qualityName: "minorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Intro",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Verse",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "D" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "C" },
		],
		name: "PreChorus",
	},
	{
		chords: [
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 1.5, qualityName: "majorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2.5, qualityName: "minorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Chorus",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "C" },
			{ durationInBeats: 8, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Verse",
	},
	{
		chords: [
			{ durationInBeats: 8, qualityName: "halfDiminished", root: "D" },
			{ durationInBeats: 8, qualityName: "minorSeventh", root: "C" },
		],
		name: "PreChorus",
	},
	{
		chords: [
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 1.5, qualityName: "majorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2.5, qualityName: "minorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 1.5, qualityName: "majorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2.5, qualityName: "minorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Chorus",
	},
	{
		chords: [
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 2.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 1.5, qualityName: "majorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2.5, qualityName: "minorSeventh", root: "D♯/E♭" },
			{ durationInBeats: 2, qualityName: "major", root: "F♯/G♭" },
			{ durationInBeats: 1.5, qualityName: "major", root: "G♯/A♭" },
			{ durationInBeats: 4.5, qualityName: "major", root: "A♯/B♭" },
		],
		name: "Outro",
	},
];

const notesInChord = ({ qualityName, root }: Chord) =>
	root && qualityName
		? CHORD_QUALITY_BY_NAME[qualityName].spelling.map(
				(numHalfSteps) =>
					NOTE_NAMES[
						(NOTE_NAMES.indexOf(root) + numHalfSteps) % NOTE_NAMES.length
					]
		  )
		: [];

const SongChart: NextPage = () => {
	const radarChartRef = useRef<HTMLCanvasElement>(null);

	const [isChordDialogOpen, setIsChordDialogOpen] = useState(false);
	const [normalization, setNormalization] = useState<NormalizationValue>("max");
	const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
	const [targetChordIndexes, setTargetChordIndexes] = useState({
		chordIndex: 0,
		sectionIndex: 0,
	});
	const [tonicIndex, setTonicIndex] = useState(0);

	const colorBySectionName = Object.fromEntries(
		_.uniqBy(sections, "name").map(({ name }, index, sectionsNames) => [
			name,
			`hsl(${(index / sectionsNames.length) * 360}, 100%, 50%, 0.5)`,
		])
	);

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

	const notesInScale = [0, 2, 4, 5, 7, 9, 11].map(
		(interval) => NOTE_NAMES[(tonicIndex + interval) % 12]
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
								min: 0,
								pointLabels: {
									color: ({ label }) =>
										`hsl(${hueByNoteName[label]}, 100%, 30%, 1)`,
									font: { size: 20 },
								},
								startAngle:
									300 - circleOfFifths.indexOf(NOTE_NAMES[tonicIndex]) * 30,
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
		[normalization, tonicIndex]
	);

	const ChordDialog = () => {
		const [chord, setChord] = useState(
			sections[targetChordIndexes.sectionIndex].chords[
				targetChordIndexes.chordIndex
			]
		);

		return (
			<Dialog
				onClose={() => setIsChordDialogOpen(false)}
				open={isChordDialogOpen}
			>
				<DialogTitle>Chord Details</DialogTitle>
				<DialogContent>
					<Stack className="p-2" direction="row" flexWrap="wrap" gap={2}>
						<FormControl>
							<InputLabel id="root-label">Root</InputLabel>
							<Select
								id="root"
								labelId="root-label"
								onChange={({ target }) =>
									setChord((old) => ({
										...old,
										root: target.value as NoteName,
									}))
								}
								value={chord?.root}
							>
								{NOTE_NAMES.map((noteName) => (
									<MenuItem key={noteName} value={noteName}>
										{noteName}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl sx={{ minWidth: 200 }}>
							<InputLabel id="quality-label">Quality</InputLabel>
							<Select
								id="quality"
								labelId="quality-label"
								onChange={({ target }) =>
									setChord((old) => ({
										...old,
										qualityName: target.value as ChordQualityName,
									}))
								}
								value={chord?.qualityName}
							>
								{Object.keys(CHORD_QUALITY_BY_NAME).map((name) => (
									<MenuItem key={name} value={name}>
										{name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl>
							<TextField
								InputLabelProps={{ shrink: true }}
								id="duration"
								label="Duration"
								onChange={({ target }) =>
									setChord((old) => ({
										...old,
										durationInBeats: Math.max(Number(target.value), 0),
									}))
								}
								type="number"
								value={chord?.durationInBeats}
							/>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setIsChordDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={() => {
							setSections((old) =>
								old
									.slice(0, targetChordIndexes.sectionIndex)
									.concat([
										{
											...old[targetChordIndexes.sectionIndex],
											chords: old[targetChordIndexes.sectionIndex].chords
												.slice(0, targetChordIndexes.chordIndex)
												.concat([chord])
												.concat(
													old[targetChordIndexes.sectionIndex].chords.slice(
														targetChordIndexes.chordIndex + 1
													)
												),
										},
									])
									.concat(old.slice(targetChordIndexes.sectionIndex + 1))
							);
							setIsChordDialogOpen(false);
						}}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		);
	};

	return (
		<>
			<Head>
				<title>Song Chart | Beaunus</title>
			</Head>
			<div className="flex flex-col gap-5 w-full">
				<div className="text-2xl font-semibold text-center text-cyan-700">
					Song Chart
				</div>
				<Box className="px-2">
					<FormControl>
						<InputLabel id="tonic-label">Tonic</InputLabel>
						<Select
							id="tonic"
							label="Tonic"
							labelId="tonic-label"
							onChange={({ target }) => setTonicIndex(Number(target.value))}
							value={tonicIndex}
						>
							{NOTE_NAMES.map((noteName, index) => (
								<MenuItem key={`tonic-${index}`} value={index}>
									{noteName}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
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
											<div
												key={`${section}-${sectionIndex}-${chord.root}-${chordIndex}`}
												style={{
													width: `${
														100 * (chord.durationInBeats / NUM_BEATS_PER_ROW)
													}%`,
												}}
											>
												<Stack
													alignItems="center"
													className="px-1 mx-1 h-full"
													direction="row"
													justifyContent="center"
													onClick={(event) => {
														if (event.detail === 2) {
															setTargetChordIndexes({
																chordIndex,
																sectionIndex,
															});
															setIsChordDialogOpen(true);
														}
													}}
													style={{
														backgroundColor: chord.root
															? `hsl(${
																	hueByNoteName[chord.root]
															  }, 100%, 50%, 0.3)`
															: "#ccc",
														...(notesInChord(chord).some(
															(noteName) => !notesInScale.includes(noteName)
														)
															? { border: "solid red 2px" }
															: {}),
													}}
												>
													<Stack alignItems="center" direction="column">
														{chord.root && chord.qualityName ? (
															<>
																<div>
																	{CHORD_QUALITY_BY_NAME[
																		chord.qualityName
																	].decorate(
																		FUNCTION_BY_INTERVAL[
																			(NOTE_NAMES.indexOf(chord.root) -
																				tonicIndex +
																				12) %
																				12
																		]
																	)}
																</div>
																<div>
																	{CHORD_QUALITY_BY_NAME[
																		chord.qualityName
																	].decorate(chord.root)}
																</div>
															</>
														) : (
															"None"
														)}
													</Stack>
												</Stack>
											</div>
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
			<ChordDialog />
		</>
	);
};

export default SongChart;
