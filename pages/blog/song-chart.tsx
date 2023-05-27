import Editor from "@monaco-editor/react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormLabel,
	InputLabel,
	ListItemText,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Stack,
	Switch,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import ChartJS from "chart.js/auto";
import _ from "lodash";
import LZString from "lz-string";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";

import { isBrowser, moduloPositive } from "../../utils";
import { playChord } from "../../utils/audio";
import {
	C_KEY_NUMBER,
	FUNCTION_BY_INTERVAL,
	NOTE_NAMES,
} from "../../utils/constants/music";

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
	durationInBeats: number;
	qualityName?: ChordQualityName;
	root?: NoteName;
};
const chordSchema = {
	$schema: "http://json-schema.org/draft-07/schema#",
	properties: {
		durationInBeats: { type: "number" },
		qualityName: { enum: Object.keys(CHORD_QUALITY_BY_NAME), type: "string" },
		root: { enum: NOTE_NAMES, type: "string" },
	},
	required: ["durationInBeats"],
	type: "object",
};
type Section = { chords: Chord[]; name: string };
const sectionSchema = {
	$schema: "http://json-schema.org/draft-07/schema#",
	properties: {
		chords: { items: chordSchema, type: "array" },
		name: { type: "string" },
	},
	type: "object",
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
			{ durationInBeats: 8 },
			{ durationInBeats: 8 },
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

const notesInChord = ({
	qualityName,
	root,
}: Pick<Chord, "qualityName" | "root">) =>
	root && qualityName && CHORD_QUALITY_BY_NAME[qualityName]
		? CHORD_QUALITY_BY_NAME[qualityName].spelling.map(
				(numHalfSteps) =>
					NOTE_NAMES[
						moduloPositive(NOTE_NAMES.indexOf(root) + numHalfSteps, 12)
					]
		  )
		: [];

const notesInScale = (tonicIndex: number) =>
	[0, 2, 4, 5, 7, 9, 11].map(
		(interval) => NOTE_NAMES[moduloPositive(tonicIndex + interval, 12)]
	);

const SongChart: NextPage = () => {
	const radarChartRef = useRef<HTMLCanvasElement>(null);

	const router = useRouter();

	const [audioCtx, setAudioCtx] = useState<AudioContext>();
	const [isChordDialogOpen, setIsChordDialogOpen] = useState(false);
	const [normalization, setNormalization] = useState<NormalizationValue>("max");
	const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
	const [shouldShowEditor, setShouldShowEditor] = useState(false);
	const [targetChordIndexes, setTargetChordIndexes] = useState({
		chordIndex: 0,
		sectionIndex: 0,
	});
	const [tonicIndex, setTonicIndex] = useState(0);

	function activateAudio() {
		if (!audioCtx) setAudioCtx(new window.AudioContext());
	}

	const colorBySectionName = Object.fromEntries(
		_.uniqBy(sections, "name").map(({ name }, index, { length }) => [
			name,
			`hsl(${(index / length) * 360}, 100%, 50%, 0.5)`,
		])
	);

	const chordsInSong = _.uniqBy(
		sections.flatMap((section) => section.chords).filter(({ root }) => root),
		({ qualityName, root }) => `${root}-${qualityName}`
	).map(({ qualityName, root }) => ({ qualityName, root }));

	const noteNameCountsBySection = Object.fromEntries(
		Object.entries(_.groupBy(sections, "name")).map(
			([sectionName, instances]) => [
				sectionName,
				instances
					.flatMap(({ chords }) => chords)
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

	useEffect(() => {
		if (isBrowser()) {
			const encodedSectionsFromUrl = new URLSearchParams(
				window.location.search
			).get("sections");
			if (encodedSectionsFromUrl) {
				return setSections(
					JSON.parse(LZString.decompressFromBase64(encodedSectionsFromUrl))
				);
			}
		}
	}, []);

	useEffect(
		function updateQueryString() {
			router.replace(
				{},
				{
					query: {
						sections: LZString.compressToBase64(JSON.stringify(sections)),
					},
				}
			);
		},
		[sections]
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
		[normalization, sections, tonicIndex]
	);

	const ChordDialog = () => {
		const [chord, setChord] = useState<Chord>(
			sections[targetChordIndexes.sectionIndex]?.chords[
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
									setChord((old) =>
										old.qualityName
											? { ...old, root: target.value as NoteName }
											: old
									)
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
									setChord((old) =>
										old.root
											? { ...old, qualityName: target.value as NoteName }
											: old
									)
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
			<div className="flex flex-col gap-5 p-4 w-full" onClick={activateAudio}>
				<div className="text-2xl font-semibold text-center text-cyan-700">
					Song Chart
				</div>
				<Stack direction="column" gap={1}>
					<ToggleButtonGroup
						aria-label="tonic"
						exclusive
						fullWidth
						onChange={(_event, newValue) => {
							if (newValue !== null) setTonicIndex(newValue);
						}}
						size="small"
						value={tonicIndex}
					>
						{NOTE_NAMES.map((noteName, index) => {
							const percentChordsOutOfKey =
								chordsInSong.filter((chord) =>
									notesInChord(chord).some(
										(noteNameInChord) =>
											!notesInScale(index).includes(noteNameInChord)
									)
								).length / chordsInSong.length;
							return (
								<ToggleButton
									aria-label={noteName}
									key={`tonic-${noteName}-${index}`}
									style={{
										backgroundColor: `hsl(${hueByNoteName[noteName]}, ${
											100 - 100 * percentChordsOutOfKey
										}%, ${75 + 25 * percentChordsOutOfKey}%)`,
									}}
									value={index}
								>
									{noteName}
								</ToggleButton>
							);
						})}
					</ToggleButtonGroup>
					<FormControlLabel
						control={
							<Switch
								checked={shouldShowEditor}
								onChange={(_event, newValue) => setShouldShowEditor(newValue)}
							/>
						}
						label="Show Editor"
					/>

					<Stack className="border-2" direction={{ md: "column", xl: "row" }}>
						{shouldShowEditor ? (
							<Editor
								className="max-w-2xl min-h-screen"
								defaultLanguage="json"
								defaultValue={JSON.stringify(sections)}
								height="100%"
								onChange={(newValue) => {
									if (newValue)
										try {
											setSections(JSON.parse(newValue));
										} catch (error) {
											// No-op
										}
								}}
								onMount={(editor, monaco) => {
									setTimeout(
										() =>
											editor.getAction("editor.action.formatDocument")?.run(),
										100
									);
									monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
										schemas: [
											{
												fileMatch: ["*"],
												schema: {
													description: "Section",
													items: sectionSchema,
													minItems: 1,
													type: "array",
													uniqueItems: true,
												},
												uri: "song-chart",
											},
										],
										validate: true,
									});
								}}
								options={{ tabSize: 2 }}
							/>
						) : null}
						<Stack className="w-full max-w-5xl">
							{sections.map((section, sectionIndex) => (
								<Stack
									key={`${section.name}-${sectionIndex}`}
									marginTop={0.5}
									width="100%"
								>
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
										{section.chords.map((chord, chordIndex) => {
											const percentNotesOutOfKey =
												notesInChord(chord).filter(
													(noteName) =>
														!notesInScale(tonicIndex).includes(noteName)
												).length / notesInChord(chord).length;
											return (
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
															if (event.detail === 1) {
																playChord({
																	audioCtx,
																	durationInSeconds: 0.5,
																	keyNumbers: notesInChord(chord)
																		.map((noteName) =>
																			NOTE_NAMES.indexOf(noteName)
																		)
																		.map(
																			(
																				indexOfNoteInNoteNames,
																				indexOfNoteInChord,
																				indexesOfNotesInChord
																			) =>
																				(indexOfNoteInChord > 0 &&
																				indexOfNoteInNoteNames <
																					indexesOfNotesInChord[
																						indexOfNoteInChord - 1
																					]
																					? indexOfNoteInNoteNames + 12
																					: indexOfNoteInNoteNames) +
																				C_KEY_NUMBER
																		),
																	oscillatorType: "sine",
																});
															}
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
															...(percentNotesOutOfKey > 0
																? {
																		border: `double rgb(255, 0, 0, ${
																			0.1 + 0.9 * percentNotesOutOfKey
																		}) ${2 + 6 * percentNotesOutOfKey}px`,
																  }
																: {}),
														}}
													>
														<Stack alignItems="center" direction="column">
															{chord.root &&
															chord.qualityName &&
															CHORD_QUALITY_BY_NAME[chord.qualityName] ? (
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
																		].decorate(
																			chord.root.includes("/")
																				? chord.root.split("/")[
																						Number(
																							circleOfFifths.indexOf(
																								NOTE_NAMES[tonicIndex]
																							) > 5
																						)
																				  ]
																				: chord.root
																		)}
																	</div>
																</>
															) : (
																"None"
															)}
														</Stack>
													</Stack>
												</div>
											);
										})}
									</Stack>
								</Stack>
							))}
						</Stack>
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
				</Stack>
			</div>
			<ChordDialog />
		</>
	);
};

export default SongChart;
