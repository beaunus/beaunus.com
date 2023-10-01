import ChartJS, { Point } from "chart.js/auto";
import _ from "lodash";
import { KDTree } from "mnemonist";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import {
	ExperimentComponent,
	ExperimentDefinition,
} from "../../components/ExperimentComponent";
import { Segment } from "../../components/Segment";
import { polarToCartesian } from "../../utils";

type Fox = {
	id: string;
	lifespan: number;
	numTrialsSinceLastReproduction: number;
	numTrialsSurvivedSoFar: number;
	point: Point;
};

const aFox = (point: Point = { x: Math.random(), y: Math.random() }): Fox => ({
	id: _.uniqueId("fox"),
	lifespan: Math.floor(MAX_LIFESPAN * (0.5 + Math.random() * 0.5)),
	numTrialsSinceLastReproduction: 0,
	numTrialsSurvivedSoFar: 100,
	point,
});

const MAX_LIFESPAN = 1000;
const MAX_MATING_DISTANCE = 0.017;
const MIN_MATING_AGE = 100;
const MATING_RECOVERY_DURATION = 90;
const INITIAL_NUM_FOXES = 10;
const STEP_SIZE = 0.05;

function takeAStep(
	fromPoint: Point,
	distance: number,
	boundaries: { max: Point; min: Point }
) {
	const diffCartesian = polarToCartesian({
		radius: distance,
		theta: Math.random() * 2 * Math.PI,
	});

	return {
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

const LoktaVolterra: NextPage = () => {
	const scatterChartRef = React.useRef<HTMLCanvasElement>(null);
	const lineChartRef = React.useRef<HTMLCanvasElement>(null);

	const [foxes, setFoxes] = React.useState<Fox[]>([]);
	const [numFoxesAfterEachTrial, setNumFoxesAfterEachTrial] = React.useState<
		{ thatCanMate: number; total: number }[]
	>([]);

	React.useEffect(() => {
		if (scatterChartRef.current && lineChartRef.current) {
			const scatterChart = new ChartJS(scatterChartRef.current, {
				data: {
					datasets: [
						{
							backgroundColor: ({ dataIndex }) =>
								foxes[dataIndex] && canFoxReproduce(foxes[dataIndex])
									? "#f00"
									: "#00f",
							borderColor: "#f00",
							data: foxes.map(({ point }) => point),
							pointRadius: ({ dataIndex }) =>
								(MAX_LIFESPAN -
									(foxes[dataIndex]?.numTrialsSurvivedSoFar ?? 0)) /
								(MAX_LIFESPAN / 10),
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
					animation: { duration: 0 },
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

	const willFoxSurvive = (fox: Fox) =>
		fox.numTrialsSurvivedSoFar < fox.lifespan;

	const canFoxReproduce = (fox: Fox) =>
		fox.numTrialsSurvivedSoFar > MIN_MATING_AGE &&
		fox.numTrialsSinceLastReproduction >= MATING_RECOVERY_DURATION;

	const numFoxesAfterEachTrialInternal: {
		thatCanMate: number;
		total: number;
	}[] = [];

	const loktaExperimentDefinition: ExperimentDefinition<{ foxes: Array<Fox> }> =
		{
			execute: (values) => {
				numFoxesAfterEachTrialInternal.push({
					thatCanMate: values.foxes.filter(canFoxReproduce).length,
					total: values.foxes.length,
				});

				const fertileFoxes = values.foxes
					.map((fox, index) => ({ fox, originalIndex: index }))
					.filter(({ fox }) => canFoxReproduce(fox));
				const fertileFoxTree = KDTree.from(
					fertileFoxes.map(({ fox, originalIndex }) => [
						{ fox, originalIndex },
						Object.values(fox.point),
					]),
					2
				);

				const closestFertileNeighborOrigIndexByOrigIndex: Record<
					number,
					number
				> =
					fertileFoxes.length > 1
						? Object.fromEntries(
								fertileFoxes.map(({ fox, originalIndex }) => [
									originalIndex,
									fertileFoxTree.kNearestNeighbors(
										2,
										Object.values(fox.point)
									)[1]?.originalIndex,
								])
						  )
						: {};

				const canPairMate = (foxA: Fox, foxB: Fox) =>
					Math.hypot(foxA.point.x - foxB.point.x, foxA.point.y - foxB.point.y) <
					MAX_MATING_DISTANCE;

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
							numTrialsSinceLastReproduction: foxesWhoMatedIndexes.includes(
								index
							)
								? 0
								: fox.numTrialsSinceLastReproduction + 1,
							numTrialsSurvivedSoFar: fox.numTrialsSurvivedSoFar + 1,
							point: takeAStep(fox.point, STEP_SIZE, {
								max: { x: 1, y: 1 },
								min: { x: 0, y: 0 },
							}),
						}))
						.concat(
							foxPairsWhoShouldMate.map(([originalIndexA, originalIndexB]) => {
								const foxA = values.foxes[originalIndexA];
								const foxB = values.foxes[originalIndexB];
								return aFox({
									x: (foxA.point.x + foxB.point.x) / 2,
									y: (foxA.point.y + foxB.point.y) / 2,
								});
							})
						),
				};
			},
			initialValues: { foxes: Array.from({ length: INITIAL_NUM_FOXES }, aFox) },
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
					<ExperimentComponent {...loktaExperimentDefinition} />
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
