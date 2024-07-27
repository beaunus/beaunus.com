import FitnessCenterOutlinedIcon from "@mui/icons-material/FitnessCenterOutlined";
import SelfImprovementOutlinedIcon from "@mui/icons-material/SelfImprovementOutlined";
import { createTheme, Stack, ThemeProvider, Typography } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import _ from "lodash";
import Link from "next/link";
import * as React from "react";

import { Exercise } from "../../utils/exercise/exercise.types";
import { notionClient } from "../../utils/notion";

export const getServerSideProps = async () => {
	const queryDatabaseResponse = await notionClient.databases.query({
		/* eslint-disable @typescript-eslint/naming-convention */
		database_id: "3207db00a51e49358964b0f8ca32605f",
	});

	const sessionById = Object.fromEntries(
		queryDatabaseResponse.results
			.map((response) => (response as PageObjectResponse).properties)
			// @ts-expect-error Property 'multi_select' does not exist on type '{ type: "number"; number: number | null; id: string; }'.ts(2339)
			.flatMap((property) => property["Session Name"].multi_select)
			.map((sessionOption) => [sessionOption.id, sessionOption.name])
	);

	const exercisesBySessionId = Object.fromEntries(
		Object.keys(sessionById).map((sessionId) => [
			sessionId,
			_.sortBy(
				queryDatabaseResponse.results
					.filter((response) =>
						(response as PageObjectResponse).properties[
							"Session Name"
							// @ts-expect-error Property 'multi_select' does not exist on type '{ type: "number"; number: number | null; id: string; }'.ts(2339)
						].multi_select.find(({ id }: { id: string }) => id === sessionId)
					)
					.map<Pick<Exercise, "link" | "musclesTargeted" | "name" | "type">>(
						(pageObjectResponse) => ({
							// @ts-expect-error Property 'properties' does not exist on type 'PartialPageObjectResponse'.ts(2339)
							link: pageObjectResponse.properties.Link.url,
							// @ts-expect-error Property 'properties' does not exist on type 'PartialPageObjectResponse'.ts(2339)
							musclesTargeted: pageObjectResponse.properties[
								"Muscle Targeted"
								// @ts-expect-error Binding element 'name' implicitly has an 'any' type.ts(7031)
							].multi_select.map(({ name }) => name),
							// @ts-expect-error Property 'properties' does not exist on type 'PartialPageObjectResponse'.ts(2339)
							name: pageObjectResponse.properties.Name.title[0].text.content,
							// @ts-expect-error Property 'properties' does not exist on type 'PartialPageObjectResponse'.ts(2339)
							order: pageObjectResponse.properties.Order.number,
							// @ts-expect-error Property 'properties' does not exist on type 'PartialPageObjectResponse'.ts(2339)
							type: pageObjectResponse.properties.Type.select.name,
						})
					),
				"order",
				"name"
			),
		])
	);

	return { props: { exercisesBySessionId, sessionById } };
};

export default function SessionList(props: {
	exercisesBySessionId: Record<
		string,
		(Pick<Exercise, "name" | "link" | "musclesTargeted" | "type"> & {
			order: number;
		})[]
	>;
	sessionById: Record<string, string>;
}) {
	const [selectedSessionId, setSelectedSessionId] = React.useState(
		Object.keys(props.sessionById)[0]
	);

	const sortedExercisesByOrderNumber = _.groupBy(
		_.sortBy(props.exercisesBySessionId[selectedSessionId], "order"),
		"order"
	);

	return (
		<ThemeProvider theme={createTheme({ typography: { fontSize: 10 } })}>
			<Stack alignItems="center" gap={2} padding={2}>
				<FormControl>
					<InputLabel id="demo-simple-select-label">Session</InputLabel>
					<Select
						id="select-session"
						label="Session"
						labelId="select-session-label"
						onChange={(event) => setSelectedSessionId(event.target.value)}
						size="small"
						value={selectedSessionId}
					>
						{_.sortBy(
							Object.entries(props.sessionById),
							([, sessionName]) => sessionName
						).map(([sessionId, sessionName]) => (
							<MenuItem key={sessionId} value={sessionId}>
								{sessionName}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Stack alignItems="center" gap={1}>
					{Object.values(sortedExercisesByOrderNumber).map(
						(exercises, index) => (
							<Stack direction="row" gap={1} key={`exercises-${index}`}>
								{exercises.map((exercise) => (
									<Stack
										alignItems="center"
										border={2}
										borderColor="ButtonShadow"
										gap={0}
										key={exercise.name}
										padding={1}
									>
										<Stack alignItems="center" direction="row" gap={1}>
											{exercise.type ? (
												<ExerciseIcon type={exercise.type} />
											) : null}
											<Typography>
												<Link href={exercise.link}>{exercise.name}</Link>
											</Typography>
										</Stack>
										<Typography variant="caption">
											{exercise.musclesTargeted}
										</Typography>
										<table className="mt-1">
											<tbody>
												{Array.from({ length: 2 }).map(
													(_rowValue, rowIndex) => (
														<tr key={`${exercise.name}-${rowIndex}`}>
															{Array.from({ length: 8 }).map(
																(_colValue, colIndex) => (
																	<td
																		className="w-6 h-5 border-2"
																		key={`${exercise.name}-${rowIndex}-${colIndex}`}
																	/>
																)
															)}
														</tr>
													)
												)}
											</tbody>
										</table>
									</Stack>
								))}
							</Stack>
						)
					)}
				</Stack>
			</Stack>
		</ThemeProvider>
	);
}

const ExerciseIcon: React.FC<{ type: string }> = ({ type }) =>
	type === "Resistance" ? (
		<FitnessCenterOutlinedIcon fontSize="small" />
	) : type.includes("Stretch") ? (
		<SelfImprovementOutlinedIcon fontSize="small" />
	) : null;
