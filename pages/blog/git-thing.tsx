import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import ChartJS from "chart.js/auto";
import dayjs, { Dayjs } from "dayjs";
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
  const [commits, setCommits] = React.useState<GitCommit[]>([]);
  const [criteria, setCriteria] = React.useState<Criteria>("numCommits");
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear");
  const [numFilesToShow, setNumFilesToShow] = React.useState<number>(0);
  const [dateRangeOfHistory, setDateRangeOfHistory] =
    React.useState<[Dayjs, Dayjs]>();
  const [numFilesInSelectedDayRange, setNumFilesInSelectedDayRange] =
    React.useState<number>(0);
  const [numFilesTotal, setNumFilesTotal] = React.useState<number>(0);
  const [fromDay, setFromDay] = React.useState<Dayjs>(dayjs());
  const [toDay, setToDay] = React.useState<Dayjs>(dayjs());

  React.useEffect(() => {
    const [fromDate, toDate] = [fromDay, toDay].map((day) => day.toDate());
    const newStatsByFileName = computeStatsByFileName(
      commits.filter(({ date }) => date >= fromDate && date < toDate)
    );
    setNumFilesInSelectedDayRange(Object.keys(newStatsByFileName).length);
    setStatsByFileName(newStatsByFileName);
  }, [commits, fromDay, toDay]);

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
                .slice(...(numFilesToShow ? [0, numFilesToShow] : []))
                .map(valueIterateeByCriteria[criteria]),
            },
          ],
          labels: Object.keys(statsByFileNameSorted).slice(
            ...(numFilesToShow ? [0, numFilesToShow] : [])
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
  }, [criteria, numFilesToShow, scaleType, statsByFileName]);

  const UploadButton: React.FC = () => (
    <Button component="label" variant="contained">
      Upload
      <input
        accept=".txt"
        hidden
        onChange={({ target }) => {
          target.files?.[0].text().then((gitLogString) => {
            const commitsFromFile =
              splitGitLog(gitLogString).map(parseCommitString);
            const dateRangeOfCommits = computeDateRange(commitsFromFile);
            const newNumFilesTotal = Object.keys(
              computeStatsByFileName(commitsFromFile)
            ).length;

            setCommits(commitsFromFile);
            setDateRangeOfHistory(dateRangeOfCommits);
            setFromDay(dateRangeOfCommits[0]);
            setNumFilesToShow(newNumFilesTotal);
            setNumFilesTotal(newNumFilesTotal);
            setToDay(dateRangeOfCommits[1]);
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
              disabled={!numFilesToShow}
              displayValue={numFilesToShow.toFixed(0) ?? ""}
              label="Number of files to show"
              max={numFilesTotal}
              min={1}
              onChange={(_event, newValue) =>
                setNumFilesToShow(
                  Math.min(numFilesInSelectedDayRange, newValue as number)
                )
              }
              value={numFilesToShow}
            />
            <SliderWithLabels
              disabled={!dateRangeOfHistory}
              max={dateRangeOfHistory?.[1].add(1, "day").valueOf()}
              min={dateRangeOfHistory?.[0].valueOf()}
              onChange={(_event, newValue) => {
                const [newFromDayTimestamp, newToDayTimestamp] =
                  newValue as number[];
                setFromDay(dayjs(newFromDayTimestamp));
                setToDay(dayjs(newToDayTimestamp));
              }}
              value={
                fromDay && toDay
                  ? [fromDay.valueOf(), toDay.valueOf()]
                  : undefined
              }
              valueLabelDisplay="auto"
              valueLabelFormat={(timestamp) =>
                dayjs(timestamp).format("YYYY-MM-DD")
              }
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="flex">
                <DatePicker
                  disabled={!dateRangeOfHistory}
                  label="From date"
                  onChange={(newValue) => {
                    if (newValue) setFromDay(newValue);
                  }}
                  value={fromDay}
                />
                <DatePicker
                  disabled={!dateRangeOfHistory}
                  label="To date"
                  onChange={(newValue) => {
                    if (newValue) setToDay(newValue);
                  }}
                  value={toDay}
                />
              </div>
            </LocalizationProvider>
            {dateRangeOfHistory
              ? `This history goes from ${dateRangeOfHistory[0].toLocaleString()} to 
            ${dateRangeOfHistory[1].toLocaleString()}`
              : null}
            <canvas className="max-h-screen" ref={polarAreaChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default GitThing;
