import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
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
	const [numCompleteTrials, setNumCompleteTrials] = React.useState(0);
	const [numTrialsExponent, setNumTrialsExponent] = React.useState(2);
	const [percentProgress, setPercentProgress] = React.useState(0);
	const [windowSizeExponent, setWindowSizeExponent] = React.useState(0);

	const generateExperiment = <T,>({
		execute,
		initialize,
		update,
	}: {
		execute: (experimentValues: T, i: number) => void;
		initialize: () => T;
		update: (experimentValues: T) => void;
	}): Experiment => {
		const experimentValues = initialize();
		let isRunningBit = false;
		let i = 0;
		setPercentProgress(0);

		return {
			isRunning: () => isRunningBit,
			pause: () => (isRunningBit = false),
			performExperiment: async () => {
				isRunningBit = true;
				for (; isRunningBit && i < 10 ** numTrialsExponent; ++i) {
					execute(experimentValues, i);
					if (i % 10 ** windowSizeExponent === 0) {
						update(experimentValues);
						setNumCompleteTrials(i);
						setPercentProgress(100 * (i / 10 ** numTrialsExponent));
						await sleep(0);
					}
				}
				if (i === 10 ** numTrialsExponent) {
					update(experimentValues);
					setNumCompleteTrials(i);
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
					scales: {
						x: { display: false },
						y: { title: { display: true } },
					},
				},
				type: "bar",
			});

			const barChart = new ChartJS(barChartRef.current, {
				data: {
					datasets: [
						{ data: Object.values(countByGapSizeState), type: "bar" },
						{
							data: Object.keys(countByGapSizeState).map((count) => {
								const probabilityOfTwoEventsHappeningAtAll =
									probabilityOfEvent ** 2;
								const probabilityOfConsecutiveNonEventsInInterval =
									(1 - probabilityOfEvent) ** Number(count);
								return (
									numCompleteTrials *
									probabilityOfConsecutiveNonEventsInInterval *
									probabilityOfTwoEventsHappeningAtAll
								);
							}),
							type: "line",
						},
					],
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
			<div className="flex flex-col grow gap-2">
				<Segment>
					<div className="flex flex-col gap-5 w-full">
						<div className="text-2xl font-semibold text-center text-cyan-700">
							Poisson Process
						</div>
						<p>
							I listened to{" "}
							<HighlightedLink href="https://open.spotify.com/episode/4MrtwjM1PyWwmPIdvYcQph?si=ca26c63b50a84bab&t=787583">
								this episode
							</HighlightedLink>{" "}
							of <i>The Life Of The Mind</i> by Steven Pinker and was struck by
							the claim that &quot;the thing about a Poisson process (a purely
							random process) is that events seem to cluster.&quot;
						</p>
						<ul className="list-disc list-inside">
							I thought that this would be a good opportunity for me to:
							<li>Run an experiment to see how it looks</li>
							<li>
								Integrate{" "}
								<HighlightedLink href="https://www.chartjs.org">
									Chart.js
								</HighlightedLink>{" "}
								into my blog
							</li>
						</ul>
						<ul className="list-disc list-inside">
							Here&apos;s what I wanted to learn:
							<li>
								When random events happen, do they really appear in clusters?
							</li>
							<li>
								After many trials, what is the distribution of <i>gaps</i>{" "}
								between events?
							</li>
						</ul>
						<p>
							You can just click START below to see what happens when there are
							100 trials. If you increase the <b>Number of trials</b> slider,
							the experiment will do more trials, which will eventually lead to
							more &apos;accurate&apos; results. If you increase the{" "}
							<b>Number of experiments between snapshots</b> slider, you can{" "}
							<i>proceed</i> through the experiment faster, without waiting for
							each individual trial, one by one.
						</p>
						<p>
							The code itself can be found{" "}
							<HighlightedLink href="https://github.com/beaunus/beaunus.com/search?q=poisson+performExperiment">
								on Github
							</HighlightedLink>
							.
						</p>
						<SliderWithLabels
							displayValue={probabilityOfEvent.toFixed(2)}
							label="Probability of event"
							max={100}
							min={0}
							onChange={(_event, newValue) =>
								setProbabilityOfEvent((newValue as number) / 100)
							}
							value={probabilityOfEvent * 100}
						/>
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
										const a = generateExperiment<{
											countByGapSize: Record<number, number>;
											mostRecentTrueIndex: number;
											samples: Array<boolean>;
										}>({
											execute: (experimentValues, i) => {
												/* eslint-disable no-param-reassign */
												const didEventHappen =
													Math.random() < probabilityOfEvent;
												if (i > 0 && didEventHappen) {
													const thisGap =
														i - experimentValues.mostRecentTrueIndex - 1;
													experimentValues.countByGapSize[thisGap] =
														(experimentValues.countByGapSize[thisGap] ?? 0) + 1;
													experimentValues.mostRecentTrueIndex = i;
												}
												experimentValues.samples = experimentValues.samples
													.slice(1)
													.concat(didEventHappen);
												/* eslint-enable no-param-reassign */
											},
											initialize: () => ({
												countByGapSize: {},
												mostRecentTrueIndex: 0,
												samples: Array.from({ length: 100 }, () => false),
											}),
											update: (experimentValues) => {
												setCountByGapSizeState(experimentValues.countByGapSize);
												setSamplesState(experimentValues.samples);
											},
										});
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
						<Box>
							<canvas className="max-h-10" ref={samplesChartRef} />
							<Typography variant="body2">
								Each{" "}
								<span className="bg-blue-200">
									blue <i>blip</i>
								</span>{" "}
								represents <i>the event happened</i>. Notice:
							</Typography>
							<ul className="text-sm list-disc list-inside">
								<li>
									Even with <i>low probability</i> events, the events still
									often appear in <i>clusters</i>.
								</li>
								<li>
									Even with <i>high probability</i> events, the events sometimes
									appear <i>far away from each other</i>.
								</li>
							</ul>
							<canvas className="max-h-96" ref={barChartRef} />
							<Typography variant="body2">
								Each <span className="bg-blue-200">bar</span> represents{" "}
								<i>
									how many times did events happen{" "}
									<b>this close to each other</b>?
								</i>{" "}
								Notice how (over time) it is obvious that events are most likely
								to appear close to each other.
							</Typography>
							<Typography variant="body2">
								The <span className="bg-red-200">red line</span> represents the
								expected number of times consecutive events will happen this
								close together. Notice that (over time) the observed values will
								approach the expected number.
							</Typography>
						</Box>
					</div>
				</Segment>
			</div>
		</>
	);
};

export default Poisson;
