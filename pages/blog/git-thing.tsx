import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ChartJS from "chart.js/auto";
import _ from "lodash";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import {
  computeDateRange,
  computeStatsByFileName,
  GitCommit,
  parseCommitString,
  splitGitLog,
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

const GitThing: NextPage = () => {
  const polarAreaChartRef = React.useRef<HTMLCanvasElement>(null);
  const [statsByFileName, setStatsByFileName] = React.useState<
    Record<string, Stats>
  >({});
  const [criteria, setCriteria] = React.useState<Criteria>("numCommits");
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear");
  const [fileNameSliceIndex, setFileNameSliceIndex] = React.useState<number>(0);
  const [dateRange, setDateRange] = React.useState<[Date, Date]>();

  React.useEffect(() => {
    if (polarAreaChartRef.current) {
      const statsByFileNameSorted = Object.fromEntries(
        _.sortBy(Object.entries(statsByFileName), ([, value]) =>
          valueIterateeByCriteria[criteria](value)
        ).reverse()
      );

      const polarAreaChart = new ChartJS(polarAreaChartRef.current, {
        data: {
          datasets: [
            {
              data: Object.values(statsByFileNameSorted)
                .slice(...(fileNameSliceIndex ? [0, fileNameSliceIndex] : []))
                .map(valueIterateeByCriteria[criteria]),
            },
          ],
          labels: Object.keys(statsByFileNameSorted).slice(
            ...(fileNameSliceIndex ? [0, fileNameSliceIndex] : [])
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
  }, [criteria, fileNameSliceIndex, scaleType, statsByFileName]);

  const UploadButton: React.FC = () => (
    <Button component="label" variant="contained">
      Upload
      <input
        accept=".txt"
        hidden
        onChange={({ target }) => {
          target.files?.[0].text().then((gitLogString) => {
            const commits = splitGitLog(gitLogString).map(parseCommitString);
            setStatsByFileName(computeStatsByFileName(commits));
            setDateRange(computeDateRange(commits));
          });
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
              displayValue={(
                Object.keys(statsByFileName).length + fileNameSliceIndex
              ).toFixed(0)}
              label="Number of files to show"
              sliderMax={0}
              sliderMin={-(Object.keys(statsByFileName).length - 1)}
              sliderOnChange={(_event, newValue) =>
                setFileNameSliceIndex(newValue as number)
              }
              sliderValue={fileNameSliceIndex}
            />
            {dateRange
              ? `This history goes from ${dateRange[0].toLocaleString()} to 
            ${dateRange[1].toLocaleString()}`
              : null}
            <canvas className="max-h-screen" ref={polarAreaChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default GitThing;
