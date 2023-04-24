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

const valueIterateeByCriteria: Record<
  string,
  (stats: Stats) => {
    details?: ReactNode;
    value: number;
  }
> = {
  numAuthorDaysActive: ({ commits }) => {
    const dayAuthorTuples: [string, string][] = _.uniqBy(
      commits.map(({ author, date }) => [
        dayjs(date).format("YYYY-MM-DD"),
        author,
      ]),
      JSON.stringify
    );
    const dayStringsByAuthor = _.mapValues(
      _.groupBy(dayAuthorTuples, ([, author]) => author),
      (tuples) => tuples.map(([dayString]) => dayString)
    );
    return {
      details: _.sortBy(
        Object.entries(dayStringsByAuthor),
        ([, dayStrings]) => -dayStrings.length
      ).map(([author, dayStrings]) => (
        <details key={author}>
          <summary>
            {author} - {dayStrings.length}
          </summary>
          <ul>
            {dayStrings.map((dayString) => (
              <li key={`${author}-${dayString}`}>{dayString}</li>
            ))}
          </ul>
        </details>
      )),
      value: dayAuthorTuples.length,
    };
  },
  numAuthorsTouching: ({ commits }) => ({
    value: new Set(commits.map(({ author }) => author)).size,
  }),
  numCommits: ({ commits }) => ({ value: commits.length }),
  numDaysActive: ({ commits }) => ({
    value: new Set(commits.map(({ date }) => dayjs(date).format("YYYY-MM-DD")))
      .size,
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
            {statsByFileName[focusedDataEntry[0]] ? (
              <>
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
                              <TableCell>
                                {details ? (
                                  <details>
                                    <summary>details</summary>
                                    {details}
                                  </details>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <CommitTable
                  baseGithubRepository={baseGithubRepository}
                  commits={focusedDataEntry[1].commits.filter(
                    ({ author, date }) =>
                      isDateWithinSelectedRange(date) &&
                      (!authorsToInclude.length ||
                        authorsToInclude.includes(author))
                  )}
                  relevantFilePath={focusedDataEntry[0]}
                />
              </>
            ) : (
              "The selected file did not exist at this point in the history"
            )}
          </>
        ) : null}
      </div>
    </>
  );
};

export default GitThing;
