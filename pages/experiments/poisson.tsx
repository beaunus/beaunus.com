import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
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
  const [windowSizeExponent, setWindowSizeExponent] = React.useState(1);

  const generateExperiment = (): Experiment => {
    let isRunningBit: boolean;
    const countByGapSize: Record<number, number> = {};
    let samples = Array.from({ length: 100 }, () => false);

    return {
      isRunning: () => isRunningBit,
      pause: () => (isRunningBit = false),
      performExperiment: async () => {
        isRunningBit = true;

        for (
          let i = 0, mostRecentTrueIndex = 0;
          isRunningBit && i < 10 ** numTrialsExponent;
          ++i
        ) {
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
            await sleep(0);
          }
        }
        setCountByGapSizeState(countByGapSize);
        setSamplesState(samples);
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
            <Typography gutterBottom id="input-slider">
              Probability of event
            </Typography>
            <Grid alignItems="center" container spacing={2}>
              <Grid item>%</Grid>
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
                <Typography gutterBottom id="input-slider">
                  {probabilityOfEvent.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Typography gutterBottom id="input-slider">
              Num Trials
            </Typography>
            <Grid alignItems="center" container spacing={2}>
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
                <Typography gutterBottom id="input-slider">
                  {10 ** numTrialsExponent}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Typography gutterBottom id="input-slider">
              Window size
            </Typography>
            <Grid alignItems="center" container spacing={2}>
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
                <Typography gutterBottom id="input-slider">
                  {10 ** windowSizeExponent}
                </Typography>
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
            <canvas className="max-h-10" ref={samplesChartRef}></canvas>
            <canvas className="max-h-96" ref={barChartRef}></canvas>
          </div>
        </div>
      </div>
    </>
  );
};

export default Poisson;
