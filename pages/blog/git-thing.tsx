import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { TextField, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ChartJS from "chart.js/auto";
import dayjs, { Dayjs } from "dayjs";
import Linkify from "linkify-react";
import _ from "lodash";
import multimatch from "multimatch";
import type { NextPage } from "next";
import Head from "next/head";
import { FC, useEffect, useRef, useState } from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
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
  "**/*json*",
  "**/*pdf*",
  "**/*sdk*",
  "**/*svg*",
  "**/*svg*/*",
  "package.json",
  "yarn.lock",
].join(" ");

type ScaleType = "linear" | "logarithmic";

const NUM_MS_IN_ONE_DAY = 1000 * 60 * 60 * 24;

const GitThing: NextPage = () => {
  const polarAreaChartRef = useRef<HTMLCanvasElement>(null);
  const [statsByFileName, setStatsByFileName] = useState<Record<string, Stats>>(
    {}
  );
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [authorsToInclude, setAuthorsToInclude] = useState<
    GitCommit["author"][]
  >([]);
  const [criteria, setCriteria] = useState<Criteria>("numCommits");
  const [scaleType, setScaleType] = useState<ScaleType>("linear");
  const [jumpSize, setJumpSize] = useState(1);
  const [numFilesToShow, setNumFilesToShow] = useState<number>(0);
  const [dateRangeOfHistory, setDateRangeOfHistory] = useState<[Dayjs, Dayjs]>([
    dayjs(0),
    dayjs(0),
  ]);
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

  const valueIterateeByCriteria: Record<string, (stats: Stats) => number> = {
    numCommits: ({ numCommits }) => numCommits,
    numDaysActive: ({ daysActive }) =>
      Array.from(daysActive).filter(
        (date) =>
          new Date(date) >= fromDay.toDate() && new Date(date) < toDay.toDate()
      ).length,
    numLinesAdded: ({ numLinesAdded }) => numLinesAdded,
    numLinesChanged: ({ numLinesAdded, numLinesDeleted }) =>
      numLinesAdded + numLinesDeleted,
    numLinesDeleted: ({ numLinesDeleted }) => numLinesDeleted,
    numLinesDiff: ({ numLinesAdded, numLinesDeleted }) =>
      numLinesAdded - numLinesDeleted,
  };
  type Criteria = keyof typeof valueIterateeByCriteria;

  useEffect(() => {
    const newStatsByFileName = computeStatsByFileName(
      commits.filter(
        ({ author, date }) =>
          (!authorsToInclude.length || authorsToInclude.includes(author)) &&
          isDateWithinSelectedRange(date)
      )
    );
    setNumFilesInSelectedDayRange(Object.keys(newStatsByFileName).length);
    setStatsByFileName(newStatsByFileName);
  }, [authorsToInclude, commits, fromDay, toDay]);

  useEffect(() => {
    if (polarAreaChartRef.current) {
      const valueIteratee = valueIterateeByCriteria[criteria];

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
            ([, value]) => -valueIteratee(value)
          ).slice(0, numFilesToShow)
        )
      );

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
          normalized: true,
          onClick: (_event, elements) => {
            if (elements?.[0]?.index !== undefined) {
              setFocusedDataEntry(dataEntries[elements?.[0].index]);
            }
          },
          plugins: { legend: { display: false } },
          scales: { myScale: { axis: "x", position: "top", type: scaleType } },
        },
        type: "bar",
      });

      return () => {
        polarAreaChart.destroy();
      };
    }
  }, [
    criteria,
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
      <div className="flex flex-col gap-5 px-14 w-full">
        <div className="text-2xl font-semibold text-center text-cyan-700">
          Git thing
        </div>
        <Typography>
          Use a command like this to generate the Git log file.
        </Typography>
        <code>
          git -C{" {path to git repository} "}log --numstat{" > "}
          {" {path to file that you want to create}"}
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
          <Grid item xs={9}>
            <FormLabel id="criteria-label">Criteria</FormLabel>
            <RadioGroup
              aria-labelledby="criteria-label"
              defaultValue="numCommits"
              name="criteria-group"
              onChange={(e) => setCriteria(e.target.value as Criteria)}
              value={criteria}
            >
              <div className="flex flex-wrap">
                {Object.keys(valueIterateeByCriteria).map((name) => (
                  <FormControlLabel
                    control={<Radio />}
                    key={name}
                    label={name}
                    value={name}
                  />
                ))}
              </div>
            </RadioGroup>
          </Grid>
          <Grid item xs={3}>
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
          </Grid>
        </Grid>
        <Autocomplete
          defaultValue={[]}
          filterSelectedOptions
          id="authors"
          multiple
          onChange={(_event, newAuthors) => setAuthorsToInclude(newAuthors)}
          options={_.uniq(commits.map(({ author }) => author)).sort()}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Authors"
              placeholder="Authors"
              size="small"
            />
          )}
        />

        <div className="flex gap-4">
          <SliderWithLabels
            className="grow"
            disabled={!numFilesToShow}
            displayValue={numFilesToShow.toFixed(0) ?? ""}
            label="Number of files to show"
            max={numFilesTotal}
            min={1}
            onChange={(_event, newValue) =>
              setNumFilesToShow(
                Math.min(numFilesInSelectedDayRange, Number(newValue))
              )
            }
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
          disabled={!dateRangeOfHistory}
          max={dateRangeOfHistory?.[1].add(1, "day").valueOf()}
          min={dateRangeOfHistory?.[0].valueOf()}
          onChange={(_event, newValue) => {
            const newValues = (newValue as number[]).map(Number);
            const oldInterval = toDay.diff(fromDay);
            if (isIntervalLocked) {
              const isLeftSliderMovingLeft = newValues[0] < fromDay.valueOf();
              const isLeftSliderMovingRight = newValues[0] > fromDay.valueOf();
              const isThereSpaceToMoveRight =
                newValues[0] + oldInterval < dateRangeOfHistory[1].valueOf();

              const isRightSliderMovingRight = newValues[1] > toDay.valueOf();
              const isRightSliderMovingLeft = newValues[1] < toDay.valueOf();
              const isThereSpaceToMoveLeft =
                newValues[1] - oldInterval >= dateRangeOfHistory[0].valueOf();

              if (
                isLeftSliderMovingLeft ||
                (isLeftSliderMovingRight && isThereSpaceToMoveRight)
              ) {
                setFromDay(dayjs(newValues[0]));
                setToDay(dayjs(newValues[0] + oldInterval));
              } else if (
                isRightSliderMovingRight ||
                (isRightSliderMovingLeft && isThereSpaceToMoveLeft)
              ) {
                setFromDay(dayjs(newValues[1] - oldInterval));
                setToDay(dayjs(newValues[1]));
              }
            } else {
              setFromDay(dayjs(newValues[0]));
              setToDay(dayjs(newValues[1]));
            }
          }}
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
                const isThereSpaceToDecrement =
                  fromDay >= dateRangeOfHistory[0].add(jumpSize, "days");

                if (isThereSpaceToDecrement) {
                  setFromDay((old) => old.subtract(jumpSize, "day"));
                  setToDay((old) => old.subtract(jumpSize, "day"));
                }
              }}
            >
              <KeyboardDoubleArrowLeftIcon />
            </Button>
            <Button
              onClick={() => {
                const isThereSpaceToIncrement =
                  toDay <= dateRangeOfHistory[1].subtract(jumpSize, "days");

                if (isThereSpaceToIncrement) {
                  setFromDay((old) => old.add(jumpSize, "day"));
                  setToDay((old) => old.add(jumpSize, "day"));
                }
              }}
            >
              <KeyboardDoubleArrowRightIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="snap button group">
            {[7, 28, 28 * 6].map((numDaysToSnapTo) => (
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
        <canvas className="max-h-[50vh]" ref={polarAreaChartRef} />
        {focusedDataEntry ? (
          <div>
            <Typography variant="h5">{focusedDataEntry[0]}</Typography>
            <TableContainer>
              <Table aria-label="commit table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>commitHash</TableCell>
                    <TableCell>date</TableCell>
                    <TableCell>author</TableCell>
                    <TableCell>message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {focusedDataEntry[1].commits
                    .filter(
                      ({ author, date }) =>
                        isDateWithinSelectedRange(date) &&
                        (!authorsToInclude.length ||
                          authorsToInclude.includes(author))
                    )
                    .map((commit) => (
                      <TableRow
                        key={commit.commitHash}
                        sx={{
                          // eslint-disable-next-line @typescript-eslint/naming-convention
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <HighlightedLink
                            href={`https://github.com/${baseGithubRepository}/commit/${commit.commitHash}`}
                          >
                            <code>{commit.commitHash.slice(0, 7)}</code>
                          </HighlightedLink>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {dayjs(commit.date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {commit.author.split(" <")[0]}
                        </TableCell>
                        <TableCell className="whitespace-pre-line">
                          <Linkify
                            options={{
                              render: ({
                                attributes: { href, ...props },
                                content,
                              }) => (
                                <HighlightedLink href={href} {...props}>
                                  {content}
                                </HighlightedLink>
                              ),
                            }}
                          >
                            <strong>{commit.message.split("\n")[0]}</strong>
                            {commit.message.split("\n").slice(1).join("\n")}
                          </Linkify>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default GitThing;
