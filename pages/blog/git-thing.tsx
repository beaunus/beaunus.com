import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import {
  computeStatsByFileName,
  parseCommitString,
  Stats,
} from "../../utils/git";

type Criteria =
  | "numCommits"
  | "numLinesAdded"
  | "numLinesDeleted"
  | "numLinesChanged";

type ScaleType = "linear" | "logarithmic";

const valueIterateeByCriteria: Record<Criteria, (stats: Stats) => number> = {
  numCommits: ({ numCommits }) => numCommits,
  numLinesAdded: ({ numLinesAdded }) => numLinesAdded,
  numLinesChanged: ({ numLinesAdded, numLinesDeleted }) =>
    numLinesAdded + numLinesDeleted,
  numLinesDeleted: ({ numLinesDeleted }) => numLinesDeleted,
};

const compareFnByCriteria: Record<
  Criteria,
  (statsA: Stats, statsB: Stats) => number
> = {
  numCommits: (a, b) =>
    a.numCommits > b.numCommits ? -1 : a.numCommits < b.numCommits ? 1 : 0,
  numLinesAdded: (a, b) =>
    a.numLinesAdded > b.numLinesAdded
      ? -1
      : a.numLinesAdded < b.numLinesAdded
      ? 1
      : 0,
  numLinesChanged: (a, b) =>
    a.numLinesAdded + a.numLinesDeleted > b.numLinesAdded + b.numLinesDeleted
      ? -1
      : a.numLinesAdded + a.numLinesDeleted <
        b.numLinesAdded + b.numLinesDeleted
      ? 1
      : 0,
  numLinesDeleted: (a, b) =>
    a.numLinesDeleted > b.numLinesDeleted
      ? -1
      : a.numLinesDeleted < b.numLinesDeleted
      ? 1
      : 0,
};

const GitThing: NextPage = () => {
  const polarAreaChartRef = React.useRef<HTMLCanvasElement>(null);
  const [statsByFileName, setStatsByFileName] = React.useState<
    Record<string, Stats>
  >({});
  const [criteria, setCriteria] = React.useState<Criteria>("numCommits");
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear");
  const [limit, setLimit] = React.useState<number>(0);

  React.useEffect(() => {
    if (polarAreaChartRef.current) {
      const statsByFileNameSorted = Object.fromEntries(
        Object.entries(statsByFileName).sort(([, a], [, b]) =>
          compareFnByCriteria[criteria](a, b)
        )
      );
      const polarAreaChart = new ChartJS(polarAreaChartRef.current, {
        data: {
          datasets: [
            {
              data: Object.values(statsByFileNameSorted)
                .slice(...(limit ? [0, limit] : []))
                .map(valueIterateeByCriteria[criteria]),
            },
          ],
          labels: Object.keys(statsByFileNameSorted).slice(
            ...(limit ? [0, limit] : [])
          ),
        },
        options: {
          indexAxis: "y",
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { myScale: { axis: "x", type: scaleType } },
        },

        type: "bar",
      });

      return () => {
        polarAreaChart.destroy();
      };
    }
  }, [criteria, limit, scaleType, statsByFileName]);

  const UploadButton: React.FC = () => (
    <Button component="label" variant="contained">
      Upload
      <input
        accept=".txt"
        hidden
        onChange={async (e) => {
          setStatsByFileName(
            computeStatsByFileName(
              `\n${await e.target.files?.[0].text()}`
                .split(/\ncommit /)
                .slice(1)
                .map(parseCommitString)
            )
          );
        }}
        type="file"
      />
    </Button>
  );

  return (
    <>
      <Head>
        <title>Git thing | Beaunus</title>
      </Head>
      <div className="flex flex-col grow gap-2">
        <Segment>
          <div className="flex flex-col gap-5 w-full">
            <div className="text-2xl font-semibold text-center text-cyan-700">
              Git thing
            </div>
            <UploadButton />
            <FormControl>
              <FormLabel id="criteria-label">Criteria</FormLabel>
              <RadioGroup
                aria-labelledby="criteria-label"
                defaultValue="numCommits"
                name="criteria-group"
                onChange={(e) => setCriteria(e.target.value as Criteria)}
                value={criteria}
              >
                <FormControlLabel
                  control={<Radio />}
                  label="Number of commits"
                  value="numCommits"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Number of lines added"
                  value="numLinesAdded"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Number of lines deleted"
                  value="numLinesDeleted"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Number of lines changed"
                  value="numLinesChanged"
                />
              </RadioGroup>
              <FormLabel id="scale-label">Scale</FormLabel>
              <RadioGroup
                aria-labelledby="scale-label"
                defaultValue="liner"
                name="scale-group"
                onChange={(e) => setScaleType(e.target.value as ScaleType)}
                row
                value={scaleType}
              >
                <FormControlLabel
                  control={<Radio />}
                  label="Linear"
                  value="linear"
                />
                <FormControlLabel
                  control={<Radio />}
                  label="Logarithmic"
                  value="logarithmic"
                />
              </RadioGroup>
              <SliderWithLabels
                displayValue={limit.toFixed(0)}
                label="Limit"
                sliderMax={Object.keys(statsByFileName).length}
                sliderMin={0}
                sliderOnChange={(_event, newValue) =>
                  setLimit(newValue as number)
                }
                sliderValue={limit}
              />
            </FormControl>
            <canvas className="max-h-screen" ref={polarAreaChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default GitThing;
