import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";

type ColorName = `rgb(${number}, ${number}, ${number}, ${number})`;
const DIMENSION_NAMES = [
  "Technical Skills",
  "Decision Making",
  "Mentoring",
  "Driving Alignment",
  "Process Thinking",
  "Knowledge Sharing",
  "Teamwork",
  "Facilitation",
] as const;
type DimensionName = (typeof DIMENSION_NAMES)[number];

const STANDARD_LEVELS: Record<string, number> = {
  junior: 2,
  mid: 4,
  senior: 6,
};

const range: [number, number] = [1, 7];

const Radar: NextPage = () => {
  const [valuesAndWeightsByDimensionName, setValuesAndWeightsByDimensionName] =
    React.useState<Record<DimensionName, { value: number; weight: number }>>(
      Object.fromEntries(
        DIMENSION_NAMES.map((name) => [name, { value: 4, weight: 1 }])
      ) as Record<DimensionName, { value: number; weight: number }>
    );

  const radarChartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (radarChartRef.current) {
      const means: Record<
        string,
        {
          colorBackground: ColorName;
          colorForeground: ColorName;
          value: number;
        }
      > = {
        geometric: {
          colorBackground: "rgb(200, 255, 200, 0.2)",
          colorForeground: "rgb(200, 255, 200, 1)",
          value:
            Object.values(valuesAndWeightsByDimensionName)
              .flatMap(({ value, weight }) =>
                Array.from({ length: weight }, () => value)
              )
              .reduce((product, value) => product * value, 1) **
            (1 /
              Object.values(valuesAndWeightsByDimensionName).reduce(
                (sum, { weight }) => sum + weight,
                0
              )),
        },
      };
      const radarChart = new ChartJS(radarChartRef.current, {
        data: {
          datasets: [
            ...Object.entries(STANDARD_LEVELS).map(([name, value]) => ({
              backgroundColor: "rgb(0, 0, 0, 0)",
              borderColor: "#ccc",
              data: Array.from({ length: DIMENSION_NAMES.length }, () => value),
              fill: true,
              label: `${name}`,
              pointBackgroundColor: "#ccc",
            })),
            {
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgb(255, 99, 132)",
              data: Object.values(valuesAndWeightsByDimensionName).map(
                ({ value }) => value
              ),
              fill: true,
              label: "Dimension values",
              pointBackgroundColor: "rgb(255, 99, 132)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgb(255, 99, 132)",
            },
            ...Object.entries(means).map(
              ([name, { colorBackground, colorForeground, value }]) => ({
                backgroundColor: colorBackground,
                borderColor: colorForeground,
                data: Array.from(
                  { length: DIMENSION_NAMES.length },
                  () => value
                ),
                fill: true,
                label: `${name} mean`,
                pointBackgroundColor: colorForeground,
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: colorForeground,
              })
            ),
          ],
          labels: Object.keys(valuesAndWeightsByDimensionName),
        },
        options: {
          animation: false,
          elements: { line: { borderWidth: 3 } },
          plugins: { legend: { display: true } },
          scales: {
            r: {
              angleLines: { display: true },
              suggestedMax: range[1],
              suggestedMin: range[0],
            },
          },
        },
        type: "radar",
      });

      return () => {
        radarChart.destroy();
      };
    }
  }, [valuesAndWeightsByDimensionName]);

  return (
    <>
      <Head>
        <title>Radar | Beaunus</title>
      </Head>
      <div className="flex flex-col grow gap-2">
        <Segment>
          <div className="flex flex-col gap-5 w-full">
            <div className="text-2xl font-semibold text-center text-cyan-700">
              Radar
            </div>
            <FormControl>
              <Grid container spacing={2}>
                <Grid item xs={2} />
                <Grid item xs={10}>
                  <Slider
                    defaultValue={[2, 4, 6]}
                    disabled={true}
                    marks={Object.entries(STANDARD_LEVELS).map(
                      ([label, value]) => ({ label, value })
                    )}
                    max={range[1]}
                    min={range[0]}
                  />
                </Grid>
              </Grid>

              {Object.entries(valuesAndWeightsByDimensionName).map(
                ([dimensionName, { value }]) => (
                  <Grid container key={`${dimensionName}-slider`} spacing={2}>
                    <Grid item xs={2}>
                      <TextField
                        InputLabelProps={{ shrink: true }}
                        id="outlined-number"
                        label="weight"
                        onChange={({ target }) => {
                          setValuesAndWeightsByDimensionName((old) => ({
                            ...old,
                            [dimensionName]: {
                              ...old[dimensionName as DimensionName],
                              weight: Math.max(Number(target.value), 1),
                            },
                          }));
                        }}
                        type="number"
                        value={
                          valuesAndWeightsByDimensionName[
                            dimensionName as DimensionName
                          ].weight
                        }
                      />
                    </Grid>
                    <Grid item xs={10}>
                      <SliderWithLabels
                        displayValue={value.toString()}
                        label={dimensionName}
                        sliderMax={7}
                        sliderMin={1}
                        sliderOnChange={(_event, newValue) =>
                          setValuesAndWeightsByDimensionName((old) => ({
                            ...old,
                            [dimensionName]: {
                              ...old[dimensionName as DimensionName],
                              value: newValue,
                            },
                          }))
                        }
                        sliderValue={value}
                        step={1}
                      />
                    </Grid>
                  </Grid>
                )
              )}
            </FormControl>
            <canvas className="max-h-screen" ref={radarChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default Radar;
