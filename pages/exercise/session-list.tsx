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
			// @ts-expect-error Property 'select' does not exist on type '{ type: "number"; number: number | null; id: string; }'.ts(2339)
			.flatMap((property) => property["Session Name"].select)
			.filter(Boolean)
			.map((sessionOption) => [sessionOption.id, sessionOption.name])
	);

	const exercisesBySessionId = Object.fromEntries(
		Object.keys(sessionById).map((sessionId) => {
			const resultsForThisSession = queryDatabaseResponse.results.filter(
				(response) =>
					(response as PageObjectResponse).properties[
						"Session Name"
						// @ts-expect-error Property 'select' does not exist on type '{ type: "number"; number: number | null; id: string; }'.ts(2339)
					]?.select?.id === sessionId
			);
			return [
				sessionId,
				_.sortBy(
					resultsForThisSession.map<
						Pick<Exercise, "link" | "musclesTargeted" | "name" | "type">
						// @ts-expect-error Property 'properties' does not exist on type 'PageObjectResponse | PartialPageObjectResponse | PartialDatabaseObjectResponse | DatabaseObjectResponse'.ts(2339)
					>(({ properties }) => ({
						equipmentTypes: properties["Equipment Types"].multi_select.map(
							({ name }: { name: string }) => name
						),
						isSuperset: properties.isSuperset.checkbox,
						link: properties.Link.url,
						musclesTargeted: properties["Muscle Targeted"].multi_select.map(
							({ name }: { name: string }) => name
						),
						name: properties.Name.title[0].text.content,
						order: properties.Order.number,
						type: properties.Type.select?.name ?? "",
					})),
					"order",
					"name"
				),
			];
		})
	);

	return { props: { exercisesBySessionId, sessionById } };
};

export default function SessionList(props: {
	exercisesBySessionId: Record<string, (Exercise & { order: number })[]>;
	sessionById: Record<string, string>;
}) {
	const [selectedSessionId, setSelectedSessionId] = React.useState(
		Object.keys(props.sessionById)[0]
	);

	const sortedExercisesByOrderNumber = _.groupBy(
		_.sortBy(
			props.exercisesBySessionId[selectedSessionId],
			"order",
			"isSuperset"
		),
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
						(exercises, index) => {
							const doesContainSupersetExercises = exercises.find(
								(exercise) => exercise.isSuperset
							);
							return (
								<Stack
									alignItems="center"
									gap={1}
									key={`exercises-${index}`}
									{...(doesContainSupersetExercises ? { padding: 1 } : {})}
								>
									{doesContainSupersetExercises ? (
										<Typography variant="h6">SUPERSET</Typography>
									) : null}
									<Stack direction="row" gap={1}>
										{Object.entries(_.groupBy(exercises, "isSuperset")).map(
											([isSuperset, exercisesForThisSubset]) => (
												<Stack
													border={1}
													borderColor="#333"
													direction="row"
													gap={1}
													key={`exercises-${index}-${isSuperset}`}
													padding={1}
												>
													{exercisesForThisSubset.map((exercise) => (
														<Stack
															alignItems="center"
															border={2}
															borderColor="ButtonShadow"
															gap={0}
															justifyContent="space-between"
															key={exercise.name}
															padding={1}
														>
															<Stack alignItems="center">
																<Stack
																	alignItems="center"
																	direction="row"
																	gap={1}
																>
																	<Typography
																		className="capitalize"
																		textAlign="center"
																	>
																		<Link href={exercise.link}>
																			{exercise.name}
																		</Link>
																	</Typography>
																</Stack>
																<Typography variant="subtitle2">
																	{exercise.musclesTargeted.join(" + ")}
																</Typography>
																<Typography variant="caption">
																	{exercise.equipmentTypes.join(" + ") ||
																		"No Equipment"}
																</Typography>
															</Stack>
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
							);
						}
					)}
				</Stack>
			</Stack>
		</ThemeProvider>
	);
}
