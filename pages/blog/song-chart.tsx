import { ReorderOutlined } from "@mui/icons-material";
import { Chip, FormControlLabel, Stack } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
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
type NoteName = (typeof NOTE_NAMES)[number];
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

const circleOfFifths = NOTE_NAMES.map(
  (_noteName, index) => NOTE_NAMES[(index * 7) % NOTE_NAMES.length]
);

const hueByNoteName = Object.fromEntries(
  circleOfFifths.map((noteName, index) => [
    noteName,
    (index / circleOfFifths.length) * 360,
  ])
);

type ChordQuality = {
  decorate: (label: string) => ReactNode;
  spelling: number[];
};

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

const NUM_BEATS_PER_ROW = 16;

type Section = {
  chords: {
    chord: { qualityName: keyof typeof CHORD_QUALITY_BY_NAME; root: NoteName };
    durationInBeats: number;
  }[];
  name: string;
};

const NORMALIZATION_VALUES = ["none", "sum", "max"] as const;

type NormalizationValue = (typeof NORMALIZATION_VALUES)[number];

const sections: Section[] = [
  {
    chords: [
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
    ],
    name: "Intro",
  },
  {
    chords: [
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
    ],
    name: "Verse",
  },
  {
    chords: [
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "B" }, durationInBeats: 8 },
    ],
    name: "PreChorus",
  },
  {
    chords: [
      { chord: { qualityName: "minor", root: "E" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "D" }, durationInBeats: 1.5 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 2.5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "B" }, durationInBeats: 4 },
    ],
    name: "Chorus",
  },
  {
    chords: [
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
    ],
    name: "Verse",
  },
  {
    chords: [
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 1.5 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 5 },
      { chord: { qualityName: "major", root: "B" }, durationInBeats: 8 },
    ],
    name: "PreChorus",
  },
  {
    chords: [
      { chord: { qualityName: "minor", root: "E" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "D" }, durationInBeats: 1.5 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 2.5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "B" }, durationInBeats: 4 },
    ],
    name: "Chorus",
  },
  {
    chords: [
      { chord: { qualityName: "minorSeventh", root: "A" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 8 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 4 },
    ],
    name: "Bridge",
  },
  {
    chords: [
      { chord: { qualityName: "minor", root: "E" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "D" }, durationInBeats: 1.5 },
      { chord: { qualityName: "major", root: "G" }, durationInBeats: 2.5 },
      { chord: { qualityName: "major", root: "C" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "B" }, durationInBeats: 4 },
      { chord: { qualityName: "minor", root: "A" }, durationInBeats: 4 },
      { chord: { qualityName: "major", root: "B" }, durationInBeats: 4 },
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
            (noteNameCounts, { chord, durationInBeats }) => {
              const indexOfRoot = NOTE_NAMES.indexOf(chord.root);
              const notesInChord = CHORD_QUALITY_BY_NAME[
                chord.qualityName
              ].spelling.map(
                (numHalfSteps) =>
                  NOTE_NAMES[(indexOfRoot + numHalfSteps) % NOTE_NAMES.length]
              );
              return Object.assign(
                noteNameCounts,
                Object.fromEntries(
                  notesInChord.map((noteName) => [
                    noteName,
                    (noteNameCounts[noteName] ?? 0) + durationInBeats,
                  ])
                )
              );
            },
            {}
          ),
      ]
    )
  );

  const noteNameCounts = Object.values(noteNameCountsBySection).reduce(
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
    Object.entries(noteNameCounts).flatMap(([noteName, count]) =>
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
        <Stack direction={{ xl: "row", md: "column" }}>
          <List className="w-full max-w-5xl">
            {sections.map((section, sectionIndex) => (
              <ListItem key={`${section.name}-${sectionIndex}`}>
                <ListItemButton alignItems="flex-start">
                  <ListItemIcon>
                    <ReorderOutlined />
                  </ListItemIcon>
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
                        <Chip
                          key={`${section}-${sectionIndex}-${chord}-${chordIndex}`}
                          label={
                            <>
                              {CHORD_QUALITY_BY_NAME[
                                chord.chord.qualityName
                              ].decorate(
                                FUNCTION_BY_INTERVAL[
                                  (NOTE_NAMES.indexOf(chord.chord.root) -
                                    tonicIndex +
                                    12) %
                                    12
                                ]
                              )}
                              <br />
                              {CHORD_QUALITY_BY_NAME[
                                chord.chord.qualityName
                              ].decorate(chord.chord.root)}
                            </>
                          }
                          sx={{
                            backgroundColor: `hsl(${
                              hueByNoteName[chord.chord.root]
                            }, 100%, 50%, 0.3)`,
                            height: "auto",
                            textAlign: "center",
                            width: `${
                              100 * (chord.durationInBeats / NUM_BEATS_PER_ROW)
                            }%`,
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </ListItemButton>
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
