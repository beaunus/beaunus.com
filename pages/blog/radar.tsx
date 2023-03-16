import { Clear } from "@mui/icons-material";
import { Button, FormControlLabel, Switch } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import * as React from "react";

import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { arithmeticMean, geometricMean } from "../../utils/mean";

type AggregationStrategies = Record<string, (numbers: number[]) => number>;

const AGGREGATION_STRATEGY_FUNCTION_BY_NAME: AggregationStrategies = {
  arithmeticMean,
  geometricMean,
};

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
      />
    </Grid>
  </Grid>
);

const Radar: NextPage = () => {
  const [aggregationStrategyName, setAggregationStrategyName] =
    React.useState<string>("geometricMean");
  const [dimensions, setDimensions] = React.useState(DEFAULT_DIMENSIONS);
  const [pendingDimensionName, setPendingDimensionName] =
    React.useState<string>("");
  const [shouldShowLevels, setShouldShowLevels] = React.useState(true);

  const radarChartRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(
    function createChart() {
      const valuesAccordingToWeights = Object.values(dimensions).flatMap(
        ({ value, weight }) => Array.from({ length: weight }, () => value)
      );
      const aggregatedValue = AGGREGATION_STRATEGY_FUNCTION_BY_NAME[
        aggregationStrategyName
      ](valuesAccordingToWeights);

      if (radarChartRef.current) {
        const radarChart = new ChartJS(radarChartRef.current, {
          data: {
            datasets: [
              ...(shouldShowLevels
                ? Object.entries(STANDARD_LEVELS).map(([name, value]) => ({
                    data: Array.from(Object.keys(dimensions), () => value),
                    fill: false,
                    label: name,
                  }))
                : []),
              {
                borderColor: "rgb(255, 99, 132)",
                data: Object.values(dimensions).map(({ value }) => value),
                fill: false,
                label: "Dimensions",
              },
              {
                backgroundColor: "rgb(200, 255, 200, 1)",
                borderColor: "rgb(200, 255, 200, 1)",
                data: Array.from(
                  Object.keys(dimensions),
                  () => aggregatedValue
                ),
                label: aggregationStrategyName,
              },
            ],
            labels: Object.keys(dimensions),
          },
          options: {
            animation: false,
            scales: {
              r: {
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
    },
    [aggregationStrategyName, dimensions, shouldShowLevels]
  );

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
                    setDimensions((old) => ({
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
            {shouldShowLevels ? <StandardLevelSlider /> : null}
            {Object.entries(dimensions).map(([dimensionName, { value }]) => (
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
                      setDimensions((old) =>
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
                    type="number"
                    value={dimensions[dimensionName].weight}
                  />
                </Grid>
                <Grid item xs={9}>
                  <SliderWithLabels
                    displayValue={value.toString()}
                    label={dimensionName}
                    sliderMax={7}
                    sliderMin={1}
                    sliderOnChange={(_event, newValue) =>
                      setDimensions((old) => ({
                        ...old,
                        [dimensionName]: {
                          ...old[dimensionName],
                          value: newValue as number,
                        },
                      }))
                    }
                    sliderValue={value}
                    step={1}
                  />
                </Grid>
              </Grid>
            ))}
            <FormLabel id="aggregation-strategy">
              Aggregation Strategy
            </FormLabel>
            <RadioGroup
              aria-labelledby="aggregation-strategy"
              name="aggregation-strategy-group"
              onChange={(_event, newValue) => {
                setAggregationStrategyName(newValue);
              }}
              row
              value={aggregationStrategyName}
            >
              {Object.keys(AGGREGATION_STRATEGY_FUNCTION_BY_NAME).map(
                (name) => (
                  <FormControlLabel
                    control={<Radio />}
                    key={name}
                    label={name}
                    value={name}
                  />
                )
              )}
            </RadioGroup>
            <canvas className="max-h-screen" ref={radarChartRef} />
          </div>
        </Segment>
      </div>
    </>
  );
};

export default Radar;
