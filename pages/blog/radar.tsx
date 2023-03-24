import { Clear } from "@mui/icons-material";
import { Button, FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import * as React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { arithmeticMean, geometricMean } from "../../utils/mean";

const DEFAULT_DIMENSIONS: Record<string, { value: number; weight: number }> = {
  /* eslint-disable @typescript-eslint/naming-convention, sort-keys */
  "Technical Skills": { value: 4, weight: 1 },
  "Decision Making": { value: 4, weight: 1 },
  Mentoring: { value: 4, weight: 1 },
  "Driving Alignment": { value: 4, weight: 1 },
  "Process Thinking": { value: 4, weight: 1 },
  "Knowledge Sharing": { value: 4, weight: 1 },
  Teamwork: { value: 4, weight: 1 },
  Facilitation: { value: 4, weight: 1 },
  "X-factor": { value: 4, weight: 1 },
  /* eslint-enable @typescript-eslint/naming-convention, sort-keys */
};

const STANDARD_LEVELS: Record<string, number> = {
  junior: 2,
  mid: 4,
  senior: 6,
};

const SLIDER_RANGE: [number, number] = [1, 7];

const StandardLevelSlider: React.FC = () => (
  <Grid container spacing={2}>
    <Grid item xs={3} />
    <Grid item xs={9}>
      <Slider
        defaultValue={Object.values(STANDARD_LEVELS)}
        disabled={true}
        marks={Object.entries(STANDARD_LEVELS).map(([label, value]) => ({
          label,
          value,
        }))}
        max={SLIDER_RANGE[1]}
        min={SLIDER_RANGE[0]}
        size="small"
      />
    </Grid>
  </Grid>
);

const Radar: NextPage = () => {
  const [dimensions, setDimensions] = React.useState(DEFAULT_DIMENSIONS);
  const [pendingDimensionName, setPendingDimensionName] =
    React.useState<string>("");

  const radarChartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(
    function createChart() {
      const valuesAccordingToWeights = Object.values(dimensions).flatMap(
        ({ value, weight }) => Array.from({ length: weight }, () => value)
      );

      const x = geometricMean(valuesAccordingToWeights);
      const borderColors = [
        85.7998 * Math.sin(x / 2) + 48.9514 * Math.cos(x / 2) + 144.353,
        -193.352 * Math.sin(x / 2) + 110.707 * Math.cos(x / 2) + 280.885,
        -104.098 * Math.sin(x / 2) - 73.2507 * Math.cos(x / 2) + 189.173,
      ].map((x) => x - 59);

      if (radarChartRef.current) {
        const radarChart = new ChartJS(radarChartRef.current, {
          data: {
            datasets: [
              {
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: Object.values(dimensions).map(({ value }) => value),
                fill: false,
                pointBorderWidth: ({ dataIndex }) =>
                  2 * Object.values(dimensions)[dataIndex].weight,
              },
              ...Object.values(STANDARD_LEVELS).map((value) => ({
                data: Array.from(Object.keys(dimensions), () => value + 1),
                fill: false,
                pointRadius: 0,
              })),
              {
                borderColor: `rgb(${borderColors.join(", ")}, 1)`,
                borderWidth:
                  20 +
                  100 *
                    (arithmeticMean(valuesAccordingToWeights) -
                      geometricMean(valuesAccordingToWeights)),
                data: Array.from(Object.keys(dimensions), () =>
                  geometricMean(valuesAccordingToWeights)
                ),
                fill: false,
                pointRadius: 0,
              },
              {
                backgroundColor: "rgb(243, 178, 62, 1)",
                borderColor: "rgb(243, 178, 62, 0)",
                data: Array.from(Object.keys(dimensions), () => 3),
                pointRadius: 0,
              },
              {
                backgroundColor: "rgb(202, 59, 125, 1)",
                borderColor: "rgb(202, 59, 125, 0)",
                data: Array.from(Object.keys(dimensions), () => 5),
                pointRadius: 0,
              },
              {
                backgroundColor: "rgb(108, 144, 247, 1)",
                borderColor: "rgb(108, 144, 247, 0)",
                data: Array.from(Object.keys(dimensions), () => 7),
                pointRadius: 0,
              },
            ],
            labels: Object.keys(dimensions),
          },
          options: {
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                angleLines: { display: false },
                grid: { display: false, drawTicks: false },
                suggestedMax: SLIDER_RANGE[1],
                suggestedMin: SLIDER_RANGE[0],
                ticks: { display: false },
              },
            },
          },
          type: "radar",
        });

        return () => {
          radarChart.destroy();
        };
      }
    },
    [dimensions]
  );

  return (
    <>
      <Head>
        <title>Radar | Beaunus</title>
      </Head>
      <div className="flex flex-col grow gap-2">
        <Segment>
          <div className="flex flex-col gap-1 w-full">
            <div className="text-2xl font-semibold text-center text-cyan-700">
              Radar
            </div>
            <div className="flex gap-4 justify-between items-center w-full">
              <TextField
                fullWidth
                id="new-dimension"
                label="New Dimension"
                onChange={({ target }) => setPendingDimensionName(target.value)}
                value={pendingDimensionName}
              />
              <Button
                onClick={() => {
                  if (pendingDimensionName)
                    setDimensions((old) => ({
                      ...old,
                      [pendingDimensionName]: { value: 4, weight: 1 },
                    }));
                  setPendingDimensionName("");
                }}
              >
                Add New Dimension
              </Button>
            </div>
            <StandardLevelSlider />
            {Object.entries(dimensions).map(([dimensionName, { value }]) => (
              <Grid
                alignItems="center"
                container
                key={`${dimensionName}-slider`}
                spacing={1}
              >
                <Grid item xs={1}>
                  <IconButton
                    aria-label="delete-dimension"
                    color="primary"
                    component="label"
                    onClick={() =>
                      setDimensions((old) =>
                        Object.fromEntries(
                          Object.entries(old).filter(
                            ([name]) => name !== dimensionName
                          )
                        )
                      )
                    }
                    size="small"
                  >
                    <Clear />
                  </IconButton>
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    id="outlined-number"
                    label="weight"
                    onChange={({ target }) => {
                      setDimensions((old) => ({
                        ...old,
                        [dimensionName]: {
                          ...old[dimensionName],
                          weight: Math.max(Number(target.value), 0),
                        },
                      }));
                    }}
                    size="small"
                    type="number"
                    value={dimensions[dimensionName].weight}
                  />
                </Grid>
                <Grid item xs={9}>
                  <SliderWithLabels
                    label={dimensionName}
                    max={7}
                    min={1}
                    onChange={(_event, newValue) =>
                      setDimensions((old) => ({
                        ...old,
                        [dimensionName]: {
                          ...old[dimensionName],
                          value: newValue as number,
                        },
                      }))
                    }
                    size="small"
                    step={1}
                    value={value}
                  />
                </Grid>
              </Grid>
            ))}
            <canvas className="max-h-screen" ref={radarChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default Radar;
