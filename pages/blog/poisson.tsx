import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChartJS from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import {
	ExperimentComponent,
	ExperimentDefinition,
} from "../../components/ExperimentComponent";
import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";

const Poisson: NextPage = () => {
	const samplesChartRef = React.useRef<HTMLCanvasElement>(null);
	const barChartRef = React.useRef<HTMLCanvasElement>(null);

	const [countByGapSizeState, setCountByGapSizeState] = React.useState<
		Record<number, number>
	>({});
	const [probabilityOfEvent, setProbabilityOfEvent] = React.useState(0.5);
	const [samplesState, setSamplesState] = React.useState<boolean[]>([]);
	const [numCompleteTrials, setNumCompleteTrials] = React.useState(0);

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
	}, [
		countByGapSizeState,
		numCompleteTrials,
		probabilityOfEvent,
		samplesState,
	]);

	const poissonExperimentDefinition: ExperimentDefinition<{
		countByGapSize: Record<number, number>;
		mostRecentTrueIndex: number;
		samples: Array<boolean>;
	}> = {
		execute: (values, i) => {
			const didEventHappen = Math.random() < probabilityOfEvent;
			const thisGap = i - values.mostRecentTrueIndex - 1;
			return {
				...values,
				...(i > 0 && didEventHappen
					? {
							countByGapSize: {
								...values.countByGapSize,
								[thisGap]: (values.countByGapSize[thisGap] ?? 0) + 1,
							},
							mostRecentTrueIndex: i,
					  }
					: {}),
				samples: values.samples.slice(1).concat(didEventHappen),
			};
		},
		initialValues: {
			countByGapSize: {},
			mostRecentTrueIndex: 0,
			samples: Array.from({ length: 100 }, () => false),
		},
		update: (values, i) => {
			setCountByGapSizeState(values.countByGapSize);
			setNumCompleteTrials(i);
			setSamplesState(values.samples);
		},
	};

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
						<ExperimentComponent
							experimentDefinition={poissonExperimentDefinition}
						/>
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
