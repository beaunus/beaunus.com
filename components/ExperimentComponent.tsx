import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";

import { sleep } from "../utils";

import { SliderWithLabels } from "./SliderWithLabels";

type Experiment = {
	isRunning: () => boolean;
	pause: VoidFunction;
	performExperiment: VoidFunction;
};

export const ExperimentComponent = <T,>({
	execute,
	initialValues,
	update,
}: ExperimentDefinition<T>) => {
	const [currentExperiment, setCurrentExperiment] =
		React.useState<Experiment>();

	const [numTrialsExponent, setNumTrialsExponent] = React.useState(2);
	const [percentProgress, setPercentProgress] = React.useState(0);
	const [windowSizeExponent, setWindowSizeExponent] = React.useState(0);

	const generateExperiment = (): Experiment => {
		let values = initialValues;
		let isRunningBit = false;
		let i = 0;
		setPercentProgress(0);

		return {
			isRunning: () => isRunningBit,
			pause: () => (isRunningBit = false),
			performExperiment: async () => {
				isRunningBit = true;
				for (; isRunningBit && i < 10 ** numTrialsExponent; ++i) {
					values = execute(values, i);
					if (i % 10 ** windowSizeExponent === 0) {
						update(values, i);
						setPercentProgress(100 * (i / 10 ** numTrialsExponent));
						await sleep(0);
					}
				}
				if (i === 10 ** numTrialsExponent) {
					update(values, i);
					setPercentProgress(100);
				}
			},
		};
	};

	return (
		<>
			<SliderWithLabels
				displayValue={(10 ** numTrialsExponent).toLocaleString()}
				label="Number of trials"
				max={6}
				min={0}
				onChange={(_event, newValue) =>
					setNumTrialsExponent(newValue as number)
				}
				value={numTrialsExponent}
			/>
			<SliderWithLabels
				displayValue={(
					10 ** Math.min(windowSizeExponent, numTrialsExponent)
				).toLocaleString()}
				label="Number of experiments between snapshots"
				max={numTrialsExponent}
				min={0}
				onChange={(_event, newValue) =>
					setWindowSizeExponent(newValue as number)
				}
				value={Math.min(windowSizeExponent, numTrialsExponent)}
			/>
			<Grid container spacing={2} width="100%">
				<Grid item xs={6}>
					<Button
						fullWidth
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
				<Grid item xs={6}>
					<Button
						fullWidth
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
			</Grid>
			<Box>
				<Typography gutterBottom>Progress</Typography>
				<LinearProgress value={percentProgress} variant="determinate" />
			</Box>
		</>
	);
};

export type ExperimentDefinition<T> = {
	execute: (values: T, i: number) => T;
	initialValues: T;
	update: (values: T, i: number) => void;
};
