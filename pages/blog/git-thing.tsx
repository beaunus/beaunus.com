import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import ChartJS from "chart.js/auto";
import encHex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";
import multimatch from "multimatch";
import type { NextPage } from "next";
import Head from "next/head";
import { FC, ReactNode, useEffect, useRef, useState } from "react";

import { CommitTable } from "../../components/git-thing/CommitTable";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import {
  computeDateRange,
  computeStatsByFileName,
  GitCommit,
  parseCommitString,
  splitGitLog,
  Stats,
} from "../../utils/git";

const FILE_NAME_GLOB_DELAY_IN_MS = 1000;
const FILE_NAME_GLOB_EXCLUDE_DEFAULT = [
  "**/*.jpg",
  "**/*.png",
  "**/*json*",
  "**/*pdf*",
  "**/*sdk*",
  "**/*svg*",
  "**/*svg*/*",
  "package.json",
  "yarn.lock",
].join(" ");

const SCALE_TYPES = ["linear", "linear (abs)", "logarithmic"] as const;
type ScaleType = (typeof SCALE_TYPES)[number];

const NUM_MS_IN_ONE_DAY = 1000 * 60 * 60 * 24;

const GitThing: NextPage = () => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const [statsByFileName, setStatsByFileName] = useState<Record<string, Stats>>(
    {}
  );
  const [allCommits, setAllCommits] = useState<GitCommit[]>([]);
  const [authorsToInclude, setAuthorsToInclude] = useState<
    GitCommit["author"][]
  >([]);
  const [criteriaNumerator, setCriteriaNumerator] =
    useState<Criteria>("numCommits");
  const [criteriaDenominator, setCriteriaDenominator] =
    useState<Criteria>("one");
  const [scaleType, setScaleType] = useState<ScaleType>("linear");
  const [jumpSize, setJumpSize] = useState(1);
  const [numFilesToShow, setNumFilesToShow] = useState<number>(0);
  const [[historyStart, historyEnd], setHistoryRange] = useState<
    [Dayjs, Dayjs]
  >([dayjs(0), dayjs(0)]);
  const [numFilesInSelectedDayRange, setNumFilesInSelectedDayRange] =
    useState<number>(0);
  const [numFilesTotal, setNumFilesTotal] = useState<number>(0);
  const [fromDay, setFromDay] = useState<Dayjs>(dayjs(0));
  const [toDay, setToDay] = useState<Dayjs>(dayjs(0));
  const [fileNameGlobExclude, setFileNameGlobExclude] = useState(
    FILE_NAME_GLOB_EXCLUDE_DEFAULT
  );
  const [fileNameGlobExcludePending, setFileNameGlobExcludePending] = useState(
    FILE_NAME_GLOB_EXCLUDE_DEFAULT
  );
  const [
    mostRecentFileNameGlobExcludeEditTimestamp,
    setMostRecentFileNameGlobExcludeEditTimestamp,
  ] = useState(0);
  const [fileNameGlobInclude, setFileNameGlobInclude] = useState("");
  const [fileNameGlobIncludePending, setFileNameGlobIncludePending] =
    useState("");
  const [
    mostRecentFileNameGlobIncludeEditTimestamp,
    setMostRecentFileNameGlobIncludeEditTimestamp,
  ] = useState(0);
  const [isIntervalLocked, setIsIntervalLocked] = useState(false);
  const [focusedDataEntry, setFocusedDataEntry] = useState<[string, Stats]>();
  const [baseGithubRepository, setBaseGithubRepository] = useState("");

  const valueIterateeByCriteria: Record<
    string,
    (stats: Stats) => {
      details?: ReactNode;
      value: number;
    }
  > = {
    numAuthorDaysActive: ({ commits }) => {
      const authorDays = Array.from(
        new Set(
          commits.map(({ author, date }) =>
            JSON.stringify([dayjs(date).format("YYYY-MM-DD"), author])
          )
        )
      );
      const authorsByDayString = _.mapValues(
        _.groupBy(authorDays, (authorDay) => JSON.parse(authorDay)[0])
      );
      return {
        details: JSON.stringify(authorsByDayString),
        value: authorDays.length,
      };
    },
    numAuthorsTouching: ({ commits }) => ({
      value: new Set(commits.map(({ author }) => author)).size,
    }),
    numCommits: ({ commits }) => ({ value: commits.length }),
    numDaysActive: ({ commits }) => ({
      value: new Set(
        commits.map(({ date }) => dayjs(date).format("YYYY-MM-DD"))
      ).size,
    }),
    numLinesAdded: ({ numLinesAdded }) => ({ value: numLinesAdded }),
    numLinesChanged: ({ numLinesAdded, numLinesDeleted }) => ({
      value: numLinesAdded + numLinesDeleted,
    }),
    numLinesDeleted: ({ numLinesDeleted }) => ({ value: numLinesDeleted }),
    numLinesDiff: ({ numLinesAdded, numLinesDeleted }) => ({
      value: numLinesAdded - numLinesDeleted,
    }),
    one: () => ({ value: 1 }),
  };
  type Criteria = keyof typeof valueIterateeByCriteria;

  useEffect(() => {
    const newStatsByFileName = computeStatsByFileName(
      allCommits.filter(
        ({ author, date }) =>
          (!authorsToInclude.length || authorsToInclude.includes(author)) &&
          isDateWithinSelectedRange(date)
      )
    );
    setNumFilesInSelectedDayRange(Object.keys(newStatsByFileName).length);
    setStatsByFileName(newStatsByFileName);
  }, [authorsToInclude, allCommits, fromDay, toDay]);

  useEffect(() => {
    if (barChartRef.current) {
      const valueIterateeNumerator = valueIterateeByCriteria[criteriaNumerator];
      const valueIterateeDenominator =
        valueIterateeByCriteria[criteriaDenominator];

      const fileNamesToInclude = multimatch(
        Object.keys(statsByFileName),
        fileNameGlobInclude.split(" ")
      );
      const fileNamesToExclude = multimatch(
        Object.keys(statsByFileName),
        fileNameGlobExclude.split(" ")
      );

      const dataEntries = Object.entries(
        Object.fromEntries(
          _.sortBy(
            Object.entries(statsByFileName).filter(
              ([fileName]) =>
                (!fileNameGlobInclude ||
                  fileNamesToInclude.includes(fileName)) &&
                (!fileNameGlobExclude || !fileNamesToExclude.includes(fileName))
            ),
            ([, stats]) =>
              -(scaleType === "linear (abs)"
                ? Math.abs(
                    valueIterateeNumerator(stats).value /
                      valueIterateeDenominator(stats).value
                  )
                : valueIterateeNumerator(stats).value /
                  valueIterateeDenominator(stats).value)
          ).slice(0, numFilesToShow)
        )
      );

      const barChart = new ChartJS(barChartRef.current, {
        data: {
          datasets: [
            {
              backgroundColor: dataEntries.map(
                ([fileName]) =>
                  `#${sha256(fileName).toString(encHex).slice(0, 6)}`
              ),
              data: dataEntries.map(
                ([, stats]) =>
                  valueIterateeNumerator(stats).value /
                  valueIterateeDenominator(stats).value
              ),
            },
          ],
          labels: dataEntries.map(([filename]) => filename),
        },
        options: {
          animation: false,
          indexAxis: "y",
          maintainAspectRatio: false,
          normalized: true,
          onClick: (_event, elements) => {
            if (elements?.[0]?.index !== undefined) {
              setFocusedDataEntry(dataEntries[elements?.[0].index]);
            }
          },
          plugins: { legend: { display: false } },
          scales: {
            myScale: {
              axis: "x",
              position: "top",
              type:
                scaleType === "linear" || scaleType === "linear (abs)"
                  ? "linear"
                  : "logarithmic",
            },
          },
        },
        type: "bar",
      });

      return () => {
        barChart.destroy();
      };
    }
  }, [
    criteriaDenominator,
    criteriaNumerator,
    fileNameGlobExclude,
    fileNameGlobInclude,
    numFilesToShow,
    scaleType,
    statsByFileName,
  ]);

  const isDateWithinSelectedRange = (date: Date | Dayjs | string | number) => {
    const dateValue =
      date instanceof Date || date instanceof Dayjs
        ? date.valueOf()
        : typeof date === "string"
        ? new Date(date).valueOf()
        : date;
    return dateValue >= fromDay.valueOf() && dateValue < toDay.valueOf();
  };

  const UploadButton: FC = () => (
    <Button component="label" fullWidth size="small" variant="contained">
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

            if (target.files?.[0].name)
              setBaseGithubRepository(
                target.files[0].name.split(".")[0].replaceAll(":", "/")
              );
            setAllCommits(commitsFromFile);
            setHistoryRange(dateRangeOfCommits);
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
      <div className="flex flex-col gap-5 px-14 w-full">
        <div className="text-2xl font-semibold text-center text-cyan-700">
          Git thing
        </div>
        <Typography>
          Use a command like this to generate the Git log file.
        </Typography>
        <code>
          git -C{" {path to git repository} "}log --numstat{" > "}
          {" {path to outfile [prefix with organization/repo]}"}
        </code>
        <Grid alignItems="center" container spacing={2}>
          <Grid item xs={3}>
            <UploadButton />
          </Grid>
          <Grid item xs={9}>
            <TextField
              InputLabelProps={{ shrink: true }}
              fullWidth
              label="Base Github repository"
              onChange={({ target }) => {
                setBaseGithubRepository(target.value);
              }}
              size="small"
              value={baseGithubRepository}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormLabel id="criteria-label">Criteria (numerator)</FormLabel>
            <RadioGroup
              aria-labelledby="criteria-label"
              defaultValue="numCommits"
              name="criteria-group"
              onChange={(e) => setCriteriaNumerator(e.target.value as Criteria)}
              value={criteriaNumerator}
            >
              <div className="flex flex-wrap">
                {Object.keys(valueIterateeByCriteria).map((name) => (
                  <FormControlLabel
                    control={<Radio size="small" />}
                    key={name}
                    label={name}
                    value={name}
                  />
                ))}
              </div>
            </RadioGroup>
          </Grid>
          <Grid item xs={6}>
            <FormLabel id="criteria-label">Criteria (denominator)</FormLabel>
            <RadioGroup
              aria-labelledby="criteria-label"
              defaultValue="numCommits"
              name="criteria-group"
              onChange={(e) =>
                setCriteriaDenominator(e.target.value as Criteria)
              }
              value={criteriaDenominator}
            >
              <div className="flex flex-wrap">
                {Object.keys(valueIterateeByCriteria).map((name) => (
                  <FormControlLabel
                    control={<Radio size="small" />}
                    key={name}
                    label={name}
                    value={name}
                  />
                ))}
              </div>
            </RadioGroup>
          </Grid>
        </Grid>
        <FormLabel id="scale-label">Scale</FormLabel>
        <RadioGroup
          aria-labelledby="scale-label"
          defaultValue="liner"
          name="scale-group"
          onChange={(e) => setScaleType(e.target.value as ScaleType)}
          row
          value={scaleType}
        >
          {SCALE_TYPES.map((scaleTypeLabel) => (
            <FormControlLabel
              control={<Radio size="small" />}
              key={scaleTypeLabel}
              label={scaleTypeLabel}
              value={scaleTypeLabel}
            />
          ))}
        </RadioGroup>
        <Autocomplete
          defaultValue={[]}
          filterSelectedOptions
          id="authors"
          multiple
          onChange={(_event, newAuthors) => setAuthorsToInclude(newAuthors)}
          options={_.uniq(allCommits.map(({ author }) => author)).sort()}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Authors"
              placeholder="Authors"
              size="small"
            />
          )}
          size="small"
        />

        <div className="flex gap-4">
          <SliderWithLabels
            className="grow"
            disabled={!numFilesToShow}
            displayValue={`Showing ${numFilesToShow} (of ${numFilesInSelectedDayRange})`}
            label="Number of files to show"
            max={numFilesTotal}
            min={1}
            onChange={(_event, newValue) => setNumFilesToShow(Number(newValue))}
            size="small"
            step={1}
            value={numFilesToShow}
          />
          <ButtonGroup aria-label="num files button group">
            {[10, 25, 50, 100].map((numFiles) => (
              <Button
                key={`${numFiles}-num-files-button`}
                onClick={() => setNumFilesToShow(numFiles)}
                size="small"
              >
                {numFiles}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <FormLabel id="date-slider-label">Date Range</FormLabel>
        <SliderWithLabels
          disabled={!historyStart}
          max={historyEnd.add(1, "day").valueOf()}
          min={historyStart.valueOf()}
          onChange={(_event, newValue) => {
            const [leftValue, rightValue] = (newValue as number[]).map(Number);
            const interval = toDay.diff(fromDay);
            if (isIntervalLocked) {
              const isLeftSliderMovingLeft = leftValue < fromDay.valueOf();
              const isLeftSliderMovingRight = leftValue > fromDay.valueOf();
              const isThereSpaceToMoveRight =
                leftValue + interval < historyEnd.valueOf();

              const isRightSliderMovingRight = rightValue > toDay.valueOf();
              const isRightSliderMovingLeft = rightValue < toDay.valueOf();
              const isThereSpaceToMoveLeft =
                rightValue - interval >= historyStart.valueOf();

              if (
                isLeftSliderMovingLeft ||
                (isLeftSliderMovingRight && isThereSpaceToMoveRight)
              ) {
                setFromDay(dayjs(leftValue));
                setToDay(dayjs(leftValue + interval));
              } else if (
                isRightSliderMovingRight ||
                (isRightSliderMovingLeft && isThereSpaceToMoveLeft)
              ) {
                setFromDay(dayjs(rightValue - interval));
                setToDay(dayjs(rightValue));
              }
            } else {
              setFromDay(dayjs(leftValue));
              setToDay(dayjs(rightValue));
            }
          }}
          size="small"
          step={NUM_MS_IN_ONE_DAY}
          value={
            fromDay && toDay ? [fromDay.valueOf(), toDay.valueOf()] : undefined
          }
          valueLabelDisplay="auto"
          valueLabelFormat={(timestamp) =>
            dayjs(timestamp).format("YYYY-MM-DD")
          }
        />
        <div className="flex gap-1 justify-between">
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Num days to jump"
            onChange={({ target }) => {
              setJumpSize(Math.max(Number(target.value), 1));
            }}
            size="small"
            type="number"
            value={jumpSize}
          />
          <ButtonGroup aria-label="jump button group">
            <Button
              onClick={() => {
                const isSpaceToDecrement =
                  fromDay >= historyStart.add(jumpSize, "days");

                if (isSpaceToDecrement) {
                  setFromDay((old) => old.subtract(jumpSize, "day"));
                  setToDay((old) => old.subtract(jumpSize, "day"));
                }
              }}
              size="small"
            >
              <KeyboardDoubleArrowLeftIcon />
            </Button>
            <Button
              onClick={() => {
                const isSpaceToIncrement =
                  toDay <= historyEnd.subtract(jumpSize, "days");

                if (isSpaceToIncrement) {
                  setFromDay((old) => old.add(jumpSize, "day"));
                  setToDay((old) => old.add(jumpSize, "day"));
                }
              }}
              size="small"
            >
              <KeyboardDoubleArrowRightIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="snap button group">
            {[7, 14, 28, 28 * 6].map((numDaysToSnapTo) => (
              <Button
                key={`${numDaysToSnapTo}-snap`}
                onClick={() =>
                  setFromDay(toDay.subtract(numDaysToSnapTo, "days"))
                }
                size="small"
              >
                {numDaysToSnapTo} days
              </Button>
            ))}
          </ButtonGroup>
          <FormControlLabel
            control={<Switch />}
            label="Lock interval"
            onChange={(_event, newValue) => setIsIntervalLocked(newValue)}
            value={isIntervalLocked}
          />
        </div>
        <div className="flex gap-2">
          <TextField
            InputLabelProps={{ shrink: true }}
            className="grow"
            label="File Name Glob (Include)"
            onChange={({ target }) => {
              setFileNameGlobIncludePending(target.value);
              setMostRecentFileNameGlobIncludeEditTimestamp(Date.now());
              setTimeout(() => {
                if (
                  Date.now() - mostRecentFileNameGlobIncludeEditTimestamp >=
                  FILE_NAME_GLOB_DELAY_IN_MS
                )
                  setFileNameGlobInclude(target.value);
              }, FILE_NAME_GLOB_DELAY_IN_MS);
            }}
            size="small"
            value={fileNameGlobIncludePending}
          />
          <TextField
            InputLabelProps={{ shrink: true }}
            className="grow"
            label="File Name Glob (Exclude)"
            onChange={({ target }) => {
              setFileNameGlobExcludePending(target.value);
              setMostRecentFileNameGlobExcludeEditTimestamp(Date.now());
              setTimeout(() => {
                if (
                  Date.now() - mostRecentFileNameGlobExcludeEditTimestamp >=
                  FILE_NAME_GLOB_DELAY_IN_MS
                )
                  setFileNameGlobExclude(target.value);
              }, FILE_NAME_GLOB_DELAY_IN_MS);
            }}
            size="small"
            value={fileNameGlobExcludePending}
          />
        </div>
        <canvas className="max-h-[50vh]" ref={barChartRef} />
        {focusedDataEntry ? (
          <>
            <Typography variant="h5">{focusedDataEntry[0]}</Typography>
            <TableContainer>
              <Table aria-label="criteria table" size="small">
                <TableHead>
                  <TableRow className="whitespace-nowrap">
                    <TableCell component="th">Criteria</TableCell>
                    <TableCell component="th">Value</TableCell>
                    <TableCell component="th">Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(valueIterateeByCriteria)
                    .filter(([criteria]) => criteria !== "one")
                    .map(([criteria, valueIteratee]) => {
                      const { value, details } = valueIteratee(
                        statsByFileName[focusedDataEntry[0]]
                      );
                      return (
                        <TableRow key={`criteria-value-${criteria}`}>
                          <TableCell>{criteria}</TableCell>
                          <TableCell>{value}</TableCell>
                          <TableCell>{details}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <CommitTable
              baseGithubRepository={baseGithubRepository}
              commits={focusedDataEntry[1].commits.filter(
                ({ author }) =>
                  !authorsToInclude.length || authorsToInclude.includes(author)
              )}
              relevantFilePath={focusedDataEntry[0]}
            />
          </>
        ) : null}
      </div>
    </>
  );
};

export default GitThing;
const thign = {
  "2023-03-16": ['["2023-03-16","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2023-03-15": [
    '["2023-03-15","Polly Lechte <polly.sutcliffe@octoenergy.com>"]',
    '["2023-03-15","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2023-03-14": [
    '["2023-03-14","MarySed <marysedarous011@gmail.com>"]',
    '["2023-03-14","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2023-03-14","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2023-03-13": ['["2023-03-13","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-03-10": ['["2023-03-10","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-03-09": ['["2023-03-09","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-03-08": [
    '["2023-03-08","Beau Dobbin <beau@beaunus.com>"]',
    '["2023-03-08","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2023-03-07": ['["2023-03-07","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2023-03-02": [
    '["2023-03-02","Polly Lechte <polly.sutcliffe@octoenergy.com>"]',
  ],
  "2023-02-21": ['["2023-02-21","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-02-16": ['["2023-02-16","MarySed <marysedarous011@gmail.com>"]'],
  "2023-02-13": ['["2023-02-13","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-02-09": ['["2023-02-09","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2023-02-07": ['["2023-02-07","MarySed <marysedarous011@gmail.com>"]'],
  "2023-02-06": ['["2023-02-06","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2023-02-03": ['["2023-02-03","Beau Dobbin <beau@beaunus.com>"]'],
  "2023-02-02": [
    '["2023-02-02","Joluma <joel.mafuta@octoenergy.com>"]',
    '["2023-02-02","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2023-01-27": ['["2023-01-27","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2023-01-26": ['["2023-01-26","MarySed <marysedarous011@gmail.com>"]'],
  "2023-01-25": [
    '["2023-01-25","Beau Dobbin <beau@beaunus.com>"]',
    '["2023-01-25","Akina Ohira <56147732+akinaohira@users.noreply.github.com>"]',
  ],
  "2023-01-24": ['["2023-01-24","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2023-01-20": ['["2023-01-20","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2023-01-19": ['["2023-01-19","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2023-01-17": [
    '["2023-01-17","Akina Ohira <56147732+akinaohira@users.noreply.github.com>"]',
    '["2023-01-17","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2023-01-17","MarySed <marysedarous011@gmail.com>"]',
  ],
  "2023-01-16": [
    '["2023-01-16","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2023-01-16","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2023-01-06": ['["2023-01-06","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2023-01-05": ['["2023-01-05","MarySed <marysedarous011@gmail.com>"]'],
  "2022-12-27": ['["2022-12-27","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-12-21": ['["2022-12-21","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2022-12-19": [
    '["2022-12-19","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-12-19","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-12-16": ['["2022-12-16","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2022-12-12": ['["2022-12-12","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-12-08": ['["2022-12-08","MarySed <marysedarous011@gmail.com>"]'],
  "2022-12-07": [
    '["2022-12-07","Akina Ohira <56147732+akinaohira@users.noreply.github.com>"]',
  ],
  "2022-12-06": ['["2022-12-06","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-11-17": ['["2022-11-17","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-11-16": ['["2022-11-16","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-11-15": ['["2022-11-15","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-11-10": ['["2022-11-10","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-11-09": [
    '["2022-11-09","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-11-09","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-11-09","Polly Lechte <polly.sutcliffe@octoenergy.com>"]',
  ],
  "2022-11-02": ['["2022-11-02","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-28": ['["2022-10-28","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-27": ['["2022-10-27","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-20": ['["2022-10-20","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2022-10-19": ['["2022-10-19","Joluma <joel.mafuta@octoenergy.com>"]'],
  "2022-10-18": ['["2022-10-18","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-12": ['["2022-10-12","MarySed <marysedarous011@gmail.com>"]'],
  "2022-10-07": ['["2022-10-07","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-05": ['["2022-10-05","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-10-03": ['["2022-10-03","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-09-30": [
    '["2022-09-30","Polly Sutcliffe <polly.sutcliffe@octoenergy.com>"]',
  ],
  "2022-09-29": [
    '["2022-09-29","Polly Sutcliffe <polly.sutcliffe@octoenergy.com>"]',
    '["2022-09-29","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-09-27": [
    '["2022-09-27","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-09-27","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-09-26": [
    '["2022-09-26","Polly Sutcliffe <polly.sutcliffe@octoenergy.com>"]',
  ],
  "2022-09-20": ['["2022-09-20","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-09-15": ['["2022-09-15","Joluma <j.mafuta@gmail.com>"]'],
  "2022-09-14": ['["2022-09-14","Joluma <j.mafuta@gmail.com>"]'],
  "2022-09-12": ['["2022-09-12","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-09-09": ['["2022-09-09","Joluma <j.mafuta@gmail.com>"]'],
  "2022-09-08": ['["2022-09-08","Joluma <j.mafuta@gmail.com>"]'],
  "2022-09-05": ['["2022-09-05","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-08-26": ['["2022-08-26","MarySed <marysedarous011@gmail.com>"]'],
  "2022-08-24": ['["2022-08-24","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-08-23": [
    '["2022-08-23","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-08-23","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-08-22": ['["2022-08-22","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-08-18": ['["2022-08-18","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-08-17": ['["2022-08-17","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-08-16": [
    '["2022-08-16","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-08-16","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-08-15": [
    '["2022-08-15","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-08-15","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-08-12": ['["2022-08-12","Joluma <j.mafuta@gmail.com>"]'],
  "2022-08-10": ['["2022-08-10","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-08-09": ['["2022-08-09","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-08-08": [
    '["2022-08-08","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-08-08","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-08-08","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-08-05": [
    '["2022-08-05","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-08-05","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-08-04": [
    '["2022-08-04","Joluma <j.mafuta@gmail.com>"]',
    '["2022-08-04","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-08-04","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-08-04","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-08-03": [
    '["2022-08-03","MarySed <marysedarous011@gmail.com>"]',
    '["2022-08-03","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-08-03","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-08-02": ['["2022-08-02","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-08-01": [
    '["2022-08-01","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-08-01","MarySed <marysedarous011@gmail.com>"]',
    '["2022-08-01","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-07-29": [
    '["2022-07-29","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-29","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-07-28": [
    '["2022-07-28","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-28","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-07-28","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-07-28","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-07-27": [
    '["2022-07-27","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-27","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-07-27","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-27","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-07-26": [
    '["2022-07-26","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-26","Joluma <j.mafuta@gmail.com>"]',
  ],
  "2022-07-25": [
    '["2022-07-25","Joluma <j.mafuta@gmail.com>"]',
    '["2022-07-25","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-07-25","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-25","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-07-22": ['["2022-07-22","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-07-21": ['["2022-07-21","Joluma <j.mafuta@gmail.com>"]'],
  "2022-07-20": ['["2022-07-20","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-07-19": [
    '["2022-07-19","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-19","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-19","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-07-15": [
    '["2022-07-15","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-07-15","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-15","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-15","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-07-14": [
    '["2022-07-14","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-07-14","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-14","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-07-13": [
    '["2022-07-13","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-13","MarySed <marysedarous011@gmail.com>"]',
    '["2022-07-13","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-07-12": [
    '["2022-07-12","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-12","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-07-11": [
    '["2022-07-11","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-11","MarySed <marysedarous011@gmail.com>"]',
  ],
  "2022-07-08": [
    '["2022-07-08","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-08","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-07-07": [
    '["2022-07-07","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-07","MarySed <marysedarous011@gmail.com>"]',
  ],
  "2022-07-06": [
    '["2022-07-06","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-07-06","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-06","Joluma <j.mafuta@gmail.com>"]',
    '["2022-07-06","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-07-05": [
    '["2022-07-05","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-07-05","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-07-04": ['["2022-07-04","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-07-01": [
    '["2022-07-01","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-06-30": ['["2022-06-30","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-06-29": ['["2022-06-29","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-06-28": ['["2022-06-28","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-06-27": ['["2022-06-27","Earl Floden <earl.mark.27@gmail.com>"]'],
  "2022-06-24": [
    '["2022-06-24","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-06-24","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-06-24","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-06-22": ['["2022-06-22","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-06-21": ['["2022-06-21","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-06-20": [
    '["2022-06-20","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-06-20","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-06-17": [
    '["2022-06-17","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-06-17","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-06-16": ['["2022-06-16","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-06-13": [
    '["2022-06-13","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-06-13","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-06-10": [
    '["2022-06-10","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-06-10","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-06-09": [
    '["2022-06-09","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-06-09","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-06-08": [
    '["2022-06-08","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-06-08","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-06-07": ['["2022-06-07","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-06-03": [
    '["2022-06-03","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-06-03","akinaohira <akina.ohira@octoenergy.com>"]',
  ],
  "2022-06-02": ['["2022-06-02","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-06-01": ['["2022-06-01","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-05-31": ['["2022-05-31","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-05-30": [
    '["2022-05-30","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-05-30","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-05-26": ['["2022-05-26","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-05-25": [
    '["2022-05-25","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-05-25","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-05-24": ['["2022-05-24","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-23": ['["2022-05-23","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-20": ['["2022-05-20","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-19": [
    '["2022-05-19","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-05-18": [
    '["2022-05-18","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-05-17": [
    '["2022-05-17","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-05-17","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-05-16": [
    '["2022-05-16","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-05-16","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-05-16","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-05-12": ['["2022-05-12","MarySed <marysedarous011@gmail.com>"]'],
  "2022-05-11": ['["2022-05-11","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-10": [
    '["2022-05-10","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-05-10","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-05-10","akinaohira <akina.ohira@octoenergy.com>"]',
    '["2022-05-10","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-05-09": ['["2022-05-09","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-06": ['["2022-05-06","akinaohira <akina.ohira@octoenergy.com>"]'],
  "2022-05-04": [
    '["2022-05-04","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-05-04","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-05-03": ['["2022-05-03","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-05-02": [
    '["2022-05-02","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-05-02","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-04-29": ['["2022-04-29","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-04-27": ['["2022-04-27","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-04-26": ['["2022-04-26","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-04-25": [
    '["2022-04-25","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-04-25","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-04-21": ['["2022-04-21","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-04-20": [
    '["2022-04-20","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-04-20","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-04-19": ['["2022-04-19","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-04-15": [
    '["2022-04-15","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-04-14": [
    '["2022-04-14","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-04-14","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-04-13": [
    '["2022-04-13","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-04-13","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-04-12": ['["2022-04-12","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-04-08": [
    '["2022-04-08","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-04-08","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-04-07": [
    '["2022-04-07","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-04-07","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-04-07","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-04-07","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-04-06": [
    '["2022-04-06","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-04-06","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-04-06","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-04-05": [
    '["2022-04-05","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-04-05","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-04-04": [
    '["2022-04-04","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-04-04","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-04-04","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-04-04","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-04-01": ['["2022-04-01","Beau Dobbin <beau@beaunus.com>"]'],
  "2022-03-31": [
    '["2022-03-31","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-31","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-30": [
    '["2022-03-30","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-30","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-03-29": [
    '["2022-03-29","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-29","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-03-28": [
    '["2022-03-28","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-28","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-03-28","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-03-25": [
    '["2022-03-25","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-03-25","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-25","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-24": [
    '["2022-03-24","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-24","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-03-23": [
    '["2022-03-23","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-23","Earl Floden <earl.mark.27@gmail.com>"]',
    '["2022-03-23","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-03-23","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-22": ['["2022-03-22","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-03-18": [
    '["2022-03-18","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-18","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-18","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-03-17": [
    '["2022-03-17","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-17","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-17","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-03-16": [
    '["2022-03-16","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-16","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-16","Beau Dobbin <beau@beaunus.com>"]',
    '["2022-03-16","Earl Floden <earl.mark.27@gmail.com>"]',
  ],
  "2022-03-15": [
    '["2022-03-15","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-15","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-15","Beau Dobbin <beau@beaunus.com>"]',
  ],
  "2022-03-14": [
    '["2022-03-14","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
    '["2022-03-14","sidiousvic <sidiousvic@gmail.com>"]',
  ],
  "2022-03-11": [
    '["2022-03-11","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-11","Victor René Molina Rodríguez <sidiousvic@gmail.com>"]',
    '["2022-03-11","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-10": [
    '["2022-03-10","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-10","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-09": ['["2022-03-09","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-03-08": [
    '["2022-03-08","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-08","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-07": [
    '["2022-03-07","sidiousvic <sidiousvic@gmail.com>"]',
    '["2022-03-07","Nao <45124890+NowNewNao@users.noreply.github.com>"]',
  ],
  "2022-03-06": ['["2022-03-06","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-03-04": ['["2022-03-04","sidiousvic <sidiousvic@gmail.com>"]'],
  "2022-03-03": ['["2022-03-03","sidiousvic <sidiousvic@gmail.com>"]'],
};
