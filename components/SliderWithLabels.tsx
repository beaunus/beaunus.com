import Grid from "@mui/material/Grid";
import Slider, { SliderProps } from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import React from "react";

export const SliderWithLabels: React.FC<
  {
    caption?: string;
    displayValue: string;
    label: string;
    otherProps?: Partial<SliderProps>;
    sliderMax: number;
    sliderMin: number;
    sliderValue: number;
  } & SliderProps
> = ({
  caption,
  displayValue,
  label,
  sliderMax,
  sliderMin,
  onChange,
  sliderValue,
  ...otherProps
}) => (
  <Grid alignItems="center" columnSpacing={2} container>
    <Grid item xs>
      <Typography variant="body2">{label}</Typography>
    </Grid>
    {caption ? (
      <Grid item>
        <Typography variant="caption">{caption}</Typography>
      </Grid>
    ) : null}
    <Grid item>
      <Typography>{displayValue}</Typography>
    </Grid>
    <Grid item xs={12}>
      <Slider
        max={sliderMax}
        min={sliderMin}
        onChange={onChange}
        value={sliderValue}
        {...otherProps}
      />
    </Grid>
  </Grid>
);
