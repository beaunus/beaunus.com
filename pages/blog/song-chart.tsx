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
import { useEffect, useRef, useState } from "react";

import { stringToHsl } from "../../utils";

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

const CIRCLE_OF_FIFTHS = NOTE_NAMES.map(
  (_noteName, index) => NOTE_NAMES[(index * 7) % NOTE_NAMES.length]
);

const CHORD_QUALITY = {
  major: { label: "", spelling: [0, 4, 7] },
  minor: { label: "m", spelling: [0, 3, 7] },
  minorSeventh: { label: "m7", spelling: [0, 3, 7, 10] },
};

const NUM_BEATS_PER_ROW = 16;

type Chord = { name: NoteName; quality: keyof typeof CHORD_QUALITY };

type Section = {
  chords: { chord: Chord; durationInBeats: number }[];
  name: string;
};

const NORMALIZATION_VALUES = ["none", "sum", "max"] as const;

type NormalizationValue = (typeof NORMALIZATION_VALUES)[number];

const sections: Section[] = [
  {
    chords: [
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
    ],
    name: "Intro",
  },
  {
    chords: [
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
    ],
    name: "Verse",
  },
  {
    chords: [
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "B", quality: "major" }, durationInBeats: 8 },
    ],
    name: "PreChorus",
  },
  {
    chords: [
      { chord: { name: "E", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 4 },
      { chord: { name: "D", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 2.5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "major" }, durationInBeats: 4 },
    ],
    name: "Chorus",
  },
  {
    chords: [
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
      { chord: { name: "A", quality: "minorSeventh" }, durationInBeats: 8 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 8 },
    ],
    name: "Verse",
  },
  {
    chords: [
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 1.5 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 5 },
      { chord: { name: "B", quality: "major" }, durationInBeats: 8 },
    ],
    name: "PreChorus",
  },
  {
    chords: [
      { chord: { name: "E", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 4 },
      { chord: { name: "D", quality: "major" }, durationInBeats: 1.5 },
      { chord: { name: "G", quality: "major" }, durationInBeats: 2.5 },
      { chord: { name: "C", quality: "major" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "A", quality: "minor" }, durationInBeats: 4 },
      { chord: { name: "B", quality: "major" }, durationInBeats: 4 },
    ],
    name: "Chorus",
  },
];

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
              const indexOfRoot = NOTE_NAMES.indexOf(chord.name);
              const notesInChord = CHORD_QUALITY[chord.quality].spelling.map(
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
    (acc, cur) =>
      Object.assign(
        acc,
        Object.fromEntries(
          Object.entries(cur).map(([noteName, count]) => [
            noteName,
            (acc[noteName as NoteName] ?? 0) + count,
          ])
        )
      ),
    {}
  );
  const meanIndexInCircleOfFifths = _.mean(
    Object.entries(noteNameCounts).flatMap(([noteName, count]) =>
      Array(count).fill(CIRCLE_OF_FIFTHS.indexOf(noteName as NoteName))
    )
  );

  useEffect(
    function createChart() {
      if (radarChartRef.current) {
        const radarChart = new ChartJS(radarChartRef.current, {
          data: {
            datasets: Object.entries(noteNameCountsBySection).map(
              ([sectionName, noteNameCountsForSection]) => ({
                backgroundColor: stringToHsl(sectionName),
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
              })
            ),
            labels: CIRCLE_OF_FIFTHS,
          },
          options: {
            scales: {
              r: {
                angleLines: { display: true },
                grid: { display: false, drawTicks: false },
                startAngle: meanIndexInCircleOfFifths * 360,
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
                      primary={section.name}
                      style={{ backgroundColor: stringToHsl(section.name) }}
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
                          label={`${chord.chord.name}${
                            CHORD_QUALITY[chord.chord.quality].label
                          }`}
                          sx={{
                            backgroundColor: "#fec",
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
