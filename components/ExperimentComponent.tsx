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
	executeTrial: VoidFunction;
	isRunning: () => boolean;
	pause: VoidFunction;
	performExperiment: VoidFunction;
};

export const ExperimentComponent = <T,>({
	experimentDefinition: { execute, initialValues, update },
}: {
	experimentDefinition: ExperimentDefinition<T>;
}) => {
	const [currentExperiment, setCurrentExperiment] =
		React.useState<Experiment>();

	const [numTrialsExponent, setNumTrialsExponent] = React.useState(2);
	const [percentProgress, setPercentProgress] = React.useState(0);
	const [sleepInterval, setSleepInterval] = React.useState(0);
	const [windowSizeExponent, setWindowSizeExponent] = React.useState(0);

	const generateExperiment = (): Experiment => {
		let values = initialValues;
		let isRunning = false;
		let i = 0;
		setPercentProgress(0);

		const executeTrial = () => {
			values = execute(values, i);
			++i;
			if (i % 10 ** windowSizeExponent === 0) {
				update(values, i);
				setPercentProgress(100 * (i / 10 ** numTrialsExponent));
			}
		};

		return {
			executeTrial,
			isRunning: () => isRunning,
			pause: () => (isRunning = false),
			performExperiment: async () => {
				isRunning = true;
				while (isRunning && i < 10 ** numTrialsExponent) {
					executeTrial();
					if (i % 10 ** windowSizeExponent === 0) await sleep(sleepInterval);
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
			<SliderWithLabels
				displayValue={sleepInterval.toLocaleString()}
				label="Number of milliseconds between trials"
				max={1000}
				min={0}
				onChange={(_event, newValue) => setSleepInterval(newValue as number)}
				value={sleepInterval}
			/>
			<Grid container spacing={2} width="100%">
				<Grid item xs={4}>
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
				<Grid item xs={4}>
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
				<Grid item xs={4}>
					<Button
						fullWidth
						onClick={currentExperiment?.executeTrial}
						variant="outlined"
					>
						<span>Execute Single Trial</span>
					</Button>
				</Grid>
			</Grid>
			<Box width="100%">
				<Typography gutterBottom>Progress</Typography>
				<LinearProgress value={percentProgress} variant="determinate" />
			</Box>
		</>
	);
};

export type ExperimentDefinition<T> = {
	execute: (values: Readonly<T>, i: number) => T;
	initialValues: Readonly<T>;
	update: (values: Readonly<T>, i: number) => void;
};
