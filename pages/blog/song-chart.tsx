import Editor from "@monaco-editor/react";
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	ListItemText,
	Radio,
	RadioGroup,
	Stack,
	Switch,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import ChartJS, { ScriptableContext } from "chart.js/auto";
import _ from "lodash";
import LZString from "lz-string";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { isBrowser } from "../../utils";
import { playChord } from "../../utils/audio";
import {
	Chord,
	CHORD_QUALITY_BY_NAME,
	CIRCLE_OF_FIFTHS,
	FUNCTION_BY_INTERVAL,
	KEY_NUMBER_C,
	NoteName,
	notesInChord,
	notesInScale,
	NOTE_NAMES,
} from "../../utils/constants/music";

const NORMALIZATION_VALUES = ["none", "sum", "max"] as const;
type NormalizationValue = (typeof NORMALIZATION_VALUES)[number];
const NUM_BEATS_PER_ROW = 8;

const chordSchema = {
	$schema: "http://json-schema.org/draft-07/schema#",
	properties: {
		bass: { enum: NOTE_NAMES, type: "string" },
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

const hueByNoteName = Object.fromEntries(
	CIRCLE_OF_FIFTHS.map((noteName, index) => [
		noteName,
		(index / CIRCLE_OF_FIFTHS.length) * 360,
	])
);

const ChordLabel: React.FC<{ chord: Chord; tonicIndex: number }> = ({
	chord,
	tonicIndex,
}) =>
	chord.root &&
	chord.qualityName &&
	CHORD_QUALITY_BY_NAME[chord.qualityName] ? (
		<Stack alignItems="center" direction="column">
			<div>
				{CHORD_QUALITY_BY_NAME[chord.qualityName].decorate(
					FUNCTION_BY_INTERVAL[
						(NOTE_NAMES.indexOf(chord.root) - tonicIndex + 12) % 12
					]
				)}
				{chord.bass
					? ` / ${
							FUNCTION_BY_INTERVAL[
								(NOTE_NAMES.indexOf(chord.bass) - tonicIndex + 12) % 12
							]
					  }`
					: ""}
			</div>
			<div>
				{CHORD_QUALITY_BY_NAME[chord.qualityName].decorate(
					chord.root.includes("/")
						? chord.root.split("/")[
								Number(CIRCLE_OF_FIFTHS.indexOf(NOTE_NAMES[tonicIndex]) > 5)
						  ]
						: chord.root
				)}
				{chord.bass ? ` / ${chord.bass}` : ""}
			</div>
		</Stack>
	) : (
		<>None</>
	);

const SongChart: NextPage = () => {
	const radarChartRef = useRef<HTMLCanvasElement>(null);

	const router = useRouter();

	const [audioCtx, setAudioCtx] = useState<AudioContext>();
	const [mostRecentlyPlayedChord, setMostRecentlyPlayedChord] = useState<{
		chord: Chord;
		sectionName: Section["name"];
	}>();
	const [normalization, setNormalization] = useState<NormalizationValue>("max");
	const [octaveBass, setOctaveBass] = useState(-2);
	const [octaveChord, setOctaveChord] = useState(0);
	const [sections, setSections] = useState<Section[]>([]);
	const [shouldShowEditor, setShouldShowEditor] = useState(false);
	const [tonicIndex, setTonicIndex] = useState(0);

	function activateAudio() {
		if (!audioCtx) setAudioCtx(new window.AudioContext());
	}

	const hueBySectionName = Object.fromEntries(
		_.uniqBy(sections, "name").map(({ name }, index, { length }) => [
			name,
			(index / length) * 360,
		])
	);

	const chordsInSong = _.uniqBy(
		sections.flatMap((section) => section.chords ?? []),
		({ qualityName, root }) => `${root}-${qualityName}`
	).filter(({ root }) => root);

	const noteNameCountsBySection = Object.fromEntries(
		Object.entries(_.groupBy(sections, "name")).map(
			([sectionName, instances]) => [
				sectionName,
				instances
					.flatMap(({ chords }) => chords)
					.reduce<Partial<Record<NoteName, number>>>(
						(noteNameCounts, chord) =>
							chord
								? Object.assign(
										noteNameCounts,
										Object.fromEntries(
											notesInChord(chord).map((noteName) => [
												noteName,
												(noteNameCounts[noteName] ?? 0) + chord.durationInBeats,
											])
										)
								  )
								: {},
						{}
					),
			]
		)
	);

	useEffect(function loadSectionsFromUrl() {
		if (isBrowser()) {
			const encodedSectionsFromUrl = new URLSearchParams(
				window.location.search
			).get("sections");
			if (encodedSectionsFromUrl) {
				setSections(
					JSON.parse(LZString.decompressFromBase64(encodedSectionsFromUrl))
				);
			}
		}
	}, []);

	useEffect(
		function updateQueryString() {
			if (sections.length)
				router.replace(
					{},
					{
						query: {
							sections: LZString.compressToBase64(JSON.stringify(sections)),
						},
					}
				);
		},
		[router, sections]
	);

	useEffect(
		function createChart() {
			if (radarChartRef.current) {
				const radarChart = new ChartJS(radarChartRef.current, {
					data: {
						datasets: Object.entries(noteNameCountsBySection).map(
							([sectionName, noteNameCountsForSection]) => ({
								backgroundColor: `hsl(${hueBySectionName[sectionName]}, 100%, 50%, 0.5)`,
								data: CIRCLE_OF_FIFTHS.map(
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
								pointBackgroundColor: `hsl(${hueBySectionName[sectionName]}, 100%, 30%)`,
								pointRadius: (context: ScriptableContext<"radar">) => {
									const indexesOfMostRecentlyPlayedChord =
										mostRecentlyPlayedChord
											? notesInChord(mostRecentlyPlayedChord.chord).map(
													(noteName) => NOTE_NAMES.indexOf(noteName)
											  )
											: [];
									const indexOfThisNote = NOTE_NAMES.indexOf(
										CIRCLE_OF_FIFTHS[context.dataIndex]
									);
									return sectionName === mostRecentlyPlayedChord?.sectionName &&
										indexesOfMostRecentlyPlayedChord.includes(indexOfThisNote)
										? 10
										: 2;
								},
								showLine: false,
							})
						),
						labels: CIRCLE_OF_FIFTHS,
					},
					options: {
						animation: false,
						scales: {
							r: {
								angleLines: { display: true },
								grid: { display: false, drawTicks: false },
								min: 0,
								pointLabels: {
									color: ({ label }) =>
										`hsl(${hueByNoteName[label]}, 100%, 30%)`,
									font: { size: 20 },
								},
								startAngle:
									300 - CIRCLE_OF_FIFTHS.indexOf(NOTE_NAMES[tonicIndex]) * 30,
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
		[
			hueBySectionName,
			mostRecentlyPlayedChord,
			normalization,
			noteNameCountsBySection,
			tonicIndex,
		]
	);

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
					<Stack direction="row">
						<FormControlLabel
							control={
								<Switch
									checked={shouldShowEditor}
									onChange={(_event, newValue) => setShouldShowEditor(newValue)}
								/>
							}
							label="Show Editor"
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							id="chord-octave-number"
							label="Chord Octave"
							onChange={({ target }) => setOctaveChord(Number(target.value))}
							type="number"
							value={octaveChord}
						/>
						<TextField
							InputLabelProps={{ shrink: true }}
							id="bass-octave-number"
							label="Bass Octave"
							onChange={({ target }) => setOctaveBass(Number(target.value))}
							type="number"
							value={octaveBass}
						/>
					</Stack>

					<Stack direction={{ md: "column", xl: "row" }}>
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
											backgroundColor: `hsl(${
												hueBySectionName[section.name]
											}, 100%, 50%, 0.5)`,
										}}
									/>
									<Stack
										direction="row"
										flexWrap="wrap"
										marginTop={1}
										rowGap={1}
									>
										{section.chords?.map((chord, chordIndex) => {
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
														onClick={() => {
															const keyNumbers = notesInChord(chord)
																.map((noteName) => NOTE_NAMES.indexOf(noteName))
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
																		KEY_NUMBER_C +
																		octaveChord * 12
																);
															playChord({
																audioCtx,
																durationInSeconds: 0.5,
																keyNumbers: keyNumbers.concat(
																	keyNumbers[0] + octaveBass * 12
																),
																oscillatorType: "sine",
															});
															setMostRecentlyPlayedChord({
																chord,
																sectionName: section.name,
															});
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
														<ChordLabel chord={chord} tonicIndex={tonicIndex} />
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
		</>
	);
};

export default SongChart;
