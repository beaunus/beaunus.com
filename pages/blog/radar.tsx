import { Clear, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import { Stack } from "@mui/system";
import ChartJS, { Color } from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect, useState } from "react";
import { sampleStandardDeviation } from "simple-statistics";

import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { geometricMean } from "../../utils/mean";

type Dimension = [string, { value: number; weight: number }];
const DEFAULT_DIMENSIONS: Dimension[] = [
	"Code Review",
	"Facilitation",
	"Feedback",
	"Knowledge Sharing",
	"Relationship Building",
	"Teamwork",
	"Reliability / Prioritization",
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
].map((name) => [name, { value: 4, weight: 1 }]);

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
		<Grid item xs={4} />
		<Grid item xs={8}>
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
	const [dimensions, setDimensions] = useState<Dimension[]>([]);
	const [pendingDimensionName, setPendingDimensionName] = useState<string>("");

	const barChartRef = React.useRef<HTMLCanvasElement>(null);
	const radarChartRef = React.useRef<HTMLCanvasElement>(null);

	const router = useRouter();

	useEffect(() => {
		router.push(
			{
				query: Object.fromEntries(
					dimensions.map(([name, { value, weight }]) => [
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
		const dimensionsFromUrl = Array.from(
			new URLSearchParams(window.location.search).entries()
		).map(([name, weightAndValueString]) => {
			const [weight, value] = (weightAndValueString as string)
				.split(",")
				.map(Number);
			return [name, { value, weight }] as Dimension;
		});
		setDimensions(
			Object.keys(dimensionsFromUrl).length
				? dimensionsFromUrl
				: DEFAULT_DIMENSIONS
		);
	}, []);

	useEffect(
		function createChart() {
			const valuesAccordingToWeights = dimensions.flatMap(
				([, { value, weight }]) => Array.from({ length: weight }, () => value)
			);

			const mean = geometricMean(valuesAccordingToWeights) ?? 0;
			const theStandardDeviation =
				valuesAccordingToWeights.length > 1
					? sampleStandardDeviation(valuesAccordingToWeights)
					: 0;
			const overlayRange = [
				mean - Math.max(0.5, theStandardDeviation),
				mean + Math.max(0.5, theStandardDeviation),
			];

			if (radarChartRef.current && barChartRef.current) {
				const tension =
					(4 / 3) * Math.tan(Math.PI / (2 * Object.keys(dimensions).length));
				const radarChart = new ChartJS(radarChartRef.current, {
					data: {
						datasets: [
							{
								backgroundColor: dimensionColor,
								borderColor: dimensionColor,
								data: dimensions.map(([, { value }]) => value),
								fill: false,
								pointBorderWidth: ({ dataIndex }) =>
									2 * dimensions[dataIndex][1].weight,
								tension,
							},
							{
								borderWidth: 0,
								data: Array(Object.keys(dimensions).length).fill(
									overlayRange[0]
								),
								fill: false,
								pointRadius: 0,
								tension,
							},
							{
								backgroundColor: overlayColor,
								borderWidth: 0,
								data: Array(Object.keys(dimensions).length).fill(
									overlayRange[1]
								),
								fill: "-1",
								pointRadius: 0,
								tension,
							},
							{
								backgroundColor: STANDARD_LEVELS.junior.color,
								borderWidth: 0,
								data: Array(Object.keys(dimensions).length).fill(
									STANDARD_LEVELS.junior.value + 1
								),
								pointRadius: 0,
								tension,
							},
							{
								backgroundColor: STANDARD_LEVELS.mid.color,
								borderWidth: 0,
								data: Array(Object.keys(dimensions).length).fill(
									STANDARD_LEVELS.mid.value + 1
								),
								pointRadius: 0,
								tension,
							},
							{
								backgroundColor: STANDARD_LEVELS.senior.color,
								borderWidth: 0,
								data: Array(Object.keys(dimensions).length).fill(
									STANDARD_LEVELS.senior.value + 1
								),
								pointRadius: 0,
								tension,
							},
						],
						labels: dimensions.map(([name]) => name),
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
								data: dimensions.map(([, { value }]) => value),
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
						labels: dimensions.map(([name]) => name),
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
						{dimensions.map(
							([dimensionName, { value, weight }], dimensionIndex) => (
								<Grid
									alignItems="center"
									container
									key={`${dimensionName}-slider`}
									spacing={1}
								>
									<Grid item xs={2}>
										<Stack
											alignItems="center"
											direction="row"
											justifyContent="space-between"
										>
											<IconButton
												aria-label="delete-dimension"
												color="primary"
												component="label"
												onClick={() =>
													setDimensions((old) =>
														old.filter(([name]) => name !== dimensionName)
													)
												}
												size="small"
											>
												<Clear />
											</IconButton>
											<Stack direction="column">
												<IconButton
													aria-label="move-up-dimension"
													color="primary"
													component="label"
													disabled={dimensionIndex < 1}
													onClick={() =>
														setDimensions((old) =>
															old
																.slice(0, dimensionIndex - 1)
																.concat([old[dimensionIndex]])
																.concat([old[dimensionIndex - 1]])
																.concat(old.slice(dimensionIndex + 1))
														)
													}
													size="small"
												>
													<KeyboardArrowUp />
												</IconButton>
												<IconButton
													aria-label="move-down-dimension"
													color="primary"
													component="label"
													disabled={dimensionIndex >= dimensions.length - 1}
													onClick={() =>
														setDimensions((old) =>
															old
																.slice(0, dimensionIndex)
																.concat([old[dimensionIndex + 1]])
																.concat([old[dimensionIndex]])
																.concat(old.slice(dimensionIndex + 2))
														)
													}
													size="small"
												>
													<KeyboardArrowDown />
												</IconButton>
											</Stack>
										</Stack>
									</Grid>
									<Grid item xs={2}>
										<TextField
											id="outlined-number"
											label="weight"
											onChange={({ target }) => {
												setDimensions((old) =>
													old
														.slice(0, dimensionIndex)
														.concat([
															[
																dimensionName,
																{
																	...old[dimensionIndex][1],
																	weight: Math.max(Number(target.value), 0),
																},
															],
														])
														.concat(old.slice(dimensionIndex + 1))
												);
											}}
											size="small"
											type="number"
											value={weight}
										/>
									</Grid>
									<Grid item xs={8}>
										<SliderWithLabels
											label={dimensionName}
											max={7}
											min={1}
											onChange={(_event, newValue) =>
												setDimensions((old) =>
													old
														.slice(0, dimensionIndex)
														.concat([
															[
																dimensionName,
																{
																	...old[dimensionIndex][1],
																	value: newValue as number,
																},
															],
														])
														.concat(old.slice(dimensionIndex + 1))
												)
											}
											size="small"
											step={1}
											value={value}
										/>
									</Grid>
								</Grid>
							)
						)}
						<Typography>
							The shaded area shows{" "}
							<code>
								the{" "}
								<HighlightedLink href="https://en.wikipedia.org/wiki/Geometric_mean">
									geometric mean
								</HighlightedLink>{" "}
								+/- one{" "}
								<HighlightedLink href="https://en.wikipedia.org/wiki/Standard_deviation">
									standard deviation
								</HighlightedLink>
							</code>
							.
						</Typography>
						<canvas className="max-h-screen" ref={barChartRef} />
						<canvas className="max-h-screen" ref={radarChartRef} />
					</div>
				</Segment>
			</div>
		</>
	);
};

export default Radar;
