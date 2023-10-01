import ChartJS, { Point } from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import {
	ExperimentComponent,
	ExperimentDefinition,
} from "../../components/ExperimentComponent";
import { Segment } from "../../components/Segment";
import { polarToCartesian } from "../../utils";

type Fox = { lifespan: number; numTrialsSurvivedSoFar: number; point: Point };

const MAXIMUM_LIFESPAN = 1000;

const LoktaVolterra: NextPage = () => {
	const scatterChartRef = React.useRef<HTMLCanvasElement>(null);

	const [foxes, setFoxes] = React.useState<Fox[]>([]);

	React.useEffect(() => {
		if (scatterChartRef.current) {
			const scatterChart = new ChartJS(scatterChartRef.current, {
				data: {
					datasets: [
						{
							backgroundColor: "#00f",
							borderColor: "#f00",
							data: foxes.map(({ point }) => point),
							pointRadius: ({ dataIndex }) =>
								(MAXIMUM_LIFESPAN -
									(foxes[dataIndex]?.numTrialsSurvivedSoFar ?? 0)) /
								100,
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
										`lifespan: ${fox.lifespan}`,
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

			return () => {
				scatterChart.destroy();
			};
		}
	}, [foxes]);

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

	const willFoxSurvive = (fox: Fox) =>
		fox.numTrialsSurvivedSoFar < fox.lifespan;

	const loktaExperimentDefinition: ExperimentDefinition<{
		foxes: Array<Fox>;
	}> = {
		execute: (values) => {
			return {
				foxes: values.foxes.filter(willFoxSurvive).map((fox) => ({
					...fox,
					numTrialsSurvivedSoFar: fox.numTrialsSurvivedSoFar + 1,
					point: takeAStep(fox.point, 0.05, {
						max: { x: 1, y: 1 },
						min: { x: 0, y: 0 },
					}),
				})),
			};
		},
		initialValues: {
			foxes: Array.from({ length: 10 }, () => ({
				lifespan: Math.floor(MAXIMUM_LIFESPAN * (0.5 + Math.random() * 0.5)),
				numTrialsSurvivedSoFar: 100,
				point: { x: Math.random(), y: Math.random() },
			})),
		},
		update: (values) => {
			setFoxes(values.foxes);
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
				</Segment>
			</div>
		</>
	);
};

export default LoktaVolterra;
