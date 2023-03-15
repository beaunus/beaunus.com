import { Clear } from "@mui/icons-material";
import { Button, FormControlLabel, Switch } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { arithmeticMean, geometricMean } from "../../utils/mean";

type ColorName = `rgb(${number}, ${number}, ${number}, ${number})`;

const DEFAULT_VALUES_AND_WEIGHTS_BY_DIMENSION_NAME: Record<
  string,
  { value: number; weight: number }
> = {
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

const Radar: NextPage = () => {
  const [valuesAndWeightsByDimensionName, setValuesAndWeightsByDimensionName] =
    React.useState(DEFAULT_VALUES_AND_WEIGHTS_BY_DIMENSION_NAME);
  const [shouldShowLevels, setShouldShowLevels] = React.useState(true);
  const [pendingDimensionName, setPendingDimensionName] =
    React.useState<string>("");

  const radarChartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (radarChartRef.current) {
      const valuesAccordingToWeights = Object.values(
        valuesAndWeightsByDimensionName
      ).flatMap(({ value, weight }) =>
        Array.from({ length: weight }, () => value)
      );
      const means: Record<
        string,
        {
          colorBackground: ColorName;
          colorForeground: ColorName;
          value: number;
        }
      > = {
        arithmetic: {
          colorBackground: "rgb(200, 200, 255, 0.2)",
          colorForeground: "rgb(200, 200, 255, 1)",
          value: arithmeticMean(valuesAccordingToWeights),
        },
        geometric: {
          colorBackground: "rgb(200, 255, 200, 0.2)",
          colorForeground: "rgb(200, 255, 200, 1)",
          value: geometricMean(valuesAccordingToWeights),
        },
      };
      const radarChart = new ChartJS(radarChartRef.current, {
        data: {
          datasets: [
            ...(shouldShowLevels
              ? Object.entries(STANDARD_LEVELS).map(([name, value]) => ({
                  backgroundColor: "rgb(0, 0, 0, 0)",
                  borderColor: "#ccc",
                  data: Array.from(
                    Object.keys(valuesAndWeightsByDimensionName),
                    () => value
                  ),
                  fill: true,
                  label: name,
                  pointBackgroundColor: "#ccc",
                }))
              : []),
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
                  Object.keys(valuesAndWeightsByDimensionName),
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
              suggestedMax: SLIDER_RANGE[1],
              suggestedMin: SLIDER_RANGE[0],
            },
          },
        },
        type: "radar",
      });

      return () => {
        radarChart.destroy();
      };
    }
  }, [shouldShowLevels, valuesAndWeightsByDimensionName]);

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
            <div className="flex gap-4 justify-between items-center w-full">
              <TextField
                fullWidth
                id="new-dimension"
                label="New Dimension"
                onChange={(event) =>
                  setPendingDimensionName(event.target.value)
                }
                value={pendingDimensionName}
                variant="outlined"
              />
              <Button
                onClick={() => {
                  if (pendingDimensionName)
                    setValuesAndWeightsByDimensionName((old) => ({
                      ...old,
                      [pendingDimensionName]: { value: 4, weight: 1 },
                    }));
                  setPendingDimensionName("");
                }}
                variant="outlined"
              >
                Add New Dimension
              </Button>
            </div>
            <FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={shouldShowLevels}
                    onChange={({ target }) => {
                      setShouldShowLevels(target.checked);
                    }}
                  />
                }
                label="Should show levels"
              />
              {shouldShowLevels ? (
                <Grid container spacing={2}>
                  <Grid item xs={3} />
                  <Grid item xs={9}>
                    <Slider
                      defaultValue={[2, 4, 6]}
                      disabled={true}
                      marks={Object.entries(STANDARD_LEVELS).map(
                        ([label, value]) => ({ label, value })
                      )}
                      max={SLIDER_RANGE[1]}
                      min={SLIDER_RANGE[0]}
                    />
                  </Grid>
                </Grid>
              ) : null}

              {Object.entries(valuesAndWeightsByDimensionName).map(
                ([dimensionName, { value }]) => (
                  <Grid
                    alignItems="center"
                    container
                    key={`${dimensionName}-slider`}
                    spacing={2}
                  >
                    <Grid item xs={1}>
                      <IconButton
                        aria-label="delete-dimension"
                        color="primary"
                        component="label"
                        onClick={() =>
                          setValuesAndWeightsByDimensionName((old) =>
                            Object.fromEntries(
                              Object.entries(old).filter(
                                ([name]) => name !== dimensionName
                              )
                            )
                          )
                        }
                      >
                        <Clear />
                      </IconButton>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        InputLabelProps={{ shrink: true }}
                        id="outlined-number"
                        label="weight"
                        onChange={({ target }) => {
                          setValuesAndWeightsByDimensionName((old) => ({
                            ...old,
                            [dimensionName]: {
                              ...old[dimensionName],
                              weight: Math.max(Number(target.value), 0),
                            },
                          }));
                        }}
                        type="number"
                        value={
                          valuesAndWeightsByDimensionName[dimensionName].weight
                        }
                      />
                    </Grid>
                    <Grid item xs={9}>
                      <SliderWithLabels
                        displayValue={value.toString()}
                        label={dimensionName}
                        sliderMax={7}
                        sliderMin={1}
                        sliderOnChange={(_event, newValue) =>
                          setValuesAndWeightsByDimensionName(
                            (old) =>
                              ({
                                ...old,
                                [dimensionName]: {
                                  ...old[dimensionName],
                                  value: newValue,
                                },
                              } as typeof valuesAndWeightsByDimensionName)
                          )
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
