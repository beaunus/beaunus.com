import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
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
import multimatch from "multimatch";
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

type ScaleType = "linear" | "logarithmic";

const valueIterateeByCriteria: Record<string, (stats: Stats) => number> = {
  numCommits: ({ numCommits }) => numCommits,
  numLinesAdded: ({ numLinesAdded }) => numLinesAdded,
  numLinesChanged: ({ numLinesAdded, numLinesDeleted }) =>
    numLinesAdded + numLinesDeleted,
  numLinesDeleted: ({ numLinesDeleted }) => numLinesDeleted,
};
type Criteria = keyof typeof valueIterateeByCriteria;

const GitThing: NextPage = () => {
  const polarAreaChartRef = React.useRef<HTMLCanvasElement>(null);
  const [statsByFileName, setStatsByFileName] = React.useState<
    Record<string, Stats>
  >({});
  const [commits, setCommits] = React.useState<GitCommit[]>([]);
  const [criteria, setCriteria] = React.useState<Criteria>("numCommits");
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear");
  const [jumpSize, setJumpSize] = React.useState(1);
  const [numFilesToShow, setNumFilesToShow] = React.useState<number>(0);
  const [dateRangeOfHistory, setDateRangeOfHistory] = React.useState<
    [Dayjs, Dayjs]
  >([dayjs(), dayjs()]);
  const [numFilesInSelectedDayRange, setNumFilesInSelectedDayRange] =
    React.useState<number>(0);
  const [numFilesTotal, setNumFilesTotal] = React.useState<number>(0);
  const [fromDay, setFromDay] = React.useState<Dayjs>(dayjs());
  const [toDay, setToDay] = React.useState<Dayjs>(dayjs());
  const [fileNameGlob, setFileNameGlob] = React.useState("");

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
      const valueIteratee = valueIterateeByCriteria[criteria];

      const filenamesToInclude = multimatch(
        Object.keys(statsByFileName),
        fileNameGlob.split(" ")
      );

      const dataEntries = Object.entries(
        Object.fromEntries(
          _.sortBy(
            Object.entries(statsByFileName).filter(
              ([filename]) =>
                !filenamesToInclude.length ||
                filenamesToInclude.includes(filename)
            ),
            ([, value]) => -valueIteratee(value)
          )
        )
      ).slice(0, numFilesToShow);

      const polarAreaChart = new ChartJS(polarAreaChartRef.current, {
        data: {
          datasets: [
            { data: dataEntries.map(([, stats]) => valueIteratee(stats)) },
          ],
          labels: dataEntries.map(([filename]) => filename),
        },
        options: {
          animation: false,
          indexAxis: "y",
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { myScale: { axis: "x", position: "top", type: scaleType } },
        },

        type: "bar",
      });

      return () => {
        polarAreaChart.destroy();
      };
    }
  }, [criteria, fileNameGlob, numFilesToShow, scaleType, statsByFileName]);

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
            <div className="flex gap-1">
              <TextField
                InputLabelProps={{ shrink: true }}
                className="grow"
                label="Num days to increment"
                onChange={({ target }) => {
                  setJumpSize(Math.max(Number(target.value), 1));
                }}
                type="number"
                value={jumpSize}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                className="grow"
                label="Increment / Decrement"
                onChange={({ target }) => {
                  const shouldIncrement = Number(target.value) > 0;
                  const isThereSpaceToIncrement =
                    toDay <= dateRangeOfHistory[1].subtract(jumpSize, "days");
                  const isThereSpaceToDecrement =
                    fromDay >= dateRangeOfHistory[0].add(jumpSize, "days");

                  if (shouldIncrement && isThereSpaceToIncrement) {
                    setFromDay((old) => old.add(jumpSize, "day"));
                    setToDay((old) => old.add(jumpSize, "day"));
                  } else if (!shouldIncrement && isThereSpaceToDecrement) {
                    setFromDay((old) => old.subtract(jumpSize, "day"));
                    setToDay((old) => old.subtract(jumpSize, "day"));
                  }
                }}
                type="number"
                value={0}
              />
              <ButtonGroup
                aria-label="snap button group"
                className="grow"
                fullWidth
              >
                {[7, 28].map((numDaysToSnapTo) => (
                  <Button
                    key={`${numDaysToSnapTo}-snap`}
                    onClick={() =>
                      setFromDay(toDay.subtract(numDaysToSnapTo, "days"))
                    }
                  >
                    {numDaysToSnapTo} days
                  </Button>
                ))}
              </ButtonGroup>
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div className="flex gap-1">
                <DatePicker
                  className="grow"
                  disabled={!dateRangeOfHistory}
                  label="From date"
                  onChange={(newValue) => {
                    if (newValue) setFromDay(newValue);
                  }}
                  value={fromDay}
                />
                <DatePicker
                  className="grow"
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
            <TextField
              InputLabelProps={{ shrink: true }}
              label="File name glob"
              onChange={({ target }) => setFileNameGlob(target.value)}
              value={fileNameGlob}
            />
            <canvas className="max-h-[50vh]" ref={polarAreaChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default GitThing;
