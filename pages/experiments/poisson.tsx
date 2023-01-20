import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { sleep } from "../../utils/index";

type Experiment = {
  isRunning: () => boolean;
  pause: VoidFunction;
  performExperiment: VoidFunction;
};

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          color="text.secondary"
          component="div"
          variant="caption"
        >{`${props.value.toFixed(2)}%`}</Typography>
      </Box>
    </Box>
  );
}

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
  const [shouldShowSteps, setShouldShowSteps] = React.useState(false);
  const [numTrialsExponent, setNumTrialsExponent] = React.useState(5);
  const [percentProgress, setPercentProgress] = React.useState(0);
  const [windowSizeExponent, setWindowSizeExponent] = React.useState(1);
  const [numTrialsSoFar, setNumTrialsSoFar] = React.useState(0);
  const [numPositivesState, setNumPositives] = React.useState(0);

  const generateExperiment = (): Experiment => {
    let isRunningBit: boolean;
    const countByGapSize: Record<number, number> = {};
    let samples = Array.from({ length: 100 }, () => false);
    let i = 0,
      mostRecentTrueIndex = 0;
    let numPositives = 0;
    setNumTrialsSoFar(0);
    setNumPositives(0);
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
            ++numPositives;
          }
          samples = samples.slice(1).concat(didEventHappen);
          if (shouldShowSteps && i % 10 ** windowSizeExponent === 0) {
            setCountByGapSizeState(countByGapSize);
            setSamplesState(samples);
            setPercentProgress(100 * (i / 10 ** numTrialsExponent));
            setNumTrialsSoFar(i);
            setNumPositives(numPositives);
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
      <div className="flex flex-col grow gap-2 text-center">
        <div className="flex flex-col gap-5 px-3">
          <p>Poisson</p>

          <Box>
            <Grid alignItems="center" container spacing={2}>
              <Grid item>
                <Typography gutterBottom>Probability of event</Typography>
              </Grid>
              <Grid item xs>
                <Slider
                  max={100}
                  min={0}
                  onChange={(_event, newValue) =>
                    setProbabilityOfEvent((newValue as number) / 100)
                  }
                  value={probabilityOfEvent * 100}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>
                  {probabilityOfEvent.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Grid alignItems="center" container spacing={2}>
              <Grid item>
                <Typography gutterBottom>Num Trials</Typography>
              </Grid>
              <Grid item xs>
                <Slider
                  max={10}
                  min={0}
                  onChange={(_event, newValue) =>
                    setNumTrialsExponent(newValue as number)
                  }
                  value={numTrialsExponent}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>{10 ** numTrialsExponent}</Typography>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Grid alignItems="center" container spacing={2}>
              <Grid item>
                <Typography gutterBottom>Window size</Typography>
              </Grid>
              <Grid item xs>
                <Slider
                  max={10}
                  min={0}
                  onChange={(_event, newValue) =>
                    setWindowSizeExponent(newValue as number)
                  }
                  value={windowSizeExponent}
                />
              </Grid>
              <Grid item>
                <Typography gutterBottom>{10 ** windowSizeExponent}</Typography>
              </Grid>
            </Grid>
          </Box>

          <FormControlLabel
            control={
              <Switch
                onChange={(_event, newValue) => setShouldShowSteps(newValue)}
              />
            }
            label="Show steps"
          />
          <CircularProgressWithLabel
            value={100 * (numPositivesState / numTrialsSoFar)}
          />
          <Button
            onClick={() => {
              currentExperiment?.pause();
              const a = generateExperiment();
              setCurrentExperiment(a);
              a.performExperiment();
            }}
            variant="outlined"
          >
            Start
          </Button>
          <Button
            onClick={() => {
              currentExperiment?.isRunning()
                ? currentExperiment?.pause()
                : currentExperiment?.performExperiment();
            }}
            variant="outlined"
          >
            Toggle
          </Button>

          <div className="w-full">
            <LinearProgress value={percentProgress} variant="determinate" />
            <canvas className="max-h-10" ref={samplesChartRef}></canvas>
            <canvas className="max-h-96" ref={barChartRef}></canvas>
          </div>
        </div>
      </div>
    </>
  );
};

export default Poisson;
