import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";
import { sleep } from "../../utils/index";

type Experiment = {
  isRunning: () => boolean;
  pause: VoidFunction;
  performExperiment: VoidFunction;
};

const Poisson: NextPage = () => {
  const samplesChartRef = React.useRef<HTMLCanvasElement>(null);
  const barChartRef = React.useRef<HTMLCanvasElement>(null);

  const [countByGapSizeState, setCountByGapSizeState] = React.useState<
    Record<number, number>
  >({});
  const [currentExperiment, setCurrentExperiment] =
    React.useState<Experiment>();
  const [probabilityOfEvent, setProbabilityOfEvent] = React.useState(0.5);
  const [samplesState, setSamplesState] = React.useState(
    Array.from({ length: 100 }, () => false)
  );
  const [shouldShowSteps, setShouldShowSteps] = React.useState(true);
  const [numTrialsExponent, setNumTrialsExponent] = React.useState(2);
  const [percentProgress, setPercentProgress] = React.useState(0);
  const [windowSizeExponent, setWindowSizeExponent] = React.useState(0);

  const generateExperiment = (): Experiment => {
    let isRunningBit: boolean;
    const countByGapSize: Record<number, number> = {};
    let samples = Array.from({ length: 100 }, () => false);
    let i = 0,
      mostRecentTrueIndex = 0;
    setPercentProgress(0);

    return {
      isRunning: () => isRunningBit,
      pause: () => (isRunningBit = false),
      performExperiment: async () => {
        isRunningBit = true;

        for (; isRunningBit && i < 10 ** numTrialsExponent; ++i) {
          const didEventHappen = Math.random() < probabilityOfEvent;
          if (i > 0 && didEventHappen) {
            const thisGap = i - mostRecentTrueIndex;
            countByGapSize[thisGap] = (countByGapSize[thisGap] ?? 0) + 1;
            mostRecentTrueIndex = i;
          }
          samples = samples.slice(1).concat(didEventHappen);
          if (shouldShowSteps && i % 10 ** windowSizeExponent === 0) {
            setCountByGapSizeState(countByGapSize);
            setSamplesState(samples);
            setPercentProgress(100 * (i / 10 ** numTrialsExponent));
            await sleep(0);
          }
        }
        if (i === 10 ** numTrialsExponent) {
          setCountByGapSizeState(countByGapSize);
          setSamplesState(samples);
          setPercentProgress(100);
        }
      },
    };
  };

  React.useEffect(() => {
    if (samplesChartRef.current && barChartRef.current) {
      const samplesChart = new ChartJS(samplesChartRef.current, {
        data: {
          datasets: [{ data: samplesState.map(Number) }],
          labels: samplesState.map(() => ""),
        },
        options: {
          animation: { duration: 0 },
          plugins: { legend: { display: false } },
          scales: { y: { title: { display: true } } },
        },
        type: "bar",
      });

      const barChart = new ChartJS(barChartRef.current, {
        data: {
          datasets: [{ data: Object.values(countByGapSizeState) }],
          labels: Object.keys(countByGapSizeState),
        },
        options: {
          animation: { duration: 0 },
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Gap between positive results" },
          },
          scales: { y: { title: { display: true } } },
        },
        type: "bar",
      });

      return () => {
        samplesChart.destroy();
        barChart.destroy();
      };
    }
  }, [samplesState]);

  return (
    <>
      <Head>
        <title>Poisson | Beaunus</title>
      </Head>
      <div className="flex flex-col grow gap-2">
        <Segment>
          <div className="flex flex-col gap-5 w-full">
            <div className="text-2xl font-semibold text-center text-cyan-700">
              Poisson Process
            </div>
            <p>
              I listened to{" "}
              <HighlightedLink href="https://open.spotify.com/episode/4MrtwjM1PyWwmPIdvYcQph?si=ca26c63b50a84bab&t=787583">
                this episode
              </HighlightedLink>{" "}
              of <i>The Life Of The Mind</i> by Steven Pinker and was struck by
              the claim that &quot;the thing about a Poisson process (a purely
              random process) is that events seem to cluster.&quot;
            </p>
            <ul className="list-disc list-inside">
              I thought that this would be a good opportunity for me to:
              <li>Run an experiment to see how it looks, and</li>
              <li>
                Integrate{" "}
                <HighlightedLink href="https://www.chartjs.org">
                  Chart.js
                </HighlightedLink>{" "}
                into my blog
              </li>
            </ul>
            <p>
              The code itself can be found{" "}
              <HighlightedLink href="https://github.com/beaunus/beaunus.com/search?q=poisson+performExperiment">
                on Github
              </HighlightedLink>
              .
            </p>

            <Box>
              <Grid alignItems="center" container spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom>
                    <Tooltip title="How likely is the event?">
                      <span>Probability of event</span>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography gutterBottom>
                    {probabilityOfEvent.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Slider
                max={100}
                min={0}
                onChange={(_event, newValue) =>
                  setProbabilityOfEvent((newValue as number) / 100)
                }
                value={probabilityOfEvent * 100}
              />
            </Box>
            <Box>
              <Grid alignItems="center" container spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom>
                    <Tooltip title="How many individual events do you want to do?">
                      <span>Num Trials</span>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography gutterBottom>
                    {(10 ** numTrialsExponent).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Slider
                max={10}
                min={0}
                onChange={(_event, newValue) =>
                  setNumTrialsExponent(newValue as number)
                }
                value={numTrialsExponent}
              />
            </Box>
            <Box>
              <Grid alignItems="center" container spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom>
                    <Tooltip title="After how many individual events do you want to 'peek' at the results so far?">
                      <span>Window size</span>
                    </Tooltip>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography gutterBottom>
                    {(10 ** windowSizeExponent).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Slider
                max={10}
                min={0}
                onChange={(_event, newValue) =>
                  setWindowSizeExponent(newValue as number)
                }
                value={windowSizeExponent}
              />
            </Box>
            <Grid container spacing={2} width="100%">
              <Grid item>
                <Button
                  onClick={() => {
                    currentExperiment?.pause();
                    const a = generateExperiment();
                    setCurrentExperiment(a);
                    a.performExperiment();
                  }}
                  variant="outlined"
                >
                  <Tooltip title="Start a new experiment with the above configuration">
                    <span>Start</span>
                  </Tooltip>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    currentExperiment?.isRunning()
                      ? currentExperiment?.pause()
                      : currentExperiment?.performExperiment();
                  }}
                  variant="outlined"
                >
                  <Tooltip title="Pause or resume the currently running experiment">
                    <span>Toggle</span>
                  </Tooltip>
                </Button>
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      defaultChecked={shouldShowSteps}
                      onChange={(_event, newValue) =>
                        setShouldShowSteps(newValue)
                      }
                    />
                  }
                  label={
                    <Tooltip title="Do you want to 'peek' at the results throughout the experiment?">
                      <span>Show steps</span>
                    </Tooltip>
                  }
                />
              </Grid>
            </Grid>
            <div className="w-full">
              <Box>
                <Typography gutterBottom>Progress</Typography>
                <LinearProgress value={percentProgress} variant="determinate" />
              </Box>
              <canvas className="max-h-10" ref={samplesChartRef}></canvas>
              <canvas className="max-h-96" ref={barChartRef}></canvas>
            </div>
          </div>
        </Segment>
      </div>
    </>
  );
};

export default Poisson;
