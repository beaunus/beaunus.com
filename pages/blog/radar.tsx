import { Clear } from "@mui/icons-material";
import { Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ChartJS, { Color } from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect, useState } from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { geometricMean } from "../../utils/mean";

type Dimensions = Record<string, { value: number; weight: number }>;
const DEFAULT_DIMENSIONS: Dimensions = Object.fromEntries(
  [
    "Product Thinking",
    "Code Review",
    "Facilitation",
    "Feedback",
    "Handling disagreement",
    "Knowledge Sharing",
    "Relationship Building",
    "Teamwork",
    "Prioritization / Dependencies",
    "Reliability, delivery accountability",
    "Scope of Impact",
    "Work breakdown",
    "Mentoring",
    "Process thinking",
    "Code Conventions",
    "Code Quality",
    "Debugging",
    "Incident Response",
    "Monitoring",
    "Pull Request Quality",
    "Testing",
    "Badges",
  ].map((name) => [name, { value: 4, weight: 1 }])
);

const STANDARD_LEVELS: Record<string, { color: Color; value: number }> = {
  junior: { color: "hsl(86, 60%, 80%)", value: 2 },
  mid: { color: "hsl(136, 80%, 60%)", value: 4 },
  senior: { color: "hsl(186, 100%, 40%)", value: 6 },
};

const dimensionColor = "red";
const overlayColor = "rgba(0, 0, 0, 0.5)";

const SLIDER_RANGE: [number, number] = [1, 7];

const StandardLevelSlider: React.FC = () => (
  <Grid container spacing={2}>
    <Grid item xs={3} />
    <Grid item xs={9}>
      <Slider
        defaultValue={Object.values(STANDARD_LEVELS).map(({ value }) => value)}
        disabled={true}
        marks={Object.entries(STANDARD_LEVELS).map(([label, { value }]) => ({
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

export const isBrowser = (): boolean => typeof window !== "undefined";

const Radar: NextPage = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({});
  const [pendingDimensionName, setPendingDimensionName] = useState<string>("");

  const barChartRef = React.useRef<HTMLCanvasElement>(null);
  const radarChartRef = React.useRef<HTMLCanvasElement>(null);

  const router = useRouter();

  useEffect(() => {
    router.push(
      {
        query: Object.fromEntries(
          Object.entries(dimensions).map(([name, { value, weight }]) => [
            name,
            `${weight},${value}`,
          ])
        ),
      },
      undefined,
      { scroll: false }
    );
  }, [dimensions, router.isReady]);

  useEffect(() => {
    const dimensionsFromUrl = Object.fromEntries(
      Array.from(new URLSearchParams(window.location.search).entries()).map(
        ([name, weightAndValueString]) => {
          const [weight, value] = (weightAndValueString as string)
            .split(",")
            .map(Number);
          return [name, { value, weight }];
        }
      )
    );
    setDimensions(
      Object.keys(dimensionsFromUrl).length
        ? dimensionsFromUrl
        : DEFAULT_DIMENSIONS
    );
  }, []);

  useEffect(
    function createChart() {
      const valuesAccordingToWeights = Object.values(dimensions).flatMap(
        ({ value, weight }) => Array.from({ length: weight }, () => value)
      );

      const mean = geometricMean(valuesAccordingToWeights) ?? 0;
      const overlayRange = [mean - 1, mean + 1];

      if (radarChartRef.current && barChartRef.current) {
        const tension =
          (4 / 3) * Math.tan(Math.PI / (2 * Object.keys(dimensions).length));
        const radarChart = new ChartJS(radarChartRef.current, {
          data: {
            datasets: [
              {
                backgroundColor: dimensionColor,
                borderColor: dimensionColor,
                data: Object.values(dimensions).map(({ value }) => value),
                fill: false,
                pointBorderWidth: ({ dataIndex }) =>
                  2 * Object.values(dimensions)[dataIndex].weight,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.junior.color,
                borderWidth: 0,
                data: Array.from(Object.keys(dimensions), () =>
                  Math.min(overlayRange[0], STANDARD_LEVELS.junior.value + 1)
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.mid.color,
                borderWidth: 0,
                data: Array.from(Object.keys(dimensions), () =>
                  Math.min(overlayRange[0], STANDARD_LEVELS.mid.value + 1)
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.senior.color,
                borderWidth: 0,
                data: Array.from(Object.keys(dimensions), () =>
                  Math.min(overlayRange[0], STANDARD_LEVELS.senior.value + 1)
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: overlayColor,
                borderWidth: 0,
                data: Array.from(
                  Object.keys(dimensions),
                  () => overlayRange[1]
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.junior.color,
                borderWidth: 0,
                data: Array.from(
                  Object.keys(dimensions),
                  () => STANDARD_LEVELS.junior.value + 1
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.mid.color,
                borderWidth: 0,
                data: Array.from(
                  Object.keys(dimensions),
                  () => STANDARD_LEVELS.mid.value + 1
                ),
                pointRadius: 0,
                tension,
              },
              {
                backgroundColor: STANDARD_LEVELS.senior.color,
                borderWidth: 0,
                data: Array.from(
                  Object.keys(dimensions),
                  () => STANDARD_LEVELS.senior.value + 1
                ),
                pointRadius: 0,
                tension,
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
                suggestedMax: SLIDER_RANGE[1] + 1,
                suggestedMin: SLIDER_RANGE[0],
                ticks: { display: false },
              },
            },
          },
          type: "radar",
        });

        const barChart = new ChartJS(barChartRef.current, {
          data: {
            datasets: [
              {
                backgroundColor: dimensionColor,
                borderColor: dimensionColor,
                data: Object.values(dimensions).map(({ value }) => value),
                type: "line",
              },
              {
                data: Array(Object.keys(dimensions).length).fill(
                  overlayRange[0]
                ),
                pointStyle: false,
                type: "line",
              },
              {
                backgroundColor: overlayColor,
                data: Array(Object.keys(dimensions).length).fill(
                  overlayRange[1]
                ),
                fill: 1,
                pointStyle: false,
                type: "line",
              },
              {
                backgroundColor: STANDARD_LEVELS.junior.color,
                borderColor: STANDARD_LEVELS.junior.color,
                data: Array(Object.keys(dimensions).length).fill(
                  STANDARD_LEVELS.junior.value + 1
                ),
                fill: true,
                pointStyle: false,
                type: "line",
              },
              {
                backgroundColor: STANDARD_LEVELS.mid.color,
                borderColor: STANDARD_LEVELS.mid.color,
                data: Array(Object.keys(dimensions).length).fill(
                  STANDARD_LEVELS.mid.value + 1
                ),
                fill: "-1",
                pointStyle: false,
                type: "line",
              },
              {
                backgroundColor: STANDARD_LEVELS.senior.color,
                borderColor: STANDARD_LEVELS.senior.color,
                data: Array(Object.keys(dimensions).length).fill(
                  STANDARD_LEVELS.senior.value + 1
                ),
                fill: "-1",
                pointStyle: false,
                type: "line",
              },
            ],
            labels: Object.keys(dimensions),
          },

          options: {
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                max: STANDARD_LEVELS.senior.value + 1,
                min: STANDARD_LEVELS.junior.value - 1,
                ticks: { display: false },
              },
            },
          },
          type: "bar",
        });

        return () => {
          barChart.destroy();
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
            <canvas className="max-h-screen" ref={barChartRef} />
            <canvas className="max-h-screen" ref={radarChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default Radar;
