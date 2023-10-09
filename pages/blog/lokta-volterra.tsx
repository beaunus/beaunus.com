import { ArrowRightAlt } from "@mui/icons-material";
import {
	Container,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import ChartJS, { Point } from "chart.js/auto";
import _ from "lodash";
import { KDTree } from "mnemonist";
import type { NextPage } from "next";
import Head from "next/head";
import * as React from "react";

import {
	ExperimentComponent,
	ExperimentDefinition,
} from "../../components/ExperimentComponent";
import { Segment } from "../../components/Segment";
import { SliderWithLabels } from "../../components/SliderWithLabels";
import { polarToCartesian } from "../../utils";

type Animal = {
	id: string;
	lifespan: number;
	numTrialsSinceLastReproduction: number;
	numTrialsSurvivedSoFar: number;
	point: Point;
};

function takeAStep({
	boundaries,
	distance,
	fromPoint,
	shouldWrap,
}: {
	boundaries: { max: Point; min: Point };
	distance: number;
	fromPoint: Point;
	shouldWrap?: boolean;
}) {
	const diffCartesian = polarToCartesian({
		radius: distance,
		theta: Math.random() * 2 * Math.PI,
	});

	return shouldWrap
		? {
				x:
					fromPoint.x + diffCartesian.x > boundaries.max.x
						? fromPoint.x + diffCartesian.x - boundaries.max.x
						: fromPoint.x + diffCartesian.x < boundaries.min.x
						? fromPoint.x + diffCartesian.x + boundaries.max.x
						: fromPoint.x + diffCartesian.x,
				y:
					fromPoint.y + diffCartesian.y > boundaries.max.y
						? fromPoint.y + diffCartesian.y - boundaries.max.y
						: fromPoint.y + diffCartesian.y < boundaries.min.y
						? fromPoint.y + diffCartesian.y + boundaries.max.y
						: fromPoint.y + diffCartesian.y,
		  }
		: {
				x: Math.max(
					Math.min(fromPoint.x + diffCartesian.x, boundaries.max.x),
					boundaries.min.x
				),
				y: Math.max(
					Math.min(fromPoint.y + diffCartesian.y, boundaries.max.y),
					boundaries.min.y
				),
		  };
}

const willFoxSurvive = (fox: Animal) =>
	fox.numTrialsSurvivedSoFar < fox.lifespan;

const LoktaVolterra: NextPage = () => {
	const scatterChartRef = React.useRef<HTMLCanvasElement>(null);
	const lineChartRef = React.useRef<HTMLCanvasElement>(null);

	const [foxes, setFoxes] = React.useState<Animal[]>([]);
	const [numFoxesAfterEachTrial, setNumFoxesAfterEachTrial] = React.useState<
		{ thatCanMate: number; total: number }[]
	>([]);

	const [maxLifespan, setMaxLifespan] = React.useState(1000);
	const [minMatingAge, setMinMatingAge] = React.useState(100);
	const [matingRecoveryDuration, setMatingRecoveryDuration] =
		React.useState(90);
	const [initialNumFoxes, setInitialNumFoxes] = React.useState(10);

	const [maxMatingDistance, setMaxMatingDistance] = React.useState(0.017);
	const [stepSize, setStepSize] = React.useState(0.05);

	const canReproduce = (animal: Animal) =>
		animal.numTrialsSurvivedSoFar > minMatingAge &&
		animal.numTrialsSinceLastReproduction >= matingRecoveryDuration;

	const canPairMate = (animalA: Animal, animalB: Animal) =>
		Math.hypot(
			animalA.point.x - animalB.point.x,
			animalA.point.y - animalB.point.y
		) < maxMatingDistance;

	const anAnimal = (
		point: Point = { x: Math.random(), y: Math.random() }
	): Animal => ({
		id: _.uniqueId(),
		lifespan: Math.floor(maxLifespan * (0.5 + Math.random() * 0.5)),
		numTrialsSinceLastReproduction: 0,
		numTrialsSurvivedSoFar: 100,
		point,
	});

	const COLORS = { fox: "red" };

	React.useEffect(() => {
		if (scatterChartRef.current && lineChartRef.current) {
			const scatterChart = new ChartJS(scatterChartRef.current, {
				data: {
					datasets: [
						{
							backgroundColor: ({ dataIndex }) =>
								foxes[dataIndex] && canReproduce(foxes[dataIndex])
									? COLORS.fox
									: "transparent",
							borderColor: ({ dataIndex }) =>
								foxes[dataIndex] && canReproduce(foxes[dataIndex])
									? "transparent"
									: COLORS.fox,
							borderWidth: 2,
							data: foxes.map(({ point }) => point),
							pointRadius: ({ dataIndex }) =>
								foxes[dataIndex]
									? (foxes[dataIndex].lifespan -
											foxes[dataIndex].numTrialsSurvivedSoFar) /
									  (foxes[dataIndex].lifespan / 10)
									: 0,
						},
						{
							backgroundColor: "rgba(0,0,0,0)",
							borderColor: "rgba(0,0,0,0)",
							data: [
								{ x: 0, y: 0 },
								{ x: 1, y: 1 },
							],
						},
					],
				},
				options: {
					animation: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								footer: ([tooltipItem]) => {
									const fox = foxes[tooltipItem.dataIndex];
									return [
										`index: ${tooltipItem.dataIndex}`,
										`id: ${fox.id}`,
										`lifespan: ${fox.lifespan}`,
										`numTrialsSinceLastReproduction: ${fox.numTrialsSinceLastReproduction}`,
										`numTrialsSurvivedSoFar: ${fox.numTrialsSurvivedSoFar}`,
									].join("\n");
								},
							},
						},
					},
					scales: { x: { display: false }, y: { display: false } },
				},
				type: "scatter",
			});

			const lineChart = new ChartJS(lineChartRef.current, {
				data: {
					datasets: [
						{
							backgroundColor: "none",
							borderColor: "green",
							borderWidth: 2,
							data: numFoxesAfterEachTrial.map(({ total }) => total),
							pointRadius: 0,
						},
					],
					labels: numFoxesAfterEachTrial,
				},
				options: {
					animation: { duration: 0 },
					plugins: { legend: { display: false } },
					scales: { x: { display: false }, y: { display: true } },
				},
				type: "line",
			});
			return () => {
				lineChart.destroy();
				scatterChart.destroy();
			};
		}
	}, [foxes]);

	const numFoxesAfterEachTrialInternal: {
		thatCanMate: number;
		total: number;
	}[] = [];

	const loktaExperimentDefinition: ExperimentDefinition<{
		foxes: Array<Animal>;
	}> = {
		execute: (values) => {
			const fertileFoxes = values.foxes
				.map((fox, index) => ({ fox, originalIndex: index }))
				.filter(({ fox }) => canReproduce(fox));

			numFoxesAfterEachTrialInternal.push({
				thatCanMate: fertileFoxes.length,
				total: values.foxes.length,
			});

			const fertileFoxTree = KDTree.from(
				fertileFoxes.map(({ fox, originalIndex }) => [
					{ fox, originalIndex },
					Object.values(fox.point),
				]),
				2
			);

			const closestFertileNeighborOrigIndexByOrigIndex: Record<number, number> =
				fertileFoxes.length > 1
					? Object.fromEntries(
							fertileFoxes.map(({ fox, originalIndex }) => [
								originalIndex,
								fertileFoxTree.kNearestNeighbors(2, Object.values(fox.point))[1]
									?.originalIndex,
							])
					  )
					: {};

			const foxPairsWhoShouldMate = Object.entries(
				closestFertileNeighborOrigIndexByOrigIndex
			)
				.map(([a, b]) => [Number(a), b])
				.filter(
					([indexA, indexB]) =>
						indexA < indexB &&
						closestFertileNeighborOrigIndexByOrigIndex[`${indexB}`] ===
							indexA &&
						canPairMate(values.foxes[indexA], values.foxes[indexB])
				);

			const foxesWhoMatedIndexes = foxPairsWhoShouldMate.flatMap((x) => x);

			return {
				foxes: values.foxes
					.filter(willFoxSurvive)
					.map((fox, index) => ({
						...fox,
						numTrialsSinceLastReproduction: foxesWhoMatedIndexes.includes(index)
							? 0
							: fox.numTrialsSinceLastReproduction + 1,
						numTrialsSurvivedSoFar: fox.numTrialsSurvivedSoFar + 1,
						point: takeAStep({
							boundaries: { max: { x: 1, y: 1 }, min: { x: 0, y: 0 } },
							distance: Math.random() * stepSize,
							fromPoint: fox.point,
							shouldWrap: true,
						}),
					}))
					.concat(
						foxPairsWhoShouldMate.map(([originalIndexA, originalIndexB]) => {
							const foxA = values.foxes[originalIndexA];
							const foxB = values.foxes[originalIndexB];
							return anAnimal({
								x: (foxA.point.x + foxB.point.x) / 2,
								y: (foxA.point.y + foxB.point.y) / 2,
							});
						})
					),
			};
		},
		initialValues: { foxes: Array.from({ length: initialNumFoxes }, anAnimal) },
		update: (values) => {
			setFoxes(values.foxes);
			setNumFoxesAfterEachTrial(numFoxesAfterEachTrialInternal);
		},
	};

	return (
		<>
			<Head>
				<title>Lotka-Volterra predator-prey model | Beaunus</title>
			</Head>
			<div className="flex flex-col grow gap-2">
				<Segment>
					<div className="flex flex-col gap-5 w-full">
						<div className="text-2xl font-semibold text-center text-cyan-700">
							Lotka-Volterra predator-prey model
						</div>
					</div>
					<Grid container spacing={2} width="100%">
						<Grid item xs={3}>
							<TextField
								InputLabelProps={{ shrink: true }}
								label="MAX Lifespan"
								onChange={({ currentTarget }) =>
									setMaxLifespan(Number(currentTarget.value))
								}
								type="number"
								value={maxLifespan}
							/>
						</Grid>
						<Grid item xs={3}>
							<TextField
								InputLabelProps={{ shrink: true }}
								label="MIN Mating Age"
								onChange={({ currentTarget }) =>
									setMinMatingAge(Number(currentTarget.value))
								}
								type="number"
								value={minMatingAge}
							/>
						</Grid>
						<Grid item xs={3}>
							<TextField
								InputLabelProps={{ shrink: true }}
								label="Mating Recovery Duration"
								onChange={({ currentTarget }) =>
									setMatingRecoveryDuration(Number(currentTarget.value))
								}
								type="number"
								value={matingRecoveryDuration}
							/>
						</Grid>
						<Grid item xs={3}>
							<TextField
								InputLabelProps={{ shrink: true }}
								label="Initial Number of Foxes"
								onChange={({ currentTarget }) =>
									setInitialNumFoxes(Number(currentTarget.value))
								}
								type="number"
								value={initialNumFoxes}
							/>
						</Grid>
					</Grid>
					<SliderWithLabels
						displayValue={maxMatingDistance.toLocaleString()}
						label="MAX Mating Distance"
						max={1}
						min={0}
						onChange={(_event, newValue) =>
							setMaxMatingDistance(newValue as number)
						}
						step={0.001}
						value={maxMatingDistance}
					/>
					<SliderWithLabels
						displayValue={stepSize.toLocaleString()}
						label="Step Size"
						max={1}
						min={0}
						onChange={(_event, newValue) => setStepSize(newValue as number)}
						step={0.001}
						value={stepSize}
					/>
					<ExperimentComponent
						experimentDefinition={loktaExperimentDefinition}
						initialControlValues={{ numTrialsExponent: 4 }}
					/>
					<Container>
						<Typography>
							This experiment simulates the Lotka-Volterra predator-prey model.
						</Typography>
						<Table size="small">
							<TableBody>
								<TableRow>
									<TableCell component="th" scope="row">
										<Typography>Foxes</Typography>
									</TableCell>
									<TableCell>
										<Table className="w-min" size="small">
											<TableBody>
												<TableRow>
													<TableCell align="right">
														<Typography>Infertile</Typography>
													</TableCell>
													<TableCell>
														<div className="w-4 h-4 rounded-full border-2 border-red-600" />
													</TableCell>
													<TableCell>
														<ArrowRightAlt />
													</TableCell>
													<TableCell>
														<div className="w-4 h-4 bg-red-600 rounded-full border-red-600" />
													</TableCell>
													<TableCell>
														<Typography>Fertile</Typography>
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell align="right">
														<Typography noWrap>
															Near beginning of life
														</Typography>
													</TableCell>
													<TableCell>
														<div className="w-4 h-4 bg-red-600 rounded-full border-red-600" />
													</TableCell>
													<TableCell>
														<ArrowRightAlt />
													</TableCell>
													<TableCell>
														<div className="w-1 h-1 bg-red-600 rounded-full border-red-600" />
													</TableCell>
													<TableCell>
														<Typography noWrap>Near end of life</Typography>
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</Container>
					<canvas
						className="m-8 max-w-full max-h-[50vh] border-2"
						ref={scatterChartRef}
					/>
					<canvas
						className="m-8 max-w-full max-h-[50vh] border-2"
						ref={lineChartRef}
					/>
				</Segment>
			</div>
		</>
	);
};

export default LoktaVolterra;
